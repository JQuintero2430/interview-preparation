# REVIEW-M31: `modules/31-performance.md`

- **Reviewer:** a fresh reviewer subagent (claude-opus-5-5) of session S20261014-1808-claudecode, which read and judged the module. The re-runs were done by the main session (claude-opus-5-5) because the reviewer agent type is read-only. Module 31 was planned by PLAN-M31 (S20261013-1958) and written by HOUSE-21..23, SEC-M31-01..11, EX-M31-01..05, QB-M31-01..06 and CLOSE-M31, all in S20261014-0537. This session wrote nothing in module 31 and continues none of those conversations, so it is eligible (RUN.md §4).
- **Date:** 2026-10-14.
- **Files read:**
  - the whole module (2,013 lines; line numbers move at FIX time);
  - `_meta/modules/M31.md`, QUALITY-BAR, RUN.md §5-§7 and §10, the TASKS entries for REVIEW-M30 and REVIEW-M31, LOG 1186-1220, REVIEW-M30 (the format model);
  - every module-31 lab file (spec titles by grep; the e2e outputs spec and the section 1, 2, 4, 5 and 11 specs in full; the support helpers);
  - module 30's `server/app-server.mjs`, `playwright.config.ts` and `labs/e2e/package.json`.
- **Packages read:**
  - `@angular/cdk` 22.2.1 `fesm2022/scrolling.mjs` (lines 17-135, 708, 898) and `_recycle-view-repeater-strategy-chunk.mjs`;
  - `@angular/common` 22.2.1 `fesm2022/common.mjs` (lines 440-460, 571, 611, 729-735, 760-835, 895-985, 1078-1090, 1164-1428);
  - `@angular/build` 22.2.1: `schema.json`, `execute-build.js`, `chunk-optimizer.js`, `environment-options.js`, `budget-stats.js`, `web-worker-transformer.js`;
  - `@angular/core` 22.2.1: `_debug_node-chunk.mjs`, `_effect-chunk.mjs`, `_pending_tasks-chunk.mjs`;
  - `playwright-core` 1.63.0 `types/types.d.ts`; `web-vitals` 6.2.3 `README.md`.
- **Basis of each finding:** package source, read, or a script (grep/sed/wc). The re-runs are listed below.
- **Probe files:** none in the repo. A scratchpad Mermaid install was deleted afterwards.

Overall: an honestly sourced module with no Major finding. Every Output answer equals its spec's assertions, every cited test title exists, and every exercise criterion equals a test title. No test asserts a duration, and the only "faster" wording sits inside refuted myths. The DevTools UI and CrUX are documented only. Lighthouse and `web-vitals` are observed because HOUSE-22 installed them. The findings are precision and polish:
- the range-update wording (F-1) and the NG02967 trigger (F-2);
- an Output question that names a case the lab does not run (F-3);
- three Misconceptions bullets without the myth's cause (T-1);
- the anchor handoffs (T-5).

Net after the fixes: about +80 words, about 19,240, under both 19,530 and 20,230.

## Re-runs (main session, serial, Node 24)

| Command | Result |
|---|---|
| `labs/e2e`: `npx tsc --noEmit -p .` | exit 0 |
| `labs/e2e`: `npm test -- tests/31-performance --repeat-each=5` | 265 passed (53 tests × 5) |
| `labs/angular`: `npx ng test --watch=false --include='src/app/modules/31-performance/**/*.spec.ts'` | 7 files, 33 passed |
| `labs/ts-js`: `npx vitest run src/modules/31-performance` | 1 file, 10 passed |
| Mermaid 11.12.0 + jsdom (scratchpad) | 11/11 parse; a negative control fails |
| `node labs/tools/check-links.mjs --planned` | All links resolve (389 planned) |
| `node labs/tools/check-snippets.mjs . 31` | All snippets check out |
| `lsof -iTCP:4300 -sTCP:LISTEN` | nothing listening; `labs/e2e/test-results` removed |

## QUALITY-BAR

45 items: **42 Pass, 3 Partial (B7, C1, C2), 0 Fail.**

| ID | Result | Evidence |
|---|---|---|
| A1 | Pass | Lines 3-9 in §4.1 order; the Labs line names three folders and three run commands; Applies to states the HOUSE-22 result. |
| A2 | Pass | Prerequisites 08 §6, 18 §5, 21 §2, 24 §4, all with anchors. |
| A3 | Pass | §1, §3, §5, §8; Q31.01, 06, 12, 17, 21, 25; then the Summary. |
| A4 | Pass | 11 sections plus 5 closing sections. |
| A5 | Pass | Method → instruments → runtime → lists → loading → bundle → images → memory → workers → rendering → internals; §11 is the deepest. |
| B1 | Pass | Script: each of the six headings 11 times; one `#### Legacy`, in §3, with its migration step (313). |
| B2 | Pass | Read: every problem is a concrete failure. |
| B3 | Pass | 11 diagrams, each followed by "What to notice"; 11/11 parse. |
| B4 | Pass | Each section names a package, file and function. Sampled ones match the installed sources (claims table). |
| B5 | Pass | Every `### Code` has an approach line and numbered steps; §10 says "No lab code". |
| B6 | Pass | Read: every bullet has "because". |
| B7 | Partial | Three §7 bullets lack the myth's cause (620, 621, 622) (T-1). |
| B8 | Pass | *Framework vs platform* in §5 (470) and §7 (608); the optional *Coming from the backend* was dropped. |
| B9 | Pass | Terms glossed at first use (sampled: CrUX, RUM, flame chart, long task, CDP, buffered entries, per-check work, rendered range, spacer, chunk, metafile, barrel, LCP element, fetchpriority, retainer, detached node, structured clone, transferable, CSR/SSR/SSG, breakpoint). |
| B10 | Pass | Owners get one sentence plus a link: 08, 12, 14, 17, 18, 20, 21, 23, 24, 28, 32. Q31.23's leaks are distinct from Q20.16's (1409 says so). |
| C1 | Partial | 32 claims sampled; 30 match, 2 imprecise (F-1, F-2). |
| C2 | Partial | The 6 Output IDs have tests and the answers equal the assertions, but Q31.15's title asks about a root-service case that no test observes (F-3). |
| C3 | Pass | 45 cited test names, 0 missing (script). "Read, not run" is marked where no test exists (355, 434, 511, 583, 742, 887, 889). |
| C4 | Pass | `[Stable since v20.2]`, `[Changed in v22.0: …]`, `[Added in v22.0]` (`injectAsync`), `[Added in v21.2]` (`Eager`). No `NgOptimizedImage` marker, because no CHANGELOG line was found (C5, LOG). |
| C5 | Pass | Every API sampled exists in 22.2.1 / 1.63.0. |
| C6 | Pass | 0 `Unverified`. |
| C7 | Pass | `check-snippets . 31` OK. Nit T-4 on the Ex 31.1 Partial header. |
| C8 | Pass | Script: every module URL appears in SOURCES.md. |
| D1 | Pass | 27 of each part; every answer has 2 or more answered follow-ups (read). |
| D2 | Pass | Each Output short answer states the values and a cause. |
| D3 | Pass | Output 6 / Design 5 / Concept 5 / Bug hunt 4 / Trade-off 4 / Difference 3, the plan's mix exactly. |
| D4 | Pass | Q31.01 (§1) through Q31.27 (§11). |
| D5 | Pass | The three dropped runtime questions stay with 14, 17 and 18; one "(→ 32)" question (Q31.26); §10 is a pointer section. |
| D6 | Pass | Every Q31 ID is linked outside its heading. |
| D7 | Pass | 27 unique anchors. |
| D8 | Pass | 27 ≤ 30 and ≥ 25; reason in PROGRESS. |
| E1 | Pass | Full anatomy in all five exercises. |
| E2 | Pass | 24 of 24 criteria are test titles. |
| E3 | Pass | 31.1 → 31.5 rise in difficulty; 31.4 and 31.5 integrate §2, §8 and §9. |
| E4 | Pass | Each alternative runs under the same titles (`describe.each` / variant loops; e2e 265 passed). |
| E5 | Pass | 6 Output questions. |
| F1 | Pass | 3 paragraphs linking all 11 sections. |
| F2 | Pass | 5 prompts, each naming a listener. |
| F3 | Pass | 7 flashcards. |
| F4 | Pass | Builds on, Read next, Uses these ideas later, Comparisons, each with a reason. |
| G1 | Pass | 19,156 prose words (sed + wc, equal to the LOG); no redundancy worth cutting. |
| G2 | Pass | 7 of 7 checkboxes covered. |
| H1 | Pass | Re-runs above. |
| H2 | Pass | `check-links --planned`: all resolve. |
| H3 | Pass | `git status -uall labs`: every module-31 file is declared, including the logged deviations. No `test-results/` left. |

## Module-specific checks

| Check | Result | Evidence |
|---|---|---|
| HOUSE-22 result in the LOG lines | Pass | Approved; SEC-M31-01 and -02 record the packages. Observed sentences cite the two HOUSE-22 tests (68, 154). |
| Recorded counts and values against the specs | Pass | F3 path `dist/labs/browser-stats.json`; F7 getters and srcset strings; F9 15 / 0..15, 18 / 4997..5015, 748..766, 744..762, 747..765; F10 nodes +25, leaky 5/10, fixed 0; six Output answers. All equal the assertions, and the specs pass 5 of 5. |
| No duration asserted; no unsourced speed or size claim (C6) | Pass | "faster" only in refuted myths and the Q31.26 trap; test numbers are counts. |
| No DevTools UI step worded as observed | Pass | 647 and Q31.21: "documented, not run". |
| Dev-only `NgOptimizedImage` checks not claimed for production (C9) | Pass | 583 and Q31.20; NG02954 runs under `ng test`. |
| Prototype exposure called lab instrumentation (C10) | Pass | 657, Q31.22, Ex 31.4 Constraints. |
| No direct `esbuild` / `rolldown` import (C12) | Pass | `metafile.ts` declares its own types; grep finds no import. |
| Module-30 lab edits limited (C13) | Pass (note) | `isAppRoute` `/m3[01]`, `--stats-json`, and HOUSE-23's static-file-first change (logged with its cause; For Jorge 4). |
| Owner credit and split (C7); Q31.23 vs Q20.16 | Pass | B10 row. |
| "(→ 32)" rule | Pass | Q31.26 only; §10 a pointer section. |
| C8 internal names marked | Pass | §4, §7, §8, §9, §11; Q31.27 follow-up. |
| Criteria = titles; alternatives run | Pass | E2, E4. |
| Mermaid | Pass | 11/11. |
| Misconception causes | Partial | T-1. |
| `<details>` closed | Pass | 49 / 49. |
| Prose ≤ 19,530 / ceiling 20,230 | Pass | 19,156. |
| Anchor candidates and 08:362 | Done | Handoffs below; 08:362 is For Jorge 2. |

## Handoffs

Module 31 slugs:
- S1 `#1-measure-first-the-loop-lab-versus-field-and-what-each-tool-answers`
- S3 `#3-runtime-cost-of-a-change-onpush-zoneless-signals-and-per-check-template-work`
- S4 `#4-long-lists-track-virtual-scrolling-with-the-cdk-and-the-alternatives`
- S5 `#5-loading-the-initial-bundle-lazy-routes-defer-and-preloading-as-one-plan`
- S6 `#6-bundle-analysis-budgets-and-tree-shaking-pitfalls`
- S8 `#8-memory-leaks-heap-snapshots-detached-nodes-and-the-devtools-workflow`
- S9 `#9-off-the-main-thread-web-workers-in-angular-and-runoutsideangular-in-zone-apps`

| File:line | Context | Anchor |
|---|---|---|
| 04:107 | long tasks → Web Worker | S9 |
| 05:95 | "bundlers … see module 31" | S6 |
| 05:270 | "Finding one. Take a heap snapshot…" | S8 |
| 05:1038 | heap snapshot, "Detached" | S8 |
| 08:672 | "virtual scrolling (module 31)" | S4 |
| 09:203 | how far to split | S5 |
| 09:831 | "Who builds the chunks?" | S6 |
| 12:217 | `statsJson` for the analyzer | S6 |
| 12:428 | DevTools / profiling | S1 |
| 12:937 | `statsJson`, reading it is 31's | S6 |
| 12:982 | "Analyze first" | S6 |
| 12:1089 | "profiling technique" | S1 |
| 12:1714 | budget fails | S6 |
| 17:110 | "Measure first" | S1 |
| 18:1713 | "whether it pays is a measurement" | S5 |
| 21:753 | algorithm, pure pipes, memoization | S3 |
| 21:1290 | "No saving is measured here" (the plan's 21:1155 has moved) | S3 |
| 21:1958 | "a better algorithm, a pure pipe or memoization" | S3 |
| 24:2199 | "Which strategy suits a large app?" | S5 |
| 28:1185 | "speed at scale" | S3 |

Stay file-level: headers, Leads to, Read next and Uses these ideas later (05:1680, 08:5, 08:1159, 09:5, 09:1606, 10:5, 10:1400, 12:5, 12:1861, 18:2611, 20:2235, 21:5, 21:2710-2711, 23:2746, 24:5, 24:2978-2979, 28:2793, 29:2999, 30:5, 30:1703-1704), and 08:75.

## Factual findings

**F-1 · Minor (C1) · §11 "It extends one side per call" (package source).** `@angular/cdk` 22.2.1 `scrolling.mjs` 92-104: when the start side extends, the end is re-set to `ceil(first + (viewport + minBufferPx) / itemSize)`; when the end extends, the start is re-set to `floor(first - minBufferPx / itemSize)`. The other side is trimmed, not kept (the module's own pseudo-code at 906/911 shows it).
- Fix 885: "Per call it extends the side whose buffer fell below `minBufferPx` (100) far enough to reach `maxBufferPx` (200), and re-sets the other side to `minBufferPx` from the visible rows." (+10)
- Fix Q31.27: append to the short answer's second sentence "; the opposite side is then re-set to about `minBufferPx` from the visible rows". (+12)

**F-2 · Minor (C1) · NG02967 is about the rendered image, not the placeholder's size (package source).** `common.mjs` 1419-1425 `assertPlaceholderDimensions` reads the `<img>`'s computed width and height against `PLACEHOLDER_DIMENSION_LIMIT` (1000).
- Q31.20 short answer: "an oversized placeholder logs `NG02967`" → "a placeholder on an image rendered wider or taller than 1000px logs `NG02967`".
- Q31.20 full explanation: "`NG02967` reports a placeholder whose dimensions exceed `1000px`" → "`NG02967` warns when an image that uses a placeholder renders larger than `1000px` in either dimension (`assertPlaceholderDimensions` reads the `<img>`'s computed size, internal)".
- Title: "an oversized placeholder" → "a placeholder on a very large image". About +15 words.

**F-3 · Minor (C2) · Q31.15 names four cases; the lab observes three (read).** The title includes "a `providedIn: 'root'` service" but no fixture exists; the answer says "not observed" (1248, 1253).
- Recommended: retitle "Three unused exports through a barrel: a pure function, a function in a file with a top-level side effect and a class with a static block. Which survive in the production chunk?"; delete the short answer's last sentence ("The lab has no root-service fixture…"); keep the follow-up to Q16.07. About -10.
- Alternative (Jorge): a `demo/tree-shaking/root-service.ts` fixture plus an assertion (lab change, Opus).

**F-4 · Nit (C1) · Q31.03 title and size (read).** The title says "a larger hero image 300 ms later", but the test inserts it once the heading's entry exists, "not after a timer" (1027). Retitle: "A heading paints, then a larger hero image, then the user clicks and a bigger block appears: which `largest-contentful-paint` entries does a buffered observer report?" (-2). 1027 "about 3 KB" → "a few kilobytes of content" (the SVG is about 4.2 KB by reading the template, not measured) (+1). Spec comment not edited.

**F-5 · Nit (C1) · Q31.24 follow-up (package source).** "No worker file is emitted, so the call fails at run time" goes beyond the source ("Unsupported worker expressions will be left in their origin form."). Fix: "No worker file is emitted and the call is left as written, so its URL names a file the build did not produce (read, not run)." (+6)

## Teaching and completeness findings

**T-1 · Minor (B7) · Three §7 misconceptions without the myth's cause.**
- 620: add "Lazy is the default advice for images, so it gets applied to all." (+12)
- 621: add "Dropping `width` and `height` looks like dropping layout altogether." (+9)
- 622: add "Size is the rule people remember; the exclusion is a Chromium heuristic." (+11)

**T-2 · Nit.** §4 337-338: add a blank line between the Mental model paragraph and the Mermaid fence.

**T-4 · Nit (C7).** Ex 31.1 starting point calls an undeclared `this.byId` and ignores `ascending`. Header comment: "// Partial: the slow starting point; imports, the Product type and the byId comparator omitted".

**T-5 · Minor (anchors).** The Handoffs table: the file-level links into 31 take an anchor.

**T-6 · Nit (C1 wording).** Q31.16 short answer "Their numbers can differ because they are produced by different mechanisms" → "Their numbers can differ: one maps minified bytes back through a source map, the other is the bundler's own per-input count, rewritten after the chunk pass." (+10)

**T-7 · Minor (For Jorge 4 of M31.md).** 08:362 "no lab can produce these numbers" is stale. Proposed: "jsdom has no `PerformanceObserver` and no layout, so the unit labs cannot produce these numbers; [31 §2](../../modules/31-performance.md#2-lab-metrics-in-a-real-browser-performance-observers-devtools-protocol-counters-and-lighthouse-in-ci) reads them in Chromium." (about +10 in 08)

**Judged acceptable:** SEC-M31-02 replaced the planned "headless numbers equal headed numbers" misconception with "The LCP entry list ends with the biggest element"; the duration point survives in §1's best practice and C6.

## Claims sampled (32)

| # | Claim (line) | Basis | Result |
|---|---|---|---|
| 1 | `_updateRenderedRange` 68-109 and pseudo-code (900-913) | pkg `scrolling.mjs` | match |
| 2 | `minBufferPx` 100, `maxBufferPx` 200 (351) | pkg 128, 135 | match |
| 3 | Top-of-list end `ceil((200 + 400) / 40)` = 15 | pkg formula, spec | match |
| 4 | 4997..5015 after `scrollToIndex(5000)` | spec section-4, Q31.09 | match |
| 5 | 748..766, 744..762, 747..765 | spec section-11 | match |
| 6 | Spacer `getDataLength() * itemSize`, offset `itemSize * start` (353) | pkg 63-67, 106 | match |
| 7 | `viewCacheSize` 20 (355) | pkg recycle chunk 25 | match |
| 8 | "Extends one side per call" (885) | pkg 92-104 | imprecise (F-1) |
| 9 | `getLoadingBehavior`, `getFetchPriority`, `getDecoding` (579) | pkg `common.mjs` 895-909 | match |
| 10 | `[1, 2]`, cutoff 640, `100vw` filter (581) | pkg 729-730, 938-950 | match |
| 11 | `processConfig` sorts breakpoints (887) | pkg 1166-1172 | match |
| 12 | No loader → no srcset | pkg 978-983 | match |
| 13 | `fill` sets `sizes ||= '100vw'`; absolute, 100%, inset 0 | pkg 831, 1083-1086 | match |
| 14 | NG02952 text | pkg 1355 | match |
| 15 | NG02954 required attributes | pkg 1341 | match |
| 16 | NG02955 text; observer only with `PerformanceObserver` | pkg 571, 454 | match |
| 17 | NG02963 placeholder without loader throws | pkg 1210 | match |
| 18 | NG02967 meaning | pkg 1419-1425 | imprecise (F-2) |
| 19 | `statsJson` description, default false | `schema.json` 535-538 | match |
| 20 | `sourceMap` default false | `schema.json` 361-363 | match |
| 21 | `allowedCommonJsDependencies` quote (517) | `schema.json` 558-559 | match |
| 22 | `browser-stats.json` only with `options.stats` (511) | `execute-build.js` 301-303 | match |
| 23 | Chunk pass condition (889) | `execute-build.js` 171-189 | match |
| 24 | Threshold 3; false/0, true/1, number | `environment-options.js` 155-176 | match |
| 25 | Rebundles with Rolldown | `chunk-optimizer.js` 243 | match |
| 26 | `initial: !!initialRecord` (434) | `budget-stats.js` 34-38 | match |
| 27 | Worker transformer comments (742) | `web-worker-transformer.js` 19, 51 | match |
| 28 | `publishDefaultGlobalUtils` dev-only (66) | `_debug_node-chunk.mjs` 13145 | match |
| 29 | `producerUpdateValueVersion` early return (235) | `_effect-chunk.mjs` 93-101 | match |
| 30 | `storeLViewOnDestroy`, `processCleanups` (645) | core chunks | match |
| 31 | `newCDPSession` NOTE (152) | `playwright-core` `types.d.ts` 10319 | match |
| 32 | `web-vitals` README quote (68) | README 32 | match |

## Proposed FIX tasks

Module 19,156 words; CLOSE limit 19,530; REVIEW ceiling 20,230.

- **FIX-M31-01 · S · Sonnet** · F-1, F-2, F-4, F-5, T-1, T-2, T-4, T-6 in `modules/31-performance.md` (about +80). No ruling.
- **FIX-M31-02 · S · Sonnet** · F-3 retitle (about -10). **Needs Jorge's ruling** (retitle vs fixture).
- **FIX-M31-03 · S · Sonnet** · T-5 anchors in 04, 05, 08, 09, 12, 17, 18, 21, 24, 28 (+0). No ruling (17 edited only through this FIX, RUN.md §10).
- **HOUSE (optional) · S** · T-7, 08:362. Needs Jorge's yes.

## For Jorge

1. **Q31.15:** retitle to the three observed cases (recommended), or add a root-service fixture?
2. **08:362:** apply T-7's sentence?
3. **VERSIONS.md rows** for Lighthouse 13.5.0, `web-vitals` 6.2.3 and `@angular/cdk` scrolling are still open.
4. **HOUSE-23 edited `labs/e2e/server/app-server.mjs`** beyond C13's list (logged, module 30 stayed green). Please confirm.
