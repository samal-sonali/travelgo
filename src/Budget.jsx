import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, ArrowRight, BedDouble, CalendarDays, Check, Plane, RotateCcw, ShoppingBag, Sparkles, Train, Users, UtensilsCrossed, Wallet } from 'lucide-react';

// Fixed order: each category keeps its colour no matter which ones have values.
const categories = [
  { key: 'flights', label: 'Flights', icon: Plane, color: '#2a78d6', hint: 'Return tickets for everyone' },
  { key: 'hotel', label: 'Hotel', icon: BedDouble, color: '#eb6834', hint: 'All nights, all rooms' },
  { key: 'food', label: 'Food', icon: UtensilsCrossed, color: '#1baf7a', hint: 'Meals, snacks and drinks' },
  { key: 'transport', label: 'Transport', icon: Train, color: '#eda100', hint: 'Transfers, trains, taxis' },
  { key: 'shopping', label: 'Shopping', icon: ShoppingBag, color: '#e87ba4', hint: 'Souvenirs and treats' },
];
const fields = ['budget', 'days', 'people', ...categories.map((c) => c.key)];
const defaults = { budget: '3000', days: '5', people: '2', flights: '', hotel: '', food: '', transport: '', shopping: '' };
const STORAGE_KEY = 'travelgo-budget';
const money = (n) => `${n < 0 ? '-' : ''}$${Math.abs(Math.round(n)).toLocaleString('en-US')}`;
const num = (v) => Math.max(0, Number(v) || 0);

function loadValues(params) {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { saved = {}; }
  const fromLink = Object.fromEntries(fields.filter((f) => params.has(f)).map((f) => [f, params.get(f)]));
  return { ...defaults, ...saved, ...fromLink };
}

function Breakdown({ items, total }) {
  const [active, setActive] = useState(null);
  const shown = items.filter((c) => c.value > 0);
  if (!total) return <p className="budget-empty">Enter your costs to see where your money goes.</p>;
  let offset = 0;
  return <div className="breakdown">
    <div className="breakdown-bar" onMouseLeave={() => setActive(null)}>
      {shown.map((c) => {
        const share = (c.value / total) * 100;
        const center = offset + share / 2;
        offset += share;
        const edge = center > 80 ? 'tip-right' : center < 20 ? 'tip-left' : '';
        return <div key={c.key} className={`breakdown-seg ${active && active !== c.key ? 'is-dim' : ''}`} style={{ width: `${share}%`, background: c.color }} onMouseEnter={() => setActive(c.key)} onFocus={() => setActive(c.key)} onBlur={() => setActive(null)} tabIndex={0} aria-label={`${c.label}: ${money(c.value)}, ${Math.round(share)}%`}>
          {active === c.key && <span className={`breakdown-tip ${edge}`}><strong>{c.label}</strong>{money(c.value)} · {Math.round(share)}%</span>}
        </div>;
      })}
    </div>
    <table className="breakdown-table">
      <thead><tr><th>Category</th><th>Amount</th><th>Share</th><th>Per day</th></tr></thead>
      <tbody>{items.map((c) => <tr key={c.key} className={active === c.key ? 'is-active' : ''} onMouseEnter={() => c.value && setActive(c.key)} onMouseLeave={() => setActive(null)}>
        <td><span className="swatch" style={{ background: c.color }} />{c.label}</td>
        <td>{money(c.value)}</td>
        <td>{total ? Math.round((c.value / total) * 100) : 0}%</td>
        <td>{money(c.perDay)}</td>
      </tr>)}</tbody>
    </table>
  </div>;
}

export default function Budget() {
  const [params] = useSearchParams();
  const [values, setValues] = useState(() => loadValues(params));
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(values)); }, [values]);
  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  const budget = num(values.budget);
  const days = Math.max(1, Math.round(num(values.days)) || 1);
  const people = Math.max(1, Math.round(num(values.people)) || 1);
  const items = categories.map((c) => ({ ...c, value: num(values[c.key]), perDay: num(values[c.key]) / days }));
  const total = items.reduce((sum, c) => sum + c.value, 0);
  const remaining = budget - total;
  const daily = total / days;
  const allowance = budget / days;
  const used = budget ? Math.min((total / budget) * 100, 100) : 0;
  const over = remaining < 0;
  const biggest = [...items].sort((a, b) => b.value - a.value)[0];

  return <main className="inner-page budget-page">
    <div className="page-intro"><p className="eyebrow">BUDGET CALCULATOR</p><h1>Know where <em>every dollar goes.</em></h1><p>Add up your trip costs and see your total, what’s left, and what you’re spending each day.</p></div>
    <div className="budget-layout">
      <form className="budget-form" onSubmit={(e) => e.preventDefault()}>
        <div className="budget-trip">
          <label>Total budget<div className="planner-input"><Wallet size={16} /><input type="number" min="0" inputMode="decimal" value={values.budget} onChange={set('budget')} /></div></label>
          <div className="budget-pair">
            <label>Days<div className="planner-input"><CalendarDays size={16} /><input type="number" min="1" value={values.days} onChange={set('days')} /></div></label>
            <label>Travellers<div className="planner-input"><Users size={16} /><input type="number" min="1" value={values.people} onChange={set('people')} /></div></label>
          </div>
        </div>
        <p className="budget-form-title">Your costs (USD, whole trip)</p>
        {categories.map(({ key, label, icon: Icon, color, hint }) => <label key={key} className="cost-input">
          <span className="cost-label"><span className="swatch" style={{ background: color }} />{label}<small>{hint}</small></span>
          <div className="planner-input"><Icon size={16} /><span className="currency">$</span><input type="number" min="0" inputMode="decimal" placeholder="0" value={values[key]} onChange={set(key)} /></div>
        </label>)}
        <button type="button" className="budget-reset" onClick={() => setValues(defaults)}><RotateCcw size={14} /> Clear all</button>
      </form>

      <div className="budget-results">
        <div className="budget-stats">
          <div className="budget-stat"><span>Total cost</span><strong>{money(total)}</strong><small>{money(total / people)} per person</small></div>
          <div className={`budget-stat ${over ? 'stat-over' : 'stat-ok'}`}><span>Remaining budget</span><strong>{money(remaining)}</strong><small>{over ? <><AlertTriangle size={13} /> Over budget</> : <><Check size={13} /> On track</>}</small></div>
          <div className="budget-stat"><span>Daily spending</span><strong>{money(daily)}</strong><small>Allowance: {money(allowance)} / day</small></div>
        </div>

        <div className="budget-meter">
          <div className="meter-label"><span>Budget used</span><strong>{budget ? Math.round((total / budget) * 100) : 0}%</strong></div>
          <div className="meter-track"><div className={`meter-fill ${over ? 'meter-over' : ''}`} style={{ width: `${used}%` }} /></div>
          <div className="meter-scale"><span>{money(0)}</span><span>{money(budget)}</span></div>
        </div>

        <section className="budget-card"><h2>Where your money goes</h2><Breakdown items={items} total={total} /></section>

        {total > 0 && <div className="planner-tips">
          <p><Sparkles size={15} /> <span><strong>{biggest.label}</strong> is your biggest cost at {Math.round((biggest.value / total) * 100)}% of the trip.</span></p>
          <p>{over ? <AlertTriangle size={15} /> : <Check size={15} />} <span>{over ? <>You’re {money(-remaining)} over. Trimming about {money(-remaining / days)} a day would bring you back on budget.</> : <>You have {money(remaining)} spare, or {money(remaining / days)} a day for extras.</>}</span></p>
        </div>}

        <div className="plan-actions"><Link to="/planner" className="button button-dark">Plan a trip with AI <ArrowRight size={16} /></Link><span>Saved on this device automatically.</span></div>
      </div>
    </div>
  </main>;
}
