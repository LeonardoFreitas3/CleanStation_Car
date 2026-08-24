import React, { useEffect, useState } from 'react';
import { Menu, X, Globe } from 'lucide-react';
import Logo from './Logo';
import { useLang } from '../i18n';
import { TESTIMONIALS } from '../mock';

// A secção de testemunhos não existe enquanto não houver avaliações reais
// (ver Testimonials.jsx). Sem este filtro o menu tinha um link que não levava
// a lado nenhum — carregar nele não fazia nada.
const LINKS = [
  { href: '#home',         key: 'nav.home' },
  { href: '#services',     key: 'nav.services' },
  { href: '#about',        key: 'nav.about' },
  { href: '#testimonials', key: 'nav.testimonials', only: TESTIMONIALS.length > 0 },
  { href: '#faq',          key: 'nav.faq' },
  { href: '#contact',      key: 'nav.contact' },
].filter((l) => l.only !== false);

export default function Header() {
  const { t, lang, setLang } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('#home');
  const toggleLang = () => setLang(lang === 'pt' ? 'en' : 'pt');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const ids = LINKS.map(l => l.href.slice(1));
    const els = ids.map(id => document.getElementById(id)).filter(Boolean);
    if (!els.length) return;
    const obs = new IntersectionObserver(
      entries => { entries.forEach(e => { if (e.isIntersecting) setActive('#' + e.target.id); }); },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/85 backdrop-blur-md border-b border-white/5 py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <a href="#home" className="flex items-center gap-3 group">
          <Logo size={52} />
        </a>

        <nav className="hidden lg:flex items-center gap-8">
          {LINKS.map(l => (
            <a
              key={l.href}
              href={l.href}
              className={`text-[12px] tracking-[0.18em] font-medium transition relative pb-1 ${
                active === l.href ? 'text-white' : 'text-white/65 hover:text-blue-400'
              }`}
            >
              {t(l.key)}
              <span className={`absolute left-0 right-0 -bottom-0.5 h-[2px] bg-blue-600 transition-all ${active === l.href ? 'opacity-100' : 'opacity-0'}`} />
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={toggleLang}
            aria-label={t('lang.aria')}
            title={t('lang.switchTo')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] tracking-[0.2em] font-bold text-white/70 border border-white/20 hover:border-blue-500 hover:text-blue-400 transition"
          >
            <Globe className="w-3.5 h-3.5" />
            {lang === 'pt' ? 'EN' : 'PT'}
          </button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={toggleLang}
            aria-label={t('lang.aria')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] tracking-[0.2em] font-bold text-white/80 border border-white/20"
          >
            <Globe className="w-3.5 h-3.5" />
            {lang === 'pt' ? 'EN' : 'PT'}
          </button>
          <button
            className="text-white p-2"
            onClick={() => setOpen(v => !v)}
            aria-label="Menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ${open ? 'max-h-[400px]' : 'max-h-0'}`}>
        <div className="px-6 py-4 bg-black/95 border-t border-white/5 flex flex-col gap-1">
          {LINKS.map(l => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="py-3 text-sm tracking-[0.2em] text-white/80 border-b border-white/5"
            >
              {t(l.key)}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
