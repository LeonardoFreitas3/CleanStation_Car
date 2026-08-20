// Ligação à Edge Function que fala com o Google Calendar.
//
// As credenciais do Google vivem nos secrets do Supabase, nunca aqui: uma
// chave de service account no browser dava a qualquer visitante controlo do
// calendário. O frontend só conhece este endereço público.

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL ?? '';
const ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY ?? '';

export const isBookingConfigured = Boolean(SUPABASE_URL && ANON_KEY);

const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/booking`;

async function call(path, body) {
  const res = await fetch(`${FUNCTION_URL}/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ANON_KEY}`,
      apikey: ANON_KEY,
    },
    body: JSON.stringify(body),
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // Resposta sem JSON: a função caiu ou não está publicada.
  }

  if (!res.ok) {
    throw new Error(data?.error || 'Não foi possível contactar o servidor. Tente novamente.');
  }

  return data;
}

/**
 * Horas livres para um dia, já a contar com a duração do serviço escolhido.
 * A verificação real está do lado do servidor — isto é só o que se mostra.
 */
export async function fetchAvailability(dateIso, durationMinutes) {
  const data = await call('availability', { date: dateIso, duration: durationMinutes });
  return Array.isArray(data?.slots) ? data.slots : [];
}

/**
 * Cria a marcação: evento no Google Calendar e, em paralelo, cliente, viatura
 * e serviço no CRM.
 *
 * O servidor volta a verificar a disponibilidade antes de gravar. Entre ver
 * uma hora livre e carregar em confirmar podem passar minutos, e nesse
 * intervalo outra pessoa pode ter marcado.
 */
export async function createBooking(payload) {
  return call('create', payload);
}
