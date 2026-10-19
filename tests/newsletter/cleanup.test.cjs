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

// The Less entries: core.less and every page bundle (they replaced style.less).
const ENTRIES = ['less/core.less', ...fs.readdirSync(path.join(ROOT, 'less/pages')).map(f => `less/pages/${f}`)];

test('BIT-18: the Mailchimp-only files are gone and a Less entry imports newsletter.less', () => {
  for (const file of ['_includes/newsletter/countries.liquid', 'less/mailchimp.less']) {
    assert.equal(fs.existsSync(path.join(ROOT, file)), false, file);
  }
  const imports = ENTRIES.flatMap(file => [...read(file).matchAll(/@import\s+(?:\([^)]*\)\s*)?"([^"]+)"/g)].map(m => path.basename(m[1])));
  assert.ok(imports.includes('newsletter.less'));
  assert.ok(!imports.includes('mailchimp.less'));
});

test('BIT-19: no LESS source has a Mailchimp form selector', () => {
  for (const file of fs.readdirSync(path.join(ROOT, 'less')).filter(f => f.endsWith('.less'))) {
    const less = read(path.join('less', file));
    for (const selector of MAILCHIMP_SELECTORS) assert.ok(!less.includes(selector), `${file}: ${selector}`);
  }
});
