/**
 * Entry point — each module is independent and reads its own data-* hooks.
 */
import { initSmoothScroll, lenis } from './modules/smooth-scroll.js';
import { rememberScroll } from './lib/scroll-entry.js';
import { initNav } from './modules/nav.js';
import { initRollingButtons } from './modules/rolling-button.js';
import { initReveal } from './modules/reveal.js';
import { initHero } from './modules/hero.js';
import { initManifesto } from './modules/manifesto.js';
import { applyLinks } from './config.js';
import { initProducts } from './modules/products.js';
import { initVideoScroll } from './modules/video-scroll.js';
import { initWords } from './modules/words.js';
import { initSpin } from './modules/spin.js';
import { initTickers } from './modules/ticker.js';
import { initSlideshows } from './modules/slideshow.js';
import { initImageReveal } from './modules/image-reveal.js';
import { initAccordion } from './modules/accordion.js';
import { initCtaImages } from './modules/cta.js';
import { initFooter } from './modules/footer.js';

const safe = (fn) => { try { fn(); } catch (e) { console.error(e); } };

safe(initSmoothScroll);
safe(applyLinks);
safe(initNav);
safe(initProducts);
safe(initRollingButtons);
safe(initHero);
safe(initManifesto);
safe(initReveal);
safe(initVideoScroll);
safe(initWords);
safe(initSpin);
safe(initTickers);
safe(initSlideshows);
safe(initImageReveal);
safe(initAccordion);
safe(initCtaImages);
safe(initFooter);
safe(() => rememberScroll('home', lenis));
