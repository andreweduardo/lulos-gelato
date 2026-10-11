import { spring } from '../lib/spring.js';

/** Phone testimonials slideshow: autoplay every `data-interval` ms, looping, dots */
export function initSlideshows() {
  document.querySelectorAll('[data-slideshow]').forEach(setup);
}

function setup(el) {
  const src = document.querySelector(el.dataset.source);
  const track = el.querySelector('.slideshow__track');
  const dots = el.querySelector('.slideshow__dots');
  const items = [...src.content.children];
  const n = items.length;
  // clones: [last] + items + [first] for seamless loop
  const all = [items[n - 1], ...items, items[0]];
  all.forEach((it, i) => {
    const c = it.cloneNode(true);
    if (i === 0 || i === all.length - 1) c.setAttribute('aria-hidden', 'true');
    track.appendChild(c);
  });
  dots.innerHTML = items.map((_, i) => `<button class="slideshow__dot" type="button" role="tab" aria-label="Slide ${i + 1}"><span></span></button>`).join('');

  const s = spring({ stiffness: 260, damping: 32 });
  let index = 1;
  const gap = () => parseFloat(getComputedStyle(track).columnGap) || 0;
  const place = (animate) => {
    const w = el.clientWidth + gap();
    track.style.transition = animate ? `transform ${s.duration}ms ${s.easing}` : 'none';
    track.style.transform = `translate3d(${-index * w}px,0,0)`;
    [...dots.children].forEach((d, i) => d.setAttribute('aria-current', String(i === (index - 1 + n) % n)));
  };
  track.addEventListener('transitionend', () => {
    if (index === 0) { index = n; place(false); }
    if (index === n + 1) { index = 1; place(false); }
  });
  const go = (i) => { index = i; place(true); };
  dots.addEventListener('click', (e) => {
    const b = e.target.closest('.slideshow__dot');
    if (b) { go([...dots.children].indexOf(b) + 1); restart(); }
  });
  let timer;
  const restart = () => { clearInterval(timer); timer = setInterval(() => { if (el.offsetParent) go(index + 1); }, parseInt(el.dataset.interval || 3000, 10)); };
  place(false);
  restart();
  new ResizeObserver(() => place(false)).observe(el);

  // swipe
  let sx = null;
  el.addEventListener('pointerdown', (e) => { sx = e.clientX; });
  el.addEventListener('pointerup', (e) => {
    if (sx === null) return;
    const dx = e.clientX - sx; sx = null;
    if (Math.abs(dx) > 40) { go(index + (dx < 0 ? 1 : -1)); restart(); }
  });
}
