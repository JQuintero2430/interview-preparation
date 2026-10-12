# REVIEW-M21: `modules/21-change-detection.md`

- **Reviewer:** subagent, model claude-sonnet-5-5, session S20261009-1454-claudecode (module written by the PLAN/SEC/EX/QB/CLOSE sessions of module 21, 2026-10-09; the reviewer authored no module-21 task, so it is eligible)
- **Date:** 2026-10-09
- **Files read:** `modules/21-change-detection.md` (all 2,638 lines, read end to end, then the passages behind each finding re-read, so every line number below comes from that read); `_meta/RUN.md`; `_meta/QUALITY-BAR.md`; `STYLE-GUIDE.md`; `_meta/reviews/REVIEW-M20.md` (format model); `_meta/TASKS.md` (REVIEW-M21 and the module-21 common rules, the FIX-M20 block); `_meta/modules/M21.md` (plan, F1-F28, C1-C15, owner map, breadth table); `SYLLABUS.md` §4 (21); `SOURCES.md` Module 21 section; `VERSIONS.md`; `_meta/GLOSSARY-TERMS.md` `## Module 21`; the lab folder `labs/angular/src/app/modules/21-change-detection/` (nine concept specs, `outputs/q21-outputs.spec.ts`, `outputs/q21-zone-outputs.spec.ts`, five exercise folders, `legacy/`) and `labs/ts-js/src/modules/21-change-detection/`; the installed `@angular/core` 22.2.1 (`fesm2022/_debug_node-chunk.mjs`, `_pending_tasks-chunk.mjs`, `core.mjs`, `types/core.d.ts`, `schematics/migrations.json`, `package.json` peer metadata), zone.js 0.16.3, the core CHANGELOG (`main`, read by version heading), the angular.dev pages at tag `v22.2.1` that SOURCES cites, and the Hibernate 7.4 guide section SOURCES cites.
- **What was run** (Node 24.21.0, `export PATH=/opt/homebrew/opt/node@24/bin:$PATH`, one check at a time): from `labs/angular`, `npx ng test --watch=false --include='src/app/modules/21-change-detection/**/*.spec.ts'` (AOT test build, jsdom: 17 files, 88 tests, all passed, no `NG8011`); from `labs/ts-js`, `npx vitest run src/modules/21-change-detection` (6 passed); `npx tsc -p tsconfig.spec.json --noEmit` (exit 0); `npx ng build` (exit 0); `node labs/tools/check-snippets.mjs . 21` ("All snippets check out."); `node labs/tools/check-links.mjs --planned` ("All links resolve.", 465 planned links); `node labs/tools/module-stats.mjs` (row 21: 35 Q, 6 Ex, 21,057 prose words, mix Concept 15, Output 9, Bug hunt 4, Trade-off 3, Difference 2, Design 2, no flags) and the QUALITY-BAR Python count (21,057, the same); the Mermaid parser (mermaid 11.12.0 under jsdom, installed in the scratch directory): 9 of 9 diagrams parse; a probe run of the same specs in a scratch copy of the lab (configs copied, `node_modules` symlinked) that printed the thrown messages by failing one assertion: the `NG0100` texts (legacy `StaleBoard` and the exhaustive `'0'` to `'3'`), `NG0908` and the `NG0914` warning reproduced. Scripts (read-only): section and question anatomy counts, answer word counts, cited-test-name check, first-use script, criteria against test titles, URL and SOURCES check, bare-link scan, link-anchor extraction, greps of every function named "read from the 22.2.1 source", CHANGELOG and typings checks of every status marker.
- **Basis of each finding:** stated on the finding as **run** (executed), **package source** (read in the installed 22.2.1 / zone.js files), **docs** (angular.dev page, Hibernate guide or CHANGELOG) or **read** (read in the module or the labs, nothing executed).
- **Probe files:** only under `/Users/jorge.quintero/.claude/jobs/1324502a/tmp/review-m21/` (scratch lab copy, Mermaid install, fetched docs, logs); deleted at the end (last line of this file).

Overall: a strong, honest module with no Fail and no Major finding. Everything quoted reproduced on 22.2.1: the `NG0100` (legacy and exhaustive), `NG0908` and `NG0914` texts (run) and the `NG0103` loop texts and their limits 10 and 100 (package source), all nine *Output* answers against their `toEqual` assertions, every cited `Section N:`, `Q21.NN` and `E21.N` test name (47 `Section` tests, all cited), every function named "read from the 22.2.1 source" (found by `grep` in the named file), the status markers against the CHANGELOG and typings, the two docs-versus-run observations worded as observations, and the Hibernate quotes. The module does not contradict REVIEW-M20 F-1 (it lists render-hook registration as a trigger). The weak points are small: one history sentence that overclaims (F-2), a docs quotation that is not verbatim (F-1), a typo (F-3), an unmeasured cost claim (F-4), an unlabelled abridged `NG0100` (F-5), a default attached to the wrong symbol (F-6) and a docs sentence attributed with the wrong error name (F-7); `PendingTasks` used before its marker and a set of first-use terms without a gloss (T-1, T-2); Output and excerpt snippets that hide the members that print the answer (T-3); three exercise-wording slips (T-4); render-hook registration alone setting the flag is not stated in §9 (T-5); the docs-versus-run observation appears only in Q21.23 (T-6); about 730 words retold, of which about 650 can go (T-7); anchors for 31 file-level links in 9 modules (T-8); and the Q17.02 parenthetical in module 17 is wrong (F-8, a module 17 fix). Net after the proposed tasks: about -500 words from 21,057, far under the 22,150 ceiling.

---

## QUALITY-BAR

Counts: **42 Pass, 3 Partial, 0 Fail, 0 N/A** (45 items). Items not Pass: B9, C1, C4. (The CLOSE-M21 record is not compared here; each row below is a fresh check.)

| ID | Result | Evidence |
|---|---|---|
| A1 | Pass | Header lines in STYLE-GUIDE §4.1 order (What this covers, Prerequisites, Leads to, Applies to, Study time, Short on time, Labs with the run command). I ran the command: 17 files, 88 tests passed. |
| A2 | Pass | Prerequisites link 17 and 20 with anchors; all resolve (link check). |
| A3 | Pass | Short on time names section links, question IDs, an exercise and the Summary link; every link resolves. |
| A4 | Pass | The contents list the nine sections and the five closing sections; the `## ` headings are §1 (30), §2 (124), §3 (228), §4 (352), §5 (445), §6 (545), §7 (651), §8 (730), §9 (807), Summary (888), Question bank (896), Hands-on exercises (2063), Check your understanding (2582), Connections (2634). |
| A5 | Pass | Order: the problem (§1), strategies (§2), zone (§3), the walk (§4), zoneless (§5), migration (§6), `ChangeDetectorRef` (§7), debugging (§8), the mechanism (§9, the deepest). Forward links are labelled. |
| B1 | Pass | Script: each of the six subsection headings appears 9 times. |
| B2 | Pass | Read: each "problem it solves" opens with a concrete failure (a stale view after a plain write, an OnPush row that never updates, a zone patch that fires on every timer, a stale ancestor, a task that never completes, a migration that breaks a test, a mutation that needs `markForCheck`, an `NG0100` that hides, a notification nobody can trace). |
| B3 | Pass | 9 `mermaid` blocks and 9 `What to notice` lines; 9 of 9 parse under mermaid 11.12.0 (run); none rendered in a browser. |
| B4 | Pass | Read: each section has a "read from the 22.2.1 source" answer (the notify and tick path, the dirty flags, the refresh loop, `PendingTasks`); every named function found by `grep` (see Module-specific checks). |
| B5 | Pass | Read: every `### Code` has the approach sentence and numbered steps. |
| B6 | Pass | Read: every best-practice item has a "because" (script: all items). |
| B7 | Pass | Script: 31 Misconceptions bullets, 31 with "The myth exists because ...". F-2 is a factual slip in a section sentence, not a missing cause. |
| B8 | Pass | Read: the Hibernate callout (§1) and Q21.02 state **Where the analogy breaks**; *Framework vs platform* callouts present; alert blocks open with `[!NOTE]`, `[!TIP]` or `[!WARNING]`. |
| B9 | Partial | Script and read: defined at first use with an owner link: change detection, OnPush, zoneless, signal, `ApplicationRef`, `afterNextRender`, `TestBed`. Not glossed at first use: `ngDoCheck` (270), `toSignal` (2196), `computed` and `effect` (1684, 1820), `ErrorHandler` (757), `ngDevMode` (762), `polyfills` (282, glossed at 551), `DestroyRef` and `takeUntilDestroyed` (594, 603), `MutationObserver` (73): T-2. |
| B10 | Pass | Read: a topic another module owns gets one sentence and a link (`ngDoCheck` to 20, `effect` and `toSignal` to 17, query timing to 19, TestBed depth to 29). Inside-module retelling is T-7. |
| C1 | Partial | 30 claims sampled and traced (table below); 26 match, and four are wrong, overclaimed or unmeasured: F-2 (zone-era "every event refreshed everything"), F-4 (costs "not time"), F-6 and F-7 (attribution slips). No Major. |
| C2 | Pass | 9 *Output* questions (Q21.05, 09, 14, 15, 18, 20, 21, 25, 30), each with a test in `outputs/q21-outputs.spec.ts` or `q21-zone-outputs.spec.ts` asserting exactly the printed lines (cross-check below). Zone claims are backed by zone specs. |
| C3 | Pass | Script: 48 cited `Section N:` names; 47 spec `Section` tests, all cited; the one name not in a module-21 spec (`Section 3: a plain mutation with no signal write does not run ngDoCheck`) is the module-20 spec's test and exists (`section-3-hooks-and-signals.spec.ts:206`). Every "in the lab" and "observed" sentence names a test. |
| C4 | Partial | Docs/CHANGELOG and typings: every marker present is right (list in Module-specific checks); `PendingTasks` appears in the §5 heading (445), the diagram (464) and the contents (3, 17) before its marker at 481: T-1. |
| C5 | Pass | Package source: every API in a snippet is in the 22.2.1 typings and compiles under `ng test`, `tsc` and `ng build`; removed APIs (`ignoreChangesOutsideZone`, `useNgZoneOnStable`, `checkNoChanges`) appear only as text labelled removed. |
| C6 | Pass | Grep: 0 `Unverified`, TASK, PLACEHOLDER or relink markers. |
| C7 | Pass | `check-snippets.mjs . 21` exit 0. Excerpts carry the `// Excerpt of` line; legacy snippets are labelled. T-3 is about readability of excerpts, not their kind. |
| C8 | Pass | Script: the module has no external URLs; SOURCES Module 21 covers all specs, the six exercises, zone.js, the Hibernate guide and the docs pages. |
| D1 | Pass | Script: 35 each of `### Q`, Short answer, Full explanation, Follow-ups, Trap to avoid; at least 2 follow-ups per answer; short answers 24-60 words (Q21.09 and Q21.25 at 24 because the printed list follows); answers average 207 words, maximum 237 (Q21.24). |
| D2 | Pass | Read: each *Output* short answer gives the printed lines and one or two sentences of reasoning. |
| D3 | Pass | module-stats: Concept 15, Output 9, Bug hunt 4, Trade-off 3, Difference 2, Design 2 (6 tags; largest 43%); at least one Trade-off, one Design, one Bug hunt. |
| D4 | Pass | Titles follow the sections, basic idea to internals (Q21.01-04 §1-§2, through Q21.30-35 §8-§9). |
| D5 | Pass | Handoff from REVIEW-M20 resolved: Q21.23 gives `ngDoCheck` one clause and a link to Q20.09, Q21.32 links Q20.25; no duplicate question in 01-20 beyond linked one-clause overlaps. |
| D6 | Pass | Script: every `Q21.NN` is linked as `[Q21.NN](#q21-NN)` from a section or answer; each section ends "Drilled in ..." with its own questions. |
| D7 | Pass | 35 `<a id="q21-NN"></a>` lines, unique; link check passes. |
| D8 | Pass | 35 questions (plan: 35 against the fallback of 38, recorded in PROGRESS), 6 exercises. |
| E1 | Pass | Each of the six exercises has Problem, Constraints (with "Not covered"), Acceptance criteria, two hints, Worked solution, Alternative approach with Trade-offs, three follow-ups and a Tests link. |
| E2 | Pass | Script: criteria equal the `it()` titles for Ex 21.1 to 21.5 modulo backticks; Ex 21.6's last criterion has "of that exercise" that the test title lacks (T-4, nit). |
| E3 | Pass | Exercises progress from tracing a refresh to a zoneless migration with a leak-free task. |
| E4 | Pass | `ng test` 88 passed, `tsc -p tsconfig.spec.json` and `ng build` exit 0 (the `legacy/` fixtures compile); read: classes inject at most 4 collaborators, no `any` in non-spec files. |
| E5 | Pass | 9 *Output* questions; exercise specs assert whole logs as literal arrays. |
| F1 | Pass | Summary (888-895): paragraphs restating each section's core claim and trap with section links. |
| F2 | Pass | Check your understanding (2582-2633): explain-back prompts naming a listener. |
| F3 | Pass | Flashcards present in Check your understanding. |
| F4 | Pass | Connections (2634-2638): Builds on, Read next, Uses later, each link with a reason. |
| G1 | Pass | 21,057 prose words (module-stats and Python agree), under the CLOSE limit 21,250 and the REVIEW ceiling 22,150; answers average 207. About 650 words are cuttable retelling (T-7), which the cap does not require. |
| G2 | Pass | 8 of 8 SYLLABUS rows covered (table below). |
| H1 | Pass | `ng test` 17 files 88 tests, `ts-js` 6 tests, `tsc -p tsconfig.spec.json --noEmit`, `ng build`: all exit 0. |
| H2 | Pass | `check-links.mjs --planned`: "All links resolve." |
| H3 | Pass | `git status --short`: no stray file from this module; scratch is outside the repository; `labs/angular/dist` and `.angular` are gitignored. |

---

## Module-specific checks (REVIEW-M21 entry)

| Check | Result | Evidence |
|---|---|---|
| Quoted runtime texts `NG0100`, `NG0103`, `NG0908`, `NG0914` and every "ran / did not run" set against a re-run | Pass, one abridgement | run: the scratch probe printed `NG0100 ... Previous value: '0'. Current value: '1'. Expression location: _StaleBoard component. Find more at https://v22.angular.dev/errors/NG0100` (legacy, Ex 21.2) and the exhaustive `'0'` to `'3'` text (§6, 574); `NG0908` "In this configuration Angular requires Zone.js" and the `NG0914` warning with `NoopNgZone` reproduced. `NG0103` "could not stabilize ... within the browser event loop": package source (`_debug_node-chunk.mjs` about 19463), both loop texts and limits (`MAXIMUM_REFRESH_RERUNS` 10, `detectChangesInViewWhileDirty` 100). Ex 21.2 (2225) quotes the `NG0100` text without "Expression location" and without a label: F-5. |
| Status markers against the CHANGELOG (F24, F25) and the typings | Pass | docs and package source: Eager [Added in v21.2] at 128; OnPush default [Changed in v22.0] at 60; `provideZonelessChangeDetection` [Stable since v20.2] and its default [Changed in v21.0] at 60; `PendingTasks` [Stable since v20.0], `run` [Developer preview since v19.0], `pendingUntilEvent` [Developer preview since v20.0] at 481; `provideCheckNoChangesConfig` [Developer preview since v20.0] at 574; `provideStabilityDebugging` [Added in v21.1] at 759; `enableProfiling` [Stable since v21.0] at 753; `ignoreChangesOutsideZone` [Removed in v21.0] and `useNgZoneOnStable` [Removed in v20.0] at 336; `ChangeDetectorRef.checkNoChanges` [Removed in v22.0] at 686. All match. Only placement is open: T-1 (`PendingTasks` before 481). |
| The Q17.02 inaccuracy (F16) is not repeated and is reported for 17 | Pass, reported | read and run: module 21 does not repeat it. `modules/17-signals.md:789` (Q17.02 short answer) says "(With `Eager` change detection, a tick *would* refresh the field: OnPush is what makes the tick useless.)". Run: an idle zoneless `tick()` on an Eager root threw `NG0100` (Previous value 'a'), asserted by `Section 9: the development check visits an Eager root after an idle tick`. F-8, FIX-M21-04. |
| The two docs-versus-run observations worded as observations (C10) | Pass, one gap | docs and run: (a) the docs say TestBed throws for updates it was not told about; observed: an Eager root throws, an OnPush root stays silent (Q21.23, 1684), worded as an observation. §9 (846) has the test but not the docs sentence: T-6. (b) `==` against `Object.is` in the signal equality observation is stated as an observation. |
| No zone claim worded as observed unless a zone spec exists (C2) | Pass | read: zone behavior claims cite `q21-zone-outputs.spec.ts` and the section-3 specs; production or browser frequency claims are "documented". |
| No production-mode, DevTools-UI, forms, SSR or Hibernate claim worded as observed (C3, C5, C11, C4) | Pass | read: production, DevTools UI, forms, SSR and performance claims are worded "documented" or "read, not run". Hibernate quotes verified against the 7.4 guide (docs). |
| No rationale or performance claim (C1) | Pass, one nit | read: F-4 (1717, "The costs are scope and bookkeeping, not time") is an unmeasured claim; no other performance word is asserted. |
| `NgZoneSchedulingMode` not taught (C8) | Pass | grep: absent from the module. |
| Flag and enum names attributed to the repo tag and marked internal at first use in each section | Pass | package source and read: `CheckAlways` 16, `Dirty` 64, `Attached` 128, `RefreshView` 1024, `HasChildViewsToRefresh` 8192 are attributed to the v22.2.1 tag (`dirtyFlags` is `@internal` at the tag) and marked internal in §4 and §9. |
| "Global versus targeted", "ancestors versus consumer only" and "before versus after render" against the tests | Pass | run: the section 4 and 9 specs assert global versus targeted refresh sets and the ancestors-marked traversal; the render-hook order is asserted by Q21.25 and Q21.30. |
| Terms defined at first use (script) | Partial | script and read: T-2. |
| SOURCES has the code-source lines for the six exercises, the outputs specs, zone.js and Hibernate (script) | Pass | read: SOURCES Module 21 covers all specs, exercises, the zone.js tarball, the Hibernate guide and the docs; per-section test counts are right (§7 eight, §9 five). |
| Every anchored cross-module link resolves and none is bare | Pass | run and script: 43 anchored links, all resolve; no bare link to a written module in the body. Bare links only at header and "Read next" lines (5, 2637, 2638) and to unwritten modules; module 22 exists but these three stay file-level. |
| Every function cited as "read from the 22.2.1 source" found by `grep` in the named file | Pass | package source: `markViewDirty`, `markAncestorsForTraversal`, `ApplicationRef.tick`, `synchronize`, `synchronizeOnce`, `detectChangesInViewWhileDirty`, `ChangeDetectionSchedulerImpl.notify`, `shouldScheduleTick`, `scheduleCallbackWithRafRace`, `createViewRef`, `refreshView`, `detectChangesInView`, `PendingTasks` internals in `_pending_tasks-chunk.mjs`, `NoopNgZone`: all found; the described behavior matches. |
| Sections 2, 3, 5, 6 and 8 have a `#### Legacy` subsection with a migration path | Pass | read: 5 `#### Legacy` at lines 198, 323, 520, 612, 789. |
| The module does not repeat what 12, 14, 17, 19, 20, 25, 29, 31 and 32 own | Pass | read: one sentence plus a link each. The overlaps with 20 are resolved (D5); the render-hook-registration gap is T-5. |
| All nine Mermaid diagrams parse | Pass | run: 9 of 9, mermaid 11.12.0 under jsdom. |
| The Hibernate callout states **Where the analogy breaks** | Pass | read: §1 callout and Q21.02. |
| Every Misconceptions bullet has a cause clause | Pass | script: 31 of 31 "The myth exists because". |
| Every "in the lab" claim names an existing test | Pass | script: 48 cited names, 0 missing. |
| Type mix and the Output tests match | Pass | module-stats Concept 15, Output 9, Bug hunt 4, Trade-off 3, Difference 2, Design 2; 9 Output tests equal. |
| Answers and sections reach the pilot's depth (G1, no filler) | Pass | script: G1 row; filler is T-7 only. |
| Proposed anchors for file-level links to 21 in modules 03, 04, 12, 14, 17, 18, 19, 20 | Done | Handoffs table below (31 anchors proposed; 20 verified already anchored). |
| No FIX takes the module past 22,150 without cutting as much as it adds | Pass | The FIX tasks net about -500 words from 21,057 (hard ceiling 22,150). |

## Handoffs

Topics that belong to other modules and are only linked:

- `ngDoCheck`, hook order, render-hook timing: 20 (one clause and a link in Q21.23, Q21.32).
- `effect`, `computed`, `toSignal`, signal equality: 17 (Ex 21.2 hints link the wrong section, see T-2).
- Query timing: 19. TestBed depth: 29. SSR and hydration: 32. Performance: 31.
- Q17.02: `modules/17-signals.md:789` parenthetical is wrong (F-8, FIX-M21-04).
- Anchors for the file-level links to module 21 (table below, FIX-M21-05). Module 20 is verified: all 14 body links to 21 are anchored and resolve (26 to §5; 34 to §1; 60 to §2; 133, 286, 370, 1224, 1849 to §3; 693, 1666 to §7; 697, 799, 1648, 1799 to §8); only 5 and 2234 stay file-level.

Module 21 slugs: S1 `#1-the-synchronization-problem-dirty-checking-and-fine-grained-reactivity`; S2 `#2-onpush-and-eager-strategies-and-what-marks-a-view-dirty`; S3 `#3-zonejs-and-ngzone-how-changes-used-to-be-detected-and-why-zone-left-the-default`; S4 `#4-the-tree-walk-global-and-targeted-refreshes`; S5 `#5-zoneless-change-detection-the-scheduler-its-triggers-and-pendingtasks`; S6 `#6-migrating-a-zone-based-app-to-zoneless`; S7 `#7-changedetectorref-markforcheck-detectchanges-detach-and-reattach`; S8 `#8-debugging-the-profiler-providechecknochangesconfig-and-stability`; S9 `#9-under-the-hood-the-notification-the-dirty-flags-and-the-refresh`; questions `#q21-NN`.

| File:line | Anchor |
|---|---|
| 03:480 | S2 |
| 03:1170 | S5 |
| 04:80 | S3 |
| 04:150 | S5 |
| 04:1377 | `#q21-35` |
| 12:49, 12:673, 12:804, 12:1368 | S1 |
| 12:428 | S8 |
| 12:487 | S3 |
| 12:689 | S2 |
| 12:1106 | `#q21-21` |
| 12:1466, 12:1785 | S4 |
| 13:55 (extra, module 13) | S2 |
| 14:690 | S1 |
| 14:711, 14:1978 | S2 |
| 14:781, 14:2065 | S7 |
| 14:1610 | S4 |
| 15:289 (extra, module 15) | S3 |
| 17:44 | S1 |
| 17:625, 17:791 | S2 |
| 18:1003 | `#q21-32` |
| 19:78, 19:1118 | S2 |
| 19:253, 19:1358 | `#q21-16` |
| 20 (verified, FIX-M20-04 applied) | none needed |

Stay file-level: 04:5, 04:1700, 12:5, 12:1860, 13:5, 13:2513, 14:5, 14:2205, 17:5, 17:2431, 18:2610, 19:5, 19:2526, 20:5, 20:2234. Verify each line and heading at FIX time (line numbers move if earlier FIXes edit those files).

## Factual findings

**F-1 · Nit · quote not verbatim (basis: docs).** Line 1882 quotes "suggests that state is updated during change detection"; the docs say "suggest". Fix: quote exactly.

**F-2 · Minor · history overclaim (basis: read and docs).** Line 440 says "in the zone era every event refreshed everything". Line 160 of the module itself and the docs say OnPush subtrees were skipped in zone apps; §1 line 119 repeats the idea via 17 §1. Fix: "in the zone era every event ran a global pass (OnPush subtrees were skipped)".

**F-3 · Nit · typo (basis: read).** Line 1599 "function.:". Fix: "function:".

**F-4 · Nit · unmeasured claim (basis: read).** Line 1717 "The costs are scope and bookkeeping, not time" is not measured anywhere. Fix: "The costs the lab shows are scope and bookkeeping; time is not measured here".

**F-5 · Nit · abridged runtime text (basis: run).** Ex 21.2 line 2225 quotes the `NG0100` message without "Expression location: _StaleBoard component. Find more at https://v22.angular.dev/errors/NG0100" and without a label. The spec asserts a substring. Fix: add "(abridged)" or quote in full.

**F-6 · Nit · default attached to the wrong symbol (basis: docs and package source).** Line 60 "`provideZonelessChangeDetection` ... is the default": zoneless is the default and no provider is needed; the function is stable since 20.2. Fix: "zoneless is the default and needs no provider".

**F-7 · Nit · wrong error name attributed to the docs (basis: docs).** Q21.23 line 1684 says the docs say TestBed throws "NG0100"; the docs name `ExpressionChangedAfterItHasBeenCheckedError`. Fix: use the docs' name, then say "which is NG0100".

**F-8 · Minor · module 17 inaccuracy, Q17.02 (basis: run).** `modules/17-signals.md:789` says a tick "would" refresh the field with `Eager`. Run: a zoneless idle `tick()` on an Eager root threw `NG0100` (Previous value 'a'); asserted by `Section 9: the development check visits an Eager root after an idle tick`. Fix in module 17: cut the parenthetical, or say the idle tick refreshes nothing and the dev pass throws `NG0100` for an Eager root. Module 21 does not repeat it.

## Teaching and completeness findings

**T-1 · Minor (C4).** `PendingTasks` is used in the §5 heading (445), the diagram (464) and the contents (3, 17) before its marker at 481. Add a plain mention with the marker, or move the marker to the first body mention. Nit: `ErrorHandler`, `ngDevMode` and `DebugTaskTrackerImpl` (1965) are unmarked internal names.

**T-2 · Minor (B9).** No gloss or owner link at first use: `ngDoCheck` (270, 20 owns it); `toSignal` (2196; Ex 21.2 Hint 1 links section 5, which does not teach it, should be 17 §8); `computed` and `effect` (1684, 1820; Ex 21.2 Hint 2 at 2202 links section 2, which does not teach `computed`); `ErrorHandler` (757); `ngDevMode` (762); `polyfills` (282, glossed at 551); `DestroyRef` and `takeUntilDestroyed` (594, 603); `MutationObserver` (73).

**T-3 · Minor (readability).** Output and excerpt snippets hide the members that print the answer: `tpl()` is undefined in Q21.05, 06, 14, 15 and 16; the `write()` helper is missing in Q21.09; the Q21.16 template fragment stands alone; Q21.06 uses an unlabelled legacy `@ViewChild`. Show the helper or the printing member in each.

**T-4 · Nit.** Ex 21.6 criterion 6 differs from the test title by "of that exercise"; Ex 21.3 follow-up (2322) "the `-1` step of E21.3" is cryptic; Ex 21.1 (2146) "My first table lacked ..." is first-person narrative.

**T-5 · Minor.** §9 (844) and Q21.32 do not say that a render-hook registration (`notify(7)`, flag 8) alone sets AfterRender and schedules a tick (REVIEW-M20 F-1). Add one clause linking 20 §7.

**T-6 · Minor.** The docs-versus-run observation (docs: TestBed throws for unannounced updates; run: Eager root throws, OnPush root silent) appears only in Q21.23 (1684). Add one sentence in §9 (846) or §8.

**T-7 · Minor (G1, B10).** About 730 words retold, about 650 cuttable (answer to section): Q21.02 vs §1 callout about 65; Q21.03 vs §2 (155) 40; Q21.13 vs §4 45; Q21.34 50; Q21.35 vs §3 (265) 45; Q21.33 vs §5 (479) 40; Q21.32 vs §9 (844) and 20 §7 55; Q21.19 and Q21.20 vs §5 (481) 70; Q21.17 vs §5 (474-477) 45; Q21.21 vs §5 (486) 35; Q21.26 vs §7 (688) 40; Q21.25 vs §7 (683) 40; Q21.30 vs §8 (757) 40; Q21.31 vs §8 (759) 40; Q21.12 vs §3 (274, 336) 45; Q21.08 vs §3 35. Keep every cited test name, cause clause and Output answer; keep each answer at least 165 words. Trim target -650.

**T-8 · Minor (anchors).** See the Handoffs table: 31 file-level links to 21 in modules 03, 04, 12, 13, 14, 15, 17, 18, 19; module 20 is verified.

Format note (nit, accepted): `**Full explanation.**` at Q21.11 (1255) is followed by a list at 1256 with no blank line; the same pattern as in module 20.

## Output answer cross-check

All 9 Output questions (Q21.05, 09, 14, 15, 18, 20, 21, 25, 30) were compared with the `toEqual` assertions in `outputs/q21-outputs.spec.ts` and `q21-zone-outputs.spec.ts`, by script and reading. All equal. The 88-test run passes (run). The criteria text of Exercises 21.1-21.5 equals the spec test titles (Ex 21.6: T-4).

## SYLLABUS §4 coverage (module-21 checklist, 8 rows)

| Row | Where | Status |
|---|---|---|
| Dirty checking and fine-grained reactivity | §1, Q21.01-02 | Covered |
| OnPush and Eager, what marks dirty | §2, Q21.03-08, Ex 21.1 | Covered |
| zone.js and NgZone | §3, Q21.09-12 | Covered |
| The tree walk, global versus targeted | §4, Q21.13-16 | Covered |
| Zoneless scheduler and `PendingTasks` | §5, Q21.17-22, Ex 21.5 | Covered |
| Migrating to zoneless | §6, Q21.23-24, Ex 21.2, 21.6 | Covered |
| `ChangeDetectorRef` | §7, Q21.25-29, Ex 21.3 | Covered |
| Debugging, profiler, stability, under the hood | §8, §9, Q21.30-35, Ex 21.4 | Covered |

(Row-to-question mapping from the plan's breadth table; all eight checkboxes are covered.)

## Redundancy

About 730 words are retold, about 650 cuttable (T-7). No overlap with modules 17, 19, 20 beyond one sentence and a link. Net after the FIX sequence: about -500 words.

## Claims to verify

30 claims sampled; basis on each.

| # | Claim (line) | Basis | Result |
|---|---|---|---|
| 1 | `NG0100` `_StaleBoard` text (2225) | run | match (abridged, F-5) |
| 2 | `NG0100` exhaustive `'0'` to `'3'` (574) | run | match |
| 3 | `NG0908` Zone.js required | run | match |
| 4 | `NG0914` warning with `NoopNgZone` | run | match |
| 5 | `NG0103` text and limits 10 and 100 | package source | match |
| 6 | 9 Output answers | run | match |
| 7 | Eager root throws on idle tick, OnPush silent (1684) | run | match |
| 8 | Docs sentence attribution (1684) | docs | slip (F-7) |
| 9 | "suggests that state is updated ..." (1882) | docs | paraphrase (F-1) |
| 10 | Zone era "every event refreshed everything" (440) | read and docs | overclaimed (F-2) |
| 11 | "scope and bookkeeping, not time" (1717) | read | unmeasured (F-4) |
| 12 | Zoneless default attached to the function (60) | docs | slip (F-6) |
| 13 | Eager [Added in v21.2] | docs (CHANGELOG), typings | match |
| 14 | OnPush default [Changed in v22.0] | docs | match |
| 15 | `provideZonelessChangeDetection` stable 20.2, default 21.0 | docs | match |
| 16 | `PendingTasks` stable 20.0, `run` dev preview 19.0, `pendingUntilEvent` dev preview 20.0 | typings, docs | match |
| 17 | `provideCheckNoChangesConfig` dev preview 20.0 | typings | match |
| 18 | `provideStabilityDebugging` 21.1, `enableProfiling` stable 21.0 | docs | match |
| 19 | `ignoreChangesOutsideZone` removed 21.0, `useNgZoneOnStable` removed 20.0 | docs | match |
| 20 | `checkNoChanges` removed 22.0 | docs | match |
| 21 | LView flags 16, 64, 128, 1024, 8192 at tag v22.2.1 | package source and repo tag | match |
| 22 | `markViewDirty`, `markAncestorsForTraversal`, `synchronize`, `synchronizeOnce`, `notify`, `shouldScheduleTick` behavior | package source | match |
| 23 | `scheduleCallbackWithRafRace` and microtask scheduling | package source | match |
| 24 | zone.js peer range "~0.15.0 || ~0.16.0", optional | package source | match |
| 25 | `migrations.json` 8 entries, all 22.0.0 | package source | match |
| 26 | Hibernate 7.4 guide quotes | docs | match |
| 27 | Render-hook registration is a trigger (consistent with M20 F-1) | package source | match |
| 28 | 9 Mermaid diagrams parse | run | match |
| 29 | 48 cited test names exist | script | match |
| 30 | Q17.02 parenthetical (module 17, 789) | run | wrong (F-8) |

## Proposed FIX tasks

Ceilings: the module is 21,057 prose words (module-stats and the Python count agree); CLOSE limit 21,250; ceiling 22,150. The sequence nets about -500 words. FIX-M21-01 trims first.

### FIX-M21-01 · S · Trim the named retelling (T-7)
- Files: `modules/21-change-detection.md`.
- Do: shorten the Full explanation of the questions listed in T-7 to what the section does not already say, link the section for the rest. Keep every cited test name, diagram, cause clause and Output answer; keep each answer at least 165 words.
- Acceptance: common rules; prose count at most 21,057 - 650 = 20,407 (both counters).

### FIX-M21-02 · S · Correct the factual slips (F-1 to F-7)
- Files: `modules/21-change-detection.md`.
- Do: F-1 line 1882; F-2 line 440 (and §1 line 119 if it repeats it); F-3 line 1599; F-4 line 1717; F-5 line 2225; F-6 line 60; F-7 line 1684 (line numbers move after FIX-M21-01: find by text).
- Acceptance: common rules; `grep -c "function\.:"` is 0; the 88 tests pass; prose at most +30 over the count measured just before.

### FIX-M21-03 · S · Markers, glosses, excerpts, §9 clause, observation (T-1 to T-6)
- Files: `modules/21-change-detection.md`; `_meta/GLOSSARY-TERMS.md` (`## Module 21`, new terms only); optionally one `Section 9:` test and `SOURCES.md` count.
- Do: T-1 `PendingTasks` marker at its first mention; T-2 glosses and correct the Ex 21.2 hint links (17 §8 for `toSignal`); T-3 show the helper or printing member in the named snippets; T-4 Ex 21.6 criterion text aligned with the test title (or the title), Ex 21.3 and 21.1 wording; T-5 one clause in §9 and Q21.32 linking 20 §7; T-6 one sentence in §9 or §8.
- Acceptance: common rules; `check-snippets . 21` exits 0; prose at most +150 over the count measured just before.

### FIX-M21-04 · S · Q17.02 fix in module 17 (F-8; +0 words)
- Files: `modules/17-signals.md` (edit allowed only by this task).
- Do: at the Q17.02 short answer (about line 789) cut the parenthetical or reword it: an idle tick refreshes nothing, and the development check throws `NG0100` for an Eager root (link `21-change-detection.md#q21-23`).
- Acceptance: `check-links --planned` exits 0; module 17 word count not above its current count; no other text changes.

### FIX-M21-05 · S · Anchors for file-level links (T-8; +0 words)
- Files: `modules/03-*.md`, `04-*.md`, `12-*.md`, `13-*.md`, `14-*.md`, `15-*.md`, `17-signals.md`, `18-*.md`, `19-*.md` (link targets only).
- Do: apply the table in Handoffs (verify each heading anchor in module 21 first, after FIX-M21-01 to 03). Stay file-level: the header, "Read next" and "Uses later" lines listed there. Module 20 needs none.
- Acceptance: `check-links --planned` exits 0; word count of every file touched unchanged; no other text changes.

Common rules for each task: from `labs/angular` run `npx ng test --watch=false --include='src/app/modules/21-change-detection/**/*.spec.ts'` and `npx tsc -p tsconfig.spec.json --noEmit`; `check-links --planned` and `check-snippets . 21` exit 0; cited `Section N:`, `Q21.NN` and `E21.N` names unchanged; the 9 Output answers unchanged; prose count at or under 22,150.

After the five tasks: about 21,057 - 650 + 30 + 150 = 20,587, hard stop 22,150.


Scratch deleted: yes. `/Users/jorge.quintero/.claude/jobs/1324502a/tmp/review-m21/` was removed with an absolute path (the `lab` node_modules symlink removed first, not followed); no server was left running; `labs/angular/.angular/` and `labs/angular/dist/` are covered by the lab's `.gitignore`.
