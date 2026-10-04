/** Páginas simples (Política de Privacidade, Termos de Uso): header, links, botões e rodapé. */
import { initSmoothScroll } from './modules/smooth-scroll.js';
import { initNav } from './modules/nav.js';
import { initRollingButtons } from './modules/rolling-button.js';
import { initFooter } from './modules/footer.js';
import { initTickers } from './modules/ticker.js';
import { applyLinks } from './config.js';
import { startAtTop } from './lib/scroll-entry.js';

const safe = (fn) => { try { fn(); } catch (e) { console.error(e); } };
safe(startAtTop);
safe(initSmoothScroll);
safe(applyLinks);
safe(initNav);
safe(initRollingButtons);
safe(initTickers);
safe(initFooter);
