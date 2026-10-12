# REVIEW-M26: `modules/26-signal-forms.md`

- **Reviewer:** subagent, model claude-opus-5-5, session S20261011-1837-claudecode. The module was written by PLAN-M26 (S20261011-1251-claudecode, resumed in S20261011-1354-claudecode, planner claude-opus-5-5), SEC-M26-01..09 (S20261011-1354-claudecode, writers claude-sonnet-5-5), EX-M26-01..05 (S20261011-1715-claudecode, claude-sonnet-5-5) and QB-M26-01..06 and CLOSE-M26 (S20261011-1752-claudecode, claude-sonnet-5-5), per the `Done by` fields and LOG. The reviewer wrote no module-26 task and is not a continuation of those conversations, so it is eligible.
- **Date:** 2026-10-11
- **Files read:** `modules/26-signal-forms.md` (all 2,102 lines, read end to end in chunks; line numbers below come from that read and move at FIX time); `_meta/RUN.md` §5, §6, §7, §10; `_meta/QUALITY-BAR.md`; `_meta/TASKS.md` (REVIEW-M26, REVIEW-M25, the module-26 common rules, the FIX-M25 block); `_meta/reviews/REVIEW-M25.md` (format model); `_meta/modules/M26.md` (facts F1-F29, C1-C12, owner map, breadth gate, bank table rows by `grep`); `_meta/STATE.md` (standing note "For REVIEW-M26 and Jorge"); `_meta/LOG.md` (EX-M26-03..05 and QB-M26-01..06 lines, for the recorded mutation and throwaway compile runs); `_meta/GLOSSARY-TERMS.md` (Module 26 terms); `SOURCES.md` (Module 26 block, line 1461 to the end); `VERSIONS.md` row 68; `STYLE-GUIDE.md` line 150 (callout topics); the lab folder `labs/angular/src/app/modules/26-signal-forms/` (all spec titles by script, the Output assertions, the Exercise 26.3 spec and schema, `rating.ts` key handling, `legacy-review-form.ts`); the installed `@angular/forms` 22.2.1 (`fesm2022/{signals,_validation_errors-chunk,signals-compat,forms}.mjs`, `types/{signals,_structure-chunk,signals-compat}.d.ts`) and `@angular/core` `fesm2022/_debug_node-chunk.mjs`, by `grep` and short reads; `npm pack` of `@angular/forms` 21.2.25 and 22.0.0 (typings); the Angular `CHANGELOG.md` and the `main` docs `adev/src/content/guide/forms/signals/{comparison,overview,async-operations,form-submission,migration,validation}.md` (fetched 2026-10-11 from `raw.githubusercontent.com`); the link lines to 26 in modules 11, 17, 21, 22, 25; module 25 Q25.34 short answer and its `Section 10` spec title.
- **What was run** (Node 24.21.0, `export PATH=/opt/homebrew/opt/node@24/bin:$PATH`, one check at a time): from `labs/angular`, `npx ng test --watch=false --include='src/app/modules/26-signal-forms/**/*.spec.ts'` (15 files, 143 tests, all passed); `npx tsc -p tsconfig.spec.json --noEmit` (exit 0); `npx ng build` (exit 0, no warnings; compiles `legacy/legacy-apis.ts` and every exercise source); the Exercise 26.3 spec alone five more times (10/10 each); from the guide root, `node labs/tools/check-links.mjs --planned` ("All links resolve.", 458 planned links, exit 0); `node labs/tools/check-snippets.mjs . 26` ("All snippets check out.", exit 0); `node labs/tools/module-stats.mjs` (row 26: 28 Q, 5 Ex, 18,973 prose words, Output 9, Concept 8, Difference 4, Bug hunt 3, Trade-off 3, Design 1, no flags); the QUALITY-BAR one-liner (18,973); the Mermaid parser (mermaid 11.12.0 under jsdom 26.1.0 in a `mktemp -d` scratch directory; a malformed negative control fails as it should): 9 of 9 diagrams parse; a scratch `tsc` probe against the lab's TypeScript and `@angular/forms` 22.2.1 typings that reproduced every compile-time code the module quotes (TS2339 `f.a.value`, TS2345 `min` on a string, TS2322 boolean from `validate`, TS2416 `checked` on a `FormValueControl` and the mirror `value` on a `FormCheckboxControl`, TS2345 `form(input())`). Scripts (read-only): cited-test-name check, exercise criteria against `it()` titles, D1 anatomy with follow-up and answer word counts, `[Q26.NN](#q26-NN)` link-ID match and coverage, misconception cause and best-practice "because" scans, first-body-mention marker scan, internal-name marking per section/question/exercise, `grep` of every internal name in the named file, docs and typings quote checks, CHANGELOG attribution by version heading, URL and SOURCES scans, link-context extraction for every link to 26 in modules 11-25.
- **Basis of each finding:** stated on the finding as **run** (executed), **package source** (read in the installed `@angular/forms` 22.2.1 or the `npm pack` tarballs), **docs** (Angular `main` docs, CHANGELOG) or **read** (read in the module, the labs, LOG or SOURCES, nothing executed).
- **Probe files:** only under a `mktemp -d` directory outside the repo (Mermaid install and parse script, `npm pack` tarballs, fetched CHANGELOG and docs, the `tsc` probe) and the session scratchpad (test log, scripts); deleted at the end (last line of this file). No probe spec was added to the labs.

Overall: a strong, honest module with no Fail and no Major finding. Everything quoted from a run reproduced: the nine *Output* answers equal their assertions (run), all 94 distinct cited `Section N:`, `Q26.NN …` and `E26.N …` names exist and every spec `it` title is cited somewhere, the criteria of Exercises 26.1-26.5 equal their test titles (Ex 26.5 modulo backticks), every offered alternative runs through the same tests, every status marker sits at its first body mention with a version that traces to the typings, the `npm pack` reads and a CHANGELOG heading, the deprecation date's basis is stated, no CHANGELOG line above 22.2.1 is cited as shipped, the sixteen docs quotes and ten of eleven typings quotes are verbatim, the C6 status sentence is quoted and not adjudicated, there is no Zod import, and the sampled source reads match 22.2.1 (`deepSignal`, `FIELD_PROXY_HANDLER`, `getNativeControlValue`, `nativeControlCreate`, `shouldSkipValidation`, the `validateAsync` status mapping, `submit`/`shouldRunAction`, `ɵngControlCreate` order and error 1914, the `FormRoot` handler, `ɵɵcontrol`, code 1920). The weak points are small: §6 says only the discard of a stale load is asserted while Q26.17 asserts the abort (F-1); one Q26.24 follow-up says a value-model control cannot sit under `formControlName`, which the source, Exercise 26.5's own variant and module 25's test contradict (F-2); one typings quote is not verbatim (F-3); eight internal names lack the "internal" mark in their unit (F-4); three reader-text slips (F-5); one misconception without a cause clause (T-1); two forward uses without a definition or link (T-2); a 15 ms real-time margin in an Exercise 26.3 DOM spec (T-3); two stale titles in the plan file (T-4); 15 file-level links to 26 that can take anchors (T-5). Net after the proposed tasks: about +70 words from 18,973 (about 19,045), far under the 20,070 ceiling.

---

## QUALITY-BAR

45 items: **41 Pass, 4 Partial (B7, B9, C1, E4), 0 Fail.**

| ID | Result | Evidence |
|---|---|---|
| A1 | Pass | Header lines 3-9 in STYLE-GUIDE §4.1 order (What this covers, Prerequisites, Leads to, Applies to, Study time, Short on time, Labs with the run command). I ran the command: 15 files, 143 tests passed. |
| A2 | Pass | Prerequisites (line 4) link 17 §2, §6, §7, 25 §1 and §10 with anchors; all resolve (link check, run). |
| A3 | Pass | Short on time (line 8): four section links (§1, §2, §4, §7), six question IDs (Q26.02, 09, 14, 17, 21, 28), Exercise 26.1 and the Summary. |
| A4 | Pass | Contents (11-26) list the nine sections and the five closing sections; `## ` headings at 30, 121, 219, 296, 389, 472, 561, 666, 766, Summary 879, Question bank 887, Hands-on exercises 1712, Check your understanding 2051, Connections 2097. |
| A5 | Pass | Model, field tree, binding, per-field rules, cross-field and conditional rules, async rules, submission, then the control-selection internals (§8) and interop (§9), the order M26.md's breadth gate justifies. |
| B1 | Pass | Script: each of the six subsection headings appears 9 times; `#### Legacy` 3 times (§5 444, §8 729, §9 835), each with a migration path ("Migrate by wrapping the function in `{ when }`", "Migrate by trading the provider and four methods…", the v21 and 22.2.1 `Partial:` blocks). |
| B2 | Pass | Read: each problem opens with a failure (drifting copies, TS2339 / `NG0203` / a banner that never lights, lost `.ng-invalid` borders, a `min` that stops compiling, a confirmation error on the wrong field, a request per keystroke, a double post, four CVA callbacks, a big-bang rewrite). |
| B3 | Pass | Nine analogies and nine `mermaid` blocks of the planned types (flowchart LR, classDiagram, sequenceDiagram, flowchart TD, flowchart TD, stateDiagram-v2, sequenceDiagram, flowchart TD, flowchart LR), nine `What to notice` lines; 9 of 9 parse under mermaid 11.12.0 (run); none rendered in a browser. |
| B4 | Pass | Read and package source: each section answers a "why" from a named file and function (`deepSignal`/`valueForWrite`, `FIELD_PROXY_HANDLER`/`ensureChildrenMap`, `getNativeControlValue`/`nativeControlCreate`/`installClassBindingEffect`, `normalizeErrors`, `FieldValidationState`/`shouldSkipValidation`, `validateAsync`'s params and status mapping, `submit`/`setSubmissionErrors`/`shouldRunAction`, `ɵngControlCreate`, `signalErrorsToValidationErrors`/`reactiveErrorsToSignalErrors`); every name found by `grep` in the file named. |
| B5 | Pass | Read: every `### Code` has an approach sentence and numbered steps (§7 and §9 number both snippets). |
| B6 | Pass | Script: all 31 best-practice items carry "because". |
| B7 | Partial | Script and read: 35 of 36 Misconceptions bullets give the correction and a cause; §2's first bullet ("`f.name.value()` reads the value") gives only the correction (T-1). The two "Once true" bullets (§1 `@experimental 21.0.0`, §4 21.2.25 `min` typing) cite the `npm pack` read and the 22.0.0 CHANGELOG (package source, docs). |
| B8 | Pass | Forms are not on STYLE-GUIDE line 150's *Framework vs platform* list; no *Coming from the backend* is required (C2) and none is written. |
| B9 | Partial | Read against the 60 Module 26 glossary terms: all are bold or defined at first use in their section, except `FormField`, used in §1 (70, 90) and defined only in §3 (227), and `ignoreValidators`, used in §6's last misconception (557) with no link to §7 where it is defined (T-2). |
| B10 | Pass | Read: the 16/17/25 split holds (module-specific table). |
| C1 | Partial | 30 claims sampled (table below); 27 match; one stale scope statement (F-1), one wrong follow-up (F-2), one non-verbatim quote (F-3). |
| C2 | Pass | 9 *Output* questions (Q26.03, 06, 09, 11, 13, 14, 17, 21, 25), each with a test named after its ID in `outputs/q26-outputs.spec.ts` asserting exactly the printed result (cross-check below). |
| C3 | Pass | Script: 156 citations, 94 distinct, 0 missing; every spec `it` title is cited (the nine uncited names are `describe` labels). The throwaway compile runs (Q26.05 NG8118, Q26.26 mirror TS2416) are recorded in the QB-M26-01 and -06 LOG lines; the mirror was reproduced by this review's `tsc` probe (run); NG8118 was not re-run (read). |
| C4 | Pass | Marker scan (run as script): six markers, each once and plain, at the first body mention: `[Stable since v22.0]` (38), `[Changed in v22: numbers or null only]` on `min` (256, first `min` in the body), `[Deprecated since v22.0 — use { when }]` (446, with its typings-only basis stated), `[Changed in v22: touched is an input …]` (674), `[Added in v22.0]` `ngNoCva` (702), `[Added in v22.1]` `isFieldTree` (808). Versions checked in the module-specific table. |
| C5 | Pass | `ng test`, `tsc` and `ng build` exit 0; every API in a snippet is in the 22.2.1 export lists of `signals.d.ts`/`_structure-chunk.d.ts`/`signals-compat.d.ts` (package source). |
| C6 | Pass | Grep: 0 `Unverified`, `TASK:`, placeholder or relink markers. |
| C7 | Pass | `check-snippets.mjs . 26` exit 0. |
| C8 | Pass | The module has no URL. SOURCES Module 26 (1461-end, 56 lines) has the package reads, both `npm pack` reads, the CHANGELOG lines (22.0.0, 22.1.0, 21.2.12, 21.0.9, the `perf` line), the six docs pages, the five exercise code lines and five outputs-spec lines. |
| D1 | Pass | Script: 28 each of `### Q`, Short answer, Full explanation, Follow-ups, Trap to avoid; every answer has two follow-ups; answer parts 179-286 words (Q26.14 to Q26.01), none above 290. |
| D2 | Pass | Read: every Output short answer gives the result and the reason. |
| D3 | Pass | module-stats: Output 9, Concept 8, Difference 4, Bug hunt 3, Trade-off 3, Design 1 (largest 32%); equals the plan. |
| D4 | Pass | Titles follow the sections (Q26.01-02 §1 to Q26.27-28 §9). |
| D5 | Pass | Read: no duplicate inside the module; cross-module neighbours are linked, not repeated (Q25.01, Q25.02 owns the three-way choice, Q25.15, Q25.16, Q25.18 is the reactive design that Q26.20 links, Q25.31, Q25.34, Q16.12, Q17.19, Q17.21, Q17.22, Q19.04, Q22.30; each heading checked). |
| D6 | Pass | Script: 82 `[Q26.NN](#q26-NN)` links, IDs match; every Q26.NN is linked from the body outside the bank. |
| D7 | Pass | 28 `<a id="q26-NN">` lines, unique; link check passes. |
| D8 | Pass | 28 questions (ceiling 28), 5 exercises (ceiling 5). |
| E1 | Pass | Each exercise has Problem, Constraints (with "Not covered"), Acceptance criteria, two hints, Worked solution with a criterion account, Alternative with Trade-offs, two or three follow-ups and a Tests link. |
| E2 | Pass | Script: the criteria of Ex 26.1-26.5 (6, 5, 5, 6, 5) equal the `it()` titles (Ex 26.5 modulo backticks) and every exercise test belongs to a criterion. |
| E3 | Pass | From a sign-up form (26.1) to a custom control reused in a reactive `FormGroup` (26.5), integrating §4, §8 and §9. |
| E4 | Partial | 143 tests pass (run); `grep`: no `vi.`/`expect(` in non-spec files, no `console.log`, no `zod`; at most one injected dependency per exercise class (read). But Exercise 26.3's quick-changes DOM spec spaces three inputs 5 ms apart against a 20 ms debounce in real time: it passed 6 of 6 runs here, yet a loaded runner can stretch a 5 ms timer past 20 ms (T-3). The untested arrow-key handler in `rating.ts` is declared under "Not covered" (acceptable). |
| E5 | Pass | 9 Output questions; exercise specs assert exact values, call logs and rendered text. |
| F1 | Pass | Summary (879-885): three paragraphs, each section's claim and trap with a section link; nothing new. |
| F2 | Pass | Four explain-back prompts naming a listener (2053-2057); all four describe true behaviour. |
| F3 | Pass | Six flashcards. |
| F4 | Pass | Builds on, Read next, Uses these ideas later and Comparisons (2099-2102); links resolve; reasons given; planned files at file level. |
| G1 | Pass | 18,973 prose words (module-stats and the one-liner agree), under the CLOSE limit 19,170 and the ceiling 20,070. |
| G2 | Pass | 6 of 6 SYLLABUS §4 rows covered (table below). |
| H1 | Pass | `ng test` 15 files 143 tests, `tsc -p tsconfig.spec.json --noEmit`, `ng build`: all exit 0 (run). |
| H2 | Pass | `check-links.mjs --planned`: "All links resolve." (run). |
| H3 | Pass | `git status`: the module-26 lab folder is new; `labs/angular/package.json` differs only by the earlier `zone.js` 0.16.3 ruling; no `labs/ts-js/src/modules/26-*`; `dist` and `.angular` are gitignored. |

## Module-specific checks (REVIEW-M26 entry)

| Check | Result | Evidence |
|---|---|---|
| Every recorded value, error kind, error location, status and call log (F6-F26) against a re-run on 22.2.1 under `ng test` | Pass | run: the 143-test run asserts every value quoted; prose literals match the spec literals (spot-read: `{"name":"Bob","age":30}`, `Cy`, `true`; `required,min,email`; `mismatch`/`treeMismatch`; `0, true × 3, true, 1`; `pending true, valid false, invalid false`; `server:taken`; the CVA call order; `keyInParent()` `'1'`; `{ required: { kind: 'required' } }`). |
| Model sync (F6) and its source read | Pass | package source: `deepSignal` and `valueForWrite` in `_validation_errors-chunk.mjs` (2 hits each); run: the three `Section 1` tests and Q26.03's two tests. |
| Root `errors()` versus `errorSummary()` (F9) | Pass | run: `Section 2: the root errors() is empty while errorSummary() lists the descendants`, Q26.09 (`0`, `required,min,email`); stated in §2, §4, Q26.04, Q26.09, Q26.13, Q26.21 and the Summary consistently. |
| Skip rule for disabled, hidden, readonly (F14) and the template-only `@if` case | Pass | package source: `shouldSkipValidation = computed(() => hidden() \|\| disabled() \|\| readonly() \|\| structure.isOrphaned())` (`_validation_errors-chunk.mjs` 778); run: `Section 5: disabled, hidden and readonly fields report no errors`, `Section 5: a field hidden only in the template still invalidates the form`, Q26.14, Q26.16. |
| Async mapping (F17): pending neither valid nor invalid, no request while sync rules fail; cancellation backed by a test | Pass, one stale sentence | package source: `validateAsync` returns `undefined` params when `shouldSkipValidation() \|\| !syncValid()` or `when` is false and maps `idle`/`loading`/`reloading`/`resolved`/`local`/`error` as stated (`signals.mjs` 494-520); run: the `Section 6` tests and `Q26.17 a value change while loading runs a second load and the first one finishes with its signal aborted` (`aborted` `[true, false]`). §6 509 still says "the lab loader ignores its abort signal, so only the discard is asserted": F-1. |
| Debounce rule versus option, blur flush (F11, F19) | Pass | package source: the option feeds `debounced(() => params(), opts.debounce)` (`signals.mjs` 482); run: `Section 6: a debounced field writes the model after the delay`, `… blur flushes a debounced value`, `… the debounce option of validateAsync delays the loader`, `Q26.19 touching a field does not flush the debounce option …`; docs quote verbatim (`async-operations.md`). |
| Submit protocol and server-error routing (F20-F22) | Pass | package source: `submit` returns `false` while submitting, calls `markAsTouched()` before `shouldRunAction`, returns `!errors \|\| errors.length === 0`, resets in `finally`; `shouldRunAction` (`_validation_errors-chunk.mjs` 1872-1881); `FormRoot` handler calls `preventDefault()` then `submit(fieldTree)` only with `submitOptions` (`signals.mjs` 1498-1503); run: the nine `Section 7` tests, Q26.21. |
| Custom-control contract and the CVA path (F23-F25) | Pass, one wrong follow-up | package source: `ɵngControlCreate` tests `controlValueAccessor`, then `host.customControl`, then a native element, else `_RuntimeError(1914, …)` (`signals.mjs` 1377-1390); run: the `Section 8` tests and Q26.25. Q26.24's second follow-up contradicts `NgControl.ngControlCreate` in `forms.mjs` 2171-2180: F-2. |
| Compat runs (F26); no `ng generate` claim (F28) | Pass | run: the six `Section 9` tests; `grep 'ng generate'`: 0; §9 and Q26.28 say no forms schematic ships (read, consistent with F28). Code 1920 in `signals-compat.mjs` 714 (package source). |
| Every status marker against the typings tags, the CHANGELOG and the `npm pack` reads (F2-F4), at first body mention | Pass | package source: `form` `@publicApi 22.0` in 22.2.1 (`_structure-chunk.d.ts`), `@experimental 21.0.0` in 21.2.25; `isFieldTree` the only `@publicApi 22.1` (`signals.d.ts` 509); `min`/`max` `TValue extends number \| null` in 22.0.0, `number \| string \| null` in 21.2.25; `touched?` input plus `touch?: OutputRef<void>` in 22.0.0, `ModelSignal \| … \| OutputRef` in 21.2.25. docs: CHANGELOG 22.0.0 (2026-06-03) "graduate signal forms APIs to public API", the `min`/`max` breaking note (1103-1104, wrapped), "split the `touched` model …", "support ngNoCva …"; 22.1.0 "add utility to assert that value is a field tree". Position: C4 row. |
| `[Deprecated since v22.0 — use { when }]` basis stated | Pass | §5 Legacy (446) and Q26.16 state "no version" in the typings and the 21.2.25 (function form only, 0 deprecation notes) versus 22.0.0 (3 notes) `npm pack` reads; both reproduced (package source). |
| No CHANGELOG line above 22.2.1 cited as shipped (C1) | Pass | `grep`: no 22.2.2 or 22.3 line; cited lines sit under 22.0.0, 22.1.0, 21.2.12 (concurrent submits, verified) and 21.0.9 (the `[formField]` rename, verified). |
| Docs quotes verbatim with branch `main` and date; C6 not adjudicated | Pass | docs: all sixteen quoted phrases found in the fetched `main` files (whitespace-normalized table rows); each carries branch `main` and 2026-10-11; §1 and Q26.02 quote "Stable (v22+)" and "You need production-ready stability" and say the guide does not adjudicate. |
| No Zod import (C3) | Pass | `grep zod` in the lab folder: 0; the Standard Schema tests use a hand-written `~standard` object. |
| Probe-first claims (C9) backed by tests or absent | Pass | run: Q26.05 (`form(input())` TS2345 under `@ts-expect-error`; the copy-versus-`linkedSignal` test), Q26.16 (`@if` test), Q26.26 (TS2416 kept; the v21 `touched` half moved to `Section 9: a v21 touched model compiles on 22 but its writes do not reach the field`), §2 arrays (`Section 2: a field tree over an array exposes items by index`). |
| Every internal name of C12 marked internal at first use in each section and found by `grep` | Pass for `grep`, Partial for marking | package source: every name found in the file the module names. Marking: F-4 lists eight unmarked first uses. |
| Owner credit and the 16/17/25 split | Pass | read: injection context 16 §4/Q16.12; `linkedSignal` 17 §5/Q17.19, drafts Q17.21; `resource` 17 §6/Q17.22; `model()` 17 §7/Q19.04; zoneless scheduler 21 §5; timing operators Q22.30; `rxResource` 23 §7; CVA 25 §10/Q25.31; reactive validators 25 §5/§6, Q25.15, Q25.16, Q25.18; accessible errors 11 §6, display 25 §8; two-way binding 13 §5; HTTP 27, testing 29. No retelling beyond one sentence and a link. |
| Output short answers give the reason | Pass | read: all nine. |
| Every question link points at the intended ID | Pass | script: 82 links, IDs match; 13 cross-module question targets checked against their headings. |
| Terms defined at first use (script) | Partial | B9 row (T-2). |
| SOURCES has the exercise and outputs code-source lines and the package, typings, CHANGELOG and docs reads (script) | Pass | C8 row. |
| Every anchored cross-module link resolves; none bare except planned files | Pass | run (link check); file-level links only in the header, Connections and to 27, 28, 29, 36 and module 29 in the verification paragraph. |
| Sections 5, 8 and 9 have a `#### Legacy` subsection with a migration path | Pass | B1 row. |
| All nine Mermaid diagrams parse | Pass | run: 9 of 9; negative control fails. |
| Every Misconceptions bullet has a cause clause | Partial | 35 of 36 (T-1). |
| Every "in the lab" claim names an existing test | Pass | C3 row; the mutation runs quoted in Ex 26.3 (removing the debounce logs `abc`, `abcd`), Ex 26.4 (the concurrency spec passes without `[disabled]`) and the Ex 26.5 mutations are in the EX-M26-03/-04/-05 LOG lines (read). |
| Every exercise criterion equals its test title; every offered alternative passes | Pass | E2 row; the alternatives (inline-versus-`schema()` sign-up, `when` versus `applyWhen`, rule versus option debounce, explicit `ignoreValidators: 'none'`, `formControlName` binding) run in each spec's variant loop (run). |
| Type mix and Output tests (Output 9, Concept 8, Difference 4, Bug hunt 3, Trade-off 3, Design 1) | Pass | D3 and C2 rows. |
| Answers and sections reach the pilot's depth (G1) | Pass | G1 and D1 rows; no filler found; repeats link their section. |
| `ng build` compiles `legacy/legacy-apis.ts` and the exercise sources; no non-spec `vi`/`expect` | Pass | E4 row. |
| Module 25's lab files unchanged | Pass | read: the newest file in `25-forms-reactive-and-template-driven/` is dated 2026-10-11 08:15, before the module-26 sessions (from 13:54). |
| No file under `labs/ts-js`, no `package.json` change | Pass | H3 row. |
| Anchors for the file-level links to 26 in 11, 17, 21, 22, 25 | Done | Handoffs table. |
| No FIX takes the module past 20,070 without cutting as much as it adds | Pass | The proposed tasks net about +70 words (about 19,045). |

## Items from STATE's standing note

- **Ex 26.3 real delays:** the pending spec polls with `until()` (up to 1 s) and is robust; the quick-changes spec relies on 5 ms gaps under a 20 ms debounce (T-3). Six runs here passed.
- **Read-not-run claims** (Ex 26.4 "no `fieldTree`" follow-up, Q26.07's 1914 throw, Q26.21 `finally`, Q26.25 `registerOnTouched`, Q26.15's dev-mode warning): each is marked "read, not run" and matches the source (package source); acceptable.
- **Ex 26.5 arrow keys:** untested and declared under "Not covered" (E4 note); the `formControlName` alternative asserts status only and says so. No change needed.
- **Q26.26/Q26.28 versus §9's run:** consistent (run).
- **§6 cancellation:** stale-request abort is now asserted by a Q26.17 test, so §6's "docs claim" wording is stale (F-1).
- **§8 control-driven dirty and accessor-over-model:** both asserted (`Section 8` tests, run).
- **M26.md bank table:** Q26.09 and Q26.26 still carry the planned titles (T-4).

## Handoffs

Topics that belong to other modules and are only linked: accessible errors (11 §6); two-way binding (13 §5); the injection context (16 §4, Q16.12); writable signals, `linkedSignal`, `resource`, `model()` (17 §2, §5, §6, §7, Q17.19, Q17.21, Q17.22); `model()` versus `input()` (Q19.04); the zoneless scheduler (21 §5); timing operators (Q22.30); `rxResource` (23 §7); reactive forms, CVA, reactive validators and error display (25 §1, §5, §6, §7, §8, §10, Q25.01, Q25.02, Q25.15, Q25.16, Q25.18, Q25.31, Q25.34); `HttpClient` (27), state (28), testing (29), Material (36) as planned files.

Module 26 slugs: S1 `#1-why-a-third-forms-api-model-first-signals-end-to-end`; S2 `#2-form-the-field-tree-and-field-state`; S3 `#3-binding-with-formfield-native-inputs-attributes-classes-and-rendering`; S4 `#4-schema-rules-and-validation-built-in-rules-validate-and-reusable-schemas`; S6 `#6-async-validation-and-debounce-validateasync-validatehttp-pending-and-cancellation`; S8 `#8-custom-controls-formvaluecontrol-formcheckboxcontrol-and-how-formfield-picks-a-control`.

| File:line | Context | Anchor |
|---|---|---|
| 11:584 | Framework vs platform callout: display strategies "and module 26" | S3 |
| 11:1034 | follow-up on Angular validators and errors: "(`[module 25](…#8-…)`, `[26](…)`)" | S3 |
| 17:1366 | "that model can be this same `linkedSignal` ([Module 26])" | S2 |
| 17:2210 | Ex 17 alternative: "the signal-forms custom-control contract ([Module 26])" | S8 |
| 25:39 | §1 body: "Signal Forms, the third API, is [module 26]" | S1 |
| 25:548 | §5: "Signal Forms' numeric-only rule, which [module 26] teaches" | S4 |
| 25:639 | §5 misconception: "the numeric-only rule is Signal Forms' ([26])" | S4 |
| 25:1315 | §10: "That contract is Signal Forms', taught in [26]" | S8 |
| 25:1431 | §10 misconception: custom control wired "only by that contract ([26])" | S8 |
| 25:1438 | Summary: "the numeric-only rule is Signal Forms' ([26]; …)" | S4 |
| 25:1475 | Q25.02 follow-up: "the third API, taught in [module 26]" | S1 |
| 25:1888 | Q25.16: "so the change is [module 26's]" | S4 |
| 25:2524 | Q25.33 answer: "that contract is Signal Forms', in [26]" | S8 |
| 25:2540 | Q25.34 short answer: "Signal Forms' contract replaces it … ([26])" | S8 |
| 25:3016 | Ex 25.6 follow-up: "`value` is Signal Forms' contract ([26])" | S8 |

Stay file-level: the header lines 11:5, 17:5, 25:3 ("What this covers") and 25:5; the Connections lines 11:1598, 17:2432, 21:2711, 22:2593 (M26.md's map suggested §6 for 22:2593, but "Uses these ideas later" lines stay file-level as in REVIEW-M25), 25:3071 and 25:3072. Modules 21 and 22 get no anchor. Verify each line and heading at FIX time (line numbers move).

## Factual findings

**F-1 · Minor (C1, C3) · §6 understates the cancellation evidence (basis: run, read).** §6 509: "The docs also promise cancellation; the lab loader ignores its abort signal, so only the discard is asserted." `Q26.17 a value change while loading runs a second load and the first one finishes with its signal aborted` asserts `aborted` `[true, false]` and calls `['ann', 'bob']` (outputs spec 465-480; passed in the run), and Q26.17's follow-up already cites it. Fix: "The docs also promise cancellation: the first load's abort signal fires (`Q26.17 a value change while loading runs a second load and the first one finishes with its signal aborted`); a real request stops only if the loader passes it on." About +12 words.

**F-2 · Minor (C1) · Q26.24's second follow-up contradicts the source and two tests (basis: package source, run, read).** 1566: "*Could this replace the reactive stepper?* Only where no `formControlName` or `ngModel` hosts it, which is [Q25.34]'s." `NgControl.ngControlCreate` (`forms.mjs` 2171-2180) wires a custom control when the host has no accessor (or has `ngNoCva`), which §8 702 says itself ("a `value = model()` component also binds to `[formControl]`"); Exercise 26.5's `formControlName` variant passes (run); module 25 has `Section 10: a component with a value model binds to a formControl without an accessor` (read). Fix: "*Could this replace the reactive stepper?* Partly: `formControlName` binds a value-model control with no accessor (`[Exercise 26.5](#ex26-5)`'s variant, `[25 §10](…#10-…)`), but the `disabled` and `errors` inputs are not filled and it brings no `Validator`, which `[Q25.34](…#q25-34)`'s stepper does." Say nothing about `ngModel` (not run). About +20 words.

**F-3 · Nit (C1 quotes) · One typings quote is not verbatim (basis: package source).** §8 696: `FORM_FIELD` is a "lightweight DI token provided by the `FormField` directive". The 22.2.1 typings (`_structure-chunk.d.ts` 309) read "Lightweight DI token provided by the {@link FormField} directive." Fix: paraphrase without quotation marks ("`FORM_FIELD` is the injection token the `FormField` directive provides (22.2.1 typings)"). +0 words.

**F-4 · Nit (C12) · Eight internal names unmarked at first use in their unit (basis: script, package source).** §3 256 `_setNativeDomProperty`; §5 415 `FieldValidationState` (marked only for `shouldSkipValidation` later); §6 509 `FieldNode._reloadValidation`; §8 698 `interopNgControl` (the class `InteropNgControl` is marked); §9 810 `customControlCreate`; Q26.13 1247 and Q26.14 1293 `FieldValidationState`; Exercise 26.4 1984 `setSubmissionErrors`. Fix: "(internal)" after each. About +16 words.

**F-5 · Nit (reader text, format) · Three slips (basis: read).** §6 476 "while the check is in flight,; a stale response" (doubled punctuation); Q26.16 1342 "run before this answer was written" (process talk); Q26.17 1396 "which hung in the planning probe" (process talk; the reader has no plan). Fix: "in flight; a stale"; drop "run before this answer was written"; end the sentence at "never combined with `autoDetectChanges()`". About -10 words.

## Teaching and completeness findings

**T-1 · Minor (B7).** §2's first misconception (212): "*"`f.name.value()` reads the value."* Call the field first, `f.name().value()`; the property is the function, not its state, and the compiler says TS2339." No cause clause. Add one, for example "because the tree is shaped like the model, so `f.name` looks like the value". About +14 words.

**T-2 · Nit (B9).** `FormField` is used in §1 (70 and the Code at ~90) before §3 defines it; add "the binding directive (`[section 3](#3-…)`)" at 70. `ignoreValidators` in §6's last misconception (557) has no link; link `[section 7](#7-…)`. About +6 words.

**T-3 · Minor (E4, robustness).** `exercise-3-username/username.spec.ts` "three quick changes produce one request for the last value" types three values 5 ms apart in real time while `username-schema.ts` debounces 20 ms (both the option in `usernameSchema` and the rule in `usernameRuleSchema`): a 15 ms margin. It passed 6 of 6 runs here (run), but a 5 ms `setTimeout` on a loaded CI runner can exceed 20 ms and log an extra request. Fix: raise both debounces to 50 ms in `username-schema.ts` (the spec's `wait(100)` after the first call still covers it), update the module text that names the value (Exercise 26.3 alternative 1916: `debounce(p.user, 20)`), and re-run the spec five times. +0 words.

**T-4 · Nit (plan file).** `_meta/modules/M26.md` bank table rows Q26.09 (249: "on an empty model") and Q26.26 (266: "and another keeps v21's `touched = model(false)` … for each") still carry the planned titles; copy the module's headings. Not reader text.

**T-5 · Minor (anchors).** See the Handoffs table: 15 file-level links to 26 in modules 11, 17 and 25 get section anchors.

## Output answer cross-check

All nine Output questions were compared with `outputs/q26-outputs.spec.ts` by reading each `expect(lines)`: Q26.03 `['{"name":"Bob","age":30}', 'Cy', 'true']`; Q26.06 `['', '18', 'false', '""', 'number:42', 'null']`; Q26.09 `['required', 'min', 'email', '0', 'required,min,email', 'false']`; Q26.11 `{ kind: 'min', min: 3 }` then `[]` plus the `@ts-expect-error` (TS2345 reproduced by the probe); Q26.13 `['mismatch', 'treeMismatch', '0', '0', 'false', 'required', 'true']`; Q26.14 `['0','true','0','true','0','true','true','1']` then `['false','false','false','false']`; Q26.17 the five strings; Q26.21 the six strings; Q26.25 the three strings. Each short answer gives them with the reason (run, read).

## SYLLABUS §4 coverage (module-26 checklist, 6 rows)

| Row | Where | Status |
|---|---|---|
| Why a third forms API: model-first, signals end to end | §1, Q26.01, Q26.02, Ex 26.1 | Covered |
| Creating a form from a model signal; the field tree; binding with the field directive | §2, §3, Q26.03-08, Ex 26.1 | Covered |
| Schema rules and validation (built-in, custom, async, `debounce()`), cross-field, conditional | §4, §5, §6, Q26.09-20, Ex 26.1-26.3 | Covered |
| Submission, pending state, server errors | §7 (pending §6), Q26.17, Q26.21-23, Ex 26.3, 26.4 | Covered |
| Custom controls (signal-based contract vs CVA) | §8, Q26.24-26, Ex 26.5 | Covered |
| Interop with reactive forms; migration strategy; v21 experimental versus v22 | §9 (plus §4, §8), Q26.11, Q26.27, Q26.28, Ex 26.5 | Covered (the `min`/`max` rule and the v21-to-v22 table present) |

## Redundancy

No retelling worth cutting: the five likeliest repeats (model sync §2, skip rule §5, async mapping §6, submit protocol §7, the v21-to-v22 table §9) are linked from the questions and exercises, which add one sentence and the test. No overlap with modules 11, 13, 16, 17, 19, 21, 22, 23, 25 beyond one sentence and a link.

## Claims to verify

30 claims sampled; basis on each.

| # | Claim (line) | Basis | Result |
|---|---|---|---|
| 1 | 9 Output answers | run | match |
| 2 | 94 distinct cited test names exist | script | match |
| 3 | Criteria of Ex 26.1-26.5 equal test titles; alternatives run the same tests | script, run | match |
| 4 | `form` `@publicApi 22.0` in 22.2.1, `@experimental 21.0.0` in 21.2.25 (64, Q26.01) | package source | match |
| 5 | `isFieldTree` `@publicApi 22.1`; 22.1.0 CHANGELOG line (808) | package source, docs | match |
| 6 | `min`/`max` typing change and the 22.0.0 breaking note (256, 322) | package source (`npm pack`), docs (CHANGELOG 1103-1104) | match |
| 7 | Function overloads deprecated with no version; 21.2.25 function only, 22.0.0 both (446) | package source (`npm pack`) | match |
| 8 | `touched` model in 21.2.25, `touched?` input plus `touch` output in 22.x (674, 700) | package source (`npm pack`) | match |
| 9 | `deepSignal`/`valueForWrite` copy-on-write (66, 162) | package source | match |
| 10 | `FIELD_PROXY_HANDLER`, `ensureChildrenMap`; CHANGELOG `perf` "lazily instantiate signal form fields" (162, 164) | package source, docs | match |
| 11 | `getNativeControlValue`: `valueAsNumber`/`null` only for a number or `null` model; text input parse (254) | package source (`signals.mjs` 815-860) | match |
| 12 | `nativeControlCreate` loops over the binding names; no `aria-` string in `signals.mjs` (256) | package source | match |
| 13 | `ɵɵcontrol` in `@angular/core` `_debug_node-chunk.mjs` runs the update (Q26.07) | package source (8534, 10732) | match |
| 14 | `shouldSkipValidation` = hidden, disabled, readonly plus orphan (419, Q26.14) | package source (778) | match |
| 15 | `validateAsync` params and status mapping (505, Q26.18) | package source (494-520) | match |
| 16 | Stale-load abort "only the discard is asserted" (509) | run (Q26.17 test) | stale (F-1) |
| 17 | `submit`: touch before the check, `true` only for no or empty errors, `finally` (600, Q26.21) | package source (1837-1866) | match |
| 18 | `shouldRunAction` `'all'`/`'none'`/default (603, Q26.23) | package source (1872-1881) | match |
| 19 | `FormRoot` prevents default and calls `submit` only with submission options (605, Q26.22) | package source (`signals.mjs` 1498-1503) | match |
| 20 | Concurrent submits prohibited; 21.2.12 CHANGELOG line (604) | package source (typings), docs | verbatim |
| 21 | `ɵngControlCreate` order and runtime error 1914 (696, Q26.07) | package source (1377-1390) | match |
| 22 | `FORM_FIELD` quoted as "lightweight DI token provided by the `FormField` directive" (696) | package source (309) | not verbatim (F-3) |
| 23 | A value-model control cannot sit under `formControlName` (Q26.24 follow-up, 1566) | package source (`forms.mjs` 2171-2180), run (Ex 26.5 variant) | wrong (F-2) |
| 24 | `[field]` to `[formField]` rename in 21.0.9 (810, Q26.28) | docs (CHANGELOG 21.0.9) | match |
| 25 | `SignalFormControl` refusal code 1920 (797) | package source (`signals-compat.mjs` 714) | match |
| 26 | No forms schematic (774, Q26.28) | read (F28; not re-read) | consistent |
| 27 | TS2339, TS2345 (×2), TS2322, TS2416 (×2, incl. the mirror) | run (scratch `tsc` probe) | match |
| 28 | NG8118 for `signal(this.user())` over `input.required` (Q26.05) | read (QB-M26-01 LOG line) | not re-run |
| 29 | Docs quotes (sixteen phrases, §1, §3, §6, §7, §9, Q26.02, Q26.12, Q26.23) | docs (`main`, fetched 2026-10-11) | verbatim |
| 30 | Typings quotes (`form`, `schema`, `touch`, `FormUiControl`, `FormValueControl`, `hidden`, `disabled` deprecation, `submit`) | package source | verbatim (except #22) |

## Proposed FIX tasks

Ceilings: the module is 18,973 prose words (module-stats); CLOSE limit 19,170; ceiling 20,070. The sequence nets about +70 words (about 19,045). FIX-M26-01 and -02 both edit `modules/26-signal-forms.md` and run in order (01 first); FIX-M26-03 touches only other modules' link targets and may run in parallel with them.

### FIX-M26-01 · S · Markers of internals, quotes, wording, terms and the plan table (F-3, F-4, F-5, T-1, T-2, T-4)
- Files: `modules/26-signal-forms.md`, `_meta/modules/M26.md` (bank table rows Q26.09 and Q26.26 only).
- Do: F-3 paraphrase the `FORM_FIELD` sentence without quotation marks; F-4 add "(internal)" at the eight first uses listed (re-run the internal-name script after); F-5 fix ",;", drop "run before this answer was written" in Q26.16 and "which hung in the planning probe" in Q26.17; T-1 add a cause clause to §2's first misconception; T-2 gloss `FormField` at its §1 first use with a link to §3 and link §7 from §6's `ignoreValidators` misconception; T-4 copy the module's Q26.09 and Q26.26 headings into M26.md's table.
- Acceptance: common rules below; the internal-name script finds every C12-style name marked at first use in each section, question and exercise; the misconception scan finds a cause in all 36 bullets; prose at most +35 over the count measured just before.
- Model: **Sonnet** (mechanical: marks, wording swaps, links, a table copy).

### FIX-M26-02 · M · Scope of two claims and the Exercise 26.3 timing margin (F-1, F-2, T-3)
- Files: `modules/26-signal-forms.md`; `labs/angular/src/app/modules/26-signal-forms/exercise-3-username/username-schema.ts`.
- Do: F-1 rewrite §6's cancellation sentence to cite `Q26.17 a value change while loading runs a second load and the first one finishes with its signal aborted` (keep "a real request stops only if the loader passes the signal on"); F-2 rewrite Q26.24's second follow-up from the source and the two tests named in F-2, with no `ngModel` claim; T-3 raise both debounces in `username-schema.ts` from 20 to 50 ms, update the Exercise 26.3 alternative's `debounce(p.user, 20)` and any other prose that names 20, and run the Exercise 26.3 spec five times.
- Acceptance: common rules below plus `npx ng build` (a non-spec file changes); the Exercise 26.3 spec passes 5 of 5; E26.3 test titles unchanged; no new claim without a cited existing test or a named source read; prose at most +40 over the count measured just before.
- Model: **Opus** (judgment: scoping two claims without overclaiming, and a lab change that needs new runs).

### FIX-M26-03 · S · Anchors for file-level links to 26 (T-5; +0 words)
- Files: `modules/11-accessibility.md`, `modules/17-signals.md`, `modules/25-forms-reactive-and-template-driven.md` (link targets only).
- Do: apply the Handoffs table (15 anchors: 11:584, 11:1034 → S3; 17:1366 → S2; 17:2210 → S8; 25:39, 25:1475 → S1; 25:548, 25:639, 25:1438, 25:1888 → S4; 25:1315, 25:1431, 25:2524, 25:2540, 25:3016 → S8). Verify each module-26 slug after FIX-M26-01 and -02 (they change no heading) and each line by text. The stay-file-level lines stay.
- Acceptance: `node labs/tools/check-links.mjs --planned` exits 0; the word count of every file touched is unchanged; no other text changes; module 17 is edited only through this FIX (RUN.md §10).
- Model: **Sonnet** (mechanical link edits). Files disjoint from 01 and 02.

Common rules for each task: from `labs/angular` run `npx ng test --watch=false --include='src/app/modules/26-signal-forms/**/*.spec.ts'` (15 files, 143 tests) and `npx tsc -p tsconfig.spec.json --noEmit`; from the guide root `node labs/tools/check-links.mjs --planned` and `node labs/tools/check-snippets.mjs . 26` exit 0; cited `Section N:`, `Q26.NN` and `E26.N` names unchanged; the nine Output answers unchanged; only declared files change; the module stays at or under 20,070 words (no FIX takes it past 20,070 without cutting as much as it adds); the LOG line gives both counts (`module-stats.mjs` and the QUALITY-BAR one-liner).

After the three tasks: at most 18,973 + 35 + 40 = 19,048, hard stop 20,070.

## For Jorge

1. T-3 changes an exercise's debounce value (20 to 50 ms) for robustness, not correctness: approve, or leave the spec as is (it passed every run so far).
2. VERSIONS.md has only the Signal Forms row among this module's markers (`isFieldTree` 22.1, `ngNoCva` 22.0, the `min`/`max` and `touch` changes, the `{ when }` deprecation are not rows), as for earlier modules; and the open points of M26.md C1, C3, C4, C6, C7, C9 recorded by CLOSE-M26 remain for your ruling (none blocks a FIX).

Scratch deleted: yes. The `mktemp -d` directory (Mermaid install, `npm pack` tarballs, fetched CHANGELOG and docs, the `tsc` probe) and the session scratchpad files (test log, scripts) were removed with absolute paths; no server or vitest process was left running; `labs/angular/.angular/` and `labs/angular/dist/` are covered by the lab's `.gitignore`.
