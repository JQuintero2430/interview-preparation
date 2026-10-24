# REVIEW-M46: `modules/46-system-design-case-studies.md`

- **Reviewer:** a fresh reviewer subagent (claude-opus-5-5) of session S20261023-1732-claudecode. It wrote nothing in module 46 and continues none of the PLAN, SEC, EX, QB or CLOSE-M46 conversations, so it is eligible (RUN.md §4). It ran only the read-only commands listed under Runs; job-state updates and every fix belong to the main session.
- **Date:** 2026-10-23.
- **Files read:**
  - the whole module (2,186 lines). Line numbers below are as of this review and will move at FIX time. Every fix quotes its text, and a fixer finds the line by that text, not by its number;
  - `_meta/modules/M46.md` (whole: lessons 1-30, Handoffs into 46, owned topics, questions not asked, Lab decision, F1-F12, C1-C17, section plans with their Must-state lines, Question notes, anchor candidates, For Jorge, and "Corrections found while writing" through CLOSE-M46);
  - QUALITY-BAR, STYLE-GUIDE (§4-§8 as needed), REVIEW-M45 (the format model);
  - the module-46 paragraph, rows and the CLOSE-M46 and REVIEW-M46 blocks in TASKS.md, and the REVIEW-M45 and FIX-M45-01..03 blocks;
  - the LOG lines of SEC-M46-01 through CLOSE-M46 and the session summaries; `SOURCES.md` `## Module 46` (line 3205 on);
  - every module-46 lab file (seven models and seven `section-N` tests in `concepts/`; the five exercise folders with `a/`, `b/` and the tests; the seven Output tests in `src/outputs/46-system-design-case-studies/`);
  - other modules, only for the owner statements the module relies on (24 §9, 36 §8, 36 §11, 41 §6 and Q41.13, 43 §8, 45 §7 and §8), every `### Q` heading of modules 01-45 (grep), and the lines that link `46-system-design-case-studies.md` (17, 30-34, 38-40, 42-45);
  - this repository's `Architect-Level Production & Architect.md`, Q26 (line 656).
- **Sources re-read (2026-10-23):** fetched into `/Users/jorge.quintero/.claude/jobs/4a727236/tmp/review-m46`, deleted afterwards.
  - **datatracker.ietf.org.** `draft-ietf-httpapi-idempotency-key-header`: "Active Internet-Draft", latest version **-08** (dated 2026-10-22); `-09.txt` does not exist on ietf.org. Plain text of -08: header "Intended status: Standards Track", "Expires: 25 April 2027", "22 October 2026"; §2, §2.1, §2.2 (both sentences with MUST: "The idempotency key MUST be unique and MUST NOT be reused with another request with a different request payload." and "Uniqueness of the key MUST be defined by the resource owner and MUST be implemented by the clients of the resource."; the RECOMMENDED UUID), §2.3, §2.4, §2.5.1, §2.6 (Retry: "The resource SHOULD respond with a response consistent with the request being completed according to the user's intent."; Concurrent Request: "The resource SHOULD respond with a resource conflict error."), §2.7 (SHOULD 400 "for a documented idempotent operation requiring this header", SHOULD 422, SHOULD 409 "with body containing problem description", and "Clients MUST correct the requests (with the exception of 409 where no correction is required) before performing a retry operation, or the resource MUST fail the request and return one of the above errors.").
  - **rfc-editor.org.** RFC 9110 plain text: §9.2.2 (definition, "PUT, DELETE, and safe request methods are idempotent", and the communication-failure rationale), §15.5.1, §15.5.10, §15.5.21. RFC 6585 §4 ("MAY include a Retry-After header").
  - **docs.stripe.com** `api/idempotent_requests` (one vendor): "For API v1, Stripe saves the status code and body … Retries with the same key return the saved response, including `500` errors. With API v2, retries don't repeat successful operations."; "we suggest using V4 UUIDs"; "up to 255 characters long"; "Avoid using sensitive data …"; "For API v1, you can remove keys from the system automatically after they're at least 24 hours old. We generate a new request if a key is reused after the original is pruned."; the compare-parameters and concurrent-request sentences.
  - **w3.org (WAI APG, informative).** Combobox (definition; role combobox; `aria-controls`; "DOM Focus is maintained on the combobox and the assistive technology focus is moved within the listbox using aria-activedescendant"; "Down Arrow: If the popup is available, moves focus into the popup"; "Escape: Dismisses the popup if it is visible."). Grid ("A grid widget is a container …"; "Only one of the focusable elements contained by the grid is included in the page tab sequence."; "All focusable elements contained in a table are included in the page tab sequence."; the `aria-sort` sentence). Feed (definition; `aria-busy` "if the operation requires multiple DOM operations" and "it is extremely important that aria-busy is set to false …"; "Control + End: Move focus to the first focusable element after the feed."). Introduction ("APG is Not a Normative Standard"; "the APG is an "informative" resource"; "The APG does not specify normative requirements").
  - **developer.mozilla.org.** Intersection Observer API (Baseline "since March 2019"; the "asynchronously observe" sentence; "Implementing "infinite scrolling" websites"). Page Visibility API (Baseline "since July 2015"; the four quoted policy sentences; the IndexedDB exemption; Firefox +50 ms / −150 ms, 30 s; Chrome "in seconds", 10 s; non-negative budget; 10 ms per second; audible tabs foreground). `Document: visibilitychange event` (Baseline "since April 2021"; "Transitioning to hidden is the last event that's reliably observable by the page, so developers should treat it as the likely end of the user's session"). `Crypto: randomUUID()` (Baseline "since March 2022"; "available only in secure contexts (HTTPS)"; "36 character long v4 UUID"). Push API ("it has to have an active service worker").
  - **postgresql.org.** `docs/current/functions-comparisons.html` (title "Documentation: 18"), 9.25.5: "left-to-right, stopping as soon as an unequal or null pair of elements is found" and the null rule.
  - **`npm pack @angular/aria@22.2.1`** (extracted, read, deleted): `package.json` version 22.2.1; `types/combobox.d.ts` declares `ComboboxWidget` (line 14), `ComboboxPopup` (51) and `Combobox` (111); `types/grid.d.ts` exists. 36 §11 states [Stable since v22.0], which the module repeats with "status per 36 §11".
  - **This repository:** the architect guide's Q26 sentence "The insert of the key must be **in the same transaction as the business write**" and the two-phase record.
- **Basis of each finding:** a page or package read on the date above; an owner module's text; a committed lab file; or a read-only script.
- **Not re-read:** the owners' own tests (23, 24, 28, 31, 36, 41, 43, 45); 36 §11's CHANGELOG basis for [Stable since v22.0] (the module only repeats the owner's marker).
- **Not run:** `npx tsc --noEmit` and the full lab suites (main ran both at CLOSE-M46); the Mermaid diagrams were not re-parsed (main parsed 8/8 with mermaid 11.17.2 at CLOSE-M46).
- **Probe files:** none in the repository. Sources, the tarball and a text-extraction script lived in the job tmp dir, deleted afterwards. The reviewer created only this file and edited `_meta/TASKS.md`.

Overall, this is an accurate, dense module. Every direction fact it owns matches its source:
- the draft is called an IETF Internet-Draft with number and date, its statuses are SHOULDs, the 409 exception to "MUST correct" is quoted whole, and **§2.6 is never flattened** into "must replay": replay is named ours and Stripe v1's in §8, a misconception, Q46.23, Q46.26 and a flashcard;
- Stripe is "one vendor" and "For API v1"; the APG is "informative" and no WCAG requirement is claimed from it;
- the money rule agrees with 45 §8 in so many words (pending acknowledged at once; "sent" and the balance wait);
- field p75 and the lab budget stay apart (`grep -c 'p75 on\|INP on'` = 0; §6 states them separately);
- MDN's throttling quotes keep the WebSockets and WebRTC exception, add the IndexedDB one, and claim nothing about SSE (C17).

**Capability per implementation.** The response gate "cannot cancel the request" unlike `switchMap`; WebSockets and WebRTC are named, not "sockets"; our server's replay is "a choice". **Our models.** Every lab header says "our model" or "our fake", and the prose says "our cache", "our feed store", "our presence map", "our server". **Output answers.** Q46.03, .06, .11, .13, .17, .20 and .26 equal their assertions line for line.

**Findings.**
- **No Major finding.**
- **Two Minor factual findings:**
  - F-1: §8 quotes §2.2 and §2.6 of the draft in part: §2.2's second MUST sentence and §2.6's concurrent-request wording are missing (both required by the REVIEW-M46 block).
  - F-2: §8's "What to notice" says Unknown "has no arrow to Failed", which holds only because our model has no business rejection; a real status read can find a declined transfer.
- **Two Minor teaching findings:**
  - T-1: the template's part 5 (a signal per failure mode, §1) is missing in §5, §6 and §7; §5 even announces "each with a degraded behavior and a signal" and gives none.
  - T-2: Exercise 46.5's worked solution does not say that, once retries are exhausted, our client alternates a status read and a post with no cap (the gap EX-M46-05 left open for this review).
- **Eight nits**, and the anchor handoffs (5 rows).

**REVIEW-M44/M45 patterns (counted over all 33 misconceptions, 52 Q follow-ups, 26 traps, 26 Full explanations, every Code step list and 13 exercise follow-ups):**
- 0 follow-ups or traps without a reason;
- 0 misconception corrections without the true belief, 0 causes missing (33 of 33);
- 0 Full explanations that route without teaching or end on a bare link;
- 1 Code step that does not hold for every branch (T-2) and 1 ambiguous step (N-8);
- one byte unit: the module states "KB means 1,000 bytes" (§1) and writes no byte count anywhere; 0 uses of 1,024.

**Advice check (C1).** 0 sentences state a company's, product's or interviewer's practice as fact. "Our suggestion" (§1), "our advice" (§6), "(advice)" (Q46.21, Exercise 46.4, 46.5) and "Usually both" (Q46.14, a recommendation) are worded as advice. "Standard" appears only inside the §8 myth that the correction refutes.

**Items left to this review by earlier sessions, settled:**
- **EX-M46-05's open item (retry cap):** confirmed in `exercise-5-transfer-client/a/transfer-client.ts` (lines 63-72: after `maxAttempts`, `read` then `later` then `post` then `read`, with no bound); fixed in text (T-2), lab unchanged (For Jorge 2).
- **C4 (draft version):** still -08 on 2026-10-23.
- **For Jorge 7 (ceiling):** see Prose and For Jorge 1.

**Plan facts found wrong or superseded:** M46.md lesson 30 says anchor handoffs go only on "Read next" lines; the REVIEW-M46 block asks for "an anchor proposal per "Read next" or body link into 46". This review follows the block (5 rows, see Handoffs).

**Prose:** 14,474 words now (`module-stats.mjs` and the QUALITY-BAR python counter, both run read-only by the reviewer, agree). The fixes add about +116, for about 14,590. **That is above the 11,620 ceiling the REVIEW-M46 block names** (and above the provisional 13,000 of M46.md Corrections). The only redundancy found is about 28 words (N-7); reaching 11,620 would mean cutting about 2,970 words, which is Must-state content. Part F is "as the topic needs" (QUALITY-BAR G1: over the cap is acceptable when the reviewer finds no redundancy to cut), so the FIX tasks cap their own deltas instead, and the ceiling goes to Jorge (For Jorge 1).

## Runs (the reviewer, Node 24.21.0, 2026-10-23 17:34)

- `labs/ts-js`: `npx vitest run 46-system`: 19 files, 106/106 passed (37 section tests, 31 exercise criteria × 2 variants, 7 Output tests).
- `node labs/tools/check-snippets.mjs . 46`: all snippets check out.
- `node labs/tools/check-links.mjs --planned`: all links resolve (237 to planned files).
- `node labs/tools/module-stats.mjs . 46`: 26 Q, 5 Ex, 14,474 prose words; types Design 7, Output 7, Trade-off 5, Bug hunt 4, Concept 2, Difference 1; no flags. The QUALITY-BAR python one-liner: 14,474.

No lab file change is requested; every finding is a Markdown text change. N-4 edits two Mermaid fences, so main re-parses them after FIX-M46-02.

## Reviewer's read-only script results

- **Markup:** B1 8 of each of the six subsections, 8 `mermaid` fences and 8 "What to notice" lines; D1 26 of each answer part; 33 misconceptions, 33 "Cause:"; `Unverified`, `relink`, `TASK` and `PLACEHOLDER` 0; `p75 on` / `INP on` 0.
- **Status markers:** `[Baseline 2019]` IntersectionObserver, `[Baseline 2021]` `visibilitychange`, `[Baseline 2015]` Page Visibility, `[Baseline 2022]` `randomUUID()` (each at first body mention, each matching MDN today), `[Stable since v22.0]` `@angular/aria` (as 36 §11). None on the draft, RFC 9110, the APG, Stripe or the architect guide.
- **Cited tests:** every backticked title exists verbatim; `Section N:` counts 6, 5, 6, 5, 4, 5, 6 (37); exercise criteria equal their `it(…)` titles (backticks aside) under `describe.each(['a', 'b'])`; 37 + 62 + 7 = 106, the run's count.
- **Determinism (C12):** no `Math.random`, `fetch(`, `localStorage`, `indexedDB`, `new BroadcastChannel`, `performance.now`, `process.env` or `randomUUID` in any lab file. Two `Date.now()` calls in `exercise-4.test.ts` run under `vi.useFakeTimers()` with `vi.setSystemTime(0)`, so they are deterministic.
- **Contracts:** six `http` fences open "# Illustrative contract, not a lab API"; §5's shows `If-Match: "7"` and a quoted `Idempotency-Key`; §8's shows the quoted key and the 400, 409 and 422 problem details and names the status read ours. No Java and no YAML fences.
- **D6:** 26/26 question IDs linked from the body.
- **External URLs:** 8 in the module, all in SOURCES.md `## Module 46`. Seven more read sources are cited by name only (N-5); their URLs are already in SOURCES.md.
- **Arithmetic re-done:** 2,000 events/s × 0.25 s = 500 per window, 4 renders a second; nearest rank ceil(0.95 × 20) = 19 → 190 of 10..200; `orders` last at 30 ms + 5,000 → stale from 5,031 ms (`now - seen <= limit` is live); presence last beat 15 s + 45 s → gone at 60 s (`now - at < ttl`); 30 down to 5 is 26 posts; 25,000 minor units = 250.00 EUR.

## QUALITY-BAR

45 items: **39 Pass, 6 Partial (B3, B6, C1, E1, F4, G1), 0 Fail.** H3 rests on the main session.

| ID | Result | Evidence |
|---|---|---|
| A1 | Pass | Lines 3-9 in order, Labs with the run command. |
| A2 | Pass | Prerequisites anchored: 45 §1, 42 §8, 43 §1. |
| A3 | Pass | §1, §4, §8; Q46.01, .09, .16, .22, .24; Summary. |
| A4 | Pass | 8 sections and the five closing parts. |
| A5 | Pass | Template → typeahead → feed → grid → wizard → dashboard → notifications → money transfer (most consistency-critical last). |
| B1 | Pass | 8 × 6 (script). |
| B2 | Pass | Each opens on concrete failures (a request per keystroke, a post twice, rows repeated on page 3, a crashed restore, a frozen tab, 3 versus 5 on the bell, money moved twice). |
| B3 | Partial | 8 diagrams of the planned types, each with "What to notice". Two arrows have the wrong sender: §3 draws the reader's pill activation from the Sentinel, §7 draws the catch-up as tab B messaging itself (N-4). |
| B4 | Pass | Each "How it actually works" answers a "why" from a named read: complete versus truncated, the APG combobox, the observer and `aria-busy`, the tiebreaker and table versus grid, the hidden transition, the throttling policies, set semantics and TTL, the draft's statuses. |
| B5 | Pass | Every `### Code` has an approach and numbered steps; §5 step 2 and §4 step 6 say what is "read, not run". |
| B6 | Partial | Every bullet has a reason except §3 "Reset `aria-busy` on every path" (N-3). |
| B7 | Pass | 33/33 with the true belief and a cause. |
| B8 | Pass | Framework vs platform in §2 and §3 (required); Coming from the backend in §4 and §8, each with "Where the analogy breaks". |
| B9 | Pass | Terms defined at first use (typeahead, complete/truncated result, active descendant, sentinel, anchor post, canonical query, tiebreaker, keyset cursor, visibility rule, schema version, stale limit, ring buffer, catch-up, heartbeat, lease, intent, fingerprint, structured-field String …). |
| B10 | Pass | Owners get a sentence and a link: 23 §8, 31 §4, 41 §6, 43 §8, 44 §8, 45 §5/§8, 36 §7/§8/§11, 24 §9, 09 §2/§7. |
| C1 | Partial | 46 of 50 sampled claims match; see F-1, F-2, N-1, N-2. |
| C2 | Pass | Seven Output answers equal their assertions (read in each test file). |
| C3 | Pass | Every "our model" result names its test; reads are dated. |
| C4 | Pass | Five MDN Baseline markers and one Angular marker, as listed above. |
| C5 | Pass | `Combobox`, `ComboboxWidget`, `ComboboxPopup` exist in `@angular/aria` 22.2.1 typings; no other Angular API in a snippet except `withInMemoryScrolling`, which 24 §9 owns. |
| C6 | Pass | 0 `Unverified`. |
| C7 | Pass | `check-snippets . 46` passes (reviewer's run). |
| C8 | Pass | 8/8 URLs in SOURCES.md; N-5's links use URLs already there. |
| D1 | Pass | 26 × 5 parts, each with two answered follow-ups and a trap with its reason. |
| D2 | Pass | Seven Output short answers give the lines and a reason sentence. |
| D3 | Pass | 6 tags, largest 7 of 26 (27%). |
| D4 | Pass | Q46.01-26 follow §1-§8. |
| D5 | Pass | None of the 39 listed owner questions is re-asked (headings of modules 01-45 grepped by topic); Exercises 23.5, 23.6, 28.2, 28.3, 31.2, 36.2, 41.3, 43.1, 43.3, 45.2 not rebuilt (46.3 and 46.4 name 45.2 and 43.3 as not rebuilt). |
| D6 | Pass | 26/26. |
| D7 | Pass | 26 anchors. |
| D8 | Pass | 26 ≤ 30, ≥ 15. |
| E1 | Partial | Full anatomy in all five. Exercise 46.5's worked solution step 5 does not say that its read-and-post loop has no cap (T-2). |
| E2 | Pass | 31/31 criteria equal their titles, both variants. |
| E3 | Pass | A store over pages → a selection model → a saver with timers and conflicts → a hub with visibility and resync → a stateful client against four answers, lost responses and reloads. |
| E4 | Pass | 106/106 (reviewer's run); no `any`; `tsc` is main's (CLOSE-M46). |
| E5 | Pass | Seven Output questions (not binding on Part F). |
| F1 | Pass | Two paragraphs link all eight sections and restate each case's hard step. |
| F2 | Pass | Three prompts, each naming a listener. |
| F3 | Pass | Five flashcards. |
| F4 | Partial | Builds on gives a reason per link; Read next and Comparisons give reasons; "Uses these ideas later: 47, file-level" gives none (N-6). |
| G1 | Partial | 14,474 now, about 14,590 after fixes, against the 11,620 ceiling of the REVIEW-M46 block; the only redundancy found is about 28 words (N-7). Part F's rule ("as the topic needs") is met; the ceiling is For Jorge 1. |
| G2 | Pass | 7/7 SYLLABUS §4 (46) checkboxes plus the module line (M46.md breadth gate, re-walked). |
| H1 | Pass | Reviewer's Vitest run above; `tsc` and `ng` at CLOSE-M46 (main). |
| H2 | Pass | `check-links --planned` passes (reviewer's run). |
| H3 | Pass (main) | Main checks `git status`. |

Totals: **39 Pass, 6 Partial (B3, B6, C1, E1, F4, G1), 0 Fail.**

## Module-specific checks

| Check | Result | Evidence |
|---|---|---|
| Claims about interviews, companies or products are advice or a named, dated read (C1) | Pass | 0 found stated as fact (Advice check above). |
| Draft re-read at its current version, called an Internet-Draft with number and date | Pass | -08 is current (datatracker, 2026-10-23); §8 names "an IETF Internet-Draft, draft-ietf-httpapi-idempotency-key-header-08 (22 October 2026 …), not an RFC". |
| All of §2.2's MUST and MUST NOT | Partial (F-1) | The first sentence is quoted; "Uniqueness of the key MUST be defined by the resource owner and MUST be implemented by the clients of the resource" is not. |
| §2.6 completed-retry and concurrent-request wording | Partial (F-1) | The completed-retry sentence is quoted (§8, Q46.23, a misconception, a flashcard); the concurrent-request sentence ("a resource conflict error") is not; the 409 comes from §2.7 only. |
| §2.7 SHOULD 400 / 422 / 409 and "MUST correct … with the exception of 409" | Pass | Quoted whole in §8, with the MUST fail branch. |
| §2.6 not flattened into "must replay" | Pass | Replay is "a choice", ours and Stripe v1's, in five places; the lab header says the same. |
| RFC 9110 §9.2.2, §15.5.1, §15.5.10, §15.5.21 re-read | Pass | §15.5.10 and §15.5.21 (abridged, says so) and §9.2.2 quoted correctly; §15.5.1 is not quoted (not a Must-state fact). |
| Stripe re-read, one vendor, "For API v1" | Pass | §8 and Exercise 46.5 quote it with "one vendor" and v1; the 24-hour and "pruned" sentences match. |
| APG combobox, grid, feed, introduction; informative; no WCAG requirement claimed | Pass, one nit | All quotes match; "informative" in §2, §3, §4 and Q46.02; "we call nothing here a requirement". Down Arrow drops its condition (N-1). |
| MDN Intersection Observer, Page Visibility, `visibilitychange`, `randomUUID()`: Baseline and quotes; WebSockets/WebRTC exception; no SSE claim (C17) | Pass, one nit | Years and quotes match; §6 says MDN names only WebSockets and WebRTC among connections and claims nothing for other transports. "Frames stop" drops MDN's "Most browsers" (N-2). |
| `@angular/aria` only as 36 §11 states it | Pass | Marker and directive names "status per 36 §11"; the three classes exist in 22.2.1. |
| Field p75 and lab budgets never fused | Pass | grep 0; §6 states field p75 (08 §6) and, separately, the lab budget (45 §3). |
| Money rule agrees with 45 §8 | Pass | §8 "Pending, never success": "This agrees with 45 §8's "irreversible or money actions pessimistic": only the acknowledgement is immediate"; Q46.24 the same. |
| Every case section carries §1's six template parts | Partial (T-1) | Seven of seven have the numbers fence, diagram, contract fence, a State sentence linking 45 §5, a failure-mode list linking 45 §8, and a kernel Excerpt; §5, §6 and §7 give no signal for any failure mode. |
| Direction facts (lesson 16) re-read at source | Pass | Draft 400/422/409 and §2.6; RFC 9110 409/422; Stripe "including `500` errors"; APG Down Arrow (N-1) and Escape; feed `aria-busy`; MDN throttling; 41 §6 tiebreaker. |
| Capability or denial tied to an implementation or our model (lesson 17) | Pass, one finding | Gate versus `switchMap`; WebSockets and WebRTC by name; replay ours and Stripe v1's; status read named ours. §8's "no arrow to Failed" is our model's, stated as the design's (F-2). |
| Models and fakes named as ours (C11) | Pass | See above. |
| Q46.03, .06, .11, .13, .17, .20, .26 against their tests | Pass | Line-for-line equal; the reviewer's run passes. |
| Follow-ups and traps with a reason; corrections with the true belief and a cause; Full explanations teach first and last; Code steps hold for every branch; one byte unit | Partial | 0, 0, 0 respectively; Code steps: T-2, N-8; byte unit held. |
| Must-state facts present or moved as CLOSE recorded | Pass, one finding | §1-§8 re-walked against M46.md; all present or moved (Corrections: Q46.16, Q46.19, Q46.21-23). §8's "F1's §2.2 MUST and MUST NOT" is present for the first sentence only (F-1). |
| Canonical statements (lesson 19), including 45's linked | Pass | Template in §1 (every case says "Parts in §1's order"); tiebreaker in §4 (Q46.09 links it); throttling in §6 (Q46.16, Exercise 46.4 point to it); `aria-busy` in §3; draft and pending rule in §8 (Q46.12, .22-.26, Exercise 46.5 link it). 45's steps, profiles, cache order, precondition outcomes and sender exclusion are linked, not restated. |
| Handoffs into 46 honored | Pass | 17:1499 → §8, Q46.22-23; 45:586 and 45:1042 → §8, Q46.24; 45:35/1225 → §1; 43:2008 → §6 (43 §1, §8) and §7 (Q43.02); 44:1985 → §6 (44 §8, 37 §6) and Q46.16; 42:2125 → §5 (Q42.22), §8 (42 §8); 33:2129 → §8 (Q33.02, "Avoid using sensitive data"); 34:1944 → §4 (34 §2), §8 (34 §10); 38:2041 → §6 (38 §1); 31:2013 → §3 (31 §4, Q31.10), §4 (45 §3); 32:2286, 30:1704, 39:1948, 40:1370 → §1. |
| Owner questions not re-asked, exercises not rebuilt | Pass | See D5. |
| Prose ≤ 11,620 after fixes | **Not met** | About 14,590 (For Jorge 1). |

## Handoffs

Module 46 slugs, from the `## N.` headings as in Contents:
- S6 `#6-a-real-time-operations-dashboard-aggregation-per-widget-staleness-hidden-tabs-and-screens-left-open-for-days`
- S8 `#8-under-the-hood-a-money-transfer-with-idempotency-keys-optimistic-ui-that-never-claims-success-and-the-unknown-outcome`

Re-located on 2026-10-23: each line below holds exactly one link to `46-system-design-case-studies.md`; today 0 links into 46 carry an anchor.

| Target | Links (module:line), 5 rows, +0 words |
|---|---|
| S6 | 43:2008 ("**Read next:**" … "`[46]`" … "(real-time case studies)") |
| S6 | 44:1985 ("**Read next:**" … "`[46]`" … "(deployment in case studies)") |
| S8 | 17:1499 (Q17 Full explanation: "use an idempotency key so retries are safe (`[Module 46 case study]`)") |
| S8 | 45:586 (45 §8: "irreversible or money actions pessimistic (`[46]`)") |
| S8 | 45:1042 (Q45.16 follow-up: "money likewise (`[46]`)") |

Each link keeps its text; only the target gains the slug. Stay file-level: the `:5` "Leads to" lines of 33, 42, 43, 44 and 45; 45:35 and 45:1225 (they mean the whole module); every "Uses these ideas later" line (30:1704, 31:2013, 32:2286, 33:2129, 34:1944, 38:2041, 39:1948, 40:1370, 42:2125, 43:2009, 44:1986, 45:1226), as REVIEW-M44 and REVIEW-M45 kept them. These are M46.md's anchor candidates exactly; the three body links follow the REVIEW-M46 block ("per "Read next" or body link"), which goes beyond M46.md lesson 30.

## Factual findings

**F-1 · Minor (C1; REVIEW-M46 block, lesson 24) · §8 quotes §2.2 and §2.6 of draft-08 in part (981, 983).**
- §2.2 has two sentences with MUST: the module quotes "MUST be unique and MUST NOT be reused …" but not "Uniqueness of the key MUST be defined by the resource owner and MUST be implemented by the clients of the resource." That second sentence is what makes the key's format the API's to publish, which §8's "Key retention … published by the API" and Exercise 46.5's §2.3 follow-up lean on.
- §2.6 has two duplicate-request cases; the module quotes the completed-retry one and takes its 409 from §2.7 only. §2.6's concurrent case reads "The resource SHOULD respond with a resource conflict error."
- Fix, two places (+28). Find each by its text:
  - §8 "The draft." paragraph: `§2.2: "The idempotency key MUST be unique and MUST NOT be reused with another request with a different request payload"; "It is RECOMMENDED` → `§2.2: "The idempotency key MUST be unique and MUST NOT be reused with another request with a different request payload"; "Uniqueness of the key MUST be defined by the resource owner and MUST be implemented by the clients of the resource"; "It is RECOMMENDED` (+20)
  - §8 next paragraph: `409 when a retry arrives "while the original request is still being processed";` → `409 when a retry arrives "while the original request is still being processed" (§2.6, a concurrent request: "a resource conflict error");` (+8)

**F-2 · Minor (C1; lessons 4 and 17, our model stated as the design) · §8 "What to notice" (977).**
- The text reads: "What to notice: only a confirm makes a key, and Unknown has no arrow to Failed."
- The diagram is the section's design, but "no arrow to Failed" and "status read finds it → Succeeded" hold only in our model, which has no business rejection (M46.md Corrections, SEC-M46-08; `transfer.ts` maps a 200 read to `succeeded`). A real status read can find a declined transfer, and Stripe v1 replays a saved error response ("including `500` errors"). The point the line wants (a lost response alone never becomes Failed) is true and must stay.
- Fix (+25): `What to notice: only a confirm makes a key, and Unknown has no arrow to Failed.` → `What to notice: only a confirm makes a key, and a lost response alone never leads to Failed; our model has no business rejection, so its status read finds only successes, while a real API may report a declined transfer.`

## Teaching findings

**T-1 · Minor (template part 5, §1; lesson 19) · failure modes with no signal in §5, §6 and §7 (598, 724, 880).**
- §1 defines part 5 as "The failure modes, each with a **degraded behavior** and a **signal**". §2, §3, §4 and §8 give signals. §5 opens "(each with a degraded behavior and a signal; our suggestions)" and then gives none; §6 and §7 give none.
- Fix, three places (+33). Find each by its text:
  - §5 (+14), fenced pair, first line find, second line replacement:

```text
The final submit validates every visible step again (`landingStep` answers `review` only when all are valid, tests) and is one action with one key.
The final submit validates every visible step again (`landingStep` answers `review` only when all are valid, tests) and is one action with one key. Signals (ours): the rates of failed saves, conflicts, failed migrations and resumes after sign-in.
```

  - §6: `a dropped stream turns widgets stale, a throwing widget is caught by its boundary, a new release raises the prompt.` → `a dropped stream turns widgets stale, a throwing widget is caught by its boundary, a new release raises the prompt; signals: stale widgets, boundary errors, clients on an old release.` (+10)
  - §7: `a stale entry ends at the time-to-live.` → `a stale entry ends at the time-to-live; signals: reconnects with their catch-up size, push permission denials.` (+9)

**T-2 · Minor (E1, lesson 29: a step holds for every branch; EX-M46-05's open item) · Exercise 46.5 worked solution step 5 (2107).**
- The text reads: "5. After `maxAttempts`, read by key: 200 settles; 404 or 409, wait and post again."
- In both variants (`a/transfer-client.ts` lines 63-72; `b/` the same), after the attempts are spent the client alternates a read and a post with no bound. The step reads as if the loop ends; §8's own signal ("intents still unknown after the last retry") assumes it does.
- Fix (+27), fenced pair:

```text
5. After `maxAttempts`, read by key: 200 settles; 404 or 409, wait and post again.
5. After `maxAttempts`, read by key: 200 settles; 404 or 409, wait and post again. Ours alternates read and post with no cap; a real client stops after a few rounds and shows "contact support" with the key (advice; read, not run).
```

**Nits** (each find/replace below; texts that hold relative links are fenced so the link checker does not read this file's copy)
- **N-1 (lesson 24, condition dropped):** §2 (190). APG: "Down Arrow: If the popup is available, moves focus into the popup". `Down Arrow "moves focus into the popup", Escape` → `Down Arrow "moves focus into the popup" if the popup is available, Escape` (+5)
- **N-2 (lesson 24, "most"):** §6 (733). MDN: "Most browsers stop sending `requestAnimationFrame()` callbacks". (+3)

```text
So hidden timers slow, frames stop and a `setTimeout` poll slows too.
So hidden timers slow, frames stop in most browsers and a `setTimeout` poll slows too.
```

- **N-3 (B6, reason missing):** §3 Best practices (380). (+12; APG feed: "or the changes may not become visible to some assistive technology users")

```text
- **Reset `aria-busy` on every path**, failures included.
- **Reset `aria-busy` on every path**, failures included, because a feed left busy may hide its changes from assistive technology.
```
- **N-4 (B3, wrong sender in two diagrams; 0 prose):**
  - §3 `sequenceDiagram` (284-296): after the line `    participant V as Server` insert the line `    participant R as Reader`, and replace the line `    S->>F: reader activates the pill` with `    R->>F: activates the pill` (the Sentinel does not click the pill).
  - §7 `sequenceDiagram` (840): replace the line `    B->>B: reconnect, catch-up sends n7 again` with `    S->>B: n7 again, in the catch-up after a reconnect` (the server sends the catch-up).
  - Both "What to notice" lines stay. Main re-parses both diagrams.
- **N-5 (references are links, REVIEW-M44 N-2; +0 words):** seven read sources are named without a link; each URL is already in SOURCES.md `## Module 46`. Fenced pairs, first line find, second line replacement:

```text
(RFC 6585 §4, read 2026-10-22)
([RFC 6585 §4](https://www.rfc-editor.org/rfc/rfc6585.html), read 2026-10-22)
and MDN lists "infinite scrolling" websites
and [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) lists "infinite scrolling" websites
(PostgreSQL 18 documentation, section 9.25.5, read 2026-10-22)
([PostgreSQL 18 documentation](https://www.postgresql.org/docs/current/functions-comparisons.html), section 9.25.5, read 2026-10-22)
MDN's `visibilitychange` page [Baseline 2021
[MDN's `visibilitychange` page](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event) [Baseline 2021
MDN's Page Visibility API page [Baseline 2015
[MDN's Page Visibility API page](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API) [Baseline 2015
"only in secure contexts (HTTPS)" (MDN, read 2026-10-22)
"only in secure contexts (HTTPS)" ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID), read 2026-10-22)
MDN: an app "has to have an active service worker"
[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Push_API): an app "has to have an active service worker"
MDN (quoted in section 6)
MDN (quoted in [section 6](#6-a-real-time-operations-dashboard-aggregation-per-widget-staleness-hidden-tabs-and-screens-left-open-for-days))
```

  (Places: §2 line 185, §3 318, §4 446, §5 596, §6 726, §8 981, Q46.19 1612, Exercise 46.4 2071. PostgreSQL's `current` is version 18 today, and that is the URL SOURCES.md records.)
- **N-6 (F4, link without a reason):** Connections (2185). Fenced pair:

```text
- **Uses these ideas later:** [47](47-behavioral-and-interview-craft.md), file-level.
- **Uses these ideas later:** [47](47-behavioral-and-interview-craft.md) (a case told as a project story), file-level.
```

  (+6)
- **N-7 (G1, repeats inside three Output Full explanations; −28):** after main restored each Output answer's reason sentence at CLOSE, three Full explanations say the same clause twice. Keep the restored sentence; drop the later repeat. Fenced pairs in order Q46.06 (1276, −16), Q46.11 (1403, −6), Q46.13 (1463, −6):

```text
A live arrival already in the list is not new, so post 21 is ignored. Live items wait in the buffer, so post 31 changes nothing until `showNew`.
So post 21 is ignored, and post 31 changes nothing until `showNew`.
Both URLs share one key. A cursor continues one filter and sort only, so a sort change clears it.
Both URLs share one key; a cursor continues one filter and sort only.
Visibility is computed from the answers: a home claim has no `vehicle` step.
A home claim has no `vehicle` step.
```

- **N-8 (ambiguous step):** Exercise 46.5 worked solution step 3 (2105). "Rejected" reads as a server refusal, which `settle` maps to `failed`. (+4)

```text
3. `settle` makes a rejected post `unknown`, because
3. `settle` makes a post whose promise rejects (a timeout) `unknown`, because
```

## Judged acceptable

- **§1's diagram arrows versus its table:** the arrows end on a template part (where the weight goes), the table names a method step (where the case is hard); both are labeled "our suggestion".
- **Q46.26's short answer "the completed retry gets the first response":** it reports our server (an Output question on our model), and the Full explanation says the replay is our choice and §2.6 asks only a consistent response.
- **§8 "POST needs a key because "PUT, DELETE, and safe request methods are idempotent"":** an inference from §9.2.2's list (POST is absent); Q09.01 owns idempotent methods and is linked.
- **Q46.16's budget figures (Firefox +50 to −150 ms, 30 s; Chrome in seconds, 10 s; 10 ms a second; audible tabs):** they match MDN today; SEC-M46-06 moved them there from §6 by record.
- **Exercise 46.3 step 6 re-quotes the `visibilitychange` sentence:** not one of lesson 19's canonical facts; §5's quote and this one agree.
- **§5's failure paragraph has no 45 §8 link of its own:** the paragraph above links 45 §8 for the precondition, inside the same section.
- **`Date.now()` in `exercise-4.test.ts`:** under fake timers with `setSystemTime(0)`.
- **45:1225 "the method on six full designs":** SYLLABUS's six cases; the seventh is the stretch case (45:35 and §1 say so). No FIX to module 45.
- **The status read's 409 and 404 (`find`):** our contract, named "Our status read by key; the draft defines no lookup".

## Claims sampled (50)

| # | Claim (location) | Basis | Result |
|---|---|---|---|
| 1 | Draft -08 current, Internet-Draft, 22 October 2026 (§8, header) | datatracker; -08 text | Match |
| 2 | §2.1 "MUST be a String" (§8) | -08 §2.1 | Match |
| 3 | §2.2 MUST unique, MUST NOT reuse (§8, Q46.23) | -08 §2.2 | Match, partial quote (F-1) |
| 4 | §2.2 RECOMMENDED UUID (§8) | -08 §2.2 | Match |
| 5 | §2.3 SHOULD publish expiry, MAY purge (§8, Ex 46.5) | -08 §2.3 | Match |
| 6 | §2.4 fingerprint MAY, from the payload (§8) | -08 §2.4 | Match |
| 7 | §2.6 completed retry "consistent with …" (§8, Q46.23, flashcard) | -08 §2.6 | Match |
| 8 | 409 for a concurrent retry (§8) | -08 §2.7 (and §2.6, unquoted) | Match, partial (F-1) |
| 9 | SHOULD 400 missing, 422 different payload (§8) | -08 §2.7 | Match |
| 10 | "Clients MUST correct … or the resource MUST fail …" (§8) | -08 §2.7 | Match |
| 11 | RFC 9110 §15.5.10 409 (§8) | RFC 9110 | Match |
| 12 | RFC 9110 §15.5.21 422, abridged (§8) | RFC 9110 | Match |
| 13 | §9.2.2 PUT, DELETE, safe methods idempotent (§8) | RFC 9110 | Match |
| 14 | 422 reason phrase "Unprocessable Content" (§8 fence) | RFC 9110 §15.5.21; -08 example | Match |
| 15 | Stripe v1 saves the first result, replays "including `500` errors" (§8) | docs.stripe.com | Match |
| 16 | Stripe v1 keys removable at "at least 24 hours old" (§8) | docs.stripe.com | Match |
| 17 | Stripe "We generate a new request if a key is reused after the original is pruned" (Ex 46.5) | docs.stripe.com | Match |
| 18 | Stripe "Avoid using sensitive data" (§8, Q46.22) | docs.stripe.com | Match |
| 19 | `randomUUID()` Baseline 2022, secure contexts, v4 (§8) | MDN | Match |
| 20 | Architect guide Q26 "same transaction as the business write"; two-phase record (§1, §8) | repository guide l. 656 | Match |
| 21 | APG combobox definition, role, states (§2) | APG combobox | Match |
| 22 | `aria-activedescendant` sentence (§2) | APG combobox | Match |
| 23 | Down Arrow "moves focus into the popup" (§2) | APG combobox | Condition dropped (N-1) |
| 24 | Escape "Dismisses the popup if it is visible." (§2) | APG combobox | Match |
| 25 | APG "informative", "does not specify normative requirements" (§2-§4) | APG introduction | Match |
| 26 | APG feed definition, roles, `aria-busy` rule (§3) | APG feed | Match |
| 27 | Control + End leaves the feed (§3, Q46.08) | APG feed | Match |
| 28 | Grid: one tab stop; table: every focusable element (§4) | APG grid | Match |
| 29 | `aria-sort` on the sorted header (§4) | APG grid | Match |
| 30 | IntersectionObserver Baseline 2019, quote, "infinite scrolling" use (§3) | MDN | Match |
| 31 | `visibilitychange` Baseline 2021, "last event that's reliably observable" (§5, Ex 46.3) | MDN | Match |
| 32 | Page Visibility Baseline 2015 and four policy quotes (§6) | MDN | Match |
| 33 | "Frames stop" in hidden tabs (§6) | MDN ("Most browsers") | Qualifier dropped (N-2) |
| 34 | IndexedDB exempt; no other transport claimed (§6) | MDN | Match |
| 35 | Budget figures (Q46.16) | MDN | Match |
| 36 | Push needs "an active service worker" (Q46.19) | MDN Push API | Match |
| 37 | 429 "MAY include a Retry-After header" (§2) | RFC 6585 §4 | Match |
| 38 | PostgreSQL row comparison left-to-right; null unknown (§4) | PostgreSQL 18 docs 9.25.5 | Match |
| 39 | `@angular/aria` [Stable since v22.0]; `Combobox`, `ComboboxWidget`, `ComboboxPopup` (§2) | 36 §11; 22.2.1 typings | Match |
| 40 | 41 §6 "ties leave order undefined"; Q41.13 "a stable sort and a unique tiebreaker" (§4) | 41 | Match |
| 41 | 41 §6 offset pages need a total, "most databases build the whole result first" (Q46.10) | 41 §6 | Match |
| 42 | 36 §8 linear stepper gate (§5) | 36 §8 | Match |
| 43 | Router restores scroll only under `withInMemoryScrolling` (§3, Q46.08) | 24 §9 | Match |
| 44 | 45 §8 "irreversible or money actions pessimistic" (§8, Q46.24) | 45:586 | Match |
| 45 | Unknown never reaches Failed (§8 What to notice) | `transfer.ts`; M46.md Corrections | Our model only (F-2) |
| 46 | Q46.03, Q46.06, Q46.11 lines | their tests | Match |
| 47 | Q46.13, Q46.17, Q46.20, Q46.26 lines | their tests | Match |
| 48 | Section 2-8 test titles cited in the prose | the seven `section-N` tests | Match |
| 49 | Exercise accounts (e.g. "about 1239 selected", replayed 201 at 1,000 ms, stale at 5,001 ms) | exercise tests | Match |
| 50 | Exercise 46.5 retries end (step 5, implied) | `exercise-5-transfer-client/a` and `b` | No cap (T-2) |

46 match; 4 findings or nits (F-1 rows 3 and 8 counted once, F-2, N-1, N-2) and T-2 (row 50, a teaching gap rather than a false claim).

## Proposed FIX tasks

The module is at 14,474 words. All fixes together add about +116: F about +53 (F-1 +28, F-2 +25); T about +60 (T-1 +33, T-2 +27); nits about +3 (N-1 +5, N-2 +3, N-3 +12, N-4 0, N-5 0, N-6 +6, N-7 −28, N-8 +4, with rounding +1). That gives about 14,590, above the block's 11,620 ceiling (For Jorge 1). Each FIX caps its own measured delta; if a fixer passes its cap, it shortens only its own added clauses, never a quote, a cause, a "because" or a link.

```
| FIX-M46-01 | S | todo | REVIEW-M46 |  |
| FIX-M46-02 | S | todo | REVIEW-M46 |  |
| FIX-M46-03 | S | todo | REVIEW-M46 |  |
```

- **FIX-M46-01 · S · Sonnet (texts prescribed).** F-1, F-2, T-1, T-2 and N-8 (§5, §6, §7, §8, Exercise 46.5). About +117.
- **FIX-M46-02 · S · Sonnet (texts prescribed).** N-1 to N-7 (§2, §3, §4, §5, §6, §8, Q46.06, Q46.11, Q46.13, Q46.19, Exercise 46.4, Connections; two Mermaid fences). Runs after FIX-M46-01, because both touch §6's and §8's paragraphs, on disjoint text. About −2.
- **FIX-M46-03 · S · Haiku (mechanical; slugs listed).** Anchors for the 5 links into 46. No FIX changes a heading, so it may run in any order.

## For Jorge

1. **The ceiling (M46.md For Jorge 7, still open).** The REVIEW-M46 block says "prose at most 11,620 after fixes"; the module closed at 14,474 and the fixes bring it to about 14,590. This review found about 28 words of redundancy (N-7); the rest is Must-state content (the draft's and RFC's quotes, the APG and MDN quotes, seven kernels with their tests, 26 answers and 5 exercises). Reaching 11,620 means cutting about 2,970 words of planned content. Recommended: accept about 14,600 as Part F "as the topic needs" (QUALITY-BAR G1) and record the new ceiling in M46.md; the FIX tasks are written to that assumption (each caps its own delta). If you want a hard 11,620, say so before the FIX tasks run, and a separate trim task (Opus, moving content to questions or dropping it) is needed.
2. **Exercise 46.5's retry loop (T-2).** The fix states in the text that our client never stops alternating a read and a post; the lab is unchanged. If you want the cap in the code (a `maxRounds` and a `contact-support` state in both variants, a seventh-plus criterion and test), that is an EX-size change (M, Opus, about +60 words) rather than a FIX.
3. **Anchors on body links.** FIX-M46-03 anchors three body links (17:1499, 45:586, 45:1042) as well as the two "Read next" lines, because the REVIEW-M46 block asks for "Read next or body" links and M46.md's anchor candidates list all five. M46.md lesson 30 named only "Read next" lines; say so if you want the body links left file-level.
4. **Carried open, no FIX:** the draft is still -08 (2026-10-23; a later version would need a re-read of §2.1-§2.7, C4); Stripe remains the only vendor named (C3).
