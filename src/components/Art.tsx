import { memo } from 'react';
import * as o from '../art/ornaments.js';

/** Gradients used by every ornament — rendered once at the top of the page. */
export const SvgDefs = memo(function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false" dangerouslySetInnerHTML={{ __html: o.defs('aa') }} />
  );
});

interface ArtProps {
  svg: string;
  viewBox: string;
  className?: string;
  style?: React.CSSProperties;
}

/** Decorative inline SVG (hidden from assistive technology). */
export const Art = memo(function Art({ svg, viewBox, className, style }: ArtProps) {
  return (
    <svg
      className={className}
      style={style}
      viewBox={viewBox}
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
});

/* ── Pre-composed ornaments (computed once) ─────────────────────────────── */

export const art = {
  /** Corner bouquet, drawn in a 300×300 box anchored top-left. */
  cornerTL: { svg: o.cluster(95, 95, 120, { dir: 45, seed: 1 }) + o.sprig(150, 60, 140, { dir: 10 }) + o.sprig(60, 150, 140, { dir: 80, curl: -0.25 }), viewBox: '0 0 300 300' },
  cornerTR: { svg: o.cluster(205, 95, 120, { dir: 135, seed: 2 }) + o.sprig(150, 60, 140, { dir: 170, curl: -0.25 }) + o.sprig(240, 150, 140, { dir: 100 }), viewBox: '0 0 300 300' },
  cornerBL: { svg: o.cluster(95, 205, 120, { dir: -45, seed: 3 }) + o.sprig(150, 240, 140, { dir: -10, curl: -0.25 }) + o.sprig(60, 150, 140, { dir: -80 }), viewBox: '0 0 300 300' },
  cornerBR: { svg: o.cluster(205, 205, 120, { dir: -135, seed: 4 }) + o.sprig(150, 240, 140, { dir: 190 }) + o.sprig(240, 150, 140, { dir: -100, curl: -0.25 }), viewBox: '0 0 300 300' },
  /** Small bouquet centred in 240×160. */
  bouquet: { svg: o.cluster(120, 85, 88, { seed: 5 }), viewBox: '0 0 240 160' },
  bouquetAlt: { svg: o.cluster(120, 85, 88, { seed: 2 }), viewBox: '0 0 240 160' },
  bow: { svg: o.bow(60, 22, 110), viewBox: '0 0 120 100' },
  divider: { svg: o.divider(300), viewBox: '0 0 300 20' },
  sprigL: { svg: o.sprig(150, 20, 140, { dir: 180, curl: -0.3 }), viewBox: '0 0 160 40' },
  sprigR: { svg: o.sprig(10, 20, 140, { dir: 0, curl: 0.3 }), viewBox: '0 0 160 40' },
  /** Date cartouche frame, 260×230. */
  cartouche: { svg: `<g transform="translate(10 40)">${o.cartouche(240, 180)}</g>`, viewBox: '0 0 260 230' },
  /** Ornate oval for the invitation cover, 340×440. */
  oval: { svg: o.ovalFrame(170, 228, 140, 180) + o.bow(170, 40, 112, { tails: 0.5 }) + o.cluster(170, 412, 70, { seed: 1 }), viewBox: '0 0 340 470' },
  rose: { svg: o.rose(20, 20, 18, { tone: 'blush' }), viewBox: '0 0 40 40' },
  roseDeep: { svg: o.leaf(20, 20, 16, -30) + o.leaf(20, 20, 14, 200) + o.rose(20, 20, 15, { tone: 'deep' }), viewBox: '0 0 40 40' },
  /* event cards */
  roseSpray: { svg: o.roseSpray(), viewBox: '20 20 280 130' },
  goldCorner: { svg: o.goldCorner(), viewBox: '0 0 110 110' },
  sideVine: { svg: o.sideVine(), viewBox: '0 0 50 260' },
  fleuron: { svg: o.fleuron(), viewBox: '0 0 120 36' },
  heartDivider: { svg: o.heartDivider(), viewBox: '0 0 220 20' },
  /* invitation cover */
  roseCorner: { svg: o.roseCorner(), viewBox: '-20 -20 360 360' },
  hanging: { svg: o.hangingOrnament(), viewBox: '0 0 80 290' },
  flourish: { svg: o.flourish(), viewBox: '0 0 96 30' },
  goldDivider: { svg: o.goldDivider(), viewBox: '0 0 300 24' },
  envSprig: { svg: o.sprig(6, 40, 70, { dir: -32, curl: 0.3 }) + o.sprig(6, 40, 52, { dir: -70, curl: -0.25 }) + o.blossom(10, 38, 5), viewBox: '0 0 80 50' },
  cardCorner: { svg: o.cluster(70, 70, 66, { dir: 45, seed: 1 }) + o.sprig(110, 40, 90, { dir: 8 }) + o.sprig(40, 110, 90, { dir: 82, curl: -0.25 }), viewBox: '0 0 200 200' },
  scrollTop: { svg: o.scroll(60, 14, 44, { mirror: true }) + o.scroll(100, 14, 44) + '<circle cx="80" cy="14" r="3" fill="url(#aa-gold)"/>', viewBox: '0 0 160 30' },
};

/** Parchment scroll (Dear Guest), viewBox 400×520. */
export const parchment = {
  viewBox: '0 0 400 520',
  svg:
    `<path d="M40 60 H360 V460 H40Z" fill="url(#aa-paper)" stroke="#D9C3A0" stroke-width="1.5"/>` +
    `<path d="M48 70 H352 V450 H48Z" fill="none" stroke="#CDB383" stroke-width=".8" stroke-dasharray="2 4"/>` +
    // top roll
    `<rect x="24" y="34" width="352" height="34" rx="17" fill="url(#aa-paper)" stroke="#D3B98F" stroke-width="1.5"/>` +
    `<ellipse cx="28" cy="51" rx="10" ry="17" fill="#EADBC2" stroke="#D3B98F"/><ellipse cx="372" cy="51" rx="10" ry="17" fill="#EADBC2" stroke="#D3B98F"/>` +
    `<path d="M40 60 Q200 74 360 60" fill="none" stroke="#E2CFAF" stroke-width="2"/>` +
    // bottom roll
    `<rect x="24" y="452" width="352" height="34" rx="17" fill="url(#aa-paper)" stroke="#D3B98F" stroke-width="1.5"/>` +
    `<ellipse cx="28" cy="469" rx="10" ry="17" fill="#EADBC2" stroke="#D3B98F"/><ellipse cx="372" cy="469" rx="10" ry="17" fill="#EADBC2" stroke="#D3B98F"/>` +
    `<path d="M40 460 Q200 448 360 460" fill="none" stroke="#E2CFAF" stroke-width="2"/>` +
    o.cluster(48, 70, 52, { dir: 40, seed: 3 }) + o.cluster(352, 452, 52, { dir: 220, seed: 4 }) +
    o.sprig(60, 440, 90, { dir: -40 }) + o.sprig(340, 82, 90, { dir: 140 }),
};
