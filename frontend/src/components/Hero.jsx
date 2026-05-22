import React from 'react';
import { CalendarCheck } from 'lucide-react';
import { FEATURES, SITE } from '../mock';

// Dark dramatic front-view of a luxury car with headlight glow
const HERO_CAR =
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2200&q=85';

export default function Hero({ onBook }) {
  return (
    <section id="home" className="relative bg-black overflow-hidden">
      {/* Hero stage */}
      <div className="relative min-h-[100vh] flex flex-col">
        {/* Background car image, centered with vignette */}
        <div className="absolute inset-0 z-0">
          <img
            src={HERO_CAR}
            alt="Luxury car"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: 'center 60%' }}
            loading="eager"
          />
          {/* Headlight glow effect */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: '50%',
              top: '55%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              height: '60%',
              background:
                'radial-gradient(ellipse at center, rgba(255,240,210,0.18) 0%, rgba(255,240,210,0.06) 25%, transparent 60%)',
              filter: 'blur(40px)',
            }}
          />
          {/* Vignette overlays for dark moody look */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0.15)_0%,_rgba(0,0,0,0.7)_70%,_#000_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/35 to-black/60" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex items-center pt-28 pb-12">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="max-w-2xl">
              <h1
                className="font-display font-black leading-[0.88] tracking-tight fade-up"
                style={{ letterSpacing: '0.02em' }}
              >
                <span className="chrome-text block text-[clamp(3.2rem,9vw,7.5rem)]">
                  CLEAN
                </span>
                <span
                  className="chrome-text block text-[clamp(3.2rem,9vw,7.5rem)] fade-up"
                  style={{ animationDelay: '0.08s' }}
                >
                  STATION
                </span>
                <span
                  className="block mt-3 fade-up"
                  style={{ animationDelay: '0.16s' }}
                >
                  <span className="inline-flex items-center gap-5">
                    <span className="h-px w-20 bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                    <span className="chrome-text-thin font-light tracking-[0.55em] text-[clamp(1.6rem,3.6vw,2.8rem)]">
                      CAR
                    </span>
                    <span className="h-px w-20 bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                  </span>
                </span>
              </h1>

              <div
                className="mt-10 fade-up"
                style={{ animationDelay: '0.28s' }}
              >
                <p className="text-white/85 text-xs sm:text-sm tracking-[0.4em] font-semibold">
                  LAVAGEM DETALHADA PREMIUM
                  <br className="sm:hidden" />
                  <span className="sm:ml-2">EM BRAGA</span>
                </p>
                <p className="text-white/65 text-base mt-4 italic">
                  {SITE.subtitle}
                </p>
              </div>

              <div
                className="mt-10 flex flex-col sm:flex-row gap-4 fade-up"
                style={{ animationDelay: '0.38s' }}
              >
                <button
                  onClick={onBook}
                  className="btn-chrome inline-flex items-center justify-center gap-2 px-8 py-4 text-xs tracking-[0.25em] font-bold"
                >
                  <CalendarCheck className="w-4 h-4" />
                  MARCAR AGORA
                </button>
                <a
                  href="#services"
                  className="inline-flex items-center justify-center gap-2 border border-white/40 text-white px-8 py-4 text-xs tracking-[0.25em] font-bold hover:bg-white/10 hover:border-white/80 transition"
                >
                  VER SERVIÇOS
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Feature strip */}
        <div className="relative z-10 border-t border-white/10 bg-black/70 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.label}
                  className={`flex items-center gap-3 py-5 px-2 ${
                    i % 2 === 0 ? 'border-r border-white/10' : ''
                  } ${i < 2 ? 'border-b md:border-b-0 border-white/10' : ''} ${
                    i !== FEATURES.length - 1 ? 'md:border-r md:border-white/10' : ''
                  }`}
                >
                  <div className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-white/80" />
                  </div>
                  <span className="text-white/85 text-[10px] sm:text-[11px] tracking-[0.22em] font-semibold">
                    {f.label.toUpperCase()}
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
