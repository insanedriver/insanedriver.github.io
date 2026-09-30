const { test, expect } = require('../photos/browser.cjs');

// Milliseconds from the loader gate (IDHomeBootAt) to the moment the loader
// is dismissed, observed from the page.
const dismissedAfter = page => page.waitForFunction(() => {
  const el = document.getElementById('home-loader');
  if (!el || !el.classList.contains('is-done')) return false;
  return performance.now() - window.IDHomeBootAt;
}, null, { polling: 'raf', timeout: 8000 }).then(h => h.jsonValue());

const skipEvents = page => page.evaluate(() => (window.dataLayer || []).filter(e => e && e.event === 'home_loader_skip'));

test('HOME-22: a first view keeps the boot on screen at least 1.2s, then leaves once ready', async ({ page }) => {
  await page.goto('/', { waitUntil: 'commit' });
  const ms = await dismissedAfter(page);
  expect(ms).toBeGreaterThanOrEqual(1200);
  expect(ms).toBeLessThan(3500);
});

test('HOME-22: a hero image that lands after 1.2s holds the boot until it arrives', async ({ page }) => {
  await page.route(/\/assets\/images\/home\/hero-/, async route => {
    await new Promise(r => setTimeout(r, 2000));
    await route.continue();
  });
  await page.goto('/', { waitUntil: 'commit' });
  const ms = await dismissedAfter(page);
  expect(ms).toBeGreaterThanOrEqual(2000);
  expect(ms).toBeLessThan(3000);
});

test('HOME-23: a hero image that never arrives still releases the page at 3.5s', async ({ page }) => {
  await page.route(/\/assets\/images\/home\/hero-/, () => { /* never answer */ });
  await page.goto('/', { waitUntil: 'commit' });
  const ms = await dismissedAfter(page);
  expect(ms).toBeGreaterThanOrEqual(3400);
  expect(ms).toBeLessThanOrEqual(3600);
});

test('HOME-24: a second home view in the same session flashes for at most 0.5s', async ({ page }) => {
  await page.goto('/', { waitUntil: 'commit' });
  await dismissedAfter(page);
  await page.goto('/band/');
  await page.goto('/', { waitUntil: 'commit' });
  const ms = await dismissedAfter(page);
  expect(ms).toBeLessThanOrEqual(500);
});

test('HOME-25: blocked sessionStorage means a full boot and no error', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, 'sessionStorage', { get() { throw new Error('SecurityError'); } });
  });
  await page.goto('/', { waitUntil: 'commit' });
  const ms = await dismissedAfter(page);
  expect(ms).toBeGreaterThanOrEqual(1200);
  expect(errors).toEqual([]);
});

for (const how of ['Escape', 'click']) {
  test(`HOME-26: ${how} skips the loader at once and reports it`, async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.IDHome && document.documentElement.classList.contains('home-loading'));
    if (how === 'Escape') await page.keyboard.press('Escape');
    else await page.mouse.click(300, 300);
    const ms = await dismissedAfter(page);
    expect(ms).toBeLessThan(1200);
    expect(await skipEvents(page)).toEqual([{ event: 'home_loader_skip' }]);
  });
}

test('HOME-26: a loader that leaves on its own reports no skip', async ({ page }) => {
  await page.goto('/', { waitUntil: 'commit' });
  await dismissedAfter(page);
  await page.keyboard.press('Escape');
  expect(await skipEvents(page)).toEqual([]);
});

test('HOME-28: while visible the loader is a labelled status and the page beneath is inert', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.IDHome);
  const loader = page.locator('#home-loader');
  await expect(loader).toBeVisible();
  await expect(loader).toHaveAttribute('role', 'status');
  await expect(loader).toHaveAccessibleName('Loading Insane Driver');
  expect(await page.locator('[data-home-page]').evaluate(el => el.inert)).toBe(true);
});

test('HOME-27: once dismissed the loader is gone for pointer, assistive tech and scroll', async ({ page }) => {
  await page.goto('/', { waitUntil: 'commit' });
  await dismissedAfter(page);
  await expect(page.locator('#home-loader')).toBeHidden();
  expect(await page.locator('html').getAttribute('class')).not.toMatch(/\bhome-loading\b/);
  expect(await page.locator('[data-home-page]').evaluate(el => el.inert)).toBe(false);
  expect(await page.evaluate(() => !!document.elementFromPoint(300, 300).closest('#home-loader'))).toBe(false);
  await expect(page.getByRole('status', { name: 'Loading Insane Driver' })).toHaveCount(0);
  await page.evaluate(() => window.scrollTo(0, 600));
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
});

test('HOME-20: the progress read-out reaches 100% on dismissal', async ({ page }) => {
  await page.goto('/', { waitUntil: 'commit' });
  await dismissedAfter(page);
  await expect(page.locator('[data-home-loader-pct]')).toHaveText('100%');
});
