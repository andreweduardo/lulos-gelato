import { spring } from '../lib/spring.js';

/** Story image: brown overlay slides up (1s, ease .7/0/.3/1), image un-blurs and scales 1.2 → 1 (spring k300 c60, delay .3s) */
export function initImageReveal() {
  document.querySelectorAll('[data-image-reveal]').forEach((el) => {
    const overlay = el.querySelector('.story__overlay');
    const img = el.querySelector('img');
    const s = spring({ stiffness: 300, damping: 60 });
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      overlay.style.transition = 'transform 1s cubic-bezier(.7, 0, .3, 1)';
      overlay.style.transform = 'translateY(-101%)';
      img.style.transition = `transform ${s.duration}ms ${s.easing} .3s, filter .8s cubic-bezier(.44,0,.56,1) .1s`;
      img.style.transform = 'scale(1)';
      img.style.filter = 'blur(0px)';
    }, { threshold: 0, rootMargin: '0px 0px -30% 0px' });   // fires when the photo's top passes 70% of the viewport — works at any photo/viewport size
    io.observe(el);
  });
}
