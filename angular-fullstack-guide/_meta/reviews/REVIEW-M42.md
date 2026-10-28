# REVIEW-M42: `modules/42-fullstack-authentication.md`

- **Reviewer:** a fresh reviewer subagent (claude-opus-5-5) of session S20261021-0748-claudecode. It wrote nothing in module 42, continues none of the PLAN, SEC, EX, QB or CLOSE-M42 conversations, and so is eligible (RUN.md §4). It ran no build and no test suite (the main session owns execution and its runs are the basis below); it read files, ran read-only scripts and fetched sources. Job-state updates and every fix belong to the main session.
- **Date:** 2026-10-21.
- **Files read:**
  - the whole module (2,126 lines; line numbers below are as of this review and will move at FIX time; every fix names its quoted text, which a fixer finds by text, not by number);
  - `_meta/modules/M42.md` (F1-F26 with F4b, C1-C20, Lab decision, Handoffs into 42, owner map, anchor candidates, breadth gate, For Jorge 1-5, "Corrections found while writing"), QUALITY-BAR, STYLE-GUIDE §2, §3, §5.3, §6, §7.2, §7.3, RUN.md §1, §5-§7, §10, the module-42 common rules and the REVIEW-M42 and REVIEW-M41 blocks in TASKS.md, REVIEW-M41 and FIX-M41-01..03 (the format model), every module-42 LOG line (1708-1737: PLAN, SEC-01..09, EX-01..03, QB-01..03, CLOSE, the three session summaries) and their "for REVIEW-M42" notes, `SOURCES.md` `## Module 42` (151 lines);
  - every module-42 lab file: labs/ts-js `concepts/` (`jwt.ts`, `session-store.ts`, `pkce.ts`, `token-family.ts`, `jwt-validator.ts`, `authorities.ts`, `csrf-mask.ts`, `tab-logout.ts`, six tests), `exercise-1-pkce-client/`, `exercise-2-refresh-rotation/`, `src/outputs/42-fullstack-authentication/q42-05.test.ts` and `q42-14.test.ts`; labs/angular `concepts/` (`bff-client.ts`, `csrf-session.ts`, `auth-session.ts`, `auth.guard.ts`, `auth.interceptor.ts`, `idle-timer.ts`, six specs) and `exercise-3-bff-session/` (all files).
- **Sources re-read (2026-10-21), fetched into `/Users/jorge.quintero/.claude/jobs/4a727236/tmp/review42` and deleted:**
  - raw GitHub `spring-security` `7.1.1`: `CsrfConfigurer.java` (`spa()` `@since 7.0`, private `SpaCsrfTokenRequestHandler`, `CsrfAuthenticationStrategy` given the request handler), `XorCsrfTokenRequestAttributeHandler.java` (`getTokenValue`: length `!= tokenSize * 2` → null), `CsrfTokenRequestAttributeHandler.java` (`handle` with a null attribute name calls `getParameterName()` on the supplier token, so the token loads), `CsrfAuthenticationStrategy.java` (`onAuthentication` acts only `if (containsToken)`), `CsrfLogoutHandler.java`, `CookieCsrfTokenRepository.java` (names, UUID token, `Secure` from `request.isSecure()`), `CsrfFilter.java`, `HttpSecurity.java` (DSL methods and `AbstractSecurityBuilder.build()` declare no `throws`), `ExceptionHandlingConfigurer.java`, `PathPatternRequestMatcher.java`, `AbstractAuthenticationFilterConfigurer.java` (media matcher `application/xhtml+xml`, `image/*`, `text/html`, `text/plain`; `X-Requested-With`), `RequestCacheConfigurer.java` (skips `application/json`), `SessionCreationPolicy.java`, `HttpStatusEntryPoint.java`, `JwtTimestampValidator.java` (60 s, `allowEmptyExpiryClaim = true`), `JwtValidators.java` (`createDefaultWithValidators` adds `JwtTypeValidator.jwt()` only when none is given), `JwtTypeValidator.java` (`@since 6.5`, `jwt()`, varargs constructor), `JwtAuthenticationConverter.java` (always adds the bearer factor authority), `JwtGrantedAuthoritiesConverter.java`, `DelegatingJwtGrantedAuthoritiesConverter.java` (varargs constructor), `ClientRegistration.java` (`requireProofKey = true`, reset for other grants), `OAuth2AuthorizationRequestRedirectFilter.java`, `DefaultOAuth2AuthorizationRequestResolver.java` (nonce kept as attribute, its hash sent), `OidcAuthorizationCodeAuthenticationProvider.java` (`invalid_nonce` when the claim is not the hash), `OidcClientInitiatedLogoutSuccessHandler.java` (`id_token_hint`, `OidcUser`, `end_session_endpoint`), `OidcBackChannelLogoutHandler.java` (constructor with `OidcSessionRegistry`, `setSessionCookieName`, default `JSESSIONID`), `OAuth2LoginConfigurer.java` (`InMemoryOidcSessionRegistry` default), `ClearSiteDataHeaderWriter.java` (secure requests only), `HttpSessionEventPublisher.java`, `InMemoryOidcSessionRegistry.java` (exists); `oauth2-authorization-server`: `TokenSettings.java` (`reuseRefreshTokens(true)`, 60 min, `SELF_CONTAINED`), `OAuth2RefreshTokenAuthenticationProvider.java` (`findByToken` → `invalid_grant`; `!isActive()` → `invalid_grant`; new token only when `!isReuseRefreshTokens()`; no revocation path), `OAuth2RefreshTokenGenerator.java` (`isPublicClientForAuthorizationCodeGrant`, "Do not issue refresh token to public client"); docs `servlet/exploits/csrf.adoc` (lines 279, 355-378, 744-768, 1363), `servlet/oauth2/resource-server/jwt.adoc`, `opaque-token.adoc` (`active`), `servlet/authorization/method-security.adoc` (line 37), `servlet/authentication/logout.adoc` (lines 22-39), `servlet/oauth2/login/logout.adoc` (lines 221-224, 289-314), `servlet/oauth2/client/core.adoc` (`requireProofKey`, line 72);
  - raw GitHub `spring-boot` `v4.1.1`: `ServerProperties.java` (`server.servlet.session` nested `Session`), `Session.java` (30 min), `Cookie.java` (`name`, `domain`, `path`, `httpOnly`, `secure`, `partitioned`, `maxAge`, `sameSite`), `JwtDecoderConfiguration.java` (package-private; `JwtIssuerValidator`; audience validator only for non-empty `audiences`; `OAuth2TokenValidator` beans added; `jwsAlgorithms` only on the `jwk-set-uri` path), `JwtConverterConfiguration.java` (`@ConditionalOnMissingBean(JwtAuthenticationConverter.class)`), `OAuth2ResourceServerProperties.java`, `OAuth2AuthorizationServerProperties.java` (`reuseRefreshTokens = true`, 60 min), reference `security/oauth2.adoc` (lines 225-262);
  - raw GitHub `spring-session` `4.1.1` `spring-session-docs/modules/ROOT/pages/index.adoc` (lines 24, 52); `spring-cloud-gateway` `v5.0.3` `TokenRelayFilterFunctions.java` (`OAuth2AuthorizedClientManager.authorize`, `setBearerAuth`, forwards unchanged otherwise), `filters/tokenrelay.adoc` (YAML shape, in-memory note), `spring-cloud-starter-gateway-server-webmvc/pom.xml` (artifact name);
  - rfc-editor.org (`.txt`): RFC 6749, 7009, 7515, 7517, 7519, 7636, 7662, 8725, 9068, 9207, 9700, 10017; openid.net OpenID Connect Core 1.0 (§3.1.2.1, §3.1.3.7); MDN `Clear-Site-Data` (Baseline "Widely available");
  - `npm pack` (extracted, read, deleted): `angular-oauth2-oidc@22.0.2` (`fesm2022/angular-oauth2-oidc.mjs`: `provideOAuthClient`, `createDefaultStorage`, `responseType` fallback at 1965-1977, `refreshInternal`, `DefaultOAuthInterceptor`; `README.md` 131-145), `angular-auth-oidc-client@22.0.2` (`fesm2022/angular-auth-oidc-client.mjs`: defaults 3557-3567, `DefaultSessionStorageService`, `refreshWithLock`, `withAppInitializerAuthCheck` → `APP_INITIALIZER`; `types/angular-auth-oidc-client.d.ts`: `authInterceptor()`, `provideAuth`, `secureRoutes`; `package.json` peers); `npm view <pkg> dist-tags.latest` = 22.0.2 for both;
  - read-only in `labs/angular/node_modules`: `@angular/common` 22.2.1 `fesm2022/_module-chunk.mjs` (`ACCEPT_HEADER_VALUE` = `application/json, text/plain, */*`, set by both backends).
- **Basis of each finding:** a framework source or docs page at its release tag, a package source, an RFC or specification read on the date above, a committed test, or a read-only script. **Not re-read** (their basis is the SEC/EX/QB LOG lines and SOURCES.md): Security 6.5.0 `csrf.adoc` (C1), `CsrfTokenArgumentResolver`, `JdbcOAuth2AuthorizationService`, the OpenID logout specs, MDN `BroadcastChannel` and Web Locks pages (SOURCES lines agree with the markers), the owners' texts in 09, 16, 24, 27, 28, 29, 32, 33, 37. The mermaid diagrams were not re-parsed and `tsc` was not run.
- **Probe files:** none in the repository. Sources and tarballs lived in the job tmp dir above, which was deleted. The reviewer created only this file and edited `_meta/TASKS.md`.

Overall, an accurate module whose facts hold up: every Spring, library and RFC claim sampled traces to the named file at its tag or to the RFC section it cites; all 11 Java and YAML fences carry the banner and use only APIs that exist in 7.1.1, Boot 4.1.1 and Gateway 5.0.3; both libraries are "read, not run" and the two-library table matches the 22.0.2 tarballs cell by cell; our models are named as ours; no Angular-style marker sits on a Spring, library or RFC fact; no test reads the clock, the network or a committed key; Q42.05's and Q42.14's answers equal their assertions. No Major finding. The weakness is teaching density, not accuracy: to fit nine sections into 9,315 words, many follow-ups and traps state a bare fact. Findings:
- four Minor factual findings: §6's "`_csrf` parameter unmasked" reads backwards (F-1); §6 and §9 omit `CsrfAuthenticationStrategy`'s condition (F-2); the §9 `nonce` bullet is garbled (F-3); Exercise 42.1 states an untested behavior as a rule (F-4);
- three Minor teaching findings: 21 follow-ups and 12 traps that state a fact without its reason (T-1, STYLE-GUIDE §2); five Misconceptions causes that are circular or empty (T-2, B7); three `### Code` step lists with no approach (T-3, B5);
- five nits and the anchor handoffs (17 rows).

**Items left to this review by earlier sessions, settled:**
- **C3** (session cookie properties): resolved. Boot v4.1.1 `ServerProperties.Servlet` nests `Session`, which nests `Cookie` with `name`, `path`, `httpOnly`, `secure`, `sameSite` (and `domain`, `partitioned`, `maxAge`), so §3's YAML `server.servlet.session.cookie.{name,http-only,secure,same-site,path}` is right; the container defaults were dropped by SEC-M42-01, and no sentence states them.
- **C4** (Spring Session): resolved. §1 and Q42.02 quote `index.adoc` 4.1.1 line 24 ("typically stored on the server's memory") verbatim; line 52 names "a shared database or Redis" (N-5 adds it).
- **C9** (introspection): resolved. Q42.16 names `active` (RFC 7662 §2; `opaque-token.adoc` "Inspect the response for an `{ 'active' : true }` attribute") and `REFERENCE`/`SELF_CONTAINED` (`TokenSettings`).
- **C10** (method security): resolved. §5's comment quotes `method-security.adoc` line 37 verbatim; `@EnableMethodSecurity`, `hasRole` prefixing and the converter API match.
- **C11** (Gateway): resolved by omission and source. The module never names the starter (it is `spring-cloud-starter-gateway-server-webmvc` at v5.0.3) and never claims refresh; §3's "sets `Authorization: Bearer` from the `OAuth2AuthorizedClientManager`, or forwards without one" is exactly `TokenRelayFilterFunctions.tokenRelay`.
- **C15** (third-party cookies): resolved by omission. Only RFC 10017 §6.3.2.3 and the 09 links are used; no browser date appears.
- **§6 "`_csrf` parameter unmasked":** confirmed misleading (F-1).
- **§9 `nonce` bullet:** confirmed garbled; the fact is right (F-3).
- **§6 "login sets the next token" vs the condition:** confirmed incomplete (F-2); the §6 lab and diagram stay valid because form login's `POST /login` always carries the token.
- **Terse follow-ups in Q42.09-Q42.16:** confirmed, and the pattern runs through the whole bank (T-1).
- **Link to 32 §8 / Q32.23:** confirmed. CLOSE-M42 added both in Connections (Builds on and Comparisons, with reasons); the body has no transfer-cache sentence, which is acceptable because the module's BFF sends no `Authorization` header from the browser (Judged acceptable).

**Plan facts found wrong or superseded** (the module already follows the corrections): F14 "RS256 only by default" holds only on the `jwk-set-uri` path (`JwtDecoderConfiguration` applies `jwsAlgorithms` there only; §5's YAML comment says so); C8's class name (`OAuth2ResourceServerJwtConfiguration` does not exist; it is the package-private `JwtDecoderConfiguration`); F8's "tokens in the HTTP session" (they are in `InMemoryOAuth2AuthorizedClientService`); C17 lists `FilterOrderRegistration` and `SpaCsrfTokenRequestHandler`, both correctly non-public (`final class` package-private and `private static final class`) and marked internal in the module.

**Prose:** 9,315 words now (`module-stats.mjs`, main's run; the QUALITY-BAR python counter agrees, re-run read-only by the reviewer). The fixes add about +505, for about 9,820: under the REVIEW ceiling of 9,850 and the hard cap of 10,000.

## Runs (main session, Node 24, 2026-10-21; the reviewer ran none)

- `labs/ts-js`: `npx vitest run 42`: 10 files, 46/46 passed (includes `q42-05.test.ts` and `q42-14.test.ts`).
- `labs/angular`: `npx ng test --watch=false --include 'src/app/modules/42-fullstack-authentication/**/*.spec.ts'`: 6 files, 27/27 passed.
- `node labs/tools/check-links.mjs --planned`: 0 broken.
- `node labs/tools/check-snippets.mjs . 42`: OK.
- `node labs/tools/module-stats.mjs`: 42 = 9,315 prose words, no flag.

No lab file changes are requested: every finding is a Markdown text change. The FIX tasks re-run `check-snippets` (N-1 edits an Output snippet, N-3 a Java fence) and `check-links`.

## Reviewer's read-only script results

- **Markup:** B1: 9 of each of the six subsections; 9 `mermaid` fences and 9 "What to notice" lines; D1: 23 of each answer part; every best-practice bullet has "because"; every misconception has "Cause:"; `Unverified`, `relink:`, `TASK`, `PLACEHOLDER`, "probe", "planner", task IDs: 0.
- **Banners:** 11 Java/YAML fences (lines 66, 76, 258, 335, 352, 533, 615, 629, 803, 1140, 1176), 11 banners.
- **Status markers:** 6, all on Angular APIs (`provideAppInitializer` [Added in v19.0], `httpResource` [Stable since v22.0], `toObservable` [Stable since v20.0]) or browser features from dated MDN reads (Web Locks, `BroadcastChannel` 2022, `Clear-Site-Data` 2023, re-read 2026-10-21: "Widely available"); none on Spring, Nimbus, library or RFC facts (C16: `spa()` is "`@since 7.0`" in plain words).
- **Cited tests:** 14 distinct titles in backticks; all 14 exist verbatim in the module-42 labs. Exercises 42.1-42.3 criteria equal their `it(…)` titles (6 + 6 + 6, `describe.each(['a', 'b'])`).
- **Determinism (C19):** no `Date.now`, `new Date()` without an argument, `performance.now`, `Math.random`, `getRandomValues`, `process.env`, `child_process` or real `fetch` in any module-42 lab file; keys come from `crypto.subtle.generateKey` in four test files, no key material is committed; random bytes are injected; the idle timer runs under `vi.useFakeTimers()`; `exercise-3.spec.ts` yields with `setTimeout(resolve, 0)` (a macrotask flush, not a clock read).
- **RFC quotes:** 34 MUST/SHOULD/MAY quotes checked against the RFC text with a section-finding script: all at the cited section (7519 §4.1.4; 7636 §4.3, §4.6; 9700 §2.1.1, §2.1.2, §2.2.2, §4.7.1, §4.14.2; 10017 §5.1.2, §6, §6.1.3.2 ×6, §6.1.3.3, §6.1.4.2, §6.1.4.3, §6.3.2.3, §7.2, §7.2.1; 8725 §3.9; 9068 §4 ×2; 9207 §2.4; 7009 §2.2; 6749 §5.2, §6; OIDC Core §3.1.3.7 ×2). One quote changes the case of its first word (N-2).
- **Follow-up lengths:** 37 answered follow-ups of seven words or fewer; T-1 lists those that give no reason.

## QUALITY-BAR

45 items: **39 Pass, 6 Partial (B5, B7, C1, C3, D1, E1), 0 Fail.** H1-H3 rest on the main session.

| ID | Result | Evidence |
|---|---|---|
| A1 | Pass | Lines 3-9 in order, run commands for both labs. |
| A2 | Pass | 33 §8, 33 §9, 41 §1, 27 §7 anchored. |
| A3 | Pass | §2, §3, §6; Q42.02, .04, .08, .13, .17, .21; Summary. |
| A4 | Pass | 9 sections and the five closing parts. |
| A5 | Pass | Sessions → flow → placement → refresh → resource server → CSRF → Angular → logout → trace. |
| B1 | Pass | 9 × 6 (script). |
| B2 | Pass | Concrete failures in each (attacker keeps calling, `#access_token` in history, 302 for XHR, two tabs, billing's tokens, 403 after logout, deep link lost, 40-minute form). |
| B3 | Pass | 9 diagrams of the planned types, each with "What to notice" (not re-parsed). |
| B4 | Pass | Each "How it actually works" answers a "why" from a named file at its tag. |
| B5 | Partial | §5, §6, §8 step lists name only the artifacts ("1. Spring. 2. Timer, draft. 3. Channel."), no approach (T-3). |
| B6 | Pass | "because" on every item. |
| B7 | Partial | Five causes circular or empty ("Cause: it just worked.") (T-2). |
| B8 | Pass | Coming from the backend in all 9 sections with "Where the analogy breaks"; Framework vs platform in §4 and §8. |
| B9 | Pass | Terms defined at first use (authentication, PKCE, BREACH, entry point, token family, open redirect …). |
| B10 | Pass | 09, 16, 24, 27, 28, 29, 32, 33, 37, 41 get a sentence or a link; no owner's explanation retold. |
| C1 | Partial | 44 of 48 sampled claims match; F-1, F-2, F-3 (wording), F-4. |
| C2 | Pass | Q42.05 and Q42.14 values equal their assertions (module-specific checks). |
| C3 | Partial | Every cited test exists; Exercise 42.1's "a missing `iss` fails too" has no test (F-4). |
| C4 | Pass | Angular and browser markers present at first mention; none on Spring/library/RFC facts. |
| C5 | Pass | Angular names exist in 22.2.1; library names in the 22.0.2 typings. |
| C6 | Pass | 0 `Unverified`. |
| C7 | Pass | `check-snippets` passes (main); Q42.14's Output snippet uses `log(` instead of `console.log(` (N-1). |
| C8 | Pass | Every external URL in SOURCES.md `## Module 42`; FIX adds two re-read notes. |
| D1 | Partial | 23 × 5 parts and ≥ 2 follow-ups everywhere, but 21 follow-ups and 12 traps are unanswered in substance (T-1). |
| D2 | Pass | Q42.05 and Q42.14 give values and reasons in the full explanation's words. |
| D3 | Pass | 6 tags, max 30% (Concept 7). |
| D4 | Pass | Q42.01-23 follow the sections. |
| D5 | Pass | Q09.15, Q09.17, Q09.18, Q24.14, Q24.19, Q27.22-Q27.27, Q33.21-Q33.26, Q41.01, Q41.03 linked or untouched, none re-asked (Q42.18 asks only the Spring half; Q27.27 is a follow-up link). |
| D6 | Pass | 23/23 linked from the body. |
| D7 | Pass | 23 anchors. |
| D8 | Pass | 23 ≤ 38, ≥ 15. |
| E1 | Partial | Full anatomy in all three with 3, 2, 2 answered follow-ups; Exercise 42.1 asserts one untested behavior (F-4). |
| E2 | Pass | 18/18 criteria = titles. |
| E3 | Pass | One flow's client checks → server model plus concurrent client → Angular integration over §3, §6-§8. |
| E4 | Pass | Main's runs; no `any`; at most two injected dependencies per class. |
| E5 | Pass | Q42.05, Q42.14. |
| F1 | Pass | Two paragraphs, all nine sections linked, no new fact. |
| F2 | Pass | Three prompts naming listeners. |
| F3 | Pass | Six flashcards. |
| F4 | Pass | Builds on (incl. 32 §8), Read next, Uses later, Comparisons (incl. Q32.23). |
| G1 | Pass | 9,315 ≤ 9,359; about 9,820 after fixes ≤ 9,850. |
| G2 | Pass | 8/8 SYLLABUS §4 (42) checkboxes; logout row links the root guide's Part I (§8). |
| H1 | Pass (main) | Main's runs above. |
| H2 | Pass (main) | `check-links --planned` 0. |
| H3 | Pass (main) | Main checks `git status`. |

Totals: **39 Pass, 6 Partial (B5, B7, C1, C3, D1, E1), 0 Fail.**

## Module-specific checks

| Check | Result | Evidence |
|---|---|---|
| Spring claims traced; ≥ 10 re-read | Pass, two findings | 33 Spring/Gateway/Session claims re-read (table below); the named ones: `csrf.spa()` and its handler (match; wording F-1), CSRF token cleared on login and logout (match; condition F-2), `reuseRefreshTokens(true)` (match, `TokenSettings` and Boot property), no refresh token for public clients (match), reuse handling in `OAuth2RefreshTokenAuthenticationProvider` (match: `invalid_grant`, nothing revoked), 60 s skew (match), `aud` unchecked without `audiences` (match), `JwtTypeValidator.jwt()` (match), `SCOPE_` mapping (match), `requireProofKey` (match), 30-minute timeout (match), POST-only logout (match, `csrf.adoc` 1363). |
| RFC MUST/SHOULD quoted with section | Pass, one nit | 34 quotes at their cited sections (script); N-2 capitalization. |
| Banners on Java/YAML | Pass | 11/11; every API in them exists at the tags read (`defaultAuthenticationEntryPointFor`, `PathPatternRequestMatcher.pathPattern`, `JwtTypeValidator(String...)`, `DelegatingJwtGrantedAuthoritiesConverter(...)`, `OidcBackChannelLogoutHandler(OidcSessionRegistry)`, `setSessionCookieName`, `InMemoryOidcSessionRegistry`, `ClearSiteDataHeaderWriter(Directive.COOKIES)`, Gateway YAML keys). §8 keeps a `throws Exception` that 7.1.1 does not need (N-3). |
| Two-library table vs 22.0.2 tarballs | Pass | Flow: `angular-oauth2-oidc` falls back to `id_token token`/`id_token`/`token` unless `responseType` is set; `angular-auth-oidc-client` `responseType: "code"`. Token sent by: `DefaultOAuthInterceptor` under `HTTP_INTERCEPTORS`, `allowedUrls`; `authInterceptor(): HttpInterceptorFn`, `secureRoutes`. Storage: `createDefaultStorage` → `sessionStorage`; `DefaultSessionStorageService`. Renewal: `refreshInternal` uses the refresh grant unless `useSilentRefresh`; `silentRenew: false`, `useRefreshToken: false`. README standalone setup `provideHttpClient()`, `provideOAuthClient()` without `withInterceptorsFromDi()`. `withAppInitializerAuthCheck()` registers `APP_INITIALIZER`. |
| Q42.05 against its test | Pass | `E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM`, `true`, `false` = `q42-05.test.ts`; title cited verbatim. |
| Q42.14 against its test | Pass | Five lines = `q42-14.test.ts`; `springDefaults` = the answer's policy; snippet `log(` (N-1). |
| Our models named as ours (C18) | Pass | Every lab header says "Our model, not Spring's code" (or "not a library's code"); prose: "our model", "ours", "Tests (ours)", "our endpoint", "our stub". |
| No Angular-style marker on Spring/library/RFC facts (C16) | Pass | Script above. |
| No network, clock or committed key (C19) | Pass | Script above. |
| Handoffs into 42 honored; owners' questions not re-asked | Pass | 09 → §3 (cookie attributes), §6 (`SameSite` as a layer); 24 → §1, §7, Q42.19, Exercise 42.3; 27 → §2, §4, §5; 33 → §1, §3, §4, §5, §6, Exercise 42.1-42.3; 41 → §6. Handoffs table below. |
| Prose ≤ 9,850 after fixes | Pass (tight) | About 9,820; FIX-M42-02 trims its own added clauses if the measured count passes 9,850. |

## Handoffs

Module 42 slugs (from the `## N.` headings, as in Contents):
- S1 `#1-sessions-versus-tokens-what-the-server-keeps-what-each-request-carries-revocation-and-scaling`
- S2 `#2-oauth-20-and-openid-connect-for-a-single-page-app-authorization-code-with-pkce-and-why-the-implicit-flow-is-gone`
- S3 `#3-where-the-oauth-client-runs-a-browser-only-client-a-token-mediating-backend-or-a-backend-for-frontend-with-spring`
- S4 `#4-refresh-tokens-rotation-reuse-detection-silent-renew-and-refreshing-across-tabs`
- S5 `#5-spring-security-as-a-resource-server-validating-jwts-and-turning-scopes-into-authorities`
- S6 `#6-csrf-with-cookiecsrftokenrepository-and-angulars-xsrf-support-csrfspa-in-spring-security-7`
- S7 `#7-the-angular-side-an-auth-state-at-startup-guards-as-ux-interceptors-and-angular-oauth2-oidc-versus-angular-auth-oidc-client`

Re-located 2026-10-21: every M42.md candidate is still at the line PLAN-M42 recorded, with exactly one link to `42-fullstack-authentication.md` on it; only 41's "Read next" moved (41:2021 → 41:2046, stays file-level).

| Target | Links (module:line, context), 17 rows, +0 words |
|---|---|
| S1 | 24:1946 (Q24.19 answer, "…backend-for-frontend) and [42]"), 33:651 ("A **JWT** is a token format: signed claims as base64url text ([42]") |
| S2 | 27:711 ("How they are issued and validated (OAuth/OIDC, JWT) is [42]"), 27:1708 (Q27.22, "how it is issued is [42]") |
| S3 | 09:407 ("`server.servlet.session.cookie.*` set these attributes ([42]"), 33:1575 (Q33.21, "Spring's side is [42]"), 33:2055 (Exercise 33.4 alternative, "[module 42]") |
| S4 | 33:2004 (Exercise 33.4, "Not covered: OAuth, PKCE, refresh rotation, reuse detection and expiry ([module 42]") |
| S5 | 33:884 ("the server verifies the token and the role on every request ([42]") |
| S6 | 09:404 ("`SameSite` is defense in depth; see [33] … [42]"), 09:1042 (Q09.17 follow-up, "*CSRF?* `SameSite` is defense in depth ([33], [42]"), 33:779 ("`CookieCsrfTokenRepository` … read 2026-10-15); [42]"), 33:1934 (Exercise 33.3, "Not covered: login CSRF and Spring's configuration ([module 42]"), 41:131 ("cookies and CSRF: [42]") |
| S7 | 24:538 ("Guards are not access control … [33] and [42]"), 24:1763 (Q24.14 follow-up, "…server) and [42]"), 24:2562 (Exercise 24.3, "…server), [42]") |

Each link keeps its text; only the target gains the slug. Stay file-level: the `:5` header lines (09, 24, 27, 33, 41) and the "Read next" / "Uses these ideas later" lists 09:1606, 24:2978, 24:2979, 27:2578, 27:2579, 33:2128, 33:2129, 41:2046. 33:2004 also names PKCE (§2), but its list ends with rotation and expiry; S4 is the plan's choice and the closer fit for "Exercise 33.4 → Exercise 42.2".

## Factual findings

**F-1 · Minor (C1, C17) · §6 "a `_csrf` parameter unmasked" reads backwards (791).** "`spa()` sets `CookieCsrfTokenRepository.withHttpOnlyFalse()` and the internal `SpaCsrfTokenRequestHandler`: headers as sent, a `_csrf` parameter unmasked." Read in `CsrfConfigurer` 7.1.1: `resolveCsrfTokenValue` uses the plain handler only when the header has text, otherwise `this.xor` resolves the value, and `XorCsrfTokenRequestAttributeHandler.getTokenValue` returns null unless the decoded value is twice the token's length. So a form parameter must be the masked value; "unmasked" suggests the raw value is accepted. Our `csrf-mask.ts` `resolveSpa` already models it correctly.
- Fix (791): "headers as sent, a `_csrf` parameter unmasked." → "a header is compared as sent; a `_csrf` form parameter must still be masked, and the XOR handler unmasks it." (+10)

**F-2 · Minor (C1; the check "§6 'login sets the next token' vs the `CsrfAuthenticationStrategy` condition") · §6 (793) and §9 (1367).** `CsrfAuthenticationStrategy.onAuthentication` (7.1.1) runs `boolean containsToken = this.tokenRepository.loadToken(request) != null; if (containsToken) { saveToken(null, …); … requestHandler.handle(…) }`, and `CsrfConfigurer` gives it the `spa()` handler, whose `handle` loads the new token at once (the null attribute name makes `CsrfTokenRequestAttributeHandler.handle` call `getParameterName()` on the deferred token). So the login response clears and resets the cookie only when the sign-in request carried one; otherwise nothing happens there, and the next request through `CsrfFilter` writes a cookie under `spa()`. §6's lab (form login, `POST /login` carrying the token) and diagram stay right.
- Fix (793): "**Why refresh after logout?** `CsrfLogoutHandler` clears the cookie; at sign-in `CsrfAuthenticationStrategy` clears it but, under `spa()`, sets the next. The reference says to refresh after both." → "**Why refresh after logout?** `CsrfLogoutHandler` clears the cookie. At sign-in, `CsrfAuthenticationStrategy` acts only if the request carried a token: it clears it and, under `spa()`, sets the next in the same response. The reference says to refresh after both." (+12)
- Fix (1367): "**Why a new CSRF token?** `CsrfAuthenticationStrategy` replaces it in that response" → "**Why a new CSRF token?** The callback carried the old `XSRF-TOKEN`, so `CsrfAuthenticationStrategy` replaces it in that response" (+7; the link that follows stays).

**F-3 · Minor (C1; the check "the garbled §9 `nonce` bullet") · §9 (1368).** "- The ID token's `nonce` must equal the stored value's SHA-256 hash." The fact is right but unreadable as a "why" bullet: `DefaultOAuth2AuthorizationRequestResolver` (7.1.1) keeps a random `nonce` as a request attribute and sends `createHash(nonce)` as the `nonce` parameter; `OidcAuthorizationCodeAuthenticationProvider` hashes the stored value and fails with `invalid_nonce` when the ID token's claim differs.
- Fix (1368): "- The ID token's `nonce` must equal the stored value's SHA-256 hash." → "- **Why can't an old ID token be replayed?** Spring keeps a random `nonce` in the session and sends its SHA-256 hash; the ID token's `nonce` must equal that hash, else `invalid_nonce` (`OidcAuthorizationCodeAuthenticationProvider`)." (+22)

**F-4 · Minor (C3, E1) · Exercise 42.1 states an untested behavior as a rule (1903).** "- `iss`: RFC 9207 §2.4: clients "MUST reject" a mismatch (a missing `iss` fails too)." No test asserts the missing-`iss` case (EX-M42-01's LOG line: "in the code but not asserted by a test"), and RFC 9207 §2.4 requires rejecting a response without `iss` only "from authorization servers that do support the parameter according to the client's configuration".
- Fix (1903): "(a missing `iss` fails too)." → "(our client also rejects a missing `iss`, from code, untested; §2.4 requires that only for a server configured as sending it)." (+17)
- SOURCES.md `## Module 42`: append to the RFC 9207 line for Exercise 42.1 (the one starting "- RFC 9207 (March 2022), https://www.rfc-editor.org/rfc/rfc9207.txt") "; §2.4 also: reject a response without `iss` only from a server that supports the parameter \"according to the client's configuration\", re-read 2026-10-21 (REVIEW-M42 F-4)".

## Teaching findings

**T-1 · Minor (STYLE-GUIDE §2 "An answer that only states a fact is not finished"; QUALITY-BAR D1 "each answered") · bare follow-ups and traps.** Each replacement keeps the question and any link, and adds the reason (facts all from the module's own sections or the sources above). Find each by its quoted text.
- Q42.01: "- *Idle timeout in Boot?* 30 minutes (`server.servlet.session.timeout`)." → "- *Idle timeout in Boot?* 30 minutes (`server.servlet.session.timeout`), counted between requests, so typing alone does not extend it." (+9)
- Q42.01: "- *A JWT in a cookie: a session?* No." → "- *A JWT in a cookie: a session?* No: the server keeps no record, so logout cannot end it." (+10)
- Q42.02: "- *A deny list?* It brings the lookup back." → "- *A deny list?* It restores revocation but brings back a lookup on every request, the cost JWTs were chosen to avoid." (+12)
- Q42.03: "- *Memory storage and logout?* No help (" → "- *Memory storage and logout?* No help: a copy taken before logout stays valid until `exp` (" (+9)
- Q42.04 trap: "**Trap to avoid.** \"PKCE replaces `nonce`.\"" → "**Trap to avoid.** \"PKCE replaces `nonce`\": PKCE guards the code exchange; only `nonce` ties the ID token to this login." (+13)
- Q42.05: "- *Error on mismatch?* `invalid_grant`." → "- *Error on mismatch?* `invalid_grant`, which §4.6 requires, so a stolen code is spent for nothing." (+11)
- Q42.06: "- *Always a JWT?* No." → "- *Always a JWT?* No: it may be opaque (`[Q42.16](#q42-16)`); RFC 9068 profiles only the JWT form." (+11)
- Q42.06 trap: "**Trap to avoid.** Sending the ID token to the API." → "**Trap to avoid.** Sending the ID token to the API: its `aud` is the app, so a correct API refuses it." (+11)
- Q42.07 trap: "**Trap to avoid.** \"No secret, so implicit.\"" → "**Trap to avoid.** \"No secret, so implicit\": PKCE lets a public client use the code flow without one." (+10)
- Q42.10: "- *Without rotation?* A copy works beside the original." → "- *Without rotation?* A copy works beside the original until it expires, because nothing shows the server two clients share it." (+11)
- Q42.10 trap: "**Trap to avoid.** \"Spring revokes the family.\"" → "**Trap to avoid.** \"Spring revokes the family\": 7.1.1 refuses only the old token; the newest keeps working." (+10)
- Q42.11: "- *Third-party cookies?* [Q09.17]" → "- *Why third-party?* The iframe's site differs from the page's: [Q09.17]" (+9; the link target stays).
- Q42.12: "- *Two 401s, one tab?* Single flight: [Q27.23]" → "- *Two 401s, one tab?* One shared refresh, so the second request waits instead of replaying: [Q27.23]" (+9)
- Q42.12: "- *Storage risk?* [Q33.23]" → "- *Storage risk?* Injected script reads `localStorage` and can replay the token from anywhere: [Q33.23]" (+11)
- Q42.13: "- *Key rotation?* Automatic, from the JWKS." → "- *Key rotation?* Automatic: keys come from the issuer's JWKS, so new ones need no redeploy (`jwt.adoc`)." (+11)
- Q42.13 trap: "**Trap to avoid.** \"`issuer-uri` also checks `aud`.\"" → "**Trap to avoid.** \"`issuer-uri` also checks `aud`\": it adds only the `iss` validator; set `audiences`." (+9)
- Q42.14: "- *Reject billing's token?* Set `audiences`." → "- *Reject billing's token?* Set `audiences`: Boot then adds an `aud` validator (§5's audience test)." (+9)
- Q42.14 trap: "**Trap to avoid.** \"A valid signature means it is for this API.\"" → "**Trap to avoid.** \"A valid signature means it is for this API\": it proves who issued the token; `aud` says for whom." (+11)
- Q42.15: "- *Hide the admin route?* UX only: [Q33.26]" → "- *Hide the admin route?* Yes, for UX: the chunk still downloads and the API still decides: [Q33.26]" (+9)
- Q42.15 trap: "**Trap to avoid.** \"The guard checks, so the API need not.\"" → "**Trap to avoid.** \"The guard checks, so the API need not\": anyone can call the API without the app." (+9)
- Q42.16: "- *Introspect a JWT?* Yes." → "- *Introspect a JWT?* Yes: RFC 7662 accepts any token string, buying revocation for a call." (+12)
- Q42.16: "`REFERENCE` format; the default is `SELF_CONTAINED`." → "`REFERENCE` format (`access-token-format: reference` per client); the default is `SELF_CONTAINED`." (+4)
- Q42.17: "- *Token from an endpoint?* Masked, so it fails." → "- *Token from an endpoint?* A `CsrfToken` body is masked, and `spa()` compares a header as sent, so copying it fails." (+12)
- Q42.18 trap: "**Trap to avoid.** `csrf.disable()` for a 403." → "**Trap to avoid.** `csrf.disable()` for a 403: it removes the check instead of fixing which token is sent." (+11)
- Q42.19: "- *Attach a token?* Elsewhere, check the URL first (" → "- *Attach a token?* Not with a BFF; a token client checks the URL first, or the token leaks to other hosts (" (+10)
- Q42.19 trap: "**Trap to avoid.** A hidden menu as access control." → "**Trap to avoid.** A hidden menu as access control: the API must refuse the call itself." (+8)
- Q42.20: "- *For a BFF?* Neither: `/api/me` and a login link." → "- *For a BFF?* Neither: the server holds the tokens, so `/api/me` and a login link suffice." (+6)
- Q42.20 trap: "**Trap to avoid.** \"Both use the code flow.\"" → "**Trap to avoid.** \"Both use the code flow\": `angular-oauth2-oidc` runs implicit until `responseType: 'code'`." (+7)
- Q42.21: "- *Other devices?* Back-channel, server to server." → "- *Other devices?* Back-channel logout, server to server: no `BroadcastChannel` reaches another device." (+8)
- Q42.21 trap: "**Trap to avoid.** \"`POST /logout` is enough.\"" → "**Trap to avoid.** \"`POST /logout` is enough\": it ends only our session; the provider's signs the user straight back in." (+12)
- Q42.22 trap: "**Trap to avoid.** Restarting the warning on keystrokes." → "**Trap to avoid.** Restarting the warning on keystrokes: the server never sees them, so the session ends anyway." (+9)
- Q42.23: "- *Who validates the JWT?* The resource server." → "- *Who validates the JWT?* The resource server: the gateway only relays it, so each API checks signature, `iss` and `aud` itself." (+13)
- Q42.23: "- *Failed request?* [41 §10]" → "- *And a request that fails?* The same filters, ending in a problem detail: [41 §10]" (+9)

**T-2 · Minor (B7, STYLE-GUIDE §4.2.7) · causes that do not explain the myth.**
- §1 (132): "\"Stateless means logout works the same.\" No server record exists. Cause: sessions make it a server action." → "\"Stateless means logout works the same.\" No server record exists to delete, so the token lives until `exp`. Cause: with sessions, logout was a server action nobody saw." (+10)
- §4 (572): "Cause: RFC 9700 describes it." → "Cause: RFC 9700 recommends rotation, so people assume the default follows it." (+7)
- §6 (898): "\"An `HttpOnly` XSRF cookie is safer.\" Angular cannot read it. Cause: right for session cookies." → "\"An `HttpOnly` XSRF cookie is safer.\" Angular cannot read it, so no header is sent. Cause: `HttpOnly` is the right advice for session cookies." (+9)
- §6 (899): "\"A 403 after logout means a broken session.\" The token was cleared. Cause: it just worked." → "\"A 403 after logout means a broken session.\" The token was cleared. Cause: the same request passed a moment earlier, so the change looks like a fault." (+10)
- §8 (1301): "\"Back-channel logout reaches the browser.\" It is server to server. Cause: the name." → "\"Back-channel logout reaches the browser.\" It is server to server; a tab learns on its next request. Cause: \"logout\" sounds like something the screen shows." (+12)

**T-3 · Minor (B5 "Every non-trivial snippet is preceded by the approach and numbered steps") · step lists without an approach.**
- §5 (610-612): "1. YAML: issuer, audience.\n2. Java: roles, method security, `at+jwt`.\n3. Our validator and mapper." → "1. YAML: name the issuer and the audience, so `iss` and `aud` are both checked.\n2. Java: map `roles` to `ROLE_`, enable method security, and accept RFC 9068's `at+jwt`.\n3. Our validator and scope mapper, mirroring those defaults." (+20)
- §6 (798-800): "1. Java: `spa()`, a token endpoint.\n2. Refresh after login and logout.\n3. Our mask." → "1. Java: `spa()` and our 204 token endpoint.\n2. The client refetches the cookie after login and logout.\n3. Our model of the XOR mask, to see why a raw value fails." (+15)
- §8 (1135-1137): "1. Spring.\n2. Timer, draft.\n3. Channel." → "1. Spring: local, provider and back-channel logout, plus `Clear-Site-Data`.\n2. An idle timer restarted on responses, and a draft saved before the POST.\n3. The channel that tells other tabs." (+21)

**Nits**
- **N-1 (C7, STYLE-GUIDE §7.2 Output):** Q42.14 snippet (1668): "``  log(`${label}: ${result.valid ? 'accepted' : `rejected (${result.reason})`}`);``" → "``  console.log(`${label}: ${result.valid ? 'accepted' : `rejected (${result.reason})`}`);``" (0)
- **N-2 (quote):** §4 (491) and Q42.11 (1613): "\"In light of the impact of third-party cookie-blocking mechanisms" → "\"in light of the impact of third-party cookie-blocking mechanisms" (RFC 10017 §6.3.2.3 reads "However, in light of …"; 0).
- **N-3:** §8 Java (1142): "SecurityFilterChain security(HttpSecurity http, ClientRegistrationRepository registrations) throws Exception {" → "SecurityFilterChain security(HttpSecurity http, ClientRegistrationRepository registrations) {" (7.1.1 `HttpSecurity` DSL methods and `AbstractSecurityBuilder.build()` declare no checked exception; §1, §3, §6 already omit it; 0 prose).
- **N-4:** §1 problem (34): "After a move to \"stateless JWTs\", logout ends nothing ([Q24.19](../../modules/24-routing.md#q24-19))." → "After a move to \"stateless JWTs\", logout ends nothing." (Q24.19 is about a role guard reading `localStorage`; the reader lands on an unrelated question. −1)
- **N-5 (C4):** §1 (56): "**Spring Session** moves them to a shared store." → "**Spring Session** moves them to \"a shared database or Redis\" (line 52)." (+5)

## Judged acceptable

- **32 §8 / Q32.23 only in Connections:** the owner rule wants one sentence and a link; the link carries its reason ("the transfer cache and `Authorization`", "cached `Authorization`"), and the module's BFF never puts `Authorization` in the browser, so no body sentence is needed.
- **§5 "with only `issuer-uri`, the JWKS keys' algorithms are trusted"** contradicts `jwt.adoc`'s "Configuring Trusted Algorithms"; `JwtDecoderConfiguration` v4.1.1 applies `jwsAlgorithms` only in `jwtDecoderByJwkKeySetUri`, so the module follows the source (For Jorge 2).
- **§3's comment "added before oauth2Login's entry point, which is registered at build time"**: `ExceptionHandlingConfigurer` keeps a `LinkedHashMap` of default entry points, and SOURCES records `OAuth2LoginConfigurer.init`; not re-traced beyond that, plausible and labeled illustrative.
- **`exercise-3.spec.ts` `setTimeout(resolve, 0)`**: a task-queue flush, not a clock read; C19 holds.
- **Very short Full explanations (one or two sentences)**: each carries the mechanism or the cited test; T-1 fixes the parts that carry no reason, and the budget leaves no room to lengthen every answer.
- **The `Section 6` lab clears the cookie at login and refetches**: it models the reference's advice ("Refreshing the token after authentication success and logout success is required"), consistent with F-2's condition.

## Claims sampled (48)

| # | Claim (location) | Basis | Result |
|---|---|---|---|
| 1 | `spa()` `@since 7.0`, `withHttpOnlyFalse()`, private handler (§6, Q42.17) | `CsrfConfigurer` 232-236, 397 | Match |
| 2 | Header as sent; parameter (§6) | `SpaCsrfTokenRequestHandler.resolveCsrfTokenValue` | Wording (F-1) |
| 3 | XOR expects twice the bytes; UUID 36 chars → 27 bytes, not 72 (§6, Q42.17) | `XorCsrfTokenRequestAttributeHandler.getTokenValue`; `CookieCsrfTokenRepository.createNewToken` | Match |
| 4 | `spa()` loads the token every request, first response sets the cookie (§6) | `CsrfTokenRequestAttributeHandler.handle` | Match |
| 5 | Token cleared at login, set under `spa()` (§6, §9) | `CsrfAuthenticationStrategy.onAuthentication` | Condition missing (F-2) |
| 6 | `CsrfLogoutHandler` clears (§6, Q42.18) | `CsrfLogoutHandler.logout` | Match |
| 7 | Refresh after both, reference (§6) | `csrf.adoc` 763, 768 | Match |
| 8 | POST-only logout with CSRF; GET shows a page (§8) | `csrf.adoc` 1363; `logout.adoc` 22-31 | Match |
| 9 | `HttpOnly` advice (§6 trap) | `csrf.adoc` 279 | Match |
| 10 | `reuseRefreshTokens(true)`, 60 min (§4, Q42.10) | `TokenSettings` 140-143; Boot `OAuth2AuthorizationServerProperties` 500, 505 | Match |
| 11 | Old token `invalid_grant`, nothing revoked (§4, Q42.10, Ex 42.2) | `OAuth2RefreshTokenAuthenticationProvider` 114-152, 224 | Match |
| 12 | No refresh token for a `none` client on the code grant (§4, Q42.12) | `OAuth2RefreshTokenGenerator` 55-82 | Match |
| 13 | Authorization-server YAML keys (§4) | Boot `security/oauth2.adoc` 229-258 | Match |
| 14 | 60 s skew, `isAfter` (§5, Q42.03, Q42.13) | `JwtTimestampValidator` 54, 104 | Match |
| 15 | `aud` only with `audiences`; `iss` validator (§5, Q42.06, Q42.13) | `JwtDecoderConfiguration.getValidator` | Match |
| 16 | `JwtTypeValidator.jwt()` = `JWT` or absent; `at+jwt` fails (§5, Q42.14) | `JwtTypeValidator` 55-58; `JwtValidators.createDefaultWithValidators` | Match |
| 17 | Type validator bean replaces `jwt()` (§5 Java) | `createDefaultWithValidators`; Boot `additionalValidators` | Match |
| 18 | `jwsAlgorithms` only with `jwk-set-uri` (§5 YAML) | `JwtDecoderConfiguration` 116-123, 143-148 | Match |
| 19 | `SCOPE_`, `scope` then `scp`, `" "` (§5, Q42.13) | `JwtGrantedAuthoritiesConverter` 47-51 | Match |
| 20 | Converter always adds the bearer factor (§5 Java) | `JwtAuthenticationConverter.convert` | Match |
| 21 | Boot's converter backs off (§5 Java) | `JwtConverterConfiguration` 58 | Match |
| 22 | Method security not on by default (§5, Q42.15) | `method-security.adoc` 37 | Match |
| 23 | `requireProofKey` default true for code grant (§2, §3, Q42.09) | `core.adoc` 72; `ClientRegistration` 722, 795 | Match |
| 24 | `/oauth2/authorization/{registrationId}` (§3, §9) | `OAuth2AuthorizationRequestRedirectFilter` 90 | Match |
| 25 | 302 for `text/plain` without `X-Requested-With` (§3) | `AbstractAuthenticationFilterConfigurer` 261-266 | Match |
| 26 | Angular sends `application/json, text/plain, */*` (§3, §9) | `@angular/common` 22.2.1 429, 997, 1812 | Match |
| 27 | Request cache skips JSON (§9, Q42.23) | `RequestCacheConfigurer` 156 | Match |
| 28 | `nonce` hash sent, compared (§9) | `DefaultOAuth2AuthorizationRequestResolver` 287-290; `OidcAuthorizationCodeAuthenticationProvider` 192-195 | Match (wording F-3) |
| 29 | `STATELESS` "will never create an HttpSession" (§1) | `SessionCreationPolicy` 48 | Match |
| 30 | 30-minute timeout (§1, §8, Q42.01, Q42.22) | Boot `Session.java` 42 | Match |
| 31 | Session cookie property names (§3 YAML; C3) | Boot `ServerProperties`, `Session`, `Cookie` | Match |
| 32 | Spring Session "typically stored on the server's memory" (§1, Q42.02; C4) | `index.adoc` 24 | Match |
| 33 | `TokenRelay` via `OAuth2AuthorizedClientManager`, else unchanged (§3; C11) | `TokenRelayFilterFunctions` 45-72 | Match |
| 34 | Gateway YAML and in-memory store (§3, §4 practice) | `tokenrelay.adoc` 77-109 | Match |
| 35 | `OidcClientInitiatedLogoutSuccessHandler` `id_token_hint`, needs `OidcUser`, `end_session_endpoint` (§8, Q42.21) | source 65-136 | Match |
| 36 | Back-channel handler constructor, `setSessionCookieName`, `JSESSIONID` (§8 Java) | `OidcBackChannelLogoutHandler` 70-192; `login/logout.adoc` 224 | Match |
| 37 | `InMemoryOidcSessionRegistry` default (§8 Java) | `OAuth2LoginConfigurer` 830 | Match |
| 38 | `Clear-Site-Data` only on secure requests (§8 Java) | `ClearSiteDataHeaderWriter` 40, 130 | Match |
| 39 | `angular-oauth2-oidc` implicit unless `responseType: 'code'` (§7, Q42.07, Q42.20) | tarball 1965-1977 | Match |
| 40 | Class interceptor under `HTTP_INTERCEPTORS`; README lacks `withInterceptorsFromDi()` (§7) | tarball 3128-3147; README 137-145 | Match |
| 41 | No config or unset `allowedUrls` behavior (§7) | `DefaultOAuthInterceptor` 3076-3094 | Match |
| 42 | Refresh grant unless `useSilentRefresh` (§7 table) | `refreshInternal` 1100-1101 | Match |
| 43 | `angular-auth-oidc-client` defaults and `authInterceptor()` (§7, Q42.11, Q42.20) | fesm 3557-3567; d.ts 429, 780 | Match |
| 44 | Web Locks lock reuses the result only with shared storage (§4) | `refreshWithLock` 4194-4198; `DefaultSessionStorageService` | Match |
| 45 | RFC quotes (34, all sections) | RFC texts | Match (N-2 case) |
| 46 | Missing `iss` rejected (Ex 42.1) | RFC 9207 §2.4; no test | Untested (F-4) |
| 47 | Q42.05 values | `q42-05.test.ts` | Match |
| 48 | Q42.14 values | `q42-14.test.ts` | Match |

44 match, 4 findings (F-1 to F-4).

## Proposed FIX tasks

The module is at 9,315 words; the CLOSE limit was 9,359 and the REVIEW ceiling is 9,850. All fixes together add about +505 (F about +68, T-1 about +330, T-2 about +48, T-3 about +56, nits about +4; the FIX tasks measure the real delta), for about 9,820. If a fixer's count passes 9,850, it shortens its own added clauses, never a cause or a "because".

```
| FIX-M42-01 | S | todo | REVIEW-M42 |  |
| FIX-M42-02 | M | todo | REVIEW-M42 |  |
| FIX-M42-03 | S | todo | REVIEW-M42 |  |
```

- **FIX-M42-01 · S** · factual fixes F-1..F-4, N-3 and N-5, and the SOURCES note. **Sonnet** (texts and sources prescribed).
- **FIX-M42-02 · M** · teaching fixes T-1..T-3 and nits N-1, N-2, N-4. **Sonnet** (texts prescribed).
- **FIX-M42-03 · S** · anchors for the 17 file-level links into 42. **Sonnet** (mechanical; slugs listed).

## For Jorge

1. **The module is accurate but dense.** At 9,315 words for nine Spring-plus-Angular sections and 23 questions, many answers read as notes (one-word follow-ups, two-sentence explanations). T-1 restores the reasons the style guide requires within the 9,850 ceiling; a deeper fix (fewer questions, longer answers, as M42.md For Jorge 3 offered: drop Q42.07 and Q42.16) would need a re-plan. Say if you want that.
2. **Spring's docs and source disagree on trusted algorithms.** `jwt.adoc` (7.1.1) says `jws-algorithms` sets what the resource server trusts; Boot v4.1.1's `JwtDecoderConfiguration` applies it only with `jwk-set-uri`, and with only `issuer-uri` the JWKS keys' algorithms are trusted. The module follows the source (SEC-M42-05 noted it too); a docs issue upstream may be worth filing.
3. **Carried from CLOSE-M42 (no FIX):** M42.md For Jorge 1 (VERSIONS.md rows: Spring Session 4.1.1, Spring Authorization Server 7.1.1, Spring Cloud 2025.1.3 / Gateway 5.0.3, Nimbus JOSE + JWT 10.9.1, an "Auth client libraries" row with both 22.0.2 packages; Boot 4.1's `spring-boot-starter-oauth2-*` deprecated for `spring-boot-starter-security-oauth2-*`) and For Jorge 2 (an optional `angular-auth-oidc-client@22.0.2` install) remain open.
4. **`withAppInitializerAuthCheck()` uses the deprecated `APP_INITIALIZER`** (`angular-auth-oidc-client` 22.0.2, read today); the module's Partial setup shows it as the library's API, which is accurate. If you would rather the guide steer readers to `provideAppInitializer(() => inject(OidcSecurityService).checkAuth())`, that is a small judgment edit to §7 (not proposed as a FIX).
