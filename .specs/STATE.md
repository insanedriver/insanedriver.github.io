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
- **Open follow-ups, not part of this feature**:
  - The site header `.container.menu-center` overflows to 781px at 768px on every page.
  - `silicon-preorder-combo.png` and `silicon-preorder-cd.png` are now unreferenced.
  - `tests/store/store-template.test.cjs` relies on `gray-matter`, which comes in only through Eleventy and is not a direct devDependency.
- **In-progress**: none
- **Next step**: user review, then push and open the PR. Nothing is pushed.
- **Blockers**: none
- **Branch**: feature/store-cyberpunk
- **Previous handoff**: home-cyberpunk was merged as PR #40, but R9-A (the 560-859px cover strip) is still open for a user decision.
