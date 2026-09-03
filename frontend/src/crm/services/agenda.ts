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

/**
 * A grelha do mes: semanas inteiras de segunda a domingo, incluindo os dias
 * dos meses vizinhos que fecham a primeira e a ultima linha.
 *
 * Sao 35 ou 42 dias conforme o mes, e nao 42 sempre: um mes que cabe em cinco
 * linhas nao ganha nada com uma sexta linha vazia no fundo do ecra.
 */
export function monthDays(anchor: Date): Date[] {
  const primeiro = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const ultimo = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);

  const cursor = weekStart(primeiro);
  const out: Date[] = [];
  // O fim da semana a que o ultimo dia do mes pertence.
  const fim = weekStart(ultimo).getTime() + 6 * 86_400_000;
  while (cursor.getTime() <= fim) {
    out.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
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

/**
 * Horario da oficina.
 *
 * Mutavel, como os limiares de VIP: vem das definicoes e e aplicado no arranque
 * do CRM. Os valores aqui sao o que vale enquanto nao chegam — ou se a leitura
 * falhar, caso em que uma agenda com o horario habitual e melhor do que uma
 * agenda que nao abre.
 *
 * A Edge Function das marcacoes le a mesma linha da app_settings. Sao dois
 * leitores da mesma verdade, e nao duas verdades.
 */
export let OPENS = 9;
export let CLOSES = 20;

export function setHorario(opens: number, closes: number): void {
  // Fechar antes de abrir dava uma capacidade negativa e uma ocupacao em
  // numeros impossiveis. A base de dados ja o recusa; isto cobre o caminho
  // entre a leitura e o ecra.
  if (!(closes > opens)) return;
  OPENS = opens;
  CLOSES = closes;
}

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

/** Evento que existe so no Google: sem ficha no CRM e sem folga que lhe toque. */
export interface CalendarBlock {
  id: string;
  summary: string;
  startIso: string;
  endIso: string;
}

/**
 * Porque e que a lista de bloqueios veio vazia.
 *
 * As duas falhas pedem coisas diferentes a quem esta a olhar: uma passa
 * sozinha, a outra so passa com um deploy. Ate aqui as duas davam a mesma
 * agenda, com o mesmo aspeto de estar tudo bem.
 */
export type BlocksState = 'ok' | 'por-publicar' | 'indisponivel';

/**
 * Le o estado a partir do codigo da resposta.
 *
 * 404 e a funcao publicada nao conhecer o endpoint — foi publicada antes de ele
 * existir. Nao ha nada a esperar: fica assim ate alguem a publicar de novo.
 *
 * O resto — rede em baixo, 5xx do Supabase, sessao expirada, Google a recusar —
 * e passageiro. Tentar outra vez daqui a pouco resolve.
 *
 * `null` e a chamada nem ter chegado a ter resposta.
 */
export function estadoDosBlocos(status: number | null): BlocksState {
  if (status === null) return 'indisponivel';
  if (status === 404) return 'por-publicar';
  return status >= 200 && status < 300 ? 'ok' : 'indisponivel';
}

export interface Week {
  days: Date[];
  services: ServiceWithRelations[];
  timeOff: TimeOff[];
  /** Vazio se o Google nao respondeu — a semana mostra-se na mesma. */
  blocks: CalendarBlock[];
  /** Porque e que veio vazia, para a Agenda o poder dizer. */
  blocksState: BlocksState;
}

/**
 * Bloqueios que so existem no calendario.
 *
 * Nao lanca: o Google e informacao a mais na Agenda, nao a Agenda. Se estiver
 * em baixo, a semana mostra-se com os servicos e as folgas, como sempre
 * mostrou, em vez de dar erro por causa de um extra.
 */
async function loadCalendarBlocks(
  from: string,
  to: string,
): Promise<{ blocks: CalendarBlock[]; state: BlocksState }> {
  const vazio = (state: BlocksState) => ({ blocks: [], state });

  try {
    const { data: { session } } = await getSupabase().auth.getSession();
    if (!session) return vazio('indisponivel');

    const res = await fetch(`${SUPABASE_URL}/functions/v1/booking/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ from, to }),
    });

    const state = estadoDosBlocos(res.status);
    if (state !== 'ok') return vazio(state);

    return { blocks: ((await res.json())?.events ?? []) as CalendarBlock[], state };
  } catch {
    // Nem chegou a haver resposta: rede, DNS, o browser a cortar.
    return vazio('indisponivel');
  }
}

// ── Feriados ─────────────────────────────────────────────────────────────────
//
// ponytail: esta conta existe duas vezes, aqui e em supabase/functions/booking/
// slots.ts, porque uma funcao Deno nao importa do frontend. Os testes dos dois
// lados fixam as mesmas datas — se um dos lados derivar, o teto e um teste
// vermelho e nao um erro silencioso.

/** Domingo de Pascoa, algoritmo gregoriano anonimo. Daqui saem tres feriados. */
function pascoa(ano: number): Date {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(ano, mes - 1, dia));
}

const diaIso = (d: Date) => d.toISOString().slice(0, 10);

/** Feriados de um ano, em YYYY-MM-DD. Os fixos, os moveis e o de Braga. */
export function feriados(ano: number): Set<string> {
  const p = pascoa(ano);
  const desloca = (dias: number) => diaIso(new Date(p.getTime() + dias * 86_400_000));

  return new Set([
    `${ano}-01-01`, `${ano}-04-25`, `${ano}-05-01`, `${ano}-06-10`,
    `${ano}-08-15`, `${ano}-10-05`, `${ano}-11-01`, `${ano}-12-01`,
    `${ano}-12-08`, `${ano}-12-25`,
    desloca(-2), desloca(0), desloca(60),
    // Sao Joao, feriado municipal de Braga.
    `${ano}-06-24`,
  ]);
}

/**
 * Encerrado ao publico: domingo ou feriado.
 *
 * A agenda continua a deixar marcar nestes dias, como ja deixava ao domingo —
 * ha trabalho combinado a parte. O que muda e o site nao os oferecer e a
 * ocupacao nao os contar como dia por vender.
 */
export function isEncerrado(day: Date): boolean {
  return day.getDay() === 0 || feriados(day.getFullYear()).has(dayKey(day));
}

/** Servico agendado sem duracao indicada. Duas horas e a lavagem comum — o
 *  mesmo valor por omissao que a Edge Function das marcacoes usa. */
export const DURACAO_OMISSAO = 120;

export interface Occupancy {
  /** Minutos ocupados dentro do horario de abertura. */
  busy: number;
  /** Minutos que o dia tem para vender. Zero ao domingo. */
  capacity: number;
  /** 0 a 100, ja arredondado. */
  pct: number;
}

interface Intervalo { start: number; end: number }

/**
 * Junta o que se sobrepoe.
 *
 * Sem isto, um servico das 10 as 12 e uma folga das 11 as 13 davam quatro horas
 * ocupadas num periodo de tres, e a ocupacao passava dos 100% sem o dia estar
 * cheio. Somar minutos so funciona depois de os intervalos deixarem de se
 * cruzar.
 */
function fundir(intervalos: Intervalo[]): Intervalo[] {
  const ordenados = [...intervalos].sort((a, b) => a.start - b.start);
  const out: Intervalo[] = [];

  for (const i of ordenados) {
    const ultimo = out[out.length - 1];
    if (ultimo && i.start <= ultimo.end) ultimo.end = Math.max(ultimo.end, i.end);
    else out.push({ ...i });
  }
  return out;
}

export interface Posicao {
  /** Percentagem a contar do topo da coluna do dia. */
  top: number;
  /** Altura em percentagem da janela de abertura. */
  height: number;
}

/**
 * Onde e que um periodo cai na coluna de um dia, para o desenhar em calendario.
 *
 * Devolve null quando nao toca o horario de abertura daquele dia — um evento
 * das 3 da manha nao tem sitio numa coluna que comeca as 9, e desenha-lo com
 * altura negativa punha-o de pernas para o ar em cima do resto.
 *
 * Corta a janela do dia em vez de recusar o que a atravessa: uma lavagem
 * detalhada dura 24 horas e uma folga de tres dias atravessa a noite. As duas
 * ocupam a coluna toda desse dia, que e o que se quer ver — a mesma decisao que
 * o dayOccupancy ja tomava ao somar minutos.
 */
export function posicaoNoDia(startIso: string, endIso: string, day: Date): Posicao | null {
  const abre = new Date(day); abre.setHours(OPENS, 0, 0, 0);
  const fecha = new Date(day); fecha.setHours(CLOSES, 0, 0, 0);

  const total = fecha.getTime() - abre.getTime();
  const inicio = Math.max(new Date(startIso).getTime(), abre.getTime());
  const fim = Math.min(new Date(endIso).getTime(), fecha.getTime());

  if (fim <= inicio) return null;

  return {
    top: ((inicio - abre.getTime()) / total) * 100,
    height: ((fim - inicio) / total) * 100,
  };
}

/**
 * Quanto do dia esta tomado, contando servicos, folgas e bloqueios do Google.
 *
 * So conta o que cai dentro do horario de abertura: um servico de dia inteiro
 * dura 24 horas, mas o dia so tem onze para vender, e uma folga que atravessa a
 * noite nao ocupa a madrugada de ninguem. Cada intervalo e cortado a janela do
 * dia antes de ser somado, o que trata de caminho o servico da vespera que se
 * prolonga pela manha.
 */
export function dayOccupancy(day: Date, week: Pick<Week, 'services' | 'timeOff' | 'blocks'>): Occupancy {
  // Encerrado: nao ha capacidade nenhuma, e dividir por zero dava NaN no ecra
  // em vez de um dia fechado. Um feriado contado como dia por vender fazia a
  // semana do Natal parecer vazia quando estava fechada.
  if (isEncerrado(day)) return { busy: 0, capacity: 0, pct: 0 };

  const abre = new Date(day); abre.setHours(OPENS, 0, 0, 0);
  const fecha = new Date(day); fecha.setHours(CLOSES, 0, 0, 0);
  const capacity = (fecha.getTime() - abre.getTime()) / 60_000;

  const intervalos: Intervalo[] = [];

  for (const s of week.services) {
    if (!s.scheduled_at || s.status === 'cancelado') continue;
    const start = new Date(s.scheduled_at).getTime();
    intervalos.push({ start, end: start + (s.duration_minutes ?? DURACAO_OMISSAO) * 60_000 });
  }
  for (const o of week.timeOff) {
    intervalos.push({ start: new Date(o.starts_at).getTime(), end: new Date(o.ends_at).getTime() });
  }
  for (const b of week.blocks) {
    intervalos.push({ start: new Date(b.startIso).getTime(), end: new Date(b.endIso).getTime() });
  }

  const inicio = abre.getTime();
  const fim = fecha.getTime();

  const busy = fundir(intervalos).reduce((total, i) => {
    const corte = Math.min(i.end, fim) - Math.max(i.start, inicio);
    return total + Math.max(0, corte) / 60_000;
  }, 0);

  return {
    busy: Math.round(busy),
    capacity,
    // Acima de 100% e marcacao a dobrar, nao um dia com mais horas: mostra-se
    // cheio e a sobreposicao ve-se na lista do dia.
    pct: Math.min(100, Math.round((busy / capacity) * 100)),
  };
}

/**
 * Carrega o que se ve num intervalo de dias — uma semana ou um mes.
 *
 * Recebe os dias ja feitos em vez de uma ancora e uma vista: a conta de que
 * dias sao vive no weekDays/monthDays, e a leitura nao tem de saber a diferenca.
 */
export async function loadRange(days: Date[]): Promise<Week> {
  const from = days[0].toISOString();
  const to = new Date(days[days.length - 1].getTime() + 24 * 3600_000).toISOString();

  const db = getSupabase();
  const [services, off, blocks] = await Promise.all([
    db.from('services')
      .select(SELECT_WITH_RELATIONS)
      .is('deleted_at', null)
      .gte('scheduled_at', from)
      .lt('scheduled_at', to)
      .order('scheduled_at'),
    // Sobreposicao com o intervalo, nao "comeca dentro dele": uma folga que
    // arranca no domingo anterior tem de aparecer na segunda.
    db.from('time_off')
      .select('*')
      .lt('starts_at', to)
      .gt('ends_at', from)
      .order('starts_at'),
    loadCalendarBlocks(from, to),
  ]);

  if (services.error) throw new Error(friendlyError(services.error));
  if (off.error) throw new Error(friendlyError(off.error));

  return {
    days,
    services: (services.data ?? []) as unknown as ServiceWithRelations[],
    timeOff: (off.data ?? []) as TimeOff[],
    blocks: blocks.blocks,
    blocksState: blocks.state,
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
