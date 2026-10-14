/**
 * Runs supabase/migrations/001_wedding_memories.sql on an embedded Postgres
 * (PGlite) with minimal stand-ins for Supabase's auth/storage schemas and
 * anon/authenticated roles, then checks the security rules.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';

const SUPABASE_STUBS = `
  create role anon nologin; create role authenticated nologin;
  create schema auth; create schema storage;
  grant usage on schema auth, storage, public to anon, authenticated;
  create function auth.jwt() returns jsonb language sql stable as $$
    select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
  create function auth.role() returns text language sql stable as $$ select auth.jwt() ->> 'role' $$;
  grant execute on function auth.jwt(), auth.role() to anon, authenticated;
  create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text, metadata jsonb, unique (bucket_id, name));
  alter table storage.objects enable row level security;
  grant select, insert, delete on storage.objects to anon, authenticated;
`;

let db: PGlite;

/** Run statements as a given role with given JWT claims and request headers. */
async function as<T = Record<string, unknown>>(role: 'anon' | 'authenticated', sql: string, params: unknown[] = [], claims: object = {}, ip = '203.0.113.7') {
  await db.exec(`reset role;`);
  await db.query(`select set_config('request.jwt.claims', $1, false), set_config('request.headers', $2, false)`, [
    JSON.stringify({ role, ...claims }),
    JSON.stringify({ 'x-forwarded-for': ip }),
  ]);
  await db.exec(`set role ${role};`);
  try {
    return (await db.query<T>(sql, params)).rows;
  } finally {
    await db.exec(`reset role;`);
  }
}

const hash = (n: number) => n.toString(16).padStart(64, 'a');
const begin = (n: number, ip?: string, extra: Partial<{ name: string; caption: string; show: boolean }> = {}) =>
  as<{ id: string; path: string; delete_token: string }>(
    'anon',
    `select * from public.begin_memory_upload('image/jpeg', 500000, 1600, 1200, $1, $2, $3, $4)`,
    [hash(n), extra.name ?? null, extra.caption ?? null, extra.show ?? false],
    {},
    ip,
  );
const putObject = (path: string, size = 500000, mime = 'image/jpeg', ip?: string) =>
  as('anon', `insert into storage.objects (bucket_id, name, metadata) values ('wedding-memories', $1, $2)`, [path, JSON.stringify({ size, mimetype: mime })], {}, ip);
const admin = { email: 'owner@example.com' };

beforeAll(async () => {
  db = new PGlite();
  await db.exec(SUPABASE_STUBS);
  await db.exec(fs.readFileSync('supabase/migrations/001_wedding_memories.sql', 'utf8'));
  // migration is re-runnable
  await db.exec(fs.readFileSync('supabase/migrations/001_wedding_memories.sql', 'utf8'));
  await db.exec(`insert into public.memory_admins (email) values ('owner@example.com')`);
}, 60_000);

describe('guest uploads', () => {
  it('anon cannot read or write the tables directly', async () => {
    await expect(as('anon', 'select * from public.memories')).rejects.toThrow(/permission denied/);
    await expect(as('anon', `insert into public.memory_admins values ('x@y.z')`)).rejects.toThrow(/permission denied/);
    await expect(as('anon', 'select * from public.memory_settings')).rejects.toThrow(/permission denied/);
  });

  it('reserves a slot, accepts the file, and marks it pending (hidden from public)', async () => {
    const [slot] = await begin(1, undefined, { name: 'Anu <script>', caption: '  Beautiful day  ', show: true });
    expect(slot.path).toMatch(/^guests\/\d{4}-\d{2}-\d{2}\/[0-9a-f-]{36}\.jpg$/);
    await putObject(slot.path);
    const [r] = await as<{ finish_memory_upload: string }>('anon', 'select public.finish_memory_upload($1, $2)', [slot.id, slot.delete_token]);
    expect(r.finish_memory_upload).toBe('pending');
    expect(await as('anon', 'select * from public.list_approved_memories()')).toHaveLength(0);
    const [row] = (await db.query<{ guest_name: string; caption: string }>(`select guest_name, caption from public.memories where id = $1`, [slot.id])).rows;
    expect(row.guest_name).toBe('Anu script'); // < > and control chars stripped
    expect(row.caption).toBe('Beautiful day');
  });

  it('cannot upload to a path that was not reserved, or reuse a path', async () => {
    await expect(putObject('guests/2027-08-23/evil.jpg')).rejects.toThrow(/row-level security/);
    const [slot] = await begin(2);
    await putObject(slot.path);
    await as('anon', 'select public.finish_memory_upload($1, $2)', [slot.id, slot.delete_token]);
    await expect(putObject(slot.path)).rejects.toThrow(/row-level security|duplicate key/);
  });

  it('rejects bad input: type, size, hash, dimensions and duplicates', async () => {
    await expect(as('anon', `select * from public.begin_memory_upload('image/gif', 1000, 10, 10, $1)`, [hash(50)])).rejects.toThrow(/unsupported_type/);
    await expect(as('anon', `select * from public.begin_memory_upload('image/jpeg', 20000000, 10, 10, $1)`, [hash(51)])).rejects.toThrow(/too_large/);
    await expect(as('anon', `select * from public.begin_memory_upload('image/jpeg', 1000, 10, 10, 'nothex')`)).rejects.toThrow(/bad_hash/);
    await expect(as('anon', `select * from public.begin_memory_upload('image/jpeg', 1000, 0, 10, $1)`, [hash(52)])).rejects.toThrow(/bad_dimensions/);
    await expect(begin(1)).rejects.toThrow(/duplicate/);
  });

  it('rejects a stored file whose real size/type does not match', async () => {
    const [slot] = await begin(3);
    await putObject(slot.path, 99_000_000);
    await expect(as('anon', 'select public.finish_memory_upload($1, $2)', [slot.id, slot.delete_token])).rejects.toThrow(/file_rejected/);
  });

  it('finish requires the secret token', async () => {
    const [slot] = await begin(4);
    await putObject(slot.path);
    await expect(as('anon', 'select public.finish_memory_upload($1, $2)', [slot.id, 'wrong'])).rejects.toThrow(/not_found/);
  });

  it('rate-limits uploads per visitor', async () => {
    await db.exec(`update public.memory_settings set max_per_ip_hour = 3`);
    const ip = '198.51.100.20';
    await begin(100, ip);
    await begin(101, ip);
    await begin(102, ip);
    await expect(begin(103, ip)).rejects.toThrow(/rate_limited/);
    await begin(104, '198.51.100.99'); // other visitors unaffected
    await db.exec(`update public.memory_settings set max_per_ip_hour = 40`);
  });

  it('owner can close uploads', async () => {
    await db.exec(`update public.memory_settings set uploads_open = false`);
    await expect(begin(200)).rejects.toThrow(/uploads_closed/);
    await db.exec(`update public.memory_settings set uploads_open = true`);
  });
});

describe('moderation', () => {
  it('ordinary signed-in users cannot see or change photos', async () => {
    const stranger = { email: 'stranger@example.com' };
    expect(await as('authenticated', 'select * from public.memories', [], stranger)).toHaveLength(0);
    const upd = await as('authenticated', `update public.memories set status = 'approved' returning id`, [], stranger);
    expect(upd).toHaveLength(0);
  });

  it('owner sees pending photos and approval makes them public (name only if allowed)', async () => {
    const pending = await as<{ id: string; guest_name: string }>('authenticated', `select id, guest_name from public.memories where status = 'pending' order by created_at`, [], admin);
    expect(pending.length).toBeGreaterThanOrEqual(2);
    await as('authenticated', `update public.memories set status = 'approved', reviewed_at = now(), reviewed_by = 'owner' where status = 'pending'`, [], admin);
    const pub = await as<{ guest_name: string | null; caption: string | null; path: string }>('anon', 'select * from public.list_approved_memories(10)');
    expect(pub.length).toBe(pending.length);
    expect(pub.map((p) => p.guest_name).filter(Boolean)).toEqual(['Anu script']); // only the one who opted in
    // approved files are readable through storage; others are not
    const visible = await as('anon', `select name from storage.objects where bucket_id = 'wedding-memories'`);
    expect(visible.length).toBe(pub.length);
  });

  it('rejected photos disappear from the public list', async () => {
    const [p] = await as<{ id: string }>('anon', 'select * from public.list_approved_memories(1)');
    await as('authenticated', `update public.memories set status = 'rejected' where id = $1`, [p.id], admin);
    const after = await as<{ id: string }>('anon', 'select id from public.list_approved_memories(50)');
    expect(after.map((x) => x.id)).not.toContain(p.id);
  });

  it('owner can delete rows; strangers cannot', async () => {
    const [r] = (await db.query<{ id: string }>(`select id from public.memories where status = 'rejected' limit 1`)).rows;
    const strangerDel = await as('authenticated', 'delete from public.memories where id = $1 returning id', [r.id], { email: 'x@example.com' });
    expect(strangerDel).toHaveLength(0);
    const ownerDel = await as('authenticated', 'delete from public.memories where id = $1 returning id', [r.id], admin);
    expect(ownerDel).toHaveLength(1);
  });

  it('a guest can remove their own photo with their removal code', async () => {
    const [slot] = await begin(300);
    await putObject(slot.path);
    await as('anon', 'select public.finish_memory_upload($1, $2)', [slot.id, slot.delete_token]);
    await expect(as('anon', 'select public.remove_my_memory($1, $2)', [slot.id, 'guess'])).rejects.toThrow(/not_found/);
    const [r] = await as<{ remove_my_memory: string }>('anon', 'select public.remove_my_memory($1, $2)', [slot.id, slot.delete_token]);
    expect(r.remove_my_memory).toBe(slot.path);
    const del = await as('anon', `delete from storage.objects where bucket_id = 'wedding-memories' and name = $1 returning name`, [slot.path]);
    expect(del).toHaveLength(1);
  });

  it('visitors cannot delete files of non-removed photos', async () => {
    const [p] = await as<{ path: string }>('anon', 'select * from public.list_approved_memories(1)');
    const del = await as('anon', `delete from storage.objects where name = $1 returning name`, [p.path]);
    expect(del).toHaveLength(0);
  });
});
