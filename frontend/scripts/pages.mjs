// Publica uma copia de teste no GitHub Pages.
//
// Nao substitui a Netlify: e uma copia para ver no telemovel antes de publicar
// a serio. Tres diferencas em relacao ao build de producao, e sao elas que
// justificam este ficheiro existir:
//
//   1. PUBLIC_URL. O Pages serve em /CleanStation_Car e nao na raiz. O
//      basename do router ja le o PUBLIC_URL, portanto as rotas seguem-no.
//   2. BUILD_PATH. Sai para build-pages/ e nao para build/ — o build/ e o que
//      se arrasta para a Netlify, e se este o escrevesse por cima ficava la
//      um site com os caminhos do Pages, partido em producao.
//   3. robots.txt. Disallow total. Esta copia tem o mesmo texto do site real;
//      indexada, competia com o cleanstationcar.com nas pesquisas.
//
// O 404.html e uma copia do index.html: o Pages nao tem reescrita de rotas
// (o _redirects e da Netlify), e sem ele qualquer endereco fora da raiz —
// /crm/agenda, por exemplo — dava a pagina de erro do GitHub.

import { execSync } from 'node:child_process';
import { copyFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'build-pages';
const BASE = '/CleanStation_Car';

execSync('npx craco build', {
  stdio: 'inherit',
  env: { ...process.env, PUBLIC_URL: BASE, BUILD_PATH: OUT },
});

copyFileSync(join(OUT, 'index.html'), join(OUT, '404.html'));
writeFileSync(join(OUT, 'robots.txt'), 'User-agent: *\nDisallow: /\n');

console.log(`\nPronto em ${OUT}/. Publicar: npm run deploy:pages`);
