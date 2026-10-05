# 29 — Glossary

> **How to use this module.** Look a term up by letter, read the one-line definition, then follow the link to the section that explains it properly. The tag in brackets is the term's origin ([JS], [TS], [Browser], [React], [Library: name], [Framework: Next.js], [Backend: Spring], [Protocol: name], [System design], [Interview], …), which is the first thing to get right in an interview. Version notes ("since React 19", "renamed in v5") match [VERSIONS.md](VERSIONS.md).

**Prerequisites:** None

**Jump to:** [A](#a) · [B](#b) · [C](#c) · [D](#d) · [E](#e) · [F](#f) · [G](#g) · [H](#h) · [I](#i) · [J](#j) · [K](#k) · [L](#l) · [M](#m) · [N](#n) · [O](#o) · [P](#p) · [Q](#q) · [R](#r) · [S](#s) · [T](#t) · [U](#u) · [V](#v) · [W](#w) · [X](#x) · [Z](#z)

---

## A

**`<Activity>`** [React] — Component (since React 19.2) with `visible`/`hidden` modes that hides a subtree while preserving its state and cleaning up its effects. → [21 §21.9](21-concurrent-ssr-server-components.md#219-activity)

**Accessibility tree** [Browser] — The browser's parallel tree of roles, names and states, derived from the DOM, that assistive technology reads. → [04 §4.2](04-html-css-accessibility.md#42-accessibility-the-accessibility-tree-aria-rules-names-roles-states)

**Action (React)** [React] — Since React 19, a function passed to `<form action>` or run inside a transition, with pending, error and optimistic state handled by React. → [14 §14.6](14-forms-and-actions.md#146-actions-form-actionfn)

**Action (React Router)** [Framework: React Router] — A route function that handles non-GET submissions (mutations) and then triggers revalidation of loaders. → [19 §19.5](19-routing.md#195-loaders-actions-usefetcher)

**`act`** [Library: React Testing Library] — Test helper that flushes React updates and effects so assertions see the settled UI. → [20 §20.5](20-testing.md#205-async-utilities-and-act)

**Atom** [Library: Jotai] — A small, independent unit of state that components subscribe to individually. → [18 §18.9](18-state-management.md#189-atoms-jotai)

**Automatic batching** [React] — Since React 18, all state updates in one tick (events, promises, timeouts) are grouped into one render. → [08 §8.3](08-state.md#83-batching)

**APG (ARIA Authoring Practices Guide)** [Browser] — W3C's reference for keyboard interaction and ARIA patterns of widgets such as tabs, dialogs and comboboxes. → [04 §4.3](04-html-css-accessibility.md#43-focus-management-and-keyboard-navigation-roving-tabindex)

**ARIA** [Browser] — Accessible Rich Internet Applications: attributes that add roles, names and states to the accessibility tree; the first rule is to prefer native HTML. → [04 §4.2](04-html-css-accessibility.md#42-accessibility-the-accessibility-tree-aria-rules-names-roles-states)

**Array methods (`map`, `filter`, `reduce`)** [JS] — Non-mutating iteration methods used constantly to derive UI lists; contrast with mutating `push`, `splice`, `sort`. → [01 §1.11](01-javascript.md#111-array-and-object-methods)

**Arrow function** [JS] — Function syntax with no own `this`, `arguments` or `prototype`; it captures `this` lexically. → [01 §1.6](01-javascript.md#16-this-and-binding-callapplybind-arrow-functions)

**`as const`** [TS] — Assertion that freezes a literal into its narrowest, readonly type. → [02 §2.2](02-typescript.md#22-primitives-literal-types-as-const)

**Assertion function** [TS] — A function with an `asserts x is T` signature that narrows the type after it returns without throwing. → [02 §2.6](02-typescript.md#26-narrowing-typeof-in-instanceof-type-predicates-assertion-functions)

**`async`/`await`** [JS] — Syntax over Promises that lets asynchronous code read sequentially; errors surface through `try/catch`. → [01 §1.15](01-javascript.md#115-asyncawait-and-error-handling)

**`AbortController`** [Browser] — Object whose `signal` cancels a `fetch` or any listening operation; the standard cleanup for effect races. → [09 §9.4](09-effects.md#94-race-conditions-and-abortcontroller)

**App Router** [Framework: Next.js] — Next.js's file-system router (the `app/` directory) built on Server Components, layouts and streaming. → [21 §21.11](21-concurrent-ssr-server-components.md#2111-nextjs-app-router-as-the-reference-rendering-strategies)

**Autocomplete / typeahead** [React] — System-design and machine-coding favourite: debounce, cancel stale requests, keyboard navigation, combobox ARIA. → [25 §25.2](25-frontend-system-design.md#252-autocompletetypeahead)

## B

**Babel** [Tooling: Babel] — JavaScript transpiler that compiles JSX and modern syntax; historically the default, now often replaced by SWC or esbuild. → [05 §5.5](05-tooling-and-setup.md#55-transpilers-babel-swc-esbuild-what-jsx-transform-means)

**Batching** [React] — Grouping several state updates into one render. → [08 §8.3](08-state.md#83-batching)

**BFF (Backend for Frontend)** [System design] — A server tailored to one UI that holds tokens and sessions so the browser never sees them. → [24 §24.6](24-react-with-spring-boot.md#246-oauth2oidc-with-pkce-bff-pattern-spring-security-resource-server)

**`bind`** [JS] — Function method returning a new function with a fixed `this` (and optionally leading arguments). → [01 §1.6](01-javascript.md#16-this-and-binding-callapplybind-arrow-functions)

**Box model** [Browser] — Content, padding, border and margin around every element; `box-sizing` decides what `width` includes. → [04 §4.4](04-html-css-accessibility.md#44-box-model-and-box-sizing)

**Bubbling** [Browser] — The event phase where an event travels from target up through its ancestors. → [03 §3.2](03-browser-and-web-platform.md#32-events-capture--target--bubble-stoppropagation-preventdefault-delegation)

**Bundle analysis** [Tooling: bundler] — Inspecting what ends up in the JavaScript bundle (treemaps, analyzers) to find heavy dependencies. → [15 §15.11](15-performance.md#1511-bundle-analysis)

**Bundler** [Tooling: bundler] — Tool (Vite, webpack, Turbopack) that resolves the module graph and emits optimized assets. → [05 §5.3](05-tooling-and-setup.md#53-bundling-concepts-module-graph-tree-shaking-code-splitting-hmr)

## C

**Cache API** [Browser] — Promise-based request/response store used by service workers for offline assets. → [03 §3.5](03-browser-and-web-platform.md#35-storage-cookies-localstorage-sessionstorage-indexeddb-cache-api)

**Cache Components** [Framework: Next.js] — Next.js 16 opt-in model (`cacheComponents: true`) where nothing is cached unless marked `'use cache'`, and dynamic code runs at request time. → [21 §21.12](21-concurrent-ssr-server-components.md#2112-nextjs-16-caching)

**`Cache-Control`** [Browser] — HTTP header controlling who may cache a response and for how long (`max-age`, `no-store`, `immutable`). → [03 §3.9](03-browser-and-web-platform.md#39-http-caching-cache-control-etag-validation-immutable-assets)

**`cacheLife` / `cacheTag`** [Framework: Next.js] — Next.js 16 helpers setting the lifetime and the invalidation label of a `'use cache'` entry. → [21 §21.12](21-concurrent-ssr-server-components.md#2112-nextjs-16-caching)

**Callback ref** [React] — A function passed as `ref`; since React 19 it may return a cleanup function. → [10 §10.3](10-refs-and-dom.md#103-callback-refs-and-ref-cleanup-functions)

**`call` / `apply`** [JS] — Function methods that invoke with an explicit `this`; `apply` takes an array of arguments. → [01 §1.6](01-javascript.md#16-this-and-binding-callapplybind-arrow-functions)

**Capture phase** [Browser] — The event phase where an event travels from the window down to the target. → [03 §3.2](03-browser-and-web-platform.md#32-events-capture--target--bubble-stoppropagation-preventdefault-delegation)

**Cascade** [Browser] — CSS algorithm choosing the winning declaration by origin, layer, specificity and order. → [04 §4.5](04-html-css-accessibility.md#45-cascade-specificity-layer-inheritance)

**`@layer`** [Browser] — CSS cascade layers that order groups of rules independently of specificity. → [04 §4.5](04-html-css-accessibility.md#45-cascade-specificity-layer-inheritance)

**CDN** [Browser] — Content Delivery Network: edge servers that cache static assets near users. → [22 §22.12](22-production-project-structure.md#2212-deployment-targets-staticcdn-node-server-served-from-spring)

**Children** [React] — The special prop holding whatever is nested between a component's tags; the basis of composition and slots. → [07 §7.2](07-components-props-composition.md#72-children-and-slot-props)

**CI pipeline** [Tooling: CI] — Automated lint, type-check, test and build steps run on every change. → [22 §22.10](22-production-project-structure.md#2210-ci-pipeline)

**CJS (CommonJS)** [JS] — Node's older `require`/`module.exports` module format, with copied rather than live exports. → [01 §1.12](01-javascript.md#112-modules-esm-vs-commonjs-live-bindings-dynamic-import)

**Class component** [React] — Legacy component form using `render` and lifecycle methods; still required for error boundaries without a library. → [07 §7.10](07-components-props-composition.md#710-class-components)

**Clickjacking** [Browser] — Attack that frames your page invisibly to trick clicks; blocked with `frame-ancestors` or `X-Frame-Options`. → [03 §3.8](03-browser-and-web-platform.md#38-web-security-xss-csrf-csp-clickjacking-samesite-trusted-types)

**CLS (Cumulative Layout Shift)** [Browser] — Core Web Vital measuring unexpected layout movement. → [03 §3.11](03-browser-and-web-platform.md#311-core-web-vitals-and-how-they-are-measured)

**Closure** [JS] — A function together with the variables of the scope where it was created; the cause of stale closures in hooks. → [01 §1.5](01-javascript.md#15-closures)

**Code splitting** [Tooling: bundler] — Breaking the bundle into chunks loaded on demand, via dynamic `import()` or `lazy`. → [15 §15.7](15-performance.md#157-code-splitting-with-lazy-and-suspense)

**Coercion** [JS] — Implicit conversion between types, the root of `==` surprises. → [01 §1.2](01-javascript.md#12-coercion-and--vs-)

**Colocation** [React] — Keeping state as close as possible to where it is used. → [08 §8.8](08-state.md#88-colocation-and-lifting-state-up)

**Commit phase** [React] — The step where React applies the computed changes to the DOM and runs layout effects and effects; it cannot be interrupted. → [06 §6.10](06-jsx-and-rendering-model.md#610-render-phase-vs-commit-phase)

**Compound components** [React] — Components that share implicit state to form one API, such as `<Tabs>`, `<Tabs.List>`, `<Tabs.Panel>`. → [07 §7.6](07-components-props-composition.md#76-compound-components)

**Composite (rendering step)** [Browser] — Final pipeline step where the GPU combines painted layers. → [03 §3.4](03-browser-and-web-platform.md#34-the-rendering-pipeline-parse--style--layout--paint--composite-reflow-and-layout-thrashing)

**Composition** [React] — Building UI by combining components through `children` and props instead of inheritance. → [07 §7.3](07-components-props-composition.md#73-composition-vs-inheritance)

**Concurrent rendering** [React] — React 18+ model where a render can be paused, resumed or abandoned so urgent updates stay responsive. → [21 §21.1](21-concurrent-ssr-server-components.md#211-concurrent-rendering-interruptible-rendering)

**Conditional types** [TS] — Types of the form `T extends U ? X : Y`, often paired with `infer`. → [02 §2.10](02-typescript.md#210-mapped-conditional-and-template-literal-types-infer)

**Container queries** [Browser] — CSS `@container` rules that respond to the size of a parent container, not the viewport. → [04 §4.9](04-html-css-accessibility.md#49-responsive-design-media-and-container-queries-units-mobile-first)

**Container/presentational** [React] — Older pattern separating data logic from markup; custom hooks made it optional. → [07 §7.5](07-components-props-composition.md#75-containerpresentational-and-why-hooks-made-it-optional)

**Content Security Policy (CSP)** [Browser] — Response header that whitelists the sources a page may load or execute, limiting XSS damage. → [03 §3.8](03-browser-and-web-platform.md#38-web-security-xss-csrf-csp-clickjacking-samesite-trusted-types)

**Context** [React] — Mechanism for passing a value to a whole subtree without props. → [11 §11.2](11-context.md#112-createcontext-context-value-vs-provider)

**`<Context value>`** [React] — Since React 19, the context object itself is rendered as the provider; `<Context.Provider>` is the legacy form. → [11 §11.2](11-context.md#112-createcontext-context-value-vs-provider)

**Controlled component** [React] — A form field whose value lives in React state and is changed through `onChange`. → [14 §14.1](14-forms-and-actions.md#141-controlled-vs-uncontrolled-inputs)

**Cookie** [Browser] — Small key/value sent automatically with matching requests; `HttpOnly`, `Secure` and `SameSite` flags matter for auth. → [03 §3.5](03-browser-and-web-platform.md#35-storage-cookies-localstorage-sessionstorage-indexeddb-cache-api)

**Core Web Vitals** [Browser] — Google's user-centred metrics: LCP, INP and CLS. → [03 §3.11](03-browser-and-web-platform.md#311-core-web-vitals-and-how-they-are-measured)

**CORS (Cross-Origin Resource Sharing)** [Browser] — Header protocol by which a server permits cross-origin browser requests; enforced by the browser, not the server. → [03 §3.7](03-browser-and-web-platform.md#37-cors-from-the-browsers-side-simple-vs-preflighted-credentials)

**`CorsConfigurationSource`** [Backend: Spring] — Spring Security bean that supplies the CORS rules (origins, methods, credentials) to the filter chain. → [24 §24.2](24-react-with-spring-boot.md#242-cors-preflight-credentials-spring-corsconfigurationsource)

**Countdown timer** [React] — Machine-coding exercise exposing interval cleanup and drift correction. → [26 §26.13](26-machine-coding.md#2613-countdown-timer)

**`createAsyncThunk`** [Library: RTK] — Redux Toolkit helper generating pending, fulfilled and rejected actions around an async function. → [18 §18.5](18-state-management.md#185-thunks-and-createasyncthunk)

**`createContext`** [React] — Creates a context object with a default value. → [11 §11.2](11-context.md#112-createcontext-context-value-vs-provider)

**`createRoot`** [React DOM] — React 18+ entry point that enables concurrent features; replaced `ReactDOM.render`. → [06 §6.12](06-jsx-and-rendering-model.md#612-createroot-hydrateroot-root-options)

**CRDT (Conflict-free Replicated Data Type)** [System design] — Data structure that merges concurrent edits without a central arbiter; used in collaborative editors. → [25 §25.11](25-frontend-system-design.md#2511-collaborative-editor)

**CRA (Create React App)** [Tooling: CRA] — Deprecated (2025-02-14) scaffold; legacy codebases still run on it. → [05 §5.8](05-tooling-and-setup.md#58-creating-a-project-in-2026)

**CSRF (Cross-Site Request Forgery)** [Browser] — Attack that makes a victim's browser send an authenticated request; mitigated by tokens and `SameSite`. → [24 §24.5](24-react-with-spring-boot.md#245-csrf-with-cookie-auth)

**CSRF token repository** [Backend: Spring] — Spring Security component (for example `CookieCsrfTokenRepository`) that stores the CSRF token so the SPA can echo it in a header. → [24 §24.5](24-react-with-spring-boot.md#245-csrf-with-cookie-auth)

**CSS Modules** [Tooling: bundler] — File-scoped CSS classes with generated unique names. → [04 §4.11](04-html-css-accessibility.md#411-styling-in-react-inline-css-modules-tailwind-css-in-js-and-the-server-components-trade-off)

**CSS-in-JS** [Library: styled-components/Emotion] — Styling written in JavaScript; runtime variants clash with Server Components. → [04 §4.11](04-html-css-accessibility.md#411-styling-in-react-inline-css-modules-tailwind-css-in-js-and-the-server-components-trade-off)

**Custom error** [JS] — A class extending `Error`, optionally carrying a `cause`. → [01 §1.17](01-javascript.md#117-errors-trycatch-finally-custom-errors-cause-unhandled-rejections)

**Custom hook** [React] — A function whose name starts with `use` and which calls other hooks to share stateful logic. → [12 §12.4](12-hooks-and-custom-hooks.md#124-designing-custom-hooks)

**Cypress** [Library: Cypress] — Browser-based E2E test runner. → [20 §20.11](20-testing.md#2011-e2e-with-playwright-and-cypress)

## D

**Data fetching in effects** [React] — The classic `useEffect` + `fetch` approach and its race, caching and waterfall pitfalls. → [17 §17.1](17-data-fetching.md#171-fetching-in-effects-and-its-pitfalls)

**Debounce** [JS] — Delay a call until input has stopped for a period. → [01 §1.18](01-javascript.md#118-debounce-and-throttle)

**Declaration file (`.d.ts`)** [TS] — File that describes types for JavaScript code without implementing it. → [02 §2.14](02-typescript.md#214-declaration-files-types-module-augmentation)

**Delegation (event)** [Browser] — Handling events on an ancestor that catches bubbling events from many children. → [03 §3.2](03-browser-and-web-platform.md#32-events-capture--target--bubble-stoppropagation-preventdefault-delegation)

**Dependency array** [React] — The second argument of an effect or memo hook; a change in any item (compared with `Object.is`) re-runs it. → [09 §9.2](09-effects.md#92-dependencies-and-the-objectis-comparison)

**Derived state** [React] — Values you can compute from props or state; compute them during render rather than storing them. → [08 §8.7](08-state.md#87-derived-state-compute-do-not-store)

**Design system** [React] — Shared tokens, components and rules that keep a product consistent. → [22 §22.3](22-production-project-structure.md#223-shared-ui-and-design-systems)

**Destructuring** [JS] — Syntax that unpacks array items or object properties into variables. → [01 §1.10](01-javascript.md#110-spread-rest-destructuring-optional-chaining-nullish-coalescing)

**DevTools Profiler** [React] — React DevTools tab that records renders and why they happened. → [15 §15.1](15-performance.md#151-measure-first-react-devtools-profiler-chrome-performance-panel-performance-tracks)

**Discriminated union** [TS] — Union of object types sharing a literal tag field, enabling exhaustive narrowing. → [02 §2.7](02-typescript.md#27-discriminated-unions-and-exhaustiveness-with-never)

**Docker (front end)** [Tooling: Docker] — Containerizing a front end, typically a multi-stage build served by nginx or Node. → [22 §22.11](22-production-project-structure.md#2211-dockerized-front-end)

**DOM** [Browser] — Document Object Model: the live tree of nodes the browser builds from HTML. → [03 §3.1](03-browser-and-web-platform.md#31-the-dom-tree-and-the-dom-apis)

**DOM ref** [React] — A ref attached to a DOM element for imperative access (focus, measurement). → [10 §10.2](10-refs-and-dom.md#102-dom-refs-and-when-to-use-them)

**Double buffering** [React] — Fiber keeps a current tree and a work-in-progress tree and swaps them on commit. → [13 §13.5](13-reconciliation-and-fiber.md#135-fiber-units-of-work-double-buffering-lanes-and-priorities)

**Dynamic `import()`** [JS] — Expression that loads a module on demand and returns a Promise; the basis of code splitting. → [01 §1.12](01-javascript.md#112-modules-esm-vs-commonjs-live-bindings-dynamic-import)

## E

**E2E testing** [Tooling: Playwright] — End-to-end tests that drive a real browser through whole user flows. → [20 §20.11](20-testing.md#2011-e2e-with-playwright-and-cypress)

**Effect** [React] — Code (via `useEffect`) that synchronizes a component with an external system after render. → [09 §9.1](09-effects.md#91-effects-as-synchronization-with-external-systems)

**Effect cleanup** [React] — The function an effect returns; it runs before the next run and on unmount. → [09 §9.3](09-effects.md#93-cleanup-and-the-effect-lifecycle)

**Element (React)** [React] — A plain object describing what to render; components are functions that return elements. → [06 §6.3](06-jsx-and-rendering-model.md#63-elements-vs-components-vs-instances)

**Environment variables** [Tooling: Vite] — Build-time config values; anything exposed to client code is public. → [05 §5.7](05-tooling-and-setup.md#57-environment-variables)

**ErrorBoundary** [React] — A class component (or `react-error-boundary`) that catches render errors in its subtree and shows a fallback. → [16 §16.2](16-error-handling.md#162-error-boundaries)

**ESLint** [Tooling: ESLint] — Linter; v10 uses flat config only. → [05 §5.6](05-tooling-and-setup.md#56-eslint-flat-config-eslint-plugin-react-hooks-prettier-and-the-line-between-them)

**`eslint-plugin-react-hooks`** [Tooling: ESLint] — Plugin enforcing rules of hooks and exhaustive dependencies; v7 also carries React Compiler rules. → [12 §12.3](12-hooks-and-custom-hooks.md#123-the-lint-rule-and-react-compiler-rules)

**esbuild** [Tooling: esbuild] — Very fast Go-based bundler/transpiler. → [05 §5.5](05-tooling-and-setup.md#55-transpilers-babel-swc-esbuild-what-jsx-transform-means)

**ESM (ECMAScript Modules)** [JS] — Standard `import`/`export` module system with live bindings and static analysis. → [01 §1.12](01-javascript.md#112-modules-esm-vs-commonjs-live-bindings-dynamic-import)

**ETag** [Browser] — Validator header identifying a resource version so a conditional request can return `304 Not Modified`. → [03 §3.9](03-browser-and-web-platform.md#39-http-caching-cache-control-etag-validation-immutable-assets)

**Event delegation** [Browser] — See Delegation.

**Event loop** [JS] — Scheduler that runs the call stack, then microtasks, then a macrotask, with rendering between tasks. → [01 §1.16](01-javascript.md#116-the-event-loop-call-stack-microtasks-vs-macrotasks-rendering-steps)

**Exhaustiveness check** [TS] — Using `never` in a `switch` default so adding a union member causes a compile error. → [02 §2.7](02-typescript.md#27-discriminated-unions-and-exhaustiveness-with-never)

## F

**Feature flag** [React] — Runtime switch that turns features on or off without redeploying. → [22 §22.7](22-production-project-structure.md#227-feature-flags)

**Feature-Sliced Design (FSD)** [React] — Folder methodology with layers (app, pages, widgets, features, entities, shared) and strict import direction. → [22 §22.2](22-production-project-structure.md#222-feature-sliced-design)

**`fetch`** [Browser] — Promise-based HTTP API; it rejects only on network failure, not on 4xx/5xx. → [03 §3.6](03-browser-and-web-platform.md#36-fetch-requestresponse-streaming-bodies-abortcontroller)

**Fiber** [React] — React's internal unit of work and data structure for a component instance; enables interruptible rendering. → [13 §13.5](13-reconciliation-and-fiber.md#135-fiber-units-of-work-double-buffering-lanes-and-priorities)

**File explorer tree** [React] — Recursive component exercise. → [26 §26.11](26-machine-coding.md#2611-file-explorer-tree)

**File uploader** [React] — System-design case: chunking, progress, retries, presigned URLs. → [25 §25.9](25-frontend-system-design.md#259-file-uploader)

**Flexbox** [Browser] — One-dimensional CSS layout model. → [04 §4.6](04-html-css-accessibility.md#46-flexbox)

**Focus management** [Browser] — Controlling which element holds keyboard focus on route changes, dialogs and widgets. → [04 §4.3](04-html-css-accessibility.md#43-focus-management-and-keyboard-navigation-roving-tabindex)

**Focus trap** [Browser] — Keeping Tab focus inside an open modal. → [26 §26.6](26-machine-coding.md#266-modal-with-focus-trap)

**`forwardRef`** [React] — Pre-19 wrapper for passing a ref through a component; since React 19, `ref` is a plain prop. → [10 §10.4](10-refs-and-dom.md#104-ref-as-a-prop-vs-forwardref)

**Fragment** [React] — `<>...</>` grouping that adds no DOM node; `<Fragment key>` is needed in keyed lists. → [06 §6.7](06-jsx-and-rendering-model.md#67-fragments)

**Fragment refs** [React] — Refs on `<Fragment>` (stable in React 19.3) that act on all of a fragment's DOM children. → [10 §10.8](10-refs-and-dom.md#108-fragment-refs)

**Function component** [React] — A function taking props and returning elements; the standard component form. → [07 §7.1](07-components-props-composition.md#71-function-components-and-props)

**Functional update** [React] — Passing `prev => next` to a state setter so it uses the latest queued state. → [08 §8.4](08-state.md#84-functional-updates)

## G

**Garbage collection (GC)** [JS] — Automatic freeing of unreachable memory; leaks come from lingering references. → [01 §1.20](01-javascript.md#120-memory-gc-leaks-from-closures-listeners-and-timers-weakmapweakref)

**`gcTime`** [Library: TanStack Query] — How long inactive query data stays in cache; renamed from `cacheTime` in v5. → [17 §17.4](17-data-fetching.md#174-tanstack-query-query-keys-staletime-vs-gctime)

**Generator** [JS] — Function (`function*`) that can pause with `yield`; implements iterators. → [01 §1.13](01-javascript.md#113-iterators-and-generators)

**Generics** [TS] — Type parameters that make a function or type reusable across types. → [02 §2.8](02-typescript.md#28-generics-and-constraints)

**Grid (CSS)** [Browser] — Two-dimensional CSS layout model. → [04 §4.7](04-html-css-accessibility.md#47-grid)

## H

**Headless UI** [Library: Radix] — Components with behaviour and accessibility but no styling. → [04 §4.12](04-html-css-accessibility.md#412-component-libraries-mui-radix-shadcnui-headless-vs-styled)

**HMR (Hot Module Replacement)** [Tooling: bundler] — Swapping changed modules in the running page without a full reload. → [05 §5.3](05-tooling-and-setup.md#53-bundling-concepts-module-graph-tree-shaking-code-splitting-hmr)

**HOC (Higher-Order Component)** [React] — A function that takes a component and returns an enhanced one; mostly replaced by hooks. → [07 §7.7](07-components-props-composition.md#77-render-props-and-hocs)

**Hoisting** [JS] — Declarations are registered before code runs; `var` is initialised to `undefined`, `let`/`const` are not usable (TDZ). → [01 §1.4](01-javascript.md#14-hoisting-and-the-tdz)

**Hook** [React] — Function starting with `use` that taps into React features from function components (since React 16.8). → [12 §12.1](12-hooks-and-custom-hooks.md#121-the-rules-of-hooks)

**Hooks API reference** [React] — Table of every built-in hook with purpose and version. → [12 §12.14](12-hooks-and-custom-hooks.md#1214-full-hooks-api-reference-table)

**Hydration** [React DOM] — Attaching React to server-rendered HTML so it becomes interactive (`hydrateRoot`). → [21 §21.5](21-concurrent-ssr-server-components.md#215-ssr-hydration-hydration-errors)

**Hydration error / mismatch** [React DOM] — Server and client markup differ; fixed by deterministic rendering. → [21 §21.5](21-concurrent-ssr-server-components.md#215-ssr-hydration-hydration-errors)

**`hydrateRoot`** [React DOM] — Entry point that hydrates server HTML into a React root. → [06 §6.12](06-jsx-and-rendering-model.md#612-createroot-hydrateroot-root-options)

**History API** [Browser] — `pushState`/`popstate` interface that client-side routers build on. → [19 §19.1](19-routing.md#191-client-side-routing-and-the-history-api)

## I

**i18n** [Tooling: i18n] — Internationalization: translating and formatting text, dates and numbers per locale. → [22 §22.8](22-production-project-structure.md#228-i18n)

**IDB / IndexedDB** [Browser] — Asynchronous, transactional, structured browser database. → [03 §3.5](03-browser-and-web-platform.md#35-storage-cookies-localstorage-sessionstorage-indexeddb-cache-api)

**Idempotence (render)** [React] — Rendering the same inputs must produce the same output with no side effects. → [06 §6.8](06-jsx-and-rendering-model.md#68-purity-and-idempotence)

**Immer** [Library: Immer] — Library that lets you write "mutating" code against a draft and produces an immutable result; built into RTK. → [18 §18.4](18-state-management.md#184-redux-toolkit-configurestore-slices-immer)

**Immutability** [JS] — Never changing values in place; create new ones, so reference checks detect change. → [01 §1.9](01-javascript.md#19-immutability-and-structural-sharing)

**`immutable` (Cache-Control)** [Browser] — Directive telling caches a fingerprinted asset never changes. → [03 §3.9](03-browser-and-web-platform.md#39-http-caching-cache-control-etag-validation-immutable-assets)

**`infer`** [TS] — Keyword in conditional types that captures a type for reuse. → [02 §2.10](02-typescript.md#210-mapped-conditional-and-template-literal-types-infer)

**Infinite feed / infinite scroll** [React] — List that loads more as you scroll, built with `IntersectionObserver` or infinite queries. → [26 §26.9](26-machine-coding.md#269-infinite-scroll)

**Infinite query** [Library: TanStack Query] — `useInfiniteQuery`, which accumulates pages with a cursor. → [17 §17.7](17-data-fetching.md#177-pagination-and-infinite-queries)

**INP (Interaction to Next Paint)** [Browser] — Core Web Vital for responsiveness; it replaced FID. → [03 §3.11](03-browser-and-web-platform.md#311-core-web-vitals-and-how-they-are-measured)

**Inheritance (CSS)** [Browser] — Some properties pass from parent to child by default. → [04 §4.5](04-html-css-accessibility.md#45-cascade-specificity-layer-inheritance)

**Inference (type)** [TS] — The compiler working out types from values and context. → [02 §2.3](02-typescript.md#23-inference-and-contextual-typing)

**`instanceof`** [JS] — Operator that checks the prototype chain; also a narrowing guard in TypeScript. → [02 §2.6](02-typescript.md#26-narrowing-typeof-in-instanceof-type-predicates-assertion-functions)

**Interface** [TS] — Object-shape declaration that supports declaration merging; compare with `type`. → [02 §2.12](02-typescript.md#212-interface-vs-type)

**IntersectionObserver** [Browser] — API reporting when elements enter or leave a viewport; used for lazy loading and infinite scroll. → [03 §3.12](03-browser-and-web-platform.md#312-observers-intersection-resize-mutation-performance)

**Intersection type** [TS] — `A & B`: a value that satisfies both. → [02 §2.5](02-typescript.md#25-unions-and-intersections)

**Iterator** [JS] — Object with a `next()` method following the iteration protocol. → [01 §1.13](01-javascript.md#113-iterators-and-generators)

**ISR (Incremental Static Regeneration)** [Framework: Next.js] — Static pages regenerated in the background after a time or tag-based invalidation. → [21 §21.11](21-concurrent-ssr-server-components.md#2111-nextjs-app-router-as-the-reference-rendering-strategies)

## J

**Jest** [Library: Jest] — Older, widely used test runner; Vitest is the Vite-native alternative. → [20 §20.2](20-testing.md#202-vitest-vs-jest)

**Jotai** [Library: Jotai] — Atom-based state library (v3 is current). → [18 §18.9](18-state-management.md#189-atoms-jotai)

**JSX** [React] — Syntax extension that compiles to `jsx()` calls producing elements. → [06 §6.2](06-jsx-and-rendering-model.md#62-what-jsx-compiles-to)

**JSX transform** [Tooling: Babel] — Compiler step that rewrites JSX; the automatic runtime removed the need to import React. → [05 §5.5](05-tooling-and-setup.md#55-transpilers-babel-swc-esbuild-what-jsx-transform-means)

**JWT (JSON Web Token)** [Protocol: JWT] — Signed token carrying claims; storage choice (memory vs httpOnly cookie) is a security trade-off. → [24 §24.3](24-react-with-spring-boot.md#243-auth-options-jwt-in-memory-vs-httponly-cookies)

## K

**Kanban drag-and-drop** [React] — Machine-coding exercise on board state and drag events. → [26 §26.14](26-machine-coding.md#2614-kanban-drag-and-drop)

**Key** [React] — Prop that gives list items and components stable identity; changing it resets state. → [06 §6.6](06-jsx-and-rendering-model.md#66-lists-and-keys)

**Key (reset state)** [React] — Using a changed `key` to remount a component and discard its state. → [08 §8.9](08-state.md#89-resetting-state-with-key)

## L

**Lanes** [React] — Fiber's priority bit-flags that decide which updates are rendered first. → [13 §13.5](13-reconciliation-and-fiber.md#135-fiber-units-of-work-double-buffering-lanes-and-priorities)

**Layout thrashing** [Browser] — Alternating DOM reads and writes that force repeated synchronous reflows. → [03 §3.4](03-browser-and-web-platform.md#34-the-rendering-pipeline-parse--style--layout--paint--composite-reflow-and-layout-thrashing)

**`lazy`** [React] — Wraps a dynamic import into a component rendered through Suspense. → [15 §15.7](15-performance.md#157-code-splitting-with-lazy-and-suspense)

**Lazy initialization** [React] — Passing a function to `useState` so the initial value is computed once. → [08 §8.6](08-state.md#86-lazy-initialization)

**Lazy route** [Framework: React Router] — A route whose code loads on demand. → [19 §19.8](19-routing.md#198-lazy-routes-and-code-splitting)

**LCP (Largest Contentful Paint)** [Browser] — Core Web Vital for loading speed. → [03 §3.11](03-browser-and-web-platform.md#311-core-web-vitals-and-how-they-are-measured)

**Lifting state up** [React] — Moving state to the nearest common parent of the components that need it. → [08 §8.8](08-state.md#88-colocation-and-lifting-state-up)

**Lifecycle methods** [React] — Class hooks such as `componentDidMount`; each has a hook equivalent. → [13 §13.6](13-reconciliation-and-fiber.md#136-class-lifecycle-methods-and-their-hook-equivalents)

**Live binding** [JS] — ESM imports reflect later changes of the exporting module's variable. → [01 §1.12](01-javascript.md#112-modules-esm-vs-commonjs-live-bindings-dynamic-import)

**Loader** [Framework: React Router] — Route function that fetches data before a route renders. → [19 §19.5](19-routing.md#195-loaders-actions-usefetcher)

**`localStorage`** [Browser] — Synchronous string key/value store that persists across sessions; never put tokens in it if XSS is a concern. → [03 §3.5](03-browser-and-web-platform.md#35-storage-cookies-localstorage-sessionstorage-indexeddb-cache-api)

**Lockfile** [Tooling: npm] — File pinning exact dependency versions; commit it. → [05 §5.1](05-tooling-and-setup.md#51-npm-pnpm-yarn-lockfiles-and-why-to-commit-them)

## M

**Machine coding** [Interview] — Timed round where you build a small working UI. → [26 §26.1](26-machine-coding.md#261-how-to-approach-a-45-minute-round)

**Macrotask** [JS] — A queued task (timer, I/O, event) run one per event-loop turn. → [01 §1.16](01-javascript.md#116-the-event-loop-call-stack-microtasks-vs-macrotasks-rendering-steps)

**Mapped type** [TS] — Type that transforms every key of another type. → [02 §2.10](02-typescript.md#210-mapped-conditional-and-template-literal-types-infer)

**Media query** [Browser] — CSS rule conditional on viewport features. → [04 §4.9](04-html-css-accessibility.md#49-responsive-design-media-and-container-queries-units-mobile-first)

**Memoization** [React] — Caching a result so unchanged inputs skip recomputation (`useMemo`, `React.memo`, selectors). → [15 §15.4](15-performance.md#154-usememo-and-usecallback-and-when-they-waste-effort)

**Microtask** [JS] — Job (Promise callback, `queueMicrotask`) that runs after the current script, before the next macrotask. → [01 §1.16](01-javascript.md#116-the-event-loop-call-stack-microtasks-vs-macrotasks-rendering-steps)

**Micro-frontends** [React] — Splitting a UI into independently deployed apps composed at runtime. → [22 §22.13](22-production-project-structure.md#2213-micro-frontends)

**Middleware (React Router)** [Framework: React Router] — Functions that run around loaders and actions; always on in v8. → [19 §19.6](19-routing.md#196-middleware)

**`middleware.ts`** [Framework: Next.js] — Request interceptor file; renamed `proxy.ts` in Next.js 16. → [21 §21.13](21-concurrent-ssr-server-components.md#2113-route-handlers-and-proxyts)

**Mobile-first** [Browser] — Writing base CSS for small screens and adding `min-width` queries upward. → [04 §4.9](04-html-css-accessibility.md#49-responsive-design-media-and-container-queries-units-mobile-first)

**Module augmentation** [TS] — Extending existing module types via `declare module`. → [02 §2.14](02-typescript.md#214-declaration-files-types-module-augmentation)

**Module mocking** [Library: Vitest] — Replacing imports in tests (`vi.mock`). → [20 §20.9](20-testing.md#209-module-mocking)

**Monorepo** [Tooling: npm] — Several packages in one repository using workspaces. → [05 §5.9](05-tooling-and-setup.md#59-monorepos-workspaces-turboreponx-basics)

**MSW (Mock Service Worker)** [Library: MSW] — Library that intercepts network requests in tests; v3 renamed `onUnhandledRequest` to `onUnhandledFrame`. → [20 §20.6](20-testing.md#206-msw-for-network-mocking)

**MutationObserver** [Browser] — API that reports DOM changes. → [03 §3.12](03-browser-and-web-platform.md#312-observers-intersection-resize-mutation-performance)

**Mutation (TanStack Query)** [Library: TanStack Query] — `useMutation` for writes; usually followed by invalidation. → [17 §17.5](17-data-fetching.md#175-invalidation-and-mutations)

**MUI** [Library: MUI] — Material UI, a styled React component library. → [04 §4.12](04-html-css-accessibility.md#412-component-libraries-mui-radix-shadcnui-headless-vs-styled)

**Multi-step form / wizard** [React] — Form split over steps, with shared state and per-step validation. → [14 §14.10](14-forms-and-actions.md#1410-multi-step-forms)

## N

**Narrowing** [TS] — Refining a union to a more specific type using control-flow checks. → [02 §2.6](02-typescript.md#26-narrowing-typeof-in-instanceof-type-predicates-assertion-functions)

**Nested routes** [Framework: React Router] — Routes rendered inside parent layouts via `<Outlet>`. → [19 §19.3](19-routing.md#193-nested-routes-layouts-outlet)

**Next.js** [Framework: Next.js] — React framework providing routing, SSR/SSG, Server Components and a build pipeline; 16.x is current. → [21 §21.11](21-concurrent-ssr-server-components.md#2111-nextjs-app-router-as-the-reference-rendering-strategies)

**Notifications system** [React] — System-design case: queueing, dismissal, real-time delivery, live regions. → [25 §25.10](25-frontend-system-design.md#2510-notifications-system)

**Nullish coalescing (`??`)** [JS] — Falls back only for `null`/`undefined`, unlike `||`. → [01 §1.10](01-javascript.md#110-spread-rest-destructuring-optional-chaining-nullish-coalescing)

## O

**`Object.is`** [JS] — Equality used by React for state and dependency comparisons; differs from `===` for `NaN` and `-0`. → [09 §9.2](09-effects.md#92-dependencies-and-the-objectis-comparison)

**OIDC (OpenID Connect)** [Protocol: OIDC] — Identity layer on top of OAuth 2.0 that adds an ID token and user info. → [24 §24.6](24-react-with-spring-boot.md#246-oauth2oidc-with-pkce-bff-pattern-spring-security-resource-server)

**OAuth 2.0** [Protocol: OAuth 2.0] — Authorization framework for delegated access via tokens. → [24 §24.6](24-react-with-spring-boot.md#246-oauth2oidc-with-pkce-bff-pattern-spring-security-resource-server)

**OpenAPI** [Protocol: OpenAPI] — Machine-readable API contract used to generate TypeScript types and clients. → [24 §24.9](24-react-with-spring-boot.md#249-openapi--typescript-generation)

**Optimistic update** [React] — Showing the expected result immediately and rolling back on failure (`useOptimistic`, query `onMutate`). → [17 §17.6](17-data-fetching.md#176-optimistic-updates)

**Optional chaining (`?.`)** [JS] — Short-circuits to `undefined` when a link in the chain is nullish. → [01 §1.10](01-javascript.md#110-spread-rest-destructuring-optional-chaining-nullish-coalescing)

**OT (Operational Transformation)** [System design] — Technique that transforms concurrent edits against each other for collaborative editing; the CRDT alternative. → [25 §25.11](25-frontend-system-design.md#2511-collaborative-editor)

**`<Outlet>`** [Framework: React Router] — Placeholder in a layout route where the child route renders. → [19 §19.3](19-routing.md#193-nested-routes-layouts-outlet)

## P

**Paint** [Browser] — Pipeline step that draws pixels for elements. → [03 §3.4](03-browser-and-web-platform.md#34-the-rendering-pipeline-parse--style--layout--paint--composite-reflow-and-layout-thrashing)

**Pagination contract** [Backend: Spring] — Agreement on page/size vs cursor parameters and response shape between API and UI. → [24 §24.10](24-react-with-spring-boot.md#2410-pagination-contracts)

**Params / search params** [Framework: React Router] — Path segments and query-string values read through hooks. → [19 §19.4](19-routing.md#194-params-and-search-params)

**Peer dependency** [Tooling: npm] — A dependency the host project must provide. → [05 §5.2](05-tooling-and-setup.md#52-semver-and-ranges-peer-dependencies)

**Playwright** [Library: Playwright] — Cross-browser E2E and component test tool. → [20 §20.11](20-testing.md#2011-e2e-with-playwright-and-cypress)

**PKCE (Proof Key for Code Exchange)** [Protocol: PKCE] — OAuth extension that binds the authorization code to a client-generated secret, so public clients need no client secret. → [24 §24.6](24-react-with-spring-boot.md#246-oauth2oidc-with-pkce-bff-pattern-spring-security-resource-server)

**Polymorphic component** [React] — Component that can render as different elements via an `as` prop. → [07 §7.9](07-components-props-composition.md#79-polymorphic-components-and-prop-spreading)

**Portal** [React DOM] — `createPortal` renders children into a different DOM node while keeping React tree behaviour. → [10 §10.6](10-refs-and-dom.md#106-portals)

**Positioning** [Browser] — CSS `static`, `relative`, `absolute`, `fixed`, `sticky`. → [04 §4.8](04-html-css-accessibility.md#48-positioning-and-stacking-contexts)

**PPR (Partial Prerendering)** [Framework: Next.js] — Static shell served instantly with dynamic holes streamed in; folded into Cache Components in Next.js 16. → [21 §21.12](21-concurrent-ssr-server-components.md#2112-nextjs-16-caching)

**Preflight** [Browser] — The `OPTIONS` request a browser sends before a non-simple cross-origin request. → [03 §3.7](03-browser-and-web-platform.md#37-cors-from-the-browsers-side-simple-vs-preflighted-credentials)

**Prettier** [Tooling: Prettier] — Opinionated formatter; ESLint checks correctness, Prettier formats. → [05 §5.6](05-tooling-and-setup.md#56-eslint-flat-config-eslint-plugin-react-hooks-prettier-and-the-line-between-them)

**Prefetching** [Library: TanStack Query] — Loading data before it is needed. → [17 §17.8](17-data-fetching.md#178-prefetching-and-dependent-queries)

**Problem Details / `ProblemDetail`** [Backend: Spring] — RFC 9457 error body (Spring's `ProblemDetail` class) that the UI maps to messages. → [24 §24.8](24-react-with-spring-boot.md#248-problemdetail-error-mapping)

**Prop drilling** [React] — Passing props through layers that do not use them. → [11 §11.1](11-context.md#111-prop-drilling-and-when-it-is-fine)

**Prop spreading** [React] — `{...props}` forwarding all props to a child. → [07 §7.9](07-components-props-composition.md#79-polymorphic-components-and-prop-spreading)

**Props** [React] — Read-only inputs a parent passes to a component. → [07 §7.4](07-components-props-composition.md#74-props-vs-state)

**Promise** [JS] — Object representing a future value, with `then`, `catch`, `finally`. → [01 §1.14](01-javascript.md#114-promises)

**Prototype** [JS] — The object a value delegates to when a property is missing; `class` is syntax over it. → [01 §1.7](01-javascript.md#17-prototypes-class-and-how-they-differ-from-java-classes)

**`proxy.ts`** [Framework: Next.js] — Next.js 16 replacement for `middleware.ts`, running on the Node runtime. → [21 §21.13](21-concurrent-ssr-server-components.md#2113-route-handlers-and-proxyts)

**Protected route** [Framework: React Router] — Route that redirects unauthenticated users. → [19 §19.7](19-routing.md#197-protected-routes-and-auth-redirects)

**Pure component / `PureComponent`** [React] — Class that skips renders when props and state are shallow-equal; `React.memo` is the function equivalent. → [13 §13.7](13-reconciliation-and-fiber.md#137-getderivedstatefromprops-shouldcomponentupdate-purecomponent)

**Purity** [React] — Components must be pure functions of props, state and context. → [06 §6.8](06-jsx-and-rendering-model.md#68-purity-and-idempotence)

**PWA (Progressive Web App)** [Browser] — Web app with a manifest and service worker that can install and work offline. → [03 §3.10](03-browser-and-web-platform.md#310-service-workers-and-pwa-basics)

## Q

**Query key** [Library: TanStack Query] — Array that identifies a cached query; changing it fetches a different entry. → [17 §17.4](17-data-fetching.md#174-tanstack-query-query-keys-staletime-vs-gctime)

**Query priority (RTL)** [Library: React Testing Library] — Prefer queries by role, label and text over test ids. → [20 §20.3](20-testing.md#203-react-testing-library-and-query-priority)

**Query client** [Library: TanStack Query] — The cache and configuration object behind all queries; create one per test. → [20 §20.8](20-testing.md#208-testing-with-context-routers-and-query-clients)

## R

**Race condition** [React] — Out-of-order responses overwriting newer state; fixed with cleanup or abort. → [09 §9.4](09-effects.md#94-race-conditions-and-abortcontroller)

**Radix UI** [Library: Radix] — Headless, accessible component primitives. → [04 §4.12](04-html-css-accessibility.md#412-component-libraries-mui-radix-shadcnui-headless-vs-styled)

**React Compiler** [React] — Build plugin (1.0 stable) that memoizes components automatically. → [15 §15.5](15-performance.md#155-the-react-compiler-and-how-it-changes-the-advice)

**React Hook Form** [Library: React Hook Form] — Uncontrolled-first form library; pairs with Zod resolvers. → [14 §14.3](14-forms-and-actions.md#143-react-hook-form--zod)

**`React.memo`** [React] — Skips re-rendering a component when props are shallow-equal. → [15 §15.3](15-performance.md#153-reactmemo)

**React Router** [Library: React Router] — Routing library; v8 removed `react-router-dom` and has framework, data and declarative modes. → [19 §19.2](19-routing.md#192-react-router-8-framework-data-and-declarative-modes)

**React Testing Library (RTL)** [Library: React Testing Library] — Tests components the way users use them. → [20 §20.3](20-testing.md#203-react-testing-library-and-query-priority)

**`react-error-boundary`** [Library: react-error-boundary] — Package offering a ready-made boundary with reset support. → [16 §16.3](16-error-handling.md#163-react-error-boundary)

**Reconciliation** [React] — Comparing the new element tree with the previous one to compute minimal DOM changes. → [13 §13.2](13-reconciliation-and-fiber.md#132-diffing-heuristics-type-then-key)

**Redux** [Library: Redux] — Predictable global store built on actions and reducers. → [18 §18.3](18-state-management.md#183-redux-core-ideas-and-legacy-redux)

**Reducer** [React] — Pure `(state, action) => state` function; used by `useReducer` and Redux. → [08 §8.10](08-state.md#810-usereducer)

**Reflow** [Browser] — Recalculating layout after a geometry change. → [03 §3.4](03-browser-and-web-platform.md#34-the-rendering-pipeline-parse--style--layout--paint--composite-reflow-and-layout-thrashing)

**Refresh-token rotation** [Protocol: OAuth 2.0] — Issuing a new refresh token on each use and invalidating the old one. → [24 §24.4](24-react-with-spring-boot.md#244-refresh-token-rotation)

**Render phase** [React] — Pure step where React calls components to compute the next tree; it can be paused or repeated. → [06 §6.10](06-jsx-and-rendering-model.md#610-render-phase-vs-commit-phase)

**Render props** [React] — A prop that is a function returning UI. → [07 §7.7](07-components-props-composition.md#77-render-props-and-hocs)

**Resource server** [Backend: Spring] — Spring Security role that validates bearer tokens and protects the API. → [24 §24.6](24-react-with-spring-boot.md#246-oauth2oidc-with-pkce-bff-pattern-spring-security-resource-server)

**ResizeObserver** [Browser] — API reporting size changes of elements. → [03 §3.12](03-browser-and-web-platform.md#312-observers-intersection-resize-mutation-performance)

**Responsive design** [Browser] — Layouts adapting to viewport via fluid units and queries. → [04 §4.9](04-html-css-accessibility.md#49-responsive-design-media-and-container-queries-units-mobile-first)

**Rest parameters / spread** [JS] — `...` collects remaining arguments or expands iterables and objects. → [01 §1.10](01-javascript.md#110-spread-rest-destructuring-optional-chaining-nullish-coalescing)

**Ref** [React] — A mutable box (`useRef`) whose change does not trigger a render. → [10 §10.1](10-refs-and-dom.md#101-useref-as-a-mutable-box-that-does-not-trigger-renders)

**Roving tabindex** [Browser] — Keyboard pattern where one item in a group has `tabindex="0"` and arrows move it. → [04 §4.3](04-html-css-accessibility.md#43-focus-management-and-keyboard-navigation-roving-tabindex)

**Route handler** [Framework: Next.js] — `route.ts` file defining an HTTP endpoint in the App Router. → [21 §21.13](21-concurrent-ssr-server-components.md#2113-route-handlers-and-proxyts)

**RSC (React Server Components)** [React] — Components that run only on the server and ship no JavaScript to the client. → [21 §21.7](21-concurrent-ssr-server-components.md#217-server-components-the-mental-model-clientserver-boundary)

**RTK (Redux Toolkit)** [Library: RTK] — Official toolkit: `configureStore`, slices, Immer; v2 removed the object `extraReducers` syntax. → [18 §18.4](18-state-management.md#184-redux-toolkit-configurestore-slices-immer)

**RTK Query** [Library: RTK] — Data fetching and caching layer inside Redux Toolkit. → [18 §18.7](18-state-management.md#187-rtk-query)

## S

**SameSite** [Browser] — Cookie attribute (`Strict`, `Lax`, `None`) controlling cross-site sending; a CSRF mitigation. → [03 §3.8](03-browser-and-web-platform.md#38-web-security-xss-csrf-csp-clickjacking-samesite-trusted-types)

**Scope** [JS] — Region where a name is visible: global, function, block. → [01 §1.3](01-javascript.md#13-scope-global-function-block)

**Selector (Redux)** [Library: RTK] — Function reading derived data from the store, memoized with `createSelector`. → [18 §18.6](18-state-management.md#186-selectors-and-memoization)

**Semantic HTML** [Browser] — Using elements for their meaning (`button`, `nav`, `main`) for free accessibility. → [04 §4.1](04-html-css-accessibility.md#41-semantic-html-and-landmarks)

**Semver** [Tooling: npm] — Major.minor.patch versioning with `^` and `~` ranges. → [05 §5.2](05-tooling-and-setup.md#52-semver-and-ranges-peer-dependencies)

**Server Components** [React] — See RSC.

**Server Function** [React] — A function marked `'use server'` that the client calls over the network; treat it as a public endpoint. → [21 §21.8](21-concurrent-ssr-server-components.md#218-use-client-and-use-server-server-functions-and-their-security)

**Server state** [Library: TanStack Query] — Data owned by the backend that the UI caches; distinct from client state. → [17 §17.3](17-data-fetching.md#173-server-state-vs-client-state)

**Service worker** [Browser] — Background script that proxies network requests, enabling offline and push. → [03 §3.10](03-browser-and-web-platform.md#310-service-workers-and-pwa-basics)

**Selective hydration** [React DOM] — Hydrating Suspense boundaries independently and in priority order. → [21 §21.6](21-concurrent-ssr-server-components.md#216-streaming-ssr-and-selective-hydration)

**SessionStorage** [Browser] — Per-tab string storage cleared on close. → [03 §3.5](03-browser-and-web-platform.md#35-storage-cookies-localstorage-sessionstorage-indexeddb-cache-api)

**`satisfies`** [TS] — Operator that checks a value against a type without widening its inferred type. → [02 §2.11](02-typescript.md#211-unknown-vs-any-vs-never-satisfies)

**shadcn/ui** [Library: shadcn/ui] — Copy-into-your-repo components built on Radix and Tailwind. → [04 §4.12](04-html-css-accessibility.md#412-component-libraries-mui-radix-shadcnui-headless-vs-styled)

**Shallow copy** [JS] — Copy of the top level only; nested objects stay shared. → [01 §1.19](01-javascript.md#119-shallow-vs-deep-copy)

**Slot props** [React] — Passing JSX as named props to fill regions of a component. → [07 §7.2](07-components-props-composition.md#72-children-and-slot-props)

**Snapshot test** [Library: Vitest] — Test that compares output with a stored copy; brittle if overused. → [20 §20.10](20-testing.md#2010-snapshot-testing-trade-offs)

**Source map** [Tooling: bundler] — File mapping built code back to source for debugging and error reports. → [05 §5.10](05-tooling-and-setup.md#510-source-maps-and-debugging)

**SPA (Single-Page Application)** [Browser] — App that loads once and navigates client-side. → [19 §19.1](19-routing.md#191-client-side-routing-and-the-history-api)

**Specificity** [Browser] — Weight deciding which CSS selector wins. → [04 §4.5](04-html-css-accessibility.md#45-cascade-specificity-layer-inheritance)

**SSE (Server-Sent Events)** [Browser] — One-way server-to-client text stream over HTTP. → [17 §17.11](17-data-fetching.md#1711-real-time-websockets-and-sse-plus-cache-integration)

**SSG (Static Site Generation)** [Framework: Next.js] — HTML generated at build time. → [21 §21.11](21-concurrent-ssr-server-components.md#2111-nextjs-app-router-as-the-reference-rendering-strategies)

**SSR (Server-Side Rendering)** [React DOM] — Producing HTML on the server per request, then hydrating. → [21 §21.5](21-concurrent-ssr-server-components.md#215-ssr-hydration-hydration-errors)

**Stacking context** [Browser] — CSS isolation scope that governs `z-index` ordering. → [04 §4.8](04-html-css-accessibility.md#48-positioning-and-stacking-contexts)

**Stale closure** [React] — A callback that captured outdated state or props. → [09 §9.5](09-effects.md#95-stale-closures-in-effects-and-intervals)

**`staleTime`** [Library: TanStack Query] — How long fetched data counts as fresh (default 0). → [17 §17.4](17-data-fetching.md#174-tanstack-query-query-keys-staletime-vs-gctime)

**STAR** [Interview] — Situation, Task, Action, Result: a structure for behavioural answers. → [27 §27.4](27-interview-execution.md#274-behavioral-questions-for-front-endfull-stack)

**State** [React] — Data remembered by a component between renders. → [08 §8.2](08-state.md#82-usestate-and-state-as-a-snapshot)

**State as a snapshot** [React] — Each render sees fixed state values; setting state schedules a new render. → [08 §8.2](08-state.md#82-usestate-and-state-as-a-snapshot)

**State machine** [React] — Explicit states and transitions, modelled in a reducer or XState. → [08 §8.11](08-state.md#811-state-machines-in-a-reducer)

**Strict Mode** [React] — Development wrapper that double-invokes renders and remounts effects to expose impurity. → [06 §6.11](06-jsx-and-rendering-model.md#611-strict-mode-double-invocation-and-why)

**Streaming SSR** [React DOM] — Sending HTML in chunks as Suspense boundaries resolve. → [21 §21.6](21-concurrent-ssr-server-components.md#216-streaming-ssr-and-selective-hydration)

**Structural sharing** [JS] — Reusing unchanged parts of old data in the new immutable copy. → [01 §1.9](01-javascript.md#19-immutability-and-structural-sharing)

**Structural typing** [TS] — Compatibility decided by shape, not by declared name. → [02 §2.4](02-typescript.md#24-structural-typing)

**Suspense** [React] — Component that shows a fallback while children are waiting for code or data. → [21 §21.4](21-concurrent-ssr-server-components.md#214-suspense-in-depth)

**SWC** [Tooling: SWC] — Rust-based transpiler that replaces Babel in Next.js. → [05 §5.5](05-tooling-and-setup.md#55-transpilers-babel-swc-esbuild-what-jsx-transform-means)

**SWR** [Library: SWR] — Stale-while-revalidate data library from Vercel; lighter than TanStack Query. → [17 §17.9](17-data-fetching.md#179-swr-comparison)

**Synthetic event** [React] — React's wrapper over native events; pooling was removed in React 17. → [03 §3.3](03-browser-and-web-platform.md#33-how-reacts-event-system-relates-to-native-events)

## T

**Tailwind CSS** [Library: Tailwind] — Utility-first CSS framework; v4 is current. → [04 §4.11](04-html-css-accessibility.md#411-styling-in-react-inline-css-modules-tailwind-css-in-js-and-the-server-components-trade-off)

**Take-home** [Interview] — Assignment completed at home; expectations on scope, tests and README. → [27 §27.2](27-interview-execution.md#272-take-home-expectations)

**TanStack Query** [Library: TanStack Query] — Server-state library (v5): `useQuery`, `useMutation`, cache, invalidation. → [17 §17.4](17-data-fetching.md#174-tanstack-query-query-keys-staletime-vs-gctime)

**TanStack Router** [Library: TanStack Router] — Type-safe client router. → [19 §19.11](19-routing.md#1911-tanstack-router)

**TDZ (Temporal Dead Zone)** [JS] — Period where a `let`/`const`/`class` binding exists but throws if accessed. → [01 §1.4](01-javascript.md#14-hoisting-and-the-tdz)

**Template-literal type** [TS] — String type built from other types with backticks. → [02 §2.10](02-typescript.md#210-mapped-conditional-and-template-literal-types-infer)

**Testing trophy** [Library: React Testing Library] — Model that favours integration tests over many unit tests. → [20 §20.1](20-testing.md#201-the-testing-trophy-and-what-to-test)

**`this`** [JS] — Call-site-determined context value; arrow functions inherit it. → [01 §1.6](01-javascript.md#16-this-and-binding-callapplybind-arrow-functions)

**Throttle** [JS] — Allow a call at most once per interval. → [01 §1.18](01-javascript.md#118-debounce-and-throttle)

**Thunk** [Library: Redux] — Function dispatched to Redux that can perform async work. → [18 §18.5](18-state-management.md#185-thunks-and-createasyncthunk)

**Transition** [React] — Update marked non-urgent with `startTransition`/`useTransition` so it can yield to urgent work. → [21 §21.2](21-concurrent-ssr-server-components.md#212-usetransition-and-starttransition)

**Transpiler** [Tooling: Babel] — Tool converting modern syntax or JSX to runnable JavaScript. → [05 §5.5](05-tooling-and-setup.md#55-transpilers-babel-swc-esbuild-what-jsx-transform-means)

**Tree shaking** [Tooling: bundler] — Dropping unused exports from the bundle. → [05 §5.3](05-tooling-and-setup.md#53-bundling-concepts-module-graph-tree-shaking-code-splitting-hmr)

**Trusted Types** [Browser] — Browser API (supported by React 19.3) forcing DOM XSS sinks to accept only vetted values. → [03 §3.8](03-browser-and-web-platform.md#38-web-security-xss-csrf-csp-clickjacking-samesite-trusted-types)

**`tsconfig` strict** [TS] — Compiler flags (`strict`, `noUncheckedIndexedAccess`…) that tighten checking. → [02 §2.15](02-typescript.md#215-tsconfig-strictness-flags)

**TypeScript 6/7** [TS] — 6.0 was the last JS-based compiler; 7.0 is the native Go port, with the `tsc` command unchanged. → [02 §2.17](02-typescript.md#217-typescript-67-the-native-compiler-and-what-changed)

**`typeof`** [JS] — Operator returning a type string; `typeof null` is `"object"`. → [01 §1.1](01-javascript.md#11-values-types-and-typeof-quirks)

## U

**Uncontrolled component** [React] — A field whose value lives in the DOM and is read via ref or `FormData`. → [14 §14.1](14-forms-and-actions.md#141-controlled-vs-uncontrolled-inputs)

**Union type** [TS] — `A | B`: a value of either type. → [02 §2.5](02-typescript.md#25-unions-and-intersections)

**`unknown`** [TS] — Safe top type that must be narrowed before use; preferred over `any`. → [02 §2.11](02-typescript.md#211-unknown-vs-any-vs-never-satisfies)

**`use`** [React] — Since React 19, API that reads a Promise or context during render and may be called conditionally. → [17 §17.10](17-data-fetching.md#1710-suspense-based-fetching-and-use)

**`'use client'`** [React] — Directive marking the client boundary of the module graph. → [21 §21.8](21-concurrent-ssr-server-components.md#218-use-client-and-use-server-server-functions-and-their-security)

**`'use server'`** [React] — Directive that marks Server Functions (not Server Components). → [21 §21.8](21-concurrent-ssr-server-components.md#218-use-client-and-use-server-server-functions-and-their-security)

**`'use cache'`** [Framework: Next.js] — Next.js 16 directive caching a function, component or file's result. → [21 §21.12](21-concurrent-ssr-server-components.md#2112-nextjs-16-caching)

**`useActionState`** [React] — Since React 19, hook that wraps an action and returns state, a wrapped action and pending flag. → [14 §14.7](14-forms-and-actions.md#147-useactionstate)

**`useCallback`** [React] — Memoizes a function reference between renders. → [15 §15.4](15-performance.md#154-usememo-and-usecallback-and-when-they-waste-effort)

**`useContext`** [React] — Reads the nearest context value. → [11 §11.3](11-context.md#113-how-propagation-and-re-rendering-work)

**`useDeferredValue`** [React] — Returns a lagging copy of a value so urgent UI renders first. → [21 §21.3](21-concurrent-ssr-server-components.md#213-usedeferredvalue)

**`useEffect`** [React] — Hook that runs side effects after commit. → [09 §9.1](09-effects.md#91-effects-as-synchronization-with-external-systems)

**`useEffectEvent`** [React] — Since React 19.2, wraps logic that reads latest values without being an effect dependency. → [09 §9.9](09-effects.md#99-useeffectevent)

**`useFormStatus`** [React DOM] — Since React 19, reads the pending state of the parent `<form>`. → [14 §14.8](14-forms-and-actions.md#148-useformstatus)

**`useId`** [React] — Generates stable unique ids for accessibility attributes, safe across server and client. → [12 §12.11](12-hooks-and-custom-hooks.md#1211-useid)

**`useImperativeHandle`** [React] — Customizes the value a parent's ref receives. → [10 §10.5](10-refs-and-dom.md#105-useimperativehandle)

**`useInsertionEffect`** [React] — Effect for CSS-in-JS libraries that runs before layout. → [09 §9.8](09-effects.md#98-useinsertioneffect)

**`useLayoutEffect`** [React] — Effect that runs synchronously after DOM mutations and before paint. → [09 §9.7](09-effects.md#97-uselayouteffect)

**`useMemo`** [React] — Caches a computed value between renders. → [15 §15.4](15-performance.md#154-usememo-and-usecallback-and-when-they-waste-effort)

**`useOptimistic`** [React] — Since React 19, shows temporary state while an action is pending. → [14 §14.9](14-forms-and-actions.md#149-useoptimistic)

**`useReducer`** [React] — State hook built on a reducer function. → [08 §8.10](08-state.md#810-usereducer)

**`useRef`** [React] — Hook returning a mutable `.current` box. → [10 §10.1](10-refs-and-dom.md#101-useref-as-a-mutable-box-that-does-not-trigger-renders)

**`useState`** [React] — Hook that gives a component state and a setter. → [08 §8.2](08-state.md#82-usestate-and-state-as-a-snapshot)

**`useSyncExternalStore`** [React] — Hook for subscribing to external stores without tearing. → [12 §12.12](12-hooks-and-custom-hooks.md#1212-usesyncexternalstore)

**`useTransition`** [React] — Hook returning `[isPending, startTransition]` for non-urgent updates. → [21 §21.2](21-concurrent-ssr-server-components.md#212-usetransition-and-starttransition)

**`useFetcher`** [Framework: React Router] — Calls loaders or actions without navigating. → [19 §19.5](19-routing.md#195-loaders-actions-usefetcher)

**user-event** [Library: React Testing Library] — Simulates realistic user interaction sequences; preferred over `fireEvent`. → [20 §20.4](20-testing.md#204-user-event-vs-fireevent)

**Utility types** [TS] — Built-ins such as `Partial`, `Pick`, `Omit`, `Record`, `ReturnType`. → [02 §2.9](02-typescript.md#29-utility-types)

## V

**Vite** [Tooling: Vite] — Dev server and bundler using native ESM; v8 is current. → [05 §5.4](05-tooling-and-setup.md#54-vite-vs-webpack)

**Virtual DOM** [React] — Lightweight tree of elements React diffs to update the real DOM. → [13 §13.1](13-reconciliation-and-fiber.md#131-why-a-virtual-dom)

**Virtualization** [Library: TanStack Virtual] — Rendering only visible rows of a long list. → [15 §15.8](15-performance.md#158-virtualization)

**`<ViewTransition>`** [React] — Component (stable in React 19.3) animating DOM changes through the View Transitions API. → [21 §21.10](21-concurrent-ssr-server-components.md#2110-viewtransition)

**Vitest** [Library: Vitest] — Vite-native test runner (v5 current). → [20 §20.2](20-testing.md#202-vitest-vs-jest)

## W

**WeakMap / WeakRef** [JS] — Collections and references that do not stop garbage collection of their targets. → [01 §1.20](01-javascript.md#120-memory-gc-leaks-from-closures-listeners-and-timers-weakmapweakref)

**WCAG** [Browser] — Web Content Accessibility Guidelines, the standard behind accessibility audits. → [04 §4.2](04-html-css-accessibility.md#42-accessibility-the-accessibility-tree-aria-rules-names-roles-states)

**WebSocket** [Browser] — Full-duplex persistent connection; Spring commonly layers STOMP on it. → [24 §24.12](24-react-with-spring-boot.md#2412-real-time-websocketstomp-sse)

**STOMP** [Protocol: STOMP] — Simple text messaging protocol, commonly used over WebSocket in Spring. → [24 §24.12](24-react-with-spring-boot.md#2412-real-time-websocketstomp-sse)

**Web Vitals** [Browser] — Field metrics measured in the browser (LCP, INP, CLS). → [15 §15.12](15-performance.md#1512-web-vitals-in-react)

**Web Worker** [Browser] — Background thread that keeps heavy work off the main thread. → [03 §3.13](03-browser-and-web-platform.md#313-workers-and-the-main-thread)

**webpack** [Tooling: webpack] — Mature, configurable bundler. → [05 §5.4](05-tooling-and-setup.md#54-vite-vs-webpack)

## X

**XSS (Cross-Site Scripting)** [Browser] — Injection of attacker script into your page; React escapes by default but `dangerouslySetInnerHTML` bypasses it. → [03 §3.8](03-browser-and-web-platform.md#38-web-security-xss-csrf-csp-clickjacking-samesite-trusted-types)

**XState** [Library: XState] — State-machine and statechart library (v5). → [18 §18.10](18-state-management.md#1810-xstate)

## Z

**Zod** [Library: Zod] — Runtime schema validation that also infers static types (v4 current). → [02 §2.16](02-typescript.md#216-runtime-validation-with-zod-vs-static-types)

**Zustand** [Library: Zustand] — Minimal hook-based global store (v5). → [18 §18.8](18-state-management.md#188-zustand)

---

**Back to the index:** [README.md](README.md)
