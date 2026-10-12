# REVIEW-M24: `modules/24-routing.md`

- **Reviewer:** subagent, model claude-opus-5-5, session S20261010-1659-claudecode. The module was written by PLAN-M24 and SEC-M24-01..10 (S20261010-0939-claudecode; planner claude-opus-5-5, writers claude-sonnet-5-5) and by EX-M24-01..06, QB-M24-01..07 and CLOSE-M24 (S20261010-1110-claudecode, claude-sonnet-5-5), per the `Done by` fields. The reviewer wrote no module-24 task, so it is eligible.
- **Date:** 2026-10-10
- **Files read:** `modules/24-routing.md` (all 2,980 lines, read end to end; every line number below comes from that read); `_meta/RUN.md` §5, §6, §7, §10; `_meta/QUALITY-BAR.md`; `_meta/TASKS.md` (REVIEW-M24, REVIEW-M23, REVIEW-M22, the module-24 common rules, FIX-M23); `_meta/reviews/REVIEW-M23.md` (format model); `_meta/modules/M24.md` (plan, F1-F34, C1-C13, owner map, breadth gate); `SOURCES.md` (Module 24, lines 1355-1411); `_meta/LOG.md` (the M24 lines, mutation counts); the lab folder `labs/angular/src/app/modules/24-routing/` (ten `concepts/` specs, `outputs/q24-outputs.spec.ts`, six exercise folders, `legacy/deprecated-forms.ts`); the installed `@angular/router` 22.2.1 (`fesm2022/_router-chunk.mjs`, `fesm2022/_router_module-chunk.mjs`, `types/router.d.ts`, `types/_router_module-chunk.d.ts`) and `@angular/common` 22.2.1 (`fesm2022/_location-chunk.mjs`, `_platform_location-chunk.mjs`, `_common_module-chunk.mjs`); `@angular/router` 22.2.1 packed with `npm pack` (its `types/` and `_router-chunk.mjs` are byte-identical to the installed ones); the Angular `CHANGELOG.md` and `CHANGELOG_ARCHIVE.md` on `main` and the Angular `main` docs `guide/routing/route-guards.md`, `read-route-state.md`, `show-routes-with-outlets.md`, `common-router-tasks.md`, `data-fetching-with-resources.md` and `tools/cli/deployment.md` (all fetched 2026-10-10 from `raw.githubusercontent.com`).
- **What was run** (Node 24, `export PATH=/opt/homebrew/opt/node@24/bin:$PATH`, one check at a time): from `labs/angular`, `npx ng test --watch=false --include='src/app/modules/24-routing/**/*.spec.ts'` (17 files, 164 tests, all passed); `npx tsc -p tsconfig.spec.json --noEmit` (exit 0); `npx ng build` (exit 0; compiles `legacy/deprecated-forms.ts`, `exercise-3-guards/legacy/class-guard.ts` and every exercise source); from the guide root, `node labs/tools/check-links.mjs --planned` ("All links resolve.", 468 planned links, exit 0); `node labs/tools/check-snippets.mjs . 24` ("All snippets check out.", exit 0); `node labs/tools/module-stats.mjs` (row 24: 34 Q, 6 Ex, 21,677 prose words, Output 14, Concept 8, Difference 5, Trade-off 3, Bug hunt 2, Design 2, no flags) and the QUALITY-BAR Python count (21,677, the same); the Mermaid parser (mermaid 11.12.0 under jsdom 26.1.0, installed in the scratch directory; a malformed negative control fails as it should): 10 of 10 diagrams parse. Scripts (read-only): cited-test-name check (192 citations, 127 distinct, against the spec `it`/`describe` titles), exercise criteria against `it()` titles (six exercises), D1 anatomy counts, per-answer word and follow-up counts, `[Q24.NN](#q24-NN)` link-ID match and cross-module question headings, first-body-mention scan for every status marker, `grep` of every internal name in the file the module names, URL scan, SOURCES block extraction, link-context extraction for every link to 24 in modules 02-23.
- **Basis of each finding:** stated on the finding as **run** (executed), **package source** (read in the installed or the npm-packed 22.2.1), **docs** (Angular `main` docs, CHANGELOG) or **read** (read in the module, the labs or SOURCES, nothing executed).
- **Probe files:** only under `/Users/jorge.quintero/.claude/jobs/1324502a/tmp/review-m24/` (logs, packed tarball, fetched CHANGELOG and docs, Mermaid install, scripts); deleted at the end (last line of this file). No probe spec was needed: every runtime claim checked is asserted by an existing spec, and the 164-test run reproduces them.

Overall: a strong, honest module with no Fail and no Major finding. Everything quoted from a run reproduced: the 14 *Output* answers equal their `toEqual`/`toBe`/`toMatchObject` assertions (run), all 127 distinct cited `Section N:`, `Q24.NN …` and `E24.N …` names exist (the five `E24.N <criterion>` forms are the `describe` prefix plus the `it` title), the criteria of Exercises 24.1-24.6 equal their test titles word for word, every marker version traces to a CHANGELOG heading and a 22.2.1 typings tag, every "read from the source" claim sampled matches the 22.2.1 source (pipeline order, `abortable`, `MAX_ALLOWED_REDIRECTS = 31`, the input-binding merge, the `shouldRunGuardsAndResolvers` default branch, `createViewTransition`'s timer, `destroyDetachedRouteHandle`), and the seven docs quotes are verbatim. "Cancelled resolves `false`, an error rejects, a redirect resolves `true`" is stated correctly everywhere it appears. The weak points are small: two markers sit after the first body mention (F-1); one Explain-it-back prompt asks the reader to explain a false claim (F-2); §9 names the wrong file for `RouterScroller` (F-3); three exercise alternatives are not run (F-4); a Summary simplification (F-5); four answers have one follow-up (T-1); two spec classes use constructor injection (T-2); small format, link and Connections nits (T-3 to T-5); 20 file-level links to 24 in 11 modules (T-6); about 230 words of answer-to-section retelling (T-7). Net after the proposed tasks: about -100 words from 21,677, far under the 22,580 ceiling.

---

## QUALITY-BAR

Counts: **42 Pass, 3 Partial, 0 Fail, 0 N/A** (45 items). Items not Pass: C4, D1, F2.

| ID | Result | Evidence |
|---|---|---|
| A1 | Pass | Header lines 3-9 in STYLE-GUIDE §4.1 order (What this covers, Prerequisites, Leads to, Applies to, Study time, Short on time, Labs with the run command). I ran the command: 17 files, 164 tests passed. |
| A2 | Pass | Prerequisites (line 4) link 16 §5, 19 §1, 23 §1 and 15 §4 with anchors; all resolve (link check). |
| A3 | Pass | Short on time (line 8): four section links, six question IDs (Q24.02, 12, 16, 19, 24, 25), Exercise 24.3 and the Summary; every link resolves. |
| A4 | Pass | Contents (13-27) list the ten sections and the five closing sections; `## ` headings at 31, 136, 260, 371, 491, 630, 751, 897, 1080, 1192, Summary 1284, Question bank 1292, Hands-on exercises 2401, Check your understanding 2915, Connections 2975. |
| A5 | Pass | Configuration, parameters, outlets, lazy loading, guards, resolvers, the lifecycle, preloading and reuse, transitions/scrolling/titles, then the platform; §7 before §8 as the plan argues (preloading starts on `NavigationEnd`). Forward links (`canMatch` in §4 to §5, recognition to §7) are labelled. |
| B1 | Pass | Script: each of the six subsection headings appears 10 times; `#### Legacy` 9 times (§1, 2, 4, 5, 6, 7, 8, 9, 10; §3 needs none). |
| B2 | Pass | Read: each problem opens with a failure (a wildcard swallowing `/home`, a stale snapshot, a panel lost on navigation, a refused user who still downloaded the chunk, a slow `false` beating a redirect, a silent `EMPTY` cancel, a progress bar stuck on, a slow first click and a lost list, a constant tab title, a deep link 404). |
| B3 | Pass | 10 `mermaid` blocks of the planned types, 10 `What to notice` lines; 10 of 10 parse under mermaid 11.12.0 (run); none rendered in a browser. |
| B4 | Pass | Read: each section answers a "why" from a source read with file and function (`Recognizer.processSegment`, `validateConfig`, `getInherited`, `RoutedComponentInputBinder`, `OutletInjector`, `matchWithChecks`, `getOrCreateRouteInjectorIfNeeded`, `checkGuards`, `prioritizedGuardValue`, `resolveNode`, `shouldRunGuardsAndResolvers`, `setupNavigations`, `getBootstrapListener`, `createNode`, `buildTitle`, `createViewTransition`, `HistoryStateManager`, `PathLocationStrategy.prepareExternalUrl`); all found by `grep` (one file slip, F-3). |
| B5 | Pass | Read: every `### Code` has an approach sentence and numbered steps (§8 has two sets). |
| B6 | Pass | Read: every best-practice item (38) has a "because". |
| B7 | Pass | Read: all 40 Misconceptions bullets carry a cause clause; the two "Once true" bullets (§2 255, §7 892) cite v22 and v21, both from CHANGELOG lines. |
| B8 | Pass | *Framework vs platform* callouts at §4 (413), §9 (1117), §10 (1227); `[!WARNING]` at §5 (537) and §6 (670). No *Coming from the backend* is required (C2) and none is written. |
| B9 | Pass | Defined at first use: route, route table, router feature, segment, prefix/full, redirect (absolute/relative), wildcard, jsdom, `UrlTree`, segment group, matrix and query parameters, fragment, path parameter, `ActivatedRoute`, snapshot, `paramMap`, inheritance, componentless route, component input binding, router outlet, router state, outlet tree, primary and named outlet, outlet command, loader, recognition, chunk, route injector, auto cleanup, guard, `GuardResult`, `MaybeAsync`, `RedirectCommand`, guard factory, resolver, resolved data, navigation error handler, router resource, blocking, navigation, transition, navigation id, router event, terminal event, cancellation code, `Navigation` object, preloading, preloading strategy, bootstrap listener, reuse strategy, detach, attach, stored handle, `TitleStrategy`, `Scroll` event, `ViewportScroller`, anchor scrolling, View Transitions API, `Location`, `LocationStrategy`, base href, `PlatformLocation`. |
| B10 | Pass | Read: the 15/16/24 split holds (`loadComponent` versus `loadChildren`, `forRoot` and identities are one sentence plus a link each: 113, 297, 409, 411, 487, 1307, 1697, 1732). Inside-module retelling is T-7. |
| C1 | Pass | 30 claims sampled (table below); 28 match; one file attribution slip (F-3) and one false prompt (F-2). |
| C2 | Pass | 14 *Output* questions (Q24.02, 06, 07, 10, 12, 13, 15, 16, 18, 21, 24, 25, 29, 31), each with tests named after its ID in `outputs/q24-outputs.spec.ts` asserting exactly the printed result, follow-up values included (cross-check below). |
| C3 | Pass | Script: 192 cited names (127 distinct), 0 missing; 3 spec titles uncited (`Section 5: GuardsCheckEnd reports shouldActivate false for a refused navigation`, `Section 9: the legacy ExtraOptions constants …`, `Section 10: the legacy form is the useHash option`). Every "observed" sentence names a test or says "read, not run". |
| C4 | Partial | Every marker version is right (list below), but `canMatch` and `canLoad` are marked after their first body mention (F-1), and four markers are in backticks (T-3). |
| C5 | Pass | `ng test`, `tsc` and `ng build` exit 0; every router API in a snippet is in the 22.2.1 typings; `provideRoutes` absent (`grep -c` 0), shown as text. |
| C6 | Pass | Grep: 0 `Unverified`, `TASK:`, placeholder or relink markers. |
| C7 | Pass | `check-snippets.mjs . 24` exit 0. |
| C8 | Pass | The module has no URL. SOURCES Module 24 (1355-1411) has the package reads per section, the CHANGELOG lines, the seven docs pages, the MDN reads (`beforeunload`, Network Information API, View Transition API, `scrollRestoration`), RFC 3986, the six exercise code lines and the outputs spec lines. |
| D1 | Partial | Script: 34 each of `### Q`, Short answer, Full explanation, Follow-ups, Trap to avoid; answers average 207 words (min 158 Q24.24, max 266 Q24.23). Q24.02, Q24.03, Q24.04 and Q24.34 have one follow-up, the bar asks for at least two: T-1. |
| D2 | Pass | Read: every Output short answer gives the result and the reason. |
| D3 | Pass | module-stats: Output 14, Concept 8, Difference 5, Trade-off 3, Bug hunt 2, Design 2 (largest 41%); equals the plan. |
| D4 | Pass | Titles follow the sections (Q24.01-05 §1-§2 to Q24.33-34 §10). |
| D5 | Pass | Overlaps are linked follow-ups (Q15.09, Q15.10, Q16.16, Q17.26, Q23.03, Q23.07, Q08.18, Q11.12; each heading checked by script). |
| D6 | Pass | Script: every Q24.NN is linked from the body; all 100 `[Q24.NN](#q24-NN)` links carry the matching ID; each section ends "Drilled in …". |
| D7 | Pass | 34 `<a id="q24-NN">` lines, unique; link check passes. |
| D8 | Pass | 34 questions (ceiling 35, reason in PROGRESS), 6 exercises (ceiling 6). |
| E1 | Pass | Each exercise has Problem, Constraints (with "Not covered"), Acceptance criteria, two hints, Worked solution with criterion account, Alternative with Trade-offs, two or three follow-ups and a Tests link. |
| E2 | Pass | Script: criteria of Ex 24.1-24.6 (six each) equal the `it()` titles exactly (modulo backticks). |
| E3 | Pass | From one route table (24.1) to preloading plus keep-alive reuse with auto cleanup (24.6), which integrates §4, §7, §8. |
| E4 | Pass | 164 tests pass; read: at most 2 `inject(` per class in exercise sources, no `any`, no `vi`/`expect` in non-spec files (`grep`). Untested alternatives are F-4. |
| E5 | Pass | 14 Output questions; exercise specs assert exact URLs, outcomes and counts. |
| F1 | Pass | Summary (1286-1290): three paragraphs, each section's claim and trap with a section link; nothing new (one simplification, F-5). |
| F2 | Partial | Five explain-back prompts naming a listener (2918-2922); prompt 3 asks to explain a false claim: F-2. |
| F3 | Pass | Eight flashcards. |
| F4 | Pass | Builds on, Read next and Uses later (2977-2979), all links resolve; reasons missing for several Read next and Uses later entries (T-5, nit); one label nit (T-4). |
| G1 | Pass | 21,677 prose words (both counters), under the CLOSE limit 21,680 and the ceiling 22,580; about 230 words of retelling (T-7). |
| G2 | Pass | 9 of 9 breadth rows covered (table below). |
| H1 | Pass | `ng test` 17 files 164 tests, `tsc -p tsconfig.spec.json --noEmit`, `ng build`: all exit 0. |
| H2 | Pass | `check-links.mjs --planned`: "All links resolve." |
| H3 | Pass | `git status`: the module-24 lab folder is new and untracked; `labs/angular/package.json` differs only by the earlier `zone.js` 0.16.3 ruling; no `labs/ts-js/src/modules/24-*`; `dist` and `.angular` are gitignored. |

---

## Module-specific checks (REVIEW-M24 entry)

| Check | Result | Evidence |
|---|---|---|
| Every recorded URL, event list, cancellation code, loader count, instance identity and bound value (F1-F33) against a re-run on Angular 22.2.1 under `ng test` | Pass | run: the 164-test run asserts every value quoted (§1 table 63-69, §2 bindings, §3 outlet URLs, §4 loader counts and events, §5 order and results, §6 outcomes and reruns, §7 event table and codes, §8 counts and identities, §9 titles and scroll calls, §10 hrefs and `Location.path()`); prose literals match the spec literals (spot-read: `inboxcompose`, `built 2, destroyed 1`, `[false, '/']`, `cancel:4`, reason "Navigation ID 1 is not equal to the current navigation id 2", `Shop`, `/b?q=1`). |
| Guard order (F15) and array combination (F17): first non-`true` in array order, not the fastest | Pass | run: `Q24.15 …`, `Q24.18 …` (three arrays), `Section 5: in one array the first non-true result in array order wins`; package source: `prioritizedGuardValue` (7 hits in `_router-chunk.mjs`). Stated correctly at 529, 617, 623, 1918-1926, 1288. |
| "Cancelled resolves `false`, an error rejects, a redirect resolves `true`" everywhere (F16, F21, F24) | Pass | read: 495, 531, 624, 640, 656-660, 746, 778-793, 893, 1288, 1855, 2022, 2132, 2138, flashcard 2952; all correct. |
| Input-binding merge order and `undefined` over a default (F8) | Pass | package source: `{ ...queryParams, ...params, ...data, ...activatedRoute.resources }` (`_router-chunk.mjs` 1677-1682); run: `Q24.06 …` and `Section 2:` tests; 171, 1487-1495. |
| v22 inheritance default and the componentless exception (F7) | Pass | package source: `getInherited` condition (`'always'`, `path === ''`, no `component` and no `loadComponent`); run: `Q24.07 …`; 146, 169, 1529-1534. |
| Every status marker against the CHANGELOG and the typings tags, at the first body mention; `withExperimentalAutoCleanupInjectors` unversioned; `withViewTransitions` as planned | Pass for versions, Partial for position | CHANGELOG (heading the line sits under) and 22.2.1 typings: function `redirectTo` 18.0.0; `provideRoutes` removed 22.0.0; `paramsInheritanceStrategy` default 22.0.0; input binding 16.0.0, `unmatchedInputBehavior`/options 22.0.0; `routerOutletData` 19.0.0; loaders in injection context 20.1.0; `withAutoCleanupInjectors` `@publicApi 22.2`, CHANGELOG 22.2.0 "stabilize"; `CanMatch` 14.1.0; `currentSnapshot` 21.2.0, required 22.0.0; `canLoad` deprecated 15.1.0; `mapTo*` 16.0.0; `RedirectCommand` 18.0.0, thrown 22.2.0; `withNavigationErrorHandler` 15.2.0; `withRouterResources`/`nonBlocking`/`resources` `@developerPreview 22.2`; `NavigationSkipped` 15.1.0; `abort` 20.0.0; `currentNavigation` 20.2.0, `getCurrentNavigation` `@deprecated 20.2`; `lastSuccessfulNavigation` signal 21.0.0; `isActive` `@publicApi 21.1`, `Router.isActive` `@deprecated 21.1`; `destroyDetachedRouteHandle` `@publicApi 22.2`; `Route.title` 14.0.0; `withViewTransitions` `@developerPreview 19.0` (17.0.0 history in the legacy line, 1160); `enableViewTransitions` `@experimental 17.0`; `withExperimentalPlatformNavigation` `@experimental 21.1`; `RouterLink` `browserUrl` 22.0.0. `withExperimentalAutoCleanupInjectors` (474) has no version. Positions: F-1; backticks: T-3. |
| Probe-first claims backed by tests or absent (F10 reopen, F11 `ROUTER_OUTLET_DATA`, F29 no-title, C9 `nonBlocking`, §10 path `href`, Ex 24.4 `browserUrl`, Ex 24.6 cleanup) | Pass | run: `Section 3: an outlets command reopens the named outlet`, `Section 3: routerOutletData reaches the routed component through ROUTER_OUTLET_DATA`, `Section 9: a route without a title keeps the previous title with the default strategy`, `Section 6: a nonBlocking resource activates the route before it resolves`, `Section 10: the default strategy renders path hrefs`, E24.4 criterion 2, E24.6 criterion 6. The typings comment on `ROUTER_OUTLET_DATA` says `null`; the run shows `undefined`, and 295 states the difference. |
| Preloading and scrolling tests use a real bootstrap and clean it up (F27, F30) | Pass | read: `withBootstrappedApp` (985-1002) and the §9 and E24.6 equivalents: one `ApplicationRef.bootstrap` each, `ref.destroy()` and `host.remove()` in `finally`; the §9 `startViewTransition` stub is deleted in `finally`; no `console.log` in any spec. |
| Browser history, the View Transitions animation, the Navigation API and server configuration documented only (C3-C6) | Pass | read: 113 "read, not run", 535, 1113 "A real back or forward restore was not run", 1115 "The animation was not observed", 1223 "No server was run", 1228 "Not run here", 1983 "a real back button is not run", 2392. |
| No security claim beyond F20's docs line, with links to 33 and 42 (C10) | Pass | read: 538 (CRITICAL line verbatim), 622, 1762, 1943-1951, 2562, 2640; docs: `route-guards.md` line 3, verbatim. |
| Angular docs quotes verbatim with branch `main` and date (C1) | Pass | docs: `route-guards.md` 3; `read-route-state.md` 41, 185; `show-routes-with-outlets.md` 62; `deployment.md` 60, 69; `common-router-tasks.md` 42 (paraphrased at 246, cited); all verbatim. Typings quotes (`pathMatch` reason, "the `title` from the named outlet is never used", "By default ('deferred')", "CRITICAL: This feature is _highly_ experimental") verbatim. |
| Every internal name of C11 marked internal at first use in each section and found by `grep` in the named file | Pass, one nit | package source: all found; each section's source paragraph opens with "internal names" (§1 71, §2 169, §3 297, §4 407, §5 527, §6 664, §7 825, §8 932, §9 1111-1115, §10 1221). §1's `MAX_ALLOWED_REDIRECTS` (75) is called internal only in Q24.04 (T-4). `RouterScroller`/`consumeScrollEvents` sit in `_router_module-chunk.mjs`, not the file §9 names (F-3). |
| The 15/16/24 split (no retelling of `loadComponent` versus `loadChildren`, default-export unwrapping, `forRoot`, route-injector identities) | Pass | read: 113, 297, 379, 409, 411, 487, 1307, 1697, 1732, 2378; one sentence and a link each. |
| Owner credit correct in every link sentence | Pass | read: lazy loading basics 15's, injector identities 16's (Q16.16), History versus Navigation API 08's, focus after navigation 11's, resources 17's, signal inputs 19's, `switchMap` 23's, teardown 20's, `ResolveFn` typing 07's, chunks 12's, `@defer` 18's, `import()` 05's. |
| Output short answers give the reason | Pass | read: all 14. |
| Every question link points at the intended ID | Pass | script: 100 `[Q24.NN](#q24-NN)` links, IDs match; cross-module targets Q08.18, Q11.12, Q15.09, Q15.10, Q16.16, Q17.26, Q23.03, Q23.07 checked against their headings. One label nit: Ex 24.1 sends NG04014 to Q24.03 (T-4). |
| Terms defined at first use (script) | Pass | B9 row. |
| SOURCES has the code-source lines for the six exercises and the outputs spec, and the package, typings, CHANGELOG and docs reads (script) | Pass | read: C8 row. |
| Every anchored cross-module link resolves and none is bare | Pass | run (link check); bare file links only in the header, Connections and to unwritten modules (27, 29, 31, 32, 33, 34, 38, 42). |
| Sections 1, 2, 5, 6, 7, 8 and 9 have a `#### Legacy` subsection with a migration path | Pass | 111, 217, 583, 719, 864, 1053, 1158, each naming the current form (also §4 472 and §10 1259). |
| All ten Mermaid diagrams parse | Pass | run: 10 of 10. |
| The required callouts (§4 NOTE, §5 WARNING, §6 WARNING, §9 NOTE, §10 NOTE) | Pass | 413, 537, 670, 1117, 1227. |
| Every Misconceptions bullet has a cause clause | Pass | 40 of 40. |
| Every "in the lab" claim names an existing test; no unrecorded run or unmeasured comparison | Pass | script: 127 distinct cited names exist; the mutation counts of Exercises 24.1-24.6 (2479, 2482, 2545, 2634, 2727, 2818, 2902) equal the LOG lines of EX-M24-01..06; "Memory was not measured" (938, 2274), "Not measured here" (2080). |
| Every exercise criterion equals its test title; every offered alternative passes | Pass for criteria, Partial for alternatives | script: E2 row; run: the Ex 24.1, 24.2 and 24.3 alternatives run through the same tests (`ROUTE_TABLES`, `TABS`, `ADMIN_TABLES`); the Ex 24.4, 24.5 and 24.6 alternatives are not in their specs: F-4. |
| Type mix and the Output tests (Output 14, Concept 8, Difference 5, Trade-off 3, Bug hunt 2, Design 2) | Pass | module-stats equals; 14 Output questions with tests. |
| Answers and sections reach the pilot's depth (G1, no filler, no retelling) | Pass | G1 row; retelling T-7. |
| `ng build` compiles `legacy/deprecated-forms.ts` and the exercise sources; no non-spec file uses `vi` or `expect` | Pass | run and read: build exit 0; `grep` of non-spec `.ts` files finds no `vi.` or `expect(`. |
| Module 23's lab files unchanged | Pass | read: the newest file in `23-rxjs-in-depth/` is dated 2026-10-10 09:04, before the first module-24 file (10:05). |
| No file under `labs/ts-js` and no `package.json` change | Pass | `labs/ts-js/src/modules` has no `24-*`; the `package.json` diff is the `zone.js` ruling only. |
| Anchors for the file-level links to 24 in 02, 05, 07, 08, 09, 11, 12, 15, 16, 17, 19, 20, 22, 23 | Done | Handoffs table (20 anchors; header, "Read next", "Uses later" and multi-topic lines stay file-level). |
| No FIX takes the module past 22,580 without cutting as much as it adds | Pass | The proposed tasks net about -100 words from 21,677. |

## Handoffs

Topics that belong to other modules and are only linked: lazy loading basics, `forRoot` and default exports (15 §4, Q15.09-Q15.11); the injector tree and identities (16 §4, §5, Q16.16); History versus Navigation API (08 §7, Q08.18); focus after navigation (11 §5, Q11.12); resources (17 §6, Q17.26); signal inputs (19 §1); teardown (20 §5); `switchMap` and `HttpClient` cancellation (23 §1, §6, Q23.03, Q23.07); `ResolveFn` typing (07 §9); chunks (12 §3); `@defer` (18 §7); `import()` (05 §2); testing (29); security (33, 42).

Module 24 slugs: S1 `#1-router-configuration-providerouter-route-matching-redirects-and-the-wildcard`; S2 `#2-route-parameters-path-matrix-query-and-fragment-inheritance-and-component-input-binding`; S3 `#3-nested-and-named-outlets`; S4 `#4-lazy-loading-in-depth-loaders-canmatch-and-route-injectors`; S5 `#5-functional-guards-canmatch-canactivate-candeactivate-and-redirectcommand`; S6 `#6-resolvers-and-route-data-resolvefn-failures-and-router-resources`; S7 `#7-the-navigation-lifecycle-events-cancellation-and-the-transition-pipeline`; S8 `#8-preloading-strategies-and-route-reuse`; S9 `#9-view-transitions-scroll-restoration-and-titles`; S10 `#10-the-router-and-the-platform-history-api-navigation-api-and-location-strategies`; questions `#q24-NN`.

| File:line | Context | Anchor |
|---|---|---|
| 02:1464 | `requireRole('admin')` returns a `CanActivateFn` from a closure | S5 |
| 05:136 | lazy routes and `@defer` compile to `import()` | S4 |
| 07:445 | binding data to inputs | S2 |
| 08:421 | `withExperimentalPlatformNavigation`, "_highly_ experimental" | S10 |
| 09:1604 | the History API belongs to the router | S10 |
| 11:415 | `TitleStrategy` | S9 |
| 12:697 | a standalone component can be loaded alone | S4 |
| 12:1449 | `loadComponent` imports one class | S4 |
| 15:369 | a `Routes` array, the router's list of path entries | S1 |
| 15:1170 | router features | S1 |
| 15:1706 | guards | S5 |
| 15:2061 | "Preload admin after the first page." | S8 |
| 16:559 | route `providers` make an environment injector; the routes themselves | S4 |
| 16:1410 | routes themselves | S4 |
| 16:1759 | a route's injector is built by the router | S4 |
| 16:1846 | router features as `withX()` arguments | S1 |
| 16:2271 | a route that builds the injector | S4 |
| 17:658 | component input binding | S2 |
| 17:1350 | a `canDeactivate` guard against losing work | `#q24-20` |
| 22:85 | interop table row, `Router.events` | S7 |

Stay file-level: the header lines 08:5, 11:5, 15:5, 16:5, 22:5, 23:5; the Connections lines 05:1680, 07:1365, 08:1159, 11:1597, 11:1598, 12:1861, 15:2255, 16:2482, 19:2527, 20:2235, 22:2592, 22:2593, 23:2745, 23:2746; and 15:1957 (guards, resolvers and preloading together). Verify each line and heading at FIX time.

## Factual findings

**F-1 · Minor (C4) · Two markers sit after the first body mention (basis: read, script, CHANGELOG).** `canMatch` first appears in the body at 379 (§4 mental model: "`canMatch` runs before it"; also 403, 407) and gets its version only at 499 (§5), as "`CanMatchFn` [Added in v14.1]"; the CHANGELOG 14.1.0 line is "Add CanMatch guard to control whether a Route should match". `canLoad` first appears at 474 (§4 Legacy: "`canLoad` is section 5's") and is marked `[Deprecated since v15.1 — use canMatch]` at 585. Nit, same family: `Route.title` [Added in v14.0] sits at 1088 while "a `title` per route" opens §9 at 1084. Fix: "`canMatch` [Added in v14.1] runs before it" at 379 and plain `CanMatchFn` at 499; "`canLoad` [Deprecated since v15.1 — use canMatch] is section 5's" at 474 and no marker at 585 (585 can keep the CHANGELOG-free text); optionally move the `Route.title` marker to 1084. +0 words.

**F-2 · Minor (F2, C1) · An Explain-it-back prompt states a false claim (basis: run, read).** 2920: "Explain to a reviewer why a loading bar hidden on `NavigationEnd` alone stays on after a redirect." After a redirect the second navigation ends with `NavigationEnd` (`Q24.16 …` asserts `start`, `cancel:0`, `start`, `end`; §7 783 says the promise "resolves `true` after the new one ends"), so such a bar hides. The case that leaves it on is a rejected guard, an error or a skip (§7 755, 882; Q24.26 2164). Fix: "stays on after a rejected guard". +0 words.

**F-3 · Minor (B4, C11) · §9 names the wrong file for `RouterScroller` (basis: package source).** 1111 opens "Read from the `@angular/router` 22.2.1 source (`_router-chunk.mjs`)", and 1113 continues with `RouterScroller` and `consumeScrollEvents` without naming another file. `grep` finds `class RouterScroller` 0 times in `_router-chunk.mjs` and once in `_router_module-chunk.mjs` (`consumeScrollEvents` 0 and 2); SOURCES (Section 9 line) already says `_router_module-chunk.mjs`. Fix: "`RouterScroller` (internal, `_router_module-chunk.mjs`)". +1 word.

**F-4 · Minor (E1, TASKS common rule "an alternative offered in an exercise passes the same tests or is removed") · Three exercise alternatives are not run (basis: read, `grep` of the specs).** Ex 24.1, 24.2 and 24.3 run their alternatives through every test (`ROUTE_TABLES`, `TABS`, `ADMIN_TABLES`/`CHECKOUT_TABLES`). Ex 24.5 (2820) offers "a `busy` signal set on `NavigationStart` and cleared on the four terminal events" as an equal solution, but `status.spec.ts` runs only `LabM24NavigationStatus`; its "can stay `true` if one class is missed" is reasoning, not a run. Ex 24.4 (2729, load in the component with `resource`) and Ex 24.6 (2904, `PreloadAllModules`) are contrasts that by design give up a criterion (first paint with the resolved input; nothing preloads on `2g`), and the text does not say they are not run. Fix: Ex 24.5, add the alternative as a second service in `status.spec.ts` and loop the six tests over both (as E24.1-E24.3 do), or remove it; Ex 24.4 and 24.6, say which criterion each alternative gives up and "(not run)". About +20 words.

**F-5 · Nit (F1) · The Summary narrows the rerun rule (basis: package source, read).** 1288: "by default only a path-parameter change reruns them". The default branch of `shouldRunGuardsAndResolvers` returns `!equalParamsAndUrlSegments(curr, future)` (`_router-chunk.mjs` 2450-2452), which compares `params` (path and matrix) and the URL segments; §6 (666, 747) and Q24.22 (2049) say "path parameter or URL segment", Ex 24.4 (2733) "path or matrix parameter". Fix: "only a path or matrix parameter change". +2 words.

## Teaching and completeness findings

**T-1 · Minor (D1).** Four answers have one follow-up; the bar asks for at least two: Q24.02 (1347-1348), Q24.03 (1377-1378), Q24.04 (1418-1419), Q24.34 (2394-2395). Add one each, answered from an existing test or a read already in the module, for example: Q24.02 "*Why does `inject(Router)` throw and not `provideRouter`?* `validateConfig` runs in the `Router` constructor (`Q24.02 an empty-path redirect without pathMatch throws NG04014 when the router is created`)"; Q24.03 "*Can a redirect function inject a service?* Yes, it runs in an injection context (`Section 1: a redirect function runs in an injection context and on every matching navigation`)"; Q24.04 "*Why does the redirect loop not hang the app?* A relative redirect is not followed twice, and absolute ones stop after 31 restarts (`Section 1: absolute redirects that loop reject with NG04016 and relative ones with NG04002`)"; Q24.34 "*Does the hash strategy change what app code reads?* No: `Location.path()` gave `/b?q=1` under both (`Section 10: Location reports the route without the hash prefix under withHashLocation`)". About +90 words.

**T-2 · Nit (STYLE-GUIDE §7.1, `inject()`).** Two printed spec classes use constructor injection while the rest of the module uses `inject()`: §9 `LabM24ShopTitleStrategy` (1138-1148, `concepts/section-9-transitions-scrolling-titles.spec.ts` line 30) and Q24.31's `LabM24ShopTitle` (2305-2314, `outputs/q24-outputs.spec.ts` line 261), `constructor(private readonly title: Title) { super(); }`. Ex 24.1 (2444-2452) shows the `inject(Title)` form. Fix: change both spec classes to `private readonly title = inject(Title);` and re-print the two snippets verbatim (`check-snippets` must pass; Output results unchanged). +0 prose words.

**T-3 · Nit (C4 format).** Four markers are wrapped in backticks, against the common rule "plain": 671 (`` `[Developer preview since v22.2]` `` in the WARNING), 892 (`` `[Changed in v21: now a signal]` ``), 1160 (`` `[Experimental since v17.0]` ``), 2650 (`` `[Developer preview since v22.2]` `` in Ex 24.4). Fix: remove the backticks. +0 words.

**T-4 · Nit.** Q24.10 Full (1620) "a reload and a shared link,." doubled punctuation. Ex 24.1 criterion account (2482) links the NG04014 validation to `Q24.03`, whose subject is prefix versus full; the NG04014 Output is Q24.02: link `#q24-02`. §1 (75) `MAX_ALLOWED_REDIRECTS` is called internal only in Q24.04 (1403): write "(`MAX_ALLOWED_REDIRECTS`, internal)" at 75. Connections "Builds on" (2977) labels a question link as the module: `[11](11-accessibility.md#q11-12) (focus after navigation)`; use 11 §5 (`#5-focus-management-in-spas-and-live-regions`), as M24.md's Builds-on list says. About +1 word.

**T-5 · Nit (F4).** Connections "Read next" (2978) gives a reason for 31 and 33 only (25, 27, 32, 42 have none), and "Uses these ideas later" (2979) none for 31, 32, 33, 42. Add a few words each (about +25 words), or accept, as REVIEW-M23 T-5 allowed.

**T-6 · Minor (anchors).** See the Handoffs table: 20 file-level links to 24 in modules 02, 05, 07, 08, 09, 11, 12, 15, 16, 17 and 22 get section or question anchors.

**T-7 · Minor (G1, B10).** About 230 words of answer-to-section retelling, cuttable without losing a cited test, a cause clause, a "read from the source" pointer or an Output result: Q24.27 Full (2176) repeats §7's pipeline list (825) almost word for word, about 60; Q24.32 Full (2356) repeats §9's scrolling and view-transition runs (1113, 1115), about 60; Q24.05 Full (1438) repeats §2's `/team;t=1/member;m=2` sentence (165), about 35; Q24.13 Full (1732) repeats §4's `getOrCreateRouteInjectorIfNeeded` read (411), about 35; Q24.28 Full (2194) repeats §8's `useExisting` and `canMatch` reads (932, 934), about 40. Link the section for what it already says. Keep each answer at least 165 words (they are 228, 233, 260, 237 and 232 now; the shortest in the bank is Q24.24, 158, not touched).

## Output answer cross-check

All 14 Output questions were compared with `outputs/q24-outputs.spec.ts` by reading each `it`: Q24.02's two URL/text pairs, the NG04014 message parts and the NG04002 follow-up; Q24.06's four bound values, the matrix run, the `/u/42` → `/u/43` pair with `withDefault` `undefined` and the options follow-up (`q` `undefined`, `withDefault` `'default'`); Q24.07's three leaf snapshots; Q24.10's three URL/text pairs and both `true` results; Q24.12's counts 0, 1, 1, the 17-event list with the load pair, the absent pair on the second visit and the refused `0`/`/admin`/`not-found`; Q24.13's four count strings and the same instance; Q24.15's seven-entry log, `['admin', '3']` and the two-entry leave log; Q24.16's four result triples; Q24.18's three result pairs; Q24.21's five result triples, `{ x: 1 }` and code 2; Q24.24's fifteen events; Q24.25's `[false, true]`, `/fast`, both kind lists, both reason strings and `/held`; Q24.29's two result objects; Q24.31's five default titles and two custom ones. All equal; the 164-test run passes (run).

## SYLLABUS §4 coverage (module-24 checklist, 9 rows)

| Row | Where | Status |
|---|---|---|
| Router configuration: `provideRouter`, prefix/full, functional `redirectTo`, wildcard | §1, Q24.01-04, Ex 24.1 | Covered |
| Parameters: path, query, matrix, fragment; `withComponentInputBinding`; `paramsInheritanceStrategy` `[Changed in v22]` | §2, Q24.05-08, Ex 24.2 | Covered |
| Nested and named outlets | §3, Q24.09-11, Ex 24.2 | Covered |
| Lazy loading and route-level providers | §4, Q24.12-13, Ex 24.3, 24.6 | Covered (basics linked to 15 §4) |
| Functional guards, `CanMatchFn` with `currentSnapshot`, `CanDeactivateFn`, resolvers, `RedirectCommand`; guards are UX, not security | §5, §6, Q24.14-23, Ex 24.3, 24.4 | Covered |
| Preloading strategies, route reuse strategy | §8, Q24.28-30, Ex 24.6 | Covered |
| Navigation lifecycle and events; `lastSuccessfulNavigation` signal; cancelling | §7, Q24.24-27, Ex 24.5 | Covered |
| View transitions, scroll restoration, titles | §9, Q24.31-32, Ex 24.1 | Covered (animation documented only, C4) |
| Framework vs platform: Router vs History/Navigation API; hash vs path | §10, Q24.33-34 | Covered |

## Redundancy

About 230 words retold, cuttable (T-7). No overlap with modules 05, 07, 08, 11, 12, 15, 16, 17, 18, 19, 20, 23 beyond one sentence and a link. Net after the FIX sequence: about -100 words.

## Claims to verify

30 claims sampled; basis on each.

| # | Claim (line) | Basis | Result |
|---|---|---|---|
| 1 | 14 Output answers | run | match |
| 2 | 127 distinct cited test names | script | match |
| 3 | Criteria of Ex 24.1-24.6 equal test titles; Ex 24.1-24.3 alternatives run the same tests | script, read | match |
| 4 | `provideRouter` registers `ROUTES` (multi), `ActivatedRoute` (`rootRoute`), `APP_BOOTSTRAP_LISTENER` and the features' `ɵproviders` (1304) | package source (`_router_module-chunk.mjs` 1608-1626) | match |
| 5 | `validateConfig` runs behind `ngDevMode` from the `Router` constructor (71, 1345) | package source (`_router-chunk.mjs` 4656) | match |
| 6 | 31 absolute restarts (`MAX_ALLOWED_REDIRECTS`), then NG04016 in dev mode and `allowRedirects = false` otherwise (75, 1403) | package source (3014, 3070-3076) | match |
| 7 | The typings give the empty-path reason (71) | typings (`_router_module-chunk.d.ts` 2568-2572) | match |
| 8 | `getInherited` conditions (169, 1531) | package source (1223) | match |
| 9 | Input-binding merge order (171, 1489) | package source (1677-1682) | match |
| 10 | `OutletInjector` answers `ActivatedRoute`, `ChildrenOutletContexts`, `ROUTER_OUTLET_DATA` (297) | package source (1623-1633) | match |
| 11 | `ROUTER_OUTLET_DATA` typings say `null`, the run `undefined` (295) | typings (903), run | match (difference stated) |
| 12 | Auto cleanup runs on `NavigationEnd` (400, 411) | package source (`injectorCleanup` at 4573, in the `NavigationEnd` branch) | match |
| 13 | `shouldRunGuardsAndResolvers` default shares `'paramsChange'` (666) | package source (2437-2453); typings "This option is the default" | match |
| 14 | `onSameUrlNavigation` default `'ignore'` (666) | typings ("If unset, the `Router` will use `'ignore'`") | match |
| 15 | No `ResolveEnd` for an empty resolver, then `NoDataFromResolver` (664) | package source (`setupNavigations` resolve stage) | match |
| 16 | `setupAndRunResources` in `_router_module-chunk.mjs`, after `createRouterState` (668) | package source | match |
| 17 | Pipeline order: recognize, guards, resolve, `loadComponent`, `createRouterState`, resources, `take(1)`, `ActivateRoutes`; `abortable = false` after `take(1)` (825, 2176) | package source (`setupNavigations`) | match |
| 18 | Code 1 from an early id check and from `finalize` (2176) | package source | match |
| 19 | `updateTitle` right after `NavigationEnd` (1111) | package source | match |
| 20 | `RouterScroller` in `_router-chunk.mjs` (1111-1113) | package source | slip (F-3) |
| 21 | Without `startViewTransition`, `createViewTransition` yields to a timer (1115) | package source (3696-3698) | match |
| 22 | `withPreloading` uses `useExisting` (932, 2194) | package source (1758-1762) | match |
| 23 | `destroyDetachedRouteHandle` destroys the component and the route's local injector (938) | package source (4190-4196) | match |
| 24 | `PathLocationStrategy` base: `APP_BASE_HREF`, else `<base href>`, else origin (1221) | package source (`_location-chunk.mjs` 70) | match |
| 25 | `NoPreloading` is the default (905) | typings ("`NoPreloading` (the default)") | match |
| 26 | Docs quotes (538, 144, 268, 1223, 1945, 246) | docs (`main`, fetched 2026-10-10) | verbatim |
| 27 | Typings quotes (1186, 1228, 825, 2341) | typings 22.2.1 | verbatim |
| 28 | Every status marker version (C4 row) | CHANGELOG, typings | match; positions F-1 |
| 29 | Explain-back 3: a bar hidden on `NavigationEnd` stays on after a redirect (2920) | run (`Q24.16 …`), read | false (F-2) |
| 30 | Summary: only a path-parameter change reruns resolvers (1288) | package source | narrowed (F-5) |

## Proposed FIX tasks

Ceilings: the module is 21,677 prose words (module-stats and the Python count agree); CLOSE limit 21,680; ceiling 22,580. The sequence nets about -100 words. FIX-M24-01 trims first.

### FIX-M24-01 · S · Trim the retelling and fix markers, prompt, file name and wording (T-7, F-1, F-2, F-3, F-5, T-3, T-4)
- Files: `modules/24-routing.md`.
- Do: T-7 shorten the five Full explanations named (Q24.27, Q24.32, Q24.05, Q24.13, Q24.28) to what the section does not already say, linking the section for the rest; keep every cited test name, cause clause, "read from the source" pointer and Output result, and each answer at least 165 words. F-1 move `[Added in v14.1]` to `canMatch` at its first body mention in §4 and `[Deprecated since v15.1 — use canMatch]` to `canLoad` in §4's Legacy, removing them from the later spots (optionally the `Route.title` marker to §9's first paragraph). F-2 "stays on after a rejected guard" in Explain-it-back 3. F-3 name `_router_module-chunk.mjs` for `RouterScroller` in §9. F-5 "only a path or matrix parameter change" in the Summary. T-3 remove the backticks around the four markers. T-4 the doubled punctuation in Q24.10, the `#q24-02` link in Ex 24.1's account, "internal" after `MAX_ALLOWED_REDIRECTS` in §1, the 11 §5 anchor in Connections. Find every spot by text (line numbers move).
- Acceptance: common rules below; the marker scan finds `canMatch` and `canLoad` marked at their first body mention; prose count at most 21,490 (both counters).
- Executor: claude-sonnet-5-5 (mechanical text editing with counts; no new claims).

### FIX-M24-02 · M · Follow-ups, alternatives and `inject()` in two spec classes (T-1, F-4, T-2, T-5)
- Files: `modules/24-routing.md`; `labs/angular/src/app/modules/24-routing/exercise-5-navigation-status/status.spec.ts`; `labs/angular/src/app/modules/24-routing/concepts/section-9-transitions-scrolling-titles.spec.ts`; `labs/angular/src/app/modules/24-routing/outputs/q24-outputs.spec.ts`; `SOURCES.md` (Module 24 block, only if a code line changes).
- Do: T-1 add a second follow-up to Q24.02, Q24.03, Q24.04 and Q24.34, each answered from an existing test or a read already in the module (candidates in T-1; re-check each cited name). F-4 add Ex 24.5's alternative (a `busy` signal set on `NavigationStart` and cleared on the four terminal events) as a second service class in `status.spec.ts` and run the six `E24.5` tests over both, keeping the six `it` titles unchanged; if it fails a criterion, remove the alternative from the text instead and say so in the LOG line; in Ex 24.4 and 24.6 name the criterion each alternative gives up and add "(not run)". T-2 change `LabM24ShopTitleStrategy` (section 9 spec) and `LabM24ShopTitle` (outputs spec) to `private readonly title = inject(Title);` and re-print the two snippets verbatim. T-5 (optional) a reason for each Read next and Uses later entry.
- Acceptance: common rules below; the six `E24.5` titles and every `Q24.NN`/`Section N:` title unchanged; `check-snippets . 24` exits 0; `ng build` exits 0; the 14 Output results unchanged; prose at most +140 over the count measured just before (+115 without T-5).
- Executor: claude-opus-5-5 (judgment on follow-ups that must cite existing assertions and on whether the alternative passes; edits a spec and re-runs the module tests).

### FIX-M24-03 · S · Anchors for file-level links to 24 (T-6; +0 words)
- Files: `modules/02-js-scope-closures-this.md`, `05-js-modules-memory-modern-features.md`, `07-ts-advanced-types-and-decorators.md`, `08-browser-rendering-dom-events.md`, `09-web-networking-storage-security.md`, `11-accessibility.md`, `12-angular-how-it-works.md`, `15-standalone-and-ngmodules.md`, `16-dependency-injection.md`, `17-signals.md`, `22-rxjs-foundations.md` (link targets only).
- Do: apply the Handoffs table (verify each module-24 heading slug after FIX-M24-01 and 02, and each line by text). The stay-file-level lines stay.
- Acceptance: `check-links --planned` exits 0; the word count of every file touched is unchanged; no other text changes.
- Executor: claude-sonnet-5-5 (mechanical link edits). Touches files disjoint from 01 and 02; may run in parallel with them, but verifies slugs after both.

Common rules for each task: from `labs/angular` run `npx ng test --watch=false --include='src/app/modules/24-routing/**/*.spec.ts'` (17 files, 164 tests) and `npx tsc -p tsconfig.spec.json --noEmit`; `check-links --planned` and `check-snippets . 24` exit 0; cited `Section N:`, `Q24.NN` and `E24.N` names unchanged; the 14 Output results unchanged; prose count at or under 22,580.

After the three tasks: about 21,677 - 230 + 5 + 115 = 21,567 (with T-5 about 21,592), hard stop 22,580.


Scratch deleted: yes. `/Users/jorge.quintero/.claude/jobs/1324502a/tmp/review-m24/` (logs, packed tarball, fetched CHANGELOG and docs, Mermaid install, scripts) was removed with an absolute path; no server or vitest process was left running; `labs/angular/.angular/` and `labs/angular/dist/` are covered by the lab's `.gitignore`.
