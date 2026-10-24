# REVIEW-M41: `modules/41-fullstack-api-contracts.md`

- **Reviewer:** a fresh reviewer subagent (claude-opus-5-5) of session S20261020-1532-claudecode. It wrote nothing in module 41, continues none of the PLAN, SEC, EX, QB or CLOSE-M41 conversations, and so is eligible (RUN.md §4). It ran no build and no test suite (the main session owns execution and its runs are the basis below); it read files, ran read-only scripts and fetched sources. Job-state updates and every fix belong to the main session.
- **Date:** 2026-10-20.
- **Files read:**
  - the whole module (2,023 lines; line numbers below are as of this review and will move at FIX time);
  - `_meta/modules/M41.md` (F1-F21 with F6b, C1-C20, Lab decision, Handoffs into 41, owner map, anchor candidates, breadth gate, For Jorge 1-5), QUALITY-BAR, STYLE-GUIDE §2, §3, §6 (and §7.2), RUN.md §5-§7, §10, the module-41 common rules and the REVIEW-M41 block in TASKS.md, REVIEW-M40 and FIX-M40-01..03 (the format model), every module-41 LOG line (PLAN, SEC-01..10, EX-01..03, QB-01..03, CLOSE) and their "for REVIEW-M41" notes, `SOURCES.md` `## Module 41` (105 lines);
  - every module-41 lab file: labs/ts-js `concepts/` (`order-dto.ts`, `contract-drift.ts`, `fixtures/orders-openapi.json`, `wire-codecs.ts`, three tests) and `src/outputs/41-fullstack-api-contracts/q41-19.test.ts`; labs/angular `concepts/` (`api-version.interceptor.ts`, `problem-details.ts`, `page-params.ts`, `json-pointer.ts`, `content-disposition.ts`, `chunk-plan.ts`, eight specs), `outputs/q41-11.spec.ts`, `exercise-1-problem-details/`, `exercise-2-form-errors/`, `exercise-3-paged-list/` (all files).
- **Sources re-read (2026-10-20), fetched into `/Users/jorge.quintero/.claude/jobs/4a727236/tmp/review41` and deleted:**
  - raw GitHub at release tags: `spring-security` `7.1.1` `config/.../configuration/HttpSecurityConfiguration.java` (`applyCorsIfAvailable`), `config/.../configurers/CorsConfigurer.java` (`getCorsFilter`, `getCorsConfigurationSource`, bean names), `config/.../builders/FilterOrderRegistration.java` (`final class`, order `HeaderWriterFilter`, `CorsFilter`, `CsrfFilter`, `LogoutFilter`), `docs/.../servlet/integrations/cors.adoc`; `spring-framework` `v7.0.9` `spring-web` `CorsConfiguration.java` (`validateAllowCredentials`, `checkOrigin`, `maxAge`), `DefaultCorsProcessor.java` (`public class`, the `preFlightRequest && config.getMaxAge() != null` guard), `CorsUtils.java` (`isCorsRequest`, `isPreFlightRequest`), `ProblemDetail.java` (`type` "not set", `getTitle` from the reason phrase, `instance`), `converter/json/ProblemDetailJacksonMixin.java` (`public interface`, `@since 6.0`), `MethodArgumentNotValidException.java`, `MaxUploadSizeExceededException.java`, `ContentDisposition.java` (`toString`), `accept/StandardApiVersionDeprecationHandler.java`; `spring-webmvc` `ResponseEntityExceptionHandler.java` (`handleMethodArgumentNotValid`, `handleExceptionInternal` signatures), `ApiVersionConfigurer.java` (resolver methods, `usePathSegment` overloads, `setVersionRequired`, `setDefaultVersion`); `framework-docs` `webmvc-cors.adoc`, `webmvc-versioning.adoc`, `mvc-controller/ann-requestmapping.adoc`, `mvc-controller/ann-validation.adoc`, `mvc-caching.adoc`, `mvc-ann-rest-exceptions.adoc`; `spring-boot` `v4.1.1` `JacksonAutoConfiguration.java` (`useJackson2Defaults` branch), `JacksonProperties.java`, `MultipartProperties.java`, `DataWebProperties.java`, `WebMvcProperties.java` (`Problemdetails.enabled`), `ServletWebSecurityAutoConfiguration.java` (`defaultSecurityFilterChain(HttpSecurity)`), reference `features/json.adoc`, `web/servlet.adoc`, `web/spring-security.adoc` (no CORS); `spring-data-commons` `4.1.1` `EnableSpringDataWebSupport.java`, `repositories/core-extensions-web.adoc`, `repositories/scrolling.adoc`; `jackson-databind` `jackson-databind-3.1.5` `DeserializationFeature.java`, `cfg/DateTimeFeature.java`, `ser/jdk/NumberSerializer.java`, `ser/jdk/NumberSerializers.java`; `springdoc-openapi` `v3.1.1` `SpringDocConfigProperties.java`, `pom.xml`; `swagger-core` `v2.2.55` `ModelResolver.java`, `util/ValidationAnnotationsUtils.java`;
  - Maven Central: `tools/jackson/jackson-bom/3.1.5` (`jackson.version.annotations` 2.21);
  - rfc-editor.org: RFC 9457, 9745, 6266, 9110 (§14.4); fetch.spec.whatwg.org (CORS-safelisted response-header names);
  - `npm pack` (extracted, read, deleted): `ng-openapi-gen@1.1.0` (`templates/fn.handlebars`, `apiService.handlebars`, "DO NOT EDIT" headers, `ng-openapi-gen-schema.json`, `README.md`), `@orval/angular@8.43.0` (`dist/index.mjs`: `isRetrievalVerb`, `builder`), `@orval/core@8.43.0` (`dist/index.d.mts`: `AngularOptions`, `useDatesTransform`), `orval@8.43.0` (`dist/options-*.mjs`: the `retrievalClient` default), `@openapitools/openapi-generator-cli@2.42.0` (`README.md`);
  - read-only in `labs/angular/node_modules`: `@angular/common` 22.2.1 (`fesm2022/_module-chunk.mjs` `FetchBackend.parseBody`, `doRequest`, error 2824; `types/http.d.ts` `FetchBackend` `@publicApi`), `@angular/forms` 22.2.1 `types/signals.d.ts` (`isFieldTree` `@publicApi 22.1`).
- **Basis of each finding:** a framework source or docs page at its release tag, a package source, an RFC or standard read on the date above, a committed test, or a read-only script. **Not re-read** (their basis is the SEC/EX/QB LOG lines and SOURCES.md): Security `architecture.adoc` and `CorsFilter.java`, `api-version.adoc`, `multipart.adoc`, RFC 6901, RFC 7386, RFC 8594, angular.dev `serve.md`, the `typescript-angular` generator page, `npm view` registry reads, 26's and 25's owner texts. The mermaid diagrams were not re-parsed and `tsc` was not run.
- **Probe files:** none in the repository. Sources and tarballs lived in the job tmp dir above, which was deleted. The reviewer created only this file and edited `_meta/TASKS.md`.

Overall, an accurate, compact module with one Major finding. Every Spring, Jackson, springdoc and RFC claim sampled traces to the named file at its tag; every Java fence carries the banner (13 of 13) and uses only read APIs (the `handleMethodArgumentNotValid` override matches 7.0.9's signature exactly); generators are "read, not run"; our fixtures and models are named as ours; no Angular-style marker sits on a Spring, Jackson or generator fact; no test touches the network, clock or machine time zone; Q41.11's and Q41.19's answers equal their assertions; `FetchBackend.parseBody`'s behavior in §5, §10 and Q41.11 matches 22.2.1's source line for line. Findings:
- **one Major (F-1):** §3's table and Q41.06 teach orval's Angular output as `httpResource()` for GETs; orval 8.43.0's default is `HttpClient` services for every operation, and `httpResource()` is opt-in;
- four Minor factual findings: §1 never states Security 7.1.1's own CORS condition (the check REVIEW-M41 names) and says "declare it" as if nothing were automatic (F-2); "internal" is on three public names and missing on the one package-private name (F-3, C17); Q41.19 cites a test title that does not exist (F-4, C3); Q41.10 says Spring's default problem has no `title` (F-5);
- five Minor teaching findings: Misconceptions bullets without a correction (T-1, B7), three Coming from the backend callouts with no mechanism (T-2, B8), six follow-ups or traps that state a fact without its reason (T-3), four terms used undefined (T-4, B9), two Excerpts that cut statements (T-5, C7);
- six nits and the anchor handoffs (23 rows).

**Plan facts found wrong or superseded** (the module already gets each right or avoids it, except where a finding is named): F3 "`*` plus credentials fails at startup": it fails when `checkOrigin` runs on a request (the module says so, line 66); F18 "an httpResource generator and `retrievalClient`": the generator exists but the default is `'httpClient'` (F-1); C17 lists `DefaultCorsProcessor` and `ProblemDetailJacksonMixin` as internal, but both are public (F-3); F4 and For Jorge 5: the condition is in code, `HttpSecurityConfiguration.applyCorsIfAvailable` (`getBeanNamesForType(UrlBasedCorsConfigurationSource.class).length > 0`), and Boot's default chain is built from that same `HttpSecurity` bean (F-2). `cors.adoc`'s "more than one `CorsConfigurationSource` bean … won't automatically configure" is not what that method checks (it applies `.cors()` for one or more `UrlBasedCorsConfigurationSource` beans), so no fix text relies on that sentence.

**Prose:** 9,273 words now (`node labs/tools/module-stats.mjs`, main's run; the QUALITY-BAR python counter agrees). The fixes add about +330, for about 9,600: under the REVIEW ceiling of 9,800 and the hard cap of 10,000.

## Runs (main session, Node 24.21.0, 2026-10-20 15:3x; the reviewer ran none)

- `labs/ts-js`: `npx vitest run src/modules/41-fullstack-api-contracts src/outputs/41-fullstack-api-contracts`: 4 files, 12/12 passed.
- `labs/angular`: `npx ng test --watch=false --include 'src/app/modules/41-fullstack-api-contracts/**/*.spec.ts'`: 11 files, 64/64 passed (includes `outputs/q41-11.spec.ts`).
- `node labs/tools/check-links.mjs --planned`: "All links resolve" (210 planned).
- `node labs/tools/check-snippets.mjs . 41`: "All snippets check out."
- `node labs/tools/module-stats.mjs`: `41-fullstack-api-contracts | 21 Q | 3 Ex | 9273 words | Concept 5, Difference 5, Design 4, Trade-off 3, Bug hunt 2, Output 2 | no flag`.

No re-run with different content is requested: every finding is a text change in Markdown (no lab file changes). The FIX tasks re-run `check-snippets` and `check-links` (T-5 replaces two Excerpts).

## Reviewer's read-only script results

- **Markup:** B1: 10 of each of the six subsections; 10 `mermaid` fences and 10 "What to notice" lines; D1: 21 of each answer part; 32 `<details>`; every best-practice bullet has "because" and every misconception has "Cause:" (awk); `Unverified`, `relink:`, `TASK`, `PLACEHOLDER`, "probe", "planner", task IDs: 0; URLs in the module: only `example.com` and `localhost` examples.
- **Answer lengths (labels included):** 98-128 words per answer part; chunk averages about 115, 108 and 105 (the 105 cap excludes labels, as QB-M41-01's LOG notes).
- **Links:** every Q41 ID linked from the body (1-4 each); Exercise 41.1 from §5; Exercise 41.2 from §7, Q41.16 and Exercise 41.1's constraints; Exercise 41.3 from §6.
- **Tests:** 12 distinct cited titles; 11 exist verbatim, 1 does not (F-4); Exercises 41.1-41.3 criteria equal their `it(…)` titles (6 + 6 + 6, `describe.each` over both variants).
- **Determinism (C19):** no `Date.now`, `new Date()` without an argument, `performance.now`, timers, `process.env`, `child_process` or real network in any module-41 lab file; every `fetch` is `vi.stubGlobal`-ed or behind `HttpTestingController`; both `Intl.DateTimeFormat` calls pass `timeZone`; `api.example.com` strings are type URIs, never fetched.
- **Java (C9, banner):** 13 ```` ```java ```` fences, 13 banners.
- **Status markers:** 2, both Angular (Signal Forms [Stable since v22.0], `isFieldTree` [Added in v22.1], the second confirmed by `@publicApi 22.1`); none on Spring, Jackson or generators (C16). Two Angular first mentions lack one (N-4).
- **Internal names (C17):** `parseBody`, `doRequest` marked; `DefaultCorsProcessor`, `ProblemDetailJacksonMixin`, `FetchBackend` marked but public; `FilterOrderRegistration` unmarked but package-private (F-3).

## QUALITY-BAR

45 items: **38 Pass, 7 Partial (B7, B8, B9, C1, C3, C4, C7), 0 Fail.** H1-H3 rest on the main session.

| ID | Result | Evidence |
|---|---|---|
| A1 | Pass | Lines 3-9 in order; Applies to omits Data Commons, openapi-generator-cli and Zod (N-3). |
| A2 | Pass | 27 §5, 27 §3, 09 §5 anchored. |
| A3 | Pass | §1, §5, §9, §10; Q41.01, Q41.07, Q41.11, Q41.12, Q41.19; Summary. |
| A4 | Pass | 10 sections and the five closing parts. |
| A5 | Pass | CORS → DTOs → OpenAPI → evolution → errors → pages → validation → files → dates → trace. |
| B1 | Pass | 10 × 6 (script). |
| B2 | Pass | Concrete failures in each (401 preflight, `passwordHash`, blank cells, `[object Blob]`, 413, a day early). |
| B3 | Pass | 10 diagrams, each with "What to notice" (not re-parsed). |
| B4 | Pass | Each "How it actually works" answers a "why" from a named file at its tag. |
| B5 | Pass | Every `### Code` has numbered steps; §10 joins three steps on one line. |
| B6 | Pass | "because" on every item (script). |
| B7 | Partial | Four bullets give only a cause, no correction; one cause is circular (T-1). |
| B8 | Partial | Callouts present where required; §1, §6, §9 Coming from the backend name no mechanism (T-2). |
| B9 | Partial | CORS-safelisted, JPA, facade, interceptor used undefined (T-4). |
| B10 | Pass | 01, 07, 09, 25, 26, 27, 28, 30, 33, 34, 37, 38 get a sentence and a link. |
| C1 | Partial | 43 of 47 sampled claims match; F-1, F-2, F-3, F-5. |
| C2 | Pass | Q41.11 and Q41.19 values equal their assertions (table below). |
| C3 | Partial | Q41.19's cited title is not the test's (F-4); every other cited test exists. |
| C4 | Partial | Signal Forms marked at its third mention, `httpResource` unmarked (N-4). |
| C5 | Pass | Angular names exist in 22.2.1 or are internals marked as such. |
| C6 | Pass | 0 `Unverified`. |
| C7 | Partial | `check-snippets` passes; Exercises 41.1 and 41.2 Excerpts keep inner statements of functions whose headers they drop (T-5). |
| C8 | Pass | Every source has a line under `## Module 41`; new reads go in with the FIXes. |
| D1 | Pass | 21 × 5; ≥ 2 answered follow-ups everywhere. |
| D2 | Pass | Q41.11 and Q41.19 give values and reason in the full explanation's words. |
| D3 | Pass | 6 tags, max 24%. |
| D4 | Pass | Q41.01-21 follow the sections. |
| D5 | Pass | Q09.12-Q09.14, Q27.15, Q27.16, Q26.21, Q07.16, Q07.17, Q30.10, Q34.23 linked, none re-asked. |
| D6 | Pass | 21/21 linked from the body. |
| D7 | Pass | 21 anchors. |
| D8 | Pass | 21 ≤ 32, ≥ 15. |
| E1 | Pass | Full anatomy in all three; 3, 2, 2 answered follow-ups. |
| E2 | Pass | 18/18 criteria = titles; accounts match the specs (`[5, 4]`, a: 1 / b: 0, `#/content/1` / `#/items/1`, `address.street`). |
| E3 | Pass | One shape → pointers onto two forms APIs → list client over §2, §5, §6, §9. |
| E4 | Pass | Main's run 64/64; no `any`; store has one injected dependency. |
| E5 | Pass | Q41.11, Q41.19. |
| F1 | Pass | Two paragraphs, all ten sections linked (N-5 formatting). |
| F2 | Pass | Three prompts naming listeners. |
| F3 | Pass | Five flashcards. |
| F4 | Pass | Builds on, Read next, Uses later, Comparisons. |
| G1 | Pass | 9,273 ≤ 9,300; about 9,600 after fixes ≤ 9,800. |
| G2 | Pass | 7/7 SYLLABUS §4 (41) checkboxes. |
| H1 | Pass (main) | Main's runs above. |
| H2 | Pass (main) | `check-links --planned` 0. |
| H3 | Pass (main) | Main checks `git status`. |

## Module-specific checks

| Check | Result | Evidence |
|---|---|---|
| Spring, Jackson, springdoc claims traced; ≥ 10 re-read | Pass, four findings | 47 re-read (table below); the named ones: Security 7.1 condition (F-2: omitted), `MethodArgumentNotValidException` default body (match), `ProblemDetail` unset `type` (match; `title` F-5), `DIRECT` default (match, annotation and Boot property), `WRITE_DATES_AS_TIMESTAMPS` and `FAIL_ON_UNKNOWN_PROPERTIES` (match, both `false` "as of Jackson 3.0"; Boot re-disables the latter under `useJackson2Defaults`), multipart 1MB/10MB (match), versioning resolution (match: 400 for unsupported or missing, baseline `"1.2+"`, highest at or below wins). |
| Java banner and read APIs only | Pass | 13/13 banners; every API in the snippets found in the 7.0.9 / 7.1.1 / Boot 4.1.1 / swagger 2.2.55 sources read. |
| Generators "read, not run" (C9) | Pass, one finding | Table and Q41.06 say "read, not run"; orval's default wrong (F-1). |
| Q41.11 against its test | Pass | Object `{ title, status, detail, instance }`, `Blob` typed `application/problem+json`, the string `<html>Bad gateway</html>` = `q41-11.spec.ts`; title cited verbatim. |
| Q41.19 against its test | Pass (values), one finding | `string`, `2026-10-21`, `9007199254740992`, `12345678901234568`, `19.9` = `q41-19.test.ts`; cited title differs (F-4). |
| `parseBody` (F19) vs §5, §10, Q41.11 | Pass | 22.2.1: switch on `request.responseType`; `'json'` returns `null` for empty, the text for a failed non-2xx parse; `'blob'` is `new Blob([binContent], { type: contentType })`. |
| Fixtures and models named as ours (C18) | Pass | "our Spring-shaped", "our fixture in springdoc's 3.1.0 shape", "our checker", "our example contract", "ours is a private protocol", "our DTO". |
| No Angular-style marker on Spring, Jackson, generators (C16) | Pass | "`@since 7.0`" in plain words; no bracket markers. |
| No network, clock or time zone in tests (C19) | Pass | Script above. |
| Handoffs into 41 honored; owners' questions not re-asked | Pass | 01 → §2/§9, 04 and 27 → §5, 06/07 → §2/§4, 09 → §1, 28 → §5, 29/30 → §3, 33 → §7, 34 → §9; `Accept-Language` (M34 plan pointer) dropped as unread (For Jorge 3). Handoffs table below. |
| Prose ≤ 9,800 after fixes | Pass | About 9,600. |

## Handoffs

Module 41 slugs (from the `## N.` headings, as in Contents):
- S1 `#1-cors-on-both-sides-springs-corsconfigurationsource-spring-security-preflight-caching-credentials-and-the-dev-proxy`
- S2 `#2-dto-contracts-what-crosses-the-wire-absent-versus-null-and-checking-responses-at-the-boundary`
- S3 `#3-openapi-with-springdoc-and-generated-typescript-clients-openapi-generator-orval-and-ng-openapi-gen`
- S4 `#4-evolving-the-contract-compatible-changes-api-versioning-in-spring-framework-7-and-deprecation-headers`
- S5 `#5-error-contracts-with-problemdetail-rfc-9457-and-mapping-them-in-angular`
- S7 `#7-validation-on-both-layers-bean-validation-angular-validators-and-server-errors-on-form-fields`
- S9 `#9-dates-time-zones-decimals-and-money-across-the-wire`

Re-located 2026-10-20: every candidate is still at the line PLAN-M41 recorded, with exactly one link to `41-fullstack-api-contracts.md` on it.

| Target | Links (module:line, context), 23 rows, +0 words |
|---|---|
| S1 | 09:342 ("Spring's `CorsConfigurationSource` (owner [41]"), 09:367 ("**Prefer a same-origin proxy** ([41]") |
| S2 | 01:486 ("the contract design belongs in [Module 41]", PATCH), 01:907 ("schema libraries generate such guards for whole payloads ([Module 41]"), 06:1583 ("[41. API contracts] (validating responses at the boundary)"), 07:1365 ("[41. API contracts] (schemas at the boundary)") |
| S3 | 30:481 ("\"Pact verification\"). [Module 41] owns the design."), 30:1121 ("[module 41] owns the design)"), 30:1460 ("and contract tests ([41]"), 30:1527 ("that is a contract test ([41]") |
| S4 | 07:1199 ("rejecting suits a contract you own ([module 41]") |
| S5 | 04:491 ("such as idempotency keys ([41. API contracts]"), 27:541 ("Server error formats are [41]'s"), 27:1552 ("The server's error body is [41]'s contract"), 27:1620 ("a client-generated key the server deduplicates ([41]"), 27:2578 (Read next, "[41. Full-stack API contracts] (error bodies)"), 28:1084 ("and [module 41] owns the contract") |
| S7 | 33:2129 ("[41] (server-side validation)") |
| S9 | 01:704 ("Never do arithmetic on IDs ([Module 41]"), 01:767 ("a JSON number that the client never parses into a double ([Module 41]"), 01:1400 ("The contract design is in [Module 41]"), 34:821 ("Wire formats are [41's]"), 34:1547 ("Dates and money on the wire are [module 41]'s") |

Each link keeps its text; only the target gains the slug. Stay file-level: the `:5` header lines (06, 07, 09, 27, 30, 34) and the "Uses these ideas later" lists 01:1486, 09:1606, 27:2579, 29:2999, 30:1704, 34:1944. Module 42 (42:4) already links §1 with its anchor.

## Factual findings

**F-1 · Major (C1, C9) · orval's default Angular output (259, 1483).** §3's table cell says orval 8.43.0 emits "`httpResource()` for GETs, `HttpClient` services for writes", and Q41.06's short answer "orval needs Node and emits `httpResource()` for GETs, services for writes". Read in `orval@8.43.0` `dist/options-*.mjs`: `client: angular.retrievalClient ?? angular.client ?? "httpClient"`; `@orval/angular@8.43.0` `dist/index.mjs` `builder`: `case "httpResource"` → the `httpResource` builder, `case "both"`, `default: return httpClientBuilder`; `@orval/core@8.43.0` `AngularOptions.retrievalClient` doc: "`httpResource`: emit retrievals as Angular `httpResource` helpers". So by default every operation, GETs included, becomes an `@Injectable` `HttpClient` service method; `isRetrievalVerb` (GET as retrieval) applies only once `httpResource` or `both` is chosen. A reader would repeat the wrong default.
- Fix (259, the cell): "`httpResource()` for GETs, `HttpClient` services for writes, optional Zod (`@orval/angular`)" → "`HttpClient` services by default; `httpResource()` [Stable since v22.0] for GETs with `retrievalClient: 'httpResource'` (`orval` defaults it to `'httpClient'`); optional Zod (`@orval/angular`)" (+12; the marker is 27's, 27:69, and also settles N-4 for `httpResource`).
- Fix (1483): "orval needs Node and emits `httpResource()` for GETs, services for writes." → "orval needs Node and emits `HttpClient` services, or `httpResource()` for GETs when configured." (+2)
- SOURCES.md `## Module 41`: in the `@orval/angular@8.43.0` line, after "the `@Injectable` service-class builder" add "; `builder` returns the `httpResource` builder only for `client` `'httpResource'` or `'both'`, else the `HttpClient` builder"; add a line "`orval@8.43.0`, `dist/options-*.mjs`, Angular options normalization (`retrievalClient ?? client ?? \"httpClient\"`), `npm pack` read 2026-10-20, section 3, Q41.06. Read, not run."

**F-2 · Minor (C1; the REVIEW-M41 check "the Security 7.1 auto-configuration condition") · §1 (65, 122) and Q41.01 (1380).** The module never says when Spring Security turns CORS on by itself, and line 65 ends "Boot 4.1.1's security page omits CORS: declare it", which reads as "nothing is automatic". Read: `spring-security` 7.1.1 `HttpSecurityConfiguration.httpSecurity()` calls `applyCorsIfAvailable(http)`, which runs `http.cors(withDefaults())` when `getBeanNamesForType(UrlBasedCorsConfigurationSource.class).length > 0`; `cors.adoc`: "Note that Spring Security will automatically configure CORS only if a `UrlBasedCorsConfigurationSource` instance is present."; Boot 4.1.1 `ServletWebSecurityAutoConfiguration.defaultSecurityFilterChain(HttpSecurity http)` builds its chain from that same bean. `CorsConfigurer` then reads the source by the name `corsConfigurationSource`, else MVC's `mvcHandlerMappingIntrospector` (the module's name claim is right).
- Fix (65): "Boot 4.1.1's security page omits CORS: declare it." → "Security 7.1.1 also applies `.cors(withDefaults())` itself, Boot's default chain included, when a `UrlBasedCorsConfigurationSource` bean exists (`HttpSecurityConfiguration.java`; \"only if a `UrlBasedCorsConfigurationSource` instance is present\", `cors.adoc`); calling it keeps the chain explicit." (+29)
- Fix (122): "**Name the bean `corsConfigurationSource`**, because Security finds it by name." → "**Return `UrlBasedCorsConfigurationSource` from a bean named `corsConfigurationSource`**, because Security turns CORS on by that type and reads the source by that name." (+10)
- Fix (1380): "Boot's security page omits CORS, so declare it" → "Security also applies it when a `UrlBasedCorsConfigurationSource` bean exists; calling it keeps that visible" (+6)
- SOURCES.md: a line "`spring-projects/spring-security` 7.1.1 `config/src/main/java/org/springframework/security/config/annotation/web/configuration/HttpSecurityConfiguration.java` (`applyCorsIfAvailable`), read 2026-10-20, section 1, Q41.01" and a line "`spring-projects/spring-boot` v4.1.1 `module/spring-boot-security/src/main/java/org/springframework/boot/security/autoconfigure/web/servlet/ServletWebSecurityAutoConfiguration.java` (`defaultSecurityFilterChain(HttpSecurity http)`), read 2026-10-20, section 1".

**F-3 · Minor (C17) · "internal" on public names, missing on a package-private one.** `DefaultCorsProcessor` is `public class` (`spring-web` 7.0.9), `ProblemDetailJacksonMixin` is `public interface … @since 6.0` and named in the reference docs, `FetchBackend` is `@publicApi` (`@angular/common` 22.2.1 `types/http.d.ts`); `FilterOrderRegistration` is `final class` without `public` (package-private, `spring-security` 7.1.1).
- Fix (67): "the internal `DefaultCorsProcessor` sends no `Max-Age`" → "`DefaultCorsProcessor` sends no `Max-Age`" (−1).
- Fix (534): "The internal `ProblemDetailJacksonMixin` writes" → "Spring's `ProblemDetailJacksonMixin` writes" (0).
- Fix (929): "its internal `FetchBackend` reads the stream to the end, then builds one `Blob`" → "`FetchBackend`'s internal `doRequest` reads the stream to the end, then `parseBody` builds one `Blob`" (+2).
- Fix (1707): "The internal `FetchBackend` (22.2.1) builds one `Blob`" → "`FetchBackend` (22.2.1) builds one `Blob` in its internal `parseBody`" (+3).
- Fix (1307): "`FilterOrderRegistration` puts `CorsFilter`" → "The internal (package-private) `FilterOrderRegistration` puts `CorsFilter`" (+3).
- SOURCES.md `## Module 41`: the `DefaultCorsProcessor.java` line "(internal)" → "(public class)"; the `FetchBackend` line for section 8 "(internal: reads …" → "(public class; internal `doRequest`: reads …".

**F-4 · Minor (C3) · Q41.19 cites a title that no test has (1756).** "Asserted by `Q41.19 JSON.parse keeps dates as strings and rounds numbers to doubles`"; the test is `it('Q41.19 JSON.parse keeps both dates as strings and rounds the Long and the BigDecimal to doubles', …)` (`labs/ts-js/src/outputs/41-fullstack-api-contracts/q41-19.test.ts`).
- Fix: replace the cited title with "`Q41.19 JSON.parse keeps both dates as strings and rounds the Long and the BigDecimal to doubles`" (+5).

**F-5 · Minor (C1) · Q41.10 drops the default `title` (1562).** "Spring renders the status, a detail and `instance`, with `type` unset." `ProblemDetail.getTitle()` (`spring-web` 7.0.9) returns `HttpStatus.getReasonPhrase()` when no title is set and the status is known ("By default, if not explicitly set and the status is well-known, this is sourced from the `HttpStatus#getReasonPhrase()`"); Q41.11's own body shows `"title":"Bad Request"`.
- Fix: → "Spring renders the status, its reason phrase as `title`, a detail and `instance`, with `type` unset." (+5)
- SOURCES.md: append to the `ProblemDetail.java` line "; `getTitle()` falls back to the status's reason phrase, re-read 2026-10-20, Q41.10".

## Teaching findings

**T-1 · Minor (B7) · Misconceptions without a correction, and one circular cause.**
- §1 (129): "`ng serve` is a development server. Cause: it feels like one." → "`ng serve` is a development server. Cause: it answers real API calls locally, so it looks like part of the stack." (+9)
- §7 (894): "\"Client validation makes server validation optional.\" Cause:" → "\"Client validation makes server validation optional.\" The server must still check every request. Cause:" (+7)
- §7 (895): "\"Copy every rule by hand.\" Cause:" → "\"Copy every rule by hand.\" Mirror syntactic rules from one source, such as the OpenAPI constraints. Cause:" (+11)
- §7 (896): "\"`setErrors` is enough.\" Cause: it shows once; the next run clears it." → "\"`setErrors` is enough.\" It lasts only until the next validator run. Cause: the message shows at first." (+5)
- §8 (1071): "\"A larger limit handles any file.\" Cause:" → "\"A larger limit handles any file.\" One blip still restarts the whole upload; chunk large files. Cause:" (+10)

**T-2 · Minor (B8; STYLE-GUIDE §6 "a real comparison (mechanism, not a one-word mention)") · thin Coming from the backend callouts.**
- §1 (117): "`CorsFilter` and its source replace a hand-written servlet `Filter` setting `Access-Control-*` headers. **Where the analogy breaks:** it acts only on requests with an `Origin`; curl's pass." → "`CorsFilter` and its source replace a hand-written servlet `Filter` setting `Access-Control-*` headers: both run before any controller and answer the preflight themselves. **Where the analogy breaks:** `CorsFilter` acts only on requests with an `Origin` header (`CorsUtils.isCorsRequest`), so curl's requests pass untouched, and the browser, not the filter, enforces the answer." (+26; also fixes "curl's pass")
- §6 (785): "`Pageable` and `Page` are Java types. **Where the analogy breaks:** the client sees only JSON, so getters become the contract." → "In Java a caller passes a `Pageable` and gets a typed `Page`, and the compiler checks every use. **Where the analogy breaks:** the client sees only the JSON Jackson writes from `PageImpl`'s getters, so a getter changed in a Spring Data release changes the contract with no compile error; `PagedModel` fixes that shape." (+30)
- §9 (1239): "`java.time` has a type per meaning." → "`java.time` has a type per meaning (`Instant`, `LocalDate`, `OffsetDateTime`) and `BigDecimal` keeps every digit, so the compiler stops you mixing an instant with a date." (+20)
- SOURCES.md: append to the `DefaultCorsProcessor.java` line (or add) "`CorsUtils.isCorsRequest` (no `Origin` → not a CORS request), re-read 2026-10-20, section 1".

**T-3 · Minor (STYLE-GUIDE §2 "An answer that only states a fact is not finished") · follow-ups and traps without their reason.**
- Q41.06 (1489): "*What decides?* Mostly the toolchain." → "*What decides?* The toolchain, in our judgment: a build that already has a JDK can run openapi-generator; a Node-only frontend build avoids Java with ng-openapi-gen or orval." (+21)
- Q41.07 (1509): "**Trap to avoid.** One layer alone." → "**Trap to avoid.** Trusting one layer alone: a generated client still accepts a lying server, and a runtime parse alone finds a rename only in production." (+19)
- Q41.12 (1612): "*Why not just the status?* Kinds share one." → "*Why not just the status?* Several kinds share one status, such as two different 409 conflicts, so only `type` picks the message." (+14)
- Q41.13 (1631): "*Can a cursor jump to page 50?* No." → "*Can a cursor jump to page 50?* No: page 50 starts after page 49's last key, which only loading page 49 gives." (+15)
- Q41.19 (1760): "*An exact server?* `JSON.parse` still rounds." → "*Does an exact `BigDecimal` on the server help?* No: `JSON.parse` turns the number into a double before any Angular code runs." (+14)
- Q41.21 (1796): "*Status 0?* No response existed." → "*Why status 0?* Script got no response: `fetch` rejected with a `TypeError`, so Angular has no status to report." (+12)

**T-4 · Minor (B9) · terms used before definition.**
- §1 (68): "are the only non-safelisted headers script reads (Fetch Standard)." → "are the only headers beyond the seven **CORS-safelisted** ones (such as `Content-Type`) that script reads cross-origin (Fetch Standard)." (+9)
- §2 (137): "returns the JPA **entity**" → "returns the JPA (Jakarta Persistence) **entity**" (+2).
- §3 (249): "What to notice: components see only the facade; only the dashed edge fails builds." → "What to notice: components see only the facade, one service in front of the generated code; only the dashed edge fails builds." (+8)
- §5 (661): "an **interceptor** ([27 §4]\(…)) maps bodies to UI errors" → "an **interceptor** (a function every `HttpClient` request and response passes through, [27 §4]\(…)) maps bodies to UI errors" (+10).

**T-5 · Minor (C7, STYLE-GUIDE §7.2 "Only whole members or statements may be omitted") · Excerpts that cut statements.**
- Exercise 41.1 (1835-1840): the excerpt keeps three body lines of `toUiError` without its header, and step 3's `rethrowAsUiError` is not shown. Replace the fence body (keep the first line `// Excerpt of labs/angular/src/app/modules/41-fullstack-api-contracts/exercise-1-problem-details/problem.ts`) with the two whole functions copied verbatim from that file, each with its JSDoc line: `toUiError` (from `/** Reads the error body …` to its closing `}`) and `rethrowAsUiError` (from `/** For \`catchError\`: …` to its closing `}`) (code only, +0 prose).
- Exercise 41.2 (1889-1897): the excerpt joins `fieldAt` with two inner lines of `submitWithServerErrors` at mixed indentation. Replace the fence body (keep the first line `// Excerpt of labs/angular/src/app/modules/41-fullstack-api-contracts/exercise-2-form-errors/b/apply-to-signal-forms.ts`) with `fieldAt` and the whole `submitWithServerErrors` (from `export async function submitWithServerErrors(` to its closing `}`), verbatim (code only, +0 prose).

**Nits**
- **N-1:** Q41.09 (1539): "The path resolver never returns `null`, so it cannot yield to another (`ApiVersionConfigurer.java`, 7.0.9)." → "The one-argument `usePathSegment` resolver never returns `null`, so it cannot yield to another; 7.0.6 added a predicate overload that can (`ApiVersionConfigurer.java`, 7.0.9)." (+9)
- **N-2:** Q41.11 (1592): "`'blob'` wraps the bytes ." → "`'blob'` wraps the bytes." (0)
- **N-3 (A1):** header (6): "Vitest in Node; documented only: Spring Boot 4.1.1, Framework 7.0.9, Security 7.1.1, Jackson 3.1.5, springdoc 3.1.1, `ng-openapi-gen` 1.1.0, `@orval/angular` 8.43.0;" → "Vitest and Zod 4.6.5 in Node; documented only: Spring Boot 4.1.1, Framework 7.0.9, Security 7.1.1, Data Commons 4.1.1, Jackson 3.1.5, springdoc 3.1.1, `ng-openapi-gen` 1.1.0, `@orval/angular` 8.43.0, `@openapitools/openapi-generator-cli` 2.42.0;" (+9)
- **N-4 (C4):** Signal Forms is first mentioned in body text at Q41.16's short answer (1687), but marked only at Exercise 41.2 (1863). Q41.16 (1687): "an error targeting a `fieldTree` in Signal Forms." → "an error targeting a `fieldTree` in Signal Forms [Stable since v22.0]." and Exercise 41.2 (1863): "in Signal Forms [Stable since v22.0]." → "in Signal Forms." (net 0). `httpResource`: F-1's fix carries 27's marker.
- **N-5 (F1):** Summary (1364): "([§2]\(#2-dto-contracts-what-crosses-the-wire-absent-versus-null-and-checking-responses-at-the-boundary)) ([§3]\(#3-openapi-with-springdoc-and-generated-typescript-clients-openapi-generator-orval-and-ng-openapi-gen))" → "([§2]\(#2-dto-contracts-what-crosses-the-wire-absent-versus-null-and-checking-responses-at-the-boundary), [§3]\(#3-openapi-with-springdoc-and-generated-typescript-clients-openapi-generator-orval-and-ng-openapi-gen))" (0).
- **N-6:** Exercise 41.3 (1974-1976): three empty lines before `</details>`; keep one (0).

## Judged acceptable

- §1 "with the bean *named* `corsConfigurationSource`, else MVC's rules": exact for `CorsConfigurer.getCorsConfigurationSource` (a `corsFilter` bean is checked first; not needed at this depth).
- §10 "`ExceptionHandlerExceptionResolver` (our advice), then `DefaultHandlerExceptionResolver`": `ResponseStatusExceptionResolver` sits between them but changes nothing for `MethodArgumentNotValidException`; "leaves the body to the container" covers Boot's `/error` (not read, as SEC-M41-10 notes).
- Q41.12 "Spring's 412": `mvc-caching.adoc` says "you can instead set the response to 412"; the follow-up and §5 present the 412 body as ours.
- Q41.17 "no interceptor adds auth to a plain link": follows from interceptors being `HttpClient`-only (27 §4); not a browser claim.
- Q41.15 "springdoc's use was not read": honest scope note; swagger-core's mapping (`applyNotBlankConstraint` sets `minLength` 1, `applyPatternConstraint`) re-read and matches.
- Answer parts at 98-128 words with labels: within the plan's cap once labels are excluded (QB LOG lines).

## Claims sampled (47)

| # | Claim (location) | Basis | Result |
|---|---|---|---|
| 1 | Security applies CORS itself with a `UrlBasedCorsConfigurationSource` bean (§1, Q41.01) | `HttpSecurityConfiguration.applyCorsIfAvailable`; `cors.adoc`; Boot `ServletWebSecurityAutoConfiguration` | Omitted (F-2) |
| 2 | Preflight "does not contain any cookies" (§1, Q41.03) | `cors.adoc` | Match |
| 3 | Source found by name `corsConfigurationSource`, else MVC (§1) | `CorsConfigurer` | Match |
| 4 | `CorsFilter` before `CsrfFilter` and authentication (§10) | `FilterOrderRegistration` | Match (label F-3) |
| 5 | MVC checks CORS "after successfully mapping a request to a handler" (§1) | `webmvc-cors.adoc` | Match |
| 6 | `*` with credentials throws on a checked request; message (§1, Q41.03) | `CorsConfiguration.checkOrigin`, `validateAllowCredentials` | Match |
| 7 | `maxAge` `null`; no `Max-Age` sent (§1) | `CorsConfiguration`; `DefaultCorsProcessor` | Match (label F-3) |
| 8 | Only requests with `Origin` are checked (Q41.01, Q41.03) | `CorsUtils.isCorsRequest` | Match |
| 9 | Boot 4.1.1's security page omits CORS (§1) | `web/spring-security.adoc` | Match |
| 10 | `MethodArgumentNotValidException` body "Invalid request content." (§5, Q41.10) | 7.0.9 source | Match |
| 11 | `ProblemDetail` `type` "not set" (§5) | `ProblemDetail.java` | Match |
| 12 | Default problem renders status, detail, `instance` (Q41.10) | `ProblemDetail.getTitle` | Incomplete (F-5) |
| 13 | Mixin unwraps `properties` at top level (§5) | `mvc-ann-rest-exceptions.adoc`; mixin source | Match (label F-3) |
| 14 | `handleMethodArgumentNotValid` / `handleExceptionInternal` signatures (§5 Java) | `ResponseEntityExceptionHandler` | Match |
| 15 | `problemdetails.enabled` defaults `false` (§5, Q41.10) | `WebMvcProperties.Problemdetails` | Match |
| 16 | `MaxUploadSizeExceededException` 413 (§8) | 7.0.9 source | Match |
| 17 | Multipart 1MB / 10MB (§8, Q41.18) | `MultipartProperties` | Match |
| 18 | `DIRECT` default "for backward compatibility reasons", "discouraged" (§6, Q41.14) | `EnableSpringDataWebSupport` | Match |
| 19 | Boot `serialization-mode` `DIRECT`; `one-indexed-parameters` (§6, Q41.14) | `DataWebProperties` | Match |
| 20 | "strongly recommend against" `Page`; warning since 3.1 (§6, Q41.14) | `core-extensions-web.adoc` 146-149 | Match |
| 21 | `sort` not validated (§6, Q41.14) | `core-extensions-web.adoc` 112 | Match |
| 22 | Offset materializes the whole result; position exclusive (§6, Q41.13, Ex 41.3) | `scrolling.adoc` 33, 65, 93 | Match |
| 23 | `FAIL_ON_UNKNOWN_PROPERTIES` `false` as of 3.0 (§2, Q41.08) | `DeserializationFeature` 148-150 | Match |
| 24 | `FAIL_ON_MISSING_CREATOR_PROPERTIES` off, `FAIL_ON_NULL_FOR_PRIMITIVES` on (§2) | same | Match |
| 25 | Boot re-disables it under `useJackson2Defaults` (§2) | `JacksonAutoConfiguration` 515-518 | Match |
| 26 | `WRITE_DATES_AS_TIMESTAMPS` quote (§9) | `DateTimeFeature` 169-174 | Match |
| 27 | `NumberSerializer` / `LongSerializer` numbers, `createContextual` STRING (§9) | `NumberSerializer`, `NumberSerializers` | Match |
| 28 | Boot: Jackson 3 `JsonMapper` (§9) | `features/json.adoc` 12, 23 | Match |
| 29 | `jackson-annotations` 2.21 (§2) | `jackson-bom-3.1.5.pom` | Match |
| 30 | Resolver methods; `setDefaultVersion` (§4, Q41.09) | `ApiVersionConfigurer` | Match |
| 31 | Path resolver never returns `null` (Q41.09) | `ApiVersionConfigurer` 100-124 | Match for one overload (N-1) |
| 32 | 400 for unsupported or missing; `SemanticApiVersionParser` (§4, Q41.09) | `webmvc-versioning.adoc` 64-83 | Match |
| 33 | Baseline `"1.2+"`; highest at or below wins (§4) | `ann-requestmapping.adoc` 427-433 | Match |
| 34 | `configureVersion`, `setDeprecationDate`, `setSunsetDate` (§4 Java) | `StandardApiVersionDeprecationHandler` | Match |
| 35 | "Applications should handle both" (§7) | `ann-validation.adoc` 28 | Match |
| 36 | 412 for conditional writes (§5) | `mvc-caching.adoc` 185 | Match |
| 37 | Transliterated `filename` plus `filename*` (§8) | `ContentDisposition.toString` | Match |
| 38 | RFC 9457 `type` primary identifier, `status` advisory, "MUST ignore" (§5, Q41.10, Ex 41.1) | RFC 9457 250-251, 298, 378 | Match |
| 39 | RFC 9745 `@1688169599`; RFC 6266 `filename*` wins, last segment; RFC 9110 §14.4 "private agreements" (§4, §8, Q41.18) | RFCs | Match |
| 40 | Seven CORS-safelisted response headers (§1, Q41.03) | Fetch Standard | Match |
| 41 | springdoc default "3.1.0"; swagger 2.2.55 pinned (§3, Q41.05, Q41.15) | `SpringDocConfigProperties`; `pom.xml` | Match |
| 42 | `@Size`, `@Pattern`, `@NotBlank` → `minLength`/`maxLength`, `pattern`, `minLength` 1 (§7, Q41.15) | `ModelResolver`, `ValidationAnnotationsUtils` | Match |
| 43 | ng-openapi-gen `fn.handlebars` shape, "DO NOT EDIT", `promises` true, `Api.invoke` → `Promise`, "No data transformation" (§3) | tarball | Match |
| 44 | orval: `httpResource()` for GETs by default (§3, Q41.06) | `orval` options default; `@orval/angular` `builder` | Mismatch (F-1) |
| 45 | `useDates` retypes; `useDatesTransform` converts, default `false` (§3, Q41.06) | `@orval/core` `index.d.mts` | Match |
| 46 | openapi-generator-cli runs `java`, JDK 11, Docker (§3, Q41.06) | README 13, 272 | Match |
| 47 | `parseBody` by `responseType`; status 0 from `doRequest`; `isFieldTree` 22.1 (§5, §10, Q41.11, Ex 41.2) | `@angular/common`, `@angular/forms` 22.2.1 | Match (`FetchBackend` label F-3) |

## Proposed FIX tasks

The module is at 9,273 words; the CLOSE limit was 9,300 and the REVIEW ceiling is 9,800. All fixes together add about +330 (F about +75, T about +245, nits about +10), for about 9,600.

```
| FIX-M41-01 | S | todo | REVIEW-M41 |  |
| FIX-M41-02 | M | todo | REVIEW-M41 |  |
| FIX-M41-03 | S | todo | REVIEW-M41 |  |
```

- **FIX-M41-01 · S** · factual fixes F-1..F-5 and their SOURCES lines. **Sonnet** (texts and sources prescribed).
- **FIX-M41-02 · M** · teaching fixes T-1..T-5 and nits N-1..N-6. **Sonnet** (texts prescribed; T-5 copies whole functions verbatim).
- **FIX-M41-03 · S** · anchors for the 23 file-level links into 41. **Sonnet** (mechanical; slugs listed).

## For Jorge

1. **Spring Security's CORS condition lives in code, and the docs overstate one case.** `HttpSecurityConfiguration.applyCorsIfAvailable` (7.1.1) turns CORS on when one or more `UrlBasedCorsConfigurationSource` beans exist; `cors.adoc` says it will not with "more than one `CorsConfigurationSource` bean". F-2 teaches only the single-bean case both agree on. M41.md For Jorge 5's interface-typed-bean worry (type prediction before instantiation) was not run, so the fix makes no claim about it.
2. **The plan's "internal" list (C17) named two public Spring types**; PLAN-M42's C17 list (`SpaCsrfTokenRequestHandler`, `FilterOrderRegistration`, …) should be checked against each class's modifier before writers mark them (a heads-up for module 42, no task here).
3. **`Accept-Language` on the wire** (M34.md plan pointers, "the server's `Accept-Language`") is not in 41: SEC-M41-09 dropped it as unread (C12). 34's own text links 41 only for dates and money, so no reader link breaks; say if you want a sentence (would need Framework 7.0.9's `LocaleResolver` read).
4. **Carried from CLOSE-M41 (no FIX):** M41.md For Jorge 1 (VERSIONS.md rows for Spring Data BOM 2026.0.1, Tomcat 11.0.24, swagger-core 2.2.55, the API tooling table) and For Jorge 2 (an optional `ng-openapi-gen@1.1.0` install) remain open.
