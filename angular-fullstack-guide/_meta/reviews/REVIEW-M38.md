# REVIEW-M38: `modules/38-architecture-and-production-structure.md`

- **Reviewer:** a fresh reviewer subagent (claude-opus-5-5) of session S20261018-1122-claudecode. It read and judged the module and ran only read-only scripts; the re-runs belong to the main session, which owns all execution. This reviewer wrote nothing in module 38 and continues none of the PLAN, HOUSE, SEC, EX, QB or CLOSE-M38 conversations, so it is eligible (RUN.md §4).
- **Date:** 2026-10-18.
- **Files read:**
  - the whole module (2,024 lines; line numbers below are as of this review and will move at FIX time);
  - `_meta/modules/M38.md` (F1-F20, C1-C15, the anchor candidates, For Jorge 1-4), QUALITY-BAR, STYLE-GUIDE §3 and §6, RUN.md §10, the module-38 common rules in TASKS.md, HOUSE-39/40, every SEC/EX/QB-M38 entry, CLOSE-M38 and REVIEW-M38, FIX-M37-01..03 (the format model), LOG 1572-1602, `SOURCES.md` `## Module 38` (67 lines), REVIEW-M37 (the format model);
  - module-38 lab files: every spec and test under `labs/angular/src/app/modules/38-architecture-and-production-structure/` and `projects/ui-lib/` (56 distinct titles by script), the `ui-lib` source, the `dist/ui-lib` listing (20 files, including `.npmignore` and the `ex2-a/package.json` stub), `labs/angular/tsconfig.json` (`paths` `ui-lib` and `ui-lib/*`), `angular.json` (8 projects; `labs` has root `""`).
- **Packages read:**
  - in `labs/angular/node_modules`: `ng-packagr` 22.2.1 (`package.transform.js` 115-170, `discover-packages.js` 141-143, `analyse-sources.transform.js` 135-176, `write-package.transform.js` 40-80 and 180-252, `utils/package-json.js` 15-45, `graph/build-graph.js`, `graph/nodes.js` `ng://` URLs); `dependency-graph` 1.0.0 (`DepGraphCycleError`, "Dependency Cycle Found:", 346-347); `@angular/cli` 22.2.1 (`architect-command-module.js` 129-190, `utilities/config.js` 240-286, the `multiTarget` flag of each `commands/*/cli.js`, `commands/lint/cli.js` `missingTargetChoices` 13-16); `@schematics/angular` `library/index.js` 27, 145-169; `@angular/core` (`mergeApplicationConfig`, `core.mjs` 255; `defaultEquals`, `_effect-chunk.mjs` 253; `providerToFactory`, `_pending_tasks-chunk.mjs`); `@angular/router` (`getOrCreateRouteInjectorIfNeeded`, `_router-chunk.mjs` 2766); `typescript` 6.0.3 (`matchPatternOrExact`, 22832);
  - packed with `npm pack` into the scratchpad (not installed): `@nx/eslint-plugin` 23.3.0 (messages 106-122, the relative-import check 160-173, the constraint loop 425-470; `runtime-lint-utils.js` `findDependenciesWithTags` 50, `hasTag` 61, `getTargetProjectBasedOnRelativeImport` 107, `findConstraintsFor` 128); `nx` 23.3.0 (`task-hasher.js` 99-140, `command-line-utils.js` 31, 80 and `parseFiles` 163-194, `affected-project-graph.js` `filterAffected`, `nx-schema` `namedInputs`); `@angular-eslint/eslint-plugin` 22.6.0 (`prefer-on-push-component-change-detection`: description names `ChangeDetectionStrategy.OnPush`, `allowExplicitOnPush` defaults to true); `@storybook/angular` 10.6.2 (peers; only `zone.js`, `@angular/animations` and `@angular/cli` optional; `experimentalZoneless` at 81); `@angular-architects/native-federation` 22.2.2 (peer `@angular/build ~22.2.0`, README 7 and 16, `index.d.ts` `@deprecated` 65).
- **Basis of each finding:** a package source, a committed spec, the module text, SOURCES.md, or a read-only script (grep, sed, awk, python3 word counts, `node labs/tools/module-stats.mjs`, `check-snippets.mjs . 38`, `check-links.mjs --planned`). Nothing was built, run or installed. **Not re-read** (their basis is the SEC/EX/QB LOG lines and SOURCES.md): the angular.dev, nx.dev, Storybook, Prettier, ESLint and Module Federation pages, and the `npm view` registry facts.
- **Probe files:** none in the repository. Scratch scripts, extracts and the five packed tarballs lived in the session scratchpad (`.../scratchpad/r38`) and were deleted. The reviewer created only this file and edited `_meta/TASKS.md`.

Overall, a solid module with no Major finding: every Output value read matches its assertion, all 32 distinct cited test titles exist, the 20 exercise criteria equal their test titles, no lab test touches the network, git, npm, ng, nx, the clock or the environment, and every Nx, ng-packagr, CLI and angular-eslint internal the module names exists in the version it states. Findings:
- **no Major;**
- six Minor factual findings: three reader sentences that report unasserted runs (F-1), a wrong reason for the relative-import report (F-2), the unconstrained-project rule and a follow-up that recommends the opposite of what the rule does (F-3), a short answer that disagrees with its own message list (F-4), the affected file selection without a head (F-5), and §5's "exactly that entry" and file list against the lab (F-6);
- five Minor teaching findings: six answers and two exercises with one follow-up each (T-1), two questions and three exercises not linked from the body (T-2), two undefined terms (T-3), internal names not marked internal (T-4), and Q38.08's "scopes"/"lifetime" mismatch (T-5);
- ten nits and the anchor handoffs (35 rows).

**Plan facts found wrong** (the module already gets each right unless marked): F8's `DependencyCycleError` (the class is `DepGraphCycleError` from `dependency-graph`, message "Dependency Cycle Found: a -> b -> a"); F7's location of the `dependencies` throw (it is `checkNonPeerDependencies` in `write-package.transform.js`, not `package.js` 77); F11's quoted rule description (it names `ChangeDetectionStrategy.OnPush`); C4/F4's `dist` list (it also holds the `.mjs.map`, and `.npmignore` appears once secondary entry points exist; F-6); Lab decision 2 (the lab also needed `ui-lib/*`, as EX-M38-02 recorded; F-1, F-6); F13 (the affected file selection with no `--head` is incomplete; F-5, module wrong too); anchor candidate 12:897 → §4 (the reviewer proposes §5; For Jorge 5).

**Prose:** 20,032 words now (`node labs/tools/module-stats.mjs`; the python counter agrees). The fixes add about +460, for about 20,490: under both the CLOSE limit of 20,775 and the REVIEW ceiling of 21,475.

## Re-runs (main session)

Filled by the main session S20261018-1122-claudecode, serially, while the reviewer read (Node 24.21.0):
- angular `npx ng build ui-lib`: exit 0 (`dist/ui-lib` rebuilt before the specs that read it).
- angular `tsc -p tsconfig.spec.json --noEmit`: exit 0.
- `ng test --watch=false --include 'src/app/modules/38-architecture-and-production-structure/**/*.spec.ts'`: 9 files, 29/29 passed.
- angular `ng build`: exit 0.
- ts-js `vitest run src/modules/38-architecture-and-production-structure`: 12 files, 46/46 passed; ts-js `tsc --noEmit -p .`: exit 0.
- `check-links.mjs --planned`: all links resolve (after re-pointing this file's quoted in-module links to the module file); `check-snippets.mjs . 38`: all snippets check out; `module-stats.mjs`: 38 at 20,032 words, no flags.
- No listener left on ports 4200-4900.

## Reviewer's read-only script results (2026-10-18)

- **module-stats:** `38-architecture-and-production-structure` 29 Q, 4 Ex, 20,032 words, Concept 9, Output 5, Design 5, Trade-off 4, Difference 3, Bug hunt 3, no flag. `check-snippets . 38` "All snippets check out"; `check-links --planned` "All links resolve" (283 planned).
- **Cited test titles:** 32 distinct, 0 missing, from the 56 distinct titles of the module-38 and `ui-lib` specs.
- **Exercise criteria:** 20 of 20 equal test titles (backticks aside).
- **Time, network, processes (C11, C15):** no `fetch` to a remote host, `child_process`, `git`, `npm`, `ng` or `nx` call, `Date.now`, `performance.now`, fake clock or `process.env` read in any module-38 lab file. Exercise 38.4's `toBeLessThan` compares task indexes in a computed order, not times.
- **Markup:** B1: 13 of each of the six subsections; 13 `mermaid` fences and 13 "What to notice" lines; E1: 4 of each bold label; `<details>` 47 open and 47 closed; `Unverified`, `relink:`, `TASK`, `PLACEHOLDER` 0; one `[!NOTE]`, one `[!TIP]`; every best-practice bullet has "because" and every misconception a cause clause (script).
- **Code steps (B5):** 12 of 13 `### Code` subsections have numbered steps (3 or 4); §7 (519) has an Approach line and no steps (N-10).
- **Answer anatomy:** each D1 part counts 29. Answer words (prose outside fences): chunk averages 215.6, 212.6, 213.8, 214.4, 222.6, 217.2; maximum 259 (Q38.22). Q38.06, .08, .09, .26, .28 and .29 have one answered follow-up each; every other answer has at least two. Exercise follow-ups: 2, 1, 1, 2 (T-1).
- **Status markers:** `[Changed in v22.0]` at 142 and 1130; `[Deprecated]` for `@angular-devkit/build-angular` at 633 and 764 and for `@angular/platform-browser-dynamic` at 764; 2 Legacy callouts.
- **Callouts:** Coming from the backend at 217; Framework vs platform at 600.
- **Links:** Q38.10 and Q38.11 are not linked from the body (§4 has no "Drilled in" line); `#ex38-1` is linked nowhere, `#ex38-2` only from Q38.13 (1343), `#ex38-3` from 286, 946 and 1279, `#ex38-4` only from 538 (T-2).
- **SOURCES:** every URL in the module has a line under `## Module 38`; package, registry and lab-file lines present. F-1..F-5 and T-3 add package lines.
- **LOG:** lines 1584 and 1585 are the same SEC-M38-08 line; no SEC-M38-09 line exists. CLOSE-M38's line names no smoke result and states D1 and E1 pass (For Jorge 1, 2).

## QUALITY-BAR

45 items: **38 Pass, 7 Partial (B5, B9, C1, C3, D1, D6, E1), 0 Fail.** H1 and H3 rest on the main session's re-runs.

| ID | Result | Evidence |
|---|---|---|
| A1 | Pass | Lines 3-9: What this covers, Prerequisites, Leads to, Applies to (documented-only tools named), Study time, Short on time, Labs. |
| A2 | Pass | 15 §5 and the other prerequisites anchored. |
| A3 | Pass | Names §1, §3, §5 and the matching questions. |
| A4 | Pass | Contents links 13 sections and the closing parts. |
| A5 | Pass | Folders → components → facades → layers → libraries → API → Nx → MFE → lint → Storybook → CI → tree → under the hood. |
| B1 | Pass | 13 of each subsection (script). |
| B2 | Pass | Each problem opens with a concrete failure (a cross-feature import, a fat component, a broken consumer, a 25-minute pipeline). |
| B3 | Pass | 13 diagrams, each with "What to notice". |
| B4 | Pass | §5, §6, §7, §13 rest on ng-packagr and Nx sources; §9 on angular-eslint; read by the reviewer. |
| B5 | Partial | 12 of 13 Code subsections have numbered steps; §7 has an Approach line only (N-10). |
| B6 | Pass | Every practice has "because" (script). |
| B7 | Pass | Every bullet has a cause clause (script). |
| B8 | Pass | Coming from the backend (217, with where the analogy breaks), Framework vs platform (600), two Legacy callouts. |
| B9 | Partial | `switchMap` (§3) and "named input" (§7) undefined at first use (T-3). |
| B10 | Pass | Owned topics (15, 28, 29, 30, 34, 36, 37) linked, not re-taught. |
| C1 | Partial | 30 of 34 sampled claims match; F-2, F-3, F-4, F-5. |
| C2 | Pass | Q38.05, .09, .13, .16, .25 equal their assertions. |
| C3 | Partial | Three reader sentences report runs no test asserts (F-1); F-6's file list is wider than the `arrayContaining` test. |
| C4 | Pass | Changed in v22.0 and Deprecated markers where due. |
| C5 | Pass | Every API and version checked exists (claims table). |
| C6 | Pass | No `Unverified`; registry facts dated. |
| C7 | Pass | `check-snippets . 38` 0; Partial snippets labelled (N-5 is a clarity nit). |
| C8 | Pass | Every URL in SOURCES.md; FIX-M38-01 adds package lines for F-1..F-5 and T-3. |
| D1 | Partial | 29 of each part, but six answers have one follow-up (T-1). |
| D2 | Pass | Each Output short answer gives values; Q38.16's lacks its reason (N-8). |
| D3 | Pass | Concept 9, Output 5, Design 5, Trade-off 4, Difference 3, Bug hunt 3. |
| D4 | Pass | Q38.01-29 follow the section order. |
| D5 | Pass | M38.md's "not asked here" list holds; no overlap with 15, 30, 36 banks found. |
| D6 | Partial | Q38.10 and Q38.11 not linked from the body (T-2). |
| D7 | Pass | `<a id="q38-NN">` above each question. |
| D8 | Pass | 29 Q, 4 Ex, within ceiling and floor. |
| E1 | Partial | Full anatomy in all four, but Exercises 38.2 and 38.3 have one follow-up each (T-1); 38.1 linked from no section (T-2). |
| E2 | Pass | 20/20 criteria are titles; each account names its runner. |
| E3 | Pass | Folder rule checker → library API → boundary rule → affected and task order. |
| E4 | Pass | Solutions in labs; main's runs. |
| E5 | Pass | Five Output questions. |
| F1 | Pass | Summary restates all 13 sections with links. |
| F2 | Pass | Five prompts naming listeners. |
| F3 | Pass | Seven flashcards, two of them predict/apply. |
| F4 | Pass | Builds on, Read next, Uses these ideas later, Comparisons. |
| G1 | Pass | 20,032 ≤ 20,775; about 20,490 after the fixes, ≤ 21,475. |
| G2 | Pass | The SYLLABUS §4 (38) checkboxes map to §1-§13. |
| H1 | Pass (main) | Main's re-runs. |
| H2 | Pass | `check-links --planned` 0. |
| H3 | Pass (main) | `dist` ignored; main checks `git status`. |

## Module-specific checks

| Check | Result | Evidence |
|---|---|---|
| Library build and consumption (F1-F9) vs specs and `dist` | Pass, two findings | §5, §6, Q38.13, Q38.15 match ng-packagr 22.2.1 and the specs; F-1 (Exercise 38.2 account), F-6 (§5 `paths` and file list). |
| Nx rule semantics (F10-F14) | Partial | Constraint shapes, `onlyDependOnLibsWithTags`, transitive `notDependOnLibsWithTags`, the hash inputs match; F-2, F-3, F-4, F-5. |
| No duration asserted, no throwaway observation (C11) | Pass, one finding | Specs clean; F-1's three sentences. |
| Lab code is our own, labelled "not Nx" (C9) | Pass | §7, §13 and Exercises 38.3-38.4 say the algorithm was read and re-implemented. |
| Documented-only tools labelled (C2, C10) | Pass | Applies to line; §7-§11 say "read, not run" for Nx, angular-eslint, Storybook, Native Federation. |
| Internal names marked (M38.md C8) | Partial | Nine names unmarked (T-4). |
| Status markers (C5) | Pass | 142, 1130, 633, 764. |
| Third-party names neutral, dated (C6) | Pass | No ranking; registry facts dated. |
| Handoffs into 38 honored; anchor proposal per file-level link | Done | Every handoff topic is taught where M38.md says; 03:1032 is a §2 sentence plus Q38.06 (judged acceptable); Handoffs table below (35 rows). |
| Prose at most 21,475 after fixes | Pass | About 20,490. |

## Handoffs

Module 38 slugs:
- S1 `#1-folder-structures-that-scale-by-feature-domain-slices-and-core-shared-and-feature-boundaries`
- S2 `#2-smart-container-and-presentational-components`
- S3 `#3-facades-and-the-data-access-layer`
- S4 `#4-layers-library-types-and-dependency-rules`
- S5 `#5-angular-cli-libraries-ng-generate-library-ng-packagr-and-consuming-the-build`
- S6 `#6-public-api-surfaces-public-apits-exports-secondary-entry-points-and-versioning`
- S8 `#8-micro-frontends-module-federation-native-federation-and-when-they-are-justified`
- S9 `#9-linting-and-formatting-angular-eslint-prettier-import-ordering-and-commit-hooks`
- S10 `#10-storybook-for-component-development`
- S11 `#11-a-ci-pipeline-for-a-front-end-lint-test-build-end-to-end-and-deploy-previews`
- S12 `#12-a-complete-production-folder-tree-folder-by-folder`

| Target | Links (module:line), 35 rows, +0 words |
|---|---|
| S1 | 15:1396, 15:2256 |
| S2 | 03:1032 |
| S3 | 28:1185, 28:2792, 28:2793 |
| S4 | 14:2206 |
| S5 | 12:117, 12:699, 12:897 (plan said §4; For Jorge 5), 12:1861, 36:2314 |
| S6 | 36:1189, 36:2315 |
| S8 | 05:198, 05:907, 05:1680, 37:72, 37:1345, 37:2105, 37:2106 |
| S9 | 17:1189, 37:985 |
| S10 | 30:560 |
| S11 | 30:676, 30:1305, 30:1703, 31:2013 |
| S12 | 10:1400, 13:2514, 24:2979, 29:2998, 29:2999, 30:1704, 34:1944 |

Each link keeps its text; only the target gains the slug. Stay file-level: the headers and Leads to lines (12:5, 15:5, 28:5, 29:5, 30:5, 34:5, 36:5, 37:5).

## Factual findings

**F-1 · Minor (C3, C11) · three reader sentences report runs no committed test asserts.**
- §11 (842): "In this workspace of eight projects, `npx ng build` run at the workspace root resolved to `labs`, the project whose root is the workspace root (recorded by a run on 2026-10-17, not a committed test)." → "In this workspace of eight projects, `npx ng build` at the workspace root resolves to `labs`: the internal `findProjectByPath` (`src/utilities/config.js`) keeps the projects whose `root` contains the working directory, and only `labs` has the workspace root as its `root` (read, not run)." (+8)
- Exercise 38.2 (1841): the paragraph that starts "**What the lab observed** (2026-10-18). With only `"ui-lib": ["./dist/ui-lib"]`" and ends "(listing read, not asserted)." → "**Why the consumer needs a second `paths` entry.** A `paths` key without `*` matches only that exact specifier (`typescript` 6.0.3, `matchPatternOrExact`, internal; read, not run), so `"ui-lib"` alone cannot resolve `ui-lib/ex2-a`. The lab's `tsconfig.json` therefore also maps `"ui-lib/*": ["./dist/ui-lib/*"]`, and the `ng test` spec compiles through it. It reaches the stub `package.json` (`module` and `typings` only) that ng-packagr writes in each secondary entry point's folder (`write-package.transform.js`, read, not run)." (about +0)
- Q38.16 (1397): "Reading the built files, the bundle lists `imports: [UiBadgeDot]` in `UiBadge`'s metadata (partial compilation, [Q12.28](../../modules/12-angular-how-it-works.md#q12-28)), while its declaration names no dependency." → "The bundle's partial declaration of `UiBadge` lists `imports: [UiBadgeDot]` ([Q12.28](../../modules/12-angular-how-it-works.md#q12-28)), while its type declaration names no dependency (read in `dist/ui-lib`, not asserted)." (−3)
- SOURCES.md: `typescript@6.0.3` `matchPatternOrExact`; `@angular/cli@22.2.1` `src/utilities/config.js` `findProjectByPath`; `ng-packagr@22.2.1` `write-package.transform.js` (secondary stub `package.json`, `.npmignore`); each read 2026-10-18.

**F-2 · Minor (C1) · §4 gives a wrong reason for the relative-import report (290).** `@nx/eslint-plugin` 23.3.0 resolves a relative import to the project that owns the file (`getTargetProjectBasedOnRelativeImport`, `runtime-lint-utils.js` 107) and reports it when that project differs from the importer's (rule 160-173), before any constraint is read.
- Fix: "so it bypasses the project's public entry and the graph cannot match it to a project name; the tag rules only apply to imports by package name." → "so it bypasses the project's public entry. The rule still resolves it to the project that owns the file (the internal `getTargetProjectBasedOnRelativeImport`, `runtime-lint-utils.js`) and reports it whenever that project is not the importer's, before any tag is compared." (+14)
- SOURCES.md: `@nx/eslint-plugin@23.3.0` `runtime-lint-utils.js` `getTargetProjectBasedOnRelativeImport`, read 2026-10-18.

**F-3 · Minor (C1) · unconstrained projects and the follow-up that recommends the opposite (§7 503, Q38.19).** The unconstrained check runs only inside `depConstraints.length > 0` (425-430) and applies to any source whose tags match no constraint, untagged ones included. `hasTag` returns true for `*` on every project, tagged or not (61), so a `sourceTag: '*'` constraint matches every source and turns the check off, while `notDependOnLibsWithTags: ['*']` bans every reachable project.
- §7 (503): "- A tagged project that matches no constraint is reported:" → "- Once any constraint exists, a project whose tags match none of them, an untagged one included, is reported on each import of another project:" (+12; the quoted message stays).
- Q38.19 follow-up answer: "Tag every project, and add a `*` constraint that bans untagged projects." → "Write the ban as `notDependOnLibsWithTags: ['*']`: `hasTag` matches `*` on every project the target reaches, tagged or not. A `sourceTag: '*'` constraint would do the opposite: it matches every source, so no project is reported as unconstrained." (+28)

**F-4 · Minor (C1) · Q38.18's short answer and its message list disagree.** The full explanation lists the buildable-lib and transitive-dependency messages; the short answer omits them and ends "and banned external packages", and the last quote is not the `banTransitiveDependencies` text.
- Short answer: "and banned external packages." → "buildable libraries importing non-buildable ones, transitive dependencies missing from `package.json`, and banned external packages." (+12)
- Full explanation: the last quoted message → `"Only packages defined in the "package.json" can be imported."` (abridged; `banTransitiveDependencies`), and add the `bannedExternalImports` message "A project tagged with "{{sourceTag}}" is not allowed to import "{{imp}}"" (+15).
- SOURCES.md: `@nx/eslint-plugin@23.3.0` messages `noTransitiveDependencies` and `bannedExternalImportsViolation`, read 2026-10-18.

**F-5 · Minor (C1, plan F13) · affected file selection with no head.** `parseFiles` (`command-line-utils.js` 163-194): with `--base` and `--head`, the diff between them; with `--base` only, the diff from base to `HEAD` plus uncommitted and untracked files.
- Q38.20 (1477): "`--base` and `--head` choose the files, or uncommitted and untracked files when absent;" → "`--base` and `--head` choose the files; with no `--head`, the diff from the base to `HEAD` plus uncommitted and untracked files (the internal `parseFiles`, `command-line-utils.js`);" (+12)
- §13 misconception (1054): "It compares `--base` with `--head`, or uncommitted and untracked files (§7)." → "It diffs `--base` against `--head`, or, with no head, against `HEAD` plus uncommitted and untracked files (§7)." (+5)
- SOURCES.md: `nx@23.3.0` `command-line-utils.js` `parseFiles`, read 2026-10-18.

**F-6 · Minor (lab consistency, plan F9) · §5 against the lab (349, 351).** The lab's `tsconfig.json` holds `ui-lib` and `ui-lib/*`; the §5 test uses `arrayContaining`, and `dist/ui-lib` now has 20 files.
- 349: "The lab's `tsconfig.json` holds exactly that entry." → "The lab's `tsconfig.json` holds that entry, plus the `ui-lib/*` wildcard that [Exercise 38.2](../../modules/38-architecture-and-production-structure.md#ex38-2) needs for subpaths; both point at `dist`." (+15)
- 351: "observed `README.md`, …, `types/ui-lib.d.ts` (2026-10-17)" → "found `README.md`, …, `types/ui-lib.d.ts` among the output (2026-10-17; the later entry points add their own files)" (+9; the list stays).

## Teaching and completeness findings

**T-1 · Minor (D1, E1) · one follow-up each in six answers and two exercises.** Add one answered follow-up after the existing last one (about +270 in all, about 35 each):
- Q38.06: what signals that a split is due (a second screen needs the view, or a test needs providers only to render it; §2's list test needs none).
- Q38.08: where a use case with real business rules goes (the facade, or a pure function in a util library it calls).
- Q38.09: why the adapter does not throw to the container (the facade turns the failure into state once, so every view reads one error signal).
- Q38.26: why Storybook still needs `@angular-devkit/build-angular` (a non-optional peer `>=18.0.0 < 23.0.0` of `@storybook/angular` 10.6.2; webpack 5 builds the stories).
- Q38.28: where translation files go (`src/locale/`, [34 §6](../../modules/34-i18n.md#6-extraction-and-translation-files-ng-extract-i18n-formats-and-message-ids)).
- Q38.29: why ng-packagr reports no cycle for a relative import between entry points (a relative import is not an edge in its graph; only entry-point imports are).
- Exercise 38.2: why `formatStatus` and `UiStatusConfig` stay out of the public types (test `keeps the internal formatter out of the public types`).
- Exercise 38.3: why the banned-tag check covers reachable projects, not only direct imports (test `reports a dependency on a banned tag reached through another project`; Nx `notDependOnLibsWithTags`, §7).

**T-2 · Minor (D6, E1) · questions and exercises not linked from the body.**
- New line after §4's last misconception (325): "Drilled in [Q38.10](../../modules/38-architecture-and-production-structure.md#q38-10) and [Q38.11](../../modules/38-architecture-and-production-structure.md#q38-11)." (+6)
- §3 (214) "Drilled in …." gains "; practised in [Exercise 38.1](../../modules/38-architecture-and-production-structure.md#ex38-1)" before the final period; likewise §6 (470) with [Exercise 38.2](../../modules/38-architecture-and-production-structure.md#ex38-2), §11 (892) and §13 (1042) with [Exercise 38.4](../../modules/38-architecture-and-production-structure.md#ex38-4) (+12).

**T-3 · Minor (B9) · two terms undefined at first use.**
- §3 (210): after `switchMap` add "(the operator that switches to each new inner stream and cancels the previous one, [23 §1](../../modules/23-rxjs-in-depth.md#1-higher-order-observables-switchmap-mergemap-concatmap-and-exhaustmap))" (+16).
- §7 (510): "the default named input is" → "the default **named input** (a reusable input list that `nx.json` declares under `namedInputs`) is" (+11). Basis: `nx` 23.3.0 `nx-schema`, "Named inputs used by inputs defined in targets"; SOURCES line.

**T-4 · Minor (M38.md C8) · internal names not marked internal.** Insert "the internal" (or the Q38.29 prefix):
- §6 (418): "(the internal `findSecondaryPackagesPaths`)"; §11 (840): "the internal `getProjectByCwd`"; Q38.15 (1379): "The internal `generatePackageExports`"; Q38.19 (1451): "the internal `findConstraintsFor`" and "the internal `hasNoneOfTheseTags`"; Q38.20 (1477): "The internal `filterAffected`"; Q38.29 (1702): prefix the full explanation with "Every function named here is internal."; Exercise 38.4 step 4 (1939): "Nx's internal `DEFAULT_INPUTS`" (+20).

**T-5 · Minor (C1, consistency) · Q38.08 short answer says "scopes", the explanation "lifetime".**
- Short answer: "and scopes differ." → "and lifetimes differ." (0)
- Full explanation: "so the facade has no business invariants to protect; it lives as long as its route injector and pushes changes through signals." → "so the facade has no business invariants to protect and pushes changes through signals." (−8; the lifetime sentence earlier in the answer already says it)

**Nits**
- **N-1:** trailing space after line 378 (`span.ui-badge`.).
- **N-2:** Q38.09 trap (1264) ends with "," → ".".
- **N-3:** §3 Code step 2 (224) → "which extends `OrdersFacadePort`, the class [§2](../../modules/38-architecture-and-production-structure.md#2-smart-container-and-presentational-components)'s page injects." (+3)
- **N-4:** §7 (538) "Exercises 38.3 and [38.4](../../modules/38-architecture-and-production-structure.md#ex38-4)" → "Exercises [38.3](../../modules/38-architecture-and-production-structure.md#ex38-3) and [38.4](../../modules/38-architecture-and-production-structure.md#ex38-4)" (0).
- **N-5:** Q38.13's Partial snippet shows only `"."` in `exports`; add `"./package.json": { … }` and `"./testing": { … }` lines, or a comment that the test asserts `.` exactly and the other keys by containment.
- **N-6:** §9 (688): the basis for `ng lint` offering angular-eslint is `commands/lint/cli.js` (`missingTargetChoices`), not `architect-command-module.js`.
- **N-7:** Q38.27 "retries stay with its owner ([Q30.16])": Q30.17 is the retry policy; → "the e2e stage's workers, shards and retries are [Q30.16](../../modules/30-e2e-and-testing-strategy.md#q30-16)'s" (keep the existing link target as written).
- **N-8 (D2):** Q38.16's short answer gains its reason: "because the types file holds what each entry file exports, while the bundle keeps what that code uses." (+18)
- **N-9 (C10):** §6 "What the lab observed" gains "(after `npx ng build ui-lib`)" (+4).
- **N-10 (B5):** §7 Code (519), after the Approach line: "1. Give each project a `type:` and a `scope:` tag in its `project.json`. 2. List in `depConstraints`, per source tag, the tags it may import. 3. Make `build` cacheable in `targetDefaults` and build dependencies first with `^build`." (as three list lines, +40)

## Judged acceptable

- The `as` casts on `await import(fsSpecifier)` in the specs: a guide-wide pattern that predates 38.
- "only" in Q38.16's short answer: true by the reviewer's read of `dist/ui-lib/types/*.d.ts`.
- Repeated Deprecated and Changed markers (633 and 764; 142 and 1130): each is a first mention in its section.
- §6 has no Framework vs platform callout: optional in M38.md.
- 03:1032's handoff honored as a §2 sentence plus Q38.06, not as a misconception bullet.
- The exercises intro names only Exercise 38.1's runner; each exercise names its runner in "How each criterion is met".
- The hypothetical "25 minutes" in §11's problem: framed as a scenario, not a measurement.
- "instant loop" in Q38.14: qualitative, about the watch cycle.
- `toBeLessThan` in Exercise 38.4 compares task indexes, not times.
- §12's checker "fails on any of the 14 sample folders": the spec's table has 14 entries.

## Claims sampled (34)

| # | Claim (location) | Basis | Result |
|---|---|---|---|
| 1 | `ng g library` writes `ng-package.json`, `public-api.ts`, peers (§5) | `@schematics/angular` `library/index.js` 27, 145-169 | Match |
| 2 | `paths` to `dist`, not source (§5) | lab `tsconfig.json`, §5 spec | Match |
| 3 | `dependencies` throws unless allowed (§5, flashcard) | `write-package.transform.js` `checkNonPeerDependencies` | Match |
| 4 | Output file list (§5) | `dist/ui-lib`, §5 spec | Partial (F-6) |
| 5 | Secondary entry points found by `ng-package.json` files (§6) | `discover-packages.js` 141-143 | Match |
| 6 | Generated `exports` keys `.`, `./package.json`, subpaths (§6, Q38.13, Q38.15) | `write-package.transform.js` 180-252 | Match |
| 7 | Stub `package.json` per secondary folder (Ex 38.2) | `write-package.transform.js` | Match (F-1 wording) |
| 8 | Exact `paths` key without `*` (Ex 38.2) | `typescript` `matchPatternOrExact` | Match (F-1 wording) |
| 9 | Entry-point cycle message (Q38.29, §13) | `dependency-graph` 346-347 | Match |
| 10 | Build graph nodes, `ng://` URLs (§13) | `graph/build-graph.js`, `nodes.js` | Match |
| 11 | Entry points built in dependency order (§13) | `package.transform.js` 115-170 | Match |
| 12 | Imports analysed from sources (§13) | `analyse-sources.transform.js` 135-176 | Match |
| 13 | Partial declaration `imports: [UiBadgeDot]` (Q38.16) | `dist/ui-lib` bundle | Match (F-1 wording) |
| 14 | `ng build` at root picks `labs` (§11) | `config.js` 240-286 | Match (F-1 wording) |
| 15 | `multiTarget` commands (§11) | `commands/*/cli.js` | Match |
| 16 | `ng lint` offers angular-eslint (§9) | `lint/cli.js` 13-16 | Match (N-6 basis) |
| 17 | OnPush rule description, `allowExplicitOnPush` (§9) | `@angular-eslint/eslint-plugin` 22.6.0 | Match |
| 18 | Constraint shapes, `onlyDependOnLibsWithTags` (§7) | rule 425-470 | Match |
| 19 | Transitive `notDependOnLibsWithTags` (§7, Ex 38.3) | `findDependenciesWithTags` 50 | Match |
| 20 | Relative-import report reason (§4) | rule 160-173, `runtime-lint-utils.js` 107 | Mismatch (F-2) |
| 21 | Unconstrained project rule (§7) | rule 425-430 | Mismatch (F-3) |
| 22 | `*` constraint follow-up (Q38.19) | `hasTag` 61 | Mismatch (F-3) |
| 23 | Message list (Q38.18) | messages 106-122 | Partial (F-4) |
| 24 | Affected adds reverse dependents (§7, §13) | `filterAffected` | Match |
| 25 | Affected file selection (Q38.20, §13) | `parseFiles` 163-194 | Mismatch (F-5) |
| 26 | Default named input `{projectRoot}/**/*` (§7) | `task-hasher.js` 99-140 | Match |
| 27 | Command and env in the hash (§13) | `task-hasher.js` `hashCommand` | Match |
| 28 | `@nx/angular` 23.3.0 peers `< 23.0.0` (§7) | SOURCES registry line | Match (not re-read) |
| 29 | Storybook peers, `experimentalZoneless` (§10) | `@storybook/angular` 10.6.2 | Match |
| 30 | Native Federation peer `@angular/build ~22.2.0`, deprecation (§8) | 22.2.2 `package.json`, `index.d.ts` 65 | Match |
| 31 | `mergeApplicationConfig` (§12) | `core.mjs` 255 | Match |
| 32 | Signal equality on the list input (flashcard, Q38.05) | `defaultEquals` 253 | Match |
| 33 | Route injector for a feature facade (§3, Q38.08) | `getOrCreateRouteInjectorIfNeeded` 2766 | Match |
| 34 | Q38.05, .09, .13, .16, .25 values | their specs | Match |

## Proposed FIX tasks

The module is at 20,032 words; the CLOSE limit was 20,775 and the REVIEW ceiling is 21,475.

Table rows (for the Module 38 table in TASKS.md):

```
| FIX-M38-01 | M | todo | REVIEW-M38 | |
| FIX-M38-02 | S | todo | REVIEW-M38 | |
| FIX-M38-03 | S | todo | REVIEW-M38 | |
```

### FIX-M38-01 · M · Unasserted runs, Nx rule facts, affected files, §5 lab, links, terms, internal names, Q38.08, nits (F-1..F-6, T-2..T-5, N-1..N-10)
- Files: `modules/38-architecture-and-production-structure.md`; `SOURCES.md` (the package lines named in F-1..F-5 and T-3); `_meta/LOG.md` (its own line only).
- Do: apply each fix text above; find each line by its quoted text. No heading or anchor change.
- Model: **Sonnet** (every text is prescribed).

### FIX-M38-02 · S · One more answered follow-up in six answers and two exercises (T-1)
- Files: `modules/38-architecture-and-production-structure.md`; `_meta/LOG.md`.
- Do: write the eight follow-ups T-1 names, each about 35 words, from the stated basis.
- Model: **Sonnet** (content prescribed).

### FIX-M38-03 · S · Anchors for the file-level links into 38 (+0 words)
- Files: link targets only in modules 03, 05, 10, 12, 13, 14, 15, 17, 24, 28, 29, 30, 31, 34, 36, 37 (allowed through this FIX, RUN.md §10).
- Do: apply the Handoffs table (35 rows). Leave the stay-file-level lines alone.
- Model: **Sonnet** (mechanical; slugs listed).

## For Jorge

1. **LOG lines 1584 and 1585 are the same SEC-M38-08 line, and no SEC-M38-09 line exists.** LOG is append-only, so no FIX; the main session may add a dated correction line if you want one.
2. **CLOSE-M38's LOG line names no smoke result and states that D1 and E1 pass,** while six answers and two exercises have one follow-up (T-1).
3. **VERSIONS.md rows carried from CLOSE-M38 (no FIX):** ng-packagr 22.2.1, angular-eslint 22.6.0, Nx 23.3.0, Storybook 10.6.2, Module Federation 22.0.0; Native Federation 22.2.2 was also read here.
4. **Third-party tools stay documented only (M38.md For Jorge, still a heads-up):** Nx, angular-eslint, Storybook and Native Federation are read, not installed; the lab re-implements the Nx algorithms as its own code. Veto any name you do not want.
5. **12:897 ("when a library is worth it") is anchored to §5, not the plan's §4:** §5's problem and §12's Growth line answer it, and §4 does not. Say so if you prefer §4.
