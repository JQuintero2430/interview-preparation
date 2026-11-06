# QUALITY-BAR: Python Backend Interview Guide

The measurable quality standard for the Python Backend Interview Guide (RUN.md §1). Every writing task meets the items that apply to what it writes; `CLOSE-Mxx` checks the whole list for the module; `REVIEW-Mxx` re-checks it independently and records one pass/fail line per item.

Each item specifies **how to check** it. Verifications are run via scripts/grep, never eyeballed. "Prose words" means words outside fenced code blocks, counted over the entire module file (RUN.md §9: 18,000 for core modules, 23,000 for pilot M14, 9,000 for supporting modules).

---

## A. Module Frame

- [ ] **A1 Header completeness.** Required fields present in STYLE-GUIDE §4.1 order: What this covers, Prerequisites, Leads to, Applies to, Study time, Short on time, Labs (with the pytest run command). *Check:* Read the first 12 lines of the module file.
- [ ] **A2 Prerequisites deep-link.** Prerequisites linking to written modules link to exact section anchors (`#anchor`), not only the file. *Check:* Link-check tool plus manual scan.
- [ ] **A3 Short on time.** Names 2–4 sections and 3–6 questions that cover the most-asked material, ending with a link to Summary. *Check:* Verify every link resolves.
- [ ] **A4 Contents table.** Links every concept section and closing sections (Summary, Question bank, Hands-on exercises, Check your understanding, Connections). *Check:* Count of `## ` headings matches TOC links.
- [ ] **A5 Order of concepts.** Sections progress monotonically from the foundational mental model to deep runtime internals, ending with the deepest mechanics. *Check:* Reviewer assessment.

---

## B. Concept Sections (each `## N.` section)

- [ ] **B1 Subsections completeness.** All subsections from STYLE-GUIDE §4.2 present in order: `### The problem it solves`, `### Mental model`, `### How it actually works`, `### Code`, `### Best practices and anti-patterns`, `### Misconceptions and traps`. *Check:* `grep -c` for each subsection heading equals the number of concept sections.
- [ ] **B2 Concrete problem.** "The problem it solves" presents a concrete failure (data corruption, event loop block, race condition, memory leak, unhandled exception), not an abstract definition. *Check:* Reviewer reads every problem statement.
- [ ] **B3 Mental model with an analogy & diagram.** An accessible analogy, comparison table, and Mermaid diagram wherever the mechanism is a state machine, pipeline, lifecycle, or dependency DAG. Every diagram has a "What to notice:" sentence. *Check:* Reviewer checks presence of diagrams.
- [ ] **B4 Internal depth.** "How it actually works" reaches CPython bytecode, GIL mechanics, event loop scheduling, descriptor lookups, or SQL compilation. Answers "why does Python behave this way?". *Check:* Reviewer confirms technical depth.
- [ ] **B5 Approach before code.** Every code snippet is preceded by 1–2 sentences explaining the approach and numbered steps. *Check:* Reviewer scans each `### Code` block.
- [ ] **B6 Rationale on best practices.** Every best practice or anti-pattern item includes an explicit "because..." rationale. *Check:* Reviewer scans each item.
- [ ] **B7 Misconceptions with historical context.** Traps explain why the myth exists, what is actually true, and the version history when behavior changed. *Check:* Reviewer checks traps.
- [ ] **B8 Callouts present.**
  - *Coming from Spring Boot:* Required wherever a Spring equivalent exists, with `> **Where the analogy breaks:**`.
  - *Framework vs language:* Highlights what the framework does vs what Python or the ASGI/WSGI server does.
  - *Version notes:* Flags version-specific differences.
  *Check:* `grep -c 'Coming from Spring Boot'` and `grep -c 'Where the analogy breaks'`.
- [ ] **B9 Terminology defined on first use.** Every technical term is defined inline at its first appearance. *Check:* Reviewer spot-check.
- [ ] **B10 Cross-guide links over repetition.** Core backend concepts (HTTP, database indexing, distributed transactions) link to `../java-backend-guide/` rather than re-explaining from scratch. *Check:* Reviewer checks cross-guide references.

---

## C. Accuracy and Verification

- [ ] **C1 Verified basis for every claim.** Every factual claim is backed by a named lab test, a cited package source file/AST, or an official doc URL. No claims from memory. *Check:* Reviewer samples at least 20 claims across the module.
- [ ] **C2 Output answers asserted by tests.** Every question tagged `Output` is asserted by a pytest test using `capsys` asserting exact stdout or error output. *Check:* Grep for `test_qNN_*` in labs matching question IDs.
- [ ] **C3 Lab claims tested.** Any text asserting "in the lab, X occurred" links to a passing test. *Check:* Test command runs and passes.
- [ ] **C4 Status markers on non-stable APIs.** First mention of non-stable or version-sensitive APIs carries an exact status marker from STYLE-GUIDE §3. *Check:* `grep` for status markers.
- [ ] **C5 Pinned versions respected.** No API or syntax used that is absent from VERSIONS.md. *Check:* Tests pass under pinned Python 3.13.
- [ ] **C6 No unrecorded uncertainty.** Every `> **Unverified:**` has an open row in `_meta/UNVERIFIED.md`. *Check:* `grep -c 'Unverified'` matches open ledger entries.
- [ ] **C7 Snippet kinds marked.** Every fenced `python` block is Complete (`# Complete:`), Excerpt (`# Excerpt of`), Partial (`# Partial:`), or Output under an `Output` question. *Check:* `node labs/tools/check-snippets.mjs` exits 0.
- [ ] **C8 Sources documented.** Every cited URL and primary source is recorded in `SOURCES.md`. *Check:* Reviewer verifies against SOURCES.md.

---

## D. Question Bank

- [ ] **D1 Answer anatomy.** Every answer strictly follows: `Short answer (30 seconds)` → `Full explanation` → `Code` (optional) → `Follow-ups an interviewer will ask` (>= 2, answered) → `Trap to avoid`. *Check:* `grep` counts of each bold header match the total question count.
- [ ] **D2 Output short answer completeness.** `Output` questions provide exact printed lines plus 1–2 sentences explaining the execution sequence. *Check:* Reviewer checks Output questions.
- [ ] **D3 Question type diversity.** At least 4 distinct type tags across the bank; includes at least one `Trade-off`, at least one `Bug hunt` or `Design`, and no tag exceeds 60% of the total. *Check:* Script analysis of tags.
- [ ] **D4 Progression from basic to internal.** Questions progress from foundational concepts to subtle edge cases and production trade-offs. *Check:* Reviewer reads question sequence.
- [ ] **D5 No duplicate questions.** Questions do not repeat within the module or across other modules. *Check:* Grep across existing question titles.
- [ ] **D6 Bidirectional linking.** Concepts link to relevant questions (`[QNN.mm](#qnn-mm)`), and questions link back to concept sections. *Check:* Count of question links in body >= total questions.
- [ ] **D7 Permanent anchors.** `<a id="qNN-mm"></a>` precedes every question header. *Check:* Link-check verification.
- [ ] **D8 Ceilings and floors respected.** Within SYLLABUS §1 ceilings; meets STYLE-GUIDE minimum floors (core: >= 20 Q, supporting: >= 12 Q). *Check:* `grep -c '^### Q'` matches SYLLABUS bounds.

---

## E. Hands-on Exercises

- [ ] **E1 Exercise anatomy.** Every exercise includes: Problem → Constraints → Acceptance criteria checklist (`- [ ]`) → Hints (collapsible) → Worked solution (`Approach` → runnable code → `How each criterion is met` → `Alternative approach` + `Trade-offs` → `Interviewer follow-ups` [2–4]) → Tests link. *Check:* Reviewer checks each exercise.
- [ ] **E2 1:1 Criteria to tests mapping.** Every acceptance criterion maps to a named pytest test function, and every test verifies a stated criterion. *Check:* Reviewer maps criteria to test functions in `tests/test_exNN_m.py`.
- [ ] **E3 Realistic backend scenarios.** Exercises solve real backend problems (e.g., connection starvation recovery, distributed token bucket rate limiter, idempotency deduplication). *Check:* Reviewer assessment.
- [ ] **E4 Clean production code.** Solutions follow modern idiomatic Python 3.13: fully type-hinted, <= 4 injected dependencies, formatted with Ruff, passing Mypy. *Check:* Scoped check commands pass.
- [ ] **E5 Predict-the-behavior task.** At least one `Output` question or exercise asserting exact execution sequence or output. *Check:* Count of `Output` >= 1.

---

## F. Backend-Specific Quality Bar

- [ ] **F1 Failure modes and load behavior.** The module explicitly covers how the component or framework behaves under load: thread starvation, database connection leaks, event loop latency spikes, memory bloat, or worker crashes. *Check:* Reviewer verifies load behavior coverage.
- [ ] **F2 Production scenario questions.** Includes at least one question or exercise focused on real-world production triage (e.g. diagnosing why response latency suddenly jumped to 30 seconds, or tracing an unhandled async task exception). *Check:* Tag check for `Production scenario`.
- [ ] **F3 Verified numbers in trade-off tables.** Benchmark numbers, latency figures, or throughput stats in trade-off tables are either cited from official benchmarks or tested in labs. No fabricated numbers. *Check:* Reviewer verifies table citations.
- [ ] **F4 Operational concerns covered.** Addresses operational requirements: configuration parsing (`pydantic-settings` / `django.conf.settings`), structured JSON logging, health checks, OpenTelemetry tracing, and graceful shutdown. *Check:* Reviewer checks operational coverage.
- [ ] **F5 Security considerations per topic.** Analyzes topic-specific security threats (e.g., SQL injection in raw queries, pickle deserialization in Celery, timing attacks in password verification, JWT algorithm confusion, CORS/CSRF vulnerabilities). *Check:* Reviewer checks security coverage.
- [ ] **F6 "Coming from Spring Boot" coverage.** Every topic in the module that has an equivalent Spring/Java pattern provides an accurate Spring Boot comparison with an explicit "Where the analogy breaks" section. *Check:* Reviewer verifies coverage against module topic checklist.
