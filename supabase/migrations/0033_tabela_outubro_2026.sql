-- =============================================================================
-- CleanStation Car CRM — 0033 tabela de precos de outubro de 2026
--
-- Correr depois do 0032.
--
-- O catalogo do CRM passa a dizer o mesmo que o site (frontend/src/booking/
-- pricing.js, supabase/functions/booking/catalogue.ts e frontend/src/mock.js).
--
-- So o catalogo muda. Os servicos JA REGISTADOS, marcacoes incluidas, nao sao
-- tocados: o nome, o preco e a duracao estao copiados na linha de cada servico,
-- precisamente para o historico nao mudar quando a tabela muda.
--
-- A tabela nova so da um valor por servico, o "desde", que e o do carro.
-- Carrinha grande e SUV ficam como no site: o valor que ja tinham se nao era
-- mais baixo que o "desde", o "desde" se era. Estao por confirmar com a oficina.
-- =============================================================================

-- ── Lavagens ─────────────────────────────────────────────────────────────────

-- O selante passa para dentro da Simples.
update public.service_types set base_price = 35,
  prices = '{"carro":35,"grande":45,"suv":35,"mota":35}'::jsonb,
  duration_minutes = 90
  where slug = 'lavagem-simples';

-- DESATIVADA, nao apagada: ha servicos registados que apontam para ela.
update public.service_types set active = false
  where slug = 'lavagem-selante';

update public.service_types set base_price = 75,
  prices = '{"carro":75,"grande":80,"suv":75}'::jsonb,
  duration_minutes = 240
  where slug = 'lavagem-selante-premium';

-- As duas detalhadas parciais voltam (o 0011 tinha-as desativado). No site sao
-- um servico, "Interior ou Exterior", e a area escolhe-se na marcacao; aqui
-- continuam a ser duas linhas, que e o que a marcacao grava.
update public.service_types set active = true, base_price = 130,
  name = 'LAVAGEM DETALHADA INTERIOR',
  prices = '{"carro":130,"grande":130,"suv":130}'::jsonb,
  duration_minutes = 240, sort_order = 35
  where slug = 'detalhada-interior';

update public.service_types set active = true, base_price = 130,
  name = 'LAVAGEM DETALHADA EXTERIOR',
  prices = '{"carro":130,"grande":130,"suv":130}'::jsonb,
  duration_minutes = 240, sort_order = 36
  where slug = 'detalhada-exterior';

-- 480 e nao 660: a detalhada deixou de ficar de um dia para o outro.
update public.service_types set base_price = 200,
  name = 'LAVAGEM DETALHADA INTERIOR + EXTERIOR',
  prices = '{"carro":200,"grande":200,"suv":200}'::jsonb,
  duration_minutes = 480
  where slug = 'detalhada-completa';

-- ── Polimentos ───────────────────────────────────────────────────────────────
-- O "desde". No site sao sob orcamento; aqui o preco continua editavel em cada
-- servico, que e onde fica o valor final.

update public.service_types set base_price = 250 where slug = 'polimento-1-etapa';
update public.service_types set base_price = 350, name = 'POLIMENTO DE CORREÇÃO AVANÇADA'
  where slug = 'polimento-avancado';
update public.service_types set base_price = 55 where slug = 'farois-dianteiros';
update public.service_types set base_price = 40 where slug = 'farois-traseiros';

-- ── Protecao ceramica ────────────────────────────────────────────────────────
-- Volta a vender-se (o 0011 tinha-a desativado), desde 250.

update public.service_types set active = true, base_price = 250 where slug = 'ceramica';

-- ── Verificacao ──────────────────────────────────────────────────────────────

select slug, name, base_price, prices, duration_minutes, active
from public.service_types
where category in ('lavagens', 'polimentos', 'descontaminacao')
order by sort_order;
