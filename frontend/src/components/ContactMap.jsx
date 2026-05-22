import React from 'react';
import { MapPin, Phone, Mail, Clock, CalendarCheck, ExternalLink } from 'lucide-react';
import { SITE } from '../mock';

export default function ContactMap({ onBook }) {
  return (
    <section id="contact" className="bg-black py-24 md:py-32 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-14 items-start">
        {/* LEFT: Contact info + Marca Já card */}
        <div>
          <p className="text-white/40 text-[10px] tracking-[0.5em] mb-5">ONDE ESTAMOS</p>

          <div className="space-y-5 mb-10">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div>
                <a
                  href={SITE.mapsShareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white text-lg hover:underline inline-flex items-center gap-1.5"
                >
                  {SITE.address} <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <a href={`tel:${SITE.phoneRaw}`} className="text-white text-lg hover:underline">
                {SITE.phone}
              </a>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <a href={`mailto:${SITE.email}`} className="text-white text-lg hover:underline break-all">
                {SITE.email}
              </a>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div className="text-white text-lg leading-tight">
                Segunda a Sábado
                <div className="text-white/65 text-sm mt-1">08:00 – 19:00</div>
              </div>
            </div>
          </div>

          <div
            className="rounded-2xl p-8 border border-white/10"
            style={{
              background:
                'linear-gradient(180deg, rgba(28,28,28,0.85) 0%, rgba(10,10,10,0.95) 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            <h4 className="font-display text-2xl md:text-3xl font-black tracking-wide chrome-text">
              MARCA JÁ O TEU HORÁRIO!
            </h4>
            <p className="text-white/65 text-sm mt-3 leading-relaxed">
              Faz a tua marcação rápida e garante o melhor cuidado para o teu carro.
            </p>
            <button
              onClick={onBook}
              className="btn-chrome mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-4 text-xs tracking-[0.25em] font-bold"
            >
              <CalendarCheck className="w-4 h-4" /> MARCAR AGORA
            </button>
          </div>
        </div>

        {/* RIGHT: Map */}
        <div
          className="relative w-full rounded-2xl overflow-hidden border border-white/10"
          style={{ minHeight: 520 }}
        >
          <iframe
            title="Mapa Clean Station Car"
            src={SITE.mapsEmbed}
            className="absolute inset-0 w-full h-full grayscale contrast-[1.15] brightness-[0.55]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/5 rounded-2xl" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at center, transparent 50%, rgba(0,0,0,0.35) 100%)',
            }}
          />
        </div>
      </div>
    </section>
  );
}
