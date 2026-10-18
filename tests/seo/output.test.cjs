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
