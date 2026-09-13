# Cyberpunk Newsletter Specification

## Problem Statement

The newsletter page uses an old Mailchimp embed whose layout and visual language no longer match the cyberpunk presentation of the Band and Contact pages. Visitors need a clear, responsive signup experience that preserves the existing mailing-list integration while bringing the page into the site's current visual system.

## Goals

- [x] Present the newsletter content and form with the cyberpunk panel, HUD, neon, scanline, separator, and ticker language established by the Band and Contact pages.
- [x] Preserve the existing Mailchimp subscription contract while making required fields, keyboard focus, validation, and responsive layout clear.
- [x] Keep the page usable without horizontal overflow from 320px mobile widths through desktop widths.

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Changing the Mailchimp audience, endpoint, field names, or bot-trap field | This feature redesigns the existing signup experience. |
| In-page AJAX subscription or custom success processing | The existing external Mailchimp submission flow remains authoritative. |
| A shared CSS refactor of the Band and Contact pages | Their current appearance and behavior are outside this feature boundary. |
| A live test subscription | It would create real external subscriber data and requires an actual email address. |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Source branch | Create `feature/newsletter-cyberpunk` from local `master`. | The repository has no `main`; `origin/HEAD` points to `origin/master`. | y |
| Visual references | Combine Band's richer content components with Contact's concise HUD panels. | These are the user-selected cyberpunk references already in the site. | y |
| Content language and tone | Refresh the copy in concise English with cyberpunk interface labels and readable benefit statements. | The site content is in English and the user approved updated copy. | y |
| External submission behavior | Retain the Mailchimp POST target and open its external result in a new browser tab. | This preserves the existing integration contract. | y |
| Motion | Preserve cyberpunk motion and disable nonessential animation under `prefers-reduced-motion: reduce`. | This keeps the style while honoring the user's accessibility preference. | y |
| External failure handling | Let Mailchimp display service-side failures in the external result tab. | Adding custom remote failure handling would require a new integration flow. | y |
| Remaining implicit-requirement dimensions | Auth, rate limits, retries, data lifecycle, concurrency, and local persistence are N/A. | The page performs one existing external HTML form POST and stores no local state. | y |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Join the Insane Network ⭐ MVP

**User Story**: As an Insane Driver listener, I want to understand the mailing-list benefits and submit my email and country so that I can receive band news and exclusive content.

**Why P1**: Newsletter signup is the page's only conversion goal.

**Acceptance Criteria**:

1. **NEWS-01** — The newsletter page SHALL present its title, benefits, and signup form inside cyberpunk HUD panels visually consistent with the Band and Contact pages.
2. **NEWS-02** — The newsletter page SHALL present the title copy `Join the Insane Network` and concise English benefit copy covering early news, promotions and prizes, and exclusive content.
3. **NEWS-03** — The newsletter page SHALL retain the existing Mailchimp form action, POST method, `EMAIL` and `COUNTRY` field names, audience bot-trap field, and new-tab submission target.
4. **NEWS-04** — The newsletter page SHALL mark email and country as required with visible labels and native form constraints.
5. **NEWS-05** — IF the visitor attempts to submit an empty or malformed required value THEN the browser SHALL block submission through native validation.
6. **NEWS-06** — WHEN a keyboard user focuses an interactive form control THEN the newsletter page SHALL display a visible neon focus indicator.
7. **NEWS-07** — WHILE the viewport width is between 320px and 767px the newsletter page SHALL use a single-column form without horizontal page overflow or clipped controls.
8. **NEWS-08** — WHILE the viewport width is at least 768px the newsletter page SHALL constrain the form content to a readable centered width.
9. **NEWS-09** — WHILE the visitor requests reduced motion the newsletter page SHALL disable nonessential glitch, glow, noise, ticker, and blinking animations.
10. **NEWS-10** — The newsletter page SHALL retain the complete existing country option list.
11. **NEWS-11** — The newsletter page SHALL finish the cyberpunk content area with a newsletter-specific data ticker.

**Independent Test**: Build the site, inspect `/newsletter/` at 320px, 768px, and desktop widths, verify keyboard focus and native invalid-field behavior, compare its visual primitives with `/band/` and `/contact/`, and inspect the generated form contract without sending a live subscription.

---

## Edge Cases

- IF the email value lacks a valid browser-recognized email format THEN the browser SHALL keep the visitor on the newsletter page and identify the email field as invalid.
- IF no country is selected THEN the browser SHALL keep the visitor on the newsletter page and identify the country field as invalid.
- WHILE viewport content is 320px wide the newsletter page SHALL wrap text and size controls within the visible content width.
- WHILE reduced motion is enabled the newsletter page SHALL preserve all content and interaction affordances without depending on animation.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| NEWS-01 | P1: Join the Insane Network | Execute | Verified |
| NEWS-02 | P1: Join the Insane Network | Execute | Verified |
| NEWS-03 | P1: Join the Insane Network | Execute | Verified |
| NEWS-04 | P1: Join the Insane Network | Execute | Verified |
| NEWS-05 | P1: Join the Insane Network | Execute | Verified |
| NEWS-06 | P1: Join the Insane Network | Execute | Verified |
| NEWS-07 | P1: Join the Insane Network | Execute | Verified |
| NEWS-08 | P1: Join the Insane Network | Execute | Verified |
| NEWS-09 | P1: Join the Insane Network | Execute | Verified |
| NEWS-10 | P1: Join the Insane Network | Execute | Verified |
| NEWS-11 | P1: Join the Insane Network | Execute | Verified |

**Coverage:** 11 total, 11 mapped to the implicit Execute steps, 0 unmapped.

---

## Success Criteria

- [x] The production build completes and emits the redesigned newsletter HTML and CSS.
- [x] The generated page satisfies NEWS-01 through NEWS-11 through structural checks and browser inspection.
- [x] The Mailchimp integration values match the pre-change form exactly, apart from native validation attributes.
- [x] The page has no horizontal overflow at 320px, 768px, or a desktop viewport.
