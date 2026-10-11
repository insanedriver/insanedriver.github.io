# STATE

## Decisions

### AD-001
- **Decision**: Cancelar integração com Instagram e manter apenas acervo local repaginado.
- **Reason**: O perfil no Instagram contém mais conteúdos que fotos musicais e requer manutenção de tokens.
- **Trade-off**: Perdeu-se sincronização automática remota em prol de estabilidade e simplicidade estática.
- **Scope**: Galeria de fotos e scripts operacionais.
- **Date**: 2026-09-19
- **Status**: active

### AD-002
- **Decision**: Inserir 6 fotos do photoshoot 2020 no topo do acervo (foto 274 primeira) e randomizar os 6 destaques client-side entre fotos PROMO e LIVE.
- **Reason**: Destacar fotos recentes da banda mantendo o carrossel dinâmico em cada visita com imagens de alta resolução.
- **Trade-off**: Destaques variam por visita no cliente, com fallback estático das fotos de 2020 no HTML para SEO e no-JS.
- **Scope**: `photos/`, `_data/photos.json`, `_data/highlights.js`, `assets/js/photos.js`.
- **Date**: 2026-09-19
- **Status**: active

## Handoff

- **Feature**: home-cyberpunk (cyberpunk home page with boot loader)
- **Phase / Task**: Complete. Rounds 1-7 are described in `validation.md`. Round 8 (T29-T33, `097d73f`..`a393cba`) hardened the home tests with no product code change. The loader release is now stamped at the `is-done` mutation (T29). The early-fire guard (T30) and both HOME-24 repeat views (T33, fix R8-A) run under a paused `page.clock`. HOME-62 throws from each of loader, navbar, shuffle and preview (T31). HOME-05 and HOME-24 are reworded (T32). The round 8 Verifier passed, with R8-A as a non-blocking flake gap, and its re-verify of `a393cba` passed: 6/6 mutants killed, HOME-24 60/60 at 20x, unit 87/87, Playwright 244/244. `validate_state.py` passes. Lesson L-025 recorded (candidate).
- **Round 9 (phone fit, 2026-10-11)**: The user reported mobile misalignment at iPhone XR (414x896). T34-T36 (`82d4d71`..`3337324`, HOME-71..73) fixed it:
  - The NOW::STREAMING cover fills the panel up to 420px.
  - The hero buttons stay inside the card, stacked below 400px.
  - Every streaming platform name sits on one centered line with 16px clear, and the links use 2 columns from 860 to 1199px.
  - The fit tests serve the real Rajdhani and Share Tech Mono files from `tests/home/fonts/`, because the shared fixture blocks Google Fonts.
  - The Verifier passed: 12 mutants killed and 7 equivalent or spec-neutral, unit 87/87, Playwright 281/281.
  - Open, needs a user decision: R9-A. From 560 to 859px the 420px cover sits left with an empty strip beside it, which HOME-71 allows.
- **In-progress**: none
- **Next step**: user decision on R9-A, then user review of `feature/home-cyberpunk`, then open the PR. Nothing has been pushed.
- **Blockers**: none
- **Uncommitted files**: none (agent tool dirs `.agent/`, `.agents/`, `.claude/`, `.codex/`, `.cursor/`, `.gemini/`, `.github/skills/`, `.windsurf/`, `skills-lock.json` are untracked on purpose and not part of this feature)
- **Branch**: feature/home-cyberpunk
- **Open follow-ups for a separate site-wide PR (user decision, 2026-10-11)**:
  - Remove the dead Universal Analytics `UA-60390716-1` snippet from `_includes/head/analytics.liquid` and the inline copy in `dates/index.html`, and keep GTM `GTM-WW9HZGP`. GA4, if wanted, goes inside GTM.
  - Replace the band page `fa fa-bandcamp` (`band/index.html:159`, which has no glyph in FA 4.4) with an inline SVG Bandcamp logo that uses `currentColor`.
  - Scope the cyber block after `less/contact.less:239` under `#page_contact`. Keep the keyframes global if other pages use them. Drop the compensating `max-width: 100%` hacks in home, discography, photos, videos, band and mailchimp. Confirm there is no visual change.
  - Dedupe `.cyber-zone`, `.cyber-zone-inner` and `.cyber-panel` across 7 stylesheets through shared LESS mixins, each called inside its page scope.
- **Other notes**:
  - Lessons L-022..L-025 are candidates and are promoted only by `lessons.py` at 2 features.
  - HOME-14 needed no rewording.
  - `LOADER_REPEAT` is masked in e2e by the head gate's own 400ms release, so the unit test `home-core.test.cjs:78` is its only guard.
