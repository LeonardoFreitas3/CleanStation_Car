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
import { applyCoupon, resolve } from './catalogue.ts';

Deno.test('preço por tipo de veículo, igual à tabela', () => {
  const tabela: Array<[string, string, number]> = [
    ['carro', 'simples', 35], ['grande', 'simples', 45], ['suv', 'simples', 35], ['mota', 'simples', 35],
    ['carro', 'premium', 75], ['grande', 'premium', 80], ['suv', 'premium', 75],
    ['carro', 'detalhada-interior', 130], ['grande', 'detalhada-interior', 130], ['suv', 'detalhada-interior', 130],
    ['carro', 'detalhada-exterior', 130], ['grande', 'detalhada-exterior', 130], ['suv', 'detalhada-exterior', 130],
    ['carro', 'detalhada', 200], ['grande', 'detalhada', 200], ['suv', 'detalhada', 200],
  ];

  for (const [veiculo, nivel, esperado] of tabela) {
    assertEquals(resolve(veiculo, nivel).price, esperado, `${veiculo}/${nivel}`);
  }
});

Deno.test('duração por tipo de veículo, tempos da oficina', () => {
  const tempos: Array<[string, string, number]> = [
    ['carro', 'simples', 90], ['grande', 'simples', 120], ['suv', 'simples', 105], ['mota', 'simples', 105],
    ['carro', 'premium', 240], ['grande', 'premium', 360], ['suv', 'premium', 300],
    ['carro', 'detalhada-interior', 240], ['carro', 'detalhada-exterior', 240],
    ['carro', 'detalhada', 480], ['grande', 'detalhada', 480], ['suv', 'detalhada', 480],
  ];

  for (const [veiculo, nivel, esperado] of tempos) {
    assertEquals(resolve(veiculo, nivel).duration, esperado, `${veiculo}/${nivel}`);
  }
});

Deno.test('a detalhada de uma área diz qual foi a área', () => {
  assertEquals(resolve('carro', 'detalhada-interior').label, 'Lavagem Detalhada Interior');
  assertEquals(resolve('carro', 'detalhada-exterior').label, 'Lavagem Detalhada Exterior');
  assertEquals(resolve('carro', 'detalhada').label, 'Lavagem Detalhada Interior + Exterior');
});

// O selante passou para dentro da Simples. Um pedido antigo com "selante"
// (uma página aberta antes da mudança) é recusado, não cobrado a outro preço.
Deno.test('a lavagem com selante já não existe à parte', () => {
  assertThrows(() => resolve('carro', 'selante'), Error, 'Serviço desconhecido');
});

// Estes dois são a razão de a função lançar em vez de devolver um valor por
// omissão: aceitar a combinação criava uma marcação impossível de cumprir, e a
// oficina só descobria quando a mota chegasse para uma lavagem detalhada.

Deno.test('uma mota só leva lavagem simples', () => {
  assertEquals(resolve('mota', 'simples').label, 'Lavagem Simples');
  for (const nivel of ['premium', 'detalhada-interior', 'detalhada-exterior', 'detalhada']) {
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

// Saíram em agosto de 2026, por decisão do negócio. Estavam escritos a dobrar,
// aqui e no pricing.js, e o sítio onde reaparecem por engano é este — é o que
// decide o valor cobrado.

Deno.test('o preço é o da tabela: não há multiplicador de sujidade nem packs', () => {
  const q = resolve('suv', 'detalhada');
  assertEquals(q.price, 200);
  // Os campos que devolve, e mais nenhum. Um grade ou um gradePct de volta
  // aparecem aqui — que é o sítio onde reaparecem por engano, porque é este
  // ficheiro que decide o valor cobrado.
  assertEquals(Object.keys(q).sort(), ['duration', 'label', 'price']);
});

// O cupão desconta sobre o preço de tabela, e é aqui que se decide: o site só
// mostra. Um código errado é recusado, não ignorado — senão o cliente marcava
// convencido de que tinha desconto e pagava o preço inteiro.

Deno.test('TAFIXE tira 15% ao preço de tabela', () => {
  assertEquals(applyCoupon(30, 'TAFIXE'), { code: 'TAFIXE', pct: 15, amount: 4.5, total: 25.5 });
  assertEquals(applyCoupon(200, ' tafixe ')?.total, 170);
});

Deno.test('sem cupão não há desconto; cupão errado é recusado', () => {
  assertEquals(applyCoupon(30, ''), null);
  assertEquals(applyCoupon(30, '   '), null);
  assertThrows(() => applyCoupon(30, 'NADA'), Error, 'Cupão inválido');
});
