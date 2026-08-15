import { Navigate, Route, Routes } from 'react-router-dom';
import { isSupabaseConfigured } from './lib/config';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, RoleGuard } from './components/ProtectedRoute';
import CrmLayout from './layouts/CrmLayout';
import Login from './pages/Login';
import SetupRequired from './pages/SetupRequired';
import Dashboard from './pages/Dashboard';
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
          <Route path="servicos" element={<Pending title="Serviços" phase="fase 1" />} />
          <Route path="clientes" element={<Pending title="Clientes" phase="fase 1" />} />
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
