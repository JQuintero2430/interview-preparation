# REVIEW-M32: `modules/32-ssr-ssg-hydration.md`

- **Reviewer:** a fresh reviewer subagent (claude-opus-5-5) of session S20261015-0740-claudecode. It read and judged the module and ran only read-only scripts. The re-runs belong to the main session, which owns all execution. Module 32 was planned by PLAN-M32 and written by HOUSE-25..28, SEC-M32-01..10, EX-M32-01..04, QB-M32-01..06 and CLOSE-M32, in sessions S20261014-1808 and S20261014-2121. This session wrote nothing in module 32 and continues none of those conversations, so it is eligible (RUN.md §4).
- **Date:** 2026-10-15.
- **Files read:**
  - the whole module (2,289 lines; line numbers below are as of this review and will move at FIX time);
  - `_meta/modules/M32.md` (C1-C16, F1-F13, the section map, the bank table, For Jorge), QUALITY-BAR, STYLE-GUIDE §3, the TASKS entries for REVIEW-M0x, REVIEW-M32, the module-32 common rules and FIX-M31-01..03 (the format), the first STATE standing note, LOG 1231-1263, REVIEW-M31 (the format model);
  - every module-32 lab file:
    - spec titles by script;
    - in full: `support/ssr.ts`, `outputs/q32-outputs.spec.ts`, the section 4 and 10 specs, and parts of the section 3, 6 and 9 specs and the exercise 1 and 4 specs;
    - `ssr-lab`'s `app.routes.server.ts`;
  - `labs/e2e/playwright.config.ts`, and the `angular.json` `allowedHosts` entry.
- **Packages read (22.2.1 unless stated):**
  - `@angular/ssr`: `fesm2022/ssr.mjs` (118-197, 253-265, 360-431, 523-700, 826-829, 960-1112, 1200, 1295-1320, 1396-1400), `fesm2022/_validation-chunk.mjs` (1-140), `fesm2022/node.mjs` (12, 248, 330, 445), `types/ssr.d.ts` (30-106, 246, 286, 325), `types/node.d.ts` 112;
  - `@angular/platform-server`: `fesm2022/platform-server.mjs` (50-106), `_server-chunk.mjs` (468-513, 605-612), `types/platform-server.d.ts` 50, `third_party/domino/bundled-domino.mjs` (7204; text search);
  - `@angular/platform-browser`: `fesm2022/platform-browser.mjs` (340-372), `types/platform-browser.d.ts` (399-467);
  - `@angular/core`:
    - `fesm2022/core.mjs` (341, 416, 469, 638-646);
    - `_debug_node-chunk.mjs` (2293-2308, 2418, 2641, 2756-2770, 7267, 7857, 7902, 13720, 13839, 15359-15389, 17606-17616);
    - `_resource-chunk.mjs` (88, 244);
    - `primitives-event-dispatch.mjs` (60-61);
    - `types/core.d.ts` (1336, 3021-3074, 4067, 7432-7446, 9270-9292);
  - `@angular/common`: `fesm2022/http.mjs` (23-245), `fesm2022/common.mjs` (663-690, 810-855), `types/http.d.ts` (`httpResource` tag);
  - `@angular/build`: `src/utils/server-rendering/prerender.js` (73-74, 136-141), `src/utils/index-file/add-event-dispatch-contract.js`, `ngcm-attribute.js` 22, `src/builders/dev-server/vite/index.js` 101;
  - `@schematics/angular`: `ssr/index.js` (80-148), `server/index.js` (91-199), `migrations/migration-collection.json`, `migrations/update-workspace-config/migration.js` (33-36);
  - `serve-static` 2.2.1 `README.md` (99-103); `express` `package.json` (5.2.1).
- **Basis of each finding:** a package source, a committed spec, or a read-only script (grep, sed, wc, `node --input-type=module` reading files). Nothing was built, run or installed. The CHANGELOG quotes (Core 16.0.0, 18.0.0, 20.0.0, 21.0.6, 21.2.11, 22.0.0; CLI 19.0.0, 20.0.0, 22.0.0) were **not re-read**. Their basis is the SEC LOG lines and SOURCES.md.
- **Probe files:** none. The reviewer created only this file.

Overall, this is a carefully sourced module with **no Major finding**:
- Every Output answer equals its spec's assertions, every cited test title exists (103 citations, 61 distinct, 0 missing), and all 20 exercise criteria equal test titles.
- Every one of 54 sampled claims matches the 22.2.1 sources, except one unsourced "sooner" (F-1) and one incomplete list (F-2).
- No test asserts a duration, `allowedHosts` is `["localhost"]`, every failing page is `RenderMode.Server`, and both `provideServerRendering` import paths are named wherever the function appears.

The findings are polish:
- seven Misconceptions bullets without the myth's cause (T-1);
- three terms used before they are defined (T-2);
- four throwaway "scratch run" observations, which the module rules forbid (T-3);
- three missing status markers (F-3);
- local `holdMain` copies in two specs (T-6);
- the anchor handoffs (T-7) and four stale sentences in modules 20 and 31 (T-8).

**Prose:** 18,367 words now (read-only script, the same split as the QUALITY-BAR one-liner, equal to CLOSE's LOG count). The fixes add about +90, for about 18,460: under the CLOSE limit of 18,535 and the REVIEW ceiling of 19,235.

## Re-runs (main session)

| Command | Result |
|---|---|
| `labs/e2e`: `npx tsc --noEmit -p .` (Node 24.21.0) | exit 0 |
| `labs/e2e`: `npm test -- tests/32-ssr-ssg-hydration --repeat-each=5` | 485 passed (97 tests × 5), 21.1 s |
| `labs/angular`: `npx ng test --watch=false --include='src/app/modules/32-ssr-ssg-hydration/**/*.spec.ts'` | 2 files, 5 passed; `npx ng build ssr-lab` exit 0 |
| Mermaid parse of the 10 fences (Mermaid 11.12.0 + jsdom 26.1.0, job scratchpad, deleted after) | 10/10 parse; a negative control fails |
| `node labs/tools/check-links.mjs --planned` | All links resolve (352 planned) |
| `node labs/tools/check-snippets.mjs . 32` | All snippets check out; `module-stats` 32: 27 Q, 4 Ex, 18,367, no flag |
| `lsof -iTCP:4300 -iTCP:4400 -sTCP:LISTEN` after the run; `labs/e2e/test-results` removed | nothing listening; no `test-results` left (ignored by `labs/e2e/.gitignore`); `dist/` ignored |

Reviewer's read-only script results (2026-10-15):
- **Cited test titles:** 103, 61 distinct, 0 missing from the specs.
- **Exercise criteria:** 20 of 20 equal test titles.
- **URLs:** 16 matches. 14 are citations and all 14 are in SOURCES.md. The other two are code strings (`http://localhost:${port}` in `server.ts` and the origin-map example), not citations.
- **Markup:** `<details>` 46 open and 46 closed; 10 `mermaid` fences and 10 "What to notice" lines.
- **Answer anatomy:** each of the five D1 counts is 27. Every answer has exactly 2 answered follow-ups; the exercises have 2, 3, 2 and 2.
- **Answer length:** 179-238 words per answer (none above 290).
- **Type mix:** Concept 8, Output 8, Bug hunt 4, Design 3, Trade-off 2, Difference 2.
- **Question links:** 43 links into `#q32-`, and every ID is linked at least once outside its heading.
- **Prose:** 18,367.
- **Chunk names:** `labs/angular/dist/ssr-lab/browser` (built 2026-10-15 07:42) contains the six chunk names that Q32.15 and the EX-M32-04 LOG line cite.

## QUALITY-BAR

45 items: **39 Pass, 6 Partial (B7, B9, C1, C3, C4, D2), 0 Fail.** H1 and H2 are Pass on CLOSE-M32's run and the reviewer's checks, pending the main session's re-runs above.

| ID | Result | Evidence |
|---|---|---|
| A1 | Pass | Lines 3-9 in §4.1 order. The Labs line has three folder links and the run commands. Applies to names the installed packages and what is documented only. |
| A2 | Pass | 18 §7, 24 §1 and 31 §10, all with anchors. |
| A3 | Pass | §1, §3, §4, §7; Q32.01, 06, 10, 14, 18, 21; then the Summary. |
| A4 | Pass | 10 sections plus the 5 closing sections. |
| A5 | Pass | The order is why, setup, routes, then the browser side in the order it happens (§4-§6), code and data (§7-§8), shipping (§9) and internals (§10, the deepest). "State script" is used in §4 before §8 defines it; that is a term issue (B9, T-2), not an ordering one. |
| B1 | Pass | Each of the 6 headings appears 10 times. There is one `#### Legacy`, in §9, with its migration step (1156). |
| B2 | Pass | Read: each problem is a concrete failure (an empty preview, a 400 behind the load balancer, a 404 from a crash, double fetches). |
| B3 | Pass | 10 diagrams of the types M32.md names, each followed by "What to notice". The parse is the main session's. |
| B4 | Pass | Each section answers a "why" from a named package, file and function. Every sampled one matches (claims table). |
| B5 | Pass | Every `### Code` has an approach line and numbered steps. |
| B6 | Pass | Read: every practice has "because". |
| B7 | Partial | Seven bullets give the correction without the myth's cause: 486, 594, 596, 874, 875, 1052, 1053 (T-1). The history lines are sourced (483 Core 16.0.0, 593 Core 20.0.0, 595 Core 21.2.11, 740 platform-browser 22.0.0). |
| B8 | Pass | *Coming from the backend* in §1 (121), with "Where the analogy breaks"; *Framework vs platform* in §7 (772). |
| B9 | Partial | Most terms are glossed at first use (CSR/SSR/SSG, hybrid, crawler, unfurl, Open Graph, TTFB, server entry point, `BootstrapContext`, middleware, server route, fallback, soft redirect, claim, annotation, integrity marker, event contract, `jsaction`, hydration boundary, platform ID, DOM emulation, state transfer, state key, origin map, shared cache, SSRF, edge runtime, route tree, server app). Three are not: "state script" (401, defined at 885), "shell" (310) and `ngServerMode` (66, glossed only at 622) (T-2). |
| B10 | Pass | Owners get one sentence plus a link: 09 §4, 12 §3/§6, 14 §1, 15 §3, 16 §7, 17 §6, 18 §6/§7, 20 §4, 21 §5, 24 §1, 27 §6, 31 §9/§10, 33. Nothing is retold. |
| C1 | Partial | 54 claims sampled: 52 match, 1 unsourced speed wording (F-1), 1 incomplete list (F-2). |
| C2 | Pass | The 8 Output IDs have `Q32.NN …` tests (plus one for Q32.12). Every short answer's values equal the assertions (read against `q32-outputs.spec.ts`). |
| C3 | Partial | Every "the lab / test finds" sentence names a committed test. Four observations rest on throwaway runs, which the module rules forbid ("no throwaway observation"): 780, 932, 1722 (twice) and 1810 (T-3). |
| C4 | Partial | 12 markers are present and correct (claims 29-31, 38, 21; see F-3 for basis). Missing: `httpResource` (1862, `@publicApi 22.0`, 27 marks it `[Stable since v22.0]`); `afterNextRender` (476, `@publicApi 20.0`); the `resource` `id` option (889/936, which 17:449 marks `[Added in v22.0]`) (F-3). Judged acceptable without a marker: `outputMode` (added in v19.0, outside STYLE-GUIDE §3.2's three-major window and not a minor release, so M32.md C5's request is superseded), and event replay's "since", which 524 attributes honestly (VERSIONS.md plus Core 18.0.0; no changelog line). |
| C5 | Pass | Every API sampled exists in 22.2.1. |
| C6 | Pass | 0 `Unverified`. |
| C7 | Pass | The snippet kinds are correct (check-snippets is the main session's re-run). Nit N-5: the 1104 Excerpt carries a task-ID comment. |
| C8 | Pass | Every citation URL is in SOURCES.md under `## Module 32`. |
| D1 | Pass | 27 × 5 labels; 2 answered follow-ups each. |
| D2 | Partial | Q32.15's short answer gives the values but no reason (T-4). The other seven Output short answers give one. |
| D3 | Pass | 6 tags; largest 8/27 (30%). |
| D4 | Pass | Q32.01 (§1) through Q32.27 (§10). |
| D5 | Pass | No duplicate headings. Q32.02 (cost side) defers LCP and INP to Q31.26. Q32.15 and Q32.16 go beyond Q18.20 and link it. Q32.21 is the question 27 left to 32. |
| D6 | Pass | Every ID is linked outside its heading. |
| D7 | Pass | 27 unique `q32-NN` anchors. |
| D8 | Pass | 27 ≤ 30 and ≥ 25; the reason is in PROGRESS (CLOSE). |
| E1 | Pass | Full anatomy in all four exercises; each Constraints line names what is not covered. |
| E2 | Pass | 20 of 20 criteria equal test titles (`Before the fix: …` belongs to 32.2's statement, said in the Problem). Judged: Exercise 32.1's "answers 404 with the not-found page for an unknown product" holds for variant b, because the spec asserts the final 404 and the page for both variants; the extra `FIRST_STATUS` 302 check is variant-specific evidence, and the Alternative paragraph says so (1996). Judged: Exercise 32.4's criterion 2 is the same criterion in both variants (no reviews chunk before the interaction); `LOAD_ORDER` only adds the per-variant order after it. |
| E3 | Pass | 32.1 routes → 32.2 platform → 32.3 data → 32.4 incremental hydration plus replay, which integrates §4-§6. |
| E4 | Pass | Each alternative runs under the same titles (`for (const variant of ['a','b'])`); the runs are the main session's. Read: no `any`, no `typeof window`, `inject()`, `@for` with `track`. |
| E5 | Pass | 8 Output questions. |
| F1 | Pass | 3 paragraphs linking all 10 sections; no new fact. |
| F2 | Pass | 5 prompts, each naming a listener. |
| F3 | Pass | 7 flashcards. |
| F4 | Pass | Builds on, Read next, Uses these ideas later and Comparisons, each with a reason. |
| G1 | Pass | 18,367 ≤ 18,535. No redundancy worth cutting: the repeated "two `provideServerRendering`" is C16's rule. |
| G2 | Pass | 7/7 checkboxes (M32.md breadth table); §9 has `#### Legacy`. |
| H1 | Pass (pending) | CLOSE-M32: angular 2,035 passed, e2e 217 passed; main re-runs above. |
| H2 | Pass (pending) | CLOSE-M32 check-links OK; main re-runs above. |
| H3 | Pass | `git status -uall labs/`: the module-32 files are all declared (`projects/ssr-lab/**`, two `ng test` specs, the e2e folder). `labs/angular/dist` and `labs/e2e/test-results` are ignored (`git check-ignore`). Module 30's `labs/e2e` is wholly untracked, so it cannot be diffed; see C13. |

## Module-specific checks

| Check | Result | Evidence |
|---|---|---|
| HOUSE-25 result in every module-32 LOG line | Partial | Present in 1247-1262 (SEC-M32-07..10, EX, QB, CLOSE) and in HOUSE-26 (1234, "HOUSE-25 pins"). Missing in 1235-1241 (SEC-M32-01..06 and HOUSE-27, all S20261014-1808). Each of those ran `ng build ssr-lab`, which cannot build without the packages, so the result is implied but not written. LOG history is not rewritten; recorded here only (N-6). |
| Recorded statuses, headers, attributes, codes, chunks and file names (F2-F8; the eight Output answers) vs the specs | Pass (read) | Checked against the specs' assertions: NG0500, NG0502 (`^ERROR \w+: NG050x`); `ngh="0"`; `<body><!--nghm-->`; `ng-server-context` `ssg`/`ssr`/none and `<body ngcm="">`; `jsaction="click:;"`, `click:;keydown:;` and `ngb="d2"`; 400 `Header "host" with value "evil.example" is not allowed.`; `public, max-age=31536000`; `private, no-store`; 201, 301, 302 and 404 `Cannot GET …`; `__nghData__` shape; `prerendered-routes.json`, `index.csr.html`, `index.server.html`, `server.mjs`, `main.server.mjs`; Q32.03, 05, 07, 11, 13, 15, 20, 22 values. Pass and fail of the runs: main. |
| No duration asserted or claimed; no unsourced SEO, speed or cost claim (C6) | Partial | No timer or time comparison in any spec (grep `waitForTimeout\|setTimeout\|toBeLessThan\|performance.\|Date.now`: only the comment in the local `holdMain`). The SEO and cost wording is quoted and dated (Google, Angular docs, web.dev). Exception: Q32.01's follow-up "Its content arrives sooner" (1344), which SEC-M32-01 had dropped as unsourced (F-1). |
| Development-only behavior not worded as observed (C9) | Pass | NG0505, NG0504 and the tag check are "development builds" / "read, not run" (426, 432, 1916). The stats log and DevTools are documented only (432). The lab's codes are the production format, said at 430 and 1578. |
| No prerendered page that can fail the build (C10) | Pass | `app.routes.server.ts`: the Prerender routes are home, `routes/{prerendered,products,shelf-*,moved}`, `fallbacks/*`, `platform/language-static` and `ex1/*/products`; none crashes or mismatches. Hydration, crash and ex2 pages are `RenderMode.Server`, with comments. |
| `allowedHosts` never `'*'` (C12) | Pass | `angular.json` `["localhost"]`; `'*'` appears only in the misconception, the flashcard and the warning quote. |
| Module 30 lab edits and append-only shared files (C13) | Pass (read) | `playwright.config.ts` `webServer` is an array: the 4300 entry (with module 31's `--stats-json`) and HOUSE-26's 4400 entry, verbatim from M32.md Lab decision 4. No module-32 LOG line names `server/app-server.mjs`. `app.config*.ts`, `server.ts` and `generated/` are unchanged per the LOG; `labs/e2e` is untracked, so none of this can be diffed. |
| Both `provideServerRendering` import paths (C16) | Pass | 162, 191-195, 293, 299, Q32.04 (short answer, code, trap) and Summary. Matches `ssr.d.ts` 286/325 and `platform-server.d.ts` 50. |
| Owner credit and the 09/12/17/18/20/21/24/27/31/33/34/37/44 split (C7) | Pass | B10 row. 34, 37 and 44 appear only in Connections; 33 is file-level in §9 and Q32.25. |
| Internal names of C8 marked | Pass | Marked at first use in each section (66, 330, 424-432, 518-526, 622-628, 751, 776, 914-934, 1081-1087, 1208-1216); §10 opens with a blanket "Names marked internal may change". |
| Status markers (C5); event replay's "since" sourced | Partial | C4 row; F-3. |
| Criteria equal test titles; the alternative runs | Pass | E2 and E4. |
| ≥ 2 answered follow-ups per answer | Pass | Script: 2 each. |
| Terms defined at first use | Partial | B9 row; T-2. |
| SOURCES complete (script) | Pass | C8 row. |
| Mermaid fences | Counted | 10 fences, 10 "What to notice"; the parse is the main session's. |
| Misconception cause clauses | Partial | T-1. |
| `<details>` closed | Pass | 46 / 46; none contains a `###`. |
| Type mix | Pass | D3 row. Q32.22's retitle to `/api/catalog` (the run beats the plan, LOG 1259) is accepted; M32.md's bank table is a plan and is not edited. |
| Prose ≤ 18,535 / ceiling 19,235 | Pass | 18,367; about 18,460 after the FIXes. |
| No stray lab files; no server left running | Pass / main | H3; `lsof` is the main session's. |
| Anchor candidates and the 20:431 and 31:586 sentences | Done | Handoffs below; the sentences are For Jorge 1. |
| STATE items left to REVIEW | Judged | <ul><li>Q32.22 retitle: accepted.</li><li>"State script" before §8: T-2.</li><li>§2 `outputMode` marker: none needed (C4 row).</li><li>Local `holdMain`: T-6.</li><li>EX-M32-01 302 then 404 and EX-M32-04 per-variant order: E2 row.</li><li>M32.md C1: no docs-only claim found that contradicts the typings.</li><li>M32.md C4: run in the specs.</li><li>M32.md C5: F-3.</li><li>M32.md C11: read and matched (claims 4-5).</li><li>M32.md C12: Pass.</li></ul> |

## Handoffs

Module 32 slugs:
- S1 `#1-why-render-on-the-server-csr-ssr-ssg-and-hybrid-rendering-and-what-each-costs`
- S2 `#2-adding-angularssr-what-ng-add-generates-the-build-output-and-the-server-entry`
- S3 `#3-server-routes-and-rendermode-per-route-rendering-getprerenderparams-fallbacks-headers-and-status`
- S4 `#4-hydration-reusing-the-servers-dom-mismatches-and-ngskiphydration`
- S6 `#6-incremental-hydration-defer-blocks-with-hydrate-triggers`
- S7 `#7-platform-safe-code-browser-apis-afternextrender-document-request-and-response_init`
- S8 `#8-data-across-the-boundary-the-http-transfer-cache-transferstate-and-resource-ids`
- S10 `#10-under-the-hood-a-request-through-the-engine-the-serialized-page-and-the-clients-hydration-pass`
- EX2 `#ex32-2`

Line numbers were read 2026-10-15; find each line by its context, not its number.

| File:line | Context | Anchor |
|---|---|---|
| 02:1130 | "Browser-only code belongs in `afterNextRender` or behind a platform check" | S7 |
| 04:150 | "stability and pending-task mechanisms" | S7 |
| 12:217 | "`outputMode` `server` adds a server build" | S2 |
| 14:63 | `Renderer2` "do[es] not support DOM manipulation in server-side rendering" | S4 |
| 14:940 | "do not support DOM manipulation in server-side rendering; documented, not run" | S4 |
| 17:451 | "`id` names the value in `TransferState`" | S8 |
| 17:2119 | "an SSR app would provide a no-op storage on the server" | S7 |
| 17:2128 | "a provider change instead of a code change" | EX2 |
| 18:714 | "(hydration: the browser reusing the server's DOM" | S6 |
| 18:1837 | "`shouldAttachRegularTrigger` skips them … The rest is" | S6 |
| 20:431 | "Documented only: no test claims it" | S7 (sentence: For Jorge 1) |
| 20:1368 | "where render callbacks do not (never observed" | S7 (sentence: For Jorge 1) |
| 20:1769 | "On the server both functions return a no-op ref: documented, never observed" | S7 (sentence: For Jorge 1) |
| 21:577 | "`PendingTasks.run` keeps server rendering waiting" | S7 |
| 21:759 | "shows an open task keeping `isStable` false" | S7 |
| 21:1575 | "A cleanup never called leaves the app unstable" | S7 |
| 21:2038 | "server rendering waits for stability before it serializes" | S10 |
| 24:1223 | "The initial navigation on the server is" | S10 |
| 27:617 | "the SSR **transfer cache** (server responses serialized into the HTML" | S8 |
| 27:649 | "The rule models what a cache must skip; hydration is" | S8 |
| 27:1690 | "The transfer cache skips `Authorization`, `Cookie` and credentialed requests" | S8 |
| 31:586 | "`priority` also adds a preload link (read, not run)" | S1 (sentence: For Jorge 1) |
| 31:745 | "don't support web workers." | S7 |
| 31:797 | "This lab has no SSR" | S1 |
| 31:833 | "`RenderMode`, `getPrerenderParams`, incremental hydration …" | S3 |
| 31:1428 | "run where workers are missing, such as server rendering" | S7 |
| 31:1464 | "`RenderMode` and hydration belong to" | S3 |

Stay file-level:
- headers, Leads to, Read next and Uses these ideas later (04:1700, 09:1606, 12:1861, 15:2256, 16:2483, 18:5, 18:2611, 20:2234, 21:5, 21:2710-2711, 23:2746, 24:5, 24:2978-2979, 27:5, 27:2578-2579, 31:5, 31:2012-2013);
- 08:755 (no claim in 32);
- 16:555 (32 does not state a per-request platform injector);
- 21:2331 and 21:2414 ("Not covered: server rendering");
- 27:30, 27:177 and 27:1253 (NG02801 and XHR are not in 32).

## Factual findings

**F-1 · Minor (C6) · Q32.01 follow-up "Its content arrives sooner" (1344).** This is an unsourced speed claim. SEC-M32-01 dropped exactly this wording (LOG 1235: "Dropped as unsourced: … 'SSR content arrives sooner'"), and 31 owns first paint.
- Fix: "Its content arrives sooner; interactivity waits" → "Its content is in the first response; interactivity waits" (+3).

**F-2 · Nit (C1) · Q32.21 full explanation omits the response type from the key (1783).** `makeCacheKey` (`http.mjs` 185-200) joins method, `responseType`, URL, body and params, as §8 (914) says.
- Fix: "under a hash of method, URL, body and params" → "under a hash of method, response type, URL, body and params" (+2).

**F-3 · Minor (C4) · three missing markers at first mention.**
- **(a) `httpResource`:** `types/http.d.ts` `@publicApi 22.0`, and 27 marks it `[Stable since v22.0]`. Fix at 1862: "*Does `httpResource` need" → "*Does `httpResource` [Stable since v22.0] need" (+4).
- **(b) `afterNextRender`:** `core.d.ts` `@publicApi 20.0`; its first body mention is 476. Fix: "run DOM libraries in `afterNextRender` ([20 §4]" → "run DOM libraries in `afterNextRender` [Stable since v20.0] ([20 §4]" (+4).
- **(c) The `resource` `id` option:** 17:449 marks it `[Added in v22.0]`; its basis is the Core 22.0.0 line "add ability to cache resources for SSR", which is exactly this feature. 936 says the line "does not name `id`, so no marker", which leaves the two modules contradicting each other.
  - At 889, "3. **A `resource` with an `id`** ([17 §6]" → "3. **A `resource` with an `id`** [Added in v22.0] ([17 §6]" (+3).
  - At 936, "Core 22.0.0's "add ability to cache resources for SSR" does not name `id`, so no marker ([CHANGELOG](https://github.com/angular/angular/blob/main/CHANGELOG.md))." → "The marker rests on Core 22.0.0's "add ability to cache resources for SSR" ([CHANGELOG](https://github.com/angular/angular/blob/main/CHANGELOG.md)), as in 17." (+0).
  - If Jorge prefers M32.md C5's stricter reading, drop (c) (For Jorge 4).

Marker formatting (Nit, no FIX): 39 and 780 write markers as plain text, the other 10 in backticks. STYLE-GUIDE §3.2's example is plain text, and module 17 also mixes the two. This is house-wide, so it is left alone.

## Teaching and completeness findings

**T-1 · Minor (B7) · seven Misconceptions bullets without the myth's cause.** Append the following to each bullet (find it by the quoted text):
- 486, "the tag check is development-only." → append " A quiet console looks like success." (+6)
- 594, "It queues the listed types of listeners in the server output." → append " "Captures events" sounds like all of them." (+6)
- 596, "nothing runs until the code arrives." → append " A click that is no longer lost feels like a working page." (+11)
- 874, "so the token is `null` (`no request` in the test)." → append " The page still renders on a server, so a request seems to exist." (+12)
- 875, "Branching on it can render different DOM and break hydration." → append " A boolean check looks free." (+5)
- 1052, "never put secrets in it." → append " Data filled per request feels private." (+6)
- 1053, "later navigations call it as usual." → append " The first load made no browser call, which looks like the rule." (+12)

About +58 in all.

**T-2 · Minor (B9) · three terms before their definition.**
- 401: "pointing at an entry of `__nghData__` in the state script that records" → "pointing at an entry of `__nghData__` in the **state script** (the JSON the server writes into the page, [§8](../../modules/32-ssr-ssg-hydration.md#8-data-across-the-boundary-the-http-transfer-cache-transferstate-and-resource-ids)) that records" (+9).
- 310: "`Client` sends the shell ([§1]" → "`Client` sends the **shell**, `index.csr.html` with an empty app root ([§1]" (+7).
- 66: "only when `ngServerMode` is set (both internal" → "only when `ngServerMode`, the flag a server render sets, is true (both internal" (+6).

**T-3 · Minor (C3) · throwaway observations.** The module-32 rules say "No harness mode and no throwaway observation", and these four sentences report scratch runs that no committed spec asserts. Reword them as reads or delete them; the reads already support each claim.
- 780: delete "; a throwaway run with a bare `setTimeout` kept `waiting` (not committed)" (−11). The pending-task test stays.
- 932: "(read; a throwaway page on the lab's `no-store` `/api/products` stored nothing)" → "(read, not run)" (−9).
- 1810: "(read; §8's throwaway page on `/api/products` stored nothing)" → "(read, not run)" (−6).
- 1722:
  - "Node 24.21 prints `ReferenceError: localStorage is not defined` (run in a scratch script)." → "The `localStorage` case was not run through the lab server (read, not run)." (+1).
  - ", and calling it on a domino `input` returned `undefined` (run)" → delete (−10).
- About −35 in all.

**T-4 · Minor (D2) · Q32.15's short answer has values but no reason.**
- Append after "The footer chunk (`chunk-DYo2NYx6.js`) is never requested.": " A regular trigger never fires on the server, and a hydrate trigger fires only in the browser." (+16)

**T-5 · Minor (accuracy of a cross-reference) · Exercise 32.2's trade-off contradicts §7 (2071).** "but the factory's `PLATFORM_ID` check is the one §7 calls the last resort" is wrong. §7 lists "a factory reading `PLATFORM_ID`" as its fourth, preferred tool (756), and calls only `isPlatformBrowser` *inside a component* the last resort (758).
- Fix: "but the factory's `PLATFORM_ID` check is the one §7 calls the last resort." → "and the platform check sits in one factory, §7's fourth tool, at the cost of a second implementation." (+4)

**T-6 · Minor (lab hygiene, C14) · local `holdMain` copies.** `concepts/section-4-hydration.spec.ts` (lines 2, 9-22) and `concepts/section-10-under-the-hood.spec.ts` (lines 9-19) keep a local `holdMain`. Its comment says the shared helper "calls `page.unroute` before `route.continue`", which has been stale since HOUSE-27 fixed `holdScripts`. The module text does not name the helper, so this is a lab-only change:
- replace each call with `holdScripts(page, MAIN)` from `../support/ssr.js`;
- delete the local function, the unused `Route` and `Page` imports and the stale comment (line 2 of the section 4 spec becomes "The main bundle is held (`holdScripts`) …");
- keep every test title.

The local copy waits (`expect.poll(held.length).toBe(1)`) until the request has been intercepted before releasing; `holdScripts` does not. Each test already waits for the server heading before releasing, so the main session must confirm 5 of 5.

**T-7 · Minor (anchors).** Apply the Handoffs table: 27 rows in 02, 04, 12, 14, 17, 18, 20, 21, 24, 27 and 31, with +0 words.

**T-8 · Minor (For Jorge 1).** Four sentences in closed modules are stale now that §1 and §7 observe what they call unobserved. Proposed:
- 20:431, "Documented only: no test claims it ([Module 32](32-ssr-ssg-hydration.md))." → "[32 §7](32-ssr-ssg-hydration.md#7-platform-safe-code-browser-apis-afternextrender-document-request-and-response_init) observes it: `afterNextRender` work is absent from the server HTML and present after hydration." (+8)
- 20:1368, "(never observed; [Module 32](32-ssr-ssg-hydration.md))" → "(observed for `afterNextRender` in [32 §7](32-ssr-ssg-hydration.md#7-platform-safe-code-browser-apis-afternextrender-document-request-and-response_init))" (+2)
- 20:1769, "On the server both functions return a no-op ref: documented, never observed ([Module 32](32-ssr-ssg-hydration.md))." → "On the server both functions return a no-op ref (read); [32 §7](32-ssr-ssg-hydration.md#7-platform-safe-code-browser-apis-afternextrender-document-request-and-response_init) observes the effect, no callback work in the server HTML." (+6)
- 31:586, "On the server, `priority` also adds a preload link (read, not run), which [32](32-ssr-ssg-hydration.md) owns." → "On the server, `priority` also adds a preload link, which [32 §1](32-ssr-ssg-hydration.md#1-why-render-on-the-server-csr-ssr-ssg-and-hybrid-rendering-and-what-each-costs) observes (`Section 1: a priority image adds a preload link to the server HTML`)." (+8)

**Nits** (fold into FIX-M32-01):
- **N-1:** 1880 "(`isProxyHeaderAllowed`, read),;" → "(`isProxyHeaderAllowed`, read);".
- **N-2:** Q32.20's second follow-up (1769) contradicts itself ("No … cannot tell the two cases apart"). Replace it with "*Does `no request` prove there was no request?* No: a request without the header shows the same fallback, so the page cannot tell the two apart." (+2)
- **N-3:** 132 says "interactivity waits for hydration ([§5](../../modules/32-ssr-ssg-hydration.md#5-event-replay-keeping-the-clicks-made-before-the-code-arrives))"; hydration is §4. Change the link to [§4](../../modules/32-ssr-ssg-hydration.md#4-hydration-reusing-the-servers-dom-mismatches-and-ngskiphydration) (+0).
- **N-5:** the §9 Excerpt (1104-1109) shows the lab comment "// SEC-M32-09: the page differs per request, so no shared cache may store it.", a task ID in reader text. Delete that line from the Excerpt; it remains a valid Excerpt (0 prose words).
- **N-6 (no FIX):** LOG 1235-1241 omit the HOUSE-25 phrase (module-specific checks).

**Judged acceptable:**
- Q32.15 quotes this build's hashed chunk names "in this build"; they match `dist` today, and the test finds chunks by class.
- Q32.18 keeps "The first two throw a `ReferenceError`", which is supported by the `window` test and the read.

## Claims sampled (54)

| # | Claim (line) | Basis | Result |
|---|---|---|---|
| 1 | `RenderMode` doc comments (64) | `ssr.d.ts` 30-34 | match |
| 2 | `ServerRoutePrerender` omits `status` (334) | `ssr.d.ts` 82-86 | match |
| 3 | `fallback` default `Server` (1463) | `ssr.d.ts` 104 | match |
| 4 | `:id` → `*`; exact, then `*`, then `**`; order irrelevant (332) | `ssr.mjs` 367, 409-431 | match |
| 5 | Unmatched router route and unmatched server route are errors, except `/**` (330) | `ssr.mjs` 581, 826-829 | match |
| 6 | `handleServe`: ETag plus the route's headers, no Cache-Control, 200 (334, 1089) | `ssr.mjs` 1013-1056 | match |
| 7 | Prerendered redirect answers 302 (338) | `createRedirectResponse` default 302 (253); spec | match |
| 8 | Redirects skipped unless `outputMode` static (338) | `prerender.js` 73-74, 136-141 | match |
| 9 | `Client` answered with `index.csr.html` (164, 1210) | `ssr.mjs` handleRendering | match |
| 10 | Tokens provided only for `Server` (778, 1765) | `ssr.mjs` handleRendering | match |
| 11 | `hasNavigationError` → `null` → `next()` 404 (776) | `ssr.mjs` 133-158, 1110-1112; spec | match |
| 12 | `whenStable()` before the navigation check (1212) | `ssr.mjs` 145-154 | match |
| 13 | `SERVER_CONTEXT_VALUE` `ssg`/`ssr`/`''` (1231) | `ssr.mjs` 966-970 | match |
| 14 | Host, X-Forwarded-Host, Forwarded host, then URL hostname (1081) | `_validation-chunk.mjs` 2, 9-22, 75-92 | match |
| 15 | Validation failure → 400 `text/plain` (1081) | `ssr.mjs` 1396-1400; spec | match |
| 16 | `*.example.com` subdomains only (1083) | `isHostAllowed` 60-74 | match |
| 17 | `NG_ALLOWED_HOSTS` for the Node engine (1083) | `node.mjs` 12; `node.d.ts` 112 | match |
| 18 | `'*'` warning text (1085) | `ssr.mjs` 1307 | match |
| 19 | `trustProxyHeaders: true` trusts all; others deleted (1087, 1880) | `normalizeTrustProxyHeaders`, `sanitizeRequestHeaders` | match |
| 20 | Five 22.0.0 migrations, none for `CommonEngine`; `trust-proxy-headers` (1087, 1156) | `migration-collection.json` | match |
| 21 | `ssr.platform` renamed from `experimentalPlatform` in v22.0 (1091) | `update-workspace-config/migration.js` 33-36 (22.0.0 entry) | match |
| 22 | Two `provideServerRendering` signatures (162, 1411) | `ssr.d.ts` 286/325; `platform-server.d.ts` 50 | match |
| 23 | Schematic: `server`, `outputMode: 'server'`, `ssr.entry`, `allowedHosts: []`, `serve:ssr:` (158, 1394) | `ssr/index.js` 80, 145-148; `server/index.js` 91 | match |
| 24 | `addRootProvider(… provideClientHydration …)` (160) | `server/index.js` 199 | match |
| 25 | "You might need to adjust your deployment pipeline." (139) | `ssr/index.js` 131 | match |
| 26 | `mergeApplicationConfig` "from left to right" (143) | `core.d.ts` 1336 | match |
| 27 | serve-static `index: false` (166) | serve-static 2.2.1 README 99-103 | match |
| 28 | `isMainModule` true only for the entry (166) | `node.mjs` 445-446 | match |
| 29 | Default incremental hydration; core `withIncrementalHydration` starts with `withEventReplay()` (524) | `platform-browser.mjs` 355; `core.mjs` 638-639 | match |
| 30 | `withIncrementalHydration` deprecated, "Intent to remove in v24"; `withNoIncrementalHydration` 22.0 (630) | `platform-browser.d.ts` 454-467 | match |
| 31 | `isCacheActive` and `CACHE_ACTIVE` both off at `whenStable` (934) | `http.mjs` 223-239; `platform-browser.mjs` 356-369; `_resource-chunk.mjs` 244 | match |
| 32 | Skip condition quote and `hasAuthHeaders` (919-929) | `http.mjs` 37, 139-141 | match |
| 33 | Responses with `no-store`/`private`/`no-cache` or `Set-Cookie` not stored (932, 1781) | `http.mjs` 113-115, 143-156 | match |
| 34 | Key = method, response type, URL, body, params (914) | `http.mjs` 185-200 | match (1783 omits response type: F-2) |
| 35 | Origin map server-only; the browser throws (1832) | `http.mjs` 49-51 (2803) | match |
| 36 | `TransferState` lossless types (936, 1863) | `core.d.ts` 4067-4068 | match |
| 37 | `REQUEST`/`RESPONSE_INIT` `null` cases incl. SSG (778) | `core.d.ts` 3021-3062 | match |
| 38 | `PendingTasks.run` `[Developer preview since v19.0]` (780) | `core.d.ts` 9292 | match |
| 39 | -502 for no node, -500 for a non-element; skip host cleared; NG0504 dev-only (430-432) | `_debug_node-chunk.mjs` 15359-15389 | match |
| 40 | `validateMatchingNode` dev-only; text claimed without content check (430, 485) | 15367, 17606-17616 | match |
| 41 | `verifySsrContentsIntegrity` -507; searches body, before body, end of head (426, 1218) | 2756-2770 | match |
| 42 | `prepareForHydration` early return removes the contract; `nghm` first (424, 1255-1264) | `platform-server.mjs` 55-76 | match |
| 43 | Contract inserted right after `<body>` (518) | `add-event-dispatch-contract.js` | match |
| 44 | `click`, `input` recorded; `scroll` not (526, 1621) | `primitives-event-dispatch.mjs` 60-61 | match |
| 45 | `_ejsas[appId]` gate (520) | `core.mjs` 341, 416 | match |
| 46 | `handledEventElements` (522) | `_debug_node-chunk.mjs` 2293-2308 | match |
| 47 | `priority` preload only under `ngServerMode`, `fetchpriority="high"` (66) | `common.mjs` 852-855, 663-690 | match |
| 48 | "Always allow the dev server host" (1083) | `dev-server/vite/index.js` 101 | match |
| 49 | `ngcm` "to prevent hydration warnings" (1214) | `ngcm-attribute.js` 22 | match |
| 50 | Domino `focus` is an empty function; no `innerWidth` or `getBoundingClientRect` (751, 1722) | `bundled-domino.mjs` 7204; text search 0/0 | match |
| 51 | `httpResource` `@publicApi 22.0` (2137) | `http.d.ts` | match (marker missing: F-3) |
| 52 | Named internals exist (`traverseRoutesConfig`, `handleSSGRoute` fallback spread, `getOrCreateAngularServerApp`, `appendServerContextInfo`, `serializeTransferStateFactory`, `getParentBlockHydrationQueue`, `triggerHydrationFromBlockName`, `shouldAttachRegularTrigger`, `findMatchingDehydratedViewImpl`, `retrieveHydrationInfoImpl`, `cleanupDehydratedViews`, `locateNextRNode`) | grep in the files above | match |
| 53 | The eight Output answers (Q32.03, 05, 07, 11, 13, 15, 20, 22) and Q32.12's run | `q32-outputs.spec.ts` assertions; `dist` chunk listing | match |
| 54 | "Its content arrives sooner" (1344) | none; SEC-M32-01 dropped it | unsourced (F-1) |

## Proposed FIX tasks

The module is at 18,367 words; the CLOSE limit is 18,535 and the REVIEW ceiling 19,235.

Table rows (for the Module 32 table in TASKS.md):

```
| FIX-M32-01 | S | todo | REVIEW-M32 | |
| FIX-M32-02 | S | todo | REVIEW-M32 | |
| FIX-M32-03 | S | todo | REVIEW-M32 | |
| FIX-M32-04 | S | blocked | REVIEW-M32, Jorge ruling (REVIEW-M32 For Jorge 1) | |
```

Details blocks:

```
### FIX-M32-01 · S · Misconception causes, first-use terms, markers, throwaway observations, Q32.15 reason, Ex 32.2 trade-off, nits (F-1, F-2, F-3, T-1, T-2, T-3, T-4, T-5, N-1, N-2, N-3, N-5)
- Files: `modules/32-ssr-ssg-hydration.md`; `_meta/LOG.md` (its own line only).
- Inputs: `_meta/reviews/REVIEW-M32.md` (Factual findings, Teaching findings).
- Do: apply each fix text in REVIEW-M32 for F-1 (Q32.01 follow-up), F-2 (Q32.21 full explanation), F-3 (a) `httpResource` in Q32.24's follow-up, (b) `afterNextRender` in §4's best practices, (c) the `resource` `id` marker in §8's list and the 936 sentence (skip (c) if Jorge rules for M32.md C5's stricter reading, For Jorge 4), T-1 (seven Misconceptions bullets), T-2 (§4 state script, §3 shell, §1 `ngServerMode`), T-3 (§7, §8, Q32.18, Q32.22 throwaway observations), T-4 (Q32.15 short answer), T-5 (Exercise 32.2 trade-off), N-1, N-2, N-3, N-5 (delete the task-ID comment line from §9's Excerpt). Find each line by its quoted text. No lab file or test-title change; no anchor change. In the LOG line, also record N-6 (LOG 1235-1241 omit the HOUSE-25 phrase; the packages were present, since those tasks built `ssr-lab`).
- Acceptance: `node labs/tools/check-snippets.mjs . 32` and `node labs/tools/check-links.mjs --planned` exit 0; `grep -c 'throwaway' modules/32-ssr-ssg-hydration.md` = 0; `grep -c 'arrives sooner' modules/32-ssr-ssg-hydration.md` = 0; `grep -c 'SEC-M32' modules/32-ssr-ssg-hydration.md` = 0; `grep -c '),;' modules/32-ssr-ssg-hydration.md` = 0; every Misconceptions bullet in §1-§10 has a cause sentence; prose at most +100 over the count just before (QUALITY-BAR one-liner) and at most 19,235, both counts in the LOG line.
- Model: **Sonnet** (every text is prescribed in the review).

### FIX-M32-02 · S · Use the shared `holdScripts` in the section 4 and 10 specs (T-6)
- Files: `labs/e2e/tests/32-ssr-ssg-hydration/concepts/section-4-hydration.spec.ts`, `labs/e2e/tests/32-ssr-ssg-hydration/concepts/section-10-under-the-hood.spec.ts`.
- Inputs: `_meta/reviews/REVIEW-M32.md` T-6; `labs/e2e/tests/32-ssr-ssg-hydration/support/ssr.ts` (read-only).
- Do: replace each `holdMain(page)` call with `holdScripts(page, MAIN)` imported from `../support/ssr.js`; delete both local `holdMain` functions, the now-unused `Page`/`Route` type imports and the stale "unroute before continue" comments (section 4 line 2 names `holdScripts`). Test titles and assertions unchanged. No module text change (the module does not name the helper).
- Acceptance: from `labs/e2e`, `npm run typecheck` exits 0; `npm test -- tests/32-ssr-ssg-hydration/concepts/section-4-hydration.spec.ts tests/32-ssr-ssg-hydration/concepts/section-10-under-the-hood.spec.ts --repeat-each=5` passes 40 of 40; `npm test -- tests/32-ssr-ssg-hydration` passes; `grep -rn 'holdMain\|waitForTimeout' labs/e2e/tests/32-ssr-ssg-hydration` prints nothing; no server left on 4300 or 4400; `test-results/` removed; check-snippets 32 exit 0.
- Model: **Sonnet** (mechanical); the main session runs the specs.

### FIX-M32-03 · S · Anchors for the file-level links into 32 (T-7; +0 words)
- Files: link targets only in `modules/02-*.md`, `04-*.md`, `12-*.md`, `14-*.md`, `17-signals.md` (allowed through this FIX, RUN.md §10), `18-*.md`, `20-*.md`, `21-*.md`, `24-*.md`, `27-*.md`, `31-*.md`.
- Do: apply the REVIEW-M32 Handoffs table (27 rows; find each line by its context text, not the line number). For 20:431, 20:1368, 20:1769 and 31:586 change only the link target here; their sentences are FIX-M32-04's. Verify each slug against module 32's `## N.` headings and `<a id="ex32-2">`. Leave the "stay file-level" lines alone.
- Acceptance: `node labs/tools/check-links.mjs --planned` exits 0; `git diff --stat` touches only those eleven files (on top of their existing uncommitted changes); prose counts of every touched module unchanged.
- Model: **Sonnet** (mechanical; slugs listed).

### FIX-M32-04 · S · Stale "documented only" sentences in 20 and 31 (T-8)
- Files: `modules/20-lifecycle-and-render-hooks.md`, `modules/31-performance.md`.
- Blocked on Jorge (REVIEW-M32 For Jorge 1). If approved: replace the four sentences with T-8's text (find each by its quoted text; if FIX-M32-03 ran first, match the new link target).
- Acceptance: check-links `--planned` exit 0; `grep -c 'no test claims it' modules/20-lifecycle-and-render-hooks.md` = 0; `grep -c 'never observed' modules/20-lifecycle-and-render-hooks.md` = 0 for the two lines named; 31:586 no longer says "(read, not run)"; modules 20 and 31 prose each within their caps (about +16 and +8).
- Model: **Sonnet** (texts prescribed).
```

Net prose after FIX-M32-01: about +90 (T-1 +58, T-2 +22, T-3 −35, T-4 +16, F-1..F-3 +16, T-5 +4, nits +2), for about 18,460 (≤ 18,535 and ≤ 19,235). FIX-M32-02 and -03 add no module-32 words.

## For Jorge

1. **Four stale sentences** (T-8): 20:431, 20:1368, 20:1769 and 31:586 still say "documented only", "never observed" or "read, not run" for what 32 §7 and §1 now observe. Apply T-8's texts (FIX-M32-04)? This follows the HOUSE-24 precedent.
2. **VERSIONS.md rows** still open from CLOSE-M32:
   - the event-replay row's "Unverified" note (replace it with M32.md For Jorge 3's text);
   - `@angular/platform-server` 22.2.1 and `express` 5.2.1;
   - `withIncrementalHydration` deprecated 22.0 and `withNoIncrementalHydration` added 22.0;
   - `CommonEngine` deprecated 22.0;
   - host validation 400 in 22.0.

   The review also found `ssr.platform` renamed in 22.0 (the 22.0.0 `update-workspace-config` migration), if you want that row.
3. **12:127 "one project"** is stale since `ssr-lab` (HOUSE-28 fixed only the test). It needs a one-line edit in module 12, which no FIX here touches.
4. **`resource` `id` marker** (F-3 c): the review recommends `[Added in v22.0]`, to match 17:449 and the Core 22.0.0 line. M32.md C5 asked for a marker only if the CHANGELOG "names" `id`. FIX-M32-01 applies the recommendation unless you say otherwise.
5. **C13 cannot be diffed:** `labs/e2e` is wholly untracked, so "module 30 lab edits limited to HOUSE-26's `webServer` entry" rests on reading `playwright.config.ts` and the LOG, not on a diff.
