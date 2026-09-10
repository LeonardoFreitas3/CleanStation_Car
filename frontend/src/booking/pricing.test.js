// Fixa a tabela de preços contra a folha de referência manuscrita.
//
// Existe porque um preço trocado não rebenta nada: o site continua a funcionar
// e a cobrar mal, possivelmente durante semanas. Correr com `npm test`.

import {
  computeQuote, levelsFor, priceFor, VEHICLE_TYPES,
  durationFor, isFullDay, formatDuration,
} from './pricing';

describe('tabela de preços por tipo de veículo', () => {
  // [nível, carro, carrinha grande, SUV, mota] — undefined = não disponível
  const TABELA = [
    ['simples',   30,  45,  35,  30],
    ['selante',   40,  55,  45,  undefined],
    ['premium',   65,  80,  75,  undefined],
    ['detalhada', 140, 180, 160, undefined],
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
});

// Houve aqui um multiplicador por grau de sujidade, que subia o valor ate 75%
// conforme as caixas que o cliente assinalasse, e packs de duas lavagens por
// mes com preco fechado. Sairam os dois em agosto de 2026: o preco do site e o
// preco da tabela, e mais nada. Estes testes fixam isso — se um multiplicador
// ou um preco de pack voltarem por engano, param.

describe('orçamento', () => {
  it('é o preço de tabela do nível para aquele veículo, sem acréscimos', () => {
    const q = computeQuote({ vehicleId: 'suv', levelId: 'detalhada' });
    expect(q.base).toBe(160);
    expect(q.total).toBe(160);
  });

  it('o preço não muda com o que mais lhe passem', () => {
    const base = computeQuote({ vehicleId: 'carro', levelId: 'selante' }).total;
    expect(base).toBe(40);
    // Chamadas antigas ainda podem trazer problemIds ou um pack; nada disso
    // pode mexer no valor.
    expect(computeQuote({ vehicleId: 'carro', levelId: 'selante', problemIds: ['lixo', 'areia'] }).total)
      .toBe(base);
    expect(computeQuote({ vehicleId: 'carro', levelId: 'selante', pack: { price: 999 } }).total)
      .toBe(base);
  });

  it('nível indisponível para aquele veículo dá zero, não um valor inventado', () => {
    expect(computeQuote({ vehicleId: 'mota', levelId: 'detalhada' }).total).toBe(0);
  });
});

describe('durações por veículo', () => {
  // [nível, carro, carrinha grande, SUV, mota] — tempos reais da oficina
  const TEMPOS = [
    ['simples', 90, 120, 105, 105],
    ['selante', 105, 135, 120, null],
    ['premium', 240, 360, 300, null],
    ['detalhada', 1440, 1440, 1440, null],
  ];

  test.each(TEMPOS)('%s', (level, carro, grande, suv, mota) => {
    expect(durationFor('carro', level)).toBe(carro);
    expect(durationFor('grande', level)).toBe(grande);
    expect(durationFor('suv', level)).toBe(suv);
    if (mota !== null) expect(durationFor('mota', level)).toBe(mota);
  });

  it('só a detalhada ocupa o dia inteiro', () => {
    expect(isFullDay(durationFor('carro', 'detalhada'))).toBe(true);
    // 6h é o serviço mais longo que ainda cabe entre as 09:00 e as 20:00
    expect(isFullDay(durationFor('grande', 'premium'))).toBe(false);
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
