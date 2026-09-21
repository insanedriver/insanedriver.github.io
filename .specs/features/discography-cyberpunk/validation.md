# Discography Cyberpunk Validation

**Verdict: PASS** — 46/46 acceptance criteria carry located `file:line` evidence, 166/166 tests green, 10/10 injected mutants killed. Nine precision/partial gaps are recorded below; none blocks the feature.

**Date**: 2026-09-20
**Spec**: `.specs/features/discography-cyberpunk/spec.md`
**Diff range**: `4be24cf..HEAD` (d01c01c) — 14 commits, `ad8d126..d01c01c`
**Verifier**: independent sub-agent (author ≠ verifier), read-only over the real tree

---

## Task Completion

All 13 implementation tasks landed as atomic Conventional Commits, one per task, in the order `tasks.md` prescribes:

| Phase | Tasks | Commits | Status |
| --- | --- | --- | --- |
| 1 Catalog data | 4 | `5cb65dc`, `d952e0b`, `e695f68`, `decee67` | Done |
| 2 Page rendering | 4 | `1803795`, `ba31dda`, `e43a502`, `31c2a88` | Done |
| 3 Behavior | 3 | `707a182`, `0ce2921`, `d17b960` | Done |
| 4 Theme | 2 | `93b102c`, `d01c01c` | Done |

No task is blocked or partial. `assets/css/style.min.css` is committed alongside the `.less` changes as `less/README.md` requires — verified empirically: running `npm run less:build` against the real tree left `git status --porcelain` unchanged, so the committed CSS is byte-identical to the compiler's output.

---

## Spec-Anchored Acceptance Criteria

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| DISC-01 | Every release in the JSON is a card | `tests/discography/markup.e2e.cjs:14` `expect(cards).toHaveCount(albums.length)`; `:15` ids === slugs; `tests/discography/singles.e2e.cjs:13` `toHaveCount(singles.length)`; `tests/discography/discography-data.test.cjs:13` slugs === `['silicon-fortress','insane-driver-deluxe','insane-driver']` | PASS |
| DISC-02 | One anchor per present URL, from the 8 platforms | `tests/discography/markup.e2e.cjs:25-26` `toHaveCount(1)` + `toHaveAttribute('href', album.links[p.key])`; `tests/discography/platforms-data.test.cjs:10-12` registry === the 8 keys | PASS (note G8) |
| DISC-03 | No button for a null URL | `tests/discography/markup.e2e.cjs:28` `toHaveCount(0)`; `:38-39` total anchors === catalog link count | PASS |
| DISC-04 | Spotify + Apple first, `cyber-link-btn--primary` | `tests/discography/markup.e2e.cjs:47` `expect(keys.slice(0,2)).toEqual(['spotify','apple'])`; `:49` `toHaveClass(/cyber-link-btn--primary/)`; `tests/discography/platforms-data.test.cjs:16-17` | PASS |
| DISC-05 | `target="_blank"` and `rel="noopener"` on every platform anchor | `tests/discography/markup.e2e.cjs:63-64` `expect(target).toBe('_blank')` / `expect(rel).toBe('noopener')` over all `[data-disc-link]` (albums + singles) | PASS |
| DISC-06 | Points at the release, never a profile or search page | `tests/discography/markup.e2e.cjs:72` `expect(href).not.toMatch(/\/artist\/\|\/artists\/\|\/search\|\/user\//)`; `tests/discography/discography-data.test.cjs:84` `a.links.spotify.endsWith(a.spotifyId)` | ⚠️ Weak proxy (G6) |
| DISC-07 | JS off → anchors present and clickable | `tests/discography/markup.e2e.cjs:9` `test.use({ javaScriptEnabled: false })`; `:79-80` `toBeVisible()` + href === data | PASS |
| DISC-08 | `.cyber-zone > .cyber-zone-inner` shell, `.cyber-panel` blocks with tab, body, `data-hud`, corners/accent | `tests/discography/markup.e2e.cjs:85` `toHaveCount(1)`; `:87-90` each of `.cyber-panel`, `.cyber-panel-tab`, `.top-accent`, `.corner-tl/tr/bl` === 5; `:92` tabs === `['DISC::INDEX','REL::2021','REL::2018','REL::2016','DISC::SINGLES']`; `:94` `expect(huds[1]).toBe('RELEASE.SILICON-FORTRESS // 11 TRACKS_')`; `tests/discography/theme.e2e.cjs:12-17` palette + fonts | PASS |
| DISC-09 | `DISC::INDEX` panel above releases, counts + one anchor per album | `tests/discography/markup.e2e.cjs:99` `toHaveText('03 RELEASES // 18 SINGLES')`; `:101` links === 3; `:92` tab order puts the index first; `tests/discography/singles.e2e.cjs:62-64` counter === rendered single count | PASS |
| DISC-10 | Activating an index anchor navigates to the card whose `id` is the slug | `tests/discography/markup.e2e.cjs:102-104` hrefs === `#${slug}`; `:15` card ids === slugs | ⚠️ Partial (G3) |
| DISC-11 | Shared LESS file consumed by `#page_band` and `#page_discography` | `less/cyber-links.less:10` `.cyber-links-system()` mixin; `less/band.less:591` and `less/discography.less:43` invoke it; `less/style.less:16` import; `tests/band/cyber-links.e2e.cjs:48-51` discography button `display:flex`, `rgba(10,10,10,0.7)`, hover `rgb(29,185,84)` | PASS |
| DISC-12 | Band page visually unchanged | `tests/band/cyber-links.e2e.cjs:12-15` `rgba(10,10,10,0.7)`, `rgba(0,243,255,0.2)`, `2px`, `uppercase`; `:22-26` name/sub colors + Rajdhani / Share Tech Mono; `:40-41` per-platform hover colors. Independently confirmed: the compiled `#page_band` rules in `assets/css/style.min.css` are identical in count (112), content and sequence at `4be24cf` and at HEAD | PASS |
| DISC-13 | No `.player` / `.iframe-spotify` / `.player-art` on the page; `player.less` kept | `tests/discography/theme.e2e.cjs:23` `toHaveCount(0)` for `.player`, `.iframe-spotify`, `.player-art`, `#player-sf`, `#player-id`; `:29-30` home page still has one `.player-art` with a non-zero `marginLeft`; `less/style.less:11` `@import "player.less"` retained | PASS |
| DISC-14 | <768px → cover stacked above the buttons | `tests/discography/theme.e2e.cjs:46` `expect(art.y + art.height).toBeLessThanOrEqual(links.y + 1)`; `:47` x aligned within 2px; `:56` no horizontal overflow at 375/1280 | PASS (note G9) |
| DISC-15 | `DISC::SINGLES` panel, every single, newest first | `tests/discography/singles.e2e.cjs:13-15` count + slug order === catalog order; `tests/discography/discography-data.test.cjs:89-91` 18 singles, `releaseDate` descending; `tests/discography/markup.e2e.cjs:92` tab `DISC::SINGLES` | PASS |
| DISC-16 | 6 most recent outside any collapsed container | `tests/discography/singles.e2e.cjs:22` `.disc-singles > .disc-single-grid > [data-disc-single]` === 6; `:26` === `singles.slice(0,6)` slugs; `tests/discography/discography-data.test.cjs:96-99` the 2024-25 releases are in the first six | PASS |
| DISC-17 | Remainder inside a `<details>` closed on initial render | `tests/discography/singles.e2e.cjs:21` `toHaveJSProperty('open', false)`; `:23` inner count === 12 | PASS |
| DISC-18 | Summary reveals the rest without JS | `tests/discography/singles.e2e.cjs:8` JS disabled; `:34-37` click summary → `open === true`, 7th visible, its Spotify href === `singles[6].links.spotify` | PASS |
| DISC-19 | Cover, title, year, Spotify + Apple anchors | `tests/discography/singles.e2e.cjs:44-46` src/title/year === data; `:48` href === `single.links[key]`; `:50` `toHaveCount(2)`; `tests/discography/discography-data.test.cjs:104` at least one link | PASS |
| DISC-20 | No preview embed for a single | `tests/discography/singles.e2e.cjs:56-57` `[data-disc-single] [data-disc-preview-btn]` === 0 and `[data-disc-single] iframe` === 0; `tests/discography/discography-data.test.cjs:106` `spotifyId === null` | PASS |
| DISC-21 | PREVIEW button + empty container after the link grid, per album | `tests/discography/preview.e2e.cjs:23` button slugs === albums with a Spotify id; `:25` container count 1 each; `:12` 0 iframes initially; `tests/discography/discography-data.test.cjs:83` `spotifyId === null` iff `links.spotify === null` | ⚠️ Partial (G4) |
| DISC-22 | No iframe created during initial load | `tests/discography/preview.e2e.cjs:12-13` 0 iframes and `expect(spotifyRequests).toEqual([])`; `:16` served HTML after `disc-shell` matches no `<iframe`; `tests/discography/discography-core.test.cjs:8-13` embed URL shape | PASS |
| DISC-23 | Click PREVIEW → iframe for that album's Spotify id in that container | `tests/discography/preview.e2e.cjs:35` `toHaveAttribute('src', 'https://open.spotify.com/embed/album/' + album.spotifyId)`; `tests/discography/discography-core.test.cjs:24` `nextPreviewState(null,'silicon-fortress')` === `{open:'silicon-fortress'}` | PASS |
| DISC-24 | Opening a second preview removes the first iframe | `tests/discography/preview.e2e.cjs:44-46` exactly 1 iframe page-wide, present under the second slug, absent under the first; `tests/discography/discography-core.test.cjs:28` | PASS |
| DISC-25 | Re-click the open album → iframe removed, button closed | `tests/discography/preview.e2e.cjs:56-58` `aria-expanded` `'true'` → `'false'`, 0 iframes; `tests/discography/discography-core.test.cjs:32` `nextPreviewState('silicon-fortress','silicon-fortress')` === `{open:null}` | PASS |
| DISC-26 | Cover + platform buttons stay visible while open | `tests/discography/preview.e2e.cjs:65-68` art visible, Spotify anchor visible with its data href | PASS |
| DISC-27 | `aria-expanded` reflects state; button hidden with no JS | `tests/discography/preview.e2e.cjs:53-57` false → true → false; `:88` JS off → `toBeHidden()` for every preview button | PASS |
| DISC-28 | No Spotify id → no PREVIEW button | `tests/discography/preview.e2e.cjs:23` `expect(slugs).toEqual(withSpotify.map(a => a.slug))`; `tests/discography/discography-core.test.cjs:18-20` `spotifyEmbedUrl(null/''/undefined)` === `null` | ⚠️ Partial (G5) |
| DISC-29 | Tracklist `<details>` closed on initial render | `tests/discography/seo.e2e.cjs:16` `expect(els.map(el => el.open))` === all false; `:40-41` summary click → `open === true`, first row visible, with JS disabled | PASS |
| DISC-30 | Position, title, duration as `m:ss` | `tests/discography/seo.e2e.cjs:29-31` `expect(got).toEqual(album.tracks.map(t => [String(t.position).padStart(2,'0'), t.title, mmss(t.duration)]))`; `tests/discography/discography-data.test.cjs:63-65` sequential position, non-empty title, positive integer duration; `:68` track counts `[11,15,11]` | PASS |
| DISC-31 | One `MusicAlbum` per album with name, datePublished, byArtist, numTracks, image, `MusicRecording` track list with ISO duration | `tests/discography/seo.e2e.cjs:47` one block per album; `:51-56` `@type`, `name`, `datePublished`, `numTracks`, `byArtist.name`, absolute `image` URL; `:74-75` `expect(tracks.map(...)).toEqual(album.tracks.map(t => ['MusicRecording', t.title, t.position, iso(t.duration)]))` | PASS |
| DISC-32 | `sameAs` lists every platform URL of that album | `tests/discography/seo.e2e.cjs:65` `expect(JSON.parse(raw).sameAs).toEqual(expected)` where `expected` is the non-null links in registry order | PASS |
| DISC-33 | Every cover served from `assets/images/releases/` | `tests/discography/seo.e2e.cjs:82` `expect(srcs).toEqual(albums.map(a => '/assets/images/releases/' + a.cover))`; `tests/discography/singles.e2e.cjs:44` same for singles; `tests/discography/discography-data.test.cjs:38` file exists on disk | PASS |
| DISC-34 | Explicit `width`/`height`, `loading="lazy"` on all but the first | `tests/discography/seo.e2e.cjs:89` `expect(attrs[0]).toEqual(['600','600',null])`; `:90` the rest `['600','600','lazy']`; `tests/discography/discography-data.test.cjs:39-40` `coverWidth`/`coverHeight` === 600 | ⚠️ Partial (G2) |
| DISC-35 | `BUY CD` on Silicon Fortress → `/preorder/` | `tests/discography/markup.e2e.cjs:108` `toHaveAttribute('href','/preorder/')`; `tests/discography/discography-data.test.cjs:73` | PASS |
| DISC-36 | `BUY CD` on Insane Driver 2016 → `/store/` | `tests/discography/markup.e2e.cjs:109` `toHaveAttribute('href','/store/')`; `tests/discography/discography-data.test.cjs:74` | PASS |
| DISC-37 | No physical anchor on the deluxe | `tests/discography/markup.e2e.cjs:110-111` `toHaveCount(0)` on the deluxe card and `toHaveCount(2)` page-wide; `tests/discography/discography-data.test.cjs:75` `byCd['insane-driver-deluxe']` === `null` | PASS |
| DISC-38 | `BUY CD` visually distinct from streaming buttons | `tests/discography/theme.e2e.cjs:64-65` `rgb(252,238,10)` background, `rgb(5,5,5)` text; `:66-67` background differs from the Spotify button's | PASS |
| DISC-39 | Push `{event:'release_click', platform, release}` | `tests/discography/tracking.e2e.cjs:17-19` full-object equality for the album card; `:26-28` for a single card with its own slug; `tests/discography/discography-core.test.cjs:41-44` payload + exact key set | PASS |
| DISC-40 | Push without preventing navigation | `tests/discography/tracking.e2e.cjs:39` `expect(defaultPrevented).toBe(false)`; `:40` the event was still pushed once | PASS |
| DISC-41 | Undefined `dataLayer` → created as an array before pushing | `tests/discography/tracking.e2e.cjs:48` `delete window.dataLayer`; `:50` `Array.isArray` true; `:51-53` contents === the single event; `:54` no page errors | PASS |
| DISC-42 | No JS → anchor still navigates | `tests/discography/tracking.e2e.cjs:58` JS disabled; `:63-64` href === data URL and `target="_blank"` | PASS |
| DISC-43 | Bad data fails the build-time data test | `tests/discography/discography-data.test.cjs:21-26` slug/title/year/releaseDate/type; `:32` unique slugs; `:38` cover exists; `:46` exactly the eight platform keys; `:65` positive integer duration | PASS |
| DISC-44 | Blocked embed leaves links and cover usable, no broken-player state | `tests/discography/preview.e2e.cjs:72` `route.abort()` on `**/open.spotify.com/**`; `:76-78` Spotify anchor visible, cover visible, tracklist present | ⚠️ Partial (G7) |
| DISC-45 | Sparse grid without empty cells; ≤6 singles → no `<details>` | `tests/discography/markup.e2e.cjs:117` deluxe anchors === 5 (its linked platforms); `:119` `expect(emptyHrefs).toBe(0)`. Second clause guarded at `discography/index.html:142` `{% if discography.singles.size > 6 %}` but never exercised | ⚠️ Partial (G1) |
| DISC-46 | Non-2xx/3xx URL recorded as `null`, not shipped | `tests/discography/discography-data.test.cjs:54` every non-null link matches `/^https:\/\/\S+$/`; authoring-time check recorded in commit bodies `e695f68` ("All 19 shipped URLs answered 200"; Pandora and the deluxe's YT Music / Bandcamp shipped as `null`) and `decee67` ("All 36 URLs answered 200") | ⚠️ Process evidence (G10) |

**Status**: 46/46 criteria carry `file:line` evidence. 37 clean PASS, 9 flagged partial / weak-proxy / spec-precision (G1-G10 below, G8 and G9 are notes on otherwise-passing ACs).

Independently re-derived data facts, confirming the context handed over rather than trusting it:

- Pandora is `null` on all 21 releases (3 albums + 18 singles) — consistent with the geo-block note.
- `insane-driver-deluxe` has no `ytmusic` and no `bandcamp` link; it ships 5 of 8 platform buttons. Silicon Fortress and Insane Driver 2016 ship 7 each: 19 album anchors total, matching `markup.e2e.cjs:36-38`.
- All 18 singles carry both a Spotify and an Apple Music URL, so `singles.e2e.cjs:50`'s `toHaveCount(2)` is a real assertion, not a vacuous one.

---

## Discrimination Sensor

Isolated scratch: `git worktree add <scratchpad>/sensor HEAD --detach`, mutated there, discarded with `git worktree remove --force`. No `git stash`, no mutation of the real tree.

| # | File:line | Mutation | Gate run | Result |
| --- | --- | --- | --- | --- |
| 1 | `assets/js/discography-core.js:26` | `nextPreviewState` always returns `{open: requested}` (kills the close-on-re-click branch) | `node --test tests/discography/discography-core.test.cjs` | Killed — DISC-25 failed, `actual {open:'silicon-fortress'}` vs `expected {open:null}` |
| 2 | `assets/js/discography.js:62` | Removed `if (openSlug) { close(openSlug); }` (two iframes could coexist) | `npx playwright test tests/discography/preview.e2e.cjs` | Killed — 2 failed (DISC-24, DISC-25/27), 6 passed |
| 3 | `discography/index.html:58,68` | Dropped the `url and` guard so a null link still renders a button | `npx playwright test tests/discography/markup.e2e.cjs` | Killed — 3 failed (DISC-02/03, DISC-03, DISC-45), 8 passed |
| 4 | `discography/index.html:59,69` + `_includes/discography/single-card.liquid:9` | Removed `rel="noopener"` from every platform anchor | `npx playwright test tests/discography/markup.e2e.cjs` | Killed — 1 failed (DISC-05), 10 passed |
| 5 | `discography/index.html:137` | Singles `limit: 6` → `limit: 8` | `npx playwright test tests/discography/singles.e2e.cjs` | Killed — 4 failed (DISC-15, DISC-16/17, DISC-19, DISC-09), 2 passed |
| 6 | `discography/index.html:87` | Added `open` to the tracklist `<details>` | `npx playwright test tests/discography/seo.e2e.cjs` | Killed — 2 failed (both DISC-29), 6 passed |
| 7 | `assets/js/discography.js:49` | `event.preventDefault()` inside the dataLayer click handler | `npx playwright test tests/discography/tracking.e2e.cjs` | Killed — 1 failed (DISC-40), 4 passed |
| 8 | `less/band.less:591` | Removed the `.cyber-links-system();` call, then recompiled the CSS | `npx playwright test tests/band/cyber-links.e2e.cjs` | Killed — 3 failed (all DISC-12), 1 passed |
| 9 | `discography/index.html:113` | JSON-LD duration `PT<m>M<s>S` → `PT<seconds>S` | `npx playwright test tests/discography/seo.e2e.cjs` | Killed — 1 failed (DISC-31 ISO duration), 7 passed |
| 10 | `_includes/discography/single-card.liquid:9` | Hardcoded `data-disc-slug="silicon-fortress"` on single cards (payload-value fault) | `npx playwright test tests/discography/tracking.e2e.cjs` | Killed — 1 failed (DISC-39 single slug), 4 passed |

**Sensor depth**: expanded (10 mutations across data, template, behavior and CSS layers)
**Result**: 10/10 killed — PASS

**Isolation verified**: `git status --porcelain` on the real tree is identical before and after the sensor run — only the untracked `.agent/ .agents/ .claude/ .codex/ .cursor/ .gemini/ .github/skills/ .windsurf/ skills-lock.json`. `git worktree list` shows only the primary worktree. `docs/` remains an untouched dangling submodule pointer; nothing was committed inside it.

---

## Gate Check

- **Gate command**: `npm test` (`test:unit`, then `less:build` + Playwright), plus `npm run test:unit` on its own for the counts
- **Result**: **166 passed, 0 failed, 0 skipped** — 37 unit (`node --test`) + 129 Playwright
- **Test count before this feature** (at `4be24cf`): 92 — 13 unit + 79 Playwright
- **Test count after**: 166
- **Delta**: +74 (24 unit: 7 core + 13 data + 4 platforms; 50 e2e across `tests/discography/*.e2e.cjs` and `tests/band/cyber-links.e2e.cjs`)
- **Skipped**: none
- **Failures**: none
- **Test integrity**: no test was deleted and no assertion weakened; the count only grew. The pre-existing photos and videos suites pass unchanged, so the shared `cyber-zone` / `cyber-panel` CSS touched by this feature caused no cross-page regression.

---

## Code Quality

| Principle | Status |
| --- | --- |
| Minimum code | Pass — three small JS/LESS units plus data and templates; no framework, no build step added |
| Surgical changes | Pass — `less/band.less` loses exactly the extracted block; `less/player.less` is untouched and still imported |
| No scope creep | Pass — `index.html`, `/preorder`, `/store` and `analytics.js` were all left alone, as the Out of Scope table requires |
| No abstractions for single-use code | Pass — `discography-core.js` exposes three pure functions, each consumed by `discography.js` and unit-tested |
| Matches existing patterns | Pass — same UMD wrapper, `data-*` hook naming, `.cyber-zone`/`.cyber-panel` vocabulary and `tests/<area>/*.test.cjs` + `*.e2e.cjs` split as the videos and photos features |
| Spec-anchored outcome check | Pass with 9 flags — see G1-G10 |
| Per-layer coverage | Pass — pure helpers have 1:1 AC tests; the rendered page is covered happy-path, JS-disabled and blocked-embed |
| Every test maps to a spec requirement | Pass — every test title carries its DISC-NN; no unclaimed tests in scope |
| Documented guidelines followed | Pass — `less/README.md` (commit the generated CSS with the `.less`) verified empirically |

---

## Edge Cases

- [x] Missing required field / duplicate slug / missing cover file / unknown platform key / invalid duration → data test fails (`discography-data.test.cjs:19-69`)
- [x] Blocked Spotify embed leaves the cover, links and tracklist usable (`preview.e2e.cjs:71-79`) — the "no broken-player state" half is not asserted (G7)
- [x] Sparse link grid renders no empty cells (`markup.e2e.cjs:114-120`)
- [ ] ≤6 singles → no overflow `<details>`: guarded in the template, never exercised (G1)
- [x] Non-verified URL shipped as `null` (`e695f68`, `decee67` commit bodies; `discography-data.test.cjs:50-57`) — process evidence only (G10)

---

## Ranked Gaps

None blocks the feature. In descending order of the risk they leave behind:

1. **G1 — DISC-45 second clause is unexercised.** "WHEN there are 6 or fewer singles THEN the `<details>` overflow container SHALL NOT be rendered" has no assertion. The guard is real (`discography/index.html:142`), but with 18 singles in the data the false branch never renders, so a regression to `>= 6` or a dropped guard would ship silently. *Fix*: a Liquid-level or fixture test that renders the singles panel from a 6-entry catalog and asserts `[data-disc-singles-more]` count 0.
2. **G2 — DISC-34 does not cover the singles' covers.** `seo.e2e.cjs:85-91` asserts `width`/`height`/`loading` only on `.disc-release-art img` (3 album covers). The 18 `.disc-single-art` images carry the attributes in `_includes/discography/single-card.liquid:2` but only their `src` is asserted (`singles.e2e.cjs:44`). The spec says *every* cover `<img>`. *Fix*: extend the singles assertion to the three attributes.
3. **G3 — DISC-10 is asserted structurally, not behaviorally.** Evidence proves each index href equals `#<slug>` and each card's `id` is that slug, which is the whole mechanism, but no test activates an index link and confirms the browser lands on the card. *Fix*: click one index link and assert the hash and the card's position in the viewport.
4. **G4 — DISC-21's ordering clause is unasserted.** "an empty preview container placed **after** the platform link grid" — existence and emptiness are covered, DOM order is not. *Fix*: one `compareDocumentPosition` assertion between `.disc-links` and `[data-disc-preview]`.
5. **G5 — DISC-28's negative branch is unexercised in the rendered page.** All three albums have a Spotify id, so `preview.e2e.cjs:23` can only confirm the positive set. The template guard `{% if album.spotifyId %}` is covered only indirectly, via the pure `spotifyEmbedUrl(null) === null` test. *Fix*: same fixture approach as G1.
6. **G6 — DISC-06 is a heuristic negative.** `markup.e2e.cjs:72` proves no href *looks like* an artist/search/user URL. It does not prove the href *is* the release. Only Spotify is positively pinned (`discography-data.test.cjs:84` ties the URL to `spotifyId`). A wrong-but-well-formed album id on Tidal, Amazon or YT Music would pass. *Fix*: assert the per-platform deep-link path shape (`/album/`, `/browse/album/`, …) per key.
7. **G7 — DISC-44's "no broken-player state" is unasserted.** The blocked-embed test proves the links survive; it does not assert the page shows no error affordance. Low risk, since the container is simply left holding an iframe that does not load.
8. **G8 — DISC-02 vs the Out of Scope table (spec-precision).** DISC-02 says "one anchor per platform whose URL is present", but the singles template filters on `p.primary` (`_includes/discography/single-card.liquid:8`), matching the Out of Scope decision "Singles link to Spotify and Apple Music only". The two are currently reconciled only by the data — every single's six non-primary links are `null`. Adding, say, a Deezer URL to a single would violate DISC-02 as written, and no test would catch it (`discography-data.test.cjs:104` only requires *at least one* link). *Fix*: amend DISC-02 to scope the full grid to albums, or add a data test asserting singles carry only primary links.
9. **G9 — DISC-14's breakpoint boundary is untested (note).** The spec says "narrower than 768px"; the test exercises 375px. The 767/768 boundary is unverified. Cosmetic risk only.
10. **G10 — DISC-46 is process evidence, not an assertion (spec-precision).** The HTTP check is recorded in prose in the `e695f68` and `decee67` commit bodies; `discography-data.test.cjs:50-57` only pins URL *shape*. That is inherent to a criterion about an authoring-time action, but note one deviation from the literal wording: Pandora ships `null` because it was **unverifiable from Brazil**, not because it returned a non-2xx/3xx status. `design.md:208` states the broader rule actually applied ("anything not verified ships as `null`"); the spec's edge-case wording is narrower than the implemented rule and should be widened to match.

---

## Requirement Traceability Update

| Requirement | Previous | New |
| --- | --- | --- |
| DISC-01..05, DISC-07..09, DISC-11..20, DISC-22..27, DISC-29..33, DISC-35..43 | Implementing | Verified |
| DISC-06, DISC-10, DISC-21, DISC-28, DISC-34, DISC-44, DISC-45, DISC-46 | Implementing | Verified with gap (G1-G7, G10) |

---

## Summary

**Overall**: Ready.

**Spec-anchored check**: 46/46 ACs evidenced, 37 clean, 9 flagged (1 uncovered conditional branch, 5 partial assertions, 3 spec-precision)
**Sensor**: 10/10 mutations killed
**Gate**: 166 passed, 0 failed, 0 skipped (+74 tests)

**What works**: every album and single renders with its real deep links and nothing else; null links produce no button; Spotify and Apple lead with the primary modifier; the whole page works with JavaScript off, including both disclosures; no Spotify request fires until PREVIEW is clicked and only one iframe ever exists; the dataLayer event carries the right platform and slug without touching navigation; the band page's compiled CSS is byte-identical after the extraction.

**Issues found**: G1-G10 above — none blocking. G1 and G2 are the two worth turning into fix tasks; the rest are precision notes.

**Next steps**: route G1 and G2 to an implementer as small test-only fix tasks, and amend the spec text for G8 and G10 so DISC-02 and DISC-46 say what the implementation actually does.
