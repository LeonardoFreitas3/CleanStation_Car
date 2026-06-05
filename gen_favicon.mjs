import sharp from 'sharp';
import { readFileSync, writeFileSync, unlinkSync } from 'fs';

const padding = 3;
const size = 32;

const bg = Buffer.from(
  `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">` +
  `<rect width="${size}" height="${size}" rx="7" fill="#0a0a0a"/>` +
  `</svg>`
);

const composite = await sharp(bg)
  .composite([{
    input: await sharp('frontend/public/img/logo.png')
      .resize(size - padding * 2, size - padding * 2, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer(),
    top: padding,
    left: padding,
    blend: 'over',
  }])
  .png()
  .toBuffer();

// Build ICO (single 32x32 PNG-in-ICO)
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);

const entry = Buffer.alloc(16);
entry.writeUInt8(32, 0);
entry.writeUInt8(32, 1);
entry.writeUInt8(0, 2);
entry.writeUInt8(0, 3);
entry.writeUInt16LE(1, 4);
entry.writeUInt16LE(32, 6);
entry.writeUInt32LE(composite.length, 8);
entry.writeUInt32LE(22, 12);

const ico = Buffer.concat([header, entry, composite]);
writeFileSync('frontend/public/img/favicon.ico', ico);
console.log('favicon.ico gerado:', ico.length, 'bytes');
