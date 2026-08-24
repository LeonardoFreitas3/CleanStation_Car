import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Logo from './Logo';
import { useLang } from '../i18n';

/**
 * Janela das páginas legais.
 *
 * Assente no <dialog> do browser em vez de uma div por cima de tudo, porque
 * traz de graça o que a versão à mão não tinha: fecha com Escape, prende o
 * teclado lá dentro (sem isso o Tab passeava pelo site por trás da janela),
 * devolve o foco a quem a abriu ao fechar, e trata o resto da página como
 * inerte. Menos código do que implementar cada uma dessas coisas.
 */
export default function LegalModal({ open, onClose, title, children }) {
  const { t } = useLang();

  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    // showModal() é o que põe a janela na camada de topo, prende o teclado e
    // torna o resto inerte. open={true} no JSX abriria a janela sem nada disso.
    if (!el.open) el.showModal();

    // O Escape fecha o <dialog> sem passar por nenhum onClick nosso. Sem avisar
    // o React, ele continuava a achar a janela aberta e ela não voltava a abrir.
    //
    // O ouvinte é posto no próprio elemento e não pela prop onClose do JSX: o
    // evento 'close' não borbulha, e a delegação de eventos do React depende
    // disso. Não consegui exercitar o Escape no browser de automação, portanto
    // isto é a via segura e não a que sobrou de um teste.
    const onNativeClose = () => onClose();
    el.addEventListener('close', onNativeClose);

    // A camada de topo torna o fundo inerte mas não impede a roda do rato de
    // o rolar por baixo.
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      el.removeEventListener('close', onNativeClose);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  // Fechar passa sempre pelo close() do browser antes de desmontar: é ele que
  // devolve o foco a quem abriu a janela. Tirar o elemento do DOM primeiro
  // deixava o foco no body, e quem navega por teclado voltava ao topo da
  // página em vez de ao botão em que carregou. O onClose a seguir pode chegar
  // duas vezes (o ouvinte do 'close' também o chama) e isso não faz mal.
  const dismiss = () => { ref.current?.close(); onClose(); };

  if (!open) return null;

  return (
    <dialog
      ref={ref}
      aria-label={title}
      // Carregar fora da janela fecha-a. O alvo só é o próprio <dialog> quando
      // o clique cai no fundo: o conteúdo está todo na div de dentro.
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
      // w-[calc(100%-2rem)] e nao w-full: o <dialog> centra-se sozinho, mas sem
      // isto encostava as duas margens no telemovel.
      className="m-auto w-[calc(100%-2rem)] max-w-3xl max-h-[90vh] p-0 bg-transparent backdrop:bg-black/85 backdrop:backdrop-blur-sm"
    >
      <div className="bg-zinc-900 border border-white/10 text-white flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-zinc-900 z-10">
          <div className="flex items-center gap-4">
            <Logo size={32} />
            <div className="font-display text-sm font-bold tracking-[0.2em] text-white/80">
              {title.toUpperCase()}
            </div>
          </div>
          <button
            onClick={dismiss}
            aria-label={t('legal.close')}
            className="w-9 h-9 border border-white/15 hover:border-blue-500 hover:bg-blue-900/30 hover:text-blue-400 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-8 prose prose-invert prose-sm max-w-none
          prose-headings:font-display prose-headings:tracking-wide prose-headings:text-white
          prose-p:text-white/70 prose-li:text-white/70 prose-strong:text-white">
          {children}
        </div>
      </div>
    </dialog>
  );
}
