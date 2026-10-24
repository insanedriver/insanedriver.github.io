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

- **Feature**: discography-hub (`/discography/` becomes a hub: hero with the catalog counter, three album card links with a 3-line description and OPEN RELEASE, all 18 singles as card links, one CollectionPage JSON-LD; BUY CD and PREVIEW move onto the album release pages)
- **Phase / Task**: Complete. T1-T6 plus `0b4c9bf` (DISC-11 relocated) and Verifier fix `fd57656`; range `master..feature/discography-hub`, branched from `master` at `c0bb895`.
- **Verification**: Verifier PASS on iteration 2. 24/24 ACs Verified. Unit 218/218, scoped e2e 324/324; sensor 15 distinct mutants, all killed. Candidate lessons L-049/L-050 recorded.
- **Known flakes (pre-existing)**: HOME-24/26/28 loader timing; PS2-23 (`/photos/` viewer) fails every run in this environment.
- **Next**: the user pushes `feature/discography-hub` and opens its PR against `master`.
