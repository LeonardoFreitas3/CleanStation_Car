-- =============================================================================
-- CleanStation Car CRM — 0016 quem distribui o trabalho e o admin
--
-- Correr depois do 0015.
--
-- Duas coisas, que sao a mesma pergunta: quem faz o servico.
--
-- 1) Ate aqui qualquer perfil ativo podia mexer no employee_id: a
--    services_update usa is_staff(), e a ficha do servico mostrava a caixa de
--    escolha a toda a gente. Um funcionario podia pegar num trabalho do colega
--    e passa-lo para si, ou o contrario. Passa a ser so do administrador, que
--    distribui a semana no inicio dela.
--
-- 2) Enquanto houver um unico funcionario nao ha nada para distribuir: o
--    servico e dele. A regra fica na base de dados e nao no CRM porque as
--    marcacoes feitas no site criam servicos pela Edge Function booking, sem
--    passar pelo frontend — ficavam todas por atribuir.
--
-- Nao da para fazer isto so com RLS: uma politica de UPDATE ve a linha antiga
-- no USING e a nova no WITH CHECK, mas nunca as duas ao mesmo tempo, portanto
-- nao consegue dizer "esta coluna nao mudou". E preciso um trigger — o mesmo
-- padrao do protect_profile_privileges do 0001, que ja guarda o role e o active
-- da mesma maneira.
--
-- O funcionario continua a poder tudo o resto no servico: mudar o estado,
-- escrever notas, tirar fotografias. So nao escolhe quem o faz.
--
-- ATENCAO, a mesma armadilha do 0001: no SQL Editor nao ha JWT, portanto
-- auth.uid() e NULL, is_admin() e false, e este trigger reverte a atribuicao
-- SEM DAR ERRO. Para atribuir a mao pelo SQL Editor e preciso desligar o
-- trigger primeiro. Pela API, com um admin autenticado, funciona normalmente.
-- =============================================================================

-- Fora antes do preenchimento la em baixo: se ficasse de pe, revertia-o em
-- silencio numa segunda passagem por este ficheiro.
drop trigger if exists services_protect_assignment on public.services;

create or replace function public.protect_service_assignment()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- Quem nao e admin nao escolhe: num servico novo nao atribui a ninguem, numa
  -- edicao fica com quem la estava.
  if not public.is_admin() then
    if tg_op = 'UPDATE' then
      new.employee_id := old.employee_id;
      return new;
    end if;
    new.employee_id := null;
  end if;

  -- Um so funcionario ativo: nao ha distribuicao nenhuma a fazer, o trabalho e
  -- dele. Com dois ou mais nao se adivinha — fica por atribuir e o admin
  -- distribui. Vale para o admin tambem: se ele criar um servico sem escolher
  -- ninguem, o resultado deve ser o mesmo.
  if new.employee_id is null
     and (select count(*) from public.profiles where active and role = 'employee') = 1
  then
    select id into new.employee_id
      from public.profiles
     where active and role = 'employee';
  end if;

  return new;
end;
$$;

-- ── O que ja la esta ─────────────────────────────────────────────────────────
-- A regra so apanha o que entra a partir de agora. Os servicos que estao por
-- atribuir ficariam por atribuir para sempre.
--
-- Fora os cancelados e os apagados: atribuir trabalho que nao se vai fazer nao
-- diz nada a ninguem. Os concluidos entram, e isso conta para o total do
-- team_overview — o que e verdade se ele foi mesmo quem os fez.

update public.services s
   set employee_id = (select id from public.profiles where active and role = 'employee')
 where s.employee_id is null
   and s.deleted_at is null
   and s.status <> 'cancelado'
   and (select count(*) from public.profiles where active and role = 'employee') = 1;

create trigger services_protect_assignment
  before insert or update on public.services
  for each row execute function public.protect_service_assignment();
