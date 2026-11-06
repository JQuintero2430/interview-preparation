# TASKS

The queue of work for the Python Backend Interview Guide (RUN.md §2, §5).

## Standard checks

Run serialized from the lab folder before marking any task `done`:

```bash
# In labs/python:
uv run ruff format && uv run ruff check && uv run mypy . && uv run pytest

# In labs/django:
uv run ruff format && uv run ruff check && uv run mypy . && uv run pytest

# In labs/fastapi:
uv run ruff format && uv run ruff check && uv run mypy . && uv run pytest

# Node tools (from python-backend-guide root):
export PATH=/opt/homebrew/opt/node@24/bin:$PATH
node --test labs/tools/*.test.mjs
node labs/tools/check-links.mjs --planned
node labs/tools/check-snippets.mjs
node labs/tools/module-stats.mjs
```

---

## Active queue

| Task ID | Size | Status | Depends on | Gate | Files touched | Inputs | Done by |
|---|---|---|---|---|---|---|---|
| `PLAN-M14` | M | todo | P9 | T-uv | `_meta/modules/M14.md`, `modules/14-fastapi-dependency-injection-and-execution.md`, `_meta/TASKS.md` | `SYLLABUS.md`, `STYLE-GUIDE.md`, `_meta/QUALITY-BAR.md` | - |

---

## Small-task pool (for Small mode, E >= 70%)

| Task ID | Size | Status | What it does | Done by |
|---|---|---|---|---|
| `HOUSE-01` | S | todo | Calibration update: calculate real usage costs once a new session shares RESETS | - |
| `HOUSE-02` | S | todo | Sync PROGRESS.md dashboard with written modules | - |
