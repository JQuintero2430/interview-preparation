# REVIEW-M16: `modules/16-dependency-injection.md`

- **Reviewer:** subagent, model claude-sonnet-5-5, for session S20261008-1307-claudecode (this session authored no module-16 task, so it is eligible)
- **Date:** 2026-10-08
- **Files read:** `modules/16-dependency-injection.md` (all 2,474 lines); `_meta/RUN.md` sections 5-7 and 10-13; `_meta/QUALITY-BAR.md`; `STYLE-GUIDE.md` §3.2, §6, §7.3; `_meta/reviews/REVIEW-M14.md` (format); `_meta/TASKS.md` (the module-16 common rules and the REVIEW-M16 block); `_meta/modules/M16.md` (plan, facts F1-F30, "Could not be read" C1-C8, breadth gate); STATE.md (PLAN-M16 and CLOSE-M16 "For Jorge" notes) and the CLOSE-M16 line of LOG.md; the SOURCES.md and GLOSSARY-TERMS module-16 sections; labs `labs/angular/src/app/modules/16-dependency-injection/` (all 9 `concepts/section-*.spec.ts` plus `service-demo.ts`, the five exercise folders, `outputs/q16-outputs.spec.ts`, read in full for the Output spec and in part for the section specs) and `labs/ts-js/src/modules/16-dependency-injection/` (`injector-model.ts`, its test); installed `@angular/core` 22.2.1 typings (`types/core.d.ts`, `_chrome_dev_tools_performance-chunk.d.ts`, `_debug_node-chunk.d.ts`, `testing.d.ts`) and sources (`fesm2022/core.mjs` `injectAsync`; `_pending_tasks-chunk.mjs` `provideEnvironmentInitializer`, `R3Injector`; `_debug_node-chunk.mjs` `ɵɵdefineService`, `provideAppInitializer`, `searchTokensOnInjector`); `@angular/common` `http.d.ts` and `@angular/forms` `forms.d.ts` (multi-provider wording); the Angular `CHANGELOG.md` from `main`; the docs markdown at tag `v22.2.1` (creating and using services, lazy loading services, hierarchical injectors, injection context, defining dependency providers, host elements, two migration pages, errors NG0202 and NG0204); the Spring Framework 7.0.9 reference pages (bean scopes, introduction, dependency injection, classpath scanning) fetched into the scratchpad; `modules/17-signals.md` (skim), `modules/12-angular-how-it-works.md` Q12.17 and §6 (overlap), and the lines of modules 02, 04, 05 that point at module 16.
- **What was run** (Node 24, `export PATH=/opt/homebrew/opt/node@24/bin:$PATH`, one check at a time): from `labs/angular` `npx ng test --watch=false --include='src/app/modules/16-dependency-injection/**/*.spec.ts'` (15 files, 116 tests, all passed, no warning), `npx tsc -p tsconfig.spec.json --noEmit` (exit 0), `npx ng build` (complete; Initial total 189.56 kB; output in the ignored `dist/`), `npx ng generate service demo/shop --dry-run` and the same with `--injectable` (75 and 106 bytes; nothing written); from `labs/ts-js` `npx vitest run src/modules/16-dependency-injection` (1 file, 9 tests passed) and `npx tsc --noEmit -p .` (exit 0); `node labs/tools/check-snippets.mjs . 16` ("All snippets check out."); `node labs/tools/check-links.mjs --planned` ("All links resolve.", 460 planned); `node labs/tools/module-stats.mjs` (row 16: 36 Q, 6 Ex, 20,537 words, mix Concept 13, Output 6, Bug hunt 6, Design 5, Difference 4, Trade-off 2, no flags); the QUALITY-BAR python one-liner (20,537); `ngc` 22.2.1 on a throwaway project that symlinks `labs/angular/node_modules` (every quoted diagnostic and the emitted `ɵprov` lines re-run, plus one new probe, F-1); a production `ng build` of a second throwaway workspace (the tree-shaking observation re-run, V-2); mermaid 11.17.2 and 12.1.0 `mermaid.parse` under jsdom (installed in the scratchpad only); and small scripts (D1 counts, per-answer follow-up counts, cited test names against the spec titles, criteria against test titles, "because" and "exists because" clauses, URL list against SOURCES, "in the lab" sentences, first-use positions of terms and markers, prose counts per part).
- **Probe files:** only under the session scratchpad `m16/`; deleted at the end (see the last line of this file). `labs/angular/dist/` and `labs/angular/.angular/` are ignored by `labs/angular/.gitignore` and were written by `ng build` and `ng test`.

Overall: a strong, honest module with no Fail. All 125 spec titles exist and pass (run), every one of the 86 distinct `Section N:` names the module cites exists (script), the six Output answers equal their assertions line for line (run), every quoted `ngc` text reproduced on 22.2.1 (`NG2003`, `NG2028`, `TS2449`, `TS2339`, `TS2322`, `TS2769`, the four `ɵprov` lines; run), and every runtime error text (`NG0200`, `NG0201`, `NG0203`, `NG0205`, `NG0207`) is asserted by a passing spec whose string equals the quote (run, then read). The `@Service` section meets every rule of the REVIEW block (markers, `NG2028`, no unread rationale). The weak points: one factual mix-up (F-1: `NG2003` is attributed to an undecorated class; it is raised for a decorated class whose parameter cannot be a token, and an undecorated class in `providers` gets `NG2005`, which the module never shows), mechanism depth short of the pilot in sections 4, 5 and 8 (T-1: behavior is probed, the data structures are not named), one question and one paragraph that repeat module 12 (T-2, Q16.25 against Q12.17), undefined terms on first use (T-3), the SYLLABUS "adapter" pattern never taught (T-4), one URL missing from SOURCES (T-5), plus small items. The three stale statements the closer listed are confirmed (04:1148 and 05:853 as stated; 17:153 as a marker inconsistency), and a fourth is added (02:1303). The module is at 20,537 prose words against a post-fix ceiling of 21,980; about 380 words can be cut, and the proposed fixes add at most 660, ending at 20,880.

---

## QUALITY-BAR

Counts: **37 Pass, 8 Partial, 0 Fail, 0 N/A** (45 items). Items not Pass: B4, B9, B10, C1, C4, C8, D5, G2. (CLOSE-M16 recorded 40 Pass and 5 Partial; its B9, C8 and G2 are confirmed, and B4, B10, C1, C4 and D5 are added here.)

| ID | Result | Evidence |
|---|---|---|
| A1 | Pass | Lines 3-9 in STYLE-GUIDE §4.1 order; line 9 gives both lab folders and both run commands; I ran both (116 and 9 tests). |
| A2 | Pass | Prerequisites link `12-...#6-bootstrapping-...` and `13-...#7-the-host-element-...`; both anchors exist (link check). |
| A3 | Pass | "Short on time" names sections 1, 3, 5, 6, six Q IDs (Q16.02, 08, 10, 15, 17, 19), Exercise 16.1 and ends with the Summary link; all resolve. |
| A4 | Pass | Contents (lines 13-26) links the 9 sections plus Summary, Question bank, Hands-on exercises, Check your understanding, Connections; they match the 14 `## ` headings (grep). |
| A5 | Pass | Why DI, providers, `providedIn`/`@Service`, context, tree, `viewProviders`, tokens, lifetime, patterns. Forward uses are linked; the ones that are not defined before use are listed under B9. §9 (patterns, testing, Spring) is applied, not "under the hood"; the plan records the reason (M16.md "Order of sections") and §8 holds the deepest material. |
| B1 | Pass | `grep -c` of the six subheadings: 9 each (9 × 6). |
| B2 | Pass | Problems are concrete failures: a `Report` that builds its own clock, a `Logger` alias that makes two buffers, a constructor parameter that will not compile under `@Service`, `NG0203` in `ngOnInit`, a service "not found from the root", two fields editing one validation object, an `NG0200` cycle, a test override that does nothing. |
| B3 | Pass | 9 `mermaid` blocks and 9 "What to notice" lines, one per section; the shapes (flow, sequence for the context, tree walk, recipe selection, state machine for lifetime) match the mechanisms. 9 of 9 parse under mermaid 11.17.2 and 12.1.0 (run). None rendered in a browser (V-1). The §3 edge `legacy -.->|"deprecated"| rootinj` reads as "becomes root" (F-2). |
| B4 | Partial | Sections 2, 3, 6, 7 reach a mechanism (identity per recipe, `ɵɵdefineService`, the view boundary, `makeEnvironmentProviders`). Sections 4, 5 and 8 describe behavior from probes and docs and never name what a demanding interviewer asks next: how `inject()` finds the current injector, what an element injector is at run time (a per-view injector index with a bloom filter, `searchTokensOnInjector`), that an environment injector is an `R3Injector` with a `records` map and an `_ngOnDestroyHooks` set (which is why Q16.28's order is creation order). All are readable in 22.2.1. T-1. |
| B5 | Pass | 9 of 9 `### Code` start with "The approach:" plus 3-5 numbered steps. §6 step 4 and §5 step 4 describe test setup that the Excerpts only partly show (Info). |
| B6 | Pass | 38 of 38 best-practice items carry "because" (script: 3, 4, 3, 4, 5, 5, 5, 4, 5). |
| B7 | Pass | 28 of 28 traps give a correction and "exists because" (script). The four "Once true" claims (`providedIn: 'any'`, `runInContext`, the initializer tokens, `Injector.create` destroy) carry a CHANGELOG line I confirmed (15.0.0, 16.0.0, 19.0.0, 20.0.0). |
| B8 | Pass | 4 callouts: Framework vs platform (line 67, "Angular DI vs plain constructor injection" is in STYLE-GUIDE §6) and three Coming from the backend (lines 70, 388, 940, the Spring container is the SYLLABUS comparison); each states "Where the analogy breaks". No `[!WARNING]` legacy callout: legacy forms are inline (Info, T-9). |
| B9 | Partial | Used before they are defined or linked: `ngOnDestroy` (§6 line 643; defined §8 line 805), "facade" (§1 line 128; defined §9 line 917), `TestBed` (§1 lines 52, 117; never defined, "module 29's" at line 936), "signal" (§1 code line 84, §6 line 694; no link to module 17), "barrel" (line 301 and Q16.07; never defined, the table calls it an index). Glossary has none of facade, barrel, `TestBed`. T-3. |
| B10 | Partial | Owned elsewhere and linked, as required, except initializers: the §7 "Initializers" paragraph (112 words), the §7 trap and best-practice about `provideAppInitializer`, and Q16.25 re-explain what Q12.17 owns (source shape `makeEnvironmentProviders` over the token, "not awaited", the same trap). T-2. |
| C1 | Partial | 31 claims sampled and traced (list below). All trace except F-1 (the `NG2003` attribution), F-2 (the NgModule replacement) and the Q16.35 equivalence (T-8). |
| C2 | Pass | 6 `Output` questions (Q16.05, 16, 17, 20, 28, 34), each with a test named after its ID; all 6 equal their answers (cross-check below). |
| C3 | Pass | 86 distinct `Section N:` names cited, 0 missing (script); the 6 exercise criteria sets map to exact test titles (E2); the 8 "in the lab" sentences with no test in the same sentence have one in the next sentence or are the Q16.20/Q16.23/Q16.27 cases that the named test asserts (read). Caching claim of §7 is weaker than its test (T-9). |
| C4 | Partial | 30 markers, all STYLE-GUIDE §3.2 forms (list below). `EnvironmentProviders` [Added in v15.0] is placed at §7 line 731, but the first mention is §6 line 647 (T-6). The `[Deprecated since v15.0 — use 'root']` form is incomplete for an NgModule class (F-2). `@Service` has only `[Added in v22.0]` and `[Added in v22.1]`. Tree-shaking is worded as observed (see module-specific checks). |
| C5 | Pass | Every API, option and code exists in 22.2.1: all snippets compile under `ng build`/`tsc`; `Service`, `injectAsync`, `provideEnvironmentInitializer`, `DestroyableInjector` found in the typings; `ngc` re-run of NG2003, NG2028, TS2449, TS2339, TS2322, TS2769 (run). VERSIONS.md has no row for `@Service`, `injectAsync` or the initializer functions (noted by CLOSE-M16; not an error here, see V-8). |
| C6 | Pass | 0 `Unverified` in the module; the not-run claims are worded as read, documented or "not run" (V-3, V-5, V-6). |
| C7 | Pass | `check-snippets . 16`: "All snippets check out." Output snippets carry `// Partial:`; `ngc` and runtime texts are ` ```text `. |
| C8 | Partial | 14 of 15 URLs in the module are in SOURCES under Module 16. Missing: `https://v22.angular.dev/errors/NG0201` (module lines 178-179, 1240, quoted in runtime text; SOURCES has NG0200, NG0203, NG0205 only). Also no SOURCES line for the code of Exercises 16.2, 16.3, 16.4, 16.6 and `q16-outputs.spec.ts` (Info). T-5. |
| D1 | Pass | 36 questions × 5 parts in order (script); every question has at least 2 follow-ups, each answered; no Short answer above 80 words. |
| D2 | Pass | All 6 Output short answers give the printed lines and 1-2 sentences of reasoning. |
| D3 | Pass | Mix: Concept 13, Output 6, Bug hunt 6, Design 5, Difference 4, Trade-off 2; 6 tags; the largest is 36%; one Design and Bug hunt exist; Trade-off 2. |
| D4 | Pass | Q16.01-Q16.36 follow the section order (1-3, 4-7, 8-9, ...). |
| D5 | Partial | No duplicate title inside the module. Q16.25 ("`provideEnvironmentInitializer`, `ENVIRONMENT_INITIALIZER` and `provideAppInitializer`: how do they differ?") overlaps Q12.17 ("`APP_INITIALIZER` versus `provideAppInitializer` (and the environment and platform initializers)"): same mechanism, same trap. Q16.21 and Q17.05 are different questions (linked). T-2. |
| D6 | Pass | All 36 question IDs are linked from the body (36 distinct `](#q16-NN)`); every answer links back to a section; 6 exercise IDs are linked. |
| D7 | Pass | 36 `<a id="q16-NN">` and 6 `<a id="ex16-N">` anchors, each directly above its heading; link check passes. |
| D8 | Pass | 36 Q and 6 Ex against the SYLLABUS row (40, 6) and the floor (25, 4). |
| E1 | Pass | Each exercise has Problem, Constraints (with what is not covered), Acceptance criteria, 2 hints, Worked solution (approach, code, criterion account), Alternative + Trade-offs, Interviewer follow-ups (3, 3, 3, 3, 3, 2, all answered), Tests link. |
| E2 | Pass | Criteria against test titles (script): 6/6/6/6/6/9, all exact, no test without a criterion. The criterion accounts name the tests ("Each criterion is the title of one test"). |
| E3 | Pass | Storage service, `injectX` helper, per-field state, `provideBilling`, feature injector with cleanup and cycle, injector model: simple to integrating. |
| E4 | Pass | All five Angular solutions and the ts-js model are in labs, compile (`tsc` exit 0, `ng build` complete), pass (116 + 9) with no warning; `grep` finds no `any`; no class I read injects more than 3 dependencies. |
| E5 | Pass | 6 `Output` questions; Exercise 16.6 asserts exact order and messages. |
| F1 | Pass | Summary: 3 paragraphs, 331 words, 9 section links, each section's claim and its most-asked trap; no fact not taught above. |
| F2 | Pass | "Explain it back": 5 prompts, each naming a listener (backend developer, teammate, reviewer, colleague, Spring developer). |
| F3 | Pass | 8 flashcards (`<details>`), one- or two-line answers. |
| F4 | Pass | Builds on / Read next / Uses later all present, each linked with a reason; no "Comparisons" entry needed (the Spring comparison is in §9). |
| G1 | Pass | 20,537 prose words against the plan (21,080) and the post-fix ceiling (21,980). Sections 7,742 (mean 860 against the pilot's 782, +10% as M14's +11%); answer blocks mean 226 against the pilot's 226, max 264; exercises 545-570, mean 560 (cap 620); closing 812 against the pilot's 809. Parts A+B+C+E come to about 11,530 against the bar's 10,000, as the pilot's 10,860 does; the plan sets the cap aside for this module. Redundancy exists and is listed below (about 380 words, fixes ahead of any adds). |
| G2 | Partial | Ten of eleven SYLLABUS rows are fully covered. Row 10 ("strategy via tokens, facade, adapter, configuration objects, feature flags, `provideX()`") lacks the **adapter** pattern: §9 defines strategy, facade, configuration object, feature flag and `provide*` but never "adapter"; Q16.32-36 never ask it; the word appears only as a payment-gateway label in Exercise 16.4. T-4. |
| H1 | Pass | 116 + 9 tests, both `tsc` runs, `ng build` pass (run). |
| H2 | Pass | `check-links.mjs --planned`: "All links resolve." (run). |
| H3 | Pass | `git status --short` before this file was written: the module-16 files (`modules/16-dependency-injection.md`, `_meta/modules/M16.md`, both lab folders) are untracked and declared; `angular.json`, `package.json` and lockfiles unchanged; no stray file. (`labs/ts-js/vitest.config.ts` is modified by an earlier task, not by module 16.) |

Claims sampled (C1) and basis, 31: status markers (CHANGELOG: 22.0.0 `@Service` and `injectAsync`, 22.0.3, 22.1.0, 20.0.0, 20.1.0 `destroyed` on both `DestroyRef` and `EnvironmentInjector`, 19.0.0, 18.0.0 `HOST_TAG_NAME`, 16.0.0 three lines, 15.1.0, 15.0.0 two lines, 14.1.0; all read); `@deprecated` tags (typings: `Injectable` NgModule/`'any'` signature only; `ENVIRONMENT_INITIALIZER` and `APP_INITIALIZER` "from v19.0.0"; `EnvironmentInjector.runInContext`; none on `Self`/`Optional`/`SkipSelf`/`Host`/`Attribute`, read); no `@experimental` or `@developerPreview` tag on `Service` (read); `ɵɵdefineService` sets `providedIn: opts.autoProvided === false ? null : 'root'` (read); the four `ɵprov` lines (run); `provideEnvironmentInitializer`/`provideAppInitializer` shape (read); `injectAsync` source (reads `inject(Injector)` at the call, keeps `loadedPromise`, `.then` per call, prefetch `.catch`; read); `DestroyRef` scope wording, `Injector.create` signature and `DestroyableInjector`, `createEnvironmentInjector(providers, parent)`, `createComponent` `environmentInjector` (typings, read); `_ngOnDestroyHooks` is a `Set` filled at creation (read; supports Q16.28's order); `HTTP_INTERCEPTORS` and `NG_VALIDATORS` multi wording (typings, read); five angular.dev quotes ("a modern, ergonomic shorthand", "excluded from the final production bundle if your code never explicitly uses it", "more accurate types", "Subsequent calls reuse the same promise", the `viewProviders` sentence; read at tag v22.2.1); `HostAttributeToken` throws when missing (docs line 190, read); NG0202 source text and NG0204 page title "Invalid Injection Token" (read); four Spring quotes plus "specializations of `@Component`" and the constructor example (read, 7.0.9); 75-byte `shop.ts` (run); the tree-shaking table (run, V-2); NG2003 against an undecorated class (run, F-1).

Status markers checked (C4): 30: `[Added in v14.1]` 1, `[Added in v15.0]` 1, `[Added in v15.1]` 3, `[Added in v16.0]` 3, `[Added in v18.0]` 2, `[Added in v19.0]` 2, `[Added in v20.0]` 2, `[Added in v20.1]` 3, `[Added in v22.0]` 8, `[Added in v22.1]` 2, `[Deprecated since v15.0 — use 'root']` 1, `[Deprecated since v19.0 — use provideAppInitializer]` 1, `[Deprecated since v19.0 — use provideEnvironmentInitializer]` 1. All plain (none backticked), all §3.2 forms. Tension (V-4): STYLE-GUIDE §3.2 prefers `[Stable since vX]` for a stable API that arrived in a major; the REVIEW block and the plan fix `@Service` at `[Added in v22.0]`, which the module follows.

---

## Module-specific checks (TASKS.md REVIEW-M16)

| Check | Result |
|---|---|
| `ngc` texts `NG2003`, `NG2028`, `TS2449` re-run on 22.2.1 | Reproduced (run). NG2003 and NG2028 equal the §1 block (the module omits the code frame and the `~` lines without saying so, V-3); TS2449 equals §8. F-1: the module attributes NG2003 to the wrong class kind. Also re-run: TS2339 (§4), TS2322 (§6), TS2769 (§3, only the first overload block shown, V-3), the four `ɵprov` lines (§3), no diagnostic for two `@Service` classes injecting each other or for `forwardRef(() => X)` in `providers`. |
| Runtime texts `NG0200`, `NG0201`, `NG0203`, `NG0205`, `NG0207` | All asserted by passing specs with the same strings (run: `section-2`, `section-4`, `section-5`, `section-6`, `section-8`, exercise 4 and 5 specs; read: the module quotes equal the asserted strings, with the test build's leading underscore on class names stated). |
| `@Service` markers only `[Added in v22.0]`/`[Added in v22.1]` | Pass: 8 + 2 uses, no `[Experimental]`, no `[Developer preview]`, no `[Deprecated]` on `@Injectable` (typings: no tag on `Injectable` except its NgModule/`'any'` signature; read and grep). |
| Constructor-DI ban shown with `NG2028` | Pass: §1 block, §3 block (with a `factory`), Q16.08, flashcard. |
| `@Service` section claims no unread rationale | Pass. Reasons given are the docs' comparison and the module's own trade-off (Q16.09 "a guarantee, not behavior"); no claim about why the Angular team added it. |
| `Injector.runInInjectionContext` not used | Pass: it appears only as the failing form (§4 block, Q16.12 trap, Exercise 16.2 constraint). I fetched the guide, the lazy-loading and DI pages at v22.2.1: none shows the method form (grep). |
| Tree-shaking worded as observed, cause not established | Pass: §3 "Observed in a scratch build... The cause is not established; this is no rule about barrels"; Q16.07, Summary and glossary say the same. I re-ran a production build of a throwaway workspace (V-2): unreferenced `@Service` and root `@Injectable` pairs are absent; the pairs re-exported through an index that the app imports (`export *` and named) are present, one `@Service` and one `@Injectable` each. The module's byte counts (92,486 / 92,804 / 92,802) are not reproducible on my skeleton (91,806 / 92,112 / 92,114); the qualitative result is. |
| Every resolution claim is a probed combination with a named test | Pass. Modifiers: `Section 5: self, skipSelf, host and optional...` and Q16.17 (11 values); `viewProviders`: three `Section 6:` tests and Q16.20; route injectors: four `Section 5:` tests and Q16.16; platform injector: the `Section 3:` platform test. "Only these combinations were run" is stated at §5 line 561, §6 line 645 and Q16.17. Two sentences lean on interpretation, not a test: §9 "as the first test did" (T-8) and Q16.35's "What replaces a scoped proxy?" (T-8). |
| TestBed override claims match the spec | Pass: `Section 9: module-level providers...`, `overrideProvider...`, `overrideComponent...` and Q16.34 assert `real`/`real`/`fake` exactly as the prose says. |
| `Injector.create` destruction claimed only if probed | Pass: probed (`Section 8: Injector.create destroy runs ngOnDestroy...`, run) and marked `[Added in v20.0]` from CHANGELOG 20.0.0 (read). |
| Spring comparison quotes the reference with a date and runs no Spring code | Pass: four quotes verified verbatim on the 7.0.9 pages ("The singleton scope is the default scope in Spring", "per-container and per-bean", "you may choose to inject an AOP proxy in place of the scoped bean", "generally advocates constructor injection"); "automatically detect stereotyped classes" and the `@Service` specialization sentence also read. Every quote is dated 2026-10-08; no Spring snippet is run or shown. |
| `NG0209` not used | Pass: `grep -c NG0209` is 0. |
| No repetition of what 07, 12, 14, 15, 17, 24, 27 own | Partial: bootstrap order, token typing, pipes with DI, NgModule providers, signal stores, route providers, interceptors are one sentence plus a link. The exception is the initializer material owned by 12 (T-2). Ex 12.2 also builds a `provideX()` function; Exercise 16.4 is a different design (strategy, hooks, config) and links Q12.17 (Info). |
| Every Misconceptions bullet has a cause clause | Pass: 28 of 28 contain "exists because" or "survives because" (script). |
| Every "in the lab" claim names an existing test | Pass (C3). |
| SSR scoping, timings and memory never presented as observed | Pass: `grep` finds no timing or memory claim; §5 line 550 and Connections say server scoping is not claimed. |
| Pilot depth (G1, no filler) | Pass with notes: answer blocks equal the pilot's mean; sections run 10% above it; B4 shows the depth gap is in mechanism, not length (T-1); the redundancy list is below. |
| Ceiling 21,980 for FIXes | The module is 20,537. The proposed FIX tasks end at 20,880 (cumulative ceilings below), 1,100 under the ceiling. |

### CLOSE-M16 handoffs assessed

- **B9** (`ngOnDestroy`, "facade", `TestBed`, "signal"): confirmed, plus "barrel" (T-3).
- **C8** (`v22.angular.dev/errors/NG0201`): confirmed (T-5).
- **G2** (adapter): confirmed (T-4).
- **`modules/17-signals.md:153`** ``@Service() `[Stable since v22.0]` ``: confirmed stale against module 16 (backticked, and a different form from 16's `[Added in v22.0]`); see V-4 for which form to keep.
- **`modules/05-js-modules-memory-modern-features.md:853`** "`providedIn: 'root'` services are referenced through imports, so unused ones drop out ([module 16])": confirmed overstated. Module 16 §3 observed an unreferenced pair dropped but a re-exported pair kept (V-2 reproduces it); the sentence presents the drop as certain and points to a module that says the cause is not established.
- **`modules/04-js-async-event-loop.md:1148`** "or in an app initializer ([16. Dependency injection])": confirmed; app initializers are owned by module 12 (Q12.17, §6), module 16 only links them. **New:** `modules/02-js-scope-closures-this.md:1303` points to "[Module 16]" for `provideAppInitializer` the same way.

---

## Factual findings

**F-1 · Medium · `NG2003` is attributed to an undecorated class; the module never shows what an undecorated class in `providers` produces.**
Location: Q16.01 follow-up 2, "only an undecorated class with a constructor parameter fails at compile time (`NG2003`, the dated `ngc` run in section 1)" (grep `only an undecorated class`); Q16.02 Full explanation, "`ngc` 22.2.1 on 2026-10-08 gave `NG2003` for it and `NG2028` for a `@Service` with a parameter" (grep `gave \`NG2003\` for it`), where "it" is an undecorated class. The §1 run is right: `Plain` was `@Injectable({ providedIn: 'root' })` with a `string` parameter.
Evidence (run, `ngc` 22.2.1, the lab's options): `class Undecorated { constructor(public dep: Dep) {} }` listed in a component's `providers` gives `error NG2005: The class 'Undecorated' cannot be created via dependency injection, as it does not have an Angular decorator. This will result in an error at runtime. Either add the @Injectable() decorator to 'Undecorated', or configure a different provider (such as a provider with 'useFactory').` NG2003 needs a decorated class whose parameter type cannot be a token. `TestBed.inject(Undecorated)` unlisted is the run-time `NG0201` (`Section 1: an undecorated class with a constructor parameter has no provider`, run).
Correction: Q16.01 follow-up: "a missing provider is a run-time `NG0201`; at compile time `ngc` catches a decorated class whose parameter type cannot be a token (`NG2003`) and an undecorated class listed in `providers` (`NG2005`)". Q16.02: "`NG2003` for an `@Injectable` with a `string` parameter". Add one dated `NG2005` text line to the §1 block (code is not counted). Word delta about +35.

**F-2 · Low · `[Deprecated since v15.0 — use 'root']` is incomplete for an NgModule class, and the §3 diagram implies both become root.**
Location: §3 "Deprecated forms" (grep `Deprecated since v15.0`) and the §3 mermaid edge `legacy -.->|"deprecated"| rootinj`. CHANGELOG 15.0.0 (read) says of `providedIn: NgModule`: "If providers should truly be scoped to a specific NgModule, use `NgModule.providers` instead"; `providedIn: 'any'` has no replacement beyond `'root'`.
Correction: marker "[Deprecated since v15.0 — use 'root' or NgModule.providers]" (still a §3.2 form), and relabel the diagram edge "deprecated, replaced by root or NgModule providers". Word delta about +8.

Info: Q16.36 Short answer ends "`NG0202`, `NG0204` were read only; typings have no `NG0206`." The facts are right (source and enum read; NG0204's page title is "Invalid Injection Token") but the sentence is cryptic; reword in FIX-M16-05.

---

## Teaching and completeness findings

**T-1 · Medium · Mechanism depth in sections 4, 5 and 8 (B4).** Add short "read from 22.2.1 source" sentences, no new behavior claims: (§4) `inject()` reads a module-level current injector that Angular sets during construction (`setCurrentInjector` in `fesm2022/_not_found-chunk.mjs`, `injectInjectorOnly`/`ɵɵinject` in `_pending_tasks-chunk.mjs`), which is why the context ends when construction does; (§5) an element injector is an entry in the view's data with a bloom filter, searched by `getOrCreateInjectable` → `lookupTokenUsingNodeInjector` → `searchTokensOnInjector` (`_debug_node-chunk.mjs`), and an environment injector is an `R3Injector` with a `records` map (`_pending_tasks-chunk.mjs:1085`); (§6) `searchTokensOnInjector` computes `canAccessViewProviders` from the previous and current `TView`, which is the rule behind Q16.20; (§8) `R3Injector.destroy` iterates `_ngOnDestroyHooks`, a `Set` filled at creation, so destruction runs in creation order (Q16.28). Verify names with `grep` before writing. About +330 words. Basis: read.

**T-2 · Medium · Q16.25 and the §7 initializer material repeat module 12 (B10, D5).** Q12.17 already owns: `provideAppInitializer` and `provideEnvironmentInitializer` are `makeEnvironmentProviders` over the two tokens, environment initializers are not awaited, the deprecation from v19.0.0, and the trap "return a promise from `provideEnvironmentInitializer`". Keep Q16.25 (IDs are never renumbered) but refocus it on what 16 owns: the lab shows the function and the legacy token both run once, in an injection context, as the environment injector is built; one sentence plus the link for the rest. Trim the §7 paragraph, the §7 second misconception and the fourth best-practice bullet to a sentence and a link each. About -190 words (see Redundancy).

**T-3 · Medium · Terms used before they are defined or linked (B9).** `ngOnDestroy` (§6 line 643): add "(the method Angular calls when the owner is destroyed, [module 20])"; "facade" (§1 line 128): "a class in front of several services, §9"; `TestBed` (§1 line 52): "Angular's testing harness for DI, [module 29]"; "signal" (§1 line 84 and §6 line 694): a link to `17-signals.md#2-writable-signals`; "barrel" (line 301, Q16.07): "an index file that re-exports other files". Add facade, barrel, `TestBed` to GLOSSARY-TERMS "Module 16". About +60 words.

**T-4 · Medium · The adapter pattern is never taught (G2 row 10).** Add to §9's definition list: "An **adapter** is a class that gives a foreign API the shape a token promises, so consumers keep one interface". Add one follow-up to Q16.32: "What if the vendor SDK has a different shape?" answered with the adapter and the `useClass` provider, pointing at Exercise 16.4, whose `StripeGateway`/`FakeGateway` are two adapters of one token (test `the PAYMENT token resolves to the fake or the stripe adapter by option`). About +85 words. No new lab code.

**T-5 · Low · SOURCES.md is missing `https://v22.angular.dev/errors/NG0201` (C8).** Add one line under Module 16 in the style of the NG0200/NG0205 line ("the runtime message links the page; the text is quoted from the Section 1/2/7 tests"). Also add one-line code entries for Exercises 16.2, 16.3, 16.4, 16.6 and `outputs/q16-outputs.spec.ts`, and say "the six tests titled as the criteria" for Exercises 16.1 and 16.5, not "`E16.1` tests" (the tests carry no `E16.N` prefix, which the TASKS rule asked for; E2 still holds).

**T-6 · Low · Marker position (C4).** `EnvironmentProviders` `[Added in v15.0]` belongs at the first mention, §6 line 647; at §7 line 731 keep a bare mention.

**T-7 · Low · Format.** Q16.36 "**Full explanation.** - `NG0200`..." glues the first list item to the label (put a blank line after the label); Exercise 16.1 has "factory default,, as `SALUTATION`" (double comma, grep `default,,`); Q16.36 Short answer wording (Info above).

**T-8 · Low · Two comparisons stated more firmly than their basis.** §9 "Angular picks a different lifetime by choosing the injector, as the first test did": the first Section 9 test is about strategy per injector, not lifetime; point to `Section 3: a component-level provider shadows the root instance` and `Section 5: a route with providers...` instead. Q16.35 follow-up "What replaces a scoped proxy? Listing the class in a component's or route's `providers`": a scoped proxy lets a long-lived bean reach a short-lived one, which an Angular injector walk cannot; say "nothing replaces the proxy: a shorter-lived instance lives in a nearer injector and a farther injector cannot reach it (`Section 5: the root injector does not see route providers`)". Words about 0.

**T-9 · Low · Smaller items.** (a) `Section 7: a token with a factory is provided in root...` compares `25` with `25` with `toBe`, which cannot show that the root keeps the result (the module says "so two lookups return the same value"); either assert with an object-valued token or reword "the factory's value". (b) §7 says `bootstrapApplication` accepts `EnvironmentProviders`; the test uses `TestBed` and an environment injector; cite the typings (`ApplicationConfig.providers: Array<Provider | EnvironmentProviders>`) or say "an environment injector". (c) The module has no Legacy subsection (STYLE-GUIDE §3.4): the legacy forms are covered inline (§3 deprecated forms with migration, §5 older decorators, §7 tokens), which is acceptable; no action. (d) Q16.20's second follow-up answers "No" from the Q16.20 test without naming it; add "(the projected probe is declared in the host's view)". (e) Module 13 line 711 says a missing `HostAttributeToken` is `NG0201` (read from `RuntimeErrorCode`); module 16 says the docs say it throws and "not run here": consistent, but 16 could add "`NG0201`, read in 13".

---

## Output answer cross-check

All 6 Output answers equal their assertions line for line (run; `q16-outputs.spec.ts`, each test named after its ID; each answer has its "Verified:" line):

| Q | Printed in the answer | Test result |
|---|---|---|
| Q16.05 | `alias is target: true`, `copy is target: false`, `copy is copy: true`, `constructed: 2` | equal |
| Q16.16 | `a differs from b: true`, `a again is first a: true`, `root has RouteScoped: false`, `shell/b who: shell`, `shell/a who: route-a`, `root who: root` | equal |
| Q16.17 | eleven lines, from `child plain: child` to `probe host+optional: null`, with the two `NG0201: No provider for InjectionToken lab-q16-17-who found in NodeInjector` lines | equal |
| Q16.20 | `view shared: field-providers`, `view viewOnly: field-view-providers`, `projected shared: field-providers`, `projected viewOnly: host-providers` | equal |
| Q16.28 | `before: destroyed false, log []`, `after: destroyed true, log [LateDest.ngOnDestroy, EarlyDest.ngOnDestroy]`, `get after destroy: NG0205: Injector has already been destroyed.`, `root service is still the same one: true` | equal |
| Q16.34 | `root consumer after providers: fake`, `component after providers: real`, `component after overrideProvider: real`, `component after overrideComponent: fake` | equal |

The Q16.28 order ("in the order they were created") is one data point in the spec and is explained by `_ngOnDestroyHooks` being a `Set` filled at creation (read). The planned values of M16.md (F24 Q16.17, F22 Q16.28) are not used anywhere.

---

## SYLLABUS §4 coverage (module-16 checklist, 11 rows)

| Checkbox | Where covered |
|---|---|
| Why DI: testability, configurability, IoC; plain constructor vs a container | §1, Q16.01-Q16.03, Exercise 16.6 |
| Providers, `providedIn`, tree-shaking, `'platform'`, deprecated `'any'`/module | §2, §3, Q16.04-Q16.10, Exercise 16.1 |
| `inject()` vs constructor; injection context, `runInInjectionContext`, `assertInInjectionContext` | §1, §4, Q16.02, Q16.11-Q16.14, Exercise 16.2 |
| Hierarchy and resolution algorithm | §5, Q16.15, Q16.16, Q16.18, Exercise 16.6 |
| `providers` vs `viewProviders`, per-instance state | §6, Q16.19-Q16.22, Exercise 16.3 |
| Modifiers | §5, Q16.17, Exercise 16.6 (model) |
| `InjectionToken` factories, multi, `provideEnvironmentInitializer`/`provideAppInitializer` | §7, Q16.23-Q16.26, Exercise 16.4 (T-2 on the overlap with 12) |
| `DestroyRef`, `EnvironmentInjector`, `createEnvironmentInjector`, `Injector.create` | §8, Q16.27-Q16.29, Exercise 16.5 |
| Forward references and cycles | §8, Q16.30, Q16.31, Exercise 16.5 |
| DI patterns: strategy, facade, **adapter**, config, flags, `provideX()` | §9, Q16.32-Q16.34, Exercise 16.4; **adapter missing** (T-4) |
| Coming from the backend: Spring container | §1, §3, §9 callouts, Q16.35 |

---

## Redundancy

About 380 words can go (keep each answer part at least 170 words; never cut a Summary line or an "Observed by compiling..." header). Named repeats, with approximate words:

- Q16.25 Full explanation (105) and Trap/follow-ups against Q12.17: -70; the §7 "Initializers" paragraph (112): -40; §7 second misconception and fourth best-practice bullet: -45 (T-2).
- Q16.29 Full explanation (130) repeats Q16.28, Exercise 16.5 and §8: -40.
- Q16.34 Full explanation (101) repeats §6 and §9: -35.
- Q16.18 Full explanation (109) repeats Q16.16 and §5: -35.
- Q16.31 Full explanation (103) prose repeats the §8 NG0200 paragraph: -30.
- Q16.28 first follow-up repeats Q16.29 and §8 on `Injector.create`: -25.
- Q16.11 (77) and Q16.12 (70) Full explanations repeat §4: -25 each.

Intended repeats, do not cut: the Summary (331); the `Section N:` test names in answers; the `ngc` and runtime text blocks quoted in both a section and its question (code, not counted); Exercise 16.4's alternative approach.

---

## Claims to verify

- V-1: mermaid: 9 of 9 parse under 11.17.2 and 12.1.0; none rendered in a browser.
- V-2: the tree-shaking table: re-run qualitatively on 22.2.1 (a root `@Service` and a root `@Injectable` pair, each unimported pair absent, each re-exported pair present); the module's bytes are not reproducible on another skeleton and its scratch workspace was not kept; the cause is not established there or here.
- V-3: `ngc` blocks are abridged without saying so: the code frames and `~` lines are omitted, TS2769 shows only the first overload block (my run prints three, each "of 4"); REVIEW-M14 V-2 raised the same point. Texts are specific to 22.2.1 and TypeScript 6.0.3.
- V-4: status-marker policy for a new major API: STYLE-GUIDE §3.2 suggests `[Stable since v22.0]` for a stable API that graduated in the last three majors and `[Added in vX.Y]` for a minor-release addition; the REVIEW block and module 16 use `[Added in v22.0]`, module 17 uses `[Stable since v22.0]`. Jorge to choose one guide-wide; FIX-M16-06 follows the REVIEW block.
- V-5: jsdom only; SSR, a real browser, timings and memory were not run; platform-injector scoping per request is documented-only by the module and not claimed.
- V-6: not run by the module or by me: `providedIn: 'any'` behavior, a lazy-loaded route (the lab's routes are not lazy), a missing `HostAttributeToken` without `optional`, the triggers of `NG0202` and `NG0204`.
- V-7: Spring behavior is read from 7.0.9 pages on 2026-10-08; the pages may change; no Spring code was run.
- V-8: VERSIONS.md has no row for `@Service`, `injectAsync`, `provideEnvironmentInitializer`, `provideAppInitializer` or `APP_INITIALIZER` (grep, empty); a decision for Jorge (STATE note). The module is still correct against the 22.2.1 typings.
- V-9: the `HostAttributeToken` first version is not in the CHANGELOG lines I could find; the module states none (correct).
- V-10: the full `npm test` and the other modules' labs were not run, only the module-16 include.

---

## Proposed FIX tasks

Budget rule: the module is 20,537 prose words; the ceiling is 21,980. Each FIX gets its own cumulative ceiling and none exceeds it; cuts come first. Run in order; locate every edit by grep, not line number. FIX-M16-01 to 05 edit `modules/16-dependency-injection.md` (and the files named); FIX-M16-06 edits other modules.

### FIX-M16-01 · S · Trim the named repeats and refocus Q16.25 (T-2; makes room for 02-05)
- **Files:** `modules/16-dependency-injection.md`.
- **Do:** trim the Redundancy list (about -380 words, each answer part kept at least 170 words): Q16.25 refocused on the lab facts with a link to Q12.17 for source shape, "not awaited" and the trap; the §7 "Initializers" paragraph, its second misconception and its fourth best-practice bullet cut to a sentence plus the Q12.17 link; the Full explanations of Q16.29, Q16.34, Q16.18, Q16.31, Q16.11, Q16.12 and the first follow-up of Q16.28.
- **Acceptance:** `ng test` (module include) 116 tests pass; `check-links.mjs --planned` passes; `check-snippets . 16` passes; D1 counts 36 × 5 and at least 2 follow-ups per question; no `Section N:` name cited by the module goes missing (script); prose count at most 20,200.
- **Ceiling:** 20,200 words.

### FIX-M16-02 · S · Correct the `NG2003` attribution and the NgModule marker (F-1, F-2)
- **Files:** `modules/16-dependency-injection.md`.
- **Do:** F-1 in Q16.01 follow-up 2 and Q16.02 Full explanation, plus one dated `NG2005` text line (re-run `ngc` with an undecorated class in a component's `providers`, as in this review) in the §1 block; F-2 marker and §3 diagram edge label.
- **Acceptance:** the new `NG2005` line is reproduced by `ngc` 22.2.1 on the lab's options; grep finds no "undecorated class ... fails at compile time (`NG2003`" and no "gave `NG2003` for it"; `check-snippets . 16` and `check-links` pass; mermaid parses (9/9).
- **Ceiling:** 20,260 words (adds at most +60).

### FIX-M16-03 · M · Mechanism depth in sections 4, 5, 6 and 8 (T-1)
- **Files:** `modules/16-dependency-injection.md`; `SOURCES.md` (one line under Module 16 naming the `fesm2022` files read).
- **Do:** the four "read from the 22.2.1 source" additions of T-1 (current injector, node injector and bloom filter, `canAccessViewProviders`, `R3Injector.records` and the `_ngOnDestroyHooks` Set with the Q16.28 order), each naming the file and function; no behavior claim that a test does not assert; mark them "read, not run".
- **Acceptance:** every function name cited is found by `grep` in the named 22.2.1 file; `ng test` module include passes; `check-links` passes; prose count at most 20,640.
- **Ceiling:** 20,640 words (adds at most +380).

### FIX-M16-04 · S · Terms, the adapter pattern, the marker position (T-3, T-4, T-6)
- **Files:** `modules/16-dependency-injection.md`; `_meta/GLOSSARY-TERMS.md` (Module 16 section).
- **Do:** define `ngOnDestroy`, facade, `TestBed`, signal (link to 17) and barrel at first use with the owner link; add the adapter definition to §9 and the Q16.32 follow-up; move `EnvironmentProviders` `[Added in v15.0]` to §6; add facade, barrel, adapter, `TestBed` to GLOSSARY-TERMS.
- **Acceptance:** the first body mention of each of the five terms carries a definition or link (script: first-use positions); `grep -c adapter` shows the pattern in §9 and Q16.32; `check-links` passes; D1 counts and follow-up counts unchanged (Q16.32 has 3 follow-ups); prose count at most 20,870.
- **Ceiling:** 20,870 words (adds at most +230).

### FIX-M16-05 · S · SOURCES, format and wording hygiene (T-5, T-7, T-8, T-9)
- **Files:** `modules/16-dependency-injection.md`; `SOURCES.md` (Module 16 section); `labs/angular/src/app/modules/16-dependency-injection/concepts/section-7-tokens-and-multi.spec.ts` (only if the caching test is changed to an object-valued token; otherwise reword the module).
- **Do:** the NG0201 URL line and the missing code-source lines in SOURCES; the Q16.36 label/list break and Short answer wording; the double comma in Exercise 16.1; the §9 and Q16.35 comparison wording (T-8); T-9 (a), (b), (d), (e).
- **Acceptance:** every URL in the module is in SOURCES (script returns no MISS); `awk` finds no list glued to `**Full explanation.**`; `grep -c 'default,,'` is 0; `ng test` module include passes (116, no warning) and `tsc -p tsconfig.spec.json --noEmit` exits 0; `check-links` and `check-snippets . 16` pass.
- **Ceiling:** 20,880 words (adds at most +10 net).

### FIX-M16-06 · S · Stale statements in other modules (CLOSE-M16 handoff, plus 02:1303)
- **Files:** `modules/17-signals.md`, `modules/05-js-modules-memory-modern-features.md`, `modules/04-js-async-event-loop.md`, `modules/02-js-scope-closures-this.md`.
- **Do:** 17:153 (grep ``[Stable since v22.0]``) become the form decided under V-4, plain, not backticked (default: `[Added in v22.0]` to match module 16); 05:853 (grep `unused ones drop out`) add "though one scratch build kept unused classes re-exported through an index ([16 §3](../../modules/16-dependency-injection.md#3-providedin-service-scopes-and-tree-shaking))" (+30 words, module 05 ceiling +40); 04:1148 (grep `or in an app initializer`) and 02:1303 (grep `provideAppInitializer` runs a function once) point to `12-angular-how-it-works.md#q12-17` instead of module 16.
- **Acceptance:** the four edits only (`git diff --stat` shows four modules); `check-links.mjs --planned` passes; `check-snippets` for 02, 04, 05, 17 passes; each module's prose count rises by at most 40 words (05) or 0 (the others); module 16 stays at most 20,880.
- **Ceiling:** module 05 at most +40 words; modules 04, 02, 17 at most +0 words; no change to module 16.

---

Scratch directory `/private/tmp/claude-501/-Users-jorge-quintero-IdeaProjects/1c7b2cd7-7f6f-447a-ad1b-0caf16ee6b44/scratchpad/m16/` (the `ngc` probe project and the `ws` production-build workspace, each with a symlinked `node_modules`, the mermaid 11.17.2 and 12.1.0 installs with jsdom, the fetched CHANGELOG, docs and Spring pages, the logs and helper scripts) was deleted after the last probe.
