import React from 'react';
import { Instagram } from 'lucide-react';
import { SITE } from '../mock';
import { useLang } from '../i18n';
import Logo from './Logo';

export default function Footer({ onLegal }) {
  const { t } = useLang();
  return (
    <footer className="bg-black border-t border-white/10 pt-16 pb-6">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Logo size={56} />
            <p className="text-white/55 text-sm mt-5 max-w-xs leading-relaxed">
              {t('footer.tagline1')}
              <br />{t('footer.tagline2')}
            </p>
          </div>

          {/* Navegação */}
          <div className="lg:col-span-2">
            <div className="text-white text-sm tracking-[0.25em] font-semibold mb-5">
              {t('footer.navigation')}
            </div>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <li><a href="#home"         className="text-white/65 hover:text-blue-400 transition-colors">{t('footer.home')}</a></li>
              <li><a href="#about"        className="text-white/65 hover:text-blue-400 transition-colors">{t('footer.about')}</a></li>
              <li><a href="#services"     className="text-white/65 hover:text-blue-400 transition-colors">{t('footer.services')}</a></li>
              <li><a href="#testimonials" className="text-white/65 hover:text-blue-400 transition-colors">{t('footer.testimonials')}</a></li>
              <li><a href="#contact"      className="text-white/65 hover:text-blue-400 transition-colors">{t('footer.contact')}</a></li>
            </ul>
          </div>

          {/* Redes Sociais */}
          <div>
            <div className="text-white text-sm tracking-[0.25em] font-semibold mb-5">
              {t('footer.social')}
            </div>
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/cleanstation_car/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 border border-white/20 hover:border-pink-500 hover:bg-pink-900/20 hover:text-pink-400 flex items-center justify-center text-white transition rounded-sm"
              >
                <Instagram className="w-4 h-4" strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-6 text-xs text-white/45">
          <div>© {new Date().getFullYear()} Clean Station Car. {t('footer.rights')}</div>
          <div className="flex gap-5">
            <button onClick={() => onLegal('privacy')} className="hover:text-blue-400 transition-colors">{t('footer.privacy')}</button>
            <button onClick={() => onLegal('terms')}   className="hover:text-blue-400 transition-colors">{t('footer.terms')}</button>
            <button onClick={() => onLegal('cookies')} className="hover:text-blue-400 transition-colors">{t('footer.cookies')}</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
