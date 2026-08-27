-- =============================================================================
-- CleanStation Car CRM — 0028 que fases avisam o cliente
--
-- Correr depois do 0027, **e não no mesmo script**: usa o valor de enum que ele
-- cria, e um valor novo não pode ser usado na transação que o criou.
--
-- Três avisos por lavagem: começámos, estamos a meio, terminámos. O que decide
-- quais são não é código — é uma coluna.
--
-- ── Uma coluna, e não uma tabela de mapeamento ─────────────────────────────
--
-- A pergunta é "quando o serviço chegar a este estado, que mensagem sai?", e a
-- message_templates já tem as mensagens todas, já é editável nas Definições e
-- já tem quem as escreveu e quando. Uma tabela ao lado só para guardar um par
-- estado/modelo pagava-se em joins para sempre.
--
-- Nulo é o valor por omissão e quer dizer "nunca sai sozinha". Os modelos que
-- ficam com nulo — receção, trabalho exterior, controlo final — continuam a
-- existir para envio à mão, como sempre estiveram.
--
-- O índice único não é decorativo: dois modelos apontados ao mesmo estado
-- mandavam duas mensagens ao cliente na mesma fase, e a segunda parecia um
-- erro do sistema a quem a recebesse.
-- =============================================================================

alter table public.message_templates
  add column if not exists auto_status public.service_status;

create unique index if not exists message_templates_auto_status_idx
  on public.message_templates (auto_status)
  where auto_status is not null;

-- ── O modelo da fase do meio ────────────────────────────────────────────────
-- Os outros dois já existem desde o 0006. Este é novo porque a fase é nova.

insert into public.message_templates (slug, name, category, content, sort_order) values
  ('meio_lavagem', 'A meio da lavagem', 'meio',
   'Olá {{nome}}! Estamos a meio do trabalho no seu {{veiculo}}. Está tudo a correr bem — avisamos assim que estiver pronto.', 25)
on conflict (slug) do update set
  name       = excluded.name,
  category   = excluded.category,
  content    = excluded.content,
  sort_order = excluded.sort_order;

-- ── As três fases que avisam ───────────────────────────────────────────────
--
-- Muda-se nas Definições, numa caixa de escolha, sem SQL e sem deploy. Isto é
-- só o ponto de partida.
--
-- O 'entregue' fica de fora de proposito: e quando o cliente esta ao balcao a
-- levantar o carro. Uma mensagem nesse momento e ruido.

update public.message_templates set auto_status = 'lavagem'      where slug = 'inicio';
update public.message_templates set auto_status = 'meio_lavagem' where slug = 'meio_lavagem';
update public.message_templates set auto_status = 'concluido'    where slug = 'conclusao';

-- ── O dashboard tem de saber contar a fase nova ─────────────────────────────
--
-- O in_progress listava os estados um a um, e uma fase nova ficava de fora sem
-- dar erro: o numero "Em curso" passava a mentir por defeito, e ninguem repara
-- num numero que esta so um abaixo.
--
-- Passa a dizer o que **nao** e trabalho em curso, que e uma lista que nao
-- cresce: agendado ainda nao comecou, os outros tres ja acabaram. Qualquer fase
-- que se acrescente daqui para a frente entra na conta sozinha.
--
-- Reescrita por inteiro outra vez, como no 0026: uma funcao `language sql` nao
-- se remenda por pedacos. O resto do corpo e igual ao do 0026.

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
    ),
    por_cobrar as (
      select count(*) as n, coalesce(sum(total), 0) as amount
      from done where paid_at is null
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
                                and status not in ('agendado', 'concluido', 'entregue', 'cancelado')),
      'follow_ups',         (select count(*) from public.client_overview
                              where deleted_at is null and days_since_last_visit >= 30),
      'unpaid_count',       (select n from por_cobrar),
      'unpaid_total',       (select amount from por_cobrar),
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
