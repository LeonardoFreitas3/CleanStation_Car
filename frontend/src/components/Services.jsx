import React, { useState } from 'react';
import Link from 'next/link';
import { Check, Minus } from 'lucide-react';
import { SERVICES, CATEGORIES } from '../mock';
import { COMPARACAO, WASH_LEVELS, minPrice } from '../booking/pricing';
import { PAGE_BY_SERVICE, PAGE_BY_SLUG, conteudo } from '../servicePages';
import { pagina as rotaPagina } from '../rotas';
import { useLang } from '../i18n';
import ServiceDetail from './ServiceDetail';

// As páginas que respondem às pesquisas principais, por esta ordem. O texto do
// link é o título de cada uma — é a frase que se quer que o Google associe ao
// endereço.
const DESTAQUES = [
  'lavagem-automovel-braga',
  'detalhe-automovel-braga',
  'limpeza-interior-automovel-braga',
  'polimento-automovel-braga',
  'polimento-farois-braga',
].map((slug) => PAGE_BY_SLUG[slug]);

// As linhas da comparação em inglês, pela mesma ordem do pricing.js.
const COMPARACAO_EN = [
  'Interior and exterior cleaning',
  'Sealant on the paint',
  'Detailed interior cleaning',
  'Glass decontamination',
  'Premium sealant',
  'Seat removal and sanitising',
  'Paint decontamination',
  'Deep wheel and tyre cleaning',
];

/**
 * As quatro lavagens lado a lado. É a resposta a "qual a diferença?": cada
 * linha é uma coisa que se faz ao carro, cada coluna uma lavagem, e um visto
 * diz se está incluída. Os dados vêm do pricing.js, como os preços.
 */
function Comparacao() {
  const { t, lang } = useLang();
  const niveis = WASH_LEVELS.map((l) => ({
    ...l,
    nome: SERVICES.find((s) => s.priceByVehicle === l.prices),
  }));

  return (
    <div className="mb-16">
      <h4 className="font-display text-white text-lg md:text-xl font-black tracking-widest text-center">
        {t('services.compareTitle')}
      </h4>
      <p className="text-white/60 text-xs text-center mt-2">{t('services.compareNote')}</p>
      <div className="mt-6 overflow-x-auto -mx-6 px-6">
        <table className="w-full min-w-[560px] text-sm border-collapse">
          <caption className="sr-only">{t('services.compareTitle')}</caption>
          <thead>
            <tr className="border-b border-white/15">
              <th scope="col" className="text-left py-3 pr-3 text-white/55 text-[10px] tracking-[0.25em] font-semibold uppercase">
                {lang === 'en' ? 'Included' : 'Incluído'}
              </th>
              {niveis.map((n) => (
                <th key={n.id} scope="col" className="py-3 px-2 text-center align-bottom">
                  <span className="block font-display text-white text-[11px] md:text-xs font-bold tracking-wider leading-snug">
                    {lang === 'en' ? n.nome?.titleEn : n.label.replace(/^Lavagem /, '')}
                  </span>
                  <span className="block text-blue-400/80 text-[9px] tracking-[0.25em] mt-1">{t('services.from')}</span>
                  <span className="block text-white font-display text-base font-bold">{minPrice(n.id)}€</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARACAO.map((linha, i) => (
              <tr key={linha.label} className="border-b border-white/10">
                <th scope="row" className="text-left py-3 pr-3 text-white/75 text-xs font-normal">
                  {lang === 'en' ? COMPARACAO_EN[i] : linha.label}
                </th>
                {niveis.map((n) => {
                  const tem = linha.niveis.includes(n.id);
                  return (
                    <td key={n.id} className="py-3 px-2 text-center">
                      {tem
                        ? <Check className="w-4 h-4 text-blue-400 inline" aria-hidden="true" />
                        : <Minus className="w-4 h-4 text-white/15 inline" aria-hidden="true" />}
                      <span className="sr-only">{tem ? (lang === 'en' ? 'Included' : 'Incluído') : (lang === 'en' ? 'Not included' : 'Não incluído')}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-white/50 text-[11px] text-center mt-4">{t('services.priceNote')} {t('services.vat')}.</p>
    </div>
  );
}

export default function Services() {
  const { t, tx, lang } = useLang();
  const [detailService, setDetailService] = useState(null);

  return (
    <section id="services" className="section-dark-gray relative py-24 md:py-32 border-y border-white/10">
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="text-center mb-16">
          <h2 className="font-display text-white text-4xl md:text-5xl font-black tracking-wide">
            {t('services.title')}
          </h2>
          <span className="accent-bar mx-auto mt-5" />
          <p className="text-white/55 mt-4 max-w-2xl mx-auto text-sm">
            {t('services.subtitle')}
          </p>
          <nav aria-label={lang === 'en' ? 'Services' : 'Serviços'} className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2">
            {DESTAQUES.map((p) => (
              <Link key={p.slug} href={rotaPagina(lang, p.slug)} className="py-1 text-blue-400 hover:text-blue-300 text-xs tracking-[0.15em] underline underline-offset-4">
                {conteudo(p, lang).h1}
              </Link>
            ))}
          </nav>
        </div>

        {CATEGORIES.map((cat) => {
          const catServices = SERVICES.filter(s => s.category === cat.id);
          if (!catServices.length) return null;
          const CatIcon = cat.icon;
          return (
            <div key={cat.id} className="mb-16 last:mb-0">
              <div className="flex items-center gap-4 mb-8">
                <CatIcon className="w-6 h-6 text-blue-400 shrink-0" strokeWidth={1.4} />
                <div>
                  <h3 className="font-display text-white text-xl md:text-2xl font-black tracking-widest">
                    {tx(cat, 'label')}
                  </h3>
                  <p className="text-white/55 text-xs tracking-[0.3em] mt-0.5">{tx(cat, 'subtitle')}</p>
                </div>
                <span className="flex-1 h-px bg-gradient-to-r from-blue-600/40 to-transparent ml-4" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {catServices.map((s, i) => {
                  const Icon = s.icon;
                  // As lavagens e os polimentos tem pagina propria: o cartao leva la, e e um
                  // link a serio — o Google segue-o e quem carrega com o botao
                  // do meio abre noutro separador. Os packs continuam
                  // a abrir a ficha em modal, que e tudo o que ha para mostrar —
                  // num botao a serio, que o teclado alcanca.
                  const pagina = PAGE_BY_SERVICE[s.id];
                  // Um cartão pode abrir uma secção da página (os faróis
                  // dianteiros e traseiros partilham a página).
                  const hash = pagina?.ancoras?.[s.id] ? `#${pagina.ancoras[s.id]}` : '';
                  const Caixa = pagina ? Link : 'button';
                  const props = pagina
                    ? { href: rotaPagina(lang, pagina.slug, hash) }
                    : { type: 'button', onClick: () => setDetailService(s) };

                  return (
                    <Caixa
                      key={s.id}
                      {...props}
                      className="group relative overflow-hidden bg-[#0e0e0e] border border-white/10 hover:border-blue-700/60 focus-visible:border-blue-500 outline-none transition-all duration-500 flex flex-col rounded-md cursor-pointer text-left w-full"
                      style={{ animationDelay: `${i * 0.08}s` }}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={s.image}
                          alt={tx(s, 'title')}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] group-hover:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-black/40 to-transparent" />
                      </div>

                      <div className="px-6 pt-5 flex justify-center">
                        <Icon className="w-6 h-6 text-blue-400" strokeWidth={1.4} />
                      </div>

                      <div className="px-6 pt-3 pb-6 text-center flex-1 flex flex-col">
                        <h4 className="font-display text-white text-sm font-bold tracking-wider leading-snug">
                          {tx(s, 'title')}
                        </h4>
                        <p className="text-white/50 text-xs mt-2 leading-relaxed flex-1">
                          {tx(s, 'desc')}
                        </p>

                        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                          <div className="text-left">
                            {/* Polimentos não têm preço de tabela: dependem do
                                estado da pintura e são orçamentados à vista. */}
                            {s.onRequest ? (
                              <div className="text-white font-display text-base font-bold">
                                {t('services.onRequest')}
                              </div>
                            ) : (
                              <>
                                {/* "DESDE" em tudo o que tem preço: lavagens e
                                    packs variam com o porte da viatura. */}
                                <span className="text-blue-400/80 text-[9px] tracking-[0.3em]">{t('services.from')}</span>
                                <div className="text-white font-display text-xl font-bold">{s.price}€</div>
                              </>
                            )}
                          </div>
                          <span className="text-white/55 text-[10px] tracking-[0.15em]">
                            {s.onRequest ? t('services.quote') : pagina ? t('services.seePage') : t('services.contact')} →
                          </span>
                        </div>
                      </div>
                    </Caixa>
                  );
                })}
              </div>

              {cat.id === 'lavagens' && (
                <div className="mt-12">
                  <Comparacao />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ServiceDetail
        service={detailService}
        open={!!detailService}
        onClose={() => setDetailService(null)}
      />
    </section>
  );
}
