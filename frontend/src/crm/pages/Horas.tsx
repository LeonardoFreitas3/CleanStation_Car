import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft, ChevronRight, Coffee, LogIn, LogOut, Pencil, Printer, Undo2,
} from 'lucide-react';
import {
  PICAGEM_LABEL, acoes, corrigir, fase, horaLocal, horas, listarSemana, picar,
  totalDaSemana, turnoDeHoje,
} from '../services/horas';
import type { Picagem, WorkShift } from '../services/horas';
import { dayKey, weekDays } from '../services/agenda';
import { listAssignable } from '../services/team';
import type { Assignable } from '../services/team';
import { useAuth } from '../contexts/AuthContext';
import { Alert, Button, Card, Field, PageTitle, Spinner } from '../components/ui';

const DIA_CURTO = new Intl.DateTimeFormat('pt-PT', { weekday: 'short', day: '2-digit', month: '2-digit' });
const DIA_LONGO = new Intl.DateTimeFormat('pt-PT', { weekday: 'long', day: '2-digit', month: 'long' });
const RANGE = new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short' });

const ICONE: Record<Picagem, typeof LogIn> = {
  entrada: LogIn,
  pausa: Coffee,
  regresso: Undo2,
  saida: LogOut,
};

/**
 * A folha de horas.
 *
 * Duas coisas no mesmo ecrã, e são a mesma coisa vista dos dois lados: o cartão
 * de picar o ponto, que é de quem trabalha, e a folha da semana, que é de quem
 * paga. Separá-las em duas páginas obrigava o funcionário a saber onde ver as
 * suas horas — e ele só quer carregar num botão à entrada e outro à saída.
 *
 * O administrador e o gestor veem a folha de toda a equipa; o funcionário vê a
 * dele. Quem decide isso não é este ecrã, são as políticas da 0031 — aqui só se
 * decide o que se desenha.
 */
export default function Horas() {
  const { profile } = useAuth();
  const gere = profile?.role === 'admin' || profile?.role === 'manager';

  const [hoje, setHoje] = useState<WorkShift | null>(null);
  const [ancora, setAncora] = useState(() => new Date());
  const [semana, setSemana] = useState<WorkShift[]>([]);
  const [equipa, setEquipa] = useState<Assignable[]>([]);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aCorrigir, setACorrigir] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const [meu, turnos] = await Promise.all([
        turnoDeHoje(profile.id),
        // Sem filtro para quem gere: as políticas é que decidem se isso traz a
        // equipa toda ou só quem está a perguntar.
        listarSemana(ancora, gere ? undefined : profile.id),
      ]);
      setHoje(meu);
      setSemana(turnos);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível carregar as horas.');
    } finally {
      setLoading(false);
    }
  }, [profile, ancora, gere]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!gere) return;
    listAssignable().then(setEquipa).catch(() => setEquipa([]));
  }, [gere]);

  const marcar = async (p: Picagem) => {
    if (!profile) return;
    setBusy(true);
    setError(null);
    try {
      await picar(p, profile.id, hoje?.id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível marcar.');
    } finally {
      setBusy(false);
    }
  };

  const dias = weekDays(ancora);

  /**
   * A semana agrupada por pessoa.
   *
   * Toda a gente ativa aparece, tenha picado ou não. Uma semana em branco é uma
   * informação — quem não aparece na folha é quem não a tem, e assim não se
   * confunde "não trabalhou" com "esqueceu-se de picar".
   */
  const porPessoa = useMemo(() => {
    const mapa = new Map<string, { nome: string; turnos: WorkShift[] }>();

    if (gere) {
      for (const p of equipa) mapa.set(p.id, { nome: p.full_name || '(sem nome)', turnos: [] });
    } else if (profile) {
      mapa.set(profile.id, { nome: profile.full_name || 'As minhas horas', turnos: [] });
    }

    for (const t of semana) {
      const atual = mapa.get(t.profile_id)
        ?? { nome: t.full_name || '(sem nome)', turnos: [] };
      atual.turnos.push(t);
      mapa.set(t.profile_id, atual);
    }

    return [...mapa.entries()].sort((a, b) => a[1].nome.localeCompare(b[1].nome));
  }, [semana, equipa, gere, profile]);

  const f = fase(hoje);
  const proximas = acoes(f);

  return (
    <>
      {/* Só a folha vai para o papel. Sem isto saía a barra lateral, os botões
          e o menu — e o que o administrador quer arquivar é a tabela. */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #folha, #folha * { visibility: visible; }
          #folha { position: absolute; left: 0; top: 0; width: 100%; }
          #folha .nao-imprimir { display: none; }
        }
      `}</style>

      <PageTitle sub={`${RANGE.format(dias[0])} a ${RANGE.format(dias[6])}`}>
        Folha de horas
      </PageTitle>

      {error && <div className="mb-6"><Alert tone="error">{error}</Alert></div>}

      {/* ── Picar o ponto ─────────────────────────────────────────────────── */}
      <Card className="p-5 mb-8 nao-imprimir">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-white text-sm font-semibold capitalize">{DIA_LONGO.format(new Date())}</h2>
            <p className="text-white/40 text-xs mt-1">
              {f === 'por-entrar' && 'Ainda não marcou a entrada.'}
              {f === 'a-trabalhar' && 'Ao serviço.'}
              {f === 'em-pausa' && 'Em pausa.'}
              {f === 'terminado' && 'Dia fechado.'}
            </p>
          </div>

          {hoje && (
            <div className="flex items-center gap-5 text-xs tabular-nums">
              <Marca titulo="Entrada" iso={hoje.started_at} />
              <Marca titulo="Almoço" iso={hoje.break_started_at} />
              <Marca titulo="Regresso" iso={hoje.break_ended_at} />
              <Marca titulo="Saída" iso={hoje.ended_at} />
              <div>
                <div className="text-white/35 text-[10px] tracking-[0.15em] uppercase">Total</div>
                <div className="text-white font-semibold text-base">{horas(hoje.worked_minutes)}</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-5 flex-wrap">
          {proximas.map((p) => {
            const Icon = ICONE[p];
            return (
              <Button
                key={p}
                onClick={() => marcar(p)}
                loading={busy}
                variant={p === 'saida' ? 'secondary' : 'primary'}
              >
                <Icon className="w-4 h-4" /> {PICAGEM_LABEL[p]}
              </Button>
            );
          })}
          {f === 'terminado' && (
            <p className="text-white/35 text-xs">
              O dia está fechado. Se ficou alguma hora errada, é o administrador que a corrige.
            </p>
          )}
        </div>
      </Card>

      {/* ── A folha ───────────────────────────────────────────────────────── */}
      <div id="folha">
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap nao-imprimir">
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setAncora(recuar(ancora))} aria-label="Semana anterior">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="secondary" onClick={() => setAncora(new Date())}>Esta semana</Button>
            <Button variant="secondary" onClick={() => setAncora(avancar(ancora))} aria-label="Semana seguinte">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer className="w-4 h-4" /> Imprimir
          </Button>
        </div>

        {/* Só no papel: o ecrã já tem isto no título da página. */}
        <div className="hidden print:block mb-4">
          <h1 className="text-black text-lg font-bold">
            {`Folha de horas · ${RANGE.format(dias[0])} a ${RANGE.format(dias[6])}`}
          </h1>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><Spinner size={26} /></div>
        ) : (
          <div className="space-y-8">
            {porPessoa.map(([id, { nome, turnos }]) => {
              const total = totalDaSemana(turnos);
              const porDia = new Map(turnos.map((t) => [t.work_date, t]));

              return (
                <section key={id}>
                  <div className="flex items-baseline justify-between gap-3 mb-3">
                    <h2 className="text-white text-sm font-semibold">{nome}</h2>
                    <div className="text-right">
                      <span className="text-white font-display text-lg font-bold tabular-nums">
                        {horas(total.minutos)}
                      </span>
                      {total.porFechar > 0 && (
                        <span className="block text-amber-300/80 text-[10px] tracking-[0.1em] uppercase">
                          {total.porFechar === 1
                            ? '1 dia por fechar'
                            : `${total.porFechar} dias por fechar`}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="border border-white/10 rounded-md overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-white/35 text-[10px] tracking-[0.15em] uppercase">
                          <th className="text-left font-medium px-3 py-2">Dia</th>
                          <th className="text-left font-medium px-3 py-2">Entrada</th>
                          <th className="text-left font-medium px-3 py-2">Almoço</th>
                          <th className="text-left font-medium px-3 py-2">Regresso</th>
                          <th className="text-left font-medium px-3 py-2">Saída</th>
                          <th className="text-right font-medium px-3 py-2">Horas</th>
                          {gere && <th className="w-8 nao-imprimir" />}
                        </tr>
                      </thead>
                      <tbody>
                        {dias.map((d) => {
                          const t = porDia.get(dayKey(d));
                          const aberto = t && aCorrigir === t.id;

                          return (
                            <tr key={dayKey(d)} className="border-t border-white/5">
                              <td className="px-3 py-2 text-white/70 capitalize whitespace-nowrap">
                                {DIA_CURTO.format(d).replace('.', '')}
                              </td>
                              <Hora iso={t?.started_at} />
                              <Hora iso={t?.break_started_at} />
                              <Hora iso={t?.break_ended_at} />
                              <Hora iso={t?.ended_at} />
                              <td className="px-3 py-2 text-right text-white tabular-nums">
                                {t ? horas(t.worked_minutes) : '—'}
                              </td>
                              {gere && (
                                <td className="px-2 nao-imprimir">
                                  {t && (
                                    <button
                                      type="button"
                                      onClick={() => setACorrigir(aberto ? null : t.id)}
                                      aria-label={`Corrigir ${dayKey(d)}`}
                                      className="text-white/25 hover:text-blue-400 transition"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* A nota de cada dia por baixo da tabela, e não numa coluna:
                      são raras e uma coluna vazia em seis dias não se justifica. */}
                  {turnos.filter((t) => t.note).map((t) => (
                    <p key={t.id} className="text-white/40 text-xs mt-2">
                      {`${t.work_date}: ${t.note}`}
                    </p>
                  ))}

                  {gere && turnos.map((t) => (
                    aCorrigir === t.id && (
                      <Correcao
                        key={t.id}
                        turno={t}
                        onFechar={() => setACorrigir(null)}
                        onGuardado={async () => { setACorrigir(null); await load(); }}
                        onErro={setError}
                      />
                    )
                  ))}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function Marca({ titulo, iso }: { titulo: string; iso: string | null }) {
  return (
    <div>
      <div className="text-white/35 text-[10px] tracking-[0.15em] uppercase">{titulo}</div>
      <div className={iso ? 'text-white/80' : 'text-white/25'}>{iso ? horaLocal(iso) : '—'}</div>
    </div>
  );
}

function Hora({ iso }: { iso: string | null | undefined }) {
  return (
    <td className={`px-3 py-2 tabular-nums ${iso ? 'text-white/75' : 'text-white/20'}`}>
      {iso ? horaLocal(iso) : '—'}
    </td>
  );
}

/**
 * Corrigir um dia.
 *
 * Existe porque esquecer a saída acontece todas as semanas, e a alternativa era
 * o funcionário poder reescrever a folha dele — que é justamente o que a 0031
 * não deixa. Quem corrige é quem gere, e a correção fica no registo de
 * alterações com o nome de quem a fez.
 */
function Correcao({
  turno, onFechar, onGuardado, onErro,
}: {
  turno: WorkShift;
  onFechar: () => void;
  onGuardado: () => void;
  onErro: (m: string) => void;
}) {
  const [marcas, setMarcas] = useState({
    entrada: horaLocal(turno.started_at),
    pausa: horaLocal(turno.break_started_at),
    regresso: horaLocal(turno.break_ended_at),
    saida: horaLocal(turno.ended_at),
  });
  const [note, setNote] = useState(turno.note ?? '');
  const [saving, setSaving] = useState(false);

  const guardar = async () => {
    setSaving(true);
    try {
      await corrigir(turno, marcas, note.trim() || null);
      onGuardado();
    } catch (e) {
      onErro(e instanceof Error ? e.message : 'Não foi possível guardar a correção.');
    } finally {
      setSaving(false);
    }
  };

  const campo = (k: keyof typeof marcas, label: string) => (
    <Field
      label={label}
      type="time"
      value={marcas[k]}
      onChange={(e) => setMarcas((m) => ({ ...m, [k]: e.target.value }))}
    />
  );

  return (
    <Card className="p-4 mt-3 nao-imprimir">
      <p className="text-white/45 text-xs mb-4">
        {`Corrigir ${turno.work_date}. Um campo vazio apaga a marca.`}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {campo('entrada', 'Entrada')}
        {campo('pausa', 'Almoço')}
        {campo('regresso', 'Regresso')}
        {campo('saida', 'Saída')}
      </div>
      <div className="mt-3">
        <Field
          label="Motivo (opcional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Esqueceu-se de picar a saída…"
          maxLength={200}
        />
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="secondary" onClick={onFechar}>Cancelar</Button>
        <Button onClick={guardar} loading={saving}>Guardar</Button>
      </div>
    </Card>
  );
}

const recuar = (d: Date) => somaDias(d, -7);
const avancar = (d: Date) => somaDias(d, 7);

function somaDias(d: Date, n: number): Date {
  const nova = new Date(d);
  nova.setDate(nova.getDate() + n);
  return nova;
}
