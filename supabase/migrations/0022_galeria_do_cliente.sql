-- =============================================================================
-- CleanStation Car CRM — 0022 as fotografias chegarem ao cliente
--
-- Correr depois do 0021.
--
-- Tiram-se fotografias de cada fase e ficam todas dentro do CRM. O cliente
-- nunca as ve, a nao ser que lhe sejam mandadas uma a uma pelo WhatsApp. Num
-- negocio que vende detalhe, o antes-e-depois e o argumento de venda.
--
-- Duas colunas e nao uma tabela: uma galeria e uma propriedade do servico, nao
-- uma entidade com vida propria. Uma tabela so para guardar dois campos por
-- servico pagava-se em joins para sempre.
--
-- O token e gerado no CRM com crypto.randomUUID — 122 bits ao acaso. Nao ha
-- nada para adivinhar: quem nao tiver o link nao chega la, e quem o tiver nao
-- consegue passar para o servico do lado, porque o token e por servico.
--
-- A validade nao e decorativa. Um link partilhado num grupo de WhatsApp fica la
-- para sempre; com prazo, deixa de servir sozinho. Renovar e voltar a
-- partilhar.
--
-- O unique protege contra o improvavel e contra o descuido: dois servicos com o
-- mesmo token fariam a consulta devolver o carro errado a alguem.
-- =============================================================================

alter table public.services
  add column if not exists share_token      text,
  add column if not exists share_expires_at timestamptz;

create unique index if not exists services_share_token_idx
  on public.services (share_token)
  where share_token is not null;
