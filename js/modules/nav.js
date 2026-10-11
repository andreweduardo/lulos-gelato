import { onScroll } from './smooth-scroll.js';

/** Header: transparent over the hero film, solid creme once the hero is scrolled past; mobile menu toggle */
export function initNav() {
  const nav = document.querySelector('[data-nav]');
  if (!nav) return;
  const hero = document.querySelector('[data-hero]');

  const update = () => {
    // pages without a hero film (e.g. flavor pages) keep the header solid
    if (!hero) { nav.classList.add('is-solid'); return; }
    const limit = hero.offsetTop + hero.offsetHeight - nav.offsetHeight - 1;
    nav.classList.toggle('is-solid', window.scrollY > limit);
  };
  onScroll(update);
  window.addEventListener('resize', update);

  const toggle = nav.querySelector('[data-nav-toggle]');
  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    toggle?.setAttribute('aria-expanded', String(open));
    toggle?.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };
  toggle?.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  nav.querySelectorAll('.nav__links a, .nav__cta a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  matchMedia('(min-width: 810px)').addEventListener('change', (e) => e.matches && setOpen(false));
}
