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

- **Feature**: store-cyberpunk (single `/store/` page with the combo and both CDs, cyberpunk theme)
- **Phase / Task**: Complete. T1-T5 plus two follow-ups, `91415d4`..`d974a54` on `feature/store-cyberpunk`, which is branched from `master` at `c1b2eb6`.
- **Verification**: The Verifier passed on iteration 2. 24/24 ACs and both edge cases have evidence. The sensor killed 16/16 mutants. Unit 91/91, Playwright 336/336, build green. Lesson L-026 recorded as a candidate (template guards for data states the real catalog never produces).
- **Amendments during Execute (user-approved or forced by facts)**:
  - STORE-06: the combo shows both 600px covers stacked, because `silicon-preorder-combo.png` is 180x120. The user chose this.
  - STORE-18: the overflow check is scoped to `[data-store]`.
- **Follow-ups closed on 2026-10-17** (same branch):
  - `fba8849`: the header `.menu-center` 768-991px fix moved to `less/header.less` for every page; `tests/site/header.e2e.cjs` covers 9 pages at 768 and 991px.
  - `4cb09f0`: removed the unreferenced `silicon-preorder-combo.png` and `silicon-preorder-cd.png`.
  - `d3bf941`: `gray-matter` 4.0.2 is now a direct devDependency.
  - `093ff15`: R9-A. The user chose to centre the cover; HOME-71 amended, test covers 600 and 859px.
  - Gate: build green, unit 91/91, Playwright 356/356.
- **Round 2, Brazil panel redesign (2026-10-17)**: grilling then spec; STORE-12 amended, STORE-25..31 added. T6 `5b57b09` + fix R2-1 `b118f89`. Verifier PASS on iteration 2 (14/14 mutants killed). Unit 91/91, Playwright 370/370, build green. Candidate lessons L-027/L-028 (visual order must be asserted by rendered position and specified as a direction).
- **In-progress**: none
- **Next step**: review and merge PR #42 (`feature/store-cyberpunk` → `master`), opened 2026-10-17.
- **Blockers**: none
- **Branch**: feature/store-cyberpunk
- **Previous handoff**: home-cyberpunk was merged as PR #40; R9-A is now closed by `093ff15`.
