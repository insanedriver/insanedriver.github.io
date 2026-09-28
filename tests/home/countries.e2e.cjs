const crypto = require('node:crypto');
const { test, expect } = require('../photos/browser.cjs');

// Snapshot of /newsletter/ COUNTRY option values (as the DOM decodes them) taken before the list moved into
// _includes/newsletter/countries.liquid.
const BASELINE = { count: 252, first: '', second: 'United States of America', last: 'Zimbabwe', sha1: '4c1357dfa26f029e82efafa8090017f9c2317aab' };

const optionValues = page => page.locator('select[name="COUNTRY"] option').evaluateAll(els => els.map(el => el.value));
const digest = values => crypto.createHash('sha1').update(values.join('|')).digest('hex');

test('HOME-46: /newsletter/ keeps the same country options in the same order', async ({ page }) => {
  await page.goto('/newsletter/');
  const values = await optionValues(page);
  expect(values.length).toBe(BASELINE.count);
  expect(values[0]).toBe(BASELINE.first);
  expect(values[1]).toBe(BASELINE.second);
  expect(values[values.length - 1]).toBe(BASELINE.last);
  expect(digest(values)).toBe(BASELINE.sha1);
});

module.exports = { BASELINE, optionValues, digest };
