import React, { useEffect, useState } from 'react';
import { Wrench, MessageCircle, Instagram, Eye, EyeOff, LogIn, X } from 'lucide-react';
import { SITE } from '../mock';
import { getSupabase } from '../crm/lib/supabase';
import { friendlyError } from '../crm/lib/errors';

/**
 * Ecrã de manutenção do site público.
 *
 * Continua a mostrar telefone, WhatsApp e morada: quem chega ao site quer
 * marcar um serviço, e um "voltamos já" sem forma de contacto perde o cliente.
 *
 * O login usa as mesmas credenciais do CRM e desbloqueia o site público aqui
 * mesmo — não leva ninguém para o CRM. Serve para testar o site tal como um
 * cliente o vai ver.
 */
export default function Maintenance({ onUnlock }) {
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Sem isto o Google indexava o "voltamos em breve" como sendo o site, e essa
  // versão ficava em cache nos resultados durante dias depois de voltar ao ar.
  useEffect(() => {
    const meta = document.querySelector('meta[name="robots"]');
    const previous = meta?.content;
    if (meta) meta.content = 'noindex, nofollow';
    document.title = 'Clean Station Car — em manutenção';
    return () => { if (meta && previous) meta.content = previous; };
  }, []);

  const waUrl = `https://wa.me/${SITE.phoneRaw}?text=${encodeURIComponent(
    'Olá! Gostaria de fazer uma marcação na Clean Station Car.',
  )}`;

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);

    try {
      const supabase = getSupabase();
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (err) { setError(friendlyError(err)); setBusy(false); return; }

      // Uma conta desativada autentica no Auth mas não deve ver nada.
      const { data: profile } = await supabase
        .from('profiles').select('active').eq('id', data.session.user.id).maybeSingle();

      if (!profile?.active) {
        await supabase.auth.signOut();
        setError('A sua conta está desativada.');
        setBusy(false);
        return;
      }

      onUnlock();
    } catch (err) {
      setError(friendlyError(err));
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md text-center">
        <img
          src={`${process.env.PUBLIC_URL}/img/logo.png`}
          alt="Clean Station Car"
          className="h-20 w-auto mx-auto"
        />

        <div className="inline-flex items-center gap-2 mt-10 px-4 py-2 border border-white/15 rounded-sm">
          <Wrench className="w-4 h-4 text-blue-400" strokeWidth={1.5} />
          <span className="text-[10px] tracking-[0.3em] uppercase text-white/70">
            Site em manutenção
          </span>
        </div>

        <h1 className="font-display text-2xl md:text-3xl font-black tracking-wide mt-8">
          VOLTAMOS EM BREVE
        </h1>
        <span className="accent-bar mx-auto mt-5" />

        <p className="text-white/60 text-sm mt-6 leading-relaxed">
          Estamos a preparar uma nova versão do site.
          Entretanto continuamos a trabalhar normalmente — fale connosco.
        </p>

        <div className="mt-10 space-y-3">
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs tracking-[0.25em] font-bold transition rounded-sm"
          >
            <MessageCircle className="w-4 h-4" /> MARCAR POR WHATSAPP
          </a>

          <a
            href={`tel:${SITE.phoneRaw}`}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 border border-white/20 hover:border-blue-500 hover:text-blue-300 text-white text-xs tracking-[0.25em] font-bold transition rounded-sm"
          >
            {SITE.phone}
          </a>
        </div>

        <div className="mt-10 pt-8 border-t border-white/10 text-white/45 text-xs leading-relaxed">
          <p>{SITE.address}</p>
          <p className="mt-1">{SITE.hours}</p>
          <a
            href="https://www.instagram.com/cleanstation_car/"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="inline-flex items-center gap-2 mt-4 hover:text-pink-400 transition"
          >
            <Instagram className="w-4 h-4" strokeWidth={1.5} /> @cleanstation_car
          </a>
        </div>

        {/* Discreto de propósito: é para a equipa, não para os visitantes. */}
        {!showLogin ? (
          <button
            onClick={() => setShowLogin(true)}
            className="inline-block mt-12 text-white/20 hover:text-blue-400 text-[10px] tracking-[0.25em] uppercase transition"
          >
            Pré-visualizar o site
          </button>
        ) : (
          <form onSubmit={submit} className="mt-12 text-left border border-white/12 rounded-sm p-5 bg-white/[0.02]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] tracking-[0.28em] text-white/50 uppercase">
                Pré-visualização
              </span>
              <button
                type="button"
                onClick={() => { setShowLogin(false); setError(null); }}
                aria-label="Fechar"
                className="text-white/35 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full bg-black/60 border border-white/15 focus:border-blue-500 outline-none px-4 py-3 text-white text-sm rounded-sm placeholder:text-white/25 mb-3"
            />

            <div className="relative mb-4">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Palavra-passe"
                className="w-full bg-black/60 border border-white/15 focus:border-blue-500 outline-none px-4 py-3 pr-12 text-white text-sm rounded-sm placeholder:text-white/25"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Esconder palavra-passe' : 'Mostrar palavra-passe'}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/40 hover:text-blue-400 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div role="alert" className="border border-red-800/60 bg-red-950/40 text-red-200 text-xs px-3 py-2 rounded-sm mb-4">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white text-xs tracking-[0.22em] font-bold transition rounded-sm"
            >
              <LogIn className="w-4 h-4" /> {busy ? 'A ENTRAR…' : 'VER O SITE'}
            </button>

            <a
              href="/crm"
              className="block text-center text-white/30 hover:text-blue-400 text-[10px] tracking-[0.2em] uppercase mt-4 transition"
            >
              Ir para o CRM
            </a>
          </form>
        )}
      </div>
    </div>
  );
}
