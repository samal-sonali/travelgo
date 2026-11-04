import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, ArrowRight, ArrowUp, CalendarDays, CloudRain, Droplets, Loader2, MapPin, RefreshCw, Search, Sunrise, Sunset, Thermometer, Umbrella, Wind } from 'lucide-react';
import { destinations } from './data/travel.js';
import { guides } from './data/planner.js';
import { describeWeather, forecastUrl } from './weather.js';
import LottieLoader from './ui/LottieLoader.jsx';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const seasonLabels = ['Off-season', 'Good', 'Best'];
const compass = (deg) => ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(deg / 45) % 8];
const time = (iso) => new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
const fromDestination = (d) => ({ name: d.name, country: d.country, lat: guides[d.slug].lat, lon: guides[d.slug].lon, slug: d.slug });
const REFRESH_MS = 10 * 60 * 1000;

function useWeather(place, imperial) {
  const [state, setState] = useState({ status: 'loading' });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, status: s.data ? 'refreshing' : 'loading' }));
    const units = imperial ? { temperature_unit: 'fahrenheit', wind_speed_unit: 'mph', precipitation_unit: 'inch' } : {};
    fetch(forecastUrl(place.lat, place.lon, {
      current: 'temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,is_day',
      hourly: 'temperature_2m,precipitation_probability,weather_code,is_day',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset',
      forecast_days: 7, forecast_hours: 24, ...units,
    }), { signal: controller.signal })
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((data) => setState({ status: 'done', data, updated: new Date() }))
      .catch((err) => { if (err.name !== 'AbortError') setState({ status: 'error' }); });
    const timer = setTimeout(() => setTick((t) => t + 1), REFRESH_MS);
    return () => { controller.abort(); clearTimeout(timer); };
  }, [place, imperial, tick]);
  return [state, () => setTick((t) => t + 1)];
}

function CitySearch({ onPick }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [busy, setBusy] = useState(false);
  const box = useRef(null);
  useEffect(() => {
    const close = (e) => { if (!box.current?.contains(e.target)) setResults(null); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  const search = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${new URLSearchParams({ name: query.trim(), count: 6, language: 'en' })}`);
      setResults((await res.json()).results || []);
    } catch { setResults([]); }
    setBusy(false);
  };
  return <div className="city-search" ref={box}>
    <form onSubmit={search} className="planner-input"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search any city in the world" aria-label="Search for a city" />{busy ? <Loader2 size={16} className="spin" /> : <button aria-label="Search">Search</button>}</form>
    {results && <ul className="city-results">{results.length ? results.map((r) => <li key={r.id}><button type="button" onClick={() => { onPick({ name: r.name, country: [r.admin1, r.country].filter(Boolean).join(', '), lat: r.latitude, lon: r.longitude }); setResults(null); setQuery(''); }}><MapPin size={14} /><strong>{r.name}</strong><span>{[r.admin1, r.country].filter(Boolean).join(', ')}</span></button></li>) : <li className="city-none">No places found. Try another spelling.</li>}</ul>}
  </div>;
}

function BestSeason({ place }) {
  const guide = place.slug && guides[place.slug];
  const now = new Date().getMonth();
  if (!guide) {
    return <section className="weather-card-block"><h2><CalendarDays size={18} /> Best travel season</h2><p className="weather-muted">Seasonal advice is available for our TravelGo destinations. Pick one above, or <Link className="inline-link" to="/destinations">browse destinations</Link>.</p></section>;
  }
  const rating = guide.seasons[now];
  return <section className="weather-card-block">
    <h2><CalendarDays size={18} /> Best travel season</h2>
    <p className="season-lead">Best time to visit {place.name}: <strong>{guide.bestTime}</strong>.</p>
    <ol className="season-strip">{guide.seasons.map((r, m) => <li key={months[m]} className={`season-${r} ${m === now ? 'season-now' : ''}`} title={`${months[m]}: ${seasonLabels[r]}`}><span>{months[m]}</span><em>{seasonLabels[r]}</em></li>)}</ol>
    <div className="season-legend">{[2, 1, 0].map((r) => <span key={r}><i className={`season-${r}`} />{seasonLabels[r]}</span>)}<span><i className="season-now-key" />This month</span></div>
    <div className="planner-tips">
      <p><Sunrise size={15} /> <span>Right now ({months[now]}) is <strong>{seasonLabels[rating].toLowerCase()}</strong> for {place.name}.</span></p>
      <p><AlertTriangle size={15} /> <span>{guide.offSeason}</span></p>
    </div>
  </section>;
}

export default function Weather() {
  const [params] = useSearchParams();
  const start = destinations.find((d) => d.slug === params.get('place')) || destinations.find((d) => d.slug === 'tokyo');
  const [place, setPlace] = useState(() => fromDestination(start));
  const [imperial, setImperial] = useState(false);
  const [state, refresh] = useWeather(place, imperial);
  const { data } = state;
  const t = imperial ? '°F' : '°C';
  const speed = imperial ? 'mph' : 'km/h';
  const rainUnit = imperial ? 'in' : 'mm';

  return <main className="inner-page weather-page">
    <div className="page-intro"><p className="eyebrow">LIVE WEATHER</p><h1>Check the sky <em>before you fly.</em></h1><p>Live conditions, the next 24 hours and a 7-day forecast for anywhere in the world.</p></div>

    <div className="weather-toolbar">
      <CitySearch onPick={setPlace} />
      <div className="unit-toggle" role="group" aria-label="Units">{[['°C', false], ['°F', true]].map(([label, value]) => <button key={label} className={imperial === value ? 'chip-active' : ''} aria-pressed={imperial === value} onClick={() => setImperial(value)}>{label}</button>)}</div>
    </div>
    <div className="type-chips weather-places">{destinations.map((d) => <button key={d.slug} className={place.slug === d.slug ? 'chip-active' : ''} onClick={() => setPlace(fromDestination(d))}>{d.name}</button>)}</div>

    {state.status === 'error' && <p className="planner-note"><AlertTriangle size={16} /> Couldn’t load the weather right now. Check your connection and <button className="inline-link" onClick={refresh}>try again</button>.</p>}
    {state.status === 'loading' && <div className="weather-loading"><div className="current-weather weather-skeleton"><LottieLoader size={80} label="Loading live weather" /><p>Fetching live weather…</p></div><div className="skeleton skeleton-block" /><div className="skeleton skeleton-block tall" /></div>}

    {data && <div className={`weather-layout ${state.status === 'refreshing' ? 'is-refreshing' : ''}`}>
      {(() => {
        const c = data.current;
        const { label, Icon } = describeWeather(c.weather_code, c.is_day === 1);
        const d = data.daily;
        return <section className="current-weather">
          <div className="current-top">
            <div><p className="current-place"><MapPin size={15} /> {place.name}<span>{place.country}</span></p><p className="current-time">Local time {time(c.time)} · Updated {state.updated.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} <button onClick={refresh} aria-label="Refresh weather"><RefreshCw size={13} /></button></p></div>
            <Icon size={56} className="current-icon" />
          </div>
          <div className="current-temp"><strong>{Math.round(c.temperature_2m)}{t}</strong><span>{label}<small>Feels like {Math.round(c.apparent_temperature)}{t} · H {Math.round(d.temperature_2m_max[0])}° L {Math.round(d.temperature_2m_min[0])}°</small></span></div>
          <div className="current-stats">
            <div><Wind size={17} /><span>Wind</span><strong>{Math.round(c.wind_speed_10m)} {speed} <ArrowUp size={14} style={{ transform: `rotate(${c.wind_direction_10m + 180}deg)` }} aria-hidden="true" /> {compass(c.wind_direction_10m)}</strong></div>
            <div><Umbrella size={17} /><span>Rain today</span><strong>{d.precipitation_probability_max[0] ?? 0}% · {d.precipitation_sum[0]} {rainUnit}</strong></div>
            <div><Droplets size={17} /><span>Humidity</span><strong>{c.relative_humidity_2m}%</strong></div>
            <div><CloudRain size={17} /><span>Rain now</span><strong>{c.precipitation} {rainUnit}</strong></div>
            <div><Sunrise size={17} /><span>Sunrise</span><strong>{time(d.sunrise[0])}</strong></div>
            <div><Sunset size={17} /><span>Sunset</span><strong>{time(d.sunset[0])}</strong></div>
          </div>
        </section>;
      })()}

      <section className="weather-card-block">
        <h2><Thermometer size={18} /> Next 24 hours</h2>
        <div className="hourly-strip">{data.hourly.time.map((iso, i) => {
          const { label, Icon } = describeWeather(data.hourly.weather_code[i], data.hourly.is_day[i] === 1);
          return <div className="hour" key={iso}><span>{i === 0 ? 'Now' : new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric' })}</span><Icon size={20} aria-label={label} /><strong>{Math.round(data.hourly.temperature_2m[i])}°</strong><em><Umbrella size={10} /> {data.hourly.precipitation_probability[i] ?? 0}%</em></div>;
        })}</div>
      </section>

      <section className="weather-card-block">
        <h2><CalendarDays size={18} /> 7-day forecast</h2>
        {(() => {
          const d = data.daily;
          const low = Math.min(...d.temperature_2m_min);
          const high = Math.max(...d.temperature_2m_max);
          const span = Math.max(high - low, 1);
          return <div className="daily-list">{d.time.map((date, i) => {
            const { label, Icon } = describeWeather(d.weather_code[i]);
            return <div className="daily-row" key={date}>
              <span className="daily-day">{i === 0 ? 'Today' : new Date(`${date}T12:00`).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}</span>
              <span className="daily-sky"><Icon size={20} />{label}</span>
              <span className="daily-rain"><Umbrella size={13} /> {d.precipitation_probability_max[i] ?? 0}%<small>{d.precipitation_sum[i]} {rainUnit}</small></span>
              <span className="daily-wind"><Wind size={13} /> {Math.round(d.wind_speed_10m_max[i])} {speed}</span>
              <span className="daily-temps"><small>{Math.round(d.temperature_2m_min[i])}°</small><i><b style={{ left: `${((d.temperature_2m_min[i] - low) / span) * 100}%`, right: `${100 - ((d.temperature_2m_max[i] - low) / span) * 100}%` }} /></i><strong>{Math.round(d.temperature_2m_max[i])}°</strong></span>
            </div>;
          })}</div>;
        })()}
      </section>

      <BestSeason place={place} />
      <div className="plan-actions">{place.slug && <Link to={`/planner?destination=${place.slug}`} className="button button-dark">Plan a trip to {place.name} <ArrowRight size={16} /></Link>}<span>Live data from Open-Meteo. Refreshes every 10 minutes.</span></div>
    </div>}
  </main>;
}
