// Estampa o <head> de cada página de serviço no HTML entregue pelo servidor.
//
// O site é uma aplicação de uma página só: o Netlify entrega o mesmo
// index.html para todos os endereços e é o JavaScript que muda o título. O
// Google executa JavaScript e vê o resultado — mas o WhatsApp, o Facebook e o
// LinkedIn não. Partilhar a página da Lavagem Premium mostrava a
// pré-visualização da página inicial, com o título e a imagem errados.
//
// Este passo escreve build/<slug>/index.html: uma cópia do index.html com o
// título, a descrição, o canonical e as etiquetas og já certos. O Netlify serve
// um ficheiro que existe antes de cair na regra do _redirects, portanto quem
// visita recebe este HTML e a aplicação arranca por cima como sempre — a rota
// existe no router e desenha a mesma página.
//
// Não prerenderiza o corpo. Isso obrigava a levantar um browser no build por
// uma diferença que o Google já resolve sozinho; o que ele não resolve são as
// pré-visualizações, e essas vivem todas no <head>.
//
// De caminho refaz o sitemap.xml, que é a outra lista dos mesmos endereços.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SITE_URL = 'https://cleanstationcar.com';
const OUT = process.env.BUILD_PATH || 'build';

const seo = JSON.parse(readFileSync('src/paginasSeo.json', 'utf8'));
const slugs = Object.keys(seo).filter((k) => !k.startsWith('_'));

const html = readFileSync(join(OUT, 'index.html'), 'utf8');

/** Escapa o que vai para dentro de um atributo HTML. */
const esc = (s) => s
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

for (const slug of slugs) {
  const { title, description, image } = seo[slug];
  const url = `${SITE_URL}/${slug}`;
  const imagem = `${SITE_URL}/img/${encodeURIComponent(image)}`;

  // O index.html do CRA ja traz um <title> e uma <meta name="description">.
  // Trocam-se em vez de se acrescentar: duas descricoes e o motor de busca a
  // escolher uma delas ao acaso.
  let pagina = html
    .replace(/<title>.*?<\/title>/i, `<title>${esc(title)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="description" content="${esc(description)}"/>`,
    );

  // Fora as do index.html, que sao da pagina inicial. Acrescentar sem tirar
  // deixava dois canonical e dois og:image no mesmo <head> — o Google ve sinais
  // a discordar e o WhatsApp mostra a imagem que lhe calhar primeiro.
  pagina = pagina
    .replace(/\s*<link\s+rel="canonical"[^>]*>/gi, '')
    .replace(/\s*<meta\s+property="og:(?!site_name)[^"]*"[^>]*>/gi, '')
    .replace(/\s*<meta\s+name="twitter:[^"]*"[^>]*>/gi, '');

  const head = [
    `<link rel="canonical" href="${url}"/>`,
    `<meta property="og:type" content="website"/>`,
    `<meta property="og:url" content="${url}"/>`,
    `<meta property="og:title" content="${esc(title)}"/>`,
    `<meta property="og:description" content="${esc(description)}"/>`,
    `<meta property="og:image" content="${imagem}"/>`,
    `<meta property="og:locale" content="pt_PT"/>`,
    `<meta name="twitter:card" content="summary_large_image"/>`,
    `<meta name="twitter:title" content="${esc(title)}"/>`,
    `<meta name="twitter:description" content="${esc(description)}"/>`,
    `<meta name="twitter:image" content="${imagem}"/>`,
  ].join('');

  pagina = pagina.replace('</head>', `${head}</head>`);

  mkdirSync(join(OUT, slug), { recursive: true });
  writeFileSync(join(OUT, slug, 'index.html'), pagina);
}

// ── Sitemap ─────────────────────────────────────────────────────────────────
//
// Gerado e nao escrito a mao: uma pagina nova que ficasse de fora do sitemap
// era uma pagina que o Google demorava semanas a encontrar, sem nada a apontar
// o erro.

const url = (loc, prioridade) =>
  `  <url>\n    <loc>${loc}</loc>\n    <changefreq>weekly</changefreq>\n`
  + `    <priority>${prioridade}</priority>\n  </url>`;

writeFileSync(join(OUT, 'sitemap.xml'), [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  url(`${SITE_URL}/`, '1.0'),
  ...slugs.map((s) => url(`${SITE_URL}/${s}`, '0.8')),
  '</urlset>',
  '',
].join('\n'));

console.log(`Páginas de serviço estampadas em ${OUT}/: ${slugs.join(', ')}`);
