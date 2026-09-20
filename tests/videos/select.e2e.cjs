const { test, expect } = require('../photos/browser.cjs');
const videos = require('../../_data/videos.json');

const counter = page => page.locator('[data-idtv-counter]');
const cardAt = (page, i) => page.locator('[data-idtv-card]').nth(i);

test('VPLR-06: first paint has no iframe and no request to a YouTube host', async ({ page }) => {
  const hosts = [];
  page.on('request', req => hosts.push(new URL(req.url()).hostname));
  await page.goto('/videos/');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.videos-shell iframe')).toHaveCount(0);
  expect(hosts.filter(h => /(^|\.)youtube(-nocookie)?\.com$/.test(h))).toEqual([]);
  await expect(page.locator('[data-idtv-play]')).toBeVisible();
  await expect(page.locator('[data-idtv-watch]')).toBeHidden();
});

test('VPLR-08/16: clicking a card updates poster, title, counter and aria-current', async ({ page }) => {
  await page.goto('/videos/');
  await cardAt(page, 3).click();
  await expect(counter(page)).toHaveText('04 / 10');
  await expect(page.locator('[data-idtv-now]')).toHaveText('Desperate Prayer [Official Lyric Video]');
  await expect(page.locator('[data-idtv-poster-img]')).toHaveAttribute('src', `https://i.ytimg.com/vi/${videos[3].id}/hqdefault.jpg`);
  await expect(page.locator('[data-idtv-card][aria-current="true"]')).toHaveCount(1);
  await expect(cardAt(page, 3)).toHaveAttribute('aria-current', 'true');
  expect(new URL(page.url()).pathname).toBe('/videos/');
});

test('VPLR-16: the counter reads NN / 10 for the last video', async ({ page }) => {
  await page.goto('/videos/');
  await cardAt(page, 9).click();
  await expect(counter(page)).toHaveText('10 / 10');
});

test('VPLR-17: selecting an off-screen card scrolls the feed until it is fully visible', async ({ page }) => {
  await page.goto('/videos/');
  await cardAt(page, 8).dispatchEvent('click');
  await expect.poll(async () => {
    const card = await cardAt(page, 8).boundingBox();
    const feed = await page.locator('[data-idtv-feed]').boundingBox();
    return card.x >= feed.x - 1 && card.x + card.width <= feed.x + feed.width + 1;
  }).toBe(true);
});

test('VPLR-09: selecting the already-active card leaves the stage state unchanged', async ({ page }) => {
  await page.goto('/videos/');
  await cardAt(page, 3).click();
  await cardAt(page, 3).click();
  await expect(counter(page)).toHaveText('04 / 10');
  await expect(page.locator('[data-idtv-card][aria-current="true"]')).toHaveCount(1);
  expect(new URL(page.url()).pathname).toBe('/videos/');
});

test('VPLR-08: a card also activates from the keyboard', async ({ page }) => {
  await page.goto('/videos/');
  await cardAt(page, 1).focus();
  await page.keyboard.press('Enter');
  await expect(counter(page)).toHaveText('02 / 10');
});
