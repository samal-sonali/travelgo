import { useSyncExternalStore } from 'react';
import { destinations, packages } from './data/travel.js';
import { guides } from './data/planner.js';
import { searchFlights, todayISO, findAirport } from './flightSearch.js';
import { forecastUrl } from './weather.js';

// A small client-side notification centre, saved in localStorage.
// Nothing leaves the browser; optional desktop alerts use the Notification API.

const KEYS = { items: 'travelgo-notifications', prefs: 'travelgo-notify-prefs', watches: 'travelgo-price-watches', lastCheck: 'travelgo-notify-checked' };
export const defaultPrefs = { price: true, flight: true, checkin: true, weather: true, deal: true, browser: false, weatherPlace: 'tokyo' };

const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
let state = { items: read(KEYS.items, null), prefs: { ...defaultPrefs, ...read(KEYS.prefs, {}) }, watches: read(KEYS.watches, []) };
const firstRun = state.items === null;
if (firstRun) state.items = [];
const listeners = new Set();

function commit(next) {
  state = { ...state, ...next };
  localStorage.setItem(KEYS.items, JSON.stringify(state.items));
  localStorage.setItem(KEYS.prefs, JSON.stringify(state.prefs));
  localStorage.setItem(KEYS.watches, JSON.stringify(state.watches));
  listeners.forEach((listener) => listener());
}

// Keep other open tabs in sync.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (!Object.values(KEYS).includes(e.key)) return;
    state = { items: read(KEYS.items, []), prefs: { ...defaultPrefs, ...read(KEYS.prefs, {}) }, watches: read(KEYS.watches, []) };
    listeners.forEach((listener) => listener());
  });
}

const subscribe = (listener) => { listeners.add(listener); return () => listeners.delete(listener); };
export const useNotifications = () => useSyncExternalStore(subscribe, () => state);

export function notify({ type, title, body, link, key, sample = false }) {
  if (!state.prefs[type]) return;
  if (key && state.items.some((n) => n.key === key)) return;
  const item = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, type, title, body, link, key, sample, time: Date.now(), read: false };
  commit({ items: [item, ...state.items].slice(0, 60) });
  if (state.prefs.browser && 'Notification' in window && Notification.permission === 'granted' && !sample) {
    new Notification(title, { body });
  }
}

export const markRead = (id) => commit({ items: state.items.map((n) => (n.id === id ? { ...n, read: true } : n)) });
export const markAllRead = () => commit({ items: state.items.map((n) => ({ ...n, read: true })) });
export const removeNotification = (id) => commit({ items: state.items.filter((n) => n.id !== id) });
export const clearNotifications = () => commit({ items: [] });
export const setPref = (key, value) => commit({ prefs: { ...state.prefs, [key]: value } });

export async function enableBrowserAlerts() {
  if (!('Notification' in window)) return 'unsupported';
  const permission = await Notification.requestPermission();
  setPref('browser', permission === 'granted');
  return permission;
}

// ---- Price watches -------------------------------------------------------

const shiftDate = (iso, days) => { const d = new Date(`${iso}T12:00`); d.setDate(d.getDate() + days); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const niceDate = (iso) => new Date(`${iso}T12:00`).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
const lowestFare = (search) => { const prices = searchFlights(search).map((f) => f.price); return prices.length ? Math.min(...prices) : null; };
const watchId = ({ from, to, date }) => `${from}-${to}-${date}`;

export function isWatching(search) { return state.watches.some((w) => w.id === watchId(search)); }

export function toggleWatch(search) {
  const id = watchId(search);
  if (state.watches.some((w) => w.id === id)) { commit({ watches: state.watches.filter((w) => w.id !== id) }); return false; }
  const price = lowestFare(search);
  commit({ watches: [...state.watches, { id, from: search.from, to: search.to, date: search.date, passengers: search.passengers, cabin: search.cabin, price }] });
  checkPriceWatches();
  return true;
}

export function removeWatch(id) { commit({ watches: state.watches.filter((w) => w.id !== id) }); }

// Looks for a cheaper day close to each watched date.
export function checkPriceWatches() {
  const today = todayISO();
  const live = state.watches.filter((w) => w.date >= today);
  if (live.length !== state.watches.length) commit({ watches: live });
  live.forEach((w) => {
    const options = [-3, -2, -1, 1, 2, 3].map((n) => shiftDate(w.date, n)).filter((d) => d >= today)
      .map((date) => ({ date, price: lowestFare({ ...w, date }) })).filter((o) => o.price);
    const best = options.sort((a, b) => a.price - b.price)[0];
    if (!best || !w.price || best.price > w.price * 0.95) return;
    const from = findAirport(w.from);
    const to = findAirport(w.to);
    notify({
      type: 'price', key: `price-${w.id}-${best.date}`, link: '/flights',
      title: `Price drop: ${from.city} → ${to.city}`,
      body: `Fly on ${niceDate(best.date)} from $${best.price} per person, $${w.price - best.price} less than ${niceDate(w.date)}.`,
    });
  });
}

// ---- Weather alerts ------------------------------------------------------

export async function checkWeather(slug = state.prefs.weatherPlace) {
  const guide = guides[slug];
  const place = destinations.find((d) => d.slug === slug);
  if (!guide || !place) return;
  try {
    const res = await fetch(forecastUrl(guide.lat, guide.lon, { daily: 'weather_code,temperature_2m_max,precipitation_probability_max,wind_speed_10m_max', forecast_days: 7 }));
    if (!res.ok) return;
    const { daily } = await res.json();
    const rules = [
      ['storm', (i) => daily.weather_code[i] >= 95, 'Thunderstorms expected', 'Plan indoor activities and check for flight delays.'],
      ['snow', (i) => [71, 73, 75, 77, 85, 86].includes(daily.weather_code[i]), 'Snow on the way', 'Pack warm layers and allow extra travel time.'],
      ['heat', (i) => daily.temperature_2m_max[i] >= 35, 'Extreme heat', `Highs around ${Math.round(Math.max(...daily.temperature_2m_max))}°C. Stay hydrated and avoid midday sun.`],
      ['rain', (i) => daily.precipitation_probability_max[i] >= 80, 'Heavy rain likely', 'Bring an umbrella and keep some indoor plans ready.'],
      ['wind', (i) => daily.wind_speed_10m_max[i] >= 50, 'Strong winds', 'Boat trips and cable cars may be cancelled.'],
    ];
    for (const [kind, test, headline, advice] of rules) {
      const day = daily.time.findIndex((_, i) => test(i));
      if (day < 0) continue;
      notify({ type: 'weather', key: `weather-${slug}-${daily.time[day]}-${kind}`, link: `/weather?place=${slug}`, title: `Weather alert: ${place.name}`, body: `${headline} on ${niceDate(daily.time[day])}. ${advice}` });
      return;
    }
  } catch { /* offline: try again next visit */ }
}

// ---- Holiday deals -------------------------------------------------------

function checkDeals() {
  const week = Math.floor((Date.now() / 86400000 + 4) / 7);
  const pkg = packages[week % packages.length];
  const discount = 10 + (week % 4) * 5;
  const was = Number(pkg.price.replace(/[^0-9]/g, ''));
  notify({ type: 'deal', key: `deal-${week}`, link: '/packages', title: `Holiday deal: ${discount}% off ${pkg.name}`, body: `${pkg.days} in ${pkg.place}, now from $${Math.round(was * (1 - discount / 100)).toLocaleString('en-US')} (was ${pkg.price}). This week only.` });
}

// ---- Start-up ------------------------------------------------------------

function seedExamples() {
  const search = { from: 'HYD', to: 'DPS', date: todayISO(14), passengers: 1, cabin: 'economy' };
  const base = lowestFare(search);
  const cheaper = [-3, -2, -1, 1, 2, 3].map((n) => ({ date: shiftDate(search.date, n) })).map((o) => ({ ...o, price: lowestFare({ ...search, date: o.date }) })).sort((a, b) => a.price - b.price)[0];
  if (base && cheaper.price < base) {
    notify({ type: 'price', sample: true, key: 'example-price', link: '/flights', title: 'Price drop: Hyderabad → Bali', body: `Fly on ${niceDate(cheaper.date)} from $${cheaper.price} per person, $${base - cheaper.price} less than ${niceDate(search.date)}. Track any route to get alerts like this.` });
  }
  const flight = searchFlights(search).sort((a, b) => a.price - b.price)[0];
  if (flight) {
    notify({ type: 'flight', sample: true, key: 'example-flight', link: '/flights', title: 'Flight reminder: Hyderabad → Bali', body: `${flight.airline.name} ${flight.flightNos[0]} departs ${niceDate(todayISO(14))}. Online check-in opens 24 hours before.` });
  }
  notify({ type: 'checkin', sample: true, key: 'example-checkin', link: '/hotels', title: 'Check-in reminder: Komaneka at Bisma', body: `Check in on ${niceDate(todayISO(14))} from 2:00 PM. Free cancellation until 48 hours before.` });
}

// Runs the background checks at most once an hour.
export function runNotificationChecks() {
  if (firstRun) seedExamples();
  const last = Number(localStorage.getItem(KEYS.lastCheck)) || 0;
  if (Date.now() - last < 60 * 60 * 1000) return;
  localStorage.setItem(KEYS.lastCheck, String(Date.now()));
  checkDeals();
  checkPriceWatches();
  checkWeather();
}
