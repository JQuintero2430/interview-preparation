# ROADMAP

Source: SYLLABUS §6. The parallel batches are dissolved: one module at a time, in this order. Planning the next module (`PLAN-Mxx`) starts only when the queue in TASKS.md has no `todo` task left (RUN.md §4.5). Per-module targets (Q / Ex ceilings, prerequisites, kind) are in SYLLABUS §1; topic checklists in SYLLABUS §4.

## Phase A: close out what exists

| Step | Modules | What remains |
|---|---|---|
| A1 | 01, 02, 03, 04 | Output answers cross-checked against test assertions, sources + glossary harvest, independent REVIEW, FIX tasks (see TASKS.md) |
| A2 | 17 (pilot) | Already reviewed; only FIX tasks that B3 (QUALITY-BAR) produces |

## Phase B: write the remaining modules, in order

| Order | Module | Part | Kind | Status |
|---|---|---|---|---|
| 1 | 05 `js-modules-memory-modern-features` | A | — | done (CLOSE-M05, REVIEW-M05, FIX-M05 all done 2026-10-06) |
| 2 | 06 `ts-type-system-essentials` | B | — | done (CLOSE-M06, REVIEW-M06, FIX-M06 all done 2026-10-06) |
| 3 | 07 `ts-advanced-types-and-decorators` | B | — | done (CLOSE-M07, REVIEW-M07, FIX-M07 all done 2026-10-06) |
| 4 | 08 `browser-rendering-dom-events` | C | — | done (CLOSE-M08, REVIEW-M08, FIX-M08 all done 2026-10-06) |
| 5 | 09 `web-networking-storage-security` | C | — | done (CLOSE-M09, REVIEW-M09, FIX-M09 all done 2026-10-06) |
| 6 | 10 `css-essentials` | C | — | not started |
| 7 | 11 `accessibility` | C | — | not started |
| 8 | 12 `angular-how-it-works` | D | NG | not started |
| 9 | 13 `components-and-templates` | D | NG | not started |
| 10 | 14 `directives-and-pipes` | D | NG | not started |
| 11 | 16 `dependency-injection` | D | NG | not started |
| 12 | 15 `standalone-and-ngmodules` | D | NG | not started |
| 13 | 18 `control-flow-and-defer` | D | NG | not started |
| 14 | 19 `component-communication-and-projection` | D | NG | not started |
| 15 | 20 `lifecycle-and-render-hooks` | D | NG | not started |
| 16 | 21 `change-detection` | D | NG | not started |
| 17 | 22 `rxjs-foundations` | D | NG | not started |
| 18 | 23 `rxjs-in-depth` | D | NG | not started |
| 19 | 24 `routing` | D | NG | not started |
| 20 | 25 `forms-reactive-and-template-driven` | D | NG | not started |
| 21 | 26 `signal-forms` | D | NG | not started |
| 22 | 27 `http-client` | D | NG | not started |
| 23 | 28 `state-management` | D | NG | not started |
| 24 | 29 `testing-angular` | D | NG | not started |
| 25 | 30 `e2e-and-testing-strategy` | D | — | not started (Playwright: Chromium only) |
| 26 | 31 `performance` | D | NG | not started |
| 27 | 32 `ssr-ssg-hydration` | D | NG | not started (adds `labs/angular/projects/ssr-lab`) |
| 28 | 33 `security` | D | NG | not started |
| 29 | 34 `i18n` | D | NG | not started |
| 30 | 35 `animations` | D | NG | not started |
| 31 | 36 `material-and-cdk` | D | NG | not started |
| 32 | 37 `elements-pwa-errors-ecosystem` | D | NG | not started (adds `projects/elements-lab`) |
| 33 | 38 `architecture-and-production-structure` | D | NG | not started (adds `projects/ui-lib`) |
| 34 | 39 `version-history-and-migrations` | D | NG | not started |
| 35 | 40 `framework-comparisons` | D | — | not started |
| 36 | 41 `fullstack-api-contracts` | E | — | not started |
| 37 | 42 `fullstack-authentication` | E | — | not started |
| 38 | 43 `fullstack-realtime` | E | — | not started |
| 39 | 44 `fullstack-delivery-and-operations` | E | — | not started |
| 40 | 45 `frontend-system-design-method` | F | — | not started |
| 41 | 46 `system-design-case-studies` | F | — | not started |
| 42 | 47 `behavioral-and-interview-craft` | G | — | not started |

Each module's lifecycle: `PLAN` → `SEC`/`QB`/`EX` tasks → `CLOSE` → `REVIEW` (different session) → `FIX` → done. Prerequisite order is respected by construction: every module's prerequisites (SYLLABUS §1) appear earlier in this list (16 is placed before 15 because 15 depends on it; SYLLABUS §6 only grouped them in one batch).

## Phase C: finish line (RUN.md §13)

Planned only when every module above is CLOSEd and REVIEWed: cross-module consistency REVIEW, `QUESTION-INDEX.md` (scripted), `GLOSSARY.md`, `CHEATSHEET.md`, `MOCK-INTERVIEWS.md`, `README.md` (Mermaid prerequisite map, study paths by goal), and the single link in the repo-root `README.md`.
