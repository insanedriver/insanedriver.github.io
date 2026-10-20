const { test, expect } = require('../photos/browser.cjs');

// Every same-origin image the page requests, by path.
const imageRequests = page => {
  const seen = [];
  page.on('request', req => { if (req.resourceType() === 'image') seen.push(new URL(req.url()).pathname); });
  return seen;
};

test('PERF-26: /band/ at 375 px fetches the 768 px WebP header, not the JPEG', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  const seen = imageRequests(page);
  await page.goto('/band/', { waitUntil: 'load' });
  const header = page.locator('.header-img img');
  await expect(header).toHaveJSProperty('complete', true);
  expect(await header.evaluate(img => new URL(img.currentSrc).pathname)).toBe('/assets/images/header_3-768.webp');
  expect(seen).toContain('/assets/images/header_3-768.webp');
  expect(seen).not.toContain('/assets/images/header_3.jpg');
  // Same box as the JPEG: full width, 1920:320 aspect.
  const box = await header.boundingBox();
  expect(box.width).toBe(375);
  expect(box.height).toBeCloseTo(375 * 320 / 1920, 0);
});

// Rendered size of the band photo before it became a <picture>, by viewport width.
const BAND_PHOTO_BOX = { 375: [269, 179.33], 1440: [1314, 876] };

for (const [width, [w, h]] of Object.entries(BAND_PHOTO_BOX)) {
  test(`PERF-28: at ${width} px the band photo loads as WebP once scrolled into view, at its original size`, async ({ page }) => {
    await page.setViewportSize({ width: Number(width), height: 700 });
    const seen = imageRequests(page);
    await page.goto('/band/', { waitUntil: 'load' });
    const photo = page.locator('.cyber-band-photo');
    await photo.scrollIntoViewIfNeeded();
    await expect(photo).toHaveJSProperty('complete', true);
    expect(await photo.evaluate(img => new URL(img.currentSrc).pathname)).toMatch(/^\/assets\/images\/band-(768|1280|1920)\.webp$/);
    expect(seen.filter(p => p.startsWith('/assets/images/band'))).toEqual([await photo.evaluate(img => new URL(img.currentSrc).pathname)]);
    const box = await photo.boundingBox();
    expect(box.width).toBeCloseTo(w, 0);
    expect(box.height).toBeCloseTo(h, 0);
  });
}

// /band/ hides the footer texture (band.less sets footer background-image: none), so the
// footer image is checked on /videos/, which shows it.
for (const [path, images] of [['/band/', ['bodybg']], ['/videos/', ['bodybg', 'footer']]]) {
  test(`PERF-27: ${path} fetches the WebP ${images.join(' and ')} background, not the JPEG`, async ({ page }) => {
    const seen = imageRequests(page);
    await page.goto(path, { waitUntil: 'load' });
    await page.locator('footer').scrollIntoViewIfNeeded();
    await expect.poll(() => seen).toEqual(expect.arrayContaining(images.map(name => `/assets/images/${name}.webp`)));
    for (const name of ['bodybg', 'footer']) expect(seen).not.toContain(`/assets/images/${name}.jpg`);
  });
}

test('PERF-29: the home shows the hero cover as WebP, and a shuffled NOW::STREAMING cover as its own WebP', async ({ page }) => {
  const { pool } = require('../../_data/homeShuffle.js')();
  const release = require('../../_data/homeRelease.js')();
  const pick = pool[pool.length - 1];
  await page.addInitScript(v => { Math.random = () => v; }, (pool.length - 0.5) / pool.length);
  const seen = imageRequests(page);
  await page.goto('/', { waitUntil: 'load' });
  const hero = page.locator('.home-release-cover');
  await expect(hero).toHaveJSProperty('complete', true);
  // At 1280 px the card is 112 px wide: the 160 w file.
  expect(await hero.evaluate(img => new URL(img.currentSrc).pathname)).toBe(`/assets/images/releases/${release.cover.replace(/\.jpg$/, '-160.webp')}`);
  const cover = page.locator('[data-home-streaming-cover]');
  await expect(cover).toHaveAttribute('src', `/assets/images/releases/${pick.cover}`);
  await cover.scrollIntoViewIfNeeded();
  await expect.poll(() => cover.evaluate(img => img.complete && img.currentSrc && new URL(img.currentSrc).pathname))
    .toMatch(new RegExp(`^/assets/images/releases/${pick.cover.replace(/\.jpg$/, '')}(-160|-320)?\\.webp$`));
  expect(seen.filter(p => p.startsWith('/assets/images/releases/') && p.endsWith('.jpg'))).toEqual([]);
});

test('PS2-03: at 412 x 915, DPR 1.75 the release card and archive covers fetch no 600 w cover', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1.75 });
  const page = await context.newPage();
  await page.route('**/*', route => ['127.0.0.1', 'localhost'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
  const seen = imageRequests(page);
  await page.goto('/', { waitUntil: 'load' });
  // Bring every lazy cover into view.
  for (const img of await page.locator('.home-archive-art img').all()) await img.scrollIntoViewIfNeeded();
  const covers = page.locator('.home-release-cover, .home-archive-art img');
  expect(await covers.count()).toBeGreaterThan(3);
  await expect.poll(() => covers.evaluateAll(imgs => imgs.every(img => img.complete))).toBe(true);
  const current = await covers.evaluateAll(imgs => imgs.map(img => new URL(img.currentSrc).pathname));
  for (const pathname of current) expect(pathname, pathname).toMatch(/-(160|320)\.webp$/);
  // The 600 w candidate of each of their sources must never have been requested.
  const full = await page.locator('.home-release-cover, .home-archive-art img').evaluateAll(imgs =>
    imgs.map(img => img.parentElement.querySelector('source').srcset.split(',').map(c => c.trim()).find(c => c.endsWith(' 600w')).split(' ')[0]));
  expect(full.length).toBe(current.length);
  for (const url of full) expect(seen, url).not.toContain(url);
  await context.close();
});

test('PS2-08: /photos/ fetches its grid and highlight thumbnails as WebP and requests no JPEG thumbnail', async ({ page }) => {
  const photos = require('../../_data/photos.json');
  const highlights = require('../../_data/highlights.js')();
  const jpegs = new Set(photos.map(p => p.thumbnail));
  // A fixed shuffle, so photos.js swaps the highlight buttons to other photos.
  await page.addInitScript(() => { Math.random = () => 0; });
  const seen = imageRequests(page);
  await page.goto('/photos/', { waitUntil: 'load' });
  const thumbs = page.locator('.photos-thumbnail img, .photos-archive img');
  expect(await thumbs.count()).toBe(highlights.length + photos.length);
  await expect(page.locator('.photos-thumbnail img').first()).not.toHaveAttribute('src', highlights[0].thumbnail);
  for (const img of await thumbs.all()) await img.scrollIntoViewIfNeeded();
  await expect.poll(() => thumbs.evaluateAll(imgs => imgs.every(img => img.complete && img.currentSrc))).toBe(true);
  // Each shows the WebP of its own JPEG src, including the re-shuffled highlight buttons.
  const shown = await thumbs.evaluateAll(imgs => imgs.map(img => [new URL(img.currentSrc).pathname, img.getAttribute('src')]));
  for (const [current, src] of shown) {
    expect(current, src).toBe(src.replace(/\.jpg$/, '.webp'));
    expect(seen, src).toContain(current);
  }
  expect(seen.filter(p => jpegs.has(p))).toEqual([]);
});
