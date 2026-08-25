// Edge Function que mantém a lista do Brevo a par de quem anda sem aparecer.
//
//   POST /brevo-sync  -> sincroniza contactos e devolve o que mudou
//
// A automação em si vive no Brevo, não aqui: esta função só lhe põe as pessoas
// certas na lista certa, com os atributos em dia. O que o Brevo faz a seguir —
// esperar dois dias, mandar email, parar se o cliente responder — configura-se
// lá, sem tocar em código.
//
// A lista é o gatilho e não um atributo com "dias desde a última visita",
// porque uma automação do Brevo dispara com "contacto adicionado à lista" de
// forma fiável, e reavaliar um número todos os dias não. Entrar na lista é o
// acontecimento; sair dela quando o cliente volta é igualmente importante,
// senão levava a mensagem de saudade uma semana depois de ter cá estado.
//
// ── RGPD ────────────────────────────────────────────────────────────────────
// Só sobe quem deu consentimento de marketing. Isto não é uma opção de
// configuração: enviar o email de um cliente para um serviço de campanhas é
// tratamento de dados para marketing, e sem consentimento não há base legal.
// Quem retira o consentimento é apagado do Brevo — não basta deixar de o
// atualizar, o contacto tem de sair de lá.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.10';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

const BREVO = 'https://api.brevo.com/v3';

/** Dias sem visita a partir dos quais o cliente entra na lista de inativos. */
const DIAS_INATIVO = Number(Deno.env.get('BREVO_DIAS_INATIVO') ?? 30);

function admin() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );
}

/**
 * Quem pode mandar sincronizar: o agendador, com o segredo combinado, ou um
 * administrador autenticado que carregue no botão.
 *
 * O segredo é comparado byte a byte com o mesmo comprimento para não deixar o
 * tempo de resposta dizer quantos caracteres estavam certos.
 */
async function autorizado(req: Request): Promise<boolean> {
  const segredo = Deno.env.get('CRON_SECRET');
  const enviado = req.headers.get('x-cron-secret');
  if (segredo && enviado && enviado.length === segredo.length) {
    let igual = 0;
    for (let i = 0; i < segredo.length; i++) igual |= segredo.charCodeAt(i) ^ enviado.charCodeAt(i);
    if (igual === 0) return true;
  }

  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer /, '');
  if (!token) return false;

  const db = admin();
  const { data: user, error } = await db.auth.getUser(token);
  if (error || !user?.user) return false;

  const { data: profile } = await db.from('profiles')
    .select('role, active').eq('id', user.user.id).maybeSingle();

  return profile?.role === 'admin' && profile.active === true;
}

async function brevo(path: string, init: RequestInit): Promise<Response> {
  return await fetch(`${BREVO}${path}`, {
    ...init,
    headers: {
      'api-key': Deno.env.get('BREVO_API_KEY')!,
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
}

interface Cliente {
  id: string;
  name: string;
  email: string | null;
  marketing_consent: boolean;
  visit_count: number;
  total_spent: number;
  last_visit_at: string | null;
  days_since_last_visit: number | null;
}

/**
 * Cria ou atualiza o contacto e acerta a lista numa só chamada.
 *
 * O updateEnabled deixa o POST servir de upsert: sem ele, um contacto que já
 * existisse devolvia 400 e ficava por atualizar para sempre.
 */
async function sincronizar(c: Cliente, lista: number): Promise<'entrou' | 'saiu' | 'atualizado'> {
  const inativo = (c.days_since_last_visit ?? Number.MAX_SAFE_INTEGER) >= DIAS_INATIVO;

  await brevo('/contacts', {
    method: 'POST',
    body: JSON.stringify({
      email: c.email,
      updateEnabled: true,
      attributes: {
        NOME: c.name.split(' ')[0],
        NOME_COMPLETO: c.name,
        VISITAS: c.visit_count,
        TOTAL_GASTO: c.total_spent,
        // Só a data, sem horas: é o que o Brevo aceita em atributos de data e
        // é a granularidade que uma automação de dias precisa.
        ULTIMA_VISITA: c.last_visit_at ? c.last_visit_at.slice(0, 10) : null,
        DIAS_SEM_VISITA: c.days_since_last_visit,
      },
      ...(inativo ? { listIds: [lista] } : {}),
    }),
  });

  // Voltou a aparecer: sai da lista, senão a automação continuava a tratá-lo
  // como desaparecido. O Brevo não tem "remover" no upsert, é chamada própria.
  if (!inativo) {
    await brevo(`/contacts/lists/${lista}/contacts/remove`, {
      method: 'POST',
      body: JSON.stringify({ emails: [c.email] }),
    });
    return 'saiu';
  }

  return 'entrou';
}

/** Consentimento retirado: o contacto sai do Brevo por inteiro. */
async function apagar(email: string): Promise<void> {
  await brevo(`/contacts/${encodeURIComponent(email)}`, { method: 'DELETE' });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Método não suportado' }, 405);

  if (!Deno.env.get('BREVO_API_KEY')) return json({ error: 'BREVO_API_KEY em falta' }, 500);

  const lista = Number(Deno.env.get('BREVO_LIST_INACTIVE') ?? 0);
  if (!lista) return json({ error: 'BREVO_LIST_INACTIVE em falta' }, 500);

  if (!await autorizado(req)) return json({ error: 'Não autorizado' }, 401);

  const db = admin();
  const { data, error } = await db.from('client_overview')
    .select('id, name, email, marketing_consent, visit_count, total_spent, last_visit_at, days_since_last_visit')
    .is('deleted_at', null)
    .not('email', 'is', null);

  if (error) return json({ error: error.message }, 500);

  const clientes = (data ?? []) as Cliente[];
  const resultado = { inativos: 0, ativos: 0, removidos: 0, falhas: 0 };

  for (const c of clientes) {
    try {
      if (!c.marketing_consent) {
        await apagar(c.email!);
        resultado.removidos++;
        continue;
      }
      const r = await sincronizar(c, lista);
      if (r === 'entrou') resultado.inativos++;
      else resultado.ativos++;
    } catch {
      // Um contacto que falha não pode parar os outros: o Brevo recusa um
      // email malformado que a base de dados aceitou, e sem isto a
      // sincronização parava no primeiro.
      resultado.falhas++;
    }
  }

  return json({ ok: true, limiar: DIAS_INATIVO, ...resultado });
});
