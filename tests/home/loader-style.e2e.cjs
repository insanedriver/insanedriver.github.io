const { test, expect } = require('../photos/browser.cjs');

const LOADER_PARTS = [
  ['.home-loader-logo', '::before'],
  ['.home-loader-logo', '::after'],
  ['.home-loader-scan', null],
  ['.home-loader-bar span', null],
  ['.home-loader-log li', null]
];

const parts = page => page.evaluate(list => list.map(([sel, pseudo]) =>
  getComputedStyle(document.querySelector(sel), pseudo).animationName), LOADER_PARTS);

// Keep home.js from dismissing the loader so its own styling can be observed.
const holdLoader = page => page.route('**/assets/js/home.js*', route => route.fulfill({ contentType: 'text/javascript', body: '' }));

test('HOME-20: while the gate class is set the loader covers the viewport with a Share Tech Mono boot log', async ({ page }) => {
  await holdLoader(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const loader = page.locator('#home-loader');
  await expect(loader).toBeVisible();
  const box = await loader.boundingBox();
  expect(box).toEqual({ x: 0, y: 0, width: 1280, height: 800 });
  expect(await loader.evaluate(el => getComputedStyle(el).position)).toBe('fixed');
  expect(await page.locator('.home-loader-log li').first().evaluate(el => getComputedStyle(el).fontFamily)).toMatch(/Share Tech Mono/);
  // It paints above the page: the viewport centre hits the loader.
  expect(await page.evaluate(() => !!document.elementFromPoint(640, 400).closest('#home-loader'))).toBe(true);
});

test('HOME-23 edge: if home.js never runs, a CSS failsafe hides the loader by 2.5s', async ({ page }) => {
  await page.route('**/assets/js/home.js*', route => route.abort());
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#home-loader')).toBeVisible();
  await page.waitForTimeout(1500);
  await expect(page.locator('#home-loader')).toBeVisible();
  await page.waitForTimeout(1000);
  await expect(page.locator('#home-loader')).toBeHidden();
  expect(await page.evaluate(() => !!document.elementFromPoint(200, 200).closest('#home-loader'))).toBe(false);
  expect(await page.locator('[data-home-page]').evaluate(el => el.inert)).toBe(false);
});

test('HOME-33: loader animations use home- keyframes', async ({ page }) => {
  await holdLoader(page);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  for (const name of await parts(page)) expect(name).toMatch(/^home-/);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('HOME-29: glitch, scanline, boot-log and progress animations are off, and the failsafe survives', async ({ page }) => {
    await holdLoader(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    for (const name of await parts(page)) expect(name).toBe('none');
    expect(await page.locator('#home-loader').evaluate(el => getComputedStyle(el).animationName)).toBe('home-loader-failsafe');
    // Boot lines are simply shown, not revealed.
    expect(await page.locator('.home-loader-log li').last().evaluate(el => getComputedStyle(el).opacity)).toBe('1');
  });

  test('HOME-29: the exit is an opacity fade of at most 200ms', async ({ page }) => {
    await holdLoader(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const exit = await page.locator('#home-loader').evaluate(el => {
      el.classList.add('is-done');
      const cs = getComputedStyle(el);
      return { property: cs.transitionProperty, duration: cs.transitionDuration, animation: cs.animationName, clip: cs.clipPath };
    });
    expect(exit.property).toBe('opacity');
    for (const d of exit.duration.split(',')) expect(parseFloat(d) * (d.trim().endsWith('ms') ? 0.001 : 1)).toBeLessThanOrEqual(0.2);
    expect(exit.animation).not.toMatch(/home-loader-(?!failsafe)/);
    expect(exit.clip).toBe('none');
  });
});
