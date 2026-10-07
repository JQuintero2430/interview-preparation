# Style guide

This is the contract every module follows. When a rule here conflicts with habit, the rule wins. When a rule conflicts with teaching clarity, raise it and change the rule. Do not quietly break it.

## 1. Who we write for

One reader with two speeds. Someone who has never built an Angular app must be able to start at the top of any concept and follow it. Someone preparing for an architect interview must find the internals, the edge cases and the trade-offs further down the same concept. We never label content by level: no "junior/mid/senior" headings, badges, tags or emoji. Depth is signalled by **position**, because every concept, question bank and exercise list runs from the basic idea to the hard trade-offs.

## 2. Language and tone

- English, clear explanatory prose, second person ("you") where it helps. Short sentences beat clever ones.
- **Define every term the first time it appears in a module**, even if another module also defines it. Use one sentence inline (or a parenthesis), and link to the module that teaches it. This applies equally to Angular jargon (OnPush, reactive context, extended diagnostics, TransferState…). Module writers do not edit GLOSSARY.md: they list their glossary terms in their final report, and the coordinator builds the glossary in Phase 5. Links to `GLOSSARY.md#term` are allowed and resolve once it exists.
- Explain **why** before **what**. An answer that only states a fact is not finished.
- Lists and tables are for comparison and scanning. They never replace the explanation that justifies them.
- No marketing words ("blazing", "powerful", "simply"). No hedging filler. Say how sure you are once, explicitly.

## 3. Accuracy rules

1. Everything is written against [VERSIONS.md](VERSIONS.md). Do not use an API that is not in those versions.
2. Mark any API that is not plain stable, inline, at its first mention in a module, using exactly one of these status markers:
   - `[Developer preview since vX]`
   - `[Experimental since vX]`
   - `[Deprecated since vX — use Y]`
   - `[Removed in vX]`
   - `[Changed in vX: …]` when the API is stable but its behavior or default changed (for example the OnPush default in v22).
   - `[Stable since vX]` for a stable API that interviewers ask "since when" about (anything that graduated in the last three majors), and `[Added in vX.Y]` for an option or overload added in a minor release. Use the version from the `@publicApi vX` tag or the changelog.

   Markers are inline text in square brackets at the first mention, never blockquotes. Several markers on one API are separated by `·`: `` `linkedSignal` [Stable since v20.0] · `set` option [Added in v22.1] ``.
3. Never invent an API, option, flag or behavior. If a claim cannot be verified in an official source or by running code, leave it out, or write `> **Unverified:** …` and say what would confirm it.
4. Teach the modern approach as the default. Wherever production code still uses the legacy approach, add a **Legacy** subsection that shows it, explains why it changed, and gives the migration path (including the `ng generate @angular/core:…` schematic when one exists).
5. Every source goes into [SOURCES.md](SOURCES.md) under the module's heading. Prefer official sources: angular.dev, blog.angular.dev, the Angular GitHub changelog, rxjs.dev, ngrx.io, typescriptlang.org, tc39.es, MDN, web.dev, the WHATWG/W3C specs, the RFCs, and docs.spring.io.
6. Say where each claim comes from. Code verified by running it is linked to its lab file. A claim read from documentation is cited. Never present a documented claim as an observed result.

## 4. Module file layout

Path: `modules/NN-slug.md`, where `NN` is two digits and the slug matches [SYLLABUS.md](SYLLABUS.md).

### 4.1 Header (always first)

```markdown
# NN. Title

> **What this covers:** two or three sentences.
> **Prerequisites:** [Module X](XX-slug.md), [Module Y § section](YY-slug.md#3-section-title) (or "none")
> **Leads to:** [Module Z](ZZ-slug.md), …
> **Applies to:** Angular 22.x, TypeScript 6.0, RxJS 7.8 (whatever is relevant)
> **Study time:** ~N hours reading + ~N hours exercises
> **Short on time:** the sections and questions to read first when you have about 30 minutes, then [Summary](#summary).
> **Labs:** [`labs/angular/src/app/modules/NN-slug/`](../labs/angular/src/app/modules/NN-slug/). Run (from `labs/angular`, Node 24): `npx ng test --watch=false --include='src/app/modules/NN-slug/**/*.spec.ts'` (for `labs/ts-js`: `npx vitest run src/modules/NN-slug src/outputs/NN-slug`). The include glob must name the spec files: a glob that also matches source files makes Vitest fail with "No test suite found" (observed 2026-10-05).

## Contents
(a linked table of contents of the concept sections and the end-of-module sections)
```

- **Prerequisites** link to the exact section the reader needs when that section exists (`#3-section-title`); a module-level link is acceptable only for a module not yet written or when the whole module is the prerequisite.
- **Short on time** names concrete sections and question IDs, never "the important parts".
- **Labs** gives the command that runs only this module's tests, so a reader can verify a claim without knowing the workspace.

### 4.2 Concept sections (the body)

A module has several concepts. Each concept is an `##` section with these subsections in this order. Skip a subsection only when it truly does not apply, and never reorder them.

1. **`### The problem it solves`** explains why the concept exists and what goes wrong without it. Make it concrete: a bug, a performance cliff, a maintenance cost.
2. **`### Mental model`** gives an intuitive explanation and an analogy. Add a Mermaid diagram when a picture shows a flow, a hierarchy or a timeline better than prose.
3. **`### How it actually works`** covers the mechanism and the internals, down to the depth a demanding interviewer would probe (data structures, algorithms, scheduling, what the compiler emits).
4. **`### Code`** presents minimal, complete, idiomatic, modern examples. **Before each non-trivial snippet**, state the approach in one or two sentences, walk through the steps, then show the code. Show the legacy equivalent under a `#### Legacy` heading when relevant.
5. **Callouts**, when relevant (format in §6): *Framework vs platform* and *Coming from the backend*.
6. **`### Best practices and anti-patterns`** gives each item with **the reason**: "Do X, because Y" or "Avoid X, because Y happens".
7. **`### Misconceptions and traps`** lists popular claims that are wrong or half-true, each with the correction and why the myth exists. When the claim **was once true** (outdated advice), say until which version and what changed, with a status marker or a cited changelog entry: *"Once true: … until v19. Now: … [Changed in v19: …]."* Interviewers often hold the older belief, so the reader must be able to say both "it used to be" and "since when".

### 4.3 End-of-module sections (always last, in this order)

8. **`## Summary`**: one to three paragraphs to re-read before an interview. It restates every concept section's core claim and its most-asked trap in plain prose, linking each to its section. No new facts: everything in it is taught (and verified) above.
9. **`## Question bank`**
10. **`## Hands-on exercises`**
11. **`## Check your understanding`**
12. **`## Connections`**

## 5. Question bank format

### 5.1 IDs and anchors

Every question has a guide-wide unique ID, `Q<module>.<nn>` (for example `Q17.08`), and an explicit anchor, so [QUESTION-INDEX.md](QUESTION-INDEX.md) can deep-link it. IDs are never reused or renumbered once published. A new question goes at the end of the bank, or takes a letter suffix (`Q17.08a`) to keep the ordering.

### 5.2 Ordering and mix

The bank runs from foundational to deep. Every bank mixes these types, and each question declares its type in its title:

| Type tag | Meaning |
|---|---|
| `Concept` | Explain an idea. |
| `Difference` | "Explain the difference between A and B." |
| `Output` | "What does this code print / render / do?" The answer must be verified by running it (§7.3). |
| `Bug hunt` | Spot the bug in a code review snippet. |
| `Design` | "How would you design / implement …?" |
| `Trade-off` | No single right answer. The answer argues both sides and says when each wins. |

A question may carry two tags (`Difference · Output`). Any question whose answer predicts printed or rendered output **must** carry `Output`, so its verification rule (§7.3) applies.

Questions do not repeat across modules. If a question belongs to another module, link to it instead of copying it. **Tie-break for overlapping syllabus items:** a topic marked "(pointer to N)" or "(deeper in N)" in a module's checklist gets *at most one* question in that module. Module N owns the rest. When two checklists genuinely overlap without a marker, the module listed in SYLLABUS.md §4's ownership notes wins, and otherwise the lower-numbered module asks the conceptual question while the higher one asks the applied or design question.

### 5.3 Answer format

```markdown
<a id="q17-08"></a>
### Q17.08 · Output · What does this effect log after two synchronous `set` calls?

(question body, including any code)

<details>
<summary>Answer</summary>

**Short answer (30 seconds).** …

**Full explanation.** … the reasoning, the mechanism, why …

**Code.** (optional snippet)

**Follow-ups an interviewer will ask.**
- *Follow-up question?* Answer.
- *Follow-up question?* Answer.

**Trap to avoid.** …

</details>
```

Rules: leave a blank line after `<summary>` and before `</details>`, otherwise GitHub does not render the Markdown inside. Every answer has all five parts, in this order. "Code" may be omitted when it adds nothing, and the other four are mandatory.

- **Code** is always its own part after the Full explanation, never in the middle of it. If the code is the fix, the explanation ends with "The fix:" and the Code part follows.
- **Code** must be real code. "See section X" is a link in the explanation, not a Code part.
- For an *Output* question, the Short answer gives the printed lines **and** one or two sentences of reasoning. Never just an output block.
- Every snippet in a question or answer that relies on scaffolding not shown (an injection context, a `TestBed`, an `injector`, a `wait` helper) starts with a `// Partial: …` comment naming that scaffolding.

## 6. Callouts

Use GitHub alert syntax so callouts render in GitHub and stay readable as plain text in the IDE:

```markdown
> [!NOTE]
> **Framework vs platform.** What Angular adds, what TypeScript adds, what JavaScript/the browser provide natively.

> [!TIP]
> **Coming from the backend.** The Spring/Java analogue … **Where the analogy breaks:** …

> [!WARNING]
> **Legacy / deprecated.** …
```

- **Framework vs platform** is required wherever the line is commonly blurred: decorators, signals vs the TC39 Signals proposal, Observables vs the platform `Observable` proposal, emulated encapsulation vs Shadow DOM, the Router vs the History/Navigation API, Angular DI vs plain constructor injection, `HttpClient` vs `fetch`, `@defer` vs native lazy loading, Angular i18n vs `Intl`.
- **Coming from the backend** is optional **reading** and never a prerequisite: the main text must make sense to a reader who knows no Java. But when a module's syllabus checklist names a specific comparison (for example Reactor, JavaFX properties or the Spring container), that callout is **required**, and it must be a real comparison (mechanism, not a one-word mention). Every such callout **must** state where the analogy breaks.

## 7. Code rules

### 7.1 Style

- Modern Angular by default: standalone components, `inject()`, signals, signal inputs/outputs/`model()`, built-in control flow, functional guards/resolvers/interceptors. No `changeDetection` property (OnPush is the v22 default) unless the example is about change detection. This applies to **lab code and test host components too**, not only to Markdown snippets. File names follow the v22 CLI convention (`user-card.ts`, not `user-card.component.ts`).
- Legacy code appears only under a `Legacy` heading or a `WARNING` callout, and says what it is.
- Low cyclomatic complexity. Small classes with one responsibility. **At most four injected dependencies per class**: when you need more, group related collaborators behind a facade or an intermediate service. Prefer a named design pattern to a long class.
- Strict TypeScript: no `any` unless the example teaches why `any` is bad. Prefer `unknown` plus narrowing.
- Template examples use the `@if`, `@for` (always with `track`), `@switch`, `@let` and `@defer` blocks.

### 7.2 Snippets vs labs

There are exactly four kinds of snippet:

- **Complete**: identical to a file in `labs/` that compiles and is tested. Put a source link right under it: `<sub>Source: [labs/…/file.ts](../labs/…)</sub>`.
- **Excerpt**: a verbatim subset of a lab file. The first line is `// Excerpt of labs/…/file.ts`. Only whole members or statements may be omitted, never edited, and the file itself must compile and be tested. `labs/tools/check-snippets.mjs` checks mechanically that every Complete snippet equals its file and every Excerpt's lines appear in its file in order (run: `node labs/tools/check-snippets.mjs . NN` from the guide root).
- **Output**: the unmarked snippet of a question whose heading carries the `Output` tag. It is the code the test named after the question ID runs, with `console.log` where the test calls `log` (§7.3), so it is checked against that test (the VERIFY-OUT rules in `_meta/TASKS.md`), not by the script, which skips it. Any other snippet in the same question still needs one of the other kinds.
- **Partial**: illustrative code that is not in the labs. The first line is `// Partial: <what is omitted or assumed>`. A partial snippet must still be correct under strict TypeScript if the omitted parts were filled in the obvious way. When in doubt, compile it in the labs and make it an excerpt.
- Java/Spring snippets (full-stack modules) start with `// Spring Boot 4.1 — illustrative, not compiled in labs`. They are not compiled, but every API, annotation and property is checked against docs.spring.io for the versions in VERSIONS.md, and the source goes into SOURCES.md.

### 7.3 Output questions

The answer to every "what does this print?" question is confirmed by running the code.

- **Plain JavaScript/TypeScript** snippets (no Angular import) live in `labs/ts-js/src/outputs/NN-slug/` with a test that uses the `captureLogs` helper.
- **Snippets that use Angular APIs**, rendering or not, live in `labs/angular/src/app/modules/NN-slug/outputs/` as a spec. They may use a local log recorder instead of `console.log`, and the answer's snippet shows `console.log` with a `// Partial:` note for the scaffolding.
- **Compile-time questions** are asserted with `// @ts-expect-error` in a lab file, so the typecheck fails if the error disappears. Angular template diagnostics that cannot be kept in a compiling lab are described as "observed by compiling a throwaway component on <date>", with the exact diagnostic text quoted.
- Each test is named after the question ID (`it('Q17.04 …')`). Any additional behavioral claim made in prose ("in the lab, X happened") also needs a test, named after its section.

## 8. Exercises format

```markdown
<a id="ex17-2"></a>
### Exercise 17.2 · Title

**Problem.** …
**Constraints.** …
**Acceptance criteria.** a checklist; every criterion has at least one test, and every test belongs to a criterion

<details><summary>Hint 1</summary>

…

</details>

<details><summary>Worked solution</summary>

Reasoning → code → a short criterion-by-criterion account of how the solution and its tests satisfy each acceptance criterion.
**Alternative approach:** … **Trade-offs:** …
**Interviewer follow-ups.** two to four extensions an interviewer would ask next in a live-coding round ("now make it cancel", "what if the list has 10,000 items?"), each with a one- to three-sentence answer or a link to where the guide teaches it.
**Tests:** link to the spec file in labs.

</details>
```

Exercises progress from simple to hard inside each module. Every solution lives in `labs/` and passes its tests.

## 9. Check your understanding

- **Explain it back.** Three to six prompts of the form "In your own words, explain … to a colleague who …".
- **Flashcards.** Five to ten recall items, each a `<details>` with the question in the `<summary>` and a one- or two-line answer inside.

## 10. Links

- Relative links only. Module to module: `[Signals](17-signals.md#3-computed-signals)`. From the root files: `modules/17-signals.md`.
- Concept sections are numbered `## 1. Title`, `## 2. Title` …, so their anchors are `#1-title`. Closing sections are unnumbered (`## Question bank`).
- Link a concept to the module that teaches it instead of re-explaining it. One sentence of context plus the link is enough.
- Backend depth links to the existing root guides (paths URL-encoded, for example `../../Backend%20Study%20Guide%20-%20Security%2C%20JPA%2C%20Design%20Patterns%20%26%20Spring.md`).
- Anchors: use explicit `<a id="…"></a>` for questions and exercises, and GitHub's auto-generated heading slugs elsewhere. The link check (`labs/tools/check-links`) validates both.

## 11. Diagrams

Mermaid only (`flowchart`, `sequenceDiagram`, `stateDiagram-v2`, `classDiagram`, `timeline`), so diagrams render in GitHub and in IntelliJ with the Mermaid plugin. Keep node labels short and put the explanation in the prose.

## 12. Minimum counts

| Module kind | Questions | Exercises |
|---|---|---|
| Angular module (tagged **NG** in the syllabus) | ≥ 25 | ≥ 4 |
| Any other module | ≥ 15 | ≥ 2 |
| Whole guide | ≥ 600 | — |

These floors are guidance. The per-module numbers in the syllabus are **upper limits, not quotas**. Write only the questions a topic genuinely supports: a module may finish under its floor when the topic is exhausted, with the reason recorded in PROGRESS.md. Filler questions, duplicates and shallow answers are deleted in review.
