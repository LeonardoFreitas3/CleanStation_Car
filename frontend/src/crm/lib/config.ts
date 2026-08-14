// Configuracao do CRM lida do ambiente de build.
//
// O CRA embute qualquer REACT_APP_* no bundle em build time. Isso e esperado
// para a anon key, que e publica por desenho — a protecao real esta nas
// politicas RLS do Postgres, nao no segredo da chave.
//
// A service_role key NUNCA entra aqui. Se alguma vez precisares dela (criar
// utilizadores, por exemplo), tem de viver numa Edge Function do Supabase,
// nos secrets do servidor.

export const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY ?? '';

/**
 * Sem credenciais o CRM nao arranca. Em vez de rebentar com um erro tecnico,
 * as rotas mostram um ecra a dizer exatamente o que falta configurar.
 */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** Prefixo de todas as rotas do CRM. O site publico vive fora disto. */
export const CRM_BASE = '/crm';

/**
 * Limiares de cliente VIP. Ficam aqui ate existir a pagina de definicoes que
 * os torna editaveis pelo admin (fase 3); ate la sao o valor por omissao.
 */
export const VIP_THRESHOLDS = {
  totalSpent: 500,
  serviceCount: 6,
} as const;

/** Janelas de follow-up em dias, conforme a especificacao. */
export const FOLLOW_UP_WINDOWS = {
  maintenance: 30,
  followUp: 60,
  atRisk: 90,
  reactivation: 120,
} as const;
