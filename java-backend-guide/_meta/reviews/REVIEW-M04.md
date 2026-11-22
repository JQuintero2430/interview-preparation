# REVIEW-M04

- Route: a fresh read-only subagent (general-purpose, model sonnet), launched by S20261122-0001-claudecode-cloud. Sonnet wrote none of M04 (every M04 `Done by` is claude-opus-5-5). Per RUN.md §4 it received only these inputs: `modules/04-java-collections-internals.md`, `_meta/modules/M04.md`, `_meta/QUALITY-BAR.md` and `STYLE-GUIDE.md`. For spot checks it could also read the m04 lab main and test code, `SOURCES.md` "## 04" (C8 only) and JDK 25 `src.zip`. It was told about decision 21 (no length target) and the owner-approved Ex04.2 and Ex04.3 criteria. It did not run Maven.
- Date: 2026-11-22. Module state: CLOSEd by CLOSE-M04 in the same session. 0 `TASK:` markers, 10 sections, 32 Q, 3 Ex, 4 Production scenario questions.
- Commands the reviewer ran:
  - `grep -c 'TASK:'` → 0
  - D1 counts → 32/32/32/32/32
  - `module-stats.mjs` → 04: 32 Q, 3 Ex, 4 PS, no flags
  - `check-links.mjs --planned .` → all links resolve
  - basis tags → Src 671, Lab 222, Doc 89, Unverified 0
  - snippet script → 4 Complete blocks identical to their files; 36 Excerpts match (3 differ only by dedent)
  - C8 URL comparison → 88 URLs, identical in both directions
  - `src.zip` reads of 16 `java.util`/JDK classes
  - WebFetch of JEP 180 → 403
- **Verdict: CHANGES_REQUIRED** (0 BLOCKER · 0 MAJOR · 8 MINOR · 7 NIT) → FIX-M04-01..04.
- **Main-session notes (S20261122-0001-claudecode-cloud, not part of the independent review):**
  - Finding 8: openjdk.org and docs.oracle.com answer `curl` through the proxy (STATE standing notes, since 2026-11-20/21), although WebFetch fails. FIX-M04-02 reads JEP 180, the Collections Design FAQ and the compatibility page with `curl`. It shortens or removes only the quotes those pages do not contain.
  - Finding 13 is a readability finding (G1). QUALITY-BAR C1 still applies: every claim keeps a basis. FIX-M04-03 merges repeated tags only when they cite the same file inside one paragraph, per the STYLE-GUIDE §4.1 rule that "a tag covers the sentences before it in its paragraph". Tags on different files, and tags inside callouts, stay.
  - Finding 10 (dedented Excerpts) is house style shared with M01–M03. FIX-M04-04 makes the three dedented Excerpts verbatim, so that C7's `grep -F` per line passes.

## Resolutions

(none yet)

## Review (verbatim from the subagent)

**Verdict: CHANGES_REQUIRED** (0 BLOCKER · 0 MAJOR · 8 MINOR · 7 NIT)

None of the findings is a blocker. The factual slips are small, but each one is a wrong statement in the text and should be fixed.

**Commands run:**
- `grep -c 'TASK:'` → 0.
- D1 counts → 32/32/32/32/32.
- `node labs/tools/module-stats.mjs` → 04: 32 Q, 3 Ex, 4 PS, 54,557 prose words, no flags.
- `node labs/tools/check-links.mjs --planned .` → "All links resolve."
- The greps from the Measuring block → Version notes 10, Production scenario callouts 4, Security 5, Framework vs language 0, Mermaid 5.
- Basis tags → Src 671, Lab 222, Doc 89, Unverified 0.
- An inline read-only script checked all 40 fenced `java` blocks:
  - the 4 Complete blocks are byte-identical to their files;
  - of the 36 Excerpts checked line by line, 33 match in order;
  - the other 3 (one in Q04_02, two in Q04_07) differ only because they are dedented; this is not a content error (finding 10).
- C8 URL comparison against SOURCES.md "## 04" → identical in both directions (88 URLs).
- I read all 32 m04 test files and matched every Output ID, every named lab and every exercise criterion to a `@DisplayName`.
- `grep Thread.sleep` over the m04 tests → nothing. There is no Testcontainers code and no `@Autowired`.
- In `/opt/jdk-25/lib/src.zip` I read `HashMap`, `ArrayList`, `ArrayDeque`, `PriorityQueue`, `Vector`, `Arrays`, `ImmutableCollections`, `IdentityHashMap`, `ConcurrentHashMap`, `MessageDigest`, `Collections`, `Collection`, `LinkedHashMap`, `SortedSet`, `TreeMap` and `EnumMap`.
- WebFetch of JEP 180 returned 403 (finding 8).

### Items

| Item | Result | Evidence |
|---|---|---|
| A1 | PASS | Header fields are in order. Applies to: Java 25 matches VERSIONS.md. The Labs command uses the TASKS.md row 2 form. |
| A2 | PASS | All three prerequisite links have a `#` anchor. |
| A3 | PASS | 3 section links and 5 question IDs, ending with the Summary link. |
| A4 | PASS | 15 Contents links = 16 `^## ` headings − 1. |
| A5 | PASS | The order runs hierarchy → lists → HashMap → ordered maps → sets → queues → iterators → immutables → utilities → choosing. No section needs a later one, and §10 is the deepest. |
| A6 | PASS | 0 TASK markers. |
| B1 | PASS | Each of the 7 subsections appears 10 times. |
| B2 | PASS | All 10 "The problem it solves" subsections open with a concrete failure. |
| B3 | PASS | 5 Mermaid diagrams: class hierarchy, putVal flow, heap, iterator sequence, choosing a collection. Each has a "what to notice" sentence. §4 and §9 have no diagram, which the plan allows. |
| B4 | PASS | Each "How it actually works" answers a why question, for example why the mask needs the spread step, and why `hasNext` creates the second-to-last case. |
| B5 | PASS | Every Code subsection and Worked solution gives the approach and numbered steps before the code. |
| B6 | PASS | Every best-practice item has a "because" clause. |
| B7 | PASS | Every trap gives the correction and where the myth comes from. The once-true `ArrayDeque` item carries a marker. |
| B8 | n.a. | 0 callouts, and no STYLE §6 topic applies to this module. |
| B9 | PASS | 10 Version notes, one per section. They cover the changed behaviors: tree bins, `newHashMap`, `ArrayDeque` in Java 9, TimSort in Java 7, `toList`, sequenced collections. |
| B10 | PASS | 4 callouts (≥ 2). Each has the interviewer's framing, the evidence, the fix and the prevention. |
| B11 | PASS | Every Failure modes subsection covers behavior under load or memory pressure and what bounds it. |
| B12 | PASS | Configuration, observability and deployment are covered where they apply (jcmd, JFR, heap histogram, GC log). |
| B13 | PASS | `**Security:**` items in §3, §6, §8, §9 and §10. §4 has an unbounded-cache dimension without an item (finding 12, NIT). |
| B14 | PASS | Terms are defined on first use; see nit 15. |
| B15 | PASS | One-line links, not re-explanations, for concurrency (→ 12), streams (→ 05), references (→ 08) and the Iterator pattern (→ 51). |
| C1 | PASS with findings | I sampled 24 claims and verified 12 `[Src]` claims in src.zip: HashMap constants and comments, ArrayList complexity, Javadoc quotes and `modCount`, ArrayDeque and PriorityQueue growth, `LegacyMergeSort`, the `listFromArray` TOCTOU comment, the IdentityHashMap Knuth reference, the ConcurrentHashMap Segment note, `MessageDigest.isEqual`. All hold. See findings 1–6 and 8. |
| C2 | PASS | Each of the 8 Output IDs (02, 07, 10, 15, 21, 23, 27, 30) has a `Q04.NN ·` test. I diffed all 8 answers against their assertions; all match. |
| C3 | PASS | About 40 "in the lab" claims traced, each to an existing test class and then to a `@DisplayName` or an assertion (for example `containsKey(null)` and `EnumSet.copyOf`). |
| C4 | PASS | Only the STYLE forms are used (nit 11). |
| C5 | PASS | No API is absent from JDK 25. `newHashMap` and `newLinkedHashMap` are `@since 19`. |
| C6 | PASS | 0 `[Unverified:]` tags. |
| C7 | PASS | Complete blocks: 4 of 4 identical. Excerpts: 36 of 36 match in order, apart from the dedent noise of finding 10. No Partials. |
| C8 | PASS | The two URL sets are identical. |
| C9 | PASS | 19 ledger lines found in the module. Partial check: I did not read the `_meta/sources` rows. |
| C10 | PASS | The only GC-dependent test, Q04.18, uses a bounded retry and `assumeTrue`. The CHM test accepts either outcome for new keys. No sleeps. |
| C11 | PASS | Every numeric table cell has a tag, or is derived and labeled as such (for example 50.3M node moves, checked in the lab). |
| C12 | n.a. | No JMM claims; racy behavior is delegated to 11 and 12. |
| D1 | PASS | 32/32/32/32/32. |
| D2 | PASS | All 8 Output answers give the exact lines plus the reasoning. |
| D3 | PASS | 6 tags; the largest share is Concept at 31%. Trade-off 2, Bug hunt 3, Production scenario 4, Output 8. |
| D4 | PASS | The questions follow the section order, basic → trade-off. |
| D5 | PASS | No duplicates of M01–M03 questions; overlaps are links. |
| D6 | PASS | 96 `](#q04-` links; every question ID is linked. |
| D7 | PASS | 32 anchors, each directly above its heading. |
| D8 | PASS | 32 questions (the ceiling) and 3 exercises; no flags. |
| D9 | PASS | Q04.13, .18, .26 and .32 each follow symptoms → ranked hypotheses → evidence (JFR, `GC.class_histogram`, heap dump, `Thread.print`) → fix → prevention and monitoring. I re-derived the Q04.13 arithmetic and Q04.32's n(n−2)/4; both are correct. |
| E1 | PASS | All anatomy labels are present for Ex04.1–04.3: 4 follow-ups each, and the Tests link. |
| E2 | PASS | Every criterion (1)–(5) has an `Ex04.n · (k)` test, and every test maps to a criterion. Plan-row differences not flagged, as instructed. |
| E3 | PASS | Ex04.3 integrates §2 and §7, as the plan accepts. |
| E4 | PASS | No `@Autowired`; every constructor has ≤ 4 parameters. The only method over 20 lines is `SimpleHashMap.put` at 21 (nit 14). |
| F1 | PASS | 3 paragraphs; each section's claim and trap, linked; nothing new. |
| F2 | PASS | 6 prompts, each naming a listener. |
| F3 | PASS | 10 flashcards. |
| F4 | PASS | Builds on / Read next / Uses these ideas later / Comparisons, each a link with a reason; the link check resolves them. |
| G1 | PASS with finding | Finding 13. |
| G2 | PASS | All 10 SYLLABUS items map to sections and questions, as in the plan table. |
| H1 | not run by reviewer (main session ran the build) | |
| H2 | not run by reviewer (main session ran the build) | |
| H3 | PASS | Link check exits 0. |
| H4 | PASS | No flags. |
| H5 | PASS | No Testcontainers or `@Container` in m04. |
| H6 | PASS | `git status --short -- .` was empty at review time. |

### Findings

#### Group A: factual accuracy and wording → FIX-M04-01

1. **MINOR. §8 Production scenario, Reasoning.**
   - Text: "the same 140 changes also made `null` elements legal where `toUnmodifiableList()` would have rejected them".
   - Problem: `Collectors.toList()` already accepted `null`. The closing paragraph of §8 says the swap changes only mutability ("unlike `toUnmodifiableList()`, it keeps accepting `null`"), so the refactor did not make `null` legal.
   - Fix: "Note that neither `toList()` nor `Collectors.toList()` rejects `null`; if the callers wanted a null-rejecting list, `Collectors.toUnmodifiableList()` is the one to choose."
2. **MINOR. Q04.25 table.**
   - Text: the weakly consistent column lists `EnumMap` and `EnumSet`, and its "Safe with other threads" cell says `yes`.
   - Problem: `EnumMap` and `EnumSet` are not thread-safe. Their iterators are weakly consistent, but the collections themselves are unsynchronized.
   - Fix: move the two classes to a footnote, or change the cell to "yes for the `java.util.concurrent` collections; `EnumMap`/`EnumSet` are not thread-safe".
3. **MINOR. Q04.12 Trap.**
   - Text: "only `HashMap` (and `LinkedHashMap`) accept a `null` key".
   - Problem: false in general. `IdentityHashMap` and `WeakHashMap` allow a `null` key (the module's own §4 table says so), and so does a `TreeMap` with a null-tolerant comparator.
   - Fix: "Of these three, only `HashMap` accepts a `null` key."
4. **MINOR. Q04.28 follow-up.**
   - Text: "It has the same `E...` signature, so … `List.of(new int[] {1, 2, 3})` also has size 1".
   - Problem: the call resolves to `List.of(E e1)`, not to varargs. The size is 1 because an `int[]` is a single reference-type `E`.
   - Fix: "It also yields a one-element list: `List.of(E e1)` takes the `int[]` as a single `E`."
5. **MINOR. Q04.01 follow-up 3.**
   - Text: "`List`, `Set`, `Queue`, and through them `Deque`, `SortedSet`, `NavigableSet` and the sequenced interfaces".
   - Problem: `SequencedCollection` extends `Collection` directly (the module's own §1 diagram shows this), and `Deque` extends both `Queue` and `SequencedCollection`.
   - Fix: list `SequencedCollection` as a direct subinterface.
6. **MINOR. §4 The problem it solves.**
   - Text: the serializer "writes one object twice and another not at all, because two distinct objects are `equals`".
   - Problem: two distinct but equal objects explain the skipped one, not the one written twice.
   - Fix: "…skips an object because an equal but distinct one was already written", or add a second cause, such as a key whose `hashCode` changed.
7. **NIT. §1 Version notes.**
   - Text: "Java 21: … `getFirst`, `getLast` and `reversed()` on every `List` and `Deque`".
   - Problem: `Deque.getFirst` and `Deque.getLast` exist since Java 6; only `reversed()` is new on `Deque`.
   - Fix: "`getFirst`, `getLast`, `removeFirst`, `removeLast` and `reversed()` on every `List`, and `reversed()` on `Deque`."

#### Group B: basis tags, snippet kinds, lab claims → FIX-M04-02 (8, 9, 11), FIX-M04-04 (10)

8. **MINOR (needs verification). Quotes not confirmed.** WebFetch returned 403, and none of these is in src.zip:
   - JEP 180: "will likely result in a change to the iteration order", "some legacy code that uses it is known to depend upon iteration order" and "from O(n) to O(log n)" (§3, Q04.11, Version notes).
   - Design FAQ: "the most controversial design decision", "twenty or so interfaces and five iterators" and "a sound engineering compromise" (Q04.03).
   - Design FAQ: "mappings are not collections and collections are not mappings" (Q04.01).
   - The Oracle compatibility page URL (§9 Version notes).
   - The `jdk-9%2B181/jdk/src/java.base/...` and `jdk8u/master/jdk/src/share/...` paths used for the `ArrayDeque` claim.

   Fix: fetch each one once, confirm the wording and that each path resolves, and shorten the quotes to what is there.
9. **NIT. References to the planning document in reader-facing text.**
   - Text: §10 "(M04 plan §1)" and §4 "(lab rule, M04 §1)".
   - Problem: the module's own §1 has no such rule, which makes the second reference misleading.
   - Fix: "the lab has no object-layout tool" and "the lab asserts nothing about when the collector runs".
10. **NIT. Output snippets with an `// Excerpt of …` header are indented inconsistently.**
    - Q04_02 and Q04_07 are dedented to their `main` body, so their lines are not verbatim file lines. Q04_09, Q04_10, Q04_15, Q04_21 and others keep the file's indentation.
    - The header itself is house style (M01–M03).
    - Fix: pick one indentation rule.
11. **NIT. C4 markers at first mention.**
    - `[Changed in Java 9]` for `ArrayDeque` appears only in the §6 Version notes and Misconceptions, not at the first mention of `ArrayDeque` (§1, §2).
    - `HashMap.newHashMap` (`@since 19`) has no marker at its first mention.
    - Fix: add the markers at first mention, or accept the Version-notes placement.

#### Group C: checklist misses → FIX-M04-04

12. **NIT. B13: §4 has no `**Security:**` item.**
    - An unbounded cache or map keyed by outside input is a memory-exhaustion path. It is covered by the §10 Security item and a Q04.31 follow-up, but not in §4.
    - Fix: add one `**Security:**` item in §4 (bound caches keyed by outside input).

#### Group G: readability and repetition → FIX-M04-03

13. **MINOR. Citation density.**
    - Many paragraphs carry 3 to 12 consecutive identical full-URL `[Src: JDK 25, java.util.X](…)` links. The §1 "Sequenced collections" paragraph has about 14, and the same `HashMap.java` link repeats in nearly every sentence of §3. This is hard to read as plain text.
    - STYLE §4.1: "a tag covers the sentences before it in its paragraph".
    - Fix: one tag per file per paragraph, at the end of the paragraph.

#### Group N: nits → FIX-M04-04

14. **NIT.** `SimpleHashMap.put` is 21 lines, against the E4 reading threshold of 20. Extracting the tail append brings it under.
15. **NIT.** "amortized constant" is used from §2 on without an inline gloss (it is explained only in a Q04.04 follow-up), and the "Poisson table" in §3 is unexplained. Fix: add a one-line gloss at the first use of each.
