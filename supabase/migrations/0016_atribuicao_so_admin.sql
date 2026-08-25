-- =============================================================================
-- CleanStation Car CRM — 0016 quem distribui o trabalho e o admin
--
-- Correr depois do 0015.
--
-- Ate aqui qualquer perfil ativo podia mexer no employee_id: a services_update
-- usa is_staff(), e o funcionario tinha a mesma caixa de escolha na ficha do
-- servico. Podia pegar num trabalho do colega e passa-lo para si, ou o
-- contrario. Quem distribui o trabalho passa a ser so o administrador.
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

create or replace function public.protect_service_assignment()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  -- Num servico novo, quem nao e admin nao atribui a ninguem: fica por
  -- atribuir e o administrador distribui depois.
  if tg_op = 'INSERT' then
    new.employee_id := null;
    return new;
  end if;

  new.employee_id := old.employee_id;
  return new;
end;
$$;

drop trigger if exists services_protect_assignment on public.services;
create trigger services_protect_assignment
  before insert or update on public.services
  for each row execute function public.protect_service_assignment();
