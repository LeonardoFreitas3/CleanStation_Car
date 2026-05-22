import React from 'react';
import { ArrowRight } from 'lucide-react';
import { SERVICES } from '../mock';

export default function Services({ onBook }) {
  return (
    <section id="services" className="relative bg-black py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-white/40 text-[10px] tracking-[0.4em] mb-3">SOLUÇÕES PREMIUM</p>
          <h2 className="font-display text-4xl md:text-5xl font-black tracking-wide chrome-text">
            OS NOSSOS SERVIÇOS
          </h2>
          <p className="text-white/55 mt-4 max-w-xl mx-auto text-sm">
            Soluções completas para cuidar do teu carro ao mais alto nível.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.id}
                className="group relative overflow-hidden bg-gradient-to-b from-zinc-900 to-black border border-white/5 hover:border-white/25 transition-all duration-500 flex flex-col"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={s.image}
                    alt={s.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                </div>

                {/* Icon */}
                <div className="-mt-7 flex justify-center relative z-10">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{
                      background:
                        'radial-gradient(circle at 30% 25%, #2a2a2a 0%, #0a0a0a 75%)',
                      border: '1px solid rgba(255,255,255,0.18)',
                      boxShadow:
                        'inset 0 1px 0 rgba(255,255,255,0.15), 0 6px 20px rgba(0,0,0,0.6)',
                    }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 pt-4 pb-6 text-center flex-1 flex flex-col">
                  <h3 className="font-display text-white text-lg font-bold tracking-wider">
                    {s.title}
                  </h3>
                  <p className="text-white/55 text-sm mt-3 leading-relaxed min-h-[60px]">
                    {s.desc}
                  </p>

                  <div className="mt-auto pt-5 border-t border-white/10 flex items-center justify-between">
                    <div className="text-left">
                      <span className="text-white/40 text-[9px] tracking-[0.3em]">DESDE</span>
                      <div className="font-display text-2xl font-bold chrome-text-thin">
                        {s.price}€
                      </div>
                    </div>
                    <button
                      onClick={() => onBook(s.id)}
                      className="group/btn inline-flex items-center gap-1.5 text-white/70 hover:text-white text-[11px] tracking-[0.22em] font-semibold"
                    >
                      MARCAR
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => onBook()}
            className="inline-flex items-center gap-2 border border-white/30 text-white px-8 py-3 text-[11px] tracking-[0.25em] font-bold hover:bg-white hover:text-black transition"
          >
            VER TODOS OS SERVIÇOS
          </button>
        </div>
      </div>
    </section>
  );
}
