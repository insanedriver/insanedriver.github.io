# ID-TV Video Player Specification

## Problem Statement

The Videos page stacks 10 YouTube iframes one after another with no titles, no context and no theme, so it is heavy to load (10 embeds at once) and visually disconnected from the cyberpunk Band/Contact/Newsletter/Photos pages. `assets/js/videos.js` also creates 15 `YT.Player` instances while the page has only 10 containers. This feature replaces the stack with a single cyberpunk player, "ID-TV // Transmission Feed": one stage plus a horizontally scrolling feed of video cards.

## Goals

- [ ] The Videos page loads at most one YouTube iframe at a time (0 on first paint, 1 after the first play), down from 10.
- [ ] All 10 current videos are reachable from a horizontally scrolling feed with title and type, in the current page order.
- [ ] The page uses the shared `.cyber-zone`/`.cyber-panel` visual language with `videos-*` prefixed styles.
- [ ] The page remains useful without JavaScript and when YouTube is blocked.
- [ ] `npm test` passes, including new unit and Playwright tests for the video page.

## Out of Scope

| Feature | Reason |
| --- | --- |
| The 5 teaser videos referenced in `videos.js` (`playerTeaser*`) | They have no container in the current HTML, so they are not shown today. Grilling Q8: migrate only the 10 visible videos. |
| Adding new videos (Shorts, lives) | Grilling Q8. |
| Changes to header, menu or other pages | Grilling Q8. |
| Shared cross-page theme file | Project convention duplicates the palette per page (see memory `project-cyberpunk-theme-system`); grilling Q8. |
| Mouse-wheel hijacking of the feed | Grilling Q6: it breaks page scroll. Native horizontal scroll only. |
| Push, merge, deploy | Requires explicit per-action authorization. |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Player concept | Stage above a horizontal feed of cards; active card is highlighted | Grilling Q1 (option A) | y |
| Page name | Heading `ID-TV` with subtitle `Transmission Feed` | Grilling Q2 | y |
| Data source | `_data/videos.json` with `id`, `slug`, `title`, `type`; thumbnails from `https://i.ytimg.com/vi/<id>/hqdefault.jpg` | Grilling Q3; titles fetched via YouTube oEmbed on 2026-09-20 and reviewed by the user | y |
| Type labels | `MUSIC VIDEO`, `LYRIC VIDEO`, `ACOUSTIC`, `LIVE` derived from the YouTube titles | Grilling Q3 | y |
| Embed host | `https://www.youtube-nocookie.com` through the IFrame API `host` option | Grilling Q4 | y |
| Stage on first paint | Poster (thumbnail + play button), no iframe and no YouTube script until the user first plays | Grilling Q4/Q5: nothing autoplays on load; also delivers the 0-iframes goal | y |
| Autoplay and auto-advance | Selecting a card plays it immediately; on end, the next video plays while AUTO is on; AUTO defaults to on and is not persisted | Grilling Q5 | y |
| Auto-advance at the last video | Wraps to the first video | Chosen default: continuous feed, and PREV/NEXT also wrap | n (reviewable) |
| Controls | Card click, PREV/NEXT buttons, keyboard ← → , native swipe/scroll-snap, `#slug` deep link | Grilling Q6 | y |
| Keyboard scope | ← → act only when focus is inside the player section and not inside the YouTube iframe | Chosen default: avoids stealing arrows from page scroll and from the YouTube player's own seek keys | n (reviewable) |
| Visual language | Copy `.cyber-zone`/`.cyber-panel` pattern into `less/videos.less` with `videos-*` keyframes, `bodybg.jpg` backdrop, `prefers-reduced-motion` support | Grilling Q7 and the project convention | y |
| Stage frame extras | Cut-corner monitor frame, `NOW PLAYING`, `03 / 10` counter in `Share Tech Mono`, cyan active border, no heavy CRT effect over the video | Grilling Q7 | y |
| No-JS / blocked YouTube | The feed is rendered in HTML by Liquid; each card is a real link to `https://www.youtube.com/watch?v=<id>` that JS intercepts | Grilling Q9 | y |
| Order and slugs | Current HTML order: Keep Away, Ghosts, Distant Hearts, Desperate Prayer, Imagined Realities, Silicon Fortress, Today Is Sunday, Buried Thoughts, Tide Of Fears, Change; explicit `slug` field | Grilling Q10 | y |
| Default and invalid hash | No hash or unknown hash selects the first video | Grilling Q10 | y |
| Delivery | Branch `feature/videos-player`, local atomic Conventional Commits, no push | Grilling Q11 | y |
| Old script | `assets/js/videos.js` is rewritten; `_includes/js/videos.liquid` keeps loading it | Grilling Q11 | y |

**Open questions:** none - all resolved or logged above.

### Implicit-requirement dimensions

| Dimension | Resolution |
| --- | --- |
| Input validation & bounds | Hash validation: VPLR-11 |
| Failure / partial-failure states | YouTube API unavailable: VPLR-14 |
| Idempotency / retry / duplicate handling | Re-selecting the active video does not restart it: VPLR-09 |
| Auth boundaries & rate limits | N/A because the page is public static content with no calls to our own services |
| Concurrency / ordering | Rapid successive selections resolve to the last one: VPLR-10 |
| Data lifecycle / expiry | N/A because nothing is stored client-side (AUTO is not persisted) |
| Observability | N/A because the site has no analytics hooks on video pages |
| External-dependency failure | VPLR-14, VPLR-15 |
| State-transition integrity | End-of-video, first/last wrap: VPLR-12, VPLR-13 |

---

## User Stories

### P1: Data-driven feed that works without JavaScript ⭐ MVP

**User Story**: As a visitor, I want to see every Insane Driver video with its title and type in one place, even if scripts or YouTube fail.

**Why P1**: This is the content contract every other story builds on.

**Acceptance Criteria**:

1. The Videos page SHALL render one card per entry of `_data/videos.json` in file order, 10 cards. (VPLR-01)
2. Each card SHALL show the entry's thumbnail from `https://i.ytimg.com/vi/<id>/hqdefault.jpg`, its title with the `Insane Driver - ` prefix removed, and its type label. (VPLR-02)
3. Each card SHALL be an `<a>` whose `href` is `https://www.youtube.com/watch?v=<id>`, so it works without JavaScript. (VPLR-03)
4. The Videos page SHALL contain no `<iframe>` in the server-rendered HTML. (VPLR-04)
5. The `_data/videos.json` SHALL contain 10 entries with unique `id` and unique kebab-case `slug`, and the order Keep Away, Ghosts, Distant Hearts, Desperate Prayer, Imagined Realities, Silicon Fortress, Today Is Sunday, Buried Thoughts, Tide Of Fears, Change. (VPLR-05)

**Independent Test**: Disable JavaScript, open `/videos/`, see 10 cards with titles; each opens YouTube.

---

### P1: Single stage with a scrolling feed ⭐ MVP

**User Story**: As a visitor, I want one big player and a strip of videos I can scroll sideways, so I can browse and watch without a wall of embeds.

**Why P1**: The core product change.

**Acceptance Criteria**:

1. WHEN the page loads with JavaScript enabled THEN the stage SHALL show the selected video's poster with a play button, and the page SHALL create 0 iframes and request no `youtube.com` script. (VPLR-06)
2. WHEN the visitor activates the play button THEN the stage SHALL load one YouTube iframe from `youtube-nocookie.com` for the selected video and start playback. (VPLR-07)
3. WHEN the visitor clicks a card THEN the stage SHALL switch to that video and start playing it, the card SHALL get `aria-current="true"`, and all other cards SHALL not. (VPLR-08)
4. WHEN the visitor clicks the card of the video that is already active THEN the stage SHALL keep the current playback without restarting it. (VPLR-09)
5. WHEN the visitor triggers several selections in quick succession THEN the stage SHALL end on the last selected video, with exactly one iframe in the page. (VPLR-10)
6. The stage SHALL show `NOW PLAYING` with the active title and a counter formatted `NN / 10` (for example `03 / 10`). (VPLR-16)
7. WHEN the active card changes THEN the feed SHALL scroll horizontally so the active card is fully visible. (VPLR-17)
8. The feed SHALL use horizontal `scroll-snap` and scroll natively, with no `wheel` event handler that calls `preventDefault`. (VPLR-18)

**Independent Test**: Load `/videos/`, confirm poster only; click card 4, see one iframe for its ID and counter `04 / 10`.

---

### P1: Cyberpunk theme parity ⭐ MVP

**User Story**: As a visitor coming from Band or Photos, I want Videos to look like the same site.

**Why P1**: The stated motivation of the redesign.

**Acceptance Criteria**:

1. The Videos page SHALL wrap its content in `.cyber-zone > .cyber-zone-inner` with `.cyber-panel` sections that have `.cyber-panel-tab` labels and `.corner-tl`/`.corner-tr`/`.corner-bl` accents. (VPLR-19)
2. The Videos page SHALL leave `.cyber-zone` background transparent so `bodybg.jpg` shows through. (VPLR-20)
3. The Videos page SHALL use `#00f3ff`/`#005f8c` for panel chrome, `#ff00ea` for hover and counter accents, `Rajdhani` for body text and `Share Tech Mono` for HUD text. (VPLR-21)
4. WHILE the visitor's system has `prefers-reduced-motion: reduce` the page SHALL run no CSS animation or transition on `.videos-*` and cyber-zone elements. (VPLR-22)
5. The page SHALL not draw scanline, noise or glow overlays on top of the video stage area. (VPLR-23)
6. The stage and the feed SHALL fit within the viewport width, with no horizontal page scroll, at 375px and 1280px widths. (VPLR-24)

**Independent Test**: Compare with Band side by side; resize to 375px and 1280px.

---

### P2: Navigation, deep links and auto-advance

**User Story**: As a visitor, I want to move between videos quickly, share a link to one, and let them play in sequence.

**Why P2**: Strong UX, but the page is usable without it.

**Acceptance Criteria**:

1. WHEN the visitor activates NEXT or PREV THEN the stage SHALL select the following or preceding video and start it, wrapping from last to first and first to last. (VPLR-12)
2. WHEN the active video ends AND AUTO is on THEN the stage SHALL select the next video (wrapping after the last) and start it. (VPLR-13)
3. WHEN the active video ends AND AUTO is off THEN the stage SHALL keep the current video and start nothing. (VPLR-25)
4. WHERE the AUTO toggle is present the page SHALL render it with `aria-pressed="true"` on load and flip it on each activation. (VPLR-26)
5. WHILE focus is inside the player section and outside the YouTube iframe, WHEN the visitor presses ArrowRight or ArrowLeft THEN the stage SHALL behave as NEXT or PREV. (VPLR-27)
6. WHEN a video is selected THEN the URL hash SHALL become `#<slug>` using `history.replaceState`, adding no history entry. (VPLR-28)
7. WHEN the page loads with `#<slug>` matching a video THEN the stage SHALL show that video's poster without autoplay. (VPLR-29)
8. IF the page loads with an unknown or empty hash THEN the stage SHALL show the first video's poster and leave the URL unchanged. (VPLR-11)

**Independent Test**: Open `/videos/#tide-of-fears`, see `09 / 10` poster; press NEXT twice and see `#change` then `#keep-away`.

---

### P2: Graceful failure when YouTube is unavailable

**User Story**: As a visitor behind an adblocker or firewall, I want a clear fallback instead of an empty box.

**Why P2**: Real-world failure path.

**Acceptance Criteria**:

1. IF the YouTube IFrame API script fails to load or does not become ready within 8 seconds after the first play THEN the stage SHALL show the poster with a visible message `YouTube unavailable` and a link `Watch on YouTube` to the video's watch URL. (VPLR-14)
2. WHILE the fallback message is shown the feed SHALL remain interactive and selecting another card SHALL update the fallback link to that video. (VPLR-15)

**Independent Test**: Block `youtube.com`/`youtube-nocookie.com` in Playwright, press play, see the message and link.

---

## Edge Cases

- IF the page loads with a hash that differs from a slug only by letter case (for example `#Ghosts`) THEN the stage SHALL treat it as unknown and show the first video. (VPLR-11)
- WHEN the viewport is under 768px THEN the stage SHALL keep a 16:9 aspect ratio filling the panel width. (VPLR-24)

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| VPLR-01 | P1: Data-driven feed | Tasks | Implementing |
| VPLR-02 | P1: Data-driven feed | Design | Pending |
| VPLR-03 | P1: Data-driven feed | Design | Pending |
| VPLR-04 | P1: Data-driven feed | Design | Pending |
| VPLR-05 | P1: Data-driven feed | Tasks | Implementing |
| VPLR-06 | P1: Stage and feed | Design | Pending |
| VPLR-07 | P1: Stage and feed | Design | Pending |
| VPLR-08 | P1: Stage and feed | Design | Pending |
| VPLR-09 | P1: Stage and feed | Design | Pending |
| VPLR-10 | P1: Stage and feed | Design | Pending |
| VPLR-11 | P2: Navigation | Design | Pending |
| VPLR-12 | P2: Navigation | Design | Pending |
| VPLR-13 | P2: Navigation | Design | Pending |
| VPLR-14 | P2: Failure | Design | Pending |
| VPLR-15 | P2: Failure | Design | Pending |
| VPLR-16 | P1: Stage and feed | Design | Pending |
| VPLR-17 | P1: Stage and feed | Design | Pending |
| VPLR-18 | P1: Stage and feed | Design | Pending |
| VPLR-19 | P1: Theme parity | Design | Pending |
| VPLR-20 | P1: Theme parity | Design | Pending |
| VPLR-21 | P1: Theme parity | Design | Pending |
| VPLR-22 | P1: Theme parity | Design | Pending |
| VPLR-23 | P1: Theme parity | Design | Pending |
| VPLR-24 | P1: Theme parity | Design | Pending |
| VPLR-25 | P2: Navigation | Design | Pending |
| VPLR-26 | P2: Navigation | Design | Pending |
| VPLR-27 | P2: Navigation | Design | Pending |
| VPLR-28 | P2: Navigation | Design | Pending |
| VPLR-29 | P2: Navigation | Design | Pending |

**Coverage:** 29 total, 0 mapped to tasks, 29 unmapped ⚠️

---

## Success Criteria

- [ ] First paint of `/videos/` requests zero YouTube resources; one iframe exists after the first play.
- [ ] All 10 videos play from the stage and the deep link `#<slug>` selects each of them.
- [ ] `npm test` passes and the Videos page matches the Band/Photos visual language at 375px and 1280px.
