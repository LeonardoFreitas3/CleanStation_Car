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
  packs: 'Packs de manutenção',
  extras: 'Extras',
};

/** Tipos de veiculo com preco proprio. Igual aos ids do site (pricing.js). */
export const VEHICLE_PRICE_KEYS = [
  { key: 'carro', label: 'Carro' },
  { key: 'grande', label: 'Carrinha grande' },
  { key: 'suv', label: 'SUV' },
  { key: 'mota', label: 'Mota' },
] as const;

/** Como listServiceTypes, mas traz tambem os desativados: a pagina de definicoes precisa de os poder reativar. */
export async function listAllServiceTypes(): Promise<ServiceType[]> {
  const { data, error } = await getSupabase()
    .from('service_types')
    .select('*')
    .order('category')
    .order('sort_order');

  if (error) throw new Error(friendlyError(error));
  return (data ?? []) as ServiceType[];
}

/**
 * So mexe no catalogo. Os servicos ja registados guardam o preco copiado na
 * propria linha, de proposito: mudar a tabela nao pode mudar o historico.
 */
export async function updateServiceType(
  id: string,
  patch: { base_price?: number; prices?: Record<string, number>; active?: boolean },
): Promise<void> {
  const { error } = await getSupabase().from('service_types').update(patch).eq('id', id);
  if (error) throw new Error(friendlyError(error));
}
