# Progress

Human-facing dashboard, one row per module. Updated by `CLOSE` tasks (and by bootstrap B2). The job's working memory is in `_meta/`: [STATE](_meta/STATE.md) (where the job stands), [TASKS](_meta/TASKS.md) (queue), [ROADMAP](_meta/ROADMAP.md) (module order), [LOG](_meta/LOG.md) (session log). Session protocol: [RUN](_meta/RUN.md).

**Last updated:** 2026-10-11 (CLOSE-M26, session S20261011-1752-claudecode)

## Phases

- [x] Phase 0: versions and docs → [VERSIONS.md](VERSIONS.md), [SOURCES.md](SOURCES.md)
- [x] Phase 1: [SYLLABUS.md](SYLLABUS.md) and [STYLE-GUIDE.md](STYLE-GUIDE.md), approved 2026-10-03 (decisions in SYLLABUS §7)
- [x] Phase 2: labs scaffolding + pilot module 17 (approved; independent review fixed)
- [ ] Phase 3: module generation, one module at a time ([ROADMAP](_meta/ROADMAP.md)). Phase A done: modules 01–04 cross-checked, reviewed and fixed (2026-10-06). Modules 05–08 written, closed, reviewed and fixed (2026-10-06); module 09 written, closed, reviewed and fixed (2026-10-06); modules 10 and 11 written, closed, reviewed and fixed (2026-10-07); module 12 written, closed, reviewed and fixed (2026-10-07); module 13 written, closed, reviewed and fixed (2026-10-07); module 14 written, closed, reviewed and fixed (2026-10-08); module 16 written, closed, reviewed and fixed (2026-10-08); module 15 written and closed (2026-10-08), REVIEW-M15 next (ROADMAP row 12). Module 20 written and closed (2026-10-09), REVIEW-M20 next (ROADMAP row 15). Module 21 written and closed (2026-10-09), REVIEW-M21 next (ROADMAP row 16); its bank has 35 questions and not the ceiling of 38 because the topic is exhausted at 35: the candidates that the reactive graph (17), hook order and the `NG0100` matrix (20), DevTools basics (12), the `async` pipe (14) and projected content (19) own were dropped, and the ceiling is an upper limit, not a quota. Module 22 written and closed (2026-10-09), REVIEW-M22 next (ROADMAP row 17); its bank has 34 questions and not the ceiling of 35 because the topic is exhausted at 34: the candidates that promises and `AbortController` (04), the `async` pipe (14), `toSignal` and the `BehaviorSubject` migration (17), the `Subject` bus (19), `takeUntilDestroyed` (20) and higher-order mapping, errors, `shareReplay` and schedulers (23) own were dropped, and the ceiling is an upper limit, not a quota.
- [ ] Phase 4: reviews (one per module, inside each module's lifecycle)
- [ ] Phase 5: finish line (root files, cross-module review, repo README link)

**Modules done:** 27 / 47 reviewed (01–27); module 28 closed, REVIEW-M28 next. Questions written: 771 (guide floor 600). Exercises: 128. Module 25 stops at 34 of 35 questions: testing forms is module 29's. Module 26 is at its 28-question ceiling. Module 27 stops at 34 of 35 questions: a stand-alone "what is the SSR transfer cache" question belongs to module 32, so §6 covers it in prose and Q27.21 weighs it against the other caches. Module 28 stops at 34 of 35 questions: a second `BehaviorSubject` question would repeat Q17.40 and Q22.18.

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
| [28 state-management](modules/28-state-management.md) | D | NG | done | 34 / 35 | 5 / 5 | yes (angular) | yes (CLOSE-M28, 2026-10-13; 22,438 prose words) | no |
| 29 `testing-angular` | D | NG | not started | 0 / 35 | 0 / 6 | — | no | — |
| 30 `e2e-and-testing-strategy` | D | — | not started | 0 / 18 | 0 / 3 | — | no | — |
| 31 `performance` | D | NG | not started | 0 / 30 | 0 / 5 | — | no | — |
| 32 `ssr-ssg-hydration` | D | NG | not started | 0 / 30 | 0 / 4 | — | no | — |
| 33 `security` | D | NG | not started | 0 / 30 | 0 / 4 | — | no | — |
| 34 `i18n` | D | NG | not started | 0 / 25 | 0 / 4 | — | no | — |
| 35 `animations` | D | NG | not started | 0 / 25 | 0 / 4 | — | no | — |
| 36 `material-and-cdk` | D | NG | not started | 0 / 25 | 0 / 4 | — | no | — |
| 37 `elements-pwa-errors-ecosystem` | D | NG | not started | 0 / 25 | 0 / 4 | — | no | — |
| 38 `architecture-and-production-structure` | D | NG | not started | 0 / 30 | 0 / 4 | — | no | — |
| 39 `version-history-and-migrations` | D | NG | not started | 0 / 25 | 0 / 4 | — | no | — |
| 40 `framework-comparisons` | D | — | not started | 0 / 16 | 0 / 2 | — | no | — |
| 41 `fullstack-api-contracts` | E | — | not started | 0 / 32 | 0 / 5 | — | no | — |
| 42 `fullstack-authentication` | E | — | not started | 0 / 38 | 0 / 5 | — | no | — |
| 43 `fullstack-realtime` | E | — | not started | 0 / 24 | 0 / 3 | — | no | — |
| 44 `fullstack-delivery-and-operations` | E | — | not started | 0 / 30 | 0 / 4 | — | no | — |
| 45 `frontend-system-design-method` | F | — | not started | 0 / 18 | 0 / 2 | — | no | — |
| 46 `system-design-case-studies` | F | — | not started | 0 / 30 | 0 / 6 | — | no | — |
| 47 `behavioral-and-interview-craft` | G | — | not started | 0 / 15 | 0 / 2 | — | no | — |

## Last full verification

2026-10-05, B1 baseline (Node 24.21.0): `labs/ts-js` `npm test` 168/168; `labs/angular` `ng build` OK, `ng test` 65/65; link check 0 missing anchors, 167 links to planned files. Details in [LOG](_meta/LOG.md).

## Notes carried over from earlier sessions

- Modules 01–04 prose is over the 8–10k-word cap (about 11–13k). They are not trimmed for length; only a review finding of redundancy justifies a cut.
- Vite's oxc parser rejects `var x` plus `function x(){}` at function top level (legal JS); the Q02.02 snippet is built with `new Function` for that reason.
- Labs run on Node 24 (`export PATH=/opt/homebrew/opt/node@24/bin:$PATH`); the system default Node is 26 and stays unchanged.
- Module 24 stops at 34 of the 35-question ceiling: "design the routing of a large app" belongs to module 38's architecture checklist, so it was not written here.
- Module 23 stops at 36 of the 38-question ceiling: every neighbour-owned candidate was dropped or folded into a follow-up, and two planned questions (`outputFromObservable` with `pendingUntilEvent`; a service caching config with `shareReplay(1)`) were folded into follow-ups of Q23.24/Q23.26 and Q23.17-Q23.19 because they repeated them (`_meta/modules/M23.md`).
