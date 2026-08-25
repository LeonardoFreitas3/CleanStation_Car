// Testes do cálculo de horas livres.
//
// Correr com:  deno test supabase/functions/booking/slots.test.ts
//
// É a lógica que mais silenciosamente se estraga: um erro aqui não rebenta
// nada, apenas oferece ao cliente horas que já estão ocupadas.

import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { freeSlots, isClosed, lisbonOffset } from './slots.ts';

// Referência fixa, senão os testes mudam de resultado com o passar do dia.
// Véspera, e não o próprio dia: não se marca para hoje, portanto um "agora"
// no mesmo dia da marcação devolvia sempre zero vagas.
const AGORA = new Date('2026-09-13T06:00:00Z'); // domingo, 07:00 em Lisboa
const SEGUNDA = '2026-09-14';
const DOMINGO = '2026-09-13';

Deno.test('domingo está encerrado', () => {
  assertEquals(isClosed(DOMINGO), true);
  assertEquals(isClosed(SEGUNDA), false);
  assertEquals(freeSlots(DOMINGO, 60, [], AGORA), []);
});

Deno.test('hora de verão e de inverno dão deslocações diferentes', () => {
  assertEquals(lisbonOffset('2026-07-15'), '+01:00');
  assertEquals(lisbonOffset('2026-01-15'), '+00:00');
});

Deno.test('dia livre começa às 09:00 e a última cabe antes do fecho', () => {
  const slots = freeSlots(SEGUNDA, 60, [], AGORA);
  assertEquals(slots[0], '09:00');
  // Um serviço de 1h não pode começar depois das 19:00 se fecha às 20:00.
  assertEquals(slots[slots.length - 1], '19:00');
});

Deno.test('serviço longo não aparece se não couber até ao fecho', () => {
  const slots = freeSlots(SEGUNDA, 240, [], AGORA);
  assertEquals(slots[slots.length - 1], '16:00');
});

Deno.test('uma marcação existente bloqueia as horas que se sobrepõem', () => {
  const busy = [{ start: '2026-09-14T10:00:00+01:00', end: '2026-09-14T12:00:00+01:00' }];
  const slots = freeSlots(SEGUNDA, 60, busy, AGORA);

  // 09:00 termina às 10:00 — encosta mas não sobrepõe, portanto vale.
  assertEquals(slots.includes('09:00'), true);
  assertEquals(slots.includes('09:30'), false);
  assertEquals(slots.includes('10:00'), false);
  assertEquals(slots.includes('11:30'), false);
  assertEquals(slots.includes('12:00'), true);
});

Deno.test('não se marca para o próprio dia', () => {
  const hoje = new Date('2026-09-14T07:40:00Z');
  assertEquals(freeSlots(SEGUNDA, 60, [], hoje), []);
});

Deno.test('serviço da véspera que se estende bloqueia a manhã seguinte', () => {
  const busy = [{ start: '2026-09-13T22:00:00+01:00', end: '2026-09-14T10:00:00+01:00' }];
  const slots = freeSlots(SEGUNDA, 60, busy, AGORA);
  assertEquals(slots.includes('09:00'), false);
  assertEquals(slots.includes('09:30'), false);
  assertEquals(slots.includes('10:00'), true);
});

Deno.test('horario das definicoes manda no calculo', () => {
  const slots = freeSlots(SEGUNDA, 60, [], AGORA, { opens: 8, closes: 18 });
  assertEquals(slots[0], '08:00');
  assertEquals(slots[slots.length - 1], '17:00');
});

Deno.test('sem horario indicado vale o de omissao', () => {
  assertEquals(freeSlots(SEGUNDA, 60, [], AGORA)[0], '09:00');
});

Deno.test('dia inteiro e relativo ao horario, nao um numero fixo', () => {
  // 10h cabem num dia de 11h, mas num de 9h passam a ser servico de dia todo.
  assertEquals(freeSlots(SEGUNDA, 600, [], AGORA, { opens: 9, closes: 20 }).length > 1, true);
  assertEquals(freeSlots(SEGUNDA, 600, [], AGORA, { opens: 9, closes: 18 }), ['09:00']);
});
