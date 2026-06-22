import React from 'react';
import { PROCESS } from '../mock';
import { useLang } from '../i18n';

export default function Process() {
  const { t, tx } = useLang();
  return (
    <section className="section-dark-gray py-24 md:py-32 relative overflow-hidden border-y border-white/10">
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="text-center mb-16">
          <h2 className="font-display text-white text-4xl md:text-5xl font-black tracking-wide">
            {t('process.title')}
          </h2>
          <span className="accent-bar mx-auto mt-5" />
          <p className="text-white/65 mt-4 text-sm">{t('process.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative">
          {PROCESS.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={p.n}
                className={`relative text-center flex flex-col items-center px-6 py-8 ${
                  i !== PROCESS.length - 1 ? 'lg:border-r lg:border-white/15' : ''
                } ${i < 2 ? 'md:border-b lg:border-b-0 md:border-white/15' : ''} ${
                  i % 2 === 0 ? 'md:border-r md:border-white/15 lg:border-r' : ''
                }`}
              >
                <Icon className="w-10 h-10 text-blue-400 mb-6" strokeWidth={1.2} />

                <div className="text-blue-500 text-[11px] tracking-[0.45em] font-semibold">
                  {p.n}
                </div>
                <h3 className="font-display text-white text-xl font-bold tracking-[0.18em] mt-2">
                  {tx(p, 'title')}
                </h3>
                <p className="text-white/65 text-sm mt-4 max-w-[240px] leading-relaxed">
                  {tx(p, 'desc')}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
