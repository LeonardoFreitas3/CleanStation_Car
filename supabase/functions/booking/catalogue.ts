// Catálogo autoritativo.
//
// O preço e a duração NUNCA vêm do cliente — só o id do veículo e do nível.
// Sem isto, quem construísse o pedido à mão podia mandar price:1 e
// duration:15, e ficava com uma lavagem detalhada por 1 euro a ocupar um
// quarto de hora da agenda em vez de quatro horas.
//
// Tem de acompanhar frontend/src/booking/pricing.js. O frontend mostra, este
// decide.

type VehicleId = 'carro' | 'grande' | 'suv' | 'mota';

interface Level {
  label: string;
  prices: Partial<Record<VehicleId, number>>;
  durations: Partial<Record<VehicleId, number>>;
}

const LEVELS: Record<string, Level> = {
  simples: {
    label: 'Lavagem Simples',
    prices: { carro: 30, grande: 45, suv: 35, mota: 30 },
    durations: { carro: 90, grande: 120, suv: 105, mota: 105 },
  },
  selante: {
    label: 'Lavagem com Selante',
    prices: { carro: 40, grande: 55, suv: 45 },
    durations: { carro: 105, grande: 135, suv: 120 },
  },
  premium: {
    label: 'Lavagem Premium',
    prices: { carro: 65, grande: 80, suv: 75 },
    durations: { carro: 240, grande: 360, suv: 300 },
  },
  detalhada: {
    label: 'Lavagem Detalhada',
    prices: { carro: 140, grande: 180, suv: 160 },
    // 24h: o carro fica de um dia para o outro. Ocupa o dia inteiro, e o
    // calculo de vagas trata este caso a parte.
    durations: { carro: 1440, grande: 1440, suv: 1440 },
  },
};

const PACKS: Record<string, Partial<Record<VehicleId, number>>> = {
  selante: { carro: 65, grande: 95, suv: 75 },
  premium: { carro: 105, grande: 155, suv: 125 },
  detalhada: { carro: 220, grande: 300, suv: 260 },
};

/** Multiplicador pelo estado da viatura. Num pack não se aplica: é preço fechado. */
function gradeMultiplier(problemCount: number): { grade: number; label: string; pct: number; mult: number } {
  if (problemCount >= 4) return { grade: 3, label: 'Sujidade Extrema', pct: 75, mult: 1.75 };
  if (problemCount >= 2) return { grade: 2, label: 'Sujidade Elevada', pct: 30, mult: 1.3 };
  return { grade: 1, label: 'Sujidade Normal', pct: 0, mult: 1 };
}

export interface Resolved {
  label: string;
  price: number;
  duration: number;
  grade: number;
  gradeLabel: string;
  gradePct: number;
}

/**
 * Resolve preço, duração e grau a partir dos ids. Lança se a combinação não
 * existir — uma mota não leva lavagem detalhada, e aceitar isso criava uma
 * marcação impossível de cumprir.
 */
export function resolve(
  vehicleType: string,
  levelId: string,
  isPack: boolean,
  problemCount: number,
): Resolved {
  const level = LEVELS[levelId];
  if (!level) throw new Error(`Serviço desconhecido: ${levelId}`);

  const vehicle = vehicleType as VehicleId;
  const duration = level.durations[vehicle];
  if (duration === undefined) {
    throw new Error(`Serviço "${level.label}" não disponível para este tipo de veículo`);
  }

  if (isPack) {
    const packPrice = PACKS[levelId]?.[vehicle];
    if (packPrice === undefined) throw new Error(`Não existe pack para "${level.label}" neste veículo`);
    return {
      label: level.label,
      price: packPrice,
      duration,
      grade: 1,
      gradeLabel: 'Pack mensal',
      gradePct: 0,
    };
  }

  const base = level.prices[vehicle];
  if (base === undefined) throw new Error(`Preço indisponível para este veículo`);

  const g = gradeMultiplier(problemCount);
  return {
    label: level.label,
    price: Math.round(base * g.mult * 100) / 100,
    duration,
    grade: g.grade,
    gradeLabel: g.label,
    gradePct: g.pct,
  };
}
