// Fixa a tabela de preços contra a folha de referência manuscrita.
//
// Existe porque um preço trocado não rebenta nada: o site continua a funcionar
// e a cobrar mal, possivelmente durante semanas. Correr com `npm test`.

import {
  computeQuote, levelsFor, packsFor, priceFor, gradeForCount, VEHICLE_TYPES,
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

describe('packs de manutenção (2x mês)', () => {
  const PACKS = [
    ['carro',  { selante: 65,  premium: 105, detalhada: 220 }],
    ['grande', { selante: 95,  premium: 155, detalhada: 300 }],
    ['suv',    { selante: 75,  premium: 125, detalhada: 260 }],
  ];

  test.each(PACKS)('%s', (vehicle, esperado) => {
    const byLevel = Object.fromEntries(packsFor(vehicle).map((p) => [p.levelId, p.price]));
    expect(byLevel).toEqual(esperado);
  });

  it('não há packs para motas', () => {
    expect(packsFor('mota')).toHaveLength(0);
  });

  it('o pack é sempre mais barato que duas lavagens avulso', () => {
    for (const v of ['carro', 'grande', 'suv']) {
      for (const p of packsFor(v)) {
        expect(p.price).toBeLessThan(p.avulso);
        expect(p.saving).toBe(p.avulso - p.price);
      }
    }
  });
});

describe('grau de sujidade', () => {
  it.each([[0, 1], [1, 1], [2, 2], [3, 2], [4, 3], [9, 3]])(
    '%i problemas → grau %i',
    (count, grade) => expect(gradeForCount(count).grade).toBe(grade),
  );

  it('aplica o multiplicador ao preço do veículo escolhido', () => {
    // SUV detalhada = 160, grau 2 (2-3 problemas) = +30%
    const q = computeQuote({ vehicleId: 'suv', levelId: 'detalhada', problemIds: ['lixo', 'areia'] });
    expect(q.base).toBe(160);
    expect(q.grade).toBe(2);
    expect(q.total).toBeCloseTo(208);
  });

  it('não aplica grau a um pack: é preço fechado', () => {
    const pack = packsFor('carro').find((p) => p.levelId === 'premium');
    const q = computeQuote({ vehicleId: 'carro', pack, problemIds: ['lixo', 'areia', 'pelos', 'odor'] });
    expect(q.total).toBe(105);
    expect(q.isPack).toBe(true);
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
    // 6h é o serviço mais longo que ainda cabe entre as 08:00 e as 19:00
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
