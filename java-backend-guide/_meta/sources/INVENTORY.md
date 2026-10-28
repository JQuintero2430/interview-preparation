# Source inventory

This file lists the 11 source documents at the repository root, how each one can be read, how it is split into extraction chunks, and where else in the repository each source is referenced. It drives the EXTRACT tasks (RUN.md §10.2): one EXTRACT task per chunk ID below. Generated 2026-10-25 by S20261025-0027-claudecode; tool versions: pdfinfo and pdftotext 26.10.0. Only metadata, headings and page headers were collected; no question content was extracted.

Conventions: word counts for PDFs come from `pdftotext "<file>" - | wc -w` (text layer only; a page with fewer than about 30 words is treated as likely image-based). Markdown word counts come from `wc -w` on the file or on the line range given. PDF ranges are PDF page numbers (not the printed numbers in a table of contents). Markdown ranges are line numbers. Results below come from running the tools unless marked "read from source".

## Summary

| Source | slug | type | bytes | pages | words | tracked | ignored | method | chunks |
|---|---|---|---|---|---|---|---|---|---|
| 240-core-java-questions.pdf | core-java-240 | PDF | 3701906 | 63 | 18441 | yes | no | text layer | 8 |
| Architect interview answers.pdf | architect-answers-pdf | PDF | 374026 | 42 | 17478 | yes | no | text layer | 6 |
| Core Java.pdf | core-java-pdf | PDF | 350444 | 30 | 7873 | yes | no | text layer | 3 |
| Microservice Architecture.pdf | microservices-pdf | PDF | 905748 | 22 | 2565 | yes | no | text layer | 3 |
| SPRING DATA JPA Complete Interview Preparation Guide.pdf | spring-data-jpa-pdf | PDF | 187338 | 22 | 4875 | yes | no | text layer | 3 |
| Spring.pdf | spring-pdf | PDF | 8612746 | 24 | 853 | yes | no | needs: vision | 3 |
| System Design Crash Course - Substack.pdf | system-design-pdf | PDF | 1665427 | 32 | 5831 | yes | no | text layer (p1 and p5 image-only) | 4 |
| Architect-Level Production & Architect.md | architect-md | Markdown | 148141 | n/a | 23168 | yes | no | text layer | 9 |
| Backend Interview Study Guide - Data storage, behavioral & concurrency.md | data-storage-md | Markdown | 60093 | n/a | 9309 | yes | no | text layer | 2 |
| Backend Study Guide - Security, JPA, Design Patterns & Spring.md | security-jpa-md | Markdown | 115816 | n/a | 14638 | yes | no | text layer | 5 |
| Java Backend Interview Guide - Honeywell, Optum & Production Scenarios.md | honeywell-optum-md | Markdown | 11350 | n/a | 2138 | yes | no | text layer | 1 |

"tracked" is the result of `git ls-files --error-unmatch` (all succeeded); "ignored" is the result of `git check-ignore` (no match for any file; `.gitignore` only lists `.DS_Store`).

## core-java-240: 240-core-java-questions.pdf

- Facts: PDF, 3701906 bytes, 63 pages, 18441 words (19 to 427 words per page, page 1 is a cover, pages 61 to 63 are short closing pages). Tracked, not ignored.
- Reading method: text layer (every page has at least 75 words).
- Structure (headings): English, numbered questions 01 to 240 ("NN  <question>"), running header "240 Core Java 2026" on every page.

| Chunk ID | range | words | method | heading signal |
|---|---|---|---|---|
| core-java-240-01 | p1-10 | 2780 | text layer | Cover "240 Core Java Interview Questions"; Q1-35: static blocks, constructors, overriding vs overloading, super, abstract class vs interface, platform independence, JIT, bytecode, class/object, encapsulation, main(), constants, coding standards, IS-A / HAS-A |
| core-java-240-02 | p11-16 | 1986 | text layer | Q36-55: null, multiple classes per file, packages, identifiers, access modifiers (class, method, variable), final, abstract classes and methods, exception basics |
| core-java-240-03 | p17-22 | 1828 | text layer | Q56-81: exception handling (try/catch/finally, multi-catch, checked vs unchecked, throw/throws, user-defined, rethrow, nested try, Throwable, ClassNotFoundException vs NoClassDefFoundError) |
| core-java-240-04 | p23-31 | 2989 | text layer | Q82-124: process vs thread, multitasking, creating threads (Runnable vs Thread), scheduler, restart/block, synchronization, class-level lock, priorities, yield, sleep, interrupt |
| core-java-240-05 | p32-39 | 2391 | text layer | Q125-163: IllegalMonitorStateException, thread groups, ThreadLocal, inner classes (member, static nested, local, anonymous), static members, overriding static methods, passing objects, wrapper classes |
| core-java-240-06 | p40-45 | 1872 | text layer | Q164-194: type conversion, garbage collection, classpath, instance variable scope, static imports, interfaces, enums, field hiding, switch on strings, OOP concepts |
| core-java-240-07 | p46-54 | 2495 | text layer | Q195-211: Collection interface, List and implementations, Set and implementations |
| core-java-240-08 | p55-63 | 2100 | text layer | Q212-240: Map implementations (LinkedHashMap, Hashtable), fail-safe iterators, serialization and serialVersionUID, static overriding, private constructor; short closing pages 61-63 |

References: java-backend-guide/_meta/PLANNING-PROMPT.md:102

## architect-answers-pdf: Architect interview answers.pdf

- Facts: PDF, 374026 bytes, 42 pages, 17478 words (257 to 518 words per page). Tracked, not ignored.
- Reading method: text layer. Body text is Spanish; question headings and technical terms are English.
- Structure: two parts. Part 1 (p1-21) is numbered questions 1 to 23 (architect interview questions). Part 2 ("Parte 2: Modular Monolith y Spring Modulith", p22-42) restarts at question 1 and runs to 20. Headers for Q16 (Part 1) and Q7/Q10 boundary pages were not all detected in the text layer; ranges below are by page.

| Chunk ID | range | words | method | heading signal |
|---|---|---|---|---|
| architect-answers-pdf-01 | p1-7 | 3238 | text layer | Part 1 Q1-7: multi-tenant data models, deadlock-reduction patterns, computed vs materialized views, data retention and archival, authentication/authorization across services, service-to-service security, observability in the architecture |
| architect-answers-pdf-02 | p8-14 | 3316 | text layer | Part 1 Q8-15: secret rotation and zero-trust, Q9 (duplicate of Q6, expanded), documenting architecture, OLTP vs OLAP, surviving database failover, write contention, intentional denormalization, 100x traffic spikes |
| architect-answers-pdf-03 | p15-21 | 3149 | text layer | Part 1 Q16-23: Q17 avoiding single points of failure, eliminating shared state, rate limiting at API/service/infra levels, predictable horizontal scaling, multi-region workloads, managed services vs self-hosted, atomic updates in NoSQL |
| architect-answers-pdf-04 | p22-28 | 2604 | text layer | Part 2 Q1-7: Modulith vs monolith vs microservices, what Spring Modulith is, defining and detecting modules, module encapsulation, named interfaces, ApplicationModules.verify(), @ApplicationModuleTest |
| architect-answers-pdf-05 | p29-35 | 2383 | text layer | Part 2 Q8-13: cyclic dependency detection, inter-module communication (calls vs domain events), @ApplicationModuleListener vs @EventListener, Event Publication Registry, transactions across modules, database-per-module vs shared schema |
| architect-answers-pdf-06 | p36-42 | 2788 | text layer | Part 2 Q14-20: C4 diagram and module documentation generation, observability with Micrometer/Actuator, migrating a legacy monolith to a modulith (strangler fig), extracting a module into a microservice, signals to split a module, teams around modules, defending "no Kubernetes yet" |

References: java-backend-guide/_meta/PLANNING-PROMPT.md:102

## core-java-pdf: Core Java.pdf

- Facts: PDF, 350444 bytes, 30 pages, 7873 words (221 to 427 words per page, last page 34). Tracked, not ignored.
- Reading method: text layer.
- Structure: title "Core Java Interview Questions"; questions numbered "N)" from 1 to 219. Includes many legacy AWT/Swing/event-model questions and some repeated questions (for example transient variable, Collection/List interface, compilation unit).

| Chunk ID | range | words | method | heading signal |
|---|---|---|---|---|
| core-java-pdf-01 | p1-10 | 2902 | text layer | Q1-64: abstract class vs interface, checked/unchecked exceptions, user-defined exception, C++ vs Java, JAR, JNI, serialization, singleton, compilation unit, multiple inheritance, transient, Collection API, Iterator, synchronization, wrapper classes, GC, AWT layouts (BorderLayout/FlowLayout), thread blocking and states |
| core-java-pdf-02 | p11-20 | 2506 | text layer | Q65-146: thread states, anonymous classes, primitive ranges, finalization, run() vs start, operators, Locale, wait/notify, static vs non-static, locks, casting, Map interface, System class, AWT events and layouts, File class, rethrowing |
| core-java-pdf-03 | p21-30 | 2465 | text layer | Q147-219: default constructors, finally semantics, interrupt(), overloading and overriding restrictions, casting, main() signature, GC rules, I/O filter, Set, dead thread restart, abstract class final, numeric promotion, packages, synchronized methods and blocks, List interface; closing page 30 has 34 words |

References: java-backend-guide/_meta/PLANNING-PROMPT.md:102

## microservices-pdf: Microservice Architecture.pdf

- Facts: PDF, 905748 bytes, 22 pages, 2565 words (slide-style pages of 27 to 208 words; page 1 cover has 12 words). Tracked, not ignored.
- Reading method: text layer (low per-page counts reflect a slide layout, not images). Page header on each page: "Mohamed El Laithy, Content Creator".

| Chunk ID | range | words | method | heading signal |
|---|---|---|---|---|
| microservices-pdf-01 | p1-8 | 930 | text layer | Cover, Table of Content, 1 What are Microservices, 2 How do Microservices work (service registry/discovery), 4 Design Patterns for Microservices (incl. Circuit Breaker, Event Sourcing) |
| microservices-pdf-02 | p9-16 | 1139 | text layer | Bulkhead Pattern, 5 Anti-Patterns, 6 Real-World Example (Amazon e-commerce services), 7 Microservices vs Monolithic, 8 How to migrate from Monolithic, 9 SOA vs Microservices |
| microservices-pdf-03 | p17-22 | 496 | text layer | 10 Benefits and Challenges, 11 Real-World Examples of Companies, 12 Roadmap to understand Microservices (intro, designing, advanced topics), closing page |

References: java-backend-guide/_meta/PLANNING-PROMPT.md:102

## spring-data-jpa-pdf: SPRING DATA JPA Complete Interview Preparation Guide.pdf

- Facts: PDF, 187338 bytes, 22 pages, 4875 words (42 to 309 words per page; page 1 is a cover). Tracked, not ignored.
- Reading method: text layer. Footer: "Spring Data JPA Interview Guide, Page N". Questions are numbered Q1 to about Q55.

| Chunk ID | range | words | method | heading signal |
|---|---|---|---|---|
| spring-data-jpa-pdf-01 | p1-9 | 1959 | text layer | Cover, Table of Contents, Section 1 Introduction to Spring Data JPA, Section 2 JPA Entities and Annotations, Section 3 Entity Relationships (orphanRemoval), Section 4 Spring Data JPA Repositories (JPQL vs native SQL, @Modifying, @EntityGraph) |
| spring-data-jpa-pdf-02 | p10-17 | 1907 | text layer | Section 5 Transactions, Section 6 Entity Lifecycle and Caching (L1/L2 cache), Section 7 Auditing, Section 8 Criteria API and Specifications, Section 9 Projections and DTOs, Section 10 Inheritance Mapping, Section 11 Custom Repository Implementations, Section 12 Performance and Best Practices (save vs saveAndFlush, optimistic locking, @Lock), Section 13 Schema Management (Flyway), start of Section 14 Advanced Topics (QueryDSL, Spring Data REST) |
| spring-data-jpa-pdf-03 | p18-22 | 1009 | text layer | Rest of Section 14 (soft deletes, @NamedQuery vs @Query, batch inserts, @PersistenceContext), Section 15 Scenario-Based Questions (multi-tenancy, full-text search, merge vs persist), Quick Reference Cheat Sheet (repository hierarchy, annotations, query keywords, propagation, application.properties, N+1 quick fix) |

References: java-backend-guide/_meta/PLANNING-PROMPT.md:102

## spring-pdf: Spring.pdf

- Facts: PDF, 8612746 bytes, 24 pages, 853 words in the text layer. Tracked, not ignored.
- Reading method: needs: vision. Confirmed: words per page are 14, 41, 26, 35, 16, 33, 38, 47, 38, 34, 35, 35, 33, 32, 46, 44, 46, 23, 32, 41, 44, 61, 30, 29 (pages 1 to 24, maximum 61), and `pdfimages -list` shows each page carries full-page images (1 to 2 per page, 16 on p1, 10 on p24). Page 3 was rendered with `pdftoppm -r 60` and viewed: it is a slide-style PNG (brand "Bosscoder Academy") whose question and answer paragraphs are inside the image; the text layer holds only part of the question titles, some code fragments and the footer (URL and page number). All 24 pages are image-based; none is a pure text page. Pages 1, 2 and 24 are cover, disclaimer and promotional page (likely low value but included in the chunks).
- Heading signal available from the partial text layer (titles only, answers are images): Q1 role of Spring Boot in microservices, Q2 auto-configuration and its limits, Q3 actuator in production, Q5 starters, Q6 RESTful service, Q7 MySQL connection, Q10 custom Actuator endpoint, Q11-12 pagination and sorting, Q13 custom banner, Q15 scheduled tasks, Q16 Spring Security, Q17 caching, Q19 i18n, Q20 third-party library (Lombok), Q21 custom validator. Titles for Q4, Q8, Q9, Q14, Q18 are not in the text layer (code fragments seen for exception handling, Kafka properties, email service). Questions run Q1 to Q21.

| Chunk ID | range | words (text layer) | method | heading signal |
|---|---|---|---|---|
| spring-pdf-01 | p1-8 | 250 | needs: vision | Cover "Spring Boot Interview Questions", disclaimer, Q1-7 (Spring Boot in microservices, auto-configuration, actuator, starters, REST service, MySQL); Q4 and Q8 titles unavailable without vision |
| spring-pdf-02 | p9-16 | 297 | needs: vision | Q8/Q9 (exception handling code seen), Q10 custom Actuator endpoint, Q11-12 pagination and sorting, Q13 custom banner, Q14 (Kafka properties seen), Q15 scheduling, Q16 Spring Security |
| spring-pdf-03 | p17-24 | 306 | needs: vision | Q17 caching, Q18 (title unavailable without vision), Q19 i18n, Q20 Lombok integration, Q21 custom validator, closing promotional page "Why Bosscoder?" |

References: java-backend-guide/_meta/PLANNING-PROMPT.md:102, java-backend-guide/_meta/PLANNING-PROMPT.md:131

## system-design-pdf: System Design Crash Course - Substack.pdf

- Facts: PDF, 1665427 bytes, 32 pages, 5831 words. Tracked, not ignored.
- Reading method: text layer, with exceptions. Page 1 (0 words) is an image-only cover, page 5 (1 word) is an image-only "System Design Master Template" architecture diagram (viewed at low resolution; optional vision), page 3 (10 words) is an advertisement line. All other pages have at least 94 words.
- Structure from the table of contents (page 2): The System Design Master Template; sections 1 Load Balancer, 2 Data Partitioning, 3 Sharding, 4 CAP Theorem, 5 CDN, 6 Message Queue, 7 Message Broker, 8 API, 9 Replication, 10 Microservices Architecture, 11 SQL vs NoSQL, 12 Scalability, 13 Rate Limiting, 14 Reliability, 15 Availability, 16 Caching, 17 Latency vs Throughput, 18 Forward Proxy vs Reverse Proxy, 19 DNS, 20 Long Polling vs WebSockets, FAQs. Page numbers in that TOC do not match PDF page numbers.

| Chunk ID | range | words | method | heading signal |
|---|---|---|---|---|
| system-design-pdf-01 | p1-10 | 1286 | text layer (p1, p5 image-only) | Cover (image), Table of Contents, "System Design Crash Course", Master Template (p5 diagram), 1 Load Balancer, 2 Data Partitioning, 3 Sharding, 4 CAP Theorem |
| system-design-pdf-02 | p11-19 | 1749 | text layer | 5 CDN, 6 Message Queue, 7 Message Broker, 8 API, 9 Replication, 10 Microservices Architecture, 11 SQL vs NoSQL, Further Reading lists |
| system-design-pdf-03 | p20-27 | 1474 | text layer | 12 Scalability (horizontal vs vertical), 13 Rate Limiting, 14 Reliability, 15 Availability, 16 Caching (eviction), 17 Latency vs Throughput |
| system-design-pdf-04 | p28-32 | 1322 | text layer | 18 Forward Proxy vs Reverse Proxy, 19 DNS, 20 Long Polling vs WebSockets, API gateway vs load balancer, FAQs (Q: horizontal vs vertical scaling) |

References: java-backend-guide/_meta/PLANNING-PROMPT.md:102

## architect-md: Architect-Level Production & Architect.md

- Facts: Markdown, 148141 bytes, 846 lines, 23168 words. Tracked, not ignored.
- Reading method: text layer.
- Structure: `#` title plus `## Group A` to `## Group H` (Q1 to Q30 as `###`), an appendix and a drill section. Groups are chunk units; none exceeds 6000 words.

| Chunk ID | range | words | method | heading signal |
|---|---|---|---|---|
| architect-md-01 | lines 1-153 | 3501 | text layer | Title "Architect-Level Production & Architecture Study Plan"; Group A Transactions, Concurrency and Correctness: Q1 @Transactional failing without exception, Q2 duplicate records on retry, Q5 Kafka exactly-once, Q7 scheduled job on every pod, Q8 optimistic locking failures, Q16 JPA deadlocks |
| architect-md-02 | lines 154-257 | 2457 | text layer | Group B Saturation, Pools and Threading: Q4 HikariCP exhausted, Q3 collapse at 10,000 users, Q10 slow downstream, Q20 @Async blocking |
| architect-md-03 | lines 258-310 | 1225 | text layer | Group C Availability and Deploys: Q6 health checks pass but 503s, Q12 zero-downtime breaking schema change |
| architect-md-04 | lines 311-383 | 1852 | text layer | Group D JVM and Memory: Q11 GC latency spikes, Q13 multi-day memory leak, Q15 peak-hour OOM |
| architect-md-05 | lines 384-463 | 1908 | text layer | Group E Observability: Q9 cache hit ratio drop, Q14 intermittent failures without exceptions, Q17 distributed tracing |
| architect-md-06 | lines 464-515 | 1322 | text layer | Group F Write Amplification and Rate Control: Q18 DB write surge, Q19 rate limiter for burst traffic |
| architect-md-07 | lines 516-675 | 5586 | text layer | Group G Service-to-Service Communication and Resilience: Q21 how microservices communicate, Q22 REST vs broker, Q23 failing Service B, Q24 circuit breaker/retry/timeout, Q25 cross-service transaction, Q26 idempotent API |
| architect-md-08 | lines 676-821 | 4768 | text layer | Group H Delivery: Q27 Spring Boot container image, Q28 Kubernetes probes/resources/rollout, Q29 delivery pipeline, Q30 failing deploy |
| architect-md-09 | lines 822-846 | 549 | text layer | Appendix Cross-Cutting Mental Models to Internalize; How to drill this for interview readiness |

References:
- java-backend-guide/_meta/PLANNING-PROMPT.md:101
- Java Backend Interview Guide - Honeywell, Optum & Production Scenarios.md:7
- Backend Study Guide - Security, JPA, Design Patterns & Spring.md:1335
- angular-fullstack-guide/SOURCES.md:2474, 3207, 3235
- angular-fullstack-guide/SYLLABUS.md:546
- angular-fullstack-guide/_meta/modules/M38.md:127
- angular-fullstack-guide/_meta/modules/M46.md:3, 83
- angular-fullstack-guide/_meta/reviews/REVIEW-M46.md:13
- angular-fullstack-guide/modules/38-architecture-and-production-structure.md:848
- angular-fullstack-guide/modules/46-system-design-case-studies.md:77, 1077

## data-storage-md: Backend Interview Study Guide - Data storage, behavioral & concurrency.md

- Facts: Markdown, 60093 bytes, 528 lines, 9309 words. Tracked, not ignored.
- Reading method: text layer.
- Structure: `#` title, "How to use this", `# SESSION 1` (sections 1-4) and `# SESSION 2` (sections 5-10 plus Self-assessment). Session 1 is 5677 words (under the 6000 split threshold); the intro (296 words) is joined to it.

| Chunk ID | range | words | method | heading signal |
|---|---|---|---|---|
| data-storage-md-01 | lines 1-319 | 5973 | text layer | Title and "How to use this"; SESSION 1 The Tested Core: 1 Concurrency and the Java Memory Model (1.1-1.16: thread pool sizing, synchronized/volatile, HashMap races, deadlock, executor queues, backpressure, CompletableFuture, virtual threads, locks, false sharing, immutability), 2 JVM behavior and production troubleshooting (2.1-2.3), 3 Storage, durability and backup domain (3.1-3.11: resumable upload, dedup, corruption, erasure coding, SQLite, idempotency), 4 Databases at scale (4.1-4.6: sharding, composite index, isolation levels, locking) |
| data-storage-md-02 | lines 320-528 | 3336 | text layer | SESSION 2 The Differentiators: 5 Networking and protocols (5.1-5.4), 6 Observability and production operations (6.1-6.5), 7 System design (7.1-7.4), 8 AI-assisted development (8.1-8.3), 9 Behavioral (9.1-9.7), 10 Questions to ask them, Self-assessment |

References:
- java-backend-guide/_meta/PLANNING-PROMPT.md:101
- Java Backend Interview Guide - Honeywell, Optum & Production Scenarios.md:8
- angular-fullstack-guide/SOURCES.md:506, 3172, 3267
- angular-fullstack-guide/_meta/modules/M09.md:46
- angular-fullstack-guide/_meta/modules/M45.md:3, 79
- angular-fullstack-guide/_meta/modules/M47.md:13, 49, 143, 160
- angular-fullstack-guide/_meta/reviews/REVIEW-M47.md:15
- angular-fullstack-guide/modules/09-web-networking-storage-security.md:206
- angular-fullstack-guide/modules/45-frontend-system-design-method.md:41, 667
- angular-fullstack-guide/modules/47-behavioral-and-interview-craft.md:51, 130, 242, 418, 469, 547, 641, 659, 687, 720, 753, 808, 968, 995, 1201
- react-full-stack-interview-guide/27-interview-execution.md:9

## security-jpa-md: Backend Study Guide - Security, JPA, Design Patterns & Spring.md

- Facts: Markdown, 115816 bytes, 1478 lines, 14638 words. Tracked, not ignored.
- Reading method: text layer.
- Structure: `#` title, "Corrections and Assumptions", `# PART I` to `# PART V`, "Cross-Cutting Connections", "Final Rapid-Review Checklist". Part III is 4639 words (under the 6000 split threshold).

| Chunk ID | range | words | method | heading signal |
|---|---|---|---|---|
| security-jpa-md-01 | lines 1-74 | 1337 | text layer | Title, Corrections and Assumptions; PART I Web Application Security (OWASP): 1.1 What OWASP is, 1.2 OWASP Top 10 2021 edition, key terms, Part I summary |
| security-jpa-md-02 | lines 75-320 | 2830 | text layer | PART II Data Access with JPA: 2.1 Entity Relationship Annotations, 2.2 Query Methods (keyword reference table), 2.3 Specifications, 2.4 The N+1 Query Problem (how it happens, fixes, finding it), Part II summary |
| security-jpa-md-03 | lines 321-1140 | 4639 | text layer | PART III Design Patterns: 3.1 Creational (Singleton, Factory, Abstract Factory, Builder, Prototype), 3.2 Structural (Adapter, Composite, Proxy, Flyweight, Facade, Bridge, Decorator), 3.3 Behavioral (Template Method, Mediator, Chain of Responsibility, Observer, Strategy, Command, State, Visitor, Interpreter, Memento, Iterator), Part III summary |
| security-jpa-md-04 | lines 1141-1361 | 4067 | text layer | PART IV Spring Beans: 4.1 Bean Lifecycle, 4.2 Bean Scopes (mixing scopes), 4.3 Bean Specializations, 4.4 How Dependency Injection Resolves a Candidate (injection styles, circular dependencies), 4.5 @Transactional Through the Proxy (propagation, why it silently does nothing), Part IV summary |
| security-jpa-md-05 | lines 1362-1478 | 1765 | text layer | PART V Spring and Spring Boot Annotations: 5.1 Spring Framework annotations, 5.2 Spring Boot annotations, 5.3 What happens when @SpringBootApplication runs (startup sequence, debugging), Part V summary; Cross-Cutting Connections; Final Rapid-Review Checklist |

References:
- java-backend-guide/_meta/PLANNING-PROMPT.md:101
- Java Backend Interview Guide - Honeywell, Optum & Production Scenarios.md:9
- angular-fullstack-guide/SOURCES.md:1944
- angular-fullstack-guide/STYLE-GUIDE.md:225
- angular-fullstack-guide/_meta/modules/M09.md:46
- angular-fullstack-guide/_meta/modules/M21.md:87
- angular-fullstack-guide/_meta/modules/M33.md:30
- angular-fullstack-guide/_meta/modules/M42.md:37, 148
- angular-fullstack-guide/modules/21-change-detection.md:63, 926
- angular-fullstack-guide/modules/33-security.md:77, 1103
- angular-fullstack-guide/modules/38-architecture-and-production-structure.md:217
- angular-fullstack-guide/modules/42-fullstack-authentication.md:1108

## honeywell-optum-md: Java Backend Interview Guide - Honeywell, Optum & Production Scenarios.md

- Facts: Markdown, 11350 bytes, 140 lines, 2138 words. Tracked, not ignored.
- Reading method: text layer.
- Structure: the file contains only the title, an intro (audience, relationship to the other three Markdown guides, entry formats, source-list codes H/O/P), a table of contents of 12 planned sections (1 Java Core, 2 Collections, 3 Concurrency, 4 JVM and GC, 5 Spring Boot, 6 Microservices, 7 Kafka, 8 Databases, 9 REST and Security, 10 System Design and AWS, 11 Production Scenarios, 12 Coding Problems) and a coverage table (rows numbered 1.1 to 12.x with Source and Status columns). The section bodies themselves are not present in this file, only the table (read from source).

| Chunk ID | range | words | method | heading signal |
|---|---|---|---|---|
| honeywell-optum-md-01 | lines 1-140 | 2138 | text layer | Title; Table of contents (12 sections); Coverage table |

References:
- java-backend-guide/_meta/PLANNING-PROMPT.md:101

## Totals

- Total chunks: 47 (core-java-240: 8, architect-answers-pdf: 6, core-java-pdf: 3, microservices-pdf: 3, spring-data-jpa-pdf: 3, spring-pdf: 3, system-design-pdf: 4, architect-md: 9, data-storage-md: 2, security-jpa-md: 5, honeywell-optum-md: 1).
- Chunks needing vision: 3 (spring-pdf-01, spring-pdf-02, spring-pdf-03). Optional vision: page 5 diagram inside system-design-pdf-01.
- Unreadable chunks: 0 (unreadable is decided only after a vision attempt during EXTRACT).
- Total words (text layer): 107,169 across all sources; PDFs 57,916, Markdown 49,253 (Spring.pdf counts only 853 text-layer words, so its real content is larger).
- References found outside the sources themselves: only java-backend-guide/_meta/PLANNING-PROMPT.md (lines 101, 102, 131), plus the angular-fullstack-guide and react-full-stack-interview-guide files listed above, which link to the four Markdown guides. No PDF is referenced outside PLANNING-PROMPT.md. The Honeywell guide links to the other three Markdown guides, and Architect-Level and Backend Study Guide cross-reference each other as listed.

## Unreadable record

| Chunk | date | reason |
|---|---|---|
