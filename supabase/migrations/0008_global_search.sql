-- =============================================================================
-- CleanStation Car CRM — 0008 pesquisa global
--
-- Correr depois do 0007.
--
-- Um pedido so, tres tabelas. Fazer tres chamadas do frontend e juntar no
-- browser dava resultados a chegar desalinhados e ordenacao impossivel.
-- =============================================================================

create or replace function public.global_search(q text, lim integer default 20)
returns table (
  kind        text,
  id          uuid,
  title       text,
  subtitle    text,
  meta        text,
  client_id   uuid,
  rank        integer
)
language sql
stable
set search_path = public, pg_temp
as $$
  with needle as (
    select
      btrim(q)                                                    as raw,
      '%' || btrim(q) || '%'                                      as like_q,
      '%' || upper(regexp_replace(btrim(q), '[^A-Za-z0-9]', '', 'g')) || '%' as plate_q,
      -- "#142" ou "142" procuram pela referencia curta do servico
      nullif(regexp_replace(btrim(q), '[^0-9]', '', 'g'), '')::bigint as num
  )
  select * from (
    -- Clientes
    select
      'cliente'::text as kind,
      c.id,
      c.name          as title,
      coalesce(c.phone, c.email, '—') as subtitle,
      c.client_type::text as meta,
      c.id            as client_id,
      -- Quem comeca pelo termo aparece antes de quem so o contem
      case when c.name ilike (select raw from needle) || '%' then 0 else 1 end as rank
    from public.clients c, needle n
    where c.deleted_at is null
      and (c.name ilike n.like_q or c.phone ilike n.like_q or c.email ilike n.like_q)

    union all

    -- Viaturas
    select
      'viatura'::text,
      v.id,
      v.plate,
      coalesce(nullif(btrim(concat_ws(' ', v.make, v.model, v.variant)), ''), 'Sem marca'),
      cl.name,
      v.client_id,
      case when v.plate_norm like (select upper(regexp_replace(raw, '[^A-Za-z0-9]', '', 'g')) from needle) || '%' then 0 else 2 end
    from public.vehicles v
    join public.clients cl on cl.id = v.client_id and cl.deleted_at is null,
    needle n
    where v.deleted_at is null
      and (v.plate_norm like n.plate_q or v.make ilike n.like_q or v.model ilike n.like_q)

    union all

    -- Servicos, por referencia curta
    select
      'servico'::text,
      s.id,
      '#' || s.reference || ' · ' || s.service_name,
      cl.name,
      s.status::text,
      s.client_id,
      3
    from public.services s
    join public.clients cl on cl.id = s.client_id,
    needle n
    where s.deleted_at is null
      and n.num is not null
      and s.reference = n.num
  ) results
  order by rank, title
  limit greatest(1, least(lim, 50));
$$;

revoke all on function public.global_search(text, integer) from anon;
grant execute on function public.global_search(text, integer) to authenticated;
