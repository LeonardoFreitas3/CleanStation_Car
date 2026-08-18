import { getSupabase } from '../lib/supabase';
import { friendlyError } from '../lib/errors';
import type { Service, ServiceStatus, ServiceWithRelations } from '../types';

/** Ordem do fluxo na oficina. Igual a do enum service_status no Postgres. */
export const SERVICE_FLOW: ServiceStatus[] = [
  'agendado', 'recebido', 'preparacao', 'lavagem',
  'detalhe_interior', 'detalhe_exterior', 'protecao',
  'controlo_qualidade', 'concluido', 'entregue',
];

export const SERVICE_STATUS_LABEL: Record<ServiceStatus, string> = {
  agendado: 'Agendado',
  recebido: 'Cliente recebido',
  preparacao: 'Em preparação',
  lavagem: 'Lavagem',
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
  detalhe_interior: 'bg-blue-950/50 text-blue-300 border-blue-800/50',
  detalhe_exterior: 'bg-blue-950/50 text-blue-300 border-blue-800/50',
  protecao: 'bg-blue-950/50 text-blue-300 border-blue-800/50',
  controlo_qualidade: 'bg-amber-950/40 text-amber-300 border-amber-700/50',
  concluido: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50',
  entregue: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50',
  cancelado: 'bg-red-950/30 text-red-300/80 border-red-900/40',
};

/** Estados que contam como trabalho a decorrer. */
export const IN_PROGRESS: ServiceStatus[] = SERVICE_FLOW.slice(1, 8);

export type ServiceFilter =
  | 'hoje' | 'amanha' | 'semana' | 'em_curso' | 'concluidos' | 'cancelados' | 'todos';

export const SERVICE_FILTERS: Array<{ value: ServiceFilter; label: string }> = [
  { value: 'hoje', label: 'Hoje' },
  { value: 'amanha', label: 'Amanhã' },
  { value: 'semana', label: 'Esta semana' },
  { value: 'em_curso', label: 'Em curso' },
  { value: 'concluidos', label: 'Concluídos' },
  { value: 'cancelados', label: 'Cancelados' },
  { value: 'todos', label: 'Todos' },
];

const SELECT_WITH_RELATIONS = `
  *,
  client:clients ( id, name, phone ),
  vehicle:vehicles ( id, plate, make, model ),
  employee:profiles ( id, full_name )
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
  page?: number;
  pageSize?: number;
}

export async function listServices({
  filter = 'hoje', employeeId = null, serviceTypeId = null, clientId = null,
  page = 0, pageSize = 25,
}: ListServicesParams = {}): Promise<{ rows: ServiceWithRelations[]; total: number }> {
  let q = getSupabase()
    .from('services')
    .select(SELECT_WITH_RELATIONS, { count: 'exact' })
    .is('deleted_at', null);

  // Filtrar no Postgres e nao no browser: o historico de um cliente nao deve
  // obrigar a trazer os servicos de todos os outros.
  if (clientId) q = q.eq('client_id', clientId);

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
  } else if (filter === 'cancelados') {
    q = q.eq('status', 'cancelado');
  }

  if (employeeId) q = q.eq('employee_id', employeeId);
  if (serviceTypeId) q = q.eq('service_type_id', serviceTypeId);

  // Agendados por hora; o resto pelo mais recente.
  const orderColumn = ['hoje', 'amanha', 'semana'].includes(filter) ? 'scheduled_at' : 'created_at';

  const { data, error, count } = await q
    .order(orderColumn, { ascending: orderColumn === 'scheduled_at' })
    .range(page * pageSize, page * pageSize + pageSize - 1);

  if (error) throw new Error(friendlyError(error));
  return { rows: (data ?? []) as unknown as ServiceWithRelations[], total: count ?? 0 };
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
  return data as Service;
}

/** Proximo estado do fluxo, ou null se ja acabou ou foi cancelado. */
export function nextStatus(current: ServiceStatus): ServiceStatus | null {
  if (current === 'cancelado' || current === 'entregue') return null;
  const i = SERVICE_FLOW.indexOf(current);
  return i >= 0 && i < SERVICE_FLOW.length - 1 ? SERVICE_FLOW[i + 1] : null;
}
