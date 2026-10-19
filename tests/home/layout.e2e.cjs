const { test, expect } = require('../photos/browser.cjs');

test('HOME-05: the legacy home frame is gone', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#owl-demo')).toHaveCount(0);
  await expect(page.locator('.owl-carousel')).toHaveCount(0);
  await expect(page.locator('.header-img')).toHaveCount(0);
  await expect(page.locator('.page-header')).toHaveCount(0);
  await expect(page.locator('script[src*="please-wait"]')).toHaveCount(0);
});

test('HOME-08: the shared menu and footer stay on the home', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('nav.navbar #navbar')).toHaveCount(1);
  await expect(page.locator('nav.navbar a[href="/discography/"]')).toHaveCount(1);
  await expect(page.locator('footer')).toHaveCount(1);
});

test('HOME-53: Open Graph and Twitter card meta describe the home', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const meta = sel => page.locator(sel).getAttribute('content');
  expect(await meta('meta[property="og:type"]')).toBe('website');
  expect(await meta('meta[property="og:title"]')).toBe('Insane Driver – Hard Rock & Heavy Metal Band from Brazil');
  expect(await meta('meta[property="og:description"]')).toContain('Insane Driver');
  expect(await meta('meta[property="og:url"]')).toBe('https://insanedriver.com.br/');
  expect(await meta('meta[property="og:image"]')).toBe('https://insanedriver.com.br/assets/images/home/hero-1280.jpg');
  expect(await meta('meta[name="twitter:card"]')).toBe('summary_large_image');
});

test('HOME-20: with JavaScript the loader gate is set before first paint and the loader carries logo, boot log and progress bar', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  // The gate script sits in <head>, before any stylesheet or body markup.
  const gateBeforeStyles = await page.evaluate(() => {
    const scripts = [...document.head.querySelectorAll('script:not([src])')];
    const gate = scripts.find(s => s.textContent.includes('home-loading'));
    const css = document.head.querySelector('link[rel="stylesheet"][href*="core.min.css"]');
    return !!gate && !!css && !!(gate.compareDocumentPosition(css) & Node.DOCUMENT_POSITION_FOLLOWING);
  });
  expect(gateBeforeStyles).toBe(true);
  await expect(page.locator('html')).toHaveClass(/\bhome-loading\b/);
  const loader = page.locator('#home-loader');
  await expect(loader).toHaveAttribute('role', 'status');
  await expect(loader.locator('img[src="/assets/images/logo_loading.png"]')).toHaveCount(1);
  expect(await loader.locator('.home-loader-log li').count()).toBeGreaterThanOrEqual(3);
  await expect(loader.locator('[data-home-loader-bar]')).toHaveCount(1);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('HOME-21: the loader never shows and the gate class is never set', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#home-loader')).toBeHidden();
    expect(await page.locator('html').getAttribute('class')).toBeNull();
  });
});
