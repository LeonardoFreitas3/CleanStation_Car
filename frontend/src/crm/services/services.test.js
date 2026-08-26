// O filtro decide que servicos aparecem na lista. Um valor que passe sem ser
// reconhecido nao da erro nenhum — devolve a lista errada, e quem esta a olhar
// nao tem como saber que esta a olhar para outra coisa.

import { parseFilter, nextStatus, SERVICE_FILTERS } from './services';

describe('filtro vindo do endereco', () => {
  test('um filtro que existe passa tal e qual', () => {
    expect(parseFilter('por_cobrar')).toBe('por_cobrar');
    expect(parseFilter('todos')).toBe('todos');
  });

  test('sem ?filtro= vale o de sempre', () => {
    expect(parseFilter(null)).toBe('hoje');
    expect(parseFilter('')).toBe('hoje');
  });

  test('um valor inventado no endereco nao passa adiante', () => {
    expect(parseFilter('pagos')).toBe('hoje');
    expect(parseFilter('POR_COBRAR')).toBe('hoje');
    expect(parseFilter('por cobrar')).toBe('hoje');
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
    expect(nextStatus('concluido')).toBe('entregue');
  });

  test('entregue e o fim da linha', () => {
    expect(nextStatus('entregue')).toBeNull();
  });

  test('um servico cancelado nao avanca para lado nenhum', () => {
    expect(nextStatus('cancelado')).toBeNull();
  });
});
