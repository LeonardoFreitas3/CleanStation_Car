import React from "react";
import { MessageCircle, CalendarDays } from 'lucide-react';
import { FEATURES, SITE } from "../mock";
import { useLang } from "../i18n";
import { fotoSrc } from "../fotos";

const HERO = fotoSrc('porsche', 'heroi');
const HERO_SM = fotoSrc('porsche', 'heroi-sm');

export default function Hero({ onBook }) {
  const { t, tx } = useLang();
  const waMsg = encodeURIComponent(t('whatsapp.quote'));
  const waUrl = `https://wa.me/${SITE.phoneRaw}?text=${waMsg}`;

  return (
    <section id="home" className="relative bg-black overflow-hidden">
      <div className="relative min-h-[100vh] flex flex-col">
        {/* Content */}
        <div className="relative z-10 flex-1 flex items-center pt-28 pb-12">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="max-w-2xl">
              {/* O logótipo é marca e não título: o H1 é a frase que se procura
                  no Google, logo abaixo. */}
              <p className="font-display font-black leading-[0.88] tracking-tight fade-up" style={{ letterSpacing: "0.02em" }}>
                <span className="chrome-text block text-[clamp(3.2rem,9vw,7.5rem)]">CLEAN</span>
                <span className="chrome-text block text-[clamp(3.2rem,9vw,7.5rem)] fade-up" style={{ animationDelay: "0.08s" }}>STATION</span>
                <span className="block mt-3 fade-up" style={{ animationDelay: "0.16s" }}>
                  <span className="inline-flex items-center gap-5">
                    <span className="h-px w-16 bg-gradient-to-r from-transparent via-blue-500/90 to-transparent" />
                    <span className="chrome-text-thin font-light tracking-[0.55em] text-[clamp(1.4rem,3.2vw,2.5rem)]">CAR</span>
                    <span className="h-px w-16 bg-gradient-to-r from-transparent via-blue-500/90 to-transparent" />
                  </span>
                </span>
              </p>

              <div className="mt-10 fade-up" style={{ animationDelay: "0.28s" }}>
                <h1 className="text-blue-400 text-xs sm:text-sm tracking-[0.42em] font-semibold uppercase leading-loose">{t('hero.title')}</h1>
                <p className="text-white/70 text-base mt-5 max-w-xl">{t('hero.subtitle')}</p>
              </div>

              <div className="mt-10 flex flex-col sm:flex-row gap-4 fade-up" style={{ animationDelay: "0.38s" }}>
                {/* Marcar passa a ser a ação principal: o WhatsApp obriga a
                    trocar mensagens até acertar a hora, isto resolve num ecrã. */}
                <button
                  type="button"
                  onClick={onBook}
                  className="btn-silver inline-flex items-center justify-center gap-2 px-8 py-4 text-xs tracking-[0.25em] font-bold"
                >
                  <CalendarDays className="w-4 h-4" aria-hidden="true" />
                  {t('hero.book')}
                </button>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-white/55 text-white px-8 py-4 text-xs tracking-[0.25em] font-bold hover:bg-emerald-900/30 hover:border-emerald-500 hover:text-emerald-300 transition"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  {t('hero.whatsapp')}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* A fotografia é vertical. No computador ocupa a parte direita e o
            texto fica à esquerda, sobre preto; no telemóvel vem a seguir aos
            botões, para o texto nunca ficar por cima do carro. Só se escurece a
            orla que encosta ao texto, para as duas coisas se fundirem. O
            telemóvel recebe a versão de 640px. */}
        <div className="relative h-72 -mt-8 md:mt-0 md:absolute md:inset-y-0 md:right-0 md:h-full md:w-[56%]">
          <picture>
            <source media="(max-width: 767px)" srcSet={HERO_SM} type="image/webp" />
            <img
              src={HERO}
              alt="Porsche cinzento na oficina da Clean Station Car, em Braga"
              width={941}
              height={1100}
              className="absolute inset-0 w-full h-full object-cover object-[50%_85%]"
              loading="eager"
              fetchPriority="high"
            />
          </picture>
          <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black to-transparent md:inset-y-0 md:right-auto md:h-full md:w-2/5 md:bg-gradient-to-r" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent" />
        </div>

        {/* Feature strip */}
        <div className="relative z-10 bg-black/70 backdrop-blur-sm">
          <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.label}
                  className={`flex items-center gap-3 py-5 ${i % 2 === 0 ? "border-r border-white/10 md:border-r" : ""} ${i < 2 ? "border-b md:border-b-0 border-white/10" : ""} ${i !== FEATURES.length - 1 ? "md:border-r md:border-white/10" : ""}`}
                >
                  <Icon className="ml-4 w-5 h-5 text-blue-400 shrink-0" strokeWidth={1.4} />
                  <span className="text-white/85 text-[10px] sm:text-[11px] tracking-[0.22em] font-semibold">
                    {tx(f, 'label').toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
