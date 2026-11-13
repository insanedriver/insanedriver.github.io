const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const seoCatalog = require('../../_data/seo-catalog.json');
const songsData = require('../../_data/songs.json');
const { cleanJustification } = require('../../scripts/import-seo-catalog.cjs');

test('BANDSEO-01: seo-catalog.json covers all 24 songs from songs.json', () => {
    const expectedSlugs = songsData.songs.map(s => s.slug).sort();
    const actualSlugs = Object.keys(seoCatalog).sort();
    assert.deepEqual(actualSlugs, expectedSlugs);
});

test('BANDSEO-03: every track has primary/secondary genre and >=1 checked band with clean editorial justification', () => {
    for (const [slug, entry] of Object.entries(seoCatalog)) {
        assert.ok(entry.primaryGenre, `${slug} missing primaryGenre`);
        assert.ok(entry.secondaryGenre, `${slug} missing secondaryGenre`);
        assert.ok(Array.isArray(entry.bands) && entry.bands.length >= 1, `${slug} needs >=1 checked band`);
        for (const band of entry.bands) {
            assert.ok(band.name, `${slug} band missing name`);
            assert.ok(band.referenceTracks, `${slug}/${band.name} missing referenceTracks`);
            assert.ok(band.justification, `${slug}/${band.name} missing justification`);
            assert.ok(!/MERT acoustic similarity/i.test(band.justification), `${slug}/${band.name} leaked MERT jargon`);
            assert.ok(!/Layer 5|Layer 23/i.test(band.justification), `${slug}/${band.name} leaked layer numbers`);
            assert.equal(typeof band.score, 'number');
        }
    }
});

test('BANDSEO-03: cleanJustification strips MERT similarity boilerplate', () => {
    const raw = 'Heavy groove. MERT acoustic similarity of 0.80 (Layer 5: 0.80) aligns X with Y.';
    assert.equal(cleanJustification(raw), 'Heavy groove.');
});
