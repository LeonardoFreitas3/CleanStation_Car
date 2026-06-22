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
  { grade: 1, label: 'Sujidade Normal',  min: 0, max: 1,        multiplier: 1.0,  pct: 0  },
  { grade: 2, label: 'Sujidade Elevada', min: 2, max: 3,        multiplier: 1.3,  pct: 30 },
  { grade: 3, label: 'Sujidade Extrema', min: 4, max: Infinity, multiplier: 1.75, pct: 75 },
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
    multiplier: g.multiplier,
    pct: g.pct,
    subtotal,
    extrasTotal,
    total,
    chosenExtras,
  };
}
