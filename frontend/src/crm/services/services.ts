import { getSupabase } from '../lib/supabase';
import { friendlyError } from '../lib/errors';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/config';
import type { Service, ServiceExtra, ServiceStatus, ServiceWithRelations } from '../types';

/** Ordem do fluxo na oficina. Igual a do enum service_status no Postgres. */
export const SERVICE_FLOW: ServiceStatus[] = [
  'agendado', 'recebido', 'preparacao', 'lavagem', 'meio_lavagem',
  'detalhe_interior', 'detalhe_exterior', 'protecao',
  'controlo_qualidade', 'concluido', 'entregue',
];

export const SERVICE_STATUS_LABEL: Record<ServiceStatus, string> = {
  agendado: 'Agendado',
  recebido: 'Cliente recebido',
  preparacao: 'Em preparação',
  lavagem: 'Lavagem',
  meio_lavagem: 'A meio da lavagem',
  detalhe_interior: 'Detalhe interior',
  detalhe_exterior: 'Detalhe exterior',
  protecao: 'Proteção',
  controlo_qualidade: 'Controlo de qualidade',
  concluido: 'Concluído',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};

export const SERVICE_STATUS_CLASS: Record<ServiceStatus, string> = {
  agendado: 'bg-white/5 text-white/70 border-white/15',
  recebido: 'bg-blue-950/50 text-blue-300 border-blue-800/50',
  preparacao: 'bg-blue-950/50 text-blue-300 border-blue-800/50',
  lavagem: 'bg-blue-950/50 text-blue-300 border-blue-800/50',
  meio_lavagem: 'bg-blue-950/50 text-blue-300 border-blue-800/50',
  detalhe_interior: 'bg-blue-950/50 text-blue-300 border-blue-800/50',
  detalhe_exterior: 'bg-blue-950/50 text-blue-300 border-blue-800/50',
  protecao: 'bg-blue-950/50 text-blue-300 border-blue-800/50',
  controlo_qualidade: 'bg-amber-950/40 text-amber-300 border-amber-700/50',
  concluido: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50',
  entregue: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50',
  cancelado: 'bg-red-950/30 text-red-300/80 border-red-900/40',
};

/**
 * Estados que contam como trabalho a decorrer.
 *
 * Derivado pelos nomes e nao por indices. Estava `slice(1, 8)`, e acrescentar
 * uma fase ao meio do fluxo — como a `meio_lavagem` — empurrava a janela e
 * deixava a protecao e o controlo de qualidade de fora do filtro "Em curso",
 * sem erro nenhum: os servicos nessas fases desapareciam da lista e ninguem
 * tinha como saber porque.
 */
export const IN_PROGRESS: ServiceStatus[] = SERVICE_FLOW.slice(
  SERVICE_FLOW.indexOf('recebido'),
  SERVICE_FLOW.indexOf('concluido'),
);

export type ServiceFilter =
  | 'hoje' | 'amanha' | 'semana' | 'em_curso' | 'concluidos' | 'por_cobrar' | 'cancelados' | 'todos';

// A ordem e a dos botoes no ecra. O "Todos" a frente porque e o unico que nao
// esconde nada: e por onde se comeca quando se anda a procura de um servico e
// nao se sabe em que estado ele esta.
//
// E tambem a vista com que a pagina abre, decidida no parseFilter: com "Hoje"
// a abrir, um servico que nao fosse de hoje parecia nao existir ate alguem
// carregar noutro filtro.
export const SERVICE_FILTERS: Array<{ value: ServiceFilter; label: string }> = [
  { value: 'todos', label: 'Todos' },
  { value: 'hoje', label: 'Hoje' },
  { value: 'amanha', label: 'Amanhã' },
  { value: 'semana', label: 'Esta semana' },
  { value: 'em_curso', label: 'Em curso' },
  { value: 'concluidos', label: 'Concluídos' },
  { value: 'por_cobrar', label: 'Por cobrar' },
  { value: 'cancelados', label: 'Cancelados' },
];

/**
 * Le o filtro que vem no ?filtro= do endereco.
 *
 * Existe porque o dashboard aponta para listas concretas — carregar em "Por
 * cobrar" tem de trazer os que estao por cobrar. O que vem no endereco e
 * escrito por quem quiser: um valor que nao exista tem de cair no de sempre,
 * nao passar adiante e devolver uma lista sem filtro nenhum.
 */
export function parseFilter(raw: string | null): ServiceFilter {
  return SERVICE_FILTERS.some((f) => f.value === raw) ? (raw as ServiceFilter) : 'todos';
}

// O !employee_id nao e decorativo: services tem DUAS chaves estrangeiras para
// profiles — employee_id e created_by. Sem dizer qual, o PostgREST recusa o
// embed com PGRST201 ("more than one relationship was found"). clients e
// vehicles nao precisam de hint porque so tem uma ligacao cada.
export const SELECT_WITH_RELATIONS = `
  *,
  client:clients ( id, name, phone, email ),
  vehicle:vehicles ( id, plate, make, model ),
  employee:profiles!employee_id ( id, full_name )
`;

/** Intervalo [inicio, fim) do dia local, convertido para ISO. */
function dayRange(offsetDays: number): [string, string] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + offsetDays);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return [start.toISOString(), end.toISOString()];
}

export interface ListServicesParams {
  filter?: ServiceFilter;
  employeeId?: string | null;
  serviceTypeId?: string | null;
  clientId?: string | null;
  vehicleId?: string | null;
  page?: number;
  pageSize?: number;
}

export async function listServices({
  filter = 'hoje', employeeId = null, serviceTypeId = null, clientId = null,
  vehicleId = null, page = 0, pageSize = 25,
}: ListServicesParams = {}): Promise<{ rows: ServiceWithRelations[]; total: number }> {
  let q = getSupabase()
    .from('services')
    .select(SELECT_WITH_RELATIONS, { count: 'exact' })
    .is('deleted_at', null);

  // Filtrar no Postgres e nao no browser: o historico de um cliente nao deve
  // obrigar a trazer os servicos de todos os outros.
  if (clientId) q = q.eq('client_id', clientId);
  // O historico de um carro e a pergunta que se faz quando ele chega: um
  // cliente com tres viaturas nao responde a isso pela ficha dele.
  if (vehicleId) q = q.eq('vehicle_id', vehicleId);

  if (filter === 'hoje' || filter === 'amanha') {
    const [from, to] = dayRange(filter === 'hoje' ? 0 : 1);
    q = q.gte('scheduled_at', from).lt('scheduled_at', to);
  } else if (filter === 'semana') {
    const [from] = dayRange(0);
    const [, to] = dayRange(6);
    q = q.gte('scheduled_at', from).lt('scheduled_at', to);
  } else if (filter === 'em_curso') {
    q = q.in('status', IN_PROGRESS);
  } else if (filter === 'concluidos') {
    q = q.in('status', ['concluido', 'entregue']);
  } else if (filter === 'por_cobrar') {
    // Acabados e sem carimbo. Um servico a decorrer ainda nao e uma divida, e
    // um cancelado nunca chegou a ser.
    q = q.in('status', ['concluido', 'entregue']).is('paid_at', null);
  } else if (filter === 'cancelados') {
    q = q.eq('status', 'cancelado');
  }

  if (employeeId) q = q.eq('employee_id', employeeId);
  if (serviceTypeId) q = q.eq('service_type_id', serviceTypeId);

  // Agendados por hora; o resto pelo mais recente.
  const orderColumn = ['hoje', 'amanha', 'semana'].includes(filter) ? 'scheduled_at' : 'created_at';

  // A divida mais antiga primeiro, ao contrario dos outros filtros: numa lista
  // de cobrancas o que interessa e quem espera ha mais tempo, nao quem acabou
  // agora.
  const ascending = orderColumn === 'scheduled_at' || filter === 'por_cobrar';

  const { data, error, count } = await q
    .order(orderColumn, { ascending })
    .range(page * pageSize, page * pageSize + pageSize - 1);

  if (error) throw new Error(friendlyError(error));
  return { rows: (data ?? []) as unknown as ServiceWithRelations[], total: count ?? 0 };
}

/**
 * Poe o Google a par deste servico.
 *
 * Um servico marcado ao balcao ou ao telefone vivia so na tabela: o site ja o
 * contava como tempo ocupado, mas quem abrisse o calendario no telemovel via o
 * dia vazio.
 *
 * A Edge Function e que fala com o Google — as credenciais vivem nos secrets do
 * Supabase e nunca no browser — e e ela que decide o que o evento diz, para o
 * formato nao ficar escrito em dois sitios. Daqui vai so o id.
 *
 * Reconcilia: chamar a seguir a qualquer alteracao chega, sem quem chama ter de
 * saber o que mudou. Criar, mudar a hora, cancelar e apagar entram todos aqui.
 *
 * Nao lanca, como o espelho das folgas: o servico ja esta guardado quando isto
 * corre. Se o Google estiver em baixo, o pior caso e nao se ver a marcacao no
 * telemovel — rebentar aqui transformava isso em "nao consegui marcar".
 */
async function sincronizarNoCalendario(id: string): Promise<void> {
  try {
    const { data: { session } } = await getSupabase().auth.getSession();
    if (!session) return;

    await fetch(`${SUPABASE_URL}/functions/v1/booking/service-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ id }),
    });
  } catch {
    // Ver acima: o calendario e o espelho, nao o original.
  }
}

export interface ServiceInput {
  client_id: string;
  vehicle_id?: string | null;
  employee_id?: string | null;
  service_type_id?: string | null;
  /** Instantaneo do catalogo. Ver comentario em createService. */
  service_name: string;
  price: number;
  extras?: ServiceExtra[];
  extras_total?: number;
  discount?: number;
  scheduled_at?: string | null;
  duration_minutes?: number | null;
  notes?: string | null;
}

/**
 * Cria o servico com o nome e o preco COPIADOS do catalogo, nao referenciados.
 *
 * Se a ceramica subir de 250 para 280, os servicos ja feitos tem de continuar
 * a valer 250 no historico e na faturacao. Por isso service_name e price sao
 * gravados aqui e nunca mais lidos por join.
 */
export async function createService(input: ServiceInput): Promise<Service> {
  const supabase = getSupabase();
  const { data: auth } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('services')
    .insert({
      ...input,
      extras: input.extras ?? [],
      extras_total: input.extras_total ?? 0,
      discount: input.discount ?? 0,
      created_by: auth.user?.id ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(friendlyError(error));
  await sincronizarNoCalendario(data.id);
  return data as Service;
}

export async function getService(id: string): Promise<ServiceWithRelations | null> {
  const { data, error } = await getSupabase()
    .from('services')
    .select(SELECT_WITH_RELATIONS)
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(friendlyError(error));
  return (data as unknown as ServiceWithRelations) ?? null;
}

/**
 * Edita um servico ja criado.
 *
 * Nao mexe no status: esse muda pelo fluxo, em updateServiceStatus, para o
 * carimbo das datas ficar coerente.
 */
export async function updateService(
  id: string,
  input: Partial<Omit<ServiceInput, 'client_id'>>,
): Promise<Service> {
  const { data, error } = await getSupabase()
    .from('services')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(friendlyError(error));
  // A hora ou a duracao podem ter mudado, e o evento tem de as seguir.
  await sincronizarNoCalendario(id);
  return data as Service;
}

/** Soft delete. So admin, pela politica RLS. */
export async function softDeleteService(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from('services')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(friendlyError(error));
  await sincronizarNoCalendario(id);
}

/**
 * Avanca o estado. started_at e completed_at sao carimbados por trigger no
 * Postgres, nao aqui: assim ficam certos venha a alteracao de onde vier.
 */
export async function updateServiceStatus(id: string, status: ServiceStatus): Promise<Service> {
  const { data, error } = await getSupabase()
    .from('services')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(friendlyError(error));

  // So no cancelamento. Avancar de fase nao muda a hora nem a duracao, e uma
  // ida ao Google por cada degrau do fluxo eram oito chamadas por lavagem para
  // reescrever o mesmo evento.
  if (status === 'cancelado') await sincronizarNoCalendario(id);

  return data as Service;
}

/**
 * Carimba ou tira o carimbo do pagamento.
 *
 * Reversivel de proposito: quem carrega por engano tem de poder desfazer, e um
 * pagamento marcado ao servico errado e a maneira mais facil de a lista de
 * cobrancas deixar de valer alguma coisa.
 */
export async function setPaid(id: string, paid: boolean): Promise<void> {
  const { error } = await getSupabase()
    .from('services')
    .update({ paid_at: paid ? new Date().toISOString() : null })
    .eq('id', id);

  if (error) throw new Error(friendlyError(error));
}

/** Proximo estado do fluxo, ou null se ja acabou ou foi cancelado. */
export function nextStatus(current: ServiceStatus): ServiceStatus | null {
  if (current === 'cancelado' || current === 'entregue') return null;
  const i = SERVICE_FLOW.indexOf(current);
  return i >= 0 && i < SERVICE_FLOW.length - 1 ? SERVICE_FLOW[i + 1] : null;
}
