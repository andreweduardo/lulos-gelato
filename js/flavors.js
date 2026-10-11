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
 *   shortDescription: '',                    // 1 frase — topo da página do sabor
 *   serving:     '',                         // pote / rendimento (ex.: 'Pote de 500 ml · serve até 4 pessoas')
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
  { id: 'fixo',    label: 'Fixos',    singular: 'Fixo',    tone: 'red',  empty: '' },
  { id: 'sazonal', label: 'Sazonais', singular: 'Sazonal', tone: 'navy', empty: 'Os sazonais aparecem e vão embora. No momento, nenhum está no cardápio.' },
  { id: 'sorbet',  label: 'Sorbets',  singular: 'Sorbet',  tone: 'sky',  empty: 'No momento, nenhum sorbet está no cardápio.' },
];

export const STATUS = {
  disponivel: { label: 'No cardápio' },
  fora:       { label: 'Fora do cardápio no momento' },
};

/**
 * Sabores reais — cardápio informado pela Lulo's (ordem de exibição = ordem abaixo).
 * Descrições, ingredientes e alergênicos: transcritos dos descritivos do iFood enviados pela Lulo's.
 * Curiosidades: PROVISÓRIAS (texto sugerido, revisar com a Lulo's).
 * Informação nutricional: ainda não fornecida — aparece como "Em breve".
 * A massa de cor atrás da colher alterna bordô / azul-marinho dentro de cada categoria.
 */
const f = (slug, name, category, order, extra = {}) => ({
  slug, name, category, order, status: 'disponivel',
  images: {
    principal: { focal: '50% 50%', alt: `${name} na colher` },
    textura:   { focal: '50% 50%', alt: `Textura do ${name}` },
  },
  shortDescription: '', description: '', serving: '',
  story: { kind: 'curiosidade', title: '', text: '' },
  ingredients: [], allergens: [], nutrition: { portion: '', rows: [] },
  ...extra,
});

/* "Pode conter" comum aos descritivos do iFood */
const PODE_CONTER = 'aveia, centeio, cevada, amêndoa, amendoim, avelã, castanhas, castanha de caju, castanha-do-pará, macadâmia, nozes, pistache, pinoli e látex natural';

export const FLAVORS = [
  /* ── FIXOS ─────────────────────────────────────────────── */
  f('pudim', 'Pudim', 'fixo', 1, {
    backdrop: 'bordo',
    story: {
      kind: 'curiosidade',
      title: 'Doce de convento',
      text: 'O pudim de leite que a gente conhece descende dos doces conventuais portugueses, feitos com as gemas que sobravam — as claras iam para engomar roupas. Chegou ao Brasil com os portugueses e virou sobremesa de domingo.',
    },
  }),
  f('puro-pistache', 'Puro Pistache', 'fixo', 2, {
    backdrop: 'navy',
    shortDescription: 'Pasta de pistache siciliano, base pura e cremosa, com mesclas e crocantes de pistache.',
    description: 'Feito com pasta de pistache siciliano, matéria-prima de origem controlada que entrega cor vibrante e sabor intenso e inconfundível.\n\nBase pura e cremosa, finalizada com mesclas e crocantes de pistache que aprofundam o sabor e trazem textura a cada colherada.',
    serving: 'Pote de 500 ml · serve até 4 pessoas (aprox. 410 g)',
    ingredients: ['pasta de pistache siciliano', 'mesclas de pistache', 'crocantes de pistache'],
    story: {
      kind: 'curiosidade',
      title: 'O ouro verde de Bronte',
      text: 'O pistache siciliano mais famoso cresce em Bronte, nas encostas do vulcão Etna. Lá a colheita acontece só a cada dois anos — por isso ele é chamado de “ouro verde”.',
    },
  }),
  f('alfajor', 'Alfajor', 'fixo', 3, {
    backdrop: 'bordo',
    shortDescription: 'Doce de leite com especiarias de alfajor argentino, chocolate e pedaços da massa.',
    description: 'A base é um gelato de doce de leite infusionado com as especiarias que compõem um bom alfajor argentino — raspas de limão Tahiti e laranja-baía, além de essência e extratos de baunilha — que perfumam a massa e trazem aquela complexidade cítrica por trás da doçura do doce de leite.\n\nMesclas de flocos de chocolate, doce de leite e massa de alfajor percorrem o gelato, recriando em cada colherada a mordida clássica do alfajor: o crocante da massa, o cremoso do doce de leite e o contraste do chocolate.',
    serving: 'Pote de 500 ml · serve até 3 pessoas (aprox. 420 g)',
    ingredients: ['doce de leite', 'raspas de limão Tahiti', 'raspas de laranja-baía', 'essência e extratos de baunilha', 'flocos de chocolate', 'massa de alfajor'],
    allergens: ['Contém leite e derivados, trigo e ovo.', `Pode conter soja, ${PODE_CONTER}.`],
    story: {
      kind: 'curiosidade',
      title: 'De Al-Andalus a Buenos Aires',
      text: 'O nome alfajor vem do árabe e o doce nasceu na Espanha moura. Atravessou o Atlântico com os espanhóis e, na Argentina, ganhou o recheio de doce de leite e a cobertura de chocolate que viraram a sua cara.',
    },
  }),
  f('cafe-com-caramelo', 'Café com Caramelo', 'fixo', 4, {
    backdrop: 'navy',
    shortDescription: 'Fior di latte com café extraído a frio por 24 horas, caramelo de café e avelãs crocantes.',
    description: 'Base de fior di latte com café extraído a frio por 24 horas — uma técnica que preserva as notas suaves e aromáticas do café, sem acidez.\n\nTextura aveludada e cremosa, com mesclas de caramelo de café artesanal e avelãs crocantes para um contraste irresistível a cada colherada.',
    serving: 'Pote de 500 ml · serve até 4 pessoas (aprox. 410 g)',
    ingredients: ['fior di latte', 'café extraído a frio', 'caramelo de café artesanal', 'avelãs crocantes'],
    story: {
      kind: 'curiosidade',
      title: 'Paciência que vira sabor',
      text: 'Na extração a frio, o café nunca encontra água quente: ele descansa por horas em água fria. O resultado é uma bebida mais doce e redonda, com menos acidez e amargor.',
    },
  }),
  f('iogurte-com-amarena', 'Iogurte com Amarena', 'fixo', 5, {
    backdrop: 'bordo',
    shortDescription: 'Iogurte grego feito na casa, baunilha em fava e mesclas de calda de amarena.',
    description: 'Feito com iogurte grego produzido na casa, cremoso e aveludado, com acidez equilibrada e textura que derrete na boca.\n\nAromatizado com fava de baunilha para acentuar a doçura natural, e finalizado com mesclas de calda de amarena, que trazem cor, frescor e um toque agridoce irresistível.',
    serving: 'Pote de 500 ml · serve até 4 pessoas (aprox. 410 g)',
    ingredients: ['iogurte grego produzido na casa', 'fava de baunilha', 'calda de amarena'],
    allergens: ['Contém leite e derivados e derivados de soja.', `Pode conter trigo, ovo, ${PODE_CONTER}.`],
    story: {
      kind: 'curiosidade',
      title: 'A cereja de Bolonha',
      text: 'Amarena é uma cereja ácida da região de Bolonha, na Itália. Conservada em calda, virou companheira clássica do gelato italiano — o agridoce dela corta a cremosidade do jeito certo.',
    },
  }),
  f('chocolate-com-brownie', 'Chocolate com Brownie', 'fixo', 6, {
    backdrop: 'navy',
    shortDescription: 'Chocolate alcalino intenso, pedaços de brownie super fudge e caramelo de cacau.',
    description: 'Feito com chocolate alcalino de alta solubilidade — uma matéria-prima que entrega cor intensa e sabor profundo sem amargor excessivo.\n\nBase cremosa intercalada com pedaços de brownie super fudge de chocolate e mesclas de caramelo de cacau, que intensificam e alongam o sabor do chocolate em cada colherada.',
    serving: 'Pote de 500 ml · serve até 4 pessoas (aprox. 410 g)',
    ingredients: ['chocolate alcalino', 'brownie super fudge de chocolate', 'caramelo de cacau'],
    allergens: ['Contém glúten.', 'Contém leite e derivados e derivados de soja.', `Pode conter trigo, ovo, ${PODE_CONTER}.`],
    story: {
      kind: 'curiosidade',
      title: 'Nascido num hotel',
      text: 'Conta a história que o brownie foi criado na cozinha do Palmer House, em Chicago, em 1893 — um doce que coubesse numa lancheira e pudesse ser comido sem prato nem garfo.',
    },
  }),
  f('doce-de-leite', 'Doce de Leite', 'fixo', 7, {
    backdrop: 'bordo',
    shortDescription: 'Doce de leite mineiro Rocca na base e em camadas — puro doce de leite, do início ao fim.',
    description: 'A base é feita com doce de leite mineiro Rocca, preparado da forma tradicional — leite e açúcar cozidos lentamente até o ponto de cor e cremosidade que só o doce de leite de Minas tem — e incorporado inteiro à mistura do gelato.\n\nMesclas de doce de leite percorrem o gelato em camadas, garantindo aquele contraste de cremosidade a cada colherada — puro doce de leite, do início ao fim.',
    serving: 'Pote de 500 ml · serve até 4 pessoas (aprox. 420 g)',
    ingredients: ['doce de leite mineiro Rocca', 'mesclas de doce de leite'],
    allergens: ['Contém leite e derivados.', `Pode conter soja, trigo, ovo, ${PODE_CONTER}.`],
    story: {
      kind: 'curiosidade',
      title: 'Um descuido que deu certo',
      text: 'Uma das lendas mais contadas diz que o doce de leite nasceu de um esquecimento: uma panela de leite com açúcar ficou tempo demais no fogo e virou outra coisa. Argentinos e uruguaios disputam a origem; os mineiros só seguem fazendo.',
    },
  }),

  /* ── SAZONAIS ──────────────────────────────────────────── */
  f('mousse-de-maracuja', 'Mousse de Maracujá', 'sazonal', 1, {
    backdrop: 'bordo',
    shortDescription: 'Três texturas de maracujá: mousse aerada, caramelo com sementes e marshmallow maçaricado.',
    description: 'A base é um gelato de leite combinado com suco natural de maracujá bem concentrado, trazendo a acidez intensa da fruta em contraste com a cremosidade do leite. Durante o processo, a massa ganha leveza e uma textura aerada que lembra uma mousse de maracujá clássica: cremosa, delicada e levemente ácida.\n\nUma mescla de caramelo de maracujá com sementes inteiras percorre o gelato, intensificando a presença da fruta e trazendo mais acidez e textura a cada colherada. Para finalizar, marshmallow de maracujá maçaricado por cima adiciona uma camada leve e cremosa, com notas tostadas que equilibram a acidez da fruta.\n\nTrês texturas e três formas de sentir o maracujá em um único sabor: a leveza da mousse, a intensidade do caramelo com a fruta e a cremosidade do marshmallow maçaricado.',
    serving: 'Pote de 500 ml · serve até 3 pessoas (aprox. 420 g)',
    ingredients: ['leite', 'suco natural de maracujá', 'caramelo de maracujá com sementes', 'marshmallow de maracujá'],
    story: {
      kind: 'curiosidade',
      title: 'Fruto de se tomar',
      text: 'O nome maracujá vem do tupi e costuma ser traduzido como “alimento que se toma de sorvo” — exatamente como muita gente come: abrindo ao meio e puxando com a colher.',
    },
  }),
  f('brigadeiro', 'Brigadeiro', 'sazonal', 2, {
    backdrop: 'navy',
    shortDescription: 'Chocolate cremoso infusionado com brigadeiro de verdade e muito granulado.',
    description: 'Um gelato que carrega a alma da festa de aniversário brasileira: base cremosa de chocolate, infusionada com brigadeiro de verdade, e generosas porções de granulado misturadas em cada colherada.\n\nO resultado é um gelato intenso, achocolatado e com aquele gostinho de infância que só o brigadeiro sabe entregar.',
    serving: 'Pote de 500 ml · serve até 3 pessoas (aprox. 420 g)',
    ingredients: ['chocolate', 'brigadeiro', 'granulado'],
    allergens: ['Contém leite e derivados.', `Pode conter soja, ${PODE_CONTER}.`],
    story: {
      kind: 'curiosidade',
      title: 'Doce de campanha',
      text: 'A história mais conhecida liga o brigadeiro à campanha presidencial do Brigadeiro Eduardo Gomes, em 1945: o docinho era vendido em festas para arrecadar fundos e acabou ficando com o nome do candidato.',
    },
  }),
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
