import React, { useEffect, useState } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { TESTIMONIALS } from '../mock';

export default function Testimonials() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % TESTIMONIALS.length), 5500);
    return () => clearInterval(t);
  }, []);

  const visible = [0, 1, 2].map(o => TESTIMONIALS[(idx + o) % TESTIMONIALS.length]);

  return (
    <section id="testimonials" className="bg-zinc-950 py-24 md:py-32 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-white/40 text-[10px] tracking-[0.4em] mb-3">CLIENTES</p>
          <h2 className="font-display text-white text-3xl md:text-5xl font-black tracking-wide">
            O QUE DIZEM OS NOSSOS CLIENTES
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visible.map((t, i) => (
            <div
              key={`${t.name}-${i}`}
              className="border border-white/10 p-8 bg-black/40 hover:border-white/20 transition-all"
            >
              <div className="flex gap-1 mb-5">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-white/80 leading-relaxed mb-6 text-[15px]">“{t.text}”</p>
              <div className="pt-5 border-t border-white/10">
                <div className="text-white font-semibold tracking-wide">{t.name}</div>
                <div className="text-white/50 text-xs tracking-[0.2em] mt-1">{t.car.toUpperCase()}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center gap-4 mt-10">
          <button onClick={() => setIdx(i => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)} className="w-10 h-10 border border-white/20 text-white hover:bg-white hover:text-black flex items-center justify-center transition">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex gap-2">
            {TESTIMONIALS.map((_, i) => (
              <span key={i} className={`h-1 rounded-full transition-all ${i === idx ? 'bg-white w-8' : 'bg-white/30 w-2'}`} />
            ))}
          </div>
          <button onClick={() => setIdx(i => (i + 1) % TESTIMONIALS.length)} className="w-10 h-10 border border-white/20 text-white hover:bg-white hover:text-black flex items-center justify-center transition">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
