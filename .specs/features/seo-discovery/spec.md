# SEO Discovery Specification

## Problem Statement

The site ranks first for "insane driver" but is invisible to people searching for new hard rock and metal. It has no sitemap, an empty `robots.txt`, relative canonicals, Open Graph only on the home page, repeated generic descriptions, and one discography page with no page per release or per song, so no song title or lyric can match a search. The band has lyrics for 20 songs plus two instrumentals and per-song stories on Bandcamp that the site does not publish.

## Goals

- [ ] Every indexable page is listed in `/sitemap.xml`, has an absolute canonical, a unique description, and Open Graph and Twitter Card tags.
- [ ] Every page that describes the band names the genres hard rock, heavy metal and metalcore, the origin São Paulo, Brazil, and the line "For fans of Alter Bridge, Killswitch Engage and Avenged Sevenfold".
- [ ] 22 song pages (20 with lyrics, 2 instrumentals) and release pages give Google one indexable URL per song and per album.
- [ ] Google Search Console shows impressions for queries that do not contain "insane driver" within 90 days of deploy (measured by the band, outside this repo).

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Portuguese or any other language version, `hreflang` | User decision: English only now. URLs leave room for `/pt/` later. |
| Blog, news or editorial pages | User decision: nothing on the release radar to write about. |
| Off-site work (Search Console sitemap submit, Spotify for Artists, Bandcamp and YouTube tags, Wikidata, MusicBrainz) | Not code. Delivered as a separate checklist at the end of the feature. |
| `/dates/` widget upgrade and moving `/dates/` onto `base.html` | Deferred to its own feature by `newsletter-bandsintown`. This feature only fixes its `<head>`. |
| Per-track streaming links | `discography.json` has links per release, not per track. Song pages link to the album's platforms. |
| Removing the `meta keywords` tag | Google ignores it; removing it changes nothing. |
| Changing any existing URL | Constraint: existing rankings stay intact. |
| Reworking the `/reward/*` pages | Campaign leftovers; they are only kept out of the sitemap. |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Genres | Hard rock, heavy metal, metalcore, in that order, everywhere genres are named (copy and JSON-LD `genre`). | User decision during grilling. | y |
| "For fans of" bands | Alter Bridge, Killswitch Engage, Avenged Sevenfold. | User decision during grilling. | y |
| Language | English only; `lang="en"` stays. English URLs stay at the root. | User decision during grilling. | y |
| Song page URL | `/discography/<album-slug>/<song-slug>/` where the album is the studio album the song first appeared on (`insane-driver` or `silicon-fortress`) and `<song-slug>` is the kebab-case title (`faceless-demons`, `back-to-1994`). | User decision during grilling (Q11/Q14). | y |
| Which releases get a release page | The 3 albums, plus only the singles that do not fold into a song page: `waiting-for-you`, `the-sun-will-rise`, `today-is-sunday-eder-franco`, `change-live`. The other 14 singles appear as "Also released as" on their song page. URL: `/discography/<release-slug>/`. | Grilling Q14 said versions and same-name singles get no page of their own and listed these 4 as single-only; Q10 had mentioned 18 single pages. 14 single pages would duplicate the song pages with thinner content, so Q14 wins. | y |
| Single-to-song mapping | A single folds into the song whose title equals the single title with a trailing `(Acoustic)` removed: `keep-away` and `keep-away-acoustic` → Keep Away; `fallen-dreams-acoustic` → Fallen Dreams; `tide-of-fears` and `tide-of-fears-acoustic` → Tide of Fears; `insane-driver-single` → Insane Driver (song); `silicon-fortress-single` → Silicon Fortress (song); same-title singles for the other Silicon Fortress songs and `firstly-my-breakfast`. `today-is-sunday-eder-franco` and `change-live` keep their own page and link to the Today Is Sunday and Change song pages. | Follows the Q14 list; the Eder Franco and live versions are distinct recordings. | y |
| Deluxe Edition tracks | `insane-driver-deluxe` gets a release page. Its tracks link to the song pages of the base album; `(Deluxe Version)` and `(Acoustic Version)` suffixes are stripped to find the song. | User decision (Q14). | y |
| Lyrics source | The 21 `.docx` files (20 lyrics + Back to 1994 marked instrumental) under `assets/lyrics/` are converted once into one Markdown file per song under `_data/` (title line and `Tema:` line removed, section labels like `[Verse 1]` kept). The originals and the PDFs are moved out of the repo to `../lyrics-originals/` (sibling of the project folder); the `~$` Word lock files are deleted. | User decision (Q13). Eleventy passthrough-copies all of `assets/`, so leaving them would publish them. | y |
| Portuguese translations in the lyric sheets | Every docx holds the English lyrics followed by a Portuguese translation. The English part goes to `_data/lyrics/<album>/<song>.txt` (rendered); the translation goes to `<song>.pt.txt` (stored only, never read by the catalog). Plain section labels (`Chorus II:`, `Verse 1:`, `Refrão:`) are normalized to `[Chorus 2]`, `[Verse 1]`, `[Refrão]` in both files; Roman numerals become Arabic. | User decision during Execute (T10, option C): the pages stay English-only and the translation is kept for a later `/pt/`. | y |
| Instrumentals | Endless Path (no lyrics file) and Back to 1994 (file says `INSTRUMENTAL`) show "Instrumental" instead of lyrics. | User confirmed Endless Path is instrumental; the Back to 1994 file says so. | y |
| "About the song" text | Written by Claude in English, 2–3 sentences, rewritten from the Bandcamp description plus the `Tema:` line, never copied verbatim. Present for the 10 Silicon Fortress songs with a Bandcamp text (all but Back to 1994) and Buried Thoughts. Other songs have no About block until the band supplies one. The band reviews every text in the PR. | User decision (Q15, Q17). Verbatim copies would compete with Bandcamp as duplicate content. | y |
| Album and bio copy | Claude drafts 2–4 sentences per album and a reworked bio; singles with a page get a templated sentence. The band reviews in the PR. | User decision (Q10). | y |
| Video on song page | When `_data/videos.json` has an entry whose `slug` equals the song slug, the song page shows a facade (thumbnail + play button). The YouTube iframe is created only on click. | User decision (Q18). | y |
| `VideoObject` upload date | `uploadDate` is added to each `videos.json` entry, read from the public YouTube watch page during implementation. A video whose date cannot be found gets no `VideoObject`. | Google requires `uploadDate` for video rich results; inventing a date is worse than omitting the block. | y |
| Page titles | Home: `Insane Driver – Hard Rock & Heavy Metal Band from Brazil`. Song: `<Song> Lyrics – Insane Driver`. Album: `<Album> (<year>) – Insane Driver Album`. Single: `<Single> (<year>) – Insane Driver Single`. Other pages keep `<page_title> - Insane Driver Official Website`. | Song and album titles match how people search ("<song> lyrics"); the home title carries the genres while keeping the brand first. | y |
| Description length | Every description is 50–160 characters and unique across the site. The fixed prefix "The official website of the brazilian metal band Insane Driver." is removed from the template; each page's `page_description` is used whole. | Google truncates near 160 characters; the prefix made every description start the same. | y |
| `/pre-save/` | Fix the nested `<!DOCTYPE>`/`<html>`; set `page_robots: noindex, follow`; leave it out of the sitemap. | 2021 campaign page with a description copied from `/contact/`; nothing to rank for. | y |
| `/dates/` | Only its `<head>` changes (absolute canonical, unique description, OG/Twitter). It is listed in the sitemap. | Layout migration is deferred (see Out of Scope). | y |
| Sitemap contents | Every built HTML page except: pages whose robots value contains `noindex` or `nofollow`, `/preorder/` (redirect), `/reward/*`, `/pre-save/`, and the `google*.html` verification files. | Only pages worth ranking go in. | y |
| `MusicGroup` JSON-LD | The existing block on the home page is updated (genres, São Paulo location, `open.spotify.com` artist URL, Bandcamp added to `sameAs`) and the same block is also emitted on `/band/`. | It already exists on the home page with `genre: ["Metal","Hard Rock"]` and `foundingLocation` Brazil. | y |
| Footer social links | Spotify link moved to open.spotify.com; Bandcamp added with an inline SVG icon (FA 4.4 has no Bandcamp glyph); HOME-52 expects 6 footer links | User decision during Execute (T8): keep the footer as the sameAs source of truth | y |
| Existing `/discography/` `MusicAlbum` blocks | Kept unchanged (DISC-31, DISC-32 still pass). | No regression on the existing spec. | y |
| `/band/` overflow at 320px | The 320px no-overflow edge case also covers `/band/`: the `.row` gutters inside `.band-container` are zeroed, as on `/newsletter/` (T22). The 6 footer icons may wrap onto two lines at 320px. | User decision during Execute (T22). | y |
| `og:image` | Release and song pages use the release cover (`/assets/images/releases/<cover>`); other pages use `/assets/images/home/hero-1280.jpg`. | Covers are the most recognisable share image. | y |

**Open questions:** none - all resolved or logged above. All rows confirmed by the user on 2026-10-18.

**Implicit-requirement dimensions sweep:**

| Dimension | Resolution |
| --------- | ---------- |
| Input validation & bounds | SEO-07 (description length), LYR-04 (data integrity at build). |
| Failure / partial-failure states | LYR-05: a song with no lyrics file and not marked instrumental fails the build. |
| Idempotency / retry / duplicate handling | SEO-08 (unique descriptions), SEO-09 (unique titles), SONG-02 (one page per song). |
| Auth boundaries & rate limits | N/A because the site is static and public. |
| Concurrency / ordering | N/A because pages are generated at build time. |
| Data lifecycle / expiry | N/A because lyrics and releases are permanent catalogue data. |
| Observability | N/A because measurement happens in Google Search Console (off-site checklist); no new tracking events. |
| External-dependency failure | SONG-14: YouTube is only contacted after a click; the page stays complete without it. |
| State-transition integrity | SONG-13: facade → player is a single one-way transition. |

---

## User Stories

### P1: Search engines can crawl and understand every page ⭐ MVP

**User Story**: As a search engine, I want a sitemap, robots rules, absolute canonicals and unique metadata so that I index every page under its own URL and know what it is about.

**Why P1**: Nothing else ranks if the pages are not discovered and described.

**Acceptance Criteria**:

1. **SEO-01** — The build SHALL produce `/sitemap.xml`, a valid sitemap XML whose `<loc>` entries are absolute `https://insanedriver.com.br/...` URLs ending in `/`.
2. **SEO-02** — The sitemap SHALL list every built HTML page except pages whose robots value contains `noindex` or `nofollow`, `/preorder/`, `/reward/*`, `/pre-save/` and the `google*.html` files.
3. **SEO-03** — `/robots.txt` SHALL contain `User-agent: *`, `Allow: /` and `Sitemap: https://insanedriver.com.br/sitemap.xml`.
4. **SEO-04** — Every page in the sitemap SHALL have exactly one `<link rel="canonical">` whose `href` equals its own sitemap `<loc>`.
5. **SEO-05** — Every page in the sitemap SHALL have `og:type`, `og:title`, `og:description`, `og:url` (equal to the canonical), `og:image` (absolute URL), `twitter:card` = `summary_large_image` and `twitter:site` = `@insanedriverid`.
6. **SEO-06** — Every page in the sitemap SHALL have exactly one `<meta name="description">`.
7. **SEO-07** — Every description SHALL be between 50 and 160 characters long.
8. **SEO-08** — No two pages in the sitemap SHALL share the same description.
9. **SEO-09** — No two pages in the sitemap SHALL share the same `<title>`.
10. **SEO-10** — `/pre-save/` SHALL contain exactly one `<!DOCTYPE>` and one `<html>` element and SHALL have `<meta name="robots" content="noindex, follow">`.
11. **SEO-11** — The home page `<title>` SHALL be `Insane Driver – Hard Rock & Heavy Metal Band from Brazil`.

**Independent Test**: Build the site, parse `docs/sitemap.xml` and `docs/robots.txt`, and check every listed page's head.

---

### P1: The band's genre and audience are explicit ⭐ MVP

**User Story**: As a listener searching for new hard rock or metal, I want the band's pages to say what it sounds like and who it is for so that a search for my genre or favourite bands can lead me here.

**Why P1**: Genre and "bands like" queries are the main discovery searches this feature targets.

**Acceptance Criteria**:

1. **GEN-01** — The `MusicGroup` JSON-LD on `/` and `/band/` SHALL have `genre` equal to `["Hard Rock", "Heavy Metal", "Metalcore"]`.
2. **GEN-02** — The `MusicGroup` JSON-LD SHALL have `foundingLocation` of type `Place` with `name` `São Paulo, Brazil`.
3. **GEN-03** — The `MusicGroup` `sameAs` SHALL contain `https://open.spotify.com/artist/2ye4AQnKI7zNyOnuLGHaaE`, `https://www.youtube.com/user/insanedriverofficial`, `https://www.instagram.com/insanedriverid/`, `https://facebook.com/insanedriverid`, `https://twitter.com/insanedriverid` and `https://insanedriverid.bandcamp.com/`.
4. **GEN-04** — The `/band/` bio text SHALL contain the words `hard rock`, `heavy metal`, `metalcore` and `São Paulo, Brazil` (case-insensitive).
5. **GEN-05** — `/`, `/band/`, every release page and every song page SHALL show the visible text `For fans of Alter Bridge, Killswitch Engage and Avenged Sevenfold`.
6. **GEN-06** — The descriptions of `/` and `/band/` SHALL each contain `hard rock` and `Brazil` (case-insensitive).

**Independent Test**: Build, open `/` and `/band/`, parse the JSON-LD and read the bio and the "For fans of" line.

---

### P1: Every song has its own lyrics page ⭐ MVP

**User Story**: As someone who heard an Insane Driver song or searches for its lyrics, I want a page per song with its lyrics and story so that I find the song and the band behind it.

**Why P1**: Song-title and lyrics queries are the most reachable long-tail searches for a small band.

**Acceptance Criteria**:

1. **SONG-01** — The build SHALL produce one page per unique song of the albums `insane-driver` and `silicon-fortress` (22 songs: 11 + 11) at `/discography/<album-slug>/<song-slug>/`.
2. **SONG-02** — No song SHALL have more than one page; deluxe, acoustic, live and single versions SHALL NOT get a song page.
3. **SONG-03** — Each song page SHALL have one `<h1>` with the song title and a link to its album's release page.
4. **SONG-04** — WHERE the song has lyrics, the song page SHALL show the full lyrics with one visible heading per section label (`Verse 1`, `Chorus`, ...) and the line breaks of the source.
5. **SONG-05** — WHERE the song is instrumental (Endless Path, Back to 1994), the song page SHALL show `Instrumental` in place of lyrics.
6. **SONG-06** — WHERE the song has an About text, the song page SHALL show it under the heading `About the song`.
7. **SONG-07** — The song page SHALL show the streaming links of its album, using the platforms in `_data/platforms.json` that have a URL.
8. **SONG-08** — WHERE singles or the deluxe edition fold into the song, the song page SHALL list them under `Also released as` with release title, year, and that release's own streaming links or page link.
9. **SONG-09** — Each song page SHALL have one `MusicRecording` JSON-LD block with `name`, `byArtist` (Insane Driver), `inAlbum` (album name and URL), `duration` (ISO 8601, from the album tracklist) and `recordingOf` a `MusicComposition` whose `lyrics.text` equals the page's lyrics text when the song has lyrics.
10. **SONG-10** — Each song page SHALL link to the previous and next track of its album, when they exist.
11. **SONG-11** — WHERE `_data/videos.json` has an entry whose `slug` equals the song slug, the song page SHALL show a video facade: a button with the YouTube thumbnail `https://i.ytimg.com/vi/<id>/hqdefault.jpg` and an accessible name containing the video title.
12. **SONG-12** — WHILE the facade has not been activated, the song page SHALL contain no `iframe` and SHALL make no request to `youtube.com` or `youtube-nocookie.com`.
13. **SONG-13** — WHEN the visitor activates the facade THEN the page SHALL replace it with a YouTube embed iframe for that video id with autoplay.
14. **SONG-14** — IF JavaScript is unavailable THEN the facade SHALL be a link to `https://www.youtube.com/watch?v=<id>`.
15. **SONG-15** — WHERE the song shows a video and the video has an `uploadDate`, the song page SHALL have a `VideoObject` JSON-LD block with `name`, `thumbnailUrl`, `uploadDate` and `embedUrl`.

**Independent Test**: Build, open `/discography/silicon-fortress/faceless-demons/`, check the lyrics, About, links and JSON-LD; open `/discography/silicon-fortress/back-to-1994/` and see `Instrumental`; click a video facade on `/discography/silicon-fortress/ghosts/`.

---

### P1: Lyrics come from the band's files and nothing private is published ⭐ MVP

**User Story**: As the band, I want the lyrics on the site to match our files and our working documents to stay private so that the pages are accurate and only the text we chose is public.

**Why P1**: The song pages depend on this data; the docx and PDF originals would otherwise be published by the passthrough copy.

**Acceptance Criteria**:

1. **LYR-01** — The repository SHALL contain one English lyrics file `<song>.txt` per song with lyrics (20 songs), whose text equals the English part of the source docx with the title line and the `Tema:` line removed and section labels normalized to `[Label N]`; the Portuguese translation SHALL be stored as `<song>.pt.txt` and SHALL NOT appear on any page.
2. **LYR-02** — The built site SHALL contain no `.docx` or `.pdf` file under `assets/lyrics/`, and the repository SHALL contain no `assets/lyrics/` directory.
3. **LYR-03** — The repository SHALL contain no file whose name starts with `~$`.
4. **LYR-04** — Every song in the song data SHALL reference an album slug and a track title that exist in `_data/discography.json`.
5. **LYR-05** — IF a song is neither marked instrumental nor has a lyrics file THEN the build SHALL fail with an error naming the song.

**Independent Test**: Run the unit tests over the song data and lyrics files; build and list `docs/assets/`.

---

### P1: Every album has its own page ⭐ MVP

**User Story**: As a listener who found one song, I want an album page with its story, tracklist and streaming links so that I keep listening.

**Why P1**: Album pages are the hub that links song pages together and rank for album-name searches.

**Acceptance Criteria**:

1. **REL-01** — The build SHALL produce a release page at `/discography/<slug>/` for `silicon-fortress`, `insane-driver`, `insane-driver-deluxe`, `waiting-for-you`, `the-sun-will-rise`, `today-is-sunday-eder-franco` and `change-live`, and for no other release.
2. **REL-02** — Each release page SHALL have one `<h1>` with the release title, the cover image with `alt` `<title> cover`, the release year and type, and a description paragraph.
3. **REL-03** — Each album release page SHALL list every track in order, each linking to its song page.
4. **REL-04** — Each release page SHALL show the streaming links of the release that have a URL.
5. **REL-05** — Each album release page SHALL have one `MusicAlbum` JSON-LD block with `name`, `datePublished`, `numTracks`, `byArtist`, `image`, `genre` and `track` entries whose `url` points to the song pages.
6. **REL-06** — The `/discography/today-is-sunday-eder-franco/` and `/discography/change-live/` release pages SHALL link to the Today Is Sunday and Change song pages.

**Independent Test**: Build, open `/discography/silicon-fortress/` and follow a track link to its song page.

---

### P2: The discography index leads to the new pages

**User Story**: As a visitor on `/discography/`, I want to open a release's own page so that I can read more about it.

**Why P2**: Internal links help crawlers reach the new pages, but the sitemap already lists them.

**Acceptance Criteria**:

1. **IDX-01** — On `/discography/`, the title and the cover of every album SHALL link to that album's release page.
2. **IDX-02** — On `/discography/`, every single SHALL link to its own release page when it has one, otherwise to the song page it folds into.
3. **IDX-03** — On `/discography/`, every tracklist row SHALL link to its song page.
4. **IDX-04** — The existing `/discography/` tests (DISC-*) SHALL keep passing.

**Independent Test**: Open `/discography/`, click an album title, a single and a track row.

---

### P3: Breadcrumbs

**User Story**: As a searcher, I want the search result to show the page's place in the site so that I understand what I am opening.

**Why P3**: Small display gain in results; not needed for indexing.

**Acceptance Criteria**:

1. **CRUMB-01** — Each release page and song page SHALL have a `BreadcrumbList` JSON-LD block (`Discography` → album → song) with absolute URLs.

---

## Edge Cases

- WHEN a song has no About text (the 2016 songs except Buried Thoughts, and Back to 1994) THEN the song page SHALL omit the `About the song` heading entirely.
- WHEN a song is the first or last track of its album THEN the song page SHALL omit the missing previous or next link.
- IF a release has no streaming link for a platform (`null`) THEN its page SHALL omit that platform.
- WHEN a song has no matching video THEN the song page SHALL contain no video facade and no `VideoObject` block.
- WHILE the viewport is 320px wide, release and song pages SHALL have no horizontal overflow.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| SEO-01 | P1: Crawl and understand | T3 | Implementing |
| SEO-02 | P1: Crawl and understand | T1, T3 | Implementing |
| SEO-03 | P1: Crawl and understand | T2 | Implementing |
| SEO-04 | P1: Crawl and understand | T4, T5 | Implementing |
| SEO-05 | P1: Crawl and understand | T4, T5 | Implementing |
| SEO-06 | P1: Crawl and understand | T4, T5 | Implementing |
| SEO-07 | P1: Crawl and understand | T7 | Implementing |
| SEO-08 | P1: Crawl and understand | T7 | Implementing |
| SEO-09 | P1: Crawl and understand | T7 | Implementing |
| SEO-10 | P1: Crawl and understand | T6 | Implementing |
| SEO-11 | P1: Crawl and understand | T7 | Implementing |
| GEN-01 | P1: Genre and audience | T8 | Implementing |
| GEN-02 | P1: Genre and audience | T8 | Implementing |
| GEN-03 | P1: Genre and audience | T8 | Implementing |
| GEN-04 | P1: Genre and audience | T9 | Implementing |
| GEN-05 | P1: Genre and audience | T9, T16 | Implementing |
| GEN-06 | P1: Genre and audience | T7 | Implementing |
| SONG-01 | P1: Song pages | T13, T14 | Implementing |
| SONG-02 | P1: Song pages | T13 | Implementing |
| SONG-03 | P1: Song pages | Design | Pending |
| SONG-04 | P1: Song pages | Design | Pending |
| SONG-05 | P1: Song pages | Design | Pending |
| SONG-06 | P1: Song pages | T11 | Implementing |
| SONG-07 | P1: Song pages | Design | Pending |
| SONG-08 | P1: Song pages | T13 | Implementing |
| SONG-09 | P1: Song pages | Design | Pending |
| SONG-10 | P1: Song pages | T13 | Implementing |
| SONG-11 | P1: Song pages | Design | Pending |
| SONG-12 | P1: Song pages | Design | Pending |
| SONG-13 | P1: Song pages | Design | Pending |
| SONG-14 | P1: Song pages | Design | Pending |
| SONG-15 | P1: Song pages | T12 | Implementing |
| LYR-01 | P1: Lyrics data | T10 | Implementing |
| LYR-02 | P1: Lyrics data | T10 | Implementing |
| LYR-03 | P1: Lyrics data | T10 | Implementing |
| LYR-04 | P1: Lyrics data | T11, T13 | Implementing |
| LYR-05 | P1: Lyrics data | T13 | Implementing |
| REL-01 | P1: Release pages | T13, T14, T16 | Implementing |
| REL-02 | P1: Release pages | T16 | Implementing |
| REL-03 | P1: Release pages | T16 | Implementing |
| REL-04 | P1: Release pages | T16 | Implementing |
| REL-05 | P1: Release pages | T16 | Implementing |
| REL-06 | P1: Release pages | T16 | Implementing |
| IDX-01 | P2: Discography index | Design | Pending |
| IDX-02 | P2: Discography index | Design | Pending |
| IDX-03 | P2: Discography index | Design | Pending |
| IDX-04 | P2: Discography index | T15 | Implementing |
| CRUMB-01 | P3: Breadcrumbs | Design | Pending |

**Coverage:** 48 total, 0 mapped to tasks, 48 unmapped ⚠️

---

## Success Criteria

- [ ] `docs/sitemap.xml` lists 38 URLs (9 existing indexable pages: `/`, band, contact, dates, discography, newsletter, photos, store, videos; + 7 release pages + 22 song pages), each passing SEO-04 to SEO-09.
- [ ] Google's Rich Results Test reports no errors for `/`, `/discography/silicon-fortress/` and `/discography/silicon-fortress/faceless-demons/` (manual check after deploy).
- [ ] Search Console shows impressions for at least one query without "insane driver" within 90 days of deploy (measured by the band).
