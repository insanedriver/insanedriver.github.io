const { test, expect } = require('../photos/browser.cjs');

test.beforeEach(async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
});

test('BIT-02: the home HTML carries no Mailchimp endpoint or field', async ({ page }) => {
  const html = await page.content();
  expect(html).not.toContain('list-manage.com');
  expect(html).not.toContain('b_31b9d99c4318b90997348c1ed_79f822eba5');
  await expect(page.locator('[name="EMAIL"], [name="COUNTRY"]')).toHaveCount(0);
});
