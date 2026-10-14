/**
 * Connect guest photo uploads to your Supabase project.
 *
 *   npm run connect-memories -- https://YOUR-PROJECT.supabase.co YOUR_ANON_PUBLIC_KEY
 *
 * Writes the two values into src/config/wedding.ts and, if this computer can
 * reach Supabase, checks that the database setup (SQL migration) has been run.
 * The anon/public key is meant to be public. NEVER pass the service_role key.
 */
import fs from 'node:fs';
import path from 'node:path';

const [url, key] = process.argv.slice(2);
const file = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../src/config/wedding.ts');

const fail = (msg) => {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
};

if (!url || !key) fail('Usage: npm run connect-memories -- https://YOUR-PROJECT.supabase.co YOUR_ANON_PUBLIC_KEY');
if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url)) fail(`"${url}" does not look like a Supabase Project URL (https://xxxx.supabase.co).`);

// Refuse the secret key: decode the JWT payload and check its role.
let role = '';
try {
  const payload = JSON.parse(Buffer.from(key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());
  role = payload.role || '';
} catch {
  if (!key.startsWith('sb_publishable_')) fail('That key is not a Supabase anon/public (publishable) key.');
}
if (role === 'service_role' || key.startsWith('sb_secret_')) fail('That is the SECRET service_role key. Use the anon / public key instead — never publish the secret key.');

let src = fs.readFileSync(file, 'utf8');
src = src.replace(/supabaseUrl: '[^']*'/, `supabaseUrl: '${url.replace(/\/$/, '')}'`);
src = src.replace(/supabaseAnonKey: '[^']*'/, `supabaseAnonKey: '${key}'`);
fs.writeFileSync(file, src);
console.log(`✓ Saved Supabase URL and anon key to src/config/wedding.ts`);

// Optional live check
try {
  const res = await fetch(`${url.replace(/\/$/, '')}/rest/v1/rpc/memory_uploads_open`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: '{}',
    signal: AbortSignal.timeout(10000),
  });
  if (res.ok) console.log(`✓ Database is set up — uploads are ${(await res.json()) ? 'OPEN' : 'closed'}.`);
  else if (res.status === 404) console.log('! Connected, but the database setup is missing: run supabase/migrations/001_wedding_memories.sql in the Supabase SQL Editor.');
  else console.log(`! Supabase answered ${res.status}: ${await res.text()}`);
} catch {
  console.log('… Could not reach Supabase from this computer to verify. Open /manage-memories/ after deploying and use "Check setup".');
}
console.log('\nNext: npm run build:docs, then commit and push.\n');
