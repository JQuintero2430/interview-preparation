# REVIEW-M06

- Route: a fresh read-only subagent (general-purpose, model sonnet), launched by S20261127-1801-claudecode-cloud. Per RUN.md §4 it received only these inputs: `modules/06-java-exceptions-strings-io.md`, `_meta/modules/M06.md`, `_meta/QUALITY-BAR.md` and `STYLE-GUIDE.md`. For spot checks it could also read the m06 lab code, JDK 25 `src.zip`, and JLS, JEPs and Javadoc through `curl`. It ran no `mvn` and wrote no repository file (its scratch scripts were in the session scratchpad). It was told not to flag prose length or the 2-callout count, and to judge the Ex06.3 criteria on their merits.
- Date: 2026-11-27. Module state: CLOSEd by CLOSE-M06 (S20261127-1201) plus FIX-M06-01 (this session). 0 `TASK:` markers, 10 sections, 26 Q, 3 Ex, 3 Production scenario questions, 2 body callouts.
- Commands the reviewer ran (summary):
  - `module-stats.mjs` → 06: 26 Q, 3 Ex, 3 PS, flags none; `check-links.mjs --planned` → all links resolve
  - QUALITY-BAR greps: TASK 0; D1 26/26/26/26/26; 7 subsections × 10; Framework vs language 3, Version notes 10, Production scenario callouts 2, Security 10; Mermaid 9; tags Doc 306, Lab 332, Src 403, Unverified 0; 26 anchors directly above headings
  - snippet script, 46 fenced blocks → Excerpts in order, Complete blocks equal their files, 0 mismatches
  - 55 `Ex06.n · (k)` test names ↔ `@DisplayName`s in m06/ex1..ex3 → complete both ways
  - Output answers Q06.03, .07, .12, .15, .19, .21 vs `Q06OutputsTest` → all match
  - about 115 quotes against JDK 25 `src.zip`, JLS 25, JVMS, man pages, JEPs, release notes, HotSpot jdk-17/18/25-ga sources
  - `javac` (JDK 25) on scratch multi-catch files (`||` and `|`)
  - SOURCES.md URL comparison, ledger-ID comparison with plan §3 (82 primary IDs all present), cross-module `### Q` grep
- **Verdict: CHANGES_REQUIRED** (0 BLOCKER · 2 MAJOR · 8 MINOR · 6 NIT) → FIX-M06-02..05; finding 15 rejected.

## Findings (transcribed from the reviewer's report)

1. **MAJOR** · C1/D2 · Q06.01 Short answer: "A `catch` may name `Throwable` or any subclass, never a type variable, or a union of unrelated ones." Wrong: a union of *related* alternatives is the error (JLS 25 §14.20: "a compile-time error if a union of types contains two alternatives Di and Dj (i ≠ j) where Di is a subtype of Dj"); the module's own Q06.06 and §2 say so; `javac` on `FileNotFoundException | IOException` → "Alternatives in a multi-catch statement cannot be related by subclassing". Fix: "never a type variable, and in a union no alternative may be a subclass of another".
2. **MAJOR** · C1 · §7 "What the `String` API counts" (line 865), §7 Best practices (line 927), Q06.20 Short answer (line 2293): "every emoji" is outside the BMP / takes two `char`s. False: many emoji are BMP (❤ U+2764, ⭐ U+2B50, ✅ U+2705, ☀ U+2600; `length()` 1). Fix at all three places: "most emoji (for example U+1F600), but not all: ❤ U+2764 and ✅ U+2705 are in the BMP"; verify with a lab assertion.
3. **MINOR** · C1 · Q06.06 prompt and Full explanation: "three compile errors" / "fails on the `||`, on the related alternatives, and on the assignment". javac reports only parse errors for `||`; with `|`, only the related-alternatives error (1 error). Fix: "three separate mistakes; javac reports them one at a time as each is fixed".
4. **MINOR** · C1 · §1 Version notes: "(JDK-8233014)" for the JDK 15 `ShowCodeDetailsInExceptionMessages` default. The JDK 15 release notes list JDK-8237767 ("Enable ShowCodeDetailsInExceptionMessages by default"). Fix: JDK-8237767.
5. **MINOR** · C1/C8 · Q06.16 "Where the pool lives" cites `globalDefinitions.hpp` for the 65536 default; the value is `defaultStringTableSize` in `runtime/globals.hpp` (already cited). Fix: drop the `globalDefinitions.hpp` tag, and its SOURCES.md row if no other module uses it.
6. **MINOR** · C8 · SOURCES.md `06` block lacks 8 URLs the module uses (System Javadoc 25; JLS §10.7, §14.11.3, §3.8, §4.2.1, §4.2.2; JDK 25 `Class.java`, `Double.java`). Fix: add them under 06.
7. **MINOR** · B14 · terms before a gloss or link: JIT and C2 (line 480, link 10), CLDR (line 1204), JFR (line 1136), BMP (line 863), NFC/NFD (line 867), shutdown hooks (line 224). Fix: one-clause gloss and link at first use.
8. **MINOR** · B5 / STYLE-GUIDE §3, §2.2(4) · answer snippets without approach and numbered steps: Q06.14, Q06.22 `undoWrongDecode`, Q06.23, Q06.25 `CartSession`, Q06.26 `untranslatedKeys`; Q06.09 (approach, no steps); §1 `UncheckedThrow` (one sentence). Fix: 2–4 numbered steps before each.
9. **MINOR** · STYLE-GUIDE §5.3 / D1 · Q06.23, Q06.24, Q06.25, Q06.26 have no question body between heading and `<details>`. Fix: a one- or two-sentence interviewer prompt.
10. **MINOR** · rendering · line 863 has a raw U+FFFF where the escape `'\uFFFF'` was meant; lines 877 and 909 have raw invisible U+FEFF inside literals. Fix: write them as escapes.
11. **NIT** · §1 "Choosing checked or unchecked" (line 87): "The JLS suggests making most new exception classes checked"; JLS §11.1.1 says "it is typical to define most new exception classes as checked exception classes". Fix: "notes that it is typical".
12. **NIT** · C4 · `File.toURL` called deprecated (lines 978, 1045, 2551) without a marker. Fix: `[Deprecated since Java 1.2]` (verify the `@Deprecated` annotation's `since`, or the Javadoc) at the first mention.
13. **NIT** · G1 · Ex06.3 criterion (4) (line 3062): "That test was red on the first run…" is authoring history. Fix: drop the sentence, keep the spec quote.
14. **NIT** · E1 · Ex06.1 criterion (2): "every close failure is in its `getSuppressed()`": "its" is ambiguous. Fix: "in the `getSuppressed()` of that cause".
15. **NIT** · F1 · Summary paragraph 3 packs §6–§10 into about 500 words. Fix: split, or keep if the paragraph count matters.
16. **NIT** · Q06.25 `serialVersionUID` bullet: "The `static` field is not serialized as a field": name `serialVersionUID`.

Uncertain, not counted: the Protocol Buffers quotes (§9, Q06.25) could not be checked (protobuf.dev unreachable through the proxy).

## Checked and fine (reviewer's summary)

A1–A6 header and frame; B1–B4, B6–B13 (all 7 subsections in all 10 sections, 9 diagrams each with "What to notice", §4 a table as planned, 2 callouts distinct from Q06.08/13/22); C1 about 115 quotes verified, C2/C3 Output answers and lab tags, C4 marker forms, C7 46 snippets 0 mismatches, C10; D1–D9 (7 tags, max 31%, cross-module targets Q05.26, Q05.27, Q17.09, Q02.15, Q01.05 consistent, no duplicates); E1–E4 (Ex06.3 criteria judged sound; 55 tests mapped both ways; no `@Autowired`, no constructor over 4 parameters, no method over 20 lines); F1–F4; G2/C9 (82 primary ledger IDs all in the module; plan §2 checklist all housed; delegated topics linked, B15). Teaching flow holds; no repetition that forces a double read. Not checked: H1/H2 (no `mvn`), reading 5 ledger rows (ledgers not an input).

## Main-session notes (S20261127-1801-claudecode-cloud, not part of the independent review)

- Findings 1 and 2: the quoted text was confirmed at lines 1278 and 865/927/2293 by `grep`. Finding 4: `JDK-8233014` present at line 154.
- Finding 15 is **rejected**: STYLE-GUIDE caps the Summary at 3 paragraphs, and the reviewer allows keeping it; a split would break the cap.
- Protocol Buffers quotes (the reviewer's "uncertain" item), checked after the review by the main session on 2026-11-27: protobuf.dev returns 000 through the proxy, but the site's source is readable at `https://raw.githubusercontent.com/protocolbuffers/protocolbuffers.github.io/main/content/{overview.md,programming-guides/proto3.md}`. §9 and Q06.25 "a language-neutral, platform-neutral extensible mechanism for serializing structured data" = `overview.md` front-matter description, word for word; "old code … read new messages without issues, ignoring any newly added fields" = `overview.md` lines 130–131 ("old code will read new messages without issues, ignoring any newly added fields"; the ellipsis drops "will"); the heading "Updating A Message Type" and its anchor `{#updating}` exist in `proto3.md` (line 1024), whose "Adding new fields is safe" rule ("old binaries simply ignore the new field when parsing") supports the Q06.25 table cell "old code ignores new fields". Verified, no change needed. Optional nuance for FIX-M06-02: the table's "Human-readable: no (binary)" holds for the binary wire format; the proto3 guide also names ProtoJSON and a text format.
- Grouping: FIX-M06-02 (findings 1, 2, 3, 4, 5, 11, 16: accuracy), FIX-M06-03 (6: SOURCES.md), FIX-M06-04 (7, 8, 9: teaching and format), FIX-M06-05 (10, 12, 13, 14: rendering and nits).

## Resolutions

(Filled by the FIX tasks.)
