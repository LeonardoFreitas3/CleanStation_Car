import { getSupabase } from '../lib/supabase';
import { friendlyError } from '../lib/errors';
import { dayKey, weekDays } from './agenda';

/**
 * A folha de horas.
 *
 * Uma linha por pessoa e por dia, com as quatro marcas do dia: entrada, ida
 * para o almoco, regresso e saida. Os minutos trabalhados vem contados da
 * base de dados (a vista da 0031) e nao se recalculam aqui — a conta e uma so,
 * senao o ecra do funcionario e a folha do administrador acabavam a discordar
 * sobre a hora do almoco.
 */
export interface WorkShift {
  id: string;
  profile_id: string;
  full_name: string | null;
  work_date: string;
  started_at: string | null;
  break_started_at: string | null;
  break_ended_at: string | null;
  ended_at: string | null;
  note: string | null;
  /** Null enquanto o dia nao tiver principio e fim. Nao e zero. */
  worked_minutes: number | null;
  break_minutes: number | null;
}

/** Em que ponto do dia esta a pessoa. */
export type Fase = 'por-entrar' | 'a-trabalhar' | 'em-pausa' | 'terminado';

/**
 * A fase le-se das marcas que ja existem, e nao de um estado guardado a parte.
 *
 * Um campo `estado` na tabela era uma segunda verdade sobre a mesma coisa: bastava
 * uma correcao a mao nas horas para ele ficar a dizer "em pausa" a alguem que ja
 * tinha ido embora.
 */
export function fase(turno: WorkShift | null | undefined): Fase {
  if (!turno?.started_at) return 'por-entrar';
  if (turno.ended_at) return 'terminado';
  if (turno.break_started_at && !turno.break_ended_at) return 'em-pausa';
  return 'a-trabalhar';
}

/** A marca que cada acao escreve. */
export type Picagem = 'entrada' | 'pausa' | 'regresso' | 'saida';

const COLUNA: Record<Picagem, keyof WorkShift> = {
  entrada: 'started_at',
  pausa: 'break_started_at',
  regresso: 'break_ended_at',
  saida: 'ended_at',
};

/**
 * O que se pode fazer a seguir, em cada fase.
 *
 * Vive aqui e nao no ecra porque e a regra e nao o desenho: sair sem ter
 * entrado, ou ir almocar duas vezes, sao coisas que a base de dados recusa (o
 * check da 0031) e que o botao nem deve chegar a oferecer.
 */
export function acoes(f: Fase): Picagem[] {
  if (f === 'por-entrar') return ['entrada'];
  if (f === 'a-trabalhar') return ['pausa', 'saida'];
  if (f === 'em-pausa') return ['regresso'];
  return [];
}

export const PICAGEM_LABEL: Record<Picagem, string> = {
  entrada: 'Entrar',
  pausa: 'Ir almoçar',
  regresso: 'Voltar ao serviço',
  saida: 'Sair',
};

/** "7h30" a partir de minutos. Vazio quando nao ha numero para mostrar. */
export function horas(minutos: number | null | undefined): string {
  if (minutos === null || minutos === undefined) return '—';
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

/**
 * Total da semana, e quantos dias ficaram por fechar.
 *
 * Os dois numeros andam juntos de proposito: um total de 24h numa semana pode
 * ser uma semana curta ou tres dias em que alguem se esqueceu de picar a saida,
 * e a folha tem de dizer qual dos dois.
 */
export function totalDaSemana(turnos: WorkShift[]): { minutos: number; porFechar: number } {
  return turnos.reduce(
    (acc, t) => ({
      minutos: acc.minutos + (t.worked_minutes ?? 0),
      porFechar: acc.porFechar + (t.worked_minutes === null && t.started_at ? 1 : 0),
    }),
    { minutos: 0, porFechar: 0 },
  );
}

const SELECT = 'id, profile_id, full_name, work_date, started_at, break_started_at,'
  + ' break_ended_at, ended_at, note, worked_minutes, break_minutes';

/**
 * Os turnos da semana a que a data pertence.
 *
 * `de` vazio traz toda a gente — e o que o administrador ve. As politicas da
 * 0031 e que decidem se isso e mesmo toda a gente ou so quem pergunta.
 */
export async function listarSemana(ancora: Date, de?: string): Promise<WorkShift[]> {
  const dias = weekDays(ancora);

  let q = getSupabase()
    .from('work_shifts_view')
    .select(SELECT)
    .gte('work_date', dayKey(dias[0]))
    .lte('work_date', dayKey(dias[6]))
    .order('work_date')
    .order('full_name');

  if (de) q = q.eq('profile_id', de);

  const { data, error } = await q;
  if (error) throw new Error(friendlyError(error));
  return (data ?? []) as unknown as WorkShift[];
}

/** O turno de hoje de quem esta a usar o CRM. Null se ainda nao entrou. */
export async function turnoDeHoje(profileId: string): Promise<WorkShift | null> {
  const { data, error } = await getSupabase()
    .from('work_shifts_view')
    .select(SELECT)
    .eq('profile_id', profileId)
    .eq('work_date', dayKey(new Date()))
    .maybeSingle();

  if (error) throw new Error(friendlyError(error));
  return (data ?? null) as unknown as WorkShift | null;
}

/**
 * Marca o ponto.
 *
 * A hora e a do servidor e nao a do browser: `now()` no default da coluna nao
 * serve para um update, portanto vai daqui — mas quem valida a ordem das marcas
 * e o check da 0031, que nao aceita uma saida antes da entrada venha ela de
 * onde vier.
 *
 * O dia e o dia local de quem pica, que e o mesmo que o `hoje_em_lisboa()` da
 * base de dados enquanto a oficina e as pessoas estiverem em Portugal. Se um
 * dia deixarem de estar, e aqui que se nota primeiro.
 */
export async function picar(picagem: Picagem, profileId: string, turnoId?: string): Promise<void> {
  const agora = new Date().toISOString();
  const db = getSupabase();

  if (picagem === 'entrada' && !turnoId) {
    const { error } = await db.from('work_shifts').insert({
      profile_id: profileId,
      work_date: dayKey(new Date()),
      started_at: agora,
    });
    if (error) throw new Error(friendlyError(error));
    return;
  }

  if (!turnoId) throw new Error('Não há registo de hoje para marcar.');

  const { error } = await db
    .from('work_shifts')
    .update({ [COLUNA[picagem]]: agora })
    .eq('id', turnoId);

  if (error) throw new Error(friendlyError(error));
}

/**
 * Correcao pelo administrador ou pelo gestor.
 *
 * As horas chegam como "HH:mm" e saem em ISO no dia do turno. Vazio apaga a
 * marca — e assim que se desfaz uma saida picada por engano.
 */
export async function corrigir(
  turno: Pick<WorkShift, 'id' | 'work_date'>,
  marcas: Partial<Record<Picagem, string>>,
  note: string | null,
): Promise<void> {
  const patch: Record<string, string | null> = { note };

  for (const [picagem, valor] of Object.entries(marcas) as [Picagem, string][]) {
    patch[COLUNA[picagem]] = valor ? new Date(`${turno.work_date}T${valor}:00`).toISOString() : null;
  }

  const { error } = await getSupabase().from('work_shifts').update(patch).eq('id', turno.id);
  if (error) throw new Error(friendlyError(error));
}

/** "09:30" a partir de um instante, para as caixas de correcao. */
export function horaLocal(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
