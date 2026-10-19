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

- **Feature**: seo-discovery (non-brand discovery: sitemap/robots/canonical/OG, genre-aware copy and MusicGroup, 7 release pages, 22 song pages with lyrics, video facade, breadcrumbs)
- **Phase / Task**: Complete. T1-T23 (T22 `/band/` overflow and T23 verifier fix added during Execute), `1baa2d8`..`2746fba` on `feature/seo-discovery` branched from `master` at `465e649`.
- **Verification**: Verifier PASS on iteration 2. 50/50 ACs with evidence, sensor 15/15 killed (pass 1: 15/18). Unit 147, Playwright 541-542/542 (HOME-23/24/29 loader timing tests flaky, also on master). Sitemap 38 URLs. Candidate lessons L-031..L-033.
- **Amendments during Execute (user-approved)**:
  - HOME-53 expects the new home og:title; footer Spotify moved to open.spotify.com and Bandcamp added, so HOME-52 expects 6 links.
  - Lyrics: EN in `_data/lyrics/<album>/<song>.txt` (rendered), PT in `.pt.txt` (stored, not rendered); originals moved to `../lyrics-originals/`.
  - SEO-12 (title formats) and SEO-13 (cover og:image) added from confirmed Assumptions after verifier pass 1.
- **In-progress**: none
- **Next step**: band reviews the drafted copy in the PR; push and open the PR (needs the user's go-ahead); after deploy, submit the sitemap in Search Console and run the Rich Results Test.
- **Follow-ups (not done)**: `/dates/` Bandsintown widget over http; header menu still links play.spotify.com; HOME-23 flaky; optional `[Speech]` label in Firstly My Breakfast lyrics; LYR-01 source equality is a manual check.
- **Blockers**: none
- **Branch**: feature/seo-discovery
- **Previous handoff**: newsletter-bandsintown.
