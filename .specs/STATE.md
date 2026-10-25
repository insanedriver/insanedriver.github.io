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

- **Feature**: single-lyrics (Waiting for You and The Sun Will Rise become lyrics bento song pages at `/discography/<slug>/`; `songs.json` entries may name a `single` instead of an `album`; lyrics in `_data/lyrics/singles/`)
- **Phase / Task**: Complete. T1-T5 plus the Verifier cosmetic follow-up; range `master..feature/single-lyrics`, branched from `master` at `755cafc`.
- **Verification**: Verifier PASS on iteration 1. 21/21 ACs Verified. Unit 232/232, scoped e2e 329/329; sensor 12 mutants, 11 killed, 1 equivalent. No lessons recorded.
- **Known flakes (pre-existing)**: HOME-24/26/28 loader timing; PS2-23 (`/photos/` viewer) fails every run in this environment.
- **Next**: the user reviews the Portuguese translations and the two `about` texts, then pushes `feature/single-lyrics` and opens its PR against `master`.
