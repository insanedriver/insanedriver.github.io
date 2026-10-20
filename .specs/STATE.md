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

- **Feature**: perf-pagespeed-2 (home PageSpeed round 2: cover srcset 160/320/600, WebP gallery thumbnails and logos, home.min.css inlined, home font preloads, hero preload fetchpriority, navbar init without forced reflow)
- **Phase / Task**: Complete. T1-T16 plus Verifier fixes `82110f7` (PS2-23, viewer placeholder WebP) and `e68b512`; range `e469660..HEAD` on `feature/perf-pagespeed-2`.
- **Verification**: Verifier PASS on iteration 3. 23/23 ACs Verified. Unit 205/205, e2e 587/587. Lessons L-042..L-044.
- **Known flakes (pre-existing, also on master)**: HOME-71 (`tests/home/phone-fit.e2e.cjs`) measures before the lazy cover has a width; loader timing tests HOME-24/26/28/67 and PERF-35 under machine load. A scripted `link.click()` on a `/photos/` archive link sometimes follows the link instead of opening the viewer.
- **Next**: push the branch, open the PR, deploy, then measure the home with Lighthouse 12.6 against production (goal ≥ 90 mobile, ≥ 98 desktop).
