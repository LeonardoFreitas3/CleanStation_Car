-- =============================================================================
-- CleanStation Car CRM — 0005 correcao do trigger stamp_consent
--
-- Correr depois do 0004. Substitui a funcao; nao altera dados.
-- =============================================================================

-- O 0001 tinha:
--
--   if new.data_consent and (tg_op = 'INSERT' or not old.data_consent) then
--
-- Num BEFORE INSERT o OLD nao esta atribuido. O PL/pgSQL prepara a expressao
-- como uma consulta e passa NEW e OLD como parametros ANTES de a avaliar,
-- portanto o `or` nao faz curto-circuito que evite tocar no OLD — rebenta com
-- "record old is not assigned yet" e leva o INSERT inteiro atras.
--
-- A forma correta e separar por operacao: no INSERT nunca se menciona OLD.

create or replace function public.stamp_consent()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    if new.data_consent then
      new.data_consent_at := now();
    end if;
    if new.marketing_consent then
      new.marketing_consent_at := now();
    end if;
    return new;
  end if;

  -- UPDATE: so carimba na transicao de false para true, para nao reescrever a
  -- data original a cada gravacao. Retirar o consentimento limpa a data.
  if new.data_consent and not old.data_consent then
    new.data_consent_at := now();
  elsif not new.data_consent then
    new.data_consent_at := null;
  end if;

  if new.marketing_consent and not old.marketing_consent then
    new.marketing_consent_at := now();
  elsif not new.marketing_consent then
    new.marketing_consent_at := null;
  end if;

  return new;
end;
$$;

-- Teste: deve inserir sem erro e devolver data_consent_at preenchido.
-- Apaga-se a si proprio no fim.
do $$
declare
  test_id uuid;
  stamped timestamptz;
begin
  insert into public.clients (name, phone, data_consent)
  values ('__teste_stamp_consent__', '000000000', true)
  returning id, data_consent_at into test_id, stamped;

  if stamped is null then
    raise exception 'stamp_consent nao carimbou a data no INSERT';
  end if;

  delete from public.clients where id = test_id;
  raise notice 'stamp_consent OK — INSERT carimbou e o registo de teste foi removido';
end $$;
