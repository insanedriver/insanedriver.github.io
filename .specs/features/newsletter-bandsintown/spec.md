# Bandsintown Newsletter Specification

## Problem Statement

The band no longer has access to its Mailchimp account, so the two signup forms on the site (the home SIGNAL::NEWSLETTER panel and the `/newsletter/` USER::ENROLL panel) post to an audience nobody can read. The band already has 1k+ fans on Bandsintown, and Bandsintown provides an embeddable mailing-list form for artist `10752930`. This feature replaces both Mailchimp forms with that embed and removes everything that only existed for Mailchimp.

## Goals

- [ ] Every newsletter signup on the site goes to the Bandsintown mailing list for artist `10752930`.
- [ ] No Mailchimp endpoint, field, or Mailchimp-only code, style, or test remains in the source.
- [ ] The embed is styled with the cyberpunk palette and fits the panels at 320px, 768px, and desktop widths without horizontal overflow.

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| `/dates/` tour widget upgrade | The user deferred it to its own feature. |
| Migrating Mailchimp subscribers | The Mailchimp account is lost; there is nothing to export. |
| An approximate GTM signal for iframe signups | A cross-origin iframe hides the submit; a focus-based proxy would report a misleading number. Signup counts come from Bandsintown for Artists. |
| A country field or any other field we control | The Bandsintown embed owns its fields. |
| An automated live subscription | It would create real subscriber data. The user submits once manually after verification. |
| Shared extraction of the cyberpunk styles | Project convention keeps each page's styles in its own `.less` file. |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Pages in scope | Home and `/newsletter/` only. | User decision during grilling. | y |
| Embed source | `https://bandsintown.com/artist/10752930/email_signup_form` with query parameters, one shared Liquid include used by both pages. | The user supplied this embed; a single include keeps both pages identical. | y |
| Background colour | `backgroundColor=rgba(0,0,0,0)` so the dark panel shows through. If Bandsintown renders it opaque, switch to `rgba(10,15,20,1)` and amend BIT-10. | User decision during grilling. | y |
| Text and button colours | `headerTextColor=rgba(0,243,255,1)` (cyan); `ctaBackgroundColor` and `ctaBorderColor` `rgba(252,238,10,1)` (yellow); `ctaFontColor=rgba(0,0,0,1)`. | Site palette; matches the yellow store buy button. | y |
| Embed title and header text | `title` and `headerText` are empty; our HTML keeps the headings and copy. If Bandsintown falls back to a default text when they are empty, record what renders and amend BIT-09 with the user. | Our fonts cannot be loaded inside the iframe; the Helvetica title would clash. | y |
| Embed font | `font=Helvetica`, the value in the supplied snippet. | Rajdhani is not available inside the iframe; no other value is known to be supported. | n |
| CTA label and shape | `ctaLabel=Subscribe`, `ctaBorderRadius=0px`, `ctaIcon=hide`, `ctaSize=medium`. | "Subscribe" comes from the supplied snippet; square corners match the angular panels. | n |
| Layout and height | One iframe per page, `width="100%"`. `layout` and the `height` value are chosen by a browser check at 320px, 768px, and 1280px; the chosen values are written into BIT-12 before the task is committed. | User decision during grilling (single iframe unless no layout fits all widths). | y |
| Locale | `locale=en`. | The site is in English. | y |
| Lazy loading | Home iframe `loading="lazy"`; `/newsletter/` iframe loads eagerly because it is the page's main content. | The home panel sits at the bottom of a long page. | y |
| Accessible name | Each iframe has `title="Insane Driver mailing list signup"`. | The supplied `newsletter-widget` title is not meaningful to screen readers. | n |
| Fallback link | Each signup panel shows a plain link `Sign up on Bandsintown` to `https://www.bandsintown.com/a/10752930`, opening in a new tab. | The embed can be blocked by tracker blockers or fail to load, and a cross-origin iframe failure cannot be detected reliably. | n |
| GTM event | `home_newsletter_submit` and `newsletterEvent` are removed. | User decision during grilling. | y |
| Cleanup | Delete `_includes/newsletter/countries.liquid`, the bot field, Mailchimp form CSS, and the Mailchimp-only tests; rename `less/mailchimp.less` to `less/newsletter.less`. | User decision during grilling. | y |
| Hermetic tests | Playwright tests abort requests to `bandsintown.com` and assert our markup and the iframe box, never content inside the iframe. Visual checks inside the iframe are done manually in a browser and recorded in `validation.md`. | Live third-party content behind Cloudflare makes tests flaky; `curl` already returns 403. | y |
| Superseded specs | `newsletter-cyberpunk` (NEWS-03, NEWS-04, NEWS-05, NEWS-06 form parts, NEWS-10) and `home-cyberpunk` (HOME-44 to HOME-48) get a note pointing to this spec. | Same treatment as the store amendment. | y |

**Open questions:** none - all resolved or logged above. Rows marked `n` are defaults for the user to confirm at spec review.

---

## User Stories

### P1: Home signup goes to Bandsintown ⭐ MVP

**User Story**: As a fan on the home page, I want to join the band's mailing list from the SIGNAL::NEWSLETTER panel so that I get news about releases and shows.

**Why P1**: The current home form posts to an account the band cannot reach, so every signup is lost.

**Acceptance Criteria**:

1. **BIT-01** — The home SIGNAL::NEWSLETTER panel SHALL contain exactly one `iframe` whose `src` starts with `https://bandsintown.com/artist/10752930/email_signup_form?` and SHALL contain no `form` element.
2. **BIT-02** — The home page HTML SHALL contain no `list-manage.com` URL, no `EMAIL` or `COUNTRY` field, and no `b_31b9d99c4318b90997348c1ed_79f822eba5` field.
3. **BIT-03** — The home signup iframe SHALL have `loading="lazy"`.
4. **BIT-04** — The home SIGNAL::NEWSLETTER panel SHALL keep the heading `Join the network.` and the copy `New music, videos and shows straight to your inbox. No spam, just signal.`
5. **BIT-05** — The home page SHALL NOT push a `home_newsletter_submit` event, and `home-core` SHALL NOT export `newsletterEvent`.
6. **BIT-06** — The home panels SHALL keep the order `NOW::STREAMING`, `ID-TV::LATEST`, `DISC::ARCHIVE`, `VISUAL::FEED`, `SIGNAL::NEWSLETTER`.

**Independent Test**: Build the site, open `/` with Bandsintown requests aborted, and check the iframe, its attributes, the kept copy, the panel order, and the dataLayer.

---

### P1: Newsletter page signup goes to Bandsintown ⭐ MVP

**User Story**: As a fan on `/newsletter/`, I want to join the band's mailing list so that I get every transmission from the band.

**Why P1**: It is the page's only purpose, and the current form loses every signup.

**Acceptance Criteria**:

1. **BIT-07** — The `/newsletter/` USER::ENROLL panel SHALL contain exactly one `iframe` whose `src` equals the home signup iframe's `src` and SHALL contain no `form` element.
2. **BIT-08** — The `/newsletter/` page HTML SHALL contain no `list-manage.com` URL, no `EMAIL` or `COUNTRY` field, no `b_31b9d99c4318b90997348c1ed_79f822eba5` field, and no `Required field` indicator.
3. **BIT-09** — The `/newsletter/` USER::ENROLL panel SHALL keep the heading `Initialize Connection` and the copy `Enter your coordinates to join the Insane Family.`
4. **BIT-10** — The `/newsletter/` signup iframe SHALL NOT have a `loading="lazy"` attribute.

**Independent Test**: Build the site, open `/newsletter/` with Bandsintown requests aborted, and check the iframe, its `src` against the home page, and the kept copy.

---

### P1: The embed matches the site

**User Story**: As a fan, I want the signup embed to look like part of the cyberpunk panel so that it reads as the band's own form.

**Why P1**: The Bandsintown defaults are white and turquoise and would clash with every panel around them.

**Acceptance Criteria**:

1. **BIT-11** — The signup iframe `src` SHALL set `title` and `headerText` to empty values.
2. **BIT-12** — The signup iframe `src` SHALL set `backgroundColor=rgba(0,0,0,0)`, `headerTextColor=rgba(0,243,255,1)`, `ctaBackgroundColor=rgba(252,238,10,1)`, `ctaBorderColor=rgba(252,238,10,1)`, `ctaFontColor=rgba(0,0,0,1)`, `ctaBorderRadius=0px`, `ctaLabel=Subscribe`, `emailInputField=show`, and `locale=en`.
3. **BIT-13** — Each signup iframe SHALL have `title="Insane Driver mailing list signup"`.
4. **BIT-14** — Each signup iframe SHALL have `width="100%"`, a fixed pixel `height` chosen during Execute, and no border.
5. **BIT-15** — WHILE the viewport width is 320px, 768px, or 1280px, the signup iframe SHALL lie entirely inside its panel body horizontally, and the page SHALL have no horizontal overflow.

**Independent Test**: Read the iframe `src` query parameters on both pages; measure the iframe box against its panel body at 320px, 768px, and 1280px.

---

### P2: Fallback link

**User Story**: As a fan whose browser blocks the embed, I want a direct link so that I can still sign up.

**Why P2**: Tracker blockers commonly block Bandsintown embeds; without the link the panel would be empty for those fans.

**Acceptance Criteria**:

1. **BIT-16** — Each signup panel SHALL show a link with the text `Sign up on Bandsintown` to `https://www.bandsintown.com/a/10752930`, with `target="_blank"` and `rel="noopener"`.
2. **BIT-17** — IF the Bandsintown embed request fails THEN the signup panel SHALL still show the heading, the copy, and the fallback link.

**Independent Test**: Abort Bandsintown requests and check the link, its target, and the visible copy on both pages.

---

### P2: Mailchimp leftovers removed

**User Story**: As a maintainer, I want every Mailchimp-only file and style gone so that nobody mistakes dead code for a working integration.

**Why P2**: The pages work without it, but dead Mailchimp code would mislead the next change.

**Acceptance Criteria**:

1. **BIT-18** — The repository SHALL NOT contain `_includes/newsletter/countries.liquid` or `less/mailchimp.less`, and `less/style.less` SHALL import `newsletter.less`.
2. **BIT-19** — The LESS sources SHALL contain no `mc_embed`, `mc-field-group`, `mce-`, `mailchimp`, `home-field`, or `home-signal-form` selectors.
3. **BIT-20** — The compiled stylesheet SHALL keep the `/newsletter/` cyberpunk panels: the USER::ENROLL panel body SHALL keep the same computed background and border it has before this change.

**Independent Test**: List the files, grep the LESS sources, build, and compare the USER::ENROLL panel body's computed styles to the pre-change values.

---

## Edge Cases

- IF a tracker blocker blocks `bandsintown.com` THEN each signup panel SHALL keep its heading, copy, and fallback link visible (BIT-17).
- WHILE the viewport is 320px wide the signup iframe SHALL stay inside its panel body (BIT-15).
- WHILE reduced motion is requested the newsletter page SHALL keep its existing reduced-motion behaviour for the panels around the iframe.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| BIT-01 | P1: Home signup | Tasks | Pending |
| BIT-02 | P1: Home signup | Tasks | Pending |
| BIT-03 | P1: Home signup | Tasks | Pending |
| BIT-04 | P1: Home signup | Tasks | Pending |
| BIT-05 | P1: Home signup | Tasks | Pending |
| BIT-06 | P1: Home signup | Tasks | Pending |
| BIT-07 | P1: Newsletter page signup | Tasks | Pending |
| BIT-08 | P1: Newsletter page signup | Tasks | Pending |
| BIT-09 | P1: Newsletter page signup | Tasks | Pending |
| BIT-10 | P1: Newsletter page signup | Tasks | Pending |
| BIT-11 | P1: Embed matches the site | Tasks | Pending |
| BIT-12 | P1: Embed matches the site | Tasks | Pending |
| BIT-13 | P1: Embed matches the site | Tasks | Pending |
| BIT-14 | P1: Embed matches the site | Tasks | Pending |
| BIT-15 | P1: Embed matches the site | Tasks | Pending |
| BIT-16 | P2: Fallback link | Tasks | Pending |
| BIT-17 | P2: Fallback link | Tasks | Pending |
| BIT-18 | P2: Mailchimp leftovers removed | Tasks | Pending |
| BIT-19 | P2: Mailchimp leftovers removed | Tasks | Pending |
| BIT-20 | P2: Mailchimp leftovers removed | Tasks | Pending |

**Coverage:** 20 total, 0 mapped to tasks, 20 unmapped ⚠️ (mapped in `tasks.md`)

---

## Success Criteria

- [ ] Both pages render the Bandsintown embed with the cyberpunk colours, checked manually in a browser at 320px, 768px, and 1280px.
- [ ] `npm run build`, `npm run test:unit`, and `npx playwright test` pass.
- [ ] `grep -r list-manage` over the source (excluding `node_modules`, `docs`, and `.specs`) returns nothing.
- [ ] The user submits one real address through the embed and it appears in Bandsintown for Artists.
