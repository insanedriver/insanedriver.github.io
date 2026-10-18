const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('../photos/browser.cjs');

// Every page in the built sitemap (run `npm run build` first).
const ORIGIN = 'https://insanedriver.com.br';
const sitemap = fs.readFileSync(path.join(__dirname, '../../docs/sitemap.xml'), 'utf8');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);

const head = page => page.evaluate(() => {
  const all = sel => [...document.querySelectorAll(sel)];
  const content = sel => all(sel).map(el => el.getAttribute('content'));
  return {
    canonical: all('link[rel="canonical"]').map(el => el.getAttribute('href')),
    description: content('meta[name="description"]'),
    ogType: content('meta[property="og:type"]'),
    ogTitle: content('meta[property="og:title"]'),
    ogDescription: content('meta[property="og:description"]'),
    ogUrl: content('meta[property="og:url"]'),
    ogImage: content('meta[property="og:image"]'),
    twitterCard: content('meta[name="twitter:card"]'),
    twitterSite: content('meta[name="twitter:site"]'),
  };
});

test('the sitemap lists pages to check', () => {
  expect(locs.length).toBeGreaterThan(0);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  for (const loc of locs) {
    const url = loc.slice(ORIGIN.length);

    test(`SEO-04/05/06: ${url} carries one canonical, Open Graph, Twitter and one description`, async ({ page }) => {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      const h = await head(page);

      // SEO-04: exactly one canonical, equal to the sitemap <loc>.
      expect(h.canonical).toEqual([loc]);

      // SEO-05: Open Graph and Twitter Card, og:url equal to the canonical, absolute og:image.
      for (const key of ['ogType', 'ogTitle', 'ogDescription']) {
        expect(h[key], key).toHaveLength(1);
        expect(h[key][0].trim(), key).not.toBe('');
      }
      expect(h.ogUrl).toEqual([loc]);
      expect(h.ogImage).toHaveLength(1);
      expect(h.ogImage[0]).toMatch(/^https:\/\/[^/\s]+\/\S+$/);
      expect(h.twitterCard).toEqual(['summary_large_image']);
      expect(h.twitterSite).toEqual(['@insanedriverid']);

      // SEO-06: exactly one description.
      expect(h.description).toHaveLength(1);
      expect(h.description[0].trim()).not.toBe('');
    });
  }
});

test.describe('titles and descriptions across the sitemap', () => {
  test.use({ javaScriptEnabled: false });

  const readAll = async page => {
    const pages = [];
    for (const loc of locs) {
      await page.goto(loc.slice(ORIGIN.length), { waitUntil: 'domcontentloaded' });
      pages.push(await page.evaluate(() => ({
        url: location.pathname,
        title: document.title,
        description: document.querySelector('meta[name="description"]').getAttribute('content'),
      })));
    }
    return pages;
  };

  test('SEO-07/08/09: every description is 50-160 characters and unique, every title unique', async ({ page }) => {
    const pages = await readAll(page);
    for (const p of pages) {
      expect(p.description.length, `${p.url} description length`).toBeGreaterThanOrEqual(50);
      expect(p.description.length, `${p.url} description length`).toBeLessThanOrEqual(160);
    }
    const dupes = values => values.filter((v, i) => values.indexOf(v) !== i);
    expect(dupes(pages.map(p => p.description)), 'shared descriptions').toEqual([]);
    expect(dupes(pages.map(p => p.title)), 'shared titles').toEqual([]);
  });

  test('SEO-11: the home title names the genres and the country', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle('Insane Driver – Hard Rock & Heavy Metal Band from Brazil');
  });

  for (const url of ['/', '/band/']) {
    test(`GEN-06: the ${url} description says hard rock and Brazil`, async ({ page }) => {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      const description = (await page.locator('meta[name="description"]').getAttribute('content')).toLowerCase();
      expect(description).toContain('hard rock');
      expect(description).toContain('brazil');
    });
  }
});
