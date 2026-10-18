# REVIEW-M34: `modules/34-i18n.md`

- **Reviewer:** a fresh reviewer subagent (claude-opus-5-5) of session S20261016-0506-claudecode. It read and judged the module and ran only read-only scripts. The re-runs belong to the main session, which owns all execution. Module 34 was planned by PLAN-M34 and written by HOUSE-30, HOUSE-31, SEC-M34-01..12, EX-M34-01..04, QB-M34-01..05 and CLOSE-M34 (sessions S20261015-1421 and S20261015-1923). This reviewer wrote nothing in module 34 and continues none of those conversations, so it is eligible (RUN.md §4).
- **Date:** 2026-10-16.
- **Files read:**
  - the whole module (1,944 lines; line numbers below are as of this review and will move at FIX time);
  - `_meta/modules/M34.md` (Handoffs, Lab decision, F1-F24, C1-C15, the section map, the bank table, Output answers, Exercises, For Jorge 1-4), QUALITY-BAR, STYLE-GUIDE §3 and §6, the TASKS entries REVIEW-M32, REVIEW-M33, REVIEW-M34, the module-34 common rules and FIX-M33-01..03 (the format), LOG 1303-1346 (every M34, HOUSE-30 and HOUSE-31 line), `SOURCES.md` `## Module 34`, REVIEW-M33 (the format model);
  - module-34 lab files: titles of every spec by script (125 distinct titles); in full: the three outputs specs, `labs/ts-js/.../section-2-intl.test.ts`, the `extract.ts` page; in part: section-3, -10, -11 (e2e), section-2 (e2e) specs, `checkout.spec.ts`, `rtl-card.spec.ts`, `section-10-money.test.ts`, `messages.xlf`; the file list of `projects/i18n-lab`, `labs/e2e/server`, `labs/angular/dist`.
- **Packages read (22.2.1 unless stated):**
  - `@angular/core`: `fesm2022/_debug_node-chunk.mjs` (15679-15760 `registerLocaleData`, `findLocaleData`, `getLocaleData`, `normalizeLocale`, `getPluralCase`; 15778 `setLocaleId`; 19702-19719 `getGlobalLocale`, `LOCALE_ID`, `DEFAULT_CURRENCY_CODE`, `TRANSLATIONS`, `TRANSLATIONS_FORMAT`); `core.mjs` 1926; existence of `getCaseIndex`, `getOrCreateComponentTView`, `createTView`, `i18nStartFirstCreatePass`, `applyUpdateOpCodes`, `applyIcuSwitchCase`, `applyIcuSwitchCaseRemove`, `applyMutableOpCodes`, `trySerializeI18nBlock`, `locateOrCreateNodeImpl`;
  - `@angular/common`: `types/common.d.ts` (158, 195, 244, every `@deprecated 18.0`, 462-473 `getLocaleId`, 815-841 `getCurrencySymbol`, `getNumberOfCurrencyDigits`); `fesm2022/_common_module-chunk.mjs` (103-164 `CURRENCIES_EN`, 439-446, 948-963 `timezoneToOffset`, 1103-1110 `formatCurrency`); `grep -c 'Intl\.'` over every `fesm2022` file (0); `locales/global/de.js`;
  - `@angular/localize`: `fesm2022/localize.mjs` (1-101 and exports), `fesm2022/_localize-chunk.mjs` (147, 225, 252); `tools/bundles/chunk-IRKVQEM7.js` 21-43 (`checkDuplicateMessages`);
  - `@angular/build`: `src/tools/i18n/i18n-inliner-worker.js` (199-208 `translateMessage`, 246, 306-330 `inlineLocalize`), `src/tools/i18n/locale-data.js` 44-45, 77-102, `src/tools/esbuild/application-code-bundle.js` 531, `src/builders/extract-i18n/application-extraction.js` 19-34, `builder.js` 93-102, `options.js` 73-81, `src/builders/application/options.js` 424-436, `src/builders/application/schema.json` (both `default: "warning"`), `src/builders/dev-server/vite/index.js` 120-128, `src/utils/i18n-options.js` 72-110;
  - `@angular/cli`: `src/commands/extract-i18n/cli.js` 13-45; `@angular/compiler` (existence of `collectI18nConsts`, `getTranslationDeclStmts`, `compileComponentFromMetadata`); `@angular/platform-browser` `types/platform-browser.d.ts` 421-423 (`withI18nSupport`, `@publicApi 20.0`); `@angular/ssr` (`redirectBasedOnAcceptLanguage` present); `@angular/cdk` `fesm2022/_directionality-chunk.mjs` 1-31;
  - `@jsverse/transloco` 8.4.0 `fesm2022/jsverse-transloco.mjs` (25 `reRenderOnLangChange: false`, 257-266 `DefaultMissingHandler`, 1421-1427 `pure: false`, `getMappedScope`, `_handleMissingKey`); `@ngx-translate/core` 18.0.0 (`getTextToInterpolate` present); `oxc-parser` 0.150.0 `package.json`.
  - Node 24.21.0 `Intl` (`node -e`, labelled Node 24, ICU 78.3, CLDR 48.0): the Q34.04 table, `ru` 21, `ar` 3 and 100, the `ar-EG` code points of `1234.5`, `Date.parse` with an IANA name (NaN), an offset and an abbreviation.
- **Basis of each finding:** a package source, a committed spec, the module text, or a read-only script (grep, sed, awk, python3 word count, `node` reading files or evaluating `Intl`). Nothing was built, run or installed. **Not re-read** (their basis is the SEC/QB LOG lines and SOURCES.md): the Angular docs pages on `main`, the core CHANGELOG lines (21.1.6, 22.0.1), the MDN pages and their Baseline statuses, the CLDR and ICU home pages, the CLDR plural-rules page, Spring Framework 7.0.9's reference, the Transloco and ngx-translate docs sites and GitHub releases.
- **Probe files:** none in the repository. Two scratch scripts lived in the job scratchpad (`/Users/jorge.quintero/.claude/jobs/99e24ad9/tmp`) and were deleted. The reviewer created only this file and edited `_meta/TASKS.md`.

Overall, this is a carefully sourced module with **no Major finding**. Every number the answers state matches its assertion, every cited test title exists, and the internals it names exist in 22.2.1 under the names it gives. The Minor findings are:
- two short answers that blur a lookup order (F-1, F-2);
- one status marker placed after the first mention (F-3);
- raw invisible characters in three lab specs, against C10's "tests compare with `\u` escapes" (F-4; the module itself has none);
- five terms used before any definition (T-1);
- three internal names without "may change" (T-2);
- one follow-up that blurs `warning` and `error` (T-3);
- four Misconceptions causes that are an unsourced history or prevalence claim, or not a sentence (T-4);
- seven nits and the anchor handoffs (13 rows).

One plan fact was wrong and the module is right: M34.md F7 lists `getCurrencySymbol` and `getNumberOfCurrencyDigits` as not deprecated, but `types/common.d.ts` 819 and 837 carry `@deprecated 18.0` on both, as §3 (215) and §10 (818) say.

**Prose:** 18,770 words now (QUALITY-BAR one-liner, equal to CLOSE's LOG count and the main session's `module-stats`). The fixes add about +125, for about 18,895: under the CLOSE limit of 19,006 and the REVIEW ceiling of 19,706.

## Re-runs (main session)

Filled by the main session S20261016-0506-claudecode, serially (Node 24: `export PATH=/opt/homebrew/opt/node@24/bin:$PATH`).

| Command | Result |
|---|---|
| `labs/angular`: `npx tsc -p tsconfig.spec.json --noEmit` | 0 (Node 24.21.0) |
| `labs/angular`: `npx ng test --watch=false --include='src/app/modules/34-i18n/**/*.spec.ts'` | 15 files, 81 passed |
| `labs/angular`: `npx ng build i18n-lab`; `npx ng build i18n-lab -c production,runtime` | 0; 0 |
| `labs/e2e`: `npm run typecheck` | 0 |
| `labs/e2e`: `npm test -- tests/34-i18n --repeat-each=5` | 205 passed (41 × 5), 0 failed, 0 flaky, 24.9 s |
| `labs/ts-js`: `npx vitest run src/modules/34-i18n` | 7 files, 23 passed |
| Mermaid parse of the 12 fences (Mermaid + jsdom in the job scratchpad, with a negative control, deleted after) | Mermaid 11.12.0 + jsdom 26.1.0: 12/12 parse; the negative control fails |
| guide root: `node labs/tools/check-links.mjs --planned`; `node labs/tools/check-snippets.mjs . 34`; `node labs/tools/module-stats.mjs` | check-links 0; check-snippets 34 0; module-stats `34-i18n` 25 Q, 4 Ex, 18,770 words, Concept 8, Output 8, Bug hunt 4, Difference 2, Trade-off 2, Design 2, no flag |
| `lsof -iTCP:4300 -iTCP:4400 -iTCP:4500 -iTCP:4600 -sTCP:LISTEN` after the run; remove `labs/e2e/test-results` | no listener; `test-results` removed |

Reviewer's read-only script results (2026-10-16):
- **Cited test titles:** 151 citations, 94 distinct, 0 missing from the 125 distinct titles of the module-34 specs. Seven titles only looked missing at first because they are written in double quotes in the specs (they contain an apostrophe).
- **Exercise criteria:** 20 of 20 equal test titles. Each of the eight Output IDs (02, 04, 06, 10, 13, 18, 20, 24) has a test named after it (Q34.24 has two: e2e and `ng test`).
- **Output values vs assertions:** Q34.02 (`en-US`, `fr`, `de`, `USD`), Q34.04 (all 30 cells; also `node -e`: identical), Q34.06 (` ` vs ` `; the `ar-EG` digits U+0661 U+066C U+0662 U+0663 U+0664 U+066B U+0665, confirmed by `node -e`; the `fr` string), Q34.10, Q34.13 (four texts), Q34.18 (302, `/fr/`, `Vary`, `lang`/`dir`), Q34.20 (three HTML strings, one warning matching `^No translation found for "m34\.q20\.missing"`), Q34.24 (`{ left: 184, right: 16 }`, `{ left: 200, right: 0 }`, text right 0, `ltr`): all equal.
- **URLs:** two distinct strings. One is a citation (the MDN Baseline glossary, in SOURCES.md); the other is lab code (`http://localhost:4600/`). The module cites everything else by docs path and date; every such source has a SOURCES.md line (checked: `overview`, `locale-id`, `prepare`, `manage-marked-text`, `translation-files`, `merge`, `deploy`, `add-package`, MDN `PluralRules`, `toLocaleString`, `Date`, `NumberFormat()`, logical properties, `<bdi>`, `:dir()`, `DurationFormat`, `getTextInfo`, `getWeekInfo`, CLDR, ICU, CLDR plural rules, Spring 7.0.9, Transloco config/Message Format/SSR/Keys Manager, ngx-translate plugins, GitHub releases, the core changelog, the three outputs specs).
- **Markup:** `<details>` 44 open and 44 closed; 12 `mermaid` fences and 12 "What to notice" lines; B1 subsections: 12 of each of the six.
- **Answer anatomy:** each of the five D1 counts is 25; every answer has at least 2 answered follow-ups.
- **Answer length:** 179-245 words, mean 212.
- **Question links:** every one of the 25 IDs is linked outside its heading.
- **Invisible characters (C10):** the module has no U+202F, U+00A0, U+200F, U+200E, U+061C, U+2066-U+2069, zero-width or U+241F character (script over every code point). Lab specs: three files have raw ones (F-4).
- **Markers, placeholders and process words:** `<!-- TASK:`/`PLACEHOLDER`/`relink:` 0; `Unverified` 0; `SEC-M34`/`QB-M34`/`EX-M34`/`probe`/`planner`/`throwaway` 0.
- **Specs (C6, C13):** no `waitForTimeout`, `setTimeout`, `performance.now` or `Date.now`; no host other than `localhost`. Every `formatDate`, `DateTimeFormat`, `| date` and Playwright context passes a zone, except the deliberate `formatDate(…, 'America/New_York')` vs no-zone comparison in `section-10-dates-money.spec.ts` 72, which asserts that an IANA name falls back to the host zone (deterministic on any host).
- **`git status`:** `labs/angular/dist` is ignored (`labs/angular/.gitignore` 4); there is no `labs/e2e/test-results`; `labs/e2e`, `projects/i18n-lab` and the module-34 lab folders are untracked, so they cannot be diffed (For Jorge 3).

## QUALITY-BAR

45 items: **41 Pass, 4 Partial (B7, B9, C1, C4), 0 Fail.** H1 and H2 are Pass on CLOSE-M34's run and the reviewer's checks, pending the main session's re-runs above.

| ID | Result | Evidence |
|---|---|---|
| A1 | Pass | Lines 3-9 in §4.1 order; the Labs line has the four folders and three run commands. |
| A2 | Pass | 14 §6, 24 §1, 10 §5 and 01 §3, all with anchors. |
| A3 | Pass | §1, §3, §5 and §7; six question IDs; ends with the Summary. |
| A4 | Pass | Contents (13-29) links the 12 sections and the five closing sections. |
| A5 | Pass | Vocabulary first, §12 (compiler, inliner, runtime) last. |
| B1 | Pass | 12 of each subsection (script). |
| B2 | Pass | Each "The problem it solves" opens with a concrete failure (37, 117, 189, 261, 440, 799, 870 read). |
| B3 | Pass | 12 Mermaid diagrams, each with "What to notice", and one analogy per section. |
| B4 | Pass | Every section has a "read from the 22.2.1 source" answer to a why (68, 211, 373, 465, 559, 648, 716, 818, 894, 960). |
| B5 | Pass | Each Code subsection starts with "The approach" and numbered steps. |
| B6 | Pass | Every best practice has "because" (read). |
| B7 | Partial | 615 rests on an unsourced history claim, 689 on an unsourced prevalence claim, 925's cause is a fragment, and 180 is missing "because" (T-4). |
| B8 | Pass | Framework vs platform in §3 (242, `> [!NOTE]`); the §6 Coming from the backend callout (483) lacks its `> [!TIP]` line (N-1). |
| B9 | Partial | Five terms used before any definition: paucal (379), OXC (559), SSR (609), Keys Manager (727), *widely available* (890) (T-1). |
| B10 | Pass | Graphemes, pipes, tokens, lazy routes, hydration, sanitization and encapsulation each get one sentence and a link. Two owner links are missing (N-5, N-6). |
| C1 | Partial | 44 of 47 sampled claims match. F-1, F-2 and T-3 are imprecise, and Q34.23's `toFixed` value cites the wrong test (N-3). |
| C2 | Pass | Eight Output IDs have tests; every answer value equals its assertion (script results above). |
| C3 | Pass | Every "in the lab" sentence names a test; all 94 cited titles exist. |
| C4 | Partial | `DurationFormat` is first mentioned at 121 without its marker, which first appears at 148 (F-3). Every other marker is in the §3.2 form. |
| C5 | Pass | Every API checked exists in the installed versions (claims table). |
| C6 | Pass | No `Unverified` in the module. |
| C7 | Pass | `check-snippets . 34` OK (CLOSE; main re-run pending). The §12 pseudo-code is a labelled `text` block. |
| C8 | Pass | Both URLs are accounted for, and every cited docs page is in SOURCES.md. The outputs line's label is stale (N-7). |
| D1 | Pass | 25 of each part (script). |
| D2 | Pass | All eight Output short answers give the values and a reason. |
| D3 | Pass | Concept 8, Output 8, Bug hunt 4, Difference 2, Trade-off 2, Design 2; max 32%. |
| D4 | Pass | Q34.01-25 follow the section order. |
| D5 | Pass | The plan's "not asked here" list holds: no question repeats Q14.21-23 or Q01.10-11. |
| D6 | Pass | All 25 IDs are linked from the body; answers link back to their sections. |
| D7 | Pass | `<a id="q34-NN">` above each question; check-links resolves them. |
| D8 | Pass | 25 Q (ceiling 25, floor 25), 4 Ex. |
| E1 | Pass | Full anatomy in all four. |
| E2 | Pass | 20 of 20 criteria are test titles; each account names what its test asserts. |
| E3 | Pass | Pipe (unit) → built-in i18n over three builds → two libraries → RTL over two builds. |
| E4 | Pass | Solutions are in the labs; build and test results are pending the re-runs. |
| E5 | Pass | Eight Output questions. |
| F1 | Pass | Three paragraphs restate all 12 sections with links (1025-1029). |
| F2 | Pass | 5 prompts naming listeners. |
| F3 | Pass | 7 flashcards. |
| F4 | Pass | Builds on, Read next, Uses these ideas later, Comparisons, each with a reason (1941-1944). |
| G1 | Pass | 18,770 ≤ 19,006. |
| G2 | Pass | The five SYLLABUS §4 checkboxes map as M34.md's breadth table says (spot-checked). |
| H1 | Pass (pending) | CLOSE-M34's run; the main session's re-runs above. |
| H2 | Pass (pending) | CLOSE's `check-links --planned`; main re-run above. |
| H3 | Pass | `dist` is ignored; there is no `test-results`. One orphan file (For Jorge 4). |

## Module-specific checks

| Check | Result | Evidence |
|---|---|---|
| HOUSE-30/31 result in every module-34 LOG line | Pass | `npm ls` versions, the `fr/index.html` build and the smoke result are in LOG 1306-1338 (all 22 task lines). |
| Recorded formatted strings, plural categories, message IDs, placeholder names, console messages, folder names, headers, layout positions (F8-F14, F18, eight Output answers) vs specs | Pass (read) | The values listed under Output values above, plus `2522557153388325485`/`1426216042718898919`, `4200317694838753109`, `Laboratoire i18n du module 34`, `matrix(-1, 0, 0, 1, 0, 0)`, `CAD`/`CA$` forms. Pass/fail of the runs: main. |
| Invisible characters by code point; none raw in the module (C10) | Pass (module) / Partial (labs) | Module clean (script). Raw U+00A0/U+200F in three specs (F-4). |
| No throwaway observation, no duration, no unsourced popularity, size or speed claim (C6) | Pass, one nit | §9 table and Q34.19 say "nothing here measures speed". 689's "libraries dominate blog posts" is an unsourced prevalence cause (T-4). |
| Time zones explicit in every date test (C13) | Pass | Script above; every Playwright context sets `locale` and `timezoneId`. |
| Node vs Chromium kept apart (C14) | Pass | Node values are labelled (31, 136, 217, 1033, 1167); browser claims cite e2e tests. Q34.03's follow-up cites a Chromium test that shows agreement (N-4). |
| Build-time vs run-time missing translation (C9) | Pass, one nit | 529-531, 648, 690 and the §9 table keep them apart. Q34.15's follow-up blurs them (T-3). |
| Docs' `few` row and F13's truncation as mismatches (C11) | Pass | 379 "The row simplifies", 432, 1110, 1288. Truncation: 375 is read from the source and tested against `Intl`'s `other`; 433 states it as a difference. |
| Library versions only as sourced (C15) | Pass | Versions in plain text; features are cited to the 8.4.0/18.0.0 packages, the docs and the GitHub releases (SOURCES). |
| Shared files only by HOUSE-30/31; append-only files as declared (C12) | Pass (read) | `package.json` diff adds the three exact pins; the `tsconfig.json` reference to `i18n-lab` is in HOUSE-31's file list (LOG 1305). `i18n-lab` and `labs/e2e` are untracked, so they cannot be diffed (For Jorge 3). |
| Owner credit and the 01/10/12/14/16/24/29/32/33/36/41/44 split (C7) | Pass, two nits | Each owned topic gets one sentence and a link. §7's serving paragraph lacks 44 (N-5) and §10's float sentence lacks Q01.09 (N-6). |
| Internal names marked (C8) | Partial | Every section marks them "internal". §8 and §11 never say "may change", and §4's first one lacks it (T-2). |
| Status markers (C5) | Partial | F-3. `getLocale*`, `getNumberOfCurrencyDigits`, `withI18nSupport`, `:dir()`, `<bdi>`, `getTextInfo`, `getWeekInfo` are in the right form. |
| Exercise criteria = test titles; the alternative runs | Pass | 20/20; `describe.each` and variant loops (read); the runs are main's. |
| ≥ 2 answered follow-ups | Pass | 2 each. |
| Terms defined at first use | Partial | T-1. |
| Links into written modules carry anchors | Pass | All links into 01, 10, 11, 12, 13, 14, 16, 24, 25, 29, 32, 33 have anchors; file-level only to planned 36/38/41/44/46. |
| SOURCES complete | Pass | See the URLs result above; N-7 is a label only. |
| Twelve Mermaid diagrams parse | Main | Counted 12; the parse is the main session's. |
| Misconceptions causes; `<details>` closed; type mix | Partial / Pass / Pass | T-4; 44/44; max 32%. |
| Prose within 19,006 and ceiling 19,706 | Pass | 18,770; about 18,895 after the FIX. |
| No stray files; no server left (4300-4600) | Pass (reviewer) / main after re-runs | `git status`, `ls labs/e2e`. |
| File-level links into 34 as anchor candidates | Done | Handoffs below (13 rows). |

## Handoffs

Module 34 slugs:
- S2 `#2-the-platforms-intl-apis-dates-numbers-plurals-lists-collation-and-display-names`
- S3 `#3-angulars-locale-data-and-formatting-functions-versus-intl`
- S9 `#9-runtime-translation-libraries-transloco-and-ngx-translate-lazy-scopes-and-the-trade-off-against-built-in-i18n`
- S11 `#11-right-to-left-layouts-dir-logical-css-properties-and-bidirectional-text`

Line numbers were read 2026-10-16; find each line by its context, not its number. Only the link target changes (`34-i18n.md` → `34-i18n.md#<slug>`); +0 words. The mapping follows M34.md's "Handoffs into 34".

| File:line | Context | Anchor |
|---|---|---|
| 01:189 | "`Intl.Segmenter` exposes them. [Module 34]" | S2 |
| 01:413 | "`Intl.Collator('en', { numeric: true }).compare` for strings that contain numbers ([Module 34]" | S2 |
| 01:831 | "so older Firefox versions lack it; [Module 34] covers `Intl`" | S2 |
| 01:1255 | "languages written without spaces (Thai, Japanese) need locale-specific rules ([Module 34]" | S2 |
| 10:381 | "Right-to-left design belongs to [module 34]" | S11 |
| 10:851 | "*Logical properties?* `margin-inline` follows writing mode ([module 34]" | S11 |
| 14:636 | "Registering data is [34's]" | S3 |
| 14:639 | "see [08] for the platform and [34] for Angular's i18n" | S3 |
| 14:668 | "because an unregistered language throws `NG0701` ([34]" | S3 |
| 14:1497 | "other locales are files under `locales/` registered at run time, which [module 34]" | S3 |
| 14:1568 | "The fix is to register the locale's data first ([module 34]" | S3 |
| 25:2784 | "Not covered: … translations ([module 34]" | S9 |
| 25:2856 | "Provide another map through the token; locale files are [module 34]'s" | S9 |

Stay file-level (headers, Leads to, Read next, Uses these ideas later, as REVIEW-M33 did): 01:1486, 10:5, 10:1400, 11:1598, 13:2514, 14:5, 14:2205, 24:5, 24:2979, 32:2286. M34.md maps 13:2514 to §4, 24:2979 to §7, 32:2286 to §7/§12 and 11:1598 to §11 for content, but these are Uses-these-ideas-later lines.

## Factual findings

**F-1 · Minor (C1) · Q34.02's short answer folds the provider into the factory (1061).** `LOCALE_ID`'s factory (`_debug_node-chunk.mjs` 19709-19714) is `inject(LOCALE_ID, { optional: true, skipSelf: true }) || getGlobalLocale()`. A provider in the same injector replaces the factory, which then never runs; the factory's first branch is a provider in a parent injector.
- Fix: "The `LOCALE_ID` factory takes a provider first (the parent injector's value), then `$localize.locale`, then `en-US`." → "A `LOCALE_ID` provider replaces the factory; without one, the factory takes a parent injector's value, then `$localize.locale`, then `en-US`." (+4)

**F-2 · Minor (C1) · Q34.07's lookup order reads as if every locale falls back to `en` (1179).** `findLocaleData` (15690-15705) tries the full tag, then the language part, returns the built-in `localeEn` only when the language part is `en`, and otherwise throws 701. The same answer then says `pt` throws, which contradicts the sentence as written.
- Fix: "then by its language part, then fall back to built-in `en`, else they throw `NG0701`." → "then by its language part; an `en-*` tag falls back to the built-in `en`, and any other tag throws `NG0701`." (+3)

**F-3 · Minor (C4, M34.md C5) · `DurationFormat`'s marker and the Baseline definition come after its first mention.** The first body mention is §2's Mental model list (121); the marker and the Baseline definition are at 148. *Widely available*, used at 890 and 892, is never defined (STYLE-GUIDE §3.2 asks for both terms at the first use).
- 121: "`DisplayNames` and `DurationFormat`. Think of rubber stamps" → "`DisplayNames` and `DurationFormat` [Baseline 2025: newly available, per MDN]. [Baseline](https://developer.mozilla.org/en-US/docs/Glossary/Baseline/Compatibility) *newly available* means the latest stable Chrome, Edge, Firefox and Safari support a feature; *widely available* means they have for at least 2.5 years. Think of rubber stamps" (+33)
- 148: "[Baseline](https://developer.mozilla.org/en-US/docs/Glossary/Baseline/Compatibility) *newly available* means the latest stable Chrome, Edge, Firefox and Safari support a feature. MDN (read 2026-10-15) lists `Intl.DurationFormat` [Baseline 2025: newly available, per MDN] and" → "MDN (read 2026-10-15) lists `Intl.DurationFormat` (above) and" (−21)

**F-4 · Minor (C10, lab rule) · raw invisible characters in three lab specs.** The module is clean, but these files compare with raw characters instead of `\u` escapes (code-point script):
- `labs/ts-js/src/modules/34-i18n/section-10-money.test.ts` 27: `'CAD 1,234.50'` has a raw U+00A0 → `'CAD 1,234.50'`;
- `labs/angular/src/app/modules/34-i18n/concepts/section-10-dates-money.spec.ts` 80, 81, 90: `'1.234,50 $'`, `'1.234,50 €'`, `'1.234,50 €'` each have a raw U+00A0 → `'1.234,50 $'`, `'1.234,50 €'`, `'1.234,50 €'`;
- `labs/e2e/tests/34-i18n/exercise-2-checkout/checkout.spec.ts` 69-70: `fr: "37,50 €"` (U+00A0) and `ar: "‏37.50 €"` (U+200F, U+00A0) → `"37,50 €"` and `"‏37.50 €"`.
- The values must not change, only their spelling. Test titles stay the same. Re-run those three specs (the e2e one with `--repeat-each=5`).

## Teaching and completeness findings

**T-1 · Minor (B9) · five terms before any definition.**
- 379: "CLDR calls it a language's paucal form" → "CLDR calls it a language's paucal form (the form for a small number)" (+6).
- 559: "parses each output file with OXC" → "parses each output file with OXC (the `oxc-parser` JavaScript parser, 0.150.0 in the lab)" (+8). Basis: `node_modules/oxc-parser/package.json` ("Oxc Parser Node API", 0.150.0).
- 609: "may lead to undefined behavior when used with SSR" (read: `i18n-options.js`)" → "may lead to undefined behavior when used with SSR" (server-side rendering; read: `i18n-options.js`)" (+2). This is the first "SSR" in the module.
- 727 (§9 table, Extraction row): "Keys Manager (docs)" → "Keys Manager, Transloco's key-extraction tool (docs)" (+4).
- *widely available* (890): fixed by F-3.

**T-2 · Minor (M34.md C8) · internal names without "may change in any release".** §8 and §11 never say it, and §4's first internal name lacks it.
- 278: "(read: internal `computePlaceholderName`, `_localize-chunk.mjs`)" → "(read: internal `computePlaceholderName`, which may change in any release, `_localize-chunk.mjs`)" (+6).
- 648: "At each call the internal `translate$1` looks up" → "At each call the internal `translate$1` (may change in any release) looks up" (+5).
- 894: "`'auto'` goes through the internal `_resolveDirectionality` and `navigator.language`." → "`'auto'` goes through the internal `_resolveDirectionality` (may change in any release) and `navigator.language`." (+5)

**T-3 · Minor (C9) · Q34.15's first follow-up (1360) blurs `warning` and `error`.** As written, it explains English showing in a French build by a setting under which that build would fail.
- Fix: "The computed ID changed and the French file holds the old one (the lab's production build sets `i18nMissingTranslation` to `error`; read, not run)." → "The computed ID changed and the French file holds the old one; with the default `warning` the build still passes, while the lab's production configuration sets `error`, which would fail it (read, not run)." (+10)

**T-4 · Minor (B7, C6) · four Misconceptions causes.**
- 615: "the myth exists because older guides ran one build per locale" is a history claim with no version or source. → "the myth exists because the output holds one full app per locale folder" (−1). Basis: `Section 7: the build writes one folder per locale`.
- 689: "libraries dominate blog posts" is an unsourced prevalence claim. → "the docs present built-in i18n as a build step ("Compile once, then translate for each locale.")" (+10). Basis: `merge.md`, already in SOURCES.
- 925: "flips the glyphs too (a mirror is familiar)." → "flips the glyphs too; the myth exists because a mirror image is the familiar picture of "reversed"." (+9)
- 180: "the myth exists: English has two." → "the myth exists because English has two." (+1)

**Nits (folded into FIX-M34-01, except N-7):**
- **N-1 (B8):** the §6 Coming from the backend callout (483) lacks the `> [!TIP]` line STYLE-GUIDE §6 uses. Insert `> [!TIP]` as its own line before 483 (+0).
- **N-2:** Q34.18 full explanation (1427) ends with the §7 link followed by `)).`: one `)` too many. Delete it (+0).
- **N-3 (C1):** Q34.23 (1546): "`toFixed(2)` gives `1234567.50`, while `{{ 1235 | currency: 'JPY' }}` prints `¥1,235` (`Section 10: yen and Chilean pesos have no minor digits`)." → "`(1234567.5).toFixed(2)` gives `1234567.50`, with no grouping or symbol (`Section 10: adding prices as floats drifts while integer minor units do not`), while `{{ 1235 | currency: 'JPY' }}` prints `¥1,235` (`Section 10: yen and Chilean pesos have no minor digits`)." (+14). The `toFixed` value is asserted in `section-10-money.test.ts` 17, not in the yen test.
- **N-4 (C14):** Q34.03's second follow-up (1085) cites a Chromium test as evidence of a difference, but that test shows Chromium printing U+0020, as Node does. "Not guaranteed: each ships its own ICU data (`Section 2: …`)." → "Not guaranteed, since each ships its own ICU data; for the `en-US` short time both print U+0020 (`Section 2: …`)." (+7)
- **N-5 (C7):** §7 Serving (567). After "(read, not run; deployment: 32 §9)." add `` Serving the folders in production is [44](44-fullstack-delivery-and-operations.md)'s.`` (+8)
- **N-6 (C7):** §10 (820). After "while `10 + 20` cents is `30`" add `` ([Q01.09](01-js-values-types-coercion.md#q01-09) owns money in JavaScript)`` (+6).
- **N-7 (SOURCES, +0 module words):** the `## Module 34` outputs line begins "Questions Q34.01-Q34.20 output code" but covers Q34.21-25 and the e2e outputs spec too. Change it to "Questions Q34.01-Q34.25 output code".

## Judged acceptable

- §3 and §10 call `getCurrencySymbol` and `getNumberOfCurrencyDigits` deprecated, which contradicts M34.md F7. The typings (819, 837) confirm the module.
- 816: "an IANA name does not throw … falls back to the host's zone": `timezoneToOffset` (948-952) and `node -e` (`Date.parse('Jan 01, 1970 00:00:00 America/New_York')` is NaN) agree; the test's comparison is deterministic.
- 559 "except for `en-US`, its data": `locale-data.js` 44-45 skips `en` and `en-US`.
- 465 extraction settings, 479 `checkDuplicateMessages` merging identical text, 609 `baseHref` warning (`i18n-options.js` 110 for `i18n.locales.<id>`), and 565's dev-server message: all match the source.
- §12's pseudo-code block is labelled "Pseudo-code, not compiler output".
- §5's truncation is stated as read source plus a test against `Intl`, not as a docs claim (C11 satisfied).
- Arabic strings in Exercise 34.2's account (1719) sit beside their English meaning, so they are never the only explanation (M34.md Lab decision 5).

## Claims sampled (47)

| # | Claim (line) | Basis | Result |
|---|---|---|---|
| 1 | `LOCALE_ID` factory text (68) | core 19709-19714 | Match |
| 2 | `getGlobalLocale` → `$localize.locale` or `en-US` (68) | core 19702-19708 | Match |
| 3 | `setLocaleId` lower-cases and replaces `_` (70) | core 15778-15783; core.mjs 1926 | Match |
| 4 | `DEFAULT_CURRENCY_CODE` factory is `USD` (70) | core 19715-19717 | Match |
| 5 | Q34.02 "factory takes a provider first" (1061) | core 19709-19714 | **Partial (F-1)** |
| 6 | `registerLocaleData` lower-cased map (211) | core 15679-15689 | Match |
| 7 | Global variant assigns `ng.common.locales` (213) | `locales/global/de.js`; core 15714-15723 | Match |
| 8 | Q34.07 fallback order (1179) | core 15690-15705 | **Partial (F-2)** |
| 9 | `getLocale*`, `getCurrencySymbol`, `getNumberOfCurrencyDigits` deprecated 18.0 (215) | `common.d.ts` 469, 819, 837 | Match |
| 10 | `getLocaleId` deprecation text (215) | `common.d.ts` 469-472 | Match |
| 11 | No `Intl.` in `@angular/common` (253) | grep over `fesm2022` (0) | Match |
| 12 | Q34.06 values, `ar-EG` code points (1161) | outputs spec 77-94; `node -e` | Match |
| 13 | Q34.04 table (1101-1108) | ts-js outputs test; `node -e` | Match |
| 14 | `ru` 21 is `one`, `ar` 3 `few`, 100 `other` (142, 1110) | section-2 test; `node -e` | Match |
| 15 | Japanese segmentation: eight words, `en` the same (146) | section-2 test | Match |
| 16 | ICU 78.3 / CLDR 48.0 asserted (136) | section-2 test; `node -e` | Match |
| 17 | Chromium `3:30 PM` with U+0020 (136) | e2e section-2 spec | Match |
| 18 | `customId || computeMsgId(messageString, meaning || '')` (280) | `_localize-chunk.mjs` 147 | Match |
| 19 | `computePlaceholderName`, `stripBlock` (278, 282) | `_localize-chunk.mjs` 225, 252 | Match |
| 20 | `loadTranslations`/`clearTranslations`/null-prototype map (648) | `localize.mjs` 78-92 | Match |
| 21 | Miss and placeholder mismatch throw, `translate` warns and returns source (648) | `localize.mjs` 21-39, 93-101 | Match |
| 22 | `getPluralCase` uses `parseInt` (375) | core 15756-15760 | Match |
| 23 | `getCaseIndex` exists (373) | core | Match |
| 24 | Q34.13 four texts (1306-1308) | outputs spec 164-167 | Match |
| 25 | CLI infers `@angular/build:extract-i18n` (465) | `cli.js` 18-45 | Match |
| 26 | Extraction builds with optimization and localize off (465) | `application-extraction.js` 23-25 | Match |
| 27 | Default file names per format (467-475) | `options.js` 73-81 | Match |
| 28 | Both i18n options default `warning` (479, 1375) | `schema.json` 419, 425 | Match |
| 29 | Identical text merges (479) | `checkDuplicateMessages` 36-37 | Match |
| 30 | Five lab messages, IDs `2522557153388325485`, `4200317694838753109` (481, 502) | `extract.ts`; `messages.xlf` 196, 203 | Match |
| 31 | Polyfills end with `___NG_LOCALE_INSERT___` (559) | `application-code-bundle.js` 531 | Match |
| 32 | Inliner overwrites the locale plus data, except `en-US` (559) | inliner 306-326; `locale-data.js` 44-45 | Match |
| 33 | Inliner uses `ɵtranslate` via `translateMessage` (962) | inliner 199-208; `localize.mjs` exports | Match |
| 34 | `getLocaleBaseHref` = `baseHref` + `subPath/` (561) | `options.js` 424-436 | Match |
| 35 | Dev server message (565, 1400) | `dev-server/vite/index.js` 124 | Match |
| 36 | `baseHref` SSR warning (609) | `i18n-options.js` 75, 110 | Match |
| 37 | Q34.18 302, `Vary`, `lang`/`dir`, headings (1425) | e2e outputs spec 15-30 | Match |
| 38 | `TRANSLATIONS` only defined and exported (654) | grep core `fesm2022` | Match |
| 39 | Q34.20 three cases and warning text (1473) | outputs spec 215-230 | Match |
| 40 | Transloco `reRenderOnLangChange: false`, impure pipe, missing handler returns key, dev-mode warn (716) | transloco 25, 1421, 257-266 | Match |
| 41 | `getMappedScope`, `_handleMissingKey`, `getTextToInterpolate` exist (716, 718) | transloco; ngx-translate | Match |
| 42 | `formatCurrency` digits from `getNumberOfCurrencyDigits`; `JPY`/`CLP` 0, unknown 2 (818) | common 1103-1110, 103-164, 439-446 | Match |
| 43 | Q34.23 `toFixed` value cited to the yen test (1546) | `section-10-money.test.ts` 17 | **Mismatch of citation (N-3)** |
| 44 | `Directionality` reads `body.dir || documentElement.dir` once (894) | cdk 21-31 | Match |
| 45 | Q34.24 gaps 184/16, 200/0, text right 0, `ltr` (1564) | e2e outputs 53-65; `ng test` outputs 240 | Match |
| 46 | `withI18nSupport` `@publicApi 20.0` (968) | `platform-browser.d.ts` 421-423 | Match |
| 47 | Q34.15 follow-up on missing translations (1360) | `schema.json`; `angular.json` production | **Partial (T-3)** |

## Proposed FIX tasks

The module is at 18,770 words; the CLOSE limit is 19,006 and the REVIEW ceiling is 19,706.

Table rows (for the Module 34 table in TASKS.md):

```
| FIX-M34-01 | S | todo | REVIEW-M34 | |
| FIX-M34-02 | S | todo | REVIEW-M34 | |
| FIX-M34-03 | S | todo | REVIEW-M34 | |
```

### FIX-M34-01 · S · Q34.02 and Q34.07 lookup order, `DurationFormat` marker and Baseline terms, terms, internal names, Q34.15 follow-up, Misconceptions causes, nits (F-1, F-2, F-3, T-1, T-2, T-3, T-4, N-1..N-7)
- Files: `modules/34-i18n.md`; `SOURCES.md` (N-7 label only); `_meta/LOG.md` (its own line only).
- Do: apply each fix text above; find each line by its quoted text. No lab file, test title or anchor change.
- Acceptance: `node labs/tools/check-snippets.mjs . 34` and `node labs/tools/check-links.mjs --planned` exit 0; `grep -c 'older guides' modules/34-i18n.md` = 0; `grep -c 'dominate blog' modules/34-i18n.md` = 0; `grep -c 'fall back to built-in' modules/34-i18n.md` = 0; `grep -c 'paucal form (the form' modules/34-i18n.md` = 1; `grep -c '^> \[!TIP\]' modules/34-i18n.md` ≥ 1; the invisible-character check prints nothing; prose at most +200 over the count just before and at most 19,006, both counts in the LOG line.
- Model: **Sonnet** (every text is prescribed).

### FIX-M34-02 · S · `\u` escapes in three lab specs (F-4)
- Files: `labs/ts-js/src/modules/34-i18n/section-10-money.test.ts`, `labs/angular/src/app/modules/34-i18n/concepts/section-10-dates-money.spec.ts`, `labs/e2e/tests/34-i18n/exercise-2-checkout/checkout.spec.ts`; `_meta/LOG.md`.
- Do: replace the raw U+00A0/U+200F in the six expected strings with ` `/`‏`. Change no value and no title.
- Acceptance: no U+00A0, U+202F, U+200F, U+061C or U+2066-U+2069 in any file under the module-34 lab folders; main re-runs `ng test` for the section-10 spec, `vitest` for `section-10-money`, and e2e `checkout.spec.ts --repeat-each=5`, all green.
- Model: **Sonnet** (mechanical).

### FIX-M34-03 · S · Anchors for the file-level links into 34 (+0 words)
- Files: link targets only in `modules/01-*.md`, `10-*.md`, `14-*.md`, `25-*.md` (allowed through this FIX, RUN.md §10).
- Do: apply the Handoffs table (13 rows; find each line by its context). Verify each slug against module 34's `## N.` headings. Leave the stay-file-level lines alone.
- Acceptance: `check-links --planned` exit 0; the diff touches only those four files; their prose counts are unchanged.
- Model: **Sonnet** (mechanical; slugs listed).

## For Jorge

1. **Carried from CLOSE-M34 and M34.md For Jorge 3-4:**
   - VERSIONS.md rows: `@angular/localize` 22.2.1, Transloco 8.4.0, ngx-translate 18.0.0, Node 24's ICU 78.3 / CLDR 48.0, `withI18nSupport` stable since 20.0, `getLocale*` deprecated since 18.0;
   - two possible upstream reports: the i18n guide's `few` row ("Quantity is 2 or more"), and ICU plurals truncating decimals (`parseInt`, so English 1.5 takes `one`);
   - the docs say `ng serve` with several locales errors, while 22.2.1 only warns and disables `localize` (565).
2. **Plan fact F7 was wrong:** `getCurrencySymbol` and `getNumberOfCurrencyDigits` are deprecated since 18.0. The module is right, so no FIX is needed.
3. **C12 rests on reading:** `labs/e2e` and `projects/i18n-lab` are wholly untracked, so "append-only" for `app.routes.ts`, the `.xlf` and the JSON files cannot be diffed.
4. **Optional cleanup:** `labs/angular/projects/i18n-lab/tsconfig.spec.json` exists although no `*.spec.ts` lives under `projects/i18n-lab` (the same pattern as `security-lab`; not module text, no FIX).
