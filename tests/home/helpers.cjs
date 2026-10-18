// Shared locators for the home e2e suites. Not a test file itself.
const fs = require('node:fs');
const path = require('node:path');
const panelByTab = (page, tab) => page.locator('.cyber-panel', { has: page.locator('.cyber-panel-tab', { hasText: tab }) });

// Waits for the boot loader to leave on its own, so the page is no longer inert.
const loaderGone = page => page.waitForFunction(() => !document.documentElement.classList.contains('home-loading'));

// The shared fixture blocks every outside host, so Google Fonts never load and
// text would be measured in a fallback face. Serve the latin Rajdhani and
// Share Tech Mono files the site asks for from tests/home/fonts instead.
const FACES = [
  ['Rajdhani', 500, 'rajdhani-500'],
  ['Rajdhani', 600, 'rajdhani-600'],
  ['Rajdhani', 700, 'rajdhani-700'],
  ['Share Tech Mono', 400, 'share-tech-mono-400']
];
const FONT_CSS = FACES.map(([family, weight, file]) =>
  `@font-face { font-family: '${family}'; font-style: normal; font-weight: ${weight}; font-display: swap; src: url(https://fonts.gstatic.com/local/${file}.woff2) format('woff2'); }`).join('\n');

const serveFonts = async page => {
  await page.route(/^https:\/\/fonts\.googleapis\.com\/css2/, route => route.fulfill({ contentType: 'text/css', body: FONT_CSS }));
  await page.route(/^https:\/\/fonts\.gstatic\.com\/local\//, route => route.fulfill({
    contentType: 'font/woff2',
    body: fs.readFileSync(path.join(__dirname, 'fonts', path.basename(new URL(route.request().url()).pathname)))
  }));
};

// How many faces matched for each family ([1, 1] when both really loaded).
const fontsLoaded = page => page.evaluate(async () => [
  (await document.fonts.load("700 15px 'Rajdhani'")).length,
  (await document.fonts.load("10px 'Share Tech Mono'")).length
]);

module.exports = { panelByTab, loaderGone, serveFonts, fontsLoaded };
