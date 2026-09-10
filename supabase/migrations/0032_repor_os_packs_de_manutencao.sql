-- =============================================================================
-- CleanStation Car CRM — 0032 os packs de manutenção voltam ao catálogo
--
-- Correr depois do 0031.
--
-- Os três packs entraram no catálogo a 20 de agosto de 2026, pelo 0010. Nesse
-- mesmo dia o 649f93f reverteu a reestruturação do catálogo e levou o insert
-- deles atrás — sem o dizer na mensagem, porque não era esse o assunto do
-- commit. Ficaram meio anos: fora do ficheiro da migração, mas ainda esperados
-- pelo resto do código.
--
-- Quem continuou à espera deles:
--
--   0011, na verificação final — "Devem sobrar 4 lavagens, 4 polimentos, 6
--   extras e os 3 packs". Escrita a contar com eles.
--
--   frontend/src/crm/services/serviceTypes.ts, no CATEGORY_LABEL — a categoria
--   `packs` tem lá o nome por extenso, "Packs de manutenção", e o formulário de
--   serviço agrupa por categoria sem excluir nenhuma. O ecrã sempre esteve
--   pronto para os mostrar; era a tabela que não os tinha.
--
-- Os valores são os do 0010, sem uma vírgula mudada.
-- =============================================================================

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

-- ── Duração ──────────────────────────────────────────────────────────────────
--
-- O pack são duas lavagens por mês, mas cada marcação é de uma: a duração é a
-- da lavagem correspondente, não o dobro. Uma duração a dobrar fechava o dia a
-- um serviço que lá cabia duas vezes.
--
-- Os números seguem a mesma convenção do 0030: a coluna do carro, e a detalhada
-- em 660 minutos — o dia de trabalho das 9 às 20, e não os 1440 do site, que
-- pintariam o dia seguinte todo.

update public.service_types set duration_minutes = 105 where slug = 'pack-selante';
update public.service_types set duration_minutes = 240 where slug = 'pack-premium';
update public.service_types set duration_minutes = 660 where slug = 'pack-detalhada';

-- ── Verificação ──────────────────────────────────────────────────────────────
-- Três linhas, todas ativas, na categoria `packs`.

select slug, name, base_price, prices, duration_minutes, active
from public.service_types
where category = 'packs'
order by sort_order;
