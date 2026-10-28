# Style guide

The contract every module follows. When a rule conflicts with teaching clarity, record it in `_meta/STATE.md` "Standing notes" and change the rule through a task; never break it quietly. The measurable form is [`_meta/QUALITY-BAR.md`](_meta/QUALITY-BAR.md); the protocol is [`_meta/RUN.md`](_meta/RUN.md).

Reference guides (calibration only; their paths appear nowhere else in this file): `../react-full-stack-interview-guide/STYLE.md`, `../angular-fullstack-guide/STYLE-GUIDE.md`, `../angular-fullstack-guide/modules/17-signals.md`.

## 1. Who we write for

One reader with two speeds: someone who has never written a Spring service must be able to start any concept at the top; someone preparing for an architect interview must find the internals, production incidents and trade-offs further down the same concept. Content is never labeled by level (no "junior/mid/senior" headings, badges or emoji). Depth is signalled by **position**: basic idea → internals → trade-offs.

## 2. Module file layout

Path: `modules/NN-<slug>.md`, with `NN` and the slug exactly as in [SYLLABUS.md](SYLLABUS.md) §1.

### 2.1 Header (always first)

```markdown
# NN. Title

> **What this covers:** two or three sentences.
> **Prerequisites:** [11. Threads and the JMM § 4. Happens-before](11-concurrency-threads-and-jmm.md#4-happens-before) (or "none")
> **Leads to:** [Module Z](ZZ-slug.md), …
> **Applies to:** Java 25, Spring Boot 4.1.2 (Spring Framework 7.0.10), PostgreSQL 18 (only what is relevant, copied from VERSIONS.md)
> **Study time:** ~N hours reading + ~N hours exercises
> **Short on time:** 2–4 section links, 3–6 question IDs, then [Summary](#summary).
> **Labs:** [`labs/<labfolder>/`](../labs/<labfolder>/), package `dev.interview.<pkg>.mNN`. Run: (the per-module command from the Standard checks block of `_meta/TASKS.md`, filled in). Needs Docker: yes/no.

## Contents
(a linked list of the concept sections and the five closing sections)
```

- **Prerequisites** link the exact section needed; a module-level link only when the whole module is needed or not yet written.
- **Labs** is omitted for modules whose SYLLABUS lab is `—` (53–55); write `> **Labs:** none; exercises are written designs checked against a rubric (STYLE-GUIDE §8.2).` instead.

### 2.2 Concept sections

Each concept is a numbered `## N. Title` section with these subsections in this order. Skip one only when it truly does not apply (the reviewer must accept the gap); never reorder.

1. **`### The problem it solves`**: a concrete failure without the concept (a bug, a cost, an outage, a performance cliff), not a definition.
2. **`### Mental model`**: an intuitive explanation and an analogy, plus a Mermaid diagram when the mechanism is a flow, timeline, hierarchy or state machine (§11).
3. **`### How it actually works`**: the mechanism down to what a demanding interviewer probes: data structures, the algorithm, what the compiler or the JVM does, what the framework generates at startup or per call, the spec section by name (JLS §17.4.5, JVMS §5.4).
4. **`### Code`**: minimal, complete, idiomatic Java 25 and Spring Boot 4 examples (§7). Before each non-trivial snippet: the approach in one or two sentences, numbered steps, then the code. The older form goes under `#### Legacy` when production code still uses it.
5. **`### Failure modes and operations`**: how it fails and how it behaves under load (saturation, timeouts, retries, memory, contention), what to configure, what to observe (the metric, log or trace that shows the failure), and what changes at deployment. Skip only for pure-language topics with no runtime dimension (for example generics type checking).
6. **Callouts** where §6 requires them.
7. **`### Best practices and anti-patterns`**: each item with its reason ("Do X, because Y"). Security items start with **Security:** (§3).
8. **`### Misconceptions and traps`**: the wrong or half-true claim, the correction, and why the myth exists. A claim that was once true says until which version and what changed: *"Once true: … until Java 17. Now: … [Changed in Java 21: …]."*

### 2.3 End-of-module sections (always last, in this order, unnumbered)

`## Summary` (one to three paragraphs restating each section's core claim and most-asked trap, with section links, no new facts), `## Question bank` (§5), `## Hands-on exercises` (§8), `## Check your understanding` (§9), `## Connections` (Builds on / Read next / Uses these ideas later / Comparisons, each a link with a reason).

### 2.4 Skeleton and TASK marker regions

`PLAN-Mxx` writes the skeleton: the header and Contents in full, every concept heading and subsection heading, every closing heading, and every question and exercise anchor plus heading from the module plan. Each future task's content goes in a **marker region**:

```markdown
## 3. Propagation
<!-- TASK: SEC-M17-03 -->
### The problem it solves
### Mental model
### How it actually works
### Code
### Failure modes and operations
### Best practices and anti-patterns
### Misconceptions and traps
<!-- /TASK: SEC-M17-03 -->
```

- A region runs from `<!-- TASK: <ID> -->` to `<!-- /TASK: <ID> -->`, each on its own line. Regions never nest or overlap.
- The task replaces the whole region, both marker lines included, in one edit at the end of the task (RUN.md §5). Headings and anchors inside the region are re-emitted unchanged, so links resolve before and after.
- A task may own several regions (the same ID on each). A region for a `QB` task holds its at most 8 question anchors and headings; an `EX` region holds one exercise; `CLOSE-Mxx` owns Summary, Check your understanding and Connections.
- A module is complete only when `grep -c 'TASK:' modules/NN-<slug>.md` prints 0. Counts from `module-stats.mjs` mean nothing before that, because skeleton headings are counted.

## 3. Language and writing

- English, clear explanatory prose, short sentences, no marketing words or hedging filler.
- **Define every term the first time it appears in a module**, inline in one sentence or a parenthesis, with a link to the module that owns it, even if another module also defines it.
- **Why before what.** An answer that only states a fact is unfinished.
- **Approach → steps → code** before any non-trivial code, in prose, in answers and in exercises.
- **Progression:** basic idea → internals → trade-offs, inside each section, across sections and across the question bank.
- **Trade-off tables** compare options on named criteria. A number appears in a cell only when verified (§4); otherwise the cell is qualitative ("one round trip per row", "O(log n)" from the Javadoc) and never invented. Defaults (pool sizes, timeouts) are numbers too and carry a basis tag.
- **Security considerations per topic.** Every concept with a security dimension (input handling, secrets, authentication, injection, deserialization, logging of personal data, exposure of actuator endpoints, supply chain) has at least one **Security:** best-practice item or a question. If a section has none, it is because the topic has no security dimension, which the reviewer confirms.
- **Delegated topics** (SYLLABUS §5 and each module's delegated list) get one sentence of context and a link. They are never re-explained.

## 4. Accuracy: verification basis and status markers

### 4.1 Verification basis

Everything is written against [VERSIONS.md](VERSIONS.md): Java 25 and Spring Boot 4.1.2 are the default; other versions appear only in Version notes (§6). Never invent an API, option, property, flag, default or behavior. Every factual claim has a basis, chosen in RUN.md §6 step 3 order, and is marked with one of these **verification-basis tags**:

| Tag | Basis | Form |
|---|---|---|
| `[Lab: …]` | run in `labs/` by a named test | `[Lab: Q17OutputsTest.q17_04](../labs/spring-transactions/src/test/java/dev/interview/springtransactions/m17/outputs/Q17OutputsTest.java)` |
| `[Src: …]` | shipped source or Javadoc of the VERSIONS.md version | `[Src: spring-tx 7.0.10, TransactionInterceptor]` (link to the tagged GitHub file when possible) |
| `[Doc: …]` | official documentation, specification, JEP or release notes | `[Doc: JLS §17.4.5](https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html#jls-17.4.5)` |
| `[Unverified: …]` | not yet verified, with an open UNVERIFIED.md row | `[Unverified: <row ID>]` |

- Placement: at least one tag per paragraph of "How it actually works" and "Failure modes and operations", per Full explanation, and per numeric table row. A tag covers the sentences before it in its paragraph.
- Code shown as Complete or Excerpt (§7.3) is its own basis: the source link and the test are the tag.
- A claim observed in a lab is phrased as an observation ("in the lab, the second insert waited until …") and names its test. A documented claim is never phrased as an observation.
- `[Unverified: …]` exists only with its row in `_meta/UNVERIFIED.md` (claim, location, how to verify, `needs:`) and a VERIFY task. A module cannot CLOSE with one unless the row is `needs: docker` or `needs: vision` and the harness lacks it. The finish line requires zero.
- Every URL cited goes into [SOURCES.md](SOURCES.md) under the module's heading. Prefer official sources: openjdk.org, docs.oracle.com, docs.spring.io, the projects' tagged sources, and each product's own documentation.

### 4.2 Status markers

Mark every API or feature that is not plainly stable, or whose behavior changed, inline at its first mention in a module, as text in square brackets (never a blockquote). The vocabulary is VERSIONS.md "Status vocabulary"; use only these forms:

| Technology | Markers |
|---|---|
| Java (JEP 12) | `[Preview in Java 25, JEP 505]` · `[Incubator in Java 25, JEP 508]` · `[Experimental in Java NN: -XX:+UnlockExperimentalVMOptions]` · `[Deprecated since Java NN — use Y]` · `[Deprecated for removal since Java NN — use Y]` · `[Removed in Java NN]` · `[Final since Java NN, JEP nnn]` (for "since when" questions) · `[Changed in Java NN: …]` |
| Spring projects | `[Added in Spring Boot 4.0]` · `[Changed in Spring Framework 7.0: …]` · `[Deprecated since Spring Boot N.M — use Y]` · `[Removed in Spring Boot N.0]` · `[RC only: Spring Boot 4.2.0-RC1]` (milestones and release candidates appear only in Version notes; examples use GA only) |
| Other libraries | the library name before the version: `[Changed in Hibernate 7.0: …]`, `[Added in Kafka 4.0]`, `[Deprecated since Testcontainers 2.0 — use Y]` |
| OpenTelemetry | lifecycle: `[OTel: Development]` · `[OTel: Release Candidate]` · `[OTel: Stable]` · `[OTel: Mixed]` · `[OTel: Deprecated]`; artifact suffix (a naming convention, not a lifecycle level): `[OTel artifact: -alpha]` |
| Jenkins | `[Jenkins plugin deprecated: <plugin id> — use Y]` · `[Requires Jenkins core ≥ 2.NNN.N]` |

- Several markers on one API are separated by `·`. A version number in a marker must be traceable to a Doc or Src tag in the same paragraph.
- Java 27 features appear only in Version notes, with their status. Preview or incubator code in labs needs `--enable-preview` or `--add-modules` in that lab only, and the snippet says so.
- Marker-like text inside an inline code span is a mention, not a marker.

## 5. Question bank format

### 5.1 IDs and anchors

Every question has a guide-wide unique ID `Q<NN>.<mm>` (two-digit module and number; `Q17.08`), and an explicit anchor `<a id="q17-08"></a>` on the line directly above its heading. IDs are never reused or renumbered; an inserted question takes a letter suffix (`Q17.08a`).

### 5.2 Heading format and types

The heading format is parsed by `labs/tools/module-stats.mjs` and the finish-line question index, so it is exact:

```
### Q<NN>.<mm> · <Type> · <Type> · <Title>
```

One or more type tags, then the title as the **last** `·`-separated segment. Tags, exactly spelled:

| Type tag | Meaning |
|---|---|
| `Concept` | Explain an idea. |
| `Difference` | Explain the difference between A and B. |
| `Output` | What does this code print, return, throw, or leave in the database? Asserted by a test (§7.4). |
| `Bug hunt` | Find the bug in a review snippet; the bug is demonstrated by a test. |
| `Design` | How would you design or implement …? |
| `Trade-off` | No single right answer; argue both sides and say when each wins. |
| `Production scenario` | An incident or design decision as an interviewer frames it (symptoms, constraints, numbers given), resolved step by step: hypotheses, how to confirm each with evidence, fix, prevention. |

Any question whose answer predicts output or an outcome carries `Output`. Questions never repeat across modules: link the owning question instead (check `grep -h '^### Q' modules/*.md` and SYLLABUS delegated topics). Tie-break: a checklist item marked "(pointer to N)" or "(deeper in N)" gets at most one question here; otherwise the lower-numbered module asks the conceptual question and the higher one the applied or design question.

### 5.3 Answer format

```markdown
<a id="q17-08"></a>
### Q17.08 · Output · Which rows exist after `placeOrder` throws inside a `REQUIRES_NEW` call?
<!-- ledger: <row IDs> -->

(question body, including any code)

<details>
<summary>Answer</summary>

**Short answer (30 seconds).** …

**Full explanation.** … the mechanism and the why, with basis tags …

**Code.** (optional)

**Follow-ups an interviewer will ask.**
- *Follow-up?* Answer.
- *Follow-up?* Answer.

**Trap to avoid.** …

</details>
```

- Blank lines after `<summary>` and before `</details>`, or GitHub will not render the Markdown inside.
- All five parts in this order; only **Code** may be omitted. Code is its own part after the Full explanation and is real code (§7.3), never "see section X". If the code is the fix, the explanation ends with "The fix:".
- An `Output` short answer gives the exact output (or the set of permitted outcomes, §7.5) **and** one or two sentences of reasoning.
- A `Production scenario` full explanation follows: what the symptoms tell you → hypotheses ranked → the evidence that confirms one (metric, log, thread dump, `EXPLAIN`, trace) → fix → prevention and what to monitor.
- `<!-- ledger: … -->` (optional line under the heading) lists the source-ledger row IDs (`_meta/sources/*.md`) the question answers, so QUALITY-BAR C9 can be checked by grep.

## 6. Callouts

GitHub alert syntax, so they render in GitHub and read as plain text in the IDE. The bold label is fixed text, because checks grep for it.

```markdown
> [!IMPORTANT]
> **Production scenario: <short title>.** *As the interviewer frames it:* "…" (symptoms, scale, constraints).
> **Reasoning.** The diagnosis path, the fix, and what prevents a recurrence, with basis tags.

> [!NOTE]
> **Version notes.** Java 8: … · Java 17: … · Java 21: … · Java 25 (default): … · Spring Boot 2.x: … · Spring Boot 3.x: … · Spring Boot 4.x (default): … (only the versions where something changed, each with a marker or basis tag)

> [!NOTE]
> **Framework vs language.** What Java or the JVM guarantees · what a Jakarta EE specification defines (JPA, Servlet, Bean Validation) · what Spring or the library adds on top, and where each one's behavior ends.

> [!WARNING]
> **Legacy / deprecated.** What it is, why it changed, the migration path.
```

- **Production scenario** is required in every concept section whose topic has a known production failure class (pool exhaustion, lost updates, retry storms, rebalancing, memory leaks, GC pauses, thread starvation), and a core module has at least 2. Callouts teach in the body; `Production scenario` questions (§5.2) drill. They do not duplicate each other.
- **Version notes** are required wherever a behavior, default, API or namespace differs across Java 8 → 25 or Spring Boot 2 → 3 → 4 in a way companies still run into. Teach the current way in the body; the note gives the older way and since when.
- **Framework vs language** is required wherever the line is commonly blurred, at least: proxy-based annotations (`@Transactional`, `@Async`, `@Cacheable`) vs plain method calls; Spring DI vs constructors; Spring executors vs JDK executors and virtual threads; Hibernate vs JPA vs JDBC; Spring Security's filter chain vs Servlet filters; Jackson vs Java serialization; Micrometer vs the OpenTelemetry API vs JFR; Reactor vs `CompletableFuture`.
- **Unverified** content uses `> **Unverified:** … [Unverified: <row ID>]` (§4.1).

## 7. Code, snippets and labs

### 7.1 Code rules (RUN.md §10.1)

- Modern Java 25 by default (records, sealed types and pattern `switch` where they clarify; `var` only when the type is obvious). Older forms only under `#### Legacy` or a WARNING callout.
- **Low cyclomatic complexity**: small methods, early returns, polymorphism or a map of strategies over long `if`/`switch` chains.
- **At most 4 injected dependencies per class**; group same-purpose collaborators behind an intermediate interface (a facade or port).
- **Design patterns over long classes**: name the pattern in prose when you use one (Strategy, Template Method, Decorator, Outbox).
- Constructor injection with `final` fields; no field injection outside a Legacy example.
- **TDD, or code first followed by minimal test changes**: change only the tests of changed methods, and add a test for every new scenario.
- **MapStruct mappers** expose their instance as `OrderMapper INSTANCE = Mappers.getMapper(OrderMapper.class);`.
- No Lombok in labs (it is not in VERSIONS.md and hides the code the reader must see); questions about it show the generated equivalent.
- **Formatting**: per `labs/pom.xml` (spotless, formatter chosen in P5). Snippets are copies of formatted lab code, so they follow it too.
- **Naming**: no `I` prefix on interfaces, no `Impl` suffix unless two implementations are contrasted.

### 7.2 Lab layout and naming

- Each module's code lives in the lab folder named in SYLLABUS §1, under package `dev.interview.<pkg>.mNN`, where `<pkg>` is the lab folder with hyphens removed (Java packages cannot contain `-`): `labs/spring-transactions/` → `dev.interview.springtransactions.m17`.
- Sub-packages: `…mNN.sNN` (code for concept section N, where needed), `…mNN.outputs` (Output and Bug hunt code), `…mNN.exN` (exercise N). Tests mirror the package under `src/test/java`.
- Test names carry the ID they assert, so they are greppable: `@DisplayName("Q17.04 · …")` on a method `q17_04()`; `@DisplayName("M17 §3 · …")` for a section claim; `@DisplayName("Ex17.2 · criterion text")` for exercise criteria.
- Tests that need Docker carry `@Tag("docker")` and are skipped, not failed, when Docker is absent (mechanism per `labs/pom.xml`).

### 7.3 Snippet kinds

There are exactly four kinds. Every fenced code block in a module (except `mermaid`, `text` output blocks and shell commands) is one of them. Fence languages: `java`, `xml`, `yaml`, `properties`, `sql`, `groovy` (Jenkinsfile), `dockerfile`, `bash`, `text`.

- **Complete**: identical to a file in `labs/<labfolder>/` that compiles and is tested. Directly under it: `<sub>Source: [labs/<labfolder>/src/main/java/…/File.java](../labs/<labfolder>/src/main/java/…/File.java)</sub>`.
- **Excerpt**: a verbatim subset of a lab file; first line `// Excerpt of labs/<labfolder>/…/File.java` (`# Excerpt of …` for YAML and properties, `<!-- Excerpt of … -->` for XML, `-- Excerpt of …` for SQL). Only whole members or statements may be omitted, never edited. The file compiles and is tested.
- **Partial (illustrative)**: not in the labs; first line `// Partial: <what is omitted or assumed>` (comment syntax of the fence language). Allowed only for configuration fragments, method or interface signatures, and pseudo-structure (a package layout, a pipeline outline). A Partial never carries behavior the text claims; every API, annotation and property in it is checked against the Javadoc or docs.spring.io for the VERSIONS.md version, with a Doc or Src tag next to it. When in doubt, move it into the lab and make it an Excerpt.
- **Output**: the unmarked snippet under an `Output` question, and the `text` block holding its printed lines. The Java code is the body of a lab class `…mNN.outputs.QNN_MM` verbatim, without the `class` wrapper, `main` signature and imports; the test named after the question runs it and asserts the output (§7.4).

### 7.4 Output questions

Every "what does this print?" answer is asserted by a test. The test runs the lab code and asserts exactly the lines (or the outcome: return value, exception type and message, rows in the table, which transaction committed) that the Short answer states.

- Printed output is captured by redirecting `System.out` around the call; capture tests do not run in parallel.
- Compile-time questions ("does this compile, and what is the error?") are asserted by compiling the snippet in a test with `javax.tools.ToolProvider.getSystemJavaCompiler()` and checking the diagnostic; the answer quotes the diagnostic text the test checks.
- Any extra behavioral claim in prose ("in the lab, X happened") has a test named after its section.

### 7.5 Nondeterministic behavior

Data races, visibility, scheduling, virtual-thread interleavings, timing and concurrent transactions are asserted as an **invariant** or a **set of permitted outcomes**, never as one interleaving.

- A correct program's guarantee is asserted as an invariant over repeated runs (`@RepeatedTest`): "the counter always equals 10,000", "exactly one of the two transactions commits and the other fails with a serialization failure or an optimistic-lock exception".
- A broken program is asserted only against its permitted set ("the result is ≤ 10,000"). Never assert that a race *happens*: it may not on a given machine, and such a test is flaky. A lab observation of the failure may be reported in prose with its date and run count, as an observation, not a guarantee.
- Coordinate threads with latches, barriers or futures, never `Thread.sleep`. A barrier may force two transactions to overlap when the question is what the database does given the overlap; do not make the example deterministic where that removes the point of the question.
- Timing claims ("the call times out after about 2 s") assert bounds, not exact durations.

**Java Memory Model and jcstress: decision.** No jcstress lab by default. JMM claims are verified against JLS §17 (`[Doc: JLS §17.4.x]`), plus plain JUnit invariant tests for what a correctly synchronized program guarantees. What a racy program *may* do (reordering, a stale read, a torn `long`) is claimed from the JLS only, never asserted by a test. Reasons: the only jcstress artifact on Maven Central is 0.16 from 2023-02-27 (VERSIONS.md), its compatibility with Java 25 is unknown, it is a separate JMH-style harness whose runs are long and probabilistic and do not fit the Standard checks, and a JUnit test cannot reliably provoke the outcomes jcstress exists to catch. A jcstress lab may be added only by a PLAN task, after a probe task proves 0.16 builds and runs on Java 25 inside `labs/`, with the decision recorded in SYLLABUS "Resolved decisions".

### 7.6 Docker-dependent verification

Claims about PostgreSQL, Redis, MongoDB, Cassandra, Kafka, brokers, the OpenTelemetry Collector or built images are verified with Testcontainers against the image versions in VERSIONS.md, never an embedded substitute when the behavior differs (H2 is not PostgreSQL). Those tests carry `@Tag("docker")`. Their tasks declare `needs: docker`; a harness without Docker leaves them `todo` or records the claim in `_meta/UNVERIFIED.md` with `needs: docker`, never fakes the result.

### 7.7 Pipeline, container and deployment content

- **Jenkinsfile** syntax and step behavior are verified against the official Jenkins documentation (Pipeline syntax, the steps reference) and each plugin's documentation on plugins.jenkins.io for the plugin versions in VERSIONS.md, with a `[Doc: …]` tag. Where a claim depends on runtime behavior (`post` condition order, `parallel` failure handling, credential masking, agent allocation), it is verified by running the pipeline in a Jenkins LTS container of the VERSIONS.md version from a lab test in `labs/cicd/` (`needs: docker`). Jenkinsfiles that are run there are Complete snippets; the rest are Partials.
- **Dockerfiles** the text claims build are built by a lab test (`needs: docker`). **Kubernetes manifests** and cloud configuration are Partials checked against the official reference docs.

## 8. Exercises

Exercise headings are counted by `module-stats.mjs`, so the format is exact: `### Exercise <NN>.<n> · <Title>` with `<a id="ex17-2"></a>` above it. Exercises go from simple to hard; the last integrates several sections.

### 8.1 Code exercises (modules with a lab)

```markdown
<a id="ex17-2"></a>
### Exercise 17.2 · Title

**Problem.** The statement.
**Constraints.** …
**Acceptance criteria.**
- [ ] a checklist; every criterion has at least one test, and every test belongs to a criterion

<details><summary>Hint 1</summary>

…

</details>

<details><summary>Worked solution</summary>

**Approach.** reasoning and numbered steps → code (Complete or Excerpt) → **How each criterion is met**, naming the test of each criterion.
**Alternative approach:** … **Trade-offs:** …
**Interviewer follow-ups.** two to four extensions ("now make it idempotent", "what happens at 10,000 requests per second?"), each answered or linked.
**Tests:** link to the test class in labs.

</details>
```

The solution lives in `labs/<labfolder>/…mNN.exN`, passes its tests and follows §7.1.

### 8.2 Written-design exercises (modules 53–55, no lab)

Same heading, anchor and order, with two substitutions: **Acceptance criteria** become a **Rubric** (a table: criterion · what a strong answer contains · how to self-check), and **Tests** become the rubric itself. The Worked solution is a model answer (a design write-up with a Mermaid diagram where it helps) followed by **How each rubric criterion is met**, mapping each criterion to the paragraph that satisfies it. Every factual claim in the model answer carries a basis tag, usually a link to the module and question where it was verified in a lab. Rubric criteria are observable ("names the consistency model and what a client sees during a partition"), never "good design".

## 9. Check your understanding

- **Explain it back.** Three to six prompts: "In your own words, explain … to a colleague who …".
- **Flashcards.** Five to ten `<details>` items, the question in `<summary>`, a one- or two-line answer inside.

## 10. Links and cross-guide boundaries

- Relative links only. Module to module: `[Propagation](17-spring-transactions.md#3-propagation)`. From root files: `modules/17-spring-transactions.md`. To labs: `../labs/<labfolder>/…`.
- Concept sections are numbered (`## 3. Title`, anchor `#3-title`); closing sections are not. Questions and exercises use explicit `<a id>` anchors; everything else uses GitHub's heading slugs.
- Link the owning module instead of re-explaining. Cross-guide links (RUN.md §10.1) are relative, for example the browser side of authentication, which lives in the frontend guides listed in SYLLABUS §5. Concept modules other guides link to stay self-contained, and their slugs never change.
- Checked by `node labs/tools/check-links.mjs --planned` (and without `--planned` at the finish line).

## 11. Diagrams

Mermaid only (`flowchart`, `sequenceDiagram`, `stateDiagram-v2`, `classDiagram`, `timeline`), so diagrams render in GitHub and IntelliJ. Short node labels, labels with parentheses quoted, and a "what to notice" sentence after each diagram.

## 12. Floors

| Module kind (SYLLABUS §1) | Questions | Exercises | `Production scenario` questions |
|---|---|---|---|
| core (including the pilot) | ≥ 20 | ≥ 3 | ≥ 3 |
| supporting | ≥ 12 | ≥ 2 | ≥ 1 |

The SYLLABUS §1 numbers are ceilings, not quotas. A module may finish under a floor only when its topic and its mapped ledger rows are exhausted, with the reason recorded in `PROGRESS.md`. Filler, duplicates and shallow answers are deleted in review. `node labs/tools/module-stats.mjs --strict` enforces the question and exercise floors, the ceilings and the prose cap.
