-- =============================================================================
-- CleanStation Car CRM — 0002 Row Level Security
--
-- Correr depois do 0001.
--
-- Premissa: o frontend nao e barreira de seguranca. Assume-se que um atacante
-- chama a API PostgREST diretamente com a anon key (que e publica por
-- desenho), forja IDs e tenta ler tabelas a mao. Tudo o que se segue tem de
-- aguentar isso sozinho, sem ajuda do React.
-- =============================================================================

-- ── Revogar o acesso por omissao ─────────────────────────────────────────────
-- O Supabase concede privilegios amplos a anon/authenticated no schema public.
-- Retiramos tudo ao anon: nada no CRM deve ser legivel sem sessao.

revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
revoke all on all functions in schema public from anon;

alter default privileges in schema public revoke all on tables from anon;

-- ── Ligar RLS ────────────────────────────────────────────────────────────────

alter table public.profiles      enable row level security;
alter table public.clients       enable row level security;
alter table public.vehicles      enable row level security;
alter table public.service_types enable row level security;
alter table public.services      enable row level security;
alter table public.audit_logs    enable row level security;

-- Aplica RLS tambem ao dono das tabelas. Sem isto, qualquer coisa que corra
-- como owner ignora as politicas silenciosamente.
alter table public.profiles      force row level security;
alter table public.clients       force row level security;
alter table public.vehicles      force row level security;
alter table public.service_types force row level security;
alter table public.services      force row level security;
alter table public.audit_logs    force row level security;

-- ── profiles ─────────────────────────────────────────────────────────────────

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated
  using (public.is_staff());

-- Cada um edita o seu perfil (nome, telefone, avatar). O trigger
-- profiles_protect_privileges do 0001 reverte alteracoes a role e a active
-- para quem nao e admin, portanto um PATCH com {"role":"admin"} passa na
-- politica mas nao produz efeito.
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin on public.profiles
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists profiles_delete_admin on public.profiles;
create policy profiles_delete_admin on public.profiles
  for delete to authenticated
  using (public.is_admin());

-- Sem politica de INSERT de proposito: perfis nascem exclusivamente do trigger
-- handle_new_user, que corre em SECURITY DEFINER.

-- ── clients ──────────────────────────────────────────────────────────────────
-- Qualquer funcionario ativo precisa de ver e criar clientes para trabalhar.
-- Eliminados (soft delete) desaparecem para todos menos admin.

drop policy if exists clients_select on public.clients;
create policy clients_select on public.clients
  for select to authenticated
  using (public.is_staff() and (deleted_at is null or public.is_admin()));

drop policy if exists clients_insert on public.clients;
create policy clients_insert on public.clients
  for insert to authenticated
  with check (public.is_staff());

drop policy if exists clients_update on public.clients;
create policy clients_update on public.clients
  for update to authenticated
  using (public.is_staff() and (deleted_at is null or public.is_admin()))
  with check (public.is_staff());

-- Apagar de vez e so do admin. O caminho normal e soft delete (deleted_at),
-- que passa pela politica de update.
drop policy if exists clients_delete on public.clients;
create policy clients_delete on public.clients
  for delete to authenticated
  using (public.is_admin());

-- ── vehicles ─────────────────────────────────────────────────────────────────

drop policy if exists vehicles_select on public.vehicles;
create policy vehicles_select on public.vehicles
  for select to authenticated
  using (public.is_staff() and (deleted_at is null or public.is_admin()));

drop policy if exists vehicles_insert on public.vehicles;
create policy vehicles_insert on public.vehicles
  for insert to authenticated
  with check (public.is_staff());

drop policy if exists vehicles_update on public.vehicles;
create policy vehicles_update on public.vehicles
  for update to authenticated
  using (public.is_staff() and (deleted_at is null or public.is_admin()))
  with check (public.is_staff());

drop policy if exists vehicles_delete on public.vehicles;
create policy vehicles_delete on public.vehicles
  for delete to authenticated
  using (public.is_admin());

-- ── service_types (catalogo) ─────────────────────────────────────────────────
-- Todos leem, so o admin mexe nos precos.

drop policy if exists service_types_select on public.service_types;
create policy service_types_select on public.service_types
  for select to authenticated
  using (public.is_staff());

drop policy if exists service_types_write on public.service_types;
create policy service_types_write on public.service_types
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ── services ─────────────────────────────────────────────────────────────────
-- O funcionario ve todos os servicos de proposito: na pratica pega em
-- trabalho que nao lhe foi atribuido, e restringir a employee_id = auth.uid()
-- partiria o fluxo da oficina.
--
-- Nota sobre "informacao financeira": o RLS e ao nivel da linha, nao da
-- coluna, portanto nao esconde services.price de um employee — e ele precisa
-- do preco para falar com o cliente. O que fica vedado e o agregado
-- (faturacao, ticket medio), que vive nas views do 0002 restritas a manager.

drop policy if exists services_select on public.services;
create policy services_select on public.services
  for select to authenticated
  using (public.is_staff() and (deleted_at is null or public.is_admin()));

drop policy if exists services_insert on public.services;
create policy services_insert on public.services
  for insert to authenticated
  with check (public.is_staff());

drop policy if exists services_update on public.services;
create policy services_update on public.services
  for update to authenticated
  using (public.is_staff() and (deleted_at is null or public.is_admin()))
  with check (public.is_staff());

drop policy if exists services_delete on public.services;
create policy services_delete on public.services
  for delete to authenticated
  using (public.is_admin());

-- ── audit_logs ───────────────────────────────────────────────────────────────
-- Append-only e so o admin le. Nao existe politica de insert, update ou
-- delete: o unico caminho de escrita e o trigger audit_trigger do 0001, que
-- corre em SECURITY DEFINER e por isso ignora RLS. Um utilizador nao consegue
-- forjar nem apagar registos de auditoria.

drop policy if exists audit_logs_select on public.audit_logs;
create policy audit_logs_select on public.audit_logs
  for select to authenticated
  using (public.is_admin());

revoke insert, update, delete on public.audit_logs from authenticated;

-- ── Agregados financeiros ────────────────────────────────────────────────────
-- security_invoker: a view corre com as permissoes de quem a consulta, logo o
-- RLS de services aplica-se na mesma. Sem isto a view seria um buraco por onde
-- se contornavam as politicas.

create or replace view public.monthly_revenue
with (security_invoker = true)
as
  select
    date_trunc('month', coalesce(completed_at, created_at)) as month,
    count(*)                                                as service_count,
    sum(total)                                              as revenue,
    avg(total)                                              as avg_ticket
  from public.services
  where deleted_at is null
    and status in ('concluido', 'entregue')
  group by 1
  order by 1 desc;

revoke all on public.monthly_revenue from anon, authenticated;
grant select on public.monthly_revenue to authenticated;
