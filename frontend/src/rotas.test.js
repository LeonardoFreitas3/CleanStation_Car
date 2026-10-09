// Os enderecos das duas linguas: um /en a mais ou a menos nao da erro nenhum,
// so manda o Google a uma pagina que nao existe.

import { ancora, idiomaDe, inicio, pagina, traduzir } from './rotas';
import { COMPARACAO, WASH_LEVELS } from './booking/pricing';

describe('rotas', () => {
  test('o portugues vive na raiz e o ingles em /en', () => {
    expect(inicio('pt')).toBe('/');
    expect(inicio('en')).toBe('/en/');
    expect(pagina('pt', 'lavagem-premium-braga')).toBe('/lavagem-premium-braga/');
    expect(pagina('en', 'lavagem-premium-braga', '#traseiros')).toBe('/en/lavagem-premium-braga/#traseiros');
    expect(ancora('en', '#services')).toBe('/en/#services');
  });

  test('a lingua le-se do endereco', () => {
    expect(idiomaDe('/')).toBe('pt');
    expect(idiomaDe('/en')).toBe('en');
    expect(idiomaDe('/en/lavagem-premium-braga/')).toBe('en');
    expect(idiomaDe('/english-braga/')).toBe('pt');
  });

  test('traduzir e ir ao mesmo sitio na outra lingua, nas duas direcoes', () => {
    expect(traduzir('/lavagem-premium-braga/', 'en')).toBe('/en/lavagem-premium-braga/');
    expect(traduzir('/en/lavagem-premium-braga/', 'pt')).toBe('/lavagem-premium-braga/');
    expect(traduzir('/en', 'pt')).toBe('/');
    expect(traduzir('/', 'en')).toBe('/en/');
    expect(traduzir('/en/', 'en')).toBe('/en/');
  });
});

// A tabela de comparacao e o que responde a "qual a diferenca?". Uma lavagem
// sem a primeira linha era uma lavagem a dizer que nao limpa o carro.
describe('comparacao das lavagens', () => {
  test('todas incluem interior e exterior, e cada nivel acrescenta ao anterior', () => {
    const ids = WASH_LEVELS.map((l) => l.id);
    expect(COMPARACAO[0].niveis).toEqual(ids);
    for (const linha of COMPARACAO) {
      for (const n of linha.niveis) expect(ids).toContain(n);
    }
    const conta = (id) => COMPARACAO.filter((l) => l.niveis.includes(id)).length;
    expect(conta('premium')).toBeGreaterThan(conta('selante'));
    expect(conta('detalhada')).toBeGreaterThan(conta('premium'));
  });
});
