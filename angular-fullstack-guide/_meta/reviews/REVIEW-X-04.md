# REVIEW-X-04: cross-module consistency, chunk 4 (modules 31–40)

- **Reviewer:** a fresh reviewer subagent (claude-opus-5-5) of session S20261024-0926-claudecode. It wrote no FIX task for modules 31–40 in this session and continues no writer's conversation, so it is eligible (FINISH.md §4.1, RUN §4). It ran only read-only commands. Fixes, FIX-X rows and bookkeeping belong to REVIEW-X-06 and main.
- **Date:** 2026-10-24.
- **Summary:** 68 `X-04` items in REVIEW-X-SCAN.md (§1 4, §2 0, §3 0, §4 37, §5 27). 13 are covered by 12 findings and 55 are judged acceptable (13 + 55 = 68). All 12 findings are Low. **12 findings: 0 High, 0 Medium, 12 Low.** One marker uses the wrong kind (F01). Twelve markers in 32 and 33 sit in code spans (F02). Ten upstream modules have a `Leads to` line that is missing the return edge to 31, 34, 35, 36, 37 or 40 (F03–F12). The glossary has no duplicate question and no pair of definitions that cannot both be true. The Summaries contradict no owner. The carry-over notes for 31–40 hold no open FIX item: all are retired or stay Jorge's.
- **Line numbers** are as of this review. Every fix quotes its old text, and each quoted old text occurs exactly once in its file (checked with `grep -cF`, run).

## Runs (the reviewer, Node 24, 2026-10-24)

Verified by running:
- `grep`/`sed`/`awk` over REVIEW-X-SCAN.md: `X-04` items per section 4 / 0 / 0 / 37 / 27 = 68 (`grep -c 'X-04'` = 68). Section 5 has 17 header lines and 10 Applies to lines.
- `labs/tools/module-stats.mjs` `proseWords` (imported read-only, the edit applied in memory): 01 15,398 → 15,400 (F03); 08 9,925 → 9,927 (F04).
- `grep -noE` over `modules/3[1-9]-*.md modules/40-*.md` for a status marker inside a code span: 12 hits, 10 in 32 and 2 in 33 (F02).
- Header checks: line 5 (`Leads to`) of 01, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 24, 27, 28, 29, read with sed; every `#qNN-MM` link in the headers of 31–40 has its `<a id>` anchor in the module (script, run, no misses).
- CHANGELOGs fetched with curl into scratch, 2026-10-24. Angular (`angular/angular` `main` `CHANGELOG.md`): `# 15.2.6 (2023-04-05)` lists d9efa1b0d7 "change the URL sanitization to only block javascript: URLs (#49659)". Under `# 22.2.1 (2026-09-30)`, line 247 reads "block dangerous data: and vbscript: URLs in URL sanitizer". Components (`angular/components` `main` `CHANGELOG.md`): `# 22.0.4` (2026-07-08) "**core:** rework error state matcher to handle signal forms (#33500)"; `# 22.2.1` (2026-09-30) "**overlay:** allow users to opt into closing on any URL change (#33893)"; `# 21.0.6` (2026-01-08) "**drag-drop:** make item and list easier to tree shake (#32604)". Each commit appears exactly once in the file.
- GitHub API, 2026-10-24: PR #32604's diff adds `@deprecated Use the createDragRef or createDropListRef function …` and `@breaking-change 23.0.0` to `drag-drop.ts`. PR #33500 ("I ended up introducing a new method in order to keep backwards compatibility") adds `isSignalErrorState` to `ErrorStateMatcher`, to `ShowOnDirtyErrorStateMatcher` and to the stepper (goldens `+ isSignalErrorState…`).
- Typings and packages in `labs/angular/node_modules`, read with grep: `@angular/cdk` 22.2.1 `types/_overlay-module-chunk.d.ts:259` `type OverlayDisposeOnNavigation = boolean | 'url-change' | 'pop-state'`; `types/drag-drop.d.ts:1331-1335` `@deprecated … Will be removed in v23`; `@angular/material` `types/_error-options-chunk.d.ts:8,15` `isSignalErrorState`; `@angular/material/package.json` peer `"@angular/cdk": "22.2.1"`; `@angular/core` 22.2.1 `_debug_node-chunk.mjs:3108` `SAFE_URL_PATTERN = /^(?!javascript:)…/i` and `:3956` `MAX_ANIMATION_TIMEOUT_DEFAULT = 4000`; `@angular/platform-browser` typings `withIncrementalHydration` `@deprecated Since v22.0.0`, `withNoIncrementalHydration` `@publicApi 22.0`.
- npm registry, 2026-10-24: the `@angular/core` dist-tags are still `latest` 22.2.3 and `next` 22.3.0-next.2, the versions 33:264 names.

Read, not run: the headers and Summaries of 31–40; the 37 glossary pairs in scan §4 and the definition lines they point at; the passages each item points at; VERSIONS.md; STYLE-GUIDE §3, §5.1; SYLLABUS §1 rows 31–40; STATE standing notes; STATE-ARCHIVE lines 21, 65; REVIEW-M32 rows C4 and "STATE items left to REVIEW"; FINISH.md §4 and For Jorge (J4, J9); REVIEW-X-01 (shape and For Jorge 3).

## Findings

#### X-04-F01 · Low · marker · `isSignalErrorState` was added in 22.0.4, not changed

- **Location:** `modules/36-material-and-cdk.md:145`: "A Signal Forms field (`[26 §3](…)`) gets `isSignalErrorState` [Changed in v22.0.4: reworked to handle Signal Forms], the same rule".
- **Evidence:** `isSignalErrorState` did not exist before PR #33500. The PR adds it, and its author writes "I ended up introducing a new method in order to keep backwards compatibility" (GitHub API, run). The components CHANGELOG lists the PR under 22.0.4 only (curl, run). What 22.0.4 changed is `ErrorStateMatcher`. The method the sentence marks is new, so STYLE-GUIDE §3.2 asks for `Added`. The marker stays at patch level because the method shipped in a patch: `v22.0` would date it to 22.0.0, which did not have it (see For Jorge 1).
- **Right side:** the CHANGELOG and the PR diff.
- **Fix text:** 36: `` `isSignalErrorState` [Changed in v22.0.4: reworked to handle Signal Forms] `` → `` `isSignalErrorState` [Added in v22.0.4] `` (−5 words; Part D has no prose cap).

#### X-04-F02 · Low · marker · twelve markers in 32 and 33 are code spans

- **Location:** `modules/32-ssr-ssg-hydration.md`: 524, 606 (two), 630 (two), 1063, 1081, 1091, 1133, 1615; `modules/33-security.md`: 266, 273. Example, 32:630: "Opt out with `withNoIncrementalHydration()` `` `[Added in v22.0]` ``; `withIncrementalHydration()` `` `[Deprecated since v22.0 — use the default of provideClientHydration()]` ``".
- **Evidence:** STYLE-GUIDE §3.2 says "Markers are inline text in square brackets". X-01-F03 applied that rule to module 08, and REVIEW-X-01 For Jorge 3 left the backticked markers in 32 and 33 to this chunk. In a code span, the API names inside the marker lose their own code formatting, and a reader sees a code literal where a status belongs. The statuses themselves agree with the typings checked (`withIncrementalHydration` `@deprecated Since v22.0.0`, `withNoIncrementalHydration` `@publicApi 22.0`, read) and with the CHANGELOG (15.2.6, run). The other statuses in this group were not re-checked here, because REVIEW-M32 C4 judged them. The 33:273 Baseline status was not re-fetched.
- **Right side:** STYLE-GUIDE §3.2: plain text, with code names inside the marker in backticks, as 36:625 writes them.
- **Fix text:** twelve swaps. Each old text includes its enclosing backticks:
  - 32: (1) ``Event replay `[Changed in v22.0: on by default through provideClientHydration()]`:`` → ``Event replay [Changed in v22.0: on by default through `provideClientHydration()`]:``; (2) ``Event replay `[Changed in v22.0: on by default through provideClientHydration()]`.`` → ``Event replay [Changed in v22.0: on by default through `provideClientHydration()`].``; (3) ``**Incremental hydration** `[Stable since v20.0]` · `[Changed in v22.0: enabled by default by provideClientHydration()]` `` → ``**Incremental hydration** [Stable since v20.0] · [Changed in v22.0: enabled by default by `provideClientHydration()`]``; (4) `` `withNoIncrementalHydration()` `[Added in v22.0]` `` → `` `withNoIncrementalHydration()` [Added in v22.0] ``; (5) `` `[Deprecated since v22.0 — use the default of provideClientHydration()]` `` → ``[Deprecated since v22.0 — use the default of `provideClientHydration()`]``; (6) ``**`AngularAppEngine`** `[Stable since v20.0]` `` → ``**`AngularAppEngine`** [Stable since v20.0]``; (7) `` `[Changed in v22.0: an unknown host gets 400 instead of a client-rendered page]` `` → `[Changed in v22.0: an unknown host gets 400 instead of a client-rendered page]`; (8) `` `[Changed in v22.0: renamed from ssr.experimentalPlatform]` `` → ``[Changed in v22.0: renamed from `ssr.experimentalPlatform`]``; (9) `` `[Deprecated since v22.0 — use AngularNodeAppEngine or AngularAppEngine]` `` → ``[Deprecated since v22.0 — use `AngularNodeAppEngine` or `AngularAppEngine`]``.
  - 33: (10) `` `[Changed in v15.2.6: only javascript: URLs are blocked]` `` → ``[Changed in v15.2.6: only `javascript:` URLs are blocked]``; (11) `` `[Baseline: limited availability, per MDN]` `` → `[Baseline: limited availability, per MDN]`.
  - The trailing space shown after some old texts is only the closing of the inline code here, not part of the text. Swaps (3) and (4) each cover two markers, so the 9 swaps in 32 cover its 10 markers and the 2 in 33 cover its 2. Word counts are unchanged (no cap in Part D).

#### X-04-F03 · Low · header · 01's Leads to omits 34, which lists 01 as a prerequisite

- **Location:** `modules/01-js-values-types-coercion.md:5` "> **Leads to:** … [06. TypeScript type system](../../modules/06-ts-type-system-essentials.md), [08. Browser rendering and DOM](../../modules/08-browser-rendering-dom-events.md)"; `modules/34-i18n.md:4` "[01. Strings and Unicode](../../modules/01-js-values-types-coercion.md#3-strings-and-unicode)".
- **Evidence:** scan §5 "34 lists 01 as prerequisite, but 01 Leads to omits 34". 34's code-point, grapheme and `Intl` material builds on 01 §3, and module 01 owns `Intl.Segmenter` (STATE). The prerequisite is right, and the return edge is missing.
- **Right side:** 34; 01 adds the return link.
- **Fix text:** 01: `[06. TypeScript type system](06-ts-type-system-essentials.md), [08. Browser rendering and DOM](08-browser-rendering-dom-events.md)` → `[06. TypeScript type system](06-ts-type-system-essentials.md), [08. Browser rendering and DOM](08-browser-rendering-dom-events.md), [34. Internationalization](34-i18n.md)` (+2 words, measured; 01 is over the cap at 15,398, which is J1).

#### X-04-F04 · Low · header · 08's Leads to omits 35, which lists 08 as a prerequisite

- **Location:** `modules/08-browser-rendering-dom-events.md:5` "> **Leads to:** … [24. Routing](../../modules/24-routing.md), [31. Performance](../../modules/31-performance.md)"; `modules/35-animations.md:4` "[08. Layout, paint and composite](../../modules/08-browser-rendering-dom-events.md#2-layout-paint-and-composite-what-each-change-costs)".
- **Evidence:** scan §5 "35 lists 08 as prerequisite, but 08 Leads to omits 35". 35 §11's compositor-only rule rests on 08 §2.
- **Right side:** 35; 08 adds the return link.
- **Fix text:** 08: `[24. Routing](24-routing.md), [31. Performance](31-performance.md)` → `[24. Routing](24-routing.md), [31. Performance](31-performance.md), [35. Animations](35-animations.md)` (+2 words, measured: 9,925 → 9,927; with X-01-F03's −7, 08 ends at 9,920, under the cap).

#### X-04-F05 · Low · header · 12's Leads to omits 40, which lists 12 as a prerequisite

- **Location:** `modules/12-angular-how-it-works.md:5` "> **Leads to:** … [39. Version history and migrations](../../modules/39-version-history-and-migrations.md), [44. Delivery and operations](../../modules/44-fullstack-delivery-and-operations.md)"; `modules/40-framework-comparisons.md:4` "[12. What a framework does, and Angular's philosophy](../../modules/12-angular-how-it-works.md#1-what-a-framework-does-and-angulars-philosophy)".
- **Evidence:** scan §5 "40 lists 12 as prerequisite, but 12 Leads to omits 40". 40 §1 extends 12 §1's library-versus-framework question.
- **Right side:** 40; 12 adds the return link.
- **Fix text:** 12: `[39. Version history and migrations](39-version-history-and-migrations.md), [44. Delivery and operations](44-fullstack-delivery-and-operations.md)` → `[39. Version history and migrations](39-version-history-and-migrations.md), [40. Framework comparisons](40-framework-comparisons.md), [44. Delivery and operations](44-fullstack-delivery-and-operations.md)` (+3 words; Part D has no prose cap).

#### X-04-F06 · Low · header · 16's Leads to omits 37, which lists 16 as a prerequisite

- **Location:** `modules/16-dependency-injection.md:5` "> **Leads to:** [15. Standalone and NgModules](../../modules/15-standalone-and-ngmodules.md), [17. Signals](../../modules/17-signals.md), [24. Routing](../../modules/24-routing.md), [27. HTTP client](../../modules/27-http-client.md)"; `modules/37-elements-pwa-errors-ecosystem.md:4` "[16. Injection tokens and environment initializers](../../modules/16-dependency-injection.md#7-injectiontoken-multi-providers-environment-providers-and-initializers)".
- **Evidence:** scan §5 "37 lists 16 as prerequisite, but 16 Leads to omits 37". SYLLABUS §1 also lists 16 for 37, so the edge is in the plan.
- **Right side:** 37; 16 adds the return link.
- **Fix text:** 16: `[24. Routing](24-routing.md), [27. HTTP client](27-http-client.md)` → `[24. Routing](24-routing.md), [27. HTTP client](27-http-client.md), [37. Elements, PWA, errors and the ecosystem](37-elements-pwa-errors-ecosystem.md)` (+7 words). The same line takes REVIEW-X-03's 25 and 29 return links (see For Jorge 2).

#### X-04-F07 · Low · header · 17's Leads to omits 40, which lists 17 as a prerequisite

- **Location:** `modules/17-signals.md:5` "> **Leads to:** … [26. Signal forms](../../modules/26-signal-forms.md), [28. State management](../../modules/28-state-management.md)"; `modules/40-framework-comparisons.md:4` "[17. Under the hood: the reactive graph](../../modules/17-signals.md#9-under-the-hood-the-reactive-graph)".
- **Evidence:** scan §5 "40 lists 17 as prerequisite, but 17 Leads to omits 40". 40 §4 and §9 compare other signal systems with 17 §9's graph, and SYLLABUS §1 lists 17 for 40.
- **Right side:** 40; 17 adds the return link.
- **Fix text:** 17: `[26. Signal forms](26-signal-forms.md), [28. State management](28-state-management.md)` → `[26. Signal forms](26-signal-forms.md), [28. State management](28-state-management.md), [40. Framework comparisons](40-framework-comparisons.md)` (+3 words). The same line takes the return links for 14, 20 (REVIEW-X-02) and 27 (REVIEW-X-03) (see For Jorge 2).

#### X-04-F08 · Low · header · 18's Leads to omits 31 and 35, which list 18 as a prerequisite

- **Location:** `modules/18-control-flow-and-defer.md:5` "> **Leads to:** … [29. Testing Angular](../../modules/29-testing-angular.md), [32. SSR, SSG and hydration](../../modules/32-ssr-ssg-hydration.md), [39. Version history and migrations](../../modules/39-version-history-and-migrations.md)"; `modules/31-performance.md:4` "[18. `@defer` blocks](../../modules/18-control-flow-and-defer.md#5-defer-blocks-and-states-placeholder-loading-error-minimum-and-after)"; `modules/35-animations.md:4` "[18. `@for` and `track`](../../modules/18-control-flow-and-defer.md#2-for-track-context-variables-empty-and-what-angular-can-iterate)".
- **Evidence:** scan §5 "31 lists 18 as prerequisite, but 18 Leads to omits 31" and "35 lists 18 …". SYLLABUS §1 lists 18 for both.
- **Right side:** 31 and 35; 18 adds both return links.
- **Fix text:** 18: `[29. Testing Angular](29-testing-angular.md), [32. SSR, SSG and hydration](32-ssr-ssg-hydration.md), [39. Version history and migrations](39-version-history-and-migrations.md)` → `[29. Testing Angular](29-testing-angular.md), [31. Performance](31-performance.md), [32. SSR, SSG and hydration](32-ssr-ssg-hydration.md), [35. Animations](35-animations.md), [39. Version history and migrations](39-version-history-and-migrations.md)` (+4 words).

#### X-04-F09 · Low · header · 21's Leads to omits 40, which lists 21 as a prerequisite

- **Location:** `modules/21-change-detection.md:5` "> **Leads to:** … [32. SSR, SSG and hydration](../../modules/32-ssr-ssg-hydration.md), [39. Version history and migrations](../../modules/39-version-history-and-migrations.md)"; `modules/40-framework-comparisons.md:4` "[21. The synchronization problem: dirty checking and fine-grained reactivity](../../modules/21-change-detection.md#1-the-synchronization-problem-dirty-checking-and-fine-grained-reactivity)".
- **Evidence:** scan §5 "40 lists 21 as prerequisite, but 21 Leads to omits 40". SYLLABUS §1 lists 21 for 40.
- **Right side:** 40; 21 adds the return link.
- **Fix text:** 21: `[32. SSR, SSG and hydration](32-ssr-ssg-hydration.md), [39. Version history and migrations](39-version-history-and-migrations.md)` → `[32. SSR, SSG and hydration](32-ssr-ssg-hydration.md), [39. Version history and migrations](39-version-history-and-migrations.md), [40. Framework comparisons](40-framework-comparisons.md)` (+3 words).

#### X-04-F10 · Low · header · 24's Leads to omits 35, which lists 24 as a prerequisite

- **Location:** `modules/24-routing.md:5` "> **Leads to:** … [34. i18n](../../modules/34-i18n.md), [42. Full-stack authentication](../../modules/42-fullstack-authentication.md)"; `modules/35-animations.md:4` "[24. View transitions in the router](../../modules/24-routing.md#9-view-transitions-scroll-restoration-and-titles)".
- **Evidence:** scan §5 "35 lists 24 as prerequisite, but 24 Leads to omits 35". 35 §10 builds on 24 §9's `withViewTransitions`.
- **Right side:** 35; 24 adds the return link.
- **Fix text:** 24: `[34. i18n](34-i18n.md), [42. Full-stack authentication](42-fullstack-authentication.md)` → `[34. i18n](34-i18n.md), [35. Animations](35-animations.md), [42. Full-stack authentication](42-fullstack-authentication.md)` (+2 words).

#### X-04-F11 · Low · header · 27's Leads to omits 37, which lists 27 as a prerequisite

- **Location:** `modules/27-http-client.md:5` "> **Leads to:** … [33. Security](../../modules/33-security.md), [41. Full-stack API contracts](../../modules/41-fullstack-api-contracts.md), …"; `modules/37-elements-pwa-errors-ecosystem.md:4` "[27. HTTP errors and the error mapping layer](../../modules/27-http-client.md#5-errors-httperrorresponse-an-error-mapping-layer-and-retry-with-backoff-and-jitter)".
- **Evidence:** scan §5 "37 lists 27 as prerequisite, but 27 Leads to omits 37". SYLLABUS §1 lists 27 for 37, and 37 §10's error UX starts from 27 §5's mapping layer.
- **Right side:** 37; 27 adds the return link.
- **Fix text:** 27: `[33. Security](33-security.md), [41. Full-stack API contracts](41-fullstack-api-contracts.md)` → `[33. Security](33-security.md), [37. Elements, PWA, errors and the ecosystem](37-elements-pwa-errors-ecosystem.md), [41. Full-stack API contracts](41-fullstack-api-contracts.md)` (+7 words).

#### X-04-F12 · Low · header · 29's Leads to omits 36, which lists 29 as a prerequisite

- **Location:** `modules/29-testing-angular.md:5` "> **Leads to:** [30. End-to-end tests and testing strategy](../../modules/30-e2e-and-testing-strategy.md), [38. Architecture and production structure](../../modules/38-architecture-and-production-structure.md)"; `modules/36-material-and-cdk.md:4` "[29. Component harnesses](../../modules/29-testing-angular.md#11-component-harnesses-and-angular-testing-library)".
- **Evidence:** scan §5 "36 lists 29 as prerequisite, but 29 Leads to omits 36". 36 §10 extends 29 §11's harnesses to Material and the CDK.
- **Right side:** 36; 29 adds the return link.
- **Fix text:** 29: `[30. End-to-end tests and testing strategy](30-e2e-and-testing-strategy.md), [38. Architecture and production structure](38-architecture-and-production-structure.md)` → `[30. End-to-end tests and testing strategy](30-e2e-and-testing-strategy.md), [36. Material and CDK](36-material-and-cdk.md), [38. Architecture and production structure](38-architecture-and-production-structure.md)` (+4 words).

## Carry-over notes (STATE standing notes, STATE-ARCHIVE) about 31–40

- **39: control-flow and inject never claimed as an in-memory run (STATE, EX-M39-04 "check that §10-§12 and Q39.20-Q39.23 never claim…"):** retired. The two in-memory runs, 39:1545 and 39:1571, are the v22 change-detection and hydration migrations. 39:1844 says "Not covered: `control-flow` … and `inject`", and 39:1892 explains why (grep, run).
- **17's `effect` [Stable since v20.0] (STATE, SEC-M39-06):** belongs to module 17 (REVIEW-X-02). For 31–40 it is retired: no module in 31–40 states a stability version for `effect` (grep, run), and 39 §6 leaves it out as the note says.
- **31:586 "goes stale after 32" (STATE, PLAN-M32 For Jorge 4 / CLOSE-M32):** retired. 31:586 now reads "which `[32 §1](…)` observes (`Section 1: a priority image adds a preload link to the server HTML`)" (sed, run). Whether to approve FIX-M32-04's sentences in 20 and 31 stays Jorge's.
- **33: the 22.2.1 CHANGELOG says "block dangerous data: and vbscript: URLs" but the shipped pattern blocks only `javascript:` (STATE, PLAN-M33 For Jorge 2):** re-checked. The CHANGELOG line is still there (curl, run). The 22.2.1 `SAFE_URL_PATTERN` is `/^(?!javascript:)…/i` (read). The npm dist-tags are still 22.2.3 / 22.3.0-next.2 (run), so 33:264 stands. Whether to report this upstream stays Jorge's: it is a docs-versus-code report, not a FIX.
- **"Module 34 must not ask a second Segmenter question" (STATE, ARCHIVE 21):** already retired by REVIEW-X-01.
- **12:127 "one project" stale (REVIEW-M32 For Jorge 3):** this is module 12's, so it goes to REVIEW-X-02.
- **32: §2 `outputMode` marker and "state script" before §8 (CLOSE-M32 for REVIEW-M32):** settled by REVIEW-M32 (C4 row: "none needed"; T-2). Neither carries a FIX keyword.
- **VERSIONS rows** (Lighthouse 13.5.0, web-vitals 6.2.3, CDK scrolling, `NgOptimizedImage` for 31; event replay, platform-server, Express 5.2.1, `CommonEngine` and friends for 32; `autoCsp`, `CSP_NONCE`, Trusted Types, npm 11.19.0 for 33; `@angular/localize`, ICU/CLDR, `withI18nSupport`, `getLocale*` for 34), **anchor candidates** (into 32 and from 33/34, ARCHIVE 65's planned links to 36), the docs mismatches in 34 (`few` row, ICU `parseInt`) and the e2e timing note for 31/33/35 all stay with Jorge (J9).

## Judged acceptable

Scan items, 55 in all:

- **§1 markers, 2 of 4:** 36:508 `'url-change'` [Added in v22.2.1] and 36:625 `DragDrop` [Deprecated since v21.0.6 — use `createDragRef` and `createDropListRef`]. Both are right. The components CHANGELOG has the `url-change` opt-in under 22.2.1 and #32604 under 21.0.6, and #32604's diff adds the `@deprecated` tag (curl and GitHub API, run). The 22.2.1 typings carry `'url-change'` and the deprecation (read). They are not §3.2 forms only because the version has three parts. `v22.2` and `v21.0` would be false, since 22.2.0 and 21.0.0–21.0.5 lacked the change. Keep them if J4 takes in patch versions (For Jorge 1). The other 2 §1 items are F01 (36:145) and F02 (33:266, whose 15.2.6 is confirmed by the Angular CHANGELOG; only its code span is fixed).
- **§4, 37 of 37 terms:**
  - Homonyms, each true in its own field: `cache key` 38 (a CI cache) / 45 (an HTTP answer); `checkpoint` 39 / 45 / 47; `exact match` 34 (ICU `=n`) / 44 (nginx `location =`); `fill mode` 31 (`NgOptimizedImage`) / 35 (CSS animation); `hop` 39 (one `ng update` major) / 44 (network); `mdc` 39 (`material-components-web`) / 44 (logging context); `scope` 38 (Nx ownership) / 42 (OAuth); `snapshot` 35 (view transition) / 43 (state before deltas); `subpath` 34 (`i18n` `subPath`) / 38 (`exports` subpath); `trace table` 40 (runtimes in columns) / 41 / 42 (hops).
  - Compatible restatements: `access token`; `ambient credential` (42 adds the cross-site consequence); `angular package format` (39 points to 38 as owner); `authentication` and `authorization` (33's `401`/`403` fit 42's order); `backend-for-frontend (bff)` (44's "holds the session" fits 33/42's session cookie); `barrel file`; `csr`, `ssr`, `ssg` (31 and 32 say the same; "nearly empty shell" and "empty app root" agree); `design system`; `developer preview` (37 quotes the policy that 39 paraphrases); `field data`; `instant`; `iso 8601` (34's "a simplification of it" is ECMA-262's own wording for the date time string format); `loading plan`; `npm ci`; `origin check` (33 for state-changing requests, 43 for the WebSocket handshake; same mechanism); `performance budget` (31 defines the build-enforced size budget and 45 the design-step budget in bytes, requests or time; 45 links 31 §6, and a size budget is one kind of 45's); `presentational component`; `push service`; `reverse proxy` (39's routing-by-path is one use of 44's definition); `semantic versioning`; `session cookie`; `shared cache`; `transitive dependency`; `trust boundary`.
- **§5, 16 of 27:**
  - 6 "extra against SYLLABUS" lines (31: 08; 34: 10, 01; 35: 08, 13, 24; 36: 10, 29; 39: 12; 40: 12). Each is a section-level link to an earlier module that the section depends on, and SYLLABUS §1 lists only the module-level minimum. For each, the upstream Leads to has the reverse edge (08→31, 10→34/35/36, 13→35, 12→39, read), or a finding adds it (01→34 F03, 08→35 F04, 24→35 F10, 29→36 F12, 12→40 F05).
  - 10 Applies to lines (31–40): Angular, CLI, `@angular/*`, CDK and Material 22.2.1, TypeScript 6.0, Node 24, Playwright 1.63.0, npm 11.19.0, Transloco 8.4.0 and ngx-translate 18.0.0 match VERSIONS.md. 35's "`@angular/animations` … (deprecated…)" matches the VERSIONS row "Deprecated since 20.2". Versions without a VERSIONS row (Lighthouse, web-vitals, source-map-explorer, Express 5.2.1, Sass 1.104, `@angular/aria`, Prettier 3.9.9, ng-packagr, `@angular-devkit/schematics`, AngularJS 1.8.3 and the framework packages in 40) are J9 rows. 38's "Nx 23.3, angular-eslint 22.6" differ from VERSIONS (`nx` 23.2.1, `@angular-eslint/eslint-plugin` 22.5.0), but 38 says so itself at 38:144 ("VERSIONS.md lists 22.5.0") and 38:499 ("VERSIONS.md lists `nx` 23.2.1"), and the versions it read are later registry reads. That is a VERSIONS row for Jorge (For Jorge 3), not a contradiction.
  - The other 11 §5 lines are F03–F12.

Not scan items, checked and acceptable:
- **Summaries of 31–40 against the owners:** 31 "In v22 OnPush is the default" = VERSIONS and 39 §6. 36 "Angular Aria … stable since v22.0" = 36:1083 (CHANGELOG #33232) and 46:207 `[Stable since v22.0]`, and no module marks it as a preview. 36 "Material's CDK peer is exact" = `@angular/material` peer `"@angular/cdk": "22.2.1"` (read). 34 "`Directionality` reads `dir` once" agrees with 36:149, which defers to 34 §11. 39 "a deprecated API stays through at least the next major" = 12:57 ("in at least the next major release"). 39's "12 months active and 12 in LTS" = VERSIONS' v22 support dates. 33 "the shipped 22.2.1 refuses only `javascript:` URLs" = the 22.2.1 `SAFE_URL_PATTERN` (read). 35 "`MAX_ANIMATION_TIMEOUT` (4000 ms by default)" = `MAX_ANIMATION_TIMEOUT_DEFAULT = 4000` (read). 40 "an Angular signal notifies on a new reference" = 17's `Object.is` default. No Summary contradicts an owner.
- **Short on time links** in the headers of 31–40: every `#qNN-MM` target exists (run).

## For Jorge

1. **J4 scope, patch-level markers.** Four markers in this chunk use `vX.Y.Z`: 33:266 (15.2.6), 36:145 (22.0.4, after F01), 36:508 (22.2.1) and 36:625 (21.0.6). All four are right against the CHANGELOGs. Rewriting them as `vX.Y` would date each change to a release that did not have it. If J4 amends §3.2, the amendment and the scan regexes could take an optional patch part (`v\d+\.\d+(\.\d+)?`) for changes that shipped in a patch release. If J4 is ruled the other way, these four need a ruling of their own, because no canonical form can state them truthfully.
2. **REVIEW-X-06 merge on shared header lines.** The Leads to lines of 16 (F06) and 17 (F07) also take return links from REVIEW-X-02/X-03 (scan §5: "25 lists 16", "29 lists 16"; "14 lists 17", "20 lists 17", "27 lists 17"). Each fix text here is verbatim against the current line, so whichever lands second needs its anchor re-quoted. The simplest route is one FIX-X edit per file that writes the whole line in numeric order. F03 (01) and F04 (08) edit X-01-chunk files, on line 5 only. X-01-F03 edits 08 at 115/281/404/421, so the two do not overlap.
3. **VERSIONS rows (J9):** `nx` 23.3.0 and `@angular-eslint/eslint-plugin` 22.6.0 (read by 38 later than the snapshot) against VERSIONS 23.2.1 and 22.5.0; Storybook 10.6.2 (38:32) against 10.6.1; no rows for Prettier 3.9.9, Express 5.2.1, Lighthouse 13.5.0, web-vitals 6.2.3 or `@angular/aria` 22.2.1.
4. **Upstream report (33):** the 22.2.1 CHANGELOG still claims `data:`/`vbscript:` blocking that the shipped pattern lacks. As of 2026-10-24 there is no newer release than the ones 33 already read.
5. **SYLLABUS §1:** six modules in this chunk link section-level prerequisites beyond the SYLLABUS column (judged acceptable). Update the column only if you want it to mirror the headers.
