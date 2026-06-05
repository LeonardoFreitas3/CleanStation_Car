import sharp from "sharp";
import { writeFileSync } from "fs";

async function makeSize(px) {
  const padding = Math.max(1, Math.round(px * 0.06));

  const bg = Buffer.from(
    `<svg width="${px}" height="${px}" xmlns="http://www.w3.org/2000/svg">` +
    `<rect width="${px}" height="${px}" rx="${Math.round(px*0.18)}" fill="#000000"/>` +
    `</svg>`
  );

  // Redimensionar logo e forcar branco
  const logoMeta = await sharp("public/img/logo.png").metadata();
  const logoResized = await sharp("public/img/logo.png")
    .resize(px - padding * 2, px - padding * 2, { fit: "contain", background: { r:0,g:0,b:0,alpha:0 } })
    .ensureAlpha()
    .toBuffer();

  // Converter pixels nao-transparentes para branco puro
  const { data, info } = await sharp(logoResized).raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i+3];
    if (alpha > 10) {
      // Misturar com branco baseado no brilho original
      const brightness = Math.round((data[i]*0.299 + data[i+1]*0.587 + data[i+2]*0.114));
      const white = Math.min(255, brightness + 80);
      data[i] = white; data[i+1] = white; data[i+2] = white;
      data[i+3] = Math.min(255, alpha + 60);
    }
  }
  const whiteBuffer = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();

  return sharp(bg)
    .composite([{ input: whiteBuffer, top: padding, left: padding, blend: "over" }])
    .png()
    .toBuffer();
}

// Gerar 16, 32 e 48
const [png16, png32, png48] = await Promise.all([makeSize(16), makeSize(32), makeSize(48)]);

function makeEntry(pngBuf, size, offset) {
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size === 256 ? 0 : size, 0);
  entry.writeUInt8(size === 256 ? 0 : size, 1);
  entry.writeUInt8(0, 2); entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4); entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(pngBuf.length, 8);
  entry.writeUInt32LE(offset, 12);
  return entry;
}

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(3, 4);

const baseOffset = 6 + 16 * 3;
const e16 = makeEntry(png16, 16, baseOffset);
const e32 = makeEntry(png32, 32, baseOffset + png16.length);
const e48 = makeEntry(png48, 48, baseOffset + png16.length + png32.length);

writeFileSync("public/img/favicon.ico", Buffer.concat([header, e16, e32, e48, png16, png32, png48]));
console.log("done");
