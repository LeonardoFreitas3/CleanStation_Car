-- =============================================================================
-- CleanStation Car CRM — 0029 o gestor gere a equipa
--
-- Correr depois do 0028.
--
-- Até aqui só o administrador mexia em contas: a política `profiles_update_admin`
-- exige `is_admin()`, e a Edge Function `team` recusa tudo o resto. O gestor via
-- a descrição do próprio papel a dizer-lho — "Clientes, serviços e dashboard.
-- Não gere a equipa."
--
-- Passa a gerir. É uma decisão de confiança e não um botão: quem gere a equipa
-- muda palavras-passe, e quem muda palavras-passe entra nas contas.
--
-- ── Onde fica o limite ─────────────────────────────────────────────────────
--
-- O gestor mexe em funcionários e noutros gestores. **Não mexe na conta de um
-- administrador e não promove ninguém a administrador.** Sem essa linha, o
-- gestor mudava a palavra-passe do dono e ficava com a oficina.
--
-- A defesa está em dois sítios de propósito, e não por desconfiança de nenhum
-- deles. A política decide que linhas ele alcança; o trigger decide que colunas
-- ele pode mudar nessas linhas. Uma sozinha deixava passar metade do problema:
-- só a política, e ele promovia-se a admin na sua própria linha; só o trigger, e
-- chegava à linha do dono para lhe trocar o que o trigger não protege.
-- =============================================================================

-- ── Que linhas ──────────────────────────────────────────────────────────────
--
-- As políticas somam-se: esta não tira nada ao admin, que continua a ter a sua.
-- O `role <> 'admin'` aparece duas vezes e quer dizer coisas diferentes — no
-- using é a linha como está, no with check é como ficaria. A primeira impede-o
-- de tocar num administrador; a segunda impede-o de criar um.

drop policy if exists profiles_update_gestor on public.profiles;
create policy profiles_update_gestor on public.profiles
  for update to authenticated
  using (public.is_manager() and role <> 'admin')
  with check (public.is_manager() and role <> 'admin');

-- ── Que colunas ─────────────────────────────────────────────────────────────
--
-- O corpo é o do 0001 com um caso a mais no meio. O comentário de lá continua a
-- valer e vale a pena repeti-lo: sem este trigger, um utilizador com permissão
-- de update no próprio perfil fazia PATCH com {"role":"admin"} e promovia-se
-- sozinho. A política não consegue comparar com o valor antigo; o trigger
-- consegue.
--
-- O caso novo deixa o gestor ligar e desligar contas — que é o que "gerir a
-- equipa" quer dizer no dia a dia, porque desativar é como se corta o acesso a
-- quem sai. Mas só quando o papel **não muda**: se ele tentar mexer no papel na
-- mesma alteração, cai no revert e não muda nem uma coisa nem outra.
--
-- ATENCAO ao promover o primeiro admin, como no 0001: no SQL Editor não há JWT,
-- auth.uid() é NULL, e este trigger reverte a alteração SEM DAR ERRO.

create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if public.is_manager() and old.role <> 'admin' and new.role = old.role then
    return new;
  end if;

  new.role := old.role;
  new.active := old.active;
  return new;
end;
$$;

-- O trigger em si não muda; fica aqui por ser idempotente e para quem ler esta
-- migração sozinha saber onde a função é usada.
drop trigger if exists profiles_protect_privileges on public.profiles;
create trigger profiles_protect_privileges
  before update on public.profiles
  for each row execute function public.protect_profile_privileges();

-- ── O que continua a ser só do administrador ────────────────────────────────
--
-- Mudar papéis, apagar perfis (`profiles_delete_admin`), o registo de
-- alterações e a faturação. E, na Edge Function `team`, mexer numa conta de
-- administrador — essa guarda vive lá, porque é lá que se muda a palavra-passe
-- e o email, que não passam por esta tabela.
