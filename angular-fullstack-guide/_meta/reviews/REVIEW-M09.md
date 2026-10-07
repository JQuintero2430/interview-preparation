# REVIEW-M09: `modules/09-web-networking-storage-security.md`

- **Reviewer:** subagent, model claude-sonnet-5-5, for session S20261006-1925-claudecode
- **Date:** 2026-10-06
- **Files read:** `modules/09-web-networking-storage-security.md` (all 1,603 lines); labs `labs/ts-js/src/modules/09-web-networking-storage-security/` (`cookie-jar`, `cors-model`, `csp`, `etag-handler`, `resilient-fetch`, `sw-strategies`, `support/{http-server.ts,node-shims.d.ts}` and all twelve `.test.ts`) and `labs/ts-js/src/outputs/09-web-networking-storage-security/{fetch-and-responses,conditional-get,cookies}.test.ts`; `_meta/RUN.md` (§1, §5, §6, §10), `_meta/QUALITY-BAR.md`, `STYLE-GUIDE.md` (§3, §4.1, §6, §12), `SYLLABUS.md` §4 block 09, `VERSIONS.md` (HttpClient row), `_meta/modules/M09.md`, `SOURCES.md` (Module 09), `_meta/GLOSSARY-TERMS.md` (Module 09), `_meta/LOG.md` (M09 entries), `_meta/TASKS.md` (Module 09 common rules, FIX-M08 grouping), `_meta/UNVERIFIED.md` (no module 09 row), `_meta/reviews/REVIEW-M08.md` (format).
- **What was run:** from `labs/ts-js` (Node 24.21.0) `npx vitest run src/modules/09-web-networking-storage-security src/outputs/09-web-networking-storage-security` (15 files, 61 tests, all passed); from the guide root `node labs/tools/check-snippets.mjs . 09` (exit 0, "All snippets check out"), `node labs/tools/check-links.mjs --planned` ("All links resolve", 266 planned links), `node labs/tools/module-stats.mjs` (row 09: 22 questions, 3 exercises, 9,892 prose words, no flags); the QUALITY-BAR "Measuring" one-liners; one Node probe (a TypeScript-transpiled copy of `resilient-fetch.ts` against a never-answering `node:http` server: `TimeoutError`, 1 request with `retries: 2`); a script comparing the 48 URLs in the module with `SOURCES.md` (all present) and every backtick-quoted `Section N: …` / `Q09.NN …` test name with the `it(...)` titles (all exist). **Read from documentation (WebFetch or curl, 2026-10-06):** RFC 9110 (§3.3, §5.1, §9.2.2, §9.2.3, §15.4.2/15.4.3 notes), RFC 9111 (§4.2.2), RFC 9113 §1, RFC 9000 (TLS 1.3 handshake), RFC 5789, RFC 6265bis (default path, prefixes, Lax default), the Fetch Standard (request progression sentence, 64 kibibytes keepalive rule, `Access-Control-Max-Age` 5 by default, redirect rewriting step), CSP Level 3 (§3.3, §8.2), MDN (`Set-Cookie`, Partitioned cookies, Storage quotas, `Cache-Control`, HTTP caching, CORS, `sendBeacon`, Connection management in HTTP/1.x, Trusted Types, Making PWAs installable), web.dev (Schemeful Same-Site, SameSite explained, strict CSP, service worker lifecycle), Chrome for Developers (removing push, streaming requests), the HTTP/2 FAQ, HPBN, Google Research (CSP study). There is no real browser: nothing below is "observed in a browser", and the Mermaid diagrams were not rendered (syntax read only).
- **Probe files:** only under the session scratchpad `m09/`; deleted at the end (see the last line of this file).

Overall: a careful, honest module that is already close to M08's finished state. All nine sections have a concrete problem, a Mermaid diagram with a "What to notice" sentence, because-clauses and the `> [!NOTE]`/`> [!TIP]` callouts (8, each "Where the analogy breaks" present); all four Output answers equal their assertions line for line; every named `Section N:` test exists; every quote I reached (about 30) is verbatim; and the text keeps "in Node" / "in jsdom" apart from "documented". Prose is 9,892 words. The gaps: a misread Chrome 86 claim, a Q09.01 claim that omits POST as cacheable, a Summary sentence that offers IndexedDB and "memory" as the answer to script-readable storage (the module itself says IndexedDB is script-readable), eight traps with no cause of the myth, XSS/CSRF/JSONP used before they are defined, no ECMAScript editions on post-ES2015 syntax, `Last-Modified` taught only as a heuristic input although the SYLLABUS names it as a validator, and one exercise claim ("after one try despite `retries: 2`") that is true (I ran it) but not asserted by any test.

---

## QUALITY-BAR

Counts: **34 Pass, 9 Partial, 0 Fail, 2 N/A** (45 items). Fail items: none.

| ID | Result | Evidence |
|---|---|---|
| A1 | Pass | Lines 3-9 in STYLE-GUIDE §4.1 order (What this covers, Prerequisites, Leads to, Applies to, Study time, Short on time, Labs); line 9 carries `npx vitest run src/modules/09-web-networking-storage-security src/outputs/09-web-networking-storage-security`. |
| A2 | Pass | Line 4: three prerequisites, each with an anchor (`#7-cancellation-with-abortcontroller`, `#1-the-event-loop-tasks-microtasks-and-rendering`, `#4-events-propagation-default-actions-passive-listeners-and-delegation`); link check passes. |
| A3 | Pass | Line 8: sections 4, 5, 6; questions Q09.09, 12, 13, 15, 19; Exercise 09.2; ends with the Summary link; all resolve. |
| A4 | Pass | Lines 13-26 link the 9 concept sections plus Summary, Question bank, Hands-on exercises, Check your understanding, Connections; these are the 14 `## ` headings after the title (grep); link check passes. |
| A5 | Pass | Semantics, `fetch`, protocol versions, caching, CORS, cookies, storage, CSP, service workers. No section needs a later one except the small forward uses of XSS/CSRF/`SameSite` (B9, T-2). The last section is not the deepest; acceptable (same call as REVIEW-M04/M08). |
| B1 | Pass | `grep -c` of the six subheadings: 9, 9, 9, 9, 9, 9. |
| B2 | Pass | All nine problems are concrete failures (double charge on retry, stale bundle for a day, CORS error that curl does not show, stolen session cookie, token and cart read by one XSS bug, 40-host allowlist bypassed by JSONP, blank offline page). |
| B3 | Pass | 9 `mermaid` blocks and 9 "What to notice" lines (`grep -c`): flowchart (retry decision, protocol versions, cache, cookie two gates, storage choice), sequence (fetch settle points, preflight, CSP nonce), state (service worker). Every flow/timeline/state-machine section has one. Not rendered here. |
| B4 | Pass | Each section answers a "why": 301/302 rewrite by Fetch Standard (53), one-shot body (123), HOL at TCP versus HTTP layer (199-201), freshness order and 10% heuristic (258), what a CORS check runs on (337-338), default path and prefixes (399-400), structured clone versus JSON (466), why allowlists fail (525), why a new worker waits (589). Breadth gaps are filed under G2. |
| B5 | Pass | Every `### Code` opens with an "Approach:" line; exercise solutions start "**Approach.** (1) … (2) …". |
| B6 | Pass | All best-practice items carry "because" (lines 86-88, 160-162, 223-224, 297-300, 364-366, 429-431, 489-491, 551-553, 623-625). |
| B7 | Partial | 15 of 23 traps give a cause or a sourced history ("Once true: until Chrome 80" at 436; `unload` "in the past" at 167; reload `max-age=0` at 306). Eight give only the correction: 168 (fetch supersedes XHR), 169 (`credentials: 'include'`), 229 (HTTP/3 is HTTP/2 over UDP), 305 (no `Cache-Control`), 370 (CORS protects my API), 557, 558, 559 (CSP/allowlist/Trusted Types). T-1. |
| B8 | Pass | `grep -c '^> \[!'` = 8 (§1, 3, 5, 6 TIP; §2, 4, 8, 9 NOTE). `HttpClient` vs `fetch` is covered (131); the SYLLABUS names a backend comparison only for protocol versions (§3 TIP, 205); the other three TIPs are optional and each states where the analogy breaks. |
| B9 | Partial | Defined inline: intermediary, origin server, one-shot stream, HOL, multiplexing, QUIC, ALPN, shared cache, validator, origin, preflight, host-only, third-party, CHIPS, sink, scope, precache, app shell. Used before definition or never defined: XSS (first at 435, 442, defined 502), CSRF (370, 377, defined 403), JSONP (502, 525, never), HPACK, TLS, back/forward cache (167, 300), CORS expanded at 334 after use at 312, `SameSite` used at 126 before section 6. T-2. |
| B10 | Pass | Abort/timeout is one sentence plus links to module 04 (128, Q09.04, Q09.06, Exercise 09.2); token storage, CSRF, Angular nonce/Trusted Types, server CORS point to 33/41/42. Internal repeats between sections and answers are listed under Redundancy. |
| C1 | Partial | Sampled 40 claims (list below); 36 hold with a basis. Wrong or imprecise: Chrome 86 (F-2), Q09.01 caches "GET and HEAD" (F-1), Summary "IndexedDB or memory" (F-3), keepalive 64 KiB as a per-body limit (F-4), §3.3 cited for header names (F-5). |
| C2 | Pass | `grep -o 'Q09\.[0-9]*'` over `outputs/09-*`: Q09.03, Q09.05, Q09.10, Q09.16 = the four Output questions. Diffs in "Output answer cross-check" below. |
| C3 | Partial | All 23 named tests exist and assert what the sentence says, except: line 1384 "a hung server gives `TimeoutError` after one try despite `retries: 2`" (test asserts only the error type and `timeoutMs`, not the request count); line 547 "asserts 16 bytes" (test asserts at least 16); line 370 cites the Node test `Section 5: a request with a foreign Origin…` as basis for browser behavior (T-5). |
| C4 | Partial | Baseline is defined once (28) and verified: Trusted Types "Baseline 2026, newly available, since February 2026" and Partitioned "Baseline 2025, newly available, since December 2025" both match MDN today. No §3.2 marker is needed (no Angular API). No ECMAScript edition is given for `??`, `?.`, `**`, numeric separators `10_000`, optional `catch {` (lines 479, 1213, 1368, 1376) in the snippets (T-4). |
| C5 | N/A | No Angular API in a snippet; the one framework statement (`HttpClient` uses `fetch` by default in v22, line 131) matches `VERSIONS.md` line 75. |
| C6 | Pass | `grep -c Unverified` = 0; `_meta/UNVERIFIED.md` has no module 09 row. |
| C7 | Pass | `check-snippets.mjs . 09` exit 0. Complete snippets (3 exercises) carry `<sub>Source:`; Excerpts verbatim; Output and Partial snippets labelled; no Java. |
| C8 | Pass | 48 distinct URLs in the module, all found in `SOURCES.md` "Module 09" (script). |
| D1 | Pass | 22 / 22 / 22 / 22 / 22 for `### Q`, Short answer, Full explanation, Follow-ups, Trap to avoid; each has 2 follow-ups, each answered. |
| D2 | Pass | Q09.03, 05, 10, 16 each print the lines and give 1-2 sentences of reasoning. |
| D3 | Pass | Concept 6, Difference 6, Output 4, Trade-off 3, Bug hunt 2, Design 1: six tags, largest share 27% (6/22), Trade-off and Design/Bug hunt present. |
| D4 | Pass | Q09.01-02 semantics, 03-06 fetch, 07-08 versions, 09-11 caching, 12-14 CORS, 15-17 cookies, 18 storage, 19-20 CSP, 21-22 service workers: follows the sections. |
| D5 | Pass | `grep '^### Q' modules/*.md` for fetch/http/cors/cookie/cache/csp/storage/worker/preflight outside Q09: only Q05.15 (LRU cache) and Q17.26 (`httpResource`); no overlap. Timeouts and abort are linked to Q04.26, not repeated. |
| D6 | Pass | Every ID appears in a body link outside the header line (counts of `](#q09-NN)`: 1-3 each; for Q09.09, 12, 13, 15, 19 at least one is the section body); each answer links its section. |
| D7 | Pass | 22 `<a id="q09-NN">` and 3 `<a id="ex09-N">`, one above each heading; link check passes. |
| D8 | Pass | 22 questions (ceiling 24, floor 15), 3 exercises (ceiling 3, floor 2). |
| E1 | Pass | Each exercise: Problem, Constraints, Acceptance criteria, Hint 1/2, Worked solution (Approach, code, "How each criterion is met"), Alternative approach and Trade-offs, 2 follow-ups, Tests link (`grep -c` = 3 each). |
| E2 | Partial | 15 criteria, 15 `it(...)` titled with the criterion. The test for "a request slower than `timeoutMs` is aborted and rejects with `TimeoutError`" does not assert the facts the Constraints and the account add ("per attempt and final", "one try"; T-5). Others map exactly. |
| E3 | Pass | Pure model (09.1), async wrapper with injected clock-like seams (09.2), cookie jar integrating sections 1, 5, 6 and tested against jsdom (09.3). |
| E4 | Pass | All three live in labs and pass (61 tests); no `any`, at most 1-2 injected seams; `grep ': any\|as any'` over the lab: none. Typecheck was not run (outside the allowed commands). |
| E5 | Pass | Four Output questions. |
| F1 | Partial | Two paragraphs, all nine sections linked, most-asked traps restated. Line 636 says "use the cookie, IndexedDB or memory by what each is safe for": "memory" is not taught anywhere above, and IndexedDB is script-readable (Q09.18 says so). F-3. |
| F2 | Pass | 4 prompts, each names a listener (backend developer, teammate, reviewer, release manager). They skip sections 3, 7 and 8 (T-6, optional). |
| F3 | Pass | 6 flashcards, one or two lines each. |
| F4 | Partial | Builds on / Read next / Uses these ideas later present; "Read next" (1602) gives no reason for 10, 27 or 33 (T-6). |
| G1 | Pass | 9,892 prose words (python one-liner and `module-stats.mjs` agree), inside 8,000-10,000. Headroom is 108 words, so every FIX that adds prose must first cut the repeats under Redundancy. |
| G2 | Partial | All nine SYLLABUS §4 checkboxes are covered by a section and questions, but two are thin: "validators (`ETag`, `Last-Modified`)" teaches only `ETag`/`If-None-Match` (`Last-Modified` appears only as the heuristic input, 258 and 305), and "status codes, headers" lacks the status classes and the common headers (T-3). |
| H1 | Pass | Module tests: 15 files, 61 tests green, run by me. `tsc` and the full `npm test` were not run. |
| H2 | Pass | `check-links.mjs --planned`: "All links resolve." (266 planned links). |
| H3 | N/A | `git status --short` shows `?? ./` for the whole guide (untracked as a unit); no `relink:` or `TASK:` marker left (`grep -c` = 0); no stray lab fixture. |

**Claims sampled (C1), basis in brackets.** Ran: 404 resolves/`fetch failed` rejects, 301/302/303 to `GET:` and 307/308 `POST:x`, body read once and `clone()`, `Headers` joining and `getSetCookie()` (vitest, section 1-2 and Q09.03/05); 2 sockets/1 h2c session (section 3); 200/304/200 and weak `If-None-Match` (section 4, Q09.10); jsdom `HttpOnly`, `Domain`, default path, `Secure`, prefixes, `Max-Age=0`, Q09.16 lines (section 6); string coercion, JSON versus `structuredClone`, quota error (section 7); CSP hash vector, nonce, policy string (section 8); the three strategies (section 9); `TimeoutError`/1 hit (probe). Read from docs: RFC 9110 "MAY change the request method from POST to GET" (verbatim), "SHOULD NOT automatically retry" (verbatim), PATCH "neither safe nor idempotent" (verbatim), §9.2.3 (F-1); RFC 9111 "no more than some fraction … 10%" (verbatim); RFC 9113 §1 both quotes (verbatim); RFC 9000 TLS 1.3 handshake (ok); Fetch Standard request progression, 64 KiB, `Access-Control-Max-Age` 5 by default, 301/302/303 rewrite (verbatim); CSP3 §3.3 and §8.2 (ok); MDN `Cache-Control` no-cache/must-revalidate/stale reuse (ok), caching guide reload `max-age=0` remnant, heuristic caching, bfcache cost (verbatim); MDN CORS redirects-after-preflight, wildcard, "preflight must never include credentials", simple-request list (ok); MDN `sendBeacon` 64 KiB, `unload` "extremely unreliable", `visibilitychange` (verbatim); MDN `Set-Cookie` HttpOnly quote, prefixes, Partitioned needs Secure, "some browsers" Lax and the two-minute rule (verbatim); MDN Partitioned banner "Baseline 2025 … since December 2025"; MDN Trusted Types banner "Baseline 2026 … since February 2026"; MDN quotas (60%, 10%/10 GiB, Safari ~60%, 5 MiB + 5 MiB, 7 days); MDN Making PWAs installable list; web.dev strict CSP (128+ bits, fresh, policy string), service worker lifecycle (quote, "byte-different"), SameSite explained (Chrome 80 Lax); Google CSP study (94.68%, 14 of 15); Chrome push post ("will be disabled by default in Chrome 106"); HTTP/2 FAQ quote; HPBN quote; MDN connection management (six, sharding "detrimental"); Chrome streaming requests (HTTP/1.x rejected).

---

## SYLLABUS §4 coverage

| Checkbox | Where covered |
|---|---|
| HTTP semantics: methods, idempotency, status codes, headers | Section 1, Q09.01-Q09.03, Q09.05, Exercise 09.2. Status classes and the common headers are thin (T-3). |
| HTTP/1.1 vs HTTP/2 vs HTTP/3 (QUIC): multiplexing, HOL blocking, bundling | Section 3, Q09.07, Q09.08. 0-RTT and connection migration are not mentioned (the plan listed them; optional). |
| HTTP caching: `Cache-Control`, validators (`ETag`, `Last-Modified`), hashed assets, `no-cache` vs `no-store` | Section 4, Q09.09-Q09.11. `Last-Modified`/`If-Modified-Since` as a validator is missing (T-3). |
| Same-origin policy and CORS from the browser's side | Section 5, Q09.12-Q09.14, Exercise 09.1. `Access-Control-Expose-Headers` is not mentioned (plan row; optional). |
| Cookies: `Secure`, `HttpOnly`, `SameSite`, `Domain`/`Path`, `__Host-`, CHIPS | Section 6, Q09.15-Q09.17, Exercise 09.3. |
| Storage: `localStorage`, `sessionStorage`, IndexedDB, Cache Storage, quotas | Section 7, Q09.18. |
| CSP: directives, nonces/hashes, `strict-dynamic`, report-only; Trusted Types | Section 8, Q09.19, Q09.20. |
| Service workers lifecycle and caching strategies; PWA manifest | Section 9, Q09.21, Q09.22. |
| `fetch` vs XHR: streams, progress, abort, `keepalive` | Section 2, Q09.03-Q09.06, Exercise 09.2. |

No checkbox is missing.

---

## Factual findings

**F-1 · Low-Medium · Q09.01 says only `GET` and `HEAD` are cacheable.**
- Location: Q09.01 Full explanation (line 650: "caches may store only responses to methods that allow it: `GET` and `HEAD`"); `SOURCES.md` repeats it ("§9.2.3 caches store only responses to methods that allow it, GET and HEAD do").
- Wrong: RFC 9110 §9.2.3 (read): "This specification defines caching semantics for GET, HEAD, and POST, although the overwhelming majority of cache implementations only support GET and HEAD." The short answer's "`POST` and `PATCH` are neither safe nor idempotent" is right, but the "cacheable" row of an answer to "safe, idempotent and cacheable" should not imply POST can never be cached.
- Correction: "`GET` and `HEAD`, which is all that most caches implement; RFC 9110 also defines caching for `POST` responses that carry explicit freshness information." Fix SOURCES.md too.
- Basis: read RFC 9110 (rfc-editor text, lines 3906-3913).

**F-2 · Medium · "Chrome 86 treats `http` and `https` of one domain as cross-site" is not what the cited page says.**
- Location: line 401 and Q09.17 full explanation (line 1037); `SOURCES.md` ("Chrome 86").
- Wrong: web.dev Schemeful Same-Site says "From Chrome 86, enable `about://flags/#schemeful-same-site`": in Chrome 86 it was behind a flag. The page gives no later version for default enablement. The module states it as shipped behavior.
- Correction: "Schemeful same-site treats `http` and `https` of one domain as cross-site; Chrome offered it behind a flag from version 86 ([web.dev])" and either find a dated source for the default or leave the version out. Q09.17: say "schemeful same-site" without a version.
- Basis: read web.dev page (fetched 2026-10-06). Not observed.

**F-3 · Medium · Summary recommends IndexedDB or "memory" for what script-readable storage cannot hold.**
- Location: line 636: "Web Storage holds strings that any injected script reads; use the cookie, IndexedDB or memory by what each is safe for."
- Wrong: section 7 and Q09.18 say any script on the origin reads Web Storage, IndexedDB and Cache Storage, so IndexedDB is no safer than `localStorage` against XSS; "memory" is not taught anywhere above (F1 requires "no fact not taught above").
- Correction: "Web Storage holds strings, and any injected script reads it, IndexedDB and Cache Storage too; keep secrets out of all script-readable stores and see [33] for the token trade-offs; use each store for what it is for."
- Basis: read from the module's own sections 7 and Q09.18; MDN IndexedDB and storage pages cited there.

**F-4 · Low · `keepalive` "body of at most 64 KiB" is the quota, not a per-request rule.**
- Location: line 127 (and glossary entry "`keepalive`").
- Wrong: the Fetch Standard (read) fails the request when "the sum of contentLength and inflightKeepaliveBytes is greater than 64 kibibytes": the 64 KiB is shared by all in-flight `keepalive` requests. MDN's `RequestInit` page says "limited to 64 kibibytes", so the module follows MDN, but the standard is the more exact source and is already in `SOURCES.md`.
- Correction: "`keepalive: true` lets the request outlive the page; the bodies of all in-flight keepalive requests together are limited to 64 KiB ([Fetch Standard])."
- Basis: read Fetch Standard (curl, 2026-10-06).

**F-5 · Low · Header-name case-insensitivity is cited to RFC 9110 §3.3.**
- Location: line 55 ("Headers and state ([RFC 9110 §3.3] …). Names are case-insensitive").
- §3.3 states HTTP is stateless (confirmed, line 768 of the text); field-name case-insensitivity is §5.1 (`SOURCES.md` already lists §5.1). Cite both.
- Basis: read RFC 9110.

No other factual errors found. Checked and correct (basis in the C1 row): all quotations I reached, the redirect rewriting, `Headers`, the 10% heuristic, validator weak comparison, `no-cache`/`max-age=0`/`must-revalidate` semantics, Max-Age default 5 s, simple-request list, `__Host-`/`__Secure-`/`Partitioned`, the Baseline labels (both match MDN on the day read), quota numbers, 94.68% and 14 of 15, nonce 128+ bits, `strict-dynamic`, `<meta>` limits, lifecycle sentence, installability list, `Alt-Svc: h3=":50781"` (RFC 9114 example, listed in `SOURCES.md`). Worth a note rather than a finding: the Server Push source is a 2022 post in the future tense ("will be disabled by default in Chrome 106"), and the "once true until Chrome 80" line (436) rests on a web.dev page last updated in 2019 (V-1).

---

## Teaching and completeness findings

**T-1 · Medium · B7: eight traps have only a correction.** Add one clause on why the belief exists, from a source already read, to: line 168 ("fetch supersedes XHR": it is the newer API and the one the platform promotes), 169 (`credentials: 'include'`: the word "include" reads as "always"), 229 (HTTP/3 "just HTTP/2 over UDP": the HTTP semantics are unchanged, so it looks like a transport swap), 305 (caching without `Cache-Control`: the header looks like the on-switch; MDN's "HTTP is designed to cache as much as possible"), 370 (CORS "protects" the API: the error is loud and blocks something, so it feels like a guard), 557-559 (CSP/allowlist/Trusted Types: "security header" reads as a fix; a long allowlist looks like more coverage; "Trusted" reads as "sanitized"). Do not add a "once true" line unless read (the `Lax` default, 436, is the model).

**T-2 · Medium · B9: define on first use.** XSS and CSRF: add a clause at first use (XSS at 435 or section 6 problem; CSRF at 370) and let the later definitions at 403 and 502 stay as links; JSONP ("an old pattern that loads data as a `<script>` from another host"), HPACK ("HTTP/2's header compression"), TLS ("the encryption layer under HTTPS"), back/forward cache ("the browser's instant back/forward restore, MDN `sendBeacon` page"); expand CORS at 312 or 28; one clause at 126 for `SameSite` ("a cookie attribute, section 6"). Each owner link goes to 33 or this module's section.

**T-3 · Medium · G2/B4: two checkboxes are thin.** (a) Section 4: add `Last-Modified` plus `If-Modified-Since` as the date-based validator (RFC 9110 §8.8.2, §13.1.3; read before writing) in one sentence at line 259, and say `ETag` is preferred because dates have one-second resolution (read the RFC text before writing). (b) Section 1: add the status classes in one sentence (2xx success, `201`/`204`; 4xx `400`/`404`/`409`/`422`; 5xx `500`/`502`/`504`) and the headers a browser app meets (`Content-Type`, `Accept`, `Authorization`, `Location`, `Retry-After`, `Vary`) with RFC 9110 sections, because Q09.02 and Exercise 09.2 use them and the SYLLABUS checkbox names them. Optional: one clause for `Access-Control-Expose-Headers` (line 335-336) and one for QUIC 0-RTT/connection migration (line 201), both from pages already in `SOURCES.md`.

**T-4 · Low · C4: ECMAScript editions in snippets.** First use of `??` (ES2020), `?.` (ES2020), `**` (ES2016), numeric separators (ES2021) and `catch {}` without binding (ES2019): the optional `catch` is at line 479, the others in the exercise solutions (1213, 1368, 1376, 1486). One parenthetical sentence per exercise ("uses ES2020 `?.` and `??`") satisfies the common rule. `Headers.getSetCookie()` (line 55) is a recent API: add a Baseline sentence only after reading its MDN page.

**T-5 · Medium · C3/E2: assert what the text claims.** (a) `resilient-fetch.test.ts`, the timeout test: count hits and assert `1` with `retries: 2` (I ran this and got `TimeoutError` with 1 hit; the test is silent), and add a short test that a fresh timeout applies to each attempt (a 503 then a slow answer) or drop "per attempt" from Constraints (line 1274). (b) `section-8-csp.test.ts`: assert exactly 16 bytes or change line 547 to "at least 16 bytes". (c) Line 370: the Node test shows that a server runs a request regardless of a hand-set `Origin`; it is not evidence about what a browser sends. Reword to "a server does not check `Origin` for you (`Section 5: …`); that a browser sends a simple request is documented (MDN)". (d) Line 586 says only the strategies "under Code" are tested, but `networkFirst` and `staleWhileRevalidate` have tests the text never cites; either cite them in one sentence at 612 or leave as is.

**T-6 · Low · F2/F4.** Explain it back covers sections 1, 2, 4, 5, 6, 9 but not 3, 7, 8: add one prompt ("to a tech lead choosing where to keep a token and a cart …", from Q09.18) and optionally one for CSP. "Read next" (line 1602): add a reason for each ("10 because the next layer of the page is styling", "27 for the Angular wrapper around these rules", "33 for the security treatment of cookies, CSP and tokens"). Prompt 4 mentions "service worker" and "cache headers" but section 9 has no flashcard on the lifecycle wait (there is one strategy card); add one card if the budget allows.

**T-7 · Low · Exercises versus sections.** (a) Section 6 and Q09.17 say `Lax` sends on top-level navigations "using a safe method" (the RFC 6265bis wording); Exercise 09.3 and its criterion say "top-level `GET` navigation". Add "only `GET` is modelled" to the Constraints. (b) The section 1 flowchart says "honoring `Retry-After`"; Exercise 09.2 does not honor it. Add "no `Retry-After`" to the Constraints. (c) The `defaultSleep` listener in `resilient-fetch.ts` is never removed when the timer wins; `{ once: true }` only helps on abort. Harmless in the lab, but the exercise teaches cancellation, so remove it or mention it in the follow-up.

**T-8 · Low · Mermaid.** Diagram syntax was read, not rendered (`B--xB` self-message in section 8 is valid Mermaid sequence syntax, but unverified here). If HOUSE has a renderer, run it once.

---

## Output answer cross-check

| Question | Answer in the module | Assertion (`it('Q09.NN …')`) | Match |
|---|---|---|---|
| Q09.03 | `404 false`, `true fetch failed`, `302 GET:`, `307 POST:x` | `['404 false', 'true fetch failed', '302 GET:', '307 POST:x']` (`fetch-and-responses.test.ts`) | Yes. The snippet prints `refused.message`; the test adds an `instanceof Error` guard for typing. |
| Q09.05 | `hello true`, `TypeError`, `hello`, `text/plain 1, 2`, `[ 'a=1', 'b=2' ]` | `['hello true', 'TypeError', 'hello', 'text/plain 1, 2', "[ 'a=1', 'b=2' ]"]`; follow-up test `Q09.05 follow-up: clone() after the body was read throws a TypeError` | Yes. |
| Q09.10 | `200 version one`, `304 "" true`, `200 version two false` | `['200 version one', '304 "" true', '200 version two false']` (`conditional-get.test.ts`) | Yes. |
| Q09.16 | `a=1`, then `a=1; srv=3` | `['a=1', 'a=1; srv=3']` (`cookies.test.ts`, jsdom, URL `https://app.example.com/path/page`) | Yes. The reasoning for `p=6; Path=/other` ("a path this page is not under") is covered by `Section 6: a cookie without Path…`. |

All four are runs (vitest), not read from source.

---

## Redundancy

Concrete repeats (about 250-300 words in total), to trim before adding text:
1. Redirect rewriting is stated at 53, again as practice 88 and trap 94 (same point three times in section 1), and in Q09.02's full explanation (668). Keep 53 and 94 (history), cut 88 to one clause.
2. `no-cache` means "revalidate, not don't cache" appears at 254, 260, 298, 304, 306, Q09.09 (842-844), Q09.11 and flashcard 1 (1565). Keep 260 and Q09.09; shorten 254 and 298.
3. Q09.13's full explanation (936) repeats line 336 almost word for word (no credentials, ok status, `Allow-Methods`/`Allow-Headers`, `Max-Age` 5 seconds, browser-capped): replace by a link.
4. Q09.19's full explanation (1073) repeats lines 525-526 (128+ bits, base64, static `index.html`, hash, 94.68%, report-only): keep one sentence and link.
5. Q09.21's short answer quotes the "delays activating" sentence that line 589 and the full explanation (1109) also give, and 1109 repeats the update check at 590.
6. Q09.18's full explanation (1055) repeats section 7's coercion, quota and eviction bullets (465-467).
7. "`HttpOnly` stops reading, not use" at 435, 989, 995, Explain-it-back 3 and the Summary (636). Keep 435 and the Summary; trim 989.

---

## Claims to verify

- **V-1.** When Chrome's `Lax`-by-default shipped and whether the rollout was staged or paused (line 436 says "until Chrome 80"). The web.dev page read is dated 2019 and describes the change as upcoming; MDN says only "some browsers". Method: a Chrome Platform Status entry or a Chromium blog post; if no dated source is found, change the line to "browsers began treating a missing `SameSite` as `Lax` from 2020 (web.dev)" or drop the version.
- **V-2.** The date from which schemeful same-site is on by default in Chrome (F-2). Method: web.dev page update or Chrome Platform Status; leave out the version if not found.
- **V-3.** Whether Exercise 09.3's "top-level `GET`" matches what browsers do for `HEAD`/`OPTIONS` (the RFC says "safe"; Chrome documents `GET`). Method: MDN `SameSite` text; wording only.
- **V-4.** Browser behavior is never observed here: CORS, `SameSite`, Partitioned, CSP, Trusted Types, quotas, HTTP caching, service workers, HTTP/3. The module says so consistently (28, 287, 360, 421, 485, 547, 586); no action unless Playwright arrives in module 30.

---

## Proposed FIX tasks

All edit `modules/09-web-networking-storage-security.md`, so run in order: FIX-M09-01, 02, 03, 04, 05, 06. FIX-M09-03 trims first; 04 and 05 add text and must keep the file at most 10,000 prose words.

### FIX-M09-01 · S · Correct the factual claims
- Findings: F-1, F-2, F-3, F-4, F-5, V-1, V-2.
- Files: `modules/09-web-networking-storage-security.md` (lines 55, 127, 401, 436, 636, Q09.01 at 650, Q09.17 at 1037), `SOURCES.md` (Module 09: the §9.2.3 line, the "Chrome 86" line, keepalive wording), `_meta/GLOSSARY-TERMS.md` (`keepalive` entry).
- Do: apply the corrections above; for V-1/V-2 read a dated source before keeping any Chrome version, else drop the version; the Summary sentence follows F-3.
- Acceptance: `grep -n "Chrome 86" modules/09-web-networking-storage-security.md` shows only wording that says "behind a flag" (or nothing); `grep -n "GET\` and \`HEAD\`" modules/09-web-networking-storage-security.md` near Q09.01 mentions `POST` caching; `grep -n "IndexedDB or memory" modules/09-web-networking-storage-security.md` returns nothing; `grep -n "5.1" modules/09-web-networking-storage-security.md` finds the header-name citation; `node labs/tools/check-links.mjs --planned` passes; every new URL is in SOURCES.md.

### FIX-M09-02 · S · Make the exercise and lab claims asserted
- Findings: T-5, T-7.
- Files: `labs/ts-js/src/modules/09-web-networking-storage-security/resilient-fetch.test.ts`, `.../section-8-csp.test.ts` (or the sentence at line 547), `modules/09-web-networking-storage-security.md` (lines 370, 547, 586/612, 1274, 1384, Exercise 09.3 and 09.2 Constraints).
- Do: assert one request for the hung-server timeout test (and a per-attempt timeout test, or drop "per attempt"); make the nonce assertion and the sentence agree; reword line 370; cite or drop the orphan strategy tests; add "only `GET` is modelled" (09.3) and "no `Retry-After`" (09.2) to Constraints; optionally remove the `defaultSleep` listener leak (and keep the excerpt in the module verbatim).
- Acceptance: from `labs/ts-js`, `npx vitest run src/modules/09-web-networking-storage-security src/outputs/09-web-networking-storage-security` is green; `grep -n "hits\|toHaveLength(1)\|toBe(1)" labs/ts-js/src/modules/09-web-networking-storage-security/resilient-fetch.test.ts` finds the new assertion; `node labs/tools/check-snippets.mjs . 09` exits 0 (exercise code is verbatim from the lab file); `node labs/tools/check-links.mjs --planned` passes.

### FIX-M09-03 · S · Trim the repeats (makes room for 04 and 05)
- Findings: Redundancy 1-7.
- Files: `modules/09-web-networking-storage-security.md` (lines 88, 254, 298, Q09.02 and Q09.09 explanations, Q09.13 936, Q09.18 1055, Q09.19 1073, Q09.21 1107-1109, Q09.15 989).
- Do: cut each repeat to one sentence plus a link, keeping the Summary, flashcard and trap copies; do not remove a diagram, a trap's cause or a "because".
- Acceptance: the QUALITY-BAR python one-liner prints at most 9,650; `node labs/tools/check-links.mjs --planned` and `node labs/tools/check-snippets.mjs . 09` pass; D1 counts still 22 each.

### FIX-M09-04 · M · Fill the two thin checkboxes
- Findings: T-3.
- Files: `modules/09-web-networking-storage-security.md` (section 1 mechanism near 52-55; section 4 line 259; optionally 201 and 335), `SOURCES.md`, `_meta/GLOSSARY-TERMS.md`.
- Do: add `Last-Modified`/`If-Modified-Since` as a validator with its weakness against `ETag`, the status classes and the common headers, and optionally `Access-Control-Expose-Headers` and QUIC 0-RTT/migration, each from RFC text read in the task; cite RFC sections (no new prose over 300 words).
- Acceptance: `grep -n "If-Modified-Since" modules/09-web-networking-storage-security.md` finds the validator sentence; `grep -nE "\`(201|204|409|422)\`" modules/09-web-networking-storage-security.md` finds the status classes; `grep -n "Content-Type\`.*Accept\|Authorization" modules/09-web-networking-storage-security.md` finds the header sentence in section 1; the prose one-liner prints at most 10,000; new URLs are in SOURCES.md; links gate passes.

### FIX-M09-05 · M · Trap causes, first-use definitions and editions
- Findings: T-1 (B7), T-2 (B9), T-4 (C4).
- Files: `modules/09-web-networking-storage-security.md` (lines 126, 167-169, 229, 305, 312, 370, 435-436, 502, 525, 557-559; exercise solutions 1213, 1368, 1376, 1486; line 479), `_meta/GLOSSARY-TERMS.md`.
- Do: add the eight cause clauses; define XSS and CSRF at first use, and JSONP, HPACK, TLS, back/forward cache; expand CORS at first use; give the ECMAScript editions in one sentence per exercise; no "once true" clause without a source read in the task.
- Acceptance: each of the 23 bullets under `### Misconceptions and traps` has a reason clause (reviewer reads; list the eight lines above); `grep -n "JSONP" modules/09-web-networking-storage-security.md | head -1` shows the definition; `grep -nE "ES20(16|19|20|21)" modules/09-web-networking-storage-security.md` finds the editions; the prose one-liner prints at most 10,000; links and snippets gates pass.

### FIX-M09-06 · S · Closing sections
- Findings: T-6, T-8.
- Files: `modules/09-web-networking-storage-security.md` (Check your understanding, line 1602), `_meta/GLOSSARY-TERMS.md` if a term is added.
- Do: add one Explain-it-back prompt for storage (and optionally CSP), a reason to each "Read next" link, and one flashcard on the service worker wait; run a Mermaid render if a renderer exists.
- Acceptance: the "Explain it back" list has 5 or 6 prompts (`sed -n '/^\*\*Explain it back/,/^\*\*Flashcards/p' modules/09-web-networking-storage-security.md | grep -c '^[0-9]\. '`); `grep -c '<details><summary>' modules/09-web-networking-storage-security.md` counts flashcards between 5 and 10 (the exercises add their own, so count only the "Flashcards" block); "Read next" line has three reasons; prose at most 10,000; links gate passes.

---

Scratch directory `/private/tmp/claude-501/-Users-jorge-quintero-IdeaProjects/8183dbf8-dc3f-4c7b-8c53-d6e666ee7c2c/scratchpad/m09/` (probe script, fetched RFC and Fetch Standard text, URL list): deleted before this review was delivered.
