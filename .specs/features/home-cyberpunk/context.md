# Home Cyberpunk - User Decisions

Captured from a grilling session on 2026-09-27. Three rounds, every branch confirmed by the user.

## Role and structure

| Decision | Choice | Rationale |
| --- | --- | --- |
| Role of the home | Cinematic hub: full-screen hero plus teaser panels fed by `_data/`, each leading to its internal page | The internal pages were just rebuilt; the home becomes the strongest entry point instead of duplicating them. |
| Layout | `_layouts/home.html` rewritten; Owl carousel and the old logo-as-`h1` removed; menu and footer stay the shared includes | The Owl carousel holds one image; the old `h1` hides text with `text-indent`. |
| Sections, in order | HERO -> NOW::STREAMING -> ID-TV::LATEST -> DISC::ARCHIVE -> VISUAL::FEED -> SIGNAL::NEWSLETTER -> footer | Hub order: newest music first, then video, catalog, photos, conversion. A band teaser was offered and left out to keep the page tight. |
| Legacy content | The five YouTube iframes, the Spotify playlist iframe, `home.js`, `#player-sf` removed from the home | Six heavy iframes on first load; ID-TV already plays the videos. |
| Legacy files | Deleted only when no other page uses them | Owl is in `js/pack` and `insane.js`, loaded site-wide. Round 7 found `please-wait` unused after all (the note that `dates/` and `spotify-select-playlist` used it was wrong) and deleted it with `sk-wave.less` and `player.less` (HOME-70). |

## Loader

| Decision | Choice | Rationale |
| --- | --- | --- |
| Keep a loader | Yes - a new cyberpunk loader with the Insane Driver logo | The user wants the "sensação de loading"; the old one blocked on every iframe. |
| Visual | Logo with RGB-split glitch and cyan/magenta glow, `Share Tech Mono` boot log lines, progress bar, scanlines | Same vocabulary as the `.cyber-panel` HUD. |
| End condition | Hero image and fonts ready, minimum ~1.2s, hard cap ~3.5s | Feels like a boot, never traps a visitor. |
| Frequency | Full on the first home view of the session; ~0.4s flash on later views in the same session | Returning to the home through the menu should not replay the full boot. |
| Escape hatches | Click or `Esc` skips; reduced-motion gets a short static fade; without JavaScript it never appears | Accessibility and progressive enhancement. |

## Hero

| Decision | Choice | Rationale |
| --- | --- | --- |
| Photo | `assets/images/band.jpg` (1920x1280, black backdrop) with responsive WebP derivatives | Black backdrop melts into the neon; a fixed image can be preloaded by the loader. |
| Height | 100svh | The "this is the page" impact. |
| Heading | Semantic `h1` "Insane Driver" rendered with the logo | Replaces the `text-indent` hack. |
| Tagline | `BRAZILIAN METAL // SINCE 2013` | The band has been active since 2013 (user). |
| Primary CTA | Latest release card with Spotify and Apple Music buttons | Two highest-traffic destinations, same as discography. |
| Latest release rule | Most recent `releaseDate` across albums and singles in `_data/discography.json` | A new single is a data edit; the home follows. Today: Keep Away (Acoustic), 2025-05-09. |
| Navbar on the home | Transparent over the hero, solid background once scrolled; other pages unchanged | Lets the hero own the full viewport. |

## Cross-cutting

| Decision | Choice |
| --- | --- |
| Newsletter | Inline Mailchimp form, same `action` as `/newsletter/` |
| SEO | Real `h1`, `MusicGroup` JSON-LD with social `sameAs`, Open Graph + Twitter card using the hero photo |
| Tracking | `dataLayer.push` on hero platform CTAs, video teaser, album covers, newsletter submit and loader skip |
| Motion | Every animation honors `prefers-reduced-motion` |
| Language | English |
| Process | Branch `feature/home-cyberpunk`, atomic Conventional Commits, unit + Playwright e2e, PR at the end, no push or merge without explicit go-ahead |
