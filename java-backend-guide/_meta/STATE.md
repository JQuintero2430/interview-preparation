# STATE

Single source of truth for where the job stands (keep under 60 lines). Files on disk win over this file, then TASKS.md.

- **Phase:** Phase A (pilot). Planning P1 to P8 is done ([PLANNING.md](PLANNING.md)).
- **Current module:** 17 `spring-transactions` (pilot, kind core, cap 22,000 words, lab `spring-transactions`). Planned: [M17](modules/M17.md), skeleton `modules/17-spring-transactions.md`, 23 tasks (SEC 14, QB 4, EX 4, CLOSE).
- **In progress:** none
- **Last finished task:** SYLLABUS-REVISE (S20261028-0812-antigravity).
- **Next task:** Without Docker, M17 tasks and VERIFY-06 are paused (needs Docker) and G1 blocks further PLAN tasks until pilot is closed and reviewed. With Docker active: `VERIFY-06`, `HOUSE-01`, and M17 tasks. Phase D DELETE tasks are queued (11) awaiting G2 and module completions.
- **Counts:** modules done 0/55; sources consolidated 0/11; EXTRACT 47/47 chunks; SYLLABUS-REVISE done; PLAN 1/55; REVIEW 0/55.
- **Open UNVERIFIED:** 1 (U06, needs: docker; [UNVERIFIED](UNVERIFIED.md)). U01 to U05 closed by VERIFY-01..05 (S20261025-0744-claudecode).
- **Waiting gates (see [GATES](GATES.md)):**
  - G1 "Syllabus and pilot approved": not yet reachable (the pilot is not CLOSEd or REVIEWed); will block every `PLAN-Mxx` except M17.
  - G2 "Source deletion and cross-guide link rewrite approved": needed only in Phase D.
  - T1 "Docker available" (informational): unticked; Docker probe, not the checkbox, decides eligibility for `VERIFY-06`, `HOUSE-01` and every docker-tagged test run.
- **Last full verification (P5, 2026-10-25, S20261025-0048-claudecode):**
  - Full `verify`: exit 0 (java-language: 1 test passed; persistence and spring-transactions smoke tests skipped, no Docker).
  - `verify -DexcludedGroups=docker`: exit 0. `spotless:apply` then `verify`: exit 0.
  - Node tool tests: 8 pass, 0 fail. `check-links.mjs --planned`: exit 0. `module-stats.mjs`: exit 0 ("0 module(s) of 55 planned").
- **Standing notes:**
  - Every Maven command needs `JAVA_HOME=$(/usr/libexec/java_home -v 25)` (Homebrew Maven defaults to JDK 27).
  - Docker is absent now: `/usr/local/bin/docker` is a dangling symlink (Docker Desktop removed) and Colima is installed but stopped. Docker-tagged tests skip; use the no-Docker variant in [TASKS](TASKS.md) "Standard checks".
  - IDE note: Eclipse/m2e on JDK 27 fails spotless (palantir-java-format 2.102.0, `NoSuchFieldError ... endPositions`); point the IDE's Maven runtime at JDK 25. The CLI build is unaffected.
  - Harness capabilities (S20261025-1603-codex): docker no (probe exit 127), vision yes (all 24 Spring.pdf pages inspected). Recovery saved at E=35%, U=0%, RESETS=20:00; exact model backend identifier unavailable.
