const { test, expect } = require('../photos/browser.cjs');
const catalog = require('../../_data/discography.json');

test('DISC-08: the backdrop shows through a transparent cyber zone', async ({ page }) => {
  await page.goto('/discography/');
  expect(await page.locator('#content').evaluate(el => getComputedStyle(el).backgroundImage)).toContain('bodybg');
  await expect(page.locator('.disc-shell.cyber-zone')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
});

test('DISC-08: the panel chrome uses the shared palette and fonts', async ({ page }) => {
  await page.goto('/discography/');
  await expect(page.locator('.cyber-panel-tab').first()).toHaveCSS('border-top-color', 'rgb(0, 243, 255)');
  await expect(page.locator('.corner-bl').first()).toHaveCSS('background-color', 'rgb(0, 95, 140)');
  await expect(page.locator('.disc-accent').first()).toHaveCSS('color', 'rgb(255, 0, 234)');
  await expect(page.locator('[data-disc-counter]')).toHaveCSS('color', 'rgb(0, 243, 255)');
  expect(await page.locator('.disc-shell').evaluate(el => getComputedStyle(el).fontFamily)).toContain('Rajdhani');
  expect(await page.locator('[data-disc-counter]').evaluate(el => getComputedStyle(el).fontFamily)).toContain('Share Tech Mono');
});

test('DISC-13: no legacy player markup survives on the page', async ({ page }) => {
  await page.goto('/discography/');
  for (const selector of ['.player', '.iframe-spotify', '.player-art', '#player-sf', '#player-id']) {
    await expect(page.locator(selector)).toHaveCount(0);
  }
});

test('DISC-13: the home page keeps the legacy player styling it still uses', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.player-art')).toHaveCount(1);
  expect(await page.locator('.player-art').evaluate(el => getComputedStyle(el).marginLeft)).not.toBe('0px');
});

test('DISC-14: the panels escape the site-wide 56rem cap', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/discography/');
  const width = await page.locator('.disc-shell .cyber-zone-inner').evaluate(el => el.getBoundingClientRect().width);
  expect(width).toBeGreaterThan(900);
});

test('DISC-14: each release card stacks the cover above the buttons at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 720 });
  await page.goto('/discography/');
  for (const album of catalog.albums) {
    const art = await page.locator(`#${album.slug} .disc-release-art`).boundingBox();
    const links = await page.locator(`#${album.slug} .disc-links`).first().boundingBox();
    expect(art.y + art.height).toBeLessThanOrEqual(links.y + 1);
    expect(Math.abs(art.x - links.x)).toBeLessThan(2);
  }
});

test('DISC-14: the page has no horizontal scroll at 375px or 1280px', async ({ page }) => {
  for (const width of [375, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/discography/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  }
});

test('DISC-38: BUY CD reads differently from the streaming buttons', async ({ page }) => {
  await page.goto('/discography/');
  const buy = page.locator('#silicon-fortress [data-disc-buy]');
  const stream = page.locator('#silicon-fortress [data-disc-link="spotify"]');
  await expect(buy).toHaveCSS('background-color', 'rgb(252, 238, 10)');
  await expect(buy).toHaveCSS('color', 'rgb(5, 5, 5)');
  expect(await buy.evaluate(el => getComputedStyle(el).backgroundColor))
    .not.toBe(await stream.evaluate(el => getComputedStyle(el).backgroundColor));
});

// Regression: `overflow: hidden` turned the shell into a scroll container, so
// clicking a DISC::INDEX anchor scrolled the container instead of the page and
// nothing could scroll it back - the header and the top of the catalog were
// stranded off-screen for the rest of the visit.

test('DISC-10: the shell is clipped, not scrollable', async ({ page }) => {
  await page.goto('/discography/');
  const shell = page.locator('.disc-shell');
  await expect(shell).toHaveCSS('overflow', 'clip');
  const scrollable = await shell.evaluate(el => el.scrollHeight > el.clientHeight + 1);
  const canScroll = await shell.evaluate(el => { el.scrollTop = 500; return el.scrollTop; });
  expect(scrollable && canScroll > 0).toBe(false);
});

test('DISC-10: following an index anchor scrolls the page and leaves the header reachable', async ({ page }) => {
  await page.goto('/discography/');
  await page.locator('[data-disc-index-link="insane-driver"]').click();

  const afterJump = await page.evaluate(() => ({
    pageY: Math.round(window.scrollY),
    shellScrollTop: document.querySelector('.disc-shell').scrollTop,
    cardTop: Math.round(document.querySelector('#insane-driver').getBoundingClientRect().top),
  }));
  expect(afterJump.pageY).toBeGreaterThan(0);
  expect(afterJump.shellScrollTop).toBe(0);
  expect(Math.abs(afterJump.cardTop)).toBeLessThan(80);

  await page.evaluate(() => window.scrollTo(0, 0));
  const backAtTop = await page.evaluate(() => ({
    pageY: Math.round(window.scrollY),
    shellScrollTop: document.querySelector('.disc-shell').scrollTop,
    navVisible: document.querySelector('nav.navbar').getBoundingClientRect().bottom > 0,
    indexTop: Math.round(document.querySelector('.disc-index').getBoundingClientRect().top),
  }));
  expect(backAtTop).toMatchObject({ pageY: 0, shellScrollTop: 0, navVisible: true });
  expect(backAtTop.indexTop).toBeGreaterThan(0);
});

test('DISC-14: the shell fills the viewport on a wide screen, like the band page', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1000 });

  await page.goto('/band/');
  const bandRatio = await page.locator('.band-shell, .cyber-zone').first()
    .evaluate(el => el.getBoundingClientRect().width / window.innerWidth);

  await page.goto('/discography/');
  const discRatio = await page.locator('.disc-shell')
    .evaluate(el => el.getBoundingClientRect().width / window.innerWidth);

  expect(discRatio).toBeGreaterThan(0.95);
  expect(Math.abs(discRatio - bandRatio)).toBeLessThan(0.1);
  const panel = await page.locator('.cyber-panel-body').first().evaluate(el => el.getBoundingClientRect().width);
  expect(panel).toBeGreaterThan(1600);
});
