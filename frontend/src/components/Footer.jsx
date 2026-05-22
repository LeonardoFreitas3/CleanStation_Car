import React from 'react';
import { Instagram, Facebook, MessageCircle } from 'lucide-react';
import { SITE } from '../mock';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/5">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                  <path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11h.5a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5H19v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H8v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-1h-.5A1.5 1.5 0 0 1 3 16.5v-4A1.5 1.5 0 0 1 4.5 11H5zm2.1 0h9.8l-1-3H8.1l-1 3zM7 14a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm10 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
                </svg>
              </div>
              <div className="leading-tight">
                <div className="font-display tracking-[0.18em] text-white text-sm font-bold">CLEAN STATION</div>
                <div className="font-display tracking-[0.4em] text-white/60 text-[10px]">CAR</div>
              </div>
            </div>
            <p className="text-white/55 text-sm mt-5 max-w-sm">
              Lavagem detalhada premium em Braga. O detalhe que o teu carro merece.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a href="#" aria-label="Instagram" className="w-10 h-10 border border-white/15 hover:border-white/40 hover:bg-white/5 flex items-center justify-center text-white transition">
                <Instagram className="w-4 h-4"/>
              </a>
              <a href="#" aria-label="Facebook" className="w-10 h-10 border border-white/15 hover:border-white/40 hover:bg-white/5 flex items-center justify-center text-white transition">
                <Facebook className="w-4 h-4"/>
              </a>
              <a href={`https://wa.me/${SITE.phoneRaw}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="w-10 h-10 border border-white/15 hover:border-white/40 hover:bg-white/5 flex items-center justify-center text-white transition">
                <MessageCircle className="w-4 h-4"/>
              </a>
            </div>
          </div>

          <div>
            <div className="text-white/40 text-[10px] tracking-[0.35em] mb-4">NAVEGAÇÃO</div>
            <ul className="space-y-2 text-sm">
              <li><a href="#home" className="text-white/70 hover:text-white">Início</a></li>
              <li><a href="#services" className="text-white/70 hover:text-white">Serviços</a></li>
              <li><a href="#before-after" className="text-white/70 hover:text-white">Antes &amp; Depois</a></li>
              <li><a href="#testimonials" className="text-white/70 hover:text-white">Testemunhos</a></li>
              <li><a href="#contact" className="text-white/70 hover:text-white">Contactos</a></li>
            </ul>
          </div>

          <div>
            <div className="text-white/40 text-[10px] tracking-[0.35em] mb-4">CONTACTO</div>
            <ul className="space-y-2 text-sm text-white/70">
              <li>{SITE.address}</li>
              <li><a href={`tel:${SITE.phoneRaw}`} className="hover:text-white">{SITE.phone}</a></li>
              <li><a href={`mailto:${SITE.email}`} className="hover:text-white">{SITE.email}</a></li>
              <li>{SITE.hours}</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-6 text-xs text-white/40">
          <div>© {new Date().getFullYear()} Clean Station Car. Todos os direitos reservados.</div>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white">Política de Privacidade</a>
            <a href="#" className="hover:text-white">Termos &amp; Condições</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
