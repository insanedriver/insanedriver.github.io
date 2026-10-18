# Bandsintown Newsletter Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: inline (no `design.md`). The iframe and the fallback link are written inline in `newsletter/index.html` (one consumer, no include). The home panel replaces its form with a `.home-signal-cta` link to `/newsletter/`, reusing the old yellow submit button rule. No new architecture.

**Amended during T2 (2026-10-18):** the user moved the embed off the home page, because an iframe there breaks HOME-06. T2 and T3 were rewritten; the shared include was dropped.
**Status**: In Progress

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec. Guidelines found: none (no `AGENTS.md`, `CONTRIBUTING.md`, coverage or lint config) - strong defaults applied. Conventions sampled from `tests/home/*.e2e.cjs`, `tests/home/legacy.test.cjs`, `tests/home/home-core.test.cjs`, `tests/photos/browser.cjs` (the fixture aborts every non-local host, which keeps Bandsintown out of the tests), `playwright.config.cjs`, `package.json`. Compiled `assets/css/style.min.css` is committed with every `.less` change.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Page templates (`index.html`, `newsletter/index.html`) | e2e | Every markup AC (BIT-01..04, 06..14, 16, 17), including the blocked-embed edge case | `tests/home/newsletter.e2e.cjs`, `tests/newsletter/markup.e2e.cjs` | `npm test` |
| Styles (`less/home.less`, `less/newsletter.less`, compiled CSS) | e2e + unit | Iframe box inside the panel body and no page overflow at 320/768/1280 (BIT-15), border (BIT-14), panel computed styles kept (BIT-20), removed selectors (BIT-19) | `tests/newsletter/theme.e2e.cjs`, `tests/newsletter/cleanup.test.cjs` | `npm test` |
| Home JS (`assets/js/home-core.js`, `assets/js/home.js`) | unit + e2e | No `newsletterEvent` export; no `home_newsletter_submit` push (BIT-05) | `tests/home/home-core.test.cjs`, `tests/home/tracking.e2e.cjs` | `npm test` |
| Repo hygiene (removed files, LESS selectors) | unit | BIT-18, BIT-19 | `tests/newsletter/cleanup.test.cjs` | `npm run test:unit` |
| Specs docs | none | - (build gate only) | - | build gate only |

## Gate Check Commands

> No linter or formatter is configured, so the Build gate is build + the full test suite.

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | After tasks with unit tests only | `npm run test:unit` |
| Full | After tasks with e2e tests | `npm test` |
| Build | After phase completion | `npm run build && npm test` |

---

## Execution Plan

### Phase 1: Home

```
T1 → T2 → T3
```

### Phase 2: Newsletter page

```
T4 → T5
```

### Phase 3: Spec amendments

```
T6
```

---

## Task Breakdown

### T1: Remove the home newsletter GTM event

**What**: Delete `newsletterEvent` from `home-core` and the submit listener from `home.js`, and replace the HOME-47 tests with BIT-05 tests.
**Where**: `assets/js/home-core.js`, `assets/js/home.js`, `tests/home/home-core.test.cjs`, `tests/home/tracking.e2e.cjs`
**Depends on**: None
**Reuses**: existing `pushed()` helper in `tests/home/tracking.e2e.cjs`
**Requirement**: BIT-05

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `core.newsletterEvent` is `undefined` (unit).
- [x] Submitting the home newsletter panel with a valid email pushes no `home_newsletter_submit` (e2e).
- [x] Gate check passes: `npm test`

**Tests**: e2e
**Gate**: full

**Commit**: `refactor(home): drop the newsletter submit event`

---

### T2: Turn the home panel into a link to /newsletter/

**What**: Replace the home Mailchimp form with a `Join the network` primary link to `/newsletter/`.
**Where**: `index.html` (and `less/home.less`, compiled CSS, `tests/home/newsletter.e2e.cjs`)
**Depends on**: T1
**Reuses**: the `.home-signal-submit` rule, renamed `.home-signal-cta`; `panelByTab` from `tests/home/helpers.cjs`
**Requirement**: BIT-01, BIT-02, BIT-03, BIT-04, BIT-06

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] The e2e suite asserts every listed AC on `/`.
- [x] HOME-06 and HOME-15 tests (zero iframes on load) still pass unchanged.
- [x] Gate check passes: `npm test`

**Tests**: e2e
**Gate**: full

**Commit**: `feat(home): point the signal panel at /newsletter/`

---

### T3: Drop the old home form CSS

**What**: Delete the `.home-signal-form`, `.home-field`, and `.mailchimp-bot-field` rules from `less/home.less` and recompile.
**Where**: `less/home.less` (and the compiled `assets/css/style.min.css`)
**Depends on**: T2
**Reuses**: existing `.home-signal` grid
**Requirement**: BIT-19 (home selectors)

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] A unit test asserts `less/home.less` has none of the removed selectors.
- [x] Existing home layout and phone-fit e2e tests still pass.
- [x] Gate check passes: `npm run build && npm test`

**Tests**: unit
**Gate**: build

**Commit**: `style(home): drop the old signal form rules`

---

### T4: Put the Bandsintown embed on /newsletter/

**What**: Replace the USER::ENROLL Mailchimp form with the inline Bandsintown iframe and fallback link; delete `countries.liquid`, `tests/home/countries.e2e.cjs`, and the `optionValues` helper.
**Where**: `newsletter/index.html`, `tests/newsletter/markup.e2e.cjs` (new)
**Depends on**: None (Phase 1, which creates the include, runs first)
**Reuses**: the embed URL verified in the browser during T2
**Requirement**: BIT-07, BIT-08, BIT-09, BIT-10, BIT-11, BIT-12, BIT-13, BIT-14 (attributes), BIT-16, BIT-17

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] The e2e suite asserts every listed AC on `/newsletter/`.
- [x] `_includes/newsletter/countries.liquid` and its test are gone.
- [x] Gate check passes: `npm test`

**Tests**: e2e
**Gate**: full

**Commit**: `feat(newsletter): replace the mailchimp form with the bandsintown embed`

---

### T5: Rename and clean the newsletter styles

**What**: Rename `less/mailchimp.less` to `less/newsletter.less`, update the import, delete the Mailchimp form rules, and size the iframe and fallback link.
**Where**: `less/newsletter.less` (and `less/style.less`, compiled CSS, `tests/newsletter/theme.e2e.cjs`, `tests/newsletter/cleanup.test.cjs`)
**Depends on**: T4
**Reuses**: existing USER::ENROLL panel rules
**Requirement**: BIT-14 (border), BIT-15, BIT-18, BIT-19, BIT-20

**Tools**:

- MCP: `claude-in-chrome`
- Skill: NONE

**Done when**:

- [ ] Unit test asserts the removed files, the `newsletter.less` import, and the absent selectors.
- [ ] E2E asserts the box at 320/768/1280, border `0px`, and the USER::ENROLL panel body background and border equal the values captured on `master` before T4.
- [ ] Gate check passes: `npm run build && npm test`

**Tests**: e2e
**Gate**: build

**Commit**: `refactor(newsletter): rename mailchimp.less and drop the form rules`

---

### T6: Mark the superseded requirements

**What**: Add amendment notes to `newsletter-cyberpunk` (NEWS-03..06 form parts, NEWS-10) and `home-cyberpunk` (HOME-44..48) pointing to this spec.
**Where**: `.specs/features/newsletter-cyberpunk/spec.md`, `.specs/features/home-cyberpunk/spec.md`
**Depends on**: None (runs after Phase 2)
**Reuses**: the `/store/` amendment note format in `home-cyberpunk`
**Requirement**: none (documentation)

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Both specs name the superseded IDs and link `.specs/features/newsletter-bandsintown/spec.md`.
- [ ] Gate check passes: `npm run build && npm test`

**Tests**: none
**Gate**: build

**Commit**: `docs(specs): mark the mailchimp requirements as superseded`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3

Phase 1:  T1 ------→ T2 ------→ T3
Phase 2:  T4 ------→ T5
Phase 3:  T6
```

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| ---- | ---------------------- | ------------- | ------ |
| T1 | None | start of Phase 1 | ✅ Match |
| T2 | T1 | T1 → T2 | ✅ Match |
| T3 | T2 | T2 → T3 | ✅ Match |
| T4 | None (phase order) | start of Phase 2 | ✅ Match |
| T5 | T4 | T4 → T5 | ✅ Match |
| T6 | None (phase order) | start of Phase 3 | ✅ Match |

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1 | Home JS | unit + e2e | e2e (with unit) | ✅ OK |
| T2 | Page templates | e2e | e2e | ✅ OK |
| T3 | Styles (removal only) | unit | unit | ✅ OK |
| T4 | Page templates | e2e | e2e | ✅ OK |
| T5 | Styles + repo hygiene | e2e + unit | e2e (with unit) | ✅ OK |
| T6 | Specs docs | none | none | ✅ OK |
