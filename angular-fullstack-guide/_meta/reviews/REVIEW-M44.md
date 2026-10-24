# REVIEW-M44: `modules/44-fullstack-delivery-and-operations.md`

- **Reviewer:** a fresh reviewer subagent (claude-opus-5-5) of session S20261022-1316-claudecode. It wrote nothing in module 44, continues none of the PLAN, SEC, EX, QB or CLOSE-M44 conversations, and so is eligible (RUN.md §4). It ran no build and no test suite. The main session owns execution, and its runs are the basis below. The reviewer read files, ran read-only scripts and fetched sources. Job-state updates and every fix belong to the main session.
- **Date:** 2026-10-22.
- **Files read:**
  - the whole module (1,985 lines). Line numbers below are as of this review and will move at FIX time; every fix names its quoted text, and a fixer finds the line by that text, not by its number;
  - `_meta/modules/M44.md`: lessons 1-19, Handoffs into 44, F1-F45, C1-C27, the owner map, anchor candidates, For Jorge, and "Corrections found while writing" through CLOSE-M44;
  - QUALITY-BAR, STYLE-GUIDE, and REVIEW-M43 (the format model);
  - the module-44 common rules and the REVIEW-M44 block in TASKS.md;
  - the CLOSE-M44 LOG line (open point: Q44.19 "`sentry-trace` same-origin only");
  - `SOURCES.md` `## Module 44` (line 3069 on, grepped);
  - every module-44 lab file:
    - labs/ts-js `concepts/`, `exercise-1-release-publisher/` and `src/outputs/44-fullstack-delivery-and-operations/q44-05`, `q44-10` and `q44-20.test.ts`;
    - labs/angular `concepts/` (`beacon-queue.ts` and the specs), `exercise-2-trace-correlation/` and `exercise-3-feature-flags/`;
    - every file under `labs/angular/deploy/`, read as text;
  - other modules, only for their `### Q` headings and the lines that link `44-fullstack-delivery-and-operations.md`. These are 05, 09, 12, 30, 31, 32, 33, 34, 37, 38, 39, 41, 42 and 43.
- **Sources re-read (2026-10-22):** fetched into `/Users/jorge.quintero/.claude/jobs/4a727236/tmp/review44`, which was deleted afterwards.
  - **nginx.org.** `ngx_http_core_module`: `location` precedence, including the predicate locations at 1.31.5, and `try_files`'s last parameter.
  - **nginx.org.** `ngx_http_headers_module`:
    - `add_header`'s status list, its inheritance "if and only if" and `always` (1.7.5);
    - `add_header_inherit` (1.29.3);
    - `expires`, which writes only `max-age`/`no-cache`.
  - **nginx.org.** `ngx_http_gzip_module`: the `gzip_types` default `text/html`. `ngx_http_gzip_static_module`: "not built by default", and `always`.
  - **nginx.org.** `ngx_http_proxy_module`:
    - the `proxy_pass` URI rule, and no URI in a regex location;
    - `Host` and `Connection` not passed, with defaults `$proxy_host` and `close`, and an empty value not passed;
    - `proxy_http_version` 1.1 since 1.29.7;
    - `proxy_read_timeout` "between two successive read operations";
    - `X-Accel-Buffering`.
  - **nginx.org.** `websocket.html`: hop-by-hop headers and 60 s. `ngx_http_split_clients_module`: MurmurHash2. `ngx_http_log_module`. `ngx_otel_module` (`/en/docs/ngx_otel_module.html`): the `nginx-module-otel` package since 1.25.3, and `otel_trace_context` extract, inject and propagate. `download.html`: mainline 1.31.8 and stable 1.30.6. `CHANGES`: the 1.29.3, 1.29.7 and 1.31.5 entries.
  - **docs.docker.com.** The Dockerfile reference:
    - shell form "does not pass signals";
    - `STOPSIGNAL` defaults to SIGTERM;
    - `HEALTHCHECK` defaults 30s/30s/0s/5s/3, and it only sets a health status;
    - a Dockerfile-specific `.dockerignore` takes precedence.
  - **docs.docker.com.** `docker run`: PID 1 "ignores any signal with the default action", and `--init` "forwards signals and reaps processes". `docker stop`: a 10-second grace period on Linux. The build cache: "If a layer changes…", with checksums from metadata and mtime ignored.
  - **GitHub images.** `nginx/docker-nginx`:
    - `20-envsubst-on-templates.sh`: the `defined_envs` awk line, then `envsubst "$defined_envs"`;
    - `docker-entrypoint.sh`: `set -e`, a `sort -V` loop, `*.sh` run only when `-x`, then `exec "$@"`.
  - **GitHub images.** `nginx/docker-nginx-unprivileged` Dockerfile: UID 101, `chown` of `/var/cache/nginx` and `/etc/nginx` only, `EXPOSE 8080`, `USER $UID` and `STOPSIGNAL SIGQUIT`. `docker-library/docs` nginx: write access to `/var/cache/nginx` and `/var/run`.
  - **`spring-boot` `v4.1.1`.**
    - `ServerProperties`: `Shutdown.GRACEFUL`, and `ForwardHeadersStrategy` `NATIVE`/`FRAMEWORK`/`NONE` with no field default;
    - `how-to/webserver.adoc` 505-515: a cloud platform gets `NATIVE`, "In all other instances, it defaults to NONE", the automatic `RemoteIpValve`, and the `internal-proxies` text;
    - `TomcatServerProperties.Remoteip`: private-range defaults;
    - `LifecycleProperties`: 30 s;
    - `graceful-shutdown.adoc`: the earliest phase, and stopping acceptance at the network layer;
    - `actuator/endpoints.adoc`: "automatically enabled", `REFUSING_TRAFFIC`, "New requests are rejected", and `/livez` and `/readyz` with `add-additional-paths`;
    - `AvailabilityProbesAutoConfiguration`: `@ConditionalOnClass` and the probes property, `matchIfMissing = true`;
    - health configuration metadata: `probes.enabled` true and `add-additional-paths` false;
    - `TracingProperties`: probability `0.10f`, produce `W3C`, and consume W3C, B3 and B3 multi;
    - `actuator/tracing.adoc`: the 10% sentence, and `traceId`/`spanId` in the MDC;
    - `dockerfiles.adoc` and its partial;
    - `web/servlet.adoc` 213: the welcome page "only acts as a fallback for actual index routes defined by the application".
  - **`spring-framework` `v7.0.9`.** The `ForwardedHeaderFilter` javadoc: "An application cannot know…" and "drop forwarded headers from the outside".
  - **`spring-cloud-gateway` `v5.0.3`.** The starters page: "works with traditional Servlet runtimes such as Tomcat and Jetty" and "It does not work in a traditional Servlet Container or when built as a WAR". The glossary: a route is predicates plus filters. `GatewayMvcProperties`: the `PREFIX` `spring.cloud.gateway.server.webmvc` and `routes`.
  - **w3.org.** Trace Context Level 1 (Recommendation, 23 November 2021):
    - §3.2.2 grammar (`HEXDIGLC`; version `ff` invalid);
    - §3.2.2.3 and §3.2.2.4 "MUST ignore";
    - §3.2.2.5 "recommendations given by the caller";
    - §3.2.2.5.1 "Security considerations SHOULD be applied…";
    - §3.2.4 higher versions (under 55 characters, "end of the string or a dash");
    - Conformance (examples and notes are non-normative).
  - **fetch.spec.whatwg.org.** §2.2.2 CORS-safelisted request-header.
  - **openfeature.dev.** The specification, requirements 1.4.8, 1.4.9 and 1.4.10.
  - **`npm pack`** (extracted, read, deleted):
    - `@openfeature/web-sdk@1.10.0`: `setProviderAndWait` overloads, `setContext`, `getBooleanValue`, `InMemoryProvider` `@deprecated`, `onContextChange` → RECONCILING, and the README's "evaluate flags only after the provider is ready";
    - `@openfeature/angular-sdk@1.3.2`: no `signal(` or `computed(`, the `[booleanFeatureFlag]` selector, and `@deprecated Use provideOpenFeature`;
    - `@opentelemetry/sdk-trace-web@2.12.0`: `register()` defaults, `StackContextManager`, and peer API `<1.10.0`;
    - `@opentelemetry/instrumentation-fetch@0.300.0`: the README's "is deprecated";
    - `@opentelemetry/context-zone@3.0.0` and `@opentelemetry/core@3.0.0`: `urlMatches`;
    - `@opentelemetry/web-common`: `shouldPropagateTraceHeaders`;
    - `@sentry/browser@11.8.0`: `request.d.ts`, `request.js` `shouldAttachHeaders`, and `browserTracingIntegration.js`;
    - `@sentry/core@11.8.0`: `propagateTraceparent` `@default false`;
    - `@sentry/cli@3.8.2`: the debug ID comment;
    - `web-vitals@6.2.3`: `onCLS`, `onINP`, `onLCP` and `MetricType`.
  - **developer.mozilla.org.** `Navigator.sendBeacon` (Baseline since April 2018, 64 KiB, `visibilitychange`, and `unload`/`pagehide` unreliable and incompatible with bfcache), CSP `frame-ancestors` (January 2018, not in `<meta>`), and `Reporting-Endpoints` (Baseline 2024, newly available).
  - **`nodejs/node` `v24.22.1`.** `src/node.cc` `SignalExit`: `ResetStdio`, then `raise`, for SIGTERM.
- **Basis of each finding:** a framework source or docs page at its release tag; a package source at its version; nginx.org, Docker, W3C, WHATWG, OpenFeature or MDN pages read on the date above; a committed test or deploy file; or a read-only script.
- **Not re-read.** Their basis is the SEC/EX/QB LOG lines and SOURCES.md:
  - Angular 22 internals (`provideAppInitializer`, `HttpClient` interceptors);
  - the Node image's `docker-entrypoint.sh`;
  - `ngx_brotli`'s README;
  - the owners' texts in 05, 08, 09, 12, 16, 30-34, 37, 38, 41-43.
- **Not run:** the mermaid diagrams were not re-parsed, and `tsc` was not run.
- **Probe files:** none in the repository. Sources, tarballs and read-only search scripts lived in the job tmp dir above, which was deleted. The reviewer created only this file and edited `_meta/TASKS.md`.

Overall, this is an accurate module. Every Nginx, Docker, image, Spring Boot, Spring Framework and Spring Cloud Gateway claim sampled traces to the named page or file at its tag or date. That includes the facts with recent version gates:
- `proxy_http_version` 1.1 since 1.29.7;
- `add_header_inherit` since 1.29.3;
- predicate locations at 1.31.5.

**Direction facts.** Every one re-read matches. These are the `location` order, the `proxy_pass` URI rule, the shutdown order, `traceparent` parsing and the propagator defaults.

**Capability claims.** Each sits on the implementation that has it:
- Brotli only with `ngx_brotli`;
- `gzip_static` not built by default;
- Sentry's `propagateTraceparent` default `false`;
- no signals in `@openfeature/angular-sdk` 1.3.2;
- no precompression in the Angular builder.

**Markup and labs.** There are no Java fences, and every YAML fence opens "# Illustrative, not run". Every deploy-file fence and deploy file carries its "documented only" line, and no sentence claims a container or Nginx ran. Every lab header names its model as ours. No test reads the clock, opens a socket or spawns a process. Q44.05, Q44.10 and Q44.20 equal their assertions.

**Findings.** There is no Major finding. The REVIEW-M43 patterns recur only lightly. Four Full explanations route to owners or tests without saying what happens (T-1). Three misconceptions correct thinly (T-2). Two follow-ups answer without the reason (T-4). No Code step lacks an approach.
- **Four Minor factual findings:**
  - F-1: Q44.21's trap denies Nginx tracing outright, but `ngx_otel_module` does trace.
  - F-2: §6 calls `HEALTHCHECK` "liveness", which implies a restart.
  - F-3: §5 says the template step replaces only `${NAME}` forms.
  - F-4: Q44.19's "`sentry-trace` same-origin only" omits its condition.
- **Four Minor teaching findings:**
  - T-1: bare Full explanations.
  - T-2: thin misconceptions.
  - T-3: lesson 17's "no SPA fallback in Spring Boot" is absent.
  - T-4: two follow-ups without their reason.
- **Ten nits**, and the anchor handoffs (31 rows).

**Items left to this review by earlier sessions, settled:**
- **Q44.19, "`sentry-trace` same-origin only" (CLOSE-M44 LOG open point):** true by default, and the fix states the condition (F-4).
  - `@sentry/browser` 11.8.0 `request.d.ts` documents that "by default, tracing headers will only be attached to outgoing requests to the same origin".
  - `request.js` `shouldAttachHeaders` returns `isSameOriginRequest` when `tracePropagationTargets` is unset.
  - `browserTracingIntegration` passes `client.getOptions().tracePropagationTargets`, so setting the option widens it.
- **C9, probe enablement:** resolved as SEC-M44-06 wrote it.
  - The probes are on by default: `AvailabilityProbesAutoConfiguration` has `matchIfMissing = true`, and the metadata has `probes.enabled` true.
  - The `endpoints.adoc` prose still reads as if probes depended on Kubernetes ("automatically enabled" on a cloud platform). The source is not conditional, which is For Jorge 3.
- **Node as PID 1 ignores SIGTERM without a handler (§6, Q44.11):** stands. Node's own default SIGTERM path (`node.cc` `SignalExit`) resets stdio and re-raises the signal, and as PID 1 the re-raised default-action signal is ignored (docker run docs). This is the reviewer's reading of two sources together; no kernel source was read.

**Plan facts found wrong or superseded:** none new. F12's correction (both `$NAME` and `${NAME}` are substituted) is in M44.md but not fully carried into §5 (F-3).

**Prose:** 9,585 words now (`module-stats.mjs`, main's run; the QUALITY-BAR python counter, re-run read-only, agrees). The fixes add about +215, for about 9,800. That is under the REVIEW ceiling of 9,850 and the hard cap of 10,000.

## Runs (main session, Node 24, 2026-10-22; the reviewer ran none)

- `labs/ts-js`: `npx vitest run 44`: 13 files, 56/56 passed. This includes `q44-05`, `q44-10` and `q44-20.test.ts`.
- `labs/angular`: `npx ng test --watch=false --include 'src/app/modules/44-fullstack-delivery-and-operations/**/*.spec.ts'`: 3 files, 28/28 passed.
- `node labs/tools/check-links.mjs --planned`: 0 broken.
- `node labs/tools/check-snippets.mjs . 44`: OK.
- `node labs/tools/module-stats.mjs`: 44 = 21 Q, 3 Ex, 9,585 prose words, no flag.

No lab or deploy file change is requested; every finding is a Markdown text change. N-6 and N-7 edit fences, so the FIX tasks re-run `check-snippets`. The anchor work adds links, so they re-run `check-links`.

## Reviewer's read-only script results

- **Markup:**
  - B1: 10 of each of the six subsections, 10 `mermaid` fences and 10 "What to notice" lines.
  - D1: 21 of each answer part.
  - Every best-practice bullet has "because", and 43 misconceptions carry 43 "Cause:".
  - `Unverified`, `relink:`, `TASK` and `PLACEHOLDER`: 0.
- **Banners:** there are no Java fences. Every YAML fence's first line is "# Illustrative, not run". Every deploy-file fence starts with the "documented only" comment.
- **Deploy files:** each has its first comment line, except two:
  - `40-write-config.sh` has its shebang first and the comment second;
  - `config.json.template` is JSON and has no comment, which is acceptable because JSON has no comment syntax and §5 names it documented only.
- **Status markers:** 3, all from dated MDN reads that match today: `frame-ancestors` [Baseline 2018], `Reporting-Endpoints` [Baseline 2024 newly] and `sendBeacon` [Baseline 2018]. None is on an Nginx, Docker, Spring, OpenTelemetry, OpenFeature, Sentry, `web-vitals`, W3C or WHATWG fact (C19).
- **Cited tests:** every backticked title exists verbatim in the module-44 labs. The "the N `Section k:` cases" counts equal the `it(` counts: 4, 4, 6, 4, 4, 5, 4, 5, 4 (angular §9) and 5. Exercises 44.1-44.3 have 18 of 18 criteria equal to their `it(…)` titles, each file under `describe.each`.
- **Determinism (C21):** no `Date.now`, `new Date()`, `performance.now`, `process.env`, `child_process`, `net`, `http.createServer` or real `fetch` in any test. `Math.random` appears only as the production default of injected token factories. Deploy files are read with `readFileSync` relative to the test file.
- **Spec quotes:** every W3C MUST/SHOULD quote sits at its cited normative section (§3.2.2.3, §3.2.2.4, §3.2.2.5, §3.2.2.5.1, §3.2.4). The `traceparent` example is tagged non-normative. Fetch's safelist is cited at §2.2.2.
- **D6:** all 21 question IDs are linked from the body.
- **External URLs:** the only non-example URL is the MDN Baseline glossary, which is in SOURCES.md. Hosts like `app.example.com` and `api.example.com` are example hosts inside fences.

## QUALITY-BAR

45 items: **39 Pass, 6 Partial (B7, B9, B10, C1, D1, F4), 0 Fail.** H1-H3 rest on the main session.

| ID | Result | Evidence |
|---|---|---|
| A1 | Pass | Lines 3-9 in order, with run commands for both labs. |
| A2 | Pass | 32 §9, 41 §1, 41 §4, 12 §4, 09 §4, 37 §11, 38 §11 and 42 §3 are anchored. |
| A3 | Pass | §1, §2, §7; Q44.01, .08, .13, .14, .19; Summary. |
| A4 | Pass | 10 sections and the five closing parts. |
| A5 | Pass | Topology → image → static Nginx → proxy → runtime config → SSR container → CI/CD → flags → RUM → tracing. |
| B1 | Pass | 10 × 6 (script). |
| B2 | Pass | Concrete failures in each: a CORS preflight on every call, `npm ci` on every edit, a 404 on `/orders/42`, `http://` redirects behind TLS, a rebuild per environment, a 10-second kill, a different image in production, a stale chunk after a canary, a minified stack, a trace that stops at the browser. |
| B3 | Pass | 10 diagrams of the planned types, each with "What to notice" (not re-parsed). |
| B4 | Pass | Each "How it actually works" answers a "why" from a named page or file, for example `location` precedence, the template step's `defined_envs`, PID 1's default-action rule and `ForwardHeadersStrategy`. |
| B5 | Pass | Every `### Code` has numbered steps with an approach. |
| B6 | Pass | "because" on every item. |
| B7 | Partial | Three corrections are too thin (§2 multi-stage, §5 `envsubst`, §10 `instrumentation-fetch`) and one is imprecise (§9 `unload`) (T-2, N-10). |
| B8 | Pass | "Coming from the backend" in §1, §4, §6, §7 and §10, each with "Where the analogy breaks" ("Where it breaks" in §7 and §10); "Framework vs platform" in §3, §5 and §10. |
| B9 | Partial | Terms are defined at first use (reverse proxy, BFF, layer, `location`, variable filter, PID 1, grace period, evaluation context, sticky bucket, release, sampled flag …). Tomcat's `internal-proxies` appears in Q44.08 undefined and unattributed (T-4). |
| B10 | Partial | Owners get a sentence and a link, with two exceptions: Q44.07's "§4's read-timeout sentence" and §9's "37 §11 answers" are plain text, not links (N-2, N-3). |
| C1 | Partial | 40 of 45 sampled claims match; see F-1 to F-4, plus one absent planned fact (T-3). |
| C2 | Pass | The printed lines in Q44.05, Q44.10 and Q44.20 equal their assertions (module-specific checks). |
| C3 | Pass | Every cited test exists, and every "our model" result has a test. Nginx, Docker and Spring facts are "documented only" or "read". |
| C4 | Pass | Three MDN markers; none on non-browser facts. |
| C5 | Pass | The Angular names (`provideAppInitializer`, `HttpInterceptorFn`, `ErrorHandler`, `inject`) exist in 22.2.1 and compile in labs. Spring property names exist at v4.1.1, and the OpenFeature, OpenTelemetry, Sentry and `web-vitals` names exist in their tarballs. |
| C6 | Pass | 0 `Unverified`. |
| C7 | Pass | `check-snippets` passes (main's run). Q44.05's snippet calls `log(` where STYLE-GUIDE §7.2 shows `console.log` (N-6, a nit; counted Pass). |
| C8 | Pass | The external URL is in SOURCES.md, and FIX-M44-01 adds three re-read notes. |
| D1 | Partial | 21 × 5 parts and at least 2 follow-ups everywhere. Four Full explanations only route to owners or tests (T-1), and two follow-ups give no reason (T-4). |
| D2 | Pass | Q44.05, Q44.10 and Q44.20 give the lines and their reasoning. |
| D3 | Pass | 6 tags, with the largest at most 29%. |
| D4 | Pass | Q44.01-21 follow the sections. |
| D5 | Pass | The listed owner questions are linked or untouched, and none is re-asked. Q44.18 asks the release and sampling pipeline and links Q37.22; Q44.07 asks the proxy timeout and links Q43.07; Q44.12 asks configuration at container start and links Q12.10 and Q12.18. |
| D6 | Pass | 21/21 linked from the body. |
| D7 | Pass | 21 anchors. |
| D8 | Pass | 21 ≤ 24, ≥ 15. |
| E1 | Pass | Full anatomy in all three, with 2 answered follow-ups each. |
| E2 | Pass | 18/18 criteria equal their titles. |
| E3 | Pass | Release publisher (ts-js) → trace correlation → feature flags in a zoneless app. |
| E4 | Pass | Main's runs; no `any`. |
| E5 | Pass | Q44.05, Q44.10, Q44.20. |
| F1 | Pass | Two paragraphs, all ten sections linked, no new fact. |
| F2 | Pass | Three prompts. |
| F3 | Pass | Five flashcards. Flashcard 1 points at §3, the canonical `location` statement (lesson 19). |
| F4 | Partial | "Builds on" lists eight links with no reason each (N-9). Read next, Uses later and Comparisons give reasons. |
| G1 | Pass | 9,585 ≤ 9,585 (the CLOSE count); about 9,800 after fixes, ≤ 9,850. |
| G2 | Pass | 7/7 SYLLABUS §4 (44) checkboxes mapped (M44.md breadth gate, re-walked against the headings). |
| H1 | Pass (main) | Main's runs above. |
| H2 | Pass (main) | `check-links --planned` 0. |
| H3 | Pass (main) | Main checks `git status`. |

Totals: **39 Pass, 6 Partial (B7, B9, B10, C1, D1, F4), 0 Fail.**

## Module-specific checks

| Check | Result | Evidence |
|---|---|---|
| At least eight Nginx claims re-read | Pass, one finding | All twelve listed were re-read and all match: `location` precedence, `try_files`'s last parameter, the `add_header` status list, inheritance and `always`, `add_header_inherit` 1.29.3, the `gzip_types` default, `gzip_static` not built by default, the `proxy_pass` URI rule, `Host`/`Connection` not passed, `proxy_http_version` 1.1 since 1.29.7, `proxy_read_timeout` between two reads, and `X-Accel-Buffering`. Q44.21's trap denies the separate `ngx_otel_module` (F-1). |
| Docker and image claims | Pass, two findings | Shell form and signals, PID 1's default-action rule, `--init`, `STOPSIGNAL`, the HEALTHCHECK defaults, the 10-second grace period, the cache rule and the unprivileged image all match. Calling `HEALTHCHECK` "liveness" implies a restart Docker does not do (F-2). The template step's variable selection matches, but "`${NAME}` names" omits the `$NAME` form (F-3; the M44 F12 correction). |
| Spring Boot, Framework and Cloud claims to their tags | Pass, one finding | These match: the forward-headers strategies and `NONE` outside a cloud platform; the `ForwardedHeaderFilter` warning; `GRACEFUL` and 30 s; `REFUSING_TRAFFIC`; probes on by default (C9); 10% sampling; produce `W3C` and consume W3C/B3/B3 multi; MDC correlation; the layered-jar Dockerfile; and the Gateway Server Web MVC prefix and Servlet-only starter. "No SPA fallback" is true at `servlet.adoc` 213 but absent from the module (T-3). |
| Direction facts (lesson 16) | Pass | All match: the `location` order (exact → longest prefix, `^~` stops → regex in order → remembered prefix), the `proxy_pass` URI replacement direction, the shutdown order (readiness to `REFUSING_TRAFFIC`, then stop accepting, then drain, then the phase timeout), extract-then-inject for `traceparent`, and same-origin-or-listed for OpenTelemetry headers. |
| Capability per implementation (lesson 17) | Partial | Brotli (`ngx_brotli` only), `gzip_static` (not built by default), Sentry's headers (`propagateTraceparent` false; F-4 adds the condition), the Angular OpenFeature SDK (no signals) and the Angular builder (no precompression) are all present and match. Spring Boot's lack of an SPA fallback is missing (T-3). |
| W3C and WHATWG MUST/SHOULD with section | Pass | See the script results above. |
| Java banners; YAML illustrative | Pass | No Java fences. YAML fences open "# Illustrative, not run", and every property was read at v4.1.1 or v5.0.3. |
| Deploy files documented only | Pass | Script above; no sentence says a container was built or run. |
| OpenTelemetry, OpenFeature, Sentry, `web-vitals` "read, not run" vs tarballs | Pass | Each is labelled. All match: `register()` defaults, peer API range, `instrumentation-fetch` deprecation, `context-zone` bundling zone.js, `setProviderAndWait`, `TypedInMemoryProvider`, RECONCILING, the angular-sdk directive selectors, Sentry's `propagateTraceparent` and debug IDs, and the `web-vitals` 6.2.3 names. |
| Q44.05, Q44.10, Q44.20 against their tests | Pass | Five, four and four lines equal `q44-05`, `q44-10` and `q44-20.test.ts`; main's runs pass. |
| REVIEW-M43 T-1/T-2 patterns | Partial | Recurrences: 4 bare Full explanations and 2 follow-ups without a reason (T-1, T-4); 3 thin misconceptions (T-2); 0 Code steps without an approach. |
| "Must state" facts present or moved as CLOSE recorded | Partial | All present except lesson 17's "no SPA fallback in Spring Boot" (F31, M44 For Jorge 4h), which is absent (T-3). |
| Canonical statements (lesson 19) | Pass | `location` precedence only in §3; the URI rule and 60 s only in §4 (Q44.07 points back by text, N-2); the shutdown order only in §6; the `traceparent` format and 10% only in §10. Other places link these. |
| Our models and fakes named as ours (C20) | Pass | Every lab header says "Our model" or "Our code". The prose says "our `nginx-model.ts`", "our resolver", "our location model" and "our bucketer". |
| No Angular-style marker on non-Angular facts (C19) | Pass | Script above. |
| No real connection, clock, process or network (C21) | Pass | Script above. |
| Handoffs into 44 honored | Pass | 05 (version skew, §8), 09 (headers delivered, §3; CSP `frame-ancestors`, §3), 12 (runtime config, §5), 30 (e2e against staging, §7), 31 (budgets in the image build, §3), 32 (SSR containers, §6), 33 (SRI and lockfile in CI, §7), 34 (precompression, §3), 37 (the pipeline behind the reporter, §9), 38 (the deploy step of the pipeline, §7), 39 (preview deploys, §7), 41 (gateways and contract versions, §1 and §7), 42 (the BFF topology, §1) and 43 (SSE through the proxy, §4) are all honored. |
| Owners' questions not re-asked | Pass | See the D5 row. |
| Prose ≤ 9,850 after fixes | Pass | About 9,800. |

## Handoffs

Module 44 slugs, from the `## N.` headings as in Contents:
- S1 `#1-where-the-api-calls-go-direct-calls-a-same-origin-reverse-proxy-an-api-gateway-or-a-backend-for-frontend`
- S3 `#3-nginx-for-a-single-page-app-location-matching-the-try_files-fallback-caching-headers-for-hashed-assets-and-gzip-or-brotli`
- S4 `#4-nginx-as-the-reverse-proxy-proxy_pass-forwarded-headers-into-spring-boot-and-sse-or-websocket-connections-through-the-proxy`
- S5 `#5-runtime-configuration-without-rebuilding-configjson-environment-substitution-at-container-start-and-provideappinitializer`
- S6 `#6-serving-ssr-apps-in-containers-the-node-server-as-pid-1-graceful-shutdown-health-probes-and-what-nginx-or-a-cdn-still-serves`
- S7 `#7-cicd-for-both-layers-one-image-promoted-through-stages-a-monorepo-or-separate-repositories-and-versioning-the-contract`
- S8 `#8-feature-flags-with-openfeature-and-canary-releases-providers-evaluation-context-sticky-rollout-kill-switches-and-version-skew`
- S9 `#9-frontend-error-tracking-and-real-user-monitoring-releases-source-maps-beacons-and-sampling`

The links were re-located on 2026-10-22. Every row below has exactly one link to `44-fullstack-delivery-and-operations.md` on its line. Today, 0 links into 44 from other modules carry an anchor.

| Target | Links (module:line), 31 rows, +0 words |
|---|---|
| S1 | 09:367, 41:69, 41:1398 ("gateways: [44]"), 42:447, 42:2124 |
| S3 | 09:266, 09:893, 31:514, 33:1867, 33:2128, 34:568, 34:1943 |
| S4 | 43:427, 43:1273, 43:2008 ("**Read next:** [44]") |
| S5 | 12:328, 12:1015, 12:1053, 12:1637, 38:601 |
| S6 | 32:2285 |
| S7 | 12:1715, 30:676, 38:836, 38:2040, 39:1947, 41:350 |
| S8 | 05:893 ("the page's chunk names belong to the old build ([module 44]") |
| S9 | 37:897, 37:1739, 37:2105 |

Each link keeps its text; only the target gains the slug. A fixer finds each line by its link and nearby text. Line numbers are as of this review.

The following stay file-level:
- the `:5` header lines of 12, 30, 32, 33, 34, 37, 38, 39, 41, 42 and 43;
- the "Uses these ideas later" and whole-module lines 09:1606, 12:1861, 30:1704, 31:2013, 32:2286, 33:2129, 34:1944, 37:2106, 38:2041, 39:1948, 41:2047 and 43:2009.

## Factual findings

**F-1 · Minor (C1; capability per implementation) · Q44.21 trap (1750).**
- The trap reads: "**Trap to avoid.** \"Nginx adds a span\": it only logs and proxies, because no tracer runs there."
- In the lab's setup that is right. As a general rule it is wrong. nginx.org `ngx_otel_module` (read 2026-10-22) "provides OpenTelemetry distributed tracing support", ships as the `nginx-module-otel` package since 1.25.3, and with `otel_trace_context` can extract, inject and propagate `traceparent`. M44.md F2 also lists the image's `otel` variant.
- Fix: "it only logs and proxies, because no tracer runs there." → "here it only logs and proxies, because no tracer runs there; the separate `ngx_otel_module` (packaged as `nginx-module-otel`) would." (+12)
- SOURCES.md `## Module 44 · Full-stack delivery and operations`: append at the end of the section "- nginx.org, https://nginx.org/en/docs/ngx_otel_module.html, read 2026-10-22: OpenTelemetry tracing, the `nginx-module-otel` package (1.25.3+), `otel_trace_context` extract/inject/propagate; Q44.21 trap (REVIEW-M44 F-1)."

**F-2 · Minor (C1) · §6 How it actually works (648).**
- The text reads: "`HEALTHCHECK` is Docker's liveness check."
- The Dockerfile reference (read 2026-10-22) says `HEALTHCHECK` only sets the container's health status to `healthy` or `unhealthy`. Docker itself restarts nothing on that status. The same bullet defines a liveness probe as "restart?", so the sentence teaches a restart that does not happen.
- Fix: "`HEALTHCHECK` is Docker's liveness check." → "`HEALTHCHECK` only marks a container `unhealthy` (Dockerfile reference); restarting it is an orchestrator's call." (+8)

**F-3 · Minor (C1; M44 F12 correction) · §5 How it actually works (524).**
- The text reads: "replaces only the `${NAME}` names the script lists:".
- `20-envsubst-on-templates.sh` builds `defined_envs` as `${NAME}` strings and passes them to `envsubst "$defined_envs"`. GNU `envsubst` then substitutes each listed variable in both its `$NAME` and `${NAME}` forms. M44.md's F12 correction already says so, so a template that writes `$API_ORIGIN` is replaced too.
- Fix: "replaces only the `${NAME}` names the script lists:" → "replaces only the names the script lists, as `$NAME` or `${NAME}`:" (+3)

**F-4 · Minor (C1; CLOSE-M44 open point) · Q44.19 Full explanation (1689).**
- The text reads: "and `sentry-trace` same-origin only (read;".
- This is true only by default (settled above). With `tracePropagationTargets` set, Sentry attaches `sentry-trace` and `baggage` to every matching URL.
- Fix: "and `sentry-trace` same-origin only (read;" → "and, without `tracePropagationTargets`, attaches `sentry-trace` to same-origin requests only (`request.js` `shouldAttachHeaders`, read;" (+7)
- SOURCES.md `## Module 44`: append at the end of the section "- `@sentry/browser@11.8.0` (`npm pack`, read 2026-10-22, deleted after), `build/npm/esm/prod/tracing/request.js` `shouldAttachHeaders` (without `tracePropagationTargets` it returns `isSameOriginRequest`) and `build/npm/esm/prod/tracing/browserTracingIntegration.js` (passes `client.getOptions().tracePropagationTargets`); `build/npm/types/tracing/request.d.ts` (\"by default, tracing headers will only be attached to outgoing requests to the same origin\"); Q44.19 (REVIEW-M44 F-4)."

## Teaching findings

**T-1 · Minor (STYLE-GUIDE §2; QUALITY-BAR D1) · Full explanations that only route to owners or tests.** Each replacement prepends one or two sentences and keeps the existing text and links. Find each by its quoted text.
- **Q44.01 (1310).** "**Full explanation.** Our `Section 1:` tests assert it" → "**Full explanation.** One origin means no preflight; a gateway applies routing, TLS and limits to every client; a BFF aggregates three reads into one browser round trip. Our `Section 1:` tests assert it" (+27)
- **Q44.08 (1475).** "**Full explanation.** Our resolver trusts only listed peers" → "**Full explanation.** With `NATIVE`, Tomcat's automatic `RemoteIpValve` rewrites scheme, host and client address; with `FRAMEWORK`, `ForwardedHeaderFilter` wraps the request (`webserver.adoc`, `v4.1.1`). Our resolver trusts only listed peers" (+25)
- **Q44.13 (1581).** "**Full explanation.** Stages and previews are" → "**Full explanation.** Production deploys `image@sha256:…` from the build job, the bytes staging tested; a contract change runs both pipelines. Stages and previews are" (+17)
- **Q44.14 (1599).** "**Full explanation.** The wider choice is" → "**Full explanation.** One repository changes the description, API and client in one reviewed pull request; two publish a versioned description or client, and each side tests the versions it supports. The wider choice is" (+27)

**T-2 · Minor (B7, STYLE-GUIDE §4.2.7) · corrections that do not correct the myth.**
- **§2 (244).** "Only a lockfile change reruns `npm ci`." → "The runtime stage only copies files, and only a lockfile change reruns `npm ci`." (+8)
- **§5 (601).** "Only run bare, with no list. Cause: the advice is to run it by hand." → "Only run bare, with no list; the image's step lists names. Cause: run by hand without a list, it blanks `$uri`." (+6)
- **§10 (1288).** "- \"Once true: `@opentelemetry/instrumentation-fetch`. Now: its README says \"is deprecated\".\" Cause: tutorials use it." → "- \"Once true: `@opentelemetry/instrumentation-fetch` was the way to trace `fetch`. Now: its README says it \"is deprecated\".\" Cause: tutorials still use it." (+8)

**T-3 · Minor (lesson 17 capability claim; F31; M44 For Jorge 4h; "Must state") · "no SPA fallback in Spring Boot" is absent.**
- Serving the Angular build from Spring Boot's `static/` is the obvious alternative a backend interviewer raises. Boot's welcome page "only acts as a fallback for actual index routes defined by the application" (`spring-boot` `v4.1.1` `reference/pages/web/servlet.adoc` 213). A deep link like `/orders/42` therefore finds no file. The path-filters follow-up it replaces is already covered by Q44.14's trap.
- Fix (Q44.14): "- *Why path filters?* Because an unrelated change must not redeploy the other layer." → "- *Serve the build from Spring Boot's `static/`?* It works, but unknown routes such as `/orders/42` find no file, because Boot has no SPA fallback: its welcome page \"only acts as a fallback for actual index routes\" (`servlet.adoc`, `v4.1.1`)." (+19)
- SOURCES.md `## Module 44`: append at the end of the section "- `spring-projects/spring-boot` `v4.1.1` `documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/web/servlet.adoc` (line 213: the welcome page \"only acts as a fallback for actual index routes defined by the application\"), read 2026-10-22, Q44.14 follow-up (REVIEW-M44 T-3)."

**T-4 · Minor (D1, B9) · follow-ups without their reason.**
- **Q44.08 (1478).** "- *Why do `internal-proxies` default to private ranges?* Because only inside addresses can be trusted proxies." → "- *Why does Tomcat's `server.tomcat.remoteip.internal-proxies` default to private ranges?* Because your proxy sits on your network, so a forwarded header from a public address is a client's." (+10; `TomcatServerProperties.Remoteip`, `webserver.adoc`)
- **Q44.19 (1693).** "Because the browser is untrusted." → "Because anyone can send `-01`; §3.2.2.5.1 asks for \"security considerations\" against \"abusive or malicious use of this flag\"." (+12)

**Nits**
- **N-1 (punctuation):** §2 The problem it solves (135). The paren opened before "[12 §4]" is never closed. Fix: "…provideappinitializer)." → "…provideappinitializer))." (0)
- **N-2 (B10, plain-text reference):** Q44.07 (1460). "(§4's read-timeout sentence)" → "`([§4](#4-nginx-as-the-reverse-proxy-proxy_pass-forwarded-headers-into-spring-boot-and-sse-or-websocket-connections-through-the-proxy))`" (−2)
- **N-3 (B10, plain-text reference):** §9 misconception (1145). "37 §11 answers;" → "[37 §11](../../modules/37-elements-pwa-errors-ecosystem.md#11-logging-and-error-tracking-a-reporter-port-context-privacy-source-maps-and-sampling) answers;" (0)
- **N-4 (precision):** Q44.11 (1545). "the generated `server.ts` has none (read)" → "the generated `server.ts` has no SIGTERM listener (read)" (+3)
- **N-5 (citation):** §8 (955). "(specification 1.4.10)" → "(specification 1.4.8-1.4.10)". The error code is 1.4.8 (MUST), the `ERROR` reason 1.4.9 (SHOULD), and the default value with no throw 1.4.10. (0)
- **N-6 (STYLE-GUIDE §7.2):** the Q44.05 Output snippet (1401) uses "  log(uri, '→'," → "  console.log(uri, '→',". The test captures `console.log` through `captureLogs`. (code, 0)
- **N-7 (YAML completeness):** §7 workflow (848-858). The `staging` and `production` jobs run `./deploy.sh` with no checkout, so the script is not on the runner. In each of those two jobs, insert "      - uses: actions/checkout@v7" as the first line under `steps:`. (code, 0)
- **N-8 (quote):** Q44.08 (1479). "the filter \"cannot know\" who added them" → "the filter's javadoc: \"an application cannot know\" who added them" (+2; `ForwardedHeaderFilter`, v7.0.9)
- **N-9 (F4):** Connections, Builds on (1982). Add a short reason after each link group:
  - `[32 §9](…)` → `[32 §9](…) (shipping SSR)`;
  - `[41 §4](…)` → `[41 §4](…) (CORS, contract changes)`;
  - `[12 §4](…)` → `[12 §4](…) (run-time configuration)`;
  - `[09 §4](…)` → `[09 §4](…) (header choice)`;
  - `[37 §11](…)` → `[37 §11](…) (the reporter)`;
  - `[38 §11](…)` → `[38 §11](…) (the pipeline)`;
  - `[42 §3](…)` → `[42 §3](…) (the BFF)`.
  
  The link targets are unchanged. (+16)
- **N-10 (B7 precision):** §9 misconception (1144). "It disables the bfcache." → "It is unreliable and incompatible with the bfcache." (MDN `sendBeacon`; +3)

## Judged acceptable

- **Flashcard 1 points at §3**, not at the question, because §3 is the canonical `location` statement (lesson 19).
- **The gateway "filters treat every match alike" (§1)** is an inference from the Gateway glossary (a route is predicates plus filters, applied to every matching request). It is fair as stated.
- **Node as PID 1 (§6, Q44.11):** see the settled items above. The outcome claim rests on the Node source plus the docker run text, not on a kernel source.
- **Q44.18 against Q37.22:** Q44.18 asks for the release, map upload and sampling pipeline and links Q37.22 for the reporter port, so it does not re-ask Q37.22.
- **Q44.03 repeats §2's Dockerfile:** it asks the reader to read the stages and the cache, and the repetition is the question.
- **The `^~ /ws` prefix also matches `/wsx`:** it is harmless in the lab's routes, and §3 states the prefix rule.
- **Short Full explanations in Output questions:** they cite the test and the mechanism, and the lines carry the reasoning.
- **A `00` header with an extra field (§10, Exercise 44.2):** our parser rejects it. §3.2.2 defines version `00` as exactly four fields, and only §3.2.4 (higher versions) allows a dash and more. This matches.

## Claims sampled (45)

| # | Claim (location) | Basis | Result |
|---|---|---|---|
| 1 | Exact, then longest prefix (`^~` stops), then regex in order, then remembered prefix (§3) | `ngx_http_core_module` `location` | Match |
| 2 | `try_files`'s last parameter is a URI or `=code` (§3) | `ngx_http_core_module` `try_files` | Match |
| 3 | `add_header` only on listed statuses unless `always` (§3) | `ngx_http_headers_module` | Match |
| 4 | Inherited only if the level has none; `add_header_inherit` 1.29.3 (§3, Q44.06) | same; CHANGES 1.29.3 | Match |
| 5 | `expires` writes `max-age`/`no-cache` only (§3) | `expires` | Match |
| 6 | `gzip_types` default `text/html` (§3) | `ngx_http_gzip_module` | Match |
| 7 | `gzip_static` not built by default; `always` (§3, Q44.04) | `ngx_http_gzip_static_module` | Match |
| 8 | Brotli only with `ngx_brotli` (§3) | M44 F-row; nginx.org has no brotli module | Match |
| 9 | `proxy_pass` with a URI replaces the matched prefix; no URI in a regex location (§4, Q44.07) | `ngx_http_proxy_module` `proxy_pass` | Match |
| 10 | `Host` and `Connection` not passed; defaults `$proxy_host`, `close` (§4) | `proxy_set_header` | Match |
| 11 | `proxy_http_version` 1.1 since 1.29.7 (§4) | `proxy_http_version`; CHANGES 1.29.7 | Match |
| 12 | Read timeout between two reads, 60 s; `X-Accel-Buffering` (§4, Q44.07) | `proxy_read_timeout`; `websocket.html` | Match |
| 13 | Upgrade and Connection are hop-by-hop (§4) | `websocket.html` | Match |
| 14 | `split_clients` MurmurHash2 (§8) | `ngx_http_split_clients_module` | Match |
| 15 | Nginx adds no span (Q44.21 trap) | `ngx_otel_module` | Overstated (F-1) |
| 16 | Shell form passes no signals (§6) | Dockerfile reference | Match |
| 17 | PID 1 ignores default-action signals; `--init` forwards and reaps (§6, Q44.11) | docker run | Match |
| 18 | `STOPSIGNAL` SIGTERM; 10 s grace (§6, Q44.11) | Dockerfile reference; docker stop | Match |
| 19 | HEALTHCHECK defaults 30s/30s/0s/5s/3 (§6) | Dockerfile reference | Match |
| 20 | HEALTHCHECK as liveness (§6) | Dockerfile reference | Imprecise (F-2) |
| 21 | Cache: a changed layer invalidates the rest; mtime ignored (§2) | build cache docs | Match |
| 22 | Dockerfile-specific `.dockerignore` wins (§2) | build context docs | Match |
| 23 | Unprivileged image: UID 101, 8080, SIGQUIT, writable dirs (§2) | `docker-nginx-unprivileged` Dockerfile; docs nginx | Match |
| 24 | Template step lists defined variables matching the filter (§5, Q44.12) | `20-envsubst-on-templates.sh` | Match |
| 25 | Only `${NAME}` forms replaced (§5) | GNU `envsubst` with a list; M44 F12 | Wording (F-3) |
| 26 | Entrypoint runs `*.sh` in order only if executable, then `exec` (§5) | `docker-entrypoint.sh` | Match |
| 27 | `NATIVE`/`FRAMEWORK`; `NONE` outside a cloud platform (§4, Q44.08) | `ServerProperties`; `webserver.adoc` 505-515 | Match |
| 28 | `ForwardedHeaderFilter` "cannot know"; drop outside headers (§4) | javadoc v7.0.9 | Match (quote N-8) |
| 29 | `GRACEFUL` default; 30 s phase (§6) | `ServerProperties`; `LifecycleProperties` | Match |
| 30 | `REFUSING_TRAFFIC` during shutdown; probes on by default (§6, C9) | `endpoints.adoc`; `AvailabilityProbesAutoConfiguration` | Match |
| 31 | 10% sampling; produce W3C, consume W3C/B3/B3 multi; MDC ids (§10) | `TracingProperties`; `tracing.adoc` | Match |
| 32 | The layered-jar Dockerfile (§2) | `dockerfiles.adoc` | Match |
| 33 | No SPA fallback in Boot (planned F31) | `servlet.adoc` 213 | Absent (T-3) |
| 34 | Gateway Server Web MVC on Servlet; WebFlux not in a Servlet container (§1) | starters page v5.0.3; `GatewayMvcProperties` | Match |
| 35 | `traceparent` grammar, lowercase hex, `ff` invalid; MUST ignore (§10, Q44.20) | Trace Context §3.2.2-§3.2.2.4 | Match |
| 36 | Sampled flag is a recommendation; security considerations (§10, Q44.19) | §3.2.2.5, §3.2.2.5.1 | Match |
| 37 | `register()` → W3C + baggage propagators, `StackContextManager` (§10) | `sdk-trace-web@2.12.0` | Match |
| 38 | OTel headers same-origin always, else the list (§10, Q44.19) | `web-common` `shouldPropagateTraceHeaders`; `core` `urlMatches` | Match |
| 39 | `instrumentation-fetch` deprecated (§10) | README 0.300.0 | Match |
| 40 | Sentry `propagateTraceparent` default false (Q44.19) | `@sentry/core@11.8.0` | Match |
| 41 | `sentry-trace` same-origin only (Q44.19) | `request.js`, `request.d.ts` | True by default (F-4) |
| 42 | OpenFeature: default value, `ERROR` reason, error code, no throw (§8) | spec 1.4.8-1.4.10 | Match (citation N-5) |
| 43 | `setProviderAndWait`, RECONCILING, `TypedInMemoryProvider`; angular-sdk has no signals (§8, Ex 44.3) | `web-sdk@1.10.0`; `angular-sdk@1.3.2` | Match |
| 44 | `sendBeacon` 64 KiB, `visibilitychange`; `frame-ancestors` not in `<meta>`; markers (§3, §9) | MDN pages | Match |
| 45 | Q44.05, Q44.10, Q44.20 values | `q44-05`, `q44-10`, `q44-20.test.ts` | Match |

The table has 40 matches, 4 findings in the module text (F-1 to F-4) and 1 absent planned fact (T-3).

## Proposed FIX tasks

The module is at 9,585 words. The CLOSE limit was 9,585 and the REVIEW ceiling is 9,850. All fixes together add about +215: F about +30, T-1 about +96, T-2 about +22, T-3 about +19, T-4 about +22, nits about +22. The FIX tasks measure the real delta. That gives about 9,800. If a fixer's count passes 9,850, it shortens its own added clauses, never a cause, a "because" or a link.

```
| FIX-M44-01 | S | todo | REVIEW-M44 |  |
| FIX-M44-02 | S | todo | REVIEW-M44 |  |
| FIX-M44-03 | S | todo | REVIEW-M44 |  |
```

- **FIX-M44-01 · S · Sonnet (texts and sources prescribed).** Factual and content fixes F-1..F-4 and T-3, nits N-4, N-5 and N-8, and the three SOURCES notes.
- **FIX-M44-02 · S · Sonnet (texts prescribed).** Teaching fixes T-1, T-2 and T-4, and nits N-1, N-2, N-3, N-6, N-7, N-9 and N-10. It runs after FIX-M44-01, because both touch Q44.08 and Q44.14, on disjoint lines.
- **FIX-M44-03 · S · Sonnet (mechanical; slugs listed).** Anchors for the 31 file-level links into 44. No FIX changes a heading, so it may run in any order.

## For Jorge

1. **Carried from CLOSE-M44, no FIX:** M44.md For Jorge 1 remains open. It is the VERSIONS.md rows for the documented-only delivery stack:
   - nginx 1.31.8 mainline and 1.30.6 stable (download page, 2026-10-22);
   - the nginx and Node images;
   - `@opentelemetry/*`, `@openfeature/*`, `@sentry/*` and `web-vitals` at the versions in F3 and F34.
2. **Nothing Docker or Nginx was run.** Docker is not installed. Every deploy file is checked only as text by our models' tests, so the image build, the template step and the shutdown timing are documented, not observed. A one-off `docker build` on a machine with Docker would close that gap.
3. **Spring docs versus source on probes:** `endpoints.adoc` (v4.1.1) still reads as if liveness and readiness probes were enabled only on Kubernetes. `AvailabilityProbesAutoConfiguration` and the metadata enable them everywhere (`matchIfMissing = true`). The module follows the source. An upstream docs issue may be worth filing.
4. **Two library notes you may want in an interview:**
   - Sentry widens `sentry-trace` beyond same-origin only through `tracePropagationTargets` (F-4).
   - Nginx can itself be a traced hop with `ngx_otel_module` (F-1). The module's lab keeps it as a logging proxy on purpose.
