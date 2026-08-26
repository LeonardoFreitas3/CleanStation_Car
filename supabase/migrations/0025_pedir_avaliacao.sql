-- =============================================================================
-- CleanStation Car CRM — 0025 pedir a avaliacao depois de entregar
--
-- Correr depois do 0024.
--
-- O site ja aponta para as avaliacoes do Google (o reviewsUrl do mock.js) e a
-- pagina de testemunhos vive delas. O que nunca existiu foi o pedido: as
-- estrelas aparecem se o cliente se lembrar sozinho, e quase nunca se lembra.
--
-- Dois dias depois de levar o carro e o momento certo. No proprio dia ainda
-- esta a olhar para ele; uma semana depois ja e passado.
--
-- ── O endereco vive nas Definicoes ──────────────────────────────────────────
-- O link do mock.js e uma pesquisa no Google com o fragmento vazio — serve para
-- o visitante ver as avaliacoes, nao para escrever uma. O de escrever sai do
-- perfil da empresa e so o dono lhe chega. Fica na app_settings, como o horario
-- do 0023: e um dado do negocio e nao uma frase do site.
--
-- **Vazio nao manda nada.** E o valor por omissao, e e de proposito: sem
-- endereco o email seria um pedido sem sitio para onde ir.
-- =============================================================================

alter table public.app_settings
  add column if not exists review_url text;

-- Um endereco que nao e um endereco parte o botao do email e ninguem da por
-- isso — o cliente carrega e nao acontece nada. Aqui recusa-se a guardar.
alter table public.app_settings
  drop constraint if exists app_settings_review_url;

alter table public.app_settings
  add constraint app_settings_review_url
  check (review_url is null or review_url ~ '^https://');

-- ── Quando o carro saiu mesmo ────────────────────────────────────────────────
--
-- O completed_at e carimbado no 'concluido' e nunca mais mexido, portanto num
-- servico que fica pronto na quarta e e levantado na sexta ele diz quarta. Para
-- o trabalho estar terminado e a data certa; para "ja passaram dois dias desde
-- que o cliente levou o carro" e dois dias a mais, e o pedido saia antes de ele
-- ter posto as maos no volante.

alter table public.services
  add column if not exists delivered_at        timestamptz,
  add column if not exists review_requested_at timestamptz;

-- Os que ja estao entregues nao tem a data. O completed_at e a melhor
-- aproximacao que ha e nao vale a pena mais: a janela de 30 dias la em baixo
-- deixa-os de fora quase todos.
update public.services
   set delivered_at = completed_at
 where status = 'entregue'
   and delivered_at is null
   and completed_at is not null;

-- O carimbo passa a ser feito pelo mesmo trigger que ja carimba o inicio e a
-- conclusao — e nao por um segundo trigger ao lado. Ha um sitio onde as datas
-- de um servico se escrevem sozinhas, e continua a haver um so.
--
-- O corpo das outras duas fica igual ao do 0001, de proposito: isto acrescenta
-- um caso, nao muda os que ja la estavam.
create or replace function public.stamp_service_dates()
returns trigger
language plpgsql
as $$
begin
  if new.status <> 'agendado' and new.started_at is null then
    new.started_at := now();
  end if;

  if new.status in ('concluido', 'entregue') and new.completed_at is null then
    new.completed_at := now();
  end if;

  if new.status = 'entregue' and new.delivered_at is null then
    new.delivered_at := now();
  end if;

  return new;
end;
$$;

create index if not exists services_review_idx
  on public.services (delivered_at)
  where review_requested_at is null and deleted_at is null and status = 'entregue';

-- ── Quem esta a espera de ser convidado a avaliar ────────────────────────────
--
-- Sem is_manager() e com os grants fechados, pela mesma razao da
-- manutencoes_a_lembrar() do 0024: quem chama isto e a Edge Function com a
-- service_role, onde auth.uid() e nulo.

create or replace function public.avaliacoes_a_pedir()
returns table (
  service_id   uuid,
  client_id    uuid,
  client_name  text,
  client_email text,
  service_name text,
  delivered_at timestamptz,
  plate        text,
  make         text,
  model        text,
  share_token  text
)
language sql
stable
set search_path = public, pg_temp
as $$
  select
    s.id,
    c.id,
    c.name,
    c.email,
    s.service_name,
    s.delivered_at,
    v.plate,
    v.make,
    v.model,
    -- So o que ainda abre. Um link expirado no email e pior do que nenhum: o
    -- cliente carrega, ve uma pagina a dizer que nao, e a boa vontade acaba ai.
    case when s.share_expires_at > now() then s.share_token end
  from public.services s
  join public.clients c on c.id = s.client_id
  -- A viatura e opcional: um servico sem ficha de carro continua a merecer o
  -- pedido, so nao lhe pode dizer o nome do modelo.
  left join public.vehicles v on v.id = s.vehicle_id and v.deleted_at is null
  where s.deleted_at is null
    and s.status = 'entregue'
    and s.review_requested_at is null
    and s.delivered_at is not null
    -- Dois dias de intervalo. Mudar aqui muda em todo o lado; nao ha copia
    -- deste numero no codigo.
    and s.delivered_at < now() - interval '2 days'
    -- E um mes de tecto. Sem ele, a primeira passagem pedia avaliacao de
    -- lavagens de marco a toda a gente que ja ca passou — que e o pior primeiro
    -- dia possivel para uma funcionalidade destas.
    and s.delivered_at > now() - interval '30 days'
    and c.deleted_at is null
    and c.email is not null
    -- Pedir uma avaliacao nao e executar o servico, que ja acabou. O
    -- consentimento de marketing e a linha que este projeto ja tracou na
    -- booking ("Marketing fica a false: e consentimento separado") e nao e
    -- aqui que se atravessa.
    and c.marketing_consent
    -- Um stand que entrega tres carros na mesma semana nao escreve tres
    -- avaliacoes. Um pedido por cliente de tres em tres meses.
    and not exists (
      select 1 from public.services r
       where r.client_id = c.id
         and r.review_requested_at > now() - interval '90 days'
    )
  -- Quem levou o carro ha mais tempo primeiro: e a quem falta menos para sair
  -- da janela dos 30 dias.
  order by s.delivered_at;
$$;

revoke all on function public.avaliacoes_a_pedir() from public, anon, authenticated;
grant execute on function public.avaliacoes_a_pedir() to service_role;
