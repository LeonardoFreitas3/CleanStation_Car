'use client';

import React, { Suspense, lazy, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, ChevronRight, LayoutGrid, MessageCircle, Phone, Scale, Tag } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';
import PrivacyPolicy from './PrivacyPolicy';
import TermsConditions from './TermsConditions';
import CookiePolicy from './CookiePolicy';
import CookieBanner from './CookieBanner';
import { LIGACAO, PAGE_BY_SLUG, SERVICE_PAGES, conteudo, nomeDe, orcamentoDe, precoDe, precoServico } from '../servicePages';
import { SERVICES, SITE } from '../mock';
import { useLang } from '../i18n';
import { ancora, inicio, pagina as rotaPagina, prefixo } from '../rotas';

const Booking = lazy(() => import('../booking/Booking'));

/**
 * A página de um serviço.
 *
 * Uma componente para todas: o que muda entre elas é texto, e texto vive em
 * servicePages.js. Escrever quatro páginas à mão era garantir que ao fim de um
 * mês tinham quatro desenhos diferentes e três delas com o botão de marcar no
 * sítio errado.
 *
 * O texto vive em servicePages.js (português) e servicePagesEn.js (inglês); o
 * endereço inglês leva /en/ à frente (rotas.js). O <head> e os dados
 * estruturados são escritos no build, em paginas.jsx.
 */
export default function ServicoPagina({ slug }) {
  const { lang, t, tx } = useLang();
  const router = useRouter();

  const pagina = PAGE_BY_SLUG[slug];
  // O texto na língua escolhida. O preço, a imagem e o slug são os mesmos.
  const page = conteudo(pagina, lang);

  const [booking, setBooking] = useState(false);
  const [legalOpen, setLegalOpen] = useState(null);

  // Voltar só quando há para onde voltar dentro do site. Quem chega de uma
  // pesquisa não tem histórico aqui, e um "voltar" que atira para o Google é
  // pior do que nenhum: nesse caso o botão é "Todos os serviços", que leva à
  // lista. Decidido depois de montar, porque no HTML do build não há browser.
  const [podeVoltar, setPodeVoltar] = useState(false);
  useEffect(() => {
    const nav = window.navigation;
    setPodeVoltar(nav ? nav.canGoBack : document.referrer.startsWith(window.location.origin));
  }, []);

  // A secção pedida no endereço (#traseiros, vindo do cartão da inicial). O
  // Next, ao chegar por um Link, mantinha o scroll da página de onde se veio e
  // o rolar suave do CSS acabava a meio: fica-se a ver preto. Instantâneo e à
  // mão, e o scroll-margin-top trata do menu fixo.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    const el = id && document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  }, [slug]);

  const outros = SERVICE_PAGES.filter((p) => p.slug !== page.slug);
  const preco = precoDe(page);
  // Os polimentos: um "desde", sob orçamento.
  const orcamento = orcamentoDe(page);
  // "(Inclui selante)", por baixo do nome, como no cartão da inicial.
  const nota = tx(SERVICES.find((s) => s.id === pagina.serviceId), 'nota');

  // O polimento não se marca online: o botão abre o WhatsApp com o pedido de
  // orçamento já escrito, como a ficha dele na página inicial. A mensagem vai
  // na língua de quem a escreve.
  const botao = 'inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-7 py-4 text-xs tracking-[0.2em] uppercase font-bold transition';
  const secundario = 'inline-flex items-center gap-2 border border-white/25 hover:border-white/60 text-white/85 hover:text-white px-5 py-4 text-xs tracking-[0.2em] uppercase font-bold transition';
  const waUrl = `https://wa.me/${SITE.phoneRaw}?text=${encodeURIComponent(
    t(pagina.mensagem ?? (page.whatsapp ? 'whatsapp.quoteFor' : 'whatsapp.about'), { servico: nomeDe(pagina, lang) }),
  )}`;
  const botaoWhatsapp = (
    <a href={waUrl} target="_blank" rel="noreferrer" className={botao}>
      <MessageCircle className="w-4 h-4" aria-hidden="true" />
      {page.cta}
    </a>
  );

  // A ação principal e as de recurso, as mesmas em cima e em baixo. Numa
  // lavagem: marcar, ligar, escrever — sem "ver preços", a pedido do cliente: o
  // preço já está nesta página e na marcação. Nas páginas sem preço (detalhe,
  // limpeza interior) o "ver preços" fica. Num serviço sob consulta compara-se
  // com o outro polimento, ou pede-se o orçamento, e liga-se.
  const acao = (
    <div className="flex flex-wrap items-center gap-3">
      {page.whatsapp ? botaoWhatsapp : (
        <button type="button" onClick={() => setBooking(true)} className={botao}>
          {lang === 'en' ? 'Book now' : 'Marcar agora'}
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
      {page.whatsapp ? (
        pagina.comparar && (
          <Link href={rotaPagina(lang, pagina.comparar, '#comparar')} className={secundario}>
            <Scale className="w-4 h-4" aria-hidden="true" />
            {lang === 'en' ? 'Compare polishing' : 'Comparar polimentos'}
          </Link>
        )
      ) : (
        !page.levelId && (
          <Link href={ancora(lang, '#services')} className={secundario}>
            <Tag className="w-4 h-4" aria-hidden="true" />
            {lang === 'en' ? 'See prices' : 'Ver preços'}
          </Link>
        )
      )}
      <a href={`tel:${SITE.phone.replace(/\s/g, '')}`} className={secundario}>
        <Phone className="w-4 h-4" aria-hidden="true" />
        {lang === 'en' ? 'Call' : 'Ligar'}
      </a>
      {!page.whatsapp && (
        <a href={waUrl} target="_blank" rel="noreferrer" className={secundario}>
          <MessageCircle className="w-4 h-4" aria-hidden="true" />
          WhatsApp
        </a>
      )}
    </div>
  );

  return (
    <div className="bg-black text-white min-h-screen">
      <Header />

      <main>
        {/* Cabeçalho com imagem. A fotografia é a que o cartão deste serviço já
            usa na página inicial — quem carregou no cartão reconhece onde
            chegou. */}
        <header className="relative">
          <div className="absolute inset-0">
            <img
              src={page.image}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/60" />
          </div>

          <div className="relative max-w-4xl mx-auto px-6 pt-32 pb-16 md:pt-40 md:pb-20">
            {podeVoltar ? (
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 mb-5 px-4 py-2 border border-white/15 hover:border-white/40 text-white/70 hover:text-white text-[11px] tracking-[0.2em] uppercase transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                {lang === 'en' ? 'Back' : 'Voltar'}
              </button>
            ) : (
              <Link
                href={ancora(lang, '#services')}
                className="inline-flex items-center gap-2 mb-5 px-4 py-2 border border-white/15 hover:border-white/40 text-white/70 hover:text-white text-[11px] tracking-[0.2em] uppercase transition"
              >
                <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />
                {lang === 'en' ? 'All services' : 'Todos os serviços'}
              </Link>
            )}

            <nav aria-label={lang === 'en' ? 'Breadcrumb' : 'Caminho'} className="flex items-center gap-2 text-[11px] tracking-[0.2em] text-white/55 uppercase mb-6">
              <Link href={inicio(lang)} className="hover:text-white transition">{lang === 'en' ? 'Home' : 'Início'}</Link>
              <ChevronRight className="w-3 h-3" aria-hidden="true" />
              <span className="text-white/70" aria-current="page">{nomeDe(pagina, lang)}</span>
            </nav>

            <h1 className="font-display text-white text-3xl md:text-5xl font-black tracking-wide leading-tight">
              {page.h1}
            </h1>
            {nota && <p className="text-blue-300/80 text-sm mt-2">{nota}</p>}
            <span className="accent-bar mt-5 block" />

            <div className="mt-6 space-y-4 max-w-2xl">
              {page.intro.map((p) => (
                <p key={p} className="text-white/65 text-sm md:text-base leading-relaxed"><Texto lang={lang}>{p}</Texto></p>
              ))}
            </div>

            {/* O preço e o botão logo no primeiro ecrã: quem chega de uma
                pesquisa quer saber quanto custa antes de ler o resto. */}
            <div className="mt-8 flex flex-wrap items-center gap-5">
              {(preco || orcamento) && (
                <div>
                  <span className="text-blue-400/80 text-[10px] tracking-[0.3em] uppercase">{lang === 'en' ? 'From' : 'Desde'}</span>
                  <div className="text-white font-display text-4xl font-black">
                    {preco || orcamento}€
                    {orcamento && <span className="text-white/60 font-sans text-sm font-normal"> · {t('services.quoteBased')}</span>}
                  </div>
                  <span className="block text-white/50 text-[10px] tracking-[0.1em]">{t('services.vat')}</span>
                </div>
              )}
              {acao}
            </div>
            {(preco || orcamento) && (
              <p className="text-white/55 text-xs mt-4 max-w-2xl">{t(page.levelId ? 'services.priceNote' : 'services.quoteNote')}</p>
            )}
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-6 py-16 md:py-20 space-y-14">
          {page.sections.map((sec, i) => {
            // O serviço da secção vem da página portuguesa: a tradução troca o
            // texto e mais nada.
            const precoSecao = precoServico(pagina.sections[i]?.servico);
            return (
            // O id, quando existe, é o destino de um cartão da inicial: os
            // faróis dianteiros e traseiros abrem cada um a sua secção.
            <section key={sec.heading} id={sec.id}>
              <h2 className="font-display text-white text-xl md:text-2xl font-black tracking-wide">
                {sec.heading}
              </h2>
              {precoSecao && (
                <p className="text-white/70 text-sm mt-2">
                  {lang === 'en' ? 'From' : 'Desde'} {precoSecao}€ · {t('services.quoteBased')}
                </p>
              )}
              <span className="accent-bar mt-4 block" />

              {sec.entrada && (
                <p className="text-white/60 text-sm mt-6 leading-relaxed"><Texto lang={lang}>{sec.entrada}</Texto></p>
              )}

              {sec.paragrafos?.map((p) => (
                <p key={p} className="text-white/65 text-sm mt-5 leading-relaxed max-w-2xl"><Texto lang={lang}>{p}</Texto></p>
              ))}

              {sec.items && <Lista items={sec.items} />}

              {/* Exterior e interior lado a lado, que é como o cliente pensa no
                  carro: por fora e por dentro. */}
              {sec.grupos && (
                <div className={`grid gap-8 mt-6 ${sec.grupos.length > 2 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
                  {sec.grupos.map((g) => (
                    <div key={g.titulo}>
                      <h3 className="text-white/60 text-[10px] tracking-[0.3em] uppercase">{g.titulo}</h3>
                      <Lista items={g.items} />
                    </div>
                  ))}
                </div>
              )}

              {sec.comparacao && (
                <Comparacao dados={sec.comparacao} colunas={pagina.sections[i].comparacao.colunas} lang={lang} t={t} />
              )}

              {sec.nota && (
                <p className="text-white/50 text-sm mt-6 leading-relaxed max-w-2xl"><Texto lang={lang}>{sec.nota}</Texto></p>
              )}

              {page.whatsapp && i === pagina.ctaApos && <div className="mt-8">{botaoWhatsapp}</div>}
            </section>
            );
          })}

          {pagina.antesDepois?.length > 0 && <AntesDepois fotos={pagina.antesDepois} lang={lang} />}

          {/* ── Perguntas ─────────────────────────────────────────────────── */}
          <section>
            <h2 className="font-display text-white text-xl md:text-2xl font-black tracking-wide">
              {lang === 'en' ? 'Frequently asked questions' : 'Perguntas frequentes'}
            </h2>
            <span className="accent-bar mt-4 block" />
            <dl className="mt-6 divide-y divide-white/10 border-y border-white/10">
              {page.faq.map((f) => (
                <div key={f.q} className="py-5">
                  <dt className="text-white text-sm font-semibold">{f.q}</dt>
                  <dd className="text-white/60 text-sm mt-2 leading-relaxed">{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* ── Marcar ────────────────────────────────────────────────────── */}
          <section className="border border-white/10 bg-[#0e0e0e] rounded-md p-8 text-center">
            <h2 className="font-display text-white text-xl md:text-2xl font-black tracking-wide">
              {page.cta}
            </h2>
            <p className="text-white/50 text-sm mt-3 max-w-md mx-auto">
              {page.whatsapp
                ? page.ctaTexto
                : (lang === 'en'
                  ? 'Online booking with real-time availability. Pick the day and time: the confirmation shows on screen and, if you leave your email, you also get it by email.'
                  : 'Marcação online com disponibilidade em tempo real. Escolhe o dia e a hora: a confirmação aparece no ecrã e, se deixares o email, recebe-la também por email.')}
            </p>
            <div className="mt-6 flex justify-center">{acao}</div>
          </section>

          {/* ── Os outros serviços ────────────────────────────────────────── */}
          <section>
            <h2 className="font-display text-white text-xl md:text-2xl font-black tracking-wide">
              {lang === 'en' ? 'Other services' : 'Outros serviços'}
            </h2>
            <span className="accent-bar mt-4 block" />
            <div className="grid sm:grid-cols-3 gap-4 mt-6">
              {outros.map((o) => (
                <Link
                  key={o.slug}
                  href={rotaPagina(lang, o.slug)}
                  className="group bg-[#0e0e0e] border border-white/10 hover:border-blue-700/60 transition rounded-md overflow-hidden"
                >
                  <div className="relative h-28 overflow-hidden">
                    <img
                      src={o.thumb}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] to-transparent" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-white text-sm font-bold tracking-wider">
                      {nomeDe(o, lang).toUpperCase()}
                    </h3>
                    <div className="mt-2 flex items-baseline justify-between">
                      {/* "Desde": é o preço do carro, como no cartão da inicial. */}
                      <span className="text-white font-display text-lg font-bold">
                        {precoDe(o) || orcamentoDe(o)
                          ? <><span className="text-blue-400/80 text-[9px] tracking-[0.25em] font-sans font-semibold mr-1.5">{t('services.from')}</span>{precoDe(o) || orcamentoDe(o)}€</>
                          : <span className="text-white/60 text-xs font-sans font-normal">{t('services.onRequest')}</span>}
                        {orcamentoDe(o) && <span className="block text-white/55 text-[10px] font-sans font-normal">{t('services.quoteBased')}</span>}
                      </span>
                      <span className="text-white/50 text-[10px] tracking-[0.15em] uppercase">
                        {lang === 'en' ? 'See' : 'Ver'} →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer onLegal={setLegalOpen} />
      <WhatsAppButton />
      <PrivacyPolicy open={legalOpen === 'privacy'} onClose={() => setLegalOpen(null)} />
      <TermsConditions open={legalOpen === 'terms'} onClose={() => setLegalOpen(null)} />
      <CookiePolicy open={legalOpen === 'cookies'} onClose={() => setLegalOpen(null)} />
      <CookieBanner onOpenPolicy={() => setLegalOpen('cookies')} />

      {booking && (
        <Suspense fallback={null}>
          <Booking open nivel={page.levelId} onClose={() => setBooking(false)} onPrivacy={() => setLegalOpen('privacy')} />
        </Suspense>
      )}
    </div>
  );
}

/**
 * Um texto com links para outras páginas do site, escritos como
 * "[texto](/endereco/)". O servicePages.test confirma que cada endereço existe.
 * Em inglês o endereço leva /en à frente: o texto inglês escreve o mesmo
 * endereço que o português, e a língua resolve-se aqui.
 */
function Texto({ children, lang }) {
  return children.split(new RegExp(`(${LIGACAO.source})`)).map((parte, i, partes) => {
    // O split com grupos devolve [antes, link inteiro, texto, endereço, depois…]
    if (i % 4 === 1) return <Link key={i} href={`${prefixo(lang)}${partes[i + 2]}`} className="text-blue-400 hover:text-blue-300 underline underline-offset-4">{partes[i + 1]}</Link>;
    return i % 4 === 0 ? parte : null;
  });
}

/**
 * Os polimentos lado a lado. Uma tabela no computador; no telemóvel três
 * colunas de texto não cabem, e cada polimento passa a ser um cartão com as
 * mesmas linhas. O "desde" vem das colunas da página portuguesa, que trazem o
 * id do serviço — a tradução só troca o texto.
 */
function Comparacao({ dados, colunas, lang, t }) {
  const desde = (j) => `${lang === 'en' ? 'From' : 'Desde'} ${precoServico(colunas[j].servico)}€ · ${t('services.quoteBased')}`;
  const rotuloPreco = lang === 'en' ? 'Price' : 'Preço';
  return (
    <>
      <table className="hidden sm:table w-full mt-6 text-sm border-collapse">
        <thead>
          <tr className="border-b border-white/15">
            <th scope="col" className="w-1/5" />
            {dados.colunas.map((c) => (
              <th key={c.titulo} scope="col" className="text-left font-display text-white font-bold tracking-wider py-3 pr-4">{c.titulo}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dados.linhas.map((l) => (
            <tr key={l.rotulo} className="border-b border-white/10 align-top">
              <th scope="row" className="text-left text-white/50 text-[10px] tracking-[0.2em] uppercase font-normal py-3 pr-4">{l.rotulo}</th>
              {l.valores.map((v) => <td key={v} className="text-white/75 py-3 pr-4 leading-relaxed">{v}</td>)}
            </tr>
          ))}
          <tr className="align-top">
            <th scope="row" className="text-left text-white/50 text-[10px] tracking-[0.2em] uppercase font-normal py-3 pr-4">{rotuloPreco}</th>
            {dados.colunas.map((c, j) => <td key={c.titulo} className="text-white py-3 pr-4 font-semibold">{desde(j)}</td>)}
          </tr>
        </tbody>
      </table>

      <div className="sm:hidden mt-6 space-y-4">
        {dados.colunas.map((c, j) => (
          <div key={c.titulo} className="border border-white/10 bg-[#0e0e0e] rounded-md p-5">
            <h3 className="font-display text-white font-bold tracking-wider">{c.titulo}</h3>
            <p className="text-white text-sm font-semibold mt-1">{desde(j)}</p>
            <dl className="mt-4 space-y-3">
              {dados.linhas.map((l) => (
                <div key={l.rotulo}>
                  <dt className="text-white/50 text-[10px] tracking-[0.2em] uppercase">{l.rotulo}</dt>
                  <dd className="text-white/75 text-sm mt-1 leading-relaxed">{l.valores[j]}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </>
  );
}

/**
 * Fotografias reais de antes e depois. Só existe quando há fotografias: a
 * página nunca mostra a moldura vazia. O quadro tem a proporção fixa para a
 * página não saltar quando a imagem chega.
 */
function AntesDepois({ fotos, lang }) {
  const en = lang === 'en';
  return (
    <section>
      <h2 className="font-display text-white text-xl md:text-2xl font-black tracking-wide">
        {en ? 'Before and after' : 'Antes e depois'}
      </h2>
      <span className="accent-bar mt-4 block" />
      <div className="mt-6 space-y-6">
        {fotos.map((f) => {
          const alt = (en && f.altEn) || f.alt;
          return (
            <div key={f.depois} className="grid grid-cols-2 gap-2">
              {[['antes', en ? 'Before' : 'Antes'], ['depois', en ? 'After' : 'Depois']].map(([k, rotulo]) => (
                <figure key={k} className="relative aspect-[4/3] overflow-hidden rounded-md bg-[#0e0e0e]">
                  <img
                    src={`${process.env.PUBLIC_URL}/img/antes-depois/${f[k]}`}
                    alt={`${rotulo}: ${alt}`}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <figcaption className="absolute top-2 left-2 bg-black/70 text-white text-[10px] tracking-[0.2em] uppercase px-2 py-1">{rotulo}</figcaption>
                </figure>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Lista({ items }) {
  return (
    <ul className="mt-5 space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <span className="w-5 h-5 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
            <Check className="w-3 h-3 text-blue-400" aria-hidden="true" />
          </span>
          <span className="text-white/80 text-sm">{item}</span>
        </li>
      ))}
    </ul>
  );
}
