# REVIEW-X-01: cross-module consistency, chunk 1 (modules 01–11)

- **Reviewer:** a fresh reviewer subagent (claude-opus-5-5) of session S20261024-0835-claudecode. It wrote no FIX task for modules 01–11 in this session and continues no writer's conversation, so it is eligible (FINISH.md §4.1, RUN §4). It ran only read-only commands. Fixes, FIX-X rows and bookkeeping belong to REVIEW-X-06 and main.
- **Date:** 2026-10-24.
- **Summary:** 213 `X-01` items in REVIEW-X-SCAN.md: 11 are covered by 7 findings, 202 are judged acceptable. Two more findings come from the carry-over notes and the Summaries/glossary walk, for **9 findings: 1 High, 1 Medium, 7 Low**. No duplicate question and no glossary pair that cannot both be true inside 01–11. The High finding, X-01-F01, is a corrupted link target in module 09 left by FIX-M41-03. Its 22 stray tokens are exactly why 09 measures 10,021 prose words; removing them brings 09 to 9,999. That is the J1 option C cut (see For Jorge).
- **Line numbers** are as of this review. Every fix quotes its old text, and each quoted old text occurs exactly once in its file (checked with `grep -cF`, run).

## Runs (the reviewer, Node 24, 2026-10-24)

Verified by running:
- `grep`/`sed`/`awk` over REVIEW-X-SCAN.md: X-01 items per section 87 / 3 / 60 / 44 / 19 = 213 (`grep -c 'X-01'` = 213).
- `labs/tools/module-stats.mjs` `proseWords` (imported, read-only): 04 15,304; 07 9,975; 08 9,925; 09 10,021; 11 9,969; 34 18,905. 09 after removing the F01 text in memory: 9,999.
- A node script hashed the first code block of the 15 questions in the section-3 pairs (Q01.04, Q02.02, Q02.06, Q03.01, Q03.04, Q04.03, Q04.04, Q04.05, Q04.10, Q04.15, Q04.22, Q04.25, Q17.04, Q17.06, Q17.20): 15 distinct hashes.
- A node script listed the API before each ES and TypeScript marker in the scan (every version checked against the edition or release that introduced the feature).
- `grep -noE` over `modules/*.md` for link targets that contain a space: one hit, 09:342 (F01). `git log -S'09-web-networking-storage-security:367:'` finds no commit, and `git diff` shows the text arrived in the uncommitted FIX-M41-03 edit.
- Typings and packages, read with grep: `labs/ts-js/node_modules/typescript` 6.0.3, `lib.es5.d.ts:1633` `type NonNullable<T> = T & {};` (07:186); `@angular/compiler-cli/.../public_options.d.ts` doc comment on `strictTemplates` "Defaults to `true`" (glossary 12); `@angular/router/types/router.d.ts:465` `@experimental 21.1` on `withExperimentalPlatformNavigation` (08:421); `labs/angular/package.json` has `@angular/aria` and `@angular/cdk` 22.2.1, added in commit 4f70e64 (2026-10-18, HOUSE-34/35 for module 36) (F07).
- WebFetch, 2026-10-24: MDN `HTMLTemplateElement.shadowRootMode` ("Widely available … since February 2024"), MDN Navigation API ("Baseline 2026 Newly available … Since January 2026"), MDN `content-visibility` ("Baseline 2024 Newly available … Since September 2024"). WebSearch for an Official Journal citation of EN 301 549 V4.1.1: none found (F08, carry-over).

Read, not run: the 01–11 headers and Summaries; the glossary definitions in scan §4; the passages each item points at; VERSIONS.md; STATE standing notes; STATE-ARCHIVE lines 37, 53; REVIEW-M16 line 100 and the FIX-M16-06 prescription; TASKS FIX-M41-03; SYLLABUS §1–§3; STYLE-GUIDE §3, §5.1.

## Findings

#### X-01-F01 · High · carry-over / J1 · corrupted link target in 09 §5 (22 stray words)

- **Location:** `modules/09-web-networking-storage-security.md:342`, the *Coming from the backend* callout of §5: "Spring's `CorsConfigurationSource` (owner [41](41-fullstack-api-contracts.md#1-cors-on-both-sides-…-and-the-dev-proxy 09-web-networking-storage-security:367:1-cors-on-both-sides-… 34-i18n:1547:9-dates-time-zones-decimals-and-money-across-the-wire)) emits these headers."
- **Evidence:** FIX-M41-03 had to change only the link target `41-fullstack-api-contracts.md` → `…#1-cors-on-both-sides-…-dev-proxy`. Instead, the rest of its handoff list (22 `module:line:anchor` strings, 2,439 characters) went into the target. A target with spaces is not a CommonMark link, so the reader sees a 2,400-character run of slugs where the link should be. No commit contains it (`git log -S`, run); it is in the uncommitted diff. FIX-M41-03's acceptance check ("prose counts unchanged") was not met: module-stats counts the 22 strings as 22 prose words, and 09 is 10,021, exactly 21 over the cap. The same anchor is correct at 09:367, and `## 1. CORS on both sides: …` exists at 41:31 (grep, run). No other module has a link target with a space (grep, run).
- **Right side:** the link with the §1 anchor only.
- **Fix text:** in `modules/09-web-networking-storage-security.md`, on the line that starts `` > **Coming from the backend.** Spring's `CorsConfigurationSource` ``, delete the following text verbatim, which runs from just after the first `-dev-proxy` to just before `)) emits these headers.` (it starts with a space):

```text
 09-web-networking-storage-security:367:1-cors-on-both-sides-springs-corsconfigurationsource-spring-security-preflight-caching-credentials-and-the-dev-proxy 01-js-values-types-coercion:486:2-dto-contracts-what-crosses-the-wire-absent-versus-null-and-checking-responses-at-the-boundary 01-js-values-types-coercion:907:2-dto-contracts-what-crosses-the-wire-absent-versus-null-and-checking-responses-at-the-boundary 06-ts-type-system-essentials:1583:2-dto-contracts-what-crosses-the-wire-absent-versus-null-and-checking-responses-at-the-boundary 07-ts-advanced-types-and-decorators:1365:2-dto-contracts-what-crosses-the-wire-absent-versus-null-and-checking-responses-at-the-boundary 30-e2e-and-testing-strategy:481:3-openapi-with-springdoc-and-generated-typescript-clients-openapi-generator-orval-and-ng-openapi-gen 30-e2e-and-testing-strategy:1121:3-openapi-with-springdoc-and-generated-typescript-clients-openapi-generator-orval-and-ng-openapi-gen 30-e2e-and-testing-strategy:1460:3-openapi-with-springdoc-and-generated-typescript-clients-openapi-generator-orval-and-ng-openapi-gen 30-e2e-and-testing-strategy:1527:3-openapi-with-springdoc-and-generated-typescript-clients-openapi-generator-orval-and-ng-openapi-gen 07-ts-advanced-types-and-decorators:1199:4-evolving-the-contract-compatible-changes-api-versioning-in-spring-framework-7-and-deprecation-headers 04-js-async-event-loop:491:5-error-contracts-with-problemdetail-rfc-9457-and-mapping-them-in-angular 27-http-client:541:5-error-contracts-with-problemdetail-rfc-9457-and-mapping-them-in-angular 27-http-client:1552:5-error-contracts-with-problemdetail-rfc-9457-and-mapping-them-in-angular 27-http-client:1620:5-error-contracts-with-problemdetail-rfc-9457-and-mapping-them-in-angular 27-http-client:2578:5-error-contracts-with-problemdetail-rfc-9457-and-mapping-them-in-angular 28-state-management:1084:5-error-contracts-with-problemdetail-rfc-9457-and-mapping-them-in-angular 33-security:2129:7-validation-on-both-layers-bean-validation-angular-validators-and-server-errors-on-form-fields 01-js-values-types-coercion:704:9-dates-time-zones-decimals-and-money-across-the-wire 01-js-values-types-coercion:767:9-dates-time-zones-decimals-and-money-across-the-wire 01-js-values-types-coercion:1400:9-dates-time-zones-decimals-and-money-across-the-wire 34-i18n:821:9-dates-time-zones-decimals-and-money-across-the-wire 34-i18n:1547:9-dates-time-zones-decimals-and-money-across-the-wire
```

  So the line reads: `` > **Coming from the backend.** Spring's `CorsConfigurationSource` (owner [41](41-fullstack-api-contracts.md#1-cors-on-both-sides-springs-corsconfigurationsource-spring-security-preflight-caching-credentials-and-the-dev-proxy)) emits these headers. **Where the analogy breaks:** a server-side CORS filter blocks nothing for non-browser clients; only the browser decides what script may read. `` Acceptance: `grep -c 'storage-security:367:' modules/09-web-networking-storage-security.md` = 0; `grep -c '41-fullstack-api-contracts.md#1-cors-on-both-sides' modules/09-web-networking-storage-security.md` = 2; module-stats prose for 09 = 9,999 (−22).

#### X-01-F02 · Low · marker · `[Added in Angular 14]` disagrees with the owner's form

- **Location:** `modules/07-ts-advanced-types-and-decorators.md:443` "- **Typed forms** [Added in Angular 14]"; owner `modules/25-forms-reactive-and-template-driven.md:286` "**Typed forms** [Added in v14.0]".
- **Evidence:** STYLE-GUIDE §3.2 Angular forms use `vX.Y`. The owner of typed forms (25, SYLLABUS §4) uses the canonical form. `Angular N` is no J4 variant (J4 covers ES, TypeScript and NgRx).
- **Right side:** 25.
- **Fix text:** 07: `**Typed forms** [Added in Angular 14]` → `**Typed forms** [Added in v14.0]` (−1 word; 07 at 9,975 stays under the cap).

#### X-01-F03 · Low · marker · module 08's Baseline markers are not §3.2 forms, and four markers are in code spans

- **Location:** `modules/08-browser-rendering-dom-events.md`: 281 "`` `[Baseline widely available since February 2024, per MDN's shadowRootMode page]` ``"; 404 "`` `[Baseline 2026: newly available since January 2026, per MDN]` ``"; 115 "`` `[Baseline 2024: newly available, per MDN]` ``"; 421 "`withExperimentalPlatformNavigation()` `` `[Experimental since v21.1]` ``".
- **Evidence:** STYLE-GUIDE §3.2 forms are `[Baseline <year>: newly|widely available, per MDN]`, and markers are "inline text in square brackets", which the owner of the 421 API writes as plain text (24:1226 and 24:2389 `[Experimental since v21.1]`). The code spans also break the scan's API attribution (scan §2's third group lumps 08:421 with unrelated markers). The statuses are right (WebFetch, MDN, 2026-10-24): `shadowRootMode` is "Widely available … since February 2024" (Baseline year 2024), the Navigation API "Baseline 2026, Newly available, Since January 2026", `content-visibility` "Baseline 2024, Newly available"; the router typings say `@experimental 21.1` (grep, run).
- **Right side:** the §3.2 forms, written as plain text.
- **Fix text:** 08, four swaps: (1) `` `[Baseline widely available since February 2024, per MDN's shadowRootMode page]` `` → `[Baseline 2024: widely available, per MDN]`; (2) `` `[Baseline 2026: newly available since January 2026, per MDN]` `` → `[Baseline 2026: newly available, per MDN]`; (3) `` `[Baseline 2024: newly available, per MDN]` `` → `[Baseline 2024: newly available, per MDN]`; (4) `` `[Experimental since v21.1]` `` → `[Experimental since v21.1]`. In each, the old text includes the enclosing backticks and the new text has none (−7 words).

#### X-01-F04 · Low · marker · two markers in 04 carry prose, and one Node marker has a different shape

- **Location:** `modules/04-js-async-event-loop.md:141` "[Changed in Node 20: libuv 1.45 runs timers after poll in each iteration; they used to run first. Timers still run once before the first iteration, which is why older articles start the list with them.]"; `04:379` "[Changed in ES2019: the normative PR "Reduce the number of ticks in async/await", merged into ECMA-262 in February 2019]"; `modules/06-ts-type-system-essentials.md:53` "[Stable since Node.js v24.12.0]".
- **Evidence:** a §3.2 marker is a status plus a short "what changed". 04:141 puts two explanatory sentences inside the brackets. 04:379's text says where the change came from, not what changed (the sentence before it already says "one tick for a native promise or a plain value"). The other Node markers in the chunk read `Node 20`, `Node 22.12`, `Node 23.0` (04:141, 05:181, 05:821, 05:134), so 06:53's `Node.js v24.12.0` is the odd shape. This matters if J4 extends the canonical list to runtime and language variants: one regular expression has to match them all.
- **Right side:** short markers, with the prose moved out of the brackets.
- **Fix text:** (1) 04: `[Changed in Node 20: libuv 1.45 runs timers after poll in each iteration; they used to run first. Timers still run once before the first iteration, which is why older articles start the list with them.]` → `[Changed in Node 20: libuv 1.45 runs timers after poll in each iteration]`. They used to run first. Timers still run once before the first iteration, which is why older articles start the list with them. (2) 04: `[Changed in ES2019: the normative PR "Reduce the number of ticks in async/await", merged into ECMA-262 in February 2019]` → `[Changed in ES2019]` (the normative PR "Reduce the number of ticks in async/await", merged into ECMA-262 in February 2019). (3) 06: `[Stable since Node.js v24.12.0]` → `[Stable since Node 24.12]`. Word change: 04 +0; 06 −1.

#### X-01-F05 · Low · header · 03's Leads to omits 07 and 08, which list 03 as a prerequisite

- **Location:** `modules/03-js-objects-prototypes-classes.md:5` "`> **Leads to:** [05. …], [06. TypeScript type system essentials](06-ts-type-system-essentials.md), [17. Signals](17-signals.md), [28. State management](28-state-management.md)`"; `07:4` "`[03. Classes](03-js-objects-prototypes-classes.md#3-classes-the-sugar-and-what-is-not-sugar) (what a decorator decorates)`"; `08:4` "`[03. Classes](…#3-classes-…) (what a custom element extends)`".
- **Evidence:** scan §5 "07 lists 03 as prerequisite, but 03 Leads to omits 07" and "08 lists 03 …". Both prerequisite links point to the specific section they depend on, so they are right. The return edge is missing.
- **Right side:** 07 and 08 (keep their prerequisites); 03 adds the return links.
- **Fix text:** 03, `> **Leads to:**` line: `[06. TypeScript type system essentials](06-ts-type-system-essentials.md), [17. Signals](17-signals.md)` → `[06. TypeScript type system essentials](06-ts-type-system-essentials.md), [07. Advanced types and decorators](07-ts-advanced-types-and-decorators.md), [08. Browser rendering, the DOM and events](08-browser-rendering-dom-events.md), [17. Signals](17-signals.md)` (+12 words; 03 is over the cap at 16,354 and depends on J1).

#### X-01-F06 · Low · header · 04's Leads to omits 08, which lists 04 as a prerequisite

- **Location:** `modules/04-js-async-event-loop.md:5` "`> **Leads to:** [05. Modules, memory and modern features](05-js-modules-memory-modern-features.md), [09. Networking, storage and security](09-web-networking-storage-security.md), …`"; `08:4` "`[04. The event loop](04-js-async-event-loop.md#1-the-event-loop-tasks-microtasks-and-rendering) (tasks, microtasks and the rendering opportunity)`".
- **Evidence:** scan §5 "08 lists 04 as prerequisite, but 04 Leads to omits 08". 08 §1/§3 depend on the rendering opportunity and microtasks that 04 §1 teaches.
- **Right side:** 08; 04 adds the return link.
- **Fix text:** 04, `> **Leads to:**` line: `[05. Modules, memory and modern features](05-js-modules-memory-modern-features.md), [09. Networking, storage and security](09-web-networking-storage-security.md)` → `[05. Modules, memory and modern features](05-js-modules-memory-modern-features.md), [08. Browser rendering, the DOM and events](08-browser-rendering-dom-events.md), [09. Networking, storage and security](09-web-networking-storage-security.md)` (+7 words; 04 is over the cap and depends on J1).

#### X-01-F07 · Low · header (Applies to) · 11 says the CDK and `@angular/aria` are "not installed"

- **Location:** `modules/11-accessibility.md:6` "> **Applies to:** … Angular CDK (Component Dev Kit) 22.2 and `@angular/aria` 22.2 read from their typings, not installed".
- **Evidence:** this was true when 11 was written (2026-10-07). Since commit 4f70e64 (2026-10-18, HOUSE-34/35 for module 36), `labs/angular/package.json` pins `@angular/aria` and `@angular/cdk` 22.2.1, and both are in `labs/angular/node_modules/@angular/` (ls, run). A reader who checks the labs finds them installed. Module 11's own labs (ts-js, jsdom) still do not import them. Versions match VERSIONS.md (`@angular/cdk` 22.2.1). VERSIONS.md has no `@angular/aria` row (J9, For Jorge).
- **Right side:** the repository as it stands.
- **Fix text:** 11: `read from their typings, not installed` → `read from their typings, not used in module 11's labs` (+4 words; 11 at 9,969, +10 with F08 → 9,979).

#### X-01-F08 · Medium · carry-over / contradiction · Q11.02 implies EN 301 549 V4.1.1 is cited in the Official Journal

- **Location:** `modules/11-accessibility.md:682` (Q11.02 Full explanation) "Article 15 presumes conformity for harmonised standards cited in the Official Journal: EN 301 549 V3.2.1 maps WCAG 2.1 AA for Directive 2016/2102, V4.1.1 WCAG 2.2 for the EAA too."; against `11:55` (§1) "giving a presumption of conformity only once it is cited in the Official Journal (its citation status was not established here)".
- **Evidence:** STATE-ARCHIVE line 37 (REVIEW-M11 F-1, FIX-M11-02 V-1) asks for a re-check at the finish line. Re-checked 2026-10-24 (WebSearch): no Official Journal notice citing V4.1.1 was found, so §1's hedge still holds. Q11.02 drops that hedge. Its colon makes V4.1.1 one of the cited standards that "presume conformity" for the EAA, which §1 says is not established. Inside module 11 the two statements cannot both stand.
- **Right side:** §1 (11:55).
- **Fix text:** 11, Q11.02: `V4.1.1 WCAG 2.2 for the EAA too.` → `V4.1.1 WCAG 2.2 for the EAA too, once cited.` (+2 words; the carry-over note stays open for Jorge until a citation is found).

#### X-01-F09 · Low · contradiction (glossary) · 34 defines a polyfill as a script "the build runs"

- **Location:** glossary `polyfill` (scan §4): `modules/05-js-modules-memory-modern-features.md` §8 "**polyfill**: code that adds a missing standard API at run time; syntax cannot be polyfilled, only compiled"; `modules/34-i18n.md:286` "A **polyfill** is a script the build runs to add a global your code expects:".
- **Evidence:** the build does not run a `polyfills` entry. It bundles it, and the browser runs it before the application code. 34's own next clause says so: "the `i18n-lab` build lists it in `polyfills`", and 34:560 describes the emitted polyfills module. 05 places a polyfill "at run time", so the two definitions disagree on when the code runs. They also differ on scope: `$localize` is no standard API. That is Angular's broader use of the word, and it is fine once the timing is right.
- **Right side:** 05 on timing; 34 keeps its broader scope.
- **Fix text:** 34: `A **polyfill** is a script the build runs to add a global your code expects:` → `A **polyfill** is a script the build bundles to run before your code and add a global it expects:` (+4 words; Part D has no prose cap).

## Carry-over notes (STATE standing notes, STATE-ARCHIVE) about 01–11

- **EN 301 549 V4.1.1 citation (11, "re-check at finish line"; STATE "Docs vs run", ARCHIVE 37):** re-checked; still not established. §1's hedge is right; Q11.02's missing hedge is **X-01-F08**. The note stays open.
- **05:853 tree-shaking of unused root services (STATE "Stale statements", ARCHIVE 53):** retired. FIX-M16-06 landed: 05:853 now reads "unused ones can drop out, though one scratch build kept unused services re-exported through an index ([16 §3]…)" (grep, run).
- **04:1148 initializer pointer (same notes):** retired. It now points to `12-angular-how-it-works.md#q12-17` (grep, run), and Q12.17 is `APP_INITIALIZER` versus `provideAppInitializer`.
- **02:1303 `provideAppInitializer` pointer (REVIEW-M16 addition):** retired, fixed the same way (grep, run).
- **"Module 01 owns `Intl.Segmenter`; 34 must not ask a second Segmenter question" (STATE):** retired. No `### Q34` heading mentions Segmenter (grep, run).
- **Prose cap for 01–06 (STATE):** this is J1, Jorge's. For 09, see F01 and For Jorge.
- **Open rulings for 11 without a FIX keyword** (`axe-core` devDependency, WCAG 2.2.2/2.3.3 not named in §1, EAA text, four vs five ARIA rules): stay Jorge's (not a "FIX candidate/stale/wrong/re-check" item).
- **Anchor candidates (01:189 …, 09:404 …, 10:381, 10:851, 11 file-level links), trims FIX-M07-04 and FIX-M09-03, and VERSIONS rows (`sass` 1.104.1 for 10):** J9, unchanged.

## Judged acceptable

Scan items, 202 in all:

- **§1 markers, 81 of 87:**
  - 44 `[Added in ESN]` and 2 `[Added in ESN, ECMA-402 …]` (01:172 `Intl.Segmenter` ECMA-402 2022; 01:672 `Intl.NumberFormat` v3 ECMA-402 2023). Every edition matches the feature (listed by script, checked against the edition that introduced it: e.g. `Object.hasOwn` ES2022, change-by-copy ES2023, iterator helpers and import attributes ES2025, `Error.isError` ES2026 in both 05 and 06:288, `using` ES2027 only in 05).
  - `[Changed in ES2023…]` 05:333 and 05:370.
  - Node markers 05:134, 05:181 and 05:821.
  - 24 `[Added in TypeScript N.N]` and 6 `[Changed in TypeScript …]` (06:210, 06:310, 06:361, 07:46, 07:147, 07:186). Versions match the TypeScript releases (e.g. `satisfies` 4.9, `NoInfer` 5.4, `strictBuiltinIteratorReturn` 5.6, `erasableSyntaxOnly` 5.8; 07:186's `T & {}` confirmed in `lib.es5.d.ts`, run).
  - All of these are J4 variants. Keep them if J4 accepts them. A J4 amendment must also accept the `, ECMA-402 …` suffix and the `Node N(.N)` runtime form (see F04). Repeats of a marker after its first mention (03:134/167, 03:220/975, 05:3/398/1163) carry the same text and contradict nothing.
  - The other 6 §1 items are in F02, F03 and F04.
- **§2, 3 groups:** scanner artifacts. The "API" token is `). `, `, ` or a space, so each group lumps markers of unrelated APIs (03:134 `Object.hasOwn`, 06:358 `strictBuiltinIteratorReturn`, 08:421 `withExperimentalPlatformNavigation`, with APIs of 14–37). No API has two markers. F03 removes the backticks that cause 08:421's artifact.
- **§3, 60 pairs:** 59 share the generic title "What does this print?". The 15 snippets are all distinct (hash, run). Q02.06 (a `var`/`let` closure loop) and Q04.04 (`async1`/`async2` microtask order) differ in topic. None is a duplicate.
- **§4, 43 of 44 terms:**
  - Homonyms that are true in their own field: `binding` 02/20; `composition` 03/14; `constraint` 07/45; `mixin` 03/10; `origin` 09/10; `nonce` 09/42; `slot` 08/12/19; `track` 10/39; `baseline` 47 (a measurement); `app shell` (09, the PWA pattern; 37, Angular's build-time route); `dto` (03 TypeScript plain data; 41 a Java class).
  - Compatible restatements: `accessibility tree`, `aria`, `baseline` (08 "about 2.5 years later", 35 "at least 2.5 years", 44 "2.5+ years", all MDN's 30 months), `chunk`, `commonjs`, `compositor-only property`, `cors`, `custom element`, `debounce`, `throttle`, `design token`, `esbuild`, `heap snapshot`, `idempotency key`, `jsdom`, `layout thrashing`, `logical property`, `memoization`, `microtask`, `narrowing`, `ngc`, `optional chaining` (01 JavaScript; 13 templates), `roving tabindex`, `service worker`, `specificity`, `stricttemplates` (12's "defaults to `true` since v22" matches the compiler-cli doc comment, run), `structured clone`, `top layer`, `unhandled rejection`, `violation report`, `vitest`, `web app manifest`, `web worker`.
  - `polyfill` is F09.
- **§5, 15 of 19:**
  - 5 "extra against SYLLABUS" lines (03: 01; 05: 02; 06: 01, 05; 07: 03; 08: 04, 03). Each is a section-level link to an earlier module that the section depends on. SYLLABUS §1 lists only the module-level minimum, and each listed module's Leads to has the reverse edge, except the three in F05 and F06.
  - Applies to lines of 01–10: they match VERSIONS.md (ES2026 = ECMA-262 17th edition; TypeScript 6.0.3; Node 24; Angular 22; Zod 4.6 vs 4.6.5; jsdom 30.1 vs 30.1.1). 05's "and the ES2027 features already finished" agrees with its own §8. 10's Dart Sass 1.104 is a throwaway probe (its VERSIONS row is J9).
  - 11's Applies to is F07.

Not scan items, checked and acceptable:
- **Summaries of 01–11 against the owners:** 01 "SameValue (`Object.is`, the default `equal` of Angular signals)" = 17:127; 07's `experimentalDecorators: true` = `labs/angular/tsconfig.json:13`; 09's hashed assets a year plus `immutable` and HTML `no-cache` = 44:305/1418; 08's 75th-percentile field data = 31:68; 06's "`strict` … the default since 6.0" = VERSIONS line 57. No Summary contradicts an owner.

## For Jorge

1. **J1, module 09.** 09 is 21 words over the cap only because of the FIX-M41-03 corruption (F01). The fix removes 22 tokens and puts 09 at 9,999, so option C needs no redundancy cut. The margin is 1 word: no other FIX-X in this chunk adds words to 09. If a later fix must add words, a candidate cut is to drop the parenthetical in §5's mental model, "The browser guards each **origin** (scheme, host and port)." → "The browser guards each **origin**." (−4 words), because "Same origin means same scheme, host and port" follows 17 lines later. Check first that this is not the term's defining first use.
2. **J4 scope.** In 01–11 the variant family also includes `Changed in ES20xx`, `Changed in TypeScript x.y`, `Node N(.N)` and the `, ECMA-402 …` suffix. If J4 makes variants canonical, the amended §3.2 and the scan regexes should cover these too. F04 normalizes the one odd Node shape.
3. **Backticked markers guide-wide.** F03 fixes module 08's four. Grep finds about 36 more in 13, 14, 17, 22, 23, 28, 29, 32 and 33. Their chunks decide them, or REVIEW-X-06 makes it one rule.
4. **VERSIONS row (J9):** `@angular/aria` 22.2.1 is installed in `labs/angular` but has no VERSIONS.md row.
5. **Process:** FIX-M41-03's acceptance "prose counts of every touched module unchanged" would have caught F01. Running module-stats per touched module may be worth adding to future link-only FIX checks.
