// Mock data for Clean Station Car
import { Sparkles, Brush, Disc3, ShieldCheck, Car, Wrench, Gem, SprayCan, ShieldPlus, Droplets, Lightbulb, CircleDot } from 'lucide-react';

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
