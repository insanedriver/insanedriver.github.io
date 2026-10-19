// Reads the compiled CSS under assets/css and the built site: run `npm run build` first.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { builtPages, layoutPages } = require('./built.cjs');

const CSS_DIR = path.join(__dirname, '../../assets/css');
// Every stylesheet the build emits (core + page bundles).
const emittedCss = () => fs.readdirSync(CSS_DIR).filter(f => f.endsWith('.min.css'))
  .map(f => [f, fs.readFileSync(path.join(CSS_DIR, f), 'utf8')]);

test('PERF-23: no emitted CSS or built HTML references Glyphicons', () => {
  const css = emittedCss();
  assert.ok(css.some(([f]) => f === 'core.min.css'), 'core.min.css was read');
  for (const [file, text] of css) assert.ok(!/glyphicon/i.test(text), `${file} references Glyphicons`);
  const pages = builtPages();
  assert.ok(pages.length > 20, `only ${pages.length} built pages found`);
  for (const [url, html] of pages) assert.ok(!/glyphicon/i.test(html), `${url} references Glyphicons`);
});

test('PERF-23: the footer back-to-top link uses fa fa-chevron-up on every layout page', () => {
  for (const [url, html] of layoutPages()) {
    const link = html.match(/<a\b[^>]*class="?top-link"?[^>]*>\s*(<i\b[^>]*>)/);
    assert.ok(link, `${url}: no back-to-top link`);
    assert.match(link[1], /class="fa fa-chevron-up"/, `${url}: ${link[1]}`);
  }
});

test('PERF-20: no built HTML or emitted CSS references Google Fonts', () => {
  for (const [file, text] of emittedCss()) assert.ok(!/fonts\.(googleapis|gstatic)\.com/.test(text), `${file} references Google Fonts`);
  for (const [url, html] of builtPages()) assert.ok(!/fonts\.(googleapis|gstatic)\.com/.test(html), `${url} references Google Fonts`);
});

// The self-hosted faces: [family, weight, file under /assets/fonts/].
const SELF_HOSTED = [['Rajdhani', 500, 'rajdhani-500.woff2'], ['Rajdhani', 600, 'rajdhani-600.woff2'],
  ['Rajdhani', 700, 'rajdhani-700.woff2'], ['Share Tech Mono', 400, 'share-tech-mono-400.woff2']];
// Every @font-face body in a stylesheet.
const fontFaces = css => [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map(m => m[1]);

test('PERF-21: core.min.css serves Rajdhani 500/600/700 and Share Tech Mono 400 as woff2 from /assets/fonts/', () => {
  const faces = fontFaces(fs.readFileSync(path.join(CSS_DIR, 'core.min.css'), 'utf8'));
  for (const [family, weight, file] of SELF_HOSTED) {
    const woff2 = fs.readFileSync(path.join(__dirname, '../../assets/fonts', file));
    assert.equal(woff2.subarray(0, 4).toString('latin1'), 'wOF2', `${file} is woff2`);
    const face = faces.find(f => new RegExp(`font-family:\\s*['"]?${family}['"]?\\s*(;|$)`).test(f) && new RegExp(`font-weight:\\s*${weight}\\b`).test(f));
    assert.ok(face, `no @font-face for ${family} ${weight}`);
    assert.match(face, new RegExp(`src:\\s*url\\(['"]?\\.\\./fonts/${file}['"]?\\)\\s*format\\(['"]?woff2['"]?\\)`), `${family} ${weight} src`);
  }
});
