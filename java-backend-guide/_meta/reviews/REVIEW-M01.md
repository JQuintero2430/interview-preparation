# REVIEW-M01

- Route: fresh read-only subagent (general-purpose, model sonnet), launched by S20261107-0959-claudecode; it received only `modules/01-java-oop-fundamentals.md`, `_meta/modules/M01.md`, `_meta/QUALITY-BAR.md`, `STYLE-GUIDE.md` and `labs/java-language/src/` (RUN.md §4). The writing contexts of module 01 ran on claude-opus-5-5.
- Date: 2026-11-07. Module state: CLOSEd by CLOSE-M01, 19,336 prose words (cap 19,400, SYLLABUS §9 decision 18).
- H1/H2 (Maven) are not run by the reviewer; the main session's CLOSE-M01 run: full `verify -DexcludedGroups=docker` → exit 0 (java-language 339 tests, 0 failures).
- The reviewer ran only read-only commands: `module-stats.mjs`, `check-links.mjs --planned`, `grep`/`wc`, `git status --short`, and scratch node scripts that print. The scripts diffed every Complete and Excerpt snippet against its lab file and counted follow-ups per question. Two reads fell outside the declared inputs: `git status` for H6, and one read-only `SOURCES.md` comparison for C8.
- **Verdict: CHANGES_REQUIRED** (5 MAJOR, 7 MINOR, 11 NIT). No wrong fact in the prose or the answers was found. All 5 MAJORs are formal QUALITY-BAR failures (D1, B3, C3, D9, B10), each a small edit.
- **Main-session notes (S20261107-0959-claudecode, not part of the independent review):**
  - Finding 7 is disputed. The main session believes JEP 512 (final in Java 25) chooses the `String[]` method first and the no-arg method second, whether static or instance. That would make L59 correct, and the four-step order the reviewer cites would be the older preview protocol (JEP 445/463). FIX-M01-05 must check JEP 512's text before editing, and leave L59 unchanged if the text agrees.
  - Finding 7 resolved by FIX-M01-05: JEP 512's text chooses a declared or inherited `main(String[])` first, then a no-arg `main`, and only after choosing checks whether the method is static. L59 is correct and was left unchanged.
  - The JDK bug id in NIT 23 must be checked against the JDK 18 release note in FIX-M01-07.
  - Finding 8 is wrong on the fact (FIX-M01-03): the JDK 25 source (`src.zip`, `java/lang/Integer.java`) has `@Deprecated(since="9")` with no `forRemoval`, so L1505's "since Java 9" was right. Only the missing §4.2 marker was fixed: `[Deprecated since Java 9 — use valueOf]`.

## Items

| Item | Result | Evidence |
|---|---|---|
| A1 Header | PASS | Lines 3–9: every field in §2.1 order, with the Labs run command and "Needs Docker: no"; `Applies to: Java 25` matches the plan. VERSIONS.md was not in the inputs. |
| A2 Prerequisites deep-link | N/A | `Prerequisites: none`. |
| A3 Short on time | PASS | 3 section links, 5 question IDs, ends with Summary; all links resolve. NIT 23: Q01.10 (the most-asked question) is not listed. |
| A4 Contents | PASS | 18 Contents links = 19 `^## ` headings − 1. |
| A5 Order of concepts | PASS | §13 is the deepest by design. §5 leans on "override" (§8) and `abstract` (§9), and §3 on unboxing (§13). Forward links exist (NIT 17). |
| A6 No open regions | PASS | `grep -c 'TASK:'` → 0. |
| B1 Subsections | PASS (accepted gaps) | Six subsections appear in 13 of 13 sections; "Failure modes and operations" appears in 11 of 13. The §3 skip is accepted (plan: pure language). For the §8 skip, see finding 11. |
| B2 Concrete problem | PASS | All 13 "problem" subsections show a bug or outage (wrapping quota check, `widget@0`, double-counting set, `Long ==`, and so on). |
| B3 Mental model and diagrams | FAIL (finding 2) | 12 mermaid blocks; §6 uses an access table instead (acceptable). The §10 (L1111–1116) and §11 (L1185–1191) diagrams have no "what to notice" sentence. §12 and §13 use "Notice:" (accepted). |
| B4 Mechanism depth | PASS | Each section answers a "why": §1 version check, §2 promotion and saturation, §3 shift mask, §4 argument initialization, §5 JLS 12.5 order, §6 JLS 6.6.2.1, §7 `addAll` self-use, §8 JVMS 5.4.6, §9 diamond rules, §10 constant inlining, §11 `this$0` and the Java 18 omission, §12 constant bodies as subclasses, §13 IntegerCache. |
| B5 Approach before code | PASS | Every `### Code` subsection gives an approach and steps except §10 (finding 10, MINOR). The worked solutions number their approaches. |
| B6 Reasons on every practice | PASS | Every best-practice bullet read has a "because". |
| B7 Misconceptions with history | PASS, MINOR gaps (finding 9) | About 17 of 53 traps give the correction but not why the myth exists. |
| B8 Framework vs language | N/A | Pure-language module; no callout required (plan §4). |
| B9 Version notes | PASS, MINOR gap (findings 8, 11) | 8 callouts (§1, 3, 4, 5, 6, 7, 9, 11). Missing as callouts: §8 (the Java 11 private `invokevirtual` change, marked only inline) and §13 (wrapper constructors). |
| B10 Production scenario callouts | FAIL (finding 5) | 5 callouts (§1, 2, 10, 11, 13). §10 gives no diagnosis evidence and no prevention; §13 gives no evidence. |
| B11 Failure modes and load | PASS | All 11 read. Load behaviour is thin by nature in a language module; the §8 gap is finding 11. |
| B12 Operational concerns | PASS | Configuration: `--release`, `AutoBoxCacheMax` (Src), `--add-opens`. Observability: `javap`, `jcmd GC.heap_dump`, the helpful NPE message. Deployment: the §1 rollout order, recompiling implementers in §9. Other concerns do not apply. |
| B13 Security per topic | PASS | 7 `**Security:**` items (§2, 4, 6, 7, 9, 10, 12); §13 has no security dimension. |
| B14 Terms defined on first use | PASS (NIT 17) | Most terms are glossed and linked. No gloss for "JIT" (L46), "HotSpot" (L857), "GC"/"HPROF" (Q01.26), "JPA" (L1394) or "Liskov" (Q01.17). |
| B15 Cross-links over repetition | PASS | Each delegated topic (modules 02–11, 51) gets one sentence plus a link. |
| C1 Every claim has a basis | PASS | 224 Doc, 144 Lab, 13 Src, 0 Unverified tags; about 25 claims sampled, all tagged. NIT 21: the Q01.02 rationale for `public static void` has no source. |
| C2 Output answers are run | PASS | All 10 Output IDs (Q01.04, 05, 07, 08, 10, 12, 17, 18, 19, 23) have `@DisplayName("Q01.nn · …")` tests, and Q01.13 is tested too. Q01.04, 05, 07, 08, 09, 10, 12, 17, 18, 19 and 23 were diffed against their assertions: exact matches. |
| C3 Lab claims are tested | FAIL (finding 3) | Every named test exists, but six "in the lab" sentences name none (L275, 293, 1872, 1873, 1946, 2142). |
| C4 Status markers | PASS, MINOR gap (finding 8) | 23 markers, all in the §4.2 forms and consistent with the plan. The wrapper constructors (L1505), deprecated for removal since Java 16, carry no marker. NIT 20: `strictfp`. |
| C5 Versions exist | PASS | `IO.println` (25), `Math.ceilDiv` (18) and `List.copyOf` (10) are all valid on 25; the lab compiled in CLOSE-M01. |
| C6 No unrecorded uncertainty | PASS | No `[Unverified:` tags. |
| C7 Snippet kinds | PASS | All 21 Complete snippets are byte-equal to their files (trailing whitespace ignored). Every Excerpt's lines appear in order in its file (indentation ignored). The 4 unmarked Output snippets (Q01.04, 05, 07, 08) equal their `main` bodies. No Partial Java snippets (bash and text only). NIT 22: two-file Excerpt fences. |
| C8 Sources recorded | PASS | 154 unique URLs, all listed under the module's heading in SOURCES.md. |
| C9 Ledger rows answered | PASS (mapping level) | Every plan row homed in a question appears in a `<!-- ledger: -->` line; the 9 `duplicate-of` rows homed in section prose are exempt. Ledger text was not in the inputs, so the 5-row answer-quality sample was not done. |
| C10 Nondeterminism | PASS | No `Thread.sleep`, no concurrency tests. |
| C11 Trade-off numbers | PASS | The Q01.06 table rows are covered by `[Lab: Q01OutputsTest]`; the 24.8-day figure has a JLS tag. |
| C12 JMM claims | N/A | No JMM claims. |
| D1 Answer anatomy | FAIL (finding 1) | All 28 questions have the question, Short, Full, Follow-ups and Trap. Q01.23 and Q01.24 have 1 follow-up each; at least 2 are required. |
| D2 Output short answers | PASS | All 10 give the exact lines plus 1–2 sentences of reasoning. |
| D3 Type mix | PASS | Output 10 (36%), Concept 6, Production scenario 5, Difference 4, Trade-off 2, Bug hunt 1, Design 1. |
| D4 Progression | PASS | The questions follow §1 to §13 in order. |
| D5 No duplicates | PASS | Only module 17 has other `### Q` headings; no overlap. |
| D6 Linked from the body | PASS | 51 `](#q01-` links (≥ 28); every ID appears outside its own heading. |
| D7 Anchors and heading format | PASS | All 28 anchors sit directly above their headings; check-links passes. |
| D8 Counts | PASS | 28 Q, 3 Ex, 5 PS; stats show no flag. |
| D9 Production scenario answers | FAIL (finding 4) | Q01.03 and Q01.26 follow symptoms → hypotheses → evidence → fix → prevention. Q01.06 and Q01.28 put Prevention before Fix; Q01.25 and Q01.28 give no monitoring. |
| E1 Anatomy | PASS | All 3 exercises have Problem, Constraints, Acceptance criteria, Hint 1, Worked solution (Approach → code → account per criterion), Alternative with Trade-offs, 2 follow-ups and a Tests link. |
| E2 Criteria ↔ tests | PASS | Tests `Ex01.1·(1..4)`, `Ex01.2·(1..4)` and `Ex01.3·(1..3)` exist, each tied to one criterion. NIT 19: the wording of Ex01.2 (3). |
| E3 Progression | PASS | Ex01.1 (§2, §13) → Ex01.2 (§8, 9, 12) → Ex01.3 (§5, 7, 11). |
| E4 Real code | PASS | No `@Autowired`; constructors take ≤ 2 parameters; no method in ex1–ex3 main code is over 20 lines. Compilation is covered by H1. |
| E5 Rubric quality | N/A | Code module. |
| F1 Summary | PASS | 3 paragraphs covering each section's claim and trap, with links; no new facts. |
| F2 Explain it back | PASS | 5 prompts, each naming a listener. |
| F3 Flashcards | PASS | 7 `<details>` blocks. |
| F4 Connections | PASS | Builds on / Read next / Uses later / Comparisons, each with a reason. |
| G1 Prose budget | PASS (tight) | 19,336 ≤ 19,400 (decision 18): 64 words of headroom (see the FIX grouping). |
| G2 Breadth | PASS | All 17 checklist items map to sections and questions as plan §2 says; all 28 questions and 3 exercises are present with the plan's titles and types. |
| H1 Labs green | Not run by the reviewer | Main session: exit 0, 339 tests. |
| H2 Formatting | Not run by the reviewer | Main session. |
| H3 Links | PASS | `check-links --planned`: "All links resolve" (174 planned links). |
| H4 Stats | PASS | Flags: none. |
| H5 Docker honesty | PASS | No Testcontainers or `@Container` in `m01`. |
| H6 No stray files | PASS | `git status` lists only module 01, its plan, the ledgers, `_meta` files and the new `m01` lab and test files. |

## Findings

1. **MAJOR** · Q01.23 (L2532–2535), Q01.24 (L2550–2551) · D1 requires at least 2 answered follow-ups, and each has 1. · Add one answered follow-up to each. Q01.23: `Left.super.hello()` needs `Left` to be a *direct* superinterface (JLS 15.12.1), or the same static method in two interfaces is no conflict. Q01.24: why `Serializable` is a marker interface, or whether `@FunctionalInterface` is a marker.
2. **MAJOR** · §10 diagram (L1111–1116), §11 diagram (L1185–1191) · B3 and STYLE §11 require a "what to notice" sentence after every diagram; here the next heading follows directly. · Add one sentence each. §10: only the left branch freezes the value into the caller. §11: the inner listener has the extra arrow to the screen. Optionally change "Notice:" in §12 (L1317) and §13 (L1427) to "What to notice:".
3. **MAJOR** · L275, L293, L1872, L1873, L1946 (tagged `[Doc]`, not `[Lab]`), L2142 · C3: these "in the lab" sentences do not name their test. Every test exists: `OperatorBehaviourTest` ("_ as an identifier", "switch statement falls through"), and `Q01OutputsTest` (the Q01.08 byte mask and `>>` vs `/`, the Q01.09 for-loop, Q01.13 twice). · Add the matching `[Lab: …]` link to each sentence. At L293, replace "both" with what the test asserts.
4. **MAJOR** · Q01.06 (L1733–1735), Q01.28 (L2661), Q01.25 (L2577) · D9 requires the order symptoms → hypotheses → evidence → fix → prevention and monitoring. Q01.06 and Q01.28 put Prevention before Fix. Q01.25 and Q01.28 give no detection or monitoring, and give evidence only for hypothesis 1. · Move Prevention after Fix. Add a monitoring clause: for Q01.25, a startup or CI check that the dependent was rebuilt against the new library version; for Q01.28, a test with ids above 127 plus a static-analysis rule against `==` on boxed types. Add one clause on how to rule out the other hypotheses (`mvn dependency:tree`; reading the config).
5. **MAJOR** · §10 callout (L1157–1159), §13 callout (L1496–1498) · B10 requires diagnosis evidence, fix and prevention. §10 gives neither evidence nor prevention; §13 gives no evidence. · §10: evidence (`javap -c` shows the literal, not a `getstatic`); prevention (rebuild dependents when the library changes; expose changeable values through a method). §13: evidence (the misses correlate with ids > 127).
6. **MINOR** · §2 diagram (L163–168) vs L176 · The diagram draws `long --> float` solid, but the text and JLS 5.1.2 say that `long` → `float` can lose precision, so the "what to notice" sentence is wrong for that arrow. · Make `long -.-> float` dotted, so that only lossless arrows are solid.
7. **MINOR (disputed, see the main-session note above)** · L59 · The reviewer says the claim "if both exist, the `String[]` one runs" overgeneralizes: under a four-step order (static `main(String[])`, static `main()`, instance `main(String[])`, instance `main()`), a static no-arg `main` beats an instance `main(String[])`. `LaunchProtocolTest` (`TwoMains`) covers only two instance methods. · Check against JEP 512 and fix only if needed. Optionally add a static-vs-instance case to `LaunchProtocolTest`.
8. **MINOR** · L1505 · "The wrapper constructors are deprecated since Java 9" omits that they are `@Deprecated(forRemoval = true)` since Java 16, and the text has no §4.2 marker or Version note. · Add the deprecated-for-removal marker (since 16, use `valueOf`) at the first mention. Optionally add a one-line Version notes callout to §13.
9. **MINOR** · B7: traps that give the correction but not why the myth exists: L148, L251, L448, L576, L578, L670–673, L814–815, L922–924, L1170–1172. · Add a clause of about 8 words to each (for example, at L1171: `static final` reads like `const`).
10. **MINOR** · §10 Code (L1126–1151) · `Tax` has no approach or steps, and never shows the section's central mechanism (inlining across separately compiled classes, which only `ConstantInliningTest` shows). · Add an approach with 2–3 steps, and an Excerpt of the compile-then-recompile test or a 3-line `javap -c` output.
11. **MINOR** · §8 (L819–926) · No "Failure modes and operations" subsection, though the topic has operational content: overload resolution is fixed in the caller's class file, so a new overload in a library does not reach compiled callers until they are recompiled; and a wrong downcast throws `ClassCastException`. The Java 11 private `invokevirtual` change is only an inline marker (L855). · Add 3–4 lines of Failure modes, and turn the Java 11 note into a Version notes callout.
12. **MINOR** · §7 diagram (L687–710) · The diagram draws `AbstractCollection <|-- HashSet`, but `HashSet` extends `AbstractSet`. `CountingSet` appears only as `Set <|.. CountingSet`, though the code extends `AbstractSet`. · Add `AbstractSet` to the chain, plus one sentence: `AbstractSet` is documented for extension (only `iterator` and `size` are required), so extending it is not the fragile-base-class case.
13. **NIT** · The module mixes "behaviour" (L357, 1409, 2617, 2634, 2765) and "behavior" (8 times). Headings feed anchors, so the L1409 link must change with them. "initialised" appears in the `Tax` Complete snippet (L1133), so fixing it means editing the lab file too.
14. **NIT** · L289 cites JLS 15.23 for both `&&` and `||`, but `||` is in §15.24. L291 cites 15.22.1 for `~`, which is in §15.15.5.
15. **NIT** · L1300, L1409 and L2604 link exercises by their heading slugs; the module's convention is the explicit `#ex01-n` anchors.
16. **NIT** · Q01.14 Trap (L2193): "on Java 25 they must be the only one" is ambiguous. · Say: at most one explicit constructor invocation, and only the prologue may precede it.
17. **NIT** · Terms with no gloss: JIT (L46, L53), HotSpot (L857, L2682), full GC and HPROF (Q01.26), JPA (L1394), Liskov substitution (L2274). The §5 problem (L456–460) uses "overrides" and `abstract` before §8 and §9 explain them; add a forward link.
18. **NIT** · L1197 is an orphan fragment (the `[Lab: NestedTypesTest]` link on its own line). · Fold it into the previous sentence.
19. **NIT** · Ex01.2 criterion (3) is tested only for a constant with no body; a constant with a body that omits the method gives a different error. · Reword the criterion to "a constant without a body", or test the second case.
20. **NIT** · Q01.22 follow-up (L2458) lists `strictfp` without saying it has been redundant since Java 17 (JEP 306). Q01.09 (L1945) mentions the JEP 507 preview in a follow-up, but the plan limits preview mentions to Version notes.
21. **NIT** · Q01.02 (L1557) gives the design rationale for `public`, `static` and `void` with only a JLS 8 tag, which supports the rule but not the rationale. · Present it as "the reasoning usually given", or tag a source.
22. **NIT** · Ex01.3 (L2865–2889, L2911–2934) puts two Excerpt headers (two files) in one fence, but STYLE §7.3 expects one header per block. · Split into one fence per file. The Q01.21 follow-up 2 (L2439) puts its answer inside the italic question.
23. **NIT** · A3 "Short on time" leaves out Q01.10 (pass-by-value), usually the most-asked Java question; consider swapping it in for Q01.25. The JDK bug id cited for the JDK 18 change (JDK-8277604, L1203, L2610) differs from the plan's JDK-8271623; confirm it against the release note.

## FIX grouping (as queued in TASKS.md)

Prose headroom is 64 words, and findings 1, 4, 5, 9, 10 and 11 add text. Each FIX either offsets its additions with cuts (candidates: the overlap between the §13 callout and the Q01.28 evidence, the restated override rules in Q01.20, the Ex01.1 follow-ups that repeat §2), or Jorge approves a cap raise (SYLLABUS §9).

- FIX-M01-01 (S) · Findings 1, 4
- FIX-M01-02 (S) · Findings 2, 6, 12
- FIX-M01-03 (S) · Findings 3, 8 (+ NITs 14, 15, 18)
- FIX-M01-04 (M) · Findings 5, 10, 11
- FIX-M01-05 (S) · Finding 7 (verify first)
- FIX-M01-06 (M) · Finding 9
- FIX-M01-07 (S, optional) · NITs 13, 16, 17, 19–23
