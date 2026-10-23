-- =============================================================================
-- CleanStation Car CRM — 0034 precos e tempos por veiculo, outubro de 2026
--
-- Correr depois do 0033.
--
-- O 0033 pos os "desde" da tabela de outubro; a oficina deu depois os valores
-- de SUV e carrinha grande, que ficam aqui. Iguais aos do site
-- (frontend/src/booking/pricing.js) e da marcacao
-- (supabase/functions/booking/catalogue.ts).
--
-- Servicos JA REGISTADOS nao sao tocados: o preco e a duracao estao copiados
-- na linha de cada servico.
--
-- A duracao do catalogo continua a ser uma so, a do carro (ver o 0030): e a
-- proposta que o formulario do CRM faz, e quem regista muda-a. As do SUV e da
-- carrinha grande vivem no catalogo da marcacao, que e quem bloqueia a agenda.
-- =============================================================================

update public.service_types set prices = '{"carro":35,"grande":45,"suv":40,"mota":35}'::jsonb
  where slug = 'lavagem-simples';

update public.service_types set prices = '{"carro":75,"grande":85,"suv":80}'::jsonb
  where slug = 'lavagem-selante-premium';

update public.service_types set prices = '{"carro":130,"grande":150,"suv":140}'::jsonb
  where slug in ('detalhada-interior', 'detalhada-exterior');

update public.service_types set prices = '{"carro":200,"grande":240,"suv":220}'::jsonb
  where slug = 'detalhada-completa';

-- ── Verificacao ──────────────────────────────────────────────────────────────

select slug, name, base_price, prices, duration_minutes, active
from public.service_types
where category = 'lavagens' and active
order by sort_order;
