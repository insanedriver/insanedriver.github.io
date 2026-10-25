const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('../photos/browser.cjs');

// The footer is the source of truth for the band's social profiles.
const social = fs.readFileSync(path.join(__dirname, '../../_includes/footer/social.liquid'), 'utf8');
const footerUrls = [...social.matchAll(/href="(https?:[^"]+)"/g)].map(m => m[1]);

test('HOME-52: one MusicGroup JSON-LD describing the band with the footer profiles as sameAs', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const scripts = page.locator('script[type="application/ld+json"]');
  await expect(scripts).toHaveCount(1);
  const data = JSON.parse(await scripts.textContent());
  expect(data['@context']).toBe('https://schema.org');
  expect(data['@type']).toBe('MusicGroup');
  expect(data.name).toBe('Insane Driver');
  expect(data.url).toBe('https://insanedriver.com.br/');
  expect(data.foundingDate).toBe('2013');
  expect(Array.isArray(data.genre) && data.genre.length > 0).toBe(true);
  expect(data.image).toBe('https://insanedriver.com.br/assets/images/home/hero-1280.jpg');
  expect(footerUrls).toHaveLength(7);
  expect(data.sameAs).toEqual(footerUrls);
});
