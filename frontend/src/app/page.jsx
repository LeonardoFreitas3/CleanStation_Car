import Inicio from '../Home';
import { SITE_URL, businessSchema, faqSchema, jsonLd, metadados, seoText } from '../seo';

const seo = seoText('pt');

export const metadata = metadados({
  ...seo,
  url: `${SITE_URL}/`,
  image: `${SITE_URL}/img/banner.jpg`,
  idiomas: { 'pt-PT': `${SITE_URL}/`, en: `${SITE_URL}/`, 'x-default': `${SITE_URL}/` },
});

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(businessSchema('pt'))} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqSchema('pt'))} />
      <Inicio />
    </>
  );
}
