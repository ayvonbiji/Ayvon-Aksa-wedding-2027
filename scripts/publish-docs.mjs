/**
 * Copies the production build (dist/) into docs/ — the folder GitHub Pages
 * serves when Settings → Pages is set to "Deploy from a branch: main / docs".
 * Run via:  npm run build:docs
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const dist = path.join(root, 'dist');
const docs = path.join(root, 'docs');
if (!fs.existsSync(path.join(dist, 'index.html'))) {
  console.error('dist/index.html not found — run the build first.');
  process.exit(1);
}
fs.rmSync(docs, { recursive: true, force: true });
fs.cpSync(dist, docs, { recursive: true });
// Serve files as-is (no Jekyll processing)
fs.writeFileSync(path.join(docs, '.nojekyll'), '');
console.log('✓ docs/ updated from dist/');
