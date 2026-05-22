import React from 'react';
import { CalendarCheck } from 'lucide-react';

// Car splash / wheel image for the detail section
const SPLASH_IMAGE =
  'https://images.unsplash.com/photo-1536796423601-e9733a86d257?auto=format&fit=crop&w=2000&q=85';

export default function DetailSection({ onBook }) {
  return (
    <section
      id="about"
      className="relative py-24 md:py-36 overflow-hidden bg-black border-t border-white/5"
    >
      {/* Background splash image positioned to the right */}
      <div className="absolute inset-0">
        <img
          src={SPLASH_IMAGE}
          alt="Detail"
          className="w-full h-full object-cover opacity-55"
          style={{ objectPosition: 'right center' }}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="max-w-2xl">
          <p className="text-white/40 text-[10px] tracking-[0.5em] mb-6">
            SOBRE NÓS
          </p>
          <h2
            className="font-display font-black leading-[0.95] tracking-tight"
            style={{ letterSpacing: '0.01em' }}
          >
            <span className="chrome-text block text-[clamp(2.4rem,6.5vw,4.5rem)]">
              O DETALHE QUE
            </span>
            <span className="chrome-text block text-[clamp(2.4rem,6.5vw,4.5rem)]">
              O TEU CARRO
            </span>
            <span className="chrome-text block text-[clamp(2.4rem,6.5vw,4.5rem)]">
              MERECE
            </span>
          </h2>
          <p className="text-white/70 mt-8 max-w-lg leading-relaxed">
            Na Clean Station Car, cada veículo recebe o cuidado e a atenção que
            merece. Qualidade, paixão e perfeição em cada detalhe.
          </p>
          <button
            onClick={onBook}
            className="btn-chrome mt-10 inline-flex items-center gap-2 px-8 py-4 text-xs tracking-[0.25em] font-bold"
          >
            <CalendarCheck className="w-4 h-4" /> MARCAR AGORA
          </button>
        </div>
      </div>
    </section>
  );
}
