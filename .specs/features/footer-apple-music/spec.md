# Footer Apple Music Link Specification

## Problem Statement

The footer links to Spotify and Bandcamp but not to Apple Music, although the band is on Apple Music and `/band/` already links there. Apple Music listeners have no way to reach the band from the footer, and the `MusicGroup` JSON-LD leaves the profile out of `sameAs`.

## Goals

- [ ] Every page's footer links to the band's Apple Music artist page
- [ ] The `MusicGroup` `sameAs` lists the Apple Music profile, still mirroring the footer

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Apple Music in the top navbar | Grilling Q5: the navbar keeps its own set (it has no Bandcamp either) |
| Custom Apple Music SVG icon | Grilling Q3: FA 4.4 ships `fa-apple`, already used on `/band/` |
| New hover style | The link reuses `.social-footer` like every other footer icon |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Position | 2nd link, right after Spotify; Bandcamp stays last | Grilling Q1: groups the streaming links, keeps the Bandcamp-last rule | y |
| URL | `https://music.apple.com/br/artist/insane-driver/1058331029?l=en` | Grilling Q2: the URL `/band/` already uses | y |
| Icon | `<i class="fa fa-apple fa-3x">` | Grilling Q3: same glyph as `/band/` | y |
| JSON-LD | Apple Music added to `sameAs` at the same position | Grilling Q4: HOME-52 requires `sameAs` to equal the footer list | y |
| Title / hidden text | `Insane Driver on Apple Music` | Matches the `Insane Driver on <Platform>` pattern of every footer link | y |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Apple Music in the footer ⭐ MVP

**User Story**: As an Apple Music listener, I want an Apple Music icon in the footer so that I can open the band's artist page from any page.

**Why P1**: It is the whole feature.

**Acceptance Criteria**:

1. FOOT-01: The footer SHALL render 7 social links in the order Spotify, Apple Music, YouTube, Instagram, Facebook, Twitter, Bandcamp.  <!-- ubiquitous -->
2. FOOT-02: The Apple Music footer link SHALL have `href="https://music.apple.com/br/artist/insane-driver/1058331029?l=en"`, `target="_blank"` and `title="Insane Driver on Apple Music"`.  <!-- ubiquitous -->
3. FOOT-03: The Apple Music footer link SHALL show a visible `fa-apple` icon.  <!-- ubiquitous -->
4. FOOT-04: The `MusicGroup` JSON-LD `sameAs` SHALL equal the footer link list, Apple Music included, in footer order.  <!-- ubiquitous -->
5. FOOT-05: WHEN the viewport is 320px wide THEN the footer SHALL add no horizontal overflow with the 7 links.  <!-- event-driven -->

**Independent Test**: Open `/` and `/band/`, see the Apple icon second in the footer, follow it to the Apple Music artist page.

---

## Edge Cases

- WHEN the viewport is 320px wide THEN the footer SHALL fit the viewport (FOOT-05).

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| FOOT-01 | P1: Apple Music in the footer | Execute | Implemented |
| FOOT-02 | P1: Apple Music in the footer | Execute | Implemented |
| FOOT-03 | P1: Apple Music in the footer | Execute | Implemented |
| FOOT-04 | P1: Apple Music in the footer | Execute | Implemented |
| FOOT-05 | P1: Apple Music in the footer | Execute | Implemented |

**Coverage:** 5 total, 5 mapped to the single Execute step, 0 unmapped

---

## Success Criteria

- [ ] The footer shows the Apple icon on every page and the e2e suite passes
