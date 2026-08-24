// A agenda erra em silencio: uma folga que nao aparece no dia certo continua a
// mostrar um ecra bonito, so que errado. Correr com `npm test`.

import { dayKey, timeOffDays, weekDays, weekStart } from './agenda';

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
