-- =============================================================================
-- CleanStation Car CRM — 0030 a duracao vive no catalogo
--
-- Correr depois do 0029.
--
-- O 0013 pos a duracao na linha do servico: cada marcacao diz quanto tempo
-- ocupa. O que faltava era o servico *saber* quanto costuma demorar. Ao
-- registar, o formulario propunha sempre duas horas — o mesmo para uma lavagem
-- simples e para uma detalhada que fica de um dia para o outro. Quem registava
-- tinha de se lembrar de corrigir, e quando nao se lembrava a agenda ficava a
-- dizer que havia tempo livre que nao havia.
--
-- Os numeros nao sao invencao: sao os mesmos que o site ja usa para calcular as
-- vagas das marcacoes online, em supabase/functions/booking/catalogue.ts. Ate
-- aqui o site sabia quanto demorava uma lavagem premium e o CRM nao.
--
-- Vazio = sem duracao propria; o formulario propoe as duas horas de sempre. E o
-- valor por omissao de proposito: um servico novo nao herda um tempo que
-- ninguem decidiu.
-- =============================================================================

alter table public.service_types
  add column if not exists duration_minutes smallint
  check (duration_minutes is null or duration_minutes between 15 and 1440);

-- ── Tempos iniciais ──────────────────────────────────────────────────────────
--
-- A coluna do carro do catalogo do site. Uma duracao por servico e nao uma por
-- veiculo, ao contrario do preco.
--
-- ponytail: o site tem tempos por veiculo (uma premium num SUV sao 5h e nao 4h)
-- e isto achata-os no valor do carro. E uma proposta que quem regista ve e
-- muda, e o teto e esse: se a diferenca comecar a doer, a subida e uma coluna
-- `durations` jsonb igual a `prices`, com os quatro campos nas Definicoes.
--
-- A detalhada e o unico caso em que este numero diverge do site de proposito.
-- La sao 1440 minutos, porque o carro fica de um dia para o outro e o calculo
-- de vagas precisa de saber isso. Aqui sao 660 — o dia de trabalho inteiro, das
-- 9 as 20 —, que e o que a agenda tem para mostrar e o que a lista de duracoes
-- do formulario chama "Dia inteiro". Marcar 1440 pintava o dia seguinte todo.

update public.service_types set duration_minutes = 90  where slug = 'lavagem-simples';
update public.service_types set duration_minutes = 105 where slug = 'lavagem-selante';
update public.service_types set duration_minutes = 240 where slug = 'lavagem-selante-premium';
update public.service_types set duration_minutes = 660 where slug = 'detalhada-completa';

-- Os polimentos ficam por decidir: "sob consulta" no site, e o tempo depende do
-- estado da pintura. Ficam a null ate alguem os medir nas Definicoes.
