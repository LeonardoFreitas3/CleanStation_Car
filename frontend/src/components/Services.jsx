import React from 'react';
import { ArrowRight } from 'lucide-react';
import { SERVICES } from '../mock';

export default function Services({ onBook }) {
  return (
    <section id="services" className="section-dark-gray relative py-24 md:py-32 border-y border-white/10">
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="text-center mb-16">
          <h2 className="font-display text-white text-4xl md:text-5xl font-black tracking-wide">
            OS NOSSOS SERVIÇOS
          </h2>
          <span className="accent-bar mx-auto mt-5" />
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
                className="group relative overflow-hidden bg-[#0e0e0e] border border-white/10 hover:border-blue-700/60 transition-all duration-500 flex flex-col rounded-md"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={s.image}
                    alt={s.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-black/40 to-transparent" />
                </div>

                {/* Simple outline icon, no metallic circle */}
                <div className="px-6 pt-5 flex justify-center">
                  <Icon className="w-7 h-7 text-blue-400" strokeWidth={1.4} />
                </div>

                <div className="px-6 pt-3 pb-6 text-center flex-1 flex flex-col">
                  <h3 className="font-display text-white text-lg font-bold tracking-wider">
                    {s.title}
                  </h3>
                  <p className="text-white/55 text-sm mt-3 leading-relaxed min-h-[60px]">
                    {s.desc}
                  </p>

                  <div className="mt-auto pt-5 border-t border-white/10 flex items-center justify-between">
                    <div className="text-left">
                      <span className="text-blue-400/80 text-[9px] tracking-[0.3em]">DESDE</span>
                      <div className="text-white font-display text-2xl font-bold">{s.price}€</div>
                    </div>
                    <button
                      onClick={() => onBook(s.id)}
                      className="group/btn inline-flex items-center gap-1.5 text-white/70 hover:text-blue-400 text-[11px] tracking-[0.22em] font-semibold transition-colors"
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
            className="inline-flex items-center gap-2 border border-white/30 text-white px-8 py-3 text-[11px] tracking-[0.25em] font-bold hover:border-blue-600 hover:text-blue-400 transition"
          >
            VER TODOS OS SERVIÇOS
          </button>
        </div>
      </div>
    </section>
  );
}
