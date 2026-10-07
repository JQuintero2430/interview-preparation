# REVIEW-M07: `modules/07-ts-advanced-types-and-decorators.md`

- **Reviewer:** subagent, model claude-sonnet-5-5, session S20261006-1733-claudecode (the module was written by other sessions)
- **Date:** 2026-10-06
- **Files read:** `modules/07-ts-advanced-types-and-decorators.md` (all 1,381 lines); `_meta/modules/M07.md`; `_meta/QUALITY-BAR.md`; `_meta/RUN.md` §1, §5, §6.3, §10; `STYLE-GUIDE.md` (§6 callouts, §12 floors); `SYLLABUS.md` §4 block 07; `VERSIONS.md`; `SOURCES.md` (Module 07); `_meta/reviews/REVIEW-M04.md` (format). Labs: everything under `labs/ts-js/src/modules/07-ts-advanced-types-and-decorators/` and `labs/ts-js/src/outputs/07-ts-advanced-types-and-decorators/` (tests, `event-bus.ts`, `order-schema.ts`, the 7 fixtures) and, in `labs/angular/src/app/modules/07-ts-advanced-types-and-decorators/`, the test titles of `typing-patterns.spec.ts` and `settings-form.spec.ts` plus `settings-form.ts`/`settings-defaults.ts`.
- **What was run:**
  - `node labs/tools/check-links.mjs --planned` ("All links resolve", 221 planned links); `node labs/tools/check-snippets.mjs . 07` ("All snippets check out"); `node labs/tools/module-stats.mjs`; the QUALITY-BAR "Measuring" one-liners.
  - Single-file `npx vitest run` of the three Output files (`generics-and-computed-types.test.ts` 6/6, `utility-variance-brands-decorators.test.ts` 4/4, `decorators-zod-angular.test.ts` 3/3: all green).
  - A script that extracts each Output/Bug-hunt snippet from the module and compares it with its fixture (7 of 7 identical).
  - Throwaway probes in the scratchpad (deleted afterwards): Node 24.21 on a decorated class (`SyntaxError`, so Node does not run decorators natively), and a TypeScript 6.0.3 `transpileModule` of an Angular `@Component` plus `@Input()` field with `experimentalDecorators` false and true, imported against the lab's `@angular/core` 22.2.1 (see F-1).
  - Read from source: `typescript` 6.0.3 `lib/lib.es5.d.ts` (the five `= intrinsic` declarations, `Omit`, `NonNullable`, `Awaited`), `@angular/core` 22.2.1 `fesm2022/_debug_node-chunk.mjs` line 979, `@angular/router` 22.2.1 `types/_router_module-chunk.d.ts` line 2205; `grep experimentalDecorators` over `@angular/*` in `labs/angular/node_modules` (no hit in the compiler or build packages).
  - Read from docs: https://github.com/tc39/proposals (Decorators and Decorator Metadata are under "Stage 2.7").
  - **NOT run** (barred): the module's other `ts-js` tests (`section-*.test.ts`, `event-bus.test.ts`, `order-schema.test.ts`), `tsc -p tsconfig.spec.json`, `ng test`, `ng build`. Everything said about those is from reading titles and assertions, or from the SOURCES.md record.

Overall: a careful, mostly accurate module. All 5 Output answers (and both Bug-hunt answers) match their fixtures and assertions, every snippet is verified against a fixture, every question is linked from the body, and answer, exercise and test anatomy is complete. The real problems are: one overstated claim about Angular and decorators that Angular's own runtime contradicts (F-1); one diagram for nine sections and no *Framework vs platform* callout on decorators, a topic STYLE-GUIDE §6 names; traps without history or origin in sections 5 to 9; a few untested or unlinked claims; and 941 prose words over the cap, where the overrun is mostly repeated explanation (listed under Redundancy).

---

## QUALITY-BAR

Counts: **36 Pass, 2 Partial, 5 Fail, 2 N/A** (45 items).

| ID | Result | Evidence |
|---|---|---|
| A1 | Pass | Lines 3-9 follow STYLE-GUIDE §4.1 order (What this covers, Prerequisites, Leads to, Applies to, Study time, Short on time, Labs). Line 9 gives both run commands. |
| A2 | Pass | Line 4: all five prerequisites link a `#` anchor (06 §2, §4, §6, §7; 03 §3); link check passes. |
| A3 | Pass | Line 8: four sections (1, 3, 7, 8), six question IDs (01, 05, 06, 13, 14, 16), Exercise 07.1, ends with Summary; all resolve. |
| A4 | Pass | Lines 13-26: nine concept sections plus Summary, Question bank, Hands-on exercises, Check your understanding, Connections; link check passes. |
| A5 | Pass | Generics, computed types, conditional types, utilities, variance, brands, decorators, Zod, Angular patterns. Section 9 builds on 1, 2 and 4 and is last; it is applied rather than "under the hood", but the deepest mechanisms (compiler lowering, `ngc` output) are in 7. No section needs a later one. |
| B1 | Pass | `grep -c '^### The problem it solves'` and the other five subsection headings: 9 each = 9 concept sections. |
| B2 | Pass | All nine problems are concrete failures (an `any` flowing into arithmetic, four hand-written types drifting, a handler crashing on `LoginEvent`, swapped arguments, a decorator that stops compiling, a typed-but-unchecked response, `inject()` returning `unknown`). |
| B3 | **Fail** | One Mermaid diagram (section 3, lines 134-144, with "What to notice"). Flow- or timeline-shaped mechanisms with no diagram: the decorator evaluate/apply/initialize/call order (section 7 line 324, Q07.15), the Angular compile of `@Component` into `ɵfac`/`ɵcmp` (section 7 line 326), the direction of data in variance (section 5), the parse-at-the-boundary flow (section 8), and the generic-component inference chain (section 9). Pilot: 5 diagrams in 9 sections. See T-1. |
| B4 | Pass | Each section reaches a "why": `lib.es5.d.ts` definitions and the five `= intrinsic` types (4, line 221), the 2.6 method exemption and why `Array<T>` needs it (5), what `tsc` emits (`__esDecorate`, `__runInitializers`) and what `ngc` emits (7), `$strip`/`$strict`/`$loose` modes (8), `strictContextGenerics` (Q07.20). Weakest: section 1 never says how candidates are ranked when several sites disagree. Accepted. |
| B5 | Pass | Every `### Code` has an "Approach: (1) (2) (3)" line before it (lines 51, 101, 156, 200, 243, 285, 330, 385, 437); exercise solutions have an Approach too. |
| B6 | Pass | Every best-practice bullet has "because ..." (lines 70-73, 114-116, 171-173, 214-216, 255-257, 301-303, 354-356, 408-410, 458-461). |
| B7 | **Fail** | History or origin appears only in sections 1 to 4 (lines 77, 79, 121, 179, 220) and in one of sections 5 to 9 (line 263, the Java arrays comparison). Missing: section 5 lines 261-262 (all parameters were bivariant before 2.6, which is why "narrower is fine" feels normal); section 6 lines 307-308; section 7 lines 360-361 (the proposal was Stage 3 and TypeScript shipped it in 5.0, which is why people call it finished; module 05 line 517 already says it moved back to 2.7); section 8 lines 414-415 (what Zod 3 did, and what is new in 4 such as `z.strictObject`; check before writing); section 9 lines 465-466 (untyped forms before Angular 14). Also line 72 cites the 5.0 warning about mutable `const` constraints while line 63 says 6.0.3 no longer behaves that way, with no version for the change. See T-3. |
| B8 | **Fail** | *Coming from the backend* is present where it matters (lines 66 and 350, each with "Where the analogy breaks"; SYLLABUS 07 names no required comparison). *Framework vs platform* is present only in section 8 (line 404). STYLE-GUIDE §6 lists **decorators** as a required topic: section 7 has no such callout, although the section is exactly about the split between the TC39 proposal, TypeScript's two implementations and Angular's compiler. See T-2. |
| B9 | **Fail (Low)** | Used without an inline definition or link at first use: `ngc` (line 326; "Angular compiler" is described but `ngc` is not), `strictTemplates` (line 433), DTO (185), "tail-recursive" (152), "Stage 2.7" (line 322, defined only by link in Connections). See T-6. |
| B10 | Pass | Brands link to Q06.05 and Q03.09, `strict` to 06 §7, providers to 16, forms to 25, HTTP to 27, routing to 24, signal inputs to Q17.27. |
| C1 | **Fail** | 24 claims sampled; 21 have a basis (lab test, typing, or doc). No basis: (a) the claim that decorator semantics "matter only for parameter decorators and for decorators you write yourself" is contradicted by `@angular/core` (F-1); (b) "`$any()` in templates ... switches off the inference that catches the mismatch" (line 461, Q07.20 follow-up line 1021) has no test and no doc in SOURCES (V-2); (c) the "Mutation checks ... each failed tests" sentences (lines 1111, 1192, 1305) describe one-off runs that are not in the repo (V-3). Also, quoted docs (Zod, `InjectionToken`, typed forms, 5.2 notes, TC39 README) are cited by name, not link, inside the module: they are in SOURCES.md, so this is C8-clean but weaker than the linked 4.x notes. |
| C2 | Pass | Output-tagged: Q07.02, 03, 06, 15, 17 (5). Tests named after the IDs exist for all five (and for the Bug hunts Q07.07 and Q07.11, plus Q07.01, 04, 08, 09, 13 evidence). Ran all three Output files: 13/13 green. Diffed each answer against its assertion: Q07.02 (`readonly ["sm","md"]`, `string[]`, `"sm" | "md" | "lg"`, line 9 TS2345), Q07.03 (A to E exact types), Q07.06 (A to F), Q07.15 (10 log lines in order), Q07.17 (3 lines): identical. Q07.07 (lines 9-11: TS2339, TS2540, TS2349) and Q07.11 (line 17 TS2322, `toFixed` TypeError message) also match. All 7 fixtures are byte-identical to the module snippets. |
| C3 | Pass | "Verified:" sentences name `Section N:` tests that exist (section-1 ... section-8, `typing-patterns.spec.ts` "Section 9: ..." x6) and the `Q07.xx evidence` tests named in lines 486, 566, 649, 703, 721, 766, 798, 831, 897, 946. Run-time statements in sections 5, 6, 7, 9 map to tests by title. (Only the Output files were run by me.) |
| C4 | **Partial** | `grep -E '\[(Added in ...'` finds 12 markers: `const` 5.0, `NoInfer` 5.4, remapping 4.1, template literals 4.1, `Awaited` 4.5, variance annotations 4.7, standard decorators 5.0 (x2), typed forms Angular 14, and the Q07.02/13 repeats. Missing: decorator metadata "arrived in 5.2" (line 325, prose not marker form); `NonNullable<T> = T & {}` changed in 4.8 (line 194); `input()`/`input.required()`/`output()` at first mention in section 9 (line 431; the status is owned by module 17, but STYLE-GUIDE §3.2 asks for it at first mention in each module); `ResolveFn`/`RedirectCommand` have none. Minor; see T-4. |
| C5 | Pass | `Awaited`, `NoInfer`, variance annotations exist in `lib.es5.d.ts` / 6.0.3 (read). `InjectionToken` factory option, `input()`, `output()`, `ResolveFn` (router typings line 2205 neighbourhood), `booleanAttribute`, `NonNullableFormBuilder` are imported in the spec that SOURCES says compiles under `tsc -p tsconfig.spec.json` (not run by me). No invented API found. |
| C6 | Pass | `grep -c Unverified` on the module = 0; UNVERIFIED.md has no 07 row. |
| C7 | Pass | `node labs/tools/check-snippets.mjs . 07` exits 0 ("All snippets check out"). Unmarked snippets sit under Output questions and equal their fixtures (checked). |
| C8 | Pass | All 10 `https://` URLs in the module appear under "Module 07" in SOURCES.md. SOURCES also lists the JLS page, which the module does not cite (harmless). |
| D1 | Pass | 20 questions, 20 Short answer, 20 Full explanation, 20 Follow-ups (2 each, answered), 20 Trap to avoid. |
| D2 | Pass | The five Output short answers list the printed result and give a reason sentence. |
| D3 | Pass | Concept 6, Output 5, Design 3, Difference 3, Bug hunt 2, Trade-off 1: six tags, largest 30%, Trade-off and Design/Bug hunt present. |
| D4 | Pass | Q01-02 generics, 03-04 computed, 05-07 conditional, 08-09 utility, 10-11 variance, 12 brands, 13-15 decorators, 16-17 Zod, 18-20 Angular: follows the sections. |
| D5 | Pass | `grep '^### Q'` over `modules/0[1-6]*` and `17`: nothing on generics, mapped or conditional types, variance, brands, decorators, Zod or typed forms. Q03.09 (`#private` brand checks) and Q06.05 are linked, not repeated. Inside the module Q07.05/Q07.06 and Q07.10/Q07.11 overlap in content but ask different things. |
| D6 | Pass | Count of `](#q07-NN)` outside each question's own heading: Q01 2, Q02 2, Q03 2, Q04 2, Q05 2, Q06 5, Q07 1, Q08 1, Q09 3, Q10 2, Q11 2, Q12 3, Q13 2, Q14 2, Q15 1, Q16 2, Q17 1, Q18 1, Q19 2, Q20 1. Every answer ends its Full explanation with "Background: section N". Note: `#ex07-2` and `#ex07-3` are never linked from outside (only `#ex07-1`, in line 8); not a QUALITY-BAR item, see T-9. |
| D7 | Pass | 20 `<a id="q07-NN">` anchors, 01-20 contiguous, plus `ex07-1`..`ex07-3`; link check passes. |
| D8 | Pass | 20 questions (ceiling 25, floor 15), 3 exercises (ceiling 4, floor 2). |
| E1 | Pass | Exercises 07.1-07.3: Problem, Constraints, Acceptance criteria (5 each), Hint 1 and 2, Worked solution (Approach, code, criterion account), Alternative + Trade-offs, 3 follow-ups each, Tests link. |
| E2 | Pass | Test titles equal the criterion text, in order, under `describe('E07.N ...')`: 07.1 5 criteria / 5 criterion tests (+1 evidence test for a follow-up), 07.2 5 / 5, 07.3 5 / 5. The accounts say "each `it` is titled with its criterion" (true, unlike the claim in module 04) but describe tests by paraphrase rather than quoting titles; acceptable. |
| E3 | Pass | Event bus (generics + mapped + conditional), then Zod + brands, then Angular with a token, mapped `ControlsOf` and nonNullable forms (explicitly combines 1, 2, 4). |
| E4 | Pass | Read: no `any`; `event-bus.ts` has exactly one `as` (line 40) as the constraint says; `order-schema.ts` has none; injected dependencies: 0 or 1. Not run by me (see H1). |
| E5 | Pass | 5 Output questions; Exercise 07.1's tests assert exact compile codes. |
| F1 | Pass | Two paragraphs, each section restated with a link, most-asked traps named; everything in it is taught above. Statement about `@Component` repeats F-1's overstatement (fixed by FIX-M07-01). |
| F2 | Pass | 5 prompts, each names a listener (backend developer, teammate, reviewer, tech lead, junior developer). |
| F3 | Pass | 8 flashcards. |
| F4 | Pass | Builds on / Read next / Uses these ideas later, each with a reason and section anchors. |
| G1 | **Partial** | 10,941 prose words for the whole file vs the 10,000 cap (+941). The reviewer finds redundancy worth about 700 to 1,000 words (below), so the cap is not met "with nothing to cut". Section 8 (about 480 words) and 9 (about 520) are tight; the repeats sit in the question answers. See T-8 and FIX-M07-04. |
| G2 | Pass | All 9 SYLLABUS §4 checkboxes covered (next section). "Typed route data" is the thinnest (T-7). |
| H1 | N/A | Not run (reviewer barred from `npm test`, `ng test`, `ng build`). TASKS.md standard checks apply. I ran only the three Output test files (green). |
| H2 | Pass | `node labs/tools/check-links.mjs --planned`: "All links resolve." |
| H3 | N/A | `git status --short .` shows `?? ./` for the whole guide (untracked as a unit); a per-module stray-file check is not meaningful. The only new file from this review is this one; the scratch directory `m07` and the URL list were deleted. |

---

## SYLLABUS §4 coverage

| Checkbox | Where covered |
|---|---|
| Generics, constraints, defaults, inference sites, `const` type parameters | Section 1, Q07.01, Q07.02, Exercise 07.1 |
| `keyof`, indexed access, mapped types (`as`, modifiers), template literal types | Section 2, Q07.03, Q07.04, Exercise 07.1 |
| Conditional types, distributivity, `infer`, recursive types | Section 3, Q07.05, 06, 07 |
| Utility types and implementing `Partial`, `Pick`, `Omit`, `ReturnType`, `Awaited` by hand | Section 4, Q07.08 (all five), Q07.09 |
| Variance (`in`/`out`), parameter bivariance, `strictFunctionTypes` | Section 5, Q07.10, Q07.11 |
| Branded types for IDs and money | Section 6, Q07.12, Exercise 07.2 |
| Decorators: standard vs `experimentalDecorators`; which one Angular uses and why the compiler makes it mostly irrelevant (verified) | Section 7, Q07.13, 14, 15. "Mostly irrelevant" is overstated (F-1). |
| Type erasure to runtime validation with Zod 4; schema-first types | Section 8, Q07.16, Q07.17, Exercise 07.2 |
| Typing patterns in Angular: `InjectionToken<T>`, typed forms, `input<T>()`, typed route data, generic components | Section 9, Q07.18-20, Exercise 07.3. Typed route data is one bullet and one test (T-7). |

No checkbox is missing.

---

## Factual errors

**F-1 · Medium · "Decorator semantics matter only for parameter decorators and decorators you write yourself" is contradicted by Angular's runtime.**
- Location: line 326 (last sentence), repeated at line 472 (Summary: "so decorator semantics matter only for `@Inject` and your own decorators"), Q07.14 short answer (line 847), Q07.14 title ("why does the decorator flavor barely matter?"), the SYLLABUS wording it answers, Explain-it-back 4 (line 1324: "what would break if `experimentalDecorators` were turned off") and flashcard line 1367.
- Wrong: the evidence in the lab covers only two things, an AOT `ngc` build of `@Component` (identical output with the flag on or off) and a constructor parameter decorator. It does not cover Angular field decorators (`@Input()`, `@Output()`, `@HostListener`, `@ViewChild`...) or JIT mode. `@angular/core` 22.2.1 refuses them: `fesm2022/_debug_node-chunk.mjs` line 979, inside `PropDecorator(target, name)`: `if (target === undefined) throw new Error('Standard Angular field decorators are not supported in JIT mode.')`. A standard field decorator is called with `undefined` as its first argument, so this is exactly the `experimentalDecorators: false` case.
- Ran: transpiling `@Component(...) class A { @Input() name = '' }` with TypeScript 6.0.3 and importing it against the lab's `@angular/core` gives, with `experimentalDecorators: false`, `Error: Standard Angular field decorators are not supported in JIT mode.`, and imports fine with `true`. So a real consequence of turning the flag off exists: any code that Angular loads in JIT (tests under a JIT builder, JIT-based tooling, `@Input()` fields in libraries consumed that way) breaks, even though the AOT compiler reads decorators from the syntax tree and ignores the flag. Also: no `experimentalDecorators` string occurs in `@angular/compiler-cli` or `@angular/build`, which supports the AOT half of the module's claim.
- Correction: say "the AOT compiler reads Angular's decorators from the source, so their output is the same whichever flavor TypeScript uses; but Angular's JIT runtime supports only the legacy call shape for field decorators and throws for the standard one, so the workspace keeps the flag on, and parameter decorators need it". Reword the Summary, Q07.14 (title, short answer, add a follow-up "what about JIT?"), flashcard and Explain-it-back 4 to match. Do not claim the flag "can be turned off safely" anywhere. Add the source (`@angular/core` 22.2.1 file and line) to SOURCES.md and, ideally, a one-assertion spec in `labs/angular` (call `Input()` with `undefined` as the target and expect that message).
- Basis: ran + read source.

No other factual errors found. Checked and correct: `lib.es5.d.ts` has exactly five `= intrinsic` declarations (Uppercase, Lowercase, Capitalize, Uncapitalize, NoInfer) in 6.0.3; `Omit<T, K extends keyof any>`, `NonNullable<T> = T & {}` and the recursive `Awaited` match line 195-196 (read source); decorators and Decorator Metadata are at Stage 2.7 on the TC39 proposals page (read docs); Node 24.21 does not parse `@decorator` (ran: `SyntaxError`); Q07.15's order, Q07.17's three lines, Q07.02/03/06/07/11's types and codes (ran the Output files); line numbers quoted in Q07.02 (line 9), Q07.07 (lines 9-11) and Q07.11 (line 17) correspond to the snippets as printed (checked by counting lines in the snippets and by the passing tests); `Router` `Data` type is `{ [key: string | symbol]: any }` (router typings line 2205, used in T-7); exercise constraints (one `as`, no `as`, no `any`) match the code.

---

## Teaching and completeness findings

**T-1 · Medium · B3: add diagrams where the mechanism is a flow or timeline.** One diagram for nine sections. Suggested: (a) section 7, a `sequenceDiagram` or `flowchart` of the Q07.15 order (evaluate A, evaluate B, apply B, apply A, class defined, construct: init B, init A, call A, call B, body), with a "What to notice" sentence that the evaluation order and the application order are reversed; (b) section 7, `flowchart LR` of `@Component` source to `ngc` to static `ɵfac`/`ɵcmp` (plus the dev-mode `ɵsetClassMetadata`), which also carries the F-1 AOT/JIT split; (c) section 5, a two-arrow variance picture (producer narrows, consumer widens) or section 9, the chain "token/control/input -> consumer". Each followed by a "What to notice" sentence as at line 144. Net word cost about 60; pay for it with FIX-M07-04.

**T-2 · Medium · B8: add the *Framework vs platform* callout in section 7.** STYLE-GUIDE §6 names decorators. Suggested content (all already verified in the module): the language/TC39 part (standard decorators, Stage 2.7, `(value, context)`), the TypeScript part (two implementations, `experimentalDecorators`, helper lowering in 5.0), the Angular part (the compiler consumes `@Component` at build time, JIT needs the legacy shape, F-1). Keep it to about 60 words by moving, not adding: line 322 and 326 already hold the facts.

**T-3 · Medium · B7: origin or history for the traps in sections 5-9, and the `const` version.** See B7 for lines. Specific suggestions: section 5 "`strict` makes parameters sound": before 2.6 every function parameter was bivariant, and the method exemption keeps `Array<T>` covariant; section 7 "finished JavaScript": TypeScript 5.0 shipped the Stage 3 version in March 2023 and the proposal later moved to 2.7 (module 05 line 517 says the same; link it); section 8: say whether Zod 3's `z.object` also stripped by default and what changed for strict objects in 4 (read the Zod 4 changelog and cite it; V-4); section 9: typed forms were untyped before Angular 14 (the marker exists at line 430). For line 63/72: state which TypeScript version changed the `const T extends string[]` result (V-1) or drop the "release notes call mutable ones surprising" justification in favor of the 6.0.3 behavior the lab measured.

**T-4 · Low · C4: markers.** Add `[Added in TypeScript 5.2]` form for decorator metadata (line 325), either mark `NonNullable<T> = T & {}` as changed in 4.8 (read the 4.8 notes) or drop the aside, and a status marker (or a "status owned by module 17" link) at the first `input()`/`output()` mention (line 431). Check `ResolveFn` and `RedirectCommand` status in the 22.2.1 typings before deciding.

**T-5 · Medium · Q07.20 and section 9 line 461: the `$any()` claim has no basis.** "Avoid `$any()` ... because it switches off the inference that catches the mismatch" and "What breaks the inference? `$any()` in the host template" are plausible but untested and uncited. `$any(users)` makes the bound expression `any`, which can make `T` infer as `any` or leave it from other bindings; the actual result depends on the binding. Either add a spec case (a host with `[items]="$any(users)"` and `[label]="(count: number) => ..."` next to it, assert it compiles) and state exactly what is lost, or soften to "casts in a binding remove the check for that binding". Also say the `strictContextGenerics` sentence (line 1000) is the docs' wording and link the docs page.

**T-6 · Low · B9: define on first use.** `ngc` (line 326: "the Angular compiler's CLI, `ngc`"), `strictTemplates` (433: one clause, link to module 12 or the Angular docs), DTO (185: "data transfer object"), "tail-recursive" (152: "the recursive call is the last thing the type does"), Stage 2.7 (322: a clause plus the TC39 link, since Connections already links module 05 §8).

**T-7 · Low · Typed route data is thin.** Line 432 covers `ResolveFn<User>` only. The trap an interviewer asks about is the consumer side: `Route['data']` and `ActivatedRoute.data` are typed as `{ [key: string | symbol]: any }` (router typings `_router_module-chunk.d.ts` line 2205), so a resolver's `T` is not carried to `route.data['user']` and the value arrives as `any`. One sentence plus a note on narrowing with a type guard or Zod (section 8) makes the bullet complete; module 24 owns the binding to inputs. Verify by reading the typings again when writing (V-5).

**T-8 · Medium · G1: prose is 941 words over the cap and the overrun is repetition.** See Redundancy; FIX-M07-04.

**T-9 · Low · Exercises 07.2 and 07.3 are linked from nowhere outside their own heading.** Link them from sections 6/8 ("drill it with Exercise 07.2") and 9 ("Exercise 07.3"), and from the Short-on-time line if desired. Exercise 07.1 is linked from line 8 only.

**T-10 · Low · Q07.12 (line 798) relies on Q06.05 for "two `string` aliases are one type".** Q06.05 is about classes and `private` members. The point is true and covered by section 6 line 269, but the link overpromises; either link module 06 §2 (structural typing) or keep Q06.05 for the class half only.

**T-11 · Low · Section 7 line 322 buries the status.** "Stage 2.7, not finished, and Node 24 does not run it natively" is the single most asked decorator fact; it is correct (checked) and could lead the section's "How it actually works" as the first bullet's first sentence. Optional.

---

## Redundancy

Concrete repeats of one point (not a request to shorten for length). Estimated words in brackets.

1. **Section 7 and Q07.13/Q07.14 say the same thing twice.** Section 7 line 326 (what `ngc` emits, `ɵsetClassMetadata`, flag off leaves output unchanged) is restated in Q07.14 short answer (847) and full explanation (849) nearly sentence for sentence, then again in the Summary (472), the Misconceptions bullet (360), flashcard (1367) and Explain-it-back 4. Q07.13 re-quotes both 5.0-notes sentences already quoted at 322 and 325. Keep the mechanism in section 7 once; let Q07.14 give the interview answer in two sentences and link. [about 150]
2. **Section 4 repeats the `Omit` hole six times:** the bullet (195), two best-practice bullets (215-216), the misconception (220), Q07.09 (701-703, including the distributive-wrapper line), Q07.08 follow-up (689), flashcard (1347) and Summary. The distributive wrapper `T extends unknown ? Omit<T, K> : never` is written out at 195, 216, 703 and 1349. State it in section 4 once, keep the Q07.09 interview answer, drop the second and third copies. [about 120]
3. **Section 5 and Q07.10/Q07.11.** Q07.10's Full explanation (721) re-quotes the 2.6 exemption quoted at 237, and repeats the array hole (238) and `in`/`out` (239). Q07.11's explanation repeats the property-syntax fix shown in section 5's Code (247-248) and in its own Code block. Q07.10 and Q07.11 could share one explanation: Q07.10 states the rule and links to section 5; Q07.11 shows only the failure. [about 110]
4. **Section 3 and Q07.05/Q07.06.** Q07.05's Full explanation (584) repeats the `RouteParams` example and result printed in section 3 (150, 160-164); Q07.06 re-explains `never` distribution that section 3 line 149, the mermaid note (144), best practice (171), the flashcard (1343) and the Summary also state. Q07.06 is the Output drill and should keep its own reasoning; remove the explanation duplicated in Q07.05 and shorten the flashcard. [about 100]
5. **Section 1 and Q07.01/Q07.02.** Q07.01's explanation (486) repeats `firstAny`, `pair(1, 'a')` and `parse<T>()` from section 1 lines 34, 42, 45; Q07.02's explanation (516) repeats the `const`/`NoInfer` bullets (46-47) and the follow-up repeats line 72. [about 90]
6. **Section 9 and Q07.18/Q07.19/Q07.20.** Q07.18's explanation quotes the same `InjectionToken` doc sentence as line 429; Q07.19's explanation (982) repeats line 430 (Partial `value`, `getRawValue()`, `nonNullable`, `UntypedFormGroup`, the Angular 14 marker); Q07.20's explanation repeats line 433 and its code block repeats the `Picker` class shown in section 9's Code (448-452). [about 140]
7. **Section 8 and Q07.16/Q07.17.** Q07.17 repeats the stripped-keys quote (379) and `strictObject`/`looseObject`; Q07.16's trade-off text repeats the section's problem statement (367) and Exercise 06.2 reference. [about 70]
8. **Brands:** "`price + tax` still compiles, only using it as `Cents` fails" is stated at 279, 303, 308, Q07.12 (798, 819), Exercise 07.2 follow-up (1198), flashcard (1361) and Summary. Keep section 6 (279) and Q07.12; drop 303 or 308 (they are one point in two subsections) and the Exercise 07.2 follow-up, which only restates it. [about 70]
9. **Exercise 07.1 follow-up on `[P] extends [void]` (1118)** repeats Hint 2 (1053) and section 3; keep the hint and drop the follow-up or replace it with a new question. [about 30]
10. **Header "What this covers" (line 3, about 150 words)** repeats the Contents, Summary and Short on time. Cut to two sentences. [about 70]

Total identified: about 950 words, matching the +941 overage. Sections 1 to 9 themselves are not padded; do not shorten them.

---

## Claims to verify

- **V-1 (T-3).** Which TypeScript release changed `const T extends string[]` inference from the 5.0 notes' behavior (the lab measures `["a", "b"]`, not `string[]`, on 6.0.3). Method: read the 5.3 and later release notes or the linked PR; do not guess the version. If it cannot be found, say "since an unrecorded release before 6.0.3" and cite the lab test.
- **V-2 (T-5).** What `$any()` does to inference in a generic component's host template. Method: a spec in `labs/angular` with `[items]="$any(users)"`, run with `tsc -p tsconfig.spec.json` and `ng test`; assert the result.
- **V-3 (C1).** The "Mutation checks" sentences (lines 1111, 1192, 1305): each lists mutants "each failed tests", but no mutant file or test exists in the repo. Method: either record them in SOURCES.md as one-off runs with the date, or reword to what the tests assert; or add one mutant-style assertion per exercise.
- **V-4 (T-3).** What Zod 3 did with unknown keys in `z.object` and which Zod 4 changes affect `z.strictObject`/`z.looseObject` (names and deprecations). Method: Zod 4 changelog (https://zod.dev/v4/changelog) and the 4.6.5 `.d.ts`; add to SOURCES.md.
- **V-5 (T-7).** That `Route['data']` and `ActivatedRoute.data` are untyped (`any` values) in 22.2.1, and what `withComponentInputBinding()` does to their types. Method: router typings for `Route.data`, `ActivatedRoute.data`; one `tsc` line in the Angular spec.
- **V-6 (not run).** The nine `section-*`, `event-bus`, `order-schema` tests and the three Angular specs. Method: orchestrator's serial run (`npx vitest run src/modules/07-... src/outputs/07-...`; `npx tsc -p tsconfig.spec.json --noEmit && npx ng test --watch=false`). I read their titles and assertions only.

---

## Proposed FIX tasks

### FIX-M07-01 · S · Correct the Angular and decorators claim (AOT vs JIT)
- Findings: F-1, V-6 (the Angular spec part).
- Files: `modules/07-ts-advanced-types-and-decorators.md` (line 326; Misconceptions line 360; Summary line 472; Q07.14 title line 842, short answer 847, explanation 849, follow-ups 851-853; Explain-it-back 4 line 1324; flashcard 1365-1367), `SOURCES.md` (Module 07: `@angular/core` 22.2.1 `fesm2022/_debug_node-chunk.mjs` line 979), optionally `labs/angular/src/app/modules/07-ts-advanced-types-and-decorators/decorators.spec.ts`.
- Do: restate that the AOT compiler reads Angular's decorators from the source and ignores the flavor, but the JIT runtime throws for standard field decorators and the workspace keeps `experimentalDecorators: true`; reword Summary, Q07.14 (add a "what about JIT/field decorators?" follow-up), the flashcard and Explain-it-back 4; record the source; optionally add a spec asserting `Input()` called with `undefined` as target throws `Standard Angular field decorators are not supported in JIT mode.`
- Acceptance: `grep -n "only for parameter decorators\|matter only for" modules/07-ts-advanced-types-and-decorators.md` returns nothing; `grep -c "JIT" modules/07-ts-advanced-types-and-decorators.md` is at least 3; `grep -n "_debug_node-chunk" SOURCES.md` finds the new line under Module 07; if the spec was added, `npx tsc -p tsconfig.spec.json --noEmit && npx ng test --watch=false` (from `labs/angular`) exits 0; `node labs/tools/check-snippets.mjs . 07` and `node labs/tools/check-links.mjs --planned` pass.

### FIX-M07-02 · M · Diagrams and the decorators callout
- Findings: T-1, T-2 (QUALITY-BAR B3, B8).
- Files: `modules/07-ts-advanced-types-and-decorators.md` (section 7 mental model/How it works lines 316-326, section 5 line 230-232 or section 9 line 425, Contents untouched).
- Do: add two or three Mermaid diagrams (decorator order timeline from Q07.15; `@Component` source to `ngc` output; optionally variance direction), each followed by a sentence starting "What to notice"; add a `> [!NOTE]` *Framework vs platform* callout to section 7 splitting TC39, TypeScript and Angular (move words from line 322/326, do not add net length).
- Acceptance: `grep -c '```mermaid' modules/07-ts-advanced-types-and-decorators.md` is at least 3 and each is followed within 3 lines of its closing fence by "What to notice"; `grep -c "Framework vs platform" modules/07-ts-advanced-types-and-decorators.md` is at least 2 with one between the `## 7.` and `## 8.` headings; the diagram facts agree with the Q07.15 test output (`init B` before `init A`, `call A` before `call B`); `node labs/tools/check-snippets.mjs . 07` and `node labs/tools/check-links.mjs --planned` pass.

### FIX-M07-03 · M · Trap history, markers, definitions
- Findings: T-3, T-4, T-6, V-1, V-4 (QUALITY-BAR B7, B9, C4).
- Files: `modules/07-ts-advanced-types-and-decorators.md` (lines 63, 72, 79 area, 152, 185, 194, 261-263, 307-308, 322-326, 360-361, 414-415, 431-433, 465-466), `SOURCES.md` (5.2, 5.3 or the version V-1 finds, Zod 4 changelog, 4.8 notes if used).
- Do: add an origin clause or a version to every Misconceptions bullet in sections 5 to 9 (see T-3 for each); resolve V-1 and state the version in line 63 or reword line 72; add the markers in T-4 using STYLE-GUIDE §3.2 forms; define `ngc`, `strictTemplates`, DTO, tail-recursive and Stage 2.7 at first use.
- Acceptance: each of the 5 sections' Misconceptions bullets (lines under `### Misconceptions and traps` in sections 5-9) contains a cause or a version (reviewer reads them; `grep -nE 'Once true|Until|since|before [0-9]|comes from|belief' ` finds at least one per bullet); `grep -nE '\[(Added in|Changed in|Stable since)' modules/07-ts-advanced-types-and-decorators.md | wc -l` is at least 15; `grep -n "ngc\b" modules/07-ts-advanced-types-and-decorators.md | head -1` shows an inline definition; every new URL appears under Module 07 in SOURCES.md; `node labs/tools/check-snippets.mjs . 07` and `node labs/tools/check-links.mjs --planned` pass.

### FIX-M07-04 · M · Remove the repeated explanations to meet the cap
- Findings: T-8, T-9, T-10, Redundancy 1 to 10 (QUALITY-BAR G1).
- Files: `modules/07-ts-advanced-types-and-decorators.md` (line 3; Q07.01 486, Q07.02 516, Q07.05 584, Q07.06 615, Q07.08-09 674-703, Q07.10 721, Q07.11 766, Q07.13 831, Q07.14 849, Q07.16 915, Q07.17 946, Q07.18-20 964-1000; section 6 lines 303/308; Exercise 07.1 follow-up 1118; Exercise 07.2 follow-up 1198; flashcards 1329-1375); add the missing links to Exercise 07.2/07.3 in sections 6, 8, 9; fix the Q07.12 link (T-10).
- Do: apply each redundancy item as stated (state a point once in its section; the question answer gives the interview version and links back; do not shorten the Output questions' reasoning or any Short answer); keep every `Verified:` and `Background:` pointer. Run after FIX-M07-02 and FIX-M07-03 so the added diagrams and clauses are counted.
- Acceptance: `python3 -c "import re,sys;print(len(re.sub(r'\`\`\`[\s\S]*?\`\`\`','',open(sys.argv[1]).read()).split()))" modules/07-ts-advanced-types-and-decorators.md` prints at most 10,000; D1 counts still 20/20/20/20/20 (the QUALITY-BAR one-liner); `for i in $(seq -w 1 20); do grep -v "^### Q07.$i" modules/07-ts-advanced-types-and-decorators.md | grep -c "](#q07-$i)"; done` has no zero; `grep -c "](#ex07-2)\|](#ex07-3)"` is at least 2; every Output answer still lists its printed lines (`node labs/tools/module-stats.mjs` shows no flag for 07); `node labs/tools/check-snippets.mjs . 07` and `node labs/tools/check-links.mjs --planned` pass; no lab files changed.

### FIX-M07-05 · M · Back the unbacked claims; complete typed route data
- Findings: T-5, T-7, V-2, V-3, V-5 (QUALITY-BAR C1).
- Files: `modules/07-ts-advanced-types-and-decorators.md` (line 432 area for route data; line 461; Q07.20 explanation and follow-ups 1000 and 1021; lines 1111, 1192, 1305), `labs/angular/src/app/modules/07-ts-advanced-types-and-decorators/typing-patterns.spec.ts` (new cases), `SOURCES.md`.
- Do: add a spec case that shows what `$any()` does to a generic component's inference and word the claim to that result (or soften it); link the Angular docs page for `strictContextGenerics`; add the `Route['data']`/`ActivatedRoute.data` consumer-side sentence with a one-line typed check; either record the exercise mutation runs in SOURCES.md as dated one-off runs or reword the three "Mutation checks" sentences to what the tests assert; add inline doc links for the quoted Zod, `InjectionToken`, typed-forms and 5.2/TC39 sources where they are quoted.
- Acceptance: `grep -n "\$any" modules/07-ts-advanced-types-and-decorators.md` shows only wording backed by a named `Section 9:` test or softened text; the new spec cases exist (`grep -n "any()" labs/angular/src/app/modules/07-ts-advanced-types-and-decorators/typing-patterns.spec.ts`); from `labs/angular`: `npx tsc -p tsconfig.spec.json --noEmit && npx ng test --watch=false` exits 0; `grep -n "Mutation checks" modules/07-ts-advanced-types-and-decorators.md` is either gone or each is matched by a dated line under Module 07 in SOURCES.md; `grep -n "key: string | symbol\|ActivatedRoute" modules/07-ts-advanced-types-and-decorators.md` finds the route-data sentence; `node labs/tools/check-snippets.mjs . 07` and `node labs/tools/check-links.mjs --planned` pass.

Coverage of every fail and factual error: F-1 -> FIX-M07-01; B3 -> FIX-M07-02; B8 -> FIX-M07-02; B7 -> FIX-M07-03; B9 -> FIX-M07-03; C1 -> FIX-M07-01 and FIX-M07-05; C4 (partial) -> FIX-M07-03; G1 (partial) -> FIX-M07-04.
