import { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Wrench, BellRing, LogOut } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Quem ve o item. O RLS e que decide o acesso real aos dados. */
  allow: UserRole[];
  end?: boolean;
}

const ALL: UserRole[] = ['admin', 'manager', 'employee'];
const STAFF: UserRole[] = ['admin', 'manager'];

// O dashboard fica fora do alcance do employee: agrega faturacao e ticket
// medio, que a especificacao poe fora do que ele deve consultar.
const NAV: NavItem[] = [
  { to: '/crm', label: 'Dashboard', icon: LayoutDashboard, allow: STAFF, end: true },
  { to: '/crm/servicos', label: 'Serviços', icon: Wrench, allow: ALL },
  { to: '/crm/clientes', label: 'Clientes', icon: Users, allow: ALL },
  { to: '/crm/follow-ups', label: 'Follow-ups', icon: BellRing, allow: STAFF },
];

const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Administrador',
  manager: 'Gestor',
  employee: 'Funcionário',
};

export default function CrmLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  // O CRM nunca deve ser indexado. O robots.txt ja o proibe, mas isto cobre o
  // caso de alguem chegar por um link direto.
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    const previousTitle = document.title;
    document.title = 'CRM · Clean Station Car';
    return () => { meta.remove(); document.title = previousTitle; };
  }, []);

  const items = NAV.filter((i) => (profile ? i.allow.includes(profile.role) : false));

  const handleSignOut = async () => {
    await signOut();
    navigate('/crm/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Barra lateral: desktop e tablet (so icones abaixo de xl) */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-16 xl:w-60 flex-col border-r border-white/10 bg-[#0b0b0b]">
        <div className="h-20 flex items-center justify-center xl:justify-start xl:px-5 border-b border-white/10">
          <img src={`${process.env.PUBLIC_URL}/img/logo.png`} alt="Clean Station Car" className="h-8 w-auto" />
        </div>

        <nav className="flex-1 py-4">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={label}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3.5 text-[11px] tracking-[0.18em] uppercase font-semibold transition border-l-2 ${
                  isActive
                    ? 'border-blue-500 text-white bg-blue-950/25'
                    : 'border-transparent text-white/50 hover:text-blue-400'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
              <span className="hidden xl:inline">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="hidden xl:block px-2 pb-3">
            <div className="text-white text-xs font-semibold truncate">{profile?.full_name || profile?.email}</div>
            <div className="text-blue-400/70 text-[10px] tracking-[0.2em] uppercase mt-0.5">
              {profile ? ROLE_LABEL[profile.role] : ''}
            </div>
          </div>
          <button
            onClick={handleSignOut}
            title="Terminar sessão"
            className="w-full flex items-center gap-3 px-2 py-2.5 text-white/50 hover:text-red-400 transition text-[11px] tracking-[0.18em] uppercase"
          >
            <LogOut className="w-5 h-5 shrink-0" strokeWidth={1.5} />
            <span className="hidden xl:inline">Sair</span>
          </button>
        </div>
      </aside>

      {/* Cabecalho no telemovel */}
      <header className="md:hidden sticky top-0 z-40 h-16 flex items-center justify-between px-4 border-b border-white/10 bg-black/90 backdrop-blur">
        <img src={`${process.env.PUBLIC_URL}/img/logo.png`} alt="Clean Station Car" className="h-7 w-auto" />
        <button
          onClick={handleSignOut}
          aria-label="Terminar sessão"
          className="text-white/50 hover:text-red-400 transition p-2"
        >
          <LogOut className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </header>

      {/* pb-24 no telemovel deixa o conteudo acima da navegacao inferior */}
      <main className="md:pl-16 xl:pl-60 pb-24 md:pb-0">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
          <Outlet />
        </div>
      </main>

      {/* Navegacao inferior: alvos grandes, para usar com uma mao */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-black/95 backdrop-blur">
        <div className="flex">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1 py-3 text-[9px] tracking-[0.14em] uppercase font-semibold transition ${
                  isActive ? 'text-blue-400' : 'text-white/45'
                }`
              }
            >
              <Icon className="w-5 h-5" strokeWidth={1.5} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
