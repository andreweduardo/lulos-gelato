import Lenis from '../../vendor/lenis.mjs';

/** Lenis smooth scroll — reference uses Framer University "Smooth Scroll" with intensity 25 → duration 2.5 */
export let lenis = null;

export function initSmoothScroll() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  lenis = new Lenis({ duration: 2.5 });
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);

  // in-page anchors
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id === '#' ) return;
    const target = id === '#top' ? 0 : document.querySelector(id);
    if (target === null) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: 0 });
  });
  return lenis;
}

/** Subscribe to scroll (works with or without Lenis) */
export function onScroll(fn) {
  if (lenis) lenis.on('scroll', () => fn(window.scrollY));
  window.addEventListener('scroll', () => fn(window.scrollY), { passive: true });
  fn(window.scrollY);
}
