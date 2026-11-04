import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Swipeable image carousel: drag, arrows, dots, keyboard, and optional autoplay that pauses on hover.
export default function Carousel({ slides, autoplay = 0, className = '', label = 'Image gallery' }) {
  const [[index, direction], setState] = useState([0, 0]);
  const [paused, setPaused] = useState(false);
  const go = (dir) => setState(([i]) => [(i + dir + slides.length) % slides.length, dir]);
  const jump = (to) => setState(([i]) => [to, to > i ? 1 : -1]);

  useEffect(() => {
    if (!autoplay || paused || slides.length < 2) return undefined;
    const id = setTimeout(() => go(1), autoplay);
    return () => clearTimeout(id);
  }, [index, autoplay, paused, slides.length]);

  const slide = slides[index];
  return <div className={`carousel ${className}`} role="region" aria-roledescription="carousel" aria-label={label} tabIndex={0}
    onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
    onKeyDown={(e) => { if (e.key === 'ArrowLeft') go(-1); if (e.key === 'ArrowRight') go(1); }}>
    <AnimatePresence initial={false} custom={direction}>
      <motion.div key={index} className="carousel-slide" custom={direction}
        variants={{ enter: (d) => ({ x: d >= 0 ? '100%' : '-100%', opacity: 0.4 }), center: { x: 0, opacity: 1 }, exit: (d) => ({ x: d >= 0 ? '-30%' : '30%', opacity: 0 }) }}
        initial="enter" animate="center" exit="exit" transition={{ x: { type: 'spring', stiffness: 260, damping: 32 }, opacity: { duration: 0.25 } }}
        drag={slides.length > 1 ? 'x' : false} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.6}
        onDragEnd={(_, { offset, velocity }) => { if (offset.x < -60 || velocity.x < -400) go(1); else if (offset.x > 60 || velocity.x > 400) go(-1); }}>
        <img src={slide.src} alt={slide.alt || ''} draggable="false" />
        {slide.caption && <div className="carousel-caption">{slide.caption}</div>}
      </motion.div>
    </AnimatePresence>
    {slides.length > 1 && <>
      <button type="button" className="carousel-arrow carousel-prev" onClick={() => go(-1)} aria-label="Previous image"><ChevronLeft size={18} /></button>
      <button type="button" className="carousel-arrow carousel-next" onClick={() => go(1)} aria-label="Next image"><ChevronRight size={18} /></button>
      <div className="carousel-dots">{slides.map((s, i) => <button type="button" key={s.src} className={i === index ? 'dot-active' : ''} onClick={() => jump(i)} aria-label={`Show image ${i + 1} of ${slides.length}`} aria-current={i === index} />)}</div>
    </>}
  </div>;
}
