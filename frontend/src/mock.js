// Conteúdo do site público.
import {
  Sparkles, Brush, Disc3, ShieldCheck, Car, Wrench, Gem, SprayCan, ShieldPlus,
  Droplets, Lightbulb, CircleDot, Star,
  PawPrint, Wind, CloudFog, Layers, Scissors,
} from 'lucide-react';
import { LEVEL_BY_ID } from './booking/pricing';

// Preço "desde" de um nível de lavagem: o mais baixo da tabela por veículo.
// Vem de booking/pricing.js para o site e o calculador não divergirem — antes
// os mesmos valores estavam escritos em dois sítios e desalinharam-se.
const minPrice = (levelId) => Math.min(...Object.values(LEVEL_BY_ID[levelId].prices));

export const SITE = {
  name: 'Clean Station Car',
  tagline: 'Lavagem Detalhada Premium em Braga',
  subtitle: 'O detalhe que o teu carro merece.',
  phone: '+351 913 733 791',
  phoneRaw: '351913733791',
  email: 'cleanstationcar@gmail.com',
  address: 'R. Conselheiro Lobato 503, 4705-089 Braga',
  hours: 'Segunda a Sábado · 08:00 – 19:00',
  mapsShareUrl: 'https://maps.google.com/?q=R.+Conselheiro+Lobato+503,+4705-089+Braga',
  // Pagina de avaliacoes do perfil de empresa. Substituir pelo link curto do
  // Google Business (Partilhar -> Avaliacoes) quando estiver a mao.
  reviewsUrl: 'https://www.google.com/search?q=Clean+Station+Car+Braga#lrd=,1,,,',
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
  { id: 'polimentos',     label: 'POLIMENTOS E CORREÇÕES',     labelEn: 'POLISHING & CORRECTIONS',   subtitle: 'De volta ao brilho perfeito',     subtitleEn: 'Back to perfect shine',      icon: Gem       },
];

export const SERVICES = [
  // ── LAVAGENS ──────────────────────────────────────────────────────────────
  // Preços por tipo de veículo, lidos de booking/pricing.js — é a mesma tabela
  // que o calculador de marcações usa. O valor mostrado aqui é o mais baixo
  // (o "desde"); a ficha do serviço mostra a tabela completa.
  {
    id: 'lavagem-simples',
    category: 'lavagens',
    title: 'LAVAGEM SIMPLES',
    desc: 'Limpeza geral para manutenção do veículo, por dentro e por fora.',
    price: minPrice('simples'),
    priceByVehicle: LEVEL_BY_ID['simples'].prices,
    icon: Droplets,
    image: `${process.env.PUBLIC_URL}/img/lavagem.jpg`,
    includes: [
      'Lavagem exterior completa',
      'Aspiração do interior',
      'Limpeza básica do interior',
      'Vidros limpos',
    ],
  },
  {
    id: 'lavagem-selante',
    category: 'lavagens',
    title: 'LAVAGEM COM SELANTE',
    desc: 'Proteção temporária que realça o brilho e cria uma camada hidrofóbica.',
    price: minPrice('selante'),
    priceByVehicle: LEVEL_BY_ID['selante'].prices,
    icon: ShieldCheck,
    image: `${process.env.PUBLIC_URL}/img/proteção.jpg`,
    includes: [
      'Tudo o que inclui a lavagem simples',
      'Aplicação de selante protetor',
      'Maior brilho e repelência à água',
      'Protege a pintura de sujidade e agentes externos',
    ],
  },
  {
    id: 'lavagem-premium',
    category: 'lavagens',
    title: 'LAVAGEM PREMIUM',
    desc: 'Selante de alta performance, com proteção superior e brilho mais duradouro.',
    price: minPrice('premium'),
    priceByVehicle: LEVEL_BY_ID['premium'].prices,
    icon: ShieldPlus,
    image: `${process.env.PUBLIC_URL}/img/ceramica-longa.jpg`,
    includes: [
      'Tudo o que inclui a lavagem com selante',
      'Selante premium de alta performance',
      'Brilho intenso e proteção superior',
      'Maior duração do efeito protetor',
    ],
  },
  {
    id: 'lavagem-detalhada',
    category: 'lavagens',
    title: 'LAVAGEM DETALHADA',
    desc: 'O serviço mais completo de limpeza, por dentro e por fora, ao pormenor.',
    price: minPrice('detalhada'),
    priceByVehicle: LEVEL_BY_ID['detalhada'].prices,
    icon: Car,
    image: `${process.env.PUBLIC_URL}/img/detail.jpg`,
    includes: [
      'Interior detalhado completo',
      'Exterior detalhado completo',
      'Limpeza de jantes e pneus',
      'Cantos e zonas de difícil acesso',
      'Acabamento premium',
    ],
  },
  // ── POLIMENTOS E CORREÇÕES ───────────────────────────────────────────────
  {
    id: 'polimento-1-etapa',
    onRequest: true,
    category: 'polimentos',
    title: 'POLIMENTO DE 1 ETAPA',
    desc: 'Correção leve da pintura para remover pequenos riscos superficiais e devolver brilho.',
    price: 180,
    icon: Wrench,
    image: `${process.env.PUBLIC_URL}/img/polimento.jpg`,
    includes: [
      'Remove marcas leves e riscos superficiais',
      'Reduz hologramas e imperfeições',
      'Recupera o brilho e a cor da pintura',
      'Resultado rápido e eficaz',
    ],
  },
  {
    id: 'polimento-avancado',
    onRequest: true,
    category: 'polimentos',
    title: 'POLIMENTO DE CORREÇÃO AVANÇADO',
    desc: 'Processo em várias etapas para pinturas com mais desgaste, riscos profundos e imperfeições severas.',
    price: 300,
    icon: Gem,
    image: `${process.env.PUBLIC_URL}/img/ceramica-longa.jpg`,
    includes: [
      'Remove riscos profundos e marcas de desgaste',
      'Melhora cores e uniformiza a pintura',
      'Proporciona brilho máximo e reflexos intensos',
      'Acabamento de show car',
    ],
  },
  {
    id: 'farois-dianteiros',
    onRequest: true,
    category: 'polimentos',
    title: 'POLIMENTO DE FARÓIS DIANTEIROS (PAR)',
    desc: 'Recupera faróis amarelados, opacos ou com riscos, melhorando a estética e a iluminação.',
    price: 55,
    icon: Lightbulb,
    image: `${process.env.PUBLIC_URL}/img/farois-traseiros.jpg`,
    includes: [
      'Remove oxidação e opacidade',
      'Elimina riscos superficiais',
      'Melhora a passagem de luz',
      'Deixa os faróis transparentes e como novos',
    ],
  },
  {
    id: 'farois-traseiros',
    onRequest: true,
    category: 'polimentos',
    title: 'POLIMENTO DE FARÓIS TRASEIROS (PAR)',
    desc: 'Recupera o aspeto original das luzes traseiras, removendo opacidade e riscos superficiais.',
    price: 40,
    icon: CircleDot,
    image: `${process.env.PUBLIC_URL}/img/lavagem.jpg`,
    includes: [
      'Remove desgaste e opacidade',
      'Elimina riscos superficiais',
      'Recupera a transparência',
      'Melhora o aspeto do veículo',
    ],
  },
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
export const TESTIMONIALS = [];

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
    desc: 'General cleaning for vehicle maintenance, inside and out.',
    includes: ['Complete exterior wash', 'Interior vacuuming', 'Basic interior cleaning', 'Clean windows'],
  },
  'lavagem-selante': {
    title: 'WASH WITH SEALANT',
    desc: 'Temporary protection that enhances shine and creates a hydrophobic layer.',
    includes: ['Everything in the basic wash', 'Protective sealant application', 'Enhanced shine and water repellency', 'Protects paint from dirt and external agents'],
  },
  'lavagem-premium': {
    title: 'PREMIUM WASH',
    desc: 'High-performance sealant with superior protection and longer-lasting shine.',
    includes: ['Everything in the sealant wash', 'High-performance premium sealant', 'Intense shine and superior protection', 'Longer-lasting protective effect'],
  },
  'lavagem-detalhada': {
    title: 'DETAILED WASH',
    desc: 'The most complete cleaning service, inside and out, down to the last detail.',
    includes: ['Complete detailed interior', 'Complete detailed exterior', 'Wheel and tyre cleaning', 'Tight corners and hard-to-reach areas', 'Premium finish'],
  },
  'vidros': {
    title: 'COMPLETE GLASS SERVICE',
    desc: 'Removes invisible dirt stuck to the glass and applies a hydrophobic coating that repels water.',
    includes: ['Removes limescale, grease, road residue and contaminants', 'Hydrophobic protection application', 'Cleaner and more transparent glass', 'Rain water runs off more easily', 'Better visibility and greater safety'],
  },
  'descontaminacao-pintura': {
    title: 'COMPLETE PAINT DECONTAMINATION',
    desc: 'Deep bodywork cleaning that removes particles a regular wash cannot eliminate.',
    includes: ['Removal of surface rust (iron particles)', 'Tar and resin removal', 'Removal of pollution bonded to the paint', 'Smoother, shinier paint', 'Surface ready for protection'],
  },
  'ceramica': {
    title: 'PROFESSIONAL CERAMIC PROTECTION',
    desc: 'A durable protective layer applied over the paint that creates a barrier against external damage.',
    includes: ['Protection against UV rays', 'Protection against dirt and chemicals', 'Protection against minor surface scratches', 'More intense shine and water-repellent effect', 'Paint protected for much longer', 'Easier to clean the car'],
  },
  'higienizacao-estofos': {
    title: 'UPHOLSTERY SANITISATION',
    desc: 'Deep cleaning of seats and interior fabrics, removing stains, odours and allergens.',
    includes: ['Complete upholstery cleaning', 'Stain and accumulated dirt removal', 'Elimination of bad odours', 'Reduction of bacteria and allergens', 'Healthier interior with a renewed look', 'Seat removal whenever necessary'],
  },
  'polimento-1-etapa': {
    title: '1-STAGE POLISHING',
    desc: 'Light paint correction to remove minor surface scratches and restore shine.',
    includes: ['Removes light marks and surface scratches', 'Reduces holograms and imperfections', 'Restores paint shine and colour', 'Fast and effective result'],
  },
  'polimento-avancado': {
    title: 'ADVANCED CORRECTION POLISHING',
    desc: 'Multi-stage process for paint with heavier wear, deep scratches and severe imperfections.',
    includes: ['Removes deep scratches and wear marks', 'Improves colour uniformity', 'Maximum shine and intense reflections', 'Show car finish'],
  },
  'farois-dianteiros': {
    title: 'FRONT HEADLIGHT POLISHING (PAIR)',
    desc: 'Restores yellowed, hazy or scratched headlights, improving appearance and illumination.',
    includes: ['Removes oxidation and haziness', 'Eliminates surface scratches', 'Improves light output', 'Leaves headlights clear and like new'],
  },
  'farois-traseiros': {
    title: 'REAR LIGHT POLISHING (PAIR)',
    desc: 'Restores the original look of rear lights, removing haziness and surface scratches.',
    includes: ['Removes wear and haziness', 'Eliminates surface scratches', 'Restores clarity', 'Improves the look of the vehicle'],
  },
};

const EN_FEATURES = {
  'Produtos Premium':     'Premium Products',
  'Atenção ao Detalhe':   'Attention to Detail',
  'Resultados Duradouros':'Lasting Results',
  'Satisfação Garantida': 'Guaranteed Satisfaction',
};

const EN_CATEGORIES = {
  'lavagens':       { label: 'WASHES',                     subtitle: "What's the difference?" },
  'polimentos':     { label: 'POLISHING & CORRECTIONS',    subtitle: 'Back to perfect shine' },
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
CATEGORIES.forEach((c) => {
  const e = EN_CATEGORIES[c.id];
  if (e) { c.labelEn = e.label; c.subtitleEn = e.subtitle; }
});
FEATURES.forEach((f) => { if (EN_FEATURES[f.label]) f.labelEn = EN_FEATURES[f.label]; });
PROCESS.forEach((p) => { const e = EN_PROCESS[p.n]; if (e) { p.titleEn = e.title; p.descEn = e.desc; } });
TESTIMONIALS.forEach((t) => { if (EN_TESTIMONIALS[t.name]) t.textEn = EN_TESTIMONIALS[t.name]; });
EXTRAS.forEach((x) => { if (EN_EXTRAS[x.id]) x.labelEn = EN_EXTRAS[x.id]; });
