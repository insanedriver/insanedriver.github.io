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

- **Feature**: newsletter-bandsintown (Mailchimp, now lost, replaced by the Bandsintown mailing-list embed for artist 10752930)
- **Phase / Task**: Complete. T1-T6 plus one verifier fix, `13c3680`..`be23dfa` and the closing docs commit, on `feature/newsletter-bandsintown` branched from `master` at `d7efa45`.
- **Verification**: Verifier PASS on iteration 2. 20/20 ACs and 3/3 edge cases have evidence. The sensor killed 15/15 real mutants (one equivalent mutant). Unit 95/95, Playwright 384/384, build green. Candidate lessons L-029 and L-030.
- **Amendments during Execute (user-approved or forced by facts)**:
  - The embed lives only on `/newsletter/`. The home SIGNAL::NEWSLETTER panel became a `Join the network` link to `/newsletter/`, because an iframe on the home breaks HOME-06 (user decision).
  - `/newsletter/` scrolled 15px sideways on `master`; T5 zeroes the `.row` gutters so BIT-15 holds.
  - HOME-44..48 and NEWS-03..06, NEWS-10 are marked superseded.
- **In-progress**: none
- **Next step**: the user submits one real address through the embed on `/newsletter/` and checks it in Bandsintown for Artists; then push and open the PR (needs the user's go-ahead). `/dates/` widget upgrade is the deferred follow-up feature.
- **Blockers**: none
- **Branch**: feature/newsletter-bandsintown
- **Previous handoff**: store-cyberpunk, merged as PR #42.
