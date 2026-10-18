const { test, expect } = require('../photos/browser.cjs');

const preorderHead = async page => {
  const html = await (await page.request.get('/preorder/')).text();
  await page.goto('/store/');
  return page.evaluate(src => {
    const doc = new DOMParser().parseFromString(src, 'text/html');
    const attr = (sel, name) => doc.querySelector(sel)?.getAttribute(name) ?? null;
    return {
      refresh: attr('meta[http-equiv="refresh" i]', 'content'),
      canonical: attr('link[rel="canonical"]', 'href'),
      robots: attr('meta[name="robots"]', 'content'),
      links: [...doc.body.querySelectorAll('a')].map(a => a.getAttribute('href')),
    };
  }, html);
};

for (const javaScriptEnabled of [true, false]) {
  test.describe(`JavaScript ${javaScriptEnabled ? 'on' : 'off'}`, () => {
    test.use({ javaScriptEnabled });

    test('STORE-21: loading /preorder/ lands on /store/', async ({ page }) => {
      await page.goto('/preorder/');
      await expect(page).toHaveURL(/\/store\/$/);
      await expect(page.locator('[data-store-product]')).toHaveCount(3);
    });
  });
}

test('STORE-21: the redirect is a 0-second meta refresh to /store/', async ({ page }) => {
  const head = await preorderHead(page);
  expect(head.refresh).toMatch(/^0;\s*url=\/store\/$/i);
});

test('STORE-22: /preorder/ carries the canonical, noindex and a fallback link', async ({ page }) => {
  const head = await preorderHead(page);
  expect(head.canonical).toBe('https://insanedriver.com.br/store/');
  expect(head.robots).toBe('noindex');
  expect(head.links).toContain('/store/');
});
