import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, ChevronRight } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';
import PrivacyPolicy from './PrivacyPolicy';
import TermsConditions from './TermsConditions';
import CookiePolicy from './CookiePolicy';
import CookieBanner from './CookieBanner';
import { PAGE_BY_SLUG, SERVICE_PAGES, conteudo, nomeDe, precoDe } from '../servicePages';
import { SITE_URL, businessSchema } from '../seo';
import { useSeoHead } from '../useSeoHead';
import { useLang } from '../i18n';

const Booking = lazy(() => import('../booking/Booking'));

/**
 * A página de um serviço.
 *
 * Uma componente para as quatro: o que muda entre elas é texto, e texto vive em
 * servicePages.js. Escrever quatro páginas à mão era garantir que ao fim de um
 * mês tinham quatro desenhos diferentes e três delas com o botão de marcar no
 * sítio errado.
 *
 * O texto vive em servicePages.js (português) e servicePagesEn.js (inglês); o
 * endereço é o mesmo nas duas línguas.
 */
export default function ServicoPagina() {
  const { slug } = useParams();
  const { lang } = useLang();
  const navigate = useNavigate();
  const location = useLocation();

  const pagina = PAGE_BY_SLUG[slug];
  // O texto na língua escolhida. O preço, a imagem e o endereço são os mesmos.
  const page = pagina ? conteudo(pagina, lang) : null;

  const [booking, setBooking] = useState(false);
  const [legalOpen, setLegalOpen] = useState(null);

  // Começar no topo. O router não mexe no scroll ao mudar de rota: quem vinha
  // da secção dos serviços — que está a meio da página inicial — aterrava a
  // meio desta, já depois do título. Também corre ao saltar de uma lavagem
  // para outra, no fim da página.
  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  // Um endereço que não existe vai para a página inicial, como o resto do site.
  // Antes do useSeoHead, que não pode correr condicionalmente.
  const url = `${SITE_URL}/${slug}`;

  useSeoHead({
    lang,
    title: page?.title ?? '',
    description: page?.description ?? '',
    canonical: url,
    image: page ? `${SITE_URL}${page.image}` : `${SITE_URL}/img/banner.jpg`,
    jsonLd: page ? {
      'schema-localbusiness': businessSchema(lang),
      'schema-service': {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: nomeDe(pagina, lang),
        serviceType: nomeDe(pagina, lang),
        description: page.description,
        url,
        provider: { '@type': 'AutoWash', name: 'Clean Station Car', url: SITE_URL },
        areaServed: { '@type': 'City', name: 'Braga' },
        offers: {
          '@type': 'Offer',
          price: precoDe(page),
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
          url,
        },
      },
      'schema-faq': {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: page.faq.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      'schema-breadcrumb': {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: lang === 'en' ? 'Home' : 'Início', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: nomeDe(pagina, lang), item: url },
        ],
      },
    } : {},
  });

  if (!page) return <Navigate to="/" replace />;

  const outros = SERVICE_PAGES.filter((p) => p.slug !== page.slug);

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
              alt={page.h1}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/60" />
          </div>

          <div className="relative max-w-4xl mx-auto px-6 pt-32 pb-16 md:pt-40 md:pb-20">
            {/* Voltar para onde se veio, quando se veio de dentro do site.
                O location.key é 'default' na primeira página de uma visita —
                quem chegou de uma pesquisa não tem para onde recuar, e um
                "voltar" que atira para fora do site é pior do que nenhum.
                Nesse caso leva à página inicial, que é o que ele quer dizer. */}
            <button
              type="button"
              onClick={() => (location.key === 'default' ? navigate('/') : navigate(-1))}
              className="inline-flex items-center gap-2 mb-5 px-4 py-2 border border-white/15 hover:border-white/40 text-white/70 hover:text-white text-[11px] tracking-[0.2em] uppercase transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              {lang === 'en' ? 'Back' : 'Voltar'}
            </button>

            <nav aria-label={lang === 'en' ? 'Breadcrumb' : 'Caminho'} className="flex items-center gap-2 text-[11px] tracking-[0.2em] text-white/40 uppercase mb-6">
              <Link to="/" className="hover:text-white transition">{lang === 'en' ? 'Home' : 'Início'}</Link>
              <ChevronRight className="w-3 h-3" aria-hidden="true" />
              <span className="text-white/70">{nomeDe(pagina, lang)}</span>
            </nav>

            <h1 className="font-display text-white text-3xl md:text-5xl font-black tracking-wide leading-tight">
              {page.h1}
            </h1>
            <span className="accent-bar mt-5 block" />

            <div className="mt-6 space-y-4 max-w-2xl">
              {page.intro.map((p) => (
                <p key={p} className="text-white/65 text-sm md:text-base leading-relaxed">{p}</p>
              ))}
            </div>

            {/* O preço e o botão logo no primeiro ecrã: quem chega de uma
                pesquisa quer saber quanto custa antes de ler o resto. */}
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <div>
                <span className="text-blue-400/80 text-[10px] tracking-[0.3em] uppercase">{lang === 'en' ? 'From' : 'Desde'}</span>
                <div className="text-white font-display text-4xl font-black">{precoDe(page)}€</div>
              </div>
              <button
                type="button"
                onClick={() => setBooking(true)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-7 py-4 text-xs tracking-[0.2em] uppercase font-bold transition"
              >
                {page.cta}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-6 py-16 md:py-20 space-y-14">
          {page.sections.map((sec) => (
            <section key={sec.heading}>
              <h2 className="font-display text-white text-xl md:text-2xl font-black tracking-wide">
                {sec.heading}
              </h2>
              <span className="accent-bar mt-4 block" />

              {sec.entrada && (
                <p className="text-white/60 text-sm mt-6 leading-relaxed">{sec.entrada}</p>
              )}

              {sec.paragrafos?.map((p) => (
                <p key={p} className="text-white/65 text-sm mt-5 leading-relaxed max-w-2xl">{p}</p>
              ))}

              {sec.items && <Lista items={sec.items} />}

              {/* Exterior e interior lado a lado, que é como o cliente pensa no
                  carro: por fora e por dentro. */}
              {sec.grupos && (
                <div className="grid sm:grid-cols-2 gap-8 mt-6">
                  {sec.grupos.map((g) => (
                    <div key={g.titulo}>
                      <h3 className="text-white/45 text-[10px] tracking-[0.3em] uppercase">{g.titulo}</h3>
                      <Lista items={g.items} />
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}

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
              {lang === 'en'
                ? 'Online booking with real-time availability. Pick the day and time and you get the confirmation by email.'
                : 'Marcação online com disponibilidade em tempo real. Escolhe o dia e a hora e recebes a confirmação por email.'}
            </p>
            <button
              type="button"
              onClick={() => setBooking(true)}
              className="mt-6 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-7 py-4 text-xs tracking-[0.2em] uppercase font-bold transition"
            >
              {page.cta}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </section>

          {/* ── As outras lavagens ────────────────────────────────────────── */}
          <section>
            <h2 className="font-display text-white text-xl md:text-2xl font-black tracking-wide">
              {lang === 'en' ? 'Other washes' : 'Outras lavagens'}
            </h2>
            <span className="accent-bar mt-4 block" />
            <div className="grid sm:grid-cols-3 gap-4 mt-6">
              {outros.map((o) => (
                <Link
                  key={o.slug}
                  to={`/${o.slug}`}
                  className="group bg-[#0e0e0e] border border-white/10 hover:border-blue-700/60 transition rounded-md overflow-hidden"
                >
                  <div className="relative h-28 overflow-hidden">
                    <img
                      src={o.image}
                      alt={nomeDe(o, lang)}
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
                      <span className="text-white font-display text-lg font-bold">{precoDe(o)}€</span>
                      <span className="text-white/35 text-[10px] tracking-[0.15em] uppercase">
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
          <Booking open onClose={() => setBooking(false)} />
        </Suspense>
      )}
    </div>
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
