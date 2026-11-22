const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Reads the built site: run `npm run build` first.
const html = fs.readFileSync(path.join(__dirname, '../../docs/contact/index.html'), 'utf8');

test('REF-24: the Contact page links to /press/ from its content, not only from the footer', () => {
  const main = html.match(/<main[\s\S]*?<\/main>/)[0];
  const link = main.match(/<a\b[^>]*href="\/press\/"[^>]*>([\s\S]*?)<\/a>/);
  assert.ok(link, 'a link to /press/ inside <main>');
  assert.match(link[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(), /press kit/i);
});
