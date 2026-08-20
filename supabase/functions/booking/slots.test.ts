// Testes do cálculo de horas livres.
//
// Correr com:  deno test supabase/functions/booking/slots.test.ts
//
// É a lógica que mais silenciosamente se estraga: um erro aqui não rebenta
// nada, apenas oferece ao cliente horas que já estão ocupadas.

import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { freeSlots, isClosed, lisbonOffset } from './slots.ts';

// Referência fixa, senão os testes mudam de resultado com o passar do dia.
const AGORA = new Date('2026-09-14T06:00:00Z'); // segunda, 07:00 em Lisboa
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

Deno.test('dia livre começa às 08:00 e a última cabe antes do fecho', () => {
  const slots = freeSlots(SEGUNDA, 60, [], AGORA);
  assertEquals(slots[0], '08:00');
  // Um serviço de 1h não pode começar depois das 18:00 se fecha às 19:00.
  assertEquals(slots[slots.length - 1], '18:00');
});

Deno.test('serviço longo não aparece se não couber até ao fecho', () => {
  const slots = freeSlots(SEGUNDA, 240, [], AGORA);
  assertEquals(slots[slots.length - 1], '15:00');
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

Deno.test('respeita a antecedência mínima de uma hora', () => {
  // 08:40 em Lisboa: 09:00 fica dentro da hora seguinte e não deve aparecer.
  const agora = new Date('2026-09-14T07:40:00Z');
  const slots = freeSlots(SEGUNDA, 60, [], agora);
  assertEquals(slots.includes('09:00'), false);
  assertEquals(slots.includes('09:30'), false);
  assertEquals(slots.includes('10:00'), true);
});

Deno.test('serviço da véspera que se estende bloqueia a manhã seguinte', () => {
  const busy = [{ start: '2026-09-13T22:00:00+01:00', end: '2026-09-14T09:00:00+01:00' }];
  const slots = freeSlots(SEGUNDA, 60, busy, AGORA);
  assertEquals(slots.includes('08:00'), false);
  assertEquals(slots.includes('08:30'), false);
  assertEquals(slots.includes('09:00'), true);
});
