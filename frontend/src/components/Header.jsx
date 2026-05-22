import React, { useEffect, useState } from 'react';
import { Menu, X, CalendarCheck } from 'lucide-react';
import Logo from './Logo';

const LINKS = [
  { href: '#home', label: 'INÍCIO' },
  { href: '#services', label: 'SERVIÇOS' },
  { href: '#before-after', label: 'ANTES & DEPOIS' },
  { href: '#about', label: 'SOBRE NÓS' },
  { href: '#testimonials', label: 'TESTEMUNHOS' },
  { href: '#contact', label: 'CONTACTOS' },
];

export default function Header({ onBook }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('#home');

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
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) setActive('#' + e.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-black/85 backdrop-blur-md border-b border-white/5 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <a href="#home" className="flex items-center gap-3 group">
          <Logo size={44} />
        </a>

        <nav className="hidden lg:flex items-center gap-8">
          {LINKS.map(l => (
            <a
              key={l.href}
              href={l.href}
              className={`text-[12px] tracking-[0.18em] font-medium transition relative pb-1 ${
                active === l.href ? 'text-white' : 'text-white/65 hover:text-white'
              }`}
            >
              {l.label}
              <span
                className={`absolute left-0 right-0 -bottom-0.5 h-[2px] bg-white transition-all ${
                  active === l.href ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </a>
          ))}
        </nav>

        <button
          onClick={onBook}
          className="btn-chrome hidden lg:inline-flex items-center gap-2 px-6 py-2.5 text-[11px] tracking-[0.22em] font-bold"
        >
          <CalendarCheck className="w-4 h-4" />
          MARCAR AGORA
        </button>

        <button
          className="lg:hidden text-white p-2"
          onClick={() => setOpen(v => !v)}
          aria-label="Menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          open ? 'max-h-[480px]' : 'max-h-0'
        }`}
      >
        <div className="px-6 py-4 bg-black/95 border-t border-white/5 flex flex-col gap-1">
          {LINKS.map(l => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="py-3 text-sm tracking-[0.2em] text-white/80 border-b border-white/5"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={() => {
              setOpen(false);
              onBook();
            }}
            className="btn-chrome mt-3 px-5 py-3 text-xs tracking-[0.22em] font-bold flex items-center justify-center gap-2"
          >
            <CalendarCheck className="w-4 h-4" /> MARCAR AGORA
          </button>
        </div>
      </div>
    </header>
  );
}
