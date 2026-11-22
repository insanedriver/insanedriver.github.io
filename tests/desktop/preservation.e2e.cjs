const fs = require('node:fs');
const path = require('node:path');
const less = require('less');
const { test, expect } = require('../photos/browser.cjs');

const root = path.resolve(__dirname, '../..');
// site-refresh REF-10 moved /dates/ onto the base layout in the Contact pattern, so it is a desktop area now.
const areas = ['home', 'band', 'discography', 'photos', 'videos', 'store', 'contact', 'newsletter', 'dates'];
const pages = [
  ['/', 'home', ['.home-hero-content', '.home-streaming', '.home-archive-list']],
  ['/band/', 'band', ['.cyber-bio-text', '.cyber-band-photo-wrapper', '.cyber-member-grid', '.cyber-links-grid']],
  ['/discography/', 'discography', ['.disc-album-grid', '.disc-single-grid']],
  ['/discography/silicon-fortress/', 'discography', ['.disc-release', '.disc-release-art']],
  ['/discography/silicon-fortress/ghosts/', 'discography', ['.song-bento', '.song-video-frame-box']],
  ['/photos/', 'photos', ['.photos-stage', '.photos-archive', '.photos-thumbnails']],
  ['/videos/', 'videos', ['.videos-stage', '.videos-screen', '.videos-feed']],
  ['/store/', 'store', ['.store-grid']],
  ['/contact/', 'contact', ['.contact-container .cyber-panel']],
  ['/dates/', 'dates', ['.dates-container .cyber-panel']],
  ['/newsletter/', 'newsletter', ['.newsletter-container .cyber-zone-inner', '.newsletter-embed-frame']],
];

// Compile the same source and imports, omitting only the new mixin invocation.
// The approved Contact row repair remains in both versions. This differential
// baseline catches mobile width/composition changes even when neither overflows.
const baselines = new Map();
function baselineCss(area) {
  if (!baselines.has(area)) {
    const filename = path.join(root, 'less/pages', `${area}.less`);
    const source = fs.readFileSync(filename, 'utf8');
    const invocation = `#page_${area} { .desktop-layout(); }`;
    if (!source.includes(invocation)) throw new Error(`Missing desktop mixin invocation: ${area}`);
    baselines.set(area, less.render(source.replace(invocation, ''), { filename }).then(({ css }) =>
      css.replace(/url\((\s*["']?)\.\.\//g, 'url($1/assets/')));
  }
  return baselines.get(area);
}

async function composition(page, selectors) {
  return page.evaluate(selectors => selectors.flatMap(selector => {
    const elements = [...document.querySelectorAll(selector)];
    if (!elements.length) throw new Error(`Missing preservation target: ${selector}`);
    return elements.map((el, index) => {
      const s = getComputedStyle(el);
      return { selector, index, width: s.width, display: s.display,
        columns: s.gridTemplateColumns, columnGap: s.columnGap, rowGap: s.rowGap };
    });
  }), selectors);
}

async function useBaseline(page, area) {
  const css = await baselineCss(area);
  await page.evaluate(({ area, css }) => {
    if (area === 'home') {
      const styles = [...document.head.querySelectorAll('style')].filter(el => el.textContent.includes('#page_home'));
      if (styles.length !== 1) throw new Error(`Expected one inline Home bundle, found ${styles.length}`);
      styles[0].textContent = css;
    } else {
      const link = [...document.head.querySelectorAll('link[rel="stylesheet"]')]
        .find(el => new URL(el.href).pathname === `/assets/css/${area}.min.css`);
      if (!link) throw new Error(`Missing ${area} stylesheet`);
      link.disabled = true;
      const style = document.createElement('style');
      style.textContent = css;
      link.after(style);
    }
  }, { area, css });
  await page.evaluate(() => document.fonts.ready);
}

for (const width of [320, 390, 768, 1024]) {
  test(`DESK-06: desktop mixin preserves component widths and mobile composition at ${width}px`, async ({ page }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const [url, area, targets] of pages) {
      await page.goto(url, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      const selectors = ['.navbar > .container-fluid', 'footer > .container', '.cyber-zone-inner', ...targets];
      const actual = await composition(page, selectors);
      await useBaseline(page, area);
      expect(actual, `${url} at ${width}px versus pre-mixin composition`).toEqual(await composition(page, selectors));
    }
  });
}

// Inspect every selector emitted by the mixin, including nested media rules.
// Excluded documents must match none of them, not merely lack a token on body.
const desktopRules = less.render(`@import "${path.join(root, 'less/desktop-layout.less')}";\n` +
  areas.map(area => `#page_${area} { .desktop-layout(); }`).join('\n')).then(({ css }) => css);

for (const url of ['/pre-save/', '/preorder/']) {
  test(`DESK-07: excluded ${url} receives no desktop overrides`, async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    if (url === '/preorder/') {
      // Inspect the excluded redirect document itself rather than its Store target.
      await page.route('**/preorder/', async route => {
        const response = await route.fetch();
        const html = await response.text();
        expect(html).toMatch(/http-equiv="refresh" content="0; url=\/store\/"/);
        await route.fulfill({ response, body: html.replace(/<meta\s+http-equiv="refresh"[^>]*>/i, '') });
      });
    }
    await page.goto(url, { waitUntil: 'load' });
    await expect(page).toHaveURL(new RegExp(`${url}$`));
    const matches = await page.evaluate(css => {
      const probe = new CSSStyleSheet();
      probe.replaceSync(css);
      const matched = [];
      const walk = rules => {
        for (const rule of rules) {
          if (rule.selectorText && document.querySelector(rule.selectorText)) matched.push(rule.selectorText);
          if (rule.cssRules) walk(rule.cssRules);
        }
      };
      walk(probe.cssRules);
      // Also inspect loaded bundles for any leaked token-dependent overrides.
      const leaked = [];
      const scan = rules => {
        for (const rule of rules) {
          if (rule.selectorText && rule.style.cssText.includes('--site-') && document.querySelector(rule.selectorText)) {
            leaked.push(rule.selectorText);
          }
          if (rule.cssRules) scan(rule.cssRules);
        }
      };
      for (const sheet of document.styleSheets) {
        if (!sheet.href || new URL(sheet.href).origin === location.origin) scan(sheet.cssRules);
      }
      return { matched, leaked, token: getComputedStyle(document.body).getPropertyValue('--site-content-max') };
    }, await desktopRules);
    expect(matches).toEqual({ matched: [], leaked: [], token: '' });
  });
}
