-- =============================================================================
-- CleanStation Car CRM — 0035 Lavagem Detalhada Interior ou Exterior a 120€
--
-- Correr depois do 0034. Pode correr mais de uma vez: so poe valores.
--
-- O dono baixou o "desde" desta lavagem de 130€ para 120€, so no carro; SUV e
-- carrinha grande ficam. Igual ao site (frontend/src/booking/pricing.js) e a
-- marcacao (supabase/functions/booking/catalogue.ts).
--
-- Servicos JA REGISTADOS nao sao tocados: o preco esta copiado na linha de
-- cada servico.
-- =============================================================================

update public.service_types set base_price = 120,
  prices = '{"carro":120,"grande":150,"suv":140}'::jsonb
  where slug in ('detalhada-interior', 'detalhada-exterior');

-- ── Verificacao ──────────────────────────────────────────────────────────────

select slug, name, base_price, prices
from public.service_types
where slug in ('detalhada-interior', 'detalhada-exterior');
