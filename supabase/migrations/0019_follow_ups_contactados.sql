-- =============================================================================
-- CleanStation Car CRM — 0019 saber a quem ja se ligou
--
-- Correr depois do 0018.
--
-- A lista de follow-ups mostrava sempre os mesmos clientes, sem dizer se ja
-- tinham sido contactados. Quem abrisse a pagina duas vezes na mesma semana
-- nao tinha como saber a quem ja tinha mandado mensagem — e mandava outra.
--
-- O registo ja existia: a message_logs guarda cada mensagem preparada, com
-- is_marketing a separar a reativacao da comunicacao do servico. O que faltava
-- era a lista olhar para ele.
--
-- Vem do SQL e nao do frontend porque e aqui que vive a regra de quem entra na
-- lista, e ter metade do criterio em cada lado era garantir que um dia
-- discordavam.
--
-- Mantem a guarda do 0015: isto continua fora do alcance do funcionario.
--
-- O tipo de retorno muda, portanto e drop e nao replace — o create or replace
-- recusa mudar a assinatura. Com o drop vai-se o grant, que e refeito no fim.
-- =============================================================================

drop function if exists public.follow_ups(integer);

create function public.follow_ups(min_days integer default 30)
returns table (
  id                      uuid,
  name                    text,
  phone                   text,
  marketing_consent       boolean,
  visit_count             integer,
  total_spent             numeric,
  last_visit_at           timestamptz,
  days_since_last_visit   integer,
  avg_days_between_visits integer,
  last_service_name       text,
  last_contacted_at       timestamptz,
  bucket                  text
)
language sql
stable
set search_path = public, pg_temp
as $$
  select
    co.id,
    co.name,
    co.phone,
    co.marketing_consent,
    co.visit_count,
    co.total_spent,
    co.last_visit_at,
    co.days_since_last_visit,
    co.avg_days_between_visits,
    (select s.service_name
       from public.services s
      where s.client_id = co.id and s.deleted_at is null
        and s.status in ('concluido','entregue')
      order by s.completed_at desc nulls last
      limit 1) as last_service_name,
    (select max(m.created_at)
       from public.message_logs m
      where m.client_id = co.id and m.is_marketing) as last_contacted_at,
    case
      when co.days_since_last_visit >= 120 then 'reativacao'
      when co.days_since_last_visit >= 90  then 'perdido'
      when co.days_since_last_visit >= 60  then 'follow_up'
      else 'manutencao'
    end as bucket
  from public.client_overview co
  where public.is_manager()
    and co.deleted_at is null
    and co.days_since_last_visit is not null
    and co.days_since_last_visit >= greatest(min_days, 1)
    -- Quem tem ritmo conhecido so entra depois de o ultrapassar: um cliente
    -- que vem de 60 em 60 dias nao deve aparecer aos 30.
    and (co.avg_days_between_visits is null
         or co.days_since_last_visit >= co.avg_days_between_visits)
  -- Quem ainda nao foi contactado primeiro: a lista serve para decidir a quem
  -- ligar a seguir, e quem ja levou mensagem nao e o proximo da fila.
  order by (select max(m.created_at) from public.message_logs m
             where m.client_id = co.id and m.is_marketing) asc nulls first,
           co.days_since_last_visit desc;
$$;

revoke all on function public.follow_ups(integer) from anon;
grant execute on function public.follow_ups(integer) to authenticated;
