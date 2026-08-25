// Edge Function da galeria do cliente.
//
//   POST /galeria  { token }  -> fotografias de um servico, para quem tem o link
//
// As fotografias vivem num balde privado. Quem abre o link nao tem sessao
// nenhuma no CRM — nem deve ter — portanto e esta funcao que assina os URLs,
// com a service_role que nunca sai daqui.
//
// ── O que sai, e o que nao sai ───────────────────────────────────────────────
// Devolve o minimo para o cliente reconhecer o trabalho: o servico, a marca e
// modelo, a data e as fotografias. Nao devolve telefone, email, matricula nem
// preco. Um link partilhado num grupo de WhatsApp e um link que saiu das maos
// do cliente, e nessa altura o que la esta e o que qualquer pessoa ve.
//
// A matricula fica de fora de proposito: identifica o carro em qualquer parque
// do pais, e o cliente ja sabe qual e o carro dele.

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

/** Uma hora. O suficiente para ver e guardar; curto para um URL que fuja. */
const TTL = 60 * 60;

function admin() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Metodo nao suportado' }, 405);

  const body = await req.json().catch(() => ({}));
  const token = String(body.token ?? '').trim();

  // Comprimento de um UUID. Recusar aqui poupa uma consulta a cada tentativa
  // de quem anda a experimentar.
  if (token.length < 20 || token.length > 64) return json({ error: 'Link inválido' }, 404);

  const db = admin();

  const { data: service } = await db.from('services')
    .select('id, service_name, completed_at, scheduled_at, created_at, share_expires_at, vehicle:vehicles ( make, model )')
    .eq('share_token', token)
    .is('deleted_at', null)
    .maybeSingle();

  // A mesma resposta para "nao existe" e para "expirou" seria mais simples, mas o
  // cliente que recebeu o link ontem merece saber que o prazo acabou em vez de
  // pensar que se enganou no endereco.
  if (!service) return json({ error: 'Link inválido' }, 404);
  if (service.share_expires_at && new Date(service.share_expires_at) < new Date()) {
    return json({ error: 'Este link expirou. Peça-nos um novo.' }, 410);
  }

  const { data: photos } = await db.from('service_photos')
    .select('storage_path, photo_type, created_at')
    .eq('service_id', service.id)
    .order('created_at');

  const paths = (photos ?? []).map((p: { storage_path: string }) => p.storage_path);
  if (!paths.length) return json({ error: 'Ainda não há fotografias para mostrar.' }, 404);

  const { data: signed } = await db.storage.from('service-photos').createSignedUrls(paths, TTL);
  const urlPorCaminho = new Map((signed ?? []).map((s: { path: string | null; signedUrl: string }) => [s.path, s.signedUrl]));

  const vehicle = service.vehicle as { make: string | null; model: string | null } | null;

  return json({
    servico: service.service_name,
    viatura: vehicle ? [vehicle.make, vehicle.model].filter(Boolean).join(' ') : '',
    data: service.completed_at ?? service.scheduled_at ?? service.created_at,
    fotografias: (photos ?? [])
      .map((p: { storage_path: string; photo_type: string }) => ({
        tipo: p.photo_type,
        url: urlPorCaminho.get(p.storage_path) ?? null,
      }))
      .filter((p: { url: string | null }) => p.url),
  });
});
