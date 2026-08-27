// Fusos e mudança da hora, que é onde estas contas se enganam.
//
// A função corre num agendador, em infraestrutura que pode estar noutro
// continente, e decide **que dia** é que os clientes vão ser avisados. Errar
// aqui não dá erro nenhum: manda o email do dia errado, ou não manda nenhum, e
// só se dá por isso quando alguém não aparece.
//
//   npx --yes deno@2 test supabase/functions/lembretes/datas.test.ts

import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { amanhaEmLisboa, dataCurta, haQuanto, hora } from './datas.ts';

Deno.test('no inverno, Lisboa está em UTC e o dia começa à meia-noite UTC', () => {
  // 15 de janeiro, meio-dia. Amanhã é 16.
  const r = amanhaEmLisboa(new Date('2026-01-15T12:00:00Z'));
  assertEquals(r.dia, '2026-01-16');
  assertEquals(r.de, '2026-01-16T00:00:00.000Z');
  assertEquals(r.ate, '2026-01-17T00:00:00.000Z');
});

Deno.test('no verão, Lisboa está uma hora à frente e o dia começa às 23:00 UTC', () => {
  // 15 de julho, meio-dia. Amanhã é 16, e a meia-noite de Lisboa do dia 16 é
  // as 23:00 UTC do dia 15.
  const r = amanhaEmLisboa(new Date('2026-07-15T12:00:00Z'));
  assertEquals(r.dia, '2026-07-16');
  assertEquals(r.de, '2026-07-15T23:00:00.000Z');
  assertEquals(r.ate, '2026-07-16T23:00:00.000Z');
});

// A razão de a função existir. Com o fuso do servidor, às 23:30 de Lisboa já é
// o dia seguinte em UTC, e "amanhã" saltava um dia inteiro — os clientes de
// amanhã não eram avisados e os de depois de amanhã eram avisados cedo demais.

Deno.test('às 23:30 de Lisboa, amanhã ainda é amanhã', () => {
  // 23:30 em Lisboa no inverno = 23:30 UTC do mesmo dia.
  const inverno = amanhaEmLisboa(new Date('2026-01-15T23:30:00Z'));
  assertEquals(inverno.dia, '2026-01-16');

  // 23:30 em Lisboa no verão = 22:30 UTC. Em UTC ainda é dia 15; em Lisboa
  // também, e amanhã é 16.
  const verao = amanhaEmLisboa(new Date('2026-07-15T22:30:00Z'));
  assertEquals(verao.dia, '2026-07-16');
});

Deno.test('às 00:30 de Lisboa, amanhã é o dia seguinte ao que já começou', () => {
  // 00:30 UTC de 16 de janeiro = 00:30 em Lisboa. Hoje é 16, amanhã é 17.
  const r = amanhaEmLisboa(new Date('2026-01-16T00:30:00Z'));
  assertEquals(r.dia, '2026-01-17');
});

// ── Os dois dias do ano em que a hora muda ──────────────────────────────────
//
// Em Portugal os relógios mudam à 01:00 UTC do último domingo de março e de
// outubro. A deslocação é lida ao meio-dia daquele dia, portanto nestes dois
// dias o intervalo fica uma hora ao lado.
//
// Estes testes fixam o comportamento **real**, não o ideal, e o comentário do
// datas.ts explica porque é que se pode viver com ele: a folga cai entre as
// 23:00 e as 01:00, com a oficina fechada, e nenhuma marcação existe aí. Se o
// horário passar a ser de 24 horas, estes dois testes é que dizem o que se
// partiu.

Deno.test('o dia em que os relógios avançam (29 de março de 2026)', () => {
  const r = amanhaEmLisboa(new Date('2026-03-28T12:00:00Z'));
  assertEquals(r.dia, '2026-03-29');
  // Uma hora cedo: a meia-noite de Lisboa do dia 29 ainda é UTC+0, mas ao
  // meio-dia já é UTC+1, e é essa a deslocação usada.
  assertEquals(r.de, '2026-03-28T23:00:00.000Z');
  assertEquals(r.ate, '2026-03-29T23:00:00.000Z');
});

Deno.test('o dia em que os relógios recuam (25 de outubro de 2026)', () => {
  const r = amanhaEmLisboa(new Date('2026-10-24T12:00:00Z'));
  assertEquals(r.dia, '2026-10-25');
  // Uma hora tarde, pela razão inversa.
  assertEquals(r.de, '2026-10-25T00:00:00.000Z');
  assertEquals(r.ate, '2026-10-26T00:00:00.000Z');
});

Deno.test('o intervalo tem sempre 24 horas', () => {
  for (const d of ['2026-01-15', '2026-07-15', '2026-03-28', '2026-10-24']) {
    const r = amanhaEmLisboa(new Date(`${d}T12:00:00Z`));
    const horas = (new Date(r.ate).getTime() - new Date(r.de).getTime()) / 3600_000;
    assertEquals(horas, 24, d);
  }
});

// ── Formatação ──────────────────────────────────────────────────────────────

Deno.test('a hora sai em Lisboa e não no fuso do servidor', () => {
  // 09:00 UTC em julho são 10:00 em Lisboa.
  assertEquals(hora('2026-07-16T09:00:00Z'), '10:00');
  // Em janeiro são as mesmas 09:00.
  assertEquals(hora('2026-01-16T09:00:00Z'), '09:00');
});

Deno.test('a data curta não leva dia da semana', () => {
  const d = dataCurta('2026-04-03T10:00:00Z');
  assertEquals(d.includes('abril'), true);
  assertEquals(d.includes('2026'), true);
  assertEquals(/feira|sábado|domingo/.test(d), false);
});

// O corte aos 60 dias não é decorativo: "há 2 meses" para 45 dias é impreciso
// ao ponto de o cliente achar que a mensagem não é para ele.

Deno.test('dias até dois meses, meses a partir daí', () => {
  assertEquals(haQuanto(30), 'há 30 dias');
  assertEquals(haQuanto(45), 'há 45 dias');
  assertEquals(haQuanto(59), 'há 59 dias');
  assertEquals(haQuanto(60), 'há 2 meses');
  assertEquals(haQuanto(97), 'há 3 meses');
  assertEquals(haQuanto(180), 'há 6 meses');
});
