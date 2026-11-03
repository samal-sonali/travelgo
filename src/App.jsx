import React, { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDown, ArrowLeftRight, ArrowRight, ArrowUpRight, Bell, CalendarDays, Check, ChevronDown,
  Compass, CreditCard, Heart, Hotel, Menu, Plane, Search, ShieldCheck, SlidersHorizontal,
  Sparkles, Star, Sun, Users, X,
} from 'lucide-react';
import { destinations, flights, imageUrl, packages, stays } from './data/travel.js';

const navItems = [['Explore', '/'], ['Stays', '/hotels'], ['Flights', '/flights'], ['Experiences', '/packages'], ['About us', '/about']];

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);
  return (
    <header className={`site-header ${dark ? 'dark-header' : ''}`}>
      <div className="nav-shell">
        <Link to="/" className="brand" aria-label="TravelGo home"><span className="brand-mark"><Compass size={19} /></span>travelgo<span className="brand-period">.</span></Link>
        <nav className={`main-nav ${menuOpen ? 'nav-open' : ''}`}>
          {navItems.map(([label, path]) => <NavLink key={label} to={path} end={path === '/'} onClick={() => setMenuOpen(false)}>{label}</NavLink>)}
          <div className="mobile-nav-actions"><Link className="button button-dark" to="/login">Sign in <ArrowRight size={15} /></Link></div>
        </nav>
        <div className="nav-actions">
          <button className="icon-button mode-button" onClick={() => setDark(!dark)} aria-label="Toggle dark mode"><Sun size={18} /></button>
          <Link className="sign-in" to="/login">Sign in</Link>
          <Link className="button button-dark nav-cta" to="/trips">My trips <ArrowRight size={15} /></Link>
        </div>
        <button className="icon-button menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X /> : <Menu />}</button>
      </div>
    </header>
  );
}

function SearchWidget() {
  const [active, setActive] = useState('Stays');
  const [searched, setSearched] = useState(false);
  return (
    <div className="search-card">
      <div className="search-tabs">
        {[['Stays', Hotel], ['Flights', Plane], ['Packages', Compass]].map(([label, Icon]) =>
          <button key={label} onClick={() => setActive(label)} className={`search-tab ${active === label ? 'selected' : ''}`}><Icon size={17} />{label}</button>)}
        <span className="search-note"><ShieldCheck size={14} /> Best price, always</span>
      </div>
      <div className="search-fields">
        <label className="search-field destination-field"><span>{active === 'Flights' ? 'Flying to' : 'Where to?'}</span><div><Search size={17} /><input placeholder="Search destinations" /></div></label>
        {active === 'Flights' && <button className="swap-button" aria-label="Swap origin and destination"><ArrowLeftRight size={16} /></button>}
        <label className="search-field"><span>Check in — out</span><div><CalendarDays size={17} /><input placeholder="Add dates" onFocus={(event) => { event.target.type = 'date'; }} /></div></label>
        <label className="search-field guests-field"><span>Who’s coming?</span><div><Users size={17} /><select defaultValue=""><option value="" disabled>2 guests</option><option>1 guest</option><option>2 guests</option><option>3 guests</option><option>4+ guests</option></select><ChevronDown size={15} /></div></label>
        <button className="button search-button" onClick={() => setSearched(true)}><Search size={18} /><span>Explore</span></button>
      </div>
      {searched && <p className="search-feedback"><Check size={14} /> Your next great trip is just below.</p>}
    </div>
  );
}

function ImageCard({ item, type = 'destination', saved, onSave }) {
  const [liked, setLiked] = useState(false);
  const image = imageUrl(item.image, 900);
  if (type === 'stay') return <article className="stay-card">
    <div className="card-image stay-image"><img src={image} alt={item.name} loading="lazy" /><button className={`heart-button ${liked ? 'is-liked' : ''}`} onClick={() => { setLiked(!liked); onSave?.(item.name); }} aria-label="Save to wishlist"><Heart size={18} fill={liked ? 'currentColor' : 'none'} /></button><span className="image-label">{item.category}</span></div>
    <div className="stay-info"><div><h3>{item.name}</h3><p>{item.location}</p></div><span className="rating"><Star size={14} fill="currentColor" /> {item.rating}</span></div>
    <p className="stay-price"><strong>{item.price}</strong> <span>/ night</span></p>
  </article>;
  if (type === 'package') return <article className="package-card"><div className="package-image"><img src={image} alt={item.name} loading="lazy" /><span className="package-label">{item.label}</span><button className={`heart-button ${liked ? 'is-liked' : ''}`} onClick={() => setLiked(!liked)} aria-label="Save package"><Heart size={18} fill={liked ? 'currentColor' : 'none'} /></button></div><div className="package-content"><p className="eyebrow">{item.place}</p><h3>{item.name}</h3><div className="package-bottom"><span>{item.days}</span><strong>from {item.price}</strong></div></div></article>;
  return <Link to="/destinations" className="destination-card"><img src={image} alt={item.name} loading="lazy" /><div className="destination-overlay"><span>{item.tag}</span><h3>{item.name}</h3><p>{item.country} <span>·</span> from {item.price}</p></div><span className="destination-arrow"><ArrowUpRight size={19} /></span></Link>;
}

function FlightCard({ flight }) {
  return <article className="flight-card"><div className="airline-mark">{flight.mark}</div><div className="flight-airline"><strong>{flight.airline}</strong><span>{flight.code} · Economy</span></div><div className="flight-time"><strong>{flight.departure}</strong><span>{flight.from}</span></div><div className="flight-duration"><span>{flight.duration}</span><i /><span>{flight.stops}</span></div><div className="flight-time"><strong>{flight.arrival}</strong><span>{flight.to}</span></div><div className="flight-price"><strong>{flight.price}</strong><span>/ person</span></div><Link to="/booking" className="button button-dark">Select <ArrowRight size={14} /></Link></article>;
}

function SectionHeading({ eyebrow, title, text, link = 'View all' }) {
  return <div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{text && <p className="section-description">{text}</p>}</div><Link to="/destinations" className="text-link">{link}<ArrowRight size={16} /></Link></div>;
}

function Home() {
  return <>
    <section className="hero">
      <div className="hero-image" />
      <div className="hero-shade" />
      <div className="hero-content">
        <div className="hero-kicker"><span className="live-dot" /> YOUR NEXT CHAPTER STARTS HERE</div>
        <h1>Find your<br /><em>somewhere.</em></h1>
        <p>Thoughtful trips, beautiful places, and the little moments you’ll talk about for years.</p>
        <div className="hero-pills"><span><Check size={14} /> Handpicked stays</span><span><Check size={14} /> Local-first experiences</span></div>
      </div>
      <div className="hero-caption"><span>01 / 04</span><span className="caption-rule" /><span>Praiano, Amalfi Coast</span></div>
      <div className="hero-bottom"><span>SCROLL TO EXPLORE</span><ArrowDown size={16} /></div>
    </section>
    <div className="search-wrap"><SearchWidget /></div>
    <main>
      <section className="content-section destinations-section">
        <div className="section-topline"><SectionHeading eyebrow="A LITTLE INSPIRATION" title={<>Somewhere <em>special.</em></>} text="The places our well-travelled community can’t stop talking about." /><div className="carousel-controls"><button aria-label="Previous destinations"><ArrowRight className="flip-arrow" size={17} /></button><button aria-label="Next destinations"><ArrowRight size={17} /></button></div></div>
        <div className="destination-grid">{destinations.map((item) => <ImageCard item={item} key={item.name} />)}</div>
      </section>
      <section className="content-section stay-section"><SectionHeading eyebrow="STAY A LITTLE LONGER" title={<>Places worth <em>checking in.</em></>} text="Not just a room for the night. A reason to love where you wake up." /><div className="stay-grid">{stays.map((item) => <ImageCard item={item} type="stay" key={item.name} />)}</div></section>
      <section className="editorial-banner"><div className="editorial-copy"><p className="eyebrow">THE TRAVELGO WAY</p><h2>Less itinerary.<br /><em>More in the moment.</em></h2><p>We believe the best trips leave a little room for the unexpected. Tell us what moves you, and we’ll take care of the rest.</p><Link to="/about" className="button button-dark">Get to know us <ArrowRight size={16} /></Link></div><div className="editorial-image"><img src={imageUrl('photo-1470770841072-f978cf4d019e', 1200)} alt="Quiet lake surrounded by mountains" loading="lazy" /><div className="image-stamp"><Sparkles size={17} /><span>Made for<br />the way you travel</span></div></div></section>
      <section className="content-section package-section"><SectionHeading eyebrow="A GOOD PLACE TO START" title={<>A trip with your name <em>on it.</em></>} text="Considered little getaways, with all the good bits already figured out." /><div className="package-grid">{packages.map((item) => <ImageCard item={item} type="package" key={item.name} />)}</div></section>
      <section className="quote-section"><div className="quote-mark">“</div><blockquote>Travel isn’t always about going far. Sometimes it’s about seeing differently.</blockquote><div className="quote-byline"><img src={imageUrl('photo-1534528741775-53994a69daeb', 100)} alt="Portrait of Camille" /><div><strong>Camille R.</strong><span>TravelGo guest, 12 trips and counting</span></div><div className="quote-stars">★★★★★</div></div></section>
      <Newsletter />
    </main>
  </>;
}

function Newsletter() {
  const [done, setDone] = useState(false);
  return <section className="newsletter"><div><p className="eyebrow">A NOTE FROM SOMEWHERE</p><h2>A little inspiration,<br /><em>delivered.</em></h2><p>New places, thoughtful guides, and the occasional very good offer. No noise, ever.</p></div><form onSubmit={(e) => { e.preventDefault(); setDone(true); }}><label htmlFor="newsletter-email">Your email address</label><div className="newsletter-input"><input id="newsletter-email" type="email" required placeholder="you@example.com" /><button aria-label="Subscribe"><ArrowRight size={18} /></button></div><small>{done ? 'You’re on the list. Keep an eye on your inbox!' : 'By subscribing, you agree to our privacy policy.'}</small></form></section>;
}

function Footer() {
  return <footer className="footer"><div className="footer-main"><div className="footer-brand"><Link to="/" className="brand"><span className="brand-mark"><Compass size={18} /></span>travelgo<span className="brand-period">.</span></Link><p>Travel, with a little more feeling.</p></div><div className="footer-column"><strong>Discover</strong><Link to="/destinations">Destinations</Link><Link to="/hotels">Unique stays</Link><Link to="/packages">Our escapes</Link><Link to="/flights">Flights</Link></div><div className="footer-column"><strong>TravelGo</strong><Link to="/about">Our story</Link><Link to="/contact">Get in touch</Link><Link to="/trips">My trips</Link><Link to="/wishlist">Wishlist</Link></div><div className="footer-note"><p>Good trips. Good people.<br />A little more wonder.</p><span>© 2026 TravelGo, thoughtfully made.</span></div></div><div className="footer-bottom"><span>Made for everywhere you’re going.</span><span>Privacy&nbsp;&nbsp; · &nbsp;&nbsp;Terms&nbsp;&nbsp; · &nbsp;&nbsp;Instagram</span></div></footer>;
}

const pageCopy = {
  Flights: ['Find a flight that feels right.', 'Compare handpicked flights and get there without the guesswork.'],
  Hotels: ['Stay somewhere memorable.', 'One-of-a-kind stays, picked for the way you like to travel.'],
  'Holiday Packages': ['Your next escape, all figured out.', 'Thoughtful itineraries with room to make them your own.'],
  Destinations: ['The world is a good place.', 'A few places we think you’ll love getting to know.'],
  'My Trips': ['Your journeys, all together.', 'Every detail, in one easy place.'],
  Wishlist: ['Your someday, saved.', 'All the places you’ve been dreaming about, together.'],
  About: ['Travel should feel like something.', 'We’re here for the moments that make a place stay with you.'],
  Contact: ['We’re just a note away.', 'A real person, ready to help make your next trip a little easier.'],
  Profile: ['A little about you.', 'Your details, preferences, and travel essentials.'],
};
function ListingPage({ title, type }) {
  const items = type === 'stay' ? stays : type === 'package' ? packages : destinations;
  const [filter, setFilter] = useState('Recommended');
  if (type === 'flight') return <main className="inner-page"><div className="page-intro"><p className="eyebrow">A BETTER WAY THERE</p><h1>{pageCopy[title][0]}</h1><p>{pageCopy[title][1]}</p></div><div className="flight-route"><span>London (LHR)</span><ArrowLeftRight size={16} /><span>Somewhere wonderful</span><span className="route-date"><CalendarDays size={15} /> Sep 14 — Sep 21 · 2 travellers</span></div><div className="listing-toolbar"><span>{flights.length} curated flight options</span><button className="filter-button"><SlidersHorizontal size={16} /> Filters</button><select value={filter} onChange={(e) => setFilter(e.target.value)}><option>Recommended</option><option>Price: low to high</option><option>Shortest duration</option></select></div><div className="flight-list">{flights.map((flight) => <FlightCard flight={flight} key={flight.code} />)}</div><p className="mock-data-note">Sample fares shown for demonstration. Final prices may vary.</p></main>;
  return <main className="inner-page"><div className="page-intro"><p className="eyebrow">THE TRAVELGO EDIT</p><h1>{pageCopy[title]?.[0] || title}</h1><p>{pageCopy[title]?.[1]}</p></div><div className="listing-toolbar"><span>{items.length * 8} handpicked {type === 'stay' ? 'stays' : type === 'package' ? 'escapes' : 'places'}</span><button className="filter-button"><SlidersHorizontal size={16} /> Filters</button><select value={filter} onChange={(e) => setFilter(e.target.value)}><option>Recommended</option><option>Price: low to high</option><option>Top rated</option></select></div><div className={`listing-grid ${type === 'stay' ? 'stay-grid' : type === 'package' ? 'package-grid' : 'destination-grid'}`}>{[...items, ...items].map((item, i) => <ImageCard key={`${item.name}-${i}`} item={item} type={type} />)}</div></main>;
}
function DetailPage() {
  return <main className="inner-page detail-page"><Link to="/destinations" className="text-link"><ArrowRight className="flip-arrow" size={16} /> All destinations</Link><div className="detail-heading"><div><p className="eyebrow">ITALY · COASTAL ESCAPE</p><h1>Amalfi, at your own pace.</h1><p>Where the mountains meet the Mediterranean, and the long way round is always the right one.</p></div><Link to="/booking" className="button button-dark">Plan this trip <ArrowRight size={16} /></Link></div><div className="detail-gallery"><img src={imageUrl('photo-1533105079780-92b9be482077', 1200)} alt="Amalfi coast" /><img src={imageUrl('photo-1516483638261-f4dbaf036963', 700)} alt="Italian village" /><img src={imageUrl('photo-1519046904884-53103b34b206', 700)} alt="Mediterranean sea" /></div><div className="detail-columns"><article><h2>A coastline that asks you to slow down.</h2><p>Take the little road that winds along the water. Stop for a long lunch. Find a quiet cove, and stay until the light turns gold. The Amalfi Coast is less a checklist, more a feeling you’ll want to come back to.</p><h3>Good things to do</h3><p>Ferry-hop between Positano and Amalfi, hike the Path of the Gods, or simply find your own patch of coastline. The best days leave plenty of room for nothing at all.</p></article><aside className="weather-card"><Sun size={26} /><span>THE WEATHER, LATELY</span><strong>24° <small>Sunny, with a breeze</small></strong><Link to="/packages">See our Amalfi escapes <ArrowRight size={15} /></Link></aside></div></main>;
}
function BookingPage() {
  const [confirmed, setConfirmed] = useState(false);
  if (confirmed) return <main className="form-page confirmation"><div className="success-icon"><Check size={30} /></div><p className="eyebrow">IT’S OFFICIAL</p><h1>Your next chapter<br /><em>starts here.</em></h1><p>We’ve saved the details. Your trip plan is on its way to your inbox.</p><Link to="/payment" className="button button-dark">Continue to payment <ArrowRight size={16} /></Link></main>;
  return <main className="form-page"><p className="eyebrow">A FEW LITTLE DETAILS</p><h1>Let’s make it <em>yours.</em></h1><p>Tell us a bit about your trip, and we’ll take it from here.</p><form className="booking-form" onSubmit={(e) => { e.preventDefault(); setConfirmed(true); }}><div className="form-row"><label>First and last name<input required placeholder="Your name" /></label><label>Email address<input type="email" required placeholder="you@example.com" /></label></div><div className="form-row"><label>Phone number<input type="tel" required placeholder="+1 (555) 000-0000" /></label><label>When would you like to go?<input type="date" required /></label></div><div className="form-row"><label>Travellers<select><option>2 adults</option><option>1 adult</option><option>2 adults, 1 child</option><option>2 adults, 2 children</option></select></label><label>Anything we should know?<input placeholder="A special occasion, a preference..." /></label></div><div className="form-submit"><p><ShieldCheck size={16} /> Your details are safe with us.</p><button className="button button-dark">Continue <ArrowRight size={16} /></button></div></form></main>;
}
function PaymentPage() {
  const [paid, setPaid] = useState(false);
  return <main className="form-page"><p className="eyebrow">THE LAST LITTLE STEP</p><h1>{paid ? 'You’re all set.' : <>Make it <em>official.</em></>}</h1>{paid ? <div className="confirmation-inline"><Check size={22} /><p>Booking confirmed. A confirmation has been sent to your email.</p><Link to="/trips" className="button button-dark">View my trips <ArrowRight size={16} /></Link></div> : <><p>Your payment is encrypted and secure.</p><div className="payment-summary"><span>Amalfi Coast · 2 guests</span><strong>$1,680.00</strong></div><form className="booking-form" onSubmit={(e) => { e.preventDefault(); setPaid(true); }}><label>Name on card<input required placeholder="Name as it appears on your card" /></label><label>Card number<input required inputMode="numeric" minLength="12" placeholder="0000 0000 0000 0000" /></label><div className="form-row"><label>Expiry date<input required placeholder="MM / YY" /></label><label>Security code<input required placeholder="CVC" /></label></div><button className="button button-dark full-button"><CreditCard size={17} /> Pay $1,680.00</button></form><p className="secure-note"><ShieldCheck size={15} /> Secure checkout · Free cancellation within 48 hours</p></>}</main>;
}
function AuthPage({ register = false }) {
  const [sent, setSent] = useState(false);
  return <main className="form-page auth-page"><span className="auth-icon"><Compass size={22} /></span><p className="eyebrow">{register ? 'LET’S GET YOU OUT THERE' : 'GOOD TO HAVE YOU BACK'}</p><h1>{sent ? 'Check your inbox.' : register ? <>A world of good<br /><em>starts here.</em></> : <>Welcome<br /><em>back.</em></>}</h1><p>{sent ? 'We’ve sent a secure sign-in link to your email.' : register ? 'Make an account. Your next favourite place is waiting.' : 'Sign in to pick up right where your daydream left off.'}</p><form className="booking-form" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>{register && <label>Your name<input required placeholder="Your name" /></label>}<label>Email address<input required type="email" placeholder="you@example.com" /></label>{!register && <label>Password<input required type="password" placeholder="At least 8 characters" /></label>}<button className="button button-dark full-button">{register ? 'Create account' : 'Sign in'} <ArrowRight size={16} /></button></form><p className="auth-switch">{register ? 'Already travelling with us?' : 'New around here?'} <Link to={register ? '/login' : '/register'}>{register ? 'Sign in' : 'Create an account'}</Link></p></main>;
}
function SimplePage({ title }) {
  const [tab, setTab] = useState('Upcoming');
  const [saved, setSaved] = useState([...destinations.slice(0, 2).map((d) => d.name)]);
  return <main className="inner-page simple-page"><div className="page-intro"><p className="eyebrow">A LITTLE SPACE FOR YOU</p><h1>{pageCopy[title]?.[0]}</h1><p>{pageCopy[title]?.[1]}</p></div>{title === 'My Trips' && <><div className="dashboard-tabs">{['Upcoming', 'Past trips', 'Cancelled'].map((item) => <button className={tab === item ? 'active-tab' : ''} onClick={() => setTab(item)} key={item}>{item}</button>)}</div><div className="trip-panel"><img src={imageUrl('photo-1533105079780-92b9be482077', 800)} alt="Amalfi coast" /><div><span className="eyebrow">YOUR NEXT ADVENTURE</span><h2>Amalfi, at your own pace.</h2><p>Amalfi Coast, Italy · 2 guests · Sep 14–21</p><span className="trip-status"><Check size={13} /> Confirmed</span></div><Link className="text-link" to="/booking">View details <ArrowRight size={15} /></Link></div><div className="dashboard-stat-grid"><div><strong>02</strong><span>Journeys taken</span></div><div><strong>08</strong><span>Places saved</span></div><div><strong>14</strong><span>Countries explored</span></div></div></>}{title === 'Wishlist' && <div className="destination-grid">{destinations.filter((item) => saved.includes(item.name)).map((item) => <div className="saved-card" key={item.name}><ImageCard item={item} /><button onClick={() => setSaved(saved.filter((name) => name !== item.name))}><X size={14} /> Remove</button></div>)}</div>}{title === 'Profile' && <div className="profile-panel"><div className="profile-avatar">TG</div><div><h2>Your travel profile</h2><p>Set your preferences and make every trip feel a little more like you.</p></div><Link to="/login" className="button button-outline">Sign in to edit</Link></div>}{title === 'About' && <div className="about-panel"><img src={imageUrl('photo-1470770841072-f978cf4d019e', 1000)} alt="Mountain lake at sunrise" /><div><p className="eyebrow">GOOD TRAVEL, BETTER FEELING</p><h2>Not just where you go.<br /><em>How it makes you feel.</em></h2><p>We started TravelGo with a simple thought: the best journeys aren’t measured in miles, but in the moments you carry home. We bring together characterful places, thoughtful local experiences, and the freedom to travel your own way.</p><Link to="/destinations" className="text-link">Find your somewhere <ArrowRight size={15} /></Link></div></div>}{title === 'Contact' && <form className="booking-form contact-form" onSubmit={(e) => { e.preventDefault(); setTab('Message sent'); }}><label>Your name<input required placeholder="Your name" /></label><label>Email address<input required type="email" placeholder="you@example.com" /></label><label>What can we help with?<textarea required placeholder="Tell us a little about it..." rows="4" /></label><button className="button button-dark">{tab === 'Message sent' ? 'Message received — thank you!' : 'Send a note'} <ArrowRight size={16} /></button></form>}</main>;
}
function NotFound() {
  return <main className="form-page not-found"><p className="eyebrow">A WRONG TURN, MAYBE?</p><h1>Well, this is<br /><em>somewhere else.</em></h1><p>We can’t find the page you’re looking for. Let’s get you back to the good stuff.</p><Link to="/" className="button button-dark">Back to the beginning <ArrowRight size={16} /></Link></main>;
}
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
export default function App() {
  const location = useLocation();
  return <div className="app-shell"><ScrollToTop /><Header /><AnimatePresence mode="wait"><motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.25 }}><Routes location={location}><Route path="/" element={<Home />} /><Route path="/flights" element={<ListingPage title="Flights" type="flight" />} /><Route path="/hotels" element={<ListingPage title="Hotels" type="stay" />} /><Route path="/packages" element={<ListingPage title="Holiday Packages" type="package" />} /><Route path="/destinations" element={<ListingPage title="Destinations" />} /><Route path="/destinations/:slug" element={<DetailPage />} /><Route path="/booking" element={<BookingPage />} /><Route path="/payment" element={<PaymentPage />} /><Route path="/trips" element={<SimplePage title="My Trips" />} /><Route path="/wishlist" element={<SimplePage title="Wishlist" />} /><Route path="/login" element={<AuthPage />} /><Route path="/register" element={<AuthPage register />} /><Route path="/profile" element={<SimplePage title="Profile" />} /><Route path="/contact" element={<SimplePage title="Contact" />} /><Route path="/about" element={<SimplePage title="About" />} /><Route path="*" element={<NotFound />} /></Routes></motion.div></AnimatePresence><Footer /></div>;
}
