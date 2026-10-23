// Generates the PWA icons (solid indigo square with a white "</>"-style bracket mark) without image libraries.
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';

function crc32(buf: Buffer): number {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]!) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function png(size: number): Buffer {
  const bg = [67, 56, 202]; // indigo-700
  const fg = [255, 255, 255];
  const rows: Buffer[] = [];
  const stroke = Math.max(2, Math.round(size / 14));
  const inBracket = (x: number, y: number) => {
    // "<" and ">" drawn as two diagonal strokes each, centred.
    const cx = size / 2, cy = size / 2, h = size * 0.26, w = size * 0.2;
    const dy = Math.abs(y - cy);
    if (dy > h) return false;
    const off = w * (1 - dy / h);
    const left = cx - size * 0.12 - off, right = cx + size * 0.12 + off;
    return Math.abs(x - left) < stroke / 2 + 0.5 || Math.abs(x - right) < stroke / 2 + 0.5;
  };
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 3);
    for (let x = 0; x < size; x++) {
      const c = inBracket(x, y) ? fg : bg;
      row[1 + x * 3] = c[0]!; row[2 + x * 3] = c[1]!; row[3 + x * 3] = c[2]!;
    }
    rows.push(row);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(Buffer.concat(rows))),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync('public', { recursive: true });
for (const s of [192, 512]) writeFileSync(`public/icon-${s}.png`, png(s));
writeFileSync('public/favicon.svg',
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#4338ca"/>' +
  '<path d="M26 20 14 32l12 12M38 20l12 12-12 12" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>');
console.log('icons written');
