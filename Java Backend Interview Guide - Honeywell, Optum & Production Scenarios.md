# Java Backend Interview Guide — Honeywell, Optum & Production Scenarios

**Audience:** ~4 years backend (Java, Spring Boot, microservices, REST, PostgreSQL, Redis, AWS S3/SQS, Docker, some Angular), currently in fintech (FX, payments, loans). Preparing for Honeywell and Optum Java rounds and for "forget the definitions" production-scenario interviews.

**How this guide relates to the others in this repository.** Three guides already cover a lot of this ground in depth. This one does **not** repeat them. Where an existing guide already answers a question well, the entry here is a 2–3 sentence spoken answer plus a link to the exact section (**Linked**). Where an existing guide covers part of it, this guide writes only the missing part and links to the rest (**Extended**). Everything else is written in full (**New**).

- [Architect-Level Production & Architect.md](Architect-Level%20Production%20%26%20Architect.md) — referred to below as **Architect guide**
- [Backend Interview Study Guide - Data storage, behavioral & concurrency.md](Backend%20Interview%20Study%20Guide%20-%20Data%20storage%2C%20behavioral%20%26%20concurrency.md) — **Data/Concurrency guide**
- [Backend Study Guide - Security, JPA, Design Patterns & Spring.md](Backend%20Study%20Guide%20-%20Security%2C%20JPA%2C%20Design%20Patterns%20%26%20Spring.md) — **Spring guide**

**Entry formats.**
- *Conceptual question:* **Interview answer (30–60s)** → **Depth** → **Common mistakes / traps** → **Likely follow-ups**.
- *Production scenario:* **First 5 minutes** → **Hypotheses → evidence → tool** → **Fix** (mitigation vs root cause) → **Prevention** → **How to frame it with my experience** (a *template* to personalize — never a claim about something that happened).
- *Coding problem:* mental approach → step-by-step → Java 17+ code → complexity → edge cases → how to talk through it.

**⚠️ Premise check** at the top of an entry means the source question is outdated or wrong as asked; the entry answers the corrected question.

**Source-list codes used in the coverage table:** **H** = Honeywell list, **O*n*** = Optum question *n*, **P*n*** = production-scenario question *n*.

---

## Table of contents

1. [Java Core & Language Internals](#1-java-core--language-internals)
2. [Collections Internals](#2-collections-internals)
3. [Concurrency, Multithreading & the Java Memory Model](#3-concurrency-multithreading--the-java-memory-model)
4. [JVM, Memory & Garbage Collection](#4-jvm-memory--garbage-collection)
5. [Spring Boot & Spring Internals](#5-spring-boot--spring-internals)
6. [Microservices & Resilience](#6-microservices--resilience)
7. [Kafka & Messaging](#7-kafka--messaging)
8. [Databases & SQL](#8-databases--sql)
9. [REST & Security](#9-rest--security)
10. [System Design & AWS](#10-system-design--aws)
11. [Production Scenarios (troubleshooting playbooks)](#11-production-scenarios-troubleshooting-playbooks)
12. [Coding Problems](#12-coding-problems)

---

## Coverage table

| # | Question (merged phrasings) | Source | Section | Status |
|---|---|---|---|---|
| 1.1 | JVM vs JRE vs JDK | H | 1 | New |
| 1.2 | String Pool; `==` vs `.equals()`; how `intern()` works; `new String("abc")` vs `"abc"` in memory | H, H, O1 | 1 | New |
| 1.3 | Why String is immutable; how to implement immutability | H, O2 | 1 | Extended — Data/Concurrency §1.13 |
| 1.4 | Comparable vs Comparator | H | 1 | New |
| 1.5 | Java 8 Streams and Lambdas; why functional interfaces can't have multiple abstract methods ⚠️ | H, O5 | 1 | New |
| 1.6 | Diamond problem with default methods | O4 | 1 | New |
| 1.7 | How `var` infers types at compile time ⚠️ | O7 | 1 | New |
| 1.8 | Correct use and common misuse of `Optional` | O8 | 1 | New |
| 1.9 | Autoboxing/unboxing performance problems in production | O6 | 1 | New |
| 1.10 | How Reflection works and its performance trade-offs | O9 | 1 | New |
| 1.11 | Exception chaining (`cause`) for production debugging | O22 | 1 | New |
| 1.12 | A production example of a Liskov Substitution violation | O10 | 1 | New |
| 1.13 | Inheritance instead of composition broke the design | O11 | 1 | New |
| 2.1 | HashMap internals after Java 8 (treeify, red-black tree); resize/rehash cost and how to avoid it | O12, O14 | 2 | New |
| 2.2 | HashMap vs ConcurrentHashMap; CHM locking "segments vs CAS" ⚠️; multiple threads on a HashMap | H, O13, P1 | 2 | Extended — Data/Concurrency §1.4 |
| 2.3 | ArrayList vs LinkedList | H | 2 | New |
| 2.4 | CopyOnWriteArrayList: when, and memory overhead | O15 | 2 | New |
| 2.5 | WeakHashMap and IdentityHashMap use cases | O16 | 2 | New |
| 3.1 | Process vs Thread | H | 3 | New |
| 3.2 | `volatile` vs `synchronized`; happens-before in the JMM | H, O21 | 3 | Extended — Data/Concurrency §1.2, §1.3 |
| 3.3 | Race condition | H | 3 | Extended — Data/Concurrency §1.2 |
| 3.4 | Deadlock, and how to identify it in production | H | 3 | Linked — Data/Concurrency §1.5 |
| 3.5 | ExecutorService | H | 3 | Extended — Data/Concurrency §1.1, §1.6 |
| 3.6 | `wait()` vs `sleep()` vs `join()` | H | 3 | New |
| 3.7 | ForkJoinPool vs a normal ExecutorService (work stealing) ⚠️ | O17 | 3 | New |
| 3.8 | How ThreadLocal causes memory leaks | O18 | 3 | Extended — Architect Q13 |
| 3.9 | `thenApply` vs `thenCompose` vs `thenCombine` | O19 | 3 | Extended — Data/Concurrency §1.8 |
| 3.10 | Semaphore for connection pooling ⚠️ | O20 | 3 | New |
| 4.1 | Memory for `static`, `final`, `static final` variables ⚠️ (plus JVM memory areas) | O3 | 4 | New |
| 4.2 | Garbage collection | H | 4 | Extended — Data/Concurrency §2.2 |
| 4.3 | How G1 works and "why it is better than CMS" for large heaps ⚠️ | O27 | 4 | Extended — Data/Concurrency §2.2, Architect Q11 |
| 4.4 | Detecting a memory leak with heap-dump tools | O29 | 4 | Linked — Data/Concurrency §2.1, Architect Q13 |
| 5.1 | Dependency Injection; constructor vs field injection | H, H | 5 | Linked — Spring §4.4 |
| 5.2 | Bean lifecycle, all phases up to BeanPostProcessor | H, O23 | 5 | Linked — Spring §4.1 |
| 5.3 | `@Component` vs `@Service` vs `@Repository` | H | 5 | Linked — Spring §4.3 |
| 5.4 | How auto-configuration works | H | 5 | Linked — Spring §5.3 |
| 5.5 | `@Transactional` | H | 5 | Linked — Spring §4.5, Architect Q1 |
| 5.6 | How Spring resolves circular dependencies and when it fails; a circular dependency appears after deployment | O24, P7 | 5 | Extended — Spring §4.4 |
| 5.7 | Global exception handling | H | 5 | New |
| 5.8 | How the Spring Security filter chain processes a request | O25 | 5 | New |
| 5.9 | Spring Boot Actuator for production monitoring | O26 | 5 | New |
| 5.10 | Hibernate N+1: detecting and fixing it in production | O28 | 5 | Extended — Spring §2.4 |
| 6.1 | Microservices vs monolith | H | 6 | New |
| 6.2 | Service discovery and API gateway | H | 6 | Extended — Architect Q21 |
| 6.3 | How microservices communicate; REST vs Kafka vs gRPC | H, P15 | 6 | Extended — Architect Q21, Q22 |
| 6.4 | Circuit breaker | H | 6 | Linked — Architect Q24 |
| 6.5 | How to secure microservices | H | 6 | New |
| 7.1 | Consumer processes the same message twice | P16 | 7 | Extended — Architect Q5 |
| 7.2 | One partition receives far more traffic | P17 | 7 | New |
| — | Q18 — missing in the source list (numbering skips it); not invented | P18 | 7 | — |
| 7.3 | A message fails repeatedly | P19 | 7 | Extended — Data/Concurrency §7.3 |
| 7.4 | Guarantee ordering per customer | P20 | 7 | Extended — Architect Q22 |
| 8.1 | INNER JOIN vs LEFT JOIN | H | 8 | New |
| 8.2 | Indexes | H | 8 | Extended — Data/Concurrency §4.2 |
| 8.3 | `COUNT(*)` vs `COUNT(1)` vs `COUNT(column)` ⚠️ | H | 8 | New |
| 8.4 | ACID | H | 8 | Extended — Data/Concurrency §4.3 |
| 8.5 | Normalization | H | 8 | New |
| 8.6 | A table with hundreds of millions of rows | P24 | 8 | Extended — Data/Concurrency §4.1 |
| 9.1 | PUT vs PATCH | H | 9 | Extended — Architect Q26 |
| 9.2 | Authentication vs authorization | H | 9 | New |
| 9.3 | JWT; stateless vs stateful authentication | H, H | 9 | New |
| 9.4 | CORS | H | 9 | New |
| 10.1 | A service receives 100K requests/**sec**; an API gets 100,000 requests/**minute** — scale it ⚠️ | H, P26 | 10 | Extended — Architect Q3 |
| 10.2 | Design a URL shortener | H | 10 | New |
| 10.3 | Rate limiting against abuse | P27 | 10 | Linked — Architect Q19, Data/Concurrency §7.2 |
| 10.4 | Redis crashes — how should the app behave | P28 | 10 | New |
| 10.5 | EC2 access to S3 without stored credentials | P29 | 10 | New |
| 11.1 | Latency went from 100ms to 5s without a deployment | H | 11 | New |
| 11.2 | API works in staging but fails in production | H | 11 | New |
| 11.3 | A race condition causes duplicate payments; the same payment is processed twice | P2, P12 | 11 | Extended — Architect Q2, Q26 |
| 11.4 | Multiple threads update the same record; two transactions update the same row; optimistic vs pessimistic for inventory | P5, P23, P25 | 11 | Extended — Data/Concurrency §4.4, Architect Q8 |
| 11.5 | Thousands of threads are created and CPU spikes | P3 | 11 | New |
| 11.6 | A REST API takes 30s because of 3 downstream calls | P4 | 11 | New |
| 11.7 | Startup went from 15s to 2 minutes | P6 | 11 | New |
| 11.8 | Works locally, `LazyInitializationException` in production | P8 | 11 | Extended — Spring §2.4, Architect Q4 |
| 11.9 | Transaction partially updates data although rollback was expected | P9 | 11 | Linked — Architect Q1, Spring §4.5 |
| 11.10 | Sudden OutOfMemoryError | P10 | 11 | Linked — Architect Q15, Q13 |
| 11.11 | A → B → C and C is down: prevent cascading failure; one slow service affects the whole system | P11, P13 | 11 | Linked — Architect Q10, Q24 |
| 11.12 | Trace a request across 15 services | P14 | 11 | Linked — Architect Q17 |
| 11.13 | Optimizing a slow query; a query went from 50ms to 10s | H, P21 | 11 | Extended — Data/Concurrency §4.5 |
| 11.14 | Database CPU at 100% at peak | P22 | 11 | New |
| 11.15 | A deployment increases latency: find the root cause and roll back safely | P30 | 11 | Extended — Architect Q30 |
| 12.1 | Reverse a String without built-in methods | H | 12 | New |
| 12.2 | Find duplicate elements in an array | H | 12 | New |
| 12.3 | Check whether a String is a palindrome | H | 12 | New |
| 12.4 | First non-repeating character | H | 12 | New |
| 12.5 | Detect a cycle in a linked list | H | 12 | New |
| 12.6 | Top K frequent elements | H | 12 | New |
| 12.7 | LRU Cache | H | 12 | New |
| 12.8 | Producer–Consumer | H | 12 | New |

**Totals:** 89 entries covering 108 source phrasings (a 109th, P18, does not exist in the source). New 50 · Extended 26 · Linked 13.

**Premise checks (⚠️) in this guide:** ConcurrentHashMap segments vs CAS (2.2) · G1 "better than CMS" (4.3) · functional interfaces and "multiple abstract methods" (1.5) · `COUNT(*)` vs `COUNT(1)` (8.3) · PermGen and `static`/`final` memory (4.1) · `var` (1.7) · missing P18 (7) · merged String-immutability questions (1.3) · ForkJoinPool *is* an ExecutorService (3.7) · Semaphore is a limiter, not a pool (3.10) · 100K req/**s** vs 100K req/**min** are a 60× different problem (10.1).

---

<!-- SECTIONS BELOW ARE WRITTEN IN STAGE 2 -->
