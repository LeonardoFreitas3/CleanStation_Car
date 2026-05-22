import React from 'react';
import { CalendarCheck, ChevronDown } from 'lucide-react';
import { FEATURES, HERO_IMAGE, SITE } from '../mock';

export default function Hero({ onBook }) {
  return (
    <section id="home" className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-black">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src={HERO_IMAGE}
          alt="Luxury car"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black" />
        {/* Subtle noise */}
        <div
          className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              'url("data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%27160%27 height=%27160%27><filter id=%27n%27><feTurbulence baseFrequency=%270.9%27 /></filter><rect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27 opacity=%270.6%27/></svg>")',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24 w-full">
        <div className="max-w-3xl">
          <p className="text-white/60 text-xs tracking-[0.5em] mb-6 fade-up">DETAILING · BRAGA · PT</p>
          <h1 className="font-display text-white font-black leading-[0.85] tracking-tight">
            <span className="block text-[clamp(3.5rem,10vw,8rem)] fade-up">CLEAN</span>
            <span className="block text-[clamp(3.5rem,10vw,8rem)] fade-up" style={{animationDelay:'0.1s'}}>STATION</span>
            <span className="block text-[clamp(2rem,5vw,3.5rem)] text-white/40 tracking-[0.6em] mt-3 font-light fade-up" style={{animationDelay:'0.2s'}}>
              <span className="inline-block w-16 h-px bg-white/40 align-middle mr-6"></span>CAR
            </span>
          </h1>

          <div className="mt-10 max-w-xl fade-up" style={{animationDelay:'0.3s'}}>
            <p className="text-white text-xs tracking-[0.35em] font-semibold mb-3">
              {SITE.tagline.toUpperCase()}
            </p>
            <p className="text-white/70 text-base">{SITE.subtitle}</p>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 fade-up" style={{animationDelay:'0.4s'}}>
            <button
              onClick={onBook}
              className="group inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 text-xs tracking-[0.22em] font-bold hover:bg-white/90 transition"
            >
              <CalendarCheck className="w-4 h-4" />
              MARCAR AGORA
            </button>
            <a
              href="#services"
              className="inline-flex items-center justify-center gap-2 border border-white/70 text-white px-8 py-4 text-xs tracking-[0.22em] font-bold hover:bg-white/10 transition"
            >
              VER SERVIÇOS
            </a>
          </div>
        </div>
      </div>

      {/* Feature strip */}
      <div className="relative z-10 border-t border-white/10 bg-black/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.label}
                className={`flex items-center gap-3 py-5 ${
                  i !== FEATURES.length - 1 ? 'md:border-r border-white/10' : ''
                } ${i % 2 === 0 ? 'border-r border-white/10 md:border-r' : ''}`}
              >
                <Icon className="w-4 h-4 text-white/70" />
                <span className="text-white/80 text-[11px] tracking-[0.22em] font-semibold">
                  {f.label.toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 hidden md:block animate-bounce">
        <ChevronDown className="w-6 h-6 text-white/40" />
      </div>
    </section>
  );
}
