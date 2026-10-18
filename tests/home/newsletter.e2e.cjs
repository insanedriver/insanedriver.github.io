const { test, expect } = require('../photos/browser.cjs');
const { panelByTab, loaderGone } = require('./helpers.cjs');

// The signup itself lives on /newsletter/; the home panel only points there.
const panel = page => panelByTab(page, 'SIGNAL::NEWSLETTER');
const cta = page => panel(page).getByRole('link', { name: 'Join the network' });

test.beforeEach(async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
});

test('BIT-01: the panel holds one link to /newsletter/ and no form or iframe', async ({ page }) => {
  await expect(cta(page)).toHaveCount(1);
  await expect(cta(page)).toHaveAttribute('href', '/newsletter/');
  await expect(panel(page).locator('form')).toHaveCount(0);
  await expect(panel(page).locator('iframe')).toHaveCount(0);
});

test('BIT-02: the home HTML carries no Mailchimp endpoint or field', async ({ page }) => {
  const html = await page.content();
  expect(html).not.toContain('list-manage.com');
  expect(html).not.toContain('b_31b9d99c4318b90997348c1ed_79f822eba5');
  await expect(page.locator('[name="EMAIL"], [name="COUNTRY"]')).toHaveCount(0);
});

test('BIT-03: the link opens /newsletter/ in the same tab', async ({ page, context }) => {
  await loaderGone(page);
  const popups = [];
  context.on('page', p => popups.push(p));
  await cta(page).click();
  await expect(page).toHaveURL(/\/newsletter\/$/);
  expect(popups).toHaveLength(0);
});

test('BIT-04: the panel keeps its heading and copy', async ({ page }) => {
  await expect(panel(page).locator('h2')).toHaveText('Join the network.');
  await expect(panel(page).locator('.home-signal-copy p'))
    .toHaveText('New music, videos and shows straight to your inbox. No spam, just signal.');
});

test('BIT-06: panels follow the agreed order', async ({ page }) => {
  const tabs = await page.locator('.cyber-zone .cyber-panel-tab').allTextContents();
  expect(tabs.map(t => t.trim())).toEqual(['NOW::STREAMING', 'ID-TV::LATEST', 'DISC::ARCHIVE', 'VISUAL::FEED', 'SIGNAL::NEWSLETTER']);
});
