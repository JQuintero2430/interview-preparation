# REVIEW-X-03: cross-module consistency, chunk 3 (modules 22–30)

- **Reviewer:** a fresh reviewer subagent (claude-opus-5-5) of session S20261024-0926-claudecode. It wrote no FIX task for modules 22–30 in this session and continues no writer's conversation, so it is eligible (FINISH.md §4.1, RUN §4). It ran only read-only commands. Fixes, FIX-X rows and bookkeeping belong to REVIEW-X-06 and main.
- **Date:** 2026-10-24.
- **Summary:** REVIEW-X-SCAN.md has 77 `X-03` items. **26 are covered by 9 findings** (F03–F11), and **51 are judged acceptable** (26 + 51 = 77). Two more findings come from the Summaries and the marker walk, which makes **11 findings: 2 Medium, 9 Low**. No High finding. There is no duplicate question in this chunk: scan §3 has no `X-03` item. One harvested glossary pair cannot both be true (F11). One Summary contradicts the topic's owner, and it contradicts its own section too (F01). Every Applies to line matches VERSIONS.md or the installed labs. Three of them name packages that have no VERSIONS row (J9, For Jorge).
- **Line numbers** are as of this review. Every fix quotes its old text, and each quoted old text occurs exactly once in its file (`grep -cF`, run over all 32 old texts: each returned 1).

## Runs (the reviewer, Node 24, 2026-10-24)

Verified by running:
- `awk` over REVIEW-X-SCAN.md: `X-03` items per section are 22 / 4 / 0 / 29 / 22, a total of 77 (`grep -c 'X-03'` = 77). §5 splits into 13 header lines and 9 Applies to lines.
- Installed versions (`node -p require(...).version`): `labs/angular` has all eight `@ngrx/*` packages at 22.0.1, `rxjs` 7.8.2, `vitest` 5.0.3, `jsdom` 30.1.1, `@testing-library/angular` 19.5.0 and `@testing-library/dom` 10.4.2. `labs/e2e` has `@playwright/test` 1.63.0 and `@axe-core/playwright` 4.13.0.
- `npm view @tanstack/angular-query-experimental time`: the first version is 5.12.1, published 2023-12-01 (28:65).
- The Angular CHANGELOG was downloaded to a scratch directory (raw `main`, 2026-10-24) and searched with grep, which placed each line under its version heading:
  - "allow throwing RedirectCommand to trigger redirects" is under 22.2.0, and "Guards can now return `RedirectCommand`" under 18.0.0 (24:501).
  - "`withFetch` is now deprecated, it can be safely removed." is under 22.0.0 (27:140).
  - "`HttpResponseBase.statusText` is deprecated" is under 21.0.0 (27:503).
- The `rxjs` 7.8.2 `CHANGELOG.md` (grep): `repeat` "now has configurable delay" is under 7.5.0, and `retry` "configurable delay as a named argument" is under 7.3.0 (23:334, 23:369). `Subscriber.create` and `new Subscriber` "are both deprecated" is under 7.0.0-beta.7 (22:217). `throwError` "now accepts a factory" is under 7.0.0-beta.5 (23:304).
- WebFetch of the rxjs `7.x` docs: `deprecations/subscribe-arguments.md` says "This deprecation was introduced in RxJS 6.4." (22:178), and `deprecations/array-argument.md` says "introduced in RxJS 6.5." (22:714).
- `grep -cF` for the 32 old texts below: each returned 1. `grep -noE` found the backticked markers in 22–30, 15 in all (F05, F06). It also found the markers in other modules that use RxJS-style versions, such as 25:35 `[Deprecated since v6.0 — use the form model]`, which is an Angular version (F02).

Read, not run (typings and sources in `labs/*/node_modules`):
- `@angular/common/types/http.d.ts:2217`: the `withFetch` `@deprecated` text. `_module-chunk.d.ts:699`: the `statusText` `@deprecated` text. `http-testing.d.ts:37`: `get cancelled()` is declared on `TestRequest`, not on `HttpTestingController` (F11).
- `@angular/build` 22.2.1, `unit-test/schema.json:84`: `"x-deprecated": "No longer needed with Vitest 5."` on `splitting` (29:222).
- `@angular/core/types/rxjs-interop.d.ts`: `takeUntilDestroyed` `@publicApi 19.0`, `toObservable`/`toSignal` `@publicApi 20.0`, `pendingUntilEvent` `@developerPreview 20.0`, `rxResource` `@publicApi 22.0`. These agree with 17, 21, 22:83 and 23:526–649.
- `@angular/core/fesm2022/_resource-chunk.mjs:309–314`: a new request starts `loading` with no stream, while the same request after `reload()` keeps `previous.value.stream` (F01).
- `@angular/forms/types/_structure-chunk.d.ts`: 115 `@publicApi 22.0` tags on Signal Forms (glossary `signal forms`).
- `@angular/platform-browser/fesm2022/testing.mjs:97`: `ɵprovideFakePlatformNavigation()` is in the testing module's providers (glossary `platformlocation`, 29's "`TestBed` provides a fake one").
- `@ngrx/operators/types/ngrx-operators.d.ts:40–72`: `TapResponseObserver` has `next`, `error`, optional `complete` and `finalize`, and there is one `tapResponse` declaration, the object form.
- `@ngrx/router-store/types/ngrx-router-store-data-persistence.d.ts:6`: "deprecated … Use core RxJS operators instead."
- `@ngrx/signals/fesm2022/ngrx-signals-rxjs-interop.mjs:61`: the warning text "Either call it within an injection context … or pass an injector explicitly via the config parameter".
- `rxjs/dist/types/internal/types.d.ts:84`: the `ObservableInput` union.
- `labs/tools/module-stats.mjs:11`: `CAPPED_PARTS` is A, B, C and E, so Part D modules (16–30) have no prose cap.

Also read: the 22–30 headers and Summaries; the passages each item points at; VERSIONS.md; SYLLABUS §1 rows 16–30; STYLE-GUIDE §3, §5.1; STATE standing notes; STATE-ARCHIVE lines 76 and 80; REVIEW-M24 line 77.

Not re-verified here: the NgRx marker versions (19.0, 19.1, 20.0, 21.0, 21.1, 22.0, 12.0), beyond the shapes and the typings above. They rest on module 28's reading of the typings and CHANGELOG. This review changes only their form.

## Findings

#### X-03-F01 · Medium · contradiction (Summary) · 23 says `rxResource` "has no value while it reloads"

- **Location:**
  - `modules/23-rxjs-in-depth.md:985` (Summary): "and `rxResource` cancels the previous stream and has no value while it reloads".
  - `23:708` (misconception list): "- *"`rxResource` keeps the old value while reloading."* `value()` was `undefined` while `loading` after a params change".
- **Against:**
  - The owner, `modules/17-signals.md:445`: "`reloading` keeps the old value visible, while `loading` (new params) does not." Also 17:456 and 17:534 ("`reload()` keeps the value (status `reloading`)").
  - `modules/27-http-client.md:1149` (Summary): "a params change resets `value()` and only `reload()` keeps it".
- **Evidence:** 23's own test (23:647, `Section 7: rxResource unsubscribes the previous stream when params change`) observed `value()` `undefined` in `loading` after a **params change**. It did not test `reload()`. The source keeps the stream when the request is unchanged, which is the reload case (`_resource-chunk.mjs:312`, `if (previous.value.extRequest.request === request) stream = previous.value.stream`, read). It also derives the `reloading` status from `extRequest.reload` (line 504). `rxResource` is built on `resource`. As written, the Summary says the opposite of 17 and 27. Line 708 also files a true statement (the value survives a reload) under misconceptions.
- **Right side:** 17 and 27. In 23, "reloads" has to become "params change".
- **Fix text:** in 23, two swaps:
  1. `` and `rxResource` cancels the previous stream and has no value while it reloads `` → `` and `rxResource` cancels the previous stream and has no value while it loads new params (`reload()` keeps the old one, [17 §6](17-signals.md#6-resources-async-data-as-signals)) ``
  2. `` - *"`rxResource` keeps the old value while reloading."* `` → `` - *"`rxResource` keeps the old value when its params change."* ``

  Net about +12 words. Part D has no prose cap.

#### X-03-F02 · Medium · marker · RxJS versions use the bare `vX.Y` form that means Angular everywhere else

- **Location:** every RxJS marker in 22 and 23, about 40 of them, for example:
  - `modules/22-rxjs-foundations.md:463` "`merge` [Deprecated since v6.0 — use mergeWith]";
  - `23:334` "The `delay` option [Added in v7.3]".
  The same modules also carry Angular markers in the same form, such as 22:83 "`pendingUntilEvent` [Developer preview since v20.0]" and 23:526 "`takeUntilDestroyed` [Stable since v19.0]". Meanwhile `modules/25-forms-reactive-and-template-driven.md:35` "[Deprecated since v6.0 — use the form model]" is **Angular** 6.0.
- **Evidence:** STYLE-GUIDE §3.2 says "Use the version from the `@publicApi vX` tag or the changelog", which are Angular's. Module 28 prefixes its library (`NgRx v22.0`, J4), and 22/23 do not. Neither module says which library its `vX` refers to: 22:28 and 23:29 say only where markers come from. So a reader sees `[Deprecated since v6.0 …]` for `merge` (RxJS 6.0) and for `ngModel` with reactive forms (Angular 6.0), and nothing tells the two apart. The scan's regexes accept the RxJS markers as canonical, so only a review can catch this. The versions themselves are RxJS versions and are right where checked (Runs).
- **Right side:** the markers stay. Each module states once which library its versions refer to. The alternative is an `RxJS vX` prefix like NgRx's (For Jorge 2).
- **Fix text:**
  1. 22: `` and documentation quotes name their file on the `7.x` branch. `` → `` and documentation quotes name their file on the `7.x` branch. A marker on an `rxjs` API gives the RxJS version (`v6.4` is RxJS 6.4); a marker on an Angular API gives the Angular version. ``
  2. 23: `Status markers come from typings tags and the RxJS CHANGELOG.` → `` Status markers come from typings tags and the RxJS CHANGELOG; a marker on an `rxjs` API gives the RxJS version (`v7.3` is RxJS 7.3), one on an Angular API the Angular version. ``

  +27 and +24 words.

#### X-03-F03 · Low · marker · four RxJS deprecation markers end in "pass …" or "keep …" instead of "use …"

- **Location:**
  - `modules/22-rxjs-foundations.md:178`: "positional callbacks [Deprecated since v6.4 — pass an observer]";
  - `22:181`: "`config.useDeprecatedSynchronousErrorHandling` [Deprecated since v6.0 — keep the default]";
  - `22:714`: "`combineLatest(a, b)` and `forkJoin(a, b)` [Deprecated since v6.5 — pass an array or an object]";
  - `modules/23-rxjs-in-depth.md:304`: "`throwError(new Error('x'))` [Deprecated since v7.0 — pass a factory]".
- **Evidence:** the STYLE-GUIDE §3.2 form is `[Deprecated since vX — use Y]`, and the scan flags these four (scan §1). The versions are right: rxjs docs "introduced in RxJS 6.4" and "6.5" (WebFetch), and the CHANGELOG 7.0.0-beta.5 entry for `throwError` (grep). The 6.0 for the flag is the module's reading, not re-checked. Each tail names a replacement, so "use" fits with no loss of meaning.
- **Right side:** the §3.2 form.
- **Fix text:**
  1. 22: `[Deprecated since v6.4 — pass an observer]` → `[Deprecated since v6.4 — use an observer]`
  2. 22: `[Deprecated since v6.0 — keep the default]` → `[Deprecated since v6.0 — use the default]`
  3. 22: `[Deprecated since v6.5 — pass an array or an object]` → `[Deprecated since v6.5 — use an array or an object]`
  4. 23: `[Deprecated since v7.0 — pass a factory]` → `[Deprecated since v7.0 — use a factory]`

  ±0 words.

#### X-03-F04 · Low · marker · two HttpClient deprecation markers have no "use" form

- **Location:**
  - `modules/27-http-client.md:140`: "`withFetch()` [Deprecated since v22.0 — remove it, fetch is the default] asks for the default";
  - `27:503`: "`err.statusText` [Deprecated since v21.0 — read status]".
- **Evidence:** the scan flags both (§1). The versions are right: in the CHANGELOG, "`withFetch` is now deprecated" is under 22.0.0 and "`HttpResponseBase.statusText` is deprecated" under 21.0.0 (grep, run). The typings say "`withFetch` is not required anymore. `FetchBackend` is the default `HttpBackend`." In the same module, 27:171 already writes a canonical tail with a bare call, "use provideHttpClient(withInterceptorsFromDi())".
- **Right side:** the §3.2 form.
- **Fix text:**
  1. 27: `[Deprecated since v22.0 — remove it, fetch is the default]` → `[Deprecated since v22.0 — use provideHttpClient() without it]`
  2. 27: `[Deprecated since v21.0 — read status]` → `[Deprecated since v21.0 — use status]`

  −2 words.

#### X-03-F05 · Low · marker · four module-28 markers carry prose or lack a replacement

- **Location:** `modules/28-state-management.md`:
  - 65: "`@tanstack/angular-query-experimental` [Experimental since 5.12.1 — the first release of @tanstack/angular-query-experimental; the docs call it experimental]";
  - 648: "The `tapResponse` callback signature `` `[Removed in NgRx v22.0 — pass { next, error, complete }]` `` is gone;";
  - 773: "helpers `` `[Deprecated since NgRx v22.0]` `` carry a `@deprecated` tag: use core RxJS operators.";
  - 972: "`` `[Deprecated since NgRx v21.1 — call it in an injection context or pass an injector]` ``".
- **Evidence:** the scan flags all four (§1).
  - 65 puts a sentence of provenance inside the brackets, with no library name on the version. `npm view` gives 5.12.1 as the first version (run), and 28:31 records C5, "TanStack marker judgment", as open.
  - 648: §3.2 `Removed in vX` takes no tail. The typings have only the object form, `TapResponseObserver` with `next`, `error`, optional `complete` and `finalize` (read). So the "{ next, error, complete }" tail also omits `finalize` and hides that `complete` is optional.
  - 773 has its replacement outside the brackets, and the typings say "Use core RxJS operators instead" (read).
  - 972: the source's warning says "call it within an injection context … or pass an injector explicitly via the config parameter" (read).
  - Three of the four are also inside code spans, which F06 addresses for the others.
- **Right side:** the §3.2 forms, with the library named as in J4's `NgRx vX`, and plain text.
- **Fix text:** 28, four swaps:
  1. `[Experimental since 5.12.1 — the first release of @tanstack/angular-query-experimental; the docs call it experimental]` → `[Experimental since TanStack Query v5.12.1] (its first release; the docs call it experimental)`
  2. `` `[Removed in NgRx v22.0 — pass { next, error, complete }]` is gone; `` → `` [Removed in NgRx v22.0] is gone, and the object form takes `next`, `error` and optional `complete` and `finalize`; ``
  3. `` `[Deprecated since NgRx v22.0]` carry a `@deprecated` tag: use core RxJS operators. `` → `` [Deprecated since NgRx v22.0 — use core RxJS operators] carry a `@deprecated` tag. ``
  4. `` `[Deprecated since NgRx v21.1 — call it in an injection context or pass an injector]` `` → `[Deprecated since NgRx v21.1 — use an injection context or the injector option]`

  In 1 the old text has no backticks. In 2–4 the old text includes the enclosing backticks of the code span, and the new text has none. Net about −2 words.

#### X-03-F06 · Low · marker · twelve more markers in 22, 23, 28 and 29 are written as code spans

- **Location:**
  - `modules/22-rxjs-foundations.md:460`: "are `` `[Added in v7.2]` `` (CHANGELOG 7.2.0)";
  - `modules/23-rxjs-in-depth.md:889`: "take a scheduler argument `` `[Deprecated since v6.5 — use scheduled]` ``;";
  - `23:943`: "are `` `[Added in v7.0]` `` (CHANGELOG 7.0.0-beta.4";
  - `modules/28-state-management.md`, eight markers:
    - 557 "A selector with props `` `[Deprecated since NgRx v12.0 — use a selector factory]` ``";
    - 831 "`withProps` `` `[Added in NgRx v19.0]` ``";
    - 953 "**`signalMethod`** `` `[Added in NgRx v19.0]` ``";
    - 955 "The **Events plugin** `` `[Stable since NgRx v21.0]` ``" and "**`withEventHandlers`** `` `[Changed in NgRx v21.0: renamed from withEffects]` ``";
    - 980 "`withLinkedState` `` `[Added in NgRx v20.0]` ``", "`withFeature` `` `[Added in NgRx v19.1]` ``" and "`@ngrx/signals/resource` `` `[Experimental since NgRx v22.0]` ``";
  - `modules/29-testing-angular.md:282`: "builders are `` `[Removed in v22.0]` ``".
- **Evidence:** STYLE-GUIDE §3.2 says "Markers are inline text in square brackets". X-01-F03 ruled the same way for module 08, and X-01's For Jorge item 3 leaves 22, 23, 28 and 29 to this chunk. The code spans also break the scan's API attribution: scan §2's ` ` group lumps 28:831 and 28:980 with unrelated markers. The marker texts are right as far as checked (Runs). The NgRx prefix is J4's, so it stays.
- **Right side:** plain text.
- **Fix text:** in each swap, the old text has the backticks shown and the new text drops only the two backticks around the marker:
  1. 22: `` are `[Added in v7.2]` (CHANGELOG 7.2.0) `` → `are [Added in v7.2] (CHANGELOG 7.2.0)`
  2. 23: `` take a scheduler argument `[Deprecated since v6.5 — use scheduled]`; `` → `take a scheduler argument [Deprecated since v6.5 — use scheduled];`
  3. 23: `` are `[Added in v7.0]` (CHANGELOG 7.0.0-beta.4 `` → `are [Added in v7.0] (CHANGELOG 7.0.0-beta.4`
  4. 28: `` A selector with props `[Deprecated since NgRx v12.0 — use a selector factory]` `` → `A selector with props [Deprecated since NgRx v12.0 — use a selector factory]`
  5. 28: `` `withProps` `[Added in NgRx v19.0]` `` → `` `withProps` [Added in NgRx v19.0] ``
  6. 28: `` **`signalMethod`** `[Added in NgRx v19.0]` `` → `` **`signalMethod`** [Added in NgRx v19.0] ``
  7. 28: `` The **Events plugin** `[Stable since NgRx v21.0]` `` → `The **Events plugin** [Stable since NgRx v21.0]`
  8. 28: `` **`withEventHandlers`** `[Changed in NgRx v21.0: renamed from withEffects]` `` → `` **`withEventHandlers`** [Changed in NgRx v21.0: renamed from withEffects] ``
  9. 28: `` `withLinkedState` `[Added in NgRx v20.0]` `` → `` `withLinkedState` [Added in NgRx v20.0] ``
  10. 28: `` `withFeature` `[Added in NgRx v19.1]` `` → `` `withFeature` [Added in NgRx v19.1] ``
  11. 28: `` `@ngrx/signals/resource` `[Experimental since NgRx v22.0]` `` → `` `@ngrx/signals/resource` [Experimental since NgRx v22.0] ``
  12. 29: `` builders are `[Removed in v22.0]` `` → `builders are [Removed in v22.0]`

  ±0 words.

#### X-03-F07 · Low · header · 16's Leads to omits 25 and 29, which list 16 as a prerequisite

- **Location:** `modules/16-dependency-injection.md:5`: "> **Leads to:** … [24. Routing](../../modules/24-routing.md), [27. HTTP client](../../modules/27-http-client.md)". It is checked against:
  - `25:4` "[16. Multi providers](../../modules/16-dependency-injection.md#7-injectiontoken-multi-providers-environment-providers-and-initializers) (`NG_VALUE_ACCESSOR`)";
  - `29:4` "[16. DI patterns and testing](../../modules/16-dependency-injection.md#9-di-patterns-testing-and-the-spring-container)".
- **Evidence:** scan §5 reports "25 lists 16 as prerequisite, but 16 Leads to omits 25" and "29 lists 16 …". Both prerequisites are section links to the part they depend on, so they are right. The return edge is missing. This is the same rule as X-01-F05.
- **Right side:** 25 and 29. 16 adds the return links.
- **Fix text:** 16, on the `> **Leads to:**` line: `[24. Routing](24-routing.md), [27. HTTP client](27-http-client.md)` → `[24. Routing](24-routing.md), [25. Forms](25-forms-reactive-and-template-driven.md), [27. HTTP client](27-http-client.md), [29. Testing Angular](29-testing-angular.md)`. +5 words.

#### X-03-F08 · Low · header · 17's Leads to omits 27, which lists 17 as a prerequisite

- **Location:** `modules/17-signals.md:5`: "> **Leads to:** … [26. Signal forms](../../modules/26-signal-forms.md), [28. State management](../../modules/28-state-management.md)"; checked against `27:4`: "[17. Resources](../../modules/17-signals.md#6-resources-async-data-as-signals)". `httpResource` builds on resources.
- **Evidence:** scan §5 reports "27 lists 17 as prerequisite, but 17 Leads to omits 27".
- **Right side:** 27. 17 adds the return link.
- **Fix text:** 17, on the `> **Leads to:**` line: `[26. Signal forms](26-signal-forms.md), [28. State management](28-state-management.md)` → `[26. Signal forms](26-signal-forms.md), [27. HTTP client](27-http-client.md), [28. State management](28-state-management.md)`. +3 words.
- **Note for REVIEW-X-06:** REVIEW-X-02 may also edit this line, to add 14 and 20 (scan §5, `X-02`). That edit's span, around `[19. …], [21. …]` and the start of the list, does not overlap this one.

#### X-03-F09 · Low · header · 19's Leads to omits 24, 28 and 29, which list 19 as a prerequisite

- **Location:** `modules/19-component-communication-and-projection.md:5`: "> **Leads to:** … [21. Change detection](../../modules/21-change-detection.md), [25. Forms](../../modules/25-forms-reactive-and-template-driven.md), [36. Material and CDK](../../modules/36-material-and-cdk.md)". It is checked against:
  - `24:4` "`[19. Inputs and outputs](…#1-inputs-outputs-and-two-way-binding-the-parent-and-child-contract)` (signal inputs, which component input binding sets)";
  - `28:4` "`[19. Sharing state through services](…#2-sharing-state-beyond-the-tree-services-with-signals-and-di-scoped-state)`";
  - `29:4` "`[19. Inputs and outputs](…#1-…)`".
- **Evidence:** scan §5 reports "24 lists 19 …", "28 lists 19 …" and "29 lists 19 …". All three are section links to what they build on.
- **Right side:** 24, 28 and 29. 19 adds the return links.
- **Fix text:** 19, on the `> **Leads to:**` line: `[21. Change detection](21-change-detection.md), [25. Forms](25-forms-reactive-and-template-driven.md)` → `[21. Change detection](21-change-detection.md), [24. Routing](24-routing.md), [25. Forms](25-forms-reactive-and-template-driven.md), [28. State management](28-state-management.md), [29. Testing Angular](29-testing-angular.md)`. +7 words.

#### X-03-F10 · Low · header · 22's Leads to omits 28, which lists 22 as a prerequisite

- **Location:** `modules/22-rxjs-foundations.md:5`: "> **Leads to:** [23. RxJS in depth](../../modules/23-rxjs-in-depth.md), … [27. HttpClient](../../modules/27-http-client.md), [29. Testing Angular](../../modules/29-testing-angular.md)"; checked against `28:4`: "[22. Subjects](../../modules/22-rxjs-foundations.md#4-subjects-subject-behaviorsubject-replaysubject-and-asyncsubject)". 28 §3 is the `BehaviorSubject` store.
- **Evidence:** scan §5 reports "28 lists 22 as prerequisite, but 22 Leads to omits 28".
- **Right side:** 28. 22 adds the return link.
- **Fix text:** 22, on the `> **Leads to:**` line: `[27. HttpClient](27-http-client.md), [29. Testing Angular](29-testing-angular.md)` → `[27. HttpClient](27-http-client.md), [28. State management](28-state-management.md), [29. Testing Angular](29-testing-angular.md)`. +3 words.

#### X-03-F11 · Low · contradiction (glossary) · 23 gives `HttpTestingController` a `cancelled` flag that belongs to `TestRequest`

- **Location:**
  - The glossary harvest, `_meta/GLOSSARY-TERMS.md:1045` (## Module 23): "**`HttpTestingController`**: Angular's test double for the HTTP backend; its `cancelled` flag reports that the test request's subscription was torn down".
  - Its source, `modules/23-rxjs-in-depth.md:182`: "uses `HttpTestingController`, Angular's test double for the HTTP backend (`[27](…)`)".
  - The owner, `_meta/GLOSSARY-TERMS.md:1354` (27 §11): "the test-side handle on the test backend, used to find, answer and verify requests", and 1355, "**`TestRequest`**: one open request in the test backend".
- **Evidence:** `@angular/common/types/http-testing.d.ts:37` declares `get cancelled(): boolean` on `class TestRequest` (line 31), not on `abstract class HttpTestingController` (line 85) (read). 23's own body text gets it right: "That flag is the testing backend's report", read via `controller.expectOne(...)`. Only the definition says "its". The harvest builds GLOSSARY.md (RUN §13), and with one entry per term (J2) the two definitions have to agree. The "test double for the HTTP backend" wording also says something different from 27: the controller is the handle, and the in-memory backend is the double.
- **Right side:** 27 and the typings.
- **Fix text:**
  1. `_meta/GLOSSARY-TERMS.md`: `` Angular's test double for the HTTP backend; its `cancelled` flag reports that the test request's subscription was torn down `` → `` the test-side handle on the in-memory test backend; the `cancelled` flag of each `TestRequest` it returns reports that the request's subscription was torn down ``
  2. 23: `` uses `HttpTestingController`, Angular's test double for the HTTP backend ( `` → `` uses `HttpTestingController`, the test-side handle on Angular's in-memory HTTP test backend ( ``

  +3 words in 23.

## Carry-over notes (STATE standing notes, STATE-ARCHIVE) about 22–30

- **"§6's problem paragraph points to Q22.24-Q22.26 for topics whose titles sit at other numbers"** (STATE "Stale statements"; ARCHIVE 80): retired. 22:512 now points scan → Q22.24, `first()` → Q22.25, `distinctUntilChanged` → Q22.26, and "previous and current value" → Q22.23. All four match their headings (1735–1843), and Q22.23 covers `pairwise` (grep, run).
- **"Q27.35 has no anchor in 27"** (STATE, SEC-M32-08 notes): retired. No module links `q27-35` any more, and 27 has no `### Q27.35` (grep, run).
- **RxJS "removed in v8" notes are stale, since v8 never shipped** (ARCHIVE 76 (1)): retired. Every "will be removed in v8" in 22–30 is attributed to "the 7.8.2 typings" (23:116, 23:304, 23:889; grep, run). None is the guide's own forecast.
- **`withFetch` and `statusText` deprecation versions "rest on the CHANGELOG"** (STATE, M27): confirmed right, under 22.0.0 and 21.0.0 (grep, run). F04 changes only their tails.
- **TanStack marker judgment (M28 C5)** (STATE): decided in F05(1).
- **WICG Observable: chromestatus "In development" vs webstatus.dev 135 (22)** (STATE "Docs vs run"; ARCHIVE 76 (5)): not a FIX item. 22:88 and 22:139 state the dated, documented status (2026-10-09), so it stays a possible upstream note (J9).
- **`takeUntilDestroyed` ownership, 20 vs 23** (STATE "Other open rulings"; ARCHIVE 76 (4)): Jorge's. For the record, the markers agree: 23:526 `[Stable since v19.0]` and 22:84 `@publicApi 19.0` match the typings (read).
- **SYLLABUS 25 "`min`/`max` numeric only [Changed in v22]"** (STATE, M25): a SYLLABUS edit, Jorge's. The modules are consistent: 25's Summary leaves the numeric-only rule to 26, and 26 §4 teaches it.
- **VERSIONS rows (22, 24–28), anchor candidates into 22–29, M26 `[Deprecated since v22.0 — use { when }]` by `npm pack`, REVIEW-M29/M30 For Jorge items:** J9, unchanged.

## Judged acceptable

Scan items, 51 in all.

- **§1 markers, 4 of 22:**
  - `22:217` `Subscriber.create` [Deprecated since v7.0 — no replacement]. The typings say "There is no replacement for this method" (`Subscriber.d.ts:22`, read), and the CHANGELOG 7.0.0-beta.7 has it (grep). §3.2 has no form for a deprecation without a replacement (J4, For Jorge 1).
  - `23:398` `retryWhen` and `repeatWhen` [Deprecated since v7.5.5 — use retry with delay / repeat with delay], two items. The tails are canonical, and the patch version is deliberate: 23:398 says the tag first appears in the 7.5.5 typings, not 7.5.4's (`npm pack`). Writing `v7.5` would be false (J4: patch versions; X-02 and X-04 have the same shape at 14:157 and 36:625).
  - `29:222` `splitting` [Deprecated since v22.2] ("No longer needed with Vitest 5."). The schema has `x-deprecated` with that text and no replacement (read). Same J4 question as 22:217.
  - The other 18 are covered by F03 (4), F04 (2), F05 (4) and F06 (8).
- **§2, all 4 groups:**
  - ` and `: a scanner artifact. It lumps 22:306, 25:792, 27:171, 27:503, 34:121 and 37:401, which are unrelated APIs.
  - `merge`: 22:463 is the `rxjs/operators` instance operator (→ `mergeWith`), and 22:716 is the `scheduler` argument of the creation function (→ `scheduled`). These are two signatures, and both markers are right. 23:889's "use scheduled" agrees.
  - `delay`: 23:334 is `retry`'s `delay` option, 7.3, and 23:369 is `repeat`'s, 7.5. Both are confirmed in the rxjs CHANGELOG (grep).
  - `RedirectCommand`: returning it is 18.0 and throwing it is 22.2. Both are confirmed in the Angular CHANGELOG (grep).
- **§4, 28 of 29 terms:**
  - Homonyms, each true in its own field:
    - `flush`: 23 TestScheduler and 27 `TestRequest.flush`;
    - `location`: 24 Angular `Location` and 44 the Nginx block;
    - `notification`: 22 RxJS and 40 reactivity;
    - `state`: 28 app state and 42 the OAuth parameter.
  - Compatible restatements:
    - `abortcontroller`, `accessible name`, `base href`, `error mapping layer` (37 defers to 27), `fake timers`, `harness loader`, `interceptor`;
    - `jitter` (23/27/43);
    - `mockstore`;
    - `observableinput` (22's parenthetical is an example list under "anything `from` accepts", and 23 gives the full `types.d.ts:84` union, read);
    - `platformlocation` (29's "`TestBed` provides a fake one" is confirmed in `platform-browser/testing.mjs:97`, read);
    - `polling`, `port`, `reducer`;
    - `retryable error` (23's principle, 27's policy);
    - `scheduler` (22's `setInterval` matches 23 §9);
    - `signal forms` (26's "stable since 22.0" matches the `@publicApi 22.0` tags and VERSIONS);
    - `source of truth`, `spa fallback`, `stale-while-revalidate`, `test runner`, `typeahead`, `urltree`, `visual regression test`.
  - `httptestingcontroller` is F11.
- **§5, 15 of 22:**
  - Six "Prerequisites extra against SYLLABUS" lines: 24 (15); 25 (16, 07, 11); 27 (22, 17); 28 (19, 22); 29 (16, 19); 30 (11). Each is a section-level link to an earlier module the section depends on, and SYLLABUS §1 lists only the module-level minimum. The return edges that exist (07→25, 11→25, 11→30, 15→24, 22→27) are in place. The missing ones are F07–F10.
  - Nine Applies to lines, 22–30, all checked against VERSIONS.md and the installed labs (run):
    - Angular 22.2.1, `rxjs` 7.8.2, TypeScript 6.0, Node 24, Vitest 5.0.3, jsdom 30.1.1, Playwright 1.63.0, Cypress 16.1.1, `@testing-library/angular` 19.5.0, Karma 6.4.4 with Jasmine 7.0.2, Jest 30.5.2 with `jest-preset-angular` 17.0.1: all match.
    - 28's "NgRx 22.0.1" for eight packages: all eight are installed at 22.0.1, while VERSIONS names three.
    - `@testing-library/dom` 10.4.2 and `@axe-core/playwright` 4.13.0 are installed but have no VERSIONS row. MSW 3.0.3 and Pact 17.1.4 are documented only and have no row either (J9, For Jorge 4).
  - The other 7 are covered by F07 (2), F08 (1), F09 (3) and F10 (1).

Checked and acceptable, though not scan items:
- **Summaries of 22–30 against the owners**, apart from F01:
  - 22's and 28's "`distinctUntilChanged` compares with `===`" agree.
  - 22's "`share` … resets when the last one leaves" agrees with 23 §5.
  - 24's "since v22 … `'always'`" agrees with VERSIONS.
  - 25 leaves the numeric-only `min` to 26, and 26 says "`min` and `max` take numbers or `null`".
  - 27's "params change resets `value()` and only `reload()` keeps it" agrees with 17:445.
  - 29's "`flushEffects()` is deprecated, not removed" agrees with 17:281 and 29:575, both `[Deprecated since v20.0 — use TestBed.tick()]`.
  - 23's interop markers agree with 17 and 21 and with the typings.
  - 30's "Protractor builder [Removed in v19.0]" is the only statement of it in the guide (grep).

## For Jorge

1. **J4 scope, this chunk.** If J4 makes variants canonical, three shapes from 22–30 need a decision beyond `NgRx vX`:
   - `— no replacement`, or a bare `[Deprecated since vX]` (22:217, 29:222);
   - patch versions `vX.Y.Z` where the patch is the fact (23:398 ×2, and 14:157 and 36:625 in other chunks);
   - a third-party library prefix (`TanStack Query v5.12.1`, from F05).
2. **RxJS versions (F02).** The fix adds one sentence to 22 and one to 23 and leaves about 40 markers unchanged. The alternative is J4-style `RxJS vX` prefixes, about 40 swaps in 22 and 23, a mechanical Haiku task. Either way the RxJS markers should be in J4's list, because the scan's regexes accept them as Angular forms.
3. **REVIEW-X-06 merge notes.**
   - F08 and an X-02 return-link fix both edit 17:5. Their spans are disjoint, so apply both.
   - F07 (16:5) and F09 (19:5) touch X-02 modules, but only lines that X-02's scan items do not touch.
   - F06 and F05 split module 28's backticked markers with no overlap: F05 covers 648, 773 and 972, and F06 covers the other eight.
   - F11 edits `_meta/GLOSSARY-TERMS.md` as well as 23, so the FIX-X task's file set includes it.
4. **VERSIONS rows (J9):**
   - `@testing-library/dom` 10.4.2 (29);
   - `@axe-core/playwright` 4.13.0, MSW 3.0.3 and Pact 17.1.4 (30);
   - `@ngrx/effects`, `entity`, `router-store`, `store-devtools` and `operators` 22.0.1 (28; VERSIONS names only `store`, `signals` and `component-store`).
5. **NgRx marker versions** (28, eight markers) were not re-verified here (Runs, last line). REVIEW-M28's checks stand.
