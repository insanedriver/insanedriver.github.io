const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Reads the built site: run `npm run build` first.
const DOCS = path.join(__dirname, '../../docs');
const built = file => fs.readFileSync(path.join(DOCS, file), 'utf8');
const PAGES = { '/': 'index.html', '/band/': 'band/index.html' };
const footerOf = html => {
  const m = html.match(/<footer[\s\S]*<\/footer>/);
  assert.ok(m, 'footer found');
  return m[0];
};
const headerHrefs = html => {
  const menu = html.match(/<div class="container center-block menu-center">[\s\S]*?<\/ul>/)[0];
  return [...menu.matchAll(/<a [^>]*href="([^"]+)"/g)].map(m => m[1]);
};
const text = html => html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

for (const [url, file] of Object.entries(PAGES)) {
  test(`REF-06: the footer on ${url} lists the header destinations plus "Press kit" /press/ as a <ul> of links`, () => {
    const html = built(file);
    const footer = footerOf(html);
    const nav = footer.match(/<nav [^>]*class="[^"]*footer-nav[^"]*"[^>]*>[\s\S]*?<\/nav>/);
    assert.ok(nav, 'footer nav found');
    const list = nav[0].match(/<ul[\s\S]*?<\/ul>/);
    assert.ok(list, 'footer nav is a list');
    const items = [...list[0].matchAll(/<li\b[^>]*>\s*<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>\s*<\/li>/g)];
    const hrefs = items.map(m => m[1]);
    assert.deepEqual(hrefs, [...headerHrefs(html), '/press/']);
    const press = items.find(m => m[1] === '/press/');
    assert.match(text(press[2]), /^(\d+ )?Press kit( \d+)?$/i);
  });

  test(`REF-06: the footer on ${url} contains no "|" separators`, () => {
    assert.doesNotMatch(text(footerOf(built(file))), /\|/);
  });

  test(`REF-08: the footer on ${url} shows the X logo named "Insane Driver on X" and no fa-twitter bird`, () => {
    const footer = footerOf(built(file));
    assert.doesNotMatch(footer, /fa-twitter/);
    const a = footer.match(/<a [^>]*href="https:\/\/twitter\.com\/insanedriverid"[^>]*>[\s\S]*?<\/a>/);
    assert.ok(a, 'footer X link found');
    assert.match(a[0], /title="Insane Driver on X"/);
    assert.match(a[0], /<svg[^>]*class="[^"]*icon-x/);
    assert.equal(text(a[0]), 'Insane Driver on X');
  });

  test(`REF-09: the footer copyright on ${url} reads "© 2013-<build year> Insane Driver"`, () => {
    const footer = footerOf(built(file));
    const m = footer.match(/<[^>]*class="[^"]*footer-copyright[^"]*"[^>]*>([\s\S]*?)<\//);
    assert.ok(m, 'copyright element found');
    assert.equal(text(m[1]).replace('&copy;', '©'), `© 2013-${new Date().getFullYear()} Insane Driver`);
  });

  test(`REF-05: the footer on ${url} has the approved zones: logo, [AUDIO::CHANNELS] icons, [NAV::INDEX] list, bottom bar with back-to-top`, () => {
    const footer = footerOf(built(file));
    assert.match(footer, /class="[^"]*logo-footer/);
    assert.match(text(footer), /\[AUDIO::CHANNELS\]/);
    assert.match(text(footer), /\[NAV::INDEX\]/);
    assert.equal([...footer.matchAll(/<a [^>]*class="[^"]*social-footer/g)].length, 7, 'seven profile icons');
    assert.match(footer, /class="[^"]*footer-bar[\s\S]*class="?top-link/);
  });
}

test('REF-08: no built page that uses the shared footer renders fa-twitter anywhere in its footer', () => {
  const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : e.name === 'index.html' ? [p] : [];
  });
  const offenders = walk(DOCS).filter(p => /footer-bar/.test(fs.readFileSync(p, 'utf8')) && /fa-twitter/.test(footerOf(fs.readFileSync(p, 'utf8'))));
  assert.deepEqual(offenders.map(p => path.relative(DOCS, p)), []);
});
