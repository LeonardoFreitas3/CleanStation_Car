import { useCallback, useEffect, useState } from 'react';
import { UserCheck, UserX, Info, UserPlus, X } from 'lucide-react';
import {
  ROLE_CLASS, ROLE_DESCRIPTION, ROLE_LABEL, inviteMember, listTeam, setActive, updateRole,
} from '../services/team';
import type { TeamMember } from '../services/team';
import { useAuth } from '../contexts/AuthContext';
import { date } from '../lib/format';
import { Alert, Button, Card, Field, PageTitle, Select, Spinner } from '../components/ui';
import type { UserRole } from '../types';

const ROLES: Array<{ value: UserRole; label: string }> = [
  { value: 'employee', label: 'Funcionário' },
  { value: 'manager', label: 'Gestor' },
  { value: 'admin', label: 'Administrador' },
];

export default function Team() {
  const { profile } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [invited, setInvited] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setMembers(await listTeam());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível carregar a equipa.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInviting(true);
    try {
      await inviteMember(inviteName.trim(), inviteEmail.trim());
      setInvited(inviteEmail.trim());
      setInviteOpen(false);
      setInviteName('');
      setInviteEmail('');
      // A conta é criada logo no convite (é o que o inviteUserByEmail faz), e
      // o trigger handle_new_user cria o perfil a seguir: recarregar já mostra
      // a pessoa na lista, inativa, antes sequer de ela abrir o email.
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar o convite.');
    } finally {
      setInviting(false);
    }
  };

  const changeRole = async (m: TeamMember, role: UserRole) => {
    if (role === m.role) return;
    setBusy(m.id);
    setError(null);
    try {
      await updateRole(m.id, role);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível alterar a função.');
    } finally {
      setBusy(null);
    }
  };

  const toggleActive = async (m: TeamMember) => {
    const action = m.active ? 'desativar' : 'reativar';
    if (!window.confirm(
      `Tem a certeza que pretende ${action} ${m.full_name || m.email}?\n\n`
      + (m.active
        ? 'Deixa de conseguir entrar e de ver qualquer dado. O histórico de serviços mantém-se.'
        : 'Volta a ter acesso ao CRM.'),
    )) return;

    setBusy(m.id);
    setError(null);
    try {
      await setActive(m.id, !m.active);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : `Não foi possível ${action}.`);
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <div className="py-20 flex justify-center"><Spinner size={26} /></div>;

  return (
    <>
      <PageTitle sub={`${members.length} ${members.length === 1 ? 'pessoa' : 'pessoas'}`}>
        Equipa
      </PageTitle>

      <div className="flex justify-end mb-4">
        <Button onClick={() => { setInviteOpen((o) => !o); setInvited(null); }}>
          {inviteOpen ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          {inviteOpen ? 'Cancelar' : 'Convidar'}
        </Button>
      </div>

      {inviteOpen && (
        <Card className="p-4 mb-6">
          <form onSubmit={invite} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field
                label="Nome"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="Nome próprio e apelido"
                required
              />
              <Field
                label="Email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="nome@exemplo.pt"
                required
              />
            </div>

            <div className="flex items-start gap-3 text-sm text-white/50 leading-relaxed">
              <Info className="w-4 h-4 text-blue-400/70 mt-0.5 shrink-0" />
              <span>
                Recebe um email com um link para escolher a palavra-passe. Ninguém mais a
                conhece — nem você, nem o sistema. Entra como{' '}
                <span className="text-white/70">Funcionário inativo</span>: só tem acesso
                depois de o ativar aqui.
              </span>
            </div>

            <div className="flex justify-end">
              <Button type="submit" loading={inviting}>Enviar convite</Button>
            </div>
          </form>
        </Card>
      )}

      {invited && (
        <div className="mb-6">
          <Alert tone="success">
            Convite enviado para {invited}. Já aparece na lista, inativo. Ative-o quando ele
            confirmar que definiu a palavra-passe.
          </Alert>
        </div>
      )}

      {error && <div className="mb-6"><Alert tone="error">{error}</Alert></div>}

      <div className="space-y-3">
        {members.map((m) => {
          const isSelf = m.id === profile?.id;
          const working = busy === m.id;

          return (
            <Card key={m.id} className={`p-4 ${m.active ? '' : 'opacity-60'}`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-semibold">{m.full_name || '(sem nome)'}</span>
                    <span className={`px-2 py-0.5 text-[10px] tracking-[0.15em] uppercase font-semibold border rounded-sm ${ROLE_CLASS[m.role]}`}>
                      {ROLE_LABEL[m.role]}
                    </span>
                    {isSelf && <span className="text-blue-400/70 text-[10px] tracking-[0.15em] uppercase">você</span>}
                    {!m.active && (
                      <span className="px-2 py-0.5 text-[10px] tracking-[0.15em] uppercase font-semibold border rounded-sm bg-red-950/30 text-red-300/80 border-red-900/40">
                        Inativo
                      </span>
                    )}
                  </div>
                  <div className="text-white/45 text-xs mt-1 truncate">{m.email}</div>
                  <div className="text-white/30 text-xs mt-1">
                    {m.total_services} {m.total_services === 1 ? 'serviço' : 'serviços'}
                    {m.services_month > 0 && ` · ${m.services_month} este mês`}
                    {m.last_service_at && ` · último em ${date(m.last_service_at)}`}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Select
                    label=""
                    value={m.role}
                    onChange={(e) => changeRole(m, e.target.value as UserRole)}
                    options={ROLES}
                    disabled={working || !m.active}
                    className="w-40"
                  />
                  <Button
                    variant={m.active ? 'danger' : 'secondary'}
                    onClick={() => toggleActive(m)}
                    loading={working}
                    // Desativar-se a si proprio expulsava-o na hora. A base de
                    // dados tambem impede ficar sem administradores, mas mais
                    // vale nao chegar la.
                    disabled={isSelf}
                    title={isSelf ? 'Não pode desativar a sua própria conta' : undefined}
                  >
                    {m.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    {m.active ? 'Desativar' : 'Ativar'}
                  </Button>
                </div>
              </div>

              <p className="text-white/30 text-xs mt-3 pt-3 border-t border-white/10">
                {ROLE_DESCRIPTION[m.role]}
              </p>
            </Card>
          );
        })}
      </div>
    </>
  );
}
