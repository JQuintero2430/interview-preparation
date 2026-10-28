# Angular audit recovery — 2026-10-25

## Guidelines used

- Audience: beginner through architect interview preparation; clear English, progressively deeper explanations, no seniority labels (STYLE-GUIDE §§1–2).
- Keep the existing 47 numbered modules, question IDs, module ownership, root reference guides and historical planning records (STYLE-GUIDE §§4–5; RUN §7).
- Target the 2026-10-03 snapshot: Angular 22.2.1, TypeScript 6.0.3, RxJS 7.8.2, Node 24; check shipped source where current docs disagree (VERSIONS; STYLE-GUIDE §3).
- Preserve strict TypeScript, modern Angular defaults, tested output answers and the five snippet kinds (STYLE-GUIDE §7).
- Use the existing tools for links, snippets, module statistics, consistency and generated indexes; the labs define the build/typecheck/test commands. No dependency upgrades or structural changes.

## Recovery evidence

Recovered the previous audit's complete final report from its `SubagentHandback` call at `2026-10-25T20:48:58.084Z`. Its original session transcript remains readable at the following local path (read only during recovery):

`/Users/jorge.quintero/.claude/projects/-Users-jorge-quintero-IdeaProjects/57a1ddcd-bd66-4bbf-b7b4-24b3570bb7c2/subagents/agent-ae92f6cb8da62a026.jsonl`

The Oct 24 completion in STATE/LOG belongs to guide generation, preceding the Oct 25 audit. The table below records recovered reviewer handbacks, not a claim that every historical line was independently reread during recovery. Current recovery reviewed the root/meta diffs, reconciliation fields and outstanding handback findings; it also ran the structural check below. Generated indexes are verified from their reviewed inputs by the existing generators rather than by repeating thousands of rendered entries.

## Fixes added during recovery

- `labs/tools/check-links.mjs:10` and `labs/tools/check-links.test.mjs:8`: include lab Markdown, exclude generated output/dependencies and add a regression check for traversal.
- `modules/13-components-and-templates.md:55` and `modules/31-performance.md:218`: include explicit `markForCheck()` in the abbreviated OnPush trigger explanation, matching module 21 and the pinned core source.
- `modules/20-lifecycle-and-render-hooks.md:54`: distinguish projected-content hooks from own-view children throughout the summary and answers; preserve the lab's asserted order.
- `modules/22-rxjs-foundations.md:37`, `_meta/GLOSSARY-TERMS.md:956` and `GLOSSARY.md`: consistently qualify producer-per-subscription behavior as cold, including summary, Q22.01 and flashcard.
- `modules/24-routing.md:2371`: hash navigation sends the document path before `#`, which can be `/app/`, rather than always `/` (RFC 3986 §3.5).
- `SOURCES.md`: record exact source references supporting these corrections; `_meta/STATE.md`, `PROGRESS.md` and `_meta/LOG.md` record the final recovery evidence.

## Fixes in root guides and metadata

- Technical accuracy — `CHEATSHEET.md:244`: limit producer-per-subscription behavior to cold Observables, matching module 22 §3 and the RxJS 7.8.2 Observable/Subject implementation.
- State consistency — `_meta/STATE.md:21`: replace the stale claim that RUN's React path was left unchanged; RUN already contains the corrected folder under Jorge's explicit instruction.
- Recovered fixes — `PROGRESS.md:12`: completed phase/review flags and accurate 1,220-question/192-exercise counts; `VERSIONS.md:73`: hydration/replay defaults; `STYLE-GUIDE.md:170` and `README.md:384`: five snippet kinds.
- Recovered fixes — `_meta/GLOSSARY-TERMS.md:513` and `GLOSSARY.md:795`: separate distinct homonyms and correct Angular, RxJS, HTTP and Playwright definitions; regenerate glossary using its existing generator.
- Recovered fixes — `_meta/modules/M22.md:26`, `_meta/reviews/REVIEW-M41.md:147`, `_meta/TASKS.md:27`, `_meta/LOG.md:1933`: repair inline code delimiters/table pipes, a merged log line, and inconsistent plan budget totals without changing recorded commands or historical quotes.

## Decisions

- Preserve append-only LOG entries, including the duplicate historical SEC-M38-08 record; RUN defines LOG as append-only, and deleting files/content is outside the brief.
- Treat old plans/review fix estimates, truncated quotations and superseded “For Jorge” notes as historical evidence; closed TASKS rows and the files on disk determine current status (RUN §3; HOUSE-50).
- Keep quoted source typos and marker-looking text intact when they are evidence, not live links; only repair Markdown delimiters around them (STYLE-GUIDE accuracy rule).
- Retain the six explicit prose-cap exceptions and the Oct 3 version snapshot; both are existing repository decisions, not new upgrade requests.
- Backend carry-overs are verified against exact official Spring Boot 4.1.1, Spring Security 7.1.1, Jackson 3.1.5, springdoc 3.1.1 and angular-oauth2-oidc 22.0.2 source tags: Jackson annotations stay at 2.21; API-version header property, timestamp defaults, public-client refresh behavior, logout cookie naming and the CSRF interceptor override match the existing prose. Keep correct snapshot text instead of adopting newer documentation.
- Follow the existing generators for QUESTION-INDEX and GLOSSARY; reviewed source definitions and module headings remain authoritative.
- All existing Angular changes were pre-existing at recovery; recovery edits are applied on top. No staged, committed, reverted or stashed content is introduced.

## Unresolved or flagged

The recovered final report closes all earlier carry-over questions and reports 101 modified files with no untracked or staged files at handback. No outstanding audit decision requires user action. Current recovery corrected the additional technical inconsistencies listed above. Historical observations remain in their original records with the decisions above. Browser rendering on GitHub is not newly exercised; Markdown structure and local anchors are checked by repository tools. Spring snippets remain illustrative as required by VERSIONS and STYLE-GUIDE, not compiled Java labs.

## Verification evidence

Root/meta structural self-check (inline Python, run from guide root): **exit 0** — 116 existing Markdown files, zero unclosed code fences; TASKS table has zero `todo`, `in_progress` or `blocked` rows; UNVERIFIED ledger has zero open items. This check does not substitute for the full repository test and link runs.

All commands below were run serially for this guide using Node 24.21.0. Paths in the first column identify the working directory; tool commands run from the guide root.

| Directory | Command | Exit | Result |
|---|---|---|---|
| guide | `node --test 'labs/tools/*.test.mjs'` | 0 | 36/36 tests |
| guide | `node labs/tools/check-links.mjs` | 0 | All relative links/anchors resolve, including lab Markdown |
| guide | `node labs/tools/check-snippets.mjs .` | 0 | All 47 modules' checked snippets match |
| guide | `node labs/tools/module-stats.mjs --strict` | 0 | 47 modules, 1220 questions, zero flags |
| guide | `node labs/tools/consistency-scan.mjs --strict-markers` | 0 | No strict marker violations |
| guide | `node labs/tools/question-index.mjs --check` | 0 | Index current |
| guide | `node labs/tools/glossary.mjs --check` | 0 | 2784 entries / 2560 keys |
| labs/ts-js | `npm run typecheck` | 0 | Strict TypeScript |
| labs/ts-js | `npm test` | 0 | 254 files, 1325/1325 tests |
| labs/angular | `npm run build -- ui-lib` | 0 | Library built |
| labs/angular | `npm run build` | 0 | Application built |
| labs/angular | `node node_modules/typescript/bin/tsc -p tsconfig.spec.json --noEmit` | 0 | Test samples type-check |
| labs/angular | `npm test -- --watch=false` | 0 | 369 files, 2445/2445 tests |
| labs/e2e | `CI=1 npm run typecheck` | 0 | E2E TypeScript |
| labs/e2e | `CI=1 caffeinate -dimsu npm test` | 0 | 564/564 Chromium tests; production projects built by Playwright |
| guide | `git diff --check -- .` | 0 | No whitespace errors |

No package defines a lint or format-check script. Development/watch/serve commands and browser installation are operational commands, not finite verification checks. The installed toolchain was reused; no dependency upgrades were made. The technical reviewer also ran an inline assert-based RxJS cold/hot and URL hash/path self-check (exit 0); glossary regeneration and its check both exited 0.

The first recovery attempt at the ts-js tests ran inside the restricted sandbox, timed out on localhost HTTP tests and was interrupted (130). The unchanged command passed all 1325 tests outside that restriction. The prior audit's pre-edit Angular baseline was exit 1 (2443 passed, two 1500-row-render tests exceeded 5000 ms); its corrected suite and this recovery both pass 2445/2445. The suite-specific 30000 ms limit preserves all assertions.

Touched lab TypeScript is checked by the builds/test typecheck. The recovered worker additionally compiled the corrected standalone Q28.13 partial and the Q07 ResolveFn diagnostic probe in strict mode with exit 0; recovery changed no TypeScript code samples. Java remains manually verified illustrative material per the repository contract. After E2E, no listeners remained on ports 4300–4900. Existing intentional diagnostics/jsdom limitations did not fail any check.

## Final git status

Current branch: `main`. All pre-existing modifications were preserved. No staged changes or git-history mutations were made.

```text
 M CHEATSHEET.md
 M GLOSSARY.md
 M MOCK-INTERVIEWS.md
 M PROGRESS.md
 M README.md
 M SOURCES.md
 M STYLE-GUIDE.md
 M SYLLABUS.md
 M VERSIONS.md
 M _meta/GLOSSARY-TERMS.md
 M _meta/LOG.md
 M _meta/ROADMAP.md
 M _meta/RUN.md
 M _meta/STATE.md
 M _meta/TASKS.md
 M _meta/modules/M12.md
 M _meta/modules/M14.md
 M _meta/modules/M18.md
 M _meta/modules/M19.md
 M _meta/modules/M20.md
 M _meta/modules/M22.md
 M _meta/modules/M23.md
 M _meta/modules/M24.md
 M _meta/modules/M25.md
 M _meta/modules/M29.md
 M _meta/modules/M30.md
 M _meta/modules/M34.md
 M _meta/modules/M38.md
 M _meta/modules/M46.md
 M _meta/modules/M47.md
 M _meta/reviews/REVIEW-M01.md
 M _meta/reviews/REVIEW-M03.md
 M _meta/reviews/REVIEW-M04.md
 M _meta/reviews/REVIEW-M05.md
 M _meta/reviews/REVIEW-M06.md
 M _meta/reviews/REVIEW-M07.md
 M _meta/reviews/REVIEW-M09.md
 M _meta/reviews/REVIEW-M11.md
 M _meta/reviews/REVIEW-M12.md
 M _meta/reviews/REVIEW-M13.md
 M _meta/reviews/REVIEW-M15.md
 M _meta/reviews/REVIEW-M16.md
 M _meta/reviews/REVIEW-M19.md
 M _meta/reviews/REVIEW-M22.md
 M _meta/reviews/REVIEW-M25.md
 M _meta/reviews/REVIEW-M30.md
 M _meta/reviews/REVIEW-M31.md
 M _meta/reviews/REVIEW-M33.md
 M _meta/reviews/REVIEW-M34.md
 M _meta/reviews/REVIEW-M36.md
 M _meta/reviews/REVIEW-M41.md
 M _meta/reviews/REVIEW-M42.md
 M _meta/reviews/REVIEW-X-01.md
 M _meta/reviews/REVIEW-X-03.md
 M _meta/reviews/REVIEW-X-SCAN.md
 M labs/angular/README.md
 M labs/angular/projects/elements-lab/src/app/app.config.ts
 M labs/angular/src/app/modules/31-performance/exercise-1-fast-list/product-list.spec.ts
 M labs/angular/tsconfig.json
 M labs/tools/check-links.mjs
 M labs/tools/check-links.test.mjs
 M modules/01-js-values-types-coercion.md
 M modules/03-js-objects-prototypes-classes.md
 M modules/05-js-modules-memory-modern-features.md
 M modules/07-ts-advanced-types-and-decorators.md
 M modules/09-web-networking-storage-security.md
 M modules/10-css-essentials.md
 M modules/11-accessibility.md
 M modules/12-angular-how-it-works.md
 M modules/13-components-and-templates.md
 M modules/14-directives-and-pipes.md
 M modules/16-dependency-injection.md
 M modules/17-signals.md
 M modules/18-control-flow-and-defer.md
 M modules/19-component-communication-and-projection.md
 M modules/20-lifecycle-and-render-hooks.md
 M modules/21-change-detection.md
 M modules/22-rxjs-foundations.md
 M modules/23-rxjs-in-depth.md
 M modules/24-routing.md
 M modules/25-forms-reactive-and-template-driven.md
 M modules/26-signal-forms.md
 M modules/27-http-client.md
 M modules/28-state-management.md
 M modules/29-testing-angular.md
 M modules/30-e2e-and-testing-strategy.md
 M modules/31-performance.md
 M modules/32-ssr-ssg-hydration.md
 M modules/33-security.md
 M modules/34-i18n.md
 M modules/35-animations.md
 M modules/36-material-and-cdk.md
 M modules/37-elements-pwa-errors-ecosystem.md
 M modules/38-architecture-and-production-structure.md
 M modules/39-version-history-and-migrations.md
 M modules/40-framework-comparisons.md
 M modules/42-fullstack-authentication.md
 M modules/44-fullstack-delivery-and-operations.md
 M modules/45-frontend-system-design-method.md
 M modules/46-system-design-case-studies.md
 M modules/47-behavioral-and-interview-craft.md
?? _meta/FINAL-REVIEW.md
```

The new report is a requested delivery artifact, not a temporary scratch file. Changes in React/Java elsewhere in the parent Git repository were not touched during recovery.

## Root/meta file coverage

Every file below has a recovered review handback or is generated from reviewed inputs. Source identifies the prior reviewer ID in the transcript above. All were included in the current fence check; changed files were additionally checked through their current diffs. `SOURCES.md`, `modules/` and `labs/` belong to the technical/tool verification workers and are covered in the final consolidated evidence.

| File | Review evidence |
|---|---|
| `CHEATSHEET.md` | Reviewed — a80802c7110fcf958 |
| `GLOSSARY.md` | Reviewed — aecc44d623d207d83; generated from reviewed terms |
| `MOCK-INTERVIEWS.md` | Reviewed — a80802c7110fcf958 |
| `PROGRESS.md` | Reviewed — a4efdc20938a27d0a |
| `QUESTION-INDEX.md` | Reviewed — generated from reviewed module question headings |
| `README.md` | Reviewed — a4efdc20938a27d0a |
| `STYLE-GUIDE.md` | Reviewed — a4efdc20938a27d0a |
| `SYLLABUS.md` | Reviewed — a4efdc20938a27d0a |
| `VERSIONS.md` | Reviewed — a4efdc20938a27d0a |
| `_meta/CALIBRATION.md` | Reviewed — a265e6a6c60bd1eb3 |
| `_meta/GLOSSARY-TERMS.md` | Reviewed — aecc44d623d207d83 |
| `_meta/LOG.md` | Reviewed — a2e9bd555d8a1fb30 + ad7df88837bf95a28 + a7a53f13115436216 + ac6300e6bdd060538 + a906372f247c8760c |
| `_meta/QUALITY-BAR.md` | Reviewed — a265e6a6c60bd1eb3 |
| `_meta/ROADMAP.md` | Reviewed — a265e6a6c60bd1eb3 |
| `_meta/RUN.md` | Reviewed — a265e6a6c60bd1eb3 |
| `_meta/STATE-ARCHIVE.md` | Reviewed — a265e6a6c60bd1eb3 |
| `_meta/STATE.md` | Reviewed — a265e6a6c60bd1eb3 |
| `_meta/TASKS.md` | Reviewed — ae219f11707b22b4f + a5f86239ce1b8c1eb |
| `_meta/UNVERIFIED.md` | Reviewed — a265e6a6c60bd1eb3 |
| `_meta/modules/FINISH.md` | Reviewed — a190d37ca94c44ed6 |
| `_meta/modules/M05.md` | Reviewed — a53061d2da394b030 |
| `_meta/modules/M06.md` | Reviewed — a53061d2da394b030 |
| `_meta/modules/M07.md` | Reviewed — a53061d2da394b030 |
| `_meta/modules/M08.md` | Reviewed — a53061d2da394b030 |
| `_meta/modules/M09.md` | Reviewed — a53061d2da394b030 |
| `_meta/modules/M10.md` | Reviewed — a53061d2da394b030 |
| `_meta/modules/M11.md` | Reviewed — a53061d2da394b030 |
| `_meta/modules/M12.md` | Reviewed — a53061d2da394b030 |
| `_meta/modules/M13.md` | Reviewed — a53061d2da394b030 |
| `_meta/modules/M14.md` | Reviewed — a53061d2da394b030 |
| `_meta/modules/M15.md` | Reviewed — a95b83292667d644d |
| `_meta/modules/M16.md` | Reviewed — a95b83292667d644d |
| `_meta/modules/M18.md` | Reviewed — a95b83292667d644d |
| `_meta/modules/M19.md` | Reviewed — a95b83292667d644d |
| `_meta/modules/M20.md` | Reviewed — a95b83292667d644d |
| `_meta/modules/M21.md` | Reviewed — a95b83292667d644d |
| `_meta/modules/M22.md` | Reviewed — a74ae68df19901d2d |
| `_meta/modules/M23.md` | Reviewed — a74ae68df19901d2d |
| `_meta/modules/M24.md` | Reviewed — a74ae68df19901d2d |
| `_meta/modules/M25.md` | Reviewed — a74ae68df19901d2d |
| `_meta/modules/M26.md` | Reviewed — ad22a1860dead2fae |
| `_meta/modules/M27.md` | Reviewed — ad22a1860dead2fae |
| `_meta/modules/M28.md` | Reviewed — ad22a1860dead2fae |
| `_meta/modules/M29.md` | Reviewed — ad22a1860dead2fae |
| `_meta/modules/M30.md` | Reviewed — a584a983bfd774d8a |
| `_meta/modules/M31.md` | Reviewed — a584a983bfd774d8a |
| `_meta/modules/M32.md` | Reviewed — a584a983bfd774d8a |
| `_meta/modules/M33.md` | Reviewed — a584a983bfd774d8a |
| `_meta/modules/M34.md` | Reviewed — a584a983bfd774d8a |
| `_meta/modules/M35.md` | Reviewed — af7501409941ce13e |
| `_meta/modules/M36.md` | Reviewed — af7501409941ce13e |
| `_meta/modules/M37.md` | Reviewed — af7501409941ce13e |
| `_meta/modules/M38.md` | Reviewed — af7501409941ce13e |
| `_meta/modules/M39.md` | Reviewed — a34ec1d0ad6049162 |
| `_meta/modules/M40.md` | Reviewed — a34ec1d0ad6049162 |
| `_meta/modules/M41.md` | Reviewed — a34ec1d0ad6049162 |
| `_meta/modules/M42.md` | Reviewed — a34ec1d0ad6049162 |
| `_meta/modules/M43.md` | Reviewed — a190d37ca94c44ed6 |
| `_meta/modules/M44.md` | Reviewed — a190d37ca94c44ed6 |
| `_meta/modules/M45.md` | Reviewed — a190d37ca94c44ed6 |
| `_meta/modules/M46.md` | Reviewed — a190d37ca94c44ed6 |
| `_meta/modules/M47.md` | Reviewed — a190d37ca94c44ed6 |
| `_meta/reviews/REVIEW-M01.md` | Reviewed — a646036d87d3d099b |
| `_meta/reviews/REVIEW-M02.md` | Reviewed — a646036d87d3d099b |
| `_meta/reviews/REVIEW-M03.md` | Reviewed — a646036d87d3d099b |
| `_meta/reviews/REVIEW-M04.md` | Reviewed — a646036d87d3d099b |
| `_meta/reviews/REVIEW-M05.md` | Reviewed — a646036d87d3d099b |
| `_meta/reviews/REVIEW-M06.md` | Reviewed — a646036d87d3d099b |
| `_meta/reviews/REVIEW-M07.md` | Reviewed — a646036d87d3d099b |
| `_meta/reviews/REVIEW-M08.md` | Reviewed — a646036d87d3d099b |
| `_meta/reviews/REVIEW-M09.md` | Reviewed — a646036d87d3d099b |
| `_meta/reviews/REVIEW-M10.md` | Reviewed — a646036d87d3d099b |
| `_meta/reviews/REVIEW-M11.md` | Reviewed — a6bb35e94621a3302 |
| `_meta/reviews/REVIEW-M12.md` | Reviewed — a6bb35e94621a3302 |
| `_meta/reviews/REVIEW-M13.md` | Reviewed — a6bb35e94621a3302 |
| `_meta/reviews/REVIEW-M14.md` | Reviewed — a6bb35e94621a3302 |
| `_meta/reviews/REVIEW-M15.md` | Reviewed — a6bb35e94621a3302 |
| `_meta/reviews/REVIEW-M16.md` | Reviewed — a6bb35e94621a3302 |
| `_meta/reviews/REVIEW-M18.md` | Reviewed — a6bb35e94621a3302 |
| `_meta/reviews/REVIEW-M19.md` | Reviewed — a6bb35e94621a3302 |
| `_meta/reviews/REVIEW-M20.md` | Reviewed — a6bb35e94621a3302 |
| `_meta/reviews/REVIEW-M21.md` | Reviewed — a6bb35e94621a3302 |
| `_meta/reviews/REVIEW-M22.md` | Reviewed — a3f46f8660765b854 |
| `_meta/reviews/REVIEW-M23.md` | Reviewed — a3f46f8660765b854 |
| `_meta/reviews/REVIEW-M24.md` | Reviewed — a3f46f8660765b854 |
| `_meta/reviews/REVIEW-M25.md` | Reviewed — a3f46f8660765b854 |
| `_meta/reviews/REVIEW-M26.md` | Reviewed — a3f46f8660765b854 |
| `_meta/reviews/REVIEW-M27.md` | Reviewed — a3f46f8660765b854 |
| `_meta/reviews/REVIEW-M28.md` | Reviewed — a3f46f8660765b854 |
| `_meta/reviews/REVIEW-M29.md` | Reviewed — a3f46f8660765b854 |
| `_meta/reviews/REVIEW-M30.md` | Reviewed — a3f46f8660765b854 |
| `_meta/reviews/REVIEW-M31.md` | Reviewed — a3cfb9e3ca51e3cb8 |
| `_meta/reviews/REVIEW-M32.md` | Reviewed — a3cfb9e3ca51e3cb8 |
| `_meta/reviews/REVIEW-M33.md` | Reviewed — a3cfb9e3ca51e3cb8 |
| `_meta/reviews/REVIEW-M34.md` | Reviewed — a3cfb9e3ca51e3cb8 |
| `_meta/reviews/REVIEW-M35.md` | Reviewed — a3cfb9e3ca51e3cb8 |
| `_meta/reviews/REVIEW-M36.md` | Reviewed — a3cfb9e3ca51e3cb8 |
| `_meta/reviews/REVIEW-M37.md` | Reviewed — a3cfb9e3ca51e3cb8 |
| `_meta/reviews/REVIEW-M38.md` | Reviewed — a3cfb9e3ca51e3cb8 |
| `_meta/reviews/REVIEW-M39.md` | Reviewed — a3cfb9e3ca51e3cb8 |
| `_meta/reviews/REVIEW-M40.md` | Reviewed — a5806fbc5eb677ebf |
| `_meta/reviews/REVIEW-M41.md` | Reviewed — a5806fbc5eb677ebf |
| `_meta/reviews/REVIEW-M42.md` | Reviewed — a5806fbc5eb677ebf |
| `_meta/reviews/REVIEW-M43.md` | Reviewed — a5806fbc5eb677ebf |
| `_meta/reviews/REVIEW-M44.md` | Reviewed — a5806fbc5eb677ebf |
| `_meta/reviews/REVIEW-M45.md` | Reviewed — a5806fbc5eb677ebf |
| `_meta/reviews/REVIEW-M46.md` | Reviewed — a5806fbc5eb677ebf |
| `_meta/reviews/REVIEW-M47.md` | Reviewed — a5806fbc5eb677ebf |
| `_meta/reviews/REVIEW-X-01.md` | Reviewed — a12533ac9bde3ee62 |
| `_meta/reviews/REVIEW-X-02.md` | Reviewed — a12533ac9bde3ee62 |
| `_meta/reviews/REVIEW-X-03.md` | Reviewed — a12533ac9bde3ee62 |
| `_meta/reviews/REVIEW-X-04.md` | Reviewed — a12533ac9bde3ee62 |
| `_meta/reviews/REVIEW-X-05.md` | Reviewed — a12533ac9bde3ee62 |
| `_meta/reviews/REVIEW-X-07.md` | Reviewed — a12533ac9bde3ee62 |
| `_meta/reviews/REVIEW-X-SCAN.md` | Reviewed — a12533ac9bde3ee62 |
| `_meta/reviews/REVIEW-X.md` | Reviewed — a12533ac9bde3ee62 |

The newly added `_meta/FINAL-REVIEW.md` was reviewed during recovery as the audit deliverable. The recovered final handback additionally states coverage of all 47 modules and labs code/config; file-level lab coverage is recorded by the coordinating agent rather than inferred from passing tests.

Excluded from root/meta review: `.DS_Store` (OS metadata). Generated/vendor/build exclusions for the full guide are recorded by the coordinating agent.

## Recovered audit fixes and decisions

This is the prior worker's final accounting, preserved as recovered evidence; current recovery corrections and results above take precedence. Numeric module prefixes identify the corresponding existing `modules/NN-*.md` file.

<details>
<summary>Prior worker changes and rationale</summary>

## Fixes (101 files, +428/−376). Categories below; per-file:line detail was condensed where batches are large.
**Technical accuracy (modules)**
- 01:373 SameValueZero row. 03:701 `__proto__` is Normative Optional, not Annex B. 03:1613 iterator `chunks` is ES2027. 03:248 `[Added in v22.2]`. 05:27 intro exceptions.
- 09:1020 Q09.16 (the cookie is stored, not rejected). 09:1263 the CORS check runs on the preflight answer.
- 12:595/1298 NG81xx plus NG8011.
- 13:55, 14:711, 17:40, 19:78: the OnPush trigger set now includes inputs and markForCheck. 13:876 namespace prefix.
- 20:46-54/~900/~2197 and :840/:858/:866/:937/:1853: content hooks are no longer called post-order. The module's own asserted log puts parent.afterContentInit before child.onChanges.
- 21:1171 onMicrotaskEmpty. 22:1055 platform Observable operators. 23:154 marker only on switchScan. 23:1742 and MOCK-INTERVIEWS:389 rxResource with new params vs reload().
- 26:116 an unsourced "quote" is now worded as the cause of the misconception.
- 27:537 a rejected fetch gives HttpErrorResponse with status 0 plus url. 27:2042 httpResource options. 28:1930 five dispatches. 28:2104 `addEntity<Todo>`. 29:470 deferBlockBehavior default.
- 30:248-271/970/GLOSSARY-TERMS:1541 removed the "not inert" actionability check, which Playwright 1.63 does not have.
- 34:566/1401 and SOURCES:2085: the 22.2.1 docs say "an error occurs", the source only warns, and `main` docs now agree.
- 42:68/337/805/1142 `throws Exception`. 46:1101 question count. 46:6 Applies-to adds RFC 6585 and the PostgreSQL 18 docs.
- VERSIONS:18/73/74 (Node engines, incremental hydration default, event replay).

**Snippets** (Partial snippets type-checked with tsc strict in scratch)
- 28 Q28.13 Partial did not compile (TS7006). Fixed by annotating `items: { id: number }[]`; tsc exit 0 afterwards.
- 13 Q13.21/Q13.23 and 37:1490: Partial members and imports.
- 38:1175 Q38.05 header.
- 28/29/30: 26 Output headers changed from `// Complete:` to `// Partial:` (§7.3).
- 19:2213 html block was mislabelled Complete; now marked Excerpt.
- Non-TS excerpts made verbatim: 35 (×4), 38:446, 34:1382, 37:769, 44:310.

**Markers, guideline conformance**
- 09/10/11: 14 Baseline prose statuses converted to `[Baseline YYYY: … per MDN]` (09:403, 529; 10:117, 121, 252, 377, 380, 443, 445×3, 564, 962; 11:213). Prose stays under the cap: 9,998 / 9,974 / 9,979.
- STYLE-GUIDE:170 and README:384 now say "five kinds".

**Lab and tooling**
- labs/angular `npm test` baseline failure (exit 1). Root cause: the E31.1 suite renders the full list in jsdom, and under full-suite load tests took 5,549 and 7,761 ms against Vitest's 5,000 ms default (10/10 pass in isolation). Fix in product-list.spec.ts: a named `SLOW_RENDER = { timeout: 30_000 }` passed through `describe.each(name, options, fn)`. No dependency bump.
- elements-lab app.config.ts: dropped the deprecated `withFetch()`.
- labs/angular/tsconfig.json: added the missing material-lab reference.
- labs/angular/README.md: the e2e section is now accurate.
- labs/tools/check-links.mjs: `stripCode` now strips any CommonMark backtick-run span, so links inside valid double-backtick spans are no longer flagged as broken. Added one test in check-links.test.mjs.
- The frontend-workflow skill was followed. frontend-reviewer: PASS. prettier --check is clean on the spec. elements-lab app.config.ts was already non-conforming at HEAD; only lines that did not change are affected.

**Links, structure, Markdown**
- 47:641/685/718/751 `]](` link syntax. 13:1296, 20:1478, 25:3070 link targets.
- Removed stale "(planned)", "not yet written" and "all file-level" text from Connections in 25–39 and 47.
- Code-span render repairs (backslash-escaped or nested backticks re-delimited, `\|` escapes inside table code spans):
  - module 17:1579 and 27:1706
  - LOG:1184/1623/1869/1933
  - TASKS: 22 grep spans plus :8457
  - _meta/modules M12, M18, M19, M20, M23, M24, M25, M29, M34, M38, M46
  - REVIEW-M01–M47 and X-01/X-03/X-SCAN (about 60 spans)
  - REVIEW-M33:201-202 `<` restored
  - REVIEW-M41:147
- SOURCES:302/432 paragraph breaks.
- SOURCES "Module 27 · HttpClient" changed to "HTTP client".
- GLOSSARY-TERMS: R3 definition and qualifier fixes. The "reducer" entry moved to the Module 47 section, and a missing `)` was added. GLOSSARY.md regenerated.

**Stale state**
- PROGRESS:5/12/16/55/56/61/64/65/87/91.
- STATE:6/12: 192 exercises, 47/47.
- ROADMAP:56 now labels the CLOSE count.
- SYLLABUS:7 (topic boxes), :76 (README carries the full map), §5 note (the labs tree is the approved plan, with the built additions).
- M22:26/28 budget numbers. M30:70 legend `w`. M47:486 misquote. M14 "Misconception candidates".
- RUN.md (owner Jorge, objective defects only): :36 React guide path, :150 empty code span, :185 Playwright rule, §13 boxes ticked (FINAL-VERIFY plus this run).

**Language**
- Comma splices, punctuation and capitalization in 01, 03, 07, 18, 25, 38, 39, CHEATSHEET:246, MOCK:103 and VERSIONS:75 ("simply").

## Decisions
- AccName 1.2 is cited as "WD 02 October 2026", the dated draft that was read. TR now shows a 21 Oct 2026 draft, but steps 2A–2I, the ids and the quoted text are unchanged.
- RFC 5987 kept; RFC 6266 §4.3 references it, and RFC 8187 keeps the same syntax.
- SOURCES section order kept (17 after 08, 16 before 15). Sections are in writing order and found by module number; reordering would mean moving content, which is out of scope.
- LOG:1584/1585 duplicate entry kept, because the log is append-only.
- Glossary "end-to-end test" (29) and "end-to-end (e2e) test" (30) kept: they are separate per-module records with agreeing definitions.
- TASKS:3678/3836/3974 apostrophes are correct plural possessives. Planning count mismatches in TASKS and M-plans are historical estimates.
- REVIEW-X-SCAN `] (` spacing restored. A subagent had relinked 448 entries, but the space is deliberate: those targets do not resolve from `_meta/reviews/`.
- The L1 tool feature ideas (non-TS coverage in check-snippets, .nvmrc, engines) are new features, so out of scope. My scratch scripts verified the content they would have covered.


</details>

## Remaining file coverage

The prior final handback explicitly reports review of all 47 modules and all lab code/configuration. The following per-file inventory materializes that inherited coverage; it does not claim a second manual reread of every unchanged file. Recovery additionally inspected changed technical text against its linked tests/shipped sources, checked lab diffs and reran all executable verification. Binary CLI icons and the generated visual baseline are retained assets covered by builds/browser tests.

<details>
<summary>1954 reviewed source, module, lab and configuration files (inherited review; current checks above)</summary>

```text
reviewed (prior audit): .gitignore
reviewed (prior audit): SOURCES.md
reviewed (prior audit): labs/.gitignore
reviewed (prior audit): labs/.nvmrc
reviewed (prior audit): labs/angular/.editorconfig
reviewed (prior audit): labs/angular/.gitignore
reviewed (prior audit): labs/angular/.prettierrc
reviewed (prior audit): labs/angular/README.md
reviewed (prior audit): labs/angular/angular.json
reviewed (prior audit): labs/angular/deploy/Dockerfile
reviewed (prior audit): labs/angular/deploy/Dockerfile.dockerignore
reviewed (prior audit): labs/angular/deploy/Dockerfile.ssr
reviewed (prior audit): labs/angular/deploy/config/config.json.template
reviewed (prior audit): labs/angular/deploy/docker-entrypoint.d/40-write-config.sh
reviewed (prior audit): labs/angular/deploy/nginx/default.conf.template
reviewed (prior audit): labs/angular/package.json
reviewed (prior audit): labs/angular/projects/animations-lab/public/favicon.ico
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/app.config.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/app.routes.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/app.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/home/home.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/m35/callbacks/callbacks.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/m35/callbacks/short-timeout.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/m35/enter-leave/enter-leave.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/m35/exercise-1-toasts/a/toasts-a.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/m35/exercise-1-toasts/b/toasts-b.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/m35/exercise-1-toasts/toast-store.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/m35/exercise-2-disclosure/a/disclosure-a.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/m35/exercise-2-disclosure/b/disclosure-b.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/m35/exercise-3-stagger/a/stagger-a.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/m35/exercise-3-stagger/b/stagger-b.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/m35/exercise-3-stagger/before/stagger-before.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/m35/exercise-3-stagger/items.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/m35/exercise-4-shared-element/a/products-a.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/m35/exercise-4-shared-element/b/products-b.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/m35/exercise-4-shared-element/detail.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/m35/exercise-4-shared-element/list.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/m35/exercise-4-shared-element/products.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/m35/internals/internals.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/m35/keyframes/keyframes.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/m35/legacy/legacy.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/m35/lists/lists.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/m35/mechanisms/mechanisms.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/m35/migration/legacy-panel.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/m35/migration/migration.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/m35/motion/motion.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/m35/outputs/q35-02.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/m35/outputs/q35-06.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/m35/outputs/q35-08.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/m35/outputs/q35-10.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/m35/outputs/q35-13.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/m35/outputs/q35-20.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/m35/transitions/transitions.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/m35/vt/item.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/m35/vt/list.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/m35/waapi/waapi.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/app/view-transition-log.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/index.html
reviewed (prior audit): labs/angular/projects/animations-lab/src/main.legacy.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/main.ts
reviewed (prior audit): labs/angular/projects/animations-lab/src/styles.css
reviewed (prior audit): labs/angular/projects/animations-lab/tsconfig.app.json
reviewed (prior audit): labs/angular/projects/animations-lab/tsconfig.spec.json
reviewed (prior audit): labs/angular/projects/elements-lab/ngsw-config.json
reviewed (prior audit): labs/angular/projects/elements-lab/ngsw-config.v2.json
reviewed (prior audit): labs/angular/projects/elements-lab/public/favicon.ico
reviewed (prior audit): labs/angular/projects/elements-lab/public/manifest.webmanifest
reviewed (prior audit): labs/angular/projects/elements-lab/src/app/app.config.ts
reviewed (prior audit): labs/angular/projects/elements-lab/src/app/app.html
reviewed (prior audit): labs/angular/projects/elements-lab/src/app/app.routes.ts
reviewed (prior audit): labs/angular/projects/elements-lab/src/app/app.ts
reviewed (prior audit): labs/angular/projects/elements-lab/src/app/build-info.ts
reviewed (prior audit): labs/angular/projects/elements-lab/src/app/build-info.v2.ts
reviewed (prior audit): labs/angular/projects/elements-lab/src/app/error-log-view.ts
reviewed (prior audit): labs/angular/projects/elements-lab/src/app/error-log.ts
reviewed (prior audit): labs/angular/projects/elements-lab/src/app/home/home.ts
reviewed (prior audit): labs/angular/projects/elements-lab/src/app/m37/caching/caching.ts
reviewed (prior audit): labs/angular/projects/elements-lab/src/app/m37/errors/errors.ts
reviewed (prior audit): labs/angular/projects/elements-lab/src/app/m37/exercise-4-update/a/update-banner.ts
reviewed (prior audit): labs/angular/projects/elements-lab/src/app/m37/exercise-4-update/b/update-banner.ts
reviewed (prior audit): labs/angular/projects/elements-lab/src/app/m37/exercise-4-update/routes.ts
reviewed (prior audit): labs/angular/projects/elements-lab/src/app/m37/exercise-4-update/update-shell.ts
reviewed (prior audit): labs/angular/projects/elements-lab/src/app/m37/offline/offline.ts
reviewed (prior audit): labs/angular/projects/elements-lab/src/app/m37/outputs/q11.ts
reviewed (prior audit): labs/angular/projects/elements-lab/src/app/m37/outputs/q12.ts
reviewed (prior audit): labs/angular/projects/elements-lab/src/app/m37/outputs/q17.ts
reviewed (prior audit): labs/angular/projects/elements-lab/src/app/m37/push/push.ts
reviewed (prior audit): labs/angular/projects/elements-lab/src/app/m37/updates/updates.ts
reviewed (prior audit): labs/angular/projects/elements-lab/src/elements/define.ts
reviewed (prior audit): labs/angular/projects/elements-lab/src/elements/exercise-2-rating/a/define.ts
reviewed (prior audit): labs/angular/projects/elements-lab/src/elements/exercise-2-rating/b/define.ts
reviewed (prior audit): labs/angular/projects/elements-lab/src/elements/exercise-2-rating/rating.ts
reviewed (prior audit): labs/angular/projects/elements-lab/src/elements/hello.ts
reviewed (prior audit): labs/angular/projects/elements-lab/src/elements/section-1/rating.ts
reviewed (prior audit): labs/angular/projects/elements-lab/src/elements/section-3/shadow-note.ts
reviewed (prior audit): labs/angular/projects/elements-lab/src/index.html
reviewed (prior audit): labs/angular/projects/elements-lab/src/main.elements.ts
reviewed (prior audit): labs/angular/projects/elements-lab/src/main.ts
reviewed (prior audit): labs/angular/projects/elements-lab/src/styles.css
reviewed (prior audit): labs/angular/projects/elements-lab/tsconfig.app.json
reviewed (prior audit): labs/angular/projects/elements-lab/tsconfig.spec.json
reviewed (prior audit): labs/angular/projects/i18n-lab/public/favicon.ico
reviewed (prior audit): labs/angular/projects/i18n-lab/public/i18n/ar.json
reviewed (prior audit): labs/angular/projects/i18n-lab/public/i18n/fr.json
reviewed (prior audit): labs/angular/projects/i18n-lab/src/app/app.config.ts
reviewed (prior audit): labs/angular/projects/i18n-lab/src/app/app.routes.ts
reviewed (prior audit): labs/angular/projects/i18n-lab/src/app/app.ts
reviewed (prior audit): labs/angular/projects/i18n-lab/src/app/home/home.ts
reviewed (prior audit): labs/angular/projects/i18n-lab/src/app/m34/builds/builds.ts
reviewed (prior audit): labs/angular/projects/i18n-lab/src/app/m34/exercise-2-checkout/a/checkout-a.ts
reviewed (prior audit): labs/angular/projects/i18n-lab/src/app/m34/exercise-2-checkout/b/checkout-b.ts
reviewed (prior audit): labs/angular/projects/i18n-lab/src/app/m34/exercise-4-rtl-card/a/rtl-card-a.ts
reviewed (prior audit): labs/angular/projects/i18n-lab/src/app/m34/exercise-4-rtl-card/b/rtl-card-b.ts
reviewed (prior audit): labs/angular/projects/i18n-lab/src/app/m34/extract/extract.ts
reviewed (prior audit): labs/angular/projects/i18n-lab/src/app/m34/icu/icu.ts
reviewed (prior audit): labs/angular/projects/i18n-lab/src/app/m34/intl/intl.ts
reviewed (prior audit): labs/angular/projects/i18n-lab/src/app/m34/rtl/rtl.ts
reviewed (prior audit): labs/angular/projects/i18n-lab/src/app/m34/runtime/runtime.ts
reviewed (prior audit): labs/angular/projects/i18n-lab/src/bootstrap.runtime.ts
reviewed (prior audit): labs/angular/projects/i18n-lab/src/index.html
reviewed (prior audit): labs/angular/projects/i18n-lab/src/locale/messages.ar.xlf
reviewed (prior audit): labs/angular/projects/i18n-lab/src/locale/messages.fr.xlf
reviewed (prior audit): labs/angular/projects/i18n-lab/src/locale/messages.xlf
reviewed (prior audit): labs/angular/projects/i18n-lab/src/main.runtime.ts
reviewed (prior audit): labs/angular/projects/i18n-lab/src/main.ts
reviewed (prior audit): labs/angular/projects/i18n-lab/src/styles.css
reviewed (prior audit): labs/angular/projects/i18n-lab/tsconfig.app.json
reviewed (prior audit): labs/angular/projects/i18n-lab/tsconfig.spec.json
reviewed (prior audit): labs/angular/projects/material-lab/public/favicon.ico
reviewed (prior audit): labs/angular/projects/material-lab/src/app/app.config.ts
reviewed (prior audit): labs/angular/projects/material-lab/src/app/app.routes.ts
reviewed (prior audit): labs/angular/projects/material-lab/src/app/app.ts
reviewed (prior audit): labs/angular/projects/material-lab/src/app/home/home.ts
reviewed (prior audit): labs/angular/projects/material-lab/src/app/icons.ts
reviewed (prior audit): labs/angular/projects/material-lab/src/app/m36/a11y/a11y.ts
reviewed (prior audit): labs/angular/projects/material-lab/src/app/m36/aria/aria.ts
reviewed (prior audit): labs/angular/projects/material-lab/src/app/m36/drag-drop/drag-drop.ts
reviewed (prior audit): labs/angular/projects/material-lab/src/app/m36/exercise-1-theme/a/theme-a.ts
reviewed (prior audit): labs/angular/projects/material-lab/src/app/m36/exercise-1-theme/b/theme-b.ts
reviewed (prior audit): labs/angular/projects/material-lab/src/app/m36/exercise-1-theme/profile-card.ts
reviewed (prior audit): labs/angular/projects/material-lab/src/app/m36/exercise-1-theme/shell.ts
reviewed (prior audit): labs/angular/projects/material-lab/src/app/m36/exercise-1-theme/theme-choice.ts
reviewed (prior audit): labs/angular/projects/material-lab/src/app/m36/exercise-2-select/a/select-a.ts
reviewed (prior audit): labs/angular/projects/material-lab/src/app/m36/exercise-2-select/a/select-option.ts
reviewed (prior audit): labs/angular/projects/material-lab/src/app/m36/exercise-2-select/b/select-b.ts
reviewed (prior audit): labs/angular/projects/material-lab/src/app/m36/exercise-2-select/countries.ts
reviewed (prior audit): labs/angular/projects/material-lab/src/app/m36/exercise-3-kanban/a/board-a.ts
reviewed (prior audit): labs/angular/projects/material-lab/src/app/m36/exercise-3-kanban/b/board-b.ts
reviewed (prior audit): labs/angular/projects/material-lab/src/app/m36/exercise-3-kanban/board-store.ts
reviewed (prior audit): labs/angular/projects/material-lab/src/app/m36/exercise-3-kanban/card.ts
reviewed (prior audit): labs/angular/projects/material-lab/src/app/m36/internals/internals.ts
reviewed (prior audit): labs/angular/projects/material-lab/src/app/m36/layers/layers.ts
reviewed (prior audit): labs/angular/projects/material-lab/src/app/m36/material-app-motion/material-app-motion.ts
reviewed (prior audit): labs/angular/projects/material-lab/src/app/m36/material-app/material-app.ts
reviewed (prior audit): labs/angular/projects/material-lab/src/app/m36/outputs/q36-06.ts
reviewed (prior audit): labs/angular/projects/material-lab/src/app/m36/outputs/q36-10.ts
reviewed (prior audit): labs/angular/projects/material-lab/src/app/m36/outputs/q36-12.ts
reviewed (prior audit): labs/angular/projects/material-lab/src/app/m36/outputs/q36-15.ts
reviewed (prior audit): labs/angular/projects/material-lab/src/app/m36/overlay/overlay.ts
reviewed (prior audit): labs/angular/projects/material-lab/src/app/m36/overrides/overrides.ts
reviewed (prior audit): labs/angular/projects/material-lab/src/app/m36/primitives/primitives.ts
reviewed (prior audit): labs/angular/projects/material-lab/src/app/m36/theme/theme.ts
reviewed (prior audit): labs/angular/projects/material-lab/src/index.html
reviewed (prior audit): labs/angular/projects/material-lab/src/main.ts
reviewed (prior audit): labs/angular/projects/material-lab/src/styles.scss
reviewed (prior audit): labs/angular/projects/material-lab/tsconfig.app.json
reviewed (prior audit): labs/angular/projects/material-lab/tsconfig.spec.json
reviewed (prior audit): labs/angular/projects/security-lab/public/favicon.ico
reviewed (prior audit): labs/angular/projects/security-lab/src/app/app.config.ts
reviewed (prior audit): labs/angular/projects/security-lab/src/app/app.routes.ts
reviewed (prior audit): labs/angular/projects/security-lab/src/app/app.ts
reviewed (prior audit): labs/angular/projects/security-lab/src/app/home/home.ts
reviewed (prior audit): labs/angular/projects/security-lab/src/app/m33/csp/csp-page.ts
reviewed (prior audit): labs/angular/projects/security-lab/src/app/m33/csrf/bank-page.ts
reviewed (prior audit): labs/angular/projects/security-lab/src/app/m33/exercise-2-locked-page/bound-widget.ts
reviewed (prior audit): labs/angular/projects/security-lab/src/app/m33/exercise-2-locked-page/ex2-routes.ts
reviewed (prior audit): labs/angular/projects/security-lab/src/app/m33/exercise-2-locked-page/legacy-widget.ts
reviewed (prior audit): labs/angular/projects/security-lab/src/app/m33/exercise-2-locked-page/locked-page.ts
reviewed (prior audit): labs/angular/projects/security-lab/src/app/m33/exercise-2-locked-page/policy-widget.ts
reviewed (prior audit): labs/angular/projects/security-lab/src/app/m33/exercise-2-locked-page/widget-policy.ts
reviewed (prior audit): labs/angular/projects/security-lab/src/app/m33/exercise-3-csrf/ex3-routes.ts
reviewed (prior audit): labs/angular/projects/security-lab/src/app/m33/exercise-3-csrf/transfer-page.ts
reviewed (prior audit): labs/angular/projects/security-lab/src/app/m33/exercise-4-token-storage/auth-store.ts
reviewed (prior audit): labs/angular/projects/security-lab/src/app/m33/exercise-4-token-storage/bearer-interceptor.ts
reviewed (prior audit): labs/angular/projects/security-lab/src/app/m33/exercise-4-token-storage/data-page.ts
reviewed (prior audit): labs/angular/projects/security-lab/src/app/m33/exercise-4-token-storage/ex4-routes.ts
reviewed (prior audit): labs/angular/projects/security-lab/src/app/m33/guards/admin-page.ts
reviewed (prior audit): labs/angular/projects/security-lab/src/app/m33/guards/fallback-page.ts
reviewed (prior audit): labs/angular/projects/security-lab/src/app/m33/guards/guards-routes.ts
reviewed (prior audit): labs/angular/projects/security-lab/src/app/m33/guards/home-page.ts
reviewed (prior audit): labs/angular/projects/security-lab/src/app/m33/guards/is-admin.ts
reviewed (prior audit): labs/angular/projects/security-lab/src/app/m33/guards/session.ts
reviewed (prior audit): labs/angular/projects/security-lab/src/app/m33/sanitize/sanitize-page.ts
reviewed (prior audit): labs/angular/projects/security-lab/src/app/m33/threat/order-page.ts
reviewed (prior audit): labs/angular/projects/security-lab/src/app/m33/tokens/token-store.ts
reviewed (prior audit): labs/angular/projects/security-lab/src/app/m33/tokens/tokens-page.ts
reviewed (prior audit): labs/angular/projects/security-lab/src/app/m33/tokens/tokens-routes.ts
reviewed (prior audit): labs/angular/projects/security-lab/src/app/m33/tt/tt-bypass-page.ts
reviewed (prior audit): labs/angular/projects/security-lab/src/app/m33/tt/tt-lazy-page.ts
reviewed (prior audit): labs/angular/projects/security-lab/src/app/m33/tt/tt-page.ts
reviewed (prior audit): labs/angular/projects/security-lab/src/app/m33/tt/tt-routes.ts
reviewed (prior audit): labs/angular/projects/security-lab/src/app/m33/xss/sinks-page.ts
reviewed (prior audit): labs/angular/projects/security-lab/src/index.html
reviewed (prior audit): labs/angular/projects/security-lab/src/main.ts
reviewed (prior audit): labs/angular/projects/security-lab/src/styles.css
reviewed (prior audit): labs/angular/projects/security-lab/tsconfig.app.json
reviewed (prior audit): labs/angular/projects/security-lab/tsconfig.spec.json
reviewed (prior audit): labs/angular/projects/ssr-lab/generated/app.config.server.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/generated/app.config.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/generated/app.routes.server.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/generated/server.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/public/favicon.ico
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/app.config.server.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/app.config.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/app.routes.server.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/app.routes.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/app.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/home/home.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/data-uncached/uncached-page.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/data-uncached/uncached-routes.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/data/data-routes.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/data/me-page.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/data/product.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/data/products-page.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/data/stable.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/data/state-page.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/exercise-1-catalog-routes/account-page.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/exercise-1-catalog-routes/catalog-routes.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/exercise-1-catalog-routes/catalog.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/exercise-1-catalog-routes/known-product.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/exercise-1-catalog-routes/not-found.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/exercise-1-catalog-routes/product-page.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/exercise-1-catalog-routes/resolved-product-page.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/exercise-2-safe-widget/broken-page.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/exercise-2-safe-widget/recent-items.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/exercise-2-safe-widget/recent-list.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/exercise-2-safe-widget/recent-store.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/exercise-2-safe-widget/safe-widget-routes.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/exercise-2-safe-widget/stored-recent-items.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/exercise-2-safe-widget/viewport-badge.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/exercise-3-fetch-once/fetch-once-routes.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/exercise-3-fetch-once/other-page.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/exercise-3-fetch-once/products-page.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/exercise-3-fetch-once/resource-products-page.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/exercise-3-fetch-once/server-stamp.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/exercise-3-fetch-once/signed-in.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/exercise-4-incremental-product/incremental-product-routes.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/exercise-4-incremental-product/nested-product-detail.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/exercise-4-incremental-product/product-detail.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/exercise-4-incremental-product/recommendations.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/exercise-4-incremental-product/reviews.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/exercise-4-incremental-product/site-footer.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/exercise-4-incremental-product/start-page.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/fallbacks/product-page.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/hydration/branch-swap-page.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/hydration/dom-append-page.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/hydration/invalid-nesting-page.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/hydration/plain-page.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/hydration/skip-page.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/incremental/gallery.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/incremental/product-page.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/incremental/related.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/incremental/reviews.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/incremental/site-footer.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/incremental/zoom.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/platform/after-render-page.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/platform/language-page.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/platform/not-found-page.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/platform/pending-page.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/platform/window-crash-page.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/replay/cart-page.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/routes/product-page.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/routes/route-page.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/setup/deep-link-page.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m32/why/product-page.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m33/ssr/echo-page.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/app/m33/ssr/state-page.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/index.html
reviewed (prior audit): labs/angular/projects/ssr-lab/src/main.server.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/main.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/server.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/server/api.ts
reviewed (prior audit): labs/angular/projects/ssr-lab/src/styles.css
reviewed (prior audit): labs/angular/projects/ssr-lab/tsconfig.app.json
reviewed (prior audit): labs/angular/projects/ssr-lab/tsconfig.spec.json
reviewed (prior audit): labs/angular/projects/ui-lib/README.md
reviewed (prior audit): labs/angular/projects/ui-lib/ex2-a/ng-package.json
reviewed (prior audit): labs/angular/projects/ui-lib/ex2-a/src/internal/format-status.ts
reviewed (prior audit): labs/angular/projects/ui-lib/ex2-a/src/internal/status-config.ts
reviewed (prior audit): labs/angular/projects/ui-lib/ex2-a/src/provide-status.ts
reviewed (prior audit): labs/angular/projects/ui-lib/ex2-a/src/public-api.ts
reviewed (prior audit): labs/angular/projects/ui-lib/ex2-a/src/status-pill.ts
reviewed (prior audit): labs/angular/projects/ui-lib/ex2-b/ng-package.json
reviewed (prior audit): labs/angular/projects/ui-lib/ex2-b/src/api/index.ts
reviewed (prior audit): labs/angular/projects/ui-lib/ex2-b/src/api/provide-status.ts
reviewed (prior audit): labs/angular/projects/ui-lib/ex2-b/src/api/status-pill.ts
reviewed (prior audit): labs/angular/projects/ui-lib/ex2-b/src/internal/format-status.ts
reviewed (prior audit): labs/angular/projects/ui-lib/ex2-b/src/internal/status-config.ts
reviewed (prior audit): labs/angular/projects/ui-lib/ex2-b/src/public-api.ts
reviewed (prior audit): labs/angular/projects/ui-lib/ng-package.json
reviewed (prior audit): labs/angular/projects/ui-lib/package.json
reviewed (prior audit): labs/angular/projects/ui-lib/src/lib/badge/badge.ts
reviewed (prior audit): labs/angular/projects/ui-lib/src/lib/internal/badge-dot.ts
reviewed (prior audit): labs/angular/projects/ui-lib/src/lib/internal/format-count.ts
reviewed (prior audit): labs/angular/projects/ui-lib/src/public-api.ts
reviewed (prior audit): labs/angular/projects/ui-lib/testing/ng-package.json
reviewed (prior audit): labs/angular/projects/ui-lib/testing/src/public-api.ts
reviewed (prior audit): labs/angular/projects/ui-lib/tsconfig.lib.json
reviewed (prior audit): labs/angular/projects/ui-lib/tsconfig.lib.prod.json
reviewed (prior audit): labs/angular/projects/ui-lib/tsconfig.spec.json
reviewed (prior audit): labs/angular/public/favicon.ico
reviewed (prior audit): labs/angular/public/m31/hero.svg
reviewed (prior audit): labs/angular/src/app/app.config.ts
reviewed (prior audit): labs/angular/src/app/app.html
reviewed (prior audit): labs/angular/src/app/app.routes.ts
reviewed (prior audit): labs/angular/src/app/app.spec.ts
reviewed (prior audit): labs/angular/src/app/app.ts
reviewed (prior audit): labs/angular/src/app/modules/07-ts-advanced-types-and-decorators/decorators.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/07-ts-advanced-types-and-decorators/settings-defaults.ts
reviewed (prior audit): labs/angular/src/app/modules/07-ts-advanced-types-and-decorators/settings-form.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/07-ts-advanced-types-and-decorators/settings-form.ts
reviewed (prior audit): labs/angular/src/app/modules/07-ts-advanced-types-and-decorators/typing-patterns.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/12-angular-how-it-works/concepts/counter.ts
reviewed (prior audit): labs/angular/src/app/modules/12-angular-how-it-works/concepts/section-5-devtools.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/12-angular-how-it-works/concepts/section-6-bootstrap.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/12-angular-how-it-works/concepts/section-7-jit.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/12-angular-how-it-works/concepts/section-8-definitions.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/12-angular-how-it-works/exercise-1-component-catalog/component-catalog.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/12-angular-how-it-works/exercise-1-component-catalog/component-catalog.ts
reviewed (prior audit): labs/angular/src/app/modules/12-angular-how-it-works/exercise-2-startup-config/startup-config.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/12-angular-how-it-works/exercise-2-startup-config/startup-config.ts
reviewed (prior audit): labs/angular/src/app/modules/12-angular-how-it-works/outputs/q12-outputs.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/13-components-and-templates/concepts/host-demo.ts
reviewed (prior audit): labs/angular/src/app/modules/13-components-and-templates/concepts/reference-demo.ts
reviewed (prior audit): labs/angular/src/app/modules/13-components-and-templates/concepts/section-1-anatomy.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/13-components-and-templates/concepts/section-2-expressions.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/13-components-and-templates/concepts/section-3-null-safety.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/13-components-and-templates/concepts/section-4-bindings.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/13-components-and-templates/concepts/section-5-events.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/13-components-and-templates/concepts/section-6-references.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/13-components-and-templates/concepts/section-7-host.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/13-components-and-templates/concepts/section-8-styling.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/13-components-and-templates/concepts/section-9-encapsulation.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/13-components-and-templates/concepts/styled-card.css
reviewed (prior audit): labs/angular/src/app/modules/13-components-and-templates/concepts/styled-card.html
reviewed (prior audit): labs/angular/src/app/modules/13-components-and-templates/concepts/styled-card.ts
reviewed (prior audit): labs/angular/src/app/modules/13-components-and-templates/concepts/two-way-pair.ts
reviewed (prior audit): labs/angular/src/app/modules/13-components-and-templates/exercise-1-status-badge/status-badge.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/13-components-and-templates/exercise-1-status-badge/status-badge.ts
reviewed (prior audit): labs/angular/src/app/modules/13-components-and-templates/exercise-2-toggle-switch/toggle-switch.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/13-components-and-templates/exercise-2-toggle-switch/toggle-switch.ts
reviewed (prior audit): labs/angular/src/app/modules/13-components-and-templates/exercise-3-encapsulation-inspector/encapsulation-inspector.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/13-components-and-templates/exercise-3-encapsulation-inspector/encapsulation-inspector.ts
reviewed (prior audit): labs/angular/src/app/modules/13-components-and-templates/outputs/q13-outputs.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/14-directives-and-pipes/concepts/menu-demo.ts
reviewed (prior audit): labs/angular/src/app/modules/14-directives-and-pipes/concepts/repeat-demo.ts
reviewed (prior audit): labs/angular/src/app/modules/14-directives-and-pipes/concepts/section-1-attribute-directives.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/14-directives-and-pipes/concepts/section-2-structural-directives.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/14-directives-and-pipes/concepts/section-3-host-directives.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/14-directives-and-pipes/concepts/section-4-builtin-directives.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/14-directives-and-pipes/concepts/section-5-pipes.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/14-directives-and-pipes/concepts/section-6-builtin-pipes.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/14-directives-and-pipes/concepts/section-7-pipe-computed-method.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/14-directives-and-pipes/concepts/section-8-async-pipe.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/14-directives-and-pipes/exercise-1-busy-directive/busy.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/14-directives-and-pipes/exercise-1-busy-directive/busy.ts
reviewed (prior audit): labs/angular/src/app/modules/14-directives-and-pipes/exercise-2-allowed-directive/allowed.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/14-directives-and-pipes/exercise-2-allowed-directive/allowed.ts
reviewed (prior audit): labs/angular/src/app/modules/14-directives-and-pipes/exercise-3-menu-button/menu-button.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/14-directives-and-pipes/exercise-3-menu-button/menu-button.ts
reviewed (prior audit): labs/angular/src/app/modules/14-directives-and-pipes/exercise-4-search-pipe/search.pipe.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/14-directives-and-pipes/exercise-4-search-pipe/search.pipe.ts
reviewed (prior audit): labs/angular/src/app/modules/14-directives-and-pipes/outputs/q14-outputs.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/concepts/lazy/admin-page.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/concepts/lazy/admin.routes.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/concepts/lazy/legacy-admin.module.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/concepts/migrated/app/admin/admin-page.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/concepts/migrated/app/admin/admin.module.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/concepts/migrated/app/app-routing.module.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/concepts/migrated/app/app.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/concepts/migrated/app/greeter.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/concepts/migrated/app/hello.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/concepts/migrated/app/shared/badge.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/concepts/migrated/app/shared/short-pipe.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/concepts/migrated/main.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/concepts/section-1-what-ngmodules-did.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/concepts/section-2-standalone-imports.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/concepts/section-3-bootstrap-and-providers.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/concepts/section-4-lazy-loading.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/concepts/section-5-legacy-patterns.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/concepts/section-6-interop.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/concepts/section-7-migration.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/concepts/section-8-under-the-hood.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/exercise-1-convert-feature/convert-feature.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/exercise-1-convert-feature/legacy/task-item.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/exercise-1-convert-feature/legacy/task-list.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/exercise-1-convert-feature/legacy/tasks.module.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/exercise-1-convert-feature/task-item.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/exercise-1-convert-feature/task-list.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/exercise-1-convert-feature/task-store.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/exercise-1-convert-feature/tasks.routes.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/exercise-2-dual-library/greeting.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/exercise-2-dual-library/greeting.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/exercise-3-lazy-feature/admin-shell.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/exercise-3-lazy-feature/admin-store.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/exercise-3-lazy-feature/admin.routes.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/exercise-3-lazy-feature/lazy-feature.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/exercise-3-lazy-feature/legacy/legacy-admin.module.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/exercise-3-lazy-feature/settings-page.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/exercise-3-lazy-feature/user-list.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/legacy/boot/boot-root.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/legacy/boot/boot.module.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/legacy/boot/reports.module.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/legacy/catalog/catalog-list.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/legacy/catalog/catalog.module.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/legacy/catalog/price-pipe.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/legacy/migration-sample/app/admin/admin-page.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/legacy/migration-sample/app/admin/admin.module.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/legacy/migration-sample/app/app-routing.module.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/legacy/migration-sample/app/app.module.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/legacy/migration-sample/app/app.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/legacy/migration-sample/app/greeter.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/legacy/migration-sample/app/hello.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/legacy/migration-sample/app/shared/badge.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/legacy/migration-sample/app/shared/shared.module.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/legacy/migration-sample/app/shared/short-pipe.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/legacy/migration-sample/main.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/legacy/shared/api.module.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/legacy/shared/core.module.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/legacy/shared/shared.module.ts
reviewed (prior audit): labs/angular/src/app/modules/15-standalone-and-ngmodules/outputs/q15-outputs.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/16-dependency-injection/concepts/section-1-why-di.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/16-dependency-injection/concepts/section-2-providers.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/16-dependency-injection/concepts/section-3-provided-in-and-service.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/16-dependency-injection/concepts/section-4-injection-context.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/16-dependency-injection/concepts/section-5-injector-tree.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/16-dependency-injection/concepts/section-6-providers-and-view-providers.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/16-dependency-injection/concepts/section-7-tokens-and-multi.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/16-dependency-injection/concepts/section-8-lifetime-and-injectors.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/16-dependency-injection/concepts/section-9-patterns-and-testing.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/16-dependency-injection/concepts/service-demo.ts
reviewed (prior audit): labs/angular/src/app/modules/16-dependency-injection/exercise-1-storage-service/storage.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/16-dependency-injection/exercise-1-storage-service/storage.ts
reviewed (prior audit): labs/angular/src/app/modules/16-dependency-injection/exercise-2-inject-helper/inject-feature-flag.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/16-dependency-injection/exercise-2-inject-helper/inject-feature-flag.ts
reviewed (prior audit): labs/angular/src/app/modules/16-dependency-injection/exercise-3-field-state/field-state.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/16-dependency-injection/exercise-3-field-state/field-state.ts
reviewed (prior audit): labs/angular/src/app/modules/16-dependency-injection/exercise-4-provide-billing/billing.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/16-dependency-injection/exercise-4-provide-billing/billing.ts
reviewed (prior audit): labs/angular/src/app/modules/16-dependency-injection/exercise-5-feature-injector/feature-injector.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/16-dependency-injection/exercise-5-feature-injector/feature-injector.ts
reviewed (prior audit): labs/angular/src/app/modules/16-dependency-injection/outputs/q16-outputs.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/17-signals/concepts/responsive-grid.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/17-signals/concepts/responsive-grid.ts
reviewed (prior audit): labs/angular/src/app/modules/17-signals/exercise-1-cart-store/cart-store.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/17-signals/exercise-1-cart-store/cart-store.ts
reviewed (prior audit): labs/angular/src/app/modules/17-signals/exercise-2-linked-selection/option-picker.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/17-signals/exercise-2-linked-selection/option-picker.ts
reviewed (prior audit): labs/angular/src/app/modules/17-signals/exercise-3-persisted-preferences/preferences-store.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/17-signals/exercise-3-persisted-preferences/preferences-store.ts
reviewed (prior audit): labs/angular/src/app/modules/17-signals/exercise-4-star-rating/star-rating.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/17-signals/exercise-4-star-rating/star-rating.ts
reviewed (prior audit): labs/angular/src/app/modules/17-signals/exercise-5-user-search/user-search.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/17-signals/exercise-5-user-search/user-search.ts
reviewed (prior audit): labs/angular/src/app/modules/17-signals/outputs/q17-outputs.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/concepts/fixtures/lab-m18-failing.ts
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/concepts/fixtures/lab-m18-quick.ts
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/concepts/fixtures/lab-m18-side-effect.ts
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/concepts/fixtures/lab-m18-slow.ts
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/concepts/migrated/migrated-orders.html
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/concepts/migrated/migrated-orders.ts
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/concepts/migrated/migrated-row.ts
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/concepts/migrated/migrated-rows.html
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/concepts/migrated/migrated-rows.ts
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/concepts/section-1-if-family.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/concepts/section-2-for.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/concepts/section-3-switch.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/concepts/section-4-let.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/concepts/section-5-defer-states.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/concepts/section-6-triggers.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/concepts/section-7-chunks-and-tests.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/concepts/section-8-migration.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/concepts/section-9-under-the-hood.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/exercise-1-convert-order-list/convert-order-list.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/exercise-1-convert-order-list/legacy/legacy-order-list.ts
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/exercise-1-convert-order-list/order-list.html
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/exercise-1-convert-order-list/order-list.ts
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/exercise-1-convert-order-list/order.ts
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/exercise-2-sortable-list/row.ts
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/exercise-2-sortable-list/sortable-list.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/exercise-2-sortable-list/sortable-list.ts
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/exercise-3-lazy-panel/fixtures/lab-m18-failing-panel.ts
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/exercise-3-lazy-panel/fixtures/lab-m18-panel.ts
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/exercise-3-lazy-panel/fixtures/lab-m18-slow-panel.ts
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/exercise-3-lazy-panel/lazy-panel-host.ts
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/exercise-3-lazy-panel/lazy-panel.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/legacy/migration-sample/legacy-orders.html
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/legacy/migration-sample/legacy-orders.ts
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/legacy/migration-sample/legacy-row.ts
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/legacy/migration-sample/legacy-rows.html
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/legacy/migration-sample/legacy-rows.ts
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/outputs/fixtures/lab-m18-load-120.ts
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/outputs/fixtures/lab-m18-load-20.ts
reviewed (prior audit): labs/angular/src/app/modules/18-control-flow-and-defer/outputs/q18-outputs.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/19-component-communication-and-projection/concepts/section-1-inputs-outputs.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/19-component-communication-and-projection/concepts/section-2-shared-state.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/19-component-communication-and-projection/concepts/section-3-projection.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/19-component-communication-and-projection/concepts/section-4-templates.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/19-component-communication-and-projection/concepts/section-5-queries.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/19-component-communication-and-projection/concepts/section-6-decorators-and-migration.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/19-component-communication-and-projection/concepts/section-7-dynamic-components.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/19-component-communication-and-projection/concepts/section-8-under-the-hood.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/19-component-communication-and-projection/exercise-1-signal-migration/legacy/legacy-rating.ts
reviewed (prior audit): labs/angular/src/app/modules/19-component-communication-and-projection/exercise-1-signal-migration/rating-host.ts
reviewed (prior audit): labs/angular/src/app/modules/19-component-communication-and-projection/exercise-1-signal-migration/rating.ts
reviewed (prior audit): labs/angular/src/app/modules/19-component-communication-and-projection/exercise-1-signal-migration/signal-migration.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/19-component-communication-and-projection/exercise-2-lazy-panel/lazy-panel.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/19-component-communication-and-projection/exercise-2-lazy-panel/panel-body.ts
reviewed (prior audit): labs/angular/src/app/modules/19-component-communication-and-projection/exercise-2-lazy-panel/panel-host.ts
reviewed (prior audit): labs/angular/src/app/modules/19-component-communication-and-projection/exercise-2-lazy-panel/panel.ts
reviewed (prior audit): labs/angular/src/app/modules/19-component-communication-and-projection/exercise-3-data-table/column.ts
reviewed (prior audit): labs/angular/src/app/modules/19-component-communication-and-projection/exercise-3-data-table/data-table-host.ts
reviewed (prior audit): labs/angular/src/app/modules/19-component-communication-and-projection/exercise-3-data-table/data-table.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/19-component-communication-and-projection/exercise-3-data-table/data-table.ts
reviewed (prior audit): labs/angular/src/app/modules/19-component-communication-and-projection/exercise-4-tabs/tab.ts
reviewed (prior audit): labs/angular/src/app/modules/19-component-communication-and-projection/exercise-4-tabs/tabs-host.ts
reviewed (prior audit): labs/angular/src/app/modules/19-component-communication-and-projection/exercise-4-tabs/tabs.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/19-component-communication-and-projection/exercise-4-tabs/tabs.ts
reviewed (prior audit): labs/angular/src/app/modules/19-component-communication-and-projection/exercise-5-toasts/toast-service.ts
reviewed (prior audit): labs/angular/src/app/modules/19-component-communication-and-projection/exercise-5-toasts/toast.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/19-component-communication-and-projection/exercise-5-toasts/toast.ts
reviewed (prior audit): labs/angular/src/app/modules/19-component-communication-and-projection/legacy/migration-sample/decorator-behaviors.ts
reviewed (prior audit): labs/angular/src/app/modules/19-component-communication-and-projection/legacy/migration-sample/legacy-widget-host.ts
reviewed (prior audit): labs/angular/src/app/modules/19-component-communication-and-projection/legacy/migration-sample/legacy-widget.ts
reviewed (prior audit): labs/angular/src/app/modules/19-component-communication-and-projection/migrated/migrated-widget-host.ts
reviewed (prior audit): labs/angular/src/app/modules/19-component-communication-and-projection/migrated/migrated-widget.ts
reviewed (prior audit): labs/angular/src/app/modules/19-component-communication-and-projection/outputs/q19-outputs.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/20-lifecycle-and-render-hooks/concepts/section-1-lifecycle-map.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/20-lifecycle-and-render-hooks/concepts/section-2-constructor-and-init.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/20-lifecycle-and-render-hooks/concepts/section-3-hooks-and-signals.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/20-lifecycle-and-render-hooks/concepts/section-4-render-hooks.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/20-lifecycle-and-render-hooks/concepts/section-5-teardown.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/20-lifecycle-and-render-hooks/concepts/section-6-expression-changed.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/20-lifecycle-and-render-hooks/concepts/section-7-under-the-hood.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/20-lifecycle-and-render-hooks/exercise-1-hook-tracer/hook-log.ts
reviewed (prior audit): labs/angular/src/app/modules/20-lifecycle-and-render-hooks/exercise-1-hook-tracer/hook-tracer.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/20-lifecycle-and-render-hooks/exercise-1-hook-tracer/traced-node.ts
reviewed (prior audit): labs/angular/src/app/modules/20-lifecycle-and-render-hooks/exercise-1-hook-tracer/tracer-host.ts
reviewed (prior audit): labs/angular/src/app/modules/20-lifecycle-and-render-hooks/exercise-2-dashboard/dashboard-host.ts
reviewed (prior audit): labs/angular/src/app/modules/20-lifecycle-and-render-hooks/exercise-2-dashboard/dashboard.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/20-lifecycle-and-render-hooks/exercise-2-dashboard/dashboard.ts
reviewed (prior audit): labs/angular/src/app/modules/20-lifecycle-and-render-hooks/exercise-2-dashboard/legacy/broken-dashboard.ts
reviewed (prior audit): labs/angular/src/app/modules/20-lifecycle-and-render-hooks/exercise-2-dashboard/title-slot.ts
reviewed (prior audit): labs/angular/src/app/modules/20-lifecycle-and-render-hooks/exercise-3-widget/chart-host.ts
reviewed (prior audit): labs/angular/src/app/modules/20-lifecycle-and-render-hooks/exercise-3-widget/chart.ts
reviewed (prior audit): labs/angular/src/app/modules/20-lifecycle-and-render-hooks/exercise-3-widget/fake-chart.ts
reviewed (prior audit): labs/angular/src/app/modules/20-lifecycle-and-render-hooks/exercise-3-widget/widget.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/20-lifecycle-and-render-hooks/exercise-4-ticker/inject-interval.ts
reviewed (prior audit): labs/angular/src/app/modules/20-lifecycle-and-render-hooks/exercise-4-ticker/legacy/leaky-ticker.ts
reviewed (prior audit): labs/angular/src/app/modules/20-lifecycle-and-render-hooks/exercise-4-ticker/live-ticker.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/20-lifecycle-and-render-hooks/exercise-4-ticker/live-ticker.ts
reviewed (prior audit): labs/angular/src/app/modules/20-lifecycle-and-render-hooks/exercise-4-ticker/quote-source.ts
reviewed (prior audit): labs/angular/src/app/modules/20-lifecycle-and-render-hooks/exercise-4-ticker/ticker-host.ts
reviewed (prior audit): labs/angular/src/app/modules/20-lifecycle-and-render-hooks/legacy/destroy-subject/legacy-destroy-subject.ts
reviewed (prior audit): labs/angular/src/app/modules/20-lifecycle-and-render-hooks/outputs/q20-outputs.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/21-change-detection/concepts/section-1-synchronization-problem.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/21-change-detection/concepts/section-2-strategies-and-marks.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/21-change-detection/concepts/section-3-zone.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/21-change-detection/concepts/section-4-tree-walk.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/21-change-detection/concepts/section-5-zoneless.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/21-change-detection/concepts/section-6-migration.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/21-change-detection/concepts/section-7-change-detector-ref.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/21-change-detection/concepts/section-8-debugging.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/21-change-detection/concepts/section-9-under-the-hood.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/21-change-detection/exercise-1-render-meter/meter-node.ts
reviewed (prior audit): labs/angular/src/app/modules/21-change-detection/exercise-1-render-meter/meter-tree.ts
reviewed (prior audit): labs/angular/src/app/modules/21-change-detection/exercise-1-render-meter/render-meter.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/21-change-detection/exercise-1-render-meter/render-meter.ts
reviewed (prior audit): labs/angular/src/app/modules/21-change-detection/exercise-2-ticket-board/board-host.ts
reviewed (prior audit): labs/angular/src/app/modules/21-change-detection/exercise-2-ticket-board/legacy/stale-board.ts
reviewed (prior audit): labs/angular/src/app/modules/21-change-detection/exercise-2-ticket-board/ticket-board.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/21-change-detection/exercise-2-ticket-board/ticket-board.ts
reviewed (prior audit): labs/angular/src/app/modules/21-change-detection/exercise-2-ticket-board/ticket-source.ts
reviewed (prior audit): labs/angular/src/app/modules/21-change-detection/exercise-3-quiet-feed/legacy/noisy-ticker.ts
reviewed (prior audit): labs/angular/src/app/modules/21-change-detection/exercise-3-quiet-feed/price-feed.ts
reviewed (prior audit): labs/angular/src/app/modules/21-change-detection/exercise-3-quiet-feed/quiet-feed-zoneless.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/21-change-detection/exercise-3-quiet-feed/quiet-feed.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/21-change-detection/exercise-3-quiet-feed/quiet-ticker.ts
reviewed (prior audit): labs/angular/src/app/modules/21-change-detection/exercise-3-quiet-feed/ticker-host.ts
reviewed (prior audit): labs/angular/src/app/modules/21-change-detection/exercise-4-stable-loader/loader-host.ts
reviewed (prior audit): labs/angular/src/app/modules/21-change-detection/exercise-4-stable-loader/slow-source.ts
reviewed (prior audit): labs/angular/src/app/modules/21-change-detection/exercise-4-stable-loader/stable-loader.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/21-change-detection/exercise-4-stable-loader/stable-loader.ts
reviewed (prior audit): labs/angular/src/app/modules/21-change-detection/exercise-5-freeze-panel/freeze-when-hidden.ts
reviewed (prior audit): labs/angular/src/app/modules/21-change-detection/exercise-5-freeze-panel/freeze.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/21-change-detection/exercise-5-freeze-panel/live-panel.ts
reviewed (prior audit): labs/angular/src/app/modules/21-change-detection/exercise-5-freeze-panel/panel-host.ts
reviewed (prior audit): labs/angular/src/app/modules/21-change-detection/legacy/zone-era-board/zone-era-board.ts
reviewed (prior audit): labs/angular/src/app/modules/21-change-detection/outputs/q21-outputs.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/21-change-detection/outputs/q21-zone-outputs.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/22-rxjs-foundations/concepts/section-1-push-collections.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/22-rxjs-foundations/concepts/section-2-anatomy.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/22-rxjs-foundations/concepts/section-3-cold-hot.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/22-rxjs-foundations/concepts/section-4-subjects.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/22-rxjs-foundations/concepts/section-5-operators.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/22-rxjs-foundations/concepts/section-6-catalogue.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/22-rxjs-foundations/concepts/section-7-combination.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/22-rxjs-foundations/concepts/section-8-timing.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/22-rxjs-foundations/concepts/section-9-under-the-hood.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/22-rxjs-foundations/concepts/support/timeline.ts
reviewed (prior audit): labs/angular/src/app/modules/22-rxjs-foundations/exercise-1-mini-observable/conformance.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/22-rxjs-foundations/exercise-1-mini-observable/mini-observable.ts
reviewed (prior audit): labs/angular/src/app/modules/22-rxjs-foundations/exercise-2-cart-events/cart-events.ts
reviewed (prior audit): labs/angular/src/app/modules/22-rxjs-foundations/exercise-2-cart-events/cart-state.ts
reviewed (prior audit): labs/angular/src/app/modules/22-rxjs-foundations/exercise-2-cart-events/cart-store.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/22-rxjs-foundations/exercise-2-cart-events/legacy/event-bus.ts
reviewed (prior audit): labs/angular/src/app/modules/22-rxjs-foundations/exercise-3-custom-operators/custom-operators.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/22-rxjs-foundations/exercise-3-custom-operators/operators.ts
reviewed (prior audit): labs/angular/src/app/modules/22-rxjs-foundations/exercise-3-custom-operators/probe-source.ts
reviewed (prior audit): labs/angular/src/app/modules/22-rxjs-foundations/exercise-4-timing/timing-pipelines.ts
reviewed (prior audit): labs/angular/src/app/modules/22-rxjs-foundations/exercise-4-timing/timing.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/22-rxjs-foundations/exercise-5-dashboard-feed/dashboard-feed.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/22-rxjs-foundations/exercise-5-dashboard-feed/dashboard-feed.ts
reviewed (prior audit): labs/angular/src/app/modules/22-rxjs-foundations/exercise-5-dashboard-feed/fake-sources.ts
reviewed (prior audit): labs/angular/src/app/modules/22-rxjs-foundations/legacy/deprecated-forms.ts
reviewed (prior audit): labs/angular/src/app/modules/22-rxjs-foundations/outputs/q22-outputs.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/23-rxjs-in-depth/concepts/section-1-flattening.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/23-rxjs-in-depth/concepts/section-10-testing.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/23-rxjs-in-depth/concepts/section-2-choosing.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/23-rxjs-in-depth/concepts/section-3-errors.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/23-rxjs-in-depth/concepts/section-4-retry.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/23-rxjs-in-depth/concepts/section-5-multicasting.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/23-rxjs-in-depth/concepts/section-6-unsubscription.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/23-rxjs-in-depth/concepts/section-7-signals-interop.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/23-rxjs-in-depth/concepts/section-8-patterns.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/23-rxjs-in-depth/concepts/section-9-schedulers.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/23-rxjs-in-depth/exercise-1-flattening-choice/flows.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/23-rxjs-in-depth/exercise-1-flattening-choice/flows.ts
reviewed (prior audit): labs/angular/src/app/modules/23-rxjs-in-depth/exercise-2-resilient-loader/resilient-loader.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/23-rxjs-in-depth/exercise-2-resilient-loader/resilient-loader.ts
reviewed (prior audit): labs/angular/src/app/modules/23-rxjs-in-depth/exercise-3-cache-service/cache.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/23-rxjs-in-depth/exercise-3-cache-service/config-cache.ts
reviewed (prior audit): labs/angular/src/app/modules/23-rxjs-in-depth/exercise-3-cache-service/counting-source.ts
reviewed (prior audit): labs/angular/src/app/modules/23-rxjs-in-depth/exercise-3-cache-service/live-prices.ts
reviewed (prior audit): labs/angular/src/app/modules/23-rxjs-in-depth/exercise-4-leak-proof/leak.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/23-rxjs-in-depth/exercise-4-leak-proof/legacy/leaky-widget.ts
reviewed (prior audit): labs/angular/src/app/modules/23-rxjs-in-depth/exercise-4-leak-proof/widget.ts
reviewed (prior audit): labs/angular/src/app/modules/23-rxjs-in-depth/exercise-5-typeahead/search-api.ts
reviewed (prior audit): labs/angular/src/app/modules/23-rxjs-in-depth/exercise-5-typeahead/typeahead-pipeline.ts
reviewed (prior audit): labs/angular/src/app/modules/23-rxjs-in-depth/exercise-5-typeahead/typeahead-resource.ts
reviewed (prior audit): labs/angular/src/app/modules/23-rxjs-in-depth/exercise-5-typeahead/typeahead.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/23-rxjs-in-depth/exercise-6-polling-dashboard/dashboard.ts
reviewed (prior audit): labs/angular/src/app/modules/23-rxjs-in-depth/exercise-6-polling-dashboard/polling.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/23-rxjs-in-depth/exercise-6-polling-dashboard/status-poller.ts
reviewed (prior audit): labs/angular/src/app/modules/23-rxjs-in-depth/exercise-6-polling-dashboard/visibility.ts
reviewed (prior audit): labs/angular/src/app/modules/23-rxjs-in-depth/legacy/deprecated-forms.ts
reviewed (prior audit): labs/angular/src/app/modules/23-rxjs-in-depth/outputs/q23-outputs.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/concepts/section-1-configuration.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/concepts/section-10-platform.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/concepts/section-2-parameters.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/concepts/section-3-outlets.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/concepts/section-4-lazy-loading.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/concepts/section-5-guards.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/concepts/section-6-resolvers.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/concepts/section-7-lifecycle.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/concepts/section-8-preloading-and-reuse.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/concepts/section-9-transitions-scrolling-titles.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/exercise-1-shop-routes/pages.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/exercise-1-shop-routes/shop-routes.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/exercise-1-shop-routes/shop.routes.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/exercise-2-url-driven-product/links.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/exercise-2-url-driven-product/product-shell.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/exercise-2-url-driven-product/product-tab.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/exercise-2-url-driven-product/product.routes.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/exercise-2-url-driven-product/product.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/exercise-3-guards/app.routes.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/exercise-3-guards/editor.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/exercise-3-guards/guards.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/exercise-3-guards/guards.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/exercise-3-guards/legacy/class-guard.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/exercise-3-guards/pages.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/exercise-3-guards/session.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/exercise-4-product-loading/loading.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/exercise-4-product-loading/product-api.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/exercise-4-product-loading/product-page.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/exercise-4-product-loading/product.resolver.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/exercise-4-product-loading/product.routes.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/exercise-5-navigation-status/navigation-status.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/exercise-5-navigation-status/progress-bar.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/exercise-5-navigation-status/status.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/exercise-6-preload-and-reuse/app.routes.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/exercise-6-preload-and-reuse/connection.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/exercise-6-preload-and-reuse/flag-preloading.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/exercise-6-preload-and-reuse/keep-alive-reuse.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/exercise-6-preload-and-reuse/list-page.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/exercise-6-preload-and-reuse/preload-reuse.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/legacy/deprecated-forms.ts
reviewed (prior audit): labs/angular/src/app/modules/24-routing/outputs/q24-outputs.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/concepts/section-1-two-apis.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/concepts/section-10-control-value-accessor.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/concepts/section-2-model.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/concepts/section-3-typed-forms.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/concepts/section-4-template-driven.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/concepts/section-5-validators.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/concepts/section-6-async-validators.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/concepts/section-7-status-and-events.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/concepts/section-8-error-display.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/concepts/section-9-dynamic-forms.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/exercise-1-signup/signup-model.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/exercise-1-signup/signup-reactive.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/exercise-1-signup/signup-template.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/exercise-1-signup/signup.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/exercise-2-profile/date-range.validator.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/exercise-2-profile/profile-form.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/exercise-2-profile/profile.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/exercise-2-profile/profile.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/exercise-3-username/register-form.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/exercise-3-username/user-api.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/exercise-3-username/username-taken.validator.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/exercise-3-username/username.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/exercise-4-field-errors/checkout-form.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/exercise-4-field-errors/error-messages.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/exercise-4-field-errors/field-errors.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/exercise-4-field-errors/field-errors.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/exercise-4-field-errors/show-errors.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/exercise-5-dynamic-form/dynamic-form.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/exercise-5-dynamic-form/dynamic-form.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/exercise-5-dynamic-form/field-config.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/exercise-5-dynamic-form/field-registry.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/exercise-5-dynamic-form/form-builder.service.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/exercise-6-quantity-stepper/legacy/stepper-without-cva.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/exercise-6-quantity-stepper/order-form.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/exercise-6-quantity-stepper/order-template.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/exercise-6-quantity-stepper/quantity-stepper-split.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/exercise-6-quantity-stepper/quantity-stepper.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/exercise-6-quantity-stepper/stepper.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/legacy/legacy-apis.ts
reviewed (prior audit): labs/angular/src/app/modules/25-forms-reactive-and-template-driven/outputs/q25-outputs.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/26-signal-forms/concepts/section-1-why-signal-forms.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/26-signal-forms/concepts/section-2-field-tree.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/26-signal-forms/concepts/section-3-form-field.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/26-signal-forms/concepts/section-4-rules.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/26-signal-forms/concepts/section-5-cross-field.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/26-signal-forms/concepts/section-6-async.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/26-signal-forms/concepts/section-7-submission.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/26-signal-forms/concepts/section-8-custom-controls.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/26-signal-forms/concepts/section-9-interop.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/26-signal-forms/exercise-1-signup/signup-form.ts
reviewed (prior audit): labs/angular/src/app/modules/26-signal-forms/exercise-1-signup/signup-model.ts
reviewed (prior audit): labs/angular/src/app/modules/26-signal-forms/exercise-1-signup/signup.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/26-signal-forms/exercise-2-checkout/checkout-form.ts
reviewed (prior audit): labs/angular/src/app/modules/26-signal-forms/exercise-2-checkout/checkout-model.ts
reviewed (prior audit): labs/angular/src/app/modules/26-signal-forms/exercise-2-checkout/checkout-schema.ts
reviewed (prior audit): labs/angular/src/app/modules/26-signal-forms/exercise-2-checkout/checkout.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/26-signal-forms/exercise-3-username/username-api.ts
reviewed (prior audit): labs/angular/src/app/modules/26-signal-forms/exercise-3-username/username-form.ts
reviewed (prior audit): labs/angular/src/app/modules/26-signal-forms/exercise-3-username/username-schema.ts
reviewed (prior audit): labs/angular/src/app/modules/26-signal-forms/exercise-3-username/username.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/26-signal-forms/exercise-4-submission/register-api.ts
reviewed (prior audit): labs/angular/src/app/modules/26-signal-forms/exercise-4-submission/register-form.ts
reviewed (prior audit): labs/angular/src/app/modules/26-signal-forms/exercise-4-submission/register.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/26-signal-forms/exercise-5-rating/legacy-review-form.ts
reviewed (prior audit): labs/angular/src/app/modules/26-signal-forms/exercise-5-rating/rating.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/26-signal-forms/exercise-5-rating/rating.ts
reviewed (prior audit): labs/angular/src/app/modules/26-signal-forms/exercise-5-rating/review-form.ts
reviewed (prior audit): labs/angular/src/app/modules/26-signal-forms/legacy/legacy-apis.ts
reviewed (prior audit): labs/angular/src/app/modules/26-signal-forms/outputs/q26-outputs.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/27-http-client/concepts/section-1-httpclient-vs-fetch.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/27-http-client/concepts/section-10-http-resource.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/27-http-client/concepts/section-11-testing.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/27-http-client/concepts/section-2-setup.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/27-http-client/concepts/section-3-requests.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/27-http-client/concepts/section-4-interceptors.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/27-http-client/concepts/section-5-errors.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/27-http-client/concepts/section-6-cancellation-caching.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/27-http-client/concepts/section-7-auth.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/27-http-client/concepts/section-8-xsrf.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/27-http-client/concepts/section-9-progress.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/27-http-client/exercise-1-typed-api/api-error.ts
reviewed (prior audit): labs/angular/src/app/modules/27-http-client/exercise-1-typed-api/product.ts
reviewed (prior audit): labs/angular/src/app/modules/27-http-client/exercise-1-typed-api/products-api.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/27-http-client/exercise-1-typed-api/products-api.ts
reviewed (prior audit): labs/angular/src/app/modules/27-http-client/exercise-2-retry/retry-config.ts
reviewed (prior audit): labs/angular/src/app/modules/27-http-client/exercise-2-retry/retry.interceptor.ts
reviewed (prior audit): labs/angular/src/app/modules/27-http-client/exercise-2-retry/retry.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/27-http-client/exercise-3-cache/cache.interceptor.ts
reviewed (prior audit): labs/angular/src/app/modules/27-http-client/exercise-3-cache/cache.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/27-http-client/exercise-3-cache/http-cache.ts
reviewed (prior audit): labs/angular/src/app/modules/27-http-client/exercise-4-refresh/auth-store.ts
reviewed (prior audit): labs/angular/src/app/modules/27-http-client/exercise-4-refresh/auth.interceptor.ts
reviewed (prior audit): labs/angular/src/app/modules/27-http-client/exercise-4-refresh/refresh.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/27-http-client/exercise-5-upload/upload-panel.ts
reviewed (prior audit): labs/angular/src/app/modules/27-http-client/exercise-5-upload/upload.service.ts
reviewed (prior audit): labs/angular/src/app/modules/27-http-client/exercise-5-upload/upload.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/27-http-client/exercise-6-search-page/search-page.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/27-http-client/exercise-6-search-page/search-page.ts
reviewed (prior audit): labs/angular/src/app/modules/27-http-client/exercise-6-search-page/search-result.ts
reviewed (prior audit): labs/angular/src/app/modules/27-http-client/legacy/legacy-interceptor.ts
reviewed (prior audit): labs/angular/src/app/modules/27-http-client/outputs/q27-outputs.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/concepts/section-1-kinds-of-state.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/concepts/section-10-optimistic-normalization-undo.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/concepts/section-12-under-the-hood.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/concepts/section-2-signal-store.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/concepts/section-3-behavior-subject-store.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/concepts/section-4-ngrx-store.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/concepts/section-5-selectors.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/concepts/section-6-effects.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/concepts/section-7-entity-router-devtools.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/concepts/section-8-signal-store.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/concepts/section-9-signal-store-in-depth.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/exercise-1-signal-store/product.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/exercise-1-signal-store/products-store.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/exercise-1-signal-store/products-store.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/exercise-2-url-state/product-filters.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/exercise-2-url-state/product-list-page.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/exercise-2-url-state/route-product-list-page.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/exercise-2-url-state/url-state.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/exercise-3-optimistic-undo/overlay-todos-store.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/exercise-3-optimistic-undo/todo.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/exercise-3-optimistic-undo/todos-api.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/exercise-3-optimistic-undo/todos-store.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/exercise-3-optimistic-undo/todos-store.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/exercise-4-mini-store/actions.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/exercise-4-mini-store/cart.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/exercise-4-mini-store/create-selector.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/exercise-4-mini-store/create-signal-selector.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/exercise-4-mini-store/create-store.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/exercise-4-mini-store/mini-store.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/exercise-4-mini-store/signal-cart-selectors.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/exercise-5-signal-store/authors-store.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/exercise-5-signal-store/todo.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/exercise-5-signal-store/todos-api.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/exercise-5-signal-store/todos-store.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/exercise-5-signal-store/todos-store.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/exercise-5-signal-store/tracked-authors-store.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/exercise-5-signal-store/tracked-todos-store.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/exercise-5-signal-store/with-request-status.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/exercise-5-signal-store/with-tracked-request.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/legacy/behavior-subject-store.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/legacy/class-effects.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/legacy/grid-component-store.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/legacy/ngmodule-store.ts
reviewed (prior audit): labs/angular/src/app/modules/28-state-management/outputs/q28-outputs.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/concepts/section-1-what-to-test.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/concepts/section-10-async.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/concepts/section-10-zone-import.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/concepts/section-11-harnesses.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/concepts/section-12-under-the-hood.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/concepts/section-2-runner.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/concepts/section-3-migrated-specs.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/concepts/section-4-testbed.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/concepts/section-5-zoneless-fixture.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/concepts/section-6-component-tests.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/concepts/section-7-test-doubles.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/concepts/section-8-services-pipes-directives.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/concepts/section-9-guards-interceptors-forms-effects-stores.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/exercise-1-rating/rating.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/exercise-1-rating/rating.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/exercise-2-session/clock.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/exercise-2-session/fake-clock.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/exercise-2-session/in-memory-storage.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/exercise-2-session/session-storage.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/exercise-2-session/session-store.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/exercise-2-session/session-store.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/exercise-3-auth/auth-guard.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/exercise-3-auth/auth-interceptor.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/exercise-3-auth/auth-state.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/exercise-3-auth/auth.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/exercise-3-auth/routes.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/exercise-4-fake-timers/fake-timers.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/exercise-4-fake-timers/search-api.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/exercise-4-fake-timers/search-box.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/exercise-4-fake-timers/status-poller.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/exercise-5-harness/quantity-picker-driver.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/exercise-5-harness/quantity-picker-harness.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/exercise-5-harness/quantity-picker.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/exercise-5-harness/quantity-picker.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/exercise-6-feature/routes.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/exercise-6-feature/todo-page.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/exercise-6-feature/todo-page.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/exercise-6-feature/todo.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/exercise-6-feature/todos-api.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/exercise-6-feature/todos-store.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/outputs/q29-outputs.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/29-testing-angular/outputs/q29-zone-outputs.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/30-e2e-and-testing-strategy/concepts/section-1-component-level.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/30-e2e-and-testing-strategy/demo/routes.ts
reviewed (prior audit): labs/angular/src/app/modules/30-e2e-and-testing-strategy/demo/todo.ts
reviewed (prior audit): labs/angular/src/app/modules/30-e2e-and-testing-strategy/demo/todos-api.ts
reviewed (prior audit): labs/angular/src/app/modules/30-e2e-and-testing-strategy/demo/todos-page.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/concepts/dashboard.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/concepts/entity-list.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/concepts/entity-store.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/concepts/image-hosts.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/concepts/rows.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/concepts/run-counter.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/concepts/section-11-srcset.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/concepts/section-3-runtime-cost.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/concepts/section-7-images.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/concepts/section-9-workers.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/concepts/total-pipe.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/demo/heavy-panel.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/demo/leaks.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/demo/loading.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/demo/long-list.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/demo/m31-home.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/demo/prime-count.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/demo/prime-service.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/demo/routes.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/demo/sum.worker.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/demo/tree-shaking-page.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/demo/tree-shaking/index.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/demo/tree-shaking/side-effect.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/demo/tree-shaking/static-block.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/demo/tree-shaking/unused-pure.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/demo/tree-shaking/used.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/demo/worker-page.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/exercise-1-fast-list/product-list.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/exercise-1-fast-list/product-list.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/exercise-2-log-viewer/log-lines.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/exercise-2-log-viewer/log-viewer-cdk.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/exercise-2-log-viewer/log-viewer-window.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/exercise-2-log-viewer/log-viewer.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/exercise-4-leak-hunt/chart-panel.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/exercise-4-leak-hunt/leak-hunt.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/exercise-4-leak-hunt/panel-registry.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/exercise-5-worker/primes-client.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/exercise-5-worker/primes-client.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/exercise-5-worker/primes-page.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/exercise-5-worker/primes.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/exercise-5-worker/primes.worker.ts
reviewed (prior audit): labs/angular/src/app/modules/31-performance/outputs/q31-outputs.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/32-ssr-ssg-hydration/concepts/section-3-server-routes.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/32-ssr-ssg-hydration/concepts/section-7-platform.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/33-security/concepts/section-12-under-the-hood.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/33-security/concepts/section-2-template-model.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/33-security/concepts/section-3-sanitization.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/33-security/concepts/section-4-dom-sanitizer.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/33-security/concepts/section-5-csp.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/33-security/exercise-1-safe-embed/embed-url.ts
reviewed (prior audit): labs/angular/src/app/modules/33-security/exercise-1-safe-embed/video-embed.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/33-security/exercise-1-safe-embed/video-embed.ts
reviewed (prior audit): labs/angular/src/app/modules/33-security/outputs/q33-outputs.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/34-i18n/concepts/section-1-locale-id.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/34-i18n/concepts/section-10-dates-money.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/34-i18n/concepts/section-11-directionality.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/34-i18n/concepts/section-12-under-the-hood.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/34-i18n/concepts/section-3-locale-data.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/34-i18n/concepts/section-4-marking.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/34-i18n/concepts/section-5-icu.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/34-i18n/concepts/section-6-ids.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/34-i18n/concepts/section-8-runtime.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/34-i18n/concepts/section-9-ngx-translate.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/34-i18n/concepts/section-9-transloco.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/34-i18n/exercise-1-relative-time/relative-parts.ts
reviewed (prior audit): labs/angular/src/app/modules/34-i18n/exercise-1-relative-time/relative-time.pipe.ts
reviewed (prior audit): labs/angular/src/app/modules/34-i18n/exercise-1-relative-time/relative-time.service.ts
reviewed (prior audit): labs/angular/src/app/modules/34-i18n/exercise-1-relative-time/relative-time.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/34-i18n/exercise-3-language-switch/harness.ts
reviewed (prior audit): labs/angular/src/app/modules/34-i18n/exercise-3-language-switch/language-store.ts
reviewed (prior audit): labs/angular/src/app/modules/34-i18n/exercise-3-language-switch/language-switch.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/34-i18n/exercise-3-language-switch/ngx-translate/harness.ts
reviewed (prior audit): labs/angular/src/app/modules/34-i18n/exercise-3-language-switch/ngx-translate/language-switch.ts
reviewed (prior audit): labs/angular/src/app/modules/34-i18n/exercise-3-language-switch/request-log.ts
reviewed (prior audit): labs/angular/src/app/modules/34-i18n/exercise-3-language-switch/translations.ts
reviewed (prior audit): labs/angular/src/app/modules/34-i18n/exercise-3-language-switch/transloco/harness.ts
reviewed (prior audit): labs/angular/src/app/modules/34-i18n/exercise-3-language-switch/transloco/language-switch.ts
reviewed (prior audit): labs/angular/src/app/modules/34-i18n/outputs/q34-outputs.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/34-i18n/smoke.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/35-animations/concepts/section-1-jsdom.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/35-animations/concepts/section-12-instructions.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/35-animations/concepts/section-6-types.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/35-animations/concepts/section-8-legacy.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/35-animations/exercise-3-stagger/no-legacy.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/35-animations/outputs/q35-outputs.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/35-animations/smoke.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/36-material-and-cdk/concepts/section-1-layers.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/36-material-and-cdk/concepts/section-10-harnesses.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/36-material-and-cdk/concepts/section-11-aria.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/36-material-and-cdk/concepts/section-12-wrapper.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/36-material-and-cdk/concepts/section-2-form-field.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/36-material-and-cdk/concepts/section-5-portal.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/36-material-and-cdk/concepts/section-7-table.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/36-material-and-cdk/concepts/section-8-jsdom.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/36-material-and-cdk/concepts/section-9-key-manager.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/36-material-and-cdk/exercise-4-harness/a/rating.ts
reviewed (prior audit): labs/angular/src/app/modules/36-material-and-cdk/exercise-4-harness/b/rating.ts
reviewed (prior audit): labs/angular/src/app/modules/36-material-and-cdk/exercise-4-harness/profile-form.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/36-material-and-cdk/exercise-4-harness/profile-form.ts
reviewed (prior audit): labs/angular/src/app/modules/36-material-and-cdk/exercise-4-harness/rating-harness.ts
reviewed (prior audit): labs/angular/src/app/modules/36-material-and-cdk/exercise-4-harness/rating.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/36-material-and-cdk/outputs/q36-outputs.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/36-material-and-cdk/smoke.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/37-elements-pwa-errors-ecosystem/concepts/section-1-elements.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/37-elements-pwa-errors-ecosystem/concepts/section-10-ux.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/37-elements-pwa-errors-ecosystem/concepts/section-11-reporter.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/37-elements-pwa-errors-ecosystem/concepts/section-13-internals.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/37-elements-pwa-errors-ecosystem/concepts/section-2-contract.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/37-elements-pwa-errors-ecosystem/concepts/section-2-schema.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/37-elements-pwa-errors-ecosystem/concepts/section-3-runtime.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/37-elements-pwa-errors-ecosystem/concepts/section-4-registration.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/37-elements-pwa-errors-ecosystem/concepts/section-6-updates.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/37-elements-pwa-errors-ecosystem/concepts/section-7-push.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/37-elements-pwa-errors-ecosystem/concepts/section-8-handler.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/37-elements-pwa-errors-ecosystem/concepts/section-9-boundary.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/37-elements-pwa-errors-ecosystem/exercise-3-errors/a/dashboard.ts
reviewed (prior audit): labs/angular/src/app/modules/37-elements-pwa-errors-ecosystem/exercise-3-errors/b/dashboard.ts
reviewed (prior audit): labs/angular/src/app/modules/37-elements-pwa-errors-ecosystem/exercise-3-errors/exercise-3-errors.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/37-elements-pwa-errors-ecosystem/exercise-3-errors/reporter.ts
reviewed (prior audit): labs/angular/src/app/modules/37-elements-pwa-errors-ecosystem/exercise-3-errors/widgets.ts
reviewed (prior audit): labs/angular/src/app/modules/37-elements-pwa-errors-ecosystem/exercise-4-update/exercise-4.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/37-elements-pwa-errors-ecosystem/outputs/q37-outputs.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/37-elements-pwa-errors-ecosystem/smoke.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/concepts/section-1-folders.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/concepts/section-12-tree.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/concepts/section-2-roles.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/concepts/section-3-facade.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/concepts/section-5-consumer.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/exercise-1-orders/a/orders-facade.ts
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/exercise-1-orders/b/orders-facade.ts
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/exercise-1-orders/data-access/orders-api.ts
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/exercise-1-orders/exercise-1.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/exercise-1-orders/orders-container.ts
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/exercise-1-orders/orders-facade.token.ts
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/exercise-1-orders/start/orders-page.ts
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/exercise-1-orders/ui/order-filter.ts
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/exercise-1-orders/ui/order-list.ts
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/exercise-2-library/exercise-2.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/outputs/q38-outputs.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/sample-app/app-shell.ts
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/sample-app/core/client-header-interceptor.ts
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/sample-app/core/core-providers.ts
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/sample-app/core/error-handler.ts
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/sample-app/core/production.config.ts
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/sample-app/core/sample-app.config.ts
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/sample-app/features/catalog/data-access/catalog-store.ts
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/sample-app/features/catalog/feature/catalog-home.ts
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/sample-app/features/catalog/feature/catalog-page.ts
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/sample-app/features/catalog/routes.ts
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/sample-app/features/catalog/ui/product-list.ts
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/sample-app/features/orders/data-access/orders-api.ts
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/sample-app/features/orders/data-access/orders-facade.ts
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/sample-app/features/orders/data-access/orders-store.ts
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/sample-app/features/orders/feature/orders-home.ts
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/sample-app/features/orders/feature/orders-page.ts
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/sample-app/features/orders/routes.ts
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/sample-app/features/orders/ui/order-list.ts
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/sample-app/routes.ts
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/sample-app/shared/ui/page-heading.ts
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/sample-app/shared/util/page-title.ts
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/sample-app/styles/tokens.css
reviewed (prior audit): labs/angular/src/app/modules/38-architecture-and-production-structure/smoke.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/39-version-history-and-migrations/concepts/section-10-before-after.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/39-version-history-and-migrations/concepts/section-9-strangler.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/39-version-history-and-migrations/concepts/section-9-strangler.ts
reviewed (prior audit): labs/angular/src/app/modules/39-version-history-and-migrations/legacy/legacy-order-panel.ts
reviewed (prior audit): labs/angular/src/app/modules/39-version-history-and-migrations/legacy/legacy-orders.module.ts
reviewed (prior audit): labs/angular/src/app/modules/39-version-history-and-migrations/legacy/legacy-orders.service.ts
reviewed (prior audit): labs/angular/src/app/modules/39-version-history-and-migrations/migrated/order-detail-page.ts
reviewed (prior audit): labs/angular/src/app/modules/39-version-history-and-migrations/migrated/order-list-page.ts
reviewed (prior audit): labs/angular/src/app/modules/39-version-history-and-migrations/migrated/order-panel.ts
reviewed (prior audit): labs/angular/src/app/modules/39-version-history-and-migrations/migrated/order-selection.ts
reviewed (prior audit): labs/angular/src/app/modules/41-fullstack-api-contracts/concepts/api-version.interceptor.ts
reviewed (prior audit): labs/angular/src/app/modules/41-fullstack-api-contracts/concepts/chunk-plan.ts
reviewed (prior audit): labs/angular/src/app/modules/41-fullstack-api-contracts/concepts/content-disposition.ts
reviewed (prior audit): labs/angular/src/app/modules/41-fullstack-api-contracts/concepts/json-pointer.ts
reviewed (prior audit): labs/angular/src/app/modules/41-fullstack-api-contracts/concepts/page-params.ts
reviewed (prior audit): labs/angular/src/app/modules/41-fullstack-api-contracts/concepts/problem-details.ts
reviewed (prior audit): labs/angular/src/app/modules/41-fullstack-api-contracts/concepts/section-1-cors.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/41-fullstack-api-contracts/concepts/section-10-trace.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/41-fullstack-api-contracts/concepts/section-4-versioning.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/41-fullstack-api-contracts/concepts/section-5-problem-details.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/41-fullstack-api-contracts/concepts/section-6-pagination.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/41-fullstack-api-contracts/concepts/section-7-validation.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/41-fullstack-api-contracts/concepts/section-8-files.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/41-fullstack-api-contracts/exercise-1-problem-details/a/problem-mapper.ts
reviewed (prior audit): labs/angular/src/app/modules/41-fullstack-api-contracts/exercise-1-problem-details/b/problem.interceptor.ts
reviewed (prior audit): labs/angular/src/app/modules/41-fullstack-api-contracts/exercise-1-problem-details/exercise-1.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/41-fullstack-api-contracts/exercise-1-problem-details/problem.ts
reviewed (prior audit): labs/angular/src/app/modules/41-fullstack-api-contracts/exercise-2-form-errors/a/apply-to-reactive.ts
reviewed (prior audit): labs/angular/src/app/modules/41-fullstack-api-contracts/exercise-2-form-errors/b/apply-to-signal-forms.ts
reviewed (prior audit): labs/angular/src/app/modules/41-fullstack-api-contracts/exercise-2-form-errors/exercise-2.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/41-fullstack-api-contracts/exercise-2-form-errors/server-errors.ts
reviewed (prior audit): labs/angular/src/app/modules/41-fullstack-api-contracts/exercise-3-paged-list/a/offset-source.ts
reviewed (prior audit): labs/angular/src/app/modules/41-fullstack-api-contracts/exercise-3-paged-list/b/cursor-source.ts
reviewed (prior audit): labs/angular/src/app/modules/41-fullstack-api-contracts/exercise-3-paged-list/exercise-3.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/41-fullstack-api-contracts/exercise-3-paged-list/list-source.ts
reviewed (prior audit): labs/angular/src/app/modules/41-fullstack-api-contracts/exercise-3-paged-list/order-list.store.ts
reviewed (prior audit): labs/angular/src/app/modules/41-fullstack-api-contracts/exercise-3-paged-list/order.schema.ts
reviewed (prior audit): labs/angular/src/app/modules/41-fullstack-api-contracts/outputs/q41-11.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/42-fullstack-authentication/concepts/auth-session.ts
reviewed (prior audit): labs/angular/src/app/modules/42-fullstack-authentication/concepts/auth.guard.ts
reviewed (prior audit): labs/angular/src/app/modules/42-fullstack-authentication/concepts/auth.interceptor.ts
reviewed (prior audit): labs/angular/src/app/modules/42-fullstack-authentication/concepts/bff-client.ts
reviewed (prior audit): labs/angular/src/app/modules/42-fullstack-authentication/concepts/csrf-session.ts
reviewed (prior audit): labs/angular/src/app/modules/42-fullstack-authentication/concepts/idle-timer.ts
reviewed (prior audit): labs/angular/src/app/modules/42-fullstack-authentication/concepts/section-3-bff.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/42-fullstack-authentication/concepts/section-6-csrf.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/42-fullstack-authentication/concepts/section-7-angular-side.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/42-fullstack-authentication/concepts/section-8-timeout.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/42-fullstack-authentication/concepts/section-9-trace.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/42-fullstack-authentication/exercise-3-bff-session/a/session.store.ts
reviewed (prior audit): labs/angular/src/app/modules/42-fullstack-authentication/exercise-3-bff-session/b/session.resource.ts
reviewed (prior audit): labs/angular/src/app/modules/42-fullstack-authentication/exercise-3-bff-session/exercise-3.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/42-fullstack-authentication/exercise-3-bff-session/guard.ts
reviewed (prior audit): labs/angular/src/app/modules/42-fullstack-authentication/exercise-3-bff-session/session.ts
reviewed (prior audit): labs/angular/src/app/modules/42-fullstack-authentication/exercise-3-bff-session/unauthorized.interceptor.ts
reviewed (prior audit): labs/angular/src/app/modules/43-fullstack-realtime/concepts/live-socket.ts
reviewed (prior audit): labs/angular/src/app/modules/43-fullstack-realtime/concepts/live-store.ts
reviewed (prior audit): labs/angular/src/app/modules/43-fullstack-realtime/concepts/section-4-sse-client.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/43-fullstack-realtime/concepts/section-6-websocket-client.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/43-fullstack-realtime/concepts/section-8-signals.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/43-fullstack-realtime/concepts/sse-client.ts
reviewed (prior audit): labs/angular/src/app/modules/43-fullstack-realtime/concepts/testing/fake-event-source.ts
reviewed (prior audit): labs/angular/src/app/modules/43-fullstack-realtime/concepts/testing/fake-web-socket.ts
reviewed (prior audit): labs/angular/src/app/modules/43-fullstack-realtime/exercise-2-resilient-socket/a/rx-channel.ts
reviewed (prior audit): labs/angular/src/app/modules/43-fullstack-realtime/exercise-2-resilient-socket/b/hand-channel.ts
reviewed (prior audit): labs/angular/src/app/modules/43-fullstack-realtime/exercise-2-resilient-socket/channel.ts
reviewed (prior audit): labs/angular/src/app/modules/43-fullstack-realtime/exercise-2-resilient-socket/exercise-2.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/43-fullstack-realtime/exercise-3-live-board/a/board.store.ts
reviewed (prior audit): labs/angular/src/app/modules/43-fullstack-realtime/exercise-3-live-board/b/board.resource.ts
reviewed (prior audit): labs/angular/src/app/modules/43-fullstack-realtime/exercise-3-live-board/board.ts
reviewed (prior audit): labs/angular/src/app/modules/43-fullstack-realtime/exercise-3-live-board/exercise-3.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/43-fullstack-realtime/outputs/q43-13.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/44-fullstack-delivery-and-operations/concepts/beacon-queue.ts
reviewed (prior audit): labs/angular/src/app/modules/44-fullstack-delivery-and-operations/concepts/section-9-rum.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/44-fullstack-delivery-and-operations/exercise-2-trace-correlation/a/trace.interceptor.ts
reviewed (prior audit): labs/angular/src/app/modules/44-fullstack-delivery-and-operations/exercise-2-trace-correlation/b/tracing-backend.ts
reviewed (prior audit): labs/angular/src/app/modules/44-fullstack-delivery-and-operations/exercise-2-trace-correlation/exercise-2.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/44-fullstack-delivery-and-operations/exercise-2-trace-correlation/tracing.ts
reviewed (prior audit): labs/angular/src/app/modules/44-fullstack-delivery-and-operations/exercise-3-feature-flags/a/flag.service.ts
reviewed (prior audit): labs/angular/src/app/modules/44-fullstack-delivery-and-operations/exercise-3-feature-flags/b/flag.store.ts
reviewed (prior audit): labs/angular/src/app/modules/44-fullstack-delivery-and-operations/exercise-3-feature-flags/checkout.ts
reviewed (prior audit): labs/angular/src/app/modules/44-fullstack-delivery-and-operations/exercise-3-feature-flags/exercise-3.spec.ts
reviewed (prior audit): labs/angular/src/app/modules/44-fullstack-delivery-and-operations/exercise-3-feature-flags/flags.ts
reviewed (prior audit): labs/angular/src/index.html
reviewed (prior audit): labs/angular/src/main.ts
reviewed (prior audit): labs/angular/src/styles.css
reviewed (prior audit): labs/angular/tsconfig.app.json
reviewed (prior audit): labs/angular/tsconfig.json
reviewed (prior audit): labs/angular/tsconfig.spec.json
reviewed (prior audit): labs/e2e/.gitignore
reviewed (prior audit): labs/e2e/package.json
reviewed (prior audit): labs/e2e/playwright.config.ts
reviewed (prior audit): labs/e2e/runner-fixtures/retry-project/flaky.spec.ts
reviewed (prior audit): labs/e2e/runner-fixtures/retry-project/playwright.config.ts
reviewed (prior audit): labs/e2e/runner-fixtures/shard-project/a.spec.ts
reviewed (prior audit): labs/e2e/runner-fixtures/shard-project/b.spec.ts
reviewed (prior audit): labs/e2e/runner-fixtures/shard-project/c.spec.ts
reviewed (prior audit): labs/e2e/runner-fixtures/shard-project/d.spec.ts
reviewed (prior audit): labs/e2e/runner-fixtures/shard-project/playwright.config.ts
reviewed (prior audit): labs/e2e/runner-fixtures/worker-project/playwright.config.ts
reviewed (prior audit): labs/e2e/runner-fixtures/worker-project/worker.spec.ts
reviewed (prior audit): labs/e2e/server/animations-server.mjs
reviewed (prior audit): labs/e2e/server/app-server.mjs
reviewed (prior audit): labs/e2e/server/elements-host/ex2-a.html
reviewed (prior audit): labs/e2e/server/elements-host/ex2-b.html
reviewed (prior audit): labs/e2e/server/elements-host/hello.html
reviewed (prior audit): labs/e2e/server/elements-host/section-1.html
reviewed (prior audit): labs/e2e/server/elements-host/two.html
reviewed (prior audit): labs/e2e/server/elements-server.mjs
reviewed (prior audit): labs/e2e/server/i18n-server.mjs
reviewed (prior audit): labs/e2e/server/material-server.mjs
reviewed (prior audit): labs/e2e/server/security-server.mjs
reviewed (prior audit): labs/e2e/server/security/01-threat.mjs
reviewed (prior audit): labs/e2e/server/security/02-xss.mjs
reviewed (prior audit): labs/e2e/server/security/05-csp.mjs
reviewed (prior audit): labs/e2e/server/security/06-trusted-types.mjs
reviewed (prior audit): labs/e2e/server/security/08-tokens.mjs
reviewed (prior audit): labs/e2e/server/security/09-csrf.mjs
reviewed (prior audit): labs/e2e/server/security/10-guards.mjs
reviewed (prior audit): labs/e2e/server/security/ex2-locked-page.mjs
reviewed (prior audit): labs/e2e/server/security/ex3-csrf-a.mjs
reviewed (prior audit): labs/e2e/server/security/ex3-csrf-b.mjs
reviewed (prior audit): labs/e2e/server/security/ex4-tokens-a.mjs
reviewed (prior audit): labs/e2e/server/security/ex4-tokens-b.mjs
reviewed (prior audit): labs/e2e/tests/31-performance/concepts/section-1-measure-first.spec.ts
reviewed (prior audit): labs/e2e/tests/31-performance/concepts/section-11-under-the-hood.spec.ts
reviewed (prior audit): labs/e2e/tests/31-performance/concepts/section-2-lab-metrics.spec.ts
reviewed (prior audit): labs/e2e/tests/31-performance/concepts/section-4-long-lists.spec.ts
reviewed (prior audit): labs/e2e/tests/31-performance/concepts/section-5-loading.spec.ts
reviewed (prior audit): labs/e2e/tests/31-performance/concepts/section-6-bundle-analysis.spec.ts
reviewed (prior audit): labs/e2e/tests/31-performance/concepts/section-7-images.spec.ts
reviewed (prior audit): labs/e2e/tests/31-performance/concepts/section-8-memory.spec.ts
reviewed (prior audit): labs/e2e/tests/31-performance/concepts/section-9-workers.spec.ts
reviewed (prior audit): labs/e2e/tests/31-performance/demo-smoke.spec.ts
reviewed (prior audit): labs/e2e/tests/31-performance/exercise-2-log-viewer/log-viewer.spec.ts
reviewed (prior audit): labs/e2e/tests/31-performance/exercise-4-leak-hunt/leak-hunt.spec.ts
reviewed (prior audit): labs/e2e/tests/31-performance/exercise-5-worker/worker.spec.ts
reviewed (prior audit): labs/e2e/tests/31-performance/outputs/q31-outputs.spec.ts
reviewed (prior audit): labs/e2e/tests/31-performance/support/lighthouse.ts
reviewed (prior audit): labs/e2e/tests/31-performance/support/perf.ts
reviewed (prior audit): labs/e2e/tests/32-ssr-ssg-hydration/concepts/section-1-why-server.spec.ts
reviewed (prior audit): labs/e2e/tests/32-ssr-ssg-hydration/concepts/section-10-under-the-hood.spec.ts
reviewed (prior audit): labs/e2e/tests/32-ssr-ssg-hydration/concepts/section-2-setup.spec.ts
reviewed (prior audit): labs/e2e/tests/32-ssr-ssg-hydration/concepts/section-3-server-routes.spec.ts
reviewed (prior audit): labs/e2e/tests/32-ssr-ssg-hydration/concepts/section-4-hydration.spec.ts
reviewed (prior audit): labs/e2e/tests/32-ssr-ssg-hydration/concepts/section-5-event-replay.spec.ts
reviewed (prior audit): labs/e2e/tests/32-ssr-ssg-hydration/concepts/section-6-incremental.spec.ts
reviewed (prior audit): labs/e2e/tests/32-ssr-ssg-hydration/concepts/section-7-platform.spec.ts
reviewed (prior audit): labs/e2e/tests/32-ssr-ssg-hydration/concepts/section-8-data.spec.ts
reviewed (prior audit): labs/e2e/tests/32-ssr-ssg-hydration/concepts/section-9-deploy.spec.ts
reviewed (prior audit): labs/e2e/tests/32-ssr-ssg-hydration/exercise-1-catalog-routes/catalog-routes.spec.ts
reviewed (prior audit): labs/e2e/tests/32-ssr-ssg-hydration/exercise-2-safe-widget/safe-widget.spec.ts
reviewed (prior audit): labs/e2e/tests/32-ssr-ssg-hydration/exercise-3-fetch-once/fetch-once.spec.ts
reviewed (prior audit): labs/e2e/tests/32-ssr-ssg-hydration/exercise-4-incremental-product/incremental-product.spec.ts
reviewed (prior audit): labs/e2e/tests/32-ssr-ssg-hydration/outputs/q32-outputs.spec.ts
reviewed (prior audit): labs/e2e/tests/32-ssr-ssg-hydration/smoke.spec.ts
reviewed (prior audit): labs/e2e/tests/32-ssr-ssg-hydration/support/ssr.ts
reviewed (prior audit): labs/e2e/tests/33-security/concepts/section-1-threat-model.spec.ts
reviewed (prior audit): labs/e2e/tests/33-security/concepts/section-10-guards.spec.ts
reviewed (prior audit): labs/e2e/tests/33-security/concepts/section-11-supply-chain.spec.ts
reviewed (prior audit): labs/e2e/tests/33-security/concepts/section-2-template-model.spec.ts
reviewed (prior audit): labs/e2e/tests/33-security/concepts/section-3-sanitization.spec.ts
reviewed (prior audit): labs/e2e/tests/33-security/concepts/section-5-csp.spec.ts
reviewed (prior audit): labs/e2e/tests/33-security/concepts/section-6-trusted-types.spec.ts
reviewed (prior audit): labs/e2e/tests/33-security/concepts/section-7-ssr.spec.ts
reviewed (prior audit): labs/e2e/tests/33-security/concepts/section-8-token-storage.spec.ts
reviewed (prior audit): labs/e2e/tests/33-security/concepts/section-9-csrf.spec.ts
reviewed (prior audit): labs/e2e/tests/33-security/exercise-2-locked-page/locked-page.spec.ts
reviewed (prior audit): labs/e2e/tests/33-security/exercise-3-csrf/csrf.spec.ts
reviewed (prior audit): labs/e2e/tests/33-security/exercise-4-token-storage/token-storage.spec.ts
reviewed (prior audit): labs/e2e/tests/33-security/outputs/q33-outputs.spec.ts
reviewed (prior audit): labs/e2e/tests/33-security/smoke.spec.ts
reviewed (prior audit): labs/e2e/tests/33-security/support/security.ts
reviewed (prior audit): labs/e2e/tests/34-i18n/concepts/section-11-rtl.spec.ts
reviewed (prior audit): labs/e2e/tests/34-i18n/concepts/section-2-intl.spec.ts
reviewed (prior audit): labs/e2e/tests/34-i18n/concepts/section-5-icu.spec.ts
reviewed (prior audit): labs/e2e/tests/34-i18n/concepts/section-7-locale-builds.spec.ts
reviewed (prior audit): labs/e2e/tests/34-i18n/concepts/section-8-runtime.spec.ts
reviewed (prior audit): labs/e2e/tests/34-i18n/exercise-2-checkout/checkout.spec.ts
reviewed (prior audit): labs/e2e/tests/34-i18n/exercise-4-rtl-card/rtl-card.spec.ts
reviewed (prior audit): labs/e2e/tests/34-i18n/outputs/q34-outputs.spec.ts
reviewed (prior audit): labs/e2e/tests/34-i18n/smoke.spec.ts
reviewed (prior audit): labs/e2e/tests/34-i18n/support/i18n.ts
reviewed (prior audit): labs/e2e/tests/35-animations/concepts/section-1-mechanisms.spec.ts
reviewed (prior audit): labs/e2e/tests/35-animations/concepts/section-10-view-transitions.spec.ts
reviewed (prior audit): labs/e2e/tests/35-animations/concepts/section-11-performance-motion.spec.ts
reviewed (prior audit): labs/e2e/tests/35-animations/concepts/section-12-under-the-hood.spec.ts
reviewed (prior audit): labs/e2e/tests/35-animations/concepts/section-2-transitions.spec.ts
reviewed (prior audit): labs/e2e/tests/35-animations/concepts/section-3-keyframes.spec.ts
reviewed (prior audit): labs/e2e/tests/35-animations/concepts/section-4-waapi.spec.ts
reviewed (prior audit): labs/e2e/tests/35-animations/concepts/section-5-enter-leave-classes.spec.ts
reviewed (prior audit): labs/e2e/tests/35-animations/concepts/section-6-callbacks.spec.ts
reviewed (prior audit): labs/e2e/tests/35-animations/concepts/section-7-lists.spec.ts
reviewed (prior audit): labs/e2e/tests/35-animations/concepts/section-8-legacy.spec.ts
reviewed (prior audit): labs/e2e/tests/35-animations/concepts/section-9-migration.spec.ts
reviewed (prior audit): labs/e2e/tests/35-animations/exercise-1-toasts/toasts.spec.ts
reviewed (prior audit): labs/e2e/tests/35-animations/exercise-2-disclosure/disclosure.spec.ts
reviewed (prior audit): labs/e2e/tests/35-animations/exercise-3-stagger/stagger.spec.ts
reviewed (prior audit): labs/e2e/tests/35-animations/exercise-4-shared-element/shared-element.spec.ts
reviewed (prior audit): labs/e2e/tests/35-animations/outputs/q35-outputs.spec.ts
reviewed (prior audit): labs/e2e/tests/35-animations/smoke.spec.ts
reviewed (prior audit): labs/e2e/tests/35-animations/support/motion.ts
reviewed (prior audit): labs/e2e/tests/36-material-and-cdk/concepts/section-1-layers.spec.ts
reviewed (prior audit): labs/e2e/tests/36-material-and-cdk/concepts/section-11-aria.spec.ts
reviewed (prior audit): labs/e2e/tests/36-material-and-cdk/concepts/section-13-under-the-hood.spec.ts
reviewed (prior audit): labs/e2e/tests/36-material-and-cdk/concepts/section-2-material-app.spec.ts
reviewed (prior audit): labs/e2e/tests/36-material-and-cdk/concepts/section-3-theme.spec.ts
reviewed (prior audit): labs/e2e/tests/36-material-and-cdk/concepts/section-4-overrides.spec.ts
reviewed (prior audit): labs/e2e/tests/36-material-and-cdk/concepts/section-5-overlay.spec.ts
reviewed (prior audit): labs/e2e/tests/36-material-and-cdk/concepts/section-6-drag-drop.spec.ts
reviewed (prior audit): labs/e2e/tests/36-material-and-cdk/concepts/section-8-primitives.spec.ts
reviewed (prior audit): labs/e2e/tests/36-material-and-cdk/concepts/section-9-a11y.spec.ts
reviewed (prior audit): labs/e2e/tests/36-material-and-cdk/exercise-1-theme/theme.spec.ts
reviewed (prior audit): labs/e2e/tests/36-material-and-cdk/exercise-2-select/select.spec.ts
reviewed (prior audit): labs/e2e/tests/36-material-and-cdk/exercise-3-kanban/kanban.spec.ts
reviewed (prior audit): labs/e2e/tests/36-material-and-cdk/outputs/q36-outputs.spec.ts
reviewed (prior audit): labs/e2e/tests/36-material-and-cdk/smoke.spec.ts
reviewed (prior audit): labs/e2e/tests/36-material-and-cdk/support/ui.ts
reviewed (prior audit): labs/e2e/tests/37-elements-pwa-errors-ecosystem/concepts/section-1-host.spec.ts
reviewed (prior audit): labs/e2e/tests/37-elements-pwa-errors-ecosystem/concepts/section-10-offline.spec.ts
reviewed (prior audit): labs/e2e/tests/37-elements-pwa-errors-ecosystem/concepts/section-13-driver.spec.ts
reviewed (prior audit): labs/e2e/tests/37-elements-pwa-errors-ecosystem/concepts/section-3-runtime.spec.ts
reviewed (prior audit): labs/e2e/tests/37-elements-pwa-errors-ecosystem/concepts/section-4-registration.spec.ts
reviewed (prior audit): labs/e2e/tests/37-elements-pwa-errors-ecosystem/concepts/section-5-caching.spec.ts
reviewed (prior audit): labs/e2e/tests/37-elements-pwa-errors-ecosystem/concepts/section-6-updates.spec.ts
reviewed (prior audit): labs/e2e/tests/37-elements-pwa-errors-ecosystem/concepts/section-7-push.spec.ts
reviewed (prior audit): labs/e2e/tests/37-elements-pwa-errors-ecosystem/concepts/section-8-global.spec.ts
reviewed (prior audit): labs/e2e/tests/37-elements-pwa-errors-ecosystem/exercise-2-element/exercise-2.spec.ts
reviewed (prior audit): labs/e2e/tests/37-elements-pwa-errors-ecosystem/exercise-4-update/exercise-4.spec.ts
reviewed (prior audit): labs/e2e/tests/37-elements-pwa-errors-ecosystem/outputs/q37-outputs.spec.ts
reviewed (prior audit): labs/e2e/tests/37-elements-pwa-errors-ecosystem/smoke.spec.ts
reviewed (prior audit): labs/e2e/tests/37-elements-pwa-errors-ecosystem/support/sw.ts
reviewed (prior audit): labs/e2e/tests/concepts/hars/todos.har
reviewed (prior audit): labs/e2e/tests/concepts/section-1-what-belongs.spec.ts
reviewed (prior audit): labs/e2e/tests/concepts/section-2-architecture.spec.ts
reviewed (prior audit): labs/e2e/tests/concepts/section-3-auto-waiting.spec.ts
reviewed (prior audit): labs/e2e/tests/concepts/section-4-locators-and-fixtures.spec.ts
reviewed (prior audit): labs/e2e/tests/concepts/section-5-network-mocking.spec.ts
reviewed (prior audit): labs/e2e/tests/concepts/section-6-visual-and-a11y.spec.ts
reviewed (prior audit): labs/e2e/tests/concepts/section-6-visual-and-a11y.spec.ts-snapshots/todos-empty-chromium-darwin.png
reviewed (prior audit): labs/e2e/tests/concepts/section-7-flaky.spec.ts
reviewed (prior audit): labs/e2e/tests/concepts/section-8-ci.spec.ts
reviewed (prior audit): labs/e2e/tests/concepts/section-9-under-the-hood.spec.ts
reviewed (prior audit): labs/e2e/tests/demo-smoke.spec.ts
reviewed (prior audit): labs/e2e/tests/exercise-1-todos-journey/fixtures.ts
reviewed (prior audit): labs/e2e/tests/exercise-1-todos-journey/todos-journey.spec.ts
reviewed (prior audit): labs/e2e/tests/exercise-1-todos-journey/todos-page.ts
reviewed (prior audit): labs/e2e/tests/exercise-2-network-states/backends.ts
reviewed (prior audit): labs/e2e/tests/exercise-2-network-states/network-states.spec.ts
reviewed (prior audit): labs/e2e/tests/outputs/q30-outputs.spec.ts
reviewed (prior audit): labs/e2e/tests/outputs/q30-runner-outputs.spec.ts
reviewed (prior audit): labs/e2e/tests/smoke.spec.ts
reviewed (prior audit): labs/e2e/tsconfig.json
reviewed (prior audit): labs/tools/check-links.mjs
reviewed (prior audit): labs/tools/check-links.test.mjs
reviewed (prior audit): labs/tools/check-snippets.mjs
reviewed (prior audit): labs/tools/check-snippets.test.mjs
reviewed (prior audit): labs/tools/consistency-scan.mjs
reviewed (prior audit): labs/tools/consistency-scan.test.mjs
reviewed (prior audit): labs/tools/glossary.mjs
reviewed (prior audit): labs/tools/glossary.test.mjs
reviewed (prior audit): labs/tools/module-stats.mjs
reviewed (prior audit): labs/tools/module-stats.test.mjs
reviewed (prior audit): labs/tools/question-index.mjs
reviewed (prior audit): labs/tools/question-index.test.mjs
reviewed (prior audit): labs/ts-js/package.json
reviewed (prior audit): labs/ts-js/src/modules/01-js-values-types-coercion/loose-equals.test.ts
reviewed (prior audit): labs/ts-js/src/modules/01-js-values-types-coercion/loose-equals.ts
reviewed (prior audit): labs/ts-js/src/modules/01-js-values-types-coercion/money.test.ts
reviewed (prior audit): labs/ts-js/src/modules/01-js-values-types-coercion/money.ts
reviewed (prior audit): labs/ts-js/src/modules/01-js-values-types-coercion/unicode-text.test.ts
reviewed (prior audit): labs/ts-js/src/modules/01-js-values-types-coercion/unicode-text.ts
reviewed (prior audit): labs/ts-js/src/modules/02-js-scope-closures-this/curry.test.ts
reviewed (prior audit): labs/ts-js/src/modules/02-js-scope-closures-this/curry.ts
reviewed (prior audit): labs/ts-js/src/modules/02-js-scope-closures-this/memoize.test.ts
reviewed (prior audit): labs/ts-js/src/modules/02-js-scope-closures-this/memoize.ts
reviewed (prior audit): labs/ts-js/src/modules/02-js-scope-closures-this/rate-limit.test.ts
reviewed (prior audit): labs/ts-js/src/modules/02-js-scope-closures-this/rate-limit.ts
reviewed (prior audit): labs/ts-js/src/modules/03-js-objects-prototypes-classes/deep-freeze.test.ts
reviewed (prior audit): labs/ts-js/src/modules/03-js-objects-prototypes-classes/deep-freeze.ts
reviewed (prior audit): labs/ts-js/src/modules/03-js-objects-prototypes-classes/observable.test.ts
reviewed (prior audit): labs/ts-js/src/modules/03-js-objects-prototypes-classes/observable.ts
reviewed (prior audit): labs/ts-js/src/modules/03-js-objects-prototypes-classes/range.test.ts
reviewed (prior audit): labs/ts-js/src/modules/03-js-objects-prototypes-classes/range.ts
reviewed (prior audit): labs/ts-js/src/modules/03-js-objects-prototypes-classes/sections.test.ts
reviewed (prior audit): labs/ts-js/src/modules/04-js-async-event-loop/delay.test.ts
reviewed (prior audit): labs/ts-js/src/modules/04-js-async-event-loop/delay.ts
reviewed (prior audit): labs/ts-js/src/modules/04-js-async-event-loop/latest-only.test.ts
reviewed (prior audit): labs/ts-js/src/modules/04-js-async-event-loop/latest-only.ts
reviewed (prior audit): labs/ts-js/src/modules/04-js-async-event-loop/promise-pool.test.ts
reviewed (prior audit): labs/ts-js/src/modules/04-js-async-event-loop/promise-pool.ts
reviewed (prior audit): labs/ts-js/src/modules/04-js-async-event-loop/retry.test.ts
reviewed (prior audit): labs/ts-js/src/modules/04-js-async-event-loop/retry.ts
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/error-chain.test.ts
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/error-chain.ts
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-1/cycle-function/a.mjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-1/cycle-function/b.mjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-1/cycle-function/main.mjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-1/cycle-tdz/a.mjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-1/cycle-tdz/b.mjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-1/cycle-tdz/main.mjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-1/live/counter.mjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-1/live/main.mjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-1/missing-export/dep.mjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-1/missing-export/main.mjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-1/order/a.mjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-1/order/b.mjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-1/order/main.mjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-1/order/shared.mjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-2/copy/counter.cjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-2/copy/main.cjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-2/cycle/a.cjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-2/cycle/b.cjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-2/cycle/main.cjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-2/dynamic/dep.mjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-2/dynamic/from-cjs.cjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-2/dynamic/main.mjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-2/import-cjs/lib.cjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-2/import-cjs/main.mjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-2/import-cjs/named-missing.mjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-2/require-esm/esm.mjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-2/require-esm/main.cjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-2/require-esm/tla.mjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-2/wrapper/main.cjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-3/config.json
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-3/json-assert.mjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-3/json-named.mjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-3/json-with.mjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-3/json-without.mjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-3/meta.mjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-4/cycle.mjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-4/listener-handle.mjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-4/listener-leak.mjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-4/timer-leak.mjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-5/deref-job.mjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-5/ephemeron.mjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-5/finalization.mjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-6/print-cause.mjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/section-7/native.mjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/tiny-require/flaky.cjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/fixtures/tiny-require/main.cjs
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/listen.test.ts
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/listen.ts
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/section-1-esm.test.ts
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/section-2-commonjs-interop.test.ts
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/section-3-meta-attributes.test.ts
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/section-4-gc-leaks.test.ts
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/section-5-weak-refs.test.ts
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/section-6-errors.test.ts
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/section-7-using.test.ts
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/section-8-editions.test.ts
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/tiny-require.test.ts
reviewed (prior audit): labs/ts-js/src/modules/05-js-modules-memory-modern-features/tiny-require.ts
reviewed (prior audit): labs/ts-js/src/modules/06-ts-type-system-essentials/cart.test.ts
reviewed (prior audit): labs/ts-js/src/modules/06-ts-type-system-essentials/cart.ts
reviewed (prior audit): labs/ts-js/src/modules/06-ts-type-system-essentials/feature-flags.test.ts
reviewed (prior audit): labs/ts-js/src/modules/06-ts-type-system-essentials/feature-flags.ts
reviewed (prior audit): labs/ts-js/src/modules/06-ts-type-system-essentials/fixtures/legacy-cart/legacy-cart.ts
reviewed (prior audit): labs/ts-js/src/modules/06-ts-type-system-essentials/fixtures/section-1/greet.ts
reviewed (prior audit): labs/ts-js/src/modules/06-ts-type-system-essentials/fixtures/section-1/status.ts
reviewed (prior audit): labs/ts-js/src/modules/06-ts-type-system-essentials/fixtures/section-1/unchecked.ts
reviewed (prior audit): labs/ts-js/src/modules/06-ts-type-system-essentials/reducer.test.ts
reviewed (prior audit): labs/ts-js/src/modules/06-ts-type-system-essentials/reducer.ts
reviewed (prior audit): labs/ts-js/src/modules/06-ts-type-system-essentials/section-1-what-typescript-is.test.ts
reviewed (prior audit): labs/ts-js/src/modules/06-ts-type-system-essentials/section-2-structural-typing.test.ts
reviewed (prior audit): labs/ts-js/src/modules/06-ts-type-system-essentials/section-3-narrowing.test.ts
reviewed (prior audit): labs/ts-js/src/modules/06-ts-type-system-essentials/section-4-unions.test.ts
reviewed (prior audit): labs/ts-js/src/modules/06-ts-type-system-essentials/section-5-special-types.test.ts
reviewed (prior audit): labs/ts-js/src/modules/06-ts-type-system-essentials/section-6-enums-satisfies.test.ts
reviewed (prior audit): labs/ts-js/src/modules/06-ts-type-system-essentials/section-7-tsconfig.test.ts
reviewed (prior audit): labs/ts-js/src/modules/06-ts-type-system-essentials/section-8-declarations.test.ts
reviewed (prior audit): labs/ts-js/src/modules/06-ts-type-system-essentials/typecheck.test.ts
reviewed (prior audit): labs/ts-js/src/modules/06-ts-type-system-essentials/typecheck.ts
reviewed (prior audit): labs/ts-js/src/modules/06-ts-type-system-essentials/user-guard.test.ts
reviewed (prior audit): labs/ts-js/src/modules/06-ts-type-system-essentials/user-guard.ts
reviewed (prior audit): labs/ts-js/src/modules/07-ts-advanced-types-and-decorators/event-bus.test.ts
reviewed (prior audit): labs/ts-js/src/modules/07-ts-advanced-types-and-decorators/event-bus.ts
reviewed (prior audit): labs/ts-js/src/modules/07-ts-advanced-types-and-decorators/fixtures/section-7/decorated-cart.ts
reviewed (prior audit): labs/ts-js/src/modules/07-ts-advanced-types-and-decorators/order-schema.test.ts
reviewed (prior audit): labs/ts-js/src/modules/07-ts-advanced-types-and-decorators/order-schema.ts
reviewed (prior audit): labs/ts-js/src/modules/07-ts-advanced-types-and-decorators/section-1-generics.test.ts
reviewed (prior audit): labs/ts-js/src/modules/07-ts-advanced-types-and-decorators/section-2-mapped-types.test.ts
reviewed (prior audit): labs/ts-js/src/modules/07-ts-advanced-types-and-decorators/section-3-conditional-types.test.ts
reviewed (prior audit): labs/ts-js/src/modules/07-ts-advanced-types-and-decorators/section-4-utility-types.test.ts
reviewed (prior audit): labs/ts-js/src/modules/07-ts-advanced-types-and-decorators/section-5-variance.test.ts
reviewed (prior audit): labs/ts-js/src/modules/07-ts-advanced-types-and-decorators/section-6-brands.test.ts
reviewed (prior audit): labs/ts-js/src/modules/07-ts-advanced-types-and-decorators/section-7-decorators.test.ts
reviewed (prior audit): labs/ts-js/src/modules/07-ts-advanced-types-and-decorators/section-8-zod.test.ts
reviewed (prior audit): labs/ts-js/src/modules/08-browser-rendering-dom-events/delegate.test.ts
reviewed (prior audit): labs/ts-js/src/modules/08-browser-rendering-dom-events/delegate.ts
reviewed (prior audit): labs/ts-js/src/modules/08-browser-rendering-dom-events/frame-scheduler.test.ts
reviewed (prior audit): labs/ts-js/src/modules/08-browser-rendering-dom-events/frame-scheduler.ts
reviewed (prior audit): labs/ts-js/src/modules/08-browser-rendering-dom-events/rating-stars.test.ts
reviewed (prior audit): labs/ts-js/src/modules/08-browser-rendering-dom-events/rating-stars.ts
reviewed (prior audit): labs/ts-js/src/modules/08-browser-rendering-dom-events/section-1-setup.test.ts
reviewed (prior audit): labs/ts-js/src/modules/08-browser-rendering-dom-events/section-2-batching.test.ts
reviewed (prior audit): labs/ts-js/src/modules/08-browser-rendering-dom-events/section-3-dom-observers.test.ts
reviewed (prior audit): labs/ts-js/src/modules/08-browser-rendering-dom-events/section-4-events.test.ts
reviewed (prior audit): labs/ts-js/src/modules/08-browser-rendering-dom-events/section-5-web-components.test.ts
reviewed (prior audit): labs/ts-js/src/modules/08-browser-rendering-dom-events/section-7-history.test.ts
reviewed (prior audit): labs/ts-js/src/modules/09-web-networking-storage-security/cookie-jar.test.ts
reviewed (prior audit): labs/ts-js/src/modules/09-web-networking-storage-security/cookie-jar.ts
reviewed (prior audit): labs/ts-js/src/modules/09-web-networking-storage-security/cors-model.test.ts
reviewed (prior audit): labs/ts-js/src/modules/09-web-networking-storage-security/cors-model.ts
reviewed (prior audit): labs/ts-js/src/modules/09-web-networking-storage-security/csp.ts
reviewed (prior audit): labs/ts-js/src/modules/09-web-networking-storage-security/etag-handler.ts
reviewed (prior audit): labs/ts-js/src/modules/09-web-networking-storage-security/resilient-fetch.test.ts
reviewed (prior audit): labs/ts-js/src/modules/09-web-networking-storage-security/resilient-fetch.ts
reviewed (prior audit): labs/ts-js/src/modules/09-web-networking-storage-security/section-1-http-semantics.test.ts
reviewed (prior audit): labs/ts-js/src/modules/09-web-networking-storage-security/section-2-fetch.test.ts
reviewed (prior audit): labs/ts-js/src/modules/09-web-networking-storage-security/section-3-http-versions.test.ts
reviewed (prior audit): labs/ts-js/src/modules/09-web-networking-storage-security/section-4-caching.test.ts
reviewed (prior audit): labs/ts-js/src/modules/09-web-networking-storage-security/section-5-cors.test.ts
reviewed (prior audit): labs/ts-js/src/modules/09-web-networking-storage-security/section-6-cookies.test.ts
reviewed (prior audit): labs/ts-js/src/modules/09-web-networking-storage-security/section-7-storage.test.ts
reviewed (prior audit): labs/ts-js/src/modules/09-web-networking-storage-security/section-8-csp.test.ts
reviewed (prior audit): labs/ts-js/src/modules/09-web-networking-storage-security/section-9-sw-strategies.test.ts
reviewed (prior audit): labs/ts-js/src/modules/09-web-networking-storage-security/support/http-server.ts
reviewed (prior audit): labs/ts-js/src/modules/09-web-networking-storage-security/support/node-shims.d.ts
reviewed (prior audit): labs/ts-js/src/modules/09-web-networking-storage-security/sw-strategies.ts
reviewed (prior audit): labs/ts-js/src/modules/10-css-essentials/cascade.test.ts
reviewed (prior audit): labs/ts-js/src/modules/10-css-essentials/cascade.ts
reviewed (prior audit): labs/ts-js/src/modules/10-css-essentials/section-1-jsdom-limits.test.ts
reviewed (prior audit): labs/ts-js/src/modules/10-css-essentials/section-2-cascade.test.ts
reviewed (prior audit): labs/ts-js/src/modules/10-css-essentials/section-4-stacking.test.ts
reviewed (prior audit): labs/ts-js/src/modules/10-css-essentials/section-5-units.test.ts
reviewed (prior audit): labs/ts-js/src/modules/10-css-essentials/section-6-custom-properties.test.ts
reviewed (prior audit): labs/ts-js/src/modules/10-css-essentials/specificity.test.ts
reviewed (prior audit): labs/ts-js/src/modules/10-css-essentials/specificity.ts
reviewed (prior audit): labs/ts-js/src/modules/10-css-essentials/stacking-context.ts
reviewed (prior audit): labs/ts-js/src/modules/10-css-essentials/support/dom.ts
reviewed (prior audit): labs/ts-js/src/modules/10-css-essentials/tokens.test.ts
reviewed (prior audit): labs/ts-js/src/modules/10-css-essentials/tokens.ts
reviewed (prior audit): labs/ts-js/src/modules/11-accessibility/accname.test.ts
reviewed (prior audit): labs/ts-js/src/modules/11-accessibility/accname.ts
reviewed (prior audit): labs/ts-js/src/modules/11-accessibility/announcer.ts
reviewed (prior audit): labs/ts-js/src/modules/11-accessibility/audit.test.ts
reviewed (prior audit): labs/ts-js/src/modules/11-accessibility/audit.ts
reviewed (prior audit): labs/ts-js/src/modules/11-accessibility/contrast.ts
reviewed (prior audit): labs/ts-js/src/modules/11-accessibility/focus-after-navigation.ts
reviewed (prior audit): labs/ts-js/src/modules/11-accessibility/focus-trap.ts
reviewed (prior audit): labs/ts-js/src/modules/11-accessibility/roving-tabindex.test.ts
reviewed (prior audit): labs/ts-js/src/modules/11-accessibility/roving-tabindex.ts
reviewed (prior audit): labs/ts-js/src/modules/11-accessibility/section-1-contrast.test.ts
reviewed (prior audit): labs/ts-js/src/modules/11-accessibility/section-2-jsdom-limits.test.ts
reviewed (prior audit): labs/ts-js/src/modules/11-accessibility/section-2-semantics.test.ts
reviewed (prior audit): labs/ts-js/src/modules/11-accessibility/section-3-aria.test.ts
reviewed (prior audit): labs/ts-js/src/modules/11-accessibility/section-4-focus.test.ts
reviewed (prior audit): labs/ts-js/src/modules/11-accessibility/section-5-live-regions.test.ts
reviewed (prior audit): labs/ts-js/src/modules/11-accessibility/section-6-forms.test.ts
reviewed (prior audit): labs/ts-js/src/modules/11-accessibility/support/dom.ts
reviewed (prior audit): labs/ts-js/src/modules/12-angular-how-it-works/budgets.test.ts
reviewed (prior audit): labs/ts-js/src/modules/12-angular-how-it-works/budgets.ts
reviewed (prior audit): labs/ts-js/src/modules/12-angular-how-it-works/mini-template.test.ts
reviewed (prior audit): labs/ts-js/src/modules/12-angular-how-it-works/mini-template.ts
reviewed (prior audit): labs/ts-js/src/modules/12-angular-how-it-works/section-2-workspace.test.ts
reviewed (prior audit): labs/ts-js/src/modules/13-components-and-templates/expression-evaluator.test.ts
reviewed (prior audit): labs/ts-js/src/modules/13-components-and-templates/expression-evaluator.ts
reviewed (prior audit): labs/ts-js/src/modules/13-components-and-templates/scoped-css.test.ts
reviewed (prior audit): labs/ts-js/src/modules/13-components-and-templates/scoped-css.ts
reviewed (prior audit): labs/ts-js/src/modules/13-components-and-templates/section-8-global-styles.test.ts
reviewed (prior audit): labs/ts-js/src/modules/14-directives-and-pipes/async-pipe-model.test.ts
reviewed (prior audit): labs/ts-js/src/modules/14-directives-and-pipes/async-pipe-model.ts
reviewed (prior audit): labs/ts-js/src/modules/15-standalone-and-ngmodules/scope-model.test.ts
reviewed (prior audit): labs/ts-js/src/modules/15-standalone-and-ngmodules/scope-model.ts
reviewed (prior audit): labs/ts-js/src/modules/16-dependency-injection/injector-model.test.ts
reviewed (prior audit): labs/ts-js/src/modules/16-dependency-injection/injector-model.ts
reviewed (prior audit): labs/ts-js/src/modules/17-signals/mini-signals.test.ts
reviewed (prior audit): labs/ts-js/src/modules/17-signals/mini-signals.ts
reviewed (prior audit): labs/ts-js/src/modules/18-control-flow-and-defer/defer-machine.test.ts
reviewed (prior audit): labs/ts-js/src/modules/18-control-flow-and-defer/defer-machine.ts
reviewed (prior audit): labs/ts-js/src/modules/21-change-detection/mini-change-detector.test.ts
reviewed (prior audit): labs/ts-js/src/modules/21-change-detection/mini-change-detector.ts
reviewed (prior audit): labs/ts-js/src/modules/30-e2e-and-testing-strategy/exercise-3-ci-kernel/ci-kernel.test.ts
reviewed (prior audit): labs/ts-js/src/modules/30-e2e-and-testing-strategy/exercise-3-ci-kernel/flaky.ts
reviewed (prior audit): labs/ts-js/src/modules/30-e2e-and-testing-strategy/exercise-3-ci-kernel/shard-plan.ts
reviewed (prior audit): labs/ts-js/src/modules/31-performance/exercise-3-bundle-why/bundle-why.test.ts
reviewed (prior audit): labs/ts-js/src/modules/31-performance/exercise-3-bundle-why/bundle-why.ts
reviewed (prior audit): labs/ts-js/src/modules/31-performance/exercise-3-bundle-why/fixtures/browser-stats.fixture.json
reviewed (prior audit): labs/ts-js/src/modules/31-performance/exercise-3-bundle-why/metafile.ts
reviewed (prior audit): labs/ts-js/src/modules/33-security/section-11-supply-chain.test.ts
reviewed (prior audit): labs/ts-js/src/modules/34-i18n/exercise-2-checkout.test.ts
reviewed (prior audit): labs/ts-js/src/modules/34-i18n/outputs/q34-outputs.test.ts
reviewed (prior audit): labs/ts-js/src/modules/34-i18n/section-1-locales.test.ts
reviewed (prior audit): labs/ts-js/src/modules/34-i18n/section-10-money.test.ts
reviewed (prior audit): labs/ts-js/src/modules/34-i18n/section-2-intl.test.ts
reviewed (prior audit): labs/ts-js/src/modules/34-i18n/section-6-extraction.test.ts
reviewed (prior audit): labs/ts-js/src/modules/34-i18n/support/xliff.ts
reviewed (prior audit): labs/ts-js/src/modules/34-i18n/translations-complete.test.ts
reviewed (prior audit): labs/ts-js/src/modules/37-elements-pwa-errors-ecosystem/exercise-1-evaluator/a/evaluate.ts
reviewed (prior audit): labs/ts-js/src/modules/37-elements-pwa-errors-ecosystem/exercise-1-evaluator/b/evaluate.ts
reviewed (prior audit): labs/ts-js/src/modules/37-elements-pwa-errors-ecosystem/exercise-1-evaluator/exercise-1-evaluator.test.ts
reviewed (prior audit): labs/ts-js/src/modules/37-elements-pwa-errors-ecosystem/exercise-1-evaluator/facts.ts
reviewed (prior audit): labs/ts-js/src/modules/37-elements-pwa-errors-ecosystem/exercise-1-evaluator/fixtures/ng-zorro-antd.json
reviewed (prior audit): labs/ts-js/src/modules/37-elements-pwa-errors-ecosystem/exercise-1-evaluator/fixtures/ngneat-until-destroy.json
reviewed (prior audit): labs/ts-js/src/modules/37-elements-pwa-errors-ecosystem/exercise-1-evaluator/fixtures/ngx-toastr.json
reviewed (prior audit): labs/ts-js/src/modules/37-elements-pwa-errors-ecosystem/exercise-1-evaluator/fixtures/primeng.json
reviewed (prior audit): labs/ts-js/src/modules/37-elements-pwa-errors-ecosystem/exercise-1-evaluator/fixtures/spartan-brain.json
reviewed (prior audit): labs/ts-js/src/modules/37-elements-pwa-errors-ecosystem/exercise-1-evaluator/fixtures/swimlane-ngx-charts.json
reviewed (prior audit): labs/ts-js/src/modules/37-elements-pwa-errors-ecosystem/exercise-1-evaluator/rank.ts
reviewed (prior audit): labs/ts-js/src/modules/37-elements-pwa-errors-ecosystem/exercise-1-evaluator/rules.ts
reviewed (prior audit): labs/ts-js/src/modules/37-elements-pwa-errors-ecosystem/fixtures/ng-zorro-antd.json
reviewed (prior audit): labs/ts-js/src/modules/37-elements-pwa-errors-ecosystem/fixtures/ngneat-until-destroy.json
reviewed (prior audit): labs/ts-js/src/modules/37-elements-pwa-errors-ecosystem/fixtures/ngx-toastr.json
reviewed (prior audit): labs/ts-js/src/modules/37-elements-pwa-errors-ecosystem/range.ts
reviewed (prior audit): labs/ts-js/src/modules/37-elements-pwa-errors-ecosystem/rules-table.ts
reviewed (prior audit): labs/ts-js/src/modules/37-elements-pwa-errors-ecosystem/scrub.ts
reviewed (prior audit): labs/ts-js/src/modules/37-elements-pwa-errors-ecosystem/section-11-scrub.test.ts
reviewed (prior audit): labs/ts-js/src/modules/37-elements-pwa-errors-ecosystem/section-12-rules.test.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/concepts/affected.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/concepts/rules.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/concepts/section-1-tree.test.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/concepts/section-12-tree.test.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/concepts/section-13-order.test.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/concepts/section-4-rules.test.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/concepts/section-5-dist.test.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/concepts/section-6-api.test.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/concepts/section-7-affected.test.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/concepts/toposort.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-2-library/exercise-2.test.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-3-boundaries/a/check.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-3-boundaries/b/check.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-3-boundaries/constraints.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-3-boundaries/exercise-3.test.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-3-boundaries/fixtures/tree-bad/catalog/helpers/rank.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-3-boundaries/fixtures/tree-bad/catalog/helpers/tags.json
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-3-boundaries/fixtures/tree-bad/catalog/ui/card.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-3-boundaries/fixtures/tree-bad/catalog/ui/tags.json
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-3-boundaries/fixtures/tree-bad/main.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-3-boundaries/fixtures/tree-bad/orders/data-access/api.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-3-boundaries/fixtures/tree-bad/orders/data-access/tags.json
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-3-boundaries/fixtures/tree-bad/orders/feature/page.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-3-boundaries/fixtures/tree-bad/orders/feature/tags.json
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-3-boundaries/fixtures/tree-bad/orders/ui/button.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-3-boundaries/fixtures/tree-bad/orders/ui/tags.json
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-3-boundaries/fixtures/tree-bad/tags.json
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-3-boundaries/fixtures/tree-bad/tools/script.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-3-boundaries/fixtures/tree-bad/tools/tags.json
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-3-boundaries/fixtures/tree-bad/util/format.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-3-boundaries/fixtures/tree-bad/util/tags.json
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-3-boundaries/fixtures/tree-ok/catalog/ui/card.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-3-boundaries/fixtures/tree-ok/catalog/ui/tags.json
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-3-boundaries/fixtures/tree-ok/docs/readme.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-3-boundaries/fixtures/tree-ok/docs/tags.json
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-3-boundaries/fixtures/tree-ok/main.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-3-boundaries/fixtures/tree-ok/orders/data-access/api.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-3-boundaries/fixtures/tree-ok/orders/data-access/tags.json
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-3-boundaries/fixtures/tree-ok/orders/feature/helper.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-3-boundaries/fixtures/tree-ok/orders/feature/page.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-3-boundaries/fixtures/tree-ok/orders/feature/tags.json
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-3-boundaries/fixtures/tree-ok/orders/ui/button.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-3-boundaries/fixtures/tree-ok/orders/ui/tags.json
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-3-boundaries/fixtures/tree-ok/tags.json
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-3-boundaries/fixtures/tree-ok/util/format.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-3-boundaries/fixtures/tree-ok/util/tags.json
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-3-boundaries/imports.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-4-pipeline/a/plan.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-4-pipeline/b/plan.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-4-pipeline/exercise-4.test.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-4-pipeline/graph.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/exercise-4-pipeline/hash.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/outputs/q38-outputs.test.ts
reviewed (prior audit): labs/ts-js/src/modules/38-architecture-and-production-structure/smoke.test.ts
reviewed (prior audit): labs/ts-js/src/modules/39-version-history-and-migrations/concepts/mini-digest.ts
reviewed (prior audit): labs/ts-js/src/modules/39-version-history-and-migrations/concepts/section-1-digest.test.ts
reviewed (prior audit): labs/ts-js/src/modules/39-version-history-and-migrations/concepts/section-10-leftovers.test.ts
reviewed (prior audit): labs/ts-js/src/modules/39-version-history-and-migrations/concepts/section-11-v22.test.ts
reviewed (prior audit): labs/ts-js/src/modules/39-version-history-and-migrations/concepts/section-12-internals.test.ts
reviewed (prior audit): labs/ts-js/src/modules/39-version-history-and-migrations/concepts/section-3-support.test.ts
reviewed (prior audit): labs/ts-js/src/modules/39-version-history-and-migrations/concepts/section-6-installed.test.ts
reviewed (prior audit): labs/ts-js/src/modules/39-version-history-and-migrations/concepts/section-7-migrations.test.ts
reviewed (prior audit): labs/ts-js/src/modules/39-version-history-and-migrations/concepts/section-8-hops.test.ts
reviewed (prior audit): labs/ts-js/src/modules/39-version-history-and-migrations/concepts/select-migrations.ts
reviewed (prior audit): labs/ts-js/src/modules/39-version-history-and-migrations/concepts/update-guide.ts
reviewed (prior audit): labs/ts-js/src/modules/39-version-history-and-migrations/exercise-1-digest/a/digest-scope.ts
reviewed (prior audit): labs/ts-js/src/modules/39-version-history-and-migrations/exercise-1-digest/b/digest-scope.ts
reviewed (prior audit): labs/ts-js/src/modules/39-version-history-and-migrations/exercise-1-digest/exercise-1.test.ts
reviewed (prior audit): labs/ts-js/src/modules/39-version-history-and-migrations/exercise-1-digest/scope.ts
reviewed (prior audit): labs/ts-js/src/modules/39-version-history-and-migrations/exercise-2-hops/a/plan.ts
reviewed (prior audit): labs/ts-js/src/modules/39-version-history-and-migrations/exercise-2-hops/b/plan.ts
reviewed (prior audit): labs/ts-js/src/modules/39-version-history-and-migrations/exercise-2-hops/exercise-2.test.ts
reviewed (prior audit): labs/ts-js/src/modules/39-version-history-and-migrations/exercise-2-hops/fixtures/compat.ts
reviewed (prior audit): labs/ts-js/src/modules/39-version-history-and-migrations/exercise-2-hops/hops.ts
reviewed (prior audit): labs/ts-js/src/modules/39-version-history-and-migrations/exercise-2-hops/range.ts
reviewed (prior audit): labs/ts-js/src/modules/39-version-history-and-migrations/exercise-2-hops/refusal.ts
reviewed (prior audit): labs/ts-js/src/modules/39-version-history-and-migrations/exercise-3-program/a/schedule.ts
reviewed (prior audit): labs/ts-js/src/modules/39-version-history-and-migrations/exercise-3-program/b/schedule.ts
reviewed (prior audit): labs/ts-js/src/modules/39-version-history-and-migrations/exercise-3-program/batches.ts
reviewed (prior audit): labs/ts-js/src/modules/39-version-history-and-migrations/exercise-3-program/exercise-3.test.ts
reviewed (prior audit): labs/ts-js/src/modules/39-version-history-and-migrations/exercise-3-program/program.ts
reviewed (prior audit): labs/ts-js/src/modules/39-version-history-and-migrations/exercise-4-schematics/a/modernize.ts
reviewed (prior audit): labs/ts-js/src/modules/39-version-history-and-migrations/exercise-4-schematics/b/modernize.ts
reviewed (prior audit): labs/ts-js/src/modules/39-version-history-and-migrations/exercise-4-schematics/exercise-4.test.ts
reviewed (prior audit): labs/ts-js/src/modules/39-version-history-and-migrations/exercise-4-schematics/leftovers.ts
reviewed (prior audit): labs/ts-js/src/modules/39-version-history-and-migrations/exercise-4-schematics/workspace.ts
reviewed (prior audit): labs/ts-js/src/modules/39-version-history-and-migrations/fixtures/compat-table.ts
reviewed (prior audit): labs/ts-js/src/modules/39-version-history-and-migrations/fixtures/support-windows.ts
reviewed (prior audit): labs/ts-js/src/modules/39-version-history-and-migrations/outputs/q39-outputs.test.ts
reviewed (prior audit): labs/ts-js/src/modules/39-version-history-and-migrations/outputs/update-guide-steps.ts
reviewed (prior audit): labs/ts-js/src/modules/39-version-history-and-migrations/support/angular-node-modules.ts
reviewed (prior audit): labs/ts-js/src/modules/39-version-history-and-migrations/support/run-schematic.ts
reviewed (prior audit): labs/ts-js/src/modules/40-framework-comparisons/concepts/mini-fine-grained.ts
reviewed (prior audit): labs/ts-js/src/modules/40-framework-comparisons/concepts/mini-rerender.ts
reviewed (prior audit): labs/ts-js/src/modules/40-framework-comparisons/concepts/section-3-rerender.test.ts
reviewed (prior audit): labs/ts-js/src/modules/40-framework-comparisons/concepts/section-4-fine-grained.test.ts
reviewed (prior audit): labs/ts-js/src/modules/40-framework-comparisons/concepts/section-9-one-change.test.ts
reviewed (prior audit): labs/ts-js/src/modules/40-framework-comparisons/exercise-1-vdom/a/runtime.ts
reviewed (prior audit): labs/ts-js/src/modules/40-framework-comparisons/exercise-1-vdom/b/runtime.ts
reviewed (prior audit): labs/ts-js/src/modules/40-framework-comparisons/exercise-1-vdom/exercise-1.test.ts
reviewed (prior audit): labs/ts-js/src/modules/40-framework-comparisons/exercise-1-vdom/renderer.ts
reviewed (prior audit): labs/ts-js/src/modules/40-framework-comparisons/exercise-1-vdom/vdom.ts
reviewed (prior audit): labs/ts-js/src/modules/40-framework-comparisons/exercise-2-decision/a/decide.ts
reviewed (prior audit): labs/ts-js/src/modules/40-framework-comparisons/exercise-2-decision/b/decide.ts
reviewed (prior audit): labs/ts-js/src/modules/40-framework-comparisons/exercise-2-decision/decision.ts
reviewed (prior audit): labs/ts-js/src/modules/40-framework-comparisons/exercise-2-decision/exercise-2.test.ts
reviewed (prior audit): labs/ts-js/src/modules/40-framework-comparisons/exercise-2-decision/fixtures/example-team.ts
reviewed (prior audit): labs/ts-js/src/modules/41-fullstack-api-contracts/concepts/contract-drift.ts
reviewed (prior audit): labs/ts-js/src/modules/41-fullstack-api-contracts/concepts/fixtures/orders-openapi.json
reviewed (prior audit): labs/ts-js/src/modules/41-fullstack-api-contracts/concepts/order-dto.ts
reviewed (prior audit): labs/ts-js/src/modules/41-fullstack-api-contracts/concepts/section-2-dto-boundary.test.ts
reviewed (prior audit): labs/ts-js/src/modules/41-fullstack-api-contracts/concepts/section-3-contract-drift.test.ts
reviewed (prior audit): labs/ts-js/src/modules/41-fullstack-api-contracts/concepts/section-9-wire-codecs.test.ts
reviewed (prior audit): labs/ts-js/src/modules/41-fullstack-api-contracts/concepts/wire-codecs.ts
reviewed (prior audit): labs/ts-js/src/modules/42-fullstack-authentication/concepts/authorities.ts
reviewed (prior audit): labs/ts-js/src/modules/42-fullstack-authentication/concepts/csrf-mask.ts
reviewed (prior audit): labs/ts-js/src/modules/42-fullstack-authentication/concepts/jwt-validator.ts
reviewed (prior audit): labs/ts-js/src/modules/42-fullstack-authentication/concepts/jwt.ts
reviewed (prior audit): labs/ts-js/src/modules/42-fullstack-authentication/concepts/pkce.ts
reviewed (prior audit): labs/ts-js/src/modules/42-fullstack-authentication/concepts/section-1-sessions-tokens.test.ts
reviewed (prior audit): labs/ts-js/src/modules/42-fullstack-authentication/concepts/section-2-pkce.test.ts
reviewed (prior audit): labs/ts-js/src/modules/42-fullstack-authentication/concepts/section-4-refresh.test.ts
reviewed (prior audit): labs/ts-js/src/modules/42-fullstack-authentication/concepts/section-5-resource-server.test.ts
reviewed (prior audit): labs/ts-js/src/modules/42-fullstack-authentication/concepts/section-6-csrf-mask.test.ts
reviewed (prior audit): labs/ts-js/src/modules/42-fullstack-authentication/concepts/section-8-tab-logout.test.ts
reviewed (prior audit): labs/ts-js/src/modules/42-fullstack-authentication/concepts/session-store.ts
reviewed (prior audit): labs/ts-js/src/modules/42-fullstack-authentication/concepts/tab-logout.ts
reviewed (prior audit): labs/ts-js/src/modules/42-fullstack-authentication/concepts/token-family.ts
reviewed (prior audit): labs/ts-js/src/modules/42-fullstack-authentication/exercise-1-pkce-client/a/client.ts
reviewed (prior audit): labs/ts-js/src/modules/42-fullstack-authentication/exercise-1-pkce-client/b/client.ts
reviewed (prior audit): labs/ts-js/src/modules/42-fullstack-authentication/exercise-1-pkce-client/exercise-1.test.ts
reviewed (prior audit): labs/ts-js/src/modules/42-fullstack-authentication/exercise-1-pkce-client/oidc-client.ts
reviewed (prior audit): labs/ts-js/src/modules/42-fullstack-authentication/exercise-2-refresh-rotation/a/single-flight-client.ts
reviewed (prior audit): labs/ts-js/src/modules/42-fullstack-authentication/exercise-2-refresh-rotation/b/locked-client.ts
reviewed (prior audit): labs/ts-js/src/modules/42-fullstack-authentication/exercise-2-refresh-rotation/exercise-2.test.ts
reviewed (prior audit): labs/ts-js/src/modules/42-fullstack-authentication/exercise-2-refresh-rotation/refresh-client.ts
reviewed (prior audit): labs/ts-js/src/modules/42-fullstack-authentication/exercise-2-refresh-rotation/token-endpoint.ts
reviewed (prior audit): labs/ts-js/src/modules/43-fullstack-realtime/concepts/broker-model.ts
reviewed (prior audit): labs/ts-js/src/modules/43-fullstack-realtime/concepts/event-log.ts
reviewed (prior audit): labs/ts-js/src/modules/43-fullstack-realtime/concepts/handshake-guard.ts
reviewed (prior audit): labs/ts-js/src/modules/43-fullstack-realtime/concepts/section-1-transports.test.ts
reviewed (prior audit): labs/ts-js/src/modules/43-fullstack-realtime/concepts/section-2-sse-protocol.test.ts
reviewed (prior audit): labs/ts-js/src/modules/43-fullstack-realtime/concepts/section-3-spring-sse.test.ts
reviewed (prior audit): labs/ts-js/src/modules/43-fullstack-realtime/concepts/section-5-stomp.test.ts
reviewed (prior audit): labs/ts-js/src/modules/43-fullstack-realtime/concepts/section-7-auth.test.ts
reviewed (prior audit): labs/ts-js/src/modules/43-fullstack-realtime/concepts/section-9-scaling.test.ts
reviewed (prior audit): labs/ts-js/src/modules/43-fullstack-realtime/concepts/sse-format.ts
reviewed (prior audit): labs/ts-js/src/modules/43-fullstack-realtime/concepts/sse-parser.ts
reviewed (prior audit): labs/ts-js/src/modules/43-fullstack-realtime/concepts/sse-reconnect.ts
reviewed (prior audit): labs/ts-js/src/modules/43-fullstack-realtime/concepts/stomp-frame.ts
reviewed (prior audit): labs/ts-js/src/modules/43-fullstack-realtime/concepts/transport-model.ts
reviewed (prior audit): labs/ts-js/src/modules/43-fullstack-realtime/exercise-1-resumable-sse/a/client.ts
reviewed (prior audit): labs/ts-js/src/modules/43-fullstack-realtime/exercise-1-resumable-sse/b/client.ts
reviewed (prior audit): labs/ts-js/src/modules/43-fullstack-realtime/exercise-1-resumable-sse/exercise-1.test.ts
reviewed (prior audit): labs/ts-js/src/modules/43-fullstack-realtime/exercise-1-resumable-sse/sse-client.ts
reviewed (prior audit): labs/ts-js/src/modules/44-fullstack-delivery-and-operations/concepts/docker-cache-model.ts
reviewed (prior audit): labs/ts-js/src/modules/44-fullstack-delivery-and-operations/concepts/envsubst-model.ts
reviewed (prior audit): labs/ts-js/src/modules/44-fullstack-delivery-and-operations/concepts/flag-model.ts
reviewed (prior audit): labs/ts-js/src/modules/44-fullstack-delivery-and-operations/concepts/graceful-shutdown.ts
reviewed (prior audit): labs/ts-js/src/modules/44-fullstack-delivery-and-operations/concepts/nginx-model.ts
reviewed (prior audit): labs/ts-js/src/modules/44-fullstack-delivery-and-operations/concepts/proxy-model.ts
reviewed (prior audit): labs/ts-js/src/modules/44-fullstack-delivery-and-operations/concepts/release-model.ts
reviewed (prior audit): labs/ts-js/src/modules/44-fullstack-delivery-and-operations/concepts/section-1-topologies.test.ts
reviewed (prior audit): labs/ts-js/src/modules/44-fullstack-delivery-and-operations/concepts/section-10-tracing.test.ts
reviewed (prior audit): labs/ts-js/src/modules/44-fullstack-delivery-and-operations/concepts/section-2-docker.test.ts
reviewed (prior audit): labs/ts-js/src/modules/44-fullstack-delivery-and-operations/concepts/section-3-nginx-static.test.ts
reviewed (prior audit): labs/ts-js/src/modules/44-fullstack-delivery-and-operations/concepts/section-4-reverse-proxy.test.ts
reviewed (prior audit): labs/ts-js/src/modules/44-fullstack-delivery-and-operations/concepts/section-5-runtime-config.test.ts
reviewed (prior audit): labs/ts-js/src/modules/44-fullstack-delivery-and-operations/concepts/section-6-ssr-containers.test.ts
reviewed (prior audit): labs/ts-js/src/modules/44-fullstack-delivery-and-operations/concepts/section-7-cicd.test.ts
reviewed (prior audit): labs/ts-js/src/modules/44-fullstack-delivery-and-operations/concepts/section-8-flags.test.ts
reviewed (prior audit): labs/ts-js/src/modules/44-fullstack-delivery-and-operations/concepts/topology-model.ts
reviewed (prior audit): labs/ts-js/src/modules/44-fullstack-delivery-and-operations/concepts/trace-context.ts
reviewed (prior audit): labs/ts-js/src/modules/44-fullstack-delivery-and-operations/exercise-1-release-publisher/a/publisher.ts
reviewed (prior audit): labs/ts-js/src/modules/44-fullstack-delivery-and-operations/exercise-1-release-publisher/b/publisher.ts
reviewed (prior audit): labs/ts-js/src/modules/44-fullstack-delivery-and-operations/exercise-1-release-publisher/exercise-1.test.ts
reviewed (prior audit): labs/ts-js/src/modules/44-fullstack-delivery-and-operations/exercise-1-release-publisher/publisher.ts
reviewed (prior audit): labs/ts-js/src/modules/45-frontend-system-design-method/concepts/board-model.ts
reviewed (prior audit): labs/ts-js/src/modules/45-frontend-system-design-method/concepts/budget.ts
reviewed (prior audit): labs/ts-js/src/modules/45-frontend-system-design-method/concepts/cache-layers.ts
reviewed (prior audit): labs/ts-js/src/modules/45-frontend-system-design-method/concepts/consistency.ts
reviewed (prior audit): labs/ts-js/src/modules/45-frontend-system-design-method/concepts/estimate.ts
reviewed (prior audit): labs/ts-js/src/modules/45-frontend-system-design-method/concepts/section-2-time-plan.test.ts
reviewed (prior audit): labs/ts-js/src/modules/45-frontend-system-design-method/concepts/section-3-estimates.test.ts
reviewed (prior audit): labs/ts-js/src/modules/45-frontend-system-design-method/concepts/section-4-board-model.test.ts
reviewed (prior audit): labs/ts-js/src/modules/45-frontend-system-design-method/concepts/section-5-state-placement.test.ts
reviewed (prior audit): labs/ts-js/src/modules/45-frontend-system-design-method/concepts/section-6-budget.test.ts
reviewed (prior audit): labs/ts-js/src/modules/45-frontend-system-design-method/concepts/section-7-cache-layers.test.ts
reviewed (prior audit): labs/ts-js/src/modules/45-frontend-system-design-method/concepts/section-8-consistency.test.ts
reviewed (prior audit): labs/ts-js/src/modules/45-frontend-system-design-method/concepts/state-placement.ts
reviewed (prior audit): labs/ts-js/src/modules/45-frontend-system-design-method/concepts/time-plan.ts
reviewed (prior audit): labs/ts-js/src/modules/45-frontend-system-design-method/exercise-1-screen-estimate/a/estimate-screen.ts
reviewed (prior audit): labs/ts-js/src/modules/45-frontend-system-design-method/exercise-1-screen-estimate/b/estimate-screen.ts
reviewed (prior audit): labs/ts-js/src/modules/45-frontend-system-design-method/exercise-1-screen-estimate/exercise-1.test.ts
reviewed (prior audit): labs/ts-js/src/modules/45-frontend-system-design-method/exercise-1-screen-estimate/screen.ts
reviewed (prior audit): labs/ts-js/src/modules/45-frontend-system-design-method/exercise-2-board-sync/a/board-sync.ts
reviewed (prior audit): labs/ts-js/src/modules/45-frontend-system-design-method/exercise-2-board-sync/b/board-sync.ts
reviewed (prior audit): labs/ts-js/src/modules/45-frontend-system-design-method/exercise-2-board-sync/board-sync.ts
reviewed (prior audit): labs/ts-js/src/modules/45-frontend-system-design-method/exercise-2-board-sync/exercise-2.test.ts
reviewed (prior audit): labs/ts-js/src/modules/46-system-design-case-studies/concepts/aggregator.ts
reviewed (prior audit): labs/ts-js/src/modules/46-system-design-case-studies/concepts/feed-pager.ts
reviewed (prior audit): labs/ts-js/src/modules/46-system-design-case-studies/concepts/grid-query.ts
reviewed (prior audit): labs/ts-js/src/modules/46-system-design-case-studies/concepts/prefix-cache.ts
reviewed (prior audit): labs/ts-js/src/modules/46-system-design-case-studies/concepts/presence.ts
reviewed (prior audit): labs/ts-js/src/modules/46-system-design-case-studies/concepts/section-2-prefix-cache.test.ts
reviewed (prior audit): labs/ts-js/src/modules/46-system-design-case-studies/concepts/section-3-feed-pager.test.ts
reviewed (prior audit): labs/ts-js/src/modules/46-system-design-case-studies/concepts/section-4-grid-query.test.ts
reviewed (prior audit): labs/ts-js/src/modules/46-system-design-case-studies/concepts/section-5-wizard.test.ts
reviewed (prior audit): labs/ts-js/src/modules/46-system-design-case-studies/concepts/section-6-aggregator.test.ts
reviewed (prior audit): labs/ts-js/src/modules/46-system-design-case-studies/concepts/section-7-notifications.test.ts
reviewed (prior audit): labs/ts-js/src/modules/46-system-design-case-studies/concepts/section-8-transfer.test.ts
reviewed (prior audit): labs/ts-js/src/modules/46-system-design-case-studies/concepts/transfer.ts
reviewed (prior audit): labs/ts-js/src/modules/46-system-design-case-studies/concepts/unread.ts
reviewed (prior audit): labs/ts-js/src/modules/46-system-design-case-studies/concepts/wizard.ts
reviewed (prior audit): labs/ts-js/src/modules/46-system-design-case-studies/exercise-1-feed-session/a/feed-session.ts
reviewed (prior audit): labs/ts-js/src/modules/46-system-design-case-studies/exercise-1-feed-session/b/feed-session.ts
reviewed (prior audit): labs/ts-js/src/modules/46-system-design-case-studies/exercise-1-feed-session/exercise-1.test.ts
reviewed (prior audit): labs/ts-js/src/modules/46-system-design-case-studies/exercise-1-feed-session/feed-session.ts
reviewed (prior audit): labs/ts-js/src/modules/46-system-design-case-studies/exercise-2-grid-selection/a/selection.ts
reviewed (prior audit): labs/ts-js/src/modules/46-system-design-case-studies/exercise-2-grid-selection/b/selection.ts
reviewed (prior audit): labs/ts-js/src/modules/46-system-design-case-studies/exercise-2-grid-selection/exercise-2.test.ts
reviewed (prior audit): labs/ts-js/src/modules/46-system-design-case-studies/exercise-2-grid-selection/selection.ts
reviewed (prior audit): labs/ts-js/src/modules/46-system-design-case-studies/exercise-3-draft-saver/a/draft-saver.ts
reviewed (prior audit): labs/ts-js/src/modules/46-system-design-case-studies/exercise-3-draft-saver/b/draft-saver.ts
reviewed (prior audit): labs/ts-js/src/modules/46-system-design-case-studies/exercise-3-draft-saver/draft-saver.ts
reviewed (prior audit): labs/ts-js/src/modules/46-system-design-case-studies/exercise-3-draft-saver/exercise-3.test.ts
reviewed (prior audit): labs/ts-js/src/modules/46-system-design-case-studies/exercise-4-dashboard-hub/a/hub.ts
reviewed (prior audit): labs/ts-js/src/modules/46-system-design-case-studies/exercise-4-dashboard-hub/b/hub.ts
reviewed (prior audit): labs/ts-js/src/modules/46-system-design-case-studies/exercise-4-dashboard-hub/exercise-4.test.ts
reviewed (prior audit): labs/ts-js/src/modules/46-system-design-case-studies/exercise-4-dashboard-hub/hub.ts
reviewed (prior audit): labs/ts-js/src/modules/46-system-design-case-studies/exercise-5-transfer-client/a/transfer-client.ts
reviewed (prior audit): labs/ts-js/src/modules/46-system-design-case-studies/exercise-5-transfer-client/b/transfer-client.ts
reviewed (prior audit): labs/ts-js/src/modules/46-system-design-case-studies/exercise-5-transfer-client/exercise-5.test.ts
reviewed (prior audit): labs/ts-js/src/modules/46-system-design-case-studies/exercise-5-transfer-client/transfer-client.ts
reviewed (prior audit): labs/ts-js/src/modules/47-behavioral-and-interview-craft/exercise-1-legacy-refactor/a/price-label.ts
reviewed (prior audit): labs/ts-js/src/modules/47-behavioral-and-interview-craft/exercise-1-legacy-refactor/b/price-label.ts
reviewed (prior audit): labs/ts-js/src/modules/47-behavioral-and-interview-craft/exercise-1-legacy-refactor/exercise-1.test.ts
reviewed (prior audit): labs/ts-js/src/modules/47-behavioral-and-interview-craft/exercise-1-legacy-refactor/legacy/price-label.ts
reviewed (prior audit): labs/ts-js/src/modules/47-behavioral-and-interview-craft/exercise-2-live-list/a/list-core.ts
reviewed (prior audit): labs/ts-js/src/modules/47-behavioral-and-interview-craft/exercise-2-live-list/b/list-core.ts
reviewed (prior audit): labs/ts-js/src/modules/47-behavioral-and-interview-craft/exercise-2-live-list/exercise-2.test.ts
reviewed (prior audit): labs/ts-js/src/modules/47-behavioral-and-interview-craft/exercise-2-live-list/list-core.ts
reviewed (prior audit): labs/ts-js/src/outputs/01-js-values-types-coercion/coercion.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/01-js-values-types-coercion/equality.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/01-js-values-types-coercion/nullish.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/01-js-values-types-coercion/numbers.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/01-js-values-types-coercion/run-snippet.ts
reviewed (prior audit): labs/ts-js/src/outputs/01-js-values-types-coercion/sections.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/01-js-values-types-coercion/strings-symbols.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/01-js-values-types-coercion/types.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/02-js-scope-closures-this/q02-class-fields-strict.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/02-js-scope-closures-this/q02-closures.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/02-js-scope-closures-this/q02-hoisting-tdz.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/02-js-scope-closures-this/q02-this-binding.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/03-js-objects-prototypes-classes/classes.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/03-js-objects-prototypes-classes/copying-arrays.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/03-js-objects-prototypes-classes/descriptors-prototypes.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/03-js-objects-prototypes-classes/iteration.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/03-js-objects-prototypes-classes/proxy.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/04-js-async-event-loop/async-await.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/04-js-async-event-loop/cancellation.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/04-js-async-event-loop/event-loop.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/04-js-async-event-loop/node-event-loop.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/04-js-async-event-loop/promises.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/05-js-modules-memory-modern-features/errors-dispose.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/05-js-modules-memory-modern-features/fixtures/q05-01/main.mjs
reviewed (prior audit): labs/ts-js/src/outputs/05-js-modules-memory-modern-features/fixtures/q05-02/counter.mjs
reviewed (prior audit): labs/ts-js/src/outputs/05-js-modules-memory-modern-features/fixtures/q05-02/main.mjs
reviewed (prior audit): labs/ts-js/src/outputs/05-js-modules-memory-modern-features/fixtures/q05-03/app.mjs
reviewed (prior audit): labs/ts-js/src/outputs/05-js-modules-memory-modern-features/fixtures/q05-03/config.mjs
reviewed (prior audit): labs/ts-js/src/outputs/05-js-modules-memory-modern-features/fixtures/q05-03/logger.mjs
reviewed (prior audit): labs/ts-js/src/outputs/05-js-modules-memory-modern-features/fixtures/q05-03/main.mjs
reviewed (prior audit): labs/ts-js/src/outputs/05-js-modules-memory-modern-features/fixtures/q05-04/fixed/main.mjs
reviewed (prior audit): labs/ts-js/src/outputs/05-js-modules-memory-modern-features/fixtures/q05-04/fixed/order.mjs
reviewed (prior audit): labs/ts-js/src/outputs/05-js-modules-memory-modern-features/fixtures/q05-04/fixed/user.mjs
reviewed (prior audit): labs/ts-js/src/outputs/05-js-modules-memory-modern-features/fixtures/q05-04/main-order-first.mjs
reviewed (prior audit): labs/ts-js/src/outputs/05-js-modules-memory-modern-features/fixtures/q05-04/main.mjs
reviewed (prior audit): labs/ts-js/src/outputs/05-js-modules-memory-modern-features/fixtures/q05-04/order.mjs
reviewed (prior audit): labs/ts-js/src/outputs/05-js-modules-memory-modern-features/fixtures/q05-04/user.mjs
reviewed (prior audit): labs/ts-js/src/outputs/05-js-modules-memory-modern-features/fixtures/q05-06/legacy.cjs
reviewed (prior audit): labs/ts-js/src/outputs/05-js-modules-memory-modern-features/fixtures/q05-06/main.cjs
reviewed (prior audit): labs/ts-js/src/outputs/05-js-modules-memory-modern-features/fixtures/q05-06/main.mjs
reviewed (prior audit): labs/ts-js/src/outputs/05-js-modules-memory-modern-features/fixtures/q05-06/modern.mjs
reviewed (prior audit): labs/ts-js/src/outputs/05-js-modules-memory-modern-features/fixtures/q05-10/main.mjs
reviewed (prior audit): labs/ts-js/src/outputs/05-js-modules-memory-modern-features/fixtures/q05-10/settings.json
reviewed (prior audit): labs/ts-js/src/outputs/05-js-modules-memory-modern-features/fixtures/q05-14/main.mjs
reviewed (prior audit): labs/ts-js/src/outputs/05-js-modules-memory-modern-features/fixtures/q05-17/main.mjs
reviewed (prior audit): labs/ts-js/src/outputs/05-js-modules-memory-modern-features/fixtures/q05-19/main.mjs
reviewed (prior audit): labs/ts-js/src/outputs/05-js-modules-memory-modern-features/lazy.ts
reviewed (prior audit): labs/ts-js/src/outputs/05-js-modules-memory-modern-features/lru.ts
reviewed (prior audit): labs/ts-js/src/outputs/05-js-modules-memory-modern-features/meta-memory.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/05-js-modules-memory-modern-features/modules.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/06-ts-type-system-essentials/basics.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/06-ts-type-system-essentials/config-declarations.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/06-ts-type-system-essentials/fixtures/q06-04.ts
reviewed (prior audit): labs/ts-js/src/outputs/06-ts-type-system-essentials/fixtures/q06-07.ts
reviewed (prior audit): labs/ts-js/src/outputs/06-ts-type-system-essentials/fixtures/q06-12.ts
reviewed (prior audit): labs/ts-js/src/outputs/06-ts-type-system-essentials/fixtures/q06-16.ts
reviewed (prior audit): labs/ts-js/src/outputs/06-ts-type-system-essentials/fixtures/q06-21.ts
reviewed (prior audit): labs/ts-js/src/outputs/06-ts-type-system-essentials/unions-special-enums.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/07-ts-advanced-types-and-decorators/decorators-zod-angular.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/07-ts-advanced-types-and-decorators/fixtures/q07-02.ts
reviewed (prior audit): labs/ts-js/src/outputs/07-ts-advanced-types-and-decorators/fixtures/q07-03.ts
reviewed (prior audit): labs/ts-js/src/outputs/07-ts-advanced-types-and-decorators/fixtures/q07-06.ts
reviewed (prior audit): labs/ts-js/src/outputs/07-ts-advanced-types-and-decorators/fixtures/q07-07.ts
reviewed (prior audit): labs/ts-js/src/outputs/07-ts-advanced-types-and-decorators/fixtures/q07-11.ts
reviewed (prior audit): labs/ts-js/src/outputs/07-ts-advanced-types-and-decorators/fixtures/q07-15.ts
reviewed (prior audit): labs/ts-js/src/outputs/07-ts-advanced-types-and-decorators/fixtures/q07-17.ts
reviewed (prior audit): labs/ts-js/src/outputs/07-ts-advanced-types-and-decorators/generics-and-computed-types.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/07-ts-advanced-types-and-decorators/utility-variance-brands-decorators.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/08-browser-rendering-dom-events/events-and-shadow.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/08-browser-rendering-dom-events/rendering-and-dom.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/09-web-networking-storage-security/conditional-get.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/09-web-networking-storage-security/cookies.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/09-web-networking-storage-security/fetch-and-responses.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/10-css-essentials/cascade.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/10-css-essentials/units-and-custom-properties.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/11-accessibility/focus.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/11-accessibility/live-region-and-name.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/40-framework-comparisons/q40-04.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/41-fullstack-api-contracts/q41-19.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/42-fullstack-authentication/q42-05.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/42-fullstack-authentication/q42-14.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/43-fullstack-realtime/q43-04.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/43-fullstack-realtime/q43-12.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/44-fullstack-delivery-and-operations/q44-05.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/44-fullstack-delivery-and-operations/q44-10.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/44-fullstack-delivery-and-operations/q44-20.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/45-frontend-system-design-method/q45-07.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/45-frontend-system-design-method/q45-09.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/45-frontend-system-design-method/q45-14.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/46-system-design-case-studies/q46-03.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/46-system-design-case-studies/q46-06.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/46-system-design-case-studies/q46-11.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/46-system-design-case-studies/q46-13.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/46-system-design-case-studies/q46-17.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/46-system-design-case-studies/q46-20.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/46-system-design-case-studies/q46-26.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/47-behavioral-and-interview-craft/q47-09.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/capture.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/capture.ts
reviewed (prior audit): labs/ts-js/src/outputs/fixtures-run-node/hello.mjs
reviewed (prior audit): labs/ts-js/src/outputs/run-node.test.ts
reviewed (prior audit): labs/ts-js/src/outputs/run-node.ts
reviewed (prior audit): labs/ts-js/tsconfig.json
reviewed (prior audit): labs/ts-js/vitest.config.ts
reviewed (prior audit): modules/01-js-values-types-coercion.md
reviewed (prior audit): modules/02-js-scope-closures-this.md
reviewed (prior audit): modules/03-js-objects-prototypes-classes.md
reviewed (prior audit): modules/04-js-async-event-loop.md
reviewed (prior audit): modules/05-js-modules-memory-modern-features.md
reviewed (prior audit): modules/06-ts-type-system-essentials.md
reviewed (prior audit): modules/07-ts-advanced-types-and-decorators.md
reviewed (prior audit): modules/08-browser-rendering-dom-events.md
reviewed (prior audit): modules/09-web-networking-storage-security.md
reviewed (prior audit): modules/10-css-essentials.md
reviewed (prior audit): modules/11-accessibility.md
reviewed (prior audit): modules/12-angular-how-it-works.md
reviewed (prior audit): modules/13-components-and-templates.md
reviewed (prior audit): modules/14-directives-and-pipes.md
reviewed (prior audit): modules/15-standalone-and-ngmodules.md
reviewed (prior audit): modules/16-dependency-injection.md
reviewed (prior audit): modules/17-signals.md
reviewed (prior audit): modules/18-control-flow-and-defer.md
reviewed (prior audit): modules/19-component-communication-and-projection.md
reviewed (prior audit): modules/20-lifecycle-and-render-hooks.md
reviewed (prior audit): modules/21-change-detection.md
reviewed (prior audit): modules/22-rxjs-foundations.md
reviewed (prior audit): modules/23-rxjs-in-depth.md
reviewed (prior audit): modules/24-routing.md
reviewed (prior audit): modules/25-forms-reactive-and-template-driven.md
reviewed (prior audit): modules/26-signal-forms.md
reviewed (prior audit): modules/27-http-client.md
reviewed (prior audit): modules/28-state-management.md
reviewed (prior audit): modules/29-testing-angular.md
reviewed (prior audit): modules/30-e2e-and-testing-strategy.md
reviewed (prior audit): modules/31-performance.md
reviewed (prior audit): modules/32-ssr-ssg-hydration.md
reviewed (prior audit): modules/33-security.md
reviewed (prior audit): modules/34-i18n.md
reviewed (prior audit): modules/35-animations.md
reviewed (prior audit): modules/36-material-and-cdk.md
reviewed (prior audit): modules/37-elements-pwa-errors-ecosystem.md
reviewed (prior audit): modules/38-architecture-and-production-structure.md
reviewed (prior audit): modules/39-version-history-and-migrations.md
reviewed (prior audit): modules/40-framework-comparisons.md
reviewed (prior audit): modules/41-fullstack-api-contracts.md
reviewed (prior audit): modules/42-fullstack-authentication.md
reviewed (prior audit): modules/43-fullstack-realtime.md
reviewed (prior audit): modules/44-fullstack-delivery-and-operations.md
reviewed (prior audit): modules/45-frontend-system-design-method.md
reviewed (prior audit): modules/46-system-design-case-studies.md
reviewed (prior audit): modules/47-behavioral-and-interview-craft.md
```

</details>

Excluded tracked generated lockfiles: `labs/angular/package-lock.json`, `labs/e2e/package-lock.json`, `labs/ts-js/package-lock.json`. Generated/vendor content excluded: `node_modules/`, `dist/`, `out-tsc/`, `.angular/`, `coverage/`, `test-results/`, `playwright-report/`, `blob-report/`, `.vitest*/`, `*.tsbuildinfo`, `.DS_Store`; no generated dependency/build contents are presented as manually reviewed.

Coverage total: 2070 existing tracked files recorded as reviewed, 3 generated lockfiles excluded, plus this new report reviewed during recovery.
