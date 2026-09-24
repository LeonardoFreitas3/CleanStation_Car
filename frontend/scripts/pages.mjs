// Publica uma copia de teste no GitHub Pages.
//
// Nao substitui a Netlify: e uma copia para ver no telemovel antes de publicar
// a serio. Tres diferencas em relacao ao build de producao, e sao elas que
// justificam este ficheiro existir:
//
//   1. PUBLIC_URL. O Pages serve em /CleanStation_Car e nao na raiz. O
//      next.config.mjs faz dele o basePath, e o codigo usa-o nas imagens.
//   2. BUILD_PATH. Sai para build-pages/ e nao para build/ — o build/ e o que
//      se arrasta para a Netlify, e se este o escrevesse por cima ficava la
//      um site com os caminhos do Pages, partido em producao.
//   3. robots.txt. Disallow total. Esta copia tem o mesmo texto do site real;
//      indexada, competia com o cleanstationcar.com nas pesquisas.
//
// O Pages nao tem reescrita de rotas (o _redirects e da Netlify), mas serve o
// 404.html em qualquer endereco que nao exista — e o 404.html do Next e o que
// monta o CRM e a galeria. /crm/agenda funciona, com um 404 que ninguem ve.
//
// O deploy:pages leva --nojekyll. Sem ele o Pages passa tudo pelo Jekyll, que
// deita fora as pastas comecadas por _ — e o Next poe os scripts todos em _next/.

import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'build-pages';
const BASE = '/CleanStation_Car';

execSync('npx next build', {
  stdio: 'inherit',
  env: { ...process.env, PUBLIC_URL: BASE, BUILD_PATH: OUT },
});

writeFileSync(join(OUT, 'robots.txt'), 'User-agent: *\nDisallow: /\n');

console.log(`\nPronto em ${OUT}/. Publicar: npm run deploy:pages`);
