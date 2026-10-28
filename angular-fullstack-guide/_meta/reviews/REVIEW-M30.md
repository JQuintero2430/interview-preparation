# REVIEW-M30: `modules/30-e2e-and-testing-strategy.md`

- **Reviewer:** reviewer subagent of session S20261013-1958-claudecode (Claude Code, local), model claude-opus-5-5. Module 30 was planned by PLAN-M30 (S20261013-1420-claudecode) and written by HOUSE-17, HOUSE-18, SEC-M30-01..09, EX-M30-01..03, QB-M30-01..04, HOUSE-19 and the content of CLOSE-M30, all in session S20261013-1503-claudecode; S20261013-1958 only re-ran and recorded CLOSE-M30's checks. This reviewer wrote nothing in module 30 and continues none of those conversations, so it is eligible (RUN.md §4).
- **Date:** 2026-10-13
- **Files read:** `modules/30-e2e-and-testing-strategy.md` (all 1,705 lines, end to end in chunks; line numbers below are from that read and move at FIX time); `_meta/QUALITY-BAR.md`; `STYLE-GUIDE.md` §3 and the snippet kinds; `_meta/RUN.md` §6, §10; `_meta/modules/M30.md` (whole file: lessons, budget, Lab decision, F1-F28, C1-C13, owners, breadth gate, sections, bank, exercises, closing, For Jorge); `_meta/TASKS.md` (REVIEW-M30 entry, module-30 table, by `grep`); `_meta/LOG.md` (every M30 line, 1150-1181, by `grep`); `_meta/reviews/REVIEW-M29.md` (format model); `SOURCES.md` Module 30 block (1727 to the end); every file under `labs/e2e` outside `node_modules` (spec titles by script; assertions of sections 1-9, both outputs specs, the three runner-fixture projects, config, `.gitignore`); `labs/ts-js/.../exercise-3-ci-kernel/ci-kernel.test.ts` (titles); `labs/angular/angular.json` (`serve.defaultConfiguration`, no `e2e` target), `labs/angular/src/app/app.routes.ts` (diff). Installed packages (versions checked): `labs/e2e/node_modules/playwright` 1.63.0 (`lib/common/index.js`, `lib/matchers/expect.js`, `lib/runner/index.js`, `lib/program.js`, `lib/index.js`, `lib/worker/workerProcessEntry.js`, `lib/cli/testActions.js`, `types/test.d.ts`), `playwright-core` 1.63.0 (`lib/coreBundle.js`, `types/types.d.ts`); `labs/angular/node_modules/@angular/cli` 22.2.1 (`src/command-builder/architect-base-command-module.js`). Web (curl, raw text, into the scratchpad, 2026-10-13): Playwright `docs/src/{test-sharding-js,test-retries-js,ci,actionability,locators}.md` on `microsoft/playwright` `main`; Cypress `trade-offs.mdx` on `cypress-io/cypress-documentation` `main`. File-level links to `30-e2e-and-testing-strategy.md` in all modules (by `grep`).
- **What was run** (Node 24.21.0, `export PATH=/opt/homebrew/opt/node@24/bin:$PATH`, one check at a time). Already run by the coordinating session at 20:00 and not repeated: e2e `npm run typecheck` (0) and `npm test` (67 passed); angular `tsc`, `ng build`, full `ng test` 1997/1997; ts-js 781/781; tools tests; `check-links --planned` (0); `check-snippets . 01 … 30` (OK); `module-stats` (30: 14,055 prose words, no flag; one-liner equal). Run by this review: (1) from `labs/e2e`, `PLAYWRIGHT_BROWSERS_PATH=0 npx playwright test --repeat-each=5 --reporter=list --global-timeout=540000` (every committed spec, 67 × 5): **335 passed**, exit 0, 34.9 s; (2) from `labs/ts-js`, `npx vitest run src/modules/30-e2e-and-testing-strategy`: **10/10**; (3) `npx ng e2e < /dev/null` in `labs/angular` (the F9 throwaway, re-observed; writes nothing): the nine lines of §2 verbatim, exit 1; (4) a scratchpad Playwright project (symlinked to `labs/e2e/node_modules`, outside the repo; `a.spec.ts` with `test.skip('a1')` and `a2`, `b1`, `c1`), `--list --shard=n/2 --fully-parallel` and a real `--shard=2/2` run: shard 1 lists `a1 a2`, shard 2 runs `b1 c1`, so 1.63.0 counts the statically skipped test (supports §9 787 and Q30.18's follow-up); (5) Mermaid 11.12.0 under jsdom 26.1.0 (scratchpad install): **9 of 9 diagrams parse**, a malformed negative control fails; (6) scan script (scratchpad): 37 cited `Section N:`/`Q30.NN`/`E30.N` names against all lab titles and strings (0 missing), exercise criteria against titles (6/6/6 present), D1 anatomy counts (18 each), follow-ups per answer (none under 2), `<details>` (33 open, 33 close), `](#q30-NN)` coverage (18 of 18), subsection counts (9 each, 1 Legacy, 9 "What to notice"); (7) URL coverage of the module against the SOURCES block (36 URLs; the only three absent are the example hosts `localhost:4300`, `m30-section-2.test`, `q30-09.test` in code); (8) the QUALITY-BAR D3 one-liner; (9) `git status --short -uall labs/e2e`; `lsof -iTCP:4300` before and after (nothing listening).
- **Basis of each finding:** **run** (executed in this review), **package source** (installed package read by `grep`/`sed`), **docs** (raw docs text fetched by curl on 2026-10-13) or **read** (module, labs, LOG, SOURCES; nothing executed).
- **Probe files:** none under the repository. In the scratchpad: the scan script, the Mermaid install and parse script, the skip-counting probe project, the fetched docs pages; all deleted at the end (last section). The 5-of-5 run wrote only into `labs/e2e/test-results/`, which `labs/e2e/.gitignore` covers.

Overall: a careful, honestly sourced module with no Major finding. Every recorded text, status and exit code re-checked against a 5-of-5 run of the committed specs holds (F9 by a fresh observation, F11, F12, F15, F17 and the five Output answers by 335/335 passing runs whose assertions equal the module's text); every sampled package read matches the installed 1.63.0 and 22.2.1 sources; the `ng e2e` message is the only throwaway observation; Cypress, MSW and Pact are documented only; no speed, popularity or "winner" claim; the docs' "statically skipped tests are not counted" sentence is correctly called unsupported by 1.63.0, and a probe run agrees. The findings are teaching polish: three Misconceptions bullets without the myth's cause (T-1), four terms used before their gloss (T-2), the outcome rule stated without its `skipped` branch (F-1), a handful of marking and wording slips, and the anchor handoffs (T-12). Net after all fixes: about +75 words, about 14,130, under both the CLOSE limit 14,415 and the ceiling 15,115.

---

## QUALITY-BAR

45 items: **39 Pass, 6 Partial (B6, B7, B9, C1, C3, E2), 0 Fail.**

| ID | Result | Evidence |
|---|---|---|
| A1 | Pass | Lines 3-9 in STYLE-GUIDE §4.1 order; Labs line names the three folders and the three run commands (`npm test`, the scoped `ng test`, the scoped `vitest run`). |
| A2 | Pass | Prerequisites link 29 §1, 29 §11 and 11 §7 with anchors; link check exit 0 (coordinator). |
| A3 | Pass | Short on time (8): §1, §3, §7, §8; Q30.01, 03, 04, 13, 16, 17; then the Summary. |
| A4 | Pass | Contents (13-26): nine sections and the five closing sections; 14 `## ` headings after Contents. |
| A5 | Pass | §1 (what earns a browser test) → §2-§3 tools and waiting → §4 locators → §5 backend control → §6 extra checks → §7 flakiness (needs §3-§5) → §8 CI (needs §7) → §9 runner internals. No section needs a later one. |
| B1 | Pass | Script: each of the six subsection headings 9 times; `#### Legacy` only in §2 (201) with the migration step (217), as M30.md requires. |
| B2 | Pass | Read: every problem is a concrete failure (an hour-long mirrored suite and a 404 lazy route, a missing target and a second tab, a one-in-five `textContent` read, sixty tests broken by a class rename, a staging suite broken by another team, a 40 px shift, a re-run culture, a 20-minute shard, three interview questions). |
| B3 | Pass | 9 diagrams (flowchart ×5, sequenceDiagram ×2, stateDiagram-v2, classDiagram), one per section, each followed by "What to notice"; 9 of 9 parse (run). |
| B4 | Pass | Each section answers a "why" from a named file and function: `defaultTimeout`/`invokeMatcher`, `onMissingTarget` and `Target.createBrowserContext`, `retryWithProgressAndBackoff`, `_callOnSelectorInternal`/`strictModeViolationError`, `_routes.unshift`/`_reportHandled(false)`, `snapshotSuffix = process.platform`, `outcome()`, `filterForShard`, `createTestGroups`/`Dispatcher`/`JobDispatcher._onDone`. All found in the installed sources (claims table). |
| B5 | Pass | Every `### Code` has an approach sentence and numbered steps; §9's condensed rule is labelled Partial. |
| B6 | Partial | Read: every bullet has "because" or an equivalent clause, except §5 515 ("Register routes before `goto`, as the docs do", no reason) (T-4). |
| B7 | Partial | Read: 31 of 34 Misconceptions bullets give the correction and the myth's cause; 525, 590 and 664 give only the correction (T-1). The Protractor history carries the 19.0 marker and the 12.1 deprecation (217). |
| B8 | Pass | Required *Framework vs platform* in §2 (219-220); optional *Coming from the backend* in §8 (736-737) with **Where the analogy breaks**, both quotes in the Spring Boot docs line of SOURCES. |
| B9 | Partial | Most terms glossed at first use (SPA fallback, browser context, worker process, builder, `ng add`, superdomain, actionability, web-first assertion, locator, accessible name, HAR, Service Worker, contract test, baseline, pixel diff, axe, WCAG tag, ARIA snapshot, flaky test, trace, quarantine, shard, blob report, flaky budget, tenant, seed, test group, dispatcher, outcome). Used before their gloss or never glossed: tenant (64, defined 705), jsdom (58), Chrome DevTools Protocol (141), `fullyParallel` (701) (T-2). |
| B10 | Pass | Read: owners get one sentence and a link: 29 §1/Q29.01/Q29.02 (levels, shapes), 29 §11/Q29.33 (role queries), 27 §11/Q27.34 (`HttpTestingController`), 11 §6/§7/Q11.18/Q11.19 (names, scans), 12 §2/§3 (builder, build), 09 §9 (Service Worker), 38/41/44/31 file-level. No retelling of levels, pyramid, browser mode, doubles, scan limits or `HttpTestingController` (module-specific row below). |
| C1 | Partial | 30 claims sampled (table below): 29 match; one imprecise (F-1, the outcome rule without its `skipped` branch). |
| C2 | Pass | 5 *Output* questions, each with `test('Q30.NN …')` in `q30-outputs.spec.ts` (Q30.04, 06, 09) or `q30-runner-outputs.spec.ts` (Q30.15, 18); all five answers equal their assertions (cross-check below); 5 of 5 runs pass. |
| C3 | Partial | Every observed sentence names a committed test (37 cited names, 0 missing), except §1 104 "in the lab it builds the `development` configuration", which is a read of `angular.json`, not an observation (T-5). |
| C4 | Pass (Nit on form) | `[Removed in v19.0]` on the Protractor builder at 217 (first mention of the builder) with "deprecated in CLI 12.1" in prose, as C5 of M30.md requires; no other Angular marker applies; third-party APIs carry none. The marker is written inside code backticks (217, 865), while STYLE-GUIDE §3.2 says "inline text in square brackets" (T-3). |
| C5 | Pass | Typecheck exit 0 (coordinator); every Playwright option, flag and method the text states is in the 1.63.0 typings or `lib/program.js` (claims table); every Partial is marked "not run". |
| C6 | Pass | `grep`: 0 `Unverified`, `TASK:`, `PLACEHOLDER`, `relink:`. |
| C7 | Pass (Nit) | `check-snippets . 30` OK (coordinator); Excerpts omit only whole statements (STYLE-GUIDE §7.2). Q30.18's bash block is labelled Complete but omits the working directory that makes it equal to the test's run (T-10). |
| C8 | Pass | Script: all 33 source URLs of the module are in the SOURCES block; every package file named in the text has a SOURCES line (read). |
| D1 | Pass | Script: 18 of each part; every answer has at least two follow-up bullets (the minimum is 2: Q30.04, 05, 06, 07, 08, 09, 10; the rest 3). |
| D2 | Pass | Read: each Output short answer gives the asserted values and a one-clause cause. |
| D3 | Pass | Output 5 (28%), Concept 3, Design 3, Difference 3, Trade-off 3, Bug hunt 1: the lab-mode mix of M30.md exactly. |
| D4 | Pass | Q30.01 §1 through Q30.18 §9, in section order. |
| D5 | Pass | `grep` of `### Q` across modules for Playwright, Cypress, end-to-end, e2e, flaky, shard, page object, visual regression, contract test, Protractor: only Q11.19 and Q29.01, both owned elsewhere and linked from 30. |
| D6 | Pass | Script: every Q30.NN linked outside its heading (18 of 18). |
| D7 | Pass | 18 unique `<a id="q30-NN">`; link check exit 0. |
| D8 | Pass | 18 of 18 questions (ceiling), 3 of 3 exercises. |
| E1 | Pass | Each exercise: Problem, Constraints, criteria, 2 hints, Worked solution (approach, steps, code, account), Alternative + Trade-offs, 3 follow-ups, Tests link. |
| E2 | Partial | Script: every criterion is a test title (6, 6, 6) and every account names what its test asserts. But `E30.3 shard plan trade-off` is a test with no criterion (it backs the Trade-offs paragraph), and the account's "Each criterion titles one test" (1636) misdescribes the three plan criteria, which run once per planner (T-6). |
| E3 | Pass | 30.1 (one page, two shapes) → 30.2 (backend control, both controllers, timing) → 30.3 (sharding, outcome rule, quarantine: §7-§9). |
| E4 | Pass | Run: 30.1 and 30.2 5 of 5 (120 runs), 30.3 10/10; every alternative runs (Playwright `for` loops over two variants, Vitest `describe.each`) with unchanged titles. |
| E5 | Pass | 5 Output questions. |
| F1 | Pass | Summary (865-869): three paragraphs, nine section links, each section's core claim and trap; nothing not taught above. |
| F2 | Pass | Five explain-back prompts, each naming a listener. |
| F3 | Pass | Six flashcards, one- or two-line answers. |
| F4 | Pass | Builds on, Read next, Uses these ideas later, Comparisons, each with a reason. |
| G1 | Pass | 14,055 prose words (module-stats and the one-liner agree, coordinator), under 14,415 and the ceiling 15,115; no repeat worth cutting (Redundancy below). |
| G2 | Pass | 5 of 5 SYLLABUS §4 rows covered (table below). |
| H1 | Pass | Run: 335/335 (5 of 5), 10/10; coordinator: typecheck 0, 67 passed, `ng build` 0, 1997/1997. |
| H2 | Pass | `check-links --planned` exit 0 (coordinator). |
| H3 | Pass | `git status --short -uall labs/e2e`: 35 untracked files, all declared by HOUSE-17 (6), HOUSE-18 (2), SEC-M30-01..09 (9 specs, the HAR, the PNG baseline, 7 runner-fixture files), QB-M30-04 (2 retry-project files), EX-M30-01 (3), EX-M30-02 (2), QB (2 outputs specs); `node_modules/` and `test-results/` ignored by `labs/e2e/.gitignore`; no file of this review. |

## Module-specific checks (REVIEW-M30 entry)

| Check | Result | Evidence |
|---|---|---|
| The mode in every task's LOG line; no documented-mode wording | Pass (Nit) | LOG 1159-1174, 1181: SEC-M30-01..09, EX-M30-01, EX-M30-02, QB-M30-01..04 and CLOSE-M30 say "Lab mode"; EX-M30-03 (1170) names no mode (it is mode-independent, `labs/ts-js`) (T-11). The module says lab mode (6, 9, 28); no documented-mode sentence left. |
| Every recorded text, status and exit code against a 5-of-5 re-run | Pass | run: 335/335. F9: re-observed verbatim, exit 1. F11: `Q30.15` (status `flaky`, results `failed`/`passed`, `stats.flaky` 1, exit 0, exit 1 with the flag) and `Section 9: a failed test's worker is replaced …` (status `flaky`, `workerIndex` 0→1, `parallelIndex` 0). F12: `Section 9:` shard tests (`[a1 a2 a3] [b1] [c1 d1]`, `[a1 a2] [a3 b1] [c1 d1]`) and `Q30.18` (`b1`; `a3`, `b1`). F15: `Section 4:` and `Q30.06` assert the exact first line `locator.click: Error: strict mode violation: getByRole('button', { name: 'Delete' }) resolved to 2 elements:` and the two `aka` lines. F17: `Section 5:` order tests (`['B']`, `['B', 'A']`) and `Q30.09`. §3's `TimeoutError` name, first line and call-log lines asserted. |
| The `ng e2e` observation is the only throwaway one | Pass | read: §2 145 and Q30.02 904 are the only "observed by running" sentences. The other throwaway runs in the LOG (HOUSE-18's page-contract probe, EX-M30-01's ad hoc `--fully-parallel` run, QB-M30-03's Q30.13 fix pair) are not cited: the page contract is asserted by committed tests, Ex 30.1's follow-up says "A design argument, not run here", Q30.13's code says "not run as written". |
| No Cypress, MSW or Pact claim worded as observed | Pass | read: §2 143, §3 280, §5 479/481, §8 701 and Q30.03/05/18 say "documented only" and quote dated docs; Protractor's snippet is Partial "not run in these labs". |
| No docs line newer than 1.63.0 / CLI 22.2.1 stated as shipped (C1) | Pass | Every option and flag the text uses is in the 1.63.0 typings or `lib/program.js` (claims table). The one docs sentence 1.63.0 does not support ("statically skipped tests … are not counted", `test-sharding-js.md` 47, docs) is reported as not holding for 1.63.0 (787, Q30.18); package source (`filterForShard` sums `group.tests.length`, `lib/runner/index.js` 2463-2489) and run (probe 4) agree. |
| No unsourced popularity or speed claim, no "winner" (C6) | Pass | `grep` for winner, popular, industry, faster, standard, downloads: only Q30.03's "Which is faster? No figure is claimed here", §8's myth wording and Q30.16's labelled invented numbers; Q30.17's "One retry is my choice, not a sourced figure". |
| Protractor marker and history (C5) | Pass (Nit) | 217: `[Removed in v19.0]`, "deprecated in CLI 12.1" with the CHANGELOG quote, the `protractor` 7.0.0 npm notice, the 19.0.0 quote; Legacy migration step present. Marker in backticks (T-3). |
| Internal names of C9 marked | Pass (Nit) | Script over sections and answers: every section and Q30.06/15/18/Ex 30.3 mark their internal names; Q30.09 1103 names `this._routes.unshift(...)` and `_reportHandled(false)` without "internal" (T-7). |
| Owner credit and the 11/27/29 split | Pass | B10 row. The only theory quote is Vocke's "Push your tests as far down the test pyramid as you can" (58, 885), which M30.md F27 allows; browser mode is not mentioned; doubles not taught; Q11.18 linked, never retold; `HttpTestingController` one sentence (479, 524) and Q27.34 linked once. |
| Contract testing limited to one paragraph and Q30.10 (C10) | Pass | The teaching paragraph is §5 481; Q30.10 explains the consumer-driven contract in one sentence; elsewhere only pointers (§1 111, §5 447/518/525, Summary, Q30.01 follow-up, Ex 30.2 follow-up, explain-back 4), each sending the reader to §5 or 41. |
| Every exercise criterion equals its test title and the alternative runs | Pass (E2 Nit) | Script: 18 of 18 criteria are titles; both variants ran 5 of 5 (30.1, 30.2) and 10/10 (30.3). Extra trade-off test and account wording: T-6. |
| At least two answered follow-ups per answer | Pass | D1 row (script). |
| Terms defined at first use | Partial | B9 row (T-2). |
| SOURCES complete (script) | Pass | C8 row. |
| All nine Mermaid diagrams parse | Pass | run: 9 of 9; negative control fails. |
| Every Misconceptions bullet has a cause clause | Partial | B7 row (T-1). |
| Every `<details>` closed | Pass | script: 33/33. |
| Type mix and Output share for the mode | Pass | D3 row: lab-mode mix, Output 5 of 18 (28%). |
| Prose within 14,415 and the ceiling 15,115 | Pass | G1 row (documented-mode limits do not apply). |
| No stray files under `labs/e2e` outside its ignore rules | Pass | H3 row. |
| File-level links into 30 listed as anchor candidates with the section map | Done | Handoffs below (6 anchors, 5 stay file-level, 1 unlinked mention left as is). |

## Handoffs

Module 30 slugs (verified against the `## N.` headings of this read; no FIX here renames a heading):

- S1 `#1-what-belongs-at-the-end-to-end-level-journeys-cost-and-a-strategy-across-levels`
- S2 `#2-playwright-and-cypress-architecture-ng-e2e-and-the-end-of-protractor`
- S6 `#6-visual-regression-and-accessibility-checks-in-end-to-end-tests`

| File:line | Context | Anchor |
|---|---|---|
| 11:626 | "`@axe-core/playwright` runs axe inside end-to-end tests with `new AxeBuilder({ page }).analyze()`" | S6 |
| 11:1542 | "add `@axe-core/playwright` for whole pages" | S6 |
| 29:41 | "An **end-to-end test** drives the built app in a real browser against a running server" | S1 |
| 29:222 | "module 30 owns Playwright itself" | S2 |
| 29:1552 | "End-to-end tools belong to module 30" | S2 |
| 29:1574 | "both shapes keep it small, and module 30 owns it" (the end-to-end count) | S1 |
| 29:1609 | "browser mode … runs unit specs in a browser, with no built app or server" | S1 |
| 29:2870 | Exercise 29.6 "Not covered: … end-to-end" | S1 |

That is 8 links (6 distinct contexts beyond the two axe lines). Stay file-level (5): headers 11:5 and 29:5, "Uses these ideas later" 11:1598 and 29:2999, "Read next" 29:2998. Unlinked: 09:1260 "drive a real browser with a test server (module 30)" stays as is (M30.md: "no edit to 09"). This differs from M30.md 134 in two places: 29:1552 goes to §2, not §1 (the sentence is about the tools, which §2 introduces), and 29:1609 goes to §1, not §2 (the sentence contrasts browser mode with "no built app or server", which is §1's "What only this level sees").

## Factual findings

**F-1 · Nit (C1, precision) · §7 states the outcome rule without its first branch (basis: package source).** 621: "No unexpected attempt gives `expected`; no expected attempt (and none skipped) gives `unexpected`; anything else is **`flaky`**." `computeTestCaseOutcome` (`playwright` 1.63.0 `lib/common/index.js` 2493-2519) first returns `skipped` when no attempt was expected or unexpected, then `expected` when none was unexpected, then `unexpected` when none was expected or skipped, else `flaky`; read as written, an all-skipped test would come out `expected`. §9 762 lists the four outcomes and Ex 30.3's `classify` has the branch, so only §7's sentence is short. Fix: "No counted attempt gives `skipped`; no unexpected attempt gives `expected`; no expected attempt (and none skipped) gives `unexpected`; anything else is **`flaky`**." +5 words.

## Teaching and completeness findings

**T-1 · Minor (B7) · Three Misconceptions bullets give no cause for the myth (basis: read).**
- §5 525 *"A green mocked suite proves the API works."* Only the correction. Add: "Green looks like proof because the mock agrees with every request." (+12)
- §6 590 *"An axe pass means accessible."* "A green report covers only the rules run; see Q11.18." is the correction. Add: "A green report reads like a certificate." (+7)
- §7 664 *"A test that usually passes can be ignored."* Only the correction. Add: "The habit grows because it usually passes." (+7)

**T-2 · Minor (B9) · Four terms are used before their gloss or never glossed (basis: read).**
- "tenant" first appears in §1's steps (64, "Set a tenant cookie of its own") and §4/§7 code, and is defined only in §8 705. Fix at 64: "Set a cookie that names its own tenant (the server's per-test slice of data, `[§8](#8-ci-strategy-for-end-to-end-tests-workers-sharding-retries-policy-and-test-data)`) and reset that tenant's todos …" (+10); §8's bold definition stays.
- "jsdom" (58) is unglossed. Fix: "A component test in jsdom (a simulated DOM in Node, [29 §2](../../modules/29-testing-angular.md#2-the-runner-vitest-through-angularbuildunit-test-jsdom-and-browser-mode)) checks …" (+7).
- "the Chrome DevTools Protocol" (141) is unglossed. Fix: "the Chrome DevTools Protocol (Chromium's remote-debugging protocol) is Chromium-only" (+3).
- `fullyParallel` (701) is used before §9 explains groups. Fix: "Without `fullyParallel` (the option that runs the tests of one file in parallel too; by default a file's tests run in order in one worker, `types/test.d.ts`) a group is a file" (+20; basis: package source, `types/test.d.ts` 318-324).

**T-3 · Nit (C4 form).** `[Removed in v19.0]` is written as code (`` `[Removed in v19.0]` ``) at 217 and 865; STYLE-GUIDE §3.2: "Markers are inline text in square brackets". Fix: drop the backticks in both places. +0 words.

**T-4 · Nit (B6).** §5 515 "**Register routes before `goto`**, as the docs do." gives no reason. Fix: "…, because a request the page sends before the route exists goes to the network." (+11; basis: the route handlers only see requests made after `page.route` registers them, `playwright-core` `_routes` is consulted per request in `_onRoute`, read.)

**T-5 · Nit (C3 wording).** §1 104 "because in the lab it builds the `development` configuration (`angular.json`)" reads as an observation; it is a config read (`angular.json` `serve.defaultConfiguration` `development`, read). Fix: "because the lab's `angular.json` makes `development` its default configuration, not the bundle that ships." +1 word.

**T-6 · Nit (E2).** Ex 30.3 1636: "Each criterion titles one test." The three plan criteria title one test per planner (`describe.each`, `ci-kernel.test.ts` 39), and `E30.3 shard plan trade-off` (70) is a test without a criterion. Fix: "Each criterion titles one test; the three plan criteria run once per planner, and `E30.3 shard plan trade-off` backs the Trade-offs paragraph, not a criterion." +17 words. (Keeping the extra test is right: it is the evidence for the `[1, 1, 1, 1, 4]` sentence.)

**T-7 · Nit (C9 marking).** Q30.09 1103 names `this._routes.unshift(...)` and `_reportHandled(false)` without "internal" (§5 marks them, but C9 asks per unit). Fix: "(read, not run; internal names, `[§5](…)` names the same code)". +2 words.

**T-8 · Nit (accuracy of a pointer).** The bank intro (873): "The Output answer states the run asserted in `labs/e2e/tests/outputs/q30-outputs.spec.ts`." Q30.15 and Q30.18 are asserted in `q30-runner-outputs.spec.ts`. Fix: "Each Output answer states the run asserted in `labs/e2e/tests/outputs/q30-outputs.spec.ts` or, for the nested runs, `q30-runner-outputs.spec.ts`." +6 words.

**T-9 · Nit (C1 basis wording).** Ex 30.2's Trade-offs (1522): "A list request with nothing scripted is aborted by the mock but served by the server; both report it as unexpected." No test makes an unscripted call (EX-M30-02's LOG line flags it); the sentence follows from `backends.ts` (read). Fix: append "(read from `backends.ts`; no test makes a stray call)". +8 words.

**T-10 · Nit (C7).** Q30.18's bash block (1351-1355) is labelled "Complete: run by `test('Q30.18 …')` on `labs/e2e/runner-fixtures/shard-project/`", but the test runs from `labs/e2e` with `-c runner-fixtures/shard-project/playwright.config.ts --reporter=json --output=…`. Fix the header: "# Complete when run from `labs/e2e/runner-fixtures/shard-project/` (the test adds `-c` with that config, `--reporter=json` and `--output`; `--list` runs no test)". +8 words (comment line, counted as code).

**T-11 · Nit (process, LOG).** EX-M30-03's LOG line (1170) names no mode (M30.md C2 asks every task to). The exercise is mode-independent and its files are `labs/ts-js`, so nothing in the module changes; LOG is append-only. Fix: FIX-M30-01's LOG line records "EX-M30-03 ran in lab mode (no mode named in its line)".

**T-12 · Minor (anchors).** The Handoffs table: 8 file-level links into 30 in modules 11 and 29 take an anchor.

**T-13 · Nit (typo).** Q30.14 1258: "…even when a later retry passes"; A retry-pass is…" — semicolon followed by a capital. Fix: ". A retry-pass is…". +0 words.

## Output answer cross-check

All five Output answers compared with their assertions (read) and run 5 of 5: Q30.04 `readOnce` `'Save'`, `toHaveText('Saved')` passes after at least 300 ms, a later read `'Saved'` (`q30-outputs.spec.ts` 11-26); Q30.06 the exact first error line, two items remain, the row-scoped click leaves `Bread Delete` (38-63); Q30.09 `{ body: 'B', order: ['B'] }` then `{ body: 'A', order: ['B', 'A'] }` on a second page (85-91); Q30.15 status `flaky`, results `['failed', 'passed']`, `stats.flaky` 1, `stats.unexpected` 0, exit 0, exit 1 with `--fail-on-flaky-tests` (`q30-runner-outputs.spec.ts` 25-36); Q30.18 `['b.spec.ts:b1']` and `['a.spec.ts:a3', 'b.spec.ts:b1']` (45-48). The Q30.15 Complete snippet equals `runner-fixtures/retry-project/flaky.spec.ts` and its header states the config (`retries: 1`, `workers: 1`) correctly. All match.

## SYLLABUS §4 coverage (module-30 checklist, 5 rows)

| Row | Where | Status |
|---|---|---|
| Playwright vs Cypress: architecture, auto-waiting, parallelism, trade-offs | §2, §3, §8, §9; Q30.02-05, Q30.18 | Covered |
| Page objects vs fixtures; selectors (role-based); flaky test root causes | §4, §7; Q30.06-08, Q30.13-14; Ex 30.1 | Covered (T-1) |
| API mocking at the network layer; contract testing (pointer to 41) | §5; Q30.09-10; Ex 30.2 | Covered |
| Visual regression and accessibility checks in e2e | §6; Q30.11-12 | Covered (T-1) |
| CI strategy: sharding, retries policy, test data management | §1, §8, §9; Q30.01, Q30.15-18; Ex 30.3 | Covered (T-2) |

## Redundancy

No retelling worth cutting. The likely repeats each add something: the route order (§5, Q30.09, Ex 30.2 follow-up, flashcard 4) adds the observed order, the recording-handler use and the catch-all design; the `flaky` outcome (§7, §8, Q30.15, Q30.17, flashcard 5) splits rule, policy and run as M30.md's rule/run pairing requires; the shard rule (§8, §9, Q30.16, Q30.18, flashcard 6) adds the algorithm, the design consequence and the run; the Vocke quote appears in §1 and Q30.01 once each. Shortening any would cost a cross-link, not a repeat.

## Claims to verify

30 claims sampled; basis on each.

| # | Claim (line) | Basis | Result |
|---|---|---|---|
| 1 | 5 Output answers (bank) | run (5 of 5) and read (spec assertions) | match |
| 2 | 37 cited test names exist; 18 criteria equal titles | script | match |
| 3 | `ng e2e` message, five `ng add` lines in order, exit 1 (145-157, Q30.02) | run (re-observed) | match |
| 4 | `onMissingTarget`: TTY prompt with "No" first then `ng add`, otherwise logs; both return 1 (145) | package source (`architect-base-command-module.js` 190-240) | match |
| 5 | `serve` default configuration `development`; no `e2e` target (104, 232) | read (`angular.json`) | match (T-5 wording) |
| 6 | `defaultTimeout = 3e4`, `defaultExpectTimeout = 5e3` (56) | package source (`lib/common/index.js` 478; `lib/matchers/expect.js` 13172, 13351) | match |
| 7 | `invokeMatcher` rethrows unless soft (56) | package source (`expect.js` 13322-13329 `handleError`) | match |
| 8 | Backoff 20, 50, 100, 100, 500 ms; steps above a fifth of the timeout dropped (276, Q30.05) | package source (`coreBundle.js` 23989-23992) | match |
| 9 | `networkidle` **DISCOURAGED**, "no network connections for at least 500 ms", the readiness sentence (333) | package source (`types/types.d.ts` 3429-3430) | match |
| 10 | Chromium `--remote-debugging-pipe`, Firefox `-juggler-pipe`, WebKit `--inspector-pipe`; `Target.createBrowserContext` in `doCreateNewContext` (141) | package source (`coreBundle.js` 43320, 45950, 50884, 38379-38388) | match (WebKit uses a port under WSL; not worth a fix) |
| 11 | `_callOnSelectorInternal` throws when strict and more than one match (375, Q30.06) | package source (`coreBundle.js` 20900-20921) | match |
| 12 | Strict-mode first line and `aka` lines (375) | run (`Section 4:` test, 5 of 5) | match |
| 13 | `TimeoutError`, `locator.click: Timeout 500ms exceeded.`, call-log lines (274) | run (`Section 3:` test) | match |
| 14 | `_routes.unshift`, `_reportHandled(false)` (473, Q30.09) | package source (`coreBundle.js` 61728, 62512, 59728) | match |
| 15 | `notFound` `"abort"\|"fallback"`, default abort; fallback reaches the server, 404 (477) | package source (`types/types.d.ts` 4503); run (`Section 5: routeFromHAR …` 91-100) | match |
| 16 | `threshold` 0.2, `maxDiffPixels`/`maxDiffPixelRatio` unset, `animations` `"disabled"`, pink `mask`, `stylePath` (554, Q30.11) | package source (`types/test.d.ts` 9879-9948) | match |
| 17 | `snapshotSuffix = process.platform`; legacy path template (556) | package source (`lib/index.js` 352; `workerProcessEntry.js` 1256) | match |
| 18 | Outcome rule (621) | package source (`lib/common/index.js` 2493-2519) | imprecise (F-1) |
| 19 | `ok()` accepts `expected`, `flaky`, `skipped` (621, Q30.15) | package source (`lib/common/index.js` 2748-2751) | match |
| 20 | `--fail-on-flaky-tests`, `--retries`, `--workers` "(default: 50%)", `--grep-invert`, `--repeat-each`, `--last-failed`, `--only-changed`, `--shard`, `merge-reports` texts (621, 699, 703, 707, Q30.14) | package source (`lib/program.js` 109, 194-227) | match |
| 21 | `on-first-retry` and `retain-on-failure` texts (625, Q30.14) | package source (`types/test.d.ts` 7167-7170) | match |
| 22 | `parallelIndex` "workers running at the same time have a different `parallelIndex`"; reused after a restart (705, 852) | package source (`types/test.d.ts` 2573-2575) | match |
| 23 | `failOnFlakyTests: !!process.env.CI` in the typings (Q30.17) | package source (`types/test.d.ts` 1269) | match |
| 24 | `filterForShard` by test count, remainder from shard 1, whole groups by first index; `PWTEST_SHARD_WEIGHTS` (701, 787, §9 Partial) | package source (`lib/runner/index.js` 2463-2489; `lib/cli/testActions.js` 191) | match |
| 25 | Skipped tests counted in 1.63.0, unlike the docs on `main` (787, Q30.18) | package source (#24); docs (`test-sharding-js.md` 47); run (probe 4) | match |
| 26 | Worker hash = project, worker fixtures, repeat index (785) | package source (`lib/common/index.js` 2054, 2067) | match |
| 27 | `worker.stop(true)` on `didFail`; `_onDone` queues unrun tests and, by default, retries (`results.length < retries + 1`) as `remainingJob` at the front; `_createWorker` (789) | package source (`lib/runner/index.js` 5597-5621, 5925-5950; `retryStrategy` default `"immediate"`, `lib/common/index.js` 496) | match |
| 28 | Retries, CI, sharding and actionability docs quotes (623, 699, 701, 707, 789, 274, 326) | docs (`test-retries-js.md` 36, 59; `ci.md` 51, 426; `test-sharding-js.md` 46; `actionability.md` 46, 93) | match |
| 29 | Cypress: "Test code is not evaluated in Node …", tabs through `@cypress/puppeteer`, superdomain (143) | docs (`trade-offs.mdx` 31, 75, 100) | match |
| 30 | `first()`/`last()`/`nth()` "not recommended", test ids "not user facing" (432, Q30.06) | docs (`locators.md`; SEC-M30-04 read) | match (quotes present in the page fetched; wording carried from SOURCES) |

## Proposed FIX tasks

Ceilings: the module is 14,055 prose words (module-stats); CLOSE limit 14,415; REVIEW ceiling 15,115. FIX-M30-01 nets about +75 (T-1 +26, T-2 +40, T-4 +11, T-6 +17, T-8 +6, T-9 +8, F-1 +5, T-7 +2, T-5 +1, T-3 +0, T-13 +0; T-10 is a code comment), FIX-M30-02 +0: about 14,130, under both limits. FIX-M30-01 edits only module 30; FIX-M30-02 edits only link targets in modules 11 and 29; files are disjoint, so they may run in either order (one agent runs the checks, serially). None needs Jorge's ruling.

### FIX-M30-01 · S · Misconception causes, glosses, outcome rule, marking and wording (F-1, T-1..T-11, T-13)
- Files: `modules/30-e2e-and-testing-strategy.md`; `_meta/LOG.md` (its own line only).
- Do: apply each fix text above: F-1 (621); T-1 (525, 590, 664); T-2 (64, 58, 141, 701); T-3 (217, 865, drop backticks around the marker); T-4 (515); T-5 (104); T-6 (1636); T-7 (1103); T-8 (873); T-9 (1522); T-10 (Q30.18 bash header); T-13 (1258). Find each line by its quoted text (line numbers move). No lab file changes; no test title changes. The LOG line records T-11 ("EX-M30-03 ran in lab mode; its line named no mode").
- Acceptance: from `labs/e2e`, `npm run typecheck` exit 0; from the guide root, `node labs/tools/check-links.mjs --planned` and `node labs/tools/check-snippets.mjs . 30` exit 0; every Misconceptions bullet of §5, §6 and §7 has a cause sentence (read); ``grep -c '`\[Removed in' modules/30-e2e-and-testing-strategy.md`` is 0 and `grep -c '\[Removed in v19.0\]'` is 2; `grep -n "tenant" modules/30-e2e-and-testing-strategy.md | head -1` shows the gloss; prose at most +90 over the count measured just before, and the LOG line gives both counts (`module-stats.mjs` and the QUALITY-BAR one-liner).
- Model: **Sonnet** (every text prescribed; no new verification; the sources for T-2's `fullyParallel` and F-1 are cited here with lines).

### FIX-M30-02 · S · Anchors for the file-level links into 30 (T-12; +0 words)
- Files: `modules/11-accessibility.md`, `modules/29-testing-angular.md` (link targets only).
- Do: apply the Handoffs table (8 anchors: 11:626, 11:1542 → S6; 29:41, 29:1574, 29:1609, 29:2870 → S1; 29:222, 29:1552 → S2). Find each line by its quoted text; verify each slug against module 30's `## N.` headings. The 5 header, Read-next and Uses-these-ideas-later links stay file-level; 09:1260 is not edited.
- Acceptance: `node labs/tools/check-links.mjs --planned` exits 0; both files' prose word counts unchanged (one-liner before and after); no other text changes; module 17 untouched.
- Model: **Sonnet**. Files disjoint from FIX-M30-01.

Common rules for each task: only the declared files change; no git writes; the module stays at or under 15,115 words; check commands run one at a time with Node 24 (`export PATH=/opt/homebrew/opt/node@24/bin:$PATH`).

## For Jorge

1. **Anchor map differs from M30.md 134 in two places** (Handoffs): 29:1552 to §2 instead of §1, 29:1609 to §1 instead of §2, both by the sentence's subject. FIX-M30-02 uses this review's map; say if you prefer the plan's. Not blocking.
2. **Unchanged open points from M30.md and CLOSE-M30:** VERSIONS.md pins `@playwright/test` 1.63.0 while 1.64.0 has been `latest` since 2026-10-07 (F1; no task edits VERSIONS.md); the committed baseline `todos-empty-chromium-darwin.png` is macOS-only, so a Linux CI run would need its own `-chromium-linux.png` (§6 says so). None blocks a FIX.
3. **Optional, not proposed as a FIX:** §9's "skipped tests are counted in 1.63.0" rests on a source read; this review's scratchpad run agrees. If you want it observed in the labs, a later task could add a `runner-fixtures/skip-project` and a `Section 9:` test asserting shard 1 = `a1 a2` and shard 2 = `b1 c1` with `--fully-parallel`.

Scratch deleted: yes. No probe file was created under the repository; the scratchpad folder (scan script, Mermaid install and parse script, skip-counting probe project with its symlink, fetched docs) was removed with an absolute path at the end; the only server started was Playwright's `webServer` for the 5-of-5 run, which stopped with it (nothing listening on port 4300 afterwards); `labs/e2e/test-results/` is covered by `labs/e2e/.gitignore`.
