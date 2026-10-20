# Perf PageSpeed 2 Design

**Spec**: `.specs/features/perf-pagespeed-2/spec.md`

## Approach

Everything builds on the round-1 pipeline. No new dependencies.

### Images (`scripts/images.cjs`)

The manifest gains three kinds of entries. `encode()` and the skip-if-newer rule stay as they are.

| Entry | Source | Outputs |
| ----- | ------ | ------- |
| Home cover | `assets/images/releases/<c>.jpg` | `<c>-160.webp` (160), `<c>-320.webp` (320), `<c>.webp` (native 600) |
| Gallery thumbnail | every `thumbnail` in `_data/photos.json` | `tn_X.webp`, native size |
| Loader logo | `assets/images/logo_loading.png` | `logo_loading.webp`, native 300 |
| Footer logo | `assets/images/logo_horizontal.png` | `logo_horizontal-300.webp`, `logo_horizontal-600.webp` |

sharp keeps the alpha channel for WebP by default. The test checks `hasAlpha` on the logo outputs.

### Cover `srcset`: one function, two callers

`home-core.js` gains `coverSrcset(cover)`. For `"x.jpg"` it returns `"/assets/images/releases/x-160.webp 160w, /assets/images/releases/x-320.webp 320w, /assets/images/releases/x.webp 600w"`. `home-core.js` is UMD, so:

- `.eleventy.js` registers it as the `coverSrcset` Liquid filter (`require('./assets/js/home-core.js').coverSrcset`) and `index.html` uses `{{ release.cover | coverSrcset }}`;
- `home.js` calls `core.coverSrcset(single.cover)` in the NOW::STREAMING swap.

`sizes` per position is fixed in `index.html` from the rendered widths in `less/home.less`. The values are measured at 412 px and 1280 px when the task runs and written as literal `sizes` strings:

- release card: `74px` on phones, card width on desktop;
- NOW::STREAMING: `min(100vw - gutters, 420px)` on phones, art column on desktop;
- archive: `95px` (fixed thumb).

### Thumbnails and logos markup

`<picture><source type="image/webp" srcset="…webp"><img …existing attributes…></picture>`, the same shape the covers use. The `tn_X.webp` URL is derived in Liquid with `replace: '.jpg', '.webp'`, as `index.html` already does for covers. In `/photos/` the grid `<a>` stays the PhotoSwipe trigger; only the `<img>` gets wrapped. The PhotoSwipe thumbnail lookup must still find the `img` (checked by `viewer.e2e.cjs`).

Footer: `srcset="/assets/images/logo_horizontal-300.webp 300w, /assets/images/logo_horizontal-600.webp 600w"`, `sizes="(max-width: 768px) 150px, 30vw"`. Bound: the footer column is ≤ 100 vw, so 30 vw over-asks slightly, which is the safe side.

Mask in `home.less`: keep the `url()` declaration and add one with `image-set(url(webp) type("image/webp"), url(png) type("image/png"))` after it, for both `mask` and `-webkit-mask` (`-webkit-image-set` for the prefixed one). Old engines drop the second declaration and keep the PNG.

### Inline home CSS

`lib/inline-css.js` exports `inlineCss(name, root)`. It reads `assets/css/<name>.min.css`, rewrites `url("../X")` / `url('../X')` / `url(../X)` to `url(/assets/X)`, and throws `Error("inline-css: assets/css/<name>.min.css not found - run npm run less:build")` when the file is missing. `.eleventy.js` registers it as the Liquid shortcode `inlineCss`.

`_includes/head/styles.liquid`:

```liquid
{% if page_id == 'home' %}<style>{% inlineCss 'home' %}</style>{% elsif cssBundles contains page_id %}<link …>{% endif %}
```

`htmlmin` does not minify CSS (`minifyCSS` is off), and the CSS is already minified.

### Head of `_layouts/home.html`

- Add `fetchpriority="high"` to the existing hero `<link rel="preload" as="image">`.
- Add three `<link rel="preload" as="font" type="font/woff2" crossorigin href="/assets/fonts/…woff2">` next to it. `base.html` is untouched, which gives PS2-18.

### Navbar reflow (`assets/js/home.js`)

`navbar()` replaces the trailing `update()` with `pending = true; window.requestAnimationFrame(update);`. That reuses the scroll handler's `pending` guard, so a scroll before the first frame does not queue a second read.

## Risks

| Risk | Mitigation |
| ---- | ---------- |
| Inlined `url(../fonts/…)` breaks the font faces in `home.min.css` | PS2-15 unit test plus the existing `tests/home/fonts` and style e2e suites |
| `<picture>` wrapper changes the grid/teaser layout (CSS targeting `> img`) | Grep `less/` for `> img` selectors on these containers before each markup task; run the visual/style suites |
| Cover `sizes` too small picks the 160 w file on desktop | Archive is 95 px everywhere; card and streaming values measured from rendered widths |
