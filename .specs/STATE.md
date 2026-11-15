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
- **Phase / Task**: All implementation/test tasks committed through `4cdb91a`; T1–T7 complete. Final readiness documents record the green full gate and independent PASS.
- **Branch**: `fix/desktop-layout-standard`, based on `b0a9d7f`.
- **Verification**: Normal build passed; final `npm test` exited 0 with 240 unit and all 768 browser cases passed (17.1m browser phase). Independent PASS: 13/13 requirements, 225 selected browser cases, raw SEO audit, 8 byte-matched bundles, 4/4 isolated mutations killed, scratch/real-tree isolation verified. Spec/tasks/state validators passed. Report: `.specs/features/desktop-layout/validation.md`; full gate: `/tmp/desktop-pr-final-all.log`.
- **Known failures / diagnostics**: No failures remain in the final full gate. Prior source/test issues and loader sampling races were fixed; loader production deadlines are unchanged. Earlier diagnostic logs under `/tmp/desktop-pr-diagnostic-{1,2,3}.log` are historical and superseded by the final green result.
- **PR**: [#56 — fix(layout): standardize desktop frames and media sizing](https://github.com/insanedriver/insanedriver.github.io/pull/56), opened against `master`; branch published as `origin/fix/desktop-layout-standard`.
- **Next step**: Review PR #56 and merge when approved. The reviewed base is `b0a9d7f`; all implementation, tests and readiness validation are complete. No merge or production deployment was requested or performed.
- **Uncommitted files outside feature scope**: Preserve the pre-existing `.specs/LESSONS.md`, `.specs/lessons.json`, tool/skill directories and `skills-lock.json` changes; do not include them in layout commits.
