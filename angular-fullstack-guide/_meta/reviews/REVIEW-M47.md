# REVIEW-M47: `modules/47-behavioral-and-interview-craft.md`

- **Reviewer:** a fresh reviewer subagent (claude-opus-5-5) of session S20261024-0835-claudecode. It wrote nothing in module 47 and continues none of the PLAN, SEC, EX, QB or CLOSE-M47 conversations, so it is eligible (RUN.md §4). It ran only the read-only commands listed under Runs. Job-state updates, the FIX rows in TASKS.md and every fix belong to the main session.
- **Date:** 2026-10-24.
- **Files read:**
  - the whole module (1,198 lines). Line numbers below are as of this review and will move at FIX time. Every fix quotes its text, and a fixer finds the line by that text, not by its number;
  - `_meta/modules/M47.md` (whole: lessons 1-25, Handoffs into 47, owned topics, questions not asked, Lab decision, F1-F7, C1-C12, section plans with their Must-state lines, Question notes, anchor candidates, Budget, For Jorge, and "Corrections found while writing" through QB-M47-02);
  - QUALITY-BAR (whole), STYLE-GUIDE §7.2 (snippet kinds), REVIEW-M46 (the format model);
  - the REVIEW-M47 block in TASKS.md (line 7894) and the REVIEW-M46 block (line 7584) with FIX-M46-01/02;
  - `SOURCES.md` `## Module 47` (all lines);
  - every module-47 lab file (`exercise-1-legacy-refactor/{legacy,a,b}/price-label.ts` and `exercise-1.test.ts`; `exercise-2-live-list/list-core.ts`, `{a,b}/list-core.ts` and `exercise-2.test.ts`; `src/outputs/47-behavioral-and-interview-craft/q47-09.test.ts`);
  - other modules, only for the owner statements the module relies on: 29:61 (§1 "A pure function needs no `TestBed`"), 44:959 (§8 version skew sentence), 45:136 (§2 five-part trade-off statement), 39:224 (§3 "v2 to v19 are no longer supported"), 41:790 (§6 tiebreaker), the `## 6.` heading of 31; the `### Q` headings of Q01.04, Q01.09, Q23.06, Q28.32, Q31.01, Q38.23, Q39.05, Q39.18, Q39.20, Q40.13, Q40.14, Q44.17, Q44.18, Q45.02, Q45.03, a topic grep of every `### Q` heading (story, behavioral, take-home, live coding, interviewer, legacy), the `### Exercise 46.2` heading, and every line in modules 01-46 that links `47-behavioral-and-interview-craft.md` (40:5, 40:1369, 40:1370, 45:5, 45:35, 45:685, 45:1225, 45:1226, 46:5, 46:2185, 46:2186);
  - `SYLLABUS.md` line 624 (what `MOCK-INTERVIEWS.md` and `CHEATSHEET.md` are planned to hold).
- **Sources re-read (2026-10-24):**
  - **This repository's backend guide** (`Backend Interview Study Guide - Data storage, behavioral & concurrency.md`): "How to use this" (lines 8-18, including "out loud, in English, as if someone were listening", "retrieval and articulation, not recognition" and "If you are preparing for interviews in a second language, this is not optional advice."), §6.5 (whole), §9 opening, structure and drill paragraphs (the drill: "set a two-minute timer, tell it out loud in English, and check that you said a result sentence before time ran out"), §9.1-§9.7 (whole), §10 (whole).
  - **sre.google** `sre-book/postmortem-culture/` (curl): section "Google's Postmortem Philosophy"; the four F3 sentences ("For a postmortem to be truly blameless …", "A blamelessly written postmortem assumes …", "If a culture of finger pointing …", "You can't "fix" people …") match the module word for word.
  - **retrospectivewiki.org** "The Prime Directive" (curl): the sentence matches, attributed "Norm Kerth, Project Retrospectives: A Handbook for Team Review".
  - **en.wikipedia.org** "Characterization test" (curl): the definition sentence (with "Golden Master Testing") and "This term was coined by Michael Feathers." match.
  - **`@angular/core` 22.2.1 typings** in `labs/angular/node_modules/@angular/core` (grep, read only): `package.json` version 22.2.1; `types/core.d.ts` `interface InputFunction` (line 122, with its `required` member), `declare const input: InputFunction` (227), `declare function computed<T>` (2438); `types/_chrome_dev_tools_performance-chunk.d.ts` `declare function signal<T>` and `update(updateFn: (value: T) => T): void` (28); `types/_debug_node-chunk.d.ts` `declare const Component: ComponentDecorator` (6927).
- **Basis of each finding:** a page or the backend guide read on the date above; an owner module's text; a committed lab file; or a read-only script.
- **Not re-read:** the owners' own tests; Kerth's and Feathers' books (not read by the plan either, C3).
- **Not run:** `npx tsc --noEmit` and the full lab suites (main ran both at CLOSE-M47); the Mermaid diagrams were not re-parsed (no finding touches a diagram).
- **Probe files:** none in the repository. The three page copies lived in `/Users/jorge.quintero/.claude/jobs/4a727236/tmp/review-m47`, deleted afterwards. The reviewer created only this file.

Overall, a careful module whose sources hold up. Every third-party quote matches its page today, F3 is "about incidents" and applied to code "as our advice", F4 is the wiki's quote of Kerth, F5 is Wikipedia's with "coined by Michael Feathers" as Wikipedia says, STAR carries "we claim no origin for it", and the backend guide is quoted as "its claim, which we do not verify" wherever it speaks about interviewers. Every sample story fence (13) carries "an example story (ours, not a real project; every number is an example number)" or "our suggestion". §9.4 keeps "lost or the outcome was mixed". Field p75 and lab numbers are always named apart (`grep -c 'p75 on\|INP on'` = 0; every performance fence has a "Field:" and a "Lab:" line). Q47.09 equals its test.

**Findings.**
- **One Major factual finding:**
  - F-1: §1 and Q47.02 paraphrase the guide's drill as a check that "a result sentence came first". The guide checks "that you said a result sentence before time ran out", and §1's own canonical rule puts the result last.
- **Three Minor factual findings:**
  - F-2: §2 Code steps 3 and 4 attribute to the guide what it does not say: "the story exists for it" and "the guide calls that the signal" (how you committed). The guide's signal is "whether you can disagree without becoming difficult to work with".
  - F-3: §7 quotes "this is not optional advice" without its referent (practising answers aloud).
  - F-4: the failure-mode lists of §5 and §6 are not labeled as our suggestions, and §4's label covers only its first bullet (lesson 5, C1). Their cost and signal claims about reviewers and interviewers read as fact.
- **Four Minor teaching findings:**
  - T-1: §2 Code step 2 ("End the migration on what you left alone"), step 4 (fixed in F-2) and the Summary ("a migration ends on what you left alone", "an incident puts mitigation first") contradict the result-last rule and the incident skeleton's order.
  - T-2: §3's Mental model has no analogy (B3; the plan's surveyor's report was dropped).
  - T-3: Q47.08's Full explanation only routes (to Q39.18, Q40.14 and §2) and teaches nothing of its own about telling the story "when it went well and when it did not".
  - T-4: two follow-ups give a result without its reason (Q47.09 "the product rounds to `100`", Q47.15 "You forgot the number").
- **Seven nits**, and the anchor handoffs (5 rows).

**REVIEW-M44/M45/M46 patterns (counted over all 28 misconceptions, 30 Q follow-ups, 15 traps, 15 Full explanations, every Code step list and 4 exercise follow-ups):**
- follow-ups or traps without a reason: 2 follow-ups (T-4), 0 traps;
- misconception corrections without the true belief: 0; causes missing: 0 (28 of 28 "Cause:");
- Full explanations that route without teaching: 1 (Q47.08, T-3); ending on a bare link: 1 (Q47.05, N-1);
- Code steps that do not hold: 2 (§2 steps 2 and 4, against the result-last rule; T-1 and F-2);
- failure-mode lists without a signal: 0 (§1, §3, §4, §5 and §6 give a signal per mode).

**Advice check (C1).** A grep for interviewer(s), company, recruiter, hiring, always, never, most, usually, typical, standard, expect and reviewer, read hit by hit. The only fact-like statements about reviewers and interviewers are in the unlabeled failure lists of §4 (bullets 2-4), §5 and §6 (F-4). "Interviewers write down outcomes" (§1, Q47.01) is the guide's claim, and the module says it does not verify it; "These are scored" (§6) is "the backend guide's claim, not a fact about interviews". The other hits are advice worded as advice ("our advice", "our reasoning", "our suggestion"), our diagrams, our lab, or misconception corrections inside sections framed as advice.

**Items left to this review by earlier sessions, settled:**
- **C7 (Partial snippets' Angular APIs):** `input.required`, `signal` with `update`, `computed` and `Component` exist in 22.2.1 (above). `@for`, `track` and `@empty` are template syntax owned by 18 §2, linked. No status marker is needed (owners' stable APIs).
- **"Deliberate change proved by a test, not by F7":** `exercise-1.test.ts` asserts `Math.round(1.005 * 100)` is `100`, `legacyLabel(1.005)` is `'USD 1.00'` and `label(1.005)` is `'USD 1.01'` in both variants. The module cites only that test (Exercise 47.1 step 4, Q47.09 follow-up).

**Plan facts found wrong or superseded:** M47.md §2 Code plan step (3) "end the disagreement on how you committed, because that is the beat F1 names as the signal" is the origin of F-2's second half; F1 names a different signal. M47.md's rung-3 wording was already corrected at SEC-M47-07 ("memory", not "time").

**Prose:** 9,024 words now (`module-stats.mjs` and the QUALITY-BAR python counter, both run read-only by the reviewer, agree; equal to the CLOSE value). The fixes add about +184, for about **9,208, inside the 9,300 ceiling** (92 words of slack). Each FIX states its cap below.

## Runs (the reviewer, Node 24.21.0, 2026-10-24 08:37)

- `labs/ts-js`: `npx vitest run src/modules/47-behavioral-and-interview-craft src/outputs/47-behavioral-and-interview-craft`: 3 files, 27/27 passed (Exercise 47.1: 6 criteria × 2 variants; Exercise 47.2: 7 × 2; Q47.09: 1).
- `node labs/tools/check-snippets.mjs . 47`: all snippets check out.
- `node labs/tools/check-links.mjs --planned`: all links resolve (231 to planned files).
- `node labs/tools/module-stats.mjs . 47`: 15 Q, 2 Ex, 9,024 prose words; types Design 6, Concept 4, Bug hunt 2, Trade-off 2, Output 1; no flags. The QUALITY-BAR python one-liner: 9,024.
- `grep` over the `@angular/core` 22.2.1 typings (above); `curl` of the three pages (above).

No lab file change is requested; every finding is a Markdown text change (plus one SOURCES.md line for F-1, and three other modules' link targets for the handoffs).

## Reviewer's read-only script results

- **Markup:** B1 7 of each of the six subsections, 7 `mermaid` fences and 7 "What to notice" lines; D1 15 of each answer part; 28 misconceptions, 28 "Cause:"; `<!-- `, `Unverified`, `relink` 0; `p75 on` / `INP on` 0.
- **Exercise anatomy (E1):** Problem, Constraints, Acceptance criteria, Hints (2 and 1), Worked solution, How each criterion is met, Alternative approach with Trade-offs, Interviewer follow-ups (2 each), Tests: present in both.
- **Cited tests:** criteria equal their `it(…)` titles in both exercises (Exercise 47.1's third criterion with its quoted labels); `describe.each(['a', 'b'])` in both; Q47.09's test title starts with its ID.
- **Exercise accounts re-derived from the tests:** Exercise 47.1: ten pinned rows, eight unchanged, `1.005` → `USD 1.01` and `2.675` → `USD 2.68`, `-USD 5.00` at 150, `''` for `NaN` and both infinities, `length` 3. Exercise 47.2: `'  ANN '` → `r1`, `r3`, `r5`; name ascending `r1 r3 r2 r4 r6 r7 r5`; name descending ends `r1 r3`; `'an'` leaves 5 rows and page 3 becomes page 2 with `r7`, `r5`; `'zzz'` gives page 1 of 1, total 0. All match the text.
- **Q47.09 re-run against its answer:** the test asserts `['EUR 17.99', 'USD 1.00', '-USD 5.00', 'EUR 7.00', 'EUR 6.30']` for the five calls in the order the question prints them; the short answer lists the same five labels in the same order, and its reason (binary rounding by `toFixed`, no clamp on the discount) matches `legacy/price-label.ts`.
- **Determinism:** no `Math.random`, `Date`, `fetch(`, `Intl`, `toLocale` or storage call in any module-47 lab file (read).
- **D6:** 15/15 question IDs linked from the body. Four answers do not link back to the section they rely on (N-2).
- **External URLs:** 3 in the module, all in SOURCES.md `## Module 47`.
- **Example labels:** 13 story or bank fences, each labeled ours with example numbers; the narration, README, review-call and question fences are labeled "our suggestion".

## QUALITY-BAR

45 items: **41 Pass, 4 Partial (B3, C1, F1, F4), 0 Fail.** H3 rests on the main session.

| ID | Result | Evidence |
|---|---|---|
| A1 | Pass | Lines 3-9 in order, Labs with the run command. |
| A2 | Pass | Prerequisites "none"; helpful links anchored to 45 §1 and 46 §1. |
| A3 | Pass | §1, §2, §4; Q47.01, .03, .07, .10, .15; Summary. |
| A4 | Pass | 7 sections and the five closing parts. |
| A5 | Pass | Story shape → story types → legacy → live coding → take-home → questions → the follow-up ladder (deepest last). |
| B1 | Pass | 7 × 6 (script). |
| B2 | Pass | Each opens on a concrete failure (ninety seconds of setup, "we made the app faster", "spaghetti" and broken month-end totals, silent typing, twenty hours on a four-hour brief, "what's your tech stack?", "40% faster" with no source). |
| B3 | Partial | 7 diagrams, each with "What to notice"; analogies in §1, §2, §4, §5, §6, §7; §3 has none (T-2). |
| B4 | Pass | Each "How it actually works" answers a "why" from the guide, F3-F5, an owner or stated reasoning (why the result goes last, why the distinctive beat, why blame hides issues, why a running increment, why the README, why each question maps to a cost, why a number needs its kind). |
| B5 | Pass | Every `### Code` has an approach line or numbered steps with reasons; §1, §4, §5 and §6 put the steps after the fence, as earlier modules do. |
| B6 | Pass | §1-§3 and §7 bullets have "because" or a reason clause; §4-§6 give a cost per failure mode. |
| B7 | Pass | 28/28 with the true belief and a cause. |
| B8 | Pass | Coming from the backend in §2 with "Where the analogy breaks"; Framework vs platform not required (STYLE-GUIDE §6). |
| B9 | Pass | Terms defined at first use (behavioral question, STAR, result sentence, story bank, story skeleton, baseline, field data, lab measurement, mitigation, root cause, abandoned hypothesis, version skew, legacy code, blame-free account, quirk, deliberate change, characterization test, live-coding round, increment, checkpoint, take-home, time box, definition of done, gold-plating, practice, support window, real-user monitoring, rollback, follow-up ladder, rung, defensible number, confounder, project story). |
| B10 | Pass | Owners get a sentence and a link: 08 §6, 31 §1, 44 §8/§9, 37 §6/§10, 39 §3/§9/§10, 28 §11, 45 §1/§2, 46 §1, 15 §2, 17 §3, 18 §2, 23 §2, 29 §1, 30 §1/§6, 36 §12, 11 §1, 41 §4/§6, 44 §7, 38 §1. |
| C1 | Partial | 30 of 34 sampled claims match; see F-1, F-2 (two claims), F-3, and F-4 (advice labels). |
| C2 | Pass | Q47.09 equals its assertion (reviewer's run). |
| C3 | Pass | Every lab statement names its exercise or test. |
| C4 | Pass | No marker needed (stable owner APIs; no new Angular claim). |
| C5 | Pass | `input.required`, `signal`, `computed`, `Component` in 22.2.1 typings. |
| C6 | Pass | 0 `Unverified`. |
| C7 | Pass | `check-snippets . 47` passes; the §3 Excerpt omits one whole statement (allowed by STYLE-GUIDE §7.2). |
| C8 | Pass | 3/3 URLs in SOURCES.md. |
| D1 | Pass | 15 × 5 parts, two answered follow-ups each (T-4 counts two thin reasons). |
| D2 | Pass | Q47.09 gives the lines and a reason sentence. |
| D3 | Pass | 5 tags, largest 6 of 15 (40%); Trade-off, Design, Bug hunt present. |
| D4 | Pass | Q47.01-15 follow §1-§7. |
| D5 | Pass | The 15 owner questions in the REVIEW-M47 block are not re-asked (headings read); §9.1-§9.7's prompts are not re-asked as written (Q47.03-05 are front-end versions); Exercise 46.2 not rebuilt (linked twice as the server-side version). |
| D6 | Pass | 15/15 (N-2 adds four back-links). |
| D7 | Pass | 15 anchors. |
| D8 | Pass | 15 = floor = ceiling. |
| E1 | Pass | Full anatomy in both. |
| E2 | Pass | 13/13 criteria equal their titles, both variants. |
| E3 | Pass | A pinned refactor of one function → a core built in increments with edges and wired into a component. |
| E4 | Pass | 26 exercise tests pass (reviewer's run); no `any`; `tsc` is main's (CLOSE-M47). |
| E5 | Pass | One Output question (not binding on Part G). |
| F1 | Partial | Three paragraphs link all seven sections; "a migration ends on what you left alone" and "an incident puts mitigation first" do not match §2's skeleton (T-1). |
| F2 | Pass | Three prompts, each naming a listener. |
| F3 | Pass | Five flashcards. |
| F4 | Partial | Builds on, Read next and Comparisons give reasons; "Uses these ideas later" gives none (N-6). |
| G1 | Pass | 9,024 now, about 9,208 after fixes, ceiling 9,300; no redundancy found worth cutting. |
| G2 | Pass | 4/4 SYLLABUS §4 (47) checkboxes (M47.md breadth gate, re-walked). |
| H1 | Pass | Reviewer's Vitest run above; `tsc` at CLOSE-M47 (main). |
| H2 | Pass | `check-links --planned` passes (reviewer's run). |
| H3 | Pass (main) | Main checks `git status`. |

Totals: **41 Pass, 4 Partial (B3, C1, F1, F4), 0 Fail.**

## Module-specific checks

| Check | Result | Evidence |
|---|---|---|
| Claims about interviews, interviewers, companies, recruiters or hiring are advice, a quote attributed to the guide, or a named, dated read (C1) | Partial (F-4) | Advice check above: the §4 (bullets 2-4), §5 and §6 failure lists are unlabeled. |
| Every sample story and story number labeled ours | Pass, one nit | 13 fences labeled; the bank row "we now version assets" disagrees with the incident story it names (N-3). |
| STAR's origin not claimed (C2) | Pass | "we claim no origin for it" (§1). |
| §9, §9.2-§9.5, §9.7, §10 and §6.5 re-read and quoted whole where quoted, with their conditions | Partial (F-1, F-2, F-3) | §9's structure paragraph whole; §9.4's "lost or the outcome was mixed" kept (§2, Q47.05); §9.2, §9.5, §9.7, §10 and §6.5 ("(abridged)") match. The drill is paraphrased wrongly (F-1); two Code steps attribute what the guide does not say (F-2); the "not optional advice" quote loses its referent (F-3). |
| sre.google re-read; F3 quoted whole; applied to code only as our application | Pass | All four sentences whole in §3 under "Google's Postmortem Philosophy"; "That is about incidents; we apply the same principle to talking about code, as our advice"; Q47.07 the same. |
| Retrospective Wiki and Wikipedia re-read, cited as those sites (C3) | Pass | "The Retrospective Wiki … quotes Norm Kerth (book not read)"; "[Wikipedia] (read 2026-10-23)" and "(his book was not read)". |
| §9 and §10 linked, not duplicated; §9.1-§9.7 prompts not re-asked | Pass, one nit | §1 "The seven prompts (§9.1 to §9.7) are not retold here"; §6 "we repeat none of them", except the ownership row's follow-up, which is close to §10's "How do decisions get made and recorded …" (N-5). |
| Field p75 and lab numbers never fused | Pass | `grep -c 'p75 on\|INP on'` = 0; every performance fence names "Field:" and "Lab:" separately; Q47.03's trap and §2's How it works say a field "before" and a lab "after" do not compare. |
| Every failure-mode list gives a signal in the room | Pass | §1 (4), §3 (2), §4 (4), §5 (4), §6 (4). Q47.06 and Q47.11 give cost and fix and link §2 and §4, where the signals are canonical (Judged acceptable). |
| Exercise 47.1's legacy file named our example; deliberate change proved by a test | Pass | File header and the module ("our example of legacy code"); the test asserts `Math.round(1.005 * 100)` is `100` and the new label. |
| Q47.09 against a re-run of its test | Pass | 1/1 passed; five labels equal, same order. |
| Every Partial snippet's Angular API in 22.2.1 typings (C7) | Pass | See Sources re-read. |
| Handoff lines into 47 honored | Pass | 45:35 and 45:685 → §4 (machine coding = live coding, 45 §1 linked; Q45.02 linked from Q47.10 and Connections, not re-asked); 45:1225 and 46:2185/2186 → §7 (project story, 46 §1 and 45 §2 linked once); M46.md:118 → §4 "When the task is a pure function, test it first"; 40:1369 → §7 (Q40.13 owns the structure, not restated); 40:1370 → §3 (Q40.14) and §2's migration skeleton. |
| Q01.04 … Q45.03 not re-asked; Exercise 46.2 not rebuilt | Pass | Headings read. Q47.09 uses `1.005` inside our legacy function and links Q01.04 for why (Judged acceptable). |
| Anchor proposal per "Read next" or body link into 47 | Pass | 5 rows (Handoffs). |
| Follow-ups and traps with a reason; corrections with true belief and cause; Full explanations teach first and last; Code steps hold for every branch | Partial | 2 follow-ups (T-4); 0 traps; 0 corrections; Q47.08 routes only (T-3), Q47.05 ends on a bare link (N-1); §2 steps 2 and 4 (T-1, F-2). |
| Every Must-state fact present or moved as CLOSE recorded | Pass | §1-§7 re-walked against M47.md: all present; none moved. |
| Canonical-statement rule (lesson 18) | Pass | STAR weighting in §1 (Q47.01 quotes the guide's sentence as its answer); skeletons in §2; blame-free wording and F3/F4 in §3 (Q47.07 quotes one F3 sentence and links §3); loop in §4; README in §5 (Q47.13 links it); ladder in §7 (Q47.15 links it). Owners' statements (45 §2's five parts, 46 §1's template, Q40.13's steps, 39 §10's program, Q01.04's output) are linked, not restated. |
| Prose at most 9,300 after fixes | Pass | About 9,208. |

## Handoffs

Module 47 slugs, from the `## N.` headings as in Contents:
- S4 `#4-live-coding-an-angular-task-clarify-say-the-plan-build-in-working-increments-narrate-and-recover-when-stuck`
- S7 `#7-under-the-hood-how-one-story-is-drilled-into-numbers-you-can-defend-and-telling-a-design-or-a-migration-as-your-own-project`

Re-located on 2026-10-24: today 0 links into 47 carry an anchor (`grep -c '47-behavioral-and-interview-craft.md#'` is 0 in 40, 45 and 46). Each find text below occurs once in its file. Fenced pairs: the first line is the text to find, the second its replacement (fenced so the link checker does not read this file's copy).

| Target | Link (module:line), 5 rows, +0 words |
|---|---|
| S4 | 45:35 (45 §1 body: "A **machine-coding round** has you build one component live; [47] owns it.") |
| S4 | 45:685 (Q45.02 Full explanation: "machine coding against the clock ([47] owns etiquette)") |
| S7 | 45:1225 ("**Read next:**" … "[47] (telling it in a behavioral round)") |
| S7 | 46:2185 ("**Read next:**" … "[47] (telling a case study in a behavioral round)") |
| S7 | 40:1369 ("**Read next:**" … "[47. Behavioral interviews and interview craft] (telling the "why Angular" story)") |

```text
A **machine-coding round** has you build one component live; [47](47-behavioral-and-interview-craft.md) owns it.
A **machine-coding round** has you build one component live; [47](47-behavioral-and-interview-craft.md#4-live-coding-an-angular-task-clarify-say-the-plan-build-in-working-increments-narrate-and-recover-when-stuck) owns it.
machine coding against the clock ([47](47-behavioral-and-interview-craft.md) owns etiquette)
machine coding against the clock ([47](47-behavioral-and-interview-craft.md#4-live-coding-an-angular-task-clarify-say-the-plan-build-in-working-increments-narrate-and-recover-when-stuck) owns etiquette)
[47](47-behavioral-and-interview-craft.md) (telling it in a behavioral round)
[47](47-behavioral-and-interview-craft.md#7-under-the-hood-how-one-story-is-drilled-into-numbers-you-can-defend-and-telling-a-design-or-a-migration-as-your-own-project) (telling it in a behavioral round)
[47](47-behavioral-and-interview-craft.md) (telling a case study in a behavioral round)
[47](47-behavioral-and-interview-craft.md#7-under-the-hood-how-one-story-is-drilled-into-numbers-you-can-defend-and-telling-a-design-or-a-migration-as-your-own-project) (telling a case study in a behavioral round)
[47. Behavioral interviews and interview craft](47-behavioral-and-interview-craft.md) (telling the "why Angular" story)
[47. Behavioral interviews and interview craft](47-behavioral-and-interview-craft.md#7-under-the-hood-how-one-story-is-drilled-into-numbers-you-can-defend-and-telling-a-design-or-a-migration-as-your-own-project) (telling the "why Angular" story)
```

(Pairs 1-3 are in `modules/45-frontend-system-design-method.md`, pair 4 in `modules/46-system-design-case-studies.md`, pair 5 in `modules/40-framework-comparisons.md`.) Each link keeps its text; only the target gains the slug. Stay file-level: the `:5` "Leads to" lines of 40, 45 and 46, and every "Uses these ideas later" line (40:1370, 45:1226, 46:2186), as M47.md lesson 24 and REVIEW-M46 kept them. These are M47.md's anchor candidates exactly.

## Factual findings

**F-1 · Major (C1; lesson 3 and 8, a quote's condition inverted) · §1 How it actually works (53) and Q47.02 follow-up (667).**
- The guide's drill: "set a two-minute timer, tell it out loud in English, and check that you said a result sentence before time ran out." The module says "a check that a result sentence came first" (§1) and "checking a result sentence came first" (Q47.02). Most readers will take "first" as the first sentence, which inverts the rule §1 states as canonical two paragraphs above ("must be stated explicitly as the last thing you say") and that the diagram, Code and Summary repeat. SOURCES.md records the drill as "paraphrased"; quoting it removes the ambiguity.
- Why Major: it teaches the opposite of the module's central rule in the one place that tells the reader how to practise.
- Fix, two places in the module (+13) and one SOURCES.md line (fenced pairs, first line find, second replacement):

```text
Its drill is a two-minute timer and a check that a result sentence came first.
Its drill: a two-minute timer, the story told out loud, and a check "that you said a result sentence before time ran out".
Aloud against a two-minute timer, checking a result sentence came first: the guide's drill,
Aloud against a two-minute timer, checking "that you said a result sentence before time ran out": the guide's drill,
the drill (two-minute timer, a result sentence) paraphrased
the drill quoted ("that you said a result sentence before time ran out")
```

  (The third pair is in `SOURCES.md`, `## Module 47`, first line.)

**F-2 · Minor (C1; lesson 1, a claim attributed to the guide that it does not make) · §2 Code steps 3 and 4 (140-141).**
- Step 3: "because the guide says the story exists for it". §9.2 says the abandoned hypothesis shows "reasoning from evidence rather than ego" and that "a story where you were immediately right teaches them nothing"; it does not say the story exists for it.
- Step 4: "End the disagreement on how you committed, because the guide calls that the signal." §9.4's signal is "whether you can disagree without becoming difficult to work with"; how you committed is evidence for it, not the signal. The step also ends the story on a beat that the fence and diagram place before the result (T-1).
- Fix (+16):

```text
3. Put the abandoned hypothesis mid-incident, because the guide says the story exists for it.
3. Put the abandoned hypothesis mid-incident, because the guide says a story where you were immediately right "teaches them nothing".
4. End the disagreement on how you committed, because the guide calls that the signal.
4. Put how you committed just before the disagreement's result, because it shows the guide's signal: "whether you can disagree without becoming difficult to work with".
```

**F-3 · Minor (lesson 8, a quote without its referent) · §7 How it actually works, "In a second language" (571).**
- The module quotes "If you are preparing for interviews in a second language, this is not optional advice." The guide's "this" is the sentence before it: say your answer out loud before reading. Quoted alone, "this" reads as §9.7's advice, which it is not.
- Fix (+6):

```text
and its "How to use this": "If you are preparing
and its "How to use this", on answering out loud before reading: "If you are preparing
```

**F-4 · Minor (C1; lesson 5, "each signal is labeled as our suggestion") · §4, §5 and §6 Best practices (372, 443, 515).**
- §1 opens its list with "Four ways it goes wrong, each with a cost and a signal (our suggestions):". §4 labels only its first bullet; §5 and §6 carry no label, so sentences such as "**No README** costs the first impression" and "**Asking what the ad answers** costs credibility; the signal is "that's in the posting"" state reviewers' and interviewers' reactions as fact.
- Fix (+40): insert §1's lead-in line, then a blank line, above each list; drop §4's per-bullet label. Fenced: each find line, then its replacement (the replacement is three lines: lead-in, blank line, bullet).

```text
- **Silence** costs the interviewer's evidence; the signal is "what are you doing?" (our suggestion).
Four ways it goes wrong, each with a cost and a signal (our suggestions):

- **Silence** costs the interviewer's evidence; the signal is "what are you doing?".
```

```text
- **Overrunning the time box** costs trust in your scoping
Four ways it goes wrong, each with a cost and a signal (our suggestions):

- **Overrunning the time box** costs trust in your scoping
```

```text
- **A generic question** costs you the evidence; the signal is a one-sentence answer.
Four ways it goes wrong, each with a cost and a signal (our suggestions):

- **A generic question** costs you the evidence; the signal is a one-sentence answer.
```

## Teaching findings

**T-1 · Minor (lesson 7, a step that contradicts the rule; F1 Summary) · §2 Code step 2 (139) and the Summary (617).**
- §1's canonical rule and every §2 fence end on the result. Step 2 says "End the migration on what you left alone"; the Summary says "a migration ends on what you left alone". The Summary also says "an incident puts mitigation first", while §2's skeleton, both incident fences and the flashcard put mitigation after how you found out and the abandoned hypothesis, and before the root cause.
- Fix (+4; step 4 is fixed in F-2):

```text
2. End the migration on what you left alone, because
2. Put what you left alone just before the migration's result, because
a migration ends on what you left alone, an incident puts mitigation first, a disagreement is lost or mixed
a migration names what you left alone, an incident puts mitigation before the root cause, a disagreement is lost or mixed
```

**T-2 · Minor (B3, mental model with an analogy) · §3 Mental model (229).**
- Every other section's Mental model has an analogy (lab notebook, clinic case file, pilot's checklist, a shed and a house, a used car, a witness). §3 has none; M47.md planned a surveyor's report.
- Fix (+28): append one sentence after the definition of a deliberate change.

```text
a **deliberate change** alters one on purpose, as its own visible step.
a **deliberate change** alters one on purpose, as its own visible step. Think of a surveyor's report on an old house: it says the wiring met the rules of its decade and what to replace first, and blames no electrician.
```

**T-3 · Minor (REVIEW-M44 T-1, a Full explanation that only routes) · Q47.08 (820).**
- The Full explanation is two routing sentences (Q39.18, Q40.14, §2). The title asks how to tell the story "when it went well and when it did not"; only the Short answer and a follow-up touch it.
- Fix (+17), fenced:

```text
Tell it with [§2](#2-four-front-end-stories-a-performance-win-a-migration-a-production-incident-and-a-disagreement-over-architecture)'s migration beats.
Tell it with [§2](#2-four-front-end-stories-a-performance-win-a-migration-a-production-incident-and-a-disagreement-over-architecture)'s migration beats: the options weighed then, why the team chose, your part, and the result, good or mixed, stated last.
```

**T-4 · Minor (lesson 6, a follow-up without its reason; 2 of 30) · Q47.09 (851) and Q47.15 (992).**
- Q47.09: "No: the product rounds to `100`" gives the result, not why. The Full explanation already says the stored value is just below 1.005.
- Q47.15: "Say so and give the method, "rather than inflating the number" (the guide)" gives the instruction, not the reason.
- Fix (+25):

```text
No: the product rounds to `100` (Exercise 47.1's test).
No: the stored value is just below 1.005, so the product is just below 100.5 and rounds to `100` (Exercise 47.1's test).
- *You forgot the number.* Say so and give the method, "rather than inflating the number" (the guide).
- *You forgot the number.* Say so and give the method, "rather than inflating the number" (the guide), because the method can still be checked and an inflated figure cannot.
```

**Nits** (each a fenced find/replace pair; texts with relative links are fenced so the link checker does not read this file's copy)
- **N-1 (REVIEW-M44 T-1, ends on a bare link):** Q47.05 Full explanation (747). (+17)

```text
Micro-frontends ([Q38.23](38-architecture-and-production-structure.md#q38-23)) fit.
The example is a micro-frontends debate ([Q38.23](38-architecture-and-production-structure.md#q38-23) owns when they pay); it shows how you argued, not which option wins.
```

- **N-2 (D6, answer does not link back to its section):** Q47.01 (635), Q47.03 (679), Q47.04 (712), Q47.05 (745). (+4)

```text
A listener cannot note an outcome left unsaid.
A listener cannot note an outcome left unsaid ([§1](#1-the-behavioral-round-what-a-story-is-evidence-of-star-with-the-weight-on-action-and-an-explicit-result-and-a-story-bank)).
Name the metric and its kind, then baseline, bottleneck, change and proof it held, with the result last.
Name the metric and its kind, then baseline, bottleneck, change and proof it held, with the result last ([§2](#2-four-front-end-stories-a-performance-win-a-migration-a-production-incident-and-a-disagreement-over-architecture)).
Tell it in order: how you found out, the abandoned hypothesis, mitigation, root cause, prevention, result.
Tell it in order: how you found out, the abandoned hypothesis, mitigation, root cause, prevention, result ([§2](#2-four-front-end-stories-a-performance-win-a-migration-a-production-incident-and-a-disagreement-over-architecture)).
The decision, your position as a trade-off statement, your evidence, a lost or mixed outcome, and how you committed.
The decision, your position as a trade-off statement, your evidence, a lost or mixed outcome, and how you committed ([§2](#2-four-front-end-stories-a-performance-win-a-migration-a-production-incident-and-a-disagreement-over-architecture)).
```

- **N-3 (example consistency; 44 §8 "keep the old chunks"):** §1 story-bank fence (78). The row names §2's incident, whose prevention is "Deploys keep the previous release's chunks"; "we now version assets" is a different fix, and hashed chunk names do not prevent skew on their own. (0, inside a fence)

```text
Fixed in 25 minutes; we now version assets
Fixed in 25 minutes; deploys keep old chunks
```

- **N-4 (attribution):** Q47.05 follow-up (766). The escalation answer is the guide's §9.4 ("escalating on the specific risk, in writing, without making it personal"). (+3)

```text
Escalate the specific risk in writing, without making it personal, because a named risk can be checked.
Escalate the specific risk in writing, without making it personal (the guide's answer), because a named risk can be checked.
```

- **N-5 (§10 linked, not repeated):** §6 table, Ownership row (504). Its follow-up is close to §10's "How do decisions get made and recorded for people who aren't in the room?", while §6 says "we repeat none of them". (0, inside a fence; the cell is the row's last column, so no alignment changes)

```text
How is a decision recorded?
Which decision was last reversed?
```

- **N-6 (F4, link without a reason; lesson 17):** Connections (1197). SYLLABUS line 624 plans `MOCK-INTERVIEWS.md` as full mocks "with model answers and scoring notes". (+11)

```text
(both planned), the root practice files, file-level.
(both planned): mocks to rehearse these stories and rounds aloud, and a sheet to re-read before one; file-level.
```

- **N-7 (typo, double space):** §4 How it actually works (327). (0)

```text
test it first:  [29
test it first: [29
```

## Judged acceptable

- **Q47.06 and Q47.11 list cost and fix without a signal:** each is a Bug hunt on drafts or a replay, and links §2 or §4, where the signals are canonical (lesson 18).
- **Q47.09 uses `1.005`, the Q01.04 output:** it asks for five labels of our legacy function, links Q01.04 for why and does not re-explain binary rounding.
- **Q47.03 "Vitals are judged on field data at p75 … ([Q31.01])":** the overlap rule assigns Q31.01 to Q47.03; 08 §6 is linked in §2 for p75.
- **§3's Excerpt drops `expect(Math.round(1.005 * 100)).toBe(100);`:** STYLE-GUIDE §7.2 allows omitting whole statements; Exercise 47.1 step 4 states the assertion.
- **"Verified: `Q47.09`":** the test title begins with the ID (C2 names tests by ID).
- **Exercise 47.1 changes two rows (`1.005`, `2.675`) for "one quirk":** both are the same half-cent quirk; the criterion title names `1.005` only, and the account names both.
- **§2 incident skeleton puts the abandoned hypothesis before mitigation, while §6.5 says "Stabilize first, diagnose second":** the example's hypothesis is a quick check that picks the mitigation; mitigation still comes before the root cause, which is what the guide's sentence separates. T-1 aligns the Summary with this order.
- **"a manager, a peer engineer and a designer" (§6, Q47.14):** not ambiguous with an owner module (lesson 23 targets "owner").
- **§5's analogy is one sentence (a shed and a house):** short, but present.
- **Q47.05's example outcome ("leadership chose micro-frontends for a second team") meets the candidate's own revisit condition:** labeled "a mixed outcome" in an example story; it still shows committing after losing.
- **Steps after the fence in §1, §4, §5, §6 (B5):** the steps and reasons are there; earlier reviews accepted this placement.

## Claims sampled (34)

| # | Claim (location) | Basis | Result |
|---|---|---|---|
| 1 | §9 structure paragraph, three sentences (§1) | backend guide §9 | Match |
| 2 | "A negative result stated clearly beats a good result left implied." (§1, Q47.01) | §9 | Match |
| 3 | "Interviewers write down outcomes …" as the guide's claim (§1, Q47.01) | §9 | Match |
| 4 | The drill (§1, Q47.02) | §9 drill paragraph | Inverted (F-1) |
| 5 | "out loud, in English, as if someone were listening"; "retrieval and articulation, not recognition" (§1) | How to use this | Match |
| 6 | §9.2 abandoned-hypothesis sentence (§2) | §9.2 | Match |
| 7 | §9.4 "lost or the outcome was mixed" and "Stories where you were right …" (§2, Q47.05) | §9.4 | Match |
| 8 | §9.5 mechanism list and "An unsupported metric …" (§2, §7, Q47.06, Q47.15) | §9.5 | Match |
| 9 | §6.5 "Stabilize first, diagnose second" (abridged) and "extends outages" (§2, Q47.04) | §6.5 | Match |
| 10 | "the guide says the story exists for it" (§2 step 3) | §9.2 | Not said (F-2) |
| 11 | "the guide calls that the signal" (how you committed; §2 step 4) | §9.4 | Different signal (F-2) |
| 12 | §9.3 means list and "What did you leave alone, and why?" (§3, Q47.07) | §9.3 | Match |
| 13 | §9.3 "any answer is fine if you have a reason" (Q47.08) | §9.3 | Match |
| 14 | §9.4 "how you knew when to stop" (Q47.05) | §9.4 follow-ups | Match |
| 15 | §9.5 rung 3 "complexity, memory, money" and rung 4 (§7, Q47.15) | §9.5 follow-ups | Match |
| 16 | §9.5 "say so and describe the method rather than inflating the number" (§7) | §9.5 | Match |
| 17 | §9.7 "ask people to repeat or rephrase when you need it." (§4, §7) | §9.7 | Match |
| 18 | "this is not optional advice" as second-language advice (§7) | How to use this | Referent dropped (F-3) |
| 19 | §10 "These are scored …" and "The one worth asking everyone separately." (§6) | §10 | Match |
| 20 | §5 "have the mechanism ready" as §9.5's (§5) | §9.5 | Match |
| 21 | F3 four sentences, "Google's Postmortem Philosophy" (§3, Q47.07) | sre.google | Match |
| 22 | F4 sentence, Kerth attribution (§3) | retrospectivewiki.org | Match |
| 23 | F5 definition and "coined by Michael Feathers" (§3) | Wikipedia | Match |
| 24 | Version skew sentence (§2) | 44:959 (44 §8) | Match |
| 25 | Five-part trade-off statement (Q47.05; §2 and Q47.05 positions have all five) | 45:136 (45 §2) | Match |
| 26 | "A pure function needs no `TestBed`" (§4) | 29:61 (29 §1) | Match |
| 27 | v19 "no longer supported" (§2 migration fence, 39 §3) | 39:224 | Match |
| 28 | Bundle budget is 31 §6 (§7 fence) | 31 `## 6.` heading | Match |
| 29 | Ties leave the order undefined (Exercise 47.2 follow-up) | 41:790 (41 §6) | Match |
| 30 | `input.required`, `signal().update`, `computed`, `Component` (§4, Exercise 47.2 Partials) | 22.2.1 typings | Match |
| 31 | Q47.09's five labels and reason | `q47-09.test.ts`; `legacy/price-label.ts` | Match (re-run) |
| 32 | Exercise 47.1 accounts (ten rows, two `now`, `length` 3, `Math.round(1.005 * 100)` is `100`) | `exercise-1.test.ts` | Match |
| 33 | Exercise 47.2 accounts (filter, four orders, pages, clamp, empty, frozen rows) | `exercise-2.test.ts` | Match |
| 34 | Failure-mode costs and signals stated as advice (§4-§6) | C1, lesson 5 | Unlabeled (F-4) |

30 match; 4 findings (F-1 row 4, F-2 rows 10-11 counted once, F-3 row 18, F-4 row 34).

## Proposed FIX tasks

The module is at 9,024 words. All fixes together add about +184: F about +75 (F-1 +13, F-2 +16, F-3 +6, F-4 +40); T about +74 (T-1 +4, T-2 +28, T-3 +17, T-4 +25); nits about +35 (N-1 +17, N-2 +4, N-3 0, N-4 +3, N-5 0, N-6 +11, N-7 0). That gives about **9,208, inside the 9,300 ceiling**. Each FIX caps its own measured delta; if a fixer passes its cap, it shortens only its own added clauses, never a quote, a cause, a "because" or a link. Main adds the rows and blocks to TASKS.md (this reviewer edited no job file):

```
| FIX-M47-01 | S | todo | REVIEW-M47 |  |
| FIX-M47-02 | S | todo | REVIEW-M47 |  |
| FIX-M47-03 | S | todo | REVIEW-M47 |  |
```

- **FIX-M47-01 · S · Sonnet (texts prescribed).** F-1, F-2, F-3, F-4, T-1, T-2, T-3, T-4 (§1, §2, §3, §4, §5, §6, §7, Summary, Q47.02, Q47.08, Q47.09, Q47.15). Files: `modules/47-behavioral-and-interview-craft.md`; `SOURCES.md` (F-1's one line in `## Module 47`); `_meta/LOG.md` (its own line). Cap +160 (expected +149). Acceptance, in the module unless noted (count before → after): `grep -c 'came first'` 2 → 0; `grep -c 'before time ran out'` 0 → 2; `SOURCES.md`: `grep -c 'the drill (two-minute timer, a result sentence) paraphrased'` 1 → 0 and `grep -c 'before time ran out'` 0 → 1; `grep -c 'the story exists for it'` 1 → 0; `grep -c 'calls that the signal'` 1 → 0; `grep -c 'whether you can disagree without becoming difficult to work with'` 1 → 2; `grep -c 'on answering out loud before reading'` 0 → 1; `grep -c 'Four ways it goes wrong, each with a cost and a signal (our suggestions):'` 1 → 4; `grep -c 'End the migration on\|ends on what you left alone'` 2 → 0; `grep -c 'mitigation before the root cause'` 0 → 1; `grep -c "surveyor's report"` 0 → 1; `grep -c 'good or mixed, stated last'` 0 → 1; `grep -c 'just below 100.5'` 0 → 1; `grep -c 'an inflated figure cannot'` 0 → 1; `node labs/tools/check-links.mjs --planned` and `node labs/tools/check-snippets.mjs . 47` exit 0; `module-stats.mjs . 47` at most 9,184.
- **FIX-M47-02 · S · Sonnet (texts prescribed).** N-1 to N-7 (§1 bank fence, §4, §6 table, Q47.01, Q47.03, Q47.04, Q47.05, Connections). Files: the module; `_meta/LOG.md` (its own line). Runs after FIX-M47-01 (same file; the texts are disjoint). Cap +40 (expected +35). Acceptance: `grep -c '](#1-the-behavioral-round'` 6 → 7; `grep -c '](#2-four-front-end-stories'` 8 → 11; `grep -c 'not which option wins'` 0 → 1; `grep -c 'we now version assets'` 1 → 0; `grep -c "(the guide's answer)"` 0 → 1; `grep -c 'How is a decision recorded'` 1 → 0; `grep -c 'the root practice files'` 1 → 0; `grep -c 'first:  \[29'` 1 → 0; check-links and check-snippets exit 0; `module-stats.mjs . 47` at most 9,300.
- **FIX-M47-03 · S · Haiku (mechanical; slugs and texts listed under Handoffs).** Anchors for the 5 links into 47. Files: `modules/40-framework-comparisons.md`, `modules/45-frontend-system-design-method.md`, `modules/46-system-design-case-studies.md`; `_meta/LOG.md` (its own line). No FIX changes a module-47 heading, so it may run in any order. Acceptance: `grep -c '47-behavioral-and-interview-craft.md#'` 40: 0 → 1, 45: 0 → 3, 46: 0 → 1; `grep -c '47-behavioral-and-interview-craft.md)'` 40: 3 → 2, 45: 5 → 2, 46: 3 → 2; `node labs/tools/check-links.mjs --planned` exits 0; +0 prose words in each file.

## For Jorge

1. **One Major, already fixed in text by FIX-M47-01.** §1 and Q47.02 told the reader to check that the result sentence "came first", the opposite of the module's own rule. The fix quotes the backend guide's drill word for word.
2. **The ceiling holds.** About 9,208 after fixes against 9,300; no trim task is needed.
3. **Anchors on body links.** FIX-M47-03 anchors two body links in module 45 (45:35, 45:685) as well as the three "Read next" lines, as M47.md lesson 24 and For Jorge 5 planned (following REVIEW-M46 For Jorge 3). Say so if you want the body links left file-level.
4. **Carried open, no FIX:** the module rests on this repository's backend guide for every claim about how rounds are scored; no company page was read (M47.md C1, For Jorge 3). The sibling React guide's `27-interview-execution.md` is still not cross-cited (M47.md For Jorge 4).
