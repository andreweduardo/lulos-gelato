/**
 * Primary button: splits the label into letters that roll up on hover
 * (Framer "Rolling Text": duration .4s, ease [.82,.08,.29,1], stagger 55%)
 * and injects the brown "filler" that rises from below.
 */
export function initRollingButtons(root = document) {
  root.querySelectorAll('[data-roll]').forEach((btn) => {
    if (btn.dataset.rollReady) return;
    const text = btn.textContent.trim();
    btn.dataset.rollReady = '1';
    if (!btn.hasAttribute('aria-label')) btn.setAttribute('aria-label', text);
    btn.textContent = '';
    const filler = document.createElement('span');
    filler.className = 'btn-primary__filler';
    filler.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    label.className = 'btn-primary__label';
    label.setAttribute('aria-hidden', 'true');
    const n = text.length;
    [...text].forEach((ch, i) => {
      const s = document.createElement('span');
      s.textContent = ch === ' ' ? ' ' : ch;
      s.style.transitionDelay = `${((0.4 / n) * i * 0.55).toFixed(3)}s`;
      label.appendChild(s);
    });
    btn.append(filler, label);
  });
}
