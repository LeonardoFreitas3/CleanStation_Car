// Fixa o catálogo do servidor contra a folha de referência.
//
// Existe porque este é o ficheiro que **decide** o preço — o pricing.js do site
// só mostra. Um valor trocado aqui não rebenta nada: o site continua a marcar e
// a cobrar mal, e a diferença só aparece quando alguém compara a fatura com a
// tabela, possivelmente semanas depois.
//
// A duplicação com o pricing.js é deliberada (uma função Deno não importa do
// frontend), e é por isso que os dois lados têm testes com os mesmos números:
// se um derivar, o vermelho aparece aqui e não na caixa da oficina.
//
//   npx --yes deno@2 test supabase/functions/booking/catalogue.test.ts

import { assertEquals, assertThrows } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { resolve } from './catalogue.ts';

Deno.test('preço por tipo de veículo, igual à tabela', () => {
  const tabela: Array<[string, string, number]> = [
    ['carro', 'simples', 30], ['grande', 'simples', 45], ['suv', 'simples', 35], ['mota', 'simples', 30],
    ['carro', 'selante', 40], ['grande', 'selante', 55], ['suv', 'selante', 45],
    ['carro', 'premium', 65], ['grande', 'premium', 80], ['suv', 'premium', 75],
    ['carro', 'detalhada', 140], ['grande', 'detalhada', 180], ['suv', 'detalhada', 160],
  ];

  for (const [veiculo, nivel, esperado] of tabela) {
    assertEquals(resolve(veiculo, nivel).price, esperado, `${veiculo}/${nivel}`);
  }
});

Deno.test('duração por tipo de veículo, tempos reais da oficina', () => {
  const tempos: Array<[string, string, number]> = [
    ['carro', 'simples', 90], ['grande', 'simples', 120], ['suv', 'simples', 105], ['mota', 'simples', 105],
    ['carro', 'selante', 105], ['grande', 'selante', 135], ['suv', 'selante', 120],
    ['carro', 'premium', 240], ['grande', 'premium', 360], ['suv', 'premium', 300],
  ];

  for (const [veiculo, nivel, esperado] of tempos) {
    assertEquals(resolve(veiculo, nivel).duration, esperado, `${veiculo}/${nivel}`);
  }
});

Deno.test('a detalhada ocupa o dia inteiro em qualquer veículo', () => {
  for (const v of ['carro', 'grande', 'suv']) {
    assertEquals(resolve(v, 'detalhada').duration, 1440, v);
  }
});

// Estes dois são a razão de a função lançar em vez de devolver um valor por
// omissão: aceitar a combinação criava uma marcação impossível de cumprir, e a
// oficina só descobria quando a mota chegasse para uma lavagem detalhada.

Deno.test('uma mota só leva lavagem simples', () => {
  assertEquals(resolve('mota', 'simples').label, 'Lavagem Simples');
  for (const nivel of ['selante', 'premium', 'detalhada']) {
    assertThrows(() => resolve('mota', nivel), Error, 'não disponível', nivel);
  }
});

Deno.test('um nível que não existe é recusado, não adivinhado', () => {
  assertThrows(() => resolve('carro', 'ceramica'), Error, 'Serviço desconhecido');
  assertThrows(() => resolve('carro', ''), Error, 'Serviço desconhecido');
});

Deno.test('um tipo de veículo que não existe é recusado', () => {
  assertThrows(() => resolve('camiao', 'simples'), Error, 'não disponível');
  assertThrows(() => resolve('', 'simples'), Error, 'não disponível');
});

// O multiplicador de sujidade saiu em agosto de 2026, por decisão do negócio.
// Os packs saíram com ele e voltaram em setembro, e por isso levam tabela
// própria aqui em baixo: este é o ficheiro que decide o valor cobrado, e é
// nele que um preço errado passa despercebido mais tempo.

Deno.test('o preço é o da tabela: não há multiplicador de sujidade', () => {
  const q = resolve('suv', 'detalhada');
  assertEquals(q.price, 160);
  // Os campos que devolve, e mais nenhum: um grade ou um gradePct de volta
  // aparecem aqui.
  assertEquals(Object.keys(q).sort(), ['duration', 'label', 'price']);
});

Deno.test('pack: preço fechado das duas lavagens por mês', () => {
  const tabela: Array<[string, string, number]> = [
    ['carro', 'selante',   65],  ['grande', 'selante',   95],  ['suv', 'selante',   75],
    ['carro', 'premium',   105], ['grande', 'premium',   155], ['suv', 'premium',   125],
    ['carro', 'detalhada', 220], ['grande', 'detalhada', 300], ['suv', 'detalhada', 260],
  ];

  for (const [veiculo, nivel, esperado] of tabela) {
    assertEquals(resolve(veiculo, nivel, true).price, esperado, `${veiculo}/${nivel}`);
  }
});

// O pack são duas lavagens, mas a marcação é de uma: se a duração vier a
// dobrar, a agenda fecha o dia a um serviço que cabia lá duas vezes.
Deno.test('o pack não mexe na duração', () => {
  for (const nivel of ['selante', 'premium', 'detalhada']) {
    assertEquals(resolve('carro', nivel, true).duration, resolve('carro', nivel).duration, nivel);
  }
});

Deno.test('não há pack de lavagem simples nem para motas', () => {
  assertThrows(() => resolve('carro', 'simples', true), Error, 'Não existe pack');
  assertThrows(() => resolve('mota', 'simples', true), Error, 'Não existe pack');
});
