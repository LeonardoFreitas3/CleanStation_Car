// Conteúdo do site público.
import {
  Sparkles, Disc3, ShieldCheck, Car, Wrench, Gem, SprayCan, ShieldPlus,
  Droplets, Lightbulb, CircleDot, Star,
  PawPrint, Wind, CloudFog, Layers, Scissors,
} from 'lucide-react';
import { LEVEL_BY_ID, minPrice } from './booking/pricing';

export const SITE = {
  name: 'Clean Station Car',
  tagline: 'Lavagem Detalhada Premium em Braga',
  subtitle: 'O detalhe que o teu carro merece.',
  phone: '+351 913 733 791',
  phoneRaw: '351913733791',
  email: 'cleanstationcar@gmail.com',
  address: 'R. Conselheiro Lobato 503, 4705-089 Braga',
  hours: 'Segunda a Sexta · 09:00 – 18:00',
  mapsShareUrl: 'https://maps.google.com/?q=R.+Conselheiro+Lobato+503,+4705-089+Braga',
  // Pagina de avaliacoes do perfil de empresa. Enquanto nao houver o link
  // directo do perfil (Google Business -> Partilhar -> Avaliacoes), fica a
  // pesquisa pelo nome, que abre o painel do perfil com as avaliacoes.
  reviewsUrl: process.env.REACT_APP_REVIEWS_URL || 'https://www.google.com/search?q=Clean+Station+Car+Braga#lrd=,1,,,',
  mapsEmbed:
    'https://www.google.com/maps?q=R.+Conselheiro+Lobato+503,+4705-089+Braga&output=embed',
};

export const FEATURES = [
  { icon: Gem,        label: 'Produtos Premium' },
  { icon: Sparkles,   label: 'Atenção ao Detalhe' },
  { icon: ShieldCheck,label: 'Resultados Duradouros' },
  { icon: Star,       label: 'Satisfação Garantida' },
];

// ─── Categorias de serviços ───────────────────────────────────────────────────
export const CATEGORIES = [
  { id: 'lavagens',       label: 'LAVAGENS',                   labelEn: 'WASHES',                    subtitle: 'Qual a diferença?',              subtitleEn: "What's the difference?",    icon: Droplets  },
  { id: 'polimentos',     label: 'POLIMENTOS E CORREÇÕES',     labelEn: 'POLISHING & CORRECTIONS',   subtitle: 'De volta ao brilho',              subtitleEn: 'Back to the shine',          icon: Gem       },
  { id: 'packs',          label: 'PACKS DE MANUTENÇÃO',        labelEn: 'MAINTENANCE PACKS',         subtitle: 'Duas lavagens por mês',          subtitleEn: 'Two washes a month',         icon: Layers    },
];

// Uma lavagem do catalogo: o nome, a descricao, o que inclui e o preco vem
// todos do pricing.js, que e a mesma tabela que a marcacao usa. Aqui so se
// acrescenta o que e do site — imagem, icone, categoria.
const lavagem = (levelId, extra) => {
  const nivel = LEVEL_BY_ID[levelId];
  return {
    category: 'lavagens',
    title: nivel.label.toUpperCase(),
    desc: nivel.desc,
    includes: nivel.includes,
    price: minPrice(levelId),
    priceByVehicle: nivel.prices,
    ...extra,
  };
};

export const SERVICES = [
  // ── LAVAGENS ──────────────────────────────────────────────────────────────
  lavagem('simples', { id: 'lavagem-simples', icon: Droplets, image: `${process.env.PUBLIC_URL}/img/lavagem-sm.webp` }),
  lavagem('selante', { id: 'lavagem-selante', icon: ShieldCheck, image: `${process.env.PUBLIC_URL}/img/proteção-sm.webp` }),
  lavagem('premium', { id: 'lavagem-premium', icon: ShieldPlus, image: `${process.env.PUBLIC_URL}/img/ceramica-longa-sm.webp` }),
  lavagem('detalhada', { id: 'lavagem-detalhada', icon: Car, image: `${process.env.PUBLIC_URL}/img/detail-sm.webp` }),

  // ── POLIMENTOS E CORREÇÕES ───────────────────────────────────────────────
  //
  // Sem preco: dependem do estado da pintura e sao orcamentados depois de ver
  // a viatura. O que se promete e o que o verniz deixa fazer — nao ha
  // "remove todos os riscos" nem "como novo".
  {
    id: 'polimento-1-etapa',
    onRequest: true,
    category: 'polimentos',
    title: 'POLIMENTO DE 1 ETAPA',
    desc: 'Para devolver o brilho e atenuar marcas ligeiras de lavagem e pequenos defeitos.',
    icon: Wrench,
    image: `${process.env.PUBLIC_URL}/img/polimento-sm.webp`,
    includes: [
      'Atenua marcas ligeiras e riscos superficiais',
      'Reduz hologramas',
      'Recupera o brilho e a profundidade da cor',
      'Termina com proteção da pintura',
    ],
  },
  {
    id: 'polimento-avancado',
    onRequest: true,
    category: 'polimentos',
    title: 'CORREÇÃO AVANÇADA DE PINTURA',
    desc: 'Várias etapas para riscos, marcas circulares e oxidação mais evidentes, respeitando os limites do verniz.',
    icon: Gem,
    image: `${process.env.PUBLIC_URL}/img/ceramica-longa-sm.webp`,
    includes: [
      'Reduz riscos e marcas circulares mais evidentes',
      'Corrige oxidação, até onde o verniz permite',
      'Uniformiza a cor e o acabamento',
      'Refinamento e proteção final',
    ],
  },
  {
    id: 'farois-dianteiros',
    onRequest: true,
    category: 'polimentos',
    title: 'POLIMENTO DE FARÓIS DIANTEIROS (PAR)',
    desc: 'Recupera faróis amarelados, opacos ou riscados, melhorando a estética e a passagem de luz.',
    icon: Lightbulb,
    // Nao ha fotografia de farois dianteiros: fica a do polimento ate haver.
    image: `${process.env.PUBLIC_URL}/img/polimento-sm.webp`,
    includes: [
      'Remove oxidação e opacidade',
      'Atenua riscos superficiais',
      'Melhora a passagem de luz',
      'Devolve a transparência',
    ],
  },
  {
    id: 'farois-traseiros',
    onRequest: true,
    category: 'polimentos',
    title: 'POLIMENTO DE FARÓIS TRASEIROS (PAR)',
    desc: 'Recupera o aspeto das luzes traseiras, removendo opacidade e riscos superficiais.',
    icon: CircleDot,
    image: `${process.env.PUBLIC_URL}/img/farois-traseiros-sm.webp`,
    includes: [
      'Remove desgaste e opacidade',
      'Atenua riscos superficiais',
      'Recupera a transparência',
      'Melhora o aspeto do veículo',
    ],
  },

  // ── PACKS DE MANUTENÇÃO ───────────────────────────────────────────────────
  //
  // São informativos. O preço está aqui para quem quer saber quanto custa, mas
  // o pack não se marca online: o cartão abre a ficha e a ficha manda para o
  // WhatsApp, como acontece com os polimentos. Por isso é que não entram no
  // catálogo do CRM nem no calculador de marcações — não há nada para escolher
  // num formulário, há uma conversa.
  //
  // O valor é o do carro, o mais baixo, e é por isso que leva "DESDE": uma
  // carrinha grande e um SUV pagam mais. Os números são os do catálogo de
  // agosto de 2026 e ficam escritos à mão de propósito — não saem do
  // pricing.js, porque a tabela de lá é a das lavagens avulso, e um pack não é
  // duas dessas.
  //
  // As condicoes (validade, lavagens nao usadas, renovacao) nao estao escritas
  // porque ainda nao foram decididas pelo negocio. Nao se inventam: ate la, a
  // ficha diz que se combinam no contacto.
  {
    id: 'pack-selante',
    category: 'packs',
    title: 'PACK SELANTE · 2x MÊS',
    desc: 'Duas lavagens com selante por mês, com prioridade na marcação',
    price: 65,
    icon: ShieldCheck,
    image: `${process.env.PUBLIC_URL}/img/proteção-sm.webp`,
    includes: [
      'Duas lavagens com selante por mês',
      'Tudo o que inclui a lavagem com selante',
      'Prioridade na marcação',
      'Marcação por contacto, para combinarmos as datas contigo',
    ],
  },
  {
    id: 'pack-premium',
    category: 'packs',
    title: 'PACK PREMIUM · 2x MÊS',
    desc: 'Duas lavagens premium por mês, com prioridade na marcação',
    price: 105,
    icon: ShieldPlus,
    image: `${process.env.PUBLIC_URL}/img/ceramica-longa-sm.webp`,
    includes: [
      'Duas lavagens premium por mês',
      'Tudo o que inclui a lavagem premium',
      'Prioridade na marcação',
      'Marcação por contacto, para combinarmos as datas contigo',
    ],
  },
  {
    id: 'pack-detalhada',
    category: 'packs',
    title: 'PACK DETALHADA · 2x MÊS',
    desc: 'Duas lavagens detalhadas por mês, com prioridade na marcação',
    price: 220,
    icon: Car,
    image: `${process.env.PUBLIC_URL}/img/detail-sm.webp`,
    includes: [
      'Duas lavagens detalhadas por mês',
      'Tudo o que inclui a lavagem detalhada',
      'Prioridade na marcação',
      'Marcação por contacto, para combinarmos as datas contigo',
    ],
  },
];

// O que vale para todos os packs. Escrito uma vez e mostrado na ficha de cada
// um; so o que ja esta decidido.
export const PACK_CONDICOES = [
  'Preço mensal para carro ou carrinha ligeira; carrinhas grandes e SUV têm valor próprio, confirmado antes de começar.',
  'Preço com IVA incluído.',
  'Uma viatura por pack, identificada pela matrícula.',
  'Sujidade fora do normal pode ter suplemento, sempre aprovado antes do serviço.',
  'Validade, lavagens não utilizadas e renovação combinam-se no contacto.',
];

export const PACK_CONDICOES_EN = [
  'Monthly price for a car or small van; large vans and SUVs have their own price, confirmed before we start.',
  'Price includes VAT.',
  'One vehicle per pack, identified by its number plate.',
  'Dirt beyond the normal may carry a supplement, always approved before the service.',
  'Validity, unused washes and renewal are agreed when you contact us.',
];

export const PROCESS = [
  { n: '01', title: 'AVALIAÇÃO', desc: 'Analisamos o estado do veículo para definir o melhor tratamento.', icon: Sparkles },
  { n: '02', title: 'LAVAGEM PROFUNDA', desc: 'Removemos sujidade, contaminantes e impurezas em profundidade.', icon: SprayCan },
  { n: '03', title: 'DETALHE & PROTEÇÃO', desc: 'Trabalhamos cada detalhe e aplicamos proteção de alta qualidade.', icon: Wrench },
  { n: '04', title: 'ENTREGA PREMIUM', desc: 'Entregamos o teu carro impecável e pronto para impressionar.', icon: Car },
];

// Avaliacoes reais do Google. Vazio ate serem recolhidas do perfil da
// empresa — os quatro testemunhos que aqui estavam eram inventados, e
// apresentar depoimentos ficticios como reais e publicidade enganosa.
//
// Formato de cada entrada:
//   { name, rating, text, date, car? }
// A seccao nao aparece no site enquanto o array estiver vazio.
export const TESTIMONIALS = [
  {
    name: 'carlos sá',
    rating: 5,
    text: 'Excelente serviço! O carro ficou impecável, parece que saiu novo do stand. Nota-se o cuidado e o profissionalismo em todos os pormenores da limpeza.',
  },
  {
    name: 'Bruno Macedo',
    rating: 5,
    text: 'Serviço incrível! Fui muito bem atendido e a lavagem da minha mota ficou impecável.',
  },
  {
    name: 'Rita Ribeiro',
    rating: 5,
    text: 'Serviço espetacular! O carro ficou como novo, tanto por dentro como por fora. Nota-se o cuidado com cada detalhe e a qualidade dos produtos utilizados.',
  },
  {
    name: 'Márcio Aguiar',
    rating: 5,
    text: 'Serviço excelente! Levei o carro bastante sujo e ficou impecável, parecia outro carro.',
  },
  {
    name: 'Ernesto André Fernandes',
    rating: 5,
    text: 'Serviço topo! Um espaço para o cuidado da limpeza auto mesmo no centro da cidade. Recomendado.',
  },
  {
    name: 'Ana Alves',
    rating: 5,
    text: 'Um trabalho impecável, o carro ficou novo. Excelente trabalho, continuem assim!',
  },
];

export const EXTRAS = [
  { id: 'pelos-animal',    label: 'Remoção de Pêlo de Animal',        price: 20, icon: PawPrint },
  { id: 'areia-praia',     label: 'Remoção de Areia de Praia',        price: 15, icon: Wind },
  { id: 'odores',          label: 'Tratamento de Odores',             price: 25, icon: CloudFog },
  { id: 'jantes-profunda', label: 'Limpeza Profunda de Jantes',       price: 25, icon: Disc3 },
  { id: 'plasticos-inter', label: 'Proteção de Plásticos Interiores', price: 20, icon: Layers },
  { id: 'couro',           label: 'Tratamento de Couro',              price: 60, icon: Scissors },
];

// ─── Traduções dos dados (EN) ────────────────────────────────────────────────

const EN_SERVICES = {
  'lavagem-simples': {
    title: 'BASIC WASH',
    desc: 'Interior and exterior maintenance clean.',
    includes: ['Hand exterior wash', 'Interior vacuuming', 'Dashboard and boot cleaning', 'Clean windows'],
  },
  'lavagem-selante': {
    title: 'WASH WITH SEALANT',
    desc: 'Exactly the Basic Wash, plus a sealant on the paint.',
    includes: ['Everything in the Basic Wash', 'Sealant applied to the paint', 'More shine and a hydrophobic effect'],
  },
  'lavagem-premium': {
    title: 'PREMIUM WASH',
    desc: 'Detailed interior cleaning, glass decontamination and a premium sealant.',
    includes: ['Everything in the Basic Wash', 'Detailed interior cleaning, down to the hard-to-reach areas', 'Glass decontamination', 'Premium sealant on the paint'],
  },
  'lavagem-detalhada': {
    title: 'DETAILED WASH',
    desc: 'Everything in the Premium, plus seat removal and sanitising, paint decontamination and deep wheel and tyre cleaning.',
    includes: ['Everything in the Premium Wash', 'Seat removal and sanitising', 'Paint decontamination', 'Deep wheel and tyre cleaning'],
  },
  'polimento-1-etapa': {
    title: '1-STAGE POLISHING',
    desc: 'To bring back the shine and soften light wash marks and small defects.',
    includes: ['Softens light marks and surface scratches', 'Reduces holograms', 'Restores shine and colour depth', 'Finishes with paint protection'],
  },
  'polimento-avancado': {
    title: 'ADVANCED PAINT CORRECTION',
    desc: 'Several stages for more visible scratches, swirl marks and oxidation, within the limits of the clear coat.',
    includes: ['Reduces more visible scratches and swirl marks', 'Corrects oxidation, as far as the clear coat allows', 'Evens out colour and finish', 'Refinement and final protection'],
  },
  'farois-dianteiros': {
    title: 'FRONT HEADLIGHT POLISHING (PAIR)',
    desc: 'Restores yellowed, hazy or scratched headlights, improving appearance and light output.',
    includes: ['Removes oxidation and haziness', 'Softens surface scratches', 'Improves light output', 'Restores clarity'],
  },
  'farois-traseiros': {
    title: 'REAR LIGHT POLISHING (PAIR)',
    desc: 'Restores the look of rear lights, removing haziness and surface scratches.',
    includes: ['Removes wear and haziness', 'Softens surface scratches', 'Restores clarity', 'Improves the look of the vehicle'],
  },
  'pack-selante': {
    title: 'SEALANT PACK · 2x MONTH',
    desc: 'Two sealant washes a month, with priority booking',
    includes: [
      'Two sealant washes a month',
      'Everything the sealant wash includes',
      'Priority booking',
      'Booking by contact, so we can arrange the dates with you',
    ],
  },
  'pack-premium': {
    title: 'PREMIUM PACK · 2x MONTH',
    desc: 'Two premium washes a month, with priority booking',
    includes: [
      'Two premium washes a month',
      'Everything the premium wash includes',
      'Priority booking',
      'Booking by contact, so we can arrange the dates with you',
    ],
  },
  'pack-detalhada': {
    title: 'DETAILED PACK · 2x MONTH',
    desc: 'Two detailed washes a month, with priority booking',
    includes: [
      'Two detailed washes a month',
      'Everything the detailed wash includes',
      'Priority booking',
      'Booking by contact, so we can arrange the dates with you',
    ],
  },
};

const EN_FEATURES = {
  'Produtos Premium':     'Premium Products',
  'Atenção ao Detalhe':   'Attention to Detail',
  'Resultados Duradouros':'Lasting Results',
  'Satisfação Garantida': 'Guaranteed Satisfaction',
};

const EN_PROCESS = {
  '01': { title: 'ASSESSMENT', desc: 'We analyse the vehicle condition to define the best treatment.' },
  '02': { title: 'DEEP WASH',  desc: 'We remove dirt, contaminants and impurities in depth.' },
  '03': { title: 'DETAIL & PROTECTION', desc: 'We work every detail and apply high-quality protection.' },
  '04': { title: 'PREMIUM HANDOVER', desc: 'We hand your car back flawless and ready to impress.' },
};

const EN_TESTIMONIALS = {};

const EN_EXTRAS = {
  'pelos-animal': 'Pet hair removal', 'areia-praia': 'Beach sand removal',
  'odores': 'Odour treatment', 'jantes-profunda': 'Deep wheel cleaning',
  'plasticos-inter': 'Interior plastic protection', 'couro': 'Leather treatment',
};

SERVICES.forEach((s) => {
  const e = EN_SERVICES[s.id];
  if (e) { s.titleEn = e.title; s.descEn = e.desc; s.includesEn = e.includes; }
});
FEATURES.forEach((f) => { if (EN_FEATURES[f.label]) f.labelEn = EN_FEATURES[f.label]; });
PROCESS.forEach((p) => { const e = EN_PROCESS[p.n]; if (e) { p.titleEn = e.title; p.descEn = e.desc; } });
TESTIMONIALS.forEach((t) => { if (EN_TESTIMONIALS[t.name]) t.textEn = EN_TESTIMONIALS[t.name]; });
EXTRAS.forEach((x) => { if (EN_EXTRAS[x.id]) x.labelEn = EN_EXTRAS[x.id]; });
