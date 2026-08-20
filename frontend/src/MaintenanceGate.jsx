import React, { useEffect, useState } from 'react';
import Maintenance from './components/Maintenance';
import { getSupabase } from './crm/lib/supabase';
import { isSupabaseConfigured } from './crm/lib/config';

/**
 * Esconde o site público enquanto está em testes, deixando passar quem tiver
 * sessão do CRM.
 *
 * Só é montado quando REACT_APP_MAINTENANCE=true — fora disso o site não paga
 * nada por isto, nem sequer carrega o supabase-js.
 *
 * Nota sobre o que isto é e não é: serve para o site não ser visto enquanto
 * não está pronto, não é uma barreira de segurança. Quem souber o que procura
 * chega ao HTML na mesma. O que está mesmo protegido é o CRM, pelo RLS.
 */
export default function MaintenanceGate({ children }) {
  const [allowed, setAllowed] = useState(null); // null = ainda a verificar

  useEffect(() => {
    if (!isSupabaseConfigured) { setAllowed(false); return; }

    let cancelled = false;

    (async () => {
      try {
        const supabase = getSupabase();
        const { data } = await supabase.auth.getSession();
        if (!data.session) { if (!cancelled) setAllowed(false); return; }

        // Ter sessão não chega: uma conta desativada não deve ver o site.
        const { data: profile } = await supabase
          .from('profiles')
          .select('active')
          .eq('id', data.session.user.id)
          .maybeSingle();

        if (!cancelled) setAllowed(Boolean(profile?.active));
      } catch {
        if (!cancelled) setAllowed(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // Ecrã preto enquanto verifica: mostrar a manutenção e depois trocar pelo
  // site daria um salto desagradável a quem tem sessão.
  if (allowed === null) return <div className="min-h-screen bg-black" />;

  return allowed ? children : <Maintenance />;
}
