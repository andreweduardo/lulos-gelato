import { spring, EASE_FRAMER } from '../lib/spring.js';

/**
 * Appear effects.
 *  [data-reveal="up"]      opacity 0 / y 50  → tween .6s ease(.44,0,.56,1)  (Framer section appear)
 *  [data-reveal="up-100"]  opacity 0 / y 100 → spring (duration .8, bounce 0), delay = data-reveal-spring
 *  data-reveal-delay="0.2" adds a delay (seconds)
 */
export function initReveal() {
  const els = [...document.querySelectorAll('[data-reveal]')];
  if (!('IntersectionObserver' in window)) { els.forEach(show); return; }

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      show(e.target);
      io.unobserve(e.target);
    }
  }, { threshold: 0 });
  els.forEach((el) => io.observe(el));

  function show(el) {
    const type = el.dataset.reveal;
    if (type === 'up-100') {
      const s = spring({ duration: 0.8, bounce: 0 });
      const d = parseFloat(el.dataset.revealSpring || 0);
      el.style.transition = `opacity ${s.duration}ms ${s.easing} ${d}s, transform ${s.duration}ms ${s.easing} ${d}s`;
    } else {
      const d = parseFloat(el.dataset.revealDelay || 0);
      el.style.transition = `opacity .6s ${EASE_FRAMER} ${d}s, transform .6s ${EASE_FRAMER} ${d}s`;
    }
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.addEventListener('transitionend', () => { el.style.transition = ''; el.style.willChange = ''; }, { once: true });
    });
  }
}
