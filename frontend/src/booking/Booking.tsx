import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  X, ChevronLeft, ChevronRight, Check, Clock, ArrowRight, ArrowLeft, Loader2, CalendarDays,
} from 'lucide-react';
import {
  VEHICLE_TYPES, VEHICLE_BY_ID, LEVEL_BY_ID,
  levelsFor, computeQuote, durationFor, formatDuration, eur,
} from './pricing';
import { fetchAvailability, createBooking } from './api';
import useModalDialog from '../useModalDialog';

// Duas coisas saíram daqui em agosto de 2026, por decisão do negócio, e as
// duas saíram inteiras — ecrã, cálculo do site e cálculo da Edge Function:
//
//   O passo "Estado", quinze caixas de problemas que o cliente assinalava e que
//   subiam o preço 30% ou 75% conforme quantas fossem. O preço do site é o da
//   tabela, e o que a viatura precisar a mais orça-se ao vê-la.
//
//   Os packs de duas lavagens por mês, com preço fechado, que apareciam por
//   baixo dos níveis no passo do serviço.
const STEPS = ['Veículo', 'Serviço', 'Data', 'Dados'];

/**
 * O tipo sai do proprio pricing.js, com ReturnType, em vez de ser escrito outra
 * vez aqui: copia-lo era garantir que um dia discordava do calculo — e o
 * calculo e que manda, que e ele que tem os testes.
 */
type Quote = ReturnType<typeof computeQuote>;

interface FormState {
  name: string;
  phone: string;
  email: string;
  plate: string;
  car: string;
  notes: string;
}

/** O que a Edge Function devolve. So a referencia e lida deste lado. */
interface BookingResult {
  reference?: number | null;
}

/** Os campos do ultimo passo. A chave e do FormState: um campo a mais aqui sem
 *  o campo correspondente no estado deixa de compilar. */
const CAMPOS: Array<{ k: keyof FormState; label: string; ph: string; type: string }> = [
  { k: 'name', label: 'Nome *', ph: 'O seu nome', type: 'text' },
  { k: 'phone', label: 'Telefone *', ph: '+351 …', type: 'tel' },
  { k: 'email', label: 'Email', ph: 'email@exemplo.pt', type: 'email' },
  // Separada da marca e modelo: e a matricula que identifica o
  // carro, e num campo unico de texto livre ficava a adivinhar.
  { k: 'plate', label: 'Matrícula *', ph: '12-AB-34', type: 'text' },
  { k: 'car', label: 'Marca e modelo', ph: 'Ex.: BMW Série 3', type: 'text' },
];

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

/** ISO local (YYYY-MM-DD). toISOString() daria o dia errado a partir das 23h. */
function isoDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function Stepper({ current }: { current: number }) {
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

interface ChoiceProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

function Choice({ active, onClick, children, className = '' }: ChoiceProps) {
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

function Calendar({ value, onChange }: { value: string; onChange: (iso: string) => void }) {
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
    const cells: Array<Date | null> = Array(lead).fill(null);
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

export default function Booking({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [levelId, setLevelId] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [form, setForm] = useState<FormState>({ name: '', phone: '', email: '', plate: '', car: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<BookingResult | null>(null);

  const reset = useCallback(() => {
    setStep(0); setVehicleId(null); setLevelId(null);
    setDate(''); setTime(''); setSlots([]); setError(null); setDone(null);
    setForm({ name: '', phone: '', email: '', plate: '', car: '', notes: '' });
  }, []);

  useEffect(() => { if (open) reset(); }, [open, reset]);

  // O Escape não fecha a meio da marcação. Nas páginas legais fechar é de
  // graça; aqui deitava fora as escolhas todas por causa de uma tecla, e a
  // pessoa tinha de recomeçar do princípio. No primeiro passo, ou depois de
  // marcada, não há nada a perder e fecha na mesma.
  const { ref: dialogRef, dismiss } = useModalDialog(
    open,
    onClose,
    () => step > 0 && !done,
  );

  const duration = vehicleId && levelId ? durationFor(vehicleId, levelId) : 60;
  const quote: Quote | null = useMemo(
    () => (vehicleId && levelId ? computeQuote({ vehicleId, levelId }) : null),
    [vehicleId, levelId],
  );

  // Trocar de dia obriga a repetir a consulta: a duração e a ocupação mudam.
  useEffect(() => {
    if (!date || step !== 2) return;
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

  // Resolvidos uma vez, e nao a cada sitio que precisa do rotulo: os ids
  // podem ser nulos e o TypeScript nao deixa indexar com null — o que estava
  // escrito antes era `LEVEL_BY_ID[levelId]?.label` em dois sitios, a apanhar
  // com o `?.` um caso que nao era esse.
  const vehicle = vehicleId ? VEHICLE_BY_ID[vehicleId] : null;
  const level = levelId ? LEVEL_BY_ID[levelId] : null;

  // Validada por comprimento e nao pelo formato portugues: um carro espanhol em
  // Braga e um cliente como outro qualquer. O servidor valida da mesma maneira —
  // isto e so para nao deixar carregar em Confirmar e levar com o erro depois.
  const plateOk = form.plate.replace(/[^A-Za-z0-9]/g, '').length >= 4;

  const canAdvance = [
    Boolean(vehicleId),
    Boolean(levelId),
    Boolean(date && time),
    Boolean(form.name.trim() && form.phone.replace(/\D/g, '').length >= 9 && plateOk),
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
        plate: form.plate.trim(),
        vehicleInfo: form.car.trim() || null,
        levelId,
        levelLabel: level?.label,
        date,
        time,
        duration,
        price: quote?.total ?? 0,
        notes: form.notes.trim() || null,
      });
      setDone(res);
    } catch (e) {
      // `e` é unknown, e não uma Error: um throw de outra coisa qualquer não
      // tem .message, e o que aparecia ao cliente era um ecrã em branco.
      const msg = e instanceof Error ? e.message : 'Não foi possível marcar. Tente novamente.';
      setError(msg);
      // Volta ao passo da data: o mais provável é a hora ter sido ocupada
      // entretanto, e é lá que se escolhe outra.
      if (/dispon|ocupad/i.test(msg)) setStep(3);
    } finally {
      setSaving(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label="Marcar serviço"
      // Ao contrário das páginas legais, aqui não se fecha ao carregar no
      // fundo: um toque ao lado a meio do formulário deitava fora tudo o que a
      // pessoa já tinha escolhido.
      className="m-0 sm:m-auto w-full sm:w-[calc(100%-2rem)] sm:max-w-2xl max-w-none max-h-[95vh] mt-auto p-0 bg-transparent backdrop:bg-black/90"
    >
      <div className="w-full bg-zinc-950 border border-white/12 sm:rounded-md max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <span className="font-display text-white text-sm font-bold tracking-[0.2em] uppercase">
            {done ? 'Marcação confirmada' : 'Marcar serviço'}
          </span>
          <button onClick={dismiss} aria-label="Fechar" className="text-white/45 hover:text-white transition p-1">
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
                        onClick={() => { setVehicleId(v.id); setLevelId(null); }}
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

              {/* 2 — Nível */}
              {step === 1 && vehicleId && (
                <div className="space-y-2">
                  {levelsFor(vehicleId).map((l) => (
                    <Choice
                      key={l.id}
                      active={levelId === l.id}
                      onClick={() => setLevelId(l.id)}
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
              )}

              {/* 3 — Data e hora */}
              {step === 2 && (
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

              {/* 4 — Dados */}
              {step === 3 && (
                <div className="space-y-4">
                  {CAMPOS.map((f) => (
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
              {vehicle?.label} · {level?.label}
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
              onClick={dismiss}
              className="w-full px-5 py-3 border border-white/20 text-white text-xs tracking-[0.2em] uppercase font-bold rounded-sm hover:border-blue-500 transition inline-flex items-center justify-center gap-2"
            >
              <CalendarDays className="w-4 h-4" /> Fechar
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}
