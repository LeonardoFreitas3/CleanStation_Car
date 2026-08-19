import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { getSupabase } from '../lib/supabase';
import { friendlyError } from '../lib/errors';
import { useAuth } from '../contexts/AuthContext';
import { Alert, Button, Field, Spinner } from '../components/ui';

const MIN_LENGTH = 8;

/**
 * Destino do link de recuperacao enviado por email.
 *
 * Quando se chega por esse link, o supabase-js ja trocou o token do fragmento
 * do URL por uma sessao (detectSessionInUrl). Ter sessao aqui e portanto a
 * prova de que o link era valido — sem sessao, expirou ou foi adulterado.
 *
 * A rota vive fora do ProtectedRoute de proposito: a pessoa TEM sessao, mas
 * nao a queremos despejar no dashboard antes de definir a palavra-passe.
 */
export default function NewPassword() {
  const navigate = useNavigate();
  const { session, loading, signOut } = useAuth();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><Spinner size={28} /></div>;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < MIN_LENGTH) {
      setError(`A palavra-passe deve ter pelo menos ${MIN_LENGTH} caracteres.`);
      return;
    }
    if (password !== confirm) {
      setError('As palavras-passe não coincidem.');
      return;
    }

    setBusy(true);
    try {
      const { error: err } = await getSupabase().auth.updateUser({ password });
      if (err) { setError(friendlyError(err)); setBusy(false); return; }

      // Termina a sessao aberta pelo link: quem acabou de definir uma
      // palavra-passe deve entrar com ela, e assim confirma-se que ficou certa.
      await signOut();
      setDone(true);
    } catch (err) {
      setError(friendlyError(err));
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <img
            src={`${process.env.PUBLIC_URL}/img/logo.png`}
            alt="Clean Station Car"
            className="h-16 w-auto mx-auto"
          />
          <p className="text-blue-400 text-[10px] tracking-[0.42em] font-semibold mt-6 uppercase">
            Nova palavra-passe
          </p>
        </div>

        {done ? (
          <div className="space-y-5 text-center">
            <Alert tone="success">Palavra-passe alterada. Já pode iniciar sessão.</Alert>
            <Button size="lg" className="w-full" onClick={() => navigate('/crm/login', { replace: true })}>
              Ir para o início de sessão
            </Button>
          </div>
        ) : !session ? (
          <div className="space-y-5 text-center">
            <Alert tone="error">
              Esta ligação é inválida ou expirou. Peça uma nova recuperação de palavra-passe.
            </Alert>
            <Button variant="secondary" size="lg" className="w-full" onClick={() => navigate('/crm/login', { replace: true })}>
              Voltar ao início de sessão
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <Field
              label="Nova palavra-passe"
              type={show ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Pelo menos 8 caracteres"
              autoFocus
              trailing={
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? 'Esconder palavra-passe' : 'Mostrar palavra-passe'}
                  className="text-white/40 hover:text-blue-400 transition p-1"
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <Field
              label="Confirmar"
              type={show ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repita a palavra-passe"
              error={confirm && password !== confirm ? 'As palavras-passe não coincidem.' : null}
            />

            {error && <Alert tone="error">{error}</Alert>}

            <Button type="submit" size="lg" loading={busy} className="w-full">
              <KeyRound className="w-4 h-4" /> Guardar palavra-passe
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
