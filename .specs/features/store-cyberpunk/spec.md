# Cyberpunk Store Specification

## Problem Statement

The site sells CDs from two disconnected pages: `/store/` sells only the 2016 debut *Insane Driver* with an old Bootstrap layout, and `/preorder/` sells the *Silicon Fortress* + *Insane Driver* combo and *Silicon Fortress* alone behind a radio list whose Brazil/international switch depends on an `http://` geo-IP call that fails on HTTPS. Buyers cannot see all three offers in one place, and neither page matches the cyberpunk look of the rest of the site.

## Goals

- [ ] One `/store/` page lists all three products (combo $35, *Silicon Fortress* $25, *Insane Driver* $22), each with its own working PayPal button.
- [ ] The page uses the site's cyberpunk panel language and has no horizontal overflow from 320px to desktop widths.
- [ ] `/preorder/` and every internal "buy CD" link land on `/store/`.

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Changing PayPal buttons, prices or options on PayPal's side | Prices live in the existing hosted buttons; the page only reuses them. |
| A live PayPal purchase test | It would create a real order. |
| Shipping cost, delivery time or stock info | The band has not provided this data. |
| Geo-IP country detection | Replaced by always showing both purchase routes. |
| Extracting a shared cyberpunk stylesheet | Project convention keeps each page's cyber styles in its own `.less` file. |
| Selling *Insane Driver (Deluxe)* | Not part of the three agreed offers. |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Source branch | `feature/store-cyberpunk` from local `master`. | Repository default branch is `master`. | y |
| PayPal wiring | Combo and *Silicon Fortress* post to hosted button `JYP8YSM95V69A` with a hidden `on0`/`os0` carrying the exact existing option values; *Insane Driver* posts to hosted button `ACB6SNWZ97592`. | Reuses buttons that already hold the prices; no PayPal changes needed. | y |
| Displayed prices | $35.00, $25.00, $22.00 USD. | Copied from the current pages; PayPal's hosted buttons stay authoritative. | y |
| Card art | Every card shows the `assets/images/releases/<cover>` image of each album it includes; the combo stacks both covers. | Amended during T2: `silicon-preorder-combo.png` is only 180x120 and blurs at card width; the user chose the stacked 600px covers. | y |
| Card order | DOM order is Combo, *Silicon Fortress*, *Insane Driver*; at >=992px CSS places *Silicon Fortress* left, Combo centre, *Insane Driver* right. | Combo is first on mobile and central on desktop. | y |
| Tracklists and year | Rendered at build time from `_data/discography.json` (`silicon-fortress`, `insane-driver`). | Single source of truth already used by the discography page. | y |
| Brazil route | A Portuguese panel with a link to the existing Die Hard search URL, always visible, plus an English note that it ships only within Brazil. | Removes the broken geo-IP dependency; both audiences see their route. | y |
| Brazil redesign (round 2) | The panel stays last on the page with no shortcut above the cards; international buyers come first. It uses the same yellow buy button as the cards. | The user ranks international buyers first but wants the Brazil route to look finished. | y |
| Brazil link target | The search URL stays; there is no per-product link. | Die Hard opens products through a POST, so no GET URL exists per product. | y |
| Brazil copy | Heading `No Brasil? Compre pela Die Hard 🇧🇷`, benefit `Pague em reais · Pix ou cartão · Envio para todo o Brasil`, link `Comprar na Die Hard` shown uppercase with a decorative `↗`. | The user confirmed reais, Pix and card; nationwide shipping comes from the previous heading. | y |
| Brazil two-column breakpoint | Two columns from 768px, one column below. | The panel spans the full content width, so 768px already fits the text and a 280px button side by side. | y |
| Brazil covers | `releases/silicon-fortress.jpg` then `releases/insane-driver.jpg`, 96px wide each, centred over the button. | The covers read as "these products, buy here". | y |
| Brazil language | The panel carries `lang="pt-BR"` and the English note `lang="en"`. | Screen readers pronounce each block in its own language. | y |
| Die Hard logo | Not used. | It is another company's brand and its colours would clash with the palette. | y |
| `/preorder/` | A standalone HTML page (no site layout) with `meta refresh` 0s to `/store/`, `rel=canonical` to `https://insanedriver.com.br/store/`, `robots noindex`, and a visible fallback link. | GitHub Pages has no server-side redirects. | y |
| Header image | `header_7.jpg`, unchanged. | Keeps the current store header. | y |
| Motion | Cyber animations are disabled under `prefers-reduced-motion: reduce`. | Matches newsletter/photos; does not copy band/contact's gap. | y |
| PayPal target | Forms submit to PayPal in the same tab (`target="_top"`). | Matches the current `/store/` button. | y |
| Overflow scope (amended in T2) | STORE-18 measures the store content, not the whole document. | The site header (`.container.menu-center`) already overflows to 781px at 768px on every page; fixing the global header is outside this feature. | y |
| Remaining implicit-requirement dimensions | Validation, auth, retries, concurrency, persistence and data lifecycle are N/A. | The page is static and only posts existing hosted-button forms. | y |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Buy any of the three CD offers ⭐ MVP

**User Story**: As a fan outside Brazil, I want to see the combo and both CDs side by side with prices and buy the one I want so that I can order with PayPal in one step.

**Why P1**: Selling CDs is the page's only purpose.

**Acceptance Criteria**:

1. **STORE-01** — The store page SHALL render exactly three product cards, in DOM order: combo, *Silicon Fortress*, *Insane Driver*.
2. **STORE-02** — The store page SHALL show the prices `$35.00`, `$25.00` and `$22.00` (USD) on the combo, *Silicon Fortress* and *Insane Driver* cards respectively.
3. **STORE-03** — The combo card SHALL contain a PayPal form posting to `https://www.paypal.com/cgi-bin/webscr` with `cmd=_s-xclick`, `hosted_button_id=JYP8YSM95V69A`, `currency_code=USD` and `os0=COMBO: CD Silicon Fortress + Insane Driver`.
4. **STORE-04** — The *Silicon Fortress* card SHALL contain a PayPal form with `cmd=_s-xclick`, `hosted_button_id=JYP8YSM95V69A`, `currency_code=USD` and `os0=CD Silicon Fortress`.
5. **STORE-05** — The *Insane Driver* card SHALL contain a PayPal form with `cmd=_s-xclick` and `hosted_button_id=ACB6SNWZ97592`.
6. **STORE-06** — Each card SHALL show its title, one cover image with non-empty `alt` text per included album (`releases/silicon-fortress.jpg` then `releases/insane-driver.jpg` on the combo), and a release-year HUD tag (`2021` for *Silicon Fortress*, `2016` for *Insane Driver*, `2021 + 2016` for the combo).
7. **STORE-07** — The combo card SHALL carry a visible `BEST DEAL` badge.
8. **STORE-08** — The store page SHALL display the line `Ships worldwide · PayPal` above the product cards.

**Independent Test**: Load `/store/` without JavaScript and read the three forms' hidden fields and prices.

---

### P1: Read what is on each CD

**User Story**: As a buyer, I want to check the tracklist before buying so that I know what I get.

**Why P1**: The current store already shows the debut tracklist; dropping it would be a regression.

**Acceptance Criteria**:

1. **STORE-09** — Each single-CD card SHALL contain a collapsed `<details>` tracklist listing that album's tracks from `_data/discography.json` in `position` order.
2. **STORE-10** — The combo card SHALL contain one collapsed `<details>` tracklist per included album (*Silicon Fortress*, then *Insane Driver*).
3. **STORE-11** — WHEN the visitor activates a tracklist summary THEN the store page SHALL reveal that album's track titles.

**Independent Test**: Click each "Tracklist" summary and compare the titles with the JSON.

---

### P1: Buy from Brazil

**User Story**: As a fan in Brazil, I want a clear route to the local retailer so that I pay in reais and get domestic shipping.

**Why P1**: Brazil is the band's home market and the retailer deal is exclusive.

**Acceptance Criteria**:

1. **STORE-12** — The store page SHALL always show a Brazil panel, after the product cards, with the heading `No Brasil? Compre pela Die Hard 🇧🇷` and a `Comprar na Die Hard` link to `https://www.diehard.com.br/resultado_pesquisa.php?tipoPesquisa=artista&estoque=estoque&cod_tipo=0&pesquisa=Insane+Driver` (amended in round 2).
2. **STORE-13** — The Brazil panel SHALL state in English that Die Hard ships only within Brazil and that international buyers should use PayPal.
3. **STORE-14** — The store page SHALL NOT call any geo-IP service or read an `imInBrazil` query parameter.
4. **STORE-25** — The Brazil panel SHALL show the line `Pague em reais · Pix ou cartão · Envio para todo o Brasil` between the heading and the link.
5. **STORE-26** — The Brazil panel SHALL show two cover images with non-empty `alt` text, `releases/silicon-fortress.jpg` then `releases/insane-driver.jpg` from left to right, each rendered 96px wide.
6. **STORE-27** — WHEN the visitor activates the Die Hard link THEN the store page SHALL open it in a new tab (`target="_blank"` with `rel` containing `noopener`).
7. **STORE-28** — The Die Hard link SHALL render at least 56px tall.
8. **STORE-29** — WHILE the viewport is at least 768px wide the Brazil panel SHALL place the heading, benefit line and English note in a left column and the covers above the link in a right column, with the link at least 280px wide.
9. **STORE-30** — WHILE the viewport is below 768px the Brazil panel SHALL stack, top to bottom, the heading, benefit line, covers, link and English note, with the link as wide as the panel content (±1px).
10. **STORE-31** — The Brazil panel SHALL carry `lang="pt-BR"` and its English note SHALL carry `lang="en"`.

**Independent Test**: Load `/store/?imInBrazil=true` and `/store/?imInBrazil=false`; both show the same three cards and the Brazil panel, with no request to `ip-api.com`. Screenshot the panel at 375px and 1280px.

---

### P1: Cyberpunk look on every screen

**User Story**: As a visitor, I want the store to look like the rest of the site and work on my phone.

**Why P1**: Visual consistency was an explicit requirement.

**Acceptance Criteria**:

1. **STORE-15** — The store page SHALL render its content inside the `.cyber-zone` / `.cyber-panel` structure (tab, HUD body, corner accents) with the site palette (`#00f3ff`, `#005f8c`, `#ff00ea`, `#fcee0a`), and SHALL leave `#content`'s `bodybg.jpg` background visible.
2. **STORE-16** — WHILE the viewport is at least 992px wide the store page SHALL lay the three cards in one row ordered *Silicon Fortress*, combo, *Insane Driver* from left to right.
3. **STORE-17** — WHILE the viewport is below 992px the store page SHALL stack the cards in a single column in DOM order (combo first).
4. **STORE-18** — WHILE the viewport is between 320px and 1440px no element inside the store content (`[data-store]`) SHALL extend past the right edge of the viewport.
5. **STORE-19** — WHILE the visitor requests reduced motion the store page SHALL set `animation: none` on every store cyber element that is animated by default.
6. **STORE-20** — WHEN a keyboard user focuses a buy button or tracklist summary THEN the store page SHALL display a visible focus outline.

**Independent Test**: Screenshot `/store/` at 375px and 1280px; emulate reduced motion and check computed animations.

---

### P2: Old pre-order links still work

**User Story**: As a fan with an old `/preorder/` link, I want to reach the store so that the link is not dead.

**Why P2**: Protects existing shared links; the store works without it.

**Acceptance Criteria**:

1. **STORE-21** — WHEN a browser loads `/preorder/` THEN it SHALL navigate to `/store/` via a 0-second meta refresh.
2. **STORE-22** — The `/preorder/` page SHALL include `<link rel="canonical" href="https://insanedriver.com.br/store/">`, `<meta name="robots" content="noindex">` and a visible link to `/store/`.
3. **STORE-23** — The *Silicon Fortress* entry in `_data/discography.json` SHALL have `buyCd` equal to `/store/`.
4. **STORE-24** — The repository SHALL NOT contain `less/preorder.less`, `assets/js/preorder.js` or `_includes/js/preorder.liquid`, and `less/style.less` SHALL NOT import `preorder.less`.

**Independent Test**: Open `/preorder/` and land on `/store/`; grep the repo for the removed files.

---

## Edge Cases

- IF JavaScript is disabled THEN the store page SHALL still render all three cards, the tracklists and working PayPal forms (the page needs no JS).
- IF an album's `tracks` array is empty THEN the store page SHALL omit that album's `<details>` block instead of rendering an empty list.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| STORE-01 | P1: Buy any of the three CD offers | T1 | Implemented |
| STORE-02 | P1: Buy any of the three CD offers | T1 | Implemented |
| STORE-03 | P1: Buy any of the three CD offers | T1 | Implemented |
| STORE-04 | P1: Buy any of the three CD offers | T1 | Implemented |
| STORE-05 | P1: Buy any of the three CD offers | T1 | Implemented |
| STORE-06 | P1: Buy any of the three CD offers | T1 | Implemented |
| STORE-07 | P1: Buy any of the three CD offers | T1 | Implemented |
| STORE-08 | P1: Buy any of the three CD offers | T1 | Implemented |
| STORE-09 | P1: Read what is on each CD | T1 | Implemented |
| STORE-10 | P1: Read what is on each CD | T1 | Implemented |
| STORE-11 | P1: Read what is on each CD | T1 | Implemented |
| STORE-12 | P1: Buy from Brazil | T1, T6 | Implemented (amended) |
| STORE-13 | P1: Buy from Brazil | T1 | Implemented |
| STORE-14 | P1: Buy from Brazil | T1 | Implemented |
| STORE-15 | P1: Cyberpunk look | T2 | Implemented |
| STORE-16 | P1: Cyberpunk look | T2 | Implemented |
| STORE-17 | P1: Cyberpunk look | T2 | Implemented |
| STORE-18 | P1: Cyberpunk look | T2 | Implemented |
| STORE-19 | P1: Cyberpunk look | T2 | Implemented |
| STORE-20 | P1: Cyberpunk look | T2 | Implemented |
| STORE-21 | P2: Old pre-order links | T3 | Implemented |
| STORE-22 | P2: Old pre-order links | T3 | Implemented |
| STORE-23 | P2: Old pre-order links | T5 | Implemented |
| STORE-24 | P2: Old pre-order links | T4 | Implemented |
| STORE-25 | P1: Buy from Brazil | T6 | Implemented |
| STORE-26 | P1: Buy from Brazil | T6 | Implemented |
| STORE-27 | P1: Buy from Brazil | T6 | Implemented |
| STORE-28 | P1: Buy from Brazil | T6 | Implemented |
| STORE-29 | P1: Buy from Brazil | T6 | Implemented |
| STORE-30 | P1: Buy from Brazil | T6 | Implemented |
| STORE-31 | P1: Buy from Brazil | T6 | Implemented |

**Coverage:** 31 total, 31 mapped to tasks (T1-T6), 0 unmapped. Round 2 (T6) redesigns the Brazil panel: STORE-12 amended, STORE-25 to STORE-31 added. Edge cases: both covered (no-JS in `tests/store/markup.e2e.cjs`, empty tracks in `tests/store/store-template.test.cjs`).

---

## Success Criteria

- [ ] All three PayPal forms carry the spec'd hidden fields (verified by e2e tests).
- [ ] Zero horizontal overflow at 320, 375, 768, 1024 and 1440px.
- [ ] `/preorder/` reaches `/store/` in a real browser.
