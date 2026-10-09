// Os endereços do site nas duas línguas.
//
// O português vive na raiz e o inglês em /en/: /lavagem-premium-braga/ e
// /en/lavagem-premium-braga/ são a mesma página em línguas diferentes, cada
// uma com o seu canonical e a apontar para a outra no hreflang. Antes o inglês
// era um estado guardado no browser e o endereço não mudava — o Google via um
// site só em português a anunciar uma versão inglesa que não existia.
//
// O slug não se traduz: é o que o Google já conhece, e mudar-lhe o nome era
// começar do zero.

export const prefixo = (lang) => (lang === 'en' ? '/en' : '');

export const inicio = (lang) => `${prefixo(lang)}/`;

export const pagina = (lang, slug, hash = '') => `${prefixo(lang)}/${slug}/${hash}`;

/** Uma secção da página inicial, a partir de qualquer página: "/#services". */
export const ancora = (lang, hash) => `${prefixo(lang)}/${hash}`;

/** Para um <a href> que não passa pelo Link do Next e precisa do basePath. */
export const absoluto = (path) => `${process.env.PUBLIC_URL}${path}`;

export const idiomaDe = (pathname) => (/^\/en(\/|$)/.test(pathname) ? 'en' : 'pt');

/** O mesmo endereço na outra língua. */
export function traduzir(pathname, lang) {
  const semEn = pathname.replace(/^\/en(?=\/|$)/, '') || '/';
  return `${prefixo(lang)}${semEn}`;
}
