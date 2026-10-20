const { test, expect } = require('../photos/browser.cjs');
const { loaderGone } = require('../home/helpers.cjs');

const toggle = page => page.locator('.navbar-toggle');
const menu = page => page.locator('#navbar');

// Bootstrap's collapse plugin is kept off the page, so only nav.js can open the menu.
const withoutBootstrap = page => page.route(/\/assets\/js\/bootstrap\.min\.js/, route => route.abort());

async function open(page, path, width, released = loaderGone) {
  await page.setViewportSize({ width, height: 800 });
  await page.goto(path, { waitUntil: 'load' });
  if (path === '/') await released(page);
}

for (const path of ['/band/', '/']) {
  test(`PERF-09/10: at 375px the toggle on ${path} opens #navbar, then closes it`, async ({ page }) => {
    await withoutBootstrap(page);
    await open(page, path, 375);
    await expect(menu(page)).toBeHidden();
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');

    await toggle(page).click();
    await expect(menu(page)).toBeVisible();
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'true');
    await expect(menu(page).locator('a[href="/band/"]')).toBeVisible();

    await toggle(page).click();
    await expect(menu(page)).toBeHidden();
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
  });

  test(`PERF-12: on ${path} the toggle still works after a page script throws`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await withoutBootstrap(page);
    await page.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => { throw new Error('page boom'); });
    });
    // On the home, the page's own script dies too; the loader failsafe releases the page.
    await page.route(/\/assets\/js\/home\.js/, route => route.fulfill({ contentType: 'text/javascript', body: 'throw new Error("home boom");' }));
    await open(page, path, 375, p => p.waitForFunction(() => window.IDHomeReleased === true));
    await expect.poll(() => errors).toContain('page boom');

    await toggle(page).click();
    await expect(menu(page)).toBeVisible();
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'true');
    await toggle(page).click();
    await expect(menu(page)).toBeHidden();
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
  });

  test(`PERF-40: on ${path} #navbar is visible at 1024px, closed or after a mobile open and close`, async ({ page }) => {
    await withoutBootstrap(page);
    await open(page, path, 1024);
    await expect(menu(page)).toBeVisible();

    await page.setViewportSize({ width: 375, height: 800 });
    await toggle(page).click();
    await expect(menu(page)).toBeVisible();
    await page.setViewportSize({ width: 1024, height: 800 });
    await expect(menu(page)).toBeVisible();

    await page.setViewportSize({ width: 375, height: 800 });
    await toggle(page).click();
    await expect(menu(page)).toBeHidden();
    await page.setViewportSize({ width: 1024, height: 800 });
    await expect(menu(page)).toBeVisible();
  });
}
