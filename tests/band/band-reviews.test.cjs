const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Reads the built site: run `npm run build` first.
const DOCS = path.join(__dirname, '../../docs');
const built = file => fs.readFileSync(path.join(DOCS, file), 'utf8');
const text = html => html.replace(/<[^>]+>/g, ' ').replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const { reviews } = require('../../_data/reviews.json');

const panelTabs = html => [...html.matchAll(/<div class="cyber-panel-tab"><span class="tab-icon"><\/span> ([A-Z:_]+)<\/div>/g)].map(m => m[1]);
const panel = (html, tab) => {
  const m = html.match(new RegExp(`<(div|section) class="cyber-panel[^"]*"[^>]*>\\s*<div class="cyber-panel-tab"><span class="tab-icon"></span> ${tab}</div>[\\s\\S]*?</\\1>\\s*<div class="cyber-separator"`));
  assert.ok(m, `${tab} panel found`);
  return m[0];
};
// The shared featured block: the list plus its "Read all" link.
const featuredBlock = html => {
  const m = html.match(/<ul class="featured-reviews">[\s\S]*?<\/ul>\s*<a class="featured-reviews-all"[^>]*>[\s\S]*?<\/a>/);
  assert.ok(m, 'featured block found');
  return m[0];
};

test('REV-20: /band/ has a PRESS::SIGNAL panel directly after BIO::ORIGIN', () => {
  const tabs = panelTabs(built('band/index.html'));
  assert.equal(tabs[tabs.indexOf('BIO::ORIGIN') + 1], 'PRESS::SIGNAL', tabs.join(' '));
});

test('REV-20: PRESS::SIGNAL shows the three featured quotes and links to every review', () => {
  const block = featuredBlock(panel(built('band/index.html'), 'PRESS::SIGNAL'));
  const quotes = [...block.matchAll(/<blockquote class="featured-review-quote">([\s\S]*?)<\/blockquote>/g)].map(m => text(m[1]));
  assert.deepEqual(quotes, reviews.filter(r => r.featured).map(r => `"${r.quote}"`));
  const link = block.match(/<a class="featured-reviews-all" href="\/press\/reviews\/">([\s\S]*?)<\/a>/);
  assert.ok(link);
  assert.equal(text(link[1]), `Read all ${reviews.length} reviews`);
});

test('REV-21: /press/ and /band/ render the identical featured block from the shared include', () => {
  assert.equal(featuredBlock(built('band/index.html')), featuredBlock(built('press/index.html')));
});
