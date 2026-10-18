const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..');
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const MAILCHIMP_SELECTORS = ['mc_embed', 'mc-field-group', 'mce-', 'mailchimp', 'home-field', 'home-signal-form'];

test('BIT-19: home.less has no Mailchimp form selectors', () => {
  const less = read('less/home.less');
  for (const selector of MAILCHIMP_SELECTORS) assert.ok(!less.includes(selector), selector);
});
