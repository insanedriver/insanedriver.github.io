const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Reads the built site: run `npm run build` first.
const DOCS = path.join(__dirname, '../../docs');
const built = file => fs.readFileSync(path.join(DOCS, file), 'utf8');
const press = () => built('press/index.html');
const text = html => html.replace(/<[^>]+>/g, ' ').replace(/&quot;|&#34;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
const section = (html, tab) => {
  const m = html.match(new RegExp(`<section[^>]*>\\s*<div class="cyber-panel-tab"><span class="tab-icon"></span> ${tab}</div>[\\s\\S]*?</section>`));
  assert.ok(m, `${tab} panel found`);
  return m[0];
};
// The Band bio paragraphs as built on /band/ (source of truth for REF-18).
const bandBio = () => {
  const bio = built('band/index.html').match(/<div class="cyber-bio-text">([\s\S]*?)<\/div>/)[1];
  return [...bio.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].map(m => text(m[1]));
};
const bioParas = (html, cls) => {
  const m = html.match(new RegExp(`<div class="press-bio ${cls}"[^>]*>([\\s\\S]*?)</div>`));
  assert.ok(m, `${cls} found`);
  return [...m[1].matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].map(p => text(p[1]));
};

test('REF-17: /press/ is built on the base layout with the five EPK panels', () => {
  const html = press();
  assert.match(html, /<body id="page_press">/);
  assert.match(html, /<link rel="stylesheet" href="\/assets\/css\/press\.min\.css[^"]*">/);
  assert.match(html, /<footer class="site-footer">/);
  assert.match(html, /<h1 class="[^"]*page-header[^"]*">Press Kit<\/h1>/);
  for (const tab of ['EPK::BIO', 'EPK::FACTS', 'EPK::PHOTOS', 'EPK::LOGOS', 'EPK::CONTACT']) section(html, tab);
});

test('REF-18: the short bio is the first two Band bio paragraphs; the long bio is every Band bio paragraph and the quote', () => {
  const bio = section(press(), 'EPK::BIO');
  const band = bandBio();
  assert.ok(band.length >= 4, `band bio has ${band.length} paragraphs`);
  assert.deepEqual(bioParas(bio, 'press-bio--short'), band.slice(0, 2));
  assert.deepEqual(bioParas(bio, 'press-bio--long'), band);
});

test('REF-19: every 2020 PROMO photo is listed with its thumbnail and a download link to its full-resolution src', () => {
  const photos = require('../../_data/photos.json').filter(p => p.category === 'PROMO' && /2020/.test(p.caption));
  assert.ok(photos.length >= 6);
  const panel = section(press(), 'EPK::PHOTOS');
  const downloads = [...panel.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*\bdownload\b[^>]*>/g)].map(m => m[1]);
  assert.deepEqual(downloads, photos.map(p => p.src));
  for (const p of photos) {
    assert.match(panel, new RegExp(`<img[^>]*src="${p.thumbnail}"`), `${p.id} thumbnail`);
    assert.ok(fs.existsSync(path.join(DOCS, p.src)), `${p.src} is published`);
  }
});

test('REF-20: /press/ offers download links to logo_horizontal.png and logo_loading.png', () => {
  const panel = section(press(), 'EPK::LOGOS');
  const downloads = [...panel.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*\bdownload\b[^>]*>/g)].map(m => m[1]);
  assert.deepEqual(downloads, ['/assets/images/logo_horizontal.png', '/assets/images/logo_loading.png']);
});

test('REF-21: the highlight counts equal the album and single counts in _data/discography.json', () => {
  const { albums, singles } = require('../../_data/discography.json');
  const facts = text(section(press(), 'EPK::FACTS'));
  assert.match(facts, new RegExp(`\\b${albums.length} Album releases\\b`));
  assert.match(facts, new RegExp(`\\b${singles.length} Singles\\b`));
  assert.match(facts, /São Paulo, Brazil/);
  assert.match(facts, /Since 2013/);
});

test('REF-22: /press/ shows contact@insanedriver.com.br as a mailto: link', () => {
  const panel = section(press(), 'EPK::CONTACT');
  const link = panel.match(/<a\b[^>]*href="mailto:contact@insanedriver\.com\.br"[^>]*>([\s\S]*?)<\/a>/);
  assert.ok(link, 'mailto link');
  assert.equal(text(link[1]), 'contact@insanedriver.com.br');
});

test('REF-23: /press/ has its own title, description, canonical and index, follow robots', () => {
  const html = press();
  assert.match(html, /<title>Press Kit - Insane Driver Official Website<\/title>/);
  const desc = html.match(/<meta name="description" content="([^"]+)">/);
  assert.ok(desc && /press kit/i.test(desc[1]), 'press description');
  assert.match(html, /<meta name="robots" content="index, follow">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/insanedriver\.com\.br\/press\/">/);
});

test('REF-23: /press/ is in the sitemap and not in the header menu', () => {
  assert.match(built('sitemap.xml'), /<loc>https:\/\/insanedriver\.com\.br\/press\/<\/loc>/);
  for (const file of ['index.html', 'press/index.html']) {
    const header = built(file).match(/<nav class="navbar[\s\S]*?<\/nav>/)[0].replace(/<!--[\s\S]*?-->/g, '');
    assert.doesNotMatch(header, /href="\/press\/"/, file);
  }
});

// REF-21 (sensor M10): render the Press template with stub data, so hardcoded counts cannot pass.
test('REF-21: the highlight counts follow _data/discography.json (rendered with stub data: 7 albums, 11 singles)', async () => {
  const Liquid = require('liquidjs');
  const matter = require('gray-matter');
  const root = path.join(__dirname, '../..');
  const engine = Liquid({ root: [path.join(root, '_includes')], extname: '.liquid', dynamicPartials: true /* as in .eleventy.js */ });
  const { content } = matter(fs.readFileSync(path.join(root, 'press/index.html'), 'utf8'));
  const stub = n => Array.from({ length: n }, (_, i) => ({ slug: `x${i}` }));
  const html = await engine.parseAndRender(content, {
    discography: { albums: stub(7), singles: stub(11) },
    bio: require('../../_data/bio.js'),
    photos: [],
  });
  const facts = text(section(html, 'EPK::FACTS'));
  assert.match(facts, /\b7 Album releases\b/);
  assert.match(facts, /\b11 Singles\b/);
});
