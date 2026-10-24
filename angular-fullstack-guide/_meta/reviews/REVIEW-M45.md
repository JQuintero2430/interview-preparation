# REVIEW-M45: `modules/45-frontend-system-design-method.md`

- **Reviewer:** a fresh reviewer subagent (claude-opus-5-5) of session S20261022-1759-claudecode. It wrote nothing in module 45 and continues none of the PLAN, SEC, EX, QB or CLOSE-M45 conversations, so it is eligible (RUN.md §4). It ran no build and no test suite. The main session owns execution, and its runs are the basis below. The reviewer read files, ran read-only scripts and fetched sources. Job-state updates and every fix belong to the main session.
- **Date:** 2026-10-22.
- **Files read:**
  - the whole module (1,227 lines). Line numbers below are as of this review and will move at FIX time. Every fix quotes its text, and a fixer finds the line by that text, not by its number;
  - `_meta/modules/M45.md`: lessons 1-28, Handoffs into 45, owned topics, questions not asked, Lab decision, F1-F10, C1-C15, the section plans with their Must-state lines, Question notes, anchor candidates, For Jorge, and "Corrections found while writing" through QB-M45-02;
  - QUALITY-BAR, STYLE-GUIDE (as needed), and REVIEW-M44 (the format model);
  - the module-45 common rules and the REVIEW-M43, REVIEW-M44 and REVIEW-M45 blocks in TASKS.md;
  - the LOG lines of PLAN-M45 through CLOSE-M45;
  - `SOURCES.md` `## Module 45` (line 3169 on, grepped);
  - every module-45 lab file:
    - `concepts/` (seven models and seven `section-N` tests);
    - `exercise-1-screen-estimate/` (`screen.ts`, `a/`, `b/`, the test);
    - `exercise-2-board-sync/` (`board-sync.ts`, `a/`, `b/`, the test);
    - `src/outputs/45-frontend-system-design-method/q45-07`, `q45-09` and `q45-14.test.ts`;
  - other modules, only for the owner statements the module relies on (08 §6, 09 §4 and §9, 31 §1, 37 §4, §5 and §10, 41 §5, 42 §8), their `### Q` headings, and the lines that link `45-frontend-system-design-method.md`. These are 11, 28, 31, 32, 33, 38, 40 and 44.
- **Sources re-read (2026-10-22):** fetched into `/Users/jorge.quintero/.claude/jobs/4a727236/tmp/review-m45`, which was deleted afterwards.
  - **w3.org.** WCAG 2.2:
    - the status line "W3C Recommendation 12 December 2024";
    - SC 2.5.7 Dragging Movements (Level AA), whose full text matches §6's quote;
    - SC 2.5.8 Target Size (Minimum) (Level AA): "The size of the target for pointer inputs is at least 24 by 24 CSS pixels, except when:" and then the Spacing and Equivalent exceptions;
    - SC 2.4.11 Focus Not Obscured (Minimum) (Level AA);
    - SC 2.1.1 Keyboard (Level A).
  - **w3.org.** Understanding SC 2.5.7 (non-normative), "Relationship to keyboard accessibility requirements": keyboard equivalence "does not automatically meet this success criterion, unless that equivalent keyboard operation also provides controls that can be clicked or tapped with a pointer".
  - **rfc-editor.org.** RFC 9110, plain text:
    - §13.1.1: "An origin server MUST use the strong comparison function when comparing entity tags for If-Match (Section 8.8.3.2)";
    - §13.1.1: the paragraph "An origin server that evaluates an If-Match condition MUST NOT perform …", with the MAY 412 and MAY 2xx branches and the lost-response rationale;
    - §15.5.13, first sentence;
    - §8.8.3.2 Comparison.
  - **developer.mozilla.org.**
    - `BroadcastChannel`: Baseline widely available "since March 2022"; "any browsing context of a given origin"; "except the object that sent the message".
    - Background Synchronization API: "Limited availability"; secure contexts only; "defer tasks so that they can be run in a service worker once the user has a stable network connection".
    - `Navigator.onLine`: "returns whether the device is connected to the network".
    - browser-compat-data `api.SyncManager`: Chrome 49, Edge 79, Opera 36 and Samsung Internet 5.0; Firefox and Safari no.
  - **c4model.com.**
    - The home page: the first sentence, the four diagram levels, "Notation independent", and "written by its creator Simon Brown".
    - `/abstractions/container`: "A container is essentially a runtime boundary around some code that is being executed or some data that is being stored", and "Not Docker!".
  - **greatfrontend.com** (third-party prep site). `front-end-system-design-playbook/evaluation-axes`:
    - the six axes;
    - the "never verbalized" sentence;
    - the page is framed around front-end system design and does not mention machine coding.
  - **`npm pack`** (extracted, read, deleted):
    - `lighthouse@13.5.0`:
      - `core/config/constants.js` sets `throttling.mobileSlow4G` and `throttlingMethod: 'simulate'`;
      - `core/config/desktop-config.js` sets `desktopDense4G`;
      - `package.json` pins `@paulirish/trace_engine` 0.0.65.
    - `@paulirish/trace_engine@0.0.65`:
      - `models/trace/lantern/simulation/Constants.js` gives `mobileSlow4G` 150 ms, `1.6 * 1024` and `cpuSlowdownMultiplier: 4`, and `desktopDense4G` 40 ms, `10 * 1024` and 1. The comment reads "These values align with WebPageTest's definition of "Fast 3G" / But offer similar characteristics to roughly the 75th percentile of 4G connections.";
      - `Simulator.js` uses `throughputKbps * 1024`;
      - `TCPConnection.js` uses `this.throughput / 8`.
  - **`labs/angular/node_modules`** (read only): `@angular/ssr` 22.2.1 `types/ssr.d.ts` `declare enum RenderMode { Server = 0, Client = 1, Prerender = 2 }`, with its three doc comments.
  - **This repository:** the backend guide §7 sentence, through M45 F9 and the module's quote. The file itself was not re-opened.
- **Basis of each finding:** a W3C, RFC Editor, MDN, c4model.com or third-party page read on the date above; a package source at its version; an owner module's text in this repository; a committed lab file; or a read-only script.
- **Not re-read.** Their basis is the SEC/EX/QB LOG lines and SOURCES.md:
  - `@angular/service-worker` 22.2.1 `ngsw-worker.js` (no `sync` listener; this review used 37 §4's statement);
  - the owners' own tests in 08, 09, 27, 28, 31, 32, 36, 37, 41-44.
- **Not run:** the Mermaid diagrams were not re-parsed (main parsed 8/8 at CLOSE-M45), and `tsc` was not run.
- **Probe files:** none in the repository. Sources, tarballs and read-only search scripts lived in the job tmp dir above, which was deleted. The reviewer created only this file and edited `_meta/TASKS.md`.

Overall, this is a careful module, and every direction fact it owns is right:
- RFC 9110 §13.1.1 is stated with all three outcomes and the strong comparison;
- `BroadcastChannel`'s sender exclusion and same-origin scope match MDN;
- SC 2.5.7 is quoted verbatim, with its level, and kept apart from 2.1.1 (the Understanding page backs the split);
- Lighthouse's profile numbers and the unit match the tarballs;
- the three `RenderMode` names match the 22.2.1 typings;
- C4's levels and its container definition match c4model.com, and §2 says in so many words that a C4 container is not an Angular container component.

**Capability per implementation.** Background Sync is "limited availability" for the browser API and "that package's gap" for Angular's worker. **Our models.** Every lab header names its model as ours, and no test reads the clock, uses randomness, opens a socket or touches real storage or channels. **Output answers.** Q45.07, Q45.09 and Q45.14 equal their assertions.

**Findings.**
- **One Major factual finding, F-1.** The module writes its performance requirement as "LCP, INP and CLS good at p75 on `mobileSlow4G`" in five places (§3's fence and a misconception, Q45.06 twice, the Summary). That ties a field percentile to a lab profile. The owners say otherwise:
  - 08 §6: the vitals "are judged on field data at the 75th percentile";
  - 31 §1: "a lab load without interaction has no INP".

  The module's own §3 also calls the profile "lab numbers, not field data". The fix splits the requirement into field targets at p75 and a lab budget on a named profile.
- **Four Minor factual findings:**
  - F-2: Q45.13's `index.html` follow-up promises that "a deploy shows at once", though an installed service worker keeps serving its own copy (09 §9).
  - F-3: §8's Code step 1 says `decide` "never performs a stale write", but under last-write-wins the same function applies it.
  - F-4: the flashcard says the writing tab does not receive its message. MDN excludes the sending object.
  - F-5: Q45.02 applies the prep site's design-round sentence to machine coding. The page does not mention machine coding, and Q45.02 calls it "the prep site above" with no prep site above.
- **Three Minor teaching findings:**
  - T-1: KB means 1,024 bytes in §3 and Q45.07 but 1,000 in §6 and Exercise 45.1, so the same assumed first screen is 239,616 bytes in one place and 234,000 in another.
  - T-2: two misconception corrections do not state the true belief.
  - T-3: two Full explanations end in bare links (Q45.15, Q45.16).
- **Six nits**, and the anchor handoffs (4 rows).

**REVIEW-M44 patterns:**
- 0 follow-ups or traps without a reason (all 34 follow-ups and 17 traps read);
- 2 thin misconception corrections (T-2);
- 2 Full explanations that route without teaching (T-3);
- 2 Code steps that are wrong or without an approach (F-3, N-6).

**Advice check (C1).** No sentence states a company's practice as fact. One sentence stretches a third-party source past its scope (F-5).

**Items left to this review by earlier sessions, settled:**
- **C2, RADIO:** still not named, as C2 allows. The module names two of F8's six axes and the "never verbalized" sentence, both dated and labeled third-party.
- **C6, Background Sync browsers:** §8's "lists Chrome and Edge" is true of browser-compat-data (Opera and Samsung Internet are listed too). The sentence does not claim the list is complete, so it is judged acceptable.
- **C7, GraphQL:** Q45.10 makes no GraphQL claim and links Q32.23, as C7 requires when unread.

**Plan facts found wrong or superseded:**
- M45.md's §3 plan line and Q45.06 note already carried the "p75 on a named profile" wording that F-1 corrects.
- The anchor candidates include two lines that call themselves "all file-level" (32:2286, 38:2041). See Handoffs.

**Prose:** 8,061 words now (`module-stats.mjs`, main's run; the QUALITY-BAR python counter, re-run read-only, agrees). The fixes add about +190, for about 8,250. That is under the REVIEW ceiling of 8,460.

## Runs (main session, Node 24, 2026-10-22 17:59; the reviewer ran none)

- `labs/ts-js`: `npx vitest run src/modules/45-frontend-system-design-method src/outputs/45-frontend-system-design-method`: 12 files, 55/55 passed. This includes `q45-07`, `q45-09` and `q45-14.test.ts`.
- `node labs/tools/check-links.mjs --planned`: all resolve (199 links to planned files).
- `node labs/tools/check-snippets.mjs . 45`: all snippets check out.
- `node labs/tools/module-stats.mjs . 45`: module 45 = 17 Q, 2 Ex, 8,061 prose words; types Design 5, Concept 4, Output 3, Bug hunt 2, Trade-off 2, Difference 1; no flags.

No lab file change is requested; every finding is a Markdown text change. F-1 edits a `text` fence, so the FIX tasks re-run `check-snippets`. The anchor work changes link targets, so it re-runs `check-links`.

## Reviewer's read-only script results

- **Markup:**
  - B1: 8 of each of the six subsections, 8 `mermaid` fences and 8 "What to notice" lines.
  - D1: 17 of each answer part.
  - 33 misconceptions carry 33 "Cause:".
  - `Unverified`, `relink:`, `TASK` and `PLACEHOLDER`: 0.
- **Status markers:** 2, both from dated MDN reads that match today: `BroadcastChannel` [Baseline 2022: widely available] and Background Synchronization [Baseline: limited availability]. There is no Angular-style marker, and none on a WCAG, RFC, C4, Lighthouse or third-party fact.
- **Cited tests:**
  - every backticked test title exists verbatim;
  - the `Section N:` counts are 4, 4, 4, 4, 3, 4 and 5 (28);
  - Exercises 45.1 and 45.2 have 12 of 12 criteria equal to their `it(…)` titles, under `describe.each(['a', 'b'])`;
  - 28 + 12 + 12 + 3 = 55, which equals main's run.
- **Determinism (C12):** no `Date.now`, `new Date()`, `Math.random`, `setTimeout`, `fetch(`, `localStorage`, `indexedDB`, `new BroadcastChannel`, `performance.now`, `process.env` or `child_process` in any module-45 lab file. The single grep hit is a comment in `state-placement.ts`.
- **Contracts:** both `http` fences open "# Illustrative contract, not a lab API" and show `If-Match` on the write (lesson 28). There are no Java and no YAML fences.
- **D6:** 17/17 question IDs are linked from the body.
- **External URLs:** one, the MDN Baseline glossary, which is in SOURCES.md `## Module 45`.
- **Arithmetic re-done:**
  - the mobile profile moves 209.7152 bytes/ms;
  - 20 KiB takes 97.66 ms and 2 MiB takes 10,000 ms;
  - 2,500 − 450 − 200 = 1,850 ms gives 387,973 bytes;
  - Q45.07's 239,616 bytes give 1,592.58 ms on mobile and 302.81 ms on desktop.

## QUALITY-BAR

45 items: **38 Pass, 7 Partial (B5, B7, B10, C1, D1, D2, F1), 0 Fail.** H1-H3 rest on the main session.

| ID | Result | Evidence |
|---|---|---|
| A1 | Pass | Lines 3-9 in order, with the Labs run command. |
| A2 | Pass | The prerequisites are anchored: 28 §1, 31 §1 and 31 §10. |
| A3 | Pass | §1, §3, §8; Q45.01, .03, .06, .13, .16; Summary. |
| A4 | Pass | 8 sections and the five closing parts. |
| A5 | Pass | Interview → communication → requirements → components → state and API → performance and accessibility → rendering and caching → failure, offline and consistency. |
| B1 | Pass | 8 × 6 (script). |
| B2 | Pass | Each opens on a concrete failure: shards with no requirement, minute 35 still on the tree, phones waiting on three sequential requests, a per-card fetch waterfall, filters lost on reload, a chunk waterfall, an old title after a reload, a vanished concurrent edit. |
| B3 | Pass | 8 diagrams of the planned types (7 `flowchart`, 1 `sequenceDiagram`), each with "What to notice" (main parsed 8/8). |
| B4 | Pass | Each "How it actually works" answers a "why" from a named source: F9's evaluation sentence, C4's notation independence, Lantern's unit, reference-equality cost, the placement order, 2.5.7 against the Understanding page, layer freshness, and §13.1.1's three outcomes. |
| B5 | Partial | Every `### Code` has an approach and numbered steps. §8 step 1 misstates its own function (F-3), and §7 step 1 gives no reason (N-6). |
| B6 | Pass | Every best-practice bullet has "because" or a reason clause (the two in §6 use a colon clause). |
| B7 | Partial | 33/33 have a cause. Two corrections do not state the true belief (§1 "one right architecture", §8 Background Sync; T-2). One cause is ambiguous ("owners", N-1). |
| B8 | Pass | "Coming from the backend" in §1 (required) and §4, each with "Where the analogy breaks". "Framework vs platform" in §7 (required). |
| B9 | Pass | Terms are defined at first use per section (system design round, checkpoint, zoom level, network profile, RTT, simulated throttling, entity, request waterfall, source of truth, cursor, windowing, cache key, outbox, precondition, read-your-writes …). |
| B10 | Partial | Owners get a sentence and a link. The p75 requirement contradicts 08 §6 and 31 §1 (F-1), and the `index.html` follow-up contradicts 09 §9 (F-2). |
| C1 | Partial | 43 of 50 sampled claims match; see F-1 to F-5 and N-2. |
| C2 | Pass | Q45.07, Q45.09 and Q45.14 print exactly their assertions. |
| C3 | Pass | Every "in our model" result has a named test. Lighthouse, WCAG, RFC, MDN and C4 facts are dated reads. |
| C4 | Pass | Two MDN Baseline markers; none on other facts. |
| C5 | Pass | `RenderMode.Prerender`, `Server` and `Client` exist in `@angular/ssr` 22.2.1. No other Angular API is used in a snippet. |
| C6 | Pass | 0 `Unverified`. |
| C7 | Pass | `check-snippets` passes (main's run). |
| C8 | Pass | The one URL is in SOURCES.md. No new source is needed by the fixes. |
| D1 | Partial | 17 × 5 parts, and at least two follow-ups, each with a reason. Q45.15 and Q45.16 end their Full explanations in bare links (T-3). |
| D2 | Partial | All three give lines and reasons. Q45.07's assumed sizes mean 1,024-byte KB without saying so, while Exercise 45.1 uses 1,000 for the same screen (T-1). |
| D3 | Pass | 6 tags, with the largest at 29%. |
| D4 | Pass | Q45.01-17 follow §1-§8. |
| D5 | Pass | None of the 30 owner questions the block lists is re-asked (headings compared). Q45.13 asks every layer and links Q27.21 and Q09.22; Q45.16 asks per-interaction policy and links Q28.28; Q45.10 asks the screen read and links Q44.02. |
| D6 | Pass | 17/17. |
| D7 | Pass | 17 anchors. |
| D8 | Pass | 17 ≤ 18, ≥ 15. |
| E1 | Pass | Full anatomy in both, with two answered follow-ups each. |
| E2 | Pass | 12/12 criteria equal their titles, in both variants. |
| E3 | Pass | A pure function over a request graph → a stateful data layer with offline, conflicts and two tabs. |
| E4 | Pass | Main's runs; no `any`; classes take one ports object. |
| E5 | Pass | Q45.07, Q45.09, Q45.14 (not binding on Part F). |
| F1 | Partial | Two paragraphs link all eight sections, but repeat F-1's conflated requirement ("numbers at p75 on a named profile"). |
| F2 | Pass | Four prompts, each naming a listener. |
| F3 | Pass | Five flashcards. Flashcard 4 conflates tab and object (F-4), counted under C1. |
| F4 | Pass | Builds on gives a reason per link (lesson 27). Read next, Uses later and Comparisons give reasons. |
| G1 | Pass | 8,061 ≤ 8,143 (the CLOSE limit after recorded overruns); about 8,250 after fixes, ≤ 8,460. |
| G2 | Pass | 4/4 SYLLABUS §4 (45) checkboxes mapped (M45.md breadth gate, re-walked against the headings). |
| H1 | Pass (main) | Main's runs above. |
| H2 | Pass (main) | `check-links --planned` passes. |
| H3 | Pass (main) | Main checks `git status`. |

Totals: **38 Pass, 7 Partial (B5, B7, B10, C1, D1, D2, F1), 0 Fail.**

## Module-specific checks

| Check | Result | Evidence |
|---|---|---|
| Interview claims are advice, F9 or F8 (C1) | Pass, one finding | 0 sentences state a company's or interviewer's practice as fact. The §2 and Q45.03 claims about what is scored cite the backend guide (F9), and Q45.02's short answer says "Our suggestion, as no official page was read". One follow-up applies F8 beyond its scope (F-5). |
| WCAG 2.2 SC 2.5.7, 2.5.8, 2.4.11 verbatim with levels; 2.5.7 not conflated with 2.1.1 | Pass, one nit | 2.5.7 is verbatim, with Level AA. 2.5.8 is abridged and says so (N-5, punctuation). 2.4.11 is not in reader text, as M45.md Corrections recorded (not a Must-state fact). §6 and Q45.12 keep 2.1.1 separate, and the Understanding quote is tagged non-normative. |
| RFC 9110 §13.1.1 all three outcomes, strong comparison, §15.5.13 | Pass, one nit | All three branches and "MUST use the strong comparison function" are quoted. The subject is an "origin server", not "a server" (N-4). §15.5.13 matches. `consistency.ts` cites §8.8.3.2 for the comparison, which matches. |
| MDN `BroadcastChannel`, Background Sync | Pass, one finding | Baseline 2022, same origin, sender excluded, and limited availability all match. The flashcard narrows "the object that sent" to "the writing tab" (F-4). |
| Lighthouse 13.5.0 profiles; called a simulation | Pass, two nits | Values, file, unit and `simulate` match, and §3 says "lab numbers, not field data". The profile comment is half-quoted, with "Fast 3G" dropped (N-2). "Lighthouse slows it 4 times" holds for the mobile profile only (N-3). |
| `RenderMode` names vs `@angular/ssr` 22.2.1 | Pass | `Server`, `Client`, `Prerender`; §7 links 32 §3 as their owner. |
| C4 levels and container; no C4 container equated with an Angular container | Pass | Verbatim definition, four levels, attribution; §2's contrast sentence. |
| Direction facts (lesson 16) | Pass | §13.1.1's outcomes, the sender exclusion, 2.5.7 versus 2.1.1, `mobileSlow4G` with simulate as the default, and the nearest-first layer order all match their sources. |
| Capability or denial tied to an implementation or our model (lesson 17) | Pass | Background Sync (browser API, limited) and Angular's worker (no `sync` listener, "that package's gap"); `BroadcastChannel` same-origin, so devices need a stream; CDK's missing keyboard path (36 §6). The field merge refusing with 412 is said to be our model's (in the lab header). |
| Models and fakes named as ours (C11) | Pass | Every lab header says "our model" or names "our in-memory fakes". The prose says "our estimator", "our model", "our cache model" and "our channel". |
| Q45.07, Q45.09, Q45.14 vs their tests | Pass | 2, 6 and 5 lines equal the assertions; main's run passes. |
| REVIEW-M44 T-1/T-2/T-4 and B5 patterns | Partial | 0 follow-ups or traps without a reason; 2 thin corrections (T-2); 2 bare-link Full explanations (T-3); 1 wrong Code step and 1 without a reason (F-3, N-6). |
| Must-state facts present or moved as CLOSE recorded | Pass | §1-§8 all present (re-walked against M45.md). |
| Canonical statements (lesson 19) | Pass | The steps are in §1, the profiles in §3, SC 2.5.7 in §6, the layer order in §7 and RFC 9110 in §8. Q45.06, Q45.07, Q45.12, Q45.13, Q45.16, Q45.17 and both exercises link back. |
| Handoffs into 45 honored | Pass | 11:1598 → §6; 28:2792 → §5 and Q45.09; 31:2012 → §6 and Q45.12; 32:2286 → §7; 38:2041 → §4 and Q45.08; 40:1369 → §4; 40:1370 → §5 and §7; 44:1985 → §8 and Q45.15. 33:2129 ("security in a design") is not in M45.md's list; §2's trust boundary and Q45.05 cover it, and it stays file-level. |
| Owner questions not re-asked | Pass | See the D5 row. |
| Prose ≤ 8,460 after fixes | Pass | About 8,250. |

## Handoffs

Module 45 slugs, from the `## N.` headings as in Contents:
- S4 `#4-component-architecture-data-model-and-data-flow-from-screens-to-a-component-tree-and-a-client-side-model`
- S5 `#5-state-and-api-design-where-each-piece-of-state-lives-and-the-api-the-screens-need`
- S6 `#6-performance-and-accessibility-as-design-steps-budgets-a-loading-plan-long-lists-and-keyboard-and-pointer-paths`
- S8 `#8-under-the-hood-failure-modes-observability-offline-levels-and-consistency-choices`

The links were re-located on 2026-10-22. Each row below has exactly one link to `45-frontend-system-design-method.md` on its line. Today, 0 links into 45 from other modules carry an anchor.

| Target | Links (module:line), 4 rows, +0 words |
|---|---|
| S4 | 40:1369 ("**Read next:** `[45. Frontend system design method]`" … "(a framework choice inside a design answer)") |
| S5 | 28:2792 ("**Read next:**" … "`[45. Front-end system design method]`" … "(state in a design answer)") |
| S6 | 31:2012 ("**Read next:**" … "`[45. Frontend system design method]`" … "(performance as one part of a design)") |
| S8 | 44:1985 ("**Read next:** `[45]`" … "(system-design answers)") |

Each link keeps its text; only the target gains the slug. A fixer finds each line by its link and nearby text. Line numbers are as of this review.

The following stay file-level:
- the `:5` "Leads to" header lines of 28, 31, 32, 38, 40 and 44;
- the "Uses these ideas later" lines 11:1598, 28:2793, 31:2013, 32:2286, 33:2129, 38:2041, 40:1370 and 44:1986. These follow REVIEW-M44's precedent, which kept every "Uses these ideas later" line file-level.

**Deviation from M45.md's anchor candidates.** M45.md listed 32:2286 → §7, 38:2041 → §4 and 11:1598 → §6 as well. 32:2286 ends "all file-level and not yet written" and 38:2041 ends "all file-level", so anchoring one link would make each line's own words false, and the other links on those lines (44, 46) stay file-level. 11:1598 is a bare list of eleven modules with no reason per link.

## Factual findings

**F-1 · Major (C1, B10; owners 08 §6 and 31 §1) · the performance requirement ties a field percentile to a lab profile.**
- The module writes "LCP, INP and CLS good at p75 on `mobileSlow4G`" or "a number at p75 on a named profile" in five places: §3's assumptions fence (239), §3's misconception (252), Q45.06's short answer (764) and Full explanation (766), and the Summary (651).
- The owners say the vitals "are judged on field data at the 75th percentile" (08, the line after its §6 thresholds and its Summary), and that "a lab load without interaction has no INP" (31 §1). §3 itself says the profile drives "lab numbers, not field data". Lighthouse's own comment says the profile only has "similar characteristics to roughly the 75th percentile of 4G connections".
- So "INP at p75 on `mobileSlow4G`" cannot be measured or checked: p75 is over real visits, and a simulated load has no INP. This is the module's central requirement example, repeated in the Summary, so it is graded Major.
- Fix, in five places. Find each by its quoted text:
  - §3 fence: "Non-functional: LCP, INP, CLS good at p75 on mobileSlow4G; WCAG 2.2 AA; phones and desktops" → "Non-functional: LCP, INP, CLS good at field p75; first screen within budget on mobileSlow4G (lab); WCAG 2.2 AA; phones and desktops" (fence, 0 prose).
  - §3 misconception: "A requirement is a number at p75 on a named profile." → "A requirement is a number: vitals at field p75, a lab budget on a named profile." (+6)
  - Q45.06 short answer: "Write non-functional requirements as numbers at p75 on a named profile." → "Write non-functional requirements as numbers: vitals at field p75, a lab budget on a named profile." (+5)
  - Q45.06 Full explanation (+15). Find the first line and replace it with the second. The texts are in a fence so the link checker does not read this file's copy of the links:

```text
Speed becomes "LCP, INP and CLS good at p75 on `mobileSlow4G`" ([08 §6](08-browser-rendering-dom-events.md#6-core-web-vitals-lcp-inp-and-cls));
Speed becomes "LCP, INP and CLS good at field p75" ([08 §6](08-browser-rendering-dom-events.md#6-core-web-vitals-lcp-inp-and-cls)) plus a first-screen budget on `mobileSlow4G`, a lab profile, where a load has no INP ([31 §1](31-performance.md#1-measure-first-the-loop-lab-versus-field-and-what-each-tool-answers));
```
  - Summary: "Write requirements as numbers at p75 on a named profile" → "Write requirements as numbers: vitals at field p75, budgets on a named lab profile" (+3)

**F-2 · Minor (C1, B10; owner 09 §9) · Q45.13 follow-up (949).**
- The text reads "*Why does `index.html` differ?* `no-cache` makes it revalidate, so a deploy shows at once", followed by a link to 09 §4.
- The question is about every layer, including the service worker. 09 §9 says "returning users keep the old shell: the old worker still controls their pages", and Angular's worker serves `index.html` "from the version" (37 §5). `no-cache` governs only the HTTP cache.
- Fix (+18). Replace the first line below, the whole follow-up line, with the second:

```text
- *Why does `index.html` differ?* `no-cache` makes it revalidate, so a deploy shows at once ([09 §4](09-web-networking-storage-security.md#4-http-caching)).
- *Why does `index.html` differ?* `no-cache` makes the HTTP cache revalidate it ([09 §4](09-web-networking-storage-security.md#4-http-caching)), so without a service worker a deploy shows on the next load; an installed worker keeps serving its own copy until it updates ([09 §9](09-web-networking-storage-security.md#9-service-workers-and-the-pwa-manifest)).
```

**F-3 · Minor (C1, B5) · §8 Code step 1 (592).**
- The text reads: "1. `decide` never performs a stale write."
- The excerpt right below opens `if (policy === 'last-write-wins') return 'applied';`, and `Section 8: last-write-wins loses the first of two concurrent edits` asserts a stale write applied. The step is true only for the conditional and field policies, and it gives no reason.
- Fix: "1. `decide` never performs a stale write." → "1. `decide` applies every write under last-write-wins; under the conditional and field policies it never performs a stale one, because §13.1.1 says MUST NOT." (+18)

**F-4 · Minor (C1; lesson 17, scope of a denial; F3) · Flashcard 4 (1210-1212).**
- The text reads: "What does the writing tab not receive?" / "Its own `BroadcastChannel` message, so it applies its change itself."
- MDN excludes "the object that sent the message". A second `BroadcastChannel` object of the same name in the same tab does receive it. The flashcard turns the object into the tab, which only our fake (one channel per tab) makes equal.
- Fix: the summary "What does the writing tab not receive?" → "What does the sending `BroadcastChannel` object not receive?" (+2). The answer "Its own `BroadcastChannel` message, so it applies its change itself." → "Its own message (MDN: every listener \"except the object that sent the message\"), so the writing tab applies its change itself." (+7)

**F-5 · Minor (C1; M45.md C1, F8 scope) · Q45.02 follow-up (688).**
- The text reads: "- *Why state assumptions in machine coding?* The prep site above says unspoken reasoning does not count."
- The greatfrontend.com evaluation-axes page (read 2026-10-22) is about front-end system design and does not mention machine coding. Q45.02 also names no prep site above this line; Q45.01 does.
- Fix (+12). Replace the whole line with:

```text
- *Why state assumptions in machine coding?* Our suggestion: an interviewer can credit only reasoning they hear; the prep site's "never verbalized" sentence ([§1](#1-the-front-end-system-design-interview-what-it-evaluates-its-formats-and-how-it-differs-from-a-backend-design-round)) is about design rounds.
```

## Teaching findings

**T-1 · Minor (D2, consistency) · one unit for KB.**
- §3's tests and Q45.07 count KB as 1,024 bytes. "20 KB" is 20,480 bytes, and Q45.07's screen is 239,616 bytes.
- §6's "about 388 KB" is 387,973 bytes (KB = 1,000), and Exercise 45.1 says "KB is 1,000 bytes": the same assumed first screen is 234,000 bytes there.
- A reader comparing Q45.07 with the exercise sees two byte counts for one screen and no reason.
- Fix:
  - Q45.07 intro (780): "assumed: `index.html` 4 KB, `main.js` 180, `styles.css` 20, the board `GET` 30:" → "assumed, in KB of 1,024 bytes: `index.html` 4, `main.js` 180, `styles.css` 20, the board `GET` 30:" (+4)
  - Exercise 45.1, How each criterion is met (1111): "- Times: 234,000 bytes, three round trips, plus 100 ms." → "- Times: 234,000 bytes (Q45.07's 239,616 counts KB as 1,024), three round trips, plus 100 ms." (+6)
  - §6 How it actually works (425): "leave about 388 KB;" → "leave about 388,000 bytes;" (0)

**T-2 · Minor (B7, STYLE-GUIDE §4.2.7; lesson 2) · corrections that do not state the true belief.**
- **§1 (92).** "Per the backend guide, the evaluation is almost never about that." → "Per the backend guide, the evaluation is about requirements first, named trade-offs and your own failure modes." (+6)
- **§8 (645).** "- \"Background Sync replaces the outbox.\" Limited availability, and no Angular `sync` listener. Cause: the name." → "- \"Background Sync replaces the outbox.\" You still need the outbox, replayed on `online`: the API has limited availability and Angular's service worker has no `sync` listener. Cause: the name promises it." (+14)

**T-3 · Minor (D1; lesson 26) · Full explanations that end in bare links.** Each fence below gives the text to find (first line) and its replacement (second line).
- **Q45.15 (1020)**, the end of the Full explanation (+10):

```text
[Q37.21](37-elements-pwa-errors-ecosystem.md#q37-21); [Q44.18](44-fullstack-delivery-and-operations.md#q44-18).
Error UX per screen is [Q37.21](37-elements-pwa-errors-ecosystem.md#q37-21); the pipeline behind the signals is [Q44.18](44-fullstack-delivery-and-operations.md#q44-18).
```
- **Q45.16 (1038)**, the end of the Full explanation (+9):

```text
[Q37.11](37-elements-pwa-errors-ecosystem.md#q37-11); with no `sync` listener, replay on `online`.
Cached reads offline come from a data group ([Q37.11](37-elements-pwa-errors-ecosystem.md#q37-11)); with no `sync` listener, replay the outbox on `online`.
```

**Nits**
- **N-1 (B7, ambiguous cause):** §3 misconception (251). In this guide, "owners" means owner modules. "Cause: owners list features." → "Cause: product owners list features." (+1)
- **N-2 (quote, whole rule):** §3 How it actually works (211). The quote drops the comment's first line. "kbps commented \"roughly the 75th percentile of 4G connections\";" → "kbps, commented as WebPageTest's \"Fast 3G\" with \"similar characteristics to roughly the 75th percentile of 4G connections\";" (+8)
- **N-3 (lesson 24, condition):** §6 (425). "Our model ignores CPU (Lighthouse slows it 4 times)." → "Our model ignores CPU (Lighthouse's mobile profile slows it 4 times; desktop, not at all)." (+6; `cpuSlowdownMultiplier` 4 and 1, `Constants.js`)
- **N-4 (quote subject):** §8 (580). "(read 2026-10-22): a server \"MUST use" → "(read 2026-10-22): an origin server \"MUST use" (+1)
- **N-5 (punctuation):** §6 (429). "asks \"at least 24 by 24 CSS pixels\", (abridged)." → "asks \"at least 24 by 24 CSS pixels\" (abridged; exceptions follow)." (+2)
- **N-6 (B5, step reason):** §7 Code (511). "1. `lookup` skips stale entries: age decides." → "1. `lookup` skips entries past their maximum age, because a stale copy must not answer; a miss everywhere asks the origin and fills every layer." (+17)

## Judged acceptable

- **"Lists Chrome and Edge" for Background Sync (§8):** browser-compat-data also lists Opera and Samsung Internet, which are Chromium-based. The sentence names what it read and does not claim a complete list.
- **The Understanding quote "does not automatically meet" (§6):** the page goes on "unless that equivalent keyboard operation also provides controls that can be clicked or tapped with a pointer". §6's point (a keyboard path alone is not enough) is the same, and the menu path in the fence is exactly that pointer control.
- **`[§1](#mental-model)` in §2:** it resolves to §1's Mental model, the first heading of that name, and check-links passes.
- **Q45.14's Full explanation is short:** it names the test and the mechanism (memory emptied, the worker fresh), and the five lines carry the reasoning.
- **The field merge refusing with 412 (§8, `consistency.ts`):** a field-level merge is not an RFC 9110 mechanism. The lab header says the outcome is our model's, and §8 says "Our model refuses stale writes".
- **2.4.11 absent from reader text:** M45.md Corrections (SEC-M45-06) recorded it as cut for budget, and it is not a Must-state fact.
- **33:2129 links 45 for "security in a design":** this line is not in M45.md's handoff list. §2's trust boundary and Q45.05 serve it, and the line stays file-level.

## Claims sampled (50)

| # | Claim (location) | Basis | Result |
|---|---|---|---|
| 1 | Backend guide §7 evaluation sentence (§1, Q45.01) | F9; repository guide | Match |
| 2 | greatfrontend six axes, "never verbalized" (§1) | evaluation-axes page | Match |
| 3 | Prep-site sentence applies to machine coding (Q45.02) | same page (no machine coding) | Out of scope (F-5) |
| 4 | C4 four levels, notation independent, Simon Brown (§2) | c4model.com | Match |
| 5 | C4 container definition (§2) | `/abstractions/container` | Match |
| 6 | 45-minute plan 7, 7, 6, 5, 5, 5, 4, 6; deep dive cuts (§2, Q45.03) | `section-2-time-plan.test.ts` | Match |
| 7 | WCAG 2.2 Recommendation 12 December 2024 (§3) | w3.org | Match |
| 8 | Lighthouse default `mobileSlow4G`, `simulate` (§3) | `constants.js` | Match |
| 9 | Desktop config `desktopDense4G` (§3) | `desktop-config.js` | Match |
| 10 | 150 ms, 1.6 × 1024; 40 ms, 10 × 1024 (§3) | `Constants.js` | Match |
| 11 | Profile comment "roughly the 75th percentile of 4G" (§3) | `Constants.js` | Half-quoted (N-2) |
| 12 | Unit: × 1024 bits, ÷ 8 (§3) | `Simulator.js`, `TCPConnection.js` | Match |
| 13 | 300 ms vs 98 ms for 20 KB; 2 MB 10,000 ms; 150/40 saved (§3) | `section-3-estimates.test.ts`; arithmetic | Match |
| 14 | Vitals at p75 on `mobileSlow4G` (§3, Q45.06, Summary) | 08 §6, 31 §1 | Conflated (F-1) |
| 15 | Move replaces 6 in both shapes; rename 5 vs 3 (§4) | `section-4-board-model.test.ts` | Match |
| 16 | Containers read state, presentational take inputs (§4) | 38 §2 | Match |
| 17 | Placement order and homes (§5, Q45.09) | `state-placement.ts`, tests | Match |
| 18 | Validators per response; aggregate changes when any part does (§5) | 09 §4 | Match |
| 19 | 388 KB budget (§6) | `section-6-budget.test.ts` (387,973 bytes) | Match (unit T-1) |
| 20 | Lighthouse slows CPU 4× (§6) | `Constants.js` (mobile only) | Condition missing (N-3) |
| 21 | SC 2.5.7 text and AA (§6) | WCAG 2.2 | Match |
| 22 | Understanding: "does not automatically meet" (§6) | Understanding 2.5.7 | Match |
| 23 | SC 2.5.8 24 by 24, AA (§6) | WCAG 2.2 | Match (N-5) |
| 24 | 2.1.1 separate; CDK has no keyboard path (§6, Q45.12) | WCAG 2.2; 36 §6 | Match |
| 25 | Layer order and table (§7) | owners 09 §4, 27 §6, 37 §5 | Match |
| 26 | `performance` group answers within `maxAge` (§7) | 37 §5 | Match |
| 27 | `RenderMode.Prerender`, `Server`, `Client` (§7) | `@angular/ssr` 22.2.1 typings | Match |
| 28 | Five reads: memory, memory, worker, worker, origin (Q45.14) | `q45-14.test.ts` | Match |
| 29 | `index.html` `no-cache`: deploy shows at once (Q45.13) | 09 §4, 09 §9 | Ignores the worker (F-2) |
| 30 | §13.1.1 strong comparison (§8) | RFC 9110 | Match (N-4) |
| 31 | MUST NOT perform; MAY 412; MAY 2xx (§8) | RFC 9110 §13.1.1 | Match |
| 32 | §15.5.13 "evaluated to false" (§8) | RFC 9110 | Match |
| 33 | Spring sends 412 (§8) | 41 §5 (`mvc-caching.adoc`) | Match |
| 34 | `strongMatch` per §8.8.3.2 (lab) | RFC 9110 §8.8.3.2 | Match |
| 35 | `decide` never performs a stale write (§8 step 1) | `consistency.ts` | Wrong for LWW (F-3) |
| 36 | `BroadcastChannel` Baseline 2022, same origin (§8) | MDN | Match |
| 37 | Every listener except the sender (§8, Q45.17) | MDN | Match |
| 38 | The writing tab does not receive (flashcard 4) | MDN ("the object") | Narrowed (F-4) |
| 39 | Background Sync limited availability (§8) | MDN | Match |
| 40 | Chrome and Edge in compat data (§8) | BCD `api.SyncManager` | Match |
| 41 | No `sync` listener in Angular's worker (§8) | 37 §4 | Match |
| 42 | `navigator.onLine` quote (§8) | MDN; 37 §10 | Match |
| 43 | 42 §8 logout uses `BroadcastChannel` (§8, Q45.17) | 42 §8 | Match |
| 44 | Q45.07 lines 1593 ms and 303 ms; 450 + 1,143 split (Q45.07) | `q45-07.test.ts`; arithmetic | Match |
| 45 | Q45.09 six lines (Q45.09) | `q45-09.test.ts` | Match |
| 46 | Exercise 45.1 criteria, both variants (Ex 45.1) | `exercise-1.test.ts` | Match |
| 47 | 234,000 bytes for the assumed screen (Ex 45.1) | `exercise-1.test.ts` | Match (unit T-1) |
| 48 | Exercise 45.2 outcomes mirror §13.1.1 (Ex 45.2) | `exercise-2.test.ts` `OurServer` | Match |
| 49 | Lost response retried gets already-applied (Ex 45.2) | same, criterion 3 | Match |
| 50 | Q45.13/Q45.16 owner questions distinct (D5) | headings of 09, 27, 28, 37 | Match |

The table has 43 matches and 7 findings or nits (F-1 to F-5, N-2, N-3). The unit notes on rows 19 and 47 are T-1, not factual errors.

## Proposed FIX tasks

The module is at 8,061 words, and the REVIEW ceiling is 8,460. All fixes together add about +190:
- F about +86 (F-1 +29, F-2 +18, F-3 +18, F-4 +9, F-5 +12);
- T-1 about +10, T-2 about +20, T-3 about +19;
- nits about +35.

The FIX tasks measure the real delta. That gives about 8,250. If a fixer's count passes 8,460, it shortens only its own added clauses, never a cause, a "because" or a link.

```
| FIX-M45-01 | S | todo | REVIEW-M45 |  |
| FIX-M45-02 | S | todo | REVIEW-M45 |  |
| FIX-M45-03 | S | todo | REVIEW-M45 |  |
```

- **FIX-M45-01 · S · Sonnet (texts prescribed).** Factual fixes F-1 to F-5 and nits N-2, N-3 and N-4. No SOURCES note is needed: every basis is already in SOURCES.md `## Module 45` or an owner module.
- **FIX-M45-02 · S · Sonnet (texts prescribed).** Teaching fixes T-1, T-2 and T-3, and nits N-1, N-5 and N-6. It runs after FIX-M45-01, because both touch §3 and §6, on disjoint lines.
- **FIX-M45-03 · S · Sonnet (mechanical; slugs listed).** Anchors for the 4 file-level links into 45. No FIX changes a heading, so it may run in any order.

## For Jorge

1. **The requirement wording (F-1).** The plan and five places in the module wrote "good at p75 on `mobileSlow4G`". The fix splits it into field targets at p75 and a lab budget on a named profile, which is how 08 §6 and 31 §1 teach it. If you prefer a different phrasing for interviews (for example, "p75 of real users on 4G-class networks"), say so before FIX-M45-01 runs.
2. **Anchor handoffs: 4, not 7.** 32:2286 and 38:2041 end with "all file-level", so anchoring them would make those lines false, and 11:1598 is a bare list. REVIEW-M44 kept every "Uses these ideas later" line file-level, and this review follows that precedent. If you want 32:2286 and 38:2041 anchored too, their trailing "all file-level" wording would also change, which is an edit to modules 32 and 38 beyond a link target.
3. **Carried open, no FIX:** C2 (the RADIO acronym is not named, because its expansion was never read verbatim) and M45.md For Jorge 1 (no official company page about front-end design rounds). The module stays on F9 and one dated third-party site.
