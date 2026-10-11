/** Página Contato & Carreiras (/contato). */
import { initSmoothScroll, lenis } from './modules/smooth-scroll.js';
import { initNav } from './modules/nav.js';
import { initRollingButtons } from './modules/rolling-button.js';
import { initReveal } from './modules/reveal.js';
import { initFooter } from './modules/footer.js';
import { initTickers } from './modules/ticker.js';
import { initForms } from './modules/forms.js';
import { applyLinks } from './config.js';
import { OPENINGS } from './careers.js';

const safe = (fn) => { try { fn(); } catch (e) { console.error(e); } };
const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

function scrollToEl(el) {
  const top = el.getBoundingClientRect().top + scrollY - 24;
  if (lenis) lenis.scrollTo(top, { duration: 1.6 });
  else scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
}

/* "Contato" in the menu marks the current page */
function markNav() {
  document.querySelectorAll('.nav__links a[href$="contato/"]').forEach((a) => a.setAttribute('aria-current', 'page'));
}

/* jump links in the intro (href keeps a no-JS fallback) */
function initJumps() {
  document.querySelectorAll('.contact-intro__jump a').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').split('#')[1];
      const el = id && document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      scrollToEl(el);
      history.replaceState(null, '', `#${id}`);
    });
  });
}

/* real openings (js/careers.js) replace the "no openings" status and bring in the application form */
function renderOpenings() {
  if (!OPENINGS.length) return;
  const list = document.querySelector('[data-careers-openings]');
  document.querySelector('[data-careers-status]').hidden = true;
  list.innerHTML = OPENINGS.map((o) => `
    <li class="careers__opening">
      <p class="careers__opening-title">${esc(o.title)}</p>
      ${o.type ? `<p class="careers__opening-meta t-label">${esc(o.type)}</p>` : ''}
      ${o.description ? `<p class="careers__opening-text">${esc(o.description)}</p>` : ''}
      ${o.area ? `<button class="careers__opening-apply t-nav" type="button" data-apply-area="${esc(o.area)}">Candidatar-se</button>` : ''}
    </li>`).join('');
  list.hidden = false;
  mountApplication();
}

/* the application button + form live in a <template>: only mounted when there are openings */
function mountApplication() {
  const tpl = document.querySelector('[data-careers-template]');
  if (!tpl) return;
  const frag = tpl.content.cloneNode(true);
  const btn = frag.querySelector('[data-careers-toggle]');
  const panel = frag.querySelector('[data-careers-apply]');
  document.querySelector('.careers__body').append(btn);
  document.querySelector('.careers__inner').after(panel);
  tpl.remove();
}

/* "Quero fazer parte" opens the application form inside the page */
function initCareers() {
  const btn = document.querySelector('[data-careers-toggle]');
  const panel = document.querySelector('[data-careers-apply]');
  if (!btn || !panel) return;

  const open = (area) => {
    if (area) {
      const radio = [...panel.querySelectorAll('input[name=area]')].find((r) => r.value === area);
      if (radio) radio.checked = true;
    }
    if (panel.classList.contains('is-open')) { scrollToEl(panel); return; }
    panel.classList.add('is-open');
    panel.inert = false;
    btn.setAttribute('aria-expanded', 'true');
    const form = panel.querySelector('form');
    if (form) form._openedAt = Date.now();
    setTimeout(() => {
      scrollToEl(panel);
      panel.querySelector('.lfield__input')?.focus({ preventScroll: true });
      lenis?.resize?.();
    }, reduced ? 0 : 450);
  };
  btn.addEventListener('click', () => open());
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-apply-area]');
    if (b) open(b.dataset.applyArea);
  });
  if (location.hash === '#candidatura') open();
}

safe(markNav);
safe(renderOpenings);
safe(initSmoothScroll);
safe(applyLinks);
safe(initNav);
safe(initRollingButtons);
safe(initTickers);
safe(initReveal);
safe(initFooter);
safe(initForms);
safe(initJumps);
safe(initCareers);

// arriving with #fale / #carreiras: land on the section after layout settles
if (/^#(fale|carreiras)$/.test(location.hash)) {
  const el = document.querySelector(location.hash);
  if (el) setTimeout(() => scrollToEl(el), 60);
}
