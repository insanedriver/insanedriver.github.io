const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Reads the built site: run `npm run build` first.
const DOCS = path.join(__dirname, '../../docs');
const built = file => fs.readFileSync(path.join(DOCS, file), 'utf8');

test('SEO-03: robots.txt allows every crawler and points at the sitemap', () => {
  const lines = built('robots.txt').split(/\r?\n/).map(l => l.trim());
  assert.ok(lines.includes('User-agent: *'));
  assert.ok(lines.includes('Allow: /'));
  assert.ok(lines.includes('Sitemap: https://insanedriver.com.br/sitemap.xml'));
  assert.ok(!lines.some(l => /^Disallow:\s*\S/i.test(l)), 'no path is disallowed');
});

const ORIGIN = 'https://insanedriver.com.br';
const INDEXABLE = ['/', '/band/', '/contact/', '/dates/', '/discography/', '/newsletter/', '/photos/', '/store/', '/videos/'];
const sitemapLocs = () => {
  const xml = built('sitemap.xml');
  // Well-formed sitemap: declaration, one urlset in the sitemap namespace, only <url><loc> children, no raw & or < in a loc.
  const shape = /^<\?xml version="1\.0" encoding="UTF-8"\?>\s*<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">(\s*<url>\s*<loc>[^<&]+<\/loc>\s*<\/url>)*\s*<\/urlset>\s*$/;
  assert.match(xml, shape, 'sitemap.xml is a well-formed urlset');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
};

test('SEO-01: every <loc> is an absolute insanedriver.com.br URL ending in /', () => {
  const locs = sitemapLocs();
  assert.ok(locs.length > 0);
  for (const loc of locs) {
    assert.ok(loc.startsWith(`${ORIGIN}/`), loc);
    assert.ok(loc.endsWith('/'), loc);
  }
  assert.equal(new Set(locs).size, locs.length, 'no URL is listed twice');
});

test('SEO-02: the sitemap lists exactly the indexable pages', () => {
  assert.deepEqual([...sitemapLocs()].sort(), INDEXABLE.map(u => ORIGIN + u).sort());
});

test('SEO-02: redirects, campaign pages and verification files stay out of the sitemap', () => {
  const paths = sitemapLocs().map(loc => loc.slice(ORIGIN.length));
  for (const p of paths) {
    assert.ok(!p.startsWith('/preorder/'), p);
    assert.ok(!p.startsWith('/pre-save/'), p);
    assert.ok(!p.startsWith('/reward/'), p);
    assert.ok(!/google[^/]*\.html/.test(p), p);
  }
});
