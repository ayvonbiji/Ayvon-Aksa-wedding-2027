/**
 * Generates every brand asset from code:
 *   public/brand/*            logo suite (SVG + PNG)
 *   public/favicon.svg, favicon-32.png, apple-touch-icon.png, icon-512.png
 *   public/og-image.png       1200×630 social-sharing preview
 *   public/qr/wedding-qr.svg / .png   QR code for wedding.siteUrl
 *
 * Run:  npm run assets   (re-run after changing siteUrl or wedding details)
 */
import fs from 'node:fs';
import path from 'node:path';
import QRCode from 'qrcode';
import { Resvg } from '@resvg/resvg-js';
import * as o from '../src/art/ornaments.js';
import { monogram, wordmark, fonts, centred } from './logo-art.mjs';
import { wedding } from '../src/config/wedding.ts';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const pub = (...p) => path.join(root, 'public', ...p);
fs.mkdirSync(pub('brand'), { recursive: true });
fs.mkdirSync(pub('qr'), { recursive: true });

const write = (file, svg) => fs.writeFileSync(file, svg);
const png = (svg, file, width) =>
  fs.writeFileSync(file, new Resvg(svg, { fitTo: width ? { mode: 'width', value: width } : { mode: 'original' } }).render().asPng());
const doc = (vb, inner, { w, h, bg } = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"${w ? ` width="${w}" height="${h}"` : ''}>${o.defs()}${bg || ''}${inner}</svg>`;

const names = `${wedding.groom.first} &amp; ${wedding.bride.first}`;

/* 1. Primary monogram (transparent) */
const mono = doc('-150 -150 300 300', `<title>${names} monogram</title>${monogram()}`, { w: 300, h: 300 });
write(pub('brand', 'monogram.svg'), mono);
png(mono, pub('brand', 'monogram-transparent.png'), 1200);

/* 2. Monogram on ivory */
const monoIvory = doc('-160 -160 320 320', `<title>${names} monogram</title>${monogram()}`, {
  w: 320, h: 320, bg: '<rect x="-160" y="-160" width="320" height="320" fill="#FCF8F2"/>',
});
write(pub('brand', 'monogram-ivory.svg'), monoIvory);
png(monoIvory, pub('brand', 'monogram-ivory.png'), 1200);

/* 3. Monochrome monogram (single colour) */
const monoInk = doc('-150 -150 300 300', `<title>${names} monogram</title>${monogram({ color: '#4A3B36' })}`, { w: 300, h: 300 });
write(pub('brand', 'monogram-mono.svg'), monoInk);
write(pub('brand', 'monogram-mono-white.svg'), monoInk.replaceAll('#4A3B36', '#FFFFFF').replaceAll('stroke="#FFFFFF" stroke-width="3"', 'stroke="none" stroke-width="3"'));

/* 4. Wordmark */
const wm = wordmark();
const wmSvg = doc(`0 0 ${wm.w} ${wm.h}`, `<title>${names}</title>${wm.svg}`, { w: wm.w, h: wm.h });
write(pub('brand', 'wordmark.svg'), wmSvg);
png(wmSvg, pub('brand', 'wordmark-transparent.png'), 1600);
const wmMono = wordmark({ color: '#4A3B36' });
write(pub('brand', 'wordmark-mono.svg'), doc(`0 0 ${wmMono.w} ${wmMono.h}`, `<title>${names}</title>${wmMono.svg}`, { w: wmMono.w, h: wmMono.h }));

/* 5. Compact header logo: letters only inside a fine ring */
const compact = doc('-150 -150 300 300', `<title>${names}</title><circle r="138" fill="none" stroke="url(#aa-goldline)" stroke-width="5"/>${monogram({ ornaments: false })}`, { w: 300, h: 300 });
write(pub('brand', 'logo-header.svg'), compact);

/* 6. Full invitation lock-up: monogram + wordmark + date (transparent) */
const lockW = Math.max(wm.w, 620);
const lockInner =
  `<g transform="translate(${lockW / 2} 170)">${monogram()}</g>` +
  `<g transform="translate(${(lockW - wm.w) / 2} 320)">${wm.svg}</g>` +
  `<path d="${centred(fonts.label, wedding.ceremony.shortDateLabel.toUpperCase(), 26, lockW / 2, 520, 7)}" fill="#8F6D36"/>`;
const lockup = doc(`0 0 ${lockW} 560`, `<title>${names} — ${wedding.ceremony.shortDateLabel}</title>${lockInner}`, { w: lockW, h: 560 });
write(pub('brand', 'logo-invitation.svg'), lockup);
png(lockup, pub('brand', 'logo-invitation-transparent.png'), 1600);

/* 7. Favicons */
const fav = doc('-150 -150 300 300',
  `<circle r="150" fill="#FBF3EA"/><circle r="132" fill="none" stroke="url(#aa-goldline)" stroke-width="9"/>${monogram({ ornaments: false })}`, { w: 300, h: 300 });
write(pub('favicon.svg'), fav);
png(fav, pub('favicon-32.png'), 32);
png(fav, pub('icon-192.png'), 192);
png(fav, pub('icon-512.png'), 512);
const touch = doc('-150 -150 300 300',
  `<rect x="-150" y="-150" width="300" height="300" fill="#FBF3EA"/><circle r="118" fill="none" stroke="url(#aa-goldline)" stroke-width="6"/><g transform="scale(.82)">${monogram({ ornaments: false })}</g>`, { w: 300, h: 300 });
png(touch, pub('apple-touch-icon.png'), 180);

/* 8. Social-sharing image 1200×630 */
{
  const W = 1200, H = 630;
  const wmBig = wordmark({ size: 128 });
  let s = `<rect width="${W}" height="${H}" fill="#FBF5EC"/>`;
  s += `<radialGradient id="wash" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#FFFDF9"/><stop offset="1" stop-color="#F4E1DA"/></radialGradient><rect width="${W}" height="${H}" fill="url(#wash)"/>`;
  s += `<rect x="28" y="28" width="${W - 56}" height="${H - 56}" fill="none" stroke="#C3A26A" stroke-width="2"/>`;
  s += `<rect x="40" y="40" width="${W - 80}" height="${H - 80}" fill="none" stroke="#C3A26A" stroke-width=".8"/>`;
  s += o.cluster(70, 70, 150, { dir: 40, seed: 1 }) + o.cluster(W - 70, H - 70, 150, { dir: 220, seed: 2 });
  s += o.cluster(W - 60, 80, 105, { dir: 140, seed: 3 }) + o.cluster(60, H - 80, 105, { dir: -40, seed: 4 });
  s += `<g transform="translate(${W / 2} 150) scale(.5)">${monogram()}</g>`;
  s += `<g transform="translate(${(W - wmBig.w) / 2} 220)">${wmBig.svg}</g>`;
  s += `<path d="${centred(fonts.label, 'ARE GETTING MARRIED', 22, W / 2, 420, 8)}" fill="#8E5A61"/>`;
  s += `<g transform="translate(${W / 2 - 150} 440)">${o.divider(300)}</g>`;
  s += `<path d="${centred(fonts.serif, wedding.ceremony.dateLabel + ' · ' + wedding.ceremony.timeLabel, 40, W / 2, 512)}" fill="#4A3B36"/>`;
  s += `<path d="${centred(fonts.serifItalic, `${wedding.ceremony.venue}, ${wedding.ceremony.town}, ${wedding.ceremony.region}`, 32, W / 2, 556)}" fill="#6B5A52"/>`;
  png(doc(`0 0 ${W} ${H}`, s, { w: W, h: H }), pub('og-image.png'));
}

/* 9. QR code for the public site */
{
  const url = wedding.siteUrl;
  const qr = QRCode.create(url, { errorCorrectionLevel: 'H' });
  const n = qr.modules.size;
  const quiet = 4, cell = 10, size = (n + quiet * 2) * cell;
  let rects = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    if (qr.modules.get(x, y)) rects += `M${(x + quiet) * cell} ${(y + quiet) * cell}h${cell}v${cell}h-${cell}z`;
  }
  // Centre badge ≈ 18% of the width — well inside level-H error correction (30%)
  const badge = Math.round((n * cell) * 0.2);
  const c = size / 2;
  const centre = `<rect x="${c - badge / 2 - 6}" y="${c - badge / 2 - 6}" width="${badge + 12}" height="${badge + 12}" rx="${badge * 0.2}" fill="#FFFFFF"/>` +
    `<g transform="translate(${c} ${c}) scale(${badge / 300})">${monogram({ ornaments: false, color: '#4A3B36' })}</g>`;
  const qrSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><title>QR code: ${url}</title>` +
    `<rect width="${size}" height="${size}" fill="#FFFFFF"/><path d="${rects}" fill="#3A2E2A"/>${centre}</svg>`;
  write(pub('qr', 'wedding-qr.svg'), qrSvg);
  png(qrSvg, pub('qr', 'wedding-qr.png'), 1200);
  fs.writeFileSync(pub('qr', 'README.txt'), `This QR code opens: ${url}\nRegenerate with  npm run assets  after changing siteUrl in src/config/wedding.ts\n`);
  console.log('QR →', url);
}

console.log('✓ Brand assets, favicons, social image and QR code written to /public');
