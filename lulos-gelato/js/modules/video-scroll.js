/**
 * Scroll-scaled video (Framer "transform on scroll target").
 * Progress runs from the spacer's top reaching the viewport bottom
 * to the spacer's bottom reaching the viewport bottom.
 *   desktop: scale .5 → 1.5, opacity .5 → 1
 *   tablet : scale .5 → 1,   opacity .5 → 1
 *   phone  : static
 */
import { onScroll } from './smooth-scroll.js';

export function initVideoScroll() {
  const frame = document.querySelector('[data-video-frame]');
  const spacer = document.querySelector('[data-video-spacer]');
  if (!frame || !spacer) return;
  const mqPhone = matchMedia('(max-width: 809.98px)');
  const mqDesk = matchMedia('(min-width: 1440px)');

  const update = () => {
    if (mqPhone.matches) { frame.style.transform = ''; frame.style.opacity = ''; return; }
    const r = spacer.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = Math.min(1, Math.max(0, (vh - r.top) / r.height));
    const max = mqDesk.matches ? 1.5 : 1;
    frame.style.transform = `scale(${(0.5 + p * (max - 0.5)).toFixed(4)})`;
    frame.style.opacity = (0.5 + p * 0.5).toFixed(4);
  };
  onScroll(update);
  window.addEventListener('resize', update);

  // play only while visible
  const video = frame.querySelector('video');
  if (video) {
    new IntersectionObserver(([e]) => { e.isIntersecting ? video.play().catch(() => {}) : video.pause(); }).observe(frame);
  }
}
