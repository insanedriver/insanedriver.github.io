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

- **Feature**: perf-pagespeed (deferred GTM/Pixel trackers, jQuery/Bootstrap/Owl removed with a vanilla nav, per-page CSS bundles over a core under 200 KB, self-hosted woff2 fonts with swap, responsive WebP images with sizes, boot loader shortened to 0.6-1.5 s with a 2 s failsafe)
- **Phase / Task**: Complete. T1-T20 plus fix iterations 1-3, `8740dc5`..`f40a350` on `feature/perf-pagespeed`.
- **Verification**: Verifier PASS on iteration 4 (an extra pass the user approved after iteration 3 FAILed on surviving mutant N9). 40/40 ACs Verified. Sensor 8/8 killed in iteration 4. Unit 183/183, e2e 579/579 in two full runs. Candidate lessons L-037..L-041.
- **In-progress**: none
- **Next step**: open a PR against master (needs the user's go-ahead); after deploy, re-run PageSpeed Insights on `/` and `/band/`.
- **Watch items**: the CSS-only failsafe window has 500 ms of slack (`tests/home/loader-style.e2e.cjs:48`); HOME-24/26/29/67/71 are historically flaky.
- **Blockers**: none
- **Branch**: feature/perf-pagespeed
- **Previous handoff**: seo-discovery (PR against master; follow-ups: `/dates/` Bandsintown widget over http, header menu still links play.spotify.com, LYR-01 source check is manual).
