// ─── Tabela de preços da Clean Station Car ───────────────────────────────────
//
// O preço depende do TIPO DE VEÍCULO, não é único por serviço. Uma Sprinter dá
// muito mais trabalho que um citadino, e antes disto o site cobrava o mesmo
// pelos dois.
//
// Valores conforme a tabela manuscrita de referência. Ao alterar aqui, alterar
// também os service_types no CRM (supabase/migrations/0003) — são o mesmo
// negócio visto de dois sítios.

import {
  Car, Truck, Caravan, Bike,
  Trash2, Wind, Footprints, Droplet, Droplets, PawPrint, CloudFog, Package,
  Bug, Disc3, Square, SprayCan, Waves, Layers,
} from 'lucide-react';

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
    desc: 'Limpeza geral para manutenção do veículo.',
    includes: ['Lavagem exterior completa', 'Aspiração do interior', 'Limpeza básica do interior', 'Vidros limpos'],
    prices: { carro: 30, grande: 45, suv: 35, mota: 30 },
  },
  {
    id: 'selante',
    label: 'Lavagem com Selante',
    desc: 'Proteção temporária que realça o brilho e repele a água.',
    includes: ['Tudo da lavagem simples', 'Aplicação de selante protetor', 'Maior brilho e repelência à água', 'Protege a pintura de sujidade'],
    prices: { carro: 40, grande: 55, suv: 45 },
  },
  {
    id: 'premium',
    label: 'Lavagem Premium',
    desc: 'Selante de alta performance, proteção superior e brilho mais duradouro.',
    includes: ['Tudo da lavagem com selante', 'Selante premium de alta performance', 'Brilho intenso e proteção superior', 'Maior duração do efeito protetor'],
    prices: { carro: 65, grande: 80, suv: 75 },
  },
  {
    id: 'detalhada',
    label: 'Lavagem Detalhada',
    desc: 'O serviço mais completo, por dentro e por fora, ao pormenor.',
    includes: ['Interior detalhado completo', 'Exterior detalhado completo', 'Limpeza de jantes e pneus', 'Cantos e zonas difíceis', 'Acabamento premium'],
    prices: { carro: 140, grande: 180, suv: 160 },
  },
];

export const LEVEL_BY_ID = Object.fromEntries(WASH_LEVELS.map((l) => [l.id, l]));

/**
 * Duração de cada nível, em minutos. Determina quantas vagas o serviço ocupa
 * na agenda.
 *
 * Estes valores são uma estimativa: ajusta-os ao ritmo real da oficina. Curtos
 * demais e ficam com marcações em cima umas das outras; longos demais e a
 * agenda parece cheia quando não está. Uma mota leva menos tempo que um carro,
 * daí o ajuste por veículo.
 */
export const DURATIONS = {
  simples:   { carro: 60,  grande: 90,  suv: 75,  mota: 45 },
  selante:   { carro: 90,  grande: 120, suv: 105 },
  premium:   { carro: 120, grande: 150, suv: 135 },
  detalhada: { carro: 240, grande: 300, suv: 270 },
};

export function durationFor(vehicleId, levelId) {
  return DURATIONS[levelId]?.[vehicleId] ?? 60;
}

/** "2h30" em vez de "150 minutos", que ninguém lê de cabeça. */
export function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
}

/**
 * Packs de manutenção: duas lavagens por mês.
 *
 * Não há pack de lavagem simples nem para motas — não constam da tabela de
 * referência, e inventar um preço aqui era pior do que não o oferecer.
 */
export const PACKS = [
  { levelId: 'selante',   prices: { carro: 65,  grande: 95,  suv: 75  } },
  { levelId: 'premium',   prices: { carro: 105, grande: 155, suv: 125 } },
  { levelId: 'detalhada', prices: { carro: 220, grande: 300, suv: 260 } },
];

/** Níveis disponíveis para um tipo de veículo, já com o preço resolvido. */
export function levelsFor(vehicleId) {
  return WASH_LEVELS
    .filter((l) => l.prices[vehicleId] !== undefined)
    .map((l) => ({ ...l, price: l.prices[vehicleId] }));
}

/** Packs disponíveis para um tipo de veículo, com o desconto face a 2 lavagens. */
export function packsFor(vehicleId) {
  return PACKS
    .filter((p) => p.prices[vehicleId] !== undefined)
    .map((p) => {
      const level = LEVEL_BY_ID[p.levelId];
      const unit = level.prices[vehicleId];
      const price = p.prices[vehicleId];
      // Duas lavagens avulso vs o pack: mostrar a poupança é mais honesto do
      // que anunciar "desde" sem termo de comparação.
      const avulso = unit * 2;
      return {
        id: `pack-${p.levelId}`,
        levelId: p.levelId,
        label: level.label,
        price,
        avulso,
        saving: Math.max(0, avulso - price),
      };
    });
}

export function priceFor(vehicleId, levelId) {
  return LEVEL_BY_ID[levelId]?.prices[vehicleId];
}

// ─── Avaliação do estado do veículo ──────────────────────────────────────────
// Recuperada do calculador original (commit f9e883f). O preço de tabela assume
// sujidade normal; um carro que veio da praia ou traz pelo de cão dá mais
// trabalho, e é mais honesto dizê-lo no orçamento do que na entrega.

export const INTERIOR_PROBLEMS = [
  { id: 'lixo',             label: 'Lixo acumulado',           icon: Trash2 },
  { id: 'areia',            label: 'Areia ou terra excessiva', icon: Wind },
  { id: 'tapetes',          label: 'Tapetes muito sujos',      icon: Footprints },
  { id: 'manchas-estofos',  label: 'Manchas em estofos',       icon: Droplet },
  { id: 'manchas-dificeis', label: 'Manchas difíceis',         icon: Droplets },
  { id: 'pelos',            label: 'Pelos de animais',         icon: PawPrint },
  { id: 'odor',             label: 'Odor desagradável',        icon: CloudFog },
  { id: 'bagageira',        label: 'Bagageira muito suja',     icon: Package },
];

export const EXTERIOR_PROBLEMS = [
  { id: 'insetos',   label: 'Insetos incrustados',            icon: Bug },
  { id: 'jantes',    label: 'Jantes muito contaminadas',      icon: Disc3 },
  { id: 'resina',    label: 'Resina ou alcatrão',             icon: Droplet },
  { id: 'vidros',    label: 'Vidros contaminados',            icon: Square },
  { id: 'pintura',   label: 'Pintura muito contaminada',      icon: SprayCan },
  { id: 'lama',      label: 'Excesso de lama',                icon: Waves },
  { id: 'plasticos', label: 'Plásticos exteriores degradados', icon: Layers },
];

export const ALL_PROBLEMS = [...INTERIOR_PROBLEMS, ...EXTERIOR_PROBLEMS];
export const PROBLEM_LABEL = Object.fromEntries(ALL_PROBLEMS.map((p) => [p.id, p.label]));

export const GRADES = [
  { grade: 1, label: 'Sujidade Normal',  min: 0, max: 1,        multiplier: 1.0,  pct: 0  },
  { grade: 2, label: 'Sujidade Elevada', min: 2, max: 3,        multiplier: 1.3,  pct: 30 },
  { grade: 3, label: 'Sujidade Extrema', min: 4, max: Infinity, multiplier: 1.75, pct: 75 },
];

export function gradeForCount(count) {
  return GRADES.find((g) => count >= g.min && count <= g.max) || GRADES[0];
}

export function eur(n) {
  const v = Math.round((Number(n) + Number.EPSILON) * 100) / 100;
  return `${Number.isInteger(v) ? String(v) : v.toFixed(2).replace('.', ',')} €`;
}

/**
 * Orçamento final.
 *
 *   base      = preço do nível para aquele tipo de veículo
 *   subtotal  = base × multiplicador do grau de sujidade
 *
 * Num pack o grau não se aplica: é um preço fechado de duas lavagens por mês,
 * e aplicar-lhe um acréscimo de 75% descaracterizava a assinatura.
 */
export function computeQuote({ vehicleId, levelId, problemIds = [], pack = null }) {
  if (pack) {
    return {
      base: pack.price, count: 0, grade: 1, gradeLabel: 'Pack mensal',
      multiplier: 1, pct: 0, subtotal: pack.price, total: pack.price, isPack: true,
    };
  }

  const base = priceFor(vehicleId, levelId) ?? 0;
  const count = problemIds.length;
  const g = gradeForCount(count);
  const subtotal = base * g.multiplier;

  return {
    base,
    count,
    grade: g.grade,
    gradeLabel: g.label,
    multiplier: g.multiplier,
    pct: g.pct,
    subtotal,
    total: subtotal,
    isPack: false,
  };
}
