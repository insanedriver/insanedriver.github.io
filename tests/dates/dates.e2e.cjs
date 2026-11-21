// External hosts (Bandsintown included) are blocked by browser.cjs, so these run with the widget failing to load.
const { test, expect } = require('../photos/browser.cjs');

test('REF-12/edge: with the Bandsintown script blocked, /dates/ still shows its panels and the Follow on Bandsintown link', async ({ page }) => {
  const blocked = [];
  page.on('requestfailed', r => { if (/bandsintown/.test(r.url())) blocked.push(r.url()); });
  await page.goto('/dates/', { waitUntil: 'load' });
  expect(blocked.some(u => u.startsWith('https://widgetv3.bandsintown.com/'))).toBe(true);
  for (const tab of ['TOUR::DATES', 'FEED::BANDSINTOWN']) await expect(page.locator('.cyber-panel-tab', { hasText: tab })).toBeVisible();
  const follow = page.getByRole('link', { name: 'Follow on Bandsintown' });
  await expect(follow).toBeVisible();
  await expect(follow).toHaveAttribute('href', 'https://www.bandsintown.com/Insane%20Driver');
  await expect(page.locator('.cyber-panel', { hasText: 'FEED::BANDSINTOWN' }).getByRole('heading', { name: 'No shows announced right now.' })).toBeVisible();
});

test('REF-12/edge: the empty state hides once the Bandsintown widget renders', async ({ page }) => {
  await page.goto('/dates/', { waitUntil: 'load' });
  const empty = page.locator('.dates-empty');
  await expect(empty).toBeVisible();
  // Stand in for the third-party widget drawing its list.
  await page.evaluate(() => {
    const w = document.createElement('div');
    w.className = 'bit-widget';
    w.textContent = 'event';
    document.querySelector('.dates-widget').append(w);
  });
  await expect(empty).toBeHidden();
  await expect(page.getByRole('link', { name: 'Follow on Bandsintown' })).toBeVisible();
});

test('layout: at 1440px the Dates panels form a centred column no wider than ~760px', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/dates/', { waitUntil: 'load' });
  const boxes = await page.evaluate(() => [...document.querySelectorAll('#page_dates .cyber-panel')].map(el => {
    const r = el.getBoundingClientRect();
    return { left: r.left, right: document.documentElement.clientWidth - r.right, width: r.width };
  }));
  expect(boxes.length).toBe(2);
  for (const b of boxes) {
    expect(b.width).toBeGreaterThan(600);
    expect(b.width).toBeLessThanOrEqual(800);
    expect(Math.abs(b.left - b.right)).toBeLessThanOrEqual(2);
  }
});

test('style: the Dates panel bodies are near-black, not grey', async ({ page }) => {
  await page.goto('/dates/', { waitUntil: 'load' });
  const bodies = await page.evaluate(() => [...document.querySelectorAll('#page_dates .cyber-panel-body')].map(el => {
    const [r, g, b, a = 1] = getComputedStyle(el).backgroundColor.match(/[\d.]+/g).map(Number);
    const lin = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
    return { a, lum: 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) };
  }));
  expect(bodies.length).toBe(2);
  // Opaque, so the light zone can't wash it grey, and darker than #1a1a1a (~0.010); the mockup's #050d12 is ~0.004.
  for (const { a, lum } of bodies) {
    expect(a).toBe(1);
    expect(lum).toBeLessThan(0.008);
  }
});

test('edge: with reduced motion, /dates/ runs no animation or transition longer than 0.01s', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/dates/', { waitUntil: 'load' });
  const long = await page.evaluate(() => {
    const secs = v => v.split(',').map(s => s.trim().endsWith('ms') ? parseFloat(s) / 1000 : parseFloat(s) || 0);
    const out = [];
    for (const el of document.querySelectorAll('body, body *')) {
      for (const pseudo of [null, '::before', '::after']) {
        const cs = getComputedStyle(el, pseudo);
        const anim = cs.animationName !== 'none' ? Math.max(...secs(cs.animationDuration)) : 0;
        const trans = Math.max(...secs(cs.transitionDuration));
        if (anim > 0.01 || trans > 0.01) out.push(`${el.className || el.tagName}${pseudo || ''} anim=${anim} trans=${trans}`);
      }
    }
    return out;
  });
  expect(long).toEqual([]);
});

for (const width of [320, 390, 768, 1024, 1440, 1920]) {
  test(`edge: at ${width}px /dates/ has no horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/dates/', { waitUntil: 'load' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  });
}
