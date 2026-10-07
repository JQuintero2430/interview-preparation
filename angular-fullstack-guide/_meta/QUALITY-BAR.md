# QUALITY-BAR

The measurable form of RUN.md §1: match or exceed the React guide (`../react-full-stack-interview-guide/`, pilot `09-effects.md`) and the Angular pilot (`../modules/17-signals.md`). Every writing task meets the items that apply to what it writes; `CLOSE` checks the whole list for the module; `REVIEW` re-checks it independently and records one pass/fail line per item.

Each item says **how to check** it. `grep`/script checks are run, not eyeballed. "Prose words" means words outside fenced code blocks, counted over the whole module file (the measure used for the 8–10k cap in RUN.md §9).

Written by B3 (session S20261005-1810-claudecode) after studying both references. The comparison that produced it is at the end.

---

## A. Module frame

- [ ] **A1 Header.** Fields in STYLE-GUIDE §4.1 order: What this covers, Prerequisites, Leads to, Applies to, Study time, Short on time, Labs (with the run command). *Check:* read the first 12 lines.
- [ ] **A2 Prerequisites deep-link.** Each prerequisite that exists as a written module links to the specific section the reader needs, not only to the file. *Check:* every Prerequisites link to an existing module has a `#` anchor, unless the whole module is the prerequisite (say so).
- [ ] **A3 Short on time.** Names 2–4 section links and 3–6 question IDs that cover the most-asked material, ending with the Summary link. *Check:* read it; every link resolves (link check).
- [ ] **A4 Contents.** Links every concept section and the five closing sections (Summary, Question bank, Hands-on exercises, Check your understanding, Connections). *Check:* link check plus a count against the `## ` headings.
- [ ] **A5 Order of concepts.** Sections run from the basic idea to the internals; the last section is the deepest ("under the hood", algorithms, compiler output). *Check:* read the Contents; the reviewer names any section that needs a later one to make sense.

## B. Concept sections (each `## N.` section)

- [ ] **B1 Subsections.** The STYLE-GUIDE §4.2 subsections, in order; any skipped one is skipped because it truly does not apply. *Check:* `grep -c` each of `### The problem it solves`, `### Mental model`, `### How it actually works`, `### Code`, `### Best practices and anti-patterns`, `### Misconceptions and traps` equals the number of concept sections (or the reviewer accepts each gap).
- [ ] **B2 Concrete problem.** "The problem it solves" shows a concrete failure (a bug, a cost, a cliff), not a definition. *Check:* reviewer reads every one.
- [ ] **B3 Mental model with an analogy**, and a Mermaid diagram wherever the mechanism is a flow, timeline, hierarchy or state machine (event loop phases, CD tree walks, DI resolution, router navigation, request pipelines…). *Check:* the reviewer lists the sections whose mechanism is one of those shapes; each has a diagram, followed by a "what to notice" sentence. The pilot has 5 diagrams in 9 sections.
- [ ] **B4 Mechanism depth.** "How it actually works" reaches what a demanding interviewer probes: the data structure, the algorithm or scheduling, what the compiler or engine emits, the spec algorithm by name. *Check:* each section answers at least one "why does it behave like that?" question that the Code section alone would not.
- [ ] **B5 Approach before code.** Every non-trivial snippet is preceded by the approach (1–2 sentences) and numbered steps. *Check:* reviewer scans every `### Code`.
- [ ] **B6 Reasons on every practice.** Every best-practice/anti-pattern item has "because …" (or an equivalent reason clause). *Check:* reviewer reads every item.
- [ ] **B7 Misconceptions with history.** Each trap gives the correction and why the myth exists; a claim that *was* true says until which version and what changed (STYLE-GUIDE §4.2.7). *Check:* reviewer reads every item; version claims carry a marker or citation.
- [ ] **B8 Callouts.** *Framework vs platform* wherever STYLE-GUIDE §6 lists the topic; *Coming from the backend* wherever the module's SYLLABUS §4 checklist names a comparison, each with "Where the analogy breaks". *Check:* `grep` the callouts; cross-check against the checklist.
- [ ] **B9 Terms defined on first use** in this module, inline, with a link to the owning module. *Check:* reviewer flags any undefined jargon; HOUSE harvest lists the terms in `_meta/GLOSSARY-TERMS.md`.
- [ ] **B10 Cross-links over repetition.** A concept another module owns gets one sentence plus a link; no duplicated explanation. *Check:* reviewer.

## C. Accuracy and verification

- [ ] **C1 Every claim has a basis**, recorded the STYLE-GUIDE §3.6 way: lab test (named), package source/typings (package@version, file), or official doc (link). *Check:* reviewer samples at least 20 factual claims across the module and finds the basis of each; any claim without one is a FIX.
- [ ] **C2 Output answers are run.** Every question tagged `Output` has a test named after its ID that asserts exactly the printed lines in the answer. *Check:* `grep -o 'Q<NN>\.[0-9a-z]*' labs/**/outputs/NN-*` covers every Output ID; spot-diff 5 answers against their assertions (all of them in VERIFY-OUT tasks).
- [ ] **C3 Lab claims are tested.** Every "in the lab, X happened" sentence has a test named after its section. *Check:* `grep -n 'lab\|Verified' modules/NN-*.md` and find each test.
- [ ] **C4 Status markers** at first mention for every non-stable or recently changed API, using exactly the STYLE-GUIDE §3.2 forms; for JavaScript features after ES2015, the ECMAScript edition at first mention. *Check:* `grep -E '\[(Stable since|Added in|Changed in|Deprecated since|Removed in|Experimental since|Developer preview since)'`; reviewer checks APIs without one.
- [ ] **C5 Versions exist.** No API, option, flag or diagnostic code absent from the versions in VERSIONS.md. *Check:* every Angular API in a snippet compiles in labs or is found in the 22.2.1 typings.
- [ ] **C6 No unrecorded uncertainty.** Every `> **Unverified:**` in the module has an open row in `_meta/UNVERIFIED.md` and a VERIFY task. *Check:* `grep -c 'Unverified'` equals the module's open rows.
- [ ] **C7 Snippet kinds.** Every fenced TS/JS snippet is Complete (with `<sub>Source:`), Excerpt (`// Excerpt of …`), Partial (`// Partial: …`) or Output (unmarked, under an `Output` question, checked against its test), Java snippets carry the Spring banner, and Excerpts are verbatim. *Check:* `node labs/tools/check-snippets.mjs . NN` exits 0.
- [ ] **C8 Sources recorded.** Every external URL and package source cited in the module appears in SOURCES.md under the module's heading. *Check:* compare `grep -o 'https://[^ )]*'` against SOURCES.md.

## D. Question bank

- [ ] **D1 Answer anatomy.** Every answer has Short answer (30 seconds) → Full explanation → Code (optional) → Follow-ups an interviewer will ask (≥ 2, each answered) → Trap to avoid, in that order. *Check:* the counts of `**Short answer`, `**Full explanation`, `**Follow-ups`, `**Trap to avoid` each equal the question count.
- [ ] **D2 Output short answers** give the printed lines **and** 1–2 sentences of reasoning. *Check:* reviewer reads every Output answer.
- [ ] **D3 Type mix.** At least 4 distinct type tags; at least one `Trade-off`; at least one `Design` or `Bug hunt`; no tag on more than 60% of the questions (a two-tag question counts for both). *Check:* the one-liner in "Measuring" below.
- [ ] **D4 Progression.** Questions run from the basic idea to the internals, and roughly follow the section order. *Check:* reviewer reads the titles in order.
- [ ] **D5 No duplicates** within the module or across modules (STYLE-GUIDE §5.2 tie-break). *Check:* reviewer greps `### Q` headings across `modules/` for the same topic.
- [ ] **D6 Linked from the body.** Each concept section links the questions that drill it (`[Q17.13](#q17-13)`), and each answer links back to its section when it relies on it. *Check:* every question ID appears at least once outside its own heading (count of `](#qNN-` ≥ question count).
- [ ] **D7 Anchors.** `<a id="qNN-mm"></a>` right above each question heading; IDs unique guide-wide and never renumbered. *Check:* link check plus `grep`.
- [ ] **D8 Counts.** Within the SYLLABUS §1 ceiling; at or above the STYLE-GUIDE §12 floor, or the reason for stopping is recorded in PROGRESS.md. *Check:* `grep -c '^### Q[0-9]'`.

## E. Exercises

- [ ] **E1 Anatomy.** Problem → Constraints → Acceptance criteria (checklist) → 1–2 hints → Worked solution (approach → code → criterion-by-criterion account) → Alternative approach + Trade-offs → Interviewer follow-ups (2–4, answered) → Tests link. *Check:* per exercise, `grep` the bold labels.
- [ ] **E2 Criteria ↔ tests.** Every criterion is covered by at least one named test, and every test belongs to a criterion; the account in the solution names the tests. *Check:* reviewer maps criteria to `it(...)` names in the spec.
- [ ] **E3 Progression.** Exercises go from simple to hard; the last one integrates several sections. *Check:* reviewer.
- [ ] **E4 Real code.** Each solution lives in labs, compiles and passes; modern style per STYLE-GUIDE §7.1 (≤ 4 injected dependencies per class, low branching, no `any`). *Check:* module test command; reviewer reads each solution.
- [ ] **E5 At least one predict-the-behavior task** in the module (an `Output` question or an exercise whose tests assert exact output or order) for every Angular module and every JavaScript module. *Check:* D3 count of `Output` ≥ 1.

## F. Closing sections

- [ ] **F1 Summary.** One to three paragraphs; restates each concept section's core claim and its most-asked trap, with section links; no fact not taught above. *Check:* reviewer reads it against the sections.
- [ ] **F2 Explain it back.** 3–6 prompts naming a specific listener ("to a backend developer who …"). *Check:* count.
- [ ] **F3 Flashcards.** 5–10 `<details>` items, one- or two-line answers. *Check:* count.
- [ ] **F4 Connections.** Builds on / Read next / Uses these ideas later / Comparisons (where relevant), each a link with a reason. *Check:* reviewer.

## G. Size

- [ ] **G1 Prose budget.** Parts A, B, C, E: 8,000–10,000 prose words. Part D: the pilot's depth (the pilot is ~19,900 prose words for 9 sections and 40 questions; scale by section and question count, no filler). Parts F, G: as the topic needs. Over the cap is acceptable only when the reviewer finds no redundancy to cut; under it is acceptable only when the checklist is fully covered. *Check:* the prose count in "Measuring".
- [ ] **G2 Breadth.** Every SYLLABUS §4 checkbox of the module is covered by a section or a question (the module plan's mapping). *Check:* reviewer walks the checklist.

## H. Repository state

- [ ] **H1 Labs green.** The module's tests, typecheck (and `ng build` for Angular code) pass. *Check:* the commands in TASKS.md "Standard checks".
- [ ] **H2 Links.** Links gate passes (TASKS.md). *Check:* `node labs/tools/check-links.mjs` (with `--planned` once HOUSE-01 lands).
- [ ] **H3 No stray files.** Nothing new outside `.gitignore` except the declared files. *Check:* `git status --short`.

---

## Measuring (copy-paste, from the guide root)

```bash
f=modules/NN-slug.md
# D1 anatomy counts (all must equal the question count)
for p in '^### Q[0-9]' '^\*\*Short answer' '^\*\*Full explanation' '^\*\*Follow-ups' '^\*\*Trap to avoid'; do printf '%s %s\n' "$(grep -c "$p" $f)" "$p"; done
# D3 type mix
grep '^### Q[0-9]' $f | sed -E 's/^### Q[0-9.a-z]+ · //; s/ · [^·]*$//' | tr '·' '\n' | sed 's/^ *//;s/ *$//' | sort | uniq -c
# G1 prose words (outside fenced code)
python3 -c "import re,sys;print(len(re.sub(r'\`\`\`[\s\S]*?\`\`\`','',open(sys.argv[1]).read()).split()))" $f
```

---

## Baseline (measured 2026-10-05, B3)

| Module | Q | Ex | Output share | Trade-off | Diagrams | Prose words | Summary | Exercise follow-ups | Short on time |
|---|---|---|---|---|---|---|---|---|---|
| 01 | 22 | 3 | 18/22 (82%) ✗ | 0 ✗ | 1 | 11,746 | ✗ | ✗ | ✗ |
| 02 | 19 | 3 | 10/19 (53%) | 1 | 2 | 10,948 | ✗ | ✗ | ✗ |
| 03 | 20 | 3 | 15/20 (75%) ✗ | 2 | 1 | 12,795 | ✗ | ✗ | ✗ |
| 04 | 28 | 4 | 15/28 (54%) | 1 | 1 | 13,227 | ✗ | ✗ | ✗ |
| 17 | 40 | 6 | 16/40 (40%) | 1 | 5 | 19,917 | ✗ | ✗ | ✗ |

All five already meet D1 (every answer has the four mandatory parts) and F2/F3. FIX tasks for the ✗ cells are in TASKS.md (FIX-M01-01 … FIX-M17-01, FIX-M01-02, FIX-M03-02). Items that need judgment (B3 diagrams, B4 depth, C1 claim sampling, G1 redundancy) are left to each module's REVIEW.

## How this bar was derived (B3 comparison)

**Where the React guide is stronger, and what changed here** (each gap is now a STYLE-GUIDE rule and a bar item):

| Gap | React guide | Before | Now |
|---|---|---|---|
| Re-read summary | Every module ends with "Summary (re-read before the interview)" | No summary | STYLE-GUIDE §4.3 `## Summary`; F1 |
| Time-boxed path | "How to use this module" says what to read with 20 minutes | Only "Study time" | Header "Short on time"; A3 |
| Section-level prerequisites | Prerequisites link to the exact section | Module-level links | STYLE-GUIDE §4.1 note; A2 |
| Runnable from the header | Header gives the test command for the module folder | Folder link only | Header "Labs … Run:"; A1 |
| Exercise follow-ups | Each exercise ends with "Interviewer follow-ups" | None | STYLE-GUIDE §8; E1 |
| Inline code checked mechanically | `// file:` blocks are synced and diffed by a script | Excerpts verbatim by convention only | STYLE-GUIDE §7.2 note; C7; HOUSE-09 builds `check-snippets.mjs` |
| Outdated-advice history | Misconceptions table: once true? / true now / since | Misconceptions without version history | STYLE-GUIDE §4.2.7; B7 |

**Where this guide is already stronger, and stays so:** typed questions with an explicit mix (D3), a five-part answer with mandatory follow-ups and traps (D1) instead of one "strong answer adds" line, acceptance criteria mapped to named tests (E2), every Output answer asserted by a test named after the question (C2), status markers at first mention (C4), and explicit snippet kinds (C7).

**Deliberately not adopted:** origin tags on every concept (`[JS]`, `[React]`): the *Framework vs platform* callout covers the commonly blurred cases without tagging every sentence. A separate "Gotchas" list: traps live in each section's "Misconceptions and traps" and each answer's "Trap to avoid", and the Summary restates the most-asked ones. A rapid-fire bank per module: the finish line's `CHEATSHEET.md` and `QUESTION-INDEX.md` serve that purpose guide-wide.
