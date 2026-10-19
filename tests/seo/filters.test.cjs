const { test } = require('node:test');
const assert = require('node:assert/strict');
const { jsonify, metaDescription } = require('../../lib/filters.js');

test('jsonify escapes "<" so a value cannot close the JSON-LD script', () => {
  const out = jsonify({ name: '</script><script>alert(1)</script>' });
  assert.ok(!out.includes('<'));
  assert.deepEqual(JSON.parse(out), { name: '</script><script>alert(1)</script>' });
});

test('jsonify keeps quotes and non-ASCII text valid JSON', () => {
  assert.equal(JSON.parse(jsonify('Say "hi" – São Paulo')), 'Say "hi" – São Paulo');
});

test('SEO-07: metaDescription keeps a text of 160 characters or fewer, whitespace collapsed', () => {
  assert.equal(metaDescription('  Hard rock\n from   Brazil.  '), 'Hard rock from Brazil.');
  const exact = 'a'.repeat(159) + '.';
  assert.equal(metaDescription(exact), exact);
});

test('SEO-07: metaDescription cuts a long text after the last sentence that fits', () => {
  const first = 'A'.repeat(80) + '.';
  const second = 'B'.repeat(70) + '!';
  const third = 'C'.repeat(40) + '?';
  assert.equal(metaDescription(`${first} ${second} ${third}`), `${first} ${second}`);
});

test('SEO-07: metaDescription cuts a long first sentence at a word boundary with an ellipsis', () => {
  const out = metaDescription(`${'word '.repeat(40)}end.`);
  assert.ok(out.length <= 160, out.length);
  assert.ok(out.endsWith('word…'), out);
});
