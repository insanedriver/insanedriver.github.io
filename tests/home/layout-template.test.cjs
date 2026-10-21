const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Liquid = require('liquidjs'); // v6, the version Eleventy 0.12 renders with

const ROOT = path.join(__dirname, '..', '..');
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const count = (source, re) => (source.match(re) || []).length;

// HOME-63: the release contract (is-done, aria-hidden, inert off) is written
// once, inside window.IDHomeRelease in the head gate.
test('HOME-63: the layout releases the loader only inside window.IDHomeRelease', () => {
  const layout = read('_layouts/home.html');
  const head = layout.slice(0, layout.indexOf('</head>'));
  const fn = /window\.IDHomeRelease = function \(\) \{([\s\S]*?)\};/.exec(head);
  assert.ok(fn, 'the head gate defines window.IDHomeRelease');
  for (const [name, re] of [['is-done', /classList\.add\('is-done'\)/g], ['aria-hidden', /setAttribute\('aria-hidden', 'true'\)/g], ['inert off', /\.inert = false/g]]) {
    assert.equal(count(fn[1], re), 1, `${name} inside IDHomeRelease`);
    assert.equal(count(layout, re), 1, `${name} nowhere else in the layout`);
  }
});

test('HOME-63: home.js leaves the release contract to window.IDHomeRelease', () => {
  const js = read('assets/js/home.js');
  assert.equal(count(js, /classList\.add\('is-done'\)/g), 0);
  assert.equal(count(js, /setAttribute\('aria-hidden', 'true'\)/g), 0);
  assert.equal(count(js, /\.inert = false/g), 0);
  assert.ok(/window\.IDHomeRelease\(\)/.test(js));
});

// Renders the real layout the way Eleventy does, with the boot key bent.
function renderLayout(key) {
  const source = read('_layouts/home.html');
  const engine = Liquid({ root: [path.join(ROOT, '_includes')], extname: '.liquid', dynamicPartials: true });
  // The inlineCss shortcode .eleventy.js registers (PS2-14).
  const { inlineCss } = require('../../lib/inline-css.js');
  engine.registerTag('inlineCss', {
    parse(token) { this.name = token.args.trim().replace(/^['"]|['"]$/g, ''); },
    render() { return inlineCss(this.name); }
  });
  return engine.parseAndRender(source, { homeBoot: { key: key }, content: '' });
}

test('HOME-68: the head gate reads the session flag under the key from the data', async () => {
  const html = await renderLayout('test-key');
  const head = html.slice(0, html.indexOf('</head>'));
  assert.ok(head.includes("sessionStorage.getItem('test-key') === '1'"));
  assert.ok(!html.includes('id-home-booted'));
});
