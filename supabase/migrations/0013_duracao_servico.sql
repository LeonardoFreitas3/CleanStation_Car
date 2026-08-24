-- =============================================================================
-- CleanStation Car CRM — 0013 duracao do servico
--
-- Correr depois do 0012.
--
-- Porque existe: um servico marcado no CRM (telefone, balcao) so vivia na
-- tabela services. O site calcula as horas livres a partir do Google Calendar,
-- onde esse servico nunca entrou — e oferecia a mesma hora a outra pessoa.
--
-- Com a duracao guardada, a Edge Function passa a tratar os servicos agendados
-- como periodo ocupado, tal como as folgas. Nulo continua a ser aceite (os
-- servicos antigos nao a tem): nesse caso assume-se o valor por omissao.
-- =============================================================================

alter table public.services
  add column if not exists duration_minutes integer
  check (duration_minutes is null or duration_minutes between 15 and 1440);

-- A consulta da disponibilidade filtra por scheduled_at e ignora os apagados.
-- O indice do 0001 (services_scheduled_idx) ja cobre a coluna; este restringe
-- as linhas que interessam.
create index if not exists services_scheduled_active_idx
  on public.services (scheduled_at)
  where deleted_at is null and scheduled_at is not null;
