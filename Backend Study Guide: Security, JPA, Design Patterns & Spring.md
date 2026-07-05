# Backend Study Guide: Security, JPA, Design Patterns & Spring

A study-oriented reworking of your source notes. Every term, fact, code example, and table from the original is preserved. Where the source was thin or **incorrect**, this guide expands, corrects, and contextualizes so you can actually _understand_ the material rather than just memorize it.

> **How to use this guide.** Read Part I first (security fundamentals), then Part II (data access with JPA), then Part III (the 23 design patterns), then Part IV (Spring's bean model), and finally Part V (annotations, which tie everything together). Each major part ends with a **Summary** and a **Most-likely-tested** flag list.

---

## ⚠️ Corrections & Assumptions (read before studying)

Your source contained several factual errors and ambiguities. I have **not** silently "fixed" them inside the text; instead I preserve the original terms and correct them explicitly so you learn the right version.

1. **The OWASP Top 10 (2021) section in the source is scrambled.** The category codes (A01–A10) are attached to the wrong titles and descriptions. For example, the source calls _Injection_ "A01" (it is actually **A03**), labels A04 as both "XXE" and "Insecure Design," ties SSRF to A10 while describing "Broken Access Control," and merges XSS into authentication. The real 2021 list is given in **Part I** with a side-by-side of what the source said versus what is correct. Study the corrected version.

2. **JPA relations — a likely typo.** The source says `mappedBy` applies to `@OneToMany` and `@ManyToOne` and notes "(always in one)". In real JPA, `mappedBy` lives on the **inverse (non-owning) side**. For a one-to-many/many-to-one pair, that is the `@OneToMany` side. `@ManyToOne` is almost always the **owning** side and does **not** take `mappedBy`. I flag this in Part II; I assume the source meant "the `mappedBy` attribute names the field that owns the relationship, and you place it on the _one_ side of a one-to-many."

3. **`@JoinColumn` spelling.** The source writes `@JoinColum`. The correct annotation is `@JoinColumn` (two n's). Used throughout Part II in corrected form.

4. **Singleton example is not thread-safe.** The source's `getInstance()` uses lazy initialization without synchronization. This is fine as a teaching sketch but would break under concurrent access. I note the safe alternatives in Part III.

5. **Assumption on scope.** The source is a set of backend interview/reference notes (Java + Spring ecosystem). I have organized it as an exam-prep guide for that audience.

---

# PART I — Web Application Security (OWASP)

## 1.1 What OWASP is

**OWASP** stands for the **Open Web Application Security Project** (in Spanish: _Proyecto Abierto de Seguridad de Aplicaciones Web_). It is a nonprofit community that publishes freely available guidance on software security. Its most famous artifact is the **OWASP Top 10**: a periodically updated list of the ten most critical security risks facing web applications. It is a _risk awareness_ document, not an exhaustive checklist — think of it as "the ten mistakes that hurt the most, ranked."

Why it matters: the Top 10 is the single most commonly referenced security list in interviews, audits, and compliance conversations (PCI-DSS, for instance, references it). Knowing the 2021 edition cold is high-value.

## 1.2 The corrected OWASP Top 10 — 2021 edition

The table below gives the **official** 2021 list. The right-hand column shows what your source text claimed, so you can see exactly where it went wrong.

| Code         | Official 2021 title                        | Plain-English meaning                                                                                                                | What your source _incorrectly_ said                    |
| ------------ | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| **A01:2021** | Broken Access Control                      | Users can act outside their intended permissions (view/edit/delete data they shouldn't).                                             | Called it "Injection."                                 |
| **A02:2021** | Cryptographic Failures                     | Sensitive data is exposed because encryption is missing, weak, or misused. (Was "Sensitive Data Exposure" in 2017.)                  | Called it "Broken Authentication."                     |
| **A03:2021** | Injection                                  | Untrusted input is interpreted as a command/query (SQL, NoSQL, LDAP, ORM, OS command). XSS now lives inside this category.           | Called it "Sensitive Data Exposure."                   |
| **A04:2021** | Insecure Design                            | Flaws baked into the architecture/design itself — a _new_ 2021 category for problems that no amount of clean implementation can fix. | Labeled it "XXE" and "Insecure Design" simultaneously. |
| **A05:2021** | Security Misconfiguration                  | Insecure default configs, verbose errors, unpatched settings across app, server, DB, framework, platform.                            | Matched (this one was roughly right).                  |
| **A06:2021** | Vulnerable and Outdated Components         | Using libraries/frameworks with known CVEs. (Was "Using Components with Known Vulnerabilities.")                                     | Matched (roughly right).                               |
| **A07:2021** | Identification and Authentication Failures | Weak login, session management, credential stuffing, missing MFA. (Was "Broken Authentication.")                                     | Called it "Cross-Site Scripting (XSS)."                |
| **A08:2021** | Software and Data Integrity Failures       | Trusting code/data without verifying integrity — insecure deserialization, unsigned updates, compromised CI/CD pipelines.            | Called it "Software injection / API security."         |
| **A09:2021** | Security Logging and Monitoring Failures   | Attacks go undetected because logging/alerting is insufficient. (Was "Insufficient Logging & Monitoring.")                           | Called it "API security failures."                     |
| **A10:2021** | Server-Side Request Forgery (SSRF)         | The app is tricked into making a request to an unintended internal/external destination. New in 2021.                                | Called it "Broken Access Control."                     |

### Key terms the source mentioned, defined properly

- **SQL / NoSQL / LDAP / ORM injection:** All are forms of **A03: Injection**. The attacker slips crafted data into a query so the interpreter runs _their_ command. _Example:_ a login field that builds `SELECT * FROM users WHERE name = '` + input + `'` lets an attacker enter `' OR '1'='1` and log in as anyone. **Defense:** parameterized queries / prepared statements, ORM binding, input validation, least-privilege DB accounts.
- **XXE (XML External Entities):** In 2017 this was its own category (A04:2017). In 2021 it was **folded into A05: Security Misconfiguration**. It occurs when an XML parser processes external entity references, letting an attacker read local files (`file:///etc/passwd`) or trigger SSRF. **Defense:** disable DTD/external-entity processing in the parser.
- **XSS (Cross-Site Scripting):** In 2021 this was **merged into A03: Injection**. The attacker injects script that runs in another user's browser. **Defense:** output encoding, Content-Security-Policy, framework auto-escaping.
- **Session tokens / passwords / keys:** compromising these is the heart of **A07: Identification and Authentication Failures**. **Defense:** MFA, secure session handling, rate-limiting login, no default credentials.
- **SSRF (Server-Side Request Forgery):** **A10**. The server fetches a URL the attacker controls, potentially reaching internal metadata endpoints (e.g., cloud instance metadata at `169.254.169.254`). **Defense:** allow-lists for outbound destinations, block internal IP ranges.

> **Most-likely-tested (Part I):**
>
> - Injection = **A03** (not A01). Broken Access Control = **A01**.
> - SSRF is the **new** 2021 category (A10); Insecure Design is the other **new** one (A04).
> - XXE was absorbed into Security Misconfiguration; XSS was absorbed into Injection.
> - The single best defense against injection is **parameterized queries**.

### Part I summary

OWASP publishes the Top 10 web-app risks. The 2021 order, from A01 to A10, is: Broken Access Control, Cryptographic Failures, Injection, Insecure Design, Security Misconfiguration, Vulnerable/Outdated Components, Identification & Authentication Failures, Software & Data Integrity Failures, Security Logging & Monitoring Failures, and SSRF. Two categories are new in 2021 (Insecure Design, SSRF); several older ones were renamed or merged.

---

# PART II — Data Access with JPA

**JPA (Java Persistence API)** is the Java specification for **ORM (Object-Relational Mapping)** — mapping Java objects to relational database rows. **Hibernate** is its most common implementation. **Spring Data JPA** sits _on top_ of JPA and removes most boilerplate. This part covers three layers of capability: declaring entity **relationships**, generating queries from method names (**Query Methods**), and building dynamic queries programmatically (**Specifications**).

## 2.1 Entity Relationship Annotations

Relationships describe how entity tables reference each other via foreign keys or join tables.

**Join-configuration annotations:**

- **`@JoinColumn`** — declares the foreign-key column that links two tables. Its `name=` attribute sets the column name. (Your source spelled it `@JoinColum`; the correct spelling has two n's.)
- **`@JoinTable`** — used for many-to-many (and sometimes unidirectional one-to-many). It defines the _intermediate join table_. Attributes: `name=` (the join table's name), `joinColumns=@JoinColumn(name=...)` (FK back to the owning entity), and `inverseJoinColumns=@JoinColumn(name=...)` (FK to the other entity).

**Cardinality annotations** and their common attributes:

| Annotation    | Meaning                                                                           | Typical attributes                                                                                                |
| ------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `@OneToOne`   | One row relates to exactly one row (e.g., User ↔ Profile).                        | `targetEntity=X.class`, `cascade=CascadeType.PERSIST…`                                                            |
| `@OneToMany`  | One row relates to many (e.g., Order → many Items).                               | `targetEntity=X.class`, `cascade=CascadeType.PERSIST…`, `fetch=FetchType.LAZY` or `EAGER`, `mappedBy="attribute"` |
| `@ManyToOne`  | Many rows relate to one (the inverse of the above; e.g., many Items → one Order). | `targetEntity=X.class`, `cascade=CascadeType.PERSIST…`, `fetch=FetchType.LAZY` or `EAGER`                         |
| `@ManyToMany` | Many-to-many (e.g., Students ↔ Courses), backed by a join table.                  | `targetEntity=X.class`, `fetch=FetchType.LAZY` or `EAGER`                                                         |

**Concepts you must understand behind these attributes:**

- **`cascade`** — controls whether operations on the parent propagate to children. `CascadeType.PERSIST` means "when I save the parent, save the children too." Others include `MERGE`, `REMOVE`, `REFRESH`, `DETACH`, and `ALL`.
- **`fetch` (LAZY vs EAGER)** — _when_ related data is loaded. **LAZY** delays loading the association until you actually access it (efficient, the default for `@OneToMany`/`@ManyToMany`). **EAGER** loads it immediately with the parent (the default for `@ManyToOne`/`@OneToOne`). Overusing EAGER causes performance problems and the infamous **N+1 query** issue.
- **`mappedBy`** — marks the **inverse (non-owning) side** of a bidirectional relationship. It names the field on the _other_ entity that owns the foreign key. **Correction to the source:** the source listed `mappedBy` under both `@OneToMany` and `@ManyToOne` with the note "always in one." In practice `mappedBy` belongs on the **one** side of a one-to-many pair (the `@OneToMany` field), because the **many** side (`@ManyToOne`) owns the foreign-key column. You never put `mappedBy` on the owning side.

> **Owning vs inverse side (crucial mental model):** In a bidirectional relationship, exactly one side "owns" the foreign key and controls what gets written to the DB. The other side is the mirror and is marked with `mappedBy`. Forgetting this leads to duplicate join tables or ignored updates.

## 2.2 Query Methods

**Mental model first:** Instead of writing SQL, you _name a method_ and Spring Data JPA _reads the name_ and generates the query for you. The method name is the query.

**Reference:** https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html

### Concept

1. **Definition by naming convention** — repository methods whose names follow a grammar that describes the query. `findByName(String name)` becomes a query filtering on the `name` field.
2. **Query abstraction** — you don't hand-write SQL or **JPQL** (Java Persistence Query Language, an object-oriented query language that operates on entities instead of tables). The framework parses the name and produces the query.
3. **Integration with JPA** — Query Methods are a convenience layer over JPA, easing data access and manipulation in relational databases.

### Use cases

1. **Search by attribute** — e.g., `findByEmail(String email)`.
2. **Compound conditions** — e.g., `findByNameAndAge(String name, Integer age)`.
3. **Logical operators** — keywords like `And`, `Or`, `Between`, `LessThan`, `GreaterThan` build more complex queries.
4. **Sorting and pagination** — e.g., `findByAgeOrderByLastNameDesc(Integer age)`.
5. **Custom queries** — when the naming convention isn't enough, use the **`@Query`** annotation to write JPQL/SQL by hand.

### Implementation steps

1. **Define a repository interface** extending `JpaRepository` or `CrudRepository`:

```java
public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByName(String name);
}
```

2. **Name methods per the convention** — e.g., `findByLastName(String lastName)`.
3. **Spring Data JPA does the rest** — at runtime it interprets the method and generates SQL/JPQL automatically.
4. **Use `@Query` for custom queries** when the convention is insufficient:

```java
@Query("SELECT u FROM User u WHERE u.email = ?1")
User findByEmail(String email);
```

Here `?1` is a **positional parameter** binding the first method argument. 5. **Configure JPA** — ensure your JPA setup (`persistence.xml` or Spring Boot configuration) is correct so integration with the database works.

The takeaway from the source: Query Methods are powerful _because_ they are simple — they cut the need to write and maintain complex queries and speed up common database operations in Java apps.

### The full keyword reference table

Every keyword below turns into the shown JPQL fragment. `x` is the entity; `?1`, `?2` are the method arguments in order.

| Keyword                | Sample method                                                   | JPQL snippet                                                       |
| ---------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------ |
| `Distinct`             | `findDistinctByLastnameAndFirstname`                            | `select distinct … where x.lastname = ?1 and x.firstname = ?2`     |
| `And`                  | `findByLastnameAndFirstname`                                    | `… where x.lastname = ?1 and x.firstname = ?2`                     |
| `Or`                   | `findByLastnameOrFirstname`                                     | `… where x.lastname = ?1 or x.firstname = ?2`                      |
| `Is`, `Equals`         | `findByFirstname`, `findByFirstnameIs`, `findByFirstnameEquals` | `… where x.firstname = ?1`                                         |
| `Between`              | `findByStartDateBetween`                                        | `… where x.startDate between ?1 and ?2`                            |
| `LessThan`             | `findByAgeLessThan`                                             | `… where x.age < ?1`                                               |
| `LessThanEqual`        | `findByAgeLessThanEqual`                                        | `… where x.age <= ?1`                                              |
| `GreaterThan`          | `findByAgeGreaterThan`                                          | `… where x.age > ?1`                                               |
| `GreaterThanEqual`     | `findByAgeGreaterThanEqual`                                     | `… where x.age >= ?1`                                              |
| `After`                | `findByStartDateAfter`                                          | `… where x.startDate > ?1`                                         |
| `Before`               | `findByStartDateBefore`                                         | `… where x.startDate < ?1`                                         |
| `IsNull`, `Null`       | `findByAge(Is)Null`                                             | `… where x.age is null`                                            |
| `IsNotNull`, `NotNull` | `findByAge(Is)NotNull`                                          | `… where x.age not null`                                           |
| `Like`                 | `findByFirstnameLike`                                           | `… where x.firstname like ?1`                                      |
| `NotLike`              | `findByFirstnameNotLike`                                        | `… where x.firstname not like ?1`                                  |
| `StartingWith`         | `findByFirstnameStartingWith`                                   | `… where x.firstname like ?1` (parameter bound with appended `%`)  |
| `EndingWith`           | `findByFirstnameEndingWith`                                     | `… where x.firstname like ?1` (parameter bound with prepended `%`) |
| `Containing`           | `findByFirstnameContaining`                                     | `… where x.firstname like ?1` (parameter wrapped in `%`)           |
| `OrderBy`              | `findByAgeOrderByLastnameDesc`                                  | `… where x.age = ?1 order by x.lastname desc`                      |
| `Not`                  | `findByLastnameNot`                                             | `… where x.lastname <> ?1`                                         |
| `In`                   | `findByAgeIn(Collection<Age> ages)`                             | `… where x.age in ?1`                                              |
| `NotIn`                | `findByAgeNotIn(Collection<Age> ages)`                          | `… where x.age not in ?1`                                          |
| `True`                 | `findByActiveTrue()`                                            | `… where x.active = true`                                          |
| `False`                | `findByActiveFalse()`                                           | `… where x.active = false`                                         |
| `IgnoreCase`           | `findByFirstnameIgnoreCase`                                     | `… where UPPER(x.firstname) = UPPER(?1)`                           |

_Reading tip:_ the `StartingWith`/`EndingWith`/`Containing` trio all compile to `LIKE`; the difference is only where the `%` wildcard is placed (end, start, or both).

## 2.3 Specifications

**Mental model:** Query Methods are static — the query is fixed at the method name. **Specifications** let you build queries **dynamically at runtime** by composing reusable predicates. They are ideal when search criteria are complex, optional, or combinable (think an advanced search form where any subset of filters may be active).

**What they are:** Specifications are part of the **JPA Criteria API** and are integrated into Spring Data JPA. A Specification is essentially a _predicate_ — a function that takes an entity object and returns a boolean indicating whether it meets the criteria.

**What they're for:** situations with multiple optional or combinable conditions. Instead of writing one method per filter combination, you compose the criteria on the fly.

**How to build them (three steps):**

1. **Extend your repository with `JpaSpecificationExecutor<T>`**, where `T` is your entity class:

```java
public interface ProductoRepository extends JpaRepository<Producto, Long>, JpaSpecificationExecutor<Producto> {
}
```

2. **Create Specifications by implementing `Specification<T>`**, overriding its single method `toPredicate`:

```java
public class ProductoSpecifications {
    public static Specification<Producto> nombreContains(String nombre) {
        return (root, query, criteriaBuilder) -> {
            if (nombre == null) return criteriaBuilder.conjunction();
            return criteriaBuilder.like(root.get("nombre"), "%" + nombre + "%");
        };
    }
}
```

- `root` is the entity root (the "FROM" clause), `query` is the overall query, and `criteriaBuilder` builds predicate expressions. Returning `criteriaBuilder.conjunction()` when the input is null means "no filter" (a true predicate), so the criterion is simply skipped.

3. **Use them in the repository**, combining with `where`, `and`, `or`:

```java
List<Producto> productos = productoRepository.findAll(
    Specification.where(
        ProductoSpecifications.nombreContains("nombreEjemplo")
    )
);
```

In short, Specifications give a powerful, flexible way to build dynamic queries, making advanced searches and custom filters easy to implement.

> **Most-likely-tested (Part II):**
>
> - `mappedBy` goes on the **inverse/non-owning** side.
> - LAZY vs EAGER defaults: `@OneToMany`/`@ManyToMany` = LAZY; `@ManyToOne`/`@OneToOne` = EAGER.
> - Query Methods derive SQL from method names; `@Query` overrides with hand-written JPQL and `?1` positional params.
> - Specifications = dynamic queries via the Criteria API; repository must extend `JpaSpecificationExecutor<T>`.

### Part II summary

JPA maps objects to tables. You declare relationships with `@OneToOne`/`@OneToMany`/`@ManyToOne`/`@ManyToMany` plus `@JoinColumn`/`@JoinTable`, tuning behavior with `cascade`, `fetch`, and `mappedBy`. For queries, three tools scale with complexity: derived **Query Methods** (name-based, static), **`@Query`** (hand-written when names fall short), and **Specifications** (programmatic, dynamic, composable via the Criteria API).

---

# PART III — Design Patterns

Design patterns are reusable solutions to recurring design problems, popularized by the "Gang of Four" (GoF). They split into three families:

- **Creational** — concerned with _how objects are created_, decoupling instantiation from use.
- **Structural** — concerned with _how classes and objects are composed_ into larger structures while staying flexible and efficient.
- **Behavioral** — concerned with _algorithms and the assignment of responsibilities_ between objects (how they communicate and cooperate).

All examples below are the source's Java examples in backend contexts.

## 3.1 Creational Patterns

### Singleton

**Purpose:** guarantee that only **one instance** of a class exists across the whole system.
**Backend use case:** a `UserRegistrationManager` that centralizes all user-registration operations (adding users, verifying credentials). One shared instance prevents inconsistency and centralizes the logic.
**How:** a **private constructor** blocks direct instantiation; a static `getInstance()` returns the single instance, creating it lazily if it doesn't exist yet.

```java
public class UserRegistrationManager {
    private static UserRegistrationManager instance;

    private UserRegistrationManager() {
        // Private constructor to prevent direct instantiation
    }

    public static UserRegistrationManager getInstance() {
        if (instance == null) {
            instance = new UserRegistrationManager();
        }
        return instance;
    }
    // Rest of the class...
}
```

Any code needing the registration functionality goes through the same instance, avoiding inconsistency.

> **⚠️ Correction/expansion the source omitted:** this lazy `getInstance()` is **not thread-safe** — two threads could both see `instance == null` and create two objects. Safe alternatives: (a) eager initialization (`private static final UserRegistrationManager instance = new UserRegistrationManager();`), (b) **double-checked locking** with a `volatile` field, or (c) the **enum singleton** idiom (the cleanest in Java). Consider alternatives per your project's needs, as the source itself advises.

### Factory (Factory Method)

**Purpose:** create objects of different concrete types behind a **common interface**, encapsulating the creation logic and delegating it to a factory.
**Backend use case:** creating different database connections based on a parameter. A `DatabaseConnection` interface with `MySQLConnection`, `PostgreSQLConnection`, `OracleConnection` implementations, produced by a `ConnectionFactory`.

```java
public interface DatabaseConnection {
    void connect();
    void query(String sql);
    void disconnect();
}
public class MySQLConnection implements DatabaseConnection { /* ... */ }
public class PostgreSQLConnection implements DatabaseConnection { /* ... */ }
public class OracleConnection implements DatabaseConnection { /* ... */ }

public class ConnectionFactory {
    public static DatabaseConnection createConnection(String databaseType) {
        if (databaseType.equals("MySQL")) {
            return new MySQLConnection();
        } else if (databaseType.equals("PostgreSQL")) {
            return new PostgreSQLConnection();
        } else if (databaseType.equals("Oracle")) {
            return new OracleConnection();
        } else {
            throw new IllegalArgumentException("Invalid database type");
        }
    }
}
```

The factory decides _which_ concrete class to build, so callers stay decoupled from concrete implementations.

### Abstract Factory

**Purpose:** provide an interface to create **families of related objects** without specifying their concrete classes. Where a plain Factory makes one product, an Abstract Factory makes a coordinated set.
**Backend use case:** payment methods across platforms (PayPal, Stripe). A `PaymentMethod` interface, concrete `PayPalPayment`/`StripePayment`, and a `PaymentFactory` interface with concrete `PayPalFactory`/`StripeFactory`.

```java
public interface PaymentMethod { void processPayment(); }
public class PayPalPayment implements PaymentMethod { /* ... */ }
public class StripePayment implements PaymentMethod { /* ... */ }

public interface PaymentFactory { PaymentMethod createPayment(); }
public class PayPalFactory implements PaymentFactory {
    public PaymentMethod createPayment() { return new PayPalPayment(); }
}
public class StripeFactory implements PaymentFactory {
    public PaymentMethod createPayment() { return new StripePayment(); }
}

public class PaymentProcessor {
    private PaymentFactory paymentFactory;
    public PaymentProcessor(PaymentFactory paymentFactory) { this.paymentFactory = paymentFactory; }
    public void processPayment() {
        PaymentMethod paymentMethod = paymentFactory.createPayment();
        paymentMethod.processPayment();
    }
}
```

`PaymentProcessor` uses the abstract factory to obtain and use the correct payment method, decoupled from concrete implementations.

> **Factory vs Abstract Factory:** Factory Method returns _one_ product type via a method; Abstract Factory groups _several_ factory methods to build a _family_ of products meant to work together.

### Builder

**Purpose:** construct **complex objects step by step**, so the client doesn't deal with construction details. Ideal for objects with many properties/configurations.
**Backend use case:** a customizable `Product` (name, description, price, custom options), built via a fluent `ProductBuilder`.

```java
public class Product {
    private String name;
    private String description;
    private double price;
    private List<String> customOptions;
    public Product(String name, String description, double price, List<String> customOptions) {
        this.name = name; this.description = description;
        this.price = price; this.customOptions = customOptions;
    }
    // Getters...
}

public class ProductBuilder {
    private String name;
    private String description;
    private double price;
    private List<String> customOptions;
    public ProductBuilder() { this.customOptions = new ArrayList<>(); }
    public ProductBuilder setName(String name) { this.name = name; return this; }
    public ProductBuilder setDescription(String description) { this.description = description; return this; }
    public ProductBuilder setPrice(double price) { this.price = price; return this; }
    public ProductBuilder addCustomOption(String option) { this.customOptions.add(option); return this; }
    public Product build() { return new Product(name, description, price, customOptions); }
}

public class Main {
    public static void main(String[] args) {
        Product product = new ProductBuilder()
                .setName("Camiseta")
                .setDescription("Camiseta de algodón")
                .setPrice(19.99)
                .addCustomOption("Talla")
                .addCustomOption("Color")
                .build();
    }
}
```

Each `set…`/`add…` returns `this`, enabling the **fluent chaining** you see. `build()` produces the finished object.

### Prototype

**Purpose:** create new objects by **copying (cloning) an existing one**, avoiding building from scratch. Efficient for producing many similar objects or objects with predefined initial values.
**Backend use case:** cloning a prototype `Product` to make many similar products.

```java
public abstract class Product implements Cloneable {
    private String name;
    private String description;
    private double price;
    public Product(String name, String description, double price) {
        this.name = name; this.description = description; this.price = price;
    }
    // Getters...
    public abstract Product clone();
}

public class ConcreteProduct extends Product {
    public ConcreteProduct(String name, String description, double price) {
        super(name, description, price);
    }
    public Product clone() {
        return new ConcreteProduct(getName(), getDescription(), getPrice());
    }
}

public class Main {
    public static void main(String[] args) {
        Product prototypeProduct = new ConcreteProduct("Camiseta", "Camiseta de algodón", 19.99);
        Product product1 = prototypeProduct.clone();
        Product product2 = prototypeProduct.clone();
    }
}
```

The abstract `Product` (implementing `Cloneable`) defines the common prototype and an abstract `clone()`; `ConcreteProduct` implements `clone()` to copy its own values.

> **Expansion:** watch for **shallow vs deep copy**. This example rebuilds primitives/immutable Strings, so it's effectively deep. If a prototype holds mutable references (lists, other objects), a naive clone shares those references — a common bug.

## 3.2 Structural Patterns

### Adapter

**Purpose:** convert one class's interface into the interface a client expects, letting incompatible classes work together **without modifying their source**.
**Backend use case:** integrating an external payment service whose interface (`makePayment`) doesn't match your required `PaymentGateway.processPayment`.

```java
public interface PaymentGateway { void processPayment(double amount); }

public class ExternalPaymentService {
    public void makePayment(double amount) { /* external service logic */ }
}

public class PaymentGatewayAdapter implements PaymentGateway {
    private ExternalPaymentService externalPaymentService;
    public PaymentGatewayAdapter(ExternalPaymentService s) { this.externalPaymentService = s; }
    public void processPayment(double amount) { externalPaymentService.makePayment(amount); }
}
```

The adapter implements the expected interface and internally delegates to the incompatible service.

### Composite

**Purpose:** represent **part-whole hierarchies** recursively so that individual objects and groups are treated **uniformly**.
**Backend use case:** a file system where `File` (leaf) and `Folder` (composite, holding children) share a common `FileSystemItem` type.

```java
public abstract class FileSystemItem {
    private String name;
    public FileSystemItem(String name) { this.name = name; }
    public String getName() { return name; }
    public abstract void display();
}

public class File extends FileSystemItem {
    public File(String name) { super(name); }
    public void display() { System.out.println("File: " + getName()); }
}

public class Folder extends FileSystemItem {
    private List<FileSystemItem> children;
    public Folder(String name) { super(name); this.children = new ArrayList<>(); }
    public void addChild(FileSystemItem item) { children.add(item); }
    public void removeChild(FileSystemItem item) { children.remove(item); }
    public void display() {
        System.out.println("Folder: " + getName());
        for (FileSystemItem item : children) { item.display(); }
    }
}
```

Calling `display()` on the root recursively displays the whole tree — the client doesn't care whether a node is a file or folder.

### Proxy

**Purpose:** provide a **substitute/placeholder** for another object to control access to it, adding behavior _before or after_ delegating to the real object.
**Backend use case:** controlling access to an external API — logging, restricting operations, or adding pre/post logic.

```java
public interface ExternalApi { void performOperation(); }

public class RealApi implements ExternalApi {
    public void performOperation() { /* real operation */ }
}

public class ProxyApi implements ExternalApi {
    private RealApi realApi;
    public ProxyApi() { this.realApi = new RealApi(); }
    public void performOperation() {
        // extra logic before
        realApi.performOperation();
        // extra logic after
    }
}
```

> **Expansion — Proxy vs Adapter vs Decorator (commonly confused):** Adapter _changes_ an interface; Proxy _keeps_ the same interface but _controls access_; Decorator _keeps_ the same interface but _adds behavior_. Proxy variants include virtual (lazy creation), remote (network stand-in), and protection (access control) proxies. Spring's AOP/transactions/security are implemented with dynamic proxies.

### Flyweight

**Purpose:** minimize memory by **sharing** objects used across many similar contexts, avoiding creating redundant objects.
**Backend use case:** a document management system that reuses shared `Document` objects via a factory.

```java
public interface Document { void print(); }

public class ConcreteDocument implements Document {
    private String content;
    public ConcreteDocument(String content) { this.content = content; }
    public void print() { System.out.println("Document content: " + content); }
}

public class DocumentFactory {
    private Map<String, Document> documents;
    public DocumentFactory() { this.documents = new HashMap<>(); }
    public Document getDocument(String key) {
        if (documents.containsKey(key)) {
            return documents.get(key);
        } else {
            Document document = new ConcreteDocument(key);
            documents.put(key, document);
            return document;
        }
    }
}
```

Requesting `"Document A"` twice returns the **same** cached instance, so `document1 == document3` is `true`. This optimizes memory and performance.

> **Expansion:** real Flyweight distinguishes **intrinsic state** (shared, stored in the flyweight) from **extrinsic state** (context-specific, passed in by the client). Java's `Integer.valueOf()` cache for small ints is a classic flyweight.

### Facade

**Purpose:** provide a **simplified, unified interface** hiding the complexity of a larger subsystem — a single entry point that reduces client coupling to internal components.
**Backend use case:** e-commerce order completion that internally coordinates payment, shipping, and inventory services.

```java
public class PaymentService { public void processPayment() { /* ... */ } }
public class ShippingService { public void shipOrder() { /* ... */ } }
public class InventoryService { public void updateInventory() { /* ... */ } }

public class ECommerceFacade {
    private PaymentService paymentService;
    private ShippingService shippingService;
    private InventoryService inventoryService;
    public ECommerceFacade() {
        this.paymentService = new PaymentService();
        this.shippingService = new ShippingService();
        this.inventoryService = new InventoryService();
    }
    public void completeOrder() {
        paymentService.processPayment();
        shippingService.shipOrder();
        inventoryService.updateInventory();
        // additional finalizing logic
    }
}
```

The client calls only `completeOrder()`; the subsystem's complexity is hidden, improving modularity and maintainability.

> **Facade vs Adapter:** Facade _simplifies_ a set of interfaces (convenience); Adapter _converts_ one interface to another (compatibility).

### Bridge

**Purpose:** **separate an abstraction from its implementation** so both can vary independently, using two class hierarchies (one for abstraction, one for implementation).
**Backend use case:** supporting multiple databases (MySQL, PostgreSQL, MongoDB). A `Database` abstraction holds a reference to a `DatabaseEngine` implementation.

```java
public abstract class Database {
    protected DatabaseEngine engine;
    public Database(DatabaseEngine engine) { this.engine = engine; }
    public abstract void connect();
    public abstract void executeQuery(String query);
    public void disconnect() { /* disconnect logic */ }
}

public interface DatabaseEngine {
    void connect();
    void executeQuery(String query);
    void disconnect();
}

public class MySqlConnection implements DatabaseEngine { /* MySQL logic */ }
public class PostgreSqlConnection implements DatabaseEngine { /* PostgreSQL logic */ }
```

**Why it matters (source's own emphasis):** you can add/modify/extend supported databases without touching the abstraction. Changing how MySQL connects only touches `MySqlConnection`; the `Database` abstraction is untouched. Adding `MongoDbConnection` requires no change to `Database`. This exemplifies the **Open/Closed Principle** — open for extension, closed for modification — yielding cleaner, more maintainable, more scalable code.

> **Bridge vs Abstract Factory (subtle):** Abstract Factory is about _creating_ families of objects; Bridge is about _structuring_ an abstraction so its implementation can be swapped. Bridge is a compile-time/runtime composition of two dimensions that would otherwise cause a class explosion.

### Decorator

**Purpose:** add responsibilities to objects **dynamically** without altering their structure, via **composition**: a decorator implements the same interface as the object it wraps and holds a reference to it.
**Backend use case:** enriching a data-processing service with logging, validation, or error handling — without modifying the service.

```java
public interface DataService { void processData(String data); }

public class DataProcessingService implements DataService {
    @Override public void processData(String data) { /* processing logic */ }
}

public abstract class DataServiceDecorator implements DataService {
    protected DataService wrappedService;
    public DataServiceDecorator(DataService wrappedService) { this.wrappedService = wrappedService; }
    @Override public void processData(String data) { wrappedService.processData(data); }
}

public class LoggingDecorator extends DataServiceDecorator {
    public LoggingDecorator(DataService wrappedService) { super(wrappedService); }
    @Override public void processData(String data) {
        logData(data);
        super.processData(data);
    }
    private void logData(String data) { System.out.println("Logging data: " + data); }
}

public class ValidationDecorator extends DataServiceDecorator {
    public ValidationDecorator(DataService wrappedService) { super(wrappedService); }
    @Override public void processData(String data) {
        if (validateData(data)) { super.processData(data); }
    }
    private boolean validateData(String data) { return data != null && !data.isEmpty(); }
}

public class Main {
    public static void main(String[] args) {
        DataService dataService = new DataProcessingService();
        DataService withLogging = new LoggingDecorator(dataService);
        DataService withLoggingAndValidation = new ValidationDecorator(withLogging);
        withLoggingAndValidation.processData("Some data");
    }
}
```

Roles: `DataService` (component interface), `DataProcessingService` (concrete component), `DataServiceDecorator` (abstract decorator), `LoggingDecorator`/`ValidationDecorator` (concrete decorators). Decorators can be **stacked** (validation wraps logging wraps processing), each adding one concern. This keeps code modular, reusable, clean, and maintainable.

> **Decorator vs Proxy vs Inheritance:** Decorator and Proxy both wrap and preserve the interface, but Decorator's intent is _adding features_ (and stacking them), while Proxy's is _controlling access_. Decorator favors composition over subclass explosion — instead of `LoggingValidatingService`, `LoggingService`, `ValidatingService` subclasses, you compose behaviors at runtime. Java's `BufferedReader(new FileReader(...))` is the canonical decorator.

## 3.3 Behavioral Patterns

### Template Method

**Purpose:** define the **skeleton of an algorithm** in a method, deferring some steps to subclasses. Subclasses redefine specific steps _without changing the algorithm's structure_.
**Backend use case:** report generation — general flow (collect, process, format, print) is fixed, but the collect/process specifics vary by report type (financial, sales).

```java
public abstract class ReportGenerator {
    public final void generateReport() {   // the "template method" — note it's final
        collectData();
        processData();
        formatReport();
        printReport();
    }
    abstract void collectData();
    abstract void processData();
    void formatReport() { System.out.println("Formatting report..."); }
    void printReport() { System.out.println("Printing report..."); }
}

public class FinancialReportGenerator extends ReportGenerator {
    @Override void collectData() { System.out.println("Collecting financial data..."); }
    @Override void processData() { System.out.println("Processing financial data..."); }
}

public class SalesReportGenerator extends ReportGenerator {
    @Override void collectData() { System.out.println("Collecting sales data..."); }
    @Override void processData() { System.out.println("Processing sales data..."); }
}
```

`generateReport()` is `final` so subclasses cannot alter the _sequence_; they only fill in abstract steps (`collectData`, `processData`) while inheriting default concrete steps (`formatReport`, `printReport`). This standardizes the algorithm while allowing controlled variation — improving reuse and maintainability.

### Mediator

**Purpose:** centralize complex communication between objects in a **mediator**, reducing direct dependencies. Colleagues talk _through_ the mediator, not to each other, promoting loose coupling.
**Backend use case:** a messaging/event hub where components (inventory, payment processor, notifications) interact via one mediator rather than directly.

```java
public interface Mediator { void send(String message, Colleague colleague); }

abstract class Colleague {
    protected Mediator mediator;
    public Colleague(Mediator mediator) { this.mediator = mediator; }
    public abstract void send(String message);
    public abstract void receive(String message);
}

class ConcreteColleague1 extends Colleague {
    public ConcreteColleague1(Mediator mediator) { super(mediator); }
    @Override public void send(String message) { mediator.send(message, this); }
    @Override public void receive(String message) { System.out.println("ConcreteColleague1 received: " + message); }
}
class ConcreteColleague2 extends Colleague {
    public ConcreteColleague2(Mediator mediator) { super(mediator); }
    @Override public void send(String message) { mediator.send(message, this); }
    @Override public void receive(String message) { System.out.println("ConcreteColleague2 received: " + message); }
}

class ConcreteMediator implements Mediator {
    private ConcreteColleague1 colleague1;
    private ConcreteColleague2 colleague2;
    public void setColleague1(ConcreteColleague1 c) { this.colleague1 = c; }
    public void setColleague2(ConcreteColleague2 c) { this.colleague2 = c; }
    @Override public void send(String message, Colleague colleague) {
        if (colleague == colleague1) { colleague2.receive(message); }
        else if (colleague == colleague2) { colleague1.receive(message); }
    }
}
```

The mediator routes messages, so colleagues never reference each other directly — easing maintenance and scalability.

> **Mediator vs Observer:** both decouple communication. Mediator centralizes many-to-many interaction in one hub; Observer is a one-to-many broadcast from a subject to subscribers.

### Chain of Responsibility

**Purpose:** pass a request along a **chain of handlers**; each handler either processes it or forwards it. The sender needn't know which handler will act, decoupling sender from receivers and letting more than one object get a chance to handle the request.
**Backend use case:** HTTP request handling in a web server — separate handlers for authentication, logging, input validation, error handling, etc.

```java
public interface Handler {
    void setNext(Handler handler);
    void handleRequest(Request request);
}

class Request { String requestType; }

class ConcreteHandler1 implements Handler {
    private Handler next;
    @Override public void setNext(Handler handler) { this.next = handler; }
    @Override public void handleRequest(Request request) {
        if ("Type1".equals(request.requestType)) {
            System.out.println("ConcreteHandler1 handling request of Type1");
        } else if (next != null) { next.handleRequest(request); }
    }
}

class ConcreteHandler2 implements Handler {
    private Handler next;
    @Override public void setNext(Handler handler) { this.next = handler; }
    @Override public void handleRequest(Request request) {
        if ("Type2".equals(request.requestType)) {
            System.out.println("ConcreteHandler2 handling request of Type2");
        } else if (next != null) { next.handleRequest(request); }
    }
}
```

You wire `handler1.setNext(handler2)` and send requests to the head of the chain. This is exactly how **servlet filters** and Spring Security's filter chain work.

### Observer

**Purpose:** establish a **subscription** relationship — when a **subject** changes state, all its **observers** are notified and updated automatically. Enables low coupling; observers can subscribe/unsubscribe at runtime.
**Backend use case:** notification/event systems — e.g., on a new purchase order, notify inventory, UI, and email services.

```java
interface Observer { void update(String message); }

interface Subject {
    void attach(Observer o);
    void detach(Observer o);
    void notifyUpdate(String message);
}

class ConcreteSubject implements Subject {
    private List<Observer> observers = new ArrayList<>();
    @Override public void attach(Observer o) { observers.add(o); }
    @Override public void detach(Observer o) { observers.remove(o); }
    @Override public void notifyUpdate(String message) {
        for (Observer o : observers) { o.update(message); }
    }
}

class ConcreteObserver implements Observer {
    private String name;
    ConcreteObserver(String name) { this.name = name; }
    @Override public void update(String message) {
        System.out.println(name + " received message: " + message);
    }
}
```

Observers register via `attach`; on `notifyUpdate`, every observer's `update` fires. Ideal for state-change broadcasting and separation of concerns. It underlies event listeners, pub/sub, and reactive streams.

### Strategy

**Purpose:** define a **family of interchangeable algorithms**, encapsulate each, and let the algorithm vary independently of the client using it. Behaviors are selected — and swapped — at runtime.
**Backend use case:** a payment system with strategies for credit card, PayPal, crypto; the system switches based on user choice.

```java
interface PaymentStrategy { void processPayment(double amount); }

class CreditCardPaymentStrategy implements PaymentStrategy {
    @Override public void processPayment(double amount) {
        System.out.println("Processing credit card payment of $" + amount);
    }
}
class PayPalPaymentStrategy implements PaymentStrategy {
    @Override public void processPayment(double amount) {
        System.out.println("Processing PayPal payment of $" + amount);
    }
}

class PaymentContext {
    private PaymentStrategy strategy;
    public void setStrategy(PaymentStrategy strategy) { this.strategy = strategy; }
    public void executeStrategy(double amount) { strategy.processPayment(amount); }
}
```

The `PaymentContext` holds a strategy and delegates to it; you `setStrategy(...)` then `executeStrategy(...)`.

> **Strategy vs State:** structurally near-identical (both delegate to a swappable object). Intent differs: Strategy picks _how_ to do one thing (algorithm choice), and the client usually sets it; State changes _what the object does across a lifecycle_, and the states usually trigger their own transitions.

### Command

**Purpose:** encapsulate a request as an **object**, letting you parameterize clients with different requests, queue or log them, and support **undo/redo**. It separates the object that _issues_ a request from the one that _knows how to execute_ it.
**Backend use case:** undo/redo, transactions, work queues, operation logging — e.g., database operations represented as commands to enable undo/redo, transactions, and auditing.

```java
interface Command { void execute(); }

class ConcreteCommand1 implements Command {
    private Receiver receiver;
    ConcreteCommand1(Receiver receiver) { this.receiver = receiver; }
    @Override public void execute() { receiver.action1(); }
}
class ConcreteCommand2 implements Command {
    private Receiver receiver;
    ConcreteCommand2(Receiver receiver) { this.receiver = receiver; }
    @Override public void execute() { receiver.action2(); }
}

class Receiver {
    void action1() { System.out.println("Executing action 1"); }
    void action2() { System.out.println("Executing action 2"); }
}

class Invoker {
    private Command command;
    void setCommand(Command command) { this.command = command; }
    void executeCommand() { command.execute(); }
}
```

Roles: `Command` (interface), concrete commands (wrap a request, delegating to a `Receiver`), `Receiver` (holds the real business logic), `Invoker` (triggers execution — could be a queue, menu, or UI button).

### State

**Purpose:** let an object **alter its behavior when its internal state changes**, encapsulating each state in its own class. Avoids sprawling conditionals; the object appears to change class.
**Backend use case:** order management — states like New, Approved, Packed, Shipped, Delivered, Cancelled — where behavior depends on the current state.

```java
interface OrderState {
    void next(Order order);
    void previous(Order order);
    void printStatus();
}

class Order {
    private OrderState state;
    public Order() { state = new NewState(); }
    public void setState(OrderState state) { this.state = state; }
    public void next() { state.next(this); }
    public void previous() { state.previous(this); }
    public void printStatus() { state.printStatus(); }
}

class NewState implements OrderState {
    @Override public void next(Order order) { order.setState(new ApprovedState()); }
    @Override public void previous(Order order) { System.out.println("The order is in its root state."); }
    @Override public void printStatus() { System.out.println("Order is in NEW state."); }
}
class ApprovedState implements OrderState {
    @Override public void next(Order order) { order.setState(new ShippedState()); }
    @Override public void previous(Order order) { order.setState(new NewState()); }
    @Override public void printStatus() { System.out.println("Order is in APPROVED state."); }
}
class ShippedState implements OrderState {
    @Override public void next(Order order) { order.setState(new DeliveredState()); }
    @Override public void previous(Order order) { order.setState(new ApprovedState()); }
    @Override public void printStatus() { System.out.println("Order is in SHIPPED state."); }
}
class DeliveredState implements OrderState {
    @Override public void next(Order order) { System.out.println("This is the final state."); }
    @Override public void previous(Order order) { order.setState(new ShippedState()); }
    @Override public void printStatus() { System.out.println("Order is in DELIVERED state."); }
}
```

The `Order` (context) delegates `next`/`previous`/`printStatus` to its current state object; each state knows the valid transitions. This keeps state-dependent behavior organized and easy to extend.

### Visitor

**Purpose:** perform operations over a set of objects of **different classes without changing those classes**. It separates an algorithm from the objects it operates on, so you can add new operations by adding new visitors.
**Backend use case:** a reporting system generating varied reports (financial, inventory, sales) over a data structure of different element classes — one visitor per report type, no changes to the data classes.

```java
interface Visitor {
    void visit(ConcreteElementA element);
    void visit(ConcreteElementB element);
}

interface Element { void accept(Visitor visitor); }

class ConcreteElementA implements Element {
    public void accept(Visitor visitor) { visitor.visit(this); }
    String operationA() { return "ConcreteElementA"; }
}
class ConcreteElementB implements Element {
    public void accept(Visitor visitor) { visitor.visit(this); }
    String operationB() { return "ConcreteElementB"; }
}

class ConcreteVisitor1 implements Visitor {
    public void visit(ConcreteElementA element) { System.out.println("ConcreteVisitor1 visiting " + element.operationA()); }
    public void visit(ConcreteElementB element) { System.out.println("ConcreteVisitor1 visiting " + element.operationB()); }
}
class ConcreteVisitor2 implements Visitor {
    public void visit(ConcreteElementA element) { System.out.println("ConcreteVisitor2 visiting " + element.operationA()); }
    public void visit(ConcreteElementB element) { System.out.println("ConcreteVisitor2 visiting " + element.operationB()); }
}
```

Elements `accept` a visitor and call back `visitor.visit(this)` — this callback trick is called **double dispatch**, and it's how the correct overload is chosen at runtime. Add new operations by writing new visitors; the element classes stay untouched.

> **Trade-off:** Visitor makes adding _operations_ easy but adding new _element types_ hard (every visitor must gain a new `visit` overload). It's the inverse trade-off of most OOP.

### Interpreter

**Purpose:** define a grammar for a language and an interpreter that evaluates sentences in it. Useful for programming languages, text-processing engines, and command processors.
**Backend use case:** interpreting custom query languages, markup/scripting, configuration languages, automation commands, or expressions in a business-rules engine.

```java
interface Expression { int interpret(); }

class Number implements Expression {
    private int number;
    public Number(int number) { this.number = number; }
    @Override public int interpret() { return number; }
}

class Plus implements Expression {
    private Expression leftOperand;
    private Expression rightOperand;
    public Plus(Expression left, Expression right) { this.leftOperand = left; this.rightOperand = right; }
    @Override public int interpret() { return leftOperand.interpret() + rightOperand.interpret(); }
}

class Minus implements Expression {
    private Expression leftOperand;
    private Expression rightOperand;
    public Minus(Expression left, Expression right) { this.leftOperand = left; this.rightOperand = right; }
    @Override public int interpret() { return leftOperand.interpret() - rightOperand.interpret(); }
}

public class Main {
    public static void main(String[] args) {
        Expression expression = new Plus(new Number(5), new Minus(new Number(3), new Number(1)));
        System.out.println(expression.interpret()); // Prints 7 (5 + (3 - 1))
    }
}
```

Each grammar rule becomes a class implementing `interpret()`. Composing them builds an **abstract syntax tree** that evaluates recursively.

### Memento

**Purpose:** capture and store an object's current state so it can be **restored later**, without violating encapsulation. Powers undo/redo and versioning.
**Backend use case:** managing object states — e.g., DB transactions needing prior-state restoration, or a configuration manager saving/restoring config versions.

```java
class Memento {
    private String state;
    public Memento(String state) { this.state = state; }
    public String getState() { return state; }
}

class Originator {
    private String state;
    public void setState(String state) { this.state = state; }
    public String getState() { return state; }
    public Memento saveStateToMemento() { return new Memento(state); }
    public void getStateFromMemento(Memento memento) { state = memento.getState(); }
}

class Caretaker {
    private List<Memento> mementoList = new ArrayList<>();
    public void add(Memento state) { mementoList.add(state); }
    public Memento get(int index) { return mementoList.get(index); }
}
```

Three roles: **Memento** (stores the snapshot), **Originator** (creates/restores snapshots of its own state), **Caretaker** (holds mementos but never inspects their contents — preserving encapsulation). You save states, keep working, then restore an earlier saved state.

### Iterator

**Purpose:** provide a way to access elements of an aggregate object (list, tree, any collection) **sequentially** without exposing its underlying representation. Decouples algorithms from data structures.
**Backend use case:** traversing data collections — DB records, task lists, tree nodes — uniformly, without the client knowing internal structure.

```java
interface Iterator {
    boolean hasNext();
    Object next();
}

interface Aggregate { Iterator createIterator(); }

class ConcreteAggregate implements Aggregate {
    private List<Object> items = new ArrayList<>();
    public void add(Object item) { items.add(item); }
    @Override public Iterator createIterator() { return new ConcreteIterator(this); }
    public Object get(int index) { return items.get(index); }
    public int size() { return items.size(); }
}

class ConcreteIterator implements Iterator {
    private ConcreteAggregate aggregate;
    private int currentIndex = 0;
    public ConcreteIterator(ConcreteAggregate aggregate) { this.aggregate = aggregate; }
    @Override public boolean hasNext() { return currentIndex < aggregate.size(); }
    @Override public Object next() {
        if (this.hasNext()) { return aggregate.get(currentIndex++); }
        return null;
    }
}
```

The aggregate creates an iterator exposing `hasNext()`/`next()`; the client loops without touching internals. Java's `java.util.Iterator` and the enhanced `for` loop are this pattern built into the language.

> **Most-likely-tested (Part III):**
>
> - Family classification: Creational (Singleton, Factory, Abstract Factory, Builder, Prototype), Structural (Adapter, Composite, Proxy, Flyweight, Facade, Bridge, Decorator), Behavioral (Template Method, Mediator, Chain of Responsibility, Observer, Strategy, Command, State, Visitor, Interpreter, Memento, Iterator).
> - Singleton = one instance + private constructor + `getInstance()` (know the thread-safety caveat).
> - Factory vs Abstract Factory (one product vs family).
> - Strategy vs State (algorithm choice vs lifecycle behavior).
> - Adapter vs Proxy vs Decorator vs Facade (convert / control / add / simplify).
> - Observer = one-to-many notification; Mediator = centralized many-to-many.
> - Bridge exemplifies Open/Closed Principle.
> - Command supports undo/redo and queuing; Memento supports state snapshots.

### Part III summary

Twenty-three GoF patterns in three families. Creational patterns decouple _creation_; structural patterns compose _structure_; behavioral patterns organize _communication and responsibility_. The highest-value distinctions for exams are the confusable pairs (Factory/Abstract Factory, Strategy/State, Adapter/Proxy/Decorator/Facade, Observer/Mediator).

---

# PART IV — Spring Beans

A **bean** in the Spring Framework is an object that is **instantiated, assembled, and managed** by the Spring container. Beans are the core building blocks of any Spring application and are managed by the **Spring IoC (Inversion of Control) container**.

> **What "Inversion of Control" means:** normally your code creates its own dependencies (`new Service()`). With IoC, the container creates and wires them for you and hands them to your objects — you _receive_ dependencies instead of _making_ them. **Dependency Injection (DI)** is the mechanism that delivers this. This is why you rarely call `new` on Spring-managed classes.

## 4.1 Bean Lifecycle

The lifecycle is the sequence a bean passes through from creation to destruction, managed by the container. The eight stages:

1. **Instantiation** — the container creates a bean instance, usually via reflection, using the bean definition from configuration (XML, annotations, or Java Config).
2. **Population of properties** — Spring injects all configured dependencies (other beans, primitives, collections) into the new instance.
3. **Aware interfaces configuration** — if the bean implements certain interfaces, Spring passes it the corresponding reference:
   - `BeanNameAware` → the bean's name.
   - `BeanFactoryAware` → the `BeanFactory` that created it.
   - `ApplicationContextAware` → the containing `ApplicationContext`.
   - `EnvironmentAware`, `ResourceLoaderAware`, `MessageSourceAware`, etc. → resource-specific references.
4. **Pre-initialization (BeanPostProcessors)** — before real initialization, each `BeanPostProcessor`'s `postProcessBeforeInitialization` runs; these can modify the bean.
5. **Initialization** — if the bean implements `InitializingBean`, its `afterPropertiesSet` runs after properties are set. Also, any custom init method (annotated `@PostConstruct` or configured via `init-method`) runs.
6. **Post-initialization (BeanPostProcessors)** — each `BeanPostProcessor`'s `postProcessAfterInitialization` runs; this is where a bean can be **wrapped in a proxy** to enable aspects like security, transactions, or caching.
7. **Bean in use** — fully configured and ready for the application to use.
8. **Destruction** — when the app/container shuts down, beans implementing `DisposableBean` have `destroy` called; any custom destroy method (annotated `@PreDestroy` or configured via `destroy-method`) also runs, letting the bean release resources and clean up before garbage collection.

> **Tie-in to Part III:** stage 6 is literally the **Proxy pattern** at work — this is how `@Transactional` and Spring Security wrap your beans without you writing wrapper code.

## 4.2 Bean Scopes

A bean's **scope** determines its lifecycle and whether/how it's shared among objects that need it.

| Scope                   | Instances                            | Where it lives / when created                                                                                           | Best for                                          |
| ----------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| **Singleton** (default) | One per container, cached and reused | Created once; all later requests return the cached instance                                                             | Stateless services                                |
| **Prototype**           | A new instance on _every_ request    | Created fresh each time it's requested                                                                                  | Stateful beans where state must not be shared     |
| **Request** (web)       | One per HTTP request                 | New instance for each HTTP request; not shared across requests                                                          | Data that must live for one request               |
| **Session** (web)       | One per HTTP session                 | One instance per user session, shared across that session's requests; different sessions get different instances        | Per-user state across a session                   |
| **Application** (web)   | One per `ServletContext`             | Stored in the `ServletContext`; like singleton but per web application (multiple apps on one server each get their own) | App-wide shared state in a web app                |
| **WebSocket**           | One per WebSocket connection         | Separate instance for each WebSocket connection                                                                         | Connection-specific state over a WebSocket's life |

Choosing the right scope depends on whether state should be shared, the application type (web, desktop, batch), and resource-management needs.

> **Subtle distinction the source flags:** **Application** scope resembles **Singleton**, but Singleton is one-per-Spring-container while Application is one-per-`ServletContext` — if multiple web apps run on the same server, each has its own application-scoped bean.

## 4.3 Bean Specializations (stereotype annotations)

These annotations mark and classify beans by role. They organize code _and_ can add role-specific behavior.

| Annotation        | Role                            | Notes                                                                                                                                                                       |
| ----------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@Component`      | Generic Spring-managed bean     | The base stereotype; makes a class a candidate for component scanning/auto-detection.                                                                                       |
| `@Repository`     | Data-access / persistence layer | Used on DB-access classes (typically ORM). **Adds behavior:** translates persistence exceptions into Spring's `DataAccessException` hierarchy.                              |
| `@Service`        | Business-logic / service layer  | Marks service-layer classes; no special semantics beyond the marking.                                                                                                       |
| `@Controller`     | Spring MVC web controller       | Marks a class that handles HTTP requests in the MVC pattern.                                                                                                                |
| `@RestController` | RESTful web controller          | Specialization of `@Controller` + `@ResponseBody`. Each method returns a domain object (serialized, e.g. to JSON) instead of a view. Ideal for microservices and JSON APIs. |
| `@Configuration`  | Source of bean definitions      | Contains `@Bean`-annotated methods that instantiate and configure beans managed by the container.                                                                           |

The key insight: these aren't just labels. `@Repository` in particular changes how Spring handles persistence-layer exceptions. `@RestController` changes how return values are handled (serialized to the response body vs resolved to a view).

> **Most-likely-tested (Part IV):**
>
> - The 8 lifecycle stages in order; know that `@PostConstruct`/`InitializingBean.afterPropertiesSet`/`init-method` are the three init hooks, and `@PreDestroy`/`DisposableBean.destroy`/`destroy-method` are the three destroy hooks.
> - `BeanPostProcessor` runs _around_ initialization (before/after) and is where proxying happens.
> - Default scope is **singleton**; prototype = new instance each request.
> - Web scopes: request, session, application, websocket.
> - `@RestController` = `@Controller` + `@ResponseBody`; `@Repository` adds exception translation.

### Part IV summary

Beans are container-managed objects wired by IoC/DI. Their lifecycle runs from instantiation → property population → aware interfaces → post-processor pre-init → initialization → post-processor post-init → use → destruction, with three init hooks and three destroy hooks. Scope controls sharing (singleton default, prototype, and the web scopes request/session/application/websocket). Stereotype annotations (`@Component` and its specializations) classify beans and sometimes add behavior.

---

# PART V — Spring & Spring Boot Annotations

Spring and Spring Boot provide many annotations that replace boilerplate/XML with **declarative configuration**. This part groups the source's annotation lists and cross-references the concepts above.

## 5.1 Common Spring Framework annotations

1. **`@Autowired`** — automatic dependency injection (Spring supplies the required bean).
2. **`@Component`** — marks a class as a Spring component, auto-detected during component scanning.
3. **`@Service`** — specializes `@Component` for service/business-logic classes.
4. **`@Repository`** — specializes `@Component` for data-access/persistence classes.
5. **`@Controller`** — specializes `@Component` for handling HTTP requests in web apps.
6. **`@Bean`** — used inside `@Configuration` classes to declare a Spring bean (the method's return value becomes a managed bean).
7. **`@RequestMapping`** — maps web requests to controller methods (by path, HTTP method, etc.).
8. **`@Qualifier`** — disambiguates which bean to inject when several of the same type exist.
9. **`@Value`** — injects property values into beans (e.g., from `application.properties`).
10. **`@Transactional`** — declares transactions on methods or classes (implemented via proxies — see Part IV/Proxy).

## 5.2 Common Spring Boot annotations

1. **`@SpringBootApplication`** — a convenience annotation combining `@Configuration`, `@EnableAutoConfiguration`, and `@ComponentScan` for fast, easy Spring Boot app setup.
2. **`@RestController`** — combines `@Controller` and `@ResponseBody`; used to build RESTful web services.
3. **`@RequestMapping` and its derivatives** (`@GetMapping`, `@PostMapping`, `@PutMapping`, etc.) — map web requests to methods in REST controllers, one per HTTP verb.
4. **`@EnableAutoConfiguration`** — tells Spring Boot to auto-configure based on the dependencies present on the classpath.
5. **`@ConfigurationProperties`** — binds and validates configuration properties onto a class (type-safe config).
6. **`@SpringBootTest`** — used in tests to load the full application context.
7. **`@AutoConfigureMockMvc`, `@WebMvcTest`, `@DataJpaTest`, etc.** — provide test configuration slices for specific application layers (web layer, JPA layer, etc.).
8. **`@EnableConfigurationProperties`** — enables support for `@ConfigurationProperties`.

These annotations are fundamental to Spring/Spring Boot development because they enable **declarative configuration** that reduces repetitive boilerplate, making robust, efficient applications easier to create and maintain.

> **Concept connections worth remembering:**
>
> - `@SpringBootApplication` is three annotations in one — this is why a single `main` class bootstraps the whole app.
> - `@GetMapping` etc. are shorthands for `@RequestMapping(method = ...)`.
> - The `*Test` slice annotations load _only part_ of the context for faster, focused tests, whereas `@SpringBootTest` loads _everything_.
> - `@Autowired` + `@Qualifier` together solve the "multiple candidate beans" problem.

> **Most-likely-tested (Part V):**
>
> - What `@SpringBootApplication` expands to (`@Configuration` + `@EnableAutoConfiguration` + `@ComponentScan`).
> - `@RestController` = `@Controller` + `@ResponseBody`.
> - `@Qualifier` resolves ambiguous injection; `@Value` injects properties.
> - `@Transactional` is proxy-based (relates to bean post-processing).
> - Test slices (`@WebMvcTest`, `@DataJpaTest`) vs full-context `@SpringBootTest`.

### Part V summary

Spring's annotations turn configuration into declarations on classes and methods. Core injection/config annotations (`@Autowired`, `@Bean`, `@Value`, `@Qualifier`, `@Transactional`), web-mapping annotations (`@RequestMapping` + verb shortcuts), stereotypes (`@Component` family), and Boot's convenience/auto-config/test annotations together minimize boilerplate.

---

# Cross-Cutting Connections (how the parts reinforce each other)

- **Proxy pattern ↔ Spring beans ↔ `@Transactional`:** Bean lifecycle stage 6 wraps beans in proxies; `@Transactional` and Spring Security are concrete uses of the Proxy pattern.
- **Chain of Responsibility ↔ web security:** the servlet/Spring Security filter chain _is_ Chain of Responsibility.
- **Factory / Abstract Factory ↔ Spring container:** the IoC container is essentially a sophisticated object factory.
- **Strategy ↔ payment systems ↔ JPA Specifications:** all three swap behavior/criteria at runtime.
- **Observer ↔ Spring events:** Spring's `ApplicationEvent`/listener mechanism is the Observer pattern.
- **Injection (OWASP A03) ↔ JPA:** parameterized queries and `@Query` positional parameters are the defense against SQL injection.

---

# Final Rapid-Review Checklist

**Security:** OWASP Top 10 2021 order; Injection = A03; new categories = Insecure Design (A04) + SSRF (A10); XXE→Misconfiguration, XSS→Injection.

**JPA:** relationship annotations + cascade/fetch/mappedBy (mappedBy on inverse side); LAZY vs EAGER defaults; Query Methods keyword grammar; `@Query` + `?1`; Specifications need `JpaSpecificationExecutor`.

**Patterns:** 23 patterns in 3 families; memorize the confusable pairs and one-line intent of each.

**Beans:** 8 lifecycle stages; 3 init + 3 destroy hooks; 6 scopes; 6 stereotypes; IoC/DI meaning.

**Annotations:** what `@SpringBootApplication` and `@RestController` expand to; injection/config/mapping/test annotations.
