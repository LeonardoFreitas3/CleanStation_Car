# Função de equipa — configuração

Cria contas do CRM por convite. É o que está por trás do botão **Convidar** em
Equipa.

Existe porque criar contas exige a `service_role`, e essa nunca pode viver no
frontend: quem a tivesse ignorava o RLS todo e lia a base de dados inteira.
Aqui fica nos secrets do Supabase e não sai da função.

## Publicar

```bash
npx supabase login
npx supabase link --project-ref yjjizqaewkgtwzflnmzh
npx supabase functions deploy team
```

Não há secrets a definir. `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` são
injetadas automaticamente pelo Supabase.

## O que é preciso estar configurado

- **Redirect URLs** com `https://cleanstationcar.com/crm/**` e
  `http://localhost:3000/crm/**` (passo 7 do README principal). O link do
  convite aponta para `/crm/nova-palavra-passe`; sem estar na lista, o Supabase
  recusa-o.
- **SMTP**, se isto for para uso a sério. O servidor de cortesia do Supabase
  tem um limite de poucos emails por hora — dá para experimentar, não para
  trabalhar. **Authentication → Emails → SMTP Settings**.

## Quem pode chamar

Só um administrador **ativo**. O pedido tem de trazer a sessão de quem o faz no
cabeçalho `Authorization`, e a função vai confirmar a função à base de dados —
não acredita no que o corpo do pedido diz ser.

Desativado não conta, mesmo sendo admin: é assim que se corta o acesso a quem
sai, e criar contas é a última coisa que ele deve continuar a poder fazer.

## Confirmar que ficou de pé

Sem sessão tem de recusar. Substitui `<ANON_KEY>`:

```bash
curl -s -X POST "https://yjjizqaewkgtwzflnmzh.supabase.co/functions/v1/team/invite" -H "Authorization: Bearer <ANON_KEY>" -H "apikey: <ANON_KEY>" -H "Content-Type: application/json" -d '{"email":"teste@exemplo.pt","fullName":"Teste"}'
```

Esperado: `{"error":"Sessão inválida ou expirada"}` com 401. Se responder outra
coisa, alguma coisa está mal — a anon key não é uma sessão e não pode servir
para criar contas.

O caminho feliz testa-se pelo CRM: Equipa → Convidar.

## O que acontece a seguir

O convite não define palavra-passe nenhuma — manda um link e é a própria pessoa
que a escolhe. Nem o administrador nem esta função chegam a conhecê-la.

O perfil é criado pelo trigger `handle_new_user`, como **Funcionário inativo**.
Fica assim de propósito: um convite enviado por engano não dá acesso a nada, e
ativar continua a ser um passo deliberado na página da Equipa.
