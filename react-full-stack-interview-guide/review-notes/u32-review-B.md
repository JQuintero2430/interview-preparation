# U32 review B

## Claims
15-performance.md:64 | confirmed | Profiler shipped with React 16.5 (React blog) | https://legacy.reactjs.org/blog/2018/09/10/introducing-the-react-profiler.html
15-performance.md:60 | confirmed | DevTools setting labels exact (source files) | https://github.com/facebook/react/blob/main/packages/react-devtools-shared/src/devtools/views/Settings/GeneralSettings.js
15-performance.md:292 | confirmed | compiler skips ClassDeclaration/ClassExpression | https://github.com/facebook/react/blob/main/compiler/packages/babel-plugin-react-compiler/src/Entrypoint/Program.ts
15-performance.md:406 | confirmed | lazy "just works" with SSR in 18 (WG post); CHANGELOG only says "new streaming renderer" | https://github.com/reactwg/react-18/discussions/37
15-performance.md:470 | confirmed | content-visibility Baseline 2024 newly available | https://developer.mozilla.org/en-US/docs/Web/CSS/content-visibility
15-performance.md:588 | kept | README has Vite + Rolldown sections, no Vite 8 statement; run a build | https://github.com/btd/rollup-plugin-visualizer
15-performance.md:603 | corrected | @next/bundle-analyzer is webpack-only; Turbopack uses `next experimental-analyze` (16.1+) | https://nextjs.org/docs/app/guides/package-bundling
15-performance.md:653 | confirmed | getXXX->onXXX rename in web-vitals v3.0.0 | https://github.com/GoogleChrome/web-vitals/blob/main/CHANGELOG.md
15-performance.md:1134 | kept | step-2 log under compiler needs the playground; not checkable from docs | https://playground.react.dev
16-error-handling.md:359 | confirmed | build.sourcemap boolean|'inline'|'hidden', default false | https://vite.dev/config/build-options
17-data-fetching.md:392 | confirmed | isMutating counts pending; onSettled runs before dispatch(success), so it counts itself (source) | https://github.com/TanStack/query/blob/main/packages/query-core/src/mutation.ts
17-data-fetching.md:539 | confirmed | SWR 2.0 features, community devtools, default cache = empty Map w/o eviction | https://swr.vercel.app/blog/swr-v2
17-data-fetching.md:1569 | confirmed | RTK Query added in RTK 1.6.0 | https://github.com/reduxjs/redux-toolkit/releases/tag/v1.6.0
18-state-management.md:311 | kept (partly confirmed) | createAsyncThunk = RTK 1.3.0 confirmed; condition/getPendingMeta/dispatchConditionRejection minors still open | https://github.com/reduxjs/redux-toolkit/releases/tag/v1.3.0
18-state-management.md:520 | kept | Jotai v3 useAtomValue mount-timing detail not found on use-atom page; migration URL guessed 404 | https://jotai.org/docs/core/use-atom
18-state-management.md:522 | kept | Recoil archive date not exposed by GitHub | https://github.com/facebookexperimental/Recoil
18-state-management.md:528 | confirmed | MobX 7 breaking changes summarized from CHANGELOG | https://github.com/mobxjs/mobx/blob/main/packages/mobx/CHANGELOG.md
18-state-management.md:571 | confirmed | XState v5 migration list from Stately guide | https://stately.ai/docs/migration
19-routing.md:43 | confirmed | Navigation API Baseline 2026 newly available (Jan 2026) | https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API
19-routing.md:276 | confirmed | ensureQueryData(options): Promise<TData>, deprecated for queryClient.query | https://tanstack.com/query/v5/docs/reference/QueryClient
19-routing.md:469 | confirmed | public onError prop on RouterProvider/HydratedRouter | https://reactrouter.com/how-to/error-reporting
19-routing.md:517 | confirmed | react-router-dom-v5-compat package name | https://github.com/remix-run/react-router/discussions/8753
19-routing.md:9 | n/a | provenance note mentioning the marker, not a claim | -
20-testing.md:461 | confirmed | Jest 27 made modern fake timers default | https://jestjs.io/blog/2021/05/25/jest-27
20-testing.md:525 | confirmed | Playwright 3 engines + default parallel; Cypress WebKit experimental flag, parallel needs Cloud --record | https://docs.cypress.io/app/references/experiments
20-testing.md:621 | confirmed | vitest-axe import paths per README | https://github.com/chaance/vitest-axe
20-testing.md:240 | corrected | Task 3: removed unsourced cause ("own cache subscription"); now matches 17:608 (observation, cause not investigated) | -
21-concurrent-ssr-server-components.md:384 | confirmed | nginx proxy_buffering on by default; X-Accel-Buffering: no | https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_buffering
21-concurrent-ssr-server-components.md:469 | corrected | server-only install is optional in Next.js (handled internally) | https://nextjs.org/docs/app/getting-started/server-and-client-components
21-concurrent-ssr-server-components.md:642 | confirmed | startViewTransition Baseline 2025 newly available (Oct 2025) | https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition
21-concurrent-ssr-server-components.md:705 | confirmed | Next 14 defaults evidenced by 15 upgrade guide quotes | https://nextjs.org/docs/app/guides/upgrading/version-15
21-concurrent-ssr-server-components.md:865 | confirmed | CVE-2025-29927 affected/patched versions | https://github.com/advisories/GHSA-f82v-jwr5-mffw
21-concurrent-ssr-server-components.md:875 | confirmed | Route Handlers in Next 13.2 | https://nextjs.org/blog/next-13-2
21-concurrent-ssr-server-components.md:942 | confirmed | RR RSC experimental, unstable_ APIs, Vite plugin | https://reactrouter.com/how-to/react-server-components
21-concurrent-ssr-server-components.md:943 | confirmed | default entry.server uses renderToPipeableStream; reveal command | https://reactrouter.com/api/framework-conventions/entry.server.tsx
21-concurrent-ssr-server-components.md:957 | confirmed | Remix->RR7 upgrade steps | https://reactrouter.com/upgrading/remix
21-concurrent-ssr-server-components.md:9 | n/a | provenance note, not a claim | -
22-production-project-structure.md:127 | kept | boundaries/dependency-cruiser/steiger option names not checked (three separate docs); marker says what to read | -
22-production-project-structure.md:373 | confirmed | @openfeature/react-sdk, OpenFeatureProvider, useFlag etc. | https://openfeature.dev/docs/reference/sdks/client/web/react
22-production-project-structure.md:439 | confirmed | formatjs extract/compile --ast --out-file | https://formatjs.github.io/docs/tooling/cli
22-production-project-structure.md:551 | kept | three tools' option names (size-limit, Lighthouse CI, custom script) not checked | -
22-production-project-structure.md:560 | corrected | actions/checkout and setup-node are at v7; sample pins v4 (code not edited, see below) | https://github.com/actions/checkout/releases
22-production-project-structure.md:589 | confirmed | nginx-unprivileged listens 8080, non-root | https://github.com/nginx/docker-nginx-unprivileged
22-production-project-structure.md:615 | confirmed | CloudFront 403/404->/index.html 200; Netlify /* /index.html 200; try_files semantics | https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/custom-error-pages-response-code.html
22-production-project-structure.md:624 | confirmed (task 2) | add_header inheritance quoted; added add_header_inherit (nginx 1.29.3) | https://nginx.org/en/docs/http/ngx_http_headers_module.html#add_header
22-production-project-structure.md:619 | confirmed (task 2) | Spring Boot serves /static,/public,/resources,/META-INF/resources at /** (already linked, now fetched) | https://docs.spring.io/spring-boot/reference/web/servlet.html
22-production-project-structure.md:679 | confirmed | @module-federation/vite, all options except dev | https://module-federation.io/integrations/build-tool/vite.html
22-production-project-structure.md:680 | confirmed | multi-zones documented in Next 16 | https://nextjs.org/docs/app/guides/multi-zones
22-production-project-structure.md:779 | corrected | FSD-Next: app/ at root, rename layers to _app/_pages | https://feature-sliced.design/docs/guides/tech/with-nextjs
22-production-project-structure.md:1779 | kept | "no single date" is honest; not a datable claim | -
22-production-project-structure.md:1783 | corrected | Enzyme has no official adapter for React 17+ (not just 18+) | https://github.com/enzymejs/enzyme
22-production-project-structure.md:1784 | kept | "no single date" is honest | -
22-production-project-structure.md:1785 | confirmed | Intl.PluralRules Baseline widely available since Sept 2019 | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules
22-production-project-structure.md:9 | n/a | provenance note | -
23-ecosystem-libraries.md:86 | confirmed | Apollo 4.3.1 / urql 5.0.4 (npm latest) | https://registry.npmjs.org/@apollo/client/latest
23-ecosystem-libraries.md:131 | confirmed | ajv 8.20.0 (npm latest) | https://registry.npmjs.org/ajv/latest
23-ecosystem-libraries.md:154 | confirmed | Chakra v3 migration details | https://chakra-ui.com/docs/get-started/migration
23-ecosystem-libraries.md:164 | kept | TanStack Table v9 migration page returned HTTP 500 twice; check it | https://tanstack.com/table/latest/docs/guide/migrating
23-ecosystem-libraries.md:165 | confirmed | AG Grid Enterprise-only features | https://www.ag-grid.com/react-data-grid/community-vs-enterprise/
23-ecosystem-libraries.md:166 | confirmed | MUI X free/Pro/Premium split; 9.14.0 | https://mui.com/x/introduction/licensing/
23-ecosystem-libraries.md:191 | confirmed | Temporal = Limited availability on MDN | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal
23-ecosystem-libraries.md:196 | confirmed | Motion recommends `motion` + `motion/react` | https://motion.dev/docs/react-upgrade-guide
23-ecosystem-libraries.md:282 | kept | moment maintenance-mode date not on docs page (points to /news) | https://momentjs.com/docs/
23-ecosystem-libraries.md:286 | confirmed | react-test-renderer deprecated in React 19.0 | https://react.dev/blog/2024/04/25/react-19-upgrade-guide
23-ecosystem-libraries.md:291 | kept | react-beautiful-dnd archive date not exposed by GitHub API | -
23-ecosystem-libraries.md:292 | confirmed | full React 19 removal list | https://react.dev/blog/2024/04/25/react-19-upgrade-guide
23-ecosystem-libraries.md:430 | confirmed | Temporal Limited availability | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal
23-ecosystem-libraries.md:568 | kept | vendor cost is not checkable; marker is honest | -
23-ecosystem-libraries.md:599 | kept (partly confirmed) | yjs 13.6.33, automerge 3.5.0 confirmed; React bindings open | https://registry.npmjs.org/yjs/latest
23-ecosystem-libraries.md:806 | kept (partly confirmed) | v8 import paths confirmed; guide silent on duplicate contexts | https://reactrouter.com/upgrading/v7
23-ecosystem-libraries.md:811 | confirmed | Motion guidance | https://motion.dev/docs/react-upgrade-guide
23-ecosystem-libraries.md:837 | confirmed | react-test-renderer deprecation in 19.0 | https://react.dev/blog/2024/04/25/react-19-upgrade-guide
23-ecosystem-libraries.md:9,74 | n/a | provenance notes | -
24-react-with-spring-boot.md:158 | confirmed | Max-Age caps FF 24h, Chromium 2h (v76+), default 5s | https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Access-Control-Max-Age
24-react-with-spring-boot.md:316 | confirmed | csrf.spa() since Spring Security 7.0; added the issue #18718 caveat | https://docs.spring.io/spring-security/site/docs/current/api/org/springframework/security/config/annotation/web/configurers/CsrfConfigurer.html
24-react-with-spring-boot.md:378 | confirmed | spring-cloud-starter-gateway-server-webmvc + TokenRelay filter | https://docs.spring.io/spring-cloud-gateway/reference/spring-cloud-gateway-server-webmvc/starter.html
24-react-with-spring-boot.md:620 | confirmed | springdoc-openapi 3.x for Boot 4 | https://springdoc.org/
24-react-with-spring-boot.md:741 | confirmed | Spring Data 3.3 PageImpl warning + PagedModel/VIA_DTO | https://docs.spring.io/spring-data/commons/reference/repositories/core-extensions.html
24-react-with-spring-boot.md:796 | kept | about a missing test in this repo, not an external claim | -
24-react-with-spring-boot.md:841 | confirmed | Spring docs keep SockJS as optional fallback | https://docs.spring.io/spring-framework/reference/web/websocket/fallback.html
24-react-with-spring-boot.md:1652 | kept | describes a test limitation (jsdom vs Node Blob), not checkable from docs | -
24-react-with-spring-boot.md:1804 | confirmed | Spring Data 3.3 | https://docs.spring.io/spring-data/commons/reference/repositories/core-extensions.html
24-react-with-spring-boot.md:20 | confirmed (task 2) | starter-web -> starter-webmvc in Boot 4 (@WebMvcTest package is verified by the repo build, not docs) | https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Migration-Guide
24-react-with-spring-boot.md:182 | confirmed (task 2) | @CrossOrigin since 4.2 | https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/CrossOrigin.html
24-react-with-spring-boot.md:186 | confirmed (task 2) | allowedOriginPatterns since 5.3, echoes matched origin | https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/cors/CorsConfiguration.html
24-react-with-spring-boot.md:445 | confirmed (task 2) | RFC 9457 obsoletes 7807; absent type = about:blank | https://www.rfc-editor.org/rfc/rfc9457.html
24-react-with-spring-boot.md:1018 | confirmed (task 2) | ProblemDetail since 6.0 | https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/http/ProblemDetail.html
25-frontend-system-design.md:230 | confirmed | maxPages semantics | https://tanstack.com/query/v5/docs/framework/react/guides/infinite-queries
25-frontend-system-design.md:644 | confirmed | Idempotency-Key = expired I-D (-07, 2025-10-15), not RFC | https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/
25-frontend-system-design.md:740 | confirmed | S3 5 MiB-5 GiB parts, last part any size, 10,000 parts | https://docs.aws.amazon.com/AmazonS3/latest/userguide/qfacts.html
25-frontend-system-design.md:833 | kept | deployment-specific (your emitter/proxy); a test reminder | -
25-frontend-system-design.md:962 | kept | Google Docs OT / Notion / Yjs-vs-Automerge numbers have no primary source | -
25-frontend-system-design.md:1105 | confirmed | Idempotency-Key expired draft | https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/
25-frontend-system-design.md:1126 | confirmed | S3 limits | https://docs.aws.amazon.com/AmazonS3/latest/userguide/qfacts.html
25-frontend-system-design.md:138,1168 | confirmed (task 2) | INP<=200ms, LCP<=2.5s, CLS<=0.1 at p75 | https://web.dev/articles/vitals
25-frontend-system-design.md:234 | confirmed (task 2) | feed: posinset/setsize -1, aria-busy | https://www.w3.org/WAI/ARIA/apg/patterns/feed/
25-frontend-system-design.md:418 | confirmed (task 2) | role=log implicit polite | https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/log_role
25-frontend-system-design.md:424,2002 | confirmed (task 2) | WebSocket ctor takes url+protocols only | https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/WebSocket
25-frontend-system-design.md:848 | confirmed (task 2) | WCAG 2.2.1 | https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html
25-frontend-system-design.md:1996 | confirmed (task 2) | WCAG 2.2.2 >5 s pause/stop/hide | https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html
26-machine-coding.md:352 | corrected (task 2) | current APG accordion lists only Enter/Space, Tab; arrow/Home/End no longer listed as optional (code comment at 392 inside `// file:` block still says "Optional in the APG pattern" - reported, not edited) | https://www.w3.org/WAI/ARIA/apg/patterns/accordion/
26-machine-coding.md:469 | confirmed (task 2) | tabs Left/Right wrap, Home/End optional | https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
26-machine-coding.md:1205 | confirmed (task 2) | tree keys | https://www.w3.org/WAI/ARIA/apg/patterns/treeview/
26-machine-coding.md:1986 | confirmed (task 2) | combobox Escape clear is optional; focus stays on input w/ aria-activedescendant | https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
26-machine-coding.md:2447,2572 | confirmed (task 2) | WCAG 2.5.7 AA | https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html
26-machine-coding.md:2570 | corrected (task 2) | "Baseline 2022+" -> dialog Mar 2022, inert Apr 2023 | https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert
26-machine-coding.md:2574 | confirmed (task 2) | IntersectionObserver Baseline since Mar 2019 | https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
28-rapid-fire-bank.md:661 (28.7 Q9) | confirmed | later object property wins | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
28-rapid-fire-bank.md:851 (28.9 Q12) | confirmed | extra setup+cleanup per Effect, dev only | https://react.dev/reference/react/StrictMode
28-rapid-fire-bank.md:985 (28.11 Q7) | confirmed | use in conditionals/loops, not try/catch | https://react.dev/reference/react/use
28-rapid-fire-bank.md:1548 (28.17 Q16) | confirmed | EventSource auto-reconnect; setQueryData | https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events
28-rapid-fire-bank.md:1872 (28.21 Q1) | confirmed | new features need createRoot; old API = React 17 mode | https://react.dev/blog/2022/03/29/react-v18
28-rapid-fire-bank.md:2051 (28.22 Q6) | confirmed | Intl.PluralRules per-locale categories | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules
28-rapid-fire-bank.md:2329 (28.25 Q11) | corrected | "metadata grows forever unless GC" softened: Yjs GCs deleted content by default; awareness for presence | https://docs.yjs.dev/api/y.doc
28-rapid-fire-bank.md:2361 (28.26 Q4) | confirmed | APG tabs arrows; dialog Tab wrap, Escape, focus return | https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/

## Floors (counted by grep)
15 Q36 Ex4 gotchas20 mermaid1 | 16 Q32 Ex4 g18 m2 | 17 Q36 Ex4 g17 m3 | 18 Q40 Ex5 g27 m2 | 19 Q36 Ex6 g21 m2 | 20 Q35 Ex6 g23 m3 | 21 Q45 Ex7 g34 m3 | 22 Q28 Ex5 g22 m1 | 23 Q25 Ex6 g17 m1 | 24 Q35 Ex4 g25 m4 | 25 Q28 Ex3 g20 m17 | 26 Q26, 18 exercises (Statement blocks) g20 m2 | 27 Q27 Ex4 g20 m1. Predict-the-output exercise present (by heading) in each of 15-21. No module below a floor. 28/29 are banks (floors n/a).

## Glossary (29)
Retagged to [Protocol: …]: JWT, OIDC, OAuth 2.0, OpenAPI, PKCE, STOMP; Refresh-token rotation -> [Protocol: OAuth 2.0]; BFF -> [System design]. Intro tag list now names [Protocol: name], [System design], [Interview].
Left as [Backend: Spring]: CorsConfigurationSource, CSRF token repository, Resource server, Problem Details/ProblemDetail (mixed RFC 9457 + Spring class; could be [Protocol: RFC 9457]), Pagination contract (arguably [System design]).
All tags are STYLE forms. Inconsistencies to consider: React Router tagged both [Library: React Router] (line ~513) and [Framework: React Router]; Playwright tagged both [Library: Playwright] and [Tooling: Playwright]; generic Tooling names [Tooling: bundler], [Tooling: CI], [Tooling: i18n].

## Code/test issues reported, not edited
- 22: GitHub Actions samples (~lines 1689, 1690, 1712, 1713, 1730) pin actions/checkout@v4 and setup-node@v4; both actions are at v7. Prose now says so; the code needs a coordinator decision.
- 26: comment in `// file: examples/web/src/m26-machine-coding/accordion/Accordion.tsx` (~line 392) says Up/Down/Home/End are "Optional in the APG pattern"; the current APG accordion page no longer lists them. Fix the comment in the source file and resync.
- 15:1134: the compiler step-2 log is still unverified (needs the compiler playground).
- No other code block or test looked wrong in the passages read.
