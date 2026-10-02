const { test, expect } = require('../photos/browser.cjs');

const { loaderGone } = require('./helpers.cjs');

// Every animated hero layer, as [selector, pseudo].
const ANIMATED = [
  ['[data-home-hero-img]', null],
  ['.home-hero-grid', null],
  ['.home-hero-scan', '::after'],
  ['.home-title-glitch', '::before'],
  ['.home-title-glitch', '::after']
];

const animationNames = page => page.evaluate(list => list.map(([sel, pseudo]) =>
  getComputedStyle(document.querySelector(sel), pseudo).animationName), ANIMATED);

for (const [width, height] of [[1440, 900], [375, 667]]) {
  test(`HOME-01: the hero fills the ${width}x${height} viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/', { waitUntil: 'load' });
    const box = await page.locator('[data-home-hero]').boundingBox();
    expect(Math.round(box.height)).toBe(height);
    expect(Math.round(box.width)).toBe(width);
  });
}

test('HOME-07: overlays stack photo < vignette < grid < scan < content and are hidden from assistive tech', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' });
  const z = await page.evaluate(() => ['.home-hero-photo', '.home-hero-vignette', '.home-hero-grid', '.home-hero-scan', '.home-hero-content']
    .map(sel => {
      const cs = getComputedStyle(document.querySelector(sel));
      return { position: cs.position, z: Number(cs.zIndex) };
    }));
  for (const layer of z) {
    expect(['absolute', 'relative', 'fixed']).toContain(layer.position);
    expect(Number.isFinite(layer.z)).toBe(true);
  }
  for (let i = 1; i < z.length; i++) expect(z[i].z).toBeGreaterThan(z[i - 1].z);
  for (const sel of ['.home-hero-vignette', '.home-hero-grid', '.home-hero-scan']) {
    await expect(page.locator(sel)).toHaveAttribute('aria-hidden', 'true');
  }
  // The text layer is really on top: the centre of the h1 hits the h1, not an overlay.
  await loaderGone(page);
  const hit = await page.evaluate(() => {
    const r = document.querySelector('.home-title').getBoundingClientRect();
    const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return !!el.closest('.home-hero-content');
  });
  expect(hit).toBe(true);
});

test('HOME-13: on a 375x667 phone the release card sits fully inside the first viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/', { waitUntil: 'load' });
  const card = await page.locator('[data-home-hero] .home-release-card').boundingBox();
  const title = await page.locator('[data-home-hero] h1').boundingBox();
  expect(card.y).toBeGreaterThanOrEqual(0);
  expect(card.x).toBeGreaterThanOrEqual(0);
  expect(card.y + card.height).toBeLessThanOrEqual(667);
  expect(card.x + card.width).toBeLessThanOrEqual(375);
  expect(card.y).toBeGreaterThan(title.y + title.height - 1);
});

for (const [width, height] of [[844, 390], [667, 375]]) {
  test(`HOME-01 edge: on a ${width}x${height} landscape phone the hero grows to fit its content`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/', { waitUntil: 'load' });
    await loaderGone(page);
    const hero = await page.locator('[data-home-hero]').boundingBox();
    const nav = await page.locator('nav.navbar').boundingBox();
    const title = await page.locator('[data-home-hero] h1').boundingBox();
    const card = await page.locator('[data-home-hero] .home-release-card').boundingBox();
    expect(hero.height).toBeGreaterThanOrEqual(height);
    // Nothing is clipped: logo and card both sit inside the hero box...
    for (const box of [title, card]) {
      expect(box.y).toBeGreaterThanOrEqual(hero.y);
      expect(box.y + box.height).toBeLessThanOrEqual(hero.y + hero.height);
    }
    // ...and the fixed navbar covers neither of them at the top of the page.
    const hud = await page.locator('[data-home-hero] .home-hero-hud').boundingBox();
    expect(hud.y).toBeGreaterThanOrEqual(nav.y + nav.height);
    expect(card.y).toBeGreaterThanOrEqual(title.y + title.height - 1);
  });
}

test('HOME-33: every hero animation uses a home- keyframe', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' });
  for (const name of await animationNames(page)) {
    expect(name).toMatch(/^home-/);
  }
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('HOME-35: hero animations are switched off', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' });
    for (const name of await animationNames(page)) {
      expect(name).toBe('none');
    }
  });
});
