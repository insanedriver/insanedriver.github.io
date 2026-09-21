# LESSONS - auto-maintained by scripts/lessons.py

> Machine-owned. Do NOT hand-edit. Changes are overwritten on the next `lessons.py` write.
> Canonical state lives in `.specs/lessons.json`. Edit lessons only via the script.
> promote_threshold=2 distinct features · window_days=45 · quarantine_threshold=2

## Confirmed (load these at Specify/Design)

Corroborated across multiple features. Safe to apply as guidance.

_none_

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

### L-004 - When a design decision deliberately narrows or reinterprets an AC's literal wording, update the AC text itself to match the confirmed decision instead of leaving the two in silent contradiction.
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `spec-writing` · harmful: 0
- features: photos-cyberpunk-theme
- evidence: PXCP-04 vs spec.md Assumptions row 'Secondary accent color' (spec-writing)
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

## Quarantined (failed when applied - ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
