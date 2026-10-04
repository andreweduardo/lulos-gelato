/** FAQ accordion — one item open at a time; clicking the open item closes it */
export function initAccordion() {
  document.querySelectorAll('[data-accordion]').forEach((list) => {
    const items = [...list.querySelectorAll('.faq-item')];
    const set = (item, open) => {
      item.classList.toggle('is-open', open);
      item.querySelector('.faq-item__q')?.setAttribute('aria-expanded', String(open));
    };
    items.forEach((item) => {
      item.addEventListener('click', () => {
        const willOpen = !item.classList.contains('is-open');
        items.forEach((o) => set(o, false));
        if (willOpen) set(item, true);
      });
    });
  });
}
