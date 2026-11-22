const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Reads the built site: run `npm run build` first.
const DOCS = path.join(__dirname, '../../docs');
const built = file => fs.readFileSync(path.join(DOCS, file), 'utf8');
const page = () => built('press/reviews/index.html');
const text = html => html.replace(/<[^>]+>/g, ' ').replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const { reviews, recognitions } = require('../../_data/reviews.json');
const albums = require('../../_data/discography.json').albums;

// The album sections in page order: [{ slug, html }]
const sections = html => [...html.matchAll(/<section class="cyber-panel reviews-album" aria-labelledby="reviews-([a-z0-9-]+)-title">([\s\S]*?)<\/section>/g)]
  .map(m => ({ slug: m[1], html: m[2] }));
const cards = html => [...html.matchAll(/<article class="review-card">([\s\S]*?)<\/article>/g)].map(m => m[1]);
const cardLink = card => card.match(/<a class="review-link"([^>]*)>/)[1];
const cardHref = card => cardLink(card).match(/href="([^"]+)"/)[1].replace(/&amp;/g, '&');
const byNewest = list => [...list].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
// Every card paired with its data entry, in page order.
const pairs = () => sections(page()).flatMap(s => {
  const expected = byNewest(reviews.filter(r => r.album === s.slug));
  return cards(s.html).map((card, i) => ({ card, review: expected[i] }));
});

test('REV-01: /press/reviews/ is built on the base layout with the title "Press Reviews"', () => {
  const html = page();
  assert.match(html, /<body id="page_press-reviews">/);
  assert.match(html, /<title>Press Reviews[^<]*<\/title>/);
  assert.match(html, /<h1 class="[^"]*page-header[^"]*">Press Reviews<\/h1>/);
  assert.match(html, /<footer class="site-footer">/);
});

test('REV-02: one section per reviewed album, Silicon Fortress first, headed by title and year', () => {
  const found = sections(page());
  assert.deepEqual(found.map(s => s.slug), ['silicon-fortress', 'insane-driver']);
  for (const s of found) {
    const album = albums.find(a => a.slug === s.slug);
    const h2 = s.html.match(new RegExp(`<h2[^>]*id="reviews-${s.slug}-title"[^>]*>([\\s\\S]*?)</h2>`));
    assert.ok(h2, `${s.slug} heading`);
    assert.equal(text(h2[1]), `${album.title} (${album.year})`);
  }
});

test('edge: an album with no reviews (the Deluxe Edition) gets no section', () => {
  assert.doesNotMatch(page(), /reviews-insane-driver-deluxe-title/);
});

test('REV-03: every review is a card in its album section, newest date first', () => {
  const found = sections(page());
  let total = 0;
  for (const s of found) {
    const expected = byNewest(reviews.filter(r => r.album === s.slug));
    const got = cards(s.html);
    assert.equal(got.length, expected.length, `${s.slug} card count`);
    got.forEach((card, i) => {
      assert.equal(cardHref(card), expected[i].url, `${s.slug} card ${i} is ${expected[i].outlet}`);
      assert.match(card, new RegExp(`<time datetime="${expected[i].date}">`), `${expected[i].outlet} date`);
    });
    total += got.length;
  }
  assert.equal(total, reviews.length);
});

test('edge: a review published before its album release date keeps its real date (Pólvora Zine, Silicon Fortress)', () => {
  const p = pairs().find(x => x.review.outlet === 'Pólvora Zine' && x.review.album === 'silicon-fortress');
  assert.match(p.card, /<time datetime="2021-08-21">/);
});

test('REV-04: each card shows outlet, author when present, date, English quote and English summary', () => {
  for (const { card, review } of pairs()) {
    assert.equal(text(card.match(/<h3 class="review-outlet">([\s\S]*?)<\/h3>/)[1]), review.outlet);
    const author = card.match(/<span class="review-author">([\s\S]*?)<\/span>/);
    if (review.author) assert.equal(text(author[1]), review.author, `${review.outlet} author`);
    else assert.equal(author, null, `${review.outlet} has no author element`);
    assert.equal(text(card.match(/<blockquote class="review-quote">([\s\S]*?)<\/blockquote>/)[1]), `"${review.quote}"`);
    assert.equal(text(card.match(/<p class="review-summary">([\s\S]*?)<\/p>/)[1]), review.summary);
  }
});

test('edge: a review without an author renders no author element and no stray separator (Morticínio, Silicon Fortress)', () => {
  const p = pairs().find(x => x.review.outlet === 'Morticínio Produções' && x.review.album === 'silicon-fortress');
  assert.doesNotMatch(p.card, /review-author|review-sep/);
});

test('REV-05: a stored score is shown exactly as stored; no score means no score element', () => {
  let scored = 0;
  for (const { card, review } of pairs()) {
    const score = card.match(/<span class="review-score">([\s\S]*?)<\/span>/);
    if (review.score) { assert.equal(text(score[1]), review.score, review.outlet); scored++; }
    else assert.equal(score, null, `${review.outlet} has no score element`);
  }
  assert.ok(scored > 0 && scored < reviews.length);
});

test('REV-06: each card links to its url in a new tab with rel="noopener"', () => {
  for (const { card, review } of pairs()) {
    assert.equal(cardHref(card), review.url);
    assert.match(cardLink(card), /target="_blank"/);
    assert.match(cardLink(card), /rel="noopener"/);
  }
});

test('REV-07: Portuguese reviews are labeled "Translated from Portuguese"', () => {
  for (const { card, review } of pairs()) {
    const labeled = /<span class="review-label">Translated from Portuguese<\/span>/.test(card);
    assert.equal(labeled, review.language === 'pt', review.outlet);
  }
});

test('REV-08: archived reviews are labeled "Archived copy" and link to web.archive.org', () => {
  for (const { card, review } of pairs()) {
    const labeled = /<span class="review-label review-label--archived">Archived copy<\/span>/.test(card);
    assert.equal(labeled, review.archived === true, review.outlet);
    if (review.archived) assert.ok(cardHref(card).startsWith('https://web.archive.org/'));
  }
});

test('REV-09: print reviews say "Print" and press-release reviews say "Via press release"', () => {
  for (const { card, review } of pairs()) {
    const print = /<span class="review-label review-label--source">Print<\/span>/.test(card);
    const release = /<span class="review-label review-label--source">Via press release<\/span>/.test(card);
    assert.equal(print, review.source === 'print', `${review.outlet} Print`);
    assert.equal(release, review.source === 'press-release', `${review.outlet} Via press release`);
  }
});

test('REV-10: the intro says the reviews were published in Brazilian Portuguese and the band translated the quotes', () => {
  const intro = page().match(/<p class="reviews-intro">([\s\S]*?)<\/p>/);
  assert.ok(intro);
  assert.match(text(intro[1]), /originally published in Brazilian Portuguese/);
  assert.match(text(intro[1]), /translated (to|into) English by Insane Driver/);
});

test('REV-11: the Recognition list has one linked item per recognition', () => {
  const list = page().match(/<ul class="reviews-recognition">([\s\S]*?)<\/ul>/);
  assert.ok(list);
  const items = [...list[1].matchAll(/<li>([\s\S]*?)<\/li>/g)].map(m => m[1]);
  assert.equal(items.length, recognitions.length);
  items.forEach((item, i) => {
    assert.match(item, new RegExp(`<a [^>]*href="${esc(recognitions[i].url)}"`));
    assert.match(text(item), new RegExp(esc(recognitions[i].outlet)));
    assert.match(text(item), new RegExp(esc(recognitions[i].title)));
  });
});

test('REV-12: the sitemap lists /press/reviews/ and the header menu does not link to it', () => {
  assert.match(built('sitemap.xml'), /<loc>https:\/\/insanedriver\.com\.br\/press\/reviews\/<\/loc>/);
  const nav = page().match(/<nav class="navbar[\s\S]*?<\/nav>/);
  assert.ok(nav);
  assert.doesNotMatch(nav[0], /href="\/press\/reviews\/"/);
});
