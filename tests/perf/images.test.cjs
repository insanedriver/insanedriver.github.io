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

test('PS2-01 / PS2-05: every home cover has -160, -320 and 600 px WebP outputs at 160, 320 and 600 px wide', async () => {
  const files = outputs();
  const release = require('../../_data/homeRelease.js')();
  const pool = require('../../_data/homeShuffle.js')().pool;
  const albums = require('../../_data/discography.json').albums;
  const covers = [...new Set([release.cover, ...pool.map(s => s.cover), ...albums.map(a => a.cover)])];
  for (const cover of covers) {
    for (const [suffix, width] of [['-160', 160], ['-320', 320], ['', 600]]) {
      const file = `assets/images/releases/${cover.replace(/\.jpg$/, `${suffix}.webp`)}`;
      // In the manifest, so a variant dropped from it fails here.
      assert.ok(files.some(out => out.file === file && out.width === (width === 600 ? null : width)), `manifest lacks ${file}`);
      assert.ok(fs.existsSync(path.join(ROOT, file)), `missing ${file}`);
      const meta = await sharp(path.join(ROOT, file)).metadata();
      assert.equal(meta.format, 'webp', file);
      assert.equal(meta.width, width, `${file} width`);
    }
  }
});

test('PS2-06: every photos.json thumbnail has a WebP of the same pixel size next to it', async () => {
  const thumbs = [...new Set(require('../../_data/photos.json').map(p => p.thumbnail))];
  assert.ok(thumbs.length > 10, `only ${thumbs.length} thumbnails`);
  const files = outputs();
  for (const url of thumbs) {
    const webp = url.replace(/^\//, '').replace(/\.jpg$/, '.webp');
    assert.ok(files.some(out => out.file === webp), `manifest lacks ${webp}`);
    assert.ok(fs.existsSync(path.join(ROOT, webp)), `missing ${webp}`);
    const jpeg = await sharp(path.join(ROOT, url)).metadata();
    const meta = await sharp(path.join(ROOT, webp)).metadata();
    assert.equal(meta.format, 'webp', webp);
    assert.deepEqual([meta.width, meta.height], [jpeg.width, jpeg.height], webp);
  }
});

test('PS2-09: the band logos have WebP outputs at 300 / 300 / 600 px wide that keep the alpha channel', async () => {
  const files = outputs();
  for (const [file, width] of [['logo_loading.webp', 300], ['logo_horizontal-300.webp', 300], ['logo_horizontal-600.webp', 600]]) {
    assert.ok(files.some(out => out.file === `assets/images/${file}`), `manifest lacks ${file}`);
    assert.ok(fs.existsSync(path.join(ROOT, 'assets/images', file)), `missing ${file}`);
    const meta = await sharp(path.join(ROOT, 'assets/images', file)).metadata();
    assert.equal(meta.format, 'webp', file);
    assert.equal(meta.width, width, `${file} width`);
    assert.equal(meta.hasAlpha, true, `${file} alpha`);
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

test('PERF-28: the band photo on /band/ is a <picture> with a WebP srcset and a sized, lazy, async JPEG', () => {
  const picture = page('/band/').match(/<picture>(<source[^>]*>)(<img[^>]*class="?cyber-band-photo"?[^>]*>)<\/picture>/);
  assert.ok(picture, 'band photo is not <picture><source><img></picture>');
  const source = attrs(picture[1]);
  const img = attrs(picture[2]);
  assert.equal(source.type, 'image/webp');
  assert.deepEqual(srcset(source.srcset), [768, 1280, 1920].map(w => [`/assets/images/band-${w}.webp`, `${w}w`]));
  for (const [file] of srcset(source.srcset)) assert.ok(fs.existsSync(path.join(ROOT, file)), `missing ${file}`);
  assert.equal(img.src, '/assets/images/band.jpg');
  assert.equal(img.width, '1920');
  assert.equal(img.height, '1280');
  assert.equal(img.loading, 'lazy');
  assert.equal(img.decoding, 'async');
});

// The declarations of the first rule for `selector` in an emitted stylesheet, in order.
const ruleBody = (cssFile, selector) => {
  const css = fs.readFileSync(path.join(ROOT, 'assets/css', cssFile), 'utf8');
  const escaped = selector.replace(/[.#]/g, '\\$&');
  const rule = css.match(new RegExp(`(?:^|[}\\s])${escaped}\\{([^}]*)\\}`));
  assert.ok(rule, `${cssFile}: no ${selector} rule`);
  return rule[1];
};
// image-set(url(<name>.webp) type("image/webp"), url(<name>.jpg) type("image/jpeg")), quotes optional.
const imageSet = name => new RegExp(`image-set\\(url\\(['"]?\\.\\./images/${name}\\.webp['"]?\\)\\s*type\\(['"]image/webp['"]\\)\\s*,\\s*url\\(['"]?\\.\\./images/${name}\\.jpg['"]?\\)\\s*type\\(['"]image/jpeg['"]\\)\\)`);

test('PERF-27: #content and footer backgrounds declare the JPEG, then an image-set with WebP first', () => {
  for (const [selector, name] of [['#content', 'bodybg'], ['footer', 'footer']]) {
    const body = ruleBody('core.min.css', selector);
    const plain = body.search(new RegExp(`background-image:url\\(['"]?\\.\\./images/${name}\\.jpg['"]?\\)`));
    const set = body.search(new RegExp(`background-image:${imageSet(name).source}`));
    assert.ok(plain >= 0, `${selector}: no plain url() fallback: ${body}`);
    assert.ok(set > plain, `${selector}: no image-set after the fallback: ${body}`);
  }
});

test('PERF-27: the home bodybg layer keeps its gradient and adds the WebP image-set after the JPEG', () => {
  const body = ruleBody('home.min.css', '.home-content');
  const layers = [...body.matchAll(/background:([^;]*)/g)].map(m => m[1]);
  assert.equal(layers.length, 2, body);
  assert.match(layers[0], /^linear-gradient\(.*\),\s*url\(['"]?\.\.\/images\/bodybg\.jpg['"]?\)$/);
  // Same gradient layer, with the image-set in place of the plain url().
  assert.equal(layers[1].replace(imageSet('bodybg'), 'X'), layers[0].replace(/url\(['"]?\.\.\/images\/bodybg\.jpg['"]?\)$/, 'X'));
});

test('PERF-29: every release cover on / is a <picture> with its WebP source; only the hero release cover is eager', () => {
  const html = page('/');
  const covers = [...html.matchAll(/<img[^>]*src="?\/assets\/images\/releases\/[^>]*>/g)].map(m => m[0]);
  const albums = require('../../_data/discography.json').albums;
  // Hero release + NOW::STREAMING + one per archive album.
  assert.equal(covers.length, 2 + albums.length);
  for (const tag of covers) {
    const img = attrs(tag);
    const picture = html.match(new RegExp(`<picture>(<source[^>]*>)${tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</picture>`));
    assert.ok(picture, `${img.src} is not inside <picture><source>`);
    const source = attrs(picture[1]);
    assert.equal(source.type, 'image/webp', img.src);
    assert.ok(source.srcset.endsWith(`${img.src.replace(/\.jpg$/, '.webp')} 600w`), `${img.src}: 600w file is not the original WebP`);
    assert.match(img.width, /^\d+$/, `${img.src} width`);
    assert.match(img.height, /^\d+$/, `${img.src} height`);
    if (/home-release-cover/.test(img.class)) assert.equal(img.loading, undefined, 'the hero release cover must stay eager');
    else assert.equal(img.loading, 'lazy', `${img.src} loading`);
  }
  assert.equal(covers.filter(tag => /home-release-cover/.test(tag)).length, 1);
});

test('PS2-02: every cover <source> on / lists the 160, 320 and 600 w files and has a non-empty sizes', () => {
  const html = page('/');
  const sources = [...html.matchAll(/<source[^>]*srcset="?\/assets\/images\/releases\/[^>]*>/g)].map(m => attrs(m[0]));
  const albums = require('../../_data/discography.json').albums;
  // Hero release + NOW::STREAMING + one per archive album.
  assert.equal(sources.length, 2 + albums.length);
  for (const source of sources) {
    const list = srcset(source.srcset);
    assert.deepEqual(list.map(([, w]) => w), ['160w', '320w', '600w'], source.srcset);
    const base = list[2][0].replace(/\.webp$/, '');
    assert.deepEqual(list.map(([url]) => url), [`${base}-160.webp`, `${base}-320.webp`, `${base}.webp`], source.srcset);
    for (const [file] of list) assert.ok(fs.existsSync(path.join(ROOT, file)), `missing ${file}`);
    assert.ok((source.sizes || '').trim() !== '', `${source.srcset}: empty sizes`);
  }
});

test('PERF-30: every <img> on / and /band/ has width and height, and local ones match the file', async () => {
  for (const url of ['/', '/band/']) {
    const tags = [...page(url).matchAll(/<img\b[^>]*>/g)].map(m => attrs(m[0]));
    assert.ok(tags.length > 3, `${url}: only ${tags.length} images`);
    for (const img of tags) {
      assert.match(img.width ?? '', /^\d+$/, `${url}: ${img.src} width`);
      assert.match(img.height ?? '', /^\d+$/, `${url}: ${img.src} height`);
      if (!img.src.startsWith('/')) continue;
      const meta = await sharp(path.join(ROOT, img.src)).metadata();
      // Same aspect ratio as the file (within one pixel of rounding).
      assert.ok(Math.abs(Number(img.height) - Number(img.width) * meta.height / meta.width) <= 1,
        `${url}: ${img.src} is ${img.width}x${img.height}, file is ${meta.width}x${meta.height}`);
    }
  }
});

test('PERF-30: the menu logo is 600x95 and lazy on every layout page', () => {
  for (const [url, html] of layoutPages()) {
    const logo = html.match(/<img\b[^>]*class="?logo-header"?[^>]*>/);
    assert.ok(logo, `${url}: no menu logo`);
    const img = attrs(logo[0]);
    assert.deepEqual([img.width, img.height, img.loading], ['600', '95', 'lazy'], url);
  }
});

// PS2-07: the photos.json thumbnail <img> tags on `url`, after checking each sits in
// <picture><source type="image/webp" srcset="<thumbnail>.webp"> with the JPEG kept as its src.
const thumbnailPictures = url => {
  const html = page(url);
  const thumbs = new Set(require('../../_data/photos.json').map(p => p.thumbnail));
  const tags = [...html.matchAll(/<img\b[^>]*>/g)].map(m => m[0]).filter(tag => thumbs.has(attrs(tag).src));
  for (const tag of tags) {
    const img = attrs(tag);
    const picture = html.match(new RegExp(`<picture>(<source[^>]*>)${tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</picture>`));
    assert.ok(picture, `${url}: ${img.src} is not inside <picture><source>`);
    const source = attrs(picture[1]);
    assert.equal(source.type, 'image/webp', `${url}: ${img.src}`);
    assert.equal(source.srcset, img.src.replace(/\.jpg$/, '.webp'), `${url}: ${img.src}`);
    assert.ok(fs.existsSync(path.join(ROOT, source.srcset)), `${url}: missing ${source.srcset}`);
  }
  return tags;
};

test('PS2-07: every gallery teaser thumbnail on / is a <picture> with its WebP source and the JPEG as src', () => {
  const highlights = require('../../_data/highlights.js')();
  assert.deepEqual(thumbnailPictures('/').map(tag => attrs(tag).src), highlights.map(p => p.thumbnail));
});

test('PS2-07: every highlight-button and grid thumbnail on /photos/ is a <picture> with its WebP source and the JPEG as src', () => {
  const highlights = require('../../_data/highlights.js')();
  const photos = require('../../_data/photos.json');
  // The highlight buttons come first, then the archive grid.
  assert.deepEqual(thumbnailPictures('/photos/').map(tag => attrs(tag).src), [...highlights, ...photos].map(p => p.thumbnail));
});
