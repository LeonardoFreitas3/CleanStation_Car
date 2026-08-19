-- =============================================================================
-- CleanStation Car CRM — 0009 gestao de equipa
--
-- Correr depois do 0008.
-- =============================================================================

-- ── Protecao contra ficar sem administradores ────────────────────────────────
-- Sem isto, um admin podia despromover-se ou desativar-se a si proprio e
-- ninguem voltava a conseguir gerir funcionarios, precos ou definicoes. A
-- unica saida seria o SQL Editor, com o truque de desligar o trigger.
--
-- Vale para UPDATE e DELETE, e nao depende do frontend: mesmo um PATCH direto
-- a API embate aqui.

create or replace function public.prevent_last_admin_lockout()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  remaining integer;
begin
  if tg_op = 'DELETE' then
    if old.role <> 'admin' or not old.active then
      return old;
    end if;
  else
    -- Continua a ser admin ativo: nada a verificar.
    if new.role = 'admin' and new.active then
      return new;
    end if;
    -- Ja nao era admin ativo antes: nada se perde.
    if old.role <> 'admin' or not old.active then
      return new;
    end if;
  end if;

  select count(*) into remaining
  from public.profiles
  where role = 'admin' and active and id <> old.id;

  if remaining = 0 then
    raise exception 'Não é possível remover o último administrador ativo'
      using errcode = 'check_violation';
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

drop trigger if exists profiles_prevent_lockout on public.profiles;
create trigger profiles_prevent_lockout
  before update or delete on public.profiles
  for each row execute function public.prevent_last_admin_lockout();

-- ── Equipa ───────────────────────────────────────────────────────────────────
-- A politica profiles_select do 0002 ja deixa qualquer staff ver os perfis —
-- e preciso para mostrar quem fez cada servico. Esta vista acrescenta so a
-- contagem de trabalho, para a pagina de equipa nao ter de fazer N consultas.

create or replace view public.team_overview
with (security_invoker = true)
as
  select
    p.id,
    p.full_name,
    p.email,
    p.phone,
    p.role,
    p.active,
    p.created_at,
    coalesce(s.total_services, 0)     as total_services,
    coalesce(s.services_month, 0)     as services_month,
    s.last_service_at
  from public.profiles p
  left join lateral (
    select
      count(*)                                                          as total_services,
      count(*) filter (where created_at >= date_trunc('month', now()))  as services_month,
      max(created_at)                                                   as last_service_at
    from public.services
    where employee_id = p.id and deleted_at is null
  ) s on true;

revoke all on public.team_overview from anon, authenticated;
grant select on public.team_overview to authenticated;
