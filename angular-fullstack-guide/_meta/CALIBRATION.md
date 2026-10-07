# CALIBRATION

Measured usage cost per task size, in percentage points of the rate-limit window (RUN.md §11). Defaults until a row exists: S = 2, M = 5, L = 10.

| Harness | Model | S | M | L | Samples (sessions) | Last updated |
|---|---|---|---|---|---|---|
| Claude Code CLI | claude-opus-5-5 | 0.16 | 0.41 | 0.83 | 7 | 2026-10-06 |

## Raw samples

| Previous session | Next session | RESETS | U(prev start) → U(next start) | Tasks (sizes) | Derived per-size cost |
|---|---|---|---|---|---|
| S20261005-1810-claudecode | S20261005-1849-claudecode | 23:00 | 0% → 6% (6 points) | 7 S + 11 M + 1 L = 79 default points | 6 / 79 = 0.076 × default: S 0.15, M 0.38, L 0.76 |
| S20261005-1849-claudecode | S20261005-2022-claudecode | 23:00 | 6% → 8% (2 points) | 8 S + 1 M = 21 default points | 2 / 21 = 0.095 × default: S 0.19, M 0.48, L 0.95 |
| S20261006-1349-claudecode | S20261006-1415-claudecode | 17:00 | 16% → 20% (4 points) | 9 M = 45 default points | 4 / 45 = 0.089 × default: S 0.18, M 0.44, L 0.89 |
| S20261006-1415-claudecode | S20261006-1653-claudecode | 17:00 | 20% → 22% (2 points) | 6 M = 30 default points | 2 / 30 = 0.067 × default: S 0.13, M 0.33, L 0.67 |
| S20261006-1705-claudecode | S20261006-1733-claudecode | 22:00 | 0% → 4% (4 points) | 14 M = 70 default points | 4 / 70 = 0.057 × default: S 0.11, M 0.29, L 0.57 |
| S20261006-1733-claudecode | S20261006-1804-claudecode | 22:00 | 4% → 17% (13 points) | 4 L + 18 M + 7 S = 144 default points (work done by subagents) | 13 / 144 = 0.090 × default: S 0.18, M 0.45, L 0.90 |
| S20261006-1804-claudecode | S20261006-1925-claudecode | 22:00 | 17% → 26% (9 points) | 17 M = 85 default points (work done by subagents) | 9 / 85 = 0.106 × default: S 0.21, M 0.53, L 1.06 |
