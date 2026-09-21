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

- **Feature**: discography-cyberpunk (multi-platform discography, cyberpunk theme)
- **Phase / Task**: Complete - Verifier PASS, gaps G1/G2 closed, spec amended (A1, A2)
- **Completed**: T1-T13 plus two follow-ups (gap tests, spec amendments); 16 commits on the branch
- **In-progress**: none
- **Next step**: user review of the branch, then open the PR. Nothing has been pushed
- **Blockers**: none
- **Uncommitted files**: none tracked
- **Branch**: feature/discography-cyberpunk
- **Open follow-ups, not part of this feature**: band page asks for `fa fa-bandcamp`, a glyph the bundled Font Awesome 4.4 does not have, so that button renders empty (`band/index.html:158`); `.cyber-zone` / `.cyber-panel` remain copy-pasted across page stylesheets; `less/contact.less:328` leaks an unscoped `.cyber-zone-inner` max-width site-wide; the home page still carries the pre-cyberpunk player block; Universal Analytics (`UA-60390716-1`) has not processed data since 2023
