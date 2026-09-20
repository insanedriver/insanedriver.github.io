const { test: base, expect } = require('@playwright/test');
const test = base.extend({ page: async ({ page }, use) => {
  await page.route('**/*', route => {
    const host = new URL(route.request().url()).hostname;
    return ['127.0.0.1', 'localhost'].includes(host) ? route.continue() : route.abort();
  });
  await use(page);
} });
module.exports = { test, expect };
