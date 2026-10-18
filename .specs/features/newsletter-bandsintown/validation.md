# Bandsintown Newsletter Validation

**Date**: 2026-10-18
**Spec**: `.specs/features/newsletter-bandsintown/spec.md`
**Diff range**: `master..HEAD` (13c3680..be23dfa, 8 commits)
**Verifier**: independent sub-agent (author ≠ verifier)
**Iteration**: 2 of 3 (iteration 1 was FAIL: BIT-05 e2e did not exercise the home link, mutant M5b survived; reduced-motion edge case had no test. Fixed in be23dfa, tests only.)
**Verdict**: PASS

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 | ✅ Done | BIT-05 e2e test rewritten in be23dfa to click the home link |
| T2 | ✅ Done | - |
| T3 | ✅ Done | - |
| T4 | ✅ Done | - |
| T5 | ✅ Done | - |
| T6 | ✅ Done | Both superseded specs carry the amendment notes |
| Fix 1 / Fix 2 (iteration 1) | ✅ Done | Commit be23dfa; `git show --stat` lists only `tests/home/tracking.e2e.cjs` and `tests/newsletter/theme.e2e.cjs` |

---

## Spec-Anchored Acceptance Criteria

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| BIT-01 | one link with text `Join the network`, `href="/newsletter/"`; no `form`, no `iframe` in the panel | `tests/home/newsletter.e2e.cjs:13` - `expect(cta(page)).toHaveCount(1)`; `:14` - `toHaveAttribute('href', '/newsletter/')`; `:15` - `panel.locator('form')).toHaveCount(0)`; `:16` - `panel.locator('iframe')).toHaveCount(0)` | ✅ PASS |
| BIT-02 | no `list-manage.com`, no `EMAIL`/`COUNTRY` field, no bot field on `/` | `tests/home/newsletter.e2e.cjs:21` - `expect(html).not.toContain('list-manage.com')`; `:22` - `not.toContain('b_31b9d99c4318b90997348c1ed_79f822eba5')`; `:23` - `locator('[name="EMAIL"], [name="COUNTRY"]')).toHaveCount(0)` | ✅ PASS |
| BIT-03 | activating the link opens `/newsletter/` in the same tab | `tests/home/newsletter.e2e.cjs:31` - `expect(page).toHaveURL(/\/newsletter\/$/)`; `:32` - `expect(popups).toHaveLength(0)` | ✅ PASS |
| BIT-04 | heading `Join the network.`, copy `New music, videos and shows straight to your inbox. No spam, just signal.` | `tests/home/newsletter.e2e.cjs:36` - `locator('h2')).toHaveText('Join the network.')`; `:37-38` - `.home-signal-copy p` `toHaveText('New music, ... just signal.')` | ✅ PASS |
| BIT-05 | home page pushes no `home_newsletter_submit`; `home-core` exports no `newsletterEvent` | `tests/home/home-core.test.cjs:136` - `assert.equal(core.newsletterEvent, undefined)`; `tests/home/tracking.e2e.cjs:65-69` - clicks `Join the network` in SIGNAL::NEWSLETTER, then `expect(window.__prevented).toEqual([false])` (`:68`) and `expect(await pushed(page, 'home_newsletter_submit')).toEqual([])` (`:69`) | ✅ PASS (M5b, M5c, M10 killed) |
| BIT-06 | tab order `NOW::STREAMING`, `ID-TV::LATEST`, `DISC::ARCHIVE`, `VISUAL::FEED`, `SIGNAL::NEWSLETTER` | `tests/home/newsletter.e2e.cjs:43` - `expect(tabs.map(t => t.trim())).toEqual([...5 tabs in spec order])` | ✅ PASS |
| BIT-07 | exactly one iframe in USER::ENROLL, `src` starts with `https://bandsintown.com/artist/10752930/email_signup_form?`, no `form` | `tests/newsletter/markup.e2e.cjs:16` - `expect(frame(page)).toHaveCount(1)`; `:17` - `src.startsWith(EMBED)).toBe(true)` (EMBED at `:5` equals the spec prefix); `:18` - `panel.locator('form')).toHaveCount(0)` | ✅ PASS |
| BIT-08 | no `list-manage.com`, `EMAIL`/`COUNTRY`, bot field, or `Required field` on `/newsletter/` | `tests/newsletter/markup.e2e.cjs:23-26` - `not.toContain('list-manage.com')`, `not.toContain('b_31b9...')`, field locator `toHaveCount(0)`, `getByText('Required field')).toHaveCount(0)` | ✅ PASS |
| BIT-09 | heading `Initialize Connection`, copy `Enter your coordinates to join the Insane Family.` | `tests/newsletter/markup.e2e.cjs:30` - `locator('h3')).toHaveText('Initialize Connection')`; `:31` - `locator('p')).toHaveText('Enter your coordinates to join the Insane Family.')` | ✅ PASS |
| BIT-10 | iframe has no `loading="lazy"` | `tests/newsletter/markup.e2e.cjs:35` - `expect(await frame(page).getAttribute('loading')).toBeNull()` | ✅ PASS (stricter than the spec: any `loading` value fails) |
| BIT-11 | `title` and `headerText` params empty | `tests/newsletter/markup.e2e.cjs:40` - `p.get('title')).toBe('')`; `:41` - `p.get('headerText')).toBe('')` | ✅ PASS |
| BIT-12 | the nine listed params with the exact listed values | `tests/newsletter/markup.e2e.cjs:46-57` - `toEqual({ backgroundColor: 'rgba(0,0,0,0)', headerTextColor: 'rgba(0,243,255,1)', ctaBackgroundColor: 'rgba(252,238,10,1)', ctaBorderColor: 'rgba(252,238,10,1)', ctaFontColor: 'rgba(0,0,0,1)', ctaBorderRadius: '0px', ctaLabel: 'Subscribe', emailInputField: 'show', locale: 'en' })` | ✅ PASS |
| BIT-13 | `title="Insane Driver mailing list signup"` | `tests/newsletter/markup.e2e.cjs:61` - `toHaveAttribute('title', 'Insane Driver mailing list signup')` | ✅ PASS |
| BIT-14 | `width="100%"`, `height="240"`, computed border width `0px` | `tests/newsletter/markup.e2e.cjs:65` - `toHaveAttribute('width', '100%')`; `:66` - `toHaveAttribute('height', '240')`; `tests/newsletter/theme.e2e.cjs:23` - `expect(widths).toEqual(['0px','0px','0px','0px'])` | ✅ PASS |
| BIT-15 | at 320/768/1280 px the iframe lies inside its panel body horizontally and the page has no horizontal overflow | `tests/newsletter/theme.e2e.cjs:7` - loop `[320, 768, 1280]`; `:14` - `f.x >= b.x`; `:15` - `f.x + f.width <= b.x + b.width`; `:16` - `scrollWidth - clientWidth).toBe(0)` | ✅ PASS |
| BIT-16 | link text `Sign up on Bandsintown`, `href` `https://www.bandsintown.com/a/10752930`, `target="_blank"`, `rel="noopener"` | `tests/newsletter/markup.e2e.cjs:9` - `getByRole('link', { name: 'Sign up on Bandsintown' })`; `:70` - `toHaveAttribute('href', 'https://www.bandsintown.com/a/10752930')`; `:71` - `('target', '_blank')`; `:72` - `('rel', 'noopener')` | ✅ PASS |
| BIT-17 | with the embed request failing, heading, copy and fallback link still shown | `tests/photos/browser.cjs:3-5` - aborts every non-localhost request; `tests/newsletter/markup.e2e.cjs:77-79` - h3, p, fallback `toBeVisible()` | ✅ PASS |
| BIT-18 | `countries.liquid` and `less/mailchimp.less` absent; `style.less` imports `newsletter.less` | `tests/newsletter/cleanup.test.cjs:17` - `fs.existsSync(...)` `false` for both; `:20` - `imports.includes('newsletter.less')`; `:21` - `!imports.includes('mailchimp.less')` | ✅ PASS |
| BIT-19 | no `mc_embed`, `mc-field-group`, `mce-`, `mailchimp`, `home-field`, `home-signal-form` in LESS sources | `tests/newsletter/cleanup.test.cjs:8` - selector list equals the spec list; `:27` - every `less/*.less` `assert.ok(!less.includes(selector))` | ✅ PASS |
| BIT-20 | USER::ENROLL panel body keeps its pre-change computed background and border | `tests/newsletter/theme.e2e.cjs:33-38` - `toEqual({ background: 'rgba(10, 10, 10, 0.9)', image: 'linear-gradient(...)', border: '2px solid rgb(0, 243, 255)', left: '2px solid rgb(0, 243, 255)' })`. In iteration 1 the Verifier ran this test against a `master` worktree and it passed, so the baseline is the real pre-change value. | ✅ PASS |

**Status**: ✅ All ACs covered. No spec-precision gaps: every AC names an exact value or state.

---

## Discrimination Sensor

Run in a detached scratch worktree of be23dfa (`node_modules` symlinked). For each mutant: unit tests plus the relevant e2e file(s). LESS mutants were recompiled with `npm run less:build`.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| M1 | `newsletter/index.html:73` | `backgroundColor=rgba(0,0,0,0)` → `rgba(10,15,20,1)` | ✅ Killed (BIT-12) |
| M2 | `newsletter/index.html:74` | added `loading="lazy"` | ✅ Killed (BIT-10) |
| M3 | `index.html:210` | added `target="_blank"` to the home CTA | ✅ Killed (BIT-03) |
| M4 | `index.html:210` | CTA `href` → `/dates/` | ✅ Killed (BIT-01, BIT-03) |
| M5 | `assets/js/home.js:247` | re-added the old `[data-home-newsletter]` submit listener | ⚪ Equivalent - no element matches, so behaviour is unchanged |
| M5b | `assets/js/home.js:247` | push `home_newsletter_submit` on `.home-signal-cta` click | ✅ Killed (`tracking.e2e.cjs:69`, received `[{ event: 'home_newsletter_submit' }]`) - survived in iteration 1 |
| M5c | `assets/js/home.js:247` | `preventDefault()` on CTA click (blocks the same-tab navigation) | ✅ Killed (`tracking.e2e.cjs:68`, received `[true]`) |
| M6 | `less/newsletter.less:15` | removed the `> .row` gutter fix | ✅ Killed (BIT-15 at 320, 768, 1280) |
| M7 | `less/newsletter.less:399` | removed iframe `border: 0` | ✅ Killed (BIT-14) |
| M8 | `less/newsletter.less` (EOF) | re-added `#mc_embed_signup { ... }` | ✅ Killed (BIT-19) |
| M9 | `newsletter/index.html:75` | dropped `rel="noopener"` | ✅ Killed (BIT-16) |
| M10 | `assets/js/home-core.js` exports | re-exported `newsletterEvent` | ✅ Killed (BIT-05 unit) |
| M11 | `newsletter/index.html:73` | `title=` → `title=Insane%20Driver` | ✅ Killed (BIT-11) |
| RM1 | `less/newsletter.less:522` | deleted `animation: none !important;` from the reduced-motion block | ✅ Killed (`theme.e2e.cjs:67`, 14 animations) |
| RM2 | `less/newsletter.less:518` | dropped `.cyber-panel-body` from the reduced-motion selector list | ✅ Killed (`theme.e2e.cjs:67`, 3 `newsletter-panel-glow` animations) |
| RM3 | `less/newsletter.less:516` | dropped `.cyber-zone::before` from the reduced-motion selector list | ✅ Killed (`theme.e2e.cjs:67`, `newsletter-noise` on `::before`) |

**Sensor depth**: expanded (16 mutations)
**Result**: 15/15 non-equivalent mutants killed (M5 equivalent) - PASS ✅

**Isolation**: `git status --porcelain` of the real tree was captured before the sensor and matched after `git worktree remove --force` + `git worktree prune`.

---

## Interactive UAT Results

Not performed by the Verifier. The spec's Success Criteria still need the manual browser check of the embed at 320/768/1280 px and one real signup by the user.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ |
| Surgical changes | ✅ (the `.row` fix is an approved scope change recorded in the spec Assumptions; be23dfa touches tests only) |
| No scope creep | ✅ |
| Matches patterns | ✅ (per-page `.less`, `panelByTab`/`holdNavigation` helpers, store-style reduced-motion test) |
| Spec-anchored outcome check (asserted values match spec) | ✅ |
| Per-layer Coverage Expectation met | ✅ |
| Every test maps to a spec requirement - no unclaimed tests | ✅ |
| Documented guidelines followed: none - strong defaults applied (tasks.md records no guideline files) | ✅ |

---

## Edge Cases

- [x] Tracker blocker blocks `bandsintown.com` → heading, copy, fallback link visible: BIT-17 (`tests/newsletter/markup.e2e.cjs:75-79` with the abort fixture `tests/photos/browser.cjs:3-5`).
- [x] 320px viewport → iframe stays inside its panel body: BIT-15 (`tests/newsletter/theme.e2e.cjs:7-16`).
- [x] Reduced motion → existing reduced-motion behaviour kept: `tests/newsletter/theme.e2e.cjs:55-69`. In a normal context it first checks that animations run (`:60` `toBeGreaterThan(0)`, so the test is not vacuous), then with `reducedMotion: 'reduce'` it checks `expect(await animated(reduced)).toEqual([])` (`:67`). Outside hosts are aborted on both contexts. RM1-RM3 killed.

---

## Gate Check

- **Gate command**: `npm run build && npm test` (Build gate from tasks.md)
- **Result**: build exit 0; unit 95 passed / 0 failed / 0 skipped; e2e 384 passed / 0 failed / 0 skipped (4.7 min). The known flaky HOME-29 test passed first time.
- **Test count before feature** (`master`): 91 unit + 370 e2e = 461
- **Test count after feature**: 95 unit + 384 e2e = 479
- **Delta**: +18. The removed tests (two HOME-47 tests, `tests/home/countries.e2e.cjs`) covered requirements this spec supersedes.
- **Skipped tests**: none
- **Failures**: none
- The gate left the real tree unchanged: the committed `assets/css/style.min.css` matches the output of `npm run less:build`.

---

## Fix Plans

None open. Iteration 1's Fix 1 (BIT-05 CTA click) and Fix 2 (reduced-motion test) are closed by be23dfa and confirmed by M5b, M5c and RM1-RM3 above.

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| BIT-01..BIT-20 | Implemented | ✅ Verified |

(The Verifier does not edit spec.md; the orchestrator applies these statuses.)

---

## Summary

**Overall**: ✅ Ready (pending the user's manual browser check and one real signup, per the spec's Success Criteria)

**Spec-anchored check**: 20/20 ACs matched spec outcome; 0 spec-precision gaps; 3/3 edge cases covered
**Sensor**: 15/15 non-equivalent mutants killed (M5 equivalent)
**Gate**: 479 passed, 0 failed (95 unit + 384 e2e), build OK

**What works**: home CTA link and same-tab navigation with no tracking push; every Mailchimp file, field and selector removed; the iframe `src` params and attributes; the fallback link; iframe fit with no overflow at all three widths; the panel styles kept from master; reduced motion on `/newsletter/`.

**Issues found**: none.

**Next steps**: update the spec traceability to Verified; the user does the manual browser check and the one live signup.
