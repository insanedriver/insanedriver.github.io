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

- **Feature**: photos-2020
- **Phase / Task**: Phase 1 / T1 - Ingestão de assets e miniaturas do photoshoot 2020
- **Completed**: None
- **In-progress** (file:line): Preparando ingestão de imagens de ~/Downloads/2020-photoshoot-insane para assets/gallery/promo2020/
- **Next step**: Executar T1 (copiar imagens e gerar miniaturas proporcionais de 285px de largura).
- **Blockers**: none
- **Uncommitted files**: `.specs/features/photos-2020/spec.md`, `.specs/features/photos-2020/tasks.md`
- **Branch**: master

