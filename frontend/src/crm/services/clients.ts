import { getSupabase } from '../lib/supabase';
import { friendlyError } from '../lib/errors';
import { FOLLOW_UP_WINDOWS, VIP_THRESHOLDS } from '../lib/config';
import type { Client, ClientOverview, ClientStatus } from '../types';

export type ClientSort = 'recent' | 'name' | 'spent' | 'visits';

export interface ListClientsParams {
  query?: string;
  page?: number;
  pageSize?: number;
  sort?: ClientSort;
}

export interface ListClientsResult {
  rows: ClientOverview[];
  total: number;
}

/**
 * Limiares em uso. Vem das definicoes (tabela app_settings) uma vez por sessao;
 * ate la valem os do config.ts.
 *
 * Guardados no modulo em vez de passados a clientStatus() porque a etiqueta e
 * calculada em varios sitios e nenhum deles tem — nem devia ter — de saber de
 * onde vem o limiar.
 */
let vip: { totalSpent: number; serviceCount: number } = {
  totalSpent: VIP_THRESHOLDS.totalSpent,
  serviceCount: VIP_THRESHOLDS.serviceCount,
};

export function setVipThresholds(totalSpent: number, serviceCount: number): void {
  vip = { totalSpent, serviceCount };
}

/**
 * Deriva o estado a partir dos numeros da vista.
 *
 * Fica em TypeScript e nao em SQL de proposito: os limiares sao editaveis pelo
 * admin, e ter a regra em dois sitios garantia que divergiam. A vista devolve
 * factos, isto decide a etiqueta.
 */
export function clientStatus(c: Pick<ClientOverview, 'visit_count' | 'total_spent' | 'days_since_last_visit'>): ClientStatus {
  if (c.total_spent >= vip.totalSpent || c.visit_count >= vip.serviceCount) {
    return 'vip';
  }
  if (c.visit_count === 0) return 'novo';
  if (c.days_since_last_visit !== null && c.days_since_last_visit >= FOLLOW_UP_WINDOWS.reactivation) {
    return 'inativo';
  }
  if (c.visit_count >= 2) return 'recorrente';
  return 'ativo';
}

export const CLIENT_STATUS_LABEL: Record<ClientStatus, string> = {
  novo: 'Novo',
  ativo: 'Ativo',
  recorrente: 'Recorrente',
  vip: 'VIP',
  inativo: 'Inativo',
};

export const CLIENT_STATUS_CLASS: Record<ClientStatus, string> = {
  novo: 'bg-blue-950/50 text-blue-300 border-blue-800/50',
  ativo: 'bg-white/5 text-white/70 border-white/15',
  recorrente: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50',
  vip: 'bg-amber-950/40 text-amber-300 border-amber-700/50',
  inativo: 'bg-red-950/30 text-red-300/80 border-red-900/40',
};

export async function listClients({
  query = '', page = 0, pageSize = 25, sort = 'recent',
}: ListClientsParams = {}): Promise<ListClientsResult> {
  const supabase = getSupabase();

  // Duas chamadas em paralelo: as linhas da pagina e o total para a paginacao.
  // Trazer tudo para contar no browser era exatamente o que se quer evitar.
  const [rowsRes, countRes] = await Promise.all([
    supabase.rpc('search_clients', { q: query, lim: pageSize, off: page * pageSize, sort }),
    supabase.rpc('count_clients', { q: query }),
  ]);

  if (rowsRes.error) throw new Error(friendlyError(rowsRes.error));
  if (countRes.error) throw new Error(friendlyError(countRes.error));

  return {
    rows: (rowsRes.data ?? []) as ClientOverview[],
    total: Number(countRes.data ?? 0),
  };
}

export async function getClient(id: string): Promise<ClientOverview | null> {
  const { data, error } = await getSupabase()
    .from('client_overview')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(friendlyError(error));
  return (data as ClientOverview) ?? null;
}

export type ClientInput = Pick<Client, 'name'> &
  Partial<Pick<Client, 'phone' | 'email' | 'client_type' | 'notes' | 'data_consent' | 'marketing_consent'>>;

export async function createClient(input: ClientInput): Promise<Client> {
  const supabase = getSupabase();
  const { data: auth } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('clients')
    .insert({ ...input, created_by: auth.user?.id ?? null })
    .select()
    .single();

  if (error) throw new Error(friendlyError(error));
  return data as Client;
}

export async function updateClient(id: string, input: Partial<ClientInput>): Promise<Client> {
  const { data, error } = await getSupabase()
    .from('clients')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(friendlyError(error));
  return data as Client;
}

/**
 * Soft delete. Nunca apagamos de vez pelo CRM: o historico de servicos aponta
 * para o cliente e a eliminacao fisica levaria a faturacao atras. O apagar a
 * serio, para pedidos de RGPD, e do admin e faz-se com o direito de apagamento
 * (fase 3).
 */
export async function softDeleteClient(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from('clients')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(friendlyError(error));
}
