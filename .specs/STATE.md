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

- **Feature**: home-cyberpunk (cyberpunk home page with boot loader)
- **Phase / Task**: Complete. Verifier round 3 escalated two findings, and the user approved Fix A + B (round 4 in `validation.md`). Both are fixed, plus a late-parse repeat-view defect found while testing.
- **In-progress**: none
- **Next step**: user review of `feature/home-cyberpunk`, then open the PR. Nothing has been pushed.
- **Blockers**: none
- **Uncommitted files**: none
- **Branch**: feature/home-cyberpunk
- **Open follow-ups, not part of this feature**: the HOME-24 "second view" e2e is load-sensitive (pre-existing, about 2/30 at `75b1ca5`); M23 needs a `page.clock` test; HOME-05/14/24 wording; band page `fa fa-bandcamp` glyph missing in FA 4.4; `.cyber-zone` / `.cyber-panel` copy-pasted across stylesheets; `less/contact.less:328` unscoped `.cyber-zone-inner`; Universal Analytics `UA-60390716-1` is dead
