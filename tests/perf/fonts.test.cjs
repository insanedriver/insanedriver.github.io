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
