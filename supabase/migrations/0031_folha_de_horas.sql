-- =============================================================================
-- CleanStation Car CRM — 0031 folha de horas
--
-- Correr depois do 0030.
--
-- Quem trabalha na oficina marca a entrada, a ida para o almoço, o regresso e a
-- saída. No fim da semana o administrador tem uma folha por pessoa, com as
-- horas de cada dia e o total.
--
-- ── Uma linha por pessoa e por dia ───────────────────────────────────────────
--
-- E não uma linha por picagem. Um registo de picagens obriga sempre a
-- emparelhá-las para saber quantas horas alguém fez — e a decidir o que fazer
-- quando falta metade de um par, que é o caso comum: esquecer a saída acontece
-- todas as semanas. Assim, o que falta é um campo vazio e vê-se logo qual.
--
-- O preço é não caber aqui um segundo intervalo no mesmo dia, nem um turno que
-- atravesse a meia-noite. Nenhum dos dois existe nesta oficina, que abre às 9 e
-- fecha às 20.
--
-- ponytail: se um dia houver dois intervalos ou turnos pela noite, isto passa a
-- uma tabela de picagens (profile_id, tipo, at) e esta vira uma vista por cima
-- dela. O teto é este comentário e não uma surpresa.
--
-- ── O dia é o dia de Lisboa ──────────────────────────────────────────────────
--
-- O work_date não se deduz do started_at: em UTC, uma entrada às 00:30 de
-- verão pertence ao dia anterior, e a folha da semana ficava com um dia a
-- menos numa ponta e a mais na outra.
-- =============================================================================

create or replace function public.hoje_em_lisboa()
returns date
language sql
stable
as $$
  select (now() at time zone 'Europe/Lisbon')::date;
$$;

create table if not exists public.work_shifts (
  id               uuid primary key default gen_random_uuid(),
  profile_id       uuid not null references public.profiles(id) on delete cascade,
  work_date        date not null default public.hoje_em_lisboa(),

  started_at       timestamptz,
  break_started_at timestamptz,
  break_ended_at   timestamptz,
  ended_at         timestamptz,

  -- Para o "esqueci-me de picar a saída" ficar escrito ao lado da correção, em
  -- vez de ser uma hora estranha que ninguém explica meses depois.
  note             text,

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  -- Um dia, uma folha. Sem isto, dois toques no botão de entrada davam duas
  -- linhas para o mesmo dia e a semana somava o dobro.
  constraint work_shifts_um_por_dia unique (profile_id, work_date),

  -- O relógio não anda para trás. Cada marca só existe depois da anterior;
  -- sem isto, uma correção enganada dava horas negativas e um total que
  -- ninguém percebia de onde vinha.
  constraint work_shifts_ordem check (
    (break_started_at is null or (started_at is not null and break_started_at >= started_at))
    and (break_ended_at is null or (break_started_at is not null and break_ended_at >= break_started_at))
    and (ended_at is null or (
      started_at is not null
      and ended_at >= coalesce(break_ended_at, break_started_at, started_at)
    ))
  )
);

-- A folha é sempre "esta semana, desta pessoa" ou "esta semana, de todos".
create index if not exists work_shifts_date_idx on public.work_shifts (work_date desc);
create index if not exists work_shifts_profile_idx on public.work_shifts (profile_id, work_date desc);

drop trigger if exists work_shifts_set_updated_at on public.work_shifts;
create trigger work_shifts_set_updated_at
  before update on public.work_shifts
  for each row execute function public.set_updated_at();

-- Explícito, como o resto do schema conta com os defaults do Supabase mas isto
-- é uma tabela nova: sem privilégios não há RLS que valha, o pedido morre antes
-- de chegar às políticas.
grant select, insert, update, delete on public.work_shifts to authenticated;

-- ── Quem vê e quem mexe ──────────────────────────────────────────────────────
--
-- As horas de uma pessoa são dela e de quem lhe paga. Um funcionário vê e
-- escreve as suas; o administrador e o gestor veem as de todos, porque é deles
-- a folha no fim da semana.
--
-- O funcionário só mexe no dia de hoje. Não é desconfiança: é o que separa
-- "picar o ponto" de "reescrever o mês passado". Esqueceu-se de picar ontem?
-- Pede a correção a quem gere — e a correção fica registada, ver o fim.

alter table public.work_shifts enable row level security;
alter table public.work_shifts force row level security;

drop policy if exists work_shifts_select on public.work_shifts;
create policy work_shifts_select on public.work_shifts
  for select to authenticated
  using (profile_id = auth.uid() or public.is_manager());

drop policy if exists work_shifts_insert on public.work_shifts;
create policy work_shifts_insert on public.work_shifts
  for insert to authenticated
  with check (
    (public.is_staff() and profile_id = auth.uid() and work_date = public.hoje_em_lisboa())
    or public.is_manager()
  );

-- O using decide que linhas alcança; o with check decide como podem ficar. Os
-- dois são precisos: só com o using, um funcionário mudava o profile_id da sua
-- linha de hoje e punha as horas na conta de outra pessoa.
drop policy if exists work_shifts_update on public.work_shifts;
create policy work_shifts_update on public.work_shifts
  for update to authenticated
  using (
    (profile_id = auth.uid() and work_date = public.hoje_em_lisboa())
    or public.is_manager()
  )
  with check (
    (profile_id = auth.uid() and work_date = public.hoje_em_lisboa())
    or public.is_manager()
  );

-- Apagar é sempre de quem gere. Um dia apagado é um dia que desaparece da folha
-- sem deixar rasto do que lá estava — e é por isso que fica no registo.
drop policy if exists work_shifts_delete on public.work_shifts;
create policy work_shifts_delete on public.work_shifts
  for delete to authenticated
  using (public.is_manager());

-- ── A folha ──────────────────────────────────────────────────────────────────
--
-- As horas trabalhadas contam-se aqui e não no browser, pela mesma razão do
-- 0004: a conta é uma só e tem de dar o mesmo número no ecrã do funcionário, no
-- do administrador e num dia que alguém exporte. Duas cópias da subtração eram
-- duas oportunidades de discordarem sobre a hora do almoço.
--
-- security_invoker: a vista corre com as permissões de quem a consulta, logo as
-- políticas de cima continuam a valer. Sem isto era um túnel por baixo delas —
-- qualquer funcionário lia as horas de toda a gente.

create or replace view public.work_shifts_view
with (security_invoker = true)
as
  select
    w.id,
    w.profile_id,
    p.full_name,
    w.work_date,
    w.started_at,
    w.break_started_at,
    w.break_ended_at,
    w.ended_at,
    w.note,
    w.created_at,
    w.updated_at,

    -- Só há minutos trabalhados quando o dia tem princípio e fim. Um dia por
    -- fechar vale null e não zero: zero é "esteve cá e não fez nada", null é
    -- "ainda não se sabe", e a folha tem de os mostrar de maneira diferente.
    case
      when w.started_at is null or w.ended_at is null then null
      else greatest(0, (
        extract(epoch from (w.ended_at - w.started_at))
        -- Um intervalo começado e não fechado não desconta nada: descontar até
        -- ao fim do dia dava horas a menos a quem se esqueceu de voltar a picar.
        - coalesce(extract(epoch from (w.break_ended_at - w.break_started_at)), 0)
      ) / 60)::int
    end as worked_minutes,

    case
      when w.break_started_at is null or w.break_ended_at is null then null
      else (extract(epoch from (w.break_ended_at - w.break_started_at)) / 60)::int
    end as break_minutes
  from public.work_shifts w
  join public.profiles p on p.id = w.profile_id;

grant select on public.work_shifts_view to authenticated;

-- ── Correções feitas por outra pessoa ────────────────────────────────────────
--
-- O registo de alterações não leva as picagens: são quatro por pessoa por dia e
-- afogavam tudo o resto. Leva o que interessa a quem paga e a quem recebe —
-- alguém ter mexido nas horas de outra pessoa.
--
-- SECURITY DEFINER pela razão do 0001: é o único caminho até audit_logs, e
-- ninguém tem insert nessa tabela.

create or replace function public.audit_work_shift_correction()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  dono uuid := coalesce(new.profile_id, old.profile_id);
begin
  if auth.uid() is not distinct from dono then
    return coalesce(new, old);
  end if;

  insert into public.audit_logs (actor_id, actor_email, action, table_name, record_id, changes)
  values (
    auth.uid(),
    (select email from public.profiles where id = auth.uid()),
    lower(tg_op),
    'work_shifts',
    coalesce(new.id, old.id)::text,
    to_jsonb(coalesce(new, old))
  );

  return coalesce(new, old);
end;
$$;

drop trigger if exists work_shifts_audit on public.work_shifts;
create trigger work_shifts_audit
  after insert or update or delete on public.work_shifts
  for each row execute function public.audit_work_shift_correction();
