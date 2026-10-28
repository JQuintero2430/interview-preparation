# ROADMAP

Phases A to E of the job. Source of module data: [SYLLABUS §1](../SYLLABUS.md#1-module-list) (targets, prerequisites) and §4 (topic checklists). Planning the next module (`PLAN-Mxx`) starts only when the queue in [TASKS.md](TASKS.md) has no eligible `todo` task left (RUN.md §4.5). G1 (see [GATES.md](GATES.md)) blocks every `PLAN-Mxx` except the pilot's until Jorge ticks it.

## Phase A: pilot (module 17 `spring-transactions`)

| Step | Task | Notes |
|---|---|---|
| A1 | `EXTRACT-architect-md-01`, `EXTRACT-security-jpa-md-04`, `EXTRACT-spring-data-jpa-pdf-02` | Only the chunks the provisional mapping (SYLLABUS §7) assigns to the pilot |
| A2 | `PLAN-M17` | Extends the lab `labs/spring-transactions/` that P5 already created |
| A3 | `SEC-M17-nn`, `QB-M17-nn`, `EX-M17-nn`, `CLOSE-M17` | Appended to TASKS.md by PLAN-M17 |
| A4 | `REVIEW-M17` | Independent (RUN.md §4); findings become `FIX-M17-nn` |
| A5 | **G1** | After A4, no other `PLAN-Mxx` may start until Jorge ticks G1 |

The pilot is written before its prerequisites 16 and 22; links to them are planned links until those modules exist.

## Phase B: remaining extraction, then SYLLABUS-REVISE

| Step | Tasks | Notes |
|---|---|---|
| B1 | `EXTRACT-<chunk>` for the 44 remaining chunks, in INVENTORY order | May run while G1 is waiting. Chunks marked `needs: vision` (`spring-pdf-01..03`) run only in a harness with vision |
| B2 | `SYLLABUS-REVISE` (L) | After every EXTRACT is `done` or its chunk is recorded unreadable: new topics and modules (append-only slugs), final mapping of every ledger row, refreshed size projection, extra EXTRACT / MOVE / DELETE tasks |

Pilot questions found late become `FIX-M17-nn` tasks.

## Phase C: the remaining modules, in prerequisite order

One module at a time: `PLAN-Mxx`, its `SEC`/`QB`/`EX` tasks, `CLOSE-Mxx`, `REVIEW-Mxx`, `FIX-Mxx-nn`. The order is a topological sort of the SYLLABUS §1 Prerequisites column (smallest module number first among the ready ones); it may be refined by SYLLABUS-REVISE, which can add modules (append-only slugs). Module 17 is the pilot (Phase A) and stays in its topological position for reference.

| Order | Module | Part | Kind | Prerequisites | Status |
|---|---|---|---|---|---|
| 1 | 01 `java-oop-fundamentals` | A | core | none | planned |
| 2 | 02 `java-equality-immutability-records` | A | core | 01 | planned |
| 3 | 03 `java-generics` | A | core | 01 | planned |
| 4 | 04 `java-collections-internals` | A | core | 02, 03 | planned |
| 5 | 05 `java-lambdas-streams-optional` | A | core | 03, 04 | planned |
| 6 | 06 `java-exceptions-strings-io` | A | core | 01 | planned |
| 7 | 07 `java-modern-language-features` | A | core | 02, 05 | planned |
| 8 | 08 `jvm-memory-and-class-loading` | B | core | 01 | planned |
| 9 | 09 `jvm-garbage-collection` | B | core | 08 | planned |
| 10 | 10 `jvm-performance-and-troubleshooting` | B | core | 09 | planned |
| 11 | 11 `concurrency-threads-and-jmm` | C | core | 01, 08 | planned |
| 12 | 12 `concurrency-locks-atomics-collections` | C | core | 04, 11 | planned |
| 13 | 13 `concurrency-executors-and-completablefuture` | C | core | 12 | planned |
| 14 | 14 `concurrency-virtual-threads` | C | core | 13 | planned |
| 15 | 15 `spring-ioc-and-bean-lifecycle` | D | core | 01, 03 | planned |
| 16 | 16 `spring-aop-and-proxies` | D | core | 15 | planned |
| 17 | 18 `spring-mvc-and-rest-controllers` | D | core | 15 | planned |
| 18 | 19 `spring-reactive-webflux` | D | core | 13, 18 | planned |
| 19 | 20 `spring-boot-autoconfiguration-and-config` | E | core | 15 | planned |
| 20 | 21 `spring-boot-actuator-and-operations` | E | core | 20 | planned |
| 21 | 22 `jdbc-and-connection-pooling` | F | supporting | 06 | planned |
| 22 | 17 `spring-transactions` | D | core (pilot) | 16, 22 | Phase A (pilot) |
| 23 | 23 `jpa-hibernate-fundamentals` | F | core | 17, 22 | planned |
| 24 | 24 `jpa-performance-and-locking` | F | core | 23 | planned |
| 25 | 25 `spring-data-and-schema-migrations` | F | core | 24 | planned |
| 26 | 26 `postgresql-internals` | F | core | 22 | planned |
| 27 | 27 `redis` | F | core | 20 | planned |
| 28 | 28 `mongodb` | F | supporting | 20 | planned |
| 29 | 30 `kafka-fundamentals` | G | core | 13 | planned |
| 30 | 31 `kafka-reliability-and-spring-kafka` | G | core | 17, 30 | planned |
| 31 | 32 `messaging-rabbitmq-sqs-sns` | G | supporting | 30 | planned |
| 32 | 33 `rest-api-design` | H | core | 18 | planned |
| 33 | 34 `grpc` | H | supporting | 33 | planned |
| 34 | 35 `graphql` | H | supporting | 33 | planned |
| 35 | 36 `realtime-websockets-sse` | H | supporting | 18 | planned |
| 36 | 37 `spring-security-architecture` | I | core | 16, 18 | planned |
| 37 | 38 `oauth2-oidc-and-jwt` | I | core | 37 | planned |
| 38 | 39 `api-security-and-secrets` | I | core | 33, 38 | planned |
| 39 | 40 `distributed-systems-fundamentals` | J | core | 13 | planned |
| 40 | 29 `cassandra` | F | supporting | 40 | planned |
| 41 | 41 `microservices-architecture` | J | core | 33, 40 | planned |
| 42 | 42 `resilience-patterns` | J | core | 41 | planned |
| 43 | 43 `distributed-transactions-and-data-patterns` | J | core | 17, 31, 41 | planned |
| 44 | 44 `observability-logging-metrics-slos` | K | core | 21 | planned |
| 45 | 45 `opentelemetry` | K | core | 14, 44 | planned |
| 46 | 46 `testing-junit-and-mockito` | L | core | 01 | planned |
| 47 | 47 `testing-spring-integration-and-contracts` | L | core | 20, 46 | planned |
| 48 | 48 `build-maven-and-gradle` | M | supporting | 01 | planned |
| 49 | 49 `containers-kubernetes-and-aws` | M | core | 21, 48 | planned |
| 50 | 50 `cicd-and-jenkins` | M | core | 48, 49 | planned |
| 51 | 51 `design-principles-and-patterns` | N | core | 01, 15 | planned |
| 52 | 52 `ddd-and-clean-architecture` | N | core | 41, 51 | planned |
| 53 | 53 `system-design-method-and-cases` | N | core | 40, 41 | planned |
| 54 | 54 `architect-production-scenarios` | N | core | 10, 17, 42, 45, 49 | planned |
| 55 | 55 `interview-craft` | N | supporting | none | planned |

## Phase D: sources out (G2)

Starts after SYLLABUS-REVISE, once G2 is ticked and no other guide session is running.

- `MOVE-<src>` (S): only for a source with at least one unreadable chunk; moves it to `attachments/` (RUN.md §10.2).
- `DELETE-<src>` (S), one per source (11): needs every ledger row of the source `written` in a CLOSEd module, `duplicate-of`, or "no interview content"; writes `SOURCE-MAP.md` entries, rewrites the references in other guides (each one logged), removes the file (`rm` if tracked, `mv` to `attachments/.trash/` if untracked).
- SYLLABUS-REVISE queues the concrete MOVE and DELETE tasks.

## Phase E: finish line (RUN.md §13)

- A cross-module consistency REVIEW (contradictions, duplicated questions, uniform status markers, version notes consistent with VERSIONS.md).
- `QUESTION-INDEX.md` (generated from the `### Q` headings), `GLOSSARY.md`, `CHEATSHEET.md`, `MOCK-INTERVIEWS.md`.
- `README.md` with a Mermaid prerequisite map, study paths by goal and the "Attachments" list; the single link in the repository-root `README.md`.
- Final verification, with evidence (command, exit code, one-line result) in the last LOG entry:
  - every module `done` in PROGRESS.md, CLOSEd, REVIEWed, FIX tasks done;
  - `node java-backend-guide/labs/tools/module-stats.mjs --strict` exits 0;
  - UNVERIFIED.md has zero open items;
  - every ledger row `written`, `duplicate-of` or "no interview content", and the 11 sources deleted or in `attachments/`;
  - full `verify` of `labs/` exits 0 with Docker available, and `spotless:check` exits 0;
  - `node java-backend-guide/labs/tools/check-links.mjs java-backend-guide` (without `--planned`) reports 0 broken links and anchors;
  - root files exist and the repository README links to the guide;
  - `git diff --cached --name-only` is empty, `attachments/.trash/` is empty or reported, no stray build output or temporary files.
