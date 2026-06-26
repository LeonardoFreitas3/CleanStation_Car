// Mock data for Clean Station Car
import {
  Sparkles, Brush, Disc3, ShieldCheck, Car, Wrench, Gem, SprayCan, ShieldPlus,
  Droplets, Lightbulb, CircleDot, Star,
  // Calculadora de orçamento (mantida mas não utilizada na UI após remoção de marcações)
  Trash2, Wind, Footprints, Droplet, PawPrint, CloudFog, Package, Bug, Square,
  Waves, Layers, Scissors, AlertTriangle, Plus,
} from 'lucide-react';

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
  { id: 'descontaminacao',label: 'DESCONTAMINAÇÃO E PROTEÇÕES',labelEn: 'DECONTAMINATION & PROTECTION',subtitle: 'Para uma proteção total',        subtitleEn: 'For total protection',       icon: ShieldCheck },
  { id: 'higienizacao',   label: 'HIGIENIZAÇÃO',               labelEn: 'SANITISATION',              subtitle: 'Interior saudável, conforto total',subtitleEn: 'Healthy interior, total comfort', icon: Sparkles },
  { id: 'polimentos',     label: 'POLIMENTOS E CORREÇÕES',     labelEn: 'POLISHING & CORRECTIONS',   subtitle: 'De volta ao brilho perfeito',     subtitleEn: 'Back to perfect shine',      icon: Gem       },
];

export const SERVICES = [
  // ── LAVAGENS ──────────────────────────────────────────────────────────────
  {
    id: 'lavagem-simples',
    category: 'lavagens',
    title: 'LAVAGEM INTERIOR E EXTERIOR SIMPLES',
    desc: 'Limpeza geral para manutenção do veículo.',
    price: 25,
    icon: Droplets,
    image: '/img/lavagem.jpg',
    includes: [
      'Lavagem exterior completa',
      'Aspiração do interior',
      'Limpeza básica do interior',
      'Vidros limpos',
      'Serviço simples — inclui lavagem interior simples',
    ],
  },
  {
    id: 'lavagem-selante',
    category: 'lavagens',
    title: 'LAVAGEM COM SELANTE',
    desc: 'Lavagem exterior com aplicação de proteção temporária que realça o brilho e cria uma camada hidrofóbica.',
    price: 37,
    icon: ShieldCheck,
    image: '/img/lavagem.jpg',
    includes: [
      'Lavagem exterior completa',
      'Aplicação de selante protetor',
      'Maior brilho e repelência à água',
      'Protege a pintura de sujidade e agentes externos',
      'Inclui lavagem simples interior',
    ],
  },
  {
    id: 'lavagem-selante-premium',
    category: 'lavagens',
    title: 'LAVAGEM COM SELANTE PREMIUM',
    desc: 'Lavagem exterior com selante de alta performance que oferece proteção superior e brilho mais intenso e duradouro.',
    price: 55,
    icon: ShieldPlus,
    image: '/img/ceramica-longa.jpg',
    includes: [
      'Lavagem exterior completa',
      'Aplicação de selante premium de alta performance',
      'Brilho intenso e proteção superior',
      'Maior duração do efeito protetor',
      'Inclui lavagem simples interior',
    ],
  },
  {
    id: 'detalhada-interior',
    category: 'lavagens',
    title: 'LAVAGEM DETALHADA INTERIOR',
    desc: 'Limpeza cuidada de todas as zonas interiores do veículo.',
    price: 80,
    icon: Brush,
    image: '/img/interior.jpg',
    includes: [
      'Aspiração profunda',
      'Limpeza de plásticos e painel',
      'Limpeza de consola',
      'Cantos e zonas difíceis',
      'Vidros interiores',
      'Serviço exclusivo para interior',
    ],
  },
  {
    id: 'detalhada-exterior',
    category: 'lavagens',
    title: 'LAVAGEM DETALHADA EXTERIOR',
    desc: 'Limpeza profunda da parte exterior com atenção a cada pormenor.',
    price: 90,
    icon: SprayCan,
    image: '/img/proteção.jpg',
    includes: [
      'Lavagem profunda da carroçaria',
      'Limpeza de jantes e pneus',
      'Vidros exteriores',
      'Pormenores exteriores',
      'Mais brilho e detalhe no acabamento',
      'Serviço exclusivo para exterior',
    ],
  },
  {
    id: 'detalhada-completa',
    category: 'lavagens',
    title: 'LAVAGEM DETALHADA INTERIOR + EXTERIOR',
    desc: 'O serviço mais completo de limpeza, com o carro renovado por dentro e por fora.',
    price: 155,
    icon: Car,
    image: '/img/detalhada-completa.jpg',
    includes: [
      'Interior detalhado completo',
      'Exterior detalhado completo',
      'Acabamento premium',
      'Inclui lavagem simples interior',
    ],
  },

  // ── DESCONTAMINAÇÃO E PROTEÇÕES ──────────────────────────────────────────
  {
    id: 'vidros',
    category: 'descontaminacao',
    title: 'SERVIÇO COMPLETO DE VIDROS',
    desc: 'Remove sujidade invisível agarrada ao vidro e aplica uma proteção hidrofóbica que repele a água.',
    price: 50,
    icon: Droplets,
    image: '/img/vidros.jpg',
    includes: [
      'Remove calcário, gordura, resíduos e contaminantes',
      'Aplicação de proteção hidrofóbica',
      'Vidro mais limpo e transparente',
      'Água da chuva a escorrer mais facilmente',
      'Melhor visibilidade e mais segurança',
    ],
  },
  {
    id: 'descontaminacao-pintura',
    category: 'descontaminacao',
    title: 'DESCONTAMINAÇÃO COMPLETA DA PINTURA',
    desc: 'Limpeza profunda da carroçaria que remove partículas que a lavagem normal não consegue tirar.',
    price: 95,
    icon: ShieldCheck,
    image: '/img/proteção.jpg',
    includes: [
      'Remoção de ferrugem superficial (partículas ferrosas)',
      'Remoção de alcatrão e resinas',
      'Remoção de poluição agarrada à pintura',
      'Pintura mais lisa ao toque e com mais brilho',
      'Superfície preparada para receber proteção',
    ],
  },
  {
    id: 'ceramica',
    category: 'descontaminacao',
    title: 'PROTEÇÃO CERÂMICA PROFISSIONAL',
    desc: 'Camada de proteção aplicada sobre a pintura que cria uma barreira durável contra agressões externas.',
    price: 250,
    icon: Gem,
    image: '/img/ceramica-longa.jpg',
    includes: [
      'Proteção contra raios UV',
      'Proteção contra sujidade e produtos químicos',
      'Proteção contra pequenos riscos superficiais',
      'Brilho mais intenso e efeito repelente à água',
      'Pintura protegida durante muito mais tempo',
      'Facilita a limpeza do carro',
    ],
  },

  // ── HIGIENIZAÇÃO ─────────────────────────────────────────────────────────
  {
    id: 'higienizacao-estofos',
    category: 'higienizacao',
    title: 'HIGIENIZAÇÃO DE ESTOFOS',
    desc: 'Limpeza profunda dos bancos e tecidos do interior, com remoção de manchas, maus odores e alergénios.',
    price: 100,
    icon: Sparkles,
    image: '/img/estofos.jpg',
    includes: [
      'Limpeza completa dos estofos',
      'Remoção de manchas e sujidade acumulada',
      'Eliminação de maus odores',
      'Redução de bactérias e alergénios',
      'Interior mais saudável e com aspeto renovado',
      'Remoção dos bancos sempre que necessário',
    ],
  },

  // ── POLIMENTOS E CORREÇÕES ───────────────────────────────────────────────
  {
    id: 'polimento-1-etapa',
    category: 'polimentos',
    title: 'POLIMENTO DE 1 ETAPA',
    desc: 'Correção leve da pintura para remover pequenos riscos superficiais e devolver brilho.',
    price: 180,
    icon: Wrench,
    image: '/img/polimento.jpg',
    includes: [
      'Remove marcas leves e riscos superficiais',
      'Reduz hologramas e imperfeições',
      'Recupera o brilho e a cor da pintura',
      'Resultado rápido e eficaz',
    ],
  },
  {
    id: 'polimento-avancado',
    category: 'polimentos',
    title: 'POLIMENTO DE CORREÇÃO AVANÇADO',
    desc: 'Processo em várias etapas para pinturas com mais desgaste, riscos profundos e imperfeições severas.',
    price: 300,
    icon: Gem,
    image: '/img/polimento.jpg',
    includes: [
      'Remove riscos profundos e marcas de desgaste',
      'Melhora cores e uniformiza a pintura',
      'Proporciona brilho máximo e reflexos intensos',
      'Acabamento de show car',
    ],
  },
  {
    id: 'farois-dianteiros',
    category: 'polimentos',
    title: 'POLIMENTO DE FARÓIS DIANTEIROS (PAR)',
    desc: 'Recupera faróis amarelados, opacos ou com riscos, melhorando a estética e a iluminação.',
    price: 55,
    icon: Lightbulb,
    image: '/img/polimento.jpg',
    includes: [
      'Remove oxidação e opacidade',
      'Elimina riscos superficiais',
      'Melhora a passagem de luz',
      'Deixa os faróis transparentes e como novos',
    ],
  },
  {
    id: 'farois-traseiros',
    category: 'polimentos',
    title: 'POLIMENTO DE FARÓIS TRASEIROS (PAR)',
    desc: 'Recupera o aspeto original das luzes traseiras, removendo opacidade e riscos superficiais.',
    price: 40,
    icon: CircleDot,
    image: '/img/farois-traseiros.jpg',
    includes: [
      'Remove desgaste e opacidade',
      'Elimina riscos superficiais',
      'Recupera a transparência',
      'Melhora o aspeto do veículo',
    ],
  },
];

export const BEFORE_AFTER = [
  { label: 'EXTERIOR', before: '/img/antes_ex.png', after: '/img/depois_ex.png' },
  { label: 'INTERIOR', before: '/img/antes_in.png', after: '/img/depois_in.png' },
  { label: 'BANCOS',   before: '/img/antes_ba.png', after: '/img/depois_ba.png' },
  { label: 'JANTES',  before: '/img/antes_ja.png', after: '/img/depois_ja.png' },
];

export const PROCESS = [
  { n: '01', title: 'AVALIAÇÃO', desc: 'Analisamos o estado do veículo para definir o melhor tratamento.', icon: Sparkles },
  { n: '02', title: 'LAVAGEM PROFUNDA', desc: 'Removemos sujidade, contaminantes e impurezas em profundidade.', icon: SprayCan },
  { n: '03', title: 'DETALHE & PROTEÇÃO', desc: 'Trabalhamos cada detalhe e aplicamos proteção de alta qualidade.', icon: Wrench },
  { n: '04', title: 'ENTREGA PREMIUM', desc: 'Entregamos o teu carro impecável e pronto para impressionar.', icon: Car },
];

export const TESTIMONIALS = [
  {
    name: 'Ricardo Pereira',
    car: 'BMW Série 3',
    text: 'Serviço excepcional! O carro ficou como novo, superou as minhas expectativas.',
  },
  {
    name: 'João Fernandes',
    car: 'Audi A4',
    text: 'Profissionalismo, atenção ao detalhe e resultados incríveis. Recomendo a 100%!',
  },
  {
    name: 'Miguel Costa',
    car: 'Mercedes C220',
    text: 'Melhor lavagem detalhada que já fiz. Ambiente impecável e pessoal muito atencioso.',
  },
  {
    name: 'Sofia Almeida',
    car: 'Volkswagen Golf',
    text: 'Qualidade premium, atenção ao detalhe e um resultado que se nota. Voltarei sem dúvida.',
  },
];

export const TIME_SLOTS = [
  '08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00',
];

export const BOOKINGS_KEY = 'csc_bookings_mock_v1';

export const HERO_IMAGE = '/img/banner.png';

export const DETAIL_IMAGE = '/img/detail.jpg';

// ─── Calculadora de orçamento (mantida para referência, não utilizada na UI) ─

export const INTERIOR_PROBLEMS = [
  { id: 'lixo',            label: 'Lixo acumulado',          icon: Trash2 },
  { id: 'areia',           label: 'Areia ou terra excessiva', icon: Wind },
  { id: 'tapetes',         label: 'Tapetes muito sujos',      icon: Footprints },
  { id: 'manchas-estofos', label: 'Manchas em estofos',       icon: Droplet },
  { id: 'manchas-dificeis',label: 'Manchas difíceis',         icon: Droplets },
  { id: 'pelos',           label: 'Pelos de animais',         icon: PawPrint },
  { id: 'odor',            label: 'Odor desagradável',        icon: CloudFog },
  { id: 'bagageira',       label: 'Bagageira muito suja',     icon: Package },
];

export const EXTERIOR_PROBLEMS = [
  { id: 'insetos',   label: 'Insetos incrustados',        icon: Bug },
  { id: 'jantes',    label: 'Jantes muito contaminadas',  icon: Disc3 },
  { id: 'resina',    label: 'Resina ou alcatrão',         icon: Droplet },
  { id: 'vidros',    label: 'Vidros contaminados',        icon: Square },
  { id: 'pintura',   label: 'Pintura muito contaminada',  icon: SprayCan },
  { id: 'lama',      label: 'Excesso de lama',            icon: Waves },
  { id: 'plasticos', label: 'Plásticos exteriores degradados', icon: Layers },
];

export const ALL_PROBLEMS = [...INTERIOR_PROBLEMS, ...EXTERIOR_PROBLEMS];
export const PROBLEM_LABEL = Object.fromEntries(ALL_PROBLEMS.map((p) => [p.id, p.label]));

export const EXTRAS = [
  { id: 'pelos-animal',      label: 'Remoção de Pêlo de Animal',       price: 20, icon: PawPrint },
  { id: 'areia-praia',       label: 'Remoção de Areia de Praia',       price: 15, icon: Wind },
  { id: 'odores',            label: 'Tratamento de Odores',            price: 25, icon: CloudFog },
  { id: 'jantes-profunda',   label: 'Limpeza Profunda de Jantes',      price: 25, icon: Disc3 },
  { id: 'plasticos-inter',   label: 'Proteção de Plásticos Interiores',price: 20, icon: Layers },
  { id: 'couro',             label: 'Tratamento de Couro',             price: 60, icon: Scissors },
];

export const EXTRA_BY_ID = Object.fromEntries(EXTRAS.map((e) => [e.id, e]));

export const GRADES = [
  { grade: 1, label: 'Sujidade Normal',  labelEn: 'Normal Dirt',  min: 0, max: 1,        multiplier: 1.0,  pct: 0  },
  { grade: 2, label: 'Sujidade Elevada', labelEn: 'Heavy Dirt',   min: 2, max: 3,        multiplier: 1.3,  pct: 30 },
  { grade: 3, label: 'Sujidade Extrema', labelEn: 'Extreme Dirt', min: 4, max: Infinity, multiplier: 1.75, pct: 75 },
];

export function gradeForCount(count) {
  return GRADES.find((g) => count >= g.min && count <= g.max) || GRADES[0];
}

export function eur(n) {
  const v = Math.round((Number(n) + Number.EPSILON) * 100) / 100;
  return (Number.isInteger(v) ? String(v) : v.toFixed(2).replace('.', ',')) + ' €';
}

export function computeQuote(service, problemIds = [], extraIds = []) {
  const base = service?.price || 0;
  const count = problemIds.length;
  const g = gradeForCount(count);
  const subtotal = base * g.multiplier;
  const chosenExtras = EXTRAS.filter((e) => extraIds.includes(e.id));
  const extrasTotal = chosenExtras.reduce((s, e) => s + e.price, 0);
  const total = subtotal + extrasTotal;
  return { base, count, grade: g.grade, gradeLabel: g.label, gradeLabelEn: g.labelEn, multiplier: g.multiplier, pct: g.pct, subtotal, extrasTotal, total, chosenExtras };
}

// ─── Traduções dos dados (EN) ────────────────────────────────────────────────

const EN_SERVICES = {
  'lavagem-simples': {
    title: 'BASIC INTERIOR & EXTERIOR WASH',
    desc: 'General cleaning for vehicle maintenance.',
    includes: ['Complete exterior wash', 'Interior vacuuming', 'Basic interior cleaning', 'Clean windows', 'Simple service — includes basic interior wash'],
  },
  'lavagem-selante': {
    title: 'WASH WITH SEALANT',
    desc: 'Exterior wash with a temporary protective sealant that enhances shine and creates a hydrophobic layer.',
    includes: ['Complete exterior wash', 'Protective sealant application', 'Enhanced shine and water repellency', 'Protects paint from dirt and external agents', 'Includes basic interior wash'],
  },
  'lavagem-selante-premium': {
    title: 'WASH WITH PREMIUM SEALANT',
    desc: 'Exterior wash with a high-performance sealant offering superior protection and longer-lasting shine.',
    includes: ['Complete exterior wash', 'High-performance premium sealant', 'Intense shine and superior protection', 'Longer-lasting protective effect', 'Includes basic interior wash'],
  },
  'detalhada-interior': {
    title: 'DETAILED INTERIOR WASH',
    desc: 'Careful cleaning of all interior areas of the vehicle.',
    includes: ['Deep vacuuming', 'Plastics and dashboard cleaning', 'Console cleaning', 'Tight corners and difficult areas', 'Interior windows', 'Interior-only service'],
  },
  'detalhada-exterior': {
    title: 'DETAILED EXTERIOR WASH',
    desc: 'Deep exterior cleaning with attention to every detail.',
    includes: ['Deep bodywork wash', 'Wheel and tyre cleaning', 'Exterior windows', 'Exterior details', 'More shine and finishing detail', 'Exterior-only service'],
  },
  'detalhada-completa': {
    title: 'DETAILED INTERIOR + EXTERIOR WASH',
    desc: 'The most complete cleaning service, leaving your car renewed inside and out.',
    includes: ['Complete detailed interior', 'Complete detailed exterior', 'Premium finish', 'Includes basic interior wash'],
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
  'descontaminacao':{ label: 'DECONTAMINATION & PROTECTION', subtitle: 'For total protection' },
  'higienizacao':   { label: 'SANITISATION',               subtitle: 'Healthy interior, total comfort' },
  'polimentos':     { label: 'POLISHING & CORRECTIONS',    subtitle: 'Back to perfect shine' },
};

const EN_PROCESS = {
  '01': { title: 'ASSESSMENT', desc: 'We analyse the vehicle condition to define the best treatment.' },
  '02': { title: 'DEEP WASH',  desc: 'We remove dirt, contaminants and impurities in depth.' },
  '03': { title: 'DETAIL & PROTECTION', desc: 'We work every detail and apply high-quality protection.' },
  '04': { title: 'PREMIUM HANDOVER', desc: 'We hand your car back flawless and ready to impress.' },
};

const EN_TESTIMONIALS = {
  'Ricardo Pereira': 'Exceptional service! The car looked brand new, it exceeded my expectations.',
  'João Fernandes': 'Professionalism, attention to detail and incredible results. Highly recommend!',
  'Miguel Costa': 'Best detailed wash I have ever had. Impeccable setting and very attentive staff.',
  'Sofia Almeida': 'Premium quality, attention to detail and a result you can see. I will definitely be back.',
};

const EN_BEFORE_AFTER = { EXTERIOR: 'EXTERIOR', INTERIOR: 'INTERIOR', BANCOS: 'SEATS', JANTES: 'WHEELS' };

const EN_PROBLEMS = {
  lixo: 'Accumulated rubbish', areia: 'Excessive sand or dirt', tapetes: 'Very dirty mats',
  'manchas-estofos': 'Upholstery stains', 'manchas-dificeis': 'Tough stains', pelos: 'Pet hair',
  odor: 'Unpleasant odour', bagageira: 'Very dirty boot', insetos: 'Embedded insects',
  jantes: 'Heavily contaminated wheels', resina: 'Resin or tar', vidros: 'Contaminated glass',
  pintura: 'Heavily contaminated paint', lama: 'Excessive mud', plasticos: 'Degraded exterior plastics',
};

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
BEFORE_AFTER.forEach((b) => { if (EN_BEFORE_AFTER[b.label]) b.labelEn = EN_BEFORE_AFTER[b.label]; });
[...INTERIOR_PROBLEMS, ...EXTERIOR_PROBLEMS].forEach((p) => { if (EN_PROBLEMS[p.id]) p.labelEn = EN_PROBLEMS[p.id]; });
EXTRAS.forEach((x) => { if (EN_EXTRAS[x.id]) x.labelEn = EN_EXTRAS[x.id]; });
