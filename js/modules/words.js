import { spring } from '../lib/spring.js';

/**
 * Rotating phrases inside the red badge (items stacked in one grid cell).
 * Every 2s the next word pops up from below (y ~78%, scale .8 → spring) while the current one disappears.
 */
export function initWords() {
  document.querySelectorAll('[data-words]').forEach((el) => {
    const items = [...el.querySelectorAll('.words__item')];
    if (items.length < 2) return;
    const s = spring({ stiffness: 180, damping: 27 });
    let i = 0;
    // stack all items absolutely except the sizing one
    items.forEach((it, k) => {
      if (k === 0) return;
      it.style.opacity = '0';
    });
    const show = (next, prev) => {
      prev.style.transition = 'opacity .12s linear';
      prev.style.opacity = '0';
      const base = '';
      next.style.transition = 'none';
      next.style.opacity = '1';
      next.style.transform = `${base}translateY(78%) scale(.8)`;
      void next.offsetWidth;
      next.style.transition = `transform ${s.duration}ms ${s.easing}`;
      next.style.transform = `${base}translateY(0) scale(1)`;
    };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setInterval(() => {
      if (document.hidden) return;
      const prev = items[i];
      i = (i + 1) % items.length;
      show(items[i], prev);
    }, parseInt(el.dataset.interval, 10) || 2010);   // reading time per phrase
  });
}
