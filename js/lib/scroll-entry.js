/**
 * Entry scroll position for flavor pages.
 *
 * Cause of the "page opens at the end" bug: the preview shows the site inside a frame whose
 * scroll belongs to the host page (the frame grows with the document). A newly loaded document
 * in that frame starts at its own scrollY = 0, but the host keeps the offset the Home had
 * (≈ the Sabores section), which on the shorter flavor page lands near the footer.
 * Browsers can also restore a stale offset on reload (history.scrollRestoration = 'auto').
 *
 * Fix: every fresh entry (link, reload, direct URL) starts at the top of the document —
 * including any ancestor scroller — while back/forward keeps the browser's restoration.
 */
export function startAtTop() {
  const nav = performance.getEntriesByType?.('navigation')?.[0];
  if (nav && nav.type === 'back_forward') return;           // "Voltar" keeps its position
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const top = () => {
    window.scrollTo(0, 0);
    // also scrolls any scrollable ancestor (e.g. a host frame that sizes to the document)
    try { document.documentElement.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'instant' }); } catch (e) { /* old browsers */ }
  };
  top();
  // once more after layout settles (fonts, images with explicit sizes)
  requestAnimationFrame(top);
  window.addEventListener('load', top, { once: true });
}

/**
 * Home: when the visitor comes back ("Voltar") from a flavor page, return exactly to where
 * they were (the Sabores section). The browser's own restoration runs before lazy content and
 * the smooth-scroll layer settle, so it can land a few hundred pixels off — we store the
 * position on leave and re-apply it once the page is laid out.
 */
export function rememberScroll(key, lenis) {
  const k = `lulos:scroll:${key}`;
  let left = null;
  addEventListener('pagehide', () => {
    left = scrollY;
    try { sessionStorage.setItem(k, String(scrollY)); } catch (e) { /* storage off */ }
  });
  // back/forward cache: the page is resumed as it was, but the smooth-scroll layer may still hold
  // an unfinished target — pin it to the position the visitor left from
  addEventListener('pageshow', (e) => {
    if (!e.persisted || left === null) return;
    const y = left;
    lenis?.scrollTo(y, { immediate: true, force: true });
    window.scrollTo(0, y);
  });
  const nav = performance.getEntriesByType?.('navigation')?.[0];
  if (!nav || nav.type !== 'back_forward') return;
  let y = null;
  try { y = parseFloat(sessionStorage.getItem(k)); } catch (e) { /* storage off */ }
  if (!Number.isFinite(y)) return;
  const go = () => { window.scrollTo(0, y); lenis?.scrollTo(y, { immediate: true, force: true }); };
  requestAnimationFrame(go);
  addEventListener('load', () => requestAnimationFrame(go), { once: true });
}
