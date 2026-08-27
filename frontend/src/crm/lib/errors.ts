// Traducao de erros tecnicos para linguagem util.
//
// Regra da especificacao (33): o utilizador nunca ve "PostgrestError 42501".
// Alem de ser incompreensivel, o texto cru de um erro de base de dados revela
// nomes de tabelas e politicas — informacao que nao deve sair para o cliente.

interface SupabaseLikeError {
  message?: string;
  /** PostgREST devolve o SQLSTATE aqui; o GoTrue devolve o error_code. */
  code?: string;
  status?: number;
}

/**
 * Codigos do GoTrue (Supabase Auth).
 *
 * Preferidos as mensagens em texto: o texto muda entre versoes, o codigo nao.
 * Foi assim que "Email logins are disabled" passou despercebido e caiu na
 * mensagem generica.
 */
const AUTH_CODES: Record<string, string> = {
  invalid_credentials: 'Email ou palavra-passe incorretos.',
  email_not_confirmed: 'Confirme o seu email antes de iniciar sessão.',
  user_not_found: 'Email ou palavra-passe incorretos.',
  user_banned: 'A sua conta está bloqueada. Contacte o administrador.',
  over_request_rate_limit: 'Demasiadas tentativas. Aguarde um momento e tente novamente.',
  over_email_send_rate_limit: 'Demasiados emails enviados. Aguarde alguns minutos.',
  weak_password: 'A palavra-passe é demasiado fraca. Use pelo menos 8 caracteres.',
  same_password: 'A nova palavra-passe tem de ser diferente da atual.',
  otp_expired: 'A ligação expirou. Peça uma nova recuperação de palavra-passe.',
  // Nao e culpa de quem esta a tentar entrar: e configuracao do projeto.
  // A mensagem aponta para o sitio certo em vez de acusar as credenciais.
  email_provider_disabled: 'O início de sessão por email está desativado nas definições do Supabase.',
  signup_disabled: 'A criação de contas está desativada.',
};

/** Codigos do Postgres que aparecem atraves do PostgREST. */
const POSTGRES_MESSAGES: Record<string, string> = {
  '42501': 'Não tem autorização para executar esta ação.',
  // Coluna ou funcao que o codigo conhece e a base de dados nao: e sempre uma
  // migracao por correr, e a mensagem generica mandava procurar no sitio
  // errado. Sem dizer *qual* coluna — a regra do topo deste ficheiro continua
  // a valer, e o nome dela vai na consola em desenvolvimento.
  '42703': 'Há uma migração por aplicar na base de dados. Ver o IMPLANTACAO.md.',
  PGRST202: 'Há uma migração por aplicar na base de dados. Ver o IMPLANTACAO.md.',
  '23505': 'Já existe um registo com estes dados.',
  '23503': 'Este registo está ligado a outros e não pode ser removido.',
  '23514': 'Os dados introduzidos não são válidos.',
  '22P02': 'Os dados introduzidos não são válidos.',
  PGRST301: 'A sua sessão expirou. Inicie sessão novamente.',
};

/** Mensagens do GoTrue (Supabase Auth), que chegam em ingles. */
/** Rede de seguranca para versoes que ainda nao mandam error_code. */
const AUTH_MESSAGES: Array<[RegExp, string]> = [
  [/invalid login credentials/i, 'Email ou palavra-passe incorretos.'],
  [/email not confirmed/i, 'Confirme o seu email antes de iniciar sessão.'],
  [/user not found/i, 'Email ou palavra-passe incorretos.'],
  [/logins are disabled|provider is disabled/i, 'O início de sessão por email está desativado nas definições do Supabase.'],
  [/signups? (are|is) disabled/i, 'A criação de contas está desativada.'],
  [/invalid or expired/i, 'A ligação expirou. Peça uma nova recuperação de palavra-passe.'],
  [/rate limit|too many requests/i, 'Demasiadas tentativas. Aguarde um momento e tente novamente.'],
  [/password should be at least/i, 'A palavra-passe deve ter pelo menos 8 caracteres.'],
  [/network|fetch failed|failed to fetch/i, 'Sem ligação ao servidor. Verifique a internet.'],
];

export function friendlyError(error: unknown): string {
  if (!error) return 'Ocorreu um erro inesperado.';

  const err = error as SupabaseLikeError;

  // O detalhe tecnico nao pode ir para o ecra — revela nomes de tabelas e
  // politicas — mas tem de ir para algum lado, senao um erro em producao fica
  // impossivel de diagnosticar. Vai para a consola, so em desenvolvimento.
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.error('[CRM] erro do Supabase:', {
      code: err.code, status: err.status, message: err.message, raw: error,
    });
  }

  if (err.code && AUTH_CODES[err.code]) return AUTH_CODES[err.code];
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
