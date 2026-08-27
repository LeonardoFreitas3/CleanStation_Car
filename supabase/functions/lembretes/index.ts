// Edge Function dos emails automáticos. Três passagens, uma chamada.
//
//   POST /lembretes        -> véspera + manutenção + avaliação, e envia mesmo
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
// ── 3. Avaliação ────────────────────────────────────────────────────────────
// Dois dias depois de o cliente levar o carro. O site já mostra as avaliações
// do Google; o que faltava era pedi-las — as estrelas só apareciam se alguém se
// lembrasse sozinho.
//
// Também marketing, e também com consentimento: pedir uma avaliação não é
// executar o serviço, que já acabou. Quem entra na lista decide-se na
// avaliacoes_a_pedir() do 0025.
//
// Sem endereço nas Definições não sai nada. Um pedido de avaliação sem sítio
// para onde mandar o cliente é um email a pedir um favor impossível.
//
// ── As três juntas ──────────────────────────────────────────────────────────
// Na mesma função porque correm à mesma hora, pelo mesmo agendador e pelo mesmo
// Brevo. Três funções eram três deploys e três sítios para desligar por engano.
//
// O ?dry=1 existe porque a alternativa a testar isto é mandar email a sério a
// clientes reais. Vale para as três passagens e não escreve nada — nem o email,
// nem a marca na ficha, nem o registo.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.10';
import { amanhaEmLisboa, dataCurta, dataLonga, haQuanto, hora } from './datas.ts';

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

const esc = (v: unknown) => String(v ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

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

interface Avaliacao {
  service_id: string;
  client_id: string;
  client_name: string;
  client_email: string;
  service_name: string;
  delivered_at: string;
  plate: string | null;
  make: string | null;
  model: string | null;
  /** Null quando não há galeria partilhada, ou quando o link já expirou. */
  share_token: string | null;
}

function htmlAvaliacao(a: Avaliacao, reviewUrl: string): string {
  const viatura = [a.make, a.model].filter(Boolean).join(' ') || a.plate || 'carro';

  // A galeria antes do botão, e não depois: quem vê o antes-e-depois do próprio
  // carro chega ao pedido já convencido. Ao contrário, é só mais um pedido.
  const galeria = a.share_token
    ? `<p style="font-size:14px;line-height:1.6;margin:0 0 18px;color:#a3a3a3">
        As fotografias do trabalho estão aqui:
        <a href="${SITE}/galeria/${esc(a.share_token)}" style="color:#60a5fa">ver a galeria</a>.
      </p>`
    : '';

  return moldura(a.client_name.split(' ')[0], `
      <p style="font-size:15px;line-height:1.6;margin:0 0 22px">
        Obrigado por nos ter confiado o seu <strong>${esc(viatura)}</strong>.
        Esperamos que o tenha levado como queria.
      </p>
      ${caixa(`
          <strong style="color:#fff">${esc(a.service_name)}</strong><br>
          <span style="color:#a3a3a3">Entregue em ${esc(dataCurta(a.delivered_at))}</span>
          ${a.plate ? `<br><span style="color:#a3a3a3">${esc(a.plate)}</span>` : ''}`)}
      ${galeria}
      <p style="font-size:15px;line-height:1.6;margin:0 0 20px">
        Se ficou satisfeito, deixe-nos uma avaliação. São dois minutos e é o que
        ajuda outra pessoa em Braga a encontrar-nos.
      </p>
      <table role="presentation" style="margin:0 0 20px">
        <tr><td style="background:#2563eb;border-radius:4px">
          <a href="${esc(reviewUrl)}" style="display:inline-block;padding:12px 22px;color:#fff;font-size:14px;font-weight:bold;text-decoration:none">
            Deixar uma avaliação
          </a>
        </td></tr>
      </table>
      <p style="font-size:14px;line-height:1.6;margin:0 0 8px;color:#a3a3a3">
        E se alguma coisa não ficou bem, diga-nos primeiro a nós: responda a este
        email ou ligue <a href="tel:${TELEFONE.replace(/\s/g, '')}" style="color:#60a5fa">${esc(TELEFONE)}</a>.
        Preferimos corrigir a saber tarde.
      </p>`,
    `<p style="font-size:11px;color:#525252;margin:14px 0 0;line-height:1.6">
        Recebe esta mensagem porque autorizou o contacto para novidades e promoções.
        Se preferir não voltar a recebê-las, responda a dizer e deixamos de enviar.
      </p>`);
}

/**
 * Quantos emails cada passagem automática pode mandar de uma vez.
 *
 * Não é uma preocupação teórica: a primeira passagem olha para o histórico de
 * uma vez, e sem tecto mandava centenas de emails no mesmo minuto — o Brevo
 * corta e o domínio fica marcado. Os que sobram vão no dia seguinte; as listas
 * vêm ordenadas por quem espera há mais tempo.
 *
 * Não vale para o lembrete da véspera: essa lista é a agenda de amanhã, tem o
 * tamanho de um dia de trabalho, e cortá-la era deixar um cliente por avisar.
 */
const EMAILS_MAX = Number(Deno.env.get('EMAILS_MAX') ?? 25);

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
    const hoje = lista.slice(0, EMAILS_MAX);
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

  // ── 3. Avaliação ───────────────────────────────────────────────────────────
  // Dois dias depois de o cliente levar o carro. Quem entra na lista decide-se
  // na avaliacoes_a_pedir() (0025); o endereço vem das Definições.

  const avaliacao = {
    candidatos: 0,
    enviados: 0,
    falhas: 0,
    adiados: 0,
    erro: undefined as string | undefined,
    previstos: undefined as Array<{ para: string; viatura: string; comFotos: boolean }> | undefined,
  };

  const { data: definicoes, error: erroDefinicoes } = await db.from('app_settings')
    .select('review_url').eq('id', 1).maybeSingle();

  // Separado de proposito da coluna vazia: se a 0025 nao correu, a coluna nao
  // existe e isto rebenta. Dizer "sem endereco nas Definicoes" nesse caso
  // mandava alguem procurar um campo que ainda nao esta no ecra.
  const reviewUrl = erroDefinicoes ? null : (definicoes?.review_url ?? null);

  if (erroDefinicoes) {
    console.error('Definicoes indisponiveis:', erroDefinicoes.message);
    avaliacao.erro = erroDefinicoes.message;
  } else if (!reviewUrl) {
    // Nao e avaria: e a funcionalidade desligada, que e como nasce. Vai na
    // resposta para nao parecer que correu e nao encontrou ninguem.
    avaliacao.erro = 'Sem endereço de avaliação nas Definições.';
  } else {
    const { data: aPedir, error: erroAvaliacao } = await db.rpc('avaliacoes_a_pedir');

    if (erroAvaliacao) {
      console.error('Avaliacoes indisponiveis:', erroAvaliacao.message);
      avaliacao.erro = erroAvaliacao.message;
    } else {
      const lista = (aPedir ?? []) as Avaliacao[];
      avaliacao.candidatos = lista.length;

      const hoje = lista.slice(0, EMAILS_MAX);
      avaliacao.adiados = lista.length - hoje.length;

      if (dry) avaliacao.previstos = [];

      for (const a of hoje) {
        const viatura = [a.make, a.model].filter(Boolean).join(' ') || a.plate || 'carro';

        if (dry) {
          avaliacao.previstos!.push({
            para: a.client_email,
            viatura,
            comFotos: Boolean(a.share_token),
          });
          continue;
        }

        try {
          await enviar(
            apiKey, from,
            { email: a.client_email, name: a.client_name },
            'Como correu? — Clean Station Car',
            htmlAvaliacao(a, reviewUrl),
          );

          await db.from('services')
            .update({ review_requested_at: new Date().toISOString() })
            .eq('id', a.service_id);

          // Marketing, como o de manutencao. Alem da etiqueta, e o que impede o
          // lembrete de manutencao de sair em cima deste nos 30 dias seguintes.
          await db.from('message_logs').insert({
            client_id: a.client_id,
            service_id: a.service_id,
            channel: 'email',
            is_marketing: true,
            content: `Pedido automatico de avaliacao: ${a.service_name}, entregue em ${dataCurta(a.delivered_at)}.`,
          });

          avaliacao.enviados++;
        } catch (e) {
          console.error('Pedido de avaliacao falhou', a.service_id, e);
          avaliacao.falhas++;
        }
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
    avaliacao,
  });
});
