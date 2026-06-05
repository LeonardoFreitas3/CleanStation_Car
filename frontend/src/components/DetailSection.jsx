import React from 'react';
import { CalendarCheck } from 'lucide-react';

const SPLASH_IMAGE = '/img/detail.jpg';

export default function DetailSection({ onBook }) {
  return (
    <section
      id="about"
      className="relative py-24 md:py-36 overflow-hidden bg-black border-t border-white/5"
    >
      {/* Full background image */}
      <div className="absolute inset-0">
        <img
          src={SPLASH_IMAGE}
          alt="Roda com splash de água"
          className="w-full h-full object-cover object-center"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black/90 via-black/60 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 flex justify-end">
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
            className="group mt-10 inline-flex items-center gap-3 px-10 py-5 text-xs tracking-[0.3em] font-bold text-black relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #d4d4d4 50%, #a8a8a8 100%)',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.3), 0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.9)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.5), 0 16px 48px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.9)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.3), 0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.9)';
            }}
          >
            <CalendarCheck className="w-4 h-4 shrink-0" />
            MARCAR AGORA
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 60%)' }}
            />
          </button>
        </div>
      </div>
    </section>
  );
}
