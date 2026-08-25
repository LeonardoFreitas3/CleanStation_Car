-- =============================================================================
-- CleanStation Car CRM — 0020 modelos de mensagem para reativacao
--
-- Correr depois do 0019.
--
-- A tabela de modelos ja tinha a categoria follow_up prevista — o rotulo existe
-- no MESSAGE_CATEGORY_LABEL desde o 0006 — mas nunca teve nenhum modelo la
-- dentro. A pagina de follow-ups mandava um texto fixo, escrito no codigo,
-- igual para toda a gente: mudar a mensagem obrigava a recompilar e publicar o
-- site.
--
-- Quatro e nao um porque o cliente que faltou ha 30 dias e o que desapareceu ha
-- meio ano nao levam a mesma mensagem. Correspondem aos quatro grupos que a
-- funcao follow_ups() ja calcula.
--
-- As variaveis sao as que a lista tem a mao: {{nome}}, {{servico}} e {{dias}}.
-- Nao ha {{veiculo}} nem {{matricula}} — a lista e por cliente e nao por
-- viatura, e um modelo que pede o que nao existe fica com o espaco em branco.
-- =============================================================================

insert into public.message_templates (slug, name, category, content, sort_order) values
  ('follow_up_manutencao', 'Manutenção', 'follow_up',
   'Olá {{nome}}! Já passaram {{dias}} dias desde o último {{servico}} na Clean Station Car. Quer agendar a próxima lavagem? Temos disponibilidade esta semana.', 70),
  ('follow_up_regresso', 'Está na hora', 'follow_up',
   'Olá {{nome}}! Notámos que já não passa por cá há {{dias}} dias. O seu carro deve estar a pedir atenção — quer marcar?', 80),
  ('follow_up_perdido', 'Sentimos a sua falta', 'follow_up',
   'Olá {{nome}}! Já há algum tempo que não nos visita e gostávamos de voltar a tratar do seu carro. Diga-nos o que precisa e tratamos do resto.', 90),
  ('follow_up_reativacao', 'Reativação', 'follow_up',
   'Olá {{nome}}! Faz algum tempo desde a sua última visita à Clean Station Car. Se quiser voltar a pôr o carro em dia, é só dizer — respondemos com as horas disponíveis.', 100)
on conflict (slug) do update set
  name       = excluded.name,
  category   = excluded.category,
  content    = excluded.content,
  sort_order = excluded.sort_order;
