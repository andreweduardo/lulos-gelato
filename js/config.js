/**
 * Links e rotas do site — fonte única.
 * Alterar uma URL aqui atualiza todos os elementos com o data-atributo correspondente
 * (o href estático no HTML é só a versão sem JavaScript do mesmo link).
 */

/** Página da Lulo's no iFood — todos os pontos de pedido do site usam esta URL. */
export const ORDER_URL = 'https://www.ifood.com.br/delivery/curitiba-pr/lulos-gelato-vila-izabel/eab49cfd-b926-47e3-b847-c1823b3fb209?utm_medium=shar';

export const LINKS = {
  ifood: ORDER_URL,                          // [data-ifood="<origem>"] — origem: cabecalho, sabores, cta-final, rodape, pagina-sabor
  instagram: '',                             // ⚠ pendente: URL oficial do Instagram da Lulo's
  vier: 'https://www.estudiovier.com.br',    // crédito "Feito por Estúdio Vier"
  about: 'historia/',                         // página "Conheça a história" (/historia)
};

/**
 * Rotas.
 *  flavor: padrão de URL da página de cada sabor.
 *   - 'sabor.html?s={slug}'  → funciona em qualquer hospedagem estática (usado na prévia)
 *   - 'sabores/{slug}'       → URL final /sabores/pistache (exige a regra de reescrita em _redirects/.htaccess)
 */
export const ROUTES = {
  home: './',
  flavor: 'sabor.html?s={slug}',
  privacy: 'politica-de-privacidade/',
  terms: 'termos-de-uso/',
};
export const flavorUrl = (slug) => ROUTES.flavor.replace('{slug}', encodeURIComponent(slug));

/** Links que saem do site: abrem em nova aba, sem repassar a página de origem. */
const EXTERNAL = new Set(['ifood', 'instagram', 'vier']);

export function applyLinks(root = document) {
  const map = { ifood: '[data-ifood]', instagram: '[data-instagram]', vier: '[data-vier]', about: '[data-about]' };
  Object.entries(map).forEach(([key, sel]) => {
    root.querySelectorAll(sel).forEach((a) => {
      if (LINKS[key]) {
        a.href = LINKS[key];
        if (EXTERNAL.has(key)) {
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          if (!a.hasAttribute('aria-label')) a.setAttribute('aria-label', `${a.textContent.trim()} (abre em nova aba)`);
        }
        a.removeAttribute('data-pending');
      } else {
        a.setAttribute('data-pending', key);         // link not configured yet
        a.removeAttribute('target');
        a.addEventListener('click', (e) => e.preventDefault());
      }
    });
  });
  root.querySelectorAll('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
}
