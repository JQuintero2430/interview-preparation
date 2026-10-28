# Progress

Human-facing dashboard, one row per module. Updated by `CLOSE`, `SYLLABUS-REVISE` and `DELETE` tasks. The job's working memory is in `_meta/`: [STATE](_meta/STATE.md) (where the job stands), [TASKS](_meta/TASKS.md) (queue), [ROADMAP](_meta/ROADMAP.md) (phases and module order), [GATES](_meta/GATES.md) (decisions for Jorge), [LOG](_meta/LOG.md) (session log).

**Last updated:** 2026-10-28 (SYLLABUS-REVISE, S20261028-0812-antigravity)

## Phases

- [x] Planning P1 to P8: inventory, versions, syllabus, style guide, labs scaffolding, job state, dry run and report
- [ ] Phase A: pilot module 17, then gate G1 (in progress)
- [x] Phase B: extraction of all source chunks (47/47), then SYLLABUS-REVISE
- [ ] Phase C: remaining modules
- [ ] Phase D: sources moved or deleted (gate G2)
- [ ] Phase E: finish line

## Sources

| Row | Consolidated | Chunks extracted |
|---|---|---|
| The 11 files at the repository root ([inventory](_meta/sources/INVENTORY.md)) | 0/11 | 47/47 |

## Modules

Status values: `planned`, `planning`, `writing`, `closed`, `reviewed`, `done` (closed, reviewed and every FIX task done). Q/Ex written counts against the SYLLABUS §1 ceilings.

| # | Slug | Kind | Status | Q / Ex written |
|---|---|---|---|---|
| 01 | [`java-oop-fundamentals`](modules/01-java-oop-fundamentals.md) | core | planned | 0/30 Q · 0/4 Ex |
| 02 | [`java-equality-immutability-records`](modules/02-java-equality-immutability-records.md) | core | planned | 0/24 Q · 0/3 Ex |
| 03 | [`java-generics`](modules/03-java-generics.md) | core | planned | 0/24 Q · 0/3 Ex |
| 04 | [`java-collections-internals`](modules/04-java-collections-internals.md) | core | planned | 0/32 Q · 0/4 Ex |
| 05 | [`java-lambdas-streams-optional`](modules/05-java-lambdas-streams-optional.md) | core | planned | 0/30 Q · 0/4 Ex |
| 06 | [`java-exceptions-strings-io`](modules/06-java-exceptions-strings-io.md) | core | planned | 0/26 Q · 0/3 Ex |
| 07 | [`java-modern-language-features`](modules/07-java-modern-language-features.md) | core | planned | 0/26 Q · 0/3 Ex |
| 08 | [`jvm-memory-and-class-loading`](modules/08-jvm-memory-and-class-loading.md) | core | planned | 0/26 Q · 0/3 Ex |
| 09 | [`jvm-garbage-collection`](modules/09-jvm-garbage-collection.md) | core | planned | 0/28 Q · 0/3 Ex |
| 10 | [`jvm-performance-and-troubleshooting`](modules/10-jvm-performance-and-troubleshooting.md) | core | planned | 0/30 Q · 0/3 Ex |
| 11 | [`concurrency-threads-and-jmm`](modules/11-concurrency-threads-and-jmm.md) | core | planned | 0/30 Q · 0/4 Ex |
| 12 | [`concurrency-locks-atomics-collections`](modules/12-concurrency-locks-atomics-collections.md) | core | planned | 0/30 Q · 0/4 Ex |
| 13 | [`concurrency-executors-and-completablefuture`](modules/13-concurrency-executors-and-completablefuture.md) | core | planned | 0/28 Q · 0/4 Ex |
| 14 | [`concurrency-virtual-threads`](modules/14-concurrency-virtual-threads.md) | core | planned | 0/24 Q · 0/3 Ex |
| 15 | [`spring-ioc-and-bean-lifecycle`](modules/15-spring-ioc-and-bean-lifecycle.md) | core | planned | 0/32 Q · 0/4 Ex |
| 16 | [`spring-aop-and-proxies`](modules/16-spring-aop-and-proxies.md) | core | planned | 0/24 Q · 0/3 Ex |
| 17 | [`spring-transactions`](modules/17-spring-transactions.md) | core (pilot) | writing | 0/40 Q · 0/6 Ex |
| 18 | [`spring-mvc-and-rest-controllers`](modules/18-spring-mvc-and-rest-controllers.md) | core | planned | 0/28 Q · 0/4 Ex |
| 19 | [`spring-reactive-webflux`](modules/19-spring-reactive-webflux.md) | core | planned | 0/28 Q · 0/4 Ex |
| 20 | [`spring-boot-autoconfiguration-and-config`](modules/20-spring-boot-autoconfiguration-and-config.md) | core | planned | 0/28 Q · 0/4 Ex |
| 21 | [`spring-boot-actuator-and-operations`](modules/21-spring-boot-actuator-and-operations.md) | core | planned | 0/24 Q · 0/3 Ex |
| 22 | [`jdbc-and-connection-pooling`](modules/22-jdbc-and-connection-pooling.md) | supporting | planned | 0/16 Q · 0/2 Ex |
| 23 | [`jpa-hibernate-fundamentals`](modules/23-jpa-hibernate-fundamentals.md) | core | planned | 0/32 Q · 0/4 Ex |
| 24 | [`jpa-performance-and-locking`](modules/24-jpa-performance-and-locking.md) | core | planned | 0/30 Q · 0/4 Ex |
| 25 | [`spring-data-and-schema-migrations`](modules/25-spring-data-and-schema-migrations.md) | core | planned | 0/26 Q · 0/3 Ex |
| 26 | [`postgresql-internals`](modules/26-postgresql-internals.md) | core | planned | 0/30 Q · 0/4 Ex |
| 27 | [`redis`](modules/27-redis.md) | core | planned | 0/28 Q · 0/3 Ex |
| 28 | [`mongodb`](modules/28-mongodb.md) | supporting | planned | 0/18 Q · 0/2 Ex |
| 29 | [`cassandra`](modules/29-cassandra.md) | supporting | planned | 0/18 Q · 0/2 Ex |
| 30 | [`kafka-fundamentals`](modules/30-kafka-fundamentals.md) | core | planned | 0/30 Q · 0/4 Ex |
| 31 | [`kafka-reliability-and-spring-kafka`](modules/31-kafka-reliability-and-spring-kafka.md) | core | planned | 0/30 Q · 0/4 Ex |
| 32 | [`messaging-rabbitmq-sqs-sns`](modules/32-messaging-rabbitmq-sqs-sns.md) | supporting | planned | 0/16 Q · 0/2 Ex |
| 33 | [`rest-api-design`](modules/33-rest-api-design.md) | core | planned | 0/26 Q · 0/3 Ex |
| 34 | [`grpc`](modules/34-grpc.md) | supporting | planned | 0/18 Q · 0/2 Ex |
| 35 | [`graphql`](modules/35-graphql.md) | supporting | planned | 0/18 Q · 0/2 Ex |
| 36 | [`realtime-websockets-sse`](modules/36-realtime-websockets-sse.md) | supporting | planned | 0/14 Q · 0/2 Ex |
| 37 | [`spring-security-architecture`](modules/37-spring-security-architecture.md) | core | planned | 0/30 Q · 0/4 Ex |
| 38 | [`oauth2-oidc-and-jwt`](modules/38-oauth2-oidc-and-jwt.md) | core | planned | 0/28 Q · 0/3 Ex |
| 39 | [`api-security-and-secrets`](modules/39-api-security-and-secrets.md) | core | planned | 0/26 Q · 0/3 Ex |
| 40 | [`distributed-systems-fundamentals`](modules/40-distributed-systems-fundamentals.md) | core | planned | 0/28 Q · 0/3 Ex |
| 41 | [`microservices-architecture`](modules/41-microservices-architecture.md) | core | planned | 0/28 Q · 0/3 Ex |
| 42 | [`resilience-patterns`](modules/42-resilience-patterns.md) | core | planned | 0/26 Q · 0/4 Ex |
| 43 | [`distributed-transactions-and-data-patterns`](modules/43-distributed-transactions-and-data-patterns.md) | core | planned | 0/28 Q · 0/4 Ex |
| 44 | [`observability-logging-metrics-slos`](modules/44-observability-logging-metrics-slos.md) | core | planned | 0/26 Q · 0/3 Ex |
| 45 | [`opentelemetry`](modules/45-opentelemetry.md) | core | planned | 0/30 Q · 0/4 Ex |
| 46 | [`testing-junit-and-mockito`](modules/46-testing-junit-and-mockito.md) | core | planned | 0/26 Q · 0/4 Ex |
| 47 | [`testing-spring-integration-and-contracts`](modules/47-testing-spring-integration-and-contracts.md) | core | planned | 0/26 Q · 0/4 Ex |
| 48 | [`build-maven-and-gradle`](modules/48-build-maven-and-gradle.md) | supporting | planned | 0/16 Q · 0/2 Ex |
| 49 | [`containers-kubernetes-and-aws`](modules/49-containers-kubernetes-and-aws.md) | core | planned | 0/28 Q · 0/3 Ex |
| 50 | [`cicd-and-jenkins`](modules/50-cicd-and-jenkins.md) | core | planned | 0/30 Q · 0/4 Ex |
| 51 | [`design-principles-and-patterns`](modules/51-design-principles-and-patterns.md) | core | planned | 0/30 Q · 0/4 Ex |
| 52 | [`ddd-and-clean-architecture`](modules/52-ddd-and-clean-architecture.md) | core | planned | 0/24 Q · 0/3 Ex |
| 53 | [`system-design-method-and-cases`](modules/53-system-design-method-and-cases.md) | core | planned | 0/28 Q · 0/3 Ex |
| 54 | [`architect-production-scenarios`](modules/54-architect-production-scenarios.md) | core | planned | 0/30 Q · 0/3 Ex |
| 55 | [`interview-craft`](modules/55-interview-craft.md) | supporting | planned | 0/14 Q · 0/2 Ex |

Modules done: 0/55.

## Attachments

Sources moved to `attachments/` by MOVE tasks (RUN.md §10.2) are listed here until the guide README exists. None yet.
