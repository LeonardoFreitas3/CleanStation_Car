import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { CRM_BASE, homeForRole, isSupabaseConfigured } from './lib/config';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute, RoleGuard } from './components/ProtectedRoute';
import CrmLayout from './layouts/CrmLayout';
import Login from './pages/Login';
import NewPassword from './pages/NewPassword';
import SetupRequired from './pages/SetupRequired';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import ClientForm from './pages/ClientForm';
import VehicleForm from './pages/VehicleForm';
import VehicleDetail from './pages/VehicleDetail';
import AuditLog from './pages/AuditLog';
import Services from './pages/Services';
import Agenda from './pages/Agenda';
import ServiceDetail from './pages/ServiceDetail';
import ServiceForm from './pages/ServiceForm';
import FollowUps from './pages/FollowUps';
import Team from './pages/Team';
import Settings from './pages/Settings';

/**
 * Endereco que nao existe: manda cada um para a sua entrada.
 *
 * Enviar toda a gente para /crm dava ao funcionario um ecra de "sem
 * permissoes" — o dashboard e de admin e gestor. Sem sessao vai na mesma para
 * /crm, que trata de o levar ao login.
 */
/**
 * A raiz do CRM e o Dashboard, que o funcionario nao pode ver. Mandava-lhe um
 * "Sem permissoes" a cara — de um link antigo, de um favorito, de escrever /crm
 * a mao. Um erro nao e pagina de entrada de ninguem: vai para a Agenda, que e o
 * que ele abre todos os dias.
 */
function Home() {
  const { profile } = useAuth();
  if (profile?.role === 'employee') return <Navigate to="/crm/agenda" replace />;
  return <Dashboard />;
}

function HomeRedirect() {
  const { profile } = useAuth();
  return <Navigate to={profile ? homeForRole(profile.role) : CRM_BASE} replace />;
}

export default function CrmApp() {
  // noindex aqui e nao no layout: o login fica fora do layout e sem isto
  // herdava o "index, follow" do site publico. O robots.txt tambem proibe
  // /crm, mas isto cobre quem chega por link direto.
  useEffect(() => {
    // Reaproveita a meta que ja vem no index.html em vez de acrescentar outra:
    // duas metas robots com valores opostos e um sinal contraditorio para os
    // motores de busca, mesmo que na pratica vencesse a mais restritiva.
    let meta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const created = !meta;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'robots';
      document.head.appendChild(meta);
    }

    const previousContent = meta.content;
    const previousTitle = document.title;
    meta.content = 'noindex, nofollow';
    document.title = 'CRM · Clean Station Car';

    return () => {
      if (created) meta?.remove();
      else if (meta) meta.content = previousContent;
      document.title = previousTitle;
    };
  }, []);

  // Sem credenciais nao ha CRM nenhum. Mostra o que falta configurar em vez de
  // rebentar ao instanciar o cliente Supabase.
  if (!isSupabaseConfigured) return <SetupRequired />;

  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        {/* Fora do ProtectedRoute: quem chega pelo link tem sessao, mas nao
            deve ir para o dashboard antes de definir a palavra-passe. */}
        <Route path="nova-palavra-passe" element={<NewPassword />} />

        <Route
          element={
            <ProtectedRoute>
              <CrmLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="agenda" element={<Agenda />} />

          <Route path="servicos" element={<Services />} />
          <Route path="servicos/novo" element={<ServiceForm />} />
          <Route path="servicos/:id" element={<ServiceDetail />} />
          <Route path="servicos/:id/editar" element={<ServiceForm />} />

          <Route path="clientes" element={<Clients />} />
          <Route path="clientes/novo" element={<ClientForm />} />
          <Route path="clientes/:id" element={<ClientDetail />} />
          <Route path="clientes/:id/editar" element={<ClientForm />} />
          {/* Fora de clientes/:id: a viatura tem historia propria, e quem
              chega a ela pela pesquisa da matricula nao sabe o dono. */}
          <Route path="viaturas/:id" element={<VehicleDetail />} />
          <Route path="clientes/:id/viaturas/nova" element={<VehicleForm />} />
          <Route path="clientes/:id/viaturas/:vehicleId" element={<VehicleForm />} />
          <Route
            path="definicoes"
            element={
              <RoleGuard allow={['admin']}>
                <Settings />
              </RoleGuard>
            }
          />
          <Route
            path="equipa"
            element={
              <RoleGuard allow={['admin', 'manager']}>
                <Team />
              </RoleGuard>
            }
          />
          <Route
            path="registo"
            element={
              <RoleGuard allow={['admin']}>
                <AuditLog />
              </RoleGuard>
            }
          />
          <Route
            path="follow-ups"
            element={
              <RoleGuard allow={['admin', 'manager']}>
                <FollowUps />
              </RoleGuard>
            }
          />
        </Route>

        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </AuthProvider>
  );
}
