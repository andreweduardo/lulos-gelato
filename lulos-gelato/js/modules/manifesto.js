/**
 * Manifesto — splits the statement into words and lights them up as the
 * section scrolls through the viewport (inline media pop in with their word).
 */
export function initManifesto() {
  const el = document.querySelector('[data-manifesto]');
  if (!el) return;

  // wrap each word of every text node in a span, keeping <em> and media in place
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const texts = [];
  while (walker.nextNode()) texts.push(walker.currentNode);
  for (const t of texts) {
    if (t.parentElement.closest('[data-m-media]')) continue;
    const frag = document.createDocumentFragment();
    t.textContent.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
      const s = document.createElement('span');
      s.className = 'mw';
      s.textContent = part;
      frag.appendChild(s);
    });
    t.replaceWith(frag);
  }
  const items = [...el.querySelectorAll('.mw, [data-m-media]')];
  el.classList.add('is-split');

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach((i) => i.classList.add('is-on'));
    return;
  }

  let ticking = false;
  const update = () => {
    ticking = false;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    // starts when the top reaches 90% of the viewport, completes when the top reaches 35%
    const start = vh * 0.9;
    const end = vh * 0.35;
    const p = Math.min(1, Math.max(0, (start - r.top) / (start - end)));
    const on = Math.round(p * items.length);
    items.forEach((i, idx) => i.classList.toggle('is-on', idx < on));
  };
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  update();
}
