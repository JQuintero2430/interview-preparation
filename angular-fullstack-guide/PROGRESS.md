# Progress

Human-facing dashboard, one row per module. Updated by `CLOSE` tasks (and by bootstrap B2). The job's working memory is in `_meta/`: [STATE](_meta/STATE.md) (where the job stands), [TASKS](_meta/TASKS.md) (queue), [ROADMAP](_meta/ROADMAP.md) (module order), [LOG](_meta/LOG.md) (session log). Session protocol: [RUN](_meta/RUN.md).

**Last updated:** 2026-10-23 (CLOSE-M47)

## Phases

- [x] Phase 0: versions and docs → [VERSIONS.md](VERSIONS.md), [SOURCES.md](SOURCES.md)
- [x] Phase 1: [SYLLABUS.md](SYLLABUS.md) and [STYLE-GUIDE.md](STYLE-GUIDE.md), approved 2026-10-03 (decisions in SYLLABUS §7)
- [x] Phase 2: labs scaffolding + pilot module 17 (approved; independent review fixed)
- [ ] Phase 3: module generation, one module at a time ([ROADMAP](_meta/ROADMAP.md)). Phase A done: modules 01–04 cross-checked, reviewed and fixed (2026-10-06). Modules 05–08 written, closed, reviewed and fixed (2026-10-06); module 09 written, closed, reviewed and fixed (2026-10-06); modules 10 and 11 written, closed, reviewed and fixed (2026-10-07); module 12 written, closed, reviewed and fixed (2026-10-07); module 13 written, closed, reviewed and fixed (2026-10-07); module 14 written, closed, reviewed and fixed (2026-10-08); module 16 written, closed, reviewed and fixed (2026-10-08); module 15 written and closed (2026-10-08), REVIEW-M15 next (ROADMAP row 12). Module 20 written and closed (2026-10-09), REVIEW-M20 next (ROADMAP row 15). Module 21 written and closed (2026-10-09), REVIEW-M21 next (ROADMAP row 16); its bank has 35 questions and not the ceiling of 38 because the topic is exhausted at 35: the candidates that the reactive graph (17), hook order and the `NG0100` matrix (20), DevTools basics (12), the `async` pipe (14) and projected content (19) own were dropped, and the ceiling is an upper limit, not a quota. Module 22 written and closed (2026-10-09), REVIEW-M22 next (ROADMAP row 17); its bank has 34 questions and not the ceiling of 35 because the topic is exhausted at 34: the candidates that promises and `AbortController` (04), the `async` pipe (14), `toSignal` and the `BehaviorSubject` migration (17), the `Subject` bus (19), `takeUntilDestroyed` (20) and higher-order mapping, errors, `shareReplay` and schedulers (23) own were dropped, and the ceiling is an upper limit, not a quota.
- [x] Phase 4: reviews (one per module, inside each module's lifecycle)
- [x] Phase 5: finish line (root files, cross-module review, repo README link): done 2026-10-24 (FINAL-VERIFY, S20261024-1224-claudecode). Root files: [README.md](README.md), [QUESTION-INDEX.md](QUESTION-INDEX.md), [GLOSSARY.md](GLOSSARY.md), [CHEATSHEET.md](CHEATSHEET.md), [MOCK-INTERVIEWS.md](MOCK-INTERVIEWS.md).

**Modules done:** 47 / 47 reviewed and fixed (01–47; module 47 by REVIEW-M47 and FIX-M47-01..03, 2026-10-24; module 38 by REVIEW-M38 and FIX-M38-01..03, 2026-10-18; module 39 by REVIEW-M39 and FIX-M39-01..03, 2026-10-20); module 40 by REVIEW-M40 and FIX-M40-01..03, 2026-10-20; module 41 by REVIEW-M41 and FIX-M41-01..03, 2026-10-20; module 42 by REVIEW-M42 and FIX-M42-01..03, 2026-10-21; module 43 by REVIEW-M43 and FIX-M43-01..03, 2026-10-22; module 44 by REVIEW-M44 and FIX-M44-01..03, 2026-10-22; module 45 by REVIEW-M45 and FIX-M45-01..03, 2026-10-22; module 46 by REVIEW-M46 and FIX-M46-01..03, 2026-10-23. Module 47 is closed (CLOSE-M47, 2026-10-23), REVIEW-M47 next. Questions written: 1220 (guide floor 600). Exercises: 197. Module 25 stops at 34 of 35 questions: testing forms is module 29's. Module 26 is at its 28-question ceiling. Module 27 stops at 34 of 35 questions: a stand-alone "what is the SSR transfer cache" question belongs to module 32, so §6 covers it in prose and Q27.21 weighs it against the other caches. Module 28 stops at 34 of 35 questions: a second `BehaviorSubject` question would repeat Q17.40 and Q22.18. Module 29 stops at 34 of 35 questions: a 35th would repeat an owner (Q16.34 override matrix, Q18.19 `@defer` tests, Q19.26 binding functions, Q23.34 marble tests, Q27.34 the HTTP testing backend). Module 30 is at its ceilings of 18 questions and 3 exercises (lab mode: Exercise 30.2 is kept, so nothing was dropped). Module 31 stops at 27 of 30 questions, the count PLAN-M31 (`_meta/modules/M31.md`) sized. Module 32 stops at 27 of 30 questions, the count PLAN-M32 (`_meta/modules/M32.md`) sized: "`withIncrementalHydration()` in v22", "`ngSkipHydration` versus a fix" and "deployment security mistakes" are follow-ups of Q32.14, Q32.12 and Q32.25 (the security side of SSR is module 33's). Module 33 stops at 29 of 30 questions, the count PLAN-M33 (`_meta/modules/M33.md`) sized: "`Renderer2` versus `ElementRef` for DOM writes" is a follow-up of Q33.04 because module 14 owns those APIs.

## Modules

Q and Ex show `written / ceiling` (SYLLABUS §1 ceilings are upper limits, not quotas). "Closed" = CLOSE task done. "Reviewed" = independent REVIEW done and its FIX tasks closed.

| Module | Part | Kind | Status | Q | Ex | Labs green | Closed | Reviewed |
|---|---|---|---|---|---|---|---|---|
| [01 js-values-types-coercion](modules/01-js-values-types-coercion.md) | A | — | done | 22 / 22 | 3 / 3 | yes (ts-js) | yes (Phase A) | yes (REVIEW-M01, all FIX done 2026-10-06) |
| [02 js-scope-closures-this](modules/02-js-scope-closures-this.md) | A | — | done | 21 / 22 | 3 / 3 | yes (ts-js) | yes (Phase A) | yes (REVIEW-M02, all FIX done 2026-10-06) |
| [03 js-objects-prototypes-classes](modules/03-js-objects-prototypes-classes.md) | A | — | done | 22 / 22 | 3 / 3 | yes (ts-js) | yes (Phase A) | yes (REVIEW-M03, all FIX done 2026-10-06) |
| [04 js-async-event-loop](modules/04-js-async-event-loop.md) | A | — | done | 28 / 28 | 4 / 4 | yes (ts-js) | yes (Phase A) | yes (REVIEW-M04, all FIX done 2026-10-06) |
| [05 js-modules-memory-modern-features](modules/05-js-modules-memory-modern-features.md) | A | — | done | 21 / 22 | 3 / 3 | yes (ts-js) | yes (CLOSE-M05, 2026-10-06) | yes (REVIEW-M05, all FIX done 2026-10-06) |
| [06 ts-type-system-essentials](modules/06-ts-type-system-essentials.md) | B | — | done | 24 / 25 | 4 / 4 | yes (ts-js) | yes (CLOSE-M06, 2026-10-06) | yes (REVIEW-M06, all FIX done 2026-10-06) |
| [07 ts-advanced-types-and-decorators](modules/07-ts-advanced-types-and-decorators.md) | B | — | done | 20 / 25 | 3 / 4 | yes (ts-js, angular) | yes (CLOSE-M07, 2026-10-06) | yes (REVIEW-M07, all FIX done 2026-10-06) |
| [08 browser-rendering-dom-events](modules/08-browser-rendering-dom-events.md) | C | — | done | 18 / 20 | 3 / 3 | yes (ts-js, jsdom) | yes (CLOSE-M08, 2026-10-06) | yes (REVIEW-M08, all FIX done 2026-10-06) |
| [09 web-networking-storage-security](modules/09-web-networking-storage-security.md) | C | — | done | 22 / 24 | 3 / 3 | yes (ts-js, jsdom) | yes (CLOSE-M09, 2026-10-06) | yes (REVIEW-M09, all FIX done 2026-10-06) |
| [10 css-essentials](modules/10-css-essentials.md) | C | — | done | 18 / 20 | 3 / 3 | yes (ts-js, jsdom) | yes (CLOSE-M10, 2026-10-07) | yes (REVIEW-M10, all FIX done 2026-10-07) |
| [11 accessibility](modules/11-accessibility.md) | C | — | done | 19 / 20 | 3 / 3 | yes (ts-js, jsdom) | yes (CLOSE-M11, 2026-10-07) | yes (REVIEW-M11, all FIX done 2026-10-07) |
| [12 angular-how-it-works](modules/12-angular-how-it-works.md) | D | NG | done | 28 / 28 | 4 / 4 | yes (angular + ts-js) | yes (CLOSE-M12, 2026-10-07) | yes (REVIEW-M12, all FIX done 2026-10-07) |
| [13 components-and-templates](modules/13-components-and-templates.md) | D | NG | done | 30 / 30 | 5 / 5 | yes (angular + ts-js) | yes (CLOSE-M13, 2026-10-07) | yes (REVIEW-M13, all FIX done 2026-10-07) |
| [14 directives-and-pipes](modules/14-directives-and-pipes.md) | D | NG | done | 28 / 28 | 5 / 5 | yes (angular + ts-js) | yes (CLOSE-M14, 2026-10-08) | yes (REVIEW-M14, all FIX done 2026-10-08) |
| [15 standalone-and-ngmodules](modules/15-standalone-and-ngmodules.md) | D | NG | done | 25 / 25 | 4 / 4 | yes (angular + ts-js) | yes (CLOSE-M15, 2026-10-08; 16,432 prose words after FIX) | yes (REVIEW-M15, all FIX done 2026-10-08) |
| [16 dependency-injection](modules/16-dependency-injection.md) | D | NG | done | 36 / 40 | 6 / 6 | yes (angular + ts-js) | yes (CLOSE-M16, 2026-10-08) | yes (REVIEW-M16, all FIX done 2026-10-08) |
| [17 signals](modules/17-signals.md) | D | NG | done (pilot) | 40 / 40 | 6 / 6 | yes (angular + ts-js) | yes | yes (2026-10-03, all findings fixed) |
| [18 control-flow-and-defer](modules/18-control-flow-and-defer.md) | D | NG | done | 26 / 26 | 4 / 4 | yes (angular + ts-js) | yes (CLOSE-M18, 2026-10-08; 17,391 prose words after FIX) | yes (REVIEW-M18, all FIX done 2026-10-08) |
| [19 component-communication-and-projection](modules/19-component-communication-and-projection.md) | D | NG | done | 29 / 30 | 5 / 5 | yes (angular) | yes (CLOSE-M19, 2026-10-08; 17,845 prose words after FIX-M19) | yes (REVIEW-M19, all FIX done 2026-10-09) |
| [20 lifecycle-and-render-hooks](modules/20-lifecycle-and-render-hooks.md) | D | NG | done | 25 / 25 | 4 / 4 | yes (angular) | yes (CLOSE-M20, 2026-10-09; 16,182 prose words after FIX-M20) | yes (REVIEW-M20, all FIX done 2026-10-09) |
| [21 change-detection](modules/21-change-detection.md) | D | NG | done | 35 / 38 | 6 / 6 | yes (angular + ts-js) | yes (CLOSE-M21, 2026-10-09; 20,525 prose words after FIX-M21) | yes (REVIEW-M21, all FIX done 2026-10-09) |
| [22 rxjs-foundations](modules/22-rxjs-foundations.md) | D | NG | done | 34 / 35 | 5 / 5 | yes (angular) | yes (CLOSE-M22, 2026-10-09; 20,068 prose words after FIX-M22) | yes (REVIEW-M22, all FIX done 2026-10-09) |
| [23 rxjs-in-depth](modules/23-rxjs-in-depth.md) | D | NG | done | 36 / 38 | 6 / 6 | yes (angular) | yes (CLOSE-M23, 2026-10-10; 22,124 prose words after FIX) | yes (REVIEW-M23 and FIX-M23-01..05, 2026-10-10) |
| [24 routing](modules/24-routing.md) | D | NG | done | 34 / 35 | 6 / 6 | yes (angular) | yes (CLOSE-M24, 2026-10-10; 21,780 prose words after FIX) | yes (REVIEW-M24 and FIX-M24-01..03, 2026-10-10) |
| [25 forms-reactive-and-template-driven](modules/25-forms-reactive-and-template-driven.md) | D | NG | done | 34 / 35 | 6 / 6 | yes (angular) | yes (CLOSE-M25, 2026-10-11; 21,894 prose words after FIX) | yes (REVIEW-M25 and FIX-M25-01..03, 2026-10-11) |
| [26 signal-forms](modules/26-signal-forms.md) | D | NG | done | 28 / 28 | 5 / 5 | yes (angular) | yes (CLOSE-M26, 2026-10-11; 19,011 prose words after FIX) | yes (REVIEW-M26 and FIX-M26-01..04, 2026-10-11) |
| [27 http-client](modules/27-http-client.md) | D | NG | done | 34 / 35 | 6 / 6 | yes (angular) | yes (CLOSE-M27, 2026-10-13; 22,599 prose words after FIX) | yes (REVIEW-M27 and FIX-M27-01..04, 2026-10-13) |
| [28 state-management](modules/28-state-management.md) | D | NG | done | 34 / 35 | 5 / 5 | yes (angular) | yes (CLOSE-M28, 2026-10-13; 22,284 prose words after FIX) | yes (REVIEW-M28, FIX-M28-01..10, 2026-10-13) |
| [29 testing-angular](modules/29-testing-angular.md) | D | NG | done | 34 / 35 | 6 / 6 | yes (angular) | yes (CLOSE-M29, 2026-10-13; 22,874 prose words after FIX) | yes (REVIEW-M29, FIX-M29-01..03, 2026-10-13) |
| [30 e2e-and-testing-strategy](modules/30-e2e-and-testing-strategy.md) | D | — | done | 18 / 18 | 3 / 3 | yes (e2e, angular, ts-js) | yes (CLOSE-M30, 2026-10-13; 14,144 prose words after FIX) | yes (REVIEW-M30, FIX-M30-01..02, 2026-10-13) |
| [31 performance](modules/31-performance.md) | D | NG | done | 27 / 30 | 5 / 5 | yes (e2e, angular, ts-js) | yes (CLOSE-M31, 2026-10-14; 19,248 prose words after FIX) | yes (REVIEW-M31, FIX-M31-01..03, HOUSE-24, 2026-10-14) |
| [32 ssr-ssg-hydration](modules/32-ssr-ssg-hydration.md) | D | NG | done | 27 / 30 | 4 / 4 | yes (e2e, angular, ts-js after HOUSE-28) | yes (CLOSE-M32, 2026-10-15; 18,367 prose words) | no |
| [33 security](modules/33-security.md) | D | NG | done | 29 / 30 | 4 / 4 | yes (e2e, angular, ts-js) | yes (CLOSE-M33, 2026-10-15; 19,755 prose words) | no |
| [34 i18n](modules/34-i18n.md) | D | NG | done | 25 / 25 | 4 / 4 | yes (e2e, angular, ts-js) | yes (CLOSE-M34, 2026-10-15; 18,770 prose words) | yes (REVIEW-M34, FIX-M34-01..03, 2026-10-16) |
| [35 animations](modules/35-animations.md) | D | NG | done | 25 / 25 | 4 / 4 | yes (e2e, angular) | yes (CLOSE-M35, 2026-10-16; 18,834 prose words after FIX-M35-01) | yes (REVIEW-M35, FIX-M35-01..02, 2026-10-16) |
| [36 material-and-cdk](modules/36-material-and-cdk.md) | D | NG | done | 25 / 25 | 4 / 4 | yes (e2e, angular) | yes (CLOSE-M36, 2026-10-17; 19,637 prose words after FIX-M36-01) | yes (REVIEW-M36, FIX-M36-01..02, 2026-10-17) |
| [37 elements-pwa-errors-ecosystem](modules/37-elements-pwa-errors-ecosystem.md) | D | NG | done | 25 / 25 | 4 / 4 | yes (e2e, angular, ts-js) | yes (CLOSE-M37, 2026-10-17; 20,226 prose words after FIX-M37-01..02) | yes (REVIEW-M37, FIX-M37-01..03, 2026-10-17) |
| [38 architecture-and-production-structure](modules/38-architecture-and-production-structure.md) | D | NG | done | 29 / 30 | 4 / 4 | yes (angular, ts-js) | yes (CLOSE-M38, 2026-10-18; 20,030 prose words) | — |
| [39 version-history-and-migrations](modules/39-version-history-and-migrations.md) | D | NG | done | 25 / 25 | 4 / 4 | yes (angular, ts-js) | yes (CLOSE-M39, 2026-10-19; 19,449 prose words after FIX-M39-01..02) | yes (REVIEW-M39, FIX-M39-01..03, 2026-10-20) |
| [40 framework-comparisons](modules/40-framework-comparisons.md) | D | — | done | 16 / 16 | 2 / 2 | yes (ts-js) | yes (CLOSE-M40, 2026-10-20; 13,478 prose words after FIX-M40-01..02) | yes (REVIEW-M40, FIX-M40-01..03, 2026-10-20) |
| [41 fullstack-api-contracts](modules/41-fullstack-api-contracts.md) | E | NG | done | 21 / 21 | 3 / 3 | yes (angular, ts-js) | yes (CLOSE-M41, 2026-10-20; 9,600 prose words after FIX-M41-01..02) | yes (REVIEW-M41, FIX-M41-01..03, 2026-10-20) |
| [42 fullstack-authentication](modules/42-fullstack-authentication.md) | E | — | done | 23 / 23 | 3 / 3 | yes (angular, ts-js) | yes (CLOSE-M42, 2026-10-20; 9,831 prose words after FIX-M42-01..02) | yes (REVIEW-M42, FIX-M42-01..03, 2026-10-21) |
| [43 fullstack-realtime](modules/43-fullstack-realtime.md) | E | — | done | 21 / 24 | 3 / 3 | yes (angular, ts-js) | yes (CLOSE-M43, 2026-10-22; 9,423 prose words, 9,664 after FIX-M43-01..02) | yes (REVIEW-M43, FIX-M43-01..03, 2026-10-22) |
| [44 fullstack-delivery-and-operations](modules/44-fullstack-delivery-and-operations.md) | E | — | done | 21 / 30 | 3 / 4 | yes (angular, ts-js) | yes (CLOSE-M44, 2026-10-22; 9,585 prose words, 9,793 after FIX-M44-01..02) | yes (REVIEW-M44, FIX-M44-01..03, 2026-10-22) |
| [45 frontend-system-design-method](modules/45-frontend-system-design-method.md) | F | — | done | 17 / 18 | 2 / 2 | yes (ts-js) | yes (CLOSE-M45, 2026-10-22; 8,242 prose words after FIX-M45) | yes (REVIEW-M45, all FIX done 2026-10-22) |
| [46 system-design-case-studies](modules/46-system-design-case-studies.md) | F | — | done | 26 / 30 | 5 / 6 | yes (ts-js) | yes (CLOSE-M46, 2026-10-23; 14,474 prose words, 14,588 after FIX-M46-01..02) | yes (REVIEW-M46, FIX-M46-01..03, 2026-10-23) |
| [47 behavioral-and-interview-craft](modules/47-behavioral-and-interview-craft.md) | G | — | done | 15 / 15 | 2 / 2 | yes (ts-js) | yes (CLOSE-M47, 2026-10-23; 9,024 prose words, 9,209 after FIX-M47-01..02) | yes (REVIEW-M47, FIX-M47-01..03, 2026-10-24) |

## Prose cap exceptions

Modules over the 10,000-word prose cap that Jorge ruled may stay up to their own cap (read by `labs/tools/module-stats.mjs`).

| Module | Cap | Ruled | Reason |
|---|---|---|---|
| 01 | 15500 | 2026-10-24 | J1 option C; RUN §8: not trimmed for length |
| 02 | 14000 | 2026-10-24 | J1 option C; RUN §8: not trimmed for length |
| 03 | 16500 | 2026-10-24 | J1 option C; RUN §8: not trimmed for length |
| 04 | 15500 | 2026-10-24 | J1 option C; RUN §8: not trimmed for length |
| 05 | 14000 | 2026-10-24 | J1 option C; RUN §8: not trimmed for length |
| 06 | 13500 | 2026-10-24 | J1 option C; RUN §8: not trimmed for length |

## Last full verification

2026-10-05, B1 baseline (Node 24.21.0): `labs/ts-js` `npm test` 168/168; `labs/angular` `ng build` OK, `ng test` 65/65; link check 0 missing anchors, 167 links to planned files. Details in [LOG](_meta/LOG.md).

## Notes carried over from earlier sessions

- Modules 01–04 prose is over the 8–10k-word cap (about 11–13k). They are not trimmed for length; only a review finding of redundancy justifies a cut.
- Vite's oxc parser rejects `var x` plus `function x(){}` at function top level (legal JS); the Q02.02 snippet is built with `new Function` for that reason.
- Labs run on Node 24 (`export PATH=/opt/homebrew/opt/node@24/bin:$PATH`); the system default Node is 26 and stays unchanged.
- Module 24 stops at 34 of the 35-question ceiling: "design the routing of a large app" belongs to module 38's architecture checklist, so it was not written here.
- Module 23 stops at 36 of the 38-question ceiling: every neighbour-owned candidate was dropped or folded into a follow-up, and two planned questions (`outputFromObservable` with `pendingUntilEvent`; a service caching config with `shareReplay(1)`) were folded into follow-ups of Q23.24/Q23.26 and Q23.17-Q23.19 because they repeated them (`_meta/modules/M23.md`).
