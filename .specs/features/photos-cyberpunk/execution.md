# Execution evidence

Tests derive from the approved specification. No tests skipped, deleted or weakened.

## T1

Gate: 3 unit tests and 2 browser tests passed.

| Criterion / test | Evidence | Assertion |
| --- | --- | --- |
| test('PHOTO-02: original archive retains all 17 unique full-size links', () => { | tests/photos/gallery.test.cjs:7 | assert.deepEqual(photos.map(p => p.src), expected); |
| test('PHOTO-02: original archive retains all 17 unique full-size links', () => { | tests/photos/gallery.test.cjs:8 | for (const p of photos) { assert.ok(fs.existsSync('.' + p.src)); assert.ok(fs.existsSync('.' + p.thumbnail)); } |
| test('PHOTO-01: exactly six unique ordered highlights come from archive', () => { | tests/photos/gallery.test.cjs:12 | assert.deepEqual(selected.map(p => p.highlightOrder), [1,2,3,4,5,6]); |
| test('PHOTO-01: exactly six unique ordered highlights come from archive', () => { | tests/photos/gallery.test.cjs:13 | assert.equal(new Set(selected.map(p => p.id)).size, 6); |
| test('PHOTO-17: every image has descriptive alt text and real dimensions', () => { | tests/photos/gallery.test.cjs:17 | assert.match(p.alt, /Insane Driver/); |
| test('PHOTO-17: every image has descriptive alt text and real dimensions', () => { | tests/photos/gallery.test.cjs:18 | assert.ok(p.alt.length > 20); |
| test('PHOTO-17: every image has descriptive alt text and real dimensions', () => { | tests/photos/gallery.test.cjs:19 | assert.ok(Number.isInteger(p.width) && p.width > 0); |
| test('PHOTO-17: every image has descriptive alt text and real dimensions', () => { | tests/photos/gallery.test.cjs:20 | assert.ok(Number.isInteger(p.height) && p.height > 0); |
| test('PHOTO-01/02: generated page has six highlights and complete archive', async ({page}) => { | tests/photos/gallery.e2e.cjs:4 | await expect(page.locator('[data-photo-slide]')).toHaveCount(6); |
| test('PHOTO-01/02: generated page has six highlights and complete archive', async ({page}) => { | tests/photos/gallery.e2e.cjs:5 | await expect(page.locator('.photos-archive figure')).toHaveCount(17); |
| test('PHOTO-01/02: generated page has six highlights and complete archive', async ({page}) => { | tests/photos/gallery.e2e.cjs:6 | await expect(page.locator('.photos-archive img[alt="Image description"]')).toHaveCount(0); |
| test('PHOTO-16: archive links work with JavaScript disabled', async ({browser}) => { | tests/photos/gallery.e2e.cjs:14 | await expect(links).toHaveCount(17); |
| test('PHOTO-16: archive links work with JavaScript disabled', async ({browser}) => { | tests/photos/gallery.e2e.cjs:17 | expect(response.status()).toBe(200); |
| test('PHOTO-16: archive links work with JavaScript disabled', async ({browser}) => { | tests/photos/gallery.e2e.cjs:18 | expect(response.headers()['content-type']).toMatch(/^image\//); |

Adequacy: assertions checked against the task criteria; tests map to the PHOTO identifiers and approved design bounds. No speculative coverage.

## T2

Gate: 3 unit tests and 8 browser tests passed. Visual review: /tmp/photos-review-{320,390,768,1440}.jpg. Dark surfaces, natural-color photography and angular cyan/magenta frame confirmed. Below-fold thumbnails are lazy-loaded. Tablet menu overflow corrected only within Photos. PHOTO-15 remains partially verified until viewer transitions in T4.

| Criterion | Evidence and assertion | Expected outcome / reverse mapping |
| --- | --- | --- |
| T2 visual, focus, motion | tests/photos/visual.e2e.cjs:6: `await expect(page.locator('.photos-stage')).toHaveCSS('border-top-color', 'rgb(0, 243, 255)');` | PHOTO-03/11/14/15; keep |
| T2 visual, focus, motion | tests/photos/visual.e2e.cjs:7: `await expect(page.locator('.photos-accent').first()).toHaveCSS('color', 'rgb(255, 0, 234)');` | PHOTO-03/11/14/15; keep |
| T2 visual, focus, motion | tests/photos/visual.e2e.cjs:8: `expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);` | PHOTO-03/11/14/15; keep |
| T2 visual, focus, motion | tests/photos/visual.e2e.cjs:9: `await expect(page.locator('.photos-archive')).toHaveCSS('display', 'grid');` | PHOTO-03/11/14/15; keep |
| T2 visual, focus, motion | tests/photos/visual.e2e.cjs:21: `await expect(control).toBeFocused();` | PHOTO-03/11/14/15; keep |
| T2 visual, focus, motion | tests/photos/visual.e2e.cjs:22: `await expect(control).toHaveCSS('outline-style', 'solid');` | PHOTO-03/11/14/15; keep |
| T2 visual, focus, motion | tests/photos/visual.e2e.cjs:23: `expect(await control.getAttribute('aria-label')).toBeTruthy();` | PHOTO-03/11/14/15; keep |
| T2 visual, focus, motion | tests/photos/visual.e2e.cjs:29: `expect(await page.locator('.photos-shell, .photos-shell *').evaluateAll(nodes => nodes.every(n => {` | PHOTO-03/11/14/15; keep |
| T2 visual, focus, motion | tests/photos/visual.e2e.cjs:31: `return css.animationName === 'none' && css.transitionDuration === '0s';` | PHOTO-03/11/14/15; keep |

Adequacy: all six planned cases pass; each assertion maps to T2 criteria. No test was weakened or removed. No extra guidelines.

## T3

Gate: 3 unit + 15 browser tests passed. No tests skipped, deleted or weakened.

| Requirement / criterion | Assertion evidence | Reverse mapping |
| --- | --- | --- |
| test('PHOTO-04: next wraps from sixth to first', async ({page}) => { | tests/photos/carousel.e2e.cjs:5: `for (let n=2;n<=6;n++) { await page.getByRole('button',{name:'Next highlight',exact:true}).click(); await expect(counter(page)).toHaveText(`0${n} / 06`); }` | Keep: T3 criteria |
| test('PHOTO-04: next wraps from sixth to first', async ({page}) => { | tests/photos/carousel.e2e.cjs:7: `await expect(counter(page)).toHaveText('01 / 06');` | Keep: T3 criteria |
| test('PHOTO-05: previous wraps from first to sixth', async ({page}) => { | tests/photos/carousel.e2e.cjs:11: `await expect(counter(page)).toHaveText('06 / 06');` | Keep: T3 criteria |
| test('PHOTO-06: thumbnail selects matching image and accessible state', async ({page}) => { | tests/photos/carousel.e2e.cjs:15: `await expect(counter(page)).toHaveText('04 / 06');` | Keep: T3 criteria |
| test('PHOTO-06: thumbnail selects matching image and accessible state', async ({page}) => { | tests/photos/carousel.e2e.cjs:16: `await expect(page.locator('[data-photo-slide]').nth(3)).toBeVisible();` | Keep: T3 criteria |
| test('PHOTO-06: thumbnail selects matching image and accessible state', async ({page}) => { | tests/photos/carousel.e2e.cjs:17: `await expect(page.locator('[data-photo-select="3"]')).toHaveAttribute('aria-pressed','true');` | Keep: T3 criteria |
| test('PHOTO-06: thumbnail selects matching image and accessible state', async ({page}) => { | tests/photos/carousel.e2e.cjs:18: `await expect(page.locator('[data-photo-select][aria-pressed="true"]')).toHaveCount(1);` | Keep: T3 criteria |
| test('PHOTO-12: arrow keys operate only with carousel focus', async ({page}) => { | tests/photos/carousel.e2e.cjs:22: `await page.keyboard.press('ArrowRight'); await expect(counter(page)).toHaveText('02 / 06');` | Keep: T3 criteria |
| test('PHOTO-12: arrow keys operate only with carousel focus', async ({page}) => { | tests/photos/carousel.e2e.cjs:23: `await page.keyboard.press('ArrowLeft'); await expect(counter(page)).toHaveText('01 / 06');` | Keep: T3 criteria |
| test('PHOTO-12: arrow keys operate only with carousel focus', async ({page}) => { | tests/photos/carousel.e2e.cjs:25: `await page.keyboard.press('ArrowRight'); await expect(counter(page)).toHaveText('01 / 06');` | Keep: T3 criteria |
| test('PHOTO-07: horizontal swipe of 40px selects once and suppresses opening', async ({page}) => { | tests/photos/carousel.e2e.cjs:33: `await gesture(page,-40,0); await expect(counter(page)).toHaveText('02 / 06');` | Keep: T3 criteria |
| test('PHOTO-07: horizontal swipe of 40px selects once and suppresses opening', async ({page}) => { | tests/photos/carousel.e2e.cjs:35: `await expect(page).toHaveURL(/\/photos\/$/);` | Keep: T3 criteria |
| test('PHOTO-07: horizontal swipe of 40px selects once and suppresses opening', async ({page}) => { | tests/photos/carousel.e2e.cjs:36: `await expect(page.locator('.pswp')).not.toHaveClass(/pswp--open/);` | Keep: T3 criteria |
| test('PHOTO-07: horizontal swipe of 40px selects once and suppresses opening', async ({page}) => { | tests/photos/carousel.e2e.cjs:37: `await gesture(page,40,0); await expect(counter(page)).toHaveText('01 / 06');` | Keep: T3 criteria |
| test('PHOTO-07: vertical and short gestures retain selection', async ({page}) => { | tests/photos/carousel.e2e.cjs:40: `await gesture(page,-50,80); await expect(counter(page)).toHaveText('01 / 06');` | Keep: T3 criteria |
| test('PHOTO-07: vertical and short gestures retain selection', async ({page}) => { | tests/photos/carousel.e2e.cjs:41: `await gesture(page,-39,0); await expect(counter(page)).toHaveText('01 / 06');` | Keep: T3 criteria |
| test('PHOTO-08: no automatic advancement while idle', async ({page}) => { | tests/photos/carousel.e2e.cjs:46: `await expect(counter(page)).toHaveText('01 / 06');` | Keep: T3 criteria |

Adequacy: asserted outcomes reviewed against the approved task and PHOTO requirements. All planned cases present; no speculative cases. Project has no additional test guidelines.

## T4

Gate: build, 3 unit + 20 browser tests, diff check passed. No tests skipped, deleted or weakened.

| Requirement / criterion | Assertion evidence | Reverse mapping |
| --- | --- | --- |
| Task criteria | tests/photos/viewer.e2e.cjs:4: `await expect(page.locator('.pswp')).toHaveClass(/pswp--open/);` | Keep: T4 criteria |
| Task criteria | tests/photos/viewer.e2e.cjs:5: `await expect(page.locator('.pswp__item').nth(1).locator('img.pswp__img').last()).toHaveAttribute('src',src);` | Keep: T4 criteria |
| test('PHOTO-09: archive opens matching photo, keeps navigation and zoom', async ({page}) => { | tests/photos/viewer.e2e.cjs:18: `await expect(page.locator('.pswp__counter')).toHaveText('9 / 17');` | Keep: T4 criteria |
| test('PHOTO-09: archive opens matching photo, keeps navigation and zoom', async ({page}) => { | tests/photos/viewer.e2e.cjs:19: `await expect(page.locator('.pswp__button--zoom')).toBeVisible();` | Keep: T4 criteria |
| test('PHOTO-09: archive opens matching photo, keeps navigation and zoom', async ({page}) => { | tests/photos/viewer.e2e.cjs:21: `await expect(page.locator('.pswp')).toHaveClass(/pswp--zoomed-in/);` | Keep: T4 criteria |
| test('PHOTO-10/13: Escape and close button restore the exact trigger focus', async ({page}) => { | tests/photos/viewer.e2e.cjs:27: `await link.click(); await expect(page.locator('.pswp')).toHaveClass(/pswp--open/);` | Keep: T4 criteria |
| test('PHOTO-10/13: Escape and close button restore the exact trigger focus', async ({page}) => { | tests/photos/viewer.e2e.cjs:29: `await expect(page.locator('.pswp')).not.toHaveClass(/pswp--open/);` | Keep: T4 criteria |
| test('PHOTO-10/13: Escape and close button restore the exact trigger focus', async ({page}) => { | tests/photos/viewer.e2e.cjs:30: `await expect(link).toBeFocused();` | Keep: T4 criteria |
| test('PHOTO-10/13: Escape and close button restore the exact trigger focus', async ({page}) => { | tests/photos/viewer.e2e.cjs:32: `await expect(link).toBeFocused();` | Keep: T4 criteria |
| test('PHOTO-15: reduced motion removes viewer opening/closing transitions', async ({page}) => { | tests/photos/viewer.e2e.cjs:42: `expect(await page.evaluate(() => [viewerOptions.showAnimationDuration,viewerOptions.hideAnimationDuration])).toEqual([0,0]);` | Keep: T4 criteria |
| test('PHOTO-15: reduced motion removes viewer opening/closing transitions', async ({page}) => { | tests/photos/viewer.e2e.cjs:44: `await expect(page.locator('.pswp')).not.toHaveClass(/pswp--open/);` | Keep: T4 criteria |
| test('PHOTO-09: legacy uppercase dimensions are normalized', async ({page}) => { | tests/photos/viewer.e2e.cjs:51: `expect(await page.evaluate(() => [viewerItem.w,viewerItem.h])).toEqual([photos[0].width,photos[0].height]);` | Keep: T4 criteria |

Adequacy: asserted outcomes reviewed against the approved task and PHOTO requirements. All planned cases present; no speculative cases. Project has no additional test guidelines.

## T5

Gate: 26 unit + 20 browser tests, diff check passed. No tests skipped, deleted or weakened.

| Requirement / criterion | Assertion evidence | Reverse mapping |
| --- | --- | --- |
| test('PHOTO-18: select newest twelve regardless of API order',()=>{ | tests/photos/instagram-sync.test.cjs:16: `assert.deepEqual(selected.map(p=>p.id),['15','14','13','12','11','10','9','8','7','6','5','4']);` | Keep: T5 criteria |
| test('PHOTO-18/24: deterministic textual ID tie-break and deduplication',()=>{ | tests/photos/instagram-sync.test.cjs:19: `assert.deepEqual(normalizePosts([post(2),post(10),post(2)]).map(p=>p.id),['10','2']);` | Keep: T5 criteria |
| test('PHOTO-19/20: omit videos and video-cover albums; use first image only',()=>{ | tests/photos/instagram-sync.test.cjs:25: `assert.deepEqual(selected.map(p=>[p.id,p.media_url]),[['3',post(80).media_url]]);` | Keep: T5 criteria |
| test('PHOTO-19/20: omit videos and video-cover albums; use first image only',()=>{ | tests/photos/instagram-sync.test.cjs:26: `assert.throws(()=>normalizePosts([post(4,{media_type:'CAROUSEL_ALBUM'})]));` | Keep: T5 criteria |
| test('PHOTO-23/34: successful empty collection clears old selection and assets',async t=>{ | tests/photos/instagram-sync.test.cjs:31: `assert.equal(result.status,'success');assert.deepEqual(readSnapshot(dir).posts,[]);assert.deepEqual(fs.readdirSync(dir),['feed.json']);` | Keep: T5 criteria |
| test('PHOTO-30: no configuration means no network and no fake posts',async t=>{ | tests/photos/instagram-sync.test.cjs:35: `assert.deepEqual(result,{status:'no_selection',count:0,reason:'configuration'});assert.equal(fs.existsSync(dir),false);` | Keep: T5 criteria |
| test('PHOTO-28/31: complete snapshot contains only public metadata and local image',async t=>{ | tests/photos/instagram-sync.test.cjs:40: `assert.equal(result.status,'success');const feed=readSnapshot(dir);` | Keep: T5 criteria |
| test('PHOTO-28/31: complete snapshot contains only public metadata and local image',async t=>{ | tests/photos/instagram-sync.test.cjs:41: `assert.equal(feed.version,1);assert.equal(feed.username,'insanedriverid');assert.ok(Number.isFinite(Date.parse(feed.updatedAt)));` | Keep: T5 criteria |
| test('PHOTO-28/31: complete snapshot contains only public metadata and local image',async t=>{ | tests/photos/instagram-sync.test.cjs:42: `assert.deepEqual(feed.posts,[{id:'1',permalink:post(1).permalink,timestamp:'2026-09-01T12:00:00.000Z',caption:'Photo 1',image:'/assets/instagram/1.png',alt:'Photo 1'}]);` | Keep: T5 criteria |
| test('PHOTO-28/31: complete snapshot contains only public metadata and local image',async t=>{ | tests/photos/instagram-sync.test.cjs:43: `assert.deepEqual(fs.readFileSync(path.join(dir,'1.png')),png);` | Keep: T5 criteria |
| test('PHOTO-28/31: complete snapshot contains only public metadata and local image',async t=>{ | tests/photos/instagram-sync.test.cjs:44: `assert.equal(calls[0][1].headers.Authorization,`Bearer ${config.token}`);assert.equal(calls[1][1].headers.Authorization,undefined);` | Keep: T5 criteria |
| test('PHOTO-28/31: complete snapshot contains only public metadata and local image',async t=>{ | tests/photos/instagram-sync.test.cjs:45: `assert.equal(calls[0][0].includes(config.token),false);` | Keep: T5 criteria |
| test('PHOTO-28/34: successful replacement removes missing posts and old files',async t=>{ | tests/photos/instagram-sync.test.cjs:49: `assert.deepEqual(readSnapshot(dir).posts.map(p=>p.id),['3']);assert.deepEqual(fs.readdirSync(dir).sort(),['3.png','feed.json']);` | Keep: T5 criteria |
| for(const status of [401,429]) test(`PHOTO-29: HTTP ${status} retains previous bytes`,async t=>{ | tests/photos/instagram-sync.test.cjs:54: `assert.equal(result.status,'retained');assert.deepEqual(files(dir),before);assert.equal(JSON.stringify(result).includes(config.token),false);` | Keep: T5 criteria |
| test('PHOTO-29: request timeout retains previous snapshot',async t=>{ | tests/photos/instagram-sync.test.cjs:59: `assert.equal(result.status,'retained');assert.deepEqual(files(dir),before);` | Keep: T5 criteria |
| test('PHOTO-29: partial image download leaves old manifest and images intact',async t=>{ | tests/photos/instagram-sync.test.cjs:64: `assert.equal(result.status,'retained');assert.deepEqual(files(dir),before);` | Keep: T5 criteria |
| test('PHOTO-29: cyclic cursor is failure and external next URL is never followed',async t=>{ | tests/photos/instagram-sync.test.cjs:69: `assert.equal(result.status,'retained');assert.deepEqual(files(dir),before);assert.ok(calls.every(url=>new URL(url).hostname==='graph.instagram.com'));assert.equal(calls.length,2);` | Keep: T5 criteria |
| for(const limits of [{pages:1},{records:1}]) test(`PHOTO-29: collection limit ${JSON.stringify(limits)} preserves snapshot`,async t=>{ | tests/photos/instagram-sync.test.cjs:74: `assert.equal(result.status,'retained');assert.deepEqual(files(dir),before);` | Keep: T5 criteria |
| test('PHOTO-31: reject unsafe URLs, IDs, timestamps and disguised media',async t=>{ | tests/photos/instagram-sync.test.cjs:77: `for(const extra of [{id:'../bad'},{timestamp:'invalid'},{permalink:'https://evil.example/p/X/'},{media_url:'https://fbcdn.net.evil.example/a.png'},{media_url:'http://scontent.cdninstagram.com/a.png'},{media_url:'https://user:pass@scontent.cdninstagram.com/a.png'}]) assert.throws(()=>normalizePosts([post(1,extra)]));` | Keep: T5 criteria |
| test('PHOTO-31: reject unsafe URLs, IDs, timestamps and disguised media',async t=>{ | tests/photos/instagram-sync.test.cjs:80: `assert.equal(result.status,'retained');assert.deepEqual(files(dir),before);` | Keep: T5 criteria |
| test('PHOTO-29/31: reject external media redirects without leaking bearer credentials',async t=>{ | tests/photos/instagram-sync.test.cjs:85: `assert.equal(result.status,'retained');assert.deepEqual(files(dir),before);assert.equal(calls.length,2);assert.equal(calls[1][1].Authorization,undefined);` | Keep: T5 criteria |
| test('PHOTO-31: captions and summaries cannot echo token or authenticated source URLs',async t=>{ | tests/photos/instagram-sync.test.cjs:90: `assert.equal(output.includes(config.token),false);assert.equal(output.includes('sig=private'),false);assert.equal(output.includes('cdninstagram.com'),false);` | Keep: T5 criteria |
| test('PHOTO-20: adapter resolves first album child on fixed endpoint',async t=>{ | tests/photos/instagram-sync.test.cjs:95: `assert.equal(result.status,'success');assert.equal(readSnapshot(dir).posts[0].id,'7');assert.equal(calls[1].pathname,'/v25.0/7/children');assert.equal(calls[1].searchParams.get('limit'),'1');assert.equal(calls[2].pathname,'/8.png');` | Keep: T5 criteria |
| test('PHOTO-29: oversized download preserves prior snapshot',async t=>{ | tests/photos/instagram-sync.test.cjs:99: `assert.equal(result.status,'retained');assert.deepEqual(files(dir),before);` | Keep: T5 criteria |
| test('PHOTO-30: first request failure returns empty state without broken snapshot',async t=>{ | tests/photos/instagram-sync.test.cjs:103: `assert.equal(result.status,'no_selection');assert.equal(fs.existsSync(dir),false);assert.equal(JSON.stringify(result).includes(config.token),false);` | Keep: T5 criteria |
| test('PHOTO-24: repeated post keeps newest consistent record',()=>{ | tests/photos/instagram-sync.test.cjs:109: `assert.deepEqual(selected.map(p=>[p.id,p.timestamp]),[['1','2026-09-10T00:00:00.000Z'],['2','2026-09-01T12:00:00.000Z']]);` | Keep: T5 criteria |
| test('PHOTO-29: absent credentials retain existing public snapshot',async t=>{ | tests/photos/instagram-sync.test.cjs:114: `assert.equal(result.status,'retained');assert.equal(calls,0);assert.deepEqual(files(dir),before);` | Keep: T5 criteria |
| test('PHOTO-29: total collection deadline preserves previous selection',async t=>{ | tests/photos/instagram-sync.test.cjs:119: `assert.equal(result.status,'retained');assert.deepEqual(files(dir),before);` | Keep: T5 criteria |

Adequacy: asserted outcomes reviewed against the approved task and PHOTO requirements. All planned cases present; no speculative cases. Project has no additional test guidelines.

## T6

Gate: 30 unit + 22 browser tests, diff check passed. No tests skipped, deleted or weakened.

| Requirement / criterion | Assertion evidence | Reverse mapping |
| --- | --- | --- |
| test('PHOTO-18/20/21: real build renders ordered local covers and original permalinks',()=>{ | tests/photos/instagram-render.test.cjs:6: `assert.equal((html.match(/class="photos-instagram-card"/g) /  / []).length,2);` | Keep: T6 criteria |
| test('PHOTO-18/20/21: real build renders ordered local covers and original permalinks',()=>{ | tests/photos/instagram-render.test.cjs:7: `assert.ok(html.indexOf('Fixture2')<html.indexOf('Fixture1'));` | Keep: T6 criteria |
| test('PHOTO-18/20/21: real build renders ordered local covers and original permalinks',()=>{ | tests/photos/instagram-render.test.cjs:8: `assert.match(html,/src="\/assets\/instagram\/2.png"/);assert.match(html,/href="https:\/\/www.instagram.com\/p\/Fixture2\/"/);` | Keep: T6 criteria |
| test('PHOTO-18/20/21: real build renders ordered local covers and original permalinks',()=>{ | tests/photos/instagram-render.test.cjs:9: `assert.match(html,/>On stage with Insane Driver</);assert.match(html,/datetime="2026-09-02T00:00:00.000Z"/);` | Keep: T6 criteria |
| test('PHOTO-23: empty and absent selections render actual profile link',()=>{ | tests/photos/instagram-render.test.cjs:13: `const html=render(feed);assert.match(html,/href="https:\/\/www.instagram.com\/insanedriverid\/"/);assert.doesNotMatch(html,/class="photos-instagram-card"/);` | Keep: T6 criteria |
| test('PHOTO-25: caption and attribute markup are escaped in generated HTML',()=>{ | tests/photos/instagram-render.test.cjs:18: `assert.match(html,/&lt;img src=x onerror=/);assert.doesNotMatch(html,/<img src=x/);assert.doesNotMatch(html,/alt="<img/);assert.match(html,/&amp;/);` | Keep: T6 criteria |
| test('PHOTO-23/31: malformed or unsafe snapshot becomes empty instead of public content',()=>{ | tests/photos/instagram-render.test.cjs:22: `const html=render(feed);assert.doesNotMatch(html,/class="photos-instagram-card"/);assert.match(html,/insanedriverid/);assert.doesNotMatch(html,/secret / \/etc\/passwd/);` | Keep: T6 criteria |
| test('PHOTO-21/23: empty section links directly to the band profile',async({page})=>{ | tests/photos/instagram.e2e.cjs:5: `await expect(page.locator('.photos-instagram a').first()).toHaveAttribute('href','https://www.instagram.com/insanedriverid/');` | Keep: T6 criteria |
| test('PHOTO-21/23: empty section links directly to the band profile',async({page})=>{ | tests/photos/instagram.e2e.cjs:6: `await expect(page.locator('.photos-instagram')).toContainText('@insanedriverid');` | Keep: T6 criteria |
| test('PHOTO-22/25/14: static photo cards work without login or API at all four widths',async({page})=>{ | tests/photos/instagram.e2e.cjs:15: `await expect(cards).toHaveCount(2);` | Keep: T6 criteria |
| test('PHOTO-22/25/14: static photo cards work without login or API at all four widths',async({page})=>{ | tests/photos/instagram.e2e.cjs:16: `await expect(cards.first()).toHaveAttribute('href','https://www.instagram.com/p/Fixture2/');` | Keep: T6 criteria |
| test('PHOTO-22/25/14: static photo cards work without login or API at all four widths',async({page})=>{ | tests/photos/instagram.e2e.cjs:20: `expect(await page.evaluate(()=>window.captionExecuted)).toBeUndefined();` | Keep: T6 criteria |
| test('PHOTO-22/25/14: static photo cards work without login or API at all four widths',async({page})=>{ | tests/photos/instagram.e2e.cjs:24: `expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);` | Keep: T6 criteria |
| test('PHOTO-22/25/14: static photo cards work without login or API at all four widths',async({page})=>{ | tests/photos/instagram.e2e.cjs:25: `await expect(cards.first()).toBeVisible();` | Keep: T6 criteria |
| test('PHOTO-22/25/14: static photo cards work without login or API at all four widths',async({page})=>{ | tests/photos/instagram.e2e.cjs:27: `expect(requests.filter(url=>url.includes('graph.instagram.com'))).toEqual([]);` | Keep: T6 criteria |

Adequacy: asserted outcomes reviewed against the approved task and PHOTO requirements. All planned cases present; no speculative cases. Project has no additional test guidelines.

## T7

Gate: build, 37 unit + 22 browser tests, diff check passed. No tests skipped, deleted or weakened.

| Requirement / criterion | Assertion evidence | Reverse mapping |
| --- | --- | --- |
| test('PHOTO-26/27: push, six-hour schedule and manual dispatch use one pipeline',()=>{ | tests/photos/instagram-workflow.test.cjs:24: `assert.deepEqual(workflow.on.push.branches,['master']);assert.deepEqual(workflow.on.schedule,[{cron:'17 */6 * * *'}]);assert.ok('workflow_dispatch' in workflow.on);` | Keep: T7 criteria |
| test('PHOTO-26/27: push, six-hour schedule and manual dispatch use one pipeline',()=>{ | tests/photos/instagram-workflow.test.cjs:25: `const jobs=Object.values(workflow.jobs);assert.equal(jobs.length,1);` | Keep: T7 criteria |
| test('PHOTO-26/27: push, six-hour schedule and manual dispatch use one pipeline',()=>{ | tests/photos/instagram-workflow.test.cjs:28: `assert.equal(commands.filter(s=>s==='node scripts/sync-instagram.cjs').length,1);` | Keep: T7 criteria |
| test('PHOTO-26/27: push, six-hour schedule and manual dispatch use one pipeline',()=>{ | tests/photos/instagram-workflow.test.cjs:29: `assert.ok(commands.indexOf('node scripts/restore-instagram.cjs')<commands.indexOf('node scripts/sync-instagram.cjs'));` | Keep: T7 criteria |
| test('PHOTO-26/27: push, six-hour schedule and manual dispatch use one pipeline',()=>{ | tests/photos/instagram-workflow.test.cjs:30: `assert.ok(commands.indexOf('node scripts/sync-instagram.cjs')<commands.indexOf('npm run build'));` | Keep: T7 criteria |
| test('PHOTO-26/27: push, six-hour schedule and manual dispatch use one pipeline',()=>{ | tests/photos/instagram-workflow.test.cjs:31: `assert.ok(steps.findIndex(s=>s.run==='npm run build')<steps.findIndex(s=>s.uses?.startsWith('JamesIves/')));` | Keep: T7 criteria |
| test('PHOTO-26/27: push, six-hour schedule and manual dispatch use one pipeline',()=>{ | tests/photos/instagram-workflow.test.cjs:32: `assert.equal(steps.find(s=>s.run==='node scripts/restore-instagram.cjs')['continue-on-error'],undefined);` | Keep: T7 criteria |
| test('PHOTO-31/32: entire production pipeline is serialized and token exists only in sync step',()=>{ | tests/photos/instagram-workflow.test.cjs:36: `assert.equal(workflow.concurrency.group,'pages-production');assert.equal(workflow.concurrency['cancel-in-progress'],false);` | Keep: T7 criteria |
| test('PHOTO-31/32: entire production pipeline is serialized and token exists only in sync step',()=>{ | tests/photos/instagram-workflow.test.cjs:37: `assert.match(job.if,/github.ref == 'refs\/heads\/master'/);` | Keep: T7 criteria |
| test('PHOTO-31/32: entire production pipeline is serialized and token exists only in sync step',()=>{ | tests/photos/instagram-workflow.test.cjs:38: `const steps=job.steps;assert.equal(steps.find(s=>s.uses?.startsWith('actions/checkout@')).with.ref,'master');` | Keep: T7 criteria |
| test('PHOTO-31/32: entire production pipeline is serialized and token exists only in sync step',()=>{ | tests/photos/instagram-workflow.test.cjs:39: `assert.equal(workflow.env,undefined);assert.equal(job.env,undefined);` | Keep: T7 criteria |
| test('PHOTO-31/32: entire production pipeline is serialized and token exists only in sync step',()=>{ | tests/photos/instagram-workflow.test.cjs:40: `assert.equal(steps.filter(s=>JSON.stringify(s).includes('INSTAGRAM_ACCESS_TOKEN')).length,1);` | Keep: T7 criteria |
| test('PHOTO-31/32: entire production pipeline is serialized and token exists only in sync step',()=>{ | tests/photos/instagram-workflow.test.cjs:41: `const sync=steps.find(s=>s.run==='node scripts/sync-instagram.cjs');assert.equal(sync.env.INSTAGRAM_ACCESS_TOKEN,'${{ secrets.INSTAGRAM_ACCESS_TOKEN }}');` | Keep: T7 criteria |
| test('PHOTO-31/32: entire production pipeline is serialized and token exists only in sync step',()=>{ | tests/photos/instagram-workflow.test.cjs:42: `assert.equal(steps.find(s=>s.uses?.startsWith('actions/setup-node@')).with['node-version'],'24');assert.ok(steps.some(s=>s.run==='npm ci'));` | Keep: T7 criteria |
| test('PHOTO-28/29: complete restore works in successive clean checkouts without release code',t=>{ | tests/photos/instagram-workflow.test.cjs:46: `for(const name of ['first','second']) {const cwd=r.checkout(name);const result=restore({cwd});assert.equal(result.status,'restored');assert.deepEqual(readSnapshot(path.join(cwd,'assets/instagram')),snapshot());assert.deepEqual(fs.readFileSync(path.join(cwd,'assets/instagram/2.png')),png);assert.equal(fs.existsSync(path.join(cwd,'never-execute.cjs')),false);}` | Keep: T7 criteria |
| test('PHOTO-30: proven absence of branch or manifest permits bootstrap',t=>{ | tests/photos/instagram-workflow.test.cjs:49: `const r=repo(t,null);assert.equal(restore({cwd:r.checkout('no-manifest')}).status,'bootstrap');` | Keep: T7 criteria |
| test('PHOTO-30: proven absence of branch or manifest permits bootstrap',t=>{ | tests/photos/instagram-workflow.test.cjs:50: `git(r.remote,'branch','-m','master');assert.equal(restore({cwd:r.checkout('no-release')}).status,'bootstrap');` | Keep: T7 criteria |
| test('PHOTO-29: failed recovery exits nonzero before a publication step can run',t=>{ | tests/photos/instagram-workflow.test.cjs:55: `assert.equal(result.status,1);assert.match(result.stderr,/publication stopped/);assert.equal(fs.existsSync(path.join(cwd,'assets/instagram')),false);` | Keep: T7 criteria |
| test('PHOTO-29: restored image bytes survive subsequent API failure and build rendering',async t=>{ | tests/photos/instagram-workflow.test.cjs:60: `assert.equal(result.status,'retained');assert.deepEqual(fs.readFileSync(path.join(dir,'feed.json')),before);assert.deepEqual(fs.readFileSync(path.join(dir,'2.png')),png);` | Keep: T7 criteria |
| test('PHOTO-29: restored image bytes survive subsequent API failure and build rendering',async t=>{ | tests/photos/instagram-workflow.test.cjs:61: `const {render}=require('./instagram-fixture.cjs');assert.match(render(readSnapshot(dir)),/\/assets\/instagram\/2.png/);` | Keep: T7 criteria |
| test('PHOTO-31: corrupted manifest and unexpected executable files fail restoration',t=>{ | tests/photos/instagram-workflow.test.cjs:64: `const r=repo(t,{...snapshot(),version:9});assert.throws(()=>restore({cwd:r.checkout('bad-manifest')}),/restore failed/);` | Keep: T7 criteria |
| test('PHOTO-31: corrupted manifest and unexpected executable files fail restoration',t=>{ | tests/photos/instagram-workflow.test.cjs:66: `assert.throws(()=>restore({cwd:r.checkout('bad-file')}),/restore failed/);` | Keep: T7 criteria |

Adequacy: asserted outcomes reviewed against the approved task and PHOTO requirements. All planned cases present; no speculative cases. Project has no additional test guidelines.

## T8 operational review

| Scenario | Documentation / check | Result |
| --- | --- | --- |
| First use | README.md: Primeiro uso; official account flow, basic permission, user ID, explicit version, secret table and manual activation | Instructions complete; real account and API contract pending administrator validation |
| Local build without secrets | README.md: Desenvolvimento local; loader has no environment or network dependency; build gate below | Verified locally |
| Token recovery | README.md: Expiração, revogação e recuperação; actual expiry from provider, manual secret replacement and manual workflow | Instructions reviewed; no real token used |
| Stopped schedule | README.md: Execução e resultado; UTC schedule, default branch, 60-day inactivity and reactivation | Instructions reviewed against GitHub documentation |
| Deactivation | README.md: Desativação e exclusão explícitas; stop runs, revoke, clean source/output/release and address history/caches | Instructions reviewed; destructive operations not executed |

No product files changed for T8. Meta get-started returned 429 on 2026-09-14. No claim of a successful live account/API test. The tested API version is explicitly a fixture. Local validation and external activation are separate in the README.

## T8

Gate: build, 37 unit + 22 browser tests, diff check passed; five operational scenarios reviewed. No tests skipped, deleted or weakened.

| Requirement / criterion | Assertion evidence | Reverse mapping |
| --- | --- | --- |

Adequacy: asserted outcomes reviewed against the approved task and PHOTO requirements. All planned cases present; no speculative cases. Project has no additional test guidelines.
