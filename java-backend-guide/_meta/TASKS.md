# TASKS

The queue, in order. Pick the next task by RUN.md §4. Status: `todo` / `in_progress` / `done` / `blocked` / `skipped-capability`. A task counts as done only once STATE, TASKS and LOG are updated (RUN.md §6 step 5). Sizes: S, M, L (RUN.md §5). `needs:` is a harness capability (`docker`, `vision`); gates (G1, G2, T1) are in [GATES.md](GATES.md).

## Standard checks

Run from the repository root `/Users/jorge.quintero/IdeaProjects/interview-preparation`. Homebrew Maven defaults to JDK 27, so every Maven command needs `JAVA_HOME` set to JDK 25. Every `mvn` run is serialized (never two at once, never in a subagent). `<lab>` is the Maven module folder named in SYLLABUS §1 (for example `spring-transactions`). Commands copied verbatim from PLANNING.md P5 (all passed on 2026-10-25).

| # | Check | Command | RUN.md §6 step 4 bullet |
|---|---|---|---|
| 1 | Docker probe (decides the variant) | `perl -e 'alarm 20; exec @ARGV or exit 127' docker info` (the `or exit 127` matters: without it a missing `docker` exits 0) | RUN.md §4 capability check |
| 2 | Lab build and tests | `JAVA_HOME=$(/usr/libexec/java_home -v 25) mvn -q -f java-backend-guide/labs/pom.xml -pl <lab> -am verify` | 1: Maven build and tests scoped to the touched lab module (`spotless:check` is bound to `verify`) |
| 3 | No-Docker variant of 2 | the command of row 2 with `-DexcludedGroups=docker` appended | 1, when row 1 fails |
| 4 | Format | `JAVA_HOME=$(/usr/libexec/java_home -v 25) mvn -q -f java-backend-guide/labs/pom.xml -pl <lab> spotless:apply`, then row 2 (or 3) again if it changed files | 2: `spotless:apply` on touched lab modules when Java changed |
| 5 | Links | `node java-backend-guide/labs/tools/check-links.mjs --planned java-backend-guide` | 3: link and anchor check |
| 6 | Stats | `node java-backend-guide/labs/tools/module-stats.mjs` (prints every module; read the touched one with `| grep '^| NN '`; `--strict` only at the finish line) | 4: module statistics |
| 7 | Node tool tests (only when `labs/tools/` changed) | `node --test 'java-backend-guide/labs/tools/*.test.mjs'` | support |
| 8 | Full build (CLOSE, finish line, bootstrap B1) | `JAVA_HOME=$(/usr/libexec/java_home -v 25) mvn -q -f java-backend-guide/labs/pom.xml verify` (append `-DexcludedGroups=docker` without Docker) | RUN.md §8 B1, §13 |

**Colima env (Docker runs in Colima on this machine).** Testcontainers looks at `/var/run/docker.sock`, which points at the removed Docker Desktop socket, so without help it reports "Could not find a valid Docker environment" and silently skips every `@Tag("docker")` test while the build still exits 0. Prefix rows 2, 3, 4 and 8 with `DOCKER_HOST=unix://$HOME/.colima/default/docker.sock TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock` whenever row 1 exits 0, and confirm in `target/surefire-reports` that the docker tests show `skipped="0"` (HOUSE-01, 2026-10-29).

**No-Docker variant rule.** Run row 1 once per session. If it exits non-zero, use row 3 instead of row 2 and row 8 with the extra flag everywhere. Tests tagged `@Tag("docker")` are then skipped, not passed: the LOG says "docker tests skipped", and any claim that only a Testcontainers test could verify goes to [UNVERIFIED](UNVERIFIED.md) with `needs: docker` plus a `VERIFY` task. The finish line requires one full run with Docker available (RUN.md §13).

**Extraction acceptance (E1 to E6), shared by every `EXTRACT-*` task.**
- E1: every page (PDF) or line range (Markdown) of the chunk is covered by at least one ledger row; pages with no interview content (cover, index, ad) get a row saying so.
- E2: every row has all columns of [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md); the question is in the guide's own words, never a copied passage (PDFs are third-party material).
- E3: before adding a row, all ledgers in `_meta/sources/` were searched for its dedup key (`grep -ri "<key>" java-backend-guide/_meta/sources/`); repeats carry `duplicate-of`.
- E4: each target module and section is a provisional SYLLABUS §1 / §4 module; topics missing from SYLLABUS are appended to [NEW-TOPICS](sources/NEW-TOPICS.md); errors spotted in the source go in the notes column.
- E5: idempotent: re-running rewrites only the rows whose ID starts with the chunk ID; `node java-backend-guide/labs/tools/check-links.mjs --planned java-backend-guide` exits 0.
- E6: STATE counts (EXTRACT done/47) and LOG line updated; no scratch files left.

## VERIFY tasks (RUN.md §4 priority 1)

Each resolves one row of [UNVERIFIED](UNVERIFIED.md) and one "Open items" entry of [VERSIONS](../VERSIONS.md). Generic acceptance (V1 to V3): V1: the claim is checked against the primary source named in the task and the VERSIONS.md cell or note is corrected, with the source URL and the date checked; V2: the "Open items" bullet is removed or rewritten to what remains unknown; V3: the UNVERIFIED row is set to `closed` with the evidence and the open count in STATE is reduced. Files touched by all: `VERSIONS.md`, `_meta/UNVERIFIED.md`, `_meta/STATE.md`, `_meta/TASKS.md`, `_meta/LOG.md` (`SOURCES.md` if a new URL is cited).

### VERIFY-01 · S
- Status: `done` · Deps: none · needs: none · UNVERIFIED row U01
- Claim: Redis: which release is the current stable (endoflife.date says 9.0.4, the GitHub "latest release" tag says 8.10.2) and the licence of 9.x.
- Inputs: [VERSIONS](../VERSIONS.md) (version table, "Open items"); Read the redis.io release notes / download page and the licence file of the 9.x tag at https://github.com/redis/redis; update the Redis row of the version table and the Redis open item.
- Acceptance: V1 to V3 (above); `node java-backend-guide/labs/tools/check-links.mjs --planned java-backend-guide` exits 0.
- Done by: S20261025-0744-claudecode (research: Sonnet subagent, read-only; edits and spot-check: claude-opus-5-5)

### VERIFY-02 · S
- Status: `done` · Deps: none · needs: none · UNVERIFIED row U02
- Claim: Spring Boot, Spring Framework and Spring Security support dates (OSS and commercial end dates) from spring.io instead of endoflife.date.
- Inputs: [VERSIONS](../VERSIONS.md) (version table, "Open items"); Read https://spring.io/projects/spring-boot#support and the Framework and Security support pages (try the project pages, the generations page, or the GitHub wiki Supported-Versions); update the three rows and the Support policies bullet.
- Acceptance: V1 to V3 (above); `node java-backend-guide/labs/tools/check-links.mjs --planned java-backend-guide` exits 0.
- Done by: S20261025-0744-claudecode (research: Sonnet subagent, read-only; edits and spot-check: claude-opus-5-5)

### VERIFY-03 · S
- Status: `done` · Deps: none · needs: none · UNVERIFIED row U03
- Claim: Oracle Java SE and Temurin support dates (premier and extended end dates for 17, 21, 25, 27) from vendor pages instead of endoflife.date.
- Inputs: [VERSIONS](../VERSIONS.md) (version table, "Open items"); The Oracle roadmap page returned HTTP 403 on 2026-10-25: try another route (Oracle's published roadmap PDF or table, Adoptium support page) and cite it; if still unreachable keep the endoflife.date source and say so in the cell.
- Acceptance: V1 to V3 (above); `node java-backend-guide/labs/tools/check-links.mjs --planned java-backend-guide` exits 0.
- Done by: S20261025-0744-claudecode (research: Sonnet subagent, read-only; edits and spot-check: claude-opus-5-5)

### VERIFY-04 · S
- Status: `done` · Deps: none · needs: none · UNVERIFIED row U04
- Claim: OpenTelemetry semantic conventions: metric-level stability for HTTP, database, messaging and RPC (only span pages and area READMEs were read).
- Inputs: [VERSIONS](../VERSIONS.md) (version table, "Open items"); Read the per-metric Stability column and page Status in docs/*/*-metrics.md at the semantic-conventions tag in VERSIONS.md (v1.44.0, or the newer tag if VERSIONS is updated); extend the OpenTelemetry feature notes.
- Acceptance: V1 to V3 (above); `node java-backend-guide/labs/tools/check-links.mjs --planned java-backend-guide` exits 0.
- Done by: S20261025-0744-claudecode (research: Sonnet subagent, read-only; edits and spot-check: claude-opus-5-5)

### VERIFY-05 · S
- Status: `done` · Deps: none · needs: none · UNVERIFIED row U05
- Claim: JDK 21 status of structured concurrency (JEP 453, preview) and scoped values (JEP 446, preview), currently from memory of the JEP lineage.
- Inputs: [VERSIONS](../VERSIONS.md) (version table, "Open items"); Read https://openjdk.org/jeps/453 and https://openjdk.org/jeps/446 (Status, Release fields) and the JDK 21 release page; replace the 'not re-read' cells of the concurrency JEP table.
- Acceptance: V1 to V3 (above); `node java-backend-guide/labs/tools/check-links.mjs --planned java-backend-guide` exits 0.
- Done by: S20261025-0744-claudecode (research: Sonnet subagent, read-only; edits and spot-check: claude-opus-5-5)

### VERIFY-06 · S
- Status: `done` · Deps: none · needs: docker (T1 is informational: if the Docker probe exits 0 this session, run it) · UNVERIFIED row U06
- Claim: Docker installed version (never captured: Docker is not installed or running now).
- Inputs: [VERSIONS](../VERSIONS.md) (version table, "Open items"); When the Docker probe exits 0: `docker version --format '{{.Server.Version}}'` and `docker info`; record the version and the date in the VERSIONS.md "Installed on this machine" section and drop the open item.
- Acceptance: V1 to V3 (above); `node java-backend-guide/labs/tools/check-links.mjs --planned java-backend-guide` exits 0.
- Done by: S20261029-0747-claudecode (claude-opus-5-5)

## HOUSE task gated on the Docker toolchain

### HOUSE-01 · S · re-run the Docker smoke tests
- Status: `done` · Deps: none · needs: docker (T1 is informational: if the Docker probe exits 0 this session, run it) · Files touched: `_meta/TASKS.md`, `_meta/STATE.md`, `_meta/LOG.md`, and `_meta/modules/M17.md` only to drop `needs: docker` notes once PLAN-M17 exists
- Inputs: gate T1 in [GATES](GATES.md); the two smoke tests `labs/persistence/.../PostgresVersionSmokeTest` and `labs/spring-transactions/.../DataSourceSmokeTest` (class-level `@Tag("docker")`, image `postgres:18.6`).
- Acceptance: row 1 of Standard checks exits 0; `JAVA_HOME=$(/usr/libexec/java_home -v 25) mvn -q -f java-backend-guide/labs/pom.xml -pl persistence,spring-transactions -am verify` exits 0 and the surefire reports show both smoke tests run (not skipped); the LOG records the result, and STATE "Standing notes" drops the "Docker absent" line. If a test fails, record the failure and add a FIX task instead of editing labs in this task.
- Done by: S20261029-0747-claudecode (claude-opus-5-5)

## Phase A: pilot (module 17 `spring-transactions`)

### EXTRACT-architect-md-01 · M
- Status: `done` · Deps: none · needs: none · Phase A (pilot chunk, SYLLABUS §7)
- Files touched: `_meta/sources/architect-md.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `architect-md-01-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `architect-md` (chunk `architect-md-01`, lines 1-153, text layer); source `../Architect-Level Production & Architect.md`, read with `sed -n '1,153p' "../Architect-Level Production & Architect.md"`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: Title "Architect-Level Production & Architecture Study Plan"; Group A Transactions, Concurrency and Correctness: Q1 @Transactional failing without exception, Q2 ...
- Acceptance: E1 to E6 (above).
- Done by: S20261025-0744-claudecode (extraction: claude-sonnet-5-5 subagent; acceptance spot-check: claude-opus-5-5)

### EXTRACT-security-jpa-md-04 · M
- Status: `done` · Deps: none · needs: none · Phase A (pilot chunk, SYLLABUS §7)
- Files touched: `_meta/sources/security-jpa-md.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `security-jpa-md-04-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `security-jpa-md` (chunk `security-jpa-md-04`, lines 1141-1361, text layer); source `../Backend Study Guide - Security, JPA, Design Patterns & Spring.md`, read with `sed -n '1141,1361p' "../Backend Study Guide - Security, JPA, Design Patterns & Spring.md"`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: PART IV Spring Beans: 4.1 Bean Lifecycle, 4.2 Bean Scopes (mixing scopes), 4.3 Bean Specializations, 4.4 How Dependency Injection Resolves a Candidate (injection styles, ...
- Acceptance: E1 to E6 (above).
- Done by: S20261025-0744-claudecode (extraction: claude-sonnet-5-5 subagent; acceptance spot-check: claude-opus-5-5)

### EXTRACT-spring-data-jpa-pdf-02 · M
- Status: `done` · Deps: none · needs: none · Phase A (pilot chunk, SYLLABUS §7)
- Files touched: `_meta/sources/spring-data-jpa-pdf.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `spring-data-jpa-pdf-02-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `spring-data-jpa-pdf` (chunk `spring-data-jpa-pdf-02`, p10-17, text layer); source `../SPRING DATA JPA Complete Interview Preparation Guide.pdf`, read with `pdftotext -f 10 -l 17 -layout "../SPRING DATA JPA Complete Interview Preparation Guide.pdf" -`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: Section 5 Transactions, Section 6 Entity Lifecycle and Caching (L1/L2 cache), Section 7 Auditing, Section 8 Criteria API and Specifications, Section 9 Projections and ...
- Acceptance: E1 to E6 (above).
- Done by: S20261025-0744-claudecode (extraction: claude-sonnet-5-5 subagent; acceptance spot-check: claude-opus-5-5)

### PLAN-M17 · M
- Status: `done` · Deps: `EXTRACT-architect-md-01`, `EXTRACT-security-jpa-md-04`, `EXTRACT-spring-data-jpa-pdf-02` · needs: none for the plan itself; the lab smoke test is `needs: docker` while T1 is open
- Files touched: `_meta/modules/M17.md`, `modules/17-spring-transactions.md` (skeleton with `<!-- TASK: <ID> -->` regions, STYLE-GUIDE §2.4), `labs/spring-transactions/**` (extend the lab that P5 already created: `SpringTransactionsLabApplication` and `smoke/DataSourceSmokeTest` stay; add only the dependencies and Testcontainers images module 17 needs), `labs/pom.xml` only if the module list or dependencyManagement must change, `_meta/TASKS.md` (append SEC, QB, EX, CLOSE tasks), `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: RUN.md §9 (what PLAN must produce); SYLLABUS §1 row 17 and §4 module 17 checklist, §5 delegated topics; STYLE-GUIDE; [QUALITY-BAR](QUALITY-BAR.md); the three ledgers `architect-md.md`, `security-jpa-md.md`, `spring-data-jpa-pdf.md` (rows targeting 17); `labs/spring-transactions/`; the `### Q` headings of existing modules (none yet) and the Angular pilot plan `../../angular-fullstack-guide/_meta/modules/M17.md` as a shape reference only.
- Acceptance: the RUN.md §9 outputs 1 to 4; breadth gate (every SYLLABUS 17 checkbox and every ledger row targeting 17 has a section, a question or a recorded reason); the skeleton has every heading and anchor; Standard checks rows 3 (or 2 with Docker), 4, 5, 6 pass for `spring-transactions`; the smoke test outcome is recorded (`needs: docker` while T1 is open); SEC, QB, EX, CLOSE tasks appended with inputs, files, `needs:` and acceptance.
- Done by: S20261025-0744-claudecode (claude-opus-5-5, written in the main session)

### SEC / QB / EX / CLOSE for module 17 (placeholder)
`SEC-M17-nn`, `QB-M17-nn`, `EX-M17-nn` and `CLOSE-M17` do not exist yet: `PLAN-M17` appends them here, directly below this line, in this order. Do not write them by hand before PLAN-M17 is done.

Appended by PLAN-M17 (S20261025-0744-claudecode). Plan: [M17](modules/M17.md). Shared rules for every task below: write only inside the task's own `<!-- TASK: <ID> -->` region(s) of `modules/17-spring-transactions.md`, in one edit at the end; lab paths are under `labs/spring-transactions/src/{main,test}/java/dev/interview/springtransactions/` (main and test mirror each other); `SOURCES.md` under a "17 spring-transactions" heading for every new URL; `_meta/TASKS.md`, `_meta/STATE.md`, `_meta/LOG.md` for bookkeeping. A `needs: docker` task is not started without Docker (its acceptance needs R2 tests to run, not skip).

### SEC-M17-01 · M · §1 Local transactions on a JDBC connection
- Status: `done` · Deps: none · needs: docker
- Files touched: `modules/17-spring-transactions.md` (region `SEC-M17-01`), lab `m17/support/PostgresTestBase.java` (test), `src/test/resources/m17/schema.sql`, `m17/s01/**`, `SOURCES.md`
- Inputs: [M17](modules/M17.md) §1 (lab design) and §4 entry §1; STYLE-GUIDE §2.2, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md).
- Acceptance: the seven §2.2 subsections in order (gaps accepted only with a reason in the LOG line); every key claim in the plan entry verified by the named test or source, with basis tags; required callouts present; within the word budget of M17 §4; every test of the plan entry exists and passes; links to the questions that drill the section; Standard checks rows 2 (with Docker) or 3, 4, 5, 6 for `spring-transactions`.
- Done by: S20261029-0747-claudecode (claude-opus-5-5; writing and lab by the main session; Java review: java-reviewer subagent, PASS in round 3)

### SEC-M17-02 · M · §2 Spring's transaction abstraction
- Status: `done` · Deps: none · needs: none
- Files touched: `modules/17-spring-transactions.md` (region `SEC-M17-02`), lab `m17/support/RecordingTransactionManager.java` (test), `m17/s02/**`, `SOURCES.md`
- Inputs: [M17](modules/M17.md) §1 (lab design) and §4 entry §2; STYLE-GUIDE §2.2, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md).
- Acceptance: the seven §2.2 subsections in order (gaps accepted only with a reason in the LOG line); every key claim in the plan entry verified by the named test or source, with basis tags; required callouts present; within the word budget of M17 §4; every test of the plan entry exists and passes; links to the questions that drill the section; Standard checks rows 2 (with Docker) or 3, 4, 5, 6 for `spring-transactions`.
- Done by: S20261025-0757-claudecode, claude-opus-5-5

### SEC-M17-03 · M · §3 `@Transactional` through the proxy
- Status: `done` · Deps: SEC-M17-02 · needs: none
- Files touched: `modules/17-spring-transactions.md` (region `SEC-M17-03`), lab `m17/s03/**`, `SOURCES.md`
- Inputs: [M17](modules/M17.md) §1 (lab design) and §4 entry §3; STYLE-GUIDE §2.2, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md).
- Acceptance: the seven §2.2 subsections in order (gaps accepted only with a reason in the LOG line); every key claim in the plan entry verified by the named test or source, with basis tags; required callouts present; within the word budget of M17 §4; every test of the plan entry exists and passes; links to the questions that drill the section; Standard checks rows 2 (with Docker) or 3, 4, 5, 6 for `spring-transactions`.
- Done by: S20261025-0757-claudecode, claude-opus-5-5

### SEC-M17-04 · M · §4 When `@Transactional` silently does nothing
- Status: `done` · Deps: SEC-M17-02 · needs: none
- Files touched: `modules/17-spring-transactions.md` (region `SEC-M17-04`), lab `m17/s04/**`, `SOURCES.md`
- Inputs: [M17](modules/M17.md) §1 (lab design) and §4 entry §4; STYLE-GUIDE §2.2, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md).
- Acceptance: the seven §2.2 subsections in order (gaps accepted only with a reason in the LOG line); every key claim in the plan entry verified by the named test or source, with basis tags; required callouts present; within the word budget of M17 §4; every test of the plan entry exists and passes; links to the questions that drill the section; Standard checks rows 2 (with Docker) or 3, 4, 5, 6 for `spring-transactions`.
- Done by: S20261025-0757-claudecode, claude-opus-5-5

### SEC-M17-05 · M · §5 Rollback rules and rollback-only
- Status: `done` · Deps: SEC-M17-02 · needs: none
- Files touched: `modules/17-spring-transactions.md` (region `SEC-M17-05`), lab `m17/s05/**`, `SOURCES.md`
- Inputs: [M17](modules/M17.md) §1 (lab design) and §4 entry §5; STYLE-GUIDE §2.2, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md).
- Acceptance: the seven §2.2 subsections in order (gaps accepted only with a reason in the LOG line); every key claim in the plan entry verified by the named test or source, with basis tags; required callouts present; within the word budget of M17 §4; every test of the plan entry exists and passes; links to the questions that drill the section; Standard checks rows 2 (with Docker) or 3, 4, 5, 6 for `spring-transactions`.
- Done by: S20261025-0757-claudecode, claude-opus-5-5

### SEC-M17-06 · L · §6 Propagation
- Status: `done` · Deps: SEC-M17-01, SEC-M17-02 · needs: docker
- Files touched: `modules/17-spring-transactions.md` (region `SEC-M17-06`), lab `m17/s06/**`, `SOURCES.md`
- Inputs: [M17](modules/M17.md) §1 (lab design) and §4 entry §6; STYLE-GUIDE §2.2, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md).
- Acceptance: the seven §2.2 subsections in order (gaps accepted only with a reason in the LOG line); every key claim in the plan entry verified by the named test or source, with basis tags; required callouts present; within the word budget of M17 §4; every test of the plan entry exists and passes; links to the questions that drill the section; Standard checks rows 2 (with Docker) or 3, 4, 5, 6 for `spring-transactions`.
- Done by: S20261031-0828-claudecode (claude-opus-5-5; writing and lab by the main session, subagent writes blocked by the harness; plan: java-orchestrator; Java review: java-reviewer subagent, PASS in round 2)

### SEC-M17-07 · L · §7 Isolation levels and anomalies
- Status: `done` · Deps: SEC-M17-01 · needs: docker
- Files touched: `modules/17-spring-transactions.md` (region `SEC-M17-07`), lab `m17/s07/**`, `SOURCES.md`
- Inputs: [M17](modules/M17.md) §1 (lab design) and §4 entry §7; STYLE-GUIDE §2.2, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md).
- Acceptance: the seven §2.2 subsections in order (gaps accepted only with a reason in the LOG line); every key claim in the plan entry verified by the named test or source, with basis tags; required callouts present; within the word budget of M17 §4; every test of the plan entry exists and passes; links to the questions that drill the section; Standard checks rows 2 (with Docker) or 3, 4, 5, 6 for `spring-transactions`.
- Done by: S20261031-0847-claudecode (claude-opus-5-5; writing and lab by the main session, subagent writes blocked by the harness; plan: java-orchestrator (sonnet); Java review: java-reviewer subagent (sonnet), PASS round 1, two minor findings fixed)

### HOUSE-07 · S · s06 pool-deadlock test asserts permitted outcomes
- Status: `done` · Deps: none · needs: docker
- Found by SEC-M17-08 (S20261031-0858-claudecode): `PropagationPostgresTest.poolOfNWithNConcurrentRequiresNewCallersTimesOut` failed once (one caller succeeded at 0.52 s, the other got the pool timeout): after the first caller times out, its outer transaction rolls back and returns its connection, so a caller still waiting may take it. The test asserted one interleaving ("both fail"), against STYLE-GUIDE §7.5.
- Files touched: `labs/spring-transactions/src/test/java/dev/interview/springtransactions/m17/s06/PropagationPostgresTest.java`, `modules/17-spring-transactions.md` (region SEC-M17-06, the "Pool deadlock" bullet), `_meta/modules/M17.md` (§6 test name)
- Acceptance: at least one caller fails with the pool timeout, every failure is that timeout, every caller's elapsed time is within the bounds, audit rows equal successes; §6 prose matches and stays within its 1,100-word budget; Standard checks rows 2 (with Docker), 4, 5, 6 for `spring-transactions`.
- Done by: S20261031-0858-claudecode (claude-opus-5-5, main session)

### HOUSE-08 · S · R2 Spring test contexts never outlive their container
- Status: `done` · Deps: none · needs: docker
- Found by SEC-M17-08 (S20261031-0858-claudecode): the new `@SpringBootTest` class `s08/ReadOnlyJpaTest` received the context cached by `s06/JpaNestedPropagationTest`, whose per-class PostgreSQL container had stopped (`Connection to localhost:32806 refused`, 30 s Hikari timeout per test). Same cache key (same `@ServiceConnection` field in `PostgresTestBase`), new container per class.
- Files touched: `labs/spring-transactions/src/test/java/dev/interview/springtransactions/m17/support/PostgresTestBase.java` (`@DirtiesContext`, inherited)
- Acceptance: `ReadOnlyJpaTest` and `JpaNestedPropagationTest` pass in one run in either order; Standard checks rows 2 (with Docker), 4 for `spring-transactions`.
- Done by: S20261031-0858-claudecode (claude-opus-5-5, main session)

### SEC-M17-08 · M · §8 Read-only, timeouts and programmatic transactions
- Status: `done` · Deps: SEC-M17-01, SEC-M17-02 · needs: docker
- Files touched: `modules/17-spring-transactions.md` (region `SEC-M17-08`), lab `m17/s08/**`, `SOURCES.md`
- Inputs: [M17](modules/M17.md) §1 (lab design) and §4 entry §8; STYLE-GUIDE §2.2, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md).
- Acceptance: the seven §2.2 subsections in order (gaps accepted only with a reason in the LOG line); every key claim in the plan entry verified by the named test or source, with basis tags; required callouts present; within the word budget of M17 §4; every test of the plan entry exists and passes; links to the questions that drill the section; Standard checks rows 2 (with Docker) or 3, 4, 5, 6 for `spring-transactions`.
- Done by: S20261031-0858-claudecode (claude-opus-5-5; writing and lab by the main session, subagent writes blocked by the harness; plan: java-orchestrator (sonnet); Java review: java-reviewer subagent (sonnet), PASS round 1, three minor findings fixed)

### SEC-M17-09 · M · §9 Transactions and the JPA persistence context
- Status: `done` · Deps: SEC-M17-01 · needs: docker
- Files touched: `modules/17-spring-transactions.md` (region `SEC-M17-09`), lab `m17/s09/**`, `SOURCES.md`
- Inputs: [M17](modules/M17.md) §1 (lab design) and §4 entry §9; STYLE-GUIDE §2.2, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md).
- Acceptance: the seven §2.2 subsections in order (gaps accepted only with a reason in the LOG line); every key claim in the plan entry verified by the named test or source, with basis tags; required callouts present; within the word budget of M17 §4; every test of the plan entry exists and passes; links to the questions that drill the section; Standard checks rows 2 (with Docker) or 3, 4, 5, 6 for `spring-transactions`.
- Done by: S20261031-1620-claudecode (claude-opus-5-5 main session; java-orchestrator and java-reviewer on sonnet, reviewer PASS round 2)

### SEC-M17-10 · L · §10 Optimistic and pessimistic locking, retries and deadlocks
- Status: `done` · Deps: SEC-M17-01 · needs: docker
- Files touched: `modules/17-spring-transactions.md` (region `SEC-M17-10`), lab `m17/s10/**`, `SOURCES.md`
- Inputs: [M17](modules/M17.md) §1 (lab design) and §4 entry §10; STYLE-GUIDE §2.2, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md).
- Acceptance: the seven §2.2 subsections in order (gaps accepted only with a reason in the LOG line); every key claim in the plan entry verified by the named test or source, with basis tags; required callouts present; within the word budget of M17 §4; every test of the plan entry exists and passes; links to the questions that drill the section; Standard checks rows 2 (with Docker) or 3, 4, 5, 6 for `spring-transactions`.
- Done by: S20261031-1620-claudecode (claude-opus-5-5 main session; java-orchestrator and java-reviewer on sonnet, reviewer PASS round 1)

### SEC-M17-11 · M · §11 Side effects after commit: transaction-bound events
- Status: `done` · Deps: SEC-M17-02 · needs: none
- Files touched: `modules/17-spring-transactions.md` (region `SEC-M17-11`), lab `m17/s11/**`, `SOURCES.md`
- Inputs: [M17](modules/M17.md) §1 (lab design) and §4 entry §11; STYLE-GUIDE §2.2, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md).
- Acceptance: the seven §2.2 subsections in order (gaps accepted only with a reason in the LOG line); every key claim in the plan entry verified by the named test or source, with basis tags; required callouts present; within the word budget of M17 §4; every test of the plan entry exists and passes; links to the questions that drill the section; Standard checks rows 2 (with Docker) or 3, 4, 5, 6 for `spring-transactions`.
- Done by: S20261025-0757-claudecode, claude-opus-5-5

### SEC-M17-12 · M · §12 Transactions across threads
- Status: `done` · Deps: SEC-M17-02 · needs: none
- Files touched: `modules/17-spring-transactions.md` (region `SEC-M17-12`), lab `m17/s12/**`, `SOURCES.md`
- Inputs: [M17](modules/M17.md) §1 (lab design) and §4 entry §12; STYLE-GUIDE §2.2, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md).
- Acceptance: the seven §2.2 subsections in order (gaps accepted only with a reason in the LOG line); every key claim in the plan entry verified by the named test or source, with basis tags; required callouts present; within the word budget of M17 §4; every test of the plan entry exists and passes; links to the questions that drill the section; Standard checks rows 2 (with Docker) or 3, 4, 5, 6 for `spring-transactions`.
- Done by: S20261025-0757-claudecode, claude-opus-5-5

### SEC-M17-13 · M · §13 Long transactions in production
- Status: `done` · Deps: SEC-M17-01 · needs: docker
- Files touched: `modules/17-spring-transactions.md` (region `SEC-M17-13`), lab `m17/s13/**`, `SOURCES.md`
- Inputs: [M17](modules/M17.md) §1 (lab design) and §4 entry §13; STYLE-GUIDE §2.2, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md).
- Acceptance: the seven §2.2 subsections in order (gaps accepted only with a reason in the LOG line); every key claim in the plan entry verified by the named test or source, with basis tags; required callouts present; within the word budget of M17 §4; every test of the plan entry exists and passes; links to the questions that drill the section; Standard checks rows 2 (with Docker) or 3, 4, 5, 6 for `spring-transactions`.
- Done by: S20261031-1835-claudecode, claude-opus-5-5

### SEC-M17-14 · M · §14 Testing transactional code
- Status: `done` · Deps: SEC-M17-01, SEC-M17-11 · needs: docker
- Files touched: `modules/17-spring-transactions.md` (region `SEC-M17-14`), lab `m17/s14/**`, `SOURCES.md`
- Inputs: [M17](modules/M17.md) §1 (lab design) and §4 entry §14; STYLE-GUIDE §2.2, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md).
- Acceptance: the seven §2.2 subsections in order (gaps accepted only with a reason in the LOG line); every key claim in the plan entry verified by the named test or source, with basis tags; required callouts present; within the word budget of M17 §4; every test of the plan entry exists and passes; links to the questions that drill the section; Standard checks rows 2 (with Docker) or 3, 4, 5, 6 for `spring-transactions`.
- Done by: S20261031-1835-claudecode, claude-opus-5-5

### QB-M17-01 · M · Q17.01 to Q17.08
- Status: `done` · Deps: SEC-M17-01 to SEC-M17-05 · needs: docker (at least one Output question is asserted by a PostgreSQL test)
- Files touched: `modules/17-spring-transactions.md` (region `QB-M17-01`), lab `m17/outputs/**` (one class `Q17_mm` per Output or Bug hunt question and `Q17OutputsTest` methods for this chunk only), `SOURCES.md`
- Inputs: [M17](modules/M17.md) §5 rows Q17.01 to Q17.08 (types, ledger rows, verify route) and §3; STYLE-GUIDE §5, §7.3 to §7.5; QUALITY-BAR D; the sections each question drills.
- Acceptance: answer anatomy per STYLE-GUIDE §5.3 (QUALITY-BAR D1); each Output short answer asserted by a test whose `@DisplayName` starts with its ID (C2); Production scenario answers follow D9; `<!-- ledger: … -->` lines list the plan's rows; ≈250 prose words per question on average; Standard checks rows 2 (with Docker) or 3, 4, 5, 6 for `spring-transactions`.
- Done by: S20261031-2045-claudecode (claude-opus-5-5; java-orchestrator haiku, java-reviewer sonnet PASS round 2)

### QB-M17-02 · M · Q17.09 to Q17.16
- Status: `done` · Deps: SEC-M17-03 to SEC-M17-06, SEC-M17-08 · needs: docker (at least one Output question is asserted by a PostgreSQL test)
- Files touched: `modules/17-spring-transactions.md` (region `QB-M17-02`), lab `m17/outputs/**` (one class `Q17_mm` per Output or Bug hunt question and `Q17OutputsTest` methods for this chunk only), `SOURCES.md`
- Inputs: [M17](modules/M17.md) §5 rows Q17.09 to Q17.16 (types, ledger rows, verify route) and §3; STYLE-GUIDE §5, §7.3 to §7.5; QUALITY-BAR D; the sections each question drills.
- Acceptance: answer anatomy per STYLE-GUIDE §5.3 (QUALITY-BAR D1); each Output short answer asserted by a test whose `@DisplayName` starts with its ID (C2); Production scenario answers follow D9; `<!-- ledger: … -->` lines list the plan's rows; ≈250 prose words per question on average; Standard checks rows 2 (with Docker) or 3, 4, 5, 6 for `spring-transactions`.
- Done by: S20261101-0430-claudecode (claude-opus-5-5; main session wrote tests then code via shell (harness write guard); java-reviewer sonnet PASS round 1)

### QB-M17-03 · M · Q17.17 to Q17.24
- Status: `done` · Deps: SEC-M17-07 to SEC-M17-09 · needs: docker (at least one Output question is asserted by a PostgreSQL test)
- Files touched: `modules/17-spring-transactions.md` (region `QB-M17-03`), lab `m17/outputs/**` (one class `Q17_mm` per Output or Bug hunt question and `Q17OutputsTest` methods for this chunk only), `SOURCES.md`
- Inputs: [M17](modules/M17.md) §5 rows Q17.17 to Q17.24 (types, ledger rows, verify route) and §3; STYLE-GUIDE §5, §7.3 to §7.5; QUALITY-BAR D; the sections each question drills.
- Acceptance: answer anatomy per STYLE-GUIDE §5.3 (QUALITY-BAR D1); each Output short answer asserted by a test whose `@DisplayName` starts with its ID (C2); Production scenario answers follow D9; `<!-- ledger: … -->` lines list the plan's rows; ≈250 prose words per question on average; Standard checks rows 2 (with Docker) or 3, 4, 5, 6 for `spring-transactions`.
- Done by: S20261101-0430-claudecode (claude-opus-5-5; java-orchestrator haiku; main session wrote tests then code via shell (harness write guard); java-reviewer sonnet PASS round 1)

### QB-M17-04 · M · Q17.25 to Q17.32
- Status: `done` · Deps: SEC-M17-10 to SEC-M17-14 · needs: docker (at least one Output question is asserted by a PostgreSQL test)
- Files touched: `modules/17-spring-transactions.md` (region `QB-M17-04`), lab `m17/outputs/**` (one class `Q17_mm` per Output or Bug hunt question and `Q17OutputsTest` methods for this chunk only), `SOURCES.md`
- Inputs: [M17](modules/M17.md) §5 rows Q17.25 to Q17.32 (types, ledger rows, verify route) and §3; STYLE-GUIDE §5, §7.3 to §7.5; QUALITY-BAR D; the sections each question drills.
- Acceptance: answer anatomy per STYLE-GUIDE §5.3 (QUALITY-BAR D1); each Output short answer asserted by a test whose `@DisplayName` starts with its ID (C2); Production scenario answers follow D9; `<!-- ledger: … -->` lines list the plan's rows; ≈250 prose words per question on average; Standard checks rows 2 (with Docker) or 3, 4, 5, 6 for `spring-transactions`.
- Done by: S20261101-0956-claudecode (claude-opus-5-5; java-orchestrator haiku, java-reviewer sonnet PASS)

### EX-M17-01 · M · Exercise 17.1 Repair a silently non-transactional service
- Status: `done` · Deps: SEC-M17-04, SEC-M17-08 · needs: none
- Files touched: `modules/17-spring-transactions.md` (region `EX-M17-01`), lab `m17/ex1/**`, `SOURCES.md`
- Inputs: [M17](modules/M17.md) §6 row Ex17.1 (criteria); STYLE-GUIDE §8.1, §7.1; QUALITY-BAR E.
- Acceptance: STYLE-GUIDE §8.1 anatomy; every criterion of the plan row has a test `Ex17.1 · …` and every such test maps to a criterion (E2); solution follows §7.1 (≤ 4 injected dependencies, constructor injection, low complexity); ≈350 prose words; Standard checks rows 2 (with Docker) or 3, 4, 5, 6 for `spring-transactions`.
- Done by: S20261101-1019-claudecode (claude-opus-5-5; java-workflow: orchestrator haiku, review java-reviewer sonnet PASS)

### EX-M17-02 · M · Exercise 17.2 An audit trail that survives rollback without deadlocking the pool
- Status: `done` · Deps: SEC-M17-06, SEC-M17-13 · needs: docker
- Files touched: `modules/17-spring-transactions.md` (region `EX-M17-02`), lab `m17/ex2/**`, `SOURCES.md`
- Inputs: [M17](modules/M17.md) §6 row Ex17.2 (criteria); STYLE-GUIDE §8.1, §7.1; QUALITY-BAR E.
- Acceptance: STYLE-GUIDE §8.1 anatomy; every criterion of the plan row has a test `Ex17.2 · …` and every such test maps to a criterion (E2); solution follows §7.1 (≤ 4 injected dependencies, constructor injection, low complexity); ≈350 prose words; Standard checks rows 2 (with Docker) or 3, 4, 5, 6 for `spring-transactions`.
- Done by: S20261101-1103-claudecode (claude-opus-5-5; java-workflow: orchestrator haiku, review java-reviewer sonnet PASS)

### EX-M17-03 · M · Exercise 17.3 Reserve stock under concurrency
- Status: `done` · Deps: SEC-M17-07, SEC-M17-10 · needs: docker
- Files touched: `modules/17-spring-transactions.md` (region `EX-M17-03`), lab `m17/ex3/**`, `SOURCES.md`
- Inputs: [M17](modules/M17.md) §6 row Ex17.3 (criteria); STYLE-GUIDE §8.1, §7.1; QUALITY-BAR E.
- Acceptance: STYLE-GUIDE §8.1 anatomy; every criterion of the plan row has a test `Ex17.3 · …` and every such test maps to a criterion (E2); solution follows §7.1 (≤ 4 injected dependencies, constructor injection, low complexity); ≈350 prose words; Standard checks rows 2 (with Docker) or 3, 4, 5, 6 for `spring-transactions`.
- Done by: S20261101-1141-claudecode (claude-opus-5-5; java-workflow: orchestrator haiku, review java-reviewer sonnet PASS)

### EX-M17-04 · M · Exercise 17.4 Place an order idempotently and notify after commit
- Status: `done` · Deps: SEC-M17-11, SEC-M17-13, EX-M17-03 · needs: docker
- Files touched: `modules/17-spring-transactions.md` (region `EX-M17-04`), lab `m17/ex4/**`, `SOURCES.md`
- Inputs: [M17](modules/M17.md) §6 row Ex17.4 (criteria); STYLE-GUIDE §8.1, §7.1; QUALITY-BAR E.
- Acceptance: STYLE-GUIDE §8.1 anatomy; every criterion of the plan row has a test `Ex17.4 · …` and every such test maps to a criterion (E2); solution follows §7.1 (≤ 4 injected dependencies, constructor injection, low complexity); ≈350 prose words; Standard checks rows 2 (with Docker) or 3, 4, 5, 6 for `spring-transactions`.
- Done by: S20261101-1300-claudecode (claude-opus-5-5; java-workflow: java-orchestrator haiku, java-reviewer sonnet CHANGES_REQUIRED → PASS)

### CLOSE-M17 · M
- Status: `done` · Deps: every SEC-M17, QB-M17 and EX-M17 task · needs: docker (full lab run with Docker, QUALITY-BAR H1, H5)
- Files touched: `modules/17-spring-transactions.md` (the three `CLOSE-M17` regions: Summary, Check your understanding, Connections), `_meta/sources/{architect-md,security-jpa-md,spring-data-jpa-pdf}.md` (status `written` for the rows homed in M17 §3), `PROGRESS.md`, `_meta/TASKS.md`, `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: the whole module; [M17](modules/M17.md); [QUALITY-BAR](QUALITY-BAR.md) (all items, the Measuring block); STYLE-GUIDE §2.3, §9.
- Acceptance: `grep -c 'TASK:' modules/17-spring-transactions.md` prints 0; every QUALITY-BAR item checked and recorded in the LOG line; Standard checks row 8 with Docker exits 0; rows 4, 5, 6 pass; ledger rows marked `written`; PROGRESS row 17 updated. Connections links `../angular-fullstack-guide/modules/30-e2e-and-testing-strategy.md` (rolling-back tests seen from the frontend).
- Done by: S20261101-1328-claudecode (claude-opus-5-5, written in the main session)

### REVIEW-M17 · L
- Status: `done` · Deps: `CLOSE-M17` (and every SEC, QB, EX task of module 17) · needs: none · independent per RUN.md §4 (a different session from every `Done by` of module 17, or a fresh read-only subagent that receives only the module path, QUALITY-BAR, STYLE-GUIDE and the module plan; prefer a different model)
- Files touched: `_meta/reviews/REVIEW-M17.md`, `_meta/TASKS.md` (append `FIX-M17-nn`), `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: `modules/17-spring-transactions.md`, `_meta/modules/M17.md`, [QUALITY-BAR](QUALITY-BAR.md), STYLE-GUIDE, `labs/spring-transactions/`
- Acceptance: every QUALITY-BAR item checked with evidence; findings listed with severity and turned into FIX tasks; `Done by` records which review route was used.
- **Gate G1:** when REVIEW-M17 (and its FIX tasks) are done, G1 ("Syllabus and pilot approved") blocks every `PLAN-Mxx` other than M17 until Jorge ticks it. EXTRACT, VERIFY, FIX and HOUSE tasks continue meanwhile.
- Done by: S20261101-1328-claudecode (route: fresh read-only subagent, general-purpose on sonnet, given only the module, M17, QUALITY-BAR, STYLE-GUIDE and the lab; review in `_meta/reviews/REVIEW-M17.md`, verdict CHANGES_REQUIRED, 5 MAJOR)

### FIX-M17-01 · S · Snippet kinds (REVIEW-M17 findings 1, 2)
- Status: `done` · Deps: REVIEW-M17 · needs: none
- Files touched: `modules/17-spring-transactions.md` (Ex17.1–17.4 starting-code blocks; Q17.07, Q17.29, Q17.32 blocks), `_meta/{TASKS,STATE,LOG}.md`
- Inputs: [REVIEW-M17](reviews/REVIEW-M17.md) findings 1–2; STYLE-GUIDE snippet kinds; the lab files named there.
- Acceptance: each of the 4 exercise starting-code blocks is an Excerpt (`// Excerpt of labs/…` first line, no `<sub>Source:`) whose lines are found in order in its file (or a Complete block equal to its file); Q17.07 and Q17.32 blocks carry `// Excerpt of …`; Q17.29's joined block is split or its editorial comment removed; every changed block re-checked by script; prose budget ≈ 0 words; Standard checks rows 5, 6.
- Done by: S20261101-1346-claudecode (claude-opus-5-5, main session)

### FIX-M17-02 · S · Practices and traps (REVIEW-M17 findings 3, 4, 5)
- Status: `done` · Deps: REVIEW-M17 · needs: none
- Files touched: `modules/17-spring-transactions.md` (:397 trap, :1084 practice, the 10 traps listed in finding 5), `SOURCES.md` if a new URL, `_meta/{TASKS,STATE,LOG}.md`
- Inputs: REVIEW-M17 findings 3–5; STYLE-GUIDE §4.2 markers; spring-tx 7.0.10 / reference docs for the 6.0 change.
- Acceptance: :397 states the cut-over with a §4.2 marker (`[Changed in Spring Framework 6.0: …]`) and a Src/Doc tag; :1084 has a "because" clause; each of the 10 traps gives why the myth exists in one clause; prose budget ≤ 110 words; rows 5, 6.
- Done by: S20261101-1346-claudecode (claude-opus-5-5, main session)

### FIX-M17-03 · S · Status markers (REVIEW-M17 finding 6)
- Status: `done` · Deps: REVIEW-M17 · needs: none
- Files touched: `modules/17-spring-transactions.md` (first mentions at :1208, :1210), `SOURCES.md` if a new URL, `_meta/{TASKS,STATE,LOG}.md`
- Inputs: REVIEW-M17 finding 6; spring-tx/spring-core 7.0.10 sources (`@Deprecated(since = …)` on `DeadlockLoserDataAccessException`, `CannotSerializeTransactionException`; `@since` of `org.springframework.core.retry.RetryTemplate` and `@Retryable`).
- Acceptance: the deprecation and "Added in" markers at first mention use the §4.2 forms with the versions read in the tagged sources (not from the review text), each with a Src tag; prose budget ≈ 10 words; rows 5, 6.
- Done by: S20261101-1346-claudecode (claude-opus-5-5, main session)

### FIX-M17-04 · S · Output short answers (REVIEW-M17 finding 7)
- Status: `done` · Deps: REVIEW-M17 · needs: none
- Files touched: `modules/17-spring-transactions.md` (Short answers of Q17.09, Q17.10, Q17.14, Q17.19, Q17.27), `_meta/{TASKS,STATE,LOG}.md`
- Inputs: REVIEW-M17 finding 7; each question's Full explanation and its existing test.
- Acceptance: each of the 5 Short answers adds one reasoning sentence consistent with its Full explanation and test (no new claim); prose budget ≤ 90 words; rows 5, 6.
- Done by: S20261101-1346-claudecode (claude-opus-5-5, main session)

### FIX-M17-05 · S · HikariCP version row and basis tags (REVIEW-M17 findings 8, 9)
- Status: `done` · Deps: REVIEW-M17 · needs: none
- Files touched: `VERSIONS.md` (HikariCP row, the version managed by Spring Boot 4.1.2), `modules/17-spring-transactions.md` (header :6 if needed, :1482, :1519, Q17.31 evidence), `SOURCES.md`, `_meta/{TASKS,STATE,LOG}.md`
- Inputs: REVIEW-M17 findings 8–9; the Spring Boot 4.1.2 BOM (HikariCP version); PostgreSQL 18 docs (vacuum and long transactions; behaviour of open transactions when a connection closes).
- Acceptance: VERSIONS.md has a HikariCP row verified against the Boot BOM; :1482 and :1519 carry Doc tags or are rephrased to what a tag supports; Q17.31's evidence names a concrete duplicate-finding query; prose budget ≤ 35 words; rows 5, 6.
- Done by: S20261101-1346-claudecode (claude-opus-5-5, main session)

### FIX-M17-06 · S · Ledger follow-up and nits (REVIEW-M17 findings 10, 11, NITs)
- Status: `done` · Deps: REVIEW-M17 · needs: none
- Files touched: `modules/17-spring-transactions.md` (Q17.31 follow-ups; `ledger:` lines at Q17.03, Q17.14; first-use definitions of SQLSTATE, Objenesis, dirty checking), `_meta/modules/M17.md` (line 5 cap → 23,000), `_meta/{TASKS,STATE,LOG}.md`
- Inputs: REVIEW-M17 findings 10–11 and the NITs; ledger row architect-md-01-12.
- Acceptance: Q17.31 has an answered follow-up "Why not disable retries?"; Q17.03 has a `ledger:` line with architect-md-01-07 (Q17.14 one only if a row is homed there); the three terms defined inline at first use; M17.md cap says 23,000; prose budget ≤ 33 words (all FIX tasks together must keep module 17 ≤ 23,000; 278 words remained after CLOSE); rows 5, 6.
- Done by: S20261101-1346-claudecode (claude-opus-5-5, main session)

## Phase B: remaining extraction, then SYLLABUS-REVISE

These may run while G1 is waiting. `needs: vision` chunks are skipped (left `todo`) by a harness without vision.

### EXTRACT-core-java-240-01 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/core-java-240.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `core-java-240-01-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `core-java-240` (chunk `core-java-240-01`, p1-10, text layer); source `../240-core-java-questions.pdf`, read with `pdftotext -f 1 -l 10 -layout "../240-core-java-questions.pdf" -`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: Cover "240 Core Java Interview Questions"; Q1-35: static blocks, constructors, overriding vs overloading, super, abstract class vs interface, platform independence, JIT, ...
- Acceptance: E1 to E6 (above).
- Done by: S20261025-0757-claudecode, claude-sonnet-5-5 subagent (spot-checked by claude-opus-5-5 main)

### EXTRACT-core-java-240-02 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/core-java-240.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `core-java-240-02-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `core-java-240` (chunk `core-java-240-02`, p11-16, text layer); source `../240-core-java-questions.pdf`, read with `pdftotext -f 11 -l 16 -layout "../240-core-java-questions.pdf" -`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: Q36-55: null, multiple classes per file, packages, identifiers, access modifiers (class, method, variable), final, abstract classes and methods, exception basics
- Acceptance: E1 to E6 (above).
- Done by: S20261025-0757-claudecode, claude-sonnet-5-5 subagent (spot-checked by claude-opus-5-5 main)

### EXTRACT-core-java-240-03 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/core-java-240.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `core-java-240-03-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `core-java-240` (chunk `core-java-240-03`, p17-22, text layer); source `../240-core-java-questions.pdf`, read with `pdftotext -f 17 -l 22 -layout "../240-core-java-questions.pdf" -`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: Q56-81: exception handling (try/catch/finally, multi-catch, checked vs unchecked, throw/throws, user-defined, rethrow, nested try, Throwable, ClassNotFoundException vs ...
- Acceptance: E1 to E6 (above).
- Done by: S20261025-1507-claudecode, claude-sonnet-5-5 subagent (spot-checked by claude-opus-5-5 main)

### EXTRACT-core-java-240-04 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/core-java-240.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `core-java-240-04-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `core-java-240` (chunk `core-java-240-04`, p23-31, text layer); source `../240-core-java-questions.pdf`, read with `pdftotext -f 23 -l 31 -layout "../240-core-java-questions.pdf" -`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: Q82-124: process vs thread, multitasking, creating threads (Runnable vs Thread), scheduler, restart/block, synchronization, class-level lock, priorities, yield, sleep, ...
- Acceptance: E1 to E6 (above).
- Done by: S20261025-1507-claudecode, claude-sonnet-5-5 subagent (spot-checked by claude-opus-5-5 main)

### EXTRACT-core-java-240-05 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/core-java-240.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `core-java-240-05-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `core-java-240` (chunk `core-java-240-05`, p32-39, text layer); source `../240-core-java-questions.pdf`, read with `pdftotext -f 32 -l 39 -layout "../240-core-java-questions.pdf" -`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: Q125-163: IllegalMonitorStateException, thread groups, ThreadLocal, inner classes (member, static nested, local, anonymous), static members, overriding static methods, ...
- Acceptance: E1 to E6 (above).
- Done by: S20261025-1507-claudecode, claude-sonnet-5-5 subagent (spot-checked by claude-opus-5-5 main)

### EXTRACT-core-java-240-06 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/core-java-240.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `core-java-240-06-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `core-java-240` (chunk `core-java-240-06`, p40-45, text layer); source `../240-core-java-questions.pdf`, read with `pdftotext -f 40 -l 45 -layout "../240-core-java-questions.pdf" -`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: Q164-194: type conversion, garbage collection, classpath, instance variable scope, static imports, interfaces, enums, field hiding, switch on strings, OOP concepts
- Acceptance: E1 to E6 (above).
- Done by: S20261025-1507-claudecode, claude-sonnet-5-5 subagent (spot-checked by claude-opus-5-5 main)

### EXTRACT-core-java-240-07 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/core-java-240.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `core-java-240-07-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `core-java-240` (chunk `core-java-240-07`, p46-54, text layer); source `../240-core-java-questions.pdf`, read with `pdftotext -f 46 -l 54 -layout "../240-core-java-questions.pdf" -`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: Q195-211: Collection interface, List and implementations, Set and implementations
- Acceptance: E1 to E6 (above).
- Done by: S20261025-1507-claudecode, claude-sonnet-5-5 subagent (spot-checked by claude-opus-5-5 main)

### EXTRACT-core-java-240-08 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/core-java-240.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `core-java-240-08-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `core-java-240` (chunk `core-java-240-08`, p55-63, text layer); source `../240-core-java-questions.pdf`, read with `pdftotext -f 55 -l 63 -layout "../240-core-java-questions.pdf" -`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: Q212-240: Map implementations (LinkedHashMap, Hashtable), fail-safe iterators, serialization and serialVersionUID, static overriding, private constructor; short closing ...
- Acceptance: E1 to E6 (above).
- Done by: S20261025-1507-claudecode, claude-sonnet-5-5 subagent (spot-checked by claude-opus-5-5 main)

### EXTRACT-architect-answers-pdf-01 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/architect-answers-pdf.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `architect-answers-pdf-01-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `architect-answers-pdf` (chunk `architect-answers-pdf-01`, p1-7, text layer); source `../Architect interview answers.pdf`, read with `pdftotext -f 1 -l 7 -layout "../Architect interview answers.pdf" -`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: Part 1 Q1-7: multi-tenant data models, deadlock-reduction patterns, computed vs materialized views, data retention and archival, authentication/authorization across ...
- Acceptance: E1 to E6 (above); body text is Spanish; write the normalized questions in English.
- Done by: S20261025-0757-claudecode, claude-sonnet-5-5 subagent (spot-checked by claude-opus-5-5 main)

### EXTRACT-architect-answers-pdf-02 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/architect-answers-pdf.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `architect-answers-pdf-02-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `architect-answers-pdf` (chunk `architect-answers-pdf-02`, p8-14, text layer); source `../Architect interview answers.pdf`, read with `pdftotext -f 8 -l 14 -layout "../Architect interview answers.pdf" -`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: Part 1 Q8-15: secret rotation and zero-trust, Q9 (duplicate of Q6, expanded), documenting architecture, OLTP vs OLAP, surviving database failover, write contention, ...
- Acceptance: E1 to E6 (above); body text is Spanish; write the normalized questions in English.
- Done by: S20261025-0757-claudecode, claude-sonnet-5-5 subagent (spot-checked by claude-opus-5-5 main)

### EXTRACT-architect-answers-pdf-03 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/architect-answers-pdf.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `architect-answers-pdf-03-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `architect-answers-pdf` (chunk `architect-answers-pdf-03`, p15-21, text layer); source `../Architect interview answers.pdf`, read with `pdftotext -f 15 -l 21 -layout "../Architect interview answers.pdf" -`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: Part 1 Q16-23: Q17 avoiding single points of failure, eliminating shared state, rate limiting at API/service/infra levels, predictable horizontal scaling, multi-region ...
- Acceptance: E1 to E6 (above); body text is Spanish; write the normalized questions in English.
- Done by: S20261025-1507-claudecode, claude-sonnet-5-5 subagent (spot-checked by claude-opus-5-5 main)

### EXTRACT-architect-answers-pdf-04 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/architect-answers-pdf.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `architect-answers-pdf-04-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `architect-answers-pdf` (chunk `architect-answers-pdf-04`, p22-28, text layer); source `../Architect interview answers.pdf`, read with `pdftotext -f 22 -l 28 -layout "../Architect interview answers.pdf" -`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: Part 2 Q1-7: Modulith vs monolith vs microservices, what Spring Modulith is, defining and detecting modules, module encapsulation, named interfaces, ...
- Acceptance: E1 to E6 (above); body text is Spanish; write the normalized questions in English.
- Done by: S20261025-1507-claudecode, claude-sonnet-5-5 subagent (spot-checked by claude-opus-5-5 main)

### EXTRACT-architect-answers-pdf-05 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/architect-answers-pdf.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `architect-answers-pdf-05-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `architect-answers-pdf` (chunk `architect-answers-pdf-05`, p29-35, text layer); source `../Architect interview answers.pdf`, read with `pdftotext -f 29 -l 35 -layout "../Architect interview answers.pdf" -`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: Part 2 Q8-13: cyclic dependency detection, inter-module communication (calls vs domain events), @ApplicationModuleListener vs @EventListener, Event Publication Registry, ...
- Acceptance: E1 to E6 (above); body text is Spanish; write the normalized questions in English.
- Done by: S20261025-1507-claudecode, claude-sonnet-5-5 subagent (spot-checked by claude-opus-5-5 main)

### EXTRACT-architect-answers-pdf-06 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/architect-answers-pdf.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `architect-answers-pdf-06-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `architect-answers-pdf` (chunk `architect-answers-pdf-06`, p36-42, text layer); source `../Architect interview answers.pdf`, read with `pdftotext -f 36 -l 42 -layout "../Architect interview answers.pdf" -`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: Part 2 Q14-20: C4 diagram and module documentation generation, observability with Micrometer/Actuator, migrating a legacy monolith to a modulith (strangler fig), ...
- Acceptance: E1 to E6 (above); body text is Spanish; write the normalized questions in English.
- Done by: S20261025-1507-claudecode, claude-sonnet-5-5 subagent (spot-checked by claude-opus-5-5 main)

### EXTRACT-core-java-pdf-01 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/core-java-pdf.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `core-java-pdf-01-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `core-java-pdf` (chunk `core-java-pdf-01`, p1-10, text layer); source `../Core Java.pdf`, read with `pdftotext -f 1 -l 10 -layout "../Core Java.pdf" -`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: Q1-64: abstract class vs interface, checked/unchecked exceptions, user-defined exception, C++ vs Java, JAR, JNI, serialization, singleton, compilation unit, multiple ...
- Acceptance: E1 to E6 (above); desktop GUI (AWT/Swing/Applet) questions become rows "no interview content (out of scope: desktop GUI)" (SYLLABUS §9.10).
- Done by: S20261025-0757-claudecode, claude-sonnet-5-5 subagent (spot-checked by claude-opus-5-5 main)

### EXTRACT-core-java-pdf-02 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/core-java-pdf.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `core-java-pdf-02-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `core-java-pdf` (chunk `core-java-pdf-02`, p11-20, text layer); source `../Core Java.pdf`, read with `pdftotext -f 11 -l 20 -layout "../Core Java.pdf" -`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: Q65-146: thread states, anonymous classes, primitive ranges, finalization, run() vs start, operators, Locale, wait/notify, static vs non-static, locks, casting, Map ...
- Acceptance: E1 to E6 (above); desktop GUI (AWT/Swing/Applet) questions become rows "no interview content (out of scope: desktop GUI)" (SYLLABUS §9.10).
- Done by: S20261025-0757-claudecode, claude-sonnet-5-5 subagent (spot-checked by claude-opus-5-5 main)

### EXTRACT-core-java-pdf-03 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/core-java-pdf.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `core-java-pdf-03-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `core-java-pdf` (chunk `core-java-pdf-03`, p21-30, text layer); source `../Core Java.pdf`, read with `pdftotext -f 21 -l 30 -layout "../Core Java.pdf" -`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: Q147-219: default constructors, finally semantics, interrupt(), overloading and overriding restrictions, casting, main() signature, GC rules, I/O filter, Set, dead ...
- Acceptance: E1 to E6 (above); desktop GUI (AWT/Swing/Applet) questions become rows "no interview content (out of scope: desktop GUI)" (SYLLABUS §9.10).
- Done by: S20261025-1507-claudecode, claude-sonnet-5-5 subagent (spot-checked by claude-opus-5-5 main)

### EXTRACT-microservices-pdf-01 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/microservices-pdf.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `microservices-pdf-01-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `microservices-pdf` (chunk `microservices-pdf-01`, p1-8, text layer); source `../Microservice Architecture.pdf`, read with `pdftotext -f 1 -l 8 -layout "../Microservice Architecture.pdf" -`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: Cover, Table of Content, 1 What are Microservices, 2 How do Microservices work (service registry/discovery), 4 Design Patterns for Microservices (incl. Circuit Breaker, ...
- Acceptance: E1 to E6 (above).
- Done by: S20261025-0757-claudecode, claude-sonnet-5-5 subagent (spot-checked by claude-opus-5-5 main)

### EXTRACT-microservices-pdf-02 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/microservices-pdf.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `microservices-pdf-02-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `microservices-pdf` (chunk `microservices-pdf-02`, p9-16, text layer); source `../Microservice Architecture.pdf`, read with `pdftotext -f 9 -l 16 -layout "../Microservice Architecture.pdf" -`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: Bulkhead Pattern, 5 Anti-Patterns, 6 Real-World Example (Amazon e-commerce services), 7 Microservices vs Monolithic, 8 How to migrate from Monolithic, 9 SOA vs ...
- Acceptance: E1 to E6 (above).
- Done by: S20261025-0757-claudecode, claude-sonnet-5-5 subagent (spot-checked by claude-opus-5-5 main)

### EXTRACT-microservices-pdf-03 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/microservices-pdf.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `microservices-pdf-03-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `microservices-pdf` (chunk `microservices-pdf-03`, p17-22, text layer); source `../Microservice Architecture.pdf`, read with `pdftotext -f 17 -l 22 -layout "../Microservice Architecture.pdf" -`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: 10 Benefits and Challenges, 11 Real-World Examples of Companies, 12 Roadmap to understand Microservices (intro, designing, advanced topics), closing page
- Acceptance: E1 to E6 (above).
- Done by: S20261025-1507-claudecode, claude-sonnet-5-5 subagent (spot-checked by claude-opus-5-5 main)

### EXTRACT-spring-data-jpa-pdf-01 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/spring-data-jpa-pdf.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `spring-data-jpa-pdf-01-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `spring-data-jpa-pdf` (chunk `spring-data-jpa-pdf-01`, p1-9, text layer); source `../SPRING DATA JPA Complete Interview Preparation Guide.pdf`, read with `pdftotext -f 1 -l 9 -layout "../SPRING DATA JPA Complete Interview Preparation Guide.pdf" -`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: Cover, Table of Contents, Section 1 Introduction to Spring Data JPA, Section 2 JPA Entities and Annotations, Section 3 Entity Relationships (orphanRemoval), Section 4 ...
- Acceptance: E1 to E6 (above).
- Done by: S20261025-1507-claudecode (original extraction); S20261025-1603-codex, GPT-6 (source comparison, missing-topic recovery and acceptance checks)

### EXTRACT-spring-data-jpa-pdf-03 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/spring-data-jpa-pdf.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `spring-data-jpa-pdf-03-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `spring-data-jpa-pdf` (chunk `spring-data-jpa-pdf-03`, p18-22, text layer); source `../SPRING DATA JPA Complete Interview Preparation Guide.pdf`, read with `pdftotext -f 18 -l 22 -layout "../SPRING DATA JPA Complete Interview Preparation Guide.pdf" -`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: Rest of Section 14 (soft deletes, @NamedQuery vs @Query, batch inserts, @PersistenceContext), Section 15 Scenario-Based Questions (multi-tenancy, full-text search, merge ...
- Acceptance: E1 to E6 (above).
- Done by: S20261025-1507-claudecode (original extraction); S20261025-1603-codex, GPT-6 (source comparison, missing-topic recovery and acceptance checks)

### EXTRACT-spring-pdf-01 · M
- Status: `done` · Deps: none · needs: vision · Phase B
- Files touched: `_meta/sources/spring-pdf.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `spring-pdf-01-`), `_meta/sources/NEW-TOPICS.md`, `_meta/sources/INVENTORY.md` (only the "Unreadable record" table, if needed)
- Inputs: [INVENTORY](sources/INVENTORY.md) section `spring-pdf` (chunk `spring-pdf-01`, p1-8, needs: vision); source `../Spring.pdf`, read with render pages 1-8 with `pdftoppm -r 100 -f 1 -l 8 -png "../Spring.pdf" <scratch>/p` into a scratch folder (deleted afterwards) and read the PNGs; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: Cover "Spring Boot Interview Questions", disclaimer, Q1-7 (Spring Boot in microservices, auto-configuration, actuator, starters, REST service, MySQL); Q4 and Q8 titles ...
- Acceptance: E1 to E6 (above); image-based pages; unreadable rule of RUN.md §10.2 applies (fewer than half of the pages yield a row after one vision attempt: record it under "Unreadable record" in INVENTORY and stop).
- Done by: S20261025-1507-claudecode (original extraction); S20261025-1603-codex, GPT-6 (source comparison, missing-topic recovery and acceptance checks)

### EXTRACT-spring-pdf-02 · M
- Status: `done` · Deps: none · needs: vision · Phase B
- Files touched: `_meta/sources/spring-pdf.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `spring-pdf-02-`), `_meta/sources/NEW-TOPICS.md`, `_meta/sources/INVENTORY.md` (only the "Unreadable record" table, if needed)
- Inputs: [INVENTORY](sources/INVENTORY.md) section `spring-pdf` (chunk `spring-pdf-02`, p9-16, needs: vision); source `../Spring.pdf`, read with render pages 9-16 with `pdftoppm -r 100 -f 9 -l 16 -png "../Spring.pdf" <scratch>/p` into a scratch folder (deleted afterwards) and read the PNGs; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: Q8/Q9 (exception handling code seen), Q10 custom Actuator endpoint, Q11-12 pagination and sorting, Q13 custom banner, Q14 (Kafka properties seen), Q15 scheduling, Q16 ...
- Acceptance: E1 to E6 (above); image-based pages; unreadable rule of RUN.md §10.2 applies (fewer than half of the pages yield a row after one vision attempt: record it under "Unreadable record" in INVENTORY and stop).
- Done by: S20261025-1507-claudecode (original extraction); S20261025-1603-codex, GPT-6 (source comparison, missing-topic recovery and acceptance checks)

### EXTRACT-spring-pdf-03 · M
- Status: `done` · Deps: none · needs: vision · Phase B
- Files touched: `_meta/sources/spring-pdf.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `spring-pdf-03-`), `_meta/sources/NEW-TOPICS.md`, `_meta/sources/INVENTORY.md` (only the "Unreadable record" table, if needed)
- Inputs: [INVENTORY](sources/INVENTORY.md) section `spring-pdf` (chunk `spring-pdf-03`, p17-24, needs: vision); source `../Spring.pdf`, read with render pages 17-24 with `pdftoppm -r 100 -f 17 -l 24 -png "../Spring.pdf" <scratch>/p` into a scratch folder (deleted afterwards) and read the PNGs; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: Q17 caching, Q18 (title unavailable without vision), Q19 i18n, Q20 Lombok integration, Q21 custom validator, closing promotional page "Why Bosscoder?"
- Acceptance: E1 to E6 (above); image-based pages; unreadable rule of RUN.md §10.2 applies (fewer than half of the pages yield a row after one vision attempt: record it under "Unreadable record" in INVENTORY and stop).
- Done by: S20261025-1507-claudecode (original extraction); S20261025-1603-codex, GPT-6 (source comparison, missing-topic recovery and acceptance checks)

### EXTRACT-system-design-pdf-01 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/system-design-pdf.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `system-design-pdf-01-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `system-design-pdf` (chunk `system-design-pdf-01`, p1-10, text layer (p1, p5 image-only)); source `../System Design Crash Course - Substack.pdf`, read with `pdftotext -f 1 -l 10 -layout "../System Design Crash Course - Substack.pdf" -`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: Cover (image), Table of Contents, "System Design Crash Course", Master Template (p5 diagram), 1 Load Balancer, 2 Data Partitioning, 3 Sharding, 4 CAP Theorem
- Acceptance: E1 to E6 (above); p1 (cover) and p5 (diagram) are image-only; vision is optional for p5, otherwise record both as "no interview content / diagram only".
- Done by: S20261025-1507-claudecode, claude-sonnet-5-5 subagent (spot-checked by claude-opus-5-5 main)

### EXTRACT-system-design-pdf-02 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/system-design-pdf.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `system-design-pdf-02-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `system-design-pdf` (chunk `system-design-pdf-02`, p11-19, text layer); source `../System Design Crash Course - Substack.pdf`, read with `pdftotext -f 11 -l 19 -layout "../System Design Crash Course - Substack.pdf" -`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: 5 CDN, 6 Message Queue, 7 Message Broker, 8 API, 9 Replication, 10 Microservices Architecture, 11 SQL vs NoSQL, Further Reading lists
- Acceptance: E1 to E6 (above).
- Done by: S20261025-1507-claudecode, claude-sonnet-5-5 subagent (spot-checked by claude-opus-5-5 main)

### EXTRACT-system-design-pdf-03 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/system-design-pdf.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `system-design-pdf-03-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `system-design-pdf` (chunk `system-design-pdf-03`, p20-27, text layer); source `../System Design Crash Course - Substack.pdf`, read with `pdftotext -f 20 -l 27 -layout "../System Design Crash Course - Substack.pdf" -`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: 12 Scalability (horizontal vs vertical), 13 Rate Limiting, 14 Reliability, 15 Availability, 16 Caching (eviction), 17 Latency vs Throughput
- Acceptance: E1 to E6 (above).
- Done by: S20261025-1507-claudecode, claude-sonnet-5-5 subagent (spot-checked by claude-opus-5-5 main)

### EXTRACT-system-design-pdf-04 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/system-design-pdf.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `system-design-pdf-04-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `system-design-pdf` (chunk `system-design-pdf-04`, p28-32, text layer); source `../System Design Crash Course - Substack.pdf`, read with `pdftotext -f 28 -l 32 -layout "../System Design Crash Course - Substack.pdf" -`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: 18 Forward Proxy vs Reverse Proxy, 19 DNS, 20 Long Polling vs WebSockets, API gateway vs load balancer, FAQs (Q: horizontal vs vertical scaling)
- Acceptance: E1 to E6 (above).
- Done by: S20261025-1507-claudecode, claude-sonnet-5-5 subagent (spot-checked by claude-opus-5-5 main)

### EXTRACT-architect-md-02 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/architect-md.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `architect-md-02-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `architect-md` (chunk `architect-md-02`, lines 154-257, text layer); source `../Architect-Level Production & Architect.md`, read with `sed -n '154,257p' "../Architect-Level Production & Architect.md"`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: Group B Saturation, Pools and Threading: Q4 HikariCP exhausted, Q3 collapse at 10,000 users, Q10 slow downstream, Q20 @Async blocking
- Acceptance: E1 to E6 (above).
- Done by: S20261025-1507-claudecode, claude-sonnet-5-5 subagent (spot-checked by claude-opus-5-5 main)

### EXTRACT-architect-md-03 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/architect-md.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `architect-md-03-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `architect-md` (chunk `architect-md-03`, lines 258-310, text layer); source `../Architect-Level Production & Architect.md`, read with `sed -n '258,310p' "../Architect-Level Production & Architect.md"`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: Group C Availability and Deploys: Q6 health checks pass but 503s, Q12 zero-downtime breaking schema change
- Acceptance: E1 to E6 (above).
- Done by: S20261025-1507-claudecode, claude-sonnet-5-5 subagent (spot-checked by claude-opus-5-5 main)

### EXTRACT-architect-md-04 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/architect-md.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `architect-md-04-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `architect-md` (chunk `architect-md-04`, lines 311-383, text layer); source `../Architect-Level Production & Architect.md`, read with `sed -n '311,383p' "../Architect-Level Production & Architect.md"`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: Group D JVM and Memory: Q11 GC latency spikes, Q13 multi-day memory leak, Q15 peak-hour OOM
- Acceptance: E1 to E6 (above).
- Done by: S20261025-1507-claudecode, claude-sonnet-5-5 subagent (spot-checked by claude-opus-5-5 main)

### EXTRACT-architect-md-05 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/architect-md.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `architect-md-05-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `architect-md` (chunk `architect-md-05`, lines 384-463, text layer); source `../Architect-Level Production & Architect.md`, read with `sed -n '384,463p' "../Architect-Level Production & Architect.md"`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: Group E Observability: Q9 cache hit ratio drop, Q14 intermittent failures without exceptions, Q17 distributed tracing
- Acceptance: E1 to E6 (above).
- Done by: S20261025-1507-claudecode, claude-sonnet-5-5 subagent (spot-checked by claude-opus-5-5 main)

### EXTRACT-architect-md-06 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/architect-md.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `architect-md-06-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `architect-md` (chunk `architect-md-06`, lines 464-515, text layer); source `../Architect-Level Production & Architect.md`, read with `sed -n '464,515p' "../Architect-Level Production & Architect.md"`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: Group F Write Amplification and Rate Control: Q18 DB write surge, Q19 rate limiter for burst traffic
- Acceptance: E1 to E6 (above).
- Done by: S20261025-1507-claudecode, claude-sonnet-5-5 subagent (spot-checked by claude-opus-5-5 main)

### EXTRACT-architect-md-07 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/architect-md.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `architect-md-07-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `architect-md` (chunk `architect-md-07`, lines 516-675, text layer); source `../Architect-Level Production & Architect.md`, read with `sed -n '516,675p' "../Architect-Level Production & Architect.md"`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: Group G Service-to-Service Communication and Resilience: Q21 how microservices communicate, Q22 REST vs broker, Q23 failing Service B, Q24 circuit breaker/retry/timeout, ...
- Acceptance: E1 to E6 (above).
- Done by: S20261025-1507-claudecode, claude-sonnet-5-5 subagent (spot-checked by claude-opus-5-5 main)

### EXTRACT-architect-md-08 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/architect-md.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `architect-md-08-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `architect-md` (chunk `architect-md-08`, lines 676-821, text layer); source `../Architect-Level Production & Architect.md`, read with `sed -n '676,821p' "../Architect-Level Production & Architect.md"`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: Group H Delivery: Q27 Spring Boot container image, Q28 Kubernetes probes/resources/rollout, Q29 delivery pipeline, Q30 failing deploy
- Acceptance: E1 to E6 (above).
- Done by: S20261025-1507-claudecode, claude-sonnet-5-5 subagent (spot-checked by claude-opus-5-5 main)

### EXTRACT-architect-md-09 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/architect-md.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `architect-md-09-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `architect-md` (chunk `architect-md-09`, lines 822-846, text layer); source `../Architect-Level Production & Architect.md`, read with `sed -n '822,846p' "../Architect-Level Production & Architect.md"`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: Appendix Cross-Cutting Mental Models to Internalize; How to drill this for interview readiness
- Acceptance: E1 to E6 (above); appendix and drill section: mostly cross-cutting mental models; record as rows only where a question or topic exists.
- Done by: S20261025-1507-claudecode, claude-sonnet-5-5 subagent (spot-checked by claude-opus-5-5 main)

### EXTRACT-data-storage-md-01 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/data-storage-md.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `data-storage-md-01-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `data-storage-md` (chunk `data-storage-md-01`, lines 1-319, text layer); source `../Backend Interview Study Guide - Data storage, behavioral & concurrency.md`, read with `sed -n '1,319p' "../Backend Interview Study Guide - Data storage, behavioral & concurrency.md"`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: Title and "How to use this"; SESSION 1 The Tested Core: 1 Concurrency and the Java Memory Model (1.1-1.16: thread pool sizing, synchronized/volatile, HashMap races, ...
- Acceptance: E1 to E6 (above).
- Done by: S20261025-1507-claudecode (original extraction); S20261025-1603-codex, GPT-6 (source comparison, missing-topic recovery and acceptance checks)

### EXTRACT-data-storage-md-02 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/data-storage-md.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `data-storage-md-02-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `data-storage-md` (chunk `data-storage-md-02`, lines 320-528, text layer); source `../Backend Interview Study Guide - Data storage, behavioral & concurrency.md`, read with `sed -n '320,528p' "../Backend Interview Study Guide - Data storage, behavioral & concurrency.md"`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: SESSION 2 The Differentiators: 5 Networking and protocols (5.1-5.4), 6 Observability and production operations (6.1-6.5), 7 System design (7.1-7.4), 8 AI-assisted ...
- Acceptance: E1 to E6 (above).
- Done by: S20261025-1507-claudecode (original extraction); S20261025-1603-codex, GPT-6 (source comparison, missing-topic recovery and acceptance checks)

### EXTRACT-security-jpa-md-01 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/security-jpa-md.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `security-jpa-md-01-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `security-jpa-md` (chunk `security-jpa-md-01`, lines 1-74, text layer); source `../Backend Study Guide - Security, JPA, Design Patterns & Spring.md`, read with `sed -n '1,74p' "../Backend Study Guide - Security, JPA, Design Patterns & Spring.md"`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: Title, Corrections and Assumptions; PART I Web Application Security (OWASP): 1.1 What OWASP is, 1.2 OWASP Top 10 2021 edition, key terms, Part I summary
- Acceptance: E1 to E6 (above).
- Done by: S20261025-1507-claudecode, claude-sonnet-5-5 subagent (spot-checked by claude-opus-5-5 main)

### EXTRACT-security-jpa-md-02 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/security-jpa-md.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `security-jpa-md-02-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `security-jpa-md` (chunk `security-jpa-md-02`, lines 75-320, text layer); source `../Backend Study Guide - Security, JPA, Design Patterns & Spring.md`, read with `sed -n '75,320p' "../Backend Study Guide - Security, JPA, Design Patterns & Spring.md"`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: PART II Data Access with JPA: 2.1 Entity Relationship Annotations, 2.2 Query Methods (keyword reference table), 2.3 Specifications, 2.4 The N+1 Query Problem (how it ...
- Acceptance: E1 to E6 (above).
- Done by: S20261025-1507-claudecode, claude-sonnet-5-5 subagent (spot-checked by claude-opus-5-5 main)

### EXTRACT-security-jpa-md-03 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/security-jpa-md.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `security-jpa-md-03-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `security-jpa-md` (chunk `security-jpa-md-03`, lines 321-1140, text layer); source `../Backend Study Guide - Security, JPA, Design Patterns & Spring.md`, read with `sed -n '321,1140p' "../Backend Study Guide - Security, JPA, Design Patterns & Spring.md"`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: PART III Design Patterns: 3.1 Creational (Singleton, Factory, Abstract Factory, Builder, Prototype), 3.2 Structural (Adapter, Composite, Proxy, Flyweight, Facade, ...
- Acceptance: E1 to E6 (above).
- Done by: S20261025-1507-claudecode, claude-sonnet-5-5 subagent (spot-checked by claude-opus-5-5 main)

### EXTRACT-security-jpa-md-05 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/security-jpa-md.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `security-jpa-md-05-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `security-jpa-md` (chunk `security-jpa-md-05`, lines 1362-1478, text layer); source `../Backend Study Guide - Security, JPA, Design Patterns & Spring.md`, read with `sed -n '1362,1478p' "../Backend Study Guide - Security, JPA, Design Patterns & Spring.md"`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: PART V Spring and Spring Boot Annotations: 5.1 Spring Framework annotations, 5.2 Spring Boot annotations, 5.3 What happens when @SpringBootApplication runs (startup ...
- Acceptance: E1 to E6 (above).
- Done by: S20261025-1507-claudecode, claude-sonnet-5-5 subagent (spot-checked by claude-opus-5-5 main)

### EXTRACT-honeywell-optum-md-01 · M
- Status: `done` · Deps: none · needs: none · Phase B
- Files touched: `_meta/sources/honeywell-optum-md.md` (created from [LEDGER-TEMPLATE](sources/LEDGER-TEMPLATE.md) if absent; rewrite only the rows whose ID starts with `honeywell-optum-md-01-`), `_meta/sources/NEW-TOPICS.md`
- Inputs: [INVENTORY](sources/INVENTORY.md) section `honeywell-optum-md` (chunk `honeywell-optum-md-01`, lines 1-140, text layer); source `../Java Backend Interview Guide - Honeywell, Optum & Production Scenarios.md`, read with `sed -n '1,140p' "../Java Backend Interview Guide - Honeywell, Optum & Production Scenarios.md"`; the other ledgers in `_meta/sources/` (for `duplicate-of`); SYLLABUS §1 and §4 (target modules). Heading signal: Title; Table of contents (12 sections); Coverage table
- Acceptance: E1 to E6 (above); the file holds only a TOC and coverage table: rows come from that table (Jorge question G1 #4: full text may exist elsewhere).
- Done by: S20261025-1507-claudecode, claude-sonnet-5-5 subagent (spot-checked by claude-opus-5-5 main)

### SYLLABUS-REVISE · L
- Status: `done` · Deps: all 47 `EXTRACT-*` tasks `done`, or the chunk recorded unreadable in INVENTORY · needs: none · gate: none
- Files touched: `SYLLABUS.md`, `_meta/sources/*.md` (final targets), `_meta/sources/NEW-TOPICS.md`, `_meta/sources/INVENTORY.md`, `PROGRESS.md`, `_meta/ROADMAP.md`, `_meta/TASKS.md` (extra DELETE tasks), `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: every ledger and NEW-TOPICS; SYLLABUS §1, §4, §8, §9, §10; RUN.md §10.2
- Acceptance: new topics and modules added append-only (no slug renamed or renumbered); every ledger row mapped to a final target; the §8 size projection re-run; MOVE and DELETE tasks queued per source; ROADMAP Phase C and PROGRESS rows updated for any new module; `node java-backend-guide/labs/tools/check-links.mjs --planned java-backend-guide` and `node java-backend-guide/labs/tools/module-stats.mjs` exit 0.
- Done by: S20261028-0812-antigravity (Gemini 3.8 Flash)

## Phase C: remaining modules (ROADMAP Phase C order)

### PLAN-M01 · M
- Status: `done` · Deps: G1 (ticked) · needs: none
- Files touched: `_meta/modules/M01.md`, `modules/01-java-oop-fundamentals.md` (skeleton with `<!-- TASK: <ID> -->` regions, STYLE-GUIDE §2.4), `labs/java-language/**` (package `dev.interview.javalanguage.m01`: one smoke test; the P5 `HelloOutput` smoke stays), `_meta/TASKS.md` (append SEC, QB, EX, CLOSE tasks), `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: RUN.md §9; SYLLABUS §1 row 01, §4 module 01 checklist, §5, §9; STYLE-GUIDE; [QUALITY-BAR](QUALITY-BAR.md); ledger rows targeting 01 (mainly `core-java-240.md`, `core-java-pdf.md`, `honeywell-optum-md.md`, `system-design-pdf.md`); `labs/java-language/`; the `### Q` headings of module 17; [M17](modules/M17.md) as a shape reference.
- Acceptance: the RUN.md §9 outputs 1 to 4; breadth gate (every SYLLABUS 01 checkbox and every ledger row targeting 01 has a section, a question or a recorded reason); the skeleton has every heading and anchor; Standard checks rows 3 (no Docker needed), 4, 5, 6 pass for `java-language`; SEC, QB, EX, CLOSE tasks appended with inputs, files, `needs:` and acceptance.
- Done by: S20261101-2100-claudecode (claude-opus-5-5, main session; smoke test reviewed by java-reviewer subagent, PASS in round 2)


Appended by PLAN-M01 (S20261101-2100-claudecode). Plan: [M01](modules/M01.md). Shared rules for every task below: write only inside the task's own `<!-- TASK: <ID> -->` region(s) of `modules/01-java-oop-fundamentals.md`, in one edit at the end; lab paths are under `labs/java-language/src/{main,test}/java/dev/interview/javalanguage/m01/` (main and test mirror each other); `SOURCES.md` under a "01 java-oop-fundamentals" heading for every new URL; `VERSIONS.md` only to add a Java feature-status row the task verified (JEP 512, 513, 395…); `_meta/TASKS.md`, `_meta/STATE.md`, `_meta/LOG.md` for bookkeeping. No task needs Docker or vision. Java 25 final features only (no `--enable-preview`).

### SEC-M01-01 · M · §1 How Java runs
- Status: `done` · Deps: none · needs: none
- Files touched: `modules/01-java-oop-fundamentals.md` (region `SEC-M01-01`), lab `m01/s01/**` (main and test). Creates `m01/support/InMemoryCompiler.java` (test). `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M01](modules/M01.md) §1 (lab design) and §4 entry §1; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §1 (M01 §3) and their Notes (source errors become traps).
- Acceptance: the §2.2 subsections in order (the skeleton already omits Failure modes where M01 §4 skips it; any other gap only with a reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present; within the word budget of M01 §4; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3 (no Docker in this module), 4, 5, 6 for `java-language`.
- Done by: S20261101-2100-claudecode (claude-opus-5-5; writing and lab by the main session through the shell, java-workflow plan by java-orchestrator; Java review: java-reviewer subagent, PASS in round 2)

### SEC-M01-02 · M · §2 Primitive types, conversions and overflow
- Status: `done` · Deps: SEC-M01-01 · needs: none
- Files touched: `modules/01-java-oop-fundamentals.md` (region `SEC-M01-02`), lab `m01/s02/**` (main and test). Creates `m01/support/OutputCapture.java` (test). `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M01](modules/M01.md) §1 (lab design) and §4 entry §2; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §2 (M01 §3) and their Notes (source errors become traps).
- Acceptance: the §2.2 subsections in order (the skeleton already omits Failure modes where M01 §4 skips it; any other gap only with a reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present; within the word budget of M01 §4; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3 (no Docker in this module), 4, 5, 6 for `java-language`.
- Done by: S20261101-2136-claudecode (claude-opus-5-5; writing and lab by the main session through the shell, java-workflow plan by java-orchestrator (haiku); Java review: java-reviewer subagent (sonnet), PASS with 4 MINOR, 2 fixed)

### SEC-M01-03 · M · §3 Lexical structure, operators and control flow
- Status: `done` · Deps: SEC-M01-01, SEC-M01-02 · needs: none
- Files touched: `modules/01-java-oop-fundamentals.md` (region `SEC-M01-03`), lab `m01/s03/**` (main and test). `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M01](modules/M01.md) §1 (lab design) and §4 entry §3; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §3 (M01 §3) and their Notes (source errors become traps).
- Acceptance: the §2.2 subsections in order (the skeleton already omits Failure modes where M01 §4 skips it; any other gap only with a reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present; within the word budget of M01 §4; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3 (no Docker in this module), 4, 5, 6 for `java-language`.
- Done by: S20261102-1136-claudecode (claude-opus-5-5; writing and lab by the main session; java-orchestrator haiku, java-reviewer sonnet: CHANGES_REQUIRED then PASS in round 2)

### SEC-M01-04 · M · §4 Classes, objects, references and pass-by-value
- Status: `done` · Deps: SEC-M01-01, SEC-M01-02 · needs: none
- Files touched: `modules/01-java-oop-fundamentals.md` (region `SEC-M01-04`), lab `m01/s04/**` (main and test). `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M01](modules/M01.md) §1 (lab design) and §4 entry §4; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §4 (M01 §3) and their Notes (source errors become traps).
- Acceptance: the §2.2 subsections in order (the skeleton already omits Failure modes where M01 §4 skips it; any other gap only with a reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present; within the word budget of M01 §4; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3 (no Docker in this module), 4, 5, 6 for `java-language`.
- Done by: S20261102-1212-claudecode (claude-opus-5-5; writing and lab by the main session; java-orchestrator haiku, java-reviewer sonnet: CHANGES_REQUIRED then PASS in round 2)

### SEC-M01-05 · M · §5 Constructors and initialization order
- Status: `done` · Deps: SEC-M01-01, SEC-M01-02 · needs: none
- Files touched: `modules/01-java-oop-fundamentals.md` (region `SEC-M01-05`), lab `m01/s05/**` (main and test). `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M01](modules/M01.md) §1 (lab design) and §4 entry §5; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §5 (M01 §3) and their Notes (source errors become traps).
- Acceptance: the §2.2 subsections in order (the skeleton already omits Failure modes where M01 §4 skips it; any other gap only with a reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present; within the word budget of M01 §4; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3 (no Docker in this module), 4, 5, 6 for `java-language`.
- Done by: S20261102-1331-claudecode (claude-opus-5-5; writing and lab by the main session; java-orchestrator haiku, java-reviewer sonnet: PASS in round 1, 3 MINOR, none to fix)

### SEC-M01-06 · M · §6 Packages, access control and encapsulation
- Status: `done` · Deps: SEC-M01-01, SEC-M01-02 · needs: none
- Files touched: `modules/01-java-oop-fundamentals.md` (region `SEC-M01-06`), lab `m01/s06/**` (main and test). `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M01](modules/M01.md) §1 (lab design) and §4 entry §6; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §6 (M01 §3) and their Notes (source errors become traps).
- Acceptance: the §2.2 subsections in order (the skeleton already omits Failure modes where M01 §4 skips it; any other gap only with a reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present; within the word budget of M01 §4; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3 (no Docker in this module), 4, 5, 6 for `java-language`.
- Done by: S20261102-1341-claudecode (claude-opus-5-5; writing and lab by the main session through the shell; plan: java-orchestrator (haiku); Java review: java-reviewer (sonnet), PASS in round 1)

### SEC-M01-07 · M · §7 Inheritance, composition and `Object`
- Status: `done` · Deps: SEC-M01-01, SEC-M01-02 · needs: none
- Files touched: `modules/01-java-oop-fundamentals.md` (region `SEC-M01-07`), lab `m01/s07/**` (main and test). `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M01](modules/M01.md) §1 (lab design) and §4 entry §7; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §7 (M01 §3) and their Notes (source errors become traps).
- Acceptance: the §2.2 subsections in order (the skeleton already omits Failure modes where M01 §4 skips it; any other gap only with a reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present; within the word budget of M01 §4; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3 (no Docker in this module), 4, 5, 6 for `java-language`.
- Done by: S20261102-1918-claudecode (claude-opus-5-5; orchestrator haiku, reviewer sonnet PASS)

### SEC-M01-08 · L · §8 Polymorphism: overloading, overriding and dispatch
- Status: `done` · Deps: SEC-M01-01, SEC-M01-02 · needs: none
- Files touched: `modules/01-java-oop-fundamentals.md` (region `SEC-M01-08`), lab `m01/s08/**` (main and test). `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M01](modules/M01.md) §1 (lab design) and §4 entry §8; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §8 (M01 §3) and their Notes (source errors become traps).
- Acceptance: the §2.2 subsections in order (the skeleton already omits Failure modes where M01 §4 skips it; any other gap only with a reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present; within the word budget of M01 §4; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3 (no Docker in this module), 4, 5, 6 for `java-language`.
- Done by: S20261102-2105-claudecode (claude-opus-5-5); java-workflow: java-orchestrator (haiku), java-reviewer (sonnet) PASS round 2

### SEC-M01-09 · M · §9 Abstract classes and interfaces
- Status: `done` · Deps: SEC-M01-01, SEC-M01-02 · needs: none
- Files touched: `modules/01-java-oop-fundamentals.md` (region `SEC-M01-09`), lab `m01/s09/**` (main and test). `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M01](modules/M01.md) §1 (lab design) and §4 entry §9; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §9 (M01 §3) and their Notes (source errors become traps).
- Acceptance: the §2.2 subsections in order (the skeleton already omits Failure modes where M01 §4 skips it; any other gap only with a reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present; within the word budget of M01 §4; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3 (no Docker in this module), 4, 5, 6 for `java-language`.
- Done by: S20261105-1850-claudecode (claude-opus-5-5); java-workflow: java-orchestrator, java-tester, java-implementer, java-reviewer PASS round 3

### SEC-M01-10 · M · §10 `static`, `final` and constants
- Status: `done` · Deps: SEC-M01-01, SEC-M01-02 · needs: none
- Files touched: `modules/01-java-oop-fundamentals.md` (region `SEC-M01-10`), lab `m01/s10/**` (main and test). `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M01](modules/M01.md) §1 (lab design) and §4 entry §10; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §10 (M01 §3) and their Notes (source errors become traps).
- Acceptance: the §2.2 subsections in order (the skeleton already omits Failure modes where M01 §4 skips it; any other gap only with a reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present; within the word budget of M01 §4; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3 (no Docker in this module), 4, 5, 6 for `java-language`.
- Done by: S20261105-2130-claudecode (claude-opus-5-5); java-workflow: java-orchestrator, java-tester, java-implementer, java-reviewer (sonnet) PASS round 1

### SEC-M01-11 · M · §11 Nested types
- Status: `done` · Deps: SEC-M01-01, SEC-M01-02 · needs: none
- Files touched: `modules/01-java-oop-fundamentals.md` (region `SEC-M01-11`), lab `m01/s11/**` (main and test). `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M01](modules/M01.md) §1 (lab design) and §4 entry §11; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §11 (M01 §3) and their Notes (source errors become traps).
- Acceptance: the §2.2 subsections in order (the skeleton already omits Failure modes where M01 §4 skips it; any other gap only with a reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present; within the word budget of M01 §4; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3 (no Docker in this module), 4, 5, 6 for `java-language`.
- Done by: S20261105-2146-claudecode (claude-opus-5-5); java-workflow: java-orchestrator, java-tester, java-implementer, java-reviewer (all sonnet) PASS round 1

### SEC-M01-12 · M · §12 Enums
- Status: `done` · Deps: SEC-M01-01, SEC-M01-02 · needs: none
- Files touched: `modules/01-java-oop-fundamentals.md` (region `SEC-M01-12`), lab `m01/s12/**` (main and test). `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M01](modules/M01.md) §1 (lab design) and §4 entry §12; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §12 (M01 §3) and their Notes (source errors become traps).
- Acceptance: the §2.2 subsections in order (the skeleton already omits Failure modes where M01 §4 skips it; any other gap only with a reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present; within the word budget of M01 §4; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3 (no Docker in this module), 4, 5, 6 for `java-language`.
- Done by: S20261105-2154-claudecode (claude-opus-5-5; subagents on sonnet)

### SEC-M01-13 · M · §13 Wrappers, autoboxing and the `Integer` cache
- Status: `done` · Deps: SEC-M01-01, SEC-M01-02 · needs: none
- Files touched: `modules/01-java-oop-fundamentals.md` (region `SEC-M01-13`), lab `m01/s13/**` (main and test). `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M01](modules/M01.md) §1 (lab design) and §4 entry §13; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §13 (M01 §3) and their Notes (source errors become traps).
- Acceptance: the §2.2 subsections in order (the skeleton already omits Failure modes where M01 §4 skips it; any other gap only with a reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present; within the word budget of M01 §4; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3 (no Docker in this module), 4, 5, 6 for `java-language`.
- Done by: S20261105-2202-claudecode (claude-opus-5-5; subagents on sonnet)

### QB-M01-01 · M · Q01.01–Q01.08
- Status: `done` · Deps: SEC-M01-01, -02, -03 · needs: none
- Files touched: `modules/01-java-oop-fundamentals.md` (region `QB-M01-01`), lab `m01/outputs/**` (main `Q01_mm` classes and their tests), `SOURCES.md`
- Inputs: [M01](modules/M01.md) §5 rows Q01.01–Q01.08 and §3 (ledger rows of each question, with Notes); STYLE-GUIDE §5, §7.3–7.5; [QUALITY-BAR](QUALITY-BAR.md) C, D; the sections each question drills.
- Acceptance: each question has the anchor and heading of the skeleton unchanged, a `<!-- ledger: … -->` line listing its M01 §5 rows plus their duplicates (M01 §3), and all five answer parts (QUALITY-BAR D1); every `Output` answer asserted by a test whose `@DisplayName` starts with its ID (compile-time ones through `InMemoryCompiler`); Production scenario answers follow D9; follow-ups answered; ~215 words per question on average (M01 budget); Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261105-2210-claudecode, claude-opus-5-5 (java-workflow subagents on sonnet)

### QB-M01-02 · M · Q01.09–Q01.16
- Status: `done` · Deps: SEC-M01-03 to -07 · needs: none
- Files touched: `modules/01-java-oop-fundamentals.md` (region `QB-M01-02`), lab `m01/outputs/**` (main `Q01_mm` classes and their tests), `SOURCES.md`
- Inputs: [M01](modules/M01.md) §5 rows Q01.09–Q01.16 and §3 (ledger rows of each question, with Notes); STYLE-GUIDE §5, §7.3–7.5; [QUALITY-BAR](QUALITY-BAR.md) C, D; the sections each question drills.
- Acceptance: each question has the anchor and heading of the skeleton unchanged, a `<!-- ledger: … -->` line listing its M01 §5 rows plus their duplicates (M01 §3), and all five answer parts (QUALITY-BAR D1); every `Output` answer asserted by a test whose `@DisplayName` starts with its ID (compile-time ones through `InMemoryCompiler`); Production scenario answers follow D9; follow-ups answered; ~215 words per question on average (M01 budget); Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261107-0809-claudecode (claude-opus-5-5; java-workflow subagents on sonnet; java-reviewer PASS)

### QB-M01-03 · M · Q01.17–Q01.24
- Status: `done` · Deps: SEC-M01-07 to -09 · needs: none
- Files touched: `modules/01-java-oop-fundamentals.md` (region `QB-M01-03`), lab `m01/outputs/**` (main `Q01_mm` classes and their tests), `SOURCES.md`
- Inputs: [M01](modules/M01.md) §5 rows Q01.17–Q01.24 and §3 (ledger rows of each question, with Notes); STYLE-GUIDE §5, §7.3–7.5; [QUALITY-BAR](QUALITY-BAR.md) C, D; the sections each question drills.
- Acceptance: each question has the anchor and heading of the skeleton unchanged, a `<!-- ledger: … -->` line listing its M01 §5 rows plus their duplicates (M01 §3), and all five answer parts (QUALITY-BAR D1); every `Output` answer asserted by a test whose `@DisplayName` starts with its ID (compile-time ones through `InMemoryCompiler`); Production scenario answers follow D9; follow-ups answered; ~215 words per question on average (M01 budget); Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261107-0822-claudecode (claude-opus-5-5; java-workflow subagents on sonnet; java-reviewer PASS round 1, 3 MINOR)

### QB-M01-04 · M · Q01.25–Q01.28
- Status: `done` · Deps: SEC-M01-10 to -13 · needs: none
- Files touched: `modules/01-java-oop-fundamentals.md` (region `QB-M01-04`), lab `m01/outputs/**` (main `Q01_mm` classes and their tests), `SOURCES.md`
- Inputs: [M01](modules/M01.md) §5 rows Q01.25–Q01.28 and §3 (ledger rows of each question, with Notes); STYLE-GUIDE §5, §7.3–7.5; [QUALITY-BAR](QUALITY-BAR.md) C, D; the sections each question drills.
- Acceptance: each question has the anchor and heading of the skeleton unchanged, a `<!-- ledger: … -->` line listing its M01 §5 rows plus their duplicates (M01 §3), and all five answer parts (QUALITY-BAR D1); every `Output` answer asserted by a test whose `@DisplayName` starts with its ID (compile-time ones through `InMemoryCompiler`); Production scenario answers follow D9; follow-ups answered; ~215 words per question on average (M01 budget); Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261107-0841-claudecode (claude-opus-5-5; prose only, no lab change, no subagents)

### EX-M01-01 · M · Ex01.1 · An order total that cannot overflow or lose a cent
- Status: `done` · Deps: SEC-M01-02, SEC-M01-13 · needs: none
- Files touched: `modules/01-java-oop-fundamentals.md` (region `EX-M01-01`), lab `m01/ex1/**` (main: starting code under `ex1/broken/` if the exercise starts from broken code, and the solution; test: one test per criterion), `SOURCES.md`
- Inputs: [M01](modules/M01.md) §6 row Ex01.1; STYLE-GUIDE §7.1, §8.1; [QUALITY-BAR](QUALITY-BAR.md) E; the sections it uses.
- Acceptance: QUALITY-BAR E1 anatomy; every M01 §6 criterion has a test `@DisplayName("Ex01.1 · …")` and every such test maps to a criterion (E2); the solution follows STYLE-GUIDE §7.1 (E4); ~330 words of prose; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261107-0852-claudecode (claude-opus-5-5 main session and prose; java-orchestrator, java-tester, java-implementer, java-reviewer on sonnet)

### EX-M01-02 · M · Ex01.2 · Shipping rules as an enum with behaviour
- Status: `done` · Deps: SEC-M01-08, -09, -12 · needs: none
- Files touched: `modules/01-java-oop-fundamentals.md` (region `EX-M01-02`), lab `m01/ex2/**` (main: starting code under `ex2/broken/` if the exercise starts from broken code, and the solution; test: one test per criterion), `SOURCES.md`
- Inputs: [M01](modules/M01.md) §6 row Ex01.2; STYLE-GUIDE §7.1, §8.1; [QUALITY-BAR](QUALITY-BAR.md) E; the sections it uses.
- Acceptance: QUALITY-BAR E1 anatomy; every M01 §6 criterion has a test `@DisplayName("Ex01.2 · …")` and every such test maps to a criterion (E2); the solution follows STYLE-GUIDE §7.1 (E4); ~330 words of prose; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261107-0900-claudecode (claude-opus-5-5 main session and prose; java-orchestrator, java-tester, java-implementer, java-reviewer on sonnet)

### EX-M01-03 · M · Ex01.3 · Repair a leaky, fragile listener registry
- Status: `done` · Deps: SEC-M01-05, -07, -11 · needs: none
- Files touched: `modules/01-java-oop-fundamentals.md` (region `EX-M01-03`), lab `m01/ex3/**` (main: starting code under `ex3/broken/` if the exercise starts from broken code, and the solution; test: one test per criterion), `SOURCES.md`
- Inputs: [M01](modules/M01.md) §6 row Ex01.3; STYLE-GUIDE §7.1, §8.1; [QUALITY-BAR](QUALITY-BAR.md) E; the sections it uses.
- Acceptance: QUALITY-BAR E1 anatomy; every M01 §6 criterion has a test `@DisplayName("Ex01.3 · …")` and every such test maps to a criterion (E2); the solution follows STYLE-GUIDE §7.1 (E4); ~330 words of prose; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261107-0912-claudecode (claude-opus-5-5 main session and prose; java-orchestrator, java-tester, java-implementer, java-reviewer on sonnet)

### CLOSE-M01 · M
- Status: `done` · Deps: every SEC, QB and EX task of M01 · needs: none
- Files touched: `modules/01-java-oop-fundamentals.md` (the three `CLOSE-M01` regions: Summary, Check your understanding, Connections), the ledgers in `_meta/sources/` (status `mapped` → `written` for the rows homed in 01, per M01 §3), `PROGRESS.md` (row 01), `_meta/TASKS.md`, `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: the whole module; [M01](modules/M01.md) §2, §3; STYLE-GUIDE §2.3, §9; [QUALITY-BAR](QUALITY-BAR.md) (all items).
- Acceptance: QUALITY-BAR F1–F4 and every other item checked with its command, one line per item in the LOG; `grep -c 'TASK:' modules/01-java-oop-fundamentals.md` prints 0; Standard checks row 8 (full build, `-DexcludedGroups=docker` if Docker is absent) plus rows 4, 5, 6; module-stats row 01 has no flag and prose ≤ 19,400 (SYLLABUS §9 decision 18); ledger rows of M01 §3 set to `written` (secondary mentions untouched).
- Done by: S20261107-0925-claudecode (claude-opus-5-5, main session; prose only, no Java change, so no java-workflow subagents)

### REVIEW-M01 · L
- Status: `done` · Deps: `CLOSE-M01` (and every SEC, QB, EX task of module 01) · needs: none · independent per RUN.md §4 (a different session from every `Done by` of module 01, or a fresh read-only subagent that receives only the module path, QUALITY-BAR, STYLE-GUIDE and the module plan; prefer a different model)
- Files touched: `_meta/reviews/REVIEW-M01.md`, `_meta/TASKS.md` (append `FIX-M01-nn`), `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: `modules/01-java-oop-fundamentals.md`, `_meta/modules/M01.md`, [QUALITY-BAR](QUALITY-BAR.md), STYLE-GUIDE, `labs/java-language/`
- Acceptance: every QUALITY-BAR item checked with evidence; findings listed with severity and turned into FIX tasks; `Done by` records which review route was used.
- Done by: S20261107-0959-claudecode (route: fresh read-only subagent, general-purpose on sonnet, given only the module, M01, QUALITY-BAR, STYLE-GUIDE and the lab; review in `_meta/reviews/REVIEW-M01.md`, verdict CHANGES_REQUIRED, 5 MAJOR, 7 MINOR, 11 NIT)

### FIX-M01-01 · S · Question-bank follow-ups and PS order (findings 1, 4)
- Status: `done` · Deps: REVIEW-M01 · needs: none
- Files touched: `modules/01-java-oop-fundamentals.md` (Q01.06, Q01.23, Q01.24, Q01.25, Q01.28), `SOURCES.md` (new URLs), `_meta/{TASKS,STATE,LOG}.md`
- Inputs: [REVIEW-M01](reviews/REVIEW-M01.md) findings 1, 4; STYLE-GUIDE; QUALITY-BAR.
- Acceptance: Q01.23 and Q01.24 have ≥ 2 answered follow-ups, each tagged; Q01.06 and Q01.28 read symptoms → hypotheses → evidence → fix → prevention and monitoring; Q01.25 and Q01.28 add monitoring and evidence for the other hypotheses (D1, D9 pass); No prose limit (SYLLABUS §9 decision 19), but no filler. Standard checks rows 5, 6.
- Done by: S20261107-0959-claudecode (claude-opus-5-5, main session)

### FIX-M01-02 · S · Diagrams (findings 2, 6, 12)
- Status: `done` · Deps: REVIEW-M01 · needs: none
- Files touched: `modules/01-java-oop-fundamentals.md` (§2, §7, §10, §11, §12, §13 diagrams), `SOURCES.md` (new URL), `_meta/{TASKS,STATE,LOG}.md`
- Inputs: [REVIEW-M01](reviews/REVIEW-M01.md) findings 2, 6, 12; JLS 5.1.2; `AbstractSet` Javadoc (Java 25); STYLE-GUIDE; QUALITY-BAR.
- Acceptance: §10 and §11 diagrams have a "What to notice" sentence; §2 `long → float` is dotted and the sentence matches JLS 5.1.2; §7 diagram has `AbstractSet` in the chain plus a tagged sentence on why extending it is safe (B3 passes); No prose limit (SYLLABUS §9 decision 19), but no filler. Standard checks rows 5, 6.
- Done by: S20261107-0959-claudecode (claude-opus-5-5, main session)

### FIX-M01-03 · S · Lab tags and markers (findings 3, 8; NITs 14, 15, 18)
- Status: `done` · Deps: REVIEW-M01 · needs: none
- Files touched: `modules/01-java-oop-fundamentals.md` (L275, 293, 1872, 1873, 1946, 2142, 1505, 289, 291, 1197, exercise links), `SOURCES.md` (new URLs), `_meta/reviews/REVIEW-M01.md` (main-session note), `_meta/{TASKS,STATE,LOG}.md`
- Inputs: [REVIEW-M01](reviews/REVIEW-M01.md) findings 3, 8, NITs 14, 15, 18; `Integer` Javadoc (Java 25); STYLE-GUIDE; QUALITY-BAR.
- Acceptance: each of the six sentences names its existing test with a `[Lab: …]` link; L1505 carries the §4.2 deprecated-for-removal marker (since 16) with a Doc tag; JLS section numbers corrected; exercise links use `#ex01-n`; L1197 fragment folded (C3, C4 pass). Amended in the task: the marker follows the JDK 25 source, `[Deprecated since Java 9 — use valueOf]` (no `forRemoval`), not the review's "since 16"; No prose limit (SYLLABUS §9 decision 19), but no filler. Standard checks rows 5, 6.
- Done by: S20261107-0959-claudecode (claude-opus-5-5, main session)

### FIX-M01-04 · M · Production-scenario callouts and §8/§10 gaps (findings 5, 10, 11)
- Status: `done` · Deps: REVIEW-M01 · needs: none
- Files touched: `modules/01-java-oop-fundamentals.md` (§8, §10, §13), lab files only if a new Excerpt needs a test (`labs/java-language/src/{main,test}/java/dev/interview/javalanguage/m01/`), `_meta/{TASKS,STATE,LOG}.md`
- Inputs: [REVIEW-M01](reviews/REVIEW-M01.md) findings 5, 10, 11; JLS 13.4.9, JVMS 5.4.6, JDK 11 release notes; STYLE-GUIDE; QUALITY-BAR.
- Carried from FIX-M01-07: change "initialised" to "initialized" in the `Tax.java` comment and its §10 Complete snippet (NIT 13), keeping them byte-equal.
- Acceptance: §10 and §13 callouts give evidence, fix and prevention; §10 Code has an approach with steps and shows inlining (Excerpt of `ConstantInliningTest` or `javap -c` output, tagged); §8 has a Failure modes subsection and a Version notes callout for the Java 11 change (B10 passes); if Java changed, the java-workflow skill was followed and Standard checks rows 3, 4 pass; No prose limit (SYLLABUS §9 decision 19), but no filler. Standard checks rows 5, 6.
- Done by: S20261107-1313-claudecode (claude-opus-5-5, main session; java-workflow for the `Tax.java` comment: java-orchestrator plan, java-implementer, java-reviewer PASS)

### FIX-M01-05 · S · Launch-protocol claim (finding 7, disputed)
- Status: `done` · Deps: REVIEW-M01 · needs: none
- Files touched: `modules/01-java-oop-fundamentals.md` (L59, unchanged), `_meta/reviews/REVIEW-M01.md` (main-session note), `_meta/{TASKS,STATE,LOG}.md`
- Inputs: [REVIEW-M01](reviews/REVIEW-M01.md) finding 7 and its main-session note; JEP 512 text, JLS 12.1.4 (Java 25); STYLE-GUIDE; QUALITY-BAR.
- Acceptance: JEP 512's selection order is quoted in the LOG; L59 matches it (unchanged if it already does); any changed claim tagged; if a test is added, the java-workflow skill was followed and rows 3, 4 pass; No prose limit (SYLLABUS §9 decision 19), but no filler. Standard checks rows 5, 6.
- Done by: S20261107-0959-claudecode (claude-opus-5-5, main session; finding rejected, no module edit)

### FIX-M01-06 · M · Misconceptions: why the myth exists (finding 9)
- Status: `done` · Deps: REVIEW-M01 · needs: none
- Files touched: `modules/01-java-oop-fundamentals.md` (traps at L148, 251, 448, 576, 578, 670–673, 814–815, 922–924, 1170–1172), `_meta/{TASKS,STATE,LOG}.md`
- Inputs: [REVIEW-M01](reviews/REVIEW-M01.md) finding 9; STYLE-GUIDE; QUALITY-BAR.
- Acceptance: each listed trap gives, in one clause, why the myth exists (B7 passes); No prose limit (SYLLABUS §9 decision 19), but no filler. Standard checks rows 5, 6.
- Done by: S20261107-1024-claudecode (claude-opus-5-5, main session; started in Small mode on Jorge's instruction to continue)

### FIX-M01-07 · S · Polish NITs (13, 16, 17, 19–23), optional
- Status: `done` · Deps: REVIEW-M01 · needs: none
- Files touched: `modules/01-java-oop-fundamentals.md`, `labs/java-language/src/main/java/dev/interview/javalanguage/m01/` (the `Tax` comment, NIT 13), `_meta/{TASKS,STATE,LOG}.md`
- Inputs: [REVIEW-M01](reviews/REVIEW-M01.md) NITs 13, 16, 17, 19–23; JDK 18 release notes (bug id); STYLE-GUIDE; QUALITY-BAR.
- Acceptance: each NIT fixed or recorded as declined in the LOG; spelling unified with links updated; JDK bug id confirmed against the release note; if Java changed, rows 3, 4 pass; No prose limit (SYLLABUS §9 decision 19), but no filler. Standard checks rows 5, 6.
- Done by: S20261107-1024-claudecode (claude-opus-5-5, main session). NIT 13 lab part (`Tax.java` comment "initialised") deferred to FIX-M01-04, which rewrites §10 Code through java-workflow.

### PLAN-M02 · M
- Status: `done` · Deps: G1 (ticked), REVIEW-M01 fixes done · needs: none
- Files touched: `_meta/modules/M02.md`, `modules/02-java-equality-immutability-records.md` (skeleton with `<!-- TASK: <ID> -->` regions, STYLE-GUIDE §2.4), `labs/java-language/**` (package `dev.interview.javalanguage.m02`: one smoke test), `_meta/TASKS.md` (append SEC, QB, EX, CLOSE tasks), `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: RUN.md §9; SYLLABUS §1 row 02, §4 module 02 checklist (and the 04, 05, 07, 11, 23, 51 boundaries), §5, §9; STYLE-GUIDE; [QUALITY-BAR](QUALITY-BAR.md); ledger rows targeting 02 (`core-java-240.md`, `honeywell-optum-md.md`, `spring-pdf.md`, plus secondary mentions); `labs/java-language/`; the `### Q` headings of modules 01 and 17; [M01](modules/M01.md) as the shape reference.
- Acceptance: the RUN.md §9 outputs 1 to 4; breadth gate (every SYLLABUS 02 checkbox and every ledger row targeting 02 has a section, a question or a recorded reason); the skeleton has every heading and anchor; Standard checks rows 3 (no Docker needed), 4, 5, 6 pass for `java-language`; SEC, QB, EX, CLOSE tasks appended with inputs, files, `needs:` and acceptance.
- Done by: S20261107-1313-claudecode (claude-opus-5-5, main session; smoke test by java-workflow: java-orchestrator and java-tester (sonnet), java-reviewer PASS with 1 MINOR on a handoff note)

Appended by PLAN-M02 (S20261107-1313-claudecode). Plan: [M02](modules/M02.md). Shared rules for every task below: write only inside the task's own `<!-- TASK: <ID> -->` region(s) of `modules/02-java-equality-immutability-records.md`, in one edit at the end; lab paths are under `labs/java-language/src/{main,test}/java/dev/interview/javalanguage/m02/` (main and test mirror each other); `m01.support.OutputCapture` and `m01.support.InMemoryCompiler` are read-only; `SOURCES.md` under a "02 java-equality-immutability-records" heading for every new URL; `VERSIONS.md` only to add a Java feature-status row the task verified (JEP 395, 390, 401); `_meta/TASKS.md`, `_meta/STATE.md`, `_meta/LOG.md` for bookkeeping. No task needs Docker or vision. Java 25 final features only (no `--enable-preview`). Every task that writes Java follows the java-workflow skill.

### SEC-M02-01 · M · §1 Identity vs equality and the `equals` contract
- Status: `done` · Deps: none · needs: none
- Files touched: `modules/02-java-equality-immutability-records.md` (region `SEC-M02-01`), lab `m02/s01/**` (main and test), `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M02](modules/M02.md) §1 (lab design) and §4 entry §1; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §1 (M02 §3) and their Notes (source errors become traps).
- Acceptance: the §2.2 subsections in order (a skipped Failure modes only where M02 §4 skips it, with the reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present; about the word budget of M02 §4 (advisory, SYLLABUS §9 decision 19), no filler; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261107-2128-claudecode (claude-opus-5-5; prose by the main session; lab via java-workflow: orchestrator, tester, implementer on sonnet; java-reviewer PASS, 3 MINOR accepted)

### SEC-M02-02 · M · §2 `hashCode` and hash-based collections
- Status: `done` · Deps: SEC-M02-01 · needs: none
- Files touched: `modules/02-java-equality-immutability-records.md` (region `SEC-M02-02`), lab `m02/s02/**` (main and test), `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M02](modules/M02.md) §1 (lab design) and §4 entry §2; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §2 (M02 §3) and their Notes (source errors become traps).
- Acceptance: the §2.2 subsections in order (a skipped Failure modes only where M02 §4 skips it, with the reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present; about the word budget of M02 §4 (advisory, SYLLABUS §9 decision 19), no filler; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261107-2128-claudecode (claude-opus-5-5; prose by the main session; lab via java-workflow: orchestrator, tester, implementer on sonnet; java-reviewer PASS, 2 MINOR accepted)

### SEC-M02-03 · M · §3 Equality across a class hierarchy
- Status: `done` · Deps: SEC-M02-01 · needs: none
- Files touched: `modules/02-java-equality-immutability-records.md` (region `SEC-M02-03`), lab `m02/s03/**` (main and test), `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M02](modules/M02.md) §1 (lab design) and §4 entry §3; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §3 (M02 §3) and their Notes (source errors become traps).
- Acceptance: the §2.2 subsections in order (a skipped Failure modes only where M02 §4 skips it, with the reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present; about the word budget of M02 §4 (advisory, SYLLABUS §9 decision 19), no filler; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261107-2157-claudecode (claude-opus-5-5; java-workflow: orchestrator, tester, implementer, reviewer on sonnet)

### SEC-M02-04 · M · §4 Ordering: `Comparable` and `Comparator`
- Status: `done` · Deps: SEC-M02-01 · needs: none
- Files touched: `modules/02-java-equality-immutability-records.md` (region `SEC-M02-04`), lab `m02/s04/**` (main and test), `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M02](modules/M02.md) §1 (lab design) and §4 entry §4; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §4 (M02 §3) and their Notes (source errors become traps).
- Acceptance: the §2.2 subsections in order (a skipped Failure modes only where M02 §4 skips it, with the reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present; about the word budget of M02 §4 (advisory, SYLLABUS §9 decision 19), no filler; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261107-2203-claudecode (claude-opus-5-5; prose by the main session; lab via java-workflow: orchestrator, tester, implementer, reviewer on sonnet; java-reviewer PASS, 3 MINOR accepted)

### SEC-M02-05 · M · §5 Immutability
- Status: `done` · Deps: none · needs: none
- Files touched: `modules/02-java-equality-immutability-records.md` (region `SEC-M02-05`), lab `m02/s05/**` (main and test), `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M02](modules/M02.md) §1 (lab design) and §4 entry §5; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §5 (M02 §3) and their Notes (source errors become traps).
- Acceptance: the §2.2 subsections in order (a skipped Failure modes only where M02 §4 skips it, with the reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present; about the word budget of M02 §4 (advisory, SYLLABUS §9 decision 19), no filler; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261107-2304-claudecode (claude-opus-5-5; writing in the main session; java-workflow: orchestrator, tester, implementer, reviewer on sonnet; java-reviewer PASS, 2 MINOR accepted)

### SEC-M02-06 · L · §6 Records
- Status: `done` · Deps: SEC-M02-05 · needs: none
- Files touched: `modules/02-java-equality-immutability-records.md` (region `SEC-M02-06`), lab `m02/s06/**` (main and test), `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M02](modules/M02.md) §1 (lab design) and §4 entry §6; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §6 (M02 §3) and their Notes (source errors become traps).
- Acceptance: the §2.2 subsections in order (a skipped Failure modes only where M02 §4 skips it, with the reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present; about the word budget of M02 §4 (advisory, SYLLABUS §9 decision 19), no filler; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261108-1727-claudecode (claude-opus-5-5; prose by the main session; lab via java-workflow: orchestrator, tester, implementer, reviewer on sonnet; java-reviewer CHANGES_REQUIRED (1 MAJOR, 3 MINOR) fixed by the main session, then PASS)

### SEC-M02-07 · M · §7 Building immutable objects: builders, withers and Lombok
- Status: `done` · Deps: SEC-M02-05, SEC-M02-06 · needs: none
- Files touched: `modules/02-java-equality-immutability-records.md` (region `SEC-M02-07`), lab `m02/s07/**` (main and test), `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M02](modules/M02.md) §1 (lab design) and §4 entry §7; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §7 (M02 §3) and their Notes (source errors become traps).
- Acceptance: the §2.2 subsections in order (a skipped Failure modes only where M02 §4 skips it, with the reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present; about the word budget of M02 §4 (advisory, SYLLABUS §9 decision 19), no filler; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261108-1738-claudecode (claude-opus-5-5; java-workflow orchestrator/tester/implementer/reviewer on sonnet)

### SEC-M02-08 · M · §8 Value-based classes and identity
- Status: `done` · Deps: SEC-M02-01 · needs: none
- Files touched: `modules/02-java-equality-immutability-records.md` (region `SEC-M02-08`), lab `m02/s08/**` (main and test), `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M02](modules/M02.md) §1 (lab design) and §4 entry §8; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §8 (M02 §3) and their Notes (source errors become traps).
- Acceptance: the §2.2 subsections in order (a skipped Failure modes only where M02 §4 skips it, with the reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present; about the word budget of M02 §4 (advisory, SYLLABUS §9 decision 19), no filler; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261108-1849-claudecode (claude-opus-5-5; java-workflow: orchestrator, tester, implementer, reviewer on sonnet)

### QB-M02-01 · M · Q02.01–Q02.08
- Status: `done` · Deps: SEC-M02-01, -02 · needs: none
- Files touched: `modules/02-java-equality-immutability-records.md` (region `QB-M02-01`), lab `m02/outputs/**` (main `Q02_mm` classes and their tests), `SOURCES.md`
- Inputs: [M02](modules/M02.md) §5 rows Q02.01–Q02.08 and §3 (ledger rows of each question, with Notes); STYLE-GUIDE §5, §7.3–7.5; [QUALITY-BAR](QUALITY-BAR.md) C, D; the sections each question drills.
- Acceptance: each question has the anchor and heading of the skeleton unchanged, a `<!-- ledger: … -->` line listing its M02 §5 rows plus their duplicates (M02 §3), and all five answer parts (QUALITY-BAR D1); every `Output` answer asserted by a test whose `@DisplayName` starts with its ID (compile-time ones through `InMemoryCompiler`; hash-order and identity outcomes as permitted sets, STYLE-GUIDE §7.5); Production scenario answers follow D9; follow-ups answered; ~220 words per question on average (advisory); Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261115-0835-claudecode (claude-opus-5-5; java-workflow: orchestrator and reviewer on sonnet, tests and code written by the main session through the shell per the background write-guard note)

### FIX-M02-01 · S · §2 Production scenario names a legal hashCode as the cause
- Status: `done` · Deps: SEC-M02-02 · needs: none · Source: finding during QB-M02-01 (S20261115-0835-claudecode)
- Files touched: `modules/02-java-equality-immutability-records.md` (region `SEC-M02-02`, the `Production scenario` callout only)
- Inputs: the callout in §2 "Production scenario: a cache's hit rate collapses…"; Q02.08 hypotheses (region QB-M02-01); [Doc: Object.hashCode Javadoc, Java 25].
- Finding: the callout's evidence list says "a new field in `equals` but not in `hashCode`". That is legal (equal objects still hash alike; it only costs collisions). The breaking change is the reverse: `hashCode` reads a field that `equals` ignores (as §2 Best practices and Q02.08 say).
- Acceptance: the phrase is replaced by "a field read by `hashCode` but ignored by `equals`" (or equivalent), consistent with §2 Best practices and Q02.08; no other text changes; Standard checks rows 5, 6.
- Done by: S20261115-0835-claudecode (claude-opus-5-5; self-found during QB-M02-01, one-phrase fix; Q02.08 is the independent statement of the same hypotheses)

### QB-M02-02 · M · Q02.09–Q02.16
- Status: `done` · Deps: SEC-M02-03, -04, -05 · needs: none
- Files touched: `modules/02-java-equality-immutability-records.md` (region `QB-M02-02`), lab `m02/outputs/**` (main `Q02_mm` classes and their tests), `SOURCES.md`
- Inputs: [M02](modules/M02.md) §5 rows Q02.09–Q02.16 and §3 (ledger rows of each question, with Notes); STYLE-GUIDE §5, §7.3–7.5; [QUALITY-BAR](QUALITY-BAR.md) C, D; the sections each question drills.
- Acceptance: each question has the anchor and heading of the skeleton unchanged, a `<!-- ledger: … -->` line listing its M02 §5 rows plus their duplicates (M02 §3), and all five answer parts (QUALITY-BAR D1); every `Output` answer asserted by a test whose `@DisplayName` starts with its ID (compile-time ones through `InMemoryCompiler`; hash-order and identity outcomes as permitted sets, STYLE-GUIDE §7.5); Production scenario answers follow D9; follow-ups answered; ~220 words per question on average (advisory); Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261115-0846-claudecode (claude-fable-5-2; java-workflow: orchestrator and reviewer on sonnet, reviewer PASS round 1; tests and code written by the main session through the shell per the background write-guard note)

### QB-M02-03 · M · Q02.17–Q02.22
- Status: `done` · Deps: SEC-M02-05, -06, -07, -08 · needs: none
- Files touched: `modules/02-java-equality-immutability-records.md` (region `QB-M02-03`), lab `m02/outputs/**` (main `Q02_mm` classes and their tests), `SOURCES.md`
- Inputs: [M02](modules/M02.md) §5 rows Q02.17–Q02.22 and §3 (ledger rows of each question, with Notes); STYLE-GUIDE §5, §7.3–7.5; [QUALITY-BAR](QUALITY-BAR.md) C, D; the sections each question drills.
- Acceptance: each question has the anchor and heading of the skeleton unchanged, a `<!-- ledger: … -->` line listing its M02 §5 rows plus their duplicates (M02 §3), and all five answer parts (QUALITY-BAR D1); every `Output` answer asserted by a test whose `@DisplayName` starts with its ID (compile-time ones through `InMemoryCompiler`; hash-order and identity outcomes as permitted sets, STYLE-GUIDE §7.5); Production scenario answers follow D9; follow-ups answered; ~220 words per question on average (advisory); Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261115-0846-claudecode (claude-fable-5-2; java-workflow: orchestrator and reviewer on sonnet, reviewer PASS round 1; test and code written by the main session through the shell per the background write-guard note)

### EX-M02-01 · M · Ex02.1 · A `Money` value type that behaves the same in every collection
- Status: `done` · Deps: SEC-M02-02, SEC-M02-04, SEC-M02-06 · needs: none
- Files touched: `modules/02-java-equality-immutability-records.md` (region `EX-M02-01`), lab `m02/ex1/**` (main: starting code under `ex1/broken/` if the exercise starts from broken code, and the solution; test: one test per criterion), `SOURCES.md`
- Inputs: [M02](modules/M02.md) §6 row Ex02.1; STYLE-GUIDE §7.1, §8.1; [QUALITY-BAR](QUALITY-BAR.md) E; the sections it uses.
- Acceptance: QUALITY-BAR E1 anatomy; every M02 §6 criterion has a test `@DisplayName("Ex02.1 · …")` and every such test maps to a criterion (E2); the solution follows STYLE-GUIDE §7.1 (E4); ~330 words of prose; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261115-0846-claudecode (claude-fable-5-2; java-workflow: orchestrator and reviewer on sonnet, reviewer PASS round 1; tests and code written by the main session through the shell per the background write-guard note)

### EX-M02-02 · M · Ex02.2 · An immutable `Order` with a builder and withers
- Status: `done` · Deps: SEC-M02-05, SEC-M02-07 · needs: none
- Files touched: `modules/02-java-equality-immutability-records.md` (region `EX-M02-02`), lab `m02/ex2/**` (main: starting code under `ex2/broken/` if the exercise starts from broken code, and the solution; test: one test per criterion), `SOURCES.md`
- Inputs: [M02](modules/M02.md) §6 row Ex02.2; STYLE-GUIDE §7.1, §8.1; [QUALITY-BAR](QUALITY-BAR.md) E; the sections it uses.
- Acceptance: QUALITY-BAR E1 anatomy; every M02 §6 criterion has a test `@DisplayName("Ex02.2 · …")` and every such test maps to a criterion (E2); the solution follows STYLE-GUIDE §7.1 (E4); ~330 words of prose; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261115-1722-claudecode (claude-fable-5-2; java-workflow: orchestrator and reviewer on sonnet, reviewer PASS round 1; test and code written by the main session through the shell per the background write-guard note)

### EX-M02-03 · M · Ex02.3 · Repair a broken equality hierarchy and its sort
- Status: `done` · Deps: SEC-M02-03, SEC-M02-04 · needs: none
- Files touched: `modules/02-java-equality-immutability-records.md` (region `EX-M02-03`), lab `m02/ex3/**` (main: starting code under `ex3/broken/` if the exercise starts from broken code, and the solution; test: one test per criterion), `SOURCES.md`
- Inputs: [M02](modules/M02.md) §6 row Ex02.3; STYLE-GUIDE §7.1, §8.1; [QUALITY-BAR](QUALITY-BAR.md) E; the sections it uses.
- Acceptance: QUALITY-BAR E1 anatomy; every M02 §6 criterion has a test `@DisplayName("Ex02.3 · …")` and every such test maps to a criterion (E2); the solution follows STYLE-GUIDE §7.1 (E4); ~330 words of prose; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261115-1722-claudecode (claude-fable-5-2; java-workflow: orchestrator and reviewer on sonnet, reviewer PASS round 1; test and code written by the main session through the shell per the background write-guard note)

### CLOSE-M02 · M
- Status: `done` · Deps: every SEC, QB and EX task of M02 · needs: none
- Files touched: `modules/02-java-equality-immutability-records.md` (the three `CLOSE-M02` regions: Summary, Check your understanding, Connections), the ledgers in `_meta/sources/` (status `mapped` → `written` for the rows homed in 02, per M02 §3), `PROGRESS.md` (row 02), `_meta/TASKS.md`, `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: the whole module; [M02](modules/M02.md) §2, §3; STYLE-GUIDE §2.3, §9; [QUALITY-BAR](QUALITY-BAR.md) (all items).
- Acceptance: QUALITY-BAR F1–F4 and every other item checked with its command, one line per item in the LOG; `grep -c 'TASK:' modules/02-java-equality-immutability-records.md` prints 0; Standard checks row 8 (full build, `-DexcludedGroups=docker` if Docker is absent) plus rows 4, 5, 6; module-stats row 02 has no flag; ledger rows of M02 §3 with primary target 02 set to `written` (secondary mentions untouched).
- Done by: S20261115-1722-claudecode (claude-fable-5-2; main session, no subagents, one full build)

### FIX-M02-02 · S · Six test Excerpts in §2–§7 also carry a `<sub>Source:` line
- Status: `done` · Deps: CLOSE-M02 · needs: none · Source: finding during CLOSE-M02 (QUALITY-BAR C7, S20261115-1722-claudecode)
- Files touched: `modules/02-java-equality-immutability-records.md` (the six `<sub>Source:` lines only)
- Inputs: STYLE-GUIDE §7.3 (a Complete block carries `<sub>Source:`; an Excerpt carries the `// Excerpt of labs/…` first line); the six blocks, one per `### Code` of §2 to §7, excerpting `HashContractTest`, `HierarchyEqualityTest`, `OrderingTest`, `ImmutabilityTest`, `RecordsTest`, `BuildersAndWithersTest`.
- Finding: each of the six blocks starts with `// Excerpt of …` and is followed by a `<sub>Source: …</sub>` line, so it is marked as both kinds. The content is correct: every line was found in order in its file (script, CLOSE-M02).
- Acceptance: the six `<sub>Source:` lines under Excerpt blocks are removed (the test stays linked from the section's `[Lab: …]` tags; if a block's test is linked nowhere else, the link moves into the sentence that introduces the block); no other text changes; every `<sub>Source:` left in the module sits under a block equal to its file; Standard checks rows 5, 6.
- Done by: S20261115-1722-claudecode (claude-fable-5-2; self-found during CLOSE-M02, mechanical removal by script; REVIEW-M02 re-checks C7 independently)

### REVIEW-M02 · L
- Status: `done` · Deps: CLOSE-M02 · needs: none
- Files touched: `_meta/reviews/REVIEW-M02.md`, `_meta/TASKS.md` (FIX tasks), `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: RUN.md §4 (independent review); the module file; [M02](modules/M02.md); STYLE-GUIDE; [QUALITY-BAR](QUALITY-BAR.md).
- Acceptance: run in a session different from every `Done by` of M02's tasks, or by a fresh read-only subagent given only the module path, QUALITY-BAR, STYLE-GUIDE and M02; every finding has a severity, location and fix, and becomes a FIX task or a recorded rejection.
- Done by: S20261115-1847-claudecode (route: fresh read-only subagent, general-purpose on claude-opus-5-5, given only the module, M02, QUALITY-BAR, STYLE-GUIDE and the m02 lab, plus SOURCES.md for C8; writers ran on claude-fable-5-2; review in `_meta/reviews/REVIEW-M02.md`, verdict CHANGES_REQUIRED, 3 MAJOR, 7 MINOR, 5 NIT, 17 findings → FIX-M02-03..08)

### FIX-M02-03 · S · Java 25 record-constructor rule (JEP 513)
- Status: `done` · Deps: REVIEW-M02 · needs: none · Source: REVIEW-M02 findings 1
- Files touched: `modules/02-java-equality-immutability-records.md`, `SOURCES.md`, `_meta/TASKS.md`, `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: [REVIEW-M02](reviews/REVIEW-M02.md) (the findings named), the module file, STYLE-GUIDE; the lab test named when a Lab tag changes.
- Acceptance: JEP 513 text read first (if it does not allow a prologue before `this(…)` in a non-canonical record constructor, the finding is rejected in REVIEW-M02 and the text left unchanged); L842, L852, L864, L2101 corrected with a `[Final since Java 25, JEP 513]` marker and Doc tag; JEP 513 URL under SOURCES.md 02; Standard checks rows 5 and 6 pass (02 flags none).
- Done by: S20261116-0839-claudecode (claude-opus-5-5, main session)

### FIX-M02-04 · S · Lab tags that overclaim
- Status: `done` · Deps: REVIEW-M02 · needs: none · Source: REVIEW-M02 findings 2, 3
- Files touched: `modules/02-java-equality-immutability-records.md`, `_meta/TASKS.md`, `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: [REVIEW-M02](reviews/REVIEW-M02.md) (the findings named), the module file, STYLE-GUIDE; the lab test named when a Lab tag changes.
- Acceptance: each "in the lab" sentence at §6 L846, L850 and §8 L1407 claims only what its test asserts (prose narrowed; no test change, or, if a test is extended, the java-workflow skill is used and row 3 passes); Standard checks rows 5 and 6 pass (02 flags none).
- Done by: S20261116-0839-claudecode (claude-opus-5-5, main session)

### FIX-M02-05 · M · Production scenario callouts duplicate their questions
- Status: `done` · Deps: REVIEW-M02 · needs: none · Source: REVIEW-M02 findings 4
- Files touched: `modules/02-java-equality-immutability-records.md`, `_meta/TASKS.md`, `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: [REVIEW-M02](reviews/REVIEW-M02.md) (the findings named), the module file, STYLE-GUIDE; the lab test named when a Lab tag changes.
- Acceptance: the §2, §4 and §5 callouts each describe an incident different from Q02.08, Q02.14 and Q02.17, using only facts already taught and tagged in their section; no sentence of a callout repeats its question; B10 still ≥ 2; Standard checks rows 5 and 6 pass (02 flags none).
- Done by: S20261116-0839-claudecode (claude-opus-5-5, main session)

### FIX-M02-06 · S · Repeated passages (Lombok, Timestamp, HashMap internals, class histogram)
- Status: `done` · Deps: REVIEW-M02 · needs: none · Source: REVIEW-M02 findings 5, 6, 7
- Files touched: `modules/02-java-equality-immutability-records.md`, `_meta/TASKS.md`, `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: [REVIEW-M02](reviews/REVIEW-M02.md) (the findings named), the module file, STYLE-GUIDE; the lab test named when a Lab tag changes.
- Acceptance: Lombok version facts stated once (§7 How it actually works); `Timestamp` explained once (§3 L353); §2 tree-bin paragraph reduced to two sentences plus a link to 04; class histogram introduced once in §2 Failure modes; no anchor or tag lost (row 5); Standard checks rows 5 and 6 pass (02 flags none).
- Done by: S20261116-0839-claudecode (claude-opus-5-5, main session)

### FIX-M02-07 · S · Section mechanics: analogy, myth origins, §5 Version notes, markers, placement
- Status: `done` · Deps: REVIEW-M02 · needs: none · Source: REVIEW-M02 findings 8–15
- Files touched: `modules/02-java-equality-immutability-records.md`, `SOURCES.md`, `_meta/TASKS.md`, `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: [REVIEW-M02](reviews/REVIEW-M02.md) (the findings named), the module file, STYLE-GUIDE; the lab test named when a Lab tag changes.
- Acceptance: §4 Mental model has an analogy; the 12 Misconceptions have an origin clause; §5 has a Version notes callout (JEP 269 URL in SOURCES.md 02); §8 L1422 carries `[Deprecated since Java 9 — use valueOf]` (never "for removal"); flashcard 2 agrees with Q02.06; L663 has a "because"; L550–554 table tagged; the four callouts moved before Best practices; Standard checks rows 5 and 6 pass (02 flags none).
- Done by: S20261116-0839-claudecode (claude-opus-5-5, main session)

### FIX-M02-08 · S · TREEIFY off-by-one and two garbled sentences
- Status: `done` · Deps: REVIEW-M02 · needs: none · Source: REVIEW-M02 findings 16, 17
- Files touched: `modules/02-java-equality-immutability-records.md`, `_meta/TASKS.md`, `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: [REVIEW-M02](reviews/REVIEW-M02.md) (the findings named), the module file, STYLE-GUIDE; the lab test named when a Lab tag changes.
- Acceptance: `HashMap.putVal` in JDK 25 `src.zip` read first (if it treeifies at the 8th node, reject finding 16 in REVIEW-M02); §2 tree-bin sentence corrected (after FIX-M02-06 if that ran first); Q02.08 L1704 and Q02.15 L1980 reworded; Standard checks rows 5 and 6 pass (02 flags none).
- Done by: S20261116-0839-claudecode (claude-opus-5-5, main session)

### PLAN-M03 · M
- Status: `done` · Deps: G1 (ticked), REVIEW-M02 fixes done · needs: none
- Files touched: `_meta/modules/M03.md`, `modules/03-java-generics.md` (skeleton with `<!-- TASK: <ID> -->` regions, STYLE-GUIDE §2.4), `labs/java-language/**` (package `dev.interview.javalanguage.m03`: one smoke test), `_meta/TASKS.md` (append SEC, QB, EX, CLOSE tasks), `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: RUN.md §9; SYLLABUS §1 row 03, §4 module 03 checklist (and its delegated boundaries), §5, §9; STYLE-GUIDE; [QUALITY-BAR](QUALITY-BAR.md); ledger rows targeting 03; `labs/java-language/`; the `### Q` headings of modules 01, 02 and 17; [M02](modules/M02.md) as the shape reference.
- Acceptance: the RUN.md §9 outputs 1 to 4; breadth gate (every SYLLABUS 03 checkbox and every ledger row targeting 03 has a section, a question or a recorded reason); the skeleton has every heading and anchor; Standard checks rows 3 (no Docker needed), 4, 5, 6 pass for `java-language`; SEC, QB, EX, CLOSE tasks appended with inputs, files, `needs:` and acceptance.
- Done by: S20261116-0839-claudecode (claude-opus-5-5, main session; smoke test by java-workflow: java-orchestrator planned, test written by the main session through the shell, java-reviewer PASS with 3 MINOR)

Appended by PLAN-M03 (S20261116-0839-claudecode). Plan: [M03](modules/M03.md). Shared rules for every task below: write only inside the task's own `<!-- TASK: <ID> -->` region(s) of `modules/03-java-generics.md`, in one edit at the end; lab paths are under `labs/java-language/src/{main,test}/java/dev/interview/javalanguage/m03/` (main and test mirror each other); `m01.support.OutputCapture` and `m01.support.InMemoryCompiler` are read-only; R2 tests assert diagnostic keys, never message text; `SOURCES.md` under a "03 java-generics" heading for every new URL; `VERSIONS.md` only to add a Java feature-status row the task verified; `_meta/TASKS.md`, `_meta/STATE.md`, `_meta/LOG.md` for bookkeeping. No task needs Docker or vision. Java 25 final features only (no `--enable-preview`). No dependency is added (spring-core 7.0.10 is already on the test classpath; Jackson is cited, not run). Every task that writes Java follows the java-workflow skill.

### SEC-M03-01 · M · §1 Why generics: compile-time safety and raw types
- Status: `done` · Deps: none · needs: none
- Files touched: `modules/03-java-generics.md` (region `SEC-M03-01`), lab `m03/s01/**` (main and test), `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M03](modules/M03.md) §1 (lab design) and §4 entry §1; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §1 (M03 §3).
- Acceptance: the §2.2 subsections in order (a skipped Failure modes only where M03 §4 skips it, with the reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present, placed just before Best practices, and each Production scenario callout describing an incident no question repeats; every Misconception with its origin; about the word budget of M03 §4 (advisory), no filler; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261116-1747-claudecode, claude-fable-5-2 (java-workflow: orchestrator and reviewer on sonnet, PASS in round 2)

### SEC-M03-02 · M · §2 Generic types, generic methods and type inference
- Status: `done` · Deps: none · needs: none
- Files touched: `modules/03-java-generics.md` (region `SEC-M03-02`), lab `m03/s02/**` (main and test), `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M03](modules/M03.md) §1 (lab design) and §4 entry §2; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §2 (M03 §3).
- Acceptance: the §2.2 subsections in order (a skipped Failure modes only where M03 §4 skips it, with the reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present, placed just before Best practices, and each Production scenario callout describing an incident no question repeats; every Misconception with its origin; about the word budget of M03 §4 (advisory), no filler; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261116-1747-claudecode, claude-fable-5-2 (java-workflow: orchestrator and reviewer on sonnet, PASS in round 1)

### SEC-M03-03 · M · §3 Bounded type parameters
- Status: `done` · Deps: none · needs: none
- Files touched: `modules/03-java-generics.md` (region `SEC-M03-03`), lab `m03/s03/**` (main and test), `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M03](modules/M03.md) §1 (lab design) and §4 entry §3; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §3 (M03 §3).
- Acceptance: the §2.2 subsections in order (a skipped Failure modes only where M03 §4 skips it, with the reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present, placed just before Best practices, and each Production scenario callout describing an incident no question repeats; every Misconception with its origin; about the word budget of M03 §4 (advisory), no filler; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261116-1747-claudecode, claude-fable-5-2 (java-workflow: orchestrator and reviewer on sonnet, PASS in round 1)

### SEC-M03-04 · M · §4 Wildcards, PECS and variance
- Status: `done` · Deps: none · needs: none
- Files touched: `modules/03-java-generics.md` (region `SEC-M03-04`), lab `m03/s04/**` (main and test), `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M03](modules/M03.md) §1 (lab design) and §4 entry §4; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §4 (M03 §3).
- Acceptance: the §2.2 subsections in order (a skipped Failure modes only where M03 §4 skips it, with the reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present, placed just before Best practices, and each Production scenario callout describing an incident no question repeats; every Misconception with its origin; about the word budget of M03 §4 (advisory), no filler; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261116-1747-claudecode, claude-fable-5-2 (java-workflow: orchestrator and reviewer on sonnet, PASS in round 2)

### SEC-M03-05 · M · §5 Type erasure and bridge methods
- Status: `done` · Deps: SEC-M03-01 · needs: none
- Files touched: `modules/03-java-generics.md` (region `SEC-M03-05`), lab `m03/s05/**` (main and test), `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M03](modules/M03.md) §1 (lab design) and §4 entry §5; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §5 (M03 §3).
- Acceptance: the §2.2 subsections in order (a skipped Failure modes only where M03 §4 skips it, with the reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present, placed just before Best practices, and each Production scenario callout describing an incident no question repeats; every Misconception with its origin; about the word budget of M03 §4 (advisory), no filler; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261117-0826-claudecode, claude-fable-5-2 (java-workflow: orchestrator and reviewer on sonnet, tests and code by the main session through the shell, PASS in round 1)

### SEC-M03-06 · M · §6 Reifiable types, generic arrays and heap pollution
- Status: `done` · Deps: SEC-M03-05 · needs: none
- Files touched: `modules/03-java-generics.md` (region `SEC-M03-06`), lab `m03/s06/**` (main and test), `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M03](modules/M03.md) §1 (lab design) and §4 entry §6; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §6 (M03 §3).
- Acceptance: the §2.2 subsections in order (a skipped Failure modes only where M03 §4 skips it, with the reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present, placed just before Best practices, and each Production scenario callout describing an incident no question repeats; every Misconception with its origin; about the word budget of M03 §4 (advisory), no filler; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261117-0826-claudecode, claude-fable-5-2 (java-workflow: orchestrator and reviewer on sonnet, tests and code by the main session through the shell, PASS in round 1)

### SEC-M03-07 · M · §7 Capturing types at run time: class tokens and super type tokens
- Status: `done` · Deps: SEC-M03-05 · needs: none
- Files touched: `modules/03-java-generics.md` (region `SEC-M03-07`), lab `m03/s07/**` (main and test), `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M03](modules/M03.md) §1 (lab design) and §4 entry §7; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §7 (M03 §3).
- Acceptance: the §2.2 subsections in order (a skipped Failure modes only where M03 §4 skips it, with the reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present, placed just before Best practices, and each Production scenario callout describing an incident no question repeats; every Misconception with its origin; about the word budget of M03 §4 (advisory), no filler; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261117-0826-claudecode, claude-fable-5-2 (java-workflow: orchestrator and reviewer on sonnet, tests and code by the main session through the shell, PASS in round 2)

### SEC-M03-08 · M · §8 Reading generic signatures in the JDK
- Status: `done` · Deps: SEC-M03-03, SEC-M03-04 · needs: none
- Files touched: `modules/03-java-generics.md` (region `SEC-M03-08`), lab `m03/s08/**` (main and test), `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M03](modules/M03.md) §1 (lab design) and §4 entry §8; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §8 (M03 §3).
- Acceptance: the §2.2 subsections in order (a skipped Failure modes only where M03 §4 skips it, with the reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present, placed just before Best practices, and each Production scenario callout describing an incident no question repeats; every Misconception with its origin; about the word budget of M03 §4 (advisory), no filler; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261120-0358-claudecode-cloud (claude-opus-5-5; written and tested in the main session, tests first, no java-workflow skill in this harness)

### QB-M03-01 · M · Q03.01–Q03.08
- Status: `done` · Deps: SEC-M03-01, -02, -03 · needs: none
- Files touched: `modules/03-java-generics.md` (region `QB-M03-01`), lab `m03/outputs/**` (main `Q03_mm` classes and their tests), `SOURCES.md`
- Inputs: [M03](modules/M03.md) §5 rows Q03.01–Q03.08 and §3; STYLE-GUIDE §5, §7.3–7.5; [QUALITY-BAR](QUALITY-BAR.md) C, D; the sections each question drills.
- Acceptance: each question keeps the skeleton's anchor and heading, has a `<!-- ledger: … -->` line where M03 §5 lists rows, and all five answer parts (QUALITY-BAR D1); every `Output` answer asserted by a test whose `@DisplayName` starts with its ID (compile-time ones through `InMemoryCompiler`, by diagnostic key); Production scenario answers follow D9 and do not repeat a section callout; follow-ups answered; ~220 words per question on average (advisory); Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261120-0358-claudecode-cloud (claude-opus-5-5; written and tested in the main session, tests first, no java-workflow skill in this harness)

### QB-M03-02 · M · Q03.09–Q03.16
- Status: `done` · Deps: SEC-M03-04, -05 · needs: none
- Files touched: `modules/03-java-generics.md` (region `QB-M03-02`), lab `m03/outputs/**` (main `Q03_mm` classes and their tests), `SOURCES.md`
- Inputs: [M03](modules/M03.md) §5 rows Q03.09–Q03.16 and §3; STYLE-GUIDE §5, §7.3–7.5; [QUALITY-BAR](QUALITY-BAR.md) C, D; the sections each question drills.
- Acceptance: each question keeps the skeleton's anchor and heading, has a `<!-- ledger: … -->` line where M03 §5 lists rows, and all five answer parts (QUALITY-BAR D1); every `Output` answer asserted by a test whose `@DisplayName` starts with its ID (compile-time ones through `InMemoryCompiler`, by diagnostic key); Production scenario answers follow D9 and do not repeat a section callout; follow-ups answered; ~220 words per question on average (advisory); Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261120-0358-claudecode-cloud (claude-opus-5-5; written and tested in the main session, tests first, no java-workflow skill in this harness)

### QB-M03-03 · M · Q03.17–Q03.23
- Status: `done` · Deps: SEC-M03-05, -06, -07, -08 · needs: none
- Files touched: `modules/03-java-generics.md` (region `QB-M03-03`), lab `m03/outputs/**` (main `Q03_mm` classes and their tests), `SOURCES.md`
- Inputs: [M03](modules/M03.md) §5 rows Q03.17–Q03.23 and §3; STYLE-GUIDE §5, §7.3–7.5; [QUALITY-BAR](QUALITY-BAR.md) C, D; the sections each question drills.
- Acceptance: each question keeps the skeleton's anchor and heading, has a `<!-- ledger: … -->` line where M03 §5 lists rows, and all five answer parts (QUALITY-BAR D1); every `Output` answer asserted by a test whose `@DisplayName` starts with its ID (compile-time ones through `InMemoryCompiler`, by diagnostic key); Production scenario answers follow D9 and do not repeat a section callout; follow-ups answered; ~220 words per question on average (advisory); Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261120-0358-claudecode-cloud (claude-opus-5-5; written and tested in the main session, tests first, no java-workflow skill in this harness)

### EX-M03-01 · M · Ex03.1 · A type-safe heterogeneous container
- Status: `done` · Deps: SEC-M03-02, SEC-M03-05, SEC-M03-07 · needs: none
- Files touched: `modules/03-java-generics.md` (region `EX-M03-01`), lab `m03/ex1/**` (main: starting code if any, and the solution; test: one test per criterion), `SOURCES.md`
- Inputs: [M03](modules/M03.md) §6 row Ex03.1; STYLE-GUIDE §7.1, §8.1; [QUALITY-BAR](QUALITY-BAR.md) E; the sections it uses.
- Acceptance: QUALITY-BAR E1 anatomy; every M03 §6 criterion has a test `@DisplayName("Ex03.1 · …")` and every such test maps to a criterion (E2); the solution follows STYLE-GUIDE §7.1 (E4); ~330 words of prose; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261120-0602-claudecode-cloud (claude-opus-5-5)

### EX-M03-02 · M · Ex03.2 · Generic utilities with the right bounds and wildcards
- Status: `done` · Deps: SEC-M03-03, SEC-M03-04 · needs: none
- Files touched: `modules/03-java-generics.md` (region `EX-M03-02`), lab `m03/ex2/**` (main: starting code if any, and the solution; test: one test per criterion), `SOURCES.md`
- Inputs: [M03](modules/M03.md) §6 row Ex03.2; STYLE-GUIDE §7.1, §8.1; [QUALITY-BAR](QUALITY-BAR.md) E; the sections it uses.
- Acceptance: QUALITY-BAR E1 anatomy; every M03 §6 criterion has a test `@DisplayName("Ex03.2 · …")` and every such test maps to a criterion (E2); the solution follows STYLE-GUIDE §7.1 (E4); ~330 words of prose; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261120-0602-claudecode-cloud (claude-opus-5-5)

### EX-M03-03 · M · Ex03.3 · A super type token from scratch
- Status: `done` · Deps: SEC-M03-05, SEC-M03-07 · needs: none
- Files touched: `modules/03-java-generics.md` (region `EX-M03-03`), lab `m03/ex3/**` (main: starting code if any, and the solution; test: one test per criterion), `SOURCES.md`
- Inputs: [M03](modules/M03.md) §6 row Ex03.3; STYLE-GUIDE §7.1, §8.1; [QUALITY-BAR](QUALITY-BAR.md) E; the sections it uses.
- Acceptance: QUALITY-BAR E1 anatomy; every M03 §6 criterion has a test `@DisplayName("Ex03.3 · …")` and every such test maps to a criterion (E2); the solution follows STYLE-GUIDE §7.1 (E4); ~330 words of prose; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261120-0602-claudecode-cloud (claude-opus-5-5)

### QB-M03-04 · M · Q03.24 (Trade-off, added by SYLLABUS §9 decision 20)
- Status: `done` · Deps: EX-M03-01, EX-M03-03 · needs: none
- Files touched: `modules/03-java-generics.md` (new question Q03.24 after Q03.23), `labs/java-language/src/main/java/dev/interview/javalanguage/m03/outputs/Q03_24.java` (new), `labs/java-language/src/test/java/dev/interview/javalanguage/m03/outputs/Q03OutputsTest.java`, `_meta/modules/M03.md` (§5 row and type-mix line), `SYLLABUS.md` (§9 decision 20)
- Inputs: [M03](modules/M03.md) §5; STYLE-GUIDE §5; QUALITY-BAR D; Exercises 03.1 and 03.3.
- Acceptance: five answer parts, two answered follow-ups and a trap; every behavioral claim asserted by a `Q03.24 · …` test; module-stats row 03 shows `Trade-off`; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261120-0602-claudecode-cloud (claude-opus-5-5)

### CLOSE-M03 · M
- Status: `done` · Deps: every SEC, QB and EX task of M03 · needs: none
- Files touched: `modules/03-java-generics.md` (the three `CLOSE-M03` regions: Summary, Check your understanding, Connections), `PROGRESS.md` (row 03), `_meta/TASKS.md`, `_meta/STATE.md`, `_meta/LOG.md` (no ledger row has 03 as primary target, M03 §3, so no ledger status changes)
- Inputs: the whole module; [M03](modules/M03.md) §2, §3; STYLE-GUIDE §2.3, §9; [QUALITY-BAR](QUALITY-BAR.md) (all items).
- Acceptance: QUALITY-BAR F1–F4 and every other item checked with its command, one line per item in the LOG; `grep -c 'TASK:' modules/03-java-generics.md` prints 0; Standard checks row 8 (full build, `-DexcludedGroups=docker` if Docker is absent) plus rows 4, 5, 6; module-stats row 03 has no flag.
- Done by: S20261120-0602-claudecode-cloud (claude-opus-5-5)

### REVIEW-M03 · L
- Status: `done` · Deps: CLOSE-M03 · needs: none
- Files touched: `_meta/reviews/REVIEW-M03.md`, `_meta/TASKS.md` (FIX tasks), `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: RUN.md §4 (independent review); the module file; [M03](modules/M03.md); STYLE-GUIDE; [QUALITY-BAR](QUALITY-BAR.md).
- Acceptance: run in a session different from every `Done by` of M03's tasks, or by a fresh read-only subagent given only the module path, QUALITY-BAR, STYLE-GUIDE and M03; every finding has a severity, location and fix, and becomes a FIX task or a recorded rejection. Re-check B13 (CLOSE-M03 accepted 0 `**Security:**` items on the plan's "Security: none specific") and G1 (prose 24,711 against the 18,000 advisory target).
- Done by: S20261120-1201-claudecode-cloud (fresh read-only general-purpose subagent on sonnet, a model that wrote none of M03; verdict transcribed by the main session into [REVIEW-M03](reviews/REVIEW-M03.md): CHANGES_REQUIRED, 0 BLOCKER · 3 MAJOR · 15 MINOR · 6 NIT → FIX-M03-01..06)

### FIX-M03-01 · S · Factual accuracy and wording
- Status: `done` · Deps: REVIEW-M03 · needs: none · Source: REVIEW-M03 Group A findings 1–7
- Files touched: `modules/03-java-generics.md`, `labs/java-language/src/test/java/dev/interview/javalanguage/m03/` (only the test classes named), `SOURCES.md`, `_meta/TASKS.md`, `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: [REVIEW-M03](reviews/REVIEW-M03.md) (the findings named; its main-session notes), the module file, STYLE-GUIDE; the lab test named when a Lab tag changes. Line numbers in the review predate every FIX: locate by quoted text.
- Acceptance: A1 confirmed (JLS §15.9.5 or a test that two evaluations at one site share `getClass()`) then L1146 and the Q03.22 follow-up reworded; A2 and A3 reworded; A4: JLS 25 §9.6.4.7/§8.4.1 read (or, if unreachable through the proxy, the claim rewritten on the `src.zip` basis the review gives); A5: test added and tagged, or the sentence replaced by a JEP 394 citation; A6 reworded; A7: group IDs and versions checked against `labs/pom.xml` and VERSIONS.md, text corrected only if they differ; a finding the source contradicts is rejected in REVIEW-M03 and the text left unchanged; row 3 `java-language` passes if a test changed (row 4 first); rows 5 and 6 pass (03 flags none).
- Done by: S20261120-1201-claudecode-cloud (claude-opus-5-5, main session)

### FIX-M03-02 · M · Basis tags, snippet kinds and lab claims
- Status: `done` · Deps: REVIEW-M03 · needs: none · Source: REVIEW-M03 Group B findings 1–5
- Files touched: `modules/03-java-generics.md`, `labs/java-language/src/test/java/dev/interview/javalanguage/m03/` (only the test classes named), `labs/java-language/src/main/java/dev/interview/javalanguage/m03/outputs/` (only if Q03.24 needs a lab class), `_meta/TASKS.md`, `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: [REVIEW-M03](reviews/REVIEW-M03.md) (the findings named; its main-session notes), the module file, STYLE-GUIDE; the lab test named when a Lab tag changes. Line numbers in the review predate every FIX: locate by quoted text.
- Acceptance: the three Excerpts are whole members or statement-only, and match their files in order; the Q03.24 typed-key claims have a named test (`Q03.24 · …`) and tag, or are marked design reasoning; the `@SafeVarargs` no-warning claim carries `[Src: JDK 25, java.lang.SafeVarargs]` or a compile test; Q03.20 and Q03.15 follow-up claims asserted or tagged; tests first, red logged; rows 3, 4, 5, 6 pass (03 flags none).
- Done by: S20261120-1201-claudecode-cloud (claude-opus-5-5, main session)

### FIX-M03-03 · M · Checklist misses: steps, analogies, version notes, security, terms
- Status: `done` · Deps: REVIEW-M03 · needs: none · Source: REVIEW-M03 Group C findings 1–5
- Files touched: `modules/03-java-generics.md`, `SOURCES.md`, `_meta/TASKS.md`, `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: [REVIEW-M03](reviews/REVIEW-M03.md) (the findings named; its main-session notes), the module file, STYLE-GUIDE; the lab test named when a Lab tag changes. Line numbers in the review predate every FIX: locate by quoted text.
- Acceptance: approach plus numbered steps before the Code of §5–§8; analogies in §5 and §7 Mental model; §6 Version notes callout placed per STYLE-GUIDE §2.2, §5 L872 marker, JEP 286 marker only at its first §2 mention; one §7 `**Security:**` item whose basis (OWASP or Jackson docs) is read and its URL added to SOURCES.md "## 03" — if neither is reachable, an UNVERIFIED item and a VERIFY task are added instead of an untagged claim; the three terms defined; rows 5 and 6 pass (03 flags none, B13 ≥ 1).
- Done by: S20261120-1201-claudecode-cloud (claude-opus-5-5, main session)

### FIX-M03-04 · M · Readability: questions re-teaching sections and facts repeated
- Status: `done` · Deps: REVIEW-M03 · needs: none · Source: REVIEW-M03 Group G findings 1, 2
- Files touched: `modules/03-java-generics.md`, `_meta/TASKS.md`, `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: [REVIEW-M03](reviews/REVIEW-M03.md) (the findings named; its main-session notes), the module file, STYLE-GUIDE; the lab test named when a Lab tag changes. Line numbers in the review predate every FIX: locate by quoted text.
- Acceptance: (rewritten 2026-11-20 for SYLLABUS §9 decision 21: no length target, word count is never the goal) each question pair named in G1 answers its question and links its section for the mechanism, cutting only what the reader would read twice; each fact listed in G2 is introduced once with its tag and referred to elsewhere, unless repeating it in a self-contained answer makes that answer easier to follow (keep it then, one clause, and log why); nothing is cut that a reader needs to follow the text; no anchor, tag type or Output answer lost (row 5; tag counts logged before and after); rows 5 and 6 pass (03 flags none).
- Done by: S20261120-1801-claudecode-cloud (claude-opus-5-5, main session)

### FIX-M03-05 · S · Readability: pre-narrated scenarios and small repeats
- Status: `done` · Deps: REVIEW-M03, FIX-M03-04 · needs: none · Source: REVIEW-M03 Group G findings 3, 4
- Files touched: `modules/03-java-generics.md`, `_meta/TASKS.md`, `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: [REVIEW-M03](reviews/REVIEW-M03.md) (the findings named; its main-session notes), the module file, STYLE-GUIDE; the lab test named when a Lab tag changes. Line numbers in the review predate every FIX: locate by quoted text.
- Acceptance: (rewritten 2026-11-20 for decision 21) the §4, §5, §6, §7 passages named in G3 keep one sentence plus a link where the full retelling would be read twice, and the callouts keep their unique diagnosis; the G4 repeats cut to one statement and a link where that reads better; no length goal; rows 5 and 6 pass (03 flags none). Runs after FIX-M03-04.
- Done by: S20261120-1801-claudecode-cloud (claude-opus-5-5, main session)

### FIX-M03-06 · S · Nits: section links, §6 opening, drill list, Applies-to
- Status: `done` · Deps: REVIEW-M03 · needs: none · Source: REVIEW-M03 Group N findings 1–4 (5 accepted as optional, no change)
- Files touched: `modules/03-java-generics.md`, `_meta/TASKS.md`, `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: [REVIEW-M03](reviews/REVIEW-M03.md) (the findings named; its main-session notes), the module file, STYLE-GUIDE; the lab test named when a Lab tag changes. Line numbers in the review predate every FIX: locate by quoted text.
- Acceptance: the plain "§n" references linked; §6 "The problem it solves" opens on the `snapshot()` crash; Q03.24 in §7's drill list; Applies-to names Spring Boot 4.1.2 for §7 only if VERSIONS.md lists it; rows 5 and 6 pass (03 flags none).
- Done by: S20261120-1201-claudecode-cloud (claude-opus-5-5, main session)

### PLAN-M04 · M
- Status: `done` · Deps: G1 (ticked), REVIEW-M03 fixes done · needs: none
- Files touched: `_meta/modules/M04.md`, `modules/04-java-collections-internals.md` (skeleton with `<!-- TASK: <ID> -->` regions, STYLE-GUIDE §2.4), `labs/java-language/**` (package `dev.interview.javalanguage.m04`: one smoke test), `_meta/TASKS.md` (append SEC, QB, EX, CLOSE tasks), `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: RUN.md §9; SYLLABUS §1 row 04, §4 module 04 checklist (and its delegated boundaries); STYLE-GUIDE; [QUALITY-BAR](QUALITY-BAR.md); ledger rows targeting 04; `labs/java-language/`; the `### Q` headings of modules 01, 02, 03 and 17; [M03](modules/M03.md) as the shape reference.
- Acceptance: the RUN.md §9 outputs 1 to 4; breadth gate (every SYLLABUS 04 checkbox and every ledger row targeting 04 has a section, a question or a recorded reason); the skeleton has every heading and anchor; Standard checks rows 3 (no Docker needed), 4, 5, 6 pass for `java-language`; SEC, QB, EX, CLOSE tasks appended with inputs, files, `needs:` and acceptance.
- Done by: S20261120-1801-claudecode-cloud (claude-opus-5-5, main session; smoke test written and run in the main session, no java-workflow skill in this harness)

Appended by PLAN-M04 (S20261120-1801-claudecode-cloud). Plan: [M04](modules/M04.md). Shared rules for every task below: write only inside the task's own `<!-- TASK: <ID> -->` region(s) of `modules/04-java-collections-internals.md`, in one edit at the end; lab paths are under `labs/java-language/src/{main,test}/java/dev/interview/javalanguage/m04/` (main and test mirror each other); `m01.support.OutputCapture` and `m01.support.InMemoryCompiler` are read-only; R2 tests assert diagnostic keys, never message text; R3 (private `java.util` state) only through a child JVM with `--add-opens` or not at all (M04 §1; never in the module's surefire `argLine`); no test asserts `HashMap` iteration order, a data-race outcome, GC timing or elapsed time; `SOURCES.md` under a "04 java-collections-internals" heading for every new URL; `VERSIONS.md` only to add a Java feature-status row the task verified; `_meta/TASKS.md`, `_meta/STATE.md`, `_meta/LOG.md` for bookkeeping. No task needs Docker or vision. Java 25 final features only. No dependency is added. No length target (SYLLABUS §9 decision 21). Every task that writes Java follows the java-workflow skill where the harness has it; otherwise tests first in the main session.

### SEC-M04-01 · M · §1 The Collections Framework: interfaces, contracts and sequenced collections
- Status: `done` · Deps: none · needs: none
- Files touched: `modules/04-java-collections-internals.md` (region `SEC-M04-01`), lab `m04/s01/**` (main and test), `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M04](modules/M04.md) §1 (lab design), §2 (boundaries) and §4 entry §1; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §1 (M04 §3); src.zip for JDK sources.
- Acceptance: the §2.2 subsections in order (a skipped Failure modes only where M04 §4 skips it, with the reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present, placed just before Best practices, and each Production scenario callout describing an incident no question repeats; every Misconception with its origin; boundaries of M04 §2 linked, not re-taught; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261120-1801-claudecode-cloud (claude-opus-5-5; main session, tests first, no java-workflow skill in this harness)

### SEC-M04-02 · M · §2 Lists: `ArrayList`, `LinkedList` and the legacy `Vector` and `Stack`
- Status: `done` · Deps: SEC-M04-01 · needs: none
- Files touched: `modules/04-java-collections-internals.md` (region `SEC-M04-02`), lab `m04/s02/**` (main and test), `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M04](modules/M04.md) §1 (lab design), §2 (boundaries) and §4 entry §2; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §2 (M04 §3); src.zip for JDK sources.
- Acceptance: the §2.2 subsections in order (a skipped Failure modes only where M04 §4 skips it, with the reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present, placed just before Best practices, and each Production scenario callout describing an incident no question repeats; every Misconception with its origin; boundaries of M04 §2 linked, not re-taught; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261120-1801-claudecode-cloud (claude-opus-5-5; main session, tests first, no java-workflow skill in this harness)

### SEC-M04-03 · M · §3 `HashMap` internals
- Status: `done` · Deps: SEC-M04-02 · needs: none
- Files touched: `modules/04-java-collections-internals.md` (region `SEC-M04-03`), lab `m04/s03/**` (main and test), `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M04](modules/M04.md) §1 (lab design), §2 (boundaries) and §4 entry §3; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §3 (M04 §3); src.zip for JDK sources.
- Acceptance: the §2.2 subsections in order (a skipped Failure modes only where M04 §4 skips it, with the reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present, placed just before Best practices, and each Production scenario callout describing an incident no question repeats; every Misconception with its origin; boundaries of M04 §2 linked, not re-taught; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261121-0002-claudecode-cloud (claude-opus-5-5; main session, tests first, no java-workflow skill in this harness)

### SEC-M04-04 · M · §4 Ordered and special-purpose maps
- Status: `done` · Deps: SEC-M04-03 · needs: none
- Files touched: `modules/04-java-collections-internals.md` (region `SEC-M04-04`), lab `m04/s04/**` (main and test), `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M04](modules/M04.md) §1 (lab design), §2 (boundaries) and §4 entry §4; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §4 (M04 §3); src.zip for JDK sources.
- Acceptance: the §2.2 subsections in order (a skipped Failure modes only where M04 §4 skips it, with the reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present, placed just before Best practices, and each Production scenario callout describing an incident no question repeats; every Misconception with its origin; boundaries of M04 §2 linked, not re-taught; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261121-0002-claudecode-cloud (claude-opus-5-5; main session, tests first, no java-workflow skill in this harness)

### SEC-M04-05 · M · §5 Sets: views of maps
- Status: `done` · Deps: SEC-M04-04 · needs: none
- Files touched: `modules/04-java-collections-internals.md` (region `SEC-M04-05`), lab `m04/s05/**` (main and test), `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M04](modules/M04.md) §1 (lab design), §2 (boundaries) and §4 entry §5; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §5 (M04 §3); src.zip for JDK sources.
- Acceptance: the §2.2 subsections in order (a skipped Failure modes only where M04 §4 skips it, with the reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present, placed just before Best practices, and each Production scenario callout describing an incident no question repeats; every Misconception with its origin; boundaries of M04 §2 linked, not re-taught; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261121-0002-claudecode-cloud (claude-opus-5-5; main session, tests first, no java-workflow skill in this harness)

### SEC-M04-06 · M · §6 Queues and deques: `ArrayDeque` and `PriorityQueue`
- Status: `done` · Deps: SEC-M04-05 · needs: none
- Files touched: `modules/04-java-collections-internals.md` (region `SEC-M04-06`), lab `m04/s06/**` (main and test), `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M04](modules/M04.md) §1 (lab design), §2 (boundaries) and §4 entry §6; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §6 (M04 §3); src.zip for JDK sources.
- Acceptance: the §2.2 subsections in order (a skipped Failure modes only where M04 §4 skips it, with the reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present, placed just before Best practices, and each Production scenario callout describing an incident no question repeats; every Misconception with its origin; boundaries of M04 §2 linked, not re-taught; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261121-0601-claudecode-cloud (claude-opus-5-5, written in the main session, tests first)

### SEC-M04-07 · M · §7 Iterators: fail-fast, weakly consistent and snapshot
- Status: `done` · Deps: SEC-M04-06 · needs: none
- Files touched: `modules/04-java-collections-internals.md` (region `SEC-M04-07`), lab `m04/s07/**` (main and test), `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M04](modules/M04.md) §1 (lab design), §2 (boundaries) and §4 entry §7; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §7 (M04 §3); src.zip for JDK sources.
- Acceptance: the §2.2 subsections in order (a skipped Failure modes only where M04 §4 skips it, with the reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present, placed just before Best practices, and each Production scenario callout describing an incident no question repeats; every Misconception with its origin; boundaries of M04 §2 linked, not re-taught; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261121-0601-claudecode-cloud (claude-opus-5-5, written in the main session, tests first)

### SEC-M04-08 · M · §8 Immutable, unmodifiable and fixed-size lists
- Status: `done` · Deps: SEC-M04-07 · needs: none
- Files touched: `modules/04-java-collections-internals.md` (region `SEC-M04-08`), lab `m04/s08/**` (main and test), `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M04](modules/M04.md) §1 (lab design), §2 (boundaries) and §4 entry §8; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §8 (M04 §3); src.zip for JDK sources.
- Acceptance: the §2.2 subsections in order (a skipped Failure modes only where M04 §4 skips it, with the reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present, placed just before Best practices, and each Production scenario callout describing an incident no question repeats; every Misconception with its origin; boundaries of M04 §2 linked, not re-taught; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261121-0901-claudecode-cloud (claude-opus-5-5, written in the main session, tests first)

### SEC-M04-09 · M · §9 Utilities, sorting and collection equality
- Status: `done` · Deps: SEC-M04-08 · needs: none
- Files touched: `modules/04-java-collections-internals.md` (region `SEC-M04-09`), lab `m04/s09/**` (main and test), `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M04](modules/M04.md) §1 (lab design), §2 (boundaries) and §4 entry §9; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §9 (M04 §3); src.zip for JDK sources.
- Acceptance: the §2.2 subsections in order (a skipped Failure modes only where M04 §4 skips it, with the reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present, placed just before Best practices, and each Production scenario callout describing an incident no question repeats; every Misconception with its origin; boundaries of M04 §2 linked, not re-taught; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261121-0901-claudecode-cloud (claude-opus-5-5, written in the main session, tests first)

### SEC-M04-10 · M · §10 Choosing a collection: complexity, memory and workload
- Status: `done` · Deps: SEC-M04-09 · needs: none
- Files touched: `modules/04-java-collections-internals.md` (region `SEC-M04-10`), lab `m04/s10/**` (main and test), `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M04](modules/M04.md) §1 (lab design), §2 (boundaries) and §4 entry §10; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §10 (M04 §3); src.zip for JDK sources.
- Acceptance: the §2.2 subsections in order (a skipped Failure modes only where M04 §4 skips it, with the reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present, placed just before Best practices, and each Production scenario callout describing an incident no question repeats; every Misconception with its origin; boundaries of M04 §2 linked, not re-taught; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261121-1201-claudecode-cloud (claude-opus-5-5)

### QB-M04-01 · M · Q04.01–Q04.08
- Status: `done` · Deps: SEC-M04-01, -02 · needs: none
- Files touched: `modules/04-java-collections-internals.md` (region `QB-M04-01`), lab `m04/outputs/**` (main `Q04_mm` classes and their tests), `SOURCES.md`
- Inputs: [M04](modules/M04.md) §5 rows Q04.01–Q04.08 and §3; STYLE-GUIDE §5, §7.3–7.5; [QUALITY-BAR](QUALITY-BAR.md) C, D; the sections each question drills.
- Acceptance: each question keeps the skeleton's anchor and heading, has a `<!-- ledger: … -->` line where M04 §5 lists rows (and fixes the source errors M04 §3 lists), and all five answer parts (QUALITY-BAR D1); every `Output` answer asserted by a test whose `@DisplayName` starts with its ID; Production scenario answers follow D9 and do not repeat a section callout; each answer answers its question and links its section for the mechanism (no re-teaching, REVIEW-M03 G1); follow-ups answered; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261121-1201-claudecode-cloud (claude-opus-5-5)

### QB-M04-02 · M · Q04.09–Q04.16
- Status: `done` · Deps: SEC-M04-03, -04 · needs: none
- Files touched: `modules/04-java-collections-internals.md` (region `QB-M04-02`), lab `m04/outputs/**` (main `Q04_mm` classes and their tests), `SOURCES.md`
- Inputs: [M04](modules/M04.md) §5 rows Q04.09–Q04.16 and §3; STYLE-GUIDE §5, §7.3–7.5; [QUALITY-BAR](QUALITY-BAR.md) C, D; the sections each question drills.
- Acceptance: each question keeps the skeleton's anchor and heading, has a `<!-- ledger: … -->` line where M04 §5 lists rows (and fixes the source errors M04 §3 lists), and all five answer parts (QUALITY-BAR D1); every `Output` answer asserted by a test whose `@DisplayName` starts with its ID; Production scenario answers follow D9 and do not repeat a section callout; each answer answers its question and links its section for the mechanism (no re-teaching, REVIEW-M03 G1); follow-ups answered; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261121-1501-claudecode-cloud (claude-opus-5-5)

### QB-M04-03 · M · Q04.17–Q04.24
- Status: `done` · Deps: SEC-M04-04, -05, -06, -07 · needs: none
- Files touched: `modules/04-java-collections-internals.md` (region `QB-M04-03`), lab `m04/outputs/**` (main `Q04_mm` classes and their tests), `SOURCES.md`
- Inputs: [M04](modules/M04.md) §5 rows Q04.17–Q04.24 and §3; STYLE-GUIDE §5, §7.3–7.5; [QUALITY-BAR](QUALITY-BAR.md) C, D; the sections each question drills.
- Acceptance: each question keeps the skeleton's anchor and heading, has a `<!-- ledger: … -->` line where M04 §5 lists rows (and fixes the source errors M04 §3 lists), and all five answer parts (QUALITY-BAR D1); every `Output` answer asserted by a test whose `@DisplayName` starts with its ID; Production scenario answers follow D9 and do not repeat a section callout; each answer answers its question and links its section for the mechanism (no re-teaching, REVIEW-M03 G1); follow-ups answered; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261121-1501-claudecode-cloud (claude-opus-5-5)

### QB-M04-04 · M · Q04.25–Q04.32
- Status: `done` · Deps: SEC-M04-07, -08, -09, -10 · needs: none
- Files touched: `modules/04-java-collections-internals.md` (region `QB-M04-04`), lab `m04/outputs/**` (main `Q04_mm` classes and their tests), `SOURCES.md`
- Inputs: [M04](modules/M04.md) §5 rows Q04.25–Q04.32 and §3; STYLE-GUIDE §5, §7.3–7.5; [QUALITY-BAR](QUALITY-BAR.md) C, D; the sections each question drills.
- Acceptance: each question keeps the skeleton's anchor and heading, has a `<!-- ledger: … -->` line where M04 §5 lists rows (and fixes the source errors M04 §3 lists), and all five answer parts (QUALITY-BAR D1); every `Output` answer asserted by a test whose `@DisplayName` starts with its ID; Production scenario answers follow D9 and do not repeat a section callout; each answer answers its question and links its section for the mechanism (no re-teaching, REVIEW-M03 G1); follow-ups answered; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261121-1801-claudecode-cloud (claude-opus-5-5)

### EX-M04-01 · M · Ex04.1 · A bounded LRU cache on `LinkedHashMap`
- Status: `done` · Deps: SEC-M04-01, SEC-M04-04 · needs: none
- Files touched: `modules/04-java-collections-internals.md` (region `EX-M04-01`), lab `m04/ex1/**` (main: starting code if any, and the solution; test: one test per criterion), `SOURCES.md`
- Inputs: [M04](modules/M04.md) §6 row Ex04.1; STYLE-GUIDE §7.1, §8.1; [QUALITY-BAR](QUALITY-BAR.md) E; the sections it uses.
- Acceptance: QUALITY-BAR E1 anatomy; every M04 §6 criterion has a test `@DisplayName("Ex04.1 · …")` and every such test maps to a criterion (E2); the solution follows STYLE-GUIDE §7.1 (E4); Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261121-1801-claudecode-cloud (claude-opus-5-5)

### EX-M04-02 · M · Ex04.2 · A minimal hash map: buckets, spreading and resize
- Status: `done` · Deps: SEC-M04-03 · needs: none
- Files touched: `modules/04-java-collections-internals.md` (region `EX-M04-02`), lab `m04/ex2/**` (main: starting code if any, and the solution; test: one test per criterion), `SOURCES.md`
- Inputs: [M04](modules/M04.md) §6 row Ex04.2; STYLE-GUIDE §7.1, §8.1; [QUALITY-BAR](QUALITY-BAR.md) E; the sections it uses.
- Acceptance: QUALITY-BAR E1 anatomy; every M04 §6 criterion has a test `@DisplayName("Ex04.2 · …")` and every such test maps to a criterion (E2); the solution follows STYLE-GUIDE §7.1 (E4); Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261121-2101-claudecode-cloud (claude-opus-5-5)

### EX-M04-03 · M · Ex04.3 · A fail-fast iterator for a growable array list
- Status: `done` · Deps: SEC-M04-02, SEC-M04-07 · needs: none
- Files touched: `modules/04-java-collections-internals.md` (region `EX-M04-03`), lab `m04/ex3/**` (main: starting code if any, and the solution; test: one test per criterion), `SOURCES.md`
- Inputs: [M04](modules/M04.md) §6 row Ex04.3; STYLE-GUIDE §7.1, §8.1; [QUALITY-BAR](QUALITY-BAR.md) E; the sections it uses.
- Acceptance: QUALITY-BAR E1 anatomy; every M04 §6 criterion has a test `@DisplayName("Ex04.3 · …")` and every such test maps to a criterion (E2); the solution follows STYLE-GUIDE §7.1 (E4); Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261121-2101-claudecode-cloud (claude-opus-5-5)

### CLOSE-M04 · M
- Status: `done` · Deps: every SEC, QB and EX task of M04 · needs: none
- Files touched: `modules/04-java-collections-internals.md` (the three `CLOSE-M04` regions: Summary, Check your understanding, Connections), `PROGRESS.md` (row 04), `_meta/sources/*.md` (status `written` for every primary row of M04 §3), `_meta/TASKS.md`, `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: the whole module; [M04](modules/M04.md) §2, §3; STYLE-GUIDE §2.3, §9; [QUALITY-BAR](QUALITY-BAR.md) (all items).
- Acceptance: QUALITY-BAR F1–F4 and every other item checked with its command, one line per item in the LOG; `grep -c 'TASK:' modules/04-java-collections-internals.md` prints 0; every ledger row of M04 §3 whose primary target is 04 is `written` with its question or section; Standard checks row 8 (full build, `-DexcludedGroups=docker` if Docker is absent) plus rows 4, 5, 6; module-stats row 04 has no flag.
- Done by: S20261122-0001-claudecode-cloud (claude-opus-5-5)

### REVIEW-M04 · L
- Status: `done` · Deps: CLOSE-M04 · needs: none
- Files touched: `_meta/reviews/REVIEW-M04.md`, `_meta/TASKS.md` (FIX tasks), `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: RUN.md §4 (independent review); the module file; [M04](modules/M04.md); STYLE-GUIDE; [QUALITY-BAR](QUALITY-BAR.md).
- Acceptance: run in a session different from every `Done by` of M04's tasks, or by a fresh read-only subagent given only the module path, QUALITY-BAR, STYLE-GUIDE and M04; every finding has a severity, location and fix, and becomes a FIX task or a recorded rejection.
- Done by: S20261122-0001-claudecode-cloud (a fresh read-only general-purpose subagent on sonnet, a model that wrote none of M04; the main session transcribed its verdict into [REVIEW-M04](reviews/REVIEW-M04.md): CHANGES_REQUIRED, 0 BLOCKER · 0 MAJOR · 8 MINOR · 7 NIT → FIX-M04-01..04)

### FIX-M04-01 · S · Factual accuracy and wording
- Status: `done` · Deps: REVIEW-M04 · needs: none · Source: REVIEW-M04 Group A, findings 1–7
- Files touched: `modules/04-java-collections-internals.md`, `_meta/reviews/REVIEW-M04.md` (Resolutions), `_meta/TASKS.md`, `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: [REVIEW-M04](reviews/REVIEW-M04.md) (the findings named, and its main-session notes), the module file, STYLE-GUIDE. Line numbers are not used: locate each finding by its quoted text.
- Acceptance:
  - Findings 1–7 are fixed, each checked against src.zip or the Javadoc first: the `SequencedCollection` and `Deque` supertypes, the `List.of(E)` overload choice, `Deque.getFirst` `@since`, and the `null` key rules.
  - A finding that the source contradicts is rejected in Resolutions, and its text is left unchanged.
  - Standard checks rows 5 and 6 pass, and row 6 shows no flag for 04.
- Done by: S20261122-0301-claudecode-cloud (claude-opus-5-5)

### FIX-M04-02 · S · Unconfirmed quotes and plan references
- Status: `done` · Deps: REVIEW-M04 · needs: none · Source: REVIEW-M04 findings 8, 9, 11
- Files touched: `modules/04-java-collections-internals.md`, `SOURCES.md` (only if a URL changes), `_meta/reviews/REVIEW-M04.md`, `_meta/TASKS.md`, `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: [REVIEW-M04](reviews/REVIEW-M04.md) (the findings named, and its main-session notes), the module file, STYLE-GUIDE. Line numbers are not used: locate each finding by its quoted text.
- Acceptance:
  - Finding 8: read JEP 180, the Collections Design FAQ, the compatibility page and the two `ArrayDeque` source paths with `curl` (openjdk.org, docs.oracle.com and raw.githubusercontent.com are reachable).
    - Every quote not found verbatim is shortened, paraphrased with its tag, or removed.
    - Every path that does not resolve is replaced by one that does.
    - Each result is logged.
  - Finding 9: the two references to the plan are reworded.
  - Finding 11: markers are added at first mention, or the Version-notes placement is accepted in Resolutions with the reason.
  - Rows 5 and 6 pass.
- Done by: S20261122-0301-claudecode-cloud (claude-opus-5-5)

### FIX-M04-03 · M · Citation density (readability)
- Status: `done` · Deps: FIX-M04-01, FIX-M04-02 · needs: none · Source: REVIEW-M04 finding 13
- Files touched: `modules/04-java-collections-internals.md`, `_meta/reviews/REVIEW-M04.md`, `_meta/TASKS.md`, `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: [REVIEW-M04](reviews/REVIEW-M04.md) (the findings named, and its main-session notes), the module file, STYLE-GUIDE. Line numbers are not used: locate each finding by its quoted text.
- Acceptance:
  - Within one paragraph, repeated tags that cite the same file are merged into one tag at the end of the paragraph, or after the last sentence that file covers (STYLE-GUIDE §4.1).
  - These tags stay where they are:
    - tags on different files;
    - `[Lab: …]` tags that name different tests;
    - tags inside callouts and tables.
  - No claim loses its basis.
  - Before/after tag counts are logged.
  - Rows 5 and 6 pass.
- Done by: S20261122-0301-claudecode-cloud (claude-opus-5-5)

### FIX-M04-04 · S · Nits: §4 security item, Excerpt indentation, `put` length, glosses
- Status: `done` · Deps: REVIEW-M04 · needs: none · Source: REVIEW-M04 findings 10, 12, 14, 15
- Files touched: `modules/04-java-collections-internals.md`, `labs/java-language/src/main/java/dev/interview/javalanguage/m04/ex2/SimpleHashMap.java` (finding 14), `_meta/reviews/REVIEW-M04.md`, `_meta/TASKS.md`, `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: [REVIEW-M04](reviews/REVIEW-M04.md) (the findings named, and its main-session notes), the module file, STYLE-GUIDE. Line numbers are not used: locate each finding by its quoted text.
- Acceptance:
  - Finding 10: the three dedented Excerpts (Q04_02, Q04_07) are made verbatim, so that `grep -F` finds every line.
  - Finding 12: one `**Security:**` item in §4.
  - Finding 14: `put` is at or under 20 lines, and the Ex04.2 Complete snippet stays byte-identical to the file.
  - Finding 15: one-line glosses for "amortized constant" and the Poisson table.
  - Rows 4 and 3 pass for `java-language` (SimpleHashMapTest 6/6); rows 5 and 6 pass.
- Done by: S20261122-0301-claudecode-cloud (claude-opus-5-5)

### PLAN-M05 · M
- Status: `done` · Deps: G1 (ticked), REVIEW-M04 fixes done · needs: none
- Files touched: `_meta/modules/M05.md`, `modules/05-java-lambdas-streams-optional.md` (skeleton with `<!-- TASK: <ID> -->` regions, STYLE-GUIDE §2.4), `labs/java-language/**` (package `dev.interview.javalanguage.m05`: one smoke test), `_meta/TASKS.md` (append SEC, QB, EX, CLOSE, REVIEW tasks), `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: RUN.md §9; SYLLABUS §1 row 05, §4 module 05 checklist (and its delegated boundaries); STYLE-GUIDE; [QUALITY-BAR](QUALITY-BAR.md); ledger rows targeting 05; `labs/java-language/`; the `### Q` headings of modules 01, 02, 03, 04 and 17; [M04](modules/M04.md) as the shape reference.
- Acceptance: the RUN.md §9 outputs 1 to 4; breadth gate (every SYLLABUS 05 checkbox and every ledger row targeting 05 has a section, a question or a recorded reason); the skeleton has every heading and anchor; Standard checks rows 3 (no Docker needed), 4, 5, 6 pass for `java-language`; SEC, QB, EX, CLOSE tasks appended with inputs, files, `needs:` and acceptance.
- Done by: S20261122-0601-claudecode-cloud (claude-opus-5-5, main session; smoke test written and run in the main session, no java-workflow skill in this harness)

Appended by PLAN-M05 (S20261122-0601-claudecode-cloud). Plan: [M05](modules/M05.md). Shared rules for every task below: write only inside the task's own `<!-- TASK: <ID> -->` region(s) of `modules/05-java-lambdas-streams-optional.md`, in one edit at the end; lab paths are under `labs/java-language/src/{main,test}/java/dev/interview/javalanguage/m05/` (main and test mirror each other); `m01.support.OutputCapture` and `m01.support.InMemoryCompiler` are read-only; R2 tests assert diagnostic keys, never message text; R3 (compiled form) per M05 §1, never asserting a synthetic method name beyond the `lambda$` prefix; parallel-stream tests assert invariants or permitted sets only (no thread-to-element mapping, split counts or elapsed time); `SOURCES.md` under a "05 java-lambdas-streams-optional" heading for every new URL; `VERSIONS.md` only to add a Java feature-status row the task verified (SEC-M05-07: stream gatherers); `_meta/TASKS.md`, `_meta/STATE.md`, `_meta/LOG.md` for bookkeeping. No task needs Docker or vision. Java 25 final features only. No dependency is added. No length target (SYLLABUS §9 decision 21). Every task that writes Java follows the java-workflow skill where the harness has it; otherwise tests first in the main session.

### SEC-M05-01 · M · §1 Functional interfaces and lambda expressions
- Status: `done` · Deps: none · needs: none
- Files touched: `modules/05-java-lambdas-streams-optional.md` (region `SEC-M05-01`), lab `m05/s01/**` (main and test), `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M05](modules/M05.md) §1 (lab design), §2 (boundaries) and §4 entry §1; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §1 (M05 §3); src.zip for JDK sources; openjdk.org (with `curl`) for JEPs.
- Acceptance: the §2.2 subsections in order (a skipped Failure modes only where M05 §4 skips it, with the reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present, placed just before Best practices, and each Production scenario callout describing an incident no question repeats; every Misconception with its origin; boundaries of M05 §2 linked, not re-taught; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261122-0601-claudecode-cloud (claude-opus-5-5; main session, tests first, no java-workflow skill in this harness)

### SEC-M05-02 · M · §2 How lambdas compile and capture: `invokedynamic` and effectively final
- Status: `done` · Deps: SEC-M05-01 · needs: none
- Files touched: `modules/05-java-lambdas-streams-optional.md` (region `SEC-M05-02`), lab `m05/s02/**` (main and test), `SOURCES.md`; `VERSIONS.md` only per the shared rules; `m05/support/**` if an R3 helper is built (M05 §7)
- Inputs: [M05](modules/M05.md) §1 (lab design), §2 (boundaries) and §4 entry §2; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §2 (M05 §3); src.zip for JDK sources; openjdk.org (with `curl`) for JEPs.
- Acceptance: the §2.2 subsections in order (a skipped Failure modes only where M05 §4 skips it, with the reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present, placed just before Best practices, and each Production scenario callout describing an incident no question repeats; every Misconception with its origin; boundaries of M05 §2 linked, not re-taught; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261122-0902-claudecode-cloud (claude-opus-5-5; main session, tests first, no java-workflow skill in this harness)

### SEC-M05-03 · M · §3 Method references
- Status: `done` · Deps: SEC-M05-02 · needs: none
- Files touched: `modules/05-java-lambdas-streams-optional.md` (region `SEC-M05-03`), lab `m05/s03/**` (main and test), `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M05](modules/M05.md) §1 (lab design), §2 (boundaries) and §4 entry §3; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §3 (M05 §3); src.zip for JDK sources; openjdk.org (with `curl`) for JEPs.
- Acceptance: the §2.2 subsections in order (a skipped Failure modes only where M05 §4 skips it, with the reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present, placed just before Best practices, and each Production scenario callout describing an incident no question repeats; every Misconception with its origin; boundaries of M05 §2 linked, not re-taught; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261122-0902-claudecode-cloud (claude-opus-5-5; main session, tests first, no java-workflow skill in this harness)

### SEC-M05-04 · M · §4 Stream pipelines: laziness, short-circuiting and encounter order
- Status: `done` · Deps: SEC-M05-03 · needs: none
- Files touched: `modules/05-java-lambdas-streams-optional.md` (region `SEC-M05-04`), lab `m05/s04/**` (main and test), `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M05](modules/M05.md) §1 (lab design), §2 (boundaries) and §4 entry §4; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §4 (M05 §3); src.zip for JDK sources; openjdk.org (with `curl`) for JEPs.
- Acceptance: the §2.2 subsections in order (a skipped Failure modes only where M05 §4 skips it, with the reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present, placed just before Best practices, and each Production scenario callout describing an incident no question repeats; every Misconception with its origin; boundaries of M05 §2 linked, not re-taught; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261122-1201-claudecode-cloud (claude-opus-5-5; main session, tests first, no java-workflow skill in this harness)

### SEC-M05-05 · M · §5 Collectors: `toMap`, `groupingBy`, `teeing` and writing your own
- Status: `done` · Deps: SEC-M05-04 · needs: none
- Files touched: `modules/05-java-lambdas-streams-optional.md` (region `SEC-M05-05`), lab `m05/s05/**` (main and test), `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M05](modules/M05.md) §1 (lab design), §2 (boundaries) and §4 entry §5; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §5 (M05 §3); src.zip for JDK sources; openjdk.org (with `curl`) for JEPs.
- Acceptance: the §2.2 subsections in order (a skipped Failure modes only where M05 §4 skips it, with the reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present, placed just before Best practices, and each Production scenario callout describing an incident no question repeats; every Misconception with its origin; boundaries of M05 §2 linked, not re-taught; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: S20261122-1201-claudecode-cloud (claude-opus-5-5; main session, tests first, no java-workflow skill in this harness)

### SEC-M05-06 · M · §6 Primitive streams, `flatMap`, `mapMulti` and `reduce` vs `collect`
- Status: `todo` · Deps: SEC-M05-05 · needs: none
- Files touched: `modules/05-java-lambdas-streams-optional.md` (region `SEC-M05-06`), lab `m05/s06/**` (main and test), `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M05](modules/M05.md) §1 (lab design), §2 (boundaries) and §4 entry §6; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §6 (M05 §3); src.zip for JDK sources; openjdk.org (with `curl`) for JEPs.
- Acceptance: the §2.2 subsections in order (a skipped Failure modes only where M05 §4 skips it, with the reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present, placed just before Best practices, and each Production scenario callout describing an incident no question repeats; every Misconception with its origin; boundaries of M05 §2 linked, not re-taught; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: —

### SEC-M05-07 · M · §7 Stream gatherers
- Status: `todo` · Deps: SEC-M05-06 · needs: none
- Files touched: `modules/05-java-lambdas-streams-optional.md` (region `SEC-M05-07`), lab `m05/s07/**` (main and test), `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M05](modules/M05.md) §1 (lab design), §2 (boundaries) and §4 entry §7; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §7 (M05 §3); src.zip for JDK sources; openjdk.org (with `curl`) for JEPs.
- Acceptance: the §2.2 subsections in order (a skipped Failure modes only where M05 §4 skips it, with the reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present, placed just before Best practices, and each Production scenario callout describing an incident no question repeats; every Misconception with its origin; boundaries of M05 §2 linked, not re-taught; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: —

### SEC-M05-08 · M · §8 Parallel streams and the common `ForkJoinPool`
- Status: `todo` · Deps: SEC-M05-07 · needs: none
- Files touched: `modules/05-java-lambdas-streams-optional.md` (region `SEC-M05-08`), lab `m05/s08/**` (main and test), `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M05](modules/M05.md) §1 (lab design), §2 (boundaries) and §4 entry §8; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §8 (M05 §3); src.zip for JDK sources; openjdk.org (with `curl`) for JEPs.
- Acceptance: the §2.2 subsections in order (a skipped Failure modes only where M05 §4 skips it, with the reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present, placed just before Best practices, and each Production scenario callout describing an incident no question repeats; every Misconception with its origin; boundaries of M05 §2 linked, not re-taught; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: —

### SEC-M05-09 · M · §9 Checked exceptions and resources in lambdas and streams
- Status: `todo` · Deps: SEC-M05-08 · needs: none
- Files touched: `modules/05-java-lambdas-streams-optional.md` (region `SEC-M05-09`), lab `m05/s09/**` (main and test), `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M05](modules/M05.md) §1 (lab design), §2 (boundaries) and §4 entry §9; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §9 (M05 §3); src.zip for JDK sources; openjdk.org (with `curl`) for JEPs.
- Acceptance: the §2.2 subsections in order (a skipped Failure modes only where M05 §4 skips it, with the reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present, placed just before Best practices, and each Production scenario callout describing an incident no question repeats; every Misconception with its origin; boundaries of M05 §2 linked, not re-taught; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: —

### SEC-M05-10 · M · §10 `Optional`: a return type for maybe-absent results
- Status: `todo` · Deps: SEC-M05-09 · needs: none
- Files touched: `modules/05-java-lambdas-streams-optional.md` (region `SEC-M05-10`), lab `m05/s10/**` (main and test), `SOURCES.md`; `VERSIONS.md` only per the shared rules
- Inputs: [M05](modules/M05.md) §1 (lab design), §2 (boundaries) and §4 entry §10; STYLE-GUIDE §2.2, §3, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md); the ledger rows homed in §10 (M05 §3); src.zip for JDK sources; openjdk.org (with `curl`) for JEPs.
- Acceptance: the §2.2 subsections in order (a skipped Failure modes only where M05 §4 skips it, with the reason in the LOG line); every key claim of the plan entry verified by the named test or source, with basis tags, or dropped; claims marked "verify in the task" settled or removed; required callouts present, placed just before Best practices, and each Production scenario callout describing an incident no question repeats; every Misconception with its origin; boundaries of M05 §2 linked, not re-taught; every named test exists and passes; links to the questions that drill the section; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: —

### QB-M05-01 · M · Q05.01–Q05.08
- Status: `todo` · Deps: SEC-M05-01, -02, -03 · needs: none
- Files touched: `modules/05-java-lambdas-streams-optional.md` (region `QB-M05-01`), lab `m05/outputs/**` (main `Q05_mm` classes and their tests), `SOURCES.md`
- Inputs: [M05](modules/M05.md) §5 rows Q05.01–Q05.08 and §3; STYLE-GUIDE §5, §7.3–7.5; [QUALITY-BAR](QUALITY-BAR.md) C, D; the sections each question drills.
- Acceptance: each question keeps the skeleton's anchor and heading, has a `<!-- ledger: … -->` line where M05 §5 lists rows (and fixes the source errors M05 §3 lists), and all five answer parts (QUALITY-BAR D1); every `Output` answer asserted by a test whose `@DisplayName` starts with its ID (nondeterministic outputs as a permitted set); Production scenario answers follow D9 and do not repeat a section callout; each answer answers its question and links its section for the mechanism (no re-teaching, REVIEW-M03 G1); follow-ups answered; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: —

### QB-M05-02 · M · Q05.09–Q05.16
- Status: `todo` · Deps: SEC-M05-04, -05 · needs: none
- Files touched: `modules/05-java-lambdas-streams-optional.md` (region `QB-M05-02`), lab `m05/outputs/**` (main `Q05_mm` classes and their tests), `SOURCES.md`
- Inputs: [M05](modules/M05.md) §5 rows Q05.09–Q05.16 and §3; STYLE-GUIDE §5, §7.3–7.5; [QUALITY-BAR](QUALITY-BAR.md) C, D; the sections each question drills.
- Acceptance: each question keeps the skeleton's anchor and heading, has a `<!-- ledger: … -->` line where M05 §5 lists rows (and fixes the source errors M05 §3 lists), and all five answer parts (QUALITY-BAR D1); every `Output` answer asserted by a test whose `@DisplayName` starts with its ID (nondeterministic outputs as a permitted set); Production scenario answers follow D9 and do not repeat a section callout; each answer answers its question and links its section for the mechanism (no re-teaching, REVIEW-M03 G1); follow-ups answered; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: —

### QB-M05-03 · M · Q05.17–Q05.24
- Status: `todo` · Deps: SEC-M05-06, -07, -08 · needs: none
- Files touched: `modules/05-java-lambdas-streams-optional.md` (region `QB-M05-03`), lab `m05/outputs/**` (main `Q05_mm` classes and their tests), `SOURCES.md`
- Inputs: [M05](modules/M05.md) §5 rows Q05.17–Q05.24 and §3; STYLE-GUIDE §5, §7.3–7.5; [QUALITY-BAR](QUALITY-BAR.md) C, D; the sections each question drills.
- Acceptance: each question keeps the skeleton's anchor and heading, has a `<!-- ledger: … -->` line where M05 §5 lists rows (and fixes the source errors M05 §3 lists), and all five answer parts (QUALITY-BAR D1); every `Output` answer asserted by a test whose `@DisplayName` starts with its ID (nondeterministic outputs as a permitted set); Production scenario answers follow D9 and do not repeat a section callout; each answer answers its question and links its section for the mechanism (no re-teaching, REVIEW-M03 G1); follow-ups answered; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: —

### QB-M05-04 · M · Q05.25–Q05.30
- Status: `todo` · Deps: SEC-M05-08, -09, -10 · needs: none
- Files touched: `modules/05-java-lambdas-streams-optional.md` (region `QB-M05-04`), lab `m05/outputs/**` (main `Q05_mm` classes and their tests), `SOURCES.md`
- Inputs: [M05](modules/M05.md) §5 rows Q05.25–Q05.30 and §3; STYLE-GUIDE §5, §7.3–7.5; [QUALITY-BAR](QUALITY-BAR.md) C, D; the sections each question drills.
- Acceptance: each question keeps the skeleton's anchor and heading, has a `<!-- ledger: … -->` line where M05 §5 lists rows (and fixes the source errors M05 §3 lists), and all five answer parts (QUALITY-BAR D1); every `Output` answer asserted by a test whose `@DisplayName` starts with its ID (nondeterministic outputs as a permitted set); Production scenario answers follow D9 and do not repeat a section callout; each answer answers its question and links its section for the mechanism (no re-teaching, REVIEW-M03 G1); follow-ups answered; Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: —

### EX-M05-01 · M · Ex05.1 · An order report with collectors
- Status: `todo` · Deps: SEC-M05-04, -05, -06 · needs: none
- Files touched: `modules/05-java-lambdas-streams-optional.md` (region `EX-M05-01`), lab `m05/ex1/**` (main: starting code if any, and the solution; test: one test per criterion), `SOURCES.md`
- Inputs: [M05](modules/M05.md) §6 row Ex05.1; STYLE-GUIDE §7.1, §8.1; [QUALITY-BAR](QUALITY-BAR.md) E; the sections it uses.
- Acceptance: QUALITY-BAR E1 anatomy; every M05 §6 criterion has a test `@DisplayName("Ex05.1 · …")` and every such test maps to a criterion (E2); the solution follows STYLE-GUIDE §7.1 (E4); Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: —

### EX-M05-02 · M · Ex05.2 · A custom `Collector` that is correct in parallel
- Status: `todo` · Deps: SEC-M05-05, -08 · needs: none
- Files touched: `modules/05-java-lambdas-streams-optional.md` (region `EX-M05-02`), lab `m05/ex2/**` (main: starting code if any, and the solution; test: one test per criterion), `SOURCES.md`
- Inputs: [M05](modules/M05.md) §6 row Ex05.2; STYLE-GUIDE §7.1, §8.1; [QUALITY-BAR](QUALITY-BAR.md) E; the sections it uses.
- Acceptance: QUALITY-BAR E1 anatomy; every M05 §6 criterion has a test `@DisplayName("Ex05.2 · …")` and every such test maps to a criterion (E2); the solution follows STYLE-GUIDE §7.1 (E4); Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: —

### EX-M05-03 · M · Ex05.3 · A gatherer: deduplicate consecutive elements and batch them
- Status: `todo` · Deps: SEC-M05-04, -07 · needs: none
- Files touched: `modules/05-java-lambdas-streams-optional.md` (region `EX-M05-03`), lab `m05/ex3/**` (main: starting code if any, and the solution; test: one test per criterion), `SOURCES.md`
- Inputs: [M05](modules/M05.md) §6 row Ex05.3; STYLE-GUIDE §7.1, §8.1; [QUALITY-BAR](QUALITY-BAR.md) E; the sections it uses.
- Acceptance: QUALITY-BAR E1 anatomy; every M05 §6 criterion has a test `@DisplayName("Ex05.3 · …")` and every such test maps to a criterion (E2); the solution follows STYLE-GUIDE §7.1 (E4); Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: —

### EX-M05-04 · M · Ex05.4 · A config loader: checked exceptions, results and `Optional`
- Status: `todo` · Deps: SEC-M05-09, -10 · needs: none
- Files touched: `modules/05-java-lambdas-streams-optional.md` (region `EX-M05-04`), lab `m05/ex4/**` (main: starting code if any, and the solution; test: one test per criterion), `SOURCES.md`
- Inputs: [M05](modules/M05.md) §6 row Ex05.4; STYLE-GUIDE §7.1, §8.1; [QUALITY-BAR](QUALITY-BAR.md) E; the sections it uses.
- Acceptance: QUALITY-BAR E1 anatomy; every M05 §6 criterion has a test `@DisplayName("Ex05.4 · …")` and every such test maps to a criterion (E2); the solution follows STYLE-GUIDE §7.1 (E4); Standard checks rows 3, 4, 5, 6 for `java-language`.
- Done by: —

### CLOSE-M05 · M
- Status: `todo` · Deps: every SEC, QB and EX task of M05 · needs: none
- Files touched: `modules/05-java-lambdas-streams-optional.md` (the three `CLOSE-M05` regions: Summary, Check your understanding, Connections), `PROGRESS.md` (row 05), `_meta/sources/*.md` (status `written` for every primary row of M05 §3), `_meta/TASKS.md`, `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: the whole module; [M05](modules/M05.md) §2, §3; STYLE-GUIDE §2.3, §9; [QUALITY-BAR](QUALITY-BAR.md) (all items).
- Acceptance: QUALITY-BAR F1–F4 and every other item checked with its command, one line per item in the LOG; `grep -c 'TASK:' modules/05-java-lambdas-streams-optional.md` prints 0; every ledger row of M05 §3 whose primary target is 05 is `written` with its question or section; Standard checks row 8 (full build, `-DexcludedGroups=docker` if Docker is absent) plus rows 4, 5, 6; module-stats row 05 has no flag.
- Done by: —

### REVIEW-M05 · L
- Status: `todo` · Deps: CLOSE-M05 · needs: none
- Files touched: `_meta/reviews/REVIEW-M05.md`, `_meta/TASKS.md` (FIX tasks), `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: RUN.md §4 (independent review); the module file; [M05](modules/M05.md); STYLE-GUIDE; [QUALITY-BAR](QUALITY-BAR.md).
- Acceptance: run in a session different from every `Done by` of M05's tasks, or by a fresh read-only subagent given only the module path, QUALITY-BAR, STYLE-GUIDE and M05; every finding has a severity, location and fix, and becomes a FIX task or a recorded rejection.
- Done by: —

## Phase D: source removal tasks (RUN.md §10.2, gate G2)

Depends on gate G2 (Jorge ticks it only while no other guide session is running) and on every ledger row of the source being `written` in a CLOSEd module, `duplicate-of`, or "no interview content". 0 MOVE tasks needed because 0 chunks were unreadable. Steps per RUN.md §10.2: (1) write entries in `SOURCE-MAP.md`, (2) search repository for references, (3) rewrite references to new module anchors, (4) remove source file (`rm` if tracked).

### DELETE-core-java-240 · S
- Status: `blocked` · Deps: all modules with `core-java-240` rows CLOSEd · needs: none · gate: G2
- Files touched: `_meta/sources/SOURCE-MAP.md`, `_meta/sources/core-java-240.md`, `../240-core-java-questions.pdf` (rm), `PROGRESS.md`, `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: `_meta/sources/core-java-240.md`, `_meta/sources/INVENTORY.md`
- Acceptance: all ledger rows written/duplicate/no-content; SOURCE-MAP entries written; references in repo rewritten and logged; `240-core-java-questions.pdf` removed with `rm`; check-links exits 0.

### DELETE-architect-answers-pdf · S
- Status: `blocked` · Deps: all modules with `architect-answers-pdf` rows CLOSEd · needs: none · gate: G2
- Files touched: `_meta/sources/SOURCE-MAP.md`, `_meta/sources/architect-answers-pdf.md`, `../Architect interview answers.pdf` (rm), `PROGRESS.md`, `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: `_meta/sources/architect-answers-pdf.md`, `_meta/sources/INVENTORY.md`
- Acceptance: all ledger rows written/duplicate/no-content; SOURCE-MAP entries written; references in repo rewritten and logged; `Architect interview answers.pdf` removed with `rm`; check-links exits 0.

### DELETE-core-java-pdf · S
- Status: `blocked` · Deps: all modules with `core-java-pdf` rows CLOSEd · needs: none · gate: G2
- Files touched: `_meta/sources/SOURCE-MAP.md`, `_meta/sources/core-java-pdf.md`, `../Core Java.pdf` (rm), `PROGRESS.md`, `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: `_meta/sources/core-java-pdf.md`, `_meta/sources/INVENTORY.md`
- Acceptance: all ledger rows written/duplicate/no-content; SOURCE-MAP entries written; references in repo rewritten and logged; `Core Java.pdf` removed with `rm`; check-links exits 0.

### DELETE-microservices-pdf · S
- Status: `blocked` · Deps: all modules with `microservices-pdf` rows CLOSEd · needs: none · gate: G2
- Files touched: `_meta/sources/SOURCE-MAP.md`, `_meta/sources/microservices-pdf.md`, `../Microservice Architecture.pdf` (rm), `PROGRESS.md`, `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: `_meta/sources/microservices-pdf.md`, `_meta/sources/INVENTORY.md`
- Acceptance: all ledger rows written/duplicate/no-content; SOURCE-MAP entries written; references in repo rewritten and logged; `Microservice Architecture.pdf` removed with `rm`; check-links exits 0.

### DELETE-spring-data-jpa-pdf · S
- Status: `blocked` · Deps: all modules with `spring-data-jpa-pdf` rows CLOSEd · needs: none · gate: G2
- Files touched: `_meta/sources/SOURCE-MAP.md`, `_meta/sources/spring-data-jpa-pdf.md`, `../SPRING DATA JPA Complete Interview Preparation Guide.pdf` (rm), `PROGRESS.md`, `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: `_meta/sources/spring-data-jpa-pdf.md`, `_meta/sources/INVENTORY.md`
- Acceptance: all ledger rows written/duplicate/no-content; SOURCE-MAP entries written; references in repo rewritten and logged; `SPRING DATA JPA Complete Interview Preparation Guide.pdf` removed with `rm`; check-links exits 0.

### DELETE-spring-pdf · S
- Status: `blocked` · Deps: all modules with `spring-pdf` rows CLOSEd · needs: none · gate: G2
- Files touched: `_meta/sources/SOURCE-MAP.md`, `_meta/sources/spring-pdf.md`, `../Spring.pdf` (rm), `PROGRESS.md`, `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: `_meta/sources/spring-pdf.md`, `_meta/sources/INVENTORY.md`
- Acceptance: all ledger rows written/duplicate/no-content; SOURCE-MAP entries written; references in repo rewritten and logged; `Spring.pdf` removed with `rm`; check-links exits 0.

### DELETE-system-design-pdf · S
- Status: `blocked` · Deps: all modules with `system-design-pdf` rows CLOSEd · needs: none · gate: G2
- Files touched: `_meta/sources/SOURCE-MAP.md`, `_meta/sources/system-design-pdf.md`, `../System Design Crash Course - Substack.pdf` (rm), `PROGRESS.md`, `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: `_meta/sources/system-design-pdf.md`, `_meta/sources/INVENTORY.md`
- Acceptance: all ledger rows written/duplicate/no-content; SOURCE-MAP entries written; references in repo rewritten and logged; `System Design Crash Course - Substack.pdf` removed with `rm`; check-links exits 0.

### DELETE-architect-md · S
- Status: `blocked` · Deps: all modules with `architect-md` rows CLOSEd · needs: none · gate: G2
- Files touched: `_meta/sources/SOURCE-MAP.md`, `_meta/sources/architect-md.md`, `../Architect-Level Production & Architect.md` (rm), `PROGRESS.md`, `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: `_meta/sources/architect-md.md`, `_meta/sources/INVENTORY.md`
- Acceptance: all ledger rows written/duplicate/no-content; SOURCE-MAP entries written; references in repo rewritten and logged; `Architect-Level Production & Architect.md` removed with `rm`; check-links exits 0.

### DELETE-data-storage-md · S
- Status: `blocked` · Deps: all modules with `data-storage-md` rows CLOSEd · needs: none · gate: G2
- Files touched: `_meta/sources/SOURCE-MAP.md`, `_meta/sources/data-storage-md.md`, `../Backend Interview Study Guide - Data storage, behavioral & concurrency.md` (rm), `PROGRESS.md`, `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: `_meta/sources/data-storage-md.md`, `_meta/sources/INVENTORY.md`
- Acceptance: all ledger rows written/duplicate/no-content; SOURCE-MAP entries written; references in repo rewritten and logged; `Backend Interview Study Guide - Data storage, behavioral & concurrency.md` removed with `rm`; check-links exits 0.

### DELETE-security-jpa-md · S
- Status: `blocked` · Deps: all modules with `security-jpa-md` rows CLOSEd · needs: none · gate: G2
- Files touched: `_meta/sources/SOURCE-MAP.md`, `_meta/sources/security-jpa-md.md`, `../Backend Study Guide - Security, JPA, Design Patterns & Spring.md` (rm), `PROGRESS.md`, `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: `_meta/sources/security-jpa-md.md`, `_meta/sources/INVENTORY.md`
- Acceptance: all ledger rows written/duplicate/no-content; SOURCE-MAP entries written; references in repo rewritten and logged; `Backend Study Guide - Security, JPA, Design Patterns & Spring.md` removed with `rm`; check-links exits 0.

### DELETE-honeywell-optum-md · S
- Status: `blocked` · Deps: all modules with `honeywell-optum-md` rows CLOSEd · needs: none · gate: G2
- Files touched: `_meta/sources/SOURCE-MAP.md`, `_meta/sources/honeywell-optum-md.md`, `../Java Backend Interview Guide - Honeywell, Optum & Production Scenarios.md` (rm), `PROGRESS.md`, `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: `_meta/sources/honeywell-optum-md.md`, `_meta/sources/INVENTORY.md`
- Acceptance: all ledger rows written/duplicate/no-content; SOURCE-MAP entries written; references in repo rewritten and logged; `Java Backend Interview Guide - Honeywell, Optum & Production Scenarios.md` removed with `rm`; check-links exits 0.

## Small-task pool (Small mode only, RUN.md §4.4)

Take an S task from here only when nothing in RUN.md §4 steps 1 to 3 fits. HOUSE-01 (Docker smoke tests) is above and is taken in queue order in any session whose Docker probe exits 0.

| ID | Size | Status | What |
|---|---|---|---|
| HOUSE-02 | S | done (S20261025-0757-claudecode, claude-opus-5-5) | Calibration upkeep (RUN.md §11): from the last two LOG session entries with the same RESETS, harness and model, compute the measured cost and add a raw-sample row and a measured row to [CALIBRATION](CALIBRATION.md). Files: `_meta/CALIBRATION.md`, `_meta/LOG.md`. Acceptance: row arithmetic shown; the borrowed row for that harness and model is marked superseded. |
| HOUSE-03 | S | done (S20261025-0744-claudecode, claude-opus-5-5) | Link re-check: run `node java-backend-guide/labs/tools/check-links.mjs java-backend-guide` (without `--planned`) and list every broken link whose target is not a planned file; fix those in guide files. Files: any guide Markdown outside `modules/`. Acceptance: remaining broken links are only planned files. |
| HOUSE-04 | S | done (S20261025-0744-claudecode, claude-opus-5-5) | Ledger hygiene (after at least 3 EXTRACTs are done): search all ledgers for duplicate dedup keys that lack `duplicate-of`, and for rows missing a column. Files: `_meta/sources/*.md`. Acceptance: no duplicate key without `duplicate-of`; every row has all columns. |
| HOUSE-05 | S | done (S20261025-0744-claudecode, claude-opus-5-5) | Refresh the PROGRESS.md sources row and the STATE counts from the ledgers (chunks extracted out of 47, sources consolidated out of 11). Files: `PROGRESS.md`, `_meta/STATE.md`. Acceptance: counts equal a recount from `_meta/sources/`. |
| HOUSE-06 | S | done (runs: Kafka, Hibernate, Micrometer and Resilience4j S20261029-0726-claudecode, claude-opus-5-5; JUnit, Mockito and Testcontainers; Flyway and Liquibase S20261029-0736-claudecode, claude-opus-5-5; final run gRPC, Spring gRPC, pgjdbc, Lettuce, MongoDB/Cassandra drivers and server, MapStruct, Gradle S20261029-0740-claudecode, claude-opus-5-5) | Replace UNVERIFIED support-policy cells in [VERSIONS](../VERSIONS.md) for one technology group per run (for example Hibernate and Spring Data; Kafka; Micrometer and Resilience4j; JUnit, Mockito, Testcontainers) with a value read from the project's own policy or release page, or keep UNVERIFIED and say why. Files: `VERSIONS.md`, `SOURCES.md`. Acceptance: each changed cell cites a URL and the date checked. |
| HOUSE-08 | S | done (S20261025-0744-claudecode, claude-opus-5-5) | Fix the Docker probe in Standard checks row 1: `perl -e 'alarm 20; exec @ARGV' docker info` exits 0 when `docker` is not on PATH (a failed `exec` falls through to exit 0). Use `perl -e 'alarm 20; exec @ARGV or exit 127' docker info`. Files: `_meta/TASKS.md`. Acceptance: with no `docker` on PATH the new probe exits non-zero. |
| HOUSE-07 | S | done (S20261029-0726-claudecode, claude-opus-5-5) | Keep STATE.md under 60 lines (RUN.md §2): fold resolved standing notes into LOG references. Files: `_meta/STATE.md`. Acceptance: `wc -l` under 60 and no open note lost. |
| HOUSE-09 | S | done (S20261120-0602-claudecode-cloud, claude-opus-5-5) | `LaunchProtocolTest` (M01 §1) asserted the exact output of a child JVM, and failed wherever `JAVA_TOOL_OPTIONS` or `_JAVA_OPTIONS` is set (the cloud container), because the JVM prints "Picked up …" lines. The test now removes `JAVA_TOOL_OPTIONS`, `_JAVA_OPTIONS` and `JDK_JAVA_OPTIONS` from the child's environment (SYLLABUS §9 decision 20). Files: `labs/java-language/src/test/java/dev/interview/javalanguage/m01/s01/LaunchProtocolTest.java`. Acceptance: row 3 full `java-language` passes with both variables set. |
