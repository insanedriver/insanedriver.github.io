const { test, expect } = require('../photos/browser.cjs');

const panel = page => page.locator('.cyber-panel', { has: page.locator('.cyber-panel-tab', { hasText: 'USER::ENROLL' }) });
const body = page => panel(page).locator('.cyber-panel-body');
const frame = page => panel(page).locator('iframe');

for (const width of [320, 768, 1280]) {
  test(`BIT-15: at ${width}px the iframe stays inside its panel body and the page has no horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/newsletter/', { waitUntil: 'load' });
    const f = await frame(page).boundingBox();
    const b = await body(page).boundingBox();
    expect(f.width).toBeGreaterThan(0);
    expect(f.x).toBeGreaterThanOrEqual(b.x);
    expect(f.x + f.width).toBeLessThanOrEqual(b.x + b.width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  });
}

test('BIT-14: the iframe draws no border of its own', async ({ page }) => {
  await page.goto('/newsletter/', { waitUntil: 'load' });
  const widths = await frame(page).evaluate(el => ['Top', 'Right', 'Bottom', 'Left'].map(s => getComputedStyle(el)[`border${s}Width`]));
  expect(widths).toEqual(['0px', '0px', '0px', '0px']);
});

// Captured from /newsletter/ on master before the form was replaced (2026-10-18).
test('BIT-20: the enrol panel body keeps its background and neon border', async ({ page }) => {
  await page.goto('/newsletter/', { waitUntil: 'load' });
  const style = await body(page).evaluate(el => {
    const c = getComputedStyle(el);
    return { background: c.backgroundColor, image: c.backgroundImage, border: c.borderTop, left: c.borderLeft };
  });
  expect(style).toEqual({
    background: 'rgba(10, 10, 10, 0.9)',
    image: 'linear-gradient(rgba(0, 243, 255, 0.05) 1px, rgba(0, 0, 0, 0) 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.05) 1px, rgba(0, 0, 0, 0) 1px)',
    border: '2px solid rgb(0, 243, 255)',
    left: '2px solid rgb(0, 243, 255)'
  });
});

const animated = page => page.locator('.cyber-zone').evaluate(root => {
  const out = [];
  for (const el of [root, ...root.querySelectorAll('*')]) {
    for (const pseudo of [null, '::before', '::after']) {
      const name = getComputedStyle(el, pseudo).animationName;
      if (name && name !== 'none') out.push(`${el.className || el.tagName}${pseudo || ''}:${name}`);
    }
  }
  return out;
});

// browser.newContext skips the shared fixture, so block outside hosts here too.
const localOnly = context => context.route(url => !['127.0.0.1', 'localhost'].includes(url.hostname), route => route.abort());

test('Edge case: reduced motion stops every newsletter animation that runs by default', async ({ browser }) => {
  const normalContext = await browser.newContext();
  await localOnly(normalContext);
  const normal = await normalContext.newPage();
  await normal.goto('/newsletter/');
  expect((await animated(normal)).length).toBeGreaterThan(0);
  await normalContext.close();

  const context = await browser.newContext({ reducedMotion: 'reduce' });
  await localOnly(context);
  const reduced = await context.newPage();
  await reduced.goto('/newsletter/');
  expect(await animated(reduced)).toEqual([]);
  await context.close();
});
