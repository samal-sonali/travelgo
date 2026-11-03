import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle, ArrowRight, BedDouble, Bus, Car, Check, ChevronDown, ChevronUp, Circle, Footprints, Landmark, Loader2, MapPin, Minus,
  Plane, Plus, RotateCcw, Sparkles, Star, Sun, Sunrise, Trash2, Umbrella, Users, UtensilsCrossed, Wallet, X,
} from 'lucide-react';
import { destinations, imageUrl } from './data/travel.js';
import { guides, travelTypes } from './data/planner.js';
import { describeWeather, forecastUrl } from './weather.js';

const tiers = [['budget', 'Budget'], ['mid', 'Comfort'], ['luxury', 'Luxury']];
const money = (n) => `$${Math.round(n).toLocaleString('en-US')}`;

function buildPlan({ slug, budget, days, type, people }) {
  const place = destinations.find((d) => d.slug === slug);
  const guide = guides[slug];
  const nights = days - 1;
  const rooms = Math.ceil(people / 2);

  // Places that match the travel style come first; the rest fill any extra time.
  // A place's optional 5th field pins it to a time: 'sunrise', 'evening', or 'dinner' (dinner included).
  const byType = (a, b) => Number(b[1].includes(type)) - Number(a[1].includes(type));
  const queue = [...guide.places].sort(byType);
  const take = (fits) => { const i = queue.findIndex((p) => fits(p[4])); return i < 0 ? undefined : queue.splice(i, 1)[0]; };
  const slotTimes = { sunrise: 'Early morning', evening: 'Evening', dinner: 'Evening' };
  const sight = (time, p) => (p
    ? { time: slotTimes[p[4]] || time, kind: 'place', title: p[0], note: p[3], cost: p[2] * people }
    : { time, kind: 'free', title: 'Free time to explore', note: 'Wander a new neighbourhood, or simply slow down.', cost: 0 });
  const casual = guide.restaurants.filter((r) => r[2] === '$');
  const sitDown = guide.restaurants.filter((r) => r[2] !== '$');
  const mealCount = { Lunch: 0, Dinner: 0 };
  const meal = (label, list) => { const r = list[mealCount[label]++ % list.length]; return { time: label, kind: 'food', title: `${label} at ${r[0]}`, note: `${r[1]} · ${r[2]}`, cost: 0 }; };

  const fullDay = () => {
    const morning = sight('Morning', take((slot) => !slot || slot === 'sunrise'));
    const later = take((slot) => slot !== 'sunrise');
    const items = [morning, meal('Lunch', casual)];
    if (later?.[4] === 'dinner') items.push(sight('Evening', later));
    else if (later?.[4] === 'evening') items.push(meal('Dinner', sitDown), sight('Evening', later));
    else items.push(sight('Afternoon', later), meal('Dinner', sitDown));
    const names = items.filter((it) => it.kind === 'place').map((it) => it.title);
    return { title: names.join(' · ') || 'Free day to explore', items };
  };

  // Whole-day trips (like Mount Fuji) take every other middle day, best matches first.
  const trips = [...(guide.dayTrips || [])].sort(byType).slice(0, Math.ceil((days - 2) / 2));
  const tripDay = ([title, , cost, steps]) => ({ title, items: steps.map(([time, name, note], j) => ({ time, kind: 'place', title: name, note, cost: j === 0 ? cost * people : 0 })) });
  const [walkTitle, walkNote] = guide.nightWalk || ['Evening stroll', 'An easy first walk around your neighbourhood to get your bearings.'];

  const itinerary = Array.from({ length: days }, (_, i) => {
    if (i === 0) {
      return { title: 'Arrive & settle in', items: [
        { time: 'Arrival', kind: 'transport', title: 'Airport pickup', note: guide.arrival[0], cost: 0 },
        { time: 'Midday', kind: 'stay', title: 'Hotel check-in', note: '', cost: 0 },
        sight('Afternoon', take((slot) => !slot)),
        meal('Dinner', sitDown),
        { time: 'Night', kind: 'walk', title: walkTitle, note: walkNote, cost: 0 },
      ] };
    }
    if (i === days - 1) {
      return { title: 'Last look & head home', items: [
        { time: 'Morning', kind: 'stay', title: 'Hotel check-out', note: 'Most hotels will store your bags for the day.', cost: 0 },
        sight('Late morning', take((slot) => !slot)),
        meal('Lunch', casual),
        { time: 'Afternoon', kind: 'transport', title: 'Airport drop-off', note: 'Leave plenty of time for the journey back.', cost: 0 },
      ] };
    }
    return i % 2 === 1 && trips[(i - 1) / 2] ? tripDay(trips[(i - 1) / 2]) : fullDay();
  });

  const activities = itinerary.flatMap((d) => d.items).reduce((sum, it) => sum + it.cost, 0);
  const costFor = (tier, index) => {
    const parts = {
      Stay: guide.hotels[tier][2] * nights * rooms,
      Food: guide.food[index] * people * days,
      'Local transport': (guide.arrival[1] * 2 + guide.localTransport * days) * people,
      Activities: activities,
    };
    return { tier, parts, total: Object.values(parts).reduce((a, b) => a + b, 0) };
  };
  const options = tiers.map(([tier], i) => costFor(tier, i));
  const affordable = options.filter((o) => o.total <= budget);
  const chosen = affordable.length ? affordable[affordable.length - 1] : options[0];
  const [hotelName, hotelArea] = guide.hotels[chosen.tier];
  itinerary[0].items[1].note = `${hotelName}, ${hotelArea}`;

  return { place, guide, days, nights, people, rooms, type, budget, itinerary, options, chosen, overBy: Math.max(0, chosen.total - budget) };
}

function useForecast(guide) {
  const [state, setState] = useState({ status: 'idle' });
  useEffect(() => {
    if (!guide) return undefined;
    const controller = new AbortController();
    setState({ status: 'loading' });
    fetch(forecastUrl(guide.lat, guide.lon, { daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max', forecast_days: 7 }), { signal: controller.signal })
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then(({ daily }) => setState({ status: 'done', days: daily.time.map((date, i) => ({ date, code: daily.weather_code[i], max: daily.temperature_2m_max[i], min: daily.temperature_2m_min[i], rain: daily.precipitation_probability_max[i] })) }))
      .catch((err) => { if (err.name !== 'AbortError') setState({ status: 'error' }); });
    return () => controller.abort();
  }, [guide]);
  return state;
}

function WeatherPanel({ plan }) {
  const forecast = useForecast(plan.guide);
  if (forecast.status !== 'done') {
    return <div className="planner-note">{forecast.status === 'error' ? <><AlertTriangle size={16} /> Couldn’t load the live forecast right now. Best time to visit: {plan.guide.bestTime}.</> : <><Loader2 size={16} className="spin" /> Loading the live forecast…</>}</div>;
  }
  const avgMax = forecast.days.reduce((s, d) => s + d.max, 0) / forecast.days.length;
  const rainy = forecast.days.some((d) => d.rain >= 50);
  const packing = avgMax >= 27 ? 'Light, breathable clothes, sunscreen and a hat.' : avgMax >= 15 ? 'Layers and a light jacket for the evenings.' : 'A warm coat, layers and comfortable waterproof shoes.';
  return <>
    <div className="weather-grid">{forecast.days.map((d) => {
      const { label, Icon } = describeWeather(d.code);
      return <div className="weather-day" key={d.date}><span>{new Date(`${d.date}T12:00`).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}</span><Icon size={24} /><strong>{Math.round(d.max)}°</strong><small>{Math.round(d.min)}° · {label}</small>{d.rain > 0 && <em><Umbrella size={11} /> {d.rain}%</em>}</div>;
    })}</div>
    <div className="planner-tips"><p><Sparkles size={15} /> <strong>What to pack:</strong> {packing}{rainy && ' Rain is likely on some days, so bring an umbrella.'}</p><p><Sunrise size={15} /> <strong>Best time to visit:</strong> {plan.guide.bestTime}.</p></div>
    <p className="mock-data-note">Live 7-day forecast from Open-Meteo, in °C. <Link to={`/weather?place=${plan.place.slug}`} className="inline-link">See full live weather</Link></p>
  </>;
}

const kindIcons = { place: Landmark, food: UtensilsCrossed, transport: Car, stay: BedDouble, walk: Footprints, free: Sun, custom: Star };
const stopTimes = ['Morning', 'Afternoon', 'Evening', 'Night'];

function DayPlanner({ days, setDays, original }) {
  const [drafts, setDrafts] = useState({});
  const edit = (change) => setDays((prev) => { const next = prev.map((day) => ({ ...day, items: [...day.items] })); change(next); return next; });
  const addStop = (event, d) => {
    event.preventDefault();
    const draft = drafts[d] || {};
    if (!draft.title?.trim()) return;
    edit((next) => { next[d].items.push({ time: draft.time || 'Afternoon', kind: 'custom', title: draft.title.trim(), note: 'Added by you', cost: 0 }); });
    setDrafts({ ...drafts, [d]: { time: draft.time } });
  };
  const moveStop = (d, j, dir) => edit((next) => { const items = next[d].items; [items[j], items[j + dir]] = [items[j + dir], items[j]]; });
  const addDay = () => { edit((next) => { next.splice(Math.max(next.length - 1, 1), 0, { title: 'Your own day', items: [] }); }); setDrafts({}); };
  const removeDay = (d) => { setDays((prev) => prev.filter((_, i) => i !== d)); setDrafts({}); };

  return <div className="day-planner">
    <div className="day-planner-bar"><p><Sparkles size={15} /> Make it yours: add your own stops, reorder them, or add extra days.</p>{days !== original && <button type="button" onClick={() => { setDays(original); setDrafts({}); }}><RotateCcw size={14} /> Reset plan</button>}</div>
    {days.map((day, d) => <section className="planner-day" key={d}>
      <header>
        <div className="day-badge"><span>DAY</span>{d + 1}</div>
        <h3>{day.title}</h3>
        {days.length > 1 && <button type="button" className="icon-button" onClick={() => removeDay(d)} aria-label={`Remove day ${d + 1}`}><Trash2 size={15} /></button>}
      </header>
      <ol className="day-steps">
        {day.items.map((it, j) => { const Icon = kindIcons[it.kind]; return <li className={`day-step step-${it.kind}`} key={`${it.title}-${j}`}>
          <span className="step-dot"><Icon size={15} /></span>
          <div className="step-body"><span className="item-time">{it.time}</span><strong>{it.title}</strong>{it.note && <p>{it.note}</p>}</div>
          {it.cost > 0 && <em>{money(it.cost)}</em>}
          <div className="step-actions">
            <button type="button" disabled={j === 0} onClick={() => moveStop(d, j, -1)} aria-label="Move up"><ChevronUp size={14} /></button>
            <button type="button" disabled={j === day.items.length - 1} onClick={() => moveStop(d, j, 1)} aria-label="Move down"><ChevronDown size={14} /></button>
            <button type="button" onClick={() => edit((next) => { next[d].items.splice(j, 1); })} aria-label={`Remove ${it.title}`}><X size={14} /></button>
          </div>
        </li>; })}
        {!day.items.length && <li className="day-empty">Nothing planned yet. Add your first stop below.</li>}
      </ol>
      <form className="add-stop" onSubmit={(e) => addStop(e, d)}>
        <select value={drafts[d]?.time || 'Afternoon'} onChange={(e) => setDrafts({ ...drafts, [d]: { ...drafts[d], time: e.target.value } })} aria-label="Time of day">{stopTimes.map((t) => <option key={t}>{t}</option>)}</select>
        <input value={drafts[d]?.title || ''} onChange={(e) => setDrafts({ ...drafts, [d]: { ...drafts[d], title: e.target.value } })} placeholder="Add a stop, e.g. Shopping in Ginza" aria-label={`Add a stop to day ${d + 1}`} />
        <button className="button button-dark"><Plus size={14} /> Add</button>
      </form>
    </section>)}
    <button type="button" className="add-day" onClick={addDay}><Plus size={16} /> Add another day</button>
  </div>;
}

function PlanResult({ plan }) {
  const [tab, setTab] = useState('Day-wise plan');
  const [days, setDays] = useState(plan.itinerary);
  const { place, guide, chosen } = plan;
  const tierLabel = tiers.find(([t]) => t === chosen.tier)[1];
  const typeLabel = travelTypes.find(([t]) => t === plan.type)[1];
  const tabs = ['Day-wise plan', 'Costs', 'Hotels', 'Food', 'Places', 'Transport', 'Weather'];
  return <motion.div className="plan-result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
    <div className="plan-hero"><img src={imageUrl(place.image, 1200)} alt={place.name} /><div><p className="eyebrow">YOUR {days.length}-DAY {typeLabel.toUpperCase()} TRIP</p><h2>{place.name}, <em>{place.country}</em></h2><span>{plan.people} {plan.people === 1 ? 'traveller' : 'travellers'} · {plan.nights} nights · {tierLabel} stays</span></div></div>
    <div className="plan-summary">
      <div><span>Estimated total</span><strong>{money(chosen.total)}</strong></div>
      <div><span>Per person</span><strong>{money(chosen.total / plan.people)}</strong></div>
      <div><span>Your budget</span><strong>{money(plan.budget)}</strong></div>
      <div className={plan.overBy ? 'status-warn' : 'status-ok'}>{plan.overBy ? <><AlertTriangle size={16} /> {money(plan.overBy)} over</> : <><Check size={16} /> Within budget</>}</div>
    </div>
    {plan.overBy > 0 && <p className="planner-note"><AlertTriangle size={16} /> Even the budget option is over your limit. Try fewer days, or raise your budget to about {money(chosen.total)}.</p>}
    <div className="plan-tabs" role="tablist">{tabs.map((t) => <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'active-tab' : ''} onClick={() => setTab(t)}>{t}</button>)}</div>
    <div className="plan-panel">
      {tab === 'Day-wise plan' && <DayPlanner days={days} setDays={setDays} original={plan.itinerary} />}
      {tab === 'Costs' && <div className="cost-breakdown">
        {Object.entries(chosen.parts).map(([label, value]) => <div className="cost-row" key={label}><div><span>{label}</span><strong>{money(value)}</strong></div><i><b style={{ width: `${(value / chosen.total) * 100}%` }} /></i></div>)}
        <div className="cost-total"><span>Estimated total for {plan.people}</span><strong>{money(chosen.total)}</strong></div>
        <p className="mock-data-note">Rough estimates in USD. International flights to {place.name} aren’t included.</p>
      </div>}
      {tab === 'Hotels' && <div className="option-grid">{tiers.map(([tier, label], i) => { const [name, area, price] = guide.hotels[tier]; const o = plan.options[i]; return <div className={`option-card ${chosen.tier === tier ? 'option-picked' : ''}`} key={tier}>
        {chosen.tier === tier && <span className="picked-badge"><Sparkles size={12} /> Best fit</span>}
        <BedDouble size={20} /><p className="eyebrow">{label}</p><h3>{name}</h3><p>{area}</p>
        <div className="option-price"><strong>{money(price)}</strong> / room / night</div>
        <small>{plan.rooms} {plan.rooms === 1 ? 'room' : 'rooms'} × {plan.nights} nights = {money(price * plan.rooms * plan.nights)} · trip total {money(o.total)}</small>
      </div>; })}</div>}
      {tab === 'Food' && <div className="list-grid">{guide.restaurants.map(([name, cuisine, level]) => <div className="list-card" key={name}><UtensilsCrossed size={18} /><div><strong>{name}</strong><span>{cuisine}</span></div><em>{level}</em></div>)}
        <p className="mock-data-note">Food budget: about {money(guide.food[tiers.findIndex(([t]) => t === chosen.tier)])} per person per day.</p></div>}
      {tab === 'Places' && <div className="list-grid">{guide.places.map(([name, tags, cost, tip]) => <div className={`list-card ${tags.includes(plan.type) ? 'list-match' : ''}`} key={name}><MapPin size={18} /><div><strong>{name}</strong><span>{tip}</span></div><em>{cost ? `${money(cost)} pp` : 'Free'}</em></div>)}
        <p className="mock-data-note">Highlighted places match your {typeLabel.toLowerCase()} travel style.</p></div>}
      {tab === 'Transport' && <div className="list-grid">
        <div className="list-card list-match"><Plane size={18} /><div><strong>Getting there</strong><span>{guide.arrival[0]}</span></div><em>{money(guide.arrival[1])} pp</em></div>
        {guide.getAround.map(([mode, note]) => <div className="list-card" key={mode}><Bus size={18} /><div><strong>{mode}</strong><span>{note}</span></div></div>)}
        <p className="mock-data-note">Budget about {money(guide.localTransport)} per person per day for getting around.</p></div>}
      {tab === 'Weather' && <WeatherPanel plan={plan} />}
    </div>
    <div className="plan-actions"><Link to="/booking" className="button button-dark">Book this trip <ArrowRight size={16} /></Link><Link to={`/budget?${new URLSearchParams({ budget: plan.budget, days: days.length, people: plan.people, hotel: Math.round(chosen.parts.Stay), food: Math.round(chosen.parts.Food), transport: Math.round(chosen.parts['Local transport']), shopping: '', flights: '' })}`} className="button button-outline"><Wallet size={16} /> Open in Budget Calculator</Link><span>Prices are estimates and may change.</span></div>
  </motion.div>;
}

const steps = ['Reading your preferences', 'Matching places to your travel style', 'Balancing your budget', 'Building your day-by-day plan'];

export default function Planner() {
  const [params] = useSearchParams();
  const initial = destinations.some((d) => d.slug === params.get('destination')) ? params.get('destination') : destinations[0].slug;
  const [form, setForm] = useState({ slug: initial, budget: '3000', days: 5, type: 'culture', people: 2 });
  const [step, setStep] = useState(-1);
  const [plan, setPlan] = useState(null);
  const timers = useRef([]);
  const resultRef = useRef(null);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const generate = (e) => {
    e.preventDefault();
    timers.current.forEach(clearTimeout);
    setPlan(null);
    setStep(0);
    if (window.innerWidth < 960) resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    steps.forEach((_, i) => { timers.current.push(setTimeout(() => setStep(i + 1), (i + 1) * 450)); });
    timers.current.push(setTimeout(() => { setPlan(buildPlan({ ...form, budget: Number(form.budget) })); setStep(-1); }, steps.length * 450 + 250));
  };

  return <main className="inner-page planner-page">
    <div className="page-intro"><p className="eyebrow">AI TRIP PLANNER</p><h1>Your trip, <em>planned in seconds.</em></h1><p>Tell us where, how long and how you like to travel. We’ll build the itinerary, the costs and everything in between.</p></div>
    <div className="planner-layout">
      <form className="planner-form" onSubmit={generate}>
        <label>Destination<div className="planner-input"><MapPin size={16} /><select value={form.slug} onChange={(e) => update('slug', e.target.value)}>{destinations.map((d) => <option key={d.slug} value={d.slug}>{d.name}, {d.country}</option>)}</select></div></label>
        <label>Total budget (USD)<div className="planner-input"><Wallet size={16} /><input type="number" min="100" step="50" required value={form.budget} onChange={(e) => update('budget', e.target.value)} /></div><small>For everyone, excluding flights.</small></label>
        <label>Days <b>{form.days} days</b><input type="range" min="2" max="14" value={form.days} onChange={(e) => update('days', Number(e.target.value))} /></label>
        <fieldset><legend>Travel type</legend><div className="type-chips">{travelTypes.map(([value, label]) => <button type="button" key={value} className={form.type === value ? 'chip-active' : ''} aria-pressed={form.type === value} onClick={() => update('type', value)}>{label}</button>)}</div></fieldset>
        <div className="people-field"><span><Users size={16} /> Number of people</span><div className="stepper"><button type="button" aria-label="Fewer people" onClick={() => update('people', Math.max(1, form.people - 1))}><Minus size={14} /></button><strong>{form.people}</strong><button type="button" aria-label="More people" onClick={() => update('people', Math.min(12, form.people + 1))}><Plus size={14} /></button></div></div>
        <button className="button planner-submit" disabled={step >= 0}>{step >= 0 ? <><Loader2 size={17} className="spin" /> Generating…</> : <><Sparkles size={17} /> Generate my trip</>}</button>
      </form>
      <div className="planner-output" ref={resultRef}>
        <AnimatePresence mode="wait">
          {step >= 0 && <motion.div key="loading" className="planner-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <span className="ai-badge"><Sparkles size={20} /></span><h3>Planning your trip…</h3>
            <ul>{steps.map((s, i) => <li key={s} className={i < step ? 'step-done' : i === step ? 'step-active' : ''}>{i < step ? <Check size={14} /> : i === step ? <Loader2 size={14} className="spin" /> : <Circle size={14} />} {s}</li>)}</ul>
          </motion.div>}
          {step < 0 && plan && <PlanResult key={`${plan.place.slug}-${plan.days}-${plan.type}-${plan.people}-${plan.budget}`} plan={plan} />}
          {step < 0 && !plan && <motion.div key="empty" className="planner-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <span className="ai-badge"><Sparkles size={20} /></span><h3>Your itinerary will appear here</h3><p>Day-by-day plans, cost estimates, hotels, restaurants, sights, transport and a live weather forecast.</p>
          </motion.div>}
        </AnimatePresence>
      </div>
    </div>
  </main>;
}
