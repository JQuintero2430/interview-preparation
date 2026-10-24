# REVIEW-X-02: cross-module consistency, chunk 2 (modules 12–21)

- **Reviewer:** a fresh reviewer subagent (claude-opus-5-5) of session S20261024-0926-claudecode. It wrote no FIX task for modules 12–21 in this session and continues no writer's conversation, so it is eligible (FINISH.md §4.1, RUN §4). It ran only read-only commands and one lab test run. Fixes, FIX-X rows and bookkeeping belong to REVIEW-X-06 and main.
- **Date:** 2026-10-24.
- **Summary:** 118 `X-02` items in REVIEW-X-SCAN.md (19 in §1, 8 in §2, 0 in §3, 76 in §4, 15 in §5). 26 are covered by 9 findings and 92 are judged acceptable (26 + 92 = 118). Two more findings come from the carry-over notes and the Summaries walk, for **11 findings: 1 Medium, 10 Low**. No duplicate question in 12–21 (scan §3 has no `X-02` item). The three named carry-over items are all retired. Q17.02 was already rewritten and the lab confirms the new text. 17's `effect` `[Stable since v20.0]` matches the typings tag `@publicApi 20.0`. The module 14 arrow-function sentence is still true: the `v22.2.1` docs page and `main` still disagree. One stale statement (12:127, "one project") is confirmed as X-02-F10. The Medium finding, X-02-F08, is that 17 and 21 call Angular's view-level updates "fine-grained reactivity" while 40 reserves the term for single-expression updates.
- **Line numbers** are as of this review. Every fix quotes its old text, and each quoted old text occurs exactly once in its file (checked with a node script that counts occurrences, run). Modules 12–21, 31 and 40 are Part D and have no prose cap.

## Runs (the reviewer, Node 24.21.0, 2026-10-24)

Verified by running:
- `awk`/`grep` over REVIEW-X-SCAN.md: `X-02` lines per section 19 / 8 / 0 / 76 / 15 = 118 (`grep -c 'X-02'` = 118).
- `npx ng test labs --watch=false --include` on three files in `labs/angular`: `21-change-detection/concepts/section-9-under-the-hood.spec.ts`, `17-signals/outputs/q17-outputs.spec.ts` and `14-directives-and-pipes/outputs/q14-outputs.spec.ts`. Result: 3 files, 39 tests passed. These include `Section 9: the development check visits an Eager root after an idle tick` (the Q17.02 carry-over), `Section 9: a view's flags make the walk find a refreshed descendant without refreshing the ancestors` (F07), Q17.02 and Q14.20 (arrow function to a pure pipe).
- `node -e` over `labs/angular/angular.json`: 8 projects (`labs`, `ssr-lab`, `security-lab`, `i18n-lab`, `animations-lab`, `material-lab`, `elements-lab`, `ui-lib`) (F10).
- A node script counted every quoted old text in its file: each occurs once.
- `curl` of the angular and angular-cli `CHANGELOG.md` on `main` into scratch. Release headings were found by line (`awk`):
  - **CLI 22.0.0:** "Webpack builders in build-angular are deprecated. Use @angular/build builders instead." CLI 21.0.0: "Applications are zoneless by default".
  - **Core 22.0.0:** "Elements with multiple matching selectors will now throw at compile time"; "Angular expressions with optional chaining returns `undefined`"; "enforce parentheses containing arguments for :host-context".
  - **Core 21.0.0:** "enable type checking of host bindings by default".
  - **Core 20.0.0:** "support type checking of host bindings"; the `Y` without `w` "suspicious date pattern" and "throw error for suspicious date patterns"; "Handle errors in async pipe subscriptions"; "mark `toObservable` as stable", "mark the toSignal API as stable"; the `TestBed.flushEffects()` breaking note.
  - **Core 20.3.1:** "only bind inputs that are part of microsyntax to a structural directive".
  - **Core 22.1.3:** "preserve literal key union in KeyValuePipe.transform()".
  - **Core 17.2.3:** "`AsyncPipe` should not call `markForCheck` on subscription".
  - **Core 19.0.0:** "no-op `allowSignalWrites`"; "mark signal-based query APIs as stable".
  - **Core 17.0.0:** "The `mutate` method was removed".
  - No 20.0.0 line names `effect`.
- WebFetch, 2026-10-24:
  - `adev/.../templates/expression-syntax.md` at tag `v22.2.1` lists "Arrow Functions `() => { }`" under unsupported declarations. On `main`, "you can pass an arrow function as an argument to a pipe".
  - angular.dev/guide/signals: signals "granularly track how and where your state is used" (F08).

Read, not run:
- **Typings and source under `labs/angular/node_modules/@angular`:**
  - **`@angular/core` 22.2.1:** `types/_debug_node-chunk.d.ts:3471,3492` `@publicApi 20.0` on `effect`; `types/core.d.ts:1835` `@deprecated from v19.0.0, use provideAppInitializer instead` (APP_INITIALIZER); `rxjs-interop.d.ts:71,95` `@publicApi 20.0` (`toObservable`, `toSignal`); `core.d.ts:494,570` `@publicApi 19.0` (signal queries); `core.d.ts:9538` `@experimental 22.0` (`debounced`); `testing.d.ts:532` `flushEffects` `@deprecated use TestBed.tick()`.
  - **`@angular/common`:** `@deprecated 20.0` on `NgIf` and `NgSwitch`; `HttpClientModule` `@deprecated` with no version. `fesm2022/_common_module-chunk.mjs:1312` `getPluralCategory`: it tries `=${value}` first, then the locale's category, then `other` (F06).
  - **`@angular/build`:** `src/builders/application/schema.json:698` `maximumWarning` (F09).
  - **Package manifests:** `@angular/material` and `@angular/aria` `package.json` peer `@angular/cdk` `22.2.1`. `router.d.ts:747` `withAutoCleanupInjectors`.
- **Guide files:** the 12–21 headers and Summaries; the passages each item points at; VERSIONS.md; SYLLABUS §1; STYLE-GUIDE §3.2, §5.1; STATE standing notes; STATE-ARCHIVE lines 47, 51, 53, 74; LOG line 589 (CLOSE-M16); REVIEW-M20 T-1; `_meta/GLOSSARY-TERMS.md`.

## Findings

#### X-02-F01 · Low · marker · 12 writes "since CLI 22.0" where the owner writes `v22.0`

- **Location:** `modules/12-angular-how-it-works.md:263` "the webpack `browser` builder of `@angular-devkit/build-angular` [Deprecated since CLI 22.0 — use @angular/build:application]"; `modules/38-architecture-and-production-structure.md:639` "`@angular-devkit/build-angular` [Deprecated since v22.0 — use `@angular/build`]" (scan §2 group `@angular-devkit/build-angular`).
- **Evidence:** STYLE-GUIDE §3.2's form is `[Deprecated since vX — use Y]`. The CLI and the framework share the major. The CLI CHANGELOG 22.0.0 says "Webpack builders in build-angular are deprecated. Use @angular/build builders instead." (curl, run), so the two modules agree on the version. Only 12's shape differs.
- **Right side:** 38's form, with 12's more precise replacement.
- **Fix text:** 12: `[Deprecated since CLI 22.0 — use @angular/build:application]` → `[Deprecated since v22.0 — use @angular/build:application]` (−1 word).

#### X-02-F02 · Low · marker · twelve `[Changed in vX]` markers in 13 and 14 say nothing about what changed

- **Location:**
  - `modules/13-components-and-templates.md`: 55, 132, 316, 1100 (three), 1122, 1266, 1895.
  - `modules/14-directives-and-pipes.md`: 632, 893, 2198.
  - The old texts are quoted in the fix.
- **Evidence:** the STYLE-GUIDE §3.2 form is `[Changed in vX: …]`, and the scan's canonical regex requires the `: …` part. Every version is right (core and CLI CHANGELOGs, run):
  - 19.0: standalone is the default.
  - 20.0: no `.component` suffix (CLI); `Y` without `w` throws; `async` errors go to `ErrorHandler`.
  - 22.0: OnPush is the default; `?.` returns `undefined`; `NG8023` throws at compile time; `:host-context` parentheses.

  13:59 already writes the full form for `NG8023`, and 13:55 does for `standalone`. The scan's §2 group `NG8023` exists only because 13:1122 is bare.
- **Right side:** the full §3.2 form. The texts below reuse each module's own wording where it already has one.
- **Fix text:** ten swaps:
  1. 13: `or a signal it reads changes) [Changed in v22.0]` → `or a signal it reads changes) [Changed in v22.0: OnPush is the default]`
  2. 13: `` `user-card.ts` is the default [Changed in v20.0] `` → `` `user-card.ts` is the default [Changed in v20.0: no `.component` suffix] ``
  3. 13: `` and now it gives `undefined` [Changed in v22.0] `` → `` and now it gives `undefined` [Changed in v22.0: `?.` gives `undefined`] ``
  4. 13: `` standalone is the default [Changed in v19.0] and OnPush is the default [Changed in v22.0]. Since CLI 20.0 the generator drops the `.component` infix [Changed in v20.0]; `` → `` standalone is the default [Changed in v19.0: `standalone` defaults to `true`] and OnPush is the default [Changed in v22.0: OnPush is the default]. Since CLI 20.0 the generator drops the `.component` infix [Changed in v20.0: no `.component` suffix]; ``
  5. 13: `` is `NG8023` since v22 [Changed in v22.0] `` → `` is `NG8023` since v22 [Changed in v22.0: "will now throw at compile time"] ``
  6. 13: `` returns `undefined`" [Changed in v22.0] `` → `` returns `undefined`" [Changed in v22.0: `?.` gives `undefined`] ``
  7. 13: `` `:host-context` requires parentheses [Changed in v22.0] `` → `` `:host-context` requires parentheses [Changed in v22.0: parentheses with arguments are enforced] ``
  8. 14: `is detected as suspicious [Changed in v20.0]` → `is detected as suspicious [Changed in v20.0: a suspicious pattern throws]`
  9. 14: `the pipe now reports them itself [Changed in v20.0]` → `` the pipe now reports them itself [Changed in v20.0: the pipe reports errors to `ErrorHandler`] ``
  10. 14: `itself, since v20.0 [Changed in v20.0]` → `` itself, since v20.0 [Changed in v20.0: the pipe reports errors to `ErrorHandler`] ``

  Word change (whitespace tokens, run): 13 +35, 14 +16.

#### X-02-F03 · Low · marker · 13 puts two statuses inside one bracket

- **Location:** `modules/13-components-and-templates.md:686` "Host expressions are type-checked [Added in v20.0 · Changed in v21.0: on by default]".
- **Evidence:** STYLE-GUIDE §3.2: "Several markers on one API are separated by `·`", and each is its own bracket (its example is `` [Stable since v20.0] · `set` option [Added in v22.1] ``). The versions are right: core 20.0.0 "support type checking of host bindings" and core 21.0.0 "enable type checking of host bindings by default" (CHANGELOG, run).
- **Right side:** two brackets.
- **Fix text:** 13: `[Added in v20.0 · Changed in v21.0: on by default]` → `[Added in v20.0] · [Changed in v21.0: on by default]` (+0 words).

#### X-02-F04 · Low · marker · markers written as code spans in 14 and 17, one of them detached from its API

- **Location:**
  - `modules/14-directives-and-pipes.md:806`.
  - `modules/17-signals.md`: 128, 278 (two), 281, 644, 645, 791, 1646, 2275.
  - The old texts are quoted in the fix.
- **Evidence:** STYLE-GUIDE §3.2: "Markers are inline text in square brackets". REVIEW-X-01 F03 fixed module 08's four code-span markers and handed the rest to their chunks (REVIEW-X-01 For Jorge 3). In 12–21 a grep for backticked markers finds only these ten (run). One more is the mention `` `[Deprecated]` `` at 13:1016, which is not a marker (Judged acceptable). Each status is right (read):
  - 14:806: core 17.2.3.
  - 17:128 `mutate`: removed in 17.0.0.
  - 17:278 `effect`: `@publicApi 20.0`.
  - 17:278 `allowSignalWrites`: no-op in 19.0.0.
  - 17:281 `flushEffects`: `@deprecated use TestBed.tick()`, with the 20.0.0 breaking note.
  - 17:644 `toSignal` and 17:645 `toObservable`: `@publicApi 20.0`.
  - 17:791: the v22 OnPush default.
  - 17:1646 signal queries: `@publicApi 19.0`.
  - 17:2275 `debounced`: `@experimental 22.0`.

  17:1646 also stands after the sentence about `afterRenderEffect`, so it reads as that API's marker. The 19.0 stable status belongs to the signal queries the answer is about (17:551 marks them the same way). 17:791 writes `v22` where the rest of the chunk writes `v22.0`.
- **Right side:** plain-text markers, attached to their API.
- **Fix text:** in each swap, the old text includes the backticks and the new text has none.
  1. 14: `` `[Changed in v17.2.3: no markForCheck on subscription]` `` → `[Changed in v17.2.3: no markForCheck on subscription]`
  2. 17: `` `effect(fn, options?)` `[Stable since v20.0]` `` → `` `effect(fn, options?)` [Stable since v20.0] ``
  3. 17: `` `allowSignalWrites` `[Deprecated since v19.0 — remove it]` `` → `` `allowSignalWrites` [Deprecated since v19.0 — remove it] ``
  4. 17: `` `[Removed in v17.0]` `` → `[Removed in v17.0]`
  5. 17: `` `[Deprecated since v20.0 — use TestBed.tick()]` `` → `[Deprecated since v20.0 — use TestBed.tick()]`
  6. 17: `` manualCleanup?, equal? })` `[Stable since v20.0]` `` → `` manualCleanup?, equal? })` [Stable since v20.0] ``
  7. 17: `` there is nothing to replay. `[Stable since v20.0]` `` → `there is nothing to replay. [Stable since v20.0]`
  8. 17: `` (`[Changed in v22: default for components without a changeDetection property]`) `` → `` ([Changed in v22.0: the default for components without a `changeDetection` property]) ``
  9. 17: `` before you touch it. `[Stable since v19.0]`. `` → `before you touch it. Signal queries are [Stable since v19.0].`
  10. 17: `` `[Experimental since v22.0]` `` → `[Experimental since v22.0]`

  Word change: 17 +4, 14 +0.

#### X-02-F05 · Low · header · 17's Leads to omits 14 and 20, which list 17 as a prerequisite

- **Location:**
  - `modules/17-signals.md:5`: "> **Leads to:** [18. Control flow and defer](../../modules/18-control-flow-and-defer.md), [19. Component communication](../../modules/19-component-communication-and-projection.md), [21. Change detection](../../modules/21-change-detection.md), …".
  - `14:4`: "[17 §2](../../modules/17-signals.md#2-writable-signals) and [§3](../../modules/17-signals.md#3-computed-signals) (signals and `computed`)".
  - `20:4`: "[17. Signals](../../modules/17-signals.md#4-effects) (`effect`, `computed`)".
- **Evidence:** scan §5 reports "14 lists 17 as prerequisite, but 17 Leads to omits 14" and the same for 20. Both prerequisites are section-level and real. 14 §7 is the choice between a pipe, a `computed` and a method. 20 §3 is "which hooks still matter with signals". A Leads to that points to a lower number already exists: 16 leads to 15, and SYLLABUS lists 16 as 15's prerequisite.
- **Right side:** 14 and 20 keep their prerequisites, and 17 adds the return links.
- **Fix text:** 17: `> **Leads to:** [18. Control flow and defer](18-control-flow-and-defer.md), [19. Component communication](19-component-communication-and-projection.md), [21. Change detection](21-change-detection.md)` → `> **Leads to:** [14. Directives and pipes](14-directives-and-pipes.md), [18. Control flow and defer](18-control-flow-and-defer.md), [19. Component communication](19-component-communication-and-projection.md), [20. Lifecycle and render hooks](20-lifecycle-and-render-hooks.md), [21. Change detection](21-change-detection.md)` (+9 words).

#### X-02-F06 · Low · contradiction (glossary) · 14 calls `=0` a plural category

- **Location:**
  - **Module 14:** `modules/14-directives-and-pipes.md:636` "`i18nPlural` picks a **plural category** (`=0`, `other`) and replaces `#`".
  - **Glossary, 14's entry:** `_meta/GLOSSARY-TERMS.md:641` "- **plural category**: the label (`=0`, `=1`, `other`) that `i18nPlural` matches against the number".
  - **Glossary, 34's entries:** `GLOSSARY-TERMS.md:1811` "the label `zero`, `one`, `two`, `few`, `many` or `other` that a language's plural rule gives a number" and `:1832` "**exact match**: an ICU plural case written `=n` that tests the value itself and wins over any plural category".
- **Evidence:** 34 (the i18n owner, citing MDN `Intl.PluralRules`) makes `=n` an exact match, not a category. 14's own Q14 answer at 14:1543 agrees with 34: "`i18nPlural` tries the exact key `=0`, then the locale's plural category, then `other`". The 22.2.1 source does exactly that (`getPluralCategory`, `_common_module-chunk.mjs:1312`, read). So 14:636 and its glossary line contradict 34 and 14:1543.
- **Right side:** 34 and 14:1543.
- **Fix text:**
  1. 14: `` `i18nPlural` picks a **plural category** (`=0`, `other`) `` → `` `i18nPlural` picks an exact key such as `=0`, else a **plural category** such as `other`, `` (+8 words; the sentence continues "and replaces `#`").
  2. GLOSSARY-TERMS: `` - **plural category**: the label (`=0`, `=1`, `other`) that `i18nPlural` matches against the number `` → `` - **plural category**: the locale's label for a number (`one`, `few`, `other`…), which `i18nPlural` tries after an exact key such as `=0` ``

#### X-02-F07 · Low · contradiction (glossary) · 20 defines change detection as checking "every template binding"

- **Location:**
  - **Module 20:** `modules/20-lifecycle-and-render-hooks.md:34` "**change detection**, the walk that checks every template binding for changes".
  - **Glossary, 20's entry:** `_meta/GLOSSARY-TERMS.md:885` "- **change detection**: the walk over the component tree that checks every template binding for changes".
  - **Glossary, 21's entry:** `GLOSSARY-TERMS.md:918` "each binding of a refreshed view is evaluated and compared with its last value".
- **Evidence:** 21 owns change detection. Its Summary says "a signal write refreshes only the view that reads it", and with OnPush as the v22 default, views that are not marked dirty are skipped. The lab shows it: `Section 9: a view's flags make the walk find a refreshed descendant without refreshing the ancestors` (run, passed) and `Section 9: tick with nothing dirty refreshes nothing in a zoneless app` (read). "Every template binding" is dirty checking as 17 §1 describes it for the pre-signal, zone-era Angular, not v22 change detection.
- **Right side:** 21.
- **Fix text:**
  1. 20: `the walk that checks every template binding for changes` → `the walk that checks the template bindings of each view it refreshes` (+3 words).
  2. GLOSSARY-TERMS: `- **change detection**: the walk over the component tree that checks every template binding for changes` → `- **change detection**: the walk over the component tree that checks the template bindings of each view it refreshes`

#### X-02-F08 · Medium · contradiction (glossary) · "fine-grained reactivity" means view-level in 17 and 21, expression-level in 40

- **Location:**
  - **Module 17:** `modules/17-signals.md:44` "It can refresh only the views that actually read the changed value. This is called *fine-grained reactivity*". Glossary `GLOSSARY-TERMS.md:279` "refreshing only the views that read the changed value".
  - **Module 21:** 21 §1's heading is "The synchronization problem: dirty checking and fine-grained reactivity".
  - **Module 40:** `modules/40-framework-comparisons.md:280` "**fine-grained reactivity** makes that unit a single DOM expression." Its table at `40:302` gives Angular's granularity as "one view (module 21)" and Solid's as "one expression". Glossary `GLOSSARY-TERMS.md:2346` "reactivity whose unit of update is a single DOM expression".
- **Evidence:** by 40's definition, Angular's view-level updates are not fine-grained. By 17's, they are the definition. A reader who learns both cannot answer "Is Angular fine-grained?" in an interview. The mechanism is not in dispute: both modules say the Angular unit is one view (40:215, 40:302; 21 §4). Angular's docs describe signals as a system that "granularly tracks how and where your state is used" (angular.dev/guide/signals, WebFetch). Angular's own sense of the term, which 17 and 21 own, is the one the guide teaches first.
- **Right side:** 17 and 21 for Angular's use. 40 keeps the point that Solid's grain is finer.
- **Fix text:**
  1. 40: `**fine-grained reactivity** makes that unit a single DOM expression.` → `**fine-grained reactivity** makes that unit small: one view in Angular ([21 §1](21-change-detection.md#1-the-synchronization-problem-dirty-checking-and-fine-grained-reactivity)), and a single DOM expression in Solid, the finest grain.` (+13 words)
  2. GLOSSARY-TERMS: `- **fine-grained reactivity**: reactivity whose unit of update is a single DOM expression` → `- **fine-grained reactivity**: reactivity whose unit of update is small: one view in Angular, a single DOM expression in Solid`

#### X-02-F09 · Low · contradiction (glossary) · 31 says a budget always fails the build

- **Location:**
  - **Module 31:** `modules/31-performance.md:495` "A **budget** is a size limit that fails the build when crossed". Glossary `_meta/GLOSSARY-TERMS.md:1620` "- **budget (build)**: a size limit that fails the build when crossed".
  - **Module 12 (owner):** `GLOSSARY-TERMS.md:483` "a size limit on part of the build output that warns or fails the build", and `12:219` lists `maximumWarning`, `maximumError`, `minimumWarning`, `minimumError`.
- **Evidence:** the `@angular/build` 22.2.1 application schema has warning thresholds (`schema.json:698` `maximumWarning`, read). The lab's own `angular.json` sets `maximumWarning: "500kB"` beside `maximumError: "1MB"` (read). A crossed warning threshold does not fail the build. 31 points to 12 as the owner of setup and thresholds in the same sentence.
- **Right side:** 12.
- **Fix text:**
  1. 31: `A **budget** is a size limit that fails the build when crossed` → `A **budget** is a size limit that warns or fails the build when crossed` (+2 words).
  2. GLOSSARY-TERMS: `- **budget (build)**: a size limit that fails the build when crossed` → `- **budget (build)**: a size limit that warns or fails the build when crossed`

#### X-02-F10 · Low · carry-over (stale) · 12 says the lab workspace has one project

- **Location:** `modules/12-angular-how-it-works.md:127` "Read the lab's workspace top-down: one project, its `build` target, the builder, base options, two configurations."
- **Evidence:** this was flagged in STATE (REVIEW-M32 For Jorge 3 and CLOSE-M32: "12:127 'one project' stale"; HOUSE-28 fixed only the test). `labs/angular/angular.json` now has 8 projects (node, run). The test that 12 cites reads only `projects['labs']`, and its comment lists the seven later projects (`section-2-workspace.test.ts:44-48`, read). The Mermaid diagram above 127 shows only `project: labs`, which is fine once the text says so.
- **Right side:** the repository as it stands.
- **Fix text:** 12: ``Read the lab's workspace top-down: one project, its `build` target`` → ``Read the lab's workspace top-down through its first project, `labs` (seven more were added for later modules), its `build` target`` (+10 words).

#### X-02-F11 · Low · contradiction (Summary) · 20's Summary says only the constructor has an injection context

- **Location:**
  - **Module 20:** `modules/20-lifecycle-and-render-hooks.md:841` (Summary) "The constructor is the only place with an injection context and sees only input defaults". 20's own glossary entry `injection context` reads "the moment `inject()` is allowed: construction, a field initializer or `runInInjectionContext`".
  - **Module 16 (owner):** 16's Summary: "`inject()` works where an injection context exists: a constructor, a field initializer, a provider factory or `runInInjectionContext`."
- **Evidence:** 16 owns the injection context (SYLLABUS §4). Field initializers are the common `inject()` site and are tested in 16 (`Section 1: a field inject() and a constructor parameter resolve one instance`, read). The point of 20's sentence is the comparison with `ngOnInit`, which "construction" keeps.
- **Right side:** 16.
- **Fix text:** 20: `The constructor is the only place with an injection context and sees only input defaults` → `Construction (the constructor and field initializers) is the only phase with an injection context and sees only input defaults` (+4 words).

## Carry-over notes (STATE standing notes, STATE-ARCHIVE) about 12–21

- **Q17.02 "an Eager tick would refresh the field"** (STATE "Stale statements", ARCHIVE 74): retired. The parenthetical is gone (`grep 'Eager tick would'` finds nothing, run). Q17.02 now reads "With `Eager`, an idle tick refreshes nothing either; the development check then throws `NG0100`, see Q21.23". The test `Section 9: the development check visits an Eager root after an idle tick` asserts exactly that: no throw for an OnPush root, and `NG0100 … Previous value: 'a'` for an Eager root after a field write and `tick()`. It passed in this review's run.
- **17's `effect` `[Stable since v20.0]` (FIX candidate for 17, STATE):** retired as a status question. The 22.2.1 typings tag both `effect` declarations `@publicApi 20.0` (`_debug_node-chunk.d.ts:3471, 3492`, read), and FINISH §4.3 accepts the typings tag as the basis. The CHANGELOG 20.0.0 indeed has no `effect` line (curl, run), so the typings are the only primary source. The marker is in a code span, which F04 fixes.
- **Module 14, arrow functions as pipe arguments (re-check at finish line):** re-checked, and the statement holds. The `v22.2.1` tag page still lists "Arrow Functions `() => { }`" as unsupported, and `main` says "you can pass an arrow function as an argument to a pipe" (WebFetch, 2026-10-24). 14:502 says exactly this. Q14.20's behavior passed in the run. The disagreement is upstream (J9). One nuance for Jorge: `main` now calls the unsupported row "Arrow functions with block bodies", so the tag's row may only have meant block bodies.
- **17:153 `@Service` marker (STATE "Stale statements", ARCHIVE 53, LOG 589):** retired. 17:153 now reads `` `@Service()` [Added in v22.0] ``, the same as 16:54 and 16:271 (grep, run).
- **12:127 "one project" stale (STATE, REVIEW-M32 For Jorge 3):** confirmed, **X-02-F10**.
- **20:431 goes stale after 32 (STATE, PLAN-M32 4):** retired. 20:431 now cites 32 §7's observation (grep, run).
- **20 C4/B9, `DestroyRef` marker and `checkNoChanges` placement (STATE "Stale statements"; REVIEW-M20 T-1):** retired. 20:60 now carries `[Changed in v22.0: the default]`, and 20:298, the first body mention, carries `DestroyRef.onDestroy` `[Added in v16.0]` (grep, run). The `checkNoChanges` order was "note only" in REVIEW-M20.
- **REVIEW-M14 "re-check B5" (ARCHIVE 51):** retired. It was an instruction to REVIEW-M14, which is closed.
- **Not FIX-keyword items, still with Jorge (J9):**
  - Q17.39's file-level link to module 10 and the other anchor candidates into 12–21.
  - VERSIONS rows for 12–21.
  - Trims FIX-M13-03, FIX-M18-01, FIX-M20-01 and FIX-M21-01.
  - The upstream-docs mismatches for 12, 13, 15, 16 and 18.
  - 21 C10 (a "25 §7 observes" clause).
  - SYLLABUS `::ng-deep` and "`ngZone` profiling".

## Judged acceptable

Scan items, 92 in all:

- **§1 markers, 3 of 19:**
  - `13:1016` `[Deprecated]` is a mention inside a code span ("no `[Deprecated]` marker is written"), not a marker. It is a scanner artifact.
  - `14:157` `[Changed in v20.3.1: "only bind inputs that are part of microsyntax to a structural directive"]` and `14:634` `[Changed in v22.1.3: "preserve literal key union in KeyValuePipe.transform()"]`: both versions and quotes match the core CHANGELOG (run). They are patch releases, so the canonical `vX.Y` form would misdate them (20.3.0 and 22.1.0 do not have the change). Keep them if Jorge extends J4 to `vX.Y.Z` (For Jorge 1).
  - The other 16 §1 items are in F01 (12:263), F02 (twelve bare `[Changed in vX]`), F03 (13:686) and F04 (14:806; 17:278 `allowSignalWrites`, whose "— remove it" is kept, For Jorge 2).
- **§2 groups, 6 of 8:** in each group below, every marker agrees on the version, and the groups differ only in `v19`/`v19.0` and in backticks around the replacement, both of which the canonical regex accepts.
  - `APP_INITIALIZER`: 12:532, 16:740 and 39:482 all say v19, with the typings `@deprecated from v19.0.0` at `core.d.ts:1835` (read).
  - `changeDetection`: every marker says v22.0 for the OnPush default. 13:1100's `[Changed in v19.0]` is the standalone marker, attributed by the scanner to the wrong API (F02 adds its text).
  - `.component`: 13:1100 and 39:483 both say v20.0.
  - `NgSwitch`: 14:2174 and 18:79 both say v20.0, with `@deprecated 20.0` in the typings (read).
  - `HttpClientModule`: 15:295/1168 and 39:481 both say v18. The typings have no version, so it rests on the CHANGELOG, as in 27.
  - `*ngIf`: 15:486, 18:34 and 39:520 all say v20.0.
  - The groups `@angular-devkit/build-angular` and `NG8023` are covered by F01 and F02.
- **§4 glossary, 72 of 76.** F06–F09 cover `plural category`, `change detection`, `fine-grained reactivity` and `budget (build)`.
  - **Homonyms, each true in its own field:**
    - `pipe` (14 Angular / 22 RxJS); `producer / consumer` (17 / 22).
    - `selector` (13 CSS / 28 store); `locator` (19 query / 36 harness); `target` (12 workspace / 34 XLIFF).
    - `signal` (17, 39, 40 / 44 kernel / 45 telemetry); `resource` (17 / 45 REST); `template` (13 / 40 compiled language).
    - `singleton` (16 DI / 38 federation shared dependency); `view` (12, 13, 20 / 16's view versus content).
    - `hybrid app` (15 NgModule plus standalone / 21 zone plus scheduler, Angular's own "hybrid" scheduling term). Two senses inside Angular: For Jorge 4.
  - **Compatible restatements:** `adapter`, `applicationref`, `async pipe`, `barrel`, `brotli`, `bubbling`, `builder`, `cldr`, `codemod`, `dependency injection (di)`, `derived state`, `development mode`, `dirty checking`, `dynamic component`, `effect`, `embedded view`, `emulated encapsulation`, `environment injector`, `errorhandler`, `facade`, `feature flag`, `field initializer`, `framework`, `host binding`, `host element`, `hostattributetoken`, `hydration`, `initializer`, `injection context`, `injection token`, `instruction`, `inversion of control`, `lifecycle hook`, `live consumer`, `locale`, `locale_id`, `migration (ng update)`, `minification`, `ngservermode`, `output`, `partial compilation`, `provide* function`, `renderer2`, `schematic`, `setinput`, `standalone component`, `subscription`, `templateref`, `testbed`, `tree-shaking`, `two-way binding`, `viewcontainerref`, `zone.js`.
  - **Checked against a source:**
    - `ivy`: 39's "only engine from v15" matches 39:443's quote of the 15.0.0 entry.
    - `zoneless`: 17's "default for new projects since v21" matches CLI 21.0.0 "Applications are zoneless by default" (run).
    - `onpush`: six restatements of the v22 default and its triggers. 38 and 39 omit some triggers but contradict none.
    - `peer dependency`: 36's "Material and Aria name the CDK at an exact version" matches both manifests, `"@angular/cdk": "22.2.1"` (read).
    - `route injector`: 16's "a revisit reuses it" and 24's "unless auto cleanup destroys it" agree, since auto cleanup is the opt-in `withAutoCleanupInjectors` (`router.d.ts:747`, read).
    - `tick`: 29's `TestBed.tick()` exists (`testing.d.ts:540`, read).
    - `standalone component`: 15's "default since v19.0" matches the core 19.0.0 CHANGELOG.
    - `pendingtasks`: 18 and 21 agree.
    - `teardown`: 20, 22 and 23 agree on the core meaning. 23's ordering clause about `switchMap`/`mergeMap` was not run here; it belongs to 23 (X-03).
- **§5, 11 of 15:**
  - "13 Prerequisites extra against SYLLABUS: 08, 10": both are section-level links to earlier modules (Shadow DOM; the cascade and custom properties) that 13 §8–§9 use, and 08 and 10 have the return edge (no scan line says otherwise).
  - **Applies to lines of 12–21:** all ten match VERSIONS.md: Angular packages 22.2.1, TypeScript 6.0 (6.0.3), RxJS 7.8 (7.8.2), zone.js 0.16.3 (optional), and Node 24 (within `^24.15.0`). 17 omits Node, which is harmless.
  - The other four §5 lines are F05.

Not scan items, checked and acceptable:
- **Summaries of 12–21 against the owners (read):** besides F11, no Summary contradicts an owner:
  - 12 "AOT, the default since Angular 9" (39 §5).
  - 13's `typeof` 19.0 (core 19.0.0 "add support for the `typeof` keyword", run).
  - 14 "`*ngIf`, `*ngFor` and `*ngSwitch` are, since v20.0" (typings).
  - 15 "standalone is the default since v19.0".
  - 16's route `providers` (24).
  - 17 "zoneless … OnPush by default" (21).
  - 18's `NgIf`, `NgForOf`, `NgSwitch` deprecated v20.0 (14).
  - 20's `Eager`/OnPush `NG0100` contrast (21 §9 test, run).
  - 21 "a signal write refreshes only the view that reads it" (17 §9).

## For Jorge

1. **J4 scope, patch versions.** 14 has three patch-level markers (`v20.3.1`, `v22.1.3`, `v17.2.3`). The canonical `vX.Y` form would misdate them. If J4 makes variants canonical, extend the regex to `v\d+(\.\d+){0,2}`; otherwise they need a ruling.
2. **Deprecations without a replacement.** `allowSignalWrites` `[Deprecated since v19.0 — remove it]` (17:278) has no API to "use". STYLE-GUIDE §3.2 has no form for this case. Keep "— remove it" as an accepted variant, or amend §3.2.
3. **Markers that disagree only in shape.** The same deprecation is written `v19` in 12:532 and 39:482 but `v19.0` in 16:740, and the replacement has backticks in 39 only (also `HttpClientModule` v18 vs v18.0). The regex accepts both. REVIEW-X-06 may want one rule for the whole guide.
4. **Glossary homonym inside Angular.** `hybrid app` means NgModule plus standalone in 15 and zone plus zoneless scheduler in 21. Both are right, but J2's single-entry glossary should keep both senses, labeled.
5. **Docs nuance for the arrow-function note (J9 upstream report).** `main` now limits the unsupported row to "Arrow functions with block bodies". The `v22.2.1` row's example `() => { }` is also a block body, so the tag page may never have meant expression arrows. 14:502's wording ("lists arrow functions as unsupported") is literally true. A softer version is optional.
6. **GLOSSARY-TERMS edits.** F06–F09 also prescribe edits to `_meta/GLOSSARY-TERMS.md`, so the generated GLOSSARY.md does not reintroduce the old definitions. If the harvest is regenerated from the modules instead, only the module edits are needed.
