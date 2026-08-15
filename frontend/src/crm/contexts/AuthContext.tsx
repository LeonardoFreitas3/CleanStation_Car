import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../lib/config';
import { friendlyError } from '../lib/errors';
import type { Profile, UserRole } from '../types';

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  /** true ate sabermos se ha sessao. Evita piscar o login a quem ja entrou. */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ error: string | null }>;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Evita escrever estado depois de desmontar, o que acontece quando o
  // utilizador sai da pagina a meio do carregamento do perfil.
  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);

  const loadProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    const { data, error } = await getSupabase()
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) return null;
    return data as Profile;
  }, []);

  useEffect(() => {
    // Sem credenciais nao ha nada para restaurar: sai do estado de loading
    // para as rotas poderem mostrar o ecra de configuracao em falta.
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const supabase = getSupabase();

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted.current) return;
      setSession(data.session);
      if (data.session) setProfile(await loadProfile(data.session.user.id));
      if (mounted.current) setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, next) => {
      if (!mounted.current) return;
      setSession(next);
      setProfile(next ? await loadProfile(next.user.id) : null);
    });

    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) return { error: friendlyError(error) };

      // Uma conta desativada continua a autenticar no Auth: o bloqueio esta
      // no perfil. Sem isto, um ex-funcionario entrava e via um CRM vazio
      // (o RLS filtra tudo) sem perceber porque. Terminamos a sessao ja.
      const p = data.session ? await loadProfile(data.session.user.id) : null;
      if (!p || !p.active) {
        await supabase.auth.signOut();
        return { error: 'A sua conta está desativada. Contacte o administrador.' };
      }

      return { error: null };
    } catch (e) {
      return { error: friendlyError(e) };
    }
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    await getSupabase().auth.signOut();
    setProfile(null);
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    try {
      const { error } = await getSupabase().auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/crm/nova-palavra-passe`,
      });
      return { error: error ? friendlyError(error) : null };
    } catch (e) {
      return { error: friendlyError(e) };
    }
  }, []);

  const hasRole = useCallback(
    (...roles: UserRole[]) => (profile ? roles.includes(profile.role) : false),
    [profile],
  );

  const value = useMemo(
    () => ({ session, profile, loading, signIn, signOut, requestPasswordReset, hasRole }),
    [session, profile, loading, signIn, signOut, requestPasswordReset, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth tem de ser usado dentro de <AuthProvider>');
  return ctx;
}
