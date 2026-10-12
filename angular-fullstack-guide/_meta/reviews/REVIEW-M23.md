# REVIEW-M23: `modules/23-rxjs-in-depth.md`

- **Reviewer:** subagent, model claude-opus-5-5, session S20261010-0916-claudecode. The module was written by PLAN-M23 and SEC-M23-01..06 (S20261009-1938-claudecode, claude-opus-5-5) and by SEC-M23-07..10, EX-M23-01..06, QB-M23-01..08 and CLOSE-M23 (S20261010-0616-claudecode, claude-sonnet-5-5), per the `Done by` fields. The reviewer wrote no module-23 task, so it is eligible.
- **Date:** 2026-10-10
- **Files read:** `modules/23-rxjs-in-depth.md` (all 2,719 lines, read end to end; every line number below comes from that read); `_meta/RUN.md` §1, §5, §6, §7, §10; `_meta/QUALITY-BAR.md`; `_meta/TASKS.md` (REVIEW-M23, REVIEW-M22, the module-23 common rules); `_meta/reviews/REVIEW-M22.md` (format model); `_meta/modules/M23.md` (plan, F1-F33, C1-C13, owner map, breadth gate); `SOURCES.md` (Module 23 and the Module 13 block, see F-6); `_meta/LOG.md` (the M23 lines); the lab folder `labs/angular/src/app/modules/23-rxjs-in-depth/` (ten `concepts/` specs, `outputs/q23-outputs.spec.ts`, six exercise folders, `legacy/deprecated-forms.ts`); the installed `rxjs` 7.8.2 (`dist/esm/internal/**`, `dist/types/internal/**`, `CHANGELOG.md`), `@angular/core` 22.2.1 (`fesm2022/rxjs-interop.mjs`, `fesm2022/_resource-chunk.mjs`, `types/rxjs-interop.d.ts`) and `@angular/common` 22.2.1 (`fesm2022/_module-chunk.mjs`, `fesm2022/http-testing.mjs`); `rxjs` 5.5.12, 6.3.3, 6.4.0, 6.6.7, 7.0.0, 7.0.1, 7.1.0, 7.2.0, 7.3.0, 7.4.0, 7.5.0, 7.5.4, 7.5.5 and 7.6.0 (`npm pack`, typings); the RxJS `7.x` docs `guide/scheduler.md` and `guide/testing/marble-testing.md` and the Angular `main` docs `adev/src/content/ecosystem/rxjs-interop/signals-interop.md` (all fetched 2026-10-10 from `raw.githubusercontent.com`).
- **What was run** (Node 24.21.0, `export PATH=/opt/homebrew/opt/node@24/bin:$PATH`, one check at a time): from `labs/angular`, `npx ng test --watch=false --include='src/app/modules/23-rxjs-in-depth/**/*.spec.ts'` (17 files, 129 tests, all passed, no `NG8011`); `npx tsc -p tsconfig.spec.json --noEmit` (exit 0); `npx ng build` (exit 0; `tsconfig.app.json` includes `src/**/*.ts` minus specs, so it compiles `legacy/deprecated-forms.ts`, `exercise-4-leak-proof/legacy/leaky-widget.ts` and every exercise source); from the guide root, `node labs/tools/check-links.mjs --planned` ("All links resolve.", 470 planned links, exit 0); `node labs/tools/check-snippets.mjs . 23` ("All snippets check out.", exit 0); `node labs/tools/module-stats.mjs` (row 23: 36 Q, 6 Ex, 22,169 prose words, Output 15, Concept 6, Difference 5, Design 4, Bug hunt 3, Trade-off 3, no flags) and the QUALITY-BAR Python count (22,169, the same); the Mermaid parser (mermaid 11.12.0 under jsdom 26.1.0, installed in the scratch directory): 10 of 10 diagrams parse. Scripts (read-only): cited-test-name check (78 cited `Section N:` names against the spec titles), exercise criteria against `it()` titles (six exercises), D1 anatomy counts, answer word counts and follow-up counts, `[Q23.NN](#q23-NN)` link-ID match, first-body-mention scan for every status marker, `grep` of every internal name in the file the module names, URL scan, SOURCES block extraction, link-context extraction for every link to 23 in modules 04, 14, 16, 17, 19, 20, 21, 22.
- **Basis of each finding:** stated on the finding as **run** (executed), **package source** (read in the installed or an npm-packed version), **docs** (RxJS 7.x docs, Angular `main` docs, CHANGELOG) or **read** (read in the module, the labs or SOURCES, nothing executed).
- **Probe files:** only under `/Users/jorge.quintero/.claude/jobs/1324502a/tmp/review-m23/` (logs, packed rxjs tarballs, fetched docs, Mermaid install, scripts); deleted at the end (last line of this file). No probe spec was needed: every runtime claim checked is asserted by an existing spec, and the 129-test run reproduces them.

Overall: a strong, honest module with no Fail and no Major finding. Everything quoted from a run reproduced: all 15 *Output* answers equal their `toEqual`/`toBe` assertions (run), all 78 cited `Section N:` names exist exactly, the criteria of Exercises 23.1-23.6 equal their test titles word for word, every offered alternative (`allFormFlows`, `TableBackoffLoader`, `ShareConfigCache`, `RefCountWidget`, `typeaheadFilterFirst`, `RepeatStatusPoller`) runs through the same tests, the mutation counts of Exercises 23.4-23.6 are recorded in LOG, every status marker's version traces to the typings of an npm-packed version or a CHANGELOG heading, every internal name "read from the source" is found by `grep` in the file named, the Angular markers equal modules 17, 20 and 21, and the two docs quotes are verbatim. The weak points are small: five markers sit later than the first body mention (F-1); one link sends `takeUntil` to the retry section (F-2); a "no result before 14" slip (F-3); the §9 internal names are not marked internal (F-4); two "may change in RxJS 9" forward claims (F-5); the §10 SOURCES lines landed under Module 13's heading and the `guide/scheduler.md` read has no line (F-6); Q23.26 has one follow-up (T-1); two snippets call hidden helpers (T-2); a few first-use terms (T-3); small wording and Connections nits (T-4, T-5); about 270 words of answer-to-section retelling (T-6); and anchors for 30 file-level links in 8 modules (T-7). Net after the proposed tasks: about -90 words from 22,169, far under the 23,220 ceiling.

---

## QUALITY-BAR

Counts: **41 Pass, 4 Partial, 0 Fail, 0 N/A** (45 items). Items not Pass: B9, C4, C8, D1.

| ID | Result | Evidence |
|---|---|---|
| A1 | Pass | Header lines 3-9 in STYLE-GUIDE §4.1 order (What this covers, Prerequisites, Leads to, Applies to, Study time, Short on time, Labs with the run command). I ran the command: 17 files, 129 tests passed. |
| A2 | Pass | Prerequisites (line 4) link 22 §5, §3, §8 and 17 §8 with anchors; all resolve (link check). |
| A3 | Pass | Short on time (line 8): four section links, six question IDs (Q23.03, 06, 11, 17, 20, 23), Exercise 23.1 and the Summary; every link resolves. |
| A4 | Pass | Contents (13-27) list the ten sections and the five closing sections; `## ` headings at 31, 139, 233, 326, 417, 518, 615, 713, 801, 885, Summary 958, Question bank 966, Hands-on exercises 2210, Check your understanding 2657, Connections 2715. |
| A5 | Pass | Flattening, choosing, errors, retry, multicasting, unsubscription, interop, patterns, schedulers, then testing with virtual time (the deepest: the providers swap of §9's classes). Forward links (`finalize` in §1 to §3, marble writing to §10) are labelled. |
| B1 | Pass | Script: each of the six subsection headings appears 10 times; `#### Legacy` 8 times (§1, 3, 4, 5, 6, 7, 8, 9, as required). |
| B2 | Pass | Read: each problem opens with a failure (stale results from a nested subscribe, a double payment, a dead typeahead, a hammered server, a ticker that stays connected, a component that keeps receiving, NG0601 in a running page, polls that cancel each other, an unpredicted order, an off-by-one marble). |
| B3 | Pass | 10 `mermaid` blocks, 10 `What to notice` lines; 10 of 10 parse under mermaid 11.12.0 (run); none rendered in a browser. |
| B4 | Pass | Read: each section answers a "why" from a source read with file and function (`mergeInternals`, `switchMap.js`, `catchError.js` `syncUnsub`, `finalize.js`, `retry.js`, `share.js` `handleReset`, `takeUntil.js`, `rxjs-interop.mjs` `toSignal`/`toObservable`/`rxResource`, `repeat.js`, `race.js`, the scheduler actions, `TestScheduler.run`, `VirtualTimeScheduler.flush`); all found by `grep` (module-specific checks). |
| B5 | Pass | Read: every `### Code` has an approach sentence and numbered steps. The hidden-helper snippets are T-2. |
| B6 | Pass | Read: every best-practice item (39) has a "because". |
| B7 | Pass | Read: all 42 Misconceptions bullets carry a cause clause; the one history bullet (§3, 322) cites the 6.6.7 typings. |
| B8 | Pass | *Framework vs platform* callouts at §2 (213), §6 (596), §9 (847); `[!WARNING]` at §3 (307), §5 (498), §10 (924). No *Coming from the backend* is required (C8) and none is written. |
| B9 | Partial | Defined at first use: higher-order Observable, flattening operator, marble, frame, `defer`, `finalize`, `ObservableInput`, race condition, idempotent, abort, accumulator, terminal notification, fallback, rethrow, error factory, assembly, backoff, notifier, jitter, reference count, connector, grace period, stale data, leak, `DestroyRef`, injection context, state/event, starvation, stale-while-revalidate, scheduler, trampolined, microtask, macrotask, virtual time, time progression, subscription point. Not glossed or used before the definition: T-3. |
| B10 | Pass | Read: the 22/23 split and the 20/23 split hold (module-specific checks). Inside-module retelling is T-6. |
| C1 | Pass | 26 claims sampled (table below); 25 match; one wording slip (F-3). |
| C2 | Pass | 15 *Output* questions (Q23.02, 04, 07, 11, 12, 14, 17, 18, 21, 24, 25, 26, 27, 32, 35), each with a test named after its ID in `outputs/q23-outputs.spec.ts` asserting exactly the printed result, follow-up values included (cross-check below). |
| C3 | Pass | Script: 78 cited `Section N:` names, 0 missing; the 91 spec titles include 13 `describe` names and 4 uncited `Section 10` tests. Every "observed" sentence names a test or says "read, not run". |
| C4 | Partial | Every marker present is right (list below), but five sit after the first body mention: F-1. |
| C5 | Pass | `ng test`, `tsc` and `ng build` exit 0; every Angular API in a snippet is in the 22.2.1 typings. |
| C6 | Pass | Grep: 0 `Unverified`, `TASK:`, placeholder or relink markers. |
| C7 | Pass | `check-snippets.mjs . 23` exit 0. |
| C8 | Partial | The module has no URL. SOURCES Module 23 covers the package reads, the packed versions, the Angular docs, the six exercises and the outputs spec, but the three §10 lines sit under Module 13's heading and the `guide/scheduler.md` read behind §9 (845, 880, Q23.31) has no line: F-6. |
| D1 | Partial | Script: 36 each of `### Q`, Short answer, Full explanation, Follow-ups, Trap to avoid; answers average 212 words (min 165 Q23.11, max 246 Q23.09). Q23.26 has one follow-up, the bar asks for at least two: T-1. |
| D2 | Pass | Read: every Output short answer gives the result and the reason. |
| D3 | Pass | module-stats: Output 15, Concept 6, Difference 5, Design 4, Bug hunt 3, Trade-off 3 (largest 42%); equals the plan. |
| D4 | Pass | Titles follow the sections (Q23.01-05 §1 to Q23.34-36 §10). |
| D5 | Pass | Overlaps are linked follow-ups (Q02.19, Q04.16, Q04.24, Q14.27, Q17.26, Q17.37, Q17.40, Q20.15, Q21.20, Q22.30, Q22.33; each heading checked). |
| D6 | Pass | Script: every Q23.NN is linked from the body; all 51 `[Q23.NN](#q23-NN)` links carry the matching ID; each section ends "Drilled in …". |
| D7 | Pass | 36 `<a id="q23-NN">` lines, unique; link check passes. |
| D8 | Pass | 36 questions (ceiling 38), 6 exercises (ceiling 6). |
| E1 | Pass | Each exercise has Problem, Constraints (with "Not covered"), Acceptance criteria, two hints, Worked solution with criterion account, Alternative with Trade-offs, two or three follow-ups and a Tests link. |
| E2 | Pass | Script: criteria of Ex 23.1 (5), 23.2 (6), 23.3 (6), 23.4 (4), 23.5 (6), 23.6 (6) equal the `it()` titles exactly (modulo backticks). |
| E3 | Pass | From one operator per flow (23.1) to a dashboard that pauses, retries, shares and stops (23.6). |
| E4 | Pass | 129 tests pass; read: at most 3 `inject(` per class, no `any`, no `vi`/`expect` in non-spec files. |
| E5 | Pass | 15 Output questions; exercise specs assert marbles and value logs. |
| F1 | Pass | Summary (960-964): three paragraphs, each section's claim and trap with a section link; nothing new. |
| F2 | Pass | Four explain-back prompts naming a listener (2660-2663). |
| F3 | Pass | Eight flashcards. |
| F4 | Pass | Builds on, Read next and Uses later (2717-2719), all links resolve; "Uses later" gives a reason only for 29 (T-5, nit). |
| G1 | Pass | 22,169 prose words (both counters), under the CLOSE limit 22,320 and the ceiling 23,220; sections 799-969; about 270 words of retelling (T-6). |
| G2 | Pass | 9 of 9 breadth rows covered (table below). |
| H1 | Pass | `ng test` 17 files 129 tests, `tsc -p tsconfig.spec.json --noEmit`, `ng build`: all exit 0. |
| H2 | Pass | `check-links.mjs --planned`: "All links resolve." |
| H3 | Pass | `git status`: the module-23 lab folder is new and untracked; `labs/angular/package.json` differs only by the earlier `zone.js` 0.16.3 ruling; no `labs/ts-js/src/modules/23-*`; `dist` and `.angular` are gitignored. |

---

## Module-specific checks (REVIEW-M23 entry)

| Check | Result | Evidence |
|---|---|---|
| Every recorded frame table, subscription count and order (F1-F33) against a re-run on `rxjs` 7.8.2 and Angular 22.2.1 under `ng test` | Pass | run: the 129-test run asserts every table quoted (§1 rows, §2 race/submit/save, §3 placement and `finalize` orders, §4 retry/repeat frames and counts, §5 `shareReplay` and grace-period logs, §6 strategies and placement, §7 interop, §8 patterns, §9 orders, §10 marbles) and the prose numbers match the spec literals (spot-read: `s@3 s@13`, `saved:a@3 saved:b@7`, `R:err@33`, `r1@7 r3@17`, `sub1 fin1 sub2` in §7 and `sub1 fin1 sub2 fin2` in Q23.26, two different tests). |
| The four-operator frames of F1, when each result completes and when `finalize` runs | Pass | run: `Q23.02` and `Section 1: switchMap, mergeMap, concatMap and exhaustMap on one outer stream`; package source: `switchMap.js`/`exhaustMap.js` complete in the inner's complete callback (before its teardown), `mergeInternals` in `onFinalize`, which `OperatorSubscriber.unsubscribe` calls after `super.unsubscribe()`: hence `C@14 finc@14` against `finc@14 C@14` (79). |
| Every status marker against the CHANGELOG, the typings and the packed older typings, at the first body mention; `flatMap` unversioned; no marker on `publishReplay` | Pass for versions, Partial for position | package source and CHANGELOG: result selector v6.0 (6.0.0 typings per SOURCES); `exhaust` v7.0 (CHANGELOG 7.0.0-beta.11); `switchScan` v7.0 (absent in 6.6.7, present in 7.0.0; CHANGELOG 7.0.0-beta.8); `onErrorResumeNextWith` v7.6 (CHANGELOG 7.6.0; in the 7.6.0 index, not 7.5.0); `throwError(value)` v7.0 (no tag in 6.6.7, tag in 7.0.0); `retry` `delay` v7.3 (absent in 7.2.0, present in 7.3.0; CHANGELOG 7.3.0); `resetOnSuccess` v7.0 (absent in 6.6.7, present in 7.0.0); `repeat` `delay` v7.5 (absent in 7.4.0, present in 7.5.0; CHANGELOG 7.5.0); `retryWhen`/`repeatWhen` v7.5.5 (no tag in 7.5.4, tag in 7.5.5); `refCount` v6.4 (absent in 6.3.3, present in 6.4.0; CHANGELOG 6.4.0); `connect`, `ShareConfig` v7.0 (CHANGELOG 7.0.0-beta.10); reset functions v7.1 (`boolean` in 7.0.0, `boolean \| (() => Observable)` in 7.1.0; CHANGELOG 7.1.0); `Subject.observed` v7.1 (absent in 7.0.1, present in 7.1.0; CHANGELOG line under 7.1.0); `timeoutWith` v7.0 (7.0.0 typings); scheduler argument and `scheduled` v6.5 (CHANGELOG 6.5.0); `animate`, `toEqual` v7.0 (CHANGELOG 7.0.0-beta.4, beta.10). `flatMap` (117) has no version; `publishReplay` (496) no marker. Positions: F-1. |
| Angular markers equal modules 17, 20 and 21 (F31) | Pass | read and package source: `toSignal`/`toObservable` `[Stable since v20.0]` (17:644), `rxResource` `[Stable since v22.0]`, `takeUntilDestroyed` `[Stable since v19.0]` (20), `pendingUntilEvent` `[Developer preview since v20.0]` (21); `outputToObservable`/`outputFromObservable` v19.0 match `@publicApi 19.0` in `types/rxjs-interop.d.ts`. |
| No RxJS 9, rationale or roadmap claim (C9) | Pass, one wording nit | read: no rationale or roadmap claim; Q23.33 says the typings and CHANGELOG give no reason. "may change in RxJS 9" at 836 and 925 is a forward claim with no source: F-5. |
| `HttpClient` cancellation worded from `cancelled` plus the backend source read (C5) | Pass | package source: `HttpClientTestingBackend.handle` teardown `_cancelled = true` (`http-testing.mjs`), `Cannot flush a cancelled request.`; `FetchBackend` `if (!done && !aborter.signal.aborted) aborter.abort()`, `HttpXhrBackend` `if (xhr.readyState !== xhr.DONE) xhr.abort()` (`_module-chunk.mjs`); 182, 214, 1174-1176 say "not observed", "read, not run in a browser". |
| Browser scheduling, visibility and rAF documented only; the jsdom order not generalized (C4) | Pass | read: 740, 829 ("jsdom order"), 841, 1992, 2040, 2094. |
| No memory or performance measurement claimed (C3) | Pass | read: 462 "Memory is not measured here", 555, 1694, 2493. |
| `pendingUntilEvent` not described as observed (C2) | Pass | read: 649 "source only, not observed", 1910 "not run". |
| Angular docs quote verbatim with branch and date; the `toObservable` sentence reconciled with a test (C1, C12) | Pass | docs: `signals-interop.md` on `main` line 114, fetched 2026-10-10, verbatim; `Section 7: a late toObservable subscriber receives the replayed value` and `Q23.25` (`late: [4]`) reconcile it (645, 1827). |
| Stale RxJS scheduler docs lines not repeated (C6) | Pass | docs: `guide/scheduler.md` (7.x) line 119 says "For operators returning a potentially large or infinite number of messages, `queue` Scheduler is used"; the module states the disagreement with the source grep (845, 880, 2044) and never repeats it as fact. Its SOURCES line is missing: F-6. |
| The non-terminating flush not worded as observed (C10) | Pass | read: 920 "(read, not run)", and a test bounds the source with `'-----!'`. |
| Every internal name of C13 marked internal at first use in each section and found by `grep` | Partial | package source: all found (`mergeInternals`, `innerFrom`, `createOperatorSubscriber`, `executeSchedule`, `AsyncAction`, `AsapAction`, `QueueAction`, `AnimationFrameAction`, `intervalProvider`, `immediateProvider`, `Immediate`, `animationFrameProvider`, `delegate`, `VirtualTimeScheduler.flush`, `runMode`, `createAnimator`, `handleReset`, `cancelReset`, `raceInit`, `resubscribe`, `RuntimeError(953`, `ResourceImpl`, `extRequest`). Marked in §1, §2, §4, §5 (`handleReset`), §7, §8; in §9 `intervalProvider`, `immediateProvider`, `animationFrameProvider`, `AnimationFrameAction`, `executeSchedule` are not marked (836 lists only four classes); in §10 the WARNING (925) comes after the first use (916); `cancelReset` (458) unmarked: F-4. |
| The 22/23 split and the 20/23 split | Pass | read: `share()` defaults one sentence and a link (425); `race`/`concat`/`merge` linked to 22 §7 (736, 2022); debounce versus throttle to Q02.19 and Q22.30 (736, 1960); the `takeUntilDestroyed` mechanism to 20 §5 and Q20.15 (544, 1627, 1680), the strategies compared here. |
| Owner credit correct in every link sentence | Pass, one nit | read: `takeUntilDestroyed` 20's, `toSignal` basics 17's, `async` pipe 14's, `resource` 17's, `PendingTasks` 21's, `HttpClient` 27's, leaks in general 05's. Ex 23.4 step 1 (2459) links `toSignal` ending with the component to 20 §5 (T-4). |
| Output short answers give the reason (T-2) | Pass | read: all 15. |
| Every question link points at the intended ID (T-1) | Pass | script: 51 `[Q23.NN](#q23-NN)` links, IDs match; read: each section's problem links the questions on that topic. One section link is wrong: F-2. |
| Q02.19 linked where debounce appears (T-8) | Pass | 736 (§8), 1960 (Q23.27). |
| Terms defined at first use | Partial | T-3. |
| SOURCES has the code-source lines for the six exercises and the outputs spec and the package, typings, CHANGELOG and docs reads | Partial | read: six exercise lines and the outputs spec lines present (Module 23, 30-41); the §10 package, docs and code lines are under Module 13 (SOURCES 865-867) and `guide/scheduler.md` is absent: F-6. |
| Every anchored cross-module link resolves and none is bare | Pass | run (link check); bare file links only in the header, Connections and to unwritten modules (24, 25, 27, 28, 29, 31, 32, 43). |
| Sections 1, 3, 4, 5, 6, 7, 8 and 9 have a `#### Legacy` subsection with a migration path | Pass | 114, 302, 396, 494, 592, 680, 781, 866, each naming the current form. |
| All ten Mermaid diagrams parse | Pass | run: 10 of 10. |
| The five required callouts (§2 NOTE, §3 WARNING, §5 WARNING, §9 NOTE, §10 WARNING) | Pass | 213, 307, 498, 847, 924. |
| Every Misconceptions bullet has a cause clause | Pass | 42 of 42. |
| Every "in the lab" claim names an existing test; no unrecorded run or unmeasured comparison (T-6) | Pass, one nit | script: 78 cited names exist; the mutation counts (2486, 2488, 2566, 2645, 2650-2651) are in LOG (EX-M23-04..06). "at the cost of more lines" (2420) is unmeasured (T-4). |
| Every exercise criterion equals its test title; every offered alternative passes | Pass | script and run: E2 row; each alternative is in the spec's `FLOW_SETS`, `LOADERS`, `CACHES`, `FIXED`, `PIPELINES` or `POLLERS` loop. |
| Type mix and the Output tests (Output 15, Concept 6, Difference 5, Design 4, Bug hunt 3, Trade-off 3) | Pass | module-stats equals; 15 Output tests. |
| Answers and sections reach the pilot's depth (G1, no filler, no retelling) | Pass | G1 row; retelling T-6. |
| `ng build` compiles `legacy/deprecated-forms.ts` and the exercise sources; no non-spec file uses `vi` or `expect` | Pass | run and read: build exit 0; `grep` of non-spec `.ts` files finds no `vi.` or `expect(`. |
| Module 22's lab files unchanged | Pass | read: the newest file in `22-rxjs-foundations/` is dated 2026-10-09 20:03 (FIX-M22-02), before the first module-23 file (22:51). |
| No file under `labs/ts-js` and no `package.json` change | Pass | `labs/ts-js/src/modules` has no `23-*`; the `package.json` diff is the `zone.js` ruling only. |
| Anchors for the file-level links to 23 in 04, 14, 16, 17, 19, 20, 21, 22 | Done | Handoffs table (30 anchors; header, "Read next", "Uses later" and multi-topic lines stay file-level). |
| No FIX takes the module past 23,220 without cutting as much as it adds | Pass | The proposed tasks net about -90 words from 22,169. |

## Handoffs

Topics that belong to other modules and are only linked: the contract, cold and hot, `share()` defaults, Subjects, combination and timing (22 §2-§8); the `takeUntilDestroyed` mechanism and NG0203 (20 §5, Q20.15); the `async` pipe (14 §8, Q14.27); `toSignal` basics, resources, effects (17 §4, §6, §8; Q17.26, Q17.37, Q17.40); `PendingTasks` (21 §5, Q21.20); `AbortController` (04 §7, Q04.24, Exercise 04.3); leaks in general (05 §4); `HttpClient` (27); async testing (29).

Module 23 slugs: S1 `#1-higher-order-observables-switchmap-mergemap-concatmap-and-exhaustmap`; S2 `#2-choosing-a-flattening-operator-races-lost-writes-cancellation-and-recursion`; S3 `#3-errors-catcherror-placement-finalize-and-error-versus-complete`; S4 `#4-retrying-and-repeating-retry-with-backoff-and-repeat`; S5 `#5-multicasting-in-depth-share-configuration-sharereplay-and-connect`; S6 `#6-unsubscription-strategies-in-angular-and-finding-leaks`; S7 `#7-rxjs-and-signals-decision-rules-tosignal-toobservable-and-rxresource`; S8 `#8-angular-patterns-typeahead-polling-cache-then-network-and-racing-requests`; S9 `#9-schedulers-queue-asap-async-and-animation-frame-observeon-and-subscribeon`; S10 `#10-testing-with-testscheduler-marble-syntax-and-virtual-time-under-the-hood`; questions `#q23-NN`.

| File:line | Context | Anchor |
|---|---|---|
| 04:459 | `HttpClient` turns the unsubscribed inner into an aborted call | S2 |
| 04:1216 | cancellation as unsubscription, `HttpClient` aborts | S2 |
| 04:1515 | `mergeMap(fn, concurrency)` is the same pool | S1 |
| 04:1557 | `retry({ count, delay })` | S4 |
| 04:1615 | `switchMap` or a `resource` cancel the previous request | S2 |
| 04:1619 | `exhaustMap`, `concatMap`, `latestOnly` is `switchMap` | S2 |
| 14:825 | 23 covers sharing a stream | S5 |
| 16:829 | `takeUntilDestroyed` is 20 §5's and 23's | S6 |
| 17:109 | when to use each, Module 23 | S7 |
| 17:642 | `@angular/core/rxjs-interop`, Module 23 | S7 |
| 17:668 | the full decision rules and the typeahead case | S7 |
| 17:777 | event streams and time-based logic | S7 |
| 17:1499 | `exhaustMap` or `concatMap` express the intent | S2 |
| 17:1808 | deeper interop questions | S7 |
| 17:2272 | the signals-versus-RxJS decision for typeaheads | `#q23-28` |
| 19:1855 | `outputToObservable` | S7 |
| 20:556 | the strategies compared | S6 |
| 20:1465 | the strategies compared | S6 |
| 20:2114 | RxJS streams and the strategies compared | S6 |
| 20:2172 | what `takeUntilDestroyed` would add | S6 |
| 21:2308 | subscribe with `takeUntilDestroyed` and write a signal | S6 |
| 21:2391 | `auditTime(25)` before `toSignal` | S7 |
| 22:83 | interop table row | S7 |
| 22:174, 22:1206, 22:2289 | recovery | S3 |
| 22:273, 22:306, 22:1381, 22:2094, 22:2523 | `shareReplay`, `ShareConfig`, reset flags | S5 |
| 22:544, 22:1742, 22:2375 | higher-order mapping, `switchMap` | S1 |
| 22:665 | writing marble tests | S10 |
| 22:787 | choosing another scheduler | S9 |
| 22:825, 22:2054 | the typeahead pipeline, the search pipeline | S8 |
| 22:2440 | mapping each term to a cancellable request | S2 |
| 22:2451 | error recovery and retry | S4 |

Stay file-level: 04:1700, 14:2206, 17:5, 17:2431, 20:5, 20:2234, 22:5, 22:930 (several topics), 22:2109 and 22:2300 ("schedulers, error recovery"), 22:2592, 22:2593. Verify each line and heading at FIX time.

## Factual findings

**F-1 · Minor (C4) · Five markers sit after the first body mention (basis: read, script).** `toSignal` first appears at 526 (§6 mental model; also 544, 579) and gets `[Stable since v20.0]` at 623 (§7); `takeUntilDestroyed` first appears at 526, marked at 544; `toObservable` first at 619, marked at 623; `switchScan` and `mergeScan` first at 154, marked at 184, where "`mergeScan` and `switchScan` [Added in v7.0]" can read as dating `mergeScan`, which the 6.3.3 and 6.6.7 packages already ship (`internal/operators/mergeScan.d.ts`); `scheduled` first at 856, marked at 868. Fix: move each marker to its first body mention (526 for `toSignal` and `takeUntilDestroyed`, 619 for `toObservable`, 154 for `switchScan` only, 856 for `scheduled`) and remove it from the later spot; at 184 write "`mergeScan` and `switchScan`" with no marker. +0 words.

**F-2 · Minor (D6-like) · `takeUntil` linked to the retry section (basis: read).** 544: "`takeUntilDestroyed` [Stable since v19.0] is `takeUntil` over a `DestroyRef.onDestroy` notifier (`[section 4](#4-retrying-and-repeating-retry-with-backoff-and-repeat)`)". Section 4 is retry and repeat. Fix: link [22 §6](22-rxjs-foundations.md#6-the-operator-catalogue-creation-transformation-filtering-utility-conditional-and-aggregation) (the filter) or drop the link (the placement paragraph follows at 546). +0 words.

**F-3 · Nit · "no result before 14" (basis: run, read).** 77: "The outer completed at 12, no result before 14". `c2@13` is a result before 14; the claim is about completion (`C@14`). Fix: "no completion before 14". +0 words.

**F-4 · Minor (C13) · Internal names not marked internal at first use in §9, §10 and §5 (basis: package source, read).** 836 marks only `AsyncAction`, `AsapAction`, `QueueAction` and `Immediate`; `intervalProvider` (838), `immediateProvider` (839), `AnimationFrameAction` and `animationFrameProvider` (841), `executeSchedule` (842) are unmarked. In §10 the providers and `delegate` are first used at 903/916 and called internal only in the WARNING at 925. `cancelReset` (458) is unmarked. Q23.04's `fromPromise` (1081) and Q23.10's `Subscriber._error` (1242) are unmarked. Fix: extend the 836 parenthesis to the five names; add "(internal)" at 916; "the internal `cancelReset`" at 458; "(internal)" after `fromPromise` and `_error`. About +12 words.

**F-5 · Nit (C9) · A forward claim about RxJS 9 (basis: read).** 836 "may change in RxJS 9" and 925 "may change in RxJS 9": no source dates or describes RxJS 9. Fix: "may change in any release". +0 words.

**F-6 · Minor (C8) · SOURCES: §10 lines filed under Module 13, and the scheduler docs read missing (basis: read, docs).** `SOURCES.md` 865-867 (the `TestScheduler.js`/`VirtualTimeScheduler.js` read, the `marble-testing.md` read and "Section 10 code") sit inside `## Module 13 · Components and templates`, right after Module 13's "Section 9 code" line; the Module 23 block jumps from "Section 9 code" (its line 27) to the exercises, and its Q23.34-36 line says those reads are "already listed for section 10". The `7.x` `guide/scheduler.md` read behind 845, 880 and the Q23.31 follow-up has no line anywhere in SOURCES (fetched by this review: line 119, "For operators returning a potentially large or infinite number of messages, `queue` Scheduler is used"). Fix: move the three lines into Module 23 after its "Section 9 code" line; add a docs line for `docs_app/content/guide/scheduler.md`, branch `7.x`, fetched 2026-10-10, line 119 quoted, used in §9 and Q23.31.

## Teaching and completeness findings

**T-1 · Minor (D1).** Q23.26 (1909-1910) has one follow-up; the bar asks for at least two. Add one answered from an existing test, for example "*What does `value()` do in the error state?* It throws 'Resource is currently in an error state' (abridged), so read `error()` (`Section 7: rxResource unsubscribes the previous stream when params change`)", and drop the same sentence from the Full explanation (1907), so the net is about +10 words.

**T-2 · Minor (snippet quality, REVIEW-M22 T-4).** Two snippets call helpers they do not show. §9 Code (858-864) is four disjoint lines, two of them object-literal properties, calling `run`, `producer`, `delivery` and `start`, none shown; Q23.36 (2188-2193) calls `newScheduler()`. Fix: excerpt the `producer` and `run` helpers with the two `await run(...)` lines (verbatim, so `check-snippets` passes), and in Q23.36 show `newScheduler` or replace the line with the `new TestScheduler(...)` it wraps (only if verbatim in the spec). Nit, same family: Q23.17's printed `leaverRun` (1498) omits the spec's `lateFrame = 10` parameter that its own follow-up (1535) uses; add the parameter to the printed code (the intro at 968 says the snippet is the code the test runs).

**T-3 · Minor (B9).** First use without a gloss or owner link: `teardown` (79, link [22 §2](22-rxjs-foundations.md#2-anatomy-observable-observer-subscription-and-teardown)); `computed` (629, 638, link [17 §3](17-signals.md#3-computed-signals)); "stale-while-revalidate" used in §7 (708) before its definition in §8 (741), so define it at 708 or reword the bullet; `delegate` and "provider" (903, 916: "an object the schedulers call for timers and clocks"). About +30 words; add the terms to `_meta/GLOSSARY-TERMS.md` `## Module 23` if absent.

**T-4 · Nit.** Q23.28 (1974) "a new term unsubscribes the previous stream, (the `E23.5` test …)": doubled punctuation. Ex 23.3 (2420) "at the cost of more lines" is unmeasured: give the line counts of `ConfigCache.keep` and `ShareConfigCache.keep` or cut it. §8 (744) "Neither combination is run here; Exercise 23.5 builds both" reads as unrun while `E23.5` runs both; write "§8's specs run neither; the `E23.5` tests run both". Ex 23.4 step 1 (2459) links `toSignal`'s end to 20 §5; link `[section 6](#6-unsubscription-strategies-in-angular-and-finding-leaks)` or [17 §8](17-signals.md#8-interop-with-rxjs). Unlinked "(module 29)" at 919 and 2130: link [29](29-testing-angular.md).

**T-5 · Nit (F4).** Connections "Uses these ideas later" (2719) gives a reason only for 29; add a few words each for 24, 25, 27, 28, 31, 32, 43 (about +25 words), or accept, as REVIEW-M22 T-7 did.

**T-6 · Minor (G1, B10).** About 270 words of answer-to-section retelling, cuttable without losing a cited test, a cause clause, a "read from the source" pointer or an Output result: Q23.05 Short and Full (1097-1099) repeat §1's `mergeInternals` read (79), about 70; Q23.19 Full (1600) restates §5's reset rules (425, 447, 458), about 60; Q23.03 Full (1054) "Three rules are shared…" repeats §1 (77, 79), about 35; Q23.31 Full (2040) repeats §9's list (809-814, 838-841), about 40; Q23.34 Full (2126) repeats §10 (916, 919), about 35; Q23.12 Full (1346) repeats §3 (273), about 30. Keep each answer at least 160 words (the shortest is 165).

**T-7 · Minor (anchors).** See the Handoffs table: 30 file-level links to 23 in modules 04, 14, 16, 17, 19, 20, 21 and 22 get section or question anchors.

## Output answer cross-check

All 15 Output questions were compared with `outputs/q23-outputs.spec.ts` by reading each `it`: the four frame lines of Q23.02 and both follow-ups; `[30]`, `[10,20,30]` and the `concatMap`/`exhaustMap` follow-up arrays of Q23.04; the three lines and the `Cannot flush a cancelled request.` follow-up of Q23.07; both placements and both `EMPTY` follow-ups of Q23.11; the four `finalize` lines and the single `fin` of Q23.12; the subscription frames, the four notification lines and the fixed-delay follow-up of Q23.14; the two objects and both follow-ups of Q23.17 (`4@6` one subscription, `0@11` two); the two logs and both follow-ups of Q23.18; both objects of Q23.21, Q23.24, Q23.25 and Q23.26; both lines of Q23.27; the eleven lines of Q23.32; and the pass/throw pair of Q23.35. All equal; the 129-test run passes (run).

## SYLLABUS §4 coverage (module-23 checklist, 8 rows plus the ownership note)

| Row | Where | Status |
|---|---|---|
| Higher-order mapping: semantics, use cases, bugs from the wrong choice | §1, §2, Q23.01-09, Ex 23.1 | Covered |
| Error handling: `catchError` placement, `retry` with config and backoff, `finalize`, error versus complete | §3, §4, Q23.10-16, Ex 23.2 | Covered |
| Multicasting: `share` with config, `shareReplay` pitfalls | §5, Q23.17-19, Ex 23.3 | Covered (memory as mechanism, C3) |
| Schedulers and `observeOn`/`subscribeOn` | §9, Q23.31-33 | Covered |
| Unsubscription strategies and leak detection | §6, Q23.20-22, Ex 23.4 | Covered |
| Testing with `TestScheduler` and marbles | §10, Q23.34-36, Ex 23.1, 23.5 | Covered |
| RxJS versus signals; `toSignal`, `toObservable`, `rxResource` | §7, Q23.23-26, Ex 23.5 | Covered |
| Typeahead, polling, cache-then-network, race | §8, Q23.27-30, Ex 23.5, 23.6 | Covered |
| Ownership note (decision rules and typeahead trade-off here, Q17.37 linked) | §7, §8, Q23.23, Q23.24, Q23.28 | Covered |

## Redundancy

About 270 words retold, cuttable (T-6). No overlap with modules 04, 05, 14, 17, 20, 21, 22 beyond one sentence and a link. Net after the FIX sequence: about -90 words.

## Claims to verify

26 claims sampled; basis on each.

| # | Claim (line) | Basis | Result |
|---|---|---|---|
| 1 | 15 Output answers | run | match |
| 2 | 78 cited `Section N:` names | script | match |
| 3 | Criteria of Ex 23.1-23.6 equal test titles; alternatives run the same tests | script, read | match |
| 4 | `C@14 finc@14` against `finc@14 C@14`: complete callback against `onFinalize` (79) | package source (`switchMap.js`, `mergeInternals.js`, `OperatorSubscriber.js`) | match |
| 5 | `concatMap` is `mergeMap(project, 1)`; buffer unbounded (79, 133) | package source | match |
| 6 | `fromPromise` forwards only `if (!subscriber.closed)` (1081) | package source (`innerFrom.js`) | match |
| 7 | `HttpClientTestingBackend` teardown sets `_cancelled = true`; Fetch/XHR abort conditions (182, 214) | package source | match |
| 8 | `expand` is `mergeInternals` with the flag (184) | package source | match |
| 9 | `caught` is `catchError(selector)(source)`, `syncUnsub` (271) | package source | match |
| 10 | `finalize` adds the callback after subscribing (273); CHANGELOG 7.0.0-beta.1 quote | package source, CHANGELOG | match |
| 11 | `.catch`/`.finally` patched `Observable.prototype` in 5.5.12; `catchError`/`finalize` added in 5.5.0-beta.0 (305) | packed 5.5.12, CHANGELOG | match (the CHANGELOG says "lettable") |
| 12 | `throwError` "a more appropriate stack trace" (314) | typings 7.8.2 | match |
| 13 | `retry` `soFar++ < count`, `repeat` `++soFar < count` (1479) | package source | match |
| 14 | `retryWhen` passes the notifier's complete to the result (1479) | package source (`createOperatorSubscriber(subscriber, …)` with the default complete) | match |
| 15 | `shareReplay` is `share({ … resetOnRefCountZero: refCount })` (447) | package source | match |
| 16 | `refCount === 0 && !hasErrored && !hasCompleted` (1582) | package source (`share.js`) | match |
| 17 | `takeUntil` completes its subscriber on the notifier (553) | package source | match |
| 18 | `rxResource` unsubscribes on the abort signal; NG0991 and the error-state message (647) | package source, run (`Section 7` line 174 asserts the throw) | match |
| 19 | `toObservable` docs sentence (645) | docs (`main`, line 114) | verbatim |
| 20 | `race`: only `next` unsubscribes the others (742) | package source (`raceInit`) | match |
| 21 | Timing operators import `scheduler/async`; nothing imports `scheduler/queue` (838, 845) | package source (`grep`: only `index.js` re-exports `queue`) | match |
| 22 | 7.x docs say large sources use the queue scheduler (845, 880) | docs (`guide/scheduler.md` line 119) | match; no SOURCES line (F-6) |
| 23 | `TestScheduler.run` sets six providers, `maxFrames = Infinity`; flush loop condition (916-917) | package source | match |
| 24 | Marble docs quotes: "only be used to test code that uses RxJS schedulers", subtract one millisecond, Promise known issue (898, 919, 2126) | docs (`marble-testing.md` lines 9, 131, 259-265) | verbatim |
| 25 | Every status marker version (C4 row) | packed typings, CHANGELOG | match; positions F-1 |
| 26 | "no result before 14" (77) | run, read | slip (F-3) |

## Proposed FIX tasks

Ceilings: the module is 22,169 prose words (module-stats and the Python count agree); CLOSE limit 22,320; ceiling 23,220. The sequence nets about -90 words. FIX-M23-01 trims first.

### FIX-M23-01 · S · Trim the named retelling (T-6)
- Files: `modules/23-rxjs-in-depth.md`.
- Do: shorten the Full explanations (and Q23.05's Short answer) named in T-6 to what the section does not already say, linking the section for the rest. Keep every cited test name, cause clause, "read from the source" pointer and Output result; keep each answer at least 160 words.
- Acceptance: common rules; prose count at most 22,169 - 250 = 21,919 (both counters).
- Executor: Sonnet (mechanical text editing with counts).

### FIX-M23-02 · S · Markers, links and internal names (F-1 to F-5)
- Files: `modules/23-rxjs-in-depth.md`.
- Do: F-1 move the five markers to the first body mention (526, 619, 154, 856) and leave `mergeScan` unmarked at 184; F-2 relink 544; F-3 "no completion before 14" at 77; F-4 mark the §9, §10 and §5 internal names and `fromPromise`, `Subscriber._error`; F-5 "may change in any release" at 836 and 925. Find lines by text (they move after FIX-M23-01).
- Acceptance: common rules; the marker scan finds each marker at the first body mention; prose at most +20 over the count measured just before.
- Executor: Sonnet (mechanical text editing; no claim changes).

### FIX-M23-03 · M · Follow-up, snippets, glosses and wording (T-1 to T-5)
- Files: `modules/23-rxjs-in-depth.md`; `_meta/GLOSSARY-TERMS.md` (`## Module 23`, new terms only).
- Do: T-1 second follow-up for Q23.26 from the existing `Section 7` assertion; T-2 replace the §9 Code excerpt and the Q23.36 `newScheduler()` line with verbatim excerpts that show their helpers, and add `lateFrame = 10` to Q23.17's printed `leaverRun`; T-3 glosses; T-4 the five wording nits (measure the two `keep()` methods or cut "more lines"); T-5 reasons in "Uses these ideas later" (optional).
- Acceptance: common rules; `check-snippets . 23` exits 0; Output results unchanged; prose at most +90 over the count measured just before.
- Executor: Opus (judgment on which spec lines to excerpt verbatim and on a follow-up that must cite an existing assertion; re-runs `check-snippets` and the module tests).

### FIX-M23-04 · S · SOURCES placement and the scheduler docs line (F-6; 0 module words)
- Files: `SOURCES.md`.
- Do: move lines 865-867 (the §10 `rxjs` read, the `marble-testing.md` read, "Section 10 code") from the Module 13 block to the Module 23 block after its "Section 9 code" line; add a docs line for `docs_app/content/guide/scheduler.md` (branch `7.x`, fetched 2026-10-10, line 119 quoted; used in §9 and Q23.31). Verify the line numbers by text first.
- Acceptance: the Module 13 block has no `23-rxjs-in-depth` line; the Module 23 block has the four lines; no other text changes.
- Executor: Sonnet (mechanical move plus one line).

### FIX-M23-05 · S · Anchors for file-level links to 23 (T-7; +0 words)
- Files: `modules/04-*.md`, `14-*.md`, `16-*.md`, `17-signals.md`, `19-*.md`, `20-*.md`, `21-*.md`, `22-rxjs-foundations.md` (link targets only).
- Do: apply the Handoffs table (verify each heading anchor in module 23 after FIX-M23-01 to 03 and each line by text). The stay-file-level lines stay.
- Acceptance: `check-links --planned` exits 0; word count of every file touched unchanged; no other text changes.
- Executor: Sonnet (mechanical link edits).

Common rules for each task: from `labs/angular` run `npx ng test --watch=false --include='src/app/modules/23-rxjs-in-depth/**/*.spec.ts'` (17 files, 129 tests) and `npx tsc -p tsconfig.spec.json --noEmit`; `check-links --planned` and `check-snippets . 23` exit 0; cited `Section N:`, `Q23.NN` and `E23.N` names unchanged; the 15 Output results unchanged; prose count at or under 23,220.

After the five tasks: about 22,169 - 250 + 20 + 90 = 22,029 (with T-5 about 22,054), hard stop 23,220.


Scratch deleted: yes. `/Users/jorge.quintero/.claude/jobs/1324502a/tmp/review-m23/` (logs, packed tarballs, fetched docs, Mermaid install, scripts) was removed with an absolute path; no server or vitest process was left running; `labs/angular/.angular/` and `labs/angular/dist/` are covered by the lab's `.gitignore`.
