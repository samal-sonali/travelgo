import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, animate, motion, useInView } from 'framer-motion';
import {
  ArrowDown, ArrowRight, BadgePercent, CalendarCheck, Clock, Headphones, Pause, Play,
  Plane, ShieldCheck, Sparkles, Star,
} from 'lucide-react';
import { airlines, blogs, destinations, imageUrl, packages, reviews, stats } from './data/travel.js';
import { ImageCard, Newsletter, SectionHeading } from './components.jsx';

// Swap this for your own clip — the poster image shows while it loads or if it fails.
const HERO_VIDEO = 'https://videos.pexels.com/video-files/1093662/1093662-hd_1920_1080_30fps.mp4';
const HERO_POSTER = imageUrl('photo-1507525428034-b723cf961d3e', 1920);

const reveal = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-80px' }, transition: { duration: 0.6, ease: 'easeOut' } };

const vibeWords = {
  beach: ['beach', 'island', 'sea', 'ocean', 'relax', 'tropical', 'sun', 'coast', 'swim'],
  culture: ['culture', 'temple', 'history', 'museum', 'art', 'heritage', 'local'],
  food: ['food', 'eat', 'wine', 'cuisine', 'foodie'],
  adventure: ['adventure', 'hike', 'hiking', 'mountain', 'trek', 'outdoor', 'nature', 'active'],
  city: ['city', 'shopping', 'nightlife', 'urban', 'skyline', 'weekend'],
  romance: ['romantic', 'honeymoon', 'couple', 'anniversary'],
};
const vibeLabels = { beach: 'Beach & sun', culture: 'Rich culture', food: 'Great food', adventure: 'Adventure', city: 'City energy', romance: 'Romantic' };
const suggestions = ['A relaxing beach week under $1,000', 'Culture and food in Asia', 'Mountain adventure in Europe', 'Romantic city break'];

// A lightweight local "planner": reads vibes, region and budget out of plain English.
function planTrip(query) {
  const q = query.toLowerCase();
  const hasWord = (word) => new RegExp(`\\b${word}(?:s|es)?\\b`).test(q);
  const vibes = Object.keys(vibeWords).filter((key) => vibeWords[key].some(hasWord));
  const budgetMatch = q.match(/(?:under|below|less than|max|budget(?: of)?|\$)\s*\$?\s*(\d[\d,]*)/);
  const budget = budgetMatch ? Number(budgetMatch[1].replace(/,/g, '')) : null;
  const ranked = destinations.map((place) => {
    let score = 0;
    const reasons = [];
    vibes.forEach((vibe) => { if (place.vibes.includes(vibe)) { score += 3; reasons.push(vibeLabels[vibe]); } });
    if ([place.region, place.country, place.name].some((word) => hasWord(word.toLowerCase()))) { score += 4; reasons.push(`In ${place.region}`); }
    if (budget) {
      if (place.from <= budget) { score += 2; reasons.push('Within budget'); } else score -= 3;
    }
    return { ...place, score, reasons };
  }).sort((a, b) => b.score - a.score);
  const matched = ranked[0].score > 0;
  const parts = [vibes.map((v) => vibeLabels[v].toLowerCase()).join(', '), budget && `under $${budget.toLocaleString()}`].filter(Boolean);
  return {
    summary: matched ? `Here are your best matches${parts.length ? ` for ${parts.join(' ')}` : ''}.` : 'Here are our most-loved picks. Try mentioning a vibe, a region or a budget.',
    results: ranked.slice(0, 3),
  };
}

function AISearch() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('idle');
  const [plan, setPlan] = useState(null);
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  const run = (text) => {
    if (!text.trim()) return;
    setQuery(text);
    setStatus('thinking');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { setPlan(planTrip(text)); setStatus('done'); }, 900);
  };
  return <div className="ai-search">
    <form className="ai-search-bar" onSubmit={(e) => { e.preventDefault(); run(query); }}>
      <span className="ai-badge"><Sparkles size={17} /></span>
      <label htmlFor="ai-query" className="sr-only">Describe your dream trip</label>
      <input id="ai-query" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Describe your dream trip… e.g. a quiet beach week under $1,000" autoComplete="off" />
      <button className="button ai-submit" disabled={status === 'thinking'}>{status === 'thinking' ? 'Thinking…' : <>Plan it <ArrowRight size={16} /></>}</button>
    </form>
    <div className="ai-chips">{suggestions.map((text) => <button key={text} type="button" onClick={() => run(text)}>{text}</button>)}</div>
    <AnimatePresence>
      {status !== 'idle' && <motion.div className="ai-results" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} aria-live="polite">
        {status === 'thinking' ? <p className="ai-thinking"><Sparkles size={15} /> Finding places that fit<span className="dots"><i /><i /><i /></span></p> : <>
          <p className="ai-summary"><Sparkles size={15} /> {plan.summary}</p>
          <div className="ai-result-list">{plan.results.map((place) => <Link to={`/planner?destination=${place.slug}`} className="ai-result" key={place.name}>
            <img src={imageUrl(place.image, 200)} alt="" />
            <div><strong>{place.name}</strong><span>{place.country} · {place.days}</span><div className="ai-tags">{place.reasons.slice(0, 3).map((r) => <em key={r}>{r}</em>)}</div></div>
            <b>from {place.price}</b>
          </Link>)}</div>
          <Link to={`/planner?destination=${plan.results[0].slug}`} className="ai-plan-link">Build a full day-by-day plan with the AI Trip Planner <ArrowRight size={14} /></Link>
        </>}
      </motion.div>}
    </AnimatePresence>
  </div>;
}

function VideoHero() {
  const video = useRef(null);
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { video.current?.pause(); setPlaying(false); }
  }, []);
  const toggle = () => {
    const v = video.current;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
  };
  return <section className="hero">
    <video ref={video} className="hero-video" src={HERO_VIDEO} poster={HERO_POSTER} autoPlay muted loop playsInline aria-hidden="true" />
    <div className="hero-shade" />
    <div className="hero-content">
      <div className="hero-kicker"><span className="live-dot" /> YOUR NEXT CHAPTER STARTS HERE</div>
      <h1>Find your<br /><em>somewhere.</em></h1>
      <p>Tell us what you’re dreaming of, in your own words. We’ll find the places that fit.</p>
      <AISearch />
    </div>
    <button className="video-toggle" onClick={toggle} aria-label={playing ? 'Pause background video' : 'Play background video'}>{playing ? <Pause size={16} /> : <Play size={16} />}</button>
    <a href="#popular" className="hero-bottom"><span>SCROLL TO EXPLORE</span><ArrowDown size={16} /></a>
  </section>;
}

function PopularDestinations() {
  const track = useRef(null);
  const scroll = (dir) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.75, behavior: 'smooth' });
  return <section className="content-section" id="popular">
    <div className="section-topline"><SectionHeading eyebrow="POPULAR RIGHT NOW" title={<>Somewhere <em>special.</em></>} text="The places our well-travelled community can’t stop talking about." /><div className="carousel-controls"><button onClick={() => scroll(-1)} aria-label="Previous destinations"><ArrowRight className="flip-arrow" size={17} /></button><button onClick={() => scroll(1)} aria-label="Next destinations"><ArrowRight size={17} /></button></div></div>
    <div className="destination-track" ref={track}>{destinations.map((item) => <ImageCard item={item} key={item.name} />)}</div>
  </section>;
}

function Counter({ value, decimals = 0, suffix }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (!inView) return undefined;
    const controls = animate(0, value, { duration: 1.8, ease: 'easeOut', onUpdate: setCurrent });
    return () => controls.stop();
  }, [inView, value]);
  return <strong ref={ref}>{current.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</strong>;
}

function Stats() {
  return <section className="stats-band"><div className="stats-inner">{stats.map((stat) => <div className="stat" key={stat.label}><Counter {...stat} /><span>{stat.label}</span></div>)}</div></section>;
}

function TrendingPackages() {
  const categories = ['All', ...new Set(packages.map((p) => p.category))];
  const [active, setActive] = useState('All');
  const shown = packages.filter((p) => active === 'All' || p.category === active);
  return <section className="content-section">
    <SectionHeading eyebrow="TRENDING PACKAGES" title={<>A trip with your name <em>on it.</em></>} text="Considered getaways, with all the good bits already figured out." to="/packages" />
    <div className="filter-chips">{categories.map((c) => <button key={c} className={active === c ? 'chip-active' : ''} onClick={() => setActive(c)}>{c}</button>)}</div>
    <motion.div layout className="package-grid"><AnimatePresence mode="popLayout">{shown.map((item) => <motion.div layout key={item.name} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.3 }}><ImageCard item={item} type="package" /></motion.div>)}</AnimatePresence></motion.div>
  </section>;
}

const reasons = [
  [ShieldCheck, 'Handpicked & verified', 'Every stay and experience is visited and vetted by our team. No surprises.'],
  [BadgePercent, 'Best price promise', 'Find it cheaper within 24 hours and we’ll refund the difference.'],
  [Headphones, '24/7 real humans', 'Talk to a real travel expert any time, wherever you are in the world.'],
  [CalendarCheck, 'Flexible booking', 'Free cancellation on most trips up to 48 hours before you go.'],
];
function WhyChooseUs() {
  return <section className="why-section">
    <motion.div className="why-media" {...reveal}><img src={imageUrl('photo-1470770841072-f978cf4d019e', 1100)} alt="Quiet lake surrounded by mountains" loading="lazy" /><div className="image-stamp"><Sparkles size={17} /><span>Made for<br />the way you travel</span></div></motion.div>
    <div className="why-copy">
      <p className="eyebrow">WHY TRAVEL WITH US</p>
      <h2>Less itinerary.<br /><em>More in the moment.</em></h2>
      <div className="why-grid">{reasons.map(([Icon, title, text], i) => <motion.div className="why-card" key={title} {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }}><span><Icon size={20} /></span><h3>{title}</h3><p>{text}</p></motion.div>)}</div>
    </div>
  </section>;
}

function Reviews() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setIndex((i) => (i + 1) % reviews.length), 6500);
    return () => clearTimeout(id);
  }, [index]);
  const review = reviews[index];
  return <section className="reviews-section">
    <p className="eyebrow">WHAT TRAVELLERS SAY</p>
    <div className="reviews-score"><span className="quote-stars">★★★★★</span> 4.9 out of 5 from 18,000+ reviews</div>
    <div className="quote-mark">“</div>
    <AnimatePresence mode="wait">
      <motion.div key={index} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}>
        <blockquote>{review.text}</blockquote>
        <div className="quote-byline"><img src={imageUrl(review.avatar, 100)} alt="" /><div><strong>{review.name}</strong><span>Travelled to {review.trip}</span></div></div>
      </motion.div>
    </AnimatePresence>
    <div className="review-dots">{reviews.map((r, i) => <button key={r.name} className={i === index ? 'dot-active' : ''} onClick={() => setIndex(i)} aria-label={`Show review from ${r.name}`} />)}</div>
  </section>;
}

function PartnerAirlines() {
  const row = (hidden) => <div className="marquee-row" aria-hidden={hidden || undefined}>{airlines.map(([code, name]) => <span className="partner" key={code}><i>{code}</i>{name}</span>)}</div>;
  return <section className="partners-section">
    <p className="partners-title"><Plane size={15} /> Flying with the world’s favourite airlines</p>
    <div className="marquee"><div className="marquee-track">{row(false)}{row(true)}</div></div>
  </section>;
}

function TravelBlogs() {
  return <section className="content-section blog-section">
    <SectionHeading eyebrow="THE TRAVEL JOURNAL" title={<>Stories for the <em>road ahead.</em></>} text="Guides, tips and a little wanderlust from our editors." link={null} />
    <div className="blog-grid">{blogs.map((post, i) => <motion.article className="blog-card" key={post.title} {...reveal} transition={{ ...reveal.transition, delay: i * 0.1 }}>
      <div className="blog-image"><img src={imageUrl(post.image, 800)} alt="" loading="lazy" /><span className="package-label">{post.category}</span></div>
      <p className="blog-meta"><Clock size={12} /> {post.read}</p>
      <h3>{post.title}</h3>
      <p>{post.excerpt}</p>
    </motion.article>)}</div>
  </section>;
}

export default function Home() {
  return <>
    <VideoHero />
    <main>
      <PopularDestinations />
      <Stats />
      <TrendingPackages />
      <WhyChooseUs />
      <Reviews />
      <PartnerAirlines />
      <TravelBlogs />
      <Newsletter />
    </main>
  </>;
}
