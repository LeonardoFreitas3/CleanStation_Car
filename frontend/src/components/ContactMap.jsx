import React from 'react';
import { MapPin, Phone, Mail, Clock, CalendarCheck, ExternalLink } from 'lucide-react';
import { SITE } from '../mock';

export default function ContactMap({ onBook }) {
  return (
    <section id="contact" className="bg-black py-24 md:py-32 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        <div>
          <p className="text-white/40 text-[10px] tracking-[0.5em] mb-4">ONDE ESTAMOS</p>
          <h3 className="font-display text-white text-3xl md:text-4xl font-black tracking-wide">VISITA-NOS</h3>

          <div className="mt-8 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 border border-white/15 flex items-center justify-center shrink-0"><MapPin className="w-4 h-4 text-white"/></div>
              <div>
                <div className="text-white/40 text-[10px] tracking-[0.3em]">LOCALIZAÇÃO</div>
                <a href={SITE.mapsShareUrl} target="_blank" rel="noreferrer" className="text-white hover:underline inline-flex items-center gap-1">{SITE.address} <ExternalLink className="w-3 h-3"/></a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 border border-white/15 flex items-center justify-center shrink-0"><Phone className="w-4 h-4 text-white"/></div>
              <div>
                <div className="text-white/40 text-[10px] tracking-[0.3em]">TELEFONE</div>
                <a href={`tel:${SITE.phoneRaw}`} className="text-white hover:underline">{SITE.phone}</a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 border border-white/15 flex items-center justify-center shrink-0"><Mail className="w-4 h-4 text-white"/></div>
              <div>
                <div className="text-white/40 text-[10px] tracking-[0.3em]">EMAIL</div>
                <a href={`mailto:${SITE.email}`} className="text-white hover:underline">{SITE.email}</a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 border border-white/15 flex items-center justify-center shrink-0"><Clock className="w-4 h-4 text-white"/></div>
              <div>
                <div className="text-white/40 text-[10px] tracking-[0.3em]">HORÁRIO</div>
                <div className="text-white">{SITE.hours}</div>
              </div>
            </div>
          </div>

          <div className="mt-10 border border-white/10 p-8 bg-white/[0.02]">
            <h4 className="font-display text-white text-2xl font-black tracking-wide">MARCA JÁ<br/><span className="text-white/50">O TEU HORÁRIO!</span></h4>
            <p className="text-white/60 text-sm mt-3">Faz a tua marcação rápida e garante o melhor cuidado para o teu carro.</p>
            <button onClick={onBook} className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-white text-black px-6 py-4 text-xs tracking-[0.22em] font-bold hover:bg-white/90 transition">
              <CalendarCheck className="w-4 h-4"/> MARCAR AGORA
            </button>
          </div>
        </div>

        <div className="relative w-full h-[520px] lg:h-full min-h-[520px] border border-white/10 overflow-hidden">
          <iframe
            title="Mapa Clean Station Car"
            src={SITE.mapsEmbed}
            className="absolute inset-0 w-full h-full grayscale contrast-[1.1] brightness-[0.7]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/5" />
        </div>
      </div>
    </section>
  );
}
