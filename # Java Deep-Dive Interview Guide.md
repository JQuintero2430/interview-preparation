# Java Deep-Dive Interview Guide — Block 1: Collections Framework

> Target reader: backend engineer, 3–4 years Java/Spring Boot, preparing for FAANG-style and AI-evaluated interviews (micro1, Outlier).
> Philosophy: depth over brevity, internal mechanism over observable behavior. Each topic uses four layers: **(1)** the interview question, **(2)** the 60–90s senior answer, **(3)** how it works inside the JDK, **(4)** tricky follow-ups and common errors.

---

## Part 0 — The hierarchy and what each contract actually promises

Before any single class, you need a mental model of the _interfaces_, because interviewers (Google especially) will test whether you understand that a class is a _contract implementation_, not just a bag of methods.

The root is `Iterable<T>` (gives you `iterator()` and therefore the for-each loop). `Collection<E>` extends it and adds the size/add/remove/contains vocabulary. Below `Collection` you have three sub-contracts that _mean_ different things:

- **`List<E>`** promises positional access and ordering by index, allows duplicates, and allows `null` (unless the implementation says otherwise). The contract that breaks things if violated: `get(i)` must return the element that was placed at index `i`, and indices must be stable between structural modifications.
- **`Set<E>`** promises _no duplicates as defined by `equals`_. This is the contract people violate without noticing: a `HashSet` only enforces uniqueness if `equals`/`hashCode` are correct. If they aren't, the Set silently holds duplicates and you've broken the one promise the interface exists to make.
- **`Queue<E>`** / **`Deque<E>`** promise ordering for insertion/removal (FIFO, LIFO, or priority), and split each operation into a _throwing_ form (`add`, `remove`, `element`) and a _returning_ form (`offer`, `poll`, `peek`). Knowing that split exists is a senior signal.

`Map<K,V>` is **not** a `Collection` — this is deliberate and worth being able to defend. A map is a set of associations, not a collection of single elements, so making it a `Collection` would have forced an awkward element type. Instead `Map` exposes three _views_ (`keySet`, `values`, `entrySet`) that _are_ collections and are _backed by_ the map: mutating the view mutates the map. That backing relationship is itself a frequent follow-up.

`SortedMap`/`NavigableMap` and `SortedSet`/`NavigableSet` add the promise of a total ordering and navigation (`floor`, `ceiling`, `higher`, `lower`, `headMap`, `tailMap`). Violating the ordering contract — for example, a `Comparator` inconsistent with `equals` — does not throw; it silently produces a structure where `contains` and iteration disagree about what's "in" the set.

The single most important transversal idea: **the interface defines the promise; the implementation defines the cost and the failure mode.** Almost every good follow-up lives in the gap between those two.

---

## ArrayList

### Layer 1 — Interview question

_(Amazon-style, trade-off reasoning)_ "You're choosing the backing list for a hot path that appends a lot and occasionally indexes into the middle. Walk me through why `ArrayList` is almost always the right default, and tell me exactly what happens, step by step, when it runs out of room."

### Layer 2 — Senior answer

`ArrayList` is a growable array. Reads and index access are O(1) because it's contiguous memory; appends are amortized O(1). When it fills up it allocates a new array 1.5× the size and copies via `System.arraycopy`, which is a native bulk memory move and extremely fast. The cost people quote for inserting in the middle — O(n) shifting — is real but in practice dominated by that native copy, so it's far cheaper than the per-node allocation and pointer chasing of a linked list. The only time I reach for something else is when I genuinely need O(1) removal from the head, where I'd use `ArrayDeque`.

### Layer 3 — How it works inside

The backing field is `transient Object[] elementData` plus an `int size`. A freshly constructed `new ArrayList<>()` does **not** allocate a size-10 array immediately; it points at a shared empty array sentinel (`DEFAULTCAPACITY_EMPTY_ELEMENTDATA`) and only allocates the default capacity of 10 on the first `add`. That lazy allocation matters: code that creates millions of empty lists pays nothing until use.

Growth uses `newCapacity = oldCapacity + (oldCapacity >> 1)`, i.e. 1.5×. The interesting design question is _why 1.5 and not 2_. With a doubling strategy, each new array is strictly larger than the sum of all previously freed arrays (1 + 2 + 4 + … + 2^(k-1) = 2^k − 1 < 2^k), so the allocator can **never** reuse the contiguous space left behind by older arrays — it must always find fresh memory. A growth factor below the golden ratio (~1.618) eventually lets freed blocks be coalesced and reused for a later allocation. So 1.5× is a deliberate trade: slightly more frequent resizes in exchange for friendlier allocator behavior and lower peak fragmentation. The amortized analysis still gives O(1) per append because the total copy work across n appends is geometric and sums to O(n).

`System.arraycopy` is an intrinsic — the JIT replaces it with an optimized `memmove`-style operation, often vectorized. This is why "shifting is O(n)" loses to intuition: the constant factor is tiny compared to allocating n nodes.

### Layer 4 — Tricky follow-ups

**"If you know you'll insert n elements, what's the right way to build the list?"** Pass the capacity to the constructor (`new ArrayList<>(n)`) or call `ensureCapacity(n)` once. Otherwise you trigger ~log₁.₅(n) resizes, each copying everything. The intuitive "it auto-grows so don't worry" answer is what separates juniors here.

**"Is `ArrayList` add() truly O(1)?"** No — it's _amortized_ O(1). A single `add` that triggers a resize is O(n). If your latency requirement is on the worst case (a real-time or p99 concern Netflix cares about), amortized isn't good enough and you pre-size.

**"What does `removeIf` cost vs a loop with `remove(Object)`?"** `removeIf` is a single O(n) pass that compacts in place. A naive loop calling `list.remove(o)` for many elements is O(n²) because each `remove` shifts the tail. The "obvious" loop is the trap.

---

## LinkedList

### Layer 1 — Interview question

_(Google-style, attacking the cliché)_ "Everyone says `LinkedList` is better for insertions. Convince me that's usually wrong."

### Layer 2 — Senior answer

The cliché is true only in a vacuum. Yes, splicing a node is O(1) — _but only if you already hold a reference to the position_. Reaching that position is O(n) traversal, so `add(i, x)` and `get(i)` are both O(n) in practice. On top of that, every element is a separate heap object with `prev`, `next`, and `item` references, so you pay an allocation per element and you destroy cache locality: traversal is pointer-chasing across the heap, which means cache misses where `ArrayList` reads a contiguous block. Empirically `ArrayList` wins on almost every realistic workload. The honest niche for `LinkedList` is when you're using it as a `Deque` and mutating through a `ListIterator` you already positioned.

### Layer 3 — How it works inside

`LinkedList` is a doubly-linked list and implements both `List` and `Deque`. Each `Node` holds `item`, `next`, `prev`. On a 64-bit JVM with compressed oops, that's roughly a 16-byte object header plus three 4-byte references rounded to alignment — call it ~24–32 bytes of overhead _per element_, versus 4–8 bytes per slot in an array. `get(i)` is implemented with a small optimization: it walks from whichever end is closer (`if (index < (size >> 1))` walk forward else backward), so it's O(n/2), still O(n).

The deeper point is the memory model of the hardware, not just Big-O. A modern CPU prefetches contiguous cache lines. `ArrayList` iteration streams predictably and the prefetcher hides memory latency. `LinkedList` iteration jumps to arbitrary heap addresses, defeating prefetch, so each step can stall on a last-level-cache miss (~hundreds of cycles). This is why two structures with the same asymptotic complexity can differ by an order of magnitude in wall-clock time.

### Layer 4 — Tricky follow-ups

**"When is `LinkedList`'s O(1) insertion actually realized?"** Only when you already have the node — i.e. you're iterating with a `ListIterator` and call `it.add(x)` / `it.remove()`. The index-based API never realizes it because of the traversal cost.

**"`LinkedList` vs `ArrayDeque` for a queue?"** `ArrayDeque`. It gives the same O(1) head/tail operations without per-node allocation and with cache-friendly contiguous storage. There's essentially no modern reason to pick `LinkedList` as a queue.

---

## HashMap

### Layer 1 — Interview question

_(Google/Meta-style, internals)_ "Explain everything that happens on a `put` when the bucket already has collisions, including when and how the bucket turns into a tree, and what determines the bucket index."

### Layer 2 — Senior answer

`HashMap` is an array of buckets sized to a power of two. On `put`, it computes a spread hash, masks it to a bucket index, and either creates a node, appends to the bucket's chain, or updates an existing key matched by `equals`. When a single bucket's chain grows past 8 entries _and_ the table is at least 64 slots, that bucket converts to a red-black tree so worst-case lookup in that bucket drops from O(n) to O(log n) — a defense against pathological hash collisions. It untrees back to a list below 6 entries. The table resizes (doubles) when size exceeds capacity × load factor (default 0.75), rehashing entries into the larger table.

### Layer 3 — How it works inside

**The spread function.** Bucket index is `(n - 1) & hash`, and because `n` is a power of two this mask only keeps the _low_ bits of the hash. If your keys' `hashCode` differs only in high bits, every key lands in the same bucket. So `HashMap` does `hash(key) = h ^ (h >>> 16)` where `h = key.hashCode()`: it XORs the top 16 bits down into the bottom 16, mixing high-bit entropy into the bits the mask actually uses. Cheap (one shift, one XOR) and good enough; they explicitly chose not to use a stronger but costlier hash.

**Load factor and threshold.** `threshold = capacity × loadFactor`. 0.75 is the documented sweet spot between space and collision probability. Lower means more memory, fewer collisions; higher means denser tables and longer chains.

**Resize.** Doubling to a power of two enables a clever Java 8 trick. When capacity goes from `oldCap` to `2*oldCap`, an entry either stays at index `j` or moves to `j + oldCap`, decided by a single bit: `(hash & oldCap) == 0` keeps it low, else high. So resize splits each bucket into a "lo" and "hi" chain without recomputing the full index, preserving relative order. (Pre-Java-8 the rehash reversed chain order, which under concurrent misuse could create a cycle and spin a CPU at 100% — a famous production failure.)

**Treeification.** `TREEIFY_THRESHOLD = 8`, `UNTREEIFY_THRESHOLD = 6`, `MIN_TREEIFY_CAPACITY = 64`. Two conditions matter and people conflate them: a bucket only becomes a tree if its chain exceeds 8 **and** the table has ≥64 slots; if the table is smaller, `HashMap` _resizes instead_, because a small table with a long chain usually just needs more buckets. The gap between 8 (treeify) and 6 (untreeify) is hysteresis to prevent thrashing around the boundary. Why 8? With load factor 0.75 and a decent hash, bucket occupancy follows a Poisson distribution; the probability of a bucket reaching 8 elements is about 6×10⁻⁸ — astronomically rare with good hashing. So treeification isn't an expected optimization; it's a safety net against bad `hashCode` implementations and hash-collision denial-of-service attacks.

**Tree ordering when keys aren't `Comparable`.** Inside a treeified bin, nodes are ordered first by hash. When two keys have equal hashes, the tree tries to break the tie with `Comparable.compareTo` _if the key class implements `Comparable`_. If it doesn't, it falls back to `tieBreakOrder`, which compares class names and then `System.identityHashCode`. So the tree still functions with non-`Comparable` keys — it just uses an arbitrary-but-consistent tiebreak. The lookup remains correct because final membership is still decided by `equals`; the tree ordering is only for navigation.

**Null key.** Exactly one `null` key is allowed and special-cased to hash 0, landing in bucket 0.

### Layer 4 — Tricky follow-ups

**"`HashMap` is O(1) for get — always?"** Average O(1) with a good hash. Worst case before Java 8 was O(n) for a degenerate bucket; since Java 8 treeification bounds it at O(log n) per bucket. Saying "always O(1)" is the trap.

**"You said it resizes instead of treeifying for small tables — why?"** Because a long chain in a tiny table is usually a symptom of too few buckets, not of genuinely colliding hashes. Doubling the table spreads the entries cheaply and avoids the overhead and footprint of red-black tree nodes (which are larger and have parent pointers).

**"What breaks if I mutate a key after inserting it so its hashCode changes?"** The entry becomes effectively unreachable. See the equals/hashCode section below — this is a guaranteed follow-up and deserves its own snippet.

---

## LinkedHashMap

### Layer 1 — Interview question

_(Meta-style, applied)_ "Implement an LRU cache. What's the minimal correct way in Java, and what exactly makes it O(1) per operation?"

### Layer 2 — Senior answer

Extend `LinkedHashMap` with access-order enabled and override `removeEldestEntry` to evict once size exceeds capacity. It's O(1) per operation because `LinkedHashMap` maintains a doubly-linked list threaded through its entries on top of the normal hash table: the hash table gives O(1) lookup, and the linked list gives O(1) reordering and eviction of the eldest entry. With access-order on, every `get`/`put` unlinks the touched entry and moves it to the tail, so the head is always the least-recently-used entry to evict.

```java
class LRUCache<K, V> extends LinkedHashMap<K, V> {
    private final int capacity;
    LRUCache(int capacity) {
        super(capacity, 0.75f, true); // accessOrder = true
        this.capacity = capacity;
    }
    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > capacity;
    }
}
```

### Layer 3 — How it works inside

`LinkedHashMap` extends `HashMap` and overrides the entry type to add `before` and `after` pointers, forming a doubly-linked list over all entries independent of bucket placement. It overrides the empty hooks `HashMap` leaves for it — `afterNodeAccess`, `afterNodeInsertion`, `afterNodeRemoval` — to keep that list in sync. With `accessOrder = false` (the default) the list preserves insertion order. With `accessOrder = true`, `afterNodeAccess` moves the touched node to the tail. `afterNodeInsertion` is where `removeEldestEntry` is consulted, and if it returns true the head node (the eldest) is removed. The hash-table mechanics (buckets, treeification, resize) are entirely inherited; only iteration order and the access hooks differ. This is a clean example of the template-method pattern inside the JDK.

### Layer 4 — Tricky follow-ups

**"Is your LRU cache thread-safe?"** No. `LinkedHashMap` is not synchronized, and the LRU reordering happens on `get`, so even concurrent reads mutate structure. You'd wrap it in `Collections.synchronizedMap` (and still synchronize during iteration) or, better, use a purpose-built concurrent cache (Caffeine). Interviewers love this because the access-order mutation surprises people who think reads are safe.

**"Why doesn't a plain `HashMap` work for LRU?"** It has no notion of recency or order; finding the eldest entry would be O(n). The linked list is the whole point.

---

## TreeMap

### Layer 1 — Interview question

_(Amazon-style, situational)_ "You need a map where you can ask 'give me the closest key ≤ X' efficiently and iterate in sorted order. What do you use and what does it cost?"

### Layer 2 — Senior answer

`TreeMap`, a red-black tree implementing `NavigableMap`. All of `get`/`put`/`remove` are O(log n), iteration is in sorted key order, and it gives you `floorKey`, `ceilingKey`, `higherKey`, `lowerKey`, plus range views like `subMap`/`headMap`/`tailMap`. The price versus `HashMap` is the log factor on every operation and the lack of O(1) lookup; you accept that specifically because you need ordering or navigation that a hash table can't give you.

### Layer 3 — How it works inside

A red-black tree is a self-balancing binary search tree maintaining five invariants (nodes are red or black; root is black; red nodes have black children; every root-to-null path has the same number of black nodes; nulls count as black). Those invariants guarantee the longest root-to-leaf path is at most twice the shortest, bounding height at O(log n), so insertion and deletion rebalance with a constant number of rotations and recolorings. Ordering comes from the key's natural ordering (`Comparable`) or a supplied `Comparator`. Iteration is an in-order traversal, which visits keys in ascending order. The navigation methods are tree searches that track the best candidate as they descend, hence O(log n).

A subtle correctness point: `TreeMap` decides equality of keys using `compareTo`/`compare` returning 0 — **not** `equals`. If your comparator is inconsistent with `equals`, the map will behave as the comparator dictates, and two keys that are `.equals` but compare non-zero will both be stored. This is the "comparator inconsistent with equals" hazard the `SortedMap` Javadoc explicitly warns about.

### Layer 4 — Tricky follow-ups

**"Can a `TreeMap` key be null?"** No, not with natural ordering — comparing null throws NPE. (A custom comparator that tolerates null could technically allow it, but that's a footgun.) `HashMap` allows one null key; `TreeMap` generally doesn't. The asymmetry trips people up.

**"`TreeMap` vs `HashMap` for 'count distinct then output sorted'?"** Either works, but if the final requirement is sorted output, `TreeMap` gives it for free at O(log n) per insert; with `HashMap` you'd sort at the end at O(n log n). The right choice depends on whether you query order incrementally or once.

---

## HashSet, LinkedHashSet, TreeSet

### Layer 1 — Interview question

_(Direct)_ "How is `HashSet` implemented, and what does that tell you about its performance and ordering guarantees?"

### Layer 2 — Senior answer

All three sets are thin wrappers over the corresponding maps. `HashSet` is backed by a `HashMap`, `LinkedHashSet` by a `LinkedHashMap`, `TreeSet` by a `TreeMap`. The element becomes the map key and the value is a shared dummy `Object`. So `HashSet` inherits average O(1) membership and no ordering, `LinkedHashSet` adds insertion-order iteration, and `TreeSet` gives sorted iteration at O(log n). There's no separate set algorithm to learn — it's the map mechanics you already know.

### Layer 3 — How it works inside

Inside `HashSet` there's a `private transient HashMap<E,Object> map` and a `private static final Object PRESENT = new Object()`. `add(e)` is literally `map.put(e, PRESENT) == null`. This is why the entire `equals`/`hashCode` story for `HashMap` keys applies verbatim to `HashSet` elements: uniqueness is decided by the same bucket-then-equals logic, and the same treeification kicks in for pathological element hashes. `LinkedHashSet` extends `HashSet` and uses a constructor that tells the parent to build a `LinkedHashMap` internally. `TreeSet` wraps a `NavigableMap` (a `TreeMap`) and exposes navigation as `floor`/`ceiling`/`higher`/`lower`.

### Layer 4 — Tricky follow-ups

**"Why does `HashSet` use a single shared `PRESENT` object instead of `null` as the value?"** Because `map.put` returns the previous value, and the wrapper needs to distinguish "was absent" (null returned) from "was present." If the value were `null`, that signal would be ambiguous. A small but real design decision.

**"Memory cost of `HashSet` vs a bare array of unique elements?"** Significant — you pay for the full `HashMap` node objects and bucket array. If you only need membership over a known small integer domain, a `boolean[]`/bitset is far cheaper. Interviewers probing memory awareness like this.

---

## PriorityQueue

### Layer 1 — Interview question

_(Tricky, "what prints")_ "I add 5, 1, 3 to a `PriorityQueue`, then iterate it with a for-each loop and print each element. What order do I get, and is that what most people expect?"

### Layer 2 — Senior answer

You are **not** guaranteed `1, 3, 5`. The for-each loop walks the internal array in _heap_ order, not sorted order, so you might see something like `1, 5, 3`. The only ordered access is `poll()` repeatedly, which gives `1, 3, 5`. `PriorityQueue` only guarantees that `peek`/`poll` return the minimum (or the comparator's first element); it makes no promise about iteration order. People assume iteration is sorted because the queue is "priority," and that's the trap.

### Layer 3 — How it works inside

`PriorityQueue` is a binary min-heap stored in an array. For the element at index `i`, its children are at `2i+1` and `2i+2` and its parent at `(i-1)/2`. `offer` appends at the end and _sifts up_ (swaps with parent while smaller), O(log n). `poll` removes index 0, moves the last element to the root, and _sifts down_ (swaps with the smaller child while larger), O(log n). `peek` is O(1). Building from a collection is O(n) via bottom-up heapify, not O(n log n). The array layout is exactly why iteration isn't sorted: the heap property only constrains parent-child relationships, not left-to-right order, so the raw array is partially ordered.

It is not thread-safe: there's no synchronization, and concurrent `offer`/`poll` would corrupt the heap invariant mid-sift. The concurrent counterpart is `PriorityBlockingQueue`.

### Layer 4 — Tricky follow-ups

**"How do you make a max-heap?"** Pass `Comparator.reverseOrder()` (or a reversed comparator) to the constructor. The structure is identical; only the comparison flips.

**"Top-K largest elements from a stream of n — what size heap and why?"** A _min_-heap of size K. You keep K elements; for each new element, if it's larger than the heap's minimum (the root), you poll and offer. That's O(n log K) time and O(K) space, far better than sorting everything at O(n log n). The counterintuitive part — using a _min_-heap to find the _largest_ K — is the exact thing being tested.

---

## ArrayDeque

### Layer 1 — Interview question

_(Amazon-style, trade-off)_ "You need a stack. Why not `Stack`? And you need a queue — why not `LinkedList`? Give me one structure that beats both."

### Layer 2 — Senior answer

`ArrayDeque` for both. `Stack` extends `Vector`, so every operation is `synchronized` — you pay lock overhead even single-threaded — and it exposes `Vector`'s index methods, breaking LIFO encapsulation; it's a legacy class. `LinkedList` works as a queue but allocates a node per element and chases pointers, hurting cache locality. `ArrayDeque` is a resizable circular array with no per-element allocation and contiguous storage, giving O(1) amortized push/pop at both ends and excellent cache behavior. The Javadoc itself recommends it over both `Stack` and `LinkedList`.

### Layer 3 — How it works inside

`ArrayDeque` holds an `Object[]`, a `head` index, and a `tail` index. Adding to the front decrements `head`; adding to the back increments `tail`; both wrap around modulo the array length. The capacity is always a power of two so wrapping is a bitmask (`index & (length - 1)`) instead of a modulo, and the empty/full check is a cheap index comparison. When full it doubles capacity and copies the elements into a linearized layout. Because there's no node object and the data is contiguous, iteration and indexing are cache-friendly in the way `LinkedList` is not.

It forbids `null` elements, and this is structural, not stylistic: `null` is used internally as the sentinel for empty slots, so allowing a `null` element would make "is this slot empty?" ambiguous. That's the same kind of design reasoning behind `ConcurrentHashMap` rejecting nulls — a sentinel collision problem.

### Layer 4 — Tricky follow-ups

**"Which end is the 'top' when you use it as a stack?"** Use `push`/`pop`, which operate on the head. Mixing `add` (tail) with `pop` (head) silently gives you queue semantics when you wanted stack semantics — a common bug.

**"Can `ArrayDeque` operations ever be worse than O(1)?"** The resize copy is O(n), so a single push that triggers growth is O(n); it's amortized O(1), same caveat as `ArrayList`. Pre-size if worst-case latency matters.

---

## Tricky topic — `Collections.unmodifiableList` vs `List.of` vs `List.copyOf`

### Layer 1 — Interview question

_(Google/AI-platform, chained follow-ups)_ "I want an immutable list. Compare `Collections.unmodifiableList`, `List.of`, and `List.copyOf`: what does each copy, what happens to the source afterward, how do they treat nulls, and what exception do they throw on mutation?"

### Layer 2 — Senior answer

`Collections.unmodifiableList` returns a _view_, not a copy: it wraps the original list, so mutating the _original_ still changes what the view exposes — it only blocks mutation _through the wrapper_. `List.of` builds a genuinely immutable list with no link to any source, rejects `null` elements with `NullPointerException`, and is fixed at construction. `List.copyOf` takes a source collection and makes an immutable snapshot of it at call time, so later changes to the source don't affect the copy; it also rejects nulls. All three throw `UnsupportedOperationException` on any structural mutation attempt. And critically, none of them make the _elements_ immutable — they're shallow.

### Layer 3 — How it works inside

`Collections.unmodifiableList` returns an `UnmodifiableList` that delegates reads to the backing list and overrides every mutator to throw `UnsupportedOperationException`. There is exactly one array — the original's — so it's a live view. `List.of` (Java 9+) returns compact, purpose-built immutable implementations: `List0`, `List1`, `List2` for tiny sizes (no array at all for 0/1/2 elements), and `ListN` for the rest, which copies the varargs into a private array it never exposes. Their mutators throw unconditionally. `List.copyOf` first checks whether the source is _already_ one of these immutable `ImmutableCollections` types; if so it returns the same instance (no copy), otherwise it allocates a new immutable list from the source's current contents. The null rejection is explicit `Objects.requireNonNull` on each element during construction.

### Layer 4 — Tricky follow-ups

**"I wrapped a list with `unmodifiableList` and handed it out. Is it safe?"** Only if you never keep or leak the original mutable reference. If you still hold the source and mutate it, every holder of the "unmodifiable" view sees the change — it's read-only, not immutable. The fix is to copy first (`List.copyOf`) so there's no shared mutable backing.

**"All three are immutable — so the contained objects can't change?"** No. Immutability is shallow. If the list holds a mutable `User`, you can still call `user.setName(...)`. The list structure is frozen; the elements are not. This shallow-vs-deep distinction is a classic catch.

**"Does `List.of()` allow null? What about a list that contains a null today via `Arrays.asList`?"** `List.of` throws `NullPointerException` on any null element or null array. `Arrays.asList` happily holds nulls. So you cannot blindly `List.copyOf` an `Arrays.asList` result that might contain null — it'll NPE.

---

## Tricky topic — fail-fast vs fail-safe iterators, `modCount`, and `ConcurrentModificationException`

### Layer 1 — Interview question

_(Tricky "this compiles and runs — what happens?")_

```java
List<Integer> list = new ArrayList<>(List.of(1, 2));
for (Integer x : list) {
    if (x == 1) list.remove(x);  // remove by value
}
System.out.println(list);
```

"Does this throw `ConcurrentModificationException`? Now change the list to `[1, 2, 3]` and answer again."

### Layer 2 — Senior answer

For `[1, 2]` it does **not** throw — it prints `[2]`. For `[1, 2, 3]` it **does** throw. That asymmetry surprises people who think CME is guaranteed on any modification during iteration. It isn't: `ConcurrentModificationException` is _best-effort_. The detection compares a captured `expectedModCount` against the live `modCount`, but that check only runs inside `next()`. In the two-element case, after removing index 0 the size is 1 and the iterator's cursor is already 1, so `hasNext()` returns false and the loop exits _without ever calling `next()` again_ — so the mismatch is never detected.

### Layer 3 — How it works inside

A **fail-fast** iterator (the `ArrayList`/`HashMap`/`HashSet` ones) stores `int modCount` on the collection, incremented on every structural modification. When you obtain an iterator it snapshots `expectedModCount = modCount`. Each `next()` calls `checkForComodification()`, which does `if (modCount != expectedModCount) throw new ConcurrentModificationException();`. The iterator's own `remove()` is the only sanctioned mutation: it updates `expectedModCount` to stay in sync. Crucially, `hasNext()` does **not** check — it only compares `cursor != size`. That's the whole reason the two-element trap doesn't throw: the loop terminates via `hasNext` before the next `checkForComodification`.

A **fail-safe** (more precisely, weakly consistent) iterator — `CopyOnWriteArrayList`, `ConcurrentHashMap` — never throws CME because it iterates over a snapshot (COW) or tolerates concurrent structure (CHM's bucket-by-bucket weak consistency). The trade-off: a COW iterator won't reflect modifications made after it was created, and a CHM iterator reflects _some_ but not necessarily all concurrent changes, and never throws.

### Layer 4 — Tricky follow-ups

**"So is CME a concurrency guarantee?"** No, and the name misleads. It's a debugging aid with no guarantee in either direction — it can fail to fire (the trap above) and it can fire on purely single-threaded code (the `[1,2,3]` case has no concurrency at all). Never write logic that depends on catching it.

**"What's the correct way to remove during iteration?"** Use the iterator's own `remove()`, or `Collection.removeIf(predicate)`. Both keep `modCount`/`expectedModCount` consistent.

**"Why does removing the second-to-last element specifically dodge the exception?"** Because removing it makes `size` equal the current `cursor`, so `hasNext()` returns false on the next check and `next()` is never invoked. It's an artifact of where the check lives, not a designed feature.

---

## Tricky topic — the `equals`/`hashCode` contract and what breaks inside a `HashMap`

### Layer 1 — Interview question

_(Direct, then deepened)_ "State the `equals`/`hashCode` contract. Then: I put an object into a `HashMap` as a key, then mutate a field that participates in its `hashCode`. What happens when I try to `get` it back, and why exactly?"

### Layer 2 — Senior answer

The contract: if two objects are `equals`, they must have the same `hashCode`; the converse need not hold (equal hashes don't imply equality — that's a collision). If you mutate a key so its `hashCode` changes after insertion, the entry effectively becomes lost: on insert it was placed in the bucket for the _old_ hash, but `get` now computes the _new_ hash, masks to a _different_ bucket, and finds nothing — so it returns `null` even though the entry is physically still in the map. The entry is now a leak you can't reach by key.

### Layer 3 — How it works inside

```java
class MutableKey {
    int id;
    MutableKey(int id) { this.id = id; }
    @Override public int hashCode() { return id; }
    @Override public boolean equals(Object o) {
        return o instanceof MutableKey k && k.id == id;
    }
}

Map<MutableKey, String> map = new HashMap<>();
MutableKey key = new MutableKey(1);
map.put(key, "value");          // hash=1 → bucket = 1 & (n-1)
key.id = 2;                     // mutate: hashCode now 2
System.out.println(map.get(key)); // prints null
System.out.println(map.size());   // prints 1  ← still there, unreachable
```

`put` computes `hash(key)` from `hashCode()==1`, masks to a bucket, and links the node there. After `key.id = 2`, `get(key)` computes `hash` from `hashCode()==2`, masks to a _different_ bucket index, walks that (empty) bucket, finds nothing, returns `null`. The node still sits in the original bucket — `size()` confirms it — but no key lookup will ever reach it again. Even `containsValue` would find the value (it scans all buckets), but `get`/`containsKey` won't. This is precisely why **map keys should be immutable**, or at least never mutated in fields used by `hashCode`/`equals`.

### Layer 4 — Tricky follow-ups

**"What if I only break the symmetric/transitive part of `equals` but keep `hashCode` constant?"** Then two objects might land in the same bucket but disagree on equality asymmetrically, so membership and de-duplication become order-dependent and inconsistent — `a.equals(b)` true but `b.equals(a)` false leads to `Set`/`Map` behavior that depends on insertion order. The structure doesn't throw; it silently misbehaves.

**"Records?"** Java 16+ `record` auto-generates `equals`/`hashCode`/`toString` from the components, consistently, which makes records excellent immutable map keys and removes a whole class of hand-written contract bugs. If the interviewer is on Java 17/21, mentioning records here is a strong signal.

---

## Tricky topic — why `HashMap` allows a null key but `ConcurrentHashMap` does not

### Layer 1 — Interview question

_(Google/Meta, design reasoning)_ "`HashMap` lets me store a `null` key and `null` values. `ConcurrentHashMap` throws `NullPointerException` for both. Is that a technical limitation or a design choice? Defend the choice."

### Layer 2 — Senior answer

It's a deliberate design choice by Doug Lea, not a limitation. In a concurrent map, `map.get(k)` returning `null` is _ambiguous_: it could mean "key absent" or "key present, mapped to null." In a single-threaded `HashMap` you disambiguate with `containsKey`, but in a concurrent map another thread can remove or insert the key _between_ your `get` and your `containsKey`, so there is no race-free way to tell the two cases apart. Forbidding null removes the ambiguity entirely: a `null` return now unambiguously means "absent." `HashMap`, being single-threaded by contract, doesn't face that race, so it can afford to allow one null key and null values.

### Layer 3 — How it works inside

`HashMap` special-cases the null key to hash 0 and bucket 0 (there's an explicit `if (key == null)` branch in `putVal`/`getNode`). `ConcurrentHashMap` does `if (key == null || value == null) throw new NullPointerException()` up front. The deeper rationale is the _check-then-act_ hazard: many concurrent algorithms rely on `putIfAbsent`, `computeIfAbsent`, `merge`, where a sentinel `null` would collide with the "no mapping" signal those methods use internally to make atomic decisions. By banning null, every `null` the implementation sees can be trusted to mean "absent," which keeps those atomic operations correct without extra state.

### Layer 4 — Tricky follow-ups

**"Could they have used a sentinel object instead of banning null?"** They could, but it complicates the public API (your values could collide with the sentinel) and every read path would pay to translate the sentinel back. Banning null is simpler, faster, and pushes the ambiguity problem back to the caller, who is better placed to model "missing" explicitly (e.g. `Optional`).

**"Does `Hashtable` allow null?"** No — the legacy `Hashtable` also forbids null keys and values, for similar (though historically less articulated) reasons. Mentioning that `Hashtable` is the obsolete fully-synchronized ancestor and `ConcurrentHashMap` is its modern replacement is a good aside.

---

## Tricky topic — `Comparable` vs `Comparator` and when you need both

### Layer 1 — Interview question

_(Situational)_ "When would a single class need both a `Comparable` implementation and one or more `Comparator`s?"

### Layer 2 — Senior answer

`Comparable` defines a class's single _natural_ ordering via `compareTo` — the one canonical way to sort it, baked into the type (e.g. `Integer` by value, `String` lexicographically). `Comparator` is an _external_ ordering strategy you pass in, and you can have many. You need both when a class has an obvious natural order but callers sometimes want a different one: e.g. `Employee implements Comparable` sorting by ID (natural), plus separate `Comparator`s by salary, by name, by hire date for specific reports. The natural order is the default for `TreeMap`/`TreeSet`/`Collections.sort` with no comparator; the comparators are for everything else.

### Layer 3 — How it works inside

`Collections.sort`/`Arrays.sort` and `TreeMap`/`TreeSet` call `compareTo` when no `Comparator` is provided, and `compare` when one is. Modern code composes comparators fluently: `Comparator.comparing(Employee::getSalary).thenComparing(Employee::getName).reversed()`. Under the hood `comparing` captures a key extractor and returns a comparator that extracts and delegates to the key's natural order, and `thenComparing` chains a tiebreaker only consulted when the prior comparison returns 0. A correctness requirement: any comparator (and `compareTo`) must impose a _total order_ — be consistent, transitive, and antisymmetric — or `Arrays.sort` (TimSort) can throw `IllegalArgumentException: Comparison method violates its general contract!` when it detects the inconsistency mid-sort.

### Layer 4 — Tricky follow-ups

**"What's the danger of a comparator inconsistent with `equals`?"** In a `TreeSet`/`TreeMap`, membership is decided by the comparator returning 0, not by `equals`. So a comparator that compares only by one field treats two objects equal in that field as the _same_ set element even if `equals` says they differ — you'll silently drop "duplicates." The `SortedSet` Javadoc calls this out explicitly.

**"Why does TimSort throw that contract-violation exception?"** Because a broken comparator (e.g. one using subtraction `a - b` that overflows for large ints, flipping sign) produces inconsistent results across comparisons; TimSort's merge logic detects the impossibility and fails fast rather than producing a corrupt order. The fix is `Integer.compare(a, b)` instead of `a - b`. This subtraction-overflow bug is a favorite gotcha.

---

## Tricky topic — `ArrayList.subList` as a dangerous view

### Layer 1 — Interview question

_(Tricky)_ "What does `list.subList(1, 3)` return — a copy or a view? What can go wrong?"

### Layer 2 — Senior answer

A _view_ backed by the original list, not a copy. Reads and writes pass through: `subList.set(0, x)` changes the original, and `subList.clear()` deletes that range from the original. The danger is twofold. First, _non-structural_ changes write through, surprising people who expect an independent list. Second, if you _structurally_ modify the **original** list (add/remove changing its size) after creating the sublist, the sublist becomes invalid and the next operation on it throws `ConcurrentModificationException` — because the sublist tracks the parent's `modCount`. So a sublist is only safe to use in a tight scope where the parent isn't structurally touched.

### Layer 3 — How it works inside

`subList` returns a `SubList` instance holding a reference to the parent, an offset, and a size, plus a captured `modCount`. Every operation translates indices by the offset and delegates to the parent's array, and re-checks `parent.modCount == expectedModCount` (`checkForComodification`). Structurally modifying the parent directly bumps `parent.modCount` without updating the sublist's expectation, so the next sublist call detects the mismatch and throws. A common _idiom_ that relies on the view: `list.subList(from, to).clear()` to delete a range in O(n) without manual looping — that's the intended use of the write-through behavior.

### Layer 4 — Tricky follow-ups

**"How do I get an independent copy of a range?"** `new ArrayList<>(list.subList(from, to))` — the copy constructor materializes the view's contents into a fresh, detached list.

**"Can I serialize or store a sublist?"** Don't — it's a view tied to the parent's lifecycle and `modCount`; persisting it or passing it across boundaries invites the CME. Copy first.

---

## Tricky topic — `Arrays.asList` vs `List.of`

### Layer 1 — Interview question

_(Tricky "what happens")_

```java
List<Integer> a = Arrays.asList(1, 2, 3);
a.set(0, 99);   // ?
a.add(4);       // ?

List<Integer> b = List.of(1, 2, 3);
b.set(0, 99);   // ?
```

"For each line, does it work or throw, and why? And bonus: `Arrays.asList(new int[]{1,2,3}).size()`?"

### Layer 2 — Senior answer

`Arrays.asList` returns a _fixed-size_ list backed by the array. `a.set(0, 99)` works and writes through to the backing array. `a.add(4)` throws `UnsupportedOperationException` because the size is fixed — you can replace elements but not grow or shrink. `List.of` returns a fully _immutable_ list, so `b.set(0, 99)` throws `UnsupportedOperationException` too. The bonus is the classic trap: `Arrays.asList(new int[]{1,2,3})` infers `List<int[]>`, a list of one element (the array itself), so `.size()` is **1**, not 3 — because `int[]` isn't `Integer[]` and varargs treats the primitive array as a single argument. Use `Integer[]` or `IntStream` to get a list of three.

### Layer 3 — How it works inside

`Arrays.asList` returns an `Arrays$ArrayList` (a private nested class, distinct from `java.util.ArrayList`) that wraps the _same_ array reference. `set` writes directly into that array, so changes are visible both ways — and if you got the array from somewhere else, mutating the list mutates that external array. `add`/`remove` aren't overridden to support resizing, so they fall through to `AbstractList`'s default, which throws `UnsupportedOperationException`. `List.of` returns the `ImmutableCollections` types described earlier, with all mutators throwing and nulls rejected. The `int[]` trap is pure generics + varargs: `asList(T...)` can't have `T = int` (primitives aren't reference types), so the compiler picks `T = int[]` and passes the whole array as one element.

### Layer 4 — Tricky follow-ups

**"Why would `Arrays.asList`'s write-through ever be useful?"** It lets you treat a primitive-free array as a `List` for APIs that need one, while sharing storage (no copy). It's a bridge, not a general-purpose list.

**"`Arrays.asList` allows null elements; `List.of` doesn't — does that matter in practice?"** Yes: code that builds lists possibly containing null can't migrate blindly from `Arrays.asList` to `List.of`; the latter will NPE. People hit this when "modernizing" old code.

---

### End of Block 1 — Collections Framework.

**Block 2 (Multithreading)** continues next: thread lifecycle and state transitions, `Thread`/`Runnable`/`Callable`, `synchronized` at the bytecode and lock-escalation level, `volatile` and the Java Memory Model, `wait`/`notify`, `ThreadLocal` and its leak modes, interruption, daemon threads, and a dedicated section on Virtual Threads (Project Loom, Java 21).

---

# Java Deep-Dive Interview Guide — Block 2: Multithreading

> Continues Block 1. Same four-layer structure: **(1)** interview question, **(2)** 60–90s senior answer, **(3)** JDK / JMM / hardware internals, **(4)** tricky follow-ups and common errors.
> Transversal rule for this block: when behavior depends on the Java version, the differences are called out explicitly (8, 11, 17, 21).

---

## Thread lifecycle and state transitions

### Layer 1 — Interview question

_(Direct, then tricky)_ "List the states in `Thread.State` and tell me which method moves a thread into each one. Then a trap: a thread doing a blocking socket read — what state is it in, and does that surprise you?"

### Layer 2 — Senior answer

There are six states. `NEW` is a thread constructed but not started. `RUNNABLE` is started and either running or ready to run — the JVM does not distinguish "on CPU" from "waiting for CPU." `BLOCKED` is waiting to acquire a monitor lock to enter or re-enter a `synchronized` region. `WAITING` is `wait()` with no timeout, `join()` with no timeout, or `LockSupport.park()`. `TIMED_WAITING` is the timed versions: `sleep(ms)`, `wait(ms)`, `join(ms)`, `parkNanos`. `TERMINATED` is after `run()` completes. The trap: a thread blocked on a socket read is **`RUNNABLE`**, not `BLOCKED`. `BLOCKED` is specifically about Java monitor contention; the JVM has no separate state for OS-level I/O blocking, so I/O waits look `RUNNABLE` in a thread dump. That catches people who assume "blocked on something" maps to the `BLOCKED` state.

### Layer 3 — How it works inside

`Thread.State` is a coarse JVM-level abstraction; it does not mirror the underlying OS scheduler states (a platform thread maps 1:1 to an OS thread, which has its own running/ready/sleeping states the JVM doesn't expose). The mapping that matters for reading thread dumps:

- `NEW` → `RUNNABLE` on `start()` (which spawns the OS thread and eventually invokes `run()`).
- `RUNNABLE` → `BLOCKED` when the thread hits a `synchronized` block whose monitor is held by another thread. It returns to `RUNNABLE` when it acquires the monitor.
- `RUNNABLE` → `WAITING`/`TIMED_WAITING` via `wait`, `join`, `park`. The distinction between `BLOCKED` and `WAITING` is crucial in a dump: `BLOCKED` means "contending for a lock right now," `WAITING` means "voluntarily parked, will be woken by a signal." Diagnosing a deadlock vs a missed `notify` depends on telling these apart.
- Any waiting state → `RUNNABLE` on notify/interrupt/timeout/lock-release, then → `TERMINATED` when `run()` returns or throws.

Because I/O blocking is reported as `RUNNABLE`, a server with thousands of threads stuck reading sockets shows thousands of `RUNNABLE` threads — which is exactly the scalability problem virtual threads were built to solve (covered at the end of this block).

### Layer 4 — Tricky follow-ups

**"Can a thread go from `TERMINATED` back to `RUNNABLE` by calling `start()` again?"** No. Calling `start()` on a thread that has already been started throws `IllegalThreadStateException`. A `Thread` object is single-use; you can't restart it. This is why pools reuse worker threads by feeding them new tasks, not by restarting `Thread` objects.

**"Is `RUNNABLE` the same as 'currently executing on a core'?"** No — `RUNNABLE` covers both "on a CPU" and "ready but waiting for a core." The JVM can't tell you which from the state alone. This is the most common misread of thread dumps.

**"What state is a thread in during `Thread.yield()`?"** Still `RUNNABLE`. `yield` is a hint to the scheduler to give up the current time slice, not a state transition; the thread remains runnable and may be rescheduled immediately.

---

## Thread vs Runnable vs Callable

### Layer 1 — Interview question

_(Design reasoning)_ "If `Runnable` already existed, why did Java 5 introduce `Callable`? And why is implementing `Runnable` generally preferred over extending `Thread`?"

### Layer 2 — Senior answer

`Runnable.run()` returns `void` and can't throw checked exceptions, so a task that needs to _return a result_ or _signal a checked failure_ couldn't be expressed. `Callable<V>.call()` returns `V` and is declared `throws Exception`, which is exactly what the `ExecutorService`/`Future` model needs: submit a `Callable`, get a `Future<V>`, and retrieve the result or the wrapped exception later. So `Callable` exists to plug the result-and-exception gap that the executor framework opened up in Java 5. Separately, you implement `Runnable` (or `Callable`) rather than extend `Thread` because a task and the worker that runs it are different concerns — decoupling them lets you hand the task to a pool, reuse threads, and avoid burning your single inheritance slot on `Thread`.

### Layer 3 — How it works inside

`Runnable` is a functional interface with `void run()`. `Callable<V>` is a functional interface with `V call() throws Exception`. The bridge between them is `FutureTask`, which implements `Runnable` _and_ `Future<V>`: when you submit a `Callable` to an `ExecutorService`, it's wrapped in a `FutureTask` whose `run()` invokes `call()`, captures the return value or thrown exception into internal state, and transitions the task's state machine (NEW → COMPLETING → NORMAL/EXCEPTIONAL). A subsequent `future.get()` blocks (via `LockSupport.park`) until that state is terminal, then either returns the value or rethrows the captured exception wrapped in `ExecutionException`. This is also why a checked exception thrown inside `call()` surfaces at `get()` as `ExecutionException` rather than at submission time.

Extending `Thread` also conflates the _what_ (the work) with the _how_ (the execution vehicle). Implementing `Runnable`/`Callable` keeps the work as a plain object you can submit to any executor, schedule, or wrap — and it leaves your class free to extend something meaningful.

### Layer 4 — Tricky follow-ups

**"Can you pass a `Callable` to `new Thread(...)`?"** No — `Thread`'s constructor takes `Runnable`, not `Callable`. To run a `Callable` on a raw thread you wrap it in a `FutureTask` (which is `Runnable`) and pass that. In practice you just use an executor.

**"What happens to an exception thrown inside `Runnable.run()` on a raw thread?"** It propagates to the thread's `UncaughtExceptionHandler` (or the default, which prints to stderr) and the thread terminates. With a `Callable` in an executor, the exception is captured and re-thrown at `Future.get()` instead — a different and often-missed observability difference between raw threads and pools.

---

## `synchronized` at the bytecode and lock-escalation level

### Layer 1 — Interview question

_(Google-style, deep internals)_ "Walk me from the `synchronized` keyword down to what the CPU does. Include the bytecode, the object header, and how the JVM escalates a lock under contention."

### Layer 2 — Senior answer

A `synchronized` block compiles to `monitorenter`/`monitorexit` bytecodes around the body, acquiring the monitor associated with the lock object; a `synchronized` method instead carries an `ACC_SYNCHRONIZED` flag and the JVM acquires the monitor implicitly. The monitor lives in the object's header — specifically the _mark word_. The JVM doesn't jump straight to an OS mutex; it escalates. Under no contention it historically used _biased locking_ (assume the same thread re-enters, no atomic op), then _lightweight locking_ (a CAS to point the mark word at a lock record on the acquiring thread's stack — fast, no OS involvement), and only under real contention does it _inflate_ to _heavyweight locking_, a full `ObjectMonitor` backed by an OS mutex where contending threads actually block at the kernel level. The point of escalation is that uncontended `synchronized` is nearly free, and you only pay the kernel cost when threads genuinely fight over the lock.

### Layer 3 — How it works inside

**Bytecode.** A `synchronized(obj){ ... }` block emits `monitorenter` before the body and `monitorexit` after — and a _second_ `monitorexit` inside a compiler-generated exception handler, so the monitor is released even if the body throws. (That second exit is the bytecode-level reason `synchronized` is exception-safe without a `finally`.) A synchronized _method_ has no `monitorenter` bytecode at all; the `ACC_SYNCHRONIZED` access flag tells the JVM to acquire the receiver's monitor (or the `Class` object's, for static methods) on entry and release on return or exception.

**Object header and mark word.** Every object has a header: a _mark word_ and a _klass pointer_ (to its class metadata). The mark word is multiplexed — it stores the identity hash code, GC generational age, and lock state, reinterpreting its bits depending on the lock state encoded in its low _tag_ bits:

- _Unlocked / biased_ — historically held a thread ID (the biased owner) so a re-entering owner needs no atomic operation, just a check.
- _Lightweight (thin) locked_ — holds a pointer to a _lock record_ allocated on the owning thread's stack. Acquisition is a CAS that swaps the mark word for that pointer; if it succeeds the thread owns the lock with no kernel call. Re-entry by the same thread bumps a recursion count in the lock record.
- _Heavyweight (inflated)_ — holds a pointer to a heap-allocated `ObjectMonitor`. This happens when the CAS fails because another thread holds the lightweight lock — i.e. real contention. The `ObjectMonitor` has an owner, an entry list of `BLOCKED` threads, and a wait set for `wait()`. Contending threads block on an OS mutex (a futex on Linux), which means a kernel transition and a context switch.

**Escalation.** The path is biased → lightweight → heavyweight, and it's one-way per inflation episode (inflated monitors generally don't deflate back cheaply, though modern HotSpot can deflate idle monitors). The hardware primitive underneath lightweight acquisition is compare-and-swap (`lock cmpxchg` on x86); the heavyweight path uses the OS's blocking primitive.

**Version note — biased locking.** Biased locking was _deprecated and disabled by default in JDK 15_ (JEP 374) and is effectively gone in modern JDKs. The reason: it optimized a single-threaded-access pattern that became less common, and its bookkeeping (revocation when a second thread shows up) was expensive and complicated, especially with the rise of highly concurrent code and `java.util.concurrent` atomics. So on Java 17/21 you should describe the path as lightweight → heavyweight, and mention biased locking as historical (present and on-by-default through Java 8/11, off by default from 15+). Saying "biased locking is always the first step" on a Java 21 interview is now subtly wrong.

### Layer 4 — Tricky follow-ups

**"Why is uncontended `synchronized` sometimes as fast as `ReentrantLock`?"** Because the lightweight path is just a CAS on the mark word — no kernel call, no queue. Since Java 6 the JVM optimizes this heavily (and the JIT can even _elide_ locks it proves are thread-local via escape analysis, or _coarsen_ adjacent locks). So the old advice "always prefer `ReentrantLock` for speed" is outdated; you choose `ReentrantLock` for _features_ (tryLock, fairness, multiple conditions, interruptible acquisition), not raw speed.

**"What's lock elision and lock coarsening?"** _Elision_: if escape analysis proves a lock object never escapes the current thread (e.g. a local `StringBuffer`), the JIT removes the locking entirely. _Coarsening_: if the JIT sees repeated lock/unlock on the same monitor in a tight region, it merges them into one larger critical section to avoid repeated CAS churn. Both are why micro-benchmarks of `synchronized` are misleading.

**"Does `synchronized` guarantee memory visibility, or just mutual exclusion?"** Both. Releasing a monitor flushes writes and establishes a _happens-before_ edge to the next acquisition of the same monitor, so a thread entering the block sees everything the previous holder did. Mutual exclusion without the visibility guarantee would be useless — this links directly to the JMM section next.

---

## `volatile` and the Java Memory Model

### Layer 1 — Interview question

_(Tricky "what can go wrong")_ "I have a `boolean running` flag that one thread sets to false to stop another thread's loop. Without `volatile`, the loop sometimes never stops. Explain _precisely_ why, in terms of the memory model — not just 'caching.' Then tell me what `volatile` does and does not fix."

### Layer 2 — Senior answer

Without `volatile`, there is no _happens-before_ relationship between the writer setting `running = false` and the reader's repeated reads of it. The JMM permits the compiler and CPU to assume the field doesn't change within the loop, so the JIT can hoist the read out of the loop entirely — reading it once into a register and spinning forever. It's not just CPU cache staleness; it's a legal _optimization_ given the absence of synchronization. `volatile` fixes this by guaranteeing _visibility_ (a write is immediately visible to subsequent reads) and _ordering_ (it inserts memory barriers preventing reordering across the access), and it establishes happens-before edges. What `volatile` does **not** give you is _atomicity of compound operations_: `count++` on a `volatile` is still a read-modify-write that can interleave and lose updates. For that you need an atomic or a lock.

### Layer 3 — How it works inside

The JMM is defined in terms of _happens-before_, a partial order over memory actions. If action A happens-before action B, then A's effects are visible to B. The edges include: program order within a thread; monitor unlock → subsequent lock of the same monitor; `volatile` write → subsequent `volatile` read of the same field; `Thread.start()` → the started thread's first action; a thread's last action → another thread's successful `join()` on it; and `final` field freezes during construction. Without an edge between two actions, the JMM allows them to be observed in either order, or for one not to be observed at all.

For `volatile`, the compiler inserts _memory barriers_ (fences) that constrain reordering and force the write through to coherent memory:

- After a `volatile` write: a `StoreStore` barrier (no earlier store reorders after it) and a `StoreLoad` barrier (the write is globally visible before later loads). On x86 this typically lowers to a `lock`-prefixed instruction or an `mfence`, because x86's strong memory model already prevents most reorderings except store-load.
- Before a `volatile` read: a `LoadLoad` and `LoadStore` barrier (the read happens before subsequent loads/stores).

These barriers are why a `volatile` read sees the _latest_ write and why writes that happened-before the `volatile` write are also visible — `volatile` publishes not just its own field but everything ordered before it. That property is the entire basis of the double-checked locking fix (Block 3).

What it cannot do: `count++` decomposes into read, increment, write — three separate actions. `volatile` makes each individually visible but doesn't make the trio atomic, so two threads can both read 5, both write 6, and one increment is lost. The "lost update" is independent of visibility.

### Layer 4 — Tricky follow-ups

**"Is `volatile` enough for a counter incremented by many threads?"** No — the increment isn't atomic. Use `AtomicInteger` (CAS-based) or a lock. People over-trust `volatile` here constantly.

**"Does `volatile` create a happens-before only for the field itself?"** No — and this is the subtle, powerful part. A `volatile` write acts as a _release_: all writes the thread did _before_ it become visible to any thread that performs the matching `volatile` _read_ (an acquire). So you can publish a fully-constructed object by writing its reference to a `volatile` field. This is the mechanism behind safe publication.

**"On x86, reads and writes are mostly ordered already — so is `volatile` a no-op there?"** Not quite. x86 has a relatively strong model but still allows store-load reordering, so a `StoreLoad` barrier (the expensive one) is still emitted for `volatile` writes. And regardless of hardware, `volatile` also constrains the _compiler_, which would otherwise hoist or reorder independently of the CPU. The barrier story differs per architecture (ARM is weaker and needs more), but the JMM guarantee is the same everywhere — that portability is the point.

---

## `wait` / `notify` / `notifyAll`

### Layer 1 — Interview question

_(Tricky "this code is subtly wrong")_

```java
synchronized (lock) {
    if (!conditionMet) {   // BUG is here
        lock.wait();
    }
    proceed();
}
```

"What's wrong with this, and why does fixing it to a `while` loop matter even though logically the `if` 'looks' equivalent?"

### Layer 2 — Senior answer

The bug is the `if`. You must re-check the condition in a `while` loop, not an `if`, for two reasons. First, _spurious wakeups_: a thread can return from `wait()` without any `notify` — the spec explicitly permits it, and real JVMs/OSes do it. With an `if`, a spurious wakeup falls straight through to `proceed()` with the condition still false. Second, even with a real `notify`, by the time the woken thread reacquires the monitor, _another_ thread may have run and invalidated the condition again. The `while` re-tests after reacquiring the lock and goes back to waiting if needed. So the rule is absolute: always wait in a loop that re-checks the predicate. Also, all three of `wait`/`notify`/`notifyAll` require holding the object's monitor, or you get `IllegalMonitorStateException`.

### Layer 3 — How it works inside

`wait`, `notify`, `notifyAll` operate on an object's monitor and are intimately tied to it. When a thread calls `lock.wait()`:

1. It must already own `lock`'s monitor (hence the `synchronized` block) — otherwise `IllegalMonitorStateException`.
2. It atomically _releases_ the monitor and moves into the monitor's _wait set_, entering `WAITING` (or `TIMED_WAITING` for `wait(ms)`). Releasing is essential — otherwise no other thread could enter the `synchronized` block to change the condition and call `notify`.
3. On `notify`, _one_ arbitrary thread is moved from the wait set to the _entry set_; on `notifyAll`, _all_ are. Being notified does **not** mean running — the thread must now _re-acquire_ the monitor (compete in the entry set), which only frees up when the notifier exits its `synchronized` block. So there's always a gap between "notified" and "running," and during that gap the world can change. That gap is the second reason for the `while`.

`notifyAll` vs `notify`: `notify` wakes one waiter, chosen arbitrarily; if waiters are waiting on _different_ conditions sharing one monitor, `notify` can wake the "wrong" one, which rechecks, fails, and goes back to sleep — and the right one never wakes (a _lost wakeup_ / liveness bug). `notifyAll` wakes everyone so each rechecks its own predicate; it's safe by default at the cost of a thundering-herd of reacquisition contention. Prefer `notifyAll` unless you can prove all waiters wait on the identical condition.

### Layer 4 — Tricky follow-ups

**"Why does `wait()` release the lock but `sleep()` doesn't?"** Because `wait` is a _coordination_ primitive — it must release the monitor so another thread can change the shared state and notify. `Thread.sleep` is just a timed pause unrelated to any monitor; it holds whatever locks it has, which is a classic way to cause a deadlock if you `sleep` inside a `synchronized` block.

**"`wait` is on `Object`, not `Thread`. Why?"** Because waiting is associated with a _monitor_, and every object can be a monitor. The condition you're waiting on is conceptually a property of the shared object, so the wait set lives on the object. Putting it on `Thread` would misattribute the coordination to the wrong entity.

**"When would you use `Condition` from `java.util.concurrent.locks` instead?"** When you need _multiple_ independent wait queues on one lock — e.g. a bounded buffer with separate "notFull" and "notEmpty" conditions, so you can signal exactly the right group instead of `notifyAll`-ing everyone. A `ReentrantLock` can produce multiple `Condition`s; a single monitor can't. (Detailed in Block 3.)

---

## `ThreadLocal` and its leak modes

### Layer 1 — Interview question

_(Netflix-style, resilience/observability)_ "We use `ThreadLocal` to hold a per-request context in a thread-pooled server. What's the failure mode, why does it leak specifically in pools, and what's the discipline that prevents it?"

### Layer 2 — Senior answer

The danger is twofold: stale data and memory leaks, both amplified by pooling. Because pool threads are long-lived and reused across requests, a `ThreadLocal` set during request A and not cleared will still be there when the same thread serves request B — leaking data across requests (a correctness and sometimes security bug). And it leaks memory: the `ThreadLocal`'s _key_ is a weak reference, but the _value_ is a strong reference held by the thread's internal map, so even after the `ThreadLocal` object itself is collected, the value can linger for the life of the (long-lived) thread. The discipline is non-negotiable: always set in a `try` and `remove()` in a `finally`, so the value is cleared regardless of outcome. In Spring, this is exactly why filters that populate `ThreadLocal` context must clean it up after the request.

### Layer 3 — How it works inside

Each `Thread` has a field `ThreadLocal.ThreadLocalMap threadLocals`. A `ThreadLocal` instance is not a container — it's a _key_ into each thread's own map. `get()` does `currentThread().threadLocals.get(this)`. The map's `Entry` extends `WeakReference<ThreadLocal<?>>`: the _key_ (the `ThreadLocal` object) is weakly referenced, but the _value_ is an ordinary strong field on the entry.

This asymmetry is the leak mechanism. Suppose the `ThreadLocal` object becomes unreachable elsewhere — the weak key lets it be GC'd, leaving an entry whose key is now `null` but whose value is still strongly held by the map, which is strongly held by the still-alive pool thread. That value can't be collected until something clears the entry. `ThreadLocalMap` does _opportunistic_ cleanup of these stale (null-key) entries during `get`/`set`/`remove` (it scans and expunges some on the way), but that cleanup is not guaranteed to run for any particular entry, especially if the thread never touches that `ThreadLocal` again. So values can survive far longer than intended — in a pool, effectively forever. Calling `remove()` explicitly deletes the entry and is the only reliable fix.

The weak key was a deliberate design compromise: making the _value_ weak too would let values vanish while still logically in use; making the _key_ strong would leak the `ThreadLocal` class/loader (a classic web-app redeploy leak). Weak key + strong value + opportunistic expunge is the chosen trade-off, and it's why the API documentation and every framework push `remove()` so hard.

### Layer 4 — Tricky follow-ups

**"If the key is weak, why doesn't the value just get collected automatically?"** Because the value is reachable through a _strong_ chain: live thread → its `threadLocals` map → entry → value. The weak reference only governs the key. Garbage collection follows strong references; the value isn't garbage as long as that chain holds.

**"`InheritableThreadLocal` — what does it add and what's its trap?"** It copies values from a parent thread to a child thread at child-creation time. The trap is that in a thread _pool_, worker threads were created long ago (not as children of the request thread), so inheritance doesn't happen per request — and worse, a stale inherited value can be wrong. It's a footgun in pooled environments.

**"With virtual threads, is `ThreadLocal` still appropriate?"** Less so. You can have millions of virtual threads, and a `ThreadLocal` value per virtual thread can blow up memory; also the typical reason for `ThreadLocal` (avoiding the cost of creating threads) doesn't apply when threads are cheap. The modern replacement is `ScopedValue` (JEP, preview in Java 21), which is immutable, scoped to a dynamic extent, and doesn't have the leak/teardown burden — covered in the virtual threads section.

---

## `Thread.interrupt()` and interruption discipline

### Layer 1 — Interview question

_(Tricky, "this is a bug you'll see in code review")_

```java
try {
    Thread.sleep(1000);
} catch (InterruptedException e) {
    // swallowed
}
```

"What's wrong with this catch block, and what are the two correct things to do instead?"

### Layer 2 — Senior answer

Swallowing `InterruptedException` is almost always a bug. When `sleep`/`wait`/`join`/blocking-queue operations throw it, they _clear_ the thread's interrupt flag as part of throwing. So if you catch it and do nothing, you've erased the only signal that someone asked this thread to stop — code higher up the stack can no longer tell it was interrupted, and a cancellation or shutdown won't propagate. The two correct responses are: either _propagate_ the `InterruptedException` (let it bubble up to a caller that knows how to handle cancellation), or, if you genuinely can't propagate it, _restore the flag_ with `Thread.currentThread().interrupt()` so the interrupted status survives and outer loops/checks can observe it. Doing neither breaks cooperative cancellation.

### Layer 3 — How it works inside

Interruption in Java is _cooperative_, not preemptive — `interrupt()` does not stop a thread; it sets a boolean _interrupt status flag_ on the target. What you do with that flag is up to the code:

- Blocking methods that declare `throws InterruptedException` (`Thread.sleep`, `Object.wait`, `Thread.join`, `BlockingQueue.take`, `Lock.lockInterruptibly`, NIO interruptible channels) _poll_ the flag, and when set, they _clear it and throw_ `InterruptedException`. The clearing is why swallowing it is so destructive: the exception _is_ the flag, transformed.
- `Thread.isInterrupted()` reads the flag _without_ clearing it. `Thread.interrupted()` (static) reads _and clears_ it — easy to confuse, and using `interrupted()` when you meant `isInterrupted()` accidentally resets the status.
- Tight CPU-bound loops that never call a blocking method won't be interrupted automatically; they must _poll_ `Thread.currentThread().isInterrupted()` and break out themselves. This is why a runaway compute loop ignores `interrupt()` — there's no blocking call to deliver it through.

`Thread.stop()` (preemptive kill) is deprecated and dangerous because it can leave shared state half-mutated and locks in inconsistent shapes; cooperative interruption replaced it precisely so threads can stop at safe points.

### Layer 4 — Tricky follow-ups

**"Difference between `isInterrupted()` and `interrupted()`?"** `isInterrupted()` is an instance method that checks without clearing. `interrupted()` is static, checks the _current_ thread, and _clears_ the flag. Calling `interrupted()` twice in a row will return `true` then `false`. Mixing them up causes subtle "interruption disappeared" bugs.

**"Why doesn't `interrupt()` stop a `while(true){}` loop?"** Because interruption only acts at points that check the flag — blocking methods that throw, or explicit polling. A pure CPU loop with no such point never observes it. The fix is to add `if (Thread.currentThread().isInterrupted()) break;` inside the loop.

**"How does `Future.cancel(true)` relate to this?"** `cancel(true)` interrupts the worker thread running the task. The task only actually stops if its code respects interruption (throws or polls). So cancellation is best-effort and depends on the task being written interruptibly — a Netflix-style resilience point: cancellation guarantees nothing if the task swallows interrupts.

---

## Daemon vs user threads and JVM shutdown

### Layer 1 — Interview question

_(Direct, then situational)_ "What's the difference between a daemon and a user thread, and what determines when the JVM exits? Then: I start a background scheduler thread and my `main` returns, but the JVM hangs forever. Why, and how do I fix it?"

### Layer 2 — Senior answer

The JVM stays alive as long as at least one _non-daemon_ (user) thread is running; it exits when the last user thread finishes, _abandoning_ any daemon threads abruptly. `main` is a user thread. So if your scheduler thread is a user thread and never terminates, the JVM hangs after `main` returns because that user thread keeps it alive. The fix is to mark the scheduler thread as a daemon (`setDaemon(true)` before `start()`), so it doesn't block shutdown — or to explicitly shut it down. Daemon status is for background/support threads (GC, schedulers, monitoring) that should never keep the application alive on their own.

### Layer 3 — How it works inside

Each thread carries a `daemon` flag, inherited from the thread that created it (so a thread spawned by a daemon is daemon by default). `setDaemon(true)` must be called _before_ `start()` — calling it on a running thread throws `IllegalThreadStateException`, because the daemon/user distinction affects shutdown accounting that's fixed at start time. The JVM's main loop keeps a count of live non-daemon threads; when it hits zero, the JVM begins shutdown. Crucially, daemon threads are _not_ given a chance to finish — they're stopped wherever they are, `finally` blocks may not run, and resources may not be cleanly released. That's the cost of daemon status: never put work that must complete (flushing a buffer, committing a transaction) solely in a daemon thread.

Executor pools matter here: by default `Executors`-created threads are _user_ (non-daemon) threads, so a pool you forget to `shutdown()` will keep the JVM alive after `main` returns — the exact "JVM won't exit" symptom. Either supply a `ThreadFactory` that sets daemon, or (better) shut the pool down explicitly. `Runtime.addShutdownHook` registers cleanup that runs during shutdown, but hooks themselves run as threads and must be fast and deadlock-free.

### Layer 4 — Tricky follow-ups

**"Will a daemon thread's `finally` block always run?"** No. If the JVM exits because the last user thread finished, daemon threads are terminated abruptly and their `finally` blocks may never execute. Relying on a daemon's `finally` for cleanup is unsafe.

**"Why must `setDaemon` be called before `start`?"** Because the JVM's live-thread accounting (which decides shutdown) is determined when the thread starts; changing daemon status mid-flight would corrupt that accounting, so the API forbids it with `IllegalThreadStateException`.

**"My Spring Boot app won't shut down cleanly — what's a common cause tied to this?"** A non-daemon thread or an executor pool that's never shut down keeps the JVM alive. The fix is lifecycle management — `@PreDestroy`/`DisposableBean` to shut pools down, or daemon thread factories for truly background work.

---

## Virtual Threads (Project Loom, Java 21)

### Layer 1 — Interview question

_(Meta/Netflix-style, modern system design)_ "What are virtual threads, how do they relate to carrier threads, what is pinning and why is it bad, and when would you reach for them instead of reactive programming?"

### Layer 2 — Senior answer

Virtual threads (finalized in Java 21, JEP 444) are lightweight threads scheduled by the JVM rather than the OS. Many virtual threads run on a small pool of OS-level _carrier threads_ (platform threads, by default a `ForkJoinPool`). When a virtual thread blocks on I/O, the JVM _unmounts_ it from its carrier — saving its stack as a _continuation_ — and frees the carrier to run another virtual thread; when the I/O completes, the virtual thread is _mounted_ back onto some carrier and resumes. This lets you write straightforward _blocking_ code and still handle millions of concurrent tasks, because a blocked virtual thread costs almost nothing (no parked OS thread). _Pinning_ is when a virtual thread is blocked but _cannot_ unmount — it holds its carrier hostage, defeating the whole point; the classic causes are blocking inside a `synchronized` block and blocking in native/JNI code. You reach for virtual threads over reactive programming when the workload is _I/O-bound_ and you want the simplicity and debuggability of imperative, blocking code without the cognitive overhead of reactive operator chains — same scalability, far less complexity. For _CPU-bound_ work, virtual threads don't help (you're limited by cores, not by thread count), and reactive's value is different (backpressure, streaming).

### Layer 3 — How it works inside

A virtual thread is a `Thread` whose continuation (its call stack) lives on the _heap_, not pinned to an OS thread's native stack. The JVM's `VirtualThread` scheduler (default: a dedicated `ForkJoinPool` of carriers, sized to available processors) mounts a virtual thread onto a carrier to run it. The machinery:

- _Mounting_: copy/activate the virtual thread's continuation onto a carrier and execute. While mounted, `Thread.currentThread()` returns the virtual thread; the carrier is hidden.
- _Unmounting_: at a _blocking point_ the JDK recognizes (most `java.util.concurrent` blocking, `java.net`/NIO socket I/O, `Thread.sleep`, etc.), the runtime _parks_ the virtual thread by capturing its continuation back to the heap and releasing the carrier to the scheduler. No OS thread is blocked.
- _Resumption_: when the blocking operation completes (e.g. the selector reports the socket is ready), the virtual thread is rescheduled onto an available carrier and the continuation resumes exactly where it left off.

_Pinning_ happens when the runtime cannot unmount because the native stack frames can't be safely suspended:

- Inside a `synchronized` block/method — the monitor ownership is tied to the carrier's native frame, so the virtual thread can't unmount while holding it. In Java 21 this pins the carrier for the duration of the blocking call.
- Inside a native (JNI) call or a `foreign` downcall — the JVM can't capture native frames into a continuation.

Pinning is harmful because a pinned carrier is an OS thread you've taken out of circulation; enough simultaneous pins and you starve the carrier pool, reintroducing exactly the thread-exhaustion problem virtual threads were meant to eliminate. The Java 21 guidance was therefore to replace `synchronized` around blocking I/O with `ReentrantLock`, which parks at the Java level and unmounts cleanly.

**Version note (important to be current):** the `synchronized`-pinning limitation was specifically addressed in **JDK 24 (JEP 491, "Synchronize Virtual Threads without Pinning")**, after which blocking inside `synchronized` no longer pins the carrier in the common cases. So if asked on a current interview: "in Java 21, `synchronized` around blocking calls pins; as of JDK 24 that was fixed, but native/JNI frames can still pin." Stating the 21 behavior as if it were permanent is now out of date.

_ThreadLocal with virtual threads_: still works, but with millions of virtual threads the per-thread copies can balloon memory and the usual `ThreadLocal` rationale (amortizing expensive thread creation) no longer applies. The intended successor is `ScopedValue` (JEP 446, preview in 21): an immutable value bound for a bounded dynamic scope (`ScopedValue.where(V, value).run(task)`), which is cheaper, inherited cleanly by structured child tasks, and impossible to leak because it's unbound when the scope exits.

### Layer 4 — Tricky follow-ups

**"Do virtual threads make CPU-bound work faster?"** No. They multiplex _blocked_ tasks onto few carriers; they don't add cores. CPU-bound work is bounded by parallelism, so a sized platform-thread pool (or `ForkJoinPool`) is the right tool, and spawning millions of virtual threads for CPU work just adds scheduling overhead. This is the most common misconception.

**"Should you pool virtual threads the way you pool platform threads?"** No — that's an anti-pattern. Virtual threads are cheap and disposable; you create one per task (`Executors.newVirtualThreadPerTaskExecutor()`) and let it die. Pooling them reintroduces the very constraint they remove and breaks per-task `ThreadLocal`/`ScopedValue` semantics.

**"How is this different from reactive (e.g. Reactor/WebFlux)?"** Reactive achieves scalability by _never blocking_ a thread — you compose async callbacks/operators and the framework manages a small event loop, but you pay in code complexity, hard-to-read stack traces, and a steep learning curve. Virtual threads achieve the _same_ scalability by making blocking cheap, so you keep simple imperative code, real stack traces, and ordinary debuggers/profilers. Reactive still wins where you need rich streaming and backpressure semantics; for plain "handle lots of concurrent I/O-bound requests," virtual threads are simpler. Saying one strictly dominates is the trap — name the trade-off.

**"A virtual thread is `RUNNABLE` in a dump but doing nothing — what's happening?"** It may be unmounted/parked waiting on I/O; thread-dump tooling evolved across 21+ to represent virtual threads, and an unmounted virtual thread isn't occupying a carrier. The mental model from the lifecycle section (I/O blocking shows as `RUNNABLE`) is exactly what virtual threads optimize away at the carrier level.

---

### End of Block 2 — Multithreading.

**Block 3 (Advanced Concurrency)** continues next: atomics and CAS at the hardware level (`cmpxchg`, LL/SC), `Unsafe`/`VarHandle`, the ABA problem and `AtomicStampedReference`, `LongAdder`/`Striped64`; the lock family (`ReentrantLock`, `ReentrantReadWriteLock`, `StampedLock`) and `AQS`; synchronizers (`CountDownLatch`, `CyclicBarrier`, `Semaphore`, `Phaser`, `Exchanger`); concurrent collections (`ConcurrentHashMap` 7→8 evolution, `CopyOnWriteArrayList`, `ConcurrentLinkedQueue`, the `BlockingQueue` family, `ConcurrentSkipListMap`); the `Executor` framework (`ThreadPoolExecutor`'s 7 parameters and 4 rejection policies, `ForkJoinPool` work-stealing, `CompletableFuture`); and patterns/traps (producer-consumer, double-checked locking, deadlock's four Coffman conditions, livelock/starvation, false sharing and `@Contended`).

---

# Java Deep-Dive Interview Guide — Block 3 (Part A): Atomics, Locks, AQS, Synchronizers

> Continues Blocks 1–2. Four-layer structure throughout. Part B (concurrent collections, executors, patterns/traps) follows separately.

---

## Atomic variables and CAS at the hardware level

### Layer 1 — Interview question

_(Google-style, down to the metal)_ "`AtomicInteger.incrementAndGet()` is lock-free and thread-safe. Explain how that's possible without a lock — go all the way down to the CPU instruction. What does the JVM emit, and what's the failure-and-retry behavior?"

### Layer 2 — Senior answer

It's built on _compare-and-swap_ (CAS), a single atomic hardware instruction. `incrementAndGet` reads the current value, computes value+1, then atomically does "if memory still equals the value I read, write value+1; otherwise fail." If another thread changed it in between, the CAS fails and the operation _retries_ in a loop until it succeeds. There's no lock and no blocking — just an optimistic read-modify-write that spins on contention. On x86 the JVM emits a `lock cmpxchg` instruction; on ARM it's a load-linked/store-conditional pair (`ldxr`/`stxr`). The trade-off versus a lock: under low-to-moderate contention CAS is far faster (no kernel transition, no context switch), but under _very_ high contention the retry loop wastes CPU as threads keep failing and re-spinning — which is exactly the problem `LongAdder` solves.

### Layer 3 — How it works inside

`AtomicInteger` holds a `volatile int value` and performs updates through a CAS intrinsic. The canonical loop (conceptually):

```java
public final int incrementAndGet() {
    int prev, next;
    do {
        prev = get();          // volatile read of current value
        next = prev + 1;
    } while (!compareAndSet(prev, next));  // CAS: succeeds only if value still == prev
    return next;
}
```

`compareAndSet(expected, new)` is a JVM _intrinsic_: the JIT replaces it with the platform's atomic CAS instruction rather than a method call.

**x86 — `cmpxchg`.** The `cmpxchg` instruction compares the accumulator (`EAX`) with a memory operand; if equal, it stores the source operand and sets the zero flag. To make it atomic across cores it's prefixed with `lock`, which asserts exclusive ownership of the cache line for the duration (cache-line locking via the coherence protocol, not a full bus lock on modern CPUs). The `lock` prefix also acts as a full memory barrier — which is why CAS gives you ordering as well as atomicity.

**ARM — LL/SC.** ARM (and other RISC) use _load-linked / store-conditional_: `ldxr` loads and sets a monitor on the address; `stxr` stores only if no other write to that address occurred since the load, returning success/failure. The JVM wraps this in a retry loop. LL/SC can suffer _spurious_ failures (the monitor can be cleared by unrelated events like a context switch), which is one reason there's both a strong `compareAndSet` and a `weakCompareAndSet` — the weak form is allowed to fail spuriously and is cheaper inside an already-retrying loop.

The `volatile value` matters independently: it guarantees that the read at the top of the loop sees the latest write and that the successful CAS publishes the new value with proper happens-before ordering. CAS gives atomicity; the volatile semantics give visibility — together they make the atomic safe.

### Layer 4 — Tricky follow-ups

**"Is CAS always faster than a lock?"** No. Under high contention many threads CAS, all but one fail, and they spin and retry — burning CPU with no progress (a form of livelock-adjacent waste). At that point a lock that _parks_ contending threads can be more efficient because parked threads don't burn cycles. The crossover is why `LongAdder` exists for hot counters.

**"What's `weakCompareAndSet` and when do you use it?"** It's a CAS permitted to fail _spuriously_ (return false even when the value matched), which lets the JVM emit cheaper code on LL/SC architectures. It's only safe inside a loop that retries anyway. Using it where you expect a single definitive attempt is a bug.

**"Does CAS solve all lock-free needs?"** No — single-word CAS can't atomically update two independent locations, and it's vulnerable to the ABA problem (next section). Multi-location atomicity needs either a wider primitive, a versioned reference, or careful algorithm design (e.g. Michael-Scott queue).

---

## `Unsafe`, `VarHandle`, and the evolution of low-level access

### Layer 1 — Interview question

_(Situational, modern Java)_ "Older lock-free code uses `sun.misc.Unsafe`. What replaced it and why, and what does the replacement give you that a plain `volatile` field doesn't?"

### Layer 2 — Senior answer

`sun.misc.Unsafe` was the internal, unsupported API the JDK used for CAS, off-heap memory, and direct field access — powerful but dangerous (no bounds checks, can corrupt the heap) and never meant to be public. Java 9 introduced `VarHandle` (in `java.lang.invoke`) as the supported, safer replacement for atomic field and array access. A `VarHandle` lets you perform atomic and ordered operations — `compareAndSet`, `getAndAdd`, `getAcquire`, `setRelease`, `getVolatile` — on a specific field or array element with explicitly chosen _memory-ordering modes_, which a plain `volatile` field can't express (a `volatile` field is "always volatile"; a `VarHandle` lets you pick plain, opaque, acquire/release, or volatile per access). That fine-grained control matters for high-performance lock-free structures where full `volatile` ordering on every access is overkill.

### Layer 3 — How it works inside

A `VarHandle` is a typed reference to a variable (instance field, static field, or array element) obtained via `MethodHandles.lookup().findVarHandle(...)`. It exposes _access modes_ grouped by ordering strength:

- _Plain_ (`get`/`set`) — no ordering guarantees, like a normal field access.
- _Opaque_ — atomicity and coherence (no out-of-thin-air, per-variable order) but no inter-variable ordering.
- _Acquire/Release_ (`getAcquire`/`setRelease`) — one-directional barriers: a release write isn't reordered before prior accesses; an acquire read isn't reordered after subsequent accesses. Cheaper than full volatile because they don't impose the expensive `StoreLoad` fence.
- _Volatile_ (`getVolatile`/`setVolatile`/`compareAndSet`) — full sequential-consistency-style ordering, same as a `volatile` field.

Internally `VarHandle` operations are JIT intrinsics that lower to the same CAS/barrier instructions `Unsafe` used, but with type checking and a supported API surface. The classic migration is replacing a `private static final Unsafe U; long offset; U.compareAndSwapInt(this, offset, e, n)` with a `private static final VarHandle VALUE; VALUE.compareAndSet(this, e, n)`. The JDK's own `Atomic*`, `ConcurrentHashMap`, and `LongAdder` were rewritten onto `VarHandle`.

### Layer 4 — Tricky follow-ups

**"Why was making `Unsafe` public never an option?"** Because it bypasses the JVM's safety guarantees — arbitrary memory addressing, no bounds or type checks — so a bug can crash the JVM or corrupt the heap silently. `VarHandle` (and the Foreign Function & Memory API for off-heap) provide the _capabilities_ people needed from `Unsafe` within a checked, supported model, which is what allowed the module system to start hiding `Unsafe`.

**"When would acquire/release be enough instead of volatile?"** In a producer/consumer publish where you only need 'everything the writer did before the release is visible to a reader that does the matching acquire' — a one-way ordering. You skip the full `StoreLoad` fence that `volatile` writes impose, which is the expensive barrier on x86. It's an optimization for hot paths in lock-free code, not something you'd reach for in ordinary application code.

---

## The ABA problem and `AtomicStampedReference` / `AtomicMarkableReference`

### Layer 1 — Interview question

_(Tricky, "why did this lock-free stack corrupt?")_ "A lock-free stack uses CAS on the head pointer. Under concurrency it occasionally loses nodes or resurrects freed ones, even though every CAS 'succeeded.' What's happening and how do you fix it?"

### Layer 2 — Senior answer

That's the _ABA problem_. CAS only checks that the value _equals_ what you read — it can't tell that the value changed from A to B and back to A in between. In a lock-free stack, thread 1 reads head = A and prepares to CAS head from A to A.next. Meanwhile thread 2 pops A, pops A.next, and pushes A back. Now head is A again, so thread 1's CAS _succeeds_ — but A.next is now stale/freed, so the structure is corrupted. The reference value matched while the underlying state changed out from under it. The fix is to attach a _version stamp_ that increments on every change, so CAS compares (reference, stamp) as a pair: `AtomicStampedReference` does exactly this. A stamp that bumps on each modification makes the second "A" distinguishable from the first.

### Layer 3 — How it works inside

ABA exists because single-word CAS is _memoryless_ about intermediate states — it's a snapshot equality test, not a "was this untouched?" test. Two tools address it:

- **`AtomicStampedReference<V>`** pairs a reference with an `int` stamp. Operations like `compareAndSet(expectedRef, newRef, expectedStamp, newStamp)` succeed only if _both_ the reference and the stamp match. You increment the stamp on every mutation, so an A→B→A cycle leaves a different stamp, and the stale CAS fails as it should. Internally it boxes the (reference, stamp) into a single immutable `Pair` object and CASes the _pair reference_ atomically — so the two fields are updated together as one word.
- **`AtomicMarkableReference<V>`** pairs a reference with a single `boolean` mark instead of a counter. It's used when you only need a one-bit flag alongside the reference — classically to mark a node as "logically deleted" in lock-free linked structures (e.g. Harris's linked list), where you don't need a full version count, just "is this node tombstoned?"

The boxing into a `Pair` is the key mechanism: hardware CAS is single-word, so to atomically compare two logical fields you make them one object and CAS the pointer to it. The cost is an allocation per update (the new `Pair`), which is the trade-off versus a raw `AtomicReference`.

### Layer 4 — Tricky follow-ups

**"Does ABA matter for an `AtomicInteger` counter?"** Usually not. If you only care about the final numeric value (incrementing a counter), an A→B→A cycle is semantically fine — the number is the number. ABA bites when the value is a _reference whose identity implies structural assumptions_ (like 'A.next is still valid'), which is why it's a lock-free _data structure_ problem, not a counter problem.

**"Why use `AtomicMarkableReference` instead of `AtomicStampedReference`?"** When you need a single status bit, not a version history — e.g. marking a node deleted. The mark is cheaper conceptually and matches algorithms that combine 'change the reference' and 'flag this node' into one atomic step. Using a stamp where a mark suffices over-engineers it.

**"Do garbage-collected languages avoid ABA?"** GC mitigates the _specific_ form where freed memory is reused at the same address (since the GC won't reclaim a node you still reference), but ABA can still occur logically — a node legitimately removed and re-added, or a value cycling back — so you can't assume GC alone makes lock-free code ABA-safe. It reduces but doesn't eliminate the hazard.

---

## `LongAdder` / `DoubleAdder` and `Striped64`

### Layer 1 — Interview question

_(Netflix/Amazon-style, scale)_ "We have a metrics counter hammered by hundreds of threads. `AtomicLong.incrementAndGet()` became a bottleneck. Why, and what would you replace it with?"

### Layer 2 — Senior answer

The bottleneck is _contention on a single memory location_. Every thread CASes the same `AtomicLong` field, so under high write contention most CAS attempts fail and retry, and the cache line holding the value ping-pongs between cores (cache-line bouncing). `LongAdder` fixes this by _striping_ the count across multiple internal cells: each thread hashes to a cell and CASes _its own_ cell, so writers rarely collide, and the cache-line contention is spread out. You read the total with `sum()`, which adds the base plus all cells. The trade-offs: `LongAdder` uses more memory (an array of padded cells) and `sum()` is not a perfectly atomic snapshot — but for a high-write, occasionally-read counter (exactly the metrics case), it scales far better than `AtomicLong`.

### Layer 3 — How it works inside

`LongAdder` extends `Striped64`, the shared machinery for striped 64-bit accumulators. The design:

- A `base` field handled with plain CAS in the _uncontended_ case — if a single thread is incrementing, it just CASes `base` and never allocates cells, so low-contention behavior matches `AtomicLong`.
- When a CAS on `base` _fails_ (contention detected), `Striped64` lazily allocates a `Cell[]` array. Each thread gets a per-thread probe hash (stored in the thread, similar to a `ThreadLocalRandom` seed) that maps it to a cell index; it CASes its own cell. If a thread's cell is also contended, the probe is rehashed and the array can grow (up to roughly the number of CPUs), spreading writers further.
- `Cell` is annotated `@jdk.internal.vm.annotation.Contended`, which pads it so each cell sits on its own cache line. Without padding, adjacent cells would share a cache line and you'd reintroduce _false sharing_ — the contention you were trying to escape. The padding is the whole reason striping helps.
- `sum()` returns `base` plus the sum of all non-null cells. It reads each cell with volatile semantics but is _not_ a locked atomic snapshot: concurrent updates during the sum may or may not be included, so the result is accurate only if no concurrent updates, otherwise an effectively-eventually-consistent total.

`DoubleAdder` is the same on `Striped64` but stores `double` bits (via `Double.doubleToRawLongBits`) since CAS is integer-based.

### Layer 4 — Tricky follow-ups

**"When is `AtomicLong` still the better choice?"** When you need an _exact, atomic read_ frequently (not just at the end), or when contention is low. `AtomicLong.get()` is an exact instantaneous value; `LongAdder.sum()` isn't a precise snapshot under concurrent writes. Also if you need `compareAndSet`/`getAndUpdate` semantics on the value, `LongAdder` doesn't offer them — it's an accumulator, not a general atomic.

**"What's false sharing and why does `@Contended` appear here?"** False sharing is when two independent variables sit on the _same_ cache line, so a write to one invalidates the other's cached copy on other cores, causing coherence traffic even though the variables are logically unrelated. `@Contended` pads the `Cell` so each occupies its own line, eliminating that. It's the same concept covered in Part B's false-sharing trap — and `LongAdder` is the JDK's flagship use of it.

**"Does `LongAdder` guarantee the count is never lost?"** Each individual `add` is durable (CAS succeeds or retries), so no increment is lost. What's 'soft' is only the _timing_ of when `sum()` observes them, not whether they're counted. Don't conflate 'sum isn't a snapshot' with 'updates get dropped.'

---

## `ReentrantLock` vs `synchronized`

### Layer 1 — Interview question

_(Design/trade-off)_ "Since Java 6, `synchronized` is fast. So why does `ReentrantLock` exist? Give me concrete capabilities it has that `synchronized` can't express."

### Layer 2 — Senior answer

You choose `ReentrantLock` for _features_, not speed — uncontended `synchronized` is comparably fast thanks to JVM optimizations. The capabilities `synchronized` simply can't express: `tryLock()` (acquire only if free, never block) and `tryLock(timeout)` (give up after a bounded wait, essential for deadlock-avoidance and resilience); `lockInterruptibly()` (a thread waiting for the lock can be interrupted/cancelled, whereas a thread blocked on `synchronized` cannot); optional _fairness_ (FIFO ordering of waiters, versus `synchronized`'s barging); and _multiple `Condition` objects_ per lock, so you can have separate wait queues (e.g. notFull / notEmpty) and signal precisely instead of `notifyAll`-ing everyone. The cost is discipline: you must `unlock()` in a `finally`, because unlike `synchronized` the JVM won't release it for you on exception or early return.

### Layer 3 — How it works inside

`ReentrantLock` is built on `AbstractQueuedSynchronizer` (AQS — next section). Its AQS `state` is the _hold count_: 0 means free, n>0 means held with n reentrant acquisitions by the owner thread (stored separately). `lock()` tries a CAS to move state 0→1; on success it records the owner. _Reentrancy_: if the current thread already owns it, `lock()` just increments state (no CAS contention), and each `unlock()` decrements until state hits 0, at which point the owner is cleared and a queued waiter is signaled. This hold-count model is exactly why it's called _reentrant_ — the same thread can acquire it multiple times without deadlocking itself, just like `synchronized`.

_Fairness_: a fair `ReentrantLock` (constructed with `true`) checks, before acquiring, whether other threads have been waiting longer (via the AQS queue) and yields to them — strict FIFO. The default _non-fair_ lock allows _barging_: a thread can grab a just-released lock even if others are queued, which gives higher throughput (fewer context switches, better cache locality) at the cost of possible (bounded) unfairness. `synchronized` is effectively always non-fair/barging, which is part of why it's fast.

You must release in `finally`:

```java
lock.lock();
try {
    // critical section
} finally {
    lock.unlock();  // mandatory — JVM won't auto-release
}
```

Forgetting this on an exception path leaks the lock and deadlocks everything waiting on it — the single most common `ReentrantLock` bug.

### Layer 4 — Tricky follow-ups

**"Is a fair lock always better because it's 'fair'?"** No. Fairness has real throughput cost: it forces handoff to the longest-waiting thread, causing more context switches and worse cache behavior, and it can drastically lower throughput under contention. You use fair locks only when starvation is a concrete risk you must prevent; otherwise non-fair is the right default — which is why it _is_ the default.

**"Can you check if a `ReentrantLock` is held before acquiring?"** `isLocked()` / `isHeldByCurrentThread()` exist, but using them to make acquire decisions is a check-then-act race. The correct non-blocking pattern is `tryLock()`, which atomically tests and acquires.

**"Why is forgetting `unlock()` worse than any `synchronized` mistake?"** Because `synchronized` releases automatically at block exit _including on exception_ (the compiler-generated `monitorexit` in the exception handler from Block 2). `ReentrantLock` has no such safety net — a missing `finally` means the lock is held forever. The explicit nature is the price of the extra features.

---

## `ReentrantReadWriteLock`

### Layer 1 — Interview question

_(Situational, then trap)_ "I have data read by many threads and written rarely. I use `ReentrantReadWriteLock`. Two questions: what does it buy me, and what's writer starvation — and can I upgrade a read lock to a write lock?"

### Layer 2 — Senior answer

It lets _multiple readers_ hold the read lock simultaneously as long as no writer holds the write lock, and gives a writer _exclusive_ access. For read-heavy data that's a big throughput win over a plain mutex, since readers don't block each other. _Writer starvation_ is the risk that, under a steady stream of readers, a waiting writer never gets a turn because there's always at least one reader holding the lock — the non-fair policy can let readers keep barging in ahead of the queued writer. The fair policy mitigates it by queuing. And the trap: you _cannot upgrade_ a read lock to a write lock — if you hold the read lock and try to acquire the write lock, you deadlock (the write lock waits for all readers, including you, to release). _Downgrading_ (acquire write, then acquire read, then release write) _is_ allowed and is the supported pattern.

### Layer 3 — How it works inside

`ReentrantReadWriteLock` is built on a single AQS instance whose 32-bit `state` is _split_: the high 16 bits count the number of _shared_ (read) holds, the low 16 bits the _exclusive_ (write) reentrant hold count. This is why it uses AQS in _both_ modes — read acquisition goes through `acquireShared`/`tryAcquireShared` (increment the high bits if no writer), write acquisition through `acquire`/`tryAcquire` (set the low bits only if no readers and no other writer). Per-thread read hold counts are tracked in a `ThreadLocal` so a thread can reenter the read lock and release the right number of times.

_Writer starvation and fairness_: in non-fair mode, when the write lock is released and both readers and a writer are queued, readers can be granted en masse, repeatedly, starving the writer. The fair (FIFO) constructor option grants in arrival order, so a queued writer eventually wins. There's also a small anti-starvation heuristic in non-fair mode where an incoming reader will _not_ barge if the head of the queue is a waiting writer, which reduces (not eliminates) the problem.

_No upgrade, yes downgrade_: upgrading is forbidden because two readers each trying to upgrade would each wait for the other to release its read hold — a guaranteed deadlock — so the lock simply doesn't allow acquiring write while holding read. Downgrading is safe because you start with exclusive access and _narrow_ it, so no one else can have sneaked in:

```java
rwLock.writeLock().lock();
try {
    mutate();
    rwLock.readLock().lock();   // acquire read BEFORE releasing write — downgrade
} finally {
    rwLock.writeLock().unlock(); // now downgraded to read-only; readers can join
}
try {
    read();
} finally {
    rwLock.readLock().unlock();
}
```

### Layer 4 — Tricky follow-ups

**"When does `ReentrantReadWriteLock` _lose_ to a plain lock?"** When writes are frequent or critical sections are tiny. The bookkeeping for tracking shared holders has overhead, and frequent writers mean readers rarely run in parallel anyway, so you pay the complexity for little benefit. It only wins when reads genuinely dominate and are long enough to benefit from concurrency. For short read-heavy sections, `StampedLock`'s optimistic read is often better.

**"Why exactly does upgrading deadlock?"** Acquiring the write lock requires zero readers. If you hold the read lock and request write, you're waiting for all readers (including yourself) to release — but you won't release because you're blocked waiting. With two upgraders it's mutual. The lock forbids it outright to prevent this.

---

## `StampedLock`

### Layer 1 — Interview question

_(Google/Meta-style, performance)_ "`StampedLock` has an 'optimistic read' mode that `ReentrantReadWriteLock` doesn't. Explain how optimistic reading works, what makes it fast, and the two big caveats."

### Layer 2 — Senior answer

`StampedLock` (Java 8) supports three modes — write, pessimistic read, and _optimistic read_ — and returns a `long` _stamp_ representing the lock state. Optimistic read is the fast path: you call `tryOptimisticRead()` to get a stamp _without actually acquiring any lock_, read your fields, then call `validate(stamp)` to check whether a writer intervened. If no write happened, your read was consistent and you paid _zero_ synchronization cost — no CAS, no cache-line contention. If `validate` returns false, you fall back to acquiring a real read lock and retry. That makes read-mostly workloads dramatically faster than `ReentrantReadWriteLock`, where even readers must mutate shared lock state. The two big caveats: `StampedLock` is **not reentrant** (re-acquiring deadlocks you), and it does **not** support `Condition` variables — so it's a specialized tool, not a drop-in `ReentrantReadWriteLock` replacement.

### Layer 3 — How it works inside

The lock maintains a `long` _state_ that combines a version/sequence counter with lock-mode bits. The three operations:

- `writeLock()` acquires exclusive access and _bumps the version counter_, returning a stamp encoding it. Release restores/advances state.
- `readLock()` is a pessimistic shared lock (like a read-write lock's read side), returning a stamp.
- `tryOptimisticRead()` returns the _current version stamp without acquiring anything_ (it returns 0 if a write lock is currently held). You then read fields into locals, and `validate(stamp)` checks that the version counter hasn't advanced (no write committed) since the stamp was taken. Because writes bump the version, any intervening write makes `validate` fail.

The optimistic pattern, canonical form:

```java
long stamp = sl.tryOptimisticRead();
double curX = x, curY = y;          // read into locals
if (!sl.validate(stamp)) {          // a writer may have intervened
    stamp = sl.readLock();          // fall back to pessimistic read
    try { curX = x; curY = y; }
    finally { sl.unlockRead(stamp); }
}
return Math.hypot(curX, curY);
```

Why it's fast: the optimistic read does no write to shared lock state, so multiple readers don't bounce a cache line the way `ReentrantReadWriteLock` readers do (they increment a shared counter). The validation is a single volatile read comparison.

_Not reentrant_: there's no owner/hold-count tracking, so a thread that holds the write lock and calls `writeLock()` again blocks on itself — deadlock. _No conditions_: it doesn't implement the `Lock` interface's condition support. It also offers conversion methods (`tryConvertToWriteLock`) for upgrade attempts, which _can_ succeed atomically (unlike `ReentrantReadWriteLock`'s forbidden upgrade) precisely because the stamp lets it validate the transition.

### Layer 4 — Tricky follow-ups

**"Why must you copy fields into locals _before_ validating, not after?"** Because between your reads and the `validate`, a writer could change the fields. The pattern is: snapshot into locals, _then_ validate that the snapshot was taken during a quiet period. If you read after validating, you've validated nothing about the values you actually use. Reading-then-validating is the correct order; the reverse is a subtle bug.

**"Can you use `StampedLock` recursively or with `Condition.await()`?"** No to both — not reentrant, no conditions. If your code path can re-enter the lock or needs condition waiting, `StampedLock` is the wrong choice; use `ReentrantLock`/`ReentrantReadWriteLock`. Picking `StampedLock` for its speed and then hitting reentrancy is a classic regret.

**"Is the optimistic-read result guaranteed consistent if `validate` passes?"** Yes for the _values you read into locals before validating_ — `validate` confirms no write committed in that window. But you must not act on the shared fields _after_ validation without re-reading; validation is a point-in-time check, not an ongoing guarantee.

---

## `AbstractQueuedSynchronizer` (AQS)

### Layer 1 — Interview question

_(Google-style, the unifying internal)_ "`ReentrantLock`, `Semaphore`, `CountDownLatch`, and `ReentrantReadWriteLock` are all built on the same class. Name it and explain the two things it manages and the two modes it supports."

### Layer 2 — Senior answer

`AbstractQueuedSynchronizer` (AQS). It manages two things: an `int` _state_ (the meaning of which each synchronizer defines — hold count for `ReentrantLock`, permits for `Semaphore`, count for `CountDownLatch`, split read/write counts for the read-write lock) and a _FIFO queue of blocked threads_ waiting to acquire. It supports two modes: _exclusive_ (only one thread holds it — used by `ReentrantLock`, the write side of the read-write lock) and _shared_ (multiple threads can hold simultaneously — used by `Semaphore`, `CountDownLatch`, the read side of the read-write lock). Subclasses implement small template methods (`tryAcquire`/`tryRelease` or `tryAcquireShared`/`tryReleaseShared`) to define what acquiring _means_ in terms of the state, and AQS handles all the hard parts — the queueing, parking/unparking, fairness, and cancellation. It's the textbook Template Method pattern, and it's why all these synchronizers behave consistently.

### Layer 3 — How it works inside

AQS holds a `volatile int state` (accessed via CAS) and a _CLH-based_ doubly-linked FIFO queue of wait nodes. The flow when a thread can't immediately acquire:

1. The thread calls `acquire(arg)`, which calls the subclass's `tryAcquire(arg)`. If it returns true (state allows it), the thread proceeds — no queueing.
2. If `tryAcquire` returns false, AQS wraps the thread in a `Node`, CASes it onto the tail of the queue, and then _spins briefly then parks_ it via `LockSupport.park()`. Parking is the actual blocking — it deschedules the thread at the OS level.
3. On `release(arg)`, the subclass's `tryRelease` updates state, and if it now permits acquisition, AQS _unparks_ the successor node's thread (`LockSupport.unpark()`), which re-attempts `tryAcquire`.

Shared mode (`acquireShared`/`releaseShared`) differs in that a successful acquire can _propagate_ — when a thread acquires in shared mode it may signal the _next_ shared waiter too, so multiple readers/permit-holders wake in a cascade. This propagation is what lets `CountDownLatch` release _all_ waiters at once when the count hits zero, and lets multiple readers proceed together.

How each synchronizer maps onto state:

- `ReentrantLock`: state = reentrant hold count (0 = free). Exclusive mode.
- `Semaphore`: state = available permits. Shared mode; `acquire` CAS-decrements, `release` increments.
- `CountDownLatch`: state = remaining count. Shared mode; `await` blocks while state > 0, `countDown` decrements, and reaching 0 releases-and-propagates to _all_ waiters.
- `ReentrantReadWriteLock`: state's high 16 bits = read holds, low 16 bits = write holds. Uses both modes on one AQS.

The genius is the separation: AQS owns the genuinely hard concurrency (lock-free queue management, parking, cancellation, fairness, memory ordering), and each synchronizer contributes only a few lines defining the meaning of `state`. That's why they're all correct and consistent — the bug-prone machinery is written once.

### Layer 4 — Tricky follow-ups

**"Why does `CountDownLatch` use shared mode but `ReentrantLock` uses exclusive?"** Because a latch at zero must release _every_ waiting thread simultaneously — that's inherently shared (many threads proceed). A lock grants to exactly one thread — exclusive. The mode encodes 'how many can succeed at once,' and the propagation behavior of shared mode is exactly the 'release everyone' semantics a latch needs.

**"What does the AQS queue actually store, and how do threads block?"** It stores `Node`s, each holding a thread reference and a waitstatus, in a FIFO doubly-linked list. Blocked threads aren't busy-waiting — they're parked via `LockSupport.park`, which deschedules them at the OS level until `unpark`. This is why AQS-based locks don't burn CPU while waiting, unlike a naive CAS spin loop.

**"Can you build your own synchronizer with AQS?"** Yes — that's its purpose. You subclass AQS (usually as a private inner `Sync` class), define `tryAcquire`/`tryRelease` (or the shared variants) in terms of `getState`/`setState`/`compareAndSetState`, and expose your own public API. The JDK docs include a small mutex example. Knowing AQS is _meant_ to be subclassed is a senior signal.

---

## Synchronizers: `CountDownLatch`, `CyclicBarrier`, `Semaphore`, `Phaser`, `Exchanger`

### Layer 1 — Interview question

_(Situational, rapid-fire — typical of AI platforms chaining follow-ups)_ "For each of these, give me the one scenario where it's the _right_ answer, and tell me how it's implemented: `CountDownLatch`, `CyclicBarrier`, `Semaphore`, `Phaser`, `Exchanger`."

### Layer 2 — Senior answer

**`CountDownLatch`** — one-shot 'wait for N things to finish.' Scenario: a coordinator thread that must wait until N worker tasks have each signaled completion before proceeding (e.g. wait for all services to report healthy at startup). It counts _down_ to zero and can't be reset; once open, it stays open.

**`CyclicBarrier`** — reusable 'everyone waits for everyone, repeatedly.' Scenario: a parallel iterative computation where all N threads must finish phase _k_ before any starts phase _k+1_, across many phases. It resets after each trip and can run an optional _barrier action_ when the last thread arrives.

**`Semaphore`** — bounded resource permits. Scenario: limiting concurrent access to a resource — e.g. at most 10 threads hitting a connection pool or a rate-limited external API at once. Threads `acquire` a permit and `release` it.

**`Phaser`** — flexible, multi-phase barrier with _dynamic_ registration. Scenario: a phased pipeline where the number of participating parties changes between phases (parties join and drop out), which neither `CountDownLatch` (fixed, one-shot) nor `CyclicBarrier` (fixed parties) handles well.

**`Exchanger`** — a rendezvous where _two_ threads swap objects. Scenario: a producer thread fills a buffer and hands it to a consumer in exchange for an empty one, with the swap happening atomically at the meeting point (double-buffering).

### Layer 3 — How it works inside

**`CountDownLatch`** is a thin AQS subclass in _shared_ mode: state = the count. `await()` calls `acquireShared`, which blocks while state > 0. `countDown()` calls `releaseShared`, decrementing state; when it reaches 0, the shared-release _propagation_ wakes all waiters at once. It's _one-shot_ precisely because state only goes down and there's no operation to raise it — reaching 0 is terminal.

**`CyclicBarrier`** is _not_ a direct AQS subclass; it's built on a `ReentrantLock` plus a `Condition`. It tracks `parties` and a `count` of how many haven't yet arrived, plus a _generation_ object. Each `await()` decrements `count` and waits on the condition; the _last_ thread to arrive runs the optional barrier action, then _resets_ `count` to `parties`, swaps in a new generation, and signals the condition to wake everyone. The generation swap is how it becomes _cyclic_ — reusable. If a waiting thread is interrupted or times out, the barrier is _broken_: it marks the generation broken and all parties get `BrokenBarrierException`, because a barrier only makes sense if _all_ parties participate.

**`Semaphore`** is an AQS subclass in _shared_ mode: state = available permits. `acquire()` loops trying to CAS-decrement state (blocking via `acquireShared` if no permits); `release()` increments and propagates to waiters. It has fair and non-fair variants like `ReentrantLock` — fair grants permits in FIFO arrival order, non-fair allows barging for throughput.

**`Phaser`** is a more elaborate construct (using atomics and its own waiting machinery, conceptually AQS-like) supporting _dynamic_ `register()`/`arriveAndDeregister()`, multiple _phases_ (it tracks a phase number that advances each round), tiered/hierarchical phasers for scalability, and `arriveAndAwaitAdvance()`. It generalizes both `CountDownLatch` and `CyclicBarrier`: fixed-and-one-shot is a degenerate phaser, fixed-and-cyclic is another.

**`Exchanger`** implements a _rendezvous_: the first thread to call `exchange(x)` parks holding a 'slot' with its item; the second thread to arrive matches the slot, swaps items, and unparks the first. Each leaves with the other's object. Under contention it uses an _arena_ of multiple slots to reduce the single-point contention of the matching location (the same striping idea as `LongAdder`).

### Layer 4 — Tricky follow-ups

**"`CountDownLatch` vs `CyclicBarrier` — the core difference beyond 'reusable'?"** Two differences. (1) _Who waits for whom_: `CountDownLatch` separates the _counters_ (workers calling `countDown`) from the _waiter_ (the coordinator calling `await`) — they're different roles; a worker counting down doesn't itself block. In `CyclicBarrier`, every party both _arrives and waits_ — the threads waiting are the same threads being counted. (2) _Reset_: latch is terminal, barrier recycles. Conflating these is the most common mistake.

**"What happens to a `CyclicBarrier` if one waiting thread times out or is interrupted?"** The barrier _breaks_ for that generation: all other waiting parties receive `BrokenBarrierException`, because the barrier's contract is all-or-nothing — if one party can't make it, the synchronization point is invalid for everyone. You must `reset()` it to reuse. People assume the others just keep waiting; they don't.

**"Why use a `Semaphore` with one permit instead of a lock?"** A binary semaphore (one permit) provides mutual exclusion _but has no notion of ownership_ — any thread can `release`, not just the one that acquired. That's occasionally useful (one thread acquires, another signals completion by releasing), but it also means it doesn't protect against a thread releasing a permit it never acquired. A `ReentrantLock` enforces that only the owner unlocks. Choose the semaphore when you specifically want that ownerless signaling; otherwise a lock is safer.

**"`Phaser` over `CyclicBarrier` — when is the dynamic-parties feature actually necessary?"** When participants legitimately join or leave between phases — e.g. a fork/join-style computation that spawns more workers in later phases, or a pipeline where some stages finish early and deregister. `CyclicBarrier`'s party count is fixed at construction, so it can't model that without awkward workarounds; `Phaser.register()`/`arriveAndDeregister()` handles it natively.

---

### End of Block 3, Part A.

**Part B** continues: concurrent collections (`ConcurrentHashMap` Java 7 Segments → Java 8 CAS+`synchronized`-per-bucket, weakly-consistent iterators, why `size()` is an estimate, null rejection; `CopyOnWriteArrayList`/`Set`; `ConcurrentLinkedQueue` Michael-Scott; the `BlockingQueue` family; `ConcurrentSkipListMap`), the executor framework (`ThreadPoolExecutor`'s 7 parameters and task-routing decision flow, the 4 rejection policies, sizing core vs max, why `Executors.newFixedThreadPool`/`newCachedThreadPool` are discouraged, `ForkJoinPool` work-stealing, `CompletableFuture` composition and the commonPool pitfall), and patterns/traps (producer-consumer, double-checked locking and the holder/enum idioms, the four Coffman deadlock conditions plus detection, livelock/starvation, false sharing and `@Contended`).

---

# Java Deep-Dive Interview Guide — Block 3 (Part B): Concurrent Collections, Executors, Patterns & Traps

> Continues Block 3 Part A. Four-layer structure throughout. This completes the guide.

---

## `ConcurrentHashMap` — Java 7 → Java 8 evolution

### Layer 1 — Interview question

_(Google/Meta-style, deep internals + version awareness)_ "Explain how `ConcurrentHashMap` achieves concurrency. Then specifically: how did the implementation change from Java 7 to Java 8, why is `size()` an estimate, and why does it reject null keys and values?"

### Layer 2 — Senior answer

`ConcurrentHashMap` allows concurrent reads and a bounded number of concurrent writes without locking the whole map. In **Java 7** it used _lock striping_ via `Segment`s: the map was partitioned into (by default 16) segments, each its own `ReentrantLock`-backed mini-hashtable, so up to 16 threads could write concurrently — one per segment — and reads were mostly lock-free. In **Java 8** the `Segment` abstraction was abandoned for finer granularity: locking moved to the _individual bucket_ (the first node of each bin), using _CAS_ for the common cases (inserting into an empty bin) and `synchronized` on the bin's head node only when there's a collision chain to traverse. So concurrency went from '16 segments' to 'one lock per bucket,' dramatically increasing write parallelism, and it also adopted the same treeification (chains → red-black trees past threshold 8) as `HashMap`. `size()` is an _estimate_ because the count is maintained across multiple striped counter cells (like `LongAdder`) that are summed without a global lock, so concurrent modifications during the sum aren't precisely captured. It rejects null keys _and_ values because, in a concurrent map, a null return from `get` would be ambiguous between 'absent' and 'present-but-null' with no race-free way to disambiguate — the same design reasoning as the null-key decision we covered for the single-threaded case.

### Layer 3 — How it works inside

**Java 7 — Segments.** The map was an array of `Segment<K,V>` objects, each extending `ReentrantLock` and containing its own `HashEntry[]` table. A key's high hash bits chose the segment; its low bits chose the bucket within. A `put` locked only its segment, so writes to different segments were fully parallel — concurrency level = number of segments (default 16, configurable). Reads were largely lock-free (entries had `volatile` value/next), and `size()` tried a few times without locking, then locked _all_ segments if counts kept changing. The downsides: fixed concurrency ceiling (16 by default), memory overhead of the segment objects, and an extra indirection on every access.

**Java 8 — CAS + per-bucket `synchronized`.** The redesign dropped `Segment` and made the table a plain `Node[]` like `HashMap`'s. Concurrency control moved to the granularity of a single bin:

- Inserting into an _empty_ bin uses a CAS to atomically place the first node — no lock at all.
- If the bin is _occupied_ (collision), the thread `synchronized`-locks the _head node of that bin_ and appends/updates within the chain (or the tree). Only that one bin is locked; every other bin is independently writable.
- Reads are lock-free: nodes have `volatile` `val` and `next`, and the table reference is `volatile`, so readers see consistent published state without locking.
- It treeifies bins past 8 entries (with the same ≥64 table-size condition as `HashMap`) into red-black trees, bounding worst-case bin lookup at O(log n).
- _Resize_ is _cooperative/concurrent_: multiple threads can help transfer bins from the old table to the new one (a `transferIndex` hands out ranges of bins for helper threads to migrate), and a special `ForwardingNode` marks already-moved bins so concurrent operations are redirected to the new table. This is a major advance over Java 7's segment-local resize.

**Why `size()` is an estimate.** Java 8 maintains the element count using a _striped counter_ (a `baseCount` plus an array of `CounterCell`s, the `Striped64` design) to avoid a single contended counter. `size()`/`mappingCount()` sums these without locking, so it reflects a count that may have changed during the summation — accurate when quiescent, approximate under concurrent mutation. `mappingCount()` (returns `long`) is preferred for large maps since `size()` caps at `Integer.MAX_VALUE`.

**Weakly consistent iterators.** Iterators traverse the table reflecting _some_ state of the map; they never throw `ConcurrentModificationException`, they may or may not reflect modifications made after iteration began, and each element is returned at most once. This is the deliberate trade for not locking during iteration — you get a usable, non-throwing traversal at the cost of a precise snapshot.

**Null rejection.** Both null keys and null values throw `NullPointerException`. The rationale (from Doug Lea): in a concurrent setting, if `get(k)` returned `null` it would be irresolvably ambiguous between 'no mapping' and 'mapped to null,' because you can't atomically follow up with `containsKey` — another thread could change the mapping in between. Banning null makes a `null` return unambiguously mean 'absent,' which the atomic methods (`putIfAbsent`, `compute`, `merge`) rely on internally.

### Layer 4 — Tricky follow-ups

**"In Java 8, when is there _no_ lock at all on a write?"** When inserting into an empty bin — a single CAS places the head node. The `synchronized` only appears when a bin already has a chain/tree to mutate. So in a well-distributed map most writes hit distinct empty-ish bins and contend minimally.

**"Is `computeIfAbsent` atomic, and what's the gotcha?"** Yes — `computeIfAbsent`, `compute`, and `merge` perform the read-and-update atomically per bin (holding the bin lock for the mapping function's duration). The gotcha: the mapping function runs _while the bin is locked_, so it must be short and must **not** attempt to update the _same_ map (re-entrant modification of the same key can deadlock or throw in newer JDKs that detect it). People put expensive or recursive logic in there and cause stalls.

**"Does a `ConcurrentHashMap` iterator reflect concurrent puts?"** It _might_ — it's weakly consistent, not snapshot. It won't throw, and it sees each key at most once, but whether a put made during iteration appears is unspecified. Don't rely on either seeing or not seeing concurrent changes.

**"`Collections.synchronizedMap` vs `ConcurrentHashMap`?"** `synchronizedMap` wraps every method in one lock — _all_ operations serialize on a single monitor, and you still must manually synchronize during iteration. `ConcurrentHashMap` locks per bin, so it scales with concurrency and its iterators are safe without external synchronization. For concurrent workloads `ConcurrentHashMap` wins decisively; `synchronizedMap` is essentially legacy.

---

## `CopyOnWriteArrayList` and `CopyOnWriteArraySet`

### Layer 1 — Interview question

_(Situational, trade-off)_ "When is `CopyOnWriteArrayList` brilliant, and when is it a disaster? Be specific about the cost model."

### Layer 2 — Senior answer

It's brilliant for _read-mostly, write-rarely_ data where reads vastly outnumber writes and you want completely lock-free, never-throwing iteration — the textbook case is an event-listener list (observers registered occasionally, fired constantly). Reads touch an immutable snapshot array with zero locking, and iterators never throw `ConcurrentModificationException` because they iterate a frozen snapshot. It's a _disaster_ when writes are frequent or the list is large, because _every single mutation copies the entire backing array_ — an O(n) allocation-and-copy per add/remove. So a write-heavy or big-and-churning list turns every write into a full copy, crushing throughput and the GC. The rule: COW shines only when the write rate is low and the collection is modest in size.

### Layer 3 — How it works inside

The backing store is a `volatile Object[]`. Every _mutation_ acquires a lock (a `ReentrantLock`/`synchronized`), copies the current array to a new one with the change applied, and atomically swaps the `volatile` array reference. Because the swap is a single volatile write of a fully-constructed array, _readers never need a lock_ — a reader grabs the current array reference and reads it; even if a writer swaps in a new array a microsecond later, the reader continues safely on its (now-stale-but-consistent) snapshot.

Iterators capture the array reference _at creation time_ and iterate that exact snapshot for their whole life — so they never reflect later modifications and never throw CME, but they also can't see updates that happen after the iterator was created, and their `remove`/`set`/`add` operations are _unsupported_ (they'd be meaningless against an immutable snapshot). `CopyOnWriteArraySet` is simply a thin wrapper over a `CopyOnWriteArrayList` that enforces uniqueness on add (an O(n) scan plus the O(n) copy, so adds are O(n²)-ish to build a set — fine for tiny sets, terrible for large ones).

### Layer 4 — Tricky follow-ups

**"What does a COW iterator see if I add an element mid-iteration?"** Nothing — it iterates the snapshot taken when it was created. The new element is invisible to that iterator. This is the opposite of fail-fast: instead of throwing, it silently shows you a consistent but possibly outdated view. Be sure that staleness is acceptable for your use case.

**"Why does the listener-list pattern fit COW so perfectly?"** Because listeners are added/removed rarely (config time) but the list is _iterated_ on every event dispatch, often from many threads, and you absolutely don't want a listener mutation to throw CME mid-dispatch. COW gives lock-free, never-throwing iteration for the hot path (firing events) and pays its O(n) cost only on the cold path (registration).

**"Memory cost under bursty writes?"** Each write allocates a whole new array, so a burst of N writes allocates N arrays of growing size, generating significant garbage. Under write bursts you'll see GC pressure and allocation spikes. If writes can burst, COW is the wrong structure.

---

## `ConcurrentLinkedQueue` (Michael-Scott lock-free queue)

### Layer 1 — Interview question

_(Google-style, algorithm)_ "`ConcurrentLinkedQueue` is lock-free — no locks at all. What algorithm underlies it, and how does it stay consistent without locking?"

### Layer 2 — Senior answer

It implements the _Michael-Scott_ non-blocking queue algorithm: a singly-linked list with `head` and `tail` pointers, where enqueue and dequeue advance those pointers using _CAS_ instead of locks. Enqueue CASes the new node onto the last node's `next`, then CASes `tail` forward; dequeue CASes `head` forward past the first node. Because it's CAS-based and lock-free, no thread can block another, so it has no blocking/waiting capability — it's an _unbounded, non-blocking_ queue, distinct from the `BlockingQueue` family. It stays consistent through the careful CAS ordering of the algorithm, which tolerates `tail` lagging one node behind (any thread that notices a lagging tail helps advance it), so there's never an inconsistent intermediate state observable as a missing or duplicated element.

### Layer 3 — How it works inside

Nodes have `volatile` `item` and `next`. The Michael-Scott invariants: `head` always points to a node whose item has been (or is being) consumed (a 'sentinel'-ish first node), and `tail` points at or _near_ the last node — crucially, `tail` is allowed to lag _one_ node behind the true end. Operations:

- _Enqueue_: read `tail`; if `tail.next` is null, CAS the new node into `tail.next` (the linearization point — the element is now in the queue); then CAS `tail` to the new node (a _best-effort_ swing — if it fails, another thread will fix it). If `tail.next` was _not_ null, `tail` is lagging, so the thread helps by CASing `tail` forward and retries.
- _Dequeue_: read `head`, read `head.next`; if there's a next node, CAS `head` to it and return its item (CASing the item to null to logically remove it). The 'help advance lagging tail' cooperation means no single thread is responsible for maintaining `tail` precisely, which is what makes the algorithm lock-free _and_ obstruction-free.

The lagging-tail tolerance is the clever part: by _not_ requiring `tail` to always be exact, the algorithm avoids a situation where threads must coordinate two CASes atomically (which single-word CAS can't do). Instead each operation does its single CAS for correctness and a _best-effort_ CAS for the pointer hint, with mutual helping.

A practical consequence: `size()` is O(n) (it walks the list) and only an estimate, because the queue is changing under you — same weakly-consistent philosophy as `ConcurrentHashMap`.

### Layer 4 — Tricky follow-ups

**"Why is `size()` O(n) and discouraged here?"** There's no maintained count — computing size walks the entire chain, and concurrent enqueues/dequeues mean the result is stale by the time you get it. Use `isEmpty()` (O(1), checks head vs next) for emptiness checks; never use `size()` for control flow in hot paths.

**"`ConcurrentLinkedQueue` vs `LinkedBlockingQueue` — when each?"** Use `ConcurrentLinkedQueue` when you want a non-blocking, unbounded queue and consumers can poll-and-do-something-else when it's empty (no waiting needed). Use `LinkedBlockingQueue` (next section) when consumers should _block_ until an element is available, or when you need _bounded_ capacity for backpressure. Lock-free vs blocking is the axis; they solve different coordination needs.

**"Does lock-free mean wait-free here?"** No. Michael-Scott is _lock-free_ (system-wide progress is guaranteed — some thread always makes progress) but not _wait-free_ (an individual thread can be delayed indefinitely by repeated CAS failures under contention). The distinction matters in latency-sensitive contexts.

---

## The `BlockingQueue` family

### Layer 1 — Interview question

_(Situational, design)_ "I'm building a producer-consumer system. Compare `ArrayBlockingQueue`, `LinkedBlockingQueue`, `SynchronousQueue`, `PriorityBlockingQueue`, and `DelayQueue`, and tell me which to use for: a bounded work buffer, a direct hand-off thread pool, and scheduled/delayed task execution."

### Layer 2 — Senior answer

All implement `BlockingQueue`: `put` blocks when full, `take` blocks when empty — the core producer-consumer coordination. **`ArrayBlockingQueue`** is bounded, backed by a fixed circular array, with a single lock; its fixed capacity makes it the natural _bounded work buffer_ that provides backpressure. **`LinkedBlockingQueue`** is optionally bounded (unbounded by default — a hazard), backed by linked nodes with _separate_ put/take locks so producers and consumers contend less; good general-purpose queue but its default unboundedness can let work pile up without limit. **`SynchronousQueue`** has _zero capacity_ — every `put` must directly hand off to a waiting `take`; it's the _direct hand-off_ used by `newCachedThreadPool`, forcing a new thread (or rejection) when no consumer is ready. **`PriorityBlockingQueue`** is an unbounded heap-ordered blocking queue — elements come out in priority order, for when ordering matters more than FIFO. **`DelayQueue`** holds elements that each become available only after a per-element delay expires — exactly the structure for _scheduled/delayed task execution_ (it's what `ScheduledThreadPoolExecutor` is built around). So: bounded buffer → `ArrayBlockingQueue`; direct hand-off pool → `SynchronousQueue`; delayed execution → `DelayQueue`.

### Layer 3 — How it works inside

- **`ArrayBlockingQueue`**: a circular array with `putIndex`/`takeIndex`, a single `ReentrantLock`, and two `Condition`s — `notFull` and `notEmpty`. `put` waits on `notFull` while the array is full, inserts, signals `notEmpty`; `take` mirrors it. The single lock means producers and consumers serialize against each other, but the bounded array gives predictable memory and backpressure. The two-condition design is the canonical bounded-buffer pattern from the `wait`/`notify` discussion in Block 2, done right.
- **`LinkedBlockingQueue`**: linked nodes with a _two-lock_ design — a `takeLock` and a `putLock` — so a producer and a consumer can operate _simultaneously_ (head and tail are independent), with an `AtomicInteger` count coordinating across the two locks. This higher throughput under mixed producer/consumer load is its main advantage; the cost is per-node allocation and the unbounded default (capacity defaults to `Integer.MAX_VALUE`).
- **`SynchronousQueue`**: holds no elements; it's a _rendezvous_ (built on a Treiber-stack/Michael-Scott-queue-style lock-free dual structure). A `put` blocks until a `take` arrives to receive the item directly, and vice versa. Capacity is zero — `peek` always returns null, `size` always 0. It maximizes hand-off throughput and is why `newCachedThreadPool` spawns threads on demand: a submitted task either hands off to an idle waiting worker or triggers creation of a new one.
- **`PriorityBlockingQueue`**: an unbounded binary heap (like `PriorityQueue`) guarded by a single `ReentrantLock` with a `notEmpty` condition; no `notFull` because it's unbounded (`put` never blocks). Ordering by comparator/`Comparable`; iteration order is heap order, not sorted (same caveat as `PriorityQueue`).
- **`DelayQueue`**: a `PriorityBlockingQueue` ordered by each element's delay expiry (`Delayed.getDelay`). `take` returns an element only once its delay has elapsed; if the head isn't ready, the consumer waits exactly until it is (using a _leader-follower_ optimization so only one consumer waits on the timer at a time). It's the backbone of scheduled executors.

### Layer 4 — Tricky follow-ups

**"Why is `LinkedBlockingQueue`'s default unboundedness dangerous in a thread pool?"** Because `newFixedThreadPool` uses an unbounded `LinkedBlockingQueue`: if tasks arrive faster than the fixed threads can process them, the queue grows without limit, consuming memory until `OutOfMemoryError` — and the pool never creates more threads (queue never reports full). It silently trades a crash for backpressure. Always bound the queue in production.

**"Why does `SynchronousQueue` enable `newCachedThreadPool`'s behavior?"** Because with zero capacity, a submitted task can only be enqueued if a worker is _right now_ waiting to take it. If none is, the pool's logic creates a new thread (max is `Integer.MAX_VALUE`). So load spikes spawn unbounded threads — which is _also_ why `newCachedThreadPool` is dangerous: it can create runaway threads under load.

**"`take` vs `poll` vs `remove` on a `BlockingQueue`?"** `take` blocks until available; `poll()` returns null immediately if empty; `poll(timeout)` waits up to a bound; `remove()` throws `NoSuchElementException` if empty. Choosing `take` where you meant `poll(timeout)` is how consumers hang forever during shutdown.

---

## `ConcurrentSkipListMap`

### Layer 1 — Interview question

_(Direct)_ "I need a _sorted_, _concurrent_ map. `TreeMap` isn't thread-safe and `ConcurrentHashMap` isn't sorted. What do I use, and how does it stay both sorted and concurrent without a global lock?"

### Layer 2 — Senior answer

`ConcurrentSkipListMap` — the concurrent, sorted `NavigableMap`. It maintains keys in sorted order with O(log n) operations like `TreeMap`, but it's built on a _skip list_ rather than a red-black tree, which is what makes lock-free concurrency tractable. A skip list is a layered set of linked lists where higher layers 'skip' over many nodes, giving probabilistic O(log n) search; because it's composed of linked lists, insertions and deletions can be done with _CAS_ operations on individual links rather than the tree rotations a red-black tree needs (rotations would require locking large subtrees). So you get sorted iteration, navigation (`floor`/`ceiling`/`subMap`), and concurrent access without a single global lock.

### Layer 3 — How it works inside

A skip list has a bottom layer that's an ordinary sorted linked list of all entries, and a stack of sparser 'express' layers above it, where each node is promoted to the next layer up with probability ~1/2 (so layer _k_ has roughly _n_/2ᵏ nodes). Search starts at the top-left, moves right while the next key is ≤ target, drops down a layer when it overshoots, and repeats — giving O(log n) expected search. The reason this beats a balanced tree for concurrency: there's no rebalancing. Inserting a node means CASing it into the bottom list and (probabilistically) into some upper lists, each a localized link update; deletion marks a node and unlinks it via CAS. No structural rotation means no need to lock a region of the structure — concurrent operations on different keys proceed independently, and the algorithm tolerates partially-linked nodes during concurrent updates (readers skip over in-progress/marked nodes).

Like the other concurrent collections, its iterators are _weakly consistent_ (no CME, may not reflect concurrent updates), and `size()` is O(n) and approximate because there's no maintained count under concurrency.

### Layer 4 — Tricky follow-ups

**"Why a skip list instead of a concurrent balanced tree?"** Because balanced trees rebalance via rotations that affect multiple nodes and would require locking subtrees, killing concurrency. A skip list's updates are localized link changes amenable to lock-free CAS, so it parallelizes naturally. The data-structure choice is driven entirely by what's _concurrency-friendly_, not by single-threaded performance (where a tree is fine).

**"`ConcurrentSkipListMap` vs `TreeMap` wrapped in `Collections.synchronizedSortedMap`?"** The synchronized wrapper serializes _all_ access on one lock (no concurrency, plus manual locking needed for iteration). `ConcurrentSkipListMap` allows genuine concurrent reads and writes and has safe weakly-consistent iterators. For concurrent sorted access, the skip-list map wins; the wrapper is a last resort.

---

## `ThreadPoolExecutor` — the 7 parameters and the task-routing decision

### Layer 1 — Interview question

_(Amazon-style, trade-off reasoning — the most-asked pool question)_ "Walk me through every parameter of the `ThreadPoolExecutor` constructor, and then — precisely, in order — what the pool does with a newly submitted task. Then: how do you size `corePoolSize` vs `maximumPoolSize` for a CPU-bound vs an I/O-bound workload?"

### Layer 2 — Senior answer

The seven parameters: **`corePoolSize`** (threads kept alive even when idle — the baseline), **`maximumPoolSize`** (the hard ceiling on threads), **`keepAliveTime`** + **`unit`** (how long _non-core_ idle threads survive before being reaped), **`workQueue`** (where tasks wait when all core threads are busy), **`threadFactory`** (how new threads are created — for naming, daemon status, priorities), and the **rejection `handler`** (what to do when the pool is saturated). The task-routing decision, in strict order: (1) if fewer than `corePoolSize` threads exist, _create a new core thread_ for the task — even if other threads are idle; (2) else try to _enqueue_ the task on the `workQueue`; (3) if the queue is _full_, create a new thread up to `maximumPoolSize`; (4) if that's also maxed out, _reject_ via the handler. The order is the crucial, counterintuitive part: it prefers _queueing over creating non-core threads_, so with an unbounded queue it never grows past core. Sizing: for **CPU-bound** work, ~number of cores (a bit more to cover occasional stalls) — more threads than cores just adds context-switch overhead; for **I/O-bound** work, _many_ more than cores, because threads spend most time blocked, so you scale up to keep the CPU busy while others wait (a rough model: cores × (1 + wait-time/compute-time)).

### Layer 3 — How it works inside

The decision flow is implemented in `execute(Runnable)` and is exactly:

```
if (workerCount < corePoolSize)
    → addWorker(task, core=true)        // create a core thread
else if (workQueue.offer(task))
    → enqueued; a free worker will pick it up
else if (addWorker(task, core=false))   // queue full → try a non-core thread
    → created up to maximumPoolSize
else
    → reject(task)                      // saturated
```

The subtle, widely-misunderstood consequence: **the queue is preferred over creating threads beyond core.** So if your `workQueue` is _unbounded_ (e.g. a default `LinkedBlockingQueue`), step 2 always succeeds, step 3 never runs, and `maximumPoolSize` is _dead configuration_ — the pool never exceeds `corePoolSize`. To actually use `maximumPoolSize`, you need a _bounded_ queue (so it can fill) or a `SynchronousQueue` (which 'fills' immediately because it holds nothing). This is why `newFixedThreadPool` (unbounded queue, core == max) and `newCachedThreadPool` (SynchronousQueue, core 0 / max ∞) behave as they do.

`keepAliveTime` governs the reaping of idle threads _above_ core; setting `allowCoreThreadTimeOut(true)` extends reaping to core threads too. Workers are `Worker` objects (themselves AQS-based for their per-worker lock) that loop pulling tasks from the queue (`getTask()`), running them, and exiting when idle past keep-alive (if non-core) or when the pool shuts down.

**Sizing math.** CPU-bound: pool size ≈ N_cores (or N_cores + 1 to cover a thread occasionally faulting/paging) — beyond that you only add scheduling overhead and cache thrash. I/O-bound: pool size ≈ N_cores × (1 + W/C) where W is wait time and C is compute time per task; if tasks are 90% waiting, that's roughly N_cores × 10. These are starting points to validate with measurement, not laws — Amazon-style answers explicitly say 'then I'd load-test and tune,' because real sizing depends on downstream limits (DB connections, rate limits) as much as on cores.

### Layer 4 — Tricky follow-ups

**"I set `maximumPoolSize` to 50 but the pool never goes above 10 (my core size). Why?"** Because your `workQueue` is unbounded, so tasks always enqueue successfully and the pool never reaches the 'queue full → create more threads' branch. `maximumPoolSize` only matters with a bounded (or synchronous) queue. This is the single most common pool misconfiguration.

**"What are the four rejection policies and when use each?"**

- _`AbortPolicy`_ (default): throws `RejectedExecutionException` — fail loud, the caller learns the system is overloaded. Use when shedding load must be visible.
- _`CallerRunsPolicy`_: the _submitting thread_ runs the task itself. This provides natural _backpressure_ — the producer is slowed down because it's busy executing, so it stops submitting. Excellent for ingestion pipelines where you'd rather throttle producers than drop work.
- _`DiscardPolicy`_: silently drops the new task. Use only when losing tasks is acceptable (e.g. best-effort telemetry).
- _`DiscardOldestPolicy`_: drops the _oldest_ queued task and retries the new one — keeps the freshest work. Dangerous if old tasks matter; useful for 'latest value wins' scenarios.

**"Why does Effective Java warn against `Executors.newFixedThreadPool` and `newCachedThreadPool`?"** `newFixedThreadPool` uses an _unbounded_ `LinkedBlockingQueue`, so under overload the queue grows until `OutOfMemoryError` instead of applying backpressure. `newCachedThreadPool` uses a `SynchronousQueue` with `maximumPoolSize = Integer.MAX_VALUE`, so under load it creates _unbounded threads_, exhausting memory/OS limits. Both hide a resource-exhaustion failure behind a convenient factory. The guidance is to construct `ThreadPoolExecutor` directly with a _bounded_ queue and an explicit rejection policy, so saturation is handled deliberately.

**"What's the risk of a fixed pool where tasks submit subtasks to the _same_ pool and wait on them?"** Thread-pool _deadlock/starvation_: all threads are occupied by parent tasks blocked waiting on child tasks that can never be scheduled because no thread is free. Bounded pools with interdependent tasks need separate pools or a work-stealing model (`ForkJoinPool`) that can run subtasks on the waiting thread.

---

## `ForkJoinPool` and work-stealing

### Layer 1 — Interview question

_(Google/Meta-style)_ "`ForkJoinPool` uses 'work-stealing.' Explain the mechanism — what data structure each worker has, how stealing works, and why `RecursiveTask` vs `RecursiveAction`. And what's the `commonPool` and why should I care who uses it?"

### Layer 2 — Senior answer

In a `ForkJoinPool`, _each worker thread has its own double-ended queue (deque)_ of tasks. A worker pushes newly-forked subtasks onto, and pops them from, the _head_ of its own deque (LIFO — good cache locality, since the most recently forked task's data is hottest). When a worker's own deque is _empty_, instead of idling it _steals_ a task from the _tail_ of another worker's deque (FIFO from the victim's perspective — stealing the oldest, largest task, which tends to yield the most future work). This keeps all cores busy with minimal contention because workers mostly touch their own deque, only contending when stealing. `RecursiveTask<V>` is for divide-and-conquer that _returns a result_ (you `fork` subtasks and `join` their results); `RecursiveAction` is the same but returns _void_ (side-effecting work). The **`commonPool`** is a single JVM-wide `ForkJoinPool` shared by default by parallel streams, `CompletableFuture` async methods, and anything that doesn't supply its own executor — and you should care because if you run _blocking_ work on it, you starve the common pool that everything else relies on, including parallel streams elsewhere in the app.

### Layer 3 — How it works inside

Each worker owns a `WorkQueue` (an array-backed deque). The asymmetry is deliberate: the _owner_ operates LIFO on its own queue (push/pop at the top/base), while _thieves_ take FIFO from the other end. LIFO-for-owner maximizes locality and the chance the subtask's data is still in cache; FIFO-for-thief steals the _oldest_ task, which in divide-and-conquer is the _coarsest_ (closest to the root split), so the thief gets a big chunk of work and won't need to steal again soon — minimizing stealing frequency and contention. `fork()` pushes a task to the current worker's deque; `join()` either runs the subtask if it's still local, or helps execute other tasks while waiting (so a joining thread isn't merely blocked — it does useful work, which is how `ForkJoinPool` avoids the pool-deadlock that a fixed `ThreadPoolExecutor` suffers).

The `commonPool` is created lazily, sized by default to _available processors − 1_ (so the submitting thread counts as one), and is used by `parallelStream()`, `CompletableFuture.*Async` without an explicit executor, and `ForkJoinPool.commonPool()`. Because it's _shared globally_, blocking tasks (I/O, locks, `sleep`) on it occupy workers that the rest of the application needs, degrading every parallel stream and async pipeline in the JVM. The fix is to supply your _own_ executor for blocking async work and reserve the common pool for short CPU-bound splits.

### Layer 4 — Tricky follow-ups

**"Why steal from the _opposite_ end of the deque?"** To minimize contention and maximize work-per-steal. The owner works the 'hot' end (recent, small, cache-local subtasks) LIFO; thieves take the 'cold' end (old, coarse subtasks) FIFO. They rarely touch the same end simultaneously, so the synchronization between owner and thief is minimal, and each steal grabs a large unit of work so stealing is infrequent.

**"What happens if I run blocking I/O on a parallel stream (which uses the commonPool)?"** You tie up commonPool workers in blocking waits, starving every other parallel stream and `CompletableFuture` in the JVM, since they share that pool. Parallel streams are for CPU-bound work on in-memory data; blocking I/O in them is a classic anti-pattern. For blocking work, use a dedicated executor (or virtual threads).

**"How does `ForkJoinPool` avoid the subtask-starvation deadlock that a fixed pool has?"** Because `join()` doesn't just block — the joining worker _helps_ by executing other available tasks (including the one it's waiting on, if still queued) rather than sitting idle. So a worker waiting on a subtask contributes to draining the work, and the pool makes progress even when tasks depend on subtasks — exactly where a fixed `ThreadPoolExecutor` can deadlock.

---

## `CompletableFuture`

### Layer 1 — Interview question

_(Meta/Netflix-style, async composition)_ "Compose three async calls: fetch a user, then fetch their orders using the user ID, and combine with an independently-fetched promotions list. Then tell me how `thenApply` vs `thenCompose` vs `thenCombine` differ, how you handle errors, and the default-executor pitfall."

### Layer 2 — Senior answer

You'd use `thenCompose` for the _dependent_ sequential step (orders depend on the user) and `thenCombine` to merge two _independent_ results (the user/orders chain with the promotions). The distinctions: **`thenApply`** transforms a result with a synchronous function returning a plain value (`T → U`); **`thenCompose`** _flattens_ — its function returns another `CompletableFuture` (`T → CompletableFuture<U>`), so you use it to chain a _dependent async_ call without ending up with a nested `CompletableFuture<CompletableFuture<U>>` (it's the monadic flatMap); **`thenCombine`** waits for _two independent_ futures and merges their results with a bi-function. Error handling: **`exceptionally`** recovers from a failure by supplying a fallback value, while **`handle`** runs on _both_ success and failure (it gets `(result, throwable)`), and **`whenComplete`** observes the outcome without altering it. The default-executor pitfall: the non-`Async` methods may run _on the thread that completed the previous stage_, and the `*Async` variants without an explicit executor run on the _commonPool_ — so blocking work in a `CompletableFuture` chain silently runs on the shared `ForkJoinPool.commonPool`, starving it. Always pass an explicit executor for anything blocking.

```java
CompletableFuture<User> userF = fetchUserAsync(id);                 // CF<User>
CompletableFuture<List<Order>> ordersF =
    userF.thenCompose(u -> fetchOrdersAsync(u.id()));               // dependent → compose (flatten)
CompletableFuture<List<Promo>> promosF = fetchPromosAsync();        // independent
CompletableFuture<Dashboard> result =
    ordersF.thenCombine(promosF, (orders, promos) -> new Dashboard(orders, promos))
           .exceptionally(ex -> Dashboard.empty());                 // fallback on failure
```

### Layer 3 — How it works inside

A `CompletableFuture` is a future whose completion you can trigger and whose _continuations_ you can register. Internally it holds a result reference and a stack of dependent _completions_; when the future completes (via `complete`, `completeExceptionally`, or a `supplyAsync` task finishing), it walks that stack firing the dependents. The `*Async` methods schedule the dependent on an `Executor` (the supplied one, or the commonPool); the non-`Async` methods run the dependent _inline on whatever thread completed the stage_ (or on the calling thread if already complete) — which is why a 'cheap' `thenApply` can unexpectedly execute on a commonPool worker or on a caller thread, and why blocking there is dangerous.

`thenCompose` is _flatMap_: without it, chaining a function that itself returns a future would give you `CompletableFuture<CompletableFuture<U>>`; `thenCompose` flattens the nesting so you get `CompletableFuture<U>`. `thenCombine` registers a dependent that fires only when _both_ upstream futures are done, applying a `BiFunction`. Exception propagation: a failure in any stage _short-circuits_ downstream `then*` stages (they're skipped), propagating the throwable until an `exceptionally`/`handle` intercepts it — so unhandled exceptions surface only at `get`/`join` as a `CompletionException` wrapping the cause.

### Layer 4 — Tricky follow-ups

**"`thenApply` vs `thenCompose` — give the type signatures that disambiguate them."** `thenApply: (T → U)` yielding `CompletableFuture<U>`. `thenCompose: (T → CompletableFuture<U>)` yielding `CompletableFuture<U>`. If your function is _itself async_ (returns a future), `thenApply` gives you `CompletableFuture<CompletableFuture<U>>` (nested) and `thenCompose` flattens it. Using `thenApply` where you needed `thenCompose` is the most common `CompletableFuture` bug.

**"Why is running blocking work on a `CompletableFuture` chain risky by default?"** Because `*Async` without an explicit executor uses `ForkJoinPool.commonPool`, sized to ~cores − 1 and shared with parallel streams. Blocking those few workers starves the whole JVM's parallel/async machinery. The fix is `thenApplyAsync(fn, myExecutor)` with a dedicated, appropriately-sized pool (or virtual-thread executor) for blocking stages.

**"`exceptionally` vs `handle` vs `whenComplete`?"** `exceptionally(fn)` runs only on failure and returns a recovery value (success passes through unchanged). `handle(fn)` runs on _both_ outcomes, receiving `(value, throwable)` — one of them null — and produces a new result, so it can transform success _and_ recover failure. `whenComplete(action)` runs on both outcomes for a _side effect_ (logging, cleanup) but does **not** change the result or swallow the exception — the original outcome propagates. Choosing `whenComplete` when you meant to recover (you wanted `handle`/`exceptionally`) leaves the exception unhandled.

**"`get()` vs `join()`?"** Both block for the result; `get()` throws _checked_ `InterruptedException`/`ExecutionException`, `join()` throws the _unchecked_ `CompletionException`. `join()` is more convenient inside lambdas/streams (no checked-exception boilerplate); `get()` when you need to handle interruption explicitly.

---

## Pattern — Producer-Consumer with `BlockingQueue`

### Layer 1 — Interview question

_(Direct, applied)_ "Implement a thread-safe producer-consumer. Why is `BlockingQueue` the right tool over hand-rolling `wait`/`notify`?"

### Layer 2 — Senior answer

A `BlockingQueue` _is_ the producer-consumer pattern, encapsulated correctly. Producers `put` (which blocks when the queue is full, applying natural backpressure); consumers `take` (which blocks when empty). It's preferable to hand-rolled `wait`/`notify` because the queue already handles every subtlety we'd otherwise get wrong: the `while`-loop condition rechecking, the right `notifyAll`-vs-`notify` choice, the lock discipline, and the bounded-capacity backpressure. Hand-rolling is an error-prone re-implementation of `ArrayBlockingQueue`'s two-condition design. A bounded queue (e.g. `ArrayBlockingQueue`) is the key choice — it prevents producers from overwhelming consumers by blocking them, which is the backpressure you almost always want.

### Layer 3 — How it works inside

```java
BlockingQueue<Task> queue = new ArrayBlockingQueue<>(1000);  // bounded → backpressure

// Producer
queue.put(task);   // blocks if full — slows producer to consumer's rate

// Consumer
while (running) {
    Task t = queue.take();   // blocks if empty — no busy-wait
    process(t);
}
```

Under the hood (Block 3A) `ArrayBlockingQueue` uses one `ReentrantLock` and `notFull`/`notEmpty` `Condition`s: `put` waits on `notFull` and signals `notEmpty`; `take` waits on `notEmpty` and signals `notFull`. That's exactly the correct `wait`/`notify` pattern from Block 2 — the recheck loop, the precise signaling — implemented once, correctly, so you don't re-derive it. For graceful shutdown you typically use a _poison pill_ (a sentinel task that tells consumers to stop) or interrupt the consumers and have them exit `take` via `InterruptedException`.

### Layer 4 — Tricky follow-ups

**"How do you shut down consumers cleanly?"** Either a _poison pill_ — enqueue one sentinel per consumer so each `take`s it and exits — or interrupt the consumer threads, letting the `InterruptedException` from `take` break the loop (with the interruption discipline from Block 2: don't swallow it). Don't rely on `poll` polling-with-flag in a tight loop; that's a busy-wait.

**"Why a _bounded_ queue specifically?"** An unbounded queue removes the backpressure: if producers outpace consumers, an unbounded queue grows until `OutOfMemoryError`. Bounding it blocks producers when full, throttling them to the consumers' throughput — the system self-regulates instead of crashing. This is the same lesson as the `newFixedThreadPool` unbounded-queue hazard.

---

## Pattern — Double-Checked Locking and safe lazy initialization

### Layer 1 — Interview question

_(Tricky, "why does this famous code fail?")_

```java
class Singleton {
    private static Singleton instance;          // NOT volatile — the bug
    static Singleton get() {
        if (instance == null) {                  // first check (no lock)
            synchronized (Singleton.class) {
                if (instance == null) {          // second check (locked)
                    instance = new Singleton();  // the dangerous line
                }
            }
        }
        return instance;
    }
}
```

"This is the classic double-checked locking idiom. Without `volatile` on `instance`, it's broken. Explain _exactly_ why, in JMM terms, and give two cleaner alternatives."

### Layer 2 — Senior answer

The bug is the missing `volatile`. The line `instance = new Singleton()` is _not atomic_ — it's three steps: allocate memory, run the constructor, and assign the reference to `instance`. The JMM permits the compiler/CPU to _reorder_ steps 2 and 3, so `instance` can be assigned the address _before_ the constructor finishes. A second thread doing the first (unlocked) `null` check can then see a _non-null but not-yet-fully-constructed_ `instance` and return a partially-initialized object — a subtle, intermittent, catastrophic bug. Declaring `instance` `volatile` fixes it: the `volatile` write of the reference establishes a happens-before edge such that the construction (everything before the write) is guaranteed visible and _not reordered_ after the assignment, so any thread seeing a non-null `instance` sees a fully-built one. Two cleaner alternatives that avoid the whole trap: the _initialization-on-demand holder_ idiom (a static nested class whose static field is initialized by the classloader, which guarantees thread-safe lazy init for free), and the _enum singleton_ (a single-element enum, which the JVM guarantees is instantiated once and is serialization/reflection-safe).

### Layer 3 — How it works inside

`new Singleton()` decomposes (conceptually) into: (1) allocate the object's memory, (2) invoke the constructor to initialize fields, (3) publish the reference into `instance`. Without `volatile`, the JMM imposes no ordering between (2) and (3) as observed by _other_ threads, so a writing thread may legally make the reference visible before the field initialization is visible. The unlocked first check in another thread is the danger: it reads `instance` _without_ synchronization, so even though the writer was inside a `synchronized` block, the _reader_ never acquired that monitor and thus has no happens-before edge to the writer's construction. It can observe the reference write while _not_ observing the constructor's writes.

`volatile` repairs this because (Block 2) a `volatile` write acts as a _release_: all writes before it (the constructor's field stores) are visible to any thread performing the matching `volatile` _read_ (the first `null` check, now a volatile read), and the write can't be reordered before those stores. So 'non-null' now implies 'fully constructed.'

The alternatives sidestep reordering entirely by leaning on classloading guarantees:

```java
// Holder idiom — lazy AND thread-safe with no volatile/synchronized in the hot path
class Singleton {
    private Singleton() {}
    private static class Holder { static final Singleton INSTANCE = new Singleton(); }
    static Singleton get() { return Holder.INSTANCE; }  // Holder loads on first access
}
```

The JVM guarantees a class is initialized lazily, exactly once, and with full happens-before for its static initializers — so `Holder.INSTANCE` is built on first call to `get()`, thread-safely, with no explicit synchronization. And:

```java
enum Singleton { INSTANCE; /* methods, fields */ }   // simplest, also reflection/serialization-safe
```

The JVM instantiates enum constants once at class init; this is the form _Effective Java_ recommends as the best singleton.

### Layer 4 — Tricky follow-ups

**"Why does the holder idiom not need `volatile` or `synchronized`?"** Because the JLS guarantees class initialization is thread-safe and happens-before-correct: the `Holder` class isn't loaded until first referenced (lazy), and its static initializer runs exactly once under a JVM-internal lock, with the result safely published. You get lazy + thread-safe + no runtime synchronization cost on subsequent calls, for free.

**"Why is the enum singleton 'safer' than a class-based one?"** Because the JVM guarantees a single instance even against _reflection_ (you can't reflectively call an enum constructor) and _serialization_ (enum serialization is special-cased to return the canonical constant, not a new object). A class-based singleton can be broken by reflection (`setAccessible(true)` on the private constructor) or deserialization (creating a second instance) unless you defend against both manually.

**"Is double-checked locking ever the right choice today?"** Rarely — the holder idiom is cleaner for lazy statics, and the enum for the singleton case. DCL with `volatile` is correct and occasionally justified for _instance_ fields (not statics, where the holder idiom doesn't apply), but for class-level singletons the alternatives are simpler and harder to get wrong.

---

## Trap — Deadlock, livelock, starvation

### Layer 1 — Interview question

_(Amazon/Netflix-style, then detection)_ "State the four conditions necessary for deadlock. Give the standard prevention technique. Then: how is _livelock_ different from deadlock, and how would you _detect_ a deadlock in a running production JVM?"

### Layer 2 — Senior answer

The four _Coffman conditions_, all of which must hold simultaneously for deadlock: **mutual exclusion** (resources held exclusively), **hold-and-wait** (a thread holds one resource while waiting for another), **no preemption** (resources can't be forcibly taken away), and **circular wait** (a cycle of threads each waiting on a resource the next holds). Break any one and deadlock is impossible. The standard prevention is to break _circular wait_ via _lock ordering_ — establish a global order over locks and always acquire them in that order, so no cycle can form; alternatively use `tryLock(timeout)` to break _hold-and-wait_ (a thread that can't get the second lock backs off and releases the first). _Livelock_ differs from deadlock in that the threads aren't blocked — they're _actively running_ but making no progress, repeatedly reacting to each other (the classic two-people-stepping-aside-in-a-hallway). _Starvation_ is when a thread never gets CPU or a lock because others perpetually win (e.g. low-priority threads under a greedy scheduler, or writers under a flood of readers). To detect a deadlock live: take a thread dump with `jstack` (it explicitly reports 'Found one Java-level deadlock' and the cycle), or programmatically use `ThreadMXBean.findDeadlockedThreads()`.

### Layer 3 — How it works inside

A deadlock is a cycle in the _wait-for graph_: thread A holds lock 1 and waits for lock 2, thread B holds lock 2 and waits for lock 1 — neither can proceed, both are `BLOCKED` forever (from Block 2's state model, you'd see them `BLOCKED` on monitors in a dump). _Lock ordering_ prevents the cycle: if every thread acquires locks in a fixed global order (say, always lock with the lower identity hash / ID first), then no two threads can hold-and-wait in opposite directions, so no cycle is constructible. `tryLock(timeout)` attacks a different condition — it lets a thread give up and release what it holds, breaking _hold-and-wait_, then retry (often with a backoff to avoid livelock).

_Livelock_: threads respond to each other's actions in a way that prevents progress while consuming CPU — e.g. two threads each detect contention, back off, and retry in lockstep forever, or message-passing actors that keep handing a task back and forth. The fix usually involves randomized backoff (breaking the symmetry) so the threads stop mirroring each other.

_Starvation_: a thread is perpetually denied a resource — low thread priority on a busy system, an unfair lock where barging threads always win, or writer starvation in a non-fair read-write lock (Block 3A). Fairness policies and priority management address it.

_Detection_: `jstack <pid>` (or `kill -3`, or `jcmd <pid> Thread.print`) dumps all thread stacks and _automatically detects monitor-based deadlocks_, printing the cycle and the locks involved. Programmatically, `ThreadMXBean.findDeadlockedThreads()` returns the IDs of threads deadlocked on monitors _and_ on ownable synchronizers (`ReentrantLock` etc.), which `jstack` also reports — useful for building a watchdog that alerts on deadlock in production.

### Layer 4 — Tricky follow-ups

**"Which Coffman condition is easiest to break in practice, and how?"** Usually _circular wait_, via consistent global lock ordering — it's a discipline you can enforce in code review and even detect statically. The others are often intrinsic: mutual exclusion is the point of a lock, no-preemption is how Java monitors work, and hold-and-wait is hard to avoid without restructuring. So lock ordering is the workhorse prevention.

**"Can `tryLock` cause livelock instead of deadlock?"** Yes — if two threads both `tryLock`, both fail, both release and immediately retry in lockstep, they can spin forever making no progress (livelock). The fix is _randomized_ backoff before retry so they desynchronize. This is why naive 'just use tryLock' isn't a complete answer.

**"`jstack` shows two threads `BLOCKED` on monitors but reports no deadlock — what could it be?"** They might be blocked on locks held by a _third_ thread that's slow but not deadlocked (a long critical section, or a thread stuck on I/O which shows as `RUNNABLE`), so there's no _cycle_ — it's contention/starvation, not deadlock. Or the wait involves `Lock`/`Condition` patterns `jstack`'s monitor-deadlock detector handles, but the root cause is a missed signal. Distinguishing 'no cycle' (contention) from 'cycle' (deadlock) is the diagnostic skill.

---

## Trap — False sharing and `@Contended`

### Layer 1 — Interview question

_(Google/Netflix-style, performance)_ "Two threads each increment their _own separate_ counter — no shared data between them — yet throughput is terrible and gets _worse_ on more cores. The counters are adjacent fields. What's happening, and how do you fix it?"

### Layer 2 — Senior answer

That's _false sharing_. Even though the two counters are logically independent, they sit in the _same CPU cache line_ (typically 64 bytes) because they're adjacent in memory. CPU cache coherence operates at cache-line granularity, so when thread A on core 1 writes its counter, the coherence protocol _invalidates that entire cache line_ in core 2's cache — including thread B's counter, which A never touched. Thread B's next access then misses and must re-fetch the line, and vice versa, so the line _ping-pongs_ between cores' caches under the coherence protocol, generating heavy traffic despite zero logical sharing. It worsens with more cores because more caches contend for the same line. The fix is _padding_: ensure each counter occupies its own cache line so writes don't invalidate each other's. Java provides `@jdk.internal.vm.annotation.Contended` (the JDK's own annotation, used in `LongAdder`'s `Cell`s and `ForkJoinPool`) to pad a field/class onto its own cache line; in application code you'd typically rely on a structure like `LongAdder` that already does this, or pad manually.

### Layer 3 — How it works inside

Caches are organized in _lines_ (64 bytes on most x86/ARM). The cache-coherence protocol (MESI and variants) tracks ownership _per line_, not per variable: a core that writes a line must gain exclusive ownership, which _invalidates_ every other core's copy of that whole line. If two hot, independently-written variables share a line, every write by one core forces the other core to reload the line on its next access — the line bounces between caches (the 'cache-line ping-pong'), and each bounce is a coherence transaction far slower than an L1 hit. Crucially this happens _with no logical contention_ — the variables are never both accessed by both threads; it's purely an artifact of physical co-location, hence _false_ sharing.

The fix is to separate the variables onto different lines by _padding_ — inserting unused bytes so each hot variable's line contains nothing else hot. `@Contended` instructs the JVM to add this padding (by default ~128 bytes, to also defend against adjacent-line prefetching). It's why `LongAdder`'s `Cell` is `@Contended`: striped counters would be pointless if the cells shared a line — you'd just relocate the contention from logical (CAS on one field) to physical (coherence on one line). `@Contended` is restricted (you need `-XX:-RestrictContended` or it's only honored in the `jdk.internal` modules), so application code more often gets the benefit indirectly via JDK structures.

### Layer 4 — Tricky follow-ups

**"Why does adding threads/cores make false sharing _worse_, not better?"** Because more cores writing variables on the same line means more coherence invalidations and more contention for exclusive ownership of that one line — the ping-pong involves more participants and more traffic. So a 'parallel' optimization can _slow down_ with scale purely because of physical layout, which is deeply counterintuitive and a favorite interview reveal.

**"How would you even detect false sharing?"** It's subtle — it doesn't show up in logical contention metrics. You'd use a CPU profiler that surfaces cache-coherence stalls (e.g. `perf c2c` on Linux, or Intel VTune), look for high L2/L3 miss rates or HITM events on specific cache lines, and correlate to adjacent hot fields. Then confirm by padding and remeasuring. It's a hardware-level diagnosis, not a JVM-level one.

**"Is false sharing the same as the contention `LongAdder` solves?"** They're related but distinct. `AtomicLong`'s problem under contention is _true_ sharing — all threads CAS the _same_ variable, genuine logical contention. `LongAdder` splits that into per-thread cells (solving true sharing) _and_ pads the cells with `@Contended` (so the cells don't reintroduce _false_ sharing by sitting on one line). It addresses both layers — which is exactly why it scales.

---

### End of Block 3, Part B — and the end of the guide.

You now have all three blocks:

- **Block 1** — Collections Framework
- **Block 2** — Multithreading
- **Block 3A** — Atomics, CAS, Locks, AQS, Synchronizers
- **Block 3B** — Concurrent Collections, Executors, Patterns & Traps

Study suggestion: the Layer 2 answers are your spoken-interview material — rehearse them aloud to a timer. The Layer 3 internals are your reserves for follow-ups; you draw on them when an interviewer drills down, but you don't lead with them. The Layer 4 follow-ups are the most valuable part for AI-evaluated platforms (micro1, Outlier), which chain follow-ups until they hit your limit — so the goal is to have a genuine Layer 3 understanding behind every Layer 2 answer, because that's what lets you keep going when the questions go one level deeper than expected.
