# PLANNING: Python Backend Interview Guide: Django & FastAPI

Planning record for bootstrap steps P1–P9 (per `_meta/RUN.md` §8). Each step records its status, files written, decisions, open questions, and done-by session.

## Steps Overview

| Step | Size | Status | Depends on | Done by |
|---|---|---|---|---|
| P1 | M | done | - | S20261102-1138-antigravity |
| P2 | M | done | P1 | S20261102-1138-antigravity |
| P3 | L | done | P2, G0 | S20261102-1138-antigravity |
| P4 | M | done | P1, P2 | S20261102-1138-antigravity |
| P5 | L | blocked (T-uv) | P2, P4 | S20261102-1138-antigravity |
| P6 | M | done | P3, P5 | S20261102-1138-antigravity |
| P7 | M | done | P3, P4, P5, P6 | S20261102-1138-antigravity |
| P8 | S | done | P7 | S20261102-1138-antigravity |
| P9 | S | done | P8 | S20261102-1138-antigravity |
| P9 | S | todo | P8 | - |

---

## P1: Explore and inventory

- Status: done
- Session: S20261102-1138-antigravity
- Files written: `_meta/PLANNING.md`
- Toolchain:
  | Tool | Status / Version | Notes |
  |---|---|---|
  | `uv` | Missing (`command not found`) | Blocks P5. Toolchain gate `T-uv`. Install: `brew install uv` or `curl -LsSf https://astral.sh/uv/install.sh \| sh` |
  | `docker` | CLI 29.9.2 present, daemon stopped | `colima status` reported not running; socket `/var/run/docker.sock` not connected. Docker tests will use `-m "not docker"` until started. |
  | `colima` | v0.10.3 installed | Start command for Jorge: `colima start` |
  | `node` | v24.21.0 | Available at `/opt/homebrew/opt/node@24/bin/node` |
  | `python3` | 3.10.18 | Host/brew Python (informational only; labs will use uv-managed Python) |
- Gate G0:
  - `../java-backend-guide/SYLLABUS.md` exists and lists 55 modules (01 to 55).
  - **G0 is OPEN.**
- Reference study notes:
  - **Module template:**
    - Header: What this covers, Prerequisites (deep links with `#anchor` to sections or slug if unwritten), Leads to, Applies to (framework versions), Study time, Short on time (top 2-4 sections and 3-6 Qs, plus Summary), Labs (run commands).
    - Concept sections (1..N): The problem it solves (concrete failure/cost), Mental model (analogy, table, Mermaid diagram for flows/timelines/state machines), How it actually works (internals, algorithms, runtime mechanics), Code (approach before code, numbered steps, runnable snippet), Best practices & anti-patterns ("because..." rationale), Misconceptions & traps (history, why myth exists, what changed).
    - Callouts: "Coming from Spring Boot" (mandatory where Spring equivalent exists, with "Where the analogy breaks"), "Framework vs language" (Django/FastAPI vs Python/ASGI/WSGI), "Version notes".
    - End sections: Summary, Question bank, Hands-on exercises, Check your understanding, Connections.
  - **Answer anatomy (Question bank):**
    - Tag line: `### Q<NN>.<mm> · <Type> · <Title>`
    - Collapsible `<details><summary>Answer</summary>`
    - `**Short answer (30 seconds).**`
    - `**Full explanation.**` (the why, internals, diagrams/code where needed)
    - `**Follow-ups an interviewer will ask.**` (>= 2 questions, each answered)
    - `**Trap to avoid.**`
    - Output questions: asserted by lab tests (`capsys` in pytest), short answer includes exact printed lines + reasoning.
  - **Exercise anatomy (Hands-on exercises):**
    - `**Problem.**`
    - `**Constraints.**`
    - `**Acceptance criteria.**` (markdown checkboxes `- [ ]`)
    - `<details><summary>Hint 1</summary>`, `<details><summary>Hint 2</summary>`
    - `<details><summary>Worked solution</summary>`: Approach → Code (fenced snippet with source link) → How each criterion is met (mapping criterion to test) → Alternative approach + Trade-offs → Interviewer follow-ups (2-4, answered).
  - **Verification density:**
    - Every factual claim has an explicit basis: lab test name, package source/AST inspection, or official doc link.
    - No unverified claims from memory. If unverified, marked `> **Unverified:** ...` and tracked in `_meta/UNVERIFIED.md`.
- Decisions:
  - Adopt Angular guide's structure and quality bar, adapted for Python backend development (FastAPI & Django), with Spring Boot cross-comparisons.
  - Since `uv` is missing, record toolchain gate `T-uv`. P5 will scaffold what it can and be blocked if `uv` is not yet installed.
- Open questions:
  - None for P1.

---

## P2: Versions

- Status: done
- Session: S20261102-1138-antigravity
- Files written: `VERSIONS.md`, `SOURCES.md`
- Decisions:
  - Chosen lab Python version: **Python 3.13**. Binding constraint: `celery` 5.6.3 and `gunicorn` 26.2.0 have classifiers up to 3.13 (no official 3.14 classifiers yet); lower bound is 3.11 (`starlette` 1.10.0, `sqlalchemy` 2.1.6, `django-stubs` 6.1.2 require `>=3.11`). Python 3.10 is EOL (October 2026).
  - Django line: 6.1.x as current feature release (6.1.2); 5.2 LTS (5.2.18) as current LTS release (supported until April 2028).
  - Framework choices: FastAPI 0.162.0 with Starlette 1.10.0 and Pydantic 2.14.2 (`pydantic-settings` 2.16.2).
  - Persistence: SQLAlchemy 2.1.6 (2.0 unified API with native async sessions); Psycopg 3.3.6 (psycopg 3); Redis 8.1.0 (`redis.asyncio`).
  - Async MongoDB: PyMongo 4.19.0 (with official async API) and Motor 3.7.1.
  - Messaging: Confluent Kafka 2.16.1 (`librdkafka`), aiokafka 0.15.0, Celery 5.6.3.
  - Free-threaded CPython status: Introduced in 3.13 (PEP 703) as experimental (`python3.13t`), continued provisional evaluation in 3.14/3.15.
- Open questions:
  - None. All packages and lifecycle tables retrieved from primary PyPI JSON and vendor release pages.

---

## P3: Syllabus

- Status: done
- Session: S20261102-1138-antigravity
- Files written: `SYLLABUS.md`
- Decisions:
  - 53 modules across 11 parts (A through K): 44 core modules (cap 18,000 words, Q ceiling 24-40, Ex ceiling 3-6) and 9 supporting modules (cap 9,000 words, Q ceiling 14-20, Ex ceiling 2-3).
  - Pilot module: Module 14 (`fastapi-dependency-injection-and-execution`), cap 23,000 words, 40 Q ceiling, 6 Ex ceiling. Deep Spring Boot IoC comparisons and sync vs async threadpool traps.
  - Every bullet of RUN.md §8.2 mapped to an explicit checklist item.
  - Cross-guide delegation: 24 topic delegations mapped directly to verified slugs in `../java-backend-guide/SYLLABUS.md`.
  - §1 table formatted with `# | Slug | Part | Kind | Q | Ex | Prose cap | Lab | Prerequisites` for tool compatibility.
- Open questions:
  - None.

---

## P4: Style and quality bar

- Status: done
- Session: S20261102-1138-antigravity
- Files written: `STYLE-GUIDE.md`, `_meta/QUALITY-BAR.md`
- Decisions:
  - Formatter & Linter: `ruff` (`ruff format`, `ruff check`).
  - Type Checker: `mypy` running with pinned Python 3.13. In `labs/django`, mypy runs with the `django-stubs` plugin; in `labs/fastapi` and `labs/python`, mypy runs in strict mode.
  - Injected dependency definition (STYLE-GUIDE §7.2): A constructor parameter receiving a collaborator object, a FastAPI `Depends()` parameter, or a collaborator object in a Django view. Configs, ORM model managers, and stdlib objects do not count toward the 4-dependency limit.
  - Angular-specific rules dropped / adapted:
    - Dropped: MDN browser baseline markers (`[Baseline <year>]`), Angular CLI schematics, Zone.js / Change Detection checks, DOM/CSS guidelines.
    - Adapted: Snippet kinds for Python (`# Complete:`, `# Excerpt of`, `# Partial:`, and Output with pytest `capsys` assertions); Callouts for "Coming from Spring Boot" (with "Where the analogy breaks"), "Framework vs language", and "Version notes".
    - Backend extensions in QUALITY-BAR (Section F): failure modes under load, production scenario triage questions, verified numbers in trade-off tables, operational concerns (logging, configuration, telemetry, graceful shutdown), topic-specific security threats, and Spring Boot comparison coverage.
- Open questions:
  - None.

---

## P5: Labs

- Status: blocked (T-uv)
- Session: S20261102-1138-antigravity
- Files written: `.gitignore`, `labs/python/.python-version`, `labs/python/pyproject.toml`, `labs/python/tests/test_smoke.py`, `labs/django/.python-version`, `labs/django/pyproject.toml`, `labs/django/config/settings.py`, `labs/django/config/urls.py`, `labs/django/tests/test_smoke.py`, `labs/fastapi/.python-version`, `labs/fastapi/pyproject.toml`, `labs/fastapi/tests/test_smoke.py`
- Toolchain Gate recorded:
  - Gate ID: `T-uv`
  - Reason: `uv` is not installed on PATH.
  - Install command for Jorge: `brew install uv` (or `curl -LsSf https://astral.sh/uv/install.sh | sh`)
- Decisions:
  - All three core lab folders scaffolded with pinned Python 3.13, dependency pins matching VERSIONS.md, ruff/mypy configs, and smoke tests.
  - Labs marked blocked until Jorge installs `uv`.

---

## P6: Tools

- Status: done
- Session: S20261102-1138-antigravity
- Files written: `labs/tools/check-links.mjs`, `labs/tools/check-links.test.mjs`, `labs/tools/module-stats.mjs`, `labs/tools/module-stats.test.mjs`, `labs/tools/check-snippets.mjs`, `labs/tools/check-snippets.test.mjs`
- Evidence:
  - `node --test labs/tools/*.test.mjs`: exit 0 (14 tests passed across 3 suites)
  - `node labs/tools/check-links.mjs --planned`: exit 0 ("All links and anchors resolve.")
- Decisions:
  - `check-links.mjs` supports `--planned` flag and checks cross-guide links against `../java-backend-guide/SYLLABUS.md`.
  - `module-stats.mjs` parses this guide's §1 table with 8+ columns and checks ceilings, floors, and QUALITY-BAR D3 tag criteria.
  - `check-snippets.mjs` checks `py`/`python` code blocks for `# Complete:`, `# Excerpt of`, `# Partial:`, and `Output` question context.
- Open questions:
  - None.

---

## P7: Job state

- Status: done
- Session: S20261102-1138-antigravity
- Files written: `_meta/STATE.md`, `_meta/TASKS.md`, `_meta/ROADMAP.md`, `_meta/UNVERIFIED.md`, `_meta/CALIBRATION.md`, `_meta/GATES.md`, `_meta/LOG.md`, `PROGRESS.md`, directories `_meta/modules/` and `_meta/reviews/`.
- Decisions:
  - `STATE.md` keeps current state under 60 lines with single source of truth.
  - `TASKS.md` queues pilot module planning `PLAN-M14` as first active task, blocked on toolchain gate `T-uv`.
  - `GATES.md` records G0 open, G1 closed (awaiting Jorge after pilot), and `T-uv` open/blocking.
  - `PROGRESS.md` initialized with 53 planned modules.
- Open questions:
  - None.

---

## P8: Cold-start dry run

- Status: done
- Session: S20261102-1138-antigravity
- Files checked: All references and job state files in `_meta/` and root.
- Evidence:
  - `_meta/STATE.md`: 19 lines (limit <= 60 lines).
  - `git diff --cached --name-only`: exit 0, empty output.
  - `node --test labs/tools/*.test.mjs`: exit 0 (14/14 tests pass).
  - `node labs/tools/check-links.mjs --planned`: exit 0 ("All links and anchors resolve.").
  - `node labs/tools/check-snippets.mjs`: exit 0.
  - `node labs/tools/module-stats.mjs`: exit 0 (parsed 53 modules).
- Decisions:
  - Dry run passed with zero broken links or anchor failures.
  - No defects in RUN.md found.
- Open questions:
  - None.

---

## P9: Bootstrap Report

- Status: done
- Session: S20261102-1138-antigravity
- Bootstrap verification checklist:
  - P1–P9 complete: P1, P2, P3, P4, P6, P7, P8, P9 are `done`; P5 is `blocked (T-uv)`.
  - All core specification and job state files created and validated.
  - `node --test 'labs/tools/*.test.mjs'`: exit 0 (14/14 tests pass).
  - `node labs/tools/check-links.mjs --planned`: exit 0 (0 broken links/anchors).
  - `git diff --cached --name-only`: exit 0 (empty).
- Gate status:
  - G0 (Java syllabus): OPEN.
  - T-uv (uv toolchain): BLOCKS lab execution until Jorge installs `uv` (`brew install uv`).
  - G1 (Pilot approval): Closed, waiting for Jorge after M14 pilot review.
