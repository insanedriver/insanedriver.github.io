# Photos Cyberpunk Validation

> Revisão de escopo em 2026-09-19: o usuário cancelou toda a integração com Instagram. PHOTO-18 a PHOTO-35 e T5 a T9 são registros históricos, não requisitos ativos. A galeria local (PHOTO-01 a PHOTO-17) permanece. Os resultados abaixo descrevem a versão anterior; a validação atual está registrada abaixo.

## Remoção da integração — 2026-09-19

**Resultado atual: PASS.** A pedido do usuário, a entrega passa a conter somente a galeria local. Removidos loader, template, estilos da seção, scripts de sincronização/restauração, cron e referências a secrets no workflow. README, contexto, especificação e design refletem o novo escopo. A renovação automática foi cancelada antes de ser implementada.

Validação executada após a remoção:

- `npm run build`: aprovado; CSS recompilado e página gerada pelo Eleventy.
- `npm test`: 3 testes de dados e 20 testes de navegador aprovados, zero falhas ou skips.
- Os testes preservados cobrem PHOTO-01 a PHOTO-17, incluindo 320/390/768/1440 px, gestos, teclado, foco, zoom e links sem JavaScript.
- Verificação do YAML confirma push/manual, ausência de cron, instalação, testes de dados, build e deploy serializado.
- Verificação do HTML/CSS confirma ausência da seção `photos-instagram`; não há diretórios de mídia da integração no fonte ou na saída.
- `git diff --check`: aprovado.

Os 37 testes unitários/integração e 2 testes de navegador removidos pertenciam exclusivamente ao recurso cancelado. Nenhuma asserção dos testes da galeria foi alterada. A inspeção de imagens desta revisão não foi concluída porque a ferramenta de leitura de capturas falhou ao inicializar o sandbox; a responsividade foi verificada pelos testes no navegador. Não houve nova revisão por subagente.

Nenhum push, deploy ou alteração de configuração externa foi executado.

## Registro histórico da entrega anterior


**Result:** PASS

All 35 acceptance criteria have local evidence. The original summary-output coverage gap was corrected in T9 and independently reverified; all targeted faults now fail tests.

**Date:** 2026-09-18
**Spec:** `.specs/features/photos-cyberpunk/spec.md`
**Diff range:** `9195996..d7f685d`
**Verifier:** independent sub-agent, author ≠ verifier.

## Task completion

T1–T8 are marked Complete. T9 adds the missing PHOTO-31/33 CLI verification and passes independent review. No production defects were established by this review. Real Instagram authorization, API contract verification and publication remain activation dependencies, as explicitly agreed in the spec.

## Spec-anchored acceptance criteria

Each expected outcome below comes from the approved spec. Implementation constants only refine a qualitative design decision where identified.

| Criterion | Spec-defined outcome | Evidence and assertion | Result |
| --- | --- | --- | --- |
| PHOTO-01 | Exactly six distinct local highlights | `tests/photos/gallery.test.cjs:12`: ordered highlight values equal `[1,2,3,4,5,6]`; line 13: unique IDs equal 6; `tests/photos/gallery.e2e.cjs:4`: rendered slides count 6 | PASS |
| PHOTO-02 | All 17 original archive entries remain | `tests/photos/gallery.test.cjs:7`: all original full-size paths equal the fixed 17-entry expected list; `tests/photos/gallery.e2e.cjs:5`: archive figure count 17 | PASS |
| PHOTO-03 | Dark surfaces, cyan/magenta and angular frames | `tests/photos/visual.e2e.cjs:6`: cyan border `rgb(0, 243, 255)`; line 7: magenta `rgb(255, 0, 234)`; `less/photos.less:20` dark stage, line 25 angular polygon. Orchestrator visually inspected four decoded full-page captures and confirmed these outcomes. Exact color values are design choices, not extra spec constraints | PASS, automated + visual |
| PHOTO-04 | Next advances and sixth wraps to first | `tests/photos/carousel.e2e.cjs:5`: counters 02–06; line 7: `toHaveText('01 / 06')` after wrap | PASS |
| PHOTO-05 | Previous moves backward, first wraps to sixth | `tests/photos/carousel.e2e.cjs:11`: `toHaveText('06 / 06')` | PASS |
| PHOTO-06 | Thumbnail selects corresponding highlight | `tests/photos/carousel.e2e.cjs:15`: 04 / 06; line 16: fourth slide visible; lines 17–18: selected thumbnail pressed and exactly one pressed | PASS |
| PHOTO-07 | Horizontal displacement ≥40 and greater than vertical changes one adjacent slide in gesture direction | `tests/photos/carousel.e2e.cjs:33`: left 40 selects 02; line 37: right 40 returns 01; lines 40–41: vertical and 39px retain 01 | PASS |
| PHOTO-08 | No automatic advance | `tests/photos/carousel.e2e.cjs:46`: counter remains 01 after 120000ms virtual time; `assets/js/photos.js:13` selection has only initialization/user-event callers | PASS |
| PHOTO-09 | Selected highlight or archive image opens the corresponding full-size image | `tests/photos/viewer.e2e.cjs:5`: actual viewer image `src` equals expected; lines 12 and 16 cover both triggers | PASS |
| PHOTO-10 | Closing restores focus to exact opener | `tests/photos/viewer.e2e.cjs:30` and line 32: `expect(link).toBeFocused()` for Escape/button and both trigger types | PASS |
| PHOTO-11 | Navigation controls have visible focus and names | `tests/photos/visual.e2e.cjs:21`: focused; line 22: solid outline; line 23: nonempty accessible name. `photos/index.html:89` and lines 112–115 retain viewer control titles | PASS |
| PHOTO-12 | ArrowRight/ArrowLeft with carousel focus select adjacent highlights | `tests/photos/carousel.e2e.cjs:22` and line 23: exact 02/01 counters; line 25: archive focus does not operate carousel | PASS |
| PHOTO-13 | Escape closes viewer | `tests/photos/viewer.e2e.cjs:29`: open class absent following Escape | PASS |
| PHOTO-14 | No document horizontal overflow at 320/390/768/1440 CSS px | `tests/photos/visual.e2e.cjs:8`: `document.documentElement.scrollWidth <= innerWidth`; `tests/photos/instagram.e2e.cjs:24`: same with populated feed | PASS |
| PHOTO-15 | Reduced motion disables decorative animation and transitions | `tests/photos/visual.e2e.cjs:31`: animation none and transition 0s; `tests/photos/viewer.e2e.cjs:42`: actual viewer opening/closing durations `[0,0]` | PASS |
| PHOTO-16 | Without JavaScript all 17 full-size archive links work | `tests/photos/gallery.e2e.cjs:14`: 17 links; lines 17–18: every response 200 and image MIME, in JS-disabled context | PASS |
| PHOTO-17 | Every local photo has nonempty descriptive alt | `tests/photos/gallery.test.cjs:17` and line 18: band name and length >20; `photos/index.html:23` and line 52 render catalog alt. Catalog prose was reviewed, so minimum-length checks alone are not treated as proof of descriptiveness | PASS |
| PHOTO-18 | ≤12 posts, newest first, ID ascending for ties | `tests/photos/instagram-sync.test.cjs:16`: exact newest 12 IDs; line 19: textual tie `[10,2]`; `tests/photos/instagram-render.test.cjs:6` and line 7: two real cards in expected order | PASS |
| PHOTO-19 | Only images and albums whose first item is an image | `tests/photos/instagram-sync.test.cjs:25`: video and video-cover album excluded, exactly image-cover album remains | PASS |
| PHOTO-20 | Album renders only first image | `tests/photos/instagram-sync.test.cjs:25`: chosen media equals first child; line 95: adapter requests first-child endpoint and downloads `/8.png`; `tests/photos/instagram-render.test.cjs:8`: local cover rendered | PASS |
| PHOTO-21 | Card opens original permalink | `tests/photos/instagram-render.test.cjs:8` and `tests/photos/instagram.e2e.cjs:16`: exact fixture permalink on native anchor; `_includes/photos/instagram.liquid:9` has no interception | PASS |
| PHOTO-22 | Visitor views photos without authentication | `tests/photos/instagram.e2e.cjs:18`: image naturalWidth >0 in fresh context; line 27: no Graph requests; static local image template `_includes/photos/instagram.liquid:10` | PASS |
| PHOTO-23 | Missing/invalid/empty selection links to exact band profile | `tests/photos/instagram-render.test.cjs:13`: exact profile href and zero cards for missing/empty; line 22: invalid content excluded | PASS |
| PHOTO-24 | Each post ID occurs once | `tests/photos/instagram-sync.test.cjs:19`: duplicate input yields `[10,2]`; line 109: repeated ID yields one newest record | PASS |
| PHOTO-25 | Captions render as text, never executable markup | `tests/photos/instagram-render.test.cjs:18`: escaped angle/ampersand and no raw image markup; `tests/photos/instagram.e2e.cjs:20`: script variable undefined | PASS |
| PHOTO-26 | Recurring six-hour schedule | `tests/photos/instagram-workflow.test.cjs:24`: exact cron `17 */6 * * *` | PASS |
| PHOTO-27 | Manual trigger uses same synchronization as schedule | `tests/photos/instagram-workflow.test.cjs:24`: workflow_dispatch exists; line 25: one job; line 28: one synchronization command | PASS |
| PHOTO-28 | Successful new selection is used by next build | `tests/photos/instagram-sync.test.cjs:42`: exact persisted public record; `tests/photos/instagram-workflow.test.cjs:30`: sync precedes build; `tests/photos/instagram-render.test.cjs:8`: real loader/build renders snapshot image | PASS |
| PHOTO-29 | 401/429/timeout/media failures retain usable prior snapshot | `tests/photos/instagram-sync.test.cjs:54`, line 59 and line 64: retained status and byte-identical old directory; `tests/photos/instagram-workflow.test.cjs:60` and line 61: restored bytes survive and render | PASS |
| PHOTO-30 | Initial failed synchronization still permits empty-state build | `tests/photos/instagram-sync.test.cjs:103`: no_selection and no broken snapshot; `tests/photos/instagram-render.test.cjs:13`: real build renders profile for absent snapshot; full build passed without secrets | PASS |
| PHOTO-31 | Credentials absent from generated site and sync logs | `tests/photos/instagram-sync.test.cjs:90`: manifest and returned result exclude token/source URL; `tests/photos/instagram-workflow.test.cjs:39`–41: token scoped to synchronization. `tests/photos/instagram-cli.test.cjs:43`/45 assert actual stdout/summary; lines 47–48 exclude fixture token and signed URL | PASS |
| PHOTO-32 | Overlapping runs cannot concurrently publish selections | `tests/photos/instagram-workflow.test.cjs:36`: whole-workflow group `pages-production`, cancel-in-progress false; line 37: production branch restriction | PASS, workflow contract |
| PHOTO-33 | Summary reports success/retained/no_selection without secrets | `tests/photos/instagram-cli.test.cjs:11`–15 exercise success/retained/no_selection through the real CLI; line 43 exact stdout, line 45 exact appended Actions summary. Repeated missing-output mutation now fails all three scenarios | PASS |
| PHOTO-34 | Successful replacement omits removed posts | `tests/photos/instagram-sync.test.cjs:49`: only new ID 3 and new assets remain; line 31: empty success removes all prior assets; template loops only replacement posts | PASS |
| PHOTO-35 | Documentation covers authorization, secrets, manual sync and expiry/revocation recovery | Manual content assertions: `README.md:69` authorization; line 74 secret table; line 86 manual run; lines 102–104 expiry/reauthorization/secret replacement and success check | PASS, manual |

**Outcome:** 35/35 fully evidenced after T9 closes the shared PHOTO-31 logging / PHOTO-33 test gap. No spec-precision gap: subjective visual criteria are checked visually against the approved design rather than treated as exact pixel constraints.

## Gate and test integrity

The orchestrator ran the mandatory build gate before sensor work: `npm run build && npm run test:unit && npm run test:photos && git diff --check`, all exit 0. Unit: 37 passed; browser: 22 passed; failed/skipped: 0. The independent scratch baseline also passed 37/37 unit tests.

Before feature (`9195996:package.json`), npm test was an explicit failing placeholder with no functional suite. After T9: 62 actual tests, a +62 delta. No prior tests were removed/weakened; no feature tests skipped. Unit fixtures perform real isolated Eleventy renders and real local Git restores. External Instagram requests and remote GitHub execution were not performed or claimed.

## Discrimination sensor

The real implementation/tests were read only. Copied scripts/tests/data/templates/config to a fresh `/tmp/photos-sensor-*`; existing assets and node_modules were read-only inputs through symlinks. Mutated only copied `scripts/sync-instagram.cjs`; each attempt started from the original copy. Command: `npm run test:unit`. Scratch was removed. No stash or real worktree mutation.

| ID | Location | Fault | Result |
| --- | --- | --- | --- |
| M1 | `scripts/sync-instagram.cjs:38` | Reverse publication sort to oldest-first | KILLED: exit 1, 35 pass / 2 fail; exact order and duplicate-newest assertions at `tests/photos/instagram-sync.test.cjs:16` and line 109 fail |
| M2 | `scripts/sync-instagram.cjs:161` | Delete prior snapshot directory before fallback return | KILLED: exit 1, 25 pass / 12 fail; 401/429/timeout/partial-download/restored-byte checks fail |
| M3 | `scripts/sync-instagram.cjs:168` | Remove stdout and Actions summary writes at lines 168–169 | SURVIVED: exit 0, all 37 pass; PHOTO-33 required side effects undetected |

Lightweight depth: three behavior-level mutations, 2 killed, 1 survived. Logs: `/tmp/photos-sensor-evidence/{baseline,order,retention,summary}.txt`.

Real-tree `git status --porcelain=v1` before and after sensor matched byte-for-byte:

```text
?? .agents/
?? .claude/
?? .cursor/
?? .windsurf/
?? skills-lock.json
```

Those pre-existing untracked paths were untouched. Baseline and after snapshots are `/tmp/photos-sensor-evidence/before.txt` and `after.txt`. Report/lesson writes occurred only after isolation was verified.

## Visual review and edges

Orchestrator decoded all 17 archive images at each required width and inspected `/tmp/photos-complete-{320,390,768,1440}.jpg`: all images loaded, no horizontal overflow or overlaps; grids use 1/1/2/3 columns. Initial automated full-page captures leave offscreen lazy images unloaded; separate decoded captures resolved that artifact. No interactive human UAT was claimed.

All listed spec edge cases have evidence above: no/few posts; deduplication; video cover; partial failure; no credentials; valid empty replacement; circular navigation; vertical gesture; reduced motion; no JavaScript. Design bounds (unsafe URLs, collection/download limits, restore errors) have additional tests tied to PHOTO-29/31 and T5/T7 Done-when criteria.

## Code quality

Scope, existing Eleventy/LESS/PhotoSwipe reuse, page-scoped CSS and no production dependencies beyond the existing stack pass review. New helpers support the approved static integration; no unrelated page redesign found. Every feature test maps to an AC, listed edge or task criterion. README.md:47 requires generated CSS with LESS; the diff includes generated minified CSS. No other repository testing guideline was found. The initial operational-output coverage gap described below was closed by T9.

## Initial ranked gap and completed fix

1. **Major verification gap, PHOTO-33 and logging portion of PHOTO-31:** tests assert returned synchronization results but never execute the synchronization CLI. Removing all summaries survives. Add offline subprocess tests of the real entry point for success, retained previous selection and no selection; assert exact status/count/reason, stdout, GITHUB_STEP_SUMMARY and absence of the fixture secret. Preserve every existing assertion. Re-run unit/full gate and repeat M3 in scratch; done when outputs are covered and missing-output mutation fails. Production behavior need not change.

T9 completed the fix above with tests only. No production behavior or existing assertions changed. PHOTO-01 through PHOTO-35 are now verified locally. External activation remains a separate authorized operation.


## T9 independent re-verification

The new subprocess tests at `tests/photos/instagram-cli.test.cjs:37` execute the actual CLI in temporary directories, with preloaded fetch fixtures and a restricted explicit environment. They verify success with two posts, retained selection with two posts, and first-run failure with zero posts. Failure fixtures throw the fake token, exercising safe exception summaries. Exact stdout at line 43 and append-preserving Actions summaries at line 45 match the defined status/count/reason; lines 47–48 reject secret and signed media URL exposure. These three tests map directly to PHOTO-31/33.

After T9, the orchestrator reran `npm run test:unit && npm run test:photos && git diff --check`: 40 unit/integration plus 22 browser tests passed; no failures/skips; diff check passed. The production build had passed before T9 and no production files changed afterward. Independent scratch baseline also passed 40/40 unit tests. No production code changed, so previous browser and visual evidence remains applicable.

A fresh copied scratch, with the same isolation method, ran `npm run test:unit` for each fault:

| Mutation | Location | Re-verification |
| --- | --- | --- |
| M3 repeated: remove both stdout and Actions summaries | `scripts/sync-instagram.cjs:168`–169 | KILLED, 37 pass / 3 fail, exit 1; exact stdout assertion fails |
| M4: remove only Actions summary write | `scripts/sync-instagram.cjs:169` | KILLED, 37 pass / 3 fail, exit 1; exact appended-summary assertion fails |
| M5: append fixture token to stdout | `scripts/sync-instagram.cjs:168` | KILLED, 37 pass / 3 fail, exit 1; exact safe-output assertion fails |

Re-verification sensor: 3/3 killed. Together with the unchanged M1/M2 evidence, no surviving targeted fault remains. Logs are `/tmp/photos-resensor-evidence/{baseline,summary_both,summary_actions,summary_secret}.txt`. Fresh scratch removed successfully. Real `git status --porcelain=v1` before/after again matched byte-for-byte, now including the authorized in-progress fix/report/lesson files:

```text
 M .specs/features/photos-cyberpunk/tasks.md
?? .agents/
?? .claude/
?? .cursor/
?? .specs/LESSONS.md
?? .specs/features/photos-cyberpunk/validation.md
?? .specs/lessons.json
?? .windsurf/
?? skills-lock.json
?? tests/photos/instagram-cli.test.cjs
```

Exact snapshots: `/tmp/photos-resensor-evidence/before.txt` and `after.txt`. Report edits resumed only after this equality check. One fix→re-verify iteration was needed.

The original M3 signal was distilled with the required script into candidate lesson L-001: exercise synchronization CLI entry points and assert stdout and Actions summaries rather than only returned status objects. No additional lesson was invented for the clean re-verification.

**Remaining ranked gaps:** none for local delivery. Live account authorization, real API responses and remote deployment were outside this verification scope and were not exercised.
