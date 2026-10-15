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
import { PDFDocument } from 'pdf-lib';
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
const monoInk = doc('-150 -150 300 300', `<title>${names} monogram</title>${monogram({ color: '#2F2224' })}`, { w: 300, h: 300 });
write(pub('brand', 'monogram-mono.svg'), monoInk);
write(pub('brand', 'monogram-mono-white.svg'), monoInk.replaceAll('#2F2224', '#FFFFFF').replaceAll('stroke="#FFFFFF" stroke-width="3"', 'stroke="none" stroke-width="3"'));

/* 4. Wordmark */
const wm = wordmark();
const wmSvg = doc(`0 0 ${wm.w} ${wm.h}`, `<title>${names}</title>${wm.svg}`, { w: wm.w, h: wm.h });
write(pub('brand', 'wordmark.svg'), wmSvg);
png(wmSvg, pub('brand', 'wordmark-transparent.png'), 1600);
const wmMono = wordmark({ color: '#2F2224' });
write(pub('brand', 'wordmark-mono.svg'), doc(`0 0 ${wmMono.w} ${wmMono.h}`, `<title>${names}</title>${wmMono.svg}`, { w: wmMono.w, h: wmMono.h }));

/* 5. Compact header logo: letters only inside a fine ring */
const compact = doc('-150 -150 300 300', `<title>${names}</title><circle r="146" fill="#FBF6EE"/><circle r="138" fill="none" stroke="url(#aa-goldline)" stroke-width="6"/>${monogram({ ornaments: false })}`, { w: 300, h: 300 });
write(pub('brand', 'logo-header.svg'), compact);
/* 5b. Wax seal for the invitation envelope: burgundy wax, gold rim, laurel, crown, gold A & A */
{
  // irregular wax edge
  let edge = '';
  const N = 36;
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2;
    const r = 138 + Math.sin(i * 2.7) * 5 + Math.cos(i * 1.3) * 4;
    edge += `${i ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`;
  }
  let laurel = '';
  for (const side of [-1, 1]) for (let i = 0; i < 8; i++) {
    const a = Math.PI / 2 + side * (0.35 + i * 0.16);
    const r = 98;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    const rot = (a * 180) / Math.PI + side * 90 + (i % 2 ? 24 : -24) * side;
    laurel += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="9" ry="3.6" transform="rotate(${rot.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="url(#aa-gold)"/>`;
  }
  const crown = `<g transform="translate(0 -100)" fill="url(#aa-gold)"><path d="M-22 6 L-26 -12 L-13 -3 L0 -18 L13 -3 L26 -12 L22 6 Z"/><rect x="-22" y="6" width="44" height="5" rx="2"/><circle cx="-26" cy="-14" r="3"/><circle cx="0" cy="-21" r="3.4"/><circle cx="26" cy="-14" r="3"/></g>`;
  const inner =
    `<radialGradient id="wax" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="#B2475F"/><stop offset=".45" stop-color="#7A2239"/><stop offset="1" stop-color="#3E0C1A"/></radialGradient>` +
    `<radialGradient id="waxIn" cx=".5" cy=".55" r=".6"><stop offset="0" stop-color="#6E1B31"/><stop offset="1" stop-color="#4A1222"/></radialGradient>` +
    `<path d="${edge}Z" fill="url(#wax)"/>` +
    `<circle r="118" fill="url(#waxIn)" stroke="#2C0A14" stroke-opacity=".35" stroke-width="3"/>` +
    `<circle r="112" fill="none" stroke="url(#aa-gold)" stroke-width="4"/>` +
    `<circle r="104" fill="none" stroke="url(#aa-gold)" stroke-width="1.2" stroke-dasharray="2 5" stroke-linecap="round"/>` +
    laurel + crown +
    `<g transform="translate(0 8) scale(.62)">${monogram({ ornaments: false, color: 'url(#aa-gold)', knock: '#5A1628' })}</g>` +
    `<path d="M-92 -70 A118 118 0 0 1 -30 -112" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="7" stroke-linecap="round"/>`;
  const sealSvg = doc('-150 -150 300 300', `<title>${names} wax seal</title>${inner}`, { w: 300, h: 300 });
  write(pub('brand', 'wax-seal.svg'), sealSvg);
  png(sealSvg, pub('brand', 'wax-seal.png'), 600);
}


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
  `<circle r="150" fill="#FBF6EE"/><circle r="132" fill="none" stroke="url(#aa-goldline)" stroke-width="9"/>${monogram({ ornaments: false })}`, { w: 300, h: 300 });
write(pub('favicon.svg'), fav);
png(fav, pub('favicon-32.png'), 32);
png(fav, pub('icon-192.png'), 192);
png(fav, pub('icon-512.png'), 512);
const touch = doc('-150 -150 300 300',
  `<rect x="-150" y="-150" width="300" height="300" fill="#FBF6EE"/><circle r="118" fill="none" stroke="url(#aa-goldline)" stroke-width="6"/><g transform="scale(.82)">${monogram({ ornaments: false })}</g>`, { w: 300, h: 300 });
png(touch, pub('apple-touch-icon.png'), 180);

/* 8. Social-sharing image 1200×630 */
{
  const W = 1200, H = 630;
  const wmBig = wordmark({ size: 128 });
  let s = `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7A2239"/><stop offset="1" stop-color="#3E0C1A"/></linearGradient><rect width="${W}" height="${H}" fill="url(#bg)"/>`;
  s += `<radialGradient id="wash" cx=".5" cy=".45" r=".65"><stop offset="0" stop-color="#FFFCF6"/><stop offset=".75" stop-color="#F8EEDF"/><stop offset="1" stop-color="#EFDCC2"/></radialGradient><rect x="34" y="34" width="${W - 68}" height="${H - 68}" rx="6" fill="url(#wash)"/>`;
  s += `<rect x="50" y="50" width="${W - 100}" height="${H - 100}" fill="none" stroke="#B08A4A" stroke-width="2.5"/>`;
  s += `<rect x="60" y="60" width="${W - 120}" height="${H - 120}" fill="none" stroke="#B08A4A" stroke-width=".9"/>`;
  s += o.cluster(70, 70, 150, { dir: 40, seed: 1 }) + o.cluster(W - 70, H - 70, 150, { dir: 220, seed: 2 });
  s += o.cluster(W - 60, 80, 105, { dir: 140, seed: 3 }) + o.cluster(60, H - 80, 105, { dir: -40, seed: 4 });
  s += `<g transform="translate(${W / 2} 150) scale(.5)">${monogram()}</g>`;
  s += `<g transform="translate(${(W - wmBig.w) / 2} 220)">${wmBig.svg}</g>`;
  s += `<path d="${centred(fonts.label, 'ARE GETTING MARRIED', 22, W / 2, 420, 8)}" fill="#6B1E33"/>`;
  s += `<g transform="translate(${W / 2 - 150} 440)">${o.divider(300)}</g>`;
  s += `<path d="${centred(fonts.serif, wedding.ceremony.dateLabel + ' · ' + wedding.ceremony.timeLabel, 40, W / 2, 512)}" fill="#2F2224"/>`;
  s += `<path d="${centred(fonts.serifItalic, `${wedding.ceremony.venue}, ${wedding.ceremony.town}, ${wedding.ceremony.region}`, 32, W / 2, 556)}" fill="#6B5A52"/>`;
  png(doc(`0 0 ${W} ${H}`, s, { w: W, h: H }), pub('og-image.png'));
}

/* 9. Two QR codes: A = wedding website, B = guest photo upload */
const CAMERA = 'M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Zm8 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z';
/** QR as SVG markup (inner content + size). Level H, 4-module quiet zone. */
function qrInner(url, variant, cell = 10) {
  const qr = QRCode.create(url, { errorCorrectionLevel: 'H' });
  const n = qr.modules.size;
  const quiet = 4, size = (n + quiet * 2) * cell;
  let d = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    if (qr.modules.get(x, y)) d += `M${(x + quiet) * cell} ${(y + quiet) * cell}h${cell}v${cell}h-${cell}z`;
  }
  // Centre badge = 20% of the symbol width (4% of its area) — far inside level-H's 30% recovery
  const badge = n * cell * 0.2;
  const c = size / 2;
  let centre = `<rect x="${c - badge / 2 - cell / 2}" y="${c - badge / 2 - cell / 2}" width="${badge + cell}" height="${badge + cell}" rx="${badge * 0.2}" fill="#FFFFFF"/>`;
  centre += variant === 'site'
    ? `<g transform="translate(${c} ${c}) scale(${badge / 300})">${monogram({ ornaments: false, color: '#3A2E2A' })}</g>`
    : `<path d="${CAMERA}" transform="translate(${c - badge * 0.38} ${c - badge * 0.38}) scale(${(badge * 0.76) / 24})" fill="none" stroke="#3A2E2A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
  return { inner: `<rect width="${size}" height="${size}" fill="#FFFFFF"/><path d="${d}" fill="#3A2E2A" shape-rendering="crispEdges"/>${centre}`, size };
}

const uploadUrl = new URL(wedding.memories.uploadPath, wedding.siteUrl).href;
const QRS = [
  { key: 'site', url: wedding.siteUrl, file: 'ayvon-aksa-wedding-website-qr', label: 'Scan to Visit Our Wedding Website', heading: ['Visit Our', 'Wedding Website'] },
  { key: 'upload', url: uploadUrl, file: 'ayvon-aksa-upload-memories-qr', label: 'Scan to Share Your Wedding Memories', heading: ['Upload Your', 'Wedding Memories'] },
];
for (const name of ['wedding-qr.svg', 'wedding-qr.png', 'README.txt']) fs.rmSync(pub('qr', name), { force: true });
for (const q of QRS) {
  const { inner, size } = qrInner(q.url, q.key);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><title>${q.label}: ${q.url}</title>${inner}</svg>`;
  write(pub('qr', `${q.file}.svg`), svg);
  png(svg, pub('qr', `${q.file}.png`), 2000); // 2000 px ≈ 6.7 in at 300 dpi
  console.log(`QR ${q.key.padEnd(6)} → ${q.url}`);
}

/* 10. Printable QR card — 5 × 7 in portrait at 300 dpi (1500 × 2100 px) */
{
  const W = 1500, H = 2100;
  const card = [];
  card.push(`<rect width="${W}" height="${H}" fill="#FCF8F2"/>`);
  card.push(`<radialGradient id="cw" cx=".5" cy=".42" r=".75"><stop offset="0" stop-color="#FFFDF9"/><stop offset="1" stop-color="#F0DFC3"/></radialGradient><rect width="${W}" height="${H}" fill="url(#cw)"/>`);
  card.push(`<rect x="56" y="56" width="${W - 112}" height="${H - 112}" fill="none" stroke="#BC9A60" stroke-width="4"/>`);
  card.push(`<rect x="76" y="76" width="${W - 152}" height="${H - 152}" fill="none" stroke="#BC9A60" stroke-width="1.6"/>`);
  card.push(o.cluster(110, 110, 210, { dir: 45, seed: 1 }), o.cluster(W - 110, H - 110, 210, { dir: 225, seed: 2 }));
  card.push(o.sprig(W - 120, 150, 230, { dir: 150, curl: -0.25 }), o.sprig(110, H - 130, 170, { dir: -12, curl: -0.25 }));
  card.push(`<g transform="translate(${W / 2} 300) scale(.95)">${monogram()}</g>`);
  const wmc = wordmark({ size: 150 });
  card.push(`<g transform="translate(${(W - wmc.w) / 2} 455)">${wmc.svg}</g>`);
  card.push(`<path d="${centred(fonts.serifRegular, `${wedding.groom.full}  &  ${wedding.bride.full}`, 44, W / 2, 712)}" fill="#2F2224"/>`);
  card.push(`<path d="${centred(fonts.label, wedding.ceremony.shortDateLabel.toUpperCase(), 34, W / 2, 782, 12)}" fill="#7A5A24"/>`);
  card.push(`<g transform="translate(${W / 2 - 220} 812) scale(1.4667)">${o.divider(300)}</g>`);
  // two QR codes, clearly separated
  const qs = 560, gap = 140, top = 1030;
  QRS.forEach((q, i) => {
    const x = (W - (qs * 2 + gap)) / 2 + i * (qs + gap);
    const { inner, size } = qrInner(q.url, q.key);
    q.heading.forEach((line, li) => card.push(`<path d="${centred(fonts.script, line, 58, x + qs / 2, top - 112 + li * 64)}" fill="#6B1E33"/>`));
    card.push(`<rect x="${x - 14}" y="${top - 14}" width="${qs + 28}" height="${qs + 28}" rx="22" fill="#FFFFFF" stroke="#BC9A60" stroke-width="3"/>`);
    card.push(`<g transform="translate(${x} ${top}) scale(${qs / size})">${inner}</g>`);
    card.push(`<path d="${centred(fonts.label, q.label.toUpperCase(), 22, x + qs / 2, top + qs + 70, 3.5)}" fill="${i ? '#8A2E45' : '#7A5A24'}"/>`);
    card.push(`<path d="${centred(fonts.serifItalic, q.url.replace(/^https?:\/\//, '').replace(/\/$/, ''), 24, x + qs / 2, top + qs + 112)}" fill="#5A4646"/>`);
  });
  card.push(`<line x1="${W / 2}" y1="${top + 20}" x2="${W / 2}" y2="${top + qs - 20}" stroke="#D9C3A0" stroke-width="2" stroke-dasharray="4 10"/>`);
  card.push(`<path d="${centred(fonts.serifItalic, 'Please scan, celebrate with us, and share the moments you capture.', 38, W / 2, 1810)}" fill="#2F2224"/>`);
  card.push(`<path d="${centred(fonts.label, `${wedding.ceremony.timeLabel}  ·  ${wedding.ceremony.venue.toUpperCase()}, ${wedding.ceremony.town.toUpperCase()}`, 24, W / 2, 1872, 4)}" fill="#7A5A24"/>`);
  const cardSvg = doc(`0 0 ${W} ${H}`, `<title>${names} — QR card</title>${card.join('')}`, { w: W, h: H });
  write(pub('qr', 'ayvon-aksa-qr-card.svg'), cardSvg);
  const cardPng = new Resvg(cardSvg, { fitTo: { mode: 'width', value: W } }).render().asPng();
  fs.writeFileSync(pub('qr', 'ayvon-aksa-qr-card.png'), cardPng);
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${wedding.groom.first} & ${wedding.bride.first} — wedding QR card`);
  pdf.setCreator('Ayvon & Aksa wedding website');
  const page = pdf.addPage([360, 504]); // 5 × 7 in
  const img = await pdf.embedPng(cardPng);
  page.drawImage(img, { x: 0, y: 0, width: 360, height: 504 });
  // A4 sheet with two cards side by side for home printing
  const a4 = pdf.addPage([842, 595]); // A4 landscape
  const cw = 360 * 0.98, ch = 504 * 0.98;
  [0, 1].forEach((i) => a4.drawImage(img, { x: (842 - 2 * cw - 30) / 2 + i * (cw + 30), y: (595 - ch) / 2, width: cw, height: ch }));
  fs.writeFileSync(pub('qr', 'ayvon-aksa-qr-card.pdf'), await pdf.save());
}

fs.writeFileSync(pub('qr', 'QR-DESTINATIONS.txt'),
  `Ayvon & Aksa — wedding QR codes\n\n` +
  QRS.map((q) => `${q.label}\n  ${q.url}\n  files: ${q.file}.png / ${q.file}.svg`).join('\n\n') +
  `\n\nPrintable card: ayvon-aksa-qr-card.pdf (page 1: 5×7 in card, page 2: two cards on A4) and ayvon-aksa-qr-card.png (1500×2100, 300 dpi).\n` +
  `These files are regenerated by  npm run assets  (also part of npm run build) from siteUrl and memories.uploadPath in src/config/wedding.ts.\n`);

console.log('✓ Brand assets, favicons, social image, QR codes and QR card written to /public');
