# REVIEW-M29: `modules/29-testing-angular.md`

- **Reviewer:** reviewer subagent of session S20261013-1420-claudecode (Claude Code, local), model claude-opus-5-5. The module was written by PLAN-M29, HOUSE-16, SEC-M29-01..12, EX-M29-01..06, QB-M29-01..07 and CLOSE-M29, all in session S20261013-1032-claudecode (per the `Done by` fields). This session authored no module-29 task and continues none of those conversations, so it is eligible (RUN.md §4).
- **Date:** 2026-10-13
- **Files read:** `modules/29-testing-angular.md` (all 3,000 lines, end to end in chunks; line numbers below are from that read and move at FIX time); `_meta/RUN.md` §4-§7, §10; `_meta/TASKS.md` (REVIEW-M29 entry, the module-29 task table, REVIEW-M28 and FIX-M28 entries); `_meta/reviews/REVIEW-M28.md` (format model); `_meta/QUALITY-BAR.md`; `_meta/modules/M29.md` (whole file: Lab decision, F1-F30, C1-C14, owners, breadth gate, sections, bank, exercises, closing, For Jorge); `_meta/LOG.md` (every M29 line, 1114-1144); `SOURCES.md` Module 29 block (1650-1725); every spec and lab file under `labs/angular/src/app/modules/29-testing-angular/` (titles by script; assertions of sections 2, 5, 9, 10, 11, 12, both outputs specs and the Exercise 29.4 code read); installed packages in `labs/angular/node_modules` (versions checked): `@angular/build` 22.2.1 (`unit-test/schema.json`, `options.js`, `runners/vitest/build-options.js`, `executor.js`, `plugins.js`), `@angular/build` application `schema.json`, `@schematics/angular` 22.2.1 (`migrations/migration-collection.json`, `migrate-karma-to-vitest/{migration,karma-processor}.js`, `refactor/jasmine-vitest/transformers/fake-async-test.js`, `utils/comment-helpers.js`), `@angular/core` 22.2.1 (`fesm2022/testing.mjs`, `types/testing.d.ts`, the chunk files of `ChangeDetectionSchedulerImpl`, `scheduleCallbackWithRafRace`, `triggerEventHandler`, `ResourceImpl`), `@angular/common` 22.2.1 `http-testing.mjs`, `@angular/router` 22.2.1 `_router-chunk.mjs`, `@angular/cdk` 22.2.1 `fesm2022/testing-testbed.mjs`, `@testing-library/angular` 19.5.0 (main and zoneless entries), `@ngrx/store` 22.0.1 `ngrx-store-testing.mjs`, `@ngrx/signals` 22.0.1 testing typings, `vitest` 5.0.3 typings, `@vitest/spy` 5.0.3 typings, `rxjs` 7.8.2 `intervalProvider.js`, `jsdom` 30.1.1 `README.md`; web (curl, raw text, into the scratchpad): angular.dev `migrating-to-vitest.md` and `component-harnesses-overview.md` on `angular/angular` `main`, Vitest `docs/config/faketimers.md` on `vitest-dev/vitest` `main`, Fowler's `TestPyramid` page; every file-level link to `29-testing-angular.md` in modules 04-28 (by `grep`).
- **What was run** (Node 24.21.0, `export PATH=/opt/homebrew/opt/node@24/bin:$PATH`, one check at a time). Already run by the coordinating session at 14:20 and not repeated: module-29 `ng test` (21 files, 147/147), `npx tsc -p tsconfig.spec.json --noEmit` (exit 0), `check-links.mjs --planned` (exit 0), `check-snippets.mjs . 29` ("All snippets check out"), `module-stats.mjs` (29: 34 Q, 6 Ex, 22,756 words, Output 11 / Concept 7 / Difference 6 / Trade-off 4 / Design 3 / Bug hunt 3). Run by this review: (1) a temporary probe spec `labs/angular/src/app/modules/29-testing-angular/zz-review-probe.spec.ts`, run twice scoped with `npx ng test --watch=false --include='src/app/modules/29-testing-angular/zz-review-probe.spec.ts'` (first version 3 tests, second version 2 tests; the "failures" are deliberate report assertions that print the observed values), then deleted before any other check; (2) the QUALITY-BAR prose one-liner: 22,756; (3) a scan script (scratchpad): cited `Section N:` and `Q29.NN` names against all `it()` titles (70 cited, 0 missing), exercise criteria against `it()` titles (6 of 6 equal, every exercise spec uses `describe.each`), D1 anatomy counts (34 each), follow-ups per answer (none under 2), `<details>` (60 open, 60 close), `[Q29.NN](#q29-NN)` coverage (all 34 linked), per-section subsections, Legacy, Misconceptions and "because" counts, internal-name marking per section; (4) Mermaid 11.12.0 under jsdom 26.1.0 (scratchpad install): 12 of 12 diagrams parse, a malformed negative control fails; (5) URL coverage of the module against the SOURCES block (7 of 7 present); (6) `grep` of status-marker positions against first body mentions; `git status --short` (no file of mine left; module 29 and its lab folder untracked as before).
- **Basis of each finding:** **run** (executed in this review), **package source** (installed package read by `grep`/`sed`), **docs** (raw docs text fetched by curl on 2026-10-13) or **read** (module, labs, LOG, SOURCES; nothing executed).
- **Probe files:** `labs/angular/src/app/modules/29-testing-angular/zz-review-probe.spec.ts` (created, run twice, deleted before the next check); in the scratchpad: the scan scripts, the Mermaid install and parse script, the fetched docs pages. All deleted at the end (last section). No probe file remains in the labs.

Overall: a strong, honestly sourced module. Everything I re-checked against the committed specs holds: the eleven *Output* answers equal their assertions, every recorded message and flag of F2, F5, F11-F22 is asserted by a committed test or quoted from the 22.2.1 source with its file, the six exercises' criteria equal their `it()` titles and every alternative runs through `describe.each`, every cited test name exists, all twelve diagrams parse, and every sampled package read matches the installed sources. The one Major is a mechanism the module teaches that a run contradicts: Q29.31's "bug one" and Exercise 29.4's hint and follow-up say that without `TestBed.tick()` the debounced search never fires, but the Q29.31 snippet as written does call `search('ang')` at 300 ms (F-1, run). Besides it: Q29.06 says the Karma migration leaves `karma.conf.js` alone, while it deletes a default one (F-2); the `vitest-patch` route is called impossible in 22.2.1, while the builder loads the build target's polyfills first (F-3); a third throwaway observation ("Test timed out in 5000ms.") sits outside the F6 exception (T-1); and small marker, gloss and marking slips. Net after all fixes: about +70 words, about 22,830, under both the CLOSE limit 22,952 and the ceiling 23,852.

---

## QUALITY-BAR

45 items: **40 Pass, 5 Partial (B6, B9, C1, C3, C4), 0 Fail.**

| ID | Result | Evidence |
|---|---|---|
| A1 | Pass | Lines 3-9 in STYLE-GUIDE §4.1 order, Labs line with the run command; the coordinator ran it: 21 files, 147/147. |
| A2 | Pass | Prerequisites (4) link 21 §5, 16 §9, 19 §1 and 27 §11 with anchors; link check exit 0. |
| A3 | Pass | Short on time (8): §2, §5, §7, §10, Q29.01, 11, 12, 18, 28, 29, then the Summary. |
| A4 | Pass | Contents (13-29) list the twelve sections and five closing sections. |
| A5 | Pass | From test levels (§1) through runner, `TestBed`, fixtures, components, doubles, artifacts, async and harnesses to internals (§12). |
| B1 | Pass | Script: each of the six subsection headings in all 12 sections; `#### Legacy` in §3 (314), §4 (542), §5 (667), §10 (1276), each followed by a "Migration:" step (340, 555, 679, 1289). |
| B2 | Pass | Read: each problem is a concrete failure (unwired login button, `vi.mock` throwing, the 3,000 Karma specs, configure-after-inject, stale DOM after `setInput`, a renamed class, a stub hiding a mapping, `NG0203` under `new`, escaped lazy requests, a 300 ms real wait, a renamed Material class, an unrequested template error). |
| B3 | Pass | 12 diagrams (flowchart ×7, sequenceDiagram ×4, classDiagram ×1), each followed by "What to notice"; 12 of 12 parse (run). |
| B4 | Pass | Each section answers a "why" from a named file and function: `getVitestBuildOptions`, `createTestBedInitVirtualFile`, `getZoneTestingStrategy`, `_createFakeTimersHookStatements`, `assertNotInstantiated`, `AbstractFixture.detectChanges`, `DebugElement.triggerEventHandler`, `@vitest/spy` `Mock`, `TestBedImpl.createDirective`, `RouterTestingHarness.navigateByUrl`, `scheduleCallbackWithRafRace`, `forceStabilize`, `getCleanupHook`. Sampled names found by `grep` (claims table). |
| B5 | Pass | Every `### Code` has an approach sentence and steps (§9's three steps are inline, numbered "(1)-(3)"; accepted). |
| B6 | Partial | Script: 56 of 57 best-practice bullets carry "because"; §8 1027 ("Use a host component when the template contract matters, …") has no reason clause (T-4). |
| B7 | Pass | Read: every Misconceptions bullet (45) has a correction and a cause; §12's "Once true: until v19.0" cites the 19.0.0 CHANGELOG. |
| B8 | Pass | *Framework vs platform* in §2 (224-225), as C3 requires; the optional *Coming from the backend* was dropped (Spring source not read, LOG SEC-M29-04/07). |
| B9 | Partial | Terms glossed at first use, except "the London school" (§7 907) (T-3). |
| B10 | Pass | Read: owners get one sentence plus a link (16 §9/Q16.34, 18 Q18.19, 19 Q19.26, 21 §5/§6/§7/Q21.20/Q21.24/Q21.31, 23 §10/Q23.34, 24 §5/Q24.16, 25 §5/Q25.09, 26 §2, 27 §2/§4/§11/Q27.06/Q27.33/Q27.34, 28 §5/Q28.22, 11 §7/Q11.19). |
| C1 | Partial | 34 claims sampled (table below): 30 match; one contradicted by a run (F-1, Major), one contradicted by the source (F-2), one overstated (F-3), one imprecise (T-6). |
| C2 | Pass | 11 *Output* questions, each with an `it('Q29.NN …')` in `outputs/q29-outputs.spec.ts` (Q29.30's zone half in `q29-zone-outputs.spec.ts`); all 11 answers equal their assertions (cross-check below). |
| C3 | Partial | All 70 cited test names exist (script). But "Test timed out in 5000ms." is worded as an observation of a throwaway run in three places (1189, 2365, 2448), outside the only allowed exception (F6's two build diagnostics, C12) (T-1). |
| C4 | Partial | Markers are in the STYLE-GUIDE §3.2 forms and match C8 (31, 222 ×2, 282, 469, 473, 555, 579, 604 ×2, 704, 920). Two sit after the first body mention: `flushEffects` (first at 575, marker 604) and `isolate` (first at 31, marker 222) (T-2). |
| C5 | Pass | `tsc` exit 0 (coordinator); every API in a snippet compiles in the labs or is in the 22.2.1 typings (`TestBed.get` shown only as removed, in a Partial). |
| C6 | Pass | `grep`: 0 `Unverified`, `TASK:`, `PLACEHOLDER` or `relink:`. |
| C7 | Pass (check), Nit (marking) | `check-snippets . 29` OK (coordinator). `getVitestBuildOptions` is unmarked at its first use in §1 (67) (T-5). |
| C8 | Pass | All 7 module URLs and every package read are in the SOURCES block (script, read); one stale "not yet run" qualifier there (T-7). |
| D1 | Pass | Script: 34 of each part; every answer has at least two follow-up bullets. |
| D2 | Pass | Read: all 11 Output short answers give the result and a one-clause cause. |
| D3 | Pass | Output 11 (32%), Concept 7, Difference 6, Trade-off 4, Design 3, Bug hunt 3. |
| D4 | Pass | Q29.01-02 §1 through Q29.34 §12. |
| D5 | Pass | `grep` of `### Q` across modules for TestBed, fakeAsync, whenStable, harness, mock, jsdom, Vitest, Karma: only Q06.02, Q21.20, Q21.31, Q25.09, Q27.34, each linked from 29, none repeated. |
| D6 | Pass | Script: every Q29.NN linked outside its heading. |
| D7 | Pass | 34 unique `<a id="q29-NN">`; link check exit 0. |
| D8 | Pass | 34 of 35 questions (reason in M29.md and PROGRESS), 6 of 6 exercises. |
| E1 | Pass | Every exercise has every part; the three "Design, not run" lines are interviewer follow-ups, not alternatives. |
| E2 | Pass | Script: criteria equal `it()` titles (6, 6, 6, 6, 5, 6); each account names what the test asserts. |
| E3 | Pass | From one component (29.1) to a routed feature integrating §4-§10 (29.6). |
| E4 | Pass | Tests pass (coordinator run); every alternative runs through `describe.each` with unchanged titles. |
| E5 | Pass | 11 Output questions. |
| F1 | Pass | Summary (1534-1538): three paragraphs linking all twelve sections with their traps. |
| F2 | Pass | Five explain-back prompts, each naming a listener. |
| F3 | Pass | Eight flashcards. |
| F4 | Pass | Builds on, Read next, Uses these ideas later, Comparisons, each with a reason. |
| G1 | Pass | 22,756 prose words (module-stats and the one-liner agree), under 22,952 and the ceiling 23,852; no repeat worth cutting (Redundancy below). |
| G2 | Pass | 8 of 8 SYLLABUS §4 rows covered (table below). |
| H1 | Pass | Coordinator's run: 147/147, `tsc` exit 0; CLOSE-M29 ran `ng build` (exit 0). |
| H2 | Pass | `check-links --planned` exit 0 (coordinator). |
| H3 | Pass | `git status --short`: no file of this review left; the probe was deleted. |

## Module-specific checks (REVIEW-M29 entry)

| Check | Result | Evidence |
|---|---|---|
| Every recorded text, flag and message (F2, F5, F11-F22) against the committed specs | Pass | read: F2 (`section-2` 10-12), F5 (`section-2` 20-21, `q29-outputs` 119-120), F11 (`section-5` 69-85: `typeof` and the `tick` spy), F12 (`section-5` 61-66, `section-12` 40-58), F13 (`section-5` 2-10, `q29-outputs` 137-145), F14 (`section-5` 24-51, `q29-outputs` 148-166), F15 (`section-6`), F16 (`q29-outputs` 197-209), F17 (`section-5` 54-58), F18 (`q29-outputs` 130-134), F19, F20 (`section-9` 83-139), F21 (`section-10` 30-74, `q29-outputs` 248-272), F22 (`section-10` 77-90, `section-10-zone-import`, both outputs specs). The module text quotes each value as asserted. |
| No claim worded as observed without a committed test, except F6's two build diagnostics | Partial | 258 and 1588 (F6) are the allowed exception. "Test timed out in 5000ms." is worded as a throwaway run at 1189, 2365 and 2448 (T-1). |
| HOUSE-16 mode of SEC-M29-11 and EX-M29-05 | Pass | LOG 1115 (HOUSE-16 installed), 1127 and 1133 ("lab mode"); §11 and Exercise 29.5 are committed specs; the verification paragraph (31) says lab mode. No documented-mode wording left. |
| `flushEffects` deprecated, not removed (F11) | Pass | 604, 686, 693, 1536, Q29.12 follow-up; package source: `types/testing.d.ts` `@deprecated`, run: `section-5` test. |
| No CLI or Angular line above 22.2.1 cited as shipped (C1) | Pass | read: no 22.3.0-next line; the `polyfills` option is never claimed (but see F-3 for the opposite overstatement). |
| zone.js claims match F22 exactly | Pass | 1219, 1302, Q29.29, Q29.30, flashcard 7: importing zone.js in the spec leaves `fakeAsync` throwing (`_Zone` captured at load, `testing.mjs` 308-317) and makes `waitForAsync` reject with the ProxyZone `Error`. |
| C6 quoted both ways | Pass | §3 301 and Q29.06: collection "[EXPERIMENTAL]", docs "experimental and may not cover all possible test patterns", CLI CHANGELOG 22.0.0 "stabilize …"; no marker. |
| Status markers against C8 at the first body mention | Partial | C4 row (T-2). |
| Probe-first claims (C4) backed by tests or absent | Pass | `triggerEventHandler` vs native click (§6 tests, Q29.16), injecting pipe (§8), form events, guard through the harness, effect and resource (§9), scheduler function named and marked internal (§10), teardown and rethrow (§12): all committed tests or "read, not run". |
| Internal names of C11 marked at first use per unit, found by `grep` | Partial | Script over sections and answers: all C11 names marked; `getVitestBuildOptions` unmarked in §1 (T-5). Every sampled name found in the named file (claims table). |
| Owner credit and the 16/17/18/19/21/23/24/25/27/28 split | Pass | B10 row; no retelling found (Q29.24's one sentence on `withRequestsMadeViaParent` cites Q27.06's test). |
| No end-to-end content (C10) | Pass | Playwright appears only as the browser-mode provider package (222, 1606); module 30 linked. |
| Output short answers give the reason | Pass | D2 row. |
| Every exercise criterion equals its test title; every alternative runs with `describe.each` | Pass | E2, E4 rows (script). |
| At least two answered follow-ups per answer | Pass | D1 row (script). |
| Terms defined at first use | Partial | B9 row (T-3). |
| SOURCES complete (script) | Pass | C8 row. |
| Every anchored cross-module link resolves | Pass | link check exit 0 (coordinator). |
| Sections 3, 4, 5 and 10 have `#### Legacy` with a migration step | Pass | B1 row. |
| All twelve Mermaid diagrams parse | Pass | run: 12 of 12; negative control fails. |
| Every Misconceptions bullet has a cause clause | Pass | B7 row. |
| Every `<details>` closed | Pass | script: 60/60. |
| Type mix and Output share | Pass | D3 row. |
| Prose within 22,952 and the ceiling 23,852 | Pass | G1 row. |
| File-level links into 29 listed as anchor candidates with a section map | Done | Handoffs below (19 anchors, 36 stay file-level). |

## Handoffs

Module 29 slugs (verify at FIX time; no FIX here renames a heading):

- S1 `#1-what-to-test-where-unit-integration-component-and-end-to-end-tests-the-pyramid-and-the-trophy`
- S2 `#2-the-runner-vitest-through-angularbuildunit-test-jsdom-and-browser-mode`
- S4 `#4-testbed-the-testing-module-inject-runininjectioncontext-overrides-and-teardown`
- S5 `#5-zoneless-fixtures-whenstable-testbedtick-detectchanges-and-automatic-change-detection`
- S6 `#6-component-tests-dom-queries-componentfixture-signal-inputs-with-setinput-and-bindings-outputs-and-onpush`
- S9 `#9-testing-guards-interceptors-forms-effects-resources-and-stores`
- S10 `#10-async-tests-vitest-fake-timers-versus-fakeasync-and-waitforasync`
- S11 `#11-component-harnesses-and-angular-testing-library`

| File:line | Context | Anchor |
|---|---|---|
| 11:626 | Testing Library role queries, `hidden: true` | S11 |
| 11:1070 | "A failed `getByRole` is a design signal" | S11 |
| 12:587 | the builder's `angular:compiler-init` virtual entry | S2 |
| 15:585 | "`TestBed` is Angular's test harness" | S4 |
| 16:178 | "`TestBed` is Angular's testing harness" (a missing provider) | S4 |
| 16:942 | "Testing overrides. `TestBed` is module 29" | S4 |
| 18:712 | "`TestBed` … takes `deferBlockBehavior`" | S4 |
| 18:1819 | "`TestBed.configureTestingModule({ deferBlockBehavior })`" | S4 |
| 20:98 | "Render it in a `TestBed`" | S6 |
| 21:578 | rewriting `fixture.detectChanges()` suites "is likely not worth the effort" | S5 |
| 21:1563 | "stale until a stable wait, or a `detectChanges`" | S5 |
| 22:787 | "fake timers (`vi.useFakeTimers()` …)" | S10 |
| 23:940 | "test such code with the framework's ordinary async tests" | S10 |
| 23:2152 | "With an ordinary async test" | S10 |
| 24:79 | "Every spec … drives a `RouterTestingHarness`" | S9 |
| 25:69 | "Testing forms is module 29" | S9 |
| 26:28 | "testing guidance (module 29)" | S9 |
| 27:1073 | "Testing strategy is module 29" | S1 |
| 27:2103 | "Component tests over this seam are 29" | S9 |

Stay file-level (36): header lines 11:5, 13:5, 15:5, 18:5, 20:5, 21:5, 22:5, 25:5, 26:5, 27:5, 28:5; Read next 15:2255, 16:2482, 18:2610, 20:2234, 21:2710, 22:2592, 25:3071, 26:2100, 27:2578, 28:2792; Uses these ideas later 04:1700, 11:1598, 12:1861, 13:2514, 14:2206, 17:2432, 19:2527, 21:2711, 22:2593, 23:2746, 24:2979, 25:3072, 26:2101, 27:2579, 28:2793. This differs from M29.md 153 and the CLOSE-M29 map in three places: 18:712 and 18:1819 go to §4, not §6 (both sentences are about the `deferBlockBehavior` option, which §4's table lists); 28:2792 and 28:2793 are "Read next" and "Uses these ideas later" lines, so they stay file-level; and 15:585, 22:787, 23:940, 26:28 are added (body sentences the earlier maps missed). Module 17 is not touched (its only link, 17:2432, stays file-level).

## Factual findings

**F-1 · Major (C1) · Q29.31 and Exercise 29.4 teach that the debounced search never fires without `TestBed.tick()`; a run shows it fires (basis: run).** Q29.31 (2426-2456) says the snippet "advances 300 ms but the search never fires", and its short answer gives "Bug one: no `TestBed.tick()` after the `input` event, so the effect behind `toObservable` has not run and no debounce started". Exercise 29.4 repeats it: Hint 2 (2747), step 4 (2758, "because the scheduler's own tick waits on the frozen clock") and the follow-up at 2793 ("*`search` is never called after typing. Why?* Without `TestBed.tick()` the effect has not run, so no debounce started."). My probe ran the Q29.31 snippet exactly (Exercise 29.4's `LabM29SearchBox`, a `vi.fn` search double, `vi.useFakeTimers()`, `input` event, no tick, `vi.advanceTimersByTime(300)`): `search` was called once, with `'ang'`; it was called at 300 ms and not at 299 ms; the result was the same with `TestBed.tick()`, and with `advanceTimersByTimeAsync`. The scheduler's tick is itself a faked timer, so the first advance fires it, the `toObservable` effect runs, and the debounce starts at once. What does fail is reading the result: after `vi.advanceTimersByTime(300)` the rendered list was empty and stayed empty after another plain 50 ms advance (the search promise's callback never ran), and even after `await vi.advanceTimersByTimeAsync(300)` it was empty until a further `await vi.advanceTimersByTimeAsync(50)` showed `ang one` (the render waits for one more scheduler tick). Bug two (the leaked fake clock) holds: in my probe a test that called `vi.useFakeTimers()` without restoring left `vi.isFakeTimers()` `true` in the next test. Fix (FIX-M29-01): recast Q29.31's snippet to assert the rendered results after a plain `advanceTimersByTime(300)` (bug one: the plain advance runs no promise callbacks and the render needs another tick; fix: `await vi.advanceTimersByTimeAsync(300)` and then await the render), keep bug two; reword Exercise 29.4's Hint 2, step 4 and the follow-up (`TestBed.tick()` in `type()` runs the effect at the moment of typing, so the 300 ms count starts there, not at the next advance); commit the two runs as `Section 10:` tests. About +20 words.

**F-2 · Minor (C1) · Q29.06 says the Karma migration "leaves `karma.conf.js` alone" (basis: package source, docs).** 1664: "the migration is version `22.0.0`, skips projects not on `@angular/build:application` and adds `vitest`; it leaves `karma.conf.js` alone." In `@schematics/angular` 22.2.1, `migrate-karma-to-vitest/karma-processor.js` 104-125 compares the file with the default configuration and marks it removable when nothing differs; `migration.js` 257-262 deletes every removable file (`tree.delete(configPath)`), warns about a custom one ("you may need to manually migrate custom settings …"), and `updateTsConfigTypes` swaps `jasmine` for `vitest/globals` in the spec tsconfig. The docs sentence the module quotes elsewhere ("It does not remove `karma.conf.js` or `test.ts` files.", `migrating-to-vitest.md` 160) is about the `refactor-jasmine-vitest` schematic, which §3 426 attributes correctly. Fix: "…, and adds `vitest`; it deletes a `karma.conf.js` that matches the default, warns about a custom one, and swaps the spec tsconfig's `jasmine` type for `vitest/globals`." About +15 words.

**F-3 · Minor (C1) · The `zone.js/plugins/vitest-patch` route is called impossible in 22.2.1 (basis: package source, docs).** §10 1219: "that route is documented only, because the 22.2.1 unit-test builder has no `polyfills` option"; Q29.30 follow-up 2419: "the docs name the `zone.js/plugins/vitest-patch` polyfill, which the 22.2.1 builder cannot take"; Q29.29 2387 "documented only". The unit-test builder has no `polyfills` option of its own (true), but it builds with the build target's options and `executor.js` `prepareSetupFiles` (218-228) puts the build's `polyfills.js` first among the Vitest setup files, before `init-testbed.js`; `getZoneTestingStrategy` (`build-options.js` 151-171) also reads those polyfills. So the docs route ("add `zone.js/plugins/vitest-patch` to your test target polyfills in `angular.json`", `migrating-to-vitest.md` 228) is reachable in 22.2.1 through the build target named by the unit-test builder's `buildTarget` (for example a test-only build configuration), at the cost of an `angular.json` edit, which these labs do not make (Lab decision 4). Not run. Fix: 1219 "that route is documented only here: the 22.2.1 unit-test builder has no `polyfills` option, but it loads the build target's polyfills first, so the patch needs an `angular.json` build-target edit these labs do not make (read, not run)"; 2419 "…, which in 22.2.1 goes into the build target's `polyfills` (not run here)". About +25 words. Related: M29.md For Jorge 5 (For Jorge 1 below).

## Teaching and completeness findings

**T-1 · Minor (C3, C12) · A third throwaway observation.** "Test timed out in 5000ms." is reported as the result of an earlier throwaway run at 1189 (§10 problem), 2365 (Q29.28) and 2446/2448 (Q29.31), outside the only exception the plan allows (F6's two build diagnostics; lesson 1, C12). The number has a source basis that needs no run: the `vitest` 5.0.3 typings declare `testTimeout` "Default timeout of a test in milliseconds" `@default 5000` (`dist/chunks/plugin.d.BsjqSb4-.d.ts` 3697-3702). Fix: replace each "throwaway run" clause by the mechanism plus that read, for example "a pending `whenStable` waits until Vitest's default `testTimeout`, 5,000 ms (read from the `vitest` 5.0.3 typings), so the lab test asserts the unresolved promise instead"; drop "the timeout itself comes from a throwaway run" at 2448. About −10 words.

**T-2 · Nit (C4) · Two markers after the first body mention.** `TestBed.flushEffects()` first appears in §5's problem (575) and is marked at 604; `isolate` first appears in the verification paragraph (31, "`isolate: true`") and is marked at 222. Fix: move `[Deprecated since v20.0 — use TestBed.tick()]` to 575 (keep the 604 sentence unmarked), and `[Added in v22.0]` to 31's `isolate: true`. +0 words.

**T-3 · Nit (B9).** "The London school's interaction testing" (§7 907) is not glossed. Fix: "The London school (mockist TDD, which tests a unit by the calls it makes to mocked collaborators)". +12 words.

**T-4 · Nit (B6).** §8 1027 has no reason: "**Use a host component when the template contract matters**, such as projected content or the binding syntax itself." Fix: add ", because only a real template exercises projection and the binding syntax". +11 words.

**T-5 · Nit (C11 marking).** `getVitestBuildOptions` is unmarked at its first use in §1 (67). Fix: "`getVitestBuildOptions` (internal, `runners/vitest/build-options.js`)". +1 word.

**T-6 · Nit (C1, precision).** §4 462: "`beforeEach` and `afterEach` hooks from `ɵgetCleanupHook` (internal) call `resetTestingModule`". `getCleanupHook(expected)` resets only when `shouldTearDownTestingModule()` equals `expected` (`testing.mjs` 2661-2668), so by default only the `afterEach` hook resets, as §12 1449 says. Fix: "…call `resetTestingModule` (by default only the `afterEach` one, §12)", with §12 linked to the anchor 12-under-the-hood-how-the-builder-boots-testbed-and-how-a-fixture-decides-it-is-stable. +9 words.

**T-7 · Nit (C8, SOURCES).** The QB-M29-02 line of the SOURCES block (1721) says the Q29.09 test was "written 2026-10-13, not yet run"; it has run since (LOG 1135, 137/137). Fix: drop "not yet run". SOURCES only.

**T-8 · Minor (anchors).** The Handoffs table: 19 file-level links to 29 in modules 11, 12, 15, 16, 18, 20, 21, 22, 23, 24, 25, 26 and 27 take an anchor.

## Output answer cross-check

All eleven Output answers were compared with their assertions (read): Q29.05 message and the package path (`q29-outputs` 119-127); Q29.09 message and the earlier instance (130-134); Q29.11 `x`/`Adax` (137-145); Q29.13 `a|a`, `a|a`, `b|a`, `b|c` (148-166); Q29.16 `['button']`, `['button', 'card']` (169-179); Q29.19 `Pen,Ink` and `[[]]` (182-194); Q29.22 the tag-name error, `SPAN`, `yo`, `ng-version`, `directiveInstance` (197-209); Q29.23 `/login`, `true` (212-223); Q29.26 `|loading|undefined`, `1|loading|undefined`, `1|resolved|4` (226-245); Q29.28 `false false ""`, `true wait`, `done` (248-272); Q29.30 both runs (`q29-outputs` 278-…, `q29-zone-outputs` 12-23; the zoneless rejection asserted as a bare string, the zone one as an `Error`). Each short answer gives the reason. Q29.30's "(1) `Error: zone-testing.js …`" prefix follows from `throw new Error(…)` in `withFakeAsyncTestModule` (`testing.mjs` 312-317, package source).

## SYLLABUS §4 coverage (module-29 checklist, 8 rows)

| Row | Where | Status |
|---|---|---|
| What to test where; pyramid vs trophy | §1, Q29.01-02, Ex 29.6 | Covered |
| Runners: Vitest via `@angular/build:unit-test`, Karma/Jasmine and the schematic, Jest, browser mode vs jsdom | §2, §3, §12, Q29.03-07 | Covered (F-2) |
| `TestBed`: `configureTestingModule`, `inject`, overrides, `TestBed.tick()`/`whenStable` zoneless | §4, §5, §12, Q29.08-14, 34, Ex 29.1-29.2 | Covered |
| Component tests: DOM queries, `ComponentFixture`, `setInput`, outputs, OnPush, zoneless | §6, §5, Q29.11, 13, 15-17, Ex 29.1 | Covered |
| Mocking: fakes, stubs, spies, `vi.fn`, provider overrides, over-mocking | §7, Q29.18-20, Ex 29.2, 29.6 | Covered |
| CDK harnesses, Angular Testing Library | §11, Q29.32-33, Ex 29.5 (lab mode) | Covered |
| Services, pipes, directives, guards, interceptors, effects, resources | §8, §9, Q29.21-27, Ex 29.2, 29.3, 29.6 | Covered |
| Async: Vitest fake timers vs `fakeAsync`, `waitForAsync` | §10, §3, Q29.28-31, Ex 29.4 | Covered (F-1, F-3) |

## Redundancy

No retelling worth cutting. The likely repeats each add something: the `vi.mock` patch (§2, Q29.05, flashcard 2) adds the package-path run and the fix; the zoneless timing (§5, Q29.11-13) splits rule and runs as the plan requires; the frozen clock (§10, Q29.28, Q29.31, Q29.34 follow-up) adds a run, a bug and a link; the Testing Library principle is quoted in §1, §6 (paraphrase), Q29.17 and §11, each once in its own unit. Shortening any of them would cost a cross-link, not a repeat.

## Claims to verify

34 claims sampled; basis on each.

| # | Claim (line) | Basis | Result |
|---|---|---|---|
| 1 | 11 Output answers (bank) | read (spec assertions) | match |
| 2 | 70 cited test names exist; criteria equal titles | script | match |
| 3 | `vi.mock` patch message; package paths pass (218, Q29.05) | read (`section-2`, `q29-outputs`) | match |
| 4 | `splitting` deprecated, "No longer needed with Vitest 5." (222) | package source (`unit-test/schema.json` 84) | match |
| 5 | `isolate` default false "to align with the Karma/Jasmine experience" (222, 263) | package source (`schema.json` 76-78) | match |
| 6 | Application `polyfills` default `[]`; strategy branch `dynamic` (220) | package source (application `schema.json` 39-40; `build-options.js` 151-171) | match |
| 7 | Init files, then `setupFiles`, as setup files (216) | package source (`executor.js` 216-228; `polyfills.js` first when present) | match (see F-3) |
| 8 | Cleanup hooks outside the `Symbol.for` guard (1447) | package source (`build-options.js` 71-75) | match |
| 9 | Vitest globals on, so ATL registers `afterEach` (1337) | package source (`plugins.js` 183 `globals: true`; ATL `fesm2022/testing-library-angular.mjs` 475-476) | match |
| 10 | `migrate-karma-to-vitest` 22.0.0, optional, `@angular/build:application` only, `runner: 'vitest'`, adds `vitest` (299) | package source (`migration-collection.json` 17-21; `migration.js` 162-170, 254, 269) | match |
| 11 | The migration leaves `karma.conf.js` alone (Q29.06 1664) | package source (`karma-processor.js` 104-125, `migration.js` 257-262) | contradicted (F-2) |
| 12 | Schematic adds TODO comments; does not change `angular.json` (426-427) | package source (`comment-helpers.js` 23); docs (`migrating-to-vitest.md` 154, 159-160) | match |
| 13 | `--fake-async` hook setup `advanceTimeDelta: 1, shouldAdvanceTime: true` (301) | package source (`fake-async-test.js` 86-96) | match |
| 14 | `runInInjectionContext` is `inject(EnvironmentInjector)` then Angular's (460) | package source (`testing.mjs` 1471-1473) | match |
| 15 | Hooks reset per `expected` value (462, 1449) | package source (`testing.mjs` 2659-2668) | §12 match; §4 imprecise (T-6) |
| 16 | `getLastFixture` throws `No fixture has been created yet.` (604) | package source (`testing.mjs` 1579) | match |
| 17 | `initTestEnvironment` second call message (1449, Q29.34) | package source (`testing.mjs` 1389); run (`section-12` 88) | match |
| 18 | `_Zone` captured at load; `withFakeAsyncTestModule` throws (1219) | package source (`testing.mjs` 308-317) | match |
| 19 | `waitForAsync` rejects with a string (Q29.30) | package source (`testing.mjs` 23); run (`section-10` 90) | match |
| 20 | Typings: "This API requires Zone.js and cannot be used with the Vitest test runner" (1219, Q29.29) | package source (`types/testing.d.ts` 168, 177, 206) | match |
| 21 | Scheduler files `_debug_node-chunk.mjs`, `_pending_tasks-chunk.mjs` (1217, Q29.28) | package source (`grep`) | match |
| 22 | `triggerEventHandler` in `_debug_node-chunk.mjs` (723) | package source (`grep`) | match |
| 23 | `ResourceImpl` in `_resource-chunk.mjs` (Q29.26) | package source (`grep`) | match |
| 24 | `mockRestore` "Does what `mockReset` does and restores original descriptors …" (835) | package source (`@vitest/spy` `dist/index.d.ts` 193) | match |
| 25 | `shouldAdvanceTime` text, default false; `advanceTimeDelta` 20; `toFake` default (1193, 1217) | docs (`vitest` `docs/config/faketimers.md` 22, 51-53) | match |
| 26 | jsdom README quotes (271) | package source (`jsdom` 30.1.1 `README.md`) | match |
| 27 | Harness docs quotes; Material "provides a test harness for each component" (1314, 1335) | docs (`component-harnesses-overview.md` 7 and body) | match |
| 28 | `forceStabilize` = `detectChanges` then `whenStable` (1335, Q29.32) | package source (`testing-testbed.mjs` 596-603, 649-656) | match |
| 29 | `MockStore` `addReducer` no-op; `refreshState` sets a copy of the last state (1068, Q29.27) | package source (`ngrx-store-testing.mjs` 62-74) | match |
| 30 | `withComponentInputBinding` default `'alwaysUndefined'` (Ex 29.6) | package source (`_router-chunk.mjs` 1705) | match |
| 31 | `provideHttpClientTesting` sets `REQUESTS_CONTRIBUTE_TO_STABILITY` (Ex 29.6) | package source (`http-testing.mjs` 266) | match |
| 32 | `debounceTime` reaches `setInterval` through `intervalProvider` (`rxjs` 7.8.2) (Ex 29.4) | package source (`intervalProvider.js` 26) | match |
| 33 | Without `TestBed.tick()` the debounced search never fires (Q29.31, Ex 29.4) | run (probe A, D) | contradicted (F-1) |
| 34 | `vitest-patch` route impossible in 22.2.1 (1219, Q29.30) | package source (`executor.js` 218-228, `build-options.js` 151-171); docs (`migrating-to-vitest.md` 228) | overstated (F-3) |

## Proposed FIX tasks

Ceilings: the module is 22,756 prose words (module-stats); CLOSE limit 22,952; REVIEW ceiling 23,852. FIX-M29-01 nets about +10, FIX-M29-02 about +60 (+25 for F-3, +15 F-2, +12 T-3, +11 T-4, +9 T-6, +1 T-5, +0 T-2), FIX-M29-03 +0: about 22,830 in all, under both limits. FIX-M29-01 and -02 edit `modules/29-testing-angular.md` and run in that order; FIX-M29-03 edits only other modules' link targets and may run beside them. None blocks on Jorge.

### FIX-M29-01 · M · Q29.31 and Exercise 29.4: the debounce runs without `TestBed.tick()`; the timeout as a typings read (F-1, T-1)
- Files: `modules/29-testing-angular.md`; `labs/angular/src/app/modules/29-testing-angular/concepts/section-10-async.spec.ts`; `SOURCES.md`.
- Do: (1) add two tests to `section-10-async.spec.ts` (earlier tests unchanged; fake timers restored by the existing `afterEach`), mounting Exercise 29.4's `LabM29SearchBox` with a `vi.fn` `SearchApi` double, no `TestBed.tick()`: `Section 10: the first advance starts the debounce without TestBed.tick` (no call at 299 ms, one call with `'ang'` at 300 ms) and `Section 10: a plain advance runs the search but not its rendered result` (after `vi.advanceTimersByTime(300)` the call happened and the list is empty, still empty after a further plain 50 ms; after `await vi.advanceTimersByTimeAsync(300)` then `await vi.advanceTimersByTimeAsync(50)` it lists `ang one`). Re-run first: where a run differs from these values, the run wins. (2) Recast Q29.31: same title shape ("… advances 300 ms but the results never render, and the next test in the file times out"), the snippet asserting the rendered list after the plain advance; bug one = the plain advance runs no promise callbacks and the render needs one more scheduler tick (fix: `await vi.advanceTimersByTimeAsync(300)`, then advance or await the render); bug two unchanged; cite the two new tests. (3) Exercise 29.4: Hint 2, step 4 and the follow-up at 2793 say that `TestBed.tick()` in `type()` runs the `toObservable` effect at the moment of typing, so the 300 ms count starts there rather than at the next advance (no "never called"). (4) T-1: replace the three "throwaway run" timeout clauses (1189, 2365, 2448) with the `vitest` 5.0.3 `testTimeout` `@default 5000` read. (5) SOURCES: the two new tests and the `vitest` typings line.
- Acceptance: module-29 `ng test` passes 3 of 3 runs (21 files, 149 tests); `tsc -p tsconfig.spec.json --noEmit` exit 0; `check-links --planned` and `check-snippets . 29` exit 0; `grep -c "throwaway" modules/29-testing-angular.md` counts only F6's lines (258, 1588); `grep -n "never fires\|never called\|no debounce started"` returns nothing; Exercise 29.4's criteria still equal its `it()` titles; prose at most +40 over the count measured just before.
- Model: **Opus** (judgment-heavy: rewrites a Bug hunt and commits the run that backs it).

### FIX-M29-02 · S · The Karma migration, the vitest-patch route, markers, glosses and marking (F-2, F-3, T-2..T-7)
- Files: `modules/29-testing-angular.md`; `SOURCES.md`.
- Do: F-2 Q29.06's migration sentence (text in F-2); F-3 the 1219 and 2419 sentences (text in F-3; re-read `executor.js` `prepareSetupFiles` and `getZoneTestingStrategy` in the installed `@angular/build` 22.2.1 first) and SOURCES gains the `executor.js` read; T-2 move the two markers to 575 and 31; T-3 gloss the London school at 907; T-4 the "because" at §8 1027; T-5 mark `getVitestBuildOptions` internal at 67; T-6 the `beforeEach` clause at 462; T-7 drop "not yet run" in SOURCES 1721.
- Acceptance: common rules; the marker `grep` shows `flushEffects` and `isolate` marked at their first body mention; every §8 best-practice bullet has "because" (script); prose at most +80 over the count measured just before.
- Model: **Sonnet** (prescribed text; two source re-reads).

### FIX-M29-03 · S · Anchors for the file-level links to 29 (T-8; +0 words)
- Files: `modules/11-accessibility.md`, `12-angular-how-it-works.md`, `15-standalone-and-ngmodules.md`, `16-dependency-injection.md`, `18-control-flow-and-defer.md`, `20-lifecycle-and-render-hooks.md`, `21-change-detection.md`, `22-rxjs-foundations.md`, `23-rxjs-in-depth.md`, `24-routing.md`, `25-forms-reactive-and-template-driven.md`, `26-signal-forms.md`, `27-http-client.md` (link targets only).
- Do: apply the Handoffs table (19 anchors); the 36 header, Read-next and Uses-these-ideas-later links stay file-level. Verify each slug against module 29's `## N.` headings and each line by its text (line numbers move).
- Acceptance: `node labs/tools/check-links.mjs --planned` exits 0; every touched file's word count unchanged; no other text changes; module 17 untouched.
- Model: **Sonnet**. Files disjoint from 01 and 02.

Common rules for each task: from `labs/angular` run `npx ng test --watch=false --include='src/app/modules/29-testing-angular/**/*.spec.ts'` and `npx tsc -p tsconfig.spec.json --noEmit`; from the guide root `node labs/tools/check-links.mjs --planned` and `node labs/tools/check-snippets.mjs . 29` exit 0; cited `Section N:`, `Q29.NN` and `E29.N` names unchanged except as a task prescribes; only declared files change; the module stays at or under 23,852 words; the LOG line gives both counts (`module-stats.mjs` and the QUALITY-BAR one-liner).

## For Jorge

1. **The `vitest-patch` test configuration (M29.md For Jorge 5, refined by F-3).** The route needs no 22.3 CLI: the 22.2.1 unit-test builder loads its build target's polyfills first, so a test-only build configuration (selected by the test target's `buildTarget`) listing `zone.js`, `zone.js/testing` and `zone.js/plugins/vitest-patch` should make `fakeAsync` runnable in the labs without touching the app build. Not run. Say if you want a HOUSE task to add that configuration to `labs/angular/angular.json` and commit one `fakeAsync` test under it; otherwise FIX-M29-02 only words the route correctly. No FIX blocks on this.
2. **Unchanged open points from M29.md and CLOSE-M29:** VERSIONS.md still says `refactor-jasmine-vitest` is "stable" while the 22.2.1 collection and the docs say experimental (C6, For Jorge 3), and lacks the module-29 rows (`TestBed.tick` 20.0, `createDirective` 22.2, `bindings` 20.1, `getLastFixture` 22.0, `flushEffects` deprecated 20.0, the removed Jest/WTR builders 22.0, `isolate` 22.0, `splitting` deprecated 22.2, CDK and Testing Library); 34 of 35 questions; C14 (no runtime `NG0304` claimed). None blocks a FIX.
3. **Anchor map differs from M29.md and CLOSE-M29** in three places (Handoffs): 18:712 and 18:1819 to §4, 28:2792-2793 stay file-level, four body links added. FIX-M29-03 uses this review's map; say if you prefer the plan's.

Scratch deleted: yes. The probe `labs/angular/src/app/modules/29-testing-angular/zz-review-probe.spec.ts` was removed right after its second run, before any other check; the scratchpad folders (scan scripts, Mermaid install and script, fetched docs) were removed with absolute paths at the end; no server or Vitest process was left running; `labs/angular/.angular/` cache is covered by the lab's `.gitignore`.
