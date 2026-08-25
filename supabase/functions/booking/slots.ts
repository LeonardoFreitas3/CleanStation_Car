// Cálculo de horas livres.
//
// Isolado do resto para poder ser testado sem tocar no Google nem na base de
// dados: recebe os períodos ocupados e devolve as horas livres. É a lógica que
// mais facilmente se estraga em silêncio.

/** Período ocupado, no formato que o freeBusy do Google devolve. */
export interface Busy { start: string; end: string }

// Valores por omissao. O horario a serio vem das definicoes, na base de dados —
// estes sao o que vale se a linha nao existir (0014 por correr) ou se a leitura
// falhar: melhor oferecer o horario habitual do que nao oferecer hora nenhuma.
export const OPENS = 9;          // 09:00
export const CLOSES = 20;        // 20:00

export interface Horario { opens: number; closes: number }

export const HORARIO_OMISSAO: Horario = { opens: OPENS, closes: CLOSES };
export const SLOT_MINUTES = 30;
export const MIN_NOTICE_MINUTES = 60;

/** A partir daqui o serviço não cabe num dia de trabalho: ocupa o dia todo.
 *  Relativo ao horário — encurtar o dia não pode deixar serviços sem hora
 *  nenhuma por caberem num dia que já não existe. */
export const FULL_DAY_MINUTES = 660;

export const isFullDay = (minutes: number, horario: Horario = HORARIO_OMISSAO) =>
  minutes >= (horario.closes - horario.opens) * 60;

/** "Dia inteiro" em vez de "1440min", que não diz nada a ninguém. */
export function formatDuration(minutes: number): string {
  if (minutes >= 1440) return 'Dia inteiro';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
}

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

/**
 * Data de hoje em Lisboa, no formato YYYY-MM-DD.
 *
 * O fuso do servidor não serve: a função corre em infraestrutura que pode
 * estar noutro continente, e à meia-noite isso mudava o dia por engano.
 */
export function todayInLisbon(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon' }).format(now);
}

/**
 * Não se marca para o próprio dia.
 *
 * O trabalho tem de ser preparado com antecedência: produtos, box livre,
 * pessoal. Uma marcação para daqui a duas horas apanha a oficina de surpresa.
 */
export function isTooSoon(dateIso: string, now: Date = new Date()): boolean {
  return dateIso <= todayInLisbon(now);
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && aEnd > bStart;
}

/**
 * Horas livres do dia, já a contar com a duração do serviço.
 *
 * Um serviço de 4h às 17:00 não cabe antes das 20:00, portanto essa hora não
 * aparece — mostrar e depois recusar era pior do que não mostrar.
 */
export function freeSlots(
  dateIso: string,
  durationMinutes: number,
  busy: Busy[],
  now: Date = new Date(),
  horario: Horario = HORARIO_OMISSAO,
): string[] {
  const { opens, closes } = horario;
  if (isClosed(dateIso)) return [];
  if (isTooSoon(dateIso, now)) return [];

  const busyRanges = busy.map((b) => ({
    start: new Date(b.start).getTime(),
    end: new Date(b.end).getTime(),
  }));

  const earliest = now.getTime() + MIN_NOTICE_MINUTES * 60_000;
  const opening = new Date(slotIso(dateIso, opens, 0)).getTime();
  const closing = new Date(slotIso(dateIso, closes, 0)).getTime();

  // Serviços de dia inteiro (a lavagem detalhada são 24h) não cabem entre as
  // 09:00 e as 20:00, e exigir que terminassem antes do fecho fazia com que
  // nunca tivessem hora nenhuma disponível. Tratam-se à parte: entrega ao
  // abrir, o dia fica ocupado, e o carro sai no dia seguinte.
  if (isFullDay(durationMinutes, horario)) {
    if (opening < earliest) return [];
    const end = opening + durationMinutes * 60_000;
    // O dia tem de estar livre de ponta a ponta, não só a hora de entrega.
    if (busyRanges.some((b) => overlaps(opening, end, b.start, b.end))) return [];
    return [`${String(opens).padStart(2, '0')}:00`];
  }

  const out: string[] = [];

  for (let h = opens; h < closes; h++) {
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
