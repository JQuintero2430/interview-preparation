# REVIEW-M03

- Route: fresh read-only subagent (general-purpose, model sonnet), launched by S20261120-1201-claudecode-cloud. It received only `modules/03-java-generics.md`, `_meta/modules/M03.md`, `_meta/QUALITY-BAR.md`, `STYLE-GUIDE.md` and `labs/java-language/src/{main,test}/java/dev/interview/javalanguage/m03/` (RUN.md §4), plus `SOURCES.md` "## 03" for C8 only and JDK 25 `src.zip` for spot checks. The writing contexts of module 03 ran on claude-fable-5-2 (SEC-M03-01..07) and claude-opus-5-5 (PLAN, SEC-M03-08, QB, EX, CLOSE), all in other sessions; the reviewer ran on a third model.
- Date: 2026-11-20. Module state: CLOSEd by CLOSE-M03, 2,387 lines, 0 `TASK:` markers, 8 sections, 24 Q, 3 Ex, 3 Production scenario questions, 24,711 prose words (advisory 18,000, decision 19).
- Ran (read-only): read the whole module, the plan, QUALITY-BAR, STYLE-GUIDE and every m03 lab file; `grep -c 'TASK:'` (0); D1 counts (24/24/24/24/24); tag counts (Lab 136, Doc 112, Src 54, Unverified 0; Framework vs language 2; Version notes 3; Production scenario callouts 2; Security 0); `module-stats.mjs | grep java-generics` (24 Q, 3 Ex, 3 PS, flags none); `check-links.mjs --planned .` (exit 0); a scratch C7 script (14 Complete snippets byte-identical, 33 Excerpts in order; deleted); a C8 URL diff against SOURCES.md "## 03" (no difference); JDK 25 `src.zip` checks of `Collections`, `ArrayList`, `Collection`, `SafeVarargs`, `ParameterizedType`; `git status --short -- .`. Network docs blocked, so JLS wording was not re-read (findings marked "needs verification"). Not re-run: H1/H2 (CLOSE-M03 `verify -DexcludedGroups=docker` → exit 0, 567 java-language tests). Not read by instruction: VERSIONS.md, TASKS.md, ledgers, other modules.
- **Verdict: CHANGES_REQUIRED** (0 BLOCKER · 3 MAJOR · 15 MINOR · 6 NIT).
- **Main-session notes (S20261120-1201-claudecode-cloud, not part of the independent review):**
  - Re-checks required by the task: B13 → FAIL (MINOR), finding C4 (a §7 security item on binding untrusted JSON to a specific token); G1 → FAIL (MAJOR), findings G1–G4 (≈2,200–2,600 words of repetition).
  - Findings A4 and A7 are flagged "needs verification" by the reviewer; FIX-M03-01 must read JLS 25 §9.6.4.7 / §8.4.1 (or `src.zip`, and the labs pom for Jackson group IDs) before editing and leave the text unchanged where the source agrees with it. Finding C4's basis (OWASP / Jackson polymorphic-typing docs) must be read and recorded in SOURCES.md; if neither can be fetched through the proxy, record an UNVERIFIED item with a VERIFY task instead of writing an untagged claim.
  - Finding A1 is consistent with the rule that each anonymous class expression declares exactly one class (JLS §15.9.5), so it is queued as is; FIX-M03-01 confirms it (JLS text or a lab assertion that two `new TypeRef<…>(){}` evaluations at one site share `getClass()`) before editing.

## Resolutions

- FIX-M03-01 (S20261120-1201-claudecode-cloud): group A accepted in full; A4 rewritten on `src.zip` bases because the JLS was unreachable.
- FIX-M03-02 (same session): group B accepted in full; four tests and one lab class added.
- FIX-M03-03 (same session): group C accepted, except one part of C3: the Doc tags on the Java 7 / Java 10 entries of the §2 L393 Version notes stay, because every claim in a callout keeps its own basis (QUALITY-BAR C1); only the repeated `[Final since Java 10, JEP 286]` marker at L408 was dropped.
- FIX-M03-06 (same session): N1–N4 accepted (nine plain `§n` references linked; §6 opens on the `snapshot()` crash; Q03.24 in §7's drill list; Spring Boot 4.1.2 in Applies to, as VERSIONS.md's lab line); N5 accepted as optional, no change.
- 2026-11-20, SYLLABUS §9 decision 21 (Jorge): the 18,000-word target is eliminated. Item G1 and group G are re-read as readability findings: the word counts and savings quoted below are no longer goals, and FIX-M03-04/-05 cut repetition only where it makes the text harder to follow.

## Items

| Item | Result | Evidence |
|---|---|---|
| A1 Header | PASS | Fields in §2.1 order, Labs run command, "Needs Docker: no"; Java 25 and Spring Framework 7.0.10 match the plan and the SOURCES `v7.0.10` tags. |
| A2 Prerequisites deep-link | PASS | Both 01 prerequisites carry `#8-…` and `#9-…` anchors. |
| A3 Short on time | PASS | 3 section links, 5 question IDs (Q03.02, .09, .11, .15, .20), ends with Summary. |
| A4 Contents | PASS | 13 links = 14 `## ` headings − 1. |
| A5 Order of concepts | PASS | §3 and §2 point forward to erasure (§5) but define what they need inline. |
| A6 No open regions | PASS | `TASK:` count 0. |
| B1 Subsections | PASS | All 7 subsection headings ×8. |
| B2 Concrete problem | PASS | All 8 show a failure; §6 L895 reads as a design contrast (N2). |
| B3 Mental model and diagrams | FAIL (MINOR) | 4 mermaid blocks, each with "what to notice"; §5 L768 and §7 L1042 have no analogy, §4 L567 thin (C2). |
| B4 Mechanism depth | PASS | `checkcast`, JLS 4.12.2, poly expressions, leftmost-bound erasure, containment and capture, bridge descriptors, `elementData`, `getGenericSuperclass`, `Object &`. |
| B5 Approach before code | FAIL (MINOR) | §5 L798, §6 L919, §7 L1076, §8 L1187 have one line and no steps (C1). |
| B6 Reasons on every practice | PASS | Every item has a "because"; L1146's reason is wrong (A1), L210 garbled (A2). |
| B7 Misconceptions with history | PASS | All 31 items give the origin; L217 should mention boxing (A3). |
| B8 Framework vs language | PASS | §5 (`BridgeMethodResolver`), §7. |
| B9 Version notes | FAIL (MINOR) | §1, §2, §5 have notes; §6 has none for `@SafeVarargs` (Java 7, Java 9) or `toArray(IntFunction)` (Java 11) (C3). |
| B10 Production scenario callouts | PASS | §6 L1014, §7 L1139. |
| B11 Failure modes and load | PASS | Compile-time sections say so; §5–§7 failures deterministic. |
| B12 Operational concerns | PASS | `-Xlint`, `-Werror`, `javap`, `Method.isBridge`, binary compatibility. |
| B13 Security per topic | FAIL (MINOR) | 0 items; §7 is about deserialization targets, a STYLE §3 security topic (C4). |
| B14 Terms defined on first use | FAIL (MINOR) | "idempotency key" L1834, "descriptor" L792, `javap` L816 undefined (C5). |
| B15 Cross-links over repetition | PASS | Links to 04, 05, 02 §4, 18, 15, Q01.19; in-module repetition under G1. |
| C1 Every claim has a basis | FAIL (MINOR) | L872 `--release 15` untagged; L915/L1927 JLS attribution; Q03.24 typed-key claims (A4, A5, B3). |
| C2 Output answers are run | PASS | Q03.02, .05, .08, .09, .15, .16, .20 each have a matching test; short answers match. |
| C3 Lab claims are tested | PASS | 13 "in the lab" sentences map to named tests. |
| C4 Status markers | FAIL (MINOR) | JEP 286 marker repeated at L408; no marker for the Java 16 `instanceof` change (L872, L887) or Java 9 private `@SafeVarargs` (L915) (C3). |
| C5 Versions exist | PASS | JDK 25 APIs checked in src.zip; Jackson numbers not checked against VERSIONS.md (A7). |
| C6 No unrecorded uncertainty | PASS | 0 `[Unverified:`. |
| C7 Snippet kinds | FAIL (MINOR) | 14 Complete byte-identical, 33 Excerpts in order; L491–504, L1109, L1118 are not whole members (B1, B2). |
| C8 Sources recorded | PASS | URL sets equal. |
| C9 Ledger rows answered | PASS | core-java-240-06-20 at Q03.20; the qualifier row at L1070. |
| C10 Nondeterminism | PASS | No `Thread.sleep`; reflection results filtered or sorted. |
| C11 Trade-off numbers | PASS | No measured numbers in tables. |
| C12 JMM claims | N/A | |
| D1 Answer anatomy | PASS | 24/24/24/24/24, 2 follow-ups each. |
| D2 Output short answers | PASS | Exact output plus reasoning. |
| D3 Type mix | PASS | 7 types, max 29%. |
| D4 Progression | PASS | Section order. |
| D5 No duplicates | PASS | Within module (Q03.12 overlaps §4, G1). |
| D6 Linked from the body | PASS | 48 `](#q03-` links; §7 drill list omits Q03.24 (N3). |
| D7 Anchors and heading format | PASS | 24 + 3 anchors. |
| D8 Counts | PASS | 24/24 Q, 3/3 Ex. |
| D9 Production scenario answers | PASS | Q03.03, .13, .18. |
| E1 Anatomy | PASS | All labels in Ex03.1–3. |
| E2 Criteria ↔ tests | PASS | 7 / 5 / 5 tests, each named by criterion. |
| E3 Progression | PASS | Ex03.3 integrates §5 and §7. |
| E4 Real code | PASS | No injection, short methods. |
| E5 Rubric quality | N/A | |
| F1 Summary | PASS | |
| F2 Explain it back | PASS | 5 prompts. |
| F3 Flashcards | PASS | 10. |
| F4 Connections | PASS | 4 labelled groups. |
| G1 Prose budget (redundancy) | FAIL (MAJOR) | 24,711 against 18,000 advisory; group G. |
| G2 Breadth | PASS | All 8 checklist items plus the plan's extras. |
| H1 Labs green | PASS (main session) | CLOSE-M03 build exit 0. |
| H2 Formatting | PASS (main session) | |
| H3 Links | PASS | exit 0. |
| H4 Stats | PASS | flags none. |
| H5 Docker honesty | PASS | No Testcontainers in m03. |
| H6 No stray files | PASS | Only `_meta/STATE.md`, `_meta/TASKS.md` modified (the task claim). |

## Findings

### Group A: factual accuracy and wording → FIX-M03-01

1. **MAJOR. §7 Best practices L1146 and Q03.22 follow-up L1972.** The reason for token constants is wrong: `new X<…>() {}` creates one anonymous class per source site, loaded once however often it runs, so `static final` does not reduce "classes to load". Fix L1146: "…because the constant creates and parses the token once and names the type in one place". Fix L1972: "*Does creating a token on every call matter?* Each call allocates a token and re-reads its generic superclass. The anonymous class itself is one per source site and loads once. Declare tokens for fixed types as `static final` constants so the work happens once and the expected type is documented in one place."
2. **MINOR. §1 Best practices L210.** Garbled ("one says a type is unchecked, the other says this line may pollute"), contradicting the L62–63 table. Fix: "…because they answer different questions: `rawtypes` says a raw type is named here, `unchecked` says this operation may put a wrong element in."
3. **MINOR. Q03.01 L1299 and §1 misconception L217.** "The cost is zero at run time" is overstated (the inserted `checkcast`s run; `List<Integer>` boxes). Fix L1299: "There is no per-parameterization cost: one class serves all, and the casts are the ones you would have written by hand." Add to L217: "What does cost something is boxing, because a type argument must be a reference type; that comes from `List<Integer>` holding objects, not from generics machinery."
4. **MINOR (needs verification). §6 L915, Q03.21 L1927, L911.** "The JLS names `Collections.addAll` as the canonical target" (JLS §9.6.4.7) could not be confirmed; the JDK 25 `SafeVarargs` Javadoc does not say it, and `Collections.addAll` is itself `@SafeVarargs`. Fix: "as `Collections.addAll` does, which is itself annotated `@SafeVarargs` [Src: JDK 25, java.util.Collections]", and re-cite the L911 "can cause heap pollution" quote after re-reading the JLS (§9.6.4.7 vs §8.4.1).
5. **MINOR. §5 Version notes L872.** "JDK 25's javac with `--release 15` still rejects that line" has no test or tag. Fix: add an `ErasureCompileRulesTest` case asserting a `compiler.err.feature.not.supported.in.source*` key and tag it, or delete the sentence and cite JEP 394 / JLS 16 §15.20.2.
6. **NIT. §6 L909.** `Array.newInstance` takes a `Class<?>` and returns `Object`. Fix: "takes a `Class` and returns an `Object` that is a real array of that component type (the lab's `TypedArrays` casts it)".
7. **NIT (needs verification). §7 L1068.** "group `tools.jackson`" is loose (Jackson 3 uses `tools.jackson.core` etc. plus `tools.jackson:jackson-bom`). Check the exact group IDs and the 3.1.7 / 2.21.7 numbers against the pom and VERSIONS.md.

### Group B: basis tags, snippet kinds and lab claims → FIX-M03-02

1. **MINOR. §3 Code L491–504.** The `BoundCompileRulesTest` Excerpt starts mid-`@DisplayName(`, omits `@Test`, and ends before the remaining assertions and `}`. Fix: include the member whole.
2. **MINOR. §7 Code L1109 and L1118.** Both Excerpts drop `@Test` / `@DisplayName`. Fix: include the annotation lines, or excerpt only the statements discussed.
3. **MINOR. Q03.24 L2002, table L2006–2011, L2032; Ex03.1 L2111.** Typed-key claims (`Key<T>(String name, Class<T> type)` keeps the run-time check, allows several entries per type) are untested and untagged. Fix: add a lab test (e.g. `Q03.24 · a typed key rejects a wrong value at put and keeps two Strings apart`) and tag L2013, or mark the column as design reasoning.
4. **MINOR. §6 L915, Q03.21 L1927, L911.** "compiles without a warning" for a false `@SafeVarargs` is tagged `[Lab: GenericArrayTest]`, which does not assert it; L911's "folded into the summary note" is untested for varargs. Fix: add `[Src: JDK 25, java.lang.SafeVarargs]` (its Javadoc has this example), or a compile test asserting no warning code and the note.
5. **NIT.** Untested follow-up claims Q03.20 L1912 (`toArray("a","b")` from `main` works) and Q03.15 L1749 (pattern `o instanceof List<String> l` rejected). Add one assertion each or tag them.

### Group C: checklist misses (B3, B5, B9, B13, B14, C4) → FIX-M03-03

1. **MINOR (B5). §5 L797–798, §6 L919, §7 L1076, §8 L1187.** Add approach plus numbered steps before the code. §5: "1. `Money` implements `Comparable<Money>` with one method. 2. javac adds the bridge (see `javap`). 3. The test finds the bridge by name and flag, never by position. 4. The compile test shows the `instanceof` rule." §6: "1. The constructor casts an `Object[]` to `T[]`. 2. `get` and `add` keep it inside. 3. `snapshot()` lets it escape (defect). 4. `snapshot(IntFunction)` and `toList` are the fixes." §7: "1. The constructor reads `getGenericSuperclass()`. 2. A raw subclass is rejected. 3. The test captures `List<String>` and, inside a generic method, `T`." §8: "1. One call per signature. 2. Each is annotated with the bound that lets it compile. 3. The reflection test reads the erasure."
2. **MINOR (B3). §5 L768, §7 L1042 (§4 L567 thin).** Add analogies. §5: javac as a proofreader who checks every label then peels the stickers off before the boxes leave; the JVM handles unlabelled boxes, and the `Signature` attributes are the warehouse catalogue. §7: a `Class<T>` is an address label for a plain street; a super type token puts the full address on the delivery van (the anonymous class), because the parcel (the object) carries none.
3. **MINOR (B9, C4). §6, §5, §2.** Add a §6 Version notes callout after Failure modes (L1011): Java 7 `@SafeVarargs` [Doc: JSR 334]; Java 9 allowed on private instance methods [Changed in Java 9] [Doc: JEP 213]; Java 11 `Collection.toArray(IntFunction)`; Java 25 (default): the compiler still does not check the promise [Lab: GenericArrayTest]. Add `[Changed in Java 16: instanceof accepts non-reifiable types when the cast is checked]` to §5 L872. In §2 keep `[Final since Java 10, JEP 286]` only at L202; drop it from L408 and the repeated JEP 286 / JSR 334 tags from L393.
4. **MINOR (B13). §7.** Add a `**Security:**` best-practice item with a verified basis (candidates: OWASP Deserialization Cheat Sheet, Jackson polymorphic-typing docs): bind untrusted JSON to the most specific concrete token, never to `Object`, `Map<String,Object>` or an abstract type with polymorphic typing enabled, because the payload then decides which classes are instantiated (the precondition of deserialization-gadget attacks); a token fixes the shape but validates no values, so validate after binding (link the owning module). Add one cross-reference sentence at §1 L212 where `checkedList` guards a trust boundary.
5. **MINOR (B14).** Define "idempotency key" at L1834 ("a caller-supplied unique key that lets the receiver ignore a repeat of the same operation", link the owning module), "descriptor" at L792 ("the JVM's encoding of a method's parameter and return types, such as `(Ljava/lang/Object;)I`"), and `javap` at L816 ("the JDK class-file disassembler").

### Group G: redundancy (G1) → FIX-M03-04 (findings 1, 2), FIX-M03-05 (findings 3, 4)

1. **MAJOR. Question answers re-teach their section.** Each Full explanation should answer the question and link the section. Pairs (rough saving): Q03.23 L1986 vs §8 L1177–1179 (−120); Q03.21 L1927 vs §6 L915 (−100); Q03.19 L1872 vs §6 L903–905 (−100); Q03.14 L1704 vs §5 L782–786 (−120); Q03.22 L1959 vs §7 L1066–1072 (−130); Q03.07 L1485 vs §3 L425–429 (−100); Q03.04 L1377 vs §2 L240–242 (−80); Q03.10 L1595 vs §4 L597–601, the Java Tutorials "in/out" sentence at L601, L755, L1595 — keep one (−80); Q03.12 L1656–1672 vs §4 L605, the `List<?>`/`List<Object>`/raw `List` contrast at L216, L605, L757 and Q03.12 — keep L605 and Q03.12, shorten L216 to a link, delete L757 (−90).
2. **MAJOR. The same fact introduced 4–10 times.** `Object &` / leftmost-bound erasure at L429, L540, L1177, L1265, L1276, L1503, L1539, L1986, L1992, L2211: keep L429, L1177 and one question trap; delete L540's lab sentence, L1265's middle sentence, L1503, L1539's last sentence, L1992, L2211 (−300). Wildcards avoided in return types at L601, L746, L1271, L1610, L1990: keep L601, L746; delete L1271, L1990 (−80). "Static member cannot use `T`" at L240, L784, L888, L1389: keep L784, link from the others (−100). `Collections.checkedList` at L69, L199, L212, L1303, L1359, L1363, L1748: keep L69, L199; the questions link (−100). `BridgeMethodResolver` at L869, L1798, L1834 (−60). Typed key at Ex03.1 L2111, Q03.24 L2002, table L2006 (−60).
3. **MINOR. Sections pre-narrate a Production scenario question or callout.** §4 L740 retells Q03.13; §5 L863–865 pre-state Q03.18 and Q03.17; §7 Failure modes first bullet L1131 repeats its callout and Q03.22's Trap L1974 restates it; §6 L1015, L907, L1009 and Q03.20 L1907–1909 all spell out "the array is an `Object[]` created by `(T[])`". Keep one sentence plus a link per Failure-modes bullet and the callout's unique diagnosis (−250).
4. **MINOR. Small repeats.** Java 7 diamond / Java 10 `var` at L202 and L393; the `body(List.class)` story at L1139, L1148, L1154, L1974, L2319; §1 L193 repeating L30, L50, L54. Cut to one statement and one link each (−150).

Groups 1–4 save roughly 2,200–2,600 words (to about 22,000); still above 18,000 (advisory), but no repeated explanation remains.

### Group N: nits → FIX-M03-06

1. Plain "§n" text without a link at L790, L877, L911, L913, L1030: link them.
2. §6 "The problem it solves" L895 opens with a design contrast: lead with the `String[] s = buffer.snapshot()` crash.
3. Add Q03.24 to §7's "Questions that drill this section" (L1157).
4. Applies-to names only Spring Framework 7.0.10, but §7 relies on Boot 4.1.2 for the Jackson line (L1068): add "Spring Boot 4.1.2 (§7 only)" if VERSIONS.md agrees.
5. Optional, no action required: one Valhalla Version-notes line (the plan allows at most one; omission accepted).

Line numbers refer to the module as of 2026-11-20 before any FIX; FIX tasks that run later re-locate by quoted text.

Checked and correct (reviewer): Q03.06 `String.valueOf(settings.get(PORT))` picks `valueOf(char[])` and the message names `[C`; the JDK 25 `Collections.swap` raw-type comment; `ArrayList.elementData` is `transient Object[]` and `elementData(int)` casts to `(E)`; `Collection.toArray(IntFunction)` `@since 11`; `Collections.addAll` is `@SafeVarargs`; the `ParameterizedType` equality contract; the `SafeVarargs` Javadoc example equals `VarargsPollution` (no warning, run-time CCE, no `ArrayStoreException`); poly-expression rules for diamond and generic calls (JLS §15.9, §15.12) and `var` as standalone (JLS §14.4.1); `T.class` → `type.var.cant.be.deref`, `new T()` → `type.found.req`, `static T` → `non-static.cant.be.ref`; `instanceof List<String>` from `Object` → `instanceof.reifiable.not.safe`, `ArrayList<String>` from `List<String>` accepted since Java 16; bridge flags 0x1041 and the `checkcast`/`invokevirtual` body; `LocalDate` is `Comparable<ChronoLocalDate>` and `Timestamp` inherits `Comparable<Date>`; `Collections.max` erasure returns `Object` only because of `Object &`; wildcard containment and capture making `list.set(0, list.get(1))` on `List<?>` fail; `int.class` is `Class<Integer>`, `Class.cast` messages, primitive `isInstance` false; Q03.13 widening keeps erasure `publishAll(List)`; Q03.18 2 deliveries vs 1 with `!isBridge()`; C7, C8, C10 and all Output/Ex test DisplayNames.
