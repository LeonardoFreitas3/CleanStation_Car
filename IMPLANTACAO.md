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

**A `0016` faz um `update` a sério** — atribui ao João os serviços por atribuir.
Antes de a correr, vale a pena ver quantos são:

```sql
select count(*) from public.services
 where employee_id is null and deleted_at is null and status <> 'cancelado';
```

**A `0018` tem de correr antes do deploy da `booking`.** A função nova consulta a
coluna `google_event_id` dos serviços; sem a coluna, a Agenda fica sem bloqueios
e não diz porquê.

---

## 2. Secrets

```bash
npx supabase secrets set CRON_SECRET=$(openssl rand -hex 32)
npx supabase secrets set BREVO_LIST_INACTIVE=<id da lista, ver passo 5>
```

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
`events`, e passou a exigir a matrícula. A `team` não mudou.

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

## 6. O site

```bash
npm --prefix frontend run build
```

E arrastar `frontend/build` para a Netlify, como é hábito. As chaves do Supabase
vão coladas no build, a partir do `frontend/.env.local`.

---

## 7. Confirmar que ficou de pé

- [ ] Entrar como o João: menu com Agenda, Serviços e Clientes, e mais nada.
- [ ] Com a sessão dele, no Console: `dashboard_stats` devolve `null`,
      `follow_ups` e `monthly_revenue` devolvem `[]`.
- [ ] A ficha de um serviço não lhe mostra a caixa de escolha do funcionário.
- [ ] A Agenda abre sem erro e mostra a barra de ocupação.
- [ ] Marcar uma folga e vê-la aparecer no Google Calendar. Apagá-la e vê-la sair.
- [ ] Marcar pelo site: a matrícula é obrigatória, e a viatura aparece no CRM.
- [ ] Criar o link de uma galeria e abri-lo numa janela anónima.
- [ ] `curl` do `lembretes` — **atenção, envia mesmo**. Ver a agenda de amanhã
      primeiro: é a mesma lista.

---

## 8. Fora deste repositório

- [ ] **Revogar a chave antiga do Resend** (`re_17XM…`) em resend.com. Saiu do
      código em junho, mas uma chave viva que ninguém usa é só risco.
