import React from "react";
import { Check, Gauge, Plus } from "lucide-react";
import { INTERIOR_PROBLEMS, EXTERIOR_PROBLEMS, EXTRAS } from "../mock";
import { eur } from "../i18n";

// Silhueta de veículo (vista lateral). A carroçaria (exterior) e o
// habitáculo (interior) iluminam-se consoante os problemas assinalados.
function CarVisual({ interiorCount, exteriorCount, ariaLabel }) {
  const extActive = exteriorCount > 0;
  const intActive = interiorCount > 0;
  return (
    <svg
      viewBox="0 0 400 170"
      className="w-full h-auto"
      role="img"
      aria-label={ariaLabel}
    >
      <defs>
        <linearGradient id="csc-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#0b1f4a" />
        </linearGradient>
        <linearGradient id="csc-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfdbfe" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>

      {/* sombra */}
      <ellipse cx="200" cy="150" rx="160" ry="9" fill="#000" opacity="0.5" />

      {/* habitáculo / interior */}
      <path
        d="M126 88 L146 60 C153 53 166 50 182 50 L246 50 C272 50 286 58 296 80 L302 88 Z"
        fill="url(#csc-glass)"
        opacity={intActive ? 0.95 : 0.28}
        stroke={intActive ? "#93c5fd" : "transparent"}
        strokeWidth="2"
        style={{ transition: "all .3s ease" }}
      />
      {/* pilar central */}
      <line x1="214" y1="52" x2="214" y2="88" stroke="#0b1f4a" strokeWidth="3" opacity="0.6" />

      {/* carroçaria / exterior */}
      <path
        d="M40 120 C40 100 58 94 96 90 L120 66 C130 55 150 48 182 48 L250 48
           C282 48 298 58 310 80 L332 92 C356 96 362 106 360 120
           C360 126 356 130 350 130 L50 130 C44 130 40 126 40 120 Z"
        fill="url(#csc-body)"
        stroke={extActive ? "#60a5fa" : "#1e3a8a"}
        strokeWidth={extActive ? 3 : 1.5}
        opacity={extActive ? 1 : 0.85}
        style={{
          transition: "all .3s ease",
          filter: extActive
            ? "drop-shadow(0 0 10px rgba(59,130,246,.65))"
            : "none",
        }}
      />

      {/* rodas */}
      {[120, 286].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="130" r="24" fill="#0a0a0a" stroke="#27272a" strokeWidth="2" />
          <circle cx={cx} cy="130" r="11" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
          <circle cx={cx} cy="130" r="3" fill="#52525b" />
        </g>
      ))}
    </svg>
  );
}

function ProblemChip({ item, label, active, onToggle }) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={() => onToggle(item.id)}
      aria-pressed={active}
      className={`relative text-left flex items-center gap-3 border px-3 py-3 transition ${
        active
          ? "border-blue-600 bg-blue-900/25 text-white"
          : "border-white/12 bg-white/[0.03] text-white/80 hover:border-blue-700/60 hover:bg-blue-900/10"
      }`}
    >
      <span
        className={`w-9 h-9 shrink-0 flex items-center justify-center border ${
          active ? "border-blue-500 bg-blue-600 text-white" : "border-white/15 text-white/70"
        }`}
      >
        <Icon className="w-4 h-4" />
      </span>
      <span className="text-sm leading-tight">{label}</span>
      {active && (
        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-blue-600 text-white flex items-center justify-center">
          <Check className="w-3 h-3" />
        </span>
      )}
    </button>
  );
}

function SectionTitle({ children, count, markedLabel }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="text-white/45 text-[10px] tracking-[0.3em]">{children}</div>
      {count > 0 && (
        <span className="text-[10px] tracking-[0.2em] text-blue-300 bg-blue-900/30 border border-blue-700/40 px-2 py-0.5">
          {count} {markedLabel}
        </span>
      )}
    </div>
  );
}

export default function QuoteStep({
  service,
  problems,
  onToggleProblem,
  extras,
  onToggleExtra,
  otherNote,
  setOtherNote,
  quote,
  t,
  tx,
  lang,
}) {
  const interiorCount = INTERIOR_PROBLEMS.filter((p) => problems.includes(p.id)).length;
  const exteriorCount = EXTERIOR_PROBLEMS.filter((p) => problems.includes(p.id)).length;
  const marked = (n) => (n > 1 ? t("quote.markedPl") : t("quote.marked"));
  const gradeColor =
    quote.grade === 3
      ? "from-red-600 to-orange-500"
      : quote.grade === 2
        ? "from-amber-500 to-yellow-400"
        : "from-emerald-600 to-green-400";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
      {/* Coluna de seleção */}
      <div>
        {/* Visual do veículo */}
        <div className="border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-5 mb-6">
          <div className="text-white/45 text-[10px] tracking-[0.3em] mb-1">
            {t("quote.assessTitle")}
          </div>
          <p className="text-white/55 text-sm mb-4">
            {t("quote.assessPara")}
          </p>
          <div className="max-w-md mx-auto">
            <CarVisual interiorCount={interiorCount} exteriorCount={exteriorCount} ariaLabel={t("quote.vehicleAlt")} />
          </div>
        </div>

        {/* Interior */}
        <div className="mb-6">
          <SectionTitle count={interiorCount} markedLabel={marked(interiorCount)}>
            {t("quote.interior")}
          </SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {INTERIOR_PROBLEMS.map((p) => (
              <ProblemChip
                key={p.id}
                item={p}
                label={tx(p, "label")}
                active={problems.includes(p.id)}
                onToggle={onToggleProblem}
              />
            ))}
          </div>
        </div>

        {/* Exterior */}
        <div className="mb-6">
          <SectionTitle count={exteriorCount} markedLabel={marked(exteriorCount)}>
            {t("quote.exterior")}
          </SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {EXTERIOR_PROBLEMS.map((p) => (
              <ProblemChip
                key={p.id}
                item={p}
                label={tx(p, "label")}
                active={problems.includes(p.id)}
                onToggle={onToggleProblem}
              />
            ))}
          </div>
        </div>

        {/* Extras */}
        <div>
          <SectionTitle count={extras.length} markedLabel={marked(extras.length)}>
            {t("quote.extras")}
          </SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {EXTRAS.map((e) => {
              const Icon = e.icon;
              const active = extras.includes(e.id);
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => onToggleExtra(e.id)}
                  aria-pressed={active}
                  className={`relative text-left flex items-center gap-3 border px-3 py-3 transition ${
                    active
                      ? "border-blue-600 bg-blue-900/25"
                      : "border-white/12 bg-white/[0.03] hover:border-blue-700/60 hover:bg-blue-900/10"
                  }`}
                >
                  <span
                    className={`w-9 h-9 shrink-0 flex items-center justify-center border ${
                      active ? "border-blue-500 bg-blue-600 text-white" : "border-white/15 text-white/70"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm leading-tight text-white">{tx(e, "label")}</span>
                    <span className="text-[11px] text-white/50">
                      {e.price > 0 ? `+ ${eur(e.price, lang)}` : t("quote.onRequest")}
                    </span>
                  </span>
                  {active && (
                    <span className="w-4 h-4 bg-blue-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {extras.includes("outro") && (
            <textarea
              value={otherNote}
              onChange={(e) => setOtherNote(e.target.value)}
              rows={2}
              maxLength={200}
              placeholder={t("quote.otherPh")}
              className="mt-2.5 w-full bg-white/[0.06] border border-white/20 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-blue-500/70 resize-none"
            />
          )}
        </div>
      </div>

      {/* Resumo permanente em tempo real */}
      <div className="lg:sticky lg:top-4 self-start">
        <div className="border border-white/10 bg-white/[0.03]">
          <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] tracking-[0.3em] text-white/60">
              {t("quote.summary")}
            </span>
          </div>

          {/* Grau automático */}
          <div className="px-5 pt-4">
            <div
              className={`bg-gradient-to-r ${gradeColor} text-black/90 px-4 py-3 flex items-center justify-between`}
            >
              <div>
                <div className="text-[10px] tracking-[0.25em] opacity-80">
                  {t("quote.grade")} {quote.grade}
                </div>
                <div className="font-display font-bold tracking-wide text-sm">
                  {(lang === "en" ? quote.gradeLabelEn : quote.gradeLabel).toUpperCase()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] tracking-[0.2em] opacity-80">×{quote.multiplier.toFixed(2)}</div>
                <div className="font-display font-black text-lg leading-none">
                  +{quote.pct}%
                </div>
              </div>
            </div>
          </div>

          {/* Linhas */}
          <div className="px-5 py-4 space-y-2.5 text-sm">
            <Row label={t("quote.service")} value={tx(service, "title")} tight />
            <Row label={t("quote.base")} value={eur(quote.base, lang)} />
            <Row label={t("quote.problems")} value={String(quote.count)} />
            <Row label={t("quote.pctApplied")} value={`+${quote.pct}%`} />
            <div className="border-t border-white/10 pt-2.5">
              <Row label={t("quote.subtotal")} value={eur(quote.subtotal, lang)} />
            </div>

            {quote.chosenExtras.length > 0 && (
              <div className="border-t border-white/10 pt-2.5 space-y-1.5">
                <div className="text-white/40 text-[10px] tracking-[0.25em]">{t("quote.extrasUp")}</div>
                {quote.chosenExtras.map((e) => (
                  <div key={e.id} className="flex justify-between text-white/70 text-[13px]">
                    <span className="inline-flex items-center gap-1.5">
                      <Plus className="w-3 h-3 text-blue-400" />
                      {tx(e, "label")}
                    </span>
                    <span>{e.price > 0 ? eur(e.price, lang) : "—"}</span>
                  </div>
                ))}
                <Row label={t("quote.totalExtras")} value={eur(quote.extrasTotal, lang)} />
              </div>
            )}
          </div>

          {/* Total */}
          <div className="px-5 py-4 border-t border-white/10 bg-blue-950/30">
            <div className="flex items-end justify-between">
              <span className="text-[10px] tracking-[0.3em] text-white/55">
                {t("quote.estTotal")}
              </span>
              <span className="font-display text-3xl font-black text-white">
                {eur(quote.total, lang)}
              </span>
            </div>
            <p className="text-white/40 text-[11px] mt-2 leading-relaxed">
              {t("quote.disclaimer")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, tight }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-white/55 shrink-0">{label}</span>
      <span className={`font-semibold text-right ${tight ? "text-[13px]" : ""}`}>
        {value}
      </span>
    </div>
  );
}
