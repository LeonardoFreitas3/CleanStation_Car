import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from './config';

// Instancia unica. Varias instancias partilham a mesma chave de storage e
// pisam-se na renovacao do token, o que se manifesta como sessoes que caem
// sozinhas.
let client: SupabaseClient | null = null;

export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super('Supabase nao configurado');
    this.name = 'SupabaseNotConfiguredError';
  }
}

/**
 * Devolve o cliente Supabase.
 *
 * Lanca se faltarem credenciais em vez de devolver um cliente inutil: assim o
 * erro aparece no sitio certo. As rotas do CRM verificam isSupabaseConfigured
 * antes de renderizar seja o que for que consulte dados, portanto na pratica
 * isto so dispara se alguem chamar fora desse caminho.
 */
export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) throw new SupabaseNotConfiguredError();

  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // A sessao vem no fragmento do URL na recuperacao de password.
        detectSessionInUrl: true,
        storageKey: 'csc-crm-auth',
      },
    });
  }

  return client;
}
