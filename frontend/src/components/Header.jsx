import React, { useEffect, useState } from 'react';
import { Menu, X, Globe } from 'lucide-react';
import Logo from './Logo';
import { useLang } from '../i18n';
import { useLocation } from 'react-router-dom';
import { TESTIMONIALS } from '../mock';
import { PAGE_BY_SLUG } from '../servicePages';
import { seccaoAtiva } from '../menu';

// Pela ordem por que se encontram a descer a página, e não por uma ordem
// inventada aqui: o menu dizia SERVIÇOS antes de TESTEMUNHOS e a página tem os
// testemunhos primeiro. A descer, o sublinhado saltava para trás no meio do
// caminho e o menu parecia baralhado.
//
// A secção de testemunhos não existe enquanto não houver avaliações reais
// (ver Testimonials.jsx). Sem este filtro o menu tinha um link que não levava
// a lado nenhum — carregar nele não fazia nada.
const LINKS = [
  { href: '#home',         key: 'nav.home' },
  { href: '#testimonials', key: 'nav.testimonials', only: TESTIMONIALS.length > 0 },
  { href: '#services',     key: 'nav.services' },
  { href: '#about',        key: 'nav.about' },
  { href: '#faq',          key: 'nav.faq' },
  { href: '#contact',      key: 'nav.contact' },
].filter((l) => l.only !== false);

export default function Header() {
  const { t, lang, setLang } = useLang();
  // Numa pagina de servico as ancoras da pagina inicial nao existem, e
  // "#servicos" nao ia a lado nenhum. Levam a barra a frente: sai-se da pagina,
  // vai-se a inicial e cai-se na seccao. O PUBLIC_URL e por causa da copia de
  // teste, que vive numa subpasta.
  const { pathname } = useLocation();
  const ancora = (href) => (pathname === '/' ? href : `${process.env.PUBLIC_URL}/${href}`);

  // Uma página de serviço é uma secção do site que ficou com endereço próprio.
  // Quem lá está veio dos serviços e é isso que o menu tem de dizer — senão
  // fica sem nada aceso e a pessoa não sabe onde está.
  const numServico = Boolean(PAGE_BY_SLUG[pathname.replace(/^\//, '')]);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('#home');
  const toggleLang = () => setLang(lang === 'pt' ? 'en' : 'pt');

  const aceso = numServico ? '#services' : active;

  /**
   * Onde é que se está, a descer a página.
   *
   * Era um IntersectionObserver e o resultado dependia da ordem por que os
   * avisos chegavam: com duas secções à vista ao mesmo tempo — e há sempre duas
   * — ficava acesa a última a avisar, que tanto podia ser a de cima como a de
   * baixo. O sublinhado saltava para a frente e para trás sem a página ter
   * mudado de sítio.
   *
   * Agora é uma conta e não uma corrida: a secção acesa é a última que já
   * passou a linha, medida a cada scroll. As secções são ordenadas pela posição
   * real na página e não pela ordem do menu — assim mexer no menu não pode
   * partir isto.
   */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);

      const seccoes = LINKS
        .map((l) => ({ href: l.href, el: document.getElementById(l.href.slice(1)) }))
        .filter((s) => s.el)
        .map((s) => ({ href: s.href, top: s.el.getBoundingClientRect().top }));

      // A regra vive no menu.js, onde se testa sem levantar um browser.
      // A um terço do ecrã: uma secção conta como "onde se está" quando o seu
      // topo já subiu acima dessa linha, e não quando assoma no fundo.
      const atual = seccaoAtiva(seccoes, {
        linha: window.innerHeight / 3,
        noFundo: window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2,
      });

      // Numa página de serviço não há nenhuma delas: quem manda é o numServico.
      if (atual) setActive(atual);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/85 backdrop-blur-md border-b border-white/5 py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <a href={ancora('#home')} className="flex items-center gap-3 group">
          <Logo size={52} />
        </a>

        <nav className="hidden lg:flex items-center gap-8">
          {LINKS.map(l => (
            <a
              key={l.href}
              href={ancora(l.href)}
              aria-current={aceso === l.href ? 'true' : undefined}
              className={`text-[12px] tracking-[0.18em] font-medium transition relative pb-1 ${
                aceso === l.href ? 'text-white' : 'text-white/65 hover:text-blue-400'
              }`}
            >
              {t(l.key)}
              <span className={`absolute left-0 right-0 -bottom-0.5 h-[2px] bg-blue-600 transition-all ${aceso === l.href ? 'opacity-100' : 'opacity-0'}`} />
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
              href={ancora(l.href)}
              onClick={() => setOpen(false)}
              aria-current={aceso === l.href ? 'true' : undefined}
              className={`py-3 text-sm tracking-[0.2em] border-b border-white/5 ${
                aceso === l.href ? 'text-blue-400 font-semibold' : 'text-white/80'
              }`}
            >
              {t(l.key)}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
