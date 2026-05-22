import React from 'react';
import { CalendarCheck } from 'lucide-react';

// Wheel with water splash - dramatic side image
const SPLASH_IMAGE =
  'https://images.unsplash.com/photo-1605587030346-8e0fbb8c6abe?auto=format&fit=crop&w=2000&q=85';

export default function DetailSection({ onBook }) {
  return (
    <section
      id="about"
      className="relative py-24 md:py-36 overflow-hidden bg-black border-t border-white/5"
    >
      {/* Right-side splash image */}
      <div className="absolute inset-0">
        <div className="absolute inset-y-0 right-0 w-full md:w-2/3 lg:w-3/5">
          <img
            src={SPLASH_IMAGE}
            alt="Roda com splash de água"
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center' }}
            loading="lazy"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="max-w-xl">
          <h2
            className="font-display text-white font-black leading-[0.95] tracking-tight"
            style={{ letterSpacing: '0.01em' }}
          >
            <span className="block text-[clamp(2.4rem,6vw,4.2rem)]">O DETALHE QUE</span>
            <span className="block text-[clamp(2.4rem,6vw,4.2rem)]">O TEU CARRO</span>
            <span className="block text-[clamp(2.4rem,6vw,4.2rem)]">MERECE</span>
          </h2>
          <p className="text-white/75 mt-8 max-w-lg leading-relaxed">
            Na Clean Station Car, cada veículo recebe o cuidado e a atenção que
            merece. Qualidade, paixão e perfeição em cada detalhe.
          </p>
          <button
            onClick={onBook}
            className="btn-silver mt-10 inline-flex items-center gap-2 px-8 py-4 text-xs tracking-[0.25em] font-bold"
          >
            <CalendarCheck className="w-4 h-4" /> MARCAR AGORA
          </button>
        </div>
      </div>
    </section>
  );
}
