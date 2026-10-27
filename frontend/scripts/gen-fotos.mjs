// Gera public/img/fotos/ a partir das fotografias reais da oficina.
//
// As originais (PNG de 2-3 MB, quase todas verticais) nao entram no git: o
// repositorio levava 45 MB de fotografias que o site nunca serve. Ficam aqui o
// nome de cada uma, o recorte e os tamanhos — correr outra vez com a mesma
// pasta da exatamente os mesmos ficheiros.
//
// So se recorta e reduz: nada de filtros nem retoques, as fotografias ja vem
// editadas.
//
// `fy` e onde fica o assunto na vertical (0 = topo, 1 = fundo). O recorte e
// sempre o maior que cabe na proporcao pedida, centrado ai; numa vertical
// cortada a 4:3 e o que decide se se ve o carro ou o teto.
//
// `caixas` da a uma variante o recorte exato em vez disso, em fracoes da
// original — `x` e `y` o canto, `l` a largura (a altura sai da proporcao).
// Nos pares de antes e depois e a miniatura (`mini`). Os dois lados de um par nunca foram tirados do
// mesmo sitio; cada `par` foi acertado a olho, com uma grelha por cima, para
// o volante, o farol ou o tablier ficarem no mesmo sitio e ao mesmo tamanho
// nas duas fotografias. A versao em tamanho completo fica inteira.
//
// As originais vem de mais de uma entrega (clean.rar e o zip "Site Clean
// Station"): passam-se as pastas todas, e cada ficheiro procura-se nelas.
//
// Correr a partir de frontend/:  node scripts/gen-fotos.mjs <pasta> [<pasta>...]
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const VARIANTES = {
  card: { aspeto: 4 / 3, largura: 800 }, // cartões da inicial
  'card-sm': { aspeto: 4 / 3, largura: 480 },
  meia: { aspeto: 2 / 3, largura: 400 }, // metade de um cartão (Detalhada Interior ou Exterior)
  capa: { aspeto: 3 / 2, largura: 1200 }, // fundo do cabeçalho de cada página
  mini: { aspeto: 3 / 4, largura: 600 }, // galeria e antes/depois
  retrato: { aspeto: 4 / 5, largura: 960 }, // instalações, no computador
  quadrado: { aspeto: 1, largura: 1000 }, // fundo do topo, no telemóvel
  full: { largura: 1600 }, // em tamanho completo: no visualizador, e o fundo do topo
};

// Cada fotografia aparece uma vez só na secção de serviços da inicial; fora
// dela (cabeçalhos das páginas, oficina, resultados) pode repetir-se.
const FOTOS = [
  // O fundo do topo da inicial. Escura à esquerda, onde fica o texto; no
  // telemóvel vai só o carro, num quadrado.
  { nome: 'mustang', original: 'Foto de fundo.jpg', caixas: { quadrado: { x: 0.378, y: 0, l: 0.622 } }, variantes: ['full', 'quadrado'] },
  // A Detalhada Interior ou Exterior, uma por metade do cartão.
  { nome: 'volante-escova', original: 'Lavagem detalhada interior ou exterior/Lavagem detalhad interior ou exterior .PNG', fy: 0.45, variantes: ['meia', 'card-sm', 'capa'] },
  { nome: 'jante-escova', original: 'Lavagem detalhada interior ou exterior/Lavagem detalhada interior ou exterior .PNG', fy: 0.6, variantes: ['meia'] },
  { nome: 'porsche-frente', original: 'exec-76a899b7-8a94-4ca2-8e90-e1ece06f6c94.png', fy: 0.75, variantes: ['card', 'card-sm', 'meia', 'capa'] },
  { nome: 'instalacoes', original: 'B8063F8E-DB72-48C4-B34F-C881BFBBD0DA.jpeg', fy: 0.55, variantes: ['retrato', 'card', 'card-sm', 'capa', 'full'] },
  { nome: 'entrada', original: '5C757988-ACED-4055-9A26-9DF02AB2DC5E.jpeg', fy: 0.5, variantes: ['card', 'full'] },

  { nome: 'bmw-espuma', original: 'exec-1aae5891-d9b5-452f-b766-e88e8db16a69.png', fy: 0.62, variantes: ['card', 'card-sm', 'capa'] },
  { nome: 'bmw-frente', original: 'exec-803f184f-99f9-4206-bf9c-7d145ee3eba0.png', fy: 0.52, variantes: ['card', 'card-sm', 'capa'] },
  { nome: 'bmw-interior', original: 'exec-455ab8ad-9872-4ba2-b50d-7844100f9cd7.png', fy: 0.45, variantes: ['card', 'card-sm'] },
  { nome: 'bmw-volante', original: 'exec-5c236247-ebf9-4db0-a9f0-210704b20a01.png', fy: 0.5, variantes: ['card', 'card-sm'] },

  { nome: 'megane-interior', original: 'exec-62be33f6-a4f1-4b25-b7e9-f86abc47a69f.png', fy: 0.55, caixas: { mini: { x: 0, y: 0.4, l: 0.8 } }, variantes: ['meia', 'card-sm', 'capa', 'mini', 'full'] },
  { nome: 'porsche-traseira', original: 'exec-19871a79-e323-40b2-8408-e132e83eb77b.png', fy: 0.55, variantes: ['meia', 'card-sm', 'capa'] },
  { nome: 'porsche-interior', original: 'exec-658ca457-26bc-4134-985c-917979be15eb.png', fy: 0.55, variantes: ['card', 'card-sm', 'meia', 'capa'] },
  { nome: 'megane-depois', original: 'exec-d3bb0038-5dbf-4da1-97be-678e3591f27a.png', fy: 0.5, variantes: ['card', 'card-sm'] },

  { nome: 'farol-maquina', original: 'exec-20b4e562-cdf8-407b-9021-3ba1e56bdf95.png', fy: 0.36, variantes: ['card', 'card-sm', 'capa'] },
  { nome: 'farol-colaborador', original: 'exec-49ffee05-eba7-401f-98d8-631d32e6256d.png', fy: 0.5, variantes: ['card', 'card-sm', 'capa'] },

  // Antes e depois, os quatro pares da secção de resultados. O alinhamento de
  // cada um está no `par` (ver o topo).
  // O farol: o mesmo, mais de lado no depois; ficam à mesma altura.
  { nome: 'farol-antes', original: 'exec-46de28ad-9d9e-40a7-97f5-54a17e5a332d.png', caixas: { mini: { x: 0, y: 0.145, l: 1 } }, variantes: ['mini', 'full'] },
  { nome: 'farol-depois', original: 'exec-b3621090-8806-4040-8971-948cb96bfa57.png', fy: 0.38, caixas: { mini: { x: 0, y: 0, l: 1 } }, variantes: ['card', 'card-sm', 'capa', 'mini', 'full'] },
  // Mégane, a consola e o chão do condutor: a alavanca no mesmo sítio. O
  // depois é a megane-interior, mais acima.
  { nome: 'megane-consola-antes', original: 'exec-5a849776-82da-4b08-9659-58342a656ac0.png', caixas: { mini: { x: 0.3, y: 0.02, l: 0.7 } }, variantes: ['mini', 'full'] },
  // Renault mais antigo, zona do condutor: o volante no mesmo sítio.
  { nome: 'renault-condutor-antes', original: 'exec-e5e55aea-c7fd-4116-b84c-1b6a97f6b7e4.png', caixas: { mini: { x: 0.28, y: 0.21, l: 0.72 } }, variantes: ['mini', 'full'] },
  { nome: 'renault-condutor-depois', original: 'exec-6635b541-9597-4e7a-b840-9916e61647ac.png', fy: 0.5, caixas: { mini: { x: 0.07, y: 0.16, l: 0.72 } }, variantes: ['card-sm', 'capa', 'mini', 'full'] },
  // E a zona do passageiro: o tablier e o porta-luvas à mesma altura.
  { nome: 'renault-passageiro-antes', original: 'exec-48e34a4d-cd47-4618-a864-463fdc8c468b.png', caixas: { mini: { x: 0, y: 0.09, l: 0.9 } }, variantes: ['mini', 'full'] },
  { nome: 'renault-passageiro-depois', original: 'exec-b569c699-5a07-4284-92d0-57c3897452ac.png', caixas: { mini: { x: 0.1, y: 0.03, l: 0.9 } }, variantes: ['mini', 'full'] },
];

const pastas = process.argv.slice(2);
if (!pastas.length) {
  console.error('Uso: node scripts/gen-fotos.mjs <pasta> [<pasta>...]');
  process.exit(1);
}
const procurar = (original) => {
  const pasta = pastas.find((p) => existsSync(join(p, original)));
  if (!pasta) throw new Error(`Não encontro ${original} em nenhuma das pastas`);
  return join(pasta, original);
};
const SAIDA = 'public/img/fotos';
mkdirSync(SAIDA, { recursive: true });

/** O maior retângulo com esta proporção que cabe na imagem, centrado em fy. */
function recorte(w, h, aspeto, fy) {
  const cw = Math.min(w, Math.round(h * aspeto));
  const ch = Math.min(h, Math.round(cw / aspeto));
  const top = Math.max(0, Math.min(h - ch, Math.round(fy * h - ch / 2)));
  return { left: Math.round((w - cw) / 2), top, width: cw, height: ch };
}

/** Um recorte exato, em frações da original, sem sair dela. */
function exato(w, h, aspeto, { x, y, l }) {
  const width = Math.round(l * w);
  const height = Math.min(h, Math.round(width / aspeto));
  const left = Math.min(w - width, Math.round(x * w));
  const top = Math.max(0, Math.min(h - height, Math.round(y * h)));
  return { left, top, width, height };
}

for (const foto of FOTOS) {
  const origem = sharp(procurar(foto.original)).rotate();
  const { width: w, height: h } = await origem.metadata();
  for (const v of foto.variantes) {
    const { aspeto, largura } = VARIANTES[v];
    let img = origem.clone();
    let cw = w;
    if (aspeto) {
      const r = foto.caixas?.[v] ? exato(w, h, aspeto, foto.caixas[v]) : recorte(w, h, aspeto, foto.fy);
      img = img.extract(r);
      cw = r.width;
    }
    // Nunca ampliar: uma vertical de 941 px esticada a 1200 só perde nitidez.
    const largo = aspeto ? Math.min(largura, cw) : null;
    img = aspeto ? img.resize({ width: largo }) : img.resize({ width: largura, height: largura, fit: 'inside', withoutEnlargement: true });
    const destino = join(SAIDA, `${foto.nome}-${v}.webp`);
    const info = await img.webp({ quality: 80, effort: 5 }).toFile(destino);
    console.log(`${destino}  ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`);
  }
}
