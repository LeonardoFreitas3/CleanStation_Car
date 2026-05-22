import React, { useRef, useState } from 'react';
import { BEFORE_AFTER } from '../mock';

function Slider({ before, after, label }) {
  const [pos, setPos] = useState(50);
  const ref = useRef(null);
  const dragging = useRef(false);

  const onMove = e => {
    if (!dragging.current || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const p = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPos(p);
  };

  const stop = () => { dragging.current = false; };
  const start = () => { dragging.current = true; };

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={ref}
        className="relative w-full aspect-[4/3] overflow-hidden bg-zinc-900 border border-white/5 select-none cursor-ew-resize group"
        onMouseMove={onMove}
        onMouseDown={start}
        onMouseUp={stop}
        onMouseLeave={stop}
        onTouchMove={onMove}
        onTouchStart={start}
        onTouchEnd={stop}
      >
        <img src={after} alt={`${label} depois`} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
          <img src={before} alt={`${label} antes`} className="absolute inset-0 w-full h-full object-cover" style={{ width: `${(100/pos)*100}%`, maxWidth: 'none' }} loading="lazy" />
        </div>
        <div className="absolute top-3 left-3 px-2 py-1 text-[10px] tracking-[0.3em] bg-black/70 text-white">ANTES</div>
        <div className="absolute top-3 right-3 px-2 py-1 text-[10px] tracking-[0.3em] bg-white text-black">DEPOIS</div>
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-white shadow-[0_0_10px_rgba(255,255,255,0.6)] pointer-events-none"
          style={{ left: `${pos}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold pointer-events-none">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
              <path d="M8 5l-5 7 5 7M16 5l5 7-5 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
      <p className="text-center text-white/80 text-[11px] tracking-[0.35em] font-semibold">{label}</p>
    </div>
  );
}

export default function BeforeAfter() {
  return (
    <section id="before-after" className="bg-zinc-950 py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-white/40 text-[10px] tracking-[0.4em] mb-3">TRANSFORMAÇÕES</p>
          <h2 className="font-display text-white text-4xl md:text-5xl font-black tracking-wide">
            ANTES &amp; DEPOIS
          </h2>
          <p className="text-white/55 mt-4 text-sm">Resultados que falam por si.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BEFORE_AFTER.map(b => (
            <Slider key={b.label} {...b} />
          ))}
        </div>
      </div>
    </section>
  );
}
