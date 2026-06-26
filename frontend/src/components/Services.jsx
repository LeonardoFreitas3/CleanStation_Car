import React, { useState } from 'react';
import { SERVICES, CATEGORIES } from '../mock';
import { useLang } from '../i18n';
import ServiceDetail from './ServiceDetail';

export default function Services() {
  const { t, tx } = useLang();
  const [detailService, setDetailService] = useState(null);

  return (
    <section id="services" className="section-dark-gray relative py-24 md:py-32 border-y border-white/10">
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="text-center mb-16">
          <h2 className="font-display text-white text-4xl md:text-5xl font-black tracking-wide">
            {t('services.title')}
          </h2>
          <span className="accent-bar mx-auto mt-5" />
          <p className="text-white/55 mt-4 max-w-xl mx-auto text-sm">
            {t('services.subtitle')}
          </p>
        </div>

        {CATEGORIES.map((cat) => {
          const catServices = SERVICES.filter(s => s.category === cat.id);
          if (!catServices.length) return null;
          const CatIcon = cat.icon;
          return (
            <div key={cat.id} className="mb-16 last:mb-0">
              <div className="flex items-center gap-4 mb-8">
                <CatIcon className="w-6 h-6 text-blue-400 shrink-0" strokeWidth={1.4} />
                <div>
                  <h3 className="font-display text-white text-xl md:text-2xl font-black tracking-widest">
                    {tx(cat, 'label')}
                  </h3>
                  <p className="text-white/40 text-xs tracking-[0.3em] mt-0.5">{tx(cat, 'subtitle')}</p>
                </div>
                <span className="flex-1 h-px bg-gradient-to-r from-blue-600/40 to-transparent ml-4" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {catServices.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div
                      key={s.id}
                      className="group relative overflow-hidden bg-[#0e0e0e] border border-white/10 hover:border-blue-700/60 transition-all duration-500 flex flex-col rounded-md cursor-pointer"
                      style={{ animationDelay: `${i * 0.08}s` }}
                      onClick={() => setDetailService(s)}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={s.image}
                          alt={tx(s, 'title')}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] group-hover:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-black/40 to-transparent" />
                      </div>

                      <div className="px-6 pt-5 flex justify-center">
                        <Icon className="w-6 h-6 text-blue-400" strokeWidth={1.4} />
                      </div>

                      <div className="px-6 pt-3 pb-6 text-center flex-1 flex flex-col">
                        <h4 className="font-display text-white text-sm font-bold tracking-wider leading-snug">
                          {tx(s, 'title')}
                        </h4>
                        <p className="text-white/50 text-xs mt-2 leading-relaxed flex-1">
                          {tx(s, 'desc')}
                        </p>

                        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                          <div className="text-left">
                            <span className="text-blue-400/80 text-[9px] tracking-[0.3em]">{t('services.from')}</span>
                            <div className="text-white font-display text-xl font-bold">{s.price}€</div>
                          </div>
                          <span className="text-white/40 text-[10px] tracking-[0.15em]">
                            {t('services.contact')} →
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <p className="text-center text-white/35 text-xs mt-10 tracking-[0.2em]">
          {t('services.note')}
        </p>
      </div>

      <ServiceDetail
        service={detailService}
        open={!!detailService}
        onClose={() => setDetailService(null)}
      />
    </section>
  );
}
