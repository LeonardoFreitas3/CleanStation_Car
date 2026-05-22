import React, { useEffect, useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { TESTIMONIALS } from '../mock';

export default function Testimonials() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % TESTIMONIALS.length), 6000);
    return () => clearInterval(t);
  }, []);

  const visible = [0, 1, 2].map(o => TESTIMONIALS[(idx + o) % TESTIMONIALS.length]);

  return (
    <section id="testimonials" className="bg-black py-24 md:py-32 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-white/40 text-[10px] tracking-[0.4em] mb-3">CLIENTES</p>
          <h2 className="font-display text-3xl md:text-5xl font-black tracking-wide chrome-text">
            O QUE DIZEM OS NOSSOS CLIENTES
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visible.map((t, i) => (
            <div
              key={`${t.name}-${i}`}
              className="relative rounded-2xl p-8 border border-white/10 hover:border-white/25 transition-all"
              style={{
                background:
                  'linear-gradient(180deg, rgba(28,28,28,0.9) 0%, rgba(10,10,10,0.95) 100%)',
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.05), 0 12px 36px rgba(0,0,0,0.4)',
              }}
            >
              <Quote className="absolute top-5 right-5 w-8 h-8 text-white/8" strokeWidth={1} />
              <div className="flex gap-1 mb-5">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-white/85 leading-relaxed mb-6 text-[15px] text-center min-h-[88px]">
                “{t.text}”
              </p>
              <div className="pt-5 border-t border-white/10 text-center">
                <div className="text-white font-semibold tracking-wide">{t.name}</div>
                <div className="text-white/45 text-xs tracking-[0.22em] mt-1">
                  {t.car.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center gap-4 mt-10">
          <button
            onClick={() => setIdx(i => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
            className="w-10 h-10 rounded-full border border-white/20 text-white hover:bg-white hover:text-black flex items-center justify-center transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex gap-2">
            {TESTIMONIALS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === idx ? 'bg-white w-8' : 'bg-white/30 w-2'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setIdx(i => (i + 1) % TESTIMONIALS.length)}
            className="w-10 h-10 rounded-full border border-white/20 text-white hover:bg-white hover:text-black flex items-center justify-center transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
