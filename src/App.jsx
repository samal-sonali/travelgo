import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight, Check, Compass, CreditCard, Menu, ShieldCheck,
  SlidersHorizontal, Sparkles, Sun, X,
} from 'lucide-react';
import { destinations, imageUrl, packages, stays } from './data/travel.js';
import { ImageCard } from './components.jsx';
import Flights from './Flights.jsx';
import Hotels from './Hotels.jsx';
import NotificationsPage, { NotificationBell } from './Notifications.jsx';
import { runNotificationChecks } from './notifications.js';

const TravelMap = lazy(() => import('./ui/TravelMap.jsx'));
import Home from './Home.jsx';
import Planner from './Planner.jsx';
import Budget from './Budget.jsx';
import Weather from './Weather.jsx';

const navItems = [['Explore', '/'], ['Stays', '/hotels'], ['Flights', '/flights'], ['Experiences', '/packages'], ['AI Planner', '/planner'], ['Budget', '/budget'], ['Weather', '/weather']];

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <header className={`site-header ${dark ? 'dark-header' : ''} ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="nav-shell">
        <Link to="/" className="brand" aria-label="TravelGo home"><span className="brand-mark"><Compass size={19} /></span>travelgo<span className="brand-period">.</span></Link>
        <nav className={`main-nav ${menuOpen ? 'nav-open' : ''}`}>
          {navItems.map(([label, path]) => <NavLink key={label} to={path} end={path === '/'} className={path === '/planner' ? 'nav-ai' : undefined} onClick={() => setMenuOpen(false)}>{({ isActive }) => <>{path === '/planner' ? <><Sparkles size={13} /> {label}<span className="nav-new">New</span></> : label}{isActive && <motion.span layoutId="nav-line" className="nav-line" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}</>}</NavLink>)}
          <div className="mobile-nav-actions"><Link className="button button-dark" to="/login">Sign in <ArrowRight size={15} /></Link></div>
        </nav>
        <div className="nav-actions">
          <button className="icon-button mode-button" onClick={() => setDark(!dark)} aria-label="Toggle dark mode"><Sun size={18} /></button>
          <NotificationBell />
          <Link className="sign-in" to="/login">Sign in</Link>
          <Link className="button button-dark nav-cta" to="/trips">My trips <ArrowRight size={15} /></Link>
        </div>
        <button className="icon-button menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X /> : <Menu />}</button>
      </div>
    </header>
  );
}

function Footer() {
  return <footer className="footer"><div className="footer-main"><div className="footer-brand"><Link to="/" className="brand"><span className="brand-mark"><Compass size={18} /></span>travelgo<span className="brand-period">.</span></Link><p>Travel, with a little more feeling.</p></div><div className="footer-column"><strong>Discover</strong><Link to="/destinations">Destinations</Link><Link to="/hotels">Unique stays</Link><Link to="/packages">Our escapes</Link><Link to="/flights">Flights</Link></div><div className="footer-column"><strong>TravelGo</strong><Link to="/about">Our story</Link><Link to="/contact">Get in touch</Link><Link to="/trips">My trips</Link><Link to="/wishlist">Wishlist</Link></div><div className="footer-note"><p>Good trips. Good people.<br />A little more wonder.</p><span>© 2026 TravelGo, thoughtfully made.</span></div></div><div className="footer-bottom"><span>Made for everywhere you’re going.</span><span>Privacy&nbsp;&nbsp; · &nbsp;&nbsp;Terms&nbsp;&nbsp; · &nbsp;&nbsp;Instagram</span></div></footer>;
}

const pageCopy = {
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
  return <main className="inner-page"><div className="page-intro"><p className="eyebrow">THE TRAVELGO EDIT</p><h1>{pageCopy[title]?.[0] || title}</h1><p>{pageCopy[title]?.[1]}</p></div>{!type && <Suspense fallback={<div className="map-skeleton skeleton" />}><TravelMap height={420} /></Suspense>}<div className="listing-toolbar"><span>{items.length * 8} handpicked {type === 'stay' ? 'stays' : type === 'package' ? 'escapes' : 'places'}</span><button className="filter-button"><SlidersHorizontal size={16} /> Filters</button><select value={filter} onChange={(e) => setFilter(e.target.value)}><option>Recommended</option><option>Price: low to high</option><option>Top rated</option></select></div><div className={`listing-grid ${type === 'stay' ? 'stay-grid' : type === 'package' ? 'package-grid' : 'destination-grid'}`}>{[...items, ...items].map((item, i) => <ImageCard key={`${item.name}-${i}`} item={item} type={type} />)}</div></main>;
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
  useEffect(() => {
    runNotificationChecks();
    const id = setInterval(runNotificationChecks, 15 * 60 * 1000);
    return () => clearInterval(id);
  }, []);
  return <div className="app-shell"><ScrollToTop /><Header /><AnimatePresence mode="wait"><motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.25 }}><Routes location={location}><Route path="/" element={<Home />} /><Route path="/planner" element={<Planner />} /><Route path="/budget" element={<Budget />} /><Route path="/weather" element={<Weather />} /><Route path="/notifications" element={<NotificationsPage />} /><Route path="/flights" element={<Flights />} /><Route path="/hotels" element={<Hotels />} /><Route path="/packages" element={<ListingPage title="Holiday Packages" type="package" />} /><Route path="/destinations" element={<ListingPage title="Destinations" />} /><Route path="/destinations/:slug" element={<DetailPage />} /><Route path="/booking" element={<BookingPage />} /><Route path="/payment" element={<PaymentPage />} /><Route path="/trips" element={<SimplePage title="My Trips" />} /><Route path="/wishlist" element={<SimplePage title="Wishlist" />} /><Route path="/login" element={<AuthPage />} /><Route path="/register" element={<AuthPage register />} /><Route path="/profile" element={<SimplePage title="Profile" />} /><Route path="/contact" element={<SimplePage title="Contact" />} /><Route path="/about" element={<SimplePage title="About" />} /><Route path="*" element={<NotFound />} /></Routes></motion.div></AnimatePresence><Footer /></div>;
}
