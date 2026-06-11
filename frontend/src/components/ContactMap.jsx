import React from 'react';
import { MapPin, Phone, Mail, Clock, CalendarCheck } from 'lucide-react';
import { SITE } from '../mock';

export default function ContactMap({ onBook }) {
  return (
    <section id="contact" className="bg-black py-24 md:py-32 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[0.9fr_1.3fr_0.9fr] gap-10 items-start">
        {/* LEFT: Onde Estamos */}
        <div>
          <h3 className="font-display text-white text-2xl md:text-3xl font-black tracking-wide">
            ONDE ESTAMOS
          </h3>
          <span className="accent-bar-left mt-4" />

          <div className="mt-8 space-y-6">
            <div className="flex items-start gap-4">
              <MapPin className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" strokeWidth={1.5} />
              <a
                href={SITE.mapsShareUrl}
                target="_blank"
                rel="noreferrer"
                className="text-white text-base hover:text-blue-400 transition-colors"
              >
                {SITE.address}
              </a>
            </div>
            <div className="flex items-start gap-4">
              <Phone className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" strokeWidth={1.5} />
              <a
                href={`tel:${SITE.phoneRaw}`}
                className="text-white text-base hover:text-blue-400 transition-colors"
              >
                {SITE.phone}
              </a>
            </div>
            <div className="flex items-start gap-4">
              <Mail className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" strokeWidth={1.5} />
              <a
                href={`mailto:${SITE.email}`}
                className="text-white text-base hover:underline break-all"
              >
                {SITE.email}
              </a>
            </div>
            <div className="flex items-start gap-4">
              <Clock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" strokeWidth={1.5} />
              <div className="text-white text-base">
                Segunda a Sábado
                <div className="text-white/70 text-sm mt-1">08:00 – 19:00</div>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER: Map */}
        <div
          className="relative w-full rounded-md overflow-hidden border border-white/10 order-last lg:order-none"
          style={{ minHeight: 380 }}
        >
          <iframe
            title="Mapa Clean Station Car"
            src={SITE.mapsEmbed}
            className="absolute inset-0 w-full h-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/5" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at center, transparent 45%, rgba(0,0,0,0.5) 100%)',
            }}
          />
        </div>

        {/* RIGHT: Marca já o teu horário */}
        <div>
          <div className="border border-white/15 rounded-md p-8 bg-[#0f0f0f]">
            <h4 className="font-display text-white text-2xl md:text-[28px] font-black tracking-wide leading-tight">
              MARCA JÁ
              <br />O TEU HORÁRIO!
            </h4>
            <p className="text-white/65 text-sm mt-4 leading-relaxed">
              Faz a tua marcação rápida e garante o melhor cuidado para o teu carro.
            </p>
            <button
              onClick={onBook}
              className="btn-silver mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs tracking-[0.25em] font-bold"
            >
              <CalendarCheck className="w-4 h-4" /> MARCAR AGORA
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
