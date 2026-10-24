# REVIEW-M35: `modules/35-animations.md`

- **Reviewer:** a fresh reviewer subagent (claude-opus-5-5) of session S20261016-1540-claudecode. It read and judged the module and ran only read-only scripts. The re-runs belong to the main session, which owns all execution. Module 35 was planned by PLAN-M35 and written by HOUSE-32, HOUSE-33, SEC-M35-01..12, EX-M35-01..04, QB-M35-01..05 and CLOSE-M35 (session S20261016-0506). This reviewer wrote nothing in module 35 and continues none of those conversations, so it is eligible (RUN.md §4).
- **Date:** 2026-10-16.
- **Files read:**
  - the whole module (1,990 lines; line numbers below are as of this review and will move at FIX time);
  - `_meta/modules/M35.md` (whole: Handoffs, Lab decision, F1-F24, C1-C14, section map, bank table, Output answers, Exercises, For Jorge 1-4), QUALITY-BAR, STYLE-GUIDE §2, §3, §4.2-§4.3, §6, §7, §10, §11, RUN.md §5-§7 and §10, the TASKS entries REVIEW-M34, FIX-M34-01..03, the module-35 common rules, CLOSE-M35 and REVIEW-M35, LOG 1351-1489 (every PLAN-M35, HOUSE-32, HOUSE-33, SEC/EX/QB/CLOSE-M35 line), `SOURCES.md` `## Module 35 · Animations`, REVIEW-M34 (the format model);
  - module-35 lab files: titles of every spec by script (104 distinct titles); in full: `labs/e2e/tests/35-animations/outputs/q35-outputs.spec.ts`; in part: `section-9-migration.spec.ts` (115-160), `labs/angular/src/app/modules/35-animations/concepts/{section-8-legacy,section-6-types}.spec.ts`, `outputs/q35-outputs.spec.ts`, `projects/animations-lab/src/app/m35/enter-leave/enter-leave.ts` (the two class-list bindings); `context`/`reducedMotion`/`waitForTimeout` greps over every module-35 spec; provider greps over `labs/angular/projects`, `labs/angular/src`, `labs/e2e`.
- **Packages read (22.2.1, `labs/angular/node_modules`):**
  - `@angular/core`: `fesm2022/_debug_node-chunk.mjs` 3954-3956 (`MAX_ANIMATION_TIMEOUT_DEFAULT`), 3958-4070 (`getLongestComputedTransition`, `getLongestComputedAnimation`, `longestExists`, `getAnimationDuration`, `determineLongestAnimationFromComputedStyles`, `determineLongestAnimation`, `determineLongestAnimationFromElementAnimations`), 4073-4260 (`areAnimationSupported`, `NG0650` checks, `noOpAnimationComplete`, `cancelLeavingNodes`, `trackLeavingNodes`, `getClassListFromValue`, `isLongestAnimation`), 4494-4625 (`ANIMATION_QUEUE`, `scheduleAnimationQueue`, `runLeaveAnimationsWithCallbackImpl`, `aggregateDescendantAnimations`), the `TView` type-2 checks after 4625, 14382-14610 (all four instructions, `runEnterAnimation`, `runLeaveAnimations`, `animateLeaveClassRunner`, `runLeaveAnimationFunction`), 19467-19580 (`ChangeDetectionSchedulerImpl`); `schematics/collection.json`, `migrations.json`;
  - `@angular/platform-browser`: `fesm2022/animations-async.mjs` (30-70 `loadImpl`, `NG05300`, `createRenderer` on `data['animation']`; 220-235 `provideAnimationsAsync`), `fesm2022/animations.mjs` (84-99 `ANIMATION_MODULE_TYPE`, `withConfig({ disableAnimations })`), `fesm2022/_dom_renderer-chunk.mjs` 676-716 (`checkNoSyntheticProp`, `NG05105`, `ngDevMode`), `types/animations.d.ts` 18, 32, 78;
  - `@angular/animations`: `fesm2022/_util-chunk.mjs` 271-274, `fesm2022/browser.mjs` 671-696, 1245-1275 (`buildKeyframes` folds the delay, sets `delay = 0`), 1736-1773 (`ng-trigger`);
  - `@angular/router`: `fesm2022/_router-chunk.mjs` `createViewTransition` and `createRenderPromise`; a `grep` for `reduced-motion`/`reducedMotion` over router and core `fesm2022` (no match);
  - `@angular/compiler-cli`: `bundles/chunk-VMCGORHB.js` 3078-3160 (`InterpolatedSignalCheck`: `BindingType.Animation`, "`[animate.enter]="mySignal"`"), `src/ngtsc/diagnostics/src/error_code.d.ts` 509 (`INTERPOLATED_SIGNAL_NOT_INVOKED = 8109`); `@schematics/angular` `collection.json`, `migrations/migration-collection.json`.
- **Basis of each finding:** a package source, a committed spec, the module text, SOURCES.md, or a read-only script (grep, sed, awk, python3 word count, `node labs/tools/module-stats.mjs`). Nothing was built, run or installed. **Not re-read** (their basis is the SEC/QB LOG lines and SOURCES.md): the Angular docs pages on `main`, the CHANGELOG lines and commits (dates of 20.2.0, 20.3.1, 20.3.7, 21.2.0, 21.2.4, 22.0.0; df659b8d0c, b9b5c279b4), the MDN pages and their Baseline statuses, WCAG 2.2.
- **Probe files:** none in the repository. One scratch script lived in the job scratchpad (`/Users/jorge.quintero/.claude/jobs/d6870c5f/tmp`) and was deleted. The reviewer created only this file and edited `_meta/TASKS.md`.

Overall, a carefully sourced module: every Output value matches its assertion, every one of the 76 distinct cited test titles exists, every exercise criterion is a test title, every Playwright context sets `reducedMotion`, no spec waits on time, and the only animation provider in `animations-lab` is in `main.legacy.ts`. The internals it names exist in 22.2.1 under the names it gives. Findings:
- **one Major:** Q35.11 says a leave class whose declared transition never starts removes the element at once; the 22.2.1 source reads the declared `transition-duration` from the computed style and waits for the fallback timer (F-1);
- three Minor factual or marker findings: a Baseline year off the module's own convention (F-2), the §7 "no duplicate" claims stated without the restore-position condition that Q35.13's own test shows (F-3), and `prefers-reduced-motion`'s marker after its first mention (F-4);
- four Minor teaching findings: undefined terms (T-1), internal names without "may change" (T-2), the v22.2 signal form without the 22.2.1 NG8109 warning, and a lab test that binds an invoked signal (T-3), and one throwaway observation in a follow-up (T-4);
- seven nits and the anchor handoffs (7 rows).

**Plan fact found wrong:** M35.md's Question note for Q35.11 ("a leave class whose transition has nothing to change removes at once") and F11's "so a quick remove-then-add does not leave two copies". The first is the source of F-1; the second holds only when the restored element sits right after its leaving copy (or in another parent of the same view), which Q35.13's second test shows and §7's misconception and diagram do not say (F-3). Also: F8 lists script animations as measured, which SEC-M35-04 already corrected (`longestExists` needs a name or property); M35.md's §4 plan text uses the high-date Baseline years (2022, 2023) where the module, rightly by its own convention, uses the low-date years.

**Prose:** 18,594 words now (`node labs/tools/module-stats.mjs` and the QUALITY-BAR one-liner agree; equal to CLOSE-M35's LOG count). The fixes add about +260, for about 18,855: under the CLOSE limit of 18,918 and the REVIEW ceiling of 19,618.

## Re-runs (main session)

Filled by the main session S20261016-1540-claudecode, serially, while the reviewer read (Node 24.21.0: `export PATH=/opt/homebrew/opt/node@24/bin:$PATH`).

| Command | Result |
|---|---|
| `labs/angular`: `npx tsc -p tsconfig.spec.json --noEmit` | 0 |
| `labs/angular`: `npx ng test --watch=false --include='src/app/modules/35-animations/**/*.spec.ts'` | 7 files, 10 passed |
| `labs/angular`: `npx ng build animations-lab`; `npx ng build animations-lab -c legacy` | 0; 0 |
| `labs/e2e`: `npm run typecheck` | 0 |
| `labs/e2e`: `npm test -- tests/35-animations --repeat-each=5` | 525 passed (105 × 5), 0 failed, 0 flaky, 1.6 min |
| Mermaid parse of the 12 fences (Mermaid 11.12.0 + jsdom 26.1.0 in the job scratchpad, deleted after) | 12/12 parse; the negative control fails |
| guide root: `node labs/tools/check-links.mjs --planned`; `node labs/tools/check-snippets.mjs . 35`; `node labs/tools/module-stats.mjs` | check-links 0; check-snippets 35 0; module-stats `35-animations` 25 Q, 4 Ex, 18,594 words, Output 8, Concept 7, Bug hunt 4, Difference 2, Design 2, Trade-off 2, no flag |
| `lsof -iTCP:4300 … -iTCP:4700 -sTCP:LISTEN` after the run; remove `labs/e2e/test-results` | no listener; `test-results` removed |

Reviewer's read-only script results (2026-10-16):
- **Cited test titles:** 155 citations, 76 distinct, 0 missing from the 104 distinct titles of the module-35 specs (two only looked missing because the specs escape the apostrophe; `Smoke: …` is the verification paragraph's generic mention).
- **Exercise criteria:** 20 of 20 equal test titles; each runs over variants a and b in a `for` loop (read). Each of the eight Output IDs (02, 06, 08, 10, 13, 15, 20, 24) has a test named after it (Q35.13 has two; Q35.15 is the `ng test` one).
- **Output values vs assertions:** Q35.02 (two `css-transition`s `opacity`/`transform`; the 12 events in order; two reverse durations below 400; final opacity `1`), Q35.06 (`m35-pop-fade`, `m35-pop-slide`; class kept after the fade, gone after the slide), Q35.08 (`infinite`; `css-transition opacity running`; plain and spin gone without a finish), Q35.10 (`css-animation running` on the line; child inner unanimated; block gone after `finishAll`), Q35.13 (`1:-:0` ×3 after the rotation; one element with the enter class and a detached copy; two elements when restored at the end), Q35.15 (`start`/`done` `void`→`open`, then `open`→`closed`), Q35.20 (the six sorted selectors; `AbortError`/`resolved`), Q35.24 (no pulse animation; note gone without `finishAll`; the three `root` selectors): all equal.
- **Contexts and time (C10, C11):** 18 spec files; every browser test opens `browser.newContext({ reducedMotion: … })` (section 11 through a helper that takes the preference); the three tests without a context only read `dist` files. No `waitForTimeout`, `setTimeout`, `performance.now` or `Date.now` in any module-35 e2e spec. Durations asserted only as declared `getTiming()` values (Q35.02 `< 400`, §7 delays 0/40/80/120, Exercise 35.3 0/60/120/180); the 4000 ms default is a token value in `ng test`, and §9's callback test waits with a 15 s `toHaveCount` timeout without asserting time.
- **Providers (C7):** `provideAnimations*`/`provideNoopAnimations`/`*AnimationsModule` appear in `projects/animations-lab` only in `src/main.legacy.ts`; elsewhere only in two `ng test` specs' `TestBed` providers.
- **URLs:** one distinct URL in the module (the MDN Baseline glossary, in SOURCES.md); every docs page, MDN page, commit, CHANGELOG line, WCAG criterion and package file the module cites has a SOURCES.md line under `## Module 35 · Animations`.
- **Markup:** `<details>` 44 open and 44 closed; 12 `mermaid` fences and 12 "What to notice" lines; B1 subsections: 12 of each of the six.
- **Answer anatomy:** each of the five D1 counts is 25; every answer has at least 2 answered follow-ups; answers 172-265 words (none above 290).
- **Question links:** every one of the 25 IDs is linked outside its heading.
- **Markers, placeholders, process words:** `<!-- TASK:`/`PLACEHOLDER`/`relink:` 0; `Unverified` 0.
- **`git status`:** `projects/animations-lab` and `labs/e2e` are untracked, so C13's "append-only" cannot be diffed (LOG records the two non-append import lines in `app.routes.ts`, SEC-M35-06 and SEC-M35-09); the `labs/angular` diffs to `angular.json`, `package.json`, `package-lock.json` and `tsconfig.json` match HOUSE-32/33's file lists. `labs/e2e/test-results` exists while the main session's re-runs are in progress (main checks after).

## QUALITY-BAR

45 items: **41 Pass, 4 Partial (B8, B9, C1, C4), 0 Fail.** H1 and H2 are Pass on CLOSE-M35's run, pending the main session's re-runs above.

| ID | Result | Evidence |
|---|---|---|
| A1 | Pass | Lines 3-9 in §4.1 order; Labs line has the three folders and two run commands. |
| A2 | Pass | 18 §2, 10 §5, 08 §2, 13 §9, 24 §9, all anchored. |
| A3 | Pass | §1, §5, §6, §10; six question IDs; ends with the Summary. |
| A4 | Pass | Contents (13-29) links 12 sections and the five closing sections. |
| A5 | Pass | Mechanisms → Angular API → legacy → router → cost → internals (§12 last). |
| B1 | Pass | 12 of each subsection (script). |
| B2 | Pass | Each problem opens with a concrete failure (37, 134, 219, 305, 388, 469, 567, 647, 731, 826, 915, 1011). |
| B3 | Pass | 12 diagrams, each with "What to notice"; one analogy per section. |
| B4 | Pass | Every section has a "read from the 22.2.1 source" answer to a why (74, 164, 240, 344, 425, 504, 592, 669, 766, 855, 946, 1042-1052). |
| B5 | Pass | Each Code subsection has numbered steps; §9, §10, §11 also state the approach. |
| B6 | Pass | Every practice has "because". |
| B7 | Pass | Every bullet has a correction and a cause or a dated once-true clause (125, 213, 560, 638). §7's 638 is factually incomplete (F-3), not missing a cause. |
| B8 | Partial | §4's Framework vs platform callout (346) lacks the `> [!NOTE]` line §10's has (N-1). Coming from the backend: not required (M35.md C3; SYLLABUS names no comparison). |
| B9 | Partial | jsdom, `TestBed` (31), `RendererFactory2` (72) and `afterNextRender` (855) are used undefined (T-1). |
| B10 | Pass | Pipeline, `will-change`, media queries, keyframe renaming, host bindings, `track`, render hooks, the router's navigation and DevTools counters each get one sentence and a link. |
| C1 | Partial | 33 of 36 sampled claims match; Q35.11 contradicts the source (F-1), §7's duplicate claims omit a tested condition (F-3), and Q35.22's follow-up rests on an unasserted observation (T-4). |
| C2 | Pass | All eight Output values equal their assertions (above). |
| C3 | Pass | Every "in the lab" sentence names a test; 76/76 titles exist. |
| C4 | Partial | `prefers-reduced-motion` first appears at 86 without its marker (921 has it; F-4); `grid-template-rows` carries the high-date year (F-2). Every Angular marker is in the §3.2 form. |
| C5 | Pass | Every API checked exists in 22.2.1 (claims table). |
| C6 | Pass | No `Unverified`. |
| C7 | Pass | `check-snippets . 35` 0 (CLOSE). Two `css` Excerpts start with `//`, not a CSS comment (N-2). |
| C8 | Pass | One URL, in SOURCES.md; every cited source has a line. |
| D1 | Pass | 25 of each part. |
| D2 | Pass | Each Output short answer gives values and a reason. |
| D3 | Pass | Output 8, Concept 7, Bug hunt 4, Difference 2, Design 2, Trade-off 2; max 32%. |
| D4 | Pass | Q35.01-25 follow the section order. |
| D5 | Pass | M35.md's "not asked here" list holds (no Q08.03, Q08.05, Q04.07, Q18.25, Q24.32, Q23.31 repeat). |
| D6 | Pass | All 25 IDs linked from the body. |
| D7 | Pass | `<a id="q35-NN">` above each question. |
| D8 | Pass | 25 Q (ceiling and floor 25), 4 Ex. |
| E1 | Pass | Full anatomy in all four (28 labels by grep). |
| E2 | Pass | 20/20 criteria are titles; each account names what its test asserts. |
| E3 | Pass | One component → layout CSS → migration over two builds → route transitions over two pages. |
| E4 | Pass | Solutions in labs; the runs are the main session's. |
| E5 | Pass | Eight Output questions. |
| F1 | Pass | Three paragraphs restate all 12 sections with links. |
| F2 | Pass | Five prompts naming listeners. |
| F3 | Pass | Seven flashcards. |
| F4 | Pass | Builds on, Read next, Uses these ideas later, Comparisons, each with a reason. |
| G1 | Pass | 18,594 ≤ 18,918. |
| G2 | Pass | Five SYLLABUS §4 checkboxes map as M35.md's breadth table says (spot-checked). |
| H1 | Pass (pending) | CLOSE-M35's run; main re-runs above. |
| H2 | Pass (pending) | CLOSE's `check-links`; main re-run above. |
| H3 | Pass (reviewer) | `dist` ignored; `test-results` during the main session's runs only. |

## Module-specific checks

| Check | Result | Evidence |
|---|---|---|
| HOUSE-32/33 result in every module-35 LOG line | Pass | Every SEC/EX/QB line names `animations 22.2.1` and the build or smoke state (LOG 1354-1486), QB lines through the folder run. |
| Recorded class lists, event orders, animation kinds, pseudo-element names, timing values, error codes, layout counts (F4-F11, F14, F15, F20, eight Output answers) vs specs | Pass (read) | Output values above; `off`→`on` (§8), `NG05105`, `NoopAnimations`, 900/1050/1200 and 800/860/920/980 durations with delay 0, `InvalidStateError`/`AbortError`, `LayoutCount` 0 vs > 0. Pass/fail of the runs: main. |
| No duration asserted, no throwaway observation (C11) | Pass, one finding | Specs clean (above). Q35.22's "a new session restarts the counter" is an observation from the HOUSE-33 helper fix, asserted by no test (T-4). |
| No unsourced size, speed, frame-rate or accessibility claim (C6) | Pass | §9's "larger" `main` is asserted (`size(legacy) > size(native)`); WCAG quoted by SC number; the docs' bundle sentences not repeated. §11's "the motion janks" in a problem statement is qualitative and paired with the layout count (judged acceptable). |
| `reducedMotion` in every context (C10) | Pass | Script above. |
| Chromium-only claims labelled (C14) | Pass | Verification paragraph, bank intro, §2 162, Q35.20, Q35.24, Exercise 35.2's variant b. |
| jsdom vs Chromium apart (F4, C9) | Pass | §1 74, Q35.01, Q35.15 ("the real driver was not run"), `NG05105` "development mode only". |
| Docs' `animation: none` as a mismatch (C12) | Pass | §9 766, Q35.18, Summary. |
| v22 leave semantics and the 21.2 history as F10 reads | Pass | §6 475, 504, 560; Q35.10. Marker text matches C5. |
| Shared files only by HOUSE-32/33; append-only as declared (C13) | Pass (read) | `labs/angular` diffs match; `animations-lab` untracked; the two import lines are recorded in LOG. |
| No animation provider outside `main.legacy.ts` | Pass | grep above. |
| Owner credit and the 04/08/10/12/13/16/18/20/24/31/36/39 split (C7) | Pass | Each owned topic gets one sentence and a link; module 11 is linked without an anchor (N-7). |
| Internal names marked (C8) | Partial | Sections 1-7, 9-12 mark them; §8's `buildKeyframes` and `checkNoSyntheticProp` and Exercise 35.4's `createViewTransition`/`ChangeDetectionSchedulerImpl` lack "internal"/"may change" (T-2). §12's blanket sentence (1042) is judged enough. |
| Status markers (C5) | Partial | F-2, F-4. Angular markers in C5's form; `transition-behavior`, `calc-size()`, `interpolate-size` written as dated limited availability (FIX-M33-03 still blocked). |
| Exercise criteria = test titles; the alternative runs | Pass | 20/20; variant loops (read); runs are main's. |
| ≥ 2 answered follow-ups | Pass | 2 each (script). |
| Terms defined at first use | Partial | T-1. |
| Links into written modules carry anchors | Partial | All but `[module 11](11-accessibility.md)` at 921 (N-7); file-level only to planned 36/39/40. |
| SOURCES complete | Pass | See URLs above. |
| Twelve Mermaid diagrams parse | Main | Counted 12; F-3 edits one label inside §7's diagram, so the parse is re-run after FIX-M35-01. |
| Misconceptions causes; `<details>` closed; type mix | Pass / Pass / Pass | 44/44; max 32%. |
| Prose within 18,918 and ceiling 19,618 | Pass | 18,594; about 18,855 after the FIX. |
| No stray files; no server left (4300-4700) | Main after re-runs | `dist` ignored; `test-results` present during the runs. |
| File-level links into 35 as anchor candidates | Done | Handoffs below (7 rows). |

## Handoffs

Module 35 slugs:
- S2 `#2-css-transitions-triggers-interruption-events-and-entry-with-starting-style`
- S4 `#4-the-web-animations-api-elementanimate-the-animation-object-and-getanimations`
- S5 `#5-animateenter-and-animateleave-with-css-classes-syntax-bindings-and-when-the-element-leaves`
- S6 `#6-function-callbacks-and-the-v22-leave-semantics-animationcallbackevent-animationcomplete-and-nested-leaves`
- S7 `#7-animating-lists-for-enter-leave-reorder-and-stagger`
- S8 `#8-legacy-angularanimations-triggers-states-transitions-query-and-stagger`
- S12 `#12-under-the-hood-from-animateleave-to-a-removed-node`

Line numbers were read 2026-10-16; find each line by its context, not its number. Only the link target changes (`35-animations.md` → `35-animations.md#<slug>`); +0 words. The mapping follows M35.md's "Anchor candidates for REVIEW-M35" (lines with a reason get an anchor) plus 10:114, which M35.md did not list.

| File:line | Context | Anchor | Why |
|---|---|---|---|
| 10:114 | "transitions and animations also rank here ([module 35]" | S4 | §4 quotes "Animations take precedence over all static styles" and tests it. |
| 10:1400 | "[35](../../modules/35-animations.md) (transitions)" | S2 | M35.md. |
| 13:2514 | "[35](../../modules/35-animations.md) (host bindings)" | S5 | M35.md; §5 tests `animate.enter` as a host binding. |
| 14:61 | "beyond style encapsulation and [animation](../../modules/35-animations.md) hooks" | S8 | M35.md; §8 explains the renderer the legacy providers wrap. |
| 18:2611 | "[35](../../modules/35-animations.md) (animating `@if` and `@for`)" | S7 | M35.md. |
| 19:2527 | "[35](../../modules/35-animations.md) (animating projected and dynamic content)" | S6 | M35.md; §6's Dynamic content paragraph. |
| 20:2235 | "[35](../../modules/35-animations.md) (animating around render hooks)" | S12 | M35.md; §12's queue in `afterNextRender`. |

Stay file-level (headers, Leads to, and "Uses these ideas later" lines with no reason): 10:5, 11:1598, 13:5, 14:2206, 21:2711. CLOSE-M35's LOG mapped 14:61 to §12 and 19:2527 to §5/§7; this table follows M35.md (§8, §6), whose reasons match the target text.

## Factual findings

**F-1 · Major (C1) · Q35.11 says a leave class whose transition never starts removes the element at once (1357, 1359).** Read from `@angular/core` 22.2.1 `_debug_node-chunk.mjs`: when `el.getAnimations()` is empty, `determineLongestAnimation` (4032-4036) calls `determineLongestAnimationFromComputedStyles` (4022-4031), which reads `transition-property`, `transition-duration` and `transition-delay` from `getComputedStyle` (`getLongestComputedTransition`, 3967-3983). A declared `transition: opacity 600ms` gives `{ propertyName: 'opacity', duration: 600 }`, `longestExists` (4008-4010) is true, so `animateLeaveClassRunner` (14514-14560) does not take the "no longest" branch: it sets the fallback `setTimeout` of `longest.duration + 50` and removes the element when that fires, since no `transitionend` arrives. The answer's "takes the same path (read, not run)" cites a read that says the opposite. M35.md's Question note for Q35.11 carries the same error. (Q35.08's colour-only class has no declared transition, so it is unaffected.)
- Short answer: "A leave class that changes nothing the transition watches starts no animation, so the element goes at once." → "A leave class that changes nothing the transition watches starts no animation, yet the runtime reads the declared `transition-duration` from the computed style and keeps the element until its fallback timer (that duration plus 50 ms) fires." (+18)
- Full explanation: "a `transition` on a property the class leaves unchanged takes the same path (read, not run)." → "a `transition` on a property the class leaves unchanged does not: with `getAnimations()` empty, the internal `determineLongestAnimationFromComputedStyles` (may change in any release) records the declared transition, so the element waits for the fallback timer, not for a `transitionend` that never comes (read, not run, `@angular/core` 22.2.1)." (+30)
- Second follow-up: "*How do you spot the second?* `getAnimations()` on the element after the class lands is empty." → "*How do you spot the second?* `getAnimations()` on the element after the class lands is empty while the element is still attached." (+6)

**F-2 · Minor (C4) · `grid-template-rows` carries the high-date year (741).** SOURCES.md records MDN's `grid-template-rows` as "Baseline widely available, low 2017-10-17, high 2020-04-17". Every other widely-available marker in the module uses the low-date year (transition and `animation` 2015, `Element.animate()` 2020-03-24, `getAnimations()` and `commitStyles()` 2020-07-28, `prefers-reduced-motion` 2020-01-15), as module 34's `:dir()` does.
- Fix: "a `grid-template-rows` [Baseline 2020: widely available, per MDN] row" → "a `grid-template-rows` [Baseline 2017: widely available, per MDN] row" (+0).

**F-3 · Minor (C1) · §7 states "no duplicate on re-add" without the condition Q35.13's own test shows (579, 588, 592, 638).** `cancelLeavingNodes` (4133-4174) cancels a leaving element only when it is the new element itself (re-used, not removed), the new element's previous sibling, or under another parent of the same view; otherwise it stays until its leave ends. `Q35.13 a row restored away from its leaving copy shows two elements until the leave ends` asserts two elements. §7's diagram node, the 592 summary of the source and the 638 misconception read as unconditional; 588's "other reorders were not run" ignores the rotation Q35.13 runs.
- 579 (Mermaid label): `I["re-add during leave"] --> J["leaving copy cancelled"]` → `I["re-add beside the leaving copy"] --> J["leaving copy cancelled"]` (code, +0 prose).
- 588: "The run keeps the elements, so "re-added" means the enter class, not a new node; other reorders were not run." → "The run keeps the elements, so "re-added" means the enter class, not a new node; a first-to-end rotation replays nothing ([Q35.13](../../modules/35-animations.md#q35-13)), and other reorders were not run." (+9)
- 592: "a recorded one that is the new element (reused), its previous sibling or in another parent of the same view gets a synthetic `animationend` with `detail.cancel` and is removed. The test restores the row in place." → "a recorded one that is the new element itself gets a synthetic `animationend` with `detail.cancel` and is reused; one that is the new element's previous sibling, or sits under another parent of the same view, gets the same event and is removed; any other stays until its leave ends. The test restores the row in place; [Q35.13](../../modules/35-animations.md#q35-13) restores one at the end and sees two elements." (+27)
- 638: "*"Re-adding during a leave shows two rows."* Fixed in 20.2.0 (2025-08-20) and 20.3.7 (2025-10-22), CHANGELOG ("prevent duplicate nodes from being retained with fast `animate.leave` calls"). The myth lingers because early v20 did it." → "*"Re-adding during a leave always shows two rows."* Restored in place, one row remains: fixed in 20.2.0 (2025-08-20) and 20.3.7 (2025-10-22), CHANGELOG ("prevent duplicate nodes from being retained with fast `animate.leave` calls"). Restored elsewhere, both show until the leave ends ([Q35.13](../../modules/35-animations.md#q35-13)). The myth lingers because early v20 did it." (+16)

**F-4 · Minor (C4, M35.md C5) · `prefers-reduced-motion`'s marker comes after its first mention.** The first body mention is §1's Code step 3 (86); the marker is in §11 (921).
- 86: "3. The script checks `prefers-reduced-motion` itself, because no CSS rule stops `element.animate()`." → "3. The script checks `prefers-reduced-motion` [Baseline 2020: widely available, per MDN] itself, because no CSS rule stops `element.animate()`." (+6)
- 921: "`prefers-reduced-motion` [Baseline 2020: widely available, per MDN] is the media query" → "`prefers-reduced-motion` is the media query" (−6; N-7 edits the same line).

## Teaching and completeness findings

**T-1 · Minor (B9) · four terms used before any definition.**
- 31: "`ng test` (jsdom, development mode) covers tokens, `TestBed` options," → "`ng test` (on jsdom, a JavaScript DOM for Node, [29 §2](../../modules/29-testing-angular.md#2-the-runner-vitest-through-angularbuildunit-test-jsdom-and-browser-mode); development mode) covers tokens, options of `TestBed` (Angular's testing module, [29 §4](../../modules/29-testing-angular.md#4-testbed-the-testing-module-inject-runininjectioncontext-overrides-and-teardown))," (+18; the module-29 glosses are module 29's own, line 41).
- 72: "the legacy provider replaces `RendererFactory2` and sets" → "the legacy provider replaces `RendererFactory2` (the factory of the renderers that write to the DOM, [14 §1](../../modules/14-directives-and-pipes.md#1-directives-and-attribute-directives-host-inputs-elementref-and-renderer2)) and sets" (+11).
- 855: "Otherwise its update callback resolves after `afterNextRender` plus a `setTimeout`," → "Otherwise its update callback resolves after `afterNextRender` (a render hook that runs once after the next render, [20 §4](../../modules/20-lifecycle-and-render-hooks.md#4-render-hooks-afternextrender-aftereveryrender-and-their-phases)) plus a `setTimeout`," (+13).

**T-2 · Minor (M35.md C8) · internal names without "internal" or "may change in any release".**
- 673: "Read, not run: `buildKeyframes` folds a delay" → "Read, not run: the internal `buildKeyframes` (may change in any release) folds a delay" (+7). Basis: `browser.mjs` 1245-1275, a method of an unexported timeline class.
- 675: "(read, not run: `checkNoSyntheticProp`, `fesm2022/_dom_renderer-chunk.mjs`)" → "(read, not run: internal `checkNoSyntheticProp`, may change in any release, `@angular/platform-browser` 22.2.1 `fesm2022/_dom_renderer-chunk.mjs`)" (+9).
- 1922: "internal `createViewTransition`)" → "internal `createViewTransition`, may change in any release)" and "internal `ChangeDetectionSchedulerImpl`)" → "internal `ChangeDetectionSchedulerImpl`, may change in any release)" (+10).

**T-3 · Minor (C1, LOG SEC-M35-05 and CLOSE-M35 hand-offs) · the v22.2 signal form and the lab's signal test.** §5 (394) and Q35.07 teach that a signal "may be bound"; the runtime does unwrap a function value (`getClassListFromValue`, 4200-4210), but 22.2.1's extended diagnostic NG8109 explicitly flags `[animate.enter]="mySignal"` (`@angular/compiler-cli` `InterpolatedSignalCheck`, `BindingType.Animation`), which is why SEC-M35-05 changed the lab to `signalClasses()`. The lab therefore asserts an invoked signal, an ordinary expression, while 423 and Q35.07 say "a signal".
- 394: after "a function or **signal** ([17 §2](../../modules/17-signals.md#2-writable-signals)) that returns a class list." add " Bound uninvoked, `[animate.enter]="classes"` is unwrapped at run time, but 22.2.1's extended diagnostic NG8109 (a compile-time warning for a likely mistake) still asks for `classes()` (read, not run: `getClassListFromValue` in `@angular/core`, the `interpolated_signal_not_invoked` check in `@angular/compiler-cli`)." (+43)
- 423: "In the lab an array and a signal each give two classes" → "In the lab an array and an invoked signal (`signalClasses()`) each give two classes" (+2).
- Q35.07 full explanation: "An array and a signal each applied two classes" → "An array and an invoked signal each applied two classes" (+1).

**T-4 · Minor (M35.md lesson 1, C11) · Q35.22's first follow-up rests on an unasserted observation (1592).** "a new session restarts the counter" comes from the HOUSE-33 helper fix (LOG, SEC-M35-11 line); no committed test asserts it.
- Fix: "*How do you measure it?* Read `LayoutCount` through the DevTools Protocol with one session kept open: a new session restarts the counter." → "*How do you measure it?* Read `LayoutCount` through the DevTools Protocol before and after the animation, in one session, as `Section 11: animating width adds layouts while animating transform adds none` does." (+8)

**Nits (folded into FIX-M35-01):**
- **N-1 (B8):** §4's callout (346) lacks the `> [!NOTE]` line STYLE-GUIDE §6 uses and §10's callout has. Insert `> [!NOTE]` as its own line before "> **Framework vs platform.** The browser provides transitions, keyframes, this API" (+0).
- **N-2 (C7):** two `css` Excerpts start with `//`, which is not a CSS comment: "// Excerpt of labs/angular/projects/animations-lab/src/styles.css" (283) and "// Excerpt of labs/angular/projects/animations-lab/src/app/m35/outputs/q35-02.ts" (1135) → `/* Excerpt of … */` as the other `css` blocks do (code, +0 prose; `check-snippets . 35` must still pass).
- **N-3:** the bank intro (1109) says every Output run is in the e2e spec; Q35.15's is the `ng test` one. "Each Output answer names the run asserted in `labs/e2e/tests/35-animations/outputs/q35-outputs.spec.ts`; screen values" → "Each Output answer names the run asserted in `labs/e2e/tests/35-animations/outputs/q35-outputs.spec.ts`, except Q35.15's, asserted by `ng test` in `labs/angular/src/app/modules/35-animations/outputs/q35-outputs.spec.ts`; screen values" (+12).
- **N-4:** Q35.16 (1473) puts the `ANIMATION_MODULE_TYPE` test behind the `NG05105` sentence. "(`Section 8: a synthetic property without an animation provider throws NG05105`) (`Section 8: provideNoopAnimations sets ANIMATION_MODULE_TYPE to NoopAnimations`)." → "(`Section 8: a synthetic property without an animation provider throws NG05105`); the noop provider sets the token as the table says (`Section 8: provideNoopAnimations sets ANIMATION_MODULE_TYPE to NoopAnimations`)." (+9)
- **N-5:** Q35.25 (1653) "The leave runs on after `ApplicationRef.whenStable()` resolves" → "The leave is still running after `ApplicationRef.whenStable()` resolves" (+1).
- **N-6:** no blank line between "Drilled in [Q35.25](../../modules/35-animations.md#q35-25)." (1054) and "### Code" (1055); insert one (+0).
- **N-7 (C7, links):** 921 links a written module file-level: "accessibility: [module 11](../../modules/11-accessibility.md)" → "accessibility: [module 11](../../modules/11-accessibility.md#7-testing-accessibility)" (+0; 11 §7 names `prefers-reduced-motion` in its manual pass).

## Judged acceptable

- §4 and §5's "records a result only for an `animationName` or a `transitionProperty`": `determineLongestAnimationFromElementAnimations` (4037-4070) and `longestExists` agree; the subtle case (a script animation at least as long replaces a recorded CSS one) is not claimed, as SEC-M35-05 chose.
- §10's diagram puts `onViewTransitionCreated` right after `startViewTransition`, unlike M35.md's: `createViewTransition` calls the hook synchronously after `startViewTransition` returns, before the update callback (router source); the module is right.
- §8's stagger "delay 0, longer durations" against M35.md's "increasing delay": `buildKeyframes` (1252-1272) sets `delay = 0` and stretches the first keyframe; the run and the source agree.
- §6 500: "starts a `setTimeout` … listens once for `animationend` … then calls your function": the order in `runLeaveAnimationFunction` (14576-14610).
- §12's blanket "every function named here is internal and may change in any release" (1042) covers the section (SEC-M35-12 hand-off).
- §11's problem statement "the motion janks" is qualitative, defined, and paired with a layout count rather than a time.
- The module's "Coming from the backend" count is 0 (M35.md C3: SYLLABUS names no comparison).
- Q35.10's "nothing would have run" in v21.1 is stated as read from the CHANGELOG, not run.

## Claims sampled (36)

| # | Claim (line) | Basis | Result |
|---|---|---|---|
| 1 | `areAnimationSupported` false on server or without `getAnimations` (74) | core 4073 | Match |
| 2 | Instructions return before reading `ANIMATIONS_DISABLED` (74) | core 14382-14390, 14474-14480, 14559-14565 | Match |
| 3 | `provideAnimationsAsync` replaces `RendererFactory2`, `ANIMATION_MODULE_TYPE` `BrowserAnimations` (72, Q35.16) | `animations-async.mjs` 220-235 | Match |
| 4 | `determineLongestAnimation` reads `getAnimations()`, falls back to computed styles (164) | core 4022-4036 | Match |
| 5 | Delay + duration, ÷ `playbackRate` unless 0 or 1, infinite skipped (344, Q35.06) | core 4011-4021, 4043-4046 | Match |
| 6 | Script `Animation` records nothing (344, 425) | core 4049-4069, `longestExists` | Match |
| 7 | Leave: cancel enter classes, add leave classes, measure next frame, none → removed, else fallback + 50 ms (425, 1050) | core 14514-14560 | Match |
| 8 | Q35.11 unchanged-property transition removes at once (1357, 1359) | core 3967-4031, 14544-14556 | **Mismatch (F-1)** |
| 9 | `MAX_ANIMATION_TIMEOUT` default 4000 (498, Q35.09) | core 3954-3956; `section-6-types.spec.ts` | Match |
| 10 | Function form: timeout, `animationend` once, then the callback (500) | core 14576-14610 | Match |
| 11 | Enter `animationComplete` is a no-op (Q35.09) | core 4114, `runEnterAnimationFunction` | Match |
| 12 | Nested leaves: same view + embedded views (`TView` type 2), `Promise.allSettled` (504) | core 4621-4760 | Match |
| 13 | Queue: per-`EnvironmentInjector` set, one `afterNextRender` (1015, 1048) | core 4494-4560 | Match |
| 14 | No leaves → callback at once (1048) | core `runLeaveAnimationsWithCallbackImpl` | Match |
| 15 | `cancelLeavingNodes` conditions (592) | core 4133-4174 | **Partial (F-3)** |
| 16 | §7 "re-adding … one copy" unconditional (579, 638) | Q35.13 second test | **Partial (F-3)** |
| 17 | Function or signal values unwrapped (394) | core 4200-4210 | Match; NG8109 omitted (T-3) |
| 18 | NG0650 checks dev-only (not claimed); `NG05105` dev-only (675) | `_dom_renderer-chunk.mjs` 676-716 | Match |
| 19 | `NG05300` text (Q35.16) | `animations-async.mjs` 45 | Match |
| 20 | Async factory imports on first component with `animations` (667) | `animations-async.mjs` 37, 65 | Match |
| 21 | `withConfig({ disableAnimations: true })` selects noop providers (Q35.16) | `animations.mjs` 96-99 | Match |
| 22 | "Intent to remove in v23" (643, Q35.17) | `platform-browser/types/animations.d.ts` 18 | Match |
| 23 | `ng-trigger`, `ng-animating` (671) | `_util-chunk.mjs` 271-274; `browser.mjs` 1736 | Match |
| 24 | `buildKeyframes` folds delay, delay 0 (673) | `browser.mjs` 1245-1275 | Match |
| 25 | No animations schematic (731) | core and `@schematics/angular` collections | Match |
| 26 | `createViewTransition`: UA skip, `setTimeout` without API, render promise, hook after start (855, Q35.19) | router `_router-chunk.mjs` | Match |
| 27 | Router and core have no reduced-motion logic (946) | grep (no match) | Match |
| 28 | Q35.02 events, durations, final opacity | outputs spec | Match |
| 29 | Q35.06, Q35.08, Q35.10 values | outputs spec | Match |
| 30 | Q35.13 values (both tests) | outputs spec | Match |
| 31 | Q35.15 values | `ng test` outputs spec 49-56 | Match |
| 32 | Q35.20, Q35.24 selectors and outcomes | outputs spec | Match |
| 33 | §9 "legacy `main` is larger" (768) | `section-9-migration.spec.ts` 155-158 | Match |
| 34 | `grid-template-rows` Baseline year (741) | SOURCES.md (low 2017) | **Mismatch (F-2)** |
| 35 | Q35.22 "a new session restarts the counter" (1592) | LOG only | **No committed test (T-4)** |
| 36 | `ChangeDetectionSchedulerImpl` microtask or rAF race (1922) | core 19467-19580 | Match |

## Proposed FIX tasks

The module is at 18,594 words; the CLOSE limit is 18,918 and the REVIEW ceiling is 19,618.

Table rows (for the Module 35 table in TASKS.md):

```
| FIX-M35-01 | M | todo | REVIEW-M35 | |
| FIX-M35-02 | S | todo | REVIEW-M35 | |
```

### FIX-M35-01 · M · Q35.11 removal path, §7 re-add condition, Baseline year and marker, terms, internal names, the NG8109 note, Q35.22 follow-up, nits (F-1..F-4, T-1..T-4, N-1..N-7)
- Files: `modules/35-animations.md`; `_meta/LOG.md` (its own line only).
- Do: apply each fix text above; find each line by its quoted text. No lab file, test title or anchor change.
- Acceptance: listed in TASKS.md.
- Model: **Sonnet** (every text is prescribed).

### FIX-M35-02 · S · Anchors for the file-level links into 35 (+0 words)
- Files: link targets only in `modules/10-*.md`, `13-*.md`, `14-*.md`, `18-*.md`, `19-*.md`, `20-*.md` (allowed through this FIX, RUN.md §10).
- Do: apply the Handoffs table (7 rows). Leave the stay-file-level lines alone.
- Model: **Sonnet** (mechanical; slugs listed).

## For Jorge

1. **Carried from CLOSE-M35 and M35.md For Jorge 3-4 (no FIX):** the VERSIONS.md rows (`@angular/animations` 22.2.1 deprecated, "Intent to remove in v23", no `ng generate` migration in 22.2.1; `animate.enter`/`animate.leave` stable since 20.2 with the 22.0 leave-semantics change; `withViewTransitions` developer preview since 19.0); the docs' `animation: none` sentence, now shown by §9's two tests to apply to the callback form only (a possible upstream docs note).
2. **Plan facts wrong (module mostly right):** M35.md's Q35.11 note (the module followed it: F-1) and F11's unconditional "does not leave two copies" (the module's Q35.13 is right, §7 followed the plan: F-3).
3. **C13 rests on reading:** `projects/animations-lab` and `labs/e2e` are untracked, so "append-only" for `app.routes.ts` and `styles.css` cannot be diffed; LOG records two non-append import lines in `app.routes.ts` (SEC-M35-06, SEC-M35-09).
4. **Still blocked elsewhere:** FIX-M33-03's limited-availability marker form; module 35 uses the dated "MDN lists it as limited availability" fallback for `transition-behavior`, `calc-size()` and `interpolate-size`, which that ruling may change.
