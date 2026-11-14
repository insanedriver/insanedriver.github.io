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

- **Feature**: desktop-layout (`.specs/features/desktop-layout/spec.md`).
- **Phase / Task**: Both implementation steps complete locally: shared frame `4013473`, bounded grids/media `99c2135`.
- **Branch**: `fix/desktop-layout-standard`, based on `b0a9d7f`.
- **Verification**: Build and unit suite passed (33 test files); independent desktop gate 56/56 passed. Isolated product-grid mutation killed. Independent report: `.specs/features/desktop-layout/validation.md`.
- **Known failures**: Broader affected-page regression 238 passed / 22 failed: 20 obsolete global fans-of expectations and 2 About/Also alignment expectations in `tests/discography/song-bento.e2e.cjs`. Relevant source/tests unchanged from the branch base; old-CSS runtime probe was blocked by execution permission. These remain outside the completed layout change; no full-repository green verdict is claimed.
- **Next step**: Review the completed local layout commits and independent report. No remote publication was requested; no PR was found for this branch during resumption.
- **Uncommitted files outside feature scope**: Preserve the pre-existing `.specs/LESSONS.md`, `.specs/lessons.json`, tool/skill directories and `skills-lock.json` changes; do not include them in layout commits.
