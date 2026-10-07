# TASKS

The queue. Pick by RUN.md §4. Status: `todo` / `in_progress` / `done` / `blocked`. A task counts as done only once STATE, TASKS and LOG are updated (RUN.md §6.5).

**Standard checks** (Node 24: `export PATH=/opt/homebrew/opt/node@24/bin:$PATH`):
- **ts-js:** `cd labs/ts-js && npm test` exits 0 (typecheck + vitest).
- **angular:** `cd labs/angular && npx ng build` and `npx ng test --watch=false` exit 0.
- **links gate:** until HOUSE-01 is done: `node labs/tools/check-links.mjs` reports **0 `missing anchor`** and every `missing file` target is a planned file (a SYLLABUS §1 module slug, or GLOSSARY / QUESTION-INDEX / CHEATSHEET / MOCK-INTERVIEWS / README). After HOUSE-01: `node labs/tools/check-links.mjs --planned` exits 0.

## Summary

| ID | Size | Status | Deps | Done by |
|---|---|---|---|---|
| B1 | S | done | — | S20261005-1810-claudecode · claude-opus-5-5 |
| B2 | M | done | B1 | S20261005-1810-claudecode · claude-opus-5-5 |
| B3 | L | done | B2 | S20261005-1810-claudecode · claude-opus-5-5 |
| HOUSE-01 | S | done | B2 | S20261005-1810-claudecode · claude-opus-5-5 |
| HOUSE-09 | S | done | B3 | S20261005-1810-claudecode · claude-opus-5-5 |
| VERIFY-OUT-M01 | M | done | B3 | S20261005-1810-claudecode · claude-opus-5-5 |
| HOUSE-02 | S | done | B2 | S20261005-1849-claudecode · claude-opus-5-5 |
| REVIEW-M01 | L | done | VERIFY-OUT-M01, HOUSE-02, B3, FIX-M01-01, FIX-M01-02 | S20261006-0237-claudecode · claude-opus-5-5 (review by a read-only claude-sonnet-5-5 subagent) |
| VERIFY-OUT-M02 | M | done | B3 | S20261005-1810-claudecode · claude-opus-5-5 |
| HOUSE-03 | S | done | B2 | S20261005-1849-claudecode · claude-opus-5-5 |
| REVIEW-M02 | L | done | VERIFY-OUT-M02, HOUSE-03, B3, FIX-M02-01 | S20261005-2022-claudecode · claude-opus-5-5 (review by a read-only claude-sonnet-5-5 subagent) |
| VERIFY-OUT-M03 | M | done | B3 | S20261005-1810-claudecode · claude-opus-5-5 |
| HOUSE-04 | S | done | B2 | S20261005-1849-claudecode · claude-opus-5-5 |
| REVIEW-M03 | L | done | VERIFY-OUT-M03, HOUSE-04, B3, FIX-M03-01, FIX-M03-02 || S20261006-0237-claudecode · claude-opus-5-5 (review by a read-only claude-sonnet-5-5 subagent) |
| VERIFY-OUT-M04 | M | done | B3 | S20261005-1810-claudecode · claude-opus-5-5 |
| HOUSE-05 | S | done | B2 | S20261005-1849-claudecode · claude-opus-5-5 |
| REVIEW-M04 | L | done | VERIFY-OUT-M04, HOUSE-05, B3, FIX-M04-01 | S20261006-0237-claudecode · claude-opus-5-5 (review by a read-only claude-sonnet-5-5 subagent) |

FIX tasks (RUN.md §4.2 priority: they run before the first plain `todo`). B3 added the ones below; each REVIEW appends its own.

| ID | Size | Status | Deps | Done by |
|---|---|---|---|---|
| FIX-M01-01 | M | done | B3, VERIFY-OUT-M01 | S20261005-1810-claudecode · claude-opus-5-5 |
| FIX-M01-02 | M | done | FIX-M01-01 | S20261005-1810-claudecode · claude-opus-5-5 |
| FIX-M02-01 | M | done | B3, VERIFY-OUT-M02 | S20261005-1810-claudecode · claude-opus-5-5 |
| FIX-M03-01 | M | done | B3, VERIFY-OUT-M03 | S20261005-1810-claudecode · claude-opus-5-5 |
| FIX-M03-02 | M | done | FIX-M03-01 | S20261005-1810-claudecode · claude-opus-5-5 |
| FIX-M04-01 | M | done | B3, VERIFY-OUT-M04 | S20261005-1810-claudecode · claude-opus-5-5 |
| FIX-M17-01 | M | done | B3 | S20261005-1849-claudecode · claude-opus-5-5 |
| FIX-SNIP-01 | S | done | HOUSE-09 | S20261005-1810-claudecode · claude-opus-5-5 |
| FIX-M01-03 | S | done | FIX-SNIP-01 | S20261005-1810-claudecode · claude-opus-5-5 |
| FIX-M03-03 | S | done | FIX-SNIP-01 | S20261005-1810-claudecode · claude-opus-5-5 |
| FIX-M04-02 | S | done | FIX-SNIP-01 | S20261005-1810-claudecode · claude-opus-5-5 |
| FIX-M17-02 | S | done | FIX-SNIP-01, FIX-M17-01 | S20261005-1849-claudecode · claude-opus-5-5 |
| FIX-M02-02 | M | done | REVIEW-M02 | S20261006-0237-claudecode · claude-opus-5-5 |
| FIX-M02-03 | M | done | FIX-M02-02 | S20261006-0237-claudecode · claude-opus-5-5 |
| FIX-M02-04 | M | done | FIX-M02-03 | S20261006-0237-claudecode · claude-opus-5-5 |
| FIX-M04-03 | S | done | REVIEW-M04 | S20261006-0237-claudecode · claude-opus-5-5 |
| FIX-M04-04 | M | done | FIX-M04-03 | S20261006-0237-claudecode · claude-opus-5-5 |
| FIX-M04-05 | S | done | FIX-M04-04 | S20261006-0237-claudecode · claude-opus-5-5 |
| FIX-M04-06 | M | done | FIX-M04-05 | S20261006-0237-claudecode · claude-opus-5-5 |
| FIX-M04-07 | M | done | FIX-M04-06 | S20261006-0237-claudecode · claude-opus-5-5 |
| FIX-M03-04 | S | done | REVIEW-M03 | S20261006-0237-claudecode · claude-opus-5-5 |
| FIX-M03-05 | M | done | FIX-M03-04 | S20261006-0237-claudecode · claude-opus-5-5 |
| FIX-M03-06 | M | done | FIX-M03-05 | S20261006-0237-claudecode · claude-opus-5-5 |
| FIX-M03-07 | M | done | FIX-M03-06 | S20261006-0237-claudecode · claude-opus-5-5 |
| FIX-M03-08 | S | done | FIX-M03-07 | S20261006-0237-claudecode · claude-opus-5-5 |
| FIX-M03-09 | S | done | FIX-M03-08 | S20261006-0237-claudecode · claude-opus-5-5 |
| FIX-M03-10 | S | done | FIX-M03-09 | S20261006-0237-claudecode · claude-opus-5-5 |
| FIX-M01-04 | S | done | REVIEW-M01 | S20261006-0237-claudecode · claude-opus-5-5 |
| FIX-M01-05 | S | done | FIX-M01-04 | S20261006-0237-claudecode · claude-opus-5-5 |
| FIX-M01-06 | M | done | FIX-M01-05 | S20261006-0237-claudecode · claude-opus-5-5 |
| FIX-M01-07 | M | done | FIX-M01-06 | S20261006-0237-claudecode · claude-opus-5-5 |
| FIX-M01-08 | M | done | FIX-M01-07 | S20261006-1200-claudecode · claude-opus-5-5 |
| HOUSE-10 | S | done | FIX-M01-08, FIX-M02-04, FIX-M03-10, FIX-M04-07 | S20261006-1200-claudecode · claude-opus-5-5 |

REVIEW-M0x also depends on every `FIX-M0x-*` above, so the reviewer reads the module in its final template.

Module 05 (PLAN-M05; plan in `_meta/modules/M05.md`). Run in this order: every task edits the same module file, each only inside its own `<!-- TASK: <ID> -->` marker region.

| ID | Size | Status | Deps | Done by |
|---|---|---|---|---|
| PLAN-M05 | M | done | HOUSE-10 | S20261006-1200-claudecode · claude-opus-5-5 |
| SEC-M05-01 | M | done | PLAN-M05 | S20261006-1200-claudecode · claude-opus-5-5 |
| SEC-M05-02 | M | done | SEC-M05-01 | S20261006-1200-claudecode · claude-opus-5-5 |
| SEC-M05-03 | M | done | SEC-M05-02 | S20261006-1200-claudecode · claude-opus-5-5 |
| SEC-M05-04 | M | done | SEC-M05-03 | S20261006-1200-claudecode · claude-opus-5-5 |
| SEC-M05-05 | M | done | SEC-M05-04 | S20261006-1200-claudecode · claude-opus-5-5 |
| SEC-M05-06 | M | done | SEC-M05-05 | S20261006-1200-claudecode · claude-opus-5-5 |
| SEC-M05-07 | M | done | SEC-M05-06 | S20261006-1200-claudecode · claude-opus-5-5 |
| SEC-M05-08 | M | done | SEC-M05-07 | S20261006-1200-claudecode · claude-opus-5-5 |
| QB-M05-01 | M | done | SEC-M05-08 | S20261006-1200-claudecode · claude-opus-5-5 |
| QB-M05-02 | M | done | QB-M05-01 | S20261006-1200-claudecode · claude-opus-5-5 |
| QB-M05-03 | M | done | QB-M05-02 | S20261006-1200-claudecode · claude-opus-5-5 |
| EX-M05-01 | M | done | QB-M05-03 | S20261006-1200-claudecode · claude-opus-5-5 |
| EX-M05-02 | M | done | EX-M05-01 | S20261006-1200-claudecode · claude-opus-5-5 |
| EX-M05-03 | M | done | EX-M05-02 | S20261006-1200-claudecode · claude-opus-5-5 |
| CLOSE-M05 | M | done | EX-M05-03 | S20261006-1200-claudecode · claude-opus-5-5 |
| REVIEW-M05 | L | done | CLOSE-M05 | S20261006-1733-claudecode · claude-opus-5-5 (review by a claude-opus-5-5 subagent) |
| FIX-M05-01 | S | done | REVIEW-M05 | S20261006-1733-claudecode · claude-opus-5-5 (fixer subagent) |
| FIX-M05-02 | S | done | FIX-M05-01 | S20261006-1733-claudecode · claude-opus-5-5 (fixer subagent) |
| FIX-M05-03 | M | done | FIX-M05-02 | S20261006-1733-claudecode · claude-opus-5-5 (fixer subagent) |
| FIX-M05-04 | M | done | FIX-M05-03 | S20261006-1733-claudecode · claude-opus-5-5 (fixer subagent) |
| FIX-M05-05 | S | done | FIX-M05-04 | S20261006-1733-claudecode · claude-opus-5-5 (fixer subagent) |
| FIX-M05-06 | M | done | FIX-M05-05 | S20261006-1733-claudecode · claude-opus-5-5 (fixer subagent) |

Module 06 (PLAN-M06; plan in `_meta/modules/M06.md`). Run in this order: every task edits the same module file, each only inside its own `<!-- TASK: <ID> -->` marker region.

| ID | Size | Status | Deps | Done by |
|---|---|---|---|---|
| PLAN-M06 | M | done | CLOSE-M05 | S20261006-1200-claudecode · claude-opus-5-5 |
| SEC-M06-01 | M | done | PLAN-M06 | S20261006-1200-claudecode · claude-opus-5-5 |
| SEC-M06-02 | M | done | SEC-M06-01 | S20261006-1200-claudecode · claude-opus-5-5 |
| SEC-M06-03 | M | done | SEC-M06-02 | S20261006-1200-claudecode · claude-opus-5-5 |
| SEC-M06-04 | M | done | SEC-M06-03 | S20261006-1200-claudecode · claude-opus-5-5 |
| SEC-M06-05 | M | done | SEC-M06-04 | S20261006-1200-claudecode · claude-opus-5-5 |
| SEC-M06-06 | M | done | SEC-M06-05 | S20261006-1200-claudecode · claude-opus-5-5 |
| SEC-M06-07 | M | done | SEC-M06-06 | S20261006-1200-claudecode · claude-opus-5-5 |
| SEC-M06-08 | M | done | SEC-M06-07 | S20261006-1200-claudecode · claude-opus-5-5 |
| QB-M06-01 | M | done | SEC-M06-08 | S20261006-1200-claudecode · claude-opus-5-5 |
| QB-M06-02 | M | done | QB-M06-01 | S20261006-1200-claudecode · claude-opus-5-5 |
| QB-M06-03 | M | done | QB-M06-02 | S20261006-1200-claudecode · claude-opus-5-5 |
| EX-M06-01 | M | done | QB-M06-03 | S20261006-1200-claudecode · claude-opus-5-5 |
| EX-M06-02 | M | done | EX-M06-01 | S20261006-1200-claudecode · claude-opus-5-5 |
| EX-M06-03 | M | done | EX-M06-02 | S20261006-1200-claudecode · claude-opus-5-5 |
| EX-M06-04 | M | done | EX-M06-03 | S20261006-1200-claudecode · claude-opus-5-5 |
| CLOSE-M06 | M | done | EX-M06-04 | S20261006-1200-claudecode · claude-opus-5-5 |
| REVIEW-M06 | L | done | CLOSE-M06 | S20261006-1733-claudecode · claude-opus-5-5 (review by a claude-opus-5-5 subagent) |
| FIX-M06-01 | S | done | REVIEW-M06 | S20261006-1733-claudecode · claude-opus-5-5 (fixer subagent) |
| FIX-M06-02 | M | done | FIX-M06-01 | S20261006-1733-claudecode · claude-opus-5-5 (fixer subagent) |
| FIX-M06-03 | M | done | FIX-M06-02 | S20261006-1733-claudecode · claude-opus-5-5 (fixer subagent) |
| FIX-M06-04 | M | done | FIX-M06-03 | S20261006-1733-claudecode · claude-opus-5-5 (fixer subagent) |
| FIX-M06-05 | M | done | FIX-M06-04 | S20261006-1733-claudecode · claude-opus-5-5 (fixer subagent) |
| FIX-M06-06 | S | done | FIX-M06-05 | S20261006-1733-claudecode · claude-opus-5-5 (fixer subagent) |
| FIX-M06-07 | S | done | FIX-M06-06 | S20261006-1733-claudecode · claude-opus-5-5 (fixer subagent) |

Module 07 (PLAN-M07; plan in `_meta/modules/M07.md`). Run in this order: every task edits the same module file, each only inside its own `<!-- TASK: <ID> -->` marker region. Angular tasks (SEC-M07-07, SEC-M07-09, EX-M07-03) also run the `labs/angular` checks.

| ID | Size | Status | Deps | Done by |
|---|---|---|---|---|
| PLAN-M07 | M | done | CLOSE-M06 | S20261006-1200-claudecode · claude-opus-5-5 |
| SEC-M07-01 | M | done | PLAN-M07 | S20261006-1200-claudecode · claude-opus-5-5 |
| SEC-M07-02 | M | done | SEC-M07-01 | S20261006-1349-claudecode · claude-opus-5-5 |
| SEC-M07-03 | M | done | SEC-M07-02 | S20261006-1349-claudecode · claude-opus-5-5 |
| SEC-M07-04 | M | done | SEC-M07-03 | S20261006-1349-claudecode · claude-opus-5-5 |
| SEC-M07-05 | M | done | SEC-M07-04 | S20261006-1349-claudecode · claude-opus-5-5 |
| SEC-M07-06 | M | done | SEC-M07-05 | S20261006-1349-claudecode · claude-opus-5-5 |
| SEC-M07-07 | M | done | SEC-M07-06 | S20261006-1349-claudecode · claude-opus-5-5 |
| SEC-M07-08 | M | done | SEC-M07-07 | S20261006-1349-claudecode · claude-opus-5-5 |
| SEC-M07-09 | M | done | SEC-M07-08 | S20261006-1349-claudecode · claude-opus-5-5 |
| QB-M07-01 | M | done | SEC-M07-09 | S20261006-1349-claudecode · claude-opus-5-5 |
| QB-M07-02 | M | done | QB-M07-01 | S20261006-1415-claudecode · claude-opus-5-5 |
| QB-M07-03 | M | done | QB-M07-02 | S20261006-1415-claudecode · claude-opus-5-5 |
| EX-M07-01 | M | done | QB-M07-03 | S20261006-1415-claudecode · claude-opus-5-5 |
| EX-M07-02 | M | done | EX-M07-01 | S20261006-1415-claudecode · claude-opus-5-5 |
| EX-M07-03 | M | done | EX-M07-02 | S20261006-1415-claudecode · claude-opus-5-5 |
| CLOSE-M07 | M | done | EX-M07-03 | S20261006-1415-claudecode · claude-opus-5-5 |
| REVIEW-M07 | L | done | CLOSE-M07 | S20261006-1733-claudecode · claude-opus-5-5 (review by a claude-opus-5-5 subagent) |
| FIX-M07-01 | S | done | REVIEW-M07 | S20261006-1733-claudecode · claude-opus-5-5 (fixer subagent) |
| FIX-M07-02 | M | done | FIX-M07-01 | S20261006-1733-claudecode · claude-opus-5-5 (fixer subagent) |
| FIX-M07-03 | M | done | FIX-M07-02 | S20261006-1733-claudecode · claude-opus-5-5 (fixer subagent) |
| FIX-M07-04 | M | done | FIX-M07-03 | S20261006-1733-claudecode · claude-opus-5-5 (fixer subagent) |
| FIX-M07-05 | M | done | FIX-M07-04 | S20261006-1733-claudecode · claude-opus-5-5 (fixer subagent) |

Module 08 (PLAN-M08; plan in `_meta/modules/M08.md`). Run in this order: every task edits the same module file, each only inside its own `<!-- TASK: <ID> -->` marker region.

| ID | Size | Status | Deps | Done by |
|---|---|---|---|---|
| PLAN-M08 | M | done | CLOSE-M07 | S20261006-1653-claudecode · claude-opus-5-5 |
| SEC-M08-01 | M | done | PLAN-M08 | S20261006-1705-claudecode · claude-opus-5-5 |
| SEC-M08-02 | M | done | SEC-M08-01 | S20261006-1705-claudecode · claude-opus-5-5 |
| SEC-M08-03 | M | done | SEC-M08-02 | S20261006-1705-claudecode · claude-opus-5-5 |
| SEC-M08-04 | M | done | SEC-M08-03 | S20261006-1705-claudecode · claude-opus-5-5 |
| SEC-M08-05 | M | done | SEC-M08-04 | S20261006-1705-claudecode · claude-opus-5-5 |
| SEC-M08-06 | M | done | SEC-M08-05 | S20261006-1705-claudecode · claude-opus-5-5 |
| SEC-M08-07 | M | done | SEC-M08-06 | S20261006-1705-claudecode · claude-opus-5-5 |
| QB-M08-01 | M | done | SEC-M08-07 | S20261006-1705-claudecode · claude-opus-5-5 |
| QB-M08-02 | M | done | QB-M08-01 | S20261006-1705-claudecode · claude-opus-5-5 |
| QB-M08-03 | M | done | QB-M08-02 | S20261006-1705-claudecode · claude-opus-5-5 |
| EX-M08-01 | M | done | QB-M08-03 | S20261006-1705-claudecode · claude-opus-5-5 |
| EX-M08-02 | M | done | EX-M08-01 | S20261006-1705-claudecode · claude-opus-5-5 |
| EX-M08-03 | M | done | EX-M08-02 | S20261006-1705-claudecode · claude-opus-5-5 |
| CLOSE-M08 | M | done | EX-M08-03 | S20261006-1705-claudecode · claude-opus-5-5 |
| REVIEW-M08 | L | done | CLOSE-M08 | S20261006-1733-claudecode · claude-opus-5-5 (review by a claude-opus-5-5 subagent) |
| FIX-M08-01 | S | done | REVIEW-M08 | S20261006-1733-claudecode · claude-opus-5-5 (fixer subagent) |
| FIX-M08-02 | M | done | FIX-M08-01 | S20261006-1733-claudecode · claude-opus-5-5 (fixer subagent) |
| FIX-M08-03 | M | done | FIX-M08-02 | S20261006-1733-claudecode · claude-opus-5-5 (fixer subagent) |
| FIX-M08-04 | S | done | FIX-M08-03 | S20261006-1733-claudecode · claude-opus-5-5 (fixer subagent) |
| FIX-M08-05 | S | done | FIX-M08-04 | S20261006-1733-claudecode · claude-opus-5-5 (fixer subagent) |
| FIX-M08-06 | M | done | FIX-M08-05 | S20261006-1733-claudecode · claude-opus-5-5 (fixer subagent) |
| FIX-M08-07 | S | done | FIX-M08-06 | S20261006-1733-claudecode · claude-opus-5-5 (fixer subagent) |

Module 09 (PLAN-M09; plan in `_meta/modules/M09.md`). Run in this order: every task edits the same module file, each only inside its own `<!-- TASK: <ID> -->` marker region.

| ID | Size | Status | Deps | Done by |
|---|---|---|---|---|
| PLAN-M09 | M | done | CLOSE-M08 | S20261006-1804-claudecode · claude-opus-5-5 |
| SEC-M09-01 | M | done | PLAN-M09 | S20261006-1804-claudecode · claude-opus-5-5 (writer subagent) |
| SEC-M09-02 | M | done | SEC-M09-01 | S20261006-1804-claudecode · claude-opus-5-5 (writer subagent) |
| SEC-M09-03 | M | done | SEC-M09-02 | S20261006-1804-claudecode · claude-opus-5-5 (writer subagent) |
| SEC-M09-04 | M | done | SEC-M09-03 | S20261006-1804-claudecode · claude-opus-5-5 (writer subagent) |
| SEC-M09-05 | M | done | SEC-M09-04 | S20261006-1804-claudecode · claude-opus-5-5 (writer subagent) |
| SEC-M09-06 | M | done | SEC-M09-05 | S20261006-1804-claudecode · claude-opus-5-5 (writer subagent) |
| SEC-M09-07 | M | done | SEC-M09-06 | S20261006-1804-claudecode · claude-opus-5-5 (writer subagent) |
| SEC-M09-08 | M | done | SEC-M09-07 | S20261006-1804-claudecode · claude-opus-5-5 (writer subagent) |
| SEC-M09-09 | M | done | SEC-M09-08 | S20261006-1804-claudecode · claude-opus-5-5 (writer subagent) |
| QB-M09-01 | M | done | SEC-M09-09 | S20261006-1804-claudecode · claude-opus-5-5 (writer subagent) |
| QB-M09-02 | M | done | QB-M09-01 | S20261006-1804-claudecode · claude-opus-5-5 (writer subagent) |
| QB-M09-03 | M | done | QB-M09-02 | S20261006-1804-claudecode · claude-opus-5-5 (writer subagent) |
| EX-M09-01 | M | done | QB-M09-03 | S20261006-1804-claudecode · claude-opus-5-5 (writer subagent) |
| EX-M09-02 | M | done | EX-M09-01 | S20261006-1804-claudecode · claude-opus-5-5 (writer subagent) |
| EX-M09-03 | M | done | EX-M09-02 | S20261006-1804-claudecode · claude-opus-5-5 (writer subagent) |
| CLOSE-M09 | M | done | EX-M09-03 | S20261006-1804-claudecode · claude-opus-5-5 (writer subagent) |
| REVIEW-M09 | L | done | CLOSE-M09 | S20261006-1925-claudecode · claude-opus-5-5 (review by a read-only claude-sonnet-5-5 subagent) |
| FIX-M09-01 | S | done | REVIEW-M09 | S20261006-1925-claudecode · claude-opus-5-5 (fixer subagent) |
| FIX-M09-02 | S | done | FIX-M09-01 | S20261006-1925-claudecode · claude-opus-5-5 (fixer subagent) |
| FIX-M09-03 | S | done | FIX-M09-02 | S20261006-1925-claudecode · claude-opus-5-5 (fixer subagent) |
| FIX-M09-04 | M | done | FIX-M09-03 | S20261006-1925-claudecode · claude-opus-5-5 (fixer subagent) |
| FIX-M09-05 | M | done | FIX-M09-04 | S20261006-1925-claudecode · claude-opus-5-5 (fixer subagent) |
| FIX-M09-06 | S | done | FIX-M09-05 | S20261006-1925-claudecode · claude-opus-5-5 (fixer subagent) |

Module 10 (PLAN-M10; plan in `_meta/modules/M10.md`). Run in this order: every task edits the same module file, each only inside its own `<!-- TASK: <ID> -->` marker region.

| ID | Size | Status | Deps | Done by |
|---|---|---|---|---|
| PLAN-M10 | M | done | FIX-M09-06 | S20261006-1925-claudecode · claude-opus-5-5 (planner subagent) |
| SEC-M10-01 | M | done | PLAN-M10 | S20261006-1925-claudecode · claude-opus-5-5 (writer subagent) |
| SEC-M10-02 | M | done | SEC-M10-01 | S20261006-1925-claudecode · claude-opus-5-5 (writer subagent) |
| SEC-M10-03 | M | done | SEC-M10-02 | S20261006-1925-claudecode · claude-opus-5-5 (writer subagent) |
| SEC-M10-04 | M | done | SEC-M10-03 | S20261006-1925-claudecode · claude-opus-5-5 (writer subagent) |
| SEC-M10-05 | M | done | SEC-M10-04 | S20261006-1925-claudecode · claude-opus-5-5 (writer subagent) |
| SEC-M10-06 | M | done | SEC-M10-05 | S20261006-1925-claudecode · claude-opus-5-5 (writer subagent) |
| SEC-M10-07 | M | done | SEC-M10-06 | S20261006-1925-claudecode · claude-opus-5-5 (writer subagent) |
| QB-M10-01 | M | todo | SEC-M10-07 |  |
| QB-M10-02 | M | todo | QB-M10-01 |  |
| QB-M10-03 | M | todo | QB-M10-02 |  |
| EX-M10-01 | M | todo | QB-M10-03 |  |
| EX-M10-02 | M | todo | EX-M10-01 |  |
| EX-M10-03 | M | todo | EX-M10-02 |  |
| CLOSE-M10 | M | todo | EX-M10-03 |  |
| REVIEW-M10 | L | todo | CLOSE-M10 |  |

## Task details

### B2 · M · job state
- Files: `_meta/{STATE,TASKS,ROADMAP,LOG,UNVERIFIED,CALIBRATION}.md`, `PROGRESS.md`.
- Inputs: RUN.md §2, §8; SYLLABUS §1, §6; current PROGRESS.md; module files (counts only).
- Acceptance: every §2 file exists; ROADMAP lists all 42 unwritten modules in SYLLABUS §6 order; closeout tasks for 01–04 present; Small-task pool non-empty; PROGRESS.md has 47 module rows; links gate.

### B3 · L · quality bar
- Files: `_meta/QUALITY-BAR.md`, `STYLE-GUIDE.md` (amendments only where the React guide is stronger), `_meta/TASKS.md` (append FIX tasks).
- Inputs: `../react-full-stack-interview-guide/` (note: RUN.md calls it `React Full-Stack Interview Guide/`; the folder on disk is `react-full-stack-interview-guide/`), `modules/17-signals.md`, STYLE-GUIDE, modules 01–04 (sampled for gaps).
- Acceptance: QUALITY-BAR is a checklist of concrete, checkable items (each says how to check it); every React-stronger gap recorded and reflected in STYLE-GUIDE; FIX tasks appended for gaps in 17 and 01–04; no React content copied; links gate.

### HOUSE-01 · S · link checker "planned" mode
- Files: `labs/tools/check-links.mjs`, `labs/tools/check-links.test.mjs`.
- Inputs: SYLLABUS §1 (slugs), RUN.md §13 (root files).
- Do: add a `--planned` flag. A `missing file` whose target basename is `NN-<slug>.md` for a SYLLABUS §1 module, or one of `GLOSSARY.md`, `QUESTION-INDEX.md`, `CHEATSHEET.md`, `MOCK-INTERVIEWS.md`, `README.md`, is counted as *planned* and reported in a summary line, not as a failure. Missing anchors and any other missing file still fail. Read the slugs from SYLLABUS.md at run time (no hard-coded list). Without the flag, behavior is unchanged (the finish line needs the strict mode).
- Acceptance: `node --test labs/tools/` passes with a new test for the planned classification; `node labs/tools/check-links.mjs --planned` exits 0 on the current tree; strict mode still reports the same count as before.

### VERIFY-OUT-M0x · M · Output answers vs test assertions (x = 1, 2, 3, 4)
- Files: `modules/0x-*.md` (answer text only), `labs/ts-js/src/outputs/0x-*/` (tests only when a test is missing or wrong).
- Inputs: the module's `## Question bank`; its outputs test folder; STYLE-GUIDE §5.3, §7.3.
- Do: for every question tagged `Output`, find the test named after its ID; check the printed lines in the Short answer (and any output block in the Full explanation) equal the asserted lines, character for character. Fix the text where it disagrees (the running test wins). Where a test is missing, add one using `captureLogs`. Also check any "in the lab, X happened" prose claim has a test named after its section.
- **Formatting (resolved in VERIFY-OUT-M02):** the shared `captureLogs` now formats with `util.format`, like `console.log`, and every existing assertion in 01–04 still passed, so no answer was affected. Nothing to do here except keep using `captureLogs`.
- Also check each Output snippet in the module is the code the test runs (`console.log` ↔ `log`, TS annotations and `Reflect` spellings are acceptable differences; anything else is a mismatch).
- Also look for self-corrections or drafting residue left in answers (01 had "`equality.test.ts`… correction: in `nullish.test.ts`").
- Acceptance: a table in the LOG line counts Output questions / tests found / mismatches fixed / tests added; every Output question has a test named after its ID (`grep` check); ts-js; links gate.

### HOUSE-02..05 · S · sources + glossary harvest for 01..04 (HOUSE-02 = 01, 03 = 02, 04 = 03, 05 = 04)
- Files: `SOURCES.md` (add a `## Module 0x · <title>` section), `_meta/GLOSSARY-TERMS.md` (append a `## Module 0x` list: term → one-line definition → anchor where it is defined).
- Inputs: the module file (citations, links, `Source:` lines, terms defined inline).
- Acceptance: every external URL and spec section cited in the module appears in SOURCES.md; every term the module defines on first use appears in GLOSSARY-TERMS.md with its anchor; links gate.

### REVIEW-M0x · L · independent review of module 0x
- Files: `_meta/reviews/REVIEW-M0x.md` (findings), `_meta/TASKS.md` (append `FIX-M0x-nn` tasks).
- Inputs: the whole module, its labs, QUALITY-BAR, STYLE-GUIDE, SYLLABUS §4 checklist for 0x.
- Rule: must run in a session that did not author any task of module 0x (compare `Done by`). Prose is over the 10k cap: cut only redundancy the review names, never trim for length alone.
- Acceptance: every QUALITY-BAR item checked with a pass/fail line; every fail and every factual error is a FIX task with its files and acceptance; links gate.

### HOUSE-09 · S · snippet checker
- Files: `labs/tools/check-snippets.mjs`, `labs/tools/check-snippets.test.mjs`.
- Inputs: STYLE-GUIDE §7.2; QUALITY-BAR C7.
- Do: for every fenced `ts`/`js` block in `modules/*.md`: a block preceded within 3 lines by `<sub>Source: [..](path)</sub>` (Complete) must equal that file (trailing whitespace ignored); a block whose first line is `// Excerpt of <path>` must have its remaining non-blank lines (trimmed) appear in the file in the same order; a block whose first line is `// Partial:` is skipped; report any other TS/JS block as "unclassified". Node stdlib only. Exit 1 on any mismatch or missing file.
- Acceptance: `node --test 'labs/tools/*.test.mjs'` passes (Node 24 rejects the bare directory form) with tests for each kind; the script runs over modules 01–04 and 17; every mismatch or unclassified block it finds is appended as a FIX task (not fixed here); links gate.

### FIX-M0x-01 (01, 02, 03, 04) and FIX-M17-01 · M · bring the module to the B3 template
- Files: the module file only (`modules/0x-*.md` or `modules/17-signals.md`).
- Inputs: STYLE-GUIDE §4.1, §4.2.7, §4.3, §8 (B3 amendments); QUALITY-BAR A1–A4, B7, E1, F1; the module's concept sections and exercises.
- Do: (1) header: add **Short on time** (sections + question IDs + Summary link) and the module's **Run** command; deep-link Prerequisites to sections of written modules (01: none; 02 → 01; 03 → 02; 04 → 02; 17: 13 and 16 are unwritten, keep module links). (2) Add `## Summary` before `## Question bank` and to Contents. (3) Add **Interviewer follow-ups** (2–4, answered) to every exercise's worked solution, after Alternative/Trade-offs and before Tests. (4) Add version history to any misconception that was once true. No new facts without a basis; anything new is verified like any claim.
- Acceptance: QUALITY-BAR A1, A3, A4, B7, E1, F1 pass; the module's lab tests pass (the module's Run command); links gate.

### FIX-M01-02 · M · rebalance 01's question mix
- Files: `modules/01-js-values-types-coercion.md`, `labs/ts-js/src/outputs/01-js-values-types-coercion/` (remove or rename tests of replaced questions).
- Inputs: QUALITY-BAR D3; SYLLABUS §4 checklist for 01; the 18 Output questions.
- Do: 01 is at its ceiling (22) with 18 Output (82%) and no Trade-off. Merge near-duplicate Output puzzles or replace the weakest ones, keeping their IDs, with Trade-off / Design / Bug hunt / Concept questions on the same checklist topics, until Output ≤ 13 (60%) and at least one Trade-off exists. Replaced questions keep their anchor; their Output tests are deleted (or kept if the new question still cites them).
- Acceptance: D3 one-liner shows ≤ 13 Output and ≥ 1 Trade-off; every remaining Output question still has its test; ts-js; links gate.

### FIX-M03-02 · M · rebalance 03's question mix
- Files: `modules/03-js-objects-prototypes-classes.md`, `labs/ts-js/src/outputs/03-js-objects-prototypes-classes/`.
- Inputs: as FIX-M01-02, for 03 (20 of 22 written, 15 Output = 75%).
- Do: add up to 2 non-Output questions (ceiling 22) and merge/replace Output puzzles until Output ≤ 60% of the final count.
- Acceptance: D3 one-liner shows Output ≤ 60%; every remaining Output question has its test; ts-js; links gate.

### FIX-SNIP-01 · S · a snippet kind for Output questions (found by HOUSE-09)
- Files: `STYLE-GUIDE.md` §7.2, `labs/tools/check-snippets.mjs`, `labs/tools/check-snippets.test.mjs`.
- Inputs: STYLE-GUIDE §7.2–7.3; `node labs/tools/check-snippets.mjs . 01 02 03 04 17` output.
- Found: 58 of the 77 "unclassified" blocks in 01–04 and 17 are the snippets of `Output` questions (01: 13, 02: 10, 03: 13, 04: 15, 17: 7). They are already checked against their tests by VERIFY-OUT (§7.3), and they cannot be verbatim Excerpts, because tests call `log` where the answer shows `console.log`.
- Do: add a fourth kind to §7.2, "Output", for a block inside a question whose heading carries the `Output` tag: it is checked against the test named after the question ID (VERIFY-OUT rules), not by the script. Teach the checker to skip a block whose nearest preceding `### Q…` heading has the `Output` tag, and add a test for that.
- Acceptance: tools tests pass; the checker no longer reports Output-question blocks; the remaining count is 21 (19 unclassified + 2 excerpt mismatches) unless modules changed; links gate.

### FIX-M01-03, FIX-M03-03, FIX-M04-02, FIX-M17-02 · S · classify or correct the remaining snippets (found by HOUSE-09)
- Files: the module file only (and a lab file only when making a block a Complete or Excerpt requires one that compiles and is tested).
- Inputs: STYLE-GUIDE §7.2; `node labs/tools/check-snippets.mjs . NN` output for the module.
- Found (by question, since line numbers drift): **01**: Q01.03, Q01.11 (2 blocks), Q01.17, Q01.21. **03**: Q03.05, Q03.07, Q03.08. **04**: Q04.26. **17**: Q17.08, Q17.15 (2), Q17.16, Q17.21, Q17.25 (2), Q17.28, Q17.31, Q17.32 are unclassified; two Excerpts are not verbatim: the Q17.02 excerpt of `labs/angular/…/outputs/q17-outputs.spec.ts` ends with two narrative comment lines that are not in the file (`// 50 ms later: …`, `// SignalClock shows "started" …`), and the section 4 pull-phase excerpt of `labs/ts-js/src/modules/17-signals/mini-signals.ts` contains `// inside computed():`, which is not in the file.
- Do: give each unclassified block its kind: `// Partial: <what is assumed>` for illustrative bug code, or Excerpt/Complete when the code is in a lab. For the two Excerpts, move the narrative comments out of the block into prose (or mark the block Partial). Do not change what the answer teaches. FIX-M17-02 touches `modules/17-signals.md`, which RUN.md allows only through a FIX task (this is one).
- Acceptance: `node labs/tools/check-snippets.mjs . NN` exits 0 for the module (after FIX-SNIP-01); the module's ts-js or angular tests still pass; links gate.

### FIX-M02-02, FIX-M02-03, FIX-M02-04 · M · findings of REVIEW-M02
- Source: `_meta/reviews/REVIEW-M02.md` § "Proposed FIX tasks" holds each task's findings, files, steps and acceptance checks; read that section plus the findings it cites. They run in order (all three edit `modules/02-js-scope-closures-this.md`).
- FIX-M02-02: the eight factual and citation corrections (async interleaving races in the backend callout; Q02.08 number capture relies on engine behavior; RxJS `throttleTime` defaults to `{ leading: true, trailing: false }` (verified in rxjs 7.8.2 `throttleTime.ts`); realm per global object; `catch` parameter in the "Once true" line; PrepareForOrdinaryCall citation; "`this` is not the component"; direct `eval`) + SOURCES.md. Sized M here (the review said S) because it touches eight places plus SOURCES.
- FIX-M02-03: diagrams and "What to notice", concrete problem openings, "why the myth exists", ES edition markers, links to orphan questions Q02.01/05/09/10/14.
- FIX-M02-04: stronger `this` tests in `rate-limit.test.ts`, up to three new questions Q02.20–Q02.22 (one Design), Output snippets aligned with their tests, a Section 1 test.
- Rule: verify each finding before acting on it (the review is input, not authority); a finding that turns out wrong is recorded as rejected in the LOG line.

## Small-task pool (Small mode only, RUN.md §4.4)

| ID | Size | Status | What |
|---|---|---|---|
| HOUSE-06 | S | done (S20261005-1849-claudecode · claude-opus-5-5) | `_meta/GLOSSARY-TERMS.md`: harvest module 17's inline-defined terms (term → definition → anchor). Files: `_meta/GLOSSARY-TERMS.md`. |
| HOUSE-07 | S | done (S20261005-1849-claudecode · claude-opus-5-5) | `labs/tools/module-stats.mjs` (+ test): per module, count `### Q` questions, `### Exercise` headings, the type mix (QUALITY-BAR D3) and prose words (outside fenced code); print a table and flag floors/caps from STYLE-GUIDE §12 and RUN.md §9. Needed by the finish line. Files: `labs/tools/module-stats.mjs`, `labs/tools/module-stats.test.mjs`. |
| HOUSE-08 | S | done (S20261005-1849-claudecode · claude-opus-5-5) | Audit the headers of modules 01–04 and 17 against STYLE-GUIDE §4.1 (fields, order, links); each mismatch becomes a FIX task. Files: `_meta/TASKS.md`. |
| HOUSE-11 | S | todo | From FIX-M08-04: add the browser-feature Baseline marker form (`[Baseline <year>: newly/widely available, per MDN]`, Baseline defined once per module) to STYLE-GUIDE §3.2, and a jsdom 30.1.1 row (exact devDependency of `labs/ts-js`, module 08) to VERSIONS.md. Files: `STYLE-GUIDE.md`, `VERSIONS.md`. Acceptance: `grep -n "Baseline" STYLE-GUIDE.md` finds the form; `grep -n jsdom VERSIONS.md` finds 30.1.1; links gate passes. |

### FIX-M04-03 … FIX-M04-07 · findings of REVIEW-M04

- Findings, files and sizes per task: `_meta/reviews/REVIEW-M04.md` § Proposed FIX tasks. Verify each finding before acting. F-1 (Node phase order since libuv 1.45 / Node 20) and F-2 (the "not a concern" quote is not in the Node docs; the real text favors `queueMicrotask()`) were already confirmed against nodejs.org by S20261006-0237.
- FIX-M04-03: F-1…F-4, T-10, T-12. FIX-M04-04: T-1, T-3, T-4, V-1. FIX-M04-05: T-2, T-9, T-14, redundancy 1–4. FIX-M04-06: T-5, T-6, T-13, T-15, V-2, V-4, V-7. FIX-M04-07: T-7, T-8, T-11, C8, V-5, V-6.

### FIX-M03-04 … FIX-M03-10 · findings of REVIEW-M03

- Findings, files and sizes per task: `_meta/reviews/REVIEW-M03.md` § Proposed FIX tasks. Verify each finding before acting; all edit the module file, so run them in order. The two Medium errors were confirmed in Node 24 by S20261006-0237: `new (class extends null {})()` throws `TypeError`; a proxy `defineProperty` trap returning false throws in sloppy mode too.

### FIX-M01-04 … FIX-M01-08 · findings of REVIEW-M01

- Findings, files and sizes per task: `_meta/reviews/REVIEW-M01.md` § Proposed FIX tasks. Verify each finding before acting; run them in order (they share the module file). The two High errors were confirmed by S20261006-0237: `capture.ts` formats with `util.format`, not `String()` (module line 445); in Node 24 `NaN <= 1` is `false` but `!(NaN > 1)` is `true` (Q01.19 follow-up, line 1015).

### HOUSE-10 · S · Phase A closeout: full verification and dashboard
- Why: Phase A (ROADMAP A1/A2) has no `CLOSE-M01..04` tasks (its closeout was VERIFY-OUT, HOUSE-02..05, REVIEW and FIX), so nothing updates PROGRESS.md for 01–04; found by S20261006-1200-claudecode when the queue ran empty.
- Files: `PROGRESS.md`, `_meta/STATE.md` (Last full verification, Phase).
- Do: run the full verification (ts-js `npm test`; `labs/angular` `ng build` and `ng test --watch=false`; tools tests; `check-links.mjs --planned`; `check-snippets.mjs . 01 02 03 04 17`; `module-stats.mjs`); set 01–04 to done (Closed and Reviewed yes) with the counts module-stats prints; tick Phase A in the dashboard text.
- Acceptance: every command exits 0 (the known prose-cap flags excepted); PROGRESS rows for 01–04 match module-stats; links gate.

### Module 05 tasks (PLAN-M05) · common rules
- Inputs for every task: `_meta/modules/M05.md` (its section or question rows and the "Facts established while planning"), STYLE-GUIDE §4–§8, QUALITY-BAR B–E, SYLLABUS §4 (05), the module skeleton. Re-verify every fact the task uses before writing (lab > package source > official docs) and record the basis next to the claim.
- Module file: replace only the task's own `<!-- TASK: <ID> … -->` line, in one edit at the end of the task. Keep the section's budget from M05.md (prose words outside code).
- Labs: `labs/ts-js/src/modules/05-js-modules-memory-modern-features/` (section claims: `section-N-<slug>.test.ts`, one file per SEC task; exercises: `<name>.ts` + `<name>.test.ts`; Node fixtures: `fixtures/section-N/…` or `fixtures/<exercise>/…`) and `labs/ts-js/src/outputs/05-js-modules-memory-modern-features/` (one test file per QB task, `it('Q05.NN …')`; fixtures in `fixtures/q05-NN/`). Fixtures are `.mjs`, `.cjs` or `.json` run with `node` through `labs/ts-js/src/outputs/run-node.ts` (built by SEC-M05-01, read-only to later tasks).
- Every task adds its sources under `## Module 05 · Modules, memory, errors and modern features` in `SOURCES.md` and its inline-defined terms under `## Module 05` in `_meta/GLOSSARY-TERMS.md` (create the heading if absent).
- Acceptance for every task: `cd labs/ts-js && npm test` exits 0; `node labs/tools/check-snippets.mjs . 05` exits 0; `node labs/tools/check-links.mjs --planned` exits 0; `git status --short` shows only the declared files as new or changed; the task's marker line is gone.

### SEC-M05-01 · M · ES modules: static structure, linking and live bindings (+ the shared Node runner)
- Files: module §1; `labs/ts-js/src/outputs/run-node.ts` + `run-node.test.ts` (new shared helper: `runNode(file: URL, args?: string[]) → { stdout, stderr, status }` via `node:child_process` through a variable specifier and `Reflect.get(globalThis, 'process').execPath`; its test runs a two-line fixture); `labs/ts-js/src/modules/05-…/section-1-esm.test.ts`; `fixtures/section-1/…`; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M05.md §1 (problem, model + diagram + "What to notice", mechanism with the ECMA-262 Module Record phases and their current § numbers, code, *Coming from the backend*, best practices with reasons, traps with history); tests named `Section 1: …` for live bindings, post-order evaluation, evaluate-once, top-level `this`, the cycle TDZ `ReferenceError` and the hoisted-function escape.
- Acceptance: common rules; `grep -c 'Section 1:' labs/ts-js/src/modules/05-*/section-1-esm.test.ts` ≥ 5; one Mermaid diagram followed by "What to notice".

### SEC-M05-02 · M · CommonJS, interop and dynamic `import()`
- Files: module §2; `section-2-commonjs-interop.test.ts`; `fixtures/section-2/…`; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M05.md §2, including the Legacy (AMD/UMD) subsection; run the wrapper/`require` cache, the CommonJS cycle partial export, `import` of CommonJS (default + detected named exports), `require(esm)` and its top-level-`await` error code, and `import()` returning the same namespace twice, all with `node`; read the Node versions for unflagged `require(esm)` from the Node changelog or docs; bundler claims cited (esbuild, webpack), not observed.
- Acceptance: common rules; each interop claim in the prose points at a `Section 2:` test or a cited doc.

### SEC-M05-03 · M · Import maps, `import.meta` and import attributes
- Files: module §3; `section-3-meta-attributes.test.ts`; `fixtures/section-3/…`; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M05.md §3; run `import.meta.url`/`dirname`/`filename`/`resolve` and a JSON import with and without `with { type: 'json' }` (quote the error code); edition markers for `import.meta` (ES2020) and import attributes / JSON modules (ES2025); the `assert` → `with` history with versions cited; import maps from the HTML Standard and MDN (multiple-import-maps support from BCD, read on the day).
- Acceptance: common rules.

### SEC-M05-04 · M · Garbage collection and memory leaks
- Files: module §4; `section-4-gc-leaks.test.ts`; `fixtures/section-4/…`; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M05.md §4 with the reachability diagram and *Coming from the backend* (JVM); the closure leak is one sentence + [Q02.08](02-js-scope-closures-this.md#q02-08), not re-taught; an `--expose-gc` fixture that shows an object kept alive by an interval and collectable after `clearInterval` (run it 20 times first; if the output is not stable, assert only the stable part and say so); V8 generational details cited from v8.dev.
- Acceptance: common rules; the GC claims say "observed in Node 24.21, not guaranteed by the specification".

### SEC-M05-05 · M · Weak references
- Files: module §5; `section-5-weak-refs.test.ts`; `fixtures/section-5/…`; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M05.md §5; tests for no `size`/iteration on `WeakMap`, registered-symbol keys throwing `TypeError` (non-registered symbols accepted, ES2023), `deref()` stability within a job (spec `AddToKeptObjects`, cited), a collected `WeakRef` after `gc()` and a later task (fixture, observed); FinalizationRegistry caveats from the proposal README.
- Acceptance: common rules.

### SEC-M05-06 · M · Errors
- Files: module §6; `section-6-errors.test.ts`; `fixtures/section-6/…`; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M05.md §6 with *Coming from the backend* (`getCause`, `addSuppressed`); tests for subclass `name`/`instanceof`, `cause`, `AggregateError.errors`, `Error.isError` vs `instanceof` across a `node:vm` realm, non-Error throws; how Node 24 prints a `cause` (fixture stdout/stderr, quoted); browser `error` event and `onerror` from the HTML Standard; `uncaughtException` guidance from the Node docs; links to 04 §8/Q04.27 and module 37.
- Acceptance: common rules; edition markers for `cause` (ES2022), `AggregateError` (ES2021), `Error.isError` (ES2026).

### SEC-M05-07 · M · Explicit resource management
- Files: module §7; `section-7-using.test.ts`; `fixtures/section-7/…`; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M05.md §7 with *Coming from the backend* (try-with-resources, C# `using`); disposal order, `SuppressedError` shape, `DisposableStack` (`use`/`adopt`/`defer`/`move`) and `await using` tested in Vitest (downleveled) and once natively by `node`; read what `tsc` emits for `using` at the lab's `ES2024` target and say it; status: ES2027 (finished-proposals and TC39 notes 2026-05), browser versions from MDN BCD on the day; marker `[Added in ES2027]` with the note that the edition is published mid-2027.
- Acceptance: common rules.

### SEC-M05-08 · M · Modern features by edition
- Files: module §8; `section-8-editions.test.ts`; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M05.md §8; the edition table ES2015 → ES2026 built from `finished-proposals.md` read on the day (each row's year from that file), with links to the module that teaches each feature; ES2027-finished features listed separately; a "Node 24" column whose every cell is asserted by a `Section 8:` test (`typeof` or a syntax probe through `new Function` or a fixture); TC39 process stages cited from the process document.
- Acceptance: common rules; every feature row's availability cell has a matching assertion.

### QB-M05-01 · M · Q05.01–Q05.07
- Files: module Question bank (its marker); `labs/ts-js/src/outputs/05-…/modules.test.ts`; `fixtures/q05-02`, `q05-03`, `q05-04`, `q05-06`; SOURCES.md if new sources.
- Do: the seven questions in M05.md, five-part answers (STYLE-GUIDE §5.3), Output answers asserted exactly by `it('Q05.NN …')`; link each to its section and add the section → question links inside §1 and §2 (one-line edits in the sections are part of this task).
- Acceptance: common rules; QUALITY-BAR D1 counts equal 7 for this chunk; every Output ID appears in `modules.test.ts`.

### QB-M05-02 · M · Q05.08–Q05.14
- Files: module Question bank (its marker); `outputs/05-…/meta-memory.test.ts`; `fixtures/q05-10`, `q05-14`; section → question links in §2–§5.
- Do: as QB-M05-01. Q05.14: run the fixture 20 times; if the output varies, apply the fallback recorded in M05.md (Concept, no Output tag) and note it in the LOG line.
- Acceptance: as QB-M05-01, for this chunk.

### QB-M05-03 · M · Q05.15–Q05.21
- Files: module Question bank (its marker); `outputs/05-…/errors-dispose.test.ts`; `fixtures/q05-17`, `q05-19` if a native run is needed; section → question links in §5–§8.
- Do: as QB-M05-01; after this chunk, check D3 for the whole bank with the QUALITY-BAR one-liner.
- Acceptance: as QB-M05-01; D3 holds for Q05.01–Q05.21.

### EX-M05-01 · M · Exercise 05.1 · A leak-free listener handle
- Files: module Hands-on exercises (its marker, including the intro paragraph); `labs/ts-js/src/modules/05-…/listen.ts` + `listen.test.ts`.
- Do: M05.md Exercise 1, full STYLE-GUIDE §8 anatomy; `describe('E05.1 …')`, one `it` per criterion titled with the criterion's wording; the account names every `it` title.
- Acceptance: common rules; QUALITY-BAR E1/E2 for this exercise.

### EX-M05-02 · M · Exercise 05.2 · An error chain toolkit
- Files: module (its marker); `modules/05-…/error-chain.ts` + `error-chain.test.ts`.
- Do and acceptance: as EX-M05-01, with a `node:vm` realm case for `isAppError`.

### EX-M05-03 · M · Exercise 05.3 · A tiny CommonJS loader
- Files: module (its marker); `modules/05-…/tiny-require.ts` + `tiny-require.test.ts`; `fixtures/tiny-require/…` (the same two-file cycle run by real Node for comparison).
- Do and acceptance: as EX-M05-01; the partial-exports criterion asserts the loader matches real Node's output for the same files.

### CLOSE-M05 · M · Close module 05
- Files: module header (Short on time line; Labs paths as links), Summary, Check your understanding, Connections; one-line link edits in `modules/02-js-scope-closures-this.md` (Q02.03 follow-up, Connections), `modules/03-js-objects-prototypes-classes.md` (Q03.07a follow-up, Connections), `modules/04-js-async-event-loop.md` (Connections) pointing at the specific 05 sections; `PROGRESS.md` (row 05).
- Do: as RUN.md §5 `CLOSE`; walk QUALITY-BAR A–H for the module and record pass/fail per item in the LOG line; check the breadth table of M05.md against the finished module; run the full verification (Standard checks plus `module-stats.mjs`).
- Acceptance: common rules; no `<!-- TASK:` marker left in the module; `module-stats.mjs` shows 05 within its ceilings; PROGRESS row 05 updated.

### REVIEW-M05 · L · independent review of module 05
- As `REVIEW-M0x` above. Must run in a session that authored no task of module 05 (PLAN-M05 was authored by S20261006-1200-claudecode).

### FIX-M05-01 … FIX-M05-06 · findings of REVIEW-M05

- Findings, files, sizes, Do and Acceptance per task: `_meta/reviews/REVIEW-M05.md` § Proposed FIX tasks. Verify each finding before acting; all edit the module file, so run them in order (FIX-M05-01, FIX-M05-02, FIX-M05-03, FIX-M05-04, FIX-M05-05, FIX-M05-06).

### Module 06 tasks (PLAN-M06) · common rules
- Inputs for every task: `_meta/modules/M06.md` (its section or question rows and the "Facts established while planning"), STYLE-GUIDE §4–§8, QUALITY-BAR B–E, SYLLABUS §4 (06), the module skeleton. Re-verify every fact the task uses before writing (lab > package source > official docs) and record the basis next to the claim.
- Module file: replace only the task's own `<!-- TASK: <ID> … -->` line, in one edit at the end of the task. Keep the section's budget from M06.md (prose words outside code) as a ceiling.
- Labs: `labs/ts-js/src/modules/06-ts-type-system-essentials/` (section claims: `section-N-<slug>.test.ts`, one file per SEC task; exercises: `<name>.ts` + `<name>.test.ts`; type-level fixtures that must fail to compile: `fixtures/…/*.ts`, excluded from the lab tsconfig) and `labs/ts-js/src/outputs/06-ts-type-system-essentials/` (one test file per QB task, `it('Q06.NN …')`). Type-level claims go through `labs/ts-js/src/modules/06-ts-type-system-essentials/typecheck.ts` (built by SEC-M06-01, read-only to later tasks); emitted JavaScript through `ts.transpileModule`; `node` runs through `labs/ts-js/src/outputs/run-node.ts`.
- Every task adds its sources under `## Module 06 · TypeScript type system essentials` in `SOURCES.md` and its inline-defined terms under `## Module 06` in `_meta/GLOSSARY-TERMS.md` (create the heading if absent).
- Acceptance for every task: `cd labs/ts-js && npm test` exits 0; `node labs/tools/check-snippets.mjs . 06` exits 0; `node labs/tools/check-links.mjs --planned` exits 0; only the declared files are new or changed; the task's marker line is gone.

### SEC-M06-01 · M · What TypeScript is: erased types, `tsc` and transpile-only tools (+ the shared `typecheck` helper)
- Files: module §1; `labs/ts-js/src/modules/06-ts-type-system-essentials/typecheck.ts` + `typecheck.test.ts` (new shared helper: `typecheck(code, options?, extraFiles?) → { code, line, message }[]` over an in-memory `CompilerHost`, default options = the lab's strictness, `types: []`); `labs/ts-js/tsconfig.json` (`"exclude": ["src/**/fixtures/**"]`); `labs/ts-js/src/modules/06-ts-type-system-essentials/section-1-what-typescript-is.test.ts`; `fixtures/section-1/` (two `.ts` files run with `node` strip-only); SOURCES.md; GLOSSARY-TERMS.md.
- Do: M06.md §1 (problem, model + diagram + "What to notice", mechanism, code, *Coming from the backend*, practices with reasons, traps with history); tests named `Section 1: …` for erasure (emit), the strip-only success and the `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX` enum error, and `erasableSyntaxOnly` reported by the checker.
- Acceptance: common rules; `typecheck.test.ts` covers one passing and one failing snippet; one Mermaid diagram followed by "What to notice".

### SEC-M06-02 · M · Structural typing, assignability and `readonly`
- Files: module §2; `labs/ts-js/src/modules/06-ts-type-system-essentials/section-2-structural-typing.test.ts`; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M06.md §2; tests named `Section 2: …` asserting diagnostic codes (fresh-literal excess check, weak type, private member compatibility, `readonly` assignment) and the emit that erases `private`.
- Acceptance: common rules.

### SEC-M06-03 · M · Narrowing and control-flow analysis
- Files: module §3; `labs/ts-js/src/modules/06-ts-type-system-essentials/section-3-narrowing.test.ts`; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M06.md §3; tests for each narrowing form, a type predicate, an assertion function, the callback limit, the `filter` inferred predicate [TypeScript 5.5] and a `this` parameter.
- Acceptance: common rules; the version marker for inferred type predicates matches the 5.5 release notes.

### SEC-M06-04 · M · Unions, intersections and discriminated unions
- Files: module §4; `labs/ts-js/src/modules/06-ts-type-system-essentials/section-4-unions.test.ts`; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M06.md §4; tests for the missing-case diagnostic with an `assertNever` default, the conflicting intersection reducing to `never`, and union member access.
- Acceptance: common rules.

### SEC-M06-05 · M · `any`, `unknown`, `never`, `void`, and `object` versus `{}`
- Files: module §5; `labs/ts-js/src/modules/06-ts-type-system-essentials/section-5-special-types.test.ts`; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M06.md §5; tests for `any` contagion, `unknown` requiring narrowing, `void` callback assignability, `useUnknownInCatchVariables`, and the `object`/`{}`/`Object` assignment table; the `JSON.parse` signature read from typescript@6.0.3 `lib.es5.d.ts`.
- Acceptance: common rules.

### SEC-M06-06 · M · Enums, literal unions, `as const` and `satisfies`
- Files: module §6; `labs/ts-js/src/modules/06-ts-type-system-essentials/section-6-enums-satisfies.test.ts`; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M06.md §6; emit tests (numeric, string, `const enum` under `isolatedModules`), numeric-enum assignability, `as const` + `keyof typeof`, `satisfies` keeping literals while catching a typo, and an unchecked `as`; cite the Angular style guide only for what it actually says.
- Acceptance: common rules; version markers for `as const` (3.4) and `satisfies` (4.9) match the release notes.

### SEC-M06-07 · M · `tsconfig`: the `strict` family, module settings and TypeScript 6.0 defaults
- Files: module §7; `labs/ts-js/src/modules/06-ts-type-system-essentials/section-7-tsconfig.test.ts`; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M06.md §7; read the exact `strict` family list for 6.0.3 (docs or `tsc --help --all`); tests for default `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax` (`TS1484`) and the `types: []` default; the deprecation list quoted from the 6.0 release notes.
- Acceptance: common rules; every diagnostic code named in the prose is asserted by a `Section 7:` test.

### SEC-M06-08 · M · Declaration files, `@types` and augmentation
- Files: module §8; `labs/ts-js/src/modules/06-ts-type-system-essentials/section-8-declarations.test.ts`; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M06.md §8; tests with extra virtual files for an ambient module, module augmentation and `declare global` (including the error when the file is not a module); one real `package.json` `types`/`exports` field read from `node_modules`.
- Acceptance: common rules.

### QB-M06-01 · M · Q06.01–Q06.08
- Files: module Question bank (its marker, with the bank intro); `labs/ts-js/src/outputs/06-ts-type-system-essentials/basics.test.ts`; section → question links in §1–§3.
- Do: the eight questions in M06.md, five-part answers (STYLE-GUIDE §5.3), at most ~140 words each; Output answers asserted exactly by `it('Q06.NN …')` (diagnostic codes and lines, or emit).
- Acceptance: common rules; QUALITY-BAR D1 counts equal 8 for this chunk; every Output ID appears in the test file.

### QB-M06-02 · M · Q06.09–Q06.16
- Files: module Question bank (its marker); `outputs/06-…/unions-special-enums.test.ts`; section → question links in §3–§6.
- Do and acceptance: as QB-M06-01, for this chunk.

### QB-M06-03 · M · Q06.17–Q06.24
- Files: module Question bank (its marker); `outputs/06-…/config-declarations.test.ts`; section → question links in §6–§8.
- Do: as QB-M06-01; after this chunk, check D3 for the whole bank with the QUALITY-BAR one-liner.
- Acceptance: as QB-M06-01; D3 holds for Q06.01–Q06.24.

### EX-M06-01 · M · Exercise 06.1 · An exhaustive reducer
- Files: module Hands-on exercises (its marker, including the intro paragraph); `labs/ts-js/src/modules/06-ts-type-system-essentials/reducer.ts` + `reducer.test.ts`.
- Do: M06.md Exercise 1, full STYLE-GUIDE §8 anatomy; `describe('E06.1 …')`, one `it` per criterion titled with the criterion's wording; compile-time criteria through `typecheck`; the account names every `it` title.
- Acceptance: common rules; QUALITY-BAR E1/E2 for this exercise.

### EX-M06-02 · M · Exercise 06.2 · A guard for API data
- Files: module (its marker); `labs/ts-js/src/modules/06-ts-type-system-essentials/user-guard.ts` + `user-guard.test.ts`.
- Do and acceptance: as EX-M06-01.

### EX-M06-03 · M · Exercise 06.3 · A typed configuration table
- Files: module (its marker); `labs/ts-js/src/modules/06-ts-type-system-essentials/feature-flags.ts` + `feature-flags.test.ts`.
- Do and acceptance: as EX-M06-01; the emit criterion uses `ts.transpileModule`.

### EX-M06-04 · M · Exercise 06.4 · Make a loose module strict
- Files: module (its marker); `labs/ts-js/src/modules/06-ts-type-system-essentials/cart.ts` + `cart.test.ts`; `fixtures/legacy-cart/legacy-cart.ts` (compiles only with `strict: false`).
- Do and acceptance: as EX-M06-01; the legacy diagnostics are asserted by code.

### CLOSE-M06 · M · Close module 06
- Files: module header (Short on time line; Labs paths as links), Summary, Check your understanding, Connections; one-line link edits in modules 01, 02, 03 and 05 where they link `[Module 06]`/`[module 06]` without an anchor (listed in M06.md "Other closing material"), pointing at the specific 06 sections; `PROGRESS.md` (row 06); `_meta/ROADMAP.md` (row 06).
- Do: as CLOSE-M05: walk QUALITY-BAR A–H and record pass/fail per item in the LOG line; check M06.md's breadth table against the finished module; run the full verification (Standard checks plus `module-stats.mjs`).
- Acceptance: common rules; no `<!-- TASK:` marker left in the module; PROGRESS row 06 updated.

### REVIEW-M06 · L · independent review of module 06
- As `REVIEW-M0x` above. Must run in a session that authored no task of module 06 (PLAN-M06 was authored by S20261006-1200-claudecode).

### FIX-M06-01 … FIX-M06-07 · findings of REVIEW-M06

- Findings, files, sizes, Do and Acceptance per task: `_meta/reviews/REVIEW-M06.md` § Proposed FIX tasks. Verify each finding before acting; all edit the module file, so run them in order (FIX-M06-01, FIX-M06-02, FIX-M06-03, FIX-M06-04, FIX-M06-05, FIX-M06-06, FIX-M06-07).

### Module 07 tasks (PLAN-M07) · common rules
- Inputs for every task: `_meta/modules/M07.md` (its section, question or exercise rows, the budget, and "Facts established while planning"), STYLE-GUIDE §4–§8, QUALITY-BAR B–E, SYLLABUS §4 (07), the module skeleton. Re-verify every fact the task uses before writing (lab > package source > official docs) and record the basis next to the claim.
- Module file: replace only the task's own `<!-- TASK: <ID> … -->` line(s), at the end of the task. The task's word budget in M07.md (prose words outside code) is a ceiling; measure it and put the count in the LOG line.
- Labs (ts-js): `labs/ts-js/src/modules/07-ts-advanced-types-and-decorators/` (section claims `section-N-<slug>.test.ts`, one per SEC task; exercises `<name>.ts` + `<name>.test.ts`; fixtures that must not compile under `fixtures/`) and `labs/ts-js/src/outputs/07-ts-advanced-types-and-decorators/` (one test file per QB task, `it('Q07.NN …')`, fixtures under `fixtures/`). Type-level claims use `../06-ts-type-system-essentials/typecheck` (read-only); emitted JavaScript uses `ts.transpileModule`.
- Labs (Angular, SEC-M07-07, SEC-M07-09, EX-M07-03): `labs/angular/src/app/modules/07-ts-advanced-types-and-decorators/` (specs `*.spec.ts`, components). Type-level claims are `// @ts-expect-error` lines checked by `npx tsc -p tsconfig.spec.json --noEmit`; run-time claims by `npx ng test --watch=false`. Modern Angular only (standalone, `inject()`, signals, new control flow), at most 4 injected dependencies per class.
- Every task adds its sources under `## Module 07 · Advanced types, decorators and runtime safety` in `SOURCES.md` (create it before `## Module 17` if absent) and its inline-defined terms under `## Module 07` in `_meta/GLOSSARY-TERMS.md`.
- Acceptance for every task: `cd labs/ts-js && npm test` exits 0; for tasks touching `labs/angular`, also `npx tsc -p tsconfig.spec.json --noEmit`, `npx ng build` and `npx ng test --watch=false` exit 0; `node labs/tools/check-snippets.mjs . 07` and `node labs/tools/check-links.mjs --planned` exit 0; only the declared files are new or changed; the task's marker is gone.

### SEC-M07-01 · M · Generics: constraints, defaults, inference and `const` type parameters
- Files: module §1 and the "How the claims here are verified" marker; `labs/ts-js/src/modules/07-ts-advanced-types-and-decorators/section-1-generics.test.ts`; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M07.md §1; tests `Section 1: …` for constraint failures, defaults, callback contextual inference, `const` type parameters [5.0] and `NoInfer` [5.4] (release notes fetched for both markers).
- Acceptance: common rules.

### SEC-M07-02 · M · `keyof`, indexed access, mapped and template literal types
- Files: module §2; `section-2-mapped-types.test.ts`; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M07.md §2; every "evaluates to" claim checked by two-way assignability in `typecheck`; `as` remapping and template literal types marked [Added in TypeScript 4.1] after checking the 4.1 notes.
- Acceptance: common rules.

### SEC-M07-03 · M · Conditional types, distributivity, `infer` and recursive types
- Files: module §3; `section-3-conditional-types.test.ts`; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M07.md §3, with one Mermaid diagram plus "What to notice"; reproduce `TS2589` or leave the claim out.
- Acceptance: common rules.

### SEC-M07-04 · M · Utility types, built in and by hand
- Files: module §4; `section-4-utility-types.test.ts`; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M07.md §4; quote the built-in definitions from `labs/ts-js/node_modules/typescript/lib/lib.es5.d.ts` (6.0.3) as Excerpt snippets or in prose; compare hand-written versions with the built-ins in the test.
- Acceptance: common rules.

### SEC-M07-05 · M · Variance, parameter bivariance and `strictFunctionTypes`
- Files: module §5; `section-5-variance.test.ts`; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M07.md §5; property-syntax vs method-syntax codes under `strict`; `in`/`out` violations; the method-bivariance rationale quoted from the handbook or the 2.6 notes.
- Acceptance: common rules.

### SEC-M07-06 · M · Branded types for IDs and money
- Files: module §6; `section-6-brands.test.ts`; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M07.md §6; keep module 01's promise (`amount + tax` with a raw number does not compile through the money functions).
- Acceptance: common rules.

### SEC-M07-07 · M · Decorators: standard versus `experimentalDecorators`, and what Angular does with them
- Files: module §7; `section-7-decorators.test.ts` (ts-js); `labs/angular/src/app/modules/07-ts-advanced-types-and-decorators/decorators.spec.ts`; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M07.md §7. First check whether Vitest runs standard decorators; if not, run the `transpileModule` output with `node`. Re-run the `ngc` observation from M07.md with temporary configs and delete them afterwards (they are not declared files). Record the run under "Observed by running".
- Acceptance: common rules (Angular checks included).

### SEC-M07-08 · M · Runtime validation with Zod 4
- Files: module §8; `labs/ts-js/package.json` and `package-lock.json` (`npm install --save-dev --save-exact zod@4.6.5`, inside `labs/ts-js` only); `section-8-zod.test.ts`; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M07.md §8; Zod facts read from `node_modules/zod` (`.d.ts`) and zod.dev; keep module 03's unknown-keys promise accurately.
- Acceptance: common rules; `npm ls zod` shows 4.6.5.

### SEC-M07-09 · M · Typing patterns in Angular code
- Files: module §9; `labs/angular/src/app/modules/07-ts-advanced-types-and-decorators/typing-patterns.spec.ts` (plus at most two small source files it needs); SOURCES.md; GLOSSARY-TERMS.md.
- Do: M07.md §9; every type claim as an `@ts-expect-error` or an assignment that must compile; cite angular.dev for typed forms, `InjectionToken`, `input()` and generic-component template inference.
- Acceptance: common rules (Angular checks included).

### QB-M07-01 · M · bank intro and Q07.01–Q07.07
- Files: module Question bank (its marker); `labs/ts-js/src/outputs/07-ts-advanced-types-and-decorators/generics-and-computed-types.test.ts` (+ fixtures); section → question links in §1–§3.
- Do: the seven questions in M07.md; five-part answers (STYLE-GUIDE §5.3), at most 150 words each; Output answers asserted exactly by `it('Q07.NN …')`.
- Acceptance: common rules; D1 counts equal 7.

### QB-M07-02 · M · Q07.08–Q07.14
- Files: module (its marker); `outputs/07-…/utility-variance-brands-decorators.test.ts`; section → question links in §4–§7.
- Do and acceptance: as QB-M07-01, for this chunk (D1 counts equal 14).

### QB-M07-03 · M · Q07.15–Q07.20
- Files: module (its marker); `outputs/07-…/decorators-zod-angular.test.ts` (Angular-only claims cite the SEC-M07-09 spec instead); section → question links in §7–§9.
- Do: as QB-M07-01; afterwards check D3 for the whole bank with the QUALITY-BAR one-liner.
- Acceptance: as QB-M07-01; D3 holds for Q07.01–Q07.20.

### EX-M07-01 · M · Exercise 07.1 · A typed event bus
- Files: module Hands-on exercises (its marker, with the intro paragraph); `labs/ts-js/src/modules/07-ts-advanced-types-and-decorators/event-bus.ts` + `event-bus.test.ts`.
- Do: M07.md Exercise 1, full E1 anatomy; `describe('E07.1 …')`, one `it` per criterion titled with its wording; compile-time criteria through `typecheck` with the real file as an extra file; mutation checks recorded in the LOG.
- Acceptance: common rules; QUALITY-BAR E1/E2.

### EX-M07-02 · M · Exercise 07.2 · Parse, brand and add money
- Files: module (its marker); `labs/ts-js/src/modules/07-ts-advanced-types-and-decorators/order-schema.ts` + `order-schema.test.ts`.
- Do and acceptance: as EX-M07-01 (depends on SEC-M07-08's Zod install).

### EX-M07-03 · M · Exercise 07.3 · A typed settings form with a typed config token
- Files: module (its marker); `labs/angular/src/app/modules/07-ts-advanced-types-and-decorators/settings-form.ts` + `settings-form.spec.ts` (+ `settings-defaults.ts` for the token).
- Do and acceptance: as EX-M07-01, with the Angular checks; compile-time criteria as `@ts-expect-error` lines checked by `tsc -p tsconfig.spec.json`.

### CLOSE-M07 · M · Close module 07
- Files: module header (Short on time line; Labs paths as links), Summary, Check your understanding, Connections; one-line link edits in modules 01, 03, 05 and 06 listed in M07.md "Other closing material"; `PROGRESS.md` (row 07, totals); `_meta/ROADMAP.md` (row 07).
- Do: as CLOSE-M06: walk QUALITY-BAR A–H and record pass/fail per item in the LOG line; check M07.md's breadth table against the finished module; run the full verification (ts-js, Angular build and tests, tools tests, links, snippets 01–07 and 17, `module-stats.mjs`).
- Acceptance: common rules; no `<!-- TASK:` marker left in the module; PROGRESS row 07 updated.

### REVIEW-M07 · L · independent review of module 07
- As `REVIEW-M0x` above. Must run in a session that authored no task of module 07 (authors: S20261006-1200-claudecode, S20261006-1349-claudecode, S20261006-1415-claudecode), and not in a continuation of their conversation.

### FIX-M07-01 … FIX-M07-05 · findings of REVIEW-M07

- Findings, files, sizes, Do and Acceptance per task: `_meta/reviews/REVIEW-M07.md` § Proposed FIX tasks. Verify each finding before acting; all edit the module file, so run them in order (FIX-M07-01, FIX-M07-02, FIX-M07-03, FIX-M07-04, FIX-M07-05).

### Module 08 tasks (PLAN-M08) · common rules
- Inputs for every task: `_meta/modules/M08.md` (its section, question or exercise rows, the budget, and "Facts established while planning"), STYLE-GUIDE §3–§8, QUALITY-BAR B–E, SYLLABUS §4 (08), the module skeleton. Re-verify every fact the task uses before writing (lab > package source > official docs) and record the basis next to the claim.
- No real browser: layout, paint, compositing, `IntersectionObserver`/`ResizeObserver`, Core Web Vitals, declarative shadow DOM and the Navigation API are taught from cited specifications and documentation, never as lab observations. jsdom claims are worded as jsdom results where browser behavior could differ.
- Module file: replace only the task's own `<!-- TASK: <ID> … -->` line(s), at the end of the task. The task's word budget in M08.md is a ceiling; measure it (prose outside code) and put the count in the LOG line.
- Labs: `labs/ts-js/src/modules/08-browser-rendering-dom-events/` (section claims `section-N-<slug>.test.ts`, one per SEC task that has lab claims; exercises `<name>.ts` + `<name>.test.ts`) and `labs/ts-js/src/outputs/08-browser-rendering-dom-events/` (one test file per QB task with Output questions, `it('Q08.NN …')`, fixtures under `fixtures/`). Every DOM test file starts with `// @vitest-environment jsdom`.
- Every task adds its sources under `## Module 08 · Browser rendering, the DOM and events` in `SOURCES.md` (create it after the Module 07 section if absent) and its inline-defined terms under `## Module 08` in `_meta/GLOSSARY-TERMS.md`.
- Acceptance for every task: `cd labs/ts-js && npm test` exits 0; `node labs/tools/check-snippets.mjs . 08` and `node labs/tools/check-links.mjs --planned` exit 0; every URL in the module is in SOURCES.md; only the declared files are new or changed; the task's marker is gone.

### SEC-M08-01 · M · The critical rendering path
- Files: module §1 and the "How the claims here are verified" marker; `labs/ts-js/package.json` and `package-lock.json` (`npm install --save-dev --save-exact jsdom@30.1.1` inside `labs/ts-js` only); `labs/ts-js/src/modules/08-browser-rendering-dom-events/section-1-setup.test.ts`; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M08.md §1 with its Mermaid diagram and "What to notice"; install jsdom and prove the `// @vitest-environment jsdom` comment works under `npm test`; if it does not, stop with BLOCKED and record why.
- Acceptance: common rules; `npm ls jsdom` in `labs/ts-js` shows 30.1.1.

### SEC-M08-02 · M · Layout, paint and composite
- Files: module §2; `section-2-batching.test.ts` (order of operations only); SOURCES.md; GLOSSARY-TERMS.md.
- Do: M08.md §2; the layout-thrashing definition keeps module 17's promise.
- Acceptance: common rules.

### SEC-M08-03 · M · DOM APIs and observers
- Files: module §3; `section-3-dom-observers.test.ts`; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M08.md §3.
- Acceptance: common rules.

### SEC-M08-04 · M · Events
- Files: module §4; `section-4-events.test.ts`; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M08.md §4 with its diagram; the default-passive rule read from the DOM Standard.
- Acceptance: common rules.

### SEC-M08-05 · M · Web Components
- Files: module §5; `section-5-web-components.test.ts`; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M08.md §5; Baseline status for declarative shadow DOM from MDN.
- Acceptance: common rules.

### SEC-M08-06 · M · Core Web Vitals
- Files: module §6; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M08.md §6; thresholds and the INP/FID change quoted from web.dev.
- Acceptance: common rules.

### SEC-M08-07 · M · History API versus Navigation API
- Files: module §7; `section-7-history.test.ts`; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M08.md §7; what Angular's Router uses read from `labs/angular/node_modules/@angular/router` 22.2.1 before claiming.
- Acceptance: common rules.

### QB-M08-01 · M · bank intro and Q08.01–Q08.06
- Files: module Question bank (its marker); `labs/ts-js/src/outputs/08-browser-rendering-dom-events/rendering-and-dom.test.ts` (+ fixtures); section → question links in §1–§3.
- Do: the six questions in M08.md; five-part answers (STYLE-GUIDE §5.3), at most 140 words each; Output answers asserted exactly by `it('Q08.NN …')`.
- Acceptance: common rules; D1 counts equal 6.

### QB-M08-02 · M · Q08.07–Q08.12
- Files: module (its marker); `outputs/08-…/events-and-shadow.test.ts`; section → question links in §3–§5.
- Do and acceptance: as QB-M08-01, for this chunk (D1 counts equal 12).

### QB-M08-03 · M · Q08.13–Q08.18
- Files: module (its marker); `outputs/08-…/components-vitals-history.test.ts` only if a question needs lab evidence; section → question links in §5–§7.
- Do: as QB-M08-01; afterwards check D3 for the whole bank with the QUALITY-BAR one-liner.
- Acceptance: as QB-M08-01; D3 holds for Q08.01–Q08.18.

### EX-M08-01 · M · Exercise 08.1 · Event delegation helper
- Files: module Hands-on exercises (its marker, with the intro paragraph); `labs/ts-js/src/modules/08-browser-rendering-dom-events/delegate.ts` + `delegate.test.ts`.
- Do: M08.md Exercise 1, full E1 anatomy, ≤ 480 words; `describe('E08.1 …')`, one `it` per criterion titled with its wording; mutation checks recorded in the LOG.
- Acceptance: common rules; QUALITY-BAR E1/E2.

### EX-M08-02 · M · Exercise 08.2 · Batch DOM reads and writes per frame
- Files: module (its marker); `frame-scheduler.ts` + `frame-scheduler.test.ts`.
- Do and acceptance: as EX-M08-01.

### EX-M08-03 · M · Exercise 08.3 · A `<rating-stars>` custom element
- Files: module (its marker); `rating-stars.ts` + `rating-stars.test.ts`.
- Do and acceptance: as EX-M08-01.

### CLOSE-M08 · M · Close module 08
- Files: module header (Short on time line; Labs paths as links), Summary, Check your understanding, Connections; one-line link edits in modules 01 and 04 listed in M08.md "Other closing material"; `PROGRESS.md` (row 08, totals); `_meta/ROADMAP.md` (row 08).
- Do: as CLOSE-M07: walk QUALITY-BAR A–H and record pass/fail per item in the LOG line; check M08.md's breadth table against the finished module; run the full verification (ts-js, Angular build and tests, tools tests, links, snippets 01–08 and 17, `module-stats.mjs`).
- Acceptance: common rules; no `<!-- TASK:` marker left in the module; PROGRESS row 08 updated.

### REVIEW-M08 · L · independent review of module 08
- As `REVIEW-M0x` above. Must run in a session that authored no task of module 08 (PLAN-M08 was authored by S20261006-1653-claudecode), and not in a continuation of its conversation.

### FIX-M08-01 … FIX-M08-07 · findings of REVIEW-M08

- Findings, files, sizes, Do and Acceptance per task: `_meta/reviews/REVIEW-M08.md` § Proposed FIX tasks. Verify each finding before acting; all edit the module file, so run them in order (FIX-M08-01, FIX-M08-02, FIX-M08-03, FIX-M08-04, FIX-M08-05, FIX-M08-06, FIX-M08-07).

### Module 09 tasks (PLAN-M09) · common rules
- Inputs for every task: `_meta/modules/M09.md` (its section, question or exercise rows, the budget, "Facts established while planning" and the owner map), STYLE-GUIDE §3–§8, QUALITY-BAR B–E, SYLLABUS §4 (09), the module skeleton, and the "Proposed FIX tasks" of REVIEW-M05..M08 (the lessons below come from them). Re-verify every fact the task uses before writing (lab > package source > official docs) and record the basis next to the claim; facts under "Not yet read" in M09.md must be read first or dropped.
- **No real browser.** Browser enforcement of CORS, `SameSite`, CSP, Trusted Types, quotas, HTTP caching and service workers is taught from cited specifications and documentation, never as a lab observation. What the labs run is Node 24 (`fetch`, local `node:http`/`node:http2` servers, `crypto`, `structuredClone`) and jsdom 30.1.1 (cookies, Web Storage); worded as "in Node" / "in jsdom" where a browser could differ. Node's `fetch` has no HTTP cache and no CORS enforcement.
- **First-time-pass rules (recurring REVIEW findings; check each before marking done):**
  - Diagram: every section's Mental model has a Mermaid diagram (type named in the plan) followed by a "What to notice" sentence (REVIEW-M05 T-2, M06 T-1, M07 T-1, M08 T-1).
  - Misconceptions: every bullet gives the correction **and why the myth exists**; a "Once true: … until …" clause only from a source actually read this session (cite or marker); otherwise only the cause. Never from memory (REVIEW-M05 T-4, M06 T-2, M07 T-3, M08 T-2).
  - Status markers only in STYLE-GUIDE §3.2 forms, at first mention; ECMAScript edition at first mention for post-ES2015 syntax in snippets; Baseline is defined once in the module intro and is never used as a stand-alone marker form (M08 T-4). No marker is claimed unless the page was read.
  - Every term is defined on first use in this module with a link to the owning module (the per-section term list is in M09.md); acronyms are expanded once (REVIEW-M05 T-6, M06 T-6, M07 T-6, M08 T-5).
  - Questions: each is linked from its section body with its own `[Q09.NN](#q09-NN)` (never only the range endpoints), and each answer links back to its section (REVIEW-M08 T-7). Exercises are linked from their sections.
  - No "mutation check" or "checked by hand" claim in the module text; every claim of the form "in the lab, X" names a test (`Section N: …`, `Q09.NN …`, `E09.N …`) that exists and asserts it exactly (REVIEW-M06 T-8, M08 T-6).
  - Callouts begin with the `> [!NOTE]` / `> [!TIP]` line; every *Coming from the backend* states "Where the analogy breaks" (REVIEW-M08 T-8).
  - No Spring snippet in this module (M09.md); if one is added anyway it carries the Spring banner and is verified against docs.spring.io for Boot 4.1.1 / Security 7.1.1.
  - Prose budget: the module must stay <= 10,000 words by `node labs/tools/module-stats.mjs` (and the QUALITY-BAR python one-liner); each task measures its part and puts the count in its LOG line; any task more than 10% over its M09.md budget cuts before finishing, by removing repeats and never a diagram, a trap's cause or a "because" (REVIEW-M05 T-9, M06 T-4, M07 T-8).
  - Do not repeat what another module owns: abort/timeout detail is module 04 §7 / Q04.24 / Q04.26; token storage matrix is 33; CSRF in SPAs is 33/42; server CORS is 41; use one sentence plus a link.
- Module file: replace only the task's own `<!-- TASK: <ID> … -->` line(s), at the end of the task, in a single edit. Never touch another task's marker.
- Labs: `labs/ts-js/src/modules/09-web-networking-storage-security/` (section claims `section-N-<slug>.test.ts`, one per SEC task that has lab claims; exercises `<name>.ts` + `<name>.test.ts`) and `labs/ts-js/src/outputs/09-web-networking-storage-security/` (one test file per QB task with Output questions, `it('Q09.NN …')`, fixtures under `fixtures/`). Tests that need DOM-ish storage or cookies start with `// @vitest-environment jsdom` (jsdom 30.1.1 is already a devDependency of `labs/ts-js`); network tests run in the default Node environment against a local server from `labs/ts-js/src/modules/09-web-networking-storage-security/support/http-server.ts` (**built once by SEC-M09-01, read-only afterwards**; a task that needs a change records it and stops rather than editing it). Servers listen on port 0 on `127.0.0.1` and are closed in `afterEach`/`afterAll`; no test depends on wall-clock time beyond generous bounds; no test needs the internet.
- Every task adds its sources under `## Module 09 · Networking, storage and browser security` in `SOURCES.md` (create it after the Module 08 section if absent) and its inline-defined terms under `## Module 09` in `_meta/GLOSSARY-TERMS.md`.
- Acceptance for every task: `cd labs/ts-js && npm test` exits 0; `node labs/tools/check-snippets.mjs . 09` and `node labs/tools/check-links.mjs --planned` exit 0; every URL in the module is in SOURCES.md; only the declared files are new or changed; the task's marker is gone; no scratch or probe file is left behind.

- Forward links (orchestrator, 2026-10-06): SEC-M09-01…05 wrote question/exercise references as plain text followed by `<!-- relink: #q09-NN -->` / `<!-- relink: #ex09-N -->`, because the anchors do not exist until QB/EX run (links gate). Each QB-M09/EX-M09 task turns the plain mentions of its own questions/exercises back into links and deletes those comments; SEC-M09-06…09 do the same (plain text + relink comment) for anchors not yet written. CLOSE-M09: `grep -c "relink:" modules/09-web-networking-storage-security.md` is 0.
### SEC-M09-01 · M · HTTP semantics (+ the shared test server and the verification paragraph)
- Files: module §1 and the "How the claims here are verified" marker; `labs/ts-js/src/modules/09-web-networking-storage-security/support/http-server.ts` (`startServer(handler)` returning `{ baseUrl, close }`, typed, no `any`); `labs/ts-js/src/modules/09-web-networking-storage-security/section-1-http-semantics.test.ts`; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M09.md §1 with its flowchart and "What to notice"; the verification paragraph (what Node and jsdom run, what is documented, Baseline defined in one sentence from MDN's wording); read RFC 9110's method-properties and redirect sections before writing.
- Acceptance: common rules; the tests listed under M09.md §1 verification exist and pass.

### SEC-M09-02 · M · `fetch`, XHR and the request lifecycle
- Files: module §2; `labs/ts-js/src/modules/09-web-networking-storage-security/section-2-fetch.test.ts`; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M09.md §2 with its sequence diagram; read the Fetch Standard / MDN `RequestInit` for `keepalive` (limit) and `duplex` before stating them; abort is a link to module 04 §7.
- Acceptance: common rules; tests as listed in M09.md §2.

### SEC-M09-03 · M · HTTP/1.1, HTTP/2 and HTTP/3
- Files: module §3; `labs/ts-js/src/modules/09-web-networking-storage-security/section-3-http-versions.test.ts` (assert socket/session/in-flight counts only); SOURCES.md; GLOSSARY-TERMS.md.
- Do: M09.md §3; read RFC 9113/9114 HOL text, the Server Push removal source and the `Alt-Svc`/QUIC handshake claims before using them.
- Acceptance: common rules; HTTP/3 and browser TLS-only statements are marked as documented.

### SEC-M09-04 · M · HTTP caching
- Files: module §4; `labs/ts-js/src/modules/09-web-networking-storage-security/etag-handler.ts`, `labs/ts-js/src/modules/09-web-networking-storage-security/section-4-caching.test.ts`; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M09.md §4 with its flowchart; read RFC 9111 freshness/validation sections and MDN reload behavior before claiming; Node has no HTTP cache (say so).
- Acceptance: common rules; test shows 200 -> 304 (empty body) -> 200 after a content change.

### SEC-M09-05 · M · The same-origin policy and CORS
- Files: module §5; `labs/ts-js/src/modules/09-web-networking-storage-security/section-5-cors.test.ts`; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M09.md §5 with its sequence diagram; read the Fetch Standard CORS-protocol, preflight-cache and redirect/error-response rules; no Spring snippet.
- Acceptance: common rules; every browser-behavior sentence is cited, none presented as observed.

### SEC-M09-06 · M · Cookies
- Files: module §6; `labs/ts-js/src/modules/09-web-networking-storage-security/section-6-cookies.test.ts` (jsdom); SOURCES.md; GLOSSARY-TERMS.md.
- Do: M09.md §6 with its flowchart; find a dated source for the SameSite=Lax default or leave the history out; read RFC 6265bis for schemeful same-site and the prefix rules; MDN `Partitioned`/CHIPS page for its status.
- Acceptance: common rules; the jsdom results listed in M09.md §6 are asserted, SameSite and CHIPS are documented only.

### SEC-M09-07 · M · Browser storage
- Files: module §7; `labs/ts-js/src/modules/09-web-networking-storage-security/section-7-storage.test.ts` (jsdom); SOURCES.md; GLOSSARY-TERMS.md.
- Do: M09.md §7 with its decision flowchart; read the MDN IndexedDB, Cache Storage and storage-quota pages; token storage is a link to 33.
- Acceptance: common rules; quota numbers carry "per MDN, read <date>"; jsdom's quota is not presented as a browser's.

### SEC-M09-08 · M · Content Security Policy and Trusted Types
- Files: module §8; `labs/ts-js/src/modules/09-web-networking-storage-security/csp.ts` (nonce and strict-policy helpers), `labs/ts-js/src/modules/09-web-networking-storage-security/section-8-csp.test.ts`; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M09.md §8 with its sequence diagram; read CSP Level 3 for `strict-dynamic` and the `<meta>` limits, the web.dev allowlist-bypass page, and MDN Trusted Types (Baseline status as read); Angular's CSP support is a link to 33.
- Acceptance: common rules; nonce >= 128 bits and fresh per call, hash source equals the SHA-256 of the exact text.

### SEC-M09-09 · M · Service workers and the PWA manifest
- Files: module §9; SOURCES.md; GLOSSARY-TERMS.md; a lab file only if a strategy function is shown as Complete/Excerpt (`labs/ts-js/src/modules/09-web-networking-storage-security/sw-strategies.ts` + test), otherwise Partial snippets.
- Do: M09.md §9 with its state diagram; read the Service Workers spec and MDN on updates, `updateViaCache`, and manifest installability before stating any detail; Angular specifics are a link to 37.
- Acceptance: common rules; the text says plainly that the section is documented, not run.

### QB-M09-01 · M · bank intro and Q09.01-Q09.08
- Files: module Question bank (its marker); `labs/ts-js/src/outputs/09-web-networking-storage-security/fetch-and-responses.test.ts` (Q09.03, Q09.05; local server from `support/http-server.ts`); section -> question links in sections 1-3.
- Do: the eight questions in M09.md; five-part answers (STYLE-GUIDE §5.3), at most 125 words each; Output answers asserted exactly by `it('Q09.NN …')`; every question linked once from its section and back.
- Acceptance: common rules; D1 counts equal 8.

### QB-M09-02 · M · Q09.09-Q09.16
- Files: module (its marker); `labs/ts-js/src/outputs/09-web-networking-storage-security/conditional-get.test.ts` (Q09.10), `labs/ts-js/src/outputs/09-web-networking-storage-security/cookies.test.ts` (Q09.16, jsdom); section -> question links in sections 4-6.
- Do and acceptance: as QB-M09-01, for this chunk (D1 counts equal 16).

### QB-M09-03 · M · Q09.17-Q09.22
- Files: module (its marker); section -> question links in sections 6-9. No Output question in this chunk.
- Do: as QB-M09-01; afterwards check D3 for the whole bank with the QUALITY-BAR one-liner (expected Concept 6, Difference 6, Output 4, Bug hunt 2, Trade-off 3, Design 1) and D5 against `### Q` headings of other modules.
- Acceptance: as QB-M09-01; D1 counts equal 22; D3 holds.

### EX-M09-01 · M · Exercise 09.1 · A CORS decision model
- Files: module Hands-on exercises (its marker, with the intro paragraph); `labs/ts-js/src/modules/09-web-networking-storage-security/cors-model.ts` + `cors-model.test.ts`.
- Do: M09.md Exercise 1, full E1 anatomy, <= 400 words; `describe('E09.1 …')`, one `it` per criterion titled with its wording; the text says it is a model of MDN's rules, not a browser.
- Acceptance: common rules; QUALITY-BAR E1/E2.

### EX-M09-02 · M · Exercise 09.2 · A resilient `fetch` wrapper
- Files: module (its marker); `labs/ts-js/src/modules/09-web-networking-storage-security/resilient-fetch.ts` + `resilient-fetch.test.ts` (local server, injected `sleep` and `jitter`).
- Do and acceptance: as EX-M09-01.

### EX-M09-03 · M · Exercise 09.3 · A cookie jar that follows the browser's rules
- Files: module (its marker); `labs/ts-js/src/modules/09-web-networking-storage-security/cookie-jar.ts` + `cookie-jar.test.ts` (jsdom for the shared table of cases).
- Do and acceptance: as EX-M09-01; the jsdom comparison is limited to the cases M09.md lists, and says that SameSite is not compared.

### CLOSE-M09 · M · Close module 09
- Files: module header (Short on time line; Labs paths as links), Summary, Check your understanding, Connections; one-line link edits in modules 04 and 08 listed in M09.md "Other closing material"; `PROGRESS.md` (row 09, totals); `_meta/ROADMAP.md` (row 09).
- Do: as CLOSE-M08: walk QUALITY-BAR A-H and record pass/fail per item in the LOG line; check M09.md's breadth table against the finished module; run the full verification (ts-js, Angular build and tests, tools tests, links, snippets 01-09 and 17, `module-stats.mjs`); trim named repeats if the file is above 9,600 words.
- Acceptance: common rules; no `<!-- TASK:` marker left in the module; PROGRESS row 09 updated.

### REVIEW-M09 · L · independent review of module 09
- As `REVIEW-M0x` above. Must run in a session that authored no task of module 09 (PLAN-M09 was authored by S20261006-1804-claudecode), and not in a continuation of its conversation.

### FIX-M09-01 … FIX-M09-06 · findings of REVIEW-M09

- Findings, files, sizes, Do and Acceptance per task: `_meta/reviews/REVIEW-M09.md` § Proposed FIX tasks. Verify each finding before acting; all edit the module file, so run them in order (FIX-M09-01, FIX-M09-02, FIX-M09-03, FIX-M09-04, FIX-M09-05, FIX-M09-06). FIX-M09-03 trims first so 04 and 05 keep the module at most 10,000 prose words by `module-stats.mjs`.

### Module 10 tasks (PLAN-M10) · common rules
- Inputs for every task: `_meta/modules/M10.md` (its section, question or exercise rows, the budget, "Lab decision", "Facts established while planning", the owner map), STYLE-GUIDE §3-§8, QUALITY-BAR B-E, SYLLABUS §4 (10), the module skeleton, and the "Proposed FIX tasks" of REVIEW-M05..M09 (the lessons below come from them). Re-verify every fact the task uses before writing (lab > package source > official docs/specification) and record the basis next to the claim; everything under "Not yet read" in M10.md must be read first or dropped.
- **No real browser.** Layout, `@layer`, `@media`, `@container`, nesting, `var()` resolution and stacking order are taught from cited specifications and MDN, never as a lab observation. jsdom 30.1.1 is worded "in jsdom" and runs only what M10.md lists as working; the `Section 1:` pin tests record what it does not do. Sass is a throwaway probe (observed on a date, scratch file deleted), never a committed test.
- **First-time-pass rules (recurring REVIEW findings; check each before marking done):**
  - Diagram: every section's Mental model has a Mermaid diagram (type named in M10.md) followed by a line starting `What to notice` (REVIEW-M05 T-2, M06 T-1, M07 T-1, M08 T-1, M09).
  - Misconceptions: every bullet gives the correction **and why the myth exists**; a "Once true: ... until ..." clause only from a source actually read in this task (cite or marker); otherwise only the cause. Never from memory (REVIEW-M05 T-4, M06 T-2, M07 T-3, M08 T-2, M09 T-1/T-2).
  - Status markers only in STYLE-GUIDE §3.2 forms at first mention; **Baseline is defined once** (SEC-M10-01's verification paragraph, MDN's wording) and never used as a stand-alone marker form; no Baseline or version claim unless the page was read in the task (M10.md notes two MDN pages that gave none). ECMAScript edition at first mention for post-ES2015 features in TS snippets and exercise code (REVIEW-M08 T-4, M09 T-4).
  - Every term is defined on first use in this module (the per-section term list is in M10.md) with a link to the owning module; acronyms are expanded once (CSS, BFC, CSSOM, RTL, WCAG, UA, BEM...) (REVIEW-M05 T-6, M06 T-6, M07 T-6, M08 T-5, M09 T-2).
  - Questions: each is linked from its section body with its own `[Q10.NN](#q10-NN)` (never only range endpoints), and each answer links back to its section; exercises are linked from their sections (REVIEW-M08 T-7). Forward links before the anchor exists use plain text plus `<!-- relink: #q10-NN -->` / `<!-- relink: #ex10-N -->`; each QB/EX task turns its own back into links and deletes the comments; CLOSE: `grep -c "relink:"` is 0.
  - No "mutation check" or "checked by hand" claim; every claim of the form "in the lab, X" names a test (`Section N: ...`, `Q10.NN ...`, `E10.N ...`) that exists and asserts it exactly (REVIEW-M06 T-8, M08 T-6, M09 T-5).
  - Callouts begin with the `> [!NOTE]` / `> [!TIP]` line; every *Coming from the backend* states "Where the analogy breaks" (none is required in this module) (REVIEW-M08 T-8).
  - Output questions only where a jsdom or TS test asserts the answer exactly (Q10.04, Q10.05, Q10.13, Q10.16); the answer states what jsdom computes, never what a browser would paint.
  - Exercise statements and tests: Constraints list what the model does not cover (for example no nesting `&`, no `@scope`); only behaviors the tests assert are stated as criteria (REVIEW-M09 T-5).
  - CSS and HTML blocks start with `/* Illustrative, not run */` or `/* Run in jsdom: <test name> */`; TS snippets are Complete, Excerpt or Partial per STYLE-GUIDE §7.2.
  - Prose budget: at most 10,000 words by `node labs/tools/module-stats.mjs` (and the QUALITY-BAR python one-liner); per-part budgets in M10.md leave about 1,300 words of headroom; each task measures its part and puts the count in its LOG line; any task more than 10% over budget cuts before finishing, by removing repeats and never a diagram, a trap's cause or a "because" (REVIEW-M05 T-9, M06 T-4, M07 T-8, M09 FIX-M09-03).
  - Do not repeat what another module owns (M10.md owner map): rendering cost and `will-change` are 08, shadow DOM styling is 08 §5, encapsulation and `::ng-deep` are 13, RTL is 34, animations are 35, Material tokens are 36, zoom and contrast are 11, CSP is 09 §8; use one sentence plus a link.
- Module file: replace only the task's own `<!-- TASK: <ID> ... -->` line, at the end of the task, in a single edit. Regions without their own marker (the verification paragraph, Short on time, Summary, Check your understanding, Connections) are the placeholder line under their label or heading, replaced by the task named in the placeholder. Never touch another task's marker.
- Labs: `labs/ts-js/src/modules/10-css-essentials/` and `labs/ts-js/src/outputs/10-css-essentials/` as listed in M10.md "Lab files". Tests that need CSS start with `// @vitest-environment jsdom` and use `support/dom.ts` (**built once by SEC-M10-01, read-only afterwards**; a task that needs a change records it and stops rather than editing it). No test needs the internet; no `any`.
- Every task adds its sources under `## Module 10 · CSS essentials` in `SOURCES.md` (create it after the Module 09 section if absent) and its inline-defined terms under `## Module 10` in `_meta/GLOSSARY-TERMS.md`.
- Acceptance for every task: `cd labs/ts-js && npm test` exits 0; `node labs/tools/check-snippets.mjs . 10` and `node labs/tools/check-links.mjs --planned` exit 0; every URL in the module is in SOURCES.md; only the declared files are new or changed; the task's marker is gone; no scratch or probe file is left behind (a Sass or jsdom probe lives only in the session scratchpad and is deleted).

### SEC-M10-01 · M · Box model and formatting contexts (+ jsdom helper, limit pins, verification paragraph)
- Files: module §1 and the "How the claims here are verified" paragraph; `labs/ts-js/src/modules/10-css-essentials/support/dom.ts`; `labs/ts-js/src/modules/10-css-essentials/section-1-jsdom-limits.test.ts`; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M10.md §1 with its flowchart and "What to notice"; the verification paragraph (what jsdom runs, the pinned non-features listed in M10.md Facts, the TS models, the Sass probe, the CSS-block first-line convention, Baseline defined once from MDN's wording); read CSS 2.2 §8.3.1 and §9.4.1 and CSS Display 3 before writing; pin tests named `Section 1: ...` for every item in the "NOT implemented" Facts list.
- Acceptance: common rules; the pin tests pass on jsdom 30.1.1; the text names each pin test it relies on.

### SEC-M10-02 · M · The cascade: origins, specificity and layers
- Files: module §2; `labs/ts-js/src/modules/10-css-essentials/section-2-cascade.test.ts`; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M10.md §2 with its flowchart; read Cascade Level 5 sorting and layers, Selectors 4 specificity, and the `:has()` and `@layer` MDN pages (the only candidate "Once true" lines); layered ranking from the spec text only; the Angular encapsulation sentence read from angular.dev.
- Acceptance: common rules; the tests listed in M10.md §2 exist and pass; layers are marked documented, not run.

### SEC-M10-03 · M · Flexbox, Grid and subgrid
- Files: module §3; SOURCES.md; GLOSSARY-TERMS.md (a lab test only if a claim needs it).
- Do: M10.md §3 with its decision flowchart; read Flexbox §4.5 and §7, Grid auto-fill versus auto-fit, and the subgrid page; say plainly that the section is documented, not run.
- Acceptance: common rules; every layout sentence is cited and none is presented as observed.

### SEC-M10-04 · M · Positioning, stacking contexts and z-index
- Files: module §4; `labs/ts-js/src/modules/10-css-essentials/stacking-context.ts`; `labs/ts-js/src/modules/10-css-essentials/section-4-stacking.test.ts`; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M10.md §4 with its tree diagram; read CSS 2.2 Appendix E, CSS Positioned Layout 3 (containing blocks) and the MDN stacking-context list; the helper follows the MDN list and its Complete snippet carries the Source link; the top-layer Baseline status as read.
- Acceptance: common rules; the tests listed in M10.md §4 exist, pass and say they read declared values.

### SEC-M10-05 · M · Responsive CSS
- Files: module §5; `labs/ts-js/src/modules/10-css-essentials/section-5-units.test.ts`; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M10.md §5 with its decision flowchart; find Baseline lines for container queries and range syntax or leave them out; clamp formula as in M10.md (Exercise 10.3 implements it); WCAG sentence read and linked to 11.
- Acceptance: common rules; the `em`/`rem` jsdom test passes; media and container behavior marked documented.

### SEC-M10-06 · M · Custom properties, theming and `color-scheme`
- Files: module §6; `labs/ts-js/src/modules/10-css-essentials/section-6-custom-properties.test.ts`; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M10.md §6 with its flowchart; read Custom Properties Level 1 (invalid at computed-value time, cycles), `@property`, `color-scheme` and `prefers-color-scheme` pages; the no-flash script is a Partial snippet with a link to 09 §8.
- Acceptance: common rules; the three jsdom tests pass; `var()` resolution is documented, not observed.

### SEC-M10-07 · M · Native nesting versus Sass
- Files: module §7; SOURCES.md; GLOSSARY-TERMS.md.
- Do: M10.md §7 with its sequence diagram; re-run the Sass 1.104.1 throwaway compile (from `labs/angular/node_modules/sass`, scratch dir, deleted afterwards) and quote its output with the date; read the Sass docs (`@use`, `@import` timeline), MDN nesting (find a Baseline line or leave it out) and angular.dev style-language pages; no committed Sass test, stated plainly.
- Acceptance: common rules; every Sass claim is "observed by compiling a throwaway file on <date>" or cited; `git status` shows no Sass probe file.

### QB-M10-01 · M · bank intro and Q10.01-Q10.06
- Files: module Question bank (its marker); `labs/ts-js/src/outputs/10-css-essentials/cascade.test.ts` (Q10.04, Q10.05; jsdom); section -> question links in sections 1-2.
- Do: the six questions in M10.md; five-part answers (STYLE-GUIDE §5.3), at most 120 words each; Output answers asserted exactly by `it('Q10.NN ...')`; every question linked once from its section and back; the bank intro says Output answers are jsdom results.
- Acceptance: common rules; D1 counts equal 6.

### QB-M10-02 · M · Q10.07-Q10.12
- Files: module (its marker); section -> question links in sections 3-5. No Output question in this chunk.
- Do and acceptance: as QB-M10-01 (D1 counts equal 12); layout answers cite the specification section from their section.

### QB-M10-03 · M · Q10.13-Q10.18
- Files: module (its marker); `labs/ts-js/src/outputs/10-css-essentials/units-and-custom-properties.test.ts` (Q10.13, Q10.16; jsdom); section -> question links in sections 5-7.
- Do: as QB-M10-01; afterwards check D3 for the whole bank with the QUALITY-BAR one-liner (expected Concept 4, Difference 4, Output 4, Bug hunt 2, Trade-off 3, Design 2) and D5 against `### Q` headings of other modules.
- Acceptance: as QB-M10-01; D1 counts equal 18; D3 holds; `grep -c "relink: #q10" ` is 0.

### EX-M10-01 · M · Exercise 10.1 · A specificity calculator
- Files: module Hands-on exercises (its marker, with the intro paragraph); `labs/ts-js/src/modules/10-css-essentials/specificity.ts` + `specificity.test.ts` (jsdom for the shared table).
- Do: M10.md Exercise 1, full E1 anatomy, at most 380 words; `describe('E10.1 ...')`, one `it` per criterion titled with its wording; the text says it is a model of the specification, not a browser, and names the ECMAScript edition of newer features.
- Acceptance: common rules; QUALITY-BAR E1/E2.

### EX-M10-02 · M · Exercise 10.2 · A cascade resolver with layers
- Files: module (its marker); `labs/ts-js/src/modules/10-css-essentials/cascade.ts` + `cascade.test.ts` (imports `specificity.ts` read-only).
- Do and acceptance: as EX-M10-01; read the Cascade Level 5 sort order again and cite it in the test names for the inline and important-layer cases; the text says jsdom ignores layers so those criteria are checked against the specification only.

### EX-M10-03 · M · Exercise 10.3 · A token resolver and a fluid scale
- Files: module (its marker); `labs/ts-js/src/modules/10-css-essentials/tokens.ts` + `tokens.test.ts` (jsdom for the round-trip criterion).
- Do and acceptance: as EX-M10-01; the clamp formula matches M10.md §5; the jsdom comparison is limited to `getPropertyValue` of declared custom properties and says so.

### CLOSE-M10 · M · Close module 10
- Files: module header (Short on time line; Labs paths as links), Summary, Check your understanding, Connections (the four placeholder lines); one-line link edit in module 08 Connections listed in M10.md "Other closing material"; `PROGRESS.md` (row 10, totals); `_meta/ROADMAP.md` (row 10).
- Do: as CLOSE-M09: walk QUALITY-BAR A-H and record pass/fail per item in the LOG line; check M10.md's breadth table against the finished module; run the full verification (ts-js tests and typecheck, Angular build and tests, tools tests, links, snippets 01-10 and 17, `module-stats.mjs`); trim named repeats if the file is above 9,600 words.
- Acceptance: common rules; no `<!-- TASK:` marker and no `relink:` comment left in the module; PROGRESS row 10 updated.

### REVIEW-M10 · L · independent review of module 10
- As `REVIEW-M0x` above. Must run in a session that authored no task of module 10 (PLAN-M10 was authored by S20261006-1925-claudecode), and not in a continuation of its conversation. Findings become `FIX-M10-nn` tasks appended to this file; the reviewer checks in particular every Misconceptions bullet for a cause clause, every "in the lab" claim against an existing test, and that no layout, layer, media-query or `var()` behavior is presented as observed.
