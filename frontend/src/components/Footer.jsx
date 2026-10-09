import React from 'react';
import { Instagram } from 'lucide-react';
import { TESTIMONIALS } from '../mock';
import { useLang } from '../i18n';
import { absoluto, ancora } from '../rotas';
import Logo from './Logo';

export default function Footer({ onLegal }) {
  const { t, lang } = useLang();

  // Com a barra à frente: numa página de serviço "#about" não ia a lado
  // nenhum, porque a secção vive na página inicial. "/#about" vai lá ter de
  // qualquer página, e na inicial é o mesmo que a âncora.
  const LINKS = [
    { hash: '#home',         key: 'footer.home' },
    { hash: '#about',        key: 'footer.about' },
    { hash: '#services',     key: 'footer.services' },
    // Só enquanto houver avaliações reais: a secção não é montada sem elas, e
    // o link não levava a lado nenhum.
    { hash: '#testimonials', key: 'footer.testimonials', only: TESTIMONIALS.length > 0 },
    { hash: '#faq',          key: 'footer.faq' },
    { hash: '#contact',      key: 'footer.contact' },
  ].filter((l) => l.only !== false);

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
            {/* py-1 nos links e gap menor: a 17px de altura os alvos ficavam abaixo
                  dos 24px que uma pessoa acerta com o dedo. */}
            <ul className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
              {LINKS.map((l) => (
                <li key={l.hash}>
                  <a href={absoluto(ancora(lang, l.hash))} className="inline-block py-1 text-white/65 hover:text-blue-400 transition-colors">{t(l.key)}</a>
                </li>
              ))}
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

        <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-6 text-xs text-white/60">
          {/* O ano sai no HTML do build. Num site construído em dezembro e
              visto em janeiro o browser discordava, e o React redesenhava a
              página inteira por causa de um número; assim fica o do build. */}
          <div suppressHydrationWarning>© {new Date().getFullYear()} Clean Station Car. {t('footer.rights')}</div>
          <div className="flex gap-5">
            <button onClick={() => onLegal('privacy')} className="py-1 hover:text-blue-400 transition-colors">{t('footer.privacy')}</button>
            <button onClick={() => onLegal('terms')}   className="py-1 hover:text-blue-400 transition-colors">{t('footer.terms')}</button>
            <button onClick={() => onLegal('cookies')} className="py-1 hover:text-blue-400 transition-colors">{t('footer.cookies')}</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
