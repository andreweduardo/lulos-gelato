import { spring } from '../lib/spring.js';
import { lenis } from './smooth-scroll.js';

/** Footer: line draws in when 50% visible (toggles), wordmark rises 140px → 0 on view (spring k300 c60) */
export function initFooter() {
  const line = document.querySelector('[data-line]');
  if (line) new IntersectionObserver(([e]) => line.classList.toggle('is-in', e.isIntersecting), { threshold: 0.5 }).observe(line);

  const mark = document.querySelector('[data-footer-wordmark]');
  if (mark) {
    const s = spring({ stiffness: 300, damping: 60 });
    mark.style.transition = `transform ${s.duration}ms ${s.easing}`;
    // trigger on the wordmark's resting position (its box is translated 140px down while hidden)
    new IntersectionObserver(([e]) => {
      mark.style.transform = e.isIntersecting ? 'perspective(1200px) translateY(0)' : '';
    }, { threshold: 0, rootMargin: '0px 0px 140px 0px' }).observe(mark);
  }

  document.querySelectorAll('[data-back-top]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    lenis ? lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: 'smooth' });
  }));
}
