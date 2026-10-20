const { test, expect } = require('../photos/browser.cjs');

// Stamps the moment #home-loader first gets is-done, in milliseconds from the
// loader gate (IDHomeBootAt). A mutation record, not a polling frame, so a
// slow frame on a busy machine cannot inflate the reading.
test.beforeEach(({ page }) => page.addInitScript(() => {
  new MutationObserver((records, observer) => {
    for (const r of records) {
      if (r.target.id === 'home-loader' && r.target.classList.contains('is-done')) {
        window.__homeDoneAt = performance.now() - window.IDHomeBootAt;
        observer.disconnect();
        return;
      }
    }
  }).observe(document, { subtree: true, attributes: true, attributeFilter: ['class'] });
}));

// Milliseconds from the loader gate to the moment the loader was dismissed.
const dismissedAfter = page => page.waitForFunction(() => window.__homeDoneAt, null, { timeout: 8000 }).then(h => h.jsonValue());

const skipEvents = page => page.evaluate(() => (window.dataLayer || []).filter(e => e && e.event === 'home_loader_skip'));

test('HOME-22: a first view keeps the boot on screen at least 0.6s, then leaves once ready', async ({ page }) => {
  await page.goto('/', { waitUntil: 'commit' });
  const ms = await dismissedAfter(page);
  expect(ms).toBeGreaterThanOrEqual(600);
  expect(ms).toBeLessThan(1500);
});

test('HOME-22: a hero image that lands after 0.6s holds the boot until it arrives', async ({ page }) => {
  await page.route(/\/assets\/images\/home\/hero-/, async route => {
    await new Promise(r => setTimeout(r, 1000));
    await route.continue();
  });
  await page.goto('/', { waitUntil: 'commit' });
  const ms = await dismissedAfter(page);
  expect(ms).toBeGreaterThanOrEqual(1000);
  expect(ms).toBeLessThan(1500);
});

test('HOME-22: a dismiss timer that fires early still holds the boot until 0.6s', async ({ page }) => {
  // Fake clock, paused, so the page only moves when the test says so.
  await page.clock.install({ time: 0 });
  await page.clock.pauseAt(1000);
  // Browsers may fire a timer before performance.now() reaches its target;
  // make every long timer fire 200ms early.
  await page.addInitScript(() => {
    const set = window.setTimeout;
    window.setTimeout = function (fn, ms, ...args) { return set.call(this, fn, ms >= 500 ? ms - 200 : ms, ...args); };
  });
  await page.goto('/', { waitUntil: 'commit' });
  await page.waitForFunction(() => {
    const img = document.querySelector('[data-home-hero-img]');
    return window.IDHome && img && img.complete && document.fonts.status === 'loaded';
  });
  const elapsed = () => page.evaluate(() => performance.now() - window.IDHomeBootAt);
  const done = () => page.evaluate(() => document.getElementById('home-loader').classList.contains('is-done'));
  await page.clock.runFor(599);
  expect(await elapsed()).toBe(599);
  expect(await done()).toBe(false);
  await page.clock.runFor(1);
  expect(await dismissedAfter(page)).toBe(600);
});

test('HOME-23: a hero image that never arrives still releases the page at 1.5s', async ({ page }) => {
  await page.route(/\/assets\/images\/home\/hero-/, () => { /* never answer */ });
  await page.goto('/', { waitUntil: 'commit' });
  const ms = await dismissedAfter(page);
  expect(ms).toBeGreaterThanOrEqual(1400);
  expect(ms).toBeLessThanOrEqual(1600);
});

// A repeat view under a paused fake clock: real timer lag on a busy machine
// cannot push the release past the bound, so the 0.4s target is exact.
async function repeatViewUnderClock(page, beforeRepeat = async () => {}) {
  await page.goto('/', { waitUntil: 'commit' });
  await dismissedAfter(page);
  await beforeRepeat();
  await page.clock.install({ time: 0 });
  await page.clock.pauseAt(1000);
  await page.goto('/band/');
  await page.goto('/', { waitUntil: 'commit' });
  await page.waitForSelector('footer', { state: 'attached' });
}

const releasedAt400 = async page => {
  await page.clock.runFor(399);
  expect(await page.evaluate(() => document.getElementById('home-loader').classList.contains('is-done'))).toBe(false);
  await page.clock.runFor(1);
  expect(await dismissedAfter(page)).toBe(400);
};

test('HOME-24: a second home view in the same session flashes for 0.4s, within the 0.5s bound', async ({ page }) => {
  await repeatViewUnderClock(page);
  await releasedAt400(page);
});

test('HOME-24: a repeat view leaves at 0.4s even when home.js arrives late', async ({ page }) => {
  let delivered = false;
  await repeatViewUnderClock(page, () => page.route('**/assets/js/home.js*', async route => {
    await new Promise(r => setTimeout(r, 700));
    delivered = true;
    await route.continue();
  }));
  await releasedAt400(page);
  // The script-free fallback released it, so it must release it fully.
  expect(delivered).toBe(false);
  const state = await page.evaluate(() => ({
    aria: document.getElementById('home-loader').getAttribute('aria-hidden'),
    inert: document.querySelector('[data-home-page]').inert,
  }));
  expect(state).toEqual({ aria: 'true', inert: false });
  await expect(page.getByRole('status', { name: 'Loading Insane Driver' })).toHaveCount(0);
});

test('HOME-24: a repeat view stays usable when the page parses after the 0.4s release', async ({ page }) => {
  await page.goto('/', { waitUntil: 'commit' });
  await dismissedAfter(page);
  // A pending stylesheet holds the inline body script past the head timer.
  await page.route('**/*.css*', async route => {
    await new Promise(r => setTimeout(r, 900));
    await route.continue();
  });
  let delivered = false;
  await page.route('**/assets/js/home.js*', async route => {
    await new Promise(r => setTimeout(r, 2500));
    delivered = true;
    await route.continue();
  });
  await page.goto('/', { waitUntil: 'commit' });
  await page.waitForSelector('footer', { state: 'attached' });
  await page.waitForFunction(() => document.getElementById('home-loader').classList.contains('is-done'));
  await page.waitForTimeout(300);
  expect(await page.locator('[data-home-page]').evaluate(el => el.inert)).toBe(false);
  await expect(page.locator('#home-loader')).toHaveAttribute('aria-hidden', 'true');
  expect(delivered).toBe(false);
});

test('HOME-25: blocked sessionStorage means a full boot and no error', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, 'sessionStorage', { get() { throw new Error('SecurityError'); } });
  });
  await page.goto('/', { waitUntil: 'commit' });
  const ms = await dismissedAfter(page);
  expect(ms).toBeGreaterThanOrEqual(600);
  expect(errors).toEqual([]);
});

for (const how of ['Escape', 'click']) {
  test(`HOME-26: ${how} skips the loader at once and reports it`, async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.IDHome && document.documentElement.classList.contains('home-loading'));
    if (how === 'Escape') await page.keyboard.press('Escape');
    else await page.mouse.click(300, 300);
    const ms = await dismissedAfter(page);
    expect(ms).toBeLessThan(600);
    expect(await skipEvents(page)).toEqual([{ event: 'home_loader_skip' }]);
  });
}

test('HOME-26: a loader that leaves on its own reports no skip', async ({ page }) => {
  await page.goto('/', { waitUntil: 'commit' });
  await dismissedAfter(page);
  await page.keyboard.press('Escape');
  expect(await skipEvents(page)).toEqual([]);
});

test('HOME-28: while visible the loader is a labelled status and the page beneath is inert', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.IDHome);
  const loader = page.locator('#home-loader');
  await expect(loader).toBeVisible();
  await expect(loader).toHaveAttribute('role', 'status');
  await expect(loader).toHaveAccessibleName('Loading Insane Driver');
  expect(await page.locator('[data-home-page]').evaluate(el => el.inert)).toBe(true);
});

test('HOME-28: the page beneath is inert even before a late home.js arrives', async ({ page }) => {
  let delivered = false;
  await page.route('**/assets/js/home.js*', async route => {
    await new Promise(r => setTimeout(r, 1500));
    delivered = true;
    await route.continue();
  });
  await page.goto('/', { waitUntil: 'commit' });
  await page.waitForSelector('footer', { state: 'attached' });
  await page.waitForTimeout(300);
  await expect(page.locator('#home-loader')).toBeVisible();
  expect(await page.locator('[data-home-page]').evaluate(el => el.inert)).toBe(true);
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => !!document.activeElement.closest('[data-home-page]'))).toBe(false);
  expect(delivered).toBe(false);
  await dismissedAfter(page);
  expect(await page.locator('[data-home-page]').evaluate(el => el.inert)).toBe(false);
});

test('HOME-27: once dismissed the loader is gone for pointer, assistive tech and scroll', async ({ page }) => {
  await page.goto('/', { waitUntil: 'commit' });
  await dismissedAfter(page);
  await expect(page.locator('#home-loader')).toBeHidden();
  expect(await page.locator('html').getAttribute('class')).not.toMatch(/\bhome-loading\b/);
  expect(await page.locator('[data-home-page]').evaluate(el => el.inert)).toBe(false);
  expect(await page.evaluate(() => !!document.elementFromPoint(300, 300).closest('#home-loader'))).toBe(false);
  await expect(page.getByRole('status', { name: 'Loading Insane Driver' })).toHaveCount(0);
  await page.evaluate(() => window.scrollTo(0, 600));
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
});

test('HOME-20: the progress read-out reaches 100% on dismissal', async ({ page }) => {
  await page.goto('/', { waitUntil: 'commit' });
  await dismissedAfter(page);
  await expect(page.locator('[data-home-loader-pct]')).toHaveText('100%');
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('HOME-29: the progress bar does not move while the loader is up, then fills on dismissal', async ({ page }) => {
    // Hold the hero image so the loader stays up to the 1.5s cap while the bar is sampled.
    await page.route(/\/assets\/images\/home\/hero-/, async route => {
      await new Promise(r => setTimeout(r, 1400));
      await route.continue();
    });
    await page.goto('/', { waitUntil: 'commit' });
    await expect(page.locator('#home-loader')).toBeVisible();
    const bar = page.locator('[data-home-loader-bar]');
    const widths = [];
    for (let i = 0; i < 5; i++) {
      widths.push(await bar.evaluate(el => el.style.width || getComputedStyle(el).width));
      await page.waitForTimeout(150);
    }
    expect(new Set(widths).size).toBe(1);
    await dismissedAfter(page);
    await expect(page.locator('[data-home-loader-pct]')).toHaveText('100%');
  });
});

test('HOME-63: calling IDHomeRelease again after the loader left changes nothing', async ({ page }) => {
  await page.goto('/', { waitUntil: 'commit' });
  await dismissedAfter(page);
  const state = () => page.evaluate(() => {
    const el = document.getElementById('home-loader');
    return { done: el.classList.contains('is-done'), aria: el.getAttribute('aria-hidden'), inert: document.querySelector('[data-home-page]').inert, released: window.IDHomeReleased };
  });
  const expected = { done: true, aria: 'true', inert: false, released: true };
  await page.evaluate(() => window.IDHomeRelease());
  expect(await state()).toEqual(expected);
  await page.evaluate(() => window.IDHomeRelease());
  expect(await state()).toEqual(expected);
});

// Holds home.js for `ms`, stamps the moment it runs, and records every
// change to the inert attribute so a brief re-lock cannot slip between polls.
async function lateHomeJs(page, ms, prefix = '') {
  await page.addInitScript(() => {
    window.__inertLog = [];
    new MutationObserver(records => {
      for (const r of records) window.__inertLog.push({ at: performance.now(), inert: r.target.hasAttribute('inert') });
    }).observe(document, { subtree: true, attributes: true, attributeFilter: ['inert'] });
  });
  await page.route('**/assets/js/home.js*', async route => {
    const body = await (await route.fetch()).text();
    await new Promise(r => setTimeout(r, ms));
    await route.fulfill({ contentType: 'application/javascript', body: prefix + 'window.__homeJsAt = performance.now();\n' + body });
  });
}

// After home.js ran: was the page ever locked again, and is the release
// finished within 1000ms?
async function afterLateHomeJs(page) {
  await page.waitForFunction(() => typeof window.__homeJsAt === 'number', null, { timeout: 10000 });
  await page.waitForFunction(() => performance.now() > window.__homeJsAt + 1000);
  return page.evaluate(() => {
    const el = document.getElementById('home-loader');
    return {
      relocked: window.__inertLog.some(e => e.at >= window.__homeJsAt && e.inert),
      inert: document.querySelector('[data-home-page]').inert,
      loading: document.documentElement.classList.contains('home-loading'),
      done: el.classList.contains('is-done'),
      aria: el.getAttribute('aria-hidden'),
      visited: sessionStorage.getItem('id-home-booted')
    };
  });
}

const settled = { relocked: false, inert: false, loading: false, done: true, aria: 'true', visited: '1' };

test('HOME-64/65/66: a first view whose home.js lands after the 2s failsafe is not locked again', async ({ page }) => {
  await lateHomeJs(page, 2500);
  await page.goto('/', { waitUntil: 'commit' });
  expect(await afterLateHomeJs(page)).toEqual(settled);
});

test('HOME-64/66: a repeat view whose home.js lands after the 0.4s release is not locked again', async ({ page }) => {
  await page.goto('/', { waitUntil: 'commit' });
  await dismissedAfter(page);
  await lateHomeJs(page, 700);
  await page.goto('/', { waitUntil: 'commit' });
  expect(await afterLateHomeJs(page)).toEqual(settled);
});

// Counts the keydown listeners home.js holds on document, by the stack that
// registered them.
const trackKeydown = page => page.addInitScript(() => {
  const live = new Set();
  const add = document.addEventListener, remove = document.removeEventListener;
  document.addEventListener = function (type, fn, opts) {
    if (type === 'keydown' && /\/assets\/js\/home\.js/.test(new Error().stack)) { live.add(fn); window.__homeKeydownEver = true; }
    return add.call(this, type, fn, opts);
  };
  document.removeEventListener = function (type, fn, opts) {
    if (type === 'keydown') live.delete(fn);
    return remove.call(this, type, fn, opts);
  };
  window.__homeKeydown = () => live.size;
});

for (const [how, act] of [
  ['leaving on its own', async () => {}],
  ['a click skip', page => page.locator('#home-loader').click()]
]) {
  test(`HOME-67: after ${how} the loader holds no keydown listener on document`, async ({ page }) => {
    await trackKeydown(page);
    await page.goto('/', { waitUntil: 'commit' });
    await page.waitForFunction(() => window.__homeKeydownEver === true);
    await act(page);
    await dismissedAfter(page);
    expect(await page.evaluate(() => window.__homeKeydown())).toBe(0);
  });
}

test('HOME-64/66: home.js that starts past the 2s failsafe, before anything released the page, is not locked again', async ({ page }) => {
  // Shift the boot clock back 3s as home.js starts: only the 2000ms rule can
  // tell it the page is already out from under the loader.
  await lateHomeJs(page, 0, `window.IDHomeBootAt = performance.now() - 3000;
window.__preState = { released: !!window.IDHomeReleased, done: document.getElementById('home-loader').classList.contains('is-done') };
`);
  await page.goto('/', { waitUntil: 'commit' });
  const state = await afterLateHomeJs(page);
  expect(await page.evaluate(() => window.__preState)).toEqual({ released: false, done: false });
  expect(state).toEqual(settled);
});
