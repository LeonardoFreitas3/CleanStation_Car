import React from 'react';
import { Instagram, Facebook, MessageCircle } from 'lucide-react';
import { SITE } from '../mock';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 pt-16 pb-6">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Logo size={36} />
            <p className="text-white/55 text-sm mt-5 max-w-xs leading-relaxed">
              Lavagem detalhada premium em Braga.
              <br />O detalhe que o teu carro merece.
            </p>
          </div>

          {/* Navegação */}
          <div>
            <div className="text-white text-sm tracking-[0.25em] font-semibold mb-5">
              NAVEGAÇÃO
            </div>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#home" className="text-white/65 hover:text-white">
                  Início
                </a>
              </li>
              <li>
                <a href="#services" className="text-white/65 hover:text-white">
                  Serviços
                </a>
              </li>
              <li>
                <a href="#before-after" className="text-white/65 hover:text-white">
                  Antes &amp; Depois
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-white text-sm tracking-[0.25em] font-semibold mb-5 opacity-0 hidden md:block">
              .
            </div>
            <ul className="space-y-3 text-sm mt-0 md:mt-12 lg:mt-12">
              <li>
                <a href="#about" className="text-white/65 hover:text-white">
                  Sobre Nós
                </a>
              </li>
              <li>
                <a href="#testimonials" className="text-white/65 hover:text-white">
                  Testemunhos
                </a>
              </li>
              <li>
                <a href="#contact" className="text-white/65 hover:text-white">
                  Contactos
                </a>
              </li>
            </ul>
          </div>

          {/* Redes Sociais */}
          <div>
            <div className="text-white text-sm tracking-[0.25em] font-semibold mb-5">
              REDES SOCIAIS
            </div>
            <div className="flex items-center gap-3">
              <a
                href="#"
                aria-label="Instagram"
                className="w-10 h-10 border border-white/20 hover:border-white hover:bg-white/5 flex items-center justify-center text-white transition rounded-sm"
              >
                <Instagram className="w-4 h-4" strokeWidth={1.5} />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="w-10 h-10 border border-white/20 hover:border-white hover:bg-white/5 flex items-center justify-center text-white transition rounded-sm"
              >
                <Facebook className="w-4 h-4" strokeWidth={1.5} />
              </a>
              <a
                href={`https://wa.me/${SITE.phoneRaw}`}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="w-10 h-10 border border-white/20 hover:border-white hover:bg-white/5 flex items-center justify-center text-white transition rounded-sm"
              >
                <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
              </a>
              <a
                href="#"
                aria-label="TikTok"
                className="w-10 h-10 border border-white/20 hover:border-white hover:bg-white/5 flex items-center justify-center text-white transition rounded-sm"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.69a8.16 8.16 0 0 0 4.77 1.52V6.79a4.85 4.85 0 0 1-1.84-.1z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-6 text-xs text-white/45">
          <div>
            © {new Date().getFullYear()} Clean Station Car. Todos os direitos
            reservados.
          </div>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white">
              Política de Privacidade
            </a>
            <a href="#" className="hover:text-white">
              Termos &amp; Condições
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
