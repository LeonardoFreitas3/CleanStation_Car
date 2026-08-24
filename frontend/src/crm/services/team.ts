import { getSupabase } from '../lib/supabase';
import { friendlyError } from '../lib/errors';
import type { UserRole } from '../types';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../lib/config';

export interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  active: boolean;
  created_at: string;
  total_services: number;
  services_month: number;
  last_service_at: string | null;
}

export const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Administrador',
  manager: 'Gestor',
  employee: 'Funcionário',
};

export const ROLE_DESCRIPTION: Record<UserRole, string> = {
  admin: 'Acesso total, incluindo equipa, preços e definições.',
  manager: 'Clientes, serviços e dashboard. Não gere a equipa.',
  employee: 'Serviços, clientes e fotografias. Sem acesso a faturação.',
};

export const ROLE_CLASS: Record<UserRole, string> = {
  admin: 'bg-amber-950/40 text-amber-300 border-amber-700/50',
  manager: 'bg-blue-950/50 text-blue-300 border-blue-800/50',
  employee: 'bg-white/5 text-white/70 border-white/15',
};

export async function listTeam(): Promise<TeamMember[]> {
  const { data, error } = await getSupabase()
    .from('team_overview')
    .select('*')
    .order('active', { ascending: false })
    .order('full_name');

  if (error) throw new Error(friendlyError(error));
  return (data ?? []) as TeamMember[];
}

/**
 * Altera a funcao. Passa pelo trigger protect_profile_privileges, que so
 * deixa se quem pede for admin — portanto isto e seguro mesmo que alguem
 * chame a API diretamente.
 */
export async function updateRole(id: string, role: UserRole): Promise<void> {
  const { error } = await getSupabase().from('profiles').update({ role }).eq('id', id);
  if (error) throw new Error(friendlyError(error));
}

/**
 * Ativa ou desativa. Desativar e a forma correta de tirar acesso a quem sai:
 * a conta continua a existir no Auth mas nao passa o is_staff(), portanto o
 * RLS deixa de lhe devolver seja o que for.
 */
export async function setActive(id: string, active: boolean): Promise<void> {
  const { error } = await getSupabase().from('profiles').update({ active }).eq('id', id);
  if (error) throw new Error(friendlyError(error));
}

/**
 * Chama a Edge Function da equipa.
 *
 * Mexer em contas exige a service_role, que nunca pode estar no frontend: o que
 * vai daqui e a sessao de quem esta a pedir, e e a funcao que confirma, contra
 * a base de dados, que se trata de um administrador ativo.
 */
async function callTeamFunction(
  path: string,
  body: Record<string, unknown>,
  fallbackError: string,
): Promise<void> {
  const { data: { session } } = await getSupabase().auth.getSession();
  if (!session) throw new Error('A sua sessão expirou. Volte a entrar.');

  const res = await fetch(`${SUPABASE_URL}/functions/v1/team/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // A sessao do admin, nao a anon key: e ela que a funcao verifica.
      Authorization: `Bearer ${session.access_token}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? fallbackError);
}

/**
 * Cria a conta de um funcionario, com a palavra-passe escolhida pelo admin.
 *
 * A palavra-passe segue no corpo do pedido, por HTTPS, e o Auth guarda-a
 * cifrada — nao fica em lado nenhum deste lado.
 *
 * Chega como Funcionario inativo. Ativar continua a ser um passo deliberado,
 * feito aqui na Equipa.
 */
export function createMember(fullName: string, email: string, password: string): Promise<void> {
  return callTeamFunction('create', { fullName, email, password }, 'Não foi possível criar a conta.');
}

/**
 * Define uma palavra-passe nova para alguem da equipa.
 *
 * Nao termina as sessoes que essa pessoa ja tenha abertas — o Supabase nao as
 * corta ao mudar a palavra-passe. Para tirar o acesso a alguem, o que serve e
 * desativar a conta.
 */
export function setPassword(id: string, password: string): Promise<void> {
  return callTeamFunction('password', { id, password }, 'Não foi possível alterar a palavra-passe.');
}

export interface Assignable {
  id: string;
  full_name: string;
}

/**
 * Quem pode ficar com um servico atribuido: a equipa ativa.
 *
 * Le a profiles em vez da team_overview porque so precisa de dois campos —
 * a vista traz as contagens de trabalho, que aqui nao servem para nada.
 */
export async function listAssignable(): Promise<Assignable[]> {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('id, full_name')
    .eq('active', true)
    .order('full_name');

  if (error) throw new Error(friendlyError(error));
  return (data ?? []) as Assignable[];
}
