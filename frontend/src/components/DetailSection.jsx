import React from 'react';
import { CalendarCheck } from 'lucide-react';
import { DETAIL_IMAGE } from '../mock';

export default function DetailSection({ onBook }) {
  return (
    <section id="about" className="relative py-24 md:py-36 overflow-hidden bg-black">
      <div className="absolute inset-0">
        <img src={DETAIL_IMAGE} alt="Detail" className="w-full h-full object-cover opacity-30" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/50" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="max-w-3xl">
          <p className="text-white/40 text-[10px] tracking-[0.5em] mb-4">SOBRE NÓS</p>
          <h2 className="font-display text-white font-black leading-[0.95] tracking-tight">
            <span className="block text-[clamp(2.5rem,7vw,5rem)]">O DETALHE QUE</span>
            <span className="block text-[clamp(2.5rem,7vw,5rem)] italic text-white/40 font-light">o teu carro</span>
            <span className="block text-[clamp(2.5rem,7vw,5rem)]">MERECE</span>
          </h2>
          <p className="text-white/65 mt-8 max-w-xl leading-relaxed">
            Na Clean Station Car, cada veículo recebe o cuidado e a atenção que merece.
            Qualidade, paixão e perfeição em cada detalhe.
          </p>
          <button
            onClick={onBook}
            className="mt-8 inline-flex items-center gap-2 bg-white text-black px-8 py-4 text-xs tracking-[0.22em] font-bold hover:bg-white/90 transition"
          >
            <CalendarCheck className="w-4 h-4" /> MARCAR AGORA
          </button>
        </div>
      </div>
    </section>
  );
}
