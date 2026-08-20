// Gera public/img/favicon.ico (16/32/48) a partir de public/img/logo.png.
//
// Duas decisoes que nao sao obvias:
//   1. So usa o simbolo do carro, nao o logo completo. O "CLEAN STATION" e
//      ilegivel abaixo de ~48px e roubava espaco ao unico elemento que se
//      distingue nesse tamanho.
//   2. ZOOM = 1: o carro entra INTEIRO. Uma versao anterior usava 1.5 para
//      encher mais o quadrado, mas isso fatiava os farois nos bordos laterais
//      e lia-se como defeito de recorte, nao como opcao. Melhor um carro
//      completo com preto a volta do que um carro cortado.
//
// Correr a partir de frontend/:  node scripts/gen-favicon.mjs
import sharp from 'sharp';
import { writeFileSync } from 'fs';

const SRC = 'public/img/logo.png';
const OUT = 'public/img/favicon.ico';
const SIZES = [16, 32, 48];
const ZOOM = 1.0;      // largura do carro / largura util do icone
const PADDING = 0.05;  // margem interior: os cantos arredondados comem os extremos
const RADIUS = 0.16;   // canto arredondado, fracao do lado
const BG = '#000000';

// O logo tem margens transparentes e o simbolo do carro fica separado do
// texto por uma faixa vazia. Detetamos a faixa em vez de fixar coordenadas,
// para o script sobreviver a uma troca ou redimensionamento do logo.
async function carBox(src) {
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const opaque = (x, y) => data[(y * W + x) * C + 3] > 12;

  const rowFilled = [];
  for (let y = 0; y < H; y++) {
    let n = 0;
    for (let x = 0; x < W; x++) if (opaque(x, y)) n++;
    rowFilled.push(n > 0);
  }

  const firstRow = rowFilled.indexOf(true);
  if (firstRow === -1) throw new Error(`${src} nao tem pixeis opacos`);

  // fim do carro = inicio da primeira faixa vazia com mais de 1% da altura
  const minGap = Math.max(4, Math.round(H * 0.01));
  let bottom = H - 1;
  for (let y = firstRow, run = 0; y < H; y++) {
    if (!rowFilled[y]) {
      if (++run > minGap) { bottom = y - run; break; }
    } else run = 0;
  }

  let left = W, right = 0;
  for (let y = firstRow; y <= bottom; y++)
    for (let x = 0; x < W; x++)
      if (opaque(x, y)) { if (x < left) left = x; if (x > right) right = x; }

  return { left, top: firstRow, width: right - left + 1, height: bottom - firstRow + 1 };
}

// Forca branco puro: o traco tem anti-aliasing cinzento que, ao reduzir para
// 16px, se dilui e deixa o icone lavado.
async function forceWhite(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 8) { data[i] = 255; data[i + 1] = 255; data[i + 2] = 255; }
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

async function render(box, size) {
  const usable = Math.round(size * (1 - PADDING * 2));
  let car = await forceWhite(
    await sharp(SRC).extract(box).resize(Math.round(usable * ZOOM), null).png().toBuffer()
  );

  // com ZOOM > 1 o carro excede a tela: corta ao centro antes de compor
  const m = await sharp(car).metadata();
  if (m.width > size || m.height > size) {
    car = await sharp(car).extract({
      left: Math.max(0, Math.round((m.width - size) / 2)),
      top: Math.max(0, Math.round((m.height - size) / 2)),
      width: Math.min(m.width, size),
      height: Math.min(m.height, size),
    }).png().toBuffer();
  }

  const bg = Buffer.from(
    `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" ` +
    `rx="${Math.round(size * RADIUS)}" fill="${BG}"/></svg>`
  );
  return sharp(bg).composite([{ input: car, gravity: 'center' }]).png().toBuffer();
}

// ICO = cabecalho de 6 bytes + 16 bytes por entrada + os PNGs concatenados.
function buildIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);

  let offset = 6 + 16 * pngs.length;
  const entries = pngs.map(({ buf, size }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4);   // planos
    e.writeUInt16LE(32, 6);  // bits por pixel
    e.writeUInt32LE(buf.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += buf.length;
    return e;
  });

  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.buf)]);
}

const box = await carBox(SRC);
console.log(`simbolo do carro: ${box.width}x${box.height} em (${box.left},${box.top})`);

const pngs = [];
for (const size of SIZES) pngs.push({ size, buf: await render(box, size) });

const ico = buildIco(pngs);
writeFileSync(OUT, ico);
console.log(`${OUT}: ${SIZES.join('/')} px, ${(ico.length / 1024).toFixed(1)} KB`);
