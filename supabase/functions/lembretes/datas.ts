// Datas e horas dos lembretes, à parte do resto.
//
// Não é arrumação: o index.ts chama Deno.serve() no momento em que é
// importado, portanto nada lá dentro se consegue testar sem levantar um
// servidor. Estas funções são as únicas com contas a sério — fusos, mudança da
// hora, arredondamento de meses — e são exatamente as que ninguém verifica a
// olho. Aqui, um `deno test` chega-lhes.
//
// É o mesmo desenho que a booking já usa: o slots.ts vive fora do index.ts pela
// mesma razão, e é a única parte daquela função com testes.

/**
 * Amanhã em Lisboa, como intervalo [inicio, fim).
 *
 * O fuso do servidor não serve: a função corre em infraestrutura que pode estar
 * noutro continente, e perto da meia-noite isso avisava o dia errado.
 *
 * A deslocação é a **daquele dia** e não a de hoje: entre marcar e o dia chegar
 * pode haver mudança de hora, e uma hora ao lado põe o intervalo fora do dia.
 *
 * Limite conhecido, e o teste fixa-o: nos dois dias do ano em que a hora muda,
 * a deslocação é lida ao meio-dia e a mudança acontece de madrugada, portanto o
 * intervalo começa uma hora cedo em março e uma hora tarde em outubro. Cai
 * sempre entre as 23:00 e as 01:00, com a oficina fechada, e nenhuma marcação
 * pode existir aí. Se o horário passar a ser de 24 horas, isto deixa de ser
 * inofensivo.
 */
export function amanhaEmLisboa(agora = new Date()): { de: string; ate: string; dia: string } {
  const hoje = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon' }).format(agora);
  const dia = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon' })
    .format(new Date(new Date(`${hoje}T12:00:00Z`).getTime() + 24 * 3600_000));

  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Lisbon',
    timeZoneName: 'longOffset',
  }).formatToParts(new Date(`${dia}T12:00:00Z`));
  const nome = partes.find((p) => p.type === 'timeZoneName')?.value ?? 'GMT+00:00';
  const desloc = nome.replace('GMT', '') || '+00:00';

  const de = new Date(`${dia}T00:00:00${desloc}`);
  return {
    de: de.toISOString(),
    ate: new Date(de.getTime() + 24 * 3600_000).toISOString(),
    dia,
  };
}

export const hora = (iso: string) => new Intl.DateTimeFormat('pt-PT', {
  timeZone: 'Europe/Lisbon', hour: '2-digit', minute: '2-digit',
}).format(new Date(iso));

export const dataLonga = (iso: string) => new Intl.DateTimeFormat('pt-PT', {
  timeZone: 'Europe/Lisbon', weekday: 'long', day: 'numeric', month: 'long',
}).format(new Date(iso));

// Sem dia da semana: a data de um serviço feito há meses é uma referência, não
// um compromisso, e "quinta-feira, 3 de abril" faz pensar que é para agora.
export const dataCurta = (iso: string) => new Intl.DateTimeFormat('pt-PT', {
  timeZone: 'Europe/Lisbon', day: 'numeric', month: 'long', year: 'numeric',
}).format(new Date(iso));

/** "há 3 meses" lê-se; "há 97 dias" conta-se. O corte é aos dois meses. */
export const haQuanto = (dias: number) =>
  (dias >= 60 ? `há ${Math.round(dias / 30)} meses` : `há ${dias} dias`);
