# REVIEW-X-07: independent review of the root files

- **Reviewer:** session S20261024-1030-claudecode, which wrote none of FIN-02…16 (those were S20261024-1001-claudecode), so it is eligible (RUN §4). Four fresh read-only reviewer subagents ran in parallel, with the model matched to the work: CS-1 (CHEATSHEET 01–21) and CS-2 (CHEATSHEET 22–47) on claude-sonnet-5-5 (bullet-against-link fidelity); MK (MOCK-INTERVIEWS, rubric, scoring) on claude-opus-5-5 (judgment); RD (README, QUESTION-INDEX and GLOSSARY samples) on claude-sonnet-5-5. Main (claude-opus-5-5) re-checked the one claim a reviewer doubted against the HTML Standard, judged every finding, wrote this report and the FIX-X tasks.
- **Date:** 2026-10-24.
- **Summary:** **372 cheat-sheet bullets** judged (166 + 206; 366 OK), **64 model-answer outlines**, 64 prompts and 64 scoring blocks (60 outlines OK), the rubric and intro (usable), **5 study paths**, 88 map edges, 47 table rows, 20 QUESTION-INDEX and 20 GLOSSARY samples (all match their sources). **20 findings: 1 High, 9 Medium, 10 Low. 17 fixed by FIX-X-20…24 (RD-F01 in part: its 5 clear cases), 3 not fixed** (RD-F02, RD-F05, RD-F06; reasons below).
- **The High finding (M-F01)** is in module 08, not only in the cheat sheet: 08's Summary says `defer` and module scripts do not wait for pending CSS. The HTML Standard says the opposite. CS-1 flagged the cheat-sheet bullet and asked main to check the source.

## Runs

Verified by running (main, Node 24):
- `grep -c '^- ' CHEATSHEET.md` 372 = anchored bullets 372; `grep -c '^## Mock [1-8] · '` 8; TASK markers 0 in all five root files; level-label grep (`junior|senior|mid-level|intermediate|advanced level|expert level`): 2 hits, both the technical sense of "intermediate" (MOCK-INTERVIEWS 185, GLOSSARY 2214), so 0 labels; `proseWords`: CHEATSHEET 7,399 (max module 159 ≤ 160), MOCK-INTERVIEWS 12,441, README 4,206; `node labs/tools/check-links.mjs` "All links resolve.", exit 0.
- `curl` of `https://html.spec.whatwg.org/multipage/parsing.html`, §13.2.7 *The end*: "Spin the event loop until the first script in the list of scripts that will execute when the document has finished parsing has its ready to be parser-executed set to true and the parser's Document has no style sheet that is blocking scripts." Module scripts are deferred by default (08 §1), so they are on the same list.
- Reviewers (from their reports): RD ran `module-stats`, `check-links`, `question-index.mjs --check` and `glossary.mjs --check` (all exit 0), recomputed the 5 path totals (409.5, 197, 137, 369.5, 137 h, all equal to the text) and the map's edge set against SYLLABUS §1 (symmetric difference empty); MK checked by command that all 162 Q-ID mentions are links whose anchors exist, every outline ≤ 120 words, each mock 1,290–1,562 prose words. Every old text below occurs exactly once (asserted by the apply script).

Read, not run: every bullet's and outline's linked passage (reviewers); FINISH.md §6, §9; SYLLABUS §1–§3; module headers; STYLE-GUIDE §3.2; VERSIONS.md.

## Findings

| Finding | Severity | Summary | Location (as of the review) | FIX-X |
|---|---|---|---|---|
| M-F01 | High | 08's Summary (and the cheat-sheet bullet from it) says `defer` and module scripts do not wait for pending CSS; the HTML Standard runs them only once no style sheet blocks scripts. 08:473 implies the same contrast | `modules/08-browser-rendering-dom-events.md:57, 436, 473`; `CHEATSHEET.md:89` | FIX-X-21 (08), FIX-X-20 (cheat sheet) |
| CS1-F01 | Medium | Proxy and `#private`: "forward with the receiver" is the getter fix; the owner's fix is binding methods to the target | `CHEATSHEET.md:34` | FIX-X-20 |
| CS1-F02 | Medium | Merged into M-F01 (same bullet) | `CHEATSHEET.md:89` | FIX-X-20 |
| CS1-F03 | Medium | The CommonJS cycle clause is taught in 05 §2, not the linked §1 | `CHEATSHEET.md:53` | FIX-X-20 |
| CS1-F04 | Low | `fetch` rejection drops "a malformed request" | `CHEATSHEET.md:100` | FIX-X-20 |
| CS1-F05 | Low | "most new apps" vs the linked §7's "a new small app" | `CHEATSHEET.md:118` | FIX-X-20 |
| CS1-F06 | Low | `[attr.title]` removes the attribute only on `null` | `CHEATSHEET.md:149` | FIX-X-20 |
| MK-F01 | Medium | Every red flag scores Correctness 0, including process and behavioral ones | `MOCK-INTERVIEWS.md:45` | FIX-X-22 |
| MK-F02 | Medium | Mock 8 P8 (asking questions) is scored on Evidence, which it cannot earn | `MOCK-INTERVIEWS.md:933` | FIX-X-22 |
| MK-F03 | Medium | Mock 2 P7's outline never answers its "Reactive forms?" follow-up | `MOCK-INTERVIEWS.md:263` | FIX-X-22 |
| MK-F04 | Low | `{ leading: true, trailing: true }` reads as given to both operators | `MOCK-INTERVIEWS.md:293` | FIX-X-22 |
| MK-F05 | Low | Mock 4 P5 drops the owner's "(a design, not run)" | `MOCK-INTERVIEWS.md:459` | FIX-X-22 |
| MK-F06 | Medium | Mock 7 P6 full marks need the five cache layers, which neither outline nor owner names | `MOCK-INTERVIEWS.md:795` | FIX-X-22 |
| MK-F07 | Low | Mock 7 P6 credits the service-worker clause to 09 §4, not §9 | `MOCK-INTERVIEWS.md:795` | FIX-X-22 |
| RD-F01 | Medium | Homonyms merged under one glossary key (`scope`, `state`, `signal`, `MDC` …) list another sense as "also in" | `_meta/GLOSSARY-TERMS.md:2478, 2504, 2680, 2744, 2815` → `GLOSSARY.md` | FIX-X-24 (5 clear cases); the rest not fixed (below) |
| RD-F02 | Medium | Backend path skips 33 §8–§9, which 42 lists | `README.md:294` | not fixed |
| RD-F03 | Low | Wrong reason for 27 on day 3 (SYLLABUS already had 27 before 28) | `README.md:272` | FIX-X-23 |
| RD-F04 | Low | Module 23 "read for its operators" (operators are 22) | `README.md:272` | FIX-X-23 |
| RD-F05 | Low | Architect path omits 43 §1, which 46 lists | `README.md:334` | not fixed |
| RD-F06 | Low | "architect-level interview" as a level label | `README.md:7` | not fixed |

**Not fixed, with the reason:**
- RD-F02 and RD-F05: each path already says, in the paragraph the finding cites, that the sections a path skips are reached through the headers' Prerequisites links ("follow the section links in each header's Prerequisites line", 294; "the headers' Prerequisites lines link the section…", 334). 42's and 46's headers link 33 §8–§9 and 43 §1. Naming them again adds words without new guidance.
- RD-F06: the sentence describes the reader's goal, the audience range FINISH §6.5 allows ("beginner to architect"); the next sentence states the no-labels rule for content. No content is labeled.
- RD-F01, the remaining groups: the reviewer's detector (definition word overlap below 0.08 within one key) flags 78 groups, but it has false positives (`authentication` 33/42 and `app shell` 09/37 are one sense in other words). Each group needs a judgment, not a prescribed text; listed under For Jorge.

**Recorded writer deviations (MK, RD judgments):** M3 P6, M4 P7, M6 P5, M7 P6 acceptable; M8 P7 Evidence acceptable, P8 not (MK-F02). Path changes: week adds 47, backend adds 04/12/13 and moves 17 forward, architect adds 42, linear and fundamentals read 16 before 15: all acceptable; 27's placement is valid but its stated reason is wrong (RD-F03).

**Rubric verdict (MK):** usable. The four dimensions are distinct and observable, and each Full/Partial/Missing cell names something checkable; the intro covers timing, out loud, one follow-up at a time, self-scoring and the pointer to 47. Its flaws are MK-F01 and MK-F02.

## Fix texts (verbatim; each old text occurs exactly once in its file)

Applied by the FIX-X task named in the heading. Fix texts adjusted by main: M-F01 (the reviewer's cheat-sheet text kept the false contrast; the new text fits 08's 160-word budget, 158 → 159); CS1-F03 (deletion leaves the sentence's own period); RD-F01 renames only the later sense of each key, so the existing anchors (`scope`, `state`, `signal`, `mdc`) keep their first-defined meaning.

### FIX-X-20 · `CHEATSHEET.md`

1. Old:
````text
forward with the receiver
````
   New:
````text
bind methods to the target in a `get` trap
````
2. Old:
````text
; in CommonJS a cycle gets a half-filled object.
````
   New:
````text
.
````
3. Old:
````text
a classic script waits for that CSS, while `defer` and module scripts do not.
````
   New:
````text
a classic script waits for it, parser stopped; `defer` and module scripts wait, parser running.
````
4. Old:
````text
rejects only on network failure or abort
````
   New:
````text
rejects only on a network failure, a malformed request or an abort
````
5. Old:
````text
native nesting covers most new apps
````
   New:
````text
native nesting covers a new small app
````
6. Old:
````text
`[attr.title]` removes the attribute
````
   New:
````text
`[attr.title]` removes the attribute on `null`
````

### FIX-X-21 · `modules/08-browser-rendering-dom-events.md`

1. Old:
````text
in document order;
````
   New:
````text
in document order, and only once the document "has no style sheet that is blocking scripts" ([HTML Standard, The end](https://html.spec.whatwg.org/multipage/parsing.html#the-end));
````
2. Old:
````text
a classic script stops the parser and waits for that CSS, and `defer` and module scripts do not
````
   New:
````text
a classic script stops the parser and waits for that CSS; `defer` and module scripts never stop the parser, though they too run only after that CSS
````
3. Old:
````text
Not quite: it still waits for pending CSS and runs synchronously.
````
   New:
````text
Not quite: it is still a classic script that runs synchronously; `defer` states the intent.
````

### FIX-X-22 · `MOCK-INTERVIEWS.md`

1. Old:
````text
Saying it scores Correctness 0 on that prompt, however good the rest of the answer is.
````
   New:
````text
Saying it scores 0 on that prompt, however good the rest of the answer is: on Correctness for a wrong fact, on Communication for a process red flag (scaffolding before asking, a score quoted as the diagnosis), on Evidence for a behavioral one.
````
2. Old:
````text
**Scoring:** Full marks ask by area for the role
````
   New:
````text
**Scoring:** Evidence and Trade-offs are n/a here, since no story is told. Full marks ask by area for the role
````
3. Old:
````text
The reactive-forms point is documented only.
````
   New:
````text
Reactive forms: the docs say model updates schedule no detection (documented only).
````
4. Old:
````text
passing `{ leading: true, trailing: true }` because the default drops the trailing value.
````
   New:
````text
passing `{ leading: true, trailing: true }` to `throttleTime`, whose default drops the trailing value.
````
5. Old:
````text
A failed request is mapped to a result inside the validator, for example with `catchError`.
````
   New:
````text
A failed request is mapped to a result inside the validator, for example with `catchError`, so the stream still ends (a design, not run).
````
6. Old:
````text
Five layers, nearest first. Each holds
````
   New:
````text
Five layers, nearest first: component, in-memory cache, service worker, HTTP cache and CDN ([45 §7](modules/45-frontend-system-design-method.md#7-rendering-strategy-and-caching-layers-a-rendering-choice-per-route-and-every-cache-from-the-cdn-to-the-component)). Each holds
````
7. Old:
````text
`index.html` differs because `no-cache` makes the HTTP cache revalidate it, so without a service worker a deploy shows on the next load; an installed worker keeps serving its own copy until it updates ([09 §4](modules/09-web-networking-storage-security.md#4-http-caching)).
````
   New:
````text
`index.html` differs because `no-cache` makes the HTTP cache revalidate it ([09 §4](modules/09-web-networking-storage-security.md#4-http-caching)), so without a service worker a deploy shows on the next load; an installed worker keeps serving its own copy until it updates ([09 §9](modules/09-web-networking-storage-security.md#9-service-workers-and-the-pwa-manifest)).
````

### FIX-X-23 · `README.md`

1. Old:
````text
Module 27 comes on day 3 because 28 lists it as a prerequisite.
````
   New:
````text
Module 27 comes on day 3, straight after 23, which it lists as a prerequisite, and ahead of 28, which lists 27.
````
2. Old:
````text
Module 23 is read for its operators and higher-order mapping, which is where its Short on time line starts (
````
   New:
````text
Module 23's Short on time line starts with higher-order mapping (
````

### FIX-X-24 · `_meta/GLOSSARY-TERMS.md`

1. Old:
````text
- **state**: a random request value
````
   New:
````text
- **state (OAuth)**: a random request value
````
2. Old:
````text
- **scope**: a permission granted to the client
````
   New:
````text
- **scope (OAuth)**: a permission granted to the client
````
3. Old:
````text
- **signal**: a notice the kernel
````
   New:
````text
- **signal (process)**: a notice the kernel
````
4. Old:
````text
- **signal**: the data that reports a failure
````
   New:
````text
- **signal (telemetry)**: the data that reports a failure
````
5. Old:
````text
- **MDC**: the logging framework
````
   New:
````text
- **MDC (logging)**: the logging framework
````

## For Jorge

- **Glossary homonyms (RD-F01, the rest).** FIX-X-24 splits the five clear cases. To find the others: group `_meta/GLOSSARY-TERMS.md` entries by `normalizeKey` (`labs/tools/glossary.mjs`), and within each key compare the first definition's words (4+ letters, parentheses dropped) with each later one; a Jaccard overlap below 0.08 flagged 78 pairs, among them `baseline` (08/30/47), `locator`, `checkpoint`, `select`, `selector`, `slot`, `target`, `query`, and false positives such as `authentication`. Say if you want a judged HOUSE task for them (about an M on Sonnet); the convention is the existing qualifier, as in `scope (template)`.
