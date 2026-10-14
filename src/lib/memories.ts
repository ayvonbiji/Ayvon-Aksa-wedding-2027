/**
 * Tiny Supabase client for "Our Wedding Memories" (no SDK needed).
 * Uses only the public anon key; all permissions are enforced by the database
 * rules in supabase/migrations/001_wedding_memories.sql.
 */
import { wedding } from '../config/wedding';

const env = import.meta.env as Record<string, string | undefined>;
export const SUPABASE_URL = (env.VITE_SUPABASE_URL || wedding.memories.supabaseUrl || '').replace(/\/$/, '');
const RAW_KEY = env.VITE_SUPABASE_ANON_KEY || wedding.memories.supabaseAnonKey || '';
const BUCKET = wedding.memories.bucket;

/** Role inside a Supabase JWT key ('anon', 'service_role', …) — '' if not a JWT. */
export function keyRole(key: string): string {
  try {
    return JSON.parse(atob(key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).role || '';
  } catch {
    return '';
  }
}
/** Safety net: never use a secret key in the browser, even if pasted by mistake. */
const isSecretKey = (k: string) => keyRole(k) === 'service_role' || k.startsWith('sb_secret_');
if (RAW_KEY && isSecretKey(RAW_KEY)) {
  console.error('Refusing to use a Supabase SECRET key in the website. Use the anon / public key.');
}
export const SUPABASE_ANON_KEY = RAW_KEY && !isSecretKey(RAW_KEY) ? RAW_KEY : '';

export const memoriesConfigured = () => Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export interface SetupStep {
  label: string;
  ok: boolean | null; // null = not checked
  help: string;
}

/** Diagnoses what is missing for uploads to work (used by the owner page). */
export async function checkSetup(token?: string): Promise<SetupStep[]> {
  const steps: SetupStep[] = [];
  const keysOk = memoriesConfigured();
  steps.push({
    label: 'Supabase URL and anon key are in the website',
    ok: keysOk,
    help: RAW_KEY && isSecretKey(RAW_KEY)
      ? 'A SECRET key was entered — replace it with the anon / public key.'
      : 'Run: npm run connect-memories -- https://YOUR-PROJECT.supabase.co YOUR_ANON_KEY, then rebuild and push.',
  });
  if (!keysOk) {
    steps.push({ label: 'Database tables, security rules and storage bucket', ok: null, help: 'Checked after the keys are added.' });
    steps.push({ label: 'Your owner account', ok: null, help: 'Checked after the keys are added.' });
    return steps;
  }
  let dbOk = false;
  try {
    await rpc<boolean>('memory_uploads_open');
    dbOk = true;
  } catch {
    dbOk = false;
  }
  steps.push({
    label: 'Database tables and security rules',
    ok: dbOk,
    help: 'In Supabase → SQL Editor, paste and run supabase/migrations/001_wedding_memories.sql.',
  });
  let bucketOk = false;
  try {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/sign/${BUCKET}`, {
      method: 'POST',
      headers: { ...headers(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ expiresIn: 60, paths: ['setup-check.jpg'] }),
    });
    const text = await res.text();
    bucketOk = res.ok || !/bucket not found/i.test(text);
  } catch {
    bucketOk = false;
  }
  steps.push({ label: 'Private photo storage bucket', ok: bucketOk, help: 'Created by the same SQL file — run it again if this fails.' });
  if (token) {
    let owner = false;
    try {
      owner = await adminIsOwner(token);
    } catch {
      owner = false;
    }
    steps.push({ label: 'You are an approved owner', ok: owner, help: "SQL Editor: insert into public.memory_admins (email) values ('your-email');" });
  } else {
    steps.push({ label: 'Your owner account', ok: null, help: 'Sign in below to check.' });
  }
  return steps;
}

export const uploadPageUrl = () => new URL(wedding.memories.uploadPath, wedding.siteUrl).href;

export interface MemoryPhoto {
  id: string;
  path: string;
  caption: string | null;
  guest_name: string | null;
  created_at: string;
  width: number | null;
  height: number | null;
  url?: string;
}

/** Friendly messages for errors raised by the database functions. */
const MESSAGES: Record<string, string> = {
  uploads_closed: 'Photo sharing is closed at the moment.',
  unsupported_type: 'This file type isn’t supported. Please choose a JPEG, PNG or WebP photo.',
  too_large: 'This photo is too large.',
  bad_dimensions: 'This photo could not be read.',
  bad_hash: 'This photo could not be read.',
  rate_limited: 'You’ve shared a lot of photos in a short time — thank you! Please try again a little later.',
  duplicate: 'This photo has already been shared.',
  file_missing: 'The upload didn’t finish. Please try again.',
  file_rejected: 'This file was rejected. Please choose a different photo.',
  not_found: 'We couldn’t find that photo.',
};

export class MemoryError extends Error {
  code: string;
  constructor(code: string, message?: string) {
    super(message || MESSAGES[code] || 'Something went wrong. Please try again.');
    this.code = code;
  }
}

function headers(token?: string): Record<string, string> {
  return { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token || SUPABASE_ANON_KEY}` };
}

async function parseError(res: Response): Promise<MemoryError> {
  let body: { message?: string; error?: string; msg?: string; error_description?: string } = {};
  try {
    body = await res.json();
  } catch {
    /* not JSON */
  }
  const raw = body.message || body.error_description || body.msg || body.error || '';
  const code = Object.keys(MESSAGES).find((k) => raw.includes(k));
  if (code) return new MemoryError(code);
  if (res.status === 413 || /exceeded the maximum allowed size|Payload too large/i.test(raw)) return new MemoryError('too_large');
  if (res.status === 429) return new MemoryError('rate_limited');
  return new MemoryError('http_' + res.status, raw ? `Upload failed: ${raw}` : undefined);
}

export async function rpc<T>(fn: string, args: Record<string, unknown> = {}, token?: string): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  if (!res.ok) throw await parseError(res);
  return res.json() as Promise<T>;
}

/** Signed (temporary) URLs for photos the caller is allowed to see. */
export async function signUrls(paths: string[], token?: string, expiresIn = 3600): Promise<Record<string, string>> {
  if (!paths.length) return {};
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/sign/${BUCKET}`, {
    method: 'POST',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ expiresIn, paths }),
  });
  if (!res.ok) throw await parseError(res);
  const list = (await res.json()) as { path: string; signedURL: string | null; error?: string | null }[];
  const out: Record<string, string> = {};
  for (const item of list) if (item.signedURL) out[item.path] = `${SUPABASE_URL}/storage/v1${item.signedURL}`;
  return out;
}

/** Approved photos, newest first. */
export async function listApproved(before?: string, limit = wedding.memories.pageSize): Promise<MemoryPhoto[]> {
  const rows = await rpc<MemoryPhoto[]>('list_approved_memories', { p_limit: limit, p_before: before ?? null });
  const urls = await signUrls(rows.map((r) => r.path));
  return rows.filter((r) => urls[r.path]).map((r) => ({ ...r, url: urls[r.path] }));
}

export interface PreparedPhoto {
  blob: Blob;
  width: number;
  height: number;
  hash: string;
  mime: 'image/jpeg' | 'image/png' | 'image/webp';
}

export interface UploadReceipt {
  id: string;
  path: string;
  token: string;
  createdAt: string;
}

/** Reserve → upload (with progress) → confirm. */
export async function uploadMemory(
  photo: PreparedPhoto,
  meta: { guestName?: string; caption?: string; showName?: boolean },
  onProgress: (fraction: number) => void,
): Promise<UploadReceipt> {
  const [slot] = await rpc<{ id: string; path: string; delete_token: string }[]>('begin_memory_upload', {
    p_mime: photo.mime,
    p_bytes: photo.blob.size,
    p_width: photo.width,
    p_height: photo.height,
    p_hash: photo.hash,
    p_guest_name: meta.guestName || null,
    p_caption: meta.caption || null,
    p_show_name: Boolean(meta.showName),
  });

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${slot.path}`);
    const h = headers();
    Object.entries(h).forEach(([k, v]) => xhr.setRequestHeader(k, v));
    xhr.setRequestHeader('Content-Type', photo.mime);
    xhr.setRequestHeader('x-upsert', 'false');
    xhr.setRequestHeader('cache-control', '3600');
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      reject(await parseError(new Response(xhr.responseText || '{}', { status: xhr.status })));
    };
    xhr.onerror = () => reject(new MemoryError('network', 'Network problem — please check your connection and try again.'));
    xhr.ontimeout = xhr.onerror;
    xhr.timeout = 120_000;
    xhr.send(photo.blob);
  });

  await rpc<string>('finish_memory_upload', { p_id: slot.id, p_token: slot.delete_token });
  onProgress(1);
  return { id: slot.id, path: slot.path, token: slot.delete_token, createdAt: new Date().toISOString() };
}

/** Guest removes a photo they uploaded from this device. */
export async function removeMyMemory(id: string, token: string) {
  const path = await rpc<string>('remove_my_memory', { p_id: id, p_token: token });
  await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}`, {
    method: 'DELETE',
    headers: { ...headers(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefixes: [path] }),
  }).catch(() => undefined);
}

/* ── Owner (moderation) API ────────────────────────────────────────────── */

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  email: string;
}

export async function signIn(email: string, password: string): Promise<Session> {
  return tokenRequest('password', { email, password });
}
export async function refresh(s: Session): Promise<Session> {
  return tokenRequest('refresh_token', { refresh_token: s.refresh_token });
}
async function tokenRequest(grant: string, body: object): Promise<Session> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=${grant}`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new MemoryError('auth', j.error_description || j.msg || 'Sign-in failed. Check your e-mail and password.');
  return { access_token: j.access_token, refresh_token: j.refresh_token, expires_at: Date.now() + (j.expires_in ?? 3600) * 1000, email: j.user?.email ?? '' };
}

export interface AdminMemory extends MemoryPhoto {
  status: 'uploading' | 'pending' | 'approved' | 'rejected' | 'removed';
  storage_path: string;
  show_name: boolean;
  byte_size: number;
  uploaded_at: string | null;
}

export async function adminList(token: string, status: string): Promise<AdminMemory[]> {
  const q = new URLSearchParams({ select: '*', order: 'created_at.desc', limit: '200' });
  q.set('status', `eq.${status}`);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/memories?${q}`, { headers: headers(token) });
  if (!res.ok) throw await parseError(res);
  const rows = (await res.json()) as AdminMemory[];
  const urls = await signUrls(rows.map((r) => r.storage_path), token, 1800).catch(() => ({} as Record<string, string>));
  return rows.map((r) => ({ ...r, path: r.storage_path, url: urls[r.storage_path] }));
}

export async function adminSetStatus(token: string, ids: string[], status: 'approved' | 'rejected' | 'pending', reviewer: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/memories?id=in.(${ids.join(',')})`, {
    method: 'PATCH',
    headers: { ...headers(token), 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ status, reviewed_at: new Date().toISOString(), reviewed_by: reviewer }),
  });
  if (!res.ok) throw await parseError(res);
}

/** Permanently delete photos: files first, then the records. */
export async function adminDelete(token: string, rows: { id: string; storage_path: string }[]) {
  if (!rows.length) return;
  const del = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}`, {
    method: 'DELETE',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefixes: rows.map((r) => r.storage_path) }),
  });
  if (!del.ok) throw await parseError(del);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/memories?id=in.(${rows.map((r) => r.id).join(',')})`, {
    method: 'DELETE',
    headers: { ...headers(token), Prefer: 'return=minimal' },
  });
  if (!res.ok) throw await parseError(res);
}

export async function adminIsOwner(token: string): Promise<boolean> {
  return rpc<boolean>('is_memory_admin', {}, token);
}

export async function adminSettings(token: string): Promise<{ uploads_open: boolean }> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/memory_settings?select=uploads_open&id=eq.1`, { headers: headers(token) });
  if (!res.ok) throw await parseError(res);
  const [row] = await res.json();
  return row ?? { uploads_open: true };
}

export async function adminSetUploadsOpen(token: string, open: boolean) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/memory_settings?id=eq.1`, {
    method: 'PATCH',
    headers: { ...headers(token), 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ uploads_open: open }),
  });
  if (!res.ok) throw await parseError(res);
}
