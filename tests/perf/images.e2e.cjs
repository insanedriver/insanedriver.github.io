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
