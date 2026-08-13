import React from "react";
import { MessageCircle } from "lucide-react";
import { FEATURES, SITE } from "../mock";
import { useLang } from "../i18n";

const HERO_CAR = `${process.env.PUBLIC_URL}/img/banner`;

export default function Hero() {
  const { t, tx } = useLang();
  const waMsg = encodeURIComponent(t('whatsapp.msg'));
  const waUrl = `https://wa.me/${SITE.phoneRaw}?text=${waMsg}`;

  return (
    <section id="home" className="relative bg-black overflow-hidden">
      <div className="relative min-h-[100vh] flex flex-col">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <picture>
            <source srcSet={`${HERO_CAR}.webp`} type="image/webp" />
            <img
              src={`${HERO_CAR}.jpg`}
              alt="Audi luxury car"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: "65% 60%" }}
              loading="eager"
              fetchPriority="high"
            />
          </picture>
          <div className="absolute pointer-events-none" style={{ left: "62%", top: "58%", transform: "translate(-50%, -50%)", width: "70%", height: "60%", background: "radial-gradient(ellipse at center, rgba(255,250,235,0.25) 0%, rgba(255,250,235,0.08) 30%, transparent 65%)", filter: "blur(50px)" }} />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/65 to-black/20" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_60%,_transparent_0%,_rgba(0,0,0,0.55)_70%,_#000_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-2/5 opacity-50 pointer-events-none" style={{ background: "radial-gradient(ellipse at 60% 100%, rgba(147,197,253,0.20) 0%, rgba(59,130,246,0.08) 35%, transparent 55%)", filter: "blur(30px)" }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex items-center pt-28 pb-12">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="max-w-2xl">
              <h1 className="font-display font-black leading-[0.88] tracking-tight fade-up" style={{ letterSpacing: "0.02em" }}>
                <span className="chrome-text block text-[clamp(3.2rem,9vw,7.5rem)]">CLEAN</span>
                <span className="chrome-text block text-[clamp(3.2rem,9vw,7.5rem)] fade-up" style={{ animationDelay: "0.08s" }}>STATION</span>
                <span className="block mt-3 fade-up" style={{ animationDelay: "0.16s" }}>
                  <span className="inline-flex items-center gap-5">
                    <span className="h-px w-16 bg-gradient-to-r from-transparent via-blue-500/90 to-transparent" />
                    <span className="chrome-text-thin font-light tracking-[0.55em] text-[clamp(1.4rem,3.2vw,2.5rem)]">CAR</span>
                    <span className="h-px w-16 bg-gradient-to-r from-transparent via-blue-500/90 to-transparent" />
                  </span>
                </span>
              </h1>

              <div className="mt-10 fade-up" style={{ animationDelay: "0.28s" }}>
                <p className="text-blue-400 text-xs sm:text-sm tracking-[0.42em] font-semibold">{t('hero.badge1')}</p>
                <p className="text-blue-400 text-xs sm:text-sm tracking-[0.42em] font-semibold mt-1">{t('hero.badge2')}</p>
                <p className="text-white/70 text-base mt-5">{t('hero.subtitle')}</p>
              </div>

              <div className="mt-10 flex flex-col sm:flex-row gap-4 fade-up" style={{ animationDelay: "0.38s" }}>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-silver inline-flex items-center justify-center gap-2 px-8 py-4 text-xs tracking-[0.25em] font-bold"
                >
                  <MessageCircle className="w-4 h-4" />
                  {t('hero.whatsapp')}
                </a>
                <a
                  href="#services"
                  className="inline-flex items-center justify-center gap-2 border border-white/55 text-white px-8 py-4 text-xs tracking-[0.25em] font-bold hover:bg-blue-900/30 hover:border-blue-500 hover:text-blue-300 transition"
                >
                  {t('hero.services')}
                </a>
              </div>
            </div>
          </div>
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
