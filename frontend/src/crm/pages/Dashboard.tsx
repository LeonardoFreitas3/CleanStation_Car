import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Users, Wrench, Euro, Receipt, BellRing, Clock, Plus, BadgeEuro,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getDashboardStats, variation } from '../services/dashboard';
import type { DashboardStats } from '../services/dashboard';
import { useAuth } from '../contexts/AuthContext';
import { eur } from '../lib/format';
import { Alert, Button, Card, PageTitle, Spinner } from '../components/ui';

function Delta({ value }: { value: number | null }) {
  if (value === null) return <span className="text-white/25 text-xs">sem histórico</span>;

  const up = value >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${up ? 'text-emerald-400' : 'text-red-400'}`}>
      <Icon className="w-3 h-3" />
      {Math.abs(value).toFixed(0)}%
    </span>
  );
}

function Stat({
  label, value, icon: Icon, delta, to,
}: {
  label: string; value: string; icon: LucideIcon; delta?: number | null; to?: string;
}) {
  const body = (
    <Card className="p-4 h-full hover:border-blue-700/50 transition">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[9px] tracking-[0.25em] text-white/40 uppercase leading-tight">{label}</span>
        <Icon className="w-4 h-4 text-blue-400/60 shrink-0" strokeWidth={1.5} />
      </div>
      <div className="text-white font-display text-xl font-bold mt-2">{value}</div>
      {delta !== undefined && <div className="mt-1"><Delta value={delta} /></div>}
    </Card>
  );

  return to ? <Link to={to} className="block h-full">{body}</Link> : body;
}

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((e) => setError(e instanceof Error ? e.message : 'Não foi possível carregar as métricas.'))
      .finally(() => setLoading(false));
  }, []);

  const firstName = (profile?.full_name || '').split(' ')[0];

  if (loading) return <div className="py-20 flex justify-center"><Spinner size={26} /></div>;
  if (error) return <Alert tone="error">{error}</Alert>;
  if (!stats) return null;

  const maxRevenue = Math.max(...stats.revenue_by_month.map((m) => Number(m.revenue)), 1);

  return (
    <>
      <PageTitle sub={firstName ? `Bem-vindo, ${firstName}.` : undefined}>Dashboard</PageTitle>

      {/* Atalhos primeiro: no telemovel e o que se usa mais */}
      <div className="flex gap-3 mb-6 md:hidden">
        <Link to="/crm/servicos/novo" className="flex-1">
          <Button size="lg" className="w-full"><Plus className="w-4 h-4" /> Serviço</Button>
        </Link>
        <Link to="/crm/clientes/novo" className="flex-1">
          <Button variant="secondary" size="lg" className="w-full"><Plus className="w-4 h-4" /> Cliente</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Stat label="Agendados hoje" value={String(stats.scheduled_today)} icon={Clock} to="/crm/servicos" />
        <Stat label="Em curso" value={String(stats.in_progress)} icon={Wrench} to="/crm/servicos" />
        <Stat label="A contactar" value={String(stats.follow_ups)} icon={BellRing} to="/crm/follow-ups" />
        {/* Fica na fila de cima, com o trabalho do dia, e nao em "Este mes":
            uma divida de marco continua a ser divida hoje, e por baixo de um
            titulo que diz "Este mes" lia-se como se nao fosse.

            So aparece se a 0026 tiver corrido. Sem ela o campo nao vem na
            resposta e o cartao mostrava "0,00 €" — que se le como "ninguem
            deve nada" quando a verdade e "ainda nao ha como saber". */}
        {typeof stats.unpaid_total === 'number' && (
          <Stat
            label="Por cobrar"
            value={eur(stats.unpaid_total)}
            icon={BadgeEuro}
            to="/crm/servicos?filtro=por_cobrar"
          />
        )}
        <Stat label="Clientes" value={String(stats.clients_total)} icon={Users} to="/crm/clientes" />
      </div>

      <div className="text-[10px] tracking-[0.28em] text-white/50 uppercase mt-8 mb-3">Este mês</div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat
          label="Faturação"
          value={eur(stats.revenue_month)}
          icon={Euro}
          delta={variation(stats.revenue_month, stats.revenue_prev)}
        />
        <Stat
          label="Serviços"
          value={String(stats.services_month)}
          icon={Wrench}
          delta={variation(stats.services_month, stats.services_prev)}
        />
        <Stat
          label="Ticket médio"
          value={eur(stats.ticket_month)}
          icon={Receipt}
          delta={variation(stats.ticket_month, stats.ticket_prev)}
        />
        <Stat label="Clientes novos" value={String(stats.clients_new_month)} icon={Users} />
      </div>

      {stats.revenue_by_month.length > 0 && (
        <>
          <div className="text-[10px] tracking-[0.28em] text-white/50 uppercase mt-8 mb-3">
            Faturação por mês
          </div>
          <Card className="p-5">
            {/* Barras em CSS: uma biblioteca de graficos para isto pesava mais
                que o resto do CRM junto. */}
            <div className="flex items-end gap-1.5 h-40">
              {stats.revenue_by_month.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-2 min-w-0 group">
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-blue-800 to-blue-500 rounded-t-sm transition group-hover:from-blue-700 group-hover:to-blue-400"
                      style={{ height: `${Math.max(2, (Number(m.revenue) / maxRevenue) * 100)}%` }}
                      title={`${m.month}: ${eur(m.revenue)} (${m.count})`}
                    />
                  </div>
                  <span className="text-white/35 text-[9px] tabular-nums">{m.month.slice(5)}</span>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {stats.top_services.length > 0 && (
        <>
          <div className="text-[10px] tracking-[0.28em] text-white/50 uppercase mt-8 mb-3">
            Serviços mais vendidos
          </div>
          <Card className="p-5">
            <ul className="space-y-3">
              {stats.top_services.map((s) => (
                <li key={s.name} className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-white/80 truncate">{s.name}</span>
                  <span className="flex items-center gap-4 shrink-0">
                    <span className="text-white/40 text-xs">{s.count}×</span>
                    <span className="text-white font-semibold">{eur(s.revenue)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </>
  );
}
