# REVIEW-M27: `modules/27-http-client.md`

- **Reviewer:** reviewer subagent, model claude-opus-5-5, dispatched 2026-10-13 by the main session (claude.ai/code session_01M48Xf3g6V9m3fDLbQaYgaP; the main session records the session ID in LOG). The module was written by PLAN-M27 (S20261011-1909-claudecode, planner claude-opus-5-5), SEC-M27-01..04 (S20261011-2000-claudecode), SEC-M27-05..08 (S20261011-2218-claudecode), SEC-M27-09..10 (S20261012-1028-claudecode), SEC-M27-11 and EX-M27-01 (S20261012-1040-claudecode), EX-M27-02..05 (S20261012-1123-claudecode), all claude-sonnet-5-5 writers; EX-M27-06 and QB-M27-01..07 (S20261012-1139-claudecode, claude-fable-5-1); CLOSE-M27 (S20261013-0021-claudecloud, claude-sonnet-5-5), per the `Done by` fields. The reviewer wrote no module-27 task and is not a continuation of those conversations, so it is eligible.
- **Date:** 2026-10-13
- **Files read:** `modules/27-http-client.md` (all 2,556 lines, end to end in chunks; line numbers below are from that read and move at FIX time); `_meta/RUN.md` §5-§7, §10; `_meta/QUALITY-BAR.md`; `_meta/TASKS.md` (REVIEW-M27, REVIEW-M26, the module-27 common rules, the FIX-M26 block); `_meta/reviews/REVIEW-M26.md` (format model); `_meta/modules/M27.md` (Lab decision, F1-F29, C1-C11, owner map, breadth gate, diagram types, closing material, link map, For Jorge); `_meta/GLOSSARY-TERMS.md` (Module 27); `SOURCES.md` (Module 27 block, line 1518 to the end); `VERSIONS.md` rows 41-42, 67, 75-76; `_meta/LOG.md` (PLAN-M27, EX-M27-04..06, CLOSE-M27 lines); the lab folder `labs/angular/src/app/modules/27-http-client/` (all spec titles by script, the twelve Output assertions, `section-2-setup.spec.ts` 88-95, `section-3-requests.spec.ts` 114, `exercise-5-upload/upload.service.ts`); the installed `@angular/common` 22.2.1 (`types/{http,_module-chunk,http-testing}.d.ts`, `fesm2022/{_module-chunk,http,http-testing}.mjs`) and `@angular/core` 22.2.1 (`types/core.d.ts`, `fesm2022/_resource-chunk.mjs`, `schematics/migrations.json`), by `grep` and short reads; `npm pack` of `@angular/common` 21.2.25, 21.0.2 and 21.0.3; the Angular `CHANGELOG.md` and the `main` docs `adev/src/content/guide/http/{overview,setup,making-requests,interceptors,http-resource,testing}.md`, `guide/security.md`, `guide/ssr.md` (fetched 2026-10-13 from `raw.githubusercontent.com`); every line linking `27-http-client.md` in modules 03-26; module 21 lines 60 and 263, module 17 lines 463 and 535.
- **What was run** (Node 24.21.0, `export PATH=/opt/nvm/versions/node/v24.21.0/bin:$PATH`, one check at a time): from `labs/angular`, `npx ng test --watch=false --include='src/app/modules/27-http-client/**/*.spec.ts'` (18 files, 178 tests, all passed; run twice, the second time with a `NODE_OPTIONS=--import` guard that wraps the real `globalThis.fetch` and logs any call: the guard loaded in every worker and logged no real call); `npx tsc -p tsconfig.spec.json --noEmit` (exit 0); `npx ng build` (exit 0, no warnings; `tsconfig.app.json` includes `src/**/*.ts` minus specs, so `legacy/legacy-interceptor.ts` and every exercise source compile); from the guide root, `node labs/tools/check-links.mjs --planned` ("All links resolve.", 443 planned links, exit 0); `node labs/tools/check-snippets.mjs . 27` ("All snippets check out."); `node labs/tools/module-stats.mjs` (row 27: 34 Q, 6 Ex, 22,462 prose words, Output 12, Concept 8, Trade-off 4, Bug hunt 4, Difference 3, Design 3, no flags); the QUALITY-BAR one-liners (D1 34 of each part; D3 as module-stats; G1 22,462); the Mermaid parser (mermaid 11.12.0 under jsdom 26.1.0 installed in the session scratchpad; a malformed negative control fails as it should): 11 of 11 diagrams parse; a scratch `tsc` 6.0.3 probe against the lab's `@angular/common` 22.2.1 typings (TS2769 for a widened `{ observe: 'events' }`, nothing for `as const`; and the `RequestUploadService` return type without its `as` cast compiles). Scripts (read-only): cited-test-name check (108 distinct cited names, all exist), exercise criteria against `it()` titles, `<details>` balance and nesting, `[Q27.NN](#q27-NN)` link-ID match and coverage, misconception cause and best-practice "because" scans, first-body-mention marker scan, internal-name marking per section, question and exercise, quoted-phrase check against the fetched docs, CHANGELOG and typings, CHANGELOG attribution by version heading, answer and section word counts, link-context extraction for the 52 links to 27.
- **Basis of each finding:** **run** (executed), **package source** (installed 22.2.1 or the `npm pack` tarballs), **docs** (Angular `main` docs, CHANGELOG) or **read** (module, labs, LOG, SOURCES; nothing executed).
- **Probe files:** only in the session scratchpad (`/tmp/claude-0/.../scratchpad`: test logs, scripts, the fetch guard, the Mermaid install, `npm pack` tarballs, fetched docs, the `tsc` probe with a `node_modules` symlink); deleted at the end (last line). No probe spec was added to the labs.

Overall: a strong, well-evidenced module with one Major and no Fail. Everything quoted from a run reproduced: the twelve *Output* answers equal their assertions, all 108 distinct cited `Section N:`, `Q27.NN …` and `E27.N …` names exist, the criteria of Exercises 27.1-27.6 equal their `it()` titles one to one, every marker version traces to the typings, the `npm pack` reads or a CHANGELOG heading at or below 22.2.1, the docs and typings quotes are verbatim except two fragments, every sampled source read matches 22.2.1, no spec touches the network, and there is no Zod import. The weak points: Exercise 27.3's worked-solution `<details>` is never closed, so Exercises 27.4-27.6, Check your understanding and Connections render collapsed inside it (T-1, Major); Exercise 27.2's placement follow-up contradicts Q27.14 (F-1); progress events are said to "run change detection" as a fact from a zone-era typings sentence (F-2); the advice to scope `withXhr()` to upload routes hides that such a child cannot forward to its parent (F-3); Exercise 27.3's alternative is not run (T-2); and a set of small text, term, marker and excerpt slips. Net after the proposed tasks: at most about +220 words from 22,462 (about 22,680), under the 23,370 ceiling.

---

## QUALITY-BAR

45 items: **37 Pass, 8 Partial (B6, B7, B9, C1, C4, D2, E1, F4), 0 Fail.** The CLOSE left B3, B9, C1, C4, D5 and E2 partial; this review completes them: B3, D5 and E2 Pass, B9, C1 and C4 Partial.

| ID | Result | Evidence |
|---|---|---|
| A1 | Pass | Header lines 3-9 in STYLE-GUIDE §4.1 order; I ran the Labs command: 18 files, 178 tests passed. |
| A2 | Pass | Prerequisites (line 4) link 09 §2, 16 §7, 22 §3, 23 §2, 23 §4 and 17 §6 with anchors; all resolve (link check, run). |
| A3 | Pass | Short on time (line 8): four section links (§1, §4, §5, §7), six question IDs (Q27.01, 11, 17, 23, 30, 33), Exercise 27.2 and the Summary. |
| A4 | Pass | Contents (13-28) list the eleven sections and the five closing sections; headings at 32, 132, 242, 348, 499, 609, 703, 804, 876, 974, 1065, Summary 1143, Question bank 1151, Hands-on exercises 2113, Check your understanding 2510, Connections 2550. But see T-1: from 2318 on, the rendered page hides the rest inside Ex 27.3's solution. |
| A5 | Pass | The breadth-gate order: framework versus platform, setup, requests, interceptors, errors, caching, auth, XSRF, progress, `httpResource`, then testing as the backend seam (deepest). |
| B1 | Pass | Script: each of the six subsection headings appears 11 times; `#### Legacy` in §2 (213), §4 (429), §9 (932), §11 (1116), each with a migration path. |
| B2 | Pass | Read: every problem opens with a failure (repeated `ok` checks, a vanished auth header, a lost query, a forgotten header, components keyed on `statusText`, ten slow downloads, three refreshes, failing POSTs, `NG02824`, hand-tracked loading, an unanswered request). |
| B3 | Pass | Every mechanism is a flow, hierarchy or state machine and each section has a diagram of the planned type (flowchart LR, classDiagram, flowchart LR, sequenceDiagram, flowchart TD, sequenceDiagram ×2, flowchart TD, stateDiagram-v2 ×2, flowchart LR) plus a `What to notice` line (11); 11 of 11 parse under mermaid 11.12.0 (run). |
| B4 | Pass | Read and package source: each section answers a "why" from a named file and function (`FetchBackend.handle` teardown and `done`, `provideHttpClient`, `HttpParams.clone`, `HttpInterceptorHandler.handle` with `reduceRight`, the `HttpErrorResponse` constructor and `parseBody`, the timeout `setTimeout`, `chainedInterceptorFn`, `xsrfInterceptorFn`, `createRequestInit` code 2824, `normalizeRequest`/`HttpResourceImpl`, `provideHttpClientTesting`); every name found by `grep` in the file named. |
| B5 | Pass | Read: every `### Code` has an approach sentence and numbered steps. |
| B6 | Partial | Script: 39 of 40 best-practice items carry "because"; §5 597 "Retry only idempotent methods" has none (T-3). |
| B7 | Partial | Script and read: 44 bullets; §5 605 has no cause clause; §5 603, §8 872 and §11 1137 have weak or ungrammatical ones (T-4). The "Once true" bullets (§1 125, §2 235-236, §8 871, §10 1058) cite the 21.2.25 or 21.0.2 `npm pack` read or a CHANGELOG version (package source, docs). |
| B8 | Pass | §1 has the *Framework vs platform* callout (68-69); the optional *Coming from the backend* callout in §4 (470-483) names its Spring Framework 7.0.9 reference read, has the Spring banner and "Where the analogy breaks". |
| B9 | Partial | Read against the Module 27 glossary terms: all bold or defined at first use in their section, except "testing backend" and "controller" used in §1 (62) and §2 (171, 175) before §11 defines them, "XSSI" (§5 537) never expanded, and "the zone" (§6 641, Q27.19) in a zoneless-default module with no link (T-7). |
| B10 | Pass | Read: the 09/17/23 split holds (module-specific table). |
| C1 | Partial | 30 claims sampled (table below); 26 match; one contradicted follow-up (F-1), one zone-era claim stated as fact (F-2), one incomplete recommendation (F-3), one reversed clause (F-4). |
| C2 | Pass | 12 *Output* questions (Q27.03, 06, 07, 08, 11, 15, 17, 19, 23, 25, 28, 30), each with a test named after its ID in `outputs/q27-outputs.spec.ts` asserting the printed lines (cross-check below). |
| C3 | Pass | Script: 108 distinct cited names, 0 missing; uncited `it` titles are the 38 exercise criteria (cited by the criteria lists) and five section tests behind §5's shape table and §8's runs. The mutation runs quoted in Ex 27.4, 27.5 and 27.6 are in the EX-M27-04/-05/-06 LOG lines (read). |
| C4 | Partial | Marker scan (run as script): 13 markers, plain, STYLE-GUIDE §3.2 forms, versions verified (module-specific table). Positions: `statusText` is first mentioned in prose in §5's problem (503) but marked at 535; `[Added in v22.0]` on `reportUploadProgress` appears twice (177 and 884) (T-8). |
| C5 | Pass | `ng test`, `tsc` and `ng build` exit 0; every API in a snippet is in the 22.2.1 typings. |
| C6 | Pass | Grep: 0 `Unverified`, `TASK:`, placeholder or relink markers. |
| C7 | Pass | `check-snippets.mjs . 27` exit 0. |
| C8 | Pass | The module has no URL. SOURCES Module 27 (1518-end, 62 lines) has the eleven section-spec lines, the six exercise code-source lines, the outputs-spec lines, the package, typings and `fesm2022` reads, `migrations.json` and `http-xhr-backend.cjs`, the `npm pack` reads (21.2.25, 21.0.2), the CHANGELOG lines, the docs pages and the Spring reference. |
| D1 | Pass | Script: 34 each of `### Q`, Short answer, Full explanation, Follow-ups, Trap to avoid; every answer has two follow-ups; answer prose 190-255 words (mean 224). |
| D2 | Partial | Read: every Output short answer gives the result and the reason, but Q27.25 gives a summary table instead of the seven printed lines (T-12). |
| D3 | Pass | module-stats: Output 12, Concept 8, Trade-off 4, Bug hunt 4, Difference 3, Design 3 (largest 35%); equals the plan. |
| D4 | Pass | Titles follow the sections (Q27.01-02 §1 to Q27.33-34 §11). |
| D5 | Pass | `grep` of `### Q` headings across `modules/` for HttpClient, interceptor, XSRF, retry, cache, fetch, upload, progress, refresh, abort, timeout: the neighbours (Q09.01, Q09.03, Q09.04, Q09.06, Q09.09, Q09.22, Q15.09, Q15.23, Q17.26, Q23.07, Q23.08, Q23.14, Q23.15, Q23.19, Q23.30) are linked, not repeated; Q27.17/Q27.18 take the interceptor and placement side of Q23.14/Q23.15 as the plan assigns. |
| D6 | Pass | Script: 116 `[Q27.NN](#q27-NN)` links, IDs match; every Q27.NN is linked from outside its heading. One link points at a question that does not show what it is cited for (F-6). |
| D7 | Pass | 34 `<a id="q27-NN">` lines, unique; link check passes. |
| D8 | Pass | 34 questions (ceiling 35; PROGRESS records the reason), 6 exercises (ceiling 6). |
| E1 | Partial | Each exercise has every part, but Ex 27.3's alternative is not run (T-2) and the Ex 27.5 and 27.6 excerpts stitch non-adjacent lines out of order (T-9). |
| E2 | Pass | Script: the criteria of Ex 27.1-27.6 (6, 6, 6, 6, 6, 7) equal the `it()` titles exactly and every exercise test belongs to a criterion; each account names what the test asserts. |
| E3 | Pass | From a typed service (27.1) to a page integrating §3, §5, §10 and §11 (27.6). |
| E4 | Pass | 178 tests pass (run); `grep`: no `vi.`/`expect(` in non-spec files, no `console.log`, no `zod`; every `stubGlobal` file calls `unstubAllGlobals`. One redundant `as` cast in `upload.service.ts` 50 (T-10). |
| E5 | Pass | 12 Output questions; exercise specs assert exact values, counts and rendered text. |
| F1 | Pass | Summary (1143-1149): three paragraphs linking all eleven sections, each with its trap. |
| F2 | Pass | Four explain-back prompts naming a listener (2513-2516). |
| F3 | Pass | Five flashcards. |
| F4 | Partial | Builds on, Read next and Comparisons carry reasons; "Uses these ideas later" (2554) lists 28, 29, 32, 33, 41, 42 with no reason each and omits 37 and 43 from M27.md's closing plan (T-11). |
| G1 | Pass | 22,462 prose words (module-stats and the one-liner agree), under the CLOSE limit 22,470 and the ceiling 23,370; sections 731-928 words, no filler found. |
| G2 | Pass | 11 of 11 SYLLABUS §4 rows covered (table below). |
| H1 | Pass | `ng test` 18 files 178 tests, `tsc -p tsconfig.spec.json --noEmit`, `ng build`: all exit 0 (run). |
| H2 | Pass | `check-links.mjs --planned`: "All links resolve." (run). |
| H3 | Pass | `git status --short`: only `_meta/` files of the main session's job state and `_meta/STATE-ARCHIVE.md` (not this review's); no lab change since commit `011a24c`; no `labs/ts-js/src/modules/27-*`. |

## Module-specific checks (REVIEW-M27 entry)

| Check | Result | Evidence |
|---|---|---|
| Every recorded backend, status, message, header value, request count, event list and log (F7-F28) against a re-run on 22.2.1 under `ng test` | Pass | run: the 178-test run asserts every value the module quotes; prose literals match the spec literals (spot-read: the five backends; `child`/`alone: controller 0, fetch 1`; `200 v1 {"id":1}`; `a=1&a=2&b=x%20y`; the interceptor log; the three error lines; `requests=4`/`delays=100,200,400`; `reason=AbortError`, `TimeoutError`, `0 undefined`; `refresh requests=1` and `refresh() calls=2`; the seven XSRF lines; `NG02824 …, fetch calls=0`; the eight `httpResource` lines). |
| Backend matrix and the provider-order trap (F7, F8) | Pass | run: the `Section 2` and `Section 11` order tests and Q27.03; package source: `provideHttpClient` lists `{ provide: HttpBackend, useFactory: () => inject(FetchBackend) }` (`_module-chunk.mjs` 2046-2052); `HttpClientModule` providers carry `withXhr()`. |
| Nested clients (F9) | Pass | run: `Section 2: a child provideHttpClient ignores the parent's interceptors`, `… withRequestsMadeViaParent runs the child's then the parent's interceptors`, Q27.06. See F-3 for a consequence the module leaves out. |
| Interceptor order, legacy position (F13-F15) and its source read | Pass | package source: `HttpInterceptorHandler.handle` builds `this.chain` once from `[...HTTP_INTERCEPTOR_FNS, ...rootInterceptorFns]` deduped by a `Set`, `reduceRight` with `chainedInterceptorFn` over `interceptorChainEndFn`, inside `untracked`, with a `PendingTasks` task removed in `finalize` (1311-1327); `legacyInterceptorFnFactory` folds `HTTP_INTERCEPTORS` lazily (1240-1255); run: the `Section 4` tests, Q27.11. |
| Error shapes incl. status 200 parse failures and status 0 (F16) | Pass | run: `Section 5` tests and Q27.15; package source: `HttpErrorResponse` message text (698-700), `TestRequest.error` `statusText: opts.statusText \|\| ''` (`http-testing.mjs` 76). |
| Retry counts and computed delays (F17) | Pass | run: `Section 5: the retry interceptor retries a 503 GET three times with growing delays`, Q27.17, E27.2 tests. |
| Fetch abort and `timeout`; the testing backend's missing timeout (F18) | Pass | package source: `FetchBackend.handle` (779-823: one `AbortController`, `done` flag, `runOutsideAngular(setTimeout(… abort(new DOMException('signal timed out', 'TimeoutError'))))`); run: `Section 6` and `Section 11` tests, Q27.19. |
| Cache interceptor runs (F19) | Pass | run: the three `Section 6` cache tests and E27.3. |
| Refresh queue and the no-loop case (F22) | Pass | run: the seven `Section 7` tests, Q27.23, E27.4. |
| XSRF table and its gates (F23, F24) | Pass | run: the `Section 8` tests, Q27.25; package source: `xsrfInterceptorFn`, `XSRF_ENABLED`, `HttpXsrfCookieExtractor` found; `npm pack` 21.0.2 `ABSOLUTE_URL_REGEX = /^(?:https?:)?\/\//i` and its use in the interceptor (`_module-chunk.mjs` 1889-1891), absent in 21.0.3. |
| `NG02824` and the progress event lists (F25) | Pass | package source: `createRequestInit` throws `_RuntimeError(2824, …)` (986-987); `HttpXhrBackend` adds the `xhr.upload` listener when `reportProgress \|\| reportUploadProgress` and the body is not null (1954-1960); run: the `Section 9` tests and Q27.28. |
| `httpResource` lifecycle and options with `whenStable()` (F26, F27) | Pass | run: the `Section 10` tests, `Section 11: an httpResource value lands after whenStable, not after tick`, Q27.30, E27.6; package source: `ResourceImpl` adds a `PendingTasks` task (`_resource-chunk.mjs` 331, 404). |
| Every status marker against the typings tags, the CHANGELOG and `npm pack` (F2-F5), at the first body mention | Pass for versions, Partial for position | package source: 22.2.1 `withFetch` `@deprecated` (no version), JSONP `@deprecated 22.1`, `reportProgress` `@deprecated 22.0`, `httpResource` and its types `@publicApi 22.0`, `HttpClientModule` `@deprecated` (no version), `statusText` `@deprecated` (no version), `withXhr` `@publicApi` (no version); `npm pack` 21.2.25: 0 `withXhr`, 0 `reportUploadProgress`, `httpResource` `@experimental 19.2`, root `HttpBackend` `useExisting: HttpXhrBackend` (1482), `withFetch` without deprecation. docs (CHANGELOG headings): fetch default and the two deprecations under 22.0.0 (2026-06-03), "Provide http services in root" and the `statusText` deprecation under 21.0.0 (2025-11-19), timeout under 20.1.0 (2025-07-09), JSONP under 22.1.0, `HttpClientModule` under 18.0.0. Position: T-8. |
| `withFetch` and `statusText` deprecation versions resting on the CHANGELOG stated | Pass | §2 235-236 ("whose CHANGELOG deprecates it"), §5 535 ("The CHANGELOG lists it under the 21.0.0 deprecations"); the typings tags carry no version (package source). |
| No CHANGELOG line above 22.2.1 cited as shipped (C1) | Pass | `grep`: no 22.2.2 or 22.3 line; the newest cited line, "forward `reportProgress` of `httpResource` as `reportDownloadProgress`", sits under 22.2.1 (2026-09-30) (docs). |
| Docs quotes verbatim with branch `main` and date | Pass, two fragments | docs: 16 quoted docs/CHANGELOG phrases found verbatim (whitespace-normalized); each carries branch `main` and its read date. Two fragments are not verbatim (F-5). |
| The `withXhr` Angular 23 note quoted as the typings' statement only | Pass | The module quotes only "XHR support on the server is **deprecated**" (Q27.05 1253), attributed to the typings (package source, `http.d.ts` 2228); no Angular 23 forecast anywhere. |
| No Zod import (C8) | Pass | `grep zod` in the lab folder: 0; Zod named only with 07 §8 and `http-resource.md`. |
| Probe-first claims (C6) backed by tests or absent | Pass | run: Q27.06 (stub call count, controller 0), Q27.24 (`… until a guard stops the spec`, `… without single flight …`), §3 TS2769 (`@ts-expect-error TS2769` plus my `tsc` probe), §9 `httpResource` progress (`Section 9: httpResource exposes download progress`), §11 `match` predicate and messages; `Retry-After` and `equal`/`hasValue()` are marked design or typings only. |
| Every internal name of C7 marked internal at first use in each unit, found by `grep` | Pass for `grep`, Partial for marking | package source: every C7 name found in `_module-chunk.mjs`/`http.mjs`/`http-testing.mjs`. Marking: two diagram labels unmarked, and private or internal names outside C7 unmarked (T-8). |
| Owner credit and the 09/17/23 split | Pass | read: `fetch`/XHR 09 §2, CORS 09 §5, cookies 09 §6, HTTP cache 09 §4; `resource` 17 §6/Q17.22/Q17.26; `retry` 23 §4/Q23.15, `switchMap` Q23.07, `shareReplay` 23 §5/Q23.19, `catchError` 23 §3, `rxResource` 23 §7; injection context 16 §4, multi providers 16 §7/Q16.06; `PendingTasks` 21 §5; `ng update` 12 §2; `validateHttp` 26 §6; SSR 32, security 33, contracts 41, auth 42. No retelling beyond one sentence and a link (Q27.02's `resource` sentence is one sentence plus 17 §6). |
| Q15.09 handoff honored | Pass | §2 Legacy (215), §2 misconception (237) and Q27.03 link Q15.09; no question re-asks module versus provider packaging. |
| Output short answers give the reason | Pass | read: all twelve. Q27.25's format: T-12. |
| Every question link points at the intended ID | Partial | script: 116 links, IDs match; Q27.34 cites Q27.11 for `expectNone`, which Q27.11 does not use (F-6). |
| Terms defined at first use (script) | Partial | B9 row (T-7). |
| SOURCES lines (script) | Pass | C8 row. |
| Every anchored cross-module link resolves; none bare except planned files | Pass | run (link check); file-level links only to planned 28, 29, 32, 33, 41, 42 and in the header. |
| Sections 2, 4, 9 and 11 have `#### Legacy` with a migration path; §1 has the callout | Pass | B1 and B8 rows. |
| All eleven Mermaid diagrams parse | Pass | run: 11 of 11; negative control fails. |
| Every Misconceptions bullet has a cause clause | Partial | B7 row (T-4). |
| Every "in the lab" claim names an existing test | Pass | C3 row; the three "probe" wordings are process talk (T-6). |
| Every exercise criterion equals its test title; every offered alternative passes | Partial | E2 Pass; Ex 27.1, 27.2, 27.4, 27.5, 27.6 run both variants (`describe.each`); Ex 27.3's alternative is not run (T-2). |
| Type mix and Output tests (Output 12, Concept 8, Trade-off 4, Bug hunt 4, Difference 3, Design 3) | Pass | D3 and C2 rows. |
| Answers and sections reach the pilot's depth (G1) | Pass | G1 and D1 rows. |
| `ng build` compiles `legacy/legacy-interceptor.ts` and the exercise sources; no non-spec `vi`/`expect` | Pass | E4 row. |
| No spec touches the network or leaves `fetch` stubbed | Pass | run: the fetch guard logged no real call over 178 tests; every spec that calls `vi.stubGlobal` also calls `vi.unstubAllGlobals()` (`grep`). XHR is never exercised without the testing backend (read). |
| Module 26's lab files unchanged | Pass | read: no LOG line after PLAN-M27 names a `26-signal-forms/` file; `git log` shows one commit (`011a24c`) for the folder and no working-tree change. Git cannot prove more, since modules 26 and 27 were committed together. |
| No file under `labs/ts-js`, no `package.json` change | Pass | `git status`: clean under `labs/`; the only `labs/angular/package.json` difference since `2e65b43` is the earlier `zone.js` 0.16.3 ruling; no `labs/ts-js/src/modules/27-*`. |
| Anchors for the 52 file-level links to 27 | Done | Handoffs table (31 anchors, 21 stay file-level). |
| No FIX takes the module past 23,370 without cutting as much as it adds | Pass | The proposed tasks net at most +220 words (about 22,680). |

## Handoffs

Topics owned elsewhere and only linked: as in the owner-credit row above. Module 27 slugs (verify at FIX time; no FIX here renames a heading):

- S1 `#1-httpclient-versus-fetch-what-the-framework-adds-over-the-platform`
- S2 `#2-setting-up-httpclient-providehttpclient-its-features-and-the-fetch-backend-default`
- S3 `#3-making-requests-typed-responses-observe-responsetype-immutable-params-and-headers-and-httpcontext`
- S4 `#4-interceptors-the-functional-chain-order-and-next-and-class-interceptors-through-withinterceptorsfromdi`
- S5 `#5-errors-httperrorresponse-an-error-mapping-layer-and-retry-with-backoff-and-jitter`
- S6 `#6-cancellation-and-caching-unsubscribing-aborts-cache-interceptors-sharereplay-and-the-ssr-transfer-cache`
- S10 `#10-httpresource-signal-driven-requests-and-when-to-prefer-it-over-httpclient`
- S11 `#11-testing-and-the-backend-seam-providehttpclienttesting-httptestingcontroller-and-what-they-replace`
- Q27.09 `#q27-09`, Q27.18 `#q27-18`

| File:line | Context | Anchor |
|---|---|---|
| 03:1236 | JSON crosses as plain objects, never class instances | S3 |
| 07:422 | "Do parse where data enters the app, such as the service that calls the API" | S3 |
| 07:1203 | "In the service that calls the API, right after the response arrives" | Q27.09 |
| 09:132 | Framework vs platform: `HttpClient` wraps them and uses `fetch` by default | S1 |
| 09:266 | "`HttpClient` has no cache" | S6 |
| 09:1388 | Ex 09 alternative: `HttpClient` with `retry` in an interceptor | S5 |
| 12:1636 | `firstValueFrom(inject(HttpClient).get(...))` with `provideHttpClient()` | S2 |
| 15:295 | `HttpClientModule` deprecated since v18.0 | S2 |
| 15:1170 | "HTTP features [module 27]'s" | S2 |
| 16:736 | `HTTP_INTERCEPTORS` "a multi-provider token" | S4 |
| 16:1636 | same, in a later section | S4 |
| 17:459 | "`httpResource` … is taught in [Module 27]" | S10 |
| 17:535 | "Caching is a separate concern" | S6 |
| 17:1533 | `httpResource` with interceptors "covered in [Module 27]" | S10 |
| 17:2272 | "With `httpResource` the adapter disappears entirely" | S10 |
| 22:85 | entry-point table row `HttpClient` | S1 |
| 22:273 | "`HttpClient` sends no request until subscribe and one per subscribe" | S1 |
| 23:182 | `HttpTestingController`, the test double for the backend | S11 |
| 23:367 | "Retry interceptors are [27]'s" | S5 |
| 23:1197 | Q23.07: "`HttpClient` itself is [27]'s" (abort context) | S6 |
| 23:1486 | Q23.15 follow-up: "Interceptor or call site?" | Q27.18 |
| 23:2318 | Ex 23 constraints: "Not covered: interceptors" (retry) | S5 |
| 24:2652 | Ex 24 constraints: "Not covered: `HttpClient`" | S3 |
| 25:675 | "The fake server stands in for `HttpClient`" | S3 |
| 25:1944 | "aborting a real request depends on the Observable, [27's] topic for HTTP" | S6 |
| 25:2712 | Ex 25 constraints: "No `HttpClient`" | S3 |
| 25:2772 | "Swap in an `HttpClient` call, which completes by itself" | S3 |
| 26:480 | `validateHttp` with `httpResource`: "`HttpClient` is [module 27]'s" | S10 |
| 26:1211 | "the server … returns its errors through submission ([27])" | S5 |
| 26:1464 | `validateHttp` run: "`HttpClient` is [module 27]'s" | S10 |
| 26:1868 | Ex 26 constraints: "No `HttpClient`" | S10 |

Stay file-level (21): header lines 09:5, 16:5, 22:5, 23:5, 25:5, 26:5; Read next 09:1605, 15:2255, 16:2482, 22:2592, 23:2745, 24:2978, 25:3071, 26:2100; Uses these ideas later 04:1700, 09:1606, 17:2432, 22:2593, 23:2746, 25:3072, 26:2101. This matches M27.md's section map except 15:2255 (a Read-next line, so file-level) and 23:182 (§11, not §6, because the sentence is about `HttpTestingController`). Verify each line and slug at FIX time (line numbers move).

## Factual findings

**F-1 · Minor (C1) · Exercise 27.2's placement follow-up contradicts Q27.14 (basis: read, package source).** 2246: "*"Where does this sit among the interceptors?"* Inside auth, so a retried request carries the current token (`[Q27.14](#q27-14)`)." Q27.14 lists `[logging, correlationId, errorMapping, retry, auth]` (1494: "auth innermost gives every attempt the current token") and its trap (1502) is "Listing auth before retry: the retried request keeps the token cloned on the first attempt." "Retry inside auth" is that trap: `retry` re-subscribes to its own `next(req)`, which is the request auth already cloned (`chainedInterceptorFn` passes each step's output down, `_module-chunk.mjs`). Fix: "Outside auth, listed before it, so each attempt passes through auth again and carries the current token (`[Q27.14](#q27-14)`)." About +5 words.

**F-2 · Minor (C1) · "Each progress event runs change detection" is stated as fact from a zone-era typings sentence (basis: package source, read).** §9 959 (best practice, attributed to "the `HttpRequest.reportProgress` typings"), §9 970 (misconception: "Each one runs change detection", unattributed), Q27.29 1976 ("Each event runs change detection"). The typings (`_module-chunk.d.ts` 423) say "Progress events are expensive (change detection runs on each event)". That holds where zone.js patches XHR (21 §3, line 263), but v22 is zoneless by default (21 §1, line 60) and the module runs only zoneless; no test measures it. Fix: attribute and scope in all three places, for example "the typings call progress events expensive because change detection runs on each one, which is true under zone.js (`[21 §3](21-change-detection.md#3-zonejs-and-ngzone-how-changes-used-to-be-detected-and-why-zone-left-the-default)`); zoneless, each event still runs your handler and any signal write it makes (`[21 §5](21-change-detection.md#5-zoneless-change-detection-the-scheduler-its-triggers-and-pendingtasks)`)", keeping "request only the direction you display". Re-read 21 §5 before writing the zoneless half, or drop it. About +30 words.

**F-3 · Minor (C1, completeness) · Scoping `withXhr()` to upload routes hides its cost (basis: package source, run).** Q27.05 1256 ("add `withXhr()` only where uploads show progress") and Q27.29's trap 1978 ("use XHR where uploads with progress live") recommend a scoped XHR client without saying how. A child `provideHttpClient(withXhr())` cannot take `withRequestsMadeViaParent()`: `provideHttpClient` throws "Configuration error: withRequestsMadeViaParent() cannot be combined with withFetch() or withXhr() in the same call to provideHttpClient()." (`_module-chunk.mjs` 2041-2043; asserted in `Section 2: contradictory features throw in dev mode`, spec 92-94), so the scoped client is independent and loses the root interceptors (`Section 2: a child provideHttpClient ignores the parent's interceptors`) unless it lists them again. Fix: one clause in Q27.29's trap (and a pointer from Q27.05's follow-up): "a child `provideHttpClient(withXhr(), withInterceptors([...]))` on the upload route, which must list the root interceptors again, because `withRequestsMadeViaParent()` cannot be combined with `withXhr()` (`Section 2: contradictory features throw in dev mode`)". About +35 words.

**F-4 · Nit (C1) · Q27.16's first follow-up has the direction reversed (basis: read).** 1555: "An interceptor maps once for all but hides the status from retry inside it". A mapping interceptor placed outside retry (Q27.14's order) leaves retry seeing the raw `HttpErrorResponse`; it hides the status from the services above it. Fix: "An interceptor maps once for all but hides the raw status from the services above it, so retry must sit inside it (`[Q27.14](#q27-14)`)". +3 words.

**F-5 · Nit (C1 quotes) · Two quoted fragments are not verbatim (basis: package source, docs).** §11 1118: "Add provideHttpClientTesting() to your providers instead." The typings (`http-testing.d.ts` 171) read "Add `provideHttpClientTesting()` to your providers instead." Q27.19 1658: "only to the backend HTTP request itself"; `making-requests.md` reads "The timeout will only apply to the backend HTTP request itself." Fix: add the backticks; quote "only apply to the backend HTTP request itself". +1 word.

**F-6 · Nit (D6, C1) · Two pointers cite a place that does not show the claim (basis: read, script).** Q27.34 1103: "`expectNone` asserts absence (`[Q27.11](#q27-11)`)"; Q27.11 and the whole outputs spec never call `expectNone` (`grep`: 0). Cite `Section 4: an interceptor can answer without reaching the backend` (it calls `expectNone('/cached')`). Q27.21 1690: "`httpResource` re-requests when its params change back (`[section 10](#10-…)`)"; section 10 has no such run; the claim is module 17's (17:535, "Changing back to old params loads again"). Link `[17 §6](17-signals.md#6-resources-async-data-as-signals)` there, and in Q27.31's trap (2048). About +12 words.

## Teaching and completeness findings

**T-1 · Major (A4, rendering) · Exercise 27.3's worked solution is never closed (basis: script, read).** The `<details><summary>Worked solution</summary>` opened at 2280 has no `</details>`: 57 `<details` against 56 `</details>`, and a nesting scan puts the Exercise 27.4 (2318), 27.5 (2381) and 27.6 (2443) headings and every later `<details>` at depth 2. On GitHub, Exercises 27.4-27.6, Check your understanding and Connections render collapsed inside Ex 27.3's solution, so a reader who does not open it sees the module end at Ex 27.3. No tool caught it (`check-snippets`, `check-links` and `module-stats` all pass). Fix: after the `**Tests:**` line of Ex 27.3 (2316), add a blank line, `</details>` and a blank line, as Ex 27.2 has at 2249-2251. +0 words. The same scan over modules 01-26 finds no other imbalance (run).

**T-2 · Minor (E1, every offered alternative passes) · Exercise 27.3's alternative is not run (basis: read, run).** 2309: "store only responses and track in-flight calls in a second `Map` of pending Observables. **Trade-offs:** … the spec runs only the single entry." The spec has a single `describe('E27.3 cache interceptor', …)`, no `describe.each`; the five other exercises run both variants. The rule (module common rules, REVIEW-M26) is that an offered alternative passes the same tests or is removed. Fix: add the two-map variant to `http-cache.ts` behind the same public surface the interceptor uses, run `cache.spec.ts` over both with `describe.each` (titles unchanged), and change the trade-off sentence to say both pass; or, if the variant needs a different interface, replace the alternative with one that can run. About +10 words.

**T-3 · Minor (B6).** §5 597: "**Retry only idempotent methods**; for a POST send an **idempotency key** (…)." No reason. Add "because a repeated POST can apply twice". +7 words.

**T-4 · Minor (B7).** §5 605 "*Exponential backoff is enough.*" has no cause clause; add "because backoff alone looks like it spreads load". §5 603 "*A 200 cannot be an error.*" explains the fact, not the myth; end with "because a 2xx status reads as success". §11 1137: drop "and the docs carry an IMPORTANT note" (not a cause). §8 872: "because cookie authentication habit hides it" → "because cookie sessions make the browser's automatic sending feel normal". About +15 words.

**T-5 · Minor (teaching consistency).** §4's problem (352): "A logger listed before the auth interceptor logs requests without the header." presents as a failure what §4's best practice (488, "List a logger first") and Q27.14 (1494, logging outermost "sees the logical request") recommend. Fix: replace the sentence with "Nobody can say whether the logger records a request before or after the auth header is added." +0 words.

**T-6 · Nit (reader text: process talk).** §10 1005 "with only `TestBed.tick()` the planning probe still read `'loading'`" → "with only `TestBed.tick()` it was still `'loading'` (`Section 11: an httpResource value lands after whenStable, not after tick`)"; §7 797 "the probe started three" → "the test started three (`Section 7: without single flight each concurrent 401 starts its own refresh`)" or simply "a test started three"; Q27.24 1816 "The probe (" → "The test (". About +15 words.

**T-7 · Nit (B9).** "Testing backend" and "controller" first appear in §1 62 ("Against the testing backend") and §2 171/175 ("left the root's controller with none") before §11 defines them: gloss at 62, for example "the testing backend (the in-memory `HttpBackend` of `provideHttpClientTesting()`, answered through `HttpTestingController`; `[section 11](#11-…)`)". "XSSI" (§5 537) is never expanded: "the XSSI prefix (against cross-site script inclusion, `security.md`)". "Outside the zone" (§6 641; Q27.19 1654) in a zoneless-default module: add "(`NgZone.runOutsideAngular`, which matters only under zone.js, `[21 §3](21-change-detection.md#3-zonejs-and-ngzone-how-changes-used-to-be-detected-and-why-zone-left-the-default)`)" at 641. About +35 words.

**T-8 · Nit (C4, C7).** Markers: `statusText` is first named in prose in §5's problem (503: "`err.statusText`") but marked at 535; move `[Deprecated since v21.0 — read status]` to 503 (keep 535's CHANGELOG sentence). `[Added in v22.0]` on `reportUploadProgress` appears at 177 and again at 884; drop it at 884 (keep `reportDownloadProgress`'s, whose first body mention is 884). Internal marks: the §2 diagram (149) names `HttpInterceptorHandler` and the §11 diagram (1080) names `HttpClientTestingBackend`, unmarked in their sections; add "(internal)" in each `What to notice` line or the first prose use. Outside C7 but private or internal in 22.2.1 and unmarked: `FetchBackend.createRequestInit` and `parseBody` (`private` in `http.d.ts` 1888-1889; first use in §2 177, §3 273, §5 537, §7 746, §9 909, Q27.05, Q27.15, Q27.28), `normalizeRequest` in §9 911 (marked only in §10), `ResourceImpl` in Ex 27.6 2492 (exported only as `ɵResourceImpl`); add "(private)" or "(internal)" once per unit. About +15 words.

**T-9 · Minor (E1, B5 readability).** Two excerpts stitch non-adjacent lines out of order, so the code reads as unreachable statements. Ex 27.5 (2416-2423): line 14 (`return Math.floor(…)` of `percentOf`), then line 32 (`send`'s `return`), then lines 36-38 (`toState`), at three indentations. Ex 27.6 (2480-2490): four template lines, then the `results` field. `check-snippets` passes because each line exists. Fix: Ex 27.5 one excerpt of `upload.service.ts` lines 31-41 (`send` and `toState`); Ex 27.6 two excerpts (the `results` field, then the template's `@if` chain). +0 prose words.

**T-10 · Nit (STYLE-GUIDE §7.1 "no `as`").** `exercise-5-upload/upload.service.ts` 50: `) as Observable<HttpEvent<{ id: string }>>;` is redundant: `HttpClient.request<R>(req: HttpRequest<any>): Observable<HttpEvent<R>>` (`http.d.ts` 125) already returns that type, and a scratch `tsc` probe of the same call without the cast exits 0. Fix: remove the cast; run `ng build` and the Ex 27.5 spec. +0 words.

**T-11 · Nit (F4).** Connections "Uses these ideas later" (2554) has no reason per link and omits 37 (`elements-pwa-errors-ecosystem`, which lists 27 as a prerequisite in SYLLABUS) and 43 (`fullstack-realtime`) from M27.md's closing plan. Fix: "[28] (server data as state), [29] (HTTP specs), [32] (the transfer cache), [33] (CSRF and tokens), [37] (global error handling), [41] (error bodies), [42] (issuing tokens) and [43] (realtime beside HTTP), all planned". About +25 words.

**T-12 · Nit (D2).** Q27.25's short answer (1851-1863) is a table ("`PUT` to `other.example` (absolute) | none", "`POST` to `_empty_/api/d` …") rather than the printed lines the test asserts (`PUT https://other.example/api/c -> none`, `POST http://_empty_/api/d -> abc`, …). Fix: give the seven asserted lines verbatim (from `q27-outputs.spec.ts` 363-371) and keep "Three gates: …". About +10 words.

**T-13 · Minor (anchors).** The Handoffs table: 31 file-level links to 27 in modules 03, 07, 09, 12, 15, 16, 17, 22, 23, 24, 25 and 26 take an anchor.

## Output answer cross-check

All twelve Output answers were compared with the `expect(lines)` of `outputs/q27-outputs.spec.ts`: Q27.03 the five backend names; Q27.06 `child`, `alone: controller 0, fetch 1`, `child`, `parent`, `via: controller 1, fetch 1`; Q27.07 `200 v1 {"id":1}`, `Sent`, `Response`, `string hello`; Q27.08 `''`, `a=1&a=2&b=x%20y`, `/s?q=a%20b&page=2&tags=x&tags=y`; Q27.11 the five log lines; Q27.15 the three error lines, including the trailing space; Q27.17 four request lines and `delays=100,200,400`; Q27.19 the four abort and timeout lines; Q27.23 the six lines with `refresh() calls=2`; Q27.25 the seven lines (values equal; format T-12); Q27.28 the two lines; Q27.30 the eight lines. Each short answer gives the reason (run, read).

## SYLLABUS §4 coverage (module-27 checklist, 11 rows)

| Row | Where | Status |
|---|---|---|
| `provideHttpClient` and features; fetch default; `withFetch` deprecated | §2 (§4, §8), Q27.03-06, Ex 27.2, 27.5 | Covered |
| Requests: typed responses, `observe`, `responseType`, params/headers immutability, `HttpContext` | §3, Q27.07-10, Ex 27.1 | Covered |
| Functional interceptors (order, `next`), class interceptors via `withInterceptorsFromDi` | §4, Q27.11-14, Ex 27.2-27.4 | Covered |
| Errors, mapping layer, retry with backoff and jitter, retryable errors | §5, Q27.15-18, Ex 27.1, 27.2 | Covered |
| Cancellation (unsubscribe, `AbortSignal`), caching (interceptor, `shareReplay`, transfer cache) | §6, Q27.19-21, Ex 27.3, 27.5 | Covered |
| Auth: tokens, refresh on 401 with queuing, no refresh loops | §7, Q27.22-24, Ex 27.4 | Covered |
| XSRF: cookie to header, when not | §8, Q27.25-27 | Covered |
| Progress: split options, `reportProgress` deprecated, XHR for upload | §9, Q27.28-29, Ex 27.5 | Covered |
| `httpResource` | §10, Q27.30-32, Ex 27.6 | Covered |
| Testing with `provideHttpClientTesting` and `HttpTestingController` | §11, Q27.33-34, every spec | Covered |
| Framework vs platform: `HttpClient` vs `fetch` | §1 callout, Q27.01-02 | Covered |

## Redundancy

No retelling worth cutting. The likeliest repeats (the backend matrix §2/Q27.03/Q27.05, the chain §4/Q27.11/Q27.12, the error shapes §5/Q27.15/Q27.16, the refresh §7/Q27.23/Ex 27.4, the `httpResource` lifecycle §10/Q27.30/§11) each add a run, a source read or a design point and link back. No overlap with modules 09, 15, 16, 17, 22, 23 or 26 beyond one sentence and a link.

## Claims to verify

30 claims sampled; basis on each.

| # | Claim (line) | Basis | Result |
|---|---|---|---|
| 1 | 12 Output answers | run | match |
| 2 | 108 distinct cited test names exist | script | match |
| 3 | Criteria of Ex 27.1-27.6 equal test titles | script | match |
| 4 | Fetch default under 22.0.0; 21.2.25 root `HttpBackend` `useExisting: HttpXhrBackend` (64, 125) | docs, package source (`npm pack`) | match |
| 5 | `withXhr` and `reportUploadProgress` absent in 21.2.25, so `[Added in v22.0]` (140, 177) | package source (`npm pack`: 0 and 0) | match |
| 6 | `httpResource` `@experimental 19.2` in 21.2.25, `@publicApi 22.0` in 22.2.1; 19.2.0 CHANGELOG line (1015, 1058) | package source, docs | match |
| 7 | `statusText` deprecated under 21.0.0; HTTP/2 note (535, 596) | docs, package source | match |
| 8 | `timeout` under 20.1.0 (250, 275) | docs | match |
| 9 | JSONP `@deprecated 22.1`; `HttpClientModule` deprecated under 18.0.0 (140, 171) | package source, docs | match |
| 10 | "Provide http services in root" 21.0.0 and the `setup.md` sentence (173, Q27.04) | docs | verbatim |
| 11 | `provideHttpClient` recipe and the two dev-mode throws (173, Q27.06) | package source (2035-2052), run | match |
| 12 | Migration `http-xhr-backend`, version 22.0.0 (177, Q27.03) | package source (`migrations.json` 8-11) | match |
| 13 | Chain built once with `reduceRight`, `runInInjectionContext`, `untracked`, `PendingTasks` (382, Q27.12, 649) | package source (1311-1327) | match |
| 14 | Class interceptors folded lazily at the feature's position (386) | package source (1240-1255), run | match |
| 15 | `HttpErrorResponse` messages; `TestRequest.error` empty `statusText` (537, Q27.15) | package source (698-700; `http-testing.mjs` 76) | match |
| 16 | `FetchBackend.handle` abort, `done`, timeout `DOMException` outside the zone (66, 641, Q27.19) | package source (779-823) | match |
| 17 | XHR timeout `DOMException('Request timed out', 'TimeoutError')` (Q27.05) | package source (1822, 1914) | match |
| 18 | `NG02824` thrown before `fetch`; XHR upload listener condition (909) | package source (986-987, 1954-1960), run | match |
| 19 | `withCredentials` sets `credentials: 'include'` (746) | package source (990-994) | match |
| 20 | 21.0.2 skipped absolute URLs with `ABSOLUTE_URL_REGEX` (835, 871) | package source (`npm pack` 21.0.2 1889-1891; absent in 21.0.3) | match |
| 21 | `ResourceImpl` holds a `PendingTasks` task while loading (2492) | package source (`_resource-chunk.mjs` 331, 404) | match |
| 22 | TS2769 for a widened `observe`, none with `as const` (269) | run (scratch `tsc` 6.0.3) | match |
| 23 | `makeEnvironmentProviders` quote (Q27.04 trap) | package source (`core.d.ts`) | verbatim |
| 24 | `debounced` experimental (Ex 27.6 follow-up) | package source (`core.d.ts`: `@experimental 22.0`) | match |
| 25 | Docs and CHANGELOG quotes (16 phrases, §1, §4-§6, §8-§11, Q27.04, Q27.09, Q27.13) | docs (`main`, fetched 2026-10-13) | verbatim, except F-5 |
| 26 | No real network in any spec | run (fetch guard) | match |
| 27 | Ex 27.2: retry "Inside auth" carries the current token (2246) | read, package source | wrong (F-1) |
| 28 | Each progress event runs change detection (959, 970, 1976) | package source (typings sentence), read (21 §1, §3) | zone-era, unscoped (F-2) |
| 29 | Scope `withXhr()` to upload routes (1256, 1978) | package source (2041-2043), run | incomplete (F-3) |
| 30 | Q27.16: mapping "hides the status from retry inside it" (1555) | read | reversed (F-4) |

## Proposed FIX tasks

Ceilings: the module is 22,462 prose words (module-stats); CLOSE limit 22,470; ceiling 23,370. The sequence nets at most +70 + 70 + 80 = +220 (about 22,680). FIX-M27-01, -02 and -03 edit `modules/27-http-client.md` and run in that order; FIX-M27-04 edits only other modules' link targets and may run in parallel with them.

### FIX-M27-01 · S · The unclosed `<details>`, reader-text wording and two wrong pointers (T-1, F-1, F-4, F-5, F-6, T-3, T-4, T-5, T-6, T-12)
- Files: `modules/27-http-client.md`.
- Do: T-1 close Ex 27.3's worked solution after its `**Tests:**` line; F-1 Ex 27.2's placement follow-up "Outside auth, listed before it, …"; F-4 Q27.16's follow-up wording; F-5 the two quotes made verbatim; F-6 cite `Section 4: an interceptor can answer without reaching the backend` in Q27.34 and link 17 §6 in Q27.21 and Q27.31; T-3 the "because" on §5's idempotent-methods practice; T-4 the four misconception clauses; T-5 §4's logger sentence; T-6 the three "probe" wordings; T-12 Q27.25's seven printed lines.
- Acceptance: common rules below; `<details` and `</details>` counts equal and no exercise heading nested (the review's awk scan); the misconception scan finds a cause in all 44 bullets and the best-practice scan a reason in all 40; Q27.25's lines equal `q27-outputs.spec.ts` 363-371; prose at most +70 over the count measured just before.
- Model: **Sonnet** (mechanical: each edit has its text in the review).

### FIX-M27-02 · S · Terms, markers, internal marks, excerpts and Connections (T-7, T-8, T-9, T-11)
- Files: `modules/27-http-client.md`.
- Do: T-7 the three glosses (testing backend and controller at §1's first use, XSSI, the zone); T-8 move the `statusText` marker to §5's problem, drop the second `reportUploadProgress` marker, mark the two diagram names internal and the private or internal names once per unit; T-9 replace the Ex 27.5 excerpt with `upload.service.ts` lines 31-41 and split the Ex 27.6 excerpt into the `results` field and the template chain (verbatim, `// Excerpt of …` headers); T-11 the "Uses these ideas later" line with reasons and 37 and 43.
- Acceptance: common rules below; the internal-name script finds every C7 name and the T-8 names marked at first use per unit; the marker scan shows each marker once at its API's first body mention; `check-snippets.mjs . 27` exits 0; prose at most +70 over the count measured just before.
- Model: **Sonnet** (mechanical, prescribed text; check slugs with the link checker).

### FIX-M27-03 · M · Zone-era cost claim, the scoped XHR client, and the Ex 27.3 alternative (F-2, F-3, T-2, T-10)
- Files: `modules/27-http-client.md`; `labs/angular/src/app/modules/27-http-client/exercise-3-cache/http-cache.ts` and `cache.spec.ts` (and `cache.interceptor.ts` only if the variant needs a provider seam); `labs/angular/src/app/modules/27-http-client/exercise-5-upload/upload.service.ts`.
- Do: F-2 scope the change-detection cost in §9's best practice, §9's misconception and Q27.29's follow-up to the typings' zone-era statement, after re-reading 21 §3 and §5 (no unrun zoneless claim); F-3 add the scoped-client cost to Q27.29's trap and point Q27.05's follow-up at it, citing the two `Section 2` tests; T-2 implement the two-map alternative behind the same surface, run `cache.spec.ts` over both with `describe.each` (titles unchanged) and rewrite the trade-off sentence, or replace the alternative with one that runs; T-10 remove the redundant cast.
- Acceptance: common rules below plus `npx ng build`; the Ex 27.3 spec passes 5 of 5 runs with both variants; E27.3 and E27.5 titles unchanged; no non-spec file uses `vi`, `expect` or `as`; no new claim without a cited existing test or a named source read; prose at most +80 over the count measured just before.
- Model: **Opus** (judgment: scoping a claim without overclaiming, and a lab change that needs new runs).

### FIX-M27-04 · S · Anchors for the file-level links to 27 (T-13; +0 words)
- Files: `modules/03-js-objects-prototypes-classes.md`, `07-ts-advanced-types-and-decorators.md`, `09-web-networking-storage-security.md`, `12-angular-how-it-works.md`, `15-standalone-and-ngmodules.md`, `16-dependency-injection.md`, `17-signals.md`, `22-rxjs-foundations.md`, `23-rxjs-in-depth.md`, `24-routing.md`, `25-forms-reactive-and-template-driven.md`, `26-signal-forms.md` (link targets only).
- Do: apply the Handoffs table (31 anchors); the 21 header, Read-next and Uses-these-ideas-later lines stay file-level. Verify each slug against module 27's `## N.` headings and each line by its text.
- Acceptance: `node labs/tools/check-links.mjs --planned` exits 0; the word count of every file touched is unchanged; no other text changes; module 17 is edited only through this FIX (RUN.md §10).
- Model: **Sonnet** (mechanical link edits). Files disjoint from 01-03.

Common rules for each task: from `labs/angular` run `npx ng test --watch=false --include='src/app/modules/27-http-client/**/*.spec.ts'` (18 files, 178 tests, or more if FIX-M27-03 adds the Ex 27.3 variant) and `npx tsc -p tsconfig.spec.json --noEmit`; from the guide root `node labs/tools/check-links.mjs --planned` and `node labs/tools/check-snippets.mjs . 27` exit 0; cited `Section N:`, `Q27.NN` and `E27.N` names unchanged; the twelve Output answers unchanged in value (Q27.25 changes format only); only declared files change; the module stays at or under 23,370 words (no FIX takes it past 23,370 without cutting as much as it adds); the LOG line gives both counts (`module-stats.mjs` and the QUALITY-BAR one-liner).

After the four tasks: at most 22,462 + 70 + 70 + 80 = 22,682, hard stop 23,370.

## For Jorge

1. **A gate for `<details>` balance.** T-1 (a Major) passed every tool and the CLOSE walk; only a hand-run scan found it. Approve a HOUSE task that adds a `<details>`/`</details>` balance and nesting check to `labs/tools/module-stats.mjs` (a flag) or `check-snippets.mjs`, with a unit test; today only module 27 is unbalanced.
2. **Exercise 27.3's alternative (T-2):** FIX-M27-03 implements and runs it by default (about 30 lab lines). If you prefer a smaller change, rule that the exercise replaces the alternative with one already runnable instead.
3. **Unchanged open points from M27.md and CLOSE-M27:** 34 of 35 questions (the SSR transfer cache left to module 32); `withFetch` and `statusText` deprecations dated by the CHANGELOG because their typings tags carry no version (the module states this); VERSIONS.md has no rows for the root-provided client (21.0), `withXhr` and the split progress options (22.0), JSONP (deprecated 22.1), `timeout` (20.1) or `statusText` (deprecated 21.0); the `making-requests.md` "Best practices" `effect` example is not followed and the typings' "emited" typo could be reported upstream (C11); module 29 may reuse the child-client test gotcha (F9). None blocks a FIX.
4. **Module 17 edits:** FIX-M27-04 changes four link targets in `modules/17-signals.md` (459, 535, 1533, 2272), which RUN.md §10 allows only through a FIX; approve or keep those four file-level.

Scratch deleted: yes (see the final line of the review run). The session scratchpad files (test logs, title and scan scripts, the fetch guard, the Mermaid install, `npm pack` tarballs, fetched docs, the `tsc` probe and its `node_modules` symlink) were removed with absolute paths; no server or vitest process was left running; `labs/angular/.angular/` and `labs/angular/dist/` are covered by the lab's `.gitignore`.
