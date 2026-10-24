# REVIEW-X: consolidated cross-module findings and the FIX-X tasks

- **Task:** REVIEW-X-06 (FINISH.md §4.4), session S20261024-0943-claudecode, consolidator claude-opus-5-5. It edited no module file.
- **Date:** 2026-10-24.
- **Inputs:** REVIEW-X-01 … REVIEW-X-05 (every finding, its fix text and its notes for REVIEW-X-06); FINISH.md §4.4 and For Jorge. No J-ruling is recorded in STATE, so the stated defaults apply: **J1 option C** (cap exceptions for 01–06 through HOUSE-44; module 09 brought under the cap by a FIX-X) and **J4 default** (amend STYLE-GUIDE §3.2 and the scan's canonical list to accept the marker variants).
- **Summary:** **47 findings** (X-01 9, X-02 11, X-03 11, X-04 12, X-05 4; 1 High, 5 Medium, 41 Low). **47 fixed, 0 not fixed.** They become **19 FIX-X tasks**: 18 that each own a disjoint file set (one or two module files, or `_meta/GLOSSARY-TERMS.md`) and can run in parallel, and FIX-X-19 (the J4 amendment), which runs after them because its scan count is measured on the fixed modules.
- **Runs (this task):** `node labs/tools/module-stats.mjs .` (09 10,021; 07 9,975; 08 9,925; 11 9,969; 42 9,831; 43 9,664; 45 8,242); `node labs/tools/consistency-scan.mjs .` (section 1: 132 non-canonical items); `grep -cF` of every acceptance string in the FIX-X blocks (their "before" counts); a scratch node script (outside the repo, deleted) that applied FIX-X-19's proposed canonical list to the 132 items: 7 remain once FIX-X-01…18 land (listed under For Jorge). Read, not run: the five reports, FINISH.md, the Leads to lines of 01, 03, 04, 08, 12, 16–19, 21, 22, 24, 27, 29.

## Consolidation decisions

1. **Shared lines merged.** 16:5 takes X-03-F07 and X-04-F06; 17:5 takes X-02-F05, X-03-F08 and X-04-F07. Each is one edit that writes the whole line in numeric order (the texts are under Consolidated fix texts). 09:5's X-05-F01 and 09:342's X-01-F01 are one task, so 09's word budget is checked once.
2. **One task per file set.** No two FIX-X tasks list the same file. Every module file is in exactly one task, `_meta/GLOSSARY-TERMS.md` (X-02-F06…F09, X-03-F11) is one task, and STYLE-GUIDE.md with the scan script is one task. FIX-X-19 depends on FIX-X-01…18.
3. **One fix text adjusted.** X-01-F04 (2) would leave `[Changed in ES2019]` with no `: …`, the bare form X-02-F02 fixes in 13 and 14 and that the scan's `Changed` pattern rejects. The consolidated text keeps a short "what changed" (text below). +4 words in 04, which is over the cap and covered by J1.
4. **Module 09 (J1 option C).** X-01-F01 removes the 22 stray tokens (10,021 → 9,999) and X-05-F01 is word-neutral, so no redundancy cut is needed. FIX-X-01's acceptance pins 09 at 9,999.
5. **Backticked markers.** X-01 For Jorge 3 counted about 36 markers in code spans outside 08. X-02-F04, X-03-F05/F06 and X-04-F02 cover all of them: after FIX-X-01…18 the guide-wide count of a backtick followed by a marker keyword is 1, the `[Deprecated]` mention at 13:1016, which is not a marker.
6. **X-03-F02 (RxJS versions)** takes the reviewer's default: one sentence each in 22 and 23, no marker rewrites. FIX-X-19 also states the rule in STYLE-GUIDE §3.2.
7. **FIX-X-19 (J4 default) scope.** It amends §3.2 for J4's three named variants and for the shapes the chunk reviewers asked to include if J4 makes variants canonical: `Changed in ES/TypeScript`, `Node N(.N)`, the `, ECMA-402 …` suffix (X-01 For Jorge 2), patch versions `vX.Y.Z` (X-02 For Jorge 1, X-03 For Jorge 1, X-04 For Jorge 1) and a third-party library prefix such as `TanStack Query v5.12.1` (X-03-F05, For Jorge 1). Deprecations without a replacement and bare `Changed` markers are left out: they stay with Jorge (below).

## Finding index

| Finding | Severity | Summary | Location (as of the review) | FIX-X |
|---|---|---|---|---|
| X-01-F01 | High | Corrupted link target (22 stray `module:line:anchor` tokens) in the *Coming from the backend* callout; the cause of 09's 10,021 words | `modules/09-web-networking-storage-security.md:342` | FIX-X-01 |
| X-01-F02 | Low | `[Added in Angular 14]` → `[Added in v14.0]` (owner 25's form) | `modules/07-ts-advanced-types-and-decorators.md:443` | FIX-X-04 |
| X-01-F03 | Low | Four non-§3.2 or backticked markers (three Baseline, one Experimental) | `modules/08-browser-rendering-dom-events.md:115, 281, 404, 421` | FIX-X-04 |
| X-01-F04 | Low | Two markers in 04 carry prose; 06's Node marker has an odd shape | `modules/04-js-async-event-loop.md:141, 379`; `modules/06-ts-type-system-essentials.md:53` | FIX-X-03 (379 text adjusted, decision 3) |
| X-01-F05 | Low | 03's Leads to omits 07 and 08 | `modules/03-js-objects-prototypes-classes.md:5` | FIX-X-02 |
| X-01-F06 | Low | 04's Leads to omits 08 | `modules/04-js-async-event-loop.md:5` | FIX-X-03 |
| X-01-F07 | Low | Applies to says the CDK and `@angular/aria` are "not installed" | `modules/11-accessibility.md:6` | FIX-X-05 |
| X-01-F08 | Medium | Q11.02 drops §1's hedge on the EN 301 549 V4.1.1 citation | `modules/11-accessibility.md:682` | FIX-X-05 |
| X-01-F09 | Low | Polyfill defined as a script "the build runs" | `modules/34-i18n.md:286` | FIX-X-05 |
| X-02-F01 | Low | `[Deprecated since CLI 22.0 — …]` → `v22.0` | `modules/12-angular-how-it-works.md:263` | FIX-X-06 |
| X-02-F02 | Low | Twelve bare `[Changed in vX]` markers get their `: …` text (ten swaps) | `modules/13-components-and-templates.md:55, 132, 316, 1100 (×3), 1122, 1266, 1895`; `modules/14-directives-and-pipes.md:632, 893, 2198` | FIX-X-06 (13, swaps 1–7), FIX-X-07 (14, swaps 8–10) |
| X-02-F03 | Low | Two statuses inside one bracket | `modules/13-components-and-templates.md:686` | FIX-X-06 |
| X-02-F04 | Low | Ten markers written as code spans; 17:1646 detached from its API | `modules/14-directives-and-pipes.md:806`; `modules/17-signals.md:128, 278 (×2), 281, 644, 645, 791, 1646, 2275` | FIX-X-07 |
| X-02-F05 | Low | 17's Leads to omits 14 and 20 | `modules/17-signals.md:5` | FIX-X-07 (merged line) |
| X-02-F06 | Low | `=0` called a plural category (module and glossary) | `modules/14-directives-and-pipes.md:636`; `_meta/GLOSSARY-TERMS.md:641` | FIX-X-07 (14), FIX-X-18 (glossary) |
| X-02-F07 | Low | Change detection "checks every template binding" (module and glossary) | `modules/20-lifecycle-and-render-hooks.md:34`; `_meta/GLOSSARY-TERMS.md:885` | FIX-X-10 (20), FIX-X-18 (glossary) |
| X-02-F08 | Medium | "Fine-grained reactivity" view-level in 17/21, expression-level in 40 | `modules/40-framework-comparisons.md:280`; `_meta/GLOSSARY-TERMS.md:2346` | FIX-X-15 (40), FIX-X-18 (glossary) |
| X-02-F09 | Low | A budget "fails the build" (owner 12: warns or fails) | `modules/31-performance.md:495`; `_meta/GLOSSARY-TERMS.md:1620` | FIX-X-10 (31), FIX-X-18 (glossary) |
| X-02-F10 | Low | 12 says the lab workspace has one project (it has eight) | `modules/12-angular-how-it-works.md:127` | FIX-X-06 |
| X-02-F11 | Low | 20's Summary: only the constructor has an injection context | `modules/20-lifecycle-and-render-hooks.md:841` | FIX-X-10 |
| X-03-F01 | Medium | 23 says `rxResource` "has no value while it reloads" (17 and 27: `reload()` keeps it) | `modules/23-rxjs-in-depth.md:985, 708` | FIX-X-11 |
| X-03-F02 | Medium | RxJS markers use the bare `vX.Y` that means Angular elsewhere; one sentence each in 22 and 23 | `modules/22-rxjs-foundations.md` (intro, `7.x` branch sentence); `modules/23-rxjs-in-depth.md` (intro, "Status markers come from") | FIX-X-11 |
| X-03-F03 | Low | Four RxJS deprecation tails "pass …"/"keep …" → "use …" | `modules/22-rxjs-foundations.md:178, 181, 714`; `modules/23-rxjs-in-depth.md:304` | FIX-X-11 |
| X-03-F04 | Low | Two HttpClient deprecation markers with no "use" tail | `modules/27-http-client.md:140, 503` | FIX-X-13 |
| X-03-F05 | Low | Four module-28 markers carry prose or lack a replacement | `modules/28-state-management.md:65, 648, 773, 972` | FIX-X-12 |
| X-03-F06 | Low | Twelve more markers written as code spans | `modules/22-rxjs-foundations.md:460`; `modules/23-rxjs-in-depth.md:889, 943`; `modules/28-state-management.md:557, 831, 953, 955 (×2), 980 (×3)`; `modules/29-testing-angular.md:282` | FIX-X-11 (22, 23), FIX-X-12 (28, 29) |
| X-03-F07 | Low | 16's Leads to omits 25 and 29 | `modules/16-dependency-injection.md:5` | FIX-X-08 (merged line) |
| X-03-F08 | Low | 17's Leads to omits 27 | `modules/17-signals.md:5` | FIX-X-07 (merged line) |
| X-03-F09 | Low | 19's Leads to omits 24, 28 and 29 | `modules/19-component-communication-and-projection.md:5` | FIX-X-09 |
| X-03-F10 | Low | 22's Leads to omits 28 | `modules/22-rxjs-foundations.md:5` | FIX-X-11 |
| X-03-F11 | Low | Glossary gives `HttpTestingController` the `cancelled` flag of `TestRequest`; 23 calls it the test double | `_meta/GLOSSARY-TERMS.md:1045`; `modules/23-rxjs-in-depth.md:182` | FIX-X-18 (glossary), FIX-X-11 (23) |
| X-04-F01 | Low | `isSignalErrorState` was added in 22.0.4, not changed | `modules/36-material-and-cdk.md:145` | FIX-X-15 |
| X-04-F02 | Low | Twelve markers in 32 and 33 written as code spans (11 swaps) | `modules/32-ssr-ssg-hydration.md:524, 606 (×2), 630 (×2), 1063, 1081, 1091, 1133, 1615`; `modules/33-security.md:266, 273` | FIX-X-14 |
| X-04-F03 | Low | 01's Leads to omits 34 | `modules/01-js-values-types-coercion.md:5` | FIX-X-02 |
| X-04-F04 | Low | 08's Leads to omits 35 | `modules/08-browser-rendering-dom-events.md:5` | FIX-X-04 |
| X-04-F05 | Low | 12's Leads to omits 40 | `modules/12-angular-how-it-works.md:5` | FIX-X-06 |
| X-04-F06 | Low | 16's Leads to omits 37 | `modules/16-dependency-injection.md:5` | FIX-X-08 (merged line) |
| X-04-F07 | Low | 17's Leads to omits 40 | `modules/17-signals.md:5` | FIX-X-07 (merged line) |
| X-04-F08 | Low | 18's Leads to omits 31 and 35 | `modules/18-control-flow-and-defer.md:5` | FIX-X-08 |
| X-04-F09 | Low | 21's Leads to omits 40 | `modules/21-change-detection.md:5` | FIX-X-09 |
| X-04-F10 | Low | 24's Leads to omits 35 | `modules/24-routing.md:5` | FIX-X-13 |
| X-04-F11 | Low | 27's Leads to omits 37 | `modules/27-http-client.md:5` | FIX-X-13 |
| X-04-F12 | Low | 29's Leads to omits 36 | `modules/29-testing-angular.md:5` | FIX-X-12 |
| X-05-F01 | Low | 09's Leads to omits 44 (word-neutral fix: shorter 41/42 labels) | `modules/09-web-networking-storage-security.md:5` | FIX-X-01 |
| X-05-F02 | Medium | 42's Summary says `csrf.spa()` masks the token (§6, Q42.17 and 43 say it accepts the raw value) | `modules/42-fullstack-authentication.md:1409` | FIX-X-16 |
| X-05-F03 | Low | 43 says a TLS proxy "needs `ForwardedHeaderFilter`"; owner 44 configures `NATIVE` | `modules/43-fullstack-realtime.md:838` | FIX-X-16 |
| X-05-F04 | Low | 45 points to 37 §4 for the missing `sync` listener; 37 states it in §7 | `modules/45-frontend-system-design-method.md:584, 1175` | FIX-X-17 |

Count: 9 + 11 + 11 + 12 + 4 = 47 rows, 47 with a FIX-X ID, 0 "not fixed". Severity: High 1 (X-01-F01); Medium 5 (X-01-F08, X-02-F08, X-03-F01, X-03-F02, X-05-F02); Low 41.

## FIX-X tasks

| Task | Size | Model | Files | Findings | Depends |
|---|---|---|---|---|---|
| FIX-X-01 | S | Haiku | 09 | X-01-F01, X-05-F01 | REVIEW-X-06 |
| FIX-X-02 | S | Haiku | 01, 03 | X-04-F03, X-01-F05 | REVIEW-X-06 |
| FIX-X-03 | S | Sonnet | 04, 06 | X-01-F04, X-01-F06 | REVIEW-X-06 |
| FIX-X-04 | S | Haiku | 07, 08 | X-01-F02, X-01-F03, X-04-F04 | REVIEW-X-06 |
| FIX-X-05 | S | Sonnet | 11, 34 | X-01-F07, X-01-F08, X-01-F09 | REVIEW-X-06 |
| FIX-X-06 | S | Sonnet | 12, 13 | X-02-F01, X-02-F10, X-04-F05; X-02-F02 (1–7), X-02-F03 | REVIEW-X-06 |
| FIX-X-07 | M | Sonnet | 14, 17 | X-02-F02 (8–10), X-02-F04, X-02-F06 (1); X-02-F05 + X-03-F08 + X-04-F07 (merged line) | REVIEW-X-06 |
| FIX-X-08 | S | Haiku | 16, 18 | X-03-F07 + X-04-F06 (merged line), X-04-F08 | REVIEW-X-06 |
| FIX-X-09 | S | Haiku | 19, 21 | X-03-F09, X-04-F09 | REVIEW-X-06 |
| FIX-X-10 | S | Sonnet | 20, 31 | X-02-F07 (1), X-02-F11, X-02-F09 (1) | REVIEW-X-06 |
| FIX-X-11 | M | Sonnet | 22, 23 | X-03-F01, F02, F03, F06 (1–3), F10, F11 (2) | REVIEW-X-06 |
| FIX-X-12 | M | Sonnet | 28, 29 | X-03-F05, X-03-F06 (4–12), X-04-F12 | REVIEW-X-06 |
| FIX-X-13 | S | Haiku | 24, 27 | X-04-F10, X-03-F04, X-04-F11 | REVIEW-X-06 |
| FIX-X-14 | S | Haiku | 32, 33 | X-04-F02 | REVIEW-X-06 |
| FIX-X-15 | S | Sonnet | 36, 40 | X-04-F01, X-02-F08 (1) | REVIEW-X-06 |
| FIX-X-16 | S | Sonnet | 42, 43 | X-05-F02, X-05-F03 | REVIEW-X-06 |
| FIX-X-17 | S | Haiku | 45 | X-05-F04 | REVIEW-X-06 |
| FIX-X-18 | S | Sonnet | `_meta/GLOSSARY-TERMS.md` | X-02-F06 (2), F07 (2), F08 (2), F09 (2), X-03-F11 (1) | REVIEW-X-06 |
| FIX-X-19 | M | Sonnet (main runs the tests) | `STYLE-GUIDE.md` §3.2, `labs/tools/consistency-scan.mjs`, `labs/tools/consistency-scan.test.mjs` | J4 default (decision 7) | FIX-X-01 … FIX-X-18 |

Parallel: FIX-X-01 … FIX-X-18 share no file and can run in any order or at once (main still runs the checks serially). FIX-X-19 runs last.

## Consolidated fix texts

These replace or complete the fix texts of the reports where decisions 1 and 3 apply. Everything else is applied verbatim from the report named in the index.

**C1 · 16:5 (FIX-X-08; X-03-F07 + X-04-F06).** Replace the whole `> **Leads to:**` line with:

```text
> **Leads to:** [15. Standalone and NgModules](15-standalone-and-ngmodules.md), [17. Signals](17-signals.md), [24. Routing](24-routing.md), [25. Forms](25-forms-reactive-and-template-driven.md), [27. HTTP client](27-http-client.md), [29. Testing Angular](29-testing-angular.md), [37. Elements, PWA, errors and the ecosystem](37-elements-pwa-errors-ecosystem.md)
```

**C2 · 17:5 (FIX-X-07; X-02-F05 + X-03-F08 + X-04-F07).** Replace the whole `> **Leads to:**` line with:

```text
> **Leads to:** [14. Directives and pipes](14-directives-and-pipes.md), [18. Control flow and defer](18-control-flow-and-defer.md), [19. Component communication](19-component-communication-and-projection.md), [20. Lifecycle and render hooks](20-lifecycle-and-render-hooks.md), [21. Change detection](21-change-detection.md), [23. RxJS in depth](23-rxjs-in-depth.md), [26. Signal forms](26-signal-forms.md), [27. HTTP client](27-http-client.md), [28. State management](28-state-management.md), [40. Framework comparisons](40-framework-comparisons.md)
```

**C3 · 04:379 (FIX-X-03; X-01-F04 (2), adjusted).** Old → new:

```text
[Changed in ES2019: the normative PR "Reduce the number of ticks in async/await", merged into ECMA-262 in February 2019]
[Changed in ES2019: fewer ticks for await] (the normative PR "Reduce the number of ticks in async/await", merged into ECMA-262 in February 2019)
```

**C4 · STYLE-GUIDE.md §3.2 (FIX-X-19).** Insert this paragraph after the `[Baseline: limited availability, per MDN]` bullet and before the paragraph that starts `Markers are inline text in square brackets`, with the same three-space indent:

```text
   Accepted variants of the version part, in any marker above: a language or runtime release instead of an Angular version (`ES2022`, `TypeScript 5.4`, `Node 22.12`; an ECMA-402 addition appends `, ECMA-402` and may name its API, as in `[Added in ES2023, ECMA-402 Intl.NumberFormat v3]`); a library name before the version for a library other than Angular (`NgRx v21.0`, `TanStack Query v5.12.1`); and a patch part (`v22.0.4`) when the change shipped in a patch release, so the minor alone would date it to a release that did not have it. A module whose markers give another library's versions without a name (RxJS in modules 22 and 23) says so once in its introduction.
```

**C5 · `labs/tools/consistency-scan.mjs` (FIX-X-19).** Replace the `V` constant and the `CANONICAL` list (lines 13–24 as of this task) with:

```text
const V = String.raw`(?:(?:(?:NgRx|TanStack Query) )?v\d+(?:\.\d+){0,2}|ES\d{4}|TypeScript \d+\.\d+|Node \d+(?:\.\d+)?)`;
const CANONICAL = [
  `Developer preview since ${V}`,
  `Experimental since ${V}`,
  `Deprecated since ${V} — use .+`,
  `Removed in ${V}`,
  `Changed in ${V}: .+`,
  `Stable since ${V}`,
  String.raw`Added in (?:(?:(?:NgRx|TanStack Query) )?v\d+\.\d+(?:\.\d+)?|ES\d{4}|TypeScript \d+\.\d+|Node \d+(?:\.\d+)?)(?:, ECMA-402(?: .+)?)?`,
  String.raw`Baseline \d{4}: (?:newly|widely) available, per MDN`,
  'Baseline: limited availability, per MDN',
].map((p) => new RegExp(`^${p}$`));
```

In `labs/tools/consistency-scan.test.mjs`, add one test, `the J4 variant forms are accepted`, asserting `isCanonical` for `Added in ES2022`, `Added in ES2023, ECMA-402 Intl.NumberFormat v3`, `Added in TypeScript 5.4`, `Changed in TypeScript 6.0: strict by default`, `Changed in Node 22.12: no flag needed`, `Stable since Node 24.12`, `Added in NgRx v19.1`, `Experimental since TanStack Query v5.12.1`, `Added in v22.0.4`, `Deprecated since v7.5.5 — use retry with delay`, and asserting `!isCanonical` for `Changed in ES2023`, `Deprecated since v22.2`, `Deprecated since v7.0 — no replacement`, `Added in Angular 14` and `Stable since Node.js v24.12.0`.

## Checks used by the FIX-X blocks

The backtick-marker count (a backtick directly before a marker keyword), run from the guide root on one module or on `modules/*.md`:

```text
grep -cE '`\[(Developer preview|Experimental|Deprecated|Removed|Changed|Stable|Added|Baseline)' modules/NN-*.md
grep -ohE '`\[(Developer preview|Experimental|Deprecated|Removed|Changed|Stable|Added|Baseline)' modules/*.md | wc -l
```

Before (lines per module): 08 4, 13 1, 14 1, 17 8, 22 1, 23 2, 28 8, 29 1, 32 8, 33 2; guide-wide occurrences 42. After FIX-X-01…18: 13 1 (the 13:1016 mention), every other module 0; guide-wide 1.

The scan's section 1 item count:

```text
node labs/tools/consistency-scan.mjs . | sed -n '/^## 1/,/^## 2/p' | grep -c '^  - '
```

Before: 132. After FIX-X-01…18: 109 (they make 23 items canonical: 07 1, 08 2, 12 1, 13 10, 14 3, 22 3, 23 1, 27 2; the J4 variants, including the rewritten ones in 04, 06, 14:806, 28 and 36, still count). After FIX-X-19: 7.

## For Jorge

- **J1 (prose cap).** Applied default C. FIX-X-01 brings 09 to 9,999 (1-word margin; X-05-F01 is word-neutral on purpose). FIX-X-02 and FIX-X-03 add words to 01 (+2), 03 (+12) and 04 (about +11), all over the cap and covered by C's exceptions (HOUSE-44). If you rule A or B instead, those three Leads to additions still stand; only the exception list changes. If you prefer full labels in 09's Leads to (X-05 For Jorge 1), that costs +4 words and needs a cut: the candidate in X-01 For Jorge 1 would remove the defining first use of **origin** (09:317), so it is not recommended.
- **J4 (marker variants).** Applied the default in FIX-X-19, with the scope extended to the shapes the chunk reviewers listed (decision 7). If you rule J4 the other way before FIX-X-19 runs, cancel it: about 104 markers (44 `Added in ESN`, 2 with ECMA-402, 2 `Changed in ES`, 30 TypeScript, 5 Node, 11 NgRx, 1 TanStack, 9 patch-level) would need a rewrite task, and the patch-level ones cannot be stated truthfully in `vX.Y`.
- **Left non-canonical after FIX-X-19 (7 items, need a ruling):** bare `Changed` markers 05:370 `[Changed in ES2023]`, 06:210 `[Changed in TypeScript 3.9]`, 07:46 `[Changed in TypeScript 5.3]` (judged acceptable by X-01); deprecations without a replacement 17:278 `— remove it` (X-02 For Jorge 2), 22:217 `— no replacement` and 29:222 bare `[Deprecated since v22.2]` (X-03 For Jorge 1); and 13:1016 `[Deprecated]`, a mention in a code span that the scan reads as a marker. Either amend §3.2 for these too, or rule rewrites.
- **Marker shape only (X-02 For Jorge 3):** `v19` vs `v19.0`, and backticks around the replacement, both accepted by the scan. No FIX-X; say if you want one rule.
- **X-01-F08 carry-over:** FIX-X-05 restores the hedge in Q11.02, but the EN 301 549 V4.1.1 Official Journal citation is still not found; the STATE note stays open.
- **J9 items reported by the chunks (not FIX-X):** VERSIONS rows (`@angular/aria` 22.2.1; `@testing-library/dom`, `@axe-core/playwright`, MSW, Pact; five more `@ngrx/*`; `nx` 23.3.0 and `@angular-eslint` 22.6.0; Storybook 10.6.2; Prettier, Express, Lighthouse, web-vitals; the Spring and client libraries of 41–47); upstream reports (the v22.2.1 arrow-function docs row, 33's `data:`/`vbscript:` CHANGELOG claim, the Security docs' SPA advice); `hybrid app`'s two senses in one glossary entry (J2); 44:1475 "(default `NONE`)" without the cloud-platform qualifier; SYLLABUS §1's prerequisite column; dropping "(planned)" in 47 once MOCK-INTERVIEWS and CHEATSHEET exist; the process note that link-only FIX checks should include module-stats (X-01 For Jorge 5).
