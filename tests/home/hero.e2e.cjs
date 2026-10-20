const { test, expect } = require('../photos/browser.cjs');
const catalog = require('../../_data/discography.json');

const latest = catalog.singles.find(s => s.slug === 'keep-away-acoustic');
const widths = ['768w', '1280w', '1920w'];

test('HOME-02: exactly one h1, named "Insane Driver" by the logo, inside the hero', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('h1')).toHaveCount(1);
  const h1 = page.locator('[data-home-hero] h1');
  await expect(h1).toHaveAccessibleName('Insane Driver');
  await expect(h1.locator('img')).toHaveAttribute('src', '/assets/images/logo_loading.png');
  await expect(h1.locator('img')).toHaveAttribute('alt', 'Insane Driver');
});

test('HOME-03: the hero carries the tagline', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-home-hero] .home-tagline')).toHaveText('METAL // ROCK // SINCE 2013');
});

test('HOME-04: the hero photo offers 768/1280/1920 in WebP and JPG and is not lazy', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const webp = await page.locator('[data-home-hero] .home-hero-photo source[type="image/webp"]').getAttribute('srcset');
  const img = page.locator('[data-home-hero-img]');
  const jpg = await img.getAttribute('srcset');
  for (const w of widths) {
    expect(webp).toMatch(new RegExp(`/assets/images/home/hero-${w.slice(0, -1)}\\.webp ${w}`));
    expect(jpg).toMatch(new RegExp(`/assets/images/home/hero-${w.slice(0, -1)}\\.jpg ${w}`));
  }
  expect(await img.getAttribute('loading')).toBeNull();
  await expect(img).toHaveAttribute('fetchpriority', 'high');
  for (const w of widths) {
    for (const ext of ['webp', 'jpg']) {
      const res = await page.request.get(`/assets/images/home/hero-${w.slice(0, -1)}.${ext}`);
      expect(res.status()).toBe(200);
    }
  }
});

test('HOME-10: the hero card shows the latest release cover, title, type and year', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const card = page.locator('[data-home-hero] [data-home-release]');
  await expect(card).toHaveAttribute('data-home-release', 'keep-away-acoustic');
  await expect(card.locator('.home-release-title')).toHaveText('Keep Away (Acoustic)');
  await expect(card.locator('.home-release-meta')).toHaveText('SINGLE // 2025');
  await expect(card.locator('img.home-release-cover')).toHaveAttribute('src', '/assets/images/releases/keep-away-acoustic.jpg');
});

test('HOME-11/12: the hero card links to exactly Spotify and Apple Music for that release', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const links = page.locator('[data-home-hero] [data-home-link]');
  expect(await links.evaluateAll(els => els.map(el => el.getAttribute('data-home-link')))).toEqual(['spotify', 'apple']);
  for (const key of ['spotify', 'apple']) {
    const a = page.locator(`[data-home-hero] [data-home-link="${key}"]`);
    await expect(a).toHaveAttribute('href', latest.links[key]);
    await expect(a).toHaveAttribute('target', '_blank');
    await expect(a).toHaveAttribute('rel', 'noopener');
    await expect(a).toHaveClass(/\bcyber-link-btn--primary\b/);
    await expect(a).toHaveAttribute('data-home-placement', 'hero');
  }
});

test('HOME-05/06: no legacy players and no iframe once the page has loaded', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' });
  await expect(page.locator('[id^="player"]')).toHaveCount(0);
  await expect(page.locator('#player-sf, #player_spotify')).toHaveCount(0);
  await expect(page.locator('iframe')).toHaveCount(0);
});
