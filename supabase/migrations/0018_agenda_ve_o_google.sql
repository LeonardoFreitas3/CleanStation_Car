-- =============================================================================
-- CleanStation Car CRM — 0018 a agenda ve o que so existe no Google
--
-- Correr depois do 0017.
--
-- A Agenda do CRM mostra o que esta na base de dados. O que e bloqueado
-- diretamente no Google Calendar — pelo telemovel, a meio da rua — nunca lhe
-- aparecia: o site respeitava (o calculo das vagas le o freeBusy do Google) mas
-- quem olhasse para a Agenda via a manha livre.
--
-- Para a Agenda poder mostrar so o que *nao* e ja um servico ou uma folga, e
-- preciso saber que evento corresponde a que ficha. O id ate agora ia enterrado
-- numa linha de texto das notas ("Marcacao do site · evento abc123"), o que dava
-- para ler mas nao para cruzar com rigor.
--
-- Anulavel: as marcacoes feitas a mao no CRM nao tem evento nenhum, e as que ja
-- existem foram criadas antes desta coluna. Para essas o cruzamento falha e o
-- evento aparece na Agenda como bloqueio — chato, mas visivel, que e melhor do
-- que esconder por engano um servico verdadeiro.
-- =============================================================================

alter table public.services
  add column if not exists google_event_id text;

create index if not exists services_google_event_idx
  on public.services (google_event_id)
  where google_event_id is not null;
