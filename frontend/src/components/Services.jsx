import React from 'react';
import { ArrowRight } from 'lucide-react';
import { SERVICES } from '../mock';

export default function Services({ onBook }) {
  return (
    <section id="services" className="relative bg-black py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-white/40 text-[10px] tracking-[0.4em] mb-3">SOLUÇÕES PREMIUM</p>
          <h2 className="font-display text-white text-4xl md:text-5xl font-black tracking-wide">
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
                className="group relative overflow-hidden bg-zinc-900 border border-white/5 hover:border-white/20 transition-all duration-500"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={s.image}
                    alt={s.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/60 backdrop-blur border border-white/20 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-display text-white text-lg font-bold tracking-wider">{s.title}</h3>
                  <p className="text-white/55 text-sm mt-2 min-h-[44px]">{s.desc}</p>

                  <div className="mt-5 pt-5 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-white/40 text-[10px] tracking-[0.3em]">DESDE</span>
                      <div className="text-white font-display text-2xl font-bold">{s.price}€</div>
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
      </div>
    </section>
  );
}
