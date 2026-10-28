# VERSIONS

The versions this guide is written against. Checked on 2026-10-25 by session S20261025-0027-claudecode.

Rule: a later session that finds a newer version adds a new dated row. It never silently changes a version used by existing content.

Method: Maven artifacts were read from `https://repo1.maven.org/maven2/<group>/<artifact>/maven-metadata.xml` (newest non-milestone/RC/SNAPSHOT). The "Released" column for Maven artifacts is the Maven Central upload date (HTTP `Last-Modified` of the POM), which can be a day or so after the upstream announcement. Boot-managed versions were read from `https://repo1.maven.org/maven2/org/springframework/boot/spring-boot-dependencies/4.1.2/spring-boot-dependencies-4.1.2.pom`. Everything marked "(eol.date)" comes from endoflife.date as a cross-check because the vendor page was not retrievable (see Open items).

Chosen Spring Boot line for labs: **4.1.2** (current GA, 2026-10-22). Spring Boot 4.2.0-RC1 exists on Maven Central (2026-10-22) but is a release candidate and is not used.

## Status vocabulary

### Java (JEP statuses)
- Preview feature: fully specified and implemented but impermanent; off by default, needs `--enable-preview`; may become final or be removed. Source: https://openjdk.org/jeps/12
- Incubator module/API: lives in `jdk.incubator.*`, not part of Java SE. Source: https://openjdk.org/jeps/12
- Experimental: early low-level HotSpot features unlocked explicitly at run time (`-XX:+UnlockExperimentalVMOptions`); also used for JFR "Experimental" features. Source: https://openjdk.org/jeps/12
- Deprecated: `@Deprecated`; deprecated for removal: `@Deprecated(forRemoval=true)` ("terminally deprecated", emits removal warnings); removed: gone from the release (e.g. JEP 504 Remove the Applet API, JDK 26). Sources: https://openjdk.org/jeps/12 , https://openjdk.org/projects/jdk/26/
- JEP page Status field: "Closed / Delivered" plus a Release field = final in that release (e.g. https://openjdk.org/jeps/444).

### Spring
- GA = general availability (e.g. 4.1.2); M# = milestone; RC# = release candidate; SNAPSHOT = nightly. Only GA is used by the guide. Deprecated APIs are kept and marked where feasible; minor/major releases may break APIs. Source: https://github.com/spring-projects/spring-boot/wiki/Supported-Versions
- Support: OSS vs commercial windows per minor. Source: https://spring.io/projects/spring-boot#support

### OpenTelemetry
- Signal lifecycle: Development (formerly Experimental), Stable, Deprecated, Removed. "alpha/beta/rc/development" are only version-suffix naming conventions, not lifecycle levels. Source: https://opentelemetry.io/docs/specs/otel/versioning-and-stability/
- Semantic convention document status badges: Stable, Release Candidate, Development, Mixed. Source: https://github.com/open-telemetry/semantic-conventions (docs/*/README.md at v1.44.0)

### Jenkins
- LTS (Long-Term Support) line: baseline chosen every 12 weeks, three point releases X.1-X.3, only important bug/security backports. Weekly: every change, numbered 2.N. Source: https://www.jenkins.io/download/lts/
- Plugin deprecation/adoption flags are shown on https://plugins.jenkins.io/ (none reported by the plugin API for the four plugins below, `deprecations` field empty).

## Version table

Latest = newest GA found on 2026-10-25. "Managed by Boot 4.1.2" = value in `spring-boot-dependencies` 4.1.2 (blank = not managed / not a Boot dependency key).

| Component | Version (latest stable) | Managed by Boot 4.1.2 | Released | Support / EOL policy | Source |
|---|---|---|---|---|---|
| Java LTS (Oracle JDK 25 / Temurin 25) | 25 (25.0.5 Oracle / 25.0.5+8 Temurin) | n/a (Boot 4.1 supports Java 17-26 per eol.date) | GA 2025-09-16; 25.0.5 2026-10-21 | Oracle 25: premier Sept 2030, extended Sept 2033 (Oracle roadmap, checked 2026-10-25); Temurin 25: available at least to Sep 2031 (adoptium.net/support, checked 2026-10-25) | https://openjdk.org/projects/jdk/ ; https://www.oracle.com/java/technologies/java-se-support-roadmap.html ; https://adoptium.net/support/ ; https://endoflife.date/api/eclipse-temurin.json |
| Java latest feature release | 27 (27.0.1) | not in Boot 4.1 supported range 17-26 | GA 2026-09-15 | Non-LTS; Oracle premier support to March 2027, no extended support (Oracle roadmap, checked 2026-10-25); Temurin 27 to Mar 2027 (adoptium.net/support) | https://openjdk.org/projects/jdk/27/ |
| Previous LTS still in use | 21 (GA 2023-09-19), 17 (GA 2021-09-14) | | | see Support policies | https://openjdk.org/projects/jdk/ |
| Spring Boot | 4.1.2 | n/a | 2026-10-22 (4.1.0 GA 2026-06-30 per api.spring.io generations) | OSS to 2027-07-31, commercial to 2028-07-31 (api.spring.io generations, checked 2026-10-25) | https://api.spring.io/projects/spring-boot/generations ; https://spring.io/projects/spring-boot#support ; https://endoflife.date/api/spring-boot.json ; https://repo1.maven.org/maven2/org/springframework/boot/spring-boot/maven-metadata.xml |
| Spring Boot previous GA line | 4.0.9 (OSS to 2026-12-31, commercial 2027-12-31); 3.5.16 (OSS ended 2026-06-30, commercial to 2032-06-30); both from api.spring.io generations, checked 2026-10-25 | | 4.0.9 2026-10-22 | | https://endoflife.date/api/spring-boot.json |
| Spring Framework | 7.0.10 | 7.0.10 | 2026-10-22 | 7.0 line: OSS to 2027-07-31, commercial 2028-07-31 (api.spring.io generations, checked 2026-10-25). 7.1.0-RC1 exists, not GA | https://api.spring.io/projects/spring-framework/generations ; https://repo1.maven.org/maven2/org/springframework/spring-core/maven-metadata.xml |
| Spring Security | 7.1.2 | 7.1.2 | 2026-10-22 | 7.1: OSS to 2027-07-31, commercial 2028-07-31 (api.spring.io generations, checked 2026-10-25). 7.2.0-RC1 exists, not GA | https://api.spring.io/projects/spring-security/generations ; https://repo1.maven.org/maven2/org/springframework/security/spring-security-core/maven-metadata.xml |
| Spring Data release train | 2026.0.2 (`spring-data-bom`) | 2026.0.2 | 2026-10-22 | follows Boot/Framework window; 2026.1.0-RC1 exists, not GA | https://repo1.maven.org/maven2/org/springframework/data/spring-data-bom/maven-metadata.xml |
| Spring Data JPA | 4.1.2 | via train 2026.0.2 | 2026-10-22 | as above | https://repo1.maven.org/maven2/org/springframework/data/spring-data-jpa/maven-metadata.xml |
| Spring for Apache Kafka | 4.1.2 | 4.1.2 | 2026-10-22 | as above | https://repo1.maven.org/maven2/org/springframework/kafka/spring-kafka/maven-metadata.xml |
| Spring for GraphQL | 2.0.6 | 2.0.6 | 2026-10-22 | as above; 2.1.0-RC1 exists, not GA | https://repo1.maven.org/maven2/org/springframework/graphql/spring-graphql/maven-metadata.xml |
| grpc-java | 1.85.1 | not managed | 2026-10-20 | UNVERIFIED (no policy page read) | https://repo1.maven.org/maven2/io/grpc/grpc-core/maven-metadata.xml |
| Spring gRPC (`org.springframework.grpc`) | 1.1.2 | 1.1.2 (`spring-grpc.version`) | 2026-10-22 | UNVERIFIED | https://repo1.maven.org/maven2/org/springframework/grpc/spring-grpc-core/maven-metadata.xml |
| Hibernate ORM (`hibernate-core`) | 7.4.14.Final | 7.4.13.Final | 2026-10-25 (Central upload) | UNVERIFIED (8.0.0.Beta3 exists, not stable) | https://repo1.maven.org/maven2/org/hibernate/orm/hibernate-core/maven-metadata.xml |
| PostgreSQL server | 18 (18.6) | n/a | 18.0 2025-09-25; 18.6 2026-08-11 | 5 years from first release; 18 EOL 2030-11-14; 17 EOL 2029-11-08; 14 EOL 2026-11-12 | https://www.postgresql.org/support/versioning/ |
| PostgreSQL JDBC (`org.postgresql:postgresql`) | 42.7.14 | 42.7.14 | 2026-10-07 | UNVERIFIED | https://repo1.maven.org/maven2/org/postgresql/postgresql/maven-metadata.xml |
| Redis open source | 8.10.2 (GitHub latest release; no 9.x tag in github.com/redis/redis as of 2026-10-25; endoflife.date also lists 8.10 as the newest cycle) | n/a | 8.10.2 2026-09-17 (security release); 8.10.0 2026-07-29 | Support dates not read from a vendor page. Licence: 8.0 and later tri-licensed RSALv2 / SSPLv1 / AGPLv3 at the user's option (LICENSE.txt at tag 8.10.2); 7.4-7.8 RSALv2 or SSPLv1; 7.2 and earlier BSD-3 (README at 8.10.2) | https://github.com/redis/redis/releases ; https://raw.githubusercontent.com/redis/redis/8.10.2/LICENSE.txt ; https://redis.io/blog/agplv3/ |
| Lettuce (`lettuce-core`) | 7.9.0.RELEASE (8.0.0.BETA1 exists, not stable) | 7.5.2.RELEASE | 2026-10-14 | UNVERIFIED | https://repo1.maven.org/maven2/io/lettuce/lettuce-core/maven-metadata.xml |
| MongoDB server | 9.0 (9.0.4) | n/a | 9.0.4 2026-10-14 | 9.0 EOL 2031-10-31 (eol.date). Previous: 8.3, 8.0, 7.0 | https://www.mongodb.com/docs/manual/release-notes/ ; https://endoflife.date/api/mongodb.json |
| MongoDB Java driver (`mongodb-driver-sync`) | 5.13.0 | 5.8.1 (`mongodb.version`) | 2026-09-25 | UNVERIFIED | https://repo1.maven.org/maven2/org/mongodb/mongodb-driver-sync/maven-metadata.xml |
| Apache Cassandra | 5.0.9 (6.0-alpha2 exists, not stable) | n/a | 5.0.9 2026-08-07 | UNVERIFIED (eol.date shows 5.0 not EOL) | https://repo1.maven.org/maven2/org/apache/cassandra/cassandra-all/maven-metadata.xml ; https://endoflife.date/api/apache-cassandra.json |
| Cassandra Java driver (`java-driver-core`) | 4.19.4 | 4.19.4 (`cassandra-driver.version`) | 2026-09-25 | UNVERIFIED | https://repo1.maven.org/maven2/org/apache/cassandra/java-driver-core/maven-metadata.xml |
| Apache Kafka (broker + `kafka-clients`) | 4.4.0 | 4.2.2 (`kafka.version`) | 2026-10-06 | UNVERIFIED | https://repo1.maven.org/maven2/org/apache/kafka/kafka-clients/maven-metadata.xml |
| Kafka Streams (`kafka-streams`) | 4.4.0 | 4.2.2 (same `kafka.version`) | 2026-10-06 | UNVERIFIED | https://repo1.maven.org/maven2/org/apache/kafka/kafka-streams/maven-metadata.xml |
| RabbitMQ (comparison only) | 4.4.0 | n/a | 2026-10-19 (GitHub release) | 4.3 shown with extended support to 2030-06-30; 4.2 EOL 2026-07-31 (eol.date) | https://github.com/rabbitmq/rabbitmq-server/releases ; https://endoflife.date/api/rabbitmq.json |
| Resilience4j | 2.4.0 | not managed | 2026-03-14 | UNVERIFIED | https://repo1.maven.org/maven2/io/github/resilience4j/resilience4j-core/maven-metadata.xml |
| Micrometer | 1.17.2 | 1.17.2 | 2026-10-22 | UNVERIFIED (1.18.0-RC1 exists, not GA) | https://repo1.maven.org/maven2/io/micrometer/micrometer-core/maven-metadata.xml |
| Micrometer Tracing | 1.7.2 | 1.7.2 | 2026-10-22 | UNVERIFIED (1.8.0-RC1 exists, not GA) | https://repo1.maven.org/maven2/io/micrometer/micrometer-tracing/maven-metadata.xml |
| OpenTelemetry Java API/SDK (`opentelemetry-api`) | 1.67.0 | 1.62.0 (`opentelemetry.version`) | 2026-10-09 | Stable APIs per signal, see feature notes | https://github.com/open-telemetry/opentelemetry-java/releases ; https://repo1.maven.org/maven2/io/opentelemetry/opentelemetry-api/maven-metadata.xml |
| OpenTelemetry Java agent (`opentelemetry-javaagent`) | 2.33.0 | not managed | 2026-10-23 | | https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases |
| OTel Spring Boot starter (`opentelemetry-spring-boot-starter`) | 2.33.0 | not managed | 2026-10-23 | | https://repo1.maven.org/maven2/io/opentelemetry/instrumentation/opentelemetry-spring-boot-starter/maven-metadata.xml |
| OpenTelemetry Collector (core) | v0.163.0 | n/a | 2026-10-14 | pre-1.0 (0.x) distribution | https://github.com/open-telemetry/opentelemetry-collector/releases |
| OpenTelemetry Collector contrib | v0.163.0 | n/a | 2026-10-14 | pre-1.0 (0.x) | https://github.com/open-telemetry/opentelemetry-collector-contrib/releases |
| OTel semantic conventions | 1.44.0 | n/a | 2026-08-04 | see feature notes | https://github.com/open-telemetry/semantic-conventions/releases |
| OTel specification | 1.62.0 | n/a | 2026-10-22 | | https://github.com/open-telemetry/opentelemetry-specification/releases |
| JUnit (Jupiter/Platform) | 6.1.3 | 6.0.3 (`junit-jupiter.version`) | 2026-08-07 | UNVERIFIED | https://repo1.maven.org/maven2/org/junit/jupiter/junit-jupiter/maven-metadata.xml |
| Mockito (`mockito-core`) | 5.24.0 | 5.23.0 | 2026-09-23 | UNVERIFIED | https://repo1.maven.org/maven2/org/mockito/mockito-core/maven-metadata.xml |
| Testcontainers (`testcontainers`, 2.x modules e.g. `testcontainers-junit-jupiter`) | 2.0.5 | 2.0.5 | 2026-04-20 | UNVERIFIED. Note: 1.21.4 is the last 1.x (`org.testcontainers:junit-jupiter`) | https://repo1.maven.org/maven2/org/testcontainers/testcontainers/maven-metadata.xml |
| Apache Maven | 3.10.0 (current; 3.9.16 previous stable) | n/a | 2026-10-01 | Maven 4: 4.0.0-rc-7 release candidate, "NOT safe for production" | https://maven.apache.org/download.cgi |
| MapStruct | 1.6.3 (1.7.0.Beta2 exists, not stable) | not managed | 1.6.3 2024-11-09 (Central upload) | UNVERIFIED | https://repo1.maven.org/maven2/org/mapstruct/mapstruct/maven-metadata.xml |
| spotless-maven-plugin | 3.10.4 | not managed | 2026-10-08 | | https://repo1.maven.org/maven2/com/diffplug/spotless/spotless-maven-plugin/maven-metadata.xml |
| google-java-format | 1.37.0 | n/a | 2026-10-01 | | https://repo1.maven.org/maven2/com/google/googlejavaformat/google-java-format/maven-metadata.xml |
| palantir-java-format | 2.102.0 | n/a | 2026-10-05 | | https://repo1.maven.org/maven2/com/palantir/javaformat/palantir-java-format/maven-metadata.xml |
| Jenkins LTS | 2.580.1 | n/a | 2026-09-30 (build date in update center) | New LTS baseline every 12 weeks, 3 point releases (X.1-X.3) each 4 weeks; weekly line currently 2.587 (2026-10-20) | https://updates.jenkins.io/stable/latestCore.txt (redirects to dynamic-stable-2.580.1) ; https://www.jenkins.io/download/lts/ |
| Jenkins plugin: Pipeline (`workflow-aggregator`) | 608.v67378e9d3db_1 | n/a | 2025-03-19 | requires core 2.479.3 | https://plugins.jenkins.io/workflow-aggregator/ |
| Jenkins plugin: Kubernetes | 4560.vc25b_83890c34 | n/a | 2026-10-08 | requires core 2.516.3 | https://plugins.jenkins.io/kubernetes/ |
| Jenkins plugin: Credentials Binding | 728.v902a_273b_8947 | n/a | 2026-07-09 | requires core 2.479.3 | https://plugins.jenkins.io/credentials-binding/ |
| Jenkins plugin: Configuration as Code | 2136.veb_3a_554550b_f | n/a | 2026-10-13 | requires core 2.541.1 | https://plugins.jenkins.io/configuration-as-code/ |
| Gradle (comparison) | 9.8.2 | n/a | 2026-10-19 | UNVERIFIED | https://github.com/gradle/gradle/releases ; https://endoflife.date/api/gradle.json |
| Docker Engine (comparison) | 29.9.2 | n/a | 2026-10-20 | 28 EOL 2026-05-13 (eol.date) | https://github.com/moby/moby/releases ; https://endoflife.date/api/docker-engine.json |
| jcstress (`jcstress-core`) | 0.16 | n/a | 2023-02-27 (Central upload) | Only 0.16 on Central; no newer release published | https://repo1.maven.org/maven2/org/openjdk/jcstress/jcstress-core/maven-metadata.xml |
| Flyway (`flyway-core`) | 13.11.1 | 12.4.0 (`flyway.version`) | 2026-10-21 | UNVERIFIED | https://repo1.maven.org/maven2/org/flywaydb/flyway-core/maven-metadata.xml |
| Liquibase (`liquibase-core`) | 5.0.4 | 5.0.4 | 2026-08-20 | UNVERIFIED | https://repo1.maven.org/maven2/org/liquibase/liquibase-core/maven-metadata.xml |

## Support policies

- Java: a feature release every 6 months (March, September); an LTS every 2 years, currently 17, 21, 25 (next LTS is not read from a source; do not assume). Non-LTS releases get about 6 months of updates (JDK 27 Oracle premier support to March 2027). Oracle premier / extended support: 17 Sept 2026 / Sept 2029; 21 Sept 2028 / Sept 2031; 25 Sept 2030 / Sept 2033. Temurin end of availability: 17 at least Oct 2027; 21 at least Dec 2029; 25 at least Sep 2031. Sources (checked 2026-10-25): https://openjdk.org/projects/jdk/ ; https://www.oracle.com/java/technologies/java-se-support-roadmap.html ; https://adoptium.net/support/ .
- Spring Boot: new minor roughly every 6 months (May and November target); minor versions get at least 12 months OSS support; majors at least 3 years; commercial support extends further. Managed third-party libraries get only patch upgrades within a Boot patch release. Source: https://github.com/spring-projects/spring-boot/wiki/Supported-Versions . Concrete per-version dates (https://api.spring.io/projects/spring-boot/generations, checked 2026-10-25): 4.1 OSS 2027-07-31 / commercial 2028-07-31; 4.0 OSS 2026-12-31 / commercial 2027-12-31; 3.5 OSS ended 2026-06-30 / commercial 2032-06-30.
- PostgreSQL: new major yearly; each major supported 5 years from first release; minor releases at least quarterly. Source: https://www.postgresql.org/support/versioning/
- Jenkins: weekly releases plus an LTS baseline every 12 weeks, with X.1, X.2, X.3 point releases; LTS gets only backported important fixes. Source: https://www.jenkins.io/download/lts/
- MongoDB / Redis / Cassandra / RabbitMQ / Docker / Gradle dates are from endoflife.date only (cross-check source, not vendor).

## Feature status notes

### Java concurrency JEPs (from openjdk.org JEP and release pages)

| Feature | JEP | JDK 21 | JDK 25 (latest LTS) | JDK 26 | JDK 27 (latest release) |
|---|---|---|---|---|---|
| Virtual threads | 444 (Closed/Delivered, release 21) | final | final | final | final |
| Virtual threads without pinning on `synchronized` | 491 (Closed/Delivered, release 24) | n/a (pins) | fixed | fixed | fixed |
| Structured concurrency | 453 (JDK 21 preview) ... 505 (5th preview, JDK 25) -> 525 (6th preview, JDK 26) -> 533 (7th preview, JDK 27, Closed/Delivered) | preview (JEP 453, Closed/Delivered in 21; openjdk.org/jeps/453, checked 2026-10-25) | preview (5th, JEP 505) | preview (6th, JEP 525) | preview (7th, JEP 533), needs `--enable-preview` |
| Scoped values | 506 (Closed/Delivered, release 25) | preview (JEP 446, Closed/Delivered in 21; openjdk.org/jeps/446, checked 2026-10-25) | final | final | final (no new JEP in 27) |
| Stable values / Lazy constants | 502 Stable Values (preview, JDK 25) -> 526 Lazy Constants (2nd preview, JDK 26) -> 531 (3rd preview, JDK 27) | n/a | preview | preview | preview |
| Vector API | 508 (10th incubator, JDK 25) -> 529 (11th, 26) -> 537 (12th, 27) | | incubator | incubator | incubator |
| Primitive types in patterns | 507 (3rd preview, 25) -> 530 (4th, 26) -> 532 (5th, 27) | | preview | preview | preview |

Sources: https://openjdk.org/jeps/444 , https://openjdk.org/jeps/491 , https://openjdk.org/jeps/506 , https://openjdk.org/jeps/533 , https://openjdk.org/projects/jdk/25/ , https://openjdk.org/projects/jdk/26/ , https://openjdk.org/projects/jdk/27/ . JEP 533 (JDK 27) changes: `Joiner` gains an exception type parameter, `open(UnaryOperator)` added, `awaitAll()` removed, `onTimeout()` replaced by `timeout()`. Cells marked "not re-read" for JDK 21 were not fetched from the JEP page this session.

### OpenTelemetry
- Signals per spec status page (https://opentelemetry.io/docs/specs/status/): Tracing API/SDK/Protocol Stable; Metrics API Stable, SDK Mixed, Protocol Stable; Baggage API/SDK Stable; Logging Bridge API Stable, SDK Stable, Protocol Stable.
- Semantic conventions v1.44.0 (docs/*/README.md and *-spans.md in the repo, https://github.com/open-telemetry/semantic-conventions/tree/v1.44.0/docs):
  - HTTP: spans Stable; area README "Mixed".
  - Database: spans Stable; area README "Mixed".
  - Messaging: Development (spans page and README).
  - RPC: Release Candidate (spans page and README).
  - HTTP metrics (`docs/http/http-metrics.md`): page Mixed; `http.server.request.duration` and `http.client.request.duration` Stable, every other HTTP metric Development.
  - Database metrics (`docs/db/database-metrics.md`; the folder is `db`, not `database`): page Mixed; `db.client.operation.duration` Stable, every other `db.client.*` metric (returned rows, connection-pool metrics) Development.
  - Messaging metrics (`docs/messaging/messaging-metrics.md`): page Development, every metric Development.
  - RPC metrics (`docs/rpc/rpc-metrics.md`): page Release Candidate; `rpc.server.call.duration` and `rpc.client.call.duration` Release Candidate.
  - Metrics source: https://raw.githubusercontent.com/open-telemetry/semantic-conventions/v1.44.0/docs/ (checked 2026-10-25; v1.44.0 is still the latest release).
- Migration switch: `OTEL_SEMCONV_STABILITY_OPT_IN` is referenced by the semconv docs for transitioning between old and new attribute names.

## Installed on this machine

Read by running commands on this machine (not from the web):
- JDK 25.0.4.1 LTS (default, `java -version`, build date 2026-08-18), JDK 21.0.7, JDK 17.0.12 (all Oracle, `/usr/libexec/java_home -V`). Note: installed 25.0.4.1 is behind latest 25.0.5, 21.0.7 and 17.0.12 are not current patch levels (current patch levels not checked).
- Apache Maven 3.9.10 (Homebrew), behind latest 3.x 3.10.0 and 3.9.16.
- Node v26.10.0.
- Docker: not checked (the `which docker` check did not return output before the command aborted).
- Maven was not otherwise run by this session.

## Open items

- Redis support/EOL dates: no vendor page read (redis.io/downloads returned 403 on 2026-10-25).
- Support/EOL policy cells marked UNVERIFIED: grpc-java, Spring gRPC, Hibernate, JDBC driver, Lettuce, Mongo/Cassandra drivers, Kafka, Resilience4j, Micrometer, JUnit, Mockito, Testcontainers, MapStruct, Gradle, Flyway, Liquibase. No vendor policy pages were read.
- Mongo/Cassandra/Kafka/RabbitMQ/Docker server release dates come from endoflife.date, GitHub releases or Maven Central upload dates, not vendor announcements.
- Spring Boot 4.1.2 manages old-ish versions (e.g. OTel 1.62.0 vs upstream 1.67.0, Kafka 4.2.2 vs 4.4.0, Flyway 12.4.0 vs 13.11.1, Mongo driver 5.8.1 vs 5.13.0). Labs use the managed values; the OTel agent/starter (2.33.0) are not Boot-managed and depend on the OTel API line they were built against (compatibility not checked).
- Docker installed version not captured.
- No Jenkins plugin dependency/compatibility check against LTS 2.580.1 was done beyond each plugin's required core version.
