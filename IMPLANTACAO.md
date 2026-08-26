# Implantação — o que falta pôr no ar

Tudo o que está neste ramo foi escrito e verificado **sem acesso à base de dados
de produção**: os testes passam, o TypeScript está limpo e o SQL nunca correu
contra nenhum Postgres. Esta é a ordem por que deve ser aplicado.

A ordem importa. Onde importa mesmo, está dito porquê.

---

## 1. Migrações

No **SQL Editor** do Supabase, uma de cada vez, por ordem. Estão em
`supabase/migrations/`.

| Ficheiro | O que faz |
|---|---|
| `0015_faturacao_so_gestao.sql` | Fecha a faturação ao funcionário, também pela API |
| `0016_atribuicao_so_admin.sql` | Só o admin distribui trabalho; com um funcionário, é dele |
| `0017_folga_no_calendario.sql` | Guarda o id do evento da folga |
| `0018_agenda_ve_o_google.sql` | Guarda o id do evento do serviço |
| `0019_follow_ups_contactados.sql` | Lista de reativação sabe a quem já se ligou |
| `0020_modelos_follow_up.sql` | Quatro modelos de mensagem de reativação |
| `0021_lembrete_vespera.sql` | Marca de "cliente avisado" |
| `0022_galeria_do_cliente.sql` | Token e prazo da galeria |
| `0023_horario_nas_definicoes.sql` | Horário editável nas Definições |
| `0024_lembrete_de_manutencao.sql` | Prazo de repetição no catálogo, e quem está à espera de ser lembrado |

**A `0016` faz um `update` a sério** — atribui ao João os serviços por atribuir.
Antes de a correr, vale a pena ver quantos são:

```sql
select count(*) from public.services
 where employee_id is null and deleted_at is null and status <> 'cancelado';
```

**A `0018` tem de correr antes do deploy da `booking`.** A função nova consulta a
coluna `google_event_id` dos serviços; sem a coluna, a Agenda fica sem bloqueios
e não diz porquê.

**A `0024` escreve prazos no catálogo** — 45 dias na lavagem simples, 30 na do
selante, 60 na premium, 90 na detalhada e 180 na cerâmica. São a decisão
comercial e mudam-se nas Definições, sem SQL; se algum não te servir, muda-o lá
antes de ligares o agendador. Um serviço sem prazo nunca manda email a ninguém.

A `0024` **não** tem de correr antes do deploy da `lembretes`, ao contrário da
`0018`: a função nova apanha a falta da migração, escreve-a nos logs e continua
a mandar o lembrete da véspera. Corre-as pela ordem à mesma — isto é uma rede,
não uma autorização para saltar um passo.

---

## 2. Secrets

```bash
npx supabase secrets set CRON_SECRET=$(openssl rand -hex 32)
npx supabase secrets set BREVO_LIST_INACTIVE=<id da lista, ver passo 5>
```

Opcional, com valor por omissão de 25:

```bash
npx supabase secrets set MANUTENCAO_MAX=25
```

É o tecto de lembretes de manutenção por passagem. Existe por causa da primeira:
ela olha para o histórico todo de uma vez, e sem tecto mandava centenas de emails
no mesmo minuto — o Brevo corta e o domínio fica marcado. Quem sobra vai no dia
seguinte, e a resposta diz quantos ficaram para trás (`manutencao.adiados`).

O `BREVO_API_KEY` e o `BREVO_FROM_EMAIL` já lá estão — são os que o email de
confirmação usa. Confirma com `npx supabase secrets list`.

---

## 3. Edge Functions

```bash
npx supabase functions deploy booking
npx supabase functions deploy lembretes
npx supabase functions deploy galeria
npx supabase functions deploy brevo-sync
```

A `booking` **tem de ir**: ganhou os endpoints `time-off`, `time-off-remove` e
`events`, e passou a exigir a matrícula. A `lembretes` também: ganhou a segunda
passagem, a de manutenção, e o modo de ensaio. A `team` não mudou.

**A `booking` e o site publicam-se juntos.** O site novo manda a matrícula e a
função nova exige-a: publicar só um dos dois parte as marcações.

---

## 4. Tarefas agendadas

No painel do Supabase, **Integrations → Cron**. Ambas em POST, com o cabeçalho
`x-cron-secret: <o segredo do passo 2>`.

| Quando | URL |
|---|---|
| Todos os dias de manhã | `/functions/v1/lembretes` |
| Uma vez por dia | `/functions/v1/brevo-sync` |

O lembrete de manhã e não à noite: um email às 09:00 da véspera é lido, um às
23:00 chega quando já não avisa nada.

**A tarefa da `lembretes` continua a ser uma só**, mas passou a fazer duas
coisas: avisa quem tem serviço amanhã e escreve a quem já passou do prazo de
manutenção. Correm à mesma hora, pelo mesmo agendador e pelo mesmo Brevo — uma
segunda tarefa era um segundo sítio para desligar por engano. Antes de a criar,
faz o ensaio do passo 6.

---

## 5. Brevo

1. **Contacts → Lists → New list**, "Inativos 30 dias". O id fica no URL — é o
   `BREVO_LIST_INACTIVE`.
2. **Contacts → Settings → Attributes**, criar: `NOME` (texto),
   `NOME_COMPLETO` (texto), `VISITAS` (número), `TOTAL_GASTO` (número),
   `ULTIMA_VISITA` (data), `DIAS_SEM_VISITA` (número). **Sem eles o Brevo aceita
   o contacto e deita os atributos fora em silêncio.**
3. Correr a sincronização à mão e ver os números **antes** de ligar a automação:

   ```bash
   curl -X POST https://<PROJECT_REF>.supabase.co/functions/v1/brevo-sync -H "x-cron-secret: <segredo>"
   ```

4. Só depois: **Automations → New automation → Contact added to a list**.

---

## 6. O lembrete de manutenção, antes de o deixar sozinho

Este é o primeiro email que sai **sem ninguém carregar em nada** e a pedir que o
cliente volte. Vale a pena vê-lo antes de o pôr no agendador.

Primeiro, quem está à espera. No SQL Editor:

```sql
select client_name, client_email, service_name, plate, dias, prazo
  from public.manutencoes_a_lembrar()
 order by dias desc;
```

A lista já vem filtrada: só quem deu consentimento de marketing, só o último
serviço de cada viatura, sem quem levou mensagem de marketing nos últimos 30
dias e sem quem já tem hora marcada. Se vier vazia, não é avaria — é não haver
ninguém em condições, e o mais provável logo no início é o consentimento.

Depois, o ensaio. **Não manda nada**, não marca a ficha, não escreve no
histórico; só diz a quem ia escrever:

```bash
curl -X POST "https://<PROJECT_REF>.supabase.co/functions/v1/lembretes?dry=1" -H "x-cron-secret: <segredo>"
```

Confere `manutencao.previstos` contra a consulta de cima, e `previstos` contra a
agenda de amanhã. Só depois, sem o `?dry=1`, é que sai a sério — e sai para
clientes reais.

Um lembrete por serviço, uma vez só: a coluna `maintenance_reminded_at` fica
carimbada no fim do envio. Se quiseres voltar a testar com o mesmo cliente,
limpa-a nesse serviço.

Se a resposta trouxer `manutencao.erro` a dizer que **não encontra a função**, a
`0024` correu mas o PostgREST ainda não sabe. Uma linha no SQL Editor resolve:

```sql
notify pgrst, 'reload schema';
```

---

## 7. O site

```bash
npm --prefix frontend run build
```

E arrastar `frontend/build` para a Netlify, como é hábito. As chaves do Supabase
vão coladas no build, a partir do `frontend/.env.local`.

---

## 8. Confirmar que ficou de pé

- [ ] Entrar como o João: menu com Agenda, Serviços e Clientes, e mais nada.
- [ ] Com a sessão dele, no Console: `dashboard_stats` devolve `null`,
      `follow_ups` e `monthly_revenue` devolvem `[]`.
- [ ] A ficha de um serviço não lhe mostra a caixa de escolha do funcionário.
- [ ] A Agenda abre sem erro e mostra a barra de ocupação.
- [ ] Marcar uma folga e vê-la aparecer no Google Calendar. Apagá-la e vê-la sair.
- [ ] Marcar pelo site: a matrícula é obrigatória, e a viatura aparece no CRM.
- [ ] Criar o link de uma galeria e abri-lo numa janela anónima.
- [ ] `curl` do `lembretes` com `?dry=1` — não envia, e diz quem ia receber o quê.
- [ ] `curl` do `lembretes` sem o `?dry=1` — **atenção, envia mesmo**. Ver a
      agenda de amanhã primeiro: é a mesma lista.
- [ ] Nas Definições, cada serviço mostra "Repetir ao fim de (dias)" com o prazo
      da `0024`. Os extras não mostram nada — é de propósito.
- [ ] Guardar um prazo de 3 dias dá erro em português, não um erro de constraint.
- [ ] Na ficha de um cliente que recebeu o lembrete de manutenção, a mensagem
      aparece no histórico marcada como marketing.

---

## 9. Fora deste repositório

- [ ] **Revogar a chave antiga do Resend** (`re_17XM…`) em resend.com. Saiu do
      código em junho, mas uma chave viva que ninguém usa é só risco.
