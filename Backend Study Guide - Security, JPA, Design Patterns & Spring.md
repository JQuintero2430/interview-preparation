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

6. **`@SpringBootApplication` does not expand to plain `@Configuration`.** The source (and most blog posts) say `@Configuration` + `@EnableAutoConfiguration` + `@ComponentScan`. The first element is actually **`@SpringBootConfiguration`**, which is itself meta-annotated `@Configuration` but exists as a distinct type so that tooling — `@SpringBootTest` in particular — can locate your primary configuration class. Corrected and traced in **§5.3**.

7. **The eight-stage bean lifecycle list is a skeleton, not the exact order.** It is a fine mnemonic, but it implies that "Aware interfaces" is a dedicated phase and that `@PostConstruct` and `afterPropertiesSet` belong to the same step. In reality the `*Aware` callbacks for `ApplicationContext`/`Environment` arrive through a `BeanPostProcessor`, `@PostConstruct` runs **before** `afterPropertiesSet`, and prototype-scoped beans never reach stage 8 at all. The precise ordering is set out in **§4.1**.

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
- **`fetch` (LAZY vs EAGER)** — _when_ related data is loaded. **LAZY** delays loading the association until you actually access it (efficient, the default for `@OneToMany`/`@ManyToMany`). **EAGER** loads it immediately with the parent (the default for `@ManyToOne`/`@OneToOne`). Overusing EAGER causes performance problems and the infamous **N+1 query** issue. The mechanism, the fixes, and why EAGER is _not_ the fix are in §2.4.
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

## 2.4 The N+1 Query Problem

**Mental model:** you asked for a list of parents, then touched an association on each one. The ORM did exactly what you told it to — **one query for the N parents, then one more query per parent** to load the association. That is 1 + N round trips, and it is not a bug in Hibernate: it is lazy loading working correctly on a call pattern that never told it you wanted the children. The cost is invisible in the code (`order.getItems()` looks free) and invisible in a unit test with three rows; it appears in production as a page that got slow when the data grew.

### How it actually happens

```java
@Entity
public class Order {
    @Id private Long id;

    @OneToMany(mappedBy = "order")          // LAZY by default
    private List<OrderItem> items = new ArrayList<>();
    // getters omitted
}
```

```java
List<Order> orders = orderRepository.findAll();        // 1 query: select * from orders
for (Order order : orders) {
    total += order.getItems().size();                  // N queries: one per order
}
```

The collection field is not a `List` at runtime — Hibernate replaced it with a **persistent collection wrapper** that holds the owning entity's id and a flag saying "not initialized." The first method call on it (`size()`, `iterator()`, `get(0)`) triggers `select * from order_items where order_id = ?`. Inside an open transaction that works silently, so the only trace is 200 lines in the SQL log. Outside the transaction the same mechanism throws `LazyInitializationException` — **the same cause, a different symptom**, which is why the two are always asked about together.

The mirror case is just as common and gets noticed less: a list of children where each `item.getOrder()` walks a `@ManyToOne` proxy. Note one useful detail — calling `getId()` on an uninitialized proxy does **not** hit the database, because the identifier is already known; any other getter initializes it.

> **The trap: "just make it EAGER."** This is the most common wrong answer and it usually makes things worse. `fetch = EAGER` changes _when_ the association is loaded, not _how many queries_ it takes: for a `findAll()`, Hibernate still issues a separate select per parent, so you keep the N+1 **and** now pay it on every single read of the entity, including the ones that never touch the collection. EAGER also removes your ability to opt out per query. Fetching strategy belongs on the **query**, not on the mapping.

### The fixes, in the order you should reach for them

**1. `JOIN FETCH` — say what you want in the query.**

```java
@Query("select o from Order o join fetch o.items where o.status = :status")
List<Order> findWithItems(@Param("status") OrderStatus status);
```

One query, one round trip. Two caveats worth volunteering because interviewers probe them:

- **Pagination breaks.** Combine a collection `join fetch` with `Pageable` and Hibernate cannot express the limit in SQL (a join multiplies rows, so `LIMIT 20` would cut children, not parents). It warns that it is applying `firstResult`/`maxResults` **in memory** — it fetches the entire result set and paginates in the JVM. The fix is two queries: page the ids first, then `where o.id in :ids` with the fetch.
- **`MultipleBagFetchException`.** Two `join fetch`es of two `List`-mapped collections in one query fails outright with "cannot simultaneously fetch multiple bags." Map one of them as a `Set`, or fetch the second collection in a separate query — and note that joining two collections produces a cartesian product anyway, so separate queries are usually the better design, not just the workaround.
- **Duplicate parents** are a version-dependent detail: with older Hibernate you needed `select distinct o` to collapse the repeated parent rows a collection join produces. Hibernate 6 (Spring Boot 3.x) de-duplicates the returned entities automatically, so the `distinct` is no longer required for that purpose. Know which version you are talking about before asserting either.

**2. `@EntityGraph` — the declarative form, and the one that works with derived queries.**

```java
@EntityGraph(attributePaths = "items")
List<Order> findByStatus(OrderStatus status);
```

Same effect as a join fetch, without hand-writing JPQL, and it composes with Spring Data's method-name queries. Use a named entity graph on the entity when several repositories need the same shape.

**3. Batch fetching — the safety net when you cannot restructure the call.** Set `spring.jpa.properties.hibernate.default_batch_fetch_size` (or `@BatchSize` on the association), and Hibernate stops issuing one select per parent: it collects the pending ids and loads them in batches with `where order_id in (?, ?, ?, …)`. N queries become roughly N / batch-size. This does not eliminate the extra round trips, it amortizes them — but it turns a 500-query page into a 5-query page with a one-line config change, which makes it the highest-leverage default in an existing codebase. Set it explicitly rather than relying on a framework default.

**4. Don't load entities at all — project.** If the endpoint returns a summary, select the fields you need and skip the object graph:

```java
public interface OrderSummary {          // Spring Data interface projection
    Long getId();
    long getItemCount();
}

@Query("select o.id as id, count(i.id) as itemCount from Order o left join o.items i group by o.id")
List<OrderSummary> findSummaries();
```

One query, no managed entities, no lazy collections to trip over. For read-heavy endpoints this is usually the correct fix rather than a workaround — the N+1 was a symptom of loading a write-model graph to answer a read question.

**5. Second-level cache** can hide the problem for hot, rarely-changing reference data. It is a mitigation, not a fix, and it adds an invalidation problem you did not have before. Mention it last, and say so.

### How to find it before production

You detect N+1 by **counting queries**, not by reading code. Turn on `logging.level.org.hibernate.SQL=DEBUG` in development to see them, and `spring.jpa.properties.hibernate.generate_statistics=true` to get counters you can assert on. The durable version is a test that fails when the count changes: capture Hibernate's `Statistics.getPrepareStatementCount()` (or use a query-counting datasource proxy) before and after the call, and assert the expected number. That converts a performance regression into a failing build, which is the only mechanism that actually holds over time.

> **Tie-in to Part IV:** the `LazyInitializationException` half of this problem is a transaction-boundary problem, not a JPA problem — the persistence context lives as long as the transaction (§4.5), so an entity that leaves the service layer un-initialized has already lost its ability to load anything. Fetch what the caller needs _inside_ the boundary, or map to a DTO before returning.

> **What the interviewer is really testing:** whether you understand that fetch strategy is a per-query decision and that "make it EAGER" trades one problem for a worse one. The strong answer names the mechanism (lazy collection wrapper, initialized on first access), gives at least two fixes with their trade-offs, and volunteers how you would _detect_ it. **The follow-up that usually comes next:** "your `join fetch` query now needs pagination — what happens?" — the in-memory pagination warning above, and the two-query id-then-fetch pattern.

> **Most-likely-tested (Part II):**
>
> - `mappedBy` goes on the **inverse/non-owning** side.
> - LAZY vs EAGER defaults: `@OneToMany`/`@ManyToMany` = LAZY; `@ManyToOne`/`@OneToOne` = EAGER.
> - Query Methods derive SQL from method names; `@Query` overrides with hand-written JPQL and `?1` positional params.
> - Specifications = dynamic queries via the Criteria API; repository must extend `JpaSpecificationExecutor<T>`.
> - **N+1 queries** come from lazy loading firing once per parent; you fix them per _query_ (`join fetch`, `@EntityGraph`, `hibernate.default_batch_fetch_size`, or a DTO projection), never by changing the mapping to EAGER (§2.4).
> - A collection `join fetch` combined with `Pageable` paginates **in memory**; two `List`-mapped collections fetched in one query throw `MultipleBagFetchException` (§2.4).

### Part II summary

JPA maps objects to tables. You declare relationships with `@OneToOne`/`@OneToMany`/`@ManyToOne`/`@ManyToMany` plus `@JoinColumn`/`@JoinTable`, tuning behavior with `cascade`, `fetch`, and `mappedBy`. For queries, three tools scale with complexity: derived **Query Methods** (name-based, static), **`@Query`** (hand-written when names fall short), and **Specifications** (programmatic, dynamic, composable via the Criteria API). The performance failure to know cold is the **N+1 query problem** (§2.4): lazy loading issuing one query per parent, fixed per query with `join fetch`, `@EntityGraph`, batch fetching, or a projection — never by making the mapping EAGER.

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

### What the eight-stage list glosses over (the mechanically precise order)

The eight stages are the right skeleton, but three details inside them are what interviewers actually probe, and the list as written implies an ordering that isn't quite the real one.

**There is a phase before any instance exists.** The container first builds **`BeanDefinition`** objects — from component scanning, `@Bean` methods, `@Import`, XML — and then runs every **`BeanFactoryPostProcessor`**, which can modify those _definitions_ while no bean has been instantiated yet. `ConfigurationClassPostProcessor` (which parses `@Configuration` classes and performs the scan) and `PropertySourcesPlaceholderConfigurer` (which resolves `${...}`) are both of this kind. The distinction is a standard question: **`BeanFactoryPostProcessor` edits definitions, `BeanPostProcessor` edits instances.** If you need to change what a bean _is_, you are in the first; if you need to wrap or decorate an instance, the second.

**Constructor injection collapses stages 1 and 2.** "Instantiate, then populate properties" describes setter and field injection. With constructor injection the dependencies must be resolved _before_ the object can exist, so the container resolves them first and then calls the constructor once — which is precisely why a constructor-injected field can be `final` and can never be observed null. Field and setter injection happen afterwards, in `populateBean`, performed by `AutowiredAnnotationBeanPostProcessor`. This is the mechanism behind the most common Spring bug there is: **an `@Autowired` field is still `null` inside the constructor** and only set by the time `@PostConstruct` runs.

**"Aware interfaces" is not a single phase, and the three init hooks are not simultaneous.** The real sequence for one bean, once its properties are populated, is:

1. `BeanNameAware`, `BeanClassLoaderAware`, `BeanFactoryAware` — invoked directly by the bean factory.
2. `postProcessBeforeInitialization` of every `BeanPostProcessor`. Two of those matter by name: `ApplicationContextAwareProcessor` is what supplies `ApplicationContextAware`, `EnvironmentAware`, `ResourceLoaderAware` and friends — so those callbacks arrive _through a post-processor_, not through a hard-coded stage — and `CommonAnnotationBeanPostProcessor` is what invokes **`@PostConstruct`**.
3. `InitializingBean.afterPropertiesSet()`.
4. The custom init method (`@Bean(initMethod = ...)` or XML `init-method`).
5. `postProcessAfterInitialization` of every `BeanPostProcessor` — where **proxies are created** (`AbstractAutoProxyCreator` and friends).

So the three initialization hooks fire in the order **`@PostConstruct` → `afterPropertiesSet` → `init-method`**, and the destruction hooks mirror it: **`@PreDestroy` → `DisposableBean.destroy` → `destroy-method`**. Being able to state that order, and to say that `@PostConstruct` arrives via a `BeanPostProcessor` rather than a dedicated stage, is the difference between having memorized the list and understanding it.

**Two consequences worth carrying forward.** First, because the proxy is created in step 5 — _after_ your object is fully built — the reference your own code holds in `this` is always the **raw target**, never the proxy. That single fact explains every "my `@Transactional`/`@Async`/`@Cacheable` annotation did nothing" bug (§4.5). Second, initialization order across beans is driven by the dependency graph, not by declaration order: singletons are instantiated eagerly during `refresh()` (`preInstantiateSingletons`), each pulling in whatever it depends on, unless marked `@Lazy`.

**And one thing the list is simply wrong about for prototypes.** Stage 8 does not apply to them. The container creates a prototype, hands it over, and **stops tracking it** — so `@PreDestroy`, `DisposableBean`, and `destroy-method` are **never called** on a prototype-scoped bean. If a prototype holds something that must be released, the calling code owns that cleanup.

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

### The part that breaks in practice: mixing scopes

The table tells you how many instances exist. What it does not tell you is what happens when a **longer-lived bean depends on a shorter-lived one** — and that is where scope questions actually get asked, because the naive version fails in a way that looks like a scope that "doesn't work."

A singleton is injected **once**, at startup. So injecting a prototype into a singleton gives you exactly one prototype instance, reused forever — the scope is silently defeated, no error. Injecting a request-scoped bean into a singleton is worse: at startup there is no HTTP request, so the container either fails with `Scope 'request' is not active for the current thread` or, if it succeeds, captures one request's instance and serves it to every subsequent request. Three mechanisms fix this:

| Approach                                            | What is injected                                                   | When to use it                                                                  |
| --------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| **Scoped proxy** — `@RequestScope`, or `@Scope(value = "request", proxyMode = ScopedProxyMode.TARGET_CLASS)` | A CGLIB proxy injected once; every method call resolves the real instance for the _current_ request | Web scopes injected into singletons — the default choice                        |
| **`ObjectProvider<T>` / `Provider<T>`**             | A factory; you call `getObject()` when you need one                | Prototypes, and optional or conditional dependencies                            |
| **`@Lookup` method injection**                      | An abstract/overridable method the container implements to return a fresh bean | Prototypes, when you want the call site to read as a plain method call |

The scoped proxy mechanism is worth being able to describe: the proxy holds no state of its own; on each invocation it asks the scope for the instance bound to the current context, and for request and session scope that context is a **`ThreadLocal`** (`RequestContextHolder`). Two consequences follow directly. Request and session scopes need something to populate that holder — `DispatcherServlet` does it, and outside Spring MVC you need a `RequestContextListener`. And because it is thread-bound, a request-scoped bean **does not follow work handed to another thread**: an `@Async` method, a manually created thread, or a reactive scheduler hop will find nothing bound and fail. That is the same thread-bound reasoning as the transaction context in §4.5, and interviewers like connecting the two.

**Two more details that come up.** Custom scopes are a public extension point (`ConfigurableBeanFactory.registerScope`), and Spring ships `SimpleThreadScope` as an example — documented as _not_ invoking destruction callbacks, so it leaks by design if you put resources in it. And singleton means **one per container, per bean name** — two `ApplicationContext`s in one JVM (a parent/child hierarchy, or a test slice alongside the app context) have independent singletons, which is why a "singleton" counter can appear to reset in integration tests.

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

## 4.4 How Dependency Injection Resolves a Candidate

**Mental model:** injection is not magic and it is not reflection over your whole classpath at call time. It is a **lookup by type against the set of bean definitions**, performed once per injection point while the bean is being created, followed by a recursive `getBean` for whatever it picked. Everything that goes wrong — ambiguity, missing beans, cycles, the wrong instance — is that lookup either finding too many candidates, none, or one that isn't finished being built yet.

### The resolution algorithm, in order

For a constructor parameter or an `@Autowired` field, the container:

1. **Chooses the constructor.** `AutowiredAnnotationBeanPostProcessor` looks for a constructor annotated `@Autowired`; since Spring 4.3, a class with exactly **one** constructor needs no annotation at all, which is why modern Spring code has no `@Autowired` on constructors.
2. **Resolves each dependency by type.** `DefaultListableBeanFactory.resolveDependency` asks for all bean names matching the required type — and the type includes **generics**: `ResolvableType` lets it distinguish `Repository<Order>` from `Repository<Customer>`, so two beans of the same raw type but different type arguments are not ambiguous.
3. **Narrows multiple candidates**, in this order: a matching **`@Qualifier`** wins; otherwise a **`@Primary`** bean wins; otherwise the highest **`@Priority`**; otherwise a candidate whose **bean name equals the field or parameter name**. If more than one still survives → `NoUniqueBeanDefinitionException` at startup.
4. **Handles zero candidates.** If the dependency is required → `NoSuchBeanDefinitionException` at startup. Declare it `Optional<T>`, `@Nullable`, `ObjectProvider<T>`, or `@Autowired(required = false)` if absence is legitimate.
5. **Instantiates the winner** (recursively, through the full lifecycle of §4.1) and passes it in.

Note that every failure above happens at **startup**, not on first use. That is the single strongest argument for constructor injection: a wiring mistake becomes a boot failure with a message naming the bean, instead of a `NullPointerException` in production three weeks later.

```java
@Service
public class OrderService {

    private final OrderRepository orders;      // final: proves it is set exactly once
    private final PricingPolicy pricing;

    public OrderService(OrderRepository orders, PricingPolicy pricing) {   // no @Autowired needed
        this.orders = orders;
        this.pricing = pricing;
    }
}
```

### Collections, maps, and the plug-in pattern

Injecting a collection of an interface type gives you every implementation, which is how you build a registry without writing one:

```java
public OrderService(List<OrderValidator> validators) { … }        // all beans of the type, ordered
public OrderService(Map<String, OrderValidator> byName) { … }     // bean name → bean
```

The `List` is ordered by `@Order`/`Ordered`/`@Priority`, not by declaration or scan order — relying on scan order is a real bug. And an injected `List` with **no** candidates is a failure, not an empty list, unless you mark it optional.

### The three injection styles, and why one is preferred

| Style           | How it is set                                        | Consequences                                                                                                       |
| --------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Constructor** | Arguments resolved before the instance exists        | Fields can be `final`; the object is never observable half-wired; the class is usable with plain `new` in a unit test; the constructor's arity makes too many dependencies visible |
| **Setter**      | Called during `populateBean`, after instantiation    | Allows optional and re-configurable dependencies; permits cycles; the object exists in a partially wired state      |
| **Field**       | Reflection (`Field.setAccessible(true)`) during `populateBean` | Cannot be `final`; hides dependencies from any caller reading the constructor; `new`-ing the class in a test yields nulls |

Field injection is why `@Autowired` fields are null in constructors, and why a class with six hidden field dependencies never looks as bloated as it is.

### Circular dependencies — the mechanism, and the version change

Two beans that need each other **through their constructors** cannot be built: neither can exist first, so you get `BeanCurrentlyInCreationException`. A cycle through **setters or fields** was historically resolved by Spring's three-level singleton cache: while A is being created it is placed in a map of "singleton factories," so when B asks for A it receives an **early reference** to the not-yet-initialized A, and the cycle closes. That is also the hazard — B may hold a reference to A that predates A's proxying, so B ends up with the raw object while everyone else has the proxy.

The version-dependent part matters in interviews: **since Spring Boot 2.6, circular references are disabled by default** (`spring.main.allow-circular-references=false`), so a cycle that "worked" in an older application now fails at startup with an explicit message. The correct response is not to flip the flag back on — it is to break the cycle: extract the shared behavior into a third bean, invert one direction with an event, or inject `@Lazy` (which supplies a proxy that resolves on first use) as a deliberate, documented exception.

### Related annotations you will be asked to distinguish

`@Autowired` is Spring's, resolves **by type** then narrows by qualifier/name. `@Resource` is from JSR-250 and resolves **by name** first, falling back to type. `@Inject` is JSR-330 and behaves essentially like `@Autowired` by type (with `@Named` as its qualifier). `@Value` is not injection of a bean at all — it resolves a property or SpEL expression through the `Environment`.

> **What the interviewer is really testing:** whether "Spring wires it for me" has a mechanism behind it — a type lookup with defined tie-breakers, evaluated at startup — and whether you can explain _why_ constructor injection is the default recommendation instead of quoting the recommendation. **The follow-up that usually comes next:** "you have two beans of the same type; walk me through every way to disambiguate" — `@Primary`, `@Qualifier`, matching the parameter name, `@Profile`/`@ConditionalOnProperty` so only one is registered at all, or injecting the `List`/`Map` and choosing at runtime.

## 4.5 `@Transactional` Through the Proxy

**Mental model:** `@Transactional` is not a language feature and the JVM knows nothing about it. It is **advice wrapped around your bean by a proxy created during bean post-processing** (§4.1, step 5). The transaction is begun and committed _in the proxy_, before and after your method body runs. Everything about the annotation's behavior — including every way it silently does nothing — follows from that one structural fact.

### What happens at startup

1. `@EnableTransactionManagement` — which Spring Boot's `TransactionAutoConfiguration` applies for you when a `PlatformTransactionManager` is on the classpath — registers an **auto-proxy creator** and a transaction **advisor**. The advisor pairs a pointcut (an `AnnotationTransactionAttributeSource`, which knows how to find `@Transactional` on classes and methods) with an interceptor (`TransactionInterceptor`).
2. During `postProcessAfterInitialization` for each bean, the auto-proxy creator asks the advisor whether any method of that bean matches. If one does, the bean is replaced in the container by a **proxy**: a JDK dynamic proxy if it implements an interface, or a **CGLIB subclass** otherwise. Spring Boot sets `proxyTargetClass = true` by default, so in practice you get CGLIB even when interfaces exist.
3. Everything that receives that bean by injection receives the **proxy**. The proxy holds a reference to your original object as its target.

### What happens on a call

1. The caller invokes a method on the proxy.
2. `TransactionInterceptor` looks up the `TransactionAttribute` for that exact method (propagation, isolation, timeout, read-only, rollback rules) — resolved once and cached.
3. It asks the `PlatformTransactionManager` for a transaction. `DataSourceTransactionManager` **checks out a `Connection` from the pool**, calls `setAutoCommit(false)`, and **binds the connection holder to the current thread** through `TransactionSynchronizationManager` — a `ThreadLocal`. `JpaTransactionManager` does the equivalent with an `EntityManager`.
4. Your method body runs. When it calls a repository, that repository does **not** open its own connection: it asks `TransactionSynchronizationManager` for the resource bound to this thread and joins the existing transaction. This is the entire reason `@Transactional` on a service method covers every repository call inside it.
5. On a normal return, the interceptor **commits**. On a `RuntimeException` or `Error` it **rolls back**. On a **checked** exception it **commits** — unless you declared `rollbackFor`.
6. Either way it unbinds the resource and returns the connection to the pool.

Two consequences fall straight out of step 3. Because the context is **thread-bound**, it does not cross a thread boundary: an `@Async` method, a manually spawned thread, or a reactive scheduler hop starts with no transaction, no matter what annotations are present. And because a transaction **holds a pooled connection for its entire duration**, any slow work inside the boundary — an HTTP call, a large computation — holds that connection too; this is the most common cause of a pool that is exhausted while the database sits idle.

### Propagation, mechanically

`REQUIRED` (the default) joins the transaction already bound to the thread, or starts one if there is none — it does not consume a second connection. `REQUIRES_NEW` **suspends** the current transaction (stashing its resource holder) and acquires **another** connection, so both are held simultaneously — a genuine and frequently overlooked way to exhaust a pool of size N with N/2 concurrent callers. `NESTED` uses a **JDBC savepoint** rather than a new transaction, which is why its support depends on the transaction manager. `SUPPORTS`, `NOT_SUPPORTED`, `MANDATORY`, and `NEVER` are assertions or suspensions around the same machinery. Isolation, where honored, is set on the `Connection`.

With JPA specifically, `readOnly = true` is more than a hint: besides flagging the JDBC connection, it puts Hibernate into a manual flush mode, so **changes made in a read-only transaction are not flushed** — which looks like "my update silently vanished" if you annotate a method read-only and then modify an entity in it.

### Why it silently does nothing

All of these are the same root cause — the call never crossed the proxy boundary, or the advice could not attach:

- **Self-invocation.** `this.otherTransactionalMethod()` calls the raw target, not the proxy. No interceptor, no transaction, no error. This is by far the most common failure.
- **Non-public methods.** Proxy-based advice applies to `public` methods only.
- **`final` or `private` methods, and `final` classes,** under CGLIB — they cannot be overridden, so the advice cannot be attached.
- **A caught exception**, or a checked exception without `rollbackFor` — the proxy sees a normal return and commits.

The production-debugging angle on these — how to prove at runtime whether a transaction is active, what happens with `REQUIRES_NEW` failures, and how the same proxy mechanism defeats `@Async` — is worked through in detail in this repository's `Architect-Level Production & Architect.md` (Q1 and Q20). The one-line diagnostic worth memorizing: `TransactionSynchronizationManager.isActualTransactionActive()` tells you the truth, and `logging.level.org.springframework.transaction=TRACE` shows every begin, join, and commit.

The escape from the proxy limitation, if you genuinely need advice on self-invocation or non-public methods, is to stop using proxies: `@EnableTransactionManagement(mode = AdviceMode.ASPECTJ)` weaves the advice into the bytecode instead. It works, it requires weaving setup, and it is almost never the right trade — restructuring so that the transactional boundary sits at the real entry point is.

> **Tie-in to Part III:** this is the **Proxy pattern** (§3.2) in its most consequential production use, and §4.1 step 5 is where the wrapping happens. `@Async`, `@Cacheable`, `@Retryable`, and Spring Security's method annotations are all the same mechanism with a different interceptor — so every one of them fails in exactly the same ways.

> **What the interviewer is really testing:** whether you can name the mechanism (proxy + interceptor + thread-bound resource) rather than the behavior, and whether you can derive the failure modes from it instead of listing them from memory. **The follow-up that usually comes next:** "so what happens if a `@Transactional` method calls another `@Transactional` method in the same class?" — the answer is that the inner annotation is ignored entirely, and the fix is to move the inner method to another bean or to move the boundary outward.

> **Most-likely-tested (Part IV):**
>
> - The 8 lifecycle stages in order; know that `@PostConstruct`/`InitializingBean.afterPropertiesSet`/`init-method` are the three init hooks, and `@PreDestroy`/`DisposableBean.destroy`/`destroy-method` are the three destroy hooks.
> - `BeanPostProcessor` runs _around_ initialization (before/after) and is where proxying happens.
> - Default scope is **singleton**; prototype = new instance each request.
> - Web scopes: request, session, application, websocket.
> - `@RestController` = `@Controller` + `@ResponseBody`; `@Repository` adds exception translation.
> - `BeanFactoryPostProcessor` modifies bean _definitions_ before any instance exists; `BeanPostProcessor` modifies _instances_ — and proxies are created in `postProcessAfterInitialization`, which is why `this` is always the raw target (§4.1).
> - Init hooks fire in the order `@PostConstruct` → `afterPropertiesSet` → `init-method`; destroy hooks mirror it — and **prototype beans never receive destruction callbacks** (§4.1).
> - Injecting a shorter-lived scope into a singleton needs a scoped proxy, `ObjectProvider`, or `@Lookup`; web scopes are `ThreadLocal`-bound and do not cross a thread hop (§4.2).
> - Injection resolves **by type**, then narrows `@Qualifier` → `@Primary` → `@Priority` → parameter name, and fails at **startup**; circular references have been disabled by default since Boot 2.6 (§4.4).
> - `@Transactional` = proxy + `TransactionInterceptor` + a **thread-bound** connection: self-invocation, non-public methods, and caught or checked exceptions defeat it silently (§4.5).

### Part IV summary

Beans are container-managed objects wired by IoC/DI. Their lifecycle runs from instantiation → property population → aware interfaces → post-processor pre-init → initialization → post-processor post-init → use → destruction, with three init hooks and three destroy hooks. Scope controls sharing (singleton default, prototype, and the web scopes request/session/application/websocket). Stereotype annotations (`@Component` and its specializations) classify beans and sometimes add behavior. §4.1 gives the mechanically precise ordering, §4.2 the rules for mixing scopes, §4.4 the resolution algorithm behind injection, and §4.5 how `@Transactional` rides the proxy created in stage 6.

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

1. **`@SpringBootApplication`** — a convenience annotation combining `@Configuration`, `@EnableAutoConfiguration`, and `@ComponentScan` for fast, easy Spring Boot app setup. (Precisely: `@SpringBootConfiguration` + `@EnableAutoConfiguration` + `@ComponentScan` — see §5.3 for the startup sequence this sets in motion.)
2. **`@RestController`** — combines `@Controller` and `@ResponseBody`; used to build RESTful web services.
3. **`@RequestMapping` and its derivatives** (`@GetMapping`, `@PostMapping`, `@PutMapping`, etc.) — map web requests to methods in REST controllers, one per HTTP verb.
4. **`@EnableAutoConfiguration`** — tells Spring Boot to auto-configure based on the dependencies present on the classpath.
5. **`@ConfigurationProperties`** — binds and validates configuration properties onto a class (type-safe config).
6. **`@SpringBootTest`** — used in tests to load the full application context.
7. **`@AutoConfigureMockMvc`, `@WebMvcTest`, `@DataJpaTest`, etc.** — provide test configuration slices for specific application layers (web layer, JPA layer, etc.).
8. **`@EnableConfigurationProperties`** — enables support for `@ConfigurationProperties`.

These annotations are fundamental to Spring/Spring Boot development because they enable **declarative configuration** that reduces repetitive boilerplate, making robust, efficient applications easier to create and maintain.

## 5.3 What Actually Happens When `@SpringBootApplication` Runs

**Mental model:** the annotation itself does almost nothing — it is three annotations in a trench coat, and one of them (`@EnableAutoConfiguration`) adds an `@Import` that runs late in the container's normal startup. The interesting work is done by `SpringApplication.run`, and the single most important sequencing fact is that **auto-configuration is deliberately evaluated _after_ your own configuration**, which is what makes "define your own bean and Boot backs off" work at all.

### First, the expansion — with one correction

The composed annotation is `@SpringBootConfiguration` + `@EnableAutoConfiguration` + `@ComponentScan`. Note that the first is **`@SpringBootConfiguration`**, not a plain `@Configuration` as the source list says — it is itself annotated `@Configuration`, but the distinct type exists so that tooling (notably `@SpringBootTest`) can _find_ your primary configuration class by searching upward from a test. Two more details from the expansion that have practical consequences:

- The `@ComponentScan` has **no base package**, so it scans the package of the annotated class and everything below it. This is the entire reason the main class must sit at the root of your package structure — move it into `…app.web` and half your beans stop existing, with no error other than "no qualifying bean."
- The scan carries `excludeFilters` for `TypeExcludeFilter` and `AutoConfigurationExcludeFilter` — the latter prevents an auto-configuration class from also being picked up as a regular `@Configuration` component.

### The startup sequence

**1. Constructing `SpringApplication`.** It deduces the **application type** by probing the classpath (servlet, reactive, or none), deduces the main class from the stack trace, and loads `ApplicationContextInitializer`s and `ApplicationListener`s declared in `META-INF/spring.factories`.

**2. `run()` — environment first.** Run listeners fire a `starting` event; then the `Environment` is created and its `PropertySource`s are layered in a **defined precedence order** — command-line arguments, `SPRING_APPLICATION_JSON`, servlet parameters, JNDI, JVM system properties, OS environment variables, profile-specific `application-{profile}.yml`, plain `application.yml`/`.properties`, `@PropertySource`, then defaults. Profiles are resolved here, `spring.main.*` is bound, and an `environmentPrepared` event fires. Nothing has been instantiated yet — which is why a property that decides _which beans exist_ (`@ConditionalOnProperty`) has to be readable at this stage.

**3. Creating the context.** For a servlet application, an `AnnotationConfigServletWebServerApplicationContext`. Initializers are applied, and your main class is registered as the single primary bean definition.

**4. `refresh()` — where everything actually happens.** This is the standard container lifecycle from §4.1, and auto-configuration rides in on one of its steps:

- `invokeBeanFactoryPostProcessors` runs **`ConfigurationClassPostProcessor`**, which parses `@Configuration` classes, performs the component scan, and processes `@Import`.
- `@EnableAutoConfiguration` is an `@Import` of **`AutoConfigurationImportSelector`**, and — this is the load-bearing detail — it is a **`DeferredImportSelector`**, so it is processed **after all regular configuration classes have been parsed**. Your beans are known before Boot decides what to add.
- That selector reads the list of candidate auto-configuration class **names** from `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` in every jar on the classpath. (In Boot 2.6 and earlier this list lived under the `EnableAutoConfiguration` key in `META-INF/spring.factories`; the `.imports` file was introduced in 2.7 and is the only mechanism in Boot 3.)
- It removes exclusions, then applies `AutoConfigurationImportFilter`s using the precomputed condition metadata in `META-INF/spring-autoconfigure-metadata.properties` — so most candidates are discarded **without their class ever being loaded**, which is what keeps startup fast despite hundreds of candidates.
- Survivors are ordered by `@AutoConfigureOrder` / `@AutoConfigureBefore` / `@AutoConfigureAfter` and registered as configuration classes.
- Each is then still gated by its `@Conditional` annotations: `@ConditionalOnClass`, `@ConditionalOnMissingBean`, `@ConditionalOnProperty`, `@ConditionalOnWebApplication`, and so on. **`@ConditionalOnMissingBean` is the back-off mechanism** — and it only works because of the deferred ordering above.
- Then `registerBeanPostProcessors`, and `finishBeanFactoryInitialization` → `preInstantiateSingletons`, where every non-lazy singleton is built through the full §4.1 lifecycle and the proxies of §4.5 are created.
- For a web application, `onRefresh` calls `createWebServer`: the **embedded** Tomcat (or Jetty/Undertow) is created and `DispatcherServlet` is registered. The servlet container is a bean inside your application, not a host you deploy into — the inversion that made executable jars possible.

**5. After refresh.** `ApplicationRunner` and `CommandLineRunner` beans are invoked, the `started` and then `ready` events fire, and the stopwatch prints the familiar `Started Application in x.xxx seconds` line.

### The one correction worth making out loud

Auto-configuration does **not** scan your classpath looking for things to turn into beans. It evaluates a **fixed, shipped list** of candidate configuration classes contributed by the starters you depend on, filters them by conditions, and registers what survives. "Boot magically finds my beans" conflates two different mechanisms: `@ComponentScan` finds _your_ components by package; auto-configuration adds _the framework's_ beans by condition.

### How to debug it

When a bean you expected is missing, or one you didn't expect is present, do not guess — run with `--debug` (or `logging.level.org.springframework.boot.autoconfigure=DEBUG`) and read the **`ConditionEvaluationReport`**: it prints positive matches, negative matches with the specific condition that failed, and exclusions. `/actuator/conditions` exposes the same report at runtime. This single tool answers most "why isn't my `DataSource` configured?" questions in seconds, and knowing it exists is a strong practical signal.

> **What the interviewer is really testing:** whether `@SpringBootApplication` is three annotations you memorized or a startup sequence you can trace — and specifically whether you know that auto-configuration runs _after_ user configuration, since that ordering is what makes `@ConditionalOnMissingBean` meaningful. **The follow-up that usually comes next:** "how would you exclude one auto-configuration, and how would you write your own?" — `@SpringBootApplication(exclude = …)` or `spring.autoconfigure.exclude`, and for your own: a configuration class guarded by `@ConditionalOnMissingBean`/`@ConditionalOnClass`, listed in `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` inside your library jar.

> **Concept connections worth remembering:**
>
> - `@SpringBootApplication` is three annotations in one — this is why a single `main` class bootstraps the whole app.
> - `@GetMapping` etc. are shorthands for `@RequestMapping(method = ...)`.
> - The `*Test` slice annotations load _only part_ of the context for faster, focused tests, whereas `@SpringBootTest` loads _everything_.
> - `@Autowired` + `@Qualifier` together solve the "multiple candidate beans" problem.

> **Most-likely-tested (Part V):**
>
> - What `@SpringBootApplication` expands to (`@SpringBootConfiguration` — itself meta-annotated `@Configuration` — plus `@EnableAutoConfiguration` and `@ComponentScan`).
> - `@RestController` = `@Controller` + `@ResponseBody`.
> - `@Qualifier` resolves ambiguous injection; `@Value` injects properties.
> - `@Transactional` is proxy-based (relates to bean post-processing).
> - Test slices (`@WebMvcTest`, `@DataJpaTest`) vs full-context `@SpringBootTest`.
> - The `@ComponentScan` inside it has no base package, so it scans the annotated class's own package downward — which is why the main class belongs at the root (§5.3).
> - Auto-configuration is a `DeferredImportSelector` reading `META-INF/spring/…/AutoConfiguration.imports`, evaluated **after** your configuration classes — the ordering that makes `@ConditionalOnMissingBean` back off (§5.3).

### Part V summary

Spring's annotations turn configuration into declarations on classes and methods. Core injection/config annotations (`@Autowired`, `@Bean`, `@Value`, `@Qualifier`, `@Transactional`), web-mapping annotations (`@RequestMapping` + verb shortcuts), stereotypes (`@Component` family), and Boot's convenience/auto-config/test annotations together minimize boilerplate. §5.3 traces what `@SpringBootApplication` actually sets in motion at startup, and why auto-configuration is evaluated after your own configuration classes.

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

**JPA:** relationship annotations + cascade/fetch/mappedBy (mappedBy on inverse side); LAZY vs EAGER defaults; Query Methods keyword grammar; `@Query` + `?1`; Specifications need `JpaSpecificationExecutor`. N+1 = lazy loading firing once per parent — fix it per query (`join fetch`, `@EntityGraph`, batch fetch size, projection), never with EAGER; a collection fetch plus `Pageable` paginates in memory.

**Patterns:** 23 patterns in 3 families; memorize the confusable pairs and one-line intent of each.

**Beans:** 8 lifecycle stages; 3 init + 3 destroy hooks; 6 scopes; 6 stereotypes; IoC/DI meaning. Init hooks fire `@PostConstruct` → `afterPropertiesSet` → `init-method`; prototypes get no destroy callbacks; injection resolves by type then `@Qualifier`/`@Primary`/`@Priority`/name and fails at startup; `@Transactional` is proxy advice, so self-invocation defeats it.

**Annotations:** what `@SpringBootApplication` and `@RestController` expand to; injection/config/mapping/test annotations. Plus what `SpringApplication.run` does in order, and that auto-configuration is deferred until after your own configuration so `@ConditionalOnMissingBean` can back off.
