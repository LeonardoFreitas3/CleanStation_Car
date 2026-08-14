-- =============================================================================
-- CleanStation Car CRM — 0003 catalogo de servicos
--
-- Dados de PRODUCAO, nao seed de teste: sao os precos reais praticados,
-- gerados a partir de frontend/src/mock.js para o CRM e o site publico nao
-- divergirem. Se mexeres num preco aqui, mexe tambem no mock.js.
--
-- Os extras entram na mesma tabela com category = extras. Sao coisas
-- faturaveis com nome e preco, tal como os servicos; nao justificava tabela
-- propria. Quem escolhe o servico principal filtra por category <> extras.
-- =============================================================================

insert into public.service_types (slug, name, category, base_price, sort_order) values
  ('lavagem-simples', 'LAVAGEM INTERIOR E EXTERIOR SIMPLES', 'lavagens', 25, 10),
  ('lavagem-selante', 'LAVAGEM COM SELANTE', 'lavagens', 37, 20),
  ('lavagem-selante-premium', 'LAVAGEM COM SELANTE PREMIUM', 'lavagens', 55, 30),
  ('detalhada-interior', 'LAVAGEM DETALHADA INTERIOR', 'lavagens', 80, 40),
  ('detalhada-exterior', 'LAVAGEM DETALHADA EXTERIOR', 'lavagens', 90, 50),
  ('detalhada-completa', 'LAVAGEM DETALHADA INTERIOR + EXTERIOR', 'lavagens', 155, 60),
  ('vidros', 'SERVIÇO COMPLETO DE VIDROS', 'descontaminacao', 50, 70),
  ('descontaminacao-pintura', 'DESCONTAMINAÇÃO COMPLETA DA PINTURA', 'descontaminacao', 95, 80),
  ('ceramica', 'PROTEÇÃO CERÂMICA PROFISSIONAL', 'descontaminacao', 250, 90),
  ('higienizacao-estofos', 'HIGIENIZAÇÃO DE ESTOFOS', 'higienizacao', 100, 100),
  ('polimento-1-etapa', 'POLIMENTO DE 1 ETAPA', 'polimentos', 180, 110),
  ('polimento-avancado', 'POLIMENTO DE CORREÇÃO AVANÇADO', 'polimentos', 300, 120),
  ('farois-dianteiros', 'POLIMENTO DE FARÓIS DIANTEIROS (PAR)', 'polimentos', 55, 130),
  ('farois-traseiros', 'POLIMENTO DE FARÓIS TRASEIROS (PAR)', 'polimentos', 40, 140),
  ('extra-pelos-animal', 'Remoção de Pêlo de Animal', 'extras', 20, 150),
  ('extra-areia-praia', 'Remoção de Areia de Praia', 'extras', 15, 160),
  ('extra-odores', 'Tratamento de Odores', 'extras', 25, 170),
  ('extra-jantes-profunda', 'Limpeza Profunda de Jantes', 'extras', 25, 180),
  ('extra-plasticos-inter', 'Proteção de Plásticos Interiores', 'extras', 20, 190),
  ('extra-couro', 'Tratamento de Couro', 'extras', 60, 200)
on conflict (slug) do update set
  name       = excluded.name,
  category   = excluded.category,
  base_price = excluded.base_price,
  sort_order = excluded.sort_order;
