# brevo-sync

Mantém a lista do Brevo a par de quem anda sem aparecer, para as automações de
reativação dispararem sozinhas.

A automação vive no Brevo. Esta função só põe as pessoas certas na lista certa,
com os atributos em dia.

## Como funciona

Corre sobre a `client_overview`, que já sabe quantas visitas cada cliente tem,
quanto gastou e há quantos dias não aparece.

- **Com consentimento de marketing e 30+ dias sem visita** → entra na lista de
  inativos, com os atributos atualizados.
- **Com consentimento e visita recente** → sai da lista. Se voltou, não pode
  continuar a levar a mensagem de saudade.
- **Sem consentimento de marketing** → apagado do Brevo. Não basta deixar de o
  atualizar: o contacto tem de sair de lá.

O limiar são 30 dias, mudável em `BREVO_DIAS_INATIVO`.

## Porque é a lista que serve de gatilho

Uma automação do Brevo dispara de forma fiável com "contacto adicionado à
lista". Reavaliar um atributo numérico todos os dias, não. Entrar na lista é o
acontecimento, e sair dela quando o cliente volta é igualmente importante.

## RGPD

Só sobe quem deu consentimento de marketing. Não é uma opção de configuração:
mandar o email de um cliente para um serviço de campanhas é tratamento de dados
para marketing, e sem consentimento não há base legal.

O consentimento é o mesmo que a lista de follow-ups já respeita — na ficha do
cliente, e retirável a qualquer momento. Quando é retirado, a sincronização
seguinte apaga o contacto do Brevo.

## Secrets

```
BREVO_API_KEY         # a mesma da confirmação de marcação
BREVO_LIST_INACTIVE   # id da lista de inativos, um número
BREVO_DIAS_INATIVO    # opcional, 30 por omissão
CRON_SECRET           # o que o agendador manda no cabeçalho x-cron-secret
```

```bash
npx supabase secrets set BREVO_LIST_INACTIVE=7 CRON_SECRET=$(openssl rand -hex 32)
```

## Publicar

```bash
npx supabase functions deploy brevo-sync
```

## Quem pode chamar

O agendador, com `x-cron-secret`, ou um administrador autenticado. Nunca
anónimo: a resposta diz quantos clientes há e quantos andam desaparecidos.

## Agendar

No painel do Supabase, **Integrations → Cron → Create job**, uma vez por dia:

- URL: `https://<PROJECT_REF>.supabase.co/functions/v1/brevo-sync`
- Método: POST
- Cabeçalhos: `x-cron-secret: <o segredo>`

Uma vez por dia chega. Os dias sem visita mudam a esse ritmo.

## No Brevo

1. **Contacts → Lists → New list**, "Inativos 30 dias". O id fica no URL — é o
   `BREVO_LIST_INACTIVE`.
2. **Contacts → Settings → Attributes**, criar: `NOME` (texto),
   `NOME_COMPLETO` (texto), `VISITAS` (número), `TOTAL_GASTO` (número),
   `ULTIMA_VISITA` (data), `DIAS_SEM_VISITA` (número). Sem eles o Brevo aceita
   o contacto e deita os atributos fora em silêncio.
3. **Automations → New automation → Contact added to a list**, escolher a
   lista, e desenhar lá o que se segue.

## Experimentar antes de agendar

```bash
curl -X POST https://<PROJECT_REF>.supabase.co/functions/v1/brevo-sync -H "x-cron-secret: <segredo>"
```

Devolve quantos entraram, quantos saíram, quantos foram removidos por falta de
consentimento e quantos falharam. Com a lista vazia no Brevo e a automação ainda
por ligar, não sai email nenhum — dá para confirmar os números primeiro.
