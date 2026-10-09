import { SERVICE_PAGES } from '../servicePages';
import { SITE_URL, idiomasDe } from '../seo';

export const dynamic = 'force-static';

// Gerado e nao escrito a mao: uma pagina nova que ficasse de fora do sitemap
// era uma pagina que o Google demorava semanas a encontrar, sem nada a apontar
// o erro. Cada endereco entra nas duas linguas, cada um a dizer qual e o outro.
export default function sitemap() {
  const caminhos = ['/', ...SERVICE_PAGES.map((p) => `/${p.slug}/`)];
  return caminhos.flatMap((caminho) => {
    const idiomas = idiomasDe(caminho);
    const alternates = { languages: idiomas };
    const priority = caminho === '/' ? 1 : 0.8;
    return [
      { url: idiomas['pt-PT'], changeFrequency: 'weekly', priority, alternates },
      { url: `${SITE_URL}/en${caminho}`, changeFrequency: 'weekly', priority: priority - 0.2, alternates },
    ];
  });
}
