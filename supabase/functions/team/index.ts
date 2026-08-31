// Edge Function da gestão de equipa.
//
//   POST /team/create    -> cria a conta de um funcionário
//   POST /team/password  -> altera a palavra-passe de alguém da equipa
//
// Existe porque criar contas exige a service_role, e essa nunca pode estar no
// frontend: quem a tivesse ignorava o RLS todo e lia a base de dados inteira.
// Aqui vive nos secrets do Supabase e não sai desta função.
//
// Ao contrário da função das marcações, esta NÃO é anónima. Cada pedido tem de
// trazer a sessão de um administrador ativo, verificada contra a base de dados
// e não contra o que o pedido diz ser.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.10';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

/** service_role: cria contas no Auth. Nunca sai desta função. */
function admin() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );
}

/**
 * Quem está a pedir, se for administrador ativo.
 *
 * O token é validado pelo Auth (getUser não acredita na assinatura sozinha, vai
 * ao servidor) e a função é lida da tabela. Nada disto vem do corpo do pedido:
 * um atacante manda o que quiser lá dentro, mas não forja uma sessão nem se
 * promove a admin no meio do caminho.
 */
async function requireGestor(req: Request): Promise<{ id: string; role: string } | Response> {
  const auth = req.headers.get('Authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return json({ error: 'Sessão em falta' }, 401);

  const db = admin();
  const { data: user, error } = await db.auth.getUser(token);
  if (error || !user?.user) return json({ error: 'Sessão inválida ou expirada' }, 401);

  const { data: profile } = await db
    .from('profiles')
    .select('role, active')
    .eq('id', user.user.id)
    .maybeSingle();

  // Desativado não conta, mesmo sendo admin: é assim que se tira o acesso a
  // quem sai, e mexer em contas é o que ele nunca mais pode fazer.
  if (!profile || !profile.active || (profile.role !== 'admin' && profile.role !== 'manager')) {
    return json({ error: 'Apenas administradores e gestores podem gerir contas' }, 403);
  }

  return { id: user.user.id, role: profile.role };
}

/**
 * O gestor não mexe na conta de um administrador.
 *
 * É a outra metade da linha que a 0029 traça na tabela: lá, a política impede-o
 * de tocar na *linha* do administrador; aqui, impede-o de lhe mudar a
 * palavra-passe ou o email, que não passam pela tabela `profiles` — vivem no
 * Auth e só se lá chega com a service_role, que é o que esta função tem.
 *
 * Sem isto, um gestor mudava a palavra-passe do dono e entrava-lhe na conta.
 */
async function podeMexer(caller: { role: string }, alvo: string): Promise<boolean> {
  if (caller.role === 'admin') return true;

  const { data } = await admin().from('profiles').select('role').eq('id', alvo).maybeSingle();

  // Conta que não existe: recusa. Um alvo desconhecido não é permissão.
  return Boolean(data) && data!.role !== 'admin';
}

// ── Criar conta ──────────────────────────────────────────────────────────────

/** Igual ao mínimo da página de nova palavra-passe. Não fazia sentido divergir. */
const MIN_PASSWORD = 8;

async function handleCreate(body: Record<string, unknown>) {
  const email = String(body.email ?? '').trim().toLowerCase();
  const fullName = String(body.fullName ?? '').trim();
  const password = String(body.password ?? '');

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Email inválido' }, 400);
  if (!fullName) return json({ error: 'Indique o nome da pessoa' }, 400);
  if (password.length < MIN_PASSWORD) {
    return json({ error: `A palavra-passe tem de ter pelo menos ${MIN_PASSWORD} caracteres` }, 400);
  }

  const db = admin();

  // email_confirm: a conta fica utilizável de imediato, sem depender de o email
  // chegar. É esse o ponto de ser o administrador a definir a palavra-passe.
  //
  // A palavra-passe vai daqui para o Auth, que a guarda cifrada. Não é escrita
  // em lado nenhum: não entra nos logs, não volta na resposta, não fica na
  // tabela de perfis. Quem a sabe é quem a escolheu.
  const { data, error } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (error) {
    // A mensagem do Auth é em inglês e fala de "user"; esta é a única que
    // acontece no uso normal, e vale a pena dizê-la em condições.
    const already = /already been registered|already exists/i.test(error.message);
    return json(
      { error: already ? 'Já existe uma conta com esse email.' : 'Não foi possível criar a conta.' },
      already ? 409 : 500,
    );
  }

  // O perfil é criado pelo trigger handle_new_user, como funcionário inativo.
  // Fica assim de propósito: ativar continua a ser um passo deliberado, e uma
  // conta criada por engano não dá acesso a nada entretanto.
  return json({ ok: true, id: data.user?.id ?? null });
}

// ── Alterar palavra-passe ────────────────────────────────────────────────────

async function handlePassword(caller: { role: string }, body: Record<string, unknown>) {
  const id = String(body.id ?? '').trim();
  const password = String(body.password ?? '');

  if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: 'Conta inválida' }, 400);
  if (password.length < MIN_PASSWORD) {
    return json({ error: `A palavra-passe tem de ter pelo menos ${MIN_PASSWORD} caracteres` }, 400);
  }
  if (!await podeMexer(caller, id)) {
    return json({ error: 'Não pode alterar a conta de um administrador.' }, 403);
  }

  const { error } = await admin().auth.admin.updateUserById(id, { password });
  if (error) return json({ error: 'Não foi possível alterar a palavra-passe.' }, 500);

  // As sessões abertas dessa pessoa continuam válidas: o Supabase não as
  // termina ao mudar a palavra-passe. Quem for afastado tem de ser desativado
  // na Equipa — é isso que lhe corta o acesso, não a palavra-passe nova.
  return json({ ok: true });
}

// ── Alterar email ────────────────────────────────────────────────────────────

/**
 * O email é o nome de utilizador: muda no Auth, que é quem valida a sessão, e
 * na tabela `profiles`, que é de onde a lista da Equipa o lê. Mudar só um dos
 * dois dava uma pessoa a entrar com um email e a aparecer no ecrã com outro.
 *
 * `email_confirm: true` porque quem está a mudar é quem manda na oficina, e a
 * conta tem de continuar a servir a seguir. Sem isso ficava a aguardar uma
 * confirmação que ninguém ia ler — a mesma razão que o handleCreate já dá.
 *
 * As sessões abertas continuam válidas, como na palavra-passe. Quem for
 * afastado desativa-se na Equipa; é isso que corta o acesso.
 */
async function handleEmail(caller: { role: string }, body: Record<string, unknown>) {
  const id = String(body.id ?? '').trim();
  const email = String(body.email ?? '').trim().toLowerCase();

  if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: 'Conta inválida' }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Email inválido' }, 400);
  if (!await podeMexer(caller, id)) {
    return json({ error: 'Não pode alterar a conta de um administrador.' }, 403);
  }

  const db = admin();
  const { error } = await db.auth.admin.updateUserById(id, { email, email_confirm: true });

  if (error) {
    const already = /already been registered|already exists|duplicate/i.test(error.message);
    return json(
      { error: already ? 'Já existe uma conta com esse email.' : 'Não foi possível alterar o email.' },
      already ? 409 : 500,
    );
  }

  // O perfil a seguir ao Auth, e não antes: se o Auth recusar, a tabela não
  // pode ficar a dizer um email que não serve para entrar.
  await db.from('profiles').update({ email }).eq('id', id);

  return json({ ok: true });
}

// ── Router ───────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Método não suportado' }, 405);

  const action = new URL(req.url).pathname.split('/').filter(Boolean).pop();

  try {
    const caller = await requireGestor(req);
    if (caller instanceof Response) return caller;

    const body = await req.json().catch(() => ({}));

    if (action === 'create') return await handleCreate(body);
    if (action === 'password') return await handlePassword(caller, body);
    if (action === 'email') return await handleEmail(caller, body);
    return json({ error: 'Endpoint desconhecido' }, 404);
  } catch (e) {
    // O detalhe vai para os logs e não para a resposta: as mensagens do Auth
    // revelam configuração do projeto.
    console.error(action, e);
    return json({ error: 'Não foi possível processar o pedido. Tente novamente.' }, 500);
  }
});
