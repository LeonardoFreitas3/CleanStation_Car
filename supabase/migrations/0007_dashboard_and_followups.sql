-- =============================================================================
-- CleanStation Car CRM — 0007 dashboard e follow-ups
--
-- Correr depois do 0006.
--
-- As metricas sao agregadas no Postgres e devolvidas numa linha so. Calcula-las
-- no browser obrigava a trazer o historico inteiro a cada abertura do
-- dashboard.
-- =============================================================================

-- SECURITY INVOKER (o default): o RLS de services e clients aplica-se, portanto
-- isto nao abre caminho a quem nao devia ver faturacao. O acesso ao dashboard
-- e restringido a admin e manager no frontend; aqui garante-se que sem sessao
-- valida nao sai nada.
create or replace function public.dashboard_stats()
returns json
language sql
stable
set search_path = public, pg_temp
as $$
  with
  bounds as (
    select
      date_trunc('month', now())                     as month_start,
      date_trunc('month', now() - interval '1 month') as prev_start,
      date_trunc('day', now())                        as today_start,
      date_trunc('day', now()) + interval '1 day'     as today_end
  ),
  done as (
    select s.*, b.*
    from public.services s cross join bounds b
    where s.deleted_at is null and s.status in ('concluido', 'entregue')
  ),
  this_month as (
    select count(*) as n, coalesce(sum(total), 0) as revenue, coalesce(avg(total), 0) as ticket
    from done where coalesce(completed_at, created_at) >= month_start
  ),
  prev_month as (
    select count(*) as n, coalesce(sum(total), 0) as revenue, coalesce(avg(total), 0) as ticket
    from done
    where coalesce(completed_at, created_at) >= prev_start
      and coalesce(completed_at, created_at) < month_start
  )
  select json_build_object(
    'clients_total',      (select count(*) from public.clients where deleted_at is null),
    'clients_new_month',  (select count(*) from public.clients, bounds
                            where deleted_at is null and created_at >= month_start),
    'clients_returning',  (select count(*) from public.client_overview where deleted_at is null and visit_count >= 2),
    'services_month',     (select n from this_month),
    'services_prev',      (select n from prev_month),
    'revenue_month',      (select revenue from this_month),
    'revenue_prev',       (select revenue from prev_month),
    'ticket_month',       (select ticket from this_month),
    'ticket_prev',        (select ticket from prev_month),
    'scheduled_today',    (select count(*) from public.services, bounds
                            where deleted_at is null and scheduled_at >= today_start
                              and scheduled_at < today_end and status <> 'cancelado'),
    'in_progress',        (select count(*) from public.services
                            where deleted_at is null
                              and status in ('recebido','preparacao','lavagem','detalhe_interior',
                                             'detalhe_exterior','protecao','controlo_qualidade')),
    'follow_ups',         (select count(*) from public.client_overview
                            where deleted_at is null and days_since_last_visit >= 30),
    'top_services',       (select coalesce(json_agg(t), '[]'::json) from (
                            select service_name as name, count(*) as count, sum(total) as revenue
                            from done group by service_name order by count(*) desc limit 5
                          ) t),
    'revenue_by_month',   (select coalesce(json_agg(m order by m.month), '[]'::json) from (
                            select to_char(date_trunc('month', coalesce(completed_at, created_at)), 'YYYY-MM') as month,
                                   sum(total) as revenue, count(*) as count
                            from done
                            where coalesce(completed_at, created_at) >= date_trunc('month', now() - interval '11 months')
                            group by 1
                          ) m)
  );
$$;

revoke all on function public.dashboard_stats() from anon;
grant execute on function public.dashboard_stats() to authenticated;

-- ── Follow-ups ───────────────────────────────────────────────────────────────
-- Nao assume que todos os clientes voltam ao mesmo ritmo: usa o intervalo medio
-- de cada um quando existe, e as janelas fixas so para quem ainda nao tem
-- historico suficiente.

create or replace function public.follow_ups(min_days integer default 30)
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
    case
      when co.days_since_last_visit >= 120 then 'reativacao'
      when co.days_since_last_visit >= 90  then 'perdido'
      when co.days_since_last_visit >= 60  then 'follow_up'
      else 'manutencao'
    end as bucket
  from public.client_overview co
  where co.deleted_at is null
    and co.days_since_last_visit is not null
    and co.days_since_last_visit >= greatest(min_days, 1)
    -- Quem tem ritmo conhecido so entra depois de o ultrapassar: um cliente
    -- que vem de 60 em 60 dias nao deve aparecer aos 30.
    and (co.avg_days_between_visits is null
         or co.days_since_last_visit >= co.avg_days_between_visits)
  order by co.days_since_last_visit desc;
$$;

revoke all on function public.follow_ups(integer) from anon;
grant execute on function public.follow_ups(integer) to authenticated;
