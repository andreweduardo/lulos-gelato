/**
 * Responsive images for flavors.
 * Files + dimensions come from tools/sabores/gerar_imagens.py (→ js/flavor-assets.js):
 *   assets/img/sabores/<slug>/<kind>-<width>.<avif|webp|jpg|png>   kind = principal | textura
 * Framing is done here, not in the files: the slot is 4:5 with object-fit: cover and the
 * focal point comes from js/flavors.js (images.<kind>.focal) — no CSS edits needed.
 */
import { FLAVOR_ASSETS } from '../flavor-assets.js';

const DIR = 'assets/img/sabores';
export const assetOf = (slug, kind) => FLAVOR_ASSETS[slug]?.[kind] || null;
export const hasImage = (slug, kind) => !!assetOf(slug, kind);

const srcset = (base, widths, ext) => widths.map((w) => `${base}-${w}.${ext} ${w}w`).join(', ');

/**
 * <picture> markup.
 *  deferred: sources/src are kept in data-* and only attached by hydrate() (hover textures)
 *  priority: eager + fetchpriority=high (first visible image of a page)
 */
export function pictureHTML(slug, kind, meta = {}, { sizes, alt = '', deferred = false, priority = false } = {}) {
  const a = assetOf(slug, kind);
  if (!a) return '';
  const base = `${DIR}/${slug}/${kind}`;
  const set = deferred ? 'data-srcset' : 'srcset';
  const focal = ` style="object-position:${meta.focal || '50% 50%'}"`;
  // deferred images are already lazy (attached by hydrate()); native lazy-loading would wait while the layer is masked
  const load = priority ? 'loading="eager" fetchpriority="high"' : deferred ? 'loading="eager" fetchpriority="low"' : 'loading="lazy"';
  const mid = a.widths.find((w) => w >= 800) || a.widths[a.widths.length - 1];
  const src = `${base}-${mid}.${a.fallback}`;
  return `<picture>
    ${a.avif ? `<source type="image/avif" ${set}="${srcset(base, a.widths, 'avif')}" sizes="${sizes}">` : ''}
    <source type="image/webp" ${set}="${srcset(base, a.widths, 'webp')}" sizes="${sizes}">
    <img ${deferred ? 'data-src' : 'src'}="${src}" ${set}="${srcset(base, a.widths, a.fallback)}" sizes="${sizes}" width="${a.w}" height="${a.h}" alt="${meta.alt || alt}" ${load} decoding="async"${focal}>
  </picture>`;
}

/** A cut-out product (transparent PNG master) — framed with `contain` over a colour mass, never cropped. */
export const isCutout = (slug, kind = 'principal') => assetOf(slug, kind)?.fallback === 'png';

/** Palette tokens allowed as the colour mass behind a cut-out product (flavor.backdrop). */
const BACKDROPS = { bordo: '--c-bordo', red: '--c-red', navy: '--c-navy', sky: '--c-sky', creme: '--c-creme' };

/**
 * Product stage = colour mass (behind) + transparent product photo (in front).
 * Used by the card and by the flavor page, so both read as the same object.
 */
export function productStageHTML(f, meta, opts) {
  const pic = pictureHTML(f.slug, 'principal', meta, opts);
  if (!isCutout(f.slug)) return pic;
  const token = BACKDROPS[f.backdrop];
  const mass = token ? `<span class="flavor-stage__mass" style="--mass:var(${token})" aria-hidden="true"></span>` : '';
  return `<div class="flavor-stage${token ? ' has-mass' : ''}">${mass}<div class="flavor-stage__product">${pic}</div></div>`;
}

/** Attach deferred sources inside `root` (idempotent). Resolves when the image is decoded. */
export function hydrate(root) {
  const img = root?.querySelector('img[data-src]');
  if (!img) return Promise.resolve();
  root.querySelectorAll('[data-srcset]').forEach((el) => { el.srcset = el.dataset.srcset; el.removeAttribute('data-srcset'); });
  img.src = img.dataset.src; img.removeAttribute('data-src');
  return img.decode ? img.decode().catch(() => {}) : Promise.resolve();
}

/** Placeholder surface shown while a photo does not exist yet (palette mass, no stock imagery). */
export const placeholderHTML = (tone, kind, label) =>
  `<span class="flavor-ph flavor-ph--${tone} flavor-ph--${kind}" aria-hidden="true"><span>${label}</span></span>`;
