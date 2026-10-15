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
  ivory: '#FBF6EE',
  champagne: '#F3E6D0',
  blush: '#F2D9D6',
  dustyRose: '#C98B92',
  wine: '#8A2E45',
  burgundy: '#6B1E33',
  burgundyDeep: '#4A1222',
  gold: '#B08A4A',
  goldLight: '#D9BE86',
  goldDeep: '#7A5A24',
  sage: '#7D8F6E',
  sageDeep: '#4F6046',
  ink: '#2F2224',
};

/** Shared gradients. */
export function defs(p = 'aa') {
  return `<defs>
  <linearGradient id="${p}-gold" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#E8D3A2"/><stop offset=".3" stop-color="#C4A061"/>
    <stop offset=".55" stop-color="#94702F"/><stop offset=".8" stop-color="#D2B377"/><stop offset="1" stop-color="#8A6629"/>
  </linearGradient>
  <linearGradient id="${p}-goldline" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#C9A86A"/><stop offset="1" stop-color="#9C7838"/>
  </linearGradient>
  <linearGradient id="${p}-wine" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#A13D55"/><stop offset=".5" stop-color="#7A2239"/><stop offset="1" stop-color="#561428"/>
  </linearGradient>
  <radialGradient id="${p}-petal" cx=".5" cy=".9" r=".9">
    <stop offset="0" stop-color="#A9566A"/><stop offset=".55" stop-color="#D49AA2"/><stop offset="1" stop-color="#F4DCDA"/>
  </radialGradient>
  <radialGradient id="${p}-petalDeep" cx=".5" cy=".9" r=".9">
    <stop offset="0" stop-color="#5E1427"/><stop offset=".55" stop-color="#8E2C44"/><stop offset="1" stop-color="#C46E7F"/>
  </radialGradient>
  <radialGradient id="${p}-petalIvory" cx=".5" cy=".9" r=".9">
    <stop offset="0" stop-color="#D9BF93"/><stop offset=".6" stop-color="#F1E3C8"/><stop offset="1" stop-color="#FFFAF0"/>
  </radialGradient>
  <linearGradient id="${p}-leaf" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#9DAD8C"/><stop offset="1" stop-color="#53654A"/>
  </linearGradient>
  <linearGradient id="${p}-ribbon" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#C26A7C"/><stop offset=".5" stop-color="#8E2C44"/><stop offset="1" stop-color="#651830"/>
  </linearGradient>
  <linearGradient id="${p}-ribbonDark" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#7C2338"/><stop offset="1" stop-color="#4E1023"/>
  </linearGradient>
  <linearGradient id="${p}-paper" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#FBF3E4"/><stop offset="1" stop-color="#EFDDBE"/>
  </linearGradient>
</defs>`;
}

const petalPath = (r, w = 0.62) =>
  `M0 0 C${f(-r * w)} ${f(-r * 0.25)} ${f(-r * w * 0.95)} ${f(-r * 0.95)} 0 ${f(-r * 1.05)} ` +
  `C${f(r * w * 0.95)} ${f(-r * 0.95)} ${f(r * w)} ${f(-r * 0.25)} 0 0Z`;

/** A layered rose seen from above. tone: 'blush' | 'deep' | 'ivory' */
export function rose(x, y, r, { tone = 'blush', rot = 0, p = 'aa' } = {}) {
  const fill = tone === 'deep' ? `${p}-petalDeep` : tone === 'ivory' ? `${p}-petalIvory` : `${p}-petal`;
  const edge = tone === 'ivory' ? '#D9C09A' : tone === 'deep' ? '#7A2239' : '#C08690';
  const core = tone === 'ivory' ? '#B8955E' : tone === 'deep' ? '#3E0C1A' : '#8E3A4E';
  const shade = tone === 'ivory' ? '#CDB083' : tone === 'deep' ? '#4A1222' : '#A85E6E';
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
      s += `<path d="M${f(-L * 0.4)} ${f(-L * 0.78)} Q0 ${f(-L * 1.0)} ${f(L * 0.4)} ${f(-L * 0.78)}" transform="rotate(${f(a)})" fill="none" stroke="#FFF6F3" stroke-width="${f(Math.max(r * 0.03, 0.4))}" opacity="${tone === 'deep' ? 0.28 : 0.55}" stroke-linecap="round"/>`;
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
export function blossom(x, y, r, { color = '#FFF8F1', center = '#C9A158' } = {}) {
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
  g += rose(0, -0.1 * s, 0.33 * s, { tone: 'deep', rot: seed * 41, p });
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
  g += `<path d="M0 0 Q${f(len * 0.5)} ${f(-c)} ${f(len)} 0" fill="none" stroke="#6E8061" stroke-width="${f(Math.max(len * 0.012, 0.6))}" stroke-linecap="round"/>`;
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
    g += blossom(len * 0.55, -c * 0.6, len * 0.045, { color: '#F1D3D3' });
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
    `<path d="M-2 0 C-20 -26 -52 -30 -50 -6 C-48 12 -20 10 -2 2Z" fill="url(#${p}-ribbon)" stroke="#5E1427" stroke-width="1"/>` +
    `<path d="M2 0 C20 -26 52 -30 50 -6 C48 12 20 10 2 2Z" fill="url(#${p}-ribbon)" stroke="#5E1427" stroke-width="1"/>` +
    `<path d="M-8 -2 C-22 -16 -38 -18 -40 -8" stroke="#E9B5BE" stroke-width="2" fill="none" opacity=".55" stroke-linecap="round"/>` +
    `<path d="M8 -2 C22 -16 38 -18 40 -8" stroke="#E9B5BE" stroke-width="2" fill="none" opacity=".55" stroke-linecap="round"/>` +
    // knot
    `<rect x="-8" y="-8" width="16" height="14" rx="6" fill="url(#${p}-ribbonDark)"/>` +
    `<path d="M-4 -5 Q0 -7 4 -5" stroke="#C26A7C" stroke-width="1.5" fill="none"/>` +
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

/* ── Invitation-cover artwork ─────────────────────────────────────────────── */

/** Leaf painted in gold (for the luxury rose arrangements). */
export function goldLeaf(x, y, len, rot = 0, { p = 'aa' } = {}) {
  const w = len * 0.34;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})">` +
    `<path d="M0 0 C${f(len * 0.3)} ${f(-w)} ${f(len * 0.75)} ${f(-w * 0.8)} ${f(len)} 0 C${f(len * 0.75)} ${f(w * 0.8)} ${f(len * 0.3)} ${f(w)} 0 0Z" fill="url(#${p}-gold)"/>` +
    `<path d="M${f(len * 0.05)} 0 Q${f(len * 0.5)} ${f(-w * 0.12)} ${f(len * 0.92)} 0" stroke="#FFF2CF" stroke-width="${f(Math.max(len * 0.02, 0.4))}" fill="none" opacity=".7"/>` +
    '</g>';
}

/**
 * Lush corner arrangement of roses (deep burgundy, blush, ivory), green and
 * gold leaves, buds and small blossoms. Drawn for the TOP-LEFT corner inside
 * a 420×420 box; mirror/rotate it with CSS for other corners.
 */
export function roseCorner({ p = 'aa' } = {}) {
  let g = '';
  // trailing greenery and gold leaves first (behind)
  g += sprig(150, 40, 230, { dir: 12, p, curl: 0.22 });
  g += sprig(40, 150, 230, { dir: 78, p, curl: -0.22 });
  g += sprig(210, 120, 170, { dir: 30, p, curl: 0.3 });
  const leaves = [
    [118, 26, 70, 8], [176, 70, 64, 28], [60, 196, 70, 80], [24, 112, 62, 96], [236, 30, 58, -6],
    [150, 168, 60, 42], [96, 230, 56, 70], [210, 150, 54, 22],
  ];
  leaves.forEach(([x, y, l, r], i) => (g += i % 3 === 1 ? goldLeaf(x, y, l, r, { p }) : leaf(x, y, l, r, { p })));
  [[250, 60, 44, -12], [70, 260, 46, 98], [190, 200, 40, 40], [268, 112, 36, 18]].forEach(([x, y, l, r]) => (g += goldLeaf(x, y, l, r, { p })));
  // roses
  g += rose(70, 70, 66, { tone: 'deep', rot: 10, p });
  g += rose(160, 40, 46, { tone: 'blush', rot: 40, p });
  g += rose(40, 165, 48, { tone: 'ivory', rot: 70, p });
  g += rose(150, 128, 44, { tone: 'deep', rot: 120, p });
  g += rose(225, 92, 30, { tone: 'ivory', rot: 15, p });
  g += rose(95, 210, 30, { tone: 'blush', rot: 200, p });
  g += bud(272, 70, 14, 60, { p }) + bud(58, 262, 13, 170, { p }) + bud(206, 168, 12, 120, { p });
  // fillers
  [[200, 30, 9], [128, 175, 8], [20, 225, 8], [245, 140, 7], [118, 255, 7], [282, 34, 6]].forEach(([x, y, r]) => (g += blossom(x, y, r)));
  g += breath(250, 175, 26, 9, 2) + breath(170, 240, 22, 8, 5);
  return g;
}

/** Hanging gold pendant (thin chains with beads and a filigree drop), 80×300 box. */
export function hangingOrnament({ p = 'aa' } = {}) {
  let g = `<g fill="none" stroke="#C9A86A" stroke-width="1.1">`;
  g += '<line x1="40" y1="0" x2="40" y2="200"/>';
  g += '<line x1="18" y1="0" x2="18" y2="120"/><line x1="62" y1="0" x2="62" y2="150"/>';
  g += '</g>';
  [40, 90, 140].forEach((y) => (g += `<circle cx="40" cy="${y}" r="2.6" fill="url(#${p}-gold)"/>`));
  g += `<circle cx="18" cy="120" r="3.4" fill="url(#${p}-gold)"/><circle cx="62" cy="150" r="3.8" fill="url(#${p}-gold)"/>`;
  // filigree drop
  g += `<g transform="translate(40 228)">` +
    `<path d="M0 -28 C14 -14 18 0 0 30 C-18 0 -14 -14 0 -28Z" fill="url(#${p}-gold)" opacity=".9"/>` +
    `<path d="M0 -18 C8 -8 10 2 0 18 C-10 2 -8 -8 0 -18Z" fill="#7A2239"/>` +
    scroll(-10, -26, 18, { dir: 200, p, width: 1 }) + scroll(10, -26, 18, { dir: -20, p, width: 1, mirror: true }) +
    `<circle cy="38" r="3" fill="url(#${p}-gold)"/><path d="M0 42 L3 50 L0 58 L-3 50Z" fill="url(#${p}-gold)"/>` +
    '</g>';
  return g;
}

/** Gold flourish for either side of a button (left side; mirror for right), 90×30 box. */
export function flourish({ p = 'aa' } = {}) {
  return `<g fill="none" stroke="url(#${p}-goldline)" stroke-width="1.4" stroke-linecap="round">` +
    '<path d="M88 15 C70 15 62 4 50 6 C40 8 40 20 50 20 C58 20 58 12 52 12"/>' +
    '<path d="M50 15 C34 15 26 24 14 22 C6 20 6 10 14 10"/>' +
    '</g>' +
    `<circle cx="10" cy="15" r="2.4" fill="url(#${p}-gold)"/><path d="M84 15 L88 11 L92 15 L88 19Z" fill="url(#${p}-gold)"/>`;
}

/** Ornate gold divider with a central heart-diamond, 300×24 box. */
export function goldDivider({ p = 'aa' } = {}) {
  return `<line x1="10" y1="12" x2="128" y2="12" stroke="#C9A86A" stroke-width="1"/>` +
    `<line x1="172" y1="12" x2="290" y2="12" stroke="#C9A86A" stroke-width="1"/>` +
    scroll(138, 12, 14, { dir: 180, p, width: 1 }) + scroll(162, 12, 14, { dir: 0, p, width: 1, mirror: true }) +
    `<path d="M150 5 L156 12 L150 19 L144 12Z" fill="url(#${p}-gold)"/>` +
    `<circle cx="8" cy="12" r="2" fill="url(#${p}-gold)"/><circle cx="292" cy="12" r="2" fill="url(#${p}-gold)"/>`;
}

/* ── Event-card artwork ──────────────────────────────────────────────────── */

/** Horizontal rose spray for the top of a card (burgundy centre, cream sides), 320×160. */
export function roseSpray({ p = 'aa' } = {}) {
  let g = '';
  g += sprig(150, 92, 150, { dir: 188, p, curl: -0.22 });
  g += sprig(170, 92, 150, { dir: -8, p, curl: 0.22 });
  [[120, 70, 50, 200], [200, 70, 50, -20], [140, 110, 46, 150], [180, 110, 46, 30], [96, 104, 40, 170], [224, 104, 40, 10]].forEach(
    ([x, y, l, r], i) => (g += i % 3 === 2 ? goldLeaf(x, y, l, r, { p }) : leaf(x, y, l, r, { p })),
  );
  [[60, 96, 30, 196], [262, 96, 30, -16]].forEach(([x, y, l, r]) => (g += goldLeaf(x, y, l, r, { p })));
  g += breath(110, 52, 22, 9, 3) + breath(212, 52, 22, 9, 7);
  g += bud(70, 84, 10, -80, { p }) + bud(250, 84, 10, 80, { p });
  g += rose(98, 98, 19, { tone: 'blush', rot: 30, p });
  g += rose(222, 98, 19, { tone: 'blush', rot: 80, p });
  g += rose(122, 90, 28, { tone: 'ivory', rot: 15, p });
  g += rose(198, 90, 28, { tone: 'ivory', rot: 50, p });
  g += rose(160, 80, 38, { tone: 'deep', rot: 20, p });
  [[86, 74, 6], [236, 74, 6], [146, 122, 6], [176, 124, 6]].forEach(([x, y, r]) => (g += blossom(x, y, r)));
  return g;
}

/** Gold filigree for the top-left corner of a card, 110×110 (rotate for other corners). */
export function goldCorner({ p = 'aa' } = {}) {
  return `<g fill="none" stroke="url(#${p}-goldline)" stroke-width="1.3" stroke-linecap="round">` +
    '<path d="M8 100 C8 50 20 20 60 12 C78 9 92 10 104 8"/>' +
    '<path d="M16 96 C16 58 28 30 58 22 C70 19 80 20 88 22"/>' +
    '<path d="M60 12 C52 22 56 32 66 30 C74 28 72 18 64 20"/>' +
    '<path d="M8 60 C18 52 28 56 26 66 C24 74 14 72 16 64"/>' +
    '<path d="M24 24 C34 30 34 40 26 42 C20 43 18 36 24 34"/>' +
    '</g>' +
    goldLeaf(30, 30, 18, 225, { p }) + goldLeaf(30, 30, 14, 180, { p }) + goldLeaf(30, 30, 14, 270, { p }) +
    `<circle cx="104" cy="8" r="2.4" fill="url(#${p}-gold)"/><circle cx="8" cy="100" r="2.4" fill="url(#${p}-gold)"/>` +
    `<path d="M14 14 L19 9 L24 14 L19 19Z" fill="url(#${p}-gold)"/>`;
}

/** Slim vertical vine with small blush roses for a card's side border, 50×260. */
export function sideVine({ p = 'aa' } = {}) {
  let g = `<path d="M22 4 C34 60 10 120 26 180 C34 210 24 236 20 256" fill="none" stroke="#6E8061" stroke-width="1.4" stroke-linecap="round"/>`;
  [[24, 24, 26, -30], [20, 50, 24, 210], [26, 78, 26, -20], [18, 104, 24, 200], [26, 150, 26, -24], [20, 176, 22, 214], [26, 206, 24, -30], [20, 232, 22, 200]].forEach(
    ([x, y, l, r], i) => (g += i % 4 === 3 ? goldLeaf(x, y, l, r, { p }) : leaf(x, y, l, r, { p })),
  );
  g += rose(22, 128, 13, { tone: 'blush', rot: 30, p });
  g += rose(30, 112, 9, { tone: 'ivory', rot: 60, p });
  g += blossom(14, 140, 5) + blossom(30, 196, 5) + blossom(16, 62, 4, { color: '#F1D3D3' });
  g += breath(30, 144, 10, 5, 4);
  return g;
}

/** Small gold fleuron for above section titles, 120×36. */
export function fleuron({ p = 'aa' } = {}) {
  return `<line x1="0" y1="24" x2="40" y2="24" stroke="#C9A86A" stroke-width="1"/><line x1="80" y1="24" x2="120" y2="24" stroke="#C9A86A" stroke-width="1"/>` +
    `<g fill="url(#${p}-gold)">` +
    '<path d="M60 4 C66 12 66 20 60 30 C54 20 54 12 60 4Z"/>' +
    '<path d="M58 26 C50 14 40 16 42 24 C44 30 52 28 52 24 C50 26 46 24 48 22 C50 20 56 22 58 26Z"/>' +
    '<path d="M62 26 C70 14 80 16 78 24 C76 30 68 28 68 24 C70 26 74 24 72 22 C70 20 64 22 62 26Z"/>' +
    '<rect x="52" y="29" width="16" height="2.4" rx="1.2"/></g>' +
    `<circle cx="40" cy="24" r="2" fill="url(#${p}-gold)"/><circle cx="80" cy="24" r="2" fill="url(#${p}-gold)"/>`;
}

/** Divider with a small gold heart, 220×20. */
export function heartDivider({ p = 'aa' } = {}) {
  return `<line x1="14" y1="10" x2="92" y2="10" stroke="#C9A86A" stroke-width="1"/><line x1="128" y1="10" x2="206" y2="10" stroke="#C9A86A" stroke-width="1"/>` +
    `<circle cx="100" cy="10" r="2" fill="url(#${p}-gold)"/><circle cx="120" cy="10" r="2" fill="url(#${p}-gold)"/>` +
    `<path d="M110 16 C104 12 102 9 102 7 C102 5 104 4 106 4 C108 4 109 5 110 6.5 C111 5 112 4 114 4 C116 4 118 5 118 7 C118 9 116 12 110 16Z" fill="url(#${p}-gold)"/>` +
    `<path d="M10 10 L14 7 L18 10 L14 13Z" fill="url(#${p}-gold)"/><path d="M202 10 L206 7 L210 10 L206 13Z" fill="url(#${p}-gold)"/>`;
}
