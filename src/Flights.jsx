import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, ArrowRight, BellRing, CalendarDays, Check, Clock, Loader2, Minus, Plane, PlaneLanding, PlaneTakeoff, Plus, Search, SearchX, Users } from 'lucide-react';
import { airports, cabins } from './data/flights.js';
import { findAirport, formatClock, formatDuration, searchFlights, todayISO } from './flightSearch.js';
import { notify, toggleWatch, useNotifications } from './notifications.js';

const money = (n) => `$${Math.round(n).toLocaleString('en-US')}`;
const niceDate = (iso, opts = { weekday: 'short', day: 'numeric', month: 'short' }) => new Date(`${iso}T12:00`).toLocaleDateString('en-US', opts);
const shiftDate = (iso, days) => { const d = new Date(`${iso}T12:00`); d.setDate(d.getDate() + days); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const sorts = [['best', 'Best'], ['cheapest', 'Cheapest'], ['fastest', 'Fastest'], ['earliest', 'Earliest']];

function AirportField({ label, icon: Icon, value, onChange, exclude }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const box = useRef(null);
  const airport = findAirport(value);
  useEffect(() => {
    const close = (e) => { if (!box.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  const q = query.trim().toLowerCase();
  const matches = airports.filter((a) => a.code !== exclude && `${a.code} ${a.city} ${a.name} ${a.country}`.toLowerCase().includes(q)).slice(0, 7);
  const pick = (code) => { onChange(code); setOpen(false); setQuery(''); };
  return <div className="airport-field" ref={box}>
    <span className="field-label">{label}</span>
    <button type="button" className="airport-value" onClick={() => setOpen(true)} aria-haspopup="listbox" aria-expanded={open}>
      <Icon size={18} /><span><strong>{airport.city}</strong><small>{airport.code} · {airport.name}</small></span>
    </button>
    {open && <div className="airport-pop">
      <div className="planner-input"><Search size={15} /><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="City or airport code" aria-label={`Search ${label.toLowerCase()} airports`}
        onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); if (e.key === 'Enter') { e.preventDefault(); if (matches[0]) pick(matches[0].code); } }} /></div>
      <ul role="listbox">{matches.length ? matches.map((a) => <li key={a.code}><button type="button" role="option" aria-selected={a.code === value} onClick={() => pick(a.code)}><b>{a.code}</b><span>{a.city}<small>{a.name}, {a.country}</small></span></button></li>) : <li className="city-none">No airports match “{query}”.</li>}</ul>
    </div>}
  </div>;
}

function FlightResult({ flight, badges, passengers, date }) {
  const remind = () => notify({
    type: 'flight', key: `flight-${flight.id}-${date}`, link: '/flights',
    title: `Flight reminder: ${flight.from.city} → ${flight.to.city}`,
    body: `${flight.airline.name} ${flight.flightNos[0]} departs ${niceDate(date)} at ${formatClock(flight.depart)} from ${flight.from.code}. Online check-in opens 24 hours before.`,
  });
  return <article className="flight-result">
    {badges.length > 0 && <div className="flight-badges">{badges.map((b) => <span key={b} className={`badge-${b.toLowerCase()}`}>{b}</span>)}</div>}
    <div className="flight-result-main">
      <div className="flight-carrier"><span className="airline-mark">{flight.airline.code}</span><div><strong>{flight.airline.name}</strong><small>{flight.flightNos.join(' · ')}</small></div></div>
      <div className="flight-times">
        <div className="flight-end"><strong>{formatClock(flight.depart)}</strong><span>{flight.from.code}</span></div>
        <div className="flight-path">
          <span className="flight-duration-label"><Clock size={12} /> {formatDuration(flight.duration)}</span>
          <i>{flight.layovers.map((l) => <b key={l.airport.code} />)}<Plane size={13} /></i>
          <span className={flight.stops ? 'stops-some' : 'stops-none'}>{flight.stops ? `${flight.stops} stop · ${flight.layovers.map((l) => `${l.airport.code} ${formatDuration(l.minutes)}`).join(', ')}` : 'Nonstop'}</span>
        </div>
        <div className="flight-end"><strong>{formatClock(flight.arrive)}{flight.dayShift !== 0 && <sup>{flight.dayShift > 0 ? `+${flight.dayShift}` : flight.dayShift}</sup>}</strong><span>{flight.to.code}</span></div>
      </div>
      <div className="flight-buy">
        <strong>{money(flight.price)}</strong><small>per person</small>
        {passengers > 1 && <small className="flight-total">{money(flight.total)} total</small>}
        <Link to="/booking" className="button button-dark" onClick={remind}>Select <ArrowRight size={14} /></Link>
      </div>
    </div>
  </article>;
}

export default function Flights() {
  const [form, setForm] = useState({ from: 'HYD', to: 'DPS', date: todayISO(14), passengers: 1, cabin: 'economy' });
  const [query, setQuery] = useState(form);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('best');
  const [stopFilter, setStopFilter] = useState('any');
  const [hidden, setHidden] = useState([]);
  const timer = useRef();
  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const run = (next) => {
    setQuery(next);
    setLoading(true);
    setStopFilter('any');
    setHidden([]);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setLoading(false), 650);
  };
  useEffect(() => { timer.current = setTimeout(() => setLoading(false), 650); return () => clearTimeout(timer.current); }, []);

  const results = useMemo(() => searchFlights(query), [query]);
  const dateStrip = useMemo(() => [-3, -2, -1, 0, 1, 2, 3].map((n) => shiftDate(query.date, n)).filter((d) => d >= todayISO()).map((date) => {
    const prices = searchFlights({ ...query, date }).map((f) => f.price);
    return { date, low: prices.length ? Math.min(...prices) : null };
  }), [query]);

  const shown = useMemo(() => {
    const list = results.filter((f) => (stopFilter === 'any' || (stopFilter === 'nonstop' ? f.stops === 0 : f.stops === 1)) && !hidden.includes(f.airline.code));
    if (!list.length) return { list, badges: {} };
    const minP = Math.min(...list.map((f) => f.price));
    const maxP = Math.max(...list.map((f) => f.price));
    const minD = Math.min(...list.map((f) => f.duration));
    const maxD = Math.max(...list.map((f) => f.duration));
    const score = (f) => (f.price - minP) / Math.max(maxP - minP, 1) + (f.duration - minD) / Math.max(maxD - minD, 1);
    const sorters = { best: (a, b) => score(a) - score(b), cheapest: (a, b) => a.price - b.price, fastest: (a, b) => a.duration - b.duration, earliest: (a, b) => a.depart - b.depart };
    const ordered = [...list].sort(sorters[sort]);
    // One flight can earn several badges, e.g. both Cheapest and Fastest.
    const badges = {};
    [['Best', sorters.best], ['Cheapest', sorters.cheapest], ['Fastest', sorters.fastest]].forEach(([label, fn]) => {
      const { id } = [...list].sort(fn)[0];
      badges[id] = [...(badges[id] || []), label];
    });
    return { list: ordered, badges, minP, minD, best: [...list].sort(sorters.best)[0] };
  }, [results, stopFilter, hidden, sort]);
  const badgesFor = (id) => shown.badges[id] || [];

  const carriers = [...new Map(results.map((f) => [f.airline.code, f.airline])).values()];
  const hasNonstop = results.some((f) => f.stops === 0);
  const hasStops = results.some((f) => f.stops > 0);
  const from = findAirport(query.from);
  const to = findAirport(query.to);
  const { watches } = useNotifications();
  const watching = watches.some((w) => w.id === `${query.from}-${query.to}-${query.date}`);
  const cabinLabel = cabins.find(([k]) => k === query.cabin)[1];

  return <main className="inner-page flights-page">
    <div className="page-intro"><p className="eyebrow">FLIGHT SEARCH</p><h1>Find a flight that <em>feels right.</em></h1><p>Compare airlines, stops, journey times and prices in one place.</p></div>

    <form className="flight-search" onSubmit={(e) => { e.preventDefault(); if (form.from !== form.to) run(form); }}>
      <div className="flight-route-fields">
        <AirportField label="From" icon={PlaneTakeoff} value={form.from} exclude={form.to} onChange={(code) => update('from', code)} />
        <button type="button" className="swap-airports" onClick={() => setForm((f) => ({ ...f, from: f.to, to: f.from }))} aria-label="Swap origin and destination"><ArrowLeftRight size={16} /></button>
        <AirportField label="To" icon={PlaneLanding} value={form.to} exclude={form.from} onChange={(code) => update('to', code)} />
      </div>
      <label className="flight-field"><span className="field-label">Date</span><div className="planner-input"><CalendarDays size={16} /><input type="date" min={todayISO()} required value={form.date} onChange={(e) => update('date', e.target.value)} /></div></label>
      <div className="flight-field"><span className="field-label">Passengers</span><div className="planner-input flight-pax"><Users size={16} /><div className="stepper"><button type="button" aria-label="Fewer passengers" onClick={() => update('passengers', Math.max(1, form.passengers - 1))}><Minus size={13} /></button><strong>{form.passengers}</strong><button type="button" aria-label="More passengers" onClick={() => update('passengers', Math.min(9, form.passengers + 1))}><Plus size={13} /></button></div></div></div>
      <label className="flight-field"><span className="field-label">Cabin</span><div className="planner-input"><select value={form.cabin} onChange={(e) => update('cabin', e.target.value)}>{cabins.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div></label>
      <button className="button flight-search-button" disabled={loading}>{loading ? <Loader2 size={17} className="spin" /> : <Search size={17} />} Search flights</button>
    </form>

    <div className="flight-results-head">
      <button type="button" className={`button ${watching ? 'button-outline' : 'button-dark'} track-button`} onClick={() => toggleWatch(query)} aria-pressed={watching}>{watching ? <><Check size={15} /> Tracking prices</> : <><BellRing size={15} /> Track prices</>}</button>
      <h2>{from.city} <ArrowRight size={18} /> {to.city}</h2>
      <p>{niceDate(query.date, { weekday: 'long', day: 'numeric', month: 'long' })} · {query.passengers} {query.passengers === 1 ? 'passenger' : 'passengers'} · {cabinLabel}</p>
    </div>

    <div className="date-strip">{dateStrip.map(({ date, low }) => <button key={date} type="button" className={date === query.date ? 'date-active' : ''} onClick={() => { setForm((f) => ({ ...f, date })); run({ ...query, date }); }}><span>{niceDate(date)}</span><strong>{low ? money(low) : '—'}</strong></button>)}</div>

    {loading ? <div className="flight-list">{[0, 1, 2].map((i) => <div className="flight-result flight-skeleton" key={i}><i /><i /><i /></div>)}</div> : !results.length ? <div className="planner-empty"><SearchX size={26} /><h3>No flights found</h3><p>We couldn’t find a route between these airports. Try a nearby airport.</p></div> : <>
      <div className="flight-sorts" role="tablist">{sorts.map(([key, label]) => <button key={key} role="tab" aria-selected={sort === key} className={sort === key ? 'sort-active' : ''} onClick={() => setSort(key)}><strong>{label}</strong>{shown.list.length > 0 && key === 'cheapest' && <span>{money(shown.minP)}</span>}{shown.list.length > 0 && key === 'fastest' && <span>{formatDuration(shown.minD)}</span>}{shown.list.length > 0 && key === 'best' && <span>{money(shown.best.price)} · {formatDuration(shown.best.duration)}</span>}</button>)}</div>
      <div className="flight-filters">
        <div className="type-chips"><span className="filter-label">Stops</span>{[['any', 'Any'], ['nonstop', 'Nonstop', !hasNonstop], ['one', '1 stop', !hasStops]].map(([key, label, off]) => <button key={key} type="button" disabled={off} className={stopFilter === key ? 'chip-active' : ''} onClick={() => setStopFilter(key)}>{label}</button>)}</div>
        <div className="type-chips"><span className="filter-label">Airlines</span>{carriers.map((a) => <button key={a.code} type="button" className={hidden.includes(a.code) ? '' : 'chip-on'} aria-pressed={!hidden.includes(a.code)} onClick={() => setHidden((h) => (h.includes(a.code) ? h.filter((c) => c !== a.code) : [...h, a.code]))}>{a.name}</button>)}</div>
      </div>
      <p className="flight-count">{shown.list.length} of {results.length} flights</p>
      {shown.list.length ? <div className="flight-list">{shown.list.map((f) => <FlightResult key={f.id} flight={f} badges={badgesFor(f.id)} passengers={query.passengers} date={query.date} />)}</div> : <div className="planner-empty"><SearchX size={26} /><h3>No flights match your filters</h3><button className="inline-link" onClick={() => { setStopFilter('any'); setHidden([]); }}>Clear filters</button></div>}
    </>}
    <p className="mock-data-note">Sample schedules and fares, generated from real routes and distances for demonstration. Times are local; prices are in USD per person.</p>
  </main>;
}
