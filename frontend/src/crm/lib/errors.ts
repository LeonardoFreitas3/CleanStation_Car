// Traducao de erros tecnicos para linguagem util.
//
// Regra da especificacao (33): o utilizador nunca ve "PostgrestError 42501".
// Alem de ser incompreensivel, o texto cru de um erro de base de dados revela
// nomes de tabelas e politicas — informacao que nao deve sair para o cliente.

interface SupabaseLikeError {
  message?: string;
  code?: string;
  status?: number;
}

/** Codigos do Postgres que aparecem atraves do PostgREST. */
const POSTGRES_MESSAGES: Record<string, string> = {
  '42501': 'Não tem autorização para executar esta ação.',
  '23505': 'Já existe um registo com estes dados.',
  '23503': 'Este registo está ligado a outros e não pode ser removido.',
  '23514': 'Os dados introduzidos não são válidos.',
  '22P02': 'Os dados introduzidos não são válidos.',
  PGRST301: 'A sua sessão expirou. Inicie sessão novamente.',
};

/** Mensagens do GoTrue (Supabase Auth), que chegam em ingles. */
const AUTH_MESSAGES: Array<[RegExp, string]> = [
  [/invalid login credentials/i, 'Email ou palavra-passe incorretos.'],
  [/email not confirmed/i, 'Confirme o seu email antes de iniciar sessão.'],
  [/user not found/i, 'Email ou palavra-passe incorretos.'],
  [/invalid or expired/i, 'A ligação expirou. Peça uma nova recuperação de palavra-passe.'],
  [/rate limit|too many requests/i, 'Demasiadas tentativas. Aguarde um momento e tente novamente.'],
  [/password should be at least/i, 'A palavra-passe deve ter pelo menos 8 caracteres.'],
  [/network|fetch failed|failed to fetch/i, 'Sem ligação ao servidor. Verifique a internet.'],
];

export function friendlyError(error: unknown): string {
  if (!error) return 'Ocorreu um erro inesperado.';

  const err = error as SupabaseLikeError;

  if (err.code && POSTGRES_MESSAGES[err.code]) return POSTGRES_MESSAGES[err.code];
  if (err.status === 401 || err.status === 403) {
    return 'Não tem autorização para executar esta ação.';
  }

  const message = typeof err.message === 'string' ? err.message : '';
  for (const [pattern, text] of AUTH_MESSAGES) {
    if (pattern.test(message)) return text;
  }

  return 'Ocorreu um erro. Tente novamente.';
}
