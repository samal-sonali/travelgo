import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Heart, Star } from 'lucide-react';
import { imageUrl } from './data/travel.js';

export function ImageCard({ item, type = 'destination', onSave }) {
  const [liked, setLiked] = useState(false);
  const image = imageUrl(item.image, 900);
  if (type === 'stay') return <article className="stay-card">
    <div className="card-image stay-image"><img src={image} alt={item.name} loading="lazy" /><button className={`heart-button ${liked ? 'is-liked' : ''}`} onClick={() => { setLiked(!liked); onSave?.(item.name); }} aria-label="Save to wishlist"><Heart size={18} fill={liked ? 'currentColor' : 'none'} /></button><span className="image-label">{item.category}</span></div>
    <div className="stay-info"><div><h3>{item.name}</h3><p>{item.location}</p></div><span className="rating"><Star size={14} fill="currentColor" /> {item.rating}</span></div>
    <p className="stay-price"><strong>{item.price}</strong> <span>/ night</span></p>
  </article>;
  if (type === 'package') return <article className="package-card"><div className="package-image"><img src={image} alt={item.name} loading="lazy" /><span className="package-label">{item.label}</span><button className={`heart-button ${liked ? 'is-liked' : ''}`} onClick={() => setLiked(!liked)} aria-label="Save package"><Heart size={18} fill={liked ? 'currentColor' : 'none'} /></button></div><div className="package-content"><p className="eyebrow">{item.place}</p><h3>{item.name}</h3><div className="package-bottom"><span>{item.days}{item.rating && <span className="rating"><Star size={12} fill="currentColor" /> {item.rating}</span>}</span><strong>from {item.price}</strong></div></div></article>;
  return <Link to="/destinations" className="destination-card"><img src={image} alt={item.name} loading="lazy" /><div className="destination-overlay"><span>{item.tag}</span><h3>{item.name}</h3><p>{item.country} <span>·</span> from {item.price}</p></div><span className="destination-arrow"><ArrowUpRight size={19} /></span></Link>;
}

export function FlightCard({ flight }) {
  return <article className="flight-card"><div className="airline-mark">{flight.mark}</div><div className="flight-airline"><strong>{flight.airline}</strong><span>{flight.code} · Economy</span></div><div className="flight-time"><strong>{flight.departure}</strong><span>{flight.from}</span></div><div className="flight-duration"><span>{flight.duration}</span><i /><span>{flight.stops}</span></div><div className="flight-time"><strong>{flight.arrival}</strong><span>{flight.to}</span></div><div className="flight-price"><strong>{flight.price}</strong><span>/ person</span></div><Link to="/booking" className="button button-dark">Select <ArrowRight size={14} /></Link></article>;
}

export function SectionHeading({ eyebrow, title, text, link = 'View all', to = '/destinations' }) {
  return <div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{text && <p className="section-description">{text}</p>}</div>{link && <Link to={to} className="text-link">{link}<ArrowRight size={16} /></Link>}</div>;
}

export function Newsletter() {
  const [done, setDone] = useState(false);
  return <section className="newsletter"><div><p className="eyebrow">A NOTE FROM SOMEWHERE</p><h2>A little inspiration,<br /><em>delivered.</em></h2><p>New places, thoughtful guides, and the occasional very good offer. No noise, ever.</p></div><form onSubmit={(e) => { e.preventDefault(); setDone(true); }}><label htmlFor="newsletter-email">Your email address</label><div className="newsletter-input"><input id="newsletter-email" type="email" required placeholder="you@example.com" /><button aria-label="Subscribe"><ArrowRight size={18} /></button></div><small>{done ? 'You’re on the list. Keep an eye on your inbox!' : 'By subscribing, you agree to our privacy policy.'}</small></form></section>;
}
