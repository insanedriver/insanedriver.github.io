const { test, expect } = require('../photos/browser.cjs');
const { loaderGone, panelByTab } = require('./helpers.cjs');

test('HOME-05/06: the home loads its own scripts, not the legacy player bundle, and throws nothing', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/', { waitUntil: 'load' });
  const srcs = await page.locator('script[src]').evaluateAll(els => els.map(el => new URL(el.src).pathname));
  expect(srcs).toContain('/assets/js/home-core.js');
  expect(srcs).toContain('/assets/js/home.js');
  expect(srcs).not.toContain('/assets/js/insane.js');
  expect(srcs).not.toContain('/assets/js/videos.js');
  expect(srcs).not.toContain('/assets/js/please-wait.min.js');
  expect(srcs.indexOf('/assets/js/home-core.js')).toBeLessThan(srcs.indexOf('/assets/js/home.js'));
  await page.waitForTimeout(200);
  expect(errors).toEqual([]);
});

test('HOME-08: the collapsed mobile menu still opens', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/', { waitUntil: 'load' });
  await loaderGone(page);
  await expect(page.locator('#navbar')).toBeHidden();
  await page.locator('.navbar-toggle').click();
  await expect(page.locator('#navbar')).toBeVisible();
  await expect(page.locator('#navbar a[href="/band/"]')).toBeVisible();
});

// home.js runs loader, navbar, shuffle, preview and tracking in that order.
// Each case makes one module's first home-core call throw; every module after
// it must still work, and the error must still be reported. Tracking is last,
// so nothing runs after it.
const modules = ['loader', 'navbar', 'shuffle', 'preview', 'tracking'];
const firstCoreCall = { loader: 'isRepeatVisit', navbar: 'navIsSolid', shuffle: 'pickShuffle', preview: 'spotifyEmbedUrl' };

for (const failing of Object.keys(firstCoreCall)) {
  test(`HOME-62: a throwing ${failing} leaves every later module running and still reports the error`, async ({ page }) => {
    const { pool } = require('../../_data/homeShuffle.js')();
    const after = modules.slice(modules.indexOf(failing) + 1);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(([name, message, draw]) => {
      // Only the first call throws, so the error can only surface through
      // home.js reporting it, not a later scroll.
      let core;
      Object.defineProperty(window, 'IDHome', {
        configurable: true,
        get() { return core; },
        set(value) {
          const real = value[name];
          let thrown = false;
          value[name] = function () {
            if (!thrown) { thrown = true; throw new Error(message); }
            return real.apply(this, arguments);
          };
          core = value;
        }
      });
      Math.random = () => draw;
    }, [firstCoreCall[failing], `${failing} boom`, 5.5 / pool.length]);
    await page.route(/open\.spotify\.com\/embed\//, route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>stub</title>' }));
    await page.goto('/', { waitUntil: 'load' });
    // A dead loader leaves its overlay up; the other cases wait for it to go.
    if (failing !== 'loader') await loaderGone(page);

    if (after.includes('navbar')) {
      await page.evaluate(() => window.scrollTo(0, 200));
      await expect(page.locator('nav.navbar')).toHaveClass(/\bis-solid\b/);
    }
    // Shuffle runs before or after the failing module; only its own failure
    // leaves the server-rendered single, pool[0].
    const shown = failing === 'shuffle' ? pool[0] : pool[5];
    const panel = panelByTab(page, 'NOW::STREAMING');
    await expect(panel.locator('[data-home-streaming]')).toHaveAttribute('data-home-streaming', shown.slug);
    if (after.includes('preview')) {
      await panel.locator('[data-home-preview-btn]').evaluate(button => button.click());
      await expect(page.locator('[data-home-preview] iframe')).toHaveAttribute('src', `https://open.spotify.com/embed/album/${shown.embedId}`);
    }
    // tracking always runs after the failing module. The click is cancelled
    // after it reaches document, so no tab opens.
    await panel.locator('[data-home-link="apple"]').evaluate(anchor => {
      window.addEventListener('click', e => e.preventDefault(), { once: true });
      anchor.click();
    });
    expect(await page.evaluate(() => (window.dataLayer || []).filter(e => e.event === 'home_release_click'))).toEqual([
      { event: 'home_release_click', platform: 'apple', release: shown.slug, placement: 'streaming' }
    ]);
    await expect.poll(() => errors).toContain(`${failing} boom`);
  });
}
