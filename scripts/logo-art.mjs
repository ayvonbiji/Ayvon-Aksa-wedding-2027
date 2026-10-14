/**
 * Builds the Ayvon & Aksa logo artwork as pure SVG paths (no font needed at
 * runtime). Uses the same typefaces as the website, converted to outlines.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import opentype from 'opentype.js';
import * as o from '../src/art/ornaments.js';

const require = createRequire(import.meta.url);
const fontFile = (pkg, file) => path.join(path.dirname(require.resolve(`${pkg}/package.json`)), 'files', file);
const load = (pkg, file) => {
  const buf = fs.readFileSync(fontFile(pkg, file));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
};

export const fonts = {
  serif: load('@fontsource/cormorant-garamond', 'cormorant-garamond-latin-600-normal.woff'),
  serifItalic: load('@fontsource/cormorant-garamond', 'cormorant-garamond-latin-500-italic.woff'),
  serifRegular: load('@fontsource/cormorant-garamond', 'cormorant-garamond-latin-500-normal.woff'),
  script: load('@fontsource/corinthia', 'corinthia-latin-700-normal.woff'),
  label: load('@fontsource/jost', 'jost-latin-500-normal.woff'),
  roman: load('@fontsource/cinzel', 'cinzel-latin-600-normal.woff'),
  romanBold: load('@fontsource/cinzel', 'cinzel-latin-700-normal.woff'),
  names: load('@fontsource/corinthia', 'corinthia-latin-700-normal.woff'),
};

/** Serialise path commands (opentype's toPathData mis-prints some floats as NaN). */
const r2 = (v) => String(Math.round(v * 100) / 100);
function pathData(cmds) {
  let d = '';
  for (const c of cmds) {
    if (c.type === 'M' || c.type === 'L') d += `${c.type}${r2(c.x)} ${r2(c.y)}`;
    else if (c.type === 'Q') d += `Q${r2(c.x1)} ${r2(c.y1)} ${r2(c.x)} ${r2(c.y)}`;
    else if (c.type === 'C') d += `C${r2(c.x1)} ${r2(c.y1)} ${r2(c.x2)} ${r2(c.y2)} ${r2(c.x)} ${r2(c.y)}`;
    else if (c.type === 'Z') d += 'Z';
  }
  return d;
}

/** Simple glyph layout (char map + pair kerning), avoiding GSUB quirks. */
function layout(font, text, size, x, y, letterSpacing = 0) {
  const scale = size / font.unitsPerEm;
  const glyphs = [...text].map((ch) => font.charToGlyph(ch));
  const parts = [];
  let cx = x;
  glyphs.forEach((g, i) => {
    // opentype.js shares command objects between calls for repeated glyphs,
    // which corrupts coordinates; copy every command before offsetting.
    const src = g.getPath(0, y, size);
    const gp = new opentype.Path();
    gp.commands = src.commands.map((c) => {
      const n = { ...c };
      for (const k of ['x', 'x1', 'x2']) if (typeof n[k] === 'number') n[k] += cx;
      return n;
    });
    parts.push(gp);
    cx += g.advanceWidth * scale + letterSpacing;
    if (glyphs[i + 1]) {
      const k = font.getKerningValue(g, glyphs[i + 1]);
      if (Number.isFinite(k)) cx += k * scale;
    }
  });
  return { parts, width: cx - x - letterSpacing };
}

/** Text → { d, width, bbox } with baseline at y, starting at x. */
export function textPath(font, text, size, x = 0, y = 0, letterSpacing = 0) {
  const { parts, width } = layout(font, text, size, x, y, letterSpacing);
  let d = '';
  const bb = { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity };
  for (const p of parts) {
    d += pathData(p.commands);
    const b = p.getBoundingBox();
    if (b.x1 === b.x2) continue;
    bb.x1 = Math.min(bb.x1, b.x1); bb.y1 = Math.min(bb.y1, b.y1);
    bb.x2 = Math.max(bb.x2, b.x2); bb.y2 = Math.max(bb.y2, b.y2);
  }
  return { d, width, bbox: bb };
}

/** Text centred horizontally on cx. */
export function centred(font, text, size, cx, y, letterSpacing = 0) {
  const w = textPath(font, text, size, 0, 0, letterSpacing).width;
  return textPath(font, text, size, cx - w / 2, y, letterSpacing).d;
}

/**
 * Monogram glyphs: two Roman capital "A"s (Ayvon, Aksa) interlaced, with a
 * script ampersand nestled in the valley between their peaks.
 * Centred at (0,0) in a 300×300 box. Returns path data.
 */
export function monogramGlyphs() {
  const size = 200;
  const f = fonts.romanBold;
  const bb = textPath(f, 'A', size, 0, 0).bbox;
  const w = bb.x2 - bb.x1, h = bb.y2 - bb.y1;
  const overlap = w * 0.34;
  const total = w * 2 - overlap;
  const base = h / 2 + 6;                       // baseline so the pair is vertically centred
  const left = textPath(f, 'A', size, -total / 2 - bb.x1, base).d;
  const right = textPath(f, 'A', size, -total / 2 + w - overlap - bb.x1, base).d;
  const ampSize = 92;
  const amp = centred(fonts.names, '&', ampSize, 0, base - h * 0.62);
  return { left, right, amp, w: total, h };
}

/** Primary monogram (inner content; viewBox -150 -150 300 300). */
export function monogram({ p = 'aa', color = null, ornaments = true } = {}) {
  const g = monogramGlyphs();
  const gold = color || `url(#${p}-gold)`;
  const wine = color || `url(#${p}-wine)`;
  const line = color || `url(#${p}-goldline)`;
  const knock = color && color !== '#FFFFFF' ? '#FFFFFF' : color ? '#3A2E2A' : '#FFF9F0';
  let s = '';
  if (ornaments) {
    s += `<circle r="132" fill="none" stroke="${line}" stroke-width="2.4"/>`;
    s += `<circle r="124" fill="none" stroke="${line}" stroke-width=".9"/>`;
    s += `<circle r="140" fill="none" stroke="${line}" stroke-width=".7" stroke-dasharray="1 5" stroke-linecap="round"/>`;
    // laurel wreath around the lower half
    for (const side of [-1, 1]) {
      for (let i = 0; i < 9; i++) {
        const a = (Math.PI / 2) + side * (0.22 + i * 0.14);
        const r = 128 + (i % 2 ? 6 : -4);
        const x = Math.cos(a) * r, y = Math.sin(a) * r;
        // point the leaf along the wreath (direction of travel), tilted alternately in/out
        const rot = (a * 180) / Math.PI + side * 90 + (i % 2 ? 22 : -22) * side;
        s += color
          ? `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="8" ry="3.2" transform="rotate(${rot.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${color}"/>`
          : o.leaf(x, y, 17, rot, { p });
      }
    }
    s += color ? `<circle cy="132" r="6" fill="${color}"/>` : o.rose(0, 132, 13, { tone: 'deep', p }) + o.rose(-16, 128, 8, { tone: 'ivory', p }) + o.rose(16, 128, 8, { tone: 'ivory', p });
    s += `<path d="M0 -142 L6 -132 L0 -122 L-6 -132Z" fill="${gold}"/>`;
  }
  // left A (gold), right A (wine) woven over it with a thin knock-out edge
  s += `<g transform="${ornaments ? 'translate(0 -10) scale(.78)' : 'scale(.98)'}">`;
  s += `<path d="${g.left}" fill="${gold}"/>`;
  s += `<path d="${g.right}" fill="${wine}" stroke="${knock}" stroke-width="4" paint-order="stroke" stroke-linejoin="round"/>`;
  s += `<path d="${g.amp}" fill="${gold}" stroke="${knock}" stroke-width="3" paint-order="stroke"/>`;
  s += '</g>';
  return s;
}

/** Wordmark "Ayvon & Aksa" (inner content), returns { svg, w, h }. */
export function wordmark({ p = 'aa', color = null, size = 120 } = {}) {
  const ink = color || `url(#${p}-wine)`;
  const f = fonts.names;
  const a = textPath(f, 'Ayvon', size, 0, 0);
  const amp = textPath(fonts.serifItalic, '&', size * 0.5, 0, 0);
  const b = textPath(f, 'Aksa', size, 0, 0);
  const gap = size * 0.14;
  const total = a.width + gap + amp.width + gap + b.width;
  const pad = size * 0.22;
  const base = size * 0.92;
  let x = pad;
  const pa = textPath(f, 'Ayvon', size, x, base).d;
  x += a.width + gap;
  const pm = textPath(fonts.serifItalic, '&', size * 0.5, x, base - size * 0.04).d;
  x += amp.width + gap;
  const pb = textPath(f, 'Aksa', size, x, base).d;
  const w = Math.ceil(total + pad * 2);
  const h = Math.ceil(size * 1.3);
  const svg = `<path d="${pa}" fill="${ink}"/><path d="${pm}" fill="${color || `url(#${p}-gold)`}"/><path d="${pb}" fill="${ink}"/>`;
  return { svg, w, h };
}
