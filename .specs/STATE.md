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

- **Feature**: song-video-bento (bento grid for song pages with a video: meta bar with QUICK PLAY, panels A video / B audio uplink / D dossier / C lyrics, track sequencer bar, neon HUD finish)
- **Phase / Task**: Complete. T1-T10 plus `5eb1729` (rebuilt discography.min.css: T8/T9 had committed a stale bundle) and Verifier fixes `42a9930` (BENTO-10/12 hash, BENTO-21 click test) and `d7973f0` (BENTO-20 wording); range `6b06e2c^..d7973f0` on `feature/song-video-bento`.
- **Verification**: Verifier PASS on iteration 2. 42/42 ACs Verified. Unit 214/214, scoped e2e 275/275; sensor 7/7 killed. Candidate lessons L-045..L-047.
- **Known flakes (pre-existing)**: HOME-24/26/28 loader timing; PS2-23 (`/photos/` networkidle) failed 4/4 in this environment on 2026-10-23, unrelated to this feature.
- **Next**: push the branch and open the PR (needs the user's go-ahead).
