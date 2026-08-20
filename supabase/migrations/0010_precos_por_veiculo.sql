-- =============================================================================
-- CleanStation Car CRM — 0010 preços atualizados e variação por veículo
--
-- Correr depois do 0009.
--
-- O catálogo mantém os mesmos serviços. Só mudam os quatro preços que a folha
-- de referência corrige, e acrescenta-se a variação por tipo de veículo nos
-- serviços que a folha discrimina.
--
-- Serviços JÁ REGISTADOS não são tocados: o preço deles está copiado na linha
-- do serviço, precisamente para o histórico não mudar quando a tabela muda.
-- =============================================================================

-- Mapa {tipo_de_veículo: preço}. Em jsonb e não em colunas fixas porque amanhã
-- pode aparecer outro tipo de veículo, e isso não deve obrigar a alterar o
-- esquema. Vazio = preço único, o de base_price.
alter table public.service_types
  add column if not exists prices jsonb not null default '{}'::jsonb;

comment on column public.service_types.prices is
  'Preço por tipo de veículo: {"carro":30,"grande":45,"suv":35,"mota":30}. Vazio = preço único em base_price.';

-- ── Os quatro preços que a folha corrige ─────────────────────────────────────
--   lavagem simples          25 -> 30
--   lavagem com selante      37 -> 40
--   lavagem selante premium  55 -> 65
--   lavagem detalhada        155 -> 140

update public.service_types set base_price = 30,
  prices = '{"carro":30,"grande":45,"suv":35,"mota":30}'::jsonb
  where slug = 'lavagem-simples';

update public.service_types set base_price = 40,
  prices = '{"carro":40,"grande":55,"suv":45}'::jsonb
  where slug = 'lavagem-selante';

update public.service_types set base_price = 65,
  prices = '{"carro":65,"grande":80,"suv":75}'::jsonb
  where slug = 'lavagem-selante-premium';

update public.service_types set base_price = 140,
  prices = '{"carro":140,"grande":180,"suv":160}'::jsonb
  where slug = 'detalhada-completa';

-- Os restantes ficam como estavam. A folha não os discrimina por veículo, e
-- inventar valores era pior do que manter o preço único que já praticavam:
--   detalhada-interior 80, detalhada-exterior 90, vidros 50,
--   descontaminação 95, cerâmica 250, estofos 100,
--   polimentos 180 e 300, faróis 55 e 40

-- ── Verificação ──────────────────────────────────────────────────────────────
-- Deve devolver 4 linhas, com os preços acima.

select slug, base_price, prices
from public.service_types
where prices <> '{}'::jsonb
order by sort_order;
