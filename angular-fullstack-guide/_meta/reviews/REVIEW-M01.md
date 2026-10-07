# REVIEW-M01: `modules/01-js-values-types-coercion.md`

- **Reviewer:** subagent, model claude-sonnet-5-5, for session S20261006-0237-claudecode
- **Date:** 2026-10-06
- **Files read:** `modules/01-js-values-types-coercion.md` (all 1,408 lines); labs `labs/ts-js/src/modules/01-js-values-types-coercion/{loose-equals,money,unicode-text}.ts` and their `.test.ts`; `labs/ts-js/src/outputs/01-js-values-types-coercion/{types,numbers,strings-symbols,coercion,equality,nullish}.test.ts` and `run-snippet.ts`; `labs/ts-js/src/outputs/capture.ts`; `_meta/QUALITY-BAR.md`; `STYLE-GUIDE.md`; `VERSIONS.md`; SYLLABUS §1 table and the §4 block for module 01; `SOURCES.md` (Module 01 heading); `_meta/GLOSSARY-TERMS.md` (Module 01); `_meta/UNVERIFIED.md`; `_meta/LOG.md` (M01 entries); `modules/17-signals.md` (reference: diagram count, part sizes, Q17.04); `_meta/reviews/REVIEW-M02.md` (format only); the published `@angular/core` 22.2.1 `fesm2022/core.mjs` in `labs/angular/node_modules` (the section 5 excerpt).
- **What was run (read-only):** the QUALITY-BAR "Measuring" one-liners, `node labs/tools/check-snippets.mjs . 01` (exit 0, "All snippets check out"), `node labs/tools/check-links.mjs --planned` (exit 0, "All links resolve", 179 planned links), a Python script that checks every *Output* snippet in the module against the test sources (all 13 are contained verbatim), and short `node -e` snippets under Node 24.21 (quoted where used). **The vitest suites were not run** (hard rule); every statement that a test passes is read from the test source, and `_meta/LOG.md` records `vitest 01 49/49` after FIX-M01-03 (not re-run here).

Overall: the module is accurate where it matters most. All 13 *Output* answers match their assertions line for line, every Excerpt is verbatim, the 8 SYLLABUS checkboxes are covered, and the closing sections are complete. The findings are: two wrong sentences that a careful interviewer or reader would catch (the harness description at line 445 and the `<=` follow-up at line 1015), one mechanism explanation that contradicts Q01.03, a garbled backend callout, and several frame items that the pilot does well and this module does not yet: one diagram in seven sections (the equality algorithm and the three string levels have none), body links that leave five questions orphaned, a Summary-era traps list without "why the myth exists" and without a single "once true" history item, edition markers that are inconsistent, a prose count under the A/B/C/E floor, and exercise criteria whose test names and one `==` check do not match what the text says.

---

## QUALITY-BAR

Counts: **31 Pass, 12 Fail, 2 N/A** (45 items).

| ID | Result | Evidence |
|---|---|---|
| A1 | Pass | Lines 3-9 are in the STYLE-GUIDE §4.1 order (What this covers, Prerequisites, Leads to, Applies to, Study time, Short on time, Labs); line 9 carries `npx vitest run src/modules/01-js-values-types-coercion src/outputs/01-js-values-types-coercion`. |
| A2 | Pass | Line 4 says "none" (first module), so no link needs an anchor. |
| A3 | Pass | Line 8: 2 section links (5, 6), 6 question IDs (Q01.04, 15, 18, 19, 20, 21), ends with the Summary link; the link check resolves all of them. |
| A4 | Pass | Lines 13-24: 7 concept sections plus Summary, Question bank, Hands-on exercises, Check your understanding, Connections; `grep -c '^## [0-9]'` = 7; link check passes. |
| A5 | Fail (Low) | Order is values, numbers, strings, symbols, coercion, equality, nullish. Section 4 (line 214) and section 2 (line 108, `Object.is`) use things defined in 5 and 6, each with a forward link, which is acceptable. But the last section (7, nullish operators) is the most basic one, not "the deepest"; the algorithms are in 5-6 (T-12). |
| B1 | Pass | `grep -c` of each of the six subsection headings = 7 = number of concept sections. |
| B2 | Fail | Section 1 (line 32) opens with a definition and a generic risk ("if you misjudge the type … every later step is wrong"), not a concrete failure; section 4 (line 200) describes a hypothetical collision, not a bug someone shipped. Sections 2, 3, 5, 6, 7 are concrete (64-bit ID off by one, 280-character counter, `[] + {}`, `indexOf` never finding `NaN`, `||` overwriting `0`). See T-3. |
| B3 | Fail | 1 diagram (section 5, line 254, with a "What to notice" at line 263) against 5 in the pilot's 9 sections. Two sections have the diagram shapes the bar names and none: section 6 (the 8-step IsLooselyEqual decision flow, lines 335-344) and section 3 (the three-level hierarchy code unit / code point / grapheme, lines 150-158, plus the surrogate-pair encoding). See T-1. |
| B4 | Pass | Each section answers a "why": `typeof null` tag history and `[[Call]]` (53), round-to-nearest-even and shortest round-trip printing (104-105), surrogate pairs and UAX #29 (162-164), symbol reflection rules and `ToString` refusing symbols (208-210), ToPrimitive/OrdinaryToPrimitive and the `+` algorithm (267-283), the IsLooselyEqual steps and the `Set.prototype.add` `-0` rule (335-348), short-circuit semantics (399-403). Section 7 is thin on the spec algorithm for `?.` but adequate. |
| B5 | Fail (Low) | Short code parts have a one-sentence approach, but none of the non-trivial snippets has numbered steps: Exercise 01.1 `truncate` (line 1159, prose approach), Exercise 01.3 `allocate`/`format` (1289), Q01.09's `parse` excerpt (685, no approach sentence before it), Q01.14 `isUser` (844). See T-11. |
| B6 | Pass | All 22 best-practice bullets (lines 77-79, 129-132, 184-186, 232-234, 304-306, 368-370, 423-425) carry a "because" clause. |
| B7 | Fail | Of the 21 trap bullets only a few say why the myth exists (e.g. line 311 "look random only when you skip the ToPrimitive step", 192, 136); most give only the correction (lines 83-85, 138, 190-191, 238-240, 310, 374-376, 429-431). No bullet carries a "once true … until vX" history although the module has at least four candidates (T-5). |
| B8 | Pass | *Coming from the backend* callouts at lines 72, 124, 179, 363, 418, each with "Where the analogy breaks". SYLLABUS 01 names no required comparison, and STYLE-GUIDE §6 lists no *Framework vs platform* topic that this module owns (the Intl material belongs to Module 34). An optional NOTE for `booleanAttribute`/`numberAttribute` is suggested in T-5. |
| B9 | Fail (Low) | Undefined on first use: "realms" (line 85, first explained only by example in Q01.14), "sloppy" (55), "ToObject" and "`[[Call]]`" (53, 55), "interned" (Q01.01, line 455), "`[[Set]]`" (Q01.03, line 514), "branded type" (701, linked). `_meta/GLOSSARY-TERMS.md` Module 01 has 24 terms but none of "realm", "sloppy mode", "strict mode", "ToObject" (T-9). |
| B10 | Pass | Strict mode, `Intl`, iteration protocols, `#private` fields, contracts and TypeScript narrowing are each one sentence plus a link. (Repeated passages inside the module are listed under Redundancy.) |
| C1 | Fail | 20 claims sampled (list in "Claims sampled" below): 14 have a lab test, spec link or official source. Six have none: the PostgreSQL `varchar(n)` unit (180), the Java `Integer` 128 cache trap (73), Jackson's missing-versus-null behavior (419), `Intl.Segmenter` "shipped in all current browsers" (764), "`Symbol` is deliberately not a constructor, to stop people creating wrapper objects" (240) and the BigInt no-mixing rationale (109). See T-8 and V-3, V-7 to V-9. |
| C2 | Pass | `grep -o 'Q01\.[0-9]*'` over the outputs folder covers Q01.02, 04, 05, 06, 07, 08, 10, 13, 15, 16, 19, 20, 22 (the 13 *Output* IDs). A script confirmed every module *Output* snippet is contained verbatim in its test file, and I read all 13 expected arrays against the short answers: identical. |
| C3 | Pass | Every "Verified:" test name exists (e.g. `Q01.03 follow-up`, `Q01.13 follow-up`, the three `Q01.14` tests, `Q01.17 the fixes`, `Q01.21 the fix`). Exercise claims are tested (`isWellFormed` loop, the 1,156-pair matrix: I counted 34 values, 34² = 1,156). Two overreaches are in factual error 10 (Low). |
| C4 | Fail | No bracketed status marker appears (`grep -E '\[(Stable since\|Added in…'` is empty); editions are given as bare parentheticals. Inconsistent first-mention coverage: BigInt first appears at line 44 and its "ES2020" at 109; `Intl.Segmenter` (line 156), `**` (Q01.05), `includes` (line 328; marked only at 1041), `Intl.NumberFormat` `signDisplay: 'negative'` (Q01.06, ES2023 / NumberFormat v3) and `Symbol` have no edition at first mention. See T-6. |
| C5 | Pass | No Angular API beyond `booleanAttribute`/`numberAttribute`, which exist in the 22.2.1 `core.mjs` (lines 2891-2897). Every JavaScript API used ran under Node 24.21 in my checks (`isWellFormed`, `Intl.Segmenter`, `signDisplay: 'negative'`, `Intl.NumberFormat.format(string)`). The lab sources were read, not compiled. |
| C6 | Pass | `grep -c 'Unverified'` on the module = 0; `_meta/UNVERIFIED.md` has no Module 01 row. |
| C7 | Pass | `node labs/tools/check-snippets.mjs . 01` exits 0. No unmarked non-Output snippet remains. (Note: the section 5 excerpt of `labs/angular/node_modules/.../core.mjs` points to an ignored path; see C8.) |
| C8 | Fail (Low) | All 33 distinct external URLs in the module appear in SOURCES.md Module 01. The package source the module cites at line 290 (`@angular/core` 22.2.1 `fesm2022/core.mjs`, `booleanAttribute`/`numberAttribute`) is missing: the heading's "Packages read" list names only the lab folders. |
| D1 | Pass | Counts: 22 `^### Q[0-9]`, 22 Short answer, 22 Full explanation, 22 Follow-ups, 22 Trap to avoid. Each answer has at least 2 answered follow-ups; Code, where present, comes after the explanation. |
| D2 | Pass | All 13 *Output* short answers list the printed lines and add one to three sentences of reasoning. |
| D3 | Pass | 6 distinct tags; Output 13 of 22 = 59.1% (limit 60%, margin of one question); Trade-off 1 (Q01.14); Design 2; Bug hunt 4. Note: Q01.21 carries a `Difference` tag that its content does not support (T-10). |
| D4 | Pass | Titles run basic (Q01.01 primitives) to deep (Q01.22 defaults/JSON) in section order. Q01.14 (a run-time type-check comparison) sits after the coercion-hint question although it draws on section 1; acceptable. |
| D5 | Pass | `grep '^### Q'` over modules 02, 03, 04, 17 for typeof/NaN/null/symbol/coercion/equality finds no repeat (Q02.04 is about block-scoped function `typeof`, Q03.03 about prototypes, Q17.10/Q17.35 about signal equality). |
| D6 | Fail | Five questions are never linked from the body or any other answer: Q01.01, Q01.02, Q01.10, Q01.12, Q01.17 (`grep -n '](#q01-NN)'` is empty for each). Section 1 does not link Q01.01/02, section 3 not Q01.10, section 4 not Q01.12, section 5 not Q01.17. Also, 15 of 22 answers have no link back to the section they rely on (Q01.02, 03, 05, 06, 07, 08, 09, 10, 11, 12, 15, 18, 19, 21, 22). See T-7. |
| D7 | Pass | 22 `<a id="q01-NN">` anchors, each directly above its `### Q01.NN`; link check passes. |
| D8 | Pass | 22 questions = SYLLABUS §1 ceiling for 01 (22), above the floor of 15. No room is left for new questions without raising the ceiling (relevant to T-13). |
| E1 | Pass | Each of the 3 exercises has Problem, Constraints, criteria checklist, 2 hints, Worked solution (approach, code, criterion account), Alternative approach plus Trade-offs, 3 answered Interviewer follow-ups, and a Tests link. |
| E2 | Fail | Exercise 01.3's last criterion requires that `==` on a Money throws; `money.test.ts` asserts only `+` and `*` (`fails loudly on accidental arithmetic…`). The "format uses Intl for the requested locale" criterion is tested for `en-US` only. Lines 1176, 1246 and 1315 claim "a test of the same name" per criterion; the test names are paraphrases. See factual error 8 and T-14. |
| E3 | Pass | 01.1 (helpers) → 01.2 (spec algorithm, differential test) → 01.3 (integrates BigInt, `Symbol.toPrimitive`, `toStringTag`, JSON, `Intl`). |
| E4 | Pass (read, not run) | The three solutions are small, typed, no `any`, no injected dependencies, branching low (`coerceFrom` has 6 branches); `loose-equals.ts` contains no `==`/`!=` operator (grep hits only comments), honoring its constraint. Not executed by me. |
| E5 | Pass | 13 *Output* questions. |
| F1 | Pass | Two paragraphs (lines 437, 439) restate all 7 sections with section links and the most-asked trap of each; every fact is taught above. |
| F2 | Pass | 6 prompts, each naming a listener (colleague, backend developer, product manager, reviewer, teammate, interviewer). |
| F3 | Pass | 10 `<details>` flashcards with one- or two-line answers. |
| F4 | Pass | Builds on / Read next (with reason) / Uses these ideas later (8 modules, each with a reason). Header "Leads to" lists Module 08 but Connections does not (T-15). |
| G1 | Fail | Whole file 13,602 prose words. By part: header and Contents plus sections 1-7: 4,689; exercises: 1,821; Summary: 366; question bank (22 Q): 6,340; closing: 385. Parts A+B+C+E = 6,510, below the 8,000 floor (pilot: 7,622 for sections alone, 9,937 for 40 questions). Under the floor is acceptable only when the checklist is fully covered; B2, B3, B7, B9, C1, D6, E2 above are open and need added content (not filler), see T-1, T-3, T-5, T-13. |
| G2 | Pass | All 8 SYLLABUS §4 boxes map to a section and questions (next section). |
| H1 | N/A | Tests not run (hard rule for this review). LOG.md records `vitest 01 49/49` after FIX-M01-03. |
| H2 | Pass | `node labs/tools/check-links.mjs --planned` exits 0, "All links resolve" (179 planned links). |
| H3 | N/A | `git status --short` shows the whole `angular-fullstack-guide/` directory untracked (`?? ./`), so a stray-file check by status is not possible. I created no file other than this review. |

### Claims sampled for C1 (basis in brackets)

1 `typeof null` history (MDN link, line 53). 2 `0.1 + 0.2` and `toFixed` (Q01.04 test). 3 2^53 rounding and JSON IDs (Q01.07 test). 4 `Math.round(-0.4)` is `-0` (test, spec link). 5 `signDisplay: 'negative'` output (test, MDN link). 6 BigInt truncation, `RangeError`, JSON `TypeError` (Q01.08 test). 7 surrogate pairs, `slice`, normalization (Q01.10 test). 8 reverse by unit/code point/grapheme (Q01.11 test). 9 `Symbol.toPrimitive` hints (Q01.13 test). 10 `instanceof` across realms (Q01.14 `vm` test). 11 `Date` default hint (follow-up test). 12 `parseInt` as `map` callback (Q01.16 test). 13 `null >= 0` (Q01.19 test). 14 `-0` stored as `+0` in `Set` (Q01.20 test). 15 `Double.equals` behaves like `Object.is` (Javadoc link). 16 `Integer a = 128` trap (**no basis**). 17 `varchar(n)` counts characters (**no basis**). 18 Jackson cannot tell missing from `null` (**no basis**). 19 `Intl.Segmenter` in all current browsers (**no basis**). 20 `Symbol` not a constructor "to stop wrapper objects" (**no basis**).

---

## SYLLABUS §4 coverage

| Checkbox | Covered in |
|---|---|
| The 7 primitives + objects; `typeof` quirks (`null`, functions); wrapper objects | Section 1 (lines 36-57, misconceptions 83-85); Q01.01, Q01.02, Q01.03; flashcards. |
| Number: IEEE-754, `0.1+0.2`, `NaN`, `-0`, `Number.EPSILON`, safe integers, `BigInt` | Section 2 (lines 97-109, 129-138); Q01.04 to Q01.09; Exercise 01.3. (`Infinity`, overflow and `isFinite` are not covered anywhere: T-13.) |
| Strings: UTF-16, code units vs code points, `length` traps, `Intl.Segmenter` (pointer only) | Section 3; Q01.10, Q01.11; Exercise 01.1. The module goes beyond a pointer (Segmenter is used in Q01.11's fix and Exercise 01.1); no conflict with the STYLE-GUIDE §5.2 tie-break yet because Module 34 is unwritten (T-16). |
| Symbols and well-known symbols (`Symbol.iterator`, `toPrimitive`, `toStringTag`) | Section 4 (lines 204-216); Q01.12, Q01.13, Q01.14. `Symbol.iterator` is a pointer to Module 03. |
| Coercion algorithms: ToPrimitive, ToNumber, ToString, ToBoolean; truthy/falsy | Section 5 (lines 265-283); Q01.13, Q01.15, Q01.16, Q01.17. |
| Equality: `==` algorithm, `===`, `Object.is`, SameValueZero (used by `includes`, `Map`) | Section 6; Q01.18, Q01.19, Q01.20; Exercise 01.2. |
| `null` vs `undefined`, `??` vs `||`, optional chaining, `??=`/`||=`/`&&=` | Section 7; Q01.21, Q01.22. |
| Output drill: 10+ "what does this print" coercion puzzles (verified) | 13 *Output* questions (Q01.02, 04, 05, 06, 07, 08, 10, 13, 15, 16, 19, 20, 22), all with a named test. |

---

## Factual errors

**1. High · line 445 (question bank intro) · the logger description is wrong.**
Quote: "The logger joins arguments with `String()`, so the snippets log only values whose `String()` form is unambiguous."
Correction: `captureLogs` formats with `util.format`, "which is what console.log uses, so an asserted line is exactly what Node prints (`-0`, `10n`, `[ 1, 2 ]`, `{ a: 1 }`), not what String() gives" (`labs/ts-js/src/outputs/capture.ts` lines 3-6, code at lines 7-14). The two formats differ for exactly the values this module teaches (`String(-0)` is `'0'`, `util.format(-0)` is `'-0'`; `String([1, 2])` is `'1,2'`), so the sentence misdescribes how every Output answer was verified. The intent (the snippets avoid values whose printed form depends on the console) is still right: Q01.08 wraps BigInt results in `String(...)` for that reason (line 666).
Fix: say "the logger formats arguments the way `console.log` does in Node (`util.format`)", and keep the BigInt/`-0` remark as the reason the snippets stringify those values themselves.

**2. High · line 1015 (Q01.19 follow-up) · `<=` is not "the same as `!(a > b)`".**
Quote: "*Is `a <= b` the same as `!(a > b)`?* For the spec, yes: `<=` is defined that way, which is why `NaN` comparisons return `undefined` internally and then `false`."
Correction: the equivalence fails exactly for `NaN`. Node 24.21: `NaN <= 1` is `false`, but `!(NaN > 1)` is `true` (also `1 <= NaN` is `false` and `!(1 > NaN)` is `true`). The specification defines `a <= b` as IsLessThan(b, a) with its result inverted *except* that an `undefined` result (a `NaN` operand) makes the answer `false`; it is not the negation of `>`. So the answer to the follow-up is "no, not for `NaN`", and the "which is why …" clause currently argues for the wrong conclusion.
Fix: answer "Not for `NaN`: `NaN <= 1` and `NaN > 1` are both `false`. IsLessThan returns `undefined` for a `NaN` operand and `<=`/`>=` map `undefined` to `false` instead of negating it", and keep `null >= 0` as the example where the negation form does hold.

**3. Medium · line 55 (section 1, How it actually works) · the stated mechanism contradicts Q01.03.**
Quote: "writing a property on a primitive cannot work, because the wrapper is discarded."
Correction: the write fails because the spec's `[[Set]]` is called with the *primitive* as the receiver and returns `false` when the receiver is not an object; strict code turns that `false` into a `TypeError` (Q01.03, line 514, states this correctly). A discarded wrapper is the wrong reason: writing to a wrapper you keep (`const w = new String('a'); w.x = 1; w.x`) works. Evidence: Q01.03 evidence test `types.test.ts` (strict write throws `TypeError`). The two passages should give one mechanism.
Fix: "the engine creates the wrapper for the lookup, but the assignment's receiver is still the primitive, and `[[Set]]` refuses to create a property on a non-object receiver; strict code throws, sloppy code ignores the failure".

**4. Medium · line 73 (section 1, backend callout) · a garbled sentence.**
Quote: "in JavaScript you never need a wrapper. There are no generics over objects only, so collections hold primitives directly".
Correction: the Java fact behind the point is that generics work over reference types only (`List<Integer>`, never `List<int>`), which is why Java needs boxing in collections. "There are no generics over objects only" says nothing a reader can parse. The conclusion (JavaScript collections hold primitives directly) is right.
Fix: "Java generics work only over objects, so a `List<Integer>` needs boxing; a JavaScript array holds numbers and strings directly".

**5. Medium · lines 115-119 and 113 (section 2 Code) · `nearlyEqual` is called relative, but is partly absolute.**
Quote: "compare with a tolerance scaled to the operands" and `Math.max(Math.abs(a), Math.abs(b), 1)`.
Correction: the `, 1` floors the scale at 1, so for operands below 1 the tolerance is an absolute `1e-9`. Node: `Math.abs(1e-12 - 2e-12) <= 1e-9 * Math.max(1e-12, 2e-12, 1)` is `true`, so `nearlyEqual(1e-12, 2e-12)` is `true` although the values differ by a factor of 2. That is a legitimate hybrid (relative above 1, absolute below), but the text and line 106 ("a relative tolerance is needed") present it as purely relative, and an interviewer will test small values.
Fix: name it ("relative for large values, absolute `1e-9` near zero") or drop the `1`.

**6. Low · line 273 (hint table) · the first row reads as unary operators.**
Quote: "Unary `+`, `-`, `*`, `/`, `<`, `>`, `Number(x)` | `'number'`".
Correction: `*`, `/`, `<`, `>` are binary; only `+` and `-` are unary here. Binary `-`, `*`, `/` and the relational operators pass `'number'`; binary `+` and `==` pass `'default'` (row 3). The row as written suggests unary `*`.
Fix: "Unary `+` and `-`, binary `-`, `*`, `/`, `**`, relational `<`, `>`, `<=`, `>=`, `Number(x)`".

**7. Low · line 320 (section 6 problem) · overstated need.**
Quote: "React-style change detection and Angular signals need to tell `-0` from `+0`."
Correction: nothing needs the `-0`/`+0` distinction; those libraries use `Object.is` because it is a uniform, total equality (it also treats `NaN` as equal to itself, which avoids endless updates). The Angular half is correct (`createSignal(initialValue, options?.equal)` falls back to the primitives' default equality, and Module 17 owns it); the "need" is not. Fix: "use `Object.is` (SameValue) so that `NaN` does not look like a change on every write; a side effect is that `0` to `-0` counts as one".

**8. Medium · lines 1176, 1246, 1315 (exercise solutions) · "a test of the same name" is not true, and Exercise 01.3 has no `==` assertion.**
Quote: "Each criterion has a test of the same name in `unicode-text.test.ts`" (same sentence at 1246 for `loose-equals.test.ts` and "Each criterion has a test in `money.test.ts`" at 1315).
Correction: the test titles are paraphrases, not the criterion text. For example criterion 6 of 01.2 is "The result agrees with `==`, including thrown errors, on every pair of a matrix of 34 tricky values" and its test is "agrees with == on every pair of the matrix"; the 01.1 criterion "`graphemeCount` counts what a reader sees: `'👍🏽'` and `'é'` are 1 each" is the test "graphemeCount counts what a reader sees". The mapping is real; the sentence "of the same name" is not. More important, Exercise 01.3's last criterion says "Arithmetic and `==` on a Money throw `TypeError`", and `money.test.ts` (`fails loudly on accidental arithmetic but converts to string and JSON`) asserts `+` and `*` only; line 1289 also says "so `+`, `*` and `==` throw". Also `Money == Money` does not throw (two objects compare by identity, no conversion); `money == 12.34` does (`'default'` hint).
Fix: either add `expect(() => (price as unknown) == 12.34).toThrow(TypeError)` (and an identity case) to the test, or narrow the criterion; and replace "of the same name" with the real test titles (see FIX-M01-08).

**9. Low · line 346 (section 6) · "before anything else" is not literally true.**
Quote: "Booleans are converted to numbers **before** anything else".
Correction: the spec order is same type, `null`/`undefined`, Number/String, BigInt/String, then Boolean, then Object (the module's own list at lines 337-344 shows this: Boolean is step 5). The intended point is "before the object-to-primitive step", which is what makes `[] == false` work. Fix: "before the object step" (or "as soon as one side is a Boolean and the types differ").

**10. Low · lines 485 and 939 · "Verified" attached to claims the tests do not cover.**
(a) Q01.02, line 485: the temporal-dead-zone sentence ("`typeof x` before a `let x` declaration … throws") is followed by "Verified: `Q01.02` in `types.test.ts`", but that test has no TDZ case. The claim is true (Node 24.21: `(() => { typeof tdz; let tdz; })()` throws `ReferenceError`) and Module 02 owns it, but the "Verified" reads as covering it. (b) Q01.17, line 939: "the evidence test covers the falsy list", but the evidence test asserts `Boolean` of `0n`, `-0`, `NaN`, `''` and the truthy cases, not `false`, `0`, `null`, `undefined`. Fix: add the cases to the tests, or narrow the wording.

**Checked and found correct (no action):** the Q01.04 numbers (`5.55e-17` difference, `Number.EPSILON` 2.22e-16, `(1.005).toFixed(2)` is `'1.00'`), `NaN ** 0` is `1`, `Math.round(-0.4)` is `-0`, `Intl` default shows `-0` while `signDisplay: 'negative'` shows `0`, `encodeURIComponent('\uD83D')` throws `URIError` and `TextEncoder` replaces with U+FFFD (EF BF BD), UTF-8 byte sizes in the 01.1 follow-up (`é` 2, `👍🏽` 8), `resolvedOptions().maximumFractionDigits` for JPY/KWD/USD is `[0, 3, 2]`, `Intl.NumberFormat.format('90071992547409.93')` is exact, `/^.$/.test('😀')` is `false` and `/^.$/u` `true`, `Number('0b11')`/`Number('0o7')` work, `new Symbol()` throws `TypeError`, the `a?.b = 1` `SyntaxError`, `[] - []` is `0`, `x + 0` turns `-0` into `0`, and the IsLooselyEqual step order against lines 337-344.

---

## Teaching and completeness findings

**T-1 · Medium · diagrams (B3) · sections 6 and 3.**
Add a Mermaid `flowchart` for IsLooselyEqual in section 6 (after the numbered list at lines 335-344): nodes for "same type? → `===`", "nullish pair?", "Number/String → ToNumber", "BigInt/String", "Boolean → Number, restart", "Object vs primitive → ToPrimitive, restart", "BigInt/Number → compare exactly", "else false", with the restart arrows that explain why the algorithm is recursive. Follow it with "What to notice:" (every Boolean or object edge loops back to the top, so a comparison is a chain of single conversions, and `null` has no outgoing conversion edge). Add a second diagram in section 3 for the three levels (string → code units → code points → grapheme clusters), using `👍🏽` as the running example (4 units, 2 points, 1 cluster), with a "What to notice" sentence. Keep the existing section 5 diagram. Pilot ratio is 5 diagrams in 9 sections; 3 in 7 is proportionate.

**T-2 · Low · the section 5 diagram omits the `ToPrimitive` internals.**
Line 254 shows object → primitive but not the `Symbol.toPrimitive` / `valueOf` / `toString` order that line 267 explains in prose, and the hint table (273) is not tied to it. A small second `flowchart` (hint → `Symbol.toPrimitive`? → OrdinaryToPrimitive in hint order → TypeError) would let the reader trace Q01.13 and the Exercise 01.2 `toPrimitiveDefault` solution. Optional if T-1 is done.

**T-3 · Medium · concrete problem openings (B2) · sections 1 and 4.**
Section 1 (line 32): replace the definition-level opening with a failure, for example a form handler that checks `typeof value === 'object'` to detect "an object" and crashes on `null`, or the review snippet of Q01.03 (a property written on a string, a `new Boolean(false)` that is truthy). Section 4 (line 200): open with a shipped collision (a plugin that stores `obj._meta` on a user-supplied object that already has `_meta`, then its data appears in `JSON.stringify`). Run any new snippet in Node 24 and say so.

**T-4 · Low · the section 5 excerpt cannot be opened from the repository (C7/C8).**
The excerpt at lines 289-298 is labeled `labs/angular/node_modules/@angular/core/fesm2022/core.mjs`, a `.gitignore`d path that exists only after `npm install` in `labs/angular`. The checker passes because the lab is installed, but a reader on GitHub sees a path that does not exist. Add the angular.dev API links for `booleanAttribute` and `numberAttribute` (and the `@publicApi` version, see V-5) in the sentence after the snippet, and say once that the excerpt is the published 22.2.1 package build, not source in this repository.

**T-5 · Medium · misconceptions: add "why the myth exists" and "once true" history (B7).**
Add a "myth comes from…" clause to every trap that lacks one: line 83 (primitives are not objects: the wrapper makes `'hi'.length` look like a property of an object), 84 (`typeof` is a table), 138 (BigInt "safer": it is exact, which sounds safer), 190-191 (`length` equals characters for ASCII, which is what most tutorials use), 238-240 (the description looks like an identity), 310, 374-376 (the `Object.is` "stricter" framing comes from the MDN equality table), 429-431, 374 (`==` "ignores type" comes from teaching `==` as `===` without the type check). Add at least these history items, each with an edition or a cited source:
(a) *"`typeof x` never throws"*: once true for every identifier until ES2015; `let`/`const` created the temporal dead zone, so `typeof x` before `let x` now throws `ReferenceError` (Node 24.21 confirms; Module 02 link).
(b) *"`Object.prototype.toString.call(x)` is a reliable brand check"*: true until ES2015 introduced `Symbol.toStringTag` (the module teaches this in Q01.14 only).
(c) *"`parseInt` without a radix reads `'08'` as octal"*: true in ES3 engines; since ES5 the leading `0` no longer selects octal (`parseInt('08px')` is `8`, Q01.16), and the radix argument remains advisable for the `'0x'` prefix and for readability; the module's anti-pattern at line 306 gives only the `map` reason.
(d) *"Angular templates evaluate `?.` differently from TypeScript"*: see V-4; if confirmed, add the version where it changed next to line 416.
Optional: a *Framework vs platform* NOTE in section 5 (Code): `booleanAttribute`/`numberAttribute` are Angular, `Number(x)`/`ToBoolean` are the platform; Angular's `booleanAttribute('false')` is `false` while JavaScript `Boolean('false')` is `true`. This is the commonly blurred line for this module.

**T-6 · Medium · edition markers at first mention (C4).**
Use one consistent form at the first mention of each post-ES2015 feature, in section order: BigInt (line 44: move "ES2020" from 109), `**` (Q01.05, ES2016), `Array.prototype.includes` (line 328, ES2016), `Intl.Segmenter` (line 156, ECMA-402 9th edition / ES2022 era), `Intl.NumberFormat` `signDisplay: 'negative'` (Q01.06, ES2023 / NumberFormat v3), `String.prototype.isWellFormed` (already ES2024, keep), `??`/`?.` (first used at line 358 in the `looseEquals` excerpt and line 320 area; marked at 399-400), `Object.is` and `Number.isNaN` (ES2015; mark at 108/130 or accept as base). Decide whether the form stays a parenthetical edition (current) or the STYLE-GUIDE §3.2 bracket form (`[Added in ES2020]`); the STYLE-GUIDE defines brackets only for Angular versions, so state the choice once in the module header or the STYLE-GUIDE. Verify each edition against MDN/Baseline or the proposal repository before writing it (V-2).

**T-7 · Medium · orphan questions and missing back-links (D6).**
Link Q01.01 and Q01.02 from section 1 (after line 53 and line 55), Q01.10 from section 3 (after the table at 158), Q01.12 from section 4 (end of "How it actually works", after line 210), Q01.17 from section 5 (line 281, the ToBoolean paragraph, and in the "Empty arrays are falsy" trap at 312). Add a link to the owning section in the 15 answers that rely on one: Q01.02 (`[section 1]`), 03, 05, 06, 07, 08, 09 (`[section 2]`), 10, 11, 12 (`[section 3]`/`[section 4]`), 15 (`[section 5]`), 18, 19 (`[section 6]`), 21, 22 (`[section 7]`). Acceptance: `grep -c` of each `](#q01-NN)` for NN in 01-22 is at least 1 outside the heading.

**T-8 · Medium · bases for uncited claims (C1) and SOURCES.md (C8).**
Give each a source or drop it: Java `Integer` cache (line 73: JLS §5.1.7 boxing and the `Integer.valueOf` Javadoc, cached range -128 to 127) with a Java snippet marker only if code is shown; PostgreSQL `varchar(n)` counts characters (line 180: the PostgreSQL "Character Types" doc, note that `n` is characters); Jackson (line 419: Jackson 3.1.5 docs, or soften to "binding to a plain DTO leaves the field `null` in both cases, so a PATCH needs `JsonNode`, a `Map`, or a wrapper such as `JsonNullable`" and cite); `Intl.Segmenter` support (line 764: MDN browser-compat/Baseline); `Symbol` "deliberately not a constructor" rationale (line 240: spec text or the TC39 note; otherwise say only "calling it with `new` throws `TypeError`"); BigInt no-mixing rationale (line 109: `proposal-bigint` README "no implicit conversion"). Add all of them, and the `@angular/core` 22.2.1 `core.mjs` excerpt source (line 290; `booleanAttribute`/`numberAttribute` lines 2891-2897), to SOURCES.md under Module 01 ("Packages read").

**T-9 · Low · inline definitions (B9).**
Define on first use: "realm" (line 85: "a separate global environment with its own built-ins, such as an iframe or a `vm` context"), "sloppy mode" (line 55: "non-strict, the default for classic scripts"), "ToObject" (line 53), "`[[Call]]`" (53: "an internal method only callable objects have"), "interned" (Q01.01, line 455), "`[[Set]]`" (Q01.03, line 514). Add "realm", "sloppy mode" and "strict mode" to `_meta/GLOSSARY-TERMS.md` Module 01 (HOUSE-owned file: name this in the task).

**T-10 · Low · tag accuracy (D3).**
Q01.21 is tagged `Difference · Bug hunt`; it compares no two things. Retag as `Bug hunt` (the Output share stays at 13/22 = 59.1%). Q01.20 and Q01.22 are legitimately `Difference · Output`. Q01.12's short answer ("Design") stays but is over-long (T-11).

**T-11 · Low · short answers longer than 30 seconds, and approach steps (B5, D1).**
Short answers of 71, 109 and 95 words in Q01.03, Q01.12 and Q01.14 (a 30-second spoken answer is about 70-80 words; the other 19 are under 70). Cut Q01.12 and Q01.14 to the decision rule and move the rest into the Full explanation. For B5, give the exercise worked solutions a numbered approach (Exercise 01.1: 1 segment once, 2 compare count to limit, 3 reserve room for the ellipsis, 4 join whole clusters; Exercise 01.3: 1 hold `bigint` cents, 2 parse by regex, 3 allocate by truncated shares plus leftover, 4 format from the decimal string, 5 refuse numeric hints), and add one approach sentence before the `parse` excerpt in Q01.09 and the `isUser` code in Q01.14.

**T-12 · Low · section order (A5).**
Section 7 is the most basic section and sits last. Renumbering would break anchors in the guide, so the cheapest fix is to record in the module (one sentence in the header or the Contents) that section 7 is an applied close, or to move the "optional chaining short-circuit" mechanism to the spec algorithm level (OptionalChain evaluation) to make the last section deepest. Decide and record; do not renumber.

**T-13 · Medium · missing interview staples within the module's scope (G1, G2 depth).**
The following are not taught anywhere and are common coercion/number interview items; add them as section prose with section-named tests (the question ceiling of 22 is reached, so do not add questions without raising it in SYLLABUS and recording it): (a) `Infinity`, `-Infinity`, overflow (`Number.MAX_VALUE * 2`), `1 / 0` versus `0 / 0`, `isFinite` versus `Number.isFinite` (the global one coerces, exactly like `isNaN`); (b) relational comparison of strings is by code unit, not numerically or by locale: `'10' < '9'` is `true`, `'10' < 9` is `false`, and the default `Array.prototype.sort` converts elements to strings (`[10, 9, 1].sort()` is `[1, 10, 9]`), with `localeCompare`/`Intl.Collator` as the fix (link Module 34); this also completes the one-sentence IsLessThan mention at line 346; (c) what happens when ToPrimitive fails: `Object.create(null)` plus `+obj` throws `TypeError: Cannot convert object to primitive value` (the lab already asserts this in the 01.2 tests); (d) `Number(1n)` is `1` while unary `+1n` throws `TypeError`, a nuance behind line 277's "BigInt … throw" (Node 24.21: `Number(1n)` gives `1`, `+1n` throws `TypeError`; `Number(x)` uses ToNumeric). Each needs a test in the outputs folder named after the section (for example `Section 2: …`) so the "in the lab" rule holds.

**T-14 · Medium · exercise criteria and tests (E2).**
Add the missing `==` assertion for Exercise 01.3 (see error 8), add a second locale to the `format` test (for example `de-DE` for `'1.234,50 €'`; check the exact Node 24 output with `node -e` first) so "the requested locale" is tested, and rename the tests in the three spec files so each title begins with the criterion's own wording; then replace "of the same name" in the three account paragraphs with "named in the checklist order". Keep `unicode-text.test.ts` and `loose-equals.test.ts` logic unchanged.

**T-15 · Low · Connections versus header (F4).**
The header lists Module 08 under Leads to and the SYLLABUS prerequisite table makes 01 a prerequisite of 08, but Connections names no use for it; add one sentence (for example: DOM `dataset`, input `value` strings, and `Number(input.value)` coercion; confirm against Module 08 when written) or remove 08 from the header.

**T-16 · Low · ownership of `Intl.Segmenter` (tie-break, STYLE-GUIDE §5.2).**
The SYLLABUS marks Segmenter "pointer only", yet Q01.11 and Exercise 01.1 teach and implement it. When Module 34 is written, make sure it asks no second Segmenter question; record in the Module 34 plan that Module 01 owns grapheme counting and truncation.

**T-17 · Low · `Array.isArray` "cannot be spoofed" (line 838).** See V-6; if confirmed, say "cannot be faked with `Symbol.toStringTag`", because a Proxy over an array reports `true` by design.

---

## Redundancy

Concrete duplicates only; each is a candidate for "one sentence plus a link", not for trimming length.

1. **ESLint `eqeqeq` with `null: 'ignore'` / `'smart'` and the `x == null` idiom:** line 369 (section 6 best practice) and line 989 (Q01.18 follow-up) say the same thing with the same link. Keep the best practice; make the follow-up one line pointing to it.
2. **"Symbol properties are hidden, not private; `getOwnPropertySymbols` reveals them; use `#private`/`WeakMap`":** lines 208, 233, 239, 778 and 796 (five statements across section 4 and Q01.12). Keep it in "How it actually works" and the Q01.12 trap; shorten the best-practice (233) and misconception (239) bullets to a cross-reference.
3. **`Array.isArray` versus `instanceof Array` across realms/iframes:** lines 85, 488, 840 and 854. Q01.02's follow-up (488) and Q01.14's follow-up (854) are the same answer; keep Q01.14's and link from Q01.02.
4. **BigInt division truncates toward zero (`-7n / 2n` is `-3n`):** lines 109, 663 and the Exercise 01.3 follow-up at 1321. Keep 663; link from 1321.
5. **`undefined` omitted versus `null` kept in JSON, and the PATCH consequence:** lines 403, 419 and 1116 (plus the Summary at 439, which is by design). The PATCH sentence appears in the section, the backend callout and Q01.22.
6. **Currency minor units and the `Intl` `resolvedOptions().maximumFractionDigits` probe:** line 681 (Q01.09) and the Exercise 01.3 follow-up at 1320 repeat the JPY/KWD/USD point; `Symbol.toPrimitive` as the "refuse arithmetic" device is introduced at 220-228, again at 701, 826 and 1289.
7. **`(1.005).toFixed(2)` is `'1.00'`:** lines 131, 551, 681 and 703. Reinforcement is useful in the Output answer; lines 681 and 703 could link to Q01.04.

---

## Claims to verify

**V-1 · Does a browser or Node console print `0` for `{} + []`?** Lines 310, 439 and 880. Line 880 hedges ("historically"), but the Summary (439) says "which is why a console shows `0`" without a hedge, and line 310 says "the console says `0`". Modern Chrome DevTools wraps input that starts with `{` as an expression, which would print `'[object Object]'`; the Node REPL behavior depends on its own heuristics. How to verify: type `{} + []` in the current Chrome, Firefox and `node` REPL, and record the result with versions; the `eval('{} + []')` claim itself is already tested (Q01.15). Until then, hedge lines 310 and 439 like line 880.

**V-2 · Spec section numbers against ECMA-262 2026 (17th edition).** The module cites about 22 `§` numbers (e.g. §24.2.3.1 Set.prototype.add at line 348, §22.1.5, §6.1.6.1.20, §6.1.6.1.3, §21.3.2.28, §20.1.3.6, §13.15.3, §7.2.10-7.2.15). Section numbers shift between editions (for example the Set section gained abstract operations for the set methods in ES2025, which may have renumbered `add`). I could not open the spec in this review. Verify by opening each URL listed in SOURCES.md and comparing the printed number with the text; fix the ones that drifted. Also verify the edition labels proposed in T-6.

**V-3 · `Intl.Segmenter` "shipped in all current browsers and Node.js" (line 764).** How to verify: MDN browser compatibility table for `Intl.Segmenter` (Firefox support is the one to check), plus `node -e 'new Intl.Segmenter()'` (works in 24.21: Q01.11 test uses it). Cite the table or soften to "Baseline widely available since <date>".

**V-4 · Angular template `?.` and `??` "work as in TypeScript" (line 416).** I recall the safe-navigation operator in templates returned `null` instead of `undefined` before a change in v12. How to verify: search the Angular changelog/CHANGELOG for "safe navigation" and run a throwaway template `{{ a?.b }}` with `a = undefined` in `labs/angular` (or read the expression-parser tests). If confirmed, add the "once true until v11/v12" history (T-5d).

**V-5 · `numberAttribute` "deliberately rejects the empty string" (line 287) and the `booleanAttribute`/`numberAttribute` introduction version.** The behavior is correct (Node 24.21, same logic: `na('')`, `na('  ')` and `na('12px')` are `NaN`; `na('Infinity')` is `Infinity`), but "deliberately" asserts intent. How to verify: the angular.dev API page for `numberAttribute` and the `@publicApi` tag in the typings (and the 16.1 changelog entry; I believe 16.1.0). Either cite or drop "deliberately", and add a status marker if it is `[Added in v16.1]`.

**V-6 · `Array.isArray` "cannot be spoofed" (line 838).** `node -e 'console.log(Array.isArray(new Proxy([], {})))'` prints `true` (Node 24.21): a Proxy of an array reports as an array by specification (a revoked proxy throws). Decide whether "cannot be faked by a plain object or `Symbol.toStringTag`" is the intended claim and word it so.

**V-7 · PostgreSQL `varchar(n)` counts characters, not bytes (line 180).** How to verify: PostgreSQL manual, "Character Types" ("n is the maximum number of characters"); and note that "characters" there means code points in a UTF-8 database.

**V-8 · Jackson 3.1.5: a plain DTO cannot tell a missing field from an explicit `null` (line 419).** How to verify: write the two-line `ObjectMapper` experiment outside the guide, or cite the Jackson 3 docs on `JsonNullable`/`JsonSetter` with `Nulls`; the claim is plausible but Java is not compiled in the labs.

**V-9 · Rationale statements.** Line 240 ("`Symbol` is … deliberately not a constructor, to stop people from creating wrapper objects") and line 109 ("any implicit choice would silently lose either precision … or the fraction"). How to verify: the ES2015 spec note on the Symbol constructor and the `tc39/proposal-bigint` README ("no implicit conversion"). If no source says "wrapper objects", reduce line 240 to the observable fact (`new Symbol()` throws `TypeError`; checked in Node 24.21).

**V-10 · `@for` over a `Map` or `Set` (line 793).** How to verify: angular.dev "Control flow" page ("`@for` … any iterable"), or a throwaway template in `labs/angular`; Module 18 owns the details.

---

## Proposed FIX tasks

Order: FIX-M01-04 first (small, no structure change), FIX-M01-08 and FIX-M01-07 (lab changes, independent of the prose edits except where noted), then FIX-M01-05 and FIX-M01-06 (both edit the module; run them one after the other, not in parallel, because they touch the same file).

### FIX-M01-04 · S · Correct the factual errors
- Findings: Factual errors 1, 2, 3, 4, 5, 6, 7, 9, 10; V-1 outcome (hedge).
- Files: `modules/01-js-values-types-coercion.md`.
- Do: rewrite the line-445 logger sentence (`util.format`, not `String()`); replace the line-1015 `<=` follow-up with the `NaN` counter-example (`NaN <= 1` and `NaN > 1` both `false`; IsLessThan `undefined` maps to `false`); give line 55 the `[[Set]]`-with-primitive-receiver mechanism that Q01.03 already states; fix the Java generics sentence at line 73; name the hybrid tolerance of `nearlyEqual` (or drop the `1`) and align line 106; reword the hint-table first row (line 273); reword line 320; change "before anything else" at line 346; in Q01.02 and Q01.17 either narrow "Verified" or point to the tests added by FIX-M01-08; hedge "a console shows `0`" at lines 310 and 439 until V-1 is checked (or state the browsers and versions checked).
- Acceptance: `grep -n 'joins arguments with' modules/01-js-values-types-coercion.md` and `grep -n 'wrapper is discarded\|no generics over objects only' modules/01-js-values-types-coercion.md` return nothing; `grep -n 'For the spec, yes' modules/01-js-values-types-coercion.md` returns nothing; run `node -e 'console.log(NaN <= 1, !(NaN > 1))'` (Node 24) prints `false true` and the new follow-up says so; `node labs/tools/check-snippets.mjs . 01` exits 0; `node labs/tools/check-links.mjs --planned` exits 0; no file other than the module changed (`git status` shows nothing new under `labs/`).

### FIX-M01-05 · S · Links, edition markers, terms, tags and sources
- Findings: T-4, T-6, T-7, T-8, T-9, T-10, T-15, T-16; V-2, V-3, V-5, V-7, V-8, V-9, V-10 outcomes (cite or soften each).
- Files: `modules/01-js-values-types-coercion.md`, `SOURCES.md` (Module 01 heading), `_meta/GLOSSARY-TERMS.md` (Module 01 section, three terms).
- Do: link Q01.01, 02, 10, 12, 17 from their sections and add owning-section links to the 15 answers listed in D6; apply one consistent edition marker at the first mention of BigInt, `**`, `includes`, `Intl.Segmenter`, `signDisplay: 'negative'`, `??`, `?.`; define realm, sloppy mode, ToObject, `[[Call]]`, interned, `[[Set]]` inline; add the two `core.mjs` API links and the `@angular/core` source row to SOURCES.md and a source or softened wording for each uncited claim in T-8; retag Q01.21 as `Bug hunt`; add the Module 08 sentence to Connections (or drop 08 from the header); check each `§` number against the current spec (V-2) and correct any that drifted.
- Acceptance: for NN in 01..22, `grep -c "](#q01-NN)" modules/01-js-values-types-coercion.md` is at least 1; `grep -n 'Q01.21 · Difference' modules/01-js-values-types-coercion.md` returns nothing; `grep -n '@angular/core' SOURCES.md` shows a Module 01 row; every external URL in `grep -o 'https://[^ )>]*'` is in SOURCES.md under Module 01; the three glossary terms exist; D3 still holds (Output 13 of 22, at most 60%); `node labs/tools/check-snippets.mjs . 01` exits 0; `node labs/tools/check-links.mjs --planned` exits 0.

### FIX-M01-06 · M · Diagrams, concrete openings, misconception history and short answers
- Findings: T-1, T-2, T-3, T-5, T-11, T-12, T-17; V-4 and V-6 outcomes.
- Files: `modules/01-js-values-types-coercion.md`.
- Do: add the IsLooselyEqual flowchart (section 6) and the string-levels diagram (section 3), each followed by a "What to notice:" sentence (optionally the ToPrimitive-order diagram in section 5); rewrite the problem openings of sections 1 and 4 around a concrete failure and run any new snippet in Node 24; add a "the myth comes from" clause to every trap listed in T-5 and add the history items (a) to (d) with an edition or cited source; add the optional *Framework vs platform* NOTE for `booleanAttribute`/`numberAttribute` in section 5; shorten the Q01.12 and Q01.14 short answers to 30-second decision rules; add numbered approach steps to the exercise worked solutions and one approach sentence before the Q01.09 `parse` excerpt and the Q01.14 `isUser` code; record the section-7 placement decision (T-12).
- Acceptance: `grep -c '```mermaid' modules/01-js-values-types-coercion.md` is at least 3 and `grep -c 'What to notice' modules/01-js-values-types-coercion.md` equals it; every trap bullet in sections 1-7 has a clause starting "The myth" or equivalent (reviewer reads all 21); at least two bullets carry an edition or version in the "once true" form; Q01.12 and Q01.14 short answers are at most 75 words (script: split the paragraph after `**Short answer (30 seconds).**`); any new JavaScript fact is backed by a test (see FIX-M01-07) or a `node -e` result quoted in the sentence; `node labs/tools/check-snippets.mjs . 01` exits 0; `node labs/tools/check-links.mjs --planned` exits 0.

### FIX-M01-07 · M · Fill the number and comparison depth gaps with tests
- Findings: T-13.
- Files: `labs/ts-js/src/outputs/01-js-values-types-coercion/sections.test.ts` (new, names starting `Section 2:` and `Section 5:`/`Section 6:`), `modules/01-js-values-types-coercion.md` (sections 2, 5, 6 prose; no new question unless SYLLABUS §1 is raised and the reason recorded).
- Do: add short prose and tests for `Infinity`/overflow/`isFinite` versus `Number.isFinite`, string relational comparison and default `sort()` (`'10' < '9'`, `[10, 9, 1].sort()`, the `Intl.Collator` fix with a link to Module 34), the failed-ToPrimitive `TypeError`, and `Number(1n)` versus `+1n`; assert exact printed lines with `captureLogs` and `runSnippet`; each prose claim carries "Verified: `Section N: …` in `sections.test.ts`".
- Acceptance: `cd labs/ts-js && npx vitest run src/modules/01-js-values-types-coercion src/outputs/01-js-values-types-coercion` passes (49 existing tests plus the new ones); `grep -n "it('Section" labs/ts-js/src/outputs/01-js-values-types-coercion/sections.test.ts` lists one test per new prose claim; `node labs/tools/check-snippets.mjs . 01` exits 0; `node labs/tools/check-links.mjs --planned` exits 0; D3 and D8 unchanged (22 questions).

### FIX-M01-08 · M · Make the exercise tests match the criteria
- Findings: Factual errors 8 and 10 (tests part); T-14.
- Files: `labs/ts-js/src/modules/01-js-values-types-coercion/money.test.ts`, `unicode-text.test.ts` and `loose-equals.test.ts` (titles only), `labs/ts-js/src/outputs/01-js-values-types-coercion/types.test.ts` and `coercion.test.ts` (TDZ and the missing falsy values, if the claims are kept), `modules/01-js-values-types-coercion.md` (the three "How each criterion is met" paragraphs and the `Verified:` wording at Q01.02 and Q01.17).
- Do: add `==` assertions to the Money test (`price == 12.34` throws `TypeError`; `price == price` does not), a second-locale `format` assertion (confirm the expected string with `node -e` under Node 24 first), and, if kept, the TDZ case in `types.test.ts` and `false`/`0`/`null`/`undefined` in the Q01.17 evidence test; retitle tests to start with the criterion's wording; replace "of the same name" in the module with the real titles.
- Acceptance: `cd labs/ts-js && npx vitest run src/modules/01-js-values-types-coercion src/outputs/01-js-values-types-coercion` passes; mutation check: change `Symbol.toPrimitive` in `money.ts` to return a number for the `'default'` hint and confirm the new `==` assertion fails, then revert; `cd labs/ts-js && npm run typecheck` passes; `grep -n 'of the same name' modules/01-js-values-types-coercion.md` returns nothing; `node labs/tools/check-snippets.mjs . 01` exits 0 (the Excerpts of `money.ts` stay verbatim); `node labs/tools/check-links.mjs --planned` exits 0.
