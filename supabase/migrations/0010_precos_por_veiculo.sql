-- =============================================================================
-- CleanStation Car CRM — 0010 preços por tipo de veículo
--
-- Correr depois do 0009.
--
-- Alinha o catálogo do CRM com a tabela do site. Duas mudanças:
--   1. o preço passa a depender do tipo de veículo
--   2. as lavagens passam de 6 serviços para 4 níveis
--
-- Serviços JÁ REGISTADOS não são tocados: o preço deles está copiado na linha
-- do serviço, precisamente para o histórico não mudar quando a tabela muda.
-- =============================================================================

-- Mapa {tipo_de_veículo: preço}. Fica em jsonb e não em colunas fixas porque
-- amanhã pode aparecer outro tipo de veículo, e isso não deve obrigar a alterar
-- o esquema.
alter table public.service_types
  add column if not exists prices jsonb not null default '{}'::jsonb;

comment on column public.service_types.prices is
  'Preço por tipo de veículo: {"carro":30,"grande":45,"suv":35,"mota":30}. Vazio = preço único em base_price.';

-- ── Lavagens: 4 níveis, preços da tabela de referência ───────────────────────
-- base_price fica com o valor mais baixo (o "desde"), para as listagens que
-- não perguntam o veículo continuarem a mostrar algo correto.

insert into public.service_types (slug, name, category, base_price, prices, sort_order) values
  ('lavagem-simples',   'LAVAGEM SIMPLES',    'lavagens', 30,  '{"carro":30,"grande":45,"suv":35,"mota":30}'::jsonb, 10),
  ('lavagem-selante',   'LAVAGEM COM SELANTE','lavagens', 40,  '{"carro":40,"grande":55,"suv":45}'::jsonb,           20),
  ('lavagem-premium',   'LAVAGEM PREMIUM',    'lavagens', 65,  '{"carro":65,"grande":80,"suv":75}'::jsonb,           30),
  ('lavagem-detalhada', 'LAVAGEM DETALHADA',  'lavagens', 140, '{"carro":140,"grande":180,"suv":160}'::jsonb,        40)
on conflict (slug) do update set
  name       = excluded.name,
  category   = excluded.category,
  base_price = excluded.base_price,
  prices     = excluded.prices,
  sort_order = excluded.sort_order,
  active     = true;

-- ── Packs de manutenção ──────────────────────────────────────────────────────

insert into public.service_types (slug, name, category, base_price, prices, sort_order) values
  ('pack-selante',   'PACK SELANTE · 2x MÊS',   'packs', 65,  '{"carro":65,"grande":95,"suv":75}'::jsonb,    50),
  ('pack-premium',   'PACK PREMIUM · 2x MÊS',   'packs', 105, '{"carro":105,"grande":155,"suv":125}'::jsonb, 60),
  ('pack-detalhada', 'PACK DETALHADA · 2x MÊS', 'packs', 220, '{"carro":220,"grande":300,"suv":260}'::jsonb, 70)
on conflict (slug) do update set
  name       = excluded.name,
  category   = excluded.category,
  base_price = excluded.base_price,
  prices     = excluded.prices,
  sort_order = excluded.sort_order,
  active     = true;

-- ── Lavagens antigas ─────────────────────────────────────────────────────────
-- Desativadas em vez de apagadas: há serviços registados que apontam para elas
-- por service_type_id, e um delete levava essa referência atrás. Deixam de
-- aparecer na escolha; o histórico mantém-se intacto.

update public.service_types
set active = false
where slug in ('lavagem-selante-premium', 'detalhada-interior', 'detalhada-exterior', 'detalhada-completa');

-- ── Restantes serviços ───────────────────────────────────────────────────────
-- Vidros, descontaminação, cerâmica, higienização, polimentos e faróis não
-- constam da tabela de referência: preço único, mantido como estava. O prices
-- vazio é o que sinaliza "não varia com o veículo".

update public.service_types
set prices = '{}'::jsonb
where category not in ('lavagens', 'packs') and prices <> '{}'::jsonb;
