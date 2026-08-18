import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { isSupabaseConfigured } from './lib/config';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, RoleGuard } from './components/ProtectedRoute';
import CrmLayout from './layouts/CrmLayout';
import Login from './pages/Login';
import SetupRequired from './pages/SetupRequired';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import ClientForm from './pages/ClientForm';
import VehicleForm from './pages/VehicleForm';
import Services from './pages/Services';
import { PageTitle } from './components/ui';

/** Secao ainda por construir. Diz o que e, em vez de fingir que funciona. */
function Pending({ title, phase }: { title: string; phase: string }) {
  return (
    <>
      <PageTitle>{title}</PageTitle>
      <div className="border border-dashed border-white/15 rounded-md p-8 text-center">
        <p className="text-white/60 text-sm">Esta secção ainda não está construída.</p>
        <p className="text-white/35 text-xs mt-2">Prevista para a {phase}.</p>
      </div>
    </>
  );
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

        <Route
          element={
            <ProtectedRoute>
              <CrmLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <RoleGuard allow={['admin', 'manager']}>
                <Dashboard />
              </RoleGuard>
            }
          />
          <Route path="servicos" element={<Services />} />
          <Route path="servicos/novo" element={<Pending title="Novo serviço" phase="próxima entrega" />} />
          <Route path="servicos/:id" element={<Pending title="Serviço" phase="próxima entrega" />} />

          <Route path="clientes" element={<Clients />} />
          <Route path="clientes/novo" element={<ClientForm />} />
          <Route path="clientes/:id" element={<ClientDetail />} />
          <Route path="clientes/:id/editar" element={<ClientForm />} />
          <Route path="clientes/:id/viaturas/nova" element={<VehicleForm />} />
          <Route
            path="follow-ups"
            element={
              <RoleGuard allow={['admin', 'manager']}>
                <Pending title="Follow-ups" phase="fase 2" />
              </RoleGuard>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/crm" replace />} />
      </Routes>
    </AuthProvider>
  );
}
