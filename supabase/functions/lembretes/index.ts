// Edge Function dos lembretes automáticos. Duas passagens, uma chamada.
//
//   POST /lembretes        -> véspera + manutenção, e envia mesmo
//   POST /lembretes?dry=1  -> devolve a quem *ia* escrever, sem escrever
//
// ── 1. Véspera ──────────────────────────────────────────────────────────────
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
//
// ── 2. Manutenção ───────────────────────────────────────────────────────────
// O outro lado: quem devia ter voltado e não voltou. Uma proteção cerâmica dura
// seis meses e o cliente não anda a contar os dias.
//
// Esta **é** marketing e o consentimento é obrigatório — quem decide isso é a
// manutencoes_a_lembrar() do 0024, que já traz só quem pode receber. Aqui não
// se refiltra nada: duas cópias da mesma regra acabam sempre por discordar.
//
// As duas na mesma função porque correm à mesma hora, pelo mesmo agendador e
// pelo mesmo Brevo. Uma segunda função era um segundo deploy e um segundo cron
// para não repetir uma linha de fetch.
//
// O ?dry=1 existe porque a alternativa a testar isto é mandar email a sério a
// clientes reais. Vale para as duas passagens e não escreve nada — nem o email,
// nem a marca na ficha, nem o registo.

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
const SITE = 'https://cleanstationcar.com';
const LOGO = `${SITE}/img/logo.png`;

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

// Sem dia da semana: a data de um serviço feito há meses é uma referência, não
// um compromisso, e "quinta-feira, 3 de abril" faz pensar que é para agora.
const dataCurta = (iso: string) => new Intl.DateTimeFormat('pt-PT', {
  timeZone: 'Europe/Lisbon', day: 'numeric', month: 'long', year: 'numeric',
}).format(new Date(iso));

interface Marcacao {
  id: string;
  service_name: string;
  scheduled_at: string;
  client: { id: string; name: string; email: string | null; phone: string | null } | null;
  vehicle: { plate: string; make: string | null; model: string | null } | null;
}

/** O papel timbrado: logotipo, saudação e assinatura. Só o meio muda. */
function moldura(nome: string, corpo: string, rodape = ''): string {
  return `<!doctype html>
<html lang="pt"><body style="margin:0;padding:24px;background:#0a0a0a;font-family:Arial,Helvetica,sans-serif;color:#e5e5e5">
  <table role="presentation" width="100%" style="max-width:520px;margin:0 auto;background:#131313;border:1px solid #262626;border-radius:6px">
    <tr><td style="padding:28px 28px 0;text-align:center">
      <img src="${LOGO}" alt="Clean Station Car" width="140" style="display:block;margin:0 auto 20px">
    </td></tr>
    <tr><td style="padding:0 28px 28px">
      <p style="font-size:16px;margin:0 0 18px">Olá ${esc(nome)},</p>
      ${corpo}
      <p style="font-size:12px;color:#737373;margin:22px 0 0">Clean Station Car · ${esc(CONTACTO_EMAIL)}</p>
      ${rodape}
    </td></tr>
  </table>
</body></html>`;
}

/** Caixa escura com os dados do serviço. Igual nos dois emails. */
const caixa = (linhas: string) =>
  `<table role="presentation" width="100%" style="background:#0a0a0a;border:1px solid #262626;border-radius:4px;margin-bottom:22px">
        <tr><td style="padding:16px 18px;font-size:14px;line-height:1.9">${linhas}</td></tr>
      </table>`;

function html(m: Marcacao): string {
  const viatura = m.vehicle
    ? [m.vehicle.make, m.vehicle.model].filter(Boolean).join(' ') || m.vehicle.plate
    : '';

  return moldura(m.client?.name?.split(' ')[0] ?? '', `
      <p style="font-size:15px;line-height:1.6;margin:0 0 22px">
        Lembrete do seu serviço <strong>amanhã</strong>${viatura ? `, para o ${esc(viatura)}` : ''}.
      </p>
      ${caixa(`
          <strong style="color:#fff">${esc(m.service_name)}</strong><br>
          ${esc(dataLonga(m.scheduled_at))} às <strong style="color:#fff">${esc(hora(m.scheduled_at))}</strong><br>
          <span style="color:#a3a3a3">${esc(MORADA)}</span>`)}
      <p style="font-size:14px;line-height:1.6;margin:0 0 8px;color:#a3a3a3">
        Se não puder vir, avise-nos e remarcamos: <a href="tel:${TELEFONE.replace(/\s/g, '')}" style="color:#60a5fa">${esc(TELEFONE)}</a>.
      </p>`);
}

interface Manutencao {
  service_id: string;
  client_id: string;
  client_name: string;
  client_email: string;
  service_name: string;
  completed_at: string;
  dias: number;
  prazo: number;
  plate: string;
  make: string | null;
  model: string | null;
}

/** "há 3 meses" lê-se; "há 97 dias" conta-se. O corte é aos dois meses. */
const haQuanto = (dias: number) =>
  (dias >= 60 ? `há ${Math.round(dias / 30)} meses` : `há ${dias} dias`);

const viaturaDe = (m: Manutencao) =>
  [m.make, m.model].filter(Boolean).join(' ') || m.plate;

function htmlManutencao(m: Manutencao): string {
  return moldura(m.client_name.split(' ')[0], `
      <p style="font-size:15px;line-height:1.6;margin:0 0 22px">
        Já passou algum tempo desde a última visita do seu
        <strong>${esc(viaturaDe(m))}</strong> — está na altura de voltar a pôr o carro em dia.
      </p>
      ${caixa(`
          <strong style="color:#fff">${esc(m.service_name)}</strong><br>
          <span style="color:#a3a3a3">Feito ${esc(haQuanto(m.dias))}, em ${esc(dataCurta(m.completed_at))}</span><br>
          <span style="color:#a3a3a3">${esc(m.plate)}</span>`)}
      <p style="font-size:14px;line-height:1.6;margin:0 0 8px;color:#a3a3a3">
        Quer marcar? Responda a este email, ligue
        <a href="tel:${TELEFONE.replace(/\s/g, '')}" style="color:#60a5fa">${esc(TELEFONE)}</a>
        ou marque em <a href="${SITE}" style="color:#60a5fa">cleanstationcar.com</a>.
      </p>`,
    // RGPD: isto é marketing e tem de dizer como se sai. Sem link de
    // cancelamento porque não há nenhum a funcionar — prometer um botão que não
    // existe é pior do que pedir que respondam, que alguém lê mesmo.
    `<p style="font-size:11px;color:#525252;margin:14px 0 0;line-height:1.6">
        Recebe esta mensagem porque autorizou o contacto para novidades e promoções.
        Se preferir não voltar a recebê-las, responda a dizer e deixamos de enviar.
      </p>`);
}

/**
 * Quantos lembretes de manutenção podem sair de uma vez.
 *
 * Não é uma preocupação teórica: a primeira passagem olha para o histórico
 * todo de uma vez, e sem tecto mandava centenas de emails no mesmo minuto —
 * o Brevo corta e o domínio fica marcado. Os que sobram vão no dia seguinte;
 * a lista vem ordenada por quem espera há mais tempo.
 */
const MANUTENCAO_MAX = Number(Deno.env.get('MANUTENCAO_MAX') ?? 25);

/** O envio, igual nos dois lembretes. Levanta se o Brevo recusar. */
async function enviar(
  apiKey: string,
  from: string,
  para: { email: string; name: string },
  subject: string,
  htmlContent: string,
): Promise<void> {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'content-type': 'application/json' },
    body: JSON.stringify({
      sender: { name: 'Clean Station Car', email: from },
      to: [para],
      // Responder ao lembrete para remarcar e a reacao mais natural que ha.
      replyTo: { email: Deno.env.get('BREVO_REPLY_TO') ?? CONTACTO_EMAIL, name: 'Clean Station Car' },
      subject,
      htmlContent,
    }),
  });

  if (!res.ok) throw new Error(await res.text());
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Método não suportado' }, 405);

  const apiKey = Deno.env.get('BREVO_API_KEY');
  const from = Deno.env.get('BREVO_FROM_EMAIL');
  if (!apiKey || !from) return json({ error: 'BREVO_API_KEY ou BREVO_FROM_EMAIL em falta' }, 500);

  if (!await autorizado(req)) return json({ error: 'Não autorizado' }, 401);

  // Ensaio. Não manda email, não marca a ficha, não escreve no histórico: só
  // diz a quem ia escrever. A alternativa a testar isto era mandar email a
  // sério a clientes reais.
  const dry = new URL(req.url).searchParams.get('dry') === '1';

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
  const previstos: Array<{ para: string; assunto: string }> = [];
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

    const assunto = `Amanha as ${hora(m.scheduled_at)} — Clean Station Car`;

    if (dry) {
      previstos.push({ para: m.client.email, assunto });
      continue;
    }

    try {
      await enviar(apiKey, from, { email: m.client.email, name: m.client.name }, assunto, html(m));

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

  // ── 2. Manutenção ──────────────────────────────────────────────────────────
  // Quem entra na lista decide-se na manutencoes_a_lembrar() (0024): prazo do
  // catálogo, consentimento de marketing, sem mensagem recente e sem hora já
  // marcada. Aqui só se escreve a quem ela devolver.

  const manutencao = {
    candidatos: 0,
    enviados: 0,
    falhas: 0,
    // Quantos ficaram para o dia seguinte por causa do tecto.
    adiados: 0,
    erro: undefined as string | undefined,
    previstos: undefined as Array<
      { para: string; viatura: string; servico: string; dias: number; prazo: number }
    > | undefined,
  };

  const { data: devidos, error: erroManutencao } = await db.rpc('manutencoes_a_lembrar');

  if (erroManutencao) {
    // A 0024 pode ainda nao ter corrido. O lembrete da vespera ja saiu e nao
    // pode ficar por dizer so porque a segunda passagem nao existe ainda.
    console.error('Manutencao indisponivel:', erroManutencao.message);
    manutencao.erro = erroManutencao.message;
  } else {
    const lista = (devidos ?? []) as Manutencao[];
    manutencao.candidatos = lista.length;

    // O corte fica aqui e nao no SQL: a resposta diz quantos estavam a espera,
    // e nao so quantos couberam. Sem isso, uma fila que nunca esvazia parecia
    // um dia normal.
    const hoje = lista.slice(0, MANUTENCAO_MAX);
    manutencao.adiados = lista.length - hoje.length;

    if (dry) manutencao.previstos = [];

    for (const m of hoje) {
      const assunto = `Está na hora do seu ${viaturaDe(m)} — Clean Station Car`;

      if (dry) {
        manutencao.previstos!.push({
          para: m.client_email,
          viatura: viaturaDe(m),
          servico: m.service_name,
          dias: m.dias,
          prazo: m.prazo,
        });
        continue;
      }

      try {
        await enviar(
          apiKey, from,
          { email: m.client_email, name: m.client_name },
          assunto, htmlManutencao(m),
        );

        // Depois do envio, como na vespera: se o Brevo recusar, o servico fica
        // por lembrar e a passagem de amanha tenta outra vez.
        await db.from('services')
          .update({ maintenance_reminded_at: new Date().toISOString() })
          .eq('id', m.service_id);

        // is_marketing a true, ao contrario da vespera. Nao e so uma etiqueta:
        // e o que a propria manutencoes_a_lembrar() le para nao empilhar
        // mensagens, e o que responde a "que comunicacoes e que eu recebi".
        await db.from('message_logs').insert({
          client_id: m.client_id,
          service_id: m.service_id,
          channel: 'email',
          is_marketing: true,
          content: `Lembrete automatico de manutencao: ${m.service_name} no ${m.plate}, feito ha ${m.dias} dias.`,
        });

        manutencao.enviados++;
      } catch (e) {
        console.error('Lembrete de manutencao falhou', m.service_id, e);
        manutencao.falhas++;
      }
    }
  }

  return json({
    ok: true,
    dry,
    dia,
    marcacoes: marcacoes.length,
    enviados,
    falhas,
    semEmail,
    ...(dry ? { previstos } : {}),
    manutencao,
  });
});
