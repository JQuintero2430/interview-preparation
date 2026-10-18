# REVIEW-M33: `modules/33-security.md`

- **Reviewer:** a fresh reviewer subagent (claude-opus-5-5) of session S20261015-1301-claudecode. It read and judged the module and ran only read-only scripts. The re-runs belong to the main session, which owns all execution. Module 33 was planned by PLAN-M33 and written by HOUSE-29, SEC-M33-01..12, EX-M33-01..04, QB-M33-01..06 and CLOSE-M33. This reviewer wrote nothing in module 33 and continues none of those conversations, so it is eligible (RUN.md §4).
- **Date:** 2026-10-15.
- **Files read:**
  - the whole module (2,129 lines; line numbers below are as of this review and will move at FIX time);
  - `_meta/modules/M33.md` (C1-C14, F1-F20, the section map, the bank table, For Jorge 1-5), QUALITY-BAR, STYLE-GUIDE §3 and §6, the TASKS entries REVIEW-M32, REVIEW-M33, the module-33 common rules and FIX-M32-01..04 (the format), STATE's REVIEW items, LOG 1269-1295, REVIEW-M32 (the format model);
  - module-33 lab files:
    - spec titles of all 23 spec files by script (98 titles);
    - in full: e2e `outputs/q33-outputs.spec.ts`, angular `outputs/q33-outputs.spec.ts`;
    - in part: the section 3, 5, 6, 7, 10 and 11 specs and the exercise 2, 3 and 4 specs; the e2e server modules' file list; `ssr-lab`'s route files;
  - `labs/angular/dist/security-lab/browser` (`index.html` and a policy-name grep of the chunks), `labs/angular/package.json` and `package-lock.json`.
- **Packages read (22.2.1 unless stated):**
  - `@angular/core`: `fesm2022/_debug_node-chunk.mjs` (2951-3035 policies and `SafeValueImpl`, 3036 `allowSanitizationBypassAndThrow`, 3066-3098 inert parsing, 3108 `SAFE_URL_PATTERN`, 3110-3280 serializer and `_sanitizeHtml`, 3299, 3357, 3380-3510 `ɵɵsanitize*`/`ɵɵtrustConstant*`/`ɵɵvalidateAttribute`, 5550-5570, 7977, 9261, 15250, 15644); `_pending_tasks-chunk.mjs` (37, 2838, 2897-2907); `types/core.d.ts` (2717, 8897, 8911); `types/_debug_node-chunk.d.ts` (3915, 5204, 7459);
  - `@angular/platform-browser`: `fesm2022/platform-browser.mjs` (406-445), `_dom_renderer-chunk.mjs` (264-266, 672-679), `types/platform-browser.d.ts` (580-603, 663);
  - `@angular/compiler`: `fesm2022/compiler.mjs` (337-391, 6847, 18725-18731, 21907-21935);
  - `@angular/platform-server`: `fesm2022/_server-chunk.mjs` (149-201, 258-283, 322, 367), `fesm2022/platform-server.mjs` (67, 88-98);
  - `@angular/common`: `fesm2022/_module-chunk.mjs` (774, 780-782, 963, 985-995, 1081, 1085, 1747, 1862, 2050);
  - `@angular/router`: `fesm2022/_router-chunk.mjs` (2646, 2895, 3171, 3186, 3212);
  - `@angular/build`: `src/utils/index-file/index-html-generator.js` (43-49), `nonce.js`, `auto-csp.js` (138, 212, 236-261, 307), `augment-index-html.js` (64-66, 117-131, 147, 169), `inline-critical-css.js` (73-75), `src/builders/application/schema.json` (64);
  - npm 11.19.0 docs (`lib/node_modules/npm/docs/content` of Homebrew node@24 24.21.0): `allow-scripts`, `strict-allow-scripts`, `min-release-age`, `ignore-scripts`, `npm audit`, `npm ci`, `npm trust`, `package-lock.json` (`hasInstallScript`).
- **Basis of each finding:** a package source, a committed spec, the built `dist/security-lab`, or a read-only script (grep, sed, wc, `node -e` reading files). Nothing was built, run or installed. **Not re-read** (their basis is the SEC LOG lines and SOURCES.md): the CHANGELOG lines (15.2.6, 21.2.15, 22.2.1), `@angular/core@15.2.5` (tarball deleted), RFC 10017, the OWASP, MDN, web.dev, W3C SRI and HTML-standard pages, the GHSA advisories, angular.dev's security guide and release page, Thymeleaf and the Spring API.
- **Probe files:** none. The reviewer created only this file and edited `_meta/TASKS.md`.

Overall, this is a carefully sourced module with **two Major findings, both small text fixes**:
- Q33.19's short answer and full explanation lost their `<`/`/` escapes in the text, so the quoted state script shows a raw `</script><script>`, the exact thing the answer says never appears, and "replaces `<` with `<`" (F-1). The spec asserts the escaped form.
- §7 says `resolveUrl` "throws on a protocol-relative URL" without saying that the server's `HttpClient` interceptor turns that check off (F-2). A reader would think Angular blocks `//evil/x` requests on the server; it does not.

Everything else holds:
- every cited test title exists (121 citations, 75 distinct, 0 missing), and all 20 exercise criteria equal test titles;
- every Output answer has its test, and all but Q33.19's text equal the assertions;
- 51 of 54 sampled claims match the 22.2.1 sources (F-1, F-2, F-4 are the exceptions);
- C11's CHANGELOG discrepancy, `angular#bundler` and the `sanitize()` comment are worded as the source shows; payloads are harmless and every request is local.

The rest is polish: two missing markers (F-3), one SRI detail (F-4), five terms used before definition (T-1), three internal names unmarked (T-2), two Output answers without a reason (T-3), one misconception example that is not transitive (T-4), four nits, and the anchor handoffs (30 rows).

**Prose:** 19,755 words now (read-only script, the QUALITY-BAR one-liner's split, equal to CLOSE's LOG count). The fixes add about +170, for about 19,925: under the CLOSE limit of 19,994 and the REVIEW ceiling of 20,694.

## Re-runs (main session)

Filled by the main session S20261015-1301-claudecode, serially (Node 24: `export PATH=/opt/homebrew/opt/node@24/bin:$PATH`).

| Command | Result |
|---|---|
| `labs/angular`: `npx tsc -p tsconfig.spec.json --noEmit` | 0 (Node 24.21.0) |
| `labs/angular`: `npx ng test --watch=false --include='src/app/modules/33-security/**/*.spec.ts'` | 7 files, 33 passed |
| `labs/angular`: `npx ng build security-lab`; `npx ng build security-lab -c production,autocsp`; `npx ng build ssr-lab` | 0; autocsp 1 on the first run (output not captured), 0 on two reruns (nonce then autocsp, as in the first run); `ssr-lab` 0 |
| `labs/e2e`: `npm run typecheck` | 0 |
| `labs/e2e`: `npm test -- tests/33-security --repeat-each=5` | 425 passed (85 × 5), 0 failed, 0 flaky, 40.2 s |
| `labs/ts-js`: `npx vitest run src/modules/33-security` | 1 file, 2 passed |
| Mermaid parse of the 12 fences (Mermaid + jsdom in the job scratchpad, a negative control, deleted after) | Mermaid 11.12.0 + jsdom: 12/12 parse; the negative control fails |
| guide root: `node labs/tools/check-links.mjs --planned`; `node labs/tools/check-snippets.mjs . 33`; `node labs/tools/module-stats.mjs` | check-links: 2 broken anchors, both in this review's quoted text (lines 167, 242), put in code spans by main, then all resolve (337 planned); check-snippets 33 OK; module-stats 33: 29 Q, 4 Ex, 19,755, no flag |
| `lsof -iTCP:4300 -iTCP:4400 -iTCP:4500 -sTCP:LISTEN` after the run; remove `labs/e2e/test-results` | no listener; `test-results` removed |

Reviewer's read-only script results (2026-10-15):
- **Cited test titles:** 121 citations, 75 distinct, 0 missing from the 98 titles of the 23 spec files (the §8 capture title only looked missing because of an escaped apostrophe).
- **Exercise criteria:** 20 of 20 equal test titles. Each of the nine Output IDs (04, 07, 10, 14, 17, 19, 22, 25, 26) has a test named after it.
- **URLs:** 38 distinct strings. 20 are citations, all in SOURCES.md under `## Module 33 · Security`; the other 18 are example or code strings (lab origins, payload URLs).
- **Markup:** `<details>` 48 open and 48 closed; 12 `mermaid` fences and 12 "What to notice" lines; B1 subsections 12 of each of the six.
- **Answer anatomy:** each of the five D1 counts is 29; every answer has 2 answered follow-ups.
- **Answer length:** 173-283 words.
- **Type mix:** Concept 9, Output 9, Design 4, Bug hunt 4, Trade-off 2, Difference 1 (max 31%).
- **Question links:** 40 links into `#q33-`; all 29 IDs linked outside their heading.
- **Misconceptions:** 47 bullets, each with a "myth" cause clause. Every best practice has "because".
- **Markers and placeholders:** `<!-- TASK:`/`PLACEHOLDER`/`relink:` 0; `Unverified` 0.
- **Snippets and links:** `check-snippets . 33` OK; `check-links --planned` all resolve (333 planned); `module-stats`: 29 Q, 4 Ex, 19,755, no flag.
- **Specs:** no `waitForTimeout`, `setTimeout` or duration assertion; `alert(1)` only as sanitizer input data; every request local (ex4-tokens-b fetches `http://localhost:${port}`).
- **`git status`:** module-33 lab files all declared; `labs/angular/dist` ignored; no `labs/e2e/test-results`; nothing listening on 4300/4400/4500 (`lsof`).

## QUALITY-BAR

45 items: **40 Pass, 5 Partial (B9, C1, C2, C4, D2), 0 Fail.** H1 and H2 are Pass on CLOSE-M33's run and the reviewer's checks, pending the main session's re-runs above.

| ID | Result | Evidence |
|---|---|---|
| A1 | Pass | Lines 3-9 in §4.1 order. Applies to names the installed versions and what is documented only; the Labs line has the four folders and run commands. |
| A2 | Pass | 09 §8, 13 §4, 27 §8, with anchors. |
| A3 | Pass | §2, §3, §5, §9 and question IDs, ending with the Summary. |
| A4 | Pass | Contents (11-31) links the 12 sections and the five closing sections. |
| A5 | Pass | Threat model first, §12 under the hood last. |
| B1 | Pass | 12 of each subsection (script). |
| B2 | Pass | Each "The problem it solves" opens with a concrete failure (239, 741, 822 read). |
| B3 | Pass | 12 Mermaid diagrams, each with "What to notice". |
| B4 | Pass | §3, §6 and §12 reach `SECURITY_SCHEMA`, `resolveSanitizers`, the five-pass loop, the Trusted Types policies. |
| B5 | Pass | Snippets preceded by approach and steps (read). |
| B6 | Pass | Every best practice has "because" (script). |
| B7 | Pass | 47 bullets with a cause; Once-true line at 265. T-4 is a factual slip, counted under C1. |
| B8 | Pass | Framework vs platform callouts (272 and others); Coming from the backend at 184 lacks its `> [!TIP]` line (N-1). |
| B9 | Partial | Import map and critical CSS (397), XSRF (741), preflight (814), LTS (919), hydration (1533) used before any definition (T-1). |
| B10 | Pass | Cookies, CORS, CSP basics, XSRF mechanics and SSR are one sentence plus a link to 09, 27 and 32. |
| C1 | Partial | 51 of 54 sampled claims match; F-2 (`resolveUrl` scope), F-4 (SRI `crossorigin`), T-4 (lockfile example). |
| C2 | Partial | Nine Output IDs have tests; Q33.19's quoted state script does not equal its assertion (F-1). |
| C3 | Pass | Every "in the lab" sentence names a test; all 75 titles exist. |
| C4 | Partial | Trusted Types first mentioned at 272 without its marker (F-3a); `afterNextRender` at 193 without `[Stable since v20.0]` (F-3b). |
| C5 | Pass | Every API checked exists in 22.2.1 (claims table); the VERSIONS rows are For Jorge 2. |
| C6 | Pass | No `Unverified` in the module. |
| C7 | Pass | `check-snippets . 33` OK. |
| C8 | Pass | 20 cited URLs, all in SOURCES.md. |
| D1 | Pass | 29 of each part (script). |
| D2 | Partial | Q33.22 and Q33.25 short answers give the observations without the reason (T-3). |
| D3 | Pass | Six tags, Trade-off 2, Design 4, Bug hunt 4, max 31%. |
| D4 | Pass | Q33.01-29 follow the section order (read). |
| D5 | Pass | No duplicate headings in the module or against 09, 27, 32 (grep of `### Q`). |
| D6 | Pass | 40 links into `#q33-`; each answer links back to its section. |
| D7 | Pass | `<a id="q33-NN">` above each question; IDs unique (check-links). |
| D8 | Pass | 29 Q (ceiling 30, floor 25), 4 Ex. |
| E1 | Pass | Problem, Constraints, Acceptance criteria, Hints, Worked solution, follow-ups in all four. |
| E2 | Pass | 20 of 20 criteria are test titles; Ex 33.2's two statement tests are named as such (1856). |
| E3 | Pass | Embed URL, CSP + TT, CSRF, token design with BFF variant. |
| E4 | Pass | Solutions in the labs; build/test result pending the re-runs. |
| E5 | Pass | Nine Output questions. |
| F1 | Pass | Summary restates each section's claim and trap with links (1082-1088). |
| F2 | Pass | Explain it back prompts name listeners (read). |
| F3 | Pass | Flashcards in `<details>` (count in the 48). |
| F4 | Pass | Connections: Builds on, Read next, Uses these ideas later, with reasons (2124+). |
| G1 | Pass | 19,755 ≤ 19,994. |
| G2 | Pass | M33.md's breadth table all covered (CLOSE LOG, spot-checked). |
| H1 | Pass (pending) | CLOSE-M33's run; the main session's re-runs above. |
| H2 | Pass (pending) | `check-links --planned` all resolve (reviewer run, read-only). |
| H3 | Pass | Module-33 lab files declared; `dist` ignored; no `test-results`. |

## Module-specific checks

| Check | Result | Evidence |
|---|---|---|
| HOUSE-29 result in every module-33 LOG line | Pass | Present in LOG 1269-1295 (EX-M33-01 in other wording). The main session's marker-cleanup HOUSE line has none, which is fine. |
| Recorded cookies, headers, policies, violation directives, error codes and sanitizer outputs (F3-F14, nine Output answers) vs specs | Pass (read), except F-1 | NG0904, NG0910, NG05201, `unsafe:javascript:alert(1)`, the six Q33.07 warnings, `SameSite` none/def/lax/strict, `Sec-Fetch-Site: cross-site`, 403, `X-XSRF-TOKEN`, `{"name":"Ada"}`, 401, the SRI digest error. Q33.19's text loses the escapes (F-1). Pass/fail of the runs: main. |
| No throwaway observation, no duration, no unsourced prevalence, incident, speed or SEO claim (C6) | Pass | No "throwaway" or scratch run; no timer in any spec; OWASP and incident wording quoted and dated. |
| No development-only behavior worded as observed in production (C9) | Pass | Sanitizer warnings and NG codes are production format; dev-mode wording marked. |
| Payloads harmless; every request local (C10) | Pass | `window.__m33Hits` markers; `alert(1)` only as sanitizer input; no external host in specs. |
| 22.2.1 URL-sanitizer CHANGELOG line as a discrepancy (C11) | Pass | 263 "a discrepancy, not behavior"; also 308, 1243. Matches `SAFE_URL_PATTERN` (3108). |
| `angular#bundler` and the `sanitize()` comment as source/run shows (C1) | Pass | 511 (no policy in `@angular/build` or the built files, test cited); 340 (code throws only for script and resource URL; `platform-browser.mjs` 406-445). |
| Shared files changed only by HOUSE-29; route files append-only (C12) | Pass (read) | `ssr-lab` route lines appended; the server route sits before `**`, which it must. `labs/e2e` is untracked, so not diffable (For Jorge 3). |
| Owner credit and the 09/12/13/14/24/27/32/41/42/44 split (C7) | Pass | One sentence plus a link for each owned topic; file-level links point only to planned 37/41/42/44/45/46. |
| Internal names marked (C8) | Partial | `SAFE_URL_PATTERN` (263), `DomSanitizerImpl` (338), `addNonce` (424) unmarked at first use in their sections (T-2). |
| Status markers (C5) | Partial | F-3. |
| Exercise criteria = test titles; alternatives run | Pass | 20/20; the alternative runs are the main session's. |
| ≥ 2 answered follow-ups | Pass | 2 each. |
| Terms defined at first use | Partial | T-1. |
| Links into written modules carry anchors | Pass | All links into 09, 12, 13, 14, 24, 27, 32 have anchors. |
| SOURCES complete | Pass | 20 of 20. |
| Twelve Mermaid diagrams parse | Main | Counted 12; parse is the main session's. |
| Misconceptions causes; `<details>` closed; type mix | Pass | 47/47; 48/48; max 31%. |
| Prose within 19,994 and ceiling 20,694 | Pass | 19,755; about 19,925 after FIX. |
| No stray files; no server left | Pass (reviewer) / main after re-runs | `git status`, `lsof`. |
| File-level links into 33 as anchor candidates | Done | Handoffs below (30 rows; M33.md's candidate list is out of date). |

## Handoffs

Module 33 slugs:
- S2 `#2-xss-and-angulars-template-model-escaping-by-default-trusted-templates-and-the-paths-around-them`
- S3 `#3-sanitization-by-security-context-html-style-url-and-resource-url`
- S5 `#5-content-security-policy-with-angular-nonces-csp_nonce-and-autocsp`
- S6 `#6-trusted-types-with-angular-the-frameworks-policies-enforcement-and-rollout`
- S7 `#7-server-rendered-pages-escaping-in-the-server-html-the-state-script-and-ssrf`
- S8 `#8-where-the-token-lives-memory-web-storage-httponly-cookies-and-a-backend-for-frontend`
- S9 `#9-csrf-in-single-page-apps-when-cookies-make-you-vulnerable-samesite-and-angulars-xsrf-support`
- S10 `#10-route-guards-are-ux-authorization-belongs-on-the-server`
- S12 `#12-under-the-hood-from-a-template-binding-to-a-sanitized-dom-write`

Line numbers were read 2026-10-15; find each line by its context, not its number. Only the link target changes (`33-security.md` → `33-security.md#<slug>`); +0 words.

| File:line | Context | Anchor |
|---|---|---|
| 09:404 | "`SameSite` is defense in depth; see [33]" | S9 |
| 09:490 | "script-readable storage**, because one XSS bug reads it all ([33]" | S8 |
| 09:503 | "cross-site scripting, defined in `[section 6](#6-cookies)`; owner [33]" | S2 |
| 09:532 | "sanitizer, nonce support and Trusted Types integration are [33]" | S3 |
| 09:637 | "and Cache Storage too, so keep secrets out of all of them ([33]" | S8 |
| 09:994 | "*CSRF tokens still?* Yes ([33]" | S9 |
| 09:1042 | "*CSRF?* `SameSite` is defense in depth ([33]" | S9 |
| 09:1059 | "*Where does a token go?* The trade-off matrix is in [33]" | S8 |
| 09:1078 | "*Angular's nonce support?* [33]" | S5 |
| 09:1096 | "*In Angular?* [33]" (Q09.20, Trusted Types) | S6 |
| 12:589 | "and must never come from untrusted input ([module 33]" | S2 |
| 12:1268 | "compiling untrusted markup is a security hole ([module 33]" | S2 |
| 12:1726 | "control flow, pipes, components or sanitization ([module 33]" | S12 |
| 12:1787 | "code is harder to debug and a security concern ([module 33]" | S2 |
| 13:2373 | "node, but the string carries the whole language ([module 33]" | S2 |
| 13:2378 | "property the context exposes, so it is no sandbox ([module 33]" | S2 |
| 14:59 | "cross-site scripting, runs an attacker's script in your page; [33]" | S2 |
| 24:538 | "`route-guards.md`, branch `main`, read 2026-10-10.) See [33]" | S10 |
| 24:1763 | "against client-side guards as the sole access control; see [33]" | S10 |
| 24:1946 | "sessions and tokens are [33]" | S8 |
| 24:2562 | "canmatch-canactivate-candeactivate-and-redirectcommand), [33]" | S10 |
| 27:537 | "also removes the XSSI (cross-site script inclusion, [33]" | S9 |
| 27:711 | "where they are kept is [33]" | S8 |
| 27:800 | "token in `localStorage` for the interceptor."* Storage is [33]" | S8 |
| 27:812 | "foreign page cannot read your origin's cookie. Depth is [33]" | S9 |
| 27:1708 | "Where the token lives (memory, `HttpOnly` cookie) is [33]" | S8 |
| 27:1883 | "Deeper CSRF defences, `SameSite` and token storage are [33]" | S9 |
| 27:2326 | "Not covered: token storage ([33]" | S8 |
| 32:1085 | "makes a server call an address the attacker picks ([33]" | S7 |
| 32:1876 | "`'*'` removes the guard ([33]" | S7 |

Stay file-level (headers, Read next, Uses these ideas later, Connections lists): 09:5, 09:1605, 09:1606, 13:5, 13:2514, 14:2206, 24:5, 24:2978-2979, 27:5, 27:2578-2579, 32:5, 32:2285-2286.

## Factual findings

**F-1 · Major (C2) · Q33.19 quotes the state script without its escapes (1533, 1535).** The spec (`labs/e2e/tests/33-security/outputs/q33-outputs.spec.ts` 99) asserts `"lab-display-name":"</script><script>window.__m33Hits=1</script>"`; `TransferState.toJson` (`_pending_tasks-chunk.mjs` 2897-2907) does `.replace(/</g, '\\u003C').replace(/\//g, '\\u002F')`. The text lost the `\u` sequences, so it contradicts itself.
- 1533: "The state script holds `"lab-display-name":"</script><script>window.__m33Hits=1</script>"`" → "The state script holds `"lab-display-name":"</script><script>window.__m33Hits=1</script>"`" (+0).
- 1535: "which replaces `<` with `<` and `/` with `/`" → "which replaces `<` with `<` and `/` with `/`" (+0).

**F-2 · Major (C1, a security control overstated) · §7 `resolveUrl` (603).** `resolveUrl` defaults to `allowProtocolRelative = false` and throws 5702 (`_server-chunk.mjs` 149-193), but that default is used only by `ServerPlatformLocation` (322, 367). `relativeUrlsTransformerInterceptorFn` (258-283), the path every server `HttpClient` request takes, passes a URL with a scheme to `next(request)` and calls `resolveUrl(…, { allowProtocolRelative: true })` for the rest. So "throws on a protocol-relative URL" reads as a request guard it is not.
- Fix: "throws on a **protocol-relative URL** (`//host/path`, another host)." → "throws on a **protocol-relative URL** (`//host/path`, another host) when it sets the server's location; the server's `HttpClient` interceptor calls it with `allowProtocolRelative: true`, so your requests get no such check." (+22)
- Q33.20 (1554), precision: "and resolves an absolute `http://10.0.0.5/admin` as written" → "and passes an absolute `http://10.0.0.5/admin` through untouched" (+0). The interceptor never calls `resolveUrl` for it.

**F-3 · Minor (C4) · two missing markers at first mention.**
- **(a) Trusted Types:** first body mention is the §3 callout (272); the marker is only at 477 (SEC-M33-06 flagged this). At 272: "CSP and Trusted Types are browser features ([09 §8](09-web-networking-storage-security.md#8-content-security-policy-and-trusted-types))." → "CSP and Trusted Types [Baseline 2026: newly available, per MDN] are browser features ([09 §8](09-web-networking-storage-security.md#8-content-security-policy-and-trusted-types); [Baseline](https://developer.mozilla.org/en-US/docs/Glossary/Baseline/Compatibility) means support in the latest stable Chrome, Edge, Firefox and Safari)." In the same callout, "`[Baseline: limited availability, per MDN]` ([Baseline](https://developer.mozilla.org/en-US/docs/Glossary/Baseline/Compatibility): support in the latest stable Chrome, Edge, Firefox and Safari)." → "`[Baseline: limited availability, per MDN]`." Keep 477's marker. (+5)
- **(b) `afterNextRender`:** `core.d.ts` 2717 `@publicApi 20.0`; 32 marks it the same way. At 193: "writes `innerHTML` itself in `afterNextRender`." → "writes `innerHTML` itself in `afterNextRender` [Stable since v20.0]." (+4)

**F-4 · Minor (C1) · §11 SRI attributes (915).** `augment-index-html.js` 147 writes modulepreload hints with `integrity` (169) but no `crossorigin`; the built `dist/security-lab/browser/index.html` shows the same.
- Fix: "adds `crossorigin="anonymous"` and `integrity` to each initial script, stylesheet and modulepreload link" → "adds `integrity` to each initial script, stylesheet and modulepreload link, and `crossorigin="anonymous"` to the scripts and stylesheets" (+6).

Marker formatting (Nit, no FIX): 265 and 272 write markers in backticks, 477 in plain text; house-wide mix, as REVIEW-M32 noted.

## Teaching and completeness findings

**T-1 · Minor (B9) · five terms before their definition.**
- 397: "(the import map that Subresource Integrity, a hash check on each file, adds; critical-CSS loading)" → "(the import map, a JSON `<script type="importmap">` that maps module names to files, which Subresource Integrity, a hash check on each file, adds; and the loading of critical CSS, the styles the build inlines for the first paint)" (+20). Basis: `augment-index-html.js` 117-131, `inline-critical-css.js` 73-75 (nonce option).
- 741: "turned on Angular's XSRF protection" → "turned on Angular's XSRF (its name for CSRF) protection" (+5).
- 814: "needs no preflight (tested)" → "needs no preflight, the CORS permission request of [09 §5](09-web-networking-storage-security.md#5-the-same-origin-policy-and-cors) (tested)" (+7).
- 919: "LTS gets" → "LTS (long-term support) gets" (+2).
- 1533: "After hydration the page shows" → "After hydration ([32 §4](32-ssr-ssg-hydration.md#4-hydration-reusing-the-servers-dom-mismatches-and-ngskiphydration)) the page shows" (+2).

**T-2 · Minor (M33.md C8) · internal names unmarked at first use in their section.**
- 263: "`SAFE_URL_PATTERN` refuses only" → "`SAFE_URL_PATTERN` (internal, may change in any release) refuses only" (+6).
- 338: "nothing provides `DomSanitizerImpl` as the root `Sanitizer`" → "nothing provides `DomSanitizerImpl` (exported only as `ɵDomSanitizerImpl`, internal) as the root `Sanitizer`" (+5).
- 424: "`addNonce` (`@angular/build` 22.2.1, `nonce.js`, read)" → "`addNonce` (`@angular/build` 22.2.1, `nonce.js`, internal, read)" (+1).

**T-3 · Minor (D2) · two Output short answers without the reason.**
- Q33.22 (1604), append: " Script in the page runs with the page's origin: it sees what the app sends, and the browser attaches the cookie to its requests." (+23)
- Q33.25 (1676), append: " `SameSite` decides which cookies cross sites; the server's header check decides the answer." (+13)

**T-4 · Minor (C1) · §11 misconception example (958).** "the lab's own has `^22.2.0`" is the lab's top-level range, not a transitive one. Basis: `labs/angular/package-lock.json` (root entry `^22.2.0`; `node_modules/@angular/core` requires `tslib` `^2.3.0`, locked at 2.8.1).
- Fix: "Transitive ranges float without a lockfile (the lab's own has `^22.2.0`);" → "Transitive ranges float without a lockfile: `@angular/core` 22.2.1 asks for `tslib` `^2.3.0`, which the lab's lockfile pins at 2.8.1;" (+10).

**Nits (folded into FIX-M33-01):**
- **N-1 (B8):** the §2 Coming-from-the-backend callout (184) lacks the `> [!TIP]` line STYLE-GUIDE §6 uses (as the guide's other callouts do). Insert `> [!TIP]` as its own line before 184 (+0).
- **N-2 (C1):** Q33.13 (1379) "the build copies only the attribute onto `index.html`'s inline tags" → "the build copies only the attribute onto `index.html`'s `<script>` and `<style>` tags" (+2). `nonce.js` tags every script, including `<script src>`, as §5 (424) says.
- **N-3 (C1):** §8 (678) "otherwise fetch's `same-origin` default applies" → "otherwise the request's `credentials` option, or fetch's `same-origin` default, applies" (+6). `createRequestInit` 990-994.
- **N-4:** Exercise 33.4 step 3 (2030): after "attaches it to this API only" add " (the prefix is a same-origin path ending in `/`, so unlike `[Q33.23](#q33-23)`'s origin prefix no other host can match)" (+20).

## Judged acceptable

- §5 Misconceptions' "blogs" cause clause (385): a cause, not a prevalence claim.
- The 15.2.5 Once-true line (265) and the RFC 10017 citation: not re-read; their basis is SEC LOG and SOURCES.
- §7's existing sentence "The relative-URL interceptor passes a URL with scheme and host through unchanged" is correct; F-2 only adds the scope of the protocol-relative check.

## Claims sampled (54)

| # | Claim (line) | Basis | Result |
|---|---|---|---|
| 1 | Six `@security` tags, named (91) | `_debug_node-chunk.d.ts` 5204, 7459; `core.d.ts` 8897, 8911; `platform-browser.d.ts` 588, 663 | Match |
| 2 | Renderer2 adds no security (156-178) | `_debug_node-chunk.d.ts` 3915 | Match |
| 3 | Interpolation: `updateTextNode` → `setValue` → `nodeValue` (176) | core 3299; `_dom_renderer-chunk.mjs` 679 | Match |
| 4 | Context from a schema table `SECURITY_SCHEMA` (243) | compiler 337-349 | Match |
| 5 | `checkSecurityContext` property/namespace/tag or `*`, else NONE (994) | compiler 364-391 | Match |
| 6 | `resolveSanitizers` emits `ɵɵsanitize*`/`ɵɵvalidateAttribute`; NONE none (994) | compiler 21907-21935 | Match |
| 7 | Static HTML/resource-URL attributes wrapped with `ɵɵtrustConstant*` (994) | compiler 21907-21935; core `ɵɵtrustConstant*` | Match |
| 8 | Compiled href uses `ɵɵdomProperty` with URL sanitizer (994) | core 15644; Section 12 spec | Match |
| 9 | Input match skips the sanitizer | core `setPropertyAndInputs` 5550 | Match |
| 10 | DOM property set as `el[name] = value` | `_dom_renderer-chunk.mjs` 672-677 | Match |
| 11 | NG0904 for a plain string in `[src]` (1266) | core `ɵɵsanitizeResourceUrl` (904) | Match |
| 12 | NG0910 `sandbox` only static (1266) | core 3503, 3357 | Match |
| 13 | Script context throws (905) | core `ɵɵsanitizeScript` | Match |
| 14 | `SAFE_URL_PATTERN` blocks only `javascript:`, any case, leading space (263) | core 3108 | Match |
| 15 | `data:text/html` and `vbscript:` pass (263) | core 3108; Section 3 spec | Match |
| 16 | CHANGELOG line a discrepancy (263) | core 3108 vs CHANGELOG (not re-read) | Match (source side) |
| 17 | HTML: inert document, skip script/style/template (261) | core 3066-3098, serializer | Match |
| 18 | Up to five passes, "input is unstable" (261, 1000) | core 3250-3280 | Match |
| 19 | Serializer allowlists and entity-encodes; clobber checks (1000) | core `SanitizingHtmlSerializer`, `encodeEntities` | Match |
| 20 | Root `Sanitizer` factory returns null; nothing provides `DomSanitizerImpl` (338) | core 7977, 9261; no provider in platform-browser | Match |
| 21 | `sanitize` unwraps a matching safe value (338) | `allowSanitizationBypassAndThrow` 3036; platform-browser 406-445 | Match |
| 22 | Typings comment vs code: throws only script and resource URL; style unchanged (340) | `platform-browser.d.ts` 600-603; `platform-browser.mjs` 406-445 | Match |
| 23 | NG05201 message text (340) | platform-browser 406-445; Section 4 spec | Match |
| 24 | Bypass guidance quoted (§4) | `platform-browser.d.ts` 580-586 | Match |
| 25 | Policies `angular`, `angular#unsafe-bypass`, JIT `angular#unsafe-jit` (483) | core 2951-2995; compiler 6847 | Match |
| 26 | No `angular#bundler` in build or dist (511) | grep `@angular/` (none); dist chunks | Match |
| 27 | Policy creation failure swallowed (§6) | core 2951-2995 try/catch | Match |
| 28 | `CSP_NONCE` defaults to the `ngCspNonce` attribute (1381) | `_pending_tasks-chunk.mjs` 2838 | Match |
| 29 | Runtime `<style>` gets the nonce (§5) | `_dom_renderer-chunk.mjs` 264-266 | Match |
| 30 | `addNonce` on every script and style tag (424) | `nonce.js` | Match |
| 31 | SSR + autoCsp throws, message quoted (430) | `index-html-generator.js` 43-49 | Match |
| 32 | Event-replay script nonced with `CSP_NONCE` (430) | `platform-server.mjs` 67, 88-98 | Match |
| 33 | `angular#auto-csp` policy built disabled (1459) | `auto-csp.js` 138, 212, 307 | Match |
| 34 | autoCsp schema sentence (§5) | `schema.json` 64 | Match |
| 35 | `toJson` escapes `<` and `/` (1535) | `_pending_tasks-chunk.mjs` 2897-2907 | Match in source; the module text lost the escapes (F-1) |
| 36 | `resolveUrl` throws on protocol-relative (603) | `_server-chunk.mjs` 149-193 vs 258-283 | **Partial: true only for the location (F-2)** |
| 37 | Interceptor passes scheme+host URLs unchanged (603) | `_server-chunk.mjs` 258-283 | Match |
| 38 | `withCredentials` → `include` (678) | common 985-995 | Match (N-3 completes it) |
| 39 | Default backend is FetchBackend | common 2050, 780-782 | Match |
| 40 | `XSSI_PREFIX`, stripped at 963 and 1862 (780) | common 774, 963, 1747, 1862 | Match |
| 41 | `XSRF-TOKEN` / `X-XSRF-TOKEN` defaults (759) | common 1081, 1085 | Match |
| 42 | `canMatch` runs before the loader (§10) | router 2646, 2895, 3171, 3186, 3212 | Match |
| 43 | SRI attributes on scripts, stylesheets, modulepreload (915) | `augment-index-html.js` 64-66, 147, 169; dist `index.html` | **Partial: modulepreload has no `crossorigin` (F-4)** |
| 44 | Import map of hashed lazy chunks, needs the nonce (915) | `augment-index-html.js` 117-131; dist `index.html` | Match |
| 45 | Import map before `<base href>` (917, For Jorge) | dist `index.html` | Match |
| 46 | `ignore-scripts` quote (907) | npm docs | Match |
| 47 | `min-release-age` quote, blocks `npm audit fix` (908) | npm docs 1239 | Match |
| 48 | `allowScripts` + `strict-allow-scripts`; `hasInstallScript` (1744) | npm docs 1891; `package-lock-json.md` | Match |
| 49 | `npm trust` needs 11.15.0 (1746) | npm docs | Match |
| 50 | Lab's `^22.2.0` as a transitive range (958) | `package-lock.json` | **Mismatch: top-level range (T-4)** |
| 51 | Q33.07 six warnings | angular `q33-outputs.spec.ts` | Match |
| 52 | Q33.22 values (1604) | e2e `q33-outputs.spec.ts` | Match |
| 53 | Q33.25 cookies, headers, 403 (1676) | e2e `q33-outputs.spec.ts` | Match |
| 54 | Q33.13 build copies the attribute to inline tags only (1379) | `nonce.js` | Match in effect; wording narrower than the code (N-2) |

## Proposed FIX tasks

The module is at 19,755 words; the CLOSE limit is 19,994 and the REVIEW ceiling 20,694.

Table rows (for the Module 33 table in TASKS.md):

```
| FIX-M33-01 | S | todo | REVIEW-M33 | |
| FIX-M33-02 | S | todo | REVIEW-M33 | |
| FIX-M33-03 | S | blocked | REVIEW-M33, Jorge ruling (REVIEW-M33 For Jorge 1) | |
```

### FIX-M33-01 · S · Q33.19 escapes, `resolveUrl` scope, markers, SRI attributes, terms, internal names, Output reasons, lockfile example, nits (F-1, F-2, F-3, F-4, T-1, T-2, T-3, T-4, N-1, N-2, N-3, N-4)
- Files: `modules/33-security.md`; `_meta/LOG.md` (its own line only).
- Do: apply each fix text above; find each line by its quoted text. In F-1, write the backslashes literally (`<`, `/`) inside the backticks. No lab file, test title or anchor change.
- Acceptance: `node labs/tools/check-snippets.mjs . 33` and `node labs/tools/check-links.mjs --planned` exit 0; `grep -c 'u003C.u002Fscript>.u003Cscript>window.__m33Hits=1' modules/33-security.md` ≥ 1; `grep -c 'with `<` and `/` with `/`' modules/33-security.md` = 0; `grep -c 'allowProtocolRelative: true' modules/33-security.md` ≥ 2; `grep -c 'the lab.s own has' modules/33-security.md` = 0; prose at most +200 over the count just before and at most 19,994, both counts in the LOG line.
- Model: **Sonnet** (every text is prescribed).

### FIX-M33-02 · S · Anchors for the file-level links into 33 (+0 words)
- Files: link targets only in `modules/09-*.md`, `12-*.md`, `13-*.md`, `14-*.md`, `24-*.md`, `27-*.md`, `32-*.md` (allowed through this FIX, RUN.md §10).
- Do: apply the Handoffs table (30 rows; find each line by its context). Verify each slug against module 33's `## N.` headings. Leave the stay-file-level lines alone.
- Acceptance: `check-links --planned` exit 0; `git diff --stat` touches only those seven files; their prose counts unchanged.
- Model: **Sonnet** (mechanical; slugs listed).

### FIX-M33-03 · S · `[Baseline: limited availability, per MDN]` form
- Files: `STYLE-GUIDE.md` §3.2 (or `modules/33-security.md` 272 if Jorge rules the other way).
- Blocked on Jorge (For Jorge 1). If approved: add the form to §3.2's list of marker forms. If refused: replace the marker at 272 with "(MDN lists Chrome, Edge and Firefox only)" and no marker.
- Acceptance: `check-links --planned` exit 0; module 33 prose within 19,994.
- Model: **Sonnet**.

## For Jorge

1. **Marker form** (SEC-M33-03): `[Baseline: limited availability, per MDN]` (272, `Element.setHTML()`) is not a STYLE-GUIDE §3.2 form. Add it to §3.2, or drop the marker (FIX-M33-03)?
2. **Carried from CLOSE-M33:**
   - VERSIONS.md rows: `autoCsp` (CLI 19.0), `CSP_NONCE` (16.0), Trusted Types support (11.0), npm 11.19.0;
   - the 22.2.1 CHANGELOG URL-sanitizer line that 22.2.1 does not implement (C11), and the docs' `angular#bundler` row: report upstream?
   - the SRI import map written before `<base href>`, so a deep link fails the integrity check (917): report upstream, and keep the third §11 test?
   - 29 of 30 questions (one slot unused).
3. **C12 rests on reading:** `labs/e2e` is wholly untracked, so "shared files changed only by HOUSE-29" cannot be diffed.
4. **Optional cleanup:** `labs/angular/projects/security-lab/tsconfig.spec.json` exists although no `*.spec.ts` lives under `projects/security-lab` (find) (not module text; no FIX).
