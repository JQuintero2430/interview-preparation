# REVIEW-M40: `modules/40-framework-comparisons.md`

- **Reviewer:** a fresh reviewer subagent (claude-opus-5-5) of session S20261020-1038-claudecode. It wrote nothing in module 40, continues none of the PLAN, SEC, EX, QB or CLOSE-M40 conversations, and so is eligible (RUN.md §4). It ran only the module-scoped tests and the read-only scripts named below; job-state updates and every fix belong to the main session.
- **Date:** 2026-10-20.
- **Files read:**
  - the whole module (1,371 lines; line numbers below are as of this review and will move at FIX time);
  - `_meta/modules/M40.md` (F1-F19, C1-C15, Lab decision, Handoffs into 40, owner map, anchor candidates, breadth gate, For Jorge 1-4), QUALITY-BAR, STYLE-GUIDE §2, §3, §6, RUN.md §5-§7, §10, the module-40 common rules and REVIEW-M40 in TASKS.md, REVIEW-M39 and its FIX tasks (the format model), the QB-M40-03 and CLOSE-M40 LOG lines, `SOURCES.md` `## Module 40` (83 lines), SYLLABUS §4 (40);
  - every module-40 lab file: `concepts/` (`mini-rerender.ts`, `mini-fine-grained.ts`, three tests), `exercise-1-vdom/` (`vdom.ts`, `renderer.ts`, `a/runtime.ts`, `b/runtime.ts`, test), `exercise-2-decision/` (`decision.ts`, `a/decide.ts`, `b/decide.ts`, `fixtures/example-team.ts`, test) and `src/outputs/40-framework-comparisons/q40-04.test.ts`.
- **Sources re-read (2026-10-20):**
  - packed into `/Users/jorge.quintero/.claude/jobs/4a727236/tmp/review40` (`npm pack`, read, deleted): `react@19.3.1` (`package.json`, `cjs/react.development.js` `createContext`, `cjs/react-jsx-runtime.development.js` exports, `cjs/react-compiler-runtime.development.js` `useMemoCache`); `react-dom@19.3.1` (`cjs/react-dom-client.development.js`: `beginWork` 12093, `dispatchSetStateInternal` 9523-9542, `placeChild` 6563-6577, `updateSlot` 6771, duplicate-key warning 6968, `pushProvider` 5760, `propagateParentContextChanges` 5879-5919, `readContextForConsumer` 5962, `processRootScheduleInMicrotask` and `scheduleTaskForRootDuringMicrotask` 20533-20640, `scheduleImmediateRootScheduleTask` 20687, `commitTextUpdate` 23948, `flushSyncWork$1` 18437, dispatcher `f` 30652; `cjs/react-dom.development.js` exports and `flushSync` 141-155); `babel-plugin-react-compiler@1.0.0` (`dist/index.js` `OPT_OUT_DIRECTIVES`, `codegenReactiveScope`, `"_c"`, `react/compiler-runtime`); `@vue/shared@3.5.44` `PatchFlagNames`; `@vue/compiler-core@3.5.44` `walk` 3096-3190; `@vue/runtime-core@3.5.44` `patchElement` 5900-5980, `processText`, `provide` 808, `inject` 823, `setupRenderEffect`; `@vue/reactivity@3.5.44` `refreshComputed`, `hasChanged` use, `toReactive` export; `vue@3.5.44` and `vue-router@5.4.0` and `react-router@8.5.0` `package.json`; `svelte@5.57.2` `package.json` exports, `src/internal/client/reactivity/equality.js`; `solid-js@1.9.17` `dist/solid.js` (`createComponent`, `equalFn`, `writeSignal`, exports) and `web/dist/web.js` (`insert`, `insertExpression`); `@preact/signals-core@1.14.4` `dist/signals-core.js` setter; `@vue/test-utils@2.5.1` `dist/vue-test-utils.cjs.js` (`app.provide`);
  - read-only in `labs/angular/node_modules`: `@angular/router` 22.2.1 `package.json` peers;
  - raw GitHub (`main`), read 2026-10-20: `vuejs/docs` `src/guide/introduction.md`, `extras/reactivity-in-depth.md`, `extras/rendering-mechanism.md`, `essentials/reactivity-fundamentals.md`; `reactjs/react.dev` `learn/creating-a-react-app.md`, `learn/react-compiler/introduction.md`, `reference/react/{useSyncExternalStore,memo,Component,ViewTransition}.md`, `blog/2025/10/07/react-compiler-1.md`; `angular/angular` `adev/src/content/introduction/what-is-angular.md`; `sveltejs/svelte` `documentation/docs/02-runes/{01-what-are-runes,02-$state}.md`, `03-template-syntax/14-transition.md`; `npm/registry` `docs/download-counts.md`; `QwikDev/qwik` `concepts/resumable/index.mdx`; the npm blog download-counts post; Spring Boot reference `using/build-systems.html`;
  - registry: `npm view` `react`, `vue`, `svelte`, `@angular/core` `time`; `react`, `solid-js`, `svelte`, `preact` `description`; `next` `description peerDependencies.react`; `vue-router` `version`; `@qwik.dev/core` `dist-tags.latest`; `@builder.io/qwik` `version`; `api.npmjs.org/downloads/point/2026-10-12:2026-10-18/<pkg>` for `react`, `vue`, `@angular/core`, `@builder.io/qwik` (all equal the module's table).
- **Basis of each finding:** a package source, a committed test, a dated docs or registry read, or a read-only script. **Not re-read** (their basis is the SEC/EX/QB LOG lines and SOURCES.md): the Solid docs `signals.mdx`, the Vue SFC, routing, state-management, testing and tooling pages, `createContext.md`, `useContext.md`, `render-and-commit.md`, `writing-markup-with-jsx.md`, Vue's `releases.md` and `v2.vuejs.org/eol/`, the TC39 README, the 16.8.0 changelog entry, Spring Boot `index.html`. The mermaid diagrams were not re-parsed and `check-snippets.mjs` and `tsc` were not re-run (CLOSE-M40's main-session runs).
- **Probe files:** none in the repository. Tarballs, extracted packages and fetched docs lived in the job tmp dir above and were deleted. The reviewer created only this file and edited `_meta/TASKS.md`.

Overall, an accurate and balanced module with no Major finding: all 14 cited test titles exist verbatim (11 of them module-40 tests, plus 21's, 16's and 29's); Q40.04's short answer equals its assertion; every other-framework claim sampled traces to the named tarball, function, docs page or registry read; our three models mirror the read rules (details under Module-specific checks) and every lab sentence says "our model"; no test touches the network, clock, `git`, `npm` or another lab's `node_modules`; no benchmark, survey, popularity or market claim appears beyond the dated, caveated download table; Angular's costs are stated next to its strengths in §8, Q40.12-Q40.14. Findings:
- **no Major;**
- four Minor factual findings: §2's static-hoisting sentence conflates caching and hoisting in Vue 3.5 (F-1), §8 credits "a library whose peer range lags" to Q12.02, which says no such thing (F-2), Q40.16's "Only Solid" writes synchronously ignores `react-dom`'s `flushSync` (F-3), and §4 describes Svelte 5 from Vue's docs when Svelte's own `$state` page states the mechanism (F-4, C7);
- two Minor teaching findings: six terms used before definition (T-1), internal names unmarked in §4 and public ones marked internal in §9 (T-2);
- nine nits and the anchor handoffs (13 rows).

**Plan facts found wrong or superseded** (the module already gets each right or does not use it): F10/M40.md §2 "static hoisting": in 3.5 a fully constant element is cached, not hoisted (F-1 corrects the module's own sentence); F18's `vue-router` peers also include `@pinia/colada` (the module lists it); anchor candidate 21:120 → §9 rather than §3 (For Jorge 1).

**Prose:** 13,326 words now (`node labs/tools/module-stats.mjs`; the QUALITY-BAR python counter agrees). The fixes add about +170, for about 13,500: under the CLOSE limit of 13,585 and the REVIEW ceiling of 14,085.

## Runs (this reviewer, Node 24.21.0, 2026-10-20)

- `npx vitest run src/modules/40-framework-comparisons src/outputs/40-framework-comparisons` (from `labs/ts-js`): 6 files, 35/35 passed.
- `node labs/tools/check-links.mjs --planned`: "All links resolve" (222 planned).
- `node labs/tools/module-stats.mjs` (it takes `[--strict] [guideRoot]`, not a module number; `module-stats.mjs 40` fails looking for `40/SYLLABUS.md`): `40-framework-comparisons` 16 Q, 2 Ex, 13,326 words, Concept 5, Difference 5, Trade-off 2, Design 2, Output 1, Bug hunt 1, no flag.

No re-run is requested by this review: every finding is a text change (no lab file changes).

## Reviewer's read-only script results

- **Markup:** B1: 9 of each of the six subsections; 9 `mermaid` fences and 9 "What to notice" lines; D1: 16 of each answer part; 28 `<details>`; every best-practice bullet has "because" and every misconception has "Cause:" (awk); `Unverified`, `relink:`, `TASK`, `PLACEHOLDER` 0; no URL in the module.
- **Links:** every Q40 ID linked from the body (1-2 each); Exercise 40.1 from §3, Exercise 40.2 from §8.
- **Tests:** 14 distinct cited titles, 0 missing; Exercise 40.1 and 40.2 criteria equal their `it(…)` titles (6 + 6, `describe.each` over both variants).
- **Determinism (C12):** no `Date`, `fetch`, `child_process`, `performance.now`, timers, `process.env`, `node_modules` path, framework import, `any` or `as` cast in any module-40 lab file.
- **Status markers:** 2, both Angular and both quoted from owners (Signal Forms [Stable since v22.0] = 26:38; `animate.enter` [Stable since v20.2] = 35:49); none on other frameworks (C10).

## QUALITY-BAR

45 items: **42 Pass, 3 Partial (B9, C1, C7), 0 Fail.** H3 rests on the main session.

| ID | Result | Evidence |
|---|---|---|
| A1 | Pass | Lines 3-9 in order; Applies to's registry date covers only 2026-10-19 reads (N-5). |
| A2 | Pass | 17 §9, 21 §1, 12 §1 anchored. |
| A3 | Pass | §1, §3, §4, §8; six questions; Summary. |
| A4 | Pass | 9 sections and the five closing parts. |
| A5 | Pass | positions → formats → React → signals → DI → stack → ecosystem → choice → trace. |
| B1 | Pass | 9 × 6 (script). |
| B2 | Pass | Concrete failures (memo defeated by `style={{…}}`, context literal, peer gate, "most popular"). |
| B3 | Pass | 9 diagrams, each with "What to notice" (not re-parsed). |
| B4 | Pass | Each section answers a "why" from a named function or page. |
| B5 | Pass | Every `### Code` has an Approach line and numbered steps. |
| B6 | Pass | "because" on every item (script). |
| B7 | Pass | Every trap has correction and cause (script and read). |
| B8 | Pass | Framework vs platform (§4, signals vs TC39); Coming from the backend (§8) with "Where the analogy breaks". |
| B9 | Partial | virtual DOM, static hoisting, peer, SemVer range, fiber, lanes before definition; internal-name marking (T-1, T-2). |
| B10 | Pass | 03, 12, 16, 17, 21, 24-29, 32, 35, 37, 38, 39 get a sentence and a link. |
| C1 | Partial | 32 of 36 sampled claims match; F-1 to F-4. |
| C2 | Pass | Q40.04 lines = `q40-04.test.ts` assertion. |
| C3 | Pass | Every "In the lab" sentence names a test asserting it. |
| C4 | Pass | Two Angular markers, owners' forms; no other Angular API needs one. |
| C5 | Pass | Angular names exist in 22.2.1 or are owners' internals. |
| C6 | Pass | 0 `Unverified`. |
| C7 | Partial | §7 step 2 JSX fence lacks its Partial line (N-3); Excerpts compared with the lab files: verbatim. |
| C8 | Pass | Every package, docs and registry source has a line under `## Module 40`. |
| D1 | Pass | 16 × 5; ≥ 2 answered follow-ups everywhere. |
| D2 | Pass | Q40.04 gives lines and reason, same words as the full explanation. |
| D3 | Pass | 6 tags, max 31%. |
| D4 | Pass | Q40.01-16 follow the sections. |
| D5 | Pass | Q12.01, Q12.02, Q12.27, Q03.14, Q16.35, Q17.38, Q21.01, Q21.34 linked, none re-asked. |
| D6 | Pass | Every question and both exercises linked from the body. |
| D7 | Pass | 16 anchors. |
| D8 | Pass | 16 / 2 = ceiling. |
| E1 | Pass | Full anatomy in both; two answered follow-ups each. |
| E2 | Pass | 12/12 criteria = titles; accounts match the assertions (72/66/62, 21/20/19, flips at 57 and 21, moves 4 and 1, `[5, 1, 2, 3, 4]`). |
| E3 | Pass | Runtime with two algorithms → decision tool over §1-§7. |
| E4 | Pass | Reviewer's run 35/35; no `any`. |
| E5 | Pass | Q40.04. |
| F1 | Pass | Three paragraphs, all nine sections, no new fact. |
| F2 | Pass | Four prompts naming listeners. |
| F3 | Pass | Six flashcards. |
| F4 | Pass | Builds on, Read next, Uses later, Comparisons. |
| G1 | Pass | 13,326 ≤ 13,585; about 13,500 after fixes ≤ 14,085. |
| G2 | Pass | 4/4 SYLLABUS §4 (40) checkboxes. |
| H1 | Pass | Reviewer's module run; `tsc` by main (CLOSE). |
| H2 | Pass | `check-links --planned` 0. |
| H3 | Pass (main) | Main checks `git status`. |

## Module-specific checks

| Check | Result | Evidence |
|---|---|---|
| Other-framework claims traced; ≥ 10 re-read | Pass, four findings | 36 re-read (table below); F-1, F-3, F-4 mismatch the source, F-2 misattributes. |
| Our models vs F6, F10, F12; named as ours (C8) | Pass | `mini-rerender.ts`: eager bailout gated on no pending update (`!inst.scheduled` for `0 === fiber.lanes`), `shallowEqual` (count, own key, `Object.is`), props-identity check, context checked below a bailed-out parent; `mini-fine-grained.ts`: `===`, synchronous observers, untracked component, function child → render effect; Exercise 40.1 a = `placeChild` (`oldIndex < lastPlacedIndex` → move, quoted 19.3.1 line verbatim), b = prefix/suffix, `newIndexToOldIndex` (+1), `moved`/`maxNewIndexSoFar`, backwards walk over `getSequence`. Every header and every lab sentence says "our". |
| Q40.04 against a re-run | Pass | `Parent`, `Plain`, `MemoBox`, `Reader` asserted and passing. |
| No benchmark, survey, popularity, market claim (C6) | Pass | Only the dated download table with the npm blog's caveats; "faster" appears only as "no benchmark was read". |
| Philosophy and motive from own text (C7) | Pass, one finding | Descriptions from `npm view` and each project's docs; F-4 uses Vue's docs for Svelte. |
| Balance in §8, Q40.12-Q40.14 | Pass | Costs (learning, one calendar, exact peers, lagging libraries, migration review) and "when another wins" stated; recommendations labeled "our judgement". |
| No Angular-style marker on another framework (C10) | Pass | React Compiler "first stable release", ViewTransition's docs status in plain words. |
| No network, clock or install in tests (C12) | Pass | Script above. |
| Handoffs honored; Q12.02, Q12.27, Q03.14, Q17.38, Q21.01, Q21.34 not re-asked | Pass | 03 → §4, 12 → §1/§2/§3/§8, 17 → §4/§9, 21 → §3/§9, 35 → §6, 39 → §7/§8, M16/M21/M22 pointers in §4/§5; Handoffs table below. |
| Prose ≤ 14,085 after fixes | Pass | About 13,500. |

## Handoffs

Module 40 slugs:
- S1 `#1-library-framework-progressive-framework-what-each-project-decides-for-you`
- S3 `#3-reacts-model-re-rendering-reconciliation-memoization-and-the-react-compiler`
- S4 `#4-signals-beyond-angular-vue-refs-solid-svelte-runes-preact-and-qwik`
- S6 `#6-routing-forms-data-fetching-tooling-and-testing-first-party-or-ecosystem`
- S7 `#7-ecosystem-size-release-policies-and-breaking-changes`
- S8 `#8-choosing-a-framework-balanced-trade-offs-and-how-to-answer-why-angular`
- S9 `#9-under-the-hood-one-state-change-traced-through-angular-react-vue-and-solid`

Re-located 2026-10-20: every candidate is still at the line PLAN-M40 recorded.

| Target | Links (module:line, context), 13 rows, +0 words |
|---|---|
| S1 | 12:88 ("*Angular is a library like React.*" misconception, "([module 40]") |
| S3 | 12:701 ("**Versus a virtual DOM:** [module 40]"), 12:1463 (Q12.27, "Comparing frameworks is [module 40]"), 12:1792 ("It builds and diffs a new tree per update") |
| S4 | 03:1700 (Comparisons, "puts Vue's Proxy-based reactivity next to Angular's signals"), 17:1829 (Q17.38 follow-up, "Svelte 5 runes and Qwik, each with its own implementation") |
| S6 | 12:1862 (Comparisons, "puts instruction-based rendering next to virtual-DOM libraries, and Angular's integrated toolchain…"), 35:1991 ("(other frameworks' motion)") |
| S7 | 39:1947 (Read next, "(how other frameworks handled breaking changes)") |
| S8 | 12:851 (Q12.02, "Comparing frameworks is [module 40]"), 39:1948 (Uses these ideas later, "(migration cost)") |
| S9 | 17:2433 (Comparisons, "puts Angular signals next to React's rendering model"), 21:120 ("*It is the same as React's virtual DOM diff.*", "both compare, then update"; plan said §3, For Jorge 1) |

Each link keeps its text; only the target gains the slug. Stay file-level: 35:5, 39:5 (header Leads to) and 21:2711 (a list of module numbers). No module after 40 links into it yet.

## Factual findings

**F-1 · Minor (C1) · §2 static hoisting (129).** `@vue/compiler-core` 3.5.44 `walk` (3096-3190): a fully constant element (`constantType >= 2`) gets `patchFlag = -1` and goes to `toCache`, then `context.cache(child.codegenNode)`; `context.hoist(props)` is applied only to an element that is *not* fully constant and whose flag is none, `NEED_PATCH` or `TEXT`. The module hoists "its constant props" from the fully constant element.
- Fix: "Static hoisting is in the compiler: the internal `walk` in `compiler-core` sets a fully constant element's `patchFlag` to -1 and hoists its constant props through `context.hoist`." → "**Static hoisting** builds constant parts once instead of on every render. In 3.5 the internal `walk` in `compiler-core` marks a fully constant element `CACHED` (`patchFlag` -1) and caches its vnode (`context.cache`); an element whose only dynamic part is its text keeps its constant props hoisted (`context.hoist`)." (+20; also defines the term, T-1)
- SOURCES.md 2613: replace "a constant element gets `patchFlag = -1`, constant props go through `context.hoist`" with "a fully constant element gets `patchFlag = -1` and is cached through `context.cache`; the constant props of an element flagged at most `TEXT` or `NEED_PATCH` go through `context.hoist`", re-dated "read 2026-10-19, re-read 2026-10-20".

**F-2 · Minor (C1, attribution) · §8 costs (635).** "a library whose Angular peer range lags holds an upgrade back (Q12.02)": Q12.02 (12:851) speaks of assembled stacks ("when the router's next major needs a newer view library"), not of Angular libraries; the owner is 39 §8 ("Libraries that block a hop", peer ranges, 39:632-638).
- Fix: "(Q12.02)" → "([39 §8](../../modules/39-version-history-and-migrations.md#8-skipping-versions-safely-one-major-per-hop-node-and-typescript-ranges-and-libraries-that-block-a-hop))" (+1).

**F-3 · Minor (C1) · Q40.16 follow-up (1144).** "*Who writes synchronously?* Only Solid, in the read source." `react-dom` 19.3.1 exports `flushSync` (`react-dom.development.js` 141), which raises the update priority to sync and then calls the dispatcher's `f`, `flushSyncWork$1` → `flushSyncWorkAcrossRoots_impl` (`react-dom-client.development.js` 18437, 30652); otherwise the root schedule runs in a microtask and non-sync lanes go to `scheduler` (20533-20640, as the §9 table says).
- Fix: "Only Solid, in the read source." → "Solid always, in the writing call; React only inside `flushSync`, which `react-dom` 19.3.1 exports; otherwise it renders from the root-schedule microtask or a `scheduler` task (read, not run)." (+28)
- SOURCES.md: `react-dom@19.3.1`, `cjs/react-dom.development.js` `flushSync` and `cjs/react-dom-client.development.js` `flushSyncWork$1`, read 2026-10-20, Q40.16.

**F-4 · Minor (C7) · §4 Svelte misconception (355).** "Svelte implements \"reactivity during compilation\" (Vue's docs)" describes Svelte from another project's page (written about pre-runes Svelte). Svelte's own `02-$state.md` (read 2026-10-20): "every reference to `count` is transformed by the Svelte compiler", with the compiler output shown as `$.get`/`$.set` signal calls.
- Fix: "and Svelte implements \"reactivity during compilation\" (Vue's docs); nothing is called per render." → "and \"every reference to `count` is transformed by the Svelte compiler\" into signal `get` and `set` calls (`$state` docs); nothing is called per render." (+4)
- SOURCES.md 2632: append the quote "every reference to `count` is transformed by the Svelte compiler", read 2026-10-20.

## Teaching findings

**T-1 · Minor (B9) · terms used before they are defined.**
- §2 Mental model (107), after "A **render function** is a function that returns a description of the UI.": add "A **virtual DOM** is that description kept as a tree of plain objects, which the runtime diffs against the previous tree to find the DOM writes." (+26; Exercise 40.1 keeps its own sentence). Static hoisting: F-1.
- §1 (62): "needs `react` `>=19.2.7` as a peer." → "needs `react` `>=19.2.7` as a peer (a package the app installs once and shares, §6)." (+11)
- §3 practice (261): "over \"a SemVer range\"" → "over \"a SemVer range\" (such as `^1.0.0`, which accepts later compatible releases)" (+8; the 1.0 post's own example).
- Q40.07 follow-up (973): "Only when the fiber has no pending update." → "Only when the component's fiber, React's internal record of that instance, has no pending update." (+8)
- §9 table (766): "sync lanes flush there" → "sync lanes (React's internal priority bits for urgent updates) flush there" (+8).

**T-2 · Minor (M40.md C11) · internal names.**
- §4 table (299): "(`RefImpl`)" → "(`RefImpl`, internal)" (+1).
- §4 (307): "in `new ReactiveEffect(componentUpdateFn)`" → "in `new ReactiveEffect(componentUpdateFn)` (`componentUpdateFn` internal)" (+2).
- §9 (761): "Every function named below is internal." → "Every function named below is internal except Solid's public `insert` and `createRenderEffect`." (+7; both are exported by `solid-js/web` and `solid-js` 1.9.17.)

**Nits**
- **N-1:** the nine "Drilled in …" lines (97, 172, 270, 357, 445, 514, 599, 717, 802) end without a period; module 39 ends them with one. Add "." to each.
- **N-2:** §5 (367) "through a provider (the recipe))," → "through a provider (the recipe),".
- **N-3 (C7):** §7 Code step 2 (578): the second ```` ```jsx ```` fence starts at `function Counter() {`; add the first line `// Partial: React 19.3.1 component (not run in the labs)` (code, 0 prose).
- **N-4 (C3):** verification paragraph (28): "Angular's side links its owners' committed tests ([17](../../modules/17-signals.md), [21](../../modules/21-change-detection.md), [12](../../modules/12-angular-how-it-works.md))" → "([21](../../modules/21-change-detection.md), [16](../../modules/16-dependency-injection.md), [29](../../modules/29-testing-angular.md))" (the tests cited are 21's `Section 1`, 16's `Section 5`, 29's `Section 4`); and in the read list after "`@preact/signals-core` 1.14.4" add ", plus `vue` 3.5.44, `@vue/compiler-core` 3.5.44, `react-router` 8.5.0, `vue-router` 5.4.0 and `@vue/test-utils` 2.5.1", and "react.dev, vuejs.org, svelte.dev and qwik.dev sources" → "react.dev, vuejs.org, svelte.dev, qwik.dev, angular.dev, npm and Spring Boot sources" (+22).
- **N-5 (A1):** header (6) "registry reads 2026-10-19" → "registry reads 2026-10-19 and 2026-10-20" (+2; §6, §7 and SOURCES use 2026-10-20 reads).
- **N-6:** Q40.05 (932) "sometimes referred to as 'fine-grained reactivity'" → "sometimes referred to as \"fine-grained reactivity\"" (the docs' quotes, as §3 writes it; 0).
- **N-7:** Q40.11 short answer (1043): after "AngularJS had no in-place path to Angular: module 39 reports a rewrite" add ", though apps can move piece by piece as ngUpgrade hybrids ([39 §9](../../modules/39-version-history-and-migrations.md#9-from-angularjs-to-angular-ngupgrade-hybrids-the-strangler-fig-and-rewrites))" (+11; balance; answer stays under 290).
- **N-8:** Exercise 40.2 account (1291) "drops it, though its evidence is deleted." → "drops it before scoring, even with its evidence deleted." (+2)
- **N-9:** spelling: "judgement" (629, 636, 639, 1062, 1100, 1102, 1313) → "judgment", "favourite" (707) → "favorite", as "judgments" (1248, 1250) and the guide's American spelling ("behavior") (0).

## Judged acceptable

- Q40.16's short answer "schedules a microtask": accurate for `scheduleImmediateRootScheduleTask`; the §9 table carries the lane split, and F-3 fixes the follow-up.
- The Exercise 40.2 fixture scores `ecosystem-fit` from §7: §8 defines that criterion through §7's caveated count, and the fixture is labeled one team's judgments.
- "Qwik's signals serve resumability": a one-line framing next to the quoted resumability sentence; no Qwik behavior is claimed beyond it.
- Q40.11's "no in-place path" matches the owner (39:140, 39:1103); N-7 only adds the hybrid route.
- 12:701, 12:1463, 12:1792 → §3 and 12:1862 → §6 as planned, although §9 and §2 also touch them.

## Claims sampled (36)

| # | Claim (location) | Basis | Result |
|---|---|---|---|
| 1 | `react` 19.3.1 has no `dependencies` (§1, Q40.01) | `package.json` | Match |
| 2 | `vue` 3.5.44's five dependencies, verbatim (§1 Code) | `package.json` | Match |
| 3 | `svelte` exports `./compiler`, `./store`, `./transition`, `./motion` (§1) | `package.json` exports | Match |
| 4 | Descriptions of react, solid-js, svelte, preact; next "The React Framework" (§1) | `npm view` | Match |
| 5 | react.dev "recommend starting with a framework", "Full-stack frameworks", "does require that you make choices…" (§1) | `creating-a-react-app.md` | Match |
| 6 | Vue "flexible and incrementally adoptable", "without a build step", "grow with you" (§1, Q40.01) | `introduction.md` | Match |
| 7 | Angular "web framework that empowers…", "scale with both the size of your team…" (§1, §8) | `what-is-angular.md` 2-10 | Match (abridged across `<br/>`) |
| 8 | `PatchFlagNames` and `patchElement` bit checks, text `!==` (§2, Q40.02, §9) | `@vue/shared`, `runtime-core` 5952-5980 | Match |
| 9 | Static hoisting in `walk` (§2) | `compiler-core` 3096-3190 | Mismatch (F-1) |
| 10 | Vue compiled `createElementVNode(… 2 /* CLASS */)`, "Compiler-Informed Virtual DOM", "purely runtime" (§2) | `rendering-mechanism.md` 65, 109-111 | Match |
| 11 | `jsx`, `jsxs`, `Fragment` from `react/jsx-runtime` (§2) | `react-jsx-runtime.development.js` | Match |
| 12 | `beginWork` props identity (§3) | 12093 | Match |
| 13 | Eager `objectIs` bailout only with no pending lanes (§3, Q40.07) | 9523-9542 | Match |
| 14 | Duplicate-key warning text (§3) | 6968 | Match |
| 15 | `placeChild` line quoted in Exercise 40.1 | 6563-6577 | Match (verbatim) |
| 16 | Compiler `_c` from `react/compiler-runtime`, `useMemoCache(size)`, `codegenReactiveScope` `!==`, `"use no memo"` (§3, Q40.05) | plugin `dist/index.js`; `react-compiler-runtime` | Match |
| 17 | Compiler docs quotes ("re-render that component _and all of its children_", "automatically applies…", "fine-grained reactivity") (§3, Q40.05) | `react-compiler/introduction.md` | Match |
| 18 | 1.0 post: "first stable release", pin vs "a SemVer range", "can change compilation output" (§3, Q40.05) | `react-compiler-1.md` 148, 190 | Match |
| 19 | `memo` "will still re-render when its own state changes" (Q40.03) | `memo.md` 143 | Match |
| 20 | Vue "Fundamentally, signals…", "Knockout observables", "Meteor Tracker", Preact/Qwik "very similar to Vue's shallowRef" (§4) | `reactivity-in-depth.md` 450 | Match |
| 21 | Svelte "`count` is just a number", "deeply reactive _state proxy_", granularity quote (§4) | `02-$state.md` | Match |
| 22 | Svelte `equals`: `value === this.v`; Preact `i!==this.v` (§4) | `equality.js`; `signals-core.js` | Match |
| 23 | Solid `createComponent` → `untrack`, `equalFn` `===`, `writeSignal` → `runUpdates`, `insert`, `insertExpression` `value === current` (§2, §4, §9) | `solid.js` 150, 654-673, 1277; `web.js` 327-331, 545 | Match |
| 24 | `refreshComputed` `globalVersion` (§4) | `reactivity.cjs.js` 407 | Match |
| 25 | Svelte runes as "reactivity during compilation" (§4) | Svelte's own `$state` page | Wrong source (F-4) |
| 26 | Qwik "pausing execution on the server…"; v1 1.20.2, v2 `latest` 2.0.0-rc.3 (§4) | `resumable/index.mdx` 45; `npm view` | Match |
| 27 | `createContext` `Provider = defaultValue`, `pushProvider`, `readContextForConsumer`, `propagateParentContextChanges` `objectIs` (§5, Q40.08) | `react.development.js` 1072; client 5760-5962 | Match |
| 28 | Vue `provide` `Object.create(parentProvides)`, `inject` `key in` parent's provides (§5, Q40.08) | `runtime-core` 808-837 | Match |
| 29 | Vue Test Utils 2.5.1 `app.provide` per `global.provide` key (§5) | `vue-test-utils.cjs.js` 8362 | Match |
| 30 | `react-router` and `vue-router` peers and optional peers (§6, Q40.09) | `package.json` | Match |
| 31 | `@angular/router` 22.2.1 peers `@angular/core` exactly 22.2.1 (§6, §8, Q40.13) | `labs/angular/node_modules` | Match |
| 32 | `<ViewTransition>` page has no canary label; sandboxes pin `19.3.0-canary-f1f7ed2a-20260904`; Svelte `transition:` quote (§6) | `ViewTransition.md`; `14-transition.md` | Match |
| 33 | Download table, week 2026-10-12 to 2026-10-18; "the last 7 available days"; npm blog caveats (§7, Q40.10) | `api.npmjs.org` range reads; `download-counts.md`; blog | Match |
| 34 | Release dates (16.8.0, 19.0.0, Vue 2.0.0/3.0.0, Svelte 5.0.0, `@angular/core` 2.0.0 2016-09-15 UTC, 22.0.0) (§7) | `npm view … time` | Match |
| 35 | `Component.md` "still supported… we don't recommend" (§7) | `Component.md` | Match |
| 36 | `useSyncExternalStore` quotes; `getServerSnapshot` omission throws (§8, Q40.15) | `useSyncExternalStore.md` 48 | Match |
| — | React scheduling row (§9) and Q40.16 "Only Solid" | client 20533-20687; `flushSync` | Table match; follow-up wrong (F-3) |
| — | Q12.02 as basis of the lagging-library cost (§8) | 12:851 | Misattributed (F-2) |

## Proposed FIX tasks

The module is at 13,326 words; the CLOSE limit was 13,585 and the REVIEW ceiling is 14,085. All fixes together add about +170.

```
| FIX-M40-01 | S | todo | REVIEW-M40 |  |
| FIX-M40-02 | M | todo | REVIEW-M40 |  |
| FIX-M40-03 | S | todo | REVIEW-M40 |  |
```

- **FIX-M40-01 · S** · factual fixes F-1..F-4 and their SOURCES lines. **Sonnet** (texts and sources prescribed).
- **FIX-M40-02 · M** · terms, internal names and nits T-1, T-2, N-1..N-9. **Sonnet** (texts prescribed).
- **FIX-M40-03 · S** · anchors for the 13 file-level links into 40. **Sonnet** (mechanical; slugs listed).

## For Jorge

1. **One anchor differs from the plan's candidates:** 21:120 ("*It is the same as React's virtual DOM diff.*" … "both compare, then update") goes to §9, whose trace shows every runtime comparing, not §3. Say so if you prefer §3.
2. **35:1991 says "(other frameworks' motion), all file-level and not yet written"**: module 40 is now written; FIX-M40-03 only adds the slug (+0 words), so the stale "not yet written" stays unless you want a one-word edit in module 35.
3. **`labs/tools/module-stats.mjs` takes `[--strict] [guideRoot]`**, not a module number; `module-stats.mjs 40` fails with ENOENT on `40/SYLLABUS.md`. Task texts that say "`module-stats.mjs 40`" mean the module's row of the full run.
4. **VERSIONS.md rows carried from CLOSE-M40 (no FIX):** the "other frameworks, documented only" table of M40.md For Jorge 1; all re-read versions above still match the registry on 2026-10-20 (`@qwik.dev/core` `latest` 2.0.0-rc.3, `vue-router` 5.4.0, `@builder.io/qwik` 1.20.2).
