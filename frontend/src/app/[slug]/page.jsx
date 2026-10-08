import ServicoPagina from '../../components/ServicoPagina';
import { PAGE_BY_SLUG, SERVICE_PAGES, nomeDe, precoDe } from '../../servicePages';
import { SITE_URL, businessSchema, jsonLd, metadados } from '../../seo';

// Uma página por lavagem, geradas no build. Um endereço que não esteja aqui cai
// no not-found, que manda para a inicial.
export const dynamicParams = false;
export const generateStaticParams = () => SERVICE_PAGES.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }) {
  const page = PAGE_BY_SLUG[(await params).slug];
  return metadados({
    title: page.title,
    description: page.description,
    url: `${SITE_URL}/${page.slug}/`,
    image: `${SITE_URL}/img/${encodeURI(page.ogImage)}`,
  });
}

export default async function Page({ params }) {
  const { slug } = await params;
  const page = PAGE_BY_SLUG[slug];
  const url = `${SITE_URL}/${slug}/`;
  const nome = nomeDe(page, 'pt');
  const preco = precoDe(page);

  const dados = [
    businessSchema('pt'),
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
      ...(preco && {
        offers: {
          '@type': 'Offer',
          price: preco,
          priceCurrency: 'EUR',
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
        { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
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
