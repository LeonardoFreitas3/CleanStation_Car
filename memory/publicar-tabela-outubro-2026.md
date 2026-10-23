# Publicar a tabela de preços de outubro de 2026

Prompt para colar no Claude Code, no computador onde estão o `frontend/.env.local`
e a sessão do Supabase (`npx supabase login`). Feito numa sessão na nuvem, que
não tinha nem as chaves nem acesso a `api.supabase.com` / `api.netlify.com`.

---

Publica a tabela de preços de outubro de 2026 da Clean Station Car. O trabalho
está feito e testado no ramo `claude/quirky-sagan-poykbh`; falta pô-lo no ar. Lê
o `README.md` e a parte de cima do `IMPLANTACAO.md` antes de começar.

O que o ramo muda, para saberes o que estás a publicar:
- Lavagens, carro / SUV / carrinha grande: Simples 35/40/45 € (passa a incluir
  selante; mota 35 €), Premium 75/80/85 €, Detalhada Interior ou Exterior
  130/140/150 € (nova; a área escolhe-se na marcação e vai para o servidor como
  `detalhada-interior` ou `detalhada-exterior`), Detalhada Interior + Exterior
  200/220/240 €. Durações por veículo: Simples 1h30/1h45/2h, Premium e
  Detalhada Interior ou Exterior 4h/5h/6h, Detalhada Interior + Exterior
  8h/10h/12h (no SUV e na carrinha grande a agenda bloqueia o dia inteiro). A
  Lavagem com Selante saiu e o endereço dela redireciona para a Simples
  (`frontend/public/_redirects`).
- Polimentos "desde" e sob orçamento (250, 350, 55, 40); Proteção Cerâmica
  Profissional desde 250 €, com página própria (`/protecao-ceramica-braga/`).
  Packs: 60, 125 e 330 €/mês. Na secção "Os Nossos Serviços" (no sítio de
  sempre) os cartões vêm logo a seguir ao título e o texto explicativo passou
  para depois deles; as páginas das lavagens deixaram de ter "Ver preços".
- Quem decide o preço e a duração de uma marcação é
  `supabase/functions/booking/catalogue.ts`, não o site. Por isso a função tem
  de ir para o ar antes do site.

Pede-me confirmação antes de cada passo que mexe em produção (2, 3, 5 e 6) e
diz-me exatamente o que vais correr. Nunca mostres o conteúdo do `.env.local`
nem de nenhuma chave.

1. **Preparar.** `git fetch origin` e passa para `claude/quirky-sagan-poykbh`
   atualizado. Confirma que o `frontend/.env.local` tem
   `REACT_APP_SUPABASE_URL` e `REACT_APP_SUPABASE_ANON_KEY` preenchidas, sem
   mostrar os valores. Instala as dependências se for preciso
   (`npm --prefix frontend ci`) e corre as verificações do README: `typecheck`,
   `test` e `lint` do frontend, e
   `npx --yes deno@2 test supabase/functions/`. Se alguma falhar, para e
   diz-me.

2. **Ver o que está no ar antes de escrever por cima.** O README avisa que já
   houve código em produção que nunca entrou no git. Descarrega a função
   publicada (`npx supabase functions download booking` para uma pasta
   temporária, fora do repositório) e compara-a com a do `main`
   (`git show main:supabase/functions/booking/<ficheiro>`). Se houver diferenças
   além do que este ramo muda, mostra-mas e não publiques até eu decidir.

3. **Publicar a função.** `npx supabase functions deploy booking`. Depois
   confirma que responde, sem criar nada: um POST a
   `<REACT_APP_SUPABASE_URL>/functions/v1/booking/availability` com
   `{"date": "<próximo dia útil, AAAA-MM-DD>", "duration": 480}` e os cabeçalhos
   `apikey` e `Authorization: Bearer <anon key>` tem de devolver `slots`, com
   horas da manhã (8 horas cabem no dia de trabalho).

4. **Build do site.** `npm --prefix frontend run build`. Confirma que o
   `frontend/build` tem a página `lavagem-detalhada-interior-ou-exterior-braga`,
   não tem `lavagem-com-selante-braga`, tem o redirecionamento no `_redirects`
   e tem o endereço do Supabase dentro de `_next/static` (sinal de que as chaves
   entraram). Não uses o `frontend/build-pages`, que é da cópia do GitHub Pages
   e tem outros caminhos.

5. **Netlify.** Logo a seguir ao passo 3, para o site antigo (que ainda oferece
   a Lavagem com Selante, que a função nova recusa) ficar o menos tempo
   possível no ar. Se o Netlify CLI estiver instalado e com sessão, propõe-me
   publicar com ele; senão diz-me para arrastar o `frontend/build`, como é
   hábito, e espera que eu confirme.

6. **Catálogo do CRM.** As migrações
   `supabase/migrations/0033_tabela_outubro_2026.sql` e
   `supabase/migrations/0034_precos_por_veiculo_outubro.sql` correm no SQL
   Editor do Supabase, uma de cada vez e por esta ordem, como as outras (ver o
   `IMPLANTACAO.md`). Mostra-mas para eu colar e lê comigo o resultado da
   consulta de verificação do fim de cada uma.

7. **Teste final.** Ajuda-me a fazer uma marcação a sério no
   cleanstationcar.com com a Detalhada Interior ou Exterior → Exterior, num
   carro. A ficha no CRM e o evento no calendário têm de dizer "Lavagem
   Detalhada Exterior", 130 €, 4 horas. Depois lembra-me de apagar o evento e
   a ficha. Confirma também que `/lavagem-com-selante-braga/` redireciona para
   `/lavagem-automovel-braga/`, e que a página `/protecao-ceramica-braga/`
   abre.

8. **Fecho.** Acrescenta ao bloco de estado no topo do `IMPLANTACAO.md` o que
   foi publicado e quando, faz commit no mesmo ramo e propõe-me abrir o pull
   request para o `main`. Lembra-me do que ficou por rever: o texto da
   Proteção Cerâmica e o prazo de lembrete das duas detalhadas parciais no CRM.
