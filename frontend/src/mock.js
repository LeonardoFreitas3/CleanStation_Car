// Mock data for Clean Station Car
import {
  Sparkles, Brush, Disc3, ShieldCheck, Car, Wrench, Gem, SprayCan, ShieldPlus,
  Droplets, Lightbulb, CircleDot,
  // Calculadora de orçamento
  Trash2, Wind, Footprints, Droplet, PawPrint, CloudFog, Package, Bug, Square,
  Waves, Layers, Scissors, AlertTriangle, Plus,
} from 'lucide-react';

export const SITE = {
  name: 'Clean Station Car',
  tagline: 'Lavagem Detalhada Premium em Braga',
  subtitle: 'O detalhe que o teu carro merece.',
  phone: '+351 934 177 308',
  phoneRaw: '351934177308',
  email: 'cleanstationcar@gmail.com',
  address: 'R. Conselheiro Lobato 533, 4705-089 Braga',
  hours: 'Segunda a Sábado · 08:00 – 19:00',
  mapsShareUrl: 'https://maps.google.com/?q=R.+Conselheiro+Lobato+533,+4705-089+Braga',
  mapsEmbed:
    'https://www.google.com/maps?q=R.+Conselheiro+Lobato+533,+4705-089+Braga&output=embed',
};

export const FEATURES = [
  { icon: Gem, label: 'Atendimento Premium' },
  { icon: SprayCan, label: 'Produtos de Qualidade' },
  { icon: ShieldCheck, label: 'Resultados Garantidos' },
  { icon: Sparkles, label: 'Marcação Rápida' },
];

export const SERVICES = [
  {
    id: 'lavagem-ceramica',
    title: 'LAVAGEM COM PROTEÇÃO CERÂMICA',
    desc: 'Lavagem completa com aplicação de proteção cerâmica para brilho e proteção.',
    price: 37,
    duration: 120,
    durationLabel: '2 horas',
    icon: ShieldCheck,
    image: '/img/lavagem.jpg',
    includes: [
      'Pré-lavagem com snow foam',
      'Lavagem exterior completa',
      'Descontaminação da pintura',
      'Aplicação de proteção cerâmica',
      'Limpeza de jantes e pneus',
      'Secagem com microfibra premium',
    ],
  },
  {
    id: 'lavagem-ceramica-longa',
    title: 'LAVAGEM C/ PROTEÇÃO CERÂMICA LONGA DURAÇÃO',
    desc: 'Lavagem com proteção cerâmica de longa duração para máxima durabilidade.',
    price: 52,
    duration: 180,
    durationLabel: '3 horas',
    icon: ShieldPlus,
    image: '/img/ceramica-longa.jpg',
    includes: [
      'Pré-lavagem com snow foam',
      'Lavagem exterior completa',
      'Descontaminação química da pintura',
      'Proteção cerâmica de longa duração (6+ meses)',
      'Tratamento hidrofóbico reforçado',
      'Proteção UV extra',
      'Limpeza de jantes e pneus',
      'Secagem com microfibra premium',
    ],
  },
  {
    id: 'detalhada-completa',
    title: 'LAVAGEM DETALHADA INTERIOR/EXTERIOR',
    desc: 'Lavagem detalhada completa do interior e exterior do veículo.',
    price: 150,
    duration: 480,
    durationLabel: '1 dia',
    fullDay: true,
    icon: Car,
    image: '/img/detalhada-completa.jpg',
    includes: [
      'Lavagem exterior profunda com snow foam',
      'Descontaminação completa da pintura',
      'Aspiração e limpeza de todo o interior',
      'Limpeza e hidratação de plásticos',
      'Hidratação de couro (se aplicável)',
      'Limpeza de vidros interior e exterior',
      'Limpeza de jantes e pneus',
      'Tratamento de borrachas e vedantes',
      'Limpeza detalhada do motor',
      'Secagem e inspeção final',
    ],
  },
  {
    id: 'detalhada-interior',
    title: 'LAVAGEM DETALHADA INTERIOR',
    desc: 'Limpeza profunda e detalhada de todo o habitáculo.',
    price: 80,
    duration: 180,
    durationLabel: '3 horas',
    icon: Brush,
    image: '/img/interior.jpg',
    includes: [
      'Aspiração completa do habitáculo',
      'Limpeza profunda de estofos e tapetes',
      'Limpeza e hidratação de plásticos',
      'Hidratação de couro (se aplicável)',
      'Limpeza de vidros interior',
      'Limpeza de consola e painel',
      'Higienização com ozono',
    ],
  },
  {
    id: 'detalhada-exterior',
    title: 'LAVAGEM DETALHADA EXTERIOR',
    desc: 'Lavagem exterior minuciosa com atenção a cada detalhe.',
    price: 90,
    duration: 180,
    durationLabel: '3 horas',
    icon: SprayCan,
    image: '/img/proteção.jpg',
    includes: [
      'Pré-lavagem com snow foam',
      'Lavagem com método dois baldes',
      'Descontaminação química e mecânica',
      'Limpeza detalhada de jantes e pneus',
      'Limpeza de caixas de roda',
      'Tratamento de borrachas e vedantes',
      'Secagem com microfibra premium',
    ],
  },
  {
    id: 'higienizacao-estofos',
    title: 'HIGIENIZAÇÃO DE ESTOFOS',
    desc: 'Limpeza e higienização profunda dos estofos do veículo.',
    price: 80,
    duration: 180,
    durationLabel: '3 horas',
    icon: Sparkles,
    image: '/img/estofos.jpg',
    includes: [
      'Aspiração profunda dos estofos',
      'Aplicação de produto especializado',
      'Escovagem mecânica',
      'Extração a quente',
      'Remoção de nódoas e manchas',
      'Eliminação de odores',
      'Secagem acelerada',
    ],
  },
  {
    id: 'descontaminacao-vidros',
    title: 'DESCONTAMINAÇÃO DE VIDROS',
    desc: 'Remoção de contaminantes e restauro da transparência dos vidros.',
    price: 50,
    duration: 60,
    durationLabel: '1 hora',
    icon: Droplets,
    image: '/img/vidros.jpg',
    includes: [
      'Remoção de calcário e depósitos minerais',
      'Descontaminação química dos vidros',
      'Polimento de vidros',
      'Aplicação de repelente de água',
      'Limpeza de espelhos retrovisores',
    ],
  },
  {
    id: 'polimento-farois-dianteiros',
    title: 'POLIMENTO FARÓIS DIANTEIROS (PAR)',
    desc: 'Restauro e polimento dos faróis dianteiros para máxima visibilidade.',
    price: 70,
    duration: 90,
    durationLabel: '1h30',
    icon: Lightbulb,
    image: '/img/polimento.jpg',
    includes: [
      'Lixagem progressiva (multi-grit)',
      'Polimento com máquina rotativa',
      'Restauro completo da transparência',
      'Aplicação de proteção UV',
      'Par de faróis dianteiros incluído',
    ],
  },
  {
    id: 'polimento-farois-traseiros',
    title: 'POLIMENTO FARÓIS TRASEIROS (PAR)',
    desc: 'Restauro e polimento dos faróis traseiros para um acabamento perfeito.',
    price: 50,
    duration: 60,
    durationLabel: '1 hora',
    icon: CircleDot,
    image: '/img/farois-traseiros.jpg',
    includes: [
      'Lixagem progressiva (multi-grit)',
      'Polimento com máquina rotativa',
      'Restauro completo da transparência',
      'Aplicação de proteção UV',
      'Par de faróis traseiros incluído',
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
    text: 'Marcação fácil, pontualidade e um resultado de outro nível. Voltarei sem dúvida.',
  },
];

// Booking helpers
export const TIME_SLOTS = [
  '08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00',
];

// LocalStorage key for mocked bookings
export const BOOKINGS_KEY = 'csc_bookings_mock_v1';

export const HERO_IMAGE = '/img/banner.png';

export const DETAIL_IMAGE = '/img/detail.jpg';

// ─── Calculadora de orçamento ────────────────────────────────────────────────
// IMPORTANTE: os preços dos extras e os multiplicadores de grau estão
// duplicados (autoritativos) no backend (server.py → EXTRAS_CATALOG / grade_for).
// Se alterares valores aqui, atualiza também o backend para manter a coerência.

// Problemas do INTERIOR — cada um conta 1 para o grau de sujidade.
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

// Problemas do EXTERIOR — cada um conta 1 para o grau de sujidade.
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

// Extras opcionais — valor configurável por extra.
export const EXTRAS = [
  { id: 'pelos-intensivo',    label: 'Remoção intensiva de pelos', price: 20, icon: Scissors },
  { id: 'odores',             label: 'Tratamento de odores',       price: 25, icon: Wind },
  { id: 'polimento-localizado', label: 'Polimento localizado',     price: 30, icon: Sparkles },
  { id: 'recup-plasticos',    label: 'Recuperação de plásticos',   price: 20, icon: Layers },
  { id: 'vomito',             label: 'Limpeza de vómito',          price: 40, icon: AlertTriangle },
  { id: 'derrames',           label: 'Limpeza de derrames',        price: 25, icon: Droplets },
  { id: 'outro',              label: 'Outro (sob consulta)',       price: 0,  icon: Plus, custom: true },
];

export const EXTRA_BY_ID = Object.fromEntries(EXTRAS.map((e) => [e.id, e]));

// Graus de sujidade determinados automaticamente pelo nº de problemas.
export const GRADES = [
  { grade: 1, label: 'Sujidade Normal',  labelEn: 'Normal Dirt',  min: 0, max: 1,        multiplier: 1.0,  pct: 0  },
  { grade: 2, label: 'Sujidade Elevada', labelEn: 'Heavy Dirt',   min: 2, max: 3,        multiplier: 1.3,  pct: 30 },
  { grade: 3, label: 'Sujidade Extrema', labelEn: 'Extreme Dirt', min: 4, max: Infinity, multiplier: 1.75, pct: 75 },
];

export function gradeForCount(count) {
  return GRADES.find((g) => count >= g.min && count <= g.max) || GRADES[0];
}

// Formata um valor em euros (vírgula decimal PT, sem decimais quando inteiro).
export function eur(n) {
  const v = Math.round((Number(n) + Number.EPSILON) * 100) / 100;
  return (Number.isInteger(v) ? String(v) : v.toFixed(2).replace('.', ',')) + ' €';
}

// Cálculo do orçamento em tempo real.
//   Subtotal   = Preço Base × Multiplicador (grau)
//   Preço Final = Subtotal + Extras
export function computeQuote(service, problemIds = [], extraIds = []) {
  const base = service?.price || 0;
  const count = problemIds.length;
  const g = gradeForCount(count);
  const subtotal = base * g.multiplier;
  const chosenExtras = EXTRAS.filter((e) => extraIds.includes(e.id));
  const extrasTotal = chosenExtras.reduce((s, e) => s + e.price, 0);
  const total = subtotal + extrasTotal;
  return {
    base,
    count,
    grade: g.grade,
    gradeLabel: g.label,
    gradeLabelEn: g.labelEn,
    multiplier: g.multiplier,
    pct: g.pct,
    subtotal,
    extrasTotal,
    total,
    chosenExtras,
  };
}

// ─── Traduções dos dados (EN) ────────────────────────────────────────────────
// Decoramos os arrays existentes com campos `*En`, lidos por tx() no i18n.
// Mantém os dados PT+EN juntos sem duplicar estrutura (ids, ícones, preços).

const EN_SERVICES = {
  'lavagem-ceramica': {
    title: 'WASH WITH CERAMIC PROTECTION',
    desc: 'Complete wash with ceramic protection applied for shine and protection.',
    durationLabel: '2 hours',
    includes: [
      'Snow foam pre-wash',
      'Complete exterior wash',
      'Paint decontamination',
      'Ceramic protection application',
      'Wheel and tyre cleaning',
      'Premium microfibre drying',
    ],
  },
  'lavagem-ceramica-longa': {
    title: 'WASH W/ LONG-LASTING CERAMIC PROTECTION',
    desc: 'Wash with long-lasting ceramic protection for maximum durability.',
    durationLabel: '3 hours',
    includes: [
      'Snow foam pre-wash',
      'Complete exterior wash',
      'Chemical paint decontamination',
      'Long-lasting ceramic protection (6+ months)',
      'Reinforced hydrophobic treatment',
      'Extra UV protection',
      'Wheel and tyre cleaning',
      'Premium microfibre drying',
    ],
  },
  'detalhada-completa': {
    title: 'FULL INTERIOR/EXTERIOR DETAIL',
    desc: 'Full detailed wash of the vehicle inside and out.',
    durationLabel: '1 day',
    includes: [
      'Deep exterior wash with snow foam',
      'Complete paint decontamination',
      'Vacuuming and cleaning of the entire interior',
      'Plastic cleaning and dressing',
      'Leather conditioning (if applicable)',
      'Interior and exterior glass cleaning',
      'Wheel and tyre cleaning',
      'Rubber and seal treatment',
      'Detailed engine bay cleaning',
      'Drying and final inspection',
    ],
  },
  'detalhada-interior': {
    title: 'DETAILED INTERIOR WASH',
    desc: 'Deep, detailed cleaning of the entire cabin.',
    durationLabel: '3 hours',
    includes: [
      'Complete cabin vacuuming',
      'Deep cleaning of upholstery and mats',
      'Plastic cleaning and dressing',
      'Leather conditioning (if applicable)',
      'Interior glass cleaning',
      'Console and dashboard cleaning',
      'Ozone sanitisation',
    ],
  },
  'detalhada-exterior': {
    title: 'DETAILED EXTERIOR WASH',
    desc: 'Meticulous exterior wash with attention to every detail.',
    durationLabel: '3 hours',
    includes: [
      'Snow foam pre-wash',
      'Two-bucket method wash',
      'Chemical and mechanical decontamination',
      'Detailed wheel and tyre cleaning',
      'Wheel arch cleaning',
      'Rubber and seal treatment',
      'Premium microfibre drying',
    ],
  },
  'higienizacao-estofos': {
    title: 'UPHOLSTERY SANITISATION',
    desc: 'Deep cleaning and sanitisation of the vehicle upholstery.',
    durationLabel: '3 hours',
    includes: [
      'Deep upholstery vacuuming',
      'Specialised product application',
      'Mechanical brushing',
      'Hot extraction',
      'Stain and mark removal',
      'Odour elimination',
      'Accelerated drying',
    ],
  },
  'descontaminacao-vidros': {
    title: 'GLASS DECONTAMINATION',
    desc: 'Removal of contaminants and restoration of glass clarity.',
    durationLabel: '1 hour',
    includes: [
      'Limescale and mineral deposit removal',
      'Chemical glass decontamination',
      'Glass polishing',
      'Water-repellent application',
      'Wing mirror cleaning',
    ],
  },
  'polimento-farois-dianteiros': {
    title: 'FRONT HEADLIGHT POLISHING (PAIR)',
    desc: 'Restoration and polishing of the front headlights for maximum visibility.',
    durationLabel: '1h30',
    includes: [
      'Progressive multi-grit sanding',
      'Rotary machine polishing',
      'Full clarity restoration',
      'UV protection application',
      'Pair of front headlights included',
    ],
  },
  'polimento-farois-traseiros': {
    title: 'REAR LIGHT POLISHING (PAIR)',
    desc: 'Restoration and polishing of the rear lights for a perfect finish.',
    durationLabel: '1 hour',
    includes: [
      'Progressive multi-grit sanding',
      'Rotary machine polishing',
      'Full clarity restoration',
      'UV protection application',
      'Pair of rear lights included',
    ],
  },
};

const EN_FEATURES = {
  'Atendimento Premium': 'Premium Service',
  'Produtos de Qualidade': 'Quality Products',
  'Resultados Garantidos': 'Guaranteed Results',
  'Marcação Rápida': 'Fast Booking',
};

const EN_PROCESS = {
  '01': { title: 'ASSESSMENT', desc: 'We analyse the vehicle condition to define the best treatment.' },
  '02': { title: 'DEEP WASH', desc: 'We remove dirt, contaminants and impurities in depth.' },
  '03': { title: 'DETAIL & PROTECTION', desc: 'We work every detail and apply high-quality protection.' },
  '04': { title: 'PREMIUM HANDOVER', desc: 'We hand your car back flawless and ready to impress.' },
};

const EN_TESTIMONIALS = {
  'Ricardo Pereira': 'Exceptional service! The car looked brand new, it exceeded my expectations.',
  'João Fernandes': 'Professionalism, attention to detail and incredible results. Highly recommend!',
  'Miguel Costa': 'Best detailed wash I have ever had. Impeccable setting and very attentive staff.',
  'Sofia Almeida': 'Easy booking, punctuality and a next-level result. I will definitely be back.',
};

const EN_BEFORE_AFTER = { EXTERIOR: 'EXTERIOR', INTERIOR: 'INTERIOR', BANCOS: 'SEATS', JANTES: 'WHEELS' };

const EN_PROBLEMS = {
  lixo: 'Accumulated rubbish',
  areia: 'Excessive sand or dirt',
  tapetes: 'Very dirty mats',
  'manchas-estofos': 'Upholstery stains',
  'manchas-dificeis': 'Tough stains',
  pelos: 'Pet hair',
  odor: 'Unpleasant odour',
  bagageira: 'Very dirty boot',
  insetos: 'Embedded insects',
  jantes: 'Heavily contaminated wheels',
  resina: 'Resin or tar',
  vidros: 'Contaminated glass',
  pintura: 'Heavily contaminated paint',
  lama: 'Excessive mud',
  plasticos: 'Degraded exterior plastics',
};

const EN_EXTRAS = {
  'pelos-intensivo': 'Intensive pet hair removal',
  odores: 'Odour treatment',
  'polimento-localizado': 'Localised polishing',
  'recup-plasticos': 'Plastic restoration',
  vomito: 'Vomit cleaning',
  derrames: 'Spill cleaning',
  outro: 'Other (on request)',
};

// Aplica os campos *En aos arrays exportados.
SERVICES.forEach((s) => {
  const e = EN_SERVICES[s.id];
  if (e) { s.titleEn = e.title; s.descEn = e.desc; s.durationLabelEn = e.durationLabel; s.includesEn = e.includes; }
});
FEATURES.forEach((f) => { if (EN_FEATURES[f.label]) f.labelEn = EN_FEATURES[f.label]; });
PROCESS.forEach((p) => { const e = EN_PROCESS[p.n]; if (e) { p.titleEn = e.title; p.descEn = e.desc; } });
TESTIMONIALS.forEach((t) => { if (EN_TESTIMONIALS[t.name]) t.textEn = EN_TESTIMONIALS[t.name]; });
BEFORE_AFTER.forEach((b) => { if (EN_BEFORE_AFTER[b.label]) b.labelEn = EN_BEFORE_AFTER[b.label]; });
[...INTERIOR_PROBLEMS, ...EXTERIOR_PROBLEMS].forEach((p) => { if (EN_PROBLEMS[p.id]) p.labelEn = EN_PROBLEMS[p.id]; });
EXTRAS.forEach((x) => { if (EN_EXTRAS[x.id]) x.labelEn = EN_EXTRAS[x.id]; });
