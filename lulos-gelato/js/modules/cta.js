import { spring } from '../lib/spring.js';

/** CTA side images: offset (x∓40, y200) until the marker enters the viewport, then spring to rest (reversible) */
export function initCtaImages() {
  const marker = document.querySelector('[data-cta-marker]');
  const imgs = document.querySelectorAll('[data-cta-img]');
  if (!marker || !imgs.length) return;
  const s = spring({ stiffness: 500, damping: 60 });
  imgs.forEach((i) => { i.style.transition = `transform ${s.duration}ms ${s.easing}`; });
  new IntersectionObserver(([e]) => {
    const inView = e.isIntersecting || e.boundingClientRect.top < 0;
    imgs.forEach((i) => i.classList.toggle('is-in', inView));
  }, { threshold: 0 }).observe(marker);
}
