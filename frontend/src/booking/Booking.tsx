import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  X, ChevronLeft, ChevronRight, Check, Clock, ArrowRight, ArrowLeft, Loader2, CalendarDays, Pencil,
} from 'lucide-react';
import {
  VEHICLE_TYPES, VEHICLE_BY_ID, LEVEL_BY_ID,
  levelsFor, priceFor, computeQuote, durationFor, formatDuration, eur,
} from './pricing';
import { fetchAvailability, createBooking } from './api';
import useModalDialog from '../useModalDialog';
import { MARCACAO_KEY } from '../components/MarcacaoConfirmada';

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

/** O que a Edge Function devolve. So a referencia e o evento sao lidos deste lado. */
interface BookingResult {
  reference?: number | null;
  eventId?: string | null;
  emailSent?: boolean;
}

/** Os campos do ultimo passo. A chave e do FormState: um campo a mais aqui sem
 *  o campo correspondente no estado deixa de compilar. */
const CAMPOS: Array<{ k: keyof FormState; label: string; ph: string; type: string; auto: string }> = [
  { k: 'name', label: 'Nome *', ph: 'O teu nome', type: 'text', auto: 'name' },
  { k: 'phone', label: 'Telefone *', ph: '+351 …', type: 'tel', auto: 'tel' },
  { k: 'email', label: 'Email (opcional)', ph: 'email@exemplo.pt', type: 'email', auto: 'email' },
  // Separada da marca e modelo: e a matricula que identifica o
  // carro, e num campo unico de texto livre ficava a adivinhar.
  { k: 'plate', label: 'Matrícula *', ph: '12-AB-34', type: 'text', auto: 'off' },
  { k: 'car', label: 'Marca e modelo', ph: 'Ex.: BMW Série 3', type: 'text', auto: 'off' },
];

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

/** ISO local (YYYY-MM-DD). toISOString() daria o dia errado a partir das 23h. */
function isoDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const porExtenso = (date: string, time: string) =>
  new Date(`${date}T${time}`).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' });

function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-1 px-5 py-3 border-b border-white/10 overflow-x-auto" aria-label="Passos da marcação">
      {STEPS.map((label, i) => (
        <React.Fragment key={label}>
          <li className="flex items-center gap-2 shrink-0" aria-current={i === current ? 'step' : undefined}>
            <span className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center border ${
              i < current ? 'bg-blue-700 border-blue-600 text-white'
                : i === current ? 'border-blue-400 text-blue-300 bg-blue-950'
                  : 'border-white/15 text-white/30'
            }`}
            >
              {i < current ? <Check className="w-3 h-3" aria-hidden="true" /> : i + 1}
            </span>
            <span className={`text-[10px] tracking-[0.15em] uppercase ${
              i === current ? 'text-blue-300 font-bold' : 'text-white/50'
            }`}
            >
              {label}
            </span>
          </li>
          {i < STEPS.length - 1 && <span className="w-4 h-px bg-white/15 shrink-0" aria-hidden="true" />}
        </React.Fragment>
      ))}
    </ol>
  );
}

interface ChoiceProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

/** Uma opção de escolha única: um rádio, para o leitor de ecrã dizer "1 de 4". */
function Choice({ active, onClick, children, className = '' }: ChoiceProps) {
  return (
    <button
      type="button"
      role="radio"
      onClick={onClick}
      aria-checked={active}
      className={`relative text-left border px-4 py-3.5 transition rounded-sm ${
        active
          ? 'border-blue-600 bg-blue-900/25 text-white'
          : 'border-white/12 bg-white/[0.03] text-white/80 hover:border-blue-700/60 hover:bg-blue-900/10'
      } ${className}`}
    >
      {children}
      {active && (
        <span className="absolute top-2 right-2 w-4 h-4 bg-blue-600 text-white flex items-center justify-center rounded-sm">
          <Check className="w-3 h-3" aria-hidden="true" />
        </span>
      )}
    </button>
  );
}

function Calendar({ value, onChange }: { value: string; onChange: (iso: string) => void }) {
  const [month, setMonth] = useState(() => {
    const d = value ? new Date(`${value}T12:00`) : new Date();
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
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        </button>
        <span className="text-white text-sm font-semibold" aria-live="polite">
          {MONTHS[month.getMonth()]} {month.getFullYear()}
        </span>
        <button
          type="button"
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          aria-label="Mês seguinte"
          className="w-8 h-8 border border-white/15 text-white flex items-center justify-center rounded-sm hover:border-blue-500 transition"
        >
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1" aria-hidden="true">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center text-[9px] tracking-[0.1em] text-white/30 uppercase py-1">{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1" role="radiogroup" aria-label="Dia">
        {days.map((d, i) => {
          if (!d) return <span key={`x${i}`} />;
          const iso = isoDate(d);
          // Fim de semana fechado; dias passados não são opção.
          // Nao se marca para o proprio dia: o trabalho tem de ser
          // preparado com antecedencia. O servidor recusa na mesma, isto
          // so evita que o cliente escolha e leve com um erro depois.
          // Os feriados tambem: o servidor devolve zero horas nesses dias.
          const closed = d.getDay() === 0 || d.getDay() === 6 || d <= today;
          const selected = value === iso;
          return (
            <button
              key={iso}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={d.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}
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
        Sábados, domingos e feriados encerrado. Marcações a partir de amanhã. Horários ocupados não aparecem.
      </p>
    </div>
  );
}

interface BookingProps {
  open: boolean;
  onClose: () => void;
  /** O serviço da página de onde se veio: fica escolhido e o passo salta-se. */
  nivel?: string | null;
  /** Abre a Política de Privacidade, por cima do formulário. */
  onPrivacy?: () => void;
}

// `nivel`: o serviço da página de onde se veio. Fica escolhido ao escolher o
// veículo (se esse veículo o tiver) e o passo do nível salta-se — quem carregou
// em "Marcar" na página da Lavagem Premium já disse o que quer.
export default function Booking({ open, onClose, nivel = null, onPrivacy }: BookingProps) {
  const [step, setStep] = useState(0);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [levelId, setLevelId] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  // Não conseguir ler a agenda não é o mesmo que a agenda estar cheia: um diz
  // "tenta outro dia", o outro "tenta outra vez".
  const [slotsError, setSlotsError] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  const [form, setForm] = useState<FormState>({ name: '', phone: '', email: '', plate: '', car: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<BookingResult | null>(null);
  // Dois cliques seguidos em "Confirmar" eram dois pedidos: o estado `saving`
  // só desactiva o botão no render seguinte, e o segundo clique entrava antes.
  const aEnviar = useRef(false);

  const reset = useCallback(() => {
    setStep(0); setVehicleId(null); setLevelId(null);
    setDate(''); setTime(''); setSlots([]); setSlotsError(false); setError(null); setDone(null);
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

  // Trocar de dia, de veículo ou de serviço obriga a repetir a consulta: a
  // duração e a ocupação mudam. A hora escolhida fica, se ainda estiver livre
  // — quem volta atrás para corrigir a matrícula não perde a hora.
  useEffect(() => {
    if (!date) return undefined;
    let cancelled = false;
    setLoadingSlots(true);
    setSlotsError(false);
    fetchAvailability(date, duration)
      .then((s) => {
        if (cancelled) return;
        setSlots(s);
        setTime((t) => (s.includes(t) ? t : ''));
      })
      .catch(() => { if (!cancelled) { setSlots([]); setTime(''); setSlotsError(true); } })
      .then(() => { if (!cancelled) setLoadingSlots(false); });
    return () => { cancelled = true; };
  }, [date, duration, tentativa]);

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

  // Escolher o veículo mantém o serviço, se esse veículo o tiver: quem volta
  // atrás para trocar "carro" por "SUV" não quer escolher a lavagem outra vez.
  const escolherVeiculo = (id: string) => {
    setVehicleId(id);
    const mantem = levelId ?? nivel;
    setLevelId(mantem && priceFor(id, mantem) !== undefined ? mantem : null);
  };

  const submit = async () => {
    if (aEnviar.current) return;
    aEnviar.current = true;
    setSaving(true);
    setError(null);
    try {
      const res: BookingResult = await createBooking({
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
      // Só aqui, com a marcação já gravada pela API, se vai para a página de
      // confirmação — que é a conversão do Google Ads. Navegação completa e não
      // do router: a etiqueta do Google conta carregamentos de página. Vai o
      // resumo e o id da reserva, e nada que identifique a pessoa.
      try {
        sessionStorage.setItem(MARCACAO_KEY, JSON.stringify({
          date,
          time,
          reference: res?.reference ?? null,
          eventId: res?.eventId ?? null,
          vehicle: vehicle?.label,
          service: level?.label,
          duration,
          price: quote?.total ?? 0,
          email: Boolean(form.email.trim()) && res?.emailSent !== false,
        }));
        window.location.assign(`${process.env.PUBLIC_URL}/marcacao-confirmada/`);
      } catch {
        // Sem sessionStorage a página mandava para a inicial; fica o ecrã de
        // confirmação do próprio formulário.
      }
    } catch (e) {
      // `e` é unknown, e não uma Error: um throw de outra coisa qualquer não
      // tem .message, e o que aparecia ao cliente era um ecrã em branco.
      const msg = e instanceof Error ? e.message : 'Não foi possível marcar. Tenta novamente.';
      setError(msg);
      // Volta ao passo da data e volta a perguntar as horas: o mais provável
      // é a hora ter sido ocupada entretanto, e é lá que se escolhe outra.
      if (/dispon|ocupad/i.test(msg)) { setStep(2); setTentativa((n) => n + 1); }
    } finally {
      setSaving(false);
      aEnviar.current = false;
    }
  };

  const editar = (passo: number) => { setStep(passo); setError(null); };

  // O resumo do último passo: tudo o que se escolheu, com um botão para
  // corrigir cada coisa sem perder o resto.
  const resumo = quote && (
    <dl className="border border-white/10 bg-black/40 rounded-sm divide-y divide-white/10 text-sm">
      {[
        { k: 'Veículo', v: vehicle?.label, passo: 0 },
        { k: 'Serviço', v: level?.label, passo: 1 },
        { k: 'Entrega', v: date && time ? `${porExtenso(date, time)}, ${time}` : '', passo: 2 },
        { k: 'Duração estimada', v: formatDuration(duration), passo: 1 },
        { k: 'Preço estimado', v: `${eur(quote.total)} · IVA incluído`, passo: 0 },
      ].map(({ k, v, passo }) => (
        <div key={k} className="flex items-center gap-3 px-4 py-2.5">
          <dt className="text-white/60 w-32 shrink-0">{k}</dt>
          <dd className="text-white flex-1 min-w-0 truncate">{v}</dd>
          <button
            type="button"
            onClick={() => editar(passo)}
            aria-label={`Editar ${k.toLowerCase()}`}
            className="text-white/55 hover:text-blue-400 p-1 transition"
          >
            <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      ))}
    </dl>
  );

  return (
    <dialog
      ref={dialogRef}
      aria-label="Marcar serviço"
      // Ao contrário das páginas legais, aqui não se fecha ao carregar no
      // fundo: um toque ao lado a meio do formulário deitava fora tudo o que a
      // pessoa já tinha escolhido.
      // 100dvh e não vh: no telemóvel, com o teclado aberto, o vh não encolhe e
      // o botão de confirmar ficava debaixo do teclado.
      className="m-0 sm:m-auto w-full sm:w-[calc(100%-2rem)] sm:max-w-2xl max-w-none max-h-[100dvh] sm:max-h-[95dvh] mt-auto p-0 bg-transparent backdrop:bg-black/90"
    >
      <div className="w-full bg-zinc-950 border border-white/12 sm:rounded-md max-h-[100dvh] sm:max-h-[95dvh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <span className="font-display text-white text-sm font-bold tracking-[0.2em] uppercase">
            {done ? 'Pedido recebido' : 'Marcar serviço'}
          </span>
          <button onClick={dismiss} aria-label="Fechar" className="text-white/60 hover:text-white transition p-1">
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {!done && <Stepper current={step} />}

        <div className="flex-1 overflow-y-auto p-5">
          {done ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-emerald-900/40 border border-emerald-700 flex items-center justify-center mx-auto">
                <Check className="w-7 h-7 text-emerald-400" aria-hidden="true" />
              </div>
              <h3 className="font-display text-white text-xl font-black mt-5">Pedido recebido.</h3>
              <p className="text-white/60 text-sm mt-3 leading-relaxed">
                {porExtenso(date, time)} às {time}. A hora ficou reservada; entramos em contacto para confirmar.
              </p>
              {done.reference && (
                <p className="text-white/50 text-xs mt-4">
                  Referência <span className="text-blue-400 font-mono">#{done.reference}</span>
                </p>
              )}
              <p className="text-white/60 text-xs mt-5 leading-relaxed">
                {form.email.trim() ? 'Enviámos também a confirmação para o teu email. ' : ''}
                O valor é uma estimativa e pode ter suplemento se a sujidade for fora do normal, sempre
                aprovado contigo antes do serviço.
              </p>
            </div>
          ) : (
            <>
              {/* 1 — Veículo */}
              {step === 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Tipo de veículo">
                  {VEHICLE_TYPES.map((v) => {
                    const Icon = v.icon;
                    return (
                      <Choice
                        key={v.id}
                        active={vehicleId === v.id}
                        onClick={() => escolherVeiculo(v.id)}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="w-6 h-6 text-blue-400 shrink-0" strokeWidth={1.4} aria-hidden="true" />
                          <span>
                            <span className="block text-sm font-semibold">{v.label}</span>
                            <span className="block text-white/55 text-xs mt-0.5">{v.hint}</span>
                          </span>
                        </span>
                      </Choice>
                    );
                  })}
                </div>
              )}

              {/* 2 — Nível */}
              {step === 1 && vehicleId && (
                <div className="space-y-2" role="radiogroup" aria-label="Serviço">
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
                          <span className="block text-white/60 text-xs mt-1">{l.desc}</span>
                          <span className="block text-white/30 text-[11px] mt-1.5">
                            <Clock className="w-3 h-3 inline mr-1" aria-hidden="true" />
                            {formatDuration(durationFor(vehicleId, l.id))}
                          </span>
                        </span>
                        <span className="font-display text-blue-300 text-lg font-bold shrink-0">
                          {eur(l.price)}
                        </span>
                      </span>
                    </Choice>
                  ))}
                  <p className="text-white/30 text-[11px] pt-1">Preços para {vehicle?.label}, com IVA incluído.</p>
                </div>
              )}

              {/* 3 — Data e hora */}
              {step === 2 && (
                <>
                  <Calendar value={date} onChange={setDate} />

                  {date && (
                    <div className="mt-6">
                      <div className="text-white/60 text-[10px] tracking-[0.3em] uppercase mb-3">
                        Horas disponíveis · {formatDuration(duration)}
                      </div>

                      {loadingSlots ? (
                        <div className="flex items-center gap-2 text-white/60 text-sm py-4" role="status">
                          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> A verificar disponibilidade…
                        </div>
                      ) : slotsError ? (
                        <div role="alert" className="text-sm py-4">
                          <p className="text-red-200">Não conseguimos consultar a agenda neste momento.</p>
                          <button
                            type="button"
                            onClick={() => setTentativa((n) => n + 1)}
                            className="mt-3 px-4 py-2 border border-white/20 text-white text-xs tracking-[0.2em] uppercase rounded-sm hover:border-blue-500 transition"
                          >
                            Tentar outra vez
                          </button>
                        </div>
                      ) : slots.length === 0 ? (
                        <p className="text-white/60 text-sm py-4">
                          Sem horas livres neste dia para este serviço. Experimenta outro dia.
                        </p>
                      ) : (
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2" role="radiogroup" aria-label="Hora de entrega">
                          {slots.map((s) => (
                            <button
                              key={s}
                              type="button"
                              role="radio"
                              aria-checked={time === s}
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
                  {resumo}

                  {CAMPOS.map((f) => (
                    <div key={f.k}>
                      <label htmlFor={f.k} className="block text-[10px] tracking-[0.28em] text-white/50 mb-2 uppercase">
                        {f.label}
                      </label>
                      <input
                        id={f.k}
                        type={f.type}
                        autoComplete={f.auto}
                        required={f.label.endsWith('*')}
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

                  <p className="text-white/50 text-xs leading-relaxed">
                    A confirmação aparece aqui no ecrã assim que a marcação ficar gravada e, se deixares o
                    email, recebe-la também por email. Ao marcar, autorizas o tratamento dos teus dados para
                    a execução do serviço, nos termos da{' '}
                    <button type="button" onClick={onPrivacy} className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
                      Política de Privacidade
                    </button>
                    . Não enviamos comunicações promocionais sem o teu consentimento.
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
        {!done && quote && step < 3 && (
          <div className="px-5 py-3 border-t border-white/10 bg-black/40 flex items-center justify-between gap-4">
            <div className="min-w-0 text-xs text-white/50 truncate">
              {vehicle?.label} · {level?.label} · {formatDuration(duration)}
            </div>
            <div className="text-right shrink-0">
              <div className="text-[9px] tracking-[0.2em] text-white/50 uppercase">Estimativa · IVA incl.</div>
              <div className="font-display text-white text-lg font-bold leading-none">{eur(quote.total)}</div>
            </div>
          </div>
        )}

        {!done && (
          <div className="flex gap-3 px-5 py-4 border-t border-white/10">
            {step > 0 && (
              <button
                type="button"
                onClick={() => editar(step - 1)}
                className="px-5 py-3 border border-white/20 text-white text-xs tracking-[0.2em] uppercase font-bold rounded-sm hover:border-blue-500 transition inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Voltar
              </button>
            )}
            <button
              type="button"
              onClick={() => (step === STEPS.length - 1 ? submit() : setStep((s) => (s === 0 && nivel && levelId === nivel ? 2 : s + 1)))}
              disabled={!canAdvance || saving}
              className="flex-1 px-5 py-3 bg-blue-700 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs tracking-[0.2em] uppercase font-bold rounded-sm transition inline-flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : null}
              {step === STEPS.length - 1 ? (saving ? 'A gravar…' : 'Confirmar marcação') : 'Continuar'}
              {!saving && step < STEPS.length - 1 && <ArrowRight className="w-4 h-4" aria-hidden="true" />}
            </button>
          </div>
        )}

        {done && (
          <div className="px-5 py-4 border-t border-white/10">
            <button
              type="button"
              onClick={dismiss}
              className="w-full px-5 py-3 border border-white/20 text-white text-xs tracking-[0.2em] uppercase font-bold rounded-sm hover:border-blue-500 transition inline-flex items-center justify-center gap-2"
            >
              <CalendarDays className="w-4 h-4" aria-hidden="true" /> Fechar
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}
