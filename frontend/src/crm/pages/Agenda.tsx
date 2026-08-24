import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarOff, ChevronLeft, ChevronRight, Plus, Trash2, X } from 'lucide-react';
import {
  createTimeOff, dayKey, deleteTimeOff, loadWeek, timeOffDays,
} from '../services/agenda';
import type { Week } from '../services/agenda';
import { SERVICE_STATUS_CLASS, SERVICE_STATUS_LABEL } from '../services/services';
import { Alert, Button, Card, Checkbox, Field, PageTitle, Spinner } from '../components/ui';

const DAY_LABEL = new Intl.DateTimeFormat('pt-PT', { weekday: 'long', day: '2-digit', month: 'long' });
const RANGE_LABEL = new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short' });
const HOUR = new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' });

const hour = (iso: string) => HOUR.format(new Date(iso));

/** YYYY-MM-DD de hoje, em hora local — serve de valor inicial do formulario. */
const todayKey = () => dayKey(new Date());

export default function Agenda() {
  const [anchor, setAnchor] = useState(() => new Date());
  const [week, setWeek] = useState<Week | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [allDay, setAllDay] = useState(true);
  const [startDate, setStartDate] = useState(todayKey);
  const [endDate, setEndDate] = useState(todayKey);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('19:00');
  const [reason, setReason] = useState('');

  const load = useCallback(async (at: Date) => {
    setLoading(true);
    try {
      setWeek(await loadWeek(at));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível carregar a agenda.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(anchor); }, [anchor, load]);

  // Indexar uma vez por semana carregada, em vez de percorrer as listas todas
  // dentro do map dos sete dias.
  const byDay = useMemo(() => {
    const services = new Map<string, Week['services']>();
    const off = new Map<string, Week['timeOff']>();
    if (!week) return { services, off };

    for (const s of week.services) {
      if (!s.scheduled_at) continue;
      const k = dayKey(new Date(s.scheduled_at));
      services.set(k, [...(services.get(k) ?? []), s]);
    }
    for (const o of week.timeOff) {
      for (const k of timeOffDays(o)) off.set(k, [...(off.get(k) ?? []), o]);
    }
    return { services, off };
  }, [week]);

  const shiftWeek = (weeks: number) => setAnchor((a) => {
    const d = new Date(a);
    d.setDate(d.getDate() + weeks * 7);
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
      await load(anchor);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível marcar a folga.');
    } finally {
      setSaving(false);
    }
  };

  const removeTimeOff = async (id: string, label: string) => {
    if (!window.confirm(`Apagar a folga de ${label}?\n\nAs horas voltam a ficar disponíveis no site.`)) return;
    try {
      await deleteTimeOff(id);
      await load(anchor);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível apagar a folga.');
    }
  };

  const days = week?.days ?? [];
  const today = todayKey();

  return (
    <>
      <PageTitle
        sub={days.length ? `${RANGE_LABEL.format(days[0])} a ${RANGE_LABEL.format(days[6])}` : undefined}
      >
        Agenda
      </PageTitle>

      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => shiftWeek(-1)} aria-label="Semana anterior">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="secondary" onClick={() => setAnchor(new Date())}>Hoje</Button>
          <Button variant="secondary" onClick={() => shiftWeek(1)} aria-label="Semana seguinte">
            <ChevronRight className="w-4 h-4" />
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

      {loading && !week ? (
        <div className="py-20 flex justify-center"><Spinner size={26} /></div>
      ) : (
        <div className="space-y-3">
          {days.map((d) => {
            const key = dayKey(d);
            const services = byDay.services.get(key) ?? [];
            const off = byDay.off.get(key) ?? [];
            const closed = d.getDay() === 0;

            return (
              <Card key={key} className={`p-4 ${key === today ? 'border-blue-800/50' : ''}`}>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-white text-sm font-semibold capitalize">
                    {DAY_LABEL.format(d)}
                  </span>
                  {key === today && (
                    <span className="text-blue-400/70 text-[10px] tracking-[0.15em] uppercase">hoje</span>
                  )}
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
                  <p className="text-white/30 text-xs">{closed ? 'Encerrado' : 'Nada agendado'}</p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
