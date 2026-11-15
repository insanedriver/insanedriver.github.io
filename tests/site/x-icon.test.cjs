const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Reads the built site: run `npm run build` first.
const DOCS = path.join(__dirname, '../../docs');
const built = file => fs.readFileSync(path.join(DOCS, file), 'utf8');
// Pages rendered with the base or home layout (all share _includes/header/menu.liquid).
const PAGES = ['index.html', 'band/index.html', 'contact/index.html', 'discography/index.html',
  'discography/silicon-fortress/index.html', 'newsletter/index.html', 'photos/index.html', 'store/index.html', 'videos/index.html'];
const header = html => {
  const m = html.match(/<nav class="navbar[\s\S]*?<\/nav>/);
  assert.ok(m, 'header nav found');
  return m[0];
};
const xLink = html => {
  const m = html.match(/<a [^>]*href="https:\/\/twitter\.com\/insanedriverid"[^>]*>[\s\S]*?<\/a>/);
  assert.ok(m, 'link to https://twitter.com/insanedriverid found');
  return m[0];
};
const visibleText = a => a.replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

for (const page of PAGES) {
  test(`REF-08: the header on ${page} shows no fa-twitter bird`, () => {
    assert.doesNotMatch(header(built(page)), /fa-twitter/);
  });

  test(`REF-08: the header on ${page} links to X with the X logo and the name "Insane Driver on X"`, () => {
    const a = xLink(header(built(page)));
    assert.match(a, /<svg[^>]*class="[^"]*icon-x/, 'inline X logo');
    assert.match(a, /<svg[^>]*aria-hidden="true"/, 'logo is decorative');
    assert.equal(visibleText(a), 'Insane Driver on X');
    assert.match(a, /title="Insane Driver on X"/);
  });
}

test('REF-08 (consistency): the Band "Connect" X button uses the X logo, not the bird', () => {
  const main = built('band/index.html').match(/<main[\s\S]*?<\/main>/)[0];
  assert.doesNotMatch(main, /fa-twitter/);
  assert.match(main, /cyber-link--twitter[^>]*>\s*<svg[^>]*class="[^"]*icon-x/);
});
