import { PHASE_PRODUCTION_BUILD } from 'next/constants.js';

// O site sai do build em HTML estático, uma página por endereço, com o texto e
// o <head> já lá dentro — quem não executa JavaScript (o WhatsApp a montar uma
// pré-visualização, um motor de busca com pressa) lê o mesmo que um browser.
// Continua a ser uma pasta que se arrasta para a Netlify: não há servidor Node.

// A cópia de teste no GitHub Pages vive numa subpasta (scripts/pages.mjs). O
// nome vem do CRA e ficou porque o código o usa nos caminhos das imagens, que o
// basePath do Next não reescreve.
const basePath = process.env.PUBLIC_URL || '';

export default (phase) => ({
  basePath,

  // Cada página sai como uma pasta com index.html. Sem isto sai como x.html ao
  // lado de uma pasta x/, onde o Next guarda os dados da navegação — e fica ao
  // servidor escolher entre os dois. O GitHub Pages, ao ver uma pasta, responde
  // 301 para x/. Com pasta e index.html não há escolha a fazer: /x/ serve a
  // página em qualquer servidor estático, e /x vai lá ter.
  trailingSlash: true,

  // Só no build. No next dev, com o export ligado, um endereço de um segmento
  // que não é página — /crm aberto à mão, um erro de escrita — dava um 500 em
  // vez do 404 que leva ao not-found; e o distDir, que no build é a pasta
  // exportada, no dev é a cache, que ia parar ao build/.
  //
  // build/ e não out/: é a que se arrasta para a Netlify, e um build/ antigo
  // esquecido ao lado de um out/ novo era meio caminho para publicar o site
  // velho.
  ...(phase === PHASE_PRODUCTION_BUILD && {
    output: 'export',
    distDir: process.env.BUILD_PATH || 'build',
  }),

  env: {
    PUBLIC_URL: basePath,
    // As variáveis mantêm o prefixo do CRA para o .env.local não ter de mudar.
    // O Next só entrega ao browser as NEXT_PUBLIC_*; estas passam por aqui.
    ...Object.fromEntries(Object.entries(process.env).filter(([k]) => k.startsWith('REACT_APP_'))),
  },
});
