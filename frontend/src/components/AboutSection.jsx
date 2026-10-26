import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { SITE } from '../mock';
import { useLang } from '../i18n';
import { FOTOS_OFICINA, fotoAlt, fotoSrc } from '../fotos';
import Lightbox from './Lightbox';

export default function AboutSection() {
  const { t, lang } = useLang();
  const waMsg = encodeURIComponent(t('whatsapp.info'));
  const waUrl = `https://wa.me/${SITE.phoneRaw}?text=${waMsg}`;
  const [aberta, setAberta] = useState(null);

  return (
    <section id="about" className="relative py-24 md:py-36 overflow-hidden bg-black border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 items-center">
        {/* A fotografia da oficina à vista e o texto ao lado, em vez de um
            fundo escurecido por trás do texto: é para mostrar o espaço. */}
        <button
          type="button"
          onClick={() => setAberta(0)}
          aria-label={lang === 'en' ? 'See the workshop photos' : 'Ver as fotografias da oficina'}
          className="group relative block w-full aspect-[4/3] lg:aspect-[4/5] overflow-hidden rounded-md border border-white/10"
        >
          <picture>
            <source media="(min-width: 1024px)" srcSet={fotoSrc('instalacoes', 'retrato')} />
            <img
              src={fotoSrc('instalacoes', 'card')}
              alt={fotoAlt('instalacoes', lang)}
              width={800}
              height={600}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] group-hover:scale-105"
              loading="lazy"
            />
          </picture>
        </button>

        <div className="max-w-2xl text-center lg:text-left">
          <h2 className="font-display text-white font-black text-3xl md:text-4xl tracking-wide">
            {t('about.title')}
          </h2>
          <span className="accent-bar mx-auto lg:mx-0 mt-5 block" />

          <div className="mt-8 space-y-5 text-white/75 leading-relaxed text-sm md:text-base">
            <p>{t('about.p1')}</p>
            <p>{t('about.p2')}</p>
            <p>{t('about.p3')}</p>
            <p>{t('about.p4')}</p>
          </div>

          <p className="mt-6 text-blue-400 text-sm font-semibold italic leading-relaxed">
            {t('about.closing')}
          </p>

          <div className="flex justify-center lg:justify-start mt-10">
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 text-xs tracking-[0.3em] font-bold text-black bg-white hover:bg-blue-50 transition"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              {t('about.whatsapp')}
            </a>
          </div>
        </div>
      </div>

      <Lightbox fotos={FOTOS_OFICINA} indice={aberta} onIndice={setAberta} lang={lang} />
    </section>
  );
}
