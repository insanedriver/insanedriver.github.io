// Generates the committed WebP variants (PERF-25):
//   npm run images   encodes every manifest output, skipping those newer than their source
// WebP at quality 78, effort 6, metadata stripped; the same sharp version gives the same bytes.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const IMAGES = 'assets/images';
const WIDTHS = [768, 1280, 1920];

const resized = name => ({
  src: `${IMAGES}/${name}.jpg`,
  outputs: WIDTHS.map(width => ({ file: `${IMAGES}/${name}-${width}.webp`, width })),
});
// width null keeps the source's native size.
const native = file => ({
  src: `${IMAGES}/${file}`,
  outputs: [{ file: `${IMAGES}/${file.replace(/\.(jpe?g|png)$/, '.webp')}`, width: null }],
});

// The covers the home shows: the hero release, the NOW::STREAMING pool and the archive albums.
function homeCovers() {
  const release = require('../_data/homeRelease.js')();
  const pool = require('../_data/homeShuffle.js')().pool;
  const albums = require('../_data/discography.json').albums;
  const covers = [release && release.cover, ...pool.map(s => s.cover), ...albums.map(a => a.cover)];
  return [...new Set(covers.filter(Boolean))].sort();
}

// [{ src, outputs: [{ file, width }] }], paths relative to the repo root.
const manifest = () => [
  ...[1, 2, 3, 4, 5, 6, 7].map(n => resized(`header_${n}`)),
  resized('band'),
  native('bodybg.jpg'),
  native('footer.jpg'),
  ...homeCovers().map(cover => native(`releases/${cover}`)),
];

async function encode(src, width, out) {
  let image = sharp(src);
  if (width) image = image.resize({ width });
  await image.webp({ quality: 78, effort: 6 }).toFile(out);
}

async function run() {
  for (const { src, outputs } of manifest()) {
    const source = path.join(ROOT, src);
    for (const { file, width } of outputs) {
      const out = path.join(ROOT, file);
      if (fs.existsSync(out) && fs.statSync(out).mtimeMs > fs.statSync(source).mtimeMs) continue;
      await encode(source, width, out);
      console.log(`${file} (${fs.statSync(out).size} bytes)`);
    }
  }
}

module.exports = { manifest, encode };

if (require.main === module) run().catch(err => { console.error(err); process.exit(1); });
