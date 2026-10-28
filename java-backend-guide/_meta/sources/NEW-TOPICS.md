# New topics

Topics found in the source chunks that SYLLABUS §4 did not cover initially. EXTRACT tasks appended rows; `SYLLABUS-REVISE` (S20261028-0812-antigravity) mapped every topic into `SYLLABUS.md` §4 checklist items (append-only) across the existing 55 modules. Source of the format: RUN.md §10.2. All 40 entries below are integrated into SYLLABUS §4.

| Topic | Found in (ledger row ID) | Suggested module | Notes |
|---|---|---|---|
| MySQL/InnoDB locking contrast (gap and next-key locks, deadlock victim selection) versus PostgreSQL | architect-md-01-33 | 26 postgresql-internals (comparison subsection) | SYLLABUS has no MySQL coverage; an interviewer follow-up in Q16 |
| Spring DI extras: `@Lookup` method injection, custom scopes (`registerScope`, `SimpleThreadScope`), JSR-250/JSR-330 annotations (`@Resource`, `@Inject`, `@Named`) | security-jpa-md-04-11, security-jpa-md-04-13, security-jpa-md-04-20 | 15 spring-ioc-and-bean-lifecycle | Fits as sub-bullets of existing checklist items |
| Spring Data REST (repository-exported REST endpoints) | spring-data-jpa-pdf-02-25 | 25 spring-data-and-schema-migrations (or 33 rest-api-design) | Absent from SYLLABUS §4 |
| Bitwise and shift operators (`>>` vs `>>>`, sign extension) | core-java-240-01-26 | 01 java-oop-fundamentals (§ numeric types) | SYLLABUS §4 numeric-types item covers ranges and promotion, not bit operators |
| Java naming conventions (classes, interfaces, methods, variables, constants) | core-java-240-01-27 | 01 java-oop-fundamentals | Also rows 01-28 to 01-31; no checklist item covers coding conventions |
| Identifiers and reserved-word lexical rules (the `_` restriction, unnamed variables) | core-java-240-02-07 | 01 java-oop-fundamentals | Unnamed variables appear only under 07 as a language feature |
| API composition pattern (a composition service joins data from several services for one client response) | microservices-pdf-02-02 | 41 microservices-architecture (§ communication, API gateway; cross-link 43 CQRS read models) | Absent from SYLLABUS §4 |
| Marker interfaces (Serializable, Cloneable, Remote) versus annotations | core-java-pdf-01-09 | 01 java-oop-fundamentals (§ abstract classes vs interfaces) | No SYLLABUS §4 item names them |
| JNI and the Foreign Function and Memory API | core-java-pdf-01-07 | 08 jvm-memory-and-class-loading | Native code and native memory are not in the §4 checklist; FFM status to verify when written |
| JAR packaging: manifest, executable JAR, fat JAR, modular JAR | core-java-pdf-01-06 | 48 build-maven-and-gradle | Packaging may need an explicit item |
| Java SE internationalization (Locale, ResourceBundle) | core-java-pdf-01-16, core-java-pdf-02-16 | 06 java-exceptions-strings-io (§ Unicode and charsets) | SYLLABUS covers Spring `MessageSource` only |
| Legacy date and time APIs (Calendar, TimeZone) versus java.time | core-java-pdf-02-10, core-java-pdf-02-47 | 07 java-modern-language-features (§ API changes) | java.time is not in §4 |
| Control flow and operators (labels, break/continue, `&` vs `&&`, precedence, ternary, compound assignment, integer division) | core-java-pdf-01-05, core-java-pdf-02-08 | 01 java-oop-fundamentals | Only partly covered by the numeric-types item |
| Graph databases (Neo4j, property graphs) as a NoSQL family | system-design-pdf-02-17 | 40 distributed-systems-fundamentals (§ SQL vs NoSQL) | No module covers graph stores; mentioned only in the row's Notes |
| CRDTs (G-Counter, convergence without coordination) | architect-answers-pdf-03-03 | 40 distributed-systems-fundamentals (consistency models) | SYLLABUS §4 names event sourcing but not CRDTs |
| Cloud autoscaling and cost: KEDA event-driven scaling, predictive scaling, spot instances, cost allocation tags | architect-answers-pdf-03-05 | 49 containers-kubernetes-and-aws (§ HPA) | §4 has HPA only |
| Multi-AZ workload design: topology spread constraints, Multi-AZ RDS/Aurora, cross-AZ traffic cost, zone-aware routing | architect-answers-pdf-03-06 | 49 containers-kubernetes-and-aws (cross-link 40 § multi-region) | Multi-AZ is not a named §4 item |
| DynamoDB conditional writes and `TransactWriteItems` | architect-answers-pdf-03-08 | 40 distributed-systems-fundamentals (§ SQL vs NoSQL) | No DynamoDB coverage in §4 |
| Conway's Law, Inverse Conway Maneuver, module ownership and inner source | architect-answers-pdf-06-06 | 41 microservices-architecture (cross-link 52, 55) | Absent from §4 |
| JVM safepoints and time-to-safepoint (TTSP), `-Xlog:safepoint` | architect-md-04-05 | 09 jvm-garbage-collection (§ tuning and pauses; cross-link 10) | §4 has no safepoint item |
| OS-level limits behind load collapse (file descriptors, `somaxconn`, ephemeral ports, HTTP keep-alive and client reuse) | architect-md-02-14 | 54 architect-production-scenarios (cross-link 49, 18) | 18 covers timeouts, not connection reuse |
| `ThreadGroup` (legacy thread grouping) | core-java-240-05-07 | 11 concurrency-threads-and-jmm (note under creating threads) | Legacy API |
| Uncaught exception handling (default handler, `Thread.UncaughtExceptionHandler`) | core-java-240-03-14 | 06 java-exceptions-strings-io | §4 covers try/catch/finally, not uncaught exceptions in threads |
| GitOps delivery (config repo holds the image digest, Argo CD or Flux reconcile, drift detection) versus push-based deploy | architect-md-08-39 | 50 cicd-and-jenkins (§ environment promotion; cross-link 49) | Not named in §4 |
| Feature flags and the deploy/release split (dark launch, flag flip as rollback) | architect-md-08-42 | 50 cicd-and-jenkins (§ deployment strategies and rollback) | §4 lists rolling, blue/green and canary only |
| Full-text search integrations: Hibernate Search and Spring Data Elasticsearch | spring-data-jpa-pdf-03-07 | 26 postgresql-internals; 25 spring-data-and-schema-migrations comparison | Keep PostgreSQL full-text search as the executable default; compare external indexing and its consistency costs. |
| Boot DevTools: restart, LiveReload, development defaults and production exclusion | spring-pdf-02-02 | 20 spring-boot-autoconfiguration-and-config | A short developer-tooling subsection; verify behavior against VERSIONS before writing. |
| Boot startup banner configuration | spring-pdf-02-06 | 20 spring-boot-autoconfiguration-and-config | Small startup-sequence note; no separate module. |
| Spring Mail integration: JavaMailSender, SMTP properties, credentials and timeouts | spring-pdf-03-02 | 20 spring-boot-autoconfiguration-and-config | Source Q18 has an incorrect caching title; body is about email. |
| Hedged requests and fan-out tail amplification | data-storage-md-01-13 | 42 resilience-patterns; cross-link 10 and 44 | Include duplicate work, cancellation and idempotency trade-offs. |
| Concurrency versus parallelism and Amdahl's Law | data-storage-md-01-18 | 11 concurrency-threads-and-jmm | Introductory scaling mental model; derive bounds rather than quoting hardware numbers. |
| End-to-end checksums, silent corruption, background scrubbing and repair | data-storage-md-01-24 | 53 system-design-method-and-cases | File storage and backup case; detection versus repair. |
| Erasure coding versus replication, failure-domain placement and rebuild storms | data-storage-md-01-25 | 53 system-design-method-and-cases; cross-link 40 | Storage-case trade-off, not a new coding-theory module. |
| Backup restore drills, recovery point objective (RPO) and recovery time objective (RTO) | data-storage-md-01-26 | 53 system-design-method-and-cases | Tie recovery targets to measured restore tests. |
| Durable backup-client state: SQLite WAL, change scans, filesystem notifications and portable metadata | data-storage-md-01-27, data-storage-md-01-28, data-storage-md-01-29, data-storage-md-02-14 | 53 system-design-method-and-cases | Bounded client-side context needed to answer the storage case; no desktop application tutorial. |
| TCP half-open connections, keepalives and application timeout budgets | data-storage-md-02-01 | 42 resilience-patterns; cross-link 22 | Keep transport failure detection separate from operation success. |
| HTTP/2 multiplexing, transport head-of-line blocking and HTTP/3/QUIC contrast | data-storage-md-02-02 | 34 grpc; cross-link 33 | Protocol comparison supporting service communication decisions. |
| TLS termination, re-encryption, encryption at rest and end-to-end key ownership | data-storage-md-02-04 | 39 api-security-and-secrets | Connect edge architecture and trust boundaries; no cryptography implementation. |
| Incident coordination, mitigation, timelines, communication and blameless postmortems | data-storage-md-02-09 | 54 architect-production-scenarios; cross-link 55 | Operational process attached to the existing incident drills. |
| Interviewing about an LLM integration: provider failures, budgets, evaluations and prompt injection | data-storage-md-02-17 | 55 interview-craft | Use as an interview story with a concrete verification checklist, not a new LLM engineering module. |
