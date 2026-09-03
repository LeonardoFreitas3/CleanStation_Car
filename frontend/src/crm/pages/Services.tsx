import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Car, User, ChevronLeft, ChevronRight, CircleAlert } from 'lucide-react';
import {
  SERVICE_FILTERS, SERVICE_FLOW, SERVICE_STATUS_CLASS, SERVICE_STATUS_LABEL,
  listServices, parseFilter,
} from '../services/services';
import { dayKey } from '../services/agenda';
import type { ServiceFilter } from '../services/services';
import { listAssignable } from '../services/team';
import type { Assignable } from '../services/team';
import { useAuth } from '../contexts/AuthContext';
import { duracao, eur } from '../lib/format';
import { Alert, Button, PageTitle, Spinner } from '../components/ui';
import type { ServiceWithRelations } from '../types';

const PAGE_SIZE = 25;

const HORA = new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' });
const DIA_LONGO = new Intl.DateTimeFormat('pt-PT', { weekday: 'long', day: '2-digit', month: 'long' });

/**
 * O dia a que uma linha pertence.
 *
 * A hora marcada quando existe; senao o dia em que foi registada. Um servico
 * sem hora tem de cair nalgum lado — deixa-lo de fora do agrupamento fazia-o
 * desaparecer da lista sem dizer porque.
 */
const diaDaLinha = (s: ServiceWithRelations) =>
  dayKey(new Date(s.scheduled_at ?? s.created_at));

/** "Hoje", "Amanha", "Ontem", ou o dia por extenso. */
function tituloDoDia(key: string): string {
  const hoje = new Date();
  const rotulo = (offset: number) => {
    const d = new Date(hoje);
    d.setDate(d.getDate() + offset);
    return dayKey(d);
  };

  if (key === rotulo(0)) return 'Hoje';
  if (key === rotulo(1)) return 'Amanhã';
  if (key === rotulo(-1)) return 'Ontem';
  // O YYYY-MM-DD e local: parte-se a mao em vez de new Date(key), que le a
  // string como UTC e recua um dia em Portugal no horario de verao.
  const [ano, mes, dia] = key.split('-').map(Number);
  return DIA_LONGO.format(new Date(ano, mes - 1, dia));
}

/**
 * Quanto do fluxo ja andou, de 0 a 1.
 *
 * Cancelado nao tem progresso: nao parou a meio do caminho, saiu dele.
 */
function progresso(s: ServiceWithRelations): number | null {
  if (s.status === 'cancelado') return null;
  const i = SERVICE_FLOW.indexOf(s.status);
  return i < 0 ? null : i / (SERVICE_FLOW.length - 1);
}

/** Acabado e por pagar. O mesmo criterio do filtro "Por cobrar". */
const porCobrar = (s: ServiceWithRelations) =>
  (s.status === 'concluido' || s.status === 'entregue') && !s.paid_at;

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

  // Os dias pela ordem em que as linhas vieram: quem ordena e o Postgres, e
  // reordenar aqui punha a pagina 2 a discordar da pagina 1.
  const grupos = useMemo(() => {
    const mapa = new Map<string, ServiceWithRelations[]>();
    for (const s of rows) {
      const k = diaDaLinha(s);
      mapa.set(k, [...(mapa.get(k) ?? []), s]);
    }
    return [...mapa.entries()];
  }, [rows]);

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
            aria-pressed={filter === f.value}
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
          {/* Agrupado por dia, e as linhas com a hora a esquerda: a lista
              passou a ler-se como se le uma agenda. Antes eram cartoes todos
              iguais, com a referencia — o dado que menos se procura — em
              primeiro lugar e a hora em letra pequena no canto.

              Os cabecalhos so aparecem quando ha mais do que um dia: na vista
              "Hoje" seria uma linha a dizer o que os filtros ja dizem. */}
          <div className="space-y-6">
            {grupos.map(([dia, doDia]) => (
              <div key={dia}>
                {grupos.length > 1 && (
                  <h2 className="text-white/45 text-[11px] tracking-[0.18em] uppercase font-semibold mb-2 capitalize">
                    {tituloDoDia(dia)}
                    <span className="text-white/25 ml-2 normal-case tracking-normal">
                      {doDia.length}
                    </span>
                  </h2>
                )}

                <div className="space-y-2">
                  {doDia.map((s) => {
                    const pct = progresso(s);
                    const falta = porCobrar(s);

                    return (
                      <Link
                        key={s.id}
                        to={`/crm/servicos/${s.id}`}
                        aria-label={`${s.service_name}, ${s.client?.name ?? 'sem cliente'}, ${SERVICE_STATUS_LABEL[s.status]}`}
                        className="block relative overflow-hidden bg-[#0e0e0e] border border-white/10 hover:border-blue-700/60 focus-visible:border-blue-500 transition rounded-md"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
                          {/* A hora primeiro, como na agenda: e por ela que se
                              procura uma marcacao. Sem hora nao inventa um
                              travessao — diz o que se passa. */}
                          <div className="w-14 sm:w-16 shrink-0 text-center">
                            {s.scheduled_at ? (
                              <>
                                <div className="text-white text-base sm:text-lg font-semibold tabular-nums leading-none">
                                  {HORA.format(new Date(s.scheduled_at))}
                                </div>
                                {s.duration_minutes && (
                                  <div className="text-white/35 text-[10px] mt-1">
                                    {duracao(s.duration_minutes)}
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="text-white/30 text-[10px] tracking-[0.15em] uppercase leading-tight">
                                Sem hora
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-white text-sm font-semibold truncate">
                                {s.service_name}
                              </span>
                              <span className={`px-2 py-0.5 text-[10px] tracking-[0.12em] uppercase font-semibold border rounded-sm ${SERVICE_STATUS_CLASS[s.status]}`}>
                                {SERVICE_STATUS_LABEL[s.status]}
                              </span>
                            </div>

                            {/* Cliente, carro e quem faz numa linha so. Sao a
                                mesma pergunta — de quem e este trabalho — e
                                tres linhas separadas so faziam a lista crescer. */}
                            <div className="flex items-center gap-3 mt-1 text-xs text-white/55 flex-wrap">
                              <span className="truncate">{s.client?.name ?? 'Sem cliente'}</span>
                              {s.vehicle && (
                                <span className="inline-flex items-center gap-1.5">
                                  <Car className="w-3.5 h-3.5 text-blue-400/60" aria-hidden="true" />
                                  {s.vehicle.plate}
                                </span>
                              )}
                              {s.employee && (
                                <span className="inline-flex items-center gap-1.5">
                                  <User className="w-3.5 h-3.5 text-blue-400/60" aria-hidden="true" />
                                  {s.employee.full_name}
                                </span>
                              )}
                              <span className="text-white/25 font-mono">#{s.reference}</span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-white font-display text-base sm:text-lg font-bold tabular-nums">
                              {eur(s.total)}
                            </div>
                            {/* So aparece onde e uma novidade: numa lista de
                                cobrancas todas as linhas o estariam a dizer. */}
                            {falta && filter !== 'por_cobrar' && (
                              <span className="inline-flex items-center gap-1 mt-1 text-amber-300/80 text-[10px] tracking-[0.12em] uppercase">
                                <CircleAlert className="w-3 h-3" aria-hidden="true" />
                                Por cobrar
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Onde vai o trabalho, sem ter de ler a etiqueta. Duas
                            linhas de fila numa vista de vinte e cinco servicos
                            dizem mais depressa quem esta quase a acabar. */}
                        {pct !== null && (
                          <span
                            className="absolute bottom-0 left-0 h-0.5 bg-blue-500/50"
                            style={{ width: `${Math.round(pct * 100)}%` }}
                            aria-hidden="true"
                          />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
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
