const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Reads the built site: run `npm run build` first.
const DOCS = path.join(__dirname, '../../docs');
const built = file => fs.readFileSync(path.join(DOCS, file), 'utf8');
const html = () => built('dates/index.html');

test('REF-10: /dates/ uses the base layout (shared head, header menu, footer) with its widget inside a cyber panel', () => {
  const page = html();
  assert.match(page, /<body id="page_dates">/);
  assert.match(page, /<link rel="stylesheet" href="\/assets\/css\/core\.min\.css[^"]*">/);
  assert.match(page, /<link rel="stylesheet" href="\/assets\/css\/dates\.min\.css[^"]*">/);
  assert.match(page, /<div class="container center-block menu-center">/, 'shared header menu');
  assert.match(page, /<footer class="site-footer">/, 'shared footer');
  assert.match(page, /<h1 class="[^"]*page-header[^"]*">Dates<\/h1>/);
  const panel = page.match(/<div class="cyber-panel-tab">[^<]*<span class="tab-icon"><\/span> FEED::BANDSINTOWN<\/div>[\s\S]*?class="bit-widget-initializer"/);
  assert.ok(panel, 'Bandsintown widget sits in the FEED::BANDSINTOWN panel');
  assert.match(page, /TOUR::DATES/);
  // One GTM/Pixel loader: the old page's own trackers and UA snippet are gone.
  assert.equal((page.match(/googletagmanager\.com\/gtm\.js/g) || []).length, 1);
  assert.doesNotMatch(page, /google-analytics\.com|UA-\d+/);
});

test('REF-11: /dates/ loads the Bandsintown widget over https and has no http:// script or iframe URLs', () => {
  const page = html();
  const scripts = [...page.matchAll(/<script\b[^>]*\bsrc=["']?([^"' >]+)/g)].map(m => m[1]);
  const iframes = [...page.matchAll(/<iframe\b[^>]*\bsrc=["']?([^"' >]+)/g)].map(m => m[1]);
  assert.ok(scripts.some(s => /^https:\/\/widgetv3\.bandsintown\.com\//.test(s)), `Bandsintown script: ${scripts.join(', ')}`);
  assert.deepEqual([...scripts, ...iframes].filter(u => /^http:\/\//i.test(u)), []);
  assert.match(page, /class="bit-widget-initializer"[^>]*data-artist-name="Insane Driver"/);
});

test('REF-12: /dates/ always renders a "Follow on Bandsintown" link to https://www.bandsintown.com/Insane%20Driver outside the widget', () => {
  const page = html();
  const links = [...page.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)]
    .filter(m => /href="https:\/\/www\.bandsintown\.com\/Insane%20Driver"/.test(m[1]) && !/bit-widget-initializer/.test(m[1]));
  assert.ok(links.some(m => m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() === 'Follow on Bandsintown'), 'labelled link');
});

test('REF-13: /dates/ keeps its title, description, robots and canonical', () => {
  const page = html();
  assert.match(page, /<title>Dates - Insane Driver Official Website<\/title>/);
  assert.match(page, /<meta name="description" content="Upcoming Insane Driver concerts and tour dates\. Find a show near you and follow the band on Bandsintown\.">/);
  assert.match(page, /<meta name="robots" content="index, follow">/);
  assert.match(page, /<link rel="canonical" href="https:\/\/insanedriver\.com\.br\/dates\/">/);
});

test('REF-13: /dates/ stays in the sitemap', () => {
  assert.match(built('sitemap.xml'), /<loc>https:\/\/insanedriver\.com\.br\/dates\/<\/loc>/);
});

test('REF-13: /dates/ is not linked from the header or footer menu on any layout page', () => {
  for (const file of ['index.html', 'band/index.html', 'dates/index.html']) {
    const page = built(file);
    const header = page.match(/<nav class="navbar[\s\S]*?<\/nav>/)[0].replace(/<!--[\s\S]*?-->/g, '');
    const footer = page.match(/<footer[\s\S]*<\/footer>/)[0].replace(/<!--[\s\S]*?-->/g, '');
    assert.doesNotMatch(header, /href="\/dates\/"/, `${file} header`);
    assert.doesNotMatch(footer, /href="\/dates\/"/, `${file} footer`);
  }
});

test('REF-12/edge: the FEED::BANDSINTOWN panel carries a static "No shows announced right now." empty state beside the widget', () => {
  const panel = html().match(/FEED::BANDSINTOWN<\/div>([\s\S]*?)<\/section>/);
  assert.ok(panel, 'feed panel');
  const empty = panel[1].match(/<div class="dates-empty"[^>]*>([\s\S]*?)<\/div>/);
  assert.ok(empty, 'empty state block inside the feed panel');
  assert.match(empty[1], /<h3 class="dates-empty-title">No shows announced right now\.<\/h3>/);
  // Only mockup copy: no invented telemetry line.
  assert.doesNotMatch(panel[1], /telemetry standby/i);
});
