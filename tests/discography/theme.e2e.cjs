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

// The home used to be the last page on the legacy player block; the
// home-cyberpunk feature (HOME-05) removed it, and round 7 (HOME-70) deleted
// less/player.less.
test('DISC-13: the home page no longer carries the legacy player block either', async ({ page }) => {
  await page.goto('/');
  for (const selector of ['.player-art', '.iframe-spotify', '#player-sf', '#player_spotify']) {
    await expect(page.locator(selector)).toHaveCount(0);
  }
});

test('DISC-14: the panels escape the site-wide 56rem cap', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/discography/');
  const width = await page.locator('.disc-shell .cyber-zone-inner').evaluate(el => el.getBoundingClientRect().width);
  expect(width).toBeGreaterThan(900);
});

test('DISC-14: each release page stacks the cover above the buttons at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 720 });
  for (const album of catalog.albums) {
    await page.goto(`/discography/${album.slug}/`);
    const art = await page.locator('.disc-release-art').boundingBox();
    const links = await page.locator('.disc-release .disc-links').first().boundingBox();
    expect(art.y + art.height).toBeLessThanOrEqual(links.y + 1);
    expect(Math.abs(art.x - links.x)).toBeLessThan(2);
  }
});

test('HUB-21: the hub has no horizontal scroll at 375, 768, 992 or 1280px', async ({ page }) => {
  for (const width of [375, 768, 992, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/discography/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  }
});

const albumBoxes = page => page.locator('[data-disc-album]').evaluateAll(els => els.map(el => {
  const r = el.getBoundingClientRect();
  return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width) };
}));

test('HUB-05: the three album cards share one row from 992px', async ({ page }) => {
  for (const width of [992, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/discography/');
    const boxes = await albumBoxes(page);
    expect(boxes).toHaveLength(3);
    expect(new Set(boxes.map(b => b.y)).size, `${width}px`).toBe(1);
    expect(boxes[0].x).toBeLessThan(boxes[1].x);
    expect(boxes[1].x).toBeLessThan(boxes[2].x);
  }
});

test('HUB-05: the album cards stack in one column below 992px', async ({ page }) => {
  for (const width of [375, 991]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/discography/');
    const boxes = await albumBoxes(page);
    expect(new Set(boxes.map(b => b.x)).size, `${width}px`).toBe(1);
    expect(boxes[0].y).toBeLessThan(boxes[1].y);
    expect(boxes[1].y).toBeLessThan(boxes[2].y);
  }
});

test('HUB-04: the card description is clamped to three lines', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/discography/');
  const desc = page.locator('[data-disc-album="silicon-fortress"] [data-disc-album-description]');
  await expect(desc).toHaveCSS('-webkit-line-clamp', '3');
  await expect(desc).toHaveCSS('overflow', 'hidden');
  // The Silicon Fortress copy runs past three lines at this width, so the clamp is what keeps it short.
  const { height, scrollHeight, line } = await desc.evaluate(el => ({
    height: el.getBoundingClientRect().height, scrollHeight: el.scrollHeight, line: parseFloat(getComputedStyle(el).lineHeight),
  }));
  expect(scrollHeight).toBeGreaterThan(height + 1);
  expect(Math.round(height / line)).toBe(3);
});

test('HUB-09: at 375px at least two singles share a row', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/discography/');
  const ys = await page.locator('[data-disc-single]').evaluateAll(els => els.slice(0, 2).map(el => Math.round(el.getBoundingClientRect().y)));
  expect(ys[0]).toBe(ys[1]);
});

test('HUB-22: a focused card shows a visible outline', async ({ page }) => {
  await page.goto('/discography/');
  for (const sel of ['[data-disc-album="silicon-fortress"]', '[data-disc-single]']) {
    const card = page.locator(sel).first();
    await card.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(card).toBeFocused();
    const ring = await card.evaluate(el => ({ style: getComputedStyle(el).outlineStyle, offset: parseFloat(getComputedStyle(el).outlineOffset) }));
    expect(ring.style).not.toBe('none');
    // The card is clip-pathed: a ring drawn outside it would be cut away.
    expect(ring.offset).toBeLessThan(0);
  }
});

test('DISC-38: BUY CD reads differently from the streaming buttons on the release page', async ({ page }) => {
  await page.goto('/discography/silicon-fortress/');
  const buy = page.locator('.disc-release [data-disc-buy]');
  const stream = page.locator('.disc-release [data-disc-link="spotify"]');
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

// DISC-10's anchor-jump check retired with the index anchors (discography-hub HUB-11).

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
