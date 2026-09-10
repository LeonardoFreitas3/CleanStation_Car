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

export interface Resolved {
  label: string;
  price: number;
  duration: number;
}

/**
 * Resolve preço e duração a partir dos ids. Lança se a combinação não existir —
 * uma mota não leva lavagem detalhada, e aceitar isso criava uma marcação
 * impossível de cumprir.
 *
 * Houve aqui duas coisas que saíram em agosto de 2026, por decisão do negócio:
 * um multiplicador pelo "estado da viatura", que subia o preço até 75% conforme
 * o número de problemas assinalados, e os packs de duas lavagens por mês. As
 * duas estavam escritas a dobrar, aqui e no pricing.js do site, e saíram dos
 * dois sítios.
 */
export function resolve(vehicleType: string, levelId: string): Resolved {
  const level = LEVELS[levelId];
  if (!level) throw new Error(`Serviço desconhecido: ${levelId}`);

  const vehicle = vehicleType as VehicleId;
  const duration = level.durations[vehicle];
  if (duration === undefined) {
    throw new Error(`Serviço "${level.label}" não disponível para este tipo de veículo`);
  }

  const base = level.prices[vehicle];
  if (base === undefined) throw new Error(`Preço indisponível para este veículo`);

  return { label: level.label, price: base, duration };
}
