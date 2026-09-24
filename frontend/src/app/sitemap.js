import { SERVICE_PAGES } from '../servicePages';
import { SITE_URL } from '../seo';

export const dynamic = 'force-static';

// Gerado e nao escrito a mao: uma pagina nova que ficasse de fora do sitemap
// era uma pagina que o Google demorava semanas a encontrar, sem nada a apontar
// o erro.
export default function sitemap() {
  return [
    { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 },
    ...SERVICE_PAGES.map((p) => ({ url: `${SITE_URL}/${p.slug}/`, changeFrequency: 'weekly', priority: 0.8 })),
  ];
}
