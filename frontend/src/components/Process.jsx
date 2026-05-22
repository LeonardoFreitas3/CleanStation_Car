import React from 'react';
import { PROCESS } from '../mock';

export default function Process() {
  return (
    <section className="bg-black py-24 md:py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-white/40 text-[10px] tracking-[0.4em] mb-3">MÉTODO</p>
          <h2 className="font-display text-white text-4xl md:text-5xl font-black tracking-wide">
            O NOSSO PROCESSO
          </h2>
          <p className="text-white/55 mt-4 text-sm">Cada detalhe importa.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {PROCESS.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={p.n} className="relative group text-center md:text-left">
                <div className="text-white/8 font-display text-7xl font-black absolute -top-4 -left-2 select-none" style={{color:'rgba(255,255,255,0.04)'}}>{p.n}</div>
                <div className="relative">
                  <div className="w-14 h-14 mb-6 border border-white/15 flex items-center justify-center group-hover:border-white/40 transition-colors mx-auto md:mx-0">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white/40 text-[10px] tracking-[0.4em]">{p.n}</span>
                  <h3 className="font-display text-white text-xl font-bold tracking-wider mt-2">{p.title}</h3>
                  <p className="text-white/55 text-sm mt-3 max-w-[260px] mx-auto md:mx-0">{p.desc}</p>
                </div>
                {i < PROCESS.length - 1 && (
                  <div className="hidden lg:block absolute top-7 left-full w-full h-px bg-gradient-to-r from-white/20 to-transparent -translate-x-6" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
