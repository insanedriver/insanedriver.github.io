const { test, expect } = require('../photos/browser.cjs');
const { panelByTab, optionValues } = require('./helpers.cjs');

const form = page => panelByTab(page, 'SIGNAL::NEWSLETTER').locator('form');

async function clearLoader(page) {
  await page.evaluate(() => { const el = document.getElementById('home-loader'); if (el) el.remove(); });
}

test('HOME-44: the home form posts to the same Mailchimp action as /newsletter/, in a new tab', async ({ page }) => {
  await page.goto('/newsletter/', { waitUntil: 'domcontentloaded' });
  const newsletterAction = await page.locator('#mc-embedded-subscribe-form').getAttribute('action');
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const f = form(page);
  await expect(f).toHaveAttribute('action', newsletterAction);
  await expect(f).toHaveAttribute('method', 'post');
  await expect(f).toHaveAttribute('target', '_blank');
});

test('HOME-45: required email and country, a honeypot and a named submit, every control labelled', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const f = form(page);
  const email = f.locator('input[name="EMAIL"]');
  await expect(email).toHaveAttribute('type', 'email');
  await expect(email).toHaveAttribute('required', '');
  await expect(email).toHaveAccessibleName('E-mail');
  const country = f.locator('select[name="COUNTRY"]');
  await expect(country).toHaveAttribute('required', '');
  await expect(country).toHaveAccessibleName('Country');
  await expect(f.locator('input[name="b_31b9d99c4318b90997348c1ed_79f822eba5"]')).toHaveCount(1);
  await expect(f.locator('button[type="submit"]')).toHaveAccessibleName('Connect');
});

test('HOME-46: the home country list matches /newsletter/ value for value', async ({ page }) => {
  await page.goto('/newsletter/', { waitUntil: 'domcontentloaded' });
  const expected = await optionValues(page);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  expect(await optionValues(page)).toEqual(expected);
});

test('HOME-48: an empty or malformed email blocks submission', async ({ page, context }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await clearLoader(page);
  const popups = [];
  context.on('page', p => popups.push(p));
  const f = form(page);
  await f.locator('select[name="COUNTRY"]').selectOption('Brazil');
  for (const value of ['', 'not-an-email']) {
    await f.locator('input[name="EMAIL"]').fill(value);
    await f.locator('button[type="submit"]').click();
    expect(await f.evaluate(el => el.checkValidity())).toBe(false);
  }
  await page.waitForTimeout(300);
  expect(popups).toHaveLength(0);
});

test('HOME-31: panels follow the agreed order', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const tabs = await page.locator('.cyber-zone .cyber-panel-tab').allTextContents();
  expect(tabs.map(t => t.trim())).toEqual(['NOW::STREAMING', 'ID-TV::LATEST', 'DISC::ARCHIVE', 'VISUAL::FEED', 'SIGNAL::NEWSLETTER']);
});
