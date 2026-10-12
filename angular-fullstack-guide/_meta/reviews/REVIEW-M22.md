# REVIEW-M22: `modules/22-rxjs-foundations.md`

- **Reviewer:** subagent, model claude-sonnet-5-5, session S20261009-1938-claudecode (module written by the PLAN/SEC/EX/QB/CLOSE sessions of module 22, 2026-10-09; the reviewer authored no module-22 task, so it is eligible)
- **Date:** 2026-10-09
- **Files read:** `modules/22-rxjs-foundations.md` (all 2,596 lines, read end to end, then the passages behind each finding re-read, so every line number below comes from that read); `_meta/RUN.md`; `_meta/QUALITY-BAR.md`; `STYLE-GUIDE.md` (§3.2 markers, §4, §5.2, §6); `_meta/reviews/REVIEW-M21.md` (format model); `_meta/TASKS.md` (REVIEW-M22 and the REVIEW-M21 / REVIEW-M20 blocks it inherits from, the module-22 common rules, the FIX-M21 block); `_meta/modules/M22.md` (plan, F1-F35, C1-C13, split table, owner map, breadth table); `SYLLABUS.md` §4 (22); `SOURCES.md` Module 22 section; `VERSIONS.md`; `_meta/GLOSSARY-TERMS.md` `## Module 22`; the lab folder `labs/angular/src/app/modules/22-rxjs-foundations/` (nine `concepts/` specs, `concepts/support/timeline.ts`, `outputs/q22-outputs.spec.ts`, five exercise folders, `legacy/deprecated-forms.ts`) and `labs/ts-js/src/modules` (no `22-*` folder); the installed `rxjs` 7.8.2 (`dist/esm/internal/**`, `dist/types/internal/**`, `CHANGELOG.md`) and `@angular/core` 22.2.1 (`types/rxjs-interop.d.ts`, `types/_debug_node-chunk.d.ts`, `package.json` peers); `rxjs` 6.0.0, 6.1.0, 6.2.0, 6.2.2, 6.3.3, 6.4.0, 6.6.7 and 7.0.0 (`npm pack`, typings and `src/` of the tags SOURCES cites); the `7.x` branch docs (`glossary-and-semantics`, `operators`, `importing`, `observable`, `core-semantics`, `deprecations/multicasting`), the WICG explainer and spec draft, browser-compat-data `api/Observable.json`, the webstatus.dev API, the chromestatus API, the Chrome 135 post and the Reactor 3.8.7 `.adoc` sources (all fetched 2026-10-09).
- **What was run** (Node 24.21.0, `export PATH=/opt/homebrew/opt/node@24/bin:$PATH`, one check at a time): from `labs/angular`, `npx ng test --watch=false --include='src/app/modules/22-rxjs-foundations/**/*.spec.ts'` (AOT test build, jsdom: 15 files, 141 tests, all passed, no `NG8011`); `npx tsc -p tsconfig.spec.json --noEmit` (exit 0); `npx ng build` (exit 0, compiles `legacy/deprecated-forms.ts` and `concepts/support/timeline.ts`); from the guide root, `node labs/tools/check-snippets.mjs . 22` ("All snippets check out.", exit 0); `node labs/tools/check-links.mjs --planned` ("All links resolve.", 492 planned links, exit 0); `node labs/tools/module-stats.mjs` (row 22: 34 Q, 5 Ex, 20,283 prose words, mix Output 13, Concept 8, Difference 5, Bug hunt 4, Design 2, Trade-off 2, no flags) and the QUALITY-BAR Python count (20,283, the same); the Mermaid parser (mermaid 11.12.0 under jsdom, installed in the scratch directory): 9 of 9 diagrams parse; a probe spec in a scratch copy of the lab (configs copied, `node_modules` symlinked, results printed by failing one assertion) that re-ran under `ng test`: the names of `rxjs/operators` that differ from `'rxjs'` (113 names, 7 differ), `merge` from the subpath (a function, not an Observable), error propagation of `combineLatest`, `zip`, `merge`, `concat`, `race`, `withLatestFrom` and `forkJoin`, `debounceTime` and `auditTime` on a steady stream, `takeUntil(fromEvent(signal, 'abort'))` on an already-aborted signal, `buffer` on a notifier, `throttleTime` with both edges at complete; two `node` one-liners (`Promise.all` fail-fast; `error` after `complete` on a `BehaviorSubject`). Scripts (read-only): cited-test-name check (85 cited `Section N:` names against the specs, exact), criteria against test titles (all five exercises), Output answers against the `toEqual` arrays, section and question anatomy counts, answer word counts, first-use scan, `Q22.NN` link scan, status-marker first-mention scan, URL scan, link-context extraction for every link to 22 in earlier modules, `grep` of every internal name in the file the module names.
- **Basis of each finding:** stated on the finding as **run** (executed), **package source** (read in the installed 7.8.2 or an npm-packed older version), **docs** (7.x docs, WICG, Reactor, MDN data, CHANGELOG) or **read** (read in the module or the labs, nothing executed). **could not verify** where nothing could be checked.
- **Probe files:** only under `/Users/jorge.quintero/.claude/jobs/1324502a/tmp/review-m22/` (scratch lab copy, Mermaid install, packed rxjs tarballs, fetched docs, logs); deleted at the end (last line of this file).

Overall: a careful, honest module with no Fail and no Major finding. Everything it quotes from a run reproduced: all 13 *Output* answers equal their `toEqual` arrays (run), all 85 cited `Section N:` names exist exactly (86 section tests, one uncited), the criteria of Exercises 22.1-22.5 equal the test titles word for word, every internal name "read from the 7.8.2 source" is found by `grep` in the file named, every status marker traces to a typings tag, a tag source or the CHANGELOG, the WICG, MDN, webstatus.dev, chromestatus, Chrome 135 and Reactor quotes match the sources fetched today, and the module never says that a v8 shipped. The weak points are small: `fromEvent` is called cold in two answers while §3 and Q22.10 call it hot (F-1); `Promise.all` is said to wait for settlement (F-2); the header says every spec is pure RxJS (F-3); two exercise "alternative" sentences are stale or wrong (F-4, F-5); one marker replacement is the author's, not the typings' (F-6); the glossary dates a deprecation the docs do not date (F-7); earlier modules credit module 22 with `takeUntilDestroyed` and with flattening operators it does not teach (F-8); the §6 problem links three wrong questions (T-1); two *Output* short answers carry no reasoning (T-2); a set of first-use terms is unglossed (T-3); a Design question's title and code disagree (T-4); an answer snippet misleads about call order (T-5); some unmeasured or unrecorded statements (T-6); "RxJS 9" is promised and absent (T-7); one overlap link is missing (T-8); about 560 words are retold, about 400 cuttable (T-9); and anchors for 10 file-level links in 8 modules (T-10). Net after the proposed tasks: about -140 words from 20,283, far under the 21,350 ceiling.

---

## QUALITY-BAR

Counts: **42 Pass, 3 Partial, 0 Fail, 0 N/A** (45 items). Items not Pass: B9, C1, D2. (The CLOSE-M22 record is not compared here; each row below is a fresh check.)

| ID | Result | Evidence |
|---|---|---|
| A1 | Pass | Header lines 3-9 in STYLE-GUIDE §4.1 order (What this covers, Prerequisites, Leads to, Applies to, Study time, Short on time, Labs with the run command). I ran the command: 15 files, 141 tests passed. F-3 is a wording slip inside the Labs line. |
| A2 | Pass | Prerequisites (line 4) link 04 and 07 with anchors; both resolve (link check). |
| A3 | Pass | Short on time (line 8): four section links, five question IDs (Q22.06, 12, 16, 29, 31), Exercise 22.5 and the Summary link; every link resolves. |
| A4 | Pass | The Contents (11-26) list the nine sections and the five closing sections; the `## ` headings are §1 (30), §2 (143), §3 (236), §4 (324), §5 (428), §6 (508), §7 (635), §8 (737), §9 (845), Summary (924), Question bank (932), Hands-on exercises (2103), Check your understanding (2533), Connections (2592). |
| A5 | Pass | Order: what an Observable is (§1), its parts (§2), cold and hot (§3), Subjects (§4), operators (§5), catalogue (§6), combination (§7), timing (§8), the mechanism (§9, the deepest). Forward links (`Subject` in §3, `OperatorSubscriber` in §5, `lift` in §2) are labelled with their section. |
| B1 | Pass | Script: each of the six subsection headings appears 9 times; `#### Legacy` 7 times (§1-§7, as required; §8 and §9 have none by plan). |
| B2 | Pass | Read: each "problem it solves" opens with a concrete failure (a second `subscribe` that "starts everything again", a leaked interval, two components that call the server twice, a bus one `complete()` silences, a leaking custom operator, `first()` failing on an empty response, a `forkJoin` that never emits, a search box that sends a request per keystroke, an `unsubscribe` that stops a source three operators up). |
| B3 | Pass | 9 `mermaid` blocks and 9 `What to notice` lines; 9 of 9 parse under mermaid 11.12.0 (run); none rendered in a browser. |
| B4 | Pass | Read: each section has a "read from the `rxjs` 7.8.2 source" answer; every named file and function found by `grep` (Module-specific checks). |
| B5 | Pass | Read: every `### Code` has the approach sentence and numbered steps. |
| B6 | Pass | Read: every best-practice item (35 of 35) has a "because". |
| B7 | Pass | Read: all 40 Misconceptions bullets carry a cause clause ("the habit comes from", "suggests", "because"); the one "once true" bullet (§8, 841) cites CHANGELOG 7.0.0-beta.8 and a `[Changed in v7.0: …]` marker. |
| B8 | Pass | Read: the WICG callout (§1, 87-88, `[!NOTE]` Framework vs platform), the Reactor callout (§3, 275-276, `[!TIP]` Coming from the backend, with **Where the analogy breaks**) and Q22.14 (1419) present; `[!WARNING]` callouts open with the tag. |
| B9 | Partial | Defined at first use with an owner link: Observable, producer, consumer, push, pull, subscription, teardown, microtask, `AbortController`, TDZ, `defer`, backpressure, marble diagram, frame, `ObservableInput`, `scheduler`, fake timers, internal API. Not glossed at first use: `WebSocketSubject` and `AnonymousSubject` (376), the notifier of `buffer(notifier)` and `takeUntil(n)` (552, 560), `Unsubscribable` (232), `thenable` (131, the idea is in 76), `discriminated union` (2247), `idempotent` (2119), `Symbol.observable` (2210): T-3. |
| B10 | Pass | Read: a topic another module owns gets one sentence and a link (`takeUntilDestroyed` to 20 §5, `toSignal` to 17 §8, the `async` pipe to 14 §8, `switchMap` and the typeahead to 23, `HttpClient` to 27). Inside-module retelling is T-9. |
| C1 | Partial | 31 claims sampled and traced (table below); 24 match, and seven are wrong, overclaimed or unrecorded: F-1 (`fromEvent` called cold), F-2 (`Promise.all` and settlement), F-4 (a stale "not run"), F-5 (an alternative not run that fails), F-6 (marker replacement), T-6 (two unmeasured comparisons and an unrecorded history). No Major. |
| C2 | Pass | 13 *Output* questions (Q22.02, 03, 06, 08, 11, 12, 16, 17, 24, 25, 26, 28, 31), each with a test named after its ID in `outputs/q22-outputs.spec.ts` asserting exactly the printed lines (cross-check below). Q22.07, 18, 21, 22, 29 (Bug hunt and Design) also have tests there. |
| C3 | Pass | Script: 85 cited `Section N:` names, all exact against the specs; 86 section tests, the one uncited is `Section 5: the deprecated forms in legacy/deprecated-forms still run` (cited in SOURCES). Every "in the lab" and "observed" sentence names a test or is worded "read, not run". |
| C4 | Pass | Docs, CHANGELOG, typings and packed older versions: every marker present is right (list in Module-specific checks), at its first body mention. Divergence from the plan, verified: the instance operators `merge`, `concat`, `zip`, `combineLatest` are marked "since v6.0" (not v7.0) because the 6.0.0 typings carry `@deprecated Deprecated in favor of static merge`; `race` is v6.2 (the 6.0.0 and 6.1.0 typings have none, 6.2.0 has). F-6 is a nit on one replacement slot. |
| C5 | Pass | Package source: every API in a snippet is in the 7.8.2 or 22.2.1 typings and compiles under `ng test`, `tsc` and `ng build`; the removed or internal names appear only as text labelled internal. |
| C6 | Pass | Grep: 0 `Unverified`, TASK, PLACEHOLDER or relink markers. |
| C7 | Pass | `check-snippets.mjs . 22` exit 0. Excerpts carry the `// Excerpt of` line, Output snippets carry a `// Partial:` line where they omit setup, the `legacy/` samples are labelled. |
| C8 | Pass | Script: the module has no external URL; SOURCES Module 22 covers the package, the tags 5.5.12 to 7.0.0, the docs files, WICG, MDN, webstatus.dev, Chrome 135, chromestatus, Reactor, the Spring Boot and `reactor-bom` POMs, the five exercises and the outputs spec. T-7 is a wording slip about RxJS 9, which needs no source because the module states nothing about it. |
| D1 | Pass | Script: 34 each of `### Q`, Short answer, Full explanation, Follow-ups, Trap to avoid; at least 2 follow-ups per answer; answers average 211 words, minimum 161 (Q22.08), maximum 272 (Q22.27). |
| D2 | Partial | The short answers of Q22.28 (9 words plus the table) and Q22.31 (14) are one headline sentence and the printed lines; the reasoning is only in the Full explanation. Q22.27 and Q22.30 have table short answers of 137 and 111 words (not a 30-second answer). T-2. |
| D3 | Pass | module-stats: Output 13, Concept 8, Difference 5, Bug hunt 4, Design 2, Trade-off 2 (6 tags; largest 38%); matches the plan. |
| D4 | Pass | Titles follow the sections, basic idea to internals (Q22.01-04 §1, through Q22.33-34 §9). |
| D5 | Pass | No duplicate question in 01-21 beyond linked overlaps (Q14.27, Q17.40, Q19.06, Q20.15, Q21.04 are linked as follow-ups). Q02.19 (debounce versus throttle, generic) is not linked from Q22.30: T-8. |
| D6 | Pass | Script: every `Q22.NN` is linked as `[Q22.NN](#q22-NN)` from the body; each section ends "Drilled in …" with its own questions. §6's problem sentence points three of its four links at the wrong question: T-1. |
| D7 | Pass | 34 `<a id="q22-NN"></a>` lines, unique; link check passes. |
| D8 | Pass | 34 questions (ceiling 35, floor 25), 5 exercises (ceiling 5, floor 4); PROGRESS row says 34 / 35. |
| E1 | Pass | Each exercise has Problem, Constraints (with "Not covered"), Acceptance criteria, two hints, Worked solution, Alternative approach with Trade-offs, two follow-ups and a Tests link. |
| E2 | Pass | Script: the criteria of Ex 22.1 (7), 22.2 (6), 22.3 (6), 22.4 (6) and 22.5 (6) equal the `it()` or `criterion:` titles exactly (modulo backticks); the "How each criterion is met" lists name the observed values. |
| E3 | Pass | Exercises progress from a hand-built Observable to a feed that uses `forkJoin`, `combineLatest`, `share` and `withLatestFrom`. |
| E4 | Pass | `ng test` 141 passed, `tsc -p tsconfig.spec.json` and `ng build` exit 0; read: classes inject at most 2 collaborators, no `any` in non-spec files, `timeline.ts` has no `vi` or `expect` (the grep hit is its own comment). |
| E5 | Pass | 13 *Output* questions; exercise specs assert whole logs as literal arrays. |
| F1 | Pass | Summary (924-930): three paragraphs restating each section's core claim and trap with section links; nothing not taught above. |
| F2 | Pass | Check your understanding (2535-2540): five explain-back prompts naming a listener. |
| F3 | Pass | Eight flashcards. |
| F4 | Pass | Connections (2594-2596): Builds on, Read next, Uses later, each link with a reason (T-7 lists the later modules the plan names and the line omits). |
| G1 | Pass | 20,283 prose words (module-stats and Python agree), under the CLOSE limit 20,450 and the REVIEW ceiling 21,350; sections 851-975, answers average 211. About 400 words are cuttable retelling (T-9), which the cap does not require. |
| G2 | Pass | 8 of 8 SYLLABUS rows covered (table below). |
| H1 | Pass | `ng test` 15 files 141 tests, `tsc -p tsconfig.spec.json --noEmit`, `ng build`: all exit 0. |
| H2 | Pass | `check-links.mjs --planned`: "All links resolve." |
| H3 | Pass | `git status --short`: the lab folder and the module are the only new paths of module 22; `labs/angular/package.json` and `package-lock.json` differ only by the `zone.js` 0.16.3 line of the HOUSE ruling in LOG (not module 22); no file under `labs/ts-js`; `dist` and `.angular` are gitignored. |

---

## Module-specific checks (REVIEW-M22 entry)

| Check | Result | Evidence |
|---|---|---|
| Every recorded array and frame table (F1-F35) against a re-run on `rxjs` 7.8.2 under `ng test` | Pass | run: the 141-test run reproduces F1-F29 and F31 through the section, outputs and exercise specs (the frame tables of §7 and §8, the 13 Output arrays, the per-class subject tables, `share` and `connectable`). The probe added: `rxjs/operators` has 113 names of which exactly `combineLatest`, `concat`, `merge`, `onErrorResumeNext`, `partition`, `race`, `zip` differ from `'rxjs'`; `merge(of(1), of(2))` from the subpath is a function; `debounceTime(3)` on `a-b-c-d-e-f-g-h|` gives `h@15` and complete only, and `h@17` on an unfinished source (the starvation that §8 words "read, not run"). |
| Status markers against the CHANGELOG, the `7.0.0` tag and the typings (F4, F7, F16, F25, F26); no marker on `rxjs/operators` | Pass | docs, package source, packed tags: `firstValueFrom`/`lastValueFrom` [Added in v7.0] (CHANGELOG 7.0.0-beta.0); `toPromise` [Deprecated since v7.0] (7.8.2 `Observable.d.ts:114-118`); positional `subscribe` [Deprecated since v6.4] (`Observable.d.ts:44`, docs "introduced in RxJS 6.4"); `Observable.create` and `Subject.create` v6.4 (`@deprecated use new Observable() instead` present in the 6.4.0 package, absent in 6.3.3); the multicast family v7.0 (docs "introduced in RxJS 7.0"); `merge`, `concat`, `zip`, `combineLatest` v6.0 and `race` v6.2 (packed 6.0.0, 6.1.0 and 6.2.0 typings); `pluck` v7.0 (`@deprecated` at `7.0.0/src/internal/operators/pluck.ts:77`, absent in 6.6.7); `partition` operator v6.5 (6.6.7 typings and CHANGELOG line 751); `pairs` v7.0 (CHANGELOG 7.0.0-beta.8); `onErrorResumeNext` v7.6 (CHANGELOG 7.6.0); `[Added in v7.2]` (CHANGELOG 7.2.0); `useDeprecatedSynchronousErrorHandling` v6.0 (typings "a deprecated behavior in v6 and higher"); `pendingUntilEvent` [Developer preview since v20.0] (`rxjs-interop.d.ts:171`); no marker on the subpath, the docs sentence and the typings difference are both stated (460). F-6 is the only nit. |
| The "removed in v8" wording never states a v8 that shipped (F33) | Pass | read and grep: no prose says "removed in v8"; the typings quote "To be removed in v9" for `mapTo` (603) and "the next major" (870, 878) are quoted as typings text. |
| No RxJS 9 rationale or roadmap claim (C1) | Pass, one wording slip | grep: the module states nothing about RxJS 9; line 28 lists "RxJS 9" among documented-only topics although nothing is cited: T-7. |
| The WICG status dated 2026-10-09 with the chromestatus disagreement stated; nothing worded as observed in a browser (C3) | Pass | docs: the spec draft says "Draft Community Group Report" dated 21 November 2025 and "not a W3C Standard nor is it on the W3C Standards Track"; browser-compat-data `api/Observable.json`: Chrome 135, Edge mirror, Firefox and Safari `false`, `experimental`; webstatus.dev API: Chrome and Chrome Android 135 (2025-04-01), Edge 135, baseline `limited`, Mozilla `negative` (issue 945), Apple `support` (issue 292); the Chrome 135 post says "The Observable API is now supported."; chromestatus API: "In development", desktop 135. All as the module states (88, 139, 1057); `Section 1: jsdom and Node expose no global Observable` is the only run claim. |
| Reactor documented only; the callout states **Where the analogy breaks** (C4) | Pass | docs: Reactor 3.8.7 `.adoc` sources (tag `v3.8.7`) contain "Nothing happens until you *subscribe*", "A *Cold* sequence starts anew for each `Subscriber`", "at most `n` elements", "push-pull hybrid", "`share()` and `replay(...)`", "emits at most one item"; callout 275-276 and Q22.14 (1419) state the break (`request(n)`, `Mono`, no demand channel). Nothing is run. |
| No performance or memory claim (C7) | Pass, two quantity nits | read: "`zip` buffers grow with the lag" (725) is a source read ("read, not measured", 687); "at twice the code" (2205) and "less code" (2363) are unmeasured: T-6. |
| The import-path trap (F25) is correct and every example imports from `'rxjs'` | Pass | run: seven names differ, nine named others are the same object (spec line 195), `merge` from the subpath returns a function; read: every snippet imports from `'rxjs'` (the `rxjs/operators` form appears only in text and in `legacy/`). |
| Error classes asserted by `name` | Pass | read: Q22.25 prints `E:EmptyError`, `E:SequenceError`, `E:NotFoundError` from `err.name`; Q22.17 prints `ObjectUnsubscribedError`. |
| Every internal name marked internal at first use in each section and found by `grep` in the named file | Pass | package source: `SafeSubscriber`, `ConsumerObserver`, `errorContext`, `_trySubscribe` (`Observable.js`, `Subscriber.js`), `operate`, `lift` (`util/lift.js`), `OperatorSubscriber`, `onFinalize` (`operators/OperatorSubscriber.js`), `timeoutProvider`, `reportUnhandledError`, `currentObservers`, `_innerSubscribe`, `_checkFinalizedStatuses`, `_throwIfClosed` (`Subject.js`), `_trimBuffer` (`ReplaySubject.js`), `_finalizers`, `execFinalizer` (`Subscription.js`), `connection`, `refCount`, `resetConnection`, `hasCompleted`, `hasErrored`, `handleReset` (`share.js`), `scanInternals`, `emitWhenIdle`, `isComplete`, `endDuration`, `startThrottle`, `remainingFirstValues`, `buffers`: all found, behavior as described. Each carries "(internal)" at first use in §2, §4, §5, §6 and §9. |
| Frame tables and marbles in prose each backed by a `timeline()` test | Pass | run: §7 (668-680) and §8 (763-798) lines map to `Section 7:` and `Section 8:` tests; the third `throttleTime` row (`leading: false, trailing: false`, 771) is asserted at `section-8-timing.spec.ts:62`. |
| The 22/23 split respected | Pass | read: no higher-order mapping, error-strategy, `shareReplay` or scheduler teaching; each is one sentence and a link to 23 (544, 273, 306, 787, 825, 2443, 2526). |
| `takeUntilDestroyed` not retold from 20 | Pass | read: only a pointer row (84) and the Connections link. Other modules credit it to 22: F-8. |
| Terms defined at first use (script) | Partial | script and read: T-3. |
| SOURCES has the code-source lines for the five exercises, the outputs spec, the package, tag, WICG, MDN, webstatus.dev, Chrome and Reactor reads (script) | Pass | read: all present; section test counts (9, 11, 9, 13, 10, 11, 10, 8, 5) equal the specs (86). The npm registry and the 9.0.0-beta.0 release-note lines the plan names (F33) are not in SOURCES, and the module does not use them (T-7). |
| Every anchored cross-module link resolves and none is bare | Pass | run (link check): all resolve; no bare link to a written module in the body; bare links only at the header (5), Connections (2595, 2596) and to unwritten modules. |
| Sections 1 to 7 have a `#### Legacy` subsection with a migration path | Pass | read: 7 `#### Legacy` at 117, 213, 304, 406, 485, 600, 712, each with the current form. |
| The module does not repeat what 04, 07, 14, 17, 19, 20 and 21 own | Pass | read: one sentence plus a link each (Promise 04 §3, generics 07 §1, `async` pipe 14 §8, `toSignal` 17 §8, `output()` 19 §6, `takeUntilDestroyed` 20 §5, emission and rendering 21 not retold). |
| All nine Mermaid diagrams parse | Pass | run: 9 of 9, mermaid 11.12.0 under jsdom. |
| Reactor and WICG callouts present; every Misconceptions bullet has a cause clause | Pass | read: lines 87-88, 275-279; 40 of 40 bullets. |
| Every "in the lab" claim names an existing test | Pass | script: 85 cited names, 0 missing. |
| Type mix and the Output tests match (Output 13, Concept 8, Difference 5, Bug hunt 4, Design 2, Trade-off 2) | Pass | module-stats equals; 13 Output tests equal. |
| Answers and sections reach the pilot's depth (G1, no filler) | Pass | G1 row; filler is T-9 only. |
| `ng build` compiles `legacy/deprecated-forms.ts`; `timeline.ts` has no `vi` or `expect`; no file under `labs/ts-js`; no `package.json` change | Pass | run and read: build exit 0; `timeline.ts` 26 lines; `ls labs/ts-js/src/modules` has no `22-*`; the only `package.json` diff is the zone.js ruling (H3). |
| Proposed anchors for file-level links to 22 in the earlier modules | Done | Handoffs table below (10 anchors, 5 retargets). |
| No FIX takes the module past 21,350 without cutting as much as it adds | Pass | The FIX tasks net about -140 words from 20,283. |

## Handoffs

Topics that belong to other modules and are only linked:

- `takeUntilDestroyed`, `DestroyRef`: 20 §5 (pointer row 84; Connections). Modules 16 (829, 1700, 2271) call it "module 22's": F-8.
- `toSignal`, `toObservable`, `rxResource`: 17 §8 and 23. `output()`, `outputFromObservable`: 19 §6. The `async` pipe: 14 §8. Emission and rendering: 21 §5.
- `switchMap`, `mergeMap`, `concatMap`, `exhaustMap`, `catchError`, `retry`, `shareReplay`, schedulers, `TestScheduler`: 23 (modules 04:1515 and 04:1619 link to 22 for them: F-8).
- Debounce versus throttle without RxJS: Q02.19 (T-8).
- Anchors for the file-level links to module 22 (table below, FIX-M22-05). Modules 12, 13, 15, 18 have no link to 22.

Module 22 slugs: S1 `#1-push-collections-observables-promises-iterators-and-laziness`; S2 `#2-anatomy-observable-observer-subscription-and-teardown`; S3 `#3-cold-and-hot-unicast-and-multicast`; S4 `#4-subjects-subject-behaviorsubject-replaysubject-and-asyncsubject`; S5 `#5-pipeable-operators-and-writing-your-own`; S6 `#6-the-operator-catalogue-creation-transformation-filtering-utility-conditional-and-aggregation`; S7 `#7-combining-streams-combinelatest-withlatestfrom-forkjoin-zip-merge-and-concat`; S8 `#8-timing-operators-debouncetime-throttletime-audittime-and-sampletime`; S9 `#9-under-the-hood-subscribe-the-subscriber-chain-and-the-subjects-observer-list`; questions `#q22-NN`. Module 20 §5 slug: `#5-teardown-ngondestroy-destroyref-and-takeuntildestroyed`.

| File:line | Context | Anchor |
|---|---|---|
| 02:493 | RxJS provides `debounceTime`, `throttleTime`, `auditTime` | S8 |
| 02:1263 | `debounceTime` and `throttleTime` on event streams | S8 |
| 03:1390 | iterators pull, Observables push | S1 |
| 04:435 | Observables push, async iterators pulled | S1 |
| 04:1127 | combining HTTP calls with `forkJoin` | S7 |
| 07:1125 | typed `Subject<Payload>` per event | S4 |
| 14:781 | a cold source starts its work per subscriber | S3 |
| 17:1826 | RxJS versus the WICG Observable proposal | S1 |
| 19:164 | Module 22 owns `Subject` | S4 |
| 20:524 | a `Subscription` is an RxJS handle `unsubscribe()` ends | S2 |
| 04:1515, 04:1619 | `mergeMap`, `exhaustMap`, `concatMap`, `switchMap` | retarget to `23-rxjs-in-depth.md` (planned; no anchor yet): F-8 |
| 16:829, 16:1700, 16:2271 | "`takeUntilDestroyed` is module 22's" | relink to 20 §5 and say "module 20's": F-8 |

Stay file-level: 02:1638, 03:1699, 04:5, 04:1700, 07:5, 07:1365, 14:2206, 16:2483, 20:5, 20:2234, 21:5, 21:2710, 21:2711. Verify each line and heading at FIX time (line numbers move if an earlier FIX edits those files).

## Factual findings

**F-1 · Minor · fromEvent called cold in two answers, hot in three places (basis: read and docs).** Q22.11's Full explanation (1333) says "Each `subscribe` creates a producer for `interval` and `fromEvent`, which is what cold means"; Q22.10's Short answer (1263) says "Subscribe twice and count producer runs: two means cold, one means shared", which classes `fromEvent` as cold (two listeners). §3 (319) and Q22.10's own follow-up (1268) say `fromEvent` is hot by the docs' definition (`glossary-and-semantics.md`: hot is "created outside of the context of the subscribe action") and unicast per subscription. Counting producer runs separates unicast from multicast, not cold from hot. Fix: 1263 "two means unicast, one means shared (cold sources are always unicast; a hot source may still be unicast, like `fromEvent`)"; 1333 "`interval` is cold; `fromEvent` is hot by the docs' definition yet adds a listener per subscription, so it is unicast".

**F-2 · Minor · Promise.all "waits for settlement" (basis: run and read).** Lines 691 and 1906 say `Promise.all` waits for settlement. Run: `Promise.all([Promise.reject(x), neverSettles])` rejects at once; module 04 §4 (261-262) says `Promise.all` waits for all to fulfil and fails fast, and that `allSettled` waits for settlement. Fix: "`Promise.all` waits for every promise to fulfil and rejects at the first rejection; `forkJoin` waits for every source to complete and errors at the first error".

**F-3 · Nit · "every spec is pure RxJS" (basis: read).** Line 9 says every spec is pure RxJS. The specs of §1 (`EventEmitter`, `rxjs-interop`), §3 (`HttpClient`, `HttpTestingController`, `TestBed`), §4 (`EventEmitter`), Ex 22.2 and Ex 22.5 (`TestBed`, `createEnvironmentInjector`, `DestroyRef`) import Angular. Fix: "section specs, fixtures, … (RxJS specs; a few use `EventEmitter`, `HttpClient` and `TestBed`; no `labs/ts-js` files)".

**F-4 · Nit · stale "not run" (basis: run).** Ex 22.4's trade-off (2439) says the trailing `throttleTime` "complete path was not run here". `Section 8: throttleTime leading and trailing combinations` asserts both edge configurations with a value pending at complete (`f@17`, complete@17; table 769-770), and the probe `-a-b|` with `{ leading: true, trailing: true }` and 10 gave `a@1`, `b@11`, complete@11. Fix: drop the clause or cite the test.

**F-5 · Minor · an untested alternative that fails the exercise's own criterion (basis: run).** Ex 22.3's alternative (2363) offers `takeUntil(fromEvent(signal, 'abort'))` for `takeUntilAbort` and says "not run here". Run (probe): with an already-aborted signal the composed operator neither completes nor tears the source down, because the `abort` event has already fired; criterion 3 requires completing at once. Fix: say so, name the `signal.aborted` guard it needs, and add the expectation inside the criterion-3 test (no new `it`, so criteria and test titles stay equal).

**F-6 · Nit · a replacement the typings do not give (basis: package source).** Line 217 marks `Subscriber.create` `[Deprecated since v7.0 — pass an observer to subscribe]`. The 7.8.2 typings (`Subscriber.d.ts:22-24`) say "Do not use. Will be removed in v8. There is no replacement for this method"; the CHANGELOG (7.0.0-beta.7) says `Subscriber.create` and `new Subscriber` are deprecated. "Pass an observer to subscribe" is the author's advice. Fix: `[Deprecated since v7.0 — no replacement]` and keep the advice in the sentence.

**F-7 · Nit · glossary dates a deprecation the docs do not date (basis: docs).** `_meta/GLOSSARY-TERMS.md` Module 22, `rxjs/operators` subpath: "documented as deprecated since 7.2". The docs (`importing.md`) say "deprecated" with no version and "will be removed in one of the next major versions"; the CHANGELOG 7.2.0 says importing from it "will be deprecated soon". The module (460) states it correctly. Fix the glossary entry.

**F-8 · Minor · other modules credit module 22 with what it does not teach (basis: read).** `modules/16-dependency-injection.md` lines 829, 1700 and 2271 say `takeUntilDestroyed` is "module 22's" (829 adds 23); module 22 only points to 20 §5 (84), and the plan and module 20 §5 own it. `modules/04-js-async-event-loop.md` lines 1515 and 1619 link `mergeMap(fn, concurrency)`, `exhaustMap`, `concatMap` and `switchMap` to module 22; the split table gives them to 23. Fix: relink 16 to 20 §5 ("module 20's"); retarget 04 to `23-rxjs-in-depth.md`.

## Teaching and completeness findings

**T-1 · Minor (D6).** §6's problem paragraph (512) links "`scan` fits" to Q22.23 (the purpose question, acceptable), "`first()` fails" to Q22.24 (scan versus reduce; first is Q22.25), "`distinctUntilChanged` lets equal objects through" to Q22.25 (first/take; distinct is Q22.26) and "the previous and the current value" to Q22.26 (distinct; `pairwise` is in Q22.23). Fix: scan [Q22.24], `first()` [Q22.25], `distinctUntilChanged` [Q22.26], previous and current [Q22.23].

**T-2 · Minor (D2).** Q22.28 (1930) and Q22.31 (2025) short answers are a headline sentence plus the printed lines, with no reasoning. Add one sentence each (about +20 words): Q22.28 "the frame is when the rule is met: `combineLatest` waits for both sources, `zip` pairs by position, `concat` starts the second source after the first completes"; Q22.31 "debounce waits for silence, throttle opens a window on the first value, audit emits at the window's end, sample looks at a fixed clock". Nit, accepted: the table short answers of Q22.27 (137 words) and Q22.30 (111) exceed a 30-second answer; the tables are the answer.

**T-3 · Minor (B9).** No gloss or owner link at first use: `WebSocketSubject` and `AnonymousSubject` (376); the notifier of `buffer(notifier)` (552) and `takeUntil(n)`, `skipUntil(n)` (560, `n` undefined); `Unsubscribable` (232); `thenable` (131); `idempotent` (2119, a criterion text that must equal its test title: gloss it in the hint or solution); `discriminated union` (2247, link 07); `Symbol.observable` (2210). Add one clause each (about +55 words) and the terms to `_meta/GLOSSARY-TERMS.md` `## Module 22`.

**T-4 · Nit.** Q22.21 (1644) is titled "Write the `tapFirst` operator from scratch" and its printed Code (1657-1670) is the composition with `defer` and `tap`; the from-scratch version is Exercise 22.3. Retitle "Write a `tapFirst` operator: what must it do with `error`, `complete` and teardown?" (the ID and anchor stay).

**T-5 · Nit.** Q22.18's snippet (1570-1573) calls `next`, `complete`, `error` and `unsubscribe` in sequence on one store, but `error()` after `complete()` is ignored by a stopped Subject (package source `Subject.js` `error`: `if (!this.isStopped)`; run: `hasError` false, `getValue()` 0), so the sequence does not show the break the Short answer lists. The Full explanation says "tried on a separate store each". Add a comment to the snippet: `// each call on its own store`.

**T-6 · Nit (could not verify).** 2194 "a first version returned the link from the producer, and the counting loop never saw `closed` (the run hung)" is an unrecorded run (no test or log; first-person history, as REVIEW-M21 T-4 flagged); 2205 "at twice the code" and 2363 "less code" are unmeasured. Replace with a measured statement (line counts of `mini-observable.ts`) or cut; the hung-run sentence can stay as a trap only if worded as a consequence the spec shows (a `miniTake(3)` loop test that would never end is not runnable).

**T-7 · Nit.** Line 28 lists "RxJS 9" among topics "documented only: cited and dated" but the module says nothing about RxJS 9 and cites nothing (SOURCES has no registry or release-note line, consistent with that). Drop "RxJS 9" from the list. Connections "Uses these ideas later" (2596) names 23, 24, 25, 27, 29; the plan (M22.md 360) also names 26, 28, 31, 32, 40. Add them with a reason each (about +25 words) or accept the shorter line.

**T-8 · Nit (D5, §5.2).** Q22.30, Q22.32 and §8 do not link Q02.19 ("What is the difference between debounce and throttle?"), which module 02 owns and which links forward to 22. Add one clause and the link in Q22.30's follow-ups (about +15 words).

**T-9 · Minor (G1, B10).** About 560 words are retold, about 400 cuttable (answer to section): Q22.13 (1399, 118 words) repeats §3's legacy refactor map (306) about 70; Q22.20 (1633) repeats §5's `pipeFromArray` and subpath sentences (452, 460) about 80; Q22.34 (2093) repeats §9 (884, 886) about 90; Q22.33 (2070-2075) vs §9 about 60; Q22.30 (1998) vs §8's source read (785) about 55; Q22.12 (1381) vs §3 (267) about 40; Q22.16 (1498) and Q22.15 (1437) vs §4 (367) about 40 and 35; Q22.27 (1902), Q22.25 (1831), Q22.24 (1785) about 30 each. Keep every cited test name, cause clause, "read from the source" pointer and Output answer; keep each answer at least 160 words (the shortest is 161). Trim target -400.

**T-10 · Minor (anchors).** See the Handoffs table: 10 file-level links to 22 in modules 02, 03, 04, 07, 14, 17, 19, 20 get section anchors; 5 links are retargeted (F-8).

Format note (nit, accepted): the first `**Full explanation.**` at Q22.09 (1221) is followed by a numbered list with no blank line, the same pattern as module 21.

## Output answer cross-check

All 13 Output questions (Q22.02, 03, 06, 08, 11, 12, 16, 17, 24, 25, 26, 28, 31) were compared with the `toEqual` arrays in `outputs/q22-outputs.spec.ts` by script and reading. All equal, including the fifteen lines of Q22.11, the eighteen of Q22.16 and the frame tables of Q22.28 and Q22.31; the printed lines of Q22.08 come from the fake-timer run. The 141-test run passes (run). The Bug hunt and Design tests (Q22.07, 18, 21, 22, 29) match the prose they back (Q22.29's `[b,x]@3`, `[a,s]@0`, `[b,s]@2`).

## SYLLABUS §4 coverage (module-22 checklist, 8 rows)

| Row | Where | Status |
|---|---|---|
| Observables as push collections; Observable vs Promise vs iterator; laziness | §1, Q22.01-03, Ex 22.1 | Covered |
| Anatomy: `Observable`, `Observer`, `Subscription`, teardown; building one by hand | §2, Q22.05-09, Q22.33, Ex 22.1 | Covered |
| Cold vs hot; unicast vs multicast | §3, Q22.10-13, Ex 22.5 | Covered |
| Subjects and when a Subject is a smell | §4, Q22.15-19, Q22.34, Ex 22.2 | Covered |
| Operator catalogue by purpose, including combination and timing | §6-§8, Q22.23-32, Ex 22.4, 22.5 | Covered |
| Pipeable operators and writing a custom operator | §5, Q22.20-22, Ex 22.3 | Covered |
| Framework vs platform: RxJS vs the WICG `Observable` (status verified) | §1 callout, Q22.04 | Covered |
| Coming from the backend: RxJS vs Project Reactor (cold, backpressure) | §3 callout, Q22.14 | Covered |

## Redundancy

About 560 words are retold, about 400 cuttable (T-9). No overlap with modules 04, 07, 14, 17, 19, 20, 21 beyond one sentence and a link. Net after the FIX sequence: about -140 words.

## Claims to verify

31 claims sampled; basis on each.

| # | Claim (line) | Basis | Result |
|---|---|---|---|
| 1 | 13 Output answers | run | match |
| 2 | 85 cited `Section N:` names | script | match |
| 3 | Criteria of Ex 22.1-22.5 equal test titles | script | match |
| 4 | Seven `rxjs/operators` names differ, nine others are the same object (460) | run | match |
| 5 | `merge(of(1), of(2))` from the subpath is a function (463) | run | match |
| 6 | Errors end every combination operator, "run for `forkJoin` only" (693) | run (probe, all seven) | match; the module can say all seven |
| 7 | `debounceTime` starves on a steady stream (785, 756) | run (probe) | match (worded "read, not run") |
| 8 | `Promise.all` waits for settlement (691, 1906) | run, read | slip (F-2) |
| 9 | `fromEvent` "is what cold means" (1333) | read, docs | contradiction (F-1) |
| 10 | Trailing `throttleTime` complete path "not run" (2439) | run | stale (F-4) |
| 11 | `takeUntil(fromEvent(signal, 'abort'))` equals `takeUntilAbort` (2363) | run (probe) | not equivalent (F-5) |
| 12 | `Subscriber.create` marker replacement (217) | package source | slip (F-6) |
| 13 | `first` is `filter`, `take(1)`, `defaultIfEmpty` or `throwIfEmpty`; `last` is `takeLast(1)` | package source | match |
| 14 | `single` errors `EmptyError`, `SequenceError`, `NotFoundError` as listed (563) | package source | match |
| 15 | `connectable().connect()` runs `defer(() => source).subscribe(subject)` (1399) | package source | match |
| 16 | `sampleTime` is `sample(interval)`, the pending value is lost (785) | package source | match |
| 17 | `throttle.js` completes at once unless trailing with a value pending; `send` calls `startThrottle` (785, 838) | package source | match |
| 18 | `config.onUnhandledError` "always" async; `onStoppedNotification` no-op by default | package source | match |
| 19 | `Observable.create` and `Subject.create` deprecated from 6.4 | package (6.3.3, 6.4.0) | match |
| 20 | `merge`, `concat`, `zip`, `combineLatest` v6.0; `race` v6.2 | package (6.0.0 to 6.2.2 typings) | match |
| 21 | `pluck` v7.0, absent in 6.6.7 | package (7.0.0 source, 6.6.7) | match |
| 22 | `@angular/core` peer `rxjs ^6.5.3 \|\| ^7.4.0`; `EventEmitter extends Subject<T>, OutputRef<T>` | package source | match |
| 23 | rxjs-interop `@publicApi 19.0`, `20.0`, `22.0` and `@developerPreview 20.0` (83-84) | package source | match |
| 24 | WICG: `when()` text, `addTeardown()`, operator list (88, 279, 1055) | docs (explainer) | match |
| 25 | Spec draft 21 November 2025, "not on the W3C Standards Track" | docs | match |
| 26 | Chrome and Edge 135, Firefox and Safari `false`, Mozilla `negative`, Apple `support`, chromestatus "In development" | docs (BCD, webstatus API, chromestatus API) | match |
| 27 | Chrome 135 post quote (139) | docs | match |
| 28 | Reactor 3.8.7 quotes (276, 1417, 1419) | docs (`.adoc` at the tag) | match |
| 29 | Glossary and importing docs quotes (244, 436, 460) | docs (7.x branch) | match |
| 30 | `deprecations/multicasting.md` refactor map (306, 1399) | docs | match |
| 31 | Ex 22.4 "twice the code" / "less code" (2205, 2363) | could not verify | unmeasured (T-6) |

## Proposed FIX tasks

Ceilings: the module is 20,283 prose words (module-stats and the Python count agree); CLOSE limit 20,450; ceiling 21,350. The sequence nets about -140 words. FIX-M22-01 trims first.

### FIX-M22-01 · S · Trim the named retelling (T-9)
- Files: `modules/22-rxjs-foundations.md`.
- Do: shorten the Full explanation of Q22.13, 20, 34, 33, 30, 12, 16, 15, 27, 25 and 24 to what the section does not already say and link the section for the rest (T-9 lists the pairs and sizes). Keep every cited test name, cause clause, "read from the source" pointer, diagram and Output answer; keep each answer at least 160 words.
- Acceptance: common rules; prose count at most 20,283 - 400 = 19,883 (both counters).
- Budget: -400.

### FIX-M22-02 · S · Correct the factual slips (F-1 to F-7, T-6)
- Files: `modules/22-rxjs-foundations.md`; `_meta/GLOSSARY-TERMS.md` (`## Module 22`, the `rxjs/operators` entry); `labs/angular/src/app/modules/22-rxjs-foundations/exercise-3-custom-operators/custom-operators.spec.ts` (expectations inside the criterion-3 test only).
- Do: F-1 lines 1263 and 1333; F-2 lines 691 and 1906; F-3 line 9; F-4 line 2439; F-5 line 2363 with the added expectation (an already-aborted signal gives no `complete` for `takeUntil(fromEvent(signal, 'abort'))`, assert it in the criterion-3 test, keep 141 tests and the criterion text unchanged); F-6 line 217; F-7 glossary; T-6 lines 2194, 2205, 2363 (measure or cut). Find lines by text; they move after FIX-M22-01.
- Acceptance: common rules; the 141 tests pass; `grep -c "pure RxJS"` is 0; prose at most +60 over the count measured just before.
- Budget: at most +60.

### FIX-M22-03 · M · Link mapping, short answers, glosses, small teaching fixes (T-1 to T-5, T-7, T-8)
- Files: `modules/22-rxjs-foundations.md`; `_meta/GLOSSARY-TERMS.md` (`## Module 22`, new terms only).
- Do: T-1 line 512 links; T-2 reasoning sentence in the Q22.28 and Q22.31 short answers (Output answers' printed lines unchanged); T-3 glosses and glossary terms; T-4 retitle Q22.21; T-5 snippet comment in Q22.18; T-7 drop "RxJS 9" from line 28 and extend Connections "Uses later"; T-8 link Q02.19 in Q22.30.
- Acceptance: common rules; `check-snippets . 22` exits 0; prose at most +200 over the count measured just before.
- Budget: at most +200.

### FIX-M22-04 · S · Ownership links in modules 16 and 04 (F-8; +0 words)
- Files: `modules/16-dependency-injection.md` (lines 829, 1700, 2271), `modules/04-js-async-event-loop.md` (lines 1515, 1619).
- Do: in 16, "`takeUntilDestroyed` is [module 22](22-rxjs-foundations.md)'s" becomes "[module 20 §5](20-lifecycle-and-render-hooks.md#5-teardown-ngondestroy-destroyref-and-takeuntildestroyed)'s" (keep the "and 23" at 829; line 2271 reads "module 20"); in 04, the two links to 22 for `mergeMap`, `exhaustMap`, `concatMap` and `switchMap` point to `23-rxjs-in-depth.md`.
- Acceptance: `check-links --planned` exits 0; word count of each file touched changes by at most 3; no other text changes.

### FIX-M22-05 · S · Anchors for file-level links (T-10; +0 words)
- Files: `modules/02-*.md`, `03-*.md`, `04-*.md`, `07-*.md`, `14-*.md`, `17-signals.md`, `19-*.md`, `20-*.md` (link targets only).
- Do: apply the table in Handoffs (verify each heading anchor in module 22 first, after FIX-M22-01 to 03, and each line after FIX-M22-04). Stay file-level: the header, "Read next" and "Uses later" lines listed there.
- Acceptance: `check-links --planned` exits 0; word count of every file touched unchanged; no other text changes.

Common rules for each task: from `labs/angular` run `npx ng test --watch=false --include='src/app/modules/22-rxjs-foundations/**/*.spec.ts'` (15 files, 141 tests) and `npx tsc -p tsconfig.spec.json --noEmit`; `check-links --planned` and `check-snippets . 22` exit 0; cited `Section N:`, `Q22.NN` and `E22.N` names unchanged; the 13 Output answers unchanged; prose count at or under 21,350.

After the five tasks: about 20,283 - 400 + 60 + 200 = 20,143, hard stop 21,350.


Scratch deleted: yes. `/Users/jorge.quintero/.claude/jobs/1324502a/tmp/review-m22/` was removed with an absolute path (the `lab/node_modules` symlink removed first, not followed); no server or vitest process was left running; `labs/angular/.angular/` and `labs/angular/dist/` are covered by the lab's `.gitignore`.
