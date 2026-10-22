// Fixa a tabela de preços contra a folha de referência manuscrita.
//
// Existe porque um preço trocado não rebenta nada: o site continua a funcionar
// e a cobrar mal, possivelmente durante semanas. Correr com `npm test`.

import {
  computeQuote, levelsFor, priceFor, VEHICLE_TYPES, LEVEL_BY_ID,
  durationFor, isFullDay, formatDuration, couponFor, DURATIONS,
} from './pricing';

describe('tabela de preços por tipo de veículo', () => {
  // [nível, carro, carrinha grande, SUV, mota] — undefined = não disponível
  const TABELA = [
    ['simples',           35,  45,  40,  35],
    ['premium',           75,  85,  80,  undefined],
    ['detalhada-parcial', 130, 150, 140, undefined],
    ['detalhada',         200, 240, 220, undefined],
  ];

  test.each(TABELA)('%s: carro %s, grande %s, suv %s, mota %s', (level, carro, grande, suv, mota) => {
    expect(priceFor('carro', level)).toBe(carro);
    expect(priceFor('grande', level)).toBe(grande);
    expect(priceFor('suv', level)).toBe(suv);
    expect(priceFor('mota', level)).toBe(mota);
  });

  it('mota só tem lavagem simples', () => {
    expect(levelsFor('mota').map((l) => l.id)).toEqual(['simples']);
  });

  it('os outros veículos têm os quatro níveis', () => {
    for (const id of ['carro', 'grande', 'suv']) {
      expect(levelsFor(id)).toHaveLength(4);
    }
  });

  it('a lavagem com selante já não existe à parte: está na Simples', () => {
    expect(priceFor('carro', 'selante')).toBeUndefined();
    expect(LEVEL_BY_ID.simples.nota).toBe('(Inclui selante)');
    expect(LEVEL_BY_ID.simples.includes).toContain('Selante aplicado na pintura');
  });

  // Cada área é um nível no catalogue.ts do servidor: um id aqui que lá não
  // exista dava "Serviço desconhecido" a quem tentasse marcar.
  it('a detalhada de uma área obriga a escolher interior ou exterior', () => {
    expect(LEVEL_BY_ID['detalhada-parcial'].areas.map((a) => a.id)).toEqual(['detalhada-interior', 'detalhada-exterior']);
  });
});

// Houve aqui um multiplicador por grau de sujidade, que subia o valor ate 75%
// conforme as caixas que o cliente assinalasse, e packs de duas lavagens por
// mes com preco fechado. Sairam os dois em agosto de 2026: o preco do site e o
// preco da tabela, e mais nada. Estes testes fixam isso — se um multiplicador
// ou um preco de pack voltarem por engano, param.

describe('orçamento', () => {
  it('é o preço de tabela do nível para aquele veículo, sem acréscimos', () => {
    const q = computeQuote({ vehicleId: 'suv', levelId: 'detalhada' });
    expect(q.base).toBe(220);
    expect(q.total).toBe(220);
  });

  it('o preço não muda com o que mais lhe passem', () => {
    const base = computeQuote({ vehicleId: 'carro', levelId: 'premium' }).total;
    expect(base).toBe(75);
    // Chamadas antigas ainda podem trazer problemIds ou um pack; nada disso
    // pode mexer no valor.
    expect(computeQuote({ vehicleId: 'carro', levelId: 'premium', problemIds: ['lixo', 'areia'] }).total)
      .toBe(base);
    expect(computeQuote({ vehicleId: 'carro', levelId: 'premium', pack: { price: 999 } }).total)
      .toBe(base);
  });

  it('nível indisponível para aquele veículo dá zero, não um valor inventado', () => {
    expect(computeQuote({ vehicleId: 'mota', levelId: 'detalhada' }).total).toBe(0);
  });
});

describe('durações por veículo', () => {
  // [nível, carro, carrinha grande, SUV, mota] — tempos da oficina, aproximados
  const TEMPOS = [
    ['simples', 90, 120, 105, 105],
    ['premium', 240, 360, 300, null],
    ['detalhada-parcial', 240, 360, 300, null],
    ['detalhada', 480, 720, 600, null],
  ];

  test.each(TEMPOS)('%s', (level, carro, grande, suv, mota) => {
    expect(durationFor('carro', level)).toBe(carro);
    expect(durationFor('grande', level)).toBe(grande);
    expect(durationFor('suv', level)).toBe(suv);
    if (mota !== null) expect(durationFor('mota', level)).toBe(mota);
  });

  // Os acréscimos por veículo são o que a agenda bloqueia: uma duração igual
  // para todos deixava uma carrinha grande a ocupar o tempo de um carro.
  it('veículos maiores demoram mais, nunca menos que o carro', () => {
    for (const [level, tempos] of Object.entries(DURATIONS)) {
      for (const v of ['grande', 'suv']) {
        if (tempos[v] !== undefined) expect([level, v, tempos[v] >= tempos.carro]).toEqual([level, v, true]);
      }
    }
    expect(durationFor('grande', 'premium')).toBeGreaterThan(durationFor('carro', 'premium'));
  });

  it('a detalhada do carro são 8 horas; em SUV e carrinha grande, mais', () => {
    expect(formatDuration(durationFor('carro', 'detalhada'))).toBe('8h');
    expect(isFullDay(durationFor('carro', 'detalhada'))).toBe(false);
    expect(durationFor('suv', 'detalhada')).toBe(600);
    expect(durationFor('grande', 'detalhada')).toBe(720);
  });

  it('mostra "Dia inteiro" em vez de 1440min', () => {
    expect(formatDuration(1440)).toBe('Dia inteiro');
    expect(formatDuration(105)).toBe('1h45');
    expect(formatDuration(240)).toBe('4h');
  });
});

describe('integridade dos dados', () => {
  it('todo o tipo de veículo tem pelo menos um nível com preço', () => {
    for (const v of VEHICLE_TYPES) {
      expect(levelsFor(v.id).length).toBeGreaterThan(0);
    }
  });

  it('um nível indisponível não devolve preço', () => {
    expect(priceFor('mota', 'detalhada')).toBeUndefined();
  });
});

describe('cupões', () => {
  it('TAFIXE tira 15% ao preço de tabela', () => {
    const q = computeQuote({ vehicleId: 'carro', levelId: 'simples', coupon: 'TAFIXE' });
    expect(q).toEqual({ base: 35, discount: 5.25, pct: 15, total: 29.75 });
  });

  it('o código aceita minúsculas e espaços à volta', () => {
    expect(couponFor('  tafixe ')).toBeDefined();
    expect(computeQuote({ vehicleId: 'suv', levelId: 'detalhada', coupon: ' tafixe' }).total).toBe(187);
  });

  it('código desconhecido ou vazio não mexe no preço', () => {
    expect(computeQuote({ vehicleId: 'carro', levelId: 'premium', coupon: 'NADA' }).total).toBe(75);
    expect(computeQuote({ vehicleId: 'carro', levelId: 'premium', coupon: '' }).discount).toBe(0);
    expect(computeQuote({ vehicleId: 'carro', levelId: 'premium' }).discount).toBe(0);
  });
});
