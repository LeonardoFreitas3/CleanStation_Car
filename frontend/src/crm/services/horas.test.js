// A folha de horas erra em silencio: um total mal somado nao da erro nenhum,
// paga-se a mais ou a menos a alguem e so se descobre ao fim do mes. Correr
// com `npm test`.

import { acoes, fase, horaLocal, horas, totalDaSemana } from './horas';

const turno = (campos) => ({
  id: 'x', profile_id: 'p', full_name: 'Alguém', work_date: '2026-09-07',
  started_at: null, break_started_at: null, break_ended_at: null, ended_at: null,
  note: null, worked_minutes: null, break_minutes: null, ...campos,
});

const as = (hhmm) => new Date(`2026-09-07T${hhmm}:00`).toISOString();

describe('em que ponto do dia se esta', () => {
  test('sem linha nenhuma, ainda nao entrou', () => {
    expect(fase(null)).toBe('por-entrar');
    expect(fase(undefined)).toBe('por-entrar');
  });

  // Uma linha criada por uma correcao do administrador pode existir sem
  // entrada. Nao e um dia comecado — e um dia em branco.
  test('linha sem entrada tambem e "por entrar"', () => {
    expect(fase(turno({}))).toBe('por-entrar');
  });

  test('entrou e ainda ca esta', () => {
    expect(fase(turno({ started_at: as('09:00') }))).toBe('a-trabalhar');
  });

  test('foi almocar', () => {
    expect(fase(turno({ started_at: as('09:00'), break_started_at: as('12:30') }))).toBe('em-pausa');
  });

  test('voltou do almoco', () => {
    expect(fase(turno({
      started_at: as('09:00'), break_started_at: as('12:30'), break_ended_at: as('13:30'),
    }))).toBe('a-trabalhar');
  });

  // A saida manda sobre tudo o resto: quem se esqueceu de voltar a picar do
  // almoco e depois picou a saida tem o dia fechado, e nao em pausa para sempre.
  test('saiu, mesmo com o almoco por fechar', () => {
    expect(fase(turno({
      started_at: as('09:00'), break_started_at: as('12:30'), ended_at: as('18:00'),
    }))).toBe('terminado');
  });
});

describe('o que se pode fazer a seguir', () => {
  test('cada fase oferece so o que faz sentido', () => {
    expect(acoes('por-entrar')).toEqual(['entrada']);
    expect(acoes('a-trabalhar')).toEqual(['pausa', 'saida']);
    expect(acoes('em-pausa')).toEqual(['regresso']);
    expect(acoes('terminado')).toEqual([]);
  });

  // O check da 0031 recusa uma saida sem entrada. O botao nao a pode oferecer,
  // senao o funcionario leva com um erro de constraint a cara.
  test('nunca ha saida antes de haver entrada', () => {
    expect(acoes('por-entrar')).not.toContain('saida');
    expect(acoes('em-pausa')).not.toContain('saida');
  });
});

describe('horas em texto', () => {
  test('minutos certos nao mostram os zeros', () => {
    expect(horas(480)).toBe('8h');
    expect(horas(60)).toBe('1h');
  });

  test('com minutos, dois digitos', () => {
    expect(horas(450)).toBe('7h30');
    expect(horas(485)).toBe('8h05');
  });

  // Zero e "esteve ca e nao fez nada"; null e "ainda nao se sabe". Sao coisas
  // diferentes e a folha tem de as mostrar diferentes.
  test('zero e zero, mas sem numero e um travessao', () => {
    expect(horas(0)).toBe('0h');
    expect(horas(null)).toBe('—');
    expect(horas(undefined)).toBe('—');
  });
});

describe('total da semana', () => {
  test('soma os dias fechados', () => {
    const t = totalDaSemana([
      turno({ started_at: as('09:00'), ended_at: as('18:00'), worked_minutes: 480 }),
      turno({ started_at: as('09:00'), ended_at: as('17:00'), worked_minutes: 420 }),
    ]);
    expect(t).toEqual({ minutos: 900, porFechar: 0 });
  });

  // O dia por fechar nao pode entrar no total como zero sem se dizer nada: o
  // administrador via 8h numa semana de dois dias e nao sabia porque.
  test('um dia por fechar conta-se a parte e nao soma horas', () => {
    const t = totalDaSemana([
      turno({ started_at: as('09:00'), ended_at: as('18:00'), worked_minutes: 480 }),
      turno({ started_at: as('09:00') }),
    ]);
    expect(t).toEqual({ minutos: 480, porFechar: 1 });
  });

  // Uma linha em branco — criada por uma correcao e deixada vazia — nao e um
  // dia por fechar: ninguem esta a espera de a fechar.
  test('linha sem entrada nenhuma nao conta como por fechar', () => {
    expect(totalDaSemana([turno({})])).toEqual({ minutos: 0, porFechar: 0 });
  });

  test('semana sem nada da zero e nao NaN', () => {
    expect(totalDaSemana([])).toEqual({ minutos: 0, porFechar: 0 });
  });
});

describe('hora para as caixas de correcao', () => {
  test('sai no formato que o input type=time aceita', () => {
    expect(horaLocal(as('09:05'))).toBe('09:05');
    expect(horaLocal(as('13:30'))).toBe('13:30');
  });

  test('sem marca, campo vazio — e o vazio e que apaga a marca', () => {
    expect(horaLocal(null)).toBe('');
  });
});
