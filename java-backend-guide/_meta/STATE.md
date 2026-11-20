# STATE

Single source of truth for where the job stands (keep under 60 lines). Files on disk win over this file, then TASKS.md.

- **Phase:** Phase C (remaining modules, ROADMAP order). Phase A pilot done; G1 ticked by Jorge (recorded S20261101-2100). Planning P1 to P8 is done ([PLANNING.md](PLANNING.md)).
- **Current module:** 03 `java-generics` (core, advisory target 18,000 words, lab `java-language`). Planned: [M03](modules/M03.md) by PLAN-M03 (S20261116-0839-claudecode); skeleton with 17 regions, §1 to §8 written (SEC-M03-01..08), question bank Q03.01–Q03.23 written (QB-M03-01..03), Exercises 03.1–03.2 written (EX-M03-01..02); EX-M03-03, CLOSE todo. Modules 17, 01 and 02 closed, reviewed, fixed.
- **In progress:** none
- **Last finished task:** EX-M03-02 (S20261120-0602-claudecode-cloud, claude-opus-5-5).
- **Next task:** EX-M03-03 (M), then CLOSE-M03 in TASKS order. CLOSE-M03 must settle QUALITY-BAR D3: the M03 plan has no `Trade-off` question (see LOG S20261120-0358).
- **Counts:** modules done 0/55 (17, 01 and 02 closed, reviewed, fixed); sources consolidated 0/11; EXTRACT 47/47 chunks; SYLLABUS-REVISE done; PLAN 4/55 (17, 01, 02, 03); CLOSE 3/55 (17, 01, 02); REVIEW 3/55 (17, 01, 02).
- **Open UNVERIFIED:** 0 ([UNVERIFIED](UNVERIFIED.md)). U01 to U05 closed by VERIFY-01..05 (S20261025-0744-claudecode); U06 closed by VERIFY-06 (S20261029-0747-claudecode).
- **Waiting gates (see [GATES](GATES.md)):**
  - G1 "Syllabus and pilot approved": **ticked** (noticed S20261101-2100); `PLAN-Mxx` tasks are eligible.
  - G2 "Source deletion and cross-guide link rewrite approved": **ticked** (noticed S20261115-0846-claudecode); `DELETE-<src>` tasks become eligible once their ledger rows are `written` (Phase D).
  - T1 "Docker available" (informational): ticked; Docker probe, not the checkbox, decides eligibility for `VERIFY-06`, `HOUSE-01` and every docker-tagged test run.
- **Last full verification (CLOSE-M02, 2026-11-15, S20261115-1722-claudecode):** full `verify -DexcludedGroups=docker` exit 0 (docker tests skipped: daemon not running); `check-links --planned` exit 0; `module-stats` row 02 no flag. Earlier baseline (P5, 2026-10-25, S20261025-0048-claudecode):
  - Full `verify`: exit 0 (java-language: 1 test passed; persistence and spring-transactions smoke tests skipped, no Docker).
  - `verify -DexcludedGroups=docker`: exit 0. `spotless:apply` then `verify`: exit 0.
  - Node tool tests: 8 pass, 0 fail. `check-links.mjs --planned`: exit 0. `module-stats.mjs`: exit 0 ("0 module(s) of 55 planned").
- **Standing notes:**
  - Cloud scheduled runs (S20261120-0358-claudecode-cloud): `JAVA_HOME=/opt/jdk-25`, no Colima prefix; the container sets `JAVA_TOOL_OPTIONS` and `_JAVA_OPTIONS`, whose "Picked up" lines break `LaunchProtocolTest`, so run Maven as `env -u JAVA_TOOL_OPTIONS -u _JAVA_OPTIONS JAVA_HOME=/opt/jdk-25 mvn -o …`. A fresh container has an empty `~/.m2`: the first (online) run needs `MAVEN_OPTS="$JAVA_TOOL_OPTIONS"` set before unsetting the variable, or Maven Central fails with PKIX (S20261120-0602). github.com and docs.oracle.com return 403 through the proxy: read JDK sources from `/opt/jdk-25/lib/src.zip`.
  - java-workflow in this guide (S20261117-0826): never launch a subagent with `isolation: worktree` (RUN.md §7 forbids worktrees), and run `~/.claude/scripts/session-init.sh` before each new task's orchestrator so the DONE session is archived, not overwritten.
  - Wrapper constructors are only `@Deprecated(since="9")` in JDK 25 (JDK-8354338 dropped `forRemoval`; S20261108-1849, VERSIONS.md feature notes): later sections must not say "deprecated for removal".
  - java-reviewer has no Write tool (S20261108-1738): the main session transcribes its verdict into the session's review.md.
  - java-workflow (S20261107-2128): run `~/.claude/scripts/session-init.sh` from the repository root (from `IdeaProjects/` it picks another repo), and give the orchestrator and implementer absolute lab paths under `java-backend-guide/labs/`: one implementer wrote to `interview-preparation/labs/`.
  - Prose caps are advisory, not limits (SYLLABUS §9 decision 19, Jorge, 2026-11-07); `module-stats` no longer flags prose. The cap notes below are history.
  - M01 prose cap: Jorge approved 19,400 (SYLLABUS §9 decision 18, 2026-11-07, superseding decision 17's 19,000); module 01 closed at 19,336.
  - Prose cap: Jorge approved 23,000 for module 17 (SYLLABUS §9 decision 12, 2026-11-01); module 17 closed at 22,722 prose words.
  - Every `@SpringBootTest` R2 class inherits `@DirtiesContext` from PostgresTestBase (HOUSE-08): each class gets a new container port, so cached contexts must not be reused.
  - Harness write guard also blocks the java-workflow tester/implementer subagents (S20261101-2100): the main session writes tests first (red logged), then code, through the shell; java-orchestrator plans and java-reviewer reviews (read-only).
  - Write guard not seen in S20261105-1850 (interactive session): java-tester and java-implementer wrote their files, so the normal pipeline ran. The older note above applies to background jobs.
  - Harness write guard (S20261101-0430): in a background job the Edit/Write tools are rejected in the shared checkout until a worktree is entered, which RUN.md §7 forbids; shell writes (python/heredoc) work, so the main session writes files through the shell.
  - Stats row filter: `module-stats.mjs` rows start with the slug, so grep `java-oop` (or `^| 01-`), not the `^| NN ` of Standard checks row 6, which prints nothing (S20261105-2154). This shell is zsh for `$?` after a pipe: use `$pipestatus`, or run without the pipe.
  - Narrow test runs: name the classes (`-Dtest='NestedTypesTest,NestedTypeCompileRulesTest'`). A package pattern (`-Dtest='dev.interview...s11.*'`) matched 0 tests and `-Dsurefire.failIfNoSpecifiedTests=false` hid it behind BUILD SUCCESS (S20261105-2146); check the `Tests run:` count.
  - Every Maven command needs `JAVA_HOME=$(/usr/libexec/java_home -v 25)` (Homebrew Maven defaults to JDK 27).
  - Docker runs in Colima (HOUSE-01, 2026-10-29: both smoke tests ran and passed). Maven needs the Colima env prefix from [TASKS](TASKS.md) "Standard checks", otherwise docker tests are silently skipped; Colima must be started (`colima start`) for docker tasks.
  - Calibration on claude-fable-5-2 (S20261116-1837, 2 samples in [CALIBRATION](CALIBRATION.md)): S 7.08, M 17.70, L 35.41; the latest sample was 0% → 76% for 4 java-workflow SEC tasks (M ≈ 19 each). Three M sections fit a window that starts at 0% (E ≈ 57 before the fourth, which the 70 rule then refuses); an L REVIEW needs a start at U ≤ 34%. Check the launch line against the harness display: S20261116-1837 was launched with `USAGE: 0%` while the pasted /usage read 76%.
  - Calibration (S20261108-1849): latest same-window sample 11% → 20% for 1 M (S20261108-1738) = 1.8 per unit. Pooled row S 2.47, M 6.18, L 12.36. Budget M ≈ 8–10 per java-workflow section, L ≈ 16–20.
  - IDE note: Jorge works in IntelliJ IDEA. Run Maven there on JDK 25 (Settings → Build, Execution, Deployment → Build Tools → Maven → Runner → JRE = 25): on JDK 27, spotless (palantir-java-format 2.102.0) fails with `NoSuchFieldError ... endPositions`. The CLI build is unaffected.
  - Harness capabilities (S20261025-1603-codex): docker no (probe exit 127), vision yes (all 24 Spring.pdf pages inspected). Recovery saved at E=35%, U=0%, RESETS=20:00; exact model backend identifier unavailable.
