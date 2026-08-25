// A agenda erra em silencio: uma folga que nao aparece no dia certo continua a
// mostrar um ecra bonito, so que errado. Correr com `npm test`.

import { dayKey, dayOccupancy, nextFreeHour, timeOffDays, weekDays, weekStart } from './agenda';

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
    expect(nextFreeHour(dia, [])).toBe('09:00');
  });

  test('propoe a seguir ao ultimo servico, nao ao primeiro', () => {
    expect(nextFreeHour(dia, [svc('09:00', 60), svc('14:00', 120)])).toBe('16:00');
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
    expect(nextFreeHour(dia, [svc('16:00', 240)])).toBe('20:00');
  });

  test('ignora servicos sem data em vez de rebentar', () => {
    expect(nextFreeHour(dia, [{ scheduled_at: null, duration_minutes: 60 }])).toBe('09:00');
  });
});

describe('ocupacao do dia', () => {
  // Segunda-feira. O horario e 09:00-20:00, portanto 660 minutos para vender.
  const seg = new Date('2026-08-24T00:00:00');
  const dom = new Date('2026-08-23T00:00:00');

  const vazia = { services: [], timeOff: [], blocks: [] };
  const svc = (hora, duracao, status = 'agendado') => ({
    scheduled_at: new Date(`2026-08-24T${hora}:00`).toISOString(),
    duration_minutes: duracao,
    status,
  });

  test('dia sem nada esta a zero', () => {
    expect(dayOccupancy(seg, vazia)).toEqual({ busy: 0, capacity: 660, pct: 0 });
  });

  test('domingo nao tem capacidade nenhuma', () => {
    expect(dayOccupancy(dom, vazia)).toEqual({ busy: 0, capacity: 0, pct: 0 });
  });

  test('conta os minutos do servico', () => {
    const o = dayOccupancy(seg, { ...vazia, services: [svc('10:00', 120)] });
    expect(o.busy).toBe(120);
    expect(o.pct).toBe(18);
  });

  test('servico sem duracao ocupa as duas horas por omissao', () => {
    expect(dayOccupancy(seg, { ...vazia, services: [svc('10:00', null)] }).busy).toBe(120);
  });

  test('cancelado nao ocupa a oficina', () => {
    expect(dayOccupancy(seg, { ...vazia, services: [svc('10:00', 120, 'cancelado')] }).busy).toBe(0);
  });

  test('sobreposicao nao conta duas vezes', () => {
    // Servico das 10 as 12 e folga das 11 as 13: tres horas tomadas, nao quatro.
    const o = dayOccupancy(seg, {
      ...vazia,
      services: [svc('10:00', 120)],
      timeOff: [{
        starts_at: new Date('2026-08-24T11:00:00').toISOString(),
        ends_at: new Date('2026-08-24T13:00:00').toISOString(),
      }],
    });
    expect(o.busy).toBe(180);
  });

  test('servico de dia inteiro nao passa da capacidade do dia', () => {
    const o = dayOccupancy(seg, { ...vazia, services: [svc('09:00', 1440)] });
    expect(o.busy).toBe(660);
    expect(o.pct).toBe(100);
  });

  test('o que cai fora do horario nao conta', () => {
    // Bloqueio das 06:00 as 10:00: so a hora entre as 09:00 e as 10:00 e da
    // oficina.
    const o = dayOccupancy(seg, {
      ...vazia,
      blocks: [{
        id: 'x',
        summary: 'Fornecedor',
        startIso: new Date('2026-08-24T06:00:00').toISOString(),
        endIso: new Date('2026-08-24T10:00:00').toISOString(),
      }],
    });
    expect(o.busy).toBe(60);
  });

  test('servico da vespera que se prolonga ocupa a manha seguinte', () => {
    const o = dayOccupancy(seg, {
      ...vazia,
      services: [{
        scheduled_at: new Date('2026-08-23T22:00:00').toISOString(),
        duration_minutes: 13 * 60,
        status: 'agendado',
      }],
    });
    expect(o.busy).toBe(120); // das 09:00 as 11:00
  });

  test('marcacao a dobrar mostra-se cheia e nao acima de cheia', () => {
    const o = dayOccupancy(seg, {
      ...vazia,
      services: [svc('09:00', 660), svc('10:00', 300)],
    });
    expect(o.pct).toBe(100);
  });
});
