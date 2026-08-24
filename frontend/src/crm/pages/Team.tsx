import { useCallback, useEffect, useState } from 'react';
import { UserCheck, UserX, Info, UserPlus, X, Eye, EyeOff, KeyRound } from 'lucide-react';
import {
  ROLE_CLASS, ROLE_DESCRIPTION, ROLE_LABEL, createMember, listTeam, setActive, setPassword,
  updateRole,
} from '../services/team';
import type { TeamMember } from '../services/team';
import { useAuth } from '../contexts/AuthContext';
import { date } from '../lib/format';
import { Alert, Button, Card, Field, PageTitle, Select, Spinner } from '../components/ui';
import type { UserRole } from '../types';

/** Igual ao minimo da Edge Function e da pagina de nova palavra-passe. */
const MIN_PASSWORD = 8;

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

  const [formOpen, setFormOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<string | null>(null);

  // Qual das linhas tem o campo aberto. Null = nenhuma.
  const [passwordFor, setPasswordFor] = useState<string | null>(null);
  const [passwordValue, setPasswordValue] = useState('');
  const [changing, setChanging] = useState(false);
  const [passwordDone, setPasswordDone] = useState<string | null>(null);

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

  const createAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      await createMember(newName.trim(), newEmail.trim(), newPassword);
      setCreated(newEmail.trim());
      setFormOpen(false);
      setNewName('');
      setNewEmail('');
      // Não fica no estado depois de usada: o formulário pode reabrir para
      // criar outra conta, e a anterior não tem nada que estar lá.
      setNewPassword('');
      setShowPassword(false);
      // O trigger handle_new_user cria o perfil no mesmo instante em que a
      // conta nasce: recarregar já mostra a pessoa na lista, inativa.
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a conta.');
    } finally {
      setCreating(false);
    }
  };

  const changePassword = async (e: React.FormEvent, m: TeamMember) => {
    e.preventDefault();
    setError(null);
    setChanging(true);
    try {
      await setPassword(m.id, passwordValue);
      setPasswordFor(null);
      setPasswordValue('');
      setShowPassword(false);
      setPasswordDone(m.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível alterar a palavra-passe.');
    } finally {
      setChanging(false);
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
        <Button onClick={() => { setFormOpen((o) => !o); setCreated(null); }}>
          {formOpen ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          {formOpen ? 'Cancelar' : 'Criar conta'}
        </Button>
      </div>

      {formOpen && (
        <Card className="p-4 mb-6">
          <form onSubmit={createAccount} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field
                label="Nome"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nome próprio e apelido"
                required
              />
              <Field
                label="Email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="nome@exemplo.pt"
                required
              />
            </div>

            <Field
              label="Palavra-passe"
              // Escondida por omissão, mas com o olho para a poder ler: quem a
              // define tem de a transmitir, e uma gralha aqui manda a pessoa
              // ligar a perguntar porque é que não entra.
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              minLength={MIN_PASSWORD}
              required
              trailing={(
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Esconder palavra-passe' : 'Mostrar palavra-passe'}
                  className="text-white/40 hover:text-white transition p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              )}
            />

            <div className="flex items-start gap-3 text-sm text-white/50 leading-relaxed">
              <Info className="w-4 h-4 text-blue-400/70 mt-0.5 shrink-0" />
              <span>
                Mínimo {MIN_PASSWORD} caracteres. A conta fica pronta a usar — não é enviado
                nenhum email. Entra como{' '}
                <span className="text-white/70">Funcionário inativo</span>: só tem acesso
                depois de o ativar aqui.
              </span>
            </div>

            <div className="flex justify-end">
              <Button type="submit" loading={creating}>Criar conta</Button>
            </div>
          </form>
        </Card>
      )}

      {created && (
        <div className="mb-6">
          <Alert tone="success">
            Conta criada para {created}. Já aparece na lista, inativa — ative-a quando lhe
            der os dados de acesso.
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
                    variant="secondary"
                    onClick={() => {
                      setPasswordFor(passwordFor === m.id ? null : m.id);
                      setPasswordValue('');
                      setPasswordDone(null);
                    }}
                    title="Definir uma palavra-passe nova"
                  >
                    <KeyRound className="w-4 h-4" />
                    Palavra-passe
                  </Button>
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

              {passwordFor === m.id && (
                <form
                  onSubmit={(e) => changePassword(e, m)}
                  className="mt-4 pt-4 border-t border-white/10 flex items-end gap-3 flex-wrap"
                >
                  <Field
                    label={`Palavra-passe nova de ${m.full_name || m.email}`}
                    type={showPassword ? 'text' : 'password'}
                    value={passwordValue}
                    onChange={(e) => setPasswordValue(e.target.value)}
                    autoComplete="new-password"
                    minLength={MIN_PASSWORD}
                    required
                    className="flex-1 min-w-[240px]"
                    trailing={(
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'Esconder palavra-passe' : 'Mostrar palavra-passe'}
                        className="text-white/40 hover:text-white transition p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  />
                  <Button type="submit" loading={changing}>Guardar</Button>
                </form>
              )}

              {passwordDone === m.id && (
                <p className="text-emerald-300/80 text-xs mt-3">
                  Palavra-passe alterada. As sessões que já tivesse abertas continuam válidas —
                  para cortar o acesso é preciso desativar a conta.
                </p>
              )}

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
