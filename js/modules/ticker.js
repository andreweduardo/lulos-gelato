/**
 * Infinite marquee (Framer Ticker): direction left, `data-speed` px/s,
 * `data-hover-factor` slows it on hover, pauses when offscreen.
 * Content comes from the element's children or from a <template> (data-source).
 */
export function initTickers() {
  document.querySelectorAll('[data-ticker]').forEach(setup);
}

function setup(el) {
  const speed = parseFloat(el.dataset.speed || 60);
  const hoverFactor = parseFloat(el.dataset.hoverFactor || 1);
  const src = el.dataset.source ? document.querySelector(el.dataset.source) : null;
  const items = src ? [...src.content.children].map((n) => n.cloneNode(true)) : [...el.children];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // reduced motion (opt-in via data-static-scroll): original content only, no clones, no movement,
  // and the strip scrolls by hand / keyboard so every item stays reachable
  if (reduce && el.hasAttribute('data-static-scroll')) {
    el.classList.add('is-static');
    if (!el.hasAttribute('tabindex')) el.tabIndex = 0;
    return;
  }

  const track = document.createElement('div');
  track.className = 'ticker__track';
  const makeSet = () => {
    const set = document.createElement('div');
    set.className = 'ticker__set';
    items.forEach((n) => set.appendChild(n.cloneNode(true)));
    return set;
  };
  el.innerHTML = '';
  el.appendChild(track);
  const first = makeSet();
  track.appendChild(first);

  let setW = 0;
  const fill = () => {
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    setW = first.getBoundingClientRect().width + gap;
    const need = Math.ceil((el.clientWidth + setW) / Math.max(setW, 1)) + 1;
    while (track.children.length < need) {
      const s = makeSet();
      s.setAttribute('aria-hidden', 'true');
      s.querySelectorAll('a,button').forEach((f) => f.setAttribute('tabindex', '-1'));
      track.appendChild(s);
    }
  };
  fill();
  new ResizeObserver(fill).observe(el);

  let x = 0, factor = 1, target = 1, visible = true, last = performance.now();
  el.addEventListener('mouseenter', () => { target = hoverFactor; });
  el.addEventListener('mouseleave', () => { target = 1; });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(el);

  const tick = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    factor += (target - factor) * Math.min(1, dt * 6);
    if (visible && !reduce && setW > 0) {
      x -= speed * factor * dt;
      if (-x >= setW) x += setW;
      track.style.transform = `translate3d(${x}px,0,0)`;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
