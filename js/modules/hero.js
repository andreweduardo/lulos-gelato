import { spring, EASE_FRAMER } from '../lib/spring.js';
import { onScroll } from './smooth-scroll.js';

/**
 * Hero "Lulo's em detalhes"
 *  - film: autoplay/muted/loop; placeholder until a playable file is available
 *  - intro: logo rises (spring k100/c30 — same feel as the reference hero titles), detail tag pops, meta fades up
 *  - scroll: the full-bleed film tightens into a rounded panel while the brand drifts up
 */
export function initHero() {
  const hero = document.querySelector('[data-hero]');
  if (!hero) return;
  const media = hero.querySelector('[data-hero-media]');
  const video = hero.querySelector('[data-hero-video]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- film
  if (video) {
    const ready = () => hero.classList.add('has-video');
    video.addEventListener('loadeddata', ready, { once: true });
    video.addEventListener('playing', ready, { once: true });
    if (video.readyState >= 2) ready();
    new IntersectionObserver(([e]) => { e.isIntersecting ? video.play().catch(() => {}) : video.pause(); }).observe(hero);
  }

  // ---------- intro
  const logo = hero.querySelector('[data-hero-intro="logo"]');
  const tag = hero.querySelector('[data-hero-intro="tag"]');
  const meta = hero.querySelector('[data-hero-intro="fade"]');
  if (!reduce) {
    const s = spring({ stiffness: 100, damping: 30 });
    const pop = spring({ duration: 0.7, bounce: 0.35 });
    const set = (el, t, o) => { if (el) { el.style.transform = t; el.style.opacity = o; } };
    set(logo, 'translateY(102%)', '1');
    set(tag, 'rotate(-6deg) scale(.4)', '0');
    set(meta, 'translateY(30px)', '0');
    media.style.setProperty('--media-scale', '1.12');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (logo) { logo.style.transition = `transform ${s.duration}ms ${s.easing} .15s`; logo.style.transform = 'none'; }
      if (tag) { tag.style.transition = `transform ${pop.duration}ms ${pop.easing} .9s, opacity .3s linear .9s`; tag.style.transform = 'rotate(-6deg)'; tag.style.opacity = '1'; }
      if (meta) { meta.style.transition = `transform .8s ${EASE_FRAMER} .55s, opacity .8s ${EASE_FRAMER} .55s`; meta.style.transform = 'none'; meta.style.opacity = '1'; }
      media.animate([{ '--media-scale': 1.12 }, { '--media-scale': 1 }], { duration: 2400, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' });
      media.style.setProperty('--media-scale', '1');
    }));
  }

  // ---------- scroll: film → rounded panel
  if (reduce) return;
  const inner = hero.querySelector('.hero__inner');
  const gutter = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gutter')) || 20;
  const update = (y) => {
    const h = hero.offsetHeight;
    const p = Math.min(1, Math.max(0, y / (h * 0.8)));
    const g = gutter();
    media.style.setProperty('--clip-x', `${(p * g).toFixed(2)}px`);
    media.style.setProperty('--clip-b', `${(p * g).toFixed(2)}px`);
    media.style.setProperty('--clip-r', `${(p * 40).toFixed(2)}px`);
    if (inner) inner.style.setProperty('--content-shift', `${(-p * 45).toFixed(2)}px`);
  };
  onScroll(update);
}
