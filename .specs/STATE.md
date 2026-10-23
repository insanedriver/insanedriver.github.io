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

- **Feature**: song-bento-no-video (the 10 sung songs without a video use the bento: meta bar with LISTEN NOW, Panel C lyrics beside a sticky Panel B, full-width Panel D with About and "Also released as" split 4:2; instrumentals keep the stack)
- **Phase / Task**: Complete. T1-T6 plus Verifier fix `699ede0` (BENTO-24/30 checks on the lyrics layout); range `ef05bd0..699ede0` on `feature/song-bento-no-video`, branched from `feature/song-video-bento`.
- **Verification**: Verifier PASS on iteration 2. 23/23 ACs Verified. Unit 218/218, scoped e2e 315/315; sensor 10 killed, 1 equivalent (NOVID-13 guard: every song has Spotify today). L-037 promoted to confirmed; candidate L-048.
- **Known flakes (pre-existing)**: HOME-24/26/28 loader timing; PS2-23 (`/photos/` networkidle) fails every run in this environment.
- **Next**: the user pushes `feature/song-video-bento` and opens its PR (auto mode blocked the push; body in the scratchpad), then pushes `feature/song-bento-no-video` and opens a PR stacked on it.
