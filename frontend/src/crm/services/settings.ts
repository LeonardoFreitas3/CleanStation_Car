import { getSupabase } from '../lib/supabase';
import { friendlyError } from '../lib/errors';
import { VIP_THRESHOLDS } from '../lib/config';

export interface AppSettings {
  vip_total_spent: number;
  vip_service_count: number;
  opens_hour: number;
  closes_hour: number;
  /**
   * Endereco de escrever uma avaliacao, do perfil da empresa no Google. Null
   * enquanto ninguem o preencher — e nesse caso o pedido de avaliacao nao sai.
   */
  review_url: string | null;
}

/** Valores enquanto as definicoes nao chegam do servidor. Iguais aos da 0014. */
export const SETTINGS_FALLBACK: AppSettings = {
  vip_total_spent: VIP_THRESHOLDS.totalSpent,
  vip_service_count: VIP_THRESHOLDS.serviceCount,
  opens_hour: 9,
  closes_hour: 20,
  review_url: null,
};

export async function getSettings(): Promise<AppSettings> {
  const { data, error } = await getSupabase()
    .from('app_settings')
    .select('vip_total_spent, vip_service_count, opens_hour, closes_hour, review_url')
    .eq('id', 1)
    .maybeSingle();

  if (error) throw new Error(friendlyError(error));
  // Sem linha (migracao por correr) vale o valor por omissao: a etiqueta de VIP
  // ficar errada e melhor do que o CRM nao abrir.
  return data ? { ...SETTINGS_FALLBACK, ...data } : SETTINGS_FALLBACK;
}

export async function updateSettings(patch: AppSettings): Promise<void> {
  const db = getSupabase();
  const { data: user } = await db.auth.getUser();
  const { error } = await db
    .from('app_settings')
    .update({ ...patch, updated_by: user.user?.id })
    .eq('id', 1);

  if (error) throw new Error(friendlyError(error));
}
