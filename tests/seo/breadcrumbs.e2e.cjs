const { test, expect } = require('../photos/browser.cjs');
const catalog = require('../../_data/discography.json');

const ORIGIN = 'https://insanedriver.com.br';
const RELEASES = ['silicon-fortress', 'insane-driver', 'insane-driver-deluxe', 'waiting-for-you',
  'the-sun-will-rise', 'today-is-sunday-eder-franco', 'change-live', 'fallen-dreams-acoustic'];
const all = [...catalog.albums, ...catalog.singles];
const kebab = t => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const SONGS = ['insane-driver', 'silicon-fortress'].flatMap(a => {
  const album = catalog.albums.find(x => x.slug === a);
  return album.tracks.map(t => ({ album, title: t.title, url: `/discography/${a}/${kebab(t.title)}/` }));
});

const crumbs = async page => {
  const lists = await page.locator('script[type="application/ld+json"]')
    .evaluateAll(els => els.map(el => JSON.parse(el.textContent)).filter(d => d['@type'] === 'BreadcrumbList'));
  expect(lists).toHaveLength(1);
  expect(lists[0]['@context']).toBe('https://schema.org');
  return lists[0].itemListElement.map(i => [i['@type'], i.position, i.name, i.item]);
};
const DISCOGRAPHY = ['ListItem', 1, 'Discography', `${ORIGIN}/discography/`];

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  for (const slug of RELEASES) {
    test(`CRUMB-01: /discography/${slug}/ has Discography -> release`, async ({ page }) => {
      const r = all.find(x => x.slug === slug);
      await page.goto(`/discography/${slug}/`);
      expect(await crumbs(page)).toEqual([DISCOGRAPHY, ['ListItem', 2, r.title, `${ORIGIN}/discography/${slug}/`]]);
    });
  }

  for (const s of SONGS) {
    test(`CRUMB-01: ${s.url} has Discography -> album -> song`, async ({ page }) => {
      await page.goto(s.url);
      expect(await crumbs(page)).toEqual([
        DISCOGRAPHY,
        ['ListItem', 2, s.album.title, `${ORIGIN}/discography/${s.album.slug}/`],
        ['ListItem', 3, s.title, ORIGIN + s.url],
      ]);
    });
  }
});
