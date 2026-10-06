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
- **Phase / Task**: Complete. Rounds 1-5 are described in `validation.md`. Round 6 added the NOW::STREAMING shuffle (HOME-55..58). Round 7 fixed the six `/code-review` findings (HOME-59..70, T21-T28, `5979787`..`7d2c45b`). Its Verifier failed on 3 surviving mutants (E3, E6, E10), and the test-only fix `46c354e` closed them. Round 7 re-verify on 2026-10-06 passed: all 17 round-7 mutants killed, unit 87/87, Playwright 240/240. `validate_state.py` passes.
- **In-progress**: none
- **Next step**: user review of `feature/home-cyberpunk`, then open the PR. Nothing has been pushed.
- **Blockers**: none
- **Uncommitted files**: none (agent tool dirs `.agent/`, `.agents/`, `.claude/`, `.codex/`, `.cursor/`, `.gemini/`, `.github/skills/`, `.windsurf/`, `skills-lock.json` are untracked on purpose and not part of this feature)
- **Branch**: feature/home-cyberpunk
- **Open follow-ups, not part of this feature**: HOME-62 is tested only with the navbar throwing; lessons L-022/L-023/L-024 are candidates; the HOME-24 "second view" e2e is load-sensitive (fired once in round 7, ~540ms); M23 needs a `page.clock` test; HOME-05/14/24 wording; band page `fa fa-bandcamp` glyph missing in FA 4.4; `.cyber-zone` / `.cyber-panel` copy-pasted across stylesheets; `less/contact.less:328` unscoped `.cyber-zone-inner`; Universal Analytics `UA-60390716-1` is dead
