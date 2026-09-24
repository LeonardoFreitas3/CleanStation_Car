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
    url: `${SITE_URL}/${page.slug}`,
    image: `${SITE_URL}${encodeURI(page.image)}`,
  });
}

export default async function Page({ params }) {
  const { slug } = await params;
  const page = PAGE_BY_SLUG[slug];
  const url = `${SITE_URL}/${slug}`;
  const nome = nomeDe(page, 'pt');

  const dados = [
    businessSchema('pt'),
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: nome,
      serviceType: nome,
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
