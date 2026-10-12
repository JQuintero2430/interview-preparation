# REVIEW-M14: `modules/14-directives-and-pipes.md`

- **Reviewer:** subagent, model claude-sonnet-5-5, for session S20261008-1020-claudecode (this session authored no module-14 task, so it is eligible)
- **Date:** 2026-10-08
- **Files read:** `modules/14-directives-and-pipes.md` (all 2,161 lines); `_meta/modules/M14.md`; `_meta/QUALITY-BAR.md`; `_meta/reviews/REVIEW-M13.md` (format); the TASKS.md module-14 common rules and REVIEW-M14 block; STATE.md and LOG.md lines for M14; SYLLABUS lines 285-392; the SOURCES.md and GLOSSARY-TERMS module-14 sections; labs `labs/angular/src/app/modules/14-directives-and-pipes/` (the `concepts/` specs for sections 1-8, `repeat-demo.ts`, `menu-demo.ts`, `outputs/q14-outputs.spec.ts`, the specs of Exercises 14.1-14.4) and `labs/ts-js/src/modules/14-directives-and-pipes/` (`async-pipe-model.ts` and its test); installed sources `@angular/common` `fesm2022/_common_module-chunk.mjs` (`AsyncPipe`, `NgComponentOutlet`, `DatePipe`, `KeyValuePipe`, `warnIfSignal`) and `@angular/core` `_debug_node-chunk.mjs` (`findLocaleData`, `ɵɵpipe`, `ɵɵpipeBind1/2`, `ɵɵarrowFunction`, `bindingUpdated`) plus the `.d.ts` typings and the `@schematics/angular` pipe template; the Angular `CHANGELOG.md` from `main` and the docs markdown at tag `v22.2.1` (pipes, expression syntax, dom-apis, structural directives, directive composition API, attribute directives, directives overview, ng-template, three migration pages), all fetched into the scratchpad.
- **What was run** (Node 24, `export PATH=/opt/homebrew/opt/node@24/bin:$PATH`): from `labs/angular` `npx ng test --watch=false --include='src/app/modules/14-directives-and-pipes/**/*.spec.ts'` (13 files, 88 tests, all passed; one warning, NG8113 `JsonPipe` unused in `section-6-builtin-pipes.spec.ts:47`), `npx tsc -p tsconfig.spec.json --noEmit` (exit 0), `npx ng build` (complete; Initial total 189.56 kB; output in the ignored `dist/`); from `labs/ts-js` `npx vitest run src/modules/14-directives-and-pipes` (1 file, 8 tests passed) and `npx tsc --noEmit -p .` (exit 0); `node labs/tools/check-snippets.mjs . 14` ("All snippets check out."); `node labs/tools/check-links.mjs --planned` ("All links resolve.", 464 planned); `node labs/tools/module-stats.mjs` (row 14: 28 Q, 5 Ex, 17,652 words, mix Concept 9, Output 9, Bug hunt 6, Trade-off 3, Difference 2, Design 2, no flags); `ng generate pipe|directive --dry-run` (file names match the module); `ngc` on a throwaway project that symlinks `labs/angular/node_modules` (every quoted diagnostic and emitted instruction re-run); mermaid 11.17.2 and 12.1.0 `mermaid.parse` under jsdom (installed in the scratchpad only); the QUALITY-BAR one-liners and small scripts (cited test names, criteria against test titles, "because" clauses, cause clauses, follow-up counts, word counts, `awk` glue check).
- **Probe files:** only under the session scratchpad `m14/`; deleted at the end (see the last line of this file). `labs/angular/dist/` and `labs/angular/.angular/` are ignored by `labs/angular/.gitignore` and were written by `ng build` and `ng test`.

Overall: a strong, honest module with no Fail. The module's 63 distinct cited test names all exist and pass (run), the nine Output answers equal their assertions line for line (run), and every quoted `ngc` diagnostic and emitted instruction reproduced on 22.2.1 (run). All 22 status markers match a CHANGELOG line or a typings tag (read). The weak points are: one diagram that does not parse (F-2, node id `call` is a reserved word), one factual mismatch with the lab's own settings (F-1, `{{ sig | async }}` is a build error `TS2769` under `strictTemplates`, not a run-time `NG02100`, and the lab only reaches NG02100 through `$any`), one wrong history claim (F-3, "`async` swallows errors" was never true; ZoneJS reported them), and several small teaching gaps (two questions with one follow-up, undefined first-use terms, three missing status markers, a Summary with four paragraphs). About 280 words are repeated and can be trimmed; the module is at 17,652 prose words against a ceiling of 18,650.

---

## QUALITY-BAR

Counts: **36 Pass, 9 Partial, 0 Fail, 0 N/A** (45 items). Items not Pass: A2, B3, B7, B9, C1, C3, C4, D1, F1.

| ID | Result | Evidence |
|---|---|---|
| A1 | Pass | Lines 3-9 in STYLE-GUIDE §4.1 order; line 9 carries both run commands; I ran both (88 and 8 tests). |
| A2 | Partial | The prerequisite for module 13 carries `#` anchors; the link to module 17 (signals) has no `#` anchor and is the whole module, while the reader needs `#2-writable-signals` and `#3-computed-signals`. T-3. |
| A3 | Pass | "Short on time" names sections 1, 5, 8, six Q IDs and ends with the Summary link; all resolve (link check). |
| A4 | Pass | Contents (lines 11-27) links the 8 sections plus Summary, Question bank, Hands-on exercises, Check your understanding, Connections; they match the `## ` headings (grep). |
| A5 | Pass | Attribute directives, structural, host directives, built-in directives, pipes, built-in pipes, pipe vs computed, `async` internals: basic to deepest. Forward references are links. |
| B1 | Pass | `grep -c` of the six subheadings: 8 each (8 × 6). |
| B2 | Pass | Problems are concrete failures: a constructor style overwritten by a binding, two `*` on one element, a guard that does nothing, an arrow function that never updates, a `de` locale crash (`NG0701`), a signal passed to `async`. |
| B3 | Partial | 8 `mermaid` blocks and 8 "What to notice". Seven parse under mermaid 11.17.2 and 12.1.0; the §5 flowchart fails (node id `call` is reserved; `kind -->|"no, impure"| call[...]`, lines 486-490). None rendered (V-1). F-2. |
| B4 | Pass | Each section reaches the mechanism: `ɵɵtemplate`/`ɵɵproperty` emitted for the microsyntax, `HostDirectivesFeature`, the pipe slot instructions, `findLocaleData`, the `AsyncPipe` strategies and `markForCheckOnValueUpdate`; all read from 22.2.1 source or reproduced with `ngc`. |
| B5 | Pass | 8 of 8 `### Code` start with "The approach:" plus 2-3 numbered steps. Note: §7 steps 2-3 and §8 step 2 describe actions not shown in the snippet (T-6). |
| B6 | Pass | 36 of 36 best-practice items carry "because" (script: 5, 5, 5, 5, 4, 4, 4, 4). |
| B7 | Partial | 28 of 28 traps give a cause (script), but the §8 "`async` swallows errors. Once true for zone-based apps" is contradicted by the CHANGELOG (F-3), and its cause clause does not explain why the myth exists. |
| B8 | Pass | Framework vs platform and Coming from the backend callouts: 3 callouts (NOTE line 67, TIP line 532, NOTE line 633) placed where STYLE-GUIDE §6 lists the topics for this module. |
| B9 | Partial | Undefined on first use: OnPush (line 706), TestBed (782), ZoneJS, zoneless and zone-based (778, 782, 788, 848), `effect` (170), ARIA and `aria-busy` (Ex 14.1), "node injector" (500). T-4. |
| B10 | Pass | Module 17 signals, module 16 injection, module 18 control flow, module 34 locales get one sentence plus a link; the overlaps are listed under Redundancy. |
| C1 | Partial | 8 claims sampled and traced: the 22 status markers, the CHANGELOG 20.0.0 quote, `AsyncPipe` strategies, `findLocaleData`/`NG0701`, `ɵɵpipe` view-provider reset, `NgComponentOutlet` diffing, the deprecation tags, the doc quotes. All trace except F-1 (strictTemplates behavior), F-3 (the "once true" history), F-4 ("is read from source" for a reason the source does not state), F-6 and F-7. |
| C2 | Pass | 9 `Output` questions (Q14.03, 04, 10, 15, 18, 20, 22, 25, 27) each have a test named after the ID; all 9 equal their answers (cross-check below). |
| C3 | Partial | 63 of 63 cited test names exist. The Section 8 test title "each async pipe subscribes separately and a let or as binding shares one" covers only `@let` (F-5); Ex 14.2's "ng test printed 'Replacing the context…'" has no lab test and the reporter hides console output (T-7). |
| C4 | Partial | 22 markers checked; all forms match STYLE-GUIDE §3.2 except `[Changed in v22.1: fixed in 22.1.3]` (line 629). Missing: arrow functions in templates `[Added in v21.2]` (line 502), OnPush default `[Changed in v22.0]` (line 706), `@let` `[Stable since v19.0]` (line 795). Flashcards at lines 2129 and 2153 name a deprecated API without "use Y". T-5. |
| C5 | Pass | Every API, option and diagnostic code exists in 22.2.1: `ngc` re-run of TS2339, TS2531, NG5002, NG8116, NG8103, NG2017, NG2014, NG2013, NG2019, NG8024, NG8004, TS2345 (run). |
| C6 | Pass | 0 `Unverified`; V-6 and V-7 below are recorded here instead. |
| C7 | Pass | `check-snippets . 14`: "All snippets check out." Snippet kinds are labelled. |
| C8 | Pass | Every external URL of the module is in SOURCES.md under Module 14 (read); `check-links` passes. |
| D1 | Partial | 28 questions × 5 parts; but Q14.12 and Q14.14 have only 1 follow-up each (the bar wants at least 2). T-1. |
| D2 | Pass | All 9 Output short answers give the printed lines and 1-2 sentences of reasoning. |
| D3 | Pass | Mix: Concept 9, Output 9, Bug hunt 6, Trade-off 3, Difference 2, Design 2; 6 tags; the largest is 32%. |
| D4 | Pass | Q14.01-Q14.28 follow the section order. |
| D5 | Pass | No duplicate heading in the module. Overlap with Q17.07 is partial (Q14.24 follow-up, §7 first misconception; see Redundancy). |
| D6 | Pass | All 28 Q and 5 Ex are linked from the header or the sections (script); every answer links back to a section. |
| D7 | Pass | 28 `<a id="q14-NN">` anchors, unique; no glued anchors (grep); link check passes. |
| D8 | Pass | 28 Q and 5 Ex against the SYLLABUS row (28, 5, 13); within the ceiling. |
| E1 | Pass | Each exercise has Problem, Constraints, Acceptance criteria, hints, Worked solution, Interviewer follow-ups. |
| E2 | Pass | Criteria against test titles: 6/6/5/6/8; all exact except Ex 14.3 criterion 3 ("class binding" against the title's "class bindings"), fixed in FIX-M14-04. |
| E3 | Pass | Busy directive, permission directive, host-directive menu, search pipe, `async` model: simple to integrating. |
| E4 | Pass | All five solutions are in labs, compile (`tsc` exit 0), pass (88 + 8 tests); `ng generate` names match. `JsonPipe` is unused in a section spec (NG8113 warning, T-8). |
| E5 | Pass | 9 `Output` questions plus the exact-order tests of Ex 14.3 and 14.5. |
| F1 | Partial | The Summary has 4 paragraphs (the bar says 1-3). T-2. |
| F2 | Pass | "Explain it back": 5 prompts, each naming a listener. |
| F3 | Pass | 8 flashcards (`<details>`), one- or two-line answers. |
| F4 | Pass | Builds on / Read next / Uses later / Comparisons all present, each linked (one entry, [35], has no reason: Info). |
| G1 | Pass | 17,652 prose words; sections mean 872 against the pilot's 782; Part D answers mean 201 against the pilot's 226; exercises 586, 616, 622, 602, 606 (cap 620; Ex 14.3 is 2 over, T-8). |
| G2 | Pass | Every SYLLABUS checkbox is covered (next section). |
| H1 | Pass | 88 + 8 tests, both `tsc` runs and `ng build` pass (run). |
| H2 | Pass | `check-links.mjs --planned`: "All links resolve." (run). |
| H3 | Pass | `git status --short`: the module 14 files (`modules/14-directives-and-pipes.md`, `_meta/modules/M14.md`, both lab folders) are untracked and declared; `angular.json` and the `package.json` files are unchanged; no stray files. |

Claims sampled (C1) and basis: status markers 22 (CHANGELOG lines or typings `@deprecated`/`@developerPreview` tags, read); CHANGELOG 20.0.0 `AsyncPipe` quote (read, verbatim); `AsyncPipe` source for strategies, `untracked`, promise callbacks (read); `findLocaleData` and `NG0701` (read and run); `ɵɵpipe` `setIncludeViewProviders(false)` and `ɵɵarrowFunction` (read); `NgComponentOutlet._applyInputStateDiff` (read, F-6); `EmbeddedViewRef.context` `@deprecated` (typings, read); no `@deprecated` tag on `NgClass`, `NgStyle` and the outlets, while `NgIf`, `NgForOf`, `NgSwitch*` have it (typings, read); `Intl.` count 0 in all 11 `.mjs` files (counted); 742 locale `.js` files (counted); U+202F in the `en` data (read).

Status markers checked (C4): the 22 in the module; the three missing and the odd form listed above.

---

## SYLLABUS §4 coverage

| Checkbox | Where covered |
|---|---|
| Attribute directives: `host`, inputs, `ElementRef`/`Renderer2`, why not touch the DOM directly | Section 1, Q14.01-Q14.04, Exercise 14.1 |
| Structural directives: `TemplateRef` + `ViewContainerRef`, microsyntax, `ngTemplateContextGuard`; why control flow replaced `*ngIf`/`*ngFor` [Deprecated since v20] | Section 2, Q14.05-Q14.08, Q14.16, Exercise 14.2; the deprecation of `*ngIf`, `*ngFor`, `*ngSwitch` is confirmed by typings and CHANGELOG 20.0.0 |
| Host directives (composition API), input/output aliasing and exposure | Section 3, Q14.09-Q14.12, Exercise 14.3 |
| Built-in directives still current (`NgClass`/`NgStyle` vs bindings, `NgTemplateOutlet`, `NgComponentOutlet`) | Section 4, Q14.13-Q14.15; `NgClass` and `NgStyle` carry no `@deprecated` tag (typings, read) |
| Pipes: pure vs impure (memoization semantics), custom pipes, pipe with DI, standalone pipe imports | Section 5, Q14.17-Q14.20, Q14.25, Exercise 14.4 |
| The `async` pipe internals (subscription, marking for check, error behavior since v20) | Section 8, Q14.26-Q14.28, Exercise 14.5 (F-1, F-3 touch the error wording) |
| Built-in pipes: `date`, `currency`, `number`, `percent`, `json`, `keyvalue`, `i18nPlural`; locale dependence | Section 6, Q14.21-Q14.23 (Q14.22 runs `i18nPlural` and `keyvalue`) |
| Pipe vs `computed` vs method call in templates: performance and readability | Section 7, Q14.24, Q14.18 |

No checkbox is missing.

---

## Factual findings

**F-1 · Medium · `{{ sig | async }}` is a build error under the lab's settings, not only a run-time NG02100.**
Location: §8, Problem and "Invalid input" (around line 797), the best practice (line 843), the misconception, the Summary (line 862) and Q14.28 (Short answer, Full explanation, Trap) present `NG02100` as what a signal passed to `async` produces. With the lab's `strictTemplates`, `ngc` reports `error TS2769: No overload matches this call` first (run). The lab spec reaches NG02100 only through `$any(sig)`, and the module never says so.
Correction: say TS2769 first, then "NG02100 appears only through `$any` or a non-strict template (the lab spec uses `$any`)". Word delta about +40.
Basis: run (`ngc`, `diag` file for the signal case) and read (the lab spec).

**F-2 · Medium · The §5 flowchart does not parse.**
Location: lines 484-492, `kind -->|"no, impure"| call["Call transform"]` and `call --> store[...]`. `call` is a reserved word in mermaid; `mermaid.parse` fails on 11.17.2 and 12.1.0 (run). Renaming the node to `calls` or `run` parses.
Correction: rename the node id on the three lines. Word delta 0.
Basis: run. The seven other diagrams parse.

**F-3 · Medium · "`async` swallows errors. Once true for zone-based apps" contradicts the CHANGELOG.**
Location: §8 misconceptions ("Once true for zone-based apps: ZoneJS reported them until v20.0…"). CHANGELOG 20.0.0 says ZoneJS caught the errors and reported them to the `ErrorHandler`; they were never swallowed. Related unsupported wording: the §8 Problem "an error that used to vanish" and the Q14.28 follow-up "It relied on the old error route". The CHANGELOG says only that the result is "generally the same" and that tests may differ.
Correction: "It never did: ZoneJS reported the error until v20.0, and since then the pipe reports it itself; the view stays blank, which is why it looks swallowed." Rewrite the two related phrases to say tests that relied on the old route may differ. Word delta about 0.
Basis: read (CHANGELOG 20.0.0 and the `AsyncPipe` source).

**F-4 · Low · "is read from source" for a reason the source does not state.**
Location: line 778 says the reason ("the view is already being checked") "is read from source". The source shows only the mechanism (`markForCheckOnValueUpdate`), and CHANGELOG 17.2.3 is a perf change ("`AsyncPipe` should not call `markForCheck` on subscription").
Correction: reword as an inference from the code and the 17.2.3 line. Word delta about +5.
Basis: read.

**F-5 · Low · A test title overstates what it covers.**
Location: `Section 8: each async pipe subscribes separately and a let or as binding shares one` (cited in §8). It exercises only `@let`; the module admits this.
Correction: retitle to "... and an `@let` binding shares one" in the spec and the module. Word delta 0.
Basis: read (spec body).

**F-6 · Low · Q14.15 says `_applyInputStateDiff` runs "on each change of the object".**
Source: it runs on every `ngDoCheck` and calls `setInput(name, undefined)` for names not touched in this round.
Correction: "on every change-detection pass of the directive, and it sets inputs that disappeared from the object back to `undefined`". Word delta about +10.
Basis: read (`NgComponentOutlet`, `_common_module-chunk.mjs`).

**F-7 · Low · Q14.26 says "Anything but a promise or a subscribable throws".**
Source: falsy values (`0`, `''`, `false`) are ignored and return `null`; `null` and `undefined` likewise. Only a truthy value of another kind throws.
Correction: "A truthy value that is neither a promise nor a subscribable throws". Word delta about +5.
Basis: read (`AsyncPipe`, lines 2517-2626).

**F-8 · Low · A wrong section pointer.**
Location: line 774, "(§5)" for `async` being `pure: false`; the block that shows it is in §6.
Correction: point to §6. Word delta 0.
Basis: read.

Info: §3 line 286, "the lab checks both ways", can be read as covering provider precedence; the lab covers only mutual injection. Fold into FIX-M14-02 if a word fits.

---

## Teaching and completeness findings

**T-1 · Medium · Q14.12 and Q14.14 have one follow-up each (D1).** Add one follow-up to each, for example for Q14.12 "does a host directive's `outputs` alias have to differ from the host's?" and for Q14.14 "what does `ngTemplateOutletInjector` change?" (only if verified in the typings). About +35 words each. Basis: counted.

**T-2 · Low · The Summary has 4 paragraphs (F1).** Merge to three. Word delta 0. Basis: counted.

**T-3 · Low · The module 17 prerequisite has no anchor (A2).** Use `17-signals.md#2-writable-signals` and `#3-computed-signals`. Word delta 0.

**T-4 · Medium · Terms undefined on first use (B9).** OnPush (line 706), TestBed (782), ZoneJS, zoneless and zone-based (778, 782, 788, 848), `effect` (170), ARIA and `aria-busy` (Ex 14.1), "node injector" (500). One inline clause plus owning-module link each; about +45 words. Add the terms to GLOSSARY-TERMS "Module 14".

**T-5 · Low · Status markers (C4).** Add `[Added in v21.2]` for arrow functions in templates (line 502), `[Changed in v22.0]` for the OnPush default (706), `[Stable since v19.0]` for `@let` (795); replace `[Changed in v22.1: fixed in 22.1.3]` (629) with a STYLE-GUIDE §3.2 form; add "use Y" to the flashcards at lines 2129 and 2153. About +25 words. Basis: read (CHANGELOG and typings).

**T-6 · Low · Snippets do not show every step they describe (B5).** §7 steps 2-3 and §8 step 2 describe actions not in the snippet; the §8 Code subsection never shows an `| async` template. Add short html Excerpts (code, so 0 prose words). Line 506 says "the three expressions render `[yes][YES][AB]`" without showing them; add them (about +25 words).

**T-7 · Low · Ex 14.2's deprecation evidence is not reproducible.** "ng test printed 'Replacing the context…'" has no lab test and the reporter hides console output. Cite the `@deprecated` tag on `EmbeddedViewRef.context` in the typings instead (no version, so no marker). Word delta about 0.

**T-8 · Low · Lab and format hygiene.** `JsonPipe` is imported but unused in `section-6-builtin-pipes.spec.ts` (NG8113 warning on every run). Ex 14.3 test title "class bindings" against the criterion "class binding". Ex 14.3 is 622 words against a cap of 620. `###` headings are glued to the preceding paragraph at lines 771-772 and 797-798 (they render, but are inconsistent; add blank lines).

**T-9 · Low · Unmeasured wording.** "The myth exists because one call is cheap" (line 586) is a performance-flavoured claim with no measurement; reword to the mechanism (a call is cheap in the lab's tiny case). Line 57 "bare `labHighlight` sets `''`" cites no test (the Section 1 host test asserts it); name it.

**T-10 · Info · Q14.09's Excerpt omits `template` and `host` lines without an ellipsis.** Add `// ...` (at most 10 words).

Info for later planners: overlap with module 18 (the migration schematic in Q14.16), module 17 (Q14.24 follow-up and §7's first misconception repeat Q17.07) and module 21; the `[Stable since v15.0]` for `hostDirectives` is derived from the 15.0.0 CHANGELOG line only (V-8).

---

## Output answer cross-check

All 9 Output answers equal their assertions line for line (run; `q14-outputs.spec.ts` and the section specs):

| Q | Printed in the answer | Test result |
|---|---|---|
| Q14.03 | `[1 DIV][8 #comment][8 #comment]` | equal |
| Q14.04 | three style/class lines | equal |
| Q14.10 | six lines | equal |
| Q14.15 | `W1[L1\|1]`, `W1[L2\|]`, `W1[\|7]` | equal |
| Q14.18 | four steps `1 1 1 1`, `0 1 1 0`, `0 1 1 0`, `1 1 1 1`; texts `6\|6\|6\|6`, `6\|6\|6\|6`, `6\|10\|10\|6`, `10\|10\|10\|10` | equal |
| Q14.20 | `3\|3`, `3\|2`, pureRuns 1 | equal |
| Q14.22 | eight lines | equal |
| Q14.25 | `1 1`, `1 1`, `2 2`, `3 3` | equal |
| Q14.27 | `subs=3 unsubs=0 [][][]`, `subs=3 unsubs=0 [1][1][1]`, `subs=6 unsubs=3 [][][]`, `subs=6 unsubs=6` | equal |

There are 9 "Verified:" lines for the Output questions plus Q14.17's, which is not an Output question.

---

## Redundancy

About 280 words can go (floor: keep each answer part at least 170 words). Named repeats, with approximate words:

- Q14.26 Full explanation repeats §8 (29 + 27).
- Q14.28 (10 + 27) and its follow-up on the old error route (F-3).
- Q14.23 (29 + 28), repeating §6.
- Q14.21 (25 + 15 + 19 + 17), repeating the §6 list.
- Q14.09's 55-word lab sentence repeats §3.
- Q14.14 (about 98 words repeating §4).
- Q14.13 (50 + 15 + 17).
- Q14.16 (39 + 27).
- Q14.20 (31 + 43).
- Q14.24 (42 + 27); its follow-up repeats Q17.07 (replace with a link).

Intended repeats, do not cut: the Summary; the "Observed by compiling…" headers; the §2 guard block repeated as code in Q14.07 and Q14.08.

---

## Claims to verify

- V-1: mermaid: 7 of 8 parse under 11.17.2 and 12.1.0; none rendered in a browser.
- V-2: diagnostics and emitted instructions are specific to 22.2.1; `ngc` warnings print the code twice and end with "Find more at" (the module says "messages shortened").
- V-3: jsdom only; SSR, a real browser and timings were not run.
- V-4: the pre-v20 `AsyncPipe` behavior is known only from the CHANGELOG sentence.
- V-5: the "Replacing the `context`" console line is not reproduced; it is in the source.
- V-6: why `ɵɵpipe` turns view providers off is unexplained (the module says so).
- V-7: arrow-function memoization in pipe arguments is undocumented, and the docs disagree: the `v22.2.1` tag lists arrow functions as unsupported in expressions while `main` allows them as pipe arguments (both fetched and read).
- V-8: the `[Stable since v15.0]` marker for `hostDirectives` is inferred from a CHANGELOG line.
- V-9: the throwaway pipe component's slot numbers cannot be reproduced exactly (the template is not recorded).
- V-10: the full `npm test` was not run, only the module 14 include.

---

## Proposed FIX tasks

Budget rule: the module is 17,652 prose words; the ceiling is 18,650. Each FIX gets its own ceiling (cumulative). Run in order; locate by grep, not line number. All four edit `modules/14-directives-and-pipes.md`.

### FIX-M14-01 · S · Trim the named repeats and repair structure (makes room for 02-03)
- **Files:** `modules/14-directives-and-pipes.md`.
- **Do:** trim the Redundancy list (about -280 words, keep each answer part at least 170 words); rename the §5 mermaid node `call` (F-2; grep `call\[`); merge the Summary to 3 paragraphs (T-2); add blank lines before the `###` headings glued at `### How it actually works` and `### Code` in §8 (T-8); add the `#2-writable-signals` and `#3-computed-signals` anchors to the module 17 prerequisite (T-3); fix the "(§5)" pointer (F-8).
- **Acceptance:** `mermaid.parse` passes on all 8 blocks; `awk` glue check prints nothing; `check-links.mjs --planned` passes; Summary has at most 3 paragraphs; prose count at most 17,400.
- **Ceiling:** 17,400 words.

### FIX-M14-02 · M · Correct the factual wording and the test name (F-1, F-3 to F-7)
- **Files:** `modules/14-directives-and-pipes.md`; `labs/angular/src/app/modules/14-directives-and-pipes/concepts/section-8-*.spec.ts` (the title only, F-5).
- **Do:** F-1 (TS2769 first, a new `ngc` line, the `$any` note, in §8, Summary and Q14.28); F-3 (the myth wording and the two related phrases); F-4; F-6; F-7; the §3 "both ways" wording. Retitle the Section 8 test in the spec and in the module's citation.
- **Acceptance:** `ng test` 88 tests pass; `check-snippets . 14` passes; grep finds no "Once true for zone-based" and no "Anything but a promise"; the new TS2769 line is reproduced by `ngc`.
- **Ceiling:** 17,550 words (adds at most +150).

### FIX-M14-03 · S · Teaching gaps
- **Files:** `modules/14-directives-and-pipes.md`; `_meta/GLOSSARY-TERMS.md` (Module 14 section, only if that is where the terms are tracked).
- **Do:** T-1 (a follow-up each for Q14.12 and Q14.14); T-4 (first-use definitions plus glossary terms); T-5 (markers); the line 506 expressions (T-6); Ex 14.2 evidence (T-7); the "cheap" and line 57 rewording (T-9).
- **Acceptance:** D1 counts 28 × 5 and every question has at least 2 follow-ups; `check-links` passes; prose count at most 17,750.
- **Ceiling:** 17,750 words (adds at most +200).

### FIX-M14-04 · S · Lab and code hygiene
- **Files:** `modules/14-directives-and-pipes.md`; `labs/angular/src/app/modules/14-directives-and-pipes/concepts/section-6-builtin-pipes.spec.ts`; the Ex 14.3 spec.
- **Do:** remove the unused `JsonPipe` import (NG8113); retitle the Ex 14.3 test ("class binding") and keep Ex 14.3 at most 620 words; add the §7 and §8 html Excerpts (T-6); settle the Q14.09 Excerpt (T-10).
- **Acceptance:** `ng test` 88 tests pass with no NG8113 warning; `tsc -p tsconfig.spec.json --noEmit` exit 0; `ng build` complete; `check-snippets . 14` passes; `check-links` passes.
- **Ceiling:** 17,760 words.

---

Scratch directory `/private/tmp/claude-501/-Users-jorge-quintero-IdeaProjects/66b7534d-3732-46dd-8695-1cceb34b8fb6/scratchpad/m14/` (the `ngc` probe project with its symlinked `node_modules`, the mermaid 11.17.2 and 12.1.0 installs with jsdom, the fetched docs and CHANGELOG, the test and build logs and the helper scripts) was deleted after the last probe.
