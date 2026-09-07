import { useEffect } from 'react';

/**
 * Escreve o <head> da página em que se está.
 *
 * O site é uma aplicação de uma página só: o servidor entrega sempre o mesmo
 * index.html e é isto que lhe muda o título, a descrição e os dados
 * estruturados conforme a rota. O Google executa JavaScript e lê o resultado —
 * e o build ainda estampa estes mesmos valores no HTML de cada página, em
 * scripts/paginas-servico.mjs, para quem não executa.
 *
 * Estava tudo escrito à mão dentro do App.js. Bastava haver uma segunda página
 * para essas quarenta linhas serem copiadas — e uma cópia que se esquece de
 * mudar o canonical diz ao Google que as duas páginas são a mesma.
 */
export function useSeoHead({
  lang, title, description, keywords, canonical, image, alternates = [], jsonLd = {},
}) {
  // O jsonLd é um objeto novo em cada render de quem chama; comparado por
  // referência, punha o efeito a correr sempre. A chave é o conteúdo.
  const jsonLdKey = JSON.stringify(jsonLd);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = title;

    const ensureMeta = (name, content, attr = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };

    ensureMeta('description', description);
    if (keywords) ensureMeta('keywords', keywords);
    ensureMeta('robots', 'index, follow, max-image-preview:large');
    ensureMeta('author', 'Clean Station Car');
    ensureMeta('geo.region', 'PT-03');
    ensureMeta('geo.placename', 'Braga');
    ensureMeta('geo.position', '41.5454;-8.4265');
    ensureMeta('ICBM', '41.5454, -8.4265');
    ensureMeta('og:site_name', 'Clean Station Car', 'property');
    ensureMeta('og:title', title, 'property');
    ensureMeta('og:description', description, 'property');
    ensureMeta('og:type', 'website', 'property');
    ensureMeta('og:url', canonical, 'property');
    ensureMeta('og:locale', lang === 'en' ? 'en_GB' : 'pt_PT', 'property');
    ensureMeta('og:image', image, 'property');
    ensureMeta('twitter:card', 'summary_large_image');
    ensureMeta('twitter:title', title);
    ensureMeta('twitter:description', description);
    ensureMeta('twitter:image', image);

    const ensureLink = (id, rel, href, hreflang) => {
      let el = document.getElementById(id);
      if (!el) { el = document.createElement('link'); el.id = id; el.rel = rel; document.head.appendChild(el); }
      el.setAttribute('href', href);
      if (hreflang) el.setAttribute('hreflang', hreflang);
    };

    ensureLink('seo-canonical', 'canonical', canonical);

    // As alternativas de idioma são da página inicial, que existe nas duas
    // línguas. Numa página que só existe em português, anunciá-las era mandar
    // o Google a um inglês que não há. Quem não as tem fica sem elas — e as
    // que ficaram de uma página anterior têm de sair, senão a navegação de
    // uma página para a outra deixava-as coladas.
    for (const id of ['seo-alt-pt', 'seo-alt-en', 'seo-alt-default']) {
      const anterior = document.getElementById(id);
      if (anterior && !alternates.some((a) => a.id === id)) anterior.remove();
    }
    for (const a of alternates) ensureLink(a.id, 'alternate', a.href, a.hreflang);

    const ids = Object.keys(jsonLd);
    // O mesmo para os dados estruturados: as FAQ da página inicial não podem
    // ficar penduradas numa página de serviço que tem as suas.
    for (const el of [...document.querySelectorAll('script[type="application/ld+json"][id]')]) {
      if (!ids.includes(el.id)) el.remove();
    }
    for (const [id, data] of Object.entries(jsonLd)) {
      document.getElementById(id)?.remove();
      const el = document.createElement('script');
      el.id = id;
      el.type = 'application/ld+json';
      el.textContent = JSON.stringify(data);
      document.head.appendChild(el);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, title, description, keywords, canonical, image, JSON.stringify(alternates), jsonLdKey]);
}
