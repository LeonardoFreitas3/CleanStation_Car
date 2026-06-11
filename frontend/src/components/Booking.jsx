import React, { useEffect, useMemo, useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { SERVICES, TIME_SLOTS } from "../mock";
import Logo from "./Logo";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";

const PT_MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
const PT_DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function startOfMonth(y, m) {
  return new Date(y, m, 1);
}
function daysInMonth(y, m) {
  return new Date(y, m + 1, 0).getDate();
}
function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function fmtDate(d) {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}
function isoDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function Booking({ open, onClose, initialServiceId }) {
  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState(
    initialServiceId || SERVICES[0].id,
  );
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [viewMonth, setViewMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [info, setInfo] = useState({
    name: "",
    phone: "",
    email: "",
    car: "",
    notes: "",
  });
  const [confirmation, setConfirmation] = useState(null);

  // Estado API
  const [busySlots, setBusySlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const service = useMemo(
    () => SERVICES.find((s) => s.id === serviceId) || SERVICES[0],
    [serviceId],
  );

  useEffect(() => {
    if (open) {
      setStep(initialServiceId ? 2 : 1);
      if (initialServiceId) setServiceId(initialServiceId);
      setSelectedDate(null);
      setSelectedTime(null);
      setConfirmation(null);
      setSubmitError("");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, initialServiceId]);

  // Buscar slots ocupados quando muda a data ou o serviço selecionado
  useEffect(() => {
    if (!selectedDate) return;
    const iso = isoDate(selectedDate);
    setLoadingSlots(true);
    fetch(`${BACKEND_URL}/api/availability/${iso}?service_id=${serviceId}`)
      .then((r) => (r.ok ? r.json() : { busySlots: [] }))
      .then((data) => setBusySlots(data.busySlots || []))
      .catch(() => setBusySlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, serviceId]);

  if (!open) return null;

  // Calendário
  const y = viewMonth.getFullYear();
  const m = viewMonth.getMonth();
  const first = startOfMonth(y, m);
  const dim = daysInMonth(y, m);
  const firstWeekday = (first.getDay() + 6) % 7;
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(new Date(y, m, d));

  const isBlocked = (date) => date.getDay() === 0;
  const availableSlots = selectedDate ? TIME_SLOTS : [];

  const goPrev = () =>
    setViewMonth((v) => new Date(v.getFullYear(), v.getMonth() - 1, 1));
  const goNext = () =>
    setViewMonth((v) => new Date(v.getFullYear(), v.getMonth() + 1, 1));

  const canNext = () => {
    if (step === 1) return !!serviceId;
    if (step === 2) return !!selectedDate && !!selectedTime;
    if (step === 3) return info.name.trim() && info.phone.trim() && info.email.trim();
    return true;
  };

  const submit = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      // Preço, título e duração são determinados pelo servidor a partir do serviceId.
      const payload = {
        serviceId: service.id,
        date: isoDate(selectedDate),
        time: selectedTime,
        ...info,
      };
      const r = await fetch(`${BACKEND_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (r.status === 409) {
        setSubmitError(
          "Este horário já foi reservado. Por favor escolhe outro.",
        );
        setStep(2);
        return;
      }
      if (!r.ok) throw new Error("Erro do servidor");
      const booking = await r.json();
      setConfirmation(booking);
      setStep(4);
    } catch {
      setSubmitError("Não foi possível confirmar a marcação. Tenta novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-stretch md:items-center justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-0 md:py-8">
      <div className="relative w-full md:max-w-4xl bg-zinc-900 border border-white/10 text-white min-h-screen md:min-h-0 md:max-h-[92vh] flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-zinc-900 z-10">
          <Logo size={52} />
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] text-white/40 tracking-[0.25em]">
                PASSO {step} DE 4
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 border border-white/15 hover:border-blue-500 hover:bg-blue-900/30 hover:text-blue-400 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stepper */}
        <div className="px-6 pt-5">
          <div className="grid grid-cols-4 gap-2">
            {["Serviço", "Data & Hora", "Dados", "Confirmação"].map(
              (label, i) => (
                <div key={label} className="flex flex-col gap-2">
                  <div
                    className={`h-[3px] ${i + 1 <= step ? "bg-gradient-to-r from-blue-700 to-blue-400" : "bg-white/15"}`}
                  />
                  <div
                    className={`text-[10px] tracking-[0.25em] ${i + 1 === step ? "text-white" : "text-white/40"}`}
                  >
                    {label.toUpperCase()}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        {/* Erro global */}
        {submitError && (
          <div className="mx-6 mt-4 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {submitError}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* STEP 1 — Serviço */}
          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SERVICES.map((s) => {
                const Icon = s.icon;
                const active = s.id === serviceId;
                return (
                  <button
                    key={s.id}
                    onClick={() => setServiceId(s.id)}
                    className={`text-left border p-5 transition ${active ? "border-blue-600 bg-blue-900/20" : "border-white/15 bg-white/[0.03] hover:border-blue-700/60 hover:bg-blue-900/10"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-10 h-10 border border-white/15 flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      {active && (
                        <div className="w-6 h-6 bg-blue-600 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <div className="mt-4 font-display font-bold tracking-wide">
                      {s.title}
                    </div>
                    <div className="text-white/55 text-sm mt-1">{s.desc}</div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                      <span className="text-white/60 text-xs inline-flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> {s.durationLabel}
                      </span>
                      <span className="text-white font-display text-xl font-bold">
                        {s.price}€
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* STEP 2 — Data & Hora */}
          {step === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6">
              <div className="border border-white/10 p-5">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={goPrev}
                    className="w-9 h-9 border border-white/15 hover:border-blue-500 hover:bg-blue-900/30 hover:text-blue-400 flex items-center justify-center transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="font-display tracking-wider text-sm">
                    {PT_MONTHS[m]} {y}
                  </div>
                  <button
                    onClick={goNext}
                    className="w-9 h-9 border border-white/15 hover:border-blue-500 hover:bg-blue-900/30 hover:text-blue-400 flex items-center justify-center transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] tracking-[0.2em] text-white/40 mb-2">
                  {PT_DAYS.map((d) => (
                    <div key={d}>{d.toUpperCase()}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {cells.map((d, idx) => {
                    const cellKey = d
                      ? `${y}-${m}-${d.getDate()}`
                      : `empty-${y}-${m}-${idx}`;
                    if (!d)
                      return <div key={cellKey} className="aspect-square" />;
                    const past = d < today;
                    const blocked = isBlocked(d);
                    const disabled = past || blocked;
                    const selected = selectedDate && sameDay(d, selectedDate);
                    return (
                      <button
                        key={cellKey}
                        disabled={disabled}
                        onClick={() => {
                          setSelectedDate(d);
                          setSelectedTime(null);
                        }}
                        className={`aspect-square text-sm flex items-center justify-center border transition ${
                          selected
                            ? "bg-blue-700 text-white border-blue-600"
                            : disabled
                              ? "text-white/15 border-white/5 cursor-not-allowed line-through"
                              : "text-white border-white/10 hover:border-blue-600/60 hover:text-blue-300"
                        }`}
                      >
                        {d.getDate()}
                      </button>
                    );
                  })}
                </div>
                <p className="text-white/40 text-[11px] mt-4">
                  Domingos encerrado. Horários já ocupados não aparecem.
                </p>
              </div>

              <div className="border border-white/10 p-5">
                <div className="text-white/40 text-[10px] tracking-[0.3em] mb-1">
                  HORÁRIO DISPONÍVEL
                </div>
                <div className="font-display tracking-wider">
                  {selectedDate ? fmtDate(selectedDate) : "Seleciona uma data"}
                </div>
                <div className="mt-5 grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {loadingSlots && (
                    <div className="col-span-full flex items-center gap-2 text-white/50 text-sm py-4">
                      <Loader2 className="w-4 h-4 animate-spin" /> A verificar
                      disponibilidade...
                    </div>
                  )}
                  {!loadingSlots &&
                    selectedDate &&
                    availableSlots.every((t) => busySlots.includes(t)) && (
                      <div className="col-span-full text-white/50 text-sm py-4">
                        Sem horários disponíveis para este serviço neste dia.
                      </div>
                    )}
                  {!loadingSlots &&
                    selectedDate &&
                    availableSlots.map((t) => {
                      const busy = busySlots.includes(t);
                      return (
                        <button
                          key={t}
                          disabled={busy}
                          onClick={() => !busy && setSelectedTime(t)}
                          title={busy ? "Horário ocupado" : undefined}
                          className={`py-3 text-sm tracking-wider border transition ${
                            selectedTime === t
                              ? "bg-blue-700 text-white border-blue-600"
                              : busy
                                ? "border-white/5 text-white/20 line-through cursor-not-allowed"
                                : "border-white/15 text-white hover:border-blue-600/60 hover:text-blue-300"
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                </div>

                <div className="mt-6 p-4 border border-white/10 bg-white/[0.03]">
                  <div className="text-white/40 text-[10px] tracking-[0.3em] mb-2">
                    RESUMO
                  </div>
                  <div className="text-sm flex justify-between">
                    <span className="text-white/60">Serviço</span>
                    <span className="font-semibold">{service.title}</span>
                  </div>
                  <div className="text-sm flex justify-between mt-1">
                    <span className="text-white/60">Duração</span>
                    <span>{service.durationLabel}</span>
                  </div>
                  <div className="text-sm flex justify-between mt-1">
                    <span className="text-white/60">Preço desde</span>
                    <span className="font-bold">{service.price}€</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 — Dados */}
          {step === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ["name", "Nome completo *", "text", "O teu nome"],
                ["phone", "Telefone *", "tel", "+351 ..."],
                ["email", "Email *", "email", "email@exemplo.pt"],
                ["car", "Veículo", "text", "Ex.: BMW Série 3"],
              ].map(([key, label, type, ph]) => (
                <div key={key} className="flex flex-col">
                  <label className="text-white/50 text-[10px] tracking-[0.25em] mb-2">
                    {label.toUpperCase()}
                  </label>
                  <input
                    type={type}
                    value={info[key]}
                    onChange={(e) =>
                      setInfo((v) => ({ ...v, [key]: e.target.value }))
                    }
                    placeholder={ph}
                    className="bg-white/[0.06] border border-white/20 px-4 py-3 text-white placeholder:text-white/35 focus:outline-none focus:border-white/70 focus:bg-white/[0.09]"
                  />
                </div>
              ))}
              <div className="md:col-span-2 flex flex-col">
                <label className="text-white/50 text-[10px] tracking-[0.25em] mb-2">
                  NOTAS
                </label>
                <textarea
                  value={info.notes}
                  onChange={(e) =>
                    setInfo((v) => ({ ...v, notes: e.target.value }))
                  }
                  rows={3}
                  placeholder="Detalhes adicionais (opcional)"
                  className="bg-white/[0.06] border border-white/20 px-4 py-3 text-white placeholder:text-white/35 focus:outline-none focus:border-white/70 focus:bg-white/[0.09] resize-none"
                />
              </div>
              <div className="md:col-span-2 p-4 border border-white/10 bg-white/[0.03] grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <div className="text-white/40 text-[10px] tracking-[0.25em]">
                    SERVIÇO
                  </div>
                  <div className="mt-1 font-semibold">{service.title}</div>
                </div>
                <div>
                  <div className="text-white/40 text-[10px] tracking-[0.25em]">
                    DATA
                  </div>
                  <div className="mt-1">
                    {selectedDate ? fmtDate(selectedDate) : "-"}
                  </div>
                </div>
                <div>
                  <div className="text-white/40 text-[10px] tracking-[0.25em]">
                    HORA
                  </div>
                  <div className="mt-1">{selectedTime || "-"}</div>
                </div>
                <div>
                  <div className="text-white/40 text-[10px] tracking-[0.25em]">
                    PREÇO
                  </div>
                  <div className="mt-1 font-bold">{service.price}€</div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 — Confirmação */}
          {step === 4 && confirmation && (
            <div className="text-center max-w-lg mx-auto py-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-800 text-white flex items-center justify-center mx-auto shadow-[0_0_32px_rgba(59,130,246,0.45)]">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="font-display text-3xl font-black tracking-wide mt-6">
                MARCAÇÃO CONFIRMADA!
              </h3>
              <p className="text-white/60 mt-3">
                A tua marcação foi registada e adicionada ao nosso calendário.
              </p>
              <div className="mt-8 border border-white/10 p-5 text-left">
                <div className="flex items-center justify-between">
                  <div className="text-white/40 text-[10px] tracking-[0.3em]">
                    REFERÊNCIA
                  </div>
                  <div className="font-mono text-sm">{confirmation.id}</div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-white/40 text-[10px] tracking-[0.25em]">
                      SERVIÇO
                    </div>
                    <div className="mt-1">{confirmation.serviceTitle}</div>
                  </div>
                  <div>
                    <div className="text-white/40 text-[10px] tracking-[0.25em]">
                      VEÍCULO
                    </div>
                    <div className="mt-1">{confirmation.car || "-"}</div>
                  </div>
                  <div>
                    <div className="text-white/40 text-[10px] tracking-[0.25em]">
                      DATA
                    </div>
                    <div className="mt-1">{confirmation.dateLabel}</div>
                  </div>
                  <div>
                    <div className="text-white/40 text-[10px] tracking-[0.25em]">
                      HORA
                    </div>
                    <div className="mt-1">{confirmation.time}</div>
                  </div>
                  <div>
                    <div className="text-white/40 text-[10px] tracking-[0.25em]">
                      DURAÇÃO
                    </div>
                    <div className="mt-1">{confirmation.durationLabel}</div>
                  </div>
                  <div>
                    <div className="text-white/40 text-[10px] tracking-[0.25em]">
                      PREÇO
                    </div>
                    <div className="mt-1 font-bold">{confirmation.price}€</div>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="mt-8 w-full bg-gradient-to-r from-blue-800 via-blue-600 to-blue-800 hover:from-blue-700 hover:via-blue-500 hover:to-blue-700 text-white py-4 text-xs tracking-[0.25em] font-bold transition-all"
              >
                FECHAR
              </button>
            </div>
          )}
        </div>

        {/* Footer navegação */}
        {step < 4 && (
          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between gap-3 sticky bottom-0 bg-zinc-900">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="inline-flex items-center gap-2 px-5 py-3 text-xs tracking-[0.22em] font-semibold border border-white/15 text-white disabled:opacity-30 hover:border-blue-500 hover:bg-blue-900/20 hover:text-blue-400 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> VOLTAR
            </button>
            {step < 3 && (
              <button
                onClick={() => canNext() && setStep((s) => s + 1)}
                disabled={!canNext()}
                className="inline-flex items-center gap-2 px-6 py-3 text-xs tracking-[0.22em] font-bold bg-gradient-to-r from-blue-800 via-blue-600 to-blue-800 hover:from-blue-700 hover:via-blue-500 hover:to-blue-700 text-white disabled:opacity-30 transition-all"
              >
                CONTINUAR <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {step === 3 && (
              <button
                onClick={() => canNext() && submit()}
                disabled={!canNext() || submitting}
                className="inline-flex items-center gap-2 px-6 py-3 text-xs tracking-[0.22em] font-bold bg-gradient-to-r from-blue-800 via-blue-600 to-blue-800 hover:from-blue-700 hover:via-blue-500 hover:to-blue-700 text-white disabled:opacity-30 transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> A
                    CONFIRMAR...
                  </>
                ) : (
                  <>
                    CONFIRMAR MARCAÇÃO <Check className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
