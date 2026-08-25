-- =============================================================================
-- CleanStation Car CRM — 0021 lembrete na vespera
--
-- Correr depois do 0020.
--
-- Uma lavagem detalhada ocupa o dia inteiro. Um cliente que nao aparece nao
-- custa uma marcacao, custa o dia — e o unico contacto que ele recebia era o
-- email de confirmacao, no momento em que marcou, as vezes semanas antes.
--
-- A coluna e o que impede o lembrete de sair duas vezes. Sem ela, o agendador a
-- correr outra vez no mesmo dia — ou uma segunda passagem a mao, para testar —
-- mandava segundo email a mesma pessoa. Ha maneiras de deduzir isto a partir da
-- message_logs, mas nenhuma tao dificil de enganar como uma marca na propria
-- ficha.
--
-- Guarda a data e nao um booleano: saber *quando* foi avisado responde a
-- "recebeu com quanta antecedencia", e um sim/nao nao responde a nada.
-- =============================================================================

alter table public.services
  add column if not exists reminded_at timestamptz;

-- So se procura pelos que ainda nao foram avisados, e num dia so.
create index if not exists services_reminder_idx
  on public.services (scheduled_at)
  where reminded_at is null and deleted_at is null;
