# REVIEW-M05

- Route: a fresh read-only subagent (general-purpose, model sonnet), launched by S20261124-0001-claudecode-cloud. Sonnet wrote none of M05 (every M05 `Done by` is claude-opus-5-5). Per RUN.md §4 it received only these inputs: `modules/05-java-lambdas-streams-optional.md`, `_meta/modules/M05.md`, `_meta/QUALITY-BAR.md` and `STYLE-GUIDE.md`. For spot checks it could also read the m05 lab code, JDK 25 `src.zip`, and JEPs, JLS and Javadoc through `curl`. It ran no `mvn`. It was told not to flag prose length, or the §8 items Jorge approved (STATE standing note, HOUSE-10).
- Date: 2026-11-24. Module state: CLOSEd by CLOSE-M05 in the same session. 0 `TASK:` markers, 10 sections, 30 Q, 4 Ex, 3 Production scenario questions.
- Commands the reviewer ran:
  - `grep -c 'TASK:'` → 0
  - D1 counts → 30/30/30/30/30
  - `module-stats.mjs` → 05: 30 Q, 4 Ex, 3 PS, no flags
  - `check-links.mjs --planned .` → all links resolve
  - basis tags → Doc 311, Lab 274, Src 189, Unverified 0
  - C8 URL comparison → 1 URL missing from the 05 block (jcmd man page)
  - snippet script, 63 fenced blocks → all Complete blocks byte-identical to their files; all Excerpts verbatim, in order
  - Ex05.n DisplayName mapping → complete both ways
  - 7 Output questions diffed against `Q05OutputsTest` → all match
  - about 120 quotes checked against JLS 25, the JEPs, JVMS §6.5, the JDK 18 release note, Javadoc 8/9/10/21/25 and `src.zip`
  - `javac -XDrawDiagnostics` on `Integer::toString` → `compiler.err.prob.found.req` / `compiler.misc.ref.ambiguous`
- **Verdict: CHANGES_REQUIRED** (0 BLOCKER · 1 MAJOR · 7 MINOR · 7 NIT) → FIX-M05-01..04.

## Findings (transcribed from the reviewer's report)

1. **MAJOR** · §1 "Lambda vs anonymous class", bullet "What they capture and compile to": "An anonymous class declared in an instance method keeps a reference to the enclosing instance, which is how listeners leak."
   - Problem: as an unconditional statement this is false since JDK 18, where javac omits an unused `this$0` (`Serializable` classes excepted). Q05.03 and Q01.26 already state the nuance, and no Version note mentions it (B9).
   - Evidence: the JDK 18 release note; `Q05OutputsTest.q05_03_enclosingInstanceFieldOnlyWhenUsed`.
   - Fix: add "when its body uses it (javac 18 and later omit the `this$0` field otherwise, except in `Serializable` classes)", and add a Java 18 line to the Version notes with Doc and Lab tags.
2. **MINOR** · C8 · Q05.25 Evidence bullet. The URL `https://docs.oracle.com/en/java/javase/25/docs/specs/man/jcmd.html` is missing from the `## 05` block of SOURCES.md. Fix: add it.
3. **MINOR** · C1 · Q05.17 Full explanation. The quote "by updating the state of the result rather than by replacing the result" is tagged to the package summary (`#MutableReduction`), but it comes from the `Stream.collect(Supplier, …)` Javadoc. Fix: retag it as `[Doc: Java 25 API, Stream]`, or quote the package summary's own wording.
4. **MINOR** · C1/C12 · Ex05.2 follow-up "Why not declare `CONCURRENT`".
   - Problem: the quote "allows errors arising from groups of operations that need to be perceived atomically" is in JLS §17.4.3, not §17.4.5, and the argument mixes "data race" with a statement about race-free programs.
   - Fix: cite §17.4.5 for the data-race definition, then "even with `volatile` fields (race-free), `count++` is a non-atomic read-modify-write" with a JLS §17.4.3 tag.
5. **MINOR** · §2 How it actually works: "everything after `lambda$` is javac's own choice, so the lab asserts only the prefix".
   - Problem: `CompiledFormTest.lambdaBody_isInstanceMethod_onlyWhenItUsesThis` matches `lambda$field` and `lambda$local`, which relies on javac's `lambda$<enclosingMethod>$n` naming.
   - Fix: reword the sentence to "the prefix plus the enclosing method's name", or find the body method through the call site's implementation handle.
6. **MINOR** · C4 · Status markers missing at first mention:
   - `Stream.gather` in §4 Version notes and the §7 body: add `[Final since Java 24, JEP 485]`.
   - Class-File API, first used near the start of §2 (marker only in the §2 Version notes).
   - Hidden classes, JEP 371 (marker only later).
   - `sun.misc.Unsafe::defineAnonymousClass`, called "deprecated" with no marker.
   - Fix: put the markers at the first body mention; for the `Unsafe` method use `[Deprecated since Java 15]` or drop the status word.
7. **MINOR** · STYLE-GUIDE §4.1 · Untagged paragraphs:
   - §9 How it works: "The option that does not appear on the list…".
   - §9 Failure modes: the swallowed exception, and the descriptor leak.
   - §10 Failure modes: `NoSuchElementException` from `get()`, and `orElse(database.load(key))`.
   - Fix: add Doc, Src or Lab tags, or cross-reference the tagged callout or question.
8. **MINOR** · B14 · Terms used before a gloss or link:
   - hidden class (§2 diagram and text)
   - data race (§6) and happens-before (Ex05.2)
   - thread dump (§4)
   - try-with-resources (§6, before §9)
   - young-generation garbage (§6) and JIT (Q05.19)
   - the `SIZED`/`SORTED` flags (§4)
   - common-pool parallelism (§6, before §8)
   - Fix: a one-clause gloss plus a link (11, 10, 08, 06 or §8).
9. **NIT-A** · Tags not covering the sentence:
   - Q05.05: "Inner classes would have fixed one class file per lambda…" has no tag.
   - Q05.24 "Ordering" row and §8 list `sorted` as a cost of ordered parallel pipelines; the cited Javadoc does not say so.
   - §8: "the speed-up seen in a single-user benchmark shrinks as concurrent requests grow" has no basis (C11).
   - §3: "the nested reason names the ambiguity" is not asserted by `MethodReferenceRulesTest`.
   - §2: the `count[0]++` race has no JLS §17 tag (C12).
10. **NIT-B** · §9: the misquote "do not need to be closed after use"; the Javadoc reads "do not actually need to be closed". Fix: insert "actually".
11. **NIT-C** · D1/D9 · Q05.27 and Q05.30: the "*Prevention and monitoring.*" bullet sits after `**Code.**`. Fix: move it above `**Code.**`.
12. **NIT-D** · G1 repetition:
    - The Q05.24 and Q05.25 follow-ups both ask about `customPool.submit(…)`.
    - The "undocumented implementation behavior" point appears in §8 prose and again in a best-practice bullet.
    - Q05.14's Full explanation repeats §5's `toMap` paragraph almost word for word.
    - Fix: replace the Q05.24 follow-up with a link to Q05.25, and shorten Q05.14 to a pointer to §5.
13. **NIT-E** · Ex05.1 Constraints, "Every public method is one stream pipeline that ends in one `collect`": `topCustomers` streams again inside its finisher. Fix: "one top-level `collect`; a finisher may stream the collector's own result".
14. **NIT-F** · Ex05.4 criterion (4), "with the original cause kept": the absent-key case has no cause. Fix: "with the `NumberFormatException` kept as the cause when the value is not a number".
15. **NIT-G** · B13 · §7 has no `**Security:**` item, although its failure modes describe size-driven memory use and a per-request fan-out multiplier. Fix: add "bound `n` and `maxConcurrency` when they derive from client input".

## Checked and fine (reviewer's summary)

- A1–A6.
- §2.2 subsection order in all 10 sections; 5 mermaid diagrams, each with a "what to notice" line.
- B6, B7, B8, B10, B11/B12, B15.
- C1 sample of about 40 claims; C2; C3 (every "in the lab" test named exists and asserts the claim); C6; C9; C10; C11.
- D1–D9; E1–E4; F1–F4; G2.
- Specific facts:
  - `ForkJoinPool` parallelism formula and its system property
  - the `IntStream.range` split
  - the `mapConcurrent` implementation
  - the `toMap` messages
  - the `ForkJoinTask` rewrap
  - JLS 9.8, 15.13.3, 15.27.4, 11.2.3 and 14.4.1
  - JEPs 358, 371, 473 and 485

## Main-session notes (S20261124-0001-claudecode-cloud, not part of the independent review)

- No finding touches the §8 items Jorge approved (HOUSE-10); none is rejected.
- Finding 5: per the plan's R3 rule, prefer changing the test to locate the body method through the call site's implementation handle. If that makes the test heavier than the claim is worth, reword the sentence.
- Finding 12 is a readability finding (G1). Every claim keeps its basis tag when text is shortened.

## Resolutions

- **FIX-M05-01** (S20261124-0601-claudecode-cloud). Findings 1, 3, 4, 5 and 10 accepted, each checked in its source first:
  - 1: JDK 18 release note "Enclosing Instance Fields Omitted from Inner Classes That Don't Use Them" (read with `curl`: unused `this$` fields omitted since JDK 18; "Subclasses of java.io.Serializable are not affected"). §1 bullet now says the anonymous class keeps the enclosing instance when its body uses it, with Doc and Lab tags; §1 Version notes gain a Java 18 line.
  - 3: the quote is in `Stream.collect(Supplier, BiConsumer, BiConsumer)` (src.zip `Stream.java` line 1110), not in the package summary's `#MutableReduction` section; Q05.17 retagged `[Doc: Java 25 API, Stream]`.
  - 4: JLS 25 page read with `curl`: "perceived atomically" sits in §17.4.3, the data-race definition in §17.4.5. The Ex05.2 follow-up now cites §17.4.5 for the definition, then "making the fields `volatile` removes the race but not the bug" with the quote tagged §17.4.3.
  - 5: route chosen per the main-session note: `CompiledFormTest.lambdaBody_isInstanceMethod_onlyWhenItUsesThis` now finds each body through the call site's implementation handle (bootstrap argument 1) and also asserts the non-capturing body is `static`, so the §2 claim "the other two are `static`" is fully asserted. The §2 sentence now says the lab asserts only the prefix and locates bodies by call site, not by name.
  - 10: src.zip `Stream.java` line 139 reads "do not actually need to be closed after use"; "actually" inserted in §9.

