# Store Cyberpunk Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: inline (no `design.md`: one static page reusing the existing `.cyber-zone`/`.cyber-panel` pattern from `less/band.less` and catalog data from `_data/discography.json`; no new architecture)
**Status**: Approved

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec. Guidelines found: none (no `AGENTS.md`, `CONTRIBUTING.md`, coverage or lint config) - strong defaults applied. Conventions sampled from `tests/discography/*`, `tests/photos/browser.cjs`, `playwright.config.cjs`, `package.json`, `.github/workflows/main.yml` (CI runs `npm run test:unit` + `npm run build`; e2e is local-only). Compiled `assets/css/style.min.css` is committed with every `.less` change.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Page template (`store/index.html`) | e2e | Every markup AC (STORE-01..14) + no-JS edge case | `tests/store/markup.e2e.cjs` | `npm test` |
| Styles (`less/store.less` + compiled CSS) | e2e | Layout order at >=992px and <992px, overflow at 320/375/768/1024/1440, reduced motion, focus outline, cyber structure | `tests/store/theme.e2e.cjs` | `npm test` |
| Redirect page (`preorder/index.html`) | e2e | Navigation lands on `/store/`; canonical, noindex, fallback link present | `tests/store/redirect.e2e.cjs` | `npm test` |
| Catalog data / repo hygiene (`_data/discography.json`, removed files) | unit | `buyCd` value, removed files and import absent | `tests/store/store-data.test.cjs` | `npm run test:unit` |

## Gate Check Commands

> No linter or formatter is configured, so the Build gate is build + full test suite.

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | After tasks with unit tests only | `npm run test:unit` |
| Full | After tasks with e2e tests | `npm test` |
| Build | After phase completion | `npm run build && npm test` |

---

## Execution Plan

### Phase 1: Store page

```
T1 → T2
```

### Phase 2: Retire the pre-order page

```
T3 → T4
T4 → T5
```

---

## Task Breakdown

### T1: Store markup with three product cards and Brazil panel

**What**: Rewrite `store/index.html` as the cyber-zone page: header line, three product cards (combo, Silicon Fortress, Insane Driver) with art, HUD year tag, price, Liquid-rendered `<details>` tracklists from `discography.albums`, and per-card PayPal forms; always-visible Brazil panel; `jspath: js/insane`, no geo-IP.
**Where**: `store/index.html`
**Depends on**: None
**Reuses**: `discography/index.html` panel markup, PayPal fields from `preorder/index.html` and the current `store/index.html`
**Requirement**: STORE-01, STORE-02, STORE-03, STORE-04, STORE-05, STORE-06, STORE-07, STORE-08, STORE-09, STORE-10, STORE-11, STORE-12, STORE-13, STORE-14

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `tests/store/markup.e2e.cjs` asserts STORE-01..14 and the no-JS edge case, with tracklists compared against `_data/discography.json`
- [x] Gate check passes: `npm test`

**Tests**: e2e
**Status**: ✅ Complete
**Gate**: full

**Commit**: `feat(store): list the combo and both CDs on one page`

---

### T2: Cyberpunk stylesheet for the store

**What**: Add `less/store.less` (cyber-zone/panel pattern copied from `band.less`, `store-*` keyframes, card grid with desktop reorder, BEST DEAL badge, focus outlines, reduced-motion block), import it in `less/style.less` and recompile `assets/css/style.min.css`.
**Where**: `less/store.less`
**Depends on**: T1
**Reuses**: `less/band.less`, `less/mailchimp.less` reduced-motion block
**Requirement**: STORE-15, STORE-16, STORE-17, STORE-18, STORE-19, STORE-20

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `tests/store/theme.e2e.cjs` asserts STORE-15..20
- [x] Gate check passes: `npm test`

**Tests**: e2e
**Status**: ✅ Complete
**Gate**: full

**Commit**: `style(store): give the store the cyberpunk panel look`

---

### T3: Turn /preorder/ into a redirect

**What**: Replace `preorder/index.html` with a layout-free page that meta-refreshes to `/store/`, with canonical, noindex and a fallback link.
**Where**: `preorder/index.html`
**Depends on**: None
**Reuses**: none
**Requirement**: STORE-21, STORE-22

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `tests/store/redirect.e2e.cjs` asserts the browser ends on `/store/` and the three head/body elements exist
- [x] Gate check passes: `npm test`

**Tests**: e2e
**Status**: ✅ Complete
**Gate**: full

**Commit**: `feat(preorder): redirect the pre-order page to the store`

---

### T4: Remove the pre-order assets

**What**: Delete `less/preorder.less`, `assets/js/preorder.js`, `_includes/js/preorder.liquid` and the `@import "preorder.less"` line; recompile CSS.
**Where**: `less/style.less`
**Depends on**: T3
**Reuses**: none
**Requirement**: STORE-24

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `tests/store/store-data.test.cjs` asserts the files and the import are gone
- [x] Gate check passes: `npm test`

**Tests**: unit
**Status**: ✅ Complete
**Gate**: full

**Commit**: `chore(preorder): remove the unused pre-order styles and script`

---

### T5: Point the Silicon Fortress buy link at the store

**What**: Set `buyCd` of `silicon-fortress` to `/store/`; update DISC-37 and the discography markup test that pinned `/preorder/` (requirement change, not a weakened test).
**Where**: `_data/discography.json`
**Depends on**: T4
**Reuses**: `tests/discography/discography-data.test.cjs`
**Requirement**: STORE-23

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `tests/store/store-data.test.cjs` asserts `buyCd === '/store/'`
- [x] Gate check passes: `npm run build && npm test`

**Tests**: unit
**Status**: ✅ Complete
**Gate**: build

**Commit**: `fix(discography): send Silicon Fortress buyers to the store`

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| --- | --- | --- | --- |
| T1 | None | - | ✅ Match |
| T2 | T1 | T1 → T2 | ✅ Match |
| T3 | None | - | ✅ Match |
| T4 | T3 | T3 → T4 | ✅ Match |
| T5 | T4 | T4 → T5 | ✅ Match |

## Test Co-location Validation

| Task | Code Layer | Matrix Requires | Task Says | Status |
| --- | --- | --- | --- | --- |
| T1 | Page template | e2e | e2e | ✅ OK |
| T2 | Styles | e2e | e2e | ✅ OK |
| T3 | Redirect page | e2e | e2e | ✅ OK |
| T4 | Repo hygiene | unit | unit | ✅ OK |
| T5 | Catalog data | unit | unit | ✅ OK |
