-- =============================================================================
-- CleanStation Car CRM — 0014 definicoes
--
-- Correr depois do 0013.
--
-- Os limiares de VIP estavam fixos no codigo (config.ts). Mudar "cliente VIP a
-- partir de 500 EUR" obrigava a recompilar e publicar o site — coisa que o
-- admin nao faz nem deve ter de pedir.
--
-- As janelas de follow-up ficam de fora de proposito: vivem dentro da funcao
-- follow_ups() do 0007. Traze-las para aqui criava duas verdades, e a que
-- conta e a do SQL.
-- =============================================================================

-- Linha unica. Uma tabela chave/valor daria mais flexibilidade e menos
-- garantias: assim cada definicao tem tipo, limites e valor por omissao.
create table if not exists public.app_settings (
  id                smallint primary key default 1 check (id = 1),
  vip_total_spent   numeric(10, 2) not null default 500 check (vip_total_spent >= 0),
  vip_service_count integer        not null default 6   check (vip_service_count >= 1),
  updated_at        timestamptz    not null default now(),
  updated_by        uuid references public.profiles(id) on delete set null
);

insert into public.app_settings (id) values (1) on conflict (id) do nothing;

drop trigger if exists app_settings_set_updated_at on public.app_settings;
create trigger app_settings_set_updated_at
  before update on public.app_settings
  for each row execute function public.set_updated_at();

alter table public.app_settings enable row level security;
alter table public.app_settings force row level security;

-- Todos leem (a etiqueta de VIP aparece nas listas de qualquer staff), so o
-- admin escreve. Sem politica de insert nem de delete: a linha e uma so.
drop policy if exists app_settings_select on public.app_settings;
create policy app_settings_select on public.app_settings
  for select to authenticated
  using (public.is_staff());

drop policy if exists app_settings_update on public.app_settings;
create policy app_settings_update on public.app_settings
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());
