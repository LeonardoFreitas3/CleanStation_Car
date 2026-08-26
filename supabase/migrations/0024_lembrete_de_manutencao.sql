-- =============================================================================
-- CleanStation Car CRM — 0024 lembrete de manutencao
--
-- Correr depois do 0023.
--
-- O 0021 trouxe o lembrete da vespera: avisa quem ja marcou. Falta o outro
-- lado — quem devia voltar e nao voltou. Uma protecao ceramica dura seis meses
-- e o cliente nao anda a contar os dias; uma lavagem com selante rende um mes.
-- Passado o prazo, o carro pede o servico outra vez e ninguem lho diz.
--
-- A lista de follow-ups do 0019 ja olha para isto, mas por *cliente* e para
-- alguem ligar a mao. Isto e por *viatura* e sai sozinho: o prazo de uma
-- ceramica nao e o mesmo de uma lavagem simples, e "dias desde a ultima visita"
-- nao sabe a diferenca.
--
-- O prazo vive no catalogo e nao no codigo, pela mesma razao do 0014 e do 0023:
-- mudar "a ceramica repete-se aos 180 dias" nao pode obrigar a publicar o site.
--
-- Vazio = nunca lembrar. E o valor por omissao de proposito: um servico novo
-- nao comeca a mandar email a ninguem sem alguem ter decidido que devia.
-- =============================================================================

alter table public.service_types
  add column if not exists repeat_after_days smallint
  check (repeat_after_days is null or repeat_after_days between 7 and 730);

-- A marca que impede o mesmo lembrete de sair duas vezes, na propria linha do
-- servico — igual ao reminded_at do 0021 e pelo mesmo argumento: ha maneiras de
-- deduzir isto da message_logs, nenhuma tao dificil de enganar como isto.
alter table public.services
  add column if not exists maintenance_reminded_at timestamptz;

-- Procura-se sempre pelos concluidos que ainda nao foram lembrados.
create index if not exists services_maintenance_idx
  on public.services (completed_at)
  where maintenance_reminded_at is null and deleted_at is null and completed_at is not null;

-- ── Prazos iniciais ──────────────────────────────────────────────────────────
-- Numeros da folha da oficina, nao invencao: o selante rende um mes, o premium
-- dois, a detalhada tres, a ceramica seis. A simples fica a 45 dias — quem so
-- lava e quem lava com mais frequencia, e aos 30 ainda e cedo para chatear.
--
-- Ficam aqui, visiveis, e nao escondidos num default: sao a decisao comercial
-- do negocio e mudam-se nas Definicoes, sem SQL.
--
-- Os polimentos e os extras ficam de fora. Um polimento de correcao nao se
-- repete de x em x meses, faz-se quando a pintura precisa; mandar email a
-- lembra-lo era vender o que o cliente nao precisa.

update public.service_types set repeat_after_days = 45  where slug = 'lavagem-simples';
update public.service_types set repeat_after_days = 30  where slug = 'lavagem-selante';
update public.service_types set repeat_after_days = 60  where slug = 'lavagem-selante-premium';
update public.service_types set repeat_after_days = 90  where slug = 'detalhada-completa';
update public.service_types set repeat_after_days = 180 where slug = 'ceramica';

-- ── Quem esta a espera de ser lembrado ───────────────────────────────────────
--
-- A regra vive aqui e nao na Edge Function pela razao do 0019: e aqui que se
-- decide quem entra na lista, e ter metade do criterio em cada lado era
-- garantir que um dia discordavam.
--
-- Sem is_manager() no where, ao contrario da follow_ups(): quem chama isto e a
-- Edge Function com a service_role, onde auth.uid() e nulo e is_manager() daria
-- sempre falso — a lista vinha vazia todos os dias e sem dizer porque.
-- A porta fecha-se nos grants, no fim.

create or replace function public.manutencoes_a_lembrar()
returns table (
  service_id   uuid,
  client_id    uuid,
  client_name  text,
  client_email text,
  service_name text,
  completed_at timestamptz,
  dias         integer,
  prazo        integer,
  plate        text,
  make         text,
  model        text
)
language sql
stable
set search_path = public, pg_temp
as $$
  -- So o ultimo servico de cada viatura. Sem o distinct on, um carro com cinco
  -- lavagens no historico levava cinco emails no mesmo dia, um por cada uma que
  -- ja tinha passado do prazo.
  --
  -- O filtro do repeat_after_days fica de fora desta parte, e nao dentro: se o
  -- ultimo servico foi um polimento (que nao se repete), o cliente esteve ca ha
  -- duas semanas e nao ha nada a lembrar. Puxar a lavagem de tras era mandar-lhe
  -- saudades de quem acabou de sair.
  with ultimo as (
    select distinct on (s.vehicle_id)
           s.id, s.client_id, s.vehicle_id, s.service_name,
           s.completed_at, s.maintenance_reminded_at, s.service_type_id
      from public.services s
     where s.deleted_at is null
       and s.vehicle_id is not null
       and s.completed_at is not null
       and s.status in ('concluido', 'entregue')
     order by s.vehicle_id, s.completed_at desc
  )
  select
    u.id,
    c.id,
    c.name,
    c.email,
    u.service_name,
    u.completed_at,
    (current_date - u.completed_at::date)::integer,
    t.repeat_after_days::integer,
    v.plate,
    v.make,
    v.model
  from ultimo u
  join public.service_types t on t.id = u.service_type_id
  join public.clients       c on c.id = u.client_id
  join public.vehicles      v on v.id = u.vehicle_id
  where t.repeat_after_days is not null
    and u.maintenance_reminded_at is null
    and u.completed_at < now() - make_interval(days => t.repeat_after_days)
    and c.deleted_at is null
    and v.deleted_at is null
    and c.email is not null
    -- RGPD: isto e marketing, nao e execucao do servico que o cliente pediu.
    -- Sem consentimento nao ha base legal — a mesma regra do brevo-sync, e a
    -- diferenca para o lembrete da vespera, que sai a toda a gente.
    and c.marketing_consent
    -- Nao empilhar em cima de outra mensagem de marketing recente. A lista de
    -- inativos do Brevo, os follow-ups e isto pescam nas mesmas pessoas; tres
    -- emails na mesma semana e o caminho mais curto para o botao de spam.
    and not exists (
      select 1 from public.message_logs m
       where m.client_id = c.id
         and m.is_marketing
         and m.created_at > now() - interval '30 days'
    )
    -- Ja tem hora marcada para aquele carro: nao ha nada a lembrar, e um email
    -- a pedir que volte a quem volta na quinta-feira e so estranho.
    and not exists (
      select 1 from public.services f
       where f.vehicle_id = u.vehicle_id
         and f.deleted_at is null
         and f.status <> 'cancelado'
         and f.scheduled_at > now()
    )
  -- Quem espera ha mais tempo primeiro.
  order by u.completed_at;
$$;

-- Ninguem chama isto pela API. Quem a corre e a Edge Function, com a
-- service_role: a lista traz emails e historico de clientes e nao tem nada que
-- estar ao alcance de uma sessao do site.
revoke all on function public.manutencoes_a_lembrar() from public, anon, authenticated;
grant execute on function public.manutencoes_a_lembrar() to service_role;
