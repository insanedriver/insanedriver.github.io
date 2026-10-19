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

// Attributes of one HTML tag (quoted or, after minification, unquoted), as { name: value }.
const attrs = tag => Object.fromEntries([...tag.replace(/^<\w+|\/?>$/g, '')
  .matchAll(/([\w-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)]
  .map(m => [m[1].toLowerCase(), m[2] ?? m[3] ?? m[4] ?? '']));
// srcset "url 768w, url 1280w" as [[url, '768w'], ...].
const srcset = value => value.split(',').map(s => s.trim().split(/\s+/));
const { layoutPages, page } = require('./built.cjs');

test('PERF-26: every base.html header is a <picture> with a 768/1280/1920 WebP srcset and a sized, eager JPEG fallback', () => {
  const pages = layoutPages().filter(([url]) => url !== '/');
  assert.ok(pages.length > 20, `only ${pages.length} base pages`);
  for (const [url, html] of pages) {
    const header = html.match(/<div class="?header-img"?>([\s\S]*?)<\/div>/);
    assert.ok(header, `${url}: no header image`);
    const picture = header[1].match(/^<picture>(<source[^>]*>)(<img[^>]*>)<\/picture>$/);
    assert.ok(picture, `${url}: header is not <picture><source><img></picture>: ${header[1]}`);
    const source = attrs(picture[1]);
    const img = attrs(picture[2]);
    const base = img.src.match(/^\/assets\/images\/(header_\d)\.jpg$/);
    assert.ok(base, `${url}: fallback ${img.src}`);
    assert.equal(source.type, 'image/webp', url);
    assert.equal(source.sizes, '100vw', url);
    assert.deepEqual(srcset(source.srcset), [768, 1280, 1920].map(w => [`/assets/images/${base[1]}-${w}.webp`, `${w}w`]), url);
    for (const [file] of srcset(source.srcset)) assert.ok(fs.existsSync(path.join(ROOT, file)), `${url}: missing ${file}`);
    assert.equal(img.width, '1920', url);
    assert.equal(img.height, '320', url);
    assert.equal(img.fetchpriority, 'high', url);
    assert.equal(img.loading, undefined, `${url}: header must not be lazy`);
    assert.equal(img.class, 'img-responsive', url);
  }
});
