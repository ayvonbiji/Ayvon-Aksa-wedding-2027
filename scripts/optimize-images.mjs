/**
 * Optimise photographs for the website.
 *
 *   1. Put original photos (jpg / jpeg / png / webp) in the  /photos  folder.
 *   2. Run:  npm run images
 *   3. Optimised copies appear in  public/images/gallery/  as
 *        <name>.webp        (max 1600 px, for the lightbox)
 *        <name>-thumb.webp  (max 800 px, for the grid)
 *   4. Add them to src/content/gallery.ts.
 *
 * Options:  npm run images -- --rotate=<name>:<degrees>   (e.g. --rotate=beach:90)
 * EXIF orientation is applied automatically and all metadata (incl. GPS) is
 * stripped from the output.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const inDir = path.join(root, 'photos');
const outDir = path.join(root, 'public/images/gallery');
fs.mkdirSync(outDir, { recursive: true });

const rotations = Object.fromEntries(
  process.argv
    .filter((a) => a.startsWith('--rotate='))
    .map((a) => a.slice(9).split(':'))
    .map(([n, d]) => [n, Number(d)]),
);

if (!fs.existsSync(inDir)) {
  console.log('No /photos folder found — create it and add your photographs.');
  process.exit(0);
}

const files = fs.readdirSync(inDir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
for (const file of files) {
  const name = path.parse(file).name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const rot = rotations[name] ?? 0;
  const base = () => sharp(path.join(inDir, file)).rotate().rotate(rot);
  await base().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(outDir, `${name}.webp`));
  await base().resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true }).webp({ quality: 76 }).toFile(path.join(outDir, `${name}-thumb.webp`));
  const meta = await sharp(path.join(outDir, `${name}.webp`)).metadata();
  const orientation = meta.width > meta.height * 1.1 ? 'landscape' : meta.height > meta.width * 1.1 ? 'portrait' : 'square';
  console.log(`✓ ${name}.webp  ${meta.width}×${meta.height}  (${orientation})`);
}
console.log(`\nDone — ${files.length} photo(s). Now list them in src/content/gallery.ts`);
