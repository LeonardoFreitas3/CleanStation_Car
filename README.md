# Clean Station Car

Site público e CRM da Clean Station Car — estética automóvel, Braga.

Duas aplicações no mesmo repositório e no mesmo build:

- **O site** (`/`) — serviços, preços, FAQ, e a marcação online, que escreve
  direto no Google Calendar e no CRM.
- **O CRM** (`/crm`) — clientes, viaturas, serviços, fotografias, equipa,
  follow-ups e faturação. Fechado por sessão e por RLS.

## Como está feito

| | |
|---|---|
| Frontend | React 19, React Router 7, Tailwind. Build com `react-scripts` via craco |
| Base de dados | Supabase (Postgres), com RLS em todas as tabelas sensíveis |
| Lógica de servidor | Supabase Edge Functions, em Deno |
| Agenda | Google Calendar, por **service account** (JWT assinado) |
| Email | Brevo — confirmações, lembretes e pedidos de avaliação |
| Alojamento | Netlify |

**O Calendar não usa OAuth 2.0.** Usou, e foi trocado por uma service account
porque o refresh token de uma app em modo *Testing* expira ao fim de 7 dias — a
agenda deixava de funcionar todas as semanas. A razão está escrita no
`supabase/functions/booking/google.ts`, que é onde interessa.

**O Calendar também não é a base de dados.** É a agenda: guarda os eventos das
marcações e as folgas. Os clientes, viaturas, serviços, preços e faturação vivem
todos no Postgres.

## Onde está o quê

```
frontend/src/
  booking/          formulário de marcação (modal do site) e a tabela de preços
  components/       site público: hero, serviços, FAQ, termos, cookies
  gallery/          página pública das fotografias de um serviço, por token
  crm/              o CRM inteiro — páginas, serviços de dados, contextos
  i18n.jsx          textos do site, PT e EN
  mock.js           catálogo do site: nomes, descrições, imagens

supabase/
  migrations/       SQL numerado. Corre por ordem e nunca se reescreve um já aplicado
  functions/
    booking/        disponibilidade, criação de marcações, folgas, eventos
    lembretes/      os três emails automáticos (véspera, manutenção, avaliação)
    galeria/        serve as fotografias a quem tem o token
    brevo-sync/     mantém a lista de inativos do Brevo em dia
    team/           gestão de contas da equipa, com a service_role
```

## Correr localmente

Precisa de um `frontend/.env.local` com as chaves públicas do Supabase:

```
REACT_APP_SUPABASE_URL=https://<project>.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<anon key>
```

A anon key é pública por desenho — o que protege os dados é o RLS, não o
segredo da chave. A `service_role` **nunca** entra aqui; vive nos secrets do
Supabase e só as Edge Functions lhe tocam.

```bash
npm --prefix frontend install
```

```bash
npm --prefix frontend start
```

O site fica em `localhost:3000` e o CRM em `localhost:3000/crm`.

## Verificar

```bash
npm --prefix frontend run typecheck
```

```bash
npm --prefix frontend test -- --watchAll=false
```

As Edge Functions verificam-se com Deno, que não precisa de estar instalado:

```bash
npx --yes deno@2 check supabase/functions/*/index.ts supabase/functions/*/*.test.ts
```

```bash
npx --yes deno@2 test supabase/functions/
```

O CI (`.github/workflows/ci.yml`) corre as quatro coisas em cada push. Existe
porque a `booking` chegou a estar no `main` sem compilar durante dias: o `tsc`
do frontend não olha para as Edge Functions, e o deploy do Supabase empacota com
esbuild, que remove os tipos sem os conferir.

## Publicar

Ver o **[IMPLANTACAO.md](IMPLANTACAO.md)**. Tem a ordem, a razão da ordem onde
ela importa, e — no topo — o estado medido do que já está no ar.

## Coisas que já morderam alguém

**Os preços estão em dois sítios, de propósito.** O `frontend/src/booking/
pricing.js` mostra; o `supabase/functions/booking/catalogue.ts` decide. Uma
função Deno não importa do frontend, e o preço nunca pode vir do cliente. Os
dois têm testes com os mesmos números: se um derivar, aparece um vermelho no CI
em vez de uma fatura errada.

**O site publicado pode não ser um build do `main`.** Já aconteceu haver
trabalho no ar que nunca entrou no git, e trabalho no git que nunca foi ao ar.
Antes de publicar o site, comparar com o que está no cleanstationcar.com.

**As migrações correm por ordem e não se reescrevem.** Uma já aplicada fica como
está; o que muda entra numa nova. As que fazem `update` a dados dizem-no no
cabeçalho.

**O RLS é a defesa, não o menu.** Esconder um botão não protege nada — houve um
caso em que o funcionário não via o Dashboard mas conseguia chamar o RPC à mão e
receber a faturação do mês. As guardas vivem dentro das funções SQL.

**O npm local pode ser mais permissivo que o do CI.** O CI corre o npm que vem
com o Node 22; uma máquina com npm 11 resolve conflitos de peer dependency que o
npm 10 recusa. Um `npm ci --dry-run` que passa localmente **não** garante que o
CI instala — já aconteceu subir o TypeScript para 5, ver tudo verde aqui, e
partir o `npm ci` no CI. O `react-scripts@5.0.1` está abandonado e o seu peer de
TypeScript parou no `^4`; quem quiser TS 5 tira-o primeiro, com o Vite.

**Os comentários explicam o porquê, não o quê.** Se mudares uma decisão que um
comentário justifica, muda o comentário na mesma alteração.
