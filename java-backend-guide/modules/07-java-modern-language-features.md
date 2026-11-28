# 07. Modern language features: Java 8 to 25

> **What this covers:** what changed in the Java language and platform from Java 8 to Java 25, and how to use it: the release model and preview features, `var` and `switch` expressions, sealed types, pattern matching for `instanceof` and `switch` with records, the newest final and preview features of Java 25, and the module system. Then the library changes an interviewer expects (`HttpClient` above all), date and time with `java.time` against the legacy `Date` and `Calendar`, and how to migrate a service from Java 8 to 25.
> **Prerequisites:** [02. Equality, immutability and records § 6. Records](02-java-equality-immutability-records.md#6-records), [05. Lambdas, streams and Optional § 1. Functional interfaces and lambda expressions](05-java-lambdas-streams-optional.md#1-functional-interfaces-and-lambda-expressions), [01. OOP fundamentals § 12. Enums](01-java-oop-fundamentals.md#12-enums)
> **Leads to:** [08. JVM memory and class loading](08-jvm-memory-and-class-loading.md), [14. Virtual threads](14-concurrency-virtual-threads.md), [20. Spring Boot auto-configuration and configuration](20-spring-boot-autoconfiguration-and-config.md)
> **Applies to:** Java 25
> **Study time:** ~6 hours reading + ~3 hours exercises
> **Short on time:** [3. Sealed classes and interfaces](#3-sealed-classes-and-interfaces), [5. Pattern matching for `switch`: guards, dominance, `null` and exhaustiveness](#5-pattern-matching-for-switch-guards-dominance-null-and-exhaustiveness), [7. The module system (JPMS)](#7-the-module-system-jpms), [9. Date and time: from `Date` and `Calendar` to `java.time`](#9-date-and-time-from-date-and-calendar-to-javatime); questions [Q07.01](#q07-01), [Q07.08](#q07-08), [Q07.12](#q07-12), [Q07.17](#q07-17), [Q07.23](#q07-23), [Q07.26](#q07-26); then [Summary](#summary).
> **Labs:** [`labs/java-language/`](../labs/java-language/), package `dev.interview.javalanguage.m07`. Run: `JAVA_HOME=$(/usr/libexec/java_home -v 25) mvn -q -f java-backend-guide/labs/pom.xml -pl java-language -am verify`. Needs Docker: no.

## Contents

1. [The release model: cadence, LTS and preview features](#1-the-release-model-cadence-lts-and-preview-features)
2. [`var` and `switch` expressions](#2-var-and-switch-expressions)
3. [Sealed classes and interfaces](#3-sealed-classes-and-interfaces)
4. [Pattern matching: `instanceof`, record patterns and unnamed patterns](#4-pattern-matching-instanceof-record-patterns-and-unnamed-patterns)
5. [Pattern matching for `switch`: guards, dominance, `null` and exhaustiveness](#5-pattern-matching-for-switch-guards-dominance-null-and-exhaustiveness)
6. [The newest language features: module imports and primitive patterns](#6-the-newest-language-features-module-imports-and-primitive-patterns)
7. [The module system (JPMS)](#7-the-module-system-jpms)
8. [`HttpClient` and the library changes worth knowing](#8-httpclient-and-the-library-changes-worth-knowing)
9. [Date and time: from `Date` and `Calendar` to `java.time`](#9-date-and-time-from-date-and-calendar-to-javatime)
10. [Migration paths from Java 8 to 25](#10-migration-paths-from-java-8-to-25)
- [Summary](#summary)
- [Question bank](#question-bank)
- [Hands-on exercises](#hands-on-exercises)
- [Check your understanding](#check-your-understanding)
- [Connections](#connections)

## 1. The release model: cadence, LTS and preview features
<!-- TASK: SEC-M07-01 -->
### The problem it solves
### Mental model
### How it actually works
### Code
### Failure modes and operations
### Best practices and anti-patterns
### Misconceptions and traps
<!-- /TASK: SEC-M07-01 -->

## 2. `var` and `switch` expressions
<!-- TASK: SEC-M07-02 -->
### The problem it solves
### Mental model
### How it actually works
### Code
### Failure modes and operations
### Best practices and anti-patterns
### Misconceptions and traps
<!-- /TASK: SEC-M07-02 -->

## 3. Sealed classes and interfaces
<!-- TASK: SEC-M07-03 -->
### The problem it solves
### Mental model
### How it actually works
### Code
### Failure modes and operations
### Best practices and anti-patterns
### Misconceptions and traps
<!-- /TASK: SEC-M07-03 -->

## 4. Pattern matching: `instanceof`, record patterns and unnamed patterns
<!-- TASK: SEC-M07-04 -->
### The problem it solves
### Mental model
### How it actually works
### Code
### Failure modes and operations
### Best practices and anti-patterns
### Misconceptions and traps
<!-- /TASK: SEC-M07-04 -->

## 5. Pattern matching for `switch`: guards, dominance, `null` and exhaustiveness
<!-- TASK: SEC-M07-05 -->
### The problem it solves
### Mental model
### How it actually works
### Code
### Failure modes and operations
### Best practices and anti-patterns
### Misconceptions and traps
<!-- /TASK: SEC-M07-05 -->

## 6. The newest language features: module imports and primitive patterns
<!-- TASK: SEC-M07-06 -->
### The problem it solves
### Mental model
### How it actually works
### Code
### Failure modes and operations
### Best practices and anti-patterns
### Misconceptions and traps
<!-- /TASK: SEC-M07-06 -->

## 7. The module system (JPMS)
<!-- TASK: SEC-M07-07 -->
### The problem it solves
### Mental model
### How it actually works
### Code
### Failure modes and operations
### Best practices and anti-patterns
### Misconceptions and traps
<!-- /TASK: SEC-M07-07 -->

## 8. `HttpClient` and the library changes worth knowing
<!-- TASK: SEC-M07-08 -->
### The problem it solves
### Mental model
### How it actually works
### Code
### Failure modes and operations
### Best practices and anti-patterns
### Misconceptions and traps
<!-- /TASK: SEC-M07-08 -->

## 9. Date and time: from `Date` and `Calendar` to `java.time`
<!-- TASK: SEC-M07-09 -->
### The problem it solves
### Mental model
### How it actually works
### Code
### Failure modes and operations
### Best practices and anti-patterns
### Misconceptions and traps
<!-- /TASK: SEC-M07-09 -->

## 10. Migration paths from Java 8 to 25
<!-- TASK: SEC-M07-10 -->
### The problem it solves
### Mental model
### How it actually works
### Code
### Failure modes and operations
### Best practices and anti-patterns
### Misconceptions and traps
<!-- /TASK: SEC-M07-10 -->

## Summary
<!-- TASK: CLOSE-M07 -->
<!-- /TASK: CLOSE-M07 -->

## Question bank

<!-- TASK: QB-M07-01 -->
<a id="q07-01"></a>
### Q07.01 · Concept · The Java release model: six-month feature releases, LTS, and what preview, incubator and experimental mean

<a id="q07-02"></a>
### Q07.02 · Output · A preview feature with and without `--enable-preview`: what does `javac` report, what does the class file record, and what does `java` say?

<a id="q07-03"></a>
### Q07.03 · Production scenario · After a JDK upgrade, a service built with `--enable-preview` no longer starts

<a id="q07-04"></a>
### Q07.04 · Concept · `var`: what it infers, where it is not allowed, and when it hurts readability

<a id="q07-05"></a>
### Q07.05 · Output · `switch` statement vs `switch` expression: fall-through, arrow labels, `yield`, and an enum switch without `default`

<a id="q07-06"></a>
### Q07.06 · Concept · Sealed classes and interfaces: `permits`, the `final`/`sealed`/`non-sealed` rule, where subclasses may live, and what the JVM enforces

<a id="q07-07"></a>
### Q07.07 · Bug hunt · Five sealed hierarchies: which compile, and why?
<!-- /TASK: QB-M07-01 -->

<!-- TASK: QB-M07-02 -->
<a id="q07-08"></a>
### Q07.08 · Design · Trade-off · Model a payment outcome as an algebraic data type: sealed interface, records and exhaustive `switch`, versus an enum, a class hierarchy with methods, and the visitor pattern

<a id="q07-09"></a>
### Q07.09 · Output · Pattern matching for `instanceof`: where is the binding in scope, and what happens with `null`?

<a id="q07-10"></a>
### Q07.10 · Concept · Record patterns, nested deconstruction, `var` in patterns, and unnamed variables and patterns

<a id="q07-11"></a>
### Q07.11 · Output · A pattern `switch` with guards, `case null` and overlapping types: which label runs, and which version does not compile?

<a id="q07-12"></a>
### Q07.12 · Concept · Exhaustiveness: when a `switch` must cover every case, how the compiler checks sealed types and record patterns, and how a pattern `switch` compiles

<a id="q07-13"></a>
### Q07.13 · Production scenario · `MatchException` in production after a dependency upgrade, in code that has not changed
<!-- /TASK: QB-M07-02 -->

<!-- TASK: QB-M07-03 -->
<a id="q07-14"></a>
### Q07.14 · Concept · Primitive types in patterns (preview in Java 25): what `case byte b` means for an `int`, and why it is not in production code

<a id="q07-15"></a>
### Q07.15 · Difference · `import module java.base;` vs `import java.util.*;`: what each imports, how ambiguities resolve, and where module imports belong

<a id="q07-16"></a>
### Q07.16 · Concept · `module-info.java`: `requires`, `requires transitive`, `exports`, `opens`, `uses` and `provides`, and what strong encapsulation means

<a id="q07-17"></a>
### Q07.17 · Difference · Output · `exports` vs `opens`: why a framework's reflection fails with `InaccessibleObjectException`, and what `--add-opens` changes

<a id="q07-18"></a>
### Q07.18 · Trade-off · Classpath vs module path in practice: the unnamed module, automatic modules, split packages, and why most Spring Boot services stay on the classpath

<a id="q07-19"></a>
### Q07.19 · Concept · `HttpClient`: synchronous and asynchronous calls, HTTP/2, timeouts and redirects, and why it replaced `HttpURLConnection`

<a id="q07-20"></a>
### Q07.20 · Production scenario · After the move to `HttpClient`, a status poller stops making progress and logs nothing
<!-- /TASK: QB-M07-03 -->

<!-- TASK: QB-M07-04 -->
<a id="q07-21"></a>
### Q07.21 · Concept · The library additions since Java 8 an interviewer expects you to know, and the exact `Math` methods

<a id="q07-22"></a>
### Q07.22 · Difference · `Date`, `Calendar`, `GregorianCalendar` and `TimeZone` vs `java.time`: what went wrong with the old API and what replaces each type

<a id="q07-23"></a>
### Q07.23 · Concept · Choosing a `java.time` type: `Instant`, `LocalDateTime`, `ZonedDateTime`, `OffsetDateTime`, `Duration` vs `Period`, and `Clock`

<a id="q07-24"></a>
### Q07.24 · Production scenario · Twice a year a nightly billing job runs twice, or not at all

<a id="q07-25"></a>
### Q07.25 · Production scenario · After the move from Java 11 to 17, the service fails at start-up with `InaccessibleObjectException`

<a id="q07-26"></a>
### Q07.26 · Design · Plan the upgrade of a Java 8 Spring Boot 2 service to Java 25: order, tools, removed APIs, and what is not a Java change
<!-- /TASK: QB-M07-04 -->

## Hands-on exercises

<!-- TASK: EX-M07-01 -->
<a id="ex07-1"></a>
### Exercise 07.1 · Replace a legacy billing calendar with `java.time`
<!-- /TASK: EX-M07-01 -->

<!-- TASK: EX-M07-02 -->
<a id="ex07-2"></a>
### Exercise 07.2 · An expression evaluator with sealed types and pattern `switch`
<!-- /TASK: EX-M07-02 -->

<!-- TASK: EX-M07-03 -->
<a id="ex07-3"></a>
### Exercise 07.3 · A modular plugin host
<!-- /TASK: EX-M07-03 -->

## Check your understanding
<!-- TASK: CLOSE-M07 -->
<!-- /TASK: CLOSE-M07 -->

## Connections
<!-- TASK: CLOSE-M07 -->
<!-- /TASK: CLOSE-M07 -->
