/**
 * SABORES LULO'S — fonte única de dados.
 * A Home (tabs + cards) e a página individual (sabor.html) leem tudo daqui.
 * Para adicionar um sabor: acrescente um objeto em FLAVORS e gere as imagens
 * com tools/sabores/gerar_imagens.py. Nada mais precisa ser construído.
 *
 * ── Modelo de um sabor ─────────────────────────────────────────────────────
 * {
 *   slug:        'pistache',                 // URL: /sabores/pistache
 *   name:        'Pistache',
 *   category:    'fixo' | 'sazonal' | 'sorbet',
 *   status:      'disponivel' | 'fora',      // disponibilidade ≠ categoria
 *   order:       1,                          // ordem dentro da categoria
 *   images: {                                // enquadramento das fotos (os arquivos vêm do pipeline)
 *     principal: { focal: '50% 50%', alt: '' },   // produto (pote, colher, composição)
 *     textura:   { focal: '50% 50%', alt: '' },   // macro do gelato
 *   },                                       // focal = object-position do recorte 4:5 (x% y%)
 *   backdrop:    'bordo',                    // cor da massa gráfica atrás de um produto recortado (PNG transparente)
 *                                            // só cores da paleta: 'bordo' | 'red' | 'navy' | 'sky' | 'creme' — omita para não ter massa
 *   shortDescription: '',                    // 1 frase — card / topo da página
 *   description:      '',                    // texto sobre o sabor (parágrafos separados por linha em branco)
 *   story: { kind: '', title: '', text: '' },// curiosidade / história (kind: 'Como surgiu', 'Colaboração'…)
 *   ingredients: [],                         // ['leite', 'pistache', …]
 *   allergens:   [],                         // ['Contém leite', …]
 *   nutrition: { portion: '', rows: [] },    // rows: [{ label: 'Valor energético', value: '…', dv: '…' }]
 * }
 *
 * Não preencha nada que não tenha sido fornecido pela Lulo's.
 */

export const CATEGORIES = [
  { id: 'fixo',    label: 'Fixos',    singular: 'Fixo',    tone: 'red'  },
  { id: 'sazonal', label: 'Sazonais', singular: 'Sazonal', tone: 'navy' },
  { id: 'sorbet',  label: 'Sorbets',  singular: 'Sorbet',  tone: 'sky'  },
];

export const STATUS = {
  disponivel: { label: 'No cardápio' },
  fora:       { label: 'Fora do cardápio no momento' },
};

/**
 * Sabores reais — cadastro inicial (nome, categoria e ordem informados pela Lulo's).
 * Descrições, ingredientes, alergênicos, nutrição e histórias ainda NÃO foram fornecidos:
 * os campos ficam vazios e aparecem como "a preencher" só na página do sabor.
 * Fotos: só Puro Pistache tem arquivos até agora (ver js/flavor-assets.js).
 */
const f = (slug, name, category, order, extra = {}) => ({
  slug, name, category, order, status: 'disponivel',
  images: {}, shortDescription: '', description: '',
  story: { kind: '', title: '', text: '' },
  ingredients: [], allergens: [], nutrition: { portion: '', rows: [] },
  ...extra,
});

export const FLAVORS = [
  // FIXOS
  f('pudim',                        'Pudim',                           'fixo', 1),
  f('alfajor',                      'Alfajor',                         'fixo', 2),
  f('doce-de-leite',                'Doce de Leite',                   'fixo', 3),  // ⚠ DUPLICIDADE: também informado em Sazonais — confirmar a categoria certa e remover um dos dois
  f('iogurte-com-amarena',          'Iogurte com Amarena',             'fixo', 4),
  f('gelato-de-cafe-com-caramelo',  'Gelato de Café com Caramelo',     'fixo', 5),
  f('puro-pistache',                'Puro Pistache',                   'fixo', 6, {
    backdrop: 'bordo',
    images: {
      principal: { focal: '50% 50%', alt: 'Puro Pistache na colher' },
      textura:   { focal: '50% 50%', alt: 'Textura do Puro Pistache em macro' },
    },
  }),
  f('chocolate-com-brownie',        'Chocolate com Brownie',           'fixo', 7),

  // SAZONAIS
  f('doce-de-leite-sazonal',        'Doce de Leite',                   'sazonal', 1),  // ⚠ DUPLICIDADE (ver Fixos) — slug provisório
  f('avela-crocante-com-chocolate-branco', 'Avelã Crocante com Chocolate Branco', 'sazonal', 2),

  // SORBETS
  f('framboesa-com-melancia',       'Framboesa com Melancia',          'sorbet', 1),
];

/**
 * Pré-visualização com espaços vazios por categoria (usada antes do cadastro real).
 * Desligada: agora a Home e as páginas mostram só os sabores cadastrados acima.
 */
export const PREVIEW = false;

/** Mostra avisos "a preencher" nos campos vazios da página do sabor (nunca nos cards da Home). */
export const SHOW_MISSING = true;

const PREVIEW_COUNT = { fixo: 6, sazonal: 3, sorbet: 2 };
const previewFor = (cat) =>
  Array.from({ length: PREVIEW_COUNT[cat] || 0 }, (_, i) => ({
    slug: `${cat}-${String(i + 1).padStart(2, '0')}`,
    name: '',
    category: cat,
    status: 'disponivel',
    order: i + 1,
    images: {},
    preview: true,
  }));

export function flavorsIn(cat) {
  const real = FLAVORS.filter((f) => f.category === cat).sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  return real.length || !PREVIEW ? real : previewFor(cat);
}

/** Todos os sabores na ordem do site (categoria → ordem) — usado na navegação anterior/próximo. */
export function allFlavors() {
  return CATEGORIES.flatMap((c) => flavorsIn(c.id));
}

export const findFlavor = (slug) => allFlavors().find((f) => f.slug === slug);
export const categoryOf = (f) => CATEGORIES.find((c) => c.id === f.category) || CATEGORIES[0];
export const displayName = (f) => f.name || 'Nome do sabor';
