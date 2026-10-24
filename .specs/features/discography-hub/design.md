# Discography Hub Design

**Spec**: `.specs/features/discography-hub/spec.md`
**Status**: Approved

---

## Architecture Overview

No new data, script or build step. The hub template is rewritten from the same Eleventy data it reads today (`discography`, `catalog`); the release template gains two blocks moved from the hub; the LESS file swaps the index/release-card rules on the hub for card rules.

```mermaid
graph TD
    D[_data/discography.json] --> H[discography/index.html hub]
    C[_data/catalog.js -> lib/catalog.js] -->|links[slug].page, releases[].description| H
    C -->|release pages| R[discography/release.liquid]
    D -->|buyCd, spotifyId via release| R
    R --> J[assets/js/discography.js: preview + release_click]
    L[less/discography.less] --> H
    L --> R
```

`discography.js` already scopes itself to `[data-disc]` and looks up `[data-disc-preview-btn]` / `[data-disc-link]` inside it; `release.liquid` already renders that root and loads the script (`jspath: js/discography`). Moving the markup is enough for HUB-15/16.

---

## Code Reuse Analysis

| Component | Location | How to Use |
| --- | --- | --- |
| BUY CD + PREVIEW markup | `discography/index.html:62-72` | Moved verbatim into `release.liquid`, `album.` → `release.` |
| Preview + tracking JS | `assets/js/discography.js` | Unchanged |
| Release description | `catalog.releases[].description` (`lib/catalog.js:160`) | Looked up by slug in the hub loop, same loop pattern as `release.liquid`'s `catalog.songs` lookup |
| Card destinations | `catalog.links[slug].page` | Same source as today's cover/title links (keeps IDX-01/02) |
| Panel chrome | `.cyber-panel` / `.cyber-panel-tab` / corners | Unchanged |
| Card look | `.disc-single`, `.song-nav-link` (clipped corner, `#294149` border, cyan hover) | Same visual vocabulary for both card kinds |
| Counter, eyebrow, accent | `.disc-counter`, `.disc-eyebrow`, `.disc-accent` | Unchanged |

---

## Components

### Hub hero (`discography/index.html`, first panel)

- Tab `DISC::INDEX`, HUD `CATALOG.INDEX // ONLINE_` kept.
- `section.disc-hero` with the existing `.disc-section-heading` (eyebrow `INSANE DRIVER / CATALOG`, `h2` "Discography." and `[data-disc-counter]`). The `ul.disc-index-list` is removed.

### Album card (`discography/index.html`, panel `DISC::ALBUMS`)

```html
<ul class="disc-album-grid" data-disc-albums>
  <li>
    <a class="disc-album-card" href="{{ catalog.links[album.slug].page }}" data-disc-album="{{ album.slug }}">
      <img class="disc-album-art" src="/assets/images/releases/{{ album.cover }}" width height alt="{{ title }} cover" [loading="lazy" except first] decoding="async">
      <span class="disc-eyebrow">ALBUM|DELUXE EDITION // {{ year }}</span>
      <span class="disc-album-title">{{ title }}</span>
      <span class="disc-release-meta">{{ n }} tracks</span>
      <span class="disc-album-description" data-disc-album-description>{{ description }}</span>
      <span class="disc-album-cta">OPEN RELEASE <span aria-hidden="true">→</span></span>
    </a>
  </li>
</ul>
```

Block content in `<a>` is valid HTML5; children are `<span>` with `display: block` so the anchor stays phrasing-safe. One panel holds all three cards (instead of one panel per album).

### Single card (`_includes/discography/single-card.liquid`)

```html
<li><a class="disc-single" href="{{ catalog.links[single.slug].page }}" data-disc-single="{{ single.slug }}">
  <img class="disc-single-art" ... loading="lazy">
  <span class="disc-single-title">…</span><span class="disc-single-year">…</span>
</a></li>
```

The `LOAD MORE` `<details>` goes; the hub loops all singles into one `ul.disc-single-grid`.

### Hub JSON-LD

One `<script type="application/ld+json">` after the panels:

```json
{ "@context": "https://schema.org", "@type": "CollectionPage", "name": "Insane Driver Discography",
  "url": "https://insanedriver.com.br/discography/",
  "mainEntity": { "@type": "ItemList", "numberOfItems": 21,
    "itemListElement": [ { "@type": "ListItem", "position": 1, "name": "Silicon Fortress", "url": "https://insanedriver.com.br/discography/silicon-fortress/" }, … ] } }
```

Albums then singles, the same order as the cards. Strings go through `jsonify`, as in `release.liquid`.

### Release page additions (`discography/release.liquid`)

After `{% include 'discography/links' %}` and before the tracklist section: the `a.disc-buy` (if `release.buyCd`), then the hidden `button.disc-preview-btn` + empty `div.disc-preview` (if `release.spotifyId`). The ids stay `disc-preview-<slug>`.

### Styles (`less/discography.less`)

- `.disc-album-grid`: grid, 1 column; `repeat(3, 1fr)` from 992px.
- `.disc-album-card`: flex column, `#080e16` background, `#294149` border, clipped corner, hover/focus border `#00f3ff`; cover full width.
- `.disc-album-description`: `display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden`.
- `.disc-album-cta`: Share Tech Mono, cyan, pushed to the bottom (`margin-top: auto`).
- `.disc-single` becomes the anchor; drop `.disc-single-links`, `.disc-single-link`, `.disc-singles-more`, `.disc-index-*` and `.disc-single-page`. The `.disc-single-links` rule under `.song-also-item` stays (song pages use it).
- Focus: the existing `.disc-shell a:focus-visible` outline covers the cards (HUB-22).

---

## Error Handling Strategy

| Error Scenario | Handling | User Impact |
| --- | --- | --- |
| Spotify embed fails | Unchanged JS; links and BUY CD remain plain anchors | Preview area stays empty, everything else works |
| JavaScript disabled | Cards are plain anchors; PREVIEW stays `hidden` | Hub fully navigable; no preview |
| Release without description | `lib/catalog.js:160` always supplies a fallback string | Card never shows an empty description |

---

## Risks & Concerns

| Concern | Location (file:line) | Impact | Mitigation |
| --- | --- | --- | --- |
| Many existing e2e tests assert the old hub (DISC-01..45, IDX-01..04, HOME-11/32) | `tests/discography/*.e2e.cjs`, `tests/seo/index-links.e2e.cjs`, `tests/home/panels-style.e2e.cjs:68` | Suite goes red as soon as the hub changes | Each task rewrites or relocates the tests for the part it changes; superseded ACs are amended in the old specs (T6) |
| `release.liquid` serves albums and singles | `discography/release.liquid` | Preview/BUY CD could leak onto singles | HUB-14 tests a single page and the Deluxe page (L-037, L-024: one test per missing field) |
| Hub description lookup loops `catalog.releases` per album | `discography/index.html` | 3 × 21 iterations at build time | Negligible |

---

## Tech Decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Description source | Liquid lookup in `catalog.releases` | Avoids changing `lib/catalog.js` and its tests for a display-only field |
| Album panels | One panel `DISC::ALBUMS` for the three cards | A panel per card would put the grid's columns in separate panels |
| ItemList order | Albums then singles (DOM order) | HUB-18 ties positions to the card order |
