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
- Status: `todo` · Deps: none · needs: docker (T1 is informational: if the Docker probe exits 0 this session, run it) · UNVERIFIED row U06
- Claim: Docker installed version (never captured: Docker is not installed or running now).
- Inputs: [VERSIONS](../VERSIONS.md) (version table, "Open items"); When the Docker probe exits 0: `docker version --format '{{.Server.Version}}'` and `docker info`; record the version and the date in the VERSIONS.md "Installed on this machine" section and drop the open item.
- Acceptance: V1 to V3 (above); `node java-backend-guide/labs/tools/check-links.mjs --planned java-backend-guide` exits 0.
- Done by: none yet

## HOUSE task gated on the Docker toolchain

### HOUSE-01 · S · re-run the Docker smoke tests
- Status: `todo` · Deps: none · needs: docker (T1 is informational: if the Docker probe exits 0 this session, run it) · Files touched: `_meta/TASKS.md`, `_meta/STATE.md`, `_meta/LOG.md`, and `_meta/modules/M17.md` only to drop `needs: docker` notes once PLAN-M17 exists
- Inputs: gate T1 in [GATES](GATES.md); the two smoke tests `labs/persistence/.../PostgresVersionSmokeTest` and `labs/spring-transactions/.../DataSourceSmokeTest` (class-level `@Tag("docker")`, image `postgres:18.6`).
- Acceptance: row 1 of Standard checks exits 0; `JAVA_HOME=$(/usr/libexec/java_home -v 25) mvn -q -f java-backend-guide/labs/pom.xml -pl persistence,spring-transactions -am verify` exits 0 and the surefire reports show both smoke tests run (not skipped); the LOG records the result, and STATE "Standing notes" drops the "Docker absent" line. If a test fails, record the failure and add a FIX task instead of editing labs in this task.
- Done by: none yet

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
- Status: `todo` · Deps: none · needs: docker
- Files touched: `modules/17-spring-transactions.md` (region `SEC-M17-01`), lab `m17/support/PostgresTestBase.java` (test), `src/test/resources/m17/schema.sql`, `m17/s01/**`, `SOURCES.md`
- Inputs: [M17](modules/M17.md) §1 (lab design) and §4 entry §1; STYLE-GUIDE §2.2, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md).
- Acceptance: the seven §2.2 subsections in order (gaps accepted only with a reason in the LOG line); every key claim in the plan entry verified by the named test or source, with basis tags; required callouts present; within the word budget of M17 §4; every test of the plan entry exists and passes; links to the questions that drill the section; Standard checks rows 2 (with Docker) or 3, 4, 5, 6 for `spring-transactions`.
- Done by: none yet

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
- Status: `todo` · Deps: SEC-M17-01, SEC-M17-02 · needs: docker
- Files touched: `modules/17-spring-transactions.md` (region `SEC-M17-06`), lab `m17/s06/**`, `SOURCES.md`
- Inputs: [M17](modules/M17.md) §1 (lab design) and §4 entry §6; STYLE-GUIDE §2.2, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md).
- Acceptance: the seven §2.2 subsections in order (gaps accepted only with a reason in the LOG line); every key claim in the plan entry verified by the named test or source, with basis tags; required callouts present; within the word budget of M17 §4; every test of the plan entry exists and passes; links to the questions that drill the section; Standard checks rows 2 (with Docker) or 3, 4, 5, 6 for `spring-transactions`.
- Done by: none yet

### SEC-M17-07 · L · §7 Isolation levels and anomalies
- Status: `todo` · Deps: SEC-M17-01 · needs: docker
- Files touched: `modules/17-spring-transactions.md` (region `SEC-M17-07`), lab `m17/s07/**`, `SOURCES.md`
- Inputs: [M17](modules/M17.md) §1 (lab design) and §4 entry §7; STYLE-GUIDE §2.2, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md).
- Acceptance: the seven §2.2 subsections in order (gaps accepted only with a reason in the LOG line); every key claim in the plan entry verified by the named test or source, with basis tags; required callouts present; within the word budget of M17 §4; every test of the plan entry exists and passes; links to the questions that drill the section; Standard checks rows 2 (with Docker) or 3, 4, 5, 6 for `spring-transactions`.
- Done by: none yet

### SEC-M17-08 · M · §8 Read-only, timeouts and programmatic transactions
- Status: `todo` · Deps: SEC-M17-01, SEC-M17-02 · needs: docker
- Files touched: `modules/17-spring-transactions.md` (region `SEC-M17-08`), lab `m17/s08/**`, `SOURCES.md`
- Inputs: [M17](modules/M17.md) §1 (lab design) and §4 entry §8; STYLE-GUIDE §2.2, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md).
- Acceptance: the seven §2.2 subsections in order (gaps accepted only with a reason in the LOG line); every key claim in the plan entry verified by the named test or source, with basis tags; required callouts present; within the word budget of M17 §4; every test of the plan entry exists and passes; links to the questions that drill the section; Standard checks rows 2 (with Docker) or 3, 4, 5, 6 for `spring-transactions`.
- Done by: none yet

### SEC-M17-09 · M · §9 Transactions and the JPA persistence context
- Status: `todo` · Deps: SEC-M17-01 · needs: docker
- Files touched: `modules/17-spring-transactions.md` (region `SEC-M17-09`), lab `m17/s09/**`, `SOURCES.md`
- Inputs: [M17](modules/M17.md) §1 (lab design) and §4 entry §9; STYLE-GUIDE §2.2, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md).
- Acceptance: the seven §2.2 subsections in order (gaps accepted only with a reason in the LOG line); every key claim in the plan entry verified by the named test or source, with basis tags; required callouts present; within the word budget of M17 §4; every test of the plan entry exists and passes; links to the questions that drill the section; Standard checks rows 2 (with Docker) or 3, 4, 5, 6 for `spring-transactions`.
- Done by: none yet

### SEC-M17-10 · L · §10 Optimistic and pessimistic locking, retries and deadlocks
- Status: `todo` · Deps: SEC-M17-01 · needs: docker
- Files touched: `modules/17-spring-transactions.md` (region `SEC-M17-10`), lab `m17/s10/**`, `SOURCES.md`
- Inputs: [M17](modules/M17.md) §1 (lab design) and §4 entry §10; STYLE-GUIDE §2.2, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md).
- Acceptance: the seven §2.2 subsections in order (gaps accepted only with a reason in the LOG line); every key claim in the plan entry verified by the named test or source, with basis tags; required callouts present; within the word budget of M17 §4; every test of the plan entry exists and passes; links to the questions that drill the section; Standard checks rows 2 (with Docker) or 3, 4, 5, 6 for `spring-transactions`.
- Done by: none yet

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
- Status: `todo` · Deps: SEC-M17-01 · needs: docker
- Files touched: `modules/17-spring-transactions.md` (region `SEC-M17-13`), lab `m17/s13/**`, `SOURCES.md`
- Inputs: [M17](modules/M17.md) §1 (lab design) and §4 entry §13; STYLE-GUIDE §2.2, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md).
- Acceptance: the seven §2.2 subsections in order (gaps accepted only with a reason in the LOG line); every key claim in the plan entry verified by the named test or source, with basis tags; required callouts present; within the word budget of M17 §4; every test of the plan entry exists and passes; links to the questions that drill the section; Standard checks rows 2 (with Docker) or 3, 4, 5, 6 for `spring-transactions`.
- Done by: none yet

### SEC-M17-14 · M · §14 Testing transactional code
- Status: `todo` · Deps: SEC-M17-01, SEC-M17-11 · needs: docker
- Files touched: `modules/17-spring-transactions.md` (region `SEC-M17-14`), lab `m17/s14/**`, `SOURCES.md`
- Inputs: [M17](modules/M17.md) §1 (lab design) and §4 entry §14; STYLE-GUIDE §2.2, §4, §6, §7; [QUALITY-BAR](QUALITY-BAR.md) B, C; the last 40 lines of the preceding written section; [VERSIONS](../VERSIONS.md).
- Acceptance: the seven §2.2 subsections in order (gaps accepted only with a reason in the LOG line); every key claim in the plan entry verified by the named test or source, with basis tags; required callouts present; within the word budget of M17 §4; every test of the plan entry exists and passes; links to the questions that drill the section; Standard checks rows 2 (with Docker) or 3, 4, 5, 6 for `spring-transactions`.
- Done by: none yet

### QB-M17-01 · M · Q17.01 to Q17.08
- Status: `todo` · Deps: SEC-M17-01 to SEC-M17-05 · needs: docker (at least one Output question is asserted by a PostgreSQL test)
- Files touched: `modules/17-spring-transactions.md` (region `QB-M17-01`), lab `m17/outputs/**` (one class `Q17_mm` per Output or Bug hunt question and `Q17OutputsTest` methods for this chunk only), `SOURCES.md`
- Inputs: [M17](modules/M17.md) §5 rows Q17.01 to Q17.08 (types, ledger rows, verify route) and §3; STYLE-GUIDE §5, §7.3 to §7.5; QUALITY-BAR D; the sections each question drills.
- Acceptance: answer anatomy per STYLE-GUIDE §5.3 (QUALITY-BAR D1); each Output short answer asserted by a test whose `@DisplayName` starts with its ID (C2); Production scenario answers follow D9; `<!-- ledger: … -->` lines list the plan's rows; ≈250 prose words per question on average; Standard checks rows 2 (with Docker) or 3, 4, 5, 6 for `spring-transactions`.
- Done by: none yet

### QB-M17-02 · M · Q17.09 to Q17.16
- Status: `todo` · Deps: SEC-M17-03 to SEC-M17-06, SEC-M17-08 · needs: docker (at least one Output question is asserted by a PostgreSQL test)
- Files touched: `modules/17-spring-transactions.md` (region `QB-M17-02`), lab `m17/outputs/**` (one class `Q17_mm` per Output or Bug hunt question and `Q17OutputsTest` methods for this chunk only), `SOURCES.md`
- Inputs: [M17](modules/M17.md) §5 rows Q17.09 to Q17.16 (types, ledger rows, verify route) and §3; STYLE-GUIDE §5, §7.3 to §7.5; QUALITY-BAR D; the sections each question drills.
- Acceptance: answer anatomy per STYLE-GUIDE §5.3 (QUALITY-BAR D1); each Output short answer asserted by a test whose `@DisplayName` starts with its ID (C2); Production scenario answers follow D9; `<!-- ledger: … -->` lines list the plan's rows; ≈250 prose words per question on average; Standard checks rows 2 (with Docker) or 3, 4, 5, 6 for `spring-transactions`.
- Done by: none yet

### QB-M17-03 · M · Q17.17 to Q17.24
- Status: `todo` · Deps: SEC-M17-07 to SEC-M17-09 · needs: docker (at least one Output question is asserted by a PostgreSQL test)
- Files touched: `modules/17-spring-transactions.md` (region `QB-M17-03`), lab `m17/outputs/**` (one class `Q17_mm` per Output or Bug hunt question and `Q17OutputsTest` methods for this chunk only), `SOURCES.md`
- Inputs: [M17](modules/M17.md) §5 rows Q17.17 to Q17.24 (types, ledger rows, verify route) and §3; STYLE-GUIDE §5, §7.3 to §7.5; QUALITY-BAR D; the sections each question drills.
- Acceptance: answer anatomy per STYLE-GUIDE §5.3 (QUALITY-BAR D1); each Output short answer asserted by a test whose `@DisplayName` starts with its ID (C2); Production scenario answers follow D9; `<!-- ledger: … -->` lines list the plan's rows; ≈250 prose words per question on average; Standard checks rows 2 (with Docker) or 3, 4, 5, 6 for `spring-transactions`.
- Done by: none yet

### QB-M17-04 · M · Q17.25 to Q17.32
- Status: `todo` · Deps: SEC-M17-10 to SEC-M17-14 · needs: docker (at least one Output question is asserted by a PostgreSQL test)
- Files touched: `modules/17-spring-transactions.md` (region `QB-M17-04`), lab `m17/outputs/**` (one class `Q17_mm` per Output or Bug hunt question and `Q17OutputsTest` methods for this chunk only), `SOURCES.md`
- Inputs: [M17](modules/M17.md) §5 rows Q17.25 to Q17.32 (types, ledger rows, verify route) and §3; STYLE-GUIDE §5, §7.3 to §7.5; QUALITY-BAR D; the sections each question drills.
- Acceptance: answer anatomy per STYLE-GUIDE §5.3 (QUALITY-BAR D1); each Output short answer asserted by a test whose `@DisplayName` starts with its ID (C2); Production scenario answers follow D9; `<!-- ledger: … -->` lines list the plan's rows; ≈250 prose words per question on average; Standard checks rows 2 (with Docker) or 3, 4, 5, 6 for `spring-transactions`.
- Done by: none yet

### EX-M17-01 · M · Exercise 17.1 Repair a silently non-transactional service
- Status: `todo` · Deps: SEC-M17-04, SEC-M17-08 · needs: none
- Files touched: `modules/17-spring-transactions.md` (region `EX-M17-01`), lab `m17/ex1/**`, `SOURCES.md`
- Inputs: [M17](modules/M17.md) §6 row Ex17.1 (criteria); STYLE-GUIDE §8.1, §7.1; QUALITY-BAR E.
- Acceptance: STYLE-GUIDE §8.1 anatomy; every criterion of the plan row has a test `Ex17.1 · …` and every such test maps to a criterion (E2); solution follows §7.1 (≤ 4 injected dependencies, constructor injection, low complexity); ≈350 prose words; Standard checks rows 2 (with Docker) or 3, 4, 5, 6 for `spring-transactions`.
- Done by: none yet

### EX-M17-02 · M · Exercise 17.2 An audit trail that survives rollback without deadlocking the pool
- Status: `todo` · Deps: SEC-M17-06, SEC-M17-13 · needs: docker
- Files touched: `modules/17-spring-transactions.md` (region `EX-M17-02`), lab `m17/ex2/**`, `SOURCES.md`
- Inputs: [M17](modules/M17.md) §6 row Ex17.2 (criteria); STYLE-GUIDE §8.1, §7.1; QUALITY-BAR E.
- Acceptance: STYLE-GUIDE §8.1 anatomy; every criterion of the plan row has a test `Ex17.2 · …` and every such test maps to a criterion (E2); solution follows §7.1 (≤ 4 injected dependencies, constructor injection, low complexity); ≈350 prose words; Standard checks rows 2 (with Docker) or 3, 4, 5, 6 for `spring-transactions`.
- Done by: none yet

### EX-M17-03 · M · Exercise 17.3 Reserve stock under concurrency
- Status: `todo` · Deps: SEC-M17-07, SEC-M17-10 · needs: docker
- Files touched: `modules/17-spring-transactions.md` (region `EX-M17-03`), lab `m17/ex3/**`, `SOURCES.md`
- Inputs: [M17](modules/M17.md) §6 row Ex17.3 (criteria); STYLE-GUIDE §8.1, §7.1; QUALITY-BAR E.
- Acceptance: STYLE-GUIDE §8.1 anatomy; every criterion of the plan row has a test `Ex17.3 · …` and every such test maps to a criterion (E2); solution follows §7.1 (≤ 4 injected dependencies, constructor injection, low complexity); ≈350 prose words; Standard checks rows 2 (with Docker) or 3, 4, 5, 6 for `spring-transactions`.
- Done by: none yet

### EX-M17-04 · M · Exercise 17.4 Place an order idempotently and notify after commit
- Status: `todo` · Deps: SEC-M17-11, SEC-M17-13, EX-M17-03 · needs: docker
- Files touched: `modules/17-spring-transactions.md` (region `EX-M17-04`), lab `m17/ex4/**`, `SOURCES.md`
- Inputs: [M17](modules/M17.md) §6 row Ex17.4 (criteria); STYLE-GUIDE §8.1, §7.1; QUALITY-BAR E.
- Acceptance: STYLE-GUIDE §8.1 anatomy; every criterion of the plan row has a test `Ex17.4 · …` and every such test maps to a criterion (E2); solution follows §7.1 (≤ 4 injected dependencies, constructor injection, low complexity); ≈350 prose words; Standard checks rows 2 (with Docker) or 3, 4, 5, 6 for `spring-transactions`.
- Done by: none yet

### CLOSE-M17 · M
- Status: `todo` · Deps: every SEC-M17, QB-M17 and EX-M17 task · needs: docker (full lab run with Docker, QUALITY-BAR H1, H5)
- Files touched: `modules/17-spring-transactions.md` (the three `CLOSE-M17` regions: Summary, Check your understanding, Connections), `_meta/sources/{architect-md,security-jpa-md,spring-data-jpa-pdf}.md` (status `written` for the rows homed in M17 §3), `PROGRESS.md`, `_meta/TASKS.md`, `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: the whole module; [M17](modules/M17.md); [QUALITY-BAR](QUALITY-BAR.md) (all items, the Measuring block); STYLE-GUIDE §2.3, §9.
- Acceptance: `grep -c 'TASK:' modules/17-spring-transactions.md` prints 0; every QUALITY-BAR item checked and recorded in the LOG line; Standard checks row 8 with Docker exits 0; rows 4, 5, 6 pass; ledger rows marked `written`; PROGRESS row 17 updated. Connections links `../angular-fullstack-guide/modules/30-e2e-and-testing-strategy.md` (rolling-back tests seen from the frontend).
- Done by: none yet

### REVIEW-M17 · L
- Status: `todo` · Deps: `CLOSE-M17` (and every SEC, QB, EX task of module 17) · needs: none · independent per RUN.md §4 (a different session from every `Done by` of module 17, or a fresh read-only subagent that receives only the module path, QUALITY-BAR, STYLE-GUIDE and the module plan; prefer a different model)
- Files touched: `_meta/reviews/REVIEW-M17.md`, `_meta/TASKS.md` (append `FIX-M17-nn`), `_meta/STATE.md`, `_meta/LOG.md`
- Inputs: `modules/17-spring-transactions.md`, `_meta/modules/M17.md`, [QUALITY-BAR](QUALITY-BAR.md), STYLE-GUIDE, `labs/spring-transactions/`
- Acceptance: every QUALITY-BAR item checked with evidence; findings listed with severity and turned into FIX tasks; `Done by` records which review route was used.
- **Gate G1:** when REVIEW-M17 (and its FIX tasks) are done, G1 ("Syllabus and pilot approved") blocks every `PLAN-Mxx` other than M17 until Jorge ticks it. EXTRACT, VERIFY, FIX and HOUSE tasks continue meanwhile.
- Done by: none yet

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
| HOUSE-06 | S | todo | Replace UNVERIFIED support-policy cells in [VERSIONS](../VERSIONS.md) for one technology group per run (for example Hibernate and Spring Data; Kafka; Micrometer and Resilience4j; JUnit, Mockito, Testcontainers) with a value read from the project's own policy or release page, or keep UNVERIFIED and say why. Files: `VERSIONS.md`, `SOURCES.md`. Acceptance: each changed cell cites a URL and the date checked. |
| HOUSE-08 | S | done (S20261025-0744-claudecode, claude-opus-5-5) | Fix the Docker probe in Standard checks row 1: `perl -e 'alarm 20; exec @ARGV' docker info` exits 0 when `docker` is not on PATH (a failed `exec` falls through to exit 0). Use `perl -e 'alarm 20; exec @ARGV or exit 127' docker info`. Files: `_meta/TASKS.md`. Acceptance: with no `docker` on PATH the new probe exits non-zero. |
| HOUSE-07 | S | todo | Keep STATE.md under 60 lines (RUN.md §2): fold resolved standing notes into LOG references. Files: `_meta/STATE.md`. Acceptance: `wc -l` under 60 and no open note lost. |
