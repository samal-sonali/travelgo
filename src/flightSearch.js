import { airlines, airports, cabins } from './data/flights.js';

// Simulated flight search: real routes are approximated from airline hubs and
// great-circle distances; schedules and fares are generated deterministically,
// so the same search always shows the same results.

const byCode = Object.fromEntries(airports.map((a) => [a.code, a]));
export const findAirport = (code) => byCode[code];

function distanceKm(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

function seeded(text) {
  let h = 1779033703 ^ text.length;
  for (const ch of text) { h = Math.imul(h ^ ch.charCodeAt(0), 3432918353); h = (h << 13) | (h >>> 19); }
  let s = h >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const legMinutes = (km) => Math.round((km / 820 * 60 + 35) / 5) * 5;
const styleFactor = { 'low-cost': 0.72, full: 1, premium: 1.22 };

function routeOptions(from, to) {
  const o = byCode[from];
  const d = byCode[to];
  const direct = distanceKm(o, d);
  const options = [];
  const viaHub = (airline, hub, maxDetour, ignoreRange) => {
    if (hub === from || hub === to) return;
    const h = byCode[hub];
    const d1 = distanceKm(o, h);
    const d2 = distanceKm(h, d);
    const inRange = ignoreRange || (d1 <= airline.maxLeg && d2 <= airline.maxLeg);
    if (inRange && (d1 + d2) / direct <= maxDetour) options.push({ airline, stops: [h], detour: (d1 + d2) / direct });
  };
  airlines.forEach((airline) => {
    if ((airline.hubs.includes(from) || airline.hubs.includes(to)) && direct <= airline.maxLeg) options.push({ airline, stops: [], detour: 1 });
    airline.hubs.forEach((hub) => viaHub(airline, hub, 1.7));
  });
  if (!options.length) {
    airlines.forEach((airline) => airline.hubs.forEach((hub) => viaHub(airline, hub, 2.2, true)));
    options.sort((a, b) => a.detour - b.detour).splice(4);
  }
  return options;
}

export function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function searchFlights({ from, to, date, passengers, cabin }) {
  if (!byCode[from] || !byCode[to] || from === to) return [];
  const o = byCode[from];
  const d = byCode[to];
  const cabinFactor = cabins.find(([key]) => key === cabin)[2];
  const day = new Date(`${date}T00:00`);
  const daysAhead = Math.round((day - new Date(`${todayISO()}T00:00`)) / 86400000);
  const demand = (daysAhead < 3 ? 1.5 : daysAhead < 14 ? 1.2 : daysAhead > 60 ? 0.95 : 1) * ([0, 5].includes(day.getDay()) ? 1.08 : 1);

  return routeOptions(from, to).flatMap((option, n) => {
    const rand = seeded(`${from}-${to}-${date}-${option.airline.code}-${n}`);
    const points = [o, ...option.stops, d];
    const count = option.stops.length ? 1 + Math.round(rand()) : 2;
    return Array.from({ length: count }, (_, k) => {
      const depart = Math.round(rand() * 287) * 5;
      let duration = 0;
      let km = 0;
      const layovers = [];
      points.slice(1).forEach((point, i) => {
        if (i > 0) { const wait = 70 + Math.round(rand() * 40) * 5; layovers.push({ airport: points[i], minutes: wait }); duration += wait; }
        const leg = distanceKm(points[i], point);
        km += leg;
        duration += legMinutes(leg);
      });
      const arriveAbs = depart + duration + (d.tz - o.tz) * 60;
      const price = Math.round((40 + km * 0.075) * styleFactor[option.airline.style] * (option.stops.length ? 1 : 1.12) * demand * cabinFactor * (0.88 + rand() * 0.26));
      const flightNos = points.slice(1).map(() => `${option.airline.code} ${100 + Math.floor(rand() * 900)}`);
      return {
        id: `${option.airline.code}-${n}-${k}`, airline: option.airline, flightNos, from: o, to: d,
        depart, arrive: ((arriveAbs % 1440) + 1440) % 1440, dayShift: Math.floor(arriveAbs / 1440),
        duration, stops: option.stops.length, layovers, price, total: price * passengers,
      };
    });
  });
}

export const formatClock = (minutes) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
export const formatDuration = (minutes) => `${Math.floor(minutes / 60)}h ${minutes % 60 ? `${minutes % 60}m` : ''}`.trim();
