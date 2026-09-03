const EUR = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' });
const DATE = new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });

export function eur(value: number | null | undefined): string {
  return EUR.format(Number(value ?? 0));
}

export function date(iso: string | null | undefined): string {
  if (!iso) return '—';
  return DATE.format(new Date(iso));
}

/** "há 3 dias", para o utilizador nao ter de fazer a conta de cabeca. */
export function daysAgo(days: number | null | undefined): string {
  if (days === null || days === undefined) return 'Nunca';
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Ontem';
  if (days < 30) return `Há ${days} dias`;
  const months = Math.floor(days / 30);
  if (months < 12) return `Há ${months} ${months === 1 ? 'mês' : 'meses'}`;
  const years = Math.floor(months / 12);
  return `Há ${years} ${years === 1 ? 'ano' : 'anos'}`;
}

/**
 * Duracao em minutos, escrita como se fala: 90 -> "1h30", 45 -> "45min".
 *
 * A partir das 11 horas e "Dia inteiro": e o horario da oficina de ponta a
 * ponta, e "11h" nao diz mais nada a quem esta a olhar para a agenda.
 */
export function duracao(minutes: number | null | undefined): string {
  if (!minutes) return '';
  if (minutes >= 660) return 'Dia inteiro';
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const min = minutes % 60;
  return min ? `${h}h${String(min).padStart(2, '0')}` : `${h}h`;
}

/** Normaliza para wa.me: so digitos, com indicativo de Portugal por omissao. */
export function whatsappNumber(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('351')) return digits;
  if (digits.length === 9) return `351${digits}`;
  return digits;
}
