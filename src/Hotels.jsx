import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, BedDouble, CalendarDays, Check, Coffee, MapPin, Minus, Plus, Search, SearchX, ShieldCheck, SlidersHorizontal, Star, Users, Waves, Wifi, X } from 'lucide-react';
import { destinations, imageUrl } from './data/travel.js';
import { hotelImages, hotels, roomTypes, TAX_RATE } from './data/hotels.js';
import { todayISO } from './flightSearch.js';
import { notify } from './notifications.js';
import Carousel from './ui/Carousel.jsx';

const money = (n) => `$${Math.round(n).toLocaleString('en-US')}`;
const niceDate = (iso) => new Date(`${iso}T12:00`).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
const addDays = (iso, days) => { const d = new Date(`${iso}T12:00`); d.setDate(d.getDate() + days); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const nightsBetween = (a, b) => Math.max(1, Math.round((new Date(`${b}T12:00`) - new Date(`${a}T12:00`)) / 86400000));
const scoreLabel = (s) => (s >= 9 ? 'Superb' : s >= 8.5 ? 'Excellent' : s >= 8 ? 'Very good' : 'Good');
const placeName = (slug) => destinations.find((d) => d.slug === slug)?.name;
const amenities = [['pool', 'Swimming pool', Waves], ['wifi', 'Free WiFi', Wifi], ['breakfast', 'Breakfast included', Coffee], ['freeCancel', 'Free cancellation', ShieldCheck]];
const PRICE_MAX = 1600;
const noFilters = { stars: [], minScore: 0, maxPrice: PRICE_MAX, pool: false, wifi: false, breakfast: false, freeCancel: false };
const sorts = [['recommended', 'Recommended'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low'], ['rating', 'Guest rating']];

function Stars({ count }) {
  return <span className="hotel-stars" aria-label={`${count}-star hotel`}>{Array.from({ length: count }, (_, i) => <Star key={i} size={12} fill="currentColor" />)}</span>;
}

function Filters({ filters, setFilters, counts }) {
  const toggleStar = (s) => setFilters((f) => ({ ...f, stars: f.stars.includes(s) ? f.stars.filter((x) => x !== s) : [...f.stars, s] }));
  return <div className="hotel-filters">
    <section><h3>Star rating</h3><div className="star-chips">{[5, 4, 3, 2].map((s) => <button key={s} type="button" aria-pressed={filters.stars.includes(s)} className={filters.stars.includes(s) ? 'chip-active' : ''} onClick={() => toggleStar(s)}>{s} <Star size={12} fill="currentColor" /></button>)}</div></section>
    <section><h3>Guest rating</h3><div className="type-chips">{[[0, 'Any'], [8, '8+ Very good'], [9, '9+ Superb']].map(([v, label]) => <button key={v} type="button" className={filters.minScore === v ? 'chip-active' : ''} onClick={() => setFilters((f) => ({ ...f, minScore: v }))}>{label}</button>)}</div></section>
    <section>
      <h3>Price per night <b>{filters.maxPrice >= PRICE_MAX ? 'Any price' : `Up to ${money(filters.maxPrice)}`}</b></h3>
      <input type="range" min="50" max={PRICE_MAX} step="50" value={filters.maxPrice} onChange={(e) => setFilters((f) => ({ ...f, maxPrice: Number(e.target.value) }))} aria-label="Maximum price per night" />
      <div className="range-scale"><span>$50</span><span>{money(PRICE_MAX)}+</span></div>
    </section>
    <section><h3>Amenities</h3>{amenities.map(([key, label, Icon]) => <label key={key} className="check-row">
      <input type="checkbox" checked={filters[key]} onChange={(e) => setFilters((f) => ({ ...f, [key]: e.target.checked }))} />
      <span className="check-box"><Check size={12} /></span><Icon size={15} /> {label}<em>{counts[key]}</em>
    </label>)}</section>
  </div>;
}

function BookingPanel({ hotel, stay, onClose }) {
  const [room, setRoom] = useState(0);
  const [done, setDone] = useState(null);
  const panel = useRef(null);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    panel.current?.focus();
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);
  const nights = nightsBetween(stay.checkIn, stay.checkOut);
  const nightly = Math.round(hotel.price * roomTypes[room][1]);
  const subtotal = nightly * nights * stay.rooms;
  const taxes = subtotal * TAX_RATE;
  const total = subtotal + taxes;
  const confirm = (e) => {
    e.preventDefault();
    const name = new FormData(e.target).get('name');
    const ref = `TG-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    setDone({ ref, name });
    notify({ type: 'checkin', key: `checkin-${ref}`, link: '/hotels', title: `Check-in reminder: ${hotel.name}`, body: `Check in on ${niceDate(stay.checkIn)} from 2:00 PM, ${nights} ${nights === 1 ? 'night' : 'nights'}. Booking ${ref}.` });
  };

  return <motion.div className="booking-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <motion.aside ref={panel} tabIndex={-1} className="booking-panel" role="dialog" aria-modal="true" aria-label={`Book ${hotel.name}`} initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }} transition={{ duration: 0.25 }}>
      <button className="panel-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
      <Carousel className="panel-carousel" label={`Photos of ${hotel.name}`} slides={[hotel.image, ...hotelImages.filter((id) => id !== hotel.image).slice(hotel.stars, hotel.stars + 3)].map((id, i) => ({ src: imageUrl(id, 900), alt: `${hotel.name} photo ${i + 1}` }))} />
      <div className="panel-hotel"><div><Stars count={hotel.stars} /><h2>{hotel.name}</h2><p><MapPin size={13} /> {hotel.area}, {placeName(hotel.slug)}</p></div></div>
      <div className="panel-stay">
        <div><span>Check-in</span><strong>{niceDate(stay.checkIn)}</strong></div>
        <div><span>Check-out</span><strong>{niceDate(stay.checkOut)}</strong></div>
        <div><span>Guests</span><strong>{stay.guests} · {stay.rooms} {stay.rooms === 1 ? 'room' : 'rooms'}</strong></div>
      </div>
      {done ? <div className="panel-done">
        <div className="success-icon"><Check size={28} /></div>
        <h3>You’re booked, {done.name.split(' ')[0]}!</h3>
        <p>Booking reference <strong>{done.ref}</strong>. A confirmation is on its way to your inbox.</p>
        <div className="panel-total"><span>Total paid at the hotel</span><strong>{money(total)}</strong></div>
        <div className="panel-actions"><button className="button button-dark" onClick={onClose}>Done</button><Link to="/trips" className="button button-outline">View my trips</Link></div>
      </div> : <form onSubmit={confirm}>
        <fieldset className="room-options"><legend>Choose your room</legend>{roomTypes.map(([label, factor], i) => <label key={label} className={room === i ? 'room-picked' : ''}>
          <input type="radio" name="room" checked={room === i} onChange={() => setRoom(i)} /><BedDouble size={17} /><span>{label}<small>{hotel.breakfast ? 'Breakfast included' : 'Room only'}</small></span><strong>{money(hotel.price * factor)}<small>/ night</small></strong>
        </label>)}</fieldset>
        <div className="panel-fields">
          <label>Full name<input name="name" required autoComplete="name" placeholder="As shown on your ID" /></label>
          <label>Email<input name="email" type="email" required autoComplete="email" placeholder="you@example.com" /></label>
          <label>Phone<input name="phone" type="tel" required autoComplete="tel" placeholder="+91 98765 43210" /></label>
          <label>Special requests <small>(optional)</small><textarea name="notes" rows="2" placeholder="Early check-in, a quiet room…" /></label>
        </div>
        <div className="panel-price">
          <div><span>{money(nightly)} × {nights} {nights === 1 ? 'night' : 'nights'}{stay.rooms > 1 ? ` × ${stay.rooms} rooms` : ''}</span><span>{money(subtotal)}</span></div>
          <div><span>Taxes & fees (12%)</span><span>{money(taxes)}</span></div>
          <div className="panel-total"><span>Total</span><strong>{money(total)}</strong></div>
        </div>
        <p className={`panel-policy ${hotel.freeCancel ? 'policy-free' : ''}`}>{hotel.freeCancel ? <><ShieldCheck size={15} /> Free cancellation until 48 hours before check-in. Pay at the hotel.</> : <><X size={15} /> Non-refundable rate. Pay at the hotel.</>}</p>
        <button className="button button-dark full-button">Confirm booking <ArrowRight size={16} /></button>
      </form>}
    </motion.aside>
  </motion.div>;
}

export default function Hotels() {
  const [params] = useSearchParams();
  const startSlug = destinations.some((d) => d.slug === params.get('destination')) ? params.get('destination') : 'all';
  const [form, setForm] = useState({ slug: startSlug, checkIn: todayISO(14), checkOut: todayISO(17), guests: 2, rooms: 1 });
  const [stay, setStay] = useState(form);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef();
  useEffect(() => () => clearTimeout(searchTimer.current), []);
  const [filters, setFilters] = useState(noFilters);
  const [sort, setSort] = useState('recommended');
  const [showFilters, setShowFilters] = useState(false);
  const [booking, setBooking] = useState(null);
  const closeBooking = useCallback(() => setBooking(null), []);
  const update = (key, value) => setForm((f) => {
    const next = { ...f, [key]: value };
    if (key === 'checkIn' && next.checkOut <= value) next.checkOut = addDays(value, 1);
    return next;
  });

  const nights = nightsBetween(stay.checkIn, stay.checkOut);
  const inPlace = hotels.filter((h) => stay.slug === 'all' || h.slug === stay.slug);
  const passes = (h, skip) => (skip === 'stars' || !filters.stars.length || filters.stars.includes(h.stars))
    && h.score >= filters.minScore && (filters.maxPrice >= PRICE_MAX || h.price <= filters.maxPrice)
    && amenities.every(([key]) => key === skip || !filters[key] || h[key]);
  const sorters = { recommended: (a, b) => (b.score * 10 - b.price / 100) - (a.score * 10 - a.price / 100), 'price-asc': (a, b) => a.price - b.price, 'price-desc': (a, b) => b.price - a.price, rating: (a, b) => b.score - a.score || b.reviews - a.reviews };
  const results = inPlace.filter((h) => passes(h)).sort(sorters[sort]);
  // How many hotels would match if each amenity were switched on.
  const counts = Object.fromEntries(amenities.map(([key]) => [key, inPlace.filter((h) => passes(h, key) && h[key]).length]));
  const activeCount = filters.stars.length + (filters.minScore ? 1 : 0) + (filters.maxPrice < PRICE_MAX ? 1 : 0) + amenities.filter(([key]) => filters[key]).length;

  return <main className="inner-page hotels-page">
    <div className="page-intro"><p className="eyebrow">HOTEL BOOKING</p><h1>Stay somewhere <em>memorable.</em></h1><p>Handpicked hotels, honest prices, and free cancellation on most rooms.</p></div>

    <form className="hotel-search" onSubmit={(e) => { e.preventDefault(); setStay(form); setSearching(true); clearTimeout(searchTimer.current); searchTimer.current = setTimeout(() => setSearching(false), 600); }}>
      <label className="flight-field"><span className="field-label">Destination</span><div className="planner-input"><MapPin size={16} /><select value={form.slug} onChange={(e) => update('slug', e.target.value)}><option value="all">All destinations</option>{destinations.map((d) => <option key={d.slug} value={d.slug}>{d.name}, {d.country}</option>)}</select></div></label>
      <label className="flight-field"><span className="field-label">Check-in</span><div className="planner-input"><CalendarDays size={16} /><input type="date" required min={todayISO()} value={form.checkIn} onChange={(e) => update('checkIn', e.target.value)} /></div></label>
      <label className="flight-field"><span className="field-label">Check-out</span><div className="planner-input"><CalendarDays size={16} /><input type="date" required min={addDays(form.checkIn, 1)} value={form.checkOut} onChange={(e) => update('checkOut', e.target.value)} /></div></label>
      <div className="flight-field"><span className="field-label">Guests & rooms</span><div className="planner-input hotel-pax"><Users size={16} />
        <div className="stepper"><button type="button" aria-label="Fewer guests" onClick={() => update('guests', Math.max(1, form.guests - 1))}><Minus size={12} /></button><strong>{form.guests}</strong><button type="button" aria-label="More guests" onClick={() => update('guests', Math.min(12, form.guests + 1))}><Plus size={12} /></button></div>
        <BedDouble size={16} />
        <div className="stepper"><button type="button" aria-label="Fewer rooms" onClick={() => update('rooms', Math.max(1, form.rooms - 1))}><Minus size={12} /></button><strong>{form.rooms}</strong><button type="button" aria-label="More rooms" onClick={() => update('rooms', Math.min(6, form.rooms + 1))}><Plus size={12} /></button></div>
      </div></div>
      <button className="button flight-search-button"><Search size={17} /> Search</button>
    </form>

    <div className="hotels-layout">
      <aside className={`hotel-sidebar ${showFilters ? 'filters-open' : ''}`}>
        <div className="sidebar-head"><h2>Filters</h2>{activeCount > 0 && <button type="button" className="inline-link" onClick={() => setFilters(noFilters)}>Clear all</button>}<button type="button" className="icon-button sidebar-close" onClick={() => setShowFilters(false)} aria-label="Close filters"><X size={18} /></button></div>
        <Filters filters={filters} setFilters={setFilters} counts={counts} />
        <button type="button" className="button button-dark full-button sidebar-apply" onClick={() => setShowFilters(false)}>Show {results.length} hotels</button>
      </aside>

      <div className="hotel-results">
        <div className="listing-toolbar">
          <span><strong>{results.length}</strong> {results.length === 1 ? 'hotel' : 'hotels'} {stay.slug === 'all' ? 'across all destinations' : `in ${placeName(stay.slug)}`} · {nights} {nights === 1 ? 'night' : 'nights'}</span>
          <button type="button" className="filter-button mobile-filters" onClick={() => setShowFilters(true)}><SlidersHorizontal size={15} /> Filters{activeCount ? ` (${activeCount})` : ''}</button>
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort hotels">{sorts.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
        </div>
        {searching ? <div className="hotel-list">{[0, 1, 2].map((i) => <div className="hotel-card hotel-skeleton" key={i}><div className="skeleton" /><div><i className="skeleton" /><i className="skeleton" /><i className="skeleton" /></div><div><i className="skeleton" /><i className="skeleton" /></div></div>)}</div> : results.length ? <div className="hotel-list">{results.map((h) => <article className="hotel-card" key={h.id}>
          <div className="hotel-photo"><img src={imageUrl(h.image, 700)} alt="" loading="lazy" />{h.freeCancel && <span className="package-label">Free cancellation</span>}</div>
          <div className="hotel-info">
            <Stars count={h.stars} />
            <h3>{h.name}</h3>
            <p className="hotel-area"><MapPin size={13} /> {h.area}, {placeName(h.slug)}</p>
            <ul className="hotel-amenities">{amenities.filter(([key]) => h[key]).map(([key, label, Icon]) => <li key={key} className={key === 'freeCancel' ? 'amenity-good' : ''}><Icon size={13} /> {label}</li>)}</ul>
          </div>
          <div className="hotel-book">
            <div className="hotel-score"><span><strong>{scoreLabel(h.score)}</strong><small>{h.reviews.toLocaleString('en-US')} reviews</small></span><b>{h.score.toFixed(1)}</b></div>
            <div className="hotel-price"><strong>{money(h.price)}</strong><small>per night</small><small>{money(h.price * nights * stay.rooms)} for {nights} {nights === 1 ? 'night' : 'nights'}{stay.rooms > 1 ? `, ${stay.rooms} rooms` : ''}</small></div>
            <button className="button button-dark" onClick={() => setBooking(h)}>Reserve <ArrowRight size={14} /></button>
          </div>
        </article>)}</div> : <div className="planner-empty"><SearchX size={26} /><h3>No hotels match your filters</h3><p>Try a higher price limit or fewer amenities.</p><button className="inline-link" onClick={() => setFilters(noFilters)}>Clear all filters</button></div>}
        <p className="mock-data-note">Sample rates and availability for demonstration. Photos are illustrative.</p>
      </div>
    </div>

    <AnimatePresence>{booking && <BookingPanel key={booking.id} hotel={booking} stay={stay} onClose={closeBooking} />}</AnimatePresence>
  </main>;
}
