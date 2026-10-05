const { test, expect } = require('../photos/browser.cjs');
const { panelByTab, loaderGone } = require('./helpers.cjs');

const SLUG = 'keep-away-acoustic';
const { pool } = require('../../_data/homeShuffle.js')();
// NOW::STREAMING is pinned to pool[4] so its click reports a known single.
const SHUFFLED = pool[4].slug;

const pushed = (page, name) => page.evaluate(n => (window.dataLayer || []).filter(e => e && e.event === n), name);

// Popups (target=_blank links and the Mailchimp form) get a stub page, never the network.
async function stubExternal(context) {
  await context.route(url => !['127.0.0.1', 'localhost'].includes(url.hostname),
    route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>stub</title>' }));
}

// Same-tab teasers would unload the page and its dataLayer. Record whether the
// page script blocked the click, then stop the navigation ourselves.
const holdNavigation = page => page.evaluate(() => {
  window.__prevented = [];
  window.addEventListener('click', e => { window.__prevented.push(e.defaultPrevented); e.preventDefault(); });
});

test.beforeEach(async ({ page, context }) => {
  await stubExternal(context);
  await page.addInitScript(v => { Math.random = () => v; }, 4.5 / pool.length);
  await page.goto('/', { waitUntil: 'load' });
  await loaderGone(page);
});

test('HOME-49: the hero Spotify button reports a hero release click and still opens Spotify', async ({ page, context }) => {
  const popup = context.waitForEvent('page');
  await page.locator('[data-home-hero] [data-home-link="spotify"]').click();
  expect(new URL((await popup).url()).hostname).toBe('open.spotify.com');
  expect(await pushed(page, 'home_release_click')).toEqual([
    { event: 'home_release_click', platform: 'spotify', release: SLUG, placement: 'hero' }
  ]);
});

test('HOME-49: a NOW::STREAMING platform click reports the shuffled single with placement streaming', async ({ page, context }) => {
  const anchor = panelByTab(page, 'NOW::STREAMING').locator('[data-home-link="apple"]');
  const popup = context.waitForEvent('page');
  await anchor.click();
  await popup;
  expect(await pushed(page, 'home_release_click')).toEqual([
    { event: 'home_release_click', platform: 'apple', release: SHUFFLED, placement: 'streaming' }
  ]);
});

for (const [name, selector, expected] of [
  ['video', '[data-home-teaser="video"]', { event: 'home_teaser_click', target: 'video', slug: 'keep-away' }],
  ['album', '[data-home-teaser="album"][data-home-slug="silicon-fortress"]', { event: 'home_teaser_click', target: 'album', slug: 'silicon-fortress' }],
  ['photos', '[data-home-teaser="photos"]', { event: 'home_teaser_click', target: 'photos' }]
]) {
  test(`HOME-50: the ${name} teaser reports its click without blocking the navigation`, async ({ page }) => {
    await holdNavigation(page);
    await page.locator(selector).click();
    expect(await pushed(page, 'home_teaser_click')).toEqual([expected]);
    expect(await page.evaluate(() => window.__prevented)).toEqual([false]);
  });
}

test('HOME-47: a valid newsletter submit reports home_newsletter_submit', async ({ page, context }) => {
  const form = panelByTab(page, 'SIGNAL::NEWSLETTER').locator('form');
  await form.locator('[name="EMAIL"]').fill('fan@example.com');
  await form.locator('[name="COUNTRY"]').selectOption({ index: 1 });
  const popup = context.waitForEvent('page');
  await form.getByRole('button', { name: /connect/i }).click();
  await popup;
  expect(await pushed(page, 'home_newsletter_submit')).toEqual([{ event: 'home_newsletter_submit' }]);
});

test('HOME-47: an invalid newsletter submit reports nothing', async ({ page }) => {
  const form = panelByTab(page, 'SIGNAL::NEWSLETTER').locator('form');
  await form.locator('[name="EMAIL"]').fill('not-an-email');
  await form.getByRole('button', { name: /connect/i }).click();
  expect(await pushed(page, 'home_newsletter_submit')).toEqual([]);
});

test('HOME-51: with no dataLayer the click creates it and Spotify still opens', async ({ page, context }) => {
  await page.evaluate(() => { delete window.dataLayer; });
  const popup = context.waitForEvent('page');
  await page.locator('[data-home-hero] [data-home-link="spotify"]').click();
  await popup;
  expect(await page.evaluate(() => Array.isArray(window.dataLayer))).toBe(true);
  expect(await pushed(page, 'home_release_click')).toHaveLength(1);
});

test('HOME-51: with no dataLayer a same-tab teaser still navigates', async ({ page }) => {
  await page.evaluate(() => { delete window.dataLayer; });
  await page.locator('[data-home-teaser="video"]').click();
  await expect(page).toHaveURL(/\/videos\/#keep-away$/);
});
