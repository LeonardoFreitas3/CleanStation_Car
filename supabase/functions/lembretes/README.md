# lembretes

Avisa por email quem tem serviço marcado para o dia seguinte.

## Porque existe

Uma lavagem detalhada ocupa o dia inteiro. Um cliente que não aparece não custa
uma marcação, custa o dia.

Até aqui o único contacto que ele recebia era o email de confirmação, no momento
em que marcou — às vezes semanas antes.

## Base legal

Comunicação operacional, não marketing: é a execução do serviço que o próprio
cliente pediu. Não depende do consentimento de marketing, ao contrário da
`brevo-sync`. É a mesma base do email de confirmação que já sai hoje.

## O que faz

Procura os serviços de amanhã — em Lisboa, não no fuso do servidor — que não
estejam cancelados nem apagados e que ainda não tenham sido avisados.

- **Com email** → recebe o lembrete, e a ficha fica marcada com a data do aviso.
- **Sem email** → vai na resposta, com nome, telefone e hora, para ser avisado
  por WhatsApp. Não há como escrever a quem não deu email, mas desaparecer em
  silêncio era pior.

A marca de "avisado" é escrita **depois** do envio. Se o Brevo recusar, o
cliente fica por avisar e a passagem seguinte tenta outra vez.

## Secrets

Usa os que a confirmação de marcação já usa, mais o segredo do agendador:

```
BREVO_API_KEY
BREVO_FROM_EMAIL
BREVO_REPLY_TO    # opcional
CRON_SECRET       # o mesmo da brevo-sync
```

## Publicar

```bash
npx supabase functions deploy lembretes
```

## Agendar

No painel do Supabase, **Integrations → Cron → Create job**, uma vez por dia de
manhã:

- URL: `https://<PROJECT_REF>.supabase.co/functions/v1/lembretes`
- Método: POST
- Cabeçalhos: `x-cron-secret: <o segredo>`

De manhã e não à noite: um email às 09:00 da véspera é lido; um às 23:00 fica
para o dia seguinte, quando já não serve de aviso nenhum.

Correr duas vezes no mesmo dia não manda segundo email — é para isso que serve
o `reminded_at`.

## Experimentar

```bash
curl -X POST https://<PROJECT_REF>.supabase.co/functions/v1/lembretes -H "x-cron-secret: <segredo>"
```

Devolve o dia, quantas marcações encontrou, quantos emails saíram, quantos
falharam e a lista de quem não tem email.

**Atenção:** isto envia mesmo. Para ver o que ia acontecer sem enviar, olhe
primeiro para a agenda de amanhã no CRM — é a mesma lista.
