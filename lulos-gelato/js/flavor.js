/**
 * Página individual do sabor (sabor.html) — um único template para todos os sabores.
 * Lê o slug de ?s=<slug> (prévia/hospedagem estática) ou de /sabores/<slug> (URL final)
 * e monta a página a partir de js/flavors.js.
 */
import { initSmoothScroll } from './modules/smooth-scroll.js';
import { initNav } from './modules/nav.js';
import { initRollingButtons } from './modules/rolling-button.js';
import { initReveal } from './modules/reveal.js';
import { initAccordion } from './modules/accordion.js';
import { initFooter } from './modules/footer.js';
import { applyLinks, flavorUrl, ROUTES, ORDER_URL } from './config.js';
import { allFlavors, findFlavor, categoryOf, displayName, STATUS, SHOW_MISSING } from './flavors.js';
import { pictureHTML, placeholderHTML, hasImage, productStageHTML } from './lib/flavor-images.js';
import { startAtTop } from './lib/scroll-entry.js';

const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const paras = (t) => esc(t).split(/\n\s*\n/).map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
const missing = (what) => (SHOW_MISSING ? `<p class="flavor-missing">${what} — a preencher</p>` : '');
const home = (hash = '') => `${ROUTES.home}${hash}`;

function slugFromUrl() {
  const q = new URLSearchParams(location.search).get('s');
  if (q) return q;
  const m = location.pathname.match(/\/sabores\/([^/]+)\/?$/);
  return m ? decodeURIComponent(m[1]) : '';
}

function orderBlock(f) {
  const off = f.status === 'fora';
  return `
  <section class="flavor-order${off ? ' is-off' : ''}" data-reveal="up">
    <div class="flavor-order__text">
      <p class="flavor-label t-sm">Disponibilidade</p>
      <p class="flavor-order__status">${off ? STATUS.fora.label : `${STATUS.disponivel.label}.`}</p>
    </div>
    ${off
      ? `<a class="flavor-order__alt t-nav" href="${home('#sabores')}">Ver sabores disponíveis <svg aria-hidden="true"><use href="#i-arrow-right"/></svg></a>`
      : `<a class="btn-primary" href="${ORDER_URL}" target="_blank" rel="noopener noreferrer" data-ifood="pagina-sabor" data-roll>Pedir pelo iFood</a>`}
  </section>`;
}

function infoBlock(f) {
  const ing = f.ingredients?.length ? `<p class="faq-item__a-text t-body">${esc(f.ingredients.join(', '))}.</p>` : '';
  const all = f.allergens?.length ? `<ul class="flavor-list t-body">${f.allergens.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : '';
  const n = f.nutrition || {};
  const nut = n.rows?.length ? `
    ${n.portion ? `<p class="flavor-label t-sm">Porção: ${esc(n.portion)}</p>` : ''}
    <table class="flavor-table t-body">
      <thead><tr><th scope="col">Nutriente</th><th scope="col">Quantidade</th><th scope="col">%VD*</th></tr></thead>
      <tbody>${n.rows.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.value)}</td><td>${esc(r.dv || '')}</td></tr>`).join('')}</tbody>
    </table>` : '';
  const items = [
    ['Ingredientes', ing, 'Ingredientes'],
    ['Alergênicos', all, 'Alergênicos'],
    ['Informação nutricional', nut, 'Tabela nutricional'],
  ].filter(([, html]) => html || SHOW_MISSING);
  if (!items.length) return '';
  return `
  <section class="flavor-info" data-reveal="up">
    <h2 class="flavor-info__title t-h5">Ficha do sabor</h2>
    <div class="faq-list flavor-info__list" data-accordion>
      ${items.map(([title, html, what]) => `
      <div class="faq-item">
        <button class="faq-item__q" type="button" aria-expanded="false">
          <h3 class="faq-item__q-text t-h4">${title}</h3>
          <svg class="faq-item__icon" aria-hidden="true"><use href="#i-arrow-up"/></svg>
        </button>
        <div class="faq-item__a"><div class="faq-item__a-inner"><div class="faq-item__a-text">${html || missing(what)}</div></div></div>
      </div>`).join('')}
    </div>
  </section>`;
}

function storyBlock(f) {
  const s = f.story || {};
  if (!s.text && !SHOW_MISSING) return '';
  return `
  <section class="flavor-story" data-reveal="up">
    <p class="flavor-story__kind t-detail">${esc(s.kind || 'curiosidade')}</p>
    ${s.title ? `<h2 class="flavor-story__title t-h2">${esc(s.title)}</h2>` : ''}
    <div class="flavor-story__text t-body">${s.text ? paras(s.text) : missing('Curiosidade / história do sabor')}</div>
  </section>`;
}

function pagerBlock(f) {
  const list = allFlavors();
  const i = list.findIndex((x) => x.slug === f.slug);
  if (list.length < 2) return '';
  const prev = list[(i - 1 + list.length) % list.length];
  const next = list[(i + 1) % list.length];
  const item = (x, dir) => `
    <a class="flavor-pager__item flavor-pager__item--${dir}" href="${flavorUrl(x.slug)}">
      <span class="flavor-label t-sm">${dir === 'prev' ? '← Sabor anterior' : 'Próximo sabor →'}</span>
      <span class="flavor-pager__name">${esc(displayName(x))}</span>
      <span class="flavor-pager__cat t-sm">${categoryOf(x).singular}</span>
    </a>`;
  return `
  <nav class="flavor-pager" aria-label="Outros sabores" data-reveal="up">
    ${item(prev, 'prev')}
    <a class="flavor-pager__all t-nav" href="${home('#sabores')}">Todos os sabores</a>
    ${item(next, 'next')}
  </nav>`;
}

function render(root, f) {
  const cat = categoryOf(f);
  const name = displayName(f);
  const img = f.images || {};
  const main = hasImage(f.slug, 'principal')
    ? productStageHTML(f, img.principal || {}, { sizes: '(max-width: 809.98px) calc(100vw - 40px), 56vw', alt: name, priority: true })
    : placeholderHTML(cat.tone, 'principal', 'foto do produto · 4:5');
  const tex = hasImage(f.slug, 'textura')
    ? pictureHTML(f.slug, 'textura', img.textura || {}, { sizes: '(max-width: 809.98px) calc(100vw - 40px), 38vw', alt: `Textura — ${name}` })
    : placeholderHTML(cat.tone, 'textura', 'macro da textura · 4:5');

  document.title = `${name} — Lulo’s Gelato`;
  const desc = document.querySelector('meta[name="description"]');
  if (desc && f.shortDescription) desc.content = f.shortDescription;

  root.innerHTML = `
  <section class="flavor-hero">
    <div class="flavor-hero__top t-nav" data-reveal="up">
      <a class="flavor-back" href="${home('#sabores')}"><svg aria-hidden="true"><use href="#i-arrow-right"/></svg> Sabores</a>
      <span class="flavor-hero__cat">${cat.singular}${f.status === 'fora' ? ` · ${STATUS.fora.label}` : ''}</span>
    </div>
    <h1 class="flavor-hero__name" data-reveal="up">${esc(name)}</h1>
    <div class="flavor-hero__lead t-body" data-reveal="up">${f.shortDescription ? `<p>${esc(f.shortDescription)}</p>` : missing('Descrição curta')}</div>
  </section>

  <section class="flavor-gallery" aria-label="Fotografias do sabor">
    <figure class="flavor-gallery__main" data-reveal="up">${main}<figcaption class="t-sm">Produto</figcaption></figure>
    <figure class="flavor-gallery__texture" data-reveal="up" data-reveal-delay="0.15">${tex}<figcaption class="t-sm">Textura</figcaption></figure>
  </section>

  <section class="flavor-about" data-reveal="up">
    <p class="flavor-about__label t-detail">o sabor</p>
    <div class="flavor-about__text">${f.description ? paras(f.description) : missing('Descrição completa')}</div>
  </section>

  ${storyBlock(f)}
  ${infoBlock(f)}
  ${orderBlock(f)}
  ${pagerBlock(f)}`;
}

function renderNotFound(root) {
  document.title = 'Sabor não encontrado — Lulo’s Gelato';
  root.innerHTML = `
  <section class="flavor-hero flavor-hero--empty">
    <h1 class="flavor-hero__name">Esse sabor não está aqui.</h1>
    <a class="btn-primary" href="${home('#sabores')}" data-roll>Ver todos os sabores</a>
  </section>`;
}

const safe = (fn) => { try { fn(); } catch (e) { console.error(e); } };
const root = document.querySelector('[data-flavor-page]');
const flavor = findFlavor(slugFromUrl());
flavor ? render(root, flavor) : renderNotFound(root);
startAtTop();   // before smooth scroll starts, so Lenis begins from 0
document.documentElement.classList.remove('flavor-pending');

safe(initSmoothScroll);
safe(applyLinks);
safe(initNav);
safe(initRollingButtons);
safe(initReveal);
safe(initAccordion);
safe(initFooter);
