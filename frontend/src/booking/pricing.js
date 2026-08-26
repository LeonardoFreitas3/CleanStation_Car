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
 */
export const WASH_LEVELS = [
  {
    id: 'simples',
    label: 'Lavagem Simples',
    desc: 'Interior + exterior · Manutenção',
    includes: ['Lavagem exterior completa', 'Aspiração do interior', 'Limpeza básica do interior', 'Vidros limpos'],
    prices: { carro: 30, grande: 45, suv: 35, mota: 30 },
  },
  {
    id: 'selante',
    label: 'Lavagem com Selante',
    desc: 'Simples + proteção',
    includes: ['Tudo da lavagem simples', 'Aplicação de selante protetor', 'Maior brilho e repelência à água', 'Protege a pintura de sujidade'],
    prices: { carro: 40, grande: 55, suv: 45 },
  },
  {
    id: 'premium',
    label: 'Lavagem Premium',
    desc: 'Limpeza profunda + descontaminação dos vidros',
    includes: ['Tudo da lavagem com selante', 'Selante premium de alta performance', 'Brilho intenso e proteção superior', 'Maior duração do efeito protetor'],
    prices: { carro: 65, grande: 80, suv: 75 },
  },
  {
    id: 'detalhada',
    label: 'Lavagem Detalhada',
    desc: 'Premium + remoção dos bancos + descontaminação da pintura + selante premium',
    includes: ['Interior detalhado completo', 'Exterior detalhado completo', 'Limpeza de jantes e pneus', 'Cantos e zonas difíceis', 'Acabamento premium'],
    prices: { carro: 140, grande: 180, suv: 160 },
  },
];

export const LEVEL_BY_ID = Object.fromEntries(WASH_LEVELS.map((l) => [l.id, l]));

/**
 * Duração de cada nível, em minutos, conforme os tempos reais da oficina.
 *
 * A detalhada são 24h: o carro fica de um dia para o outro. Não é um bloco de
 * horas como os outros — ocupa o dia inteiro, e o cálculo de vagas trata-a à
 * parte (ver FULL_DAY_MINUTES).
 */
export const DURATIONS = {
  simples:   { carro: 90,  grande: 120, suv: 105, mota: 105 },
  selante:   { carro: 105, grande: 135, suv: 120 },
  premium:   { carro: 240, grande: 360, suv: 300 },
  detalhada: { carro: 1440, grande: 1440, suv: 1440 },
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
 * Orçamento: o preço do nível para aquele tipo de veículo, e mais nada.
 *
 * Houve aqui duas coisas que já não há. Um multiplicador por "grau de
 * sujidade", que subia o valor 30% ou 75% conforme as caixas que o cliente
 * assinalasse; e os packs de duas lavagens por mês, com preço fechado. Saíram
 * ambos em agosto de 2026, por decisão do negócio — o preço do site é o da
 * tabela, e o resto orça-se ao ver a viatura.
 *
 * @param {{ vehicleId?: string, levelId?: string }} params
 */
export function computeQuote({ vehicleId, levelId }) {
  const base = priceFor(vehicleId, levelId) ?? 0;
  return { base, total: base };
}
