# Song Similar Bands & SEO Enrichment Design

## Architecture Overview

Build-time static enrichment pipeline in Eleventy (`lib/catalog.js` + Liquid templates):

```
[seo_catalog_local.md] (external, local only)
        │  (manual run: node scripts/import-seo-catalog.cjs)
        ▼
[_data/seo-catalog.json] (versioned in repo, 24 tracks, ✅-only bands)
        │
        ▼
[lib/catalog.js] ──► song.seo (fansOf, genres, bands[], keywords)
        │         └──► release.seo (top-4 recurring ✅ bands, unique genres)
        ▼
┌─────────────────────────────────────────────────────────────┐
│ Templates                                                   │
│  • _includes/seo/fans-of.liquid (song → release → fallback) │
│  • _includes/discography/song-dossier.liquid (Sonic DNA)    │
│  • discography/song.liquid (meta description + MusicRec)    │
│  • discography/release.liquid (MusicAlbum genre)            │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. Local Importer & Versioned Data
- **Importer**: `scripts/import-seo-catalog.cjs` parses `seo_catalog_local.md` (defaulting to `/home/deivid/Projects/InsaneDriver/classifier-agent/data/seo_catalog_local.md`, overridable via CLI arg).
- **Filtering rule**: Only table rows with `| ✅ |` are extracted. Each band stores `name`, `era`, `referenceTracks`, `score` (numeric, for album ranking tie-break only), and `justification` (first sentence(s) of `Technical Justification (EN)` before `"MERT acoustic similarity of"`).
- **Output**: `_data/seo-catalog.json` keyed by track `slug`.

### 2. Catalog Join & Album Aggregation (`lib/catalog.js`, `_data/catalog.js`)
- `build({ discography, songs, lyrics, videos, platforms, seoCatalog })` accepts optional `seoCatalog` (defaulting to `{}` for backward compatibility with existing unit tests).
- `formatFansOf(names)`: `1` -> `"For fans of A"`, `2` -> `"For fans of A and B"`, `3+` -> `"For fans of A, B, ... and Z"`.
- `song.seo`: `{ primaryGenre, secondaryGenre, genres, bands, fansOf, keywords }`.
- `release.seo` (for albums): aggregates `✅` bands across the album's tracks, ranked by `count DESC, maxScore DESC, name ASC`, keeping top 4 names for `fansOf` and deduplicated `genres`.

### 3. Templates & Styling
- `_includes/seo/fans-of.liquid`: checks `song.seo.fansOf`, then `release.seo.fansOf`, then default `"For fans of Alter Bridge, Killswitch Engage and Avenged Sevenfold"`. Note: in `discography/song.liquid` and `discography/release.liquid`, `song` / `release` are in scope; on Home and `/band/`, neither has `.seo.fansOf`, so fallback renders cleanly.
- `_includes/discography/song-dossier.liquid`: renders `.song-sonic-dna` section with Primary/Secondary genre tags and `.song-similar-list` items (band name, `Reference tracks: ...`, and editorial justification).
- `discography/song.liquid`: `page_description` puts `{{ song.seo.fansOf }}. ` *before* `song.about` (or instrumental summary) so `metaDescription` (160-char cap) never drops `For fans of ...`. `MusicRecording` JSON-LD includes `"description"`, `"keywords"`, and `"genre"`.
- `discography/release.liquid`: `MusicAlbum` JSON-LD uses `release.seo.genres` when present.
- `less/discography.less`: styles `.song-sonic-dna`, `.song-genre-tags`, `.song-similar-list` to match the existing `.song-about` / `.song-also` dossier styling across `video`, `lyrics`, and `stack` layouts.
