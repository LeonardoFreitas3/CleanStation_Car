// Cálculo de horas livres.
//
// Isolado do resto para poder ser testado sem tocar no Google nem na base de
// dados: recebe os períodos ocupados e devolve as horas livres. É a lógica que
// mais facilmente se estraga em silêncio.

/** Período ocupado, no formato que o freeBusy do Google devolve. */
export interface Busy { start: string; end: string }

export const OPENS = 8;          // 08:00
export const CLOSES = 19;        // 19:00
export const SLOT_MINUTES = 30;
export const MIN_NOTICE_MINUTES = 60;

/**
 * Deslocação horária de Lisboa naquele dia, no formato "+01:00".
 *
 * Calculada por data e não fixa, porque Portugal muda para a hora de verão:
 * uma marcação em julho com a deslocação de janeiro ficava uma hora ao lado.
 */
export function lisbonOffset(dateIso: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Lisbon',
    timeZoneName: 'longOffset',
  }).formatToParts(new Date(`${dateIso}T12:00:00Z`));

  const name = parts.find((p) => p.type === 'timeZoneName')?.value ?? 'GMT+00:00';
  const offset = name.replace('GMT', '');
  return offset === '' ? '+00:00' : offset;
}

export function slotIso(dateIso: string, hour: number, minute: number): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${dateIso}T${pad(hour)}:${pad(minute)}:00${lisbonOffset(dateIso)}`;
}

/** Domingo encerrado. getUTCDay() com meio-dia UTC evita saltos de fuso. */
export function isClosed(dateIso: string): boolean {
  return new Date(`${dateIso}T12:00:00Z`).getUTCDay() === 0;
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && aEnd > bStart;
}

/**
 * Horas livres do dia, já a contar com a duração do serviço.
 *
 * Um serviço de 4h às 16:00 não cabe antes das 19:00, portanto essa hora não
 * aparece — mostrar e depois recusar era pior do que não mostrar.
 */
export function freeSlots(
  dateIso: string,
  durationMinutes: number,
  busy: Busy[],
  now: Date = new Date(),
): string[] {
  if (isClosed(dateIso)) return [];

  const busyRanges = busy.map((b) => ({
    start: new Date(b.start).getTime(),
    end: new Date(b.end).getTime(),
  }));

  const earliest = now.getTime() + MIN_NOTICE_MINUTES * 60_000;
  const closing = new Date(slotIso(dateIso, CLOSES, 0)).getTime();
  const out: string[] = [];

  for (let h = OPENS; h < CLOSES; h++) {
    for (let m = 0; m < 60; m += SLOT_MINUTES) {
      const start = new Date(slotIso(dateIso, h, m)).getTime();
      const end = start + durationMinutes * 60_000;

      if (end > closing) continue;
      if (start < earliest) continue;
      if (busyRanges.some((b) => overlaps(start, end, b.start, b.end))) continue;

      out.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }

  return out;
}
