-- =============================================================================
-- CleanStation Car CRM — 0017 a folga tambem no Google Calendar
--
-- Correr depois do 0016.
--
-- A folga marcada no CRM ja bloqueava o site — o busyWindow da Edge Function
-- booking le a time_off. O que nao acontecia era aparecer no Google Calendar,
-- que e o que se ve no telemovel: quem olhasse para la via o dia livre e podia
-- marcar por telefone por cima da propria folga.
--
-- Guardar o id do evento e o que permite apaga-lo depois. Sem isto, apagar a
-- folga no CRM deixava o evento orfao no calendario para sempre.
--
-- Fica anulavel (nullable) de proposito: a folga entra na base de dados
-- primeiro e o evento e criado a seguir. Se o Google estiver em baixo, a folga
-- vale na mesma e continua a bloquear o site — so nao se ve no telemovel. O
-- contrario, exigir o Google para poder marcar folga, era pior.
-- =============================================================================

alter table public.time_off
  add column if not exists google_event_id text;
