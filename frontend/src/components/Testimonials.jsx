import React, { useEffect, useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, ExternalLink } from 'lucide-react';
import { TESTIMONIALS, SITE } from '../mock';
import { useLang } from '../i18n';

/**
 * Avaliações de clientes.
 *
 * Sem dados estruturados de avaliação, de propósito: o Google deixou de
 * mostrar estrelas em resultados enriquecidos quando é a própria empresa a
 * escolher que avaliações mostra no seu site. As estrelas que contam vêm do
 * perfil de empresa, não daqui. Isto serve para quem visita e para os
 * sistemas de IA lerem que existem avaliações reais.
 */
export default function Testimonials() {
  const { t, tx } = useLang();
  const [idx, setIdx] = useState(0);

  const total = TESTIMONIALS.length;

  useEffect(() => {
    if (total <= 1) return undefined;
    const timer = setInterval(() => setIdx((i) => (i + 1) % total), 6000);
    return () => clearInterval(timer);
  }, [total]);

  // Enquanto não houver avaliações reais, a secção não existe. Melhor não ter
  // do que ter um espaço vazio ou depoimentos inventados.
  if (total === 0) return null;

  const visible = Array.from({ length: Math.min(3, total) }, (_, o) => TESTIMONIALS[(idx + o) % total]);

  return (
    <section id="testimonials" className="bg-black py-24 md:py-32 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="font-display text-white text-3xl md:text-5xl font-black tracking-wide">
            {t('testimonials.title')}
          </h2>
          <span className="accent-bar mx-auto mt-5" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visible.map((review, i) => (
            <article
              key={`${review.name}-${(idx + i) % total}`}
              className="relative rounded-2xl p-8 border border-white/10 hover:border-blue-700/60 transition-all"
              style={{
                background: 'linear-gradient(180deg, rgba(28,28,28,0.9) 0%, rgba(10,10,10,0.95) 100%)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 12px 36px rgba(0,0,0,0.4)',
              }}
            >
              <Quote className="absolute top-5 right-5 w-8 h-8 text-blue-500/25" strokeWidth={1} />

              <div className="flex gap-1 mb-5" aria-label={`${review.rating} em 5 estrelas`}>
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star
                    key={k}
                    className={`w-4 h-4 ${k < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'}`}
                  />
                ))}
              </div>

              <p className="text-white/85 leading-relaxed mb-6 text-[15px] text-center min-h-[88px]">
                “{tx(review, 'text')}”
              </p>

              <div className="pt-5 border-t border-white/10 text-center">
                <div className="text-white font-semibold tracking-wide">{review.name}</div>
                <div className="text-white/45 text-xs tracking-[0.22em] mt-1">
                  {review.car ? review.car.toUpperCase() : review.date}
                </div>
              </div>
            </article>
          ))}
        </div>

        {total > 3 && (
          <div className="flex justify-center items-center gap-4 mt-10">
            <button
              onClick={() => setIdx((i) => (i - 1 + total) % total)}
              aria-label={t('beforeAfter.prev')}
              className="w-10 h-10 rounded-full border border-white/20 text-white hover:border-blue-500 hover:bg-blue-900/30 hover:text-blue-400 flex items-center justify-center transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-2">
              {TESTIMONIALS.map((r, i) => (
                <span
                  key={r.name}
                  className={`h-1.5 rounded-full transition-all ${i === idx ? 'bg-blue-500 w-8' : 'bg-white/30 w-2'}`}
                />
              ))}
            </div>
            <button
              onClick={() => setIdx((i) => (i + 1) % total)}
              aria-label={t('beforeAfter.next')}
              className="w-10 h-10 rounded-full border border-white/20 text-white hover:border-blue-500 hover:bg-blue-900/30 hover:text-blue-400 flex items-center justify-center transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quem duvidar confirma na fonte. Vale mais do que qualquer marcação. */}
        <div className="text-center mt-10">
          <a
            href={SITE.reviewsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-white/45 hover:text-blue-400 text-xs tracking-[0.15em] transition"
          >
            {t('testimonials.seeAll')} <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
