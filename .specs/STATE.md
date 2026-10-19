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
- **Phase / Task**: Complete. T1-T26 (T22 `/band/` overflow, T23 verifier fix, T24 per-track song links at the user's request, T25-T26 verifier fixes), `1baa2d8`..`52c33c8` on `feature/seo-discovery` branched from `master` at `465e649`.
- **Verification**: Verifier PASS (pass 2 for T1-T23; pass 5 for T24-T26, fix loop closed on iteration 3/3). 50/50 ACs with evidence; T24 sensor 13/13 real mutants killed. Track URLs checked live except Bandcamp (Client Challenge). Unit 149, Playwright 547/547 (HOME-23/24/29 loader timing tests flaky, also on master). Sitemap 38 URLs. Candidate lessons L-031..L-036.
- **Amendments during Execute (user-approved)**:
  - HOME-53 expects the new home og:title; footer Spotify moved to open.spotify.com and Bandcamp added, so HOME-52 expects 6 links.
  - Lyrics: EN in `_data/lyrics/<album>/<song>.txt` (rendered), PT in `.pt.txt` (stored, not rendered); originals moved to `../lyrics-originals/`.
  - SEO-12 (title formats) and SEO-13 (cover og:image) added from confirmed Assumptions after verifier pass 1.
  - SONG-07 reworded (T24): song pages link to the track on Spotify/Apple/YT Music/Deezer (and Bandcamp for Silicon Fortress); Tidal, Amazon and 2016 Bandcamp fall back to the album. Track URLs live in `_data/songs.json`, pinned by `tests/seo/track-ids.fixture.json`.
- **After the verifier (user-requested, 2026-10-19)**: song video fills the panel width; About texts for the 9 debut lyric songs (Buried Thoughts rewritten); song pages show their own single's cover; Fallen Dreams (Acoustic) gets a release page (8 releases, sitemap 39 URLs); review fixes (deploy builds before unit tests, VideoObject without contentUrl, header logo href="/").
- **In-progress**: none
- **Next step**: PR open against master; after deploy, submit the sitemap in Search Console and run the Rich Results Test.
- **Follow-ups (not done)**: `/dates/` Bandsintown widget over http; header menu still links play.spotify.com; HOME-23 flaky; optional `[Speech]` label in Firstly My Breakfast lyrics; LYR-01 source equality is a manual check.
- **Blockers**: none
- **Branch**: feature/seo-discovery
- **Previous handoff**: newsletter-bandsintown.
