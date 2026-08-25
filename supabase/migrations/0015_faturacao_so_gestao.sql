-- =============================================================================
-- CleanStation Car CRM — 0015 faturacao so para quem manda
--
-- Correr depois do 0014.
--
-- O dashboard_stats() e o follow_ups() estavam concedidos a `authenticated`, que
-- inclui os funcionarios. O menu esconde-lhes o Dashboard e os Follow-ups, mas
-- esconder um botao nao protege nada: bastava chamar o RPC a mao, com a sessao
-- normal, para receber a faturacao do mes, o ticket medio e a lista de clientes
-- a reativar.
--
-- O comentario do 0007 dizia que o SECURITY INVOKER resolvia isto, porque o RLS
-- se aplicava. Aplica-se — mas a politica services_select usa is_staff(), que
-- devolve verdadeiro para qualquer perfil ativo, funcionario incluido. O RLS
-- deixava passar, e a agregacao ia inteira.
--
-- A guarda vai para dentro das funcoes: no Postgres todos os utilizadores da
-- aplicacao sao o mesmo role `authenticated`, portanto nao ha grant que separe
-- um funcionario de um gestor.
--
-- Limite conhecido: o funcionario continua a ver o preco de cada servico, um a
-- um, porque a lista de servicos mostra-lho de proposito. Quem quiser o total
-- soma-o. Isto fecha o atalho, nao o acesso aos numeros — para isso seria
-- preciso tirar as colunas de preco do alcance dele, e ai muda o CRM todo.
-- =============================================================================

-- ── dashboard_stats ──────────────────────────────────────────────────────────
-- Devolve null a quem nao e admin nem gestor. Nao rebenta de proposito: a
-- pagina ja esta fechada no frontend, portanto null so aparece a quem foi
-- procurar o RPC a mao.

create or replace function public.dashboard_stats()
returns json
language sql
stable
set search_path = public, pg_temp
as $$
  select case when public.is_manager() then (
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
    )
  ) else null end;
$$;

revoke all on function public.dashboard_stats() from anon;
grant execute on function public.dashboard_stats() to authenticated;

-- ── follow_ups ───────────────────────────────────────────────────────────────
-- Zero linhas para o funcionario, em vez de erro: e uma lista, e uma lista
-- vazia e a resposta honesta a quem nao tem acesso a ela.

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
  where public.is_manager()
    and co.deleted_at is null
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
