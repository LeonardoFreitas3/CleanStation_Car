// As páginas do site, nas duas línguas.
//
// Cada ficheiro em app/ é uma linha: chama uma destas com a língua. O <head>,
// os dados estruturados e o canonical saem daqui, uma vez — a versão anterior
// tinha isto escrito em cada página, e o inglês ficou com o canonical do
// português sem ninguém dar por isso.

import Inicio from './Home';
import ServicoPagina from './components/ServicoPagina';
import { PAGE_BY_SLUG, SERVICE_PAGES, conteudo, nomeDe, precoDe } from './servicePages';
import { SITE_URL, businessSchema, faqSchema, jsonLd, metadados, seoText } from './seo';
import { pagina as rotaPagina, prefixo } from './rotas';

export const slugs = () => SERVICE_PAGES.map((p) => ({ slug: p.slug }));

export function metadataInicial(lang) {
  return metadados({
    ...seoText(lang),
    caminho: '/',
    lang,
    image: `${SITE_URL}/img/banner.jpg`,
  });
}

export function PaginaInicial({ lang }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(businessSchema(lang))} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqSchema(lang))} />
      <Inicio />
    </>
  );
}

export function metadataServico(slug, lang) {
  const page = conteudo(PAGE_BY_SLUG[slug], lang);
  return metadados({
    title: page.title,
    description: page.description,
    caminho: `/${slug}/`,
    lang,
    image: `${SITE_URL}/img/${encodeURI(page.ogImage)}`,
  });
}

export function PaginaServico({ slug, lang }) {
  const pagina = PAGE_BY_SLUG[slug];
  const page = conteudo(pagina, lang);
  const url = `${SITE_URL}${rotaPagina(lang, slug)}`;
  const nome = nomeDe(pagina, lang);
  const preco = precoDe(pagina);

  const dados = [
    businessSchema(lang),
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: nome,
      serviceType: nome,
      description: page.description,
      url,
      // O @id liga o serviço ao negócio descrito no businessSchema, em vez de
      // o Google ver duas empresas com o mesmo nome.
      provider: { '@id': `${SITE_URL}/#business` },
      areaServed: { '@type': 'City', name: 'Braga' },
      // Sem preço de tabela (detalhe, limpeza interior, polimento) não há
      // oferta: anunciar um valor que não se pratica é pior do que nenhum.
      // Com preço, é o "desde" do carro, com IVA — como no cartão.
      ...(preco && {
        offers: {
          '@type': 'Offer',
          price: preco,
          priceCurrency: 'EUR',
          priceSpecification: {
            '@type': 'PriceSpecification',
            minPrice: preco,
            priceCurrency: 'EUR',
            valueAddedTaxIncluded: true,
          },
          availability: 'https://schema.org/InStock',
          url,
        },
      }),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: lang === 'en' ? 'Home' : 'Início', item: `${SITE_URL}${prefixo(lang)}/` },
        { '@type': 'ListItem', position: 2, name: nome, item: url },
      ],
    },
  ];

  return (
    <>
      {dados.map((d) => (
        <script key={d['@type']} type="application/ld+json" dangerouslySetInnerHTML={jsonLd(d)} />
      ))}
      <ServicoPagina slug={slug} />
    </>
  );
}
