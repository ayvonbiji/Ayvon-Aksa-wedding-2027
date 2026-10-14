/**
 * Original botanical & ornamental artwork for the Ayvon & Aksa wedding site.
 *
 * Every function returns an SVG *fragment string*. The same code is used by
 * the React site (inlined into the page) and by `scripts/build-assets.mjs`
 * (logo files, favicon and social-sharing image), so the artwork stays
 * identical everywhere.
 *
 * Colours reference gradient ids created by `defs()` — include `defs()` once
 * per standalone SVG (the site renders it once in <SvgDefs />).
 *
 * Plain JavaScript (no TypeScript) so Node can import it without a build step.
 */

const f = (n) => Math.round(n * 100) / 100;

export const palette = {
  ivory: '#FCF8F2',
  cream: '#F6EDE2',
  blush: '#F3DCD8',
  rose: '#D99BA0',
  roseDeep: '#B9727A',
  mauve: '#8E5A61',
  gold: '#B8955A',
  goldLight: '#E2CB97',
  goldDeep: '#8F6D36',
  sage: '#9AA78A',
  sageDeep: '#6F7E62',
  ink: '#4A3B36',
};

/** Shared gradients. */
export function defs(p = 'aa') {
  return `<defs>
  <linearGradient id="${p}-gold" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#EAD7A6"/><stop offset=".35" stop-color="#C9A866"/>
    <stop offset=".6" stop-color="#A9843F"/><stop offset=".85" stop-color="#D8BE82"/><stop offset="1" stop-color="#9C7A3E"/>
  </linearGradient>
  <linearGradient id="${p}-goldline" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#CDB076"/><stop offset="1" stop-color="#A8864C"/>
  </linearGradient>
  <radialGradient id="${p}-petal" cx=".5" cy=".9" r=".9">
    <stop offset="0" stop-color="#C9848B"/><stop offset=".55" stop-color="#E5B3B4"/><stop offset="1" stop-color="#F8E4E1"/>
  </radialGradient>
  <radialGradient id="${p}-petalDeep" cx=".5" cy=".9" r=".9">
    <stop offset="0" stop-color="#A9616B"/><stop offset=".6" stop-color="#D3959A"/><stop offset="1" stop-color="#EDC7C6"/>
  </radialGradient>
  <radialGradient id="${p}-petalIvory" cx=".5" cy=".9" r=".9">
    <stop offset="0" stop-color="#E9D3BE"/><stop offset=".6" stop-color="#F6EADF"/><stop offset="1" stop-color="#FFFBF6"/>
  </radialGradient>
  <linearGradient id="${p}-leaf" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#B7C2A6"/><stop offset="1" stop-color="#7F8F70"/>
  </linearGradient>
  <linearGradient id="${p}-ribbon" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#F4D3D2"/><stop offset=".5" stop-color="#DFA4A8"/><stop offset="1" stop-color="#C47F87"/>
  </linearGradient>
  <linearGradient id="${p}-ribbonDark" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#C98990"/><stop offset="1" stop-color="#A9636D"/>
  </linearGradient>
  <linearGradient id="${p}-paper" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#FBF3E6"/><stop offset="1" stop-color="#F1E2CB"/>
  </linearGradient>
</defs>`;
}

const petalPath = (r, w = 0.62) =>
  `M0 0 C${f(-r * w)} ${f(-r * 0.25)} ${f(-r * w * 0.95)} ${f(-r * 0.95)} 0 ${f(-r * 1.05)} ` +
  `C${f(r * w * 0.95)} ${f(-r * 0.95)} ${f(r * w)} ${f(-r * 0.25)} 0 0Z`;

/** A layered rose seen from above. tone: 'blush' | 'deep' | 'ivory' */
export function rose(x, y, r, { tone = 'blush', rot = 0, p = 'aa' } = {}) {
  const fill = tone === 'deep' ? `${p}-petalDeep` : tone === 'ivory' ? `${p}-petalIvory` : `${p}-petal`;
  const edge = tone === 'ivory' ? '#E2C9AF' : tone === 'deep' ? '#B06C76' : '#D49BA0';
  const core = tone === 'ivory' ? '#C9A788' : tone === 'deep' ? '#86434E' : '#AD6872';
  const shade = tone === 'ivory' ? '#D8BFA4' : tone === 'deep' ? '#9C5560' : '#C4858D';
  const rings = [
    { n: 7, len: 1.0, off: 0, w: 0.74 },
    { n: 6, len: 0.8, off: 27, w: 0.7 },
    { n: 5, len: 0.6, off: 8, w: 0.66 },
    { n: 4, len: 0.4, off: 44, w: 0.64 },
    { n: 3, len: 0.24, off: 15, w: 0.7 },
  ];
  let k = Math.round(Math.abs(x * 7 + y * 13 + r * 3 + rot)) + 11;
  const rnd = () => ((k = (k * 9301 + 49297) % 233280) / 233280);
  let s = `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})">`;
  s += `<circle r="${f(r * 0.98)}" fill="${shade}" opacity=".18"/>`;
  rings.forEach((ring, ri) => {
    if (ri > 0) s += `<circle r="${f(r * ring.len * 0.78)}" fill="${shade}" opacity=".22"/>`;
    for (let i = 0; i < ring.n; i++) {
      const a = (360 / ring.n) * i + ring.off + (rnd() - 0.5) * 14;
      const L = r * ring.len * (0.92 + rnd() * 0.14);
      s += `<path d="${petalPath(L, ring.w)}" transform="rotate(${f(a)})" fill="url(#${fill})" stroke="${edge}" stroke-width="${f(Math.max(r * 0.018, 0.35))}"/>`;
      s += `<path d="M${f(-L * 0.4)} ${f(-L * 0.78)} Q0 ${f(-L * 1.0)} ${f(L * 0.4)} ${f(-L * 0.78)}" transform="rotate(${f(a)})" fill="none" stroke="#FFF6F3" stroke-width="${f(Math.max(r * 0.03, 0.4))}" opacity=".55" stroke-linecap="round"/>`;
    }
  });
  s += `<path d="M${f(-r * 0.1)} ${f(r * 0.02)} C${f(-r * 0.1)} ${f(-r * 0.13)} ${f(r * 0.12)} ${f(-r * 0.13)} ${f(r * 0.11)} ${f(r * 0.02)} C${f(r * 0.1)} ${f(r * 0.13)} ${f(-r * 0.05)} ${f(r * 0.12)} ${f(-r * 0.04)} ${f(r * 0.03)}" fill="none" stroke="${core}" stroke-width="${f(Math.max(r * 0.04, 0.5))}" stroke-linecap="round"/>`;
  return s + '</g>';
}

/** Almond leaf with mid-rib, pointing along +x before rotation. */
export function leaf(x, y, len, rot = 0, { p = 'aa', light = false } = {}) {
  const w = len * 0.36;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})">` +
    `<path d="M0 0 C${f(len * 0.3)} ${f(-w)} ${f(len * 0.75)} ${f(-w * 0.8)} ${f(len)} 0 C${f(len * 0.75)} ${f(w * 0.8)} ${f(len * 0.3)} ${f(w)} 0 0Z" fill="url(#${p}-leaf)" opacity="${light ? 0.55 : 0.9}"/>` +
    `<path d="M${f(len * 0.05)} 0 Q${f(len * 0.5)} ${f(-w * 0.12)} ${f(len * 0.92)} 0" stroke="#EEF0E4" stroke-width="${f(Math.max(len * 0.025, 0.4))}" fill="none" opacity=".7"/>` +
    '</g>';
}

/** Small five-petal blossom (filler flower). */
export function blossom(x, y, r, { color = '#FFF8F3', center = '#E3C27E' } = {}) {
  let s = `<g transform="translate(${f(x)} ${f(y)})">`;
  for (let i = 0; i < 5; i++) {
    s += `<ellipse cx="0" cy="${f(-r * 0.55)}" rx="${f(r * 0.38)}" ry="${f(r * 0.55)}" transform="rotate(${i * 72})" fill="${color}" stroke="#E8CFC9" stroke-width="${f(Math.max(r * 0.05, 0.3))}"/>`;
  }
  return s + `<circle r="${f(r * 0.22)}" fill="${center}"/></g>`;
}

/** Rose bud with sepals. */
export function bud(x, y, r, rot = 0, { p = 'aa' } = {}) {
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})">` +
    `<path d="M0 ${f(r * 0.2)} C${f(-r * 0.6)} ${f(-r * 0.2)} ${f(-r * 0.3)} ${f(-r)} 0 ${f(-r * 1.1)} C${f(r * 0.3)} ${f(-r)} ${f(r * 0.6)} ${f(-r * 0.2)} 0 ${f(r * 0.2)}Z" fill="url(#${p}-petalDeep)"/>` +
    `<path d="M0 ${f(r * 0.3)} C${f(-r * 0.5)} ${f(r * 0.1)} ${f(-r * 0.55)} ${f(-r * 0.35)} ${f(-r * 0.3)} ${f(-r * 0.55)} M0 ${f(r * 0.3)} C${f(r * 0.5)} ${f(r * 0.1)} ${f(r * 0.55)} ${f(-r * 0.35)} ${f(r * 0.3)} ${f(-r * 0.55)}" stroke="#7F8F70" stroke-width="${f(r * 0.12)}" fill="none" stroke-linecap="round"/>` +
    '</g>';
}

/** Cluster of tiny dots — baby's breath. */
export function breath(x, y, spread, n = 9, seed = 1) {
  let s = '';
  let k = seed * 9301;
  const rnd = () => ((k = (k * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < n; i++) {
    const a = rnd() * Math.PI * 2;
    const d = rnd() * spread;
    s += `<circle cx="${f(x + Math.cos(a) * d)}" cy="${f(y + Math.sin(a) * d)}" r="${f(spread * (0.07 + rnd() * 0.06))}" fill="#FFFDF9" stroke="#EAD9CF" stroke-width=".4"/>`;
  }
  return s;
}

/**
 * Floral cluster: a bouquet of roses, leaves, buds and fillers centred at (x,y).
 * size ≈ radius of the cluster. dir rotates the whole arrangement.
 */
export function cluster(x, y, size, { dir = 0, p = 'aa', seed = 1 } = {}) {
  const s = size;
  let g = `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(dir)})">`;
  g += sprig(0.1 * s, 0, 0.95 * s, { dir: -8, p, flowers: true, curl: 0.2 });
  g += sprig(-0.1 * s, 0, 0.95 * s, { dir: 188, p, flowers: true, curl: -0.2 });
  const leaves = [[-0.15, 0.1, 0.55, 150], [0.15, 0.12, 0.55, 30], [0, -0.1, 0.55, -95], [-0.2, -0.12, 0.5, -140], [0.22, -0.1, 0.5, -40], [0, 0.15, 0.48, 92]];
  for (const [lx, ly, ll, lr] of leaves) g += leaf(lx * s, ly * s, ll * s, lr + ((seed * 7) % 20) - 10, { p });
  g += bud(-0.55 * s, -0.3 * s, 0.11 * s, -60, { p });
  g += bud(0.52 * s, -0.34 * s, 0.1 * s, 55, { p });
  g += rose(-0.34 * s, 0.1 * s, 0.27 * s, { tone: seed % 3 === 2 ? 'ivory' : 'blush', rot: seed * 13, p });
  g += rose(0.34 * s, 0.12 * s, 0.25 * s, { tone: 'ivory', rot: seed * 29, p });
  g += rose(0, -0.1 * s, 0.33 * s, { tone: seed % 2 ? 'deep' : 'blush', rot: seed * 41, p });
  g += blossom(-0.02 * s, 0.34 * s, 0.09 * s);
  g += blossom(0.56 * s, 0.26 * s, 0.07 * s, { color: '#F7DEDC' });
  g += blossom(-0.58 * s, 0.3 * s, 0.07 * s);
  g += breath(0.62 * s, -0.05 * s, 0.13 * s, 7, seed);
  g += breath(-0.64 * s, -0.08 * s, 0.12 * s, 6, seed + 3);
  return g + '</g>';
}

/** Trailing botanical sprig: a curved stem with leaves and small flowers. */
export function sprig(x, y, len, { dir = 0, p = 'aa', flowers = true, curl = 0.25 } = {}) {
  const c = len * curl;
  let g = `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(dir)})">`;
  g += `<path d="M0 0 Q${f(len * 0.5)} ${f(-c)} ${f(len)} 0" fill="none" stroke="#8C9A7C" stroke-width="${f(Math.max(len * 0.012, 0.6))}" stroke-linecap="round"/>`;
  const n = 6;
  for (let i = 1; i <= n; i++) {
    const t = i / (n + 1);
    const px = len * t;
    const py = -c * 4 * t * (1 - t) * 0.5 * 2 / 2; // approx quadratic
    const side = i % 2 ? -1 : 1;
    g += leaf(px, py, len * (0.2 - t * 0.08), side * 45 - 10, { p, light: i % 3 === 0 });
  }
  if (flowers) {
    g += blossom(len, 0, len * 0.06);
    g += blossom(len * 0.55, -c * 0.6, len * 0.045, { color: '#F7DEDC' });
  }
  return g + '</g>';
}

/** Ribbon bow, centred at (x,y), width ≈ w. */
export function bow(x, y, w, { p = 'aa', tails = 1 } = {}) {
  const s = w / 100;
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})">` +
    // tails (tails < 1 shortens them)
    `<g transform="scale(1 ${tails})"><path d="M-4 4 C-14 26 -22 44 -34 62 L-26 60 L-22 70 C-12 50 -4 30 2 8Z" fill="url(#${p}-ribbonDark)"/>` +
    `<path d="M4 4 C14 26 22 44 34 62 L26 60 L22 70 C12 50 4 30 -2 8Z" fill="url(#${p}-ribbonDark)"/></g>` +
    // loops
    `<path d="M-2 0 C-20 -26 -52 -30 -50 -6 C-48 12 -20 10 -2 2Z" fill="url(#${p}-ribbon)" stroke="#C5878E" stroke-width="1"/>` +
    `<path d="M2 0 C20 -26 52 -30 50 -6 C48 12 20 10 2 2Z" fill="url(#${p}-ribbon)" stroke="#C5878E" stroke-width="1"/>` +
    `<path d="M-8 -2 C-22 -16 -38 -18 -40 -8" stroke="#FBE8E6" stroke-width="2" fill="none" opacity=".8" stroke-linecap="round"/>` +
    `<path d="M8 -2 C22 -16 38 -18 40 -8" stroke="#FBE8E6" stroke-width="2" fill="none" opacity=".8" stroke-linecap="round"/>` +
    // knot
    `<rect x="-8" y="-8" width="16" height="14" rx="6" fill="url(#${p}-ribbonDark)"/>` +
    `<path d="M-4 -5 Q0 -7 4 -5" stroke="#F2C9CB" stroke-width="1.5" fill="none"/>` +
    '</g>';
}

/** C-scroll flourish in gold line. */
export function scroll(x, y, size, { dir = 0, mirror = false, p = 'aa', width = 1.2 } = {}) {
  const s = size;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(dir)}) scale(${mirror ? -1 : 1} 1)" fill="none" stroke="url(#${p}-goldline)" stroke-width="${width}" stroke-linecap="round">` +
    `<path d="M0 0 C${f(s * 0.3)} ${f(-s * 0.35)} ${f(s * 0.75)} ${f(-s * 0.3)} ${f(s * 0.8)} ${f(-s * 0.05)} C${f(s * 0.84)} ${f(s * 0.14)} ${f(s * 0.62)} ${f(s * 0.2)} ${f(s * 0.56)} ${f(s * 0.06)}"/>` +
    `<path d="M0 0 C${f(-s * 0.2)} ${f(s * 0.22)} ${f(-s * 0.48)} ${f(s * 0.26)} ${f(-s * 0.54)} ${f(s * 0.08)} C${f(-s * 0.58)} ${f(-s * 0.06)} ${f(-s * 0.44)} ${f(-s * 0.12)} ${f(-s * 0.38)} ${f(-s * 0.02)}"/>` +
    `<circle cx="${f(s * 0.56)}" cy="${f(s * 0.06)}" r="${f(width * 0.9)}" fill="url(#${p}-goldline)" stroke="none"/>` +
    `<circle cx="${f(-s * 0.38)}" cy="${f(-s * 0.02)}" r="${f(width * 0.8)}" fill="url(#${p}-goldline)" stroke="none"/>` +
    '</g>';
}

/**
 * Baroque cartouche frame (like a framed date card).
 * Draws a double gold border with concave corners and scroll accents.
 */
export function cartouche(w, h, { p = 'aa', notch = 22, bowTop = true, fill = '#FFFBF7' } = {}) {
  const shape = (inset) => {
    const n = notch - inset * 0.4;
    const x0 = inset, y0 = inset, x1 = w - inset, y1 = h - inset;
    return `M${f(x0 + n)} ${f(y0)} L${f(x1 - n)} ${f(y0)} Q${f(x1 - n)} ${f(y0 + n)} ${f(x1)} ${f(y0 + n)} ` +
      `L${f(x1)} ${f(y1 - n)} Q${f(x1 - n)} ${f(y1 - n)} ${f(x1 - n)} ${f(y1)} L${f(x0 + n)} ${f(y1)} ` +
      `Q${f(x0 + n)} ${f(y1 - n)} ${f(x0)} ${f(y1 - n)} L${f(x0)} ${f(y0 + n)} Q${f(x0 + n)} ${f(y0 + n)} ${f(x0 + n)} ${f(y0)}Z`;
  };
  let g = `<path d="${shape(0)}" fill="${fill}" stroke="url(#${p}-goldline)" stroke-width="2.4"/>`;
  g += `<path d="${shape(7)}" fill="none" stroke="url(#${p}-goldline)" stroke-width=".9"/>`;
  // corner scrolls
  const cs = notch * 1.1;
  g += scroll(notch * 0.55, notch * 0.55, cs, { dir: 45, p });
  g += scroll(w - notch * 0.55, notch * 0.55, cs, { dir: 135, p, mirror: false });
  g += scroll(notch * 0.55, h - notch * 0.55, cs, { dir: -45, p });
  g += scroll(w - notch * 0.55, h - notch * 0.55, cs, { dir: -135, p });
  // side & bottom accents
  g += scroll(w / 2 - 2, h - 3, notch * 1.3, { dir: 0, p, mirror: true });
  g += scroll(w / 2 + 2, h - 3, notch * 1.3, { dir: 0, p });
  g += `<circle cx="${w / 2}" cy="${h - 3}" r="3" fill="url(#${p}-gold)"/>`;
  if (bowTop) {
    g += scroll(w / 2 - 6, 2, notch * 1.4, { dir: 180, p });
    g += scroll(w / 2 + 6, 2, notch * 1.4, { dir: 180, p, mirror: true });
    g += bow(w / 2, -6, Math.min(w * 0.36, 96), { p, tails: 0.45 });
  }
  return g;
}

/** Ornate oval frame used on the invitation cover. */
export function ovalFrame(cx, cy, rx, ry, { p = 'aa' } = {}) {
  let g = `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="url(#${p}-goldline)" stroke-width="2"/>`;
  g += `<ellipse cx="${cx}" cy="${cy}" rx="${rx - 9}" ry="${ry - 9}" fill="none" stroke="url(#${p}-goldline)" stroke-width=".8" stroke-dasharray="1 4" stroke-linecap="round"/>`;
  g += `<ellipse cx="${cx}" cy="${cy}" rx="${rx + 8}" ry="${ry + 8}" fill="none" stroke="url(#${p}-goldline)" stroke-width=".7" opacity=".7"/>`;
  // scroll accents around the oval
  const pts = [35, 70, 110, 145, 215, 250, 290, 325];
  for (const deg of pts) {
    const a = (deg * Math.PI) / 180;
    const x = cx + Math.cos(a) * (rx + 8);
    const y = cy + Math.sin(a) * (ry + 8);
    g += scroll(x, y, 26, { dir: deg + 90, p, width: 1 });
  }
  // leafy garland along the sides
  for (let i = 0; i < 2; i++) {
    const side = i ? 1 : -1;
    g += sprig(cx + side * rx * 0.98, cy + ry * 0.15, ry * 0.5, { dir: side > 0 ? -100 : -80, p, curl: 0.18 * -side });
  }
  return g;
}

/** Elegant horizontal divider: line, diamond, small leaves. */
export function divider(w, { p = 'aa' } = {}) {
  const c = w / 2;
  return `<line x1="0" y1="10" x2="${f(c - 26)}" y2="10" stroke="#BC9A60" stroke-width=".9"/>` +
    `<line x1="${f(c + 26)}" y1="10" x2="${w}" y2="10" stroke="#BC9A60" stroke-width=".9"/>` +
    leaf(c - 6, 10, 18, 200, { p }) + leaf(c + 6, 10, 18, -20, { p }) +
    `<path d="M${c} 4 L${c + 5} 10 L${c} 16 L${c - 5} 10Z" fill="url(#${p}-gold)"/>`;
}

/** Full-bleed standalone SVG wrapper with defs. */
export function svgDoc(w, h, inner, { p = 'aa', bg = null, title = '' } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">` +
    (title ? `<title>${title}</title>` : '') + defs(p) +
    (bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : '') + inner + '</svg>';
}
