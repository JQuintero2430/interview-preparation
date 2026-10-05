# Style Guide (read before writing any module)

Every worker reads this file and [`VERSIONS.md`](VERSIONS.md) before writing anything. When this file and a module disagree, this file wins.

## Voice and tone
- Write for a smart reader who has not seen this yet. The primary reader is a Java/Spring backend engineer (4 years) who also knows some Angular. The guide must still work for a complete React beginner and for someone preparing for staff level.
- Be direct, precise and a little opinionated. Say which option you would pick and why.
- Match the existing repo guides: a **"How to use this module"** blockquote at the top, **⚠️ Correction** callouts when popular advice is wrong, and a **summary** at the end of each part.
- Never present an uncertain claim as fact. When something is unverified, write `> **Unverified:** …` and say what to check.
- Do not label content by seniority. There are no "junior/mid/senior" headings or badges.

## Module file skeleton (required, in this order)

```markdown
# NN — Module Title

> **How to use this module.** One to three sentences. Simplest material first; stop when the depth exceeds what you need.

**Prerequisites:** [link](relative#anchor), …  (or "None")

---

## NN.1 First concept
… (repeat for each concept, using the "Concept pattern" below)

## Interview questions
## Coding exercises
## Gotchas & trick questions
## Common misconceptions / outdated advice
## Self-check
## Summary (re-read before the interview)

---

**Next:** [NN+1 — Title](NN+1-file.md) · **Related:** [link](…), [link](…)
```

## Concept pattern (every concept, in this order)
1. **The problem**: what breaks or hurts without it.
2. **Mental model**: an analogy, with a Java/Spring analogy where one helps, **and** a line on where the analogy breaks (`> **Where the analogy breaks:** …`).
3. **Minimal code**: runnable TypeScript.
4. **How it works internally.**
5. **Trade-offs**: when to use it, when not to, and what it costs.

Order the concepts in a module from the simplest mental model to the deepest internals.

## Origin tags
Put a tag on the first mention of each concept, and wherever confusion is likely:
`[JS]` `[TS]` `[Browser]` `[React]` `[React DOM]` `[Library: name]` `[Framework: Next.js]` `[Framework: React Router]` `[Backend: Spring]` `[Tooling: name]` `[Protocol: name]` (JWT, OAuth 2.0, OIDC, PKCE, OpenAPI, STOMP: standards, not Spring) `[System design]` `[Interview]`.
Example: "`AbortController` [Browser] cancels the fetch; the effect cleanup [React] calls it."

## Version notes box
```markdown
> **Version notes.** React 16.8: hooks introduced. React 18: automatic batching everywhere. React 19: … (cite VERSIONS.md)
```
Use one wherever behavior differs across versions.

### Legacy coverage (first-class, not a footnote)
Write for what companies actually run, not only the latest release. When a module touches any of the following, explain the older behavior properly in its version notes **and** its gotchas, and give the migration path to current:
- **React 18**: `ReactDOM.render` vs `createRoot`, automatic batching, Strict Mode double effects, `forwardRef`, `<Context.Provider>`, no Actions. React 16/17 and class components where relevant.
- **React Router v6/v7** including the `react-router-dom` package (removed in v8), and v5 (`Switch`, `component=`, `useHistory`) for recognition.
- **Next.js 13–15**: Pages Router (`getServerSideProps`/`getStaticProps`), `middleware.ts`, the implicit fetch/route caching of 13–14, and the uncached-by-default change in 15.
- **Legacy Redux** (hand-written action types, `connect`), **CRA**, **Enzyme**, **Jest** setups.

Assume the interviewer's codebase is one or two majors behind.

## Questions (active recall)
```markdown
**Q12. Why does `setCount(count + 1)` called three times only add one?**
<details><summary>Answer</summary>

Why it happens… **A strong answer adds:** …

</details>
```
- Show the question openly and hide the answer. Leave a blank line after `<summary>…</summary>` so the Markdown inside renders.
- Answers explain **why**, then add a "**A strong answer adds:**" line.
- Number questions per module (`Q1…`).

## Coding exercises
Each exercise uses these sections in order: **Statement** → **Approach** (mental model, then step-by-step) → `<details><summary>Hints</summary>` → `<details><summary>Solution</summary>` → **Walkthrough** → **Interviewer follow-ups** → **Tests** (link to the test file in `examples/`).

- **The Solution block contains the full solution code inline, plus a link to the file.** The file in `examples/` is the source of truth. The inline copy is a fenced block whose **first line is `// file: <path relative to the guide folder>`**, e.g. `// file: examples/web/src/m09-effects/Ticker.tsx`, followed by the file's exact contents. `examples/scripts/check-links.mjs` fails if they differ. Never hand-edit the inline copy: edit the file, and the coordinator regenerates every block with `node examples/scripts/check-links.mjs --sync`. **Workers** write the marker line followed by an empty body (` ```tsx ` / `// file: …` / ` ``` `); the sync fills it in. Supporting files the statement depends on (fakes, fixtures) use the same `// file:` format.
- Only use the `// file:` marker for whole files. Partial excerpts in the teaching sections carry no marker; name the file in prose.
- **Predict-the-output exercise (required in React modules 06–21).** At least one exercise asks the reader to predict log order or the rendered value after a sequence of interactions. The Solution is the test file that asserts the exact output, inline via `// file:`, and its expected values come **from actually running it**, never from memory. The Walkthrough explains each step. Model: 09 Exercise 5.

## Code rules
- Default to TypeScript. Show plain JS only when the difference is the point.
- Every non-trivial snippet lives in `examples/` and passes type-check, lint and tests. The Markdown names the path, e.g. `examples/web/src/m08-state/Counter.tsx`. Small snippets that are self-evidently complete may stay inline.
- Keep components small, low in branching, and built by composition and custom hooks.
- Examples code goes only under its module folder: `examples/web/src/mNN-<slug>/`. Workers **never** edit `package.json`, lockfiles or configs. Ask the coordinator for a new dependency.

## Endings (every module)
- **Gotchas & trick questions**: 10 or more.
- **Common misconceptions / outdated advice**: for each, state what was once true, what is true now, and since which version.
- **Self-check**: 5–10 quick items with collapsed answers.
- **Summary**: one paragraph.
- **Next / Related** footer links.

## Quantity floors (per module)
20+ interview questions (core React modules 06–17: aim for 30+) · 3+ coding exercises, one of them predict-the-output in modules 06–21 (01 JS and 26 machine coding: many more) · 10+ gotchas · at least one Mermaid diagram wherever a process, lifecycle or data flow is involved.

## Links and anchors
- **Heading text = the README outline title with any "( … )" aside removed.** So the outline entry "9.6 You might not need an effect (a catalogue)" becomes `## 9.6 You might not need an effect`. Because the rule is deterministic, other modules can link to a section before it is written.
- Section headings are numbered: `## 8.3 Batching`. GitHub's anchor for that heading is `#83-batching` (lowercase, punctuation dropped, spaces become `-`).
- When a claim was verified by running something (a test, ESLint, a grep of a package's dist), say so and name the file or package version. When it comes from docs, link the docs. Claims that are neither are marked `> **Unverified:**`.
- Use relative links only: `[batching](08-state.md#83-batching)`.
- The rapid-fire bank (28) and the glossary (29) link every entry back to its section.

## Mermaid
Use fenced ```` ```mermaid ```` blocks with `flowchart`, `sequenceDiagram` or `stateDiagram-v2`. Keep labels short, and put any label containing parentheses in quotes.
