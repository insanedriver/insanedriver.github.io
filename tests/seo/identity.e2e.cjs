const { test, expect } = require('../photos/browser.cjs');

const SAME_AS = [
  'https://open.spotify.com/artist/2ye4AQnKI7zNyOnuLGHaaE',
  'https://www.youtube.com/user/insanedriverofficial',
  'https://www.instagram.com/insanedriverid/',
  'https://facebook.com/insanedriverid',
  'https://twitter.com/insanedriverid',
  'https://insanedriverid.bandcamp.com/',
];

const musicGroups = page => page.locator('script[type="application/ld+json"]')
  .evaluateAll(els => els.map(el => JSON.parse(el.textContent)).filter(d => d['@type'] === 'MusicGroup'));

for (const url of ['/', '/band/']) {
  test.describe(`${url}`, () => {
    test.use({ javaScriptEnabled: false });

    test(`GEN-01/02/03: ${url} has one MusicGroup with the genres, São Paulo and every profile`, async ({ page }) => {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      const groups = await musicGroups(page);
      expect(groups).toHaveLength(1);
      const [group] = groups;
      expect(group.name).toBe('Insane Driver');
      expect(group.genre).toEqual(['Hard Rock', 'Heavy Metal', 'Metalcore']);
      expect(group.foundingLocation).toEqual({ '@type': 'Place', name: 'São Paulo, Brazil' });
      for (const profile of SAME_AS) expect(group.sameAs).toContain(profile);
    });

    test(`footer on ${url}: Bandcamp link last, footer fits 320px`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await page.goto(url, { waitUntil: 'load' });
      const hrefs = await page.locator('.footer-social a').evaluateAll(els => els.map(el => el.getAttribute('href')));
      expect(hrefs).toEqual(SAME_AS);
      const bandcamp = page.locator('.footer-social a[href="https://insanedriverid.bandcamp.com/"]');
      await expect(bandcamp).toBeVisible();
      await expect(bandcamp).toHaveAttribute('title', 'Insane Driver on Bandcamp');
      await expect(bandcamp.locator('svg[aria-hidden="true"]')).toBeVisible();
      // The footer adds no horizontal overflow: it fits the viewport and so does every social link.
      // (/band/ has an older overflow from its .band-container row, outside the footer.)
      const fit = await page.evaluate(() => {
        const W = document.documentElement.clientWidth;
        const footer = document.querySelector('footer');
        return {
          footer: footer.scrollWidth - footer.clientWidth,
          footerRight: footer.getBoundingClientRect().right - W,
          links: [...document.querySelectorAll('.footer-social a')].map(a => a.getBoundingClientRect().right - W).filter(d => d > 0.5),
        };
      });
      expect(fit).toEqual({ footer: 0, footerRight: expect.any(Number), links: [] });
      expect(fit.footerRight).toBeLessThanOrEqual(0.5);
    });
  });
}
