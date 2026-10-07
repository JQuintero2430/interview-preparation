# RUN.md: session protocol for the Angular & Full-Stack Interview Guide

<!--
This file is the standing prompt. It is identical in every session, whatever the harness or model.
It never lists the next steps: those live in _meta/ (see section 2). Only Jorge edits this file.
Launch line Jorge pastes after /clear:
  Read angular-fullstack-guide/_meta/RUN.md and follow it. USAGE: <NN>% RESETS: <HH:MM>
-->

You are one session in a long, multi-session job. Earlier sessions may have run on a different harness or a different model, and you have no memory of them. The repository is your only memory. This file tells you how to find where the job stands, how to pick the next unit of work, how to do it at full quality, and how to leave the repository so the next session, which may be another model, can continue without guessing.

Repository: `/Users/jorge.quintero/IdeaProjects/interview-preparation`. Guide root: `angular-fullstack-guide/`. All paths below are relative to the guide root unless they start with the repo name.

---

## 0. Usage gate: run this before reading anything else

The launch message contains `USAGE: NN%`: the share of the current rate-limit window already consumed, as shown by the harness's usage display. It may also contain `RESETS: HH:MM`, the time that window resets.

- If no USAGE value is given, ask for it in one line and wait. Do not read any file first. You cannot reliably measure your own rate-limit consumption, so do not guess it.
- **U ≥ 80%:** reply `Usage gate: stop (U%). Nothing done.` and end the session.
- **70% ≤ U < 80%:** **Small mode**. Only tasks of size S.
- **U < 70%:** **Normal mode**.

During the session, track an estimate E = U + the sum of the estimated costs of the tasks you have finished. Task costs, in percentage points per size, are in `_meta/CALIBRATION.md` for your harness and model; if there is no row yet, use S = 2, M = 5, L = 10. If the harness shows you real usage (a status line or output you can read), use that instead of E.

Before starting each task:
- **Normal mode:** start an M or L task only if E + cost ≤ 70. Otherwise switch to Small mode.
- **Small mode:** start an S task only while E < 80. When E ≥ 80, end the session (section 12).
- If the provider returns a rate-limit or quota error, stop immediately. Your last finished task (recorded in STATE) is the safe point. Do not try to write anything else; the next session's restart protocol recovers any interrupted task.

## 1. Mission and quality bar

Finish a study guide for full-stack technical interviews centered on Angular 22, for a reader who may be a beginner or preparing for an architect-level interview. The guide must teach, not only list answers. Each concept goes problem → mental model → mechanism → code → best practices → traps. Each module ends with a question bank whose answers are collapsible, hands-on exercises with tests, self-check prompts, and connections to other modules. Content is never labeled by seniority; it progresses from the basic idea to the internals.

Quality is the constraint that never bends. The target is to match or exceed the React guide in this repo (`interview-preparation/React Full-Stack Interview Guide/`) and the approved Angular pilot (`../modules/17-signals.md`). `_meta/QUALITY-BAR.md` turns that target into a checklist. Every writing task meets it on the first pass: there are no drafts to polish later and no trim passes. If a task cannot be done at that quality within the usage left, do not start it.

## 2. Where everything lives

Binding references (read only the parts a task needs):
- `../STYLE-GUIDE.md`: the module template, writing and code rules, status markers, and the snippet kinds.
- `../SYLLABUS.md`: §1 module list and targets, §4 per-module topic checklists, §7 resolved decisions.
- `../VERSIONS.md`: the versions everything is written against.
- `_meta/QUALITY-BAR.md`: the measurable quality checklist.

Job state (the session-to-session memory):
- `_meta/STATE.md`: the single source of truth, kept under 60 lines: phase, current module, the `In progress` line (task ID, session, start time, or `none`), last finished task, next task, counts, open UNVERIFIED count, and the last full-verification result.
- `_meta/TASKS.md`: the task queue: ID, size, status (`todo`/`in_progress`/`done`/`blocked`), dependencies, files touched, inputs to read, acceptance checks, and `Done by` (session ID and model) once done.
- `_meta/ROADMAP.md`: module order and the remaining phases. This is where planning the next module comes from.
- `_meta/modules/Mxx.md`: the detailed plan of each module (section 9).
- `_meta/LOG.md`: an append-only session log.
- `_meta/UNVERIFIED.md`: a ledger of claims not yet verified. It must be empty at the finish.
- `_meta/CALIBRATION.md`: measured usage cost per task size, per harness and model.
- `../PROGRESS.md`: the human-facing dashboard (one row per module), updated by CLOSE tasks.

## 3. Restart protocol (every session, after the gate)

1. If `_meta/STATE.md` does not exist, go to section 8 (bootstrap).
2. Read `_meta/STATE.md`, the last entry of `_meta/LOG.md`, and the `TASKS.md` entries for the current module only.
3. Reconcile, in this order. Git is not the job's memory here: all work stays uncommitted on purpose, so `git status` and `git diff` only help you inspect files, never tell you what is done.
   - **`In progress` is set in STATE** (not `none`): that task was interrupted. Check its acceptance checks against the files it declares.
     - If they all pass, the work was finished but not recorded: mark it `done` and log it.
     - If they do not, re-run the task from the start. Tasks are idempotent (section 5), so redoing one overwrites only its own files and its own marker region.
     - If you cannot tell what happened, ask before touching the files.
   - **The last LOG entry has no session-end line**: the previous session was cut off. Add a line saying so, with the last task it finished according to TASKS.md.
   - **STATE disagrees with TASKS.md or with the files on disk**: the files on disk win, then TASKS.md. Correct STATE.
   - If `RESETS` matches the previous LOG entry's window, update `_meta/CALIBRATION.md` (section 11).
   - If Jorge has committed some of the work himself since the last session, that is expected and changes nothing.
4. Never discard, revert, reset, stash or overwrite changes that do not belong to the task you are running.
5. Print an assessment of at most 6 lines:
   - **Started from:** what the job is.
   - **Now:** the phase, module and last task, plus modules done out of 47.
   - **Heading to:** the next task and the next milestone.
   - **Usage mode:** U%, the mode, and how many tasks of each size fit.
   - **Unverified:** the number of open items.
   - **Risks:** anything found during reconciliation.

## 4. Choosing the next task

The rule, in priority order:
1. Any `todo` VERIFY task (it resolves an UNVERIFIED item).
2. Any `todo` FIX task produced by a review.
3. The first `todo` task in `TASKS.md` whose dependencies are `done` and whose size fits the usage mode.
4. In Small mode, if nothing in 1–3 fits, take an S task from the "Small-task pool" section of `TASKS.md`. If the pool is empty, end the session.
5. If the queue has no `todo` tasks left, the next task is `PLAN-Mxx` for the next module in `ROADMAP.md`. When every module is closed and reviewed, the next tasks come from the finish line (section 13).

A REVIEW task must run in a different session from the one that wrote the module (compare your session ID with the `Done by` fields of the module's tasks in TASKS.md). Prefer a different model when one is available. If the only eligible task is a REVIEW of work done in this same session, skip it and take the next one.

## 5. Task types and size

| Type | Size | What it does |
|---|---|---|
| `PLAN-Mxx` | M | Writes the module plan and skeleton, and appends the module's tasks (section 9). |
| `SEC-Mxx-nn` | M/L | Writes one concept section, with its lab code and tests. |
| `QB-Mxx-nn` | M | Writes a chunk of at most 8 questions, with full answers and any Output tests. |
| `EX-Mxx-nn` | M | Writes one exercise: statement, hints, solution, alternative, and tests in labs. |
| `CLOSE-Mxx` | M | Writes check-your-understanding and connections, runs the full verification, checks QUALITY-BAR, and updates PROGRESS.md. |
| `REVIEW-Mxx` | L | Independent read of the whole module (fresh session); findings become FIX tasks. |
| `FIX-Mxx-nn` | S/M | Resolves one review finding or a closely related group. |
| `VERIFY-nn` | S | Resolves one UNVERIFIED item: verify the claim and update the text, or remove the claim. |
| `HOUSE-nn` | S | Small upkeep: link fixes, merging sources or glossary terms, calibration, dashboard rows. |

Every task is atomic and idempotent:
- It touches only the files it declares.
- It ends with the job state updated (section 6, step 5), which is the moment it counts as done.
- It leaves the repository valid: the touched labs typecheck and pass, and the touched Markdown has no broken anchors.
- It can be re-run from the start safely. Content is written into the module file by replacing the task's own `<!-- TASK: <ID> -->` marker region in a single edit, at the end of the task, never in pieces. Lab files the task declares are overwritten as a whole.

If a task turns out bigger than its size, split it in `TASKS.md` before starting rather than running over.

## 6. Doing a task

0. **Claim the task.** In STATE set `In progress: <ID> (<session>, <start time>)`, and in TASKS.md set its status to `in_progress`.
1. **Read only the task's declared inputs.** For a writing task, also read the module plan entry and the last 40 lines of the preceding section, for continuity of voice and terms.
2. **Write at final quality.** Follow STYLE-GUIDE and QUALITY-BAR. Before non-trivial code, explain the approach, walk through the steps, then show the code. Use "Coming from the backend" and "Framework vs platform" callouts where STYLE-GUIDE requires them.
3. **Verify as you write.** Check every factual claim before marking the task done, in this order of preference:
   - (a) Run it in `../labs`, with a test that asserts the behavior. Every "what does this print?" answer is asserted by a test.
   - (b) Read the shipped package source or typings (`npm pack <pkg>@<version>`, then inspect the files).
   - (c) Read the official documentation or changelog.
   Record the basis of each claim the way STYLE-GUIDE says. If a claim cannot be verified within this task, remove it, or keep it only after adding an entry to `_meta/UNVERIFIED.md` (the claim, where it is, how to verify it) and adding a `VERIFY` task at the front of the queue. Never leave a claim whose basis is your own memory.
4. **Run the checks, one at a time.** Use Node 24 (`../labs/.nvmrc`; on this Mac: `export PATH=/opt/homebrew/opt/node@24/bin:$PATH`):
   - the tests scoped to the module's lab folder;
   - typecheck (and `ng build` when Angular code changed);
   - `node labs/tools/check-links.mjs`.
   Keep only failures and totals in context. If any check fails, fix it before updating the job state.
5. **Update the job state.** This is the save point, so do it right after the checks pass:
   - in `TASKS.md`, mark the task `done` and fill `Done by` (session ID and model);
   - in `STATE.md`, set `In progress: none`, the last task, the next task, and the counts;
   - in `LOG.md`, append one line: task ID, session, a one-line summary, the files touched, and the check results (command → result). The files list is what Jorge uses to review each task in his IDE.

## 7. Working-tree rules (no git writes)

Jorge reviews every change in his IDE, so all work stays as uncommitted changes in the repository's original working tree, on its current branch.

- Never run `git add`, `git commit`, `git stash`, `git reset`, `git checkout -- <file>`, `git restore`, `git rebase`, `git push`, or create branches, worktrees or tags. Read-only git commands (`status`, `diff`, `log`, `show`) are fine.
- Write only under `angular-fullstack-guide/`. The one exception is the single README link added at the finish line.
- Never leave build output, `node_modules`, caches or scratch files outside what `../.gitignore` already ignores. Delete any temporary file you create before the task ends.
- Session ID format: `S<YYYYMMDD-HHMM>-<harness>`. Create it once, at the start of the session.

## 8. Bootstrap (only when `_meta/STATE.md` does not exist)

Known state as of 2026-10-04, which the bootstrap must confirm against the files:
- Phases 0–2 are done. Module 17 (Signals) is the approved, reviewed pilot.
- Modules 01–04 are written and the `../labs/ts-js` tests pass. Still missing: Output answers cross-checked against the test assertions, sources and glossary terms collected, and an independent review. Their prose is over the 10k cap. Do not trim them for length; only a review finding of redundancy justifies cutting.
- All of this is uncommitted, and it stays that way. `../PROGRESS.md` mentions old session IDs and agents that no longer exist.

Bootstrap tasks, in order (each one ends with the job state updated, like any task):
1. **B1 (S): baseline.** Run the full lab checks and record the results and the list of existing guide files as the first LOG entry. This is the reference point later sessions compare against.
2. **B2 (M): job state.**
   - Create the `` files from section 2.
   - Write `ROADMAP.md` from SYLLABUS §6 (batches dissolve into one module at a time, in the same order: 05–11, 12–16, 18–21, 22–30, 31–40, 41–47, then the finish line).
   - Add the closeout tasks for 01–04 to `TASKS.md`: per module, one VERIFY-outputs task (M), one HOUSE harvest task for sources and glossary terms (S), and one REVIEW task (L).
   - Fill the Small-task pool.
   - Rewrite `../PROGRESS.md` as the dashboard.
3. **B3 (L): quality bar.**
   - Study the React guide and `../modules/17-signals.md`: their structure, answer anatomy, mix of question types, exercise anatomy, verification density, diagrams and cross-linking.
   - Write `_meta/QUALITY-BAR.md` as a checklist of concrete, checkable items that takes the best of both. Wherever the React guide is stronger, record the gap and amend STYLE-GUIDE.
   - Add FIX tasks for any gap module 17 or modules 01–04 have against the new bar.
   - Do not copy React content.

After the bootstrap, continue with section 4.

## 9. What PLAN-Mxx must produce

1. **`_meta/modules/Mxx.md`.** The module plan:
   - every SYLLABUS §4 checkbox mapped to a section or a question (the breadth gate: the plan is not done until every checkbox is mapped);
   - per section: its topics, the key claims, how each claim will be verified (a test name or a source), and a word budget;
   - the question list: titles, types (concept, difference, output, bug hunt, design, trade-off), ordered from the basic idea to the internals;
   - the exercise list, with acceptance criteria;
   - the questions that belong to other modules, which are linked instead of repeated. Check the `### Q` headings across the existing modules.
2. **The module file skeleton.** Every heading and anchor, with a marker `<!-- TASK: <ID> -->` where each future task writes.
3. **Tasks.** SEC, QB, EX and CLOSE tasks appended to `TASKS.md`, each with its inputs, its files and its acceptance checks.

Targets: Part D (Angular) matches the pilot's depth. Parts A, B, C and E are 8,000–10,000 words of prose per module. Parts F and G are as deep as the topic needs. The question and exercise numbers in SYLLABUS §1 are ceilings. The floors in STYLE-GUIDE are minimums. No filler.

## 10. Content and code rules

- Use only APIs that actually exist in `../VERSIONS.md`. Mark every API that is not plainly stable with its status as STYLE-GUIDE defines it. Teach modern Angular as the default, with legacy contrasts where companies still use the old way.
- Code:
  - low cyclomatic complexity;
  - at most 4 injected dependencies per class (group related functionality behind an intermediate service);
  - design patterns instead of long classes;
  - modern Angular by default (standalone, `inject()`, signals, the new control flow), and legacy style only when the example is about legacy.
- Spring Boot snippets are illustrative and not compiled (SYLLABUS §7), but they must be accurate for Spring Boot 4 / Spring Security 7.
- Do not change the default Node or install anything globally. Playwright installs Chromium only, and only for module 30.
- Do not modify `../modules/17-signals.md` except through a FIX task.

## 11. Calibration

Each LOG session entry records: Session, Harness, Model, U at start, RESETS, the tasks done with their sizes, and E at the end. When a new session starts with the same RESETS value as the previous entry and on the same harness and model, the real cost is U(new) − U(previous start). Divide it across the previous session's tasks in proportion to their default sizes, and update the averages in `CALIBRATION.md` (a HOUSE task, or part of the restart reconciliation).

## 12. End of session (when you stop for any reason other than a rate-limit error)

1. Append the LOG session entry (section 11), ending with a `Session end` line and a "Next session should" line that only points at STATE. It never contains instructions that contradict this file.
2. Make sure STATE is current and `In progress` is `none`.
3. Reply to the user in at most 8 lines: the tasks done (IDs), the files to review in the IDE, E, the next task, the open UNVERIFIED count, and the launch line to paste after `/clear`.

## 13. Finish line

When every module in ROADMAP is closed and reviewed, PLAN the finish tasks:
- a cross-module consistency REVIEW (contradictions, duplicated questions, uniform status markers);
- `QUESTION-INDEX.md`, generated by a script from the `### Q` headings;
- `GLOSSARY.md`, `CHEATSHEET.md`, `MOCK-INTERVIEWS.md`;
- `README.md`, with a Mermaid prerequisite map and study paths described by goal;
- the single link added to the repo-root `README.md`.

The job is done only when all of the following hold, with evidence (command, exit code, one-line result) recorded in the final LOG entry:
- [ ] All 47 modules are `done` in PROGRESS.md, each CLOSEd, REVIEWed, and with its FIX tasks done.
- [ ] A script confirms every module meets its STYLE-GUIDE floors and its prose cap.
- [ ] `_meta/UNVERIFIED.md` has zero open items.
- [ ] `../labs/ts-js`: `npm test` exits 0. `labs/angular`: `ng build` and `ng test --watch=false` exit 0.
- [ ] `check-links.mjs` reports 0 broken links and anchors.
- [ ] The root files exist, and the repo README links to the guide.
- [ ] `git diff --cached --name-only` is empty (nothing staged, nothing committed by you), and no build output, caches or temporary files are left outside `../.gitignore`.

IMPORTANT: never mark the job done while any item above is unchecked.
