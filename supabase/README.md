# CRM Clean Station Car — configuração do Supabase

Passo a passo do zero até ao CRM a funcionar. Cerca de 10 minutos.

O CRM vive em `/crm`, dentro do site existente. O site público não é afetado
por nada disto.

---

## 1. Criar o projeto

Em [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.

- **Region: `eu-central-1` (Frankfurt)** ou `eu-west-1` (Ireland).
  Obrigatório pelo RGPD — vais guardar dados pessoais de clientes.
  **Não se muda depois**: mudar de região implica criar outro projeto.
- **Database password**: gera uma forte e guarda-a num gestor de passwords.
  Não é a password do CRM; é para acesso direto à base de dados.

O projeto demora 1–2 minutos a ficar pronto.

## 2. Aplicar as migrations

**Project → SQL Editor → New query.** Cola e corre cada ficheiro, **por ordem**,
um de cada vez, confirmando que dá "Success" antes de passar ao seguinte:

1. `migrations/0001_schema.sql` — tabelas, triggers, auditoria
2. `migrations/0002_rls.sql` — Row Level Security e políticas
3. `migrations/0003_service_catalogue.sql` — os 14 serviços e 6 extras reais
4. `migrations/0004_client_overview.sql` — vista e pesquisa de clientes

Se algum falhar, pára e resolve antes de continuar: os seguintes assumem que
os anteriores correram. Um erro do género `relation "public.clients" does not
exist` no `0004` quer dizer que o `0001` não chegou ao fim — volta atrás.

Depois do `0001`, confirma que as seis tabelas existem:

```sql
select table_name from information_schema.tables
where table_schema = 'public' order by table_name;
```

Deves ver `audit_logs`, `clients`, `profiles`, `service_types`, `services`,
`vehicles`.

Todos os ficheiros são idempotentes (`if not exists`, `create or replace`),
portanto voltar a correr um que falhou a meio é seguro.

## 3. Desligar os registos públicos (e só os registos)

**Authentication → Sign In / Providers.**

São duas definições diferentes e é fácil trocá-las:

| Definição | Estado correto | O que faz |
|---|---|---|
| **Enable Email provider** (no cartão Email) | **LIGADO** | Permite entrar com email e password |
| **Allow new users to sign up** (definição do projeto, no topo da página) | **DESLIGADO** | Impede a criação de contas |

Desligar o **provider** em vez dos **registos** bloqueia também o início de
sessão — ninguém entra, nem tu. O sintoma é o erro
`email_provider_disabled: Email logins are disabled`.

Confirma que ficou como deve ser (substitui `<PROJECT_REF>` e a chave):

```bash
# deve responder: email_provider_disabled OU signup_disabled
curl -s -X POST -H "apikey: <ANON_KEY>" -H "Content-Type: application/json" \
  -d '{"email":"teste@exemplo.com","password":"Password123!"}' \
  https://<PROJECT_REF>.supabase.co/auth/v1/signup
```

Desligar os registos não é opcional. A `anon key` é pública por desenho — está
no JavaScript que qualquer visitante descarrega. Com os registos abertos,
qualquer pessoa cria conta no teu CRM.

A segunda metade desta defesa já está no esquema: perfis novos nascem com
`active = false` e não vêem nada até um admin os ativar.

## 4. Criar a tua conta

**Authentication → Users → Add user → Create new user.**

- Email e password à tua escolha
- Marca **Auto Confirm User**, senão ficas à espera de um email de confirmação

O trigger cria automaticamente o perfil, como `employee` inativo.

## 5. Promover-te a administrador

De volta ao **SQL Editor**, com o teu email:

```sql
begin;
alter table public.profiles disable trigger profiles_protect_privileges;

update public.profiles
set role = 'admin', active = true, full_name = 'O Teu Nome'
where email = 'o-teu-email@exemplo.com';

alter table public.profiles enable trigger profiles_protect_privileges;
commit;
```

**Porquê desligar o trigger.** O `profiles_protect_privileges` impede que
alguém se promova a si próprio: reverte alterações a `role` e `active` para
quem não for admin. No SQL Editor não há sessão autenticada, logo `auth.uid()`
é `NULL` e `is_admin()` devolve `false` — o trigger trata-te como um atacante
e desfaz a alteração **sem dar erro**.

O sintoma é o `UPDATE` reportar sucesso, o `updated_at` mudar, e o `role`
continuar em `employee`. Se te acontecer, é isto.

A transação garante que o trigger volta a ficar ligado mesmo que algo falhe a
meio. Confirma sempre depois:

```sql
select email, role, active from public.profiles;
```

Isto só é preciso para o primeiro admin. A partir daí, um admin autenticado
altera funções pelo CRM normalmente — pela API o `is_admin()` já devolve
`true` e o trigger deixa passar.

Confirma que resultou:

```sql
select email, role, active from public.profiles;
```

Deves ver `admin` e `true`. Sem este passo entras no CRM e não vês nada — é o
RLS a funcionar, não uma avaria.

## 6. Obter as credenciais

**Project Settings → API**. Precisas de dois valores:

- **Project URL** — algo como `https://abcdefgh.supabase.co`
- **anon / publishable key** — a chave longa

**Nunca copies a `service_role`.** Essa dá acesso total e ignora o RLS. Não
entra no frontend, em variável de ambiente do site, nem no git.

## 7. Configurar os URLs de autenticação

**Authentication → URL Configuration.**

- **Site URL**: `https://cleanstationcar.com`
- **Redirect URLs**: acrescenta
  - `https://cleanstationcar.com/crm/**`
  - `http://localhost:3000/crm/**` (para desenvolvimento)

Sem isto, o link de recuperação de palavra-passe é rejeitado.

## 8. Ligar em local

Cria `frontend/.env.local` (já está no `.gitignore`):

```
REACT_APP_SUPABASE_URL=https://abcdefgh.supabase.co
REACT_APP_SUPABASE_ANON_KEY=a-tua-anon-key
```

O prefixo `REACT_APP_` é obrigatório — sem ele o Create React App ignora a
variável. Reinicia o servidor: variáveis de ambiente só são lidas ao arrancar.

```bash
npm --prefix frontend start
```

Abre `http://localhost:3000/crm` e entra com a conta do passo 4.

## 9. Ligar em produção (Netlify)

**Site configuration → Environment variables**, as mesmas duas variáveis.

Depois **Deploys → Trigger deploy → Clear cache and deploy site**. As
variáveis são embutidas no bundle em build time, portanto um deploy antigo não
as apanha.

---

## Verificação de segurança

Depois de configurado, confirma:

- [ ] Numa janela anónima, `/crm/clientes` manda-te para o login
- [ ] Os registos públicos estão desligados (passo 3)
- [ ] A `service_role` não aparece em lado nenhum:
      `grep -r "service_role" frontend/ --exclude-dir=node_modules`
- [ ] Uma conta `employee` não vê Dashboard nem Follow-ups
- [ ] Um `employee` não se consegue promover: o trigger
      `protect_profile_privileges` reverte alterações a `role` e `active`

## Notas

**A `anon key` fica visível no JavaScript do site.** É assim que tem de ser —
foi desenhada para ser pública. Quem protege os dados é o RLS, não o segredo
da chave.

**Contas novas criam-se no CRM**, em Equipa → Criar conta. Passa pela Edge
Function `team`, que tem de estar publicada — ver
`supabase/functions/team/README.md`. É o administrador que escolhe a
palavra-passe, e a conta entra como Funcionário **inativo**: o acesso só começa
quando alguém a ativar.

Não é enviado email nenhum, portanto isto funciona sem SMTP. O que **precisa**
de SMTP é a recuperação de palavra-passe: o servidor de cortesia do Supabase tem
um limite de poucos emails por hora e não garante entrega. Para uso a sério,
configura SMTP próprio em **Authentication → Emails → SMTP Settings**.

Uma palavra-passe perdida resolve-se na própria Equipa, no botão
**Palavra-passe** de cada pessoa. Não é preciso ir ao painel nem ter SMTP.

O passo 4 (criar a conta no painel) continua a ser o caminho para a **primeira**
conta, a de administrador: não há quem crie contas antes de existir alguém.
