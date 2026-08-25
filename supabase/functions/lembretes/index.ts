// Edge Function do lembrete na véspera.
//
//   POST /lembretes  -> avisa quem tem serviço marcado para amanhã
//
// Uma lavagem detalhada ocupa o dia inteiro. Um cliente que não aparece não
// custa uma marcação, custa o dia. Até aqui o único contacto que ele recebia
// era o email de confirmação, no momento em que marcou — às vezes semanas
// antes.
//
// Comunicação operacional, não marketing: é a execução do serviço que o próprio
// cliente pediu, e por isso não depende do consentimento de marketing. É a
// mesma base legal do email de confirmação que já sai hoje.
//
// Quem não tem email fica de fora — não há como lhe escrever. Em vez de os
// ignorar em silêncio, a resposta devolve-os com o telefone, para serem
// avisados por WhatsApp.

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

const MORADA = 'R. Conselheiro Lobato 503, 4705-089 Braga';
const TELEFONE = '+351 913 733 791';
const CONTACTO_EMAIL = 'cleanstationcar@gmail.com';
const LOGO = 'https://cleanstationcar.com/img/logo.png';

function admin() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );
}

/** O agendador com o segredo combinado, ou um administrador autenticado. */
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

/**
 * Amanhã em Lisboa, como intervalo [inicio, fim).
 *
 * O fuso do servidor não serve: a função corre em infraestrutura que pode estar
 * noutro continente, e perto da meia-noite isso avisava o dia errado.
 */
function amanhaEmLisboa(agora = new Date()): { de: string; ate: string; dia: string } {
  const hoje = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon' }).format(agora);
  const dia = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon' })
    .format(new Date(new Date(`${hoje}T12:00:00Z`).getTime() + 24 * 3600_000));

  // Deslocação daquele dia, não a de hoje: entre marcar e o dia chegar pode
  // haver mudança de hora, e uma hora ao lado põe o intervalo fora do dia.
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Lisbon',
    timeZoneName: 'longOffset',
  }).formatToParts(new Date(`${dia}T12:00:00Z`));
  const nome = partes.find((p) => p.type === 'timeZoneName')?.value ?? 'GMT+00:00';
  const desloc = nome.replace('GMT', '') || '+00:00';

  const de = new Date(`${dia}T00:00:00${desloc}`);
  return {
    de: de.toISOString(),
    ate: new Date(de.getTime() + 24 * 3600_000).toISOString(),
    dia,
  };
}

const esc = (v: unknown) => String(v ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const hora = (iso: string) => new Intl.DateTimeFormat('pt-PT', {
  timeZone: 'Europe/Lisbon', hour: '2-digit', minute: '2-digit',
}).format(new Date(iso));

const dataLonga = (iso: string) => new Intl.DateTimeFormat('pt-PT', {
  timeZone: 'Europe/Lisbon', weekday: 'long', day: 'numeric', month: 'long',
}).format(new Date(iso));

interface Marcacao {
  id: string;
  service_name: string;
  scheduled_at: string;
  client: { id: string; name: string; email: string | null; phone: string | null } | null;
  vehicle: { plate: string; make: string | null; model: string | null } | null;
}

function html(m: Marcacao): string {
  const nome = m.client?.name?.split(' ')[0] ?? '';
  const viatura = m.vehicle
    ? [m.vehicle.make, m.vehicle.model].filter(Boolean).join(' ') || m.vehicle.plate
    : '';

  return `<!doctype html>
<html lang="pt"><body style="margin:0;padding:24px;background:#0a0a0a;font-family:Arial,Helvetica,sans-serif;color:#e5e5e5">
  <table role="presentation" width="100%" style="max-width:520px;margin:0 auto;background:#131313;border:1px solid #262626;border-radius:6px">
    <tr><td style="padding:28px 28px 0;text-align:center">
      <img src="${LOGO}" alt="Clean Station Car" width="140" style="display:block;margin:0 auto 20px">
    </td></tr>
    <tr><td style="padding:0 28px 28px">
      <p style="font-size:16px;margin:0 0 18px">Olá ${esc(nome)},</p>
      <p style="font-size:15px;line-height:1.6;margin:0 0 22px">
        Lembrete do seu serviço <strong>amanhã</strong>${viatura ? `, para o ${esc(viatura)}` : ''}.
      </p>
      <table role="presentation" width="100%" style="background:#0a0a0a;border:1px solid #262626;border-radius:4px;margin-bottom:22px">
        <tr><td style="padding:16px 18px;font-size:14px;line-height:1.9">
          <strong style="color:#fff">${esc(m.service_name)}</strong><br>
          ${esc(dataLonga(m.scheduled_at))} às <strong style="color:#fff">${esc(hora(m.scheduled_at))}</strong><br>
          <span style="color:#a3a3a3">${esc(MORADA)}</span>
        </td></tr>
      </table>
      <p style="font-size:14px;line-height:1.6;margin:0 0 8px;color:#a3a3a3">
        Se não puder vir, avise-nos e remarcamos: <a href="tel:${TELEFONE.replace(/\s/g, '')}" style="color:#60a5fa">${esc(TELEFONE)}</a>.
      </p>
      <p style="font-size:12px;color:#737373;margin:22px 0 0">Clean Station Car · ${esc(CONTACTO_EMAIL)}</p>
    </td></tr>
  </table>
</body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Método não suportado' }, 405);

  const apiKey = Deno.env.get('BREVO_API_KEY');
  const from = Deno.env.get('BREVO_FROM_EMAIL');
  if (!apiKey || !from) return json({ error: 'BREVO_API_KEY ou BREVO_FROM_EMAIL em falta' }, 500);

  if (!await autorizado(req)) return json({ error: 'Não autorizado' }, 401);

  const { de, ate, dia } = amanhaEmLisboa();
  const db = admin();

  const { data, error } = await db.from('services')
    .select('id, service_name, scheduled_at, client:clients ( id, name, email, phone ), vehicle:vehicles ( plate, make, model )')
    .is('deleted_at', null)
    .is('reminded_at', null)
    .neq('status', 'cancelado')
    .gte('scheduled_at', de)
    .lt('scheduled_at', ate)
    .order('scheduled_at');

  if (error) return json({ error: error.message }, 500);

  const marcacoes = (data ?? []) as unknown as Marcacao[];
  const semEmail: Array<{ name: string; phone: string | null; hora: string }> = [];
  let enviados = 0;
  let falhas = 0;

  for (const m of marcacoes) {
    if (!m.client?.email) {
      // Nao ha como escrever a quem nao deu email. Vai na resposta para ser
      // avisado por WhatsApp, em vez de desaparecer sem ninguem saber.
      if (m.client) {
        semEmail.push({ name: m.client.name, phone: m.client.phone, hora: hora(m.scheduled_at) });
      }
      continue;
    }

    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': apiKey, 'content-type': 'application/json' },
        body: JSON.stringify({
          sender: { name: 'Clean Station Car', email: from },
          to: [{ email: m.client.email, name: m.client.name }],
          // Responder ao lembrete para remarcar e a reacao mais natural que ha.
          replyTo: { email: Deno.env.get('BREVO_REPLY_TO') ?? CONTACTO_EMAIL, name: 'Clean Station Car' },
          subject: `Amanha as ${hora(m.scheduled_at)} — Clean Station Car`,
          htmlContent: html(m),
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      // Marcado depois do envio, e nao antes: se o Brevo recusar, o cliente
      // fica por avisar e a passagem seguinte tenta outra vez.
      await db.from('services').update({ reminded_at: new Date().toISOString() }).eq('id', m.id);

      // No historico do cliente, ao lado das mensagens escritas a mao: quem
      // abrir a ficha ve que ele foi avisado, sem ir aos registos.
      await db.from('message_logs').insert({
        client_id: m.client.id,
        service_id: m.id,
        channel: 'email',
        is_marketing: false,
        content: `Lembrete automatico: ${m.service_name} amanha as ${hora(m.scheduled_at)}.`,
      });

      enviados++;
    } catch (e) {
      // Um email recusado nao pode travar os restantes.
      console.error('Lembrete falhou', m.id, e);
      falhas++;
    }
  }

  // Tambem nos logs: quem corre isto e o agendador, e a resposta de uma tarefa
  // agendada nao e lida por ninguem. A Agenda marca-os para quem esta a olhar,
  // isto fica para quem for a procura depois.
  if (semEmail.length) console.info('Sem email, avisar a mao:', JSON.stringify(semEmail));

  return json({ ok: true, dia, marcacoes: marcacoes.length, enviados, falhas, semEmail });
});
