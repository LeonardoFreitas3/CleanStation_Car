-- =============================================================================
-- CleanStation Car CRM — 0004 vista e pesquisa de clientes
--
-- Correr depois do 0003.
--
-- A lista de clientes precisa de nº de visitas, última visita e total gasto.
-- Calcular isso no browser obrigava a trazer todos os serviços de todos os
-- clientes — insustentável a partir de umas centenas de registos. Fica no
-- Postgres, que já tem os índices.
-- =============================================================================

-- security_invoker: a vista corre com as permissões de quem a consulta, logo
-- o RLS de clients e services continua a aplicar-se. Sem isto seria um túnel
-- por baixo das políticas.
create or replace view public.client_overview
with (security_invoker = true)
as
  select
    c.id,
    c.name,
    c.phone,
    c.email,
    c.client_type,
    c.notes,
    c.data_consent,
    c.marketing_consent,
    c.created_at,
    c.updated_at,
    c.deleted_at,
    coalesce(s.visit_count, 0)   as visit_count,
    coalesce(s.total_spent, 0)   as total_spent,
    s.last_visit_at,
    coalesce(v.vehicle_count, 0) as vehicle_count,
    -- Dias desde a última visita alimentam os follow-ups (fase 2) e o estado
    -- "inativo". null = nunca fez serviço concluído.
    case
      when s.last_visit_at is null then null
      else (extract(epoch from (now() - s.last_visit_at)) / 86400)::integer
    end as days_since_last_visit,
    -- Intervalo médio entre visitas, para sugerir a próxima. Precisa de pelo
    -- menos 2 visitas para haver intervalo.
    case
      when coalesce(s.visit_count, 0) < 2 then null
      else (extract(epoch from (s.last_visit_at - s.first_visit_at))
            / 86400 / (s.visit_count - 1))::integer
    end as avg_days_between_visits
  from public.clients c
  left join lateral (
    select
      count(*)                as visit_count,
      sum(total)              as total_spent,
      max(completed_at)       as last_visit_at,
      min(completed_at)       as first_visit_at
    from public.services
    where client_id = c.id
      and deleted_at is null
      and status in ('concluido', 'entregue')
  ) s on true
  left join lateral (
    select count(*) as vehicle_count
    from public.vehicles
    where client_id = c.id and deleted_at is null
  ) v on true;

revoke all on public.client_overview from anon, authenticated;
grant select on public.client_overview to authenticated;

-- ── Pesquisa ─────────────────────────────────────────────────────────────────
-- Pesquisar por matrícula obriga a cruzar com vehicles, o que o PostgREST não
-- exprime bem num .or(). Uma função resolve tudo num pedido só.
--
-- SECURITY INVOKER (o default): as políticas RLS aplicam-se na mesma, portanto
-- isto não abre caminho a quem não devia ver clientes.

create or replace function public.search_clients(
  q          text default '',
  lim        integer default 25,
  off        integer default 0,
  sort       text default 'recent'
)
returns setof public.client_overview
language sql
stable
set search_path = public, pg_temp
as $$
  select *
  from public.client_overview co
  where co.deleted_at is null
    and (
      nullif(btrim(q), '') is null
      or co.name  ilike '%' || btrim(q) || '%'
      or co.phone ilike '%' || btrim(q) || '%'
      or co.email ilike '%' || btrim(q) || '%'
      or exists (
        select 1 from public.vehicles v
        where v.client_id = co.id
          and v.deleted_at is null
          and (
            v.plate_norm like '%' || upper(regexp_replace(btrim(q), '[^A-Za-z0-9]', '', 'g')) || '%'
            or v.make  ilike '%' || btrim(q) || '%'
            or v.model ilike '%' || btrim(q) || '%'
          )
      )
    )
  order by
    case when sort = 'name'  then co.name end asc,
    case when sort = 'spent' then co.total_spent end desc,
    case when sort = 'visits' then co.visit_count end desc,
    -- 'recent' é o default: quem passou cá há menos tempo primeiro, e quem
    -- nunca veio fica no fim em vez de no topo (nulls last).
    case when sort = 'recent' then co.last_visit_at end desc nulls last,
    co.created_at desc
  limit greatest(1, least(lim, 100))
  offset greatest(0, off);
$$;

-- Contagem para a paginação. Repete o filtro da search_clients de propósito:
-- devolver a contagem junto com as linhas obrigaria a trazer tudo.
create or replace function public.count_clients(q text default '')
returns bigint
language sql
stable
set search_path = public, pg_temp
as $$
  select count(*)
  from public.client_overview co
  where co.deleted_at is null
    and (
      nullif(btrim(q), '') is null
      or co.name  ilike '%' || btrim(q) || '%'
      or co.phone ilike '%' || btrim(q) || '%'
      or co.email ilike '%' || btrim(q) || '%'
      or exists (
        select 1 from public.vehicles v
        where v.client_id = co.id
          and v.deleted_at is null
          and (
            v.plate_norm like '%' || upper(regexp_replace(btrim(q), '[^A-Za-z0-9]', '', 'g')) || '%'
            or v.make  ilike '%' || btrim(q) || '%'
            or v.model ilike '%' || btrim(q) || '%'
          )
      )
    );
$$;

-- O revoke do 0002 só apanhou as funções existentes nessa altura; estas nasceram
-- depois. Sem sessão as políticas RLS já devolviam zero linhas, mas não há razão
-- para o anon sequer as poder chamar.
revoke all on function public.search_clients(text, integer, integer, text) from anon;
revoke all on function public.count_clients(text) from anon;
grant execute on function public.search_clients(text, integer, integer, text) to authenticated;
grant execute on function public.count_clients(text) to authenticated;

-- pg_trgm torna os ILIKE '%x%' indexáveis. Sem isto a pesquisa faz varrimento
-- completo — tolerável em centenas de clientes, mau em milhares.
create extension if not exists pg_trgm;

create index if not exists clients_name_trgm_idx  on public.clients using gin (name gin_trgm_ops);
create index if not exists clients_phone_trgm_idx on public.clients using gin (phone gin_trgm_ops);
create index if not exists vehicles_plate_trgm_idx on public.vehicles using gin (plate_norm gin_trgm_ops);

-- O índice GIN antigo do 0001 usava to_tsvector, que não serve para pesquisa
-- por fragmento. Substituído pelos trigram acima.
drop index if exists public.clients_name_idx;
