const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const photos = require('../../_data/photos.json');
test('PHOTO-02: original archive retains all 17 unique full-size links', () => {
  const expected = ['/assets/gallery/promo2017/1.JPG','/assets/gallery/promo2017/2.JPG','/assets/gallery/promo2017/3.JPG','/assets/gallery/promo2017/4.JPG','/assets/gallery/promo2017/5.JPG','/assets/gallery/tide_acoustic.jpg','/assets/gallery/manifesto/1.jpg','/assets/gallery/manifesto/2.jpg','/assets/gallery/manifesto/3.jpg','/assets/gallery/manifesto/4.jpg','/assets/gallery/manifesto/5.jpg','/assets/gallery/manifesto/6.jpg','/assets/gallery/eder_release_show.JPG','/assets/gallery/DSC_3077.JPG','/assets/gallery/backstage2.jpg','/assets/gallery/pegadas.jpg','/assets/gallery/_MG_3610.jpg'];
  assert.deepEqual(photos.map(p => p.src), expected);
  for (const p of photos) { assert.ok(fs.existsSync('.' + p.src)); assert.ok(fs.existsSync('.' + p.thumbnail)); }
});
test('PHOTO-01: exactly six unique ordered highlights come from archive', () => {
  const selected = photos.filter(p => p.highlightOrder).sort((a,b) => a.highlightOrder-b.highlightOrder);
  assert.deepEqual(selected.map(p => p.highlightOrder), [1,2,3,4,5,6]);
  assert.equal(new Set(selected.map(p => p.id)).size, 6);
});
test('PHOTO-17: every image has descriptive alt text and real dimensions', () => {
  for (const p of photos) {
    assert.match(p.alt, /Insane Driver/);
    assert.ok(p.alt.length > 20);
    assert.ok(Number.isInteger(p.width) && p.width > 0);
    assert.ok(Number.isInteger(p.height) && p.height > 0);
  }
});
