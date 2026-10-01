-- =============================================================================
-- CleanStation Car CRM — 0032 horario das 09:00 as 18:00, de segunda a sexta
--
-- Correr depois do 0031.
--
-- A hora vive em app_settings (0023) e e editavel em CRM -> Definicoes; esta
-- migracao so poe o valor novo e muda o valor por omissao. Os dias nao: o
-- sabado fecha no codigo, em isClosed (Edge Function) e isEncerrado (CRM), pelo
-- mesmo motivo do domingo — nao ha tabela de dias de trabalho para um horario
-- que nao muda por semana.
-- =============================================================================

alter table public.app_settings
  alter column closes_hour set default 18;

update public.app_settings set opens_hour = 9, closes_hour = 18;
