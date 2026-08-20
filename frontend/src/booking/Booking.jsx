import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  X, ChevronLeft, ChevronRight, Check, Clock, ArrowRight, ArrowLeft, Loader2, CalendarDays,
} from 'lucide-react';
import {
  VEHICLE_TYPES, VEHICLE_BY_ID, LEVEL_BY_ID,
  INTERIOR_PROBLEMS, EXTERIOR_PROBLEMS, PROBLEM_LABEL,
  levelsFor, packsFor, computeQuote, durationFor, formatDuration, eur,
} from './pricing';
import { fetchAvailability, createBooking } from './api';
import CarVisual from './CarVisual';

const STEPS = ['Veículo', 'Serviço', 'Estado', 'Data', 'Dados'];

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

/** ISO local (YYYY-MM-DD). toISOString() daria o dia errado a partir das 23h. */
function isoDate(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function Stepper({ current }) {
  return (
    <div className="flex items-center gap-1 px-5 py-3 border-b border-white/10 overflow-x-auto">
      {STEPS.map((label, i) => (
        <React.Fragment key={label}>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center border ${
              i < current ? 'bg-blue-700 border-blue-600 text-white'
                : i === current ? 'border-blue-400 text-blue-300 bg-blue-950'
                  : 'border-white/15 text-white/30'
            }`}
            >
              {i < current ? <Check className="w-3 h-3" /> : i + 1}
            </span>
            <span className={`text-[10px] tracking-[0.15em] uppercase ${
              i === current ? 'text-blue-300 font-bold' : 'text-white/35'
            }`}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && <span className="w-4 h-px bg-white/15 shrink-0" />}
        </React.Fragment>
      ))}
    </div>
  );
}

function Choice({ active, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative text-left border px-4 py-3.5 transition rounded-sm ${
        active
          ? 'border-blue-600 bg-blue-900/25 text-white'
          : 'border-white/12 bg-white/[0.03] text-white/80 hover:border-blue-700/60 hover:bg-blue-900/10'
      } ${className}`}
    >
      {children}
      {active && (
        <span className="absolute top-2 right-2 w-4 h-4 bg-blue-600 text-white flex items-center justify-center rounded-sm">
          <Check className="w-3 h-3" />
        </span>
      )}
    </button>
  );
}

function Calendar({ value, onChange }) {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    // getDay() devolve 0 para domingo; a grelha começa à segunda.
    const lead = (first.getDay() + 6) % 7;
    const cells = Array(lead).fill(null);
    for (let d = 1; d <= last.getDate(); d++) {
      cells.push(new Date(month.getFullYear(), month.getMonth(), d));
    }
    return cells;
  }, [month]);

  const canGoBack = month > new Date(today.getFullYear(), today.getMonth(), 1);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          disabled={!canGoBack}
          aria-label="Mês anterior"
          className="w-8 h-8 border border-white/15 text-white flex items-center justify-center rounded-sm disabled:opacity-25 hover:border-blue-500 transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-white text-sm font-semibold">
          {MONTHS[month.getMonth()]} {month.getFullYear()}
        </span>
        <button
          type="button"
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          aria-label="Mês seguinte"
          className="w-8 h-8 border border-white/15 text-white flex items-center justify-center rounded-sm hover:border-blue-500 transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center text-[9px] tracking-[0.1em] text-white/30 uppercase py-1">{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          if (!d) return <span key={`x${i}`} />;
          const iso = isoDate(d);
          // Domingo fechado; dias passados não são opção.
          // Nao se marca para o proprio dia: o trabalho tem de ser
          // preparado com antecedencia. O servidor recusa na mesma, isto
          // so evita que o cliente escolha e leve com um erro depois.
          const closed = d.getDay() === 0 || d <= today;
          const selected = value === iso;
          return (
            <button
              key={iso}
              type="button"
              disabled={closed}
              onClick={() => onChange(iso)}
              className={`aspect-square text-sm rounded-sm border transition ${
                selected ? 'bg-blue-700 border-blue-500 text-white font-bold'
                  : closed ? 'border-transparent text-white/15 cursor-not-allowed'
                    : 'border-white/10 text-white/80 hover:border-blue-500 hover:text-white'
              }`}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
      <p className="text-white/30 text-[11px] mt-3">
        Domingos encerrado. Marcações a partir de amanhã. Horários ocupados não aparecem.
      </p>
    </div>
  );
}

export default function Booking({ open, onClose }) {
  const [step, setStep] = useState(0);
  const [vehicleId, setVehicleId] = useState(null);
  const [levelId, setLevelId] = useState(null);
  const [pack, setPack] = useState(null);
  const [problems, setProblems] = useState([]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [form, setForm] = useState({ name: '', phone: '', email: '', car: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(null);

  const reset = useCallback(() => {
    setStep(0); setVehicleId(null); setLevelId(null); setPack(null); setProblems([]);
    setDate(''); setTime(''); setSlots([]); setError(null); setDone(null);
    setForm({ name: '', phone: '', email: '', car: '', notes: '' });
  }, []);

  useEffect(() => { if (open) reset(); }, [open, reset]);

  const duration = vehicleId && levelId ? durationFor(vehicleId, levelId) : 60;
  const quote = useMemo(
    () => (vehicleId && levelId ? computeQuote({ vehicleId, levelId, problemIds: problems, pack }) : null),
    [vehicleId, levelId, problems, pack],
  );

  // Trocar de dia obriga a repetir a consulta: a duração e a ocupação mudam.
  useEffect(() => {
    if (!date || step !== 3) return;
    let cancelled = false;
    setLoadingSlots(true);
    setTime('');
    fetchAvailability(date, duration)
      .then((s) => { if (!cancelled) setSlots(s); })
      .catch(() => { if (!cancelled) setSlots([]); })
      .then(() => { if (!cancelled) setLoadingSlots(false); });
    return () => { cancelled = true; };
  }, [date, duration, step]);

  if (!open) return null;

  const toggleProblem = (id) =>
    setProblems((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const interiorCount = INTERIOR_PROBLEMS.filter((p) => problems.includes(p.id)).length;
  const exteriorCount = EXTERIOR_PROBLEMS.filter((p) => problems.includes(p.id)).length;

  const canAdvance = [
    Boolean(vehicleId),
    Boolean(levelId),
    true,                       // avaliação é opcional
    Boolean(date && time),
    form.name.trim() && form.phone.replace(/\D/g, '').length >= 9,
  ][step];

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await createBooking({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        vehicleType: vehicleId,
        vehicleInfo: form.car.trim() || null,
        levelId,
        levelLabel: LEVEL_BY_ID[levelId]?.label,
        isPack: Boolean(pack),
        date,
        time,
        duration,
        price: quote?.total ?? 0,
        grade: quote?.grade ?? 1,
        gradeLabel: quote?.gradeLabel,
        problems: problems.map((id) => PROBLEM_LABEL[id]),
        notes: form.notes.trim() || null,
      });
      setDone(res);
    } catch (e) {
      setError(e.message);
      // Volta ao passo da data: o mais provável é a hora ter sido ocupada
      // entretanto, e é lá que se escolhe outra.
      if (/dispon|ocupad/i.test(e.message)) setStep(3);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[95] bg-black/90 flex items-end sm:items-center justify-center sm:p-4">
      <div className="w-full sm:max-w-2xl bg-zinc-950 border border-white/12 sm:rounded-md max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <span className="font-display text-white text-sm font-bold tracking-[0.2em] uppercase">
            {done ? 'Marcação confirmada' : 'Marcar serviço'}
          </span>
          <button onClick={onClose} aria-label="Fechar" className="text-white/45 hover:text-white transition p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!done && <Stepper current={step} />}

        <div className="flex-1 overflow-y-auto p-5">
          {done ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-emerald-900/40 border border-emerald-700 flex items-center justify-center mx-auto">
                <Check className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="font-display text-white text-xl font-black mt-5">Está marcado.</h3>
              <p className="text-white/60 text-sm mt-3 leading-relaxed">
                {new Date(`${date}T${time}`).toLocaleDateString('pt-PT', {
                  weekday: 'long', day: 'numeric', month: 'long',
                })} às {time}.
              </p>
              {done.reference && (
                <p className="text-white/35 text-xs mt-4">
                  Referência <span className="text-blue-400 font-mono">#{done.reference}</span>
                </p>
              )}
              <p className="text-white/45 text-xs mt-5 leading-relaxed">
                Entramos em contacto para confirmar. O valor é uma estimativa e pode ser
                ajustado após avaliarmos a viatura.
              </p>
            </div>
          ) : (
            <>
              {/* 1 — Veículo */}
              {step === 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {VEHICLE_TYPES.map((v) => {
                    const Icon = v.icon;
                    return (
                      <Choice
                        key={v.id}
                        active={vehicleId === v.id}
                        onClick={() => { setVehicleId(v.id); setLevelId(null); setPack(null); }}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="w-6 h-6 text-blue-400 shrink-0" strokeWidth={1.4} />
                          <span>
                            <span className="block text-sm font-semibold">{v.label}</span>
                            <span className="block text-white/40 text-xs mt-0.5">{v.hint}</span>
                          </span>
                        </span>
                      </Choice>
                    );
                  })}
                </div>
              )}

              {/* 2 — Nível e packs */}
              {step === 1 && vehicleId && (
                <>
                  <div className="space-y-2">
                    {levelsFor(vehicleId).map((l) => (
                      <Choice
                        key={l.id}
                        active={levelId === l.id && !pack}
                        onClick={() => { setLevelId(l.id); setPack(null); }}
                        className="w-full"
                      >
                        <span className="flex items-start justify-between gap-3 pr-5">
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold">{l.label}</span>
                            <span className="block text-white/45 text-xs mt-1">{l.desc}</span>
                            <span className="block text-white/30 text-[11px] mt-1.5">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {formatDuration(durationFor(vehicleId, l.id))}
                            </span>
                          </span>
                          <span className="font-display text-blue-300 text-lg font-bold shrink-0">
                            {eur(l.price)}
                          </span>
                        </span>
                      </Choice>
                    ))}
                  </div>

                  {packsFor(vehicleId).length > 0 && (
                    <>
                      <div className="text-white/45 text-[10px] tracking-[0.3em] uppercase mt-6 mb-3">
                        Packs · 2 lavagens por mês
                      </div>
                      <div className="space-y-2">
                        {packsFor(vehicleId).map((p) => (
                          <Choice
                            key={p.id}
                            active={pack?.id === p.id}
                            onClick={() => { setPack(p); setLevelId(p.levelId); }}
                            className="w-full"
                          >
                            <span className="flex items-center justify-between gap-3 pr-5">
                              <span>
                                <span className="block text-sm font-semibold">{p.label}</span>
                                <span className="block text-emerald-400/80 text-xs mt-1">
                                  Poupa {eur(p.saving)} face a duas lavagens
                                </span>
                              </span>
                              <span className="text-right shrink-0">
                                <span className="block font-display text-blue-300 text-lg font-bold">{eur(p.price)}</span>
                                <span className="block text-white/25 text-[11px] line-through">{eur(p.avulso)}</span>
                              </span>
                            </span>
                          </Choice>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}

              {/* 3 — Estado da viatura */}
              {step === 2 && (
                <>
                  <p className="text-white/55 text-sm mb-4 leading-relaxed">
                    Assinale o que se aplica. Serve para prepararmos o trabalho e dar-lhe um valor
                    realista — é melhor sabê-lo agora do que na entrega.
                  </p>

                  <div className="max-w-xs mx-auto mb-5">
                    <CarVisual
                      interiorCount={interiorCount}
                      exteriorCount={exteriorCount}
                      ariaLabel="Representação do veículo"
                    />
                  </div>

                  {[['Interior', INTERIOR_PROBLEMS, interiorCount], ['Exterior', EXTERIOR_PROBLEMS, exteriorCount]]
                    .map(([title, list, count]) => (
                      <div key={title} className="mb-5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/45 text-[10px] tracking-[0.3em] uppercase">{title}</span>
                          {count > 0 && (
                            <span className="text-[10px] tracking-[0.2em] text-blue-300 bg-blue-900/30 border border-blue-700/40 px-2 py-0.5">
                              {count} assinalado{count > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {list.map((p) => {
                            const Icon = p.icon;
                            return (
                              <Choice key={p.id} active={problems.includes(p.id)} onClick={() => toggleProblem(p.id)}>
                                <span className="flex items-center gap-2.5 pr-4">
                                  <Icon className="w-4 h-4 text-blue-400/80 shrink-0" />
                                  <span className="text-sm leading-tight">{p.label}</span>
                                </span>
                              </Choice>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                  {pack && (
                    <p className="text-white/40 text-xs border border-white/10 rounded-sm p-3">
                      Escolheu um pack: o valor é fechado e não sofre acréscimo pelo estado da viatura.
                    </p>
                  )}
                </>
              )}

              {/* 4 — Data e hora */}
              {step === 3 && (
                <>
                  <Calendar value={date} onChange={setDate} />

                  {date && (
                    <div className="mt-6">
                      <div className="text-white/45 text-[10px] tracking-[0.3em] uppercase mb-3">
                        Horas disponíveis · {formatDuration(duration)}
                      </div>

                      {loadingSlots ? (
                        <div className="flex items-center gap-2 text-white/45 text-sm py-4">
                          <Loader2 className="w-4 h-4 animate-spin" /> A verificar disponibilidade…
                        </div>
                      ) : slots.length === 0 ? (
                        <p className="text-white/45 text-sm py-4">
                          Sem horas livres neste dia para este serviço. Experimente outro dia.
                        </p>
                      ) : (
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                          {slots.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setTime(s)}
                              className={`py-2.5 text-sm rounded-sm border transition ${
                                time === s
                                  ? 'bg-blue-700 border-blue-500 text-white font-bold'
                                  : 'border-white/12 text-white/75 hover:border-blue-500'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* 5 — Dados */}
              {step === 4 && (
                <div className="space-y-4">
                  {[
                    { k: 'name', label: 'Nome *', ph: 'O seu nome', type: 'text' },
                    { k: 'phone', label: 'Telefone *', ph: '+351 …', type: 'tel' },
                    { k: 'email', label: 'Email', ph: 'email@exemplo.pt', type: 'email' },
                    { k: 'car', label: 'Viatura', ph: 'Ex.: BMW Série 3 · 12-AB-34', type: 'text' },
                  ].map((f) => (
                    <div key={f.k}>
                      <label htmlFor={f.k} className="block text-[10px] tracking-[0.28em] text-white/50 mb-2 uppercase">
                        {f.label}
                      </label>
                      <input
                        id={f.k}
                        type={f.type}
                        value={form[f.k]}
                        onChange={(e) => setForm((s) => ({ ...s, [f.k]: e.target.value }))}
                        placeholder={f.ph}
                        className="w-full bg-black/60 border border-white/15 focus:border-blue-500 outline-none px-4 py-3 text-white text-sm rounded-sm placeholder:text-white/25"
                      />
                    </div>
                  ))}

                  <div>
                    <label htmlFor="notes" className="block text-[10px] tracking-[0.28em] text-white/50 mb-2 uppercase">
                      Notas
                    </label>
                    <textarea
                      id="notes"
                      rows={3}
                      value={form.notes}
                      onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))}
                      placeholder="Algo que devamos saber (opcional)"
                      className="w-full bg-black/60 border border-white/15 focus:border-blue-500 outline-none px-4 py-3 text-white text-sm rounded-sm resize-y placeholder:text-white/25"
                    />
                  </div>

                  <p className="text-white/35 text-xs leading-relaxed">
                    Ao marcar, autoriza o tratamento dos seus dados para a execução do serviço.
                    Não enviamos comunicações promocionais sem o seu consentimento.
                  </p>
                </div>
              )}

              {error && (
                <div role="alert" className="mt-5 border border-red-800/60 bg-red-950/40 text-red-200 text-sm px-4 py-3 rounded-sm">
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Resumo sempre visível assim que houver preço */}
        {!done && quote && (
          <div className="px-5 py-3 border-t border-white/10 bg-black/40 flex items-center justify-between gap-4">
            <div className="min-w-0 text-xs text-white/50 truncate">
              {VEHICLE_BY_ID[vehicleId]?.label} · {LEVEL_BY_ID[levelId]?.label}
              {pack && ' · pack'}
              {!pack && quote.pct > 0 && (
                <span className="text-amber-400"> · {quote.gradeLabel} +{quote.pct}%</span>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className="text-[9px] tracking-[0.2em] text-white/35 uppercase">Estimativa</div>
              <div className="font-display text-white text-lg font-bold leading-none">{eur(quote.total)}</div>
            </div>
          </div>
        )}

        {!done && (
          <div className="flex gap-3 px-5 py-4 border-t border-white/10">
            {step > 0 && (
              <button
                onClick={() => { setStep((s) => s - 1); setError(null); }}
                className="px-5 py-3 border border-white/20 text-white text-xs tracking-[0.2em] uppercase font-bold rounded-sm hover:border-blue-500 transition inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
            )}
            <button
              onClick={() => (step === STEPS.length - 1 ? submit() : setStep((s) => s + 1))}
              disabled={!canAdvance || saving}
              className="flex-1 px-5 py-3 bg-blue-700 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs tracking-[0.2em] uppercase font-bold rounded-sm transition inline-flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {step === STEPS.length - 1 ? 'Confirmar marcação' : 'Continuar'}
              {!saving && step < STEPS.length - 1 && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        )}

        {done && (
          <div className="px-5 py-4 border-t border-white/10">
            <button
              onClick={onClose}
              className="w-full px-5 py-3 border border-white/20 text-white text-xs tracking-[0.2em] uppercase font-bold rounded-sm hover:border-blue-500 transition inline-flex items-center justify-center gap-2"
            >
              <CalendarDays className="w-4 h-4" /> Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
