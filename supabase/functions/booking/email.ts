// Email de confirmação da marcação, via Brevo.
//
// Recuperado do backend antigo, com os contactos corrigidos: a versão anterior
// tinha o telefone 934 177 308 e geral@cleanstationcar.pt, ambos desatualizados.

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';

const CONTACT_PHONE = '+351 913 733 791';
const CONTACT_EMAIL = 'cleanstationcar@gmail.com';

// URL absoluto: um caminho relativo não existe dentro de um cliente de email.
const LOGO_URL = 'https://cleanstationcar.com/img/logo.png';

/**
 * Escapa tudo o que veio do formulário antes de entrar no HTML.
 *
 * O nome e as notas são escritos por quem marca. Sem isto, um `<` no meio de
 * um nome parte o email, e uma etiqueta bem escolhida injeta conteúdo no que
 * o cliente recebe.
 */
function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface ConfirmationData {
  name: string;
  email: string;
  reference: number | null;
  serviceTitle: string;
  isPack: boolean;
  dateLabel: string;
  time: string;
  durationLabel: string;
  vehicle: string;
  price: number;
  gradeLabel?: string;
  gradePct?: number;
  problems?: string[];
}

function row(label: string, value: string, opts: { mono?: boolean } = {}): string {
  const style = opts.mono ? 'font-family:monospace;color:#aaa' : '';
  return `<tr>
    <td style="color:#555;padding:7px 0;border-top:1px solid #1a1a1a">${esc(label)}</td>
    <td style="text-align:right;${style}">${value}</td>
  </tr>`;
}

function buildHtml(d: ConfirmationData): string {
  const extra: string[] = [];

  if (d.gradeLabel && d.gradePct) {
    extra.push(row('Estado assinalado', `${esc(d.gradeLabel)} (+${esc(d.gradePct)}%)`));
  }
  if (d.problems?.length) {
    extra.push(row('Assinalado por si', esc(d.problems.join(', '))));
  }

  return `<!DOCTYPE html>
<html lang="pt">
<head><meta charset="utf-8"></head>
<body style="background:#0a0a0a;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:40px 20px;margin:0">
  <div style="max-width:520px;margin:0 auto">

    <div style="text-align:center;margin-bottom:32px">
      <!-- O alt não é decorativo: muitos clientes bloqueiam imagens por
           omissão, e sem ele o email abria com um espaço vazio no topo. -->
      <img src="${LOGO_URL}" alt="CLEAN STATION CAR" width="180"
           style="width:180px;max-width:60%;height:auto;display:block;margin:0 auto;border:0;color:#fff;font-size:18px;letter-spacing:.2em;font-weight:700">
      <p style="color:#666;font-size:11px;letter-spacing:.3em;margin:14px 0 0">LAVAGEM DETALHADA PREMIUM &middot; BRAGA</p>
    </div>

    <div style="border:1px solid #222;padding:32px;margin-bottom:24px">
      <!-- Logo repetido em pequeno junto à mensagem, para a marca acompanhar
           o conteúdo e não ficar só no cabeçalho. -->
      <img src="${LOGO_URL}" alt="" width="90"
           style="width:90px;height:auto;display:block;margin:0 0 18px;border:0;opacity:.75">
      <h2 style="font-size:16px;letter-spacing:.18em;margin:0 0 6px">MARCAÇÃO CONFIRMADA &#10003;</h2>
      <p style="color:#888;font-size:14px;margin:0 0 28px">
        Olá ${esc(d.name)}, a sua marcação foi registada com sucesso.
      </p>

      <table style="width:100%;font-size:14px;border-collapse:collapse">
        ${d.reference ? row('Referência', `#${esc(d.reference)}`, { mono: true }) : ''}
        ${row('Serviço', esc(d.serviceTitle) + (d.isPack ? ' <span style="color:#666">· pack 2x mês</span>' : ''))}
        ${row('Data', esc(d.dateLabel))}
        ${row('Hora', esc(d.time))}
        ${row('Duração prevista', esc(d.durationLabel))}
        ${row('Veículo', esc(d.vehicle) || '—')}
        ${extra.join('')}
        <tr>
          <td style="color:#fff;padding:14px 0 6px;border-top:1px solid #333;font-weight:600">Total estimado</td>
          <td style="text-align:right;font-size:20px;font-weight:700;padding-top:14px;border-top:1px solid #333">${esc(d.price)}€</td>
        </tr>
      </table>

      <p style="color:#555;font-size:12px;margin:20px 0 0;line-height:1.7">
        O valor é uma estimativa. O preço final pode ser ajustado depois de
        avaliarmos a viatura.
      </p>
    </div>

    <p style="color:#444;font-size:12px;text-align:center;line-height:1.8">
      Para cancelar ou alterar a marcação, contacte-nos:<br>
      <a href="tel:${CONTACT_PHONE.replace(/\s/g, '')}" style="color:#777;text-decoration:none">${CONTACT_PHONE}</a>
      &nbsp;·&nbsp;
      <a href="mailto:${CONTACT_EMAIL}" style="color:#777;text-decoration:none">${CONTACT_EMAIL}</a>
    </p>

  </div>
</body>
</html>`;
}

/**
 * Envia a confirmação. Nunca lança.
 *
 * O email é um extra: a marcação já está no calendário e no CRM. Deixar uma
 * falha do Brevo derrubar o pedido faria o cliente pensar que não ficou
 * marcado, e voltar a marcar.
 */
export async function sendConfirmation(d: ConfirmationData): Promise<boolean> {
  const apiKey = Deno.env.get('BREVO_API_KEY');
  const from = Deno.env.get('BREVO_FROM_EMAIL');

  if (!d.email) return false;
  if (!apiKey || !from) {
    console.warn('BREVO_API_KEY ou BREVO_FROM_EMAIL em falta: confirmação não enviada');
    return false;
  }

  try {
    // Timeout curto: o cliente está à espera do ecrã de confirmação, e um
    // provedor lento não deve segurar o pedido.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(BREVO_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'api-key': apiKey, 'content-type': 'application/json' },
      body: JSON.stringify({
        sender: { name: 'Clean Station Car', email: from },
        to: [{ email: d.email, name: d.name }],
        // O remetente pode ser um endereco do dominio que so envia, sem caixa
        // de correio. Sem replyTo, quem respondesse a confirmacao escrevia
        // para o vazio — e responder ao email de confirmacao e a coisa mais
        // natural do mundo para quem quer mudar a hora.
        replyTo: { email: Deno.env.get('BREVO_REPLY_TO') ?? CONTACT_EMAIL, name: 'Clean Station Car' },
        subject: 'Confirmação de marcação — Clean Station Car',
        htmlContent: buildHtml(d),
      }),
    });

    clearTimeout(timer);

    if (!res.ok) {
      console.error('Brevo recusou o envio:', res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error('Falha ao enviar confirmação:', e);
    return false;
  }
}
