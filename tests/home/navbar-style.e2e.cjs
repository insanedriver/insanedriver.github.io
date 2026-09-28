const { test, expect } = require('../photos/browser.cjs');

const navStyle = page => page.locator('nav.navbar').evaluate(el => {
  const cs = getComputedStyle(el);
  return { bg: cs.backgroundColor, position: cs.position, top: cs.top };
});
const alpha = rgba => { const m = rgba.match(/rgba?\(([^)]+)\)/)[1].split(',').map(Number); return m.length === 4 ? m[3] : 1; };

test('HOME-36: at the top of the home the navbar is transparent and floats over the hero', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' });
  await page.evaluate(() => document.querySelector('nav.navbar').classList.remove('is-solid'));
  const s = await navStyle(page);
  expect(alpha(s.bg)).toBe(0);
  expect(s.position).toBe('fixed');
  expect(s.top).toBe('0px');
  const hero = await page.locator('[data-home-hero]').boundingBox();
  expect(hero.y).toBe(0);
});

test('HOME-37: with .is-solid the home navbar gets an opaque background', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' });
  await page.evaluate(() => document.querySelector('nav.navbar').classList.add('is-solid'));
  await page.waitForTimeout(400); // background transition
  const a = alpha((await navStyle(page)).bg);
  expect(a).toBeGreaterThanOrEqual(0.9);
});

test('HOME-38: the navbar on other pages is untouched', async ({ page }) => {
  await page.goto('/band/', { waitUntil: 'load' });
  const s = await navStyle(page);
  expect(s.bg).toBe('rgb(0, 0, 0)');
  expect(['static', 'relative']).toContain(s.position);
});
