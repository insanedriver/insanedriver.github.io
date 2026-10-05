const { test, expect } = require('../photos/browser.cjs');
const platforms = require('../../_data/platforms.json');
const { pool } = require('../../_data/homeShuffle.js')();
const { panelByTab, loaderGone } = require('./helpers.cjs');

const panel = page => panelByTab(page, 'NOW::STREAMING');
const pinRandom = (page, value) => page.addInitScript(v => { Math.random = () => v; }, value);
// The random value that draws pool[i].
const drawing = i => (i + 0.5) / pool.length;

// Serves / with the inline shuffle data replaced, to reach pools today's catalog never has.
async function serveShuffle(page, body) {
  await page.route(url => url.pathname === '/', async route => {
    const html = await (await route.fetch()).text();
    const patched = html.replace(/(<script type="?application\/json"? data-home-shuffle>)[\s\S]*?(<\/script>)/, (m, open, close) => open + body + close);
    if (patched === html) throw new Error('shuffle data not found in /');
    await route.fulfill({ contentType: 'text/html', body: patched });
  });
}

async function expectShows(page, single) {
  const p = panel(page);
  await expect(p.locator('[data-home-streaming]')).toHaveAttribute('data-home-streaming', single.slug);
  await expect(p.locator('.cyber-panel-body')).toHaveAttribute('data-hud', `SIGNAL.${single.slug.toUpperCase()} // STREAMING_`);
  await expect(p.locator('h2')).toHaveText(`${single.title}.`);
  await expect(p.locator('.home-eyebrow')).toHaveText(`SHUFFLE // SINGLE // ${single.releaseDate.replace(/-/g, '.')}`);
  const cover = p.locator('img').first();
  await expect(cover).toHaveAttribute('src', `/assets/images/releases/${single.cover}`);
  await expect(cover).toHaveAttribute('alt', `${single.title} cover`);
  await expect(cover).toHaveAttribute('width', String(single.coverWidth));
  await expect(cover).toHaveAttribute('height', String(single.coverHeight));
  const keys = platforms.filter(pl => single.links[pl.key]).map(pl => pl.key);
  const anchors = p.locator('[data-home-link]');
  expect(await anchors.evaluateAll(els => els.map(el => el.getAttribute('data-home-link')))).toEqual(keys);
  for (const key of keys) {
    const a = p.locator(`[data-home-link="${key}"]`);
    await expect(a).toBeVisible();
    await expect(a).toHaveAttribute('href', single.links[key]);
    await expect(a).toHaveAttribute('data-home-placement', 'streaming');
    await expect(a).toHaveAttribute('target', '_blank');
    await expect(a).toHaveAttribute('rel', 'noopener');
  }
  await expect(p.locator('[data-home-preview-btn]')).toHaveAttribute('data-home-preview-btn', single.embedId || '');
}

for (const i of [0, 7, pool.length - 1]) {
  test(`HOME-56: Math.random() = ${drawing(i).toFixed(3)} shows pool[${i}] (${pool[i].slug})`, async ({ page }) => {
    await pinRandom(page, drawing(i));
    await page.goto('/', { waitUntil: 'load' });
    await expectShows(page, pool[i]);
    await expect(panel(page).getByRole('button', { name: 'PREVIEW' })).toBeVisible();
  });
}

test('HOME-56: the pick has no memory - the same draw shows the same single on the next load', async ({ page }) => {
  await pinRandom(page, drawing(3));
  await page.goto('/', { waitUntil: 'load' });
  await expectShows(page, pool[3]);
  await page.reload({ waitUntil: 'load' });
  await expectShows(page, pool[3]);
});

test('HOME-12/56: a shuffled single on other platforms than the default gets exactly its own anchors', async ({ page }) => {
  const odd = Object.assign({}, pool[0], {
    slug: 'odd-one', title: 'Odd One', releaseDate: '2016-06-06', embedId: null,
    links: { bandcamp: 'https://bandcamp.example/odd', deezer: 'https://deezer.example/odd', ytmusic: 'https://yt.example/odd' }
  });
  await serveShuffle(page, JSON.stringify([pool[0], odd]));
  await pinRandom(page, 0.75);
  await page.goto('/', { waitUntil: 'load' });
  await expectShows(page, odd);
  // HOME-18: no Spotify album id, no PREVIEW.
  await expect(panel(page).locator('[data-home-preview-btn]')).toBeHidden();
});

test('HOME-16: PREVIEW opens the Spotify embed of the shuffled single', async ({ page }) => {
  await page.route(/open\.spotify\.com\/embed\//, route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>stub</title>' }));
  await pinRandom(page, drawing(5));
  await page.goto('/', { waitUntil: 'load' });
  await loaderGone(page);
  await panel(page).getByRole('button', { name: 'PREVIEW' }).click();
  await expect(page.locator('[data-home-preview] iframe')).toHaveAttribute('src', `https://open.spotify.com/embed/album/${pool[5].embedId}`);
});

test('HOME-56 edge: unparseable shuffle data leaves the server-rendered single in place', async ({ page }) => {
  await serveShuffle(page, '{not json');
  await pinRandom(page, drawing(9));
  await page.goto('/', { waitUntil: 'load' });
  await expectShows(page, pool[0]);
});
