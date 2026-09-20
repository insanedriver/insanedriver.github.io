const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const photos = require('../../_data/photos.json');

test('P2020-01/02: archive contains all 23 unique full-size links with 2020 photoshoot first starting with 274', () => {
  const expected2020 = [
    '/assets/gallery/promo2020/274.jpg',
    '/assets/gallery/promo2020/113.jpg',
    '/assets/gallery/promo2020/133.jpg',
    '/assets/gallery/promo2020/36.jpg',
    '/assets/gallery/promo2020/140.jpg',
    '/assets/gallery/promo2020/20.jpg'
  ];
  const expectedHistorical = [
    '/assets/gallery/promo2017/1.JPG',
    '/assets/gallery/promo2017/2.JPG',
    '/assets/gallery/promo2017/3.JPG',
    '/assets/gallery/promo2017/4.JPG',
    '/assets/gallery/promo2017/5.JPG',
    '/assets/gallery/tide_acoustic.jpg',
    '/assets/gallery/manifesto/1.jpg',
    '/assets/gallery/manifesto/2.jpg',
    '/assets/gallery/manifesto/3.jpg',
    '/assets/gallery/manifesto/4.jpg',
    '/assets/gallery/manifesto/5.jpg',
    '/assets/gallery/manifesto/6.jpg',
    '/assets/gallery/eder_release_show.JPG',
    '/assets/gallery/DSC_3077.JPG',
    '/assets/gallery/backstage2.jpg',
    '/assets/gallery/pegadas.jpg',
    '/assets/gallery/_MG_3610.jpg'
  ];
  const expected = [...expected2020, ...expectedHistorical];
  assert.equal(photos.length, 23);
  assert.deepEqual(photos.map(p => p.src), expected);
  for (const p of photos) {
    assert.ok(fs.existsSync('.' + p.src), `Missing full-size image: ${p.src}`);
    assert.ok(fs.existsSync('.' + p.thumbnail), `Missing thumbnail: ${p.thumbnail}`);
  }
});

test('P2020-03: exactly six unique static highlights come from 2020 photoshoot starting with 274', () => {
  const selected = photos.filter(p => p.featured).sort((a, b) => a.highlightOrder - b.highlightOrder);
  assert.equal(selected.length, 6);
  assert.deepEqual(selected.map(p => p.highlightOrder), [1, 2, 3, 4, 5, 6]);
  assert.equal(selected[0].src, '/assets/gallery/promo2020/274.jpg');
  assert.ok(selected.every(p => p.src.startsWith('/assets/gallery/promo2020/')));
  assert.equal(new Set(selected.map(p => p.id)).size, 6);
});

test('P2020-07 / PHOTO-17: every image has descriptive alt text and real dimensions', () => {
  for (const p of photos) {
    assert.match(p.alt, /Insane Driver/);
    assert.ok(p.alt.length > 20, `Alt text too short for ${p.id}`);
    assert.ok(Number.isInteger(p.width) && p.width > 0, `Invalid width for ${p.id}`);
    assert.ok(Number.isInteger(p.height) && p.height > 0, `Invalid height for ${p.id}`);
    if (p.src.startsWith('/assets/gallery/promo2020/')) {
      assert.equal(p.category, 'PROMO');
      assert.equal(p.caption, 'Promo Picture 2020');
    }
  }
});
