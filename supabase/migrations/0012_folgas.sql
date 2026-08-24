-- =============================================================================
-- CleanStation Car CRM — 0012 folgas
--
-- Correr depois do 0011.
--
-- As folgas vivem aqui e nao no Google Calendar de proposito: escrever no
-- calendario a partir do CRM obrigava a expor um endpoint autenticado na Edge
-- Function so para isso. A funcao das marcacoes ja le esta tabela e junta-a
-- aos periodos ocupados, portanto o efeito no site e o mesmo.
-- =============================================================================

create table if not exists public.time_off (
  id         uuid primary key default gen_random_uuid(),
  starts_at  timestamptz not null,
  ends_at    timestamptz not null,
  reason     text,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  constraint time_off_range check (ends_at > starts_at)
);

-- A consulta e sempre "o que se cruza com esta janela", nas duas pontas.
create index if not exists time_off_starts_idx on public.time_off (starts_at);
create index if not exists time_off_ends_idx   on public.time_off (ends_at);

alter table public.time_off enable row level security;
alter table public.time_off force row level security;

-- Qualquer staff marca e desmarca folgas: e uma equipa pequena e a agenda e
-- partilhada. O registo de quem marcou fica em created_by.
drop policy if exists time_off_select on public.time_off;
create policy time_off_select on public.time_off
  for select to authenticated
  using (public.is_staff());

drop policy if exists time_off_insert on public.time_off;
create policy time_off_insert on public.time_off
  for insert to authenticated
  with check (public.is_staff() and created_by = auth.uid());

drop policy if exists time_off_delete on public.time_off;
create policy time_off_delete on public.time_off
  for delete to authenticated
  using (public.is_staff());
