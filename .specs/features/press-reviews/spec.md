# Press reviews

## Problem Statement

What the specialized press wrote about the band's two albums, *Insane Driver* (2016) and *Silicon Fortress* (2021), is scattered across Brazilian webzines and blogs, and three of those sites are already dead. The site has no record of it, and foreign bookers and journalists cannot read the Portuguese originals. A web sweep (2026-11-22) found 18 press reviews (12 for the debut, 6 for Silicon Fortress), all published in Brazilian Portuguese, plus four recognitions.

## Goals

- [ ] All 18 reviews are on the site in English, each linked to its original or to an archived copy.
- [ ] A booker on `/press/` or a fan on `/band/` reaches the full list in one click.
- [ ] Adding a review later means adding one entry to `_data/reviews.json`, with no template changes.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Reviews on the per-album `/discography/<slug>/` pages | Phase 2 (user decision Q6) |
| schema.org `Review` JSON-LD | Phase 2; Google shows no review stars for a band's own site |
| Full translated review text | Copyright; a short quote, our own summary and a link only (Q2) |
| Interviews, news items, Rate Your Music / user ratings | Not press reviews (Q9) |
| YouTube review video | The user recalls one but nobody found it; add it later as a data entry (Q16) |
| Header menu entry for `/press/reviews/` | Linked from `/press/` and `/band/` and listed in the sitemap only (Q8) |
| Redesign / new visual direction | Reuse the existing `cyber-zone` / `cyber-panel` system |
| Push, PR, merge, deploy | Each needs its own explicit go-ahead |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Location | Own page `/press/reviews/`, page title "Press Reviews" | More than 15 reviews (Q1, Q7) | y |
| Entry points | `EPK::REVIEWS` panel on `/press/` and a reviews panel on `/band/`, each with 3 featured quotes and a "Read all N reviews" link; sitemap; no menu entry | Q8 | y |
| Content per review | Outlet, author, date, score as published, English quote, our 2-3 sentence English summary, link | Q2 | y |
| Language marking | Page intro states that the reviews were published in Brazilian Portuguese and translated by the band; each card says "Translated from Portuguese" | Q3, Q13 | y |
| Data source | `_data/reviews.json` | Q4 | y |
| Order | Grouped by album, *Silicon Fortress* first; newest review first within each album | Q5 | y |
| Scores | Shown in the outlet's own scale, never normalized; omitted when the outlet gave none | Q5 | y |
| Negative or lukewarm reviews | Included; the quote must not misrepresent the verdict | Q10 | y |
| Deluxe Edition (2018) | Grouped with *Insane Driver*; a "Deluxe Edition" label only if a review is specifically about it (none exists today) | Q11 | y |
| Dead links | Link to the Wayback snapshot, marked "Archived copy"; the original URL is kept in `originalUrl` | Q12 | y |
| Print or unlinkable reviews (Roadie Crew #207, Metal na Lata 2016) | Marked "Print" or "Via press release" and linked to the press-release republication | Q14, Q15 | y |
| Recognition strip | Terrorizer "Fear Candy" (2015), Roadie Crew 2016 readers' poll nominee, Metal Samsara best of 2016, Metal na Lata "Melhores do Ano 2021"; each linked | Q17 | y |
| Featured quotes | Roadie Crew (2016), Whiplash.Net (2016), Heavy And Hell (*Silicon Fortress*) | Q18 | y |
| Translations | Written from the research file; the user reviews them before merge | Q13 | y |
| Link checker | `scripts/check-review-links.cjs`, run by hand; it is not part of `npm test` and does not block the build | Grilling summary | y |
| Metal na Lata 2021 rank | Shown as "Best of 2021 — national albums", with no position | The rank is only in an image | y, agent default |
| Panel order on `/press/` | `EPK::REVIEWS` sits right after `EPK::FACTS` | Agent default, booker reading order | y, agent default |
| Panel position on `/band/` | New `PRESS::SIGNAL` panel after `BIO::ORIGIN` | The quotes support the bio | y, agent default |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Full reviews page ⭐ MVP

**User Story**: As a booker, journalist or fan, I want one English page with every press review of both albums, so that I can see what the press said without reading Portuguese or chasing dead sites.

**Why P1**: This page is the historical base the feature exists for.

**Acceptance Criteria**:

1. The system SHALL build `/press/reviews/` on the base layout with the page title "Press Reviews" and `page_id` `press-reviews`. <!-- REV-01 -->
2. The reviews page SHALL render one album section per album, *Silicon Fortress* first and *Insane Driver* second, each with the album title and year as a heading. <!-- REV-02 -->
3. The reviews page SHALL render one card for every entry in `_data/reviews.json`, inside its album's section, newest `date` first. <!-- REV-03 -->
4. Each review card SHALL show the outlet name, the author when present, the publication date, the English quote and the English summary. <!-- REV-04 -->
5. WHERE a review has a `score`, the card SHALL show it exactly as stored (for example "9/10" or "5 stars"); WHERE it has none, the card SHALL render no score element. <!-- REV-05 -->
6. Each review card SHALL link to the review's `url`, with `target="_blank"` and `rel="noopener"`. <!-- REV-06 -->
7. WHERE a review's `language` is `pt`, the card SHALL show the label "Translated from Portuguese". <!-- REV-07 -->
8. WHERE a review is `archived`, the card SHALL show the label "Archived copy" and its link SHALL point to a `web.archive.org` URL. <!-- REV-08 -->
9. WHERE a review's `source` is `print` or `press-release`, the card SHALL show the label "Print" or "Via press release" respectively. <!-- REV-09 -->
10. The reviews page SHALL show an intro stating that the reviews were originally published in Brazilian Portuguese and that the band translated the quotes. <!-- REV-10 -->
11. The reviews page SHALL render a Recognition list with one linked item for each entry in `recognitions` of `_data/reviews.json`. <!-- REV-11 -->
12. The sitemap SHALL list `/press/reviews/`, and the header menu SHALL NOT link to it. <!-- REV-12 -->

**Independent Test**: Build the site, open `/press/reviews/`, and find 18 cards in two album sections and 4 recognition items, with every link resolving to its stored URL.

---

### P1: Review data integrity ⭐ MVP

**User Story**: As the band, I want the review data validated, so that a broken entry fails the tests instead of shipping.

**Why P1**: Every card renders from this data.

**Acceptance Criteria**:

1. Each review in `_data/reviews.json` SHALL have the non-empty fields `album` (a `discography.json` album slug), `outlet`, `date` (ISO `YYYY-MM-DD`, `YYYY-MM` or `YYYY`), `language`, `quote`, `quoteOriginal`, `summary` and `url`. <!-- REV-13 -->
2. IF a review is `archived` THEN its `url` SHALL start with `https://web.archive.org/` and it SHALL have an `originalUrl`. <!-- REV-14 -->
3. `_data/reviews.json` SHALL contain exactly 3 reviews with `featured: true`: Roadie Crew, Whiplash.Net and Heavy And Hell (*Silicon Fortress*). <!-- REV-15 -->
4. No two reviews SHALL share the same `url`. <!-- REV-16 -->

**Independent Test**: `npm run test:unit` fails when one required field is deleted from a single entry.

---

### P1: Entry points from /press/ and /band/ ⭐ MVP

**User Story**: As a booker on the press kit, or a fan on the band page, I want a short teaser of press quotes, so that I find the full reviews page.

**Why P1**: Without entry points the page is orphaned (no menu entry).

**Acceptance Criteria**:

1. `/press/` SHALL render an `EPK::REVIEWS` panel directly after `EPK::FACTS`. <!-- REV-17 -->
2. The `EPK::REVIEWS` panel SHALL show the 3 featured reviews' quote, outlet and score, in the order they appear in `_data/reviews.json`. <!-- REV-18 -->
3. The `EPK::REVIEWS` panel SHALL link to `/press/reviews/` with the text "Read all N reviews", where N equals the number of reviews in `_data/reviews.json`. <!-- REV-19 -->
4. `/band/` SHALL render a `PRESS::SIGNAL` panel after `BIO::ORIGIN` with the same 3 featured quotes and the same "Read all N reviews" link. <!-- REV-20 -->
5. The 3 featured quotes on `/press/` and `/band/` SHALL be rendered by one shared include. <!-- REV-21 -->

**Independent Test**: Open `/press/` and `/band/`, see 3 quotes in each, and follow "Read all 18 reviews" to `/press/reviews/`.

---

### P2: Readable at phone and desktop widths

**User Story**: As a visitor on a phone, I want the review cards readable, so that I can browse them on mobile.

**Acceptance Criteria**:

1. WHEN `/press/reviews/` is viewed at 390px wide THEN the system SHALL render no horizontal page scroll. <!-- REV-22 -->
2. The review summary and quote text SHALL use Rajdhani with a computed size of at least 16px at 390px. <!-- REV-23 -->

**Independent Test**: A Playwright check at 390px and 1440px.

---

### P3: Link health check

**User Story**: As the band, I want a way to find review links that died, so that I can switch them to archived copies.

**Acceptance Criteria**:

1. WHEN `node scripts/check-review-links.cjs` runs THEN it SHALL request every review `url` and every recognition `url` and print each one that does not answer with HTTP 2xx or 3xx, together with its status. <!-- REV-24 -->
2. The link check SHALL NOT run as part of `npm test` or `npm run build`. <!-- REV-25 -->

---

## Edge Cases

- IF a review has no `author` THEN the card SHALL render no author element and no stray separator (Morticínio, *Silicon Fortress*). <!-- covered by REV-04 -->
- WHEN a review predates its album's release date (Pólvora Zine, *Silicon Fortress*, 21 Aug 2021) THEN the system SHALL still show it with its real publication date. <!-- covered by REV-03 -->
- WHEN an album has no reviews THEN the system SHALL render no section for it (*Insane Driver (Deluxe Edition)*). <!-- covered by REV-02 -->

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| REV-01 | P1: Full reviews page | T2 | Implementing |
| REV-02 | P1: Full reviews page | T2 | Implementing |
| REV-03 | P1: Full reviews page | T2 | Implementing |
| REV-04 | P1: Full reviews page | T2 | Implementing |
| REV-05 | P1: Full reviews page | T2 | Implementing |
| REV-06 | P1: Full reviews page | T2 | Implementing |
| REV-07 | P1: Full reviews page | T2 | Implementing |
| REV-08 | P1: Full reviews page | T2 | Implementing |
| REV-09 | P1: Full reviews page | T2 | Implementing |
| REV-10 | P1: Full reviews page | T2 | Implementing |
| REV-11 | P1: Full reviews page | T2 | Implementing |
| REV-12 | P1: Full reviews page | T2 | Implementing |
| REV-13 | P1: Review data integrity | T1 | Implementing |
| REV-14 | P1: Review data integrity | T1 | Implementing |
| REV-15 | P1: Review data integrity | T1 | Implementing |
| REV-16 | P1: Review data integrity | T1 | Implementing |
| REV-17 | P1: Entry points | Design | Pending |
| REV-18 | P1: Entry points | Design | Pending |
| REV-19 | P1: Entry points | Design | Pending |
| REV-20 | P1: Entry points | Design | Pending |
| REV-21 | P1: Entry points | Design | Pending |
| REV-22 | P2: Readable | T3 | Implementing |
| REV-23 | P2: Readable | T3 | Implementing |
| REV-24 | P3: Link health | Design | Pending |
| REV-25 | P3: Link health | Design | Pending |

**Coverage:** 25 total, 0 mapped to tasks, 25 unmapped ⚠️ (mapped in Tasks)

---

## Success Criteria

- [ ] 18 reviews and 4 recognitions are live on `/press/reviews/`, every one linked.
- [ ] `/press/` and `/band/` each show 3 featured quotes and link to the full page.
- [ ] `npm test` is green, with the new unit and e2e tests included.
- [ ] The user has reviewed the English translations.
