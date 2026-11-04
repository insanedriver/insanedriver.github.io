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

- **Feature**: song-listen-button (exclude `.song-bento-quickplay` from `.disc-page a:not(...)` link colors so `Listen now` and `Quick play` render `#03080e` text on `#00f3ff` at rest and on `#fcee0a` on hover/focus)
- **Phase / Task**: Complete. Branch `fix/song-listen-button`, branched from `master` at `1d3176d`.
- **Verification**: Verifier PASS on iteration 1. 3/3 ACs Verified. Unit 232/232, scoped e2e 115/115 (`song-bento` + `single-lyrics`) and 28/28 (`theme` + `single-lyrics`); sensor 6/6 mutants killed. No lessons recorded.
- **Known flakes (pre-existing)**: HOME-24/26/28 loader timing; PS2-23 (`/photos/` viewer) fails every run in this environment.
- **Next**: push `fix/song-listen-button` and open its PR against `master` (or merge into `master`).
