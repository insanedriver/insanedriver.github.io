const { test, expect } = require('../photos/browser.cjs');

const style = (page, sel, prop, pseudo = null) =>
  page.evaluate(([s, p, ps]) => getComputedStyle(document.querySelector(s), ps)[p], [sel, prop, pseudo]);

const PANEL_ANIMATED = [
  ['.cyber-zone', '::before'],
  ['.cyber-panel-body', null],
  ['.cyber-panel-body', '::after'],
  ['.cyber-panel-tab .tab-icon', null]
];

test('HOME-32: Rajdhani body text, Share Tech Mono HUD, and the four-colour palette', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' });
  expect(await style(page, '.cyber-zone .cyber-panel-body', 'fontFamily')).toMatch(/Rajdhani/);
  expect(await style(page, '.home-shell', 'fontFamily')).toMatch(/Rajdhani/);
  expect(await style(page, '.cyber-zone .cyber-panel-body', 'fontFamily', '::after')).toMatch(/Share Tech Mono/);
  expect(await style(page, '.cyber-zone .home-eyebrow', 'fontFamily')).toMatch(/Share Tech Mono/);
  expect(await style(page, '.cyber-zone .cyber-panel-tab', 'borderTopColor')).toBe('rgb(0, 243, 255)');
  expect(await style(page, '.cyber-zone .corner-bl', 'backgroundColor')).toBe('rgb(0, 95, 140)');
  expect(await style(page, '.cyber-zone .home-accent', 'color')).toBe('rgb(255, 0, 234)');
  expect(await style(page, '.home-release-flag', 'backgroundColor')).toBe('rgb(252, 238, 10)');
});

test('HOME-34: the zone spans the viewport and is not a scroll container', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'load' });
  const zone = await page.locator('.home-shell').boundingBox();
  expect(Math.round(zone.width)).toBe(1440);
  const inner = await page.locator('.home-shell .cyber-zone-inner').boundingBox();
  expect(inner.width).toBeGreaterThan(1200);
  expect(['clip', 'visible']).toContain(await style(page, '.home-shell', 'overflowY'));
});

for (const width of [375, 768, 1440]) {
  test(`HOME-39: no horizontal scroll at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/', { waitUntil: 'load' });
    const [scrollW, clientW] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    expect(scrollW).toBeLessThanOrEqual(clientW);
  });
}

test('HOME-33: panel animations use home- keyframes', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' });
  for (const [sel, pseudo] of PANEL_ANIMATED) {
    const names = (await style(page, sel, 'animationName', pseudo)).split(',').map(s => s.trim());
    for (const name of names) expect(name).toMatch(/^home-/);
  }
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('HOME-35: panel animations are switched off', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' });
    for (const [sel, pseudo] of PANEL_ANIMATED) {
      expect(await style(page, sel, 'animationName', pseudo)).toBe('none');
    }
  });
});

test('HOME-11/32: home platform buttons come from the shared cyber-link system', async ({ page }) => {
  const read = async sel => page.locator(sel).first().evaluate(el => {
    const cs = getComputedStyle(el);
    return { clip: cs.clipPath, font: cs.fontFamily, transition: cs.transitionDuration, name: getComputedStyle(el.querySelector('.cyber-link-name')).fontFamily };
  });
  await page.goto('/discography/', { waitUntil: 'load' });
  const disc = await read('[data-disc-link="spotify"].cyber-link-btn--primary');
  await page.goto('/', { waitUntil: 'load' });
  for (const sel of ['[data-home-placement="hero"][data-home-link="spotify"]', '[data-home-placement="streaming"][data-home-link="spotify"]']) {
    const home = await read(sel);
    expect(home.clip).not.toBe('none');
    expect(home).toEqual(disc);
  }
});
