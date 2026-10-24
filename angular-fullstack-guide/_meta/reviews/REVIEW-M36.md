# REVIEW-M36: `modules/36-material-and-cdk.md`

- **Reviewer:** a fresh reviewer subagent (claude-opus-5-5) of session S20261017-1049-claudecode. It read and judged the module and ran only read-only scripts; the re-runs belong to the main session, which owns all execution. Module 36 was planned by PLAN-M36 and written by HOUSE-34, HOUSE-35, SEC-M36-01..13, EX-M36-01..04, QB-M36-01..05 and CLOSE-M36. This reviewer wrote nothing in module 36 and continues none of those conversations, so it is eligible (RUN.md §4).
- **Date:** 2026-10-17.
- **Files read:**
  - the whole module (2,317 lines; line numbers below are as of this review and will move at FIX time);
  - `_meta/modules/M36.md` (whole: Handoffs, Lab decision, F1-F22, C1-C15, section map, bank table, Output answers, Exercises, anchor candidates, For Jorge 1-4), QUALITY-BAR, STYLE-GUIDE §3, §4, §6, §7, RUN.md §4-§7 and §10, the TASKS entries REVIEW-M35, FIX-M35-01/02, the module-36 common rules, CLOSE-M36 and REVIEW-M36, LOG 1498-1528 (every HOUSE-34/35, SEC/EX/QB/CLOSE-M36 line), `SOURCES.md` `## Module 36`, REVIEW-M35 (the format model);
  - module-36 lab files: the titles of all 28 spec files by script (96 distinct titles); every e2e spec's `newContext` call, `emulateMedia`, and a grep for `waitForTimeout`, `setTimeout`, `Date.now` and `http`; the `q36-outputs` specs (both runners), `exercise-4-harness/profile-form.spec.ts`, the section specs behind Q36.03, Q36.06, Q36.10, Q36.12, Q36.15, Q36.18, Q36.21, Q36.23 and §1, §2, §3, §11; `projects/material-lab` (`app.config.ts`, routes, `index.html`, `styles.scss`) and a provider grep for animation providers.
- **Packages read (22.2.1, `labs/angular/node_modules`):**
  - `@angular/cdk`: `fesm2022/overlay.mjs` (`createOverlayRef` 2051-2091, `attach` 750-790, dispatcher `add` and `_keydownListener` 415-424, the outside-click listener 489-509, `_updateStackingOrder` 996-1000), the overlay CSS (`z-index: 1000` inside `@layer cdk-overlay`, about 569), `drag-drop.mjs` (no `keydown` handling, drag threshold 891, the preview popover 551), `table.mjs` 1586-1589 and 1871-1880, `clipboard.mjs` 1-51, `layout.mjs` 16-18, 49 (`Handset`), 71-78 (`noopMatchMedia`), `_focus-monitor-chunk.mjs` (`monitor` 151-169, `_getFocusOrigin` 201-216 and 277-279, the directive 359-374 and 392), `testing.mjs` 350-377, `_animation-chunk.mjs`;
  - `@angular/material`: `core/tokens/_system.scss` 64-66, 82, 149, 190-211, 248-256, `button/_button-theme.scss` 87, `core/tokens/_token-utils.scss` 115 (`@error`), the prebuilt themes (no `light-dark(` in any; `indigo-pink.css` 1386-1387), `fesm2022/button.mjs` 72-73 and the `MatButtonModule` exports, `select/testing` 10 and the `MatSelectHarness` chain, `package.json` peer pins;
  - `@angular/aria`: `package.json` imports (cdk a11y, bidi, platform, testing), `types/listbox.d.ts` (defaults: `focusMode` roving, `selectionMode` follow, `softDisabled` true, `typeaheadDelay` 500);
  - `@angular/core`: `fesm2022/_debug_node-chunk.mjs` 4482.
- **Basis of each finding:** a package source, a committed spec, the module text, SOURCES.md, or a read-only script (grep, sed, awk, python3 word count, `node labs/tools/module-stats.mjs`, `check-snippets.mjs . 36`, `check-links.mjs --planned`). Nothing was built, run or installed. **Not re-read** (their basis is the SEC/QB LOG lines and SOURCES.md): the material.angular.dev and angular.dev pages, the components CHANGELOG lines and PR #32209 beyond its tag, the MDN pages and their Baseline statuses, WAI-ARIA APG.
- **Probe files:** none in the repository. Three scratch scripts lived in the job scratchpad (`/Users/jorge.quintero/.claude/jobs/4a727236/tmp`) and were deleted. The reviewer created only this file and edited `_meta/TASKS.md`.

Overall, a carefully sourced module with no Major finding: every Output value read matches its assertion, all 68 distinct cited test titles exist, every Playwright context sets `colorScheme` and `reducedMotion`, no e2e spec waits on time or reaches the network, `material-lab` has no animation provider, and every internal it names exists in 22.2.1 where it says. Findings:
- **no Major;**
- six Minor factual findings: a misconception's dated cause that contradicts the module's own `[Changed in v21.0]` (F-1), `FocusMonitor`'s registration path (F-2), the exercises intro putting Exercise 36.4 in Chromium (F-3), two over-broad ARIA sentences in Q36.03 (F-4), an exercise criterion that says "Material harnesses only" while its test uses a custom harness (F-5, a test-title rename), and §2's diagram label against Q36.03's tested exception (F-6);
- three Minor teaching findings: undefined terms (T-1), internal names without "may change" (T-2), and a follow-up claim no cited test asserts (T-3);
- six nits and the anchor handoffs (24 rows).

**Plan facts found wrong** (the module already corrects each): F8 (the overlay host stays in `.cdk-overlay-container` with popovers on; an insertion point exists only for `inline`/`parent`), F11 (drag listens to mouse and touch events, not pointer events; the threshold is `dx + dy`), F14 (`noopMatchMedia` matches `all` and `''`), F2 (36 `/testing` entries plus `form-field/testing/control`), F4 and §2's misconception cause (the `MATERIAL_ANIMATIONS` token is 20.0; the animations dependency was dropped in 19.2), F20 (`color-scheme` Baseline 2022), F5 (two of the M3 prebuilt themes are dark), the Q36.03 note (no `aria-invalid` when empty and required), the Q36.18 note (End needs `withHomeAndEnd`; `c` goes to Cranberry, 4), §13 (`apply()` runs after the next render, after the dispatcher `add`), F9 (line numbers moved).

**Prose:** 19,506 words now (`node labs/tools/module-stats.mjs`; equal to CLOSE-M36's LOG count). The fixes add about +130, for about 19,640: above the CLOSE limit of 19,516 (which bound CLOSE only) and under the REVIEW ceiling of 20,216.

## Re-runs (main session)

Filled by the main session S20261017-1049-claudecode, serially, while the reviewer read.

Node 24.21.0 (`export PATH=/opt/homebrew/opt/node@24/bin:$PATH`), one at a time:
- `labs/angular`: `npx tsc -p tsconfig.spec.json --noEmit` → 0; `ng test --watch=false` scoped to module 36 → 13 spec files, 42/42 passed; `ng build material-lab` → 0.
- `labs/e2e`: `npx tsc --noEmit` → 0; `caffeinate -dimsu npm test -- tests/36-material-and-cdk --repeat-each=5` → 365 passed (73 × 5), 0 failed, 0 flaky (covers the Q36.06 computed colors and every module-36 e2e value).
- Mermaid 11.12.0 + jsdom 25.0.1 (job scratchpad, deleted): 13/13 parse; the negative control fails as expected.
- `node labs/tools/check-links.mjs --planned` → 0; `node labs/tools/check-snippets.mjs . 36` → 0; `module-stats` 36 → 19,506, Output 8, Concept 7, Bug hunt 4, Difference 3, Trade-off 2, Design 1.
- No listener on ports 4300-4800; `git status --ignored labs` shows only ignored build output, `node_modules` and `labs/e2e/test-results/`.

Reviewer's read-only script results (2026-10-17):
- **module-stats:** `36-material-and-cdk` 25 Q, 4 Ex, 19,506 words, Output 8, Concept 7, Bug hunt 4, Difference 3, Trade-off 2, Design 1, no flag. `check-snippets . 36` 0; `check-links --planned` 0.
- **Cited test titles:** 68 distinct, 0 missing from the 96 distinct titles of the 28 module-36 spec files (`Smoke: …` is the verification paragraph's generic mention).
- **Exercise criteria:** 20 of 20 equal test titles (one title contradicts its own test body: F-5).
- **Contexts, time and network (C10, C11, C15):** 19 `newContext` calls, each setting `colorScheme` and `reducedMotion`; one `emulateMedia` (Exercise 36.1, the color scheme). No `waitForTimeout`, `setTimeout`, `Date.now` or external URL in any module-36 e2e spec; Q36.18's `ng test` fakes `setInterval`, `clearInterval` and `Date`. `material-lab/src/index.html` loads no font.
- **Providers:** no `provideAnimations*`/`provideNoopAnimations` in `material-lab`; motion is turned off only through the route-level `MATERIAL_ANIMATIONS` provider.
- **Markup:** `<details>` 40 open and 40 closed; 13 `mermaid` fences and 13 "What to notice" lines; B1: 13 of each of the six subsections; E1: 4 of each bold label; markers/placeholders/`relink:` 0; `Unverified` 0.
- **Answer anatomy:** each D1 count is 25; every answer has at least two answered follow-ups. Answer words (prose outside fences, the QUALITY-BAR definition): chunk averages 220.6, 218.0, 215.0, 206.4, 212.0 (all ≤ 226), maximum 263 (Q36.11, ≤ 290). With code counted, chunks 3-5 average 230, 233 and 239 (judged acceptable: code is not prose).
- **Status markers:** Stable 5, Added 7, Changed 11, Deprecated 1 (`DragDrop` service, v21.0.6), Baseline 6 (each in the §3.2 form).
- **Callouts:** Framework vs platform at 280, 513, 940; Coming from the backend at 1217 (with "Where the analogy breaks").
- **SOURCES:** all 23 URLs in the module have a line under `## Module 36`; every spec file is listed.
- **`git status`:** `labs/e2e` and `projects/material-lab` are untracked, so C13's "append-only" cannot be diffed; `labs/e2e/test-results` exists while the main session's re-runs are in progress (main checks after).

## QUALITY-BAR

45 items: **41 Pass, 4 Partial (B9, C1, C4, E2), 0 Fail.** H1 and H2 are Pass on CLOSE-M36's run, pending the main session's re-runs above.

| ID | Result | Evidence |
|---|---|---|
| A1 | Pass | Lines 3-9 in §4.1 order; Labs line has the three folders and the run commands. |
| A2 | Pass | 11 §4, 19 §7, 10 §6 and the rest anchored. |
| A3 | Pass | Short on time links §1, §3, §5 and further sections by anchor; the module ends with the Summary and closing sections. |
| A4 | Pass | Contents (11-31) links 13 sections and the five closing sections. |
| A5 | Pass | Layers → Material → theming → CDK primitives → a11y → harnesses → Aria → design system → internals (§13 last). |
| B1 | Pass | 13 of each subsection (script). |
| B2 | Pass | Each problem opens with a concrete failure. |
| B3 | Pass | 13 diagrams, each with "What to notice". |
| B4 | Pass | Each section answers a why from the 22.2.1 source or a run. |
| B5 | Pass | Each Code subsection has numbered steps. |
| B6 | Pass | Every practice has "because". |
| B7 | Pass | Every bullet has a cause or a dated once-true clause; §5's dated clause contradicts the module's marker (F-1), a factual not a structural gap. |
| B8 | Pass | Three Framework vs platform callouts (280, 513, 940); the backend callout (1217) states where the analogy breaks. |
| B9 | Partial | Focus trap and overlay in §1, `ControlValueAccessor` in §11, `Highlightable`, `afterRenderEffect`, `afterNextRender` in the exercises, fake timers in Q36.18 used undefined (T-1). |
| B10 | Pass | Owned topics (10, 11, 19, 25, 29, 31, 34, 35) each get one sentence and a link. |
| C1 | Partial | 31 of 37 sampled claims match; F-1, F-2, F-4, F-6 and T-3 are mismatches or over-reach. |
| C2 | Pass | All eight Output values equal their assertions (read); the Q36.06 hexes need main's run. |
| C3 | Pass | Every "in the lab" sentence names a test; 68/68 titles exist. |
| C4 | Partial | §5's misconception says DOM order decided stacking "until v20" against `[Changed in v21.0]` (F-1); Aria's marker sits mid-answer in Q36.22 (N-3). Every other marker in the §3.2 form. |
| C5 | Pass | Every API checked exists in 22.2.1 (claims list). |
| C6 | Pass | No `Unverified`; no unsourced screen-reader claim (F-4 tightens one wording). |
| C7 | Pass | `check-snippets . 36` 0; Q36.22's HTML in a `ts` fence (N-5). |
| C8 | Pass | 23 URLs, each in SOURCES.md. |
| D1 | Pass | 25 of each part. |
| D2 | Pass | Each Output short answer gives values and a reason (N-6 completes Q36.06). |
| D3 | Pass | Output 8, Concept 7, Bug hunt 4, Difference 3, Trade-off 2, Design 1; max 32%. |
| D4 | Pass | Q36.01-25 follow the section order. |
| D5 | Pass | M36.md's "not asked here" list holds. |
| D6 | Pass | All 25 IDs linked from the body. |
| D7 | Pass | `<a id="q36-NN">` above each question. |
| D8 | Pass | 25 Q, 4 Ex (ceiling and floor). |
| E1 | Pass | Full anatomy in all four (4 of each label). |
| E2 | Partial | 20/20 criteria are titles, but Exercise 36.4's "through Material harnesses only" is not what its test does (F-5); the intro misplaces 36.4's runner (F-3). |
| E3 | Pass | Theme → a select in two implementations → keyboard-reachable drag → harness-only test. |
| E4 | Pass | Solutions in labs; runs are main's. |
| E5 | Pass | Eight Output questions. |
| F1 | Pass | Summary restates all 13 sections with links. |
| F2 | Pass | Five prompts naming listeners. |
| F3 | Pass | Seven flashcards. |
| F4 | Pass | Builds on, Read next, Uses these ideas later, Comparisons, each with a reason. |
| G1 | Pass | 19,506 ≤ 19,516. |
| G2 | Pass | The seven SYLLABUS §4 checkboxes map as M36.md's breadth table says (spot-checked). |
| H1 | Pass (pending) | CLOSE-M36's run; main re-runs. |
| H2 | Pass (pending) | `check-links --planned` 0 (reviewer); main re-runs. |
| H3 | Pass (reviewer) | `dist` ignored; `test-results` during the main session's runs only. |

## Module-specific checks

| Check | Result | Evidence |
|---|---|---|
| HOUSE-34/35 results in every module-36 LOG line | Pass | LOG 1498-1528 name the packages at 22.2.1 and the build or smoke state. |
| Recorded class lists, ARIA values, colors, positions, event fields, key-manager indexes, harness values, error messages (F4, F5, F8-F18, eight Output answers) vs specs | Pass (read) | Q36.03 (blur: `mat-form-field-invalid`, `ng-touched`, no `aria-invalid`; after typing `"false"`), Q36.10, Q36.12, Q36.15, Q36.18 (0, 1, 3; End 4; wrap 0; `c` 4), Q36.21 (message verbatim), Q36.23, §1, §2, §3, §11 values equal their assertions. Q36.06 hexes (#005cbb/#abc7ff) from QB-02's run and the azure palette tones 40/80: main confirms. |
| No duration asserted, no throwaway observation (C11) | Pass, one finding | Specs clean; Q36.23's "each arrow selects" is asserted by no cited test (T-3). |
| No unsourced size, speed or screen-reader claim (C6) | Pass | Q36.03's "announced" reworded to what the DOM exposes (F-4). |
| `colorScheme` and `reducedMotion` in every context (C10) | Pass | 19/19 (script). |
| No network request in any test (C15) | Pass | No external URL; no font in `index.html`. |
| Chromium-only claims labelled (C14) | Pass, one finding | Verification paragraph, §3, §5, §13; the exercises intro (F-3). |
| jsdom vs Chromium apart (F1, C9) | Pass | §10 and Q36.21 keep overlay position in Chromium. |
| Aria status and renames as F18 reads (C5) | Pass | Stable since v22.0; `values` → `value`; defaults roving/follow, `softDisabled` true, `typeaheadDelay` 500 match `listbox.d.ts`. |
| Overlay as popover and docs mismatch (C12) | Pass | §5, §13 and Q36.10 agree with the run and `overlay.mjs`; §5 misconception date (F-1). |
| Shared files only by HOUSE-34/35; append-only (C13) | Pass (read) | `labs/e2e` and `material-lab` untracked; `labs/angular/tsconfig.json` does not reference `material-lab` (For Jorge 3). |
| No animation provider in `material-lab` | Pass | grep above. |
| Owner credit and the 10/11/13/15/16/19/21/29/31/34/35/37/38/39 split (C7) | Pass | One file-level link into a written module (N-1). |
| Internal names marked (C8) | Partial | Six internals lack "may change in any release" (T-2). |
| Status markers (C5) | Partial | F-1, N-3. Patch-level markers have precedent (modules 14, 23, 33). |
| Exercise criteria = test titles; the alternative runs | Partial | 20/20 titles; F-5's title overclaims; alternatives loop over both variants (read); runs are main's. |
| ≥ 2 answered follow-ups | Pass | Script. |
| Terms defined at first use | Partial | T-1. |
| Links into written modules carry anchors | Partial | All but `[25](25-forms-reactive-and-template-driven.md)` in Exercise 36.4 (N-1); file-level only to planned 37/38/39. |
| SOURCES complete | Pass | 23/23 URLs; every spec file. |
| Thirteen Mermaid diagrams parse | Main | Counted 13; F-6 edits one label in §2's diagram, so the parse is re-run after FIX-M36-01. |
| Misconceptions causes; `<details>` closed; type mix | Pass / Pass / Pass | 40/40; max 32%. |
| Prose within 19,516 and ceiling 20,216 | Pass | 19,506; about 19,640 after the FIX (ceiling holds). |
| No stray files; no server left (4300-4800) | Main after re-runs | `dist` ignored; `test-results` present during the runs. |
| File-level links into 36 as anchor candidates | Done | Handoffs below (24 rows). |
| For Jorge 4 (module 11's Aria sentence) applied as ruled | Not ruled | Not applied; For Jorge 1. |

## Handoffs

Module 36 slugs:
- S2 `#2-material-components-in-a-v22-app-standalone-imports-form-fields-dialogs-direction-and-motion`
- S3 `#3-theming-with-material-3-mattheme-system-variables-and-light-and-dark-with-color-scheme`
- S4 `#4-customizing-the-theme-system-and-component-token-overrides-and-theming-your-own-components`
- S5 `#5-portals-and-overlays-where-floating-ui-renders-how-it-is-positioned-and-how-it-closes`
- S7 `#7-tables-and-long-lists-cdktable-datasource-mattable-and-virtual-scrolling`
- S9 `#9-cdk-accessibility-focustrap-focusmonitor-liveannouncer-and-the-key-managers`
- S10 `#10-component-harnesses-for-material-the-cdk-and-your-own-components`

Line numbers were read 2026-10-17; find each line by its context, not its number. Each listed line has exactly one `36-material-and-cdk.md)` link; only its target changes (`36-material-and-cdk.md` → `36-material-and-cdk.md#<slug>`); +0 words. No anchored link into 36 exists yet. The mapping follows M36.md's anchor candidates (10:468, 10:517, 11:369, 11:513, 11:876, 19:807, 25:3072, 26:2100, 29:2999, 31:2013, 34:1813, 35:1990) plus the other lines whose context names a section topic.

| File:line | Context | Anchor |
|---|---|---|
| 10:468 | "Material theming [module 36]" | S3 |
| 10:517 | "and Material theming ([module 36]" | S3 |
| 10:1400 | "(Material tokens and Sass themes)" | S3 |
| 11:167 | "CDK helpers [module 36]" | S9 |
| 11:369 | "`CdkTrapFocus`, `FocusMonitor` and `ListKeyManager` … are [module 36]" | S9 |
| 11:513 | "`LiveAnnouncer` belongs to [module 36]" | S9 |
| 11:876 | "The CDK is [module 36]" | S9 |
| 11:1597 | "(the CDK a11y utilities)" | S9 |
| 13:2514 | "(theming)" | S4 |
| 19:807 | "CDK overlays build on these calls ([36]" | S5 |
| 19:1976 | "Overlays belong to the CDK ([Module 36]" | S5 |
| 19:2527 | "(CDK overlays built on [section 7]" | S5 |
| 25:967 | "`ErrorStateMatcher` of Angular Material is [module 36]'s" | S2 |
| 25:3072 | "(form-field controls)" | S2 |
| 26:2100 | "(Material form fields)" | S2 |
| 29:1335 | "[module 36] owns Material" | S10 |
| 29:2999 | "(Material's component harnesses)" | S10 |
| 31:2013 | "(CDK breadth)" | S7 |
| 34:895 | "[36] owns Material's use" | S2 |
| 34:1813 | "Not covered: Material components ([36]" | S2 |
| 34:1943 | "(components in right-to-left" | S2 |
| 34:1944 | "(Material in RTL)" | S2 |
| 35:1990 | "(components that animate on these rules)" | S2 |
| 35:1991 | "(component motion)" | S2 |

Stay file-level: the headers and Leads to lines (10:5, 11:5, 13:5, 19:5, 25:5, 26:5, 34:5, 35:5); 11:1598, 25:3071, 26:2101 (no reason given); 11:628 (names two layers); 14:2206 (host directives, not taught in 36); 17:2037 (M36.md: no change); 31:354 ("other strategies belong to 36", a promise 36 does not keep: For Jorge 4); 11:217 (For Jorge 4 of M36.md, unruled: For Jorge 1).

## Factual findings

**F-1 · Minor (C4, B7) · §5's misconception dates the DOM-order cause "until v20" (580).** The module marks overlays as popovers `[Changed in v21.0]` (PR #32209 is in the 21.0.0 tag), so v20 is the last release where DOM order decided; "until v20" reads as "before v20".
- Fix: "Once true: DOM order decided it until v20." → "Once true: DOM order decided it through v20; v21.0 made the host a popover." (+7)

**F-2 · Minor (C1) · §9 says `FocusMonitor` classes only elements the directive registers (899).** `_focus-monitor-chunk.mjs` `monitor()` (151-169) registers any element in `_elementInfo`; `cdkMonitorElementFocus` merely calls it for its host. Q36.19 itself uses a manual `monitor()`.
- Fix: "only on elements `cdkMonitorElementFocus` registers (359-374, 392)" → "only on elements registered with `monitor()` (151-169), which `cdkMonitorElementFocus` calls for its host (359-374, 392)" (+9)

**F-3 · Minor (C14, E2) · the exercises intro puts all four exercises in Chromium (1991).** Exercise 36.4 runs under `ng test` (`exercise-4-harness/profile-form.spec.ts`).
- Fix: "Four exercises close the module. Each runs its criteria as tests over a solution and an alternative, in Chromium, on the production build of `material-lab`." → "Four exercises close the module. Each runs its criteria as tests over a solution and an alternative: Exercises 36.1 to 36.3 in Chromium on the production build of `material-lab`, Exercise 36.4 under `ng test`." (+8)

**F-4 · Minor (C1, C6) · Q36.03's full explanation (1422) over-reaches its spec.** The spec asserts `aria-required="true"` before interaction only, and no test or source shows what a screen reader announces.
- Fix 1: "`aria-required="true"` throughout" → "`aria-required="true"` before any interaction" (+2)
- Fix 2: "an empty required input is announced through `aria-required` and the error, not `aria-invalid`" → "an empty required input exposes its state through `aria-required` and the error's `aria-describedby`, not `aria-invalid`" (+3)

**F-5 · Minor (E2, CLOSE-M36 flag) · Exercise 36.4's criterion says "Material harnesses only" (2208), but its test also loads the custom `LabRatingHarness`.** The exercise's point is harness-only access; the word "Material" is wrong. Rename the title and the criterion together.
- Test: in `labs/angular/src/app/modules/36-material-and-cdk/exercise-4-harness/profile-form.spec.ts` (line 24), `it('submits the profile form through Material harnesses only'` → `it('submits the profile form through harnesses only'` (code).
- Module: "- [ ] submits the profile form through Material harnesses only" → "- [ ] submits the profile form through harnesses only" (−1). Any other occurrence of the old title in the module changes the same way. M36.md and LOG are not edited. The main session re-runs module 36's `ng test`.

**F-6 · Minor (C1, CLOSE-M36 flag) · §2's diagram label (138) says `aria-invalid` is true whenever the error shows.** `matInput` binds `aria-invalid` to `(empty && required) ? null : errorState`; Q36.03 asserts it absent for an empty required field.
- Fix: "FF->>DOM: mat-error shown, aria-invalid true, aria-describedby set to the error id" → "FF->>DOM: mat-error shown, aria-invalid true unless empty and required, aria-describedby set to the error id" (code, +0 prose; main re-parses the diagram).

## Teaching and completeness findings

**T-1 · Minor (B9) · seven terms used before any definition.**
- §1 (65): "so it inherits the focus trap and focus return (internal `_trapFocus` and `_restoreFocus`, which may change in any release). Escape arrives through the overlay's `keydownEvents()`;" → "so it inherits the focus trap (code that keeps Tab inside the dialog, [11 §4](../../modules/11-accessibility.md#4-keyboard-focus-order-roving-tabindex-and-focus-traps)) and focus return (internal `_trapFocus` and `_restoreFocus`, which may change in any release). Escape arrives through the `keydownEvents()` of the overlay, the floating layer [§5](../../modules/36-material-and-cdk.md#5-portals-and-overlays-where-floating-ui-renders-how-it-is-positioned-and-how-it-closes) builds;" (+16)
- §11 (1085): "and `CdkListbox` implements `ControlValueAccessor`." → "and `CdkListbox` implements `ControlValueAccessor` (the forms bridge, [25 §10](../../modules/25-forms-reactive-and-template-driven.md#10-controlvalueaccessor-and-the-validator-interface-custom-controls-under-the-hood))." (+4)
- Exercise 36.2 (2092): "takes the `viewChildren` signal of `Highlightable` options; Enter commits `activeItem`." → "takes the `viewChildren` signal of `Highlightable` options (the CDK interface with `setActiveStyles` and `setInactiveStyles`, [§9](../../modules/36-material-and-cdk.md#9-cdk-accessibility-focustrap-focusmonitor-liveannouncer-and-the-key-managers)); Enter commits `activeItem`." (+9)
- Exercise 36.2 (2108): "but the query and the `afterRenderEffect` activating the first wait for the next render" → "but the query and the `afterRenderEffect` (an effect that runs after rendering, [Q17.39](../../modules/17-signals.md#q17-39)) activating the first wait for the next render" (+7)
- Exercise 36.3 (2155): "After `move`, the card calls `afterNextRender` to focus the element with its id." → "After `move`, the card calls `afterNextRender` (a one-time callback after the next render, [20 §4](../../modules/20-lifecycle-and-render-hooks.md#4-render-hooks-afternextrender-aftereveryrender-and-their-phases)) to focus the element with its id." (+10)
- Q36.18 short answer (1759): "Typing `c`: 4, Cranberry, once the fake timers run." → "Typing `c`: 4, Cranberry, once the test's fake timers ([29 §10](../../modules/29-testing-angular.md#10-async-tests-vitest-fake-timers-versus-fakeasync-and-waitforasync)) run." (+3)

**T-2 · Minor (M36.md C8) · internal names without "may change in any release".**
- 147: "(internal `_initializeFocusTrap`)" → "(internal `_initializeFocusTrap`, which may change in any release)" (+5)
- 384: "calls the internal `batch-create-token-values`" → "calls the internal `batch-create-token-values` (may change in any release)" (+5)
- 899: "(201-216, 277-279; internal `_getFocusOrigin`)" → "(201-216, 277-279; internal `_getFocusOrigin`, may change in any release)" (+5)
- 992: "whose internal `_assertResultFound` throws" → "whose internal `_assertResultFound` (may change in any release) throws" (+5)
- 2108: "the internal `ComboboxPattern` keeps keys" → "the internal `ComboboxPattern` (may change in any release) keeps keys" (+5)
- Q36.04 (1440): "). `_getAnimationsState()` stores" → "). The internal `_getAnimationsState()` stores" (+2)

**T-3 · Minor (M36.md C11, C3) · Q36.23's first follow-up (1925) claims "each arrow selects", which the cited roving test does not assert.** Selection on render is asserted by the §11 roles test; selection-follows-focus comes from `types/listbox.d.ts`.
- Fix: "- *And with the defaults, `roving` and `follow`?* The first option is selected on render, DOM focus moves with each arrow and each arrow selects (`Section 11: in roving mode the active option has tabindex 0 and the others -1`)." → "- *And with the defaults, `roving` and `follow`?* The first option is selected on render (`Section 11: ngListbox sets the listbox and option roles on plain elements`) and DOM focus moves with each arrow (`Section 11: in roving mode the active option has tabindex 0 and the others -1`); under `follow` "the focused item is automatically selected" (`types/listbox.d.ts`, read, not run)." (+12)

**Nits (folded into FIX-M36-01):**
- **N-1 (C7, links):** Exercise 36.4 (2252; the module's only file-level link into a written module): "That is the forms way ([25](../../modules/25-forms-reactive-and-template-driven.md))." → "That is the forms way ([25 §10](../../modules/25-forms-reactive-and-template-driven.md#10-controlvalueaccessor-and-the-validator-interface-custom-controls-under-the-hood))." (+1)
- **N-2:** a bare line number without its file (277): "density 0 emits nothing (149)" → "density 0 emits nothing (`_system.scss` 149)" (+1)
- **N-3 (C4):** Q36.22 (1881) puts Aria's marker at the end of a list rather than at the package name. "`@angular/aria` is a set of headless directives" → "`@angular/aria` [Stable since v22.0] is a set of headless directives" and "toolbar and tree [Stable since v22.0]." → "toolbar and tree." (+0)
- **N-4:** the §12 table header (1179) reads as two measures: "| Team size (what it writes) |" → "| Code you write (team size) |" (+0)
- **N-5 (C7):** Q36.22's Partial (1888) is HTML in a `ts` fence. Change the opening "```ts" directly before "// Partial: `selected` is a `signal<string[]>`; the directives add roles, keys and ARIA state." to "```html", and that comment line to "<!-- Partial: `selected` is a `signal<string[]>`; the directives add roles, keys and ARIA state. -->" (code, +0 prose; module 13's `html` Partials are the precedent; `check-snippets . 36` must still pass).
- **N-6 (D2):** Q36.06's short answer (1483) omits the light subtree its test asserts. "`#005cbb` under a light preference, `#abc7ff` under a dark one, and `#abc7ff` inside the `color-scheme: dark` subtree under either, because" → "`#005cbb` under a light preference, `#abc7ff` under a dark one, `#abc7ff` inside the `color-scheme: dark` subtree under either and `#005cbb` inside the `color-scheme: light` one, because" (+9)

## Judged acceptable

- Repeated Aria and `values` markers inside answers: each answer stands alone.
- Patch-level markers (`[Deprecated since v21.0.6]`): precedent in modules 14, 23, 33.
- `FocusTrap`'s marker at the constructor discussion (897); the first mention (147) is a forward pointer.
- The Baseline 2025 marker on the top-layer phrase rather than on `popover`'s first mention.
- §8 "not Baseline and discouraged" (MDN, 2026-10-16) and Q36.16 "Deprecated" (2026-10-17): both in SOURCES.md and compatible.
- Q36.21 citing 29 §11 (stabilization) rather than Q29.33.
- §3's tested misconception replacing the planned one.
- The answer-length metric read as prose-only (QUALITY-BAR's definition).
- EX-M36-02 and SEC-M36-11's multi-edit regions read complete.
- The C12 overlay-docs reading agrees with the run.
- §11 lists eight patterns; Q36.09 cites function start lines.

## Claims sampled (37)

| # | Claim (location) | Basis | Result |
|---|---|---|---|
| 1 | `createOverlayRef` builds pane, host, container (§13) | `overlay.mjs` 2051-2091 | Match |
| 2 | Host shown as a popover on `attach` (§5, §13) | `overlay.mjs` 750-790 | Match |
| 3 | Dispatcher `add`, keydown listener (§5) | 415-424 | Match |
| 4 | Outside-click listener (§5) | 489-509 | Match |
| 5 | `z-index: 1000` in `@layer cdk-overlay` (§5) | overlay CSS | Match |
| 6 | `_updateStackingOrder` (§13) | 996-1000 | Match |
| 7 | Misconception "until v20" (§5) | `[Changed in v21.0]`, PR #32209 in 21.0.0 | **Mismatch (F-1)** |
| 8 | Drag: no keyboard support (§6) | `drag-drop.mjs` (no `keydown`) | Match |
| 9 | Threshold `dx + dy` (§6) | 891 | Match |
| 10 | Preview as popover (§6) | 551 | Match |
| 11 | Table render rows (§7) | `table.mjs` 1871-1880, 1586-1589 | Match |
| 12 | `Clipboard` uses `execCommand` (§8) | `clipboard.mjs` 1-51 | Match |
| 13 | `Handset` query, `noopMatchMedia` (§8) | `layout.mjs` 49, 71-78 | Match |
| 14 | `FocusMonitor` registration (§9) | `_focus-monitor-chunk.mjs` 151-169 | **Partial (F-2)** |
| 15 | `_getFocusOrigin` (§9) | 201-216, 277-279 | Match |
| 16 | `light-dark()` system variables (§3) | `_system.scss` 190-211 | Match |
| 17 | Density 0 emits nothing (§4) | `_system.scss` 149 | Match |
| 18 | Token override `@error` (§4) | `_token-utils.scss` 115 | Match |
| 19 | Prebuilt themes have no `light-dark(` (§3) | prebuilt CSS | Match |
| 20 | `MatButtonModule` exports (§2) | `button.mjs` | Match |
| 21 | Exact CDK peer (§1) | `package.json` | Match |
| 22 | Aria imports CDK a11y, bidi, platform (§11) | Aria `package.json` | Match |
| 23 | Aria defaults (§11, Q36.23) | `listbox.d.ts` | Match |
| 24 | Harness environments TestBed and Selenium (§10) | `testing.mjs` 350-377 | Match |
| 25 | `MatSelectHarness` chain (§10) | `select/testing` | Match |
| 26 | `MATERIAL_ANIMATIONS`, `_getAnimationsState` (Q36.04) | `_animation-chunk.mjs` | Match |
| 27 | Q36.03 values | §2 spec | Match |
| 28 | Q36.03 "`aria-required` throughout", "announced" | §2 spec | **Over-reach (F-4)** |
| 29 | §2 diagram `aria-invalid true` | `matInput` binding | **Partial (F-6)** |
| 30 | Q36.06 values | e2e outputs spec | Match; hexes main |
| 31 | Q36.10, Q36.12, Q36.15 values | outputs specs | Match |
| 32 | Q36.18 indexes | `ng test` outputs spec | Match |
| 33 | Q36.21 message | outputs spec | Match |
| 34 | Q36.23 values | §11 spec | Match |
| 35 | Q36.23 "each arrow selects" | no cited assertion | **Not asserted (T-3)** |
| 36 | Exercises intro "in Chromium" | `profile-form.spec.ts` (`ng test`) | **Mismatch (F-3)** |
| 37 | Exercise 36.4 "Material harnesses only" | `profile-form.spec.ts` uses `LabRatingHarness` | **Mismatch (F-5)** |

## Proposed FIX tasks

The module is at 19,506 words; the CLOSE limit was 19,516 and the REVIEW ceiling is 20,216.

Table rows (for the Module 36 table in TASKS.md):

```
| FIX-M36-01 | M | todo | REVIEW-M36 | |
| FIX-M36-02 | S | todo | REVIEW-M36 | |
```

### FIX-M36-01 · M · §5 date, FocusMonitor, exercises intro, Q36.03, Exercise 36.4 title, §2 diagram, terms, internal names, Q36.23 follow-up, nits (F-1..F-6, T-1..T-3, N-1..N-6)
- Files: `modules/36-material-and-cdk.md`; `labs/angular/src/app/modules/36-material-and-cdk/exercise-4-harness/profile-form.spec.ts` (the one title, F-5); `_meta/LOG.md` (its own line only).
- Do: apply each fix text above; find each line by its quoted text. No anchor change.
- Acceptance: listed in TASKS.md.
- Model: **Sonnet** (every text is prescribed).

### FIX-M36-02 · S · Anchors for the file-level links into 36 (+0 words)
- Files: link targets only in modules 10, 11, 13, 19, 25, 26, 29, 31, 34, 35 (allowed through this FIX, RUN.md §10).
- Do: apply the Handoffs table (24 rows). Leave the stay-file-level lines alone.
- Model: **Sonnet** (mechanical; slugs listed).

## For Jorge

1. **For Jorge 4 of M36.md is unruled; not applied.** CLOSE-M36 and SEC-M36-11 propose changing module 11's line 217 "(typings read 2026-10-07; status not read)" to "stable since v22.0 (components CHANGELOG 22.0.0)" and linking it to `36-material-and-cdk.md#11-angular-aria-headless-signal-driven-aria-patterns`. Once ruled, it can be a one-line FIX.
2. **VERSIONS.md rows carried from CLOSE-M36 (no FIX):** `@angular/aria` 22.2.1; Angular Aria developer preview in v21, stable in v22.0; CDK overlays as popovers [Changed in v21.0]; the `DragDrop` service [Deprecated since v21.0.6].
3. **`labs/angular/tsconfig.json`** references the `tsconfig.app.json` of the ssr, security, i18n and animations labs but not `material-lab`'s. Editors only (builds pass); HOUSE-35 did not add it.
4. **31:354** says "other strategies belong to [36]", but 36 §7 teaches no other virtual-scroll strategy: either module 31's sentence changes or 36 §7 gains one sentence. Left file-level.
5. **C13 rests on reading:** `labs/e2e` and `projects/material-lab` are untracked, so "append-only" cannot be diffed.
6. **`labs/e2e/test-results`** exists while the main session runs; main removes it after.
