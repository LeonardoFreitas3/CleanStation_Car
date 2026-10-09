import React, { useEffect, useState } from 'react';
import { Cookie, X, ChevronDown, ChevronUp } from 'lucide-react';
import { applyConsent } from '../analytics';
import { useLang } from '../i18n';

const CONSENT_KEY = 'csc_cookie_consent';

export default function CookieBanner({ onOpenPolicy }) {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    // Sem localStorage (janela privada, bloqueado) o aviso aparece de cada vez
    // — é o que há; o site funciona na mesma.
    let stored = null;
    try { stored = localStorage.getItem(CONSENT_KEY); } catch { /* idem */ }
    if (!stored) {
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
    return undefined;
  }, []);

  // Enquanto está à vista, o botão flutuante do WhatsApp esconde-se (index.css):
  // partilhavam o canto e o botão caía em cima do "Aceitar".
  useEffect(() => {
    if (!visible) return undefined;
    document.body.dataset.cookieBanner = '1';
    return () => { delete document.body.dataset.cookieBanner; };
  }, [visible]);

  const save = (acceptAll) => {
    const analyticsAccepted = acceptAll ? true : analytics;
    const consent = {
      necessary: true,
      analytics: analyticsAccepted,
      date: new Date().toISOString(),
    };
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify(consent)); } catch { /* idem */ }
    applyConsent(analyticsAccepted);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div role="region" aria-label={t('cookie.title')} className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-zinc-900 border border-white/15 shadow-2xl">
        {/* Main row */}
        <div className="flex items-start gap-4 p-5">
          <Cookie className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold tracking-wide">
              {t('cookie.title')}
            </p>
            <p className="text-white/60 text-xs mt-1 leading-relaxed">
              {t('cookie.body')}{' '}
              <button onClick={onOpenPolicy} className="py-1 text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors">
                {t('cookie.policy')}
              </button>
            </p>

            {/* Expanded preferences */}
            {expanded && (
              <div className="mt-4 border border-white/10 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white text-xs font-semibold">{t('cookie.necessary')}</div>
                    <div className="text-white/50 text-[11px] mt-0.5">{t('cookie.necessaryDesc')}</div>
                  </div>
                  <div role="switch" aria-checked="true" aria-disabled="true" aria-label={t('cookie.necessary')} className="w-10 h-5 bg-blue-700 rounded-full flex items-center px-1 shrink-0">
                    <div className="w-3 h-3 bg-white rounded-full ml-auto" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white text-xs font-semibold">{t('cookie.analytics')}</div>
                    <div className="text-white/50 text-[11px] mt-0.5">{t('cookie.analyticsDesc')}</div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={analytics}
                    aria-label={t('cookie.analytics')}
                    onClick={() => setAnalytics(v => !v)}
                    className={`w-10 h-5 rounded-full flex items-center px-1 shrink-0 transition-colors ${analytics ? 'bg-blue-700' : 'bg-white/20'}`}
                  >
                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${analytics ? 'ml-auto' : ''}`} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => save(false)}
            className="p-1.5 -m-1.5 text-white/55 hover:text-white transition shrink-0"
            aria-label={t('cookie.declineTitle')}
            title={t('cookie.declineTitle')}
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pb-5 pt-0">
          <button
            onClick={() => setExpanded(v => !v)}
            aria-expanded={expanded}
            className="inline-flex items-center gap-1.5 py-1 text-white/50 hover:text-blue-400 text-[11px] tracking-[0.2em] transition-colors"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {t('cookie.manage')}
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => save(false)}
              className="px-5 py-2.5 text-[11px] tracking-[0.2em] font-semibold border border-white/20 text-white hover:border-blue-500 hover:text-blue-400 transition"
            >
              {t('cookie.decline')}
            </button>
            <button
              onClick={() => save(true)}
              className="px-5 py-2.5 text-[11px] tracking-[0.2em] font-bold bg-blue-700 hover:bg-blue-600 text-white transition"
            >
              {t('cookie.acceptAll')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
