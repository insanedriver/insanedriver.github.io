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

test('BIT-18: the Mailchimp-only files are gone and style.less imports newsletter.less', () => {
  for (const file of ['_includes/newsletter/countries.liquid', 'less/mailchimp.less']) {
    assert.equal(fs.existsSync(path.join(ROOT, file)), false, file);
  }
  const imports = [...read('less/style.less').matchAll(/@import\s+"([^"]+)"/g)].map(m => m[1]);
  assert.ok(imports.includes('newsletter.less'));
  assert.ok(!imports.includes('mailchimp.less'));
});

test('BIT-19: no LESS source has a Mailchimp form selector', () => {
  for (const file of fs.readdirSync(path.join(ROOT, 'less')).filter(f => f.endsWith('.less'))) {
    const less = read(path.join('less', file));
    for (const selector of MAILCHIMP_SELECTORS) assert.ok(!less.includes(selector), `${file}: ${selector}`);
  }
});
