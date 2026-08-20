import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, MessageCircle, Instagram } from 'lucide-react';
import { SITE } from '../mock';

/**
 * Ecrã de manutenção do site público.
 *
 * Continua a mostrar telefone, WhatsApp e morada: quem chega ao site quer
 * marcar um serviço, e um "voltamos já" sem forma de contacto perde o cliente.
 */
export default function Maintenance() {
  // Sem isto o Google indexava o "voltamos em breve" como sendo o site, e essa
  // versão ficava em cache nos resultados durante dias depois de voltar ao ar.
  useEffect(() => {
    const meta = document.querySelector('meta[name="robots"]');
    const previous = meta?.content;
    if (meta) meta.content = 'noindex, nofollow';
    document.title = 'Clean Station Car — em manutenção';
    return () => { if (meta && previous) meta.content = previous; };
  }, []);

  const waUrl = `https://wa.me/${SITE.phoneRaw}?text=${encodeURIComponent(
    'Olá! Gostaria de fazer uma marcação na Clean Station Car.',
  )}`;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md text-center">
        <img
          src={`${process.env.PUBLIC_URL}/img/logo.png`}
          alt="Clean Station Car"
          className="h-20 w-auto mx-auto"
        />

        <div className="inline-flex items-center gap-2 mt-10 px-4 py-2 border border-white/15 rounded-sm">
          <Wrench className="w-4 h-4 text-blue-400" strokeWidth={1.5} />
          <span className="text-[10px] tracking-[0.3em] uppercase text-white/70">
            Site em manutenção
          </span>
        </div>

        <h1 className="font-display text-2xl md:text-3xl font-black tracking-wide mt-8">
          VOLTAMOS EM BREVE
        </h1>
        <span className="accent-bar mx-auto mt-5" />

        <p className="text-white/60 text-sm mt-6 leading-relaxed">
          Estamos a preparar uma nova versão do site.
          Entretanto continuamos a trabalhar normalmente — fale connosco.
        </p>

        <div className="mt-10 space-y-3">
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs tracking-[0.25em] font-bold transition rounded-sm"
          >
            <MessageCircle className="w-4 h-4" /> MARCAR POR WHATSAPP
          </a>

          <a
            href={`tel:${SITE.phoneRaw}`}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 border border-white/20 hover:border-blue-500 hover:text-blue-300 text-white text-xs tracking-[0.25em] font-bold transition rounded-sm"
          >
            {SITE.phone}
          </a>
        </div>

        <div className="mt-10 pt-8 border-t border-white/10 text-white/45 text-xs leading-relaxed">
          <p>{SITE.address}</p>
          <p className="mt-1">{SITE.hours}</p>
          <a
            href="https://www.instagram.com/cleanstation_car/"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="inline-flex items-center gap-2 mt-4 hover:text-pink-400 transition"
          >
            <Instagram className="w-4 h-4" strokeWidth={1.5} /> @cleanstation_car
          </a>
        </div>

        {/* Discreto de proposito: e para a equipa, nao para os visitantes. */}
        <Link
          to="/crm/login"
          className="inline-block mt-12 text-white/20 hover:text-blue-400 text-[10px] tracking-[0.25em] uppercase transition"
        >
          Acesso interno
        </Link>
      </div>
    </div>
  );
}
