# Progress

Human-facing dashboard, one row per module. Updated by `CLOSE` tasks (and by bootstrap B2). The job's working memory is in `_meta/`: [STATE](_meta/STATE.md) (where the job stands), [TASKS](_meta/TASKS.md) (queue), [ROADMAP](_meta/ROADMAP.md) (module order), [LOG](_meta/LOG.md) (session log). Session protocol: [RUN](_meta/RUN.md).

**Last updated:** 2026-10-06 (REVIEW-M05…M08 and their FIX tasks, session S20261006-1733-claudecode)

## Phases

- [x] Phase 0: versions and docs → [VERSIONS.md](VERSIONS.md), [SOURCES.md](SOURCES.md)
- [x] Phase 1: [SYLLABUS.md](SYLLABUS.md) and [STYLE-GUIDE.md](STYLE-GUIDE.md), approved 2026-10-03 (decisions in SYLLABUS §7)
- [x] Phase 2: labs scaffolding + pilot module 17 (approved; independent review fixed)
- [ ] Phase 3: module generation, one module at a time ([ROADMAP](_meta/ROADMAP.md)). Phase A done: modules 01–04 cross-checked, reviewed and fixed (2026-10-06). Modules 05–08 written, closed, reviewed and fixed (2026-10-06); modules 09 written, closed, reviewed and fixed (2026-10-06); next is PLAN-M10.
- [ ] Phase 4: reviews (one per module, inside each module's lifecycle)
- [ ] Phase 5: finish line (root files, cross-module review, repo README link)

**Modules done:** 10 / 47 (01–09, 17). Questions written: 238 (guide floor 600). Exercises: 35.

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
| 10 `css-essentials` | C | — | not started | 0 / 20 | 0 / 3 | — | no | — |
| 11 `accessibility` | C | — | not started | 0 / 20 | 0 / 3 | — | no | — |
| 12 `angular-how-it-works` | D | NG | not started | 0 / 28 | 0 / 4 | — | no | — |
| 13 `components-and-templates` | D | NG | not started | 0 / 30 | 0 / 5 | — | no | — |
| 14 `directives-and-pipes` | D | NG | not started | 0 / 28 | 0 / 5 | — | no | — |
| 15 `standalone-and-ngmodules` | D | NG | not started | 0 / 25 | 0 / 4 | — | no | — |
| 16 `dependency-injection` | D | NG | not started | 0 / 40 | 0 / 6 | — | no | — |
| [17 signals](modules/17-signals.md) | D | NG | done (pilot) | 40 / 40 | 6 / 6 | yes (angular + ts-js) | yes | yes (2026-10-03, all findings fixed) |
| 18 `control-flow-and-defer` | D | NG | not started | 0 / 26 | 0 / 4 | — | no | — |
| 19 `component-communication-and-projection` | D | NG | not started | 0 / 30 | 0 / 5 | — | no | — |
| 20 `lifecycle-and-render-hooks` | D | NG | not started | 0 / 25 | 0 / 4 | — | no | — |
| 21 `change-detection` | D | NG | not started | 0 / 38 | 0 / 6 | — | no | — |
| 22 `rxjs-foundations` | D | NG | not started | 0 / 35 | 0 / 5 | — | no | — |
| 23 `rxjs-in-depth` | D | NG | not started | 0 / 38 | 0 / 6 | — | no | — |
| 24 `routing` | D | NG | not started | 0 / 35 | 0 / 6 | — | no | — |
| 25 `forms-reactive-and-template-driven` | D | NG | not started | 0 / 35 | 0 / 6 | — | no | — |
| 26 `signal-forms` | D | NG | not started | 0 / 28 | 0 / 5 | — | no | — |
| 27 `http-client` | D | NG | not started | 0 / 35 | 0 / 6 | — | no | — |
| 28 `state-management` | D | NG | not started | 0 / 35 | 0 / 5 | — | no | — |
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
