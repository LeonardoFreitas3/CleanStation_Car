/**
 * Qual é a secção acesa no menu, dada a posição de cada uma no ecrã.
 *
 * À parte do Header por uma razão prática: é uma regra com casos de fronteira —
 * o topo, o fundo, duas secções à vista ao mesmo tempo — e testá-la dentro do
 * componente obrigava a levantar um browser e a fingir um scroll. Aqui é uma
 * conta com entrada e saída.
 *
 * Era um IntersectionObserver e o resultado dependia da ordem por que os avisos
 * chegavam: com duas secções à vista — e há quase sempre duas — ficava acesa a
 * última a avisar, que tanto podia ser a de cima como a de baixo. O sublinhado
 * saltava para trás sem a página ter mudado de sítio.
 *
 * @param seccoes [{ href, top }] — o top é relativo ao ecrã, como o
 *   getBoundingClientRect() o dá. Não precisam de vir ordenadas: são ordenadas
 *   aqui pela posição real, para mexer na ordem do menu não poder partir isto.
 * @param linha altura, a contar do topo do ecrã, a partir da qual uma secção
 *   conta como "onde se está".
 * @param noFundo a página já não dá para descer mais.
 */
export function seccaoAtiva(seccoes, { linha, noFundo = false }) {
  if (!seccoes.length) return null;

  const ordenadas = [...seccoes].sort((a, b) => a.top - b.top);

  // No fim da página a última secção pode nunca chegar à linha — é curta e não
  // há mais nada por baixo para a empurrar. Sem isto os contactos nunca
  // acendiam, por muito que se descesse.
  if (noFundo) return ordenadas[ordenadas.length - 1].href;

  const passadas = ordenadas.filter((s) => s.top <= linha);

  // Nenhuma passou: está-se acima da primeira, e é essa que está a ser vista.
  return (passadas[passadas.length - 1] ?? ordenadas[0]).href;
}
