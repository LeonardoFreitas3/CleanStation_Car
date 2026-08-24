// O slug e a chave estavel do catalogo: e por ele que o codigo do site fala de
// um servico. Gerado mal, cria uma linha que nada referencia — e isso nao da
// erro nenhum, so deixa de funcionar.

import { slugify } from './serviceTypes';

describe('slug do servico', () => {
  test('minusculas e hifens no lugar dos espacos', () => {
    expect(slugify('Lavagem Simples')).toBe('lavagem-simples');
  });

  test('tira os acentos em vez de os deixar cair no lixo', () => {
    expect(slugify('Higienização de Estofos')).toBe('higienizacao-de-estofos');
    expect(slugify('Proteção Cerâmica')).toBe('protecao-ceramica');
  });

  test('pontuacao e simbolos viram um hifen so', () => {
    expect(slugify('Polimento — Correção, 2 etapas')).toBe('polimento-correcao-2-etapas');
  });

  test('nao comeca nem acaba em hifen', () => {
    expect(slugify('  Lavagem!  ')).toBe('lavagem');
  });

  test('nome sem letras nem numeros da vazio, e quem chama tem de recusar', () => {
    expect(slugify('!!!')).toBe('');
  });
});
