# REVIEW-M39: `modules/39-version-history-and-migrations.md`

- **Reviewer:** a fresh reviewer subagent (claude-opus-5-5) of session S20261020-0458-claudecode. It read and judged the module and ran only read-only scripts and source reads; every test, build and job-state update belongs to the main session. This reviewer wrote nothing in module 39 and continues none of the PLAN, SEC, EX, QB or CLOSE-M39 conversations, so it is eligible (RUN.md §4).
- **Date:** 2026-10-20.
- **Files read:**
  - the whole module (1,950 lines; line numbers below are as of this review and will move at FIX time);
  - `_meta/modules/M39.md` (F1-F21, C1-C15, Lab decision, Handoffs into 39, anchor candidates, For Jorge 1-4), QUALITY-BAR, STYLE-GUIDE §3, RUN.md §1, §4, §5, §10, the module-39 common rules and REVIEW-M39 in TASKS.md, REVIEW-M38 and its FIX tasks (the format model), the PLAN, SEC, EX, QB and CLOSE-M39 LOG lines (1614, 1621-1629, 1637-1645, 1649-1652), `SOURCES.md` `## Module 39` (99 lines), SYLLABUS §4 (39) and §5;
  - every module-39 lab file: 40 under `labs/ts-js/src/modules/39-version-history-and-migrations/` (support helpers, concepts, fixtures, outputs, four exercises) and 10 under `labs/angular/src/app/modules/39-version-history-and-migrations/` (legacy, migrated, concepts and both specs); 48 distinct test titles by script.
- **Sources read (2026-10-20):**
  - in `labs/angular/node_modules` (read-only): `@angular/cli` 22.2.1 `src/commands/update/{cli.js 75-85, 340-395; update-resolver.js 195-255, 466-520; utilities/migration.js 100-140, 233-270; utilities/cli-version.js 59-70, 181-195}`, `src/utilities/{tty.js, environment-options.js}`; `@angular-devkit/schematics` 22.2.1 `src/engine/engine.js` 257-266, `tools/file-system-engine-host-base.js` 86-98; `@angular/core` 22.2.1 `schematics/migrations.json` (descriptions and factories), `schematics/bundles/{change-detection-eager,incremental-hydration,safe-optional-chaining,strict-templates-default,http-xhr-backend}.cjs` (which read the tree and which the disk);
  - packed into the job scratchpad (`npm pack`, deleted): `angular@1.8.3` `angular.js` (`TTL` 18512, `$digest` 19308-19312, `beginPhase` 19886-19888, `extractArgs` 4341, `annotate` doc 4437, `angular.module` doc 2270, `ngIf` doc 29590, `ngModelWatch` 31284); `@angular/upgrade@22.2.1` `fesm2022/static.mjs` 821-826, 1105-1125, `types/static.d.ts` 364-377, 720-738, 834-852, 1025, `package.json` peers;
  - raw GitHub, read 2026-10-20: `angular/angular` `CHANGELOG.md` (14.0.0, 14.1.0, 15.0.0, 15.1.0, 16.0.0, 17.0.0, 18.0.0, 19.0.0, 20.0.0, 20.2.0, 21.0.0, 21.2.0, 22.0.0) and `CHANGELOG_ARCHIVE.md` (2.0.0, 2.4.0, 4.0.0-beta.0, 4.0.0-rc.1, rc.3, 4.0.0, 4.3.0, 5.0.0, 6.0.0, 8.0.0, 9.0.0, 10.0.0, 11.0.0, 13.2.0); `angular/angular-cli` `CHANGELOG.md` (12.0.0, 13.0.0, 16.0.0, 17.0.0, 19.0.0, 21.0.0, 22.0.0); `angular/components` `CHANGELOG.md` (13.2.2, 15.0.0, 17.0.0, 18.0.0); `adev/src/content/reference/{releases,versions}.md`, `adev/src/content/guide/zoneless.md`, `adev/src/content/reference/migrations/{route-lazy-loading,standalone,signal-inputs}.md`, `adev/src/app/features/update/{update.component.ts,recommendations.ts}` (main); `aio/content/guide/{upgrade,ajs-quick-reference}.md` at tag 16.2.0; `angular/angular.js` `README.md` and `docs/content/misc/version-support-status.ngdoc` (master);
  - registry (`npm view`, 2026-10-20): `angular` `deprecated`, `version`; `@angular/platform-browser-dynamic@22.2.1` `deprecated`; `@angular/core` `version` (22.2.3), `time` 2.4.10 and 4.0.0; `@angular/router@3` versions.
- **Basis of each finding:** a package source, a committed test, a dated docs or changelog read, or a read-only script (`node labs/tools/module-stats.mjs`, `check-snippets.mjs . 39`, `check-links.mjs --planned`, grep, awk, python3 counts). Nothing was built, tested or installed. **Not re-read** (their basis is the SEC/EX/QB LOG lines and SOURCES.md): the CLI v6.0.0, v7.0.1, v8.0.0 and v10.0.0 GitHub release notes (§4, §5 v10 row), the 9.1.0 Ivy guide, the control-flow, inject, outputs and signal-queries migration pages, MDN pages, `semver` 7.8.5 and the ECMA-262 stable-sort read.
- **Probe files:** none in the repository. The fetched docs, changelogs and the two packed tarballs lived in `/Users/jorge.quintero/.claude/jobs/4a727236/tmp/rv39` and were deleted. The reviewer created only this file and edited `_meta/TASKS.md`.

Overall, an accurate module with no Major finding: every one of the 28 cited test titles and 20 exercise criteria exists verbatim; every Output short answer and every "the test finds…" sentence matches its assertion except one exercise account (F-4); every matrix row sampled traces to a changelog entry under the stated heading, a registry read or an owner marker; no test calls the network, `git`, `npm` or `ng`, reads the clock or `process.env`, and the four core migrations the tests run read the in-memory tree (`runMigrationInDevkit`), not the disk; both cross-lab helpers fail with "run `npm ci` in labs/angular first"; AngularJS and ngUpgrade are "read, not run" throughout, and our digest model, selector, classifier, planner and range check are named as ours in every sentence that reports their output. Findings:
- **no Major;**
- five Minor factual findings: §6's "only v22 changes a default old code already uses" (v19 did too; F-1), the standalone docs' "verify between steps" generalized to every schematic (F-2), the January 2022 date credited to the npm notice, which has no date (F-3), Exercise 39.2's Node account against its test (F-4), and the Summary and Q39.04's "12 months active and 12 in LTS" against §3's own trap (F-5);
- four Minor teaching findings: status markers not in the STYLE-GUIDE §3.2 forms or missing at first mention (T-1), five terms used before they are defined (T-2), four internal names in Exercise 39.4 not marked internal (T-3), two misconceptions whose cause clause is attached to the correction (T-4);
- eleven nits and the anchor handoffs (21 rows).

**Plan facts found wrong or superseded** (the module already gets each right): F7/Q39.14's plan order (`use-application-builder` first): ties follow name order (`listSchematicNames` sorts), SEC-M39-12 recorded it; F18's "`tsconfig.json`": the migration writes each build target's tsconfig (SEC-M39-11); F17's `getAngularLib`/`setAngularLib` are still exported and `@deprecated` in the 22.2.1 typings although the 22.0.0 changelog says they "have been removed" (the module does not mention them; no FIX); anchor candidates 12:123 (→ §8, not §7) and 36:2315 (→ §6, not §5) (For Jorge 1).

**Prose:** 19,171 words now (`node labs/tools/module-stats.mjs`; the QUALITY-BAR python counter agrees). The fixes add about +190, for about 19,360: under the REVIEW ceiling of 20,189.

**The CLOSE-M39 open point on Q39.22** (heading says `tsconfig.json`, answer and §11 say the build target's tsconfig): judged acceptable as an Output question whose answer is "unchanged"; the short answer states it, and the full explanation says "the file the question names is read, not changed". N-7 makes the trap explicit (+18).

## Re-runs (main session)

Reported by the main session on 2026-10-20 (Node 24), before this review: ts-js `vitest run src/modules/39-version-history-and-migrations` 13 files 64/64; ts-js `tsc --noEmit` 0; angular `ng build ui-lib` 0, `ng test --include 39/**` 2 files 4/4, `tsc -p tsconfig.spec.json` 0. No re-run is requested by this review: every finding is a text change.

## Reviewer's read-only script results (2026-10-20)

- **module-stats:** `39-version-history-and-migrations` 25 Q, 4 Ex, 19,171 words, Concept 7, Bug hunt 4, Design 4, Output 4, Difference 3, Trade-off 3, no flag. `check-snippets . 39` "All snippets check out"; `check-links --planned` "All links resolve" (280 planned).
- **Cited test titles:** 28 distinct in the module, 0 missing, from the 48 distinct `it(…)` titles of the module-39 specs and tests.
- **Exercise criteria:** 20 of 20 equal test titles.
- **Time, network, processes (Lab decision 5, C11, C15):** no `fetch`, `child_process`, `exec`/`spawn`, `Date`, `performance.now`, fake timers, `process.env` or `process.cwd` in any module-39 lab file; the only URLs are fixture header comments and the CLI message under test. The four core migrations run in tests (`change-detection-eager`, `strict-templates-default`, `incremental-hydration`, `safe-optional-chaining`) and the two `ng generate` schematics run in Exercise 39.4 (`signal-input-migration`, `output-migration`, and `signals`) read the tree; `control-flow` and `inject`, which read the disk through `ts.sys` relative to `process.cwd()`, are not run, as Exercise 39.4 says.
- **C10:** `support/angular-node-modules.ts` `locate` throws "run `npm ci` in labs/angular first" when `labs/angular/node_modules` or the file is missing; `support/run-schematic.ts` `load` throws "cannot load <id>: run `npm ci` in labs/angular first" and is called before `collectionPath`; `section-3-support.test.ts` and `section-6-installed.test.ts` throw the same message from their own guards. No test skips.
- **Markup:** B1: 12 of each of the six subsections; 12 `mermaid` fences and 12 "What to notice" lines; D1: 25 of each answer part; every answer and every exercise has at least two answered follow-ups (script); every best-practice bullet has "because" (script); every misconception has a cause clause (two misattached, T-4); `Unverified`, `relink:`, `TASK`, `PLACEHOLDER` 0; two Framework vs platform callouts (170, 724); two `#### Legacy` (425, 882).
- **Links:** every Q39 ID is linked from the body; Exercise 39.1 once, 39.2 three times, 39.3 once, 39.4 twice (both in §10; §11 and §3 lack their "practised in", N-6).
- **SOURCES:** every URL in the module has a line under `## Module 39`.
- **Status markers:** 44 markers; six `[Changed in …]` without the required ": …" text, and five APIs in the matrices without a marker (T-1).

## QUALITY-BAR

45 items: **37 Pass, 8 Partial (B7, B9, C1, C3, C4, C8, D6, F1), 0 Fail.** H1 and H3 rest on the main session's runs.

| ID | Result | Evidence |
|---|---|---|
| A1 | Pass | Lines 3-9 in order; Applies to names the documented-only parts. |
| A2 | Pass | 15 §7, 21 §6, 12 §2 anchored. |
| A3 | Pass | §3, §6, §7, §10; six questions; Summary. |
| A4 | Pass | 12 sections and the five closing parts. |
| A5 | Pass | AngularJS → rewrite → policy → matrix in time order → one hop → many hops → AngularJS migration → program → v22 step → internals. |
| B1 | Pass | 12 of each subsection (script). |
| B2 | Pass | Each problem is a concrete failure (stale timer value, infdig, refused update, removed `ComponentFactoryResolver`, unreviewable diff). |
| B3 | Pass | 12 diagrams, each followed by "What to notice". |
| B4 | Pass | Every section answers a "why" from a named source (`angular.js` 1.8.3, `static.mjs`, `cli.js`, `update-resolver.js`, `migration.js`, the migration bundles, `update.component.ts`, changelog entries). |
| B5 | Pass | All 12 `### Code` have an Approach line and numbered steps (walked). |
| B6 | Pass | Every item has "because" (script). |
| B7 | Partial | Causes present everywhere; two attached to the correction (T-4). "Once true" items carry versions (§3, §5). |
| B8 | Pass | Framework vs platform at 170 and 724; SYLLABUS §4 (39) names no backend comparison. |
| B9 | Partial | zone.js (§1), standalone (§5), migration, incremental hydration and `strictTemplates` (§6) used before definition (T-2). |
| B10 | Pass | Owner topics (12, 15, 17, 18, 19, 21, 27, 29, 32, 35, 36, 38) get a sentence and a link. |
| C1 | Partial | 37 of 42 sampled claims match; F-1, F-2, F-3, F-5 (and nits N-2, N-3, N-9). |
| C2 | Pass | Q39.14, Q39.22, Q39.23, Q39.24 short answers equal their assertions. |
| C3 | Partial | Every "the test finds" sentence matches, except Exercise 39.2's Node account (F-4). |
| C4 | Partial | Six `[Changed in …]` without ": …"; `Eager` 21.2 without `[Added in v21.2]`; `provideRoutes()`, HammerJS integration, webpack builders, `ViewEncapsulation.Native`, the v18 zoneless provider without markers (T-1). |
| C5 | Pass | Every API named exists in 22.2.1 or is marked removed and non-compiling (§5 Legacy). |
| C6 | Pass | No `Unverified`. |
| C7 | Pass | `check-snippets . 39` 0; AngularJS, JSON and shell snippets Partial with their source. |
| C8 | Partial | URLs all in SOURCES.md (pass); M39.md C8 internal names: four unmarked in Exercise 39.4 (T-3). |
| D1 | Pass | 25 of each part; at least two answered follow-ups everywhere. |
| D2 | Pass | Each Output short answer gives the result and the reason; Q39.24's "absent" vs "dropped" is a wording nit (N-8). |
| D3 | Pass | Six tags, max 28%. |
| D4 | Pass | Q39.01-25 follow the section order. |
| D5 | Pass | Q39.25 goes below Q12.05 (range, own-major collection) and links it; Q18.23 linked from Q39.20, §10 and Connections, not re-asked; no other overlap in `### Q` headings (Q40.11 belongs to 40). |
| D6 | Partial | Every question linked; Exercise 39.2 not linked from §3 and Exercise 39.4 not from §11, both of which they apply (N-6). |
| D7 | Pass | `<a id="q39-NN">` above each question. |
| D8 | Pass | 25 Q, 4 Ex. |
| E1 | Pass | Full anatomy in all four; two answered follow-ups each. |
| E2 | Pass | 20/20 criteria are titles; each account names its tests. |
| E3 | Pass | One loop → planner over a table → graph scheduler → real schematics on a real legacy feature. |
| E4 | Pass | Solutions in labs, no `any`, no `as` beyond `as const`; main's runs. |
| E5 | Pass | Four Output questions. |
| F1 | Partial | Summary links all 12 sections, but its "12 months active and 12 in LTS" restates the generic policy that §3's trap warns against (F-5). |
| F2 | Pass | Four prompts naming listeners. |
| F3 | Pass | Six flashcards. |
| F4 | Pass | Builds on, Read next, Uses these ideas later, Comparisons. |
| G1 | Pass | 19,171 ≤ 19,489; about 19,360 after the fixes, ≤ 20,189. |
| G2 | Pass | 5/5 SYLLABUS §4 (39) checkboxes (walked against the sections, questions and exercises). |
| H1 | Pass (main) | Main's runs of 2026-10-20. |
| H2 | Pass | `check-links --planned` 0. |
| H3 | Pass (main) | Main checks `git status`. |

## Module-specific checks

| Check | Result | Evidence |
|---|---|---|
| Matrix versions, dates and statuses (§4-§6, Q39.06-Q39.10) traced to F9-F15, F20 or a dated C1 read (C1) | Pass, one finding | Release days equal the changelog headings; every sampled cell sits under its stated heading (table below); statuses come from owner markers or entries; F-1 is a "What to notice" sentence, not a row. |
| No motive for the rewrite without a source (C3) | Pass | §2 states "No official text read here states the motives"; Q39.03 and its trap say the same; §4's "why" cells quote entries or say "none stated". |
| AngularJS and ngUpgrade never observed; our models named as ours (C9, C14) | Pass | §1, §2, §9, Q39.01-Q39.03, Q39.17, Exercise 39.1 say "read, not run" or "our model"; §12, Q39.14, Q39.24, §8, Q39.11, Q39.15, Exercise 39.2 name our selector, classifier, planner and range check. |
| Migration lists, orders and edits (§7, §11, Q39.14, Q39.22-Q39.24, Exercise 39.4) against the committed tests | Pass | Each listed name, order and edit equals the assertion (Section 7, Section 11, Section 12, the five Q39 outputs, Exercise 39.4's five criteria). |
| No network, `git`, `npm`, `ng`, clock (Lab decision 5) | Pass | Script above; no disk-reading migration runs. |
| Cross-lab read fails with the C10 message | Pass | Helpers above. |
| No duration, no library-lag claim (C6, C11) | Pass | §8 "No source read here says how soon libraries follow a major"; peer ranges invented and said so. |
| Docs versus package (C12) | Pass, one nit | Node `^26.0.0` vs `>=26.0.0` (§6), the build tsconfig (§11); §6 quotes the migration description "in tsconfig.json" without the §11 caveat (N-4). |
| Handoffs into 39 honored; Q18.23 not re-asked; anchor per file-level link | Done | Every handoff topic is taught where M39.md says (12 → §7/§8, 15/17/18/19 → §10, 21 → §1, 35 → §6/§10, 36 → §5/§6, 37 → §3, 38 → §7/§12); Handoffs table below (21 rows). |
| Prose at most 20,189 after fixes | Pass | About 19,360. |

## Handoffs

Module 39 slugs:
- S1 `#1-angularjs-scopes-watchers-and-the-digest-cycle`
- S3 `#3-how-angular-ships-semantic-versioning-the-release-cadence-support-windows-and-the-deprecation-policy`
- S6 `#6-the-version-matrix-part-3-v16-to-v22-from-signals-to-onpush-by-default`
- S7 `#7-updating-in-practice-ng-update-migration-schematics-and-the-update-guide`
- S8 `#8-skipping-versions-safely-one-major-per-hop-node-and-typescript-ranges-and-libraries-that-block-a-hop`
- S10 `#10-a-migration-program-for-an-old-angular-codebase-order-dependencies-and-checkpoints`
- S12 `#12-under-the-hood-how-ng-update-selects-migrations-and-how-the-update-guide-builds-its-checklist`

Re-located 2026-10-20: every candidate is still at the line PLAN-M39 recorded.

| Target | Links (module:line, context), 21 rows, +0 words |
|---|---|
| S1 | 21:2710 ("(the AngularJS digest, the version matrix)") |
| S3 | 37:2106 (Uses these ideas later, `[39]` after "(Elements as an integration)") |
| S6 | 35:1990 ("(the deprecation of `@angular/animations` in context)"), 36:2315 ("(Material's move from M2 to M3)"; plan said §5, For Jorge 1) |
| S7 | 12:919 ("Upgrade practice is [module 39]"), 12:1861 ("(`ng update` practice)"), 38:428 ("Migrations ship as `ng update` schematics"), 38:1428 ("ship an `ng update` migration schematic with the major"), 38:2040 (Read next, "(keeping the workspace current across majors)") |
| S8 | 12:123 ("`ng update` refuses to cross several majors at once; the practice is [module 39]"; plan said §7, For Jorge 1) |
| S10 | 15:695, 15:1620, 15:1638, 15:2255, 17:1882, 18:931, 18:1933, 18:2610, 19:2527, 35:1991 ("(the migration)") |
| S12 | 38:2041 (Uses these ideas later, "(migrating libraries)") |

Each link keeps its text; only the target gains the slug. Stay file-level: the header Leads to lines (12:5, 15:5, 18:5, 21:5, 35:5, 36:5, 38:5) and 21:2711 (a list of module numbers). `modules/40-framework-comparisons.md` has no link into 39 yet.

## Factual findings

**F-1 · Minor (C1) · §6 "What to notice" says only v22 changed a default old code relies on (471).** The 19.0.0 core entry (angular CHANGELOG.md, read 2026-10-20) says "Angular directives, components and pipes are now standalone by default. Specify `standalone: false` for declarations that are currently declared in `@NgModule`s. `ng update` for v19 will take care of this automatically." The module's own v19 row and Q39.16 say the same.
- Fix: "and only v22 changes a default old code already uses." → "and v19 (`standalone`) and v22 (OnPush, `strictTemplates`) also flip defaults that old code relies on, with `ng update` writing the old value back both times (19.0.0 and 22.0.0 entries)." (+18)
- SOURCES.md: `angular/angular` CHANGELOG.md 19.0.0 core breaking change ("now standalone by default", "`ng update` for v19 will take care of this automatically"), read 2026-10-20, section 6.

**F-2 · Minor (C1, attribution) · "the standalone docs say to run one at a time and verify between runs".** `adev/src/content/reference/migrations/standalone.md` (read 2026-10-20) says "Run the migration in the order listed below, verifying that your code builds and runs between each step", about the standalone schematic's own three steps, not about running every schematic separately.
- §10 misconception (918): "Run one at a time and verify between runs (standalone docs); a combined run hides which step broke a test." → "The standalone docs run its three steps in order, \"verifying that your code builds and runs between each step\"; one schematic per commit applies that to the whole program (our recommendation), and a combined run hides which step broke a test." (+16)
- Q39.21 full explanation (1529): "The standalone docs say to run one at a time and verify between runs." → "The standalone docs verify the build \"between each step\" of their own three steps; one schematic per commit applies that to the program (our recommendation)." (+9)
- Q39.21 trap (1535): "the docs say to run one at a time and verify between runs." → "even the standalone docs verify the build between their own three steps." (−1)

**F-3 · Minor (C1 basis) · the January 2022 end of support is credited to the npm notice (39).** `npm view angular deprecated` (2026-10-20): "For the actively supported Angular, see https://www.npmjs.com/package/@angular/core. AngularJS support has officially ended. For extended AngularJS support options, see https://goo.gle/angularjs-path-forward." It carries no date; `angular/angular.js` `README.md` and `docs/content/misc/version-support-status.ngdoc` say "AngularJS support has officially ended as of January 2022" (read 2026-10-20). Q39.18 already cites the support page.
- Fix: "(npm deprecation notice for `angular`, read 2026-10-18; documented only, never run here)" → "(AngularJS `README.md` and its version-support page, read 2026-10-18; npm marks `angular` deprecated; documented only, never run here)" (+6)
- SOURCES.md: `angular/angular.js` `README.md` and `docs/content/misc/version-support-status.ngdoc` ("AngularJS support has officially ended as of January 2022"), read 2026-10-20, section 1; correct the section 1 `npm view angular deprecated` line so it no longer implies the date.

**F-4 · Minor (C3) · Exercise 39.2's Node account (1762) against its test.** The test asserts `misfits(13, 22, '18.19.1')` = `[14, 20, 21, 22]` and `misfits(20, 22, '22.12.0')` = `[22]`. Read as written ("with 22.12.0, only hop 22"), the second clause would cover 13 to 22, where Node 22.12.0 also fails the 14.0.x to 17.0.x rows.
- Fix: "- Node: with Node 18.19.1, hops 14, 20, 21 and 22 are outside their rows; with 22.12.0, only hop 22." → "- Node: from 13 to 22 with Node 18.19.1, hops 14, 20, 21 and 22 are outside their rows; from 20 to 22 with Node 22.12.0, only hop 22 (the 21.x row accepts `^22.12.0`)." (+10)

**F-5 · Minor (C1, F1) · "a major lasts 12 months active and 12 in LTS" in the Summary (1103) and Q39.04's short answer (1194).** §3, its best practice, Q39.04's full explanation and trap all say to plan from the table, where v20 and v21 get 18 and 19 months (`Section 3: our support table puts v22 in active support and v20 and v21 in LTS on 2026-10-18`).
- Summary: "Versions are `major.minor.patch`, a major lasts 12 months active and 12 in LTS, and a deprecated API stays through at least the next major" → "Versions are `major.minor.patch`; the policy gives a major 12 months active and 12 in LTS, but the table gives v20 and v21 18 and 19 months in all, so plan from the table; a deprecated API stays through at least the next major" (+15)
- Q39.04 short answer: "A major is active for 12 months, then in LTS for 12 more, with only critical and security fixes." → "The policy gives a major 12 months active, then 12 in LTS with only critical and security fixes; the table gives v20 and v21 less." (+6)

## Teaching and completeness findings

**T-1 · Minor (C4) · status markers not in the STYLE-GUIDE §3.2 forms, or missing at first mention.** STYLE-GUIDE §3.2: `[Changed in vX: …]`; `[Added in vX.Y]` for an addition in a minor; `[Removed in vX]`; `[Experimental since vX]`. Bases: angular CHANGELOG.md 21.2.0 ("add ChangeDetectionStrategy…"), 22.0.0 ("`provideRoutes()` has been removed", "Hammer.js integration has been removed"), CHANGELOG_ARCHIVE.md 11.0.0 ("remove `ViewEncapsulation.Native`"), angular-cli CHANGELOG.md 22.0.0 ("Webpack builders in build-angular are deprecated. Use @angular/build builders instead."), VERSIONS.md (zoneless "Experimental in v18"), all read 2026-10-20.
- §3 (253): "`Eager` is its alias, added in 21.2.0 (changelog)" → "`Eager` [Added in v21.2] is its alias (21.2.0 changelog)" (+1)
- §5 table v11 (406): "`ViewEncapsulation.Native` removed" → "`ViewEncapsulation.Native` [Removed in v11.0]" (+2)
- §6 table v18 (481): "zoneless provider, \"experimental\"" → "zoneless provider [Experimental since v18.0]" (+2)
- §6 table v19 (482): "`standalone` is `true` [Changed in v19.0]" → "`standalone` is `true` [Changed in v19.0: components are standalone unless `standalone: false`]" (+6)
- §6 table v20 (483): "file names drop `.component` [Changed in v20.0]" → "file names drop `.component` [Changed in v20.0: generated file names have no `.component` suffix]" (+7); and "[Deprecated since v20.2 — use `animate.enter`, `animate.leave`]" → "[Deprecated since v20.2 — use `animate.enter` and `animate.leave`]" (as §4 writes it, 0)
- §6 table v21 (484): "zoneless [Changed in v21.0]" → "zoneless [Changed in v21.0: new applications are zoneless]" (+4)
- §6 table v22 (485): "OnPush [Changed in v22.0]" → "OnPush [Changed in v22.0: a component without `changeDetection` is OnPush]" (+7); "`strictTemplates` [Changed in v22]" → "`strictTemplates` [Changed in v22.0: defaults to `true`]" (+3); "`provideRoutes()`; HammerJS; webpack builders;" → "`provideRoutes()` [Removed in v22.0]; HammerJS integration [Removed in v22.0]; webpack builders [Deprecated since v22.0 — use `@angular/build`];" (+13)
- Q39.08 follow-up (1272): "`standalone` became the default in v19 [Changed in v19.0]" → "`standalone` became the default in v19 [Changed in v19.0: standalone by default]" (+3)

**T-2 · Minor (B9) · terms used before they are defined.**
- §1 (73): "with zone.js as the noise detector" → "with **zone.js**, a library that patches the browser's async APIs, as the noise detector" (+9); §2 (159): "**zone.js**, a library that patches the browser's async APIs, told Angular" → "zone.js told Angular" (−9).
- §5 problem (382): "and when standalone arrived." → "and when **standalone** components (listing their own imports instead of being declared in an NgModule, [15 §2](../../modules/15-standalone-and-ngmodules.md#2-standalone-components-and-the-imports-array)) arrived." (+15)
- §6 How it works, end of the definitions paragraph (475, after "… (`[12 §3](…)`)."): add "A **migration** is a schematic `ng update` runs to rewrite code for one version step ([12 §2](../../modules/12-angular-how-it-works.md#2-the-cli-and-the-workspace-angularjson-projects-schematics-and-ng-update)). **Incremental hydration** keeps parts of the server-rendered page dehydrated until a trigger ([32 §6](../../modules/32-ssr-ssg-hydration.md#6-incremental-hydration-defer-blocks-with-hydrate-triggers)). **`strictTemplates`** turns on full type checking of templates ([12 §7](../../modules/12-angular-how-it-works.md#7-aot-versus-jit-and-template-type-checking))." (+45). The FIX checks each sentence against the owner section before writing and keeps the owner's wording if it differs.

**T-3 · Minor (M39.md C8) · internal names in Exercise 39.4 not marked internal.**
- Constraints (1844): "both call `createMigrationProgram`, whose `parseTsconfigFile` reads" → "both call the internal `createMigrationProgram`, whose internal `parseTsconfigFile` reads"; "read the tree through `runMigrationInDevkit`" → "read the tree through the internal `runMigrationInDevkit`" (+4)
- Account (1883): "marks a template read likely to narrow as `PotentiallyNarrowedInTemplateButNoSupportYet`" → "… as the internal `PotentiallyNarrowedInTemplateButNoSupportYet`" (+2)

**T-4 · Minor (B7) · two cause clauses attached to the correction.**
- §11 (996): "It is a compiler marker, because it reads like a call." → "It is a compiler marker that does not exist at runtime. The myth comes from it reading like a call." (+9)
- §12 (1097): "It filters by level, options and `from`, because a long checklist looks exhaustive." → "It filters by level, options and `from`. The myth comes from a long checklist looking exhaustive." (+3)

**Nits**
- **N-1:** §8 (628) "…how-the-update-guide-builds-its-checklist)),." → "…how-the-update-guide-builds-its-checklist))." (stray comma).
- **N-2 (C1):** §4 "What to notice" (327): "majors come five to seven months apart" → "majors come about six months apart (five and a half to seven and a half)" (4.0 → 5.0 and 7.0 → 8.0 are about 7.3 months by the headings). (+5)
- **N-3 (C1):** `_validateUpdatePackages` does not log the mismatch itself; `_validateForwardPeerDependencies` and `_validateReversePeerDependencies` log it, and it throws (`update-resolver.js` 195-252). §7 (554): "the internal `_validateUpdatePackages` logs each mismatch as an error and throws" → "the internal `_validateUpdatePackages` has its peer checks log each mismatch as an error, then throws"; Q39.13 (1366): "(2) The internal `_validateUpdatePackages` logs `Package" → "(2) The peer checks under the internal `_validateUpdatePackages` log `Package". (+3) SOURCES.md: `@angular/cli@22.2.1` `update-resolver.js` `_validateForwardPeerDependencies`, `_validateReversePeerDependencies`, read 2026-10-20.
- **N-4 (C12):** §6 (489), after the quoted description "Adds 'strictTemplates: false' in tsconfig.json when not set.": add " (the run writes the build target's tsconfig, `[§11](#11-the-v22-upgrade-what-ng-update-changes-and-why-each-migration-keeps-the-old-behavior)`)" inside the parenthesis that follows. (+7)
- **N-5:** §6 (487): "Each cell rests on a changelog entry under that version's heading (`[SOURCES.md](../SOURCES.md)`); the rest come from owners" → "A cell rests on a changelog entry under that version's heading (`[SOURCES.md](../SOURCES.md)`) or, where none was read, on its owner" (0).
- **N-6 (D6, E1):** §3 (304): "Drilled in `[Q39.04](#q39-04)` and `[Q39.05](#q39-05)`." → "…; practised in `[Exercise 39.2](#ex39-2)`."; §11 (999): "Drilled in `[Q39.22](#q39-22)` and `[Q39.23](#q39-23)`." → "…; practised in `[Exercise 39.4](#ex39-4)`." (+6)
- **N-7:** Q39.22 trap (1561): append " Nor look for `strictTemplates: false` in `tsconfig.json`: it lands in the build target's tsconfig." (+15)
- **N-8 (D2):** Q39.24 short answer (1597): "D and E are absent" → "D and E are dropped" (the full explanation's word; 0).
- **N-9 (C1):** Q39.25 (1630): "The internal `_addPackageGroup` maps each group name to the target version and adds" → "The internal `_addPackageGroup` gives each name of a list-form group the target version (an object-form group, such as `@angular/cli`'s, names each member's version) and adds" (+14). Basis: `update-resolver.js` 496-520.
- **N-10:** Q39.11 (1322): "after 2026-11-28 a v20 application is two majors behind v22" → "after 2026-11-28 a v20 application is unsupported and still two majors behind v22" (+3).
- **N-11:** Exercise 39.3 constraints (1781): "Three come from angular.dev's migration and zoneless docs (read 2026-10-19) and carry `docs`" → "Three come from angular.dev's migration and zoneless docs (read 2026-10-19) and carry `docs`, one of them the zoneless guide's \"recommended step\"" (+8; matches §10's diagram and "only two edges are required").

## Judged acceptable

- Q39.22's heading names `tsconfig.json` (CLOSE-M39 open point): an Output question whose answer is "unchanged" is a fair trap; short answer and explanation state the build tsconfig; N-7 names it in the trap.
- `http-xhr-backend`: the module (§11, Q39.09) follows the bundle's code, which adds `withXhr()` to every `provideHttpClient()` call with neither `withFetch()` nor `withXhr()` (`http-xhr-backend.cjs` 27-28, 71), not the description in `migrations.json` ("when the 'HttpXhrBackend' is used"); For Jorge 3.
- §1's "3,000 bindings lags on every keystroke": a scenario, no number claimed as measured.
- §4's straight apostrophes in quotes whose source uses ’ (4.0.0-rc.1 entry): typographic only.
- The v20 row lists zoneless under "Introduced" with its developer-preview marker: it is the provider's rename and status change, and the v18 row carries the first appearance.
- §12's "The engine's `listSchematicNames` drops `hidden` and `private` entries and sorts": the host drops, the engine sorts; one sentence for one public method chain.
- Exercise 39.3's "Not covered: folders above the cap" while a test asserts the throw: the solution refuses them, which the test pins.
- The `ɵ`-free lab: no internal symbol imported; `SchematicTestRunner` and `HostTree` come through public entry points.

## Claims sampled (42)

| # | Claim (location) | Basis | Result |
|---|---|---|---|
| 1 | `TTL = 10`, throw at the end of the 11th dirty pass (§1, flashcard) | `angular.js` 18512, 19308 | Match |
| 2 | `beginPhase` "{0} already in progress" (§1, Q39.02) | 19886-19888 | Match |
| 3 | "Watchers fired in the last 5 iterations" (Q39.02) | 19312 | Match |
| 4 | `ngIf` "will override (hide)…" (§1) | 29590 | Match |
| 5 | Section 1 tests: 3 vs 2 passes, 11 reads, silent until apply | `section-1-digest.test.ts` | Match |
| 6 | Support ended January 2022 (§1) | README, version-support page; npm notice undated | Basis wrong (F-3) |
| 7 | `annotate` "does not work with minification…" (§2) | `angular.js` 4437 | Match |
| 8 | Upgrade guide quotes (§2, §9, Q39.03) | 16.2.0 `upgrade.md` 17, 52, 160-165, 236 | Match |
| 9 | Quick reference "do not exist in Angular" (§2) | 16.2.0 `ajs-quick-reference.md` 57 | Match |
| 10 | 12-month cadence, 4-6 minors, v23 ~June 2027 (§3) | `releases.md` 63-84 | Match |
| 11 | Table rows, v2-v19 unsupported, LTS fix criteria (§3) | `releases.md` 101-112 | Match |
| 12 | Deprecation period, removal only in a major (§3) | `releases.md` 122-123 | Match |
| 13 | Compiler ABI "across patch versions of the same minor" (§3) | `releases.md` 142 | Match |
| 14 | 24/19/18 months, active/LTS/LTS (§3) | Section 3 test | Match |
| 15 | 2.4.0 RxJS 5.0.1 `^5.0.1` (§4) | ARCHIVE 2.4.0 | Match |
| 16 | `ngIf` else 4.0.0-beta.0; `Renderer2` rc.3; animations and AOT quotes rc.1; WeakMap 4.0.0 (§4) | ARCHIVE 8247-9400 | Match |
| 17 | 5.0.0 `Intl`, http deprecated; 6.0.0 tree-shakeable, `enableIvy`; 8.0.0 `loadChildren`, `TestBed.get`; 9.0.0 Renderer removed (§4) | ARCHIVE | Match |
| 18 | No core 3.0.0; router 3.x; 2.4.10 → 4.0.0 (§4, Q39.06) | `cli.js` comment; registry | Match |
| 19 | v10 `ModuleWithProviders`; v11 `ViewEncapsulation.Native`; 13.2.0 CFR (§5) | ARCHIVE 3838, 3042, 437 | Match (marker T-1) |
| 20 | CLI 12.0.0 strict, View Engine, partial mode; 13.0.0 ES5 and libraries (§5, Q39.07) | CLI CHANGELOG 12.0.0, 13.0.0 | Match |
| 21 | 14.0.0 standalone, typed forms; 14.1.0 `inject()` options and "bit field signature" (§5, Q39.08) | CHANGELOG 9823, 14.0.0 | Match |
| 22 | 15.0.0 composition, "Ivy is the only rendering engine"; 15.1.0 "Use CanMatch" (§5) | CHANGELOG | Match |
| 23 | 16.0.0 ngcc and `entryComponents` (§5) | CHANGELOG 16.0.0 | Match |
| 24 | Components 15.0.0 MDC, 17.0.0 legacy, 18.0.0 M3; 13.2.2 mdc-list (§5, §6, §8) | components CHANGELOG | Match |
| 25 | Signals 16.0.0 / 17.0.0; control flow 17.0.0 (§6, Q39.08, Q39.10) | CHANGELOG | Match |
| 26 | Zoneless 18.0.0, 20.0.0 developer preview, 20.2.0 stable; CLI 21.0.0 default (§6) | CHANGELOG, CLI CHANGELOG | Match |
| 27 | `linkedSignal` 19.0.0 → 20.0.0 stable; incremental hydration 20.0.0 stable, 22.0.0 default (§6, §11) | CHANGELOG | Match |
| 28 | 22.0.0 OnPush text, fetch default, `withXhr`, `paramsInheritanceStrategy`, `provideRoutes`, Hammer, TS < 6.0 (§6, Q39.09) | CHANGELOG 22.0.0 | Match (markers T-1) |
| 29 | "Only v22 changes a default old code already uses" (§6) | CHANGELOG 19.0.0 | Mismatch (F-1) |
| 30 | Node `>=26.0.0` vs docs `^26.0.0`; TS `>=6.0 <6.1` (§6) | Section 6 test, `versions.md` | Match |
| 31 | `--force` text; throw only when `!force`; npm 7+ forced (§7, Q39.13) | `cli.js` 79-82, `update-resolver.js` 235-252, `cli-version.js` 181-195 | Match (N-3 wording) |
| 32 | Multiple-major refusal, messages, return 1, never reads `force` (§8, Q39.13, Ex 39.2) | `cli.js` 365-379 | Match |
| 33 | Hop table: Node drops and TS floors (§8, Q39.15) | Section 8 test, fixture | Match |
| 34 | `UpgradeModule` sync on `onMicrotaskEmpty`/`afterTick`, `$$phase` warning, `$evalAsync` (§9, Q39.17) | `static.mjs` 1105-1125 | Match |
| 35 | Typings: "more frequently", `downgradeModule` limits, "owned exactly by one framework" (§9, Q39.17) | `static.d.ts` 720-738, 1025 | Match |
| 36 | Peer `platform-browser-dynamic` 22.2.1, deprecated (§9, Q39.18) | `package.json`; `npm view` | Match |
| 37 | Route-lazy-loading and zoneless quotes (§10, Q39.20, Q39.21) | `route-lazy-loading.md` 30, `zoneless.md` 61-68 | Match |
| 38 | "Standalone docs: run one at a time and verify" (§10, Q39.21) | `standalone.md` 32-42 | Overreach (F-2) |
| 39 | `--path` "regardless of the `--path` option"; "cannot be safely migrated" (§10) | `signal-inputs.md` 78, 98 | Match |
| 40 | Selection range, stable sort by version, name order, TTY/CI listing (§12, Q39.14) | `migration.js` 106-140, 233-270, `engine.js` 265, `tty.js` | Match |
| 41 | Update Guide level default 1, filters, before/during/after (§12, Q39.24) | `update.component.ts` 69, 191-240 | Match |
| 42 | `_addPackageGroup` (Q39.25) | `update-resolver.js` 466-520 | Match for list groups (N-9) |

## Proposed FIX tasks

The module is at 19,171 words; the CLOSE limit was 19,489 and the REVIEW ceiling is 20,189. All fixes together add about +190.

Table rows (for the Module 39 table in TASKS.md):

```
| FIX-M39-01 | M | todo | REVIEW-M39 |  |
| FIX-M39-02 | S | todo | REVIEW-M39 |  |
| FIX-M39-03 | S | todo | REVIEW-M39 |  |
```

### FIX-M39-01 · M · Factual fixes, terms, internal names, cause clauses and nits (F-1..F-5, T-2..T-4, N-1..N-11)
- Files: `modules/39-version-history-and-migrations.md`; `SOURCES.md` (the lines F-1, F-3 and N-3 name, under `## Module 39`); `_meta/LOG.md` (its own line only).
- Do: apply each fix text above, finding each line by its quoted text. No heading or anchor change.
- Model: **Sonnet** (every text is prescribed; T-2's three definitions are checked against the owner sections named).

### FIX-M39-02 · S · Status markers in the STYLE-GUIDE §3.2 forms (T-1)
- Files: `modules/39-version-history-and-migrations.md`; `_meta/LOG.md`.
- Do: apply T-1's eleven replacements.
- Model: **Sonnet** (texts and bases prescribed).

### FIX-M39-03 · S · Anchors for the file-level links into 39 (+0 words)
- Files: link targets only in modules 12, 15, 17, 18, 19, 21, 35, 36, 37, 38 (allowed through this FIX, RUN.md §10, including `17-signals.md`).
- Do: apply the Handoffs table (21 rows). Leave the stay-file-level lines alone.
- Model: **Sonnet** (mechanical; slugs listed).

## For Jorge

1. **Two anchors differ from the plan's candidates.** 12:123 ("`ng update` refuses to cross several majors at once; the practice is module 39") goes to §8 (one major per hop), not §7; 36:2315 ("Material's move from M2 to M3") goes to §6, whose v18 row holds Material 3, not §5 (which has only the v15 MDC row). Say so if you prefer the plan's targets.
2. **EX-M39-04's LOG line says the relinks to Exercise 39.4 were restored "in §10 and §11"**; both links are in §10 (864, 922) and §11 has none (N-6 adds it). LOG is append-only, so no FIX; the main session may add a dated correction line.
3. **`http-xhr-backend`'s description and code differ (C12-type, outside 39's scope):** `@angular/core` 22.2.1 `migrations.json` says it adds `withXhr` "when the 'HttpXhrBackend' is used"; the bundle adds `withXhr()` to every `provideHttpClient()` call with neither `withFetch()` nor `withXhr()` (read, not run). Module 39 follows the code. Module 27 owns the migration (Q27.05); worth a look there.
4. **VERSIONS.md rows carried from CLOSE-M39 (no FIX):** `angular` (AngularJS) 1.8.3, end of support January 2022; `@angular/upgrade` 22.2.1, peering on the deprecated `@angular/platform-browser-dynamic`; the 12-month cadence since v22; registry `latest` still 22.2.3 against the pinned 22.2.1 (`npm view @angular/core version`, 2026-10-20).
5. **The 22.0.0 changelog says `getAngularLib`/`setAngularLib` "have been removed"**, while the 22.2.1 typings still declare them (`types/static.d.ts` 253, 322; read 2026-10-20). Module 39 names neither, so nothing to fix here; a heads-up for anyone citing the changelog line.
