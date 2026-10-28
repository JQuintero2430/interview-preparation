# Cheat sheet

Use this as the last pass before an interview. Each module lists the facts and traps asked most, one line each. Every line ends with a link to the section or question that teaches it, so open the link when a line is not yet obvious.

## Part A · JavaScript

### 01 · Values, types and coercion

- `typeof null` is `'object'` and every callable reports `'function'`; primitives borrow their methods from throwaway wrapper objects. [Values and types](modules/01-js-values-types-coercion.md#1-values-and-types)
- Every number is an IEEE-754 double: `0.1 + 0.2` is `0.30000000000000004`, and integers are exact only up to 2^53 − 1, so 64-bit IDs travel as JSON strings. [Numbers](modules/01-js-values-types-coercion.md#2-numbers)
- `length` counts UTF-16 code units, spread counts code points, and only `Intl.Segmenter` counts what a reader sees. [Strings](modules/01-js-values-types-coercion.md#3-strings-and-unicode)
- Symbols are not private: string-keyed reflection skips them, nothing more. [Symbols](modules/01-js-values-types-coercion.md#4-symbols)
- Binary `+` concatenates when either primitive is a string, and every object, `[]` included, is truthy. [Coercion](modules/01-js-values-types-coercion.md#5-coercion)
- `==` converts by a fixed list of steps and `null` equals only `undefined`; `Object.is` also separates `-0` from `+0`. [Equality](modules/01-js-values-types-coercion.md#6-equality)
- `??` [Added in ES2020] falls back only on `null` and `undefined`, while `||` also replaces `0`, `''` and `false`. [Nullish operators](modules/01-js-values-types-coercion.md#7-null-undefined-and-the-nullish-operators)

### 02 · Scope, closures and `this`

- Lookup walks outward from where the code was written, never from where it was called. [Lexical scope](modules/02-js-scope-closures-this.md#1-lexical-scope-and-the-scope-chain)
- `let`, `const` and `class` exist before their line runs but stay uninitialized (the temporal dead zone); it is about time, not position, and even `typeof` throws. [TDZ](modules/02-js-scope-closures-this.md#2-hoisting-and-the-temporal-dead-zone)
- A closure captures variables, not values; a `for (let …)` loop makes a new binding per iteration, a `var` loop shares one. [Closures](modules/02-js-scope-closures-this.md#3-closures)
- `this` is chosen by the call, in order: `new`, `call`/`apply`/`bind`, `obj.method()`, then a plain call. [Binding `this`](modules/02-js-scope-closures-this.md#4-how-this-is-bound)
- Arrow functions have no `this` of their own, so `call` and `bind` cannot change it. [Binding `this`](modules/02-js-scope-closures-this.md#4-how-this-is-bound)
- `bind` returns a new function each time, so `removeEventListener` with a fresh `bind` removes nothing. [Binding `this`](modules/02-js-scope-closures-this.md#4-how-this-is-bound)
- Modules and class bodies are always strict, so Angular code is too. [Strict mode](modules/02-js-scope-closures-this.md#5-strict-mode)
- Debounce waits for silence, throttle guarantees one run per interval, and both need a `cancel()`. [Q02.19](modules/02-js-scope-closures-this.md#q02-19)

### 03 · Objects, prototypes and classes

- Assignment creates all flags `true`, `defineProperty` defaults omitted flags to `false`, and `freeze` locks only own properties, not what they point to. [Descriptors](modules/03-js-objects-prototypes-classes.md#1-properties-and-descriptors)
- A write creates an own property that shadows the inherited one, unless an inherited setter runs or an inherited read-only property blocks it. [Prototype chain](modules/03-js-objects-prototypes-classes.md#2-the-prototype-chain)
- A mutable value on a shared prototype is shared by every instance. [Prototype chain](modules/03-js-objects-prototypes-classes.md#2-the-prototype-chain)
- `class` is more than sugar: constructors refuse calls without `new`, methods are non-enumerable, the body is strict and `#private` elements are not properties. [Classes](modules/03-js-objects-prototypes-classes.md#3-classes-the-sugar-and-what-is-not-sugar)
- A Proxy around an instance breaks methods that touch `#private` elements; bind methods to the target in a `get` trap. [Proxy and Reflect](modules/03-js-objects-prototypes-classes.md#5-proxy-and-reflect)
- Spread copies one level, a JSON round trip corrupts dates, and `structuredClone` throws on functions and strips prototypes. [Copying](modules/03-js-objects-prototypes-classes.md#6-copying-shallow-deep-and-structured)
- `toSorted` still compares as strings by default. [Immutability](modules/03-js-objects-prototypes-classes.md#7-immutability-and-change-by-copy-array-methods)
- Generators are synchronous and one-shot, and they run `finally` when a consumer stops early. [Iteration protocols](modules/03-js-objects-prototypes-classes.md#8-iteration-protocols-and-generators)

### 04 · The event loop and asynchronous JavaScript

- Each turn runs one task, drains the whole microtask queue, then renders only at a rendering opportunity; `setTimeout(fn, 0)` is clamped to 4 ms once nested. [Event loop](modules/04-js-async-event-loop.md#1-the-event-loop-tasks-microtasks-and-rendering)
- In Node, `process.nextTick` runs before promise microtasks and `setImmediate` runs in the check phase. [Node's loop](modules/04-js-async-event-loop.md#2-nodes-event-loop-and-why-it-matters-for-ssr)
- A promise's executor runs synchronously, its reactions run as microtasks, and `catch` returns a new promise, so the chain continues. [Promises](modules/04-js-async-event-loop.md#3-promises-from-callbacks-to-a-state-machine)
- Combinators only wait: `all` fails fast, `allSettled` never rejects, `race` takes the first settlement, `any` the first fulfilment. [Combinators](modules/04-js-async-event-loop.md#4-combinators-and-helpers)
- Everything before the first `await` runs during the call, and `return await` matters inside `try`. [`async` and `await`](modules/04-js-async-event-loop.md#5-async-and-await)
- Awaiting a native promise takes one tick [Changed in ES2019: fewer ticks for await]. [`async` and `await`](modules/04-js-async-event-loop.md#5-async-and-await)
- Promises cannot be cancelled; racing a timer only stops waiting, while `AbortController` signals the work. [Cancellation](modules/04-js-async-event-loop.md#7-cancellation-with-abortcontroller)
- A loop of awaits on resolved promises still starves timers and rendering. [Starvation](modules/04-js-async-event-loop.md#8-unhandled-rejections-queuemicrotask-and-starvation)

### 05 · Modules, memory, errors and modern features

- An import is a live, read-only binding, not a copy; the graph is linked first, then evaluated once per module. [ES modules](modules/05-js-modules-memory-modern-features.md#1-es-modules-static-structure-linking-and-live-bindings)
- A cycle fails only when a module reads a binding not yet initialized. [ES modules](modules/05-js-modules-memory-modern-features.md#1-es-modules-static-structure-linking-and-live-bindings)
- `import()` reads the same module map, so it does not run a module twice. [Dynamic import](modules/05-js-modules-memory-modern-features.md#2-commonjs-interop-and-dynamic-import)
- Setting a variable to `null` removes one path; the object goes only when no path from a root is left. [Garbage collection](modules/05-js-modules-memory-modern-features.md#4-garbage-collection-and-memory-leaks)
- A `WeakMap` holds keys weakly and values strongly, and `WeakRef` promises nothing about timing. [Weak references](modules/05-js-modules-memory-modern-features.md#5-weak-references-weakmap-weakset-weakref-and-finalizationregistry)
- Wrap errors with `{ cause }`; `Error.isError` [Added in ES2026] works across realms. [Errors](modules/05-js-modules-memory-modern-features.md#6-errors-subclasses-causes-aggregation-and-global-handlers)
- `using` is ES2027, not ES2026, and keeps both errors in a `SuppressedError`. [Resource management](modules/05-js-modules-memory-modern-features.md#7-explicit-resource-management-using-and-disposablestack)
- An edition says when TC39 published a feature, not whether users' engines run it. [By edition](modules/05-js-modules-memory-modern-features.md#8-modern-features-by-edition-es2015-to-es2026)

## Part B · TypeScript

### 06 · TypeScript type system essentials

- TypeScript is a checker and every type is erased; "it compiled" does not make outside data a `User`. [Erased types](modules/06-ts-type-system-essentials.md#1-what-typescript-is-erased-types-tsc-and-transpile-only-tools)
- Per-file tools only remove types, so `tsc --noEmit` must run somewhere. [Erased types](modules/06-ts-type-system-essentials.md#1-what-typescript-is-erased-types-tsc-and-transpile-only-tools)
- Excess property checks apply only to fresh literals, and `readonly` and `private` are compile-time only. [Structural typing](modules/06-ts-type-system-essentials.md#2-structural-typing-assignability-and-readonly)
- A type predicate is trusted, not checked; narrowing reaches a callback when the `let` is not reassigned [Added in TypeScript 5.4]. [Narrowing](modules/06-ts-type-system-essentials.md#3-narrowing-and-control-flow-analysis)
- A `never` check in `default` turns a forgotten case into a compile error. [Unions](modules/06-ts-type-system-essentials.md#4-unions-intersections-and-discriminated-unions)
- `unknown` is the safe "anything", `any` switches checking off wherever it flows, and `{}` accepts primitives. [`any` and `unknown`](modules/06-ts-type-system-essentials.md#5-any-unknown-never-void-and-object-versus-)
- `satisfies` checks a value and keeps its precise type; `as` checks almost nothing. [`satisfies`](modules/06-ts-type-system-essentials.md#6-enums-literal-unions-as-const-and-satisfies)
- `strict` is the default since 6.0, but `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` stay outside it. [`tsconfig`](modules/06-ts-type-system-essentials.md#7-tsconfig-the-strict-family-module-settings-and-typescript-60-defaults)

### 07 · Advanced types, decorators and runtime safety

- A `const` type parameter [Added in TypeScript 5.0] keeps literals; `NoInfer` blocks inference at one site. [Generics](modules/07-ts-advanced-types-and-decorators.md#1-generics-constraints-defaults-inference-and-const-type-parameters)
- Conditional types distribute over a naked union, and recursion stops at `TS2589`. [Conditional types](modules/07-ts-advanced-types-and-decorators.md#3-conditional-types-distributivity-infer-and-recursive-types)
- `Omit` accepts misspelled keys and collapses unions. [Utility types](modules/07-ts-advanced-types-and-decorators.md#4-utility-types-built-in-and-by-hand)
- Under `strict`, method parameters stay bivariant and arrays covariant. [Variance](modules/07-ts-advanced-types-and-decorators.md#5-variance-parameter-bivariance-and-strictfunctiontypes)
- Brands exist only in types, and arithmetic on a branded number returns a plain `number`. [Brands](modules/07-ts-advanced-types-and-decorators.md#6-branded-types-for-ids-and-money)
- AOT turns `@Component` into static `ɵfac`/`ɵcmp`, but the JIT runtime refuses standard field decorators, so the workspace keeps `experimentalDecorators: true`. [Decorators](modules/07-ts-advanced-types-and-decorators.md#7-decorators-tc39-standard-versus-experimentaldecorators-and-what-angular-does-with-them)
- A Zod schema strips unknown keys, and `z.infer` is the output type. [Zod](modules/07-ts-advanced-types-and-decorators.md#8-runtime-validation-with-zod-4-schema-first-types)
- `form.value` is `Partial` because disabled controls are missing. [Typing in Angular](modules/07-ts-advanced-types-and-decorators.md#9-typing-patterns-in-angular-code)

## Part C · Web platform

### 08 · Browser rendering, the DOM and events

- A page shows nothing until its CSS is ready; a classic script waits for it, parser stopped; `defer` and module scripts wait, parser running. [Critical path](modules/08-browser-rendering-dom-events.md#1-the-critical-rendering-path-from-bytes-to-pixels)
- Geometry changes re-run layout, visuals re-run paint, and `transform` or `opacity` only composite. [Layout, paint, composite](modules/08-browser-rendering-dom-events.md#2-layout-paint-and-composite-what-each-change-costs)
- A geometry read after a write forces layout inside your task; in a loop that is thrashing, so read first, then write. [Layout, paint, composite](modules/08-browser-rendering-dom-events.md#2-layout-paint-and-composite-what-each-change-costs)
- `MutationObserver` delivers one batch in a microtask. [DOM APIs](modules/08-browser-rendering-dom-events.md#3-dom-apis-and-observers)
- `stopPropagation` spares the current element's other listeners, `stopImmediatePropagation` does not, and `preventDefault` only cancels the default action. [Events](modules/08-browser-rendering-dom-events.md#4-events-propagation-default-actions-passive-listeners-and-delegation)
- Only `composed` events leave a shadow root, retargeted to the host; a closed root is not security. [Web components](modules/08-browser-rendering-dom-events.md#5-web-components-custom-elements-shadow-dom-and-templates)
- LCP, INP and CLS are judged on field data at the 75th percentile, and a lab load without interactions has no INP. [Core Web Vitals](modules/08-browser-rendering-dom-events.md#6-core-web-vitals-lcp-inp-and-cls)
- `pushState` never fires `popstate`; the Navigation API reports every navigation through `navigate`. [History](modules/08-browser-rendering-dom-events.md#7-history-api-versus-navigation-api)

### 09 · Networking, storage and browser security

- `fetch` resolves on any HTTP status, rejects only on a network failure, a malformed request or an abort, and reads its body once. [Fetch](modules/09-web-networking-storage-security.md#2-fetch-xhr-and-the-request-lifecycle)
- A method's safety and idempotency decide what a client may repeat, so a `POST` is never blindly retried. [HTTP semantics](modules/09-web-networking-storage-security.md#1-http-semantics-methods-status-codes-and-headers)
- HTTP/2 multiplexes streams but TCP still blocks the line; HTTP/3 moves streams onto QUIC. [HTTP versions](modules/09-web-networking-storage-security.md#3-http11-http2-and-http3)
- `no-cache` revalidates and `no-store` stores nothing; hashed assets get a year and `immutable`, the HTML stays `no-cache`. [Caching](modules/09-web-networking-storage-security.md#4-http-caching)
- CORS lets the browser hide a response, never stops the request, and a credentialed answer needs the exact origin. [CORS](modules/09-web-networking-storage-security.md#5-the-same-origin-policy-and-cors)
- `HttpOnly` hides a cookie from script, but injected script can still use it. [Cookies](modules/09-web-networking-storage-security.md#6-cookies)
- Any injected script reads Web Storage, IndexedDB and Cache Storage, so keep secrets out of all of them. [Storage](modules/09-web-networking-storage-security.md#7-browser-storage-what-each-is-safe-for)
- A nonce or hash CSP beats an allowlist, and Trusted Types guard sinks, not logic. [CSP](modules/09-web-networking-storage-security.md#8-content-security-policy-and-trusted-types)

### 10 · CSS essentials

- Vertical margins collapse only between in-flow blocks in one formatting context, and `border-box` makes `width` the visible box. [Box model](modules/10-css-essentials.md#1-the-box-model-and-formatting-contexts)
- The cascade compares importance, the `style` attribute, layer, specificity and order, so higher specificity does not always win. [Cascade](modules/10-css-essentials.md#2-the-cascade-origins-specificity-and-layers)
- `:where()` weighs zero; `:is()`, `:not()` and `:has()` weigh their most specific argument. [Cascade](modules/10-css-essentials.md#2-the-cascade-origins-specificity-and-layers)
- A flex item stays as wide as its longest word until `min-width: 0`. [Flexbox and grid](modules/10-css-essentials.md#3-flexbox-grid-and-subgrid)
- `z-index` only orders siblings inside one stacking context, which `opacity`, `transform` and `isolation` also create. [Stacking](modules/10-css-essentials.md#4-positioning-stacking-contexts-and-z-index)
- A media query measures the viewport, a container query the component's container. [Responsive CSS](modules/10-css-essentials.md#5-responsive-css-media-queries-container-queries-and-fluid-type)
- A custom property resolves at computed-value time and a subtree can redefine it; a Sass variable is gone after the build. [Custom properties](modules/10-css-essentials.md#6-custom-properties-theming-and-color-scheme)
- Sass earns its place for generated tokens, mixins and `@use` modules; native nesting covers a new small app. [Nesting versus Sass](modules/10-css-essentials.md#7-native-nesting-versus-sass)

### 11 · Accessibility

- Name the WCAG version and level, because the European Accessibility Act's text names none. [Standards](modules/11-accessibility.md#1-why-accessibility-and-what-the-standards-require)
- Native elements put role, name, state and focus in the accessibility tree; a `div` card and skipped headings leave it flat. [Semantic HTML](modules/11-accessibility.md#2-semantic-html-landmarks-and-headings)
- ARIA only annotates that tree: use a native element first, and never `aria-hidden` on something focusable. [ARIA](modules/11-accessibility.md#3-aria-roles-states-properties-and-its-rules)
- Focus follows DOM order, a composite keeps one tab stop, and a modal needs an Escape exit and restored focus. [Keyboard and focus](modules/11-accessibility.md#4-keyboard-focus-order-roving-tabindex-and-focus-traps)
- A single-page app must update the title, move focus and announce changes itself, in a live region that exists first. [SPA focus](modules/11-accessibility.md#5-focus-management-in-spas-and-live-regions)
- The accessible name comes from the first source with text, with `title` and `placeholder` last. [Names and forms](modules/11-accessibility.md#6-accessible-names-descriptions-and-forms)
- A scan never proves a task works, so layer lint, tests, a keyboard and screen-reader pass, and users. [Testing](modules/11-accessibility.md#7-testing-accessibility)

## Part D · Angular

### 12 · How Angular works

- Angular owns the entry point, the build and the update loop; its packages are one release group. [Framework](modules/12-angular-how-it-works.md#1-what-a-framework-does-and-angulars-philosophy)
- Workspace configurations merge one level deep, and `ng update` also runs migrations. [CLI](modules/12-angular-how-it-works.md#2-the-cli-and-the-workspace-angularjson-projects-schematics-and-ng-update)
- `ng build` bundles with esbuild (Vite only serves `ng serve`), and budgets compare raw bytes. [Building](modules/12-angular-how-it-works.md#3-building-the-application-builder-output-layout-and-budgets)
- Environment files are fixed at build time and readable by every visitor, so secrets stay out. [Environments](modules/12-angular-how-it-works.md#4-environments-and-configuration-build-time-versus-run-time)
- `bootstrapApplication` returns a promise; a rejected initializer leaves a blank page reported only by `main.ts`'s `.catch`. [Bootstrapping](modules/12-angular-how-it-works.md#6-bootstrapping-bootstrapapplication-the-platform-and-initializers)
- `APP_INITIALIZER` [Deprecated since v19 — use provideAppInitializer]. [Bootstrapping](modules/12-angular-how-it-works.md#6-bootstrapping-bootstrapapplication-the-platform-and-initializers)
- Strict templates default to on [Changed in v22: defaults to `true`], yet the upgrade migration writes `strictTemplates: false` into old projects. [AOT and JIT](modules/12-angular-how-it-works.md#7-aot-versus-jit-and-template-type-checking)
- No virtual DOM: the update pass compares each binding with its last value. [Under the hood](modules/12-angular-how-it-works.md#8-under-the-hood-what-the-compiler-emits-and-what-the-runtime-does-with-it)

### 13 · Components and templates

- `imports` lists everything the template uses: an unknown element is `NG8001`, but a missing attribute-selector component silently renders as the plain element. [Anatomy](modules/13-components-and-templates.md#1-component-anatomy-selector-template-styles-imports-and-the-v22-file-convention)
- `standalone` defaults to `true` [Changed in v19.0: `standalone` defaults to `true`], and OnPush is the default [Changed in v22.0: OnPush is the default]. [Anatomy](modules/13-components-and-templates.md#1-component-anatomy-selector-template-styles-imports-and-the-v22-file-convention)
- A template expression cannot change state, and its only globals are `undefined` and `$any`. [Expressions](modules/13-components-and-templates.md#2-interpolation-and-template-expressions-what-is-allowed)
- `?.` gives `undefined` [Changed in v22.0: `?.` gives `undefined`]; `!` is erased, so it never prevents a crash. [Safe navigation](modules/13-components-and-templates.md#3-safe-navigation-the-non-null-assertion-and-any)
- `[title]` writes the DOM property, `[attr.title]` removes the attribute on `null`, and an object in `[class]` is compared by reference. [Bindings](modules/13-components-and-templates.md#4-property-attribute-class-and-style-bindings)
- `[(x)]` is `[x]` plus `(xChange)`, and a handler returning `false` calls `preventDefault`. [Events](modules/13-components-and-templates.md#5-event-binding-and-two-way-binding)
- `host` is preferred over the legacy decorators, which are not deprecated; for `class` and `style` the template wins. [Host element](modules/13-components-and-templates.md#7-the-host-element-host-metadata-hostbinding-and-hostlistener)
- Emulated encapsulation is an attribute rewrite, not Shadow DOM. [Encapsulation](modules/13-components-and-templates.md#9-view-encapsulation-emulated-shadowdom-and-none-and-what-the-compiler-does-to-your-css)

### 14 · Directives and pipes

- An `ElementRef` write is overwritten by any binding on that property; `host` bindings stay current. [Attribute directives](modules/14-directives-and-pipes.md#1-directives-and-attribute-directives-host-inputs-elementref-and-renderer2)
- A `*` wraps the element in an `<ng-template>`, and context guards are compile-time only. [Structural directives](modules/14-directives-and-pipes.md#2-structural-directives-ng-template-templateref-viewcontainerref-and-the-microsyntax)
- `hostDirectives` [Stable since v15.0] expose none of their inputs or outputs unless listed. [Host directives](modules/14-directives-and-pipes.md#3-host-directives-the-composition-api)
- `*ngIf`, `*ngFor` and `*ngSwitch` [Deprecated since v20.0 — use `@if`, `@for`, `@switch`], but `NgClass` and `NgStyle` are not. [Built-ins](modules/14-directives-and-pipes.md#4-built-in-directives-ngclass-ngstyle-the-outlets-and-what-control-flow-replaced)
- A pure pipe re-runs only when an argument reference changes, so an in-place `push` is invisible; impure pipes run on every check. [Pipes](modules/14-directives-and-pipes.md#5-pipes-pure-and-impure-custom-pipes-injection-and-imports)
- `async`, `json`, `keyvalue` and `slice` are impure. [Built-in pipes](modules/14-directives-and-pipes.md#6-built-in-pipes-and-locale-data)
- A signal read in a template is normal, not a banned method call. [Pipe, computed or method](modules/14-directives-and-pipes.md#7-pipe-computed-or-method-call-in-a-template)
- The `async` pipe subscribes once per usage, a signal is a `TS2769` build error, and errors reach the `ErrorHandler` [Changed in v20.0: the pipe reports errors to `ErrorHandler`]. [`async` pipe](modules/14-directives-and-pipes.md#8-the-async-pipe-under-the-hood)

### 15 · Standalone and NgModules

- An NgModule did three jobs: template scope, providers that join the importing injector, and the lazy-loading unit; it is not deprecated. [NgModules](modules/15-standalone-and-ngmodules.md#1-what-ngmodules-did-compilation-scope-injector-and-lazy-loading-unit)
- A standalone `imports` never takes a `standalone: false` class (`NG2011`) or a `forRoot()`; standalone is the default [Changed in v19.0: `standalone` defaults to `true`]. [Standalone `imports`](modules/15-standalone-and-ngmodules.md#2-standalone-components-and-the-imports-array)
- `importProvidersFrom` serves environment injectors only. [Bootstrapping](modules/15-standalone-and-ngmodules.md#3-bootstrapping-and-providers-without-modules-bootstrapapplication-provide-functions-and-importprovidersfrom)
- `loadComponent` loads a standalone component and `loadChildren` a routes array. [Lazy loading](modules/15-standalone-and-ngmodules.md#4-lazy-loading-without-modules-loadcomponent-and-loadchildren-with-route-arrays)
- A `SharedModule` with providers gives each lazy injector its own instance. [Legacy patterns](modules/15-standalone-and-ngmodules.md#5-legacy-ngmodule-patterns-declarations-exports-forrootforchild-sharedmodule-and-coremodule)
- A standalone component importing an NgModule gets its exports, and a module's `imports` take standalone classes. [Interop](modules/15-standalone-and-ngmodules.md#6-interop-ngmodule-libraries-in-standalone-apps-and-standalone-pieces-in-ngmodule-apps)
- The schematic runs three passes, and `RouterModule.forRoot` and lazy modules remain after them. [Migration](modules/15-standalone-and-ngmodules.md#7-migrating-with-ng-generate-angularcorestandalone-three-passes-hybrid-apps-and-common-failures)
- AOT writes a module's scope into each declared component's `dependencies`, so nothing looks a module up at run time. [Under the hood](modules/15-standalone-and-ngmodules.md#8-under-the-hood-what-the-compiler-emits-for-modules-and-standalone-components-and-the-standalone-injector)

### 16 · Dependency injection

- `useClass` makes a second instance where `useExisting` reuses the first, and the last provider for a token wins without an error. [Providers](modules/16-dependency-injection.md#2-providers-and-tokens-useclass-usevalue-usefactory-and-useexisting)
- `@Service` [Added in v22.0] refuses constructor parameters and does not replace `@Injectable`. [`providedIn`](modules/16-dependency-injection.md#3-providedin-service-scopes-and-tree-shaking)
- A root service listed in a component's `providers` gets a second instance. [`providedIn`](modules/16-dependency-injection.md#3-providedin-service-scopes-and-tree-shaking)
- `inject()` needs an injection context; `ngOnInit` and anything after an `await` throw `NG0203`. [Injection context](modules/16-dependency-injection.md#4-the-injection-context-inject-runininjectioncontext-and-injectasync)
- A lookup walks the element tree up, then the environment tree, to the `NullInjector`; `host` is not "the parent". [Injector tree](modules/16-dependency-injection.md#5-the-injector-tree-platform-root-route-and-element-injectors-and-the-modifiers)
- `viewProviders` are hidden from projected content but not from a child component in the view. [`viewProviders`](modules/16-dependency-injection.md#6-providers-versus-viewproviders-and-per-instance-state)
- An `InjectionToken` without a `factory` fails with `NG0201` at first use. [Tokens](modules/16-dependency-injection.md#7-injectiontoken-multi-providers-environment-providers-and-initializers)
- A root service reached through a child injector outlives it, and `forwardRef` does not break an `NG0200` cycle. [Lifetime](modules/16-dependency-injection.md#8-lifetime-and-dynamic-injectors-destroyref-environmentinjector-injectorcreate-forward-references-and-cycles)

### 17 · Signals

- A signal is a getter that records who reads it, so Angular learns what changed. [Why signals](modules/17-signals.md#1-why-signals-exist)
- A writable signal notifies only when the new value is not `Object.is`-equal, so replace values; `mutate` [Removed in v17.0]. [Writable signals](modules/17-signals.md#2-writable-signals)
- A `computed` is lazy and memoized, and may not write signals (`NG0600`). [Computed](modules/17-signals.md#3-computed-signals)
- `effect` [Stable since v20.0] pushes state out, runs once per flush with the latest values, and is the wrong tool for deriving state. [Effects](modules/17-signals.md#4-effects)
- `linkedSignal` is writable derived state: a local write lasts until the source changes. [`linkedSignal`](modules/17-signals.md#5-linkedsignal-writable-derived-state)
- `resource` and `rxResource` [Stable since v22.0]: `value()` throws in the error state even with a `defaultValue`, and `reload()` keeps the old value. [Resources](modules/17-signals.md#6-resources-async-data-as-signals)
- `input`, `output`, `model` and the signal queries are [Stable since v19.0]; `model()` writes the parent's signal synchronously. [Component APIs](modules/17-signals.md#7-signal-based-component-apis)
- `toSignal` unsubscribes with its injection context; `toObservable` emits asynchronously, once per flush. [RxJS interop](modules/17-signals.md#8-interop-with-rxjs)

### 18 · Control flow and `@defer`

- Built-in blocks [Stable since v18.0] are compiler syntax with no import, and `NgIf` is [Deprecated since v20.0 — use @if]. [Blocks](modules/18-control-flow-and-defer.md#1-built-in-blocks-versus-directives-and-the-if-family-with-as)
- `@for` needs `track` (`NG5002`); `track $index` leaves typed text beside the wrong item. [`@for`](modules/18-control-flow-and-defer.md#2-for-track-context-variables-empty-and-what-angular-can-iterate)
- `@switch` uses `===` with no fallthrough, and `@default never;` needs a `@let` first for a signal. [`@switch`](modules/18-control-flow-and-defer.md#3-switch-and-exhaustive-checking-with-default-never)
- A `@defer` block moves forward only; `after` delays entering Loading and `minimum` holds a state once entered. [Defer states](modules/18-control-flow-and-defer.md#5-defer-blocks-and-states-placeholder-loading-error-minimum-and-after)
- A failed load without `@error` sends `NG0750` to the `ErrorHandler`. [Defer states](modules/18-control-flow-and-defer.md#5-defer-blocks-and-states-placeholder-loading-error-minimum-and-after)
- The main trigger decides when the block renders and `prefetch` only when the code loads; `when` fires once. [Triggers](modules/18-control-flow-and-defer.md#6-triggers-and-prefetching)
- Only a dependency used inside the block alone becomes a lazy chunk, and the server renders the placeholder. [Chunks and SSR](modules/18-control-flow-and-defer.md#7-what-lands-in-a-chunk-testing-deferred-blocks-and-the-ssr-pointer)
- The control-flow schematic runs with `ng generate`, not `ng update`. [Migration](modules/18-control-flow-and-defer.md#8-migrating-with-ng-generate-angularcorecontrol-flow)

### 19 · Component communication and projection

- Signal `input`, `output` and `model` are [Stable since v19.0]; `model()` is an input plus an output `xChange`. [Inputs and outputs](modules/19-component-communication-and-projection.md#1-inputs-outputs-and-two-way-binding-the-parent-and-child-contract)
- An output emitted in the constructor is lost, and `ngOnChanges` still runs for signal inputs. [Inputs and outputs](modules/19-component-communication-and-projection.md#1-inputs-outputs-and-two-way-binding-the-parent-and-child-contract)
- Where a service's provider is declared decides who shares its state. [Shared state](modules/19-component-communication-and-projection.md#2-sharing-state-beyond-the-tree-services-with-signals-and-di-scoped-state)
- The first matching `select` wins, and a fallback shows only when no node matched. [Projection](modules/19-component-communication-and-projection.md#3-content-projection-ng-content-slots-ngprojectas-fallback-content-and-the-lifecycle-trap)
- An `@if` around `<ng-content>` only hides content that is already constructed. [Projection](modules/19-component-communication-and-projection.md#3-content-projection-ng-content-slots-ngprojectas-fallback-content-and-the-lifecycle-trap)
- A passed template reads the declaring component's fields; without a context guard `let-row` is `any`. [Template APIs](modules/19-component-communication-and-projection.md#4-template-driven-apis-ng-template-ngtemplateoutlet-and-typed-context)
- `contentChildren` finds direct children unless `descendants` is set, and a required query throws `NG0951` until its element exists. [Queries](modules/19-component-communication-and-projection.md#5-queries-view-and-content-queries-with-signal-queries)
- `ComponentFactoryResolver` is [Removed in v22.0], and a dynamic component needs `destroy()`. [Dynamic components](modules/19-component-communication-and-projection.md#7-dynamic-components-viewcontainerrefcreatecomponent-createcomponent-and-bindings)

### 20 · Lifecycle and render hooks

- The "after" hooks come back up the tree, so a child's `ngAfterViewInit` precedes its parent's. [Lifecycle map](modules/20-lifecycle-and-render-hooks.md#1-the-lifecycle-map-phases-and-the-order-of-the-hooks)
- `ngOnChanges` runs before `ngOnInit`, whatever the docs' table lists. [Lifecycle map](modules/20-lifecycle-and-render-hooks.md#1-the-lifecycle-map-phases-and-the-order-of-the-hooks)
- Construction is the only phase with an injection context, and a required input read there throws `NG0950`. [Constructor and `ngOnInit`](modules/20-lifecycle-and-render-hooks.md#2-constructor-ngoninit-and-inputs-what-exists-when)
- `ngOnChanges` still runs for signal inputs, and an in-place mutation reaches no hook. [Hooks and signals](modules/20-lifecycle-and-render-hooks.md#3-which-hooks-still-matter-with-signals)
- `afterNextRender` and `afterEveryRender` [Stable since v20.0] run after the application render; DOM work belongs in them, not in `ngAfterViewInit`. [Render hooks](modules/20-lifecycle-and-render-hooks.md#4-render-hooks-afternextrender-aftereveryrender-and-their-phases)
- An unconditional signal write in a render hook ends in `NG0103`. [Render hooks](modules/20-lifecycle-and-render-hooks.md#4-render-hooks-afternextrender-aftereveryrender-and-their-phases)
- `takeUntilDestroyed` ends streams only and needs an injection context or an explicit ref. [Teardown](modules/20-lifecycle-and-render-hooks.md#5-teardown-ngondestroy-destroyref-and-takeuntildestroyed)
- `NG0100` comes from a development-only second pass; a default OnPush parent shows stale text instead of throwing. [`NG0100`](modules/20-lifecycle-and-render-hooks.md#6-expressionchangedafterithasbeencheckederror-cause-and-fixes)

### 21 · Change detection

- A notification says something may have changed, and a walk writes only the bindings that differ. [Synchronization](modules/21-change-detection.md#1-the-synchronization-problem-dirty-checking-and-fine-grained-reactivity)
- `OnPush` is the default [Changed in v22.0: "Component with undefined `changeDetection` property are now `OnPush` by default"]; a plain-field write is silent. [`OnPush` and `Eager`](modules/21-change-detection.md#2-onpush-and-eager-strategies-and-what-marks-a-view-dirty)
- zone.js knows a task ran, not what changed, which is why it left the default. [zone.js](modules/21-change-detection.md#3-zonejs-and-ngzone-how-changes-used-to-be-detected-and-why-zone-left-the-default)
- A signal write refreshes only the view that reads it; an event or `markForCheck` flags the path to the root. [Tree walk](modules/21-change-detection.md#4-the-tree-walk-global-and-targeted-refreshes)
- Zoneless, `PendingTasks` keeps the app unstable until awaited work finishes; `provideZonelessChangeDetection` is [Stable since v20.2]. [Zoneless](modules/21-change-detection.md#5-zoneless-change-detection-the-scheduler-its-triggers-and-pendingtasks)
- Migrating to zoneless means moving state to signals and replacing `NgZone.onStable` waits with `afterNextRender`. [Migration](modules/21-change-detection.md#6-migrating-a-zone-based-app-to-zoneless)
- `markForCheck` flags and the render follows the next tick; `detectChanges` renders one view now. [`ChangeDetectorRef`](modules/21-change-detection.md#7-changedetectorref-markforcheck-detectchanges-detach-and-reattach)
- `provideCheckNoChangesConfig({ exhaustive: true })` reports a plain write in an OnPush view that the default pass skips. [Debugging](modules/21-change-detection.md#8-debugging-the-profiler-providechecknochangesconfig-and-stability)

### 22 · RxJS foundations

- A cold Observable starts its producer at `subscribe`, and each subscription starts its own run; a hot source shares a producer created outside the subscription. [Cold and hot](modules/22-rxjs-foundations.md#3-cold-and-hot-unicast-and-multicast)
- Callbacks are any number of `next`, then at most one `error` or `complete`; teardown runs once, on close. [Anatomy](modules/22-rxjs-foundations.md#2-anatomy-observable-observer-subscription-and-teardown)
- `share()` puts a Subject between one run and many consumers and resets when the last one leaves; RxJS has no backpressure channel. [Cold and hot](modules/22-rxjs-foundations.md#3-cold-and-hot-unicast-and-multicast)
- A late subscriber gets nothing from `Subject`, the current value from `BehaviorSubject`, and the buffer (unbounded by default) from `ReplaySubject`. [Subjects](modules/22-rxjs-foundations.md#4-subjects-subject-behaviorsubject-replaysubject-and-asyncsubject)
- Import operators from `'rxjs'` [Added in v7.2], because seven `'rxjs/operators'` names are different functions. [Pipeable operators](modules/22-rxjs-foundations.md#5-pipeable-operators-and-writing-your-own)
- `first()` errors on an empty source where `take(1)` completes, and `distinctUntilChanged` compares with `===`. [Catalogue](modules/22-rxjs-foundations.md#6-the-operator-catalogue-creation-transformation-filtering-utility-conditional-and-aggregation)
- `combineLatest` waits until every source has emitted, `forkJoin` emits only on complete, `withLatestFrom` fires on its source alone. [Combining](modules/22-rxjs-foundations.md#7-combining-streams-combinelatest-withlatestfrom-forkjoin-zip-merge-and-concat)
- `debounceTime` emits the last value after silence, `throttleTime` the first of a window, `auditTime` the last at its end. [Timing](modules/22-rxjs-foundations.md#8-timing-operators-debouncetime-throttletime-audittime-and-sampletime)

### 23 · RxJS in depth

- `switchMap` unsubscribes the old inner, `mergeMap` runs all of them, `concatMap` buffers and `exhaustMap` drops. [Flattening](modules/23-rxjs-in-depth.md#1-higher-order-observables-switchmap-mergemap-concatmap-and-exhaustmap)
- Use `switchMap` for reads, `exhaustMap` for submits, `concatMap` for ordered writes; unsubscribing aborts the client request, not the server's work. [Choosing](modules/23-rxjs-in-depth.md#2-choosing-a-flattening-operator-races-lost-writes-cancellation-and-recursion)
- `catchError` after the flattening operator ends the outer stream, and inside the inner pipe keeps it alive. [Errors](modules/23-rxjs-in-depth.md#3-errors-catcherror-placement-finalize-and-error-versus-complete)
- `retry(3)` is four attempts, and `repeat` re-subscribes on complete, never on error. [Retry](modules/23-rxjs-in-depth.md#4-retrying-and-repeating-retry-with-backoff-and-repeat)
- `shareReplay(1)` has `refCount` `false`, so it keeps an endless source running; `{ bufferSize: 1, refCount: true }` stops it. [Multicasting](modules/23-rxjs-in-depth.md#5-multicasting-in-depth-share-configuration-sharereplay-and-connect)
- `takeUntilDestroyed` [Stable since v19.0], `toSignal` and the `async` pipe end at destroy; a bare `subscribe` does not, and `takeUntil` goes last. [Unsubscription](modules/23-rxjs-in-depth.md#6-unsubscription-strategies-in-angular-and-finding-leaks)
- `toSignal` needs `initialValue` unless the source is synchronous; for async data out, use `rxResource` [Stable since v22.0]. [Signals and RxJS](modules/23-rxjs-in-depth.md#7-rxjs-and-signals-decision-rules-tosignal-toobservable-and-rxresource)
- `asyncScheduler` is a timer even at delay 0, `asapScheduler` a microtask; `observeOn` moves delivery, `subscribeOn` the subscription. [Schedulers](modules/23-rxjs-in-depth.md#9-schedulers-queue-asap-async-and-animation-frame-observeon-and-subscribeon)

### 24 · Routing

- The Router takes the first match in array order; an empty-path redirect needs `pathMatch: 'full'`, and the wildcard keeps the URL. [Configuration](modules/24-routing.md#1-router-configuration-providerouter-route-matching-redirects-and-the-wildcard)
- The router reuses a component when only parameters change, so a snapshot goes stale; `paramsInheritanceStrategy` [Changed in v22: default 'always']. [Parameters](modules/24-routing.md#2-route-parameters-path-matrix-query-and-fragment-inheritance-and-component-input-binding)
- A `loadChildren` loader runs before `canActivate`, so only `canMatch` keeps the chunk from a refused user; `canLoad` [Deprecated since v15.1 — use canMatch]. [Lazy loading](modules/24-routing.md#4-lazy-loading-in-depth-loaders-canmatch-and-route-injectors)
- A guard returning `false` cancels, a `UrlTree` or `RedirectCommand` redirects; guards hide pages but are never access control. [Guards](modules/24-routing.md#5-functional-guards-canmatch-canactivate-candeactivate-and-redirectcommand)
- Resolvers start after every guard passes; by default only a path or matrix parameter change reruns them. [Resolvers](modules/24-routing.md#6-resolvers-and-route-data-resolvefn-failures-and-router-resources)
- Every navigation ends in one terminal event (`NavigationEnd`, `NavigationCancel`, `NavigationError` or `NavigationSkipped`), and a cancel resolves `false`. [Lifecycle](modules/24-routing.md#7-the-navigation-lifecycle-events-cancellation-and-the-transition-pipeline)
- `PreloadAllModules` loads every lazy chunk; preloading starts only after `NavigationEnd`. [Preloading](modules/24-routing.md#8-preloading-strategies-and-route-reuse)
- The path strategy needs a server fallback for deep links; hash does not. [Platform](modules/24-routing.md#10-the-router-and-the-platform-history-api-navigation-api-and-location-strategies)

### 25 · Forms: reactive and template-driven

- Reactive forms build the model synchronously in the class; template-driven controls exist only after `whenStable()`. [Two APIs](modules/25-forms-reactive-and-template-driven.md#1-two-forms-apis-template-driven-and-reactive-and-the-control-directive-and-accessor-triangle)
- `setValue` is strict, `patchValue` skips unknown keys, `reset()` gives `null` unless non-nullable. [Reactive model](modules/25-forms-reactive-and-template-driven.md#2-the-reactive-model-formcontrol-formgroup-formarray-and-formrecord)
- Typed `value` is a `Partial`; `FormBuilder` controls are nullable unless `NonNullableFormBuilder` builds them. [Typed forms](modules/25-forms-reactive-and-template-driven.md#3-typed-forms-formbuilder-and-nonnullableformbuilder)
- `Validators.required` accepts `' '`, `0` and `false`, `minLength` passes an empty value, a cross-field error lives on the group. [Validators](modules/25-forms-reactive-and-template-driven.md#5-validators-built-in-custom-and-cross-field)
- The control cancels the previous async run on the next value; `PENDING` is neither valid nor invalid. [Async validators](modules/25-forms-reactive-and-template-driven.md#6-async-validators-pending-status-cancellation-and-debouncing)
- `touched` means left and `dirty` changed; the `events` stream is [Added in v18.0]. [Status and `events`](modules/25-forms-reactive-and-template-driven.md#7-status-updateon-valuechanges-and-the-unified-events-stream)
- An invalid form still fires `ngSubmit`; show errors on `touched` or after submit. [Error display](modules/25-forms-reactive-and-template-driven.md#8-error-display-strategies-and-accessible-errors)
- A custom control needs `NG_VALUE_ACCESSOR` with `multi: true` and gets `setDisabledState` on attach [Changed in v15: setDisabledState is called on attach even when the control is enabled]. [Accessors](modules/25-forms-reactive-and-template-driven.md#10-controlvalueaccessor-and-the-validator-interface-custom-controls-under-the-hood)

### 26 · Signal Forms

- Signal Forms [Stable since v22.0] makes the model signal the form: `form(model)` keeps no copy of the data; a field write is a model write. [Why a third API](modules/26-signal-forms.md#1-why-a-third-forms-api-model-first-signals-end-to-end)
- Call the field before reading its state (`f.name().value()`); a programmatic `value.set` leaves `dirty()` false. [Field tree](modules/26-signal-forms.md#2-form-the-field-tree-and-field-state)
- `[formField]` adds no `ng-*` classes unless `NG_STATUS_CLASSES` is provided, and no `aria-invalid`. [Binding](modules/26-signal-forms.md#3-binding-with-formfield-native-inputs-attributes-classes-and-rendering)
- `min` and `max` take numbers or `null` [Changed in v22: numbers or null only], so a string field fails with TS2345. [Schema rules](modules/26-signal-forms.md#4-schema-rules-and-validation-built-in-rules-validate-and-reusable-schemas)
- Validation skips disabled, hidden and readonly fields; an `@if` alone does not. [Conditional logic](modules/26-signal-forms.md#5-cross-field-and-conditional-logic-valueof-validatetree-applywhen-disabled-hidden-and-readonly)
- A pending async field is neither valid nor invalid; `debounce()` delays the model write, `validateAsync` the loader. [Async validation](modules/26-signal-forms.md#6-async-validation-and-debounce-validateasync-validatehttp-pending-and-cancellation)
- `submit()` touches the fields, checks validity, runs the action and files returned errors on the fields they target until the user edits them. [Submission](modules/26-signal-forms.md#7-submission-submit-formroot-submitting-and-server-errors)
- `compatForm` migrates top-down and `SignalFormControl` bottom-up; no schematic helps. [Migration](modules/26-signal-forms.md#9-interop-and-migration-compatform-signalformcontrol-and-what-changed-from-v21-to-v22)

### 27 · HTTP client

- A non-2xx status arrives on the error channel, unsubscribing aborts, and `get<User>()` only asserts the body's type. [HttpClient versus `fetch`](modules/27-http-client.md#1-httpclient-versus-fetch-what-the-framework-adds-over-the-platform)
- The default backend is `FetchBackend` [Changed in v22.0: FetchBackend is the default HttpBackend], and `HttpClientModule` brings the XHR backend. [Setup](modules/27-http-client.md#2-setting-up-httpclient-providehttpclient-its-features-and-the-fetch-backend-default)
- `params.set()` returns a copy, and `HttpContext` never reaches the server. [Requests](modules/27-http-client.md#3-making-requests-typed-responses-observe-responsetype-immutable-params-and-headers-and-httpcontext)
- Interceptors run first to last on the way out and must clone; class interceptors run only under `withInterceptorsFromDi()`. [Interceptors](modules/27-http-client.md#4-interceptors-the-functional-chain-order-and-next-and-class-interceptors-through-withinterceptorsfromdi)
- Status 0 covers network failures, timeouts and aborts, and a retry needs an idempotent method, a retryable status and jitter. [Errors](modules/27-http-client.md#5-errors-httperrorresponse-an-error-mapping-layer-and-retry-with-backoff-and-jitter)
- Concurrent 401s share one refresh, each request retries once, and the refresh request skips the interceptor. [Authentication](modules/27-http-client.md#7-authentication-attaching-tokens-refreshing-on-401-with-a-request-queue-and-avoiding-refresh-loops)
- Angular only sends the XSRF header, on non-GET/HEAD requests to the page's own origin; the server must check it. [XSRF](modules/27-http-client.md#8-xsrf-protection-how-httpclient-reads-the-cookie-and-sets-the-header-and-when-it-does-not)
- `httpResource` [Stable since v22.0] requests eagerly and suits reads: a params change resets `value()` and only `reload()` keeps it. [`httpResource`](modules/27-http-client.md#10-httpresource-signal-driven-requests-and-when-to-prefer-it-over-httpclient)

### 28 · State management

- Server data is a cache the server owns, and what must survive a reload or a shared link belongs in the URL. [Kinds of state](modules/28-state-management.md#1-kinds-of-state-server-cache-ui-form-url-and-session-state-and-where-each-belongs)
- One big state signal makes selectors re-run on every write, and `asReadonly()` removes `set` and `update` only. [Signals store](modules/28-state-management.md#2-the-service-with-signals-store-state-shape-derived-selectors-methods-and-async-loads)
- An NgRx reducer must be pure so replay works, and the runtime checks are off outside development. [NgRx Store](modules/28-state-management.md#4-ngrx-store-actions-reducers-createactiongroup-createfeature-and-runtime-checks)
- Memoized selectors keep one entry compared by reference. [Selectors](modules/28-state-management.md#5-selectors-memoization-composition-and-reading-the-store-as-signals)
- An error in an effect is resubscribed up to ten times, but a `catchError` outside the inner pipe ends it for good. [Effects](modules/28-state-management.md#6-effects-functional-effects-flattening-error-handling-and-dispatch-false)
- ComponentStore is not deprecated, and SignalStore's protected state is a TypeScript check, not a runtime lock. [SignalStore](modules/28-state-management.md#8-componentstore-and-signalstore-signalstate-signalstore-withstate-withcomputed-withmethods-and-protected-state)
- `rxMethod` returns a function that subscribes internally, and the Events plugin is [Stable since NgRx v21.0]. [SignalStore in depth](modules/28-state-management.md#9-signalstore-in-depth-rxmethod-withentities-custom-features-and-the-events-plugin)
- A rollback to a snapshot overwrites later changes the server accepted. [Optimistic updates](modules/28-state-management.md#10-optimistic-updates-normalization-and-undo)

### 29 · Testing Angular

- The pyramid and the trophy both keep end-to-end tests few, and 100% coverage proves nothing about asserted behavior. [Test levels](modules/29-testing-angular.md#1-what-to-test-where-unit-integration-component-and-end-to-end-tests-the-pyramid-and-the-trophy)
- A type or template error fails the build before any test, and `vi.mock` of a relative path throws, so doubles go through providers. [Runner](modules/29-testing-angular.md#2-the-runner-vitest-through-angularbuildunit-test-jsdom-and-browser-mode)
- `TestBed` rebuilds its recipe for every test, and the first `inject` or `createComponent` locks it. [`TestBed`](modules/29-testing-angular.md#4-testbed-the-testing-module-inject-runininjectioncontext-overrides-and-teardown)
- A zoneless fixture renders nothing between a write and a tick, so await `whenStable()` or call `TestBed.tick()` [Stable since v20.0]. [Zoneless fixtures](modules/29-testing-angular.md#5-zoneless-fixtures-whenstable-testbedtick-detectchanges-and-automatic-change-detection)
- `triggerEventHandler` is not a click, and inputs go through `setInput` or `bindings`. [Component tests](modules/29-testing-angular.md#6-component-tests-dom-queries-componentfixture-signal-inputs-with-setinput-and-bindings-outputs-and-onpush)
- `vi.fn` is a stub and a spy, not a mock, and spies are restored by hand. [Test doubles](modules/29-testing-angular.md#7-test-doubles-fakes-stubs-spies-and-mocks-vifn-provider-overrides-and-over-mocking)
- `TestBed.createDirective` [Added in v22.2] needs a `tagName` for an attribute selector. [Services, pipes, directives](modules/29-testing-angular.md#8-testing-services-pipes-and-directives-including-testbedcreatedirective)
- `fakeAsync` needs zone.js, and a frozen fake clock leaves `whenStable` pending because Angular's scheduler uses timers too. [Async tests](modules/29-testing-angular.md#10-async-tests-vitest-fake-timers-versus-fakeasync-and-waitforasync)

### 30 · End-to-end tests and testing strategy

- A browser test earns its cost only for what no lower level sees: the production build, deep-link fallback, routing and layout. [What belongs](modules/30-e2e-and-testing-strategy.md#1-what-belongs-at-the-end-to-end-level-journeys-cost-and-a-strategy-across-levels)
- Playwright runs the test in Node, Cypress inside the browser; the Protractor builder is [Removed in v19.0]. [Architecture](modules/30-e2e-and-testing-strategy.md#2-playwright-and-cypress-architecture-ng-e2e-and-the-end-of-protractor)
- Actions and web-first assertions retry; a value read once is a snapshot and `waitForTimeout` is a guess. [Auto-waiting](modules/30-e2e-and-testing-strategy.md#3-auto-waiting-actionability-checks-web-first-assertions-and-cypress-retry-ability)
- A locator is resolved on every use and is strict; `first()` only silences the error. [Locators](modules/30-e2e-and-testing-strategy.md#4-locators-page-objects-and-fixtures)
- A mock echoes what the frontend expects, so only a contract test notices a changed backend. [API mocking](modules/30-e2e-and-testing-strategy.md#5-api-mocking-at-the-network-layer-and-where-contract-tests-take-over)
- An axe pass covers only the rules run; a screenshot baseline is tied to one project and platform. [Visual and a11y](modules/30-e2e-and-testing-strategy.md#6-visual-regression-and-accessibility-checks-in-end-to-end-tests)
- A flaky test has an uncontrolled input; the fix removes it, never a longer timeout. [Flaky tests](modules/30-e2e-and-testing-strategy.md#7-flaky-tests-root-causes-diagnosis-and-fixes)
- A pass on retry is `flaky`; the run still exits 0 unless `--fail-on-flaky-tests` is set. [CI](modules/30-e2e-and-testing-strategy.md#8-ci-strategy-for-end-to-end-tests-workers-sharding-retries-policy-and-test-data)

### 31 · Performance

- Change one thing, then re-measure with the same tool; field data says how bad, lab data why, and a lab load has no INP. [Measure first](modules/31-performance.md#1-measure-first-the-loop-lab-versus-field-and-what-each-tool-answers)
- OnPush is v22's default [Changed in v22.0: "Component with undefined `changeDetection` property are now `OnPush` by default"], so the levers left are signals and `computed`, not template methods. [Runtime cost](modules/31-performance.md#3-runtime-cost-of-a-change-onpush-zoneless-signals-and-per-check-template-work)
- `track` makes updates cheap; virtual scrolling shrinks the DOM but costs find-in-page and variable heights. [Long lists](modules/31-performance.md#4-long-lists-track-virtual-scrolling-with-the-cdk-and-the-alternatives)
- Routes split areas, `@defer` splits parts of a view, one static import can undo a split. [Loading](modules/31-performance.md#5-loading-the-initial-bundle-lazy-routes-defer-and-preloading-as-one-plan)
- When a budget fails, read the importer chain before raising it; barrels defeat tree-shaking. [Bundle analysis](modules/31-performance.md#6-bundle-analysis-budgets-and-tree-shaking-pitfalls)
- `NgOptimizedImage` writes attributes and the loader's service resizes; use `priority` only on the LCP image. [Images](modules/31-performance.md#7-images-ngoptimizedimage-with-priority-fill-loaders-and-placeholders)
- A leak is growth across repetitions of one action, found with two heap snapshots. [Memory leaks](modules/31-performance.md#8-memory-leaks-heap-snapshots-detached-nodes-and-the-devtools-workflow)
- A Web Worker frees the main thread, not faster work. [Workers](modules/31-performance.md#9-off-the-main-thread-web-workers-in-angular-and-runoutsideangular-in-zone-apps)

### 32 · SSR, SSG and hydration

- CSR sends an empty root, SSR renders each request, SSG at build time; the HTML serves crawlers but is not interactive sooner. [Why render on the server](modules/32-ssr-ssg-hydration.md#1-why-render-on-the-server-csr-ssr-ssg-and-hybrid-rendering-and-what-each-costs)
- `RenderMode` [Stable since v20.0] is set per route; a value missing from `getPrerenderParams` is server-rendered unless the fallback is `None`. [Server routes](modules/32-ssr-ssg-hydration.md#3-server-routes-and-rendermode-per-route-rendering-getprerenderparams-fallbacks-headers-and-status)
- A prerendered page has no request, so it cannot read a cookie. [Server routes](modules/32-ssr-ssg-hydration.md#3-server-routes-and-rendermode-per-route-rendering-getprerenderparams-fallbacks-headers-and-status)
- Hydration claims the server's DOM; `ngSkipHydration` only hides a mismatch by re-rendering that component. [Hydration](modules/32-ssr-ssg-hydration.md#4-hydration-reusing-the-servers-dom-mismatches-and-ngskiphydration)
- Event replay runs a click made before the code arrives once [Changed in v22.0: on by default through `provideClientHydration()`]. [Event replay](modules/32-ssr-ssg-hydration.md#5-event-replay-keeping-the-clicks-made-before-the-code-arrives)
- A `@defer` block with a `hydrate` trigger stays dehydrated until it fires; `hydrate never` still renders on the server. [Incremental hydration](modules/32-ssr-ssg-hydration.md#6-incremental-hydration-defer-blocks-with-hydrate-triggers)
- Browser-only code belongs in `afterNextRender` or behind `PLATFORM_ID`, not a `typeof window` guard. [Platform-safe code](modules/32-ssr-ssg-hydration.md#7-platform-safe-code-browser-apis-afternextrender-document-request-and-response_init)
- `TransferState` carries server data as JSON anyone can read, so no secrets. [Transfer cache](modules/32-ssr-ssg-hydration.md#8-data-across-the-boundary-the-http-transfer-cache-transferstate-and-resource-ids)

### 33 · Security

- Templates escape what you bind; a direct `nativeElement` write sits outside that model. [XSS](modules/33-security.md#2-xss-and-angulars-template-model-escaping-by-default-trusted-templates-and-the-paths-around-them)
- The shipped sanitizer refuses only `javascript:` URLs [Changed in v15.2.6: only `javascript:` URLs are blocked] and lets style values through. [Sanitization](modules/33-security.md#3-sanitization-by-security-context-html-style-url-and-resource-url)
- A `bypassSecurityTrust*` call switches the check off for that value, so parse, allowlist, then bypass in one audited service, never a `safeHtml` pipe. [`DomSanitizer`](modules/33-security.md#4-domsanitizer-and-bypasssecuritytrust-when-trusting-a-value-is-dangerous-and-the-safe-patterns)
- A nonce must be new in every response, and `autoCsp` hashes scripts only and cannot be built with server rendering. [CSP](modules/33-security.md#5-content-security-policy-with-angular-nonces-csp_nonce-and-autocsp)
- For Trusted Types, add `angular#unsafe-bypass` only after reviewing every bypass, and roll out in report-only mode first. [Trusted Types](modules/33-security.md#6-trusted-types-with-angular-the-frameworks-policies-enforcement-and-rollout)
- Every token option lets injected script act as the user, so prefer a backend-for-frontend. [Token storage](modules/33-security.md#8-where-the-token-lives-memory-web-storage-httponly-cookies-and-a-backend-for-frontend)
- A cookie session needs a server-checked CSRF token, because `SameSite` is one layer. [CSRF](modules/33-security.md#9-csrf-in-single-page-apps-when-cookies-make-you-vulnerable-samesite-and-angulars-xsrf-support)
- A `canMatch` guard leaves the chunk and the API open, so the server authorizes every request. [Route guards](modules/33-security.md#10-route-guards-are-ux-authorization-belongs-on-the-server)

### 34 · Internationalization

- A locale is a language tag selecting formats, plural rules, sort order and direction, but not the currency. [Locales](modules/34-i18n.md#1-i18n-l10n-and-the-locale-language-tags-what-a-locale-decides-and-locale_id)
- Angular's pipes read CLDR tables in `@angular/common`, not `Intl`, so output can differ. [Locale data](modules/34-i18n.md#3-angulars-locale-data-and-formatting-functions-versus-intl)
- The `getLocale*` getters are [Deprecated since v18.0 — use `Intl`]; `registerLocaleData` downloads nothing. [Locale data](modules/34-i18n.md#3-angulars-locale-data-and-formatting-functions-versus-intl)
- Translate sentences, not fragments; the computed ID uses text and meaning, not the description. [Marking text](modules/34-i18n.md#4-marking-text-for-translation-i18n-attributes-metadata-ids-and-localize-in-code)
- In ICU, `=1` tests the value while `one` is a category (French gives it to 0, Russian to 21). [ICU expressions](modules/34-i18n.md#5-icu-expressions-plural-select-and-nesting)
- Computed IDs move with any text edit; a missing translation is a warning unless the build sets `error`. [Extraction](modules/34-i18n.md#6-extraction-and-translation-files-ng-extract-i18n-formats-and-message-ids)
- A `localize` build writes one folder per locale with its `lang`, `dir` and base `href`; `ng serve` shows one locale. [Compile-time localization](modules/34-i18n.md#7-compile-time-localization-one-build-per-locale-subpath-lang-and-dir)
- Dates keep their zone and a locale implies no currency, so pass both with the data. [Dates and money](modules/34-i18n.md#10-dates-times-numbers-and-money-time-zones-currency-codes-and-minor-units)

### 35 · Animations

- A transition needs a changed computed value, so an inserted element needs `@starting-style` and `display` needs `allow-discrete`. [Transitions](modules/35-animations.md#2-css-transitions-triggers-interruption-events-and-entry-with-starting-style)
- Emulated encapsulation renames a component's `@keyframes`, so a global class cannot use them. [Keyframes](modules/35-animations.md#3-css-keyframe-animations-keyframes-fill-modes-iteration-and-component-scoped-names)
- `animate.enter` [Stable since v20.2] and `animate.leave` are compiler syntax that add classes; `@angular/animations` is [Deprecated since v20.2 — use `animate.enter` and `animate.leave`]. [`animate.enter` and `animate.leave`](modules/35-animations.md#5-animateenter-and-animateleave-with-css-classes-syntax-bindings-and-when-the-element-leaves)
- A leaving element goes next frame if nothing animates or the animation loops. [`animate.leave`](modules/35-animations.md#5-animateenter-and-animateleave-with-css-classes-syntax-bindings-and-when-the-element-leaves)
- The function form must call `animationComplete()` or the element goes at `MAX_ANIMATION_TIMEOUT`; v22 runs same-template leaves [Changed in v22.0: leave animations of descendants in the same component template run before removal]. [Leave semantics](modules/35-animations.md#6-function-callbacks-and-the-v22-leave-semantics-animationcallbackevent-animationcomplete-and-nested-leaves)
- With a stable `track` a reorder is a move, running no leave. [Lists](modules/35-animations.md#7-animating-lists-for-enter-leave-reorder-and-stagger)
- `animateChild` across components has no native counterpart, so keep the provider until the last `[@…]` goes. [Migration](modules/35-animations.md#9-migrating-from-angularanimations-to-native-css-and-animateenteranimateleave)
- `transform` and `opacity` add no layouts, `width` does; the router has no reduced-motion logic. [Performance](modules/35-animations.md#11-performance-and-reduced-motion-compositor-properties-measuring-jank-and-prefers-reduced-motion)

### 36 · Material and the CDK

- Material, the CDK and Angular Aria [Stable since v22.0] are three layers; Material's CDK peer is exact, and Material alone does not make an app accessible. [Layers](modules/36-material-and-cdk.md#1-material-the-cdk-and-angular-aria-styled-components-behavior-primitives-and-headless-patterns)
- `mat-error` waits for the matcher's condition, not for the control to be invalid. [Components](modules/36-material-and-cdk.md#2-material-components-in-a-v22-app-standalone-imports-form-fields-dialogs-direction-and-motion)
- `mat.theme` runs in Sass at build time and writes `--mat-sys-*` custom properties as `light-dark()` pairs. [Theming](modules/36-material-and-cdk.md#3-theming-with-material-3-mattheme-system-variables-and-light-and-dark-with-color-scheme)
- An override reaches a DOM subtree, not a component tree, so it misses the dialog a component opens. [Customizing](modules/36-material-and-cdk.md#4-customizing-the-theme-system-and-component-token-overrides-and-theming-your-own-components)
- An overlay host is a popover in the top layer [Changed in v21.0: overlays render as native popovers by default], so a high `z-index` is not the fix. [Overlays](modules/36-material-and-cdk.md#5-portals-and-overlays-where-floating-ui-renders-how-it-is-positioned-and-how-it-closes)
- A raw `OverlayRef` closes on Escape only if you subscribe. [Overlays](modules/36-material-and-cdk.md#5-portals-and-overlays-where-floating-ui-renders-how-it-is-positioned-and-how-it-closes)
- Drag and drop only reports the drop, your handler reorders, and it has no keyboard handling. [Drag and drop](modules/36-material-and-cdk.md#6-drag-and-drop-sorting-transferring-between-lists-and-the-keyboard-gap)
- `cdkTrapFocus` only redirects Tab, and only `FocusKeyManager` calls `focus()`. [CDK accessibility](modules/36-material-and-cdk.md#9-cdk-accessibility-focustrap-focusmonitor-liveannouncer-and-the-key-managers)

### 37 · Elements, PWA, error handling and the ecosystem

- Angular Elements wraps one component per `createCustomElement` call and ships the Angular runtime, so the tag is not the component's selector. [Elements](modules/37-elements-pwa-errors-ecosystem.md#1-angular-elements-turning-a-component-into-a-custom-element)
- Attributes reach inputs as strings, and an output becomes a `CustomEvent` that does not bubble unless you build it so. [Elements contract](modules/37-elements-pwa-errors-ecosystem.md#2-the-elements-public-contract-attributes-properties-events-projected-content-and-typings)
- The service worker reads the generated `ngsw.json`, not `ngsw-config.json`, and is off in `ng serve`. [Service worker](modules/37-elements-pwa-errors-ecosystem.md#4-angularservice-worker-registration-ngsw-configjson-and-the-generated-ngswjson)
- Only asset groups follow the app version, and a request outside every group fails offline. [Caching](modules/37-elements-pwa-errors-ecosystem.md#5-caching-with-asset-and-data-groups-navigation-requests-and-the-app-shell)
- An open tab stays on its version until it navigates, and `activateUpdate()` is not the reload. [Updates](modules/37-elements-pwa-errors-ecosystem.md#6-updates-versions-swupdate-prompting-a-reload-unrecoverable-states-and-the-kill-switch)
- A manifest gives installability, not offline. [Push and installability](modules/37-elements-pwa-errors-ecosystem.md#7-push-notifications-and-installability-swpush-notification-clicks-and-the-manifest)
- `ErrorHandler` only logs by default and must not throw. [`ErrorHandler`](modules/37-elements-pwa-errors-ecosystem.md#8-errorhandler-and-global-listeners-what-reaches-the-handler-and-what-does-not)
- `@boundary` [Developer preview since v22.2] catches creation and change-detection errors, not listener errors, and still reports them. [Error boundaries](modules/37-elements-pwa-errors-ecosystem.md#9-error-boundaries-boundary-error-reset-onviewerror-and-onerror)

### 38 · Architecture and production structure

- A feature never imports another feature; `core/` is app-wide setup and `shared/` has no feature knowledge. [Folders](modules/38-architecture-and-production-structure.md#1-folder-structures-that-scale-by-feature-domain-slices-and-core-shared-and-feature-boundaries)
- A container knows the data source and a presentational component only takes inputs and emits outputs; components without `changeDetection` are OnPush [Changed in v22.0: components without `changeDetection` are OnPush]. [Containers](modules/38-architecture-and-production-structure.md#2-smart-container-and-presentational-components)
- A facade is an intent-shaped, read-only API and a swap point, not a store wrapper. [Facades](modules/38-architecture-and-production-structure.md#3-facades-and-the-data-access-layer)
- An app consumes a CLI library's build output through `paths`, not its source. [Libraries](modules/38-architecture-and-production-structure.md#5-angular-cli-libraries-ng-generate-library-ng-packagr-and-consuming-the-build)
- `export *` and deep imports are the traps of a public API. [Public API](modules/38-architecture-and-production-structure.md#6-public-api-surfaces-public-apits-exports-secondary-entry-points-and-versioning)
- Nx runs only affected projects (changed ones plus their dependents) and replays cached results by task hash. [Nx](modules/38-architecture-and-production-structure.md#7-nx-monorepos-the-project-graph-tags-nxenforce-module-boundaries-affected-commands-and-caching)
- Micro-frontends split deployment, not a tangled graph, and cost versions, shared state and operations. [Micro-frontends](modules/38-architecture-and-production-structure.md#8-micro-frontends-module-federation-native-federation-and-when-they-are-justified)
- Nx hashes the declared inputs and the command, so an undeclared input yields a stale cache hit. [Under the hood](modules/38-architecture-and-production-structure.md#13-under-the-hood-ng-packagrs-build-graph-and-how-nx-computes-affected-projects-and-task-hashes)

### 39 · Version history and migrations

- AngularJS re-checks every watcher in a digest until a pass changes nothing, at most 10 loops. [Digest cycle](modules/39-version-history-and-migrations.md#1-angularjs-scopes-watchers-and-the-digest-cycle)
- A major gets 12 months active and 12 in LTS, but v20 and v21 got 18 and 19, so plan from the table; a deprecated API lasts at least the next major. [Release policy](modules/39-version-history-and-migrations.md#3-how-angular-ships-semantic-versioning-the-release-cadence-support-windows-and-the-deprecation-policy)
- v9 to v15 swaps View Engine for Ivy and adds standalone [Stable since v15.0]. [v9 to v15](modules/39-version-history-and-migrations.md#5-the-version-matrix-part-2-v9-to-v15-from-ivy-to-standalone)
- v22 makes OnPush the default without a strategy. [v16 to v22](modules/39-version-history-and-migrations.md#6-the-version-matrix-part-3-v16-to-v22-from-signals-to-onpush-by-default)
- `ng update` runs required migrations unasked, offers optional ones; `--force` ignores a peer mismatch, not fixing it. [`ng update`](modules/39-version-history-and-migrations.md#7-updating-in-practice-ng-update-migration-schematics-and-the-update-guide)
- A hop is one major with its own Node and TypeScript range; a blocking library stops it. [One major per hop](modules/39-version-history-and-migrations.md#8-skipping-versions-safely-one-major-per-hop-node-and-typescript-ranges-and-libraries-that-block-a-hop)
- An AngularJS app moves by hybrid, strangler fig or rewrite. [From AngularJS](modules/39-version-history-and-migrations.md#9-from-angularjs-to-angular-ngupgrade-hybrids-the-strangler-fig-and-rewrites)
- The v22 migrations write the old behavior back, so the diff is choices, not noise. [The v22 upgrade](modules/39-version-history-and-migrations.md#11-the-v22-upgrade-what-ng-update-changes-and-why-each-migration-keeps-the-old-behavior)

### 40 · Framework comparisons

- Library, framework and progressive framework differ in who owns entry point and update loop. [Library or framework](modules/40-framework-comparisons.md#1-library-framework-progressive-framework-what-each-project-decides-for-you)
- Angular and Vue template compilers can mark static parts before runtime; JSX hands the runtime objects it can only compare. [Templates and JSX](modules/40-framework-comparisons.md#2-templates-jsx-and-single-file-components-what-the-compiler-knows)
- In React a state change re-runs component functions; the React Compiler reuses values without making them signals. [React's model](modules/40-framework-comparisons.md#3-reacts-model-re-rendering-reconciliation-memoization-and-the-react-compiler)
- Vue re-renders a component, Angular refreshes a view, Solid re-runs one expression. [Signals beyond Angular](modules/40-framework-comparisons.md#4-signals-beyond-angular-vue-refs-solid-svelte-runes-preact-and-qwik)
- A Vue `ref` makes an object deep; an Angular signal notifies on a new reference. [Signals beyond Angular](modules/40-framework-comparisons.md#4-signals-beyond-angular-vue-refs-solid-svelte-runes-preact-and-qwik)
- Angular's injector builds from providers; React context and Vue's `provide`/`inject` return what someone stored. [DI and shared state](modules/40-framework-comparisons.md#5-dependency-injection-and-shared-state-injectors-context-and-provideinject)
- Angular ships routing, forms, tooling and testing as one release group; React and Vue use packages on their own calendars. [First-party or ecosystem](modules/40-framework-comparisons.md#6-routing-forms-data-fetching-tooling-and-testing-first-party-or-ecosystem)
- Choosing needs gates, weighted criteria and a sensitivity check, never "the most popular is safe". [Choosing](modules/40-framework-comparisons.md#8-choosing-a-framework-balanced-trade-offs-and-how-to-answer-why-angular)

## Part E · Full stack with Spring Boot

### 41 · Full-stack API contracts

- The server declares CORS and the browser enforces it; Security must answer the cookie-less preflight, and the dev proxy only hides the mistake. [CORS](modules/41-fullstack-api-contracts.md#1-cors-on-both-sides-springs-corsconfigurationsource-spring-security-preflight-caching-credentials-and-the-dev-proxy)
- A missing JSON member differs from `null`, and a generated client checks nothing at runtime. [DTO contracts](modules/41-fullstack-api-contracts.md#2-dto-contracts-what-crosses-the-wire-absent-versus-null-and-checking-responses-at-the-boundary)
- Compatible changes add; removals, renames and new enum values break. [Evolving the contract](modules/41-fullstack-api-contracts.md#4-evolving-the-contract-compatible-changes-api-versioning-in-spring-framework-7-and-deprecation-headers)
- A problem detail is the shared error body, and `responseType` decides how Angular parses it. [Error contracts](modules/41-fullstack-api-contracts.md#5-error-contracts-with-problemdetail-rfc-9457-and-mapping-them-in-angular)
- Offset pages jump and shift, while cursors stay stable. [Pagination](modules/41-fullstack-api-contracts.md#6-pagination-sorting-and-filtering-offset-versus-cursor-and-how-spring-data-serializes-a-page)
- Mirror syntactic rules on both layers and route error pointers to form controls, because the server must still check every request. [Validation](modules/41-fullstack-api-contracts.md#7-validation-on-both-layers-bean-validation-angular-validators-and-server-errors-on-form-fields)
- Decimals and instants travel as strings, with a currency code. [Dates and money](modules/41-fullstack-api-contracts.md#9-dates-time-zones-decimals-and-money-across-the-wire)
- Filter rejections precede MVC, so controller advice does not handle every error. [Under the hood](modules/41-fullstack-api-contracts.md#10-under-the-hood-one-failed-request-through-springs-filters-and-handlers-and-angulars-backend)

### 42 · Full-stack authentication

- A session keeps the login on the server and a JWT carries it, so logout and revocation cost a record or a short lifetime. [Sessions versus tokens](modules/42-fullstack-authentication.md#1-sessions-versus-tokens-what-the-server-keeps-what-each-request-carries-revocation-and-scaling)
- The code flow with PKCE replaced the implicit flow, and `state` and `nonce` still guard the redirect. [OAuth and OIDC](modules/42-fullstack-authentication.md#2-oauth-20-and-openid-connect-for-a-single-page-app-authorization-code-with-pkce-and-why-the-implicit-flow-is-gone)
- A backend-for-frontend keeps tokens off the page, and its cookie still needs CSRF defense. [Where the client runs](modules/42-fullstack-authentication.md#3-where-the-oauth-client-runs-a-browser-only-client-a-token-mediating-backend-or-a-backend-for-frontend-with-spring)
- Rotation catches a replayed token only if the server kept the family, which Spring does not by default. [Refresh tokens](modules/42-fullstack-authentication.md#4-refresh-tokens-rotation-reuse-detection-silent-renew-and-refreshing-across-tabs)
- The resource server validates the JWT, and `aud` is checked only when configured. [Resource server](modules/42-fullstack-authentication.md#5-spring-security-as-a-resource-server-validating-jwts-and-turning-scopes-into-authorities)
- `csrf.spa()` accepts the raw cookie value in the header, and logout clears it. [CSRF](modules/42-fullstack-authentication.md#6-csrf-with-cookiecsrftokenrepository-and-angulars-xsrf-support-csrfspa-in-spring-security-7)
- Guards and interceptors are UX; the API decides. [Angular side](modules/42-fullstack-authentication.md#7-the-angular-side-an-auth-state-at-startup-guards-as-ux-interceptors-and-angular-oauth2-oidc-versus-angular-auth-oidc-client)
- Deleting a token is not logging out. [Logout](modules/42-fullstack-authentication.md#8-logout-everywhere-and-session-timeout-ux)

### 43 · Full-stack real time

- Polling pays a request per answer, long polling a re-request, SSE one open response, a WebSocket both directions; most one-way feeds end at SSE. [Choosing a transport](modules/43-fullstack-realtime.md#1-choosing-a-transport-polling-long-polling-server-sent-events-websockets-and-web-push-when-no-tab-is-open)
- An event stream dispatches at a blank line; `EventSource` resumes with `Last-Event-ID` unless the response is not a 200 event stream. [SSE on the wire](modules/43-fullstack-realtime.md#2-server-sent-events-on-the-wire-the-textevent-stream-format-and-how-eventsource-reconnects)
- An `SseEmitter` learns a client left only when a write fails. [SSE in Spring](modules/43-fullstack-realtime.md#3-server-sent-events-in-spring-sseemitter-in-spring-mvc-and-a-flux-of-serversentevent-in-webflux)
- The Angular client wraps `EventSource` or a `fetch` stream in an Observable; only `fetch` sends headers. [SSE client](modules/43-fullstack-realtime.md#4-the-angular-sse-client-eventsource-or-a-fetch-stream-as-an-observable-and-when-httpclient-fits)
- The simple STOMP broker is one instance and sends no heart-beats without a `TaskScheduler`. [STOMP](modules/43-fullstack-realtime.md#5-websockets-and-stomp-in-spring-the-handshake-frames-messagemapping-brokers-user-destinations-and-heart-beats)
- `webSocket` reconnects nothing: `retry` and `repeat` after a backoff, then resubscribe. [WebSocket client](modules/43-fullstack-realtime.md#6-the-angular-websocket-client-rxjs-websocket-stomprx-stomp-and-reconnecting-without-losing-subscriptions)
- The handshake carries no header, `CONNECT` needs the masked CSRF token, the server checks `Origin`. [Handshake auth](modules/43-fullstack-realtime.md#7-authentication-on-the-handshake-cookies-tokens-in-the-connect-frame-origin-checks-and-csrf-in-spring-security)
- Sticky sessions do not scale sockets: a relay joins instances, a slow client is buffered, then closed. [Scaling out](modules/43-fullstack-realtime.md#9-scaling-out-and-under-the-hood-sticky-sessions-the-broker-relay-backpressure-and-one-message-traced-across-two-instances)

### 44 · Full-stack delivery and operations

- A same-origin proxy removes CORS; a gateway treats every client alike and a BFF serves one. [Where API calls go](modules/44-fullstack-delivery-and-operations.md#1-where-the-api-calls-go-direct-calls-a-same-origin-reverse-proxy-an-api-gateway-or-a-backend-for-frontend)
- A multi-stage build keeps the lockfile layer before the sources and copies only `browser/`, with no API URL baked in. [Docker](modules/44-fullstack-delivery-and-operations.md#2-a-docker-multi-stage-build-for-angular-build-and-runtime-stages-layer-caching-dockerignore-and-a-non-root-image)
- A location's `add_header` replaces the parent's, and a deleted hashed chunk must be a 404. [Nginx for a SPA](modules/44-fullstack-delivery-and-operations.md#3-nginx-for-a-single-page-app-location-matching-the-try_files-fallback-caching-headers-for-hashed-assets-and-gzip-or-brotli)
- A `proxy_pass` with a URI replaces the matched prefix, and Spring reads forwarded headers only when told to. [Reverse proxy](modules/44-fullstack-delivery-and-operations.md#4-nginx-as-the-reverse-proxy-proxy_pass-forwarded-headers-into-spring-boot-and-sse-or-websocket-connections-through-the-proxy)
- An entrypoint script renders `config.json` at start, so one image serves every environment. [Runtime configuration](modules/44-fullstack-delivery-and-operations.md#5-runtime-configuration-without-rebuilding-configjson-environment-substitution-at-container-start-and-provideappinitializer)
- Node as PID 1 needs an exec-form command and its own SIGTERM handler, and readiness fails first. [SSR in containers](modules/44-fullstack-delivery-and-operations.md#6-serving-ssr-apps-in-containers-the-node-server-as-pid-1-graceful-shutdown-health-probes-and-what-nginx-or-a-cdn-still-serves)
- Build once and promote the digest; expand and contract keeps old tabs working. [CI/CD](modules/44-fullstack-delivery-and-operations.md#7-cicd-for-both-layers-one-image-promoted-through-stages-a-monorepo-or-separate-repositories-and-versioning-the-contract)
- A flag is a sticky bucket and a canary a routed release, so a tab must not mix versions. [Flags and canaries](modules/44-fullstack-delivery-and-operations.md#8-feature-flags-with-openfeature-and-canary-releases-providers-evaluation-context-sticky-rollout-kill-switches-and-version-skew)

## Part F · System design

### 45 · Front-end system design method

- The round rewards requirements first, named trade-offs and your own failure modes, not a framework choice. [What it evaluates](modules/45-frontend-system-design-method.md#1-the-front-end-system-design-interview-what-it-evaluates-its-formats-and-how-it-differs-from-a-backend-design-round)
- State trade-offs completely, draw three zoom levels, and protect requirements and failure modes in the time plan. [Communicating](modules/45-frontend-system-design-method.md#2-communicating-under-time-pressure-a-time-plan-complete-trade-off-statements-and-diagrams-at-three-zoom-levels)
- Write requirements as numbers: vitals at field p75, budgets on a named lab profile. [Requirements](modules/45-frontend-system-design-method.md#3-requirements-first-functional-and-non-functional-requirements-constraints-and-back-of-envelope-numbers)
- The component tree is who renders whom, not the folder tree. [Component architecture](modules/45-frontend-system-design-method.md#4-component-architecture-data-model-and-data-flow-from-screens-to-a-component-tree-and-a-client-side-model)
- A time target becomes a byte budget after fixed costs, and every drag needs a single-pointer path. [Performance and accessibility](modules/45-frontend-system-design-method.md#6-performance-and-accessibility-as-design-steps-budgets-a-loading-plan-long-lists-and-keyboard-and-pointer-paths)
- Rendering is chosen per route, and the nearest fresh cache layer answers, so a reload can show old data. [Rendering and caching](modules/45-frontend-system-design-method.md#7-rendering-strategy-and-caching-layers-a-rendering-choice-per-route-and-every-cache-from-the-cdn-to-the-component)
- A stale `If-Match` is never performed, `BroadcastChannel` skips the sender, and Background Sync has limited availability. [Failure modes](modules/45-frontend-system-design-method.md#8-under-the-hood-failure-modes-observability-offline-levels-and-consistency-choices)

### 46 · System design case studies

- Every case carries six parts, and the answer is decided where the case is hard. [The parts of a case](modules/46-system-design-case-studies.md#1-from-method-to-case-the-parts-every-case-study-carries-and-where-each-cases-difficulty-lies)
- Typeahead: normalize, answer longer queries only from a complete result, and show only the latest answer. [Typeahead](modules/46-system-design-case-studies.md#2-autocomplete-and-typeahead-search-a-request-policy-a-prefix-cache-ranking-on-the-server-and-an-accessible-combobox)
- Feed: cursor pages merged by id, with live posts held behind a pill. [Feed](modules/46-system-design-case-studies.md#3-an-infinite-scroll-feed-cursor-pages-deduplication-new-items-without-a-jump-and-a-bounded-window)
- Grid: one canonical query, a cursor cleared on change, and an id that ends every sort. [Grid](modules/46-system-design-case-studies.md#4-a-large-data-grid-server-side-filtering-sorting-and-pagination-the-query-in-the-url-and-keyset-cursors)
- Wizard: visibility computed from the answers, and a draft migrated before it is restored. [Wizard](modules/46-system-design-case-studies.md#5-a-multi-step-form-wizard-with-draft-saving-a-step-model-per-step-validation-and-drafts-that-survive-and-migrate)
- Dashboard: one render per window and a stale mark per widget. [Dashboard](modules/46-system-design-case-studies.md#6-a-real-time-operations-dashboard-aggregation-per-widget-staleness-hidden-tabs-and-screens-left-open-for-days)
- Notifications: ids, not counters, and presence that expires. [Notifications](modules/46-system-design-case-studies.md#7-a-notifications-center-and-an-editing-indicator-delivery-unread-counts-across-tabs-and-presence-with-a-time-to-live)
- Money: one key per intent, pending until the server answers, and a lost response is unknown, not failed. [Money transfer](modules/46-system-design-case-studies.md#8-under-the-hood-a-money-transfer-with-idempotency-keys-optimistic-ui-that-never-claims-success-and-the-unknown-outcome)

## Part G · Interview practice

### 47 · Behavioral interviews and interview craft

- A behavioral question asks for a past action as evidence; the action is the substance and the story ends on an explicit result. [The behavioral round](modules/47-behavioral-and-interview-craft.md#1-the-behavioral-round-what-a-story-is-evidence-of-star-with-the-weight-on-action-and-an-explicit-result-and-a-story-bank)
- A performance story names field or lab and a baseline; an incident puts mitigation before root cause. [Four stories](modules/47-behavioral-and-interview-craft.md#2-four-front-end-stories-a-performance-win-a-migration-a-production-incident-and-a-disagreement-over-architecture)
- Legacy code is told through its time's constraints, after characterization tests pin what it does now. [Legacy without blame](modules/47-behavioral-and-interview-craft.md#3-legacy-codebases-and-migrations-without-blame-the-constraints-of-the-time-how-you-learned-the-code-before-changing-it-and-words-that-explain-instead-of-accuse)
- Live coding is clarify, say the plan, build in running increments, narrate, try the edges; the trap is silence. [Live coding](modules/47-behavioral-and-interview-craft.md#4-live-coding-an-angular-task-clarify-say-the-plan-build-in-working-increments-narrate-and-recover-when-stuck)
- A take-home reviewer sees only the repository and README, so a small tested core beats extra features. [Take-homes](modules/47-behavioral-and-interview-craft.md#5-take-home-assignments-scope-and-time-box-what-the-repository-must-show-the-readme-and-the-review-call)
- Ask your questions by area, with one follow-up on a vague answer, and skip the stack the ad lists. [Questions to ask](modules/47-behavioral-and-interview-craft.md#6-questions-to-ask-about-the-front-end-practice-versions-and-updates-testing-the-design-system-and-accessibility-performance-contracts-and-releases-and-how-to-read-the-answers)
- Every number needs a source, a baseline and a kind; the trap is a precise number you cannot source. [Drilling into a story](modules/47-behavioral-and-interview-craft.md#7-under-the-hood-how-one-story-is-drilled-into-numbers-you-can-defend-and-telling-a-design-or-a-migration-as-your-own-project)
