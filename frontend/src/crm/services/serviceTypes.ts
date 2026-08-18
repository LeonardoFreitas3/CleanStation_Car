import { getSupabase } from '../lib/supabase';
import { friendlyError } from '../lib/errors';
import type { ServiceType } from '../types';

/**
 * Catalogo. Os extras vivem na mesma tabela com category = 'extras' — sao
 * coisas faturaveis com nome e preco, tal como os servicos, e nao justificavam
 * tabela propria. Quem escolhe o servico principal filtra-os.
 */
export async function listServiceTypes(): Promise<{ services: ServiceType[]; extras: ServiceType[] }> {
  const { data, error } = await getSupabase()
    .from('service_types')
    .select('*')
    .eq('active', true)
    .order('sort_order');

  if (error) throw new Error(friendlyError(error));

  const all = (data ?? []) as ServiceType[];
  return {
    services: all.filter((t) => t.category !== 'extras'),
    extras: all.filter((t) => t.category === 'extras'),
  };
}

export const CATEGORY_LABEL: Record<string, string> = {
  lavagens: 'Lavagens',
  descontaminacao: 'Descontaminação e proteções',
  higienizacao: 'Higienização',
  polimentos: 'Polimentos e correções',
  extras: 'Extras',
};
