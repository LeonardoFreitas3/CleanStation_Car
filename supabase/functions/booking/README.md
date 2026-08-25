# Função de marcações — configuração

Liga o site ao Google Calendar. O calendário manda na agenda; o Supabase
recebe cliente, viatura e serviço para entrarem no CRM.

## Valores deste projeto

| | |
|---|---|
| Project ref | `yjjizqaewkgtwzflnmzh` |
| Service account | `cleanstation-bookings@cleanstationcar.iam.gserviceaccount.com` |
| Calendar ID | `8d45dc98be720068909fb65011ac1641b51c5cfb81a7c77c70edb6b1e70f7b42@group.calendar.google.com` |

O calendário tem de estar partilhado com a service account, com permissão
**"Fazer alterações a eventos"**. Sem isso a chave autentica mas não escreve.

## Publicar

O `npx` descarrega o CLI na hora — não é preciso instalar nada.

```bash
npx supabase login
npx supabase link --project-ref yjjizqaewkgtwzflnmzh
```

Os dois secrets. O JSON da chave nunca entra no git nem no frontend:

```bash
npx supabase secrets set GOOGLE_SERVICE_ACCOUNT="$(cat caminho/para/chave.json)"
npx supabase secrets set GOOGLE_CALENDAR_ID="8d45dc98be720068909fb65011ac1641b51c5cfb81a7c77c70edb6b1e70f7b42@group.calendar.google.com"
```

```bash
npx supabase functions deploy booking
```

`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` são injetadas automaticamente
pelo Supabase. Não as definas à mão.

## Confirmar que ficou de pé

Substitui `<ANON_KEY>` pela chave pública do projeto:

```bash
curl -s -X POST \
  -H "Authorization: Bearer <ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"date":"2026-09-14","duration":60}' \
  https://yjjizqaewkgtwzflnmzh.supabase.co/functions/v1/booking/availability
```

Esperado: `{"slots":["09:00","09:30",...]}`.

Se vier `{"error":"Não foi possível processar o pedido..."}`, o detalhe está
nos logs — a mensagem do Google revela o calendário e a service account, e por
isso não vai para o visitante:

```bash
npx supabase functions logs booking
```

Erros mais prováveis à primeira:

| Nos logs | Causa |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT em falta` | o secret não ficou definido |
| `Google recusou a autenticação` | chave inválida, ou a Calendar API não está ativada no projeto |
| `Calendar freeBusy falhou: 404` | Calendar ID errado |
| `Calendar freeBusy falhou: 403` | calendário não partilhado com a service account |

## Testes

```bash
deno test supabase/functions/booking/slots.test.ts
```

Cobrem a lógica de horas: sobreposições, antecedência mínima, fecho ao
domingo, hora de verão e serviços que atravessam a meia-noite.

> Nunca correram. Foram escritos sem Deno instalado na máquina de
> desenvolvimento.

## Horário e durações

O horário está em `slots.ts` (segunda a sábado, 09:00–20:00, intervalos de 30
minutos, uma hora de antecedência mínima).

As durações estão em `frontend/src/booking/pricing.js` (`DURATIONS`) e são uma
**estimativa** — ajusta-as ao ritmo real da oficina. Curtas demais e ficam com
marcações em cima umas das outras; longas demais e a agenda parece cheia
quando não está.
