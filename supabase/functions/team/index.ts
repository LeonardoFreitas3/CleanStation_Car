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
async function requireAdmin(req: Request): Promise<{ id: string } | Response> {
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
  if (!profile || profile.role !== 'admin' || !profile.active) {
    return json({ error: 'Apenas administradores podem gerir contas' }, 403);
  }

  return { id: user.user.id };
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

async function handlePassword(body: Record<string, unknown>) {
  const id = String(body.id ?? '').trim();
  const password = String(body.password ?? '');

  // O id vem do frontend, mas é sempre de alguém que está na lista da equipa —
  // e mesmo que não fosse, o pior que se faz é mudar a palavra-passe de uma
  // conta deste projeto, coisa que quem chega aqui já é admin para fazer.
  if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: 'Conta inválida' }, 400);
  if (password.length < MIN_PASSWORD) {
    return json({ error: `A palavra-passe tem de ter pelo menos ${MIN_PASSWORD} caracteres` }, 400);
  }

  const { error } = await admin().auth.admin.updateUserById(id, { password });
  if (error) return json({ error: 'Não foi possível alterar a palavra-passe.' }, 500);

  // As sessões abertas dessa pessoa continuam válidas: o Supabase não as
  // termina ao mudar a palavra-passe. Quem for afastado tem de ser desativado
  // na Equipa — é isso que lhe corta o acesso, não a palavra-passe nova.
  return json({ ok: true });
}

// ── Router ───────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Método não suportado' }, 405);

  const action = new URL(req.url).pathname.split('/').filter(Boolean).pop();

  try {
    const caller = await requireAdmin(req);
    if (caller instanceof Response) return caller;

    const body = await req.json().catch(() => ({}));

    if (action === 'create') return await handleCreate(body);
    if (action === 'password') return await handlePassword(body);
    return json({ error: 'Endpoint desconhecido' }, 404);
  } catch (e) {
    // O detalhe vai para os logs e não para a resposta: as mensagens do Auth
    // revelam configuração do projeto.
    console.error(action, e);
    return json({ error: 'Não foi possível processar o pedido. Tente novamente.' }, 500);
  }
});
