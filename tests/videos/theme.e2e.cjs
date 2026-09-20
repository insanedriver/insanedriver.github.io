const { test, expect } = require('../photos/browser.cjs');

test('VPLR-20: the site backdrop image shows behind a transparent cyber-zone', async ({ page }) => {
  await page.goto('/videos/');
  expect(await page.locator('#content').evaluate(el => getComputedStyle(el).backgroundImage)).toContain('bodybg');
  await expect(page.locator('.videos-shell.cyber-zone')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
});

test('VPLR-21: shared chrome palette and fonts', async ({ page }) => {
  await page.goto('/videos/');
  await expect(page.locator('.cyber-panel-tab').first()).toHaveCSS('border-top-color', 'rgb(0, 243, 255)');
  await expect(page.locator('.corner-bl').first()).toHaveCSS('background-color', 'rgb(0, 95, 140)');
  await expect(page.locator('.videos-accent').first()).toHaveCSS('color', 'rgb(255, 0, 234)');
  await expect(page.locator('.videos-counter')).toHaveCSS('color', 'rgb(0, 243, 255)');
  expect(await page.locator('.videos-shell').evaluate(el => getComputedStyle(el).fontFamily)).toContain('Rajdhani');
  expect(await page.locator('.videos-counter').evaluate(el => getComputedStyle(el).fontFamily)).toContain('Share Tech Mono');
});

test('VPLR-18: the feed scrolls horizontally with scroll-snap', async ({ page }) => {
  await page.goto('/videos/');
  const feed = page.locator('[data-idtv-feed]');
  await expect(feed).toHaveCSS('overflow-x', 'auto');
  expect(await feed.evaluate(el => getComputedStyle(el).scrollSnapType)).toContain('x');
  expect(await feed.evaluate(el => el.scrollWidth > el.clientWidth)).toBe(true);
});

test('VPLR-22: reduced motion removes animation and transitions from cyber-zone and video elements', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/videos/');
  const result = await page.evaluate(() => {
    const zone = document.querySelector('.videos-shell');
    const names = [zone, document.querySelector('.cyber-panel-body'), document.querySelector('.cyber-panel-tab .tab-icon'), document.querySelector('.videos-card')]
      .map(el => [getComputedStyle(el).animationName, getComputedStyle(el).transitionDuration]);
    return { names, before: getComputedStyle(zone, '::before').animationName, after: getComputedStyle(zone, '::after').animationName };
  });
  for (const [animation, transition] of result.names) {
    expect(animation).toBe('none');
    expect(transition).toBe('0s');
  }
  expect(result.before).toBe('none');
  expect(result.after).toBe('none');
});

test('VPLR-23: the scanline overlay sits below the content that holds the stage', async ({ page }) => {
  await page.goto('/videos/');
  const stacking = await page.evaluate(() => ({
    inner: Number(getComputedStyle(document.querySelector('.cyber-zone-inner')).zIndex),
    scanline: Number(getComputedStyle(document.querySelector('.videos-shell'), '::after').zIndex),
    stageInsideInner: !!document.querySelector('.cyber-zone-inner .videos-stage'),
  }));
  expect(stacking.stageInsideInner).toBe(true);
  expect(stacking.inner).toBeGreaterThan(stacking.scanline);
});

for (const width of [375, 1280]) {
  test(`VPLR-24: the page has no horizontal scroll at ${width}px and the stage stays 16:9`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/videos/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const box = await page.locator('.videos-screen').boundingBox();
    expect(Math.abs(box.width / box.height - 16 / 9)).toBeLessThan(0.02);
    expect(box.width).toBeLessThanOrEqual(width);
  });
}
