import React from 'react';
import { PROCESS } from '../mock';

export default function Process() {
  return (
    <section className="bg-black py-24 md:py-32 relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-white/40 text-[10px] tracking-[0.4em] mb-3">MÉTODO</p>
          <h2 className="font-display text-4xl md:text-5xl font-black tracking-wide chrome-text">
            O NOSSO PROCESSO
          </h2>
          <p className="text-white/55 mt-4 text-sm">Cada detalhe importa.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 relative">
          {PROCESS.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={p.n} className="relative text-center flex flex-col items-center">
                {/* Metallic icon badge */}
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center relative"
                  style={{
                    background:
                      'radial-gradient(circle at 30% 25%, #2a2a2a 0%, #0a0a0a 70%)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    boxShadow:
                      'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -2px 4px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.6)',
                  }}
                >
                  <Icon className="w-7 h-7 text-white/90" />
                </div>

                <div className="mt-6 text-white/45 text-[11px] tracking-[0.45em] font-semibold">
                  {p.n}
                </div>
                <h3 className="font-display text-white text-xl font-bold tracking-[0.18em] mt-2 chrome-text-thin">
                  {p.title}
                </h3>
                <p className="text-white/55 text-sm mt-4 max-w-[240px] leading-relaxed">
                  {p.desc}
                </p>

                {/* Connector line */}
                {i < PROCESS.length - 1 && (
                  <div
                    className="hidden lg:block absolute top-10 h-px"
                    style={{
                      left: 'calc(50% + 56px)',
                      right: 'calc(-50% + 56px)',
                      background:
                        'linear-gradient(90deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.06) 100%)',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
