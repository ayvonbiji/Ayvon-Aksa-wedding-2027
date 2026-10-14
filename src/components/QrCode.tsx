import { useMemo } from 'react';
import QRCode from 'qrcode';
import { asset } from '../lib/assets';
import { Icon } from './Icon';

const FG = '#3A2E2A';
/** Camera glyph (24×24 path) used in the centre of the upload QR code. */
const CAMERA =
  'M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Zm8 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z';

export type QrVariant = 'site' | 'upload';

interface Props {
  url: string;
  label: string;
  variant: QrVariant;
  size?: number;
  downloads?: boolean;
  fileName?: string;
}

/** Builds the QR matrix (error correction H, 4-module quiet zone). */
export function qrMatrix(url: string) {
  const qr = QRCode.create(url, { errorCorrectionLevel: 'H' });
  const n = qr.modules.size;
  const q = 4;
  let d = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (qr.modules.get(x, y)) d += `M${x + q} ${y + q}h1v1h-1z`;
  return { d, size: n + q * 2, n };
}

async function monogramDataUri(): Promise<string> {
  const res = await fetch(asset('brand/monogram-mono.svg'));
  const text = await res.text();
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(text)))}`;
}

/** Stand-alone SVG markup for download (centre art embedded). */
async function svgMarkup(url: string, variant: QrVariant) {
  const { d, size, n } = qrMatrix(url);
  const badge = n * 0.2;
  const c = size / 2;
  const centre =
    variant === 'site'
      ? `<image href="${await monogramDataUri()}" x="${c - badge / 2}" y="${c - badge / 2}" width="${badge}" height="${badge}"/>`
      : `<path d="${CAMERA}" transform="translate(${c - badge * 0.38} ${c - badge * 0.38}) scale(${(badge * 0.76) / 24})" fill="none" stroke="${FG}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size * 24}" height="${size * 24}" shape-rendering="crispEdges"><title>${url}</title><rect width="${size}" height="${size}" fill="#fff"/><path d="${d}" fill="${FG}"/><rect x="${c - badge / 2 - 0.5}" y="${c - badge / 2 - 0.5}" width="${badge + 1}" height="${badge + 1}" rx="${badge * 0.2}" fill="#fff"/>${centre}</svg>`;
}

function save(href: string, name: string) {
  const a = document.createElement('a');
  a.href = href;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function downloadQrSvg(url: string, variant: QrVariant, name: string) {
  const blob = new Blob([await svgMarkup(url, variant)], { type: 'image/svg+xml' });
  const href = URL.createObjectURL(blob);
  save(href, `${name}.svg`);
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}

export async function downloadQrPng(url: string, variant: QrVariant, name: string) {
  const svg = await svgMarkup(url, variant);
  const img = new Image();
  const src = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = () => rej(new Error('render failed'));
    img.src = src;
  });
  const px = 1600;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = px;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, px, px);
  URL.revokeObjectURL(src);
  save(canvas.toDataURL('image/png'), `${name}.png`);
}

/** A scannable QR code with a clear label and optional PNG/SVG downloads. */
export function QrCode({ url, label, variant, size = 168, downloads = false, fileName }: Props) {
  const { d, size: s, n } = useMemo(() => qrMatrix(url), [url]);
  const badge = n * 0.2;
  const c = s / 2;
  const name = fileName || (variant === 'site' ? 'ayvon-aksa-wedding-website-qr' : 'ayvon-aksa-upload-memories-qr');
  return (
    <figure className={`qrcode qrcode--${variant}`}>
      <div className="qrcode__code" style={{ width: size }}>
        <svg viewBox={`0 0 ${s} ${s}`} role="img" aria-label={`${label}. QR code that opens ${url}`} shapeRendering="crispEdges">
          <rect width={s} height={s} fill="#fff" />
          <path d={d} fill={FG} />
          <rect x={c - badge / 2 - 0.5} y={c - badge / 2 - 0.5} width={badge + 1} height={badge + 1} rx={badge * 0.2} fill="#fff" />
          {variant === 'site' ? (
            <image href={asset('brand/monogram-mono.svg')} x={c - badge / 2} y={c - badge / 2} width={badge} height={badge} />
          ) : (
            <path
              d={CAMERA}
              transform={`translate(${c - badge * 0.38} ${c - badge * 0.38}) scale(${(badge * 0.76) / 24})`}
              fill="none"
              stroke={FG}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </div>
      <figcaption>
        <span className="qrcode__label">{label}</span>
        <span className="qrcode__url">{url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
        {downloads && (
          <span className="qrcode__actions">
            <button type="button" className="btn btn--ghost" onClick={() => downloadQrPng(url, variant, name)}>
              <Icon name="download" /> PNG
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => downloadQrSvg(url, variant, name)}>
              <Icon name="download" /> SVG
            </button>
          </span>
        )}
      </figcaption>
    </figure>
  );
}
