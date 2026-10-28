# Sources

Official and primary sources cited by the guide so far, grouped by technology. Each module adds its own section when it is written (module-level citations also appear inline as `[Doc:]` and `[Src:]` tags, STYLE-GUIDE). The URLs below come from [VERSIONS.md](VERSIONS.md); cells there marked UNVERIFIED are not yet backed by a vendor page. The Maven Central `maven-metadata.xml` files give the newest published artifact versions; endoflife.date is only a cross-check, not a vendor source.

## Java and the JDK

- JEP 1 process and status vocabulary (preview, incubator, experimental): https://openjdk.org/jeps/12
- JEP 444 virtual threads: https://openjdk.org/jeps/444
- JEP 491 virtual threads without pinning on `synchronized`: https://openjdk.org/jeps/491
- JEP 506 scoped values: https://openjdk.org/jeps/506
- JEP 533 structured concurrency (7th preview, JDK 27): https://openjdk.org/jeps/533
- JDK release pages: https://openjdk.org/projects/jdk/ , https://openjdk.org/projects/jdk/25/ , https://openjdk.org/projects/jdk/26/ , https://openjdk.org/projects/jdk/27/
- Oracle Java SE support roadmap (read 2026-10-25): https://www.oracle.com/java/technologies/java-se-support-roadmap.html
- Adoptium Temurin support (end of availability): https://adoptium.net/support/
- JEP 453 structured concurrency (preview, JDK 21): https://openjdk.org/jeps/453 ; JEP 446 scoped values (preview, JDK 21): https://openjdk.org/jeps/446 ; JDK 21: https://openjdk.org/projects/jdk/21/
- Support dates cross-check: https://endoflife.date/api/oracle-jdk.json , https://endoflife.date/api/eclipse-temurin.json

## Spring

- Spring Boot support: https://spring.io/projects/spring-boot#support
- Support generations (OSS and commercial end dates): https://api.spring.io/projects/spring-boot/generations , https://api.spring.io/projects/spring-framework/generations , https://api.spring.io/projects/spring-security/generations
- Supported versions wiki: https://github.com/spring-projects/spring-boot/wiki/Supported-Versions
- Boot-managed versions (BOM 4.1.2): https://repo1.maven.org/maven2/org/springframework/boot/spring-boot-dependencies/4.1.2/spring-boot-dependencies-4.1.2.pom
- Release metadata: https://repo1.maven.org/maven2/org/springframework/boot/spring-boot/maven-metadata.xml , https://repo1.maven.org/maven2/org/springframework/spring-core/maven-metadata.xml , https://repo1.maven.org/maven2/org/springframework/security/spring-security-core/maven-metadata.xml , https://repo1.maven.org/maven2/org/springframework/data/spring-data-bom/maven-metadata.xml , https://repo1.maven.org/maven2/org/springframework/data/spring-data-jpa/maven-metadata.xml , https://repo1.maven.org/maven2/org/springframework/kafka/spring-kafka/maven-metadata.xml , https://repo1.maven.org/maven2/org/springframework/graphql/spring-graphql/maven-metadata.xml , https://repo1.maven.org/maven2/org/springframework/grpc/spring-grpc-core/maven-metadata.xml
- Support dates cross-check: https://endoflife.date/api/spring-boot.json , https://endoflife.date/api/spring-framework.json , https://endoflife.date/api/spring-security.json

## Persistence and databases

- PostgreSQL versioning and support policy: https://www.postgresql.org/support/versioning/
- Hibernate ORM, PostgreSQL JDBC, Flyway, Liquibase release metadata: https://repo1.maven.org/maven2/org/hibernate/orm/hibernate-core/maven-metadata.xml , https://repo1.maven.org/maven2/org/postgresql/postgresql/maven-metadata.xml , https://repo1.maven.org/maven2/org/flywaydb/flyway-core/maven-metadata.xml , https://repo1.maven.org/maven2/org/liquibase/liquibase-core/maven-metadata.xml
- Redis: https://github.com/redis/redis/releases , licence at 8.10.2 https://raw.githubusercontent.com/redis/redis/8.10.2/LICENSE.txt , AGPLv3 announcement https://redis.io/blog/agplv3/ , cross-check https://endoflife.date/api/redis.json , Lettuce https://repo1.maven.org/maven2/io/lettuce/lettuce-core/maven-metadata.xml
- MongoDB: https://www.mongodb.com/docs/manual/release-notes/ , driver https://repo1.maven.org/maven2/org/mongodb/mongodb-driver-sync/maven-metadata.xml , cross-check https://endoflife.date/api/mongodb.json
- Cassandra: https://repo1.maven.org/maven2/org/apache/cassandra/cassandra-all/maven-metadata.xml , driver https://repo1.maven.org/maven2/org/apache/cassandra/java-driver-core/maven-metadata.xml , cross-check https://endoflife.date/api/apache-cassandra.json

## Messaging

- Apache Kafka release metadata: https://repo1.maven.org/maven2/org/apache/kafka/kafka-clients/maven-metadata.xml , https://repo1.maven.org/maven2/org/apache/kafka/kafka-streams/maven-metadata.xml
- RabbitMQ: https://github.com/rabbitmq/rabbitmq-server/releases , cross-check https://endoflife.date/api/rabbitmq.json

## APIs and RPC

- grpc-java release metadata: https://repo1.maven.org/maven2/io/grpc/grpc-core/maven-metadata.xml

## Resilience and observability

- Resilience4j: https://repo1.maven.org/maven2/io/github/resilience4j/resilience4j-core/maven-metadata.xml
- Micrometer: https://repo1.maven.org/maven2/io/micrometer/micrometer-core/maven-metadata.xml , Micrometer Tracing https://repo1.maven.org/maven2/io/micrometer/micrometer-tracing/maven-metadata.xml
- OpenTelemetry versioning and stability: https://opentelemetry.io/docs/specs/otel/versioning-and-stability/ ; specification status: https://opentelemetry.io/docs/specs/status/
- OpenTelemetry releases: https://github.com/open-telemetry/opentelemetry-java/releases , https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases , https://github.com/open-telemetry/opentelemetry-collector/releases , https://github.com/open-telemetry/opentelemetry-collector-contrib/releases , https://github.com/open-telemetry/opentelemetry-specification/releases
- Semantic conventions: https://github.com/open-telemetry/semantic-conventions , releases https://github.com/open-telemetry/semantic-conventions/releases , docs at v1.44.0 https://github.com/open-telemetry/semantic-conventions/tree/v1.44.0/docs
- Java API, starter metadata: https://repo1.maven.org/maven2/io/opentelemetry/opentelemetry-api/maven-metadata.xml , https://repo1.maven.org/maven2/io/opentelemetry/instrumentation/opentelemetry-spring-boot-starter/maven-metadata.xml

## Testing

- JUnit: https://repo1.maven.org/maven2/org/junit/jupiter/junit-jupiter/maven-metadata.xml
- Mockito: https://repo1.maven.org/maven2/org/mockito/mockito-core/maven-metadata.xml
- Testcontainers: https://repo1.maven.org/maven2/org/testcontainers/testcontainers/maven-metadata.xml
- jcstress (only 0.16 on Central): https://repo1.maven.org/maven2/org/openjdk/jcstress/jcstress-core/maven-metadata.xml

## Build, delivery and tooling

- Apache Maven: https://maven.apache.org/download.cgi
- Gradle: https://github.com/gradle/gradle/releases , cross-check https://endoflife.date/api/gradle.json
- MapStruct: https://repo1.maven.org/maven2/org/mapstruct/mapstruct/maven-metadata.xml
- Formatters: https://repo1.maven.org/maven2/com/diffplug/spotless/spotless-maven-plugin/maven-metadata.xml , https://repo1.maven.org/maven2/com/google/googlejavaformat/google-java-format/maven-metadata.xml , https://repo1.maven.org/maven2/com/palantir/javaformat/palantir-java-format/maven-metadata.xml
- Docker Engine: https://github.com/moby/moby/releases , cross-check https://endoflife.date/api/docker-engine.json
- Jenkins: LTS policy https://www.jenkins.io/download/lts/ , latest core https://updates.jenkins.io/stable/latestCore.txt , plugins https://plugins.jenkins.io/ , https://plugins.jenkins.io/workflow-aggregator/ , https://plugins.jenkins.io/kubernetes/ , https://plugins.jenkins.io/credentials-binding/ , https://plugins.jenkins.io/configuration-as-code/

## 17 spring-transactions

- https://github.com/spring-projects/spring-boot/blob/v4.1.2/module/spring-boot-jdbc/src/main/java/org/springframework/boot/jdbc/autoconfigure/DataSourceTransactionManagerAutoConfiguration.java
- https://github.com/spring-projects/spring-boot/blob/v4.1.2/module/spring-boot-jpa/src/main/java/org/springframework/boot/jpa/autoconfigure/JpaBaseConfiguration.java
- https://github.com/spring-projects/spring-framework/blob/v7.0.10/spring-jdbc/src/main/java/org/springframework/jdbc/datasource/DataSourceTransactionManager.java
- https://github.com/spring-projects/spring-framework/blob/v7.0.10/spring-jdbc/src/main/java/org/springframework/jdbc/datasource/DataSourceUtils.java
- https://github.com/spring-projects/spring-framework/blob/v7.0.10/spring-jdbc/src/main/java/org/springframework/jdbc/datasource/TransactionAwareDataSourceProxy.java
- https://github.com/spring-projects/spring-framework/blob/v7.0.10/spring-orm/src/main/java/org/springframework/orm/jpa/JpaTransactionManager.java
- https://github.com/spring-projects/spring-framework/blob/v7.0.10/spring-tx/src/main/java/org/springframework/transaction/PlatformTransactionManager.java
- https://github.com/spring-projects/spring-framework/blob/v7.0.10/spring-tx/src/main/java/org/springframework/transaction/TransactionDefinition.java
- https://github.com/spring-projects/spring-framework/blob/v7.0.10/spring-tx/src/main/java/org/springframework/transaction/annotation/Transactional.java
- https://github.com/spring-projects/spring-framework/blob/v7.0.10/spring-tx/src/main/java/org/springframework/transaction/interceptor/TransactionAspectSupport.java
- https://github.com/spring-projects/spring-framework/blob/v7.0.10/spring-tx/src/main/java/org/springframework/transaction/support/AbstractPlatformTransactionManager.java
- https://github.com/spring-projects/spring-framework/blob/v7.0.10/spring-tx/src/main/java/org/springframework/transaction/support/TransactionSynchronizationManager.java
- https://github.com/spring-projects/spring-framework/blob/v7.0.10/spring-tx/src/main/java/org/springframework/transaction/support/TransactionTemplate.java
- https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html
- https://github.com/spring-projects/spring-boot/blob/v4.1.2/module/spring-boot-transaction/src/main/java/org/springframework/boot/transaction/autoconfigure/TransactionAutoConfiguration.java
- https://github.com/spring-projects/spring-framework/blob/v7.0.10/spring-tx/src/main/java/org/springframework/transaction/annotation/AbstractTransactionManagementConfiguration.java
- https://github.com/spring-projects/spring-framework/blob/v7.0.10/spring-tx/src/main/java/org/springframework/transaction/annotation/AnnotationTransactionAttributeSource.java
- https://github.com/spring-projects/spring-framework/blob/v7.0.10/spring-tx/src/main/java/org/springframework/transaction/annotation/ProxyTransactionManagementConfiguration.java
- https://github.com/spring-projects/spring-framework/blob/v7.0.10/spring-tx/src/main/java/org/springframework/transaction/interceptor/AbstractFallbackTransactionAttributeSource.java
- https://github.com/spring-projects/spring-data-jpa/blob/4.1.2/spring-data-jpa/src/main/java/org/springframework/data/jpa/repository/support/SimpleJpaRepository.java
- https://github.com/spring-projects/spring-framework/blob/v7.0.10/spring-aop/src/main/java/org/springframework/aop/framework/CglibAopProxy.java
- https://github.com/spring-projects/spring-framework/blob/v7.0.10/spring-tx/src/main/java/org/springframework/transaction/annotation/EnableTransactionManagement.java
- https://github.com/spring-projects/spring-framework/blob/v7.0.10/spring-tx/src/main/java/org/springframework/transaction/interceptor/DefaultTransactionAttribute.java
- https://github.com/spring-projects/spring-framework/blob/v7.0.10/spring-tx/src/main/java/org/springframework/transaction/interceptor/RollbackRuleAttribute.java
- https://github.com/spring-projects/spring-framework/blob/v7.0.10/spring-tx/src/main/java/org/springframework/transaction/interceptor/RuleBasedTransactionAttribute.java
- https://github.com/spring-projects/spring-framework/blob/v7.0.10/spring-tx/src/main/java/org/springframework/transaction/event/TransactionalApplicationListenerMethodAdapter.java
- https://github.com/spring-projects/spring-framework/blob/v7.0.10/spring-tx/src/main/java/org/springframework/transaction/event/TransactionalApplicationListenerSynchronization.java
- https://github.com/spring-projects/spring-framework/blob/v7.0.10/spring-tx/src/main/java/org/springframework/transaction/event/TransactionalEventListener.java
- https://github.com/spring-projects/spring-framework/blob/v7.0.10/spring-tx/src/main/java/org/springframework/transaction/support/TransactionSynchronization.java
- https://github.com/spring-projects/spring-framework/blob/v7.0.10/spring-tx/src/main/java/org/springframework/transaction/support/TransactionSynchronizationUtils.java
- https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ThreadLocal.html
- https://github.com/spring-projects/spring-framework/blob/v7.0.10/spring-context/src/main/java/org/springframework/scheduling/annotation/AsyncAnnotationBeanPostProcessor.java
- https://www.postgresql.org/docs/18/transaction-iso.html
