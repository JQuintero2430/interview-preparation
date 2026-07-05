# Architect-Level Production & Architecture Study Plan

**Audience:** ~3.5 yrs backend (Java / Spring Boot / microservices / PostgreSQL / Redis / AWS / Docker), preparing to operate and interview at software-architect level.

**How to use this document.** Each question follows the same three-beat structure: **(1) Mental model** — the principle that makes the answer inevitable rather than memorized; **(2) Structured reasoning** — root cause, failure modes, trade-offs; **(3) Resolution** — concrete config, code, or design. After most questions there is a **Trap** callout (the plausible-but-wrong answer an interviewer uses to separate the memorizers from the reasoners) and **Interviewer follow-ups** (the "now it's under 10× load" probes where architect-level candidates are actually differentiated).

A recurring meta-lesson runs through the whole set: **most of these failures are not bugs in your code — they are emergent properties of a system under contention, saturation, or partial failure.** The unit of reasoning at this level is not "the method" but "the resource" (a connection, a thread, a lock, a heap region, a partition) and its behavior when many callers compete for it. Train yourself to immediately ask, for any symptom: _which finite resource is being exhausted, held too long, or contended, and by whom?_

---

## Group A — Transactions, Concurrency & Correctness (Q1, Q2, Q5, Q7, Q8, Q16)

These questions cluster because they share one root theme: **correctness under concurrency and retry.** The interviewer is probing whether you understand that "it works" in a single-threaded test says nothing about behavior when N callers, M retries, and P replicas interleave.

### Q1 — Why can `@Transactional` fail even when no exception is thrown?

**Mental model.** `@Transactional` in Spring is not a language feature — it is _advice woven around a proxy_. Spring wraps your bean in a proxy (JDK dynamic proxy if you have an interface, CGLIB subclass otherwise). The transaction begins and commits **in the proxy's invocation handler**, not inside your method. Therefore the annotation only takes effect when the call _crosses the proxy boundary_. Anything that prevents the call from going through the proxy silently disables the transaction, and — this is the whole point of the question — **nothing throws.** You get autocommit-per-statement behavior and no rollback, silently.

**The failure modes, mechanistically:**

_Self-invocation._ A method in the same class calls another `@Transactional` method via `this.otherMethod()`. `this` is the raw target object, not the proxy, so the interceptor never runs. The inner method executes with whatever transaction context the _outer_ call happened to have — often none. This is the single most common cause and the one the interviewer is usually fishing for. The fix is to inject the bean into itself, call through `AopContext.currentProxy()`, or (cleaner) restructure so the transactional boundary sits at the true entry point.

_Non-public visibility._ Spring's default proxying only applies advice to `public` methods. A `@Transactional protected` or package-private method compiles fine and silently runs without a transaction. (AspectJ compile-time weaving can advise non-public methods, but you're almost certainly not using it.)

_Swallowed or wrong-typed exceptions._ By default Spring rolls back on unchecked exceptions and `Error`, but **commits** on checked exceptions. So a method that throws `IOException` (checked) will _commit_ the partial work unless you declare `rollbackFor`. And if your code catches an exception internally and doesn't rethrow, the proxy sees a normal return and commits. No exception propagates → no rollback → silent data corruption.

_Wrong propagation assumption._ `REQUIRES_NEW` suspends the outer transaction and runs in a genuinely independent one; people assume the inner failure rolls back the outer work — it doesn't. Conversely with the default `REQUIRED`, an inner method marking the transaction rollback-only will surface as `UnexpectedRollbackException` at the _outer_ commit — the outer method "threw no exception" in its own body but still fails.

_Same-class + final/private methods under CGLIB_ can't be overridden, so advice can't attach.

_The connection was already in autocommit or a different datasource_ — e.g., you opened a `JdbcTemplate` against a datasource that isn't the one the transaction manager manages. The transaction manager binds a connection to the thread via `TransactionSynchronizationManager`; if your code grabs a connection outside that binding, it runs outside the transaction entirely.

> **Trap.** "It fails because the exception was caught." That's _one_ mode, but a candidate who stops there has missed the deeper structural cause — the proxy boundary — which explains self-invocation, visibility, and datasource-mismatch failures that have nothing to do with exception handling. Name the proxy mechanism first; it subsumes the rest.

**Interviewer follow-ups:** _"How would you prove, at runtime, whether a given method is actually running in a transaction?"_ (Answer: `TransactionSynchronizationManager.isActualTransactionActive()`, or enable `logging.level.org.springframework.transaction=TRACE`.) _"You have `@Transactional` on a method annotated `@Async` — what happens?"_ (The `@Async` proxy runs the body on a different thread; the transaction context is thread-bound and does not propagate, so the transactional advice on the same method still applies but any _caller's_ transaction does not extend into it.)

---

### Q2 — Retries started creating duplicate records. How do you fix it?

**Mental model.** A retry is a _replay of an operation whose outcome you don't actually know_. The client retried because it didn't receive a success response — but "no response" is not "no effect." The write may have committed and the acknowledgement lost on the way back. So the real problem statement is: **your write operation is not idempotent, and retries expose the fact that at-least-once delivery is the only thing the network guarantees.** You cannot fix this by "being more careful with retries." You fix it by making the operation safe to apply more than once.

**Structured reasoning — the ladder of solutions, weakest to strongest:**

_Idempotency key (the correct default)._ The client generates a unique key per logical operation (not per HTTP attempt) and sends it in a header. The server persists `(idempotency_key → result)` and, on a duplicate key, returns the stored result instead of re-executing. The subtlety interviewers probe: the check-and-insert of the key must be _atomic with_ the business write, or you race — two concurrent retries both see "no key," both proceed. Enforce it with a `UNIQUE` constraint on the key column inside the same transaction as the write; the second inserter gets a constraint violation and you translate that into "return the existing result."

_Natural idempotency via unique business constraints._ If the domain has a natural key (e.g., one payment per `order_id`), a `UNIQUE` constraint makes the duplicate insert fail at the database. This is stronger than application-level dedup because the database enforces it under all concurrency. The retry then catches the violation and treats it as success.

_Upsert / `INSERT ... ON CONFLICT DO NOTHING/UPDATE`._ Turns the operation itself into something replay-safe at the storage layer.

_De-dup on the read side (weakest)._ Detect and merge duplicates later. Only acceptable when you genuinely cannot make writes idempotent; it pushes correctness debt downstream.

**Where the naive fixes fail:** "I'll check if the record exists before inserting" is a classic time-of-check-to-time-of-use race — two retries both check, both find nothing, both insert. The existence check and the insert must be one atomic operation (constraint or upsert), not two statements.

> **Trap.** "Just disable retries" — this trades a correctness bug for an availability bug. Retries exist because transient failures are real; removing them makes your service fragile to blips it should absorb. The architect answer keeps retries and makes the target idempotent.

**Interviewer follow-ups:** _"Where should the idempotency key be generated — client or server?"_ (Client, per logical intent; a server-generated key can't dedupe a retry because the retry would get a new key.) _"How long do you retain idempotency keys?"_ (Long enough to cover your maximum retry window plus clock skew; typically hours to a day, then TTL-expire — a real design trade-off between storage and safety.) _"What if the operation spans two services?"_ (Now you need the saga/outbox machinery from Q5 — a single idempotency key isn't enough across a distributed write.)

---

### Q5 — How do you make a Kafka consumer process each message _exactly once_?

**Mental model — and this is the most important thing to say out loud in the interview:** **true end-to-end exactly-once delivery across a network is impossible.** This is a restatement of the Two Generals problem. What you can actually achieve is one of two things: **exactly-once _processing semantics_ within a bounded scope** (Kafka's transactional read-process-write, which is real but only covers Kafka-to-Kafka), or — far more commonly and more robustly — **at-least-once delivery combined with idempotent processing, which is _effectively_ once.** An interviewer who insists on literal exactly-once is testing whether you will correct the premise. Correct it.

**Structured reasoning:**

_Why naive approaches fail._ The consumer does work, then commits the offset. If it crashes _between_ those two steps, on restart it re-reads the message → duplicate. Swap the order (commit offset first, then do work) and a crash means the message is lost → at-most-once. There is no ordering of "do work" and "commit offset" that is safe across a crash, because they are two separate systems (your side-effect store and Kafka's offset store) and you cannot atomically update both — **unless they are the same store.**

_The two real solutions:_

**(a) Kafka transactions (EOS — exactly-once semantics).** If your processing is _consume from Kafka → produce to Kafka_ (including the offset commit, which is itself a write to the `__consumer_offsets` topic), Kafka's transactional producer can commit the output records _and_ the consumed offsets in one atomic transaction, with `isolation.level=read_committed` on downstream consumers. This is genuine exactly-once **but only within the Kafka boundary.** The moment your side effect is an external database, an email, or a payment, Kafka's transaction can't enroll it, and the guarantee evaporates.

**(b) Idempotent consumer (the general answer).** Accept at-least-once delivery. Make the _effect_ idempotent: dedupe on a business key or a stored message ID, or make the write an upsert (this is Q2 again — the same principle). Better still, use the **transactional outbox + inbox pattern**: record the processed message ID in the _same database transaction_ as the business write, so "I did the work" and "I recorded that I did the work" commit atomically together. On redelivery, the inbox row already exists → skip. Because the dedupe record and the side effect share one transaction, a crash can't leave them inconsistent.

**The honest comparison.** Kafka EOS is elegant but narrow (Kafka-in, Kafka-out) and adds coordinator overhead and latency. The idempotent-consumer approach is universal, works with any external system, and is what you'll actually build — at the cost of you owning the dedupe store and its TTL policy.

> **Trap.** "Set `enable.idempotence=true` and you're done." That producer setting only prevents _duplicate producer writes_ on retry within a session — it does nothing for consumer-side reprocessing after a crash, which is what the question is about. Conflating producer idempotence with consumer exactly-once is a classic tell.

**Interviewer follow-ups:** _"Your dedupe table is now the bottleneck — how do you scale it?"_ (Partition it by the same key Kafka partitions by, co-locate, TTL aggressively.) _"What ordering guarantees do you have, and what happens on a partition rebalance mid-batch?"_ (Rebalance can hand your in-flight partition to another consumer; uncommitted offsets get reprocessed — which is exactly why the effect must be idempotent.)

---

### Q7 — After scaling, a scheduled job runs on every pod. How do you prevent duplicate execution?

**Mental model.** `@Scheduled` is a _per-JVM_ timer. It has no notion of a cluster. When you scaled from one pod to N, you didn't scale the _schedule_ — you created N independent schedulers that all fire. The job was never "the system's job"; it was "each process's job," and that was invisible while N=1. The fix is to introduce a **single point of coordination** so that exactly one instance wins the right to run each firing.

**Structured reasoning — the options, with honest trade-offs:**

_Distributed lock (ShedLock is the canonical Spring answer)._ Before running, each pod tries to acquire a lock keyed by job name + scheduled time, backed by a shared store (Postgres, Redis, Mongo). Exactly one acquires it; the rest skip. ShedLock is deliberately _not_ a general distributed lock — it guards scheduled tasks specifically and handles the "lock held by a dead node" case with a lock-until timeout. **Critical subtlety:** the lock's max duration must exceed the job's worst-case runtime, or a second pod acquires it while the first is still running → duplicate execution, the exact thing you were preventing. And be honest about the guarantee: with a wall-clock lock, a GC pause or clock skew on the lock-holder can theoretically let another node in. For most batch jobs that's acceptable; for money-movement it is not, and you need fencing tokens.

_Leader election._ One instance is elected leader (via Kubernetes lease, ZooKeeper, or Spring Cloud Kubernetes) and only the leader schedules. Cleaner conceptually than per-firing locks, but adds an election dependency and a failover gap.

_Externalize the scheduler entirely._ Kubernetes `CronJob`, or a dedicated scheduler like Quartz in clustered mode (which uses database row locks to ensure a single fire), or an orchestrator (Airflow, Temporal). This removes the coordination concern from your app pods altogether — often the right architectural move once you have more than a couple of scheduled jobs.

> **Trap.** "Just run the scheduler on only one pod / a dedicated instance." This reintroduces a single point of failure and a deployment special-case (now you have heterogeneous pods, which breaks the cattle-not-pets model and complicates rolling deploys). ShedLock or a real CronJob keeps pods homogeneous.

**Interviewer follow-ups:** _"The lock store is your Postgres primary and it fails over — what happens to in-flight jobs?"_ _"The job takes longer than expected and the lock expires mid-run — walk me through the resulting duplicate and how fencing tokens prevent the damage."_

---

### Q8 — Why can optimistic locking still fail under high concurrency?

**Mental model.** Optimistic locking is not a lock. It is a _bet_: "I'll assume no one else touches this row while I'm working, and I'll verify that assumption at commit via a version check." Under low contention the bet almost always wins. Under high contention on the _same row_, the bet loses constantly — and "loses" means the transaction throws `OptimisticLockException` (`ObjectOptimisticLockingFailureException` in Spring/JPA) and must be retried. So the honest answer to "why does it fail" is: **optimistic locking is designed to fail under contention — that's its correctness mechanism. The real question is whether failing (and retrying) is acceptable for your access pattern.**

**Structured reasoning:**

The version column (`@Version`) is checked in the `UPDATE ... WHERE id=? AND version=?` statement. If the row's version changed since you read it, zero rows update, JPA detects the mismatch, and throws. Two concurrent writers on the same row: one wins, one gets the exception. As concurrency on a hot row rises, the _conflict probability_ rises toward certainty, and you enter a **retry storm** — retries contend with each other, increasing contention, causing more conflicts, in a positive-feedback collapse (this is livelock, not deadlock). Throughput on that row can go _down_ as concurrency goes up.

**The deeper points that separate senior from staff:**

- Optimistic locking is the right tool when conflicts are _rare_ (read-heavy, write-seldom, e.g., editing a user profile). It is the _wrong_ tool for a hot counter or inventory decrement on a popular item, where pessimistic locking (`SELECT ... FOR UPDATE`) or a lock-free approach (atomic DB `UPDATE ... SET count = count - 1 WHERE count > 0`, or Redis `DECR`) serializes access without the retry storm.
- Retry logic must have **bounded retries + backoff + jitter**, or your retry storm becomes a thundering herd. Unbounded retry under contention is how a hot row takes down a service.
- It only protects the entity it versions. A "lost update" across two entities, or a check against derived/aggregate state, isn't covered — you're versioning the wrong granularity.

> **Trap.** "Switch to pessimistic locking and the problem goes away." It changes the failure mode, it doesn't eliminate contention. `SELECT FOR UPDATE` serializes writers — now instead of retry storms you get _queueing_: writers block, connections are held for the duration (feeding straight into the Q3/Q4 pool-exhaustion problem), and you can deadlock if lock ordering is inconsistent (Q16). The correct framing is: pessimistic trades throughput-under-conflict for latency-under-contention; pick based on conflict rate and how expensive the work-to-be-retried is.

**Interviewer follow-ups:** _"At what conflict rate would you switch from optimistic to pessimistic, and how would you measure that rate in production?"_ _"Design a hot-inventory decrement that's correct without either — no version, no row lock."_ (Single atomic conditional update, or move the counter to Redis/a CRDT, or shard the counter.)

---

### Q16 — Spring Data JPA suddenly started causing deadlocks. Find and fix the root cause.

**Mental model.** A database deadlock is always the same shape: **two transactions each hold a lock the other needs, and they acquired those locks in _opposite order_.** The database detects the cycle and kills one victim (`deadlock detected`, SQLState 40P01 in Postgres). The word "suddenly" is the clue — deadlocks appear when _lock ordering_ or _lock duration_ changed, and with JPA that change is usually invisible in your code because **JPA controls when SQL is emitted, not you.**

**Structured reasoning — why JPA specifically induces these:**

_Flush timing and reordering._ JPA batches and flushes dirty entities at transaction commit (or before a query, per flush mode). The _order_ in which INSERT/UPDATE statements hit the database is decided by Hibernate's action queue, **not** your code order. So two transactions that "look" like they touch rows in the same order in your Java code can emit SQL in different orders and deadlock. A recent entity change, a new `@OneToMany` cascade, or a Hibernate version bump can silently reorder statements.

_Lock escalation via cascades and lazy loading._ A cascade persist/merge touches child rows you didn't explicitly write; a lazy association loaded inside the transaction takes shared locks you didn't anticipate. More rows locked = bigger cycle surface.

_Long-held locks from the anti-pattern of doing I/O inside a transaction._ If a transaction takes a row lock and then makes a REST call or does slow work before committing, it holds the lock far longer, widening the window for a cyclic wait. (This is the same disease as Q4 — connection held too long — manifesting as locks instead of pool starvation.)

_Foreign-key locks._ In Postgres, inserting a child row takes a `FOR KEY SHARE` lock on the parent; concurrent updates to parents plus child inserts is a classic FK-deadlock generator that people don't see because JPA hides the parent lock.

**How to actually find it (this is what the interviewer wants — a method, not a guess):**

1. Turn on deadlock logging at the database. In Postgres set `log_lock_waits = on` and read the `deadlock detected` log — it prints _both_ statements and the locks each held. That single log line usually names the two queries and the two resources, which gives you the cycle directly.
2. Reconstruct the lock-acquisition order of each transaction from that log.
3. Enable Hibernate SQL + `generate_statistics` to see the _actual_ emitted statement order, which is what matters, not your Java order.

**How to fix, in order of preference:**

- **Impose a consistent lock ordering.** Always acquire locks on rows/tables in a canonical order (e.g., always by ascending primary key). If both transactions lock in the same order, no cycle can form — this is the fundamental cure, not a workaround. With JPA you may need to force ordering by explicitly sorting the entities you modify, or by ordering explicit `SELECT ... FOR UPDATE` calls.
- **Shrink the transaction.** Move all network/slow I/O _out_ of the transactional boundary so locks are held for microseconds, not seconds. Shorter hold time collapses the deadlock window.
- **Reduce lock scope.** Lock fewer rows, avoid unnecessary cascades, use `@Lock(OPTIMISTIC)` where a version check suffices instead of physical locks.
- **Retry the victim.** Deadlocks are, by design, transient — the database already resolved it by killing one transaction. A bounded retry with jitter on the deadlock exception is a legitimate part of the answer _in addition to_ fixing ordering, not instead of it.

> **Trap.** "Add retries and move on." Retries treat the symptom; if lock ordering is inconsistent you'll deadlock forever and just burn CPU retrying. And "raise the isolation level" is _backwards_ — higher isolation takes _more_ locks and generally makes deadlocks _more_ likely, not less. Watch for a candidate who reaches for `SERIALIZABLE` thinking it's "safer."

**Interviewer follow-ups:** _"Show me two JPA save() calls that deadlock even though the Java code touches entities in the same order."_ (Flush reordering, or one path triggering a cascade the other doesn't.) *"Postgres vs MySQL/InnoDB — does the deadlock *detection* behavior differ?"* (Both detect and kill a victim; InnoDB's victim selection and next-key/gap locking differ meaningfully, and gap locks under `REPEATABLE READ` create deadlocks Postgres wouldn't.)

---

## Group B — Saturation, Pools & the Threading Model (Q3, Q4, Q10, Q20)

The through-line: **a fixed pool of a resource, callers arriving faster than the resource frees, and the queue that forms in front of it.** Little's Law governs all of these — the number of concurrent items in a system equals arrival rate times time-in-system. Increase either arrival rate or hold time and concurrency rises until you hit a hard ceiling (pool size, thread count), after which latency goes vertical.

### Q4 — HikariCP pool exhausted, but DB CPU is under 20%. Why?

**Mental model — and the "20% CPU" is the deliberate red herring you must call out.** Low database CPU _proves_ the database is not the bottleneck — which means the connections aren't exhausted because the database is working hard. They're exhausted because they are being **held without doing database work.** A connection checked out of the pool but sitting idle (waiting on a network call, a lock, a sleep, a slow external API, or a `Thread.sleep` in a transaction) is unavailable to everyone else while contributing zero database load. **Pool exhaustion is about connection _hold time_, not database _throughput_.** Little's Law: required pool size = request rate × mean connection-hold-time. If hold time balloons because you're doing non-DB work while holding a connection, the pool empties even at trivial DB utilization.

**The concrete culprits:**

_I/O inside the transaction / connection scope._ The archetypal bug: you open a transaction (checks out a connection), then make a REST call to a downstream service that takes 8 seconds (see Q10), then finish the DB work. For 8 seconds that connection is held and idle from the database's perspective. Ten concurrent such requests and a pool of 10 is fully drained; the 11th request blocks on `connectionTimeout` and eventually throws.

_Connection leaks._ A code path that checks out a connection and never returns it (missing close, exception before release, a `Stream` from Spring Data JPA left unclosed). The pool bleeds one connection per leak until empty. HikariCP's `leakDetectionThreshold` exists precisely to surface this — it logs a stack trace when a connection is held longer than the threshold.

_Pool sized wrong for the concurrency model._ People set the pool huge thinking bigger = faster. Wrong: past a point, more connections cause _more_ contention on the database (context switching, lock contention) and the sweet spot is often small (HikariCP's own guidance: connections ≈ (cores × 2) + effective spindle count, often a couple dozen, not hundreds). But if your app threads exceed pool size and each thread wants a connection, threads queue for connections — exhaustion by design.

_`OSIV` (Open Session In View)._ Spring Boot's default `spring.jpa.open-in-view=true` keeps the JPA session — and thus a database connection — open for the _entire duration of the HTTP request_, including view rendering and serialization. Under load this dramatically inflates hold time for no database benefit. Turning it off is one of the highest-leverage single config changes for pool pressure. Name this; it impresses.

**How to diagnose:** HikariCP metrics — `hikaricp.connections.active`, `.pending`, `.usage` (hold-time histogram). If `active` is pinned at max and `pending` is climbing while DB CPU is flat, you have hold-time inflation, not DB saturation. Then find _what_ the held connections are waiting on (usually a downstream call or OSIV).

> **Trap.** "Increase the pool size." Sometimes right, usually a band-aid that moves the bottleneck. If the root cause is an 8-second downstream call inside the transaction, a bigger pool just means you exhaust a bigger pool slightly later — and you may now overload the database. Fix hold time first: get the I/O _out_ of the connection scope.

**Interviewer follow-ups:** _"Your pool is 10, request rate is 50/s, mean hold time is 0.5s — is that stable?"_ (Little's Law: 50 × 0.5 = 25 concurrent needed, pool of 10 → queue forms → unstable. Make them do the arithmetic.) _"OSIV is off and now you get `LazyInitializationException` — what's the fix?"_ (Fetch what you need inside the service-layer transaction via fetch joins or projections; don't rely on the session staying open.)

---

### Q3 — API is fine at 100 users, collapses at 10,000 concurrent. Where do you look first?

**Mental model.** "Collapses under concurrency" is almost never a code-logic bug — the same code ran fine at 100. It is a **resource-saturation** problem: some finite pool (threads, connections, file descriptors, memory, downstream capacity) that was comfortably oversized at 100 gets fully consumed at 10,000, and once saturated, _queueing_ turns into _timeouts_ turns into _retries_ turns into a _positive-feedback collapse_ (retry amplification). The architect skill is knowing the **ordered list of suspects** and how to bisect them, not guessing.

**Structured reasoning — investigate in this order, because this is roughly the order of likelihood and the order in which one saturates:**

1. **The database connection pool** (see Q4). This is the most common first ceiling. 10,000 concurrent HTTP requests funnel into a pool of ~20 connections; 9,980 requests queue. Check `hikaricp.connections.pending`. If it's climbing, this is your bottleneck and everything downstream is a symptom.

2. **The application thread model.** If you're on the classic servlet (thread-per-request) model with a Tomcat `maxThreads` of 200, then request #201 queues in the acceptor. 10,000 concurrent × any blocking I/O and threads are all parked. This is _the_ argument for reactive (WebFlux) or virtual threads (Loom, Java 21) for high-concurrency I/O-bound workloads — but only if the blocking is genuinely I/O; CPU-bound work doesn't benefit and virtual threads _pin_ on synchronized blocks and native calls.

3. **Downstream dependencies without bulkheads/timeouts** (see Q10). One slow dependency, called synchronously, holds a thread (and often a connection) per request; at 10,000 concurrent the slow dependency's latency multiplies your resource consumption until you starve.

4. **Missing/misconfigured connection reuse.** No HTTP keep-alive to downstreams, or a per-request new client → connection churn, ephemeral-port exhaustion, TLS-handshake storms.

5. **GC pressure** (see Q11). 100× the traffic can mean 100× allocation rate; if you're generating garbage per request, GC frequency rises and stop-the-world pauses stack latency.

6. **A shared lock or hot row** (Q8/Q16). A `synchronized` block or a hot database row that was invisible at low concurrency becomes a serialization point at high concurrency — throughput flatlines regardless of how many cores you add (Amdahl's law: the serial fraction dominates).

7. **The load balancer / ingress / ephemeral ports / file descriptors** — OS-level limits (`ulimit -n`, `net.core.somaxconn`, ephemeral port range) that never mattered at 100.

**The method to state out loud:** "I'd look at the _saturation signals_ first — the USE method: for each resource, check **U**tilization, **S**aturation (queue depth), and **E**rrors. The resource whose saturation (queue) is climbing while others are idle is the bottleneck. I'm not guessing — I'm finding which queue is growing." That framing — USE method + Little's Law — is exactly what an architect interviewer wants to hear, because it's _systematic_ rather than a laundry list.

> **Trap.** "Add more instances / autoscale." Horizontal scaling helps only if the bottleneck is _per-instance_ CPU or memory. If the bottleneck is a _shared_ resource — the single database, a hot row, a downstream service with fixed capacity — adding app instances makes it _worse_ by increasing pressure on the shared choke point. First identify whether the bottleneck is per-instance or shared; scale only the former.

**Interviewer follow-ups:** _"You added 10 more pods and latency got worse. Explain."_ (Shared bottleneck — more clients hammering the same database/downstream.) _"How do you tell a thread-pool problem from a connection-pool problem from the metrics?"_ (Thread pool saturated but connection pool has idle connections → thread model; both saturated with DB CPU flat → hold-time/downstream; connection pool `pending` high → pool sizing/hold time.)

---

### Q10 — One downstream service takes 8s. How do you stop it poisoning the rest?

**Mental model.** This is the **bulkhead** problem, named after a ship's watertight compartments: a breach in one compartment must not flood the whole vessel. A slow dependency, called synchronously with an unbounded or shared thread pool, will consume _all_ your threads/connections as callers pile up waiting on it — and now requests that don't even touch that dependency start failing because there are no threads left. One slow service takes down the whole application. This is **cascading failure**, and the entire discipline of resilience engineering exists to contain it.

**Structured reasoning — the layered defenses, and what each actually does:**

_Timeouts (non-negotiable, do this first)._ An 8-second response is bad; an _infinite_ wait is fatal. Every synchronous downstream call must have an aggressive, explicit timeout — connect timeout _and_ read timeout — set below the point where held resources starve you. The default in many HTTP clients is "wait forever," which is how a single slow dependency hangs an entire fleet. Setting timeouts is the single highest-value action and the first thing to say.

_Bulkhead (resource isolation)._ Give the risky dependency its _own_ bounded thread pool / connection pool, separate from everything else. When it saturates, only its bulkhead fills; the rest of the app keeps serving. This is the literal watertight compartment. Trade-off: you now have fixed capacity for that dependency and must size it.

_Circuit breaker._ Track the failure/slow-call rate to the dependency; when it crosses a threshold, _open_ the circuit and fail fast (return immediately with a fallback) instead of queueing more doomed calls. After a cooldown, allow a trickle of trial calls (half-open) to test recovery. This stops the pile-up at the source — you don't hold 10,000 threads waiting on a service you already know is down. Resilience4j is the standard Spring implementation. Key insight: a circuit breaker's job is to _protect the caller_, not the callee — it prevents you from wasting your own resources on a call likely to fail.

_Fallback / graceful degradation._ When the circuit is open or the call times out, return a sensible degraded response — a cached value, a default, a queued "we'll process this later," an empty result with a partial-success flag. The user experience degrades gracefully instead of the whole request failing.

_Load shedding / rate limiting at the boundary_ (see Q19) so you don't accept more work than you can complete.

_Make the call asynchronous / decouple._ If the 8-second work doesn't need to be synchronous, move it off the request path entirely — enqueue it (Kafka/SQS) and respond immediately; process when the downstream recovers. This converts a latency problem into a throughput problem you can absorb with a buffer.

**The correct order to present:** timeout → circuit breaker → bulkhead → fallback → (consider async decoupling). Timeouts and circuit breakers are the minimum bar; a candidate who names all four and explains _why each is insufficient alone_ is at architect level.

> **Trap.** "Just add retries." Retrying a service that's slow because it's _overloaded_ is the worst possible response — you multiply the load on an already-drowning service (retry amplification) and accelerate its collapse. Retries are for _transient_ faults, not for a saturated dependency; combine retries with a circuit breaker and backoff, or you build a self-DoS.

**Interviewer follow-ups:** _"Your timeout is 2s but the downstream's p99 is 3s — what happens?"_ (You time out ~1% of legitimately-completing requests; you must tune the timeout to the SLO, not arbitrarily, and decide whether a fallback or a retry-once is acceptable.) _"Circuit opens — how do you avoid a thundering herd when it half-opens?"_ (Limit trial calls, jitter the recovery, ramp gradually.)

---

### Q20 — App uses `@Async`, but requests are still blocking. Why?

**Mental model.** `@Async`, like `@Transactional`, is **proxy-based advice** (Q1's mechanism again). The asynchrony only happens when the call crosses the proxy boundary _and_ actually gets dispatched to a separate executor. "Still blocking" means one of those two conditions is broken: either the call never reached the proxy, or the caller is _synchronously waiting on the async result_, or the executor itself is saturated and the work is queueing rather than running. Async doesn't create capacity — it _relocates_ work to another pool, and if that pool is full you've just moved the blocking.

**Structured reasoning — the failure modes:**

_Self-invocation._ Same as Q1: calling an `@Async` method from within the same class via `this` bypasses the proxy, so it runs synchronously on the caller's thread. No async at all.

_The caller immediately calls `.get()` on the `Future` / `CompletableFuture`._ The method dispatched to another thread, yes — but the caller then _blocks waiting for the result_, so from the caller's perspective nothing was gained. Async is only useful if you either fire-and-forget or compose the futures without blocking until you genuinely need the result (and ideally combine multiple in-flight futures). If you `join()` right away, you've written synchronous code with extra thread-hop overhead.

_The executor is the default `SimpleAsyncTaskExecutor` or a tiny pool._ If you didn't define a proper `TaskExecutor` bean, older Spring defaults spawn a new thread per task (no pooling, unbounded) — or, if you configured a bounded pool, tasks _queue_ when the pool is full. A full queue means the "async" work waits its turn; under load it behaves synchronously-with-latency. And if the pool's queue is unbounded, you have a memory leak / OOM risk instead (Q15).

_Missing `@EnableAsync`._ Without it, `@Async` is inert — the annotation is present but no proxy advice is registered, so everything runs synchronously and silently. Nothing errors.

_Blocking work inside the async method on a shared resource._ The async task blocks on the _same_ database connection pool or downstream (Q4/Q10), so you've moved the blocking to a different thread pool but it still starves on the shared bottleneck.

_Return type is wrong._ `@Async` methods must return `void`, `Future`, or `CompletableFuture`. A method returning a plain `String` won't behave asynchronously in the way you expect — Spring can't hand you a pending handle.

> **Trap.** "Async makes things faster / non-blocking." Async does not reduce the _total_ work or make a blocking call non-blocking — it moves the wait to another thread. If your downstream call blocks a thread, `@Async` blocks a _different_ thread. True non-blocking requires a non-blocking I/O stack (WebFlux / reactive drivers) or virtual threads, not just `@Async`. Conflating "async execution on a thread pool" with "non-blocking I/O" is a common senior-level confusion.

**Interviewer follow-ups:** _"You have `@Async` + `@Transactional` on the same method — what's the transactional behavior?"_ (The async method runs on a new thread with its own transaction; the caller's transaction does _not_ propagate across the thread boundary because transaction context is thread-bound.) _"When would you reach for `@Async` vs WebFlux vs virtual threads?"_ (`@Async` for coarse fire-and-forget offloading; WebFlux for end-to-end non-blocking I/O at high concurrency; virtual threads (Java 21) to keep blocking-style code but cheaply, as long as you avoid pinning.)

---

## Group C — Availability, Deploys & the Delivery Path (Q6, Q12)

### Q6 — Health checks pass, but users get 503s. Cause?

**Mental model.** A 503 means _something in the request path decided it had no capacity to serve_ — and the key realization is that **a passing health check and a serveable request are different claims.** Health checks typically probe _liveness_ ("is the process up?") or a shallow _readiness_ ("can I reach the DB?"), but 503 is about _capacity and routing at the exact moment of the request._ The gap between "healthy" and "actually serving" is where 503s live. Also crucial: **who is emitting the 503?** The load balancer, the ingress, the service mesh, and the app can each emit it for different reasons. Locate the emitter first.

**Structured reasoning — the distinct causes, by emitter:**

*Load balancer / ingress has no healthy backends *for this request* even though pods report healthy.* Classic during rolling deploys: the LB's health-check propagation lags reality. A pod is terminating (Kubernetes sent SIGTERM, removed it from the Service endpoints) but the LB hasn't updated, so it still routes to a pod that's shutting down → connection refused → 503. Or a new pod passes its readiness probe _before_ it's truly warm (JIT not warmed, caches cold, connection pools not established) and 503s the first requests. The fix is proper _graceful shutdown_ (SIGTERM → stop accepting new, drain in-flight, then exit) plus a `preStop` hook delay so the LB deregisters _before_ the app stops, and a readiness probe that reflects genuine readiness (including a warm-up).

_Thread pool / connection pool saturated (Q3/Q4)._ The app is "healthy" (process alive, DB reachable) but has no free worker thread to accept the request, so Tomcat/the server returns 503 (`maxConnections`/`acceptCount` exceeded). The health check passes because it either uses a reserved path or got lucky with a free thread. This is the saturation story again, surfacing as 503 rather than latency.

_Readiness probe too shallow._ It checks `/health` which returns 200 as long as the process runs, but doesn't check the actual downstream dependencies the request needs — so a pod with a dead connection pool still reports ready and receives (and 503s) traffic. Deep-enough readiness probes matter; but _too_ deep and a downstream blip flaps all your pods out of rotation simultaneously (a real trade-off).

_The service mesh / circuit breaker (Q10) is shedding load or the circuit is open_ — Envoy/Istio returns 503 with a specific flag (`UO` = overflow, `UH` = no healthy upstream) that tells you exactly which. Reading that flag is the fast path to root cause.

**The method:** identify the 503 _emitter_ from access logs / mesh flags first, then reason from there. "Users get 503" without knowing whether it's the ALB, the ingress, Envoy, or Tomcat is unactionable.

> **Trap.** "The service is down." It demonstrably isn't — health checks pass. The whole point of the question is the _gap_ between health and serveability. A candidate who says "restart the service" has missed that the problem is routing/capacity/lifecycle, not a dead process.

**Interviewer follow-ups:** _"During a rolling deploy you get a burst of 503s every time — walk me through the pod lifecycle and where the race is."_ (SIGTERM/endpoint-removal/LB-propagation ordering; fix with preStop sleep + graceful shutdown.) _"Liveness vs readiness — what breaks if you conflate them?"_ (A failing liveness restarts the pod; a failing readiness just removes it from rotation. Using a deep dependency check as your _liveness_ probe means a downstream outage triggers a restart storm that makes everything worse.)

---

### Q12 — Deploy a _breaking_ schema change with zero downtime. How?

**Mental model.** Zero-downtime schema migration rests on one principle: **the database schema and the application must be _mutually compatible at every instant during the rollout_, because for a period both the old and new code run simultaneously against the same database.** A "breaking" change breaks precisely because old and new can't share a schema. The technique is to make the change _non-breaking_ by decomposing it into a sequence of individually-compatible steps — this is the **expand/contract (a.k.a. parallel-change) pattern.** You never actually apply a breaking change; you apply a series of compatible ones that _sum_ to the breaking change.

**Structured reasoning — the canonical example: renaming/removing a NOT NULL column (the hardest common case):**

Naively `ALTER TABLE ... RENAME COLUMN` or `DROP COLUMN` breaks any running instance still expecting the old column. Instead:

**Expand.** Add the new column as _nullable_ (or with a default), backward-compatible — old code ignores it, new code can use it. Deploy application code that **writes to both** old and new columns (dual-write) but still **reads from the old**. Now the database has both, and every running instance — old and new — works.

**Migrate.** Backfill the new column from the old for existing rows, in batches to avoid long locks (a single big `UPDATE` takes a table lock / bloats WAL — do it in chunks, ideally off-peak, throttled).

**Switch reads.** Deploy code that **reads from the new** column (still dual-writing). Verify.

**Contract.** Once _no_ running instance references the old column, stop writing it, then in a _later_ deploy drop it. The drop is now safe because nothing reads or writes it.

The general rules that make this work, and that an interviewer wants you to articulate:

- **Additive changes are safe; destructive changes are not — so convert every destructive change into an additive one plus a delayed cleanup.** Adding a nullable column, adding a table, adding a non-unique index (concurrently) — safe. Dropping, renaming, narrowing a type, adding NOT NULL to existing data, adding a UNIQUE constraint that might already be violated — unsafe if done in one step.
- **Never make the application and schema change in the same deploy for a breaking change.** Decouple them across multiple deploys so there's always a compatible overlap window.
- **Beware locking DDL.** `ALTER TABLE ADD COLUMN` with a volatile default, or `CREATE INDEX` non-concurrently, takes locks that block writes — in Postgres use `CREATE INDEX CONCURRENTLY`, add columns without a rewriting default, and add constraints as `NOT VALID` then `VALIDATE CONSTRAINT` in a separate step to avoid a long exclusive lock. This is where "zero downtime" is actually won or lost — a migration that's logically correct but takes a 30-second `ACCESS EXCLUSIVE` lock _is_ downtime.
- **Backward-compatible for at least one version.** Because rollback must also be safe — if the new deploy is bad and you roll back, the _old_ code must still work against the _migrated_ schema.

> **Trap.** "Put the app in maintenance mode / take a short outage." The question explicitly says zero downtime; reaching for a maintenance window is conceding the problem. Also a trap: "just run the migration in a transaction so it's atomic" — atomicity doesn't give you _availability_; a long-running transactional DDL still holds locks that block the live application. Atomic ≠ non-blocking.

**Interviewer follow-ups:** _"You're mid-rollout, dual-writing, and the new deploy is bad — walk me through the rollback and prove no data is lost."_ _"How do you make `ADD COLUMN NOT NULL DEFAULT x` safe on a 500M-row table in Postgres?"_ (Modern Postgres handles constant defaults without a rewrite, but a _volatile_ default rewrites the whole table under an exclusive lock — know the difference, or add nullable + backfill + set-not-null-via-NOT-VALID.)

---

## Group D — The JVM & Memory Under Duress (Q11, Q13, Q15)

Shared theme: **the JVM's automatic memory management is a leaky abstraction that becomes visible exactly under production load and time.** All three questions are about the gap between "heap looks fine in a dashboard" and "the JVM is spending its time managing memory instead of doing work."

### Q11 — Why can GC spike API latency without high CPU?

**Mental model.** A **stop-the-world (STW) GC pause freezes every application thread** while the collector does its work. During that pause, CPU may be _low_ (the app threads are parked, not computing; even the GC threads may be briefly coordinating rather than crunching), yet every in-flight request is frozen. So latency spikes while average CPU stays modest — the time is spent _stopped_, not _busy_. This is why you cannot detect GC problems from a CPU graph; you detect them from **pause-time** metrics and from latency _percentiles_ (p99/p99.9), never averages. GC pauses hit the tail, and the tail is what users feel.

**Structured reasoning:**

_The mechanism._ Even mostly-concurrent collectors (G1, and to a lesser degree ZGC/Shenandoah) have STW phases — at minimum for root scanning / final marking. A pause of 200ms means every request that was mid-flight adds up to 200ms of latency, and requests that arrive _during_ the pause queue behind it. Average CPU over a minute barely moves; p99 latency jumps by the pause duration. The signature is **latency spikes that correlate with GC pause logs, not with CPU.**

_Why pauses get long._ A large _live set_ (lots of long-lived objects) makes each collection scan more; high _allocation rate_ (garbage per request) triggers collections more _frequently_; and a heap under memory pressure (nearly full old gen) triggers expensive _full_ GCs. The dangerous case: allocation rate rises with traffic (Q3), old gen fills, and you tip from cheap young-gen collections into frequent full GCs — a latency cliff.

_Safepoints — the subtle killer, and the phrase that impresses._ Before any STW pause, _all_ application threads must reach a **safepoint** (a point where the JVM knows the thread's state is consistent). If one thread is slow to reach a safepoint — a long counted loop the JIT didn't insert a safepoint poll into, a long array copy, a blocked JNI call — _every other thread waits for it_. This "time to safepoint" (TTSP) can dwarf the GC work itself, producing a pause far longer than the "GC time" reported, with CPU near idle because everyone's waiting on one straggler. Diagnose with `-Xlog:safepoint` / `+PrintSafepointStatistics`. A candidate who names TTSP is signaling real depth.

**How to diagnose and fix:**

- Turn on GC logging (`-Xlog:gc*`), look at _pause durations and frequency_, and correlate with latency percentiles. Tools: GCViewer, GCeasy.
- If pauses are frequent → reduce allocation rate (fewer per-request objects, reuse buffers, avoid autoboxing in hot paths) or increase young-gen size so young collections are less frequent.
- If pauses are long → the live set is large or you're doing full GCs; consider a low-pause collector (**ZGC or Shenandoah** target sub-millisecond pauses by doing almost all work concurrently, trading some throughput/CPU) — the right move for latency-sensitive services with large heaps.
- If TTSP is the problem → find the thread that's slow to reach safepoints (often a big loop or native call) and fix that specific code.

> **Trap.** "GC is slow, give it a bigger heap." A bigger heap reduces GC _frequency_ but often _increases_ individual pause duration (more to scan), which can make tail latency _worse_ even as GC becomes less frequent. And it delays the reckoning if the real issue is a memory leak (Q13). Heap sizing is a throughput-vs-pause trade-off, not a universal "bigger is better."

**Interviewer follow-ups:** _"Your p50 is 20ms and p99 is 2s — is that GC?"_ (Very possibly; STW pauses are a leading cause of that exact p50/p99 divergence. Confirm against GC logs.) _"G1 vs ZGC — when and why?"_ (G1: balanced, good default, pauses scale with heap. ZGC: sub-ms pauses on huge heaps, costs some throughput and more CPU/memory overhead — choose when tail latency is the SLO.)

---

### Q13 — Memory leak that only appears after several days. How do you investigate?

**Mental model.** "Only after several days" is the entire diagnosis-in-miniature: it's a **slow leak with a long doubling time** — a small amount of memory retained per unit of work that only accumulates past the heap ceiling after days of traffic. The JVM won't OOM until the _retained_ (live, reachable-but-never-released) set exceeds the heap, and because GC keeps reclaiming _true_ garbage, the leak is masked until the leaked objects crowd everything else out. The investigative principle: **a leak is not "memory is high," it's "memory after a full GC keeps trending up over time."** You must look at the post-GC live-set trend, not instantaneous usage.

**Structured reasoning — the method, in order:**

1. **Confirm it's actually a leak, not just a large working set.** Plot **old-gen occupancy _after_ full GCs** over days. If the post-GC floor rises monotonically, it's a leak. If it plateaus, it's just a big-but-bounded working set and you need a bigger heap, not a bug hunt. This distinction is the first thing a senior does — don't chase a leak that isn't one.

2. **Capture heap dumps at two points in time** (e.g., day 1 and day 3) and **diff them.** The leak is whatever object type grew unboundedly between the two. Use `jmap`/`jcmd GC.heap_dump`, analyze with Eclipse MAT (its "dominator tree" and "leak suspects" report), and look for the **retained-size** heavy hitter and _what's keeping it alive_ — the GC-root reference chain. The reference chain _is_ the bug: it shows you which collection/cache/thread-local is holding the objects.

3. **Common culprits to pattern-match against** (these are what "grows slowly over days" almost always is): an unbounded in-memory cache or `Map` used as a cache with no eviction/TTL; `ThreadLocal`s never cleared on pooled threads (the thread lives forever in the pool, so the ThreadLocal value never releases — classic in app servers); listeners/callbacks registered but never deregistered; `static` collections that only ever grow; classloader leaks on redeploy (the old classloader can't be collected because something holds a reference — brutal in app-server hot-redeploy); connections/streams not closed accumulating native or heap buffers; interned strings or an ever-growing dedup set.

4. **Enable `-XX:+HeapDumpOnOutOfMemoryError`** so that if it does OOM in production you get a dump at the moment of death — the single most valuable artifact, and free to enable.

> **Trap.** "Just restart it periodically / bump the heap." Scheduled restarts are a real _mitigation_ and sometimes a pragmatic stopgap, but presenting them as the _fix_ is a red flag — you're papering over an unbounded resource that will eventually leak faster than you restart, and it masks the root cause. Name it as a stopgap while you diff heap dumps, not as the answer.

**Interviewer follow-ups:** _"The heap looks flat but the process RSS keeps growing — where's the leak?"_ (Off-heap: direct `ByteBuffer`s, Netty pooled buffers, JNI/native allocations, metaspace, thread stacks — the JVM heap tools won't show it; you need native tooling like NMT `-XX:NativeMemoryTracking`.) _"How do you find a `ThreadLocal` leak specifically?"_ (In MAT, look for `ThreadLocal$ThreadLocalMap` entries retained by pooled worker threads.)

---

### Q15 — Intermittent OOM only at peak hours, even though heap usage "looks normal."

**Mental model — "heap looks normal" is the deliberate tell, exactly like Q4's "CPU under 20%."** If the _heap_ is normal and you still get `OutOfMemoryError`, then the memory you're running out of **is not the Java heap.** `OutOfMemoryError` is a family of distinct errors, and several of them have nothing to do with heap size. The whole question is designed to see whether you know that. The peak-hour correlation tells you it's **load-proportional resource exhaustion** in some pool _other than the heap_ — one that scales with concurrency, not with data volume.

**Structured reasoning — enumerate the non-heap OOMs and match to "peak hours":**

_`OutOfMemoryError: unable to create new native thread`._ At peak, request concurrency spikes; if you create threads per request (or a pool grows unbounded, or `@Async`/executor misconfig from Q20), you hit the OS thread limit or exhaust the memory for thread _stacks_ (each thread reserves ~1MB of _native_, off-heap stack). Heap is fine; you're out of native memory / OS threads. This is the most likely match for "peak hours." Fix: bounded pools, fewer threads, smaller stacks, or virtual threads.

_`OutOfMemoryError: Direct buffer memory`._ Off-heap direct `ByteBuffer`s (used heavily by Netty, NIO, some drivers) are capped by `-XX:MaxDirectMemorySize`, independent of heap. Under peak I/O you allocate more direct buffers than the cap → OOM while heap sits half-empty. Fix: raise the cap, pool buffers, or fix a buffer leak.

_`OutOfMemoryError: Metaspace`._ Class metadata lives in native metaspace, not heap. Dynamic class generation (proxies, bytecode gen, lots of lambdas, scripting) or a classloader leak grows metaspace until it OOMs — heap unaffected. Peak correlation if you generate classes per request.

_`OutOfMemoryError: GC overhead limit exceeded`._ The JVM spends >98% of time in GC recovering <2% of heap — technically heap _is_ the issue, but the instantaneous heap graph can "look normal" because GC keeps just barely clearing it while thrashing. Peak allocation rate tips it over.

_Container memory limit (the cloud-native classic)._ The JVM heap is within its `-Xmx`, but the _container's_ total memory (heap + metaspace + thread stacks + direct buffers + native + code cache) exceeds the cgroup limit → the **kernel OOM-killer** kills the process (exit 137), which looks like a crash, not a Java OOM. At peak, thread count and buffers rise, total RSS exceeds the limit, pod gets killed. Heap graph looked totally normal. This is _the_ modern gotcha — always mention it. Fix: size `-Xmx` well below the container limit to leave headroom for non-heap (and set `-XX:MaxRAMPercentage` sanely).

**The method to state:** read the _exact_ OOM message and exit code — they name the memory region. `unable to create new native thread` vs `Java heap space` vs `Direct buffer memory` vs `Metaspace` vs exit 137 each point to a different root cause. "OOM" without the qualifier is unactionable; the qualifier _is_ the answer.

> **Trap.** "Increase `-Xmx`." If the OOM is native threads, direct memory, metaspace, or the container limit, raising heap **makes it worse** — you've taken memory _away_ from the very off-heap regions that are actually exhausted (in a container, a bigger heap leaves _less_ room for thread stacks and buffers before the cgroup kills you). This is the highest-value trap in the whole set: the intuitive fix is actively harmful.

**Interviewer follow-ups:** _"Pod exits with 137, no Java stack trace — what happened and how do you confirm?"_ (Kernel OOM-killer; confirm via `dmesg`/kubelet events, then compare RSS breakdown to the cgroup limit.) _"How do you budget memory for a JVM in a 2GB container?"_ (Heap + metaspace + N threads × stack + direct + code cache + native must fit under 2GB with margin; set `-Xmx` to leave 25–30% headroom, cap direct memory and threads.)

---

## Group E — Observability & Systematic Debugging (Q9, Q14, Q17)

The theme: **you cannot fix what you cannot see, and at scale the failure is often _invisible_ to naive logging** — no exception, no error, just wrongness. These questions test whether you debug _systematically_ (form a hypothesis, find the signal that confirms/refutes it) rather than _guessing and redeploying._

### Q9 — Cache hit ratio dropped from 95% to 30%. What do you check?

**Mental model.** A hit ratio is a _ratio_: hits ÷ (hits + misses). It can crater for exactly two structural reasons — **the numerator collapsed (things that were being served from cache no longer are)** or **the denominator's composition changed (the request mix shifted toward uncacheable/uncached keys).** Enumerate causes under those two headings and you can't miss the culprit. And "suddenly" points at a _discrete event_ — a deploy, a config change, an expiry cliff, a data-shape shift — not a gradual drift.

**Structured reasoning — the checklist, organized by cause:**

_Mass invalidation / eviction (numerator collapsed):_

- **A deploy changed the cache key format or serialization** → every old key is now a miss; the cache is effectively empty until repopulated. The most common "sudden" cause — correlate the drop timestamp with the deploy.
- **The cache was flushed/restarted** (Redis restart, failover to a cold replica, a `FLUSHALL`, an eviction-policy change) → cold cache, everything misses until warm.
- **Memory pressure triggering eviction** — the working set grew past `maxmemory`, so the LRU/LFU policy is evicting entries faster than they're reused (thrashing). Check Redis `evicted_keys` and memory. If evictions spiked, your cache is too small for the working set _or_ something is polluting it (see below).
- **TTL misconfiguration** — a deploy shortened TTLs, or a synchronized-expiry cliff means huge cohorts expire simultaneously (and then a thundering herd re-populates — the cache stampede problem).

_Request-mix shift (denominator changed):_

- **A new feature or client is querying different/unique keys** (e.g., unbounded cardinality — per-user or per-request keys that never repeat) → high-cardinality keys that can never hit. A single new caller iterating unique IDs can tank the ratio.
- **Cache pollution** — a batch job or crawler scans cold data, evicting the hot working set (LRU pollution). The hot keys that gave you 95% got pushed out by one-time-access keys.
- **A key that was hot went away** — upstream behavior changed and the previously-dominant hot key is no longer requested; the remaining traffic is inherently less cacheable.

**The method:** correlate the drop time with deploys/config changes first (cheapest, most common). Then look at Redis metrics — `evicted_keys`, `expired_keys`, `keyspace_hits`/`keyspace_misses`, memory. Then look at whether _key cardinality_ changed (new keys never seen before). That trio isolates almost every case.

> **Trap.** "Increase the cache size." Only correct if the cause is eviction from a too-small cache. If the cause is a key-format change from a deploy, a cold restart, or high-cardinality uncacheable keys, a bigger cache does nothing (or, for cardinality, just delays the inevitable). Diagnose which of the two structural buckets you're in _before_ resizing.

**Interviewer follow-ups:** _"The ratio dropped and downstream DB load spiked — you fixed the cache but now the DB is melting from the stampede. What's happening?"_ (Cache stampede / dogpile: on a miss, thousands of concurrent requests all recompute the same key and hammer the DB — fix with request coalescing / single-flight, or probabilistic early expiration.) _"How would you warm the cache after a deploy that changes keys?"_ (Pre-populate hot keys, or dual-read old+new during transition.)

---

### Q14 — Intermittent failures, no exceptions in the logs. Debugging strategy?

**Mental model.** "No exceptions" does not mean "no failures" — it means **the failures are not the kind your code models as exceptions.** The failure is happening _between_ or _around_ your instrumented code: at the network layer, in a timeout that returns an empty-but-valid response, in a partial success, in a different service, on a different thread, or in a code path that swallows the error. The debugging principle: **absence of an exception is itself a clue — it tells you the failure is in the un-instrumented gaps.** You widen the aperture until the failure becomes visible.

**Structured reasoning — the systematic sweep, from most to least likely given "intermittent + silent":**

_The error is swallowed._ An empty `catch` block, a `catch (Exception e) { log.debug(...) }` at a level you're not capturing, a `Future` whose exception is never `.get()`-ed (so it's silently discarded — very common with async, Q20), or a fallback (Q10) that masks the failure as a degraded-but-200 response. **First, grep for empty/broad catch blocks and unlogged futures.**

_The failure is downstream / cross-service._ Your service returns 200 because _its_ part worked, but a downstream call timed out and the fallback returned partial data. The exception (if any) is in the _other_ service's logs. This is exactly what **distributed tracing (Q17)** is for — a single trace ID across services reveals the hop that failed. Without tracing, you're blind to cross-service failures. Correlate by request/trace ID.

_It's not an exception, it's wrong behavior._ Race conditions, a stale cache, an eventual-consistency read-your-writes violation, a load-balanced request hitting an out-of-sync replica — these produce _incorrect results_, not exceptions. Intermittency + no exception is the _signature_ of a concurrency/consistency bug. Look for shared mutable state, non-idempotent operations, replica lag.

_Infrastructure-level, below the app._ TCP resets, connection-pool timeouts returning null, load-balancer 502/503 (Q6) that never reach your app logs, DNS blips, an unhealthy instance in rotation serving a fraction of requests (so failures correlate with _which pod_ served them). Check LB/ingress/mesh logs and _per-instance_ error rates — "intermittent" often means "one bad replica out of five."

_The logs are lying by omission._ Sampling dropped the error logs, log levels hid them, or the failing path genuinely has no logging. Add structured logging _at the boundaries_ (every downstream call: latency, status, trace ID) and correlate.

**The method to articulate:** "Intermittent + silent tells me to (1) rule out swallowed errors in my own code, (2) get a trace ID onto every request and check _cross-service_ where the exception actually lives, (3) check per-instance metrics because intermittent often means one bad replica, and (4) suspect a concurrency/consistency bug since silent-wrong-results is its signature. I'm not adding random logging — I'm instrumenting the _boundaries_ where the failure must be hiding." That's a _strategy_, which is what's being asked for.

> **Trap.** "Add more logging everywhere and wait." Shotgun logging generates noise and may not capture the gap. The skilled move is _targeted_ instrumentation at the boundaries (downstream calls, thread hand-offs, cache lookups) plus a trace ID for correlation — you're testing a hypothesis about _where_ the silence is, not blanketing the code.

**Interviewer follow-ups:** _"Failures correlate with no obvious variable — how do you find the hidden correlation?"_ (Slice error rate by pod, AZ, client version, time-of-day, specific key — the dimension that separates good from bad requests _is_ the bug.) _"How do you debug a race you can't reproduce locally?"_ (Add high-cardinality tracing/logging around the suspected shared state in prod, or use deterministic testing / thread-interleaving tools; capture the _ordering_, not just the values.)

---

### Q17 — Implement effective distributed tracing to debug cross-service latency.

**Mental model.** In a monolith, a stack trace tells you where the time went. Across microservices, **no single process sees the whole request** — the latency is distributed across hops, and the slow hop is invisible from any one service's logs. Distributed tracing reconstructs the _causal, timed tree of the whole request_ by propagating a shared **trace ID** and per-hop **span IDs** so you can see, for one request, exactly which service and which operation consumed the time. The core primitive is **context propagation**: the trace context must ride along every hop (HTTP header, message header) or the trace breaks at that boundary.

**Structured reasoning — the anatomy and what "effective" requires:**

_The model (OpenTelemetry / W3C Trace Context is the standard — name it)._ A **trace** is the whole request; it's a tree of **spans**, each span a timed operation (an HTTP handler, a DB query, a downstream call) with a start/end, a parent span, and attributes. The **trace context** (`traceparent` header per W3C) propagates the trace ID + parent span ID across every service and async boundary. Break propagation anywhere — an un-instrumented HTTP client, a message queue that doesn't carry headers, a thread hand-off that loses the context (`@Async`, executors) — and the trace fragments, which is the #1 practical failure of tracing implementations.

*What makes it *effective* (not just present) — this is the senior-level content:*

- **Propagate across _every_ boundary**, including message queues (inject trace context into Kafka/SQS headers) and async thread hand-offs (context must be copied onto the worker thread — OTel's context propagation and instrumentation handle this if wired correctly). A trace that dies at the queue boundary is useless for exactly the async latency you're chasing.
- **Instrument the _right_ spans with the _right_ attributes.** A span per downstream call, per DB query (with the statement, sanitized), per cache lookup, with attributes like `db.system`, `http.status_code`, `peer.service`. Latency debugging needs _where in the tree_ and _what operation_, not just total time.
- **Sample intelligently.** You can't trace 100% at high volume (cost, overhead). Head-based sampling (decide at the start) is cheap but may miss the rare slow request; **tail-based sampling** (buffer the whole trace, keep it only if it was slow or errored) is what you want for _latency_ debugging because it guarantees you capture the outliers — at the cost of buffering infrastructure. State this trade-off; it's the crux of "effective for latency."
- **Correlate traces with logs and metrics** — inject the trace ID into every log line so a slow trace links to its logs, and to RED/USE metrics. The "three pillars" only pay off when joined by trace ID.

_The stack._ Instrumentation via OpenTelemetry SDK/agent (auto-instruments Spring, JDBC, HTTP clients, Kafka), export to a collector, backend like Jaeger/Tempo/Zipkin, visualized as a flame/Gantt chart where the longest bar in the tree _is_ your latency culprit.

**How you actually debug the latency with it:** pull a slow trace (tail sampling made sure you have one), look at the span waterfall, find the span that dominates the critical path (the widest bar not overlapped by children) — that's the slow hop. Then drill into _that_ service's spans. You've turned "the system is slow somewhere" into "this specific DB query in this specific service is 800ms of the 1s."

> **Trap.** "Just log the request ID in each service and grep." Log correlation without _timing and parent-child structure_ tells you the request touched service X but not how long each hop took or the _causal ordering_ — you can't see the critical path, which is the whole point for latency. Tracing's timed tree is strictly more powerful than correlated logs for this problem.

**Interviewer follow-ups:** _"Your traces break at the Kafka boundary — async consumers show as separate traces. Fix it."_ (Inject/extract trace context in message headers; link producer and consumer spans.) _"100% sampling is too expensive but head-sampling misses slow requests — reconcile."_ (Tail-based sampling: buffer, keep the slow/errored ones.) _"A span shows 500ms but the child spans only sum to 100ms — what's the other 400ms?"_ (Un-instrumented work, queueing/thread-pool wait before the child call, GC pause (Q11), or serialization — the _gap_ between a parent span and its children's sum is itself a diagnostic signal.)

---

## Group F — Write Amplification & Rate Control (Q18, Q19)

### Q18 — A feature caused a massive increase in DB writes. Optimize _without changing business logic_.

**Mental model.** The constraint "without changing business logic" is the key — it means the _logical_ writes the feature requires are fixed, but the _physical_ writes and _how/when_ they hit the database are yours to reshape. The lever is the gap between **logical write intent** and **physical write execution**: batching, coalescing, deferring, and offloading change the physical write pattern without changing what's logically persisted. So the answer is a catalog of ways to make the same logical writes cost fewer/cheaper physical operations.

**Structured reasoning — the techniques, roughly by leverage:**

_Batch writes._ If the feature does N individual `INSERT`/`UPDATE` statements, batch them into one round trip (JDBC batch, `saveAll` with `hibernate.jdbc.batch_size`, multi-row `INSERT`). This collapses N network round trips and N transaction overheads into one. Often the single biggest win — the business logic is unchanged, only the _granularity_ of the physical write changed. Watch: Hibernate silently disables batching if you use `IDENTITY` id generation (it must return the id per row) — a real gotcha; use a sequence with `pooled`/`pooled-lo` allocation instead.

_Coalesce redundant writes._ If the feature writes the same row multiple times per request (e.g., incrementing a counter in a loop, or updating a status field repeatedly), accumulate in memory and write _once_ at the end. Same logical outcome, fewer physical writes. This targets **write amplification** — the same logical fact hitting the disk many times.

_Defer / async the write off the request path._ If the write doesn't need to be synchronous with the response, enqueue it (outbox → Kafka/SQS) and persist asynchronously, smoothing bursts and removing writes from the latency-critical path. The business logic still results in the write; you've decoupled _when_.

_Write-behind / buffering for high-frequency low-value writes._ For things like view counts, last-seen timestamps, analytics — buffer in Redis and flush aggregates to the database periodically. The database sees one write per interval instead of one per event. (Trade-off: a crash loses the un-flushed buffer — acceptable for counters, not for money.)

_Attack write amplification at the storage layer._ Each `UPDATE` in Postgres writes a _new row version_ (MVCC) plus updates _every index on the table_ (unless HOT applies) plus WAL — one logical update can be many physical writes. So: **drop unnecessary indexes** (every index multiplies write cost), ensure updates don't touch indexed columns needlessly (to enable HOT updates that skip index writes), and tune `fillfactor` to leave room for HOT. This reduces physical writes per logical write _without touching business logic at all_ — often overlooked and very senior.

_Reduce transaction overhead / right-size transactions._ Batch multiple logical operations into fewer, appropriately-sized transactions (fewer commits = fewer fsyncs), without going so large that you hold locks too long (Q16) or bloat.

> **Trap.** "Add a cache." Caching helps _reads_, not writes — it's a non-sequitur for a write-volume problem (a write-through cache actually adds a write). Also watch: "shard the database" is a huge architectural change that likely alters more than "business logic" and is disproportionate before you've tried batching/coalescing. Exhaust the cheap physical-layer optimizations first.

**Interviewer follow-ups:** _"You batched writes and now occasionally lose a batch on crash — is that acceptable?"_ (Depends on the data's durability requirement; for counters yes, for orders no — and if no, you need the transactional outbox, not fire-and-forget batching.) _"Explain how one `UPDATE` becomes five physical writes."_ (New tuple version + N index updates + WAL + eventual vacuum — the MVCC write-amplification story.)

---

### Q19 — Design a rate limiter for burst traffic, internal _and_ external clients.

**Mental model.** Rate limiting is fundamentally about **matching admitted load to capacity while deciding, fairly, whose requests to admit and whose to reject/delay when demand exceeds supply.** Two orthogonal design axes define the whole solution: **(a) the algorithm** — which determines _how bursts are treated_ — and **(b) where the counter lives** — which determines _whether the limit is accurate across a distributed fleet._ The "burst" requirement in the question is a direct pointer at the algorithm axis; the "distributed service" reality is a pointer at the counter axis. Address both explicitly.

**Structured reasoning:**

**Axis A — the algorithm (and why token bucket wins for bursts):**

- **Fixed window** (count per calendar minute) — simple but has the **boundary-burst flaw**: a client can send a full window's worth at 11:59:59 and another full window at 12:00:00, doubling the intended rate across the boundary. Disqualifying for burst-sensitive limits; know this flaw by name.
- **Sliding window** (log or counter) — fixes the boundary flaw by weighting the previous window; more accurate, more state.
- **Token bucket** — the right default _for bursts_. Tokens refill at a steady rate up to a bucket capacity; each request consumes a token. **It allows bursts up to the bucket size while enforcing the average rate over time** — which is exactly "handle burst traffic" without letting sustained abuse through. The bucket capacity _is_ your burst tolerance, tunable per client class. This is the answer to give, with the reasoning.
- **Leaky bucket** — smooths output to a constant rate (a queue that drains at fixed speed); good when the _downstream_ needs a steady rate, but it _doesn't allow bursts_ (it shapes them away), so it's the wrong default here unless the goal is to protect a rate-sensitive downstream.

**Axis B — where the counter lives (distributed accuracy):**

A per-instance in-memory limiter is wrong for a fleet — each of N pods enforces the limit independently, so the _effective_ limit is N× intended. For an accurate global limit you need a **shared store**, almost always **Redis**, holding the bucket state, mutated atomically. The atomicity matters: a naive GET-then-SET races under concurrency (two requests both read "1 token left," both proceed). Use a **Lua script** (or Redis atomic ops) so the check-and-decrement is a single atomic operation. Accept the trade-off: a network hop to Redis per request adds latency and makes Redis a dependency/SPOF — mitigate with local pre-checks, Redis HA, and fail-open-vs-fail-closed policy (decide deliberately: fail-_open_ preserves availability but abandons the limit during a Redis outage; fail-_closed_ preserves the limit but rejects traffic — a real, stated choice).

**Internal vs external clients (the question's explicit two-tier requirement):**

Different classes need different limits and different _policies_. External clients: strict per-API-key limits, quotas, and on breach return `429 Too Many Requests` with a `Retry-After` header (correct HTTP semantics — say this). Internal clients: higher or no hard limits, but still bulkheaded so an internal caller can't starve external SLA traffic; often _prioritized_ (shed low-priority internal/batch traffic first under pressure). Key it by API key / tenant / user tier, with a per-tier configuration. The architecture: a **gateway/edge filter** (API gateway, Spring Cloud Gateway, Envoy) enforcing centrally so every service is protected uniformly, rather than reimplementing limits per service.

> **Trap.** "Use a fixed-window counter." It's the easiest to implement and the most commonly reached-for, but its boundary-burst flaw directly violates the _burst_ requirement in the question — a client bursts across the window edge at 2× the rate. Naming token bucket _and explaining why fixed window fails the specific requirement_ is what separates a designed answer from a recalled one. Second trap: an in-memory limiter that silently multiplies the limit by pod count — correct-looking in a single-instance test, broken in production.

**Interviewer follow-ups:** _"Redis is your rate-limit store and it goes down — fail open or fail closed?"_ (State the trade-off and pick per client class: fail-open for internal availability, fail-closed for abuse-prone external.) _"How do you rate-limit fairly when one tenant sends 90% of traffic?"_ (Per-tenant buckets, not a global bucket, or weighted fair queuing / priority shedding.) _"Add cost-based limiting — some requests are 100× more expensive."_ (Consume tokens proportional to request cost, not one-per-request — the token-bucket model extends cleanly to this.)

---

## Appendix — Cross-Cutting Mental Models to Internalize

These recur across the whole set; if you internalize the models, you can _derive_ most answers under pressure instead of recalling them.

**1. Proxy-based advice (Q1, Q20).** `@Transactional`, `@Async`, `@Cacheable`, `@Retryable` — all Spring AOP proxies. They only work across the proxy boundary. Self-invocation (`this.method()`), non-public methods, and `final` methods silently defeat them. Whenever an annotation "does nothing," suspect the proxy boundary first.

**2. Little's Law and resource pools (Q3, Q4, Q10, Q20).** Concurrency = arrival rate × hold time. Any fixed pool (threads, connections, buffers) exhausts when concurrency exceeds pool size, and the killer is usually _inflated hold time_ (I/O inside the resource scope), not raw throughput. "It's saturated but the obvious resource is idle" → look for what's holding the resource _without using it._

**3. At-least-once + idempotency (Q2, Q5, Q7).** The network guarantees at-least-once, never exactly-once. Correctness comes from making effects idempotent (unique constraints, upserts, dedup keys, outbox/inbox), not from trying to make delivery perfect. Every retry/replay/duplicate-execution question reduces to this.

**4. The dashboard lies about the region under pressure (Q4 CPU, Q11 GC, Q13/Q15 heap).** The obvious metric being "normal" is often the _tell_ that the problem is in a different resource: DB CPU normal → connection hold time; heap normal → native/threads/direct/metaspace/container-limit; CPU normal → STW pauses. Always ask _which specific resource_, and read the _exact_ error string.

**5. Expand/contract for change under load (Q12).** You never apply a breaking change; you decompose it into individually-compatible steps with an overlap window where old and new coexist. Same pattern applies to schema, API versioning, and cache-key changes.

**6. Contain the blast radius (Q10, Q6, Q19).** Timeouts, circuit breakers, bulkheads, rate limits, graceful degradation, load shedding — all exist to stop _local_ failure from becoming _global_ failure (cascading failure). Any "one thing is slow/broken, protect the rest" question is a bulkhead/circuit-breaker question.

**7. Systematic > guessing (Q3, Q9, Q13, Q14, Q17).** State a _method_: USE (Utilization/Saturation/Errors) for saturation, RED (Rate/Errors/Duration) for services, hypothesis→instrument-the-boundary→confirm for silent failures, post-GC-trend for leaks. Interviewers reward the method as much as the answer — it shows you'll solve the _next_ problem too, not just this one.

---

## How to drill this for interview readiness

Don't re-read this passively. For each question, cover the answer and force yourself to produce, out loud and in under 90 seconds: **(1) the one-sentence mental model**, **(2) the single most likely root cause**, **(3) the trap you'd avoid**, and **(4) the first thing you'd check in production.** If you can generate those four cold for all twenty, you can reason from first principles under pressure — which is the actual bar, not reciting these paragraphs. Then have someone throw the follow-ups at you, because that's where the interview is really decided.
