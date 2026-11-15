const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Reads the built site: run `npm run build` first.
const DOCS = path.join(__dirname, '../../docs');
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
  const p = path.join(dir, e.name);
  return e.isDirectory() ? walk(p) : e.name.endsWith('.html') ? [p] : [];
});
// Pages with a document head (Google verification files are plain text).
const pages = walk(DOCS).filter(p => /<head[\s>]/i.test(fs.readFileSync(p, 'utf8')));
const CHARSET = /<meta\s+charset=["']?utf-8["']?\s*\/?>/gi;

test('REF-25: the built site has pages to check', () => {
  assert.ok(pages.length > 20, `found ${pages.length} pages`);
});

for (const file of pages) {
  const rel = path.relative(DOCS, file);
  test(`REF-25: ${rel} declares <meta charset="utf-8"> once, within the first 1024 bytes`, () => {
    const buf = fs.readFileSync(file);
    const html = buf.toString('utf8');
    assert.equal((html.match(CHARSET) || []).length, 1, 'exactly one charset meta');
    const head = buf.subarray(0, 1024).toString('latin1');
    assert.match(head, /<meta\s+charset=["']?utf-8["']?\s*\/?>/i, `charset at byte ${buf.indexOf('<meta charset')}`);
  });
}
