// Quem recebe o email de "sentimos a sua falta".
//
// Errar aqui não dá erro nenhum deste lado: o email sai à pessoa errada e a
// única pessoa que fica a saber é ela.
//
//   npx --yes deno@2 test supabase/functions/brevo-sync/inativos.test.ts

import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { estaInativo } from './inativos.ts';

Deno.test('nunca ter vindo não é estar inativo', () => {
  // O client_overview devolve null quando não há serviço concluído nenhum.
  // Isto já esteve a devolver true, e mandava a lista de reativação atrás de
  // clientes que tinham marcado no dia anterior.
  assertEquals(estaInativo(null, 30), false);
  assertEquals(estaInativo(null, 1), false);
});

Deno.test('quem passou do limiar está inativo', () => {
  assertEquals(estaInativo(30, 30), true);
  assertEquals(estaInativo(31, 30), true);
  assertEquals(estaInativo(400, 30), true);
});

Deno.test('quem não passou, não', () => {
  assertEquals(estaInativo(0, 30), false);
  assertEquals(estaInativo(2, 30), false);
  assertEquals(estaInativo(29, 30), false);
});

Deno.test('o limiar vem das definições e não é sempre 30', () => {
  assertEquals(estaInativo(45, 60), false);
  assertEquals(estaInativo(60, 60), true);
});
