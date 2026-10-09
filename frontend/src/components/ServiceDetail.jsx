import React from 'react';
import { X, Check, MessageCircle } from 'lucide-react';
import { PACK_CONDICOES, PACK_CONDICOES_EN, SITE } from '../mock';
import { useLang } from '../i18n';
import useModalDialog from '../useModalDialog';

/**
 * A ficha de um serviço sem página própria — hoje, os packs.
 *
 * Um <dialog> nativo, como as páginas legais: o Escape fecha, o foco fica lá
 * dentro e volta a quem abriu. Era uma div por cima da página, que o teclado
 * atravessava e que nenhum leitor de ecrã sabia que estava aberta.
 */
export default function ServiceDetail({ service, open, onClose }) {
  const { t, tx, lang } = useLang();
  const { ref, dismiss } = useModalDialog(open, onClose);

  if (!open || !service) return null;
  const Icon = service.icon;
  const includes = tx(service, 'includes') || service.includes;

  // Um pack marca-se; os outros serviços orçamentam-se. Muda o rótulo do botão,
  // a nota do rodapé e a mensagem que segue no WhatsApp — não adianta o botão
  // dizer "Marcar" e a mensagem pedir um orçamento. A mensagem vai na língua
  // de quem a escreve.
  const isPack = service.category === 'packs';
  const waMsg = encodeURIComponent(t(isPack ? 'whatsapp.book' : 'whatsapp.quoteFor', { servico: tx(service, 'title') }));
  const waUrl = `https://wa.me/${SITE.phoneRaw}?text=${waMsg}`;
  const condicoes = isPack ? (lang === 'en' ? PACK_CONDICOES_EN : PACK_CONDICOES) : null;

  return (
    <dialog
      ref={ref}
      aria-label={tx(service, 'title')}
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
      className="m-auto w-[calc(100%-2rem)] max-w-2xl max-h-[92vh] p-0 bg-transparent backdrop:bg-black/80 backdrop:backdrop-blur-sm"
    >
      <div className="relative w-full bg-zinc-900 border border-white/10 text-white max-h-[92vh] flex flex-col">
        {/* Hero image */}
        <div className="relative h-48 sm:h-64 overflow-hidden flex-shrink-0">
          <img
            src={service.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-black/50 to-transparent" />
          <button
            type="button"
            onClick={dismiss}
            aria-label={t('serviceDetail.close')}
            className="absolute top-4 right-4 w-9 h-9 bg-black/60 border border-white/20 hover:border-blue-500 hover:bg-blue-900/40 flex items-center justify-center transition z-10"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
          <div className="absolute bottom-4 left-5 right-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 border border-white/20 bg-black/40 flex items-center justify-center">
                <Icon className="w-5 h-5 text-blue-400" strokeWidth={1.4} aria-hidden="true" />
              </div>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-black tracking-wide leading-tight">
              {tx(service, 'title')}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-6">
          <p className="text-white/60 text-sm leading-relaxed">
            {tx(service, 'desc')}
          </p>

          {includes && includes.length > 0 && (
            <div className="mt-6">
              <div className="text-white/55 text-[10px] tracking-[0.3em] mb-4">
                {t('serviceDetail.includes')}
              </div>
              <ul className="space-y-2.5">
                {includes.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-blue-400" aria-hidden="true" />
                    </div>
                    <span className="text-white/80 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* As condições do pack: só o que já está decidido (mock.js). */}
          {condicoes && (
            <div className="mt-6">
              <div className="text-white/55 text-[10px] tracking-[0.3em] mb-3">
                {t('serviceDetail.conditions')}
              </div>
              <ul className="space-y-2 text-white/55 text-xs leading-relaxed list-disc pl-4">
                {condicoes.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </div>
          )}

          {!isPack && (
            <div className="mt-6 text-white/55 text-xs italic">
              {t('serviceDetail.note')}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-4 border-t border-white/10 flex items-center justify-between gap-4 flex-shrink-0">
          <div>
            {service.onRequest ? (
              <div className="text-white font-display text-xl sm:text-2xl font-bold">
                {t('services.onRequest')}
              </div>
            ) : (
              <>
                <span className="text-blue-400/80 text-[9px] tracking-[0.3em]">{t('serviceDetail.from')}</span>
                <div className="text-white font-display text-2xl sm:text-3xl font-bold">{service.price}€</div>
              </>
            )}
          </div>
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 text-xs tracking-[0.22em] font-bold bg-emerald-700 hover:bg-emerald-600 text-white transition"
          >
            <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
            {isPack ? t('serviceDetail.book') : t('serviceDetail.whatsapp')}
          </a>
        </div>
      </div>
    </dialog>
  );
}
