-- =============================================================================
-- CleanStation Car CRM — 0011 catálogo alinhado com a folha da oficina
--
-- Correr depois do 0010.
--
-- O site passa a ter só as 4 lavagens da folha, mais os polimentos como "sob
-- consulta". Descontaminação e Higienização saem.
-- =============================================================================

-- ── Serviços que saem ────────────────────────────────────────────────────────
-- DESATIVADOS, não apagados: há serviços registados que apontam para eles por
-- service_type_id, e um delete levava essa referência atrás. Deixam de
-- aparecer na escolha; o histórico fica intacto.
--
-- Se voltarem a vender algum, basta pôr active = true outra vez.

update public.service_types
set active = false
where slug in (
  -- descontaminação e proteções
  'vidros', 'descontaminacao-pintura', 'ceramica',
  -- higienização
  'higienizacao-estofos',
  -- as duas lavagens detalhadas parciais: a folha consolida numa só
  'detalhada-interior', 'detalhada-exterior'
);

-- ── As 4 lavagens ────────────────────────────────────────────────────────────
-- Os slugs mantêm-se para não partir o histórico; muda o nome visível.

update public.service_types
set name = 'LAVAGEM SIMPLES', sort_order = 10, active = true
where slug = 'lavagem-simples';

update public.service_types
set name = 'LAVAGEM COM SELANTE', sort_order = 20, active = true
where slug = 'lavagem-selante';

update public.service_types
set name = 'LAVAGEM PREMIUM', sort_order = 30, active = true
where slug = 'lavagem-selante-premium';

update public.service_types
set name = 'LAVAGEM DETALHADA', sort_order = 40, active = true
where slug = 'detalhada-completa';

-- ── Polimentos ───────────────────────────────────────────────────────────────
-- Continuam a vender-se, mas não se marcam online: o preço depende do estado
-- da pintura e é orçamentado à vista. Ficam ativos no CRM, onde o preço é
-- editável em cada serviço.

update public.service_types
set sort_order = 100 + sort_order
where category = 'polimentos';

-- ── Verificação ──────────────────────────────────────────────────────────────
-- Devem sobrar 4 lavagens, 4 polimentos, 6 extras e os 3 packs.

select category, count(*) filter (where active) as ativos,
       count(*) filter (where not active) as inativos
from public.service_types
group by category
order by category;
