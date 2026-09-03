import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BellRing, BellOff, CalendarClock, CalendarDays, CalendarOff, ChevronLeft, ChevronRight, Plus, Trash2, X } from 'lucide-react';
import {
  apagarEventoDoGoogle, createTimeOff, dayKey, dayOccupancy, deleteTimeOff,
  isEncerrado, loadRange, monthDays, nextFreeHour, timeOffDays, weekDays,
} from '../services/agenda';
import type { BlocksState, Week } from '../services/agenda';
import { SERVICE_STATUS_CLASS, SERVICE_STATUS_LABEL } from '../services/services';
import type { ServiceWithRelations } from '../types';
import { MessageSender } from '../components/MessageSender';
import { WeekCalendar } from '../components/WeekCalendar';
import type { Item } from '../components/WeekCalendar';
import { MonthCalendar } from '../components/MonthCalendar';
import { Alert, Button, Card, Checkbox, Field, PageTitle, Spinner } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';

const DAY_LABEL = new Intl.DateTimeFormat('pt-PT', { weekday: 'long', day: '2-digit', month: 'long' });
const RANGE_LABEL = new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short' });
const MONTH_LABEL = new Intl.DateTimeFormat('pt-PT', { month: 'long', year: 'numeric' });
const HOUR = new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' });

const hour = (iso: string) => HOUR.format(new Date(iso));

/** YYYY-MM-DD de hoje, em hora local — serve de valor inicial do formulario. */
const todayKey = () => dayKey(new Date());

/**
 * O que se diz quando os bloqueios do Google faltam.
 *
 * Sao um extra: a semana mostra-se sem eles, como sempre se mostrou. Mas em
 * silencio as duas falhas eram iguais — a agenda ficava com bom aspeto e sem
 * dizer que estava a esconder ocupacao. Uma passa sozinha, a outra so passa com
 * um deploy, e nao ha como adivinhar qual olhando para o ecra.
 */
const AVISO_BLOCOS: Record<BlocksState, React.ReactNode> = {
  ok: null,

  'por-publicar': (
    <>
      A agenda não está a mostrar o que foi marcado direto no Google Calendar: a função
      <span className="font-mono"> booking </span>
      publicada é anterior a essa funcionalidade. Publica-a de novo
      (<span className="font-mono">supabase functions deploy booking</span>) e estes
      bloqueios voltam a aparecer. As marcações e as folgas em baixo estão completas.
    </>
  ),

  indisponivel: (
    <>
      Não foi possível ler o Google Calendar agora. O que foi marcado direto no
      calendário pode não estar aqui — as marcações e as folgas em baixo estão
      completas. Costuma resolver-se sozinho; recarregue daqui a pouco.
    </>
  ),
};

export default function Agenda() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState(() => new Date());
  /**
   * Semana ou mes.
   *
   * A semana responde a "o que ha para fazer"; o mes responde a "quando e que
   * ha espaco" — e e a vista com que toda a gente ja olha para um calendario no
   * telemovel. Nao substitui a semana: e la que se veem as horas.
   */
  const [vista, setVista] = useState<'semana' | 'mes'>('semana');
  const [week, setWeek] = useState<Week | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar num servico do calendario abre as mensagens. Guarda-se o servico
  // inteiro e nao o id: a grelha ja o tem carregado, e ir busca-lo outra vez ao
  // servidor era uma espera por um dado que esta ali a mao.
  const [mensagens, setMensagens] = useState<ServiceWithRelations | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [allDay, setAllDay] = useState(true);
  const [startDate, setStartDate] = useState(todayKey);
  const [endDate, setEndDate] = useState(todayKey);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('20:00');
  const [reason, setReason] = useState('');

  const load = useCallback(async (at: Date, v: 'semana' | 'mes') => {
    setLoading(true);
    try {
      setWeek(await loadRange(v === 'mes' ? monthDays(at) : weekDays(at)));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível carregar a agenda.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(anchor, vista); }, [anchor, vista, load]);

  // Indexar uma vez por semana carregada, em vez de percorrer as listas todas
  // dentro do map dos sete dias.
  const byDay = useMemo(() => {
    const services = new Map<string, Week['services']>();
    const off = new Map<string, Week['timeOff']>();
    const blocks = new Map<string, Week['blocks']>();
    if (!week) return { services, off, blocks };

    for (const s of week.services) {
      if (!s.scheduled_at) continue;
      const k = dayKey(new Date(s.scheduled_at));
      services.set(k, [...(services.get(k) ?? []), s]);
    }
    for (const o of week.timeOff) {
      for (const k of timeOffDays(o)) off.set(k, [...(off.get(k) ?? []), o]);
    }
    // Um bloqueio do Google entra no dia em que comeca. Nao se parte por dias
    // como as folgas: e quase sempre uma hora ou duas, e parti-lo dava tres
    // linhas iguais para dizer a mesma coisa.
    for (const b of week.blocks) {
      const k = dayKey(new Date(b.startIso));
      blocks.set(k, [...(blocks.get(k) ?? []), b]);
    }
    return { services, off, blocks };
  }, [week]);

  /**
   * Horas livres da semana.
   *
   * E o numero que decide se vale a pena pegar na lista de reativacao: uma
   * semana cheia nao precisa de se ligar a ninguem, uma semana vazia precisa de
   * se ligar a toda a gente. Sem isto contava-se a olho pela agenda.
   */
  const semana = useMemo(() => {
    if (!week) return null;
    return week.days.reduce((acc, d) => {
      const o = dayOccupancy(d, week);
      return { livres: acc.livres + (o.capacity - o.busy), total: acc.total + o.capacity };
    }, { livres: 0, total: 0 });
  }, [week]);

  /**
   * Abrir o formulário já com o dia e a hora.
   *
   * Hora null é "a primeira livre" — o mesmo que o + da lista propõe. Continua
   * a ser só uma sugestão: quem marca vê a hora no formulário e muda-a.
   */
  const marcar = (d: Date, hora: number | null) => {
    const key = dayKey(d);
    const h = hora === null
      ? nextFreeHour(d, byDay.services.get(key) ?? [])
      : `${String(hora).padStart(2, '0')}:00`;
    navigate(`/crm/servicos/novo?agendar=${key}T${h}`);
  };

  const shift = (passos: number) => setAnchor((a) => {
    const d = new Date(a);
    // No mes salta-se para o dia 1 antes de andar: a partir de 31 de janeiro,
    // setMonth(+1) da 3 de marco, e o mes de fevereiro nunca se via.
    if (vista === 'mes') { d.setDate(1); d.setMonth(d.getMonth() + passos); }
    else d.setDate(d.getDate() + passos * 7);
    return d;
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Datas locais: o operador pensa em hora de Lisboa e a maquina esta la.
    // ponytail: se um dia houver quem marque folgas de outro fuso, isto passa
    // a precisar da conversao explicita que a Edge Function ja faz.
    const start = allDay
      ? new Date(`${startDate}T00:00:00`)
      : new Date(`${startDate}T${startTime}:00`);
    const end = allDay
      ? new Date(new Date(`${endDate}T00:00:00`).getTime() + 24 * 3600_000)
      : new Date(`${startDate}T${endTime}:00`);

    if (!(start.getTime() < end.getTime())) {
      setError('O fim da folga tem de ser depois do início.');
      return;
    }

    setSaving(true);
    try {
      await createTimeOff({
        starts_at: start.toISOString(),
        ends_at: end.toISOString(),
        reason: reason.trim() || null,
      });
      setFormOpen(false);
      setReason('');
      await load(anchor, vista);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível marcar a folga.');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Apagar um bloco da agenda: uma folga ou um evento que só existe no Google.
   *
   * Os dois desaparecem da agenda e libertam as horas no site, mas não são a
   * mesma coisa e a pergunta di-lo. A folga é uma linha do CRM e apagá-la leva
   * o espelho no calendário atrás; o evento do Google é o original, e daqui
   * apaga-se mesmo — não há cópia no CRM para onde voltar.
   *
   * Os serviços não passam por aqui de propósito: apagar um serviço é desfazer
   * trabalho registado, faturação e histórico, e isso decide-se na ficha.
   */
  const apagarBloco = async (item: Item) => {
    if (!item.origem) return;

    const pergunta = item.origem.tipo === 'folga'
      ? `Apagar a folga "${item.titulo}"?\n\nAs horas voltam a ficar disponíveis no site.`
      : `Apagar "${item.titulo}" do Google Calendar?\n\n`
        + 'Este evento só existe no calendário — não tem ficha no CRM, e não há '
        + 'como o trazer de volta daqui.';

    if (!window.confirm(pergunta)) return;

    setError(null);
    try {
      if (item.origem.tipo === 'folga') await deleteTimeOff(item.origem.id);
      else await apagarEventoDoGoogle(item.origem.id);
      await load(anchor, vista);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível apagar.');
    }
  };

  const removeTimeOff = async (id: string, label: string) => {
    if (!window.confirm(`Apagar a folga de ${label}?\n\nAs horas voltam a ficar disponíveis no site.`)) return;
    try {
      await deleteTimeOff(id);
      await load(anchor, vista);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível apagar a folga.');
    }
  };

  const days = week?.days ?? [];
  const today = todayKey();

  return (
    <>
      <PageTitle
        sub={vista === 'mes'
          ? MONTH_LABEL.format(anchor)
          : days.length ? `${RANGE_LABEL.format(days[0])} a ${RANGE_LABEL.format(days[6])}` : undefined}
      >
        Agenda
      </PageTitle>

      {/* A pergunta que a agenda nunca respondia: sobra tempo? E o numero que
          decide se vale a pena pegar na lista de reativacao. */}
      {semana && semana.total > 0 && (
        <p className="text-white/45 text-xs mb-5 -mt-2">
          <span className="text-white/80 font-semibold tabular-nums">
            {Math.round(semana.livres / 60)}h
          </span>
          {vista === 'mes' ? ' livres este mês · ' : ' livres esta semana · '}
          {Math.round(((semana.total - semana.livres) / semana.total) * 100)}% ocupada
          {/* Só a quem pode abrir a pagina: o funcionario nao tem follow-ups, e
              um link que da "Sem permissoes" e pior do que link nenhum. */}
          {semana.livres / semana.total > 0.5 && profile?.role !== 'employee' && (
            <>
              {' · '}
              <Link to="/crm/follow-ups" className="text-blue-400/80 hover:text-blue-300 transition">
                ver quem contactar
              </Link>
            </>
          )}
        </p>
      )}

      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => shift(-1)} aria-label={vista === 'mes' ? 'Mês anterior' : 'Semana anterior'}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="secondary" onClick={() => setAnchor(new Date())}>Hoje</Button>
          <Button variant="secondary" onClick={() => shift(1)} aria-label={vista === 'mes' ? 'Mês seguinte' : 'Semana seguinte'}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            onClick={() => setVista((v) => (v === 'mes' ? 'semana' : 'mes'))}
            aria-label={vista === 'mes' ? 'Ver por semana' : 'Ver por mês'}
          >
            <CalendarDays className="w-4 h-4" />
            {vista === 'mes' ? 'Semana' : 'Mês'}
          </Button>
        </div>
        <Button onClick={() => setFormOpen((o) => !o)}>
          {formOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {formOpen ? 'Cancelar' : 'Marcar folga'}
        </Button>
      </div>

      {formOpen && (
        <Card className="p-4 mb-6">
          <form onSubmit={submit} className="space-y-4">
            <Checkbox
              label="Dia inteiro"
              hint="A folga ocupa os dias todos, das 00:00 às 24:00."
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <Field
                label={allDay ? 'Do dia' : 'Dia'}
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  // O fim segue o inicio enquanto estiver para tras: evita o
                  // intervalo invalido que so aparecia ao submeter.
                  if (e.target.value > endDate) setEndDate(e.target.value);
                }}
                required
              />
              {allDay ? (
                <Field
                  label="Até ao dia"
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Das" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                  <Field label="Às" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                </div>
              )}
            </div>

            <Field
              label="Motivo (opcional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Férias, formação, manutenção…"
              maxLength={120}
            />

            <div className="flex justify-end">
              <Button type="submit" loading={saving}>Marcar folga</Button>
            </div>
          </form>
        </Card>
      )}

      {error && <div className="mb-6"><Alert tone="error">{error}</Alert></div>}

      {week && AVISO_BLOCOS[week.blocksState] && (
        <div className="mb-6"><Alert tone="info">{AVISO_BLOCOS[week.blocksState]}</Alert></div>
      )}

      {loading && !week ? (
        <div className="py-20 flex justify-center"><Spinner size={26} /></div>
      ) : (
        <>
          {/* O calendário e a lista são o mesmo dado com dois desenhos, e quem
              escolhe é a largura do ecrã — não uma opção que alguém tenha de
              carregar. Sete colunas de horas num telemóvel não se lêem; a lista
              num ecrã grande desperdiça a semana inteira. */}
          {week && vista === 'mes' ? (
            /* O mes cabe em qualquer ecra — sete colunas de dias, nao de horas —
               e por isso nao tem lista por baixo. */
            <MonthCalendar
              week={week}
              mes={anchor.getMonth()}
              onServico={setMensagens}
              onDia={(d) => marcar(d, null)}
              onApagar={apagarBloco}
            />
          ) : (
          <>
          {week && (
            <div className="hidden lg:block mb-6">
              <WeekCalendar
                week={week}
                onServico={setMensagens}
                onMarcar={marcar}
                onApagar={apagarBloco}
              />
            </div>
          )}

          <div className="space-y-3 lg:hidden">
          {days.map((d) => {
            const key = dayKey(d);
            const services = byDay.services.get(key) ?? [];
            const off = byDay.off.get(key) ?? [];
            const blocks = byDay.blocks.get(key) ?? [];
            const closed = isEncerrado(d);
            const ocupacao = week ? dayOccupancy(d, week) : null;

            return (
              <Card key={key} className={`p-4 ${key === today ? 'border-blue-800/50' : ''}`}>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-white text-sm font-semibold capitalize">
                    {DAY_LABEL.format(d)}
                    {key === today && (
                      <span className="ml-2 text-blue-400/70 text-[10px] tracking-[0.15em] uppercase">hoje</span>
                    )}
                  </span>
                  {/* A barra antes do botao de marcar: quem olha para o dia
                      quer saber se cabe mais alguma coisa antes de a marcar. */}
                  {ocupacao && ocupacao.capacity > 0 && (
                    <span className="flex items-center gap-2 ml-auto mr-1 shrink-0">
                      <span className="w-16 h-1 bg-white/10 rounded-full overflow-hidden" aria-hidden="true">
                        <span
                          className={`block h-full rounded-full ${
                            ocupacao.pct >= 90 ? 'bg-red-500/70'
                              : ocupacao.pct >= 60 ? 'bg-amber-500/70'
                                : 'bg-emerald-500/60'
                          }`}
                          style={{ width: `${ocupacao.pct}%` }}
                        />
                      </span>
                      <span className="text-white/40 text-[10px] tabular-nums w-8 text-right">
                        {ocupacao.pct}%
                      </span>
                    </span>
                  )}

                  {/* Domingo tambem deixa marcar: a oficina nao abre ao publico
                      mas ha trabalho combinado a parte, e recusar aqui obrigava
                      a dar a volta pelo formulario. */}
                  <Link
                    to={`/crm/servicos/novo?agendar=${key}T${nextFreeHour(d, services)}`}
                    aria-label={`Marcar serviço em ${DAY_LABEL.format(d)}`}
                    className="text-white/35 hover:text-blue-400 transition shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Link>
                </div>

                {off.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between gap-3 mb-2 px-3 py-2 border border-amber-700/40 bg-amber-950/25 rounded-sm"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <CalendarOff className="w-4 h-4 text-amber-300/80 shrink-0" />
                      <span className="text-amber-200/90 text-sm truncate">
                        Folga
                        {/* So mostra horas quando nao e o dia todo: "00:00–00:00"
                            nao diz nada a ninguem. */}
                        {timeOffDays(o).length === 1 && new Date(o.starts_at).getHours() !== 0
                          && ` · ${hour(o.starts_at)}–${hour(o.ends_at)}`}
                        {o.reason && ` · ${o.reason}`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTimeOff(o.id, DAY_LABEL.format(d))}
                      aria-label="Apagar folga"
                      className="text-amber-300/60 hover:text-red-400 transition shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* So o que existe no Google e nao tem ficha ca: um bloqueio
                    feito pelo telemovel, uma ida ao fornecedor. O caixote
                    apaga-o no calendario — nao ha copia ca de onde o repor, e
                    a confirmacao di-lo antes de o fazer. */}
                {blocks.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-2 mb-2 px-3 py-2 border border-white/10 bg-white/[0.03] rounded-sm"
                  >
                    <CalendarClock className="w-4 h-4 text-white/40 shrink-0" />
                    <span className="text-white/50 text-sm tabular-nums shrink-0">
                      {hour(b.startIso)}–{hour(b.endIso)}
                    </span>
                    <span className="text-white/60 text-sm truncate">{b.summary}</span>
                    <button
                      type="button"
                      onClick={() => apagarBloco({
                        key: b.id,
                        titulo: b.summary,
                        detalhe: '',
                        startIso: b.startIso,
                        endIso: b.endIso,
                        origem: { tipo: 'google', id: b.id },
                        classe: '',
                      })}
                      aria-label={`Apagar ${b.summary} do Google Calendar`}
                      className="ml-auto text-white/30 hover:text-red-400 transition shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {services.map((s) => (
                  <Link
                    key={s.id}
                    to={`/crm/servicos/${s.id}`}
                    className="flex items-center gap-3 px-3 py-2 -mx-1 rounded-sm hover:bg-white/5 transition"
                  >
                    <span className="text-white/80 text-sm tabular-nums w-24 shrink-0">
                      {s.scheduled_at ? hour(s.scheduled_at) : '—'}
                      {s.scheduled_at && s.duration_minutes && (
                        <span className="text-white/35">
                          –{hour(new Date(new Date(s.scheduled_at).getTime() + s.duration_minutes * 60_000).toISOString())}
                        </span>
                      )}
                    </span>
                    <span className="text-white text-sm truncate">{s.service_name}</span>

                    {/* O lembrete da vespera sai sozinho para quem tem email.
                        Quem nao tem fica marcado aqui, que e onde se olha na
                        vespera — a resposta da tarefa agendada nao e lida por
                        ninguem. */}
                    {s.reminded_at ? (
                      <BellRing className="w-3.5 h-3.5 text-emerald-400/60 shrink-0" aria-label="Cliente avisado" />
                    ) : !s.client?.email ? (
                      <BellOff className="w-3.5 h-3.5 text-amber-400/60 shrink-0" aria-label="Sem email: avisar à mão" />
                    ) : null}
                    <span className="text-white/45 text-xs truncate">
                      {s.client?.name}
                      {s.vehicle?.plate && ` · ${s.vehicle.plate}`}
                    </span>
                    <span
                      className={`ml-auto shrink-0 px-2 py-0.5 text-[10px] tracking-[0.15em] uppercase font-semibold border rounded-sm ${SERVICE_STATUS_CLASS[s.status]}`}
                    >
                      {SERVICE_STATUS_LABEL[s.status]}
                    </span>
                  </Link>
                ))}

                {!services.length && !off.length && (
                  <p className="text-white/30 text-xs">
                    {closed ? (d.getDay() === 0 ? 'Encerrado' : 'Feriado') : 'Nada agendado'}
                  </p>
                )}
              </Card>
            );
          })}
          </div>
          </>
          )}
        </>
      )}

      {mensagens && (
        <MessageSender service={mensagens} onClose={() => setMensagens(null)} />
      )}
    </>
  );
}
