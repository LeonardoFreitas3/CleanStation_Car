-- =============================================================================
-- CleanStation Car CRM — 0001 esquema
--
-- Correr no SQL Editor do Supabase, por ordem numerica, antes do 0002 (RLS).
-- Idempotente: pode voltar a correr sem rebentar.
-- =============================================================================

create extension if not exists pgcrypto;

-- ── Tipos ────────────────────────────────────────────────────────────────────

do $$ begin
  create type public.user_role as enum ('admin', 'manager', 'employee');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.client_type as enum ('particular', 'empresa', 'stand');
exception when duplicate_object then null; end $$;

-- A ordem do enum e a ordem do fluxo no ecra do servico. Nao reordenar sem
-- migrar: o Postgres ordena enums pela posicao de declaracao.
do $$ begin
  create type public.service_status as enum (
    'agendado', 'recebido', 'preparacao', 'lavagem',
    'detalhe_interior', 'detalhe_exterior', 'protecao',
    'controlo_qualidade', 'concluido', 'entregue', 'cancelado'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.photo_type as enum ('before', 'during', 'after');
exception when duplicate_object then null; end $$;

-- ── Funcoes auxiliares ───────────────────────────────────────────────────────
-- As que leem profiles ficam DEPOIS da tabela, mais abaixo: uma funcao
-- `language sql` tem o corpo validado no momento da criacao, ao contrario de
-- plpgsql que adia. Declara-las aqui rebentava com "relation public.profiles
-- does not exist".

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── profiles ─────────────────────────────────────────────────────────────────
-- Nunca guarda passwords: essas vivem exclusivamente em auth.users, gerido
-- pelo Supabase Auth.

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null default '',
  email       text not null default '',
  phone       text,
  role        public.user_role not null default 'employee',
  avatar_url  text,
  -- Inativo por omissao, de proposito. A anon key e publica, portanto quem a
  -- tirar do bundle pode chamar auth.signUp diretamente. Se o perfil nascesse
  -- ativo, essa pessoa passava is_staff() e lia a base de clientes toda.
  -- Assim, uma conta nova nao ve nada ate um admin a ativar.
  -- Desligar os registos publicos no painel do Supabase e a outra metade
  -- desta defesa; esta sobrevive a alguem os voltar a ligar.
  active      boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Funcoes que dependem de profiles ─────────────────────────────────────────
-- SECURITY DEFINER de proposito: as politicas RLS de profiles precisam de ler
-- profiles, o que daria recursao infinita. SECURITY DEFINER ignora RLS e corta
-- o ciclo. search_path fixo para nao ser sequestrada por um schema do
-- utilizador.

create or replace function public.auth_role()
returns public.user_role
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select role from public.profiles where id = auth.uid() and active;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(public.auth_role() = 'admin', false);
$$;

-- admin ou manager
create or replace function public.is_manager()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(public.auth_role() in ('admin', 'manager'), false);
$$;

-- qualquer utilizador com perfil ativo
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.auth_role() is not null;
$$;

-- Cria o perfil automaticamente quando nasce um utilizador no Auth.
-- Todos entram como 'employee'. A promocao a admin e deliberada e manual,
-- ver README — nunca automatica, senao o primeiro a registar-se fica com tudo.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Impede escalada de privilegios: sem isto, um utilizador autenticado com
-- permissao de update no proprio perfil poderia fazer PATCH /profiles?id=eq.<eu>
-- com {"role":"admin"} e promover-se sozinho. A politica RLS de update nao
-- consegue comparar com o valor antigo; um trigger consegue.
create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if public.is_admin() then
    return new;
  end if;
  new.role := old.role;
  new.active := old.active;
  return new;
end;
$$;

drop trigger if exists profiles_protect_privileges on public.profiles;
create trigger profiles_protect_privileges
  before update on public.profiles
  for each row execute function public.protect_profile_privileges();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ── clients ──────────────────────────────────────────────────────────────────

create table if not exists public.clients (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  phone                text,
  email                text,
  client_type          public.client_type not null default 'particular',
  notes                text,
  -- RGPD: guardar tambem QUANDO foi dado, nao so que foi dado. Sem data nao
  -- se prova o consentimento perante a CNPD.
  data_consent         boolean not null default false,
  data_consent_at      timestamptz,
  marketing_consent    boolean not null default false,
  marketing_consent_at timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  created_by           uuid references public.profiles(id) on delete set null,
  deleted_at           timestamptz
);

-- Carimba a data de consentimento sozinho, para nao depender do frontend.
create or replace function public.stamp_consent()
returns trigger
language plpgsql
as $$
begin
  if new.data_consent and (tg_op = 'INSERT' or not old.data_consent) then
    new.data_consent_at := now();
  elsif not new.data_consent then
    new.data_consent_at := null;
  end if;

  if new.marketing_consent and (tg_op = 'INSERT' or not old.marketing_consent) then
    new.marketing_consent_at := now();
  elsif not new.marketing_consent then
    new.marketing_consent_at := null;
  end if;

  return new;
end;
$$;

drop trigger if exists clients_stamp_consent on public.clients;
create trigger clients_stamp_consent
  before insert or update on public.clients
  for each row execute function public.stamp_consent();

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

create index if not exists clients_phone_idx      on public.clients (phone);
create index if not exists clients_email_idx      on public.clients (lower(email));
create index if not exists clients_name_idx       on public.clients using gin (to_tsvector('simple', name));
create index if not exists clients_deleted_at_idx on public.clients (deleted_at) where deleted_at is null;

-- ── vehicles ─────────────────────────────────────────────────────────────────

create table if not exists public.vehicles (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null references public.clients(id) on delete cascade,
  plate      text not null,
  -- Pesquisa por matricula tem de acertar com "12-AB-34", "12 AB 34" e
  -- "12ab34". Coluna gerada + indice resolve sem depender do frontend.
  plate_norm text generated always as (upper(regexp_replace(plate, '[^A-Za-z0-9]', '', 'g'))) stored,
  make       text,
  model      text,
  variant    text,
  year       integer check (year is null or (year between 1900 and 2100)),
  color      text,
  fuel_type  text,
  mileage    integer check (mileage is null or mileage >= 0),
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

drop trigger if exists vehicles_set_updated_at on public.vehicles;
create trigger vehicles_set_updated_at
  before update on public.vehicles
  for each row execute function public.set_updated_at();

create index if not exists vehicles_plate_norm_idx on public.vehicles (plate_norm);
create index if not exists vehicles_client_id_idx  on public.vehicles (client_id);

-- ── service_types (catalogo) ─────────────────────────────────────────────────
-- Preenchido no 0003 com o catalogo real do site publico.

create table if not exists public.service_types (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name       text not null,
  category   text not null,
  base_price numeric(10, 2) not null check (base_price >= 0),
  active     boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists service_types_set_updated_at on public.service_types;
create trigger service_types_set_updated_at
  before update on public.service_types
  for each row execute function public.set_updated_at();

-- ── services ─────────────────────────────────────────────────────────────────

create table if not exists public.services (
  id              uuid primary key default gen_random_uuid(),
  -- numero curto para falar com o cliente ("servico #142")
  reference       bigint generated always as identity,
  client_id       uuid not null references public.clients(id) on delete restrict,
  vehicle_id      uuid references public.vehicles(id) on delete set null,
  employee_id     uuid references public.profiles(id) on delete set null,
  service_type_id uuid references public.service_types(id) on delete set null,

  -- Instantaneo do catalogo no momento do servico. Se a ceramica subir de 250
  -- para 280, os servicos ja feitos tem de continuar a valer 250 no historico
  -- e na faturacao. Por isso nome e preco sao copiados, nao lidos por join.
  service_name    text not null,
  price           numeric(10, 2) not null default 0 check (price >= 0),
  extras_total    numeric(10, 2) not null default 0 check (extras_total >= 0),
  discount        numeric(10, 2) not null default 0 check (discount >= 0),
  total           numeric(10, 2) generated always as (price + extras_total - discount) stored,
  extras          jsonb not null default '[]'::jsonb,

  status          public.service_status not null default 'agendado',
  notes           text,
  scheduled_at    timestamptz,
  started_at      timestamptz,
  completed_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  created_by      uuid references public.profiles(id) on delete set null,
  deleted_at      timestamptz
);

-- Carimba inicio e conclusao a partir do estado, para as metricas nao
-- dependerem de o funcionario se lembrar de preencher datas.
create or replace function public.stamp_service_dates()
returns trigger
language plpgsql
as $$
begin
  if new.status <> 'agendado' and new.started_at is null then
    new.started_at := now();
  end if;

  if new.status in ('concluido', 'entregue') and new.completed_at is null then
    new.completed_at := now();
  end if;

  return new;
end;
$$;

drop trigger if exists services_stamp_dates on public.services;
create trigger services_stamp_dates
  before insert or update on public.services
  for each row execute function public.stamp_service_dates();

drop trigger if exists services_set_updated_at on public.services;
create trigger services_set_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

create index if not exists services_client_id_idx  on public.services (client_id);
create index if not exists services_vehicle_id_idx on public.services (vehicle_id);
create index if not exists services_employee_idx   on public.services (employee_id);
create index if not exists services_status_idx     on public.services (status);
create index if not exists services_created_at_idx on public.services (created_at desc);
create index if not exists services_scheduled_idx  on public.services (scheduled_at);
create index if not exists services_deleted_at_idx on public.services (deleted_at) where deleted_at is null;

-- ── audit_logs ───────────────────────────────────────────────────────────────
-- Append-only: nao ha politica de update nem de delete no 0002, de proposito.

create table if not exists public.audit_logs (
  id          bigint generated always as identity primary key,
  actor_id    uuid references public.profiles(id) on delete set null,
  actor_email text,
  action      text not null,
  table_name  text not null,
  record_id   text,
  changes     jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);
create index if not exists audit_logs_actor_idx      on public.audit_logs (actor_id);
create index if not exists audit_logs_record_idx     on public.audit_logs (table_name, record_id);

-- SECURITY DEFINER para escrever em audit_logs sem dar INSERT a ninguem: o
-- unico caminho ate a tabela e este trigger.
create or replace function public.audit_trigger()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  rec_id text;
  payload jsonb;
begin
  if tg_op = 'DELETE' then
    rec_id := old.id::text;
    payload := to_jsonb(old);
  else
    rec_id := new.id::text;
    -- so o que mudou, senao a tabela cresce sem controlo
    if tg_op = 'UPDATE' then
      select jsonb_object_agg(key, value)
        into payload
        from jsonb_each(to_jsonb(new))
       where to_jsonb(new) -> key is distinct from to_jsonb(old) -> key;
    else
      payload := to_jsonb(new);
    end if;
  end if;

  insert into public.audit_logs (actor_id, actor_email, action, table_name, record_id, changes)
  values (
    auth.uid(),
    (select email from public.profiles where id = auth.uid()),
    lower(tg_op),
    tg_table_name,
    rec_id,
    payload
  );

  return coalesce(new, old);
end;
$$;

drop trigger if exists clients_audit on public.clients;
create trigger clients_audit
  after insert or update or delete on public.clients
  for each row execute function public.audit_trigger();

drop trigger if exists vehicles_audit on public.vehicles;
create trigger vehicles_audit
  after insert or update or delete on public.vehicles
  for each row execute function public.audit_trigger();

drop trigger if exists services_audit on public.services;
create trigger services_audit
  after insert or update or delete on public.services
  for each row execute function public.audit_trigger();

drop trigger if exists profiles_audit on public.profiles;
create trigger profiles_audit
  after insert or update or delete on public.profiles
  for each row execute function public.audit_trigger();
