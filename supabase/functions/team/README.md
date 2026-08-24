# Função de equipa — configuração

Cria contas do CRM. É o que está por trás do botão **Criar conta** em Equipa.

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

Também não é preciso SMTP: a conta é criada com o email já confirmado e não se
envia email nenhum. (O SMTP continua a fazer falta para a recuperação de
palavra-passe, essa sim é por email.)

## Quem pode chamar

Só um administrador **ativo**. O pedido tem de trazer a sessão de quem o faz no
cabeçalho `Authorization`, e a função vai confirmar a função à base de dados —
não acredita no que o corpo do pedido diz ser.

Desativado não conta, mesmo sendo admin: é assim que se corta o acesso a quem
sai, e criar contas é a última coisa que ele deve continuar a poder fazer.

## Confirmar que ficou de pé

Sem sessão tem de recusar. Substitui `<ANON_KEY>`:

```bash
curl -s -X POST "https://yjjizqaewkgtwzflnmzh.supabase.co/functions/v1/team/create" -H "Authorization: Bearer <ANON_KEY>" -H "apikey: <ANON_KEY>" -H "Content-Type: application/json" -d '{"email":"teste@exemplo.pt","fullName":"Teste"}'
```

Esperado: `{"error":"Sessão inválida ou expirada"}` com 401. Se responder outra
coisa, alguma coisa está mal — a anon key não é uma sessão e não pode servir
para criar contas.

O caminho feliz testa-se pelo CRM: Equipa → Criar conta.

## A palavra-passe

É o administrador que a escolhe, no formulário. Segue no corpo do pedido, por
HTTPS, e o Auth guarda-a cifrada. Não é escrita em lado nenhum pelo caminho:
não entra nos logs, não volta na resposta, não fica na tabela de perfis.

**Mínimo de 8 caracteres**, igual ao da página de nova palavra-passe. Se mudares
esse mínimo, muda nos três sítios: aqui, no `Team.tsx` e no `NewPassword.tsx`.

**Não há como a alterar pelo CRM.** Se ficar mal escrita, a pessoa não entra e a
saída é o painel do Supabase (Authentication → Users) ou o "Esqueci-me da
palavra-passe" do login, que precisa de SMTP. O formulário tem o olho para
mostrar o que se escreveu, precisamente para isso não acontecer.

## O que acontece a seguir

O perfil é criado pelo trigger `handle_new_user`, como **Funcionário inativo**,
no mesmo instante em que a conta nasce — aparece na lista antes de a pessoa
saber que existe.

Fica inativo de propósito: uma conta criada por engano não dá acesso a nada, e
ativar continua a ser um passo deliberado na página da Equipa.
