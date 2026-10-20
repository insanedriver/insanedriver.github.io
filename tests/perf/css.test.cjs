// Reads the compiled CSS under assets/css: run `npm run build` first.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const CSS_DIR = path.join(__dirname, '../../assets/css');
const BUNDLES = ['home', 'band', 'discography', 'photos', 'pre-save', 'contact', 'videos', 'store', 'newsletter'];
const read = name => fs.readFileSync(path.join(CSS_DIR, `${name}.min.css`), 'utf8');

// Selectors of every style rule, descending into @media/@supports and skipping
// @keyframes and @font-face bodies.
function ruleSelectors(css) {
  const out = [];
  const stack = []; // per open block: 'group' (holds rules) or 'leaf' (holds declarations/keyframe steps)
  let prelude = '';
  for (const ch of css) {
    if (ch === '{') {
      const p = prelude.trim();
      prelude = '';
      const inLeaf = stack.includes('leaf');
      if (/^@(media|supports|document)\b/.test(p) && !inLeaf) stack.push('group');
      else {
        if (!inLeaf && !p.startsWith('@')) out.push(...p.split(',').map(s => s.trim()));
        stack.push('leaf');
      }
    } else if (ch === '}') {
      stack.pop();
      prelude = '';
    } else if (ch === ';' && !stack.includes('leaf')) {
      prelude = ''; // top-level @import/@charset
    } else {
      prelude += ch;
    }
  }
  return out;
}

test('PERF-13/14: the build emits core.min.css and the nine page bundles', () => {
  for (const name of ['core', ...BUNDLES]) {
    assert.ok(fs.existsSync(path.join(CSS_DIR, `${name}.min.css`)), `${name}.min.css`);
  }
});

test('PERF-13: core holds the shared styles and no owl, blog or #page_ rules', () => {
  const css = read('core');
  for (const shared of ['.navbar', '.fa-chevron-up', 'FontAwesome', 'insaneFont', 'SiliconFont', '.silicon-font', '.navbar-inverse', 'footer .scroll-top', '.insane-content']) {
    assert.ok(css.includes(shared), `core has ${shared}`);
  }
  for (const banned of ['.owl-', '.blog-', '#page_']) assert.ok(!css.includes(banned), `core has ${banned}`);
});

test('PERF-14: each bundle holds only its own #page_<id> rules (plus PhotoSwipe in photos)', () => {
  for (const name of BUNDLES) {
    const selectors = ruleSelectors(read(name));
    assert.ok(selectors.some(s => s.startsWith(`#page_${name}`)), `${name} has #page_${name} rules`);
    for (const s of selectors) {
      // Scoped to this page: names #page_<name> as a whole id and no other page.
      const ids = [...s.matchAll(/#page_([\w-]+)/g)].map(m => m[1]);
      const own = ids.length > 0 && ids.every(id => id === name);
      const pswp = name === 'photos' && /^\.pswp/.test(s);
      assert.ok(own || pswp, `${name}.min.css: foreign selector "${s}"`);
    }
  }
  assert.ok(ruleSelectors(read('photos')).some(s => s.startsWith('.pswp')), 'photos has PhotoSwipe');
});

test('PERF-17: core.min.css is at most 200 KB', () => {
  const bytes = fs.statSync(path.join(CSS_DIR, 'core.min.css')).size;
  assert.ok(bytes <= 200 * 1000, `core.min.css is ${bytes} bytes`);
});

test('PERF-18: core and every bundle are minified (no comments, no indentation)', () => {
  for (const name of ['core', ...BUNDLES]) {
    const css = read(name);
    assert.ok(!css.includes('/*'), `${name} has a comment`);
    assert.ok(!/\n[ \t]/.test(css), `${name} has indented lines`);
  }
});

// Stylesheet links of a built page, without the ?v= cache-bust suffix.
const { layoutPages, page } = require('./built.cjs');
const stylesheets = html => [...html.matchAll(/<link\b[^>]*rel="?stylesheet"?[^>]*>/g)]
  .map(m => (m[0].match(/href="?([^"\s>]+)/) || [])[1].replace(/\?.*$/, ''));
const BUNDLE_HREFS = BUNDLES.map(name => `/assets/css/${name}.min.css`);

test('PERF-15: every layout page links core.min.css plus at most one page bundle, never style.min.css', () => {
  const pages = layoutPages();
  assert.ok(pages.length > 20, `only ${pages.length} layout pages found`);
  for (const [url, html] of pages) {
    const links = stylesheets(html);
    assert.equal(links.filter(h => h === '/assets/css/core.min.css').length, 1, `${url}: core.min.css`);
    assert.ok(links.filter(h => BUNDLE_HREFS.includes(h)).length <= 1, `${url}: more than one bundle`);
    assert.ok(!html.includes('style.min.css'), `${url}: links style.min.css`);
    // A page whose area has a bundle gets that bundle (release and song pages share discography).
    const id = html.match(/<body id="?page_([\w-]+)/)[1];
    // PS2-14: the home inlines its bundle instead (asserted below).
    if (BUNDLES.includes(id) && id !== 'home') assert.ok(links.includes(`/assets/css/${id}.min.css`), `${url}: ${id} bundle`);
  }
});

test('PERF-16: / links no page bundle (PS2-14 inlines it) and /band/ links the band bundle', () => {
  const home = stylesheets(page('/'));
  assert.deepEqual(home.filter(h => BUNDLE_HREFS.includes(h)), []);
  const band = stylesheets(page('/band/'));
  assert.ok(band.includes('/assets/css/band.min.css'), '/band/ links band.min.css');
  assert.deepEqual(band.filter(h => BUNDLE_HREFS.includes(h)), ['/assets/css/band.min.css']);
});

// Contents of every <style> element inside <head>.
const headStyles = html => [...html.split(/<\/head>/)[0].matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]);

test('PS2-14: / inlines the full emitted home.min.css in a <head> <style> and does not link it', () => {
  const html = page('/');
  assert.ok(!html.includes('/assets/css/home.min.css'), '/ references home.min.css');
  // The emitted bundle, compared with its url(../X) values resolved to /assets/X (PS2-15).
  const expected = read('home').replace(/url\((["']?)\.\.\//g, 'url($1/assets/');
  assert.ok(headStyles(html).some(css => css === expected), 'no <head> <style> holds the full home bundle');
});

test('PS2-15: the inlined home CSS has no url(../ and every rewritten url points at the same /assets/ file', () => {
  const inlined = headStyles(page('/')).find(css => css.includes('#page_home'));
  assert.ok(inlined, 'no inlined home CSS');
  assert.ok(!/url\(\s*["']?\.\.\//.test(inlined), 'inlined CSS has url(../');
  const external = [...read('home').matchAll(/url\(\s*["']?\.\.\/([^"')]+)/g)].map(m => m[1]);
  assert.ok(external.length > 0, 'home.min.css has no relative url()');
  for (const rel of external) {
    assert.ok(inlined.includes(`/assets/${rel}`), `inlined CSS lacks /assets/${rel}`);
    assert.ok(fs.existsSync(path.join(__dirname, '../../assets', rel)), `assets/${rel} exists`);
  }
});

test('PS2-16: every other layout page with a page bundle still links it with <link rel="stylesheet">', () => {
  let checked = 0;
  for (const [url, html] of layoutPages()) {
    const id = html.match(/<body id="?page_([\w-]+)/)[1];
    if (!BUNDLES.includes(id) || id === 'home') continue;
    assert.ok(stylesheets(html).includes(`/assets/css/${id}.min.css`), `${url}: ${id} bundle link`);
    assert.ok(!headStyles(html).some(css => css.includes(`#page_${id}`)), `${url}: ${id} bundle inlined`);
    checked++;
  }
  assert.ok(checked >= BUNDLES.length - 1, `only ${checked} bundle pages checked`);
});
