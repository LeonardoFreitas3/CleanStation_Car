// O filtro decide que servicos aparecem na lista. Um valor que passe sem ser
// reconhecido nao da erro nenhum — devolve a lista errada, e quem esta a olhar
// nao tem como saber que esta a olhar para outra coisa.

import { parseFilter, nextStatus, IN_PROGRESS, SERVICE_FLOW, SERVICE_FILTERS } from './services';

describe('filtro vindo do endereco', () => {
  test('um filtro que existe passa tal e qual', () => {
    expect(parseFilter('por_cobrar')).toBe('por_cobrar');
    expect(parseFilter('todos')).toBe('todos');
  });

  // "Todos" e a vista com que a pagina abre. Com "Hoje" a abrir, um servico que
  // nao fosse de hoje parecia nao existir ate alguem carregar noutro filtro.
  test('sem ?filtro= abre em todos', () => {
    expect(parseFilter(null)).toBe('todos');
    expect(parseFilter('')).toBe('todos');
  });

  test('um valor inventado no endereco nao passa adiante', () => {
    expect(parseFilter('pagos')).toBe('todos');
    expect(parseFilter('POR_COBRAR')).toBe('todos');
    expect(parseFilter('por cobrar')).toBe('todos');
  });

  test('todos os filtros da lista sao aceites por ele', () => {
    for (const f of SERVICE_FILTERS) {
      expect(parseFilter(f.value)).toBe(f.value);
    }
  });
});

// O fluxo e um enum cuja ordem e a ordem do trabalho — ver o comentario da
// migracao 0001. Saltar um estado ou avancar um servico ja entregue nao e um
// erro visivel: e um carro que consta como estando noutra fase.

describe('proximo estado do servico', () => {
  test('avanca um degrau de cada vez', () => {
    expect(nextStatus('agendado')).toBe('recebido');
    expect(nextStatus('lavagem')).toBe('meio_lavagem');
    expect(nextStatus('concluido')).toBe('entregue');
  });

  test('entregue e o fim da linha', () => {
    expect(nextStatus('entregue')).toBeNull();
  });

  test('um servico cancelado nao avanca para lado nenhum', () => {
    expect(nextStatus('cancelado')).toBeNull();
  });
});

// O IN_PROGRESS ja foi `SERVICE_FLOW.slice(1, 8)`. Acrescentar uma fase ao meio
// do fluxo empurrava a janela e deixava as ultimas de fora do filtro "Em curso"
// — sem erro nenhum, so servicos a desaparecer da lista. Estes testes falham se
// alguem voltar a fixar indices.

describe('trabalho em curso', () => {
  test('nao conta o que ainda nao comecou nem o que ja acabou', () => {
    for (const fora of ['agendado', 'concluido', 'entregue', 'cancelado']) {
      expect(IN_PROGRESS).not.toContain(fora);
    }
  });

  test('conta todas as fases entre recebido e concluido, inclusive as ultimas', () => {
    for (const dentro of ['recebido', 'lavagem', 'meio_lavagem', 'protecao', 'controlo_qualidade']) {
      expect(IN_PROGRESS).toContain(dentro);
    }
  });

  test('cobre o fluxo todo sem buracos', () => {
    const inicio = SERVICE_FLOW.indexOf('recebido');
    const fim = SERVICE_FLOW.indexOf('concluido');
    expect(IN_PROGRESS).toEqual(SERVICE_FLOW.slice(inicio, fim));
    expect(IN_PROGRESS.length).toBe(fim - inicio);
  });
});
