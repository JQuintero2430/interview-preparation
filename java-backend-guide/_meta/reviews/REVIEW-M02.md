# REVIEW-M02

- Route: fresh read-only subagent (general-purpose, model claude-opus-5-5), launched by S20261115-1847-claudecode; it received only `modules/02-java-equality-immutability-records.md`, `_meta/modules/M02.md`, `_meta/QUALITY-BAR.md`, `STYLE-GUIDE.md` and `labs/java-language/src/{main,test}/java/dev/interview/javalanguage/m02/` (RUN.md §4), plus `SOURCES.md` for C8 only. The writing contexts of module 02 ran on claude-fable-5-2 (and claude-opus-5-5 for QB-M02-01), all in other sessions.
- Date: 2026-11-15. Module state: CLOSEd by CLOSE-M02, 2,704 lines, 0 `TASK:` markers, 8 sections, 22 Q, 3 Ex, 4 Production scenario questions, 26,922 prose words (advisory 18,000, decision 19).
- Ran (read-only): the QUALITY-BAR one-liners; `module-stats.mjs` (row 02 flags `none`); `check-links.mjs --planned .` (exit 0); a scratch node script diffing every `java`/`xml` block against its lab file (deleted); a URL diff of 76 module URLs against SOURCES.md "## 02"; `git status --short -- .`. Not re-run: H1/H2 (CLOSE-M02 `verify -DexcludedGroups=docker` → exit 0). Not read by instruction: VERSIONS.md, TASKS.md, ledgers, other modules.
- **Verdict: CHANGES_REQUIRED** (0 BLOCKER · 3 MAJOR · 7 MINOR · 5 NIT).
- **Main-session notes (S20261115-1847-claudecode, not part of the independent review):** findings 1 (JEP 513) and 16 (`TREEIFY_THRESHOLD` off-by-one) are factual claims by the reviewer; FIX-M02-03 and FIX-M02-08 must check them against JEP 513's text and JDK 25 `src.zip` (`HashMap.putVal`) before editing, and leave the text unchanged if the source disagrees.

## Items

| Item | Result | Evidence |
|---|---|---|
| A1 Header | PASS | L3–9 fields in §2.1 order, run command, "Needs Docker: no"; `Applies to: Java 25` matches the plan. |
| A2 Prerequisites deep-link | PASS | L4 both links carry `#7-…` / `#13-…` anchors. |
| A3 Short on time | PASS | L8: 3 section links, 5 question IDs, ends with Summary. |
| A4 Contents | PASS | 13 links = 14 `^## ` − 1. |
| A5 Order of concepts | PASS | §1→§8 identity → hashing → hierarchy → ordering → immutability → records → builders → value-based/Valhalla. |
| A6 No open regions | PASS | `grep -c 'TASK:'` = 0. |
| B1 Subsections | PASS | each of 7 headings ×8; callout placement → finding 15. |
| B2 Concrete problem | PASS | every section opens on a concrete failure. |
| B3 Mental model and diagrams | FAIL (MINOR) | 4 mermaid, each with "What to notice"; §4 Mental model has no analogy (finding 8). |
| B4 Mechanism depth | PASS | e.g. §2 `getNode` stored hash, §6 JLS §8.10.4.2 and `ObjectMethods` bootstrap, §8 lint vs `DiagnoseSyncOnValueBasedClasses`. |
| B5 Approach before code | PASS | every Code subsection and Worked solution. |
| B6 Reasons on every practice | FAIL (NIT) | L663 (finding 13). |
| B7 Misconceptions with history | FAIL (MINOR) | 12 items lack the origin (finding 9). |
| B8 Framework vs language | PASS | §6 JPA L861, §7 Lombok L1078. |
| B9 Version notes | FAIL (MINOR) | §5 has none; §6 "Java 25: unchanged" wrong (findings 1, 10). |
| B10 Production scenario callouts | PASS (count) | 3 (§2, §4, §5); each duplicates its question (finding 4). |
| B11 Failure modes and load | PASS | §3 and §7 declared pure-language/construction; others cover load. |
| B12 Operational concerns | PASS | flag + default from `globals.hpp`; Lombok/Boot versions; `jcmd GC.class_histogram`. |
| B13 Security per topic | PASS | 5 items (§1, §2, §5, §6, §8). |
| B14 Terms defined | PASS | Liskov L349, TOCTOU L701, flattening L1311. |
| B15 Cross-links over repetition | FAIL (MINOR) | §2 re-explains `HashMap` internals delegated to 04 (finding 7). |
| C1 Every claim has a basis | PASS | Doc 100, Lab 99, Src 101; >25 claims sampled. |
| C2 Output answers are run | PASS | all 8 Output IDs have `Q02.mm ·` tests; short answers match the assertions. |
| C3 Lab claims are tested | FAIL (MAJOR) | L846, L850, L1407 claim more than the tests assert (findings 2, 3). |
| C4 Status markers | FAIL (MINOR) | no deprecation marker for wrapper constructors, none for JEP 513 (findings 1, 11). |
| C5 Versions exist | PASS | lab APIs compile; the one Partial carries Doc/Src tags. |
| C6 No unrecorded uncertainty | PASS | 0 `[Unverified:`. |
| C7 Snippet kinds | PASS | 22 Complete byte-equal, 24 Excerpts in order, 1 Partial. |
| C8 Sources recorded | PASS | 76/76 URLs under SOURCES.md "## 02". |
| C9 Ledger rows answered | PASS (module side) | all 7 plan §3 IDs in `<!-- ledger -->` lines. |
| C10 Nondeterminism as invariants | PASS | no `Thread.sleep`; identity-hash case asserts a relationship. |
| C11 Trade-off numbers verified | PASS (NIT) | L550–554 table lacks a tag (finding 14). |
| C12 JMM claims | N/A | only cited, no racy test. |
| D1 Answer anatomy | PASS | 22/22/22/22/22. |
| D2 Output short answers | PASS | all 8 exact. |
| D3 Type mix | PASS | 7 tags, max share 36%. |
| D4 Progression | PASS | follows §1→§8. |
| D5 No duplicates | PASS (within module) | |
| D6 Linked from the body | PASS | 64 links, every ID linked outside its heading. |
| D7 Anchors and heading format | PASS | 22 + 3 anchors. |
| D8 Counts | PASS | 22/24 Q, 3/3 Ex, 4 PS. |
| D9 Production scenario answers | PASS | Q02.08, Q02.14, Q02.17, Q02.19. |
| E1 Anatomy | PASS | all labels in Ex02.1–3. |
| E2 Criteria ↔ tests | PASS | 9 / 6 / 9 tests, each named by criterion. |
| E3 Progression | PASS | |
| E4 Real code | PASS | no `@Autowired`, ≤ 4 params, no method > 20 lines. |
| E5 Rubric quality | N/A | |
| F1 Summary | PASS | |
| F2 Explain it back | PASS | 6 prompts. |
| F3 Flashcards | PASS (NIT) | card 2 contradicts Q02.06 (finding 12). |
| F4 Connections | PASS | |
| G1 Prose budget (redundancy) | FAIL (MAJOR) | findings 4–7. |
| G2 Breadth | PASS | plan §2 checklist covered. |
| H1 Labs green | PASS (main session) | CLOSE-M02 build exit 0. |
| H2 Formatting | PASS (main session) | |
| H3 Links | PASS | exit 0. |
| H4 Stats | PASS | flags `none`. |
| H5 Docker honesty | PASS | no Testcontainers in m02. |
| H6 No stray files | PASS | only declared m02 files. |

## Findings

### Group A: Java 25 record-constructor rule → FIX-M02-03

1. **MAJOR. §6 table L842, How it actually works L852, Version notes L864, Q02.18 L2101.** Says a non-canonical record constructor "must begin with `this(…)`". JEP 513 (final in JDK 25) lets prologue statements that do not use `this` precede it; it must still invoke `this(…)`. "Java 25 (default): unchanged" (L864) is therefore wrong. Fix: L842 "if each delegates with `this(…)` (since Java 25 it may follow statements that do not use `this`)"; L852 "Any other constructor must invoke `this(…)`; since Java 25 statements that do not touch `this` may come first [Final since Java 25, JEP 513] [Doc: JEP 513](https://openjdk.org/jeps/513), but every instance still passes through the canonical one"; L2101 "must delegate with `this(…)` (possibly after a prologue, JEP 513)"; L864 "Java 25 (default): flexible constructor bodies let a non-canonical record constructor run statements before `this(…)` [Final since Java 25, JEP 513]". Add the JEP 513 URL to SOURCES.md "## 02".

### Group B: lab-verification honesty → FIX-M02-04

2. **MAJOR. §6 Mental model L846.** "the forbidden column is compiled in the lab [Lab: RecordCompileRulesTest]", but the test compiles only the instance-field and `extends` rows (plus compact-constructor assignment and non-public accessor, which are not in that column). Fix: reword to "the instance-field and `extends` rows are compiled in the lab, together with the compact-constructor and accessor rules of How it actually works [Lab: RecordCompileRulesTest]; the other rows rest on JLS 25 §8.10 and §8.10.2", or add compile tests for instance initializer, `abstract` method and `sealed` record.
3. **MINOR. §8 Code L1407, §6 L850.** L1407 quotes `[info]` and "followed by the stack", which `ValueBasedClassesTest` does not assert (it asserts `[valuebasedclasses]`, `Synchronizing on object`, `of klass java.lang.Integer`, `locked 42`, exit 0). L850 quotes "'{' expected", but only the key `compiler.err.expected` is asserted. Fix: narrow both sentences to what is asserted, or extend the tests.

### Group C: redundancy (G1) → FIX-M02-05 (finding 4), FIX-M02-06 (findings 5–7)

4. **MAJOR. §2 callout L290–291 vs Q02.08; §4 L653–654 vs Q02.14; §5 L807–808 vs Q02.17.** Each Production scenario callout is a compressed copy of its question (same framing, partly verbatim, same evidence and fix); STYLE-GUIDE §6: callouts teach, questions drill, "They do not duplicate each other." Fix: give each callout a different incident of the same failure class: §2 p99 latency growing with map size after a low-entropy `hashCode` (`HashMap.getNode`/`TreeNode.find` in profiles); §4 intermittent HTTP 500 with `IllegalArgumentException: Comparison method violates its general contract!` (covered by `OrderingTest`); §5 a cached "immutable" DTO whose `List<Date>` elements change (shallow immutability, L697). Keep the "[Q02.nn] drills …" pointer where it still applies.
5. **MINOR. Lombok support/version stated three times: §7 L1062 and L1075, §7 Failure modes L1269, Q02.21 L2236.** Fix: keep once in §7 How it actually works; Failure modes → "check the Lombok changelog's JDK support entry before a JDK upgrade [Doc: Lombok changelog]"; Q02.21 → one sentence linking §7.
6. **MINOR. `Timestamp`/`Date` told four times: §3 L315 (second half), L353, L537, Q02.10 L1783.** Fix: drop from L315, keep L353, reduce L537 to the correction plus "see above", keep L1783 as one clause.
7. **MINOR (also B15). §2 L192, L198, Version notes L203, L307, Security L301, Q02.04 follow-up L1567** re-explain `HashMap` internals delegated to 04 (spread `h ^ (h >>> 16)`, `(n - 1) & hash`, `TREEIFY_THRESHOLD`, `MIN_TREEIFY_CAPACITY`, tree-bin ordering); and `jcmd <pid> GC.class_histogram` is introduced with its Doc tag six times (L144, L287, L291, L1007, L1710, L2171). Fix: "Collisions and tree bins" → two sentences plus a link to 04; drop the spread formula from L192 (keep "stored hash, then `==`/`equals`"); introduce the histogram once in §2 Failure modes and refer to it elsewhere.

### Group D: section mechanics → FIX-M02-07

8. **MINOR. §4 Mental model L548** has no analogy (B3). Fix: e.g. a race judge reporting finishing order; a `TreeSet` podium with one spot per position, so a dead heat shares one spot and the second runner is turned away.
9. **MINOR. Misconceptions without the myth's origin (B7):** L669, L670, L824, L825, L826, L1023, L1024, L1025, L1286, L1287, L1429, L1430. Fix: append one origin clause each (e.g. L1024 "it looks like an ordinary constructor body, where assignment comes first"; L1430 "records and value-based classes both have state-based `equals`").
10. **MINOR. §5 has no Version notes (B9).** Fix: add after §5 Failure modes: Java 8 copy-then-wrap `Collections.unmodifiableList(new ArrayList<>(source))` · Java 9 `List.of`/`Set.of`/`Map.of` [Doc: JEP 269](https://openjdk.org/jeps/269) · Java 10 `List.copyOf`/`Set.copyOf`/`Map.copyOf` [Src: JDK 25, java.util.List] · Java 25 (default): unchanged. Add the JEP 269 URL to SOURCES.md.
11. **MINOR. §8 C4.** No deprecation marker for the wrapper constructors. Fix: L1422 "never `new Integer(…)` [Deprecated since Java 9 — use `valueOf`]"; do not write "deprecated for removal".
12. **NIT. Flashcard 2 L2648** ("the lookup goes to the bucket of the new hash code") contradicts Q02.06 L1651. Fix: "`null`, although the entry is still in the map: the entry keeps the hash computed at `put`, so it never matches the new hash (Q02.06, linked)."
13. **NIT. §4 Best practices L663** has no "because". Fix: "Use `List.sort(c)` in new code, because `Collections.sort` only forwards to it."
14. **NIT. §4 table L550–554** has no basis tag. Fix: add a `[Lab: OrderingTest]` line under the table.
15. **NIT. Callout placement:** Version notes L202 (§2), Framework vs language and Version notes L860/L863 (§6), Framework vs language L1077 (§7) sit before or inside How it actually works / Code instead of STYLE-GUIDE §2.2 position 6. Fix: move each to just before `### Best practices and anti-patterns`.

### Group E: accuracy and wording → FIX-M02-08

16. **MINOR. §2 L198.** "When it reaches `TREEIFY_THRESHOLD` (8) entries it becomes a tree" is off by one: `putVal` calls `treeifyBin` when the 9th node is appended (`binCount >= TREEIFY_THRESHOLD - 1`). Fix: "When an entry is added to a bucket that already holds `TREEIFY_THRESHOLD` (8) entries, the bucket becomes a tree, unless …" (apply in the shortened paragraph if FIX-M02-06 runs first).
17. **NIT. Garbled sentences.** Q02.08 L1704 "hits fell, but so did nothing else" → "hits fell while nothing else changed"; Q02.15 L1980 "`final` alone is not on the list as sufficient" → "`final` alone is not enough".

Checked and correct (reviewer): the `Comparator` contract, `TreeMap` key retention on a tie, `Integer.MIN_VALUE - Integer.MAX_VALUE == 1`, `"Aa"`/`"BB"` = 2112, `Objects.hash(1, 2)` = 994, `URL.equals` blocking, `MessageDigest.isEqual` timing, `List.copyOf` identity for `List.of` lists, `Timestamp`/`Date` asymmetry, `-XX:DiagnoseSyncOnValueBasedClasses` semantics and default, wrapper constructors deprecated (not for removal) in JDK 25; all 8 Output short answers match their tests.
