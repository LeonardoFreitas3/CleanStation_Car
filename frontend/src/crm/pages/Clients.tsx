import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Car, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDebounced } from '../hooks/useDebounced';
import {
  CLIENT_STATUS_CLASS, CLIENT_STATUS_LABEL, clientStatus, listClients,
} from '../services/clients';
import type { ClientSort } from '../services/clients';
import { daysAgo, eur } from '../lib/format';
import { Alert, Button, PageTitle, Spinner } from '../components/ui';
import type { ClientOverview } from '../types';

const PAGE_SIZE = 25;

const SORTS: Array<{ value: ClientSort; label: string }> = [
  { value: 'recent', label: 'Última visita' },
  { value: 'name', label: 'Nome' },
  { value: 'spent', label: 'Valor gasto' },
  { value: 'visits', label: 'Visitas' },
];

function StatusBadge({ client }: { client: ClientOverview }) {
  const status = clientStatus(client);
  return (
    <span className={`inline-block px-2 py-0.5 text-[10px] tracking-[0.15em] uppercase font-semibold border rounded-sm ${CLIENT_STATUS_CLASS[status]}`}>
      {CLIENT_STATUS_LABEL[status]}
    </span>
  );
}

export default function Clients() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<ClientSort>('recent');
  const [page, setPage] = useState(0);

  const [rows, setRows] = useState<ClientOverview[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const query = useDebounced(search);

  // Escrever na pesquisa ou trocar a ordenacao volta a pagina 1: sem isto
  // ficava-se numa pagina 4 que ja nao existe e a lista aparecia vazia.
  useEffect(() => { setPage(0); }, [query, sort]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listClients({ query, page, pageSize: PAGE_SIZE, sort });
      setRows(result.rows);
      setTotal(result.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível carregar os clientes.');
    } finally {
      setLoading(false);
    }
  }, [query, page, sort]);

  useEffect(() => { load(); }, [load]);

  const lastPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);

  return (
    <>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <PageTitle sub={total > 0 ? `${total} ${total === 1 ? 'cliente' : 'clientes'}` : undefined}>
          Clientes
        </PageTitle>
        <Link to="/crm/clientes/novo">
          <Button><Plus className="w-4 h-4" /> Novo cliente</Button>
        </Link>
      </div>

      <div className="flex gap-3 flex-wrap mb-6">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nome, telefone, email ou matrícula…"
            aria-label="Pesquisar clientes"
            className="w-full bg-black/60 border border-white/15 focus:border-blue-500 outline-none pl-10 pr-4 py-3 text-sm text-white rounded-sm placeholder:text-white/25"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as ClientSort)}
          aria-label="Ordenar por"
          className="bg-black/60 border border-white/15 focus:border-blue-500 outline-none px-4 py-3 text-sm text-white rounded-sm"
        >
          {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {error && <div className="mb-6"><Alert tone="error">{error}</Alert></div>}

      {loading && (
        <div className="py-20 flex justify-center"><Spinner size={26} /></div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="border border-dashed border-white/15 rounded-md p-10 text-center">
          <p className="text-white/60 text-sm">
            {query ? 'Nenhum cliente encontrado.' : 'Ainda não há clientes registados.'}
          </p>
          {!query && (
            <Link to="/crm/clientes/novo" className="inline-block mt-4">
              <Button variant="secondary"><Plus className="w-4 h-4" /> Criar o primeiro</Button>
            </Link>
          )}
        </div>
      )}

      {!loading && rows.length > 0 && (
        <>
          {/* Telemovel: cartoes. Uma tabela de 7 colunas num ecra de 375px
              obriga a scroll horizontal, que e mau de usar com uma mao. */}
          <div className="md:hidden space-y-3">
            {rows.map((c) => (
              <Link
                key={c.id}
                to={`/crm/clientes/${c.id}`}
                className="block bg-[#0e0e0e] border border-white/10 hover:border-blue-700/60 transition rounded-md p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-white font-semibold truncate">{c.name}</div>
                    <div className="text-white/45 text-xs mt-0.5">{c.phone || 'Sem telefone'}</div>
                  </div>
                  <StatusBadge client={c} />
                </div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10 text-xs text-white/55">
                  <span className="inline-flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-blue-400/70" />{c.vehicle_count}
                  </span>
                  <span>{c.visit_count} {c.visit_count === 1 ? 'visita' : 'visitas'}</span>
                  <span className="ml-auto text-white font-semibold">{eur(c.total_spent)}</span>
                </div>
                <div className="text-white/35 text-[11px] mt-2">{daysAgo(c.days_since_last_visit)}</div>
              </Link>
            ))}
          </div>

          <div className="hidden md:block border border-white/10 rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/5 text-white/45 text-[10px] tracking-[0.2em] uppercase">
                  <th className="text-left font-semibold px-4 py-3">Cliente</th>
                  <th className="text-left font-semibold px-4 py-3">Telefone</th>
                  <th className="text-right font-semibold px-4 py-3">Viaturas</th>
                  <th className="text-right font-semibold px-4 py-3">Visitas</th>
                  <th className="text-left font-semibold px-4 py-3">Última visita</th>
                  <th className="text-right font-semibold px-4 py-3">Valor gasto</th>
                  <th className="text-left font-semibold px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id} className="border-t border-white/8 hover:bg-white/[0.03] transition">
                    <td className="px-4 py-3">
                      <Link to={`/crm/clientes/${c.id}`} className="text-white hover:text-blue-400 font-medium transition">
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-white/60">{c.phone || '—'}</td>
                    <td className="px-4 py-3 text-white/60 text-right">{c.vehicle_count}</td>
                    <td className="px-4 py-3 text-white/60 text-right">{c.visit_count}</td>
                    <td className="px-4 py-3 text-white/60">{daysAgo(c.days_since_last_visit)}</td>
                    <td className="px-4 py-3 text-white text-right font-semibold">{eur(c.total_spent)}</td>
                    <td className="px-4 py-3"><StatusBadge client={c} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
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
