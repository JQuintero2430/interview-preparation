# Architect-Level Production & Architecture Study Plan

**Audience:** ~3.5 yrs backend (Java / Spring Boot / microservices / PostgreSQL / Redis / AWS / Docker), preparing to operate and interview at software-architect level.

**How to use this document.** Each question follows the same three-beat structure: **(1) Mental model** — the principle that makes the answer inevitable rather than memorized; **(2) Structured reasoning** — root cause, failure modes, trade-offs; **(3) Resolution** — concrete config, code, or design. Questions from Group G onward add a closing **What the interviewer is really testing** line. After most questions there is a **Trap** callout (the plausible-but-wrong answer an interviewer uses to separate the memorizers from the reasoners) and **Interviewer follow-ups** (the "now it's under 10× load" probes where architect-level candidates are actually differentiated).

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


## Group G — Service-to-Service Communication & Resilience (Q21, Q22, Q23, Q24, Q25, Q26)

These questions share one root theme: **the moment a call leaves the process, it can be slow, duplicated, or lost, and no amount of correct code inside either service changes that.** The unit of reasoning here is not the method or even the resource — it is the _boundary_, and the guarantee you are willing to give across it. Group A asked what happens when N callers and M retries interleave inside one service; this group asks what happens when the two halves of an operation live in different processes with a network in between.

### Q21 — How do independent microservices actually talk to each other?

**Mental model.** There are two axes, not one list of technologies: **synchronous request/response versus asynchronous message passing**, and **point-to-point versus broadcast**. Everything else — protocol, serialization, discovery — sits below that choice. And the choice is fundamentally about _coupling_: a synchronous call couples **availability** (if B is down, A is down) and **latency** (A's p99 now includes B's p99); a message couples only the **schema**. Answer on that axis and the technology list follows; answer with "REST" and you have named one option without addressing the question.

**Structured reasoning — the options and what each actually costs:**

_Synchronous._ HTTP with JSON is the default: ubiquitous, trivially debuggable with `curl`, weakly typed unless you generate clients from an OpenAPI spec. gRPC over HTTP/2 with protobuf gives a real contract, binary framing, streaming, and lower overhead for chatty internal calls — at the cost of browser-unfriendliness and harder ad-hoc inspection. GraphQL belongs at the edge for client-driven aggregation, not usually between internal services. In Spring, the clients in play are `RestTemplate` (blocking, effectively legacy), `WebClient` (non-blocking, usable from a servlet app too), `RestClient` (a modern synchronous fluent client, added in Spring Framework 6.1), and declarative HTTP interfaces (`@HttpExchange`, or Feign in a Spring Cloud stack). Whichever you pick, the non-negotiables are the same: an explicit connect timeout _and_ read timeout, and a bounded connection pool.

_Asynchronous._ A broker, and the two families behave differently enough that conflating them is a real design error. Kafka is a partitioned, retained log: consumer groups, replay from an offset, ordering _within a partition only_, and consumers that can be added later and read history. SQS/RabbitMQ are queues: per-message acknowledgement, visibility timeouts, dead-letter queues, no replay once consumed. The intent distinction that matters more than the product: a **command** has exactly one rightful handler (a queue), while an **event** is a statement of fact that any number of parties may react to (a topic with fan-out). Publishing commands as events and hoping one consumer takes them is how you get double processing.

_Discovery and addressing._ How does A find B? In Kubernetes, a Service name is stable DNS and the platform load-balances, which is why most teams no longer run a registry. Otherwise a registry (Consul, Eureka) with client-side load balancing (Spring Cloud LoadBalancer). A service mesh sidecar takes discovery, retries, mTLS, and telemetry out of your application entirely — powerful, and a real operational commitment. What is never acceptable is a hard-coded host, or a home-grown registry.

_Contracts and versioning — the part that actually determines independence._ Services are only independently deployable if their contracts are compatible in both directions during a rollout: additive-only changes, tolerant readers that ignore unknown fields, explicit deprecation windows, and consumer-driven contract tests (Pact, Spring Cloud Contract) so a provider learns it broke a consumer in CI rather than in production. On Kafka, a schema registry with compatibility enforcement does the same job for message payloads. Without this, you have a distributed system that must be released in lockstep — a distributed monolith, with all the coupling and none of the simplicity.

_The anti-pattern to name unprompted._ Two services sharing a database. It looks like a shortcut to communication and it removes the property you split for: nobody can change a table, deploy alone, or reason about ownership. The API is the contract; the database is private. The legitimate variants are one service owning the schema and others reading through it, or event-carried replication into a read model (below).

> **Trap.** "Microservices communicate over REST." That names a transport and skips every decision that matters — whether the caller needs the answer, who owns the failure, and what happens during a rollout when both versions are live. The mirror trap: "we use Kafka, so we're decoupled." If your producer blocks until a consumer has processed the message, you have built a slow synchronous call out of more moving parts.

**Interviewer follow-ups:** _"Service A needs data owned by B on every single request — what do you do?"_ (Ladder: call B synchronously and accept the coupling; cache B's response with a TTL and accept staleness; replicate what A needs into A's own store via B's events — a CQRS read model — and accept eventual consistency; or treat "needed on every request" as evidence the boundary is wrong and move it.) _"You have a synchronous chain of five services, each 99.9% available. What's your availability?"_ (Roughly 99.5%, because availabilities multiply — the argument for flattening chains, making hops asynchronous, or designing explicit degradation.) _"How do you deploy a breaking change to a message payload?"_ (You don't: add the new field, dual-publish or dual-read through an overlap window, migrate consumers, then remove — the expand/contract pattern of Q12 applied to schemas.)

**What the interviewer is really testing.** Whether you reason about coupling and failure semantics rather than reciting transports, and whether "independently deployable" is a property you know how to _maintain_ (contract tests, additive schemas, no shared database) or just a phrase. The single strongest signal is volunteering the availability-multiplication argument before being asked.

---

### Q22 — REST or a message broker: how do you choose?

**Mental model.** One question decides it: **does the caller need the result in order to continue?** If yes, it is synchronous, and you accept the coupling. If no, then the call is really a task or a fact, and making it synchronous imports the callee's availability and latency into your own SLO in exchange for nothing. A second question decides the shape of the asynchronous version: **does anyone else care about this?** If yes, publish an event and let an unknown set of consumers react; if exactly one party must act, send it a command.

**Structured reasoning — what each side actually buys and costs:**

_Synchronous (REST/gRPC) buys_ an immediate answer, a simple mental model, and trivial debuggability — one trace, one request, one response. It is the right default for queries and for anything a user is waiting on. _It costs_ temporal coupling (both services must be up simultaneously), additive latency, backpressure that becomes your problem (when the callee slows, your threads and connections fill — Q3, Q10), and failure handling pushed onto the caller: retries, which produce duplicates, which demand idempotency (Q26).

_Messaging buys_ a buffer that absorbs bursts, a consumer that sets its own pace (backpressure for free), producer/consumer independence (add a consumer without touching the producer), and retry/DLQ machinery as _infrastructure_ rather than code you maintain. _It costs_ eventual consistency that the UI must be designed for, the loss of a return value (you need a status endpoint, a callback, or a push channel), ordering guarantees that are narrower than people assume (per partition, per queue — not global), at-least-once delivery that makes consumer idempotency mandatory rather than optional, and an entirely new operational surface: consumer lag, poison messages, DLQ triage, schema evolution, and the fact that a bug now silently accumulates a backlog instead of failing loudly.

_The decision rules, stated compactly._ A human is waiting on the result → synchronous. The work is expensive, bursty, or safely retryable → asynchronous. More than one consumer, or unknown future consumers → events. A state change others must learn about → an event, published through an outbox (Q25). A hard read-after-write requirement → synchronous, or an explicitly modelled pending state.

_The hybrid that is usually the right answer, and that candidates rarely offer._ Respond synchronously with an _accepted_ result — `202` plus a status URL or a resource in `PENDING` state — and do the work asynchronously. The caller gets an immediate, meaningful answer without holding a thread through the slow path, and you keep the resilience of a queue. Most "should this be sync or async?" arguments dissolve once you separate _acknowledging_ the request from _completing_ the work.

_One conceptual correction worth making explicitly._ "REST versus messaging" is not the same axis as "synchronous versus asynchronous." You can do request/reply over a broker (a correlation id and a reply queue) and you can do fire-and-forget over HTTP. What you are really choosing is whether the caller's progress depends on the callee's availability — which is why answering on the coupling axis, and only then naming a transport, is the senior move.

> **Trap.** "Async is faster." Asynchronous processing does not reduce the work; it relocates it and changes who waits. End-to-end latency for a single request usually gets _worse_ (broker hop, poll interval, consumer scheduling). What you gain is resilience, burst absorption, and throughput — say that, and you're answering about the right property.

**Interviewer follow-ups:** _"Your pipeline is asynchronous but the user needs to know when it's finished."_ (Poll a status endpoint, push over WebSocket/SSE, or notify out-of-band — and the real design decision is where the state machine for that job lives and who owns its terminal states.) _"How would you migrate an existing synchronous call to messaging without a big-bang cutover?"_ (Publish the event _and_ keep the synchronous call; verify the consumer produces identical outcomes; then stop calling synchronously. It requires an idempotent consumer, since for a window both paths are live.) _"Ordering matters for your events — now what?"_ (Partition by the entity key so all events for one aggregate land in one partition and stay ordered; accept that global ordering is not on offer; and design consumers to tolerate out-of-order arrival with a version or timestamp where you can't guarantee it.)

**What the interviewer is really testing.** Whether you can derive the choice from the caller's requirement instead of from fashion, and whether you know the _operational_ price of a broker — lag, DLQs, duplicate delivery, schema evolution — rather than treating messaging as free decoupling. Offering the `202`-plus-status hybrid unprompted is the clearest senior signal in this question.

---

### Q23 — Service A calls Service B and B fails. What does correct behaviour look like?

**Mental model.** "B failed" is at least four different situations, and the correct response differs in each: **(1)** B returned a 4xx — your request is wrong, retrying is pointless; **(2)** B returned a 5xx — B knows it failed and probably did nothing, a retry may help; **(3)** B did not answer in time — **you do not know whether it executed**, and this is the only genuinely hard case; **(4)** the connection was refused or the host is unreachable — nothing executed, retrying is safe. Classify first. Every sensible answer follows from which of the four you are in, and the candidate who answers "retry with backoff" has silently assumed case 2 or 4.

**Structured reasoning:**

_Case 3 is the whole problem._ A timeout is not the failure of an operation; it is the failure of the _answer_. The write may have committed with the acknowledgement lost on the way back (this is Q2, one process boundary further out). So you need one of three things: the operation is idempotent so you can safely repeat it (Q26); B exposes a way to _ask_ what happened, keyed by your request id; or you persist your intent locally and reconcile later. Without one of them, you must choose between the risk of duplicating and the risk of losing — and choosing consciously, and saying which, is the answer.

_Decide per call what failure means to the caller._ Three legitimate policies. **Fail**: propagate an error — a 502/503 with a `Retry-After` if the client may retry — and never a `200` with a hollow body. **Degrade**: serve a cached, default, or partial answer, and mark it as partial so the consumer knows. **Defer**: accept the request, persist it durably, complete it asynchronously, and tell the caller where to look (`202` plus a status resource). Which one is correct is a product decision, not a technical one, and recognising that is the architect-level move.

_Never silently swallow._ The failure that causes real incidents is `catch (Exception e) { log.error(...); return null; }`: the caller can no longer distinguish "there is no data" from "we don't know", nothing increments an error metric, and the bug surfaces days later as inconsistent data. If you catch, you either handle (with a documented degraded result) or rethrow.

_Protect yourself while B is broken._ Timeout, circuit breaker, bulkhead — Q10 covers the saturation angle and Q24 the mechanics. The framing worth keeping: the caller's obligation is not to be taken down by the callee.

_Get the error semantics right on the way out._ Map B's 4xx to your own 4xx **only** if the cause was your caller's input; otherwise it is your 5xx — a downstream's client error is your server error. Propagate the correlation/trace id so the incident is one story instead of two unrelated ones (Q17). Do not leak B's internal error text or stack to your own clients.

_Partial failure across several calls._ If A calls B and then C, and C fails after B succeeded, you now have an inconsistency that no retry fixes: you need a compensating action or a durable-then-asynchronous design (Q25). Noticing this unprompted separates candidates who have operated a distributed system from those who have drawn one.

_What to observe._ Per-dependency error rate and latency, with **separate** counters for timeouts, 5xx, and connection failures — because the remediation differs for each — plus an alert on circuit-breaker state transitions rather than only on raw error rate.

> **Trap.** "Retry with exponential backoff." It is right for one of the four cases, it converts a timeout into a duplicate whenever the operation isn't idempotent, and retrying into an overloaded B multiplies the load on the service already drowning (retry amplification, Q10). Retries are a tool for _transient_ faults, paired with a breaker and a budget — not a general answer to "B failed."

**Interviewer follow-ups:** _"B returns 500 but the operation actually succeeded — how would you ever find out?"_ (Only if the request is identifiable: an idempotency key plus a lookup endpoint, or an outbox on B's side that lets you query the outcome. Otherwise you are guessing, and reconciliation becomes a batch job.) _"Where should the retry live — the client library, a sidecar, or the gateway?"_ (Exactly one layer. Nested retries multiply: three layers at three attempts each is twenty-seven calls for one user action.) _"The call is idempotent and B is timing out — do you retry forever?"_ (No: bound attempts _and_ total elapsed time against the caller's own deadline, then fail or defer. An unbounded retry is a queue you didn't design.)

**What the interviewer is really testing.** Whether you distinguish "B failed" from "I don't know what B did," because everything expensive about distributed systems lives in that gap. The strong answer classifies the failure, names the unknown-outcome case as the hard one, and treats fail/degrade/defer as a deliberate product choice.

---

### Q24 — Circuit breaker, retry and timeout: the state machine and the interactions

**Mental model.** Three patterns with three different jobs, and they must be composed in a specific order or they undermine each other. A **timeout** bounds how long you hold a resource. A **retry** converts a transient failure into a success, at the cost of extra load and possible duplication. A **circuit breaker** stops you spending resources on a call you already know is failing. Timeout protects the caller's resources; retry protects the caller's success rate; the breaker protects both parties' capacity. Q10 covers _why_ you need them; this question is about _how they actually behave and interact_.

**Structured reasoning:**

_Timeout, precisely._ Connect timeout and read timeout are different settings, and in many HTTP clients at least one defaults to "wait forever" — which is how one slow dependency hangs a fleet. The value should be derived from the callee's SLO (its p99 plus margin), not from a round number, and the **sum of a chain's timeouts must fit inside the caller's own deadline**; otherwise the outermost caller has already given up while inner services keep burning capacity on work nobody will read. The mature version is a _deadline_ propagated with the request — gRPC deadlines, or a header your services agree to honour — so every hop knows how much time is actually left.

_Retry, precisely._ Only for transient faults, and only for operations that are safe to repeat (Q26). Exponential backoff **with jitter**, because unjittered retries synchronise into waves and become a self-inflicted denial of service. Bound both the attempt count and the total elapsed time. At scale, add a **retry budget** — cap retries at a small fraction of total traffic — which is the only mechanism that reliably prevents amplification during a partial outage. Never retry a 4xx; never retry a non-idempotent write without a key.

_Circuit breaker, as a state machine._ **Closed**: calls pass through and outcomes are recorded in a sliding window (count-based or time-based). When the failure rate — or the **slow-call rate**, which catches a dependency that is up but useless — exceeds a threshold, _and_ a minimum number of calls have been recorded, it transitions to **Open**: calls fail fast immediately, without touching the network. After a wait duration it moves to **Half-open**, where a limited number of trial calls are permitted; if they succeed it closes, if they fail it opens again. The parameters that decide whether it helps or hurts are the window type and size, the minimum call count (so three failures at 3am don't open a circuit), the failure-rate threshold, the slow-call duration threshold, the wait duration, and the number of permitted half-open calls. Resilience4j is the standard implementation in the Spring ecosystem; Netflix Hystrix is no longer maintained and should not be proposed for new work.

_How they interact — the ordering that actually matters._ Composed from the outside in: **bulkhead → circuit breaker → retry → timeout** around the call itself. Two consequences fall out. The retry sits _inside_ the breaker, so repeated failures are recorded and can open it; if you wrap the breaker inside the retry instead, your retries bypass the fast-fail entirely. And the timeout is innermost, so **each attempt** gets its own bound; put it outside the retry and the first attempt can consume the whole budget. Then do the arithmetic out loud: worst-case elapsed time is attempts × per-attempt timeout + backoff, and if that exceeds the caller's own timeout you have built a guaranteed failure with extra load. This arithmetic is the single most common thing missing from otherwise good answers.

_What opens a breaker that shouldn't._ Counting 4xx as failures, so one client's bad requests trip the circuit for everyone. A window so small that ordinary variance opens it. A breaker keyed too coarsely — per-service rather than per-endpoint or per-instance — so one bad endpoint or one bad pod fails everything.

_Fallbacks are only as good as their semantics._ A fallback is worth having when the degraded answer is genuinely acceptable — a cached price, a default recommendation, an explicit "temporarily unavailable". A fallback that returns an empty list which the UI renders as "you have no orders" is strictly worse than an error, because it silently lies to the user and to your metrics.

> **Trap.** "Add retries and a circuit breaker" with no ordering, no budget, and no idempotency. The second trap is believing the breaker protects the _callee_ — its primary purpose is to stop the **caller** from destroying itself on doomed calls; the callee benefits only as a side effect of reduced load. And the third: tuning these values by intuition rather than from the dependency's measured latency distribution.

**Interviewer follow-ups:** _"Only one instance of the downstream is bad, and your breaker opened for all of it — what's wrong?"_ (The breaker is keyed too coarsely; use per-instance/per-endpoint keys, or let the load balancer eject the bad instance — outlier detection — which is the layer better placed to do it.) _"How do you test any of this?"_ (Fault injection: a proxy that adds latency and errors, or a mesh fault rule; load tests where the dependency is _slow_ rather than down, because slow is the case that actually saturates you; and an assertion that the fallback path is exercised in CI.) _"Your timeout is 2s and the downstream's p99 is 3s."_ (You are deliberately failing 1% of calls that would have succeeded — legitimate only if a fast failure beats a slow success for that use case, and a decision to make explicitly rather than by leaving a default in place.)

**What the interviewer is really testing.** Whether you have configured these in anger or only read about them. The distinguishing details are the half-open state, the slow-call threshold, the minimum-calls guard, the decorator ordering, and the retry-versus-caller-timeout arithmetic — none of which appear in a memorised definition.

---

### Q25 — How do you manage a transaction that spans services?

**Mental model.** You don't — not in the ACID sense. There is no practical distributed transaction across independently deployed services, so the real question is **which weaker guarantee you choose and how you make the weakening safe**. Two tools carry almost all the weight: a **saga** (a sequence of local transactions, each with a compensating action) and the **transactional outbox** (making "commit my state" and "publish my event" a single atomic act). Everything else is either a textbook answer that doesn't survive contact with cloud infrastructure (2PC/XA) or an illusion (`@Transactional` across an HTTP call).

**Structured reasoning:**

_Why not two-phase commit._ XA is real and it works, with a coordinator and XA-capable resources. It also holds locks across the network for the duration of a prepare–commit round trip, blocks when the coordinator dies at the wrong moment, does not span HTTP APIs or most managed cloud services, and reduces availability precisely when a participant is struggling. Knowing it exists is table stakes; being able to say _why it is the wrong architectural choice here_ is the actual signal.

_The dual-write problem, which is the root cause people skip._ "Save the order, then publish the event" is **two writes with no atomicity between them**. Crash in between and you have state with no event (work silently lost downstream) or an event with no state (a phantom that consumers act on). No arrangement of try/catch fixes this, and neither does publishing before committing. The **transactional outbox** does: inside the same local transaction as the business write, insert a row into an `outbox` table; a separate publisher — a poller, or change data capture such as Debezium reading the write-ahead log — sends those rows and marks them dispatched. Now the atomic unit is one local commit, and publication becomes at-least-once, which is exactly the contract consumers should already assume. The mirror on the consuming side is the **inbox**: record the processed message id in the same transaction as its effect, so a redelivery is a no-op.

_Saga, and the two shapes._ **Orchestration**: one coordinator — a service you write, or a durable workflow engine such as Temporal, Camunda, or Step Functions — invokes each step and, on failure, invokes the compensations in reverse. The flow is explicit and easy to change, you can query "where is order 123?", and the coordinator is a component that must itself be reliable and can accumulate coupling. **Choreography**: each service reacts to events and emits its own; nothing coordinates, coupling is minimal, and the business process exists only implicitly, spread across N services — nobody can answer "where is order 123?" without reconstructing it from traces. Useful rule to state: choreography while the flow is two or three steps and linear; orchestration once it has branches, timeouts, retries with human intervention, or a need to report status.

_Compensation is not rollback._ You cannot un-send an email or un-charge a card; you issue a refund. The compensating action is a **new business fact**, it can itself fail (so it needs its own retries and its own idempotency), and some steps are simply irreversible. Two consequences follow: order the saga so cheap and reversible steps happen first and irreversible ones last, and prefer the **reserve-then-confirm** shape — a pending reservation with a TTL that expires harmlessly — for inventory, seats, and funds.

_Sagas have no isolation, so model the intermediate state._ Between steps, a half-completed process is visible to everyone. The answer is to make that state a first-class part of the domain — the order is `PENDING`, the seat is `HELD`, the payment is `AUTHORIZED` — rather than pretending an intermediate state doesn't exist. Skipping this is how you get business-level lost updates and dirty reads that no database isolation level was ever going to prevent.

_And the question nobody asks first: do you need this at all?_ If the two writes belong to the same aggregate and the same invariant, they belong in the same service and the same local transaction, and the saga is a symptom of a boundary drawn in the wrong place. Sometimes the correct answer to "how do I coordinate a transaction across these two services?" is "merge them, or move the data."

> **Trap.** "Use `@Transactional` across both services", or "use XA." The first does not exist — the transaction context is bound to a thread and a connection, so it cannot follow an HTTP call (the mechanics are in this repository's Spring guide, §4.5). The second is technically real and operationally wrong for independently deployed services. The subtler trap is the confident dual-write: publishing the event inside the transactional method and assuming the broker send and the commit succeed or fail together. They don't.

**Interviewer follow-ups:** _"Your outbox publisher sent the same row twice — is that a bug?"_ (No. At-least-once is the contract; the consumer's dedup table is the fix. A publisher that tried to guarantee exactly-once would be reinventing the problem.) _"How do you know a saga is stuck?"_ (Per-step timeouts, an explicit state machine you can query, and an alert on instances sitting in a non-terminal state longer than expected — this is precisely where orchestration earns its cost.) _"What if a compensation fails permanently?"_ (It becomes a business exception: dead-letter it into a human workflow with enough context to resolve it. Retrying forever is not a design, and neither is logging and moving on.) _"Exactly-once processing — can you have it?"_ (Not delivery. At-least-once delivery plus idempotent processing gives you _effectively_ once, which is what people mean; saying it precisely is a strong signal — Q5 and Q26.)

**What the interviewer is really testing.** Whether you can name the dual-write problem without being led to it, and whether "saga" is a word or a design you can reason about — compensations that are new facts, an explicitly modelled intermediate state, and the choice between orchestration and choreography argued from the process's complexity.

---

### Q26 — Designing an idempotent API

**Mental model.** Idempotency is a property of the **effect**, not of the HTTP verb, and it exists for one reason: so that a client which never learned the outcome can safely ask again. Three design questions follow, and a complete answer addresses all three: what identifies "the same logical operation," where that identity is stored and for how long, and **what you return the second time**. Q2 covers why retries create duplicates; this question is the API-design view of the same truth.

**Structured reasoning:**

_The key identifies intent, so the client generates it._ One key per logical user action — a UUID minted before the first attempt and reused for every retry of that action. A server-generated key cannot deduplicate anything, because the retry would arrive with a new one. Scope the key per endpoint and per authenticated principal so two tenants cannot collide and a key cannot be replayed against a different operation. Store a fingerprint of the request body alongside it: the same key arriving with a _different_ payload is a client bug and deserves a `422`/`409`, not the silent replay of a stored response for a request you never actually processed.

_Making it atomic — this is where real implementations break._ "Look up the key, and if absent, do the work" is a time-of-check-to-time-of-use race: two concurrent retries both see nothing and both proceed. The insert of the key must be **in the same transaction as the business write**, arbitrated by a `UNIQUE` constraint; the loser catches the constraint violation and returns the stored outcome. The richer variant is a two-phase record: insert the key in state `IN_PROGRESS` first, do the work, then mark it `COMPLETED` with the response — which additionally lets a duplicate that arrives mid-flight answer "in progress" instead of blocking or double-executing.

_What you return on a replay._ The same status and the same body as the original — which means the response, or enough to reconstruct it, must be persisted alongside the key, including the identifier you generated. Returning `200` where the first call returned `201` is a small lie that breaks strict clients; returning a **new** resource is exactly the duplicate you built all this to prevent.

_Natural idempotency beats a key whenever it exists._ If the domain already has a unique identity for the operation — one payment per order, one ledger entry per external transaction id — a `UNIQUE` constraint enforces it under all concurrency with no extra machinery, and an upsert (`INSERT … ON CONFLICT`) makes the write itself replay-safe at the storage layer. Reach for an idempotency key only when no natural key exists.

_Verb semantics, stated accurately._ `GET`/`HEAD`/`OPTIONS` are **safe**. `PUT` and `DELETE` are idempotent _if you implement them as full replacement and removal_ — and for a repeated `DELETE` you must decide and document whether the second call returns `204` or `404`. `POST` is not idempotent, which is precisely why it needs a key. `PATCH` is generally not idempotent (an "increment by one" patch certainly isn't). And the distinction that separates good answers: **idempotent is not the same as concurrency-safe.** Two _different_ `PUT`s still race, and the answer to that is optimistic concurrency with `ETag`/`If-Match` or a version column — a different problem with a different tool.

_Storage and expiry._ Keys need a retention window covering the longest plausible client retry plus clock skew — typically hours to a day — and expiry must be a background sweep, not a job that locks the table at midnight. One correctness point worth being firm about: if the key store can lose data independently of the business data (a non-durable Redis, say), you can double-apply after a failover. Keys held in the same transactional database as the effect are the version that is actually safe; anything else is a performance trade you should make knowingly.

_The messaging mirror._ Same reasoning, different vocabulary: a consumer-side inbox keyed by message id, written in the same transaction as the effect (Q25). And the framing to state precisely, because it comes up constantly: exactly-once _delivery_ does not exist across a network; at-least-once delivery plus idempotent processing is what "exactly once" means in practice. The retry-safety angle is covered in this repository's `Backend Interview Study Guide` (§3.11 and §5.3).

> **Trap.** "Make it idempotent by checking whether the record already exists." That is the race, not the fix — the check and the insert must be one atomic operation. The second trap is using a distributed lock (a Redis `SETNX`) as the mechanism: a lock is not idempotency. It can expire while the first operation is still running, and even when it works it tells the second caller nothing about _what the first one produced_, which is the whole point.

**Interviewer follow-ups:** _"A retry arrives while the first request is still executing — what does the client get?"_ (`409` (or `425`) with a `Retry-After`, or a short block until the first completes; the one unacceptable answer is starting a second execution.) _"How long do you keep idempotency keys, and what happens after that?"_ (Long enough to cover the retry window; afterwards a replay is indistinguishable from a new request — which is why the window must be a documented part of the API contract, not an implementation detail.) _"Is a `GET` idempotent?"_ (It is idempotent _and_ safe by specification — but check whether yours really is: audit rows, view counters, and rate-limit side effects make a `GET` unsafe in practice, which matters as soon as anything retries it.) _"Two services must both be idempotent for one user action — how do you tie it together?"_ (Propagate the same logical operation id across the boundary, so each service dedupes on the same identity rather than each inventing its own.)

**What the interviewer is really testing.** Whether you can design the mechanism rather than name the header — specifically the atomic check-and-insert, the stored response for replays, and the distinction between idempotency and concurrency control. Volunteering that a natural unique constraint is stronger than an idempotency key is the detail that marks real experience.

---

## Group H — Delivery: Containers, CI/CD & the Path to Production (Q27, Q28, Q29, Q30, Q31)

This group covers the path from a commit to a running process, and its organising idea is that **most deployment failures are not code failures** — they live in the packaging, the platform's view of health, the compatibility window during a rollout, or the absence of a signal that would have told you. Group C looked at two specific delivery failures (503s during a rollout, a breaking schema change); this group covers the machinery those failures live inside.

### Q27 — Packaging a Spring Boot application as a container image

**Mental model.** The image is a build artifact with two goals in tension — **cache-friendly rebuilds** and a **small, secure runtime** — plus one thing that is easy to get wrong and invisible when you do: **the JVM has to be sized against the container's limits, not the host's.** The answer most people give (copy the fat jar, `java -jar`) satisfies none of the three.

**Structured reasoning:**

_Layering, and why the fat jar hurts._ A Spring Boot fat jar is one large file, so a one-line code change invalidates the entire layer and every build pushes tens of megabytes of unchanged dependencies. Spring Boot's **layered jars** split the archive into dependencies, spring-boot-loader, snapshot dependencies, and application classes; extracting those into separate image layers (via `layertools` in a multi-stage build) means a code-only change pushes a small final layer and everything upstream is a cache hit. Cloud Native Buildpacks (`spring-boot:build-image`) and Jib do this for you without writing a Dockerfile at all, and for most teams that is the right default; a hand-written multi-stage Dockerfile is entirely fine and gives you more control over the base image.

_Multi-stage build._ Stage one has the JDK and the build tool, with the dependency resolution done in its own cacheable step so a source change doesn't re-download the world. Stage two carries a JRE-only or `jlink`-trimmed runtime: smaller, and with less attack surface than a full JDK. Choose the base deliberately rather than by habit — a slim `-jre` or distroless image, the right libc for your JVM (Alpine means musl, which is a decision, not a default), and **pinned by digest** rather than a floating tag, or your "reproducible" build silently changes underneath you.

_The part that is specific to the JVM and that people miss._ Modern JVMs are container-aware (`UseContainerSupport`, on by default since JDK 10 and backported into 8u191): the JVM reads the cgroup memory limit and CPU quota instead of the host's, and sizes the default heap and `availableProcessors` from those. But "aware" only means it _reads_ the limit — it still defaults to a fraction of it, so a 2GB container quietly runs with a heap several times smaller than the memory you paid for. Set `MaxRAMPercentage` explicitly, and leave genuine headroom: heap is not the only consumer, and metaspace, thread stacks, code cache, and direct buffers all live outside it (this is Q15's invisible-OOM, now with a container limit as the ceiling). On the CPU side, a **limit** throttles rather than descheduling, so a limit of 1 both shrinks what the JVM thinks it has — common pool size, GC threads — and produces latency spikes at low average utilisation.

_Startup and shutdown, which is where deploys actually break._ `SIGTERM` must reach the JVM: use the exec form of the entrypoint so the JVM is PID 1 (or run a tiny init that forwards signals), because a shell wrapper swallows the signal and your container is then killed by the grace-period timeout instead of shutting down. Then enable Spring Boot's graceful shutdown (`server.shutdown=graceful` with a bounded per-phase timeout) so in-flight requests drain instead of being severed. Without both, **every rolling deploy drops requests** — the mechanism behind Q6.

_Configuration and secrets._ Configuration comes from the environment, so **the same image is promoted through every environment unchanged**. That property is what makes the pipeline in Q29 and the promotion model in Q30 meaningful; an image with an environment baked in has to be rebuilt per environment, and then staging never tested what production runs. Secrets are mounted or injected at runtime, never baked into a layer — and note that a secret added in one layer and deleted in a later one is still sitting in the image history.

_Security hygiene that a reviewer will look for._ A non-root user, a read-only root filesystem where the app tolerates it, no build tooling in the runtime stage, an image scan in CI with an explicit policy about what fails the build, and a generated SBOM if you have supply-chain obligations.

> **Trap.** `FROM openjdk:latest`, copy the fat jar, `CMD java -jar app.jar`, running as root. It works on the first day and then hands you slow pushes, an 800MB image, a heap a quarter the size you expected, no signal handling, and dropped requests on every deploy. The second trap is treating the Dockerfile as an afterthought owned by nobody — it is a build artifact definition, and it belongs under the same review standard as the code.

**Interviewer follow-ups:** _"Your image is 800MB — where did that come from?"_ (A JDK where a JRE would do, build tools left in the runtime stage, a fat jar copied _on top_ of extracted layers so both exist, or a package install without cleanup in the same layer.) _"Startup takes 40 seconds and Kubernetes keeps restarting the pod."_ (Two separate answers: fix the platform side with a startup probe (Q28), and attack the cause — classloading and JIT warm-up — with AppCDS, or GraalVM native image if startup genuinely is the constraint, with the honest caveats about reflection configuration and build times.) _"How do you know which commit is running in a given container?"_ (Tag by commit SHA and expose build info — `/actuator/info` populated from build metadata — because "latest" makes that question unanswerable during an incident.)

**What the interviewer is really testing.** Whether you treat the image as an engineered artifact rather than a wrapper — layer caching, base-image choice, and above all the JVM-versus-cgroup relationship, which is the detail that separates people who have debugged a container OOM from people who have read a tutorial.

---

### Q28 — Running it on Kubernetes: probes, resources and rollout

**Mental model.** Kubernetes knows nothing about your application except what the **probes** report and what the **resource declarations** claim. Every deploy pathology — 503s during a rollout, restart storms, traffic to a cold pod, mysterious kills with no exception in the logs — is a mismatch between one of those two claims and reality. So the answer is not a list of manifest fields; it is which claim each field makes and what happens when the claim is wrong.

**Structured reasoning:**

_The three probes, and the distinction that matters most._ **Liveness** answers "should I be killed and restarted?" It must be cheap and dependency-free, because a liveness probe that checks the database converts a brief database blip into a fleet-wide restart storm — the single most damaging probe mistake there is. **Readiness** answers "should I receive traffic?" — this is where dependency checks legitimately belong, with the real trade-off that a deep check flaps _every_ pod out of rotation simultaneously when a shared dependency wobbles. **Startup** probes exist so that a slow-booting JVM isn't killed by liveness before it finishes starting; that, and not an inflated liveness `initialDelaySeconds`, is the correct fix for "my pod restarts while starting up." Spring Boot supports this directly: `/actuator/health/liveness` and `/actuator/health/readiness` expose the availability state, and readiness flips to out-of-service during graceful shutdown — which is exactly the signal the rollout needs.

_The rollout race that produces 503s._ When a pod is terminated, the kubelet sends `SIGTERM` **and** the endpoint is removed from the Service concurrently — and endpoint removal has to propagate to kube-proxy and the ingress, which is not instantaneous. For a short window, traffic still arrives at a pod that has already started shutting down. The fix is three-part and all three parts are needed: a `preStop` hook that sleeps a few seconds so deregistration wins the race, graceful shutdown that drains in-flight requests (Q27), and a `terminationGracePeriodSeconds` comfortably larger than the drain timeout. On the way in, the mirror problem: readiness must not pass until the app can actually serve — pools established, caches warm — or you route real traffic to a cold pod and 503 the first requests (Q6).

_Resources, and the two very different failure modes._ **Requests** drive scheduling and are what you are effectively guaranteed; **limits** are where enforcement happens, and enforcement differs by resource. Memory is incompressible: exceed the limit and the kernel kills the container — exit code 137, with **no Java `OutOfMemoryError` and nothing in the application log**, which is why "the pod restarted and there's no exception" is almost always a memory-limit story. CPU is compressible: exceeding the limit throttles you within each scheduler period, which manifests as latency spikes while average CPU looks unremarkable. Many teams therefore set CPU requests but deliberately omit CPU limits for latency-sensitive services — a defensible trade to present as a trade, not as a rule. And the heap must sit meaningfully below the memory limit for the reasons in Q27.

_Rollout strategy, and what each one actually requires of you._ `RollingUpdate` with `maxUnavailable`/`maxSurge` is the default, and it means **old and new versions run simultaneously, always** — so both the API and the schema must be compatible in both directions for the length of the rollout (Q12). Blue/green swaps all traffic at once: fast rollback, double the resources, and the schema still has to serve both versions. Canary shifts a fraction of traffic and is only worth its complexity if something _evaluates_ the canary's metrics and decides — an unevaluated canary is just a slower rolling update. And the boundary worth stating plainly: `kubectl rollout undo` reverts pods, not data, which is why every migration has to be backward compatible for at least one version.

_Availability guardrails that get skipped and then cause an incident._ A PodDisruptionBudget, so voluntary disruptions — node drains, cluster upgrades — cannot take every replica at once. Anti-affinity, so your three replicas are not on one node. An HPA whose metric actually reflects saturation: CPU is a poor proxy for an I/O-bound service, and in-flight requests or queue depth are far better signals.

_Configuration._ ConfigMaps and Secrets injected as environment variables or mounted files. One behaviour to know: an updated mounted ConfigMap changes the file but does **not** restart the process, and Spring will not re-read it without `@RefreshScope` or a restart — so the boring, correct answer is usually to roll the deployment, and to treat config changes with the same care as code changes because they ship the same way.

> **Trap.** Pointing liveness and readiness at the same endpoint. It conflates "restart me" with "don't send me traffic," and it converts a downstream outage into a restart storm that makes the outage worse. The second trap is believing a green rollout means users are being served — probes report the pod's opinion of itself, not the end-to-end path (Q6).

**Interviewer follow-ups:** _"A pod is in `CrashLoopBackOff` — walk me through the diagnosis."_ (`describe` for events and the exit code first — 137 is an OOM kill and not an application bug, 143 is a `SIGTERM`; then the previous container's logs; then the probe configuration and the actual startup time. The order matters because the exit code often ends the investigation immediately.) _"You need a zero-downtime deploy that includes a schema change."_ (Expand/contract from Q12 — and the honest framing is that the deploy is the easy half; the compatibility window is the design.) _"Requests and limits: what would you set for a JVM service, and why?"_ (Memory request = limit so the pod is guaranteed and never surprised, with the heap sized well below it; CPU requested from measured usage, with the limit decision argued explicitly.)

**What the interviewer is really testing.** Whether you understand that the platform acts only on the signals you give it, and whether you can name the concrete mechanisms — the endpoint-removal race, exit 137 versus a Java OOM, throttling versus killing, old-and-new coexistence during a rollout — rather than listing manifest fields.

---

### Q29 — What the pipeline for a Spring Boot microservice contains, and why each gate exists

**Mental model.** A pipeline is a sequence of **falsifiable claims about one artifact**, ordered so that the cheapest claim that could fail does so first. Every stage exists to answer a specific question, and a stage that cannot fail the build is decoration. The second organising principle, and the one that separates a pipeline from a script: **build once, then promote the same artifact** — anything rebuilt per environment invalidates everything the earlier stages proved.

**Structured reasoning — the stages, and the question each one answers:**

_Trigger and pre-checks._ On every push and pull request. Compile, formatting and static analysis (Spotless, Checkstyle, Sonar) — the question is "is this even well-formed?", and the answer must arrive in seconds, in parallel, and loudly.

_Unit tests._ The bulk of the suite, plain JUnit with no Spring context wherever the logic allows it. Question: "does the logic do what it claims?" This is where a codebase's testing discipline pays off — fast tests that each fail for exactly one reason are what make the rest of the pipeline trustworthy.

_Integration tests._ Sliced Spring tests for the web and persistence layers, and Testcontainers for the real database and broker rather than an in-memory substitute pretending to be Postgres — because dialect behaviour, constraint enforcement, and locking semantics are precisely what you are trying to verify, and those are exactly what the substitute gets wrong. Question: "does it work against the real dependencies' semantics?"

_Contract tests._ Consumer-driven contracts verified against the provider (Pact, Spring Cloud Contract). Question: "will this break somebody else?" This is the only gate that protects independent deployability (Q21), it is the one most teams skip, and the consequence of skipping it is a lockstep release train discovered six months later.

_Coverage and quality gates._ Applied to **new and changed lines** rather than to the project total, so the ratchet actually turns on a legacy codebase. Question: "did we add untested branches?"

_Build the artifact — exactly once._ Package, then build the image and tag it with the **commit SHA**, and record the resulting digest. Question: "what precisely are we shipping?" Everything downstream refers to that digest and nothing rebuilds it.

_Security scanning._ Dependency CVEs, image scan, secret scanning, SBOM generation. Question: "are we shipping a known vulnerability?" The tool matters less than the policy: which severity fails the build, who may waive it, and how long a waiver lives.

_Publish._ Push to the registry, sign the image if you have supply-chain requirements. Nothing is ever published from a developer's laptop, because an artifact nobody can trace is an artifact nobody can audit.

_Deploy to staging automatically, then verify against the running system._ Smoke tests that make real calls to real endpoints, not a re-run of unit tests. Database migrations applied here as an explicit, versioned, forward-only and backward-compatible step (Flyway or Liquibase) — and note that this is the one part of the deploy that pods rolling back will not undo.

_Promote to production._ The **same digest**, different configuration. A manual approval if compliance requires one; progressive delivery — canary or blue/green (Q28) — if the traffic justifies it; and rollback triggered by SLO burn rather than by a human noticing a graph.

_Post-deploy verification._ Smoke tests, a comparison of error rate and latency against the pre-deploy baseline, and a defined bake time before the pipeline declares success.

_The properties that decide whether any of this is worth having._ It must be **reproducible** (the same input produces the same artifact), **fast enough that nobody routes around it** — a forty-minute pull-request pipeline gets bypassed, formally or informally — and above all **trusted**: a suite with flaky tests is worse than no suite, because the team learns to re-run until green, which is behaviourally identical to having no gate at all. Secrets come from a vault or OIDC federation with short-lived credentials, never from long-lived repository variables that eventually print into a log.

> **Trap.** "We run the tests and then we deploy." That is a script, not a pipeline; the substance is which claims are made, in what order, and what happens when one fails. The second trap, and the more expensive one: rebuilding the image per environment. Staging then tested a different artifact than the one production runs, and every guarantee above quietly evaporates.

**Interviewer follow-ups:** _"Your pipeline takes forty minutes — what do you cut?"_ (Parallelise by module, split fast from slow suites so only the fast ones block the pull request, cache dependencies properly, move the full matrix to a nightly run — and measure which tests have ever actually caught a defect, because some of that time is buying nothing.) _"Where do migrations run, and what if one fails halfway?"_ (A dedicated step ahead of the new code, backward compatible, relying on the tool's own locking so two pods cannot migrate concurrently. A failed migration is a stop-the-line event, which is exactly why forward-only and backward-compatible is the discipline rather than a preference.) _"How do you handle a flaky test?"_ (Quarantine it out of the blocking path immediately, then fix or delete it on a deadline. Re-running until green is not a strategy; it is the erosion of the whole pipeline's value.)

**What the interviewer is really testing.** Whether you can justify each stage by the question it answers and the failure it prevents, and whether you volunteer build-once-promote-many and contract testing without prompting. Those two are what distinguish someone who has designed a delivery process from someone who has used one.

---

### Q30 — Trace one commit from `git push` to production

**Mental model.** This is not a request to list tools again — it is a test of whether you know where the **state transitions** are, who owns each one, and what identity threads through them. The answer worth giving is a timeline with the artifact as the through-line: one commit becomes one image digest, that digest is deployed to each environment unchanged, and every gate and rollback decision refers to it.

**Structured reasoning — the chronology, with the gates named:**

_1. Push to a branch._ A webhook triggers CI. Branch protection means this commit cannot reach the default branch without review and a green pipeline — a social gate, enforced mechanically.

_2. The pull-request pipeline_ runs the fast claims from Q29. The developer's feedback loop ends here; everything after this point is about an artifact, not about source.

_3. Merge._ Squash or rebase produces a **new commit SHA** — worth knowing, because the artifact is tagged from the merged commit, not from the branch head that was reviewed.

_4. The main-branch pipeline builds the artifact once,_ tags it with that SHA, pushes it, and records the digest. From here nothing is rebuilt; promotion is a change of reference, not a change of bytes.

_5. Deploy to staging._ Either the pipeline pushes the change (`kubectl`/`helm upgrade` with the new digest), or — in a GitOps model — the pipeline commits the digest to a configuration repository and Argo CD or Flux reconciles the cluster toward it. Naming that distinction is a strong signal, because GitOps turns "what is running in production?" into a git query and makes drift detectable instead of theoretical.

_6. Kubernetes performs the rollout._ A new ReplicaSet, pods started, readiness awaited, endpoints shifted, old pods terminated with `SIGTERM`, `preStop`, and drain (Q28). Old and new coexist for the duration — which is why the API and the schema must be compatible in both directions (Q12), and why this step, not the pipeline, is where most "the deploy broke it" incidents actually originate.

_7. Migrations_ run as an explicit step, backward compatible, guarded by the migration tool's own lock so two pods cannot race.

_8. Post-deploy checks in staging, then promotion to production_ — the same digest with production configuration, possibly behind an approval, often progressively (canary, then a traffic ramp, then full).

_9. Feature flags decouple deploy from release._ The code can be in production, dark, and enabled later for a cohort. This is the most useful answer available to "how do you ship risky changes?", and it changes what rollback means: flip the flag, which is seconds, rather than redeploy, which is minutes.

_10. Observability closes the loop._ The deploy is annotated on the dashboards, SLO burn rate is watched through a defined bake period, and rollback is a rehearsed action — redeploy the previous digest — with the standing caveat that data changes, published events, and sent emails do not roll back with the pods.

_What the boring version gets wrong, and why each one hurts._ Rebuilding per environment (staging tested something else). Tagging `latest` (nobody can say what is running, and rollback has no target). Configuration baked into the image (promotion requires a rebuild, so the artifact is no longer the thing you tested). Migrations run by hand at deploy time (unrepeatable, unaudited, and the first thing to be forgotten at 2am). No deploy annotation in monitoring, so the cheapest question in every incident — "did something change?" — takes twenty minutes instead of five seconds.

> **Trap.** Answering with the pipeline stages again. Q29 is the anatomy; this question is the chronology and the identity — where the compatibility windows open and close, where a human is in the loop, what exactly is promoted, and what rollback means at each step. The other trap is presenting an idealised pipeline you have never operated; naming the manual step you actually have, and why it exists, is more credible than describing a fully automated fantasy.

**Interviewer follow-ups:** _"At which points can you roll back, and what can you never roll back?"_ (Pods, yes. Schema, no — only forward. Published events, consumed messages, sent emails, and third-party side effects, no. That list is the reason expand/contract and idempotency exist.) _"How long does a one-line fix take to reach production, and where does the time actually go?"_ (An honest answer names the dominant queue — usually review latency or a slow test suite, rarely the deploy itself — and that honesty reads as experience.) _"Who can deploy, and how do you know who deployed what?"_ (Pipeline identity rather than personal credentials, an audit trail from commit to digest to rollout, and — the real answer — the ability to reconstruct it during an incident rather than after one.)

**What the interviewer is really testing.** Whether the delivery path is something you have operated or only heard described. The distinguishing details are build-once-promote-by-digest, the coexistence window during a rolling deploy, the deploy/release split via flags, and a precise account of what rollback does not cover.

---

### Q31 — The deploy is failing right now. How do you find out why, and what do you do?

**Mental model.** Two decisions, in this order: **stop the bleeding**, then diagnose. If users are being harmed, roll back or halt the rollout first — a diagnosis performed while customers error out is a diagnosis performed on a clock you chose to keep running. And the first diagnostic question is the cheapest one: **did the deploy cause this?** That is answerable in seconds if deploys are annotated on your dashboards, and it costs twenty minutes of an incident if they are not.

**Structured reasoning — the ordered method:**

_1. Classify by where it stopped,_ because each class has a different urgency and a different first command. The **pipeline** failed: nothing shipped, lowest urgency, it is a build problem. The **pods will not start**: nothing is serving the new version — `CrashLoopBackOff`, `ImagePullBackOff`, readiness never passing — and the cause is usually configuration, a missing secret, or a probe, not application logic. The **pods started but are unhealthy**: errors, latency, 503s; this is a user-facing incident. Or the deploy **"succeeded" and something else broke**: a downstream, a migration, a cache-key change (Q9). Misclassifying here is what sends teams reading application logs when the answer was an exit code.

_2. Stop the bleeding._ `rollout undo`, or redeploy the previous digest; pause the rollout if it is progressive, which is the case where the blast radius is already bounded and pausing costs nothing. If the change sits behind a feature flag, flip the flag — seconds instead of minutes. Announce the action before starting the diagnosis, so nobody else is diagnosing a moving system.

_3. Then diagnose, with the deploy as prime suspect._ `rollout status` and `describe` for events and the **exit code** — 137 is an OOM kill by the memory limit and not an application bug (Q28), 143 is a `SIGTERM`, and a non-zero application exit sends you to the _previous_ container's logs. Compare new pods against old ones rather than reading the new ones in isolation. Then diff what actually changed, and not only the code: the configuration, the ConfigMap or Secret, the base image, and the manifest. Those last four are what produce the "but we didn't change anything" class of incident.

_4. Use each signal type for what it is good for._ **Metrics** tell you _that_ something changed and roughly where — error rate and latency per endpoint and per dependency, saturation of pools and queues. **Traces** tell you _which hop_ is failing or slow across services (Q17). **Logs** tell you _why_, for one specific request, reached via a trace id rather than by grepping at volume. And during a progressive rollout there is a signal available at no other time: the new version's metrics against the stable version's, same traffic, same moment — which is the strongest single argument for canarying.

_5. Pattern-match the deploy-shaped causes._ A renamed or missing environment variable or secret — failing at startup if you are lucky, at first use if you are not. A migration that has not run, or that is not backward compatible while old pods are still live (Q12). Readiness passing before warm-up, so the first requests 503 (Q6). A serialization or cache-key change invalidating the entire cache and stampeding the database (Q9). Resource requests too low for the new version, so pods throttle or get evicted. A transitive dependency upgrade changing a default — connection pool sizes and client timeouts are the classic (Q4, Q10). And version skew: old and new pods disagreeing about a contract for the length of the rollout.

_6. Close the loop on detection, not just on the fix._ The output of the postmortem should be the alert or the pipeline gate that would have caught this one earlier. If the answer to "how did we find out?" is "a customer told us," that is the finding, and it outranks the bug itself.

_What must already exist for any of this to be fast._ Deploy markers on the dashboards; one dashboard per service showing its own RED metrics plus its dependencies'; structured logs carrying a trace id; a health endpoint that means something; alerts on SLO burn rate rather than on raw error counts; and a rollback path somebody has actually rehearsed. None of this can be added during an incident, which is why it belongs in the definition of done for a service, not in a backlog.

> **Trap.** "Check the logs." Not wrong, just not a method — and at production volume it is the slowest available entry point. Start from what changed and from the metrics; use logs to confirm a hypothesis about a specific request. The second trap is rolling _forward_ with a quick fix under pressure: you are now debugging in production with an untested change and no baseline to compare against. Roll back first, fix on a normal clock.

**Interviewer follow-ups:** _"You rolled back and it did not help. What does that tell you?"_ (Either the cause was never the new code — a downstream, a data change, a traffic shift — or the deploy left irreversible state behind: a migration, a consumed message, a poisoned cache. Both are strong, specific hypotheses.) _"How would you have caught this before production?"_ (Name the specific missing gate: a smoke test against staging, a canary with automated metric analysis, a contract test, a load test with the dependency slowed rather than stopped. A vague "more testing" answers nothing.) _"The deploy looks fine and the error rate is normal, but a customer insists it is broken."_ (Your aggregates are hiding a segment: break the metrics down by tenant, endpoint, region, and client version — a p99 across all traffic can look untouched while one cohort fails completely.)

**What the interviewer is really testing.** Whether you have a **method** — mitigate first, classify, correlate with the change, then confirm with the narrowest signal — and whether you know the deploy-specific failure vocabulary (exit 137, endpoint-removal races, version skew, non-reversible migrations). And whether you treat detection as part of the fix, which is the difference between someone who resolves incidents and someone who reduces them.

---

## Appendix — Cross-Cutting Mental Models to Internalize

These recur across the whole set; if you internalize the models, you can _derive_ most answers under pressure instead of recalling them.

**1. Proxy-based advice (Q1, Q20).** `@Transactional`, `@Async`, `@Cacheable`, `@Retryable` — all Spring AOP proxies. They only work across the proxy boundary. Self-invocation (`this.method()`), non-public methods, and `final` methods silently defeat them. Whenever an annotation "does nothing," suspect the proxy boundary first.

**2. Little's Law and resource pools (Q3, Q4, Q10, Q20).** Concurrency = arrival rate × hold time. Any fixed pool (threads, connections, buffers) exhausts when concurrency exceeds pool size, and the killer is usually _inflated hold time_ (I/O inside the resource scope), not raw throughput. "It's saturated but the obvious resource is idle" → look for what's holding the resource _without using it._

**3. At-least-once + idempotency (Q2, Q5, Q7, Q23, Q25, Q26).** The network guarantees at-least-once, never exactly-once. Correctness comes from making effects idempotent (unique constraints, upserts, dedup keys, outbox/inbox), not from trying to make delivery perfect. Every retry/replay/duplicate-execution question reduces to this.

**4. The dashboard lies about the region under pressure (Q4 CPU, Q11 GC, Q13/Q15 heap).** The obvious metric being "normal" is often the _tell_ that the problem is in a different resource: DB CPU normal → connection hold time; heap normal → native/threads/direct/metaspace/container-limit; CPU normal → STW pauses. Always ask _which specific resource_, and read the _exact_ error string.

**5. Expand/contract for change under load (Q12, Q28, Q30).** You never apply a breaking change; you decompose it into individually-compatible steps with an overlap window where old and new coexist. Same pattern applies to schema, API versioning, and cache-key changes.

**6. Contain the blast radius (Q6, Q10, Q19, Q23, Q24).** Timeouts, circuit breakers, bulkheads, rate limits, graceful degradation, load shedding — all exist to stop _local_ failure from becoming _global_ failure (cascading failure). Any "one thing is slow/broken, protect the rest" question is a bulkhead/circuit-breaker question.

**7. Systematic > guessing (Q3, Q9, Q13, Q14, Q17, Q31).** State a _method_: USE (Utilization/Saturation/Errors) for saturation, RED (Rate/Errors/Duration) for services, hypothesis→instrument-the-boundary→confirm for silent failures, post-GC-trend for leaks. Interviewers reward the method as much as the answer — it shows you'll solve the _next_ problem too, not just this one.

**8. One artifact, promoted (Q27, Q29, Q30).** Build the deployable exactly once, tag it by commit, and promote the same digest through every environment with configuration supplied from outside. Anything rebuilt per environment invalidates every test that ran before it, and anything tagged `latest` makes both "what is running?" and "roll back to what?" unanswerable. Whenever a delivery question feels like a tooling question, ask instead: _what is the artifact, and is this still the same one we tested?_

---

## How to drill this for interview readiness

Don't re-read this passively. For each question, cover the answer and force yourself to produce, out loud and in under 90 seconds: **(1) the one-sentence mental model**, **(2) the single most likely root cause**, **(3) the trap you'd avoid**, and **(4) the first thing you'd check in production.** If you can generate those four cold for all thirty-one, you can reason from first principles under pressure — which is the actual bar, not reciting these paragraphs. Then have someone throw the follow-ups at you, because that's where the interview is really decided.
