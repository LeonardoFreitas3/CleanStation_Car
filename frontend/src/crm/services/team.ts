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
 * Convida alguem para o CRM.
 *
 * Passa pela Edge Function porque criar contas exige a service_role, que nunca
 * pode estar no frontend. O convite manda um link por email e e a propria
 * pessoa que escolhe a palavra-passe — nem o administrador nem nos chegamos a
 * conhece-la.
 *
 * Chega como Funcionario inativo. Ativar continua a ser um passo deliberado,
 * feito aqui na Equipa.
 */
export async function inviteMember(fullName: string, email: string): Promise<void> {
  const db = getSupabase();
  const { data: { session } } = await db.auth.getSession();
  if (!session) throw new Error('A sua sessão expirou. Volte a entrar.');

  const res = await fetch(`${SUPABASE_URL}/functions/v1/team/invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // A sessao do admin, nao a anon key: e ela que a funcao verifica.
      Authorization: `Bearer ${session.access_token}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      fullName,
      email,
      // O dominio muda entre producao e desenvolvimento; o Supabase so aceita
      // destinos que ja tenha na lista de permitidos.
      redirectTo: `${window.location.origin}/crm/nova-palavra-passe`,
    }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? 'Não foi possível enviar o convite.');
}
