// Quem conta como inativo, à parte do resto.
//
// À parte porque o index.ts chama Deno.serve() ao ser importado e nada lá
// dentro se testa sem levantar um servidor — o mesmo argumento do datas.ts nos
// lembretes. E esta regra em particular merece-o: é ela que decide a quem sai
// um email de "sentimos a sua falta", e errá-la não dá erro nenhum. O email sai
// à pessoa errada e ninguém do lado de cá fica a saber.

/**
 * Um cliente está inativo?
 *
 * `dias` é o `days_since_last_visit` do client_overview, e é **null quando o
 * cliente nunca fez um serviço concluído** — está escrito assim no 0004.
 *
 * Null não é inatividade: é um cliente que ainda não chegou. Marcou ontem e
 * ainda não veio, ou foi criado ao balcão e o serviço ainda está agendado.
 * Mandar-lhe "já não passa por cá há algum tempo" é o oposto do que se quer
 * dizer a alguém que acabou de aparecer.
 *
 * Isto esteve escrito como `(dias ?? Number.MAX_SAFE_INTEGER) >= limiar`, que
 * transformava "nunca veio" em "inativo há uma eternidade" e punha clientes
 * novos na lista de reativação ao fim de um fim de semana. A mesma regra no
 * SQL — a follow_ups() do 0019 — sempre teve o `is not null` certo; foi a
 * segunda cópia que divergiu.
 */
export function estaInativo(dias: number | null, limiar: number): boolean {
  if (dias === null) return false;
  return dias >= limiar;
}
