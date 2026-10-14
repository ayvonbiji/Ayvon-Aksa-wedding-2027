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
  script: load('@fontsource/great-vibes', 'great-vibes-latin-400-normal.woff'),
  label: load('@fontsource/jost', 'jost-latin-500-normal.woff'),
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
 * Interlocked A & A monogram glyphs, centred at (0,0), height ≈ 200.
 * Returns path data for: serif A, script A, ampersand.
 */
export function monogramGlyphs() {
  // Upright serif "A" (Ayvon) interlaced with an italic serif "A" (Aksa)
  const size = 190;
  const A1 = textPath(fonts.serif, 'A', size, 0, 0).bbox;
  const A2 = textPath(fonts.serifItalic, 'A', size * 1.04, 0, 0).bbox;
  const w1 = A1.x2 - A1.x1, w2 = A2.x2 - A2.x1;
  const overlap = w1 * 0.42;
  const total = w1 + w2 - overlap;
  const x1 = -total / 2 - A1.x1;
  const x2 = -total / 2 + w1 - overlap - A2.x1;
  const h = A1.y2 - A1.y1;
  const base = h / 2 - 6;
  const serif = textPath(fonts.serif, 'A', size, x1, base).d;
  const script = textPath(fonts.serifItalic, 'A', size * 1.04, x2, base + 10).d;
  const amp = centred(fonts.script, '&', 62, 2, -h / 2 - 2);
  return { serif, script, amp };
}

/** Primary monogram (inner content; viewBox -150 -150 300 300). */
export function monogram({ p = 'aa', color = null, ornaments = true } = {}) {
  const g = monogramGlyphs();
  const gold = color || `url(#${p}-gold)`;
  const line = color || `url(#${p}-goldline)`;
  let s = '';
  if (ornaments) {
    s += `<circle r="128" fill="none" stroke="${line}" stroke-width="2"/>`;
    s += `<circle r="120" fill="none" stroke="${line}" stroke-width=".8"/>`;
    s += `<circle r="135" fill="none" stroke="${line}" stroke-width=".6" stroke-dasharray="1 5" stroke-linecap="round"/>`;
    if (!color) {
      s += o.sprig(-30, 118, 92, { dir: 192, p, curl: -0.3 });
      s += o.sprig(30, 118, 92, { dir: -12, p, curl: 0.3 });
      s += o.rose(0, 122, 17, { tone: 'blush', p });
      s += o.rose(-20, 128, 10, { tone: 'ivory', p, rot: 30 });
      s += o.rose(20, 128, 10, { tone: 'ivory', p, rot: 60 });
    } else {
      s += `<g fill="${color}">${[-1, 1].map((sd) => [0, 1, 2, 3].map((i) => `<ellipse cx="${sd * (22 + i * 16)}" cy="${124 - i * i * 2.4}" rx="7" ry="3" transform="rotate(${sd * (12 + i * 9)} ${sd * (22 + i * 16)} ${124 - i * i * 2.4})"/>`).join('')).join('')}<circle cy="124" r="5"/></g>`;
    }
    s += `<path d="M0 -136 L5 -128 L0 -120 L-5 -128Z" fill="${gold}"/>`;
  }
  s += `<path d="${g.serif}" fill="${gold}"/>`;
  s += `<path d="${g.script}" fill="${gold}" stroke="${color ? '#FFFFFF' : '#FFFDF8'}" stroke-width="3" paint-order="stroke"/>`;
  s += `<path d="${g.amp}" fill="${gold}"/>`;
  return s;
}

/** Wordmark "Ayvon & Aksa" (inner content), returns { svg, w, h }. */
export function wordmark({ p = 'aa', color = null, size = 120 } = {}) {
  const ink = color || `url(#${p}-gold)`;
  const a = textPath(fonts.script, 'Ayvon', size, 0, 0);
  const amp = textPath(fonts.serifItalic, '&', size * 0.62, 0, 0);
  const b = textPath(fonts.script, 'Aksa', size, 0, 0);
  const gap = size * 0.16;
  const total = a.width + gap + amp.width + gap + b.width;
  const pad = size * 0.25;
  const base = size * 0.95;
  let x = pad;
  const pa = textPath(fonts.script, 'Ayvon', size, x, base).d;
  x += a.width + gap;
  const pm = textPath(fonts.serifItalic, '&', size * 0.62, x, base - size * 0.02).d;
  x += amp.width + gap;
  const pb = textPath(fonts.script, 'Aksa', size, x, base).d;
  const w = Math.ceil(total + pad * 2);
  const h = Math.ceil(size * 1.45);
  const svg = `<path d="${pa}" fill="${ink}"/><path d="${pm}" fill="${color || `url(#${p}-goldline)`}"/><path d="${pb}" fill="${ink}"/>`;
  return { svg, w, h };
}
