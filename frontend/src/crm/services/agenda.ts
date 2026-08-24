import { getSupabase } from '../lib/supabase';
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

export async function createTimeOff(input: {
  starts_at: string;
  ends_at: string;
  reason: string | null;
}): Promise<void> {
  const db = getSupabase();
  const { data: user } = await db.auth.getUser();
  // created_by e exigido pela politica de insert: sem ele o RLS recusa.
  const { error } = await db.from('time_off').insert({ ...input, created_by: user.user?.id });
  if (error) throw new Error(friendlyError(error));
}

export async function deleteTimeOff(id: string): Promise<void> {
  const { error } = await getSupabase().from('time_off').delete().eq('id', id);
  if (error) throw new Error(friendlyError(error));
}
