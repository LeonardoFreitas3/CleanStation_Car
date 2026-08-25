-- =============================================================================
-- CleanStation Car CRM — 0023 o horario deixa de viver no codigo
--
-- Correr depois do 0022.
--
-- O 0014 trouxe os limiares de VIP para aqui com este argumento: mudar "cliente
-- VIP a partir de 500 EUR" obrigava a recompilar e publicar o site, coisa que o
-- admin nao faz nem deve ter de pedir. O horario tinha exatamente o mesmo
-- problema, e pior — estava escrito em nove sitios.
--
-- Em 25 de agosto de 2026 mudou de 08:00-19:00 para 09:00-20:00 e foi preciso
-- tocar no calculo das vagas, na agenda do CRM, nos textos do site em portugues
-- e ingles, nos termos e no schema de SEO. Nove sitios e nove oportunidades de
-- ficar um por atualizar.
--
-- A partir daqui a hora vive aqui e o resto le-a. Os textos do site continuam a
-- ser escritos a mao — sao frases e nao dados —, mas o que decide se ha vaga as
-- 19:30 passa a ser uma linha de base de dados.
--
-- Guardado em hora inteira e nao em texto "09:00": o calculo das vagas anda de
-- meia em meia hora a partir da hora de abertura, e uma abertura as 09:20 nao e
-- uma definicao, e um erro a espera de acontecer.
-- =============================================================================

alter table public.app_settings
  add column if not exists opens_hour  smallint not null default 9
    check (opens_hour between 0 and 23),
  add column if not exists closes_hour smallint not null default 20
    check (closes_hour between 1 and 24);

-- Fechar antes de abrir nao e um horario. Sem isto, uma troca dos dois campos
-- dava zero vagas todos os dias sem dizer porque.
alter table public.app_settings
  drop constraint if exists app_settings_horario;

alter table public.app_settings
  add constraint app_settings_horario check (closes_hour > opens_hour);

-- A Edge Function das marcacoes le isto com a service_role, mas o site publico
-- nao chega aqui: quem marca nao tem sessao, e a politica de select do 0014
-- exige is_staff(). E de proposito — o horario chega ao visitante ja cozinhado,
-- na lista de horas livres.
