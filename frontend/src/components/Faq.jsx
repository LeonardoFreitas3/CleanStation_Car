import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLang } from '../i18n';
import { faqItems } from '../seo';

/**
 * Perguntas frequentes.
 *
 * Existe por duas razões, e ambas contam. Para quem visita, responde ao que
 * as pessoas perguntam antes de marcar. Para o Google e para os sistemas de
 * IA, é texto factual e direto sobre morada, horário, preços e prazos — que é
 * exatamente o que eles procuram para responder a "lavagem de carros em
 * Braga".
 *
 * O conteúdo tem de estar VISÍVEL: schema de FAQ sem texto à vista viola as
 * regras do Google e pode custar os resultados enriquecidos todos.
 */
export default function Faq() {
  const { lang, t } = useLang();
  const items = faqItems(lang);
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="bg-black py-24 md:py-32 border-t border-white/5">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="font-display text-white text-3xl md:text-5xl font-black tracking-wide">
            {t('faq.title')}
          </h2>
          <span className="accent-bar mx-auto mt-5" />
        </div>

        <dl className="divide-y divide-white/10 border-y border-white/10">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q}>
                <dt>
                  <button
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-4 py-5 text-left group"
                  >
                    <span className="text-white text-base group-hover:text-blue-300 transition">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-blue-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                </dt>
                {/* Renderizado sempre, escondido por altura: assim o texto
                    existe no HTML para quem o lê por máquina, mesmo fechado. */}
                <dd className={`overflow-hidden transition-all ${isOpen ? 'max-h-40 pb-5' : 'max-h-0'}`}>
                  <p className="text-white/60 text-sm leading-relaxed pr-8">{item.a}</p>
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
