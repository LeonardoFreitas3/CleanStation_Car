import { useAuth } from '../contexts/AuthContext';
import { PageTitle } from '../components/ui';

/**
 * Esqueleto. As metricas (faturacao, ticket medio, recorrencia) chegam na
 * fase 3, quando houver dados reais para agregar — nao vale a pena desenhar
 * cartoes com numeros inventados, que era exatamente o que a especificacao
 * pede para evitar.
 */
export default function Dashboard() {
  const { profile } = useAuth();
  const firstName = (profile?.full_name || '').split(' ')[0];

  return (
    <>
      <PageTitle sub={firstName ? `Bem-vindo, ${firstName}.` : undefined}>Dashboard</PageTitle>

      <div className="border border-dashed border-white/15 rounded-md p-8 text-center">
        <p className="text-white/60 text-sm">Métricas por construir.</p>
        <p className="text-white/35 text-xs mt-2">
          Faturação, ticket médio e recorrência chegam na fase 3, sobre dados reais.
        </p>
      </div>
    </>
  );
}
