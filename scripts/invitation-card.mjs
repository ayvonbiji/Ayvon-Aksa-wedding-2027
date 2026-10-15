/**
 * Builds the downloadable wedding invitation (same design as the website's
 * "Our Wedding Invitation" card, wide layout):
 *   public/downloads/ayvon-aksa-wedding-invitation.jpg  1800 × 2700 px (6 × 9 in at 300 dpi)
 *   public/downloads/ayvon-aksa-wedding-invitation.pdf  page 1: 6 × 9 in card; page 2: card centred on A4
 *
 * All wording comes from src/config/wedding.ts. Text is converted to vector
 * outlines with the site's own fonts, so it prints crisply everywhere.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import { Resvg } from '@resvg/resvg-js';
import * as o from '../src/art/ornaments.js';
import { monogram, fonts, textPath } from './logo-art.mjs';
import { wedding } from '../src/config/wedding.ts';

const W = 1200;
const H = 1800;
const U = W / 100; // 1 "cqw" of the website card
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

// Fine-line icons (same paths as src/components/Icon.tsx)
const ICON = {
  calendar: 'M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm3 8h2m3 0h2m-7 4h2m3 0h2',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v4.5l3 2',
  pin: 'M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
};

const width = (font, text, size, ls = 0) => textPath(font, text, size, 0, 0, ls).width;
/** Text path centred on cx (baseline y). */
const centre = (font, text, size, cx, y, fill, ls = 0) =>
  `<path d="${textPath(font, text, size, cx - width(font, text, size, ls) / 2, y, ls).d}" fill="${fill}"/>`;
const left = (font, text, size, x, y, fill, ls = 0) => `<path d="${textPath(font, text, size, x, y, ls).d}" fill="${fill}"/>`;
/** Greedy word wrap by measured width. */
function wrap(font, text, size, max) {
  const lines = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && width(font, next, size) > max) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

export async function buildInvitation(publicDir) {
  const inv = wedding.invitation;
  const c = wedding.ceremony;
  const e = wedding.engagement;
  const INK = '#2F2224', SOFT = '#5A4646', GOLDTXT = '#7A5A24', BURG = '#6B1E33', GREEN = '#2E4A36';
  const s = [];

  /* paper */
  s.push(`<linearGradient id="pp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FCF7EE"/><stop offset="1" stop-color="#F8EEDD"/></linearGradient>`);
  s.push(`<radialGradient id="ph" cx=".7" cy=".18" r=".55"><stop offset="0" stop-color="#FFFDF8"/><stop offset="1" stop-color="#FFFDF8" stop-opacity="0"/></radialGradient>`);
  s.push(`<radialGradient id="pb" cx=".6" cy="1" r=".6"><stop offset="0" stop-color="#F1E2C8"/><stop offset="1" stop-color="#F1E2C8" stop-opacity="0"/></radialGradient>`);
  s.push(`<rect width="${W}" height="${H}" fill="url(#pp)"/><rect width="${W}" height="${H}" fill="url(#ph)"/><rect width="${W}" height="${H}" fill="url(#pb)"/>`);

  /* church interior, left 47%, fading to the right */
  const cw = 47 * U;
  const scale = Math.max(cw / 400, H / 1000);
  s.push(`<linearGradient id="cf" x1="0" y1="0" x2="1" y2="0"><stop offset=".72" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`);
  s.push(`<mask id="cm" maskUnits="userSpaceOnUse" x="0" y="0" width="${cw}" height="${H}"><rect width="${cw}" height="${H}" fill="url(#cf)"/></mask>`);
  s.push(`<clipPath id="cc"><rect width="${cw}" height="${H}"/></clipPath>`);
  s.push(`<g clip-path="url(#cc)" mask="url(#cm)"><g transform="translate(${(cw - 400 * scale) / 2} 0) scale(${scale})">${o.churchScene()}</g></g>`);
  s.push(`<radialGradient id="gl" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFFCF0" stop-opacity=".85"/><stop offset=".65" stop-color="#FFF6DE" stop-opacity="0"/></radialGradient>`);
  s.push(`<ellipse cx="${23 * U}" cy="${45 * U}" rx="${30 * U}" ry="${35 * U}" fill="url(#gl)"/>`);

  /* frame and gold corners */
  s.push(`<rect x="${2.2 * U}" y="${2.2 * U}" width="${W - 4.4 * U}" height="${H - 4.4 * U}" fill="none" stroke="#C9A86A" stroke-width="${0.25 * U}"/>`);
  s.push(`<rect x="${3 * U}" y="${3 * U}" width="${W - 6 * U}" height="${H - 6 * U}" fill="none" stroke="#C9A86A" stroke-opacity=".75" stroke-width="${0.12 * U}"/>`);
  const k = (9 * U) / 110, m = 1.2 * U;
  const corner = o.goldCorner();
  s.push(`<g transform="translate(${m} ${m}) scale(${k})">${corner}</g>`);
  s.push(`<g transform="translate(${W - m} ${m}) scale(${-k} ${k})">${corner}</g>`);
  s.push(`<g transform="translate(${m} ${H - m}) scale(${k} ${-k})">${corner}</g>`);
  s.push(`<g transform="translate(${W - m} ${H - m}) scale(${-k} ${-k})">${corner}</g>`);

  /* roses top-right, vine bottom-right */
  const rk = (25 * U) / 360;
  s.push(`<g transform="translate(${W + 2.5 * U} ${-2.5 * U}) scale(${-rk} ${rk}) translate(20 20)">${o.roseCorner()}</g>`);
  const vk = (6 * U) / 50;
  s.push(`<g transform="translate(${W - 0.6 * U - 6 * U} ${H - 6 * U - 260 * vk}) scale(${vk})">${o.sideVine()}</g>`);

  /* text column */
  const cx = (39 * U + (100 - 5.5) * U) / 2;
  let y = 5.6 * U;
  s.push(`<g transform="translate(${cx} ${y + 4.5 * U}) scale(${(9 * U) / 300})">${monogram()}</g>`);
  y += 9 * U + 0.4 * U;
  const vs = 2.3 * U;
  y += vs;
  s.push(centre(fonts.serifItalic, `“${inv.verse.text}”`, vs, cx, y, INK));
  y += vs * 1.3;
  s.push(centre(fonts.serifRegular, `— ${inv.verse.reference} (${inv.verse.translation})`, vs * 0.95, cx, y, GOLDTXT));
  y += 0.9 * U;
  s.push(`<g transform="translate(${cx - 5.5 * U} ${y}) scale(${(11 * U) / 120})">${o.fleuron()}</g>`);
  y += (11 * U * 36) / 120;
  const ts = 9.4 * U;
  const words = inv.title.split(' ');
  const lastWord = words.pop();
  y += ts * 0.78;
  s.push(centre(fonts.script, words.join(' '), ts, cx, y, 'url(#aa-gold)'));
  y += ts * 0.86;
  s.push(centre(fonts.script, lastWord, ts, cx, y, 'url(#aa-gold)'));
  y += ts * 0.28;
  s.push(`<g transform="translate(${cx - 9 * U} ${y}) scale(${(18 * U) / 220})">${o.heartDivider()}</g>`);
  y += (18 * U * 20) / 220 + 0.8 * U;
  const is = 2.42 * U;
  for (const line of wrap(fonts.serifRegular, inv.invite, is, 50 * U)) {
    y += is * 1.38;
    s.push(centre(fonts.serifRegular, line, is, cx, y - is * 0.3, INK));
  }
  const person = (who, colour) => {
    y += 1.6 * U;
    const ns = 6.9 * U;
    y += ns * 0.82;
    s.push(centre(fonts.script, who.full, ns, cx, y, colour));
    y += ns * 0.18;
    const ps = 2.2 * U;
    y += ps * 1.15;
    s.push(centre(fonts.serifItalic, who.relation, ps * 0.92, cx, y, SOFT));
    y += ps * 1.3;
    s.push(centre(fonts.serifRegular, who.parents, ps, cx, y, INK));
    const hs = 1.55 * U;
    y += hs * 1.9;
    s.push(centre(fonts.roman, `${who.house} House`.toUpperCase(), hs, cx, y, GOLDTXT, hs * 0.24));
  };
  person(wedding.groom, GREEN);
  y += 1.8 * U;
  const as = 5.6 * U;
  s.push(`<g transform="translate(${cx - as * 0.35 - 9 * U} ${y + 0.8 * U}) scale(${(8 * U) / 160})">${o.sprig(150, 20, 140, { dir: 180, curl: -0.3 })}</g>`);
  s.push(`<g transform="translate(${cx + as * 0.35 + 1 * U} ${y + 0.8 * U}) scale(${(8 * U) / 160})">${o.sprig(10, 20, 140, { dir: 0, curl: 0.3 })}</g>`);
  s.push(centre(fonts.script, '&', as, cx, y + as * 0.62, 'url(#aa-gold)'));
  y += as * 0.5;
  person(wedding.bride, BURG);

  /* events, right of the photo */
  const ex = (39 + 11.5) * U;
  const exEnd = W - 5.5 * U;
  const badge = 8 * U;
  const tx = ex + badge + 1.9 * U + 1.7 * U;
  const rs = 2.1 * U;
  const icon = (name, x, yy) =>
    `<path d="${ICON[name]}" transform="translate(${x} ${yy - rs * 0.85}) scale(${(rs * 1.05) / 24})" fill="none" stroke="#B08A4A" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  const events = [];
  if (e.show) events.push({ title: e.title, badge: o.ringsBadge(), date: e.shortDateLabel, day: e.dateLabel.split(',')[0], time: e.timeLabel, venue: e.venue || e.venuePlaceholder, place: e.place });
  events.push({ title: 'Wedding Ceremony', badge: o.crossBadge(), date: c.shortDateLabel, day: c.dateLabel.split(',')[0], time: c.timeLabel, venue: c.venue, place: `${c.town}, ${c.region}, ${c.country}` });
  y += 2.6 * U;
  events.forEach((ev, i) => {
    if (i > 0) {
      y += 1.1 * U;
      const dw = (exEnd - ex) * 0.7;
      s.push(`<g transform="translate(${(ex + exEnd) / 2 - dw / 2} ${y}) scale(${dw / 300})">${o.goldDivider()}</g>`);
      y += (dw / 300) * 24 + 1.1 * U;
    }
    const top = y;
    const ttl = 2.45 * U;
    y += ttl;
    const lines = [left(fonts.roman, ev.title.toUpperCase(), ttl, tx, y, BURG, ttl * 0.05)];
    y += 0.4 * U;
    const row = (name, parts) => {
      y += rs * 1.28;
      lines.push(icon(name, tx, y));
      let x = tx + rs * 1.65;
      for (const [font, text, fill] of parts) {
        lines.push(left(font, text, rs, x, y, fill));
        x += width(font, text, rs);
      }
    };
    row('calendar', [[fonts.serifRegular, `${ev.date} `, INK], [fonts.serifRegular, ' | ', '#C9A86A'], [fonts.serifRegular, ` ${ev.day}`, INK]]);
    row('clock', [[fonts.serifRegular, ev.time, INK]]);
    const maxW = exEnd - tx - rs * 1.65;
    const venueLines = wrap(fonts.serif, ev.venue, rs, maxW);
    venueLines.forEach((line, li) => (li ? (y += rs * 1.28, lines.push(left(fonts.serif, line, rs, tx + rs * 1.65, y, INK))) : row('pin', [[fonts.serif, line, INK]])));
    for (const line of wrap(fonts.serifRegular, ev.place, rs * 0.9, maxW)) {
      y += rs * 0.9 * 1.3;
      lines.push(left(fonts.serifRegular, line, rs * 0.9, tx + rs * 1.65, y, SOFT));
    }
    y += 0.5 * U;
    const mid = (top + y) / 2;
    s.push(`<line x1="${tx - 1.7 * U}" y1="${top}" x2="${tx - 1.7 * U}" y2="${y}" stroke="#C9A86A" stroke-width="${0.14 * U}"/>`);
    s.push(`<g transform="translate(${ex} ${mid - badge / 2}) scale(${badge / 60})">${ev.badge}</g>`);
    s.push(...lines);
  });

  /* closing line, bottom of the events column */
  const cs = 2.15 * U;
  const closeX = (ex + exEnd) / 2;
  const closeLines = wrap(fonts.serifRegular, inv.closing, cs, (exEnd - ex) * 0.62);
  let cy = H - 4.6 * U - (16 * U * 20) / 220 - 0.4 * U - (closeLines.length - 1) * cs * 1.35 - cs * 0.35;
  for (const line of closeLines) {
    s.push(centre(fonts.serifRegular, line, cs, closeX, cy, GOLDTXT, cs * 0.04));
    cy += cs * 1.35;
  }
  s.push(`<g transform="translate(${closeX - 8 * U} ${cy - cs * 0.9}) scale(${(16 * U) / 220})">${o.heartDivider()}</g>`);

  /* couple photo with flowers, bottom-left */
  const photoFile = path.join(publicDir, inv.photo);
  const meta = await sharp(photoFile).metadata();
  const photoPng = await sharp(photoFile).png().toBuffer();
  const pw = 51 * U;
  const ph = (pw * meta.height) / meta.width;
  s.push(`<image x="0" y="${H - ph}" width="${pw}" height="${ph}" href="data:image/png;base64,${photoPng.toString('base64')}"/>`);
  const fk = (38 * U) / 300;
  s.push(`<g transform="translate(${-8 * U} ${H + 7 * U - 220 * fk}) scale(${fk})">${o.cluster(120, 120, 110, { dir: -40, seed: 2 }) + o.sprig(200, 140, 120, { dir: -20 }) + o.sprig(60, 70, 100, { dir: -110, curl: -0.3 })}</g>`);

  if (y > H - 14 * U) throw new Error(`Invitation text overflows the card (y=${Math.round(y)})`);

  const title = `${wedding.groom.full} & ${wedding.bride.full} — Wedding Invitation`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><title>${esc(title)}</title>${o.defs()}${s.join('')}</svg>`;

  const out = path.join(publicDir, path.dirname(inv.pdf));
  fs.mkdirSync(out, { recursive: true });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1800 } }).render().asPng();
  const jpg = await sharp(png).jpeg({ quality: 88, mozjpeg: true }).withMetadata({ density: 300 }).toBuffer();
  fs.writeFileSync(path.join(publicDir, inv.image), jpg);

  const pdf = await PDFDocument.create();
  pdf.setTitle(title);
  pdf.setAuthor(`${wedding.groom.first} & ${wedding.bride.first}`);
  pdf.setCreator('Ayvon & Aksa wedding website');
  pdf.setSubject(`Engagement ${e.dateLabel}, ${e.timeLabel} · Wedding ${c.dateLabel}, ${c.timeLabel}`);
  const img = await pdf.embedJpg(jpg);
  pdf.addPage([432, 648]).drawImage(img, { x: 0, y: 0, width: 432, height: 648 }); // 6 × 9 in
  const a4 = pdf.addPage([595.28, 841.89]); // A4 portrait, card centred
  const aw = 500, ah = 750;
  a4.drawImage(img, { x: (595.28 - aw) / 2, y: (841.89 - ah) / 2, width: aw, height: ah });
  fs.writeFileSync(path.join(publicDir, inv.pdf), await pdf.save());
  return { svg, jpgBytes: jpg.length };
}
