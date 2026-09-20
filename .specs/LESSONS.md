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

## Quarantined (failed when applied - ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
