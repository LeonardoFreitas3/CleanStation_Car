import React, { useEffect, useState } from 'react';
import { Menu, X, CalendarCheck } from 'lucide-react';

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
          <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center group-hover:border-white transition">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
              <path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11h.5a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5H19v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H8v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-1h-.5A1.5 1.5 0 0 1 3 16.5v-4A1.5 1.5 0 0 1 4.5 11H5zm2.1 0h9.8l-1-3H8.1l-1 3zM7 14a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm10 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
            </svg>
          </div>
          <div className="leading-tight">
            <div className="font-display tracking-[0.18em] text-white text-sm font-bold">CLEAN STATION</div>
            <div className="font-display tracking-[0.4em] text-white/60 text-[10px]">CAR</div>
          </div>
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
          className="hidden lg:inline-flex items-center gap-2 border border-white/90 text-white px-5 py-2.5 text-[11px] tracking-[0.22em] font-semibold hover:bg-white hover:text-black transition-colors"
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
            className="mt-3 border border-white text-white px-5 py-3 text-xs tracking-[0.22em] font-semibold flex items-center justify-center gap-2"
          >
            <CalendarCheck className="w-4 h-4" /> MARCAR AGORA
          </button>
        </div>
      </div>
    </header>
  );
}
