import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BEFORE_AFTER } from '../mock';

function Card({ item }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="relative grid grid-cols-2 gap-1 rounded-md overflow-hidden bg-black border border-white/10">
        <div className="relative aspect-[3/4]">
          <img
            src={item.before}
            alt={`${item.label} antes`}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 text-[10px] tracking-[0.3em] bg-black/85 text-white border border-white/20">
            ANTES
          </span>
        </div>
        <div className="relative aspect-[3/4]">
          <img
            src={item.after}
            alt={`${item.label} depois`}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 text-[10px] tracking-[0.3em] bg-white text-black">
            DEPOIS
          </span>
        </div>
      </div>
      <p className="text-center text-white/85 text-[11px] tracking-[0.4em] font-semibold">
        {item.label}
      </p>
    </div>
  );
}

export default function BeforeAfter() {
  const [page, setPage] = useState(0);
  const perPage = 4;
  const totalPages = Math.max(1, Math.ceil(BEFORE_AFTER.length / perPage));
  const items = BEFORE_AFTER.slice(page * perPage, page * perPage + perPage);

  return (
    <section id="before-after" className="bg-black py-24 md:py-32 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="font-display text-white text-4xl md:text-5xl font-black tracking-wide">
            ANTES &amp; DEPOIS
          </h2>
          <p className="text-white/55 mt-4 text-sm">Resultados que falam por si.</p>
        </div>

        <div className="relative">
          {/* Arrows */}
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            aria-label="Anterior"
            className="hidden md:flex absolute -left-4 lg:-left-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 border border-white/20 text-white items-center justify-center hover:bg-white hover:text-black transition disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            aria-label="Próximo"
            className="hidden md:flex absolute -right-4 lg:-right-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 border border-white/20 text-white items-center justify-center hover:bg-white hover:text-black transition disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {items.map(b => (
              <Card key={b.label} item={b} />
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <button
            className="inline-flex items-center gap-2 border border-white/30 text-white px-8 py-3 text-[11px] tracking-[0.25em] font-bold hover:border-blue-600 hover:text-blue-400 transition"
          >
            VER MAIS RESULTADOS
          </button>
        </div>
      </div>
    </section>
  );
}
