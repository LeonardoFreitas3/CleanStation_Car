import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CenteredState, Spinner } from './ui';
import type { UserRole } from '../types';

// Estas guardas sao apenas experiencia de utilizacao: escondem o que a pessoa
// nao pode usar e evitam ecras vazios. A autorizacao a serio esta nas
// politicas RLS do Postgres, que se aplicam mesmo que alguem chame a API
// diretamente com a anon key e ignore o React por completo.

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Spinner size={28} />
      </div>
    );
  }

  if (!session) {
    // Guarda o destino para voltar ca depois do login, em vez de despejar
    // toda a gente no dashboard.
    return <Navigate to="/crm/login" replace state={{ from: location.pathname }} />;
  }

  // Autenticado no Auth mas sem perfil: so acontece se o trigger
  // handle_new_user falhou. Melhor dizer do que mostrar um CRM vazio.
  if (!profile) {
    return (
      <CenteredState title="Conta sem perfil">
        A sua conta existe mas não tem perfil associado no CRM. Contacte o administrador.
      </CenteredState>
    );
  }

  if (!profile.active) {
    return (
      <CenteredState title="Conta desativada">
        A sua conta foi desativada. Contacte o administrador.
      </CenteredState>
    );
  }

  return <>{children}</>;
}

export function RoleGuard({ allow, children }: { allow: UserRole[]; children: React.ReactNode }) {
  const { profile } = useAuth();

  if (!profile || !allow.includes(profile.role)) {
    return (
      <CenteredState title="Sem permissões">
        Não tem permissões para aceder a esta área.
      </CenteredState>
    );
  }

  return <>{children}</>;
}
