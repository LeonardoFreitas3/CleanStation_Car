// Edge Function das marcações públicas.
//
// Dois endpoints, ambos chamados pelo site com a anon key:
//   POST /booking/availability  -> horas livres de um dia
//   POST /booking/create        -> cria evento no Calendar e regista no CRM
//
// As credenciais do Google vivem nos secrets do Supabase e nunca saem daqui.
// A resposta de availability devolve só horas — nenhum dado de nenhum cliente.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.10';
import { busyPeriods, createEvent, deleteEvent } from './google.ts';
import { formatDuration, freeSlots, isClosed, slotIso } from './slots.ts';
import type { Busy } from './slots.ts';
import { sendConfirmation } from './email.ts';
import { resolve } from './catalogue.ts';

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

/** service_role: escreve no CRM contornando o RLS. Nunca sai desta função. */
function admin() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );
}

const digits = (s: string) => (s ?? '').replace(/\D/g, '');

/** Serviço agendado no CRM sem duração indicada. Duas horas é a lavagem comum. */
const DEFAULT_SERVICE_MINUTES = 120;

/**
 * Períodos ocupados do dia: o Google Calendar, as folgas do CRM e os serviços
 * agendados à mão no CRM.
 *
 * Os três são precisos. O calendário só conhece as marcações feitas pelo site;
 * uma marcação por telefone vive só na tabela services, e sem isto o site
 * oferecia essa hora a outra pessoa.
 *
 * Janela alargada a dois dias porque um serviço da véspera pode estender-se
 * pela manhã — e uma folga de vários dias tem de continuar a ocupar o meio.
 *
 * Lido com a service_role: o RLS destas tabelas só deixa passar staff
 * autenticado, e quem marca no site não tem sessão nenhuma.
 */
async function busyWindow(date: string): Promise<Busy[]> {
  const from = slotIso(date, 0, 0);
  const to = new Date(new Date(from).getTime() + 48 * 3600_000).toISOString();
  const db = admin();

  const [busy, off, scheduled] = await Promise.all([
    busyPeriods(from, to),
    db.from('time_off').select('starts_at, ends_at').lt('starts_at', to).gt('ends_at', from),
    // Não filtra pelo fim porque a duração não é coluna comparável em SQL: a
    // janela recua um dia para apanhar o serviço da véspera que se prolonga.
    db.from('services')
      .select('scheduled_at, duration_minutes')
      .is('deleted_at', null)
      .neq('status', 'cancelado')
      .gte('scheduled_at', new Date(new Date(from).getTime() - 24 * 3600_000).toISOString())
      .lt('scheduled_at', to),
  ]);

  // Uma falha a ler isto não pode passar por "dia livre": mais vale o pedido
  // rebentar e o cliente tentar outra vez do que marcarem em cima.
  if (off.error) throw off.error;
  if (scheduled.error) throw scheduled.error;

  return [
    ...busy,
    ...(off.data ?? []).map((r: { starts_at: string; ends_at: string }) => ({
      start: r.starts_at,
      end: r.ends_at,
    })),
    ...(scheduled.data ?? []).map((r: { scheduled_at: string; duration_minutes: number | null }) => ({
      start: r.scheduled_at,
      end: new Date(
        new Date(r.scheduled_at).getTime()
        + (r.duration_minutes ?? DEFAULT_SERVICE_MINUTES) * 60_000,
      ).toISOString(),
    })),
  ];
}

// ── Disponibilidade ──────────────────────────────────────────────────────────

async function handleAvailability(body: Record<string, unknown>) {
  const date = String(body.date ?? '');
  const duration = Number(body.duration ?? 60);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ error: 'Data inválida' }, 400);
  if (!Number.isFinite(duration) || duration < 15 || duration > 1440) {
    return json({ error: 'Duração inválida' }, 400);
  }
  if (isClosed(date)) return json({ slots: [] });

  return json({ slots: freeSlots(date, duration, await busyWindow(date)) });
}

// ── Criação ──────────────────────────────────────────────────────────────────

async function handleCreate(body: Record<string, unknown>) {
  const name = String(body.name ?? '').trim();
  const phone = String(body.phone ?? '').trim();
  const email = String(body.email ?? '').trim().toLowerCase();
  const date = String(body.date ?? '');
  const time = String(body.time ?? '');

  // Validação no servidor. O formulário também valida, mas isso é conveniência:
  // quem chamar esta função diretamente passa por aqui na mesma.
  if (!name) return json({ error: 'Indique o seu nome' }, 400);
  if (digits(phone).length < 9) return json({ error: 'Indique um telefone válido' }, 400);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Email inválido' }, 400);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return json({ error: 'Data ou hora inválidas' }, 400);
  }

  const problems = Array.isArray(body.problems) ? body.problems as string[] : [];
  const isPack = Boolean(body.isPack);

  // Preço e duração vêm do catálogo do servidor, nunca do pedido. O corpo só
  // traz ids; se mandarem price:1 e duration:15, é ignorado.
  let resolved;
  try {
    resolved = resolve(
      String(body.vehicleType ?? ''),
      String(body.levelId ?? ''),
      isPack,
      problems.length,
    );
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Serviço inválido' }, 400);
  }

  const { price, duration } = resolved;

  const [h, m] = time.split(':').map(Number);
  const startIso = slotIso(date, h, m);
  const endIso = new Date(new Date(startIso).getTime() + duration * 60_000).toISOString();

  if (new Date(startIso).getTime() <= Date.now()) {
    return json({ error: 'A data escolhida já passou' }, 400);
  }

  // Revalidar a disponibilidade. Entre ver a hora livre e carregar em confirmar
  // podem passar minutos, e nesse intervalo outra pessoa pode ter marcado.
  if (!freeSlots(date, duration, await busyWindow(date)).includes(time)) {
    return json({ error: 'Esse horário já não está disponível. Escolha outro.' }, 409);
  }

  // O rotulo tambem vem do catalogo: o do pedido serve so para o cliente ver.
  const levelLabel = resolved.label;
  const vehicleInfo = String(body.vehicleInfo ?? '').trim();
  const notes = String(body.notes ?? '').trim();

  // ── 1. Evento no calendário ────────────────────────────────────────────────
  // Primeiro o calendário: é o que os funcionários veem. Se o CRM falhar a
  // seguir, o pior caso é uma marcação sem ficha — recuperável à mão. Ao
  // contrário, uma ficha sem marcação passava despercebida.
  const eventId = await createEvent({
    summary: `[CSC] ${levelLabel}${isPack ? ' (pack)' : ''} — ${name}`,
    description: [
      `Serviço: ${levelLabel}${isPack ? ' · pack 2x mês' : ''}`,
      `Veículo: ${vehicleInfo || '-'}`,
      `Telefone: ${phone}`,
      `Email: ${email || '-'}`,
      `Estado assinalado: ${resolved.gradeLabel} (+${resolved.gradePct}%)`,
      `Problemas: ${problems.length ? problems.join(', ') : '-'}`,
      `Notas: ${notes || '-'}`,
      `Estimativa: ${price} EUR`,
    ].join('\n'),
    startIso,
    endIso,
  });

  // ── 2. Registo no CRM ──────────────────────────────────────────────────────
  const db = admin();
  let reference: number | null = null;

  try {
    // Deduplicação: email primeiro, telefone depois. O email é mais fiável,
    // mas nem toda a gente o dá — sem o telefone como reserva, o mesmo cliente
    // ficava duplicado a cada marcação.
    let clientId: string | null = null;

    if (email) {
      const { data } = await db.from('clients').select('id')
        .ilike('email', email).is('deleted_at', null).limit(1).maybeSingle();
      clientId = data?.id ?? null;
    }
    if (!clientId) {
      const { data } = await db.from('clients').select('id, phone')
        .is('deleted_at', null).not('phone', 'is', null).limit(500);
      const match = (data ?? []).find((c: { phone: string }) => digits(c.phone) === digits(phone));
      clientId = match?.id ?? null;
    }

    if (clientId) {
      // Preenche o que faltava sem apagar o que já lá estava.
      const patch: Record<string, unknown> = {};
      if (email) patch.email = email;
      if (Object.keys(patch).length) await db.from('clients').update(patch).eq('id', clientId);
    } else {
      const { data, error } = await db.from('clients').insert({
        name,
        phone,
        email: email || null,
        // Marcou pelo site, logo consentiu o tratamento para executar o
        // serviço. Marketing fica a false: é consentimento separado.
        data_consent: true,
        marketing_consent: false,
        notes: 'Criado a partir de marcação no site.',
      }).select('id').single();
      if (error) throw error;
      clientId = data.id;
    }

    // Viatura: só se o cliente escreveu alguma coisa, e só se ainda não existir
    // uma igual. Sem matrícula não dá para deduplicar com rigor.
    let vehicleId: string | null = null;
    if (vehicleInfo) {
      const plate = vehicleInfo.match(/\b[A-Z0-9]{2}[- ]?[A-Z0-9]{2}[- ]?[A-Z0-9]{2}\b/i)?.[0];
      if (plate) {
        const norm = plate.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        const { data: existing } = await db.from('vehicles').select('id')
          .eq('client_id', clientId).eq('plate_norm', norm).is('deleted_at', null)
          .limit(1).maybeSingle();
        if (existing) {
          vehicleId = existing.id;
        } else {
          const { data } = await db.from('vehicles').insert({
            client_id: clientId,
            plate: plate.toUpperCase(),
            notes: vehicleInfo,
          }).select('id').single();
          vehicleId = data?.id ?? null;
        }
      }
    }

    const { data: service, error: serviceError } = await db.from('services').insert({
      client_id: clientId,
      vehicle_id: vehicleId,
      service_name: `${levelLabel}${isPack ? ' (pack)' : ''}`,
      price,
      status: 'agendado',
      scheduled_at: new Date(startIso).toISOString(),
      duration_minutes: duration,
      notes: [
        notes,
        problems.length ? `Assinalado pelo cliente: ${problems.join(', ')}` : '',
        vehicleInfo && !vehicleId ? `Viatura indicada: ${vehicleInfo}` : '',
        `Marcação do site · evento ${eventId}`,
      ].filter(Boolean).join('\n'),
    }).select('reference').single();

    if (serviceError) throw serviceError;
    reference = service.reference;
  } catch (e) {
    // O evento já está no calendário e é isso que importa para o trabalho não
    // se perder. Falha o registo, não a marcação.
    console.error('Marcação criada no calendário mas falhou no CRM:', e);
  }

  // ── 3. Confirmacao por email ───────────────────────────────────────────────
  // Depois de tudo o resto, e sem poder falhar o pedido: a marcacao ja existe
  // no calendario e no CRM. Uma falha do Brevo nao deve fazer o cliente pensar
  // que nao ficou marcado e voltar a marcar.
  const emailSent = await sendConfirmation({
    name,
    email,
    reference,
    serviceTitle: levelLabel,
    isPack,
    dateLabel: new Date(startIso).toLocaleDateString('pt-PT', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      timeZone: 'Europe/Lisbon',
    }),
    time,
    durationLabel: formatDuration(duration),
    vehicle: vehicleInfo,
    price,
    gradeLabel: resolved.gradeLabel,
    gradePct: resolved.gradePct || undefined,
    problems,
  });

  return json({ ok: true, reference, eventId, emailSent, scheduledAt: startIso });
}

// ── Router ───────────────────────────────────────────────────────────────────


// ── Folgas ───────────────────────────────────────────────────────────────────
//
// A folga em si e criada pelo CRM, direta a base de dados, onde o RLS decide
// quem pode. Aqui so se trata do que o browser nao pode fazer: falar com o
// Google, cujas credenciais vivem nos secrets e nunca no frontend.
//
// Por isso o pedido traz o id da folga e nao os seus dados: a folga ja existe e
// ja bloqueia o site. Isto e o espelho no calendario, e se falhar o pior caso e
// uma folga que nao se ve no telemovel.

/** Quem esta a pedir, se for pessoal ativo. Mesmo criterio do is_staff(). */
async function staffOrNull(req: Request): Promise<string | null> {
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer /, '');
  if (!token) return null;

  const db = admin();
  const { data: user, error } = await db.auth.getUser(token);
  if (error || !user?.user) return null;

  const { data: profile } = await db.from('profiles')
    .select('active').eq('id', user.user.id).maybeSingle();

  return profile?.active ? user.user.id : null;
}

async function handleTimeOffSync(req: Request, body: Record<string, unknown>) {
  if (!await staffOrNull(req)) return json({ error: 'Sessão inválida ou expirada' }, 401);

  const id = String(body.id ?? '');
  if (!id) return json({ error: 'Folga por identificar' }, 400);

  const db = admin();
  const { data: off } = await db.from('time_off')
    .select('starts_at, ends_at, reason, google_event_id').eq('id', id).maybeSingle();

  if (!off) return json({ error: 'Folga não encontrada' }, 404);
  // Ja espelhada: nao criar um segundo evento para a mesma folga.
  if (off.google_event_id) return json({ eventId: off.google_event_id });

  const eventId = await createEvent({
    summary: `[CSC] Folga${off.reason ? ` — ${off.reason}` : ''}`,
    description: 'Marcada no CRM. Enquanto durar, o site não oferece horas.',
    startIso: off.starts_at,
    endIso: off.ends_at,
  });

  await db.from('time_off').update({ google_event_id: eventId }).eq('id', id);
  return json({ eventId });
}

async function handleTimeOffRemove(req: Request, body: Record<string, unknown>) {
  if (!await staffOrNull(req)) return json({ error: 'Sessão inválida ou expirada' }, 401);

  const eventId = String(body.eventId ?? '');
  if (!eventId) return json({ ok: true });

  await deleteEvent(eventId);
  return json({ ok: true });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Método não suportado' }, 405);

  const action = new URL(req.url).pathname.split('/').filter(Boolean).pop();

  try {
    const body = await req.json().catch(() => ({}));

    if (action === 'availability') return await handleAvailability(body);
    if (action === 'create') return await handleCreate(body);
    if (action === 'time-off') return await handleTimeOffSync(req, body);
    if (action === 'time-off-remove') return await handleTimeOffRemove(req, body);
    return json({ error: 'Endpoint desconhecido' }, 404);
  } catch (e) {
    // O detalhe vai para os logs, não para o visitante: as mensagens do Google
    // revelam o calendário e a service account.
    console.error(action, e);
    return json({ error: 'Não foi possível processar o pedido. Tente novamente.' }, 500);
  }
});
