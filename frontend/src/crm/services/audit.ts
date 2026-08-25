import { getSupabase } from '../lib/supabase';
import { friendlyError } from '../lib/errors';

export interface AuditLog {
  id: number;
  actor_id: string | null;
  actor_email: string | null;
  action: 'insert' | 'update' | 'delete';
  table_name: string;
  record_id: string | null;
  changes: Record<string, unknown> | null;
  created_at: string;
}

export const AUDIT_TABLES = ['clients', 'vehicles', 'services', 'profiles', 'service_photos'] as const;

export const TABLE_LABEL: Record<string, string> = {
  clients: 'Cliente',
  vehicles: 'Viatura',
  services: 'Serviço',
  profiles: 'Conta',
  service_photos: 'Fotografia',
};

export const ACTION_LABEL: Record<AuditLog['action'], string> = {
  insert: 'Criou',
  update: 'Alterou',
  delete: 'Apagou',
};

export const ACTION_CLASS: Record<AuditLog['action'], string> = {
  insert: 'border-emerald-800/50 bg-emerald-950/30 text-emerald-300/80',
  update: 'border-blue-800/50 bg-blue-950/30 text-blue-300/80',
  delete: 'border-red-800/50 bg-red-950/30 text-red-300/80',
};

/**
 * Onde vive o registo alterado, quando ha para onde ir.
 *
 * As fotografias nao tem pagina propria e os perfis vivem todos na Equipa, por
 * isso ficam sem link — melhor do que um que nao leva a lado nenhum.
 */
export function recordPath(log: AuditLog): string | null {
  if (!log.record_id) return null;
  if (log.table_name === 'clients') return `/crm/clientes/${log.record_id}`;
  if (log.table_name === 'vehicles') return `/crm/viaturas/${log.record_id}`;
  if (log.table_name === 'services') return `/crm/servicos/${log.record_id}`;
  return null;
}

/**
 * Campos que mudam sozinhos e nao dizem nada a ninguem.
 *
 * O updated_at muda em cada alteracao, por definicao: mostra-lo era encher a
 * lista com a unica coluna que nunca e a resposta a pergunta "o que mudou?".
 */
const RUIDO = new Set(['updated_at', 'created_at', 'id', 'plate_norm']);

export const FIELD_LABEL: Record<string, string> = {
  name: 'nome',
  phone: 'telefone',
  email: 'email',
  role: 'função',
  active: 'ativo',
  status: 'estado',
  total: 'total',
  price: 'preço',
  discount: 'desconto',
  employee_id: 'funcionário',
  scheduled_at: 'agendamento',
  completed_at: 'conclusão',
  deleted_at: 'apagado em',
  marketing_consent: 'consentimento de marketing',
  data_consent: 'consentimento de dados',
  plate: 'matrícula',
  notes: 'notas',
  service_name: 'serviço',
  duration_minutes: 'duração',
  share_token: 'link da galeria',
  reminded_at: 'lembrete',
};

/** Resumo legivel do que mudou, sem despejar o JSON em cima de quem le. */
export function describeChanges(log: AuditLog): string[] {
  if (!log.changes) return [];

  return Object.entries(log.changes)
    .filter(([k]) => !RUIDO.has(k))
    .map(([k, v]) => {
      const campo = FIELD_LABEL[k] ?? k;
      if (v === null || v === '') return `${campo}: vazio`;
      if (typeof v === 'boolean') return `${campo}: ${v ? 'sim' : 'não'}`;
      if (typeof v === 'object') return campo;
      const texto = String(v);
      return `${campo}: ${texto.length > 40 ? `${texto.slice(0, 40)}…` : texto}`;
    });
}

export async function listAuditLogs({ table = '', page = 0, pageSize = 50 }: {
  table?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<{ rows: AuditLog[]; total: number }> {
  let q = getSupabase()
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (table) q = q.eq('table_name', table);

  const { data, error, count } = await q.range(page * pageSize, page * pageSize + pageSize - 1);
  if (error) throw new Error(friendlyError(error));

  return { rows: (data ?? []) as AuditLog[], total: count ?? 0 };
}
