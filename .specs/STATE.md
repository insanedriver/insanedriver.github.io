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

- **Feature**: videos-player (ID-TV // Transmission Feed)
- **Phase / Task**: Validation complete - PASS (round 2, after 1 fix->re-verify iteration)
- **Completed**: T1-T12, FT1-FT3, plus two follow-up tidy-ups from the round-2 report
- **In-progress**: none
- **Next step**: real-device UAT (iOS Safari autoplay after async API load, see validation.md open risk); then user review / merge (local commits only, no push done)
- **Blockers**: none
- **Uncommitted files**: none
- **Branch**: feature/videos-player
