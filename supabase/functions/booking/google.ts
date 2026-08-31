// Autenticação com o Google via service account.
//
// O fluxo é: assinar um JWT com a chave privada da service account, trocá-lo
// por um access token, usar o token na API do Calendar. Não há refresh token
// nem ecrã de consentimento — foi por isso que trocámos o OAuth por isto: o
// refresh token de uma app em modo Testing expira ao fim de 7 dias.

import type { Busy } from './slots.ts';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/calendar';

interface ServiceAccount {
  client_email: string;
  private_key: string;
}

// O token dura 1h. Guardá-lo evita uma ida ao Google por cada pedido de
// disponibilidade — que é o pedido mais frequente do site.
let cached: { token: string; expiresAt: number } | null = null;

function base64url(input: ArrayBuffer | string): string {
  const bytes = typeof input === 'string'
    ? new TextEncoder().encode(input)
    : new Uint8Array(input);
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Converte a chave PEM do ficheiro JSON para o formato que o WebCrypto aceita. */
async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const body = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    // O JSON traz \n escapado; sem isto o atob rebenta.
    .replace(/\\n/g, '')
    .replace(/\s/g, '');

  const der = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));

  return crypto.subtle.importKey(
    'pkcs8',
    der,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}

export function serviceAccount(): ServiceAccount {
  const raw = Deno.env.get('GOOGLE_SERVICE_ACCOUNT');
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT em falta nos secrets');

  const parsed = JSON.parse(raw);
  if (!parsed.client_email || !parsed.private_key) {
    // Nomes das chaves, nunca os valores: é o que distingue o ficheiro da
    // service account (client_email, private_key) do ficheiro do OAuth client
    // (installed/web), que é fácil de trocar e produz o mesmo sintoma.
    const found = Object.keys(parsed).join(', ') || '(objeto vazio)';
    throw new Error(
      `GOOGLE_SERVICE_ACCOUNT nao e a chave da service account. `
      + `Chaves encontradas: ${found}. `
      + `Esperado um ficheiro com "type":"service_account", client_email e private_key.`,
    );
  }
  return parsed;
}

export async function accessToken(): Promise<string> {
  // 60s de margem: um token que expira a meio do pedido seguinte não serve.
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;

  const sa = serviceAccount();
  const now = Math.floor(Date.now() / 1000);

  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64url(JSON.stringify({
    iss: sa.client_email,
    scope: SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  }));

  const key = await importPrivateKey(sa.private_key);
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(`${header}.${claim}`),
  );

  const assertion = `${header}.${claim}.${base64url(signature)}`;

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!res.ok) {
    throw new Error(`Google recusou a autenticação: ${await res.text()}`);
  }

  const data = await res.json();
  cached = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cached.token;
}

export function calendarId(): string {
  const id = Deno.env.get('GOOGLE_CALENDAR_ID');
  if (!id) throw new Error('GOOGLE_CALENDAR_ID em falta nos secrets');
  return id;
}

/** Períodos ocupados do calendário, via freeBusy — mais leve que listar eventos. */
export async function busyPeriods(timeMin: string, timeMax: string): Promise<Busy[]> {
  const token = await accessToken();

  const res = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ timeMin, timeMax, items: [{ id: calendarId() }] }),
  });

  if (!res.ok) throw new Error(`Calendar freeBusy falhou: ${await res.text()}`);

  const data = await res.json();
  const entry = data.calendars?.[calendarId()];

  // O freeBusy responde 200 mesmo quando não consegue ler o calendário: põe o
  // motivo num campo `errors` da entrada. Sem esta verificação, "sem acesso"
  // era lido como "sem nada marcado" e o site oferecia horas por cima de
  // trabalho real — falha silenciosa e cara.
  if (!entry || entry.errors) {
    const reason = entry?.errors?.[0]?.reason ?? 'calendário não devolvido';
    throw new Error(
      `Sem acesso ao calendário (${reason}). `
      + `Confirma que ${serviceAccount().client_email} tem permissão `
      + `"Fazer alterações a eventos" em ${calendarId()}.`,
    );
  }

  return entry.busy ?? [];
}

export interface EventInput {
  summary: string;
  description: string;
  startIso: string;
  endIso: string;
}

export async function createEvent(input: EventInput): Promise<string> {
  const token = await accessToken();

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId())}/events`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        summary: input.summary,
        description: input.description,
        start: { dateTime: input.startIso, timeZone: 'Europe/Lisbon' },
        end: { dateTime: input.endIso, timeZone: 'Europe/Lisbon' },
        colorId: '6',
      }),
    },
  );

  if (!res.ok) throw new Error(`Não foi possível criar o evento: ${await res.text()}`);
  return (await res.json()).id;
}

/**
 * Actualiza um evento que ja existe.
 *
 * Um PATCH e nao apagar-e-criar: apagar muda o id, e o id e o que liga o evento
 * ao servico na base de dados e o que a Agenda usa para saber que aquele evento
 * ja tem ficha. Cada troca de id era uma janela em que o mesmo trabalho
 * aparecia duas vezes.
 *
 * Um 404 ou um 410 querem dizer que alguem apagou o evento no Google a mao.
 * Devolve false em vez de levantar, para quem chama poder criar outro — que e o
 * que se quer quando o evento desapareceu por baixo.
 */
export async function updateEvent(eventId: string, input: EventInput): Promise<boolean> {
  const token = await accessToken();

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId())}/events/${encodeURIComponent(eventId)}`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        summary: input.summary,
        description: input.description,
        start: { dateTime: input.startIso, timeZone: 'Europe/Lisbon' },
        end: { dateTime: input.endIso, timeZone: 'Europe/Lisbon' },
      }),
    },
  );

  if (res.status === 404 || res.status === 410) return false;
  if (!res.ok) throw new Error(`Não foi possível actualizar o evento: ${await res.text()}`);
  return true;
}

/**
 * Apaga um evento. Um 404 ou um 410 nao sao falha: querem dizer que o evento ja
 * la nao esta, que e exatamente o estado que se queria. Insistir num erro so
 * impedia o CRM de apagar a folga por causa de um evento que ja nao existe.
 */
export async function deleteEvent(eventId: string): Promise<void> {
  const token = await accessToken();

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId())}/events/${encodeURIComponent(eventId)}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
  );

  if (!res.ok && res.status !== 404 && res.status !== 410) {
    throw new Error(`Não foi possível apagar o evento: ${await res.text()}`);
  }
}

export interface CalendarEvent {
  id: string;
  summary: string;
  startIso: string;
  endIso: string;
}

/**
 * Eventos de uma janela, com titulo — ao contrario do busyPeriods, que so
 * devolve os intervalos ocupados e serve para calcular vagas.
 *
 * singleEvents expande as series repetidas em ocorrencias: sem isso, um evento
 * semanal vinha uma vez so, com a data da primeira ocorrencia, e a Agenda
 * mostrava-o na semana errada.
 *
 * Os eventos de dia inteiro trazem `date` em vez de `dateTime`. Ficam com o dia
 * as 00:00, que e como a Agenda os desenha.
 */
export async function listEvents(timeMin: string, timeMax: string): Promise<CalendarEvent[]> {
  const token = await accessToken();

  const url = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId())}/events`,
  );
  url.searchParams.set('timeMin', timeMin);
  url.searchParams.set('timeMax', timeMax);
  url.searchParams.set('singleEvents', 'true');
  url.searchParams.set('orderBy', 'startTime');
  url.searchParams.set('maxResults', '250');

  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Não foi possível ler o calendário: ${await res.text()}`);

  const data = await res.json();

  return (data.items ?? [])
    .filter((e: { status?: string }) => e.status !== 'cancelled')
    .map((e: Record<string, any>) => ({
      id: String(e.id),
      summary: String(e.summary ?? '(sem título)'),
      startIso: e.start?.dateTime ?? `${e.start?.date}T00:00:00`,
      endIso: e.end?.dateTime ?? `${e.end?.date}T00:00:00`,
    }));
}
