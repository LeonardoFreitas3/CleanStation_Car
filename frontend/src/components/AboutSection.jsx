import React from 'react';
import { MessageCircle } from 'lucide-react';
import { SITE } from '../mock';
import { useLang } from '../i18n';

const SPLASH_IMAGE = '/img/detail.jpg';

export default function AboutSection() {
  const { t } = useLang();
  const waMsg = encodeURIComponent(t('whatsapp.msg'));
  const waUrl = `https://wa.me/${SITE.phoneRaw}?text=${waMsg}`;

  return (
    <section id="about" className="relative py-24 md:py-36 overflow-hidden bg-black border-t border-white/5">
      <div className="absolute inset-0">
        <img
          src={SPLASH_IMAGE}
          alt="Detalhe automóvel"
          className="w-full h-full object-cover object-center"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black/95 via-black/80 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 flex justify-end">
        <div className="max-w-2xl">
          <h2 className="font-display text-white font-black text-3xl md:text-4xl tracking-wide">
            {t('about.title')}
          </h2>
          <span className="accent-bar-left mt-5" />

          <div className="mt-8 space-y-5 text-white/75 leading-relaxed text-sm md:text-base">
            <p>{t('about.p1')}</p>
            <p>{t('about.p2')}</p>
            <p>{t('about.p3')}</p>
            <p>{t('about.p4')}</p>
          </div>

          <p className="mt-6 text-blue-400 text-sm font-semibold italic leading-relaxed">
            {t('about.closing')}
          </p>

          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-10 inline-flex items-center gap-3 px-8 py-4 text-xs tracking-[0.3em] font-bold text-black bg-white hover:bg-blue-50 transition"
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
            {t('about.whatsapp')}
          </a>
        </div>
      </div>
    </section>
  );
}
