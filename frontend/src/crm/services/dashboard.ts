import { getSupabase } from '../lib/supabase';
import { friendlyError } from '../lib/errors';

export interface TopService {
  name: string;
  count: number;
  revenue: number;
}

export interface MonthRevenue {
  month: string;
  revenue: number;
  count: number;
}

export interface DashboardStats {
  clients_total: number;
  clients_new_month: number;
  clients_returning: number;
  services_month: number;
  services_prev: number;
  revenue_month: number;
  revenue_prev: number;
  ticket_month: number;
  ticket_prev: number;
  scheduled_today: number;
  in_progress: number;
  follow_ups: number;
  top_services: TopService[];
  revenue_by_month: MonthRevenue[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data, error } = await getSupabase().rpc('dashboard_stats');
  if (error) throw new Error(friendlyError(error));
  return data as DashboardStats;
}

/**
 * Variacao percentual face ao mes anterior.
 *
 * Sem mes anterior nao ha variacao — devolver 100% seria mentira, e 0% dava a
 * entender estagnacao. null significa "nao ha com que comparar".
 */
export function variation(current: number, previous: number): number | null {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}

export interface FollowUp {
  id: string;
  name: string;
  phone: string | null;
  marketing_consent: boolean;
  visit_count: number;
  total_spent: number;
  last_visit_at: string | null;
  days_since_last_visit: number;
  avg_days_between_visits: number | null;
  last_service_name: string | null;
  /** Ultima mensagem de reativacao. Null se ainda nao se contactou ninguem. */
  last_contacted_at: string | null;
  bucket: 'manutencao' | 'follow_up' | 'perdido' | 'reativacao';
}

export const BUCKET_LABEL: Record<FollowUp['bucket'], string> = {
  manutencao: 'Manutenção',
  follow_up: 'Follow-up',
  perdido: 'Em risco',
  reativacao: 'Reativação',
};

export const BUCKET_CLASS: Record<FollowUp['bucket'], string> = {
  manutencao: 'bg-blue-950/50 text-blue-300 border-blue-800/50',
  follow_up: 'bg-white/5 text-white/70 border-white/15',
  perdido: 'bg-amber-950/40 text-amber-300 border-amber-700/50',
  reativacao: 'bg-red-950/30 text-red-300/80 border-red-900/40',
};

export async function listFollowUps(minDays = 30): Promise<FollowUp[]> {
  const { data, error } = await getSupabase().rpc('follow_ups', { min_days: minDays });
  if (error) throw new Error(friendlyError(error));
  return (data ?? []) as FollowUp[];
}
