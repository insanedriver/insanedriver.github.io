const { test, expect } = require('../photos/browser.cjs');
const catalog = require('../../_data/discography.json');
const videos = require('../../_data/videos.json');
const platforms = require('../../_data/platforms.json');
const songData = require('../../_data/songs.json').songs;
const fs = require('node:fs');
const path = require('node:path');

// Every song page, with its video (SONG-11) and its neighbours in the album.
const kebab = t => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const SONGS = ['insane-driver', 'silicon-fortress'].flatMap(a => {
  const album = catalog.albums.find(x => x.slug === a);
  return album.tracks.map(t => ({
    album, track: t, slug: kebab(t.title), url: `/discography/${a}/${kebab(t.title)}/`,
    video: videos.find(v => v.slug === kebab(t.title)) || null,
  }));
});
const KEEP_AWAY = SONGS.find(s => s.slug === 'keep-away');
const TEARS = SONGS.find(s => s.slug === 'tears-of-blood');
const FAMILY_CLASSES = ['song-lyrics-section--verse', 'song-lyrics-section--chorus', 'song-lyrics-section--bridge', 'song-lyrics-section--other'];

// Classes of each labelled / unlabelled lyrics section, in page order.
const sectionFamilies = page => page.locator('[data-song-lyrics] .song-lyrics-section').evaluateAll((els, names) => els.map(el => ({
  label: el.querySelector('h3') ? el.querySelector('h3').textContent.trim() : null,
  families: names.filter(n => el.classList.contains(n)),
})), FAMILY_CLASSES);

const two = n => String(n).padStart(2, '0');
const neighbour = (s, delta) => s.album.tracks.find(t => t.position === s.track.position + delta);

const FANS_OF = 'For fans of Alter Bridge, Killswitch Engage and Avenged Sevenfold';
const TABS = ['PANEL A // VIDEO TRANSMISSION', 'PANEL B // AUDIO UPLINK', 'PANEL D // SONG DOSSIER', 'PANEL C // LYRICS TERMINAL'];
const norm = t => t.replace(/\s+/g, ' ').trim();
const initials = title => title.split(' ').map(w => w[0].toUpperCase()).join('');
const runtime = sec => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

// BENTO-18..20 from the spec: panel order, track URL else album URL, sub label by URL kind.
const UPLINK = [['spotify', true], ['apple', true], ['ytmusic', true], ['bandcamp', true], ['deezer', false], ['tidal', false], ['amazon', false], ['pandora', false]];
const TRACK_SUB = { spotify: 'Play the track', apple: 'Play the track', ytmusic: 'Audio stream', bandcamp: 'Lossless download' };
const expectedUplink = s => {
  const track = (songData.find(d => d.slug === s.slug) || {}).links || {};
  return UPLINK.map(([key, primary]) => {
    const url = track[key] || s.album.links[key];
    if (!url) return null;
    const sub = track[key] && TRACK_SUB[key] ? TRACK_SUB[key] : platforms.find(p => p.key === key).sub;
    return { key, url, primary, sub };
  }).filter(Boolean);
};

// BENTO-26: sections of the lyrics file - one per [label], plus one for lines before the first label.
const sectionCount = s => {
  const lines = fs.readFileSync(path.join(__dirname, '../../_data/lyrics', s.album.slug, `${s.slug}.txt`), 'utf8')
    .split('\n').map(l => l.trim()).filter(Boolean);
  return lines.filter(l => /^\[.+\]$/.test(l)).length + (/^\[.+\]$/.test(lines[0]) ? 0 : 1);
};

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  for (const s of SONGS.filter(x => x.video)) {
    test(`BENTO-01/07/09/15..22/26/31/32/42: ${s.url} renders the bento`, async ({ page }) => {
      await page.goto(s.url);
      const { id, type, title } = s.video;
      const NN = two(s.track.position);

      // BENTO-01: one grid, four panels, tabs in DOM order A, B, D, C.
      const grid = page.locator('[data-song-bento]');
      await expect(grid).toHaveCount(1);
      expect((await grid.locator('.cyber-panel-tab').allTextContents()).map(norm)).toEqual(TABS);
      const panel = letter => grid.locator('.cyber-panel', { has: page.locator('.cyber-panel-tab', { hasText: `PANEL ${letter} //` }) });

      // BENTO-07: metadata bar.
      const meta = page.locator('[data-song-meta]');
      await expect(meta).toHaveCount(1);
      await expect(meta.locator('.disc-release-art img')).toHaveAttribute('src', /^\/assets\/images\/releases\//);
      const metaText = norm(await meta.textContent());
      expect(metaText).toContain(`Track ${NN} // ${s.album.year}`);
      expect(metaText).toContain(`Runtime ${runtime(s.track.duration)}`);
      expect(metaText).toContain('Recommended intel');
      await expect(meta.locator(`a[href="/discography/${s.album.slug}/"]`)).toHaveText(s.album.title);
      await expect(meta.getByText(FANS_OF, { exact: true })).toHaveCount(1);

      // BENTO-09 / BENTO-42: QUICK PLAY is a plain anchor to Panel A.
      const quick = meta.locator('a[data-song-quickplay]');
      await expect(quick).toHaveCount(1);
      await expect(quick).toHaveText(/^\s*Quick play\s*$/i);
      await expect(quick).toHaveAttribute('href', '#song-video');
      expect(await page.locator('#song-video .cyber-panel-tab').textContent().then(norm)).toBe(TABS[0]);

      // BENTO-15 / BENTO-16: Panel A telemetry and the video title as plain text.
      const a = panel('A');
      const aText = norm(await a.textContent());
      for (const t of [`● OFFICIAL ${type}`, `REC::${id} // ${type}`, `SOURCE: YOUTUBE // ${id}`]) expect(aText).toContain(t);
      await expect(a.locator('[data-song-video]')).toHaveAttribute('href', `https://www.youtube.com/watch?v=${id}`);
      const caption = a.locator('.song-bento-video-title');
      await expect(caption).toHaveText(title);
      expect(await caption.evaluate(el => el.tagName === 'P' && !el.closest('a'))).toBe(true);

      // BENTO-17: no fabricated technical claims anywhere on the page.
      expect(await page.locator('body').textContent()).not.toMatch(/1080P|24-Bit|High-Res|Bitrate/i);

      // BENTO-18..21: Panel B buttons.
      const b = panel('B');
      const shown = await b.locator('a[data-disc-link]').evaluateAll(els => els.map(el => ({
        key: el.getAttribute('data-disc-link'), url: el.getAttribute('href'),
        primary: el.classList.contains('cyber-link-btn--primary'), compact: el.classList.contains('cyber-link-btn--compact'),
        sub: el.querySelector('.cyber-link-sub') ? el.querySelector('.cyber-link-sub').textContent.trim() : null,
        target: el.getAttribute('target'), rel: el.getAttribute('rel'), slug: el.getAttribute('data-disc-slug'),
      })));
      const want = expectedUplink(s);
      expect(shown.map(x => x.key)).toEqual(want.map(x => x.key));
      for (const [i, x] of shown.entries()) {
        expect(x.url, x.key).toBe(want[i].url);
        expect([x.primary, x.compact], x.key).toEqual([want[i].primary, !want[i].primary]);
        if (want[i].primary) expect(x.sub, x.key).toBe(want[i].sub);
        expect([x.target, x.rel], x.key).toEqual(['_blank', 'noopener']);
        expect(x.slug, x.key).toBeTruthy();
      }
      // BENTO-22
      expect(norm(await b.textContent())).toContain('STATUS: ONLINE // ALL NODES ACTIVE');

      // BENTO-26 / BENTO-25: Panel C holds the lyrics and their counters.
      const c = panel('C');
      await expect(c.locator('[data-song-lyrics]')).toHaveCount(1);
      const cText = norm(await c.textContent());
      expect(cText).toContain(`[${sectionCount(s)} SECTIONS]`);
      expect(cText).toContain(`HUD.LOG::LYR_${NN}`);

      // BENTO-31 / BENTO-32: Panel D holds the dossier and the catalog line.
      const d = panel('D');
      const data = songData.find(x => x.slug === s.slug);
      await expect(d.locator('[data-song-about]')).toHaveCount(data.about ? 1 : 0);
      await expect(page.locator('[data-song-about]')).toHaveCount(data.about ? 1 : 0);
      await expect(d.locator('[data-song-also]')).toHaveCount(await page.locator('[data-song-also]').count());
      expect(norm(await d.textContent())).toContain(`CATALOG: ${initials(s.album.title)}-TRACK-${NN} // ALL EDITIONS LISTED`);
    });
  }

  for (const s of [SONGS.find(x => x.slug === 'faceless-demons'), SONGS.find(x => x.slug === 'endless-path')]) {
    test(`BENTO-02: ${s.url} (no video) keeps the stacked layout`, async ({ page }) => {
      await page.goto(s.url);
      await expect(page.locator('[data-song-bento]')).toHaveCount(0);
      await expect(page.locator('[data-song-meta]')).toHaveCount(0);
      await expect(page.locator('.cyber-panel-tab', { hasText: 'PANEL A' })).toHaveCount(0);
      await expect(page.locator('[data-song-lyrics]')).toHaveCount(1);
    });
  }

  for (const s of SONGS) {
    test(`BENTO-34/35: ${s.url} has a full-width sequencer after the last panel`, async ({ page }) => {
      await page.goto(s.url);
      const nav = page.locator('.song-nav');
      await expect(nav).toHaveCount(1);
      const placement = await nav.evaluate(el => {
        const panels = [...document.querySelectorAll('.cyber-panel')];
        const last = panels[panels.length - 1];
        return { insidePanel: !!el.closest('.cyber-panel'), afterLast: !!(last.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) };
      });
      expect(placement).toEqual({ insidePanel: false, afterLast: true });
      const text = async rel => (await page.locator(`.song-nav a[rel="${rel}"]`).textContent()).replace(/\s+/g, ' ').trim();
      const prev = neighbour(s, -1);
      const next = neighbour(s, 1);
      if (prev) expect(await text('prev')).toBe(`← Previous track // ${two(prev.position)} ${prev.title}`);
      else await expect(page.locator('.song-nav a[rel="prev"]')).toHaveCount(0);
      if (next) expect(await text('next')).toBe(`Next track → // ${two(next.position)} ${next.title}`);
      else await expect(page.locator('.song-nav a[rel="next"]')).toHaveCount(0);
    });
  }

  test('BENTO-08: a video song h1 is the title badge; other h1s keep their classes', async ({ page }) => {
    const BASE = ['text-center', 'subtitle-font', 'page-header'];
    const h1 = async url => {
      await page.goto(url);
      await expect(page.locator('h1')).toHaveCount(1);
      return page.locator('h1').evaluate(el => ({ text: el.textContent.trim(), classes: [...el.classList] }));
    };
    for (const s of SONGS.filter(x => x.video)) {
      expect(await h1(s.url), s.url).toEqual({ text: s.track.title, classes: [...BASE, 'song-title-badge'] });
    }
    for (const s of SONGS.filter(x => !x.video)) {
      expect((await h1(s.url)).classes, s.url).toEqual(BASE);
    }
    for (const url of ['/band/', '/discography/', '/discography/silicon-fortress/']) {
      expect((await h1(url)).classes, url).toEqual(BASE);
    }
  });

  test('BENTO-27: each labelled lyrics section carries exactly one family class', async ({ page }) => {
    await page.goto(KEEP_AWAY.url);
    expect(await sectionFamilies(page)).toEqual([
      { label: 'Verse 1', families: ['song-lyrics-section--verse'] },
      { label: 'Bridge', families: ['song-lyrics-section--bridge'] },
      { label: 'Chorus', families: ['song-lyrics-section--chorus'] },
      { label: 'Verse 2', families: ['song-lyrics-section--verse'] },
      { label: 'Bridge', families: ['song-lyrics-section--bridge'] },
      { label: 'Chorus', families: ['song-lyrics-section--chorus'] },
    ]);
  });

  test('BENTO-27 edge: a lyrics sheet with no labels gets no family class', async ({ page }) => {
    await page.goto(TEARS.url);
    const sections = await sectionFamilies(page);
    expect(sections.length).toBeGreaterThan(0);
    for (const s of sections) expect(s).toEqual({ label: null, families: [] });
  });
});


// ── Layout (T8) ──

const GHOSTS = SONGS.find(s => s.slug === 'ghosts');
const rects = page => page.evaluate(() => {
  const grid = document.querySelector('[data-song-bento]');
  const box = el => { const r = el.getBoundingClientRect(); return { top: r.top + scrollY, left: r.left, width: r.width, bottom: r.bottom + scrollY }; };
  const out = { grid: box(grid) };
  for (const l of ['a', 'b', 'c', 'd']) out[l] = box(grid.querySelector(`.song-bento-panel--${l}`));
  return out;
});

for (const width of [1280, 992]) {
  for (const s of [KEEP_AWAY, GHOSTS]) {
    test(`BENTO-03/04/33: ${s.url} at ${width}px is a 2+1 / 1+1 bento`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(s.url);
      const r = await rects(page);
      // BENTO-03: A and B on one row, A left, A two-thirds.
      expect(Math.abs(r.a.top - r.b.top)).toBeLessThanOrEqual(2);
      expect(r.a.left).toBeLessThan(r.b.left);
      const ratio = r.a.width / (r.a.width + r.b.width);
      expect(ratio).toBeGreaterThanOrEqual(0.64);
      expect(ratio).toBeLessThanOrEqual(0.69);
      // BENTO-04: C and D on the next row, C left, equal widths.
      expect(Math.abs(r.c.top - r.d.top)).toBeLessThanOrEqual(2);
      expect(r.c.top).toBeGreaterThanOrEqual(Math.max(r.a.bottom, r.b.bottom));
      expect(r.c.left).toBeLessThan(r.d.left);
      expect(Math.abs(r.c.width - r.d.width)).toBeLessThanOrEqual(2);
      // BENTO-33: the dossier content is sticky.
      expect(await page.locator('.song-bento-panel--d .song-bento-sticky').evaluate(el => getComputedStyle(el).position)).toBe('sticky');
      // NOVID-07 (video side): Panel B shares the sticky wrapper but only the lyrics layout pins it.
      expect(await page.locator('.song-bento-panel--b .song-bento-sticky').evaluate(el => getComputedStyle(el).position)).toBe('static');
    });
  }
}

for (const width of [991, 768, 375]) {
  test(`BENTO-05/24: at ${width}px the panels stack A, B, D, C and Panel B shows 2 primary columns`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(KEEP_AWAY.url);
    const r = await rects(page);
    for (const l of ['a', 'b', 'd', 'c']) expect(Math.abs(r[l].width - r.grid.width), l).toBeLessThanOrEqual(2);
    expect(r.a.bottom).toBeLessThanOrEqual(r.b.top + 1);
    expect(r.b.bottom).toBeLessThanOrEqual(r.d.top + 1);
    expect(r.d.bottom).toBeLessThanOrEqual(r.c.top + 1);
    const cols = await page.locator('.song-bento-panel--b .cyber-link-btn--primary').evaluateAll(els => els.map(el => {
      const b = el.getBoundingClientRect(); return { left: Math.round(b.left), width: b.width };
    }));
    expect(new Set(cols.map(c => c.left)).size).toBe(2);
    expect(Math.max(...cols.map(c => c.width)) - Math.min(...cols.map(c => c.width))).toBeLessThanOrEqual(1);
  });
}

for (const width of [375, 768, 992, 1280]) {
  test(`BENTO-06: no horizontal overflow on any song page at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const s of SONGS) {
      await page.goto(s.url);
      const { scroll, client } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
      expect(scroll, s.url).toBe(client);
    }
  });
}

for (const width of [1280, 375]) {
  test(`BENTO-14/30: at ${width}px the video frame is 16:9 and the lyrics are not clipped`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(KEEP_AWAY.url);
    const frame = await page.locator('.song-bento-panel--a .song-video-frame-box').boundingBox();
    expect(Math.abs(frame.width / frame.height - 16 / 9) / (16 / 9)).toBeLessThanOrEqual(0.01);
    for (const sel of ['.song-bento-panel--c .cyber-panel-body', '.song-bento-panel--c [data-song-lyrics]']) {
      const box = await page.locator(sel).evaluate(el => ({ overflow: getComputedStyle(el).overflowY, scroll: el.scrollHeight, client: el.clientHeight }));
      expect(box.overflow, sel).toBe('visible');
      expect(box.scroll, sel).toBe(box.client);
    }
  });
}

// ── HUD finish (T9) ──

const SCOPES = '[data-song-bento], [data-song-meta], .song-nav';

test('BENTO-08/37: the title badge uses insaneFont and the panel tabs use SiliconFont', async ({ page }) => {
  await page.goto(KEEP_AWAY.url);
  const first = font => font.split(',')[0].trim().replace(/["']/g, '');
  expect(first(await page.locator('h1').evaluate(el => getComputedStyle(el).fontFamily))).toBe('insaneFont');
  const tabs = await page.locator('[data-song-bento] .cyber-panel-tab').evaluateAll(els => els.map(el => getComputedStyle(el).fontFamily));
  expect(tabs).toHaveLength(4);
  for (const f of tabs) expect(first(f)).toBe('SiliconFont');
});

test('BENTO-23: a hovered Panel B button takes its brand border color', async ({ page }) => {
  await page.goto(KEEP_AWAY.url);
  const spotify = page.locator('.song-bento-panel--b [data-disc-link="spotify"]');
  await spotify.hover();
  await expect.poll(() => spotify.evaluate(el => getComputedStyle(el).borderTopColor)).toBe('rgb(29, 185, 84)');
});

test('BENTO-28: section markers are colored by family and chorus lines are italic', async ({ page }) => {
  await page.goto(KEEP_AWAY.url);
  const COLORS = { verse: 'rgb(0, 243, 255)', other: 'rgb(0, 243, 255)', bridge: 'rgb(255, 0, 234)', chorus: 'rgb(252, 238, 10)' };
  const rows = await page.locator('[data-song-bento] .song-lyrics-section').evaluateAll(els => els.map(el => {
    const fam = (el.className.match(/song-lyrics-section--(\w+)/) || [])[1] || null;
    const h3 = el.querySelector('h3');
    const before = h3 ? getComputedStyle(h3, '::before') : null;
    const p = el.querySelector('p');
    return { fam, marker: before && before.content !== 'none' ? before.backgroundColor : null, italic: p ? getComputedStyle(p).fontStyle : null };
  }));
  expect(rows.map(r => r.fam)).toEqual(['verse', 'bridge', 'chorus', 'verse', 'bridge', 'chorus']);
  for (const r of rows) {
    expect(r.marker, r.fam).toBe(COLORS[r.fam]);
    if (r.italic !== null) expect(r.italic, r.fam).toBe(r.fam === 'chorus' ? 'italic' : 'normal');
  }
  // A non-chorus "Prayer" section on Desperate Prayer is "other": cyan.
  await page.goto(SONGS.find(s => s.slug === 'desperate-prayer').url);
  const prayer = page.locator('[data-song-bento] .song-lyrics-section--other h3').first();
  await expect(prayer).toHaveText('Prayer');
  expect(await prayer.evaluate(el => getComputedStyle(el, '::before').backgroundColor)).toBe(COLORS.other);
});

test('BENTO-36: nothing in the bento, the metadata bar or the sequencer has rounded corners', async ({ page }) => {
  for (const s of [KEEP_AWAY, GHOSTS]) {
    await page.goto(s.url);
    const rounded = await page.evaluate(sel => {
      const out = [];
      for (const root of document.querySelectorAll(sel)) {
        for (const el of [root, ...root.querySelectorAll('*')]) {
          for (const pseudo of [null, '::before', '::after']) {
            const cs = getComputedStyle(el, pseudo);
            const r = [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomLeftRadius, cs.borderBottomRightRadius];
            if (r.some(v => v !== '0px')) out.push(`${el.className || el.tagName}${pseudo || ''}: ${r.join(' ')}`);
          }
        }
      }
      return out;
    }, SCOPES);
    expect(rounded, s.url).toEqual([]);
  }
});

test('BENTO-38: keyboard focus shows the yellow 3px ring with a 4px offset', async ({ page }) => {
  await page.goto(KEEP_AWAY.url);
  await page.keyboard.press('Tab');
  for (const sel of ['[data-song-quickplay]', '.song-bento-panel--b [data-disc-link="spotify"]', '.song-bento-panel--b [data-disc-link="tidal"]', '[data-song-video]', '.song-nav a[rel="next"]']) {
    await page.locator(sel).evaluate(el => el.focus());
    // The platform buttons transition every property over .3s, outline included.
    await expect.poll(() => page.locator(sel).evaluate(el => {
      const cs = getComputedStyle(el);
      return [el.matches(':focus-visible'), cs.outlineStyle, cs.outlineWidth, cs.outlineColor, cs.outlineOffset];
    }), { message: sel }).toEqual([true, 'solid', '3px', 'rgb(252, 238, 10)', '4px']);
  }
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('BENTO-39: nothing animates in the bento or the metadata bar', async ({ page }) => {
    await page.goto(KEEP_AWAY.url);
    const moving = await page.evaluate(() => {
      const out = [];
      for (const root of document.querySelectorAll('[data-song-bento], [data-song-meta]')) {
        for (const el of [root, ...root.querySelectorAll('*')]) {
          for (const pseudo of [null, '::before', '::after']) {
            const name = getComputedStyle(el, pseudo).animationName;
            if (name !== 'none') out.push(`${el.className}${pseudo || ''}: ${name}`);
          }
        }
      }
      return out;
    });
    expect(moving).toEqual([]);
  });
});

test('BENTO-39: without the preference the live dot pulses', async ({ page }) => {
  await page.goto(KEEP_AWAY.url);
  expect(await page.locator('.song-bento-dot').evaluate(el => getComputedStyle(el).animationName)).not.toBe('none');
});

test('BENTO-40/41: panel bodies carry the smoke background and 25px grid; reading text is frost', async ({ page }) => {
  await page.goto(KEEP_AWAY.url);
  const bodies = await page.locator('[data-song-bento] .cyber-panel-body').evaluateAll(els => els.map(el => {
    const cs = getComputedStyle(el);
    return [cs.backgroundColor, (cs.backgroundImage.match(/linear-gradient/g) || []).length, cs.backgroundSize.split(', ')];
  }));
  expect(bodies).toHaveLength(4);
  for (const b of bodies) expect(b).toEqual(['rgba(10, 10, 10, 0.85)', 2, ['25px 25px', '25px 25px']]);
  const colors = await page.locator('[data-song-bento] .song-lyrics-section p, [data-song-bento] [data-song-about] p')
    .evaluateAll(els => [...new Set(els.map(el => getComputedStyle(el).color))]);
  expect(colors).toEqual(['rgb(233, 237, 242)']);
});

// ── QUICK PLAY (T10) ──

const YOUTUBE = /(^|\.)(youtube\.com|youtube-nocookie\.com)$/;
const EMBED = s => `https://www.youtube-nocookie.com/embed/${s.video.id}?autoplay=1`;
const panelAInView = page => page.evaluate(() => {
  const top = document.getElementById('song-video').getBoundingClientRect().top;
  return top >= -1 && top < innerHeight;
});

test.describe('QUICK PLAY on a phone-sized viewport (Panel A starts below the fold)', () => {
  test.use({ viewport: { width: 375, height: 700 } });

  test('BENTO-10/11/43: QUICK PLAY scrolls to Panel A, starts the video in place and reports the click', async ({ page }) => {
    const hits = [];
    page.on('request', req => { if (YOUTUBE.test(new URL(req.url()).hostname)) hits.push(req.url()); });
    await page.goto(KEEP_AWAY.url, { waitUntil: 'load' });
    // BENTO-43: nothing from YouTube before activation.
    await page.waitForTimeout(300);
    expect(hits).toEqual([]);
    expect(await panelAInView(page)).toBe(false);

    await page.locator('[data-song-quickplay]').click();
    const frame = page.locator('#song-video iframe');
    await expect(frame).toHaveCount(1);
    await expect(frame).toHaveAttribute('src', EMBED(KEEP_AWAY));
    await expect(page.locator('[data-song-video]')).toHaveCount(0);
    await expect.poll(() => panelAInView(page)).toBe(true);
    // Same URL: no jump to #song-video either.
    expect(new URL(page.url()).pathname).toBe(KEEP_AWAY.url);
    expect(new URL(page.url()).hash).toBe('');
    expect(page.context().pages()).toHaveLength(1);
    expect(hits.some(u => u.startsWith(EMBED(KEEP_AWAY).split('?')[0]))).toBe(true);
    // BENTO-11
    const events = await page.evaluate(() => (window.dataLayer || []).filter(e => e && e.event === 'song_quick_play'));
    expect(events).toEqual([{ event: 'song_quick_play', song: 'keep-away' }]);
  });

  test('BENTO-12: with the video already playing, QUICK PLAY only scrolls back and keeps one iframe', async ({ page }) => {
    await page.goto(KEEP_AWAY.url);
    await page.locator('[data-song-video]').click();
    await expect(page.locator('#song-video iframe')).toHaveCount(1);
    await page.evaluate(() => scrollTo(0, 0));
    await expect.poll(() => panelAInView(page)).toBe(false);
    await page.locator('[data-song-quickplay]').click();
    await expect.poll(() => panelAInView(page)).toBe(true);
    await page.locator('[data-song-quickplay]').click();
    await expect(page.locator('iframe')).toHaveCount(1);
    await expect(page.locator('#song-video iframe')).toHaveAttribute('src', EMBED(KEEP_AWAY));
    expect(new URL(page.url()).hash).toBe('');
  });
});

test.describe('QUICK PLAY under reduced motion', () => {
  test.use({ viewport: { width: 375, height: 700 }, reducedMotion: 'reduce' });

  test('BENTO-13: the jump to Panel A is instant', async ({ page }) => {
    await page.goto(GHOSTS.url);
    expect(await panelAInView(page)).toBe(false);
    // Click and measure in the same task: a smooth scroll would still be at the top.
    const inView = await page.evaluate(() => {
      document.querySelector('[data-song-quickplay]').click();
      const top = document.getElementById('song-video').getBoundingClientRect().top;
      return top >= -1 && top < innerHeight;
    });
    expect(inView).toBe(true);
  });
});

// ── Panel B tracking ──

test('BENTO-21: clicking a primary and a compact Panel B button pushes release_click for the song\'s release', async ({ page }) => {
  await page.goto(KEEP_AWAY.url);
  // The anchors target _blank; blocking the navigation keeps the assertions about the pushed event.
  await page.evaluate(() => {
    document.addEventListener('click', e => { const a = e.target.closest('a'); if (a) e.preventDefault(); });
  });
  await page.locator('.song-bento-panel--b .cyber-link-btn--primary[data-disc-link="spotify"]').click();
  await page.locator('.song-bento-panel--b .cyber-link-btn--compact[data-disc-link="deezer"]').click();
  expect(await page.evaluate(() => (window.dataLayer || []).filter(e => e && e.event === 'release_click'))).toEqual([
    { event: 'release_click', platform: 'spotify', release: KEEP_AWAY.album.slug },
    { event: 'release_click', platform: 'deezer', release: KEEP_AWAY.album.slug },
  ]);
});
