# REVIEW-M43: `modules/43-fullstack-realtime.md`

- **Reviewer:** a fresh reviewer subagent (claude-opus-5-5) of session S20261022-0737-claudecode. It wrote nothing in module 43, continues none of the PLAN, SEC, EX, QB or CLOSE-M43 conversations, and so is eligible (RUN.md §4). It ran no build and no test suite (the main session owns execution and its runs are the basis below); it read files, ran read-only scripts and fetched sources. Job-state updates and every fix belong to the main session.
- **Date:** 2026-10-22.
- **Files read:**
  - the whole module (2,007 lines; line numbers below are as of this review and will move at FIX time; every fix names its quoted text, which a fixer finds by text, not by number);
  - `_meta/modules/M43.md` (Handoffs into 43, F1-F31, "Could not be read" C1-C18, the owner map, anchor candidates, breadth gate, For Jorge 1-5, "Corrections found while writing" through QB-M43-02), QUALITY-BAR, REVIEW-M42 (the format model), the REVIEW-M43 and module-43 common-rules blocks in TASKS.md, the CLOSE-M43 LOG line (LOG.md 1763), `SOURCES.md` `## Module 43` (lines 2947-3064, grepped);
  - every module-43 lab file: labs/ts-js `concepts/` (`transport-model.ts`, `sse-parser.ts`, `sse-reconnect.ts`, `sse-format.ts`, `event-log.ts`, `stomp-frame.ts`, `handshake-guard.ts`, `broker-model.ts`, six tests), `exercise-1-resumable-sse/` (headers, titles), `src/outputs/43-fullstack-realtime/q43-04.test.ts` and `q43-12.test.ts`; labs/angular `concepts/` (`sse-client.ts`, `live-socket.ts`, `live-store.ts`, `testing/fake-event-source.ts`, `testing/fake-web-socket.ts`, three specs), `exercise-2-resilient-socket/`, `exercise-3-live-board/` (titles, headers, fakes) and `outputs/q43-13.spec.ts`;
  - other modules only for `### Q` headings (09, 21, 22, 23, 37, 42) and the lines linking `43-fullstack-realtime.md` (09, 23, 27, 37, 41, 42), plus 41's `## 8.` heading.
- **Sources re-read (2026-10-22), fetched into `/Users/jorge.quintero/.claude/jobs/4a727236/tmp/review43` and deleted:**
  - raw GitHub `spring-framework` `v7.0.9`: `SseEmitter.java` (`SseEmitter(Long)` `@since 4.2.2`; `SseEventBuilderImpl` writes `id:`, `event:`, `retry:`, `:` comment, `data:` with no space), `ResponseBodyEmitter.java` (timeout javadoc "By default not set … the default configured in the MVC Java Config … or if that's not set, then the timeout depends on the default of the underlying server"; `send` note: no `completeWithError` needed after an `IOException`; `onCompletion` "for any reason including timeout and network error"), `TimeoutDeferredResultProcessingInterceptor.java` ("a 503 error"), `StompSubProtocolHandler.java` (`CONNECTED` gets `setHeartbeat(0, 0)` when the broker's ack carries none; `sendErrorMessage` → `ERROR` then `CloseStatus.PROTOCOL_ERROR`; `getDisconnectReceipt`: a `RECEIPT` only for `DISCONNECT`; `messageSizeLimit = 64 * 1024`), `SimpleBrokerMessageHandler.java` (`setTaskScheduler` sets `10000, 10000`; "Heartbeat values configured but no TaskScheduler provided"; `SessionInfo.HEARTBEAT_MULTIPLIER = 3`, read interval `max(client[0], server[1]) × 3`), `SimpleBrokerRegistration.java`, `StompBrokerRelayRegistration.java` (every setter in §9's chain, `setUserDestinationBroadcast`, `setUserRegistryBroadcast`), `MessageBrokerRegistry.java`, `StompBrokerRelayMessageHandler.java` (defaults `127.0.0.1`, `61613`, `guest`/`guest` ×2, system heart-beats 10000/10000; class javadoc: an independent TCP connection per `CONNECT`, one "system" connection for messages without a session id), `UserRegistryMessageHandler.java` (expiration 20 s, broadcast every `/ 2`), `UserDestinationMessageHandler.java` (`setBroadcastDestination`), `SubProtocolWebSocketHandler.java` (`sendTimeLimit = 10 * 1000`, `sendBufferSizeLimit = 512 * 1024`, `decorateSession` builds the 3-argument decorator, `getSendTimeLimit`/`getSendBufferSizeLimit`, 2-argument constructor `(MessageChannel, SubscribableChannel)`), `ConcurrentWebSocketSessionDecorator.java` (3-argument constructor → `OverflowStrategy.TERMINATE`; 4-argument constructor; `checkSessionLimits` runs only when another send holds the lock; `DROP` "Drop the oldest messages from the buffer"; `limitExceeded` → `SESSION_NOT_RELIABLE`), `CloseStatus.java` (4500, 1002), `WebSocketTransportRegistration.java` (`setSendTimeLimit(int)`, `setSendBufferSizeLimit(int)` return the registration), `WebSocketMessageBrokerConfigurationSupport.java` (`subProtocolWebSocketHandler` bean, no overflow setter), `WebMvcStompWebSocketEndpointRegistration.java` (`OriginHandshakeInterceptor` appended last), `OriginHandshakeInterceptor.java` (403 unless `WebUtils.isSameOrigin` or allowed), `WebUtils.java` (`isSameOrigin`: no `Origin` → true; servlet scheme, server name and port; javadoc: ignores `Forwarded`/`X-Forwarded-*`, "Consider using the `ForwardedHeaderFilter`"), `ForwardedHeaderFilter.java` (wrapper overrides `getScheme`, `getServerName`, `getServerPort`); docs `web/webmvc/mvc-ann-async.adoc` (lines 159-160 the request thread exits; 233 "remain blocking"; 488-502 Disconnects), `web/webflux/reactive-spring.adoc` (600-609 Streaming heartbeat), `web/websocket/server.adoc` (155-162 same-origin default, "Nothing prevents other types of clients from modifying the `Origin`"), `web/websocket/fallback.adoc` (121-123 `sessionCookieNeeded`), `websocket/stomp/handle-simple-broker.adoc` (`@Lazy` scheduler), `handle-broker-relay.adoc` (line 5 "does not support acks, receipts"), `handle-broker-relay-configure.adoc` (single "system" connection, `BrokerAvailabilityEvent`), `authentication.adoc` (27-30 `login`/`passcode` ignored), `authentication-token-based.adoc` (21-23 "inadvertently logged", 46-49 "ordered ahead", `@Order(Ordered.HIGHEST_PRECEDENCE + 99)`, line 4 Spring Security OAuth link), `configuration-performance.adoc` (52-60 limits, 66-79 16K splitting, 85-86 "Currently, you cannot do that with the simple broker"), `user-destination.adoc`, `message-flow.adoc`, `handle-annotations.adoc`; the include-code files (C12) `framework-docs/src/main/java/.../websocketstomphandlesimplebroker/WebSocketConfiguration.java`, `.../websocketstompauthenticationtokenbased/WebSocketConfiguration.java`, `.../websocketstomphandlebrokerrelay/WebSocketConfiguration.java`;
  - raw GitHub `spring-security` `7.1.1`: `XorCsrfChannelInterceptor.java` (javadoc "a CSRF token masked by the XorCsrfTokenRequestAttributeHandler in the header of any CONNECT message"; expected token from session attributes, else `MissingCsrfTokenException`; header named by `expectedToken.getHeaderName()`; `XorCsrfTokenUtils.getTokenValue(actual, expected)` then constant-time compare), `XorCsrfTokenUtils.java` (base64url decode; `!= tokenSize * 2` → null), `CsrfTokenHandshakeInterceptor.java` (copies `DeferredCsrfToken.get()` raw into a new `DefaultCsrfToken`; nothing when the attribute is absent), `WebSocketMessageBrokerSecurityConfiguration.java` (package-private `final`; `CSRF_CHANNEL_INTERCEPTOR_BEAN_NAME = "csrfChannelInterceptor"`; default `anyMessage().authenticated()`; order security context, CSRF, authorization; `CsrfTokenHandshakeInterceptor` added first), `MessageMatcherDelegatingAuthorizationManager.java` (Builder methods in §7's chain; no match → abstain), `AuthorizationChannelInterceptor.java` (`result == null` → `AccessDeniedException`, "default deny"), `XorCsrfTokenRequestAttributeHandler.java`; docs `servlet/integrations/websocket.adoc` (36 "Any inbound CONNECT message requires a valid CSRF token", 51-56 callouts incl. "anything other than Message type of `MESSAGE` or `SUBSCRIBE`", 90 "impersonate the system", 117, 127, 154, 172-184 `CsrfToken` endpoint, 222 "CSRF is not configurable");
  - raw GitHub `spring-boot` `v4.1.1`: `module/spring-boot-webmvc/.../WebMvcProperties.java` (`Async.requestTimeout`: "If this value is not set, the default timeout of the underlying implementation is used");
  - tomcat.apache.org Tomcat 11 HTTP connector (page version 11.0.27): `asyncTimeout` "Servlet specification default of 30000";
  - html.spec.whatwg.org §9.2 (fetched 2026-10-22), websockets.spec.whatwg.org (§3.1 constructor `(url, optional protocols)`; §4 `error` then `close`), rfc-editor.org RFC 6455, 6202, 8030, 8292 (`.txt`), stomp.github.io STOMP 1.2;
  - `npm pack` (extracted, read, deleted): `@stomp/stompjs@7.5.0` (`src/client.ts`: `reconnectDelay` 5000, `maxReconnectDelay` 15 min, `LINEAR`, `heartbeatIncoming`/`Outgoing` 10000, `heartbeatToleranceMultiplier` 2, `splitLargeFrames` false, `maxWebSocketChunkSize` 8 KiB, delay reset in `onConnect`; `src/stomp-handler.ts` `_setupHeartbeat`), `@stomp/rx-stomp@2.4.0` (`src/rx-stomp.ts`: `configure`, `beforeConnect(this)`, `publish` queues unless `retryIfDisconnected: false`, `watch` doc "Messages may be missed during broker-side reconnect windows" and "A hot Observable", `coldObservable.pipe(share())`; `src/rx-stomp-config.ts`; `src/rx-stomp-state.ts`); `npm view sockjs-client` 1.6.1, `time.modified` 2022-10-22;
  - read-only in `labs/angular/node_modules`: `rxjs` 7.8.2 `src/internal/observable/innerFrom.ts` (imports `readableStreamLikeToAsyncGenerator`; `isAsyncIterable` tested before `isReadableStreamLike`) and `src/internal/util/isReadableStreamLike.ts` (`releaseLock()`, no `cancel()`).
- **Basis of each finding:** a framework source or docs page at its release tag, a package source, a specification read on the date above, a committed test, or a read-only script. **Not re-read** (their basis is the SEC/EX/QB LOG lines and SOURCES.md): RFC 8291, the MDN Baseline pages (the six markers match SOURCES), Angular 22.2.1 `FetchBackend`, `rxjs-interop.mjs` and `_resource-chunk.mjs`, RxJS `WebSocketSubject.ts`, `share.js`, `retry.ts`, `repeat.ts`, `audit.js`, the owners' texts in 09, 21, 22, 23, 27, 29, 32, 33, 37, 41, 42. The mermaid diagrams were not re-parsed and `tsc` was not run.
- **Probe files:** none in the repository. Sources, tarballs and two read-only search scripts lived in the job tmp dir above, which was deleted. The reviewer created only this file and edited `_meta/TASKS.md`.

Overall, an accurate module: every Spring Framework, Boot and Security claim sampled traces to the named file at its tag, including both docs-versus-source corrections the plan found (`csrfChannelInterceptor`, the masked token on `CONNECT`); every WHATWG, RFC and STOMP quote sits at the section it cites; all 11 Java fences carry the banner and use only APIs that exist in 7.0.9 and 7.1.1; rx-stomp and stompjs are "read, not run" and match the 2.4.0 and 7.5.0 tarballs; our models and fakes are named as ours; no Angular-style marker sits on a Spring, RxJS, library, spec or RFC fact; no test opens a connection or reads the clock; Q43.04, Q43.12 and Q43.13 equal their assertions. No Major finding. The REVIEW-M42 patterns recur far less: 6 bare follow-ups or traps (T-1; M42 had 33), 2 thin Misconceptions (T-2; M42 had 5), 0 step lists without an approach (M42 had 3). Findings:
- four Minor factual findings: Exercise 43.2's "ask for a STOMP `RECEIPT`" does not hold for the simple broker (F-1); Q43.05 says §9.2.1 "reserves" 204 (F-2); §5's stompjs "× 2 of silence" contradicts Exercise 43.2's "two to three intervals" (F-3); the planned fact "`CONNECT`'s `login`/`passcode` are ignored" is absent (F-4, module-specific check);
- four Minor teaching findings: six follow-ups and traps without a reason (T-1); two Misconceptions whose correction is thin (T-2); the 41 handoff "streaming download versus pushed events" is not honored (T-3); the §5 "Sizes" bullet CLOSE-M43 cut is restored within budget (T-4);
- five nits and the anchor handoffs (7 rows).

**Items left to this review by earlier sessions, settled:**
- **§5 "Sizes" bullet (16K versus 8 KiB), cut by CLOSE-M43:** restore (T-4, +38). It is the only place the module states Spring's 64 KiB `messageSizeLimit` and a docs-versus-library disagreement (For Jorge 4d), re-read today in `configuration-performance.adoc` 66-79, `StompSubProtocolHandler` and stompjs `client.ts`; the budget has room (9,423 → about 9,680).
- **C2** (origin checks behind a proxy): resolved. `WebUtils.isSameOrigin` (7.0.9) compares `Origin` with `getScheme()`, `getServerName()`, `getServerPort()`, and its javadoc says it ignores `Forwarded`/`X-Forwarded-*` and to "Consider using the `ForwardedHeaderFilter`", whose request wrapper overrides exactly those three getters. §7's "a TLS proxy needs `ForwardedHeaderFilter`" stands; a missing `Origin` passes (`origin == null` → true), as SEC-M43-07 recorded.
- **C9** (several instances, user destinations): resolved. `StompBrokerRelayRegistration.setUserDestinationBroadcast`/`setUserRegistryBroadcast` exist (only there), `UserRegistryMessageHandler` broadcasts every 20 s / 2 = 10 s, `UserDestinationMessageHandler.setBroadcastDestination` sends unresolved messages on; §9's "every 10 s" and "lets others try" match. `MultiServerUserRegistry` itself was not re-read; no sentence depends on its internals.
- **C12** (include-code snippets): resolved. §5's `StompConfig` follows `websocketstomphandlesimplebroker/WebSocketConfiguration.java` (the `@Lazy` setter verbatim; the docs use `10000, 20000`, the module `10000, 10000`, both valid); §7's `StompTokenConfig` follows `websocketstompauthenticationtokenbased/WebSocketConfiguration.java` plus the `@Order` the page's prose prescribes; §9's relay follows `websocketstomphandlebrokerrelay/WebSocketConfiguration.java` with read setters. No snippet is presented as a docs quote.
- **QUALITY-BAR items left to REVIEW** (B2, B4, B7, B9, B10, C1, C3, C5, D2, D4, D5, E2-E4, H1): walked below; B7, B10 and C1 are Partial (T-2, T-3, F-1..F-3), the rest Pass (H1 on main's runs).

**Plan facts found wrong or superseded** (the module already follows the corrections, or a FIX does): F24's quote "(that is, basic and digest)" reads "(that is, basic HTTP authentication)" at v7.0.9 (`authentication-token-based.adoc` line 17; the module does not quote it); F2's "`watch` … cold" (the source documents "hot" and pipes `share()`; Q43.14 says "shared"); F9's separate 204 path (superseded by SEC-M43-02); F20/F24's "login headers ignored" was planned but never written (F-4).

**Prose:** 9,423 words now (`module-stats.mjs`, main's run; the QUALITY-BAR python counter agrees, re-run read-only by the reviewer). The fixes add about +255, for about 9,680: under the REVIEW ceiling of 9,850 and the hard cap of 10,000.

## Runs (main session, Node 24, 2026-10-22; the reviewer ran none)

- `labs/ts-js`: `npx vitest run 43`: 9 files, 40/40 passed (includes `q43-04.test.ts` and `q43-12.test.ts`).
- `labs/angular`: `npx ng test --watch=false --include 'src/app/modules/43-fullstack-realtime/**/*.spec.ts'`: 6 files, 39/39 passed (includes `outputs/q43-13.spec.ts`).
- `node labs/tools/check-links.mjs --planned`: all resolve.
- `node labs/tools/check-snippets.mjs . 43`: OK.
- `node labs/tools/module-stats.mjs`: 43 = 21 Q, 3 Ex, 9,423 prose words, no flag.

No lab file changes are requested: every finding is a Markdown text change. The FIX tasks re-run `check-snippets` (N-5 edits a Partial comment) and `check-links` (T-3 and FIX-M43-03 add anchors).

## Reviewer's read-only script results

- **Markup:** B1: 9 of each of the six subsections; 9 `mermaid` fences and 9 "What to notice" lines; D1: 21 of each answer part; every best-practice bullet has "because"; 33 "Cause:" in 33 misconceptions; `Unverified`, `relink:`, `TASK`, `PLACEHOLDER`: 0.
- **Banners:** 11 Java fences, 11 banners (§1, §3 ×2, §5 ×2, §7 ×2, §9 ×2, Q43.03, Q43.07).
- **Status markers:** 7, all on browser features from dated MDN reads (`EventSource` 2020, `WebSocket` 2015, `AbortController` 2019, `TextDecoderStream` 2022, `fetch` 2017, `ReadableStream` 2019) or an Angular API (`rxResource({ stream })` [Stable since v22.0]); none on Spring, RxJS, stompjs, rx-stomp, WHATWG, RFC or STOMP facts (C13).
- **Cited tests:** 21 distinct titles in backticks, all present verbatim in the module-43 labs; the three "the N `Section k: …` cases" counts equal the `it(` counts (5, 4, 4; §8's five and §9's file named by file). Exercises 43.1-43.3 criteria equal their `it(…)` titles (6 + 6 + 6, each under `describe.each`).
- **Determinism (C17):** no `Date.now`, `new Date()`, `performance.now`, `Math.random`, `getRandomValues`, `process.env`, `child_process` or real `fetch`/`WebSocket`/`EventSource` construction in any test; `Math.random` appears only in comments naming the production default; every socket is `FakeWebSocket` passed as `WebSocketCtor`, every `EventSource` comes from `FakeEventSource` through the factory token; fake timers in five spec/test files; `section-4-sse-client.spec.ts` yields with `setTimeout(resolve, 0)` (a macrotask flush, not a clock read).
- **Spec quotes:** 22 MUST/SHOULD and verbatim quotes checked with a section-finding script: all at the cited section (RFC 6455 §1.5, §5.1 ×2, §7.1.4, §7.2.3 ×2, §7.4.1 ×2, §10.2, §10.5; RFC 6202 §2.2 ×3, §5.1; RFC 8030 §5.2; RFC 8292 §2; WHATWG §9.2.2 ×3, §9.2.3, §9.2.6, §9.2.7; STOMP 1.2 Heart-beating ×2).
- **D6:** all 21 question IDs linked from the body.
- **External URLs:** the only non-example URL (MDN Baseline glossary) is in SOURCES.md; `app.example.com` and `push.example.net` are example hosts inside fences.

## QUALITY-BAR

45 items: **41 Pass, 4 Partial (B7, B10, C1, D1), 0 Fail.** H1-H3 rest on the main session.

| ID | Result | Evidence |
|---|---|---|
| A1 | Pass | Lines 3-9 in order, run commands for both labs. |
| A2 | Pass | 23 §4, §5, §7, §8 and 41 §1 anchored. |
| A3 | Pass | §1, §2, §7; Q43.01, .05, .11, .15, .18, .19; Summary. |
| A4 | Pass | 9 sections and the five closing parts. |
| A5 | Pass | Choice → SSE wire → Spring SSE → Angular SSE → STOMP → Angular WS → auth → signals → scaling and trace. |
| B1 | Pass | 9 × 6 (script). |
| B2 | Pass | Concrete failures in each (90% empty polls, an event that never fires, cut at 30 s, a sixth stalled stream, `heart-beat:0,0`, stale prices after a deploy, "Invalid CSRF Token", a burst copying the table 500 times, a slow phone closed with 4500). |
| B3 | Pass | 9 diagrams of the planned types, each with "What to notice" (not re-parsed). |
| B4 | Pass | Each "How it actually works" answers a "why" from a named file at its tag or a spec step (e.g. `XorCsrfTokenUtils` length check, `SimpleBrokerMessageHandler` heart-beat default, `checkSessionLimits` mid-send only). |
| B5 | Pass | Every `### Code` has numbered steps with an approach or reason (CLOSE added §5 step 3, §6 step 2, §9 step 4). |
| B6 | Pass | "because" on every item. |
| B7 | Partial | Two corrections too thin to correct the myth (§1 Web Push, §8 `toSignal`) (T-2). |
| B8 | Pass | Coming from the backend in §3, §5, §7, §9 with "Where the analogy breaks"; Framework vs platform in §4 and §6. |
| B9 | Pass | Terms defined at first use (long polling, full duplex, data buffer, masking, destination, handshake principal, grace period, conflation, system connection …); "fan-out" used in §5 before §9 defines it (N-4). |
| B10 | Partial | 09, 21, 22, 23, 27, 29, 32, 33, 37, 42 get a sentence and a link; 41 §8 (streaming downloads) is never linked although its handoff points here (T-3). |
| C1 | Partial | 41 of 44 sampled claims match; F-1, F-2, F-3. |
| C2 | Pass | Q43.04, Q43.12, Q43.13 printed lines equal their assertions (module-specific checks). |
| C3 | Pass | Every cited test exists; every "our model" result has a test; Spring facts are "read, not run". |
| C4 | Pass | Markers present at first mention for the browser features and `rxResource({ stream })`; none on non-Angular facts. |
| C5 | Pass | Angular names (`afterNextRender`, `toSignal`, `rxResource` with `params`/`stream`, `Injector`) exist in 22.2.1 and compile in labs; Spring names exist at the tags read. |
| C6 | Pass | 0 `Unverified`. |
| C7 | Pass | `check-snippets` passes (main); Q43.13's Output snippet uses `console.log`, and the spec says it maps to `log`. |
| C8 | Pass | The external URL is in SOURCES.md; FIX adds three re-read notes. |
| D1 | Partial | 21 × 5 parts and ≥ 2 follow-ups everywhere; six follow-ups or traps answer without a reason or without answering the question (T-1). |
| D2 | Pass | Q43.04, Q43.12, Q43.13 give the lines and one or two sentences of reasoning. |
| D3 | Pass | 6 tags (Concept 6, Bug hunt 4, Output 3, Design 3, Trade-off 3, Difference 2); max 29%. |
| D4 | Pass | Q43.01-21 follow the sections. |
| D5 | Pass | Q09.04, Q21.10, Q21.17, Q22.10, Q22.14, Q23.14-Q23.20, Q23.24-Q23.26, Q23.29, Q37.15, Q42.17 linked or untouched, none re-asked (Q43.18 asks the socket consequence of `refCount: false` and links Q23.17; Q43.13 the close semantics and links Q23.16; Q43.16 the `CONNECT` side and links Q42.17). |
| D6 | Pass | 21/21 linked from the body. |
| D7 | Pass | 21 anchors. |
| D8 | Pass | 21 ≤ 24, ≥ 15. |
| E1 | Pass | Full anatomy in all three, 2 answered follow-ups each, plus Exercise 43.2's rx-stomp comparison. |
| E2 | Pass | 18/18 criteria = titles. |
| E3 | Pass | SSE client (ts-js) → resilient socket (two variants) → integrated live board over §4, §6, §8. |
| E4 | Pass | Main's runs; no `any`; injected dependencies per class ≤ 3. |
| E5 | Pass | Q43.04, Q43.12, Q43.13. |
| F1 | Pass | Two paragraphs, all nine sections linked, no new fact. |
| F2 | Pass | Three prompts naming listeners. |
| F3 | Pass | Five flashcards. |
| F4 | Pass | Builds on, Read next, Uses later, Comparisons (Q23.29, Q22.14, Q42.17, Q37.15), each with a reason. |
| G1 | Pass | 9,423 ≤ 9,423 (CLOSE limit); about 9,680 after fixes ≤ 9,850. |
| G2 | Pass | 4/4 SYLLABUS §4 (43) checkboxes (M43.md breadth gate re-walked). |
| H1 | Pass (main) | Main's runs above. |
| H2 | Pass (main) | `check-links --planned` all resolve. |
| H3 | Pass (main) | Main checks `git status`. |

Totals: **41 Pass, 4 Partial (B7, B10, C1, D1), 0 Fail.**

## Module-specific checks

| Check | Result | Evidence |
|---|---|---|
| Spring claims traced; ≥ 10 re-read | Pass, three findings | 31 Spring Framework, Boot and Security claims re-read (table below); the named ones: `SseEmitter`'s timeout fallback (match, `ResponseBodyEmitter` javadoc and Boot `Async.requestTimeout`), the Servlet disconnect note and comment heartbeat (match, `mvc-ann-async.adoc` 488-497, `reactive-spring.adoc` 605-609), `heart-beat:0,0` without a `TaskScheduler` (match, `SimpleBrokerMessageHandler` 217-218, `StompSubProtocolHandler` 609-614), the simple broker's single-instance limit (match, `configuration-performance.adoc` 85-86), the relay defaults (match at 127.0.0.1, 61613, `guest`; the module sets every value explicitly and states no default), `sendTimeLimit` and `sendBufferSizeLimit` (match, 10 s, 512 KiB), `TERMINATE` as the default (match, 3-argument constructor), `CONNECT` login headers ignored (true at `authentication.adoc` 27-30, but absent from the module: F-4), the token interceptor's order (match, `authentication-token-based.adoc` 46-49), same-origin by default (match, `server.adoc` 158-159), CSRF required on `CONNECT` (match, `websocket.adoc` 36, 154), `XorCsrfChannelInterceptor`'s masked comparison (match), the `csrfChannelInterceptor` bean hook (match, `CSRF_CHANNEL_INTERCEPTOR_BEAN_NAME`). |
| Direction facts | Pass, one finding | Masked on `CONNECT` versus raw expected: the client header is unmasked by `XorCsrfTokenUtils.getTokenValue` and compared with the raw `DeferredCsrfToken.get()` copy (match; §7 diagram, How, Q43.16, flashcard). Heart-beat directions: client sends every `max(cx, sy)`, checks `max(cy, sx)`; Spring reads `max(client[0], server[1]) × 3` (match; the stompjs "× 2" wording is F-3). 1006: "MUST NOT be set … by an endpoint" (§7.4.1; match in §6 and Q43.13). Which responses stop `EventSource`: non-200 or other `Content-Type` "fail the connection" (§9.2.2), then "does not attempt to reconnect" (§9.2.3); aborted network error fails; other network error and body end reestablish (match; Q43.05's "reserves" is F-2). |
| WHATWG, RFC, STOMP MUST/SHOULD with section | Pass | 22 quotes at their cited sections (script). |
| Banners on Java; read APIs only | Pass | 11/11; every API exists at the tags read (`DeferredResult(Long)`, `onTimeout`, `SseEmitter.event().comment`, `ServerSentEvent.builder(T)`, `SimpleBrokerRegistration.setTaskScheduler`/`setHeartbeatValue`, `@SendToUser(destinations, broadcast)`, `MessageMatcherDelegatingAuthorizationManager.Builder` chain, `ChannelRegistration.interceptors`, `StompBrokerRelayRegistration` chain, `WebSocketTransportRegistration` chain, `SubProtocolWebSocketHandler(MessageChannel, SubscribableChannel)`, `getSendTimeLimit()`, the 4-argument `ConcurrentWebSocketSessionDecorator`). |
| rx-stomp and stompjs "read, not run", vs 2.4.0 and 7.5.0 | Pass | Both labeled "read, not run" and Partial. §6 setup: `configure`, `brokerURL`, `beforeConnect` receives the `RxStomp` (so `client.configure({ connectHeaders })` is valid), `reconnectDelay` 5000 default, heart-beats 10000, `watch`, `publish` queues while offline, `connectionState$` and `RxStompState` names; Q43.14's quote "Messages may be missed during broker-side reconnect windows" verbatim; `share()`; Exercise 43.2's "fixed 5 s without jitter, resets on `CONNECTED`, two to three intervals" (`LINEAR`, `onConnect`, `setInterval(ttl)` with `delta > ttl × 2`). |
| Q43.04, Q43.12, Q43.13 against their tests | Pass | Four, two and four lines equal `q43-04.test.ts`, `q43-12.test.ts` and `q43-13.spec.ts`; titles cited verbatim; main's runs pass. |
| T-1, T-2, T-3 patterns (REVIEW-M42) | Partial | Recurrences: T-1 6 (Q43.05, Q43.06 ×2, Q43.11 trap, Q43.12, Q43.21); T-2 2 (§1, §8); T-3 0. |
| Our models and fakes named as ours (C16) | Pass | Every lab header says "Our model, not Spring's code" (or "not the browser's", "not stompjs's or Spring's") or "Our fake"; prose: "our `longPolling`", "Our `createSseParser`", "our `FakeEventSource`", "Our codec (ours, not stompjs's or Spring's)", "our token interceptor", "Our model". |
| No Angular-style marker on Spring/RxJS/library/spec/RFC facts (C13) | Pass | Script above. |
| No real connection, clock or network in tests (C17) | Pass | Script above. |
| Handoffs into 43 honored | Partial | 23 → §6, Exercise 43.2 (backoff and `repeat` linked to 23 §4, Q23.16), Q43.18 (23:2688 flashcard); 09 → §1 (09 §3); 27 → §4 (27 §9); 37 → §1 Web Push paragraph from RFC 8030/8291/8292, naming no Spring API and no Java library (C15); 42 → §7 (the `JwtDecoder` reused, 42 §5, 42 §6); M28 → §8; **41:931 and 41:2047 → §1 and §3 "streaming a file download versus pushing events": not honored** (T-3). |
| Owners' questions not re-asked | Pass | D5 row. |
| Prose ≤ 9,850 after fixes | Pass | About 9,680. |

## Handoffs

Module 43 slugs (from the `## N.` headings, as in Contents):
- S1 `#1-choosing-a-transport-polling-long-polling-server-sent-events-websockets-and-web-push-when-no-tab-is-open`
- S3 `#3-server-sent-events-in-spring-sseemitter-in-spring-mvc-and-a-flux-of-serversentevent-in-webflux`
- S6 `#6-the-angular-websocket-client-rxjs-websocket-stomprx-stomp-and-reconnecting-without-losing-subscriptions`
- S7 `#7-authentication-on-the-handshake-cookies-tokens-in-the-connect-frame-origin-checks-and-csrf-in-spring-security`

Re-located 2026-10-22: every M43.md candidate is still at the line PLAN-M43 recorded, with exactly one link to `43-fullstack-realtime.md` on it.

| Target | Links (module:line, context), 7 rows, +0 words |
|---|---|
| S1 | 37:542 ("[43](../../modules/43-fullstack-realtime.md) owns sending from the server"), 37:1539 ("Sending is [module 43](../../modules/43-fullstack-realtime.md).") |
| S3 | 41:931 ("pushed events: [43](../../modules/43-fullstack-realtime.md).") |
| S6 | 23:2610 (Exercise 23.6 "Not covered", "WebSockets ([43](../../modules/43-fullstack-realtime.md))."), 23:2745 (Read next, "[43. Full-stack real time](../../modules/43-fullstack-realtime.md) (WebSockets, reconnection)") |
| S7 | 42:747 ("**Reuse this decoder for WebSocket handshakes** ([43](../../modules/43-fullstack-realtime.md)"), 42:2124 (Read next, "[43](../../modules/43-fullstack-realtime.md) (auth on a WebSocket handshake)") |

Each link keeps its text; only the target gains the slug. Stay file-level: the `:5` header lines (23, 37, 41, 42) and the "Uses these ideas later" lists 09:1606, 23:2746, 27:2579, 37:2106, 41:2047. 41:931 goes to §3, not the plan's §1: it sits in 41 §8 (streaming downloads), and T-3 puts the download-versus-event-stream sentence, with its link back to 41 §8, in §3.

## Factual findings

**F-1 · Minor (C1) · Exercise 43.2's delivery follow-up does not hold for the simple broker (1901).** "- *\"Was a message delivered?\"* Unknown, because `send` only queues bytes for the network (`bufferedAmount`); ask for a STOMP `RECEIPT`." Spring v7.0.9 `handle-broker-relay.adoc` line 5: the simple broker "supports only a subset of STOMP commands (it does not support acks, receipts, and some other features)"; `StompSubProtocolHandler.getDisconnectReceipt` answers a `RECEIPT` only for `DISCONNECT`. The exercise's own socket model sits on §5's simple broker, so the advice fails there silently.
- Fix (1901): "ask for a STOMP `RECEIPT`." → "ask a full broker behind the relay for a STOMP `RECEIPT`; the simple broker does not support receipts (`handle-broker-relay.adoc`) and sends one only for `DISCONNECT`." (+19)
- SOURCES.md `## Module 43 · Full-stack real time`: append at the end of the section "- `spring-projects/spring-framework` `v7.0.9` `framework-docs/modules/ROOT/pages/web/websocket/stomp/handle-broker-relay.adoc` (line 5: the simple broker \"does not support acks, receipts, and some other features\") and `spring-websocket/src/main/java/org/springframework/web/socket/messaging/StompSubProtocolHandler.java` (`getDisconnectReceipt`: a `RECEIPT` only for `DISCONNECT`), read 2026-10-22, Exercise 43.2 follow-up (REVIEW-M43 F-1)."

**F-2 · Minor (C1; direction "which responses stop EventSource") · Q43.05 follow-up (1429).** "- *Why 204 to stop?* Because §9.2.1 reserves it for a finished server." WHATWG §9.2.1 is the non-normative introduction ("a client can be told to stop reconnecting using the HTTP 204 No Content response code"); normatively a 204 is one more non-200 that takes §9.2.2's "fail the connection" step (SEC-M43-02's correction, and §2's own lab comment "A 204 takes the same step as a 500"). "Reserves" suggests a separate rule.
- Fix (1429): "- *Why 204 to stop?* Because §9.2.1 reserves it for a finished server." → "- *Why 204 to stop?* Because the non-normative §9.2.1 names it the stop signal, and, as a non-200, it takes §9.2.2's \"fail the connection\" step like a 500." (+14)

**F-3 · Minor (C1; direction "heart-beat check") · §5 stompjs wording (600) contradicts Exercise 43.2 (1897).** §5: "stompjs 7.5.0 (read, not run) sends every max(own out, server in), closes after max(own in, server out) × 2 of silence; Spring waits 3× ([Q43.12](../../modules/43-fullstack-realtime.md#q43-12))." `stomp-handler.ts` `_setupHeartbeat` runs `setInterval(…, ttl)` and closes when `delta > ttl * this.heartbeatToleranceMultiplier`, so silence is noticed at the first check after 2 × ttl, between two and three intervals, as Exercise 43.2 says ("notices silence after two to three intervals").
- Fix (600): "closes after max(own in, server out) × 2 of silence;" → "closes once silence passes max(own in, server out) × 2, checked once per interval;" (+3)

**F-4 · Minor (module-specific check "CONNECT login headers ignored"; F20, F24) · the fact is planned but absent.** Spring v7.0.9 `authentication.adoc` 27-30: "The STOMP protocol does have `login` and `passcode` headers on the `CONNECT` frame … for STOMP over WebSocket, by default, Spring ignores authentication headers at the STOMP protocol level, and assumes that the user is already authenticated at the HTTP transport level." It is the natural interview follow-up to Q43.15 ("where can the credential go"), and the module never says it.
- Fix (Q43.15, insert a third follow-up after "- *The API's decoder?* Because both doors then share one expiry rule."): "- *STOMP's `login` and `passcode`?* Ignored: \"by default, Spring ignores authentication headers at the STOMP protocol level\" (`authentication.adoc`), because it expects the handshake to carry the user." (+27)
- SOURCES.md `## Module 43`: append at the end of the section "- `spring-projects/spring-framework` `v7.0.9` `framework-docs/modules/ROOT/pages/web/websocket/stomp/authentication.adoc`, read again 2026-10-22, Q43.15 (lines 27-30): \"by default, Spring ignores authentication headers at the STOMP protocol level, and assumes that the user is already authenticated at the HTTP transport level\" (REVIEW-M43 F-4)."

## Teaching findings

**T-1 · Minor (STYLE-GUIDE §2 "An answer that only states a fact is not finished"; QUALITY-BAR D1 "each answered") · follow-ups and traps that give no reason or do not answer.** Each replacement keeps the question's topic and any link; facts are from the module's sections or the sources above. Find each by its quoted text.
- Q43.05: "- *After a bare `id`?* Because the reset left it empty, and the header goes only when it is not ([Q43.04](../../modules/43-fullstack-realtime.md#q43-04))." → "- *After a bare `id`?* No `Last-Event-ID` header, because the reset left the ID empty and the browser sends it only when it is not ([Q43.04](../../modules/43-fullstack-realtime.md#q43-04))." (+5)
- Q43.06: "- *MVC writes a `Flux` elsewhere?* Because writes \"remain blocking\" (`mvc-ann-async.adoc`)." → "- *A `Flux` returned from MVC?* Adapted like an `SseEmitter`, but its writes \"remain blocking (and are performed on a separate thread)\" (`mvc-ann-async.adoc`), because the Servlet response is blocking I/O." (+16)
- Q43.06: "- *Heartbeat in WebFlux?* Because a write is the only test." → "- *Heartbeat in WebFlux?* Yes, a periodic comment-only event, because there too only a failed write reveals a gone client (`reactive-spring.adoc`)." (+12)
- Q43.11 trap: "**Trap to avoid.** \"`@SendTo` replies to the caller\": it broadcasts, because a return value feels like a response." → "**Trap to avoid.** \"`@SendTo` replies to the caller\": it broadcasts, because its destination is a `/topic` every subscriber receives; reply to one session with `@SendToUser`." (+9; the old "because" repeated §5's myth cause, not the reason)
- Q43.12: "- *Why tolerate silence?* Because a receiver \"SHOULD be tolerant\"." → "- *Why tolerate silence?* Because timers drift: \"because of timing inaccuracies, the receiver SHOULD be tolerant\" (STOMP 1.2, Heart-beating)." (+9)
- Q43.21: "- *Tab 1's connection?* Because the relay finds it by the kept session id." → "- *Which broker connection carries it?* Tab 1's, because the `@SendTo` result keeps Tab 1's session id and the relay sends on that session's TCP connection." (+15)

**T-2 · Minor (B7, STYLE-GUIDE §4.2.7) · corrections that do not correct the myth.**
- §1 (152): "- \"Web Push replaces a live connection.\" It needs permission. Cause: it reaches closed tabs." → "- \"Web Push replaces a live connection.\" It needs permission, passes through the push service and may arrive late, up to its `TTL`. Cause: it reaches closed tabs, so it looks like a superset." (+15; RFC 8030 §5.2)
- §8 (1120): "- \"`toSignal` closes the connection.\" It unsubscribes itself on destroy (`rxjs-interop.mjs`, read). Cause: it hides the subscription." → "- \"`toSignal` closes the connection.\" It only unsubscribes on destroy (`rxjs-interop.mjs`, read); a shared socket closes when its last reader leaves and the grace period ends. Cause: it hides the subscription, so its end looks like the connection's." (+19)

**T-3 · Minor (B10; Handoffs into 43: 41:931 and 41:2047 → §1 and §3, "the difference between streaming a file download and pushing events") · handoff not honored.** 41 §8 streams a download and points here for "pushed events"; module 43 never links 41 §8 or states the difference, and the common rules list "streaming downloads (41 §8)" among the owners that get one sentence and a link.
- Fix (§3 How it actually works, insert a third bullet after the one starting "- **Why 30 seconds?**"): "- **Not a download.** A streamed file ([41 §8](../../modules/41-fullstack-api-contracts.md#8-files-multipart-and-chunked-uploads-progress-and-downloads-with-content-disposition-and-streaming)) ends when its bytes do; an event stream stays open for events that have not happened yet, so it needs ids, heartbeats and reconnection." (+36; slug from 41's heading "## 8. Files: multipart and chunked uploads, progress, and downloads with `Content-Disposition` and streaming"; the fixer confirms it with `check-links`.)

**T-4 · Minor (the item CLOSE-M43 left to this review) · restore the §5 "Sizes" bullet.**
- Fix (§5 How it actually works, insert a third bullet after the one starting "- **Why `0,0`?**"): "- **Sizes.** Spring accepts STOMP messages up to 64 KiB (`messageSizeLimit`) and reassembles split ones; its performance page says stompjs splits at 16K, but stompjs 7.5.0 splits only with `splitLargeFrames: true` (default `false`), into 8 KiB chunks." (+38)
- SOURCES.md `## Module 43`: append at the end of the section "- `spring-projects/spring-framework` `v7.0.9` `framework-docs/modules/ROOT/pages/web/websocket/stomp/configuration-performance.adoc` (lines 66-79: stompjs and others \"split larger STOMP messages at 16K boundaries\") and `StompSubProtocolHandler.java` (`messageSizeLimit = 64 * 1024`); `@stomp/stompjs@7.5.0` `src/client.ts` (`splitLargeFrames` false, `maxWebSocketChunkSize` 8 KiB), read 2026-10-22 (`npm pack`, deleted after), §5 Sizes (REVIEW-M43 T-4)."

**Nits**
- **N-1 (wrong cross-link):** Q43.12 (1579): "- *Why `0,0`?* Because without a `TaskScheduler` the server has no interval to offer ([Q43.11](../../modules/43-fullstack-realtime.md#q43-11))." → "- *Why `0,0`?* Because without a `TaskScheduler` the server has no interval to offer ([§5](../../modules/43-fullstack-realtime.md#5-websockets-and-stomp-in-spring-the-handshake-frames-messagemapping-brokers-user-destinations-and-heart-beats))." (Q43.11 is about routing, not heart-beats; 0)
- **N-2 (citation):** §4 (470): "RxJS 7.8.2 (`innerFrom.ts`, read):" → "RxJS 7.8.2 (`innerFrom.ts` and `isReadableStreamLike.ts`, read):" (`readableStreamLikeToAsyncGenerator`, with its `releaseLock()` and no `cancel()`, lives in `util/isReadableStreamLike.ts`; +2)
- **N-3 (case):** §8 (996): "- **Why NG0991?** an `rxResource` stream" → "- **Why NG0991?** An `rxResource` stream" (0)
- **N-4 (B9, term before its definition):** §5 callout (693): "the simple broker is an in-process fan-out, like application events." → "the simple broker is an in-process **fan-out** (a copy to every subscriber), like application events."; and §9 (1156): "The simple broker's **fan-out** (copying to every subscriber) stays in one JVM" → "The simple broker's fan-out stays in one JVM" (+5 −4)
- **N-5 (Partial snippet):** §7 (872): "// Partial: read, not run; `http` is an injected HttpClient and `rxStomp` is section 6's." → "// Partial: read, not run; `http` is an injected HttpClient and `rxStomp` is section 6's, for a cookie session (this beforeConnect replaces the token one)." (`RxStomp.configure` replaces `_beforeConnect`, and the stompjs `connectHeaders` are replaced too, so both snippets together would drop `Authorization`; code comment, 0 prose)

## Judged acceptable

- **23:2745 and 42:2124 are "Read next" lines yet get anchors:** M43.md's anchor candidates name them explicitly, and their parentheticals ("WebSockets, reconnection", "auth on a WebSocket handshake") name one section; REVIEW-M42 kept its Read next lines file-level because they named whole modules.
- **§5's `setHeartbeatValue(new long[] {10000, 10000})` differs from the docs' `{10000, 20000}`:** both valid; `setTaskScheduler` alone would set `10000, 10000` (`SimpleBrokerMessageHandler` 200-201), so the explicit call is redundant but harmless and makes the value visible.
- **§9's `DroppingSubProtocolHandler` wiring "not shown":** `WebSocketMessageBrokerConfigurationSupport.subProtocolWebSocketHandler` is a public `@Bean` method with no factory hook, so wiring means overriding it; the comment says so.
- **§7 `CsrfController` "masked … with or without csrf.spa()":** `XorCsrfTokenRequestAttributeHandler` (7.1.1) is the default handler and `spa()`'s handler delegates `handle` to it (REVIEW-M42, re-read in SEC-M43-07); not re-traced beyond the handler today.
- **§1 Web Push names no library:** the 37 handoff and C15 ask exactly this; "plain HTTP" stands on RFC 8030 §5.
- **`section-4-sse-client.spec.ts` `setTimeout(resolve, 0)`**: a task-queue flush, not a clock read; C17 holds.
- **Very short Full explanations** (Q43.21's is two sentences): each cites the mechanism or the section; the budget leaves no room to lengthen every answer.

## Claims sampled (44)

| # | Claim (location) | Basis | Result |
|---|---|---|---|
| 1 | Timeout: emitter's, else MVC's, else the container's (§3, Q43.06) | `ResponseBodyEmitter` 105-107; Boot `WebMvcProperties.Async` | Match |
| 2 | Tomcat 11 `asyncTimeout` 30000 (§1, §3, Q43.07) | Tomcat 11.0.27 docs | Match |
| 3 | "The Servlet API does not provide any notification when a remote client goes away"; comment-only heartbeat (§3) | `mvc-ann-async.adoc` 492-497 | Match |
| 4 | WebFlux's reference agrees (§3, Q43.06) | `reactive-spring.adoc` 605-609 | Match |
| 5 | `onCompletion` "for any reason including timeout and network error"; no `completeWithError` (§3, Q43.06, Q43.07) | `ResponseBodyEmitter` 181-184, 346-349 | Match |
| 6 | `id:x`, `event:x`, `:comment`, `data:` lines, multi-line data split (§3) | `SseEmitter.SseEventBuilderImpl` 207-260 | Match |
| 7 | Unhandled timeout is a 503 (§1, Q43.03) | `TimeoutDeferredResultProcessingInterceptor` 22-25 | Match |
| 8 | Request thread exits, response stays open (Q43.03 trap) | `mvc-ann-async.adoc` 159-160 | Match |
| 9 | MVC `Flux` writes "remain blocking" (Q43.06) | `mvc-ann-async.adoc` 233 | Match (wording T-1) |
| 10 | No `TaskScheduler` → `heart-beat:0,0` (§5, Q43.12, flashcard) | `SimpleBrokerMessageHandler` 198-218; `StompSubProtocolHandler` 609-614 | Match |
| 11 | `@Lazy` scheduler breaks a cycle (§5) | `handle-simple-broker.adoc`; include-code file | Match |
| 12 | Spring waits 3× (§5, Q43.12) | `SessionInfo.HEARTBEAT_MULTIPLIER` | Match |
| 13 | Simple broker: in memory, no "acks, receipts", one instance (§5, Q43.19) | `handle-simple-broker.adoc` 4-6; `handle-broker-relay.adoc` 5; `configuration-performance.adoc` 86 | Match |
| 14 | Relay: a TCP connection per client session, one system connection (§9) | `StompBrokerRelayMessageHandler` javadoc 56-69; `handle-broker-relay-configure.adoc` 4 | Match |
| 15 | `BrokerAvailabilityEvent` (§9 practice) | `handle-broker-relay-configure.adoc` 30-32 | Match |
| 16 | Registry broadcast every 10 s (§9) | `UserRegistryMessageHandler` 61, 115 | Match |
| 17 | Broadcast setters on the relay registration (§9 Java) | `StompBrokerRelayRegistration` 227, 245 | Match |
| 18 | `sendTimeLimit` 10 s, `sendBufferSizeLimit` 512 KiB (§9, Q43.20) | `SubProtocolWebSocketHandler` 93-95 | Match |
| 19 | `TERMINATE` default, `DROP` drops oldest, close 4500 (§9, Q43.20, flashcard) | `ConcurrentWebSocketSessionDecorator` 83-84, 219-236, 246-248; `CloseStatus` 151 | Match |
| 20 | Limit checked only mid-send (§9 step 3) | `sendMessage` → `checkSessionLimits` when `tryFlushMessageBuffer` fails | Match |
| 21 | `decorateSession` builds `TERMINATE`; no overflow setter (§9 step 2) | `SubProtocolWebSocketHandler` 435-436; `WebSocketTransportRegistration` | Match |
| 22 | Same-origin by default; other clients fake `Origin` (§7) | `server.adoc` 158-162 | Match |
| 23 | `ForwardedHeaderFilter` behind a TLS proxy (§7; C2) | `WebUtils.isSameOrigin` 770-813; `ForwardedHeaderFilter` 354-364 | Match |
| 24 | CSRF copy before the origin check (§7 diagram) | Security config line 176; `WebMvcStompWebSocketEndpointRegistration` 131-135 | Match |
| 25 | Query token "may be inadvertently logged" (§7) | `authentication-token-based.adoc` 21-23 | Match |
| 26 | `HIGHEST_PRECEDENCE + 99`, "ordered ahead" (§7) | `authentication-token-based.adoc` 46-49 | Match |
| 27 | `CONNECT` needs a CSRF token by default (§7, Q43.16) | `websocket.adoc` 36, 154 | Match |
| 28 | Browsers do not apply the same-origin policy to WebSocket (§7) | `websocket.adoc` 127 | Match |
| 29 | Masked header unmasked, compared with the raw copy; 27 bytes, not 72 (§7, Q43.16) | `XorCsrfChannelInterceptor`, `XorCsrfTokenUtils`, `CsrfTokenHandshakeInterceptor` | Match |
| 30 | "CSRF is not configurable" vs `csrfChannelInterceptor` bean; CSRF off → `CONNECT` fails (§7, Q43.16) | `websocket.adoc` 222; `WebSocketMessageBrokerSecurityConfiguration` 61, 100-103; `MissingCsrfTokenException` | Match |
| 31 | Default "authenticated"; no match denies; `nullDestMatcher` = not `MESSAGE`/`SUBSCRIBE`; "impersonate the system" (§7, Q43.16) | config 67; `AuthorizationChannelInterceptor` 72; `websocket.adoc` 51, 90 | Match |
| 32 | Refused `CONNECT` → `ERROR`, close 1002 (§7) | `StompSubProtocolHandler.sendErrorMessage` 404-420 | Match |
| 33 | `login`/`passcode` ignored (planned F20, F24) | `authentication.adoc` 27-30 | Absent (F-4) |
| 34 | stompjs ping/check rule, × 2 (§5, Q43.12) | `stomp-handler.ts` 322-346 | Wording (F-3) |
| 35 | stompjs `reconnectDelay` 5000, LINEAR, reset on connect (§6, Q43.14, Ex 43.2) | `client.ts` 124, 159, 858 | Match |
| 36 | rx-stomp `watch`, `publish` queue, `share()`, missed-messages quote, `beforeConnect(client)` (§6, Q43.14) | `rx-stomp.ts` 274-313, 442-455, 483-607 | Match |
| 37 | Receipt as delivery proof (Ex 43.2) | `handle-broker-relay.adoc` 5; `getDisconnectReceipt` | Fails on the simple broker (F-1) |
| 38 | Non-200 or wrong type fails, no reconnect; drop and end reestablish (§2, Q43.05) | WHATWG §9.2.2, §9.2.3 | Match |
| 39 | 204 "reserved" (Q43.05) | WHATWG §9.2.1 (non-normative), §9.2.2 | Wording (F-2) |
| 40 | One space stripped; incomplete event discarded; 15-second comment (§2, Q43.04, Q43.07) | WHATWG §9.2.6, §9.2.7 | Match |
| 41 | Masking MUSTs, 1006 never sent, clean close, random first reconnect, `Origin` SHOULD, auth unspecified (§5, §6, §7, Q43.13, Q43.15) | RFC 6455 §5.1, §7.4.1, §7.1.4, §7.2.3, §10.2, §10.5 | Match |
| 42 | Long-poll latency "over three", 6 or 8 connections (§1, Q43.01, Q43.03) | RFC 6202 §2.2, §5.1 | Match |
| 43 | `TTL` MUST, 400 without it; VAPID `exp` ≤ 24 h (§1, Q43.02) | RFC 8030 §5.2; RFC 8292 §2 | Match |
| 44 | Q43.04, Q43.12, Q43.13 values | `q43-04.test.ts`, `q43-12.test.ts`, `q43-13.spec.ts` | Match |

41 match, 3 findings in the module text (F-1 to F-3), 1 absent planned fact (F-4).

## Proposed FIX tasks

The module is at 9,423 words; the CLOSE limit was 9,423 and the REVIEW ceiling is 9,850. All fixes together add about +255 (F about +63, T-1 about +66, T-2 about +34, T-3 about +36, T-4 about +38, nits about +3; the FIX tasks measure the real delta), for about 9,680. If a fixer's count passes 9,850, it shortens its own added clauses, never a cause, a "because" or a link.

```
| FIX-M43-01 | S | todo | REVIEW-M43 |  |
| FIX-M43-02 | S | todo | REVIEW-M43 |  |
| FIX-M43-03 | S | todo | REVIEW-M43 |  |
```

- **FIX-M43-01 · S** · factual and content fixes F-1..F-4, T-3, T-4, N-2, N-5, and the three SOURCES notes. **Sonnet** (texts and sources prescribed).
- **FIX-M43-02 · S** · teaching fixes T-1, T-2 and nits N-1, N-3, N-4. **Sonnet** (texts prescribed).
- **FIX-M43-03 · S** · anchors for the 7 file-level links into 43. **Sonnet** (mechanical; slugs listed). Runs after FIX-M43-01 only because T-3 justifies 41:931 → §3; no heading changes, so it may run in either order.

## For Jorge

1. **The REVIEW-M42 patterns were mostly headed off.** Six bare follow-ups (against 33 in module 42) and two thin misconceptions; the plan's budgeting for reasons worked. The fixes stay well under the ceiling (about 9,680).
2. **Two Spring docs pages lag the source** (both already in the module): Security 7.1.1 says CSRF on WebSocket "is not configurable" with `@EnableWebSocketSecurity`, while the configuration class honors a `csrfChannelInterceptor` bean; Framework 7.0.9's performance page says stompjs splits at 16K, while stompjs 7.5.0 splits only on request, at 8 KiB. Upstream docs issues may be worth filing.
3. **Carried from CLOSE-M43 (no FIX):** M43.md For Jorge 1 (a VERSIONS.md "Real-time client libraries (module 43, documented only)" row: `@stomp/rx-stomp` 2.4.0 with its peers and `@stomp/stompjs` 7.5.0) and For Jorge 2 (an optional install of rx-stomp so §6 and Q43.14 could run it) remain open.
4. **Framework's token-auth page still links the retired Spring Security OAuth project** (`authentication-token-based.adoc` line 4, v7.0.9, For Jorge 4f); the module does not repeat the link, so no FIX.
