# Backend Interview Study Guide
### Infrastructure, storage, and high-throughput systems companies

Built from the Backblaze drill deck, expanded to work for any company where the core engineering problem is *moving and keeping data reliably at scale* — storage and backup vendors, CDNs, payment processors, observability platforms, database companies, and infrastructure teams inside larger organizations.

---

## How to use this

The material is organized into **two study sessions of roughly three hours each**, plus a short pre-interview review. That split is deliberate: Session 1 is the material you are most likely to be *tested* on directly, and Session 2 is the material that shapes whether you sound senior. If you only have time for one, do Session 1.

**Session 1 — the tested core.** Sections 1 through 4. Concurrency, JVM behavior under load, the storage and durability domain, and databases at scale. This is where wrong answers end interviews.

**Session 2 — the differentiators.** Sections 5 through 9. Networking, observability, system design, AI-assisted development, and behavioral. This is where correct-but-generic answers get beaten by specific ones.

**Pre-interview review.** Section 10, plus rereading only the questions you marked shaky.

A method note that matters more than the content. Do not read the answers. Read the question, say your answer **out loud, in English, as if someone were listening**, and only then read what's written. Reading feels like studying and produces almost none of the benefit, because the thing that fails in interviews is retrieval and articulation, not recognition. If you are preparing for interviews in a second language, this is not optional advice.

Each question below has the same shape: the **core answer**, the **follow-ups** an interviewer will actually push with, and where useful, the **failure mode** — the specific way candidates lose the point.

---

# SESSION 1 — THE TESTED CORE

---

## 1. Concurrency and the Java Memory Model

This is the highest-density section in the guide, because at companies whose scaling constraint is throughput-per-process rather than instance count, it is the technical filter. A candidate who is fluent here and mediocre elsewhere usually passes; the reverse usually does not.

The organizing idea worth carrying into every answer: concurrency bugs are not usually about two threads running at once. They are about **visibility** (a thread reads a stale value), **atomicity** (an operation you thought was one step is three), and **ordering** (the compiler or CPU reordered your instructions legally). Almost every question below is one of those three wearing a costume.

### 1.1 How do you size a thread pool for CPU-bound versus I/O-bound work?

CPU-bound work wants roughly one thread per core. Past that, you add context-switching overhead and cache pressure without adding throughput. I/O-bound work can use many more threads because each spends most of its life blocked; the textbook starting point is `cores × (1 + wait_time / service_time)`.

The answer should end with *measure it*, and with a hard rule: never use an unbounded pool, because that converts a slow downstream dependency into an out-of-memory error.

**Follow-ups.** What happens if you mix both kinds of work in one pool? (The blocking work starves the CPU work; separate the pools.) How would you actually determine the ratio in production? (Instrument time-in-queue versus time-executing, or profile.) What's the risk of one thread pool per subsystem? (Total thread count grows silently; you can exhaust memory through stack allocation alone.)

**Failure mode.** Reciting the formula without being able to say why it exists. Interviewers ask the "why" immediately.

### 1.2 What does `synchronized` guarantee beyond mutual exclusion?

Visibility. Releasing a monitor establishes a *happens-before* relationship, so every write the releasing thread made is visible to the next thread that acquires the same monitor. Without that edge, a thread can have perfectly correct exclusive access and still read a stale value cached in its core.

**Follow-ups.** What other constructs create happens-before edges? (`volatile` write then read, `Thread.start()` and `join()`, and the internals of concurrent collections and `CountDownLatch`.) Can you have a race condition with no data race? (Yes — a check-then-act sequence where each individual operation is properly synchronized but the pair isn't atomic.) What's the cost of an uncontended lock on a modern JVM? (Very low; biased locking is gone in recent versions but uncontended paths are still cheap. Don't prematurely avoid locks.)

**Failure mode.** Thinking of locks purely as turnstiles. If you never mention visibility, the interviewer learns you haven't read about the memory model.

### 1.3 Why isn't `volatile` enough for a counter?

`volatile` gives visibility and prevents reordering, but not atomicity. `i++` is read-modify-write — three operations — and two threads can interleave inside it, silently losing increments.

Use `AtomicInteger` for correctness, or `LongAdder` when many threads contend on the same counter, since it spreads writes across internal cells and only sums on read.

**Follow-ups.** When is `volatile` genuinely the right tool? (A flag written by one thread and read by many — a shutdown signal, a config version. One writer, no compound operations.) What is `compareAndSet` doing at the hardware level? (A single atomic CPU instruction; the loop around it is the retry.) When does CAS perform *worse* than a lock? (Under heavy contention, where threads burn CPU spinning and retrying rather than parking.)

### 1.4 What actually goes wrong if two threads write to a plain `HashMap`?

Lost entries and structurally corrupted state. In Java 7 a concurrent resize could produce a circular linked list in a bucket, pinning a CPU at 100% forever. Java 8 changed resize so that specific hang no longer occurs, but you can still lose writes and observe a broken map.

`ConcurrentHashMap` avoids this by using CAS to install the first node in an empty bin and locking only the individual bin under contention, so readers never block.

**Follow-ups.** Is `Collections.synchronizedMap` equivalent? (No — it serializes every operation on one lock, and compound operations like check-then-put still need external synchronization.) Are `ConcurrentHashMap`'s bulk operations like `size()` exact? (They're weakly consistent; `size()` is an estimate under concurrent modification.) What's `computeIfAbsent` doing about atomicity? (It holds the bin lock across the computation — which is why a mapping function that itself touches the same map can deadlock.)

### 1.5 What is a deadlock, and how do you prevent and diagnose one?

Four conditions must hold simultaneously: mutual exclusion, hold-and-wait, no preemption, and circular wait. Break any one. In practice you break circular wait with a **global lock ordering**, or hold-and-wait with `tryLock` plus a timeout.

Diagnosis is a thread dump — `jstack`, JFR, or a JMX-triggered dump — and the JVM prints "Found one Java-level deadlock" naming the threads and monitors.

**Follow-ups.** What's a livelock, and how does it differ? (Threads are actively running and responding to each other but making no progress — two people stepping aside in a corridor. Randomized backoff is the usual fix.) What's lock convoying? (Threads queue behind a lock and stay in lockstep afterwards, destroying throughput even though nothing deadlocks.) How do you get a deadlock with a *database*? (Two transactions locking rows in opposite order; the database detects it and kills one, which your application must be prepared to retry.)

### 1.6 An `ExecutorService` queue fills up. What happens next?

The `RejectedExecutionHandler` decides. `AbortPolicy` is the default and throws `RejectedExecutionException`. `CallerRunsPolicy` makes the submitting thread run the task itself, which naturally throttles the producer — a poor man's backpressure. `DiscardPolicy` and `DiscardOldestPolicy` drop work silently, which is almost never acceptable unless the data is genuinely disposable, like a sampled metric.

**Follow-ups.** With a bounded queue and a `corePoolSize` below `maximumPoolSize`, when does the pool actually create extra threads? (Only when the queue is *full* — a genuinely surprising behavior that catches most candidates. Tasks queue before they spawn threads.) So what happens with an unbounded queue? (`maximumPoolSize` is never reached; the pool never grows past core size, and the queue grows until you run out of memory.) How would you monitor a pool in production? (Queue depth, active count, completed task count, and rejection count — rejections especially, since they're often silently swallowed.)

**Failure mode.** This is one of the most commonly misunderstood behaviors in `ThreadPoolExecutor`. Knowing the queue-fills-before-threads-spawn rule is a strong signal.

### 1.7 Explain backpressure, and why an upload pipeline needs it.

Backpressure is the mechanism by which a slow consumer forces a fast producer to slow down. Without it, a thread reading from disk at 500 MB/s feeding an uploader that pushes 20 Mbit/s grows an unbounded queue until the process dies.

Every implementation is a form of "block the producer": a bounded `BlockingQueue` whose `put` blocks, a semaphore limiting in-flight work, `CallerRunsPolicy`, or TCP's own window at the socket level.

**Follow-ups.** What's the difference between backpressure and rate limiting? (Backpressure is a *feedback* signal from the consumer; rate limiting is a fixed ceiling imposed regardless of downstream state.) How does backpressure work across a network boundary, where you can't block the producer? (You can't — so you use explicit credit or windowing schemes, bounded in-flight request limits, or you shed load and return 429.) What breaks when you add a queue between two services specifically to absorb load? (You've moved the problem: now the queue grows, and you need alerting on depth and age, plus a plan for what to do when it's hours behind.)

**Why this one matters.** It's the concept that connects message-queue experience to throughput engineering. If you only nail one systems answer, make it this.

### 1.8 What's the risk of using `CompletableFuture` with the default executor?

The default is `ForkJoinPool.commonPool()`, shared process-wide and sized to about one less than your core count. Running blocking I/O on it starves every other user of that pool, including parallel streams elsewhere in the application.

Always pass your own executor for anything that blocks. It also makes the pool tunable and observable.

**Follow-ups.** What's the difference between `thenApply` and `thenApplyAsync`? (`thenApply` may run on the completing thread or the calling thread; `thenApplyAsync` submits to an executor. The former can accidentally run your callback on an I/O thread you didn't intend to occupy.) How do exceptions propagate? (They're captured and rethrown wrapped in `CompletionException` at the join point — so a swallowed exception in a chain nobody joins disappears entirely.) How do you time out a `CompletableFuture`? (`orTimeout` in Java 9+, or composing with a scheduled future in older versions.)

### 1.9 What are virtual threads, and when do they actually help?

Lightweight threads scheduled by the JVM onto a small pool of carrier threads, finalized in Java 21. They make blocking cheap, so a thread-per-request model scales to hundreds of thousands of concurrent blocked operations.

They help **I/O-bound concurrency**. They do nothing for CPU-bound work — you still have only the cores you have. Early versions also pinned the carrier thread inside `synchronized` blocks, which is why migrating hot paths to `ReentrantLock` was part of the standard advice.

**Follow-ups.** Does this make reactive programming obsolete? (Not entirely, but it removes much of the motivation — you get scalability without inverting your control flow, though reactive still gives you composable backpressure and streaming semantics.) What happens to thread pools? (They stop making sense as a *concurrency limiter* for virtual threads; you use semaphores for limiting instead, since the threads themselves are no longer the scarce resource.) What still breaks? (Thread-locals used as a caching mechanism become expensive at that scale; native calls and pinning remain edge cases.)

**Why this matters.** Any company modernizing an older Java codebase is discussing this. Knowing the pinning caveat signals you've read past the announcement.

### 1.10 `ReentrantLock` or `synchronized` — when would you use the explicit lock?

When you need something `synchronized` can't express: a timeout via `tryLock`, an interruptible acquisition, fairness, multiple independent `Condition` queues, or acquiring and releasing in different scopes.

Otherwise prefer `synchronized`. It's harder to leak, since the JVM releases it on exception, and modern JVMs optimize it well.

**Follow-ups.** What does a *fair* lock cost? (Significant throughput — fairness means handing off to the longest waiter, defeating the cache locality of letting a running thread reacquire.) When is `ReadWriteLock` worth it? (Read-heavy workloads with genuinely long critical sections; for short ones the added complexity often loses to a plain lock. `StampedLock`'s optimistic read is the higher-performance option, at the cost of a much sharper API.)

### 1.11 A service is fine at p50 but terrible at p99, in production only. How do you find out why?

Start from the shape rather than the code. Check whether spikes correlate with **GC pauses** (GC logs), **pool saturation** (queue depth, active threads), or a **downstream dependency's** own tail. Then take several thread dumps seconds apart during a spike and look for threads parked on the same monitor — that's contention. A profiler like async-profiler or JFR gives you the flame graph if it's genuinely CPU.

**Follow-ups.** Why would p99 be bad while p50 is fine — what causes tail-specific latency? (Queueing effects, GC, cache misses on cold data, retries, a single slow shard or replica, connection pool exhaustion under bursts.) What is tail amplification in a fan-out system? (If one request fans out to 10 backends and each has a 1% slow tail, roughly 10% of requests hit at least one slow backend — the tail becomes the common case.) How do you mitigate it? (Hedged requests, backup requests after a delay, and reducing fan-out.)

### 1.12 What is false sharing?

Two logically independent variables land on the same 64-byte cache line. Two cores writing to them invalidate each other's cached line constantly, even though the code never shares data. Throughput collapses for no visible reason.

Fixes are padding the fields apart or `@Contended`. It matters for hot per-thread counters in tight loops.

**Follow-ups.** How would you even detect this? (Perf counters showing cache-line bouncing; or empirically, throughput that gets *worse* as you add threads.) Where does the JDK deal with this internally? (`LongAdder`'s cells are padded for exactly this reason.)

### 1.13 Why does immutability simplify concurrent code?

Immutable objects need no synchronization to share, because there is no write to make visible and no operation to interleave. The only requirement is **safe publication** — handing the reference over correctly, which `final` fields guarantee at construction.

**Follow-ups.** What is unsafe publication, concretely? (Assigning a reference to a non-final, non-volatile field; another thread can see the reference before it sees the object's initialized fields — the classic broken double-checked locking bug.) How do you make a defensively-copied collection actually immutable? (`List.copyOf`, or copy then wrap — remembering that immutability is shallow unless the elements are immutable too.)

### 1.14 Design a bounded pipeline: one thread reads chunks from disk, N threads upload them.

A **bounded `BlockingQueue`** between them, sized so that capacity × chunk size stays comfortably under heap. The reader blocks on `put` when uploaders fall behind — backpressure for free. Uploaders are a fixed pool with retries using exponential backoff and jitter, and each chunk's success is recorded durably so a crash resumes rather than restarts. Shut down with a poison pill or by closing the queue and awaiting termination.

**Follow-ups.** How do you handle a permanently failing chunk without stalling the pipeline? (Bounded retries, then route to a dead-letter path and continue; the file is marked incomplete rather than the whole process hanging.) How do you make progress visible? (A separate counter of chunks completed versus total, updated atomically — and note that reading it doesn't require stopping the pipeline.) What if chunks must be applied in order at the destination? (Then either you serialize the final commit, or you upload out of order but only finalize the manifest once all are present — which is usually the better design.)

**Why this matters.** It's close to the actual product at a storage or backup company. Being able to sketch it live beats any definition.

### 1.15 How do you make a Spring `@Service` safe when it's a singleton?

Keep it **stateless**. A singleton bean is shared by every request thread, so any mutable instance field is shared mutable state. Request-scoped data belongs in method parameters and local variables. If you genuinely need shared state, it must be a thread-safe structure or explicitly guarded — and that's usually a signal the state belongs in a cache or the database.

**Follow-ups.** What about `@Scope("request")` or `@Scope("prototype")`? (They exist, but injecting a shorter-lived scope into a singleton requires a proxy, and reaching for them is often a design smell.) Where does thread-safety bite people in Spring specifically? (Non-thread-safe utilities held as fields — the classic being `SimpleDateFormat`, which is why `DateTimeFormatter` exists.)

### 1.16 What's the difference between concurrency and parallelism?

Concurrency is *structuring* a program as independently progressing tasks; parallelism is *executing* them simultaneously on multiple cores. A single-core machine can be concurrent but not parallel. It matters because the two have different goals: concurrency is often about responsiveness and resource utilization under blocking, parallelism is about raw throughput on CPU work.

**Follow-ups.** Which one does Amdahl's Law constrain? (Parallelism — the serial fraction caps your speedup regardless of core count, which is why a 5% serial section limits you to 20× no matter the hardware.)

---

## 2. JVM behavior and production troubleshooting

Adjacent to concurrency and frequently asked alongside it, especially at companies running long-lived JVM services under sustained load.

### 2.1 Walk me through how you'd diagnose a memory leak in production.

Confirm it's actually a leak: heap usage climbing across GC cycles rather than sawtoothing normally. Capture a heap dump (`jmap`, or better, `-XX:+HeapDumpOnOutOfMemoryError` configured in advance), and analyze the dominator tree in a tool like Eclipse MAT to find what's retaining the most memory and *what path* is keeping it reachable.

Common culprits: unbounded caches, listeners never unregistered, thread-locals on pooled threads that outlive the request, and `ClassLoader` leaks in redeployed applications.

**Follow-ups.** Why is the dominator tree more useful than a histogram? (A histogram tells you there are ten million `String` objects; the dominator tree tells you which object graph is keeping them alive.) What's the risk of taking a heap dump on a live production node? (It pauses the JVM and writes a file the size of the heap — take the node out of rotation first.) What can leak without ever showing on the Java heap? (Direct byte buffers, native memory from JNI, memory-mapped files, and thread stacks — which is why `-XX:MaxDirectMemorySize` and native memory tracking exist.)

### 2.2 What actually happens during a GC pause, and which collector would you choose?

A stop-the-world pause suspends all application threads at a safepoint so the collector can move objects or update references. Modern collectors minimize but don't eliminate this.

G1 is the sensible default: region-based, targets a pause goal, good for heaps from a few GB up. ZGC and Shenandoah do most work concurrently and hold pauses to single-digit milliseconds even on very large heaps, at some throughput cost. Parallel GC maximizes raw throughput if you don't care about pause length — batch processing, for instance.

**Follow-ups.** Why does allocation rate matter more than heap size for GC pressure? (Most objects die young; a high allocation rate means frequent young collections. Reducing garbage is usually more effective than growing the heap.) What's a safepoint, and when do pauses get *worse* than the collector's target? (Time-to-safepoint — a thread in a long counted loop or a big array copy may not reach a safepoint promptly, and everyone waits for it.) What does "GC thrashing before OOM" look like? (Rising GC CPU with falling reclaimed memory — `GC overhead limit exceeded`.)

### 2.3 A service works fine, then degrades after several hours of load. Where do you start?

The pattern points at something that accumulates: memory, connections, file descriptors, thread count, or a cache that never evicts. Check heap trend across GC cycles, connection pool metrics, open file descriptors, and thread count over time.

Also consider things that get *slower* rather than exhausted — a database table growing past the point where a query's plan is efficient, or a queue whose consumers were always slightly slower than producers.

**Follow-ups.** How would you distinguish a leak from a load increase? (Correlate against traffic; a leak degrades on absolute time or cumulative requests rather than concurrent load.) What if restarting fixes it temporarily? (That's evidence for accumulation, and it's a diagnosis, not a fix — though it's a legitimate mitigation while you find the cause.)

---

## 3. Storage, durability, and the backup domain

This section transfers well beyond backup vendors: the same reasoning applies to any system that must not lose data — object storage, databases, message brokers, and financial ledgers.

### 3.1 How do you upload a very large file over a connection that drops every few minutes?

Split it into chunks of a few megabytes, treating each as an independently retryable unit with its own checksum. Record locally which chunks the server has acknowledged so a resume skips them rather than restarting. Upload several in parallel to use available bandwidth, retry with exponential backoff and jitter, and finalize only once every chunk is confirmed. That local state requirement is why a client-side embedded database exists.

**Follow-ups.** How do you choose chunk size? (A trade-off: smaller chunks mean cheaper retries and better parallelism but more metadata and more round trips. Bigger chunks amortize overhead but waste more work on failure.) What happens if the client crashes between uploading a chunk and recording it locally? (You re-upload; the server must be idempotent on chunk id or content hash — the local record is an optimization, not the source of truth.) How does the server know the assembled file is correct? (A manifest of chunk hashes plus a whole-file hash verified at finalize.)

### 3.2 How does deduplication work, and what does it cost?

Hash each chunk and use the hash as its identity. If the hash already exists, record a reference rather than uploading bytes. The savings are enormous when many machines back up the same operating system files.

The costs are a metadata index that becomes the real scaling problem, **reference counting** so deleting one user's file doesn't destroy another's, and the fact that per-user client-side encryption breaks cross-user dedup entirely.

**Follow-ups.** What's the difference between fixed-size and content-defined chunking? (Fixed-size boundaries shift when you insert a byte near the start of a file, so every subsequent chunk changes and dedup fails. Content-defined chunking — a rolling hash choosing boundaries — is resilient to insertion.) What is a hash collision worth here? (With SHA-256 it's negligible in practice, but note that the failure mode is *silent data corruption*, which is why some systems verify bytes on collision.) How do you delete safely with references? (Reference counts or mark-and-sweep garbage collection over the chunk store — and both are hard to get right concurrently with writes.)

### 3.3 A drive silently corrupts a few bytes. How does the system find out?

Store a checksum with the data and verify it on every read, so corruption surfaces as a detectable mismatch rather than bad data returned to the customer. Then run **background scrubbing** — periodically read everything, verify, and repair from redundancy — because data nobody reads for three years still rots.

Without redundancy you get detection only. Detection plus redundancy gives you repair.

**Follow-ups.** Where else can corruption enter besides the platter? (Controller firmware, cables, memory without ECC, and the network — which is why end-to-end checksums beat per-layer ones.) What's the argument for checksumming at the application layer when the filesystem already does it? (The filesystem protects its own domain; only an end-to-end checksum computed at the client and verified at read covers the whole path.)

### 3.4 Erasure coding versus replication — what's the trade?

Replication stores N full copies: simple, fast to read, and 3× storage for two-failure tolerance. Erasure coding splits data into k fragments plus m parity fragments; you can lose any m and reconstruct, at roughly (k+m)/k overhead — far cheaper. The cost is CPU for encoding and reconstruction, and higher latency when reconstructing rather than reading intact.

**Follow-ups.** Why do systems often use replication for hot data and erasure coding for cold? (Read latency and reconstruction cost; hot data can't afford the rebuild path.) What's a *rebuild storm*? (When a drive fails, reconstructing its contents requires reading from many surviving drives at once — the recovery itself is a load spike, and a second failure during a long rebuild is the real risk.) How does placement matter? (Fragments must be spread across failure domains — different drives, different machines, different racks, or the math is meaningless.)

### 3.5 How do you know a backup is actually restorable?

You don't, until you restore it. So the system tests itself: periodic automated restores of sampled data, verification of chunk manifests against what storage actually holds, and integrity checks that run without waiting for a customer request. The failure this prevents is the worst one in the business — a backup that reported success nightly for two years and can't be read on the day it's needed.

**Follow-ups.** What's the equivalent question in a database company? (Do you test restores from your backups, and do you measure the *time* to restore? An untested backup and a 40-hour restore are both outages.) How does this relate to RPO and RTO? (RPO is how much data you can afford to lose — driven by backup frequency. RTO is how long recovery may take — driven by restore throughput. Customers usually only discover they cared about RTO during an incident.)

### 3.6 Why would a desktop client use SQLite?

It needs durable local state — which files exist, their hashes, which chunks are uploaded — surviving reboots and crashes, with transactions, and with no server process on the customer's machine. That is precisely SQLite's shape.

Watch for a single writer at a time (WAL mode improves concurrent reads, not concurrent writes), corruption risk on unclean shutdown, and the database growing large enough on big machines that schema and index choices start to matter.

**Follow-ups.** What does WAL mode actually change? (Writers append to a log rather than modifying the main file, so readers see a consistent snapshot without blocking — at the cost of a checkpoint step and a second file.) When would you outgrow SQLite? (Concurrent writers, or a working set that stops fitting the access patterns a single file can serve well.)

### 3.7 How does a client detect which files changed without rehashing everything?

Cheap heuristics first — modification time plus size compared against local state — with full hashing only for files that look changed. Filesystem notification APIs catch changes live but differ per platform and can drop events, so a periodic full scan remains the safety net.

The subtlety is that mtime lies: it can be set backwards, resolution differs between filesystems, and some applications preserve it deliberately.

**Follow-ups.** What's the cost of the safety-net scan on a machine with millions of files? (Significant I/O; it needs to be throttled and interruptible, and ideally incremental.) How do you handle a file being modified *during* upload? (Detect it — recheck size and mtime, or hold a snapshot via the OS if available — and either restart that file or mark the version as of a consistent point.)

### 3.8 What breaks a naive cross-platform client across ext4, NTFS, and HFS+/APFS?

Case sensitivity differs, so two distinct filenames on Linux collide on macOS. Windows has path length limits and reserved names. Permission models don't map — POSIX modes versus NTFS ACLs. Extended attributes and resource forks vanish in a naive copy. Timestamp resolution varies, breaking mtime-based change detection. Hard links and symlinks have different semantics, and following them blindly duplicates data or loops.

**Follow-ups.** How would you represent permissions portably? (Store the native metadata opaquely alongside a normalized form, so a same-platform restore is faithful and a cross-platform restore is at least sane.) What about files locked by another process on Windows? (Volume shadow copy or equivalent snapshot mechanisms — otherwise open files are simply unreadable.)

### 3.9 How do you avoid saturating a customer's connection?

Rate limit deliberately with a token bucket giving a configurable ceiling, and preferably adapt: back off when latency to the server rises, since that indicates you're filling the uplink queue and degrading everything else the customer does. Also respect the customer's explicit control. A backup that makes video calls unusable gets uninstalled — a product failure expressed as an engineering choice.

**Follow-ups.** Why does latency rise before throughput drops? (Bufferbloat — the queue fills before packets are dropped, so latency is the earlier signal.) How is this the same problem as a noisy-neighbor in a multi-tenant service? (Both are fairness under shared constrained resource; both are solved by per-tenant limits plus adaptive shedding.)

### 3.10 At exabyte scale, what's harder — storing the bytes or tracking them?

Tracking them. Bytes scale by adding drives, which is a supply-chain problem. The **metadata** — which chunk belongs to which file for which customer, where each replica lives, what's been deleted — is a database problem that grows with *file count* rather than data volume, and file count grows faster.

That's the pressure producing sharded databases, and it's why sharding technologies show up in storage companies' job descriptions.

**Follow-ups.** What breaks first in the metadata layer? (Usually write throughput on a hot shard, or an index that no longer fits in memory.) How would you shard file metadata? (By account or bucket, keeping one customer's data co-located so listing and deletion stay single-shard — the classic mistake is sharding by file id, which makes every listing a scatter-gather.)

### 3.11 Where does idempotency show up in a storage pipeline?

Everywhere retries exist. A chunk upload that times out may have actually succeeded, so the retry must not create a duplicate — key the operation on content hash or a client-generated id, and make the handler a no-op if it already holds it. This is identical reasoning to a payment that must not double-charge.

**Follow-ups.** What's the difference between idempotency and exactly-once delivery? (Exactly-once delivery is generally not achievable across a network; what you build is at-least-once delivery plus idempotent processing, which is *effectively* once. Saying this precisely is a strong signal.) Where do you store the idempotency key, and for how long? (Durably, with a retention window long enough to outlive any plausible retry — and the expiry policy is a real design decision, not a detail.) What makes an operation hard to make idempotent? (Anything with a side effect outside your transaction boundary — sending an email, calling a third party.)

---

## 4. Databases at scale

### 4.1 What problem does horizontal sharding solve that a bigger machine doesn't?

A dataset outgrowing one machine — in storage, in write throughput, or in connection count. Sharding splits data across independent database servers and, with a layer like Vitess in the MySQL world, presents something close to a single database to the application. It also manages connection pooling at a scale where thousands of application connections would otherwise crush the server.

The cost lands on the application: you must choose a **shard key** that keeps related rows together, because cross-shard queries fan out and cross-shard transactions are expensive or unavailable.

**Follow-ups.** How do you choose a shard key? (High cardinality, even distribution, and alignment with your dominant access pattern. Tenant id is usually right for multi-tenant systems.) What's a hot shard and how do you fix one? (One key receiving disproportionate traffic — a huge customer. Fixes are splitting that tenant across a sub-key, or moving them to dedicated infrastructure.) How do you reshard without downtime? (Dual-write or replicate to the new topology, backfill, verify, then cut reads over — the hard part is the verification, not the copying.)

### 4.2 You have an index on `(a, b, c)`. Which queries can use it?

Those filtering on a leftmost prefix: `a`, `a` and `b`, or all three. Filtering only on `b` and `c` cannot use it, because the B-tree is ordered by the first column first. A **covering index** — one containing every column the query needs — avoids touching the table at all, often a bigger win than the seek.

**Follow-ups.** Can it help an `ORDER BY`? (Yes, if the sort matches the index order and prefix — avoiding a filesort is frequently the real speedup.) What's the cost of adding indexes? (Every write maintains them; on write-heavy tables, index count is a throughput ceiling.) When is a full table scan actually the right plan? (When you're reading a large fraction of the table — the optimizer choosing a scan over an index isn't necessarily a bug.)

### 4.3 Name the isolation levels and what each prevents.

Read uncommitted allows dirty reads. Read committed prevents dirty reads but allows non-repeatable reads. Repeatable read prevents those but classically allows phantoms. Serializable prevents all three.

Worth knowing that **MySQL/InnoDB defaults to repeatable read** while PostgreSQL defaults to read committed — a real source of behavior differences when moving logic between them.

**Follow-ups.** What's write skew, and which level does it need? (Two transactions each read an overlapping set, each makes a decision valid alone, and together they violate an invariant — snapshot isolation permits it; you need serializable or explicit locking.) What does MVCC do? (Readers see a snapshot rather than blocking on writers, which is why read-heavy workloads scale well — at the cost of version storage and vacuum/purge work.)

### 4.4 Optimistic or pessimistic locking — how do you choose?

Optimistic, with a version column, when conflicts are rare: read, modify, update conditional on the version being unchanged, retry on failure. It scales because it holds no locks. Pessimistic, with `SELECT ... FOR UPDATE`, when conflicts are common or a retry is unacceptable — you pay in held locks and reduced concurrency for guaranteed first-attempt progress.

**Follow-ups.** What's the failure mode of optimistic locking under high contention? (Retry storms — throughput collapses as everyone retries and fails. At that point pessimistic is genuinely faster.) How does this interact with long-running user transactions? (Never hold a database transaction across a user's think-time; optimistic locking with a version field is precisely the tool for that case.)

### 4.5 A query got slow in production but not in staging. Where do you look?

`EXPLAIN` first, against production-like data. Usually data volume changed the plan: an index fine at 10k rows is a scan at 10M, or statistics shifted and the optimizer switched plans. Also check whether it's actually the query — N+1 from the ORM, lock waits, or connection pool exhaustion all present as "the query is slow" from the application's side.

**Follow-ups.** How do you catch an N+1 before production? (Assert query counts in integration tests; log queries per request in development.) What's parameter sniffing? (The plan cached for one parameter value being terrible for another — a skewed column is the classic cause.)

### 4.6 When would you *not* use a relational database?

When the access pattern genuinely doesn't fit: append-only high-volume time series, a pure key-value hot path where you need predictable single-digit-millisecond reads at massive scale, or a document model where the join you'd need never happens.

The honest framing is that relational is the correct default and the burden of proof is on the alternative, because you give up joins, transactions, and ad-hoc querying — and teams routinely underestimate how much they'll want all three.

**Follow-ups.** Where does a cache fit versus a different database? (A cache is usually the right first answer to a read-throughput problem, and much cheaper than migrating. The question to answer is invalidation.) What's the cost of adding a second datastore? (Consistency between them becomes your problem, plus a second thing to operate, monitor, back up, and be paged for.)

---

# SESSION 2 — THE DIFFERENTIATORS

---

## 5. Networking and protocols

Often skipped by backend candidates and frequently asked at companies whose product *is* moving bytes.

### 5.1 What actually happens when a TCP connection "drops"?

Frequently nothing visible for a long time. If the peer disappears without a FIN or RST, your socket may block until the OS TCP timeout, which can be minutes. This is why application-level timeouts and keepalives exist — you cannot rely on TCP to tell you promptly.

**Follow-ups.** What's the difference between a connect timeout, a read timeout, and a total request timeout? (All three are needed; having only a read timeout means a hung connect stalls indefinitely.) Why does connection pooling need health checks? (A pooled connection can be dead in a way that only surfaces on use — hence validate-on-borrow or idle eviction.)

### 5.2 Why does HTTP/2 multiplexing matter, and where does it not help?

It removes head-of-line blocking at the HTTP layer, so many requests share one connection without queueing behind each other. It doesn't remove head-of-line blocking at the *TCP* layer — one lost packet stalls every stream on that connection, which is exactly the problem QUIC and HTTP/3 solve by moving to UDP with per-stream ordering.

**Follow-ups.** When would you deliberately use many connections instead? (Bulk parallel transfer across a high-bandwidth-delay-product link, where per-connection congestion windows are the limit.)

### 5.3 How do you make retries safe?

Only retry idempotent operations, or make the operation idempotent with a key. Use exponential backoff with **jitter** — without jitter, all clients retry in synchronized waves and you build your own DDoS. Bound total attempts and total time. And add a circuit breaker, because retrying into a dead dependency multiplies the load on the thing already failing.

**Follow-ups.** What's a retry storm, and how does it amplify? (Each layer retrying three times across four layers is 81 requests for one user action — retries must not be nested blindly.) When should the client *not* retry at all? (On 4xx; on anything where you can't distinguish "not processed" from "processed but the response was lost" without an idempotency key.)

### 5.4 How does TLS termination affect your architecture?

Terminating at the edge simplifies certificate management and lets the load balancer inspect and route, but it means traffic inside your network is plaintext unless you re-encrypt. For a storage product, end-to-end encryption is often a product requirement rather than an infrastructure choice, and that changes what the server can do — you can't deduplicate or compress data you can't read.

**Follow-ups.** What's the difference between encryption in transit, at rest, and end-to-end? (Who holds the key is the real distinction. End-to-end means the provider cannot read the data even if compelled — which is a feature to some customers and a support nightmare when they lose the key.)

---

## 6. Observability and production operations

### 6.1 What's the difference between push and pull metric collection?

Prometheus **pulls**: it scrapes an HTTP endpoint your service exposes on an interval it controls. Push systems like CloudWatch or StatsD have the service send metrics. Pull means service discovery matters, short-lived jobs need a pushgateway, and an unreachable service is itself a signal. Push handles ephemeral workloads more naturally but makes the collector a bottleneck under load.

**Follow-ups.** How do you instrument a Spring Boot app for Prometheus? (Micrometer plus the Actuator endpoint — a small amount of configuration, worth doing once so you can say you have.) What happens to metrics during a scrape gap? (You lose resolution; counters are resilient because they're cumulative, gauges are not.)

### 6.2 What are the metric types, and why does a histogram beat an average?

Counters only increase (requests served). Gauges move both ways (queue depth). Histograms bucket observations so you can compute quantiles.

Averages hide the tail: if 99% of requests take 10ms and 1% take 8 seconds, the mean looks fine while 1% of customers have a terrible experience. **p95 and p99 describe experience; the mean describes nothing anyone feels.**

**Follow-ups.** Can you average percentiles across instances? (No — this is a common and serious mistake. You need to aggregate the histogram buckets and compute the quantile from the merged data.) What's a summary versus a histogram in Prometheus terms? (Summaries compute quantiles client-side and can't be aggregated across instances; histograms can.)

### 6.3 What separates a good alert from a noisy one?

A good alert is **symptom-based and actionable**: it fires on something a customer would notice, points at what to do, and requires action now. "CPU above 80%" is neither, since high CPU may be perfectly healthy. Alerts nobody acts on are worse than no alerts, because they train the on-call to ignore the channel where the real one will eventually appear.

**Follow-ups.** What are the four golden signals? (Latency, traffic, errors, saturation.) What's an SLO, and how does it change alerting? (You alert on *burn rate* against an error budget rather than on instantaneous thresholds — which naturally suppresses brief blips and catches slow degradation.) What belongs in a runbook? (What the alert means, what to check first, what the known causes are, and what to do if none apply — including who to escalate to.)

### 6.4 Metrics, logs, and traces — when do you reach for which?

Metrics tell you something is wrong, are cheap to retain forever, but are aggregate. Logs tell you what happened to one specific request and are expensive at volume. Traces show where time went across service boundaries.

The trap with metrics is **label cardinality** — adding a user id as a label creates a separate time series per user and will take down your metrics backend. Per-request identity belongs in logs and traces.

**Follow-ups.** How do you connect them? (A trace or correlation id propagated through logs, so a metric anomaly leads to a trace leads to the specific logs.) How do you control log cost at scale? (Sampling, structured logs so you can filter cheaply, and being ruthless about log levels — most `INFO` logging in hot paths is expensive noise.)

### 6.5 Walk me through how you'd run an incident.

Stabilize first, diagnose second — mitigation and root cause are different activities and confusing them extends outages. Establish a single coordinator if more than two people are involved, keep a running timeline, and communicate status on a cadence even when the update is "still investigating."

Afterwards, a **blameless postmortem** focused on what made the failure possible and what would have caught it sooner, with action items that have owners.

**Follow-ups.** What's the difference between mitigation and fix? (Rolling back, failing over, or disabling a feature stops customer pain without understanding the cause — do it first.) What makes a postmortem blameless in practice, not just in name? (Asking what about the system allowed a reasonable person to make that choice, rather than why the person made it.)

---

## 7. System design

Expect one open design question. The evaluation is almost never about arriving at the "right" architecture; it's about whether you establish requirements before designing, name trade-offs, and notice your own design's failure modes.

**The method, which matters more than any specific answer.** Clarify functional requirements and scale first — reads versus writes, object size, latency expectations, consistency needs. Do rough capacity math out loud. Sketch the happy path end to end before optimizing anything. Then, unprompted, name where it breaks and what you'd do about it. Candidates who volunteer their design's weaknesses consistently score above candidates who defend theirs.

### 7.1 Design a file storage and retrieval service.

Cover the upload path (chunking, parallelism, resumability), the metadata store (what it holds, how it shards), the storage layer (redundancy scheme, placement across failure domains), the download path (range requests, caching), and deletion (soft delete, reference counting, eventual garbage collection).

**Follow-ups you should pre-empt.** How do you handle a customer deleting a file whose chunks are shared? What happens when a storage node dies mid-write? How do you migrate data between storage generations without downtime? What's your consistency model for a list operation immediately after a write?

### 7.2 Design a rate limiter for a multi-tenant API.

Token bucket or sliding window, per tenant and per endpoint, with the counter in a shared store like Redis if limits must hold across instances. Discuss the trade between exact global limits (a round trip per request) and approximate local limits (fast but permits overshoot).

**Follow-ups.** What do you return when limited? (429 with `Retry-After`, and make sure your own clients respect it.) How do you avoid the rate limiter becoming a single point of failure? (Fail open or fall back to local limits — a rate limiter that takes down the API when it's unavailable is worse than the abuse it prevents.)

### 7.3 Design a job queue with retries and dead-lettering.

Enqueue, visibility timeout or lease so a crashed worker's job is redelivered, bounded retries with backoff, and a dead-letter destination with enough context to diagnose. Discuss ordering guarantees, at-least-once delivery plus idempotent consumers, and how you'd monitor queue depth and message age.

**Follow-ups.** Why is message *age* a better alert than depth? (Depth of 10,000 may be normal; an oldest-message age of two hours never is.) What happens when a poison message fails forever? (It must leave the queue after bounded attempts, or it blocks progress and burns capacity indefinitely.)

### 7.4 Design a change-detection system for millions of files on a client machine.

The local state database, the cheap-heuristic scan, filesystem notifications with their platform differences and dropped-event risk, throttling so you don't destroy the user's machine, and resumability so a scan interrupted at 60% doesn't restart.

**Follow-ups.** How do you keep memory bounded when the file count is enormous? (Stream rather than load; never hold a full in-memory tree.) How do you detect deletions? (Absence during a full scan — which is why the safety-net scan can't be dropped entirely.)

---

## 8. AI-assisted development

Increasingly a required qualification rather than a bonus. The failure mode is answering vaguely — "I use it for boilerplate" tells the interviewer nothing and reads as low engagement.

### 8.1 How do you actually use AI coding agents in your workflow?

Be specific: name the tasks you delegate, the tasks you don't, and why. A strong pattern is exploring unfamiliar code before changing it, generating characterization tests around code about to be refactored, and mechanical refactors where the diff is fully reviewable. Then name the boundary: anything you couldn't confidently review — concurrency, security-sensitive paths, subtle business rules — you write yourself. **The bottleneck is review, not generation.**

**Follow-ups.** Where has it made you slower? (A genuinely good answer exists here — chasing a plausible-looking wrong approach costs more than starting from scratch. Having an example shows you've used it seriously.) How do you keep an agent's context accurate in a large repo? How do you handle a generated change that passes tests but you don't understand?

### 8.2 How would you use an agent safely on a large legacy codebase?

Tests before changes. If the legacy code has no coverage, add characterization tests pinning current behavior — including behavior that looks like a bug, because something may depend on it. Then refactor in small, individually reviewable steps. The risk isn't bad code; it's *plausible* code that quietly changes semantics.

**Follow-ups.** How do you review a 400-line generated diff? (You don't, meaningfully — you require smaller changes. Being willing to say this is the point.) What's the review standard for generated versus hand-written code? (Identical, and saying so firmly is the correct answer.)

### 8.3 Have you built anything *with* LLMs, as opposed to using them?

If you have — an internal gateway, a routing layer across providers, a team-specific harness — this is the strongest possible answer to the AI question, because it moves you from user to builder. Cover why an abstraction layer over providers was worth it, how you handled failures and timeouts from a non-deterministic dependency, cost and rate-limit management, and how you evaluated output quality.

**Follow-ups.** How do you test something non-deterministic? (Evaluation sets with scored criteria rather than exact-match assertions; golden examples; and separating the deterministic plumbing, which you unit test normally, from the model call, which you evaluate statistically.) What's your fallback when the provider is down or slow? What did you do about prompt injection if the input was untrusted?

---

## 9. Behavioral, and telling a story that lands

The most common failure among strong engineers is not lacking material — it's a story that describes a situation in detail and then trails off without a result. Interviewers write down outcomes. If your story has no ending, the note says "unclear impact."

**The structure, with the emphasis where it belongs.** Situation and task should be *two sentences* — just enough context. Action is the substance. **Result is non-negotiable and must be stated explicitly as the last thing you say.** Practice landing endings: "The result was that the flow went from X to Y," or "After that change we stopped seeing the incident entirely," or even "It didn't fully work — we still had Z, and here's what I'd do differently." A negative result stated clearly beats a good result left implied.

A drill worth doing: take each story below, set a two-minute timer, tell it out loud in English, and check that you said a result sentence before time ran out. If you didn't, the problem is structural, not linguistic.

### 9.1 Why are you interested in this role?

Three beats: what pulled you in technically, why you're credible on it, what you want to learn. The strongest versions name a genuine gap between your background and the role's focus, then frame closing it as the motivation. Avoid generic praise of the company, and make sure you're talking about *the team's* product rather than whichever product line gets the press coverage.

**Follow-ups.** What specifically about our product interested you? (Have a real technical observation ready — a design decision you noticed, a public engineering post, a trade-off you'd want to ask about.) Where do you want to be in a few years?

### 9.2 Tell me about the hardest production incident you handled.

What broke and how you found out, your first hypothesis, how you tested it, what it actually turned out to be, what you changed so it couldn't recur. Include a **hypothesis you abandoned** — reasoning from evidence rather than ego is what a debugging-heavy team screens for, and a story where you were immediately right teaches them nothing.

**Follow-ups.** What would have caught it sooner? What did you change about monitoring afterwards? How long was customer impact, and how did you communicate during it?

### 9.3 Tell me about a system you had to understand before you could change it.

Especially relevant if you've done legacy modernization. Cover how you built understanding — reading, tracing requests, writing tests to probe behavior, talking to people — and what strategy you chose for changing it safely, such as a strangler pattern with facades over existing flows.

**Follow-ups.** How did you decide what to change first? (Highest risk, or highest friction, or whatever unblocked the most subsequent work — any answer is fine if you have a reason.) How did you avoid breaking behavior nobody had documented? What did you leave alone, and why?

### 9.4 Tell me about a technical decision you disagreed with.

Pick a real one where you lost or the outcome was mixed. Describe how you argued it — evidence, a prototype, a written comparison — and then how you committed once decided. Stories where you were right and everyone agreed sound rehearsed; the signal is whether you can disagree without becoming difficult to work with.

**Follow-ups.** How did you know when to stop arguing? What would you do if you thought the decision was actively unsafe rather than just suboptimal? (The answer involves escalating on the specific risk, in writing, without making it personal.)

### 9.5 Your CV claims a specific improvement. What did you actually do?

Have the mechanism ready: the baseline and how you measured it, what the bottleneck turned out to be, what you changed, how you verified the improvement held under production load. If you can't reconstruct specifics, say so and describe the method rather than inflating the number. An unsupported metric is worse than no metric.

**Follow-ups.** How did you know that change caused the improvement and not something else? What did it cost — complexity, memory, money?

### 9.6 Tell me about mentoring someone.

Talk about what you changed in how you gave feedback, not just that you gave it. At mid-level experience, evidence that you make other people better is what makes "technical leadership" credible rather than aspirational.

**Follow-ups.** What did you do when someone wasn't improving? What have you learned from someone more junior than you?

### 9.7 How do you work across timezones, in a second language?

Concrete practices rather than reassurance: write decisions down so they survive the timezone gap, over-communicate status asynchronously, ask for clarification immediately rather than guessing, confirm verbal decisions in writing.

On language, don't apologize — **ask people to repeat or rephrase when you need it.** Interviewers read that as confidence. Answering a question you misheard is the actual risk.

**Follow-ups.** How do you handle disagreement asynchronously? What's the hardest part of remote work for you? (Have an honest answer; "nothing" is not believable.)

---

## 10. Questions to ask them

These are scored. Generic questions produce generic impressions.

**On the work.** What does the most technically interesting problem on this team look like right now? What's the oldest part of the codebase that's still load-bearing, and what makes it hard to change? When something breaks at 3am, what does the debugging path actually look like — what tooling exists, and what do you wish existed?

**On the team's position.** How does this team fit into the company's plans over the next couple of years, and how does that shape what you get to invest in? How big is the team and how is it structured? *(That last one is the polite way to probe staffing pressure — a real concern at companies with a history of doing a lot with few people, and it gets you the answer without putting anyone on the defensive.)*

**On how they work.** How do decisions get made and recorded for people who aren't in the room? What's the code review culture like — what does a good review look like here? How do you use AI tooling as a team, and is there an agreed workflow for reviewing generated changes?

**On remote specifics, if relevant.** What timezone overlap is expected? Is there an on-call rotation, and how does it work across regions?

**The one worth asking everyone separately.** What's the thing about this team that people usually only find out after they've joined? Comparing the different answers tells you more than any single answer does.

---

## Self-assessment

Before the interview, you should be able to do each of these without notes. Anything you can't, go back to that section.

Explain the three categories of concurrency bug and give an example of each. Size a thread pool and justify the number. Describe what happens when a bounded queue fills, including the counterintuitive thread-spawning behavior. Explain backpressure and implement it two different ways. Sketch a resumable chunked upload pipeline end to end. Explain erasure coding versus replication and when each wins. Say precisely why exactly-once delivery isn't a thing and what you build instead. Explain why averages hide tail latency and what you use instead. Tell three work stories in under two minutes each, **each ending on an explicit result sentence.** Give a specific, concrete account of how you use AI tooling, including where it has failed you.

---

*Study method reminder: say the answers out loud before reading them. Recognition feels like knowledge and isn't.*