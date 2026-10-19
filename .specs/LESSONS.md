# LESSONS - auto-maintained by scripts/lessons.py

> Machine-owned. Do NOT hand-edit. Changes are overwritten on the next `lessons.py` write.
> Canonical state lives in `.specs/lessons.json`. Edit lessons only via the script.
> promote_threshold=2 distinct features · window_days=45 · quarantine_threshold=2

## Confirmed (load these at Specify/Design)

Corroborated across multiple features. Safe to apply as guidance.

### L-004 - When a design decision deliberately narrows or reinterprets an AC's literal wording, update the AC text itself to match the confirmed decision instead of leaving the two in silent contradiction.
- signal: `spec_precision_gap` · recurrence: 2 feature(s) · scope: `spec-writing` · harmful: 0
- features: photos-cyberpunk-theme, home-cyberpunk
- evidence: PXCP-04 vs spec.md Assumptions row 'Secondary accent color' (spec-writing) (+1 more)
- last seen: 2026-09-30T03:35:42Z

## Candidates (under observation - do NOT load as guidance yet)

Seen once or not yet corroborated. Tracked, not trusted.

### L-001 - Exercise synchronization CLI entry points and assert stdout and Actions summaries, rather than only returned status objects.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `scripts` · harmful: 0
- features: photos-cyberpunk
- evidence: validation.md M3; scripts/sync-instagram.cjs:168 (scripts)
- last seen: 2026-09-18T03:03:43Z

### L-002 - When an AC lists multiple visual effects (overlay, animation, background pattern), add a test assertion for each one individually rather than only testing its reduced-motion off-state.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `photos` · harmful: 0
- features: photos-cyberpunk-theme
- evidence: PXCP-03; tests/photos/visual.e2e.cjs (photos)
- last seen: 2026-09-20T03:51:13Z

### L-003 - Assert computed font-family directly when an AC specifies a required typeface, instead of leaving font choice unverified by any test.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `photos` · harmful: 0
- features: photos-cyberpunk-theme
- evidence: PXCP-05; tests/photos/visual.e2e.cjs (photos)
- last seen: 2026-09-20T03:51:14Z

### L-005 - Assert the literal label text a spec quotes, not only the dynamic value rendered beside it
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `tests` · harmful: 0
- features: videos-player
- evidence: .specs/features/videos-player/validation.md:M13 (videos/index.html:42) (tests)
- last seen: 2026-09-20T22:03:29Z

### L-006 - When a spec forbids a behavior, assert its absence directly instead of asserting only the allowed behavior
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `tests` · harmful: 0
- features: videos-player
- evidence: .specs/features/videos-player/validation.md:M14 (assets/js/videos.js:152) (tests)
- last seen: 2026-09-20T22:03:29Z

### L-007 - Give each acceptance criterion's own test the stubs it needs to observe that criterion's outcome, not just adjacent state
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `tests` · harmful: 0
- features: videos-player
- evidence: .specs/features/videos-player/validation.md:M12 (tests/videos/select.e2e.cjs:45) (tests)
- last seen: 2026-09-20T22:03:29Z

### L-008 - State visual-layering requirements as a checkable property such as stacking order or element absence, never as a visual description
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `spec` · harmful: 0
- features: videos-player
- evidence: .specs/features/videos-player/validation.md:VPLR-23 (spec)
- last seen: 2026-09-20T22:03:29Z

### L-009 - Place an assertion on the code path where the behavior can actually fail, not on a path where it holds trivially
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `tests` · harmful: 0
- features: videos-player
- evidence: .specs/features/videos-player/validation.md:M18 (assets/js/videos.js:44) (tests)
- last seen: 2026-09-20T22:15:16Z

### L-010 - When a Liquid template guards a section with a count condition, assert both sides of the guard from the data, or the branch that today's data never reaches ships unverified.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `templates/liquid` · harmful: 0
- features: discography-cyberpunk
- evidence: DISC-45 / discography/index.html:142 (templates/liquid)
- last seen: 2026-09-21T02:52:24Z

### L-011 - An acceptance criterion that says 'for each release' while the Out of Scope table carves out a release type is ambiguous: state the rule per type, and add a data assertion, or nothing catches the divergence.
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `spec-writing` · harmful: 0
- features: discography-cyberpunk
- evidence: DISC-02 (spec-writing)
- last seen: 2026-09-21T02:52:24Z

### L-012 - Write external-link verification rules to cover 'could not be checked' and not only 'returned an error status'; a geo-blocked or unreachable service is the common case and needs the same null treatment.
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `external-links` · harmful: 0
- features: discography-cyberpunk
- evidence: DISC-46 (external-links)
- last seen: 2026-09-21T02:52:24Z

### L-013 - In a stylesheet-last task order, browser click tests fail on unstyled inline anchors whose bounding box centre misses the element; land the layout CSS before the interaction tests that depend on clicking.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `e2e/playwright` · harmful: 0
- features: discography-cyberpunk
- evidence: tests/discography/tracking.e2e.cjs / T11 (e2e/playwright)
- last seen: 2026-09-21T02:52:24Z

### L-014 - A container with overflow:hidden becomes a scroll container, so an in-page anchor inside it scrolls the container with no scrollbar to undo it; use overflow:clip when the box only needs to clip decorative layers.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `css/layout` · harmful: 0
- features: discography-cyberpunk
- evidence: DISC-48 / less/discography.less (css/layout)
- last seen: 2026-09-21T03:09:57Z

### L-015 - Copying a page shell from another page copies its width constraints too: check the reference page the user actually named before inheriting a max-width.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `css/layout` · harmful: 0
- features: discography-cyberpunk
- evidence: DISC-47 (css/layout)
- last seen: 2026-09-21T03:09:57Z

### L-016 - When a Liquid template guards a section with a count condition, assert both sides of the guard from the data, or the branch that today's data never reaches ships unverified.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `templates` · harmful: 0
- features: home-cyberpunk
- evidence: validation.md M13; index.html:42 (HOME-12) (templates)
- last seen: 2026-09-30T03:35:42Z

### L-017 - When an AC bounds a transition or animation duration, assert the computed duration against that bound, not only that the animation name is none.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `styles` · harmful: 0
- features: home-cyberpunk
- evidence: validation.md M17; less/home.less:1478 (HOME-29) (styles)
- last seen: 2026-09-30T03:35:42Z

### L-018 - State timing acceptance criteria with an explicit measurement tolerance, so the spec and the test bound are the same number.
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `spec-writing` · harmful: 0
- features: home-cyberpunk
- evidence: HOME-24 spec 0.4s vs tasks.md T17 0.5s (spec-writing)
- last seen: 2026-09-30T03:35:42Z

### L-019 - When a timing AC is enforced by a deferred script, test it with that script's delivery delayed, or keep a CSS/inline fallback that meets the bound without the script.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `loader` · harmful: 0
- features: home-cyberpunk
- evidence: validation.md round 2 HOME-24; assets/js/home.js:78-83 probe 759ms (loader) (+1 more)
- last seen: 2026-09-30T04:27:29Z

### L-020 - Cover timer edge guards with a controlled clock test, since real-time assertions only catch sub-millisecond races by chance.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `loader` · harmful: 0
- features: home-cyberpunk
- evidence: validation.md round 2 M23; assets/js/home.js:81 (loader)
- last seen: 2026-09-30T03:59:34Z

### L-021 - When a fallback path duplicates a side effect of the main path, assert that side effect on the fallback path too, not only on the main one.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `loader` · harmful: 0
- features: home-cyberpunk
- evidence: validation.md round 3 M29; _layouts/home.html:27 (loader)
- last seen: 2026-09-30T04:27:29Z

### L-022 - When a test asserts that a field is replaced, make the fixture's value differ from the default it replaces, or the assertion cannot fail
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `tests` · harmful: 0
- features: home-cyberpunk
- evidence: validation.md Round 6 M14 (assets/js/home.js:159-160) (tests)
- last seen: 2026-10-05T03:08:38Z

### L-023 - For a fallback edge case, test every input the spec names, and assert that the code after the guarded step still runs, not just that the fallback output is shown
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `tests` · harmful: 0
- features: home-cyberpunk
- evidence: validation.md Round 6 M15/M16 (assets/js/home.js:139-145) (tests) (+1 more)
- last seen: 2026-10-06T03:26:23Z

### L-024 - When a guard ORs several conditions, give each condition a test where it alone is true, or the other conditions mask its removal.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `tests` · harmful: 0
- features: home-cyberpunk
- evidence: validation.md Round 7 E6, E10; assets/js/home.js:42 (tests)
- last seen: 2026-10-06T03:26:23Z

### L-025 - When a timing AC's bound sits within ~100ms of a timer's target, assert it under a paused fake clock; a real-time bound flakes under main-thread load even when the time is read exactly.
- signal: `gate_fail` · recurrence: 1 feature(s) · scope: `tests` · harmful: 0
- features: home-cyberpunk
- evidence: validation.md Round 8 R8-A; tests/home/loader.e2e.cjs HOME-24 (523.6ms vs <=500) (tests)
- last seen: 2026-10-11T20:25:55Z

### L-026 - Cover data-driven template guards for states the real data never produces with a unit test that renders the template against a fixture
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `templates` · harmful: 0
- features: store-cyberpunk
- evidence: store/index.html:81 (mutant M17) (templates)
- last seen: 2026-10-13T02:06:09Z

### L-027 - When an AC fixes the order of visual items, assert their rendered positions in the browser, not only their DOM order, since CSS can reorder them.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `tests` · harmful: 0
- features: store-cyberpunk
- evidence: M13 less/store.less:522; tests/store/markup.e2e.cjs:170 (tests)
- last seen: 2026-10-18T01:05:28Z

### L-028 - State the order of visual items as a direction such as left to right or top to bottom, never as a bare 'then'.
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `spec-writing` · harmful: 0
- features: store-cyberpunk
- evidence: STORE-26 spec.md:106 (spec-writing)
- last seen: 2026-10-18T01:05:28Z

### L-029 - When a form is replaced by a link, rewrite its no-event test to activate the new element, not to loop over forms that no longer exist
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `e2e-tracking` · harmful: 0
- features: newsletter-bandsintown
- evidence: validation.md M5b; tests/home/tracking.e2e.cjs:65 (e2e-tracking)
- last seen: 2026-10-18T04:36:16Z

### L-030 - Map every spec edge case, including reduced motion, to a test row in the Test Coverage Matrix
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `e2e` · harmful: 0
- features: newsletter-bandsintown
- evidence: validation.md Edge Cases: reduced motion on /newsletter/ has no test (e2e)
- last seen: 2026-10-18T04:36:16Z

### L-031 - Give every confirmed decision with a precise value, such as a page title format or og:image source, its own AC id so a test asserts that exact value
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `spec-writing` · harmful: 0
- features: seo-discovery
- evidence: validation.md M17 discography/song.liquid:16 (spec-writing) (+1 more)
- last seen: 2026-10-19T01:11:36Z

### L-032 - Unit-test every template filter with adversarial input such as a < inside a JSON-LD value instead of relying on real data passing through it
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `eleventy-filters` · harmful: 0
- features: seo-discovery
- evidence: validation.md M13 .eleventy.js:63 (eleventy-filters)
- last seen: 2026-10-19T01:11:36Z

### L-033 - When an AC compares repo data with a source kept outside the repo, name the script or checked-in fixture that performs the comparison so the AC is testable
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `spec-writing` · harmful: 0
- features: seo-discovery
- evidence: LYR-01 (spec-writing)
- last seen: 2026-10-19T01:11:36Z

### L-034 - When a test takes its expected values from the same hand-collected data file it checks, also pin those values to an independent source or derived invariant, or a swapped or off-by-one entry passes.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `tests/data` · harmful: 0
- features: seo-discovery
- evidence: validation.md Pass 3 S4, S10 (tests/seo/song.e2e.cjs:156-158, :181) (tests/data)
- last seen: 2026-10-19T03:47:41Z

### L-035 - When a change adds a branch to an include shared by several pages, assert the unchanged output on the other pages too, not only on the page the change targets.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `templates` · harmful: 0
- features: seo-discovery
- evidence: validation.md Pass 3 S6 (_includes/discography/links.liquid:6, tests/seo/release.e2e.cjs:65) (templates)
- last seen: 2026-10-19T03:47:41Z

## Quarantined (failed when applied - ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
