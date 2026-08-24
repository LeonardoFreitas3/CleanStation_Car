import React from 'react';
import { X } from 'lucide-react';
import Logo from './Logo';
import { useLang } from '../i18n';
import useModalDialog from '../useModalDialog';

/**
 * Janela das páginas legais. Só se lê, portanto o Escape fecha sem perguntar.
 */
export default function LegalModal({ open, onClose, title, children }) {
  const { t } = useLang();
  const { ref, dismiss } = useModalDialog(open, onClose);

  if (!open) return null;

  return (
    <dialog
      ref={ref}
      aria-label={title}
      // Carregar fora da janela fecha-a. O alvo só é o próprio <dialog> quando
      // o clique cai no fundo: o conteúdo está todo na div de dentro.
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
      // w-[calc(100%-2rem)] e não w-full: o <dialog> centra-se sozinho, mas sem
      // isto encostava às duas margens no telemóvel.
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
