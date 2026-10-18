# REVIEW-M37: `modules/37-elements-pwa-errors-ecosystem.md`

- **Reviewer:** a fresh reviewer subagent (claude-opus-5-5) of session S20261017-1635-claudecode. It read and judged the module and ran only read-only scripts; the re-runs belong to the main session, which owns all execution. Module 37 was planned by PLAN-M37 (S20261017-1049) and written by HOUSE-37, HOUSE-38, SEC-M37-01..13, EX-M37-01 (S20261017-1049), EX-M37-02..04, QB-M37-01..05 and CLOSE-M37 (S20261017-1423). This reviewer wrote nothing in module 37 and continues none of those conversations, so it is eligible (RUN.md §4).
- **Date:** 2026-10-17.
- **Files read:**
  - the whole module (2,104 lines; line numbers below are as of this review and will move at FIX time);
  - `_meta/modules/M37.md` (whole: Handoffs, Lab decision, F1-F22, C1-C15, owner map, breadth gate, sections, bank table, Output answers, Exercises, closing, For Jorge 1-4), QUALITY-BAR, STYLE-GUIDE §3 and §6, RUN.md §4-§7 and §10, the TASKS entries REVIEW-M36, FIX-M36-01/02, the module-37 common rules, HOUSE-38, every SEC/EX/QB-M37 entry, CLOSE-M37 and REVIEW-M37, LOG 1536-1565 (PLAN-M37, HOUSE-37, HOUSE-38, every SEC/EX/QB/CLOSE-M37 line), `SOURCES.md` `## Module 37`, SYLLABUS §4 (37), REVIEW-M36 (the format model);
  - module-37 lab files: the titles of all 32 spec and test files by script (92 distinct titles); every e2e `newContext`/`swContext` call; a grep for `waitForTimeout`, `setTimeout`, `Date.now`, `performance.now`, `toBeLessThan`/`toBeGreaterThan` on times and non-localhost URLs across the three lab folders and `projects/elements-lab/src`; every `customElements.define` tag; `support/sw.ts`; `concepts/section-1-host.spec.ts`, `section-5-caching.spec.ts`, both `q37-outputs` specs (Q37.02, .03, .06, .11, .12, .17, .19), the Exercise 37.3 Retry test; `elements-host/section-1.html`, `projects/elements-lab/src/elements/define.ts`, `src/app/error-log.ts`, `src/app/m37/offline/offline.ts`; `dist/elements-lab-widgets/browser/` (file list and the `"22.2.1"` string in `main.js`, read only).
- **Packages read (22.2.1, `labs/angular/node_modules`):**
  - `@angular/elements`: `fesm2022/elements.mjs` (`camelToDashCase` 17, `extractProjectableNodes` 46, `DESTROY_DELAY` 80, `connect`/`disconnect` 119-140, `setInputValue` and `notify(6)` 156-160, `initializeComponent` 164-180 with the child `Injector.create` and `createComponent`, `runInZone` 203, `Object.hasOwn` 225, `subscribeToEvents` and `new CustomEvent(e.name, { detail })` 264-270, exports 295: `NgElement`, `VERSION`, `createCustomElement` only), `types/elements.d.ts`;
  - `@angular/service-worker`: `fesm2022/service-worker.mjs` (strategy parsing 335-358, `Promise.race` 344, 5600 347, 5604 358, `userVisibleOnly` 160), `types/service-worker.d.ts` (`activateUpdate` doc comment 461-485), `ngsw-worker.js` (`DriverReadyState` 1517-1518, the ten `addEventListener` calls 1577-1595, `versionFailed` 2025-2034, `setupUpdate` 2035-2057, `checkForUpdate` 2058-2080, `notifyClientsAboutVersionInstallationFailed` 2167-2176);
  - `@angular/core`: `fesm2022/_pending_tasks-chunk.mjs` (`ErrorBoundaryWrappedError` 708-715, `INTERNAL_APPLICATION_ERROR_HANDLER` 2716-2734, `errorHandlerEnvironmentInitializer` 2735-2746, `globalErrorListeners` 2747-2785, `provideBrowserGlobalErrorListeners` 2786), `types/*.d.ts` (`@developerPreview 22.2` only at `_debug_node-chunk.d.ts` 3166 `ErrorDetails`; `onViewError?` 3237 untagged; `ResourceImpl` and `encapsulateResourceError` exported only as `ɵ` names; the `onError` construction note 3684, 9432), the "Unhandled error in @boundary fell through." string;
  - `@angular/compiler`: `createBoundaryBlock` and its "Unconditional @error block must be the last @error block in the boundary chain" message;
  - `@angular/compiler-cli`: `bundles/chunk-FNLXTIAY.js` 5640-5670 (`RegistryDomSchemaChecker.checkElement`, source `packages/compiler-cli/src/ngtsc/typecheck/src/dom.js`: a tag unknown to `DomElementSchemaRegistry` is "not a known element" unless a schema allows it; no reference to `HTMLElementTagNameMap` anywhere in the compiler packages);
  - `@angular/common`: `types/http.d.ts` (`httpResource` `@publicApi 22.0`).
- **Basis of each finding:** a package source, a committed spec, the module text, SOURCES.md, or a read-only script (grep, sed, awk, python3 word counts, `node labs/tools/module-stats.mjs`, `check-snippets.mjs . 37`, `check-links.mjs --planned`). Nothing was built, run or installed. **Not re-read** (their basis is the SEC/EX/QB LOG lines and SOURCES.md): the angular.dev pages, the Angular CHANGELOG lines, MDN pages, the npm registry (every `npm view` fact in §12, §11, Q37.23 and the fixtures), npm and webpack docs, the Spring reference, the Sentry guide.
- **Probe files:** none in the repository. Scratch scripts and extracts lived in the job scratchpad (`/Users/jorge.quintero/.claude/jobs/4a727236/tmp`) and were deleted. The reviewer created only this file and edited `_meta/TASKS.md`.

Overall, a carefully run module with no Major finding: every Output value read matches its assertion, all 67 distinct cited test titles exist (66 in module 37's specs, one in module 27's), the 20 exercise criteria equal their test titles, every Playwright context sets `serviceWorkers`, custom element tags are unique per spec, no spec waits on time or reaches beyond `localhost`, and every internal the module names exists in 22.2.1 where it says. Findings:
- **no Major;**
- four Minor factual findings: a reader sentence that reports a failed first run, "51" (F-1), "each element has its own injector" against the lab's own shared injector (F-2), a typed wrapper presented as something the template compiler accepts (F-3), and no Baseline marker at all although the plan (C5) and STYLE-GUIDE §3.2 ask for them (F-4);
- five Minor teaching findings: undefined terms (T-1), internal names not marked internal (T-2), two exercises with one interviewer follow-up each (T-3), no section links to any exercise (T-4), and a best practice the lab abandoned (T-5);
- seven nits and the anchor handoffs (28 rows).

**Plan facts found wrong** (the module already corrects each): C5 (only `ErrorDetails` carries `@developerPreview 22.2`; `onViewError` and `onError` carry no tag), C8 (`ComponentNgElementStrategyFactory` is not exported in 22.2.1), F20 (`@ngneat/until-destroy` "last publish 2024-08" is `time.modified`; 10.0.0 was published 2023-08-03; `@taiga-ui/core` peer `>=19.0.0`; `@ngx-formly/core` peers `@angular/forms`, not core), F18 (`Navigator.onLine` has no Baseline field), §11's "HTTP integration" for `@sentry/angular` (the guide names `ErrorHandler` and `TraceService` only), §12's "70 KB" problem (no basis, dropped), §3's runtime-copy and `setInput` history claims (no basis, dropped), the devops page's "first line indicates the driver state" (22.2.1 starts with `NGSW Debug Info:`), and the Q37.11 title (now "what does the page show for each?", because parallel runs share the server counters).

**Prose:** 19,893 words now (`node labs/tools/module-stats.mjs`; equal to CLOSE-M37's LOG count). The fixes add about +290, for about 20,180: under the REVIEW ceiling of 20,600.

## Re-runs (main session)

Filled by the main session S20261017-1635-claudecode, serially, while the reviewer read (Node 24.21.0; e2e under `caffeinate -dimsu`):
- angular `tsc -p tsconfig.spec.json --noEmit`: exit 0.
- `ng test --watch=false --include 'src/app/modules/37-elements-pwa-errors-ecosystem/**/*.spec.ts'`: 16 files, 53/53 passed.
- `ng build elements-lab`, `-c v2`, `-c elements`: exit 0 each.
- e2e `tsc --noEmit -p .`: exit 0.
- e2e `npm test -- tests/37-elements-pwa-errors-ecosystem --repeat-each=5`: 215 passed, 0 flaky, 0 failed (35.9 s).
- `check-links.mjs --planned`: all links resolve (300 to planned files); `check-snippets.mjs . 37`: all snippets check out; `module-stats.mjs`: 37 at 19,893 words, no flags.
- No listener left on ports 4300-4900.

## Reviewer's read-only script results (2026-10-17)

- **module-stats:** `37-elements-pwa-errors-ecosystem` 25 Q, 4 Ex, 19,893 words, Concept 7, Output 7, Bug hunt 3, Difference 3, Design 3, Trade-off 2, no flag. `check-snippets . 37` "All snippets check out"; `check-links --planned` "All links resolve" (300 planned).
- **Cited test titles:** 67 distinct, 0 missing; 66 from the 92 distinct titles of the 32 module-37 spec and test files, and `Section 5: a rejected fetch has status 0 and the thrown error` from `labs/angular/src/app/modules/27-http-client/concepts/section-5-errors.spec.ts` (N-7).
- **Exercise criteria:** 20 of 20 equal test titles (backticks aside). Exercise 37.1's two extra tests (seven range cases, the two variants agreeing) are named in its text.
- **Contexts, time and network (C10, C11, C15, Lab decision 5):** 36 context creations: 18 `swContext` (`serviceWorkers: 'allow'`) and 18 `newContext({ serviceWorkers: 'block' })`; no spec uses the default `page` or `request` fixture; `hits()` is never called. No `waitForTimeout`, `performance.now` or elapsed-time assertion; no URL outside `localhost` in any module-37 lab file. Unit tests use fake timers (Q37.06, §3, §11, Exercise 37.3).
- **Tags:** 21 `customElements.define` names, each unique (`m37-s1-*`, `m37-s2-*`, `m37-s3-*`, `m37-s13-*`, `m37-q02-*`, `m37-q03-*`, `m37-q06-*`, `m37-smoke`; `m37-hello`, `m37-rating`, `m37-shadow-note`, `m37-ex2-rating-a/b` in `elements-lab`).
- **Markup:** B1: 13 of each of the six subsections; 13 `mermaid` fences and 13 "What to notice" lines; E1: 4 of each bold label; `<details>` 43 open and 43 closed; markers/placeholders/`relink:` 0; `Unverified` 0; every best-practice bullet has "because" and every misconception a "myth exists because" clause (script).
- **Answer anatomy:** each D1 count is 25; every answer has at least two answered follow-ups. Answer words (prose outside fences): chunk averages 201.8, 225.4, 228.4, 221.0, 221.4; maximum 260 (Q37.07, Q37.11). Exercise follow-ups: 2, 1, 1, 2 (T-3).
- **Status markers:** Added 5 (`provideServiceWorker` v16.0, `type`/`updateViaCache` v20.2, `applicationMaxAge`/`refreshAhead` v19.0 twice, `notificationCloses`/`pushSubscriptionChanges` v20.1), Stable 2 (`provideBrowserGlobalErrorListeners` v20.0), Developer preview 3 (`@boundary`, `ErrorDetails`), Baseline 0 (F-4).
- **Callouts:** Framework vs platform at 74 (no `[!NOTE]`, N-2), 315, 638; Coming from the backend at 641 (with "Where the analogy breaks").
- **Links:** every Q37 ID is linked from the body; no section links `#ex37-1` or `#ex37-2`, and `#ex37-3`/`#ex37-4` are linked only from Q37.18, Q37.14 and Exercise 37.4 (T-4); ten file-level links into written modules (N-1); no anchored link into 37 exists yet.
- **SOURCES:** every URL in the module has a line under `## Module 37`; package, registry and lab-file lines present.
- **LOG:** the HOUSE-37/38 result is named in 20 of the 26 module-37 task lines; SEC-M37-09, -11, -12, -13, EX-M37-01 and CLOSE-M37 do not name it (SEC-09, -11, -13 and CLOSE ran the three `elements-lab` builds; SEC-12 and EX-01 touched `labs/ts-js` only). For Jorge 2.

## QUALITY-BAR

45 items: **40 Pass, 5 Partial (B9, C1, C4, E1, F1), 0 Fail.** H1 and H3 rest on the main session's re-runs.

| ID | Result | Evidence |
|---|---|---|
| A1 | Pass | Lines 3-9 in §4.1 order; Labs line has the four folders and the run commands. |
| A2 | Pass | 16 §7, 27 §5, 09 §9 anchored. |
| A3 | Pass | §1, §4, §6, §9; Q37.01, .09, .12, .16, .19, .24; Summary. |
| A4 | Pass | Contents links 13 sections and the five closing sections. |
| A5 | Pass | Elements → service worker → errors → ecosystem → internals (§13 last). |
| B1 | Pass | 13 of each subsection (script). |
| B2 | Pass | Each problem opens with a concrete failure. |
| B3 | Pass | 13 diagrams, each with "What to notice". |
| B4 | Pass | Each section answers a why from a 22.2.1 source read or a run. |
| B5 | Pass | Each Code subsection has numbered steps. |
| B6 | Pass | Every practice has "because" (script); T-5 replaces one whose basis the lab dropped. |
| B7 | Pass | Every bullet has a cause clause (script); F-2 corrects one correction. |
| B8 | Pass | Three Framework vs platform callouts (§1, §4, §8), the backend callout in §8; §1's lacks `[!NOTE]` (N-2). |
| B9 | Partial | "strategy" (§1), fake timers and `whenStable` (§3), jsdom (verification paragraph), `httpResource` (§10) used undefined (T-1). |
| B10 | Pass | Owned topics (04, 05, 08, 09, 12, 16, 17, 18, 19, 21, 24, 27, 28, 33, 36) each get one sentence and a link. |
| C1 | Partial | 29 of 33 sampled claims match; F-1, F-2, F-3, T-5 are mismatches. |
| C2 | Pass | All seven Output values equal their assertions (read); main's run confirms. |
| C3 | Pass | Every "in the lab" sentence names a test; 67/67 titles exist. F-1 is the one sentence reporting an unasserted run. |
| C4 | Partial | No Baseline marker anywhere (F-4); every Angular marker in the §3.2 form and at first body mention. |
| C5 | Pass | Every API checked exists in 22.2.1 (claims list). |
| C6 | Pass | No `Unverified`; no unsourced size, speed or quality claim (§12 "a map, not a ranking"; Q37.07 "No sizes are claimed"; Q37.23 "ranks none"). |
| C7 | Pass | `check-snippets . 37` 0. |
| C8 | Pass | Every URL in SOURCES.md; F-3 adds one package read. |
| D1 | Pass | 25 of each part. |
| D2 | Pass | Each Output short answer gives values and a reason; N-5 tightens Q37.17's. |
| D3 | Pass | Concept 7, Output 7, Bug hunt 3, Difference 3, Design 3, Trade-off 2; max 28%. |
| D4 | Pass | Q37.01-25 follow the section order. |
| D5 | Pass | M37.md's "not asked here" list holds. |
| D6 | Pass | All 25 IDs linked from the body. |
| D7 | Pass | `<a id="q37-NN">` above each question. |
| D8 | Pass | 25 Q, 4 Ex (ceiling and floor). |
| E1 | Partial | Full anatomy in all four, but Exercises 37.2 and 37.3 have one interviewer follow-up each (T-3). |
| E2 | Pass | 20/20 criteria are titles; each account names its tests; alternatives run the same titles (read). |
| E3 | Pass | Registry data → one element → a dashboard's errors → updates, errors and offline in one shell. |
| E4 | Pass | Solutions in labs; main's runs green. |
| E5 | Pass | Seven Output questions. |
| F1 | Partial | Summary restates all 13 sections with links; "each element has its own injector" overstates §3 (F-2). |
| F2 | Pass | Four prompts naming listeners. |
| F3 | Pass | Six flashcards. |
| F4 | Pass | Builds on, Read next, Uses these ideas later, Comparisons, each with a reason. |
| G1 | Pass | 19,893 ≤ 19,900; about 20,180 after the FIX tasks ≤ 20,600. |
| G2 | Pass | The five SYLLABUS §4 (37) checkboxes map as M37.md's breadth table says. |
| H1 | Pass (main) | Main's re-runs. |
| H2 | Pass | `check-links --planned` 0 (reviewer and main). |
| H3 | Pass (main) | `dist` ignored; main checks `git status` after its runs. |

## Module-specific checks

| Check | Result | Evidence |
|---|---|---|
| HOUSE-37/38 results in every LOG line | Partial (process) | 20/26 lines; six do not name it (script). LOG is append-only: For Jorge 2, no FIX. |
| Attribute values, event fields, `versionUpdates` sequence, `appData`, counters, handler calls, boundary renderings (F2-F17, seven Output answers) vs specs | Pass (read) | Q37.02 (`5:string`, `7:number`, `3:string` / all numbers), Q37.03 (`ratingChanged 4 false false`, no parent), Q37.06 (`['constructor']`, then `['constructor','ngOnDestroy']`), Q37.11 (same hit numbers offline, `uncached failed`), Q37.12 (`VERSION_DETECTED v2`, `VERSION_READY v1 -> v2`, `check true`, A v1 / B v2 / A v2), Q37.17 (`Error: q17 click boom`, `Error: q17 timeout boom`, `string: q17 rejection reason`; jsdom `click boom`, `template boom`), Q37.19 (texts, one `onViewError`, `handleError` empty), §1, §5, §13 values equal their assertions; main's ×5 run green. |
| No duration asserted, no throwaway observation (C11) | Pass, one finding | Specs clean; §2's "gave "51"" reports a failed first run no committed test shows (F-1). |
| No unsourced quality, size or speed claim; registry facts dated (C6, F20) | Pass | §12 table, Q37.23, §11 and the fixtures carry `npm view` dates. |
| `serviceWorkers` in every context; unique tags per spec (Lab decision 5) | Pass | 36/36 contexts; 21 unique tags. |
| No network request in any test (C15) | Pass | No URL outside `localhost`; smoke test checks requests. |
| Chromium-only claims labelled (C14) | Pass | Verification paragraph, §7 ("Chromium-only test harness"), §10, Q37.11, Q37.15, Q37.17, Exercise 37.4. |
| jsdom vs Chromium apart (F19, C9) | Pass | §1, §4, §7, Q37.17 keep the two runs separate. |
| `@boundary` scope as the run shows (F16, C12) | Pass | §9: creation and change-detection errors only; the listener test; docs' projected-content and `@error`-throw claims labelled "read, not run". |
| Status markers (C5) | Partial | F-4. `[Changed in v21.0]` and `[Changed in v19.0]` are not due: the module teaches neither the signal-input getter nor the `setInput` history (judged acceptable; For Jorge 1). |
| Handoffs into 37 honored; anchor proposal per file-level link | Done | Every handoff line's topic is taught where M37.md says; Handoffs table below (28 rows). |
| Prose at most 20,600 after fixes | Pass | About 20,180. |

## Handoffs

Module 37 slugs:
- S1 `#1-angular-elements-turning-a-component-into-a-custom-element`
- S2 `#2-the-elements-public-contract-attributes-properties-events-projected-content-and-typings`
- S3 `#3-elements-at-run-time-lifecycle-change-detection-without-zonejs-styles-and-several-apps-on-one-page`
- S4 `#4-angularservice-worker-registration-ngsw-configjson-and-the-generated-ngswjson`
- S5 `#5-caching-with-asset-and-data-groups-navigation-requests-and-the-app-shell`
- S7 `#7-push-notifications-and-installability-swpush-notification-clicks-and-the-manifest`
- S8 `#8-errorhandler-and-global-listeners-what-reaches-the-handler-and-what-does-not`
- S9 `#9-error-boundaries-boundary-error-reset-onviewerror-and-onerror`
- S10 `#10-error-ux-expected-and-unexpected-errors-http-failures-offline-state-and-route-errors`
- S12 `#12-the-production-ecosystem-and-how-to-evaluate-a-library`

Line numbers were read 2026-10-17; find each line by its context, not its number. Each listed line has exactly one `37-elements-pwa-errors-ecosystem.md)` link (script); only its target changes (`37-elements-pwa-errors-ecosystem.md` → `37-elements-pwa-errors-ecosystem.md#<slug>`); +0 words. The mapping follows CLOSE-M37's anchor candidates, adjusted where the line's context names another section (08:308 → S1, 09:596 → S7, 09:1132 → S5, 27:2579 → S8), plus 05:1227, 05:1680, 08:1159, 09:1606, 12:491, 12:1861, 14:781, 14:2206, 18:2611 that CLOSE did not list.

| File:line | Context | Anchor |
|---|---|---|
| 04:548 | "forwards them to Angular's `ErrorHandler` (per its doc comment …) ([37. Elements, PWA and errors]" | S8 |
| 04:1349 | "Angular's `ErrorHandler` covers errors inside the framework ([37. Errors]" | S8 |
| 05:401 | "Angular routes errors through its `ErrorHandler` ([module 37]" | S8 |
| 05:1227 | "Angular's `ErrorHandler` is covered in [module 37]" | S8 |
| 05:1680 | "[37. Elements, PWA and global error handling] (Angular's `ErrorHandler`)" | S8 |
| 08:308 | "Angular Elements, which wraps a component as a custom element, to [module 37]" | S1 |
| 08:1085 | "an Angular component exported with Angular Elements ([module 37]" | S1 |
| 08:1159 | "[37. Elements, PWA and errors] (Angular Elements as custom elements)" | S1 |
| 09:596 | "and push and sync live in [37]" | S7 |
| 09:1132 | "*Angular's version?* [37]" (Q09.22, caching strategies) | S5 |
| 09:1606 | "[37] (service workers)" | S4 |
| 12:491 | "creates no component, which suits Angular Elements ([module 37]" | S1 |
| 12:1163 | "the browser creates the component whenever the tag appears ([module 37]" | S1 |
| 12:1861 | "[37] (`createApplication`)" | S1 |
| 13:2514 | "[37] (`ViewEncapsulation…`" | S3 |
| 14:781 | "The `ErrorHandler` is the application's central error sink ([37]" | S8 |
| 14:2206 | "[37] (`ErrorHandler`)" | S8 |
| 15:187 | "`CUSTOM_ELEMENTS_SCHEMA`, which allows custom elements, is [module 37]'s" | S2 |
| 15:2256 | "[37] (`CUSTOM_ELEMENTS_SCHEMA` and Angular Elements)" | S2 |
| 18:489 | "`@boundary` [Developer preview since v22.2] is a separate block, owned by [37]" | S9 |
| 18:2611 | "[37] (`@boundary`)" | S9 |
| 20:2235 | "[37] (the lifecycle of Angular Elements)" | S3 |
| 27:2579 | "[37] (global error handling)" | S8 |
| 31:2013 | "[37] (service-worker caching)" | S5 |
| 32:2286 | "[37] (service worker, app shell)" | S5 |
| 33:2129 | "[37] (errors must not leak)" | S10 |
| 36:2314 | "[37. Elements, PWA, errors and the ecosystem] (how to evaluate UI kits)" | S12 |
| 36:2315 | "[37] (UI kits)" | S12 |

Stay file-level: the headers and Leads to lines (05:5, 09:5, 36:5); 21:2711 (a Uses-later list with no reason given).

## Factual findings

**F-1 · Minor (C11, C3) · §2 reports a failed first run as a fact (157).** "which is why Section 1's string `value` plus 1 gave "51"": no committed code adds 1 (`elements-host/section-1.html` writes `'rated ' + event.detail`; `section-1-host.spec.ts` asserts `rated 5`). The "51" came from SEC-M37-01's first, failed run (LOG). Q37.02's follow-up already teaches `"5" + 1`.
- Fix: "(`Section 2: an attribute arrives as a string unless the input has a transform`), which is why Section 1's string `value` plus 1 gave "51"." → "(`Section 2: an attribute arrives as a string unless the input has a transform`)." (−10)

**F-2 · Minor (C1, F1) · "each element has its own injector" (289, 1143).** `createCustomElement` uses `config.injector` (`elements.mjs`), and the lab's `define.ts` passes one `injector` from one `createApplication` to all five of its elements; only elements from different applications use different injectors, as §3 itself says at 244. (Each component also gets an empty child `Injector.create({ providers: [], parent })`, 165-168, which holds no providers.)
- §3 misconception: "- *"Two widgets share one Angular."* Each element comes from its own `createCustomElement` call with its own injector. The myth exists because both tags sit on one page." → "- *"Two separately built widgets share one Angular."* Each bundle calls its own `createApplication`, and its elements use that application's injector; only elements defined from one application share it, as the lab's `define.ts` does with one `injector`. The myth exists because both tags sit on one page." (+17)
- Summary: "Removal destroys the component 10 ms later, the element works without zone.js, and each element has its own injector" → "Removal destroys the component 10 ms later, the element works without zone.js, and elements from different applications use different injectors" (+2)

**F-3 · Minor (C1, C5) · Q37.05 presents a typed wrapper as something the template compiler accepts (1280, 1282).** `NgElement & WithProperties<P>` and `HTMLElementTagNameMap` type TypeScript code; Angular's template checker tests a tag against its own `DomElementSchemaRegistry` and reports "'…' is not a known element" unless a schema allows it (`@angular/compiler-cli@22.2.1`, `RegistryDomSchemaChecker.checkElement`, source `src/ngtsc/typecheck/src/dom.js`); no compiler package references `HTMLElementTagNameMap`.
- Fix 1 (short answer): "A typed wrapper accepts only what its declaration lists and gives up nothing, at the price of writing it." → "A typed wrapper lets TypeScript check the code that creates or reads the element and gives up nothing, but the template checker never reads it: a template that uses the tag still needs a schema." (+14)
- Fix 2 (full explanation): "A typed wrapper declares the element's properties, with `NgElement & WithProperties<P>` or an `HTMLElementTagNameMap` entry (`@angular/elements@22.2.1`, `types/elements.d.ts`; docs read 2026-10-17)." → "A typed wrapper declares the element's properties, with `NgElement & WithProperties<P>` or an `HTMLElementTagNameMap` entry (`@angular/elements@22.2.1`, `types/elements.d.ts`; docs read 2026-10-17), for code such as `document.createElement`. The template checker tests each tag against its own DOM schema and reports "is not a known element" when no schema allows it (`@angular/compiler-cli@22.2.1`, `RegistryDomSchemaChecker.checkElement` in `src/ngtsc/typecheck/src/dom.js`; read, not run)." (+33)
- SOURCES.md, under `## Module 37`: "- `@angular/compiler-cli@22.2.1`, `bundles/chunk-FNLXTIAY.js` (`packages/compiler-cli/src/ngtsc/typecheck/src/dom.js`, `RegistryDomSchemaChecker.checkElement`: unknown elements without a schema are \"not a known element\"), read 2026-10-17."

**F-4 · Minor (C4, M37.md C5, STYLE-GUIDE §3.2) · no Baseline marker in the module.** The plan asked for "Baseline markers from F18 in the STYLE-GUIDE form (re-read on MDN in the task)"; only SEC-M37-10 recorded a decision (no field on `Navigator.onLine`'s page). F18's reads (2026-10-17) give these first mentions, to be re-read on MDN and written as MDN shows (year = the newly-available year, status as of the read):
- §1 (42): "A **custom element** is a class the browser runs" → "A **custom element** [Baseline 2020: widely available, per MDN] is a class the browser runs", followed after that sentence's closing parenthesis by the module's one Baseline definition, in module 36's form: "(**Baseline**, [MDN's](https://developer.mozilla.org/en-US/docs/Glossary/Baseline/Compatibility) label: *newly available* is support in the latest Chrome, Edge, Firefox and Safari; *widely available*, 2.5 years of it.)" (+33)
- §2 (140): "A **`CustomEvent`** is the browser's event class" → "A **`CustomEvent`** [Baseline 2015: widely available, per MDN] is the browser's event class" (+6)
- §4 (299): "A **service worker** is a script the browser runs" → "A **service worker** [Baseline 2018: widely available, per MDN] is a script the browser runs" (+6)
- §7 (541): "(MDN, Push API, read 2026-10-17:" → "(MDN, Push API [Baseline 2023: widely available, per MDN], read 2026-10-17:" (+6)
- SOURCES.md: one line per MDN page re-read (custom elements, `CustomEvent`, Service Worker API or the Cache page F18 used, Push API) with the date and the Baseline status, plus the Baseline glossary URL.

## Teaching and completeness findings

**T-1 · Minor (B9) · five terms used before any definition.**
- §1 (66): "the class asks a strategy factory for a strategy built from `config.injector`" → "the class asks a strategy factory for a strategy (the object that creates, updates and destroys the component for the element, [§13](../../modules/37-elements-pwa-errors-ecosystem.md#13-under-the-hood-createcustomelements-strategy-and-the-service-workers-driver)) built from `config.injector`" (+14)
- §3 (236): "advances fake timers by 5" → "advances fake timers (a clock the test moves by hand, [29 §10](29-testing-angular.md#10-async-tests-vitest-fake-timers-versus-fakeasync-and-waitforasync)) by 5" (+8)
- §3 (238): "setting `value` on the element re-renders after `whenStable` (" → "setting `value` on the element re-renders after `whenStable` (the promise that resolves once the app has no pending work, [29 §5](29-testing-angular.md#5-zoneless-fixtures-whenstable-testbedtick-detectchanges-and-automatic-change-detection)) (" (+11)
- Verification paragraph (32): "`ng test` (jsdom, development mode) covers what jsdom can show" → "`ng test` (jsdom, a browser DOM emulated in Node, [29 §2](29-testing-angular.md#2-the-runner-vitest-through-angularbuildunit-test-jsdom-and-browser-mode); development mode) covers what jsdom can show" (+8)
- §10 (823): "an `httpResource` answered with a 500" → "an `httpResource` (a `resource` that loads through `HttpClient`, [27 §10](27-http-client.md#10-httpresource-signal-driven-requests-and-when-to-prefer-it-over-httpclient)) answered with a 500" (+8)

**T-2 · Minor (M37.md C8) · internal names without "internal".** Each name below is unexported or exported only as a `ɵ` name in 22.2.1 (reads above).
- §2 (155): "and `subscribeToEvents` runs" → "and the internal `subscribeToEvents` runs" (+2)
- §2 (159): "In the same file `initializeComponent` calls `extractProjectableNodes` once" → "In the same file the internal `initializeComponent` calls the internal `extractProjectableNodes` once" (+4)
- §3 (238): ". `runInZone` enters the zone only when `Zone` is defined (read, not run)." → ". The internal `runInZone` enters the zone only when `Zone` is defined (read, not run)." (+2)
- §5 (398): "the version's `handleFetch` tries the asset groups" → "the version's internal `handleFetch` tries the asset groups" (+1); "passes `isNavigationRequest` is answered" → "passes the internal `isNavigationRequest` is answered" (+2)
- §5 (402): "(`onFetch`, read)" → "(the driver's internal `onFetch`, read)" (+3)
- §10 (816): "(`encapsulateResourceError` keeps" → "(the internal `encapsulateResourceError` keeps" (+2)
- Q37.11 (1440): "`DataGroup.handleFetchWithFreshness`; read, not run" → "internal `DataGroup.handleFetchWithFreshness`; read, not run" (+1)
- Q37.14 (1520): "`Driver.handleFetch`, `mode === "navigate"`; read, not run" → "internal `Driver.handleFetch`, `mode === "navigate"`; read, not run" (+1)
- Q37.17 (1595): "`globalErrorListeners`; read, not run). The rejection" → "internal `globalErrorListeners`; read, not run). The rejection" (+1)
- Q37.18 (1631): "`errorHandlerEnvironmentInitializer`, `INTERNAL_APPLICATION_ERROR_HANDLER`; read, not run" → "internal `errorHandlerEnvironmentInitializer` and `INTERNAL_APPLICATION_ERROR_HANDLER`; read, not run" (+2)
- Q37.20 (1707): "throws `ResourceValueError` (`@angular/core@22.2.1`, `_resource-chunk.mjs`, `ResourceImpl`'s value computation" → "throws the internal `ResourceValueError` (`@angular/core@22.2.1`, `_resource-chunk.mjs`, the internal `ResourceImpl`'s value computation" (+4)

**T-3 · Minor (E1) · Exercises 37.2 and 37.3 have one interviewer follow-up each (QUALITY-BAR: 2-4).**
- Exercise 37.2: after "- *"Why does the move not lose the value?"* Disconnect only schedules the destroy and connect cancels it, so the same instance stays; the counter shows it." add the line "- *"Why does `maxStars` need a transform when the page writes `max-stars="4"`?"* The attribute reaches the input as the string `"4"`; `numberAttribute` converts it on every `setInput` (`Section 2: an attribute arrives as a string unless the input has a transform`)." (+33)
- Exercise 37.3: after "- *"Why not read `declarationType.name`?"* A name read from the class depends on how the build compiles and minifies it; a map keyed by the class reference gives `'chart'` in every build." add the line "- *"Why does fixing the data not bring the chart back?"* Variant a's boundary keeps its error until `$reset`, and variant b's slot keeps its fallback until Retry creates the widget again; the test `re-creates the widget when the user presses Retry after the data is fixed` asserts no chart after the fix alone, in both variants." (+46)

**T-4 · Minor (TASKS EX-M37-01..04 "restore section links", D6) · no section links an exercise.** `#ex37-1` and `#ex37-2` are linked nowhere; `#ex37-3` and `#ex37-4` only from answers and Exercise 37.4.
- §12: "Drilled in [Q37.23](../../modules/37-elements-pwa-errors-ecosystem.md#q37-23) and [Q37.24](../../modules/37-elements-pwa-errors-ecosystem.md#q37-24)." → "Drilled in [Q37.23](../../modules/37-elements-pwa-errors-ecosystem.md#q37-23) and [Q37.24](../../modules/37-elements-pwa-errors-ecosystem.md#q37-24); practised in [Exercise 37.1](../../modules/37-elements-pwa-errors-ecosystem.md#ex37-1)." (+4)
- §3: "Drilled in [Q37.06](../../modules/37-elements-pwa-errors-ecosystem.md#q37-06) and [Q37.08](../../modules/37-elements-pwa-errors-ecosystem.md#q37-08)." → "Drilled in [Q37.06](../../modules/37-elements-pwa-errors-ecosystem.md#q37-06) and [Q37.08](../../modules/37-elements-pwa-errors-ecosystem.md#q37-08); practised in [Exercise 37.2](../../modules/37-elements-pwa-errors-ecosystem.md#ex37-2)." (+4)
- §9: "Drilled in [Q37.19](../../modules/37-elements-pwa-errors-ecosystem.md#q37-19) and [Q37.20](../../modules/37-elements-pwa-errors-ecosystem.md#q37-20)." → "Drilled in [Q37.19](../../modules/37-elements-pwa-errors-ecosystem.md#q37-19) and [Q37.20](../../modules/37-elements-pwa-errors-ecosystem.md#q37-20); practised in [Exercise 37.3](../../modules/37-elements-pwa-errors-ecosystem.md#ex37-3)." (+4)
- §6: "Drilled in [Q37.12](../../modules/37-elements-pwa-errors-ecosystem.md#q37-12), [Q37.13](../../modules/37-elements-pwa-errors-ecosystem.md#q37-13) and [Q37.14](../../modules/37-elements-pwa-errors-ecosystem.md#q37-14)." → "Drilled in [Q37.12](../../modules/37-elements-pwa-errors-ecosystem.md#q37-12), [Q37.13](../../modules/37-elements-pwa-errors-ecosystem.md#q37-13) and [Q37.14](../../modules/37-elements-pwa-errors-ecosystem.md#q37-14); practised in [Exercise 37.4](../../modules/37-elements-pwa-errors-ecosystem.md#ex37-4)." (+4)

**T-5 · Minor (C3, B6) · a §5 best practice the lab abandoned (437).** "Read server counters with a separate client" has no test behind it: `hits()` is never called, and SEC-M37-05 replaced counter deltas with the hit number each answer carries because parallel runs raced on the shared counters (LOG); Q37.11 says the same.
- Fix: "- **Read server counters with a separate client**, because the page's own requests may be answered by the worker." → "- **In tests, compare the hit number each answer carries, not a shared server counter**, because a cached answer repeats its number while parallel runs move the shared counter (the `Section 5` tests do this)." (+14)

**Nits (folded into FIX-M37-01):**
- **N-1 (links into written modules carry anchors):** ten file-level links into written modules; only the target changes (+1 word each, the "§N"):
  - §4 (320): "production prints the code ([12](12-angular-how-it-works.md))" → "([12 §3](12-angular-how-it-works.md#3-building-the-application-builder-output-layout-and-budgets))" (12 §3 teaches `ngDevMode` false in optimized builds).
  - §10 (864, "because that text can name internals ([33](33-security.md))") and §10 (870, "It can leak internals ([33](33-security.md))") → `[33 §1](33-security.md#1-threat-model-of-an-angular-single-page-app-what-the-attacker-controls-what-runs-where-and-where-each-defense-lives)`.
  - §11 (952, "what you write there is yours to protect ([33](33-security.md))"), §11 (958, "is yours ([33](33-security.md))") and Q37.22 (1740, "Messages and URLs are yours to protect ([33](33-security.md))") → `[Q33.23](33-security.md#q33-23)` (what leaks from a token in a URL).
  - §12 table: "Material and the CDK ([36](36-material-and-cdk.md))" → `[36 §1](36-material-and-cdk.md#1-material-the-cdk-and-angular-aria-styled-components-behavior-primitives-and-headless-patterns)`; "Signal Forms ([26](26-signal-forms.md))" → `[26 §1](26-signal-forms.md#1-why-a-third-forms-api-model-first-signals-end-to-end)`; "`TestBed` ([29](29-testing-angular.md))" → `[29 §4](29-testing-angular.md#4-testbed-the-testing-module-inject-runininjectioncontext-overrides-and-teardown)`; "Playwright ([30](30-e2e-and-testing-strategy.md))" → `[30 §2](30-e2e-and-testing-strategy.md#2-playwright-and-cypress-architecture-ng-e2e-and-the-end-of-protractor)`.
- **N-2 (STYLE-GUIDE §6):** §1's callout lacks the alert line. Insert "> [!NOTE]" on its own line directly above "> **Framework vs platform.** Tags," (+0 prose).
- **N-3:** §5 (402): "which fails the worker's own fetches (test 4)." → "which fails the worker's own fetches (`Section 5: a request outside every data group fails offline`)." (+8)
- **N-4:** §10 (824): delete " (10 of 10 runs)" (a task's run count, not an assertion) (−4).
- **N-5 (D2):** Q37.17's short answer orders four errors no single run throws together. "records each error once, in the order thrown: the click error, the timer error, the rejection's reason (the string itself, not an `Error`) and the template error." → "records each error once, in the order thrown: in Chromium the click error, the timer error and the rejection's reason (the string itself, not an `Error`); under jsdom the click error, then the template error." (+5)
- **N-6:** §3 (240): "( `angular.dev/guide/elements`, read 2026-10-17)" → "(`angular.dev/guide/elements`, read 2026-10-17)" (+0).
- **N-7:** §10 (796) cites module 27's test as if it were §5 of this module. "status 0 ([27 §5](27-http-client.md#5-errors-httperrorresponse-an-error-mapping-layer-and-retry-with-backoff-and-jitter), `Section 5: a rejected fetch has status 0 and the thrown error`)" → "status 0 ([27 §5](27-http-client.md#5-errors-httperrorresponse-an-error-mapping-layer-and-retry-with-backoff-and-jitter), module 27's `Section 5: a rejected fetch has status 0 and the thrown error`)" (+2).

## Judged acceptable

- Chunk 3's answer average, 228.4 by the reviewer's counter (226 planned): QB-M37-03 measured 224.6; the excess is Q37.11's second follow-up, which QB-M37-05 added because one was missing.
- `[Changed in v21.0]` and `[Changed in v19.0]` absent: the module teaches neither the signal-input getter nor the `setInput` history (SEC-M37-03 dropped the latter for no basis), so no marker is due.
- `onViewError` and `onError` unmarked: no `@developerPreview` tag in the 22.2.1 typings (reviewer confirmed); §9 says so.
- "Separately built bundles each carry their own" runtime (§1, Q37.07): structural; the widgets build is one `main.js` that embeds core's `"22.2.1"` version string (reviewer read the build output).
- Run counts ("5 of 5") in Output answers name the committed spec's run; N-4 removes only §10's task-run count.
- The Q37.11 heading differs from M37.md's row (QB-M37-03 recorded why).
- The exercises intro names only Exercise 37.1's runner; each exercise names its runners in "How each criterion is met".
- §13's blanket "internal, like every unexported name below" covers that section's names.
- §12's licenses and peers and the fixture facts rest on the dated `npm view` reads in SOURCES.md (not re-read).
- One "Coming from the backend" callout (§8), as M37.md C3 plans.
- 33:2129 hands "errors must not leak" to 37 while 33 has no section on it: N-1 anchors 37's links to 33 §1 and Q33.23, the nearest material (For Jorge 4).

## Claims sampled (33)

| # | Claim (location) | Basis | Result |
|---|---|---|---|
| 1 | `observedAttributes` via `camelToDashCase` (§2) | `elements.mjs` 17, 38 | Match |
| 2 | `new CustomEvent(e.name, { detail })`, no `bubbles` (§2, Q37.03) | 264-270 | Match |
| 3 | `extractProjectableNodes` once at creation (§2, §13) | 46, 169 | Match |
| 4 | `DESTROY_DELAY = 10`, connect cancels (§3, Q37.06) | 80, 119-140 | Match |
| 5 | `setInputValue` → `notify(6)` when dirty (§3, Q37.08) | 156-160 | Match |
| 6 | Early property via `Object.hasOwn` (§1) | 225 | Match |
| 7 | `ComponentNgElementStrategyFactory` internal (§13) | exports 295 | Match |
| 8 | §2 "string `value` plus 1 gave "51"" | `section-1.html`, host spec asserts `rated 5` | **Not asserted (F-1)** |
| 9 | "each element has its own injector" (§3, Summary) | `define.ts` one `injector`; `config.injector` | **Mismatch (F-2)** |
| 10 | Typed wrapper as a compiler-accepted form (Q37.05) | `RegistryDomSchemaChecker.checkElement` | **Mismatch (F-3)** |
| 11 | Strategy parsing, `Promise.race`, 5600, 5604 (§4) | `service-worker.mjs` 335-358 | Match |
| 12 | `userVisibleOnly: true` (§7, Q37.15) | 160 | Match |
| 13 | `activateUpdate` doc comment quote (§6, Q37.13) | `service-worker.d.ts` 461-485 | Match |
| 14 | Ten worker listeners, no `sync` (§7) | `ngsw-worker.js` 1577-1595 | Match |
| 15 | Failed check → `EXISTING_CLIENTS_ONLY` (§6) | `checkForUpdate` 2058-2080 | Match |
| 16 | `versionFailed` degrades only for the latest (§13) | 2025-2034 | Match |
| 17 | `VERSION_INSTALLATION_FAILED` to all clients with `error` (§6, Ex 37.4) | 2167-2176 | Match |
| 18 | Internal handler: outside zone, lazy `injector.get`, `setTimeout` rethrow, no `try` (§8) | `_pending_tasks-chunk.mjs` 2716-2734 | Match |
| 19 | Listeners pass `e.reason`/`e.error`, wrap `e.message`, `preventDefault` (§8, Q37.17) | 2747-2785 | Match |
| 20 | Eager `ErrorHandler` injection at startup (Q37.18) | 2735-2746 | Match |
| 21 | `ErrorBoundaryWrappedError` for non-errors (§9) | 708-715 | Match |
| 22 | Only `ErrorDetails` tagged developer preview (§9) | `_debug_node-chunk.d.ts` 3166, 3237 | Match |
| 23 | "Unconditional @error block must be the last…" (§9) | `@angular/compiler` `createBoundaryBlock` | Match |
| 24 | "Unhandled error in @boundary fell through." (§9) | core fesm | Match |
| 25 | `onError` not for construction errors (§9, Ex 37.3) | `core.d.ts` 3684, 9432 | Match |
| 26 | `httpResource` stable (§10, no marker) | `http.d.ts` `@publicApi 22.0` | Match |
| 27 | Q37.02, Q37.03, Q37.06, Q37.19 values | `ng test` outputs spec | Match |
| 28 | Q37.11, Q37.12, Q37.17 values | e2e outputs spec | Match |
| 29 | §5 values (deep link, bypass fails offline, freshness grows, uncached fails) | `section-5-caching.spec.ts` | Match |
| 30 | §5 "Read server counters with a separate client" | no spec calls `hits()` | **Not run (T-5)** |
| 31 | §1 host page values (`Rating: 3`, `5`, `rated 5`) | `section-1-host.spec.ts` | Match |
| 32 | Exercise 37.3 Retry after fix (both variants) | `exercise-3-errors.spec.ts` 98-114 | Match |
| 33 | Offline banner in an always-present status region (§10) | `offline.ts` | Match |

## Proposed FIX tasks

The module is at 19,893 words; the CLOSE limit was 19,900 and the REVIEW ceiling is 20,600.

Table rows (for the Module 37 table in TASKS.md):

```
| FIX-M37-01 | M | todo | REVIEW-M37 | |
| FIX-M37-02 | S | todo | REVIEW-M37 | |
| FIX-M37-03 | S | todo | REVIEW-M37 | |
```

### FIX-M37-01 · M · §2 "51", injectors, Q37.05 wrapper, terms, internal names, exercise follow-ups and links, §5 practice, nits (F-1..F-3, T-1..T-5, N-1..N-7)
- Files: `modules/37-elements-pwa-errors-ecosystem.md`; `SOURCES.md` (one line, F-3); `_meta/LOG.md` (its own line only).
- Do: apply each fix text above; find each line by its quoted text. No heading or anchor change.
- Model: **Sonnet** (every text is prescribed).

### FIX-M37-02 · S · Baseline markers at first mention (F-4)
- Files: `modules/37-elements-pwa-errors-ecosystem.md`; `SOURCES.md`; `_meta/LOG.md`.
- Do: re-read the four MDN pages, write F-4's markers as MDN shows them and the one Baseline definition.
- Model: **Sonnet** (needs a web read of MDN).

### FIX-M37-03 · S · Anchors for the file-level links into 37 (+0 words)
- Files: link targets only in modules 04, 05, 08, 09, 12, 13, 14, 15, 18, 20, 27, 31, 32, 33, 36 (allowed through this FIX, RUN.md §10).
- Do: apply the Handoffs table (28 rows). Leave the stay-file-level lines alone.
- Model: **Sonnet** (mechanical; slugs listed).

## For Jorge

1. **VERSIONS.md rows carried from CLOSE-M37 (no FIX):** `@angular/elements` and `@angular/service-worker` 22.2.1; `@boundary` and `ErrorDetails` developer preview since 22.2 (`onViewError` and the `onError` options carry no tag in 22.2.1); `provideBrowserGlobalErrorListeners` stable since 20.0. The proposed "Elements signal-input getter changed in 21.0" row has no counterpart in the module (it does not teach the getter): keep or drop it as you prefer.
2. **Six LOG lines do not name the HOUSE-37/38 result** that the module-37 common rules ask for (SEC-M37-09, -11, -12, -13, EX-M37-01, CLOSE-M37). SEC-09, -11, -13 and CLOSE ran the three `elements-lab` builds; SEC-12 and EX-01 touched `labs/ts-js` only. LOG is append-only, so no FIX.
3. **Third-party names (M37.md For Jorge 3, still a heads-up):** §12 names 14 packages with dated registry facts, §11 and Q37.22 name `@sentry/angular`; nothing is installed or ranked. Veto any name you do not want.
4. **Module 33 hands "errors must not leak" to 37 (33:2129), while 37's five links to 33 point at a module with no section on it.** FIX-M37-01 (N-1) anchors them to 33 §1 (threat model) and Q33.23 (what leaks from a token in a URL), the nearest material; the alternative is one sentence in 33, or dropping those links.
5. **FIX-M37-02 needs a web read** of four MDN pages; the markers in F-4 come from the plan's 2026-10-17 reads and are re-checked there.
