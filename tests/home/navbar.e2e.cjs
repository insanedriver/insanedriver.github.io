const { test, expect } = require('../photos/browser.cjs');
const { loaderGone } = require('./helpers.cjs');

const nav = page => page.locator('nav.navbar');
const scrollTo = (page, y) => page.evaluate(y => window.scrollTo(0, y), y);

test('HOME-36/37: the navbar turns solid past 40px of scroll and clears again at the top', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' });
  await loaderGone(page);
  await expect(nav(page)).not.toHaveClass(/\bis-solid\b/);

  await scrollTo(page, 41);
  await expect(nav(page)).toHaveClass(/\bis-solid\b/);

  await scrollTo(page, 40);
  await expect(nav(page)).not.toHaveClass(/\bis-solid\b/);

  await scrollTo(page, 41);
  await expect(nav(page)).toHaveClass(/\bis-solid\b/);

  await scrollTo(page, 0);
  await expect(nav(page)).not.toHaveClass(/\bis-solid\b/);
});

test('HOME-37: landing on / with a hash deep in the page shows the navbar solid without any scroll', async ({ page }) => {
  await page.goto('/#home-signal-title', { waitUntil: 'load' });
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(40);
  await expect(nav(page)).toHaveClass(/\bis-solid\b/);
});

test('HOME-37: a reload that restores the scroll position shows the navbar solid', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' });
  await loaderGone(page);
  await scrollTo(page, 800);
  await page.reload({ waitUntil: 'load' });
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(40);
  await expect(nav(page)).toHaveClass(/\bis-solid\b/);
});

// PS2-21/22: spies on the window scroll-offset getters. Each read is logged with
// whether it ran synchronously inside home.js (document.currentScript is home.js
// only while its init runs) and whether it ran inside an animation frame callback.
// window.__fakeScrollY, when set, is returned instead of the real offset.
const spyScrollReads = page => page.addInitScript(() => {
  window.__scrollReads = [];
  let inFrame = false;
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = cb => raf(t => { inFrame = true; try { cb(t); } finally { inFrame = false; } });
  for (const name of ['pageYOffset', 'scrollY']) {
    const desc = Object.getOwnPropertyDescriptor(window, name);
    Object.defineProperty(window, name, {
      configurable: true,
      get() {
        const script = document.currentScript;
        window.__scrollReads.push({
          name,
          duringHomeInit: !!(script && /\/assets\/js\/home\.js/.test(script.src)),
          fromHome: /\/assets\/js\/home\.js/.test(new Error().stack),
          inFrame
        });
        return typeof window.__fakeScrollY === 'number' ? window.__fakeScrollY : desc.get.call(window);
      }
    });
  }
});

test('PS2-21: home.js reads the scroll offset in an animation frame, never synchronously during init', async ({ page }) => {
  await spyScrollReads(page);
  await page.goto('/', { waitUntil: 'load' });
  await loaderGone(page);
  const reads = await page.evaluate(() => window.__scrollReads);
  expect(reads.filter(r => r.duringHomeInit), 'scroll offset read synchronously during home.js init').toEqual([]);
  expect(reads.some(r => r.fromHome && r.inFrame), 'home.js read the offset inside a frame').toBe(true);
});

test('PS2-22: a page already scrolled past the threshold has is-solid by the first frame after init', async ({ page }) => {
  await spyScrollReads(page);
  // Stands in for a restored scroll of 800px, so the offset is past the
  // threshold before home.js runs; the frame queued after home.js's init
  // (at DOMContentLoaded, which follows deferred scripts) runs right after its.
  await page.addInitScript(() => {
    window.__fakeScrollY = 800;
    document.addEventListener('DOMContentLoaded', () => {
      window.requestAnimationFrame(() => {
        window.__solidAfterFirstFrame = document.querySelector('nav.navbar').classList.contains('is-solid');
      });
    });
  });
  await page.goto('/', { waitUntil: 'load' });
  await expect.poll(() => page.evaluate(() => window.__solidAfterFirstFrame)).toBe(true);
});
