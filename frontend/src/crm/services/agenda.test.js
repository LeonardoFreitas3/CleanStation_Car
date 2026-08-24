// A agenda erra em silencio: uma folga que nao aparece no dia certo continua a
// mostrar um ecra bonito, so que errado. Correr com `npm test`.

import { dayKey, nextFreeHour, timeOffDays, weekDays, weekStart } from './agenda';

const local = (s) => new Date(s);

describe('semana', () => {
  test('comeca a segunda, seja qual for o dia da ancora', () => {
    // 2026-08-24 e uma segunda.
    for (const d of ['2026-08-24', '2026-08-27', '2026-08-30']) {
      expect(dayKey(weekStart(local(`${d}T15:00:00`)))).toBe('2026-08-24');
    }
  });

  test('sete dias, de segunda a domingo', () => {
    const days = weekDays(local('2026-08-26T09:00:00')).map(dayKey);
    expect(days).toEqual([
      '2026-08-24', '2026-08-25', '2026-08-26', '2026-08-27',
      '2026-08-28', '2026-08-29', '2026-08-30',
    ]);
  });

  test('atravessa a mudanca de mes', () => {
    expect(weekDays(local('2026-09-01T09:00:00')).map(dayKey)).toEqual([
      '2026-08-31', '2026-09-01', '2026-09-02', '2026-09-03',
      '2026-09-04', '2026-09-05', '2026-09-06',
    ]);
  });
});

describe('dias que uma folga ocupa', () => {
  const off = (starts, ends) => timeOffDays({
    starts_at: local(starts).toISOString(),
    ends_at: local(ends).toISOString(),
  });

  test('folga de horas conta um dia so', () => {
    expect(off('2026-08-25T08:00:00', '2026-08-25T13:00:00')).toEqual(['2026-08-25']);
  });

  test('folga de tres dias aparece nos tres', () => {
    expect(off('2026-08-25T00:00:00', '2026-08-28T00:00:00'))
      .toEqual(['2026-08-25', '2026-08-26', '2026-08-27']);
  });

  test('o fim a meia-noite nao acrescenta o dia seguinte', () => {
    expect(off('2026-08-25T00:00:00', '2026-08-26T00:00:00')).toEqual(['2026-08-25']);
  });
});

describe('hora sugerida ao marcar a partir da agenda', () => {
  const dia = new Date('2026-08-25T00:00:00');
  const svc = (hora, duracao) => ({
    scheduled_at: new Date(`2026-08-25T${hora}:00`).toISOString(),
    duration_minutes: duracao,
  });

  test('dia vazio propoe a abertura', () => {
    expect(nextFreeHour(dia, [])).toBe('08:00');
  });

  test('propoe a seguir ao ultimo servico, nao ao primeiro', () => {
    expect(nextFreeHour(dia, [svc('08:00', 60), svc('14:00', 120)])).toBe('16:00');
  });

  test('arredonda para a meia hora seguinte', () => {
    expect(nextFreeHour(dia, [svc('09:00', 50)])).toBe('10:00');
    expect(nextFreeHour(dia, [svc('09:00', 45)])).toBe('10:00');
    expect(nextFreeHour(dia, [svc('09:00', 30)])).toBe('09:30');
  });

  test('servico sem duracao ocupa as duas horas por omissao', () => {
    expect(nextFreeHour(dia, [svc('10:00', null)])).toBe('12:00');
  });

  test('dia cheio nao salta para o dia seguinte', () => {
    expect(nextFreeHour(dia, [svc('16:00', 240)])).toBe('19:00');
  });

  test('ignora servicos sem data em vez de rebentar', () => {
    expect(nextFreeHour(dia, [{ scheduled_at: null, duration_minutes: 60 }])).toBe('08:00');
  });
});
