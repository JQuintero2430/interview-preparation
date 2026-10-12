# REVIEW-M20: `modules/20-lifecycle-and-render-hooks.md`

- **Reviewer:** subagent, model claude-sonnet-5-5, session S20261009-1454-claudecode (module written by the PLAN/SEC/EX/QB/CLOSE sessions of module 20, 2026-10-08 and 2026-10-09; the reviewer authored no module-20 task, so it is eligible)
- **Date:** 2026-10-09
- **Files read:** `modules/20-lifecycle-and-render-hooks.md` (all 2,190 lines, read end to end once in 12 chunks, then the passages behind each finding re-read, so every line number below comes from that read); `_meta/RUN.md` §5, §6, §7, §10; `_meta/QUALITY-BAR.md`; `STYLE-GUIDE.md` §3.2, §4.1, §6, §7; `_meta/reviews/REVIEW-M19.md` (format model); `_meta/TASKS.md` (REVIEW-M20, REVIEW-M19, REVIEW-M18, the FIX-M19 and FIX-M18 blocks, the module-20 common rules); `_meta/modules/M20.md` (plan, F1-F22, C1-C14, owner map, breadth gate); `SYLLABUS.md` §4 (20); `SOURCES.md` Module 20 section (lines 1158-1195); `VERSIONS.md` lines 53-70; `_meta/GLOSSARY-TERMS.md` `## Module 20`; the STATE notes on module 20; the lab folder `labs/angular/src/app/modules/20-lifecycle-and-render-hooks/` (the seven section specs, `outputs/q20-outputs.spec.ts`, the four exercise specs, `exercise-3-widget/chart.ts`, `exercise-4-ticker/live-ticker.ts`, `legacy/`); the installed `@angular/core` 22.2.1 (`fesm2022/_debug_node-chunk.mjs`, `_pending_tasks-chunk.mjs`, `rxjs-interop.mjs`, `core.mjs`, `types/core.d.ts`, `schematics/migrations.json`); the core CHANGELOG (`main`, fetched 2026-10-09, read by version heading) and the angular.dev pages at tag `v22.2.1` that SOURCES cites (`lifecycle.md`, `dom-apis.md`, `NG0100.md`, `NG0950.md`, `take-until-destroyed.md`; the `NG0103.md` and `NG0911.md` paths are 14-byte absent pages, as the plan's C13 says).
- **What was run** (Node 24.21.0, `export PATH=/opt/homebrew/opt/node@24/bin:$PATH`, one check at a time): from `labs/angular`, `npx ng test --watch=false --include='src/app/modules/20-lifecycle-and-render-hooks/**/*.spec.ts'` (AOT test build, jsdom, Vitest 5.0.3: 12 files, 79 tests, all passed; by script 44 `Section N:`, 11 `Q20.NN`, 24 exercise tests; the log has no `NG8011` or other warning); `npx tsc -p tsconfig.spec.json --noEmit` (exit 0); `npx ng build` (exit 0); `node labs/tools/check-snippets.mjs . 20` ("All snippets check out."); `node labs/tools/check-links.mjs --planned` ("All links resolve.", 464 links to planned files); `node labs/tools/module-stats.mjs` (row 20: 25 Q, 4 Ex, 16,241 prose words, mix Concept 8, Output 8, Bug hunt 4, Trade-off 3, Difference 1, Design 1, no flags) and the QUALITY-BAR Python count (16,241, the same); the Mermaid parser (mermaid 11.12.0 under jsdom, installed in the scratch directory): 7 of 7 diagrams parse; a probe run of the same specs in a scratch copy of the lab workspace (configs copied, `node_modules` symlinked) that collected the thrown messages and printed them by failing one assertion: every quoted `NG0100`, `NG0103`, `NG0203`, `NG0911` text reproduced verbatim (`NG0950` and the `inject()` `NG0203` are asserted exactly by the lab's own specs); a second probe of the render queue (F-1 below); `ngc` 22.2.1 on a throwaway project that symlinks `labs/angular/node_modules` for the Q20.18 helper (exit 0). Scripts (read-only, over the module and the labs): section and question anatomy counts, answer word counts, cited-test-name check, first-use script, criteria against test titles, URL and SOURCES check, bare-link scan, link-anchor extraction with the repo's own `githubSlug`, greps of every function named "read from the 22.2.1 source", CHANGELOG checks of every status marker.
- **Basis of each finding:** stated on the finding as **run** (executed), **package source** (read in the installed 22.2.1 files), **docs** (angular.dev page or CHANGELOG at the tag or `main`) or **read** (read in the module or the labs, nothing executed).
- **Probe files:** only under `/Users/jorge.quintero/.claude/jobs/1324502a/tmp/review-m20/` (the scratch workspace, the `ngc` project, the Mermaid install, the fetched CHANGELOG and docs, logs and helper scripts); deleted at the end (last line of this file).

Overall: a strong, honest module with no Fail. Everything quoted reproduced on 22.2.1: the five runtime texts (`NG0100`, `NG0103`, `NG0203`, `NG0911`, `NG0950`) verbatim, all eight *Output* answers and the hook-order lists against their assertions (the 32-line first-render list line by line), every cited `Section N:`, `Q20.NN` and `E20.N` test name (57 distinct, 0 missing; all 44 `Section` tests are cited), every function named "read from the 22.2.1 source" (found by `grep` in the named file), the 11 status markers against the CHANGELOG, the two docs-versus-run observations (the table lists `ngOnInit` before `ngOnChanges`; a signal written in `ngAfterViewInit` did not throw) worded as observations, and the absence of `afterRender` and `AfterRenderPhase` from the 22.2.1 typings, `core.mjs` and `migrations.json`. The weak points: one mechanism sentence that the source and a run contradict (F-1: the render-hook queue also runs when a hook was registered outside a view and nothing was dirty, so "only when change detection ran" is wrong in §4, §7 and Q20.24), one sentence that is wrong about which hooks ran (F-2: the child's render callback ran when only the root signal changed), a history sentence that implies zone-based apps stopped re-checking in v21 (F-3), an exercise follow-up that states a cause the module elsewhere says no test shows (F-4), three docs quotations that are not verbatim (F-5), the missing OnPush-default marker and a `DestroyRef` marker one section late (T-1), a few first-use terms without a gloss (T-2), Q20.08 with one follow-up instead of two (T-3), two *Output* questions whose excerpt hides the members that print the answer (T-4), a title that counts four fixes where the answer gives five (T-5), two quoted runtime texts that are abridged without a label (T-6), about 425 words retold of which about 230 can go (T-7), two bare links and a set of file-level links that can now carry anchors (T-8), one server claim with no named source (T-9) and an explain-back prompt that compares something no section teaches (T-10). Net after the proposed tasks: about -50 words from 16,241, far under the 17,420 ceiling.

---

## QUALITY-BAR

Counts: **40 Pass, 5 Partial, 0 Fail, 0 N/A** (45 items). Items not Pass: B7, B9, C1, C4, D1. (The CLOSE-M20 record is not compared here; each row below is a fresh check.)

| ID | Result | Evidence |
|---|---|---|
| A1 | Pass | Lines 3-9 in STYLE-GUIDE §4.1 order: What this covers (3), Prerequisites (4), Leads to (5), Applies to (6), Study time (7), Short on time (8), Labs with the run command (9). I ran the command: 12 files, 79 tests passed. |
| A2 | Pass | Line 4: [19 §5](19-component-communication-and-projection.md#5-queries-view-and-content-queries-with-signal-queries) and [17 §4](17-signals.md#4-effects), both anchored and resolving (link check). |
| A3 | Pass | Line 8: four section links (1, the table in 3, 4, 6), five question IDs (Q20.02, Q20.07, Q20.11, Q20.14, Q20.20), Exercise 20.2 and the Summary link; every link resolves. |
| A4 | Pass | Lines 13-24 list the seven sections and the five closing sections; the `## ` headings are the seven sections, Summary (838), Question bank (846), Hands-on exercises (1777), Check your understanding (2133) and Connections (2186). |
| A5 | Pass | Order: the map (§1), the constructor boundary (§2), the signal-era choice (§3), render hooks (§4), teardown (§5), `NG0100` (§6), the mechanism (§7, the deepest). No section needs a later one except for forward links the text labels (§1 line 72 to §4; §3 table to §5). |
| B1 | Pass | `grep -c` of each of the six subsection headings is 7 (script). |
| B2 | Pass | Read: each "problem it solves" opens with a concrete failure (§1 a measurement in the constructor and a child hook that "runs before the parent's"; §2 a constructor that reads an input and sees its default; §3 an `ngDoCheck` that never fires; §4 a hook in `ngOnInit` that throws `NG0203`; §5 an interval that keeps ticking; §6 a flag set in `ngAfterViewInit` that throws; §7 four earlier answers that stopped at "Angular does it"). |
| B3 | Pass | 7 `mermaid` blocks and 7 `What to notice` lines, one per section (sequence for §1 and §5, flowcharts for the stages, mapping, phases, check pass and refresh); 7 of 7 parse under mermaid 11.12.0 (run); none rendered in a browser. |
| B4 | Pass | Read: each section has a "read from the 22.2.1 source" answer to a why-question: §1 line 86 (two orders), §2 line 185 (closed context), §3 line 288 (untracked hooks), §4 line 411 (phase loop), §5 lines 554-556 (destroy order, `takeUntilDestroyed`), §6 line 668 (where the dev pass lives), §7 lines 785-799. All names found by `grep`; F-1 is a wrong sentence inside §4/§7, not a missing mechanism. |
| B5 | Pass | Read: every `### Code` has the approach sentence and numbered steps (lines 93-98, 192-197, 305-309, 441-446, 569-574, 704-708, 806-810). |
| B6 | Pass | Read: every best-practice item has a "because" (§1 3 of 3, §2 5 of 5, §3 5 of 5, §4 4 of 4, §5 4 of 4, §6 3 of 3, §7 2 of 2). |
| B7 | Partial | Script and read: 24 Misconceptions bullets, 23 with "The myth exists because …", one in the "Once true … until …" form (line 369) whose history is worded so that it implies zone-based apps stopped re-checking in v21 (F-3). Every version claim carries a marker or a citation. |
| B8 | Pass | Callouts: *Coming from the backend* in §1 (line 89) and §2 (line 188), each with **Where the analogy breaks**; *Framework vs platform* in §4 (line 433) and §5 (line 564); the SYLLABUS checklist names no comparison, so none is required. Eight alert blocks, each opens with `[!NOTE]`, `[!TIP]` or `[!WARNING]`. |
| B9 | Partial | Script over the first prose use of 45 terms: defined at first use with an owner link: change detection (34), injection context (150), declaring view (76), `TView` (86), `LView` (755), layout thrashing (378), leak and `Subscription` (524), `TestBed` (98), derived state, `computed`, `linkedSignal`, `effect` (263), `ngDevMode` (648), alias (181). Not glossed at first use: OnPush (60), `ApplicationRef` (413, defined at 797), `ngServerMode` (431), `effect` and `computed` (167, 179, before §3 defines them): T-2. |
| B10 | Pass | Read: a topic another module owns gets one sentence and a link (16 for the context and `DestroyRef` scopes, 17 for `effect` scheduling and `afterRenderEffect`, 19 for query timing, 21 for what marks a view dirty, 23 for strategies compared, 32 for the server). Inside-module retelling is T-7. |
| C1 | Partial | 26 claims sampled and traced (table below); 23 match, and three are wrong or overclaimed: the render-queue trigger (F-1, Major), "nothing of `Child`" (F-2), the Ex 20.2 cause (F-4). |
| C2 | Pass | 8 *Output* questions (Q20.02, 04, 07, 11, 14, 17, 20, 23), each with a `Q20.NN` test in `outputs/q20-outputs.spec.ts` asserting exactly the printed lines (cross-check below; the lists compared by script for Q20.02, 11 and 23). |
| C3 | Pass | Script: 57 distinct cited names (`Section N:`, `Q20.NN`, `E20.N`), 0 missing (`E20.3` and `E20.4` are the `describe` titles of their specs); all 44 `Section N:` test titles are cited verbatim at least once. Every "in the lab" and "observed" sentence (lines 133, 685, 745, 1555) is backed by a named test. |
| C4 | Partial | Docs/CHANGELOG: the 11 present markers are right (list in Module-specific checks); the OnPush default has no marker at its first mention (line 60, "the v22 default"), and `DestroyRef` [Added in v16.0] sits at line 421 (§4) while its first body mention is §3's table (line 298): T-1. |
| C5 | Pass | Package source: every API in a snippet is in the 22.2.1 typings and compiles under `ng test`, `tsc` and `ng build`; `afterRender`, `AfterRenderPhase` and `ChangeDetectorRef.checkNoChanges` appear only as text labelled removed (lines 492-500, 697, 726-732) with the `Partial` header "removed form, shown as text". |
| C6 | Pass | `grep -c Unverified` is 0; `_meta/UNVERIFIED.md` has no module-20 row. |
| C7 | Pass | `check-snippets.mjs . 20` exit 0. Excerpts carry the `// Excerpt of` first line; Partial snippets carry `// Partial:` (lines 230, 495, 729, 1270, 1404, 1497); the legacy `Subject` class is Complete with a `<sub>Source:` line (622). T-4 is about readability of two excerpts, not their kind. |
| C8 | Pass | Script: the four URLs of the module (MDN `AbortController`, the `NG0100`, `NG0203`, `NG0950` error pages) are under `## Module 20` in SOURCES.md; the four exercises and `q20-outputs.spec.ts` have code-source lines (SOURCES lines 1190-1194). |
| D1 | Partial | Counts: 25 each of `### Q`, `**Short answer`, `**Full explanation`, `**Follow-ups`, `**Trap to avoid`. Follow-ups per answer: 2 for 24 of 25; Q20.08 (line 1148) has one: T-3. Short answers are 29-61 words; answer blocks average 223 words (chunks 217, 228, 222, 218, 229), maximum 261 (Q20.03), 260 (Q20.21). |
| D2 | Pass | Read: each *Output* short answer gives the printed lines and one or two sentences of reasoning (Q20.02 at 900-935 is one sentence plus the list; Q20.17 at 1465-1472 gives the cause). |
| D3 | Pass | One-liner and module-stats: Concept 8, Output 8, Bug hunt 4, Trade-off 3, Difference 1, Design 1 (6 tags; largest 32%); at least one Trade-off, one Design and one Bug hunt. |
| D4 | Pass | Titles in order follow the sections: Q20.01-02 §1, Q20.03-05 §2, Q20.06-09 §3, Q20.10-13 §4, Q20.14-18 §5, Q20.19-21 §6, Q20.22-25 §7; basic idea to internals. |
| D5 | Pass | `### Q` headings of modules 01-19 grepped for hooks, `NG0100`, `DestroyRef`, `ngOnDestroy`, `takeUntilDestroyed`: no duplicate (Q16.12, Q16.27, Q16.28, Q19.03, Q19.22 are linked, not repeated). Two overlaps with module 21 are a handoff for REVIEW-M21 (Q21.32 against Q20.24 and Q20.25; the third cause of Q21.23 against Q20.09). |
| D6 | Pass | Script: every `Q20.NN` is linked as `[Q20.NN](#q20-NN)` from at least one section or answer (1 to 6 links each); each section ends "Drilled in …" with its own questions (lines 142, 255, 372, 516, 640, 747, 836). |
| D7 | Pass | 25 `<a id="q20-NN"></a>` lines, unique; link check passes. |
| D8 | Pass | 25 questions, SYLLABUS ceiling 25, NG floor 25; 4 exercises, ceiling 4. |
| E1 | Pass | Each of the four exercises has Problem, Constraints (with "Not covered"), Acceptance criteria, two hints, Worked solution (approach, numbered steps, code, "How each criterion is met"), Alternative approach with Trade-offs, three follow-ups and a Tests link. |
| E2 | Pass | Script: the criteria text equals the `it(…)` titles exactly, in both directions, for all four exercises (6 and 6 each, 24 and 24); "How each criterion is met" names the tests. |
| E3 | Pass | 20.1 trace the order (simple), 20.2 remove `NG0100` (§3, §6), 20.3 wrap a widget (§4, §5), 20.4 a leak-free ticker (§2-§5, an integration). |
| E4 | Pass | `ng test` 79 passed, `tsc -p tsconfig.spec.json` and `ng build` exit 0 (the `legacy/` fixtures compile); read: `Chart` and `LiveTicker` inject two collaborators each (at most 4), no `any` in the non-spec files (grep), small classes. |
| E5 | Pass | 8 *Output* questions; Exercise 20.1 asserts the whole log as a literal array. |
| F1 | Pass | Lines 840-844: three paragraphs restating each section's core claim and its most-asked trap with section links 1-7; every fact is taught above. |
| F2 | Pass | Five prompts naming a listener (React developer, teammate, lead, backend developer, reviewer); T-10 is about prompt 4. |
| F3 | Pass | Seven flashcards. |
| F4 | Pass | Connections (2188-2190): Builds on, Read next, Uses these ideas later, each link with a reason. |
| G1 | Pass | 16,241 prose words (module-stats and Python agree): header and verification 382, sections 6,536 (1,037; 835; 901; 1,047; 865; 913; 931), Summary 327, question bank 6,414, exercises 2,210, closing 372. Under the CLOSE limit 16,520 and the REVIEW ceiling 17,420; answers average 223 against the plan's 230. About 230 words are cuttable retelling (T-7), which the cap does not require. |
| G2 | Pass | 6 of 6 SYLLABUS rows covered (table below). |
| H1 | Pass | `ng test` 12 files 79 tests, `tsc -p tsconfig.spec.json --noEmit`, `ng build`: all exit 0. |
| H2 | Pass | `check-links.mjs --planned`: "All links resolve." |
| H3 | Pass | `git status --short`: no stray file from this module; the lab folder, module and plan files are the declared ones, and the scratch directory is outside the repository. |

---

## Module-specific checks (REVIEW-M20 entry)

| Check | Result | Evidence |
|---|---|---|
| Quoted runtime texts `NG0100`, `NG0103`, `NG0203`, `NG0911`, `NG0950` and every hook-order list against a re-run | Pass | run: a scratch copy of the specs printed the messages: `NG0100 … Previous value: 'initial'. Current value: 'changed'. Expression location: _EagerPar component.` (line 682) and `_Counter` with `'1'`/`'2'`; `NG0203: afterNextRender() can only be used within an injection context …` (418); `NG0103: Infinite change detection while refreshing application views. …` (426); `NG0203: takeUntilDestroyed() can only be used …` (559); `NG0911: View has already been destroyed.` (1468); each equals the quoted text, `Find more at https://v22.angular.dev/errors/…` included. `NG0950` (176, 999) and the `inject()` `NG0203` (170) are asserted exactly by `Section 2:` and `Q20.04`. Hook orders: Q20.02 (32 lines), Q20.07, Q20.11, Q20.14, Q20.17, Q20.20, Q20.23 equal their `toEqual` arrays (script); the §1 abridged list, §4 line 404, §5 line 551 and the exercise 20.1 list agree with the specs. The Exercise 20.2 messages (1939-1940) are abridged without a label (T-6). |
| Status markers against the CHANGELOG (F20) and the typings | Partial | docs and package source: all 11 present markers are right: [Stable since v20.0] at 72 and 399 (CHANGELOG 20.0.0 "rename afterRender to afterEveryRender and stabilize"; `@publicApi 20.0`), [Added in v21.0] at 181 (21.0.0 "make SimpleChanges generic"), [Added in v21.2] at 286 (21.2.0 "add ChangeDetectionStrategy.Eager alias for Default"), [Changed in v21.0: zoneless is the default for new apps] at 369 (VERSIONS.md line 69; CHANGELOG 21.0.0 "Add migration for zoneless by default"), [Added in v16.0] at 421 (16.0.0 "introduce concept of DestroyRef"), [Added in v20.1] at 546 (20.1.0 "Add `destroyed` property on `DestroyRef`"), [Stable since v19.0] at 556 (19.0.0 "Promote `takeUntilDestroyed` to stable"; typings `@publicApi 19.0`), [Removed in v22.0] and [Developer preview since v20.0] at 697 (22.0.0 "`ChangeDetectorRef.checkNoChanges` was removed"; typings `@developerPreview 20.0`), the repeat at 1754. The 20.0.1 fix is a plain CHANGELOG sentence (560). Missing or misplaced: T-1. |
| No claim that `afterRender` or `AfterRenderPhase` exist in 22.2.1 (C12) | Pass | package source: grep of `types/core.d.ts`, `fesm2022/core.mjs` and `schematics/migrations.json` finds neither name (only `afterRenderEffect`); the module shows both as removed text only (492-500), cites CHANGELOG 16.2.0, 18.1.0 and 20.0.0 (checked), and words the migration as "not found in the installed file", not "no migration exists" (500). |
| The two docs-versus-run observations worded as observations (C10) | Pass | docs and run: (a) the docs table lists `ngOnInit` (`<td>` at line 41) before `ngOnChanges` (line 46) while the text says "During initialization, the first `ngOnChanges` runs before `ngOnInit`": lines 74, 138, 860 state the observation against the table and cite `Section 1: ngOnChanges runs before ngOnInit` (a bound `n`, as the STATE note says). (b) the docs say that changing state in `ngAfterViewInit` results in `NG0100` (lines 186-209 of `lifecycle.md`); lines 685, 745, 1555 say a signal write did not throw "in the lab", with the 18.0.0 note as "may be related; no test shows it". |
| No server, zone.js-frequency or production-mode claim worded as observed (C2, C3, C5) | Pass | read: server: 431, 437, 514, 1197, 1323, 1724 say "documented", "read, not run" or "never observed"; zone frequency: 133, 301, 369, 1179 "documented only"; production: 668, 1539, 1771 "read, not run", "Production was not run". One basis gap: T-9. |
| No rationale or performance claim (C1) | Pass | read and grep: the only performance words are the typings' "performance degradation" (1259, 1289, quoted as the typings' and "which this module does not measure") and the docs' "very frequently"; 1539 says "The source gives no reason for the split, and this guide claims none". |
| "Deepest first" and "before versus after" statements against the tests | Pass, two corrections | run: destroy deepest first (`Section 1: destroy runs deepest first`: leaf, sib, child, parent); "after" hooks climb (`Section 1: the pre-order hooks go down …`); effect after `ngDoCheck` and before `ngAfterContentInit` (`Section 7`); `ngOnChanges` before `ngOnInit` (`Section 1`). Corrections: line 79 "nothing of `Child`" (the test shows `child.afterEveryRender`, F-2); "after a render" in §4, §7 and Q20.24 (F-1). |
| Status markers at the first body mention | Partial | read: nine of the 11 sit at the first body mention; the OnPush default (line 60, "the v22 default") has none, and `DestroyRef` [Added in v16.0] is at 421 although §3's table (298) mentions `DestroyRef.onDestroy` first (T-1). `ChangeDetectorRef.checkNoChanges` [Removed in v22.0] at 697 follows the internal `view.checkNoChanges()` at 668, a different symbol: acceptable. |
| Every `ɵ`, `LView` and `TView` name marked internal at first use in each section | Pass | read: §1 line 86 ("`TView` and the `ɵ` names are internal, to read and never call"); §5 line 554 ("internals, never to call"); §6 line 668; §7 lines 755 (`TView` (internal), `LView` (internal)) and 802 (WARNING); Q20.22 line 1651 ("`TView` is internal"). §2, §3 and §4 use no `ɵ`, `LView` or `TView` name (they name `getNodeInjectable`, `callHookInternal`, `getHooks`, which are functions, not the listed kinds). None is recommended. |
| Terms defined at first use (script) | Partial | script and read: T-2. |
| SOURCES has the code-source lines for the four exercises and `q20-outputs.spec.ts` (script) | Pass | read: SOURCES lines 1190-1194; per-section test counts in SOURCES (seven, five, seven, seven, seven, six, five) equal the spec counts. |
| Every anchored cross-module link resolves and none is bare | Partial | run (link check) and script: 56 anchored links, all resolve. Bare links to written modules: line 378 `[Module 08]` and line 524 `[Module 05]` (T-8); 16 links to 21, 3 to 22, 7 to 23, 3 to 29, 4 to 32 and 4 to 24, 31, 35, 37 are whole-module pointers ("Read next", "Uses later", "owns it"): 21 is now written (anchors proposed in T-8), 22 is in progress, 23, 24, 29, 31, 32, 35, 37 are unwritten. |
| Every function cited as "read from the 22.2.1 source" found by `grep` in the named file | Pass | package source: `_debug_node-chunk.mjs`: `getNodeInjectable`, `registerPreOrderHooks`, `registerPostOrderHooks`, `directiveHostEndFirstCreatePass`, `ɵɵelementEnd`, `callHook`, `callHooks`, `callHookInternal`, `setActiveConsumer`, `getHooks`, `AFTER_RENDER_PHASES`, `AfterRenderImpl` (`execute`, `register`, `addSequence`), `NOOP_AFTER_RENDER_REF`, `MAXIMUM_REFRESH_RERUNS` (= 10 at 13169; the other, `$1` = 100, is `detectChangesInViewWhileDirty`'s), `synchronize`, `synchronizeOnce`, `tickImpl`, `cleanUpView`, `executeOnDestroys`, `processCleanups`, `listenerInternal` (→ `storeListenerCleanup`), `executeInitAndCheckHooks`, `incrementInitPhaseFlags`, `refreshView`, `runEffectsInView`, `detectChangesInChildComponents`, `detectChangesInView`, `addAfterRenderSequencesForView`, `isExhaustiveCheckNoChanges`, `UseExhaustiveCheckNoChanges`, `throwErrorIfNoChangesMode` (with the "Has it been created in a change detection hook?" hint, line 3615); `_pending_tasks-chunk.mjs`: `createViewEffect`; `rxjs-interop.mjs`: `takeUntilDestroyed`. All found; the behaviors described for `refreshView`, `registerPreOrderHooks`/`registerPostOrderHooks`, `AfterRenderImpl.execute`, `cleanUpView`/`processCleanups`, `takeUntilDestroyed` and `ViewRef.checkNoChanges` match the code. The `synchronizeOnce` description does not (F-1). |
| Sections 4, 5 and 6 have a `#### Legacy` subsection with a migration path | Pass | read: lines 490 (removed `afterRender` form, the rename and the `afterEveryRender({ write })` replacement, no migration found), 592 (the `Subject` + `takeUntil` + `ngOnDestroy` class, compiled by `ng build`, with the manual migration at 624), 724 (`checkNoChanges` removed, `fixture.detectChanges()` instead); §2 has a short one (225). |
| The module does not repeat what 12, 14, 16, 17, 19, 21, 23 and 29 own | Pass | read: one sentence plus a link each (the injection context and `DestroyRef` scopes 16, `effect` scheduling 17, query timing 19, OnPush and `provideCheckNoChangesConfig` 21, strategies compared 23, TestBed depth 29, host-directive hook order 14). The two overlaps with module 21 are a handoff. |
| All seven Mermaid diagrams parse | Pass | run: 7 of 7, mermaid 11.12.0 under jsdom. |
| Every Misconceptions bullet has a cause clause | Partial | script: 24 bullets, 23 with "The myth exists because …", one with the history form (line 369): F-3. |
| Every "in the lab" claim names an existing test | Pass | script: 57 distinct cited names, 0 missing; the four "in the lab" sentences (133, 685, 745, 1555) point at `Section 6:` and `Section 3` tests. |
| Answers and sections reach the pilot's depth (G1, no filler) | Pass | script: G1 row; each section has a source read, a run, a diagram, numbered steps and 2-5 misconceptions. |
| Proposed anchors for the file-level links to 20 in modules 04, 13-17 and 19 | Done | Handoffs table below (14 anchors, 6 stay). |
| No FIX takes the module past 17,420 without cutting as much as it adds | Pass | The FIX tasks below net about -50 words from 16,241 (hard ceiling 17,420). |

## Handoffs (no task here)

Topics that belong to other modules and are only linked, so no row is needed in another plan:

- Injection contexts, `DestroyRef` scopes, `inject()` rules and provider scopes: 16 (the module gives one clause and a link).
- `effect` scheduling and signal graph internals: 17 (the module shows only the effect-after-`ngDoCheck` order).
- Query timing and `viewChild`/`contentChild` results: 19.
- What marks an OnPush view dirty, the scheduler, `provideCheckNoChangesConfig` and the profiler: 21.
- Strategies compared and host-directive hook order: 23 and 14.
- TestBed depth and zoneless test patterns: 29.
- For REVIEW-M21: Q21.32 overlaps Q20.24 and Q20.25 (it links only Q20.09, at its line 1705); the third cause of Q21.23 overlaps Q20.09. No row here.
- Anchors for the 14 file-level links to module 20 (the table in "Proposed FIX tasks", FIX-M20-04).

## Factual findings

**F-1 · Major · the render queue also runs when nothing is dirty (basis: run and package source).** Lines 413, 797 and 1724 (Q20.24) say render callbacks run "only when change detection ran in that pass" / "only if a refresh set the flag". Source: `scheduler.notify(7)` sets `dirtyFlags |= 8` (`_debug_node-chunk.mjs` about 19520) and `synchronizeOnce` runs the render queue when flag 8 is set (about 13332-13365), so registering a hook outside a view with no dirty view still schedules a tick that runs it. Run (scratch spec): `["settled","registered","next ran","after tick 1","after tick 2","every ran","after tick 3"]`; `afterNextRender` ran with no view dirty. Fix: reword the three sentences to "a registered render callback also schedules a tick (flag 8)"; optionally add one `Section 7:` test (SOURCES "five" becomes "six").

**F-2 · Minor · "nothing of Child" (basis: run).** Line 79 says the root's `r` run shows "nothing of `Child`". The `Section 1` root.r test shows `child.afterEveryRender` ran. Fix: "no lifecycle hook of `Child` (only `child.afterEveryRender`)".

**F-3 · Minor · zone-based wording (basis: docs).** Line 369 ("Once true in zone-based apps … until v21 made zoneless the default") implies zone-based apps stopped re-checking. VERSIONS.md line 69 and CHANGELOG 21.0.0: v21 only changed the default for new apps. Fix: cause "zone-based apps were the default before v21".

**F-4 · Minor · stated cause not shown (basis: read).** The Ex 20.2 follow-up (line 1954) states "the parent view is refreshed again in the same pass (section 6, observed)", while line 685 and Q20.20 (1603) say "may be related; no test shows it". Fix: use the same wording as 685.

**F-5 · Nit · quotes not verbatim (basis: docs, v22.2.1 pages).** Line 133 "run very frequently" (docs: "runs very frequently"); lines 666 and 1539 "only in development mode" (docs: "only throws this error in development mode"). Fix: quote exactly.

## Teaching and completeness findings

**T-1 · Minor (C4).** No `[Changed in v22.0: the default]` marker at line 60 (OnPush, "the v22 default"). `DestroyRef [Added in v16.0]` sits at 421 but the first body mention is the §3 table (line 298; also line 26 and the diagram at 275). `view.checkNoChanges()` at 668 precedes the `ChangeDetectorRef` marker at 697: a different symbol, note only.

**T-2 · Minor (B9).** No gloss or owner link at first use: OnPush (60), `ApplicationRef` (413, defined at 797), `ngServerMode` (431), `effect` (167) and `computed` (179) before §3 defines them.

**T-3 · Minor (D1).** Q20.08 has one follow-up (line 1148); the other 24 have two or more. Add a second, asserted by `Section 3: ngOnChanges still runs for a signal input and a computed derives the same value` (`onChanges 1 -> 20`).

**T-4 · Minor.** Q20.07 excerpt (1082-1099) omits the `ngOnChanges` and `ngDoCheck` bodies that print the answer (spec lines 240-245). Q20.04 excerpt (977-991) is stub classes plus an unindented template fragment.

**T-5 · Minor.** Q20.21's title lists four fixes; the answer gives five (adds "write a signal").

**T-6 · Minor.** Ex 20.2 lines 1939-1940 abridge two NG0100 messages without saying so (the second lacks its prefix and location). The `_EagerPar` underscore at 682 is explained only at Q20.20 (1603).

**T-7 · Minor (G1, B10).** About 425 words are retold, about 230 cuttable: Q20.22 (1651, 105 words) vs §1 86 and §7 785/791, cut about 55; Q20.24 (1724, 123) vs §4 411/413 and §7 795/797, about 55; Q20.25 (1754, 107) vs §6 668 and §7 799, about 40; Q20.14 (1365) vs §5 554, about 30; Q20.15 (1383) vs §5 556-560, about 45; Q20.19 (1539, 117) vs §6 668, about 35. Trim target -200.

**T-8 · Minor (anchors).** Bare links to written modules: line 378 `[Module 08]` to `08-browser-rendering-dom-events.md#q08-04`; line 524 `[Module 05]` to `05-js-modules-memory-modern-features.md#4-garbage-collection-and-memory-leaks`. Module 20 has 16 file-level links to 21 (lines 5, 26, 34, 60, 133, 286, 370, 693, 697, 799, 1179, 1603, 1621, 1754, 1804, 2189). Lines 5 and 2189 stay. Proposed: 26 to §5 `#5-zoneless-change-detection-the-scheduler-its-triggers-and-pendingtasks`; 34 to §1 `#1-the-synchronization-problem-dirty-checking-and-fine-grained-reactivity`; 60 to §2 `#2-onpush-and-eager-strategies-and-what-marks-a-view-dirty`; 133, 286, 370, 1179, 1804 to §3 `#3-zonejs-and-ngzone-how-changes-used-to-be-detected-and-why-zone-left-the-default`; 693, 1621 to §7 `#7-changedetectorref-markforcheck-detectchanges-detach-and-reattach`; 697, 799, 1603, 1754 to §8 `#8-debugging-the-profiler-providechecknochangesconfig-and-stability`. Verify against the module 21 headings at FIX time (REVIEW-M21 is pending). Links to 22, 23, 24, 29, 31, 32, 35 and 37 stay (unwritten or in progress).

**T-9 · Minor (basis).** Lines 437 and 1323 say `ngAfterViewInit` runs on the server ("read, not run" / "read from `ngServerMode`") with no named source. Cite that `refreshView` has no `ngServerMode` check, or limit the claim to render callbacks as documented (`dom-apis.md`, `lifecycle.md`). Package source for the render half: `afterEveryRender` and `afterNextRender` return `NOOP_AFTER_RENDER_REF` under `ngServerMode`.

**T-10 · Nit.** Explain-back prompt 4 (line 2139, "`@PreDestroy` vs `DestroyRef.onDestroy`") compares something no section teaches (the §1 callout covers the bean lifecycle only). Reword, or add one §5 sentence.

## Output answer cross-check

All 8 Output questions (Q20.02, 04, 07, 11, 14, 17, 20, 23) were compared with the `toEqual` assertions in `q20-outputs.spec.ts`, by script or by reading (Q20.02 is 32 lines). All equal. The 11 Q20 tests and the 79-test run pass (run). The criteria text of Exercises 20.1-20.4 equals the spec test titles (6 of 6 each).

## SYLLABUS §4 coverage (module-20 checklist, 6 rows)

| Row | Where | Status |
|---|---|---|
| Hook order | §1, §7, Q20.01/02/22/23, Ex 20.1 | Covered |
| Signals and hooks | §3, Q20.06-09, Ex 20.2 | Covered |
| Render hooks | §4, Q20.10-13/24, Ex 20.3 | Covered |
| `DestroyRef` and `takeUntilDestroyed` | §5, Q20.14-18, Ex 20.3/20.4 | Covered |
| NG0100 | §6, Q20.19-21/25, Ex 20.2 | Covered |
| Constructor versus `ngOnInit` | §2, Q20.03-05, Ex 20.4 | Covered |

## Redundancy

About 425 words are retold, about 230 cuttable (T-7). No overlap with modules 16, 17, 19 beyond one sentence and a link. The two overlaps with module 21 are a handoff for REVIEW-M21. Net after the FIX sequence: about -50 words.

## Claims to verify

26 claims sampled; basis on each.

| # | Claim (line) | Basis | Result |
|---|---|---|---|
| 1 | NG0100 `_EagerPar`/`_Counter` texts (682, 1939) | run | match |
| 2 | NG0103, NG0203 (two), NG0911 texts (418, 426, 559, 1468) | run | match |
| 3 | NG0950 and `inject()` NG0203 (170, 176) | run (spec assertions) | match |
| 4 | Q20.02 32-line order | run | match |
| 5 | `ngOnChanges` before `ngOnInit` with docs table opposite (74) | docs and run | match |
| 6 | Destroy deepest first (§1) | run | match |
| 7 | Effect after `ngDoCheck`, before `ngAfterContentInit` (§7) | run | match |
| 8 | `refreshView` order equals the §7 diagram | package source | match |
| 9 | `takeUntilDestroyed` behavior (§5) | package source | match |
| 10 | `afterRender`/`AfterRenderPhase` absent (492-500) | package source | match |
| 11 | Typings quotes (core.d.ts 3146, 3203, 3240, 2531, 2537, 3106) | package source | match |
| 12 | 11 status markers | docs (CHANGELOG) | match |
| 13 | 18.0.0 "guaranteed refreshed" quote | docs | match |
| 14 | "Render callbacks do not run during SSR" | docs | match |
| 15 | "visits each component exactly once" | docs | match |
| 16 | NG0100 "only in development mode" (666, 1539) | docs | paraphrase (F-5) |
| 17 | "run very frequently" (133) | docs | paraphrase (F-5) |
| 18 | `MAXIMUM_REFRESH_RERUNS` = 10 | package source | match |
| 19 | Render queue "only when change detection ran" (413, 797, 1724) | run and package source | wrong (F-1) |
| 20 | "nothing of `Child`" (79) | run | wrong (F-2) |
| 21 | Zone-based apps stopped re-checking (369) | docs | overclaimed (F-3) |
| 22 | Parent view refreshed again (1954) | read | overclaimed (F-4) |
| 23 | Q20.18 helper compiles | run (`ngc`) | match |
| 24 | Seven Mermaid diagrams parse | run | match |
| 25 | `ngAfterViewInit` runs on the server (437, 1323) | read | no named source (T-9) |
| 26 | 57 cited test names exist | script | match |

## Proposed FIX tasks

Ceilings: the module is 16,241 prose words (module-stats and the Python count agree); the ceiling is 17,420. The sequence nets about -50 words. FIX-M20-01 trims first.

### FIX-M20-01 · S · Trim the named retelling (T-7)
- Files: `modules/20-lifecycle-and-render-hooks.md`.
- Do: shorten the Full explanation of Q20.22, Q20.24, Q20.25, Q20.14, Q20.15 and Q20.19 to what the section does not already say, link the section for the rest (targets in T-7). Keep every cited test name, diagram, cause clause and Output answer.
- Acceptance: common rules; prose count at most 16,241 - 200 = 16,041 (both counters).

### FIX-M20-02 · S · Correct the factual slips (F-1 to F-5)
- Files: `modules/20-lifecycle-and-render-hooks.md`; optionally `labs/angular/src/app/modules/20-lifecycle-and-render-hooks/concepts/section-7-under-the-hood.spec.ts` (one `Section 7:` test) and `SOURCES.md` ("five" to "six").
- Do: F-1 reword lines 413, 797 and 1724; F-2 line 79; F-3 line 369; F-4 line 1954; F-5 lines 133, 666, 1539 verbatim.
- Acceptance: common rules; `grep -c "only when change detection ran"` is 0; the 79 tests pass (80 with the new test).

### FIX-M20-03 · S · Markers, glosses, follow-up, excerpts, labels (T-1 to T-6, T-9, T-10)
- Files: `modules/20-lifecycle-and-render-hooks.md`; `_meta/GLOSSARY-TERMS.md` (`## Module 20`, new terms only).
- Do: T-1 marker at line 60 and `DestroyRef` at line 298; T-2 glosses; T-3 second follow-up on Q20.08; T-4 excerpts; T-5 Q20.21 title; T-6 labels; T-9 source for server claims; T-10 prompt 4.
- Acceptance: common rules; `check-snippets . 20` exits 0; 25 of 25 questions have two or more follow-ups; prose count at most +120 words over the count measured just before.

### FIX-M20-04 · S · Anchors for file-level links (T-8; +0 words)
- Files: `modules/20-lifecycle-and-render-hooks.md`; `modules/04-*.md`, `14-*.md`, `15-*.md`, `16-*.md`, `17-signals.md`, `19-*.md` (link targets only).
- Do: apply the T-8 anchors in module 20 and these file-level links to module 20 (verify each heading anchor first): 04:151 to §4 `#4-render-hooks-afternextrender-aftereveryrender-and-their-phases`; 04:743 to `#q20-10`; 14:63 to §4; 14:394 to §3 `#3-which-hooks-still-matter-with-signals`; 15:809 to §5 `#5-teardown-ngondestroy-destroyref-and-takeuntildestroyed`; 16:437 to §2 `#2-constructor-ngoninit-and-inputs-what-exists-when`; 16:650, 16:811 to §5; 16:2045 to §2; 17:288 and 17:1867 to §4; 19:64 to §2; 19:474 to §1 `#1-the-lifecycle-map-phases-and-the-order-of-the-hooks`; 19:1743 to `#q20-02`. Stay file-level: 13:5, 13:2514, 14:2206, 16:2483, 19:5, 19:2526 (module 13 has no candidate link). Re-check the module 21 anchors after REVIEW-M21 FIXes.
- Acceptance: `check-links --planned` exits 0; the word count of every file touched is unchanged; no other text changes.

Common rules for each task: from `labs/angular` run `npx ng test --watch=false --include='src/app/modules/20-lifecycle-and-render-hooks/**/*.spec.ts'` and `npx tsc -p tsconfig.spec.json --noEmit`; `check-links --planned` and `check-snippets . 20` exit 0; cited `Section N:`, `Q20.NN` and `E20.N` names unchanged; the 8 Output answers unchanged; prose count at or under 17,420.

After the four tasks: about 16,241 - 200 + 40 + 120 = 16,201, hard stop 17,420.


Scratch deleted: yes. `/Users/jorge.quintero/.claude/jobs/1324502a/tmp/review-m20/` was removed with an absolute path; no server was left running; `labs/angular/.angular/` and `labs/angular/dist/` are covered by the lab's `.gitignore`.
