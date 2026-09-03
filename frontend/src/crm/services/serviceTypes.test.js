// O slug e a chave estavel do catalogo: e por ele que o codigo do site fala de
// um servico. Gerado mal, cria uma linha que nada referencia — e isso nao da
// erro nenhum, so deixa de funcionar.

import { parseDuration, parseRepeatDays, slugify } from './serviceTypes';

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

// O prazo decide quem recebe email automatico. Um zero que passasse escrevia a
// toda a gente todos os dias; um "30 dias" que virasse NaN calava o lembrete
// sem dizer nada. Nenhum dos dois da erro visivel no ecra.

describe('prazo de repeticao', () => {
  test('vazio e so espacos querem dizer "nunca lembrar"', () => {
    expect(parseRepeatDays('')).toBeNull();
    expect(parseRepeatDays('   ')).toBeNull();
  });

  test('numero dentro dos limites passa, com espacos a volta', () => {
    expect(parseRepeatDays('30')).toBe(30);
    expect(parseRepeatDays(' 180 ')).toBe(180);
  });

  test('os extremos da 0024 sao aceites', () => {
    expect(parseRepeatDays('7')).toBe(7);
    expect(parseRepeatDays('730')).toBe(730);
  });

  test('fora dos limites e recusado antes de chegar a base de dados', () => {
    expect(() => parseRepeatDays('0')).toThrow();
    expect(() => parseRepeatDays('6')).toThrow();
    expect(() => parseRepeatDays('731')).toThrow();
    expect(() => parseRepeatDays('-30')).toThrow();
  });

  test('meio dia nao e um prazo', () => {
    expect(() => parseRepeatDays('30.5')).toThrow();
  });

  test('texto nao vira NaN em silencio', () => {
    expect(() => parseRepeatDays('trinta')).toThrow();
    expect(() => parseRepeatDays('30 dias')).toThrow();
  });
});

describe('duracao escrita nas definicoes', () => {
  test('vazio e sem duracao propria, nao zero minutos', () => {
    expect(parseDuration('')).toBeNull();
    expect(parseDuration('  ')).toBeNull();
  });

  test('minutos dentro dos limites passam', () => {
    expect(parseDuration('105')).toBe(105);
    expect(parseDuration(' 1440 ')).toBe(1440);
  });

  test('fora dos limites levanta, em vez de deixar a base de dados recusar', () => {
    // 10 minutos nao chega para lavar nada; 1500 passa das 24 horas.
    expect(() => parseDuration('10')).toThrow();
    expect(() => parseDuration('1500')).toThrow();
    expect(() => parseDuration('90.5')).toThrow();
    expect(() => parseDuration('duas horas')).toThrow();
  });
});
