// A agenda erra em silencio: uma folga que nao aparece no dia certo continua a
// mostrar um ecra bonito, so que errado. Correr com `npm test`.

import { dayKey, dayOccupancy, monthDays, feriados, isEncerrado, nextFreeHour, posicaoNoDia, setHorario, timeOffDays, weekDays, weekStart, estadoDosBlocos } from './agenda';

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

describe('mes', () => {
  const grelha = (iso) => monthDays(local(iso)).map(dayKey);

  test('comeca na segunda antes do dia 1 e acaba no domingo depois do ultimo', () => {
    // Setembro de 2026: dia 1 e terca, dia 30 e quarta.
    const dias = grelha('2026-09-15T10:00:00');
    expect(dias[0]).toBe('2026-08-31');
    expect(dias[dias.length - 1]).toBe('2026-10-04');
    expect(dias.length % 7).toBe(0);
  });

  test('sem linha vazia a mais: fevereiro que comeca a segunda tem quatro semanas', () => {
    // 2027-02-01 e uma segunda e o mes tem 28 dias — cabe certinho.
    expect(grelha('2027-02-10T10:00:00').length).toBe(28);
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

describe('horario vindo das definicoes', () => {
  const seg = new Date('2026-08-24T00:00:00');
  const vazia = { services: [], timeOff: [], blocks: [] };

  // As definicoes sao globais ao modulo: sem isto, mudar o horario num teste
  // estragava os que corressem a seguir.
  afterEach(() => setHorario(9, 20));

  test('a capacidade do dia segue o horario', () => {
    setHorario(8, 18);
    expect(dayOccupancy(seg, vazia).capacity).toBe(600);
  });

  test('a hora sugerida arranca na abertura nova', () => {
    setHorario(7, 15);
    expect(nextFreeHour(seg, [])).toBe('07:00');
  });

  test('fechar antes de abrir e ignorado em vez de aceite', () => {
    setHorario(20, 9);
    expect(dayOccupancy(seg, vazia).capacity).toBe(660);
  });
});

// As mesmas datas estao fixadas em supabase/functions/booking/slots.test.ts. A
// conta existe dos dois lados, e sao estes testes que a impedem de derivar.
describe('feriados', () => {
  test('a Pascoa sai certa, e dela saem outros dois', () => {
    expect(feriados(2026).has('2026-04-05')).toBe(true); // domingo de Pascoa
    expect(feriados(2026).has('2026-04-03')).toBe(true); // Sexta-Feira Santa
    expect(feriados(2026).has('2026-06-04')).toBe(true); // Corpo de Deus
    expect(feriados(2027).has('2027-03-28')).toBe(true); // Pascoa do ano seguinte
  });

  test('os fixos e o de Braga', () => {
    expect(feriados(2026).has('2026-12-25')).toBe(true);
    expect(feriados(2026).has('2026-06-24')).toBe(true); // Sao Joao
    expect(feriados(2026).has('2026-07-15')).toBe(false);
  });

  test('o Natal de 2026 e sexta-feira e mesmo assim esta encerrado', () => {
    const natal = new Date('2026-12-25T00:00:00');
    expect(natal.getDay()).toBe(5);
    expect(isEncerrado(natal)).toBe(true);
  });

  test('feriado nao conta como dia por vender', () => {
    const vazia = { services: [], timeOff: [], blocks: [] };
    expect(dayOccupancy(new Date('2026-12-25T00:00:00'), vazia).capacity).toBe(0);
    expect(dayOccupancy(new Date('2026-12-22T00:00:00'), vazia).capacity).toBe(660);
  });
});

// A agenda mostra-se na mesma sem os bloqueios do Google — sao um extra. Mas as
// duas maneiras de eles faltarem pedem coisas diferentes a quem esta a olhar:
// uma passa sozinha, a outra so passa com um deploy. Em silencio eram iguais, e
// a agenda ficava com bom aspeto a esconder ocupacao.

describe('porque e que os bloqueios do Google faltam', () => {
  test('resposta boa e resposta boa', () => {
    expect(estadoDosBlocos(200)).toBe('ok');
    expect(estadoDosBlocos(204)).toBe('ok');
  });

  test('404 e a funcao publicada nao conhecer o endpoint: so um deploy resolve', () => {
    expect(estadoDosBlocos(404)).toBe('por-publicar');
  });

  test('o resto e passageiro, e tentar outra vez resolve', () => {
    expect(estadoDosBlocos(500)).toBe('indisponivel');
    expect(estadoDosBlocos(502)).toBe('indisponivel');
    // Sessao expirada: nao e o Google que esta em baixo, mas tambem nao pede
    // um deploy — pede voltar a entrar, e recarregar ja mostra isso.
    expect(estadoDosBlocos(401)).toBe('indisponivel');
    expect(estadoDosBlocos(400)).toBe('indisponivel');
  });

  test('sem resposta nenhuma tambem e passageiro', () => {
    expect(estadoDosBlocos(null)).toBe('indisponivel');
  });
});

// Onde cada bloco cai na coluna do dia, no calendario da semana. Errar aqui nao
// da erro nenhum: desenha o servico a hora errada, e quem olha para a agenda
// acredita nela.

describe('posicao de um bloco na coluna do dia', () => {
  // 09:00 as 20:00 sao onze horas de coluna.
  const dia = new Date('2026-08-27T00:00:00');

  test('uma lavagem das 10 as 12 comeca a um onze avos e ocupa dois', () => {
    const p = posicaoNoDia('2026-08-27T10:00:00', '2026-08-27T12:00:00', dia);
    expect(p.top).toBeCloseTo(100 / 11, 4);
    expect(p.height).toBeCloseTo(200 / 11, 4);
  });

  test('a abertura fica no topo', () => {
    expect(posicaoNoDia('2026-08-27T09:00:00', '2026-08-27T10:00:00', dia).top).toBe(0);
  });

  test('um servico de dia inteiro enche a coluna', () => {
    const p = posicaoNoDia('2026-08-27T00:00:00', '2026-08-28T00:00:00', dia);
    expect(p.top).toBe(0);
    expect(p.height).toBe(100);
  });

  // Cortar em vez de recusar: uma detalhada dura 24h e uma folga de tres dias
  // atravessa a noite. As duas ocupam o que der em cada dia.
  test('o que atravessa a noite e cortado a janela de cada dia', () => {
    const p = posicaoNoDia('2026-08-27T18:00:00', '2026-08-28T12:00:00', dia);
    expect(p.top).toBeCloseTo(900 / 11, 4);
    expect(p.height).toBeCloseTo(200 / 11, 4);
  });

  test('fora do horario nao tem sitio na coluna', () => {
    expect(posicaoNoDia('2026-08-27T03:00:00', '2026-08-27T05:00:00', dia)).toBeNull();
    expect(posicaoNoDia('2026-08-27T21:00:00', '2026-08-27T22:00:00', dia)).toBeNull();
  });

  test('encostado ao fecho, sem duracao dentro do dia, tambem nao', () => {
    expect(posicaoNoDia('2026-08-27T20:00:00', '2026-08-27T23:00:00', dia)).toBeNull();
  });

  test('um bloco de outro dia nao aparece nesta coluna', () => {
    expect(posicaoNoDia('2026-08-25T10:00:00', '2026-08-25T12:00:00', dia)).toBeNull();
  });
});
