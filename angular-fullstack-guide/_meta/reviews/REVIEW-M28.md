# REVIEW-M28: `modules/28-state-management.md`

- **Reviewer:** main session S20261013-0928-claudecode (Claude Code, local), model claude-opus-5-5, working alone (no subagents). The module was written by PLAN-M28 and SEC-M28-01..03 (S20261013-0115-claudecloud), SEC-M28-04..12, EX-M28-01..04 and QB-M28-01..07 (S20261013-0229-claudecloud), and HOUSE-15, EX-M28-05, FIX-M28-01 and CLOSE-M28 (S20261013-0732-claudecloud), per the `Done by` fields. This session wrote no module-28 task and continues none of those conversations, so it is eligible (RUN.md §4).
- **Date:** 2026-10-13
- **Files read:** `modules/28-state-management.md` (all 2,669 lines, end to end in chunks; line numbers below are from that read and move at FIX time); `_meta/RUN.md`; `_meta/QUALITY-BAR.md`; `_meta/TASKS.md` (REVIEW-M27, REVIEW-M28, FIX-M28-01, the module-28 rows); `_meta/reviews/REVIEW-M27.md` (format model); `_meta/modules/M28.md` (front matter, Lab decision, F1-F22, C1-C13, owners, breadth gate, question and exercise lists, closing, For Jorge); `_meta/LOG.md` (the module-28 lines, tail); `SOURCES.md` (Module 28 block, line 1581 to the end, by `grep`); `STYLE-GUIDE.md` §3.2 (marker forms); the lab folder `labs/angular/src/app/modules/28-state-management/` (all spec titles by script, the three Output assertions, file list); the installed `@ngrx/*` 22.0.1 (`store`, `effects`, `store-devtools`, `signals` incl. `-events` and `-rxjs-interop`, `operators`, `entity`, `router-store` typings), `@angular/core` 22.2.1 `_effect-chunk.mjs`, `@angular/common` 22.2.1 `_common_module-chunk.mjs`, `@angular/router` 22.2.1 `_router-chunk.mjs`, by `grep` and short reads; `npm pack` of `@ngrx/signals` 20.0.1 and 21.0.0 and `@ngxs/store` 22.0.0; every line linking `28-state-management.md` in modules 03-27; `### Q` headings of all modules (duplicate scan).
- **What was run** (Node 24.21.0, `export PATH=/opt/homebrew/opt/node@24/bin:$PATH`, one check at a time). Setup: the local `labs/angular/node_modules` had no `@ngrx` folder although `package.json` and the lockfile list the eight packages (HOUSE-15 ran in a cloud session), so `npm ci` restored `node_modules` from the committed lockfile (no `package.json` or lockfile change; `node_modules` is gitignored). Then, from `labs/angular`: `npx ng test --watch=false --include='src/app/modules/28-state-management/**/*.spec.ts'` (10 files, 58 tests, all passed); `npx tsc -p tsconfig.spec.json --noEmit` (exit 0); `npx ng build` (exit 0); a throwaway probe spec under `src/app/zz-review-probe/` (5 tests, all passed; deleted right after): `createActionGroup` and `createFeature` keys, a mutating reducer's error (reaches RxJS `config.onUnhandledError`, not the `dispatch` caller), the projector count of Q28.12 (2), the effects handler bound (11 runs, 10 handled over 14 dispatches), SignalStore not frozen and the Events plugin run of Q28.27 (`count()` 10, handler line `[Counter Page] set 10 count=10`). From the guide root: `node labs/tools/check-links.mjs --planned` ("All links resolve.", 435 planned links, exit 0); `node labs/tools/check-snippets.mjs . 28` ("All snippets check out."); `node labs/tools/module-stats.mjs` (row 28: 34 Q, 5 Ex, 22,438 prose words, Concept 16, Bug hunt 4, Difference 4, Design 4, Output 3, Trade-off 3, no flag); the QUALITY-BAR one-liners (D1 34 of each part; D3 as module-stats; G1 22,438); the Mermaid parser (mermaid 11.12.0 under jsdom 26.1.0 in the session scratchpad; a malformed negative control fails): 12 of 12 diagrams parse. Scripts (read-only): cited-test-name check, criteria against `it()` titles, follow-up count per answer, `<details>` balance and nesting, `[Q28.NN](#q28-NN)` coverage, export check of internal names, SOURCES keyword coverage.
- **Basis of each finding:** **run** (executed), **package source** (installed 22.0.1 / 22.2.1 or the `npm pack` tarballs), **docs** (CHANGELOG, docs pages as quoted by the module) or **read** (module, labs, LOG, SOURCES; nothing executed).
- **Probe files:** the probe spec (deleted before any other check ran after it), and in the session scratchpad the scan script, the Mermaid install and script, the `npm pack` tarballs and the test log; all deleted at the end (last line). No probe file remains in the labs.

Overall: a well-taught, well-sourced module whose NgRx half is not backed by the repository. Everything that runs in the repository holds: 58 tests pass, the three *Output* answers equal their assertions, the criteria of Exercises 28.1-28.5 equal their `it()` titles one to one, every marker traces to a typings tag, a CHANGELOG line or the `npm pack` diff, every sampled source read matches 22.0.1 / 22.2.1, the five harness claims I re-ran on the installed NgRx reproduce exactly, and no other module asks the same questions. The weak point is one Major: 45 cited test names for sections 4-9 and 12 (`Section 4: …` to `Section 12: …`) exist in no committed spec; they were throwaway-harness titles, several sentences cite them with no harness qualifier, and the module's own verification paragraph says an observed behavior "cites a spec in `labs/…`" (T-1). NgRx 22.0.1 has been in the labs since HOUSE-15, so these claims can now be committed specs (the plan's lab mode), which also restores the nine NgRx *Output* tags; that conversion is Jorge's decision (For Jorge 1). Besides it: six answers have one follow-up instead of two (F-1), the `async` pipe claim is overstated (F-2), and small text, marker and term slips. Net after the text tasks: about +200 words from 22,438, under the 23,370 ceiling.

---

## QUALITY-BAR

45 items: **38 Pass, 7 Partial (B1, B9, C1, C3, C7, D1, F4), 0 Fail.** C3 taken alone for sections 4-9 and 12 is a Fail (the Major T-1); for sections 1, 2, 3, 10, the outputs and the exercises it passes, so it is recorded once, as Partial.

| ID | Result | Evidence |
|---|---|---|
| A1 | Pass | Header lines 3-9 in STYLE-GUIDE §4.1 order; I ran the Labs command: 10 files, 58 tests passed. |
| A2 | Pass | Prerequisites (line 4) link 17 §2, 17 §6, 19 §2, 22 §4, 23 §2 and 27 §10 with anchors; all resolve (link check, run). |
| A3 | Pass | Short on time (line 8): four section links (§1, §2, §4, §8), six question IDs (Q28.01, 03, 08, 12, 21, 32), Exercise 28.1 and the Summary. |
| A4 | Pass | Contents (13-29) list the twelve sections and the five closing sections; `<details>` 55/55 balanced and no heading nested (script). |
| A5 | Pass | Kinds of state, hand-written stores, NgRx Store split into loop, selectors, effects and add-ons, SignalStore core then depth, patterns, alternatives, then internals (§12, deepest). |
| B1 | Partial | Script: each of the six subsection headings appears 12 times; `What to notice` 12; `#### Legacy` in §3 (311), §4 (483), §6 (671), §8 (860). §3 and §8 state a migration path; §4 and §6 do not (T-4). |
| B2 | Pass | Read: every problem opens with a failure (drifting prices and lost filters, the "no results" flash, the swallowed `push`, the untraceable cart total, the 5,000-row filter, the cancelled save, the 2,000-order map, the stale ComponentStore copy, the repeated `status`, the 600 ms toggle, the one-flag NgRx setup, the interviewer's three "why"s). |
| B3 | Pass | 12 diagrams of the planned types (flowchart ×8, sequenceDiagram ×2, classDiagram, stateDiagram-v2), each with a `What to notice` line; 12 of 12 parse (run). |
| B4 | Pass | Read and package source: each section names a file and function (`RoutedComponentInputBinder`, `COMPUTED_NODE.producerRecomputeValue`, `defaultCompare`, `createActiveRuntimeChecks`, `defaultMemoize`, `Store.selectSignal`, `defaultEffectsErrorHandler`, `createStateOperator`, `getInitialInnerStore`, `rxMethod`, `Dispatcher.dispatch`, `injectQuery`, the `State` constructor, `patchState`); sampled names found by `grep` (claims table). |
| B5 | Pass | Read: every `### Code` has an approach sentence and numbered steps. |
| B6 | Pass | Script: every best-practice bullet (45) carries "because". |
| B7 | Pass | Read: every Misconceptions bullet (48) has a correction and a cause; the "Once true" bullets (§8 SignalStore freeze 19.0.0/19.0.1, §9 Events `@experimental` 20.0.1/21.0.0, §12 one signal until 20.0.0) cite the CHANGELOG or the typings diff (confirmed by `npm pack`). |
| B8 | Pass | No callout is required (M28.md C3: STYLE-GUIDE §6 does not list state management; SYLLABUS §4 (28) names no comparison); none written. |
| B9 | Partial | Terms bold or glossed at first use, except "Flux" (§9 905, Q28.27 2053) (T-6). |
| B10 | Pass | Read: the 17/19/22/23/27 split holds (module-specific table). |
| C1 | Partial | 28 claims sampled (table below): 24 match; one overstated (F-2), one off by one (F-3), one incomplete (F-4), one unattributed default (T-3). |
| C2 | Pass | 3 *Output* questions (Q28.05, 07, 30), each with a test named after its ID in `outputs/q28-outputs.spec.ts`; values equal (cross-check below). The nine NgRx Output questions are tagged Concept, as the plan's harness mode requires. |
| C3 | Partial (Major) | Script: 67 distinct cited names; the 22 for sections 1, 2, 3, 10, the outputs and the exercises exist; **45 for sections 4-9 and 12 exist in no spec in the repository** (T-1). |
| C4 | Pass | Markers in STYLE-GUIDE §3.2 forms, NgRx markers carry "NgRx" (C8): `[Deprecated since NgRx v12.0 …]`, `[Removed in NgRx v22.0 …]`, `[Deprecated since NgRx v22.0]`, `[Added in NgRx v19.0]` ×2, `[Stable since NgRx v21.0]`, `[Changed in NgRx v21.0: renamed from withEffects]`, `[Deprecated since NgRx v21.1 …]`, `[Added in NgRx v20.0]`, `[Added in NgRx v19.1]`, `[Experimental since NgRx v22.0]`, the TanStack C5 marker; Angular `[Added in v16.0]`, `[Stable since v20.0]`. Versions verified (claims table). |
| C5 | Pass | `ng test`, `tsc`, `ng build` exit 0; every NgRx API in a snippet is in the 22.0.1 typings (sampled). |
| C6 | Pass | `grep`: 0 `Unverified`, `TASK:`, placeholder or relink markers. |
| C7 | Pass (check), Partial (marking) | `check-snippets.mjs . 28` exit 0. Four non-exported names unmarked (T-2). |
| C8 | Pass | SOURCES Module 28 (1581-end, 68 lines) has the exercise and outputs code-source lines, the `npm pack` reads (incl. `@ngrx/signals` 20.0.1/21.0.0, NGXS, TanStack, Elf), the CHANGELOG, the NgRx and TanStack docs pages quoted (incl. `does-this-replace-client-state.md`, `query-keys.md`, `important-defaults.md`) and the Angular and RxJS files read (script). |
| D1 | Partial | Script: 34 each of `### Q`, Short answer, Full explanation, Follow-ups, Trap to avoid; **six answers have one follow-up** (Q28.17, 18, 19, 20, 26, 28) (F-1). |
| D2 | Pass | Read: Q28.05, 07 and 30 give the result and the reason. |
| D3 | Pass | module-stats: Concept 16, Bug hunt 4, Difference 4, Design 4, Output 3, Trade-off 3 (largest 47%); the plan's harness-mode mix. |
| D4 | Pass | Titles follow the sections (Q28.01-03 §1 to Q28.33-34 §12). |
| D5 | Pass | `grep` of `### Q` headings across `modules/` for NgRx, store, reducer, selector, optimistic, undo, normalize, TanStack: only Q22.18 is near, and it is linked, not repeated. |
| D6 | Pass | Script: 54 `[Q28.NN](#q28-NN)` links; every Q28.NN linked outside its heading. |
| D7 | Pass | 34 `<a id="q28-NN">` lines, unique; link check passes. |
| D8 | Pass | 34 questions (ceiling 35; M28.md and PROGRESS record the reason), 5 exercises (ceiling 5). |
| E1 | Pass (labels) | Every exercise has every part. Exercises 28.2-28.5 mark their alternative "Design, not run" (FIX-M28-01 ruling); that conflicts with the plan's "an untested alternative is removed" (For Jorge 2). |
| E2 | Pass | Script: the criteria of Ex 28.1-28.5 (6, 5, 7, 6, 7) equal the `it()` titles exactly; each account names what the test asserts. |
| E3 | Pass | From a signal-service store (28.1) to a SignalStore integrating §8, §9 and §10 (28.5). |
| E4 | Pass | 58 tests pass (run); `grep`: no `vi.`/`expect(` in non-spec files, no `console.log`; `@ngrx` imported only in `exercise-5-signal-store/`. |
| E5 | Pass | 3 Output questions; exercise specs assert exact values, counts and URLs. |
| F1 | Pass | Summary (1321-1327): three paragraphs linking all twelve sections, each with its trap. |
| F2 | Pass | Four explain-back prompts naming a listener. |
| F3 | Pass | Six flashcards. |
| F4 | Partial | Builds on, Read next and Comparisons carry reasons; "Uses these ideas later" lists 29, 31, 38, 45 with reasons, and leaves out 43 from M27.md's closing plan by the closer's choice ("the module never mentions it", CLOSE-M28 LOG line). Accepted; no FIX. |
| G1 | Pass | 22,438 prose words (module-stats and the one-liner agree), under the CLOSE limit 22,470 and the ceiling 23,370; no redundancy found worth cutting. |
| G2 | Pass | 7 of 7 SYLLABUS §4 rows covered (table below). |
| H1 | Pass | `ng test` 10 files 58 tests, `tsc -p tsconfig.spec.json --noEmit`, `ng build`: all exit 0 (run). |
| H2 | Pass | `check-links.mjs --planned`: "All links resolve." (run). |
| H3 | Pass | `git status --short` at review time: only `_meta/STATE.md` and `_meta/TASKS.md` (this task's claim); the probe folder was deleted. |

## Module-specific checks (REVIEW-M28 entry)

| Check | Result | Evidence |
|---|---|---|
| Lab mode of every task (LOG lines); in harness mode no harness observation worded as a committed lab result; the nine NgRx questions not tagged Output | Partial | read (LOG 1059-1095): SEC-M28-04..09, 12 and QB-M28-02..05, 07 in harness mode, SEC-M28-10 and EX-M28-01..04 in the repository lab, EX-M28-05 in lab mode. The nine questions are Concept (module-stats). No harness result is called "in the lab", but the cited `Section N:` names read as lab tests and the verification paragraph (31) says observed behavior cites a spec in the labs (T-1). |
| Every recorded key, type string, count, emission, log, error and TS code (F6-F20) against a re-run | Partial | run: sections 1, 2, 3, 10 and the outputs (58 tests); my probe re-ran F6 (keys, type), F8 (2 runs), F10 bound (11/10), F13 freeze, F18 events, all equal. The rest of F6-F20 rests on the deleted harness (T-1). |
| Freeze contrast (NgRx dev freeze, SignalStore none, C10) | Pass | package source: `createActiveRuntimeChecks` (`ngrx-store.mjs` 1178-1198); run: probe, `Object.isFrozen` false for `getState(store)` and `user`. |
| Memoization counts and the factory-selector probe | Partial | run: Q28.12's 2 runs (probe); package source: `defaultMemoize`, `createSelectorFactory`. The factory-selector and props counts rest on the harness (T-1). |
| Effects error handler and the outer-`catchError` completion (F10) | Pass for the handler, harness for the completion | package source: `defaultEffectsErrorHandler` (`ngrx-effects.mjs` 174-185: on the tenth error it returns the bare stream); run: probe 11 runs, 10 handled. |
| Protected state as a compile-time check (F14) | Pass | run: `E28.5 … patching the state from outside the store does not compile` (`// @ts-expect-error`, `tsc` exit 0). |
| `rxMethod` NG0203 and the 21.1 deprecation warning (F16) | Pass (source) | package source: `ngrx-signals-rxjs-interop.mjs` 61, the warning text quoted by the module; the NG0203 run is harness (T-1). |
| `patchState` per-key behavior (F17) | Pass (source) | package source: `patchState` (`ngrx-signals.mjs` 205-221) compares per key and warns "@ngrx/signals: patchState was called with an unknown state slice '…'." (first of three `console.warn` arguments, quoted as such). |
| Status markers against typings tags, CHANGELOG and `npm pack` (F3, F4), first body mention, "NgRx" in NgRx markers (C8) | Pass | package source: 22.0.1 typings `@experimental` only in `ngrx-signals-resource.d.ts`; `npm pack` 20.0.1 `events/src/*.d.ts` carry `@experimental`, 21.0.0 none; `tapResponse` has only the observer overload (`ngrx-operators.d.ts` 72). C4 row. |
| Events plugin status resting on the typings diff stated | Pass | §9 930 and Q28.27 say "the 20.0.1 typings tag … 21.0.0 has none"; confirmed by `npm pack`. |
| ComponentStore supported, not deprecated (F5) | Pass | §8 825, §8 888, Q28.21; the docs quote with "remains supported". |
| "Will be removed in v23" quoted as the typings' statement (C12) | Pass | §5 538, Q28.13 1677. |
| No NgRx CHANGELOG line above 22.0.1 cited as shipped (C1) | Pass | read: the newest cited lines are 22.0.0 (`[Removed in NgRx v22.0]`, data-persistence, resources). |
| TanStack docs quote verbatim with branch and date, C5 marker | Pass | §1 65 and §11 1129 carry path, branch `main` and 2026-10-13; the C5 marker at the first body mention (65). |
| Elf's status limited to what was read (C4) | Pass | §11 1133, 1224, Q28.31: registry dates only, "GitHub was not readable here". |
| No NGXS, TanStack or Elf import (C9) | Pass | `grep` in the lab folder: none; §11 snippets are `// Partial:` and "not run". |
| Docs quotes with branch `main` and date | Pass | read: each NgRx and TanStack docs quote names its page, `main` and 2026-10-13. |
| Probe-first claims (C6) backed by tests or absent | Partial | §1 router tests and Ex 28.2 back navigation: committed and passing; §5 factory selector, §6 `catchError` inside, `tapResponse`, §7 Router Store and DevTools, §8 `withHooks`, §12 order: harness only (T-1). |
| Internal names of C7 marked internal at first use per section, found by `grep` | Pass for C7, Partial outside it | C7 names marked; `immutabilityCheckMetaReducer`, `createSortedStateAdapter`/`createUnsortedStateAdapter`, `_createRouterConfig` are not exported in 22.0.1 and unmarked (T-2). |
| Owner credit and the 17/19/22/23/27 split | Pass | read: signals and the cut-off 17 §2/§3 (§2 restates the cut-off at store scale and credits 17 §3, as the plan allows), diamond Q17.34, read-only Q17.05, `BehaviorSubject` 22 §4 and Q22.18, operators 23 §2/§3/§5/§9, `toSignal` 23 §7/Q23.24, caches 27 §6/Q27.21, `httpResource` 27 §10; one sentence plus a link each. |
| Handoffs of M28.md honored | Pass | 03's freeze sentence confirmed (§4 440, source); 17's decision framework (§11), `injectMutation` (§11), Entity's normalized shape (§7, §10); Exercise 17.1 linked. |
| Output short answers give the reason | Pass | read: Q28.05, 07, 30. |
| Every question link points at the intended ID | Pass | script: 54 links resolve to the intended questions (sampled 15 by context). |
| Terms defined at first use | Partial | B9 row (T-6). |
| SOURCES lines (script) | Pass | C8 row. |
| Every anchored cross-module link resolves; none bare except planned files | Pass | run (link check); file-level links only to planned 29, 31, 38, 41, 45. |
| Sections 3, 4, 6 and 8 have `#### Legacy` with a migration path | Partial | B1 row (T-4). |
| All twelve Mermaid diagrams parse | Pass | run: 12 of 12; negative control fails. |
| Every Misconceptions bullet has a cause clause | Pass | B7 row. |
| Every `<details>` closed | Pass | script: 55 open, 55 close, no heading inside. |
| Every "in the lab" claim names an existing test | Pass for "in the lab" wording, Fail for the cited harness names | C3 row (T-1). |
| Every criterion equals its test title; every offered alternative passes | Partial | E2 Pass; Ex 28.1's alternative runs (`describe.each`); 28.2-28.5 are "Design, not run" (For Jorge 2). |
| Type mix and Output share | Pass | D3 row (harness-mode mix of the plan). |
| Prose within its limit (22,470) and the REVIEW ceiling (23,370) | Pass | G1 row. |
| The file-level links into 28 listed as anchor candidates with a section map | Done | Handoffs table (9 anchors; 15 stay file-level). |

## Handoffs

Module 28 slugs (verify at FIX time; no FIX here renames a heading):

- S2 `#2-the-service-with-signals-store-state-shape-derived-selectors-methods-and-async-loads`
- S4 `#4-ngrx-store-actions-reducers-createactiongroup-createfeature-and-runtime-checks`
- S7 `#7-ngrx-entity-router-store-and-store-devtools`
- S11 `#11-alternatives-and-the-decision-framework-ngxs-elf-tanstack-query-and-when-a-store-library-is-justified`

| File:line | Context | Anchor |
|---|---|---|
| 03:480 | "NgRx reducers must return new objects" | S4 |
| 03:509 | "NgRx's runtime checks freeze state in development mode" | S4 |
| 03:1282 | Q03.18 answer: ngrx.io runtime checks, then Module 28 | S4 |
| 03:1469 | "`strictStateImmutability` runtime check, on by default in development, freezes the store state" | S4 |
| 17:897 | "See the decision framework in Module 28" | S11 |
| 17:1518 | "Libraries such as TanStack Query for Angular provide mutations" | S11 |
| 17:1885 | "*… NgRx SignalStore instead?* Only if the state has the complexity that justifies a store" | S11 |
| 17:1970 | "the normalized shape NgRx Entity uses" | S7 |
| 19:164 | "Application-scale state is Module 28" | S2 |

Stay file-level (15): header lines 03:5, 17:5, 23:5, 26:5, 27:5; Read next 26:2100, 27:2578; Uses these ideas later 03:1699, 17:2432, 19:2527, 22:2593, 23:2745, 23:2746, 26:2101, 27:2579. This differs from M28.md's map in two places: 03:480 goes to §4, not §10 (the sentence is about reducers returning new objects), and 17:1970 to §7, not §10 (it names NgRx Entity); 22:2593 and 23:2746 are "Uses these ideas later" lines, so they stay file-level. Module 17's four edits need the RUN.md §10 FIX route (this FIX); see For Jorge 3.

## Factual findings

**F-1 · Minor (D1) · Six answers have one follow-up (basis: script).** QUALITY-BAR D1 and the plan require at least two answered follow-ups. Q28.17 (1781), Q28.18 (1812), Q28.19 (1829), Q28.20 (1846), Q28.26 (2035) and Q28.28 (2070) have one each. Add one answered follow-up each, built only from facts already in the module:
- Q28.17: *"What does `tapResponse` change here?"* In the inner pipe it runs `next`, then `error` and `EMPTY` on failure, so the outer stream never sees the error (§6).
- Q28.18: *"How do you read the collection back?"* Through `getSelectors()`, for example `selectAll` in `ids` order and `selectTotal` (§7).
- Q28.19: *"Can a component write the route through the store?"* No: the URL stays the owner (§1), so it navigates and the mirror follows.
- Q28.20: *"What should production use?"* A `maxAge` and `logOnly: !isDevMode()`, as the docs' setup (§7).
- Q28.26: *"Can a feature add methods?"* Yes: `withRetry()` above wraps `withMethods` in `signalStoreFeature`.
- Q28.28: *"When should an update wait for the server?"* Payments and irreversible actions, because a shown confirmation cannot be withdrawn (§10).
About +110 words.

**F-2 · Minor (C1) · "each value calls `markForCheck()`" is overstated (basis: package source).** §3 298: "Read from `@angular/common` 22.2.1 (`fesm2022/_common_module-chunk.mjs`, `AsyncPipe._updateLatestValue`, internal): each value calls `markForCheck()`." `AsyncPipe.transform` sets `markForCheckOnValueUpdate = false` while it subscribes (2561-2569), and `_updateLatestValue` calls `markForCheck()` only when that flag is set (2602-2603). A value emitted synchronously during the first subscribe, which is exactly a `BehaviorSubject`'s current value, is returned without `markForCheck()`; later values call it. The lab test still holds (its emission comes after the subscribe). Fix: "each value that arrives after the subscription calls `markForCheck()`; one emitted during the first subscribe, such as a `BehaviorSubject`'s current value, is simply returned". About +18 words.

**F-3 · Nit (C1) · Q28.16's trap is off by one (basis: package source, run).** 1753: "the handler hides that until the tenth". `defaultEffectsErrorHandler` reports ten errors and the eleventh escapes (`ngrx-effects.mjs` 174-185; §6 625; my probe: 11 runs, 10 handled). Fix: "until the eleventh error". +1 word.

**F-4 · Nit (C1, completeness) · §1's spread order leaves out the route's resources (basis: package source).** 61: "spreads `queryParams`, `params` and `data` into one object in that order". In 22.2.1 the object is `{ ...queryParams, ...params, ...data, ...activatedRoute.resources }` (`_router-chunk.mjs` 1676-1681). The conclusion (a path parameter beats a query parameter) is unaffected. Fix: add "and then the route's `resources`" (no marker needed if it links module 24's resources passage; otherwise "then the route's resources, module 24's topic"). About +6 words.

## Teaching and completeness findings

**T-1 · Major (C3, C6, plan C2) · 45 cited test names for sections 4-9 and 12 exist in no committed spec (basis: script, read, run).** The module cites, in backticks and in the lab's `Section N: …` format, 45 test titles from `Section 4: createActionGroup derives camelCase creators and bracketed types` to `Section 12: state watchers run on every patchState call, changed or not`; the repository has no `section-4` … `section-9` or `section-12` spec (the harness was deleted, as the plan required). Many citations carry no harness qualifier in their own sentence or paragraph: §4 438, 440, 442; §5 538, 540, 542, 544; §6 627, 629, 631, 673; §7 739, 741; §8 815, 819, 821, 823, 825; §9 924, 928; §12 1269; Q28.33 2189 and Q28.34 2224. The module's own verification paragraph (31) says "An observed behavior cites a spec in `labs/angular/src/app/modules/28-state-management/`", and the Labs line (9) promises "section specs", so a reader will look for files that do not exist. Stale wording since HOUSE-15: the Question bank intro (1331, "In harness mode (NgRx not installed)") and three `// Partial: … NgRx is not installed in the labs` comments (454, 1537, 1585). NgRx 22.0.1 is installed in `labs/angular` (HOUSE-15); every NgRx claim I re-ran there (five groups) reproduced the harness value, so a conversion carries little risk. **Recommended fix (lab mode, M28.md Lab decision 2 and Lab files):** commit `concepts/section-{4,5,6,7,8,9,12}-*.spec.ts` with exactly the cited titles; turn the three `// Partial:` Legacy blocks into compiled `legacy/ngmodule-store.ts`, `legacy/class-effects.ts`, `legacy/grid-component-store.ts`; add `Q28.09`, `11`, `12`, `16`, `18`, `22`, `24`, `25`, `34` to `outputs/q28-outputs.spec.ts` and restore their `Output` tag (mix becomes the plan's: Output 12, Concept 7, …), with each snippet the code its test runs; replace "Observed in a throwaway harness on 2026-10-13 (…)" by the test citation; reword line 9, 31, the bank intro and the stale comments. Prose about −150 words (the 28 repeated harness clauses go). **Fallback if Jorge declines:** one S task that marks every one of the 45 citations "(harness test, not in the repository)" or drops the backticked name, and fixes 9, 31, 1331, 454, 1537, 1585. For Jorge 1.

**T-2 · Nit (C7 marking).** Not exported from the 22.0.1 typings and unmarked: `immutabilityCheckMetaReducer` (§4 440), `createSortedStateAdapter` and `createUnsortedStateAdapter` (§7 737), `_createRouterConfig` (§7 739). Add "(internal)" once each. +4 words.

**T-3 · Nit (C1 basis, text).** §7 741: "… (§4), The docs say `maxAge` defaults to `false`, infinite." A comma splice into a capital, and the docs page is not named. The source shows the default (`ngrx-store-devtools.mjs` 131, `maxAge: false`). Fix: "… (§4). `maxAge` defaults to `false`, no limit (read, the `createConfig` defaults)." +0 words.

**T-4 · Nit (B1 Legacy).** §4 Legacy (483-493) and §6 Legacy (671-687) show the old form but no migration step. Add to §4: "Migrate by replacing `StoreModule.forRoot` and `forFeature` with `provideStore()` and `provideState(feature)`, and a file of `createAction` calls with one action group." Add to §6: "Migrate each field to a `createEffect(…, { functional: true })` constant, or keep the class and register it with `provideEffects(LabM28Effects)`." About +45 words.

**T-5 · Nit (reader text: process talk).** "Probe" sentences describe the writer's process: Ex 28.1 2308 ("One probe was restored: …"), Ex 28.2 2380 ("The back probe came first.") and 2382 ("Two probes were restored"), Ex 28.3 2455, Ex 28.4 2526, Ex 28.5 2604 ("… probes were restored"), Q28.34 2214 ("the cast is the probe's"). Keep the content (each names a change that fails a test, which teaches what the tests guard) and reword, for example "Each of these changes fails a test: …" and "The `TestBed` back navigation needs care: …"; in Q28.34 "the cast lets the unknown key reach the runtime warning". About +0 words.

**T-6 · Nit (B9).** "Flux" (§9 905 "Flux-style dispatching"; Q28.27 2053 quote) is never glossed. Add at 905: "Flux-style (the one-way action → dispatcher → store pattern that Redux grew from)". +10 words.

**T-7 · Minor (anchors).** The Handoffs table: 9 file-level links to 28 in modules 03, 17 and 19 take an anchor.

## Output answer cross-check

The three Output answers were compared with `outputs/q28-outputs.spec.ts`: Q28.05 `{ items: 2, count: 1, loading: 2 }` (line 31), Q28.07 `[['a'], ['a', 'b']]` and the array holding `'c'` (50-51), Q28.30 the three stack states and `redo(branched)` the same object (82-85). Each short answer gives the reason (run, read).

## SYLLABUS §4 coverage (module-28 checklist, 7 rows)

| Row | Where | Status |
|---|---|---|
| Kinds of state: server cache, UI, form, URL, session; where each belongs | §1, Q28.01-03, Ex 28.1, 28.2 | Covered |
| Service-with-signals store; service-with-`BehaviorSubject` store | §2, §3, Q28.04-07, Ex 28.1, 28.4 | Covered |
| NgRx Store: actions, reducers, selectors (memoization), `createFeature`, `createActionGroup`, functional effects, Entity, Router Store, DevTools | §4-§7, §12, Q28.08-20, 33 | Covered (evidence: T-1) |
| ComponentStore (status in v22) and SignalStore (`signalStore`, `withState`, `withComputed`, `withMethods`, `rxMethod`, `withEntities`, custom features, Events status) | §8, §9, §12, Q28.21-27, 34, Ex 28.5 | Covered (evidence: T-1, except Ex 28.5) |
| Alternatives: NGXS, Elf (maintenance status), TanStack Query `[Experimental]` | §11, Q28.31 | Covered as far as readable (Elf: registry only, For Jorge 4) |
| Decision framework | §11, §1, Q28.03, Q28.32 | Covered |
| Optimistic updates, normalization, undo | §10, Q28.28-30, Ex 28.3, 28.5 | Covered |

## Redundancy

No retelling worth cutting. The likeliest repeats (the freeze in §4/§8/Q28.10/Q28.22, the memo in §5/Q28.12/Q28.13/Ex 28.4, the error handler in §6/Q28.15/Q28.16/Q28.17, the per-key `patchState` in §12/Q28.34) each add a run, a source read or a contrast and link back. The 28 repetitions of the harness clause "Observed in a throwaway harness on 2026-10-13 (Angular 22.2.1, NgRx 22.0.1 from `npm pack`)" are the only repeated text; T-1 removes them.

## Claims to verify

28 claims sampled; basis on each.

| # | Claim (line) | Basis | Result |
|---|---|---|---|
| 1 | 3 Output answers | run | match |
| 2 | Criteria of Ex 28.1-28.5 equal test titles | script | match |
| 3 | 22 cited names for §1-3, §10, outputs, exercises exist | script | match |
| 4 | 45 cited names for §4-9, §12 | script | absent from the repository (T-1) |
| 5 | Runtime-check defaults in dev and prod (440, Q28.10) | package source (`ngrx-store.mjs` 1178-1198) | match |
| 6 | `selectSignal` is `computed(() => selector(this.state()), options)`; `State` uses `toSignal(…, { manualCleanup, requireSync })` (542) | package source (590-591, 497) | match |
| 7 | `ActionsSubject` starts with `@ngrx/store/init`, `next` throws `TypeError` without `type` (1256, Q28.33) | package source (196, 203-212) | match |
| 8 | `ReducerManager` is a `BehaviorSubject` (1256) | package source (392) | match |
| 9 | `createActionGroup` creators and types; `createFeature` keys (436, 438, Q28.09, Q28.11) | run (probe) | match |
| 10 | A mutating reducer's error goes to RxJS's unhandled-error hook, not the `dispatch` caller (442) | run (probe: `config.onUnhandledError` got "Cannot add property 0, object is not extensible") | match |
| 11 | Projector runs 2 of 4 calls (536, Q28.12) | run (probe) | match |
| 12 | Handler reports 10 errors, 11 runs over 14 dispatches (625, Q28.16) | package source (174-185), run (probe) | match; Q28.16 trap off by one (F-3) |
| 13 | `mergeEffects` ends `dispatch: false` with `ignoreElements()` (623) | package source (`ngrx-effects.mjs` 160) | match |
| 14 | `tapResponse` callback form removed (629) | package source (`ngrx-operators.d.ts` 72: observer overload only) | match |
| 15 | DevTools `maxAge` < 2 error text; `logOnly` features; `maxAge: false` default (741, Q28.20) | package source (`ngrx-store-devtools.mjs` 131, 159-160, 170) | match; wording T-3 |
| 16 | Dispatcher `providedIn: 'platform'`; reducer stream first, handlers on `queueScheduler` (928) | package source (`ngrx-signals-events.mjs` 69-153, 145) | match |
| 17 | Events handler sees `count()` 10 after `set(10)` (928, Q28.27) | run (probe) | match |
| 18 | Events `@experimental` in 20.0.1, none in 21.0.0 (930, 995) | package source (`npm pack`) | match |
| 19 | `patchState` per-key compare and the unknown-slice warning (1269, Q28.34) | package source (`ngrx-signals.mjs` 205-221) | match (first `console.warn` argument) |
| 20 | `rxMethod` outside-injection-context warning (922, Q28.24) | package source (`ngrx-signals-rxjs-interop.mjs` 61) | match |
| 21 | SignalStore state not frozen (821, Q28.22) | run (probe) | match |
| 22 | `@ngrx/signals/resource` `@experimental` (930) | package source (22.0.1 typings) | match |
| 23 | NGXS `@Select` `@deprecated`; `select` returns `Signal<T>`; `dispatch` returns a function returning an awaitable Observable (1131) | package source (`npm pack` 22.0.0 `index.d.ts` 273-276, 625, 627-632) | match |
| 24 | `COMPUTED_NODE.producerRecomputeValue` compares with `node.equal` (163) | package source (`_effect-chunk.mjs` 292-304) | match |
| 25 | `RoutedComponentInputBinder` spread order and `queryParams ??= true` (61) | package source (`_router-chunk.mjs` 1646, 1676-1681) | match, incomplete (F-4) |
| 26 | `AsyncPipe` calls `markForCheck()` for each value (298) | package source (`_common_module-chunk.mjs` 2547-2603) | overstated (F-2) |
| 27 | `createReducer` returns the given state for an unknown type (438) | package source (`createReducer`, `Map` of `on` handlers) | match |
| 28 | Exercise 28.5 protected state: `TS2345` under `@ts-expect-error` (2602) | run (`tsc` exit 0 with the directive) | match |

## Proposed FIX tasks

Ceilings: the module is 22,438 prose words (module-stats); CLOSE limit 22,470; ceiling 23,370. The text tasks net at most +130 + 80 = +210 (about 22,650); the conversion nets about −150. FIX-M28-02 and -03 edit `modules/28-state-management.md` and run in that order; FIX-M28-04 edits only other modules' link targets and may run in parallel with them. FIX-M28-05..08 (conversion) and FIX-M28-09 (fallback) are mutually exclusive and wait for Jorge's ruling (For Jorge 1); they run after 02 and 03.

### FIX-M28-02 · S · Follow-ups, the trap count and reader text (F-1, F-3, T-3, T-5)
- Files: `modules/28-state-management.md`.
- Do: F-1 one answered follow-up each for Q28.17, 18, 19, 20, 26, 28 (the review gives the text); F-3 "until the eleventh error"; T-3 §7's `maxAge` sentence; T-5 the seven "probe" wordings as reader text, content kept.
- Acceptance: common rules; the follow-up script finds at least two bullets in all 34 answers; `grep -ci "probe"` on the module returns only uses that are not process talk (list them in the LOG line); prose at most +130 over the count measured just before.
- Model: **Sonnet** (mechanical; text given).

### FIX-M28-03 · S · The `async` pipe claim, the spread order, internal marks, Legacy migration paths and Flux (F-2, F-4, T-2, T-4, T-6)
- Files: `modules/28-state-management.md`.
- Do: F-2 scope the `markForCheck()` sentence (re-read `AsyncPipe.transform` and `_updateLatestValue` in the installed `@angular/common` 22.2.1 first); F-4 add the route's resources to §1's spread; T-2 mark the four names internal; T-4 one migration sentence each in §4 and §6 Legacy; T-6 gloss Flux at §9's first use.
- Acceptance: common rules; the four names marked once per unit (`grep`); prose at most +80 over the count measured just before.
- Model: **Sonnet** (prescribed text; one source re-read).

### FIX-M28-04 · S · Anchors for the file-level links to 28 (T-7; +0 words)
- Files: `modules/03-js-objects-prototypes-classes.md`, `modules/17-signals.md`, `modules/19-component-communication-and-projection.md` (link targets only).
- Do: apply the Handoffs table (9 anchors); the 15 header, Read-next and Uses-these-ideas-later lines stay file-level. Verify each slug against module 28's `## N.` headings and each line by its text.
- Acceptance: `node labs/tools/check-links.mjs --planned` exits 0; the word count of every touched file unchanged; no other text changes; module 17 edited only through this FIX (RUN.md §10).
- Model: **Sonnet**. Files disjoint from 02 and 03.

### FIX-M28-05 … FIX-M28-08 · M each · Commit the NgRx claims as lab specs (T-1, recommended; blocked on For Jorge 1)
- 05: `concepts/section-4-ngrx-store.spec.ts`, `concepts/section-5-selectors.spec.ts`, `legacy/ngmodule-store.ts`; module §4, §5 and Q28.08-14 citations.
- 06: `concepts/section-6-effects.spec.ts`, `concepts/section-7-entity-router-devtools.spec.ts`, `legacy/class-effects.ts`; module §6, §7 and Q28.15-20 citations.
- 07: `concepts/section-8-signal-store.spec.ts`, `concepts/section-9-signal-store-in-depth.spec.ts`, `legacy/grid-component-store.ts`; module §8, §9 and Q28.21-27 citations.
- 08: `concepts/section-12-under-the-hood.spec.ts`; `outputs/q28-outputs.spec.ts` (adds the nine NgRx Output tests, earlier tests unchanged); retag Q28.09, 11, 12, 16, 18, 22, 24, 25, 34 as `Output` with each snippet the code its test runs; §12, Q28.33-34 citations; header Labs line, verification paragraph (31), bank intro (1331).
- Do (each): write the specs with **exactly** the cited titles (the review's list of 45), asserting the values the module states (M28.md F6-F19 give the recipes); compile each Legacy block as a lab file and replace its `// Partial:` with an Excerpt plus `<sub>Source:`; replace "Observed in a throwaway harness on 2026-10-13 (…)" by the citation and remove "NgRx is not installed"; where a run differs, the run wins and the text changes (state it in the LOG line).
- Acceptance: module-28 `ng test` passes 5 of 5 runs; `tsc -p tsconfig.spec.json --noEmit` and `ng build` exit 0; the cited-name script finds 0 missing names; `grep -c "throwaway harness"` is 0 after 08 (or each task's own sections are clear); `check-snippets . 28` exits 0; after 08 module-stats shows Output 12; no `@ngrx` import outside `exercise-5-signal-store/`, `legacy/` and the new specs; prose not above the count measured before.
- Model: **Sonnet** writers (the facts and recipes are in M28.md), main verifies; **Opus** for 08 (Output retagging and the frame text).

### FIX-M28-09 · S · Fallback: mark the harness citations (T-1; only if Jorge declines the conversion)
- Files: `modules/28-state-management.md`.
- Do: mark each of the 45 citations as a harness test not in the repository (or drop the backticked name and keep "observed in a throwaway harness …"); fix line 9 ("section specs"), the verification paragraph (31), the bank intro (1331) and the three "NgRx is not installed" comments.
- Acceptance: common rules; no backticked `Section 4:`-`Section 9:` or `Section 12:` name without a harness marker in its sentence (script); prose at most +60.
- Model: **Sonnet**.

Common rules for each task: from `labs/angular` run `npx ng test --watch=false --include='src/app/modules/28-state-management/**/*.spec.ts'` (10 files, 58 tests, more after 05-08) and `npx tsc -p tsconfig.spec.json --noEmit`; from the guide root `node labs/tools/check-links.mjs --planned` and `node labs/tools/check-snippets.mjs . 28` exit 0; cited `Section N:`, `Q28.NN` and `E28.N` names unchanged except as T-1 prescribes; only declared files change; the module stays at or under 23,370 words; the LOG line gives both counts (`module-stats.mjs` and the QUALITY-BAR one-liner). On a fresh local checkout run `npm ci` in `labs/angular` first if `node_modules/@ngrx` is missing.

## For Jorge

1. **Convert the NgRx harness claims into committed specs (T-1, the Major)?** Recommended: yes (FIX-M28-05..08, four M tasks), because NgRx 22.0.1 is already in the labs, the plan's lab mode asks for exactly this, every re-run I made reproduced the harness value, and it restores the nine *Output* questions (QUALITY-BAR C2). Alternative: FIX-M28-09 only (one S task) marks the 45 citations as harness tests. Both are `blocked` until you choose; mark the other `done` with "declined".
2. **Unrun exercise alternatives.** FIX-M28-01 (your session's E1 ruling) allowed "Design, not run" for Exercises 28.2-28.4, following 28.5; the plan (M28.md Exercises) and the module-27 review (T-2) say an offered alternative must pass the same tests or be removed. These four cannot pass the same tests by design (each changes the contract: a service copy of the URL, a reload endpoint, store-bound selectors, no shared feature), and 28.2's even "breaks the exercise's constraint". Rule which policy holds for 28 and later modules; if it is "run or remove", a FIX would recast them as "the tempting alternative, and why it is rejected" or delete them. No FIX was opened.
3. **Module 17 edits:** FIX-M28-04 changes four link targets in `modules/17-signals.md` (897, 1518, 1885, 1970); approve, or keep them file-level (the FIX-M27-04 precedent was applied).
4. **Unchanged open points from M28.md and CLOSE-M28:** Elf's maintenance status rests on npm dates (GitHub unread, C4); the TanStack marker is a judgment (C5); VERSIONS.md has no NgRx status rows nor `@tanstack/angular-query`; NgRx docs read on `main` (C1); 34 of 35 questions. None blocks a FIX.
5. **Environment note:** this Mac's `labs/angular/node_modules` lacked `@ngrx` until I ran `npm ci` (lockfile unchanged). Any local session after a cloud install needs the same step; the common rules above now say so.

**Rulings (Jorge, 2026-10-13, through the harness question prompt, relayed by the coordinator):**
1. Commit lab specs: FIX-M28-05..08 are unblocked (`todo`); FIX-M28-09 is retired (`done`, "declined").
2. Exercise alternatives: "run or remove". FIX-M28-10 (M, Opus) makes each alternative of Exercises 28.2-28.5 pass the same tests with `describe.each`, or removes it and records the E1 gap.
3. Module 17: FIX-M28-04 is approved to edit the four link targets (897, 1518, 1885, 1970).

Scratch deleted: yes. The probe folder `labs/angular/src/app/zz-review-probe/` was removed right after its run, and the session scratchpad (scan script, test log, Mermaid install and script, `npm pack` tarballs) was removed with absolute paths; no server or Vitest process was left running; `labs/angular/dist/` and `.angular/` are covered by the lab's `.gitignore`.
