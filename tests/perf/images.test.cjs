// Checks the committed WebP variants against the scripts/images.cjs manifest and,
// from T14 on, the image markup in the built site: run `npm run build` first.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const sharp = require('sharp');
const { manifest, encode } = require('../../scripts/images.cjs');

const ROOT = path.join(__dirname, '../..');
const outputs = () => manifest().flatMap(entry => entry.outputs.map(out => ({ ...out, src: entry.src })));

test('PERF-25: the manifest covers every header, band, bodybg, footer and the home release covers', () => {
  const files = outputs().map(out => out.file);
  for (let n = 1; n <= 7; n++) {
    for (const w of [768, 1280, 1920]) assert.ok(files.includes(`assets/images/header_${n}-${w}.webp`), `header_${n}-${w}.webp`);
  }
  for (const w of [768, 1280, 1920]) assert.ok(files.includes(`assets/images/band-${w}.webp`), `band-${w}.webp`);
  assert.ok(files.includes('assets/images/bodybg.webp'));
  assert.ok(files.includes('assets/images/footer.webp'));
  // Covers the home renders: the hero release, the NOW::STREAMING pool and the archive albums.
  const release = require('../../_data/homeRelease.js')();
  const pool = require('../../_data/homeShuffle.js')().pool;
  const albums = require('../../_data/discography.json').albums;
  const covers = [release.cover, ...pool.map(s => s.cover), ...albums.map(a => a.cover)];
  assert.ok(covers.length > 3);
  for (const cover of covers) {
    assert.ok(files.includes(`assets/images/releases/${cover.replace(/\.jpg$/, '.webp')}`), `cover ${cover}`);
  }
});

test('PERF-31: every manifest output exists as a WebP at the manifest width', async () => {
  const all = outputs();
  assert.ok(all.length >= 7 * 3 + 3 + 2 + 4, `only ${all.length} outputs`);
  for (const out of all) {
    const file = path.join(ROOT, out.file);
    assert.ok(fs.existsSync(file), `missing ${out.file}`);
    const meta = await sharp(file).metadata();
    assert.equal(meta.format, 'webp', out.file);
    const expected = out.width || (await sharp(path.join(ROOT, out.src)).metadata()).width;
    assert.equal(meta.width, expected, `${out.file} width`);
    assert.equal(meta.exif, undefined, `${out.file} keeps EXIF`);
  }
});

test('PERF-25: re-encoding a source reproduces the committed bytes', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'perf-images-'));
  try {
    for (const [src, width, committed] of [
      ['assets/images/header_3.jpg', 768, 'assets/images/header_3-768.webp'],
      ['assets/images/footer.jpg', null, 'assets/images/footer.webp'],
    ]) {
      const fresh = path.join(dir, path.basename(committed));
      await encode(path.join(ROOT, src), width, fresh);
      assert.ok(fs.readFileSync(fresh).equals(fs.readFileSync(path.join(ROOT, committed))), `${committed} differs`);
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
