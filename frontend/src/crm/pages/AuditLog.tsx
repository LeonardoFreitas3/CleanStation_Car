import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  ACTION_CLASS, ACTION_LABEL, AUDIT_TABLES, TABLE_LABEL,
  describeChanges, listAuditLogs, recordPath,
} from '../services/audit';
import type { AuditLog } from '../services/audit';
import { Alert, PageTitle, Spinner } from '../components/ui';

const PAGE_SIZE = 50;

const QUANDO = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
});

export default function AuditLog() {
  const [table, setTable] = useState('');
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setPage(0); }, [table]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await listAuditLogs({ table, page, pageSize: PAGE_SIZE });
      setRows(r.rows);
      setTotal(r.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível carregar o registo.');
    } finally {
      setLoading(false);
    }
  }, [table, page]);

  useEffect(() => { load(); }, [load]);

  const lastPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);

  return (
    <>
      <PageTitle sub={total > 0 ? `${total} ${total === 1 ? 'alteração' : 'alterações'}` : undefined}>
        Registo
      </PageTitle>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
        {[{ id: '', label: 'Tudo' }, ...AUDIT_TABLES.map((t) => ({ id: t, label: TABLE_LABEL[t] }))].map((t) => (
          <button
            key={t.id}
            onClick={() => setTable(t.id)}
            className={`shrink-0 px-4 py-2 text-[11px] tracking-[0.15em] uppercase font-semibold border rounded-sm transition ${
              table === t.id
                ? 'bg-blue-950/40 border-blue-600 text-blue-300'
                : 'border-white/15 text-white/50 hover:text-white hover:border-white/30'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="text-white/40 text-xs mb-6 leading-relaxed">
        Cada criação, alteração e remoção em clientes, viaturas, serviços, contas e fotografias.
        Escrito pela base de dados e não pelo CRM: uma alteração feita pela API aparece aqui na
        mesma.
      </p>

      {error && <div className="mb-6"><Alert tone="error">{error}</Alert></div>}
      {loading && <div className="py-20 flex justify-center"><Spinner size={26} /></div>}

      {!loading && !error && rows.length === 0 && (
        <div className="border border-dashed border-white/15 rounded-md p-10 text-center">
          <p className="text-white/60 text-sm">Nada registado nesta vista.</p>
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="space-y-2">
          {rows.map((log) => {
            const caminho = recordPath(log);
            const mudancas = describeChanges(log);
            const etiqueta = `${ACTION_LABEL[log.action]} ${TABLE_LABEL[log.table_name] ?? log.table_name}`;

            return (
              <div key={log.id} className="px-4 py-3 bg-[#0e0e0e] border border-white/10 rounded-md">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-white/40 text-xs tabular-nums shrink-0">
                    {QUANDO.format(new Date(log.created_at))}
                  </span>

                  <span className={`shrink-0 px-2 py-0.5 text-[10px] tracking-[0.15em] uppercase font-semibold border rounded-sm ${ACTION_CLASS[log.action]}`}>
                    {etiqueta}
                  </span>

                  {/* Sem ator quando a alteracao veio de uma Edge Function: essas
                      correm com a service_role e nao tem sessao de ninguem. */}
                  <span className="text-white/60 text-sm truncate">
                    {log.actor_email ?? 'sistema'}
                  </span>

                  {caminho && (
                    <Link
                      to={caminho}
                      className="text-blue-400/80 hover:text-blue-300 text-xs ml-auto shrink-0 transition"
                    >
                      abrir
                    </Link>
                  )}
                </div>

                {mudancas.length > 0 && (
                  <div className="text-white/45 text-xs mt-2 leading-relaxed">
                    {mudancas.join(' · ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && total > PAGE_SIZE && (
        <div className="flex items-center justify-between gap-3 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="inline-flex items-center gap-2 text-white/50 hover:text-white text-xs transition disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" /> Anteriores
          </button>
          <span className="text-white/35 text-xs tabular-nums">{page + 1} / {lastPage + 1}</span>
          <button
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            disabled={page >= lastPage}
            className="inline-flex items-center gap-2 text-white/50 hover:text-white text-xs transition disabled:opacity-30"
          >
            Seguintes <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}
