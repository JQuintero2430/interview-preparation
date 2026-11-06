# Style Guide: Python Backend Interview Guide (Django & FastAPI)

This is the contract every module follows. When a rule here conflicts with habit, the rule wins. When a rule conflicts with teaching clarity, raise it and change the rule. Do not quietly break it.

---

## 1. Who we write for

One reader with two speeds. Someone with strong general backend experience (e.g., 4 years of Java and Spring Boot) who is learning Python backend architecture must be able to start at the top of any concept and follow it. Someone preparing for a senior or architect interview must find the internals, the edge cases, execution mechanics, and hard trade-offs further down the same concept.

We never label content by seniority: no "junior/mid/senior" headings, badges, tags or emoji. Depth is signalled strictly by **position**, because every concept, question bank and exercise list runs from the basic idea to the internals and trade-offs.

---

## 2. Language and tone

- English, clear explanatory prose, second person ("you") where it helps. Short sentences beat clever ones.
- **Define every term the first time it appears in a module**, even if another module also defines it. Use one sentence inline (or a parenthesis), and link to the module that teaches it.
- Explain **why** before **what**. An answer that only states a fact is not finished.
- Lists and tables are for comparison and scanning. They never replace the prose explanation that justifies them.
- No marketing words ("blazing fast", "powerful", "simply", "effortless"). No hedging filler. Say how sure you are once, explicitly.

---

## 3. Accuracy and status markers

1. Everything is written against [VERSIONS.md](VERSIONS.md). Do not use an API, option, or default that is not in those versions.
2. Mark any API that is not plain stable, inline, at its first mention in a module, using exactly one of these status markers:
   - `[Added in Python 3.X]` or `[Added in Django X.Y]` or `[Added in FastAPI 0.X]`
   - `[Changed in Python 3.X: …]` / `[Changed in Django X.Y: …]`
   - `[Experimental in Python 3.13: PEP 703 free-threaded]`
   - `[Provisional per PEP 411]`
   - `[Deprecated in vX.Y — use Z]`
   - `[Removed in vX.Y]`
   - `[Django 5.2 LTS]` or `[Django 6.1 Current]`
   - `[SQLAlchemy 2.0 style]` (vs legacy 1.x)
   - `[Pydantic v2]` (vs legacy v1)
3. Never invent an API, option, flag or behavior. If a claim cannot be verified in an official source or by running code, leave it out, or write `> **Unverified:** …` and say what would confirm it.
4. Teach the modern approach as the default. Wherever production code still uses the legacy approach, add a **Legacy** subsection or callout that explains why it changed and gives the migration path.
5. Every source goes into [SOURCES.md](SOURCES.md) under the module's heading.
6. Say where each claim comes from. Code verified by running it is linked to its lab file. A claim read from documentation is cited.

---

## 4. Module file layout

Path: `modules/NN-slug.md`, where `NN` is two digits and the slug matches [SYLLABUS.md](SYLLABUS.md).

### 4.1 Header (always first)

```markdown
# NN. Title

> **What this covers:** two or three sentences.
> **Prerequisites:** [Module X](XX-slug.md#anchor), [Module Y § section](YY-slug.md#3-section-title) (or "none")
> **Leads to:** [Module Z](ZZ-slug.md), …
> **Applies to:** Python 3.13, Django 6.1 / 5.2 LTS, FastAPI 0.162.0, SQLAlchemy 2.1.6 (whatever is relevant)
> **Study time:** ~N hours reading + ~N hours exercises
> **Short on time:** the 2–4 sections and 3–6 questions to read first when you have about 30 minutes, then [Summary](#summary).
> **Labs:** [`labs/<lab>/...`](../labs/<lab>/...). Run (from `labs/<lab>`, Python 3.13 via uv): `uv run pytest tests/test_NN_slug.py`.

## Contents
(a linked table of contents of the concept sections and the end-of-module sections)
```

### 4.2 Concept sections (`## 1.`, `## 2.`, ...)

Each concept section contains the following subsections in order:

1. `### The problem it solves`: A concrete failure, race condition, memory leak, bug, or performance cliff that occurs without this mechanism. Never just a definition.
2. `### Mental model`: A relatable analogy, a conceptual comparison table, and a Mermaid diagram wherever the mechanism is a flow, state machine, lifecycle, or dependency graph. Follow every diagram with a "What to notice:" sentence.
3. `### How it actually works`: The deep internals: runtime structures, bytecode/AST/compiler behavior, event loop scheduling, memory layout, CPython C-API/GIL mechanics, or SQL compilation.
4. `### Code`: Explain the approach first (1–2 sentences), walk through the numbered steps, then show the runnable code snippet.
5. `### Best practices and anti-patterns`: Concrete guidelines where every item has an explicit "because..." rationale.
6. `### Misconceptions and traps`: Common interview myths and subtle gotchas, explaining why the myth exists and the exact version history if behavior changed.

### 4.3 Mandatory callouts

- **Coming from Spring Boot:** Required wherever a Spring equivalent exists. Contrasts Python/Django/FastAPI mechanisms with Spring Boot (e.g. `Depends` vs `@Autowired`, SQLAlchemy Unit of Work vs Hibernate EntityManager, Django ORM vs Spring Data JPA).
  - Must include: `> **Where the analogy breaks:** …` explicitly identifying where the mental model diverges.
- **Framework vs language:** Required wherever framework magic obscures underlying Python/server behavior (e.g., FastAPI dependency caching vs Python scope, Django signals vs Python method calls, Uvicorn worker process vs ASGI application).
- **Version notes:** Clarifies version-specific differences across Python 3.10–3.13+, Django 5.2 LTS vs 6.1, Pydantic v1 vs v2, and SQLAlchemy 1.x vs 2.x.

### 4.4 Closing sections (always at the end)

- `## Summary`: Bulleted executive takeaway.
- `## Question bank`: Sourced interview questions.
- `## Hands-on exercises`: Production-grade coding challenges with tests.
- `## Check your understanding`: Self-assessment prompt questions without answers.
- `## Connections`: Cross-links to other modules and the Java guide.

---

## 5. Question bank format

```markdown
<a id="qNN-mm"></a>
### QNN.mm · Type · Title

<details>
<summary>Answer</summary>

**Short answer (30 seconds).** Direct, concise summary that answers the question immediately.

**Full explanation.** Deep conceptual explanation, internal mechanisms, diagrams or architecture.

**Code.** (Optional) Runnable snippet or output explanation.

**Follow-ups an interviewer will ask.**
- *Follow-up question 1?* Direct answer.
- *Follow-up question 2?* Direct answer.

**Trap to avoid.** The subtle misconception, incomplete answer, or outdated advice that candidates stumble on.

</details>
```

### Question types (mix in every module)
- `Concept`: Fundamental architectural understanding.
- `Difference`: Comparing two mechanisms, libraries, or approaches.
- `Output`: Predict exact printed lines or error messages. Short answer includes exact output + 1–2 sentences reasoning. Asserted by a lab test (`capsys` in pytest).
- `Bug hunt`: Identify concurrency bugs, memory leaks, or transaction failures in broken code.
- `Design`: Microservice or component architecture problem.
- `Trade-off`: Evaluating performance, complexity, latency, and resource costs.
- `Production scenario`: Diagnosing production outages, connection exhaustion, event loop starvation, or memory bloat.

---

## 6. Hands-on exercises format

```markdown
<a id="exNN-m"></a>
### Exercise NN.m · Title

**Problem.** Clear business and technical requirement.

**Constraints.** Strict bounds on libraries, dependencies, complexity, and performance.

**Acceptance criteria.**
- [ ] Criterion 1
- [ ] Criterion 2

<details><summary>Hint 1</summary>
Guidance without giving away the solution.
</details>

<details><summary>Hint 2</summary>
Deeper structural hint.
</details>

<details><summary>Worked solution</summary>

**Approach.** 1–2 sentences summarizing the architectural strategy.

```python
# Complete: labs/<lab>/tests/exNN_m_solution.py
...
```

**How each criterion is met.**
- *Criterion 1:* Explanation linking to test name `test_criterion_1`.
- *Criterion 2:* Explanation linking to test name `test_criterion_2`.

**Alternative approach:** A contrasting implementation method (e.g., synchronous worker vs background async task).
**Trade-offs:** When to choose each approach.

**Interviewer follow-ups.**
- *Follow-up question 1?* Answer.
- *Follow-up question 2?* Answer.

**Tests link:** [`labs/<lab>/tests/test_exNN_m.py`](../labs/<lab>/tests/test_exNN_m.py)

</details>
```

---

## 7. Code and snippet rules

### 7.1 Snippet kinds in markdown
Every fenced `python` code block must be one of:
1. **Complete:** Standalone runnable script or module. Marked with `# Complete: labs/...` or `<sub>Source: labs/...</sub>`.
2. **Excerpt:** Verbatim slice from a lab file. Marked with `# Excerpt of labs/...`.
3. **Partial:** Incomplete snippet for illustration (e.g., imports omitted). Marked with `# Partial: ...`.
4. **Output:** The printed stdout or exception traceback under an `Output` question, verified against pytest `capsys`.

### 7.2 Toolchain standards
- **Formatter & Linter:** `ruff format` and `ruff check`.
- **Type Checker:** `mypy` running with pinned Python 3.13.
  - In `labs/django`: `mypy` configured with the `django-stubs` plugin.
  - In `labs/fastapi` and `labs/python`: `mypy --strict`.
- **Injected Dependency limit:** At most 4 injected dependencies per class/function.
  - *What counts:* A constructor parameter receiving a collaborator object, a FastAPI `Depends()` parameter, or a service/repository/client collaborator in a view.
  - *What does NOT count:* Settings/config objects, ORM model managers (`Model.objects`), and standard library utilities (`datetime`, `logging`).
