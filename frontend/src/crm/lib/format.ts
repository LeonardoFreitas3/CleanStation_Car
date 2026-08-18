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

/** Normaliza para wa.me: so digitos, com indicativo de Portugal por omissao. */
export function whatsappNumber(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('351')) return digits;
  if (digits.length === 9) return `351${digits}`;
  return digits;
}
