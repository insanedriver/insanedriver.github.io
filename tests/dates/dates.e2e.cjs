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
