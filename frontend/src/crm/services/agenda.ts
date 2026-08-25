import { getSupabase } from '../lib/supabase';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/config';
import { friendlyError } from '../lib/errors';
import { SELECT_WITH_RELATIONS } from './services';
import type { ServiceWithRelations, TimeOff } from '../types';

/**
 * Segunda-feira da semana a que a data pertence, a meia-noite local.
 *
 * A semana comeca a segunda porque a oficina fecha ao domingo: com a semana a
 * comecar ao domingo, o dia fechado ficava no topo do ecra.
 */
export function weekStart(anchor: Date): Date {
  const d = new Date(anchor);
  d.setHours(0, 0, 0, 0);
  // getDay(): 0 = domingo. Domingo pertence a semana que acabou de terminar.
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

/** Os sete dias da semana da data dada, de segunda a domingo. */
export function weekDays(anchor: Date): Date[] {
  const start = weekStart(anchor);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

/** Chave YYYY-MM-DD em hora local. toISOString() nao serve: converte para UTC. */
export function dayKey(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Dias que uma folga ocupa, em chaves YYYY-MM-DD.
 *
 * Uma folga de tres dias tem de aparecer nos tres, e nao so no dia em que
 * comeca. O fim e exclusivo a meia-noite: uma folga que acaba as 00:00 de
 * quinta e uma folga ate quarta.
 */
export function timeOffDays(off: Pick<TimeOff, 'starts_at' | 'ends_at'>): string[] {
  const end = new Date(off.ends_at);
  const cursor = new Date(off.starts_at);
  cursor.setHours(0, 0, 0, 0);

  const out: string[] = [];
  while (cursor < end) {
    out.push(dayKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

/** Horario da oficina. Igual ao de supabase/functions/booking/slots.ts. */
export const OPENS = 9;
export const CLOSES = 20;

/**
 * Hora a propor quando se marca um servico a partir de um dia da agenda:
 * a seguir ao ultimo servico ja marcado, ou a abertura se o dia estiver vazio.
 *
 * E so uma sugestao — quem marca ve a hora no formulario e muda-a. Serve para
 * o caso comum (encaixar o proximo a seguir ao anterior) nao dar trabalho.
 */
export function nextFreeHour(
  day: Date,
  services: Array<Pick<ServiceWithRelations, 'scheduled_at' | 'duration_minutes'>>,
): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const opening = new Date(day);
  opening.setHours(OPENS, 0, 0, 0);

  let end = opening.getTime();
  for (const s of services) {
    if (!s.scheduled_at) continue;
    const finish = new Date(s.scheduled_at).getTime() + (s.duration_minutes ?? 120) * 60_000;
    if (finish > end) end = finish;
  }

  // Arredonda para a meia hora seguinte: ninguem marca as 10:07.
  const slot = new Date(Math.ceil(end / (30 * 60_000)) * 30 * 60_000);

  // Dia cheio: propoe o fecho e deixa a decisao a quem esta a marcar, em vez
  // de saltar para o dia seguinte sem avisar.
  if (slot.getHours() >= CLOSES) return `${pad(CLOSES)}:00`;
  return `${pad(slot.getHours())}:${pad(slot.getMinutes())}`;
}

export interface Week {
  days: Date[];
  services: ServiceWithRelations[];
  timeOff: TimeOff[];
}

export async function loadWeek(anchor: Date): Promise<Week> {
  const days = weekDays(anchor);
  const from = days[0].toISOString();
  const to = new Date(days[6].getTime() + 24 * 3600_000).toISOString();

  const db = getSupabase();
  const [services, off] = await Promise.all([
    db.from('services')
      .select(SELECT_WITH_RELATIONS)
      .is('deleted_at', null)
      .gte('scheduled_at', from)
      .lt('scheduled_at', to)
      .order('scheduled_at'),
    // Sobreposicao com a semana, nao "comeca dentro da semana": uma folga que
    // arranca no domingo anterior tem de aparecer na segunda.
    db.from('time_off')
      .select('*')
      .lt('starts_at', to)
      .gt('ends_at', from)
      .order('starts_at'),
  ]);

  if (services.error) throw new Error(friendlyError(services.error));
  if (off.error) throw new Error(friendlyError(off.error));

  return {
    days,
    services: (services.data ?? []) as unknown as ServiceWithRelations[],
    timeOff: (off.data ?? []) as TimeOff[],
  };
}

/**
 * Espelho da folga no Google Calendar.
 *
 * As credenciais do Google vivem nos secrets do Supabase e nunca no browser,
 * portanto quem fala com o calendario e a Edge Function. Vai a sessao de quem
 * esta a pedir, que a funcao verifica.
 *
 * Nao lanca: a folga ja esta guardada e ja bloqueia o site quando isto corre. Se
 * o Google estiver em baixo, o pior caso e nao se ver a folga no telemovel —
 * rebentar aqui era transformar isso em "nao consegui marcar a folga".
 */
async function syncTimeOffToCalendar(path: string, body: Record<string, unknown>): Promise<void> {
  try {
    const { data: { session } } = await getSupabase().auth.getSession();
    if (!session) return;

    await fetch(`${SUPABASE_URL}/functions/v1/booking/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(body),
    });
  } catch {
    // Ver acima: o calendario e o espelho, nao o original.
  }
}

export async function createTimeOff(input: {
  starts_at: string;
  ends_at: string;
  reason: string | null;
}): Promise<void> {
  const db = getSupabase();
  const { data: user } = await db.auth.getUser();
  // created_by e exigido pela politica de insert: sem ele o RLS recusa.
  const { data, error } = await db.from('time_off')
    .insert({ ...input, created_by: user.user?.id })
    .select('id')
    .single();
  if (error) throw new Error(friendlyError(error));

  await syncTimeOffToCalendar('time-off', { id: data.id });
}

export async function deleteTimeOff(id: string): Promise<void> {
  const db = getSupabase();
  // Lido antes de apagar: depois da linha desaparecer nao ha como saber que
  // evento e que lhe correspondia, e ele ficava orfao no calendario.
  const { data: off } = await db.from('time_off')
    .select('google_event_id').eq('id', id).maybeSingle();

  const { error } = await db.from('time_off').delete().eq('id', id);
  if (error) throw new Error(friendlyError(error));

  if (off?.google_event_id) {
    await syncTimeOffToCalendar('time-off-remove', { eventId: off.google_event_id });
  }
}
