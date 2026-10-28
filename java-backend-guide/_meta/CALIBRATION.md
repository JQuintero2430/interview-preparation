# CALIBRATION

Measured usage cost per task size, in percentage points of the rate-limit window (RUN.md §11). Defaults until a row exists: S = 2, M = 5, L = 10. Rows marked "borrowed (Angular guide)" are copied from `angular-fullstack-guide/_meta/CALIBRATION.md` and stop being used for a harness and model once this guide has its own measured row for that pair.

| Harness | Model | S | M | L | Samples (sessions) | Last updated | Basis |
|---|---|---|---|---|---|---|---|
| Claude Code CLI | claude-opus-5-5 | 0.42 | 1.05 | 2.11 | 1 | 2026-10-25 | measured (this guide; Opus main + Sonnet subagents for research and extraction) |
| Claude Code CLI | claude-opus-5-5 | 3.02 | 7.56 | 15.11 | 51 | 2026-10-24 | borrowed (Angular guide), superseded 2026-10-25 by the measured row |
| Claude Code (cloud) | claude-opus-5-5 | 0.75 | 1.88 | 3.75 | 2 | 2026-10-13 | borrowed (Angular guide) |

The first row came from sessions where the Opus main session ran every build itself (conservative). The second came from sessions where Sonnet writer subagents did the writing (typical).

## Raw samples

This guide's own measurements. A sample is added when a session starts with the same RESETS value as the previous LOG entry, on the same harness and model: cost = U(new) − U(previous start), divided across the previous session's tasks in proportion to their default sizes (S 2, M 5, L 10).

| Previous session | Next session | RESETS | U(prev start) → U(next start) | Tasks (sizes) | Derived per-size cost |
|---|---|---|---|---|---|
| S20261025-0744-claudecode | S20261025-0757-claudecode | 09:40 | 19% → 27% (8 points) | 9 S + 4 M = 9×2 + 4×5 = 38 units | 8 / 38 = 0.2105 per unit → S 0.42, M 1.05, L 2.11 |
