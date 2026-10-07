# REVIEW-M04: `modules/04-js-async-event-loop.md`

- **Reviewer:** subagent, model claude-sonnet-5-5, for session S20261006-0237-claudecode
- **Date:** 2026-10-06
- **Files read:** `modules/04-js-async-event-loop.md` (all 1,623 lines); labs `labs/ts-js/src/modules/04-js-async-event-loop/{delay,retry,promise-pool,latest-only}.ts` and their `.test.ts`; `labs/ts-js/src/outputs/04-js-async-event-loop/{event-loop,node-event-loop,promises,async-await,cancellation}.test.ts`; `labs/ts-js/src/outputs/capture.ts`; `_meta/QUALITY-BAR.md`; `STYLE-GUIDE.md`; `VERSIONS.md`; SYLLABUS §4 block 04; `SOURCES.md` (Module 04); `_meta/reviews/REVIEW-M02.md` (format only). `modules/17-signals.md` was consulted only for the anchors the module links to.
- **What was run:** read-only commands only. `node labs/tools/check-snippets.mjs . 04` (exit 0, "All snippets check out"); `node labs/tools/check-links.mjs --planned` ("All links resolve", 179 planned links); the QUALITY-BAR "Measuring" one-liners; about 15 short `node -e` snippets on Node 24.21 (orderings, `Promise.try`, `timers/promises`, ESM vs CJS `nextTick`, `Array.fromAsync` rejections); `curl` read-only fetches of the HTML Standard, the Node docs, the IntersectionObserver spec, the TC39 finished-proposals list and the `Array.fromAsync` README. **The module's vitest suite and `tsc` were NOT run** (reviewer barred from npm/npx): assertions below were compared with the module text by reading, and the printed orderings were re-checked by running equivalent plain `node` snippets.

Overall: a strong module. All 15 Output answers match their assertions line for line, every Excerpt is verbatim, answer anatomy is complete, and the labs map 1:1 to the acceptance criteria. The gaps are: one outdated and one misquoted Node claim, one wrong table cell about IntersectionObserver, a thin set of diagrams (1 for 8 sections), no version history on the traps, seven orphan questions, and a few unrecorded sources.

---

## QUALITY-BAR

Counts: **35 Pass, 8 Fail, 2 N/A** (45 items).

| ID | Result | Evidence |
|---|---|---|
| A1 | Pass | Lines 3-9 follow STYLE-GUIDE §4.1 order (What this covers, Prerequisites, Leads to, Applies to, Study time, Short on time, Labs); line 9 carries `npx vitest run src/modules/04-js-async-event-loop src/outputs/04-js-async-event-loop`. |
| A2 | Pass | Line 4: both prerequisites have anchors (`#3-closures`, `#4-how-this-is-bound`); headings exist in module 02 (lines 160, 224); link check passes. Low note T-14: the module never uses the "method loses its `this`" idea the second prerequisite is justified by. |
| A3 | Pass | Line 8: 3 sections (1, 3, 5), 6 question IDs (03, 04, 12, 18, 20, 26), ends with Summary; all resolve. |
| A4 | Pass | Lines 13-25: 8 concept sections + Summary, Question bank, Hands-on exercises, Check your understanding, Connections = the 13 `## ` headings after the title; link check passes. |
| A5 | Pass | Loop, Node loop, promises, combinators, async/await, async iteration, cancellation, failure modes. Last section is the failure modes, not "under the hood", but the deepest mechanisms (thenable jobs, `Await`) sit in 3 and 5; acceptable. Low: section 2's Q04.08 uses promises before section 3 (taught only as "microtask" in section 1), harmless. |
| B1 | Pass | `grep -c` of the six subsection headings = 8 each = number of concept sections. |
| B2 | Pass | All 8 "problem it solves" blocks show a concrete failure (frozen page, spinner that never appears, SSR blocked loop, inversion of control, thousands of parallel calls, stale typeahead result, silent rejection). |
| B3 | Fail | One Mermaid diagram (section 1, with a "What to notice" sentence at line 57). Node's phase cycle (section 2), the promise state machine / reaction flow (section 3), async suspend/resume and the Q04.12 tick timeline (sections 3, 5), and the unhandled-rejection tracking list (section 8) are flows or state machines with no diagram. Pilot: 5 diagrams in 9 sections. See T-1. |
| B4 | Pass | Spec/engine depth in every section: HostEnqueuePromiseJob and the processing model (61-66), libuv phases and nextTick queue (126-130), NewPromiseResolveThenableJob (183), `Await`/PromiseResolve and the V8 change (296), `AsyncIteratorClose` and `return()` (351, Q04.22), signal abort steps (407, Q04.25), notify about rejected promises (457). But section 2 teaches an outdated phase order (F-1). |
| B5 | Pass | Every non-trivial `### Code` is preceded by an approach sentence (84, 188, 249, 304, 356, 417, 468). Sections 1 and 2 have a snippet with one approach sentence and no numbered steps (acceptable: the snippet is a labelled trace). |
| B6 | Pass | Every best-practice item has a "because" or equivalent reason clause (lines 100-103, 156-158, 207-210, 271-274, 324-327, 382-384, 437-440, 490-492). Line 327 ("Avoid `async` on functions that never `await`") gives the consequence but the reason is thin; accepted. |
| B7 | Fail | Only one trap has history (line 497, Node 14 to 15, with a citation). Traps at 107-110, 162-163, 214-216, 278-279, 331-333, 388-389, 444-445 give the correction but not "why the myth exists". The `await` cost (3 ticks before the V8 change) is taught at 296 and Q04.04 but is not a trap entry and gives no engine/Node version. See T-3. |
| B8 | Pass | Framework vs platform at lines 79-80 (the blurred host/language/Angular line; zone.js). Coming from the backend at 202-203 with "Where the analogy breaks". SYLLABUS 04 names no required comparison; STYLE-GUIDE §6 lists no required FvP topic for sections beyond the loop. |
| B9 | Fail (Low) | Used without an inline definition at first use: `libuv` (80), Web Worker (101), `MessageChannel` (77), "agent" (Q04.01, line 522), "SSR" (14, 118; deferred to module 32), "idempotency key" (445, only linked). See T-9. |
| B10 | Pass | Zone.js, change detection, SSR stability, signals/resources, RxJS and HTTP are one sentence plus link (80, 135, 413, 486, 1090, 1158). |
| C1 | Fail | 22 claims sampled; 18 have a basis. No basis: the rAF layout-read claim (Q04.07, line 681); the quoted Node docs sentence at line 156 (not found in the cited Node pages, F-2); the Node phase order at line 126 contradicts the current guide (F-1); IntersectionObserver in the "Runs in rendering" column (F-3); "`MutationObserver` callbacks" microtask row (77, true per DOM spec but uncited); `scheduler.yield()` support ("where supported", no browser list). |
| C2 | Pass | Output IDs in the bank (heading tag `Output`): Q04.03, 04, 05, 06, 08, 10, 11, 12, 15, 16, 18, 19, 22, 25, 28 (15). `grep -o 'Q04\.[0-9]*'` over `outputs/04-*` finds exactly those 15. All 15 diffed against assertions: every printed line matches (Q04.03 5 lines, 04 8, 05 6, 06 5, 08 5, 10 4, 11 5, 12 5, 15 3, 16 3, 18 2, 19 4, 22 4, 25 5, 28 2). Orderings re-checked with plain `node` for Q04.06, Q04.08, Q04.18; the Q04.04 variant in the follow-up was also run (below, V-section). |
| C3 | Pass | "Verified" sentences (96, 152, 563, 600, 631, 663, 758, 786, 814, 902, 933, 1005, 1039, 1122, 1214, 1297) map to existing tests named after the question ID. Exercise "How each criterion is met" accounts map to `it(...)` blocks (see E2). Line 1365 ("checked by running Node 24") is not backed by a lab test (T-11, I ran it: `AbortError`, code `ABORT_ERR`). |
| C4 | Fail | `grep -E '\[(Stable since|Added in|Changed in|...)'` returns nothing. Missing: zoneless "default since v21" (line 80) should carry a `[Changed in v21: ...]`/`[Stable since ...]` marker per VERSIONS.md; `provideBrowserGlobalErrorListeners()` (490) has none; the libuv 1.45 change (Node 20) is not marked (F-1). Editions: `async`/`await` ES2017 first appears at line 3 and 77 and gets its edition at 287; `for await` (345) before ES2018 at 349; `AggregateError` (235) before ES2021 in Q04.16/Q04.14; `{ cause }` (427, ES2022) has none. Editions for `allSettled`, `any`, `withResolvers`, `Promise.try`, `Array.fromAsync`, TLA are correct (checked against the TC39 finished-proposals list: 2020, 2021, 2024, 2025, 2026). See T-4. |
| C5 | Pass | `Promise.withResolvers`, `Promise.try`, `Array.fromAsync`, `AbortSignal.any/timeout/abort`, `throwIfAborted` all exist (ran `typeof` on Node 24; TypeScript 6.0.3 has `lib.es2024.promise.d.ts` (`withResolvers`), `lib.es2025.promise.d.ts` line 31 (`try`) and `lib.esnext.array.d.ts` (`fromAsync`)). `provideBrowserGlobalErrorListeners` is in `@angular/core@22.2.1` `types/_debug_node-chunk.d.ts` line 3252 with the doc comment the module paraphrases. |
| C6 | Pass | `grep -c Unverified` = 0; UNVERIFIED.md has no Q04 row. |
| C7 | Pass | `node labs/tools/check-snippets.mjs . 04` exits 0. Unmarked snippets all sit under Output questions. |
| C8 | Fail (Low) | All 18 URLs in the module are in SOURCES.md under Module 04. Not recorded: the TypeScript 6.0.3 lib files cited at Q04.17 (line 951) and Q04.23 (1144), the `@angular/core` 22.2.1 typings cited at line 490, typescript-eslint `return-await` (1008), and Node `timers/promises` (1365). SOURCES.md lines 151-152 list only the lab tests under "Packages read". |
| D1 | Pass | 28 questions, 28 Short answer, 28 Full explanation, 28 Follow-ups, 28 Trap to avoid. |
| D2 | Pass | All 15 Output short answers list the printed lines and give 1-3 sentences of reasoning. Low: Q04.18 short answer "The first line also arrives first" is ambiguous (T-12). |
| D3 | Pass | Tags: Output 15 (54%; Q04.08, 18, 19, 28 carry two tags, Output still 15), Concept 7, Difference 4, Bug hunt 4, Trade-off 1, Design 1. Six distinct tags, no tag above 60%. |
| D4 | Pass | Q04.01-08 loop, 09-13 promises, 14-17 combinators/helpers, 18-21 async/await, 22-23 iteration, 24-26 cancellation, 27-28 failure modes: follows the sections. Low: Q04.19's snippet uses top-level `await` before Q04.21 explains it (T-13). |
| D5 | Pass | `grep '^### Q'` over `modules/` for promise/microtask/event loop/abort/async/await/nextTick/setTimeout/unhandled: no match outside module 04 (Q17.40 is about `BehaviorSubject`). Within the module Q04.14/Q04.15/Q04.16 overlap on combinators but ask different things (choice, fail-fast output, race vs any output). |
| D6 | Fail | IDs never linked from outside their own heading: **Q04.01, Q04.02, Q04.05, Q04.09, Q04.16, Q04.17, Q04.27** (7 of 28). Many answers do not link back to the section they rely on (for example Q04.03, 04, 10, 15, 16, 17, 21, 22). See T-2. |
| D7 | Pass | 28 `<a id="q04-NN">` anchors, 01-28 contiguous, plus `ex04-1`..`ex04-4`; link check passes. |
| D8 | Pass | 28 questions = SYLLABUS ceiling (row 04: 28); exercises 4 = ceiling 4; above the floor of 25/4 for a non-NG module (15/2). |
| E1 | Pass | Exercises 04.1-04.4 each have Problem, Constraints, Acceptance criteria, Hint 1, worked solution (approach, code, criterion account), Alternative + Trade-offs, 3 follow-ups (within 2-4), Tests link. Only one hint each (QUALITY-BAR says 1-2). |
| E2 | Fail (Low) | Counts map 1:1: 04.1 5 criteria / 5 tests, 04.2 5 / 5, 04.3 8 / 8, 04.4 4 / 4. But the text claims "a test of the same name" (1360) and "Each test name starts with the exercise ID" (1311): test names are the criterion text paraphrased (for example "resolves only after the given number of milliseconds" vs "Resolves only after `ms` milliseconds") and the ID is only in the `describe` (`E04.1 delay`, not `Exercise 04.1`). Accounts describe the tests rather than naming them. See T-7. |
| E3 | Pass | delay, then pool, then retry (reuses delay and `return await`), then latestOnly (promise, signal, race of settlement): simple to integrating. |
| E4 | Pass | Sources read: no `any`, no injected dependencies, low branching, strict typing. Not run by this reviewer (see H1). |
| E5 | Pass | 15 Output questions. |
| F1 | Pass | Two paragraphs (503, 505) restate all 8 sections with links; the 4 ms clamp, `return await`, `AbortSignal.any/timeout` are all taught above. Low: the first paragraph is one block of about 320 words. |
| F2 | Pass | 6 prompts (1554-1559), each names a listener (colleague, junior developer, backend developer, reviewer, interviewer, SSR newcomer). |
| F3 | Pass | 9 flashcards. |
| F4 | Pass | Builds on / Read next / Uses these ideas later, each with a reason; `17-signals.md#4-effects` and `#6-resources-async-data-as-signals` exist (lines 250, 421). |
| G1 | Pass | 14,151 prose words for the whole file (cap not applicable per instructions). Section-level split not measured. No trimming recommended; the only repetition is listed under Redundancy. |
| G2 | Pass | All 9 SYLLABUS §4 checkboxes covered (next section). |
| H1 | N/A | Not run (reviewer barred from npm/npx). TASKS.md standard check applies. |
| H2 | Pass | `node labs/tools/check-links.mjs --planned`: "All links resolve." |
| H3 | N/A | `git status --short` shows `?? ./` for the whole guide directory (untracked as a unit), so a per-module stray-file check is not meaningful here. No temp files from this review were created. |

---

## SYLLABUS §4 coverage

| Checkbox | Where covered |
|---|---|
| Event loop per HTML spec: tasks, microtasks, rendering steps, `requestAnimationFrame`, `requestIdleCallback` | Section 1 (lines 31-110), Q04.01, 02, 03, 05, 06, 07. `requestIdleCallback` is only touched at line 67 and in Q04.07 (see T-5: no support caveat, and it is not an HTML-Standard API). |
| Node's phases vs browser (`process.nextTick`, `setImmediate`); why it matters for SSR | Section 2 (lines 114-163), Q04.08. Phase order outdated for Node 24 (F-1). |
| Callbacks to Promises: states, chaining, thenables, `resolve` vs `reject` | Section 3, Q04.09, 10, 11, 12, 13. |
| Combinators `all`, `allSettled`, `race`, `any`; `Promise.withResolvers` (verify edition) | Section 4, Q04.14, 15, 16, 17. Edition ES2024 verified against the TC39 list. |
| async/await desugaring, error handling, sequential vs parallel, top-level await | Section 5, Q04.04, 18, 19, 20, 21. |
| Async iterators and `for await`; `Array.fromAsync` (ES2026) | Section 6, Q04.22, 23. ES2026 verified (finished-proposals list, Year 2026). |
| Cancellation: `AbortController`/`AbortSignal`, `AbortSignal.timeout`/`any` | Section 7, Q04.24, 25, 26, Exercises 04.1, 04.3, 04.4. |
| Unhandled rejections, `queueMicrotask`, starvation | Section 8, Q04.27, 28. |
| Output drill: 12+ ordering puzzles (verified), link to 21 | 15 Output questions, each with a test; zone.js link at line 80, Q04.28 follow-up and Connections. |

No checkbox is missing.

## Factual errors

**F-1 · High · Node phase order is outdated for Node 24, and attributed to a guide that no longer says it.**
- Location: line 126. Quote: "The [Node.js event loop guide] lists six phases, in order: **timers** (...), **pending callbacks** (...), **idle, prepare** (internal), **poll** (...), **check** (...) and **close callbacks**".
- Wrong: the current guide (fetched 2026-10-06) lists the overview as pending callbacks, idle/prepare, poll, check, close callbacks, **timers**, and states: "Starting with libuv 1.45.0 (Node.js 20), timers are run after the poll phase in each event loop iteration. In earlier versions, timers were run before polling. To preserve backwards compatibility, libuv 1.45.0 still runs timers once before entering the event loop. This change can affect the timing of setImmediate() callbacks and how they interact with timers." VERSIONS.md pins Node 24, so the module's order is the pre-Node-20 one, and the change is neither taught nor marked. This is the kind of detail an interviewer who knows the guide will probe, and it bears on the "`setImmediate` versus `setTimeout(fn, 0)`" bullet (line 130) and Q04.08's follow-up.
- Correction: state the order as in the current guide, say that the order is a cycle (so "timers" is both the first station on entry and, since libuv 1.45, the last of each iteration), add a `[Changed in Node 20: libuv 1.45 runs timers after poll; once also before the first iteration]` note, and re-check that the "main module is non-deterministic" sentence still matches the guide (it does: the guide's `setImmediate() vs setTimeout()` section keeps it).
- Evidence: `curl https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick` (Phases Overview paragraph).

**F-2 · High · A quotation attributed to the Node docs does not appear in them.**
- Location: line 156 (paraphrased again in the Q04.08 follow-up, line 713). Quote: "Node's docs prefer `nextTick` only \"when cross-platform compatibility is not a concern\"."
- Wrong: the phrase is not on `https://nodejs.org/api/process.html` or on the event-loop guide (searched both pages for "cross-platform", "portab", "not a concern"). The process docs say the opposite way round: "For most userland use cases, the `queueMicrotask()` API provides a portable and reliable mechanism for deferring execution that works across multiple JavaScript platform environments and should be favored over `process.nextTick()`."
- Correction: quote the real sentence (or drop the quotation marks and say "Node's docs say `queueMicrotask` should be favored for most userland code"), and fix the Q04.08 follow-up (line 713, "Node's docs prefer `nextTick` only when portability does not matter") to match.
- Evidence: `curl https://nodejs.org/api/process.html`, section "When to use queueMicrotask() vs. process.nextTick()".

**F-3 · Medium · IntersectionObserver notifications are not a rendering-step callback.**
- Location: line 77, third column. Quote: "`requestAnimationFrame`, `ResizeObserver`, `IntersectionObserver` notifications" under "Runs in **rendering**".
- Wrong: the HTML rendering steps only *compute* intersection observations. The notification is delivered by a separately queued task: "To queue an intersection observer task for a document ... Queue a task on the IntersectionObserver task source associated with the document's event loop to notify intersection observers" (W3C IntersectionObserver §3.2.4). So IO callbacks belong in the **task** column (task source: IntersectionObserver), while `ResizeObserver` callbacks do run inside the rendering step (line 66 says so correctly for the loop back into layout). The table therefore teaches that IO callbacks run before paint in the same frame, which is the opposite of the real behavior.
- Correction: move IO notifications to the task column (or split the row: "ResizeObserver callbacks" in rendering, "IntersectionObserver observations computed in rendering, callback delivered in a following task"). Add the W3C IntersectionObserver spec URL to SOURCES.md.
- Evidence: `curl https://w3c.github.io/IntersectionObserver/` (section "3.2.4. Queue an Intersection Observer Task").

**F-4 · Medium · Q04.06 follow-up misstates when `preventDefault()` works from a microtask.**
- Location: line 667. Quote: "Only if the microtask runs while the event is still being dispatched, which is the user-click case for listeners after the first one."
- Wrong/misleading: for a real click the spec's *clean up after running script* checkpoint runs after **each** listener callback returns (the JS stack is empty), and dispatch has not finished, so a microtask queued by *any* listener, including the first and the last, runs before the next listener and before dispatch completes. "For listeners after the first one" implies the first listener's microtask is different, which it is not. In the scripted `dispatchEvent`/`click()` case the microtasks run after dispatch, so `preventDefault()` in them is too late (the default action already ran or was not cancelled).
- Correction: "In a real click, a microtask queued by any listener runs after that listener and before dispatch ends, so `preventDefault()` inside it still works. In a scripted `dispatchEvent` the microtasks run after dispatch has finished, so it is too late. Do not rely on either: call it synchronously." (The checkpoint algorithm is quoted correctly at line 663 and verified in the HTML Standard: "If the JavaScript execution context stack is now empty, perform a microtask checkpoint.") This is a reasoning-level inference rather than something run in a browser: see V-3.

No other factual errors found. Checked and correct: 4 ms clamp quote (HTML timers: "If nestingLevel is greater than 5, and timeout is less than 4, then set timeout to 4."), microtask-queuing note (HTML: "Authors ought to be aware that scheduling a lot of microtasks has the same performance downsides as running a lot of synchronous code. Both will prevent the browser from doing its own work, such as rendering."), rendering as a task on the rendering task source (HTML processing model, "queue a global task on the rendering task source ... to update the rendering"), "task queues are sets, not queues", `Array.fromAsync` README quote (verbatim), Node `nextTickQueue` quote (verbatim), ES module `nextTick` inversion (ran: ESM prints `promise, qm, nextTick`; CJS prints `nextTick, promise, qm`), `Promise.try` runs `fn` synchronously (ran), editions (TC39 list: `allSettled` 2020, `any` 2021, `withResolvers` 2024, `Promise.try` 2025, `Array.fromAsync` 2026), Node 15 `throw` default, `timers/promises` rejects with `AbortError` / `ABORT_ERR` (ran), Q04.18's "two ticks versus three" (ran a tick counter: `withAwait` handler runs in the second round, `withoutAwait` in the third), Q04.04 follow-up (ran: with `async2` returning a timer promise the order ends `promise2, setTimeout, async1 end`), start-now-await-later reports an unhandled rejection (ran: `UNHANDLED b`, then `caught b` and a `PromiseRejectionHandledWarning`), `Array.fromAsync([a, rejectsEarly])` reports the early rejection as unhandled (ran).

---

## Teaching and completeness findings

**T-1 · Medium · B3: add diagrams where the mechanism is a flow, cycle or state machine.** Sections 2, 3, 5 and 8 have none (see B3). Suggested: (a) section 2, a `flowchart` of the Node phases as a cycle with the nextTick and microtask drains between callbacks (this also carries the F-1 correction); (b) section 3, a `stateDiagram-v2` pending to fulfilled/rejected with "resolved (locked in)" shown as a separate overlay, or a `sequenceDiagram` of the Q04.12 tick timeline (job, reaction, reaction); (c) section 8, a small `flowchart` of the rejection list: reject without handler, checkpoint, report; handler attached later, "handled" event. Each diagram needs a "What to notice" sentence as at line 57.

**T-2 · Medium · D6: link orphan questions from the body and link answers back.** Orphans: Q04.01 (section 1 "The problem it solves"), Q04.02 (section 1 Misconceptions or the table at 73-77), Q04.05 (section 1 Code, "drain completely"), Q04.09 (section 3 problem), Q04.16 (section 4, "race returns first settlement" trap at 279), Q04.17 (section 4 `withResolvers`/`try` bullets, 242-243), Q04.27 (section 8 "How it actually works" Node bullet, 462). Also add a "(section N)" link in the answers that rely on a section but do not link it (Q04.03, 04, 10, 15, 16, 17, 21, 22, 23).

**T-3 · Medium · B7: give the traps history and a "why the myth exists".** (a) Add a trap "`await` costs three ticks" with the version where it changed: the V8 article ([Faster async functions and promises](https://v8.dev/blog/fast-async)) says it shipped in V8 7.2 / Chrome 72, and the spec change; state which Node release picked it up (verify from the article and `process.versions.v8` history, V-1). Today lines 296 and 603 say only "before a later spec change". (b) For each existing trap add one clause on origin, for example: "`setTimeout(fn, 0)` runs immediately" (looks like "0 = now"), "`race` returns the first success" (the name suggests a race for the winner), "`Promise.all` runs in parallel" (the name and `Promise.all(array.map(...))` idiom), "`nextTick` is the next loop turn" (already says names are backwards, good), "Observables and async iterators are the same" (both are "streams of values"). (c) The Node 14 to 15 trap (497) is the model.

**T-4 · Medium · C4: markers and editions at first mention.** Add `[Changed in v21: zoneless is the default for new apps]` (VERSIONS.md "Zoneless change detection ... default for new apps in v21") at line 80; a marker or short note for `provideBrowserGlobalErrorListeners()` (line 490; check `@publicApi` version in the typings and use it); an edition at the first mention of `async`/`await` (ES2017, line 3 or 77), `for await` (ES2018, line 345), `AggregateError` (ES2021, line 235), `Error` `cause` (ES2022, line 427), and Node 20 for `AbortSignal.any` if you want a runtime floor (Node 20.3). The libuv 1.45 marker is in F-1.

**T-5 · Medium · `requestIdleCallback` and `scheduler.yield()`: say they are not universal and where they are specified.** Line 67 and Q04.07 present rIC as part of "the HTML Standard processing model". The HTML Standard's loop only *calls* "start an idle period"; `requestIdleCallback` itself is defined by W3C Cooperative Scheduling of Background Tasks, and Safari has not shipped it. Say so, add the source, and note that `scheduler.yield()` (line 492) is also not in every engine (the sentence "where supported" is correct but gives no way to decide). An interviewer asking "can I rely on rIC?" gets no answer today. Verify support from MDN before writing the sentence (V-4).

**T-6 · Medium · C1: back or soften the rAF layout claim.** Q04.07 line 681: "reads of layout in rAF see the previous frame's layout without forcing an extra reflow, as long as you read before you write." The HTML Standard does not say this, and whether a read forces layout depends on whether style or layout is dirty at that point (earlier script, CSS animation updates). Either cite a source (web.dev or Chrome rendering docs), or rewrite as the safe rule: "batch reads before writes in rAF to avoid forced synchronous layout", which is what the later text needs. See V-2.

**T-7 · Low · E2: make the exercise text match the tests.** Line 1311 ("Each test name starts with the exercise ID") and line 1360 ("a test of the same name") are not literally true (test names are paraphrased; the ID is in `describe('E04.1 delay')`, a different spelling from "Exercise 04.1"). Either rename the `it(...)` titles to start with the ID and the criterion text, or change the sentence to "Each `describe` is named `E04.N`; tests follow the criteria in order". In each "How each criterion is met" paragraph, name the tests (quote the `it` titles) as STYLE-GUIDE §8 and QUALITY-BAR E2 ask. Also optionally add a Hint 2 where useful (04.2: "stop taking items after the first failure").

**T-8 · Low · Untested behavioral claims in prose.** Section 8's batching snippet (468-484) says "several synchronous calls in the same task produce one flush", and Q04.26's replacement `withTimeout` (1246-1249) and Q04.13's fix are Partial and untested, which is allowed. If the guide wants to match the "every claim run" tone of line 27, add a 6-line test for the batching snippet (named "Section 8: ...") and one for the Q04.26 fix (a signal-aware `work` is aborted on timeout; fake timers). Optional.

**T-9 · Low · B9: define on first use.** `libuv` (line 80: "the C library that implements Node's loop, also used by Node's I/O"), Web Worker (101: link to the module that owns it), `MessageChannel` (77), "agent" (Q04.01 follow-up: "an agent is a thread of execution with its own loop"), "SSR" (14/118: one clause). "Thenable" is used at 179 before its definition at 183.

**T-10 · Low · Section 4 line 239 is slightly imprecise.** "Every combinator calls `Promise.resolve` on each element": the spec calls the *constructor's* `resolve` (`promiseResolve = C.resolve`), which matters for subclasses and for `Promise.resolve` overrides. One clause fixes it. (Not an error for native promises.)

**T-11 · Low · C3: line 1365 "checked by running Node 24".** The `timers/promises` claim (rejects with `AbortError`, `code === 'ABORT_ERR'`) is true (I ran it) but has no lab test, unlike every other "verified" claim. Add a test named after the exercise section, or reword to "documented in the Node timers docs" and cite it in SOURCES.md.

**T-12 · Low · Q04.18 short answer wording.** "The first line also arrives first" (line 1003) refers to the first *printed* line (`withAwait fallback`), which is the second call in the code. Say "`withAwait` also finishes first, because...".

**T-13 · Low · Q04.19 uses top-level `await` (line 1030) and the Output snippet is therefore valid only in a module.** The test wraps it in an async function. An Output snippet carries no `// Partial` marker, so note in the Full explanation that the snippet assumes a module, or change `await saveAll();` to `saveAll().then(() => console.log('after saveAll'));` (the test must change to match, order is the same).

**T-14 · Low · Prerequisite rationale.** Line 4 says module 02 §4 is needed for "why a method passed as a callback loses its `this`", but module 04 never uses that idea. Either add one sentence where it matters (for example in section 7's `addEventListener` or the `legacyRead` wrapper: "pass `obj.method.bind(obj)`") or reword the prerequisite to what is used (closure over `this` in arrow callbacks, Q04.24's `retry` options).

**T-15 · Low · Q04.26 fix is partly shown.** The replacement `withTimeout` returns `work(...)`, so a `work` that ignores its signal still runs to completion and never rejects early; the follow-up covers it ("Keep the race, clear the timer") but the Code part never shows that variant. Add the 6-line "race with cleanup" version (`try { return await Promise.race([work, timeout]) } finally { clearTimeout(id) }`) so the answer is complete for the third-party-promise case.

---

## Redundancy

Concrete repeats of the same point (not a request to shorten):
1. Section 1 Code (lines 86-94) and Q04.03 (550-556) are the same snippet and the same ordering explanation; section 2 Code (140-150) and Q04.08 (695-702) likewise. Keep the snippet in the question only, and let the section Code show a *different* ordering (for example the rAF position, or the `setImmediate`-in-I/O case) or link to the question.
2. "Start now, await later reports an unhandled rejection" is explained in full at line 320 and again at Q04.20 (1069), nearly sentence for sentence. Keep the section version and link from the answer.
3. "Node 15 made `throw` the default" appears at 462, 497 and 1268, plus the flashcard (1605-1607). Keep 497 (the history) and let 462 and 1268 point to it.
4. The HTML microtask-queuing quotation appears at 464 and 1297. Quote once (section 8) and link from Q04.28.
5. `return await` inside `try` is argued at 297, 326, 333, Q04.18, and the retry code comment (1176); the first three are one point in three subsections of section 5 (How it works, Best practices, Misconceptions). Acceptable by template, but 326 and 333 can be one clause each.

---

## Claims to verify

- **V-1 (T-3a).** Which V8/Chrome/Node version shipped the cheaper `await` (three ticks to one). Method: read https://v8.dev/blog/fast-async (the article names V8 7.2/Chrome 72 and the spec PR), then map to Node (Node 12 ships V8 7.4+) from the Node release table; add the result to the trap and to SOURCES.md.
- **V-2 (T-6).** Whether reading layout in a rAF callback forces a reflow. Method: Chrome DevTools "Forced reflow" trace on a page that mutates style in an earlier task, or cite web.dev "Avoid large, complex layouts and layout thrashing"; until verified, use the safe wording.
- **V-3 (F-4).** `preventDefault()` from a microtask during a real click. Method: in a browser, attach two listeners to a link click, call `Promise.resolve().then(() => e.preventDefault())` in the first and check `e.defaultPrevented` after `await 0` and whether the navigation happens; repeat with `link.click()` from script. The HTML cleanup-after-running-script algorithm supports the reasoning, but this was not run in a browser.
- **V-4 (T-5).** Browser support of `requestIdleCallback` and `scheduler.yield()`. Method: MDN compatibility tables (or caniuse) read on the day of the fix; state the result with a date.
- **V-5.** That Section 6 line 359-376 and Section 7 line 421-430 Partial snippets type-check under strict TypeScript 6.0 once `Item`/`fetchPage` are supplied (the snippets use inferred generics with `let cursor: string | null`). Method: paste into a scratch file in `labs/ts-js` and run `npx tsc --noEmit` (reviewer could not run `tsc`); or compile and promote them to Excerpts.
- **V-6.** The statement at line 245 "All of them run on Node 24 and evergreen browsers" for `Promise.try`, `Promise.withResolvers` and `Array.fromAsync`: Node 24 was verified here (`typeof` is `function` for all three); browser support not checked. Method: MDN compatibility tables.
- **V-7.** The claim "Hidden tabs have few or no rendering opportunities" (line 66, Q04.07) and "background tabs are throttled further" (71) are browser behavior the HTML Standard leaves implementation-defined ("a user agent may..."). Method: confirm the spec wording on rendering opportunities ("hidden", "throttle") and add "browsers typically" if it is not normative.

---

## Proposed FIX tasks

### FIX-M04-03 · S · Correct the Node and rendering factual errors
- Findings: F-1, F-2, F-3, F-4, T-10, T-12.
- Files: `modules/04-js-async-event-loop.md` (lines 77, 126, 130 if needed, 156, 239, 667, 713, 1003), `SOURCES.md` (Module 04 heading: W3C IntersectionObserver spec; the Node timers/event-loop guide section on libuv 1.45).
- Do: restate the Node phase order as in the current guide and add the libuv 1.45 (Node 20) change as a marked note; replace the misquoted "cross-platform compatibility" sentence at 156 and the paraphrase at 713 with the real "should be favored over process.nextTick()" text; move IntersectionObserver notifications to the task column at 77 (keep ResizeObserver in rendering); rewrite the Q04.06 `preventDefault` follow-up; fix the Q04.18 "first line" wording; refine line 239.
- Acceptance: `grep -n "cross-platform" modules/04-js-async-event-loop.md` returns nothing; the module's phase list matches the Phases Overview of https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick and mentions libuv 1.45; line 77 has no IntersectionObserver in the rendering column; `node labs/tools/check-snippets.mjs . 04` exits 0; `node labs/tools/check-links.mjs --planned` reports "All links resolve"; no lab files changed, so no vitest run is needed.

### FIX-M04-04 · M · Diagrams, version history on traps, and markers/editions
- Findings: T-1, T-3, T-4, V-1.
- Files: `modules/04-js-async-event-loop.md` (sections 2, 3, 5, 8 mental models; Misconceptions in sections 1-8; lines 3, 77, 80, 235, 345, 427, 490), `SOURCES.md`.
- Do: add Mermaid diagrams with "What to notice" sentences for the Node phase cycle, the promise states/reaction flow (or the Q04.12 tick timeline), and the rejection-tracking flow; add the "`await` costs three ticks" trap with the verified V8/Node versions; add a "why the myth exists" clause to each remaining trap; add the status markers and editions listed in T-4 using STYLE-GUIDE §3.2 forms.
- Acceptance: `grep -c '```mermaid' modules/04-js-async-event-loop.md` is at least 4, each followed by a sentence starting "What to notice"; `grep -nE '\[(Changed in|Stable since|Added in)' modules/04-js-async-event-loop.md` finds the zoneless and `provideBrowserGlobalErrorListeners` markers; each Misconceptions bullet states a cause or version; `node labs/tools/check-snippets.mjs . 04` and `node labs/tools/check-links.mjs --planned` pass.

### FIX-M04-05 · S · Link every question from the body and back
- Findings: T-2, T-9, T-14, Redundancy items 1-4.
- Files: `modules/04-js-async-event-loop.md`.
- Do: add body links for Q04.01, 02, 05, 09, 16, 17, 27 at the places named in T-2; add section back-links in the answers listed; define `libuv`, Web Worker, `MessageChannel`, "agent", SSR and "thenable" at first use; fix the prerequisite rationale; replace the duplicated section Code snippets with a different example or a link, and trim the repeated explanations named under Redundancy to one sentence plus a link.
- Acceptance: for every `N` in 01-28, `grep -c "](#q04-N)" modules/04-js-async-event-loop.md` is at least 1 outside the question's own heading (script: for each ID, count matches excluding the `### Q04.N` line); `check-snippets` (`node labs/tools/check-snippets.mjs . 04`) and `check-links` (`node labs/tools/check-links.mjs --planned`) pass.

### FIX-M04-06 · M · Complete the rIC/rAF/`scheduler.yield` claims and the Q04.26 and Q04.13/19 answers
- Findings: T-5, T-6, T-13, T-15, V-2, V-4, V-7.
- Files: `modules/04-js-async-event-loop.md` (lines 67, 492, Q04.07 at 681, the Q04.19 snippet and test, the Q04.26 Code part), `labs/ts-js/src/outputs/04-js-async-event-loop/async-await.test.ts` only if Q04.19's snippet changes, `SOURCES.md`.
- Do: say which specs define rIC and `scheduler.yield()` and their browser support (dated, from MDN); rewrite or cite the rAF layout-read sentence; remove top-level `await` from Q04.19 (and update the test assertion text and snippet together) or state the module assumption; add the "race with cleanup" variant to Q04.26.
- Acceptance: from `labs/ts-js`, `npx vitest run src/modules/04-js-async-event-loop src/outputs/04-js-async-event-loop` is green; `node labs/tools/check-snippets.mjs . 04` exits 0; Q04.19's snippet equals the test body with `log` replaced by `console.log`; `node labs/tools/check-links.mjs --planned` passes.

### FIX-M04-07 · M · Align exercise text with the tests and record sources
- Findings: T-7, T-8, T-11, C8 (QUALITY-BAR), V-5, V-6.
- Files: `modules/04-js-async-event-loop.md` (lines 1311, 1360, 1431, 1478, 1536 accounts; 1365), `labs/ts-js/src/modules/04-js-async-event-loop/*.test.ts` (rename `it` titles or add the optional tests), `labs/ts-js/src/outputs/04-js-async-event-loop/` (optional "Section 8" batching test and a `timers/promises` abort test), `SOURCES.md` (TypeScript 6.0.3 `lib.es2024.promise.d.ts`, `lib.es2025.promise.d.ts`, `lib.esnext.array.d.ts`; `@angular/core` 22.2.1 `_debug_node-chunk.d.ts`; typescript-eslint `return-await`; Node `timers/promises`).
- Do: either rename tests to start with the criterion text and the `E04.N`/exercise ID, or reword lines 1311 and 1360; name the tests in each "How each criterion is met"; add the optional tests listed in T-8/T-11 or downgrade those claims to cited documentation; list the packages read under Module 04 in SOURCES.md; compile the Partial snippets of V-5 in the labs (promote to Excerpts if they pass).
- Acceptance: `npx vitest run src/modules/04-js-async-event-loop src/outputs/04-js-async-event-loop` from `labs/ts-js` is green and every `it(...)` title named in the module exists (grep each quoted title); `grep -n "https://" modules/04-js-async-event-loop.md` URLs all appear under SOURCES.md "Module 04"; `node labs/tools/check-snippets.mjs . 04` and `node labs/tools/check-links.mjs --planned` pass.
