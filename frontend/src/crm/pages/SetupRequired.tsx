import { CenteredState } from '../components/ui';

/**
 * Mostrado quando faltam as variaveis de ambiente do Supabase.
 *
 * Existe para cumprir a regra da especificacao (49): quando algo ainda nao
 * pode estar ligado, dizer exatamente o que falta configurar em vez de fingir
 * que funciona ou rebentar com um erro tecnico.
 */
export default function SetupRequired() {
  return (
    <CenteredState title="CRM por configurar">
      <p>Faltam as credenciais do Supabase. Defina as variáveis e volte a fazer o build:</p>

      <div className="mt-5 text-left bg-black/60 border border-white/10 rounded-sm p-4 font-mono text-[11px] text-white/70 space-y-1 overflow-x-auto">
        <div>REACT_APP_SUPABASE_URL=…</div>
        <div>REACT_APP_SUPABASE_ANON_KEY=…</div>
      </div>

      <p className="mt-5 text-xs text-white/45 leading-relaxed">
        Localmente, num ficheiro <code className="text-white/70">frontend/.env.local</code>.
        Em produção, nas variáveis de ambiente da Netlify. O prefixo{' '}
        <code className="text-white/70">REACT_APP_</code> é obrigatório — sem ele o
        Create React App não as inclui no build.
      </p>

      <p className="mt-4 text-xs text-white/45 leading-relaxed">
        Só a <code className="text-white/70">anon key</code>. A{' '}
        <code className="text-white/70">service_role</code> nunca entra no frontend.
      </p>

      <p className="mt-4 text-xs text-white/45">
        Passos completos em <code className="text-white/70">supabase/README.md</code>.
      </p>
    </CenteredState>
  );
}
