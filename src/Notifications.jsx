import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BedDouble, Bell, BellOff, BellRing, Check, CloudLightning, Plane, Tag, TrendingDown, Trash2, X } from 'lucide-react';
import { destinations } from './data/travel.js';
import { findAirport } from './flightSearch.js';
import {
  checkWeather, clearNotifications, enableBrowserAlerts, markAllRead, markRead, notify, removeNotification, removeWatch, setPref, useNotifications,
} from './notifications.js';

export const notificationTypes = {
  price: { label: 'Price drops', icon: TrendingDown, text: 'Cheaper fares on routes you track' },
  flight: { label: 'Flight reminders', icon: Plane, text: 'Departure and check-in times for flights you select' },
  checkin: { label: 'Check-in reminders', icon: BedDouble, text: 'Hotel check-in details for your bookings' },
  weather: { label: 'Weather alerts', icon: CloudLightning, text: 'Storms, heavy rain, heat or strong wind' },
  deal: { label: 'Holiday deals', icon: Tag, text: 'One hand-picked offer each week' },
};

function timeAgo(time) {
  const minutes = Math.round((Date.now() - time) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'Yesterday' : `${days} days ago`;
}

function NotificationItem({ item, compact, onOpen }) {
  const { icon: Icon } = notificationTypes[item.type];
  return <li className={`notice notice-${item.type} ${item.read ? '' : 'notice-unread'}`}>
    <span className="notice-icon"><Icon size={16} /></span>
    <Link to={item.link || '/notifications'} className="notice-body" onClick={() => { markRead(item.id); onOpen?.(); }}>
      <strong>{item.title}{item.sample && <em>Example</em>}</strong>
      <p>{item.body}</p>
      <span>{timeAgo(item.time)}</span>
    </Link>
    {!compact && <div className="notice-actions">
      {!item.read && <button onClick={() => markRead(item.id)} aria-label="Mark as read"><Check size={14} /></button>}
      <button onClick={() => removeNotification(item.id)} aria-label="Dismiss"><X size={14} /></button>
    </div>}
    {!item.read && <i className="unread-dot" aria-label="Unread" />}
  </li>;
}

export function NotificationBell() {
  const { items } = useNotifications();
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  const unread = items.filter((n) => !n.read).length;
  const [ringing, setRinging] = useState(false);
  const lastUnread = useRef(unread);
  useEffect(() => {
    if (unread <= lastUnread.current) { lastUnread.current = unread; return undefined; }
    lastUnread.current = unread;
    setRinging(true);
    const id = setTimeout(() => setRinging(false), 900);
    return () => clearTimeout(id);
  }, [unread]);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (!box.current?.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, [open]);
  return <div className="bell-wrap" ref={box}>
    <button className={`icon-button bell-button ${ringing ? 'is-ringing' : ''}`} onClick={() => setOpen(!open)} aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} aria-expanded={open}>
      <Bell size={18} />{unread > 0 && <span className="bell-count">{unread > 9 ? '9+' : unread}</span>}
    </button>
    {open && <div className="bell-panel glass">
      <div className="bell-head"><strong>Notifications</strong>{unread > 0 && <button className="inline-link" onClick={markAllRead}>Mark all read</button>}</div>
      {items.length ? <ul className="notice-list">{items.slice(0, 5).map((n) => <NotificationItem key={n.id} item={n} compact onOpen={() => setOpen(false)} />)}</ul> : <p className="bell-empty">You’re all caught up.</p>}
      <Link to="/notifications" className="bell-all" onClick={() => setOpen(false)}>See all notifications</Link>
    </div>}
  </div>;
}

export default function NotificationsPage() {
  const { items, prefs, watches } = useNotifications();
  const [filter, setFilter] = useState('all');
  const [permission, setPermission] = useState(() => ('Notification' in window ? Notification.permission : 'unsupported'));
  const [checking, setChecking] = useState(false);
  const shown = items.filter((n) => filter === 'all' || n.type === filter);
  const unread = items.filter((n) => !n.read).length;

  const toggleBrowser = async () => {
    if (prefs.browser) { setPref('browser', false); return; }
    setPermission(await enableBrowserAlerts());
  };
  const changePlace = async (slug) => { setPref('weatherPlace', slug); setChecking(true); await checkWeather(slug); setChecking(false); };

  return <main className="inner-page notifications-page">
    <div className="page-intro"><p className="eyebrow">NOTIFICATIONS</p><h1>Never miss <em>a good moment.</em></h1><p>Price drops, trip reminders, weather alerts and deals, all in one place.</p></div>
    <div className="notify-layout">
      <section className="notify-feed">
        <div className="notify-toolbar">
          <div className="type-chips">
            <button className={filter === 'all' ? 'chip-active' : ''} onClick={() => setFilter('all')}>All{unread ? ` (${unread})` : ''}</button>
            {Object.entries(notificationTypes).map(([key, { label }]) => <button key={key} className={filter === key ? 'chip-active' : ''} onClick={() => setFilter(key)}>{label}</button>)}
          </div>
          <div className="notify-bulk">{unread > 0 && <button className="inline-link" onClick={markAllRead}>Mark all read</button>}{items.length > 0 && <button className="inline-link" onClick={clearNotifications}>Clear all</button>}</div>
        </div>
        {shown.length ? <ul className="notice-list notice-page-list">{shown.map((n) => <NotificationItem key={n.id} item={n} />)}</ul> : <div className="planner-empty"><BellOff size={26} /><h3>Nothing here yet</h3><p>{filter === 'all' ? 'New alerts will show up here.' : `${notificationTypes[filter].text} will appear here.`}</p></div>}
      </section>

      <aside className="notify-settings">
        <h2>Alert settings</h2>
        {Object.entries(notificationTypes).map(([key, { label, icon: Icon, text }]) => <label key={key} className="switch-row">
          <span className={`notice-icon notice-${key}`}><Icon size={15} /></span>
          <span><strong>{label}</strong><small>{text}</small></span>
          <input type="checkbox" role="switch" checked={prefs[key]} onChange={(e) => setPref(key, e.target.checked)} /><i className="switch" aria-hidden="true" />
        </label>)}

        <div className="settings-block">
          <h3>Weather alerts for</h3>
          <div className="planner-input"><CloudLightning size={15} /><select value={prefs.weatherPlace} onChange={(e) => changePlace(e.target.value)} disabled={!prefs.weather}>{destinations.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}</select></div>
          <small>{checking ? 'Checking the live forecast…' : 'Uses the live 7-day forecast. Checked hourly while you browse.'}</small>
        </div>

        <div className="settings-block">
          <h3>Tracked flight prices</h3>
          {watches.length ? <ul className="watch-list">{watches.map((w) => <li key={w.id}><TrendingDown size={14} /><span>{findAirport(w.from).city} → {findAirport(w.to).city}<small>{new Date(`${w.date}T12:00`).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} · from ${w.price}</small></span><button onClick={() => removeWatch(w.id)} aria-label="Stop tracking"><Trash2 size={14} /></button></li>)}</ul>
            : <small>No routes yet. Tap <strong>Track prices</strong> on any <Link className="inline-link" to="/flights">flight search</Link>.</small>}
        </div>

        <div className="settings-block">
          <h3>Desktop notifications</h3>
          {permission === 'unsupported' ? <small>Your browser doesn’t support desktop notifications.</small>
            : permission === 'denied' ? <small>Notifications are blocked. Allow them in your browser’s site settings to turn this on.</small>
              : <button className={`button ${prefs.browser ? 'button-outline' : 'button-dark'} full-button`} onClick={toggleBrowser}>{prefs.browser ? <><BellOff size={16} /> Turn off desktop alerts</> : <><BellRing size={16} /> Turn on desktop alerts</>}</button>}
          {prefs.browser && <button className="inline-link test-link" onClick={() => notify({ type: 'deal', key: `test-${Date.now()}`, title: 'Test notification', body: 'Desktop alerts are working. Happy travels!', link: '/notifications' })}>Send a test alert</button>}
        </div>
      </aside>
    </div>
  </main>;
}
