import React from 'react';
import { X, Check, MessageCircle } from 'lucide-react';
import { SITE } from '../mock';
import { VEHICLE_TYPES } from '../booking/pricing';
import { useLang } from '../i18n';

export default function ServiceDetail({ service, open, onClose }) {
  const { t, tx, lang } = useLang();
  if (!open || !service) return null;
  const Icon = service.icon;
  const includes = tx(service, 'includes') || service.includes;
  // Era português fixo, mesmo com o site em inglês.
  const waMsg = encodeURIComponent(
    lang === 'en'
      ? `Hello! I'd like a quote for: ${tx(service, 'title')}`
      : `Olá! Gostaria de pedir um orçamento para: ${tx(service, 'title')}`,
  );
  const waUrl = `https://wa.me/${SITE.phoneRaw}?text=${waMsg}`;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-4 px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 text-white max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero image */}
        <div className="relative h-48 sm:h-64 overflow-hidden flex-shrink-0">
          <img
            src={service.image}
            alt={tx(service, 'title')}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-black/50 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 bg-black/60 border border-white/20 hover:border-blue-500 hover:bg-blue-900/40 flex items-center justify-center transition z-10"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-4 left-5 right-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 border border-white/20 bg-black/40 flex items-center justify-center">
                <Icon className="w-5 h-5 text-blue-400" strokeWidth={1.4} />
              </div>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-black tracking-wide leading-tight">
              {tx(service, 'title')}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-6">
          <p className="text-white/60 text-sm leading-relaxed">
            {tx(service, 'desc')}
          </p>

          {/* Tabela por tipo de veículo. Só as lavagens variam com o veículo;
              cerâmica, polimentos e afins têm preço único e não mostram nada. */}
          {service.priceByVehicle && (
            <div className="mt-6">
              <div className="text-white/40 text-[10px] tracking-[0.3em] mb-3">
                {lang === 'en' ? 'PRICE BY VEHICLE' : 'PREÇO POR VEÍCULO'}
              </div>
              <ul className="border border-white/10 rounded-sm divide-y divide-white/8">
                {VEHICLE_TYPES
                  .filter((v) => service.priceByVehicle[v.id] !== undefined)
                  .map((v) => (
                    <li key={v.id} className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-white/75 text-sm">{v.label}</span>
                      <span className="text-white font-semibold">{service.priceByVehicle[v.id]} €</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {includes && includes.length > 0 && (
            <div className="mt-6">
              <div className="text-white/40 text-[10px] tracking-[0.3em] mb-4">
                {t('serviceDetail.includes')}
              </div>
              <ul className="space-y-2.5">
                {includes.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-blue-400" />
                    </div>
                    <span className="text-white/80 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 text-white/40 text-xs italic">
            {t('serviceDetail.note')}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-4 border-t border-white/10 flex items-center justify-between gap-4 flex-shrink-0">
          <div>
            <span className="text-blue-400/80 text-[9px] tracking-[0.3em]">{t('serviceDetail.from')}</span>
            <div className="text-white font-display text-2xl sm:text-3xl font-bold">{service.price}€</div>
          </div>
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 text-xs tracking-[0.22em] font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            {t('serviceDetail.whatsapp')}
          </a>
        </div>
      </div>
    </div>
  );
}
