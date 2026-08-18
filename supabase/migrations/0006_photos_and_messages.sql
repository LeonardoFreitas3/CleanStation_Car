-- =============================================================================
-- CleanStation Car CRM — 0006 fotografias e mensagens
--
-- Correr depois do 0005.
-- =============================================================================

-- ── service_photos ───────────────────────────────────────────────────────────
-- Metadados na base de dados, ficheiros no Storage. Guardar imagens em bytea
-- incha a base, estraga os backups e nao permite URLs assinados.

create table if not exists public.service_photos (
  id           uuid primary key default gen_random_uuid(),
  service_id   uuid not null references public.services(id) on delete cascade,
  storage_path text not null unique,
  photo_type   public.photo_type not null,
  uploaded_by  uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now()
);

create index if not exists service_photos_service_idx on public.service_photos (service_id, photo_type);

alter table public.service_photos enable row level security;
alter table public.service_photos force row level security;

drop policy if exists service_photos_select on public.service_photos;
create policy service_photos_select on public.service_photos
  for select to authenticated
  using (public.is_staff());

drop policy if exists service_photos_insert on public.service_photos;
create policy service_photos_insert on public.service_photos
  for insert to authenticated
  with check (public.is_staff());

-- Apagar fotografias e destrutivo e nao ha razao para um employee o fazer.
drop policy if exists service_photos_delete on public.service_photos;
create policy service_photos_delete on public.service_photos
  for delete to authenticated
  using (public.is_manager());

drop trigger if exists service_photos_audit on public.service_photos;
create trigger service_photos_audit
  after insert or delete on public.service_photos
  for each row execute function public.audit_trigger();

-- ── Storage ──────────────────────────────────────────────────────────────────
-- Bucket privado: fotografias de viaturas de clientes nunca sao publicas.
-- O acesso faz-se com URLs assinados, de validade curta.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'service-photos',
  'service-photos',
  false,
  10485760,  -- 10 MB; o cliente ja comprime antes de enviar
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- As politicas do Storage sao politicas RLS sobre storage.objects.

drop policy if exists service_photos_read on storage.objects;
create policy service_photos_read on storage.objects
  for select to authenticated
  using (bucket_id = 'service-photos' and public.is_staff());

drop policy if exists service_photos_write on storage.objects;
create policy service_photos_write on storage.objects
  for insert to authenticated
  with check (bucket_id = 'service-photos' and public.is_staff());

drop policy if exists service_photos_remove on storage.objects;
create policy service_photos_remove on storage.objects
  for delete to authenticated
  using (bucket_id = 'service-photos' and public.is_manager());

-- ── message_templates ────────────────────────────────────────────────────────

create table if not exists public.message_templates (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name       text not null,
  category   text not null,
  content    text not null,
  active     boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists message_templates_set_updated_at on public.message_templates;
create trigger message_templates_set_updated_at
  before update on public.message_templates
  for each row execute function public.set_updated_at();

alter table public.message_templates enable row level security;
alter table public.message_templates force row level security;

drop policy if exists message_templates_select on public.message_templates;
create policy message_templates_select on public.message_templates
  for select to authenticated
  using (public.is_staff());

-- So o admin edita mensagens: sao texto que sai em nome da empresa.
drop policy if exists message_templates_write on public.message_templates;
create policy message_templates_write on public.message_templates
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ── message_logs ─────────────────────────────────────────────────────────────
-- Registo do que foi enviado. Necessario para o RGPD: se um cliente perguntar
-- que comunicacoes recebeu, tem de haver resposta.

create table if not exists public.message_logs (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references public.clients(id) on delete cascade,
  service_id   uuid references public.services(id) on delete set null,
  template_id  uuid references public.message_templates(id) on delete set null,
  channel      text not null default 'whatsapp',
  content      text not null,
  -- Separa comunicacao operacional de marketing. O RGPD trata-as de forma
  -- diferente: a primeira e necessaria a execucao do servico, a segunda exige
  -- consentimento.
  is_marketing boolean not null default false,
  sent_by      uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now()
);

create index if not exists message_logs_client_idx on public.message_logs (client_id, created_at desc);

alter table public.message_logs enable row level security;
alter table public.message_logs force row level security;

drop policy if exists message_logs_select on public.message_logs;
create policy message_logs_select on public.message_logs
  for select to authenticated
  using (public.is_staff());

drop policy if exists message_logs_insert on public.message_logs;
create policy message_logs_insert on public.message_logs
  for insert to authenticated
  with check (public.is_staff());

-- ── Mensagens iniciais ───────────────────────────────────────────────────────
-- As variaveis {{nome}}, {{veiculo}}, {{matricula}}, {{servico}} e {{etapa}}
-- sao substituidas no frontend antes de abrir o WhatsApp.

insert into public.message_templates (slug, name, category, content, sort_order) values
  ('rececao', 'Carro recebido', 'rececao',
   'Olá {{nome}}! Já recebemos o seu {{veiculo}}. Vamos começar o processo de preparação. Assim que avançarmos, enviamos algumas fotografias para poder acompanhar o trabalho.', 10),
  ('inicio', 'Processo iniciado', 'inicio',
   'Olá {{nome}}! Já iniciámos o trabalho no seu {{veiculo}}. Estamos agora na fase de {{etapa}}.', 20),
  ('interior', 'Limpeza interior', 'interior',
   'Entrámos agora na fase de limpeza interior do {{veiculo}}. Estamos a tratar cada zona individualmente para obter o melhor resultado possível.', 30),
  ('exterior', 'Trabalho exterior', 'exterior',
   'Já estamos a trabalhar no exterior do {{veiculo}}. Estamos a tratar especialmente as zonas com maior acumulação de sujidade.', 40),
  ('controlo', 'Controlo final', 'controlo',
   'Estamos na fase final do serviço. Estamos agora a verificar todos os detalhes antes da entrega.', 50),
  ('conclusao', 'Serviço concluído', 'conclusao',
   'Está concluído, {{nome}}. O seu {{veiculo}} está pronto para ser entregue. Fizemos o controlo final para garantir que todos os detalhes ficaram tratados.', 60)
on conflict (slug) do update set
  name       = excluded.name,
  category   = excluded.category,
  content    = excluded.content,
  sort_order = excluded.sort_order;
