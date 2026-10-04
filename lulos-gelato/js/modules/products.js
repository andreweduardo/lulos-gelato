import { CATEGORIES, STATUS, flavorsIn, displayName } from '../flavors.js';
import { flavorUrl } from '../config.js';
import { pictureHTML, placeholderHTML, hydrate, hasImage, productStageHTML } from '../lib/flavor-images.js';

/**
 * SABORES — tabs + flavor cards.
 * Card = product photo; the texture macro is revealed
 *   desktop: on hover/focus, with a circular mask that opens from the cursor
 *   touch:   tapping the photo toggles product ⇄ texture; tapping name/info opens the flavor page
 */
const SIZES = '(max-width: 809.98px) calc(100vw - 80px), (max-width: 1439.98px) 45vw, 400px';
const canHover = matchMedia('(hover: hover) and (pointer: fine)');

function cardHTML(f) {
  const cat = CATEGORIES.find((c) => c.id === f.category);
  const name = displayName(f);
  const img = f.images || {};
  const main = hasImage(f.slug, 'principal')
    ? productStageHTML(f, img.principal || {}, { sizes: SIZES, alt: name })
    : placeholderHTML(cat.tone, 'principal', 'foto do produto');
  const tex = hasImage(f.slug, 'textura')
    ? pictureHTML(f.slug, 'textura', img.textura || {}, { sizes: SIZES, alt: `Textura — ${name}`, deferred: true })
    : placeholderHTML(cat.tone, 'textura', 'macro da textura');
  const off = f.status === 'fora';
  return `
  <article class="flavor-card${off ? ' is-off' : ''}${f.preview ? ' is-preview' : ''}" data-flavor-card>
    <a class="flavor-card__link" href="${flavorUrl(f.slug)}" aria-label="Ver sabor: ${name}"></a>
    <div class="flavor-card__media" data-flavor-media>
      <div class="flavor-card__layer flavor-card__layer--main">${main}</div>
      <div class="flavor-card__layer flavor-card__layer--texture" data-flavor-texture>${tex}</div>
      <button class="flavor-card__switch t-sm" type="button" aria-pressed="false" data-flavor-toggle tabindex="-1">
        <span>Produto</span><span>Textura</span>
      </button>
    </div>
    <div class="flavor-card__info">
      <h4 class="flavor-card__name t-h4">${name}</h4>
      <div class="flavor-card__meta t-sm">
        <span class="flavor-card__cat">${cat.singular}${off ? ` · ${STATUS.fora.label}` : ''}</span>
        <span class="flavor-card__cta" aria-hidden="true">Ver sabor <svg><use href="#i-arrow-right"/></svg></span>
      </div>
    </div>
  </article>`;
}

/* ---- per-card behaviour ---- */
function bindCard(card, io) {
  const media = card.querySelector('[data-flavor-media]');
  const tex = card.querySelector('[data-flavor-texture]');
  const btn = card.querySelector('[data-flavor-toggle]');
  const origin = (e) => {
    const r = media.getBoundingClientRect();
    media.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    media.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  };
  const set = (on) => {
    card.classList.toggle('is-texture', on);
    btn.setAttribute('aria-pressed', String(on));
    btn.setAttribute('aria-label', on ? 'Mostrar produto' : 'Mostrar textura');
  };
  set(false);

  // desktop: hover / keyboard focus
  card.addEventListener('pointerenter', (e) => {
    if (e.pointerType !== 'mouse') return;
    origin(e); hydrate(tex); set(true);
  });
  card.addEventListener('pointerleave', (e) => {
    if (e.pointerType !== 'mouse') return;
    origin(e); set(false);
  });
  const link = card.querySelector('.flavor-card__link');
  link.addEventListener('focus', () => { if (link.matches(':focus-visible')) { hydrate(tex); set(true); } });
  link.addEventListener('blur', () => set(false));

  // touch: tap on the photo toggles (the switch pill mirrors the state)
  media.addEventListener('click', (e) => {
    if (canHover.matches) return;
    e.preventDefault();
    origin(e);
    hydrate(tex).then(() => set(!card.classList.contains('is-texture')));
  });

  io?.observe(card);
}

export function initProducts() {
  const root = document.querySelector('[data-products]');
  if (!root) return;
  const tabs = root.querySelector('[data-tabs]');
  const grid = root.querySelector('[data-product-grid]');

  // textures are fetched only for cards near the viewport, when the browser is idle
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          io.unobserve(en.target);
          idle(() => hydrate(en.target.querySelector('[data-flavor-texture]')));
        });
      }, { rootMargin: '300px 0px' })
    : null;

  tabs.innerHTML = CATEGORIES.map((c, i) =>
    `<button class="tab" type="button" role="tab" id="tab-${c.id}" aria-selected="${i === 0}" data-cat="${c.id}">${c.label}</button>`
  ).join('');

  const syncSwitch = () => grid.querySelectorAll('[data-flavor-toggle]').forEach((b) => { b.tabIndex = canHover.matches ? -1 : 0; });
  canHover.addEventListener?.('change', syncSwitch);

  const render = (id, animate) => {
    const cat = CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];
    grid.innerHTML = flavorsIn(cat.id).map(cardHTML).join('');
    grid.setAttribute('aria-labelledby', `tab-${cat.id}`);
    grid.querySelectorAll('[data-flavor-card]').forEach((c) => bindCard(c, io));
    syncSwitch();
    if (animate) { grid.classList.remove('is-switching'); void grid.offsetWidth; grid.classList.add('is-switching'); }
  };

  tabs.addEventListener('click', (e) => {
    const b = e.target.closest('.tab');
    if (!b || b.getAttribute('aria-selected') === 'true') return;
    tabs.querySelectorAll('.tab').forEach((t) => t.setAttribute('aria-selected', String(t === b)));
    render(b.dataset.cat, true);
  });
  render(CATEGORIES[0].id, false);
}
