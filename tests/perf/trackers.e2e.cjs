const { test, expect } = require('../photos/browser.cjs');

const GTM = 'https://www.googletagmanager.com/gtm.js?id=GTM-WW9HZGP';
const FB = 'https://connect.facebook.net/en_US/fbevents.js';

// Serves stand-in tracker scripts that record what was queued when they ran,
// and logs every tracker request with the time it was made.
async function trackers(page) {
  const log = { gtm: [], fb: [], loadAt: null };
  page.on('load', () => { log.loadAt = Date.now(); });
  await page.route('https://www.googletagmanager.com/**', route => {
    log.gtm.push({ url: route.request().url(), at: Date.now() });
    route.fulfill({ contentType: 'text/javascript', body: 'window.__gtmSaw = window.dataLayer.slice();' });
  });
  await page.route('https://connect.facebook.net/**', route => {
    log.fb.push({ url: route.request().url(), at: Date.now() });
    route.fulfill({ contentType: 'text/javascript', body: 'window.__fbSaw = fbq.queue.map(function (a) { return Array.prototype.slice.call(a); });' });
  });
  return log;
}

// Holds the page header image back, so the window load event waits for it.
const holdLoad = (page, ms) => page.route(/\/assets\/images\/header_\d(-\d+)?\.(jpg|webp)/, async route => {
  await new Promise(r => setTimeout(r, ms));
  await route.continue();
});

const counts = log => [log.gtm.length, log.fb.length];

test('PERF-02/03: no tracker is requested before load, then gtm.js and fbevents.js once each after idle', async ({ page }) => {
  const log = await trackers(page);
  await page.goto('/band/', { waitUntil: 'load' });
  await expect.poll(() => counts(log), { timeout: 4000 }).toEqual([1, 1]);
  expect(log.gtm[0].url).toBe(GTM);
  expect(log.fb[0].url).toBe(FB);
  expect(log.gtm[0].at).toBeGreaterThanOrEqual(log.loadAt);
  expect(log.fb[0].at).toBeGreaterThanOrEqual(log.loadAt);
  // Within the 2 s idle timeout of load.
  expect(log.gtm[0].at - log.loadAt).toBeLessThan(2500);
  await page.waitForTimeout(2500);
  expect(counts(log)).toEqual([1, 1]);
});

test('PERF-02: while load is held back, nothing is requested', async ({ page }) => {
  const log = await trackers(page);
  await holdLoad(page, 2000);
  await page.goto('/band/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  expect(await page.evaluate(() => document.readyState)).not.toBe('complete');
  expect(counts(log)).toEqual([0, 0]);
});

test('PERF-05: gtm.start and the Pixel init + PageView are queued at parse time and seen by the scripts', async ({ page }) => {
  const log = await trackers(page);
  await holdLoad(page, 1500);
  await page.goto('/band/', { waitUntil: 'domcontentloaded' });
  const queued = await page.evaluate(() => ({
    state: document.readyState,
    first: window.dataLayer[0],
    fbq: window.fbq.queue.map(a => Array.prototype.slice.call(a))
  }));
  expect(queued.state).not.toBe('complete');
  expect(queued.first.event).toBe('gtm.js');
  expect(typeof queued.first['gtm.start']).toBe('number');
  expect(queued.fbq).toEqual([['init', '379421529852933'], ['track', 'PageView']]);
  await expect.poll(() => counts(log), { timeout: 6000 }).toEqual([1, 1]);
  await expect.poll(() => page.evaluate(() => window.__fbSaw)).toEqual([['init', '379421529852933'], ['track', 'PageView']]);
  const gtmSaw = await page.evaluate(() => window.__gtmSaw);
  expect(gtmSaw[0]).toEqual(queued.first);
});

const interactions = {
  pointerdown: async page => {
    const box = await page.locator('h1.page-header').boundingBox();
    await page.mouse.move(box.x + 5, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.up();
  },
  keydown: page => page.keyboard.press('Shift'),
  scroll: page => page.evaluate(() => window.scrollBy(0, 50)),
  touchstart: async page => {
    const box = await page.locator('h1.page-header').boundingBox();
    await page.touchscreen.tap(box.x + 5, box.y + box.height / 2);
  }
};

test.describe('PERF-04: the first interaction before load', () => {
  test.use({ hasTouch: true });
  for (const [name, interact] of Object.entries(interactions)) {
    test(`a ${name} loads both scripts at once, and load + idle does not load them again`, async ({ page }) => {
      const log = await trackers(page);
      await holdLoad(page, 2000);
      await page.goto('/band/', { waitUntil: 'domcontentloaded' });
      expect(counts(log)).toEqual([0, 0]);
      await interact(page);
      await expect.poll(() => counts(log), { timeout: 1000 }).toEqual([1, 1]);
      expect(log.loadAt).toBeNull();
      expect(log.gtm[0].url).toBe(GTM);
      expect(log.fb[0].url).toBe(FB);
      await page.waitForLoadState('load');
      await page.waitForTimeout(2500);
      expect(counts(log)).toEqual([1, 1]);
    });
  }
});

test('PERF-39: without requestIdleCallback the scripts load 2 s after load', async ({ page }) => {
  const log = await trackers(page);
  await page.addInitScript(() => { delete window.requestIdleCallback; });
  await page.goto('/band/', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  expect(counts(log)).toEqual([0, 0]);
  await expect.poll(() => counts(log), { timeout: 3000 }).toEqual([1, 1]);
  expect(log.gtm[0].at - log.loadAt).toBeGreaterThanOrEqual(1900);
  await page.waitForTimeout(1000);
  expect(counts(log)).toEqual([1, 1]);
});
