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
// A cover is shown from 74 to ~420 px: 160 and 320 px variants, plus the 600 px original as <cover>.webp.
const COVER_WIDTHS = [160, 320];
const cover = file => ({
  src: `${IMAGES}/releases/${file}`,
  outputs: [
    ...COVER_WIDTHS.map(width => ({ file: `${IMAGES}/releases/${file.replace(/\.jpg$/, `-${width}.webp`)}`, width })),
    { file: `${IMAGES}/releases/${file.replace(/\.jpg$/, '.webp')}`, width: null },
  ],
});

// The gallery thumbnails listed in _data/photos.json, as repo-relative paths.
function thumbnails() {
  const photos = require('../_data/photos.json');
  return [...new Set(photos.map(p => p.thumbnail).filter(Boolean))].map(url => url.replace(/^\//, '')).sort();
}

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
  ...homeCovers().map(cover),
  native('logo_loading.png'),
  { src: `${IMAGES}/logo_horizontal.png`, outputs: [300, 600].map(width => ({ file: `${IMAGES}/logo_horizontal-${width}.webp`, width })) },
  ...thumbnails().map(src => ({ src, outputs: [{ file: src.replace(/\.jpe?g$/, '.webp'), width: null }] })),
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
