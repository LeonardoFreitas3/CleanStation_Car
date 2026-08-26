-- =============================================================================
-- CleanStation Car CRM — 0026 saber quem ficou a dever
--
-- Correr depois do 0025.
--
-- O servico guarda o preco, os extras, o desconto e o total. Nao guarda se
-- aquele dinheiro entrou.
--
-- O dashboard chama "faturacao do mes" a soma dos totais dos servicos
-- concluidos. E o que foi *cobrado*. O que foi *recebido* pode ser outro numero
-- e ninguem tem como saber qual — nem responder a "quanto e que me devem".
--
-- Uma coluna e nao uma tabela de pagamentos: a pergunta e "este servico esta
-- pago?", e a resposta cabe numa data. Uma tabela ao lado dava para registar
-- pagamentos parciais e varios metodos, que e outro problema e ainda nao e
-- este.
--
-- Uma data e nao um booleano, pela razao do 0021: saber *quando* responde a
-- "ha quanto tempo esta por cobrar", e um sim/nao nao responde a nada.
--
-- Nao ha metodo de pagamento. Dinheiro ou MB Way responde a "quanto tenho na
-- caixa ao fim do dia", que e fechar o dia e nao saber quem deve. Uma coluna a
-- mais quando for preciso.
--
-- Nao se carimba sozinho no 'entregue', ao contrario do delivered_at do 0025.
-- Um carimbo automatico dizia que estava tudo pago sempre — que e exatamente a
-- resposta errada, e a que o CRM ja dava.
-- =============================================================================

alter table public.services
  add column if not exists paid_at timestamptz;

-- A lista "por cobrar" e a unica consulta que isto serve: acabados e por pagar.
create index if not exists services_por_cobrar_idx
  on public.services (completed_at)
  where paid_at is null and deleted_at is null and status in ('concluido', 'entregue');

-- ── Quem marca como pago ─────────────────────────────────────────────────────
--
-- Nao ha politica nova. A services_update do 0002 ja deixa qualquer staff
-- escrever no servico, e isso e o que se quer: quem recebe o dinheiro ao balcao
-- e o funcionario, e obrigar a chamar o gestor para carimbar o pagamento era
-- inventar uma fila onde nao ha nenhuma.
--
-- O total por cobrar e outra conversa e vai para o dashboard_stats(), que desde
-- o 0015 devolve null a quem nao e gestor. O funcionario carrega no botao e nao
-- ve a soma — que e a mesma linha que o 0015 tracou para a faturacao.

-- ── O numero no dashboard ────────────────────────────────────────────────────
--
-- Reescrita por inteiro e nao alterada: uma funcao `language sql` nao se
-- remenda por pedacos. O corpo e o do 0015 com dois campos a mais no fim, e a
-- guarda do is_manager() intacta.
--
-- Conta os concluidos e entregues de sempre, e nao so os do mes: uma divida de
-- marco continua a ser uma divida em agosto, e limita-la ao mes corrente fazia
-- o numero desaparecer no dia 1 sem ninguem ter pago nada.

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
                                and status in ('recebido','preparacao','lavagem','detalhe_interior',
                                               'detalhe_exterior','protecao','controlo_qualidade')),
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

-- ── O historico ──────────────────────────────────────────────────────────────
--
-- Os servicos que ja estao concluidos ficam por pagar, porque e o que a base de
-- dados sabe: ninguem carimbou nada. Marca-los todos como pagos seria inventar
-- um facto, e marcar so alguns seria inventar dois.
--
-- Na pratica, no primeiro dia a lista "Por cobrar" traz o historico todo. Quem
-- souber que estao pagos carimba-os; o que sobrar e a divida a serio. Correr
-- isto resolve de uma vez, se for esse o caso — **so depois de olhar para a
-- lista**:
--
--   update public.services
--      set paid_at = coalesce(completed_at, created_at)
--    where paid_at is null and deleted_at is null
--      and status in ('concluido','entregue')
--      and coalesce(completed_at, created_at) < '2026-08-26';
