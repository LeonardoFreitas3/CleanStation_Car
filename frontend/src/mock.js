// Mock data for Clean Station Car
import { Sparkles, Brush, Disc3, ShieldCheck, Car, Wrench, Gem, SprayCan } from 'lucide-react';

export const SITE = {
  name: 'Clean Station Car',
  tagline: 'Lavagem Detalhada Premium em Braga',
  subtitle: 'O detalhe que o teu carro merece.',
  phone: '+351 934 177 308',
  phoneRaw: '351934177308',
  email: 'geral@cleanstationcar.pt',
  address: 'Braga, Portugal',
  hours: 'Segunda a Sábado · 08:00 – 19:00',
  mapsShareUrl: 'https://share.google/SwUsUmGYcqFvPOh6h',
  mapsEmbed:
    'https://www.google.com/maps?q=Braga,Portugal&output=embed',
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
    image:
      'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'interior',
    title: 'HIGIENIZAÇÃO INTERIOR',
    desc: 'Limpeza e higienização completa do habitáculo.',
    price: 40,
    duration: 180,
    durationLabel: '3 horas',
    icon: Brush,
    image:
      'https://images.unsplash.com/photo-1633014041037-f5446fb4ce99?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'polimento',
    title: 'POLIMENTO',
    desc: 'Correção de pintura e remoção de riscos e imperfeições.',
    price: 80,
    duration: 240,
    durationLabel: '4 horas',
    icon: Disc3,
    image:
      'https://images.pexels.com/photos/33615347/pexels-photo-33615347.jpeg?auto=compress&w=1200&q=80',
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
    image:
      'https://images.unsplash.com/photo-1606664914460-b667528c1acc?auto=format&fit=crop&w=1200&q=80',
  },
];

export const BEFORE_AFTER = [
  {
    label: 'EXTERIOR',
    before:
      'https://images.unsplash.com/photo-1605164599901-db7f68c4b1a2?auto=format&fit=crop&w=700&q=70&sat=-100&brightness=0.45',
    after:
      'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?auto=format&fit=crop&w=700&q=85',
  },
  {
    label: 'INTERIOR',
    before:
      'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=700&q=70&sat=-100&brightness=0.5',
    after:
      'https://images.unsplash.com/photo-1633014041037-f5446fb4ce99?auto=format&fit=crop&w=700&q=85',
  },
  {
    label: 'BANCOS',
    before:
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=700&q=70&sat=-100&brightness=0.45',
    after:
      'https://images.unsplash.com/photo-1612795023384-fc4772af8d87?auto=format&fit=crop&w=700&q=85',
  },
  {
    label: 'JANTES',
    before:
      'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?auto=format&fit=crop&w=700&q=70&sat=-100&brightness=0.5',
    after:
      'https://images.unsplash.com/photo-1536796423601-e9733a86d257?auto=format&fit=crop&w=700&q=85',
  },
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

export const HERO_IMAGE =
  'https://images.unsplash.com/photo-1549064233-945d7063292f?auto=format&fit=crop&w=2000&q=80';

export const DETAIL_IMAGE =
  'https://images.unsplash.com/photo-1708805282695-ef186db20192?auto=format&fit=crop&w=2000&q=80';
