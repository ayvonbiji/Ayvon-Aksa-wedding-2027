/**
 * Prepares a guest's photo in the browser before upload:
 *  1. checks the real file signature (not just the extension),
 *  2. decodes it (proving it is a real, uncorrupted image),
 *  3. resizes it and re-saves it as JPEG — which also strips location (GPS)
 *     and camera metadata,
 *  4. computes a SHA-256 fingerprint of the original file to avoid duplicates.
 */
import { wedding } from '../config/wedding';
import type { PreparedPhoto } from './memories';

export type Sniffed = 'jpeg' | 'png' | 'webp' | 'heic' | 'gif' | 'unknown';

/** Identify an image from its first bytes. */
export function sniff(bytes: Uint8Array): Sniffed {
  const b = bytes;
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpeg';
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a) return 'png';
  if (b.length >= 12 && String.fromCharCode(...b.slice(0, 4)) === 'RIFF' && String.fromCharCode(...b.slice(8, 12)) === 'WEBP') return 'webp';
  if (b.length >= 6 && String.fromCharCode(...b.slice(0, 6)).startsWith('GIF8')) return 'gif';
  if (b.length >= 12 && String.fromCharCode(...b.slice(4, 8)) === 'ftyp') {
    const brand = String.fromCharCode(...b.slice(8, 12));
    if (/^(heic|heix|hevc|hevx|heim|heis|mif1|msf1|avif)$/.test(brand)) return 'heic';
  }
  return 'unknown';
}

export class PrepError extends Error {}

const toHex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((x) => x.toString(16).padStart(2, '0')).join('');

/** Fit (w, h) inside a square of `max` pixels, never enlarging. */
export function fitWithin(w: number, h: number, max: number) {
  const s = Math.min(1, max / Math.max(w, h));
  return { width: Math.max(1, Math.round(w * s)), height: Math.max(1, Math.round(h * s)) };
}

async function decode(file: Blob): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' } as ImageBitmapOptions);
    } catch {
      /* fall back to <img> (e.g. Safari with HEIC) */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function preparePhoto(file: File): Promise<PreparedPhoto> {
  const m = wedding.memories;
  if (file.size > m.maxInputMB * 1024 * 1024) throw new PrepError(`This photo is larger than ${m.maxInputMB} MB.`);
  if (file.size < 100) throw new PrepError('This file is empty or damaged.');

  const original = await file.arrayBuffer();
  const kind = sniff(new Uint8Array(original.slice(0, 32)));
  if (kind === 'unknown' || kind === 'gif') throw new PrepError('Only JPEG, PNG, WebP (and iPhone HEIC) photos can be shared.');

  let img: ImageBitmap | HTMLImageElement;
  try {
    img = await decode(file);
  } catch {
    throw new PrepError(
      kind === 'heic'
        ? 'This device can’t open HEIC photos. On iPhone, choose the photo from “Photos” (it converts automatically) or set Camera → Formats → Most Compatible.'
        : 'This photo seems to be damaged and could not be opened.',
    );
  }
  const w0 = 'naturalWidth' in img ? img.naturalWidth : img.width;
  const h0 = 'naturalHeight' in img ? img.naturalHeight : img.height;
  if (!w0 || !h0) throw new PrepError('This photo could not be read.');

  const { width, height } = fitWithin(w0, h0, m.maxDimension);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new PrepError('Your browser could not process this photo.');
  ctx.fillStyle = '#fff'; // transparent PNGs → white background
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);
  if ('close' in img) img.close();

  let quality = m.jpegQuality;
  let blob: Blob | null = null;
  for (let i = 0; i < 4; i++) {
    blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', quality));
    if (blob && blob.size <= m.maxStoredMB * 1024 * 1024) break;
    quality -= 0.12;
  }
  if (!blob || blob.size > m.maxStoredMB * 1024 * 1024) throw new PrepError('This photo is too large to share.');

  const hash = toHex(await crypto.subtle.digest('SHA-256', original));
  return { blob, width, height, hash, mime: 'image/jpeg' };
}
