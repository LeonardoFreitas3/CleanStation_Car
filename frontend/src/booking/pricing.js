// ─── Tabela de preços da Clean Station Car ───────────────────────────────────
//
// O preço depende do TIPO DE VEÍCULO, não é único por serviço. Uma Sprinter dá
// muito mais trabalho que um citadino, e antes disto o site cobrava o mesmo
// pelos dois.
//
// Valores conforme a tabela manuscrita de referência. Ao alterar aqui, alterar
// também os service_types no CRM (supabase/migrations/0003) — são o mesmo
// negócio visto de dois sítios.

import { Car, Truck, Caravan, Bike } from 'lucide-react';

export const VEHICLE_TYPES = [
  { id: 'carro',    label: 'Carro / Carrinha',  hint: 'Citadinos, berlinas, carrinhas ligeiras', icon: Car },
  { id: 'grande',   label: 'Carrinha Grande',   hint: 'Sprinter, Transit, Jumper',                icon: Truck },
  { id: 'suv',      label: 'SUV / Monovolume',  hint: 'SUV, monovolumes, 7 lugares',              icon: Caravan },
  { id: 'mota',     label: 'Mota',              hint: 'Motos e scooters',                         icon: Bike },
];

export const VEHICLE_BY_ID = Object.fromEntries(VEHICLE_TYPES.map((v) => [v.id, v]));

/**
 * Níveis de lavagem e preço por tipo de veículo.
 *
 * Uma mota só tem lavagem simples: os restantes níveis não se aplicam. Um
 * preço em falta significa "não disponível", e o passo seguinte esconde-o em
 * vez de mostrar um valor inventado.
 *
 * Valores da tabela de outubro de 2026, por tipo de veículo. O do carro é o
 * "desde" que o site anuncia. A mota não vem na tabela e fica com o preço do
 * carro.
 *
 * A Lavagem com Selante deixou de existir em separado: o selante passou para
 * dentro da Simples.
 */
export const WASH_LEVELS = [
  {
    id: 'simples',
    label: 'Lavagem Simples',
    nota: '(Inclui selante)',
    desc: 'Limpeza interior e exterior de manutenção, com selante na pintura.',
    includes: ['Lavagem exterior à mão', 'Aspiração do interior', 'Limpeza do tablier e da mala', 'Vidros limpos', 'Selante aplicado na pintura'],
    prices: { carro: 35, grande: 45, suv: 40, mota: 35 },
  },
  {
    id: 'premium',
    label: 'Lavagem Premium',
    desc: 'Limpeza interior detalhada, descontaminação dos vidros e selante premium.',
    includes: ['Tudo da Lavagem Simples', 'Limpeza interior detalhada, até às zonas de difícil acesso', 'Descontaminação dos vidros', 'Selante premium na pintura'],
    prices: { carro: 75, grande: 85, suv: 80 },
  },
  {
    // O trabalho da detalhada numa só área. Marca-se escolhendo a área, e é a
    // área que vai para o servidor: cada uma é um nível no catalogue.ts, com o
    // seu nome no calendário e na ficha do CRM.
    id: 'detalhada-parcial',
    label: 'Lavagem Detalhada Interior ou Exterior',
    desc: 'O trabalho da Detalhada só na área escolhida: interior, com remoção e higienização dos bancos, ou exterior, com descontaminação da pintura e limpeza profunda de jantes e pneus.',
    includes: ['Só a área escolhida: interior ou exterior', 'Interior: remoção e higienização dos bancos', 'Exterior: descontaminação da pintura', 'Exterior: limpeza profunda de jantes e pneus'],
    areas: [
      { id: 'detalhada-interior', label: 'Interior', servico: 'Lavagem Detalhada Interior' },
      { id: 'detalhada-exterior', label: 'Exterior', servico: 'Lavagem Detalhada Exterior' },
    ],
    prices: { carro: 130, grande: 150, suv: 140 },
  },
  {
    id: 'detalhada',
    label: 'Lavagem Detalhada Interior + Exterior',
    desc: 'Tudo da Premium, mais remoção e higienização dos bancos, descontaminação da pintura e limpeza profunda de jantes e pneus.',
    includes: ['Tudo da Lavagem Premium', 'Remoção e higienização dos bancos', 'Descontaminação da pintura', 'Limpeza profunda de jantes e pneus'],
    prices: { carro: 200, grande: 240, suv: 220 },
  },
];

/**
 * O que cada lavagem tem, lado a lado. É a tabela de comparação do site; a
 * ordem das colunas é a dos níveis. A Detalhada Interior ou Exterior só faz uma
 * das áreas: nas linhas com `area`, a coluna dela diz qual em vez de um visto.
 * O selante é um selante: não se chama cerâmica ao que não é.
 */
export const COMPARACAO = [
  { label: 'Limpeza interior e exterior',      niveis: ['simples', 'premium', 'detalhada'] },
  { label: 'Selante na pintura',                niveis: ['simples'] },
  { label: 'Limpeza interior detalhada',        niveis: ['premium', 'detalhada-parcial', 'detalhada'], area: 'interior' },
  { label: 'Descontaminação dos vidros',        niveis: ['premium', 'detalhada-parcial', 'detalhada'], area: 'exterior' },
  { label: 'Selante premium',                   niveis: ['premium', 'detalhada-parcial', 'detalhada'], area: 'exterior' },
  { label: 'Remoção e higienização dos bancos', niveis: ['detalhada-parcial', 'detalhada'], area: 'interior' },
  { label: 'Descontaminação da pintura',        niveis: ['detalhada-parcial', 'detalhada'], area: 'exterior' },
  { label: 'Limpeza profunda de jantes e pneus', niveis: ['detalhada-parcial', 'detalhada'], area: 'exterior' },
];

export const LEVEL_BY_ID = Object.fromEntries(WASH_LEVELS.map((l) => [l.id, l]));

/** O "desde" de um nível: o preço mais baixo da tabela, que é o do carro. */
export const minPrice = (levelId) => Math.min(...Object.values(LEVEL_BY_ID[levelId].prices));

/**
 * Duração de cada nível, em minutos, conforme os tempos da oficina. São
 * aproximados, e o site diz-o.
 *
 * Uma por veículo, e não uma igual para todos: é isto que a agenda bloqueia.
 * A do carro é a da tabela de outubro de 2026 (1h30, 4h, 4h e 8h). Os
 * acréscimos de SUV e carrinha grande são os que a oficina já usava; as duas
 * detalhadas seguem os da Premium (+25% e +50%), decidido com a oficina.
 *
 * A detalhada de SUV e carrinha grande (10h e 12h) não cabe no dia de
 * trabalho: a agenda trata-a como dia inteiro, com entrega à abertura.
 */
export const DURATIONS = {
  simples:             { carro: 90,  grande: 120, suv: 105, mota: 105 },
  premium:             { carro: 240, grande: 360, suv: 300 },
  'detalhada-parcial': { carro: 240, grande: 360, suv: 300 },
  detalhada:           { carro: 480, grande: 720, suv: 600 },
};

/** A partir daqui o serviço não cabe num dia de trabalho: ocupa o dia todo. */
export const FULL_DAY_MINUTES = 660;

export const isFullDay = (minutes) => minutes >= FULL_DAY_MINUTES;

export function durationFor(vehicleId, levelId) {
  return DURATIONS[levelId]?.[vehicleId] ?? 60;
}

/** "2h30" em vez de "150 minutos", que ninguém lê de cabeça. */
export function formatDuration(minutes) {
  if (minutes >= 1440) return 'Dia inteiro';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
}

/** Níveis disponíveis para um tipo de veículo, já com o preço resolvido. */
export function levelsFor(vehicleId) {
  return WASH_LEVELS
    .filter((l) => l.prices[vehicleId] !== undefined)
    .map((l) => ({ ...l, price: l.prices[vehicleId] }));
}

export function priceFor(vehicleId, levelId) {
  return LEVEL_BY_ID[levelId]?.prices[vehicleId];
}

export function eur(n) {
  const v = Math.round((Number(n) + Number.EPSILON) * 100) / 100;
  return `${Number.isInteger(v) ? String(v) : v.toFixed(2).replace('.', ',')} €`;
}

/**
 * Cupões aceites na marcação. Espelho de COUPONS em
 * supabase/functions/booking/catalogue.ts — o site mostra, o servidor decide.
 */
export const COUPONS = {
  TAFIXE: { pct: 15, label: '15% de desconto na lavagem' },
};

export const normalizeCoupon = (code) => (code ?? '').trim().toUpperCase();

/** O cupão, se o código existir; undefined se não. Vazio também dá undefined. */
export const couponFor = (code) => COUPONS[normalizeCoupon(code)];

/**
 * Orçamento: o preço do nível para aquele tipo de veículo, menos o cupão, se
 * houver um válido.
 *
 * Houve aqui duas coisas que já não há. Um multiplicador por "grau de
 * sujidade", que subia o valor 30% ou 75% conforme as caixas que o cliente
 * assinalasse; e os packs de duas lavagens por mês, com preço fechado. Saíram
 * ambos em agosto de 2026, por decisão do negócio — o preço do site é o da
 * tabela, e o resto orça-se ao ver a viatura.
 *
 * @param {{ vehicleId?: string, levelId?: string, coupon?: string }} params
 */
export function computeQuote({ vehicleId, levelId, coupon }) {
  const base = priceFor(vehicleId, levelId) ?? 0;
  const c = couponFor(coupon);
  const discount = c ? Math.round(base * c.pct) / 100 : 0;
  return { base, discount, pct: c?.pct ?? 0, total: Math.round((base - discount) * 100) / 100 };
}
