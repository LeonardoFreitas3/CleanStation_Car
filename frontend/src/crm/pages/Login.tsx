import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Alert, Button, Field, Spinner } from '../components/ui';
import { homeForRole } from '../lib/config';

export default function Login() {
  const { session, profile, loading, signIn, requestPasswordReset } = useAuth();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><Spinner size={28} /></div>;
  }

  if (session && profile?.active) {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from && from !== '/crm/login' ? from : homeForRole(profile.role)} replace />;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);

    if (resetMode) {
      const { error: err } = await requestPasswordReset(email);
      setBusy(false);
      if (err) { setError(err); return; }
      // Resposta igual haja ou nao conta com este email: dizer "email nao
      // encontrado" permitiria descobrir quem tem conta no CRM.
      setNotice('Se existir uma conta com este email, enviámos as instruções de recuperação.');
      return;
    }

    const { error: err } = await signIn(email, password);
    setBusy(false);
    if (err) setError(err);
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
            Área reservada
          </p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <Field
            label="Email"
            type="email"
            name="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nome@cleanstationcar.com"
          />

          {!resetMode && (
            <Field
              label="Palavra-passe"
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Esconder palavra-passe' : 'Mostrar palavra-passe'}
                  className="text-white/40 hover:text-blue-400 transition p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
          )}

          {error && <Alert tone="error">{error}</Alert>}
          {notice && <Alert tone="success">{notice}</Alert>}

          <Button type="submit" size="lg" loading={busy} className="w-full">
            {resetMode ? 'Recuperar palavra-passe' : 'Entrar'}
          </Button>

          <button
            type="button"
            onClick={() => { setResetMode((v) => !v); setError(null); setNotice(null); }}
            className="w-full text-center text-white/45 hover:text-blue-400 text-xs transition pt-1"
          >
            {resetMode ? 'Voltar ao início de sessão' : 'Esqueci-me da palavra-passe'}
          </button>
        </form>
      </div>
    </div>
  );
}
