const { test, expect } = require('./browser.cjs');
test('PHOTO-01/02: generated page has six highlights and complete archive', async ({page}) => {
  await page.goto('/photos/');
  await expect(page.locator('[data-photo-slide]')).toHaveCount(6);
  await expect(page.locator('.photos-archive figure')).toHaveCount(17);
  await expect(page.locator('.photos-archive img[alt="Image description"]')).toHaveCount(0);
});
test('PHOTO-16: archive links work with JavaScript disabled', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled:false});
  const page = await context.newPage();
  await page.route('**/*', r => new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort());
  await page.goto('http://127.0.0.1:4178/photos/');
  const links = page.locator('.photos-archive a');
  await expect(links).toHaveCount(17);
  for (const href of await links.evaluateAll(nodes => nodes.map(n => n.getAttribute('href')))) {
    const response = await page.request.get(href);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toMatch(/^image\//);
  }
  await context.close();
});
