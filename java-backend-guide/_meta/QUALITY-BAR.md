# QUALITY-BAR

The measurable form of RUN.md §1. Every writing task meets the items that apply to what it writes; `CLOSE-Mxx` checks the whole list for the module; `REVIEW-Mxx` re-checks it independently (RUN.md §4) and records one pass/fail line per item. A failed item becomes a FIX task.

Each item says **how to check** it. Command checks are run, not eyeballed. Paths are relative to the guide root. "Prose words" means words outside fenced code blocks over the whole module file, as `labs/tools/module-stats.mjs` counts them. `NN`, `<slug>`, `<labfolder>` and `<pkg>` follow STYLE-GUIDE §7.2. Every check below assumes the module has no TASK markers left (A6).

Written by planning step P4 (session S20261025-0027-claudecode), adapted from the Angular guide's QUALITY-BAR with backend-specific items (B10–B14, C9–C12, D9, H4–H5).

---

## A. Module frame

- [ ] **A1 Header.** Fields in STYLE-GUIDE §2.1 order: What this covers, Prerequisites, Leads to, Applies to, Study time, Short on time, Labs (with the per-module run command and "Needs Docker"), or the no-lab line for modules 53–55. *Check:* read the first 12 lines; `Applies to` versions equal VERSIONS.md.
- [ ] **A2 Prerequisites deep-link.** Each prerequisite that exists as a written module links the section the reader needs. *Check:* every Prerequisites link to an existing module has a `#` anchor, unless the whole module is the prerequisite (said so).
- [ ] **A3 Short on time.** 2–4 section links and 3–6 question IDs covering the most-asked material, ending with the Summary link. *Check:* read it; link check resolves every link.
- [ ] **A4 Contents.** Links every concept section and the five closing sections. *Check:* link check, plus the count of Contents links equals `grep -c '^## ' modules/NN-<slug>.md` minus 1.
- [ ] **A5 Order of concepts.** Basic idea → internals → trade-offs; the last section is the deepest. *Check:* read the Contents; the reviewer names any section that needs a later one to make sense.
- [ ] **A6 No open regions.** *Check:* `grep -c 'TASK:' modules/NN-<slug>.md` prints 0.

## B. Concept sections (each `## N.` section)

- [ ] **B1 Subsections.** The STYLE-GUIDE §2.2 subsections, in order. *Check:* `grep -c` of each of `### The problem it solves`, `### Mental model`, `### How it actually works`, `### Code`, `### Failure modes and operations`, `### Best practices and anti-patterns`, `### Misconceptions and traps` equals the number of concept sections, or the reviewer accepts each gap by name.
- [ ] **B2 Concrete problem.** Each "The problem it solves" shows a concrete failure (a bug, an outage, a cost, a cliff), not a definition. *Check:* reviewer reads every one.
- [ ] **B3 Mental model and diagrams.** An analogy in each section, and a Mermaid diagram wherever the mechanism is a flow, timeline, hierarchy or state machine (proxy chains, transaction boundaries, filter chains, rebalances, GC phases, thread states, trace propagation), each followed by a "what to notice" sentence. *Check:* the reviewer lists the sections of those shapes; `` grep -c '^```mermaid' `` is at least that count.
- [ ] **B4 Mechanism depth.** "How it actually works" answers at least one "why does it behave like that?" that the Code alone would not: the data structure, the algorithm, the JLS/JVMS section, what the framework builds at startup or does per call. *Check:* reviewer names that question for each section.
- [ ] **B5 Approach before code.** Every non-trivial snippet (prose, answers, exercises) is preceded by the approach and numbered steps. *Check:* reviewer scans every `### Code` and every Worked solution.
- [ ] **B6 Reasons on every practice.** Every best-practice/anti-pattern item has a "because" clause. *Check:* reviewer reads every item.
- [ ] **B7 Misconceptions with history.** Each trap gives the correction and why the myth exists; a once-true claim says until which version and what changed, with a status marker or basis tag. *Check:* reviewer reads every item.
- [ ] **B8 Framework vs language.** Present wherever STYLE-GUIDE §6 lists the topic or the module's SYLLABUS §4 checklist touches one of them; each separates the JVM/language guarantee, the specification (JPA, Servlet, Bean Validation) and the framework layer. *Check:* `grep -c '\*\*Framework vs language\.\*\*'` ≥ the number of listed topics the module covers (the reviewer names them).
- [ ] **B9 Version notes.** Present wherever behavior, a default, an API or a namespace changed across Java 8 → 25 or Spring Boot 2 → 3 → 4; each entry has a marker or basis tag; Java 27 appears only here. *Check:* `grep -c '\*\*Version notes\.\*\*'`; the reviewer lists the module's changed behaviors (from the Misconceptions and the checklist) and finds a note for each.
- [ ] **B10 Production scenario callouts.** In every section whose topic has a known production failure class; a core module has at least 2. Each gives the framing as the interviewer says it, then the reasoning (diagnosis evidence, fix, prevention). *Check:* `grep -c '\*\*Production scenario:'` ≥ 2 for core; reviewer reads each.
- [ ] **B11 Failure modes and load.** Each "Failure modes and operations" says how the mechanism fails and how it behaves under load (saturation, queueing, timeouts, retries, memory, contention), and what bounds it. *Check:* reviewer reads each; a section without load behavior must be one where load is irrelevant (reviewer names why).
- [ ] **B12 Operational concerns.** Configuration (the property or flag, its default with a basis tag), observability (the metric, log, trace or dump that reveals the failure), and deployment (rollout, migration, restart behavior) are covered wherever they apply. *Check:* reviewer ticks configuration / observability / deployment per section, or writes "n/a" with the reason.
- [ ] **B13 Security per topic.** Each section with a security dimension has at least one `**Security:**` best-practice item or a question on it. *Check:* `grep -c '\*\*Security:\*\*'`; the reviewer lists sections with a security dimension and finds each covered.
- [ ] **B14 Terms defined on first use** in this module, inline, with a link to the owning module. *Check:* reviewer flags any undefined term (JMM, MVCC, ISR, idempotency key…).
- [ ] **B15 Cross-links over repetition.** A concept another module owns, or a SYLLABUS delegated topic, gets one sentence plus a link, not a re-explanation. *Check:* reviewer walks the module's delegated list in SYLLABUS §4 and finds a link for each one mentioned.

## C. Accuracy and verification

- [ ] **C1 Every claim has a basis**: a `[Lab: …]`, `[Src: …]` or `[Doc: …]` tag (STYLE-GUIDE §4.1) or a Complete/Excerpt snippet with its test. *Check:* `grep -oE '\[(Lab|Src|Doc|Unverified): ' modules/NN-<slug>.md | sort | uniq -c`; reviewer samples at least 20 factual claims across the module and finds the basis of each; a claim with none is a FIX.
- [ ] **C2 Output answers are run.** Every `Output` question has a test whose `@DisplayName` starts with its ID and asserts exactly what the Short answer states. *Check:* every ID from `grep '^### Q' modules/NN-<slug>.md | grep ' · Output · '` appears in `grep -rn 'Q<NN>\.' labs/<labfolder>/src/test/java/dev/interview/<pkg>/mNN/`; the reviewer diffs at least 5 answers against their assertions.
- [ ] **C3 Lab claims are tested.** Every "in the lab, …" sentence names a test that exists. *Check:* `grep -n 'in the lab' modules/NN-<slug>.md`, then find each test.
- [ ] **C4 Status markers** at first mention for every non-stable or changed API, only in the STYLE-GUIDE §4.2 forms. *Check:* `grep -oE '\[(Preview in|Incubator in|Experimental in|Deprecated since|Deprecated for removal since|Removed in|Final since|Changed in|Added in|RC only|OTel|OTel artifact|Jenkins plugin deprecated|Requires Jenkins core)[^]]*\]' modules/NN-<slug>.md`; reviewer checks the preview, incubator and deprecated APIs the module uses each carry one, consistent with VERSIONS.md "Feature status notes".
- [ ] **C5 Versions exist.** No API, property, flag or default absent from the VERSIONS.md versions. *Check:* every API in a lab snippet compiles (H1); every API in a Partial carries a Doc or Src tag for the VERSIONS.md version.
- [ ] **C6 No unrecorded uncertainty.** Every `[Unverified: <row ID>]` has an open row in `_meta/UNVERIFIED.md` and a VERIFY task; at CLOSE only `needs: docker`/`needs: vision` rows the harness cannot satisfy may remain. *Check:* the IDs from `grep -o '\[Unverified: [^]]*\]'` all appear in `_meta/UNVERIFIED.md` and `_meta/TASKS.md`.
- [ ] **C7 Snippet kinds.** Every fenced `java`, `xml`, `yaml`, `properties`, `sql`, `groovy` or `dockerfile` block is Complete (with `<sub>Source:`), Excerpt (`Excerpt of labs/…` first line), Partial (`Partial:` first line, only for config fragments, signatures or pseudo-structure) or Output (unmarked, under an `Output` question). *Check:* no snippet checker exists yet, so the reviewer checks 100% of them: each Complete equals its file (`diff` against the file), each Excerpt's lines are found in order in its file (`grep -F` per line), each Partial's content is one of the allowed kinds and makes no behavioral claim.
- [ ] **C8 Sources recorded.** Every external URL in the module appears in `SOURCES.md` under the module's heading. *Check:* compare `grep -oE 'https://[^ )>]*' modules/NN-<slug>.md | sort -u` against `SOURCES.md`.
- [ ] **C9 Ledger rows answered.** Every row in `_meta/sources/*.md` whose target is this module is answered by a section or a question, or carries a recorded reason for living elsewhere (module plan) or is `duplicate-of`. *Check:* list the module's row IDs from the ledgers' target column (`grep -h '<module slug or Mxx>' _meta/sources/*.md`); each ID appears in a `<!-- ledger: … -->` line of the module or in `_meta/modules/Mxx.md` with its home; the reviewer reads 5 rows and confirms the answer actually answers the normalized question.
- [ ] **C10 Nondeterminism asserted as invariants.** Tests of races, visibility, scheduling, virtual-thread interleavings, timing and concurrent transactions assert an invariant or a permitted set, never one interleaving, and never assert that a race happens (STYLE-GUIDE §7.5). *Check:* `grep -rn 'Thread.sleep' labs/<labfolder>/src/test/java/dev/interview/<pkg>/mNN/` is empty or each hit is the behavior under test, not synchronization; the reviewer reads every concurrency test and names its invariant or set.
- [ ] **C11 Trade-off numbers verified.** Every number in a trade-off table or a "Failure modes" claim (latency, throughput, defaults, limits) carries a basis tag in its row or paragraph; no benchmark measured on one machine is stated as a general fact. *Check:* reviewer reads every table with a digit in a cell (`grep -n '^|.*[0-9]' modules/NN-<slug>.md`).
- [ ] **C12 JMM claims.** Claims about what a racy program may do cite JLS §17 and are not asserted by tests; guarantees of correctly synchronized code are asserted as invariants. *Check:* reviewer reads every JMM claim (modules 11–14 mainly).

## D. Question bank

- [ ] **D1 Answer anatomy.** Short answer (30 seconds) → Full explanation → Code (optional) → Follow-ups (≥ 2, answered) → Trap to avoid, in that order. *Check:* the counts in "Measuring" all equal the question count.
- [ ] **D2 Output short answers** give the exact output, or the permitted set for nondeterministic code, **and** 1–2 sentences of reasoning. *Check:* reviewer reads every Output answer.
- [ ] **D3 Type mix.** At least 4 distinct tags; at least one `Trade-off`; at least one `Design` or `Bug hunt`; at least 3 `Production scenario` in a core module and 1 in a supporting module (STYLE-GUIDE §12); no tag on more than 60% of questions (module 54 is exempt for `Production scenario`); modules with a lab have at least one `Output`. *Check:* `node labs/tools/module-stats.mjs` mix column, or the one-liner in "Measuring".
- [ ] **D4 Progression.** Basic idea → internals → trade-offs, roughly following the section order. *Check:* reviewer reads the titles in order.
- [ ] **D5 No duplicates** within the module or across modules (STYLE-GUIDE §5.2 tie-break). *Check:* `grep -h '^### Q' modules/*.md` for the module's key terms; reviewer confirms each overlap is a link, not a copy.
- [ ] **D6 Linked from the body.** Each section links the questions that drill it; each question ID appears at least once outside its heading. *Check:* count of `](#qNN-` ≥ question count.
- [ ] **D7 Anchors and heading format.** `<a id="qNN-mm"></a>` directly above each `### QNN.mm · <Type> · … · <Title>` heading; tags spelled exactly. *Check:* `grep -B1 '^### Q' modules/NN-<slug>.md` shows an anchor before each; `node labs/tools/check-links.mjs --planned` passes.
- [ ] **D8 Counts.** Within the SYLLABUS §1 ceiling, at or above the STYLE-GUIDE §12 floor, or the reason recorded in `PROGRESS.md`. *Check:* `node labs/tools/module-stats.mjs` row for the module shows no floor or ceiling flag.
- [ ] **D9 Production scenario answers** follow symptoms → ranked hypotheses → confirming evidence → fix → prevention and monitoring, and name the concrete evidence (a metric, a log line, a thread or heap dump, `EXPLAIN`, a trace). *Check:* reviewer reads every `Production scenario` answer.

## E. Exercises

- [ ] **E1 Anatomy.** Problem → Constraints → Acceptance criteria (checklist) or Rubric (53–55) → 1–2 hints → Worked solution (approach → code or model answer → criterion-by-criterion account) → Alternative approach + Trade-offs → Interviewer follow-ups (2–4, answered) → Tests link (or "the rubric above"). *Check:* per exercise, `grep` the bold labels; `grep -c '^### Exercise '` equals the planned count.
- [ ] **E2 Criteria ↔ tests.** Every criterion has at least one test whose `@DisplayName` starts with `ExNN.n`, and every such test belongs to a criterion. For 53–55, every rubric criterion is mapped to a paragraph of the model answer. *Check:* reviewer maps criteria to test names (`grep -rn 'Ex<NN>\.' labs/<labfolder>/src/test/java/dev/interview/<pkg>/mNN/`).
- [ ] **E3 Progression.** Simple to hard; the last integrates several sections. *Check:* reviewer.
- [ ] **E4 Real code.** Each solution lives in `…mNN.exN`, compiles, passes, and follows STYLE-GUIDE §7.1: low cyclomatic complexity, ≤ 4 injected dependencies per class, patterns over long classes, constructor injection, MapStruct `INSTANCE` pattern. *Check:* H1; `grep -rn '@Autowired' labs/<labfolder>/src/main/java/dev/interview/<pkg>/mNN/` is empty outside Legacy examples; reviewer reads every constructor's parameter count and every method over 20 lines.
- [ ] **E5 Rubric quality (53–55).** Rubric criteria are observable, and every factual claim in the model answer links where it was verified. *Check:* reviewer reads each criterion and asks "could two readers disagree on whether this is met?".

## F. Closing sections

- [ ] **F1 Summary.** One to three paragraphs; each section's core claim and most-asked trap, with section links; nothing not taught above. *Check:* reviewer reads it against the sections.
- [ ] **F2 Explain it back.** 3–6 prompts naming a listener. *Check:* count.
- [ ] **F3 Flashcards.** 5–10 `<details>` items. *Check:* count.
- [ ] **F4 Connections.** Builds on / Read next / Uses these ideas later / Comparisons, each a link with a reason. *Check:* reviewer; link check.

## G. Size and breadth

- [ ] **G1 Prose budget.** Within the module's SYLLABUS §1 prose cap, or an approved exception in SYLLABUS "Resolved decisions". Under the cap is fine only when G2 holds. *Check:* `node labs/tools/module-stats.mjs` shows no prose flag; reviewer finds no redundancy to cut.
- [ ] **G2 Breadth.** Every SYLLABUS §4 checkbox of the module is covered by a section or a question, as mapped in `_meta/modules/Mxx.md`. *Check:* reviewer walks the checklist against the plan's mapping and the module.

## H. Repository state

- [ ] **H1 Labs green.** The module's lab builds and its tests pass with the Standard checks block of `_meta/TASKS.md` (scoped to `<labfolder>`), run serially, exit code 0. *Check:* run the commands; record command → result in LOG.
- [ ] **H2 Formatting.** `spotless` leaves the touched lab modules unchanged after the build, per the Standard checks block. *Check:* run it; `git status --short -- labs/` shows no file changed by the formatter after the last build.
- [ ] **H3 Links.** *Check:* `node labs/tools/check-links.mjs --planned` exits 0.
- [ ] **H4 Stats.** *Check:* `node labs/tools/module-stats.mjs` row for the module shows no flag (or each flag has its PROGRESS.md reason).
- [ ] **H5 Docker honesty.** Every test that needs Docker carries `@Tag("docker")`; if it did not run in this harness, its claims are in `_meta/UNVERIFIED.md` with `needs: docker`, never marked verified. *Check:* `grep -rln 'Testcontainers\|@Container' labs/<labfolder>/src/test/java/dev/interview/<pkg>/mNN/` ⊆ `grep -rl '@Tag("docker")'` over the same path; LOG says whether Docker ran.
- [ ] **H6 No stray files.** Nothing new outside `.gitignore` except the task's declared files. *Check:* `git status --short -- .` against the task's file list.

---

## Measuring (copy-paste, from the guide root)

```bash
f=modules/NN-slug.md
# A6 open regions (must print 0)
grep -c 'TASK:' $f
# D1 anatomy counts (all must equal the question count)
for p in '^### Q[0-9]' '^\*\*Short answer' '^\*\*Full explanation' '^\*\*Follow-ups' '^\*\*Trap to avoid'; do printf '%s %s\n' "$(grep -c "$p" $f)" "$p"; done
# D3 type mix (title is the last segment)
grep '^### Q[0-9]' $f | sed -E 's/^### Q[0-9.a-z]+ · //; s/ · [^·]*$//' | tr '·' '\n' | sed 's/^ *//;s/ *$//' | sort | uniq -c
# B8-B10, B13 callouts and security items
for p in '\*\*Framework vs language\.\*\*' '\*\*Version notes\.\*\*' '\*\*Production scenario:' '\*\*Security:\*\*'; do printf '%s %s\n' "$(grep -c "$p" $f)" "$p"; done
# C1 basis tags
grep -oE '\[(Lab|Src|Doc|Unverified): ' $f | sort | uniq -c
# G1, D8 counts, mix and prose
node labs/tools/module-stats.mjs
# H3 links
node labs/tools/check-links.mjs --planned
```

The Maven commands (H1, H2) are the Standard checks block of `_meta/TASKS.md`; they are not repeated here so that there is one place to change them.

## How this bar differs from the Angular one

Added for backend interviews: B10–B13 (production scenarios, failure modes and load, operations, security), B8–B9 triggers, C1 basis tags, C9 ledger coverage, C10–C12 (invariant tests, verified numbers, JMM), D9, H5. Dropped: browser Baseline markers and the TypeScript/Angular build checks.
