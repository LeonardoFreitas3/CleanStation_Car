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
  patch: {
    base_price?: number;
    prices?: Record<string, number>;
    active?: boolean;
    name?: string;
    sort_order?: number;
    /** Null apaga o prazo: deixa de haver lembrete de manutencao para este servico. */
    repeat_after_days?: number | null;
    /** Null tira a duracao propria: volta a propor as duas horas por omissao. */
    duration_minutes?: number | null;
  },
): Promise<void> {
  const { error } = await getSupabase().from('service_types').update(patch).eq('id', id);
  if (error) throw new Error(friendlyError(error));
}

/**
 * Slug a partir do nome: minusculas, sem acentos, com hifens.
 *
 * O slug e a chave estavel do catalogo — e o que o codigo do site usa para
 * falar de um servico. Gerado uma vez, na criacao, e nunca mais mexido: mudar
 * o nome de "Lavagem Simples" para "Lavagem Base" nao pode partir referencias.
 */
export function slugify(name: string): string {
  return name
    .normalize('NFD')
    // Os acentos ficam separados pelo NFD; isto apaga-os.
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Le o prazo de repeticao escrito a mao nas Definicoes.
 *
 * Vazio devolve null — "nunca lembrar" —, tal como um preco vazio quer dizer
 * "nao se faz nesse veiculo". Os limites sao os mesmos da migracao 0024: a base
 * de dados tambem recusa, mas recusar aqui poupa a ida e volta e da uma frase
 * em portugues em vez de um erro de constraint.
 *
 * Levanta em vez de devolver um terceiro estado: null ja tem significado e
 * empilhar-lhe um undefined por cima era garantir que um dia se confundiam.
 */
export function parseRepeatDays(raw: string): number | null {
  const s = raw.trim();
  if (!s) return null;

  const n = Number(s);
  if (!Number.isInteger(n) || n < 7 || n > 730) {
    throw new Error('O prazo tem de ser um número inteiro de dias, entre 7 e 730.');
  }
  return n;
}

/**
 * Le a duracao escrita a mao nas Definicoes.
 *
 * Mesma forma do parseRepeatDays e pelas mesmas razoes: vazio e null — "sem
 * duracao propria" —, e os limites sao os da migracao 0030. Levanta em vez de
 * devolver um terceiro estado.
 */
export function parseDuration(raw: string): number | null {
  const s = raw.trim();
  if (!s) return null;

  const n = Number(s);
  if (!Number.isInteger(n) || n < 15 || n > 1440) {
    throw new Error('A duração tem de ser um número inteiro de minutos, entre 15 e 1440.');
  }
  return n;
}

export interface NewServiceType {
  name: string;
  category: string;
  base_price: number;
  prices?: Record<string, number>;
}

export async function createServiceType(input: NewServiceType): Promise<void> {
  const slug = slugify(input.name);
  if (!slug) throw new Error('O nome não dá para transformar em identificador.');

  // Vai para o fim da categoria. Reordenar e um campo a parte, para quem quiser
  // mexer; o caso comum e acrescentar no fim e nao pensar nisso.
  const { data: last } = await getSupabase()
    .from('service_types')
    .select('sort_order')
    .eq('category', input.category)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await getSupabase().from('service_types').insert({
    slug,
    name: input.name.trim(),
    category: input.category,
    base_price: input.base_price,
    prices: input.prices ?? {},
    sort_order: (last?.sort_order ?? 0) + 10,
  });

  if (error) {
    // O slug e unico: dois servicos com o mesmo nome embatem aqui.
    if (error.code === '23505') throw new Error('Já existe um serviço com esse nome.');
    throw new Error(friendlyError(error));
  }
}
