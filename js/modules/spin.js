import { spring } from '../lib/spring.js';
import { onScroll } from './smooth-scroll.js';

/** Feature badges: rotate to 200° while scrolling down, back to 0° when scrolling up (spring 1s, bounce 0) */
export function initSpin() {
  const els = [...document.querySelectorAll('[data-spin]')];
  if (!els.length) return;
  const s = spring({ duration: 1, bounce: 0 });
  els.forEach((el) => { el.style.transition = `transform ${s.duration}ms ${s.easing}`; el.style.transformOrigin = '50% 50%'; });
  let lastY = window.scrollY, dir = 0;
  onScroll((y) => {
    const d = y > lastY ? 1 : y < lastY ? -1 : 0;
    lastY = y;
    if (!d || d === dir) return;
    dir = d;
    els.forEach((el) => { el.style.transform = d > 0 ? 'rotate(200deg)' : 'rotate(0deg)'; });
  });
}
