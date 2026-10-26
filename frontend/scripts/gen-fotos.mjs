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
// Correr a partir de frontend/:  node scripts/gen-fotos.mjs <pasta-das-originais>
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const VARIANTES = {
  card: { aspeto: 4 / 3, largura: 800 }, // cartões da inicial
  'card-sm': { aspeto: 4 / 3, largura: 480 },
  meia: { aspeto: 2 / 3, largura: 400 }, // metade de um cartão (Detalhada Interior ou Exterior)
  capa: { aspeto: 3 / 2, largura: 1200 }, // fundo do cabeçalho de cada página
  mini: { aspeto: 3 / 4, largura: 600 }, // galeria e antes/depois
  retrato: { aspeto: 4 / 5, largura: 960 }, // instalações, no computador
  heroi: { aspeto: 941 / 1100, largura: 941 }, // imagem principal, no computador
  'heroi-sm': { aspeto: 941 / 1100, largura: 640 }, // e no telemóvel
  full: { largura: 1600 }, // em tamanho completo, na galeria
};

const FOTOS = [
  { nome: 'porsche', original: 'exec-76a899b7-8a94-4ca2-8e90-e1ece06f6c94.png', fy: 1, variantes: ['heroi', 'heroi-sm'] },
  { nome: 'porsche-frente', original: 'exec-76a899b7-8a94-4ca2-8e90-e1ece06f6c94.png', fy: 0.7, variantes: ['mini', 'full'] },
  { nome: 'instalacoes', original: 'B8063F8E-DB72-48C4-B34F-C881BFBBD0DA.jpeg', fy: 0.55, variantes: ['retrato', 'card', 'full'] },
  { nome: 'entrada', original: '5C757988-ACED-4055-9A26-9DF02AB2DC5E.jpeg', fy: 0.5, variantes: ['card', 'full'] },

  { nome: 'bmw-espuma', original: 'exec-1aae5891-d9b5-452f-b766-e88e8db16a69.png', fy: 0.62, variantes: ['card', 'card-sm', 'capa', 'mini', 'full'] },
  { nome: 'bmw-frente', original: 'exec-803f184f-99f9-4206-bf9c-7d145ee3eba0.png', fy: 0.52, variantes: ['card', 'card-sm', 'capa', 'mini', 'full'] },
  { nome: 'bmw-interior', original: 'exec-455ab8ad-9872-4ba2-b50d-7844100f9cd7.png', fy: 0.5, variantes: ['mini', 'full'] },
  { nome: 'bmw-volante', original: 'exec-5c236247-ebf9-4db0-a9f0-210704b20a01.png', fy: 0.5, variantes: ['mini', 'full'] },

  { nome: 'megane-interior', original: 'exec-62be33f6-a4f1-4b25-b7e9-f86abc47a69f.png', fy: 0.55, variantes: ['meia', 'card-sm', 'capa', 'mini', 'full'] },
  { nome: 'porsche-traseira', original: 'exec-19871a79-e323-40b2-8408-e132e83eb77b.png', fy: 0.55, variantes: ['meia', 'mini', 'full'] },
  { nome: 'porsche-interior', original: 'exec-658ca457-26bc-4134-985c-917979be15eb.png', fy: 0.55, variantes: ['card', 'card-sm', 'capa', 'mini', 'full'] },

  { nome: 'farol-maquina', original: 'exec-20b4e562-cdf8-407b-9021-3ba1e56bdf95.png', fy: 0.36, variantes: ['card', 'card-sm', 'capa', 'mini', 'full'] },
  { nome: 'farol-colaborador', original: 'exec-49ffee05-eba7-401f-98d8-631d32e6256d.png', fy: 0.45, variantes: ['mini', 'full'] },

  // Antes e depois. Cada par é o mesmo carro; o enquadramento não coincide.
  { nome: 'farol-antes', original: 'exec-46de28ad-9d9e-40a7-97f5-54a17e5a332d.png', fy: 0.5, variantes: ['mini', 'full'] },
  { nome: 'farol-depois', original: 'exec-b3621090-8806-4040-8971-948cb96bfa57.png', fy: 0.5, variantes: ['mini', 'full'] },
  { nome: 'megane-antes', original: 'exec-abf9cab0-cb51-40e9-8fb1-e90b781e0c9e.png', fy: 0.5, variantes: ['mini', 'full'] },
  { nome: 'megane-depois', original: 'exec-d3bb0038-5dbf-4da1-97be-678e3591f27a.png', fy: 0.5, variantes: ['mini', 'full'] },
  { nome: 'renault-condutor-antes', original: 'exec-e5e55aea-c7fd-4116-b84c-1b6a97f6b7e4.png', fy: 0.55, variantes: ['mini', 'full'] },
  { nome: 'renault-condutor-depois', original: 'exec-6635b541-9597-4e7a-b840-9916e61647ac.png', fy: 0.55, variantes: ['mini', 'full'] },
  { nome: 'renault-passageiro-antes', original: 'exec-48e34a4d-cd47-4618-a864-463fdc8c468b.png', fy: 0.55, variantes: ['mini', 'full'] },
  { nome: 'renault-passageiro-depois', original: 'exec-b569c699-5a07-4284-92d0-57c3897452ac.png', fy: 0.55, variantes: ['mini', 'full'] },
];

const pasta = process.argv[2];
if (!pasta) {
  console.error('Uso: node scripts/gen-fotos.mjs <pasta-das-originais>');
  process.exit(1);
}
const SAIDA = 'public/img/fotos';
mkdirSync(SAIDA, { recursive: true });

/** O maior retângulo com esta proporção que cabe na imagem, centrado em fy. */
function recorte(w, h, aspeto, fy) {
  const cw = Math.min(w, Math.round(h * aspeto));
  const ch = Math.min(h, Math.round(cw / aspeto));
  const top = Math.max(0, Math.min(h - ch, Math.round(fy * h - ch / 2)));
  return { left: Math.round((w - cw) / 2), top, width: cw, height: ch };
}

for (const foto of FOTOS) {
  const origem = sharp(join(pasta, foto.original)).rotate();
  const { width: w, height: h } = await origem.metadata();
  for (const v of foto.variantes) {
    const { aspeto, largura } = VARIANTES[v];
    let img = origem.clone();
    let cw = w;
    if (aspeto) {
      const r = recorte(w, h, aspeto, foto.fy);
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
