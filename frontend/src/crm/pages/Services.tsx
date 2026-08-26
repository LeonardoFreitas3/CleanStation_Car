import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Car, User, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import {
  SERVICE_FILTERS, SERVICE_STATUS_CLASS, SERVICE_STATUS_LABEL, listServices, parseFilter,
} from '../services/services';
import type { ServiceFilter } from '../services/services';
import { listAssignable } from '../services/team';
import type { Assignable } from '../services/team';
import { useAuth } from '../contexts/AuthContext';
import { eur } from '../lib/format';
import { Alert, Button, PageTitle, Spinner } from '../components/ui';
import type { ServiceWithRelations } from '../types';

const PAGE_SIZE = 25;

function hourOf(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
}

export default function Services() {
  const { profile } = useAuth();
  const [params] = useSearchParams();

  // O ?filtro= existe para o dashboard poder apontar para uma lista concreta —
  // carregar em "Por cobrar" tem de trazer os que estao por cobrar, e nao os de
  // hoje. Lido uma vez, no arranque: a partir dai manda quem carrega nos
  // botoes, senao o filtro voltava atras sozinho.
  const [filter, setFilter] = useState<ServiceFilter>(() => parseFilter(params.get('filtro')));
  const [page, setPage] = useState(0);

  // O funcionario abre a lista no que lhe toca; quem distribui abre em toda a
  // gente, que e o que precisa de ver para distribuir. Nenhum dos dois fica
  // preso: a caixa muda para qualquer pessoa ou para todos.
  const [employeeId, setEmployeeId] = useState(
    profile?.role === 'employee' ? profile.id : '',
  );
  const [team, setTeam] = useState<Assignable[]>([]);

  const [rows, setRows] = useState<ServiceWithRelations[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setPage(0); }, [filter, employeeId]);

  // A lista de nomes nao muda enquanto se navega: carregada uma vez. Falhar
  // aqui nao pode partir os servicos — fica-se sem a caixa, ve-se tudo.
  useEffect(() => { listAssignable().then(setTeam).catch(() => setTeam([])); }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listServices({
        filter,
        page,
        pageSize: PAGE_SIZE,
        employeeId: employeeId || undefined,
      });
      setRows(result.rows);
      setTotal(result.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível carregar os serviços.');
    } finally {
      setLoading(false);
    }
  }, [filter, page, employeeId]);

  useEffect(() => { load(); }, [load]);

  const lastPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);

  return (
    <>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <PageTitle sub={total > 0 ? `${total} ${total === 1 ? 'serviço' : 'serviços'}` : undefined}>
          Serviços
        </PageTitle>
        <Link to="/crm/servicos/novo">
          <Button><Plus className="w-4 h-4" /> Novo serviço</Button>
        </Link>
      </div>

      {/* Filtros com scroll horizontal no telemovel, para nao partirem a linha */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
        {SERVICE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`shrink-0 px-4 py-2 text-[11px] tracking-[0.15em] uppercase font-semibold border rounded-sm transition ${
              filter === f.value
                ? 'bg-blue-950/40 border-blue-600 text-blue-300'
                : 'border-white/15 text-white/50 hover:text-white hover:border-white/30'
            }`}
          >
            {f.label}
          </button>
        ))}

        {/* Ao lado dos filtros e nao por baixo: e a mesma pergunta — que
            servicos e que quero ver. */}
        {team.length > 1 && (
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            aria-label="Filtrar por funcionário"
            className="shrink-0 bg-black/60 border border-white/15 focus:border-blue-500 outline-none px-3 py-2 text-[11px] tracking-[0.15em] uppercase font-semibold text-white/70 rounded-sm transition"
          >
            <option value="">Toda a equipa</option>
            {team.map((t) => (
              <option key={t.id} value={t.id}>
                {t.id === profile?.id ? 'Os meus' : (t.full_name || '(sem nome)')}
              </option>
            ))}
          </select>
        )}
      </div>

      {error && <div className="mb-6"><Alert tone="error">{error}</Alert></div>}

      {loading && <div className="py-20 flex justify-center"><Spinner size={26} /></div>}

      {!loading && !error && rows.length === 0 && (
        <div className="border border-dashed border-white/15 rounded-md p-10 text-center">
          <p className="text-white/60 text-sm">Nenhum serviço nesta vista.</p>
          <p className="text-white/35 text-xs mt-2">
            {employeeId ? 'Experimente outro filtro, ou toda a equipa.' : 'Experimente outro filtro.'}
          </p>
        </div>
      )}

      {!loading && rows.length > 0 && (
        <>
          <div className="space-y-3">
            {rows.map((s) => (
              <Link
                key={s.id}
                to={`/crm/servicos/${s.id}`}
                className="block bg-[#0e0e0e] border border-white/10 hover:border-blue-700/60 transition rounded-md p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white/30 text-xs font-mono">#{s.reference}</span>
                      <span className={`px-2 py-0.5 text-[10px] tracking-[0.15em] uppercase font-semibold border rounded-sm ${SERVICE_STATUS_CLASS[s.status]}`}>
                        {SERVICE_STATUS_LABEL[s.status]}
                      </span>
                    </div>
                    <div className="text-white font-semibold mt-2 truncate">{s.service_name}</div>
                    <div className="text-white/55 text-sm mt-1 truncate">{s.client?.name ?? 'Sem cliente'}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-white font-display text-lg font-bold">{eur(s.total)}</div>
                    {s.scheduled_at && (
                      <div className="text-white/40 text-xs mt-1 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />{hourOf(s.scheduled_at)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10 text-xs text-white/50 flex-wrap">
                  {s.vehicle && (
                    <span className="inline-flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-blue-400/70" />
                      {s.vehicle.plate}
                      {s.vehicle.make && <span className="text-white/35">· {s.vehicle.make} {s.vehicle.model}</span>}
                    </span>
                  )}
                  {s.employee && (
                    <span className="inline-flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-400/70" />
                      {s.employee.full_name}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {lastPage > 0 && (
            <div className="flex items-center justify-between mt-6">
              <span className="text-white/40 text-xs">Página {page + 1} de {lastPage + 1}</span>
              <div className="flex gap-2">
                <Button variant="secondary" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </Button>
                <Button variant="secondary" disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)}>
                  Seguinte <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
