// Mock data for Clean Station Car
import { Sparkles, Brush, Disc3, ShieldCheck, Car, Wrench, Gem, SprayCan } from 'lucide-react';

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
    id: 'lavagem',
    title: 'LAVAGEM DETALHADA',
    desc: 'Lavagem exterior profunda com atenção a cada detalhe.',
    price: 25,
    duration: 120, // minutes
    durationLabel: '2 horas',
    icon: Car,
    image: '/img/lavagem.jpg',
  },
  {
    id: 'interior',
    title: 'HIGIENIZAÇÃO INTERIOR',
    desc: 'Limpeza e higienização completa do habitáculo.',
    price: 40,
    duration: 180,
    durationLabel: '3 horas',
    icon: Brush,
    image: '/img/interior.jpg',
  },
  {
    id: 'polimento',
    title: 'POLIMENTO',
    desc: 'Correção de pintura e remoção de riscos e imperfeições.',
    price: 80,
    duration: 240,
    durationLabel: '4 horas',
    icon: Disc3,
    image: '/img/polimento.jpg',
  },
  {
    id: 'ceramica',
    title: 'PROTEÇÃO CERÂMICA',
    desc: 'Proteção duradoura com brilho intenso e efeito hidrofóbico.',
    price: 120,
    duration: 480,
    durationLabel: '1 dia',
    fullDay: true,
    icon: ShieldCheck,
    image: '/img/proteção.jpg',
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
