# Glossary terms (harvest for GLOSSARY.md)

Terms each module defines on first use, collected by the HOUSE harvest tasks. The finish line builds `GLOSSARY.md` from this list (RUN.md §13). Format: **term**: one-line definition, then a link to the section that defines it.

## Module 01

- **primitive**: an immutable value with no properties of its own (string, number, bigint, boolean, undefined, symbol, null); compared by value ([01 §1](../modules/01-js-values-types-coercion.md#1-values-and-types)).
- **object identity**: two object references are equal only when they point to the same object ([01 §1](../modules/01-js-values-types-coercion.md#1-values-and-types)).
- **wrapper object**: the temporary `String`, `Number`, `Boolean`, `Symbol` or `BigInt` object a primitive borrows its methods from; `new Boolean(false)` is a truthy object ([01 §1](../modules/01-js-values-types-coercion.md#1-values-and-types)).
- **IEEE-754 double**: the 64-bit binary floating-point format of every JavaScript `number`, which cannot represent most decimal fractions exactly ([01 §2](../modules/01-js-values-types-coercion.md#2-numbers)).
- **`Number.EPSILON`**: the gap between 1 and the next representable double; a relative tolerance for float comparison, not an absolute one ([01 §2](../modules/01-js-values-types-coercion.md#2-numbers)).
- **`NaN`**: the number value for an undefined numeric result; the only value not equal to itself ([01 §2](../modules/01-js-values-types-coercion.md#2-numbers)).
- **BigInt**: the arbitrary-precision integer type (`10n`); it does not mix with `number` in arithmetic ([01 §2](../modules/01-js-values-types-coercion.md#2-numbers)).
- **UTF-16 code unit**: the 16-bit unit a JavaScript string is made of; `length` and indexing count these ([01 §3](../modules/01-js-values-types-coercion.md#3-strings-and-unicode)).
- **surrogate pair**: two code units that together encode one code point above U+FFFF, such as most emoji ([01 §3](../modules/01-js-values-types-coercion.md#3-strings-and-unicode)).
- **lone surrogate**: half of a surrogate pair on its own, which makes a string ill-formed ([01 §3](../modules/01-js-values-types-coercion.md#3-strings-and-unicode)).
- **grapheme cluster**: what a reader sees as one character, possibly several code points; split with `Intl.Segmenter` ([01 §3](../modules/01-js-values-types-coercion.md#3-strings-and-unicode)).
- **symbol**: a unique primitive used as a property key that cannot collide with string keys ([01 §4](../modules/01-js-values-types-coercion.md#4-symbols)).
- **global symbol registry**: the process-wide table behind `Symbol.for(key)`, which returns the same symbol for the same key ([01 §4](../modules/01-js-values-types-coercion.md#4-symbols)).
- **well-known symbol**: a symbol the language itself looks up, such as `Symbol.iterator`, `Symbol.toPrimitive` or `Symbol.toStringTag` ([01 §4](../modules/01-js-values-types-coercion.md#4-symbols)).
- **coercion**: an implicit type conversion performed by an operator or a built-in ([01 §5](../modules/01-js-values-types-coercion.md#5-coercion)).
- **ToPrimitive**: the abstract operation that turns an object into a primitive, using a hint and `Symbol.toPrimitive`, `valueOf` and `toString` ([01 §5](../modules/01-js-values-types-coercion.md#5-coercion)).
- **truthy / falsy**: whether ToBoolean turns a value into `true` or `false`; the falsy values are `false`, `0`, `-0`, `0n`, `''`, `null`, `undefined` and `NaN` ([01 §5](../modules/01-js-values-types-coercion.md#5-coercion)).
- **IsLooselyEqual**: the algorithm behind `==`, which coerces operands of different types ([01 §6](../modules/01-js-values-types-coercion.md#6-equality)).
- **IsStrictlyEqual**: the algorithm behind `===`: no coercion, `NaN` unequal to itself, `+0` equal to `-0` ([01 §6](../modules/01-js-values-types-coercion.md#6-equality)).
- **SameValue**: the equality behind `Object.is`: `NaN` equals `NaN`, `+0` differs from `-0` ([01 §6](../modules/01-js-values-types-coercion.md#6-equality)).
- **SameValueZero**: the equality used by `Map`, `Set` and `includes`: like SameValue, but `+0` equals `-0` ([01 §6](../modules/01-js-values-types-coercion.md#6-equality)).
- **nullish**: `null` or `undefined`, the two values `??` and `?.` react to ([01 §7](../modules/01-js-values-types-coercion.md#7-null-undefined-and-the-nullish-operators)).
- **optional chaining (`?.`)**: property access or call that short-circuits the whole chain to `undefined` when its left side is nullish ([01 §7](../modules/01-js-values-types-coercion.md#7-null-undefined-and-the-nullish-operators)).
- **logical assignment**: `||=`, `&&=` and `??=`, which assign only when the corresponding operator would pick the right side ([01 §7](../modules/01-js-values-types-coercion.md#7-null-undefined-and-the-nullish-operators)).
- **realm**: a separate global environment with its own built-ins (an iframe, a worker, a `vm` context); objects from two realms fail `instanceof` against each other's constructors ([01 §1](../modules/01-js-values-types-coercion.md#1-values-and-types)).
- **sloppy mode**: non-strict code, the default for classic scripts; failed writes are silently ignored there ([01 §1](../modules/01-js-values-types-coercion.md#1-values-and-types)).

## Module 02

- **lexical (static) scope**: names resolve by where code is written, not by where it is called ([02 §1](../modules/02-js-scope-closures-this.md#1-lexical-scope-and-the-scope-chain)).
- **environment record**: the specification's storage for the bindings of one scope (a call, a block, a module) ([02 §1](../modules/02-js-scope-closures-this.md#1-lexical-scope-and-the-scope-chain)).
- **scope chain**: the links from an environment record to its outer environments, walked outward during lookup ([02 §1](../modules/02-js-scope-closures-this.md#1-lexical-scope-and-the-scope-chain)).
- **binding**: the association between a name and its storage slot in an environment record ([02 §1](../modules/02-js-scope-closures-this.md#1-lexical-scope-and-the-scope-chain)).
- **IIFE**: an immediately invoked function expression, the pre-ES2015 way to create a private scope ([02 §1](../modules/02-js-scope-closures-this.md#1-lexical-scope-and-the-scope-chain)).
- **hoisting**: declarations are set up when their scope is entered, before any of its code runs ([02 §2](../modules/02-js-scope-closures-this.md#2-hoisting-and-the-temporal-dead-zone)).
- **temporal dead zone (TDZ)**: the time between entering a scope and running a `let`, `const` or `class` declaration, during which any access throws `ReferenceError` ([02 §2](../modules/02-js-scope-closures-this.md#2-hoisting-and-the-temporal-dead-zone)).
- **closure**: a function together with the environment it was created in, which keeps that environment's variables reachable ([02 §3](../modules/02-js-scope-closures-this.md#3-closures)).
- **per-iteration binding**: the fresh copy of a `for (let …)` loop variable that each iteration gets ([02 §3](../modules/02-js-scope-closures-this.md#3-closures)).
- **call site**: the expression that calls a function; for ordinary functions it decides `this` ([02 §4](../modules/02-js-scope-closures-this.md#4-how-this-is-bound)).
- **bound function**: the exotic function `bind` returns, with a fixed `this` and preset leading arguments ([02 §4](../modules/02-js-scope-closures-this.md#4-how-this-is-bound)).
- **arrow function**: a function with no `this`, `arguments` or `new` of its own; it uses the enclosing scope's `this` ([02 §4](../modules/02-js-scope-closures-this.md#4-how-this-is-bound)).
- **strict mode**: the language mode that turns silent failures into errors and leaves `this` undefined in plain calls; always on in modules and class bodies ([02 §5](../modules/02-js-scope-closures-this.md#5-strict-mode)).
- **higher-order function**: a function that takes or returns a function ([02 §6](../modules/02-js-scope-closures-this.md#6-higher-order-functions-currying-partial-application-debounce-and-throttle)).
- **partial application**: presetting some arguments of a function once, getting a function of the rest ([02 §6](../modules/02-js-scope-closures-this.md#6-higher-order-functions-currying-partial-application-debounce-and-throttle)).
- **currying**: turning an n-argument function into a chain of one-argument calls ([02 §6](../modules/02-js-scope-closures-this.md#6-higher-order-functions-currying-partial-application-debounce-and-throttle)).
- **memoization**: caching a function's results by its arguments ([02 §6](../modules/02-js-scope-closures-this.md#6-higher-order-functions-currying-partial-application-debounce-and-throttle)).
- **debounce**: run only after calls stop for a given wait ([02 §6](../modules/02-js-scope-closures-this.md#6-higher-order-functions-currying-partial-application-debounce-and-throttle)).
- **throttle**: run at most once per interval while calls continue ([02 §6](../modules/02-js-scope-closures-this.md#6-higher-order-functions-currying-partial-application-debounce-and-throttle)).

## Module 03

- **property descriptor**: the record behind a property: a value or getter/setter plus the `writable`, `enumerable` and `configurable` flags ([03 §1](../modules/03-js-objects-prototypes-classes.md#1-properties-and-descriptors)).
- **data property / accessor property**: a property that stores a value, versus one that runs a getter and setter ([03 §1](../modules/03-js-objects-prototypes-classes.md#1-properties-and-descriptors)).
- **extensible**: whether new properties can be added to an object; `preventExtensions`, `seal` and `freeze` turn it off ([03 §1](../modules/03-js-objects-prototypes-classes.md#1-properties-and-descriptors)).
- **prototype**: the object another object delegates failed property lookups to ([03 §2](../modules/03-js-objects-prototypes-classes.md#2-the-prototype-chain)).
- **prototype chain**: the sequence of prototypes a property read walks until it finds the key or reaches `null` ([03 §2](../modules/03-js-objects-prototypes-classes.md#2-the-prototype-chain)).
- **shadowing**: an own property hiding a property of the same name further up the chain ([03 §2](../modules/03-js-objects-prototypes-classes.md#2-the-prototype-chain)).
- **prototype pollution**: writing to `Object.prototype` through a `__proto__` key in untrusted input, which affects every object ([03, Q03.07](../modules/03-js-objects-prototypes-classes.md#q03-07)).
- **private element**: a `#name` field or method, stored outside the property table and reachable only from inside the class body ([03 §3](../modules/03-js-objects-prototypes-classes.md#3-classes-the-sugar-and-what-is-not-sugar)).
- **ergonomic brand check**: `#field in obj`, which tests whether an object has a class's private element ([03 §3](../modules/03-js-objects-prototypes-classes.md#3-classes-the-sugar-and-what-is-not-sugar)).
- **home object**: the object a method is defined on, fixed at definition time, from which `super` lookups start ([03 §3](../modules/03-js-objects-prototypes-classes.md#3-classes-the-sugar-and-what-is-not-sugar)).
- **define semantics (class fields)**: class fields are created with `defineProperty`, so they do not call inherited setters ([03 §3](../modules/03-js-objects-prototypes-classes.md#3-classes-the-sugar-and-what-is-not-sugar)).
- **fragile base class**: the problem that changes to a base class silently break subclasses that depend on its internals ([03 §4](../modules/03-js-objects-prototypes-classes.md#4-inheritance-composition-and-mixins)).
- **composition**: building behavior by holding collaborators ("has a") instead of inheriting ("is a") ([03 §4](../modules/03-js-objects-prototypes-classes.md#4-inheritance-composition-and-mixins)).
- **mixin**: a function that takes a class and returns a subclass with added behavior ([03 §4](../modules/03-js-objects-prototypes-classes.md#4-inheritance-composition-and-mixins)).
- **Proxy**: an object that intercepts fundamental operations (get, set, has, delete…) on a target through handler traps ([03 §5](../modules/03-js-objects-prototypes-classes.md#5-proxy-and-reflect)).
- **trap**: a handler method of a Proxy that intercepts one internal method ([03 §5](../modules/03-js-objects-prototypes-classes.md#5-proxy-and-reflect)).
- **Reflect**: the namespace of functions that perform each fundamental operation's default behavior, used to forward from traps ([03 §5](../modules/03-js-objects-prototypes-classes.md#5-proxy-and-reflect)).
- **shallow copy / deep copy**: copying one level of properties and sharing nested objects, versus copying every level ([03 §6](../modules/03-js-objects-prototypes-classes.md#6-copying-shallow-deep-and-structured)).
- **structured clone**: the HTML algorithm behind `structuredClone` and `postMessage`, which copies cycles, `Date`, `Map` and `Set` but not functions, symbols or prototypes ([03 §6](../modules/03-js-objects-prototypes-classes.md#6-copying-shallow-deep-and-structured)).
- **change-by-copy array methods**: `toSorted`, `toReversed`, `toSpliced` and `with` (ES2023), which return a new array instead of mutating ([03 §7](../modules/03-js-objects-prototypes-classes.md#7-immutability-and-change-by-copy-array-methods)).
- **iterable / iterator**: an object with a `[Symbol.iterator]()` method, versus the object with `next()` that method returns ([03 §8](../modules/03-js-objects-prototypes-classes.md#8-iteration-protocols-and-generators)).
- **generator**: a function declared with `function*` that can pause at `yield` and returns an iterator over its yields ([03 §8](../modules/03-js-objects-prototypes-classes.md#8-iteration-protocols-and-generators)).
- **iterator helpers**: the lazy ES2025 methods on iterators (`map`, `filter`, `take`, `drop`, `flatMap`, `find`…) ([03 §8](../modules/03-js-objects-prototypes-classes.md#8-iteration-protocols-and-generators)).
- **shape (hidden class)**: the engine's internal record of which properties an object has, used to optimize property access; changing an object's prototype invalidates it ([03 §2](../modules/03-js-objects-prototypes-classes.md#2-the-prototype-chain)).
- **DTO (data transfer object)**: plain fields with no methods, sent across a boundary and turned back into an instance by a factory ([03 Q03.16](../modules/03-js-objects-prototypes-classes.md#q03-16)).

## Module 04

- **event loop**: the host's loop that runs one task, drains the microtask queue, and then may render ([04 §1](../modules/04-js-async-event-loop.md#1-the-event-loop-tasks-microtasks-and-rendering)).
- **host**: the environment embedding the JavaScript engine (a browser, Node.js) that provides the event loop, timers and I/O ([04 §1](../modules/04-js-async-event-loop.md#1-the-event-loop-tasks-microtasks-and-rendering)).
- **call stack**: the stack of running function calls; the loop moves on only when it is empty ([04 §1](../modules/04-js-async-event-loop.md#1-the-event-loop-tasks-microtasks-and-rendering)).
- **task (macrotask)**: a unit of work from a task queue, such as a timer callback, an event or an I/O callback ([04 §1](../modules/04-js-async-event-loop.md#1-the-event-loop-tasks-microtasks-and-rendering)).
- **microtask**: a job run right after the current task, before the next one: promise reactions, `await` continuations, `queueMicrotask` ([04 §1](../modules/04-js-async-event-loop.md#1-the-event-loop-tasks-microtasks-and-rendering)).
- **microtask checkpoint**: the step that drains the whole microtask queue, including microtasks queued while draining ([04 §1](../modules/04-js-async-event-loop.md#1-the-event-loop-tasks-microtasks-and-rendering)).
- **rendering opportunity**: a moment the browser may update the screen; only then do `requestAnimationFrame` callbacks, style, layout and paint run ([04 §1](../modules/04-js-async-event-loop.md#1-the-event-loop-tasks-microtasks-and-rendering)).
- **event loop phases (Node)**: libuv's repeating cycle of pending callbacks, idle/prepare, poll, check, close callbacks and timers (timers run after poll since libuv 1.45 / Node 20) ([04 §2](../modules/04-js-async-event-loop.md#2-nodes-event-loop-and-why-it-matters-for-ssr)).
- **`process.nextTick`**: Node's queue that runs before promise microtasks, as soon as the current operation completes ([04 §2](../modules/04-js-async-event-loop.md#2-nodes-event-loop-and-why-it-matters-for-ssr)).
- **promise**: an object representing a future value, with a state (pending, fulfilled or rejected) that settles once ([04 §3](../modules/04-js-async-event-loop.md#3-promises-from-callbacks-to-a-state-machine)).
- **settled / resolved**: a settled promise is fulfilled or rejected; a resolved promise has its fate fixed, possibly by following another promise that is still pending ([04 §3](../modules/04-js-async-event-loop.md#3-promises-from-callbacks-to-a-state-machine)).
- **thenable**: any object with a `then` method, which promises adopt when resolved with it ([04 §3](../modules/04-js-async-event-loop.md#3-promises-from-callbacks-to-a-state-machine)).
- **promise combinator**: `Promise.all`, `allSettled`, `race` or `any`, which combine several promises into one ([04 §4](../modules/04-js-async-event-loop.md#4-combinators-and-helpers)).
- **`Promise.withResolvers`**: returns a promise together with its `resolve` and `reject` functions ([04 §4](../modules/04-js-async-event-loop.md#4-combinators-and-helpers)).
- **`async` function**: a function that returns a promise and can pause at `await` without blocking the thread ([04 §5](../modules/04-js-async-event-loop.md#5-async-and-await)).
- **top-level `await`**: `await` at the top level of an ES module, which delays the module's evaluation and that of its importers ([04 §5](../modules/04-js-async-event-loop.md#5-async-and-await)).
- **async iterator**: an iterator whose `next()` returns a promise of `{ value, done }`, consumed with `for await` ([04 §6](../modules/04-js-async-event-loop.md#6-async-iteration)).
- **async generator**: an `async function*` that can both `await` and `yield` ([04 §6](../modules/04-js-async-event-loop.md#6-async-iteration)).
- **`AbortController` / `AbortSignal`**: the controller that aborts, and the signal it hands to APIs that should stop, with an abort `reason` ([04 §7](../modules/04-js-async-event-loop.md#7-cancellation-with-abortcontroller)).
- **unhandled rejection**: a rejected promise with no handler after a microtask checkpoint; browsers report it, Node crashes by default ([04 §8](../modules/04-js-async-event-loop.md#8-unhandled-rejections-queuemicrotask-and-starvation)).
- **starvation**: an endless chain of microtasks or a long synchronous block that keeps timers, I/O and rendering from ever running ([04 §8](../modules/04-js-async-event-loop.md#8-unhandled-rejections-queuemicrotask-and-starvation)).
- **libuv**: the C library that runs Node's event loop and its I/O ([04 §1](../modules/04-js-async-event-loop.md#1-the-event-loop-tasks-microtasks-and-rendering)).
- **`MessageChannel`**: a pair of connected ports; a message posted on one arrives as a task on the other ([04 §1](../modules/04-js-async-event-loop.md#1-the-event-loop-tasks-microtasks-and-rendering)).
- **Web Worker**: a script that runs on its own thread and talks to the page by messages ([04 §1](../modules/04-js-async-event-loop.md#1-the-event-loop-tasks-microtasks-and-rendering)).

## Module 05

- **Module Record**: the engine's description of one module (its import and export entries and, after linking, its environment) ([05 §1](../modules/05-js-modules-memory-modern-features.md#1-es-modules-static-structure-linking-and-live-bindings)).
- **module environment**: the scope of a module's top-level declarations, where imports are indirect bindings ([05 §1](../modules/05-js-modules-memory-modern-features.md#1-es-modules-static-structure-linking-and-live-bindings)).
- **live binding**: an import that reads the exporter's variable on every access instead of copying its value ([05 §1](../modules/05-js-modules-memory-modern-features.md#1-es-modules-static-structure-linking-and-live-bindings)).
- **module map**: the browser's per-Document (or per-worker) table, keyed by URL and module type, that makes each module fetch, parse and evaluate once ([05 §1](../modules/05-js-modules-memory-modern-features.md#1-es-modules-static-structure-linking-and-live-bindings)).
- **post-order evaluation**: a module's body runs after the bodies of all its dependencies ([05 §1](../modules/05-js-modules-memory-modern-features.md#1-es-modules-static-structure-linking-and-live-bindings)).
- **CORS**: the browser's cross-origin permission check, which module scripts always go through (taught in module 09) ([05 §1](../modules/05-js-modules-memory-modern-features.md#1-es-modules-static-structure-linking-and-live-bindings)).
- **CommonJS**: Node's original module system: `require` runs a file once and returns its `module.exports` value ([05 §2](../modules/05-js-modules-memory-modern-features.md#2-commonjs-interop-and-dynamic-import)).
- **module namespace object**: the object an `import * as ns` or `import()` gives you, with one read-only property per export ([05 §2](../modules/05-js-modules-memory-modern-features.md#2-commonjs-interop-and-dynamic-import)).
- **tree shaking**: a bundler's removal of exports and modules nothing uses, which needs static `import`/`export` and side-effect information ([05 §2](../modules/05-js-modules-memory-modern-features.md#2-commonjs-interop-and-dynamic-import)).
- **`sideEffects` field**: a `package.json` hint telling bundlers which files can be dropped when nothing imported from them is used ([05 §2](../modules/05-js-modules-memory-modern-features.md#2-commonjs-interop-and-dynamic-import)).
- **AMD / UMD**: the asynchronous browser module format of RequireJS, and a wrapper that runs one file as AMD, CommonJS or a global ([05 §2](../modules/05-js-modules-memory-modern-features.md#2-commonjs-interop-and-dynamic-import)).
- **bare specifier**: an import source that is a package name rather than a relative path or URL, which browsers cannot resolve without an import map ([05 §3](../modules/05-js-modules-memory-modern-features.md#3-import-maps-importmeta-and-import-attributes)).
- **import map**: a `<script type="importmap">` JSON table that maps specifiers to URLs before the browser fetches modules ([05 §3](../modules/05-js-modules-memory-modern-features.md#3-import-maps-importmeta-and-import-attributes)).
- **import attributes**: the `with { type: 'json' }` clause that tells the host what kind of module it must load ([05 §3](../modules/05-js-modules-memory-modern-features.md#3-import-maps-importmeta-and-import-attributes)).
- **synthetic module**: a module whose exports the host creates directly instead of from source text, such as a JSON module ([05 §3](../modules/05-js-modules-memory-modern-features.md#3-import-maps-importmeta-and-import-attributes)).
- **GC roots**: where reachability starts: the global object, the call stacks, and host handles such as active timers and listeners ([05 §4](../modules/05-js-modules-memory-modern-features.md#4-garbage-collection-and-memory-leaks)).
- **mark-and-sweep**: the collection algorithm that keeps what roots reach and frees the rest, so unreachable cycles are collected ([05 §4](../modules/05-js-modules-memory-modern-features.md#4-garbage-collection-and-memory-leaks)).
- **generational hypothesis**: "most objects die young", the basis for collecting a small young generation often and the old generation rarely ([05 §4](../modules/05-js-modules-memory-modern-features.md#4-garbage-collection-and-memory-leaks)).
- **Scavenger / Mark-Compact**: V8's young-generation copying collector and its whole-heap collector ([05 §4](../modules/05-js-modules-memory-modern-features.md#4-garbage-collection-and-memory-leaks)).
- **detached DOM node**: an element removed from the page that JavaScript still references, so it and its subtree stay in memory ([05 §4](../modules/05-js-modules-memory-modern-features.md#4-garbage-collection-and-memory-leaks)).
- **heap snapshot**: a DevTools capture of every object and its retainers, compared across snapshots to find what grows ([05 §4](../modules/05-js-modules-memory-modern-features.md#4-garbage-collection-and-memory-leaks)).
- **weak reference**: a reference the collector ignores when deciding reachability ([05 §5](../modules/05-js-modules-memory-modern-features.md#5-weak-references-weakmap-weakset-weakref-and-finalizationregistry)).
- **ephemeron**: a key/value pair whose value is kept only while the key is reachable from elsewhere, which is how a `WeakMap` entry behaves ([05 §5](../modules/05-js-modules-memory-modern-features.md#5-weak-references-weakmap-weakset-weakref-and-finalizationregistry)).
- **kept objects**: the per-job list that keeps a `WeakRef` target alive after `new WeakRef` or `deref()` until the current synchronous run ends ([05 §5](../modules/05-js-modules-memory-modern-features.md#5-weak-references-weakmap-weakset-weakref-and-finalizationregistry)).
- **registered symbol**: a symbol created by `Symbol.for(key)`, recreatable from its string and therefore not usable as a weak key ([05 §5](../modules/05-js-modules-memory-modern-features.md#5-weak-references-weakmap-weakset-weakref-and-finalizationregistry)).
- **error cause**: the `cause` option of `Error` that links a wrapping error to the one that triggered it ([05 §6](../modules/05-js-modules-memory-modern-features.md#6-errors-subclasses-causes-aggregation-and-global-handlers)).
- **`AggregateError`**: an error that carries several failures in its `errors` array ([05 §6](../modules/05-js-modules-memory-modern-features.md#6-errors-subclasses-causes-aggregation-and-global-handlers)).
- **brand check**: a test of an object's internal slot rather than its prototype chain, such as `Error.isError` ([05 §6](../modules/05-js-modules-memory-modern-features.md#6-errors-subclasses-causes-aggregation-and-global-handlers)).
- **cross-realm**: created by another global environment (an iframe, a worker, a Node `vm` context), so its prototypes differ from yours ([05 §6](../modules/05-js-modules-memory-modern-features.md#6-errors-subclasses-causes-aggregation-and-global-handlers)).
- **disposable**: an object with a `[Symbol.dispose]()` (or `[Symbol.asyncDispose]()`) method that `using` calls at block exit ([05 §7](../modules/05-js-modules-memory-modern-features.md#7-explicit-resource-management-using-and-disposablestack)).
- **`SuppressedError`**: the error `using` produces when a disposer throws while another error is in flight; it holds both (`error`, `suppressed`) ([05 §7](../modules/05-js-modules-memory-modern-features.md#7-explicit-resource-management-using-and-disposablestack)).
- **`DisposableStack`**: a run-time collection of cleanups (`use`, `adopt`, `defer`) disposed in reverse order; `move()` transfers ownership ([05 §7](../modules/05-js-modules-memory-modern-features.md#7-explicit-resource-management-using-and-disposablestack)).
- **downleveling**: compiling newer syntax into older JavaScript (here, `using` into TypeScript's helper calls) so it runs on engines without it ([05 §7](../modules/05-js-modules-memory-modern-features.md#7-explicit-resource-management-using-and-disposablestack)).
- **TC39 stages**: the maturity levels of a proposal (0, 1, 2, 2.7, 3, 4); Stage 4 means finished, with two compatible implementations ([05 §8](../modules/05-js-modules-memory-modern-features.md#8-modern-features-by-edition-es2015-to-es2026)).
- **ECMAScript edition**: the yearly snapshot of the specification (ES2026 = 17th edition), cut in March from the Stage 4 proposals ([05 §8](../modules/05-js-modules-memory-modern-features.md#8-modern-features-by-edition-es2015-to-es2026)).
- **polyfill**: code that adds a missing standard API at run time; syntax cannot be polyfilled, only compiled ([05 §8](../modules/05-js-modules-memory-modern-features.md#8-modern-features-by-edition-es2015-to-es2026)).
- **`target` / `lib` (TypeScript)**: the syntax level `tsc` emits, versus the API declarations it type-checks against ([05 §8](../modules/05-js-modules-memory-modern-features.md#8-modern-features-by-edition-es2015-to-es2026)).
- **bundler**: a build tool (esbuild, webpack) that combines modules into a few files and drops unused code ([05 §1](../modules/05-js-modules-memory-modern-features.md#1-es-modules-static-structure-linking-and-live-bindings)).
- **chunk**: a separate output file a bundler emits so that part of an app loads on demand ([05 Q05.08](../modules/05-js-modules-memory-modern-features.md#q05-08)).
- **LRU**: least recently used; a cache that evicts the entry untouched the longest ([05 §5](../modules/05-js-modules-memory-modern-features.md#5-weak-references-weakmap-weakset-weakref-and-finalizationregistry)).
- **agent**: ECMA-262's term for one thread of execution with its realms, such as a Node process's main thread and its `vm` contexts ([05 Ex 05.2](../modules/05-js-modules-memory-modern-features.md#ex05-2)).
- **browserslist**: the config that lists the browsers an app supports ([05 §8](../modules/05-js-modules-memory-modern-features.md#8-modern-features-by-edition-es2015-to-es2026)).

## Module 06

- **type erasure**: removing every type annotation, interface and type-only import when TypeScript is turned into JavaScript, so nothing about types exists at run time ([06 §1](../modules/06-ts-type-system-essentials.md#1-what-typescript-is-erased-types-tsc-and-transpile-only-tools)).
- **type checker**: the part of TypeScript that analyzes the whole program and reports diagnostics; it emits nothing by itself ([06 §1](../modules/06-ts-type-system-essentials.md#1-what-typescript-is-erased-types-tsc-and-transpile-only-tools)).
- **isolated modules / per-file transpiler**: a tool (esbuild, `ts.transpileModule`, Node) that turns one file into JavaScript without seeing the others, so it cannot use type information ([06 §1](../modules/06-ts-type-system-essentials.md#1-what-typescript-is-erased-types-tsc-and-transpile-only-tools)).
- **type stripping**: Node's way of running `.ts`: types are replaced with whitespace, nothing is checked, and syntax that needs generated code is rejected ([06 §1](../modules/06-ts-type-system-essentials.md#1-what-typescript-is-erased-types-tsc-and-transpile-only-tools)).
- **erasable syntax**: TypeScript syntax that can be deleted without changing behavior; `enum`, parameter properties and namespaces with values are not erasable ([06 §1](../modules/06-ts-type-system-essentials.md#1-what-typescript-is-erased-types-tsc-and-transpile-only-tools)).

- **structural typing**: compatibility decided by members (shape), not by declared names ([06 §2](../modules/06-ts-type-system-essentials.md#2-structural-typing-assignability-and-readonly)).
- **excess property check**: the extra check that rejects unknown properties in a fresh object literal ([06 §2](../modules/06-ts-type-system-essentials.md#2-structural-typing-assignability-and-readonly)).
- **weak type**: an object type whose properties are all optional; a value sharing none of them is rejected ([06 §2](../modules/06-ts-type-system-essentials.md#2-structural-typing-assignability-and-readonly)).
- **type alias**: a name for an existing type; it never creates a distinct type ([06 §2](../modules/06-ts-type-system-essentials.md#2-structural-typing-assignability-and-readonly)).
- **narrowing**: the checker refining a variable's type after a test, separately on each branch ([06 §3](../modules/06-ts-type-system-essentials.md#3-narrowing-and-control-flow-analysis)).
- **control-flow analysis**: following branches, joins and assignments to compute each variable's type at each point in the code ([06 §3](../modules/06-ts-type-system-essentials.md#3-narrowing-and-control-flow-analysis)).
- **type predicate**: a return type `value is T` that narrows the caller's argument when the function returns `true`; unchecked ([06 §3](../modules/06-ts-type-system-essentials.md#3-narrowing-and-control-flow-analysis)).
- **assertion function**: a function typed `asserts value is T` that narrows everything after the call and throws otherwise ([06 §3](../modules/06-ts-type-system-essentials.md#3-narrowing-and-control-flow-analysis)).
- **discriminated union**: a union whose members share a property with distinct literal types, so checking it narrows to one member ([06 §4](../modules/06-ts-type-system-essentials.md#4-unions-intersections-and-discriminated-unions)).
- **discriminant**: that shared literal-typed property, such as `kind` ([06 §4](../modules/06-ts-type-system-essentials.md#4-unions-intersections-and-discriminated-unions)).
- **exhaustiveness check**: making the leftover type in a `default` branch reach `never`, so a missing case is a compile error ([06 §4](../modules/06-ts-type-system-essentials.md#4-unions-intersections-and-discriminated-unions)).
- **`never`**: the type with no values; assignable to everything, nothing is assignable to it ([06 §4](../modules/06-ts-type-system-essentials.md#4-unions-intersections-and-discriminated-unions)).
- **`any`**: the type that turns checking off in both directions, so it spreads to everything it touches ([06 §5](../modules/06-ts-type-system-essentials.md#5-any-unknown-never-void-and-object-versus-)).
- **`unknown`**: the safe top type: every value is assignable to it, and nothing can be done with it before narrowing ([06 §5](../modules/06-ts-type-system-essentials.md#5-any-unknown-never-void-and-object-versus-)).
- **`void` (return type)**: "the caller ignores the result"; a function type returning `void` may still be implemented by one that returns a value ([06 §5](../modules/06-ts-type-system-essentials.md#5-any-unknown-never-void-and-object-versus-)).
- **reverse mapping**: the numeric-enum object's extra entries from value to name (`Direction[0] === 'Up'`) ([06 §6](../modules/06-ts-type-system-essentials.md#6-enums-literal-unions-as-const-and-satisfies)).
- **const assertion (`as const`)**: makes a literal expression keep its literal types and become deeply `readonly` ([06 §6](../modules/06-ts-type-system-essentials.md#6-enums-literal-unions-as-const-and-satisfies)).
- **`satisfies`**: checks an expression against a type while keeping the expression's own inferred type ([06 §6](../modules/06-ts-type-system-essentials.md#6-enums-literal-unions-as-const-and-satisfies)).
- **type assertion**: `value as T`, a claim the compiler accepts without checking the value ([06 §6](../modules/06-ts-type-system-essentials.md#6-enums-literal-unions-as-const-and-satisfies)).
- **strict family**: the eight checks `strict` turns on in TypeScript 6.0 (`noImplicitAny`, `strictNullChecks`, …), each switchable on its own ([06 §7](../modules/06-ts-type-system-essentials.md#7-tsconfig-the-strict-family-module-settings-and-typescript-60-defaults)).
- **module resolution**: how the compiler maps an import specifier to a file (`bundler`, `nodenext`) ([06 §7](../modules/06-ts-type-system-essentials.md#7-tsconfig-the-strict-family-module-settings-and-typescript-60-defaults)).
- **`verbatimModuleSyntax`**: the rule that imports and exports are emitted exactly as written, so type-only ones must say `type` ([06 §7](../modules/06-ts-type-system-essentials.md#7-tsconfig-the-strict-family-module-settings-and-typescript-60-defaults)).
- **declaration file (`.d.ts`)**: types for code whose implementation lives elsewhere; contains no run-time code ([06 §8](../modules/06-ts-type-system-essentials.md#8-declaration-files-types-and-augmentation)).
- **DefinitelyTyped / `@types`**: the community repository and npm scope of declaration files for packages that ship none ([06 §8](../modules/06-ts-type-system-essentials.md#8-declaration-files-types-and-augmentation)).
- **ambient module**: `declare module 'name' { … }`, types for a module specifier without an implementation in the program ([06 §8](../modules/06-ts-type-system-essentials.md#8-declaration-files-types-and-augmentation)).
- **module augmentation**: `declare module './x' { … }` inside a module, merging new members into existing declarations of another module ([06 §8](../modules/06-ts-type-system-essentials.md#8-declaration-files-types-and-augmentation)).
- **global augmentation**: `declare global { … }` inside a module, adding to global types such as `Window` ([06 §8](../modules/06-ts-type-system-essentials.md#8-declaration-files-types-and-augmentation)).
- **esbuild**: a fast bundler that compiles each file on its own and only strips TypeScript types ([06 header](../modules/06-ts-type-system-essentials.md)).
- **Vitest**: the test runner the labs use; it transforms files with a per-file tool, so it does not type-check ([06 header](../modules/06-ts-type-system-essentials.md)).
- **emit**: the JavaScript (and `.d.ts`) files the compiler writes; types are absent from it ([06 §1](../modules/06-ts-type-system-essentials.md#1-what-typescript-is-erased-types-tsc-and-transpile-only-tools)).
- **literal widening**: a `let` initialised with `'x'` gets type `string`, a `const` keeps `'x'` ([06 §6](../modules/06-ts-type-system-essentials.md#6-enums-literal-unions-as-const-and-satisfies)).
- **side-effect import**: `import './file.css'`, an import with no bindings; checked in 6.0 by `noUncheckedSideEffectImports` ([06 §7](../modules/06-ts-type-system-essentials.md#7-tsconfig-the-strict-family-module-settings-and-typescript-60-defaults)).
- **`rootDir`**: the directory whose layout the output mirrors under `outDir`; default `.` (the tsconfig folder) since 6.0 ([06 §7](../modules/06-ts-type-system-essentials.md#7-tsconfig-the-strict-family-module-settings-and-typescript-60-defaults)).

## Module 07

- **type parameter**: a placeholder in a generic signature (`<T>`) that each use fills with a type argument, written or inferred ([07 §1](../modules/07-ts-advanced-types-and-decorators.md#1-generics-constraints-defaults-inference-and-const-type-parameters)).
- **constraint**: an `extends` bound on a type parameter that a type argument must satisfy (`T extends { length: number }`) ([07 §1](../modules/07-ts-advanced-types-and-decorators.md#1-generics-constraints-defaults-inference-and-const-type-parameters)).
- **inference site**: a position from which TypeScript collects candidates for a type parameter: arguments, callback returns and the expected result type ([07 §1](../modules/07-ts-advanced-types-and-decorators.md#1-generics-constraints-defaults-inference-and-const-type-parameters)).
- **`const` type parameter**: a type parameter declared `<const T>`, inferred as if the argument were written `as const` ([07 §1](../modules/07-ts-advanced-types-and-decorators.md#1-generics-constraints-defaults-inference-and-const-type-parameters)).

- **indexed access type**: `T[K]`, the type of property `K` of `T`; a union of keys gives the union of their types ([07 §2](../modules/07-ts-advanced-types-and-decorators.md#2-keyof-indexed-access-mapped-and-template-literal-types)).
- **mapped type**: a type that builds one property per key, `{ [K in Keys]: … }`, optionally adding or removing `readonly` and `?` ([07 §2](../modules/07-ts-advanced-types-and-decorators.md#2-keyof-indexed-access-mapped-and-template-literal-types)).
- **homomorphic mapped type**: a mapped type over `keyof T`, which keeps each property's `readonly` and `?` modifiers ([07 §2](../modules/07-ts-advanced-types-and-decorators.md#2-keyof-indexed-access-mapped-and-template-literal-types)).
- **key remapping**: the `as` clause of a mapped type that renames keys, or drops them by producing `never` ([07 §2](../modules/07-ts-advanced-types-and-decorators.md#2-keyof-indexed-access-mapped-and-template-literal-types)).
- **template literal type**: a string literal type built with template syntax, `` `${A}:${B}` ``, expanding over unions ([07 §2](../modules/07-ts-advanced-types-and-decorators.md#2-keyof-indexed-access-mapped-and-template-literal-types)).

- **conditional type**: `T extends U ? X : Y`, a type chosen by an assignability check ([07 §3](../modules/07-ts-advanced-types-and-decorators.md#3-conditional-types-distributivity-infer-and-recursive-types)).
- **distributive conditional type**: a conditional type over a naked type parameter, applied to each member of a union separately ([07 §3](../modules/07-ts-advanced-types-and-decorators.md#3-conditional-types-distributivity-infer-and-recursive-types)).
- **`infer`**: a declaration inside a conditional type's pattern that captures part of the matched type for the true branch ([07 §3](../modules/07-ts-advanced-types-and-decorators.md#3-conditional-types-distributivity-infer-and-recursive-types)).

- **utility type**: a generic type alias shipped in TypeScript's `lib` files (`Partial`, `Pick`, `Omit`, `ReturnType`, `Awaited`, …), written as an ordinary mapped or conditional type ([07 §4](../modules/07-ts-advanced-types-and-decorators.md#4-utility-types-built-in-and-by-hand)).
- **distributive `Omit`**: `T extends unknown ? Omit<T, K> : never`, which removes keys from each union member instead of collapsing the union to its common keys ([07 §4](../modules/07-ts-advanced-types-and-decorators.md#4-utility-types-built-in-and-by-hand)).

- **covariance / contravariance**: a generic type is covariant in `T` when `F<Dog>` fits where `F<Animal>` is expected (outputs), contravariant when the reverse holds (inputs) ([07 §5](../modules/07-ts-advanced-types-and-decorators.md#5-variance-parameter-bivariance-and-strictfunctiontypes)).
- **method bivariance**: parameters of members declared with method syntax are compared in both directions even under `strictFunctionTypes` ([07 §5](../modules/07-ts-advanced-types-and-decorators.md#5-variance-parameter-bivariance-and-strictfunctiontypes)).
- **variance annotation**: `in`, `out` or `in out` on a type parameter, checked by the compiler ([07 §5](../modules/07-ts-advanced-types-and-decorators.md#5-variance-parameter-bivariance-and-strictfunctiontypes)).

- **branded type**: a primitive intersected with a type-only tag (`string & { readonly [brand]: 'UserId' }`) so that same-shaped values are incompatible at compile time ([07 §6](../modules/07-ts-advanced-types-and-decorators.md#6-branded-types-for-ids-and-money)).
- **standard decorator / legacy decorator**: a TC39-proposal decorator called with `(value, context)` (TypeScript 5.0+, no parameter decorators), versus the older semantics enabled by `experimentalDecorators` ([07 §7](../modules/07-ts-advanced-types-and-decorators.md#7-decorators-tc39-standard-versus-experimentaldecorators-and-what-angular-does-with-them)).
- **`accessor` field**: a class field declared with `accessor`, which creates a getter/setter pair that a decorator can intercept ([07 §7](../modules/07-ts-advanced-types-and-decorators.md#7-decorators-tc39-standard-versus-experimentaldecorators-and-what-angular-does-with-them)).
- **`ɵcmp` / `ɵfac`**: the static component definition and factory that the Angular compiler emits in place of `@Component` ([07 §7](../modules/07-ts-advanced-types-and-decorators.md#7-decorators-tc39-standard-versus-experimentaldecorators-and-what-angular-does-with-them)).
- **schema-first type**: a static type derived from a run-time validation schema (`z.infer<typeof Schema>`), so the check and the type cannot drift ([07 §8](../modules/07-ts-advanced-types-and-decorators.md#8-runtime-validation-with-zod-4-schema-first-types)).
- **`parse` / `safeParse`**: validate and return the data or throw a `ZodError`, versus return a `{ success, data | error }` result object ([07 §8](../modules/07-ts-advanced-types-and-decorators.md#8-runtime-validation-with-zod-4-schema-first-types)).
- **strip / strict / loose object**: Zod's three unknown-key modes: drop unknown keys (the `z.object` default), reject them, or keep them ([07 §8](../modules/07-ts-advanced-types-and-decorators.md#8-runtime-validation-with-zod-4-schema-first-types)).
- **typed reactive forms**: reactive forms whose controls carry a value type (`FormControl<string | null>`), strict by default since Angular 14; `nonNullable` removes the `null` ([07 §9](../modules/07-ts-advanced-types-and-decorators.md#9-typing-patterns-in-angular-code)).
- **`getRawValue()`**: a form group's full value including disabled controls, unlike `value`, which is `Partial` ([07 §9](../modules/07-ts-advanced-types-and-decorators.md#9-typing-patterns-in-angular-code)).
- **generic component**: a component class with a type parameter that the template type-checker infers from the host's bindings under `strictTemplates` ([07 §9](../modules/07-ts-advanced-types-and-decorators.md#9-typing-patterns-in-angular-code)).
- **`ngc`**: the Angular compiler's command-line tool; it compiles `@Component` and other decorators ahead of time into static definitions such as `ɵfac` and `ɵcmp` ([07 §7](../modules/07-ts-advanced-types-and-decorators.md#7-decorators-tc39-standard-versus-experimentaldecorators-and-what-angular-does-with-them)).
- **JIT mode**: compiling Angular components at run time, where the decorators are really called; standard field decorators throw there ([07 §7](../modules/07-ts-advanced-types-and-decorators.md#7-decorators-tc39-standard-versus-experimentaldecorators-and-what-angular-does-with-them)).
- **Stage 2.7**: the TC39 stage "approved in principle and undergoing validation", between Stage 2 and Stage 3 ([07 §7](../modules/07-ts-advanced-types-and-decorators.md#7-decorators-tc39-standard-versus-experimentaldecorators-and-what-angular-does-with-them)).
- **tail-recursive conditional type**: a conditional type whose recursive call is its last step, evaluated without intermediate instantiations since TypeScript 4.5 ([07 §3](../modules/07-ts-advanced-types-and-decorators.md#3-conditional-types-distributivity-infer-and-recursive-types)).
- **DTO (data transfer object)**: the shape of data sent over an API, often derived from an entity with `Omit`/`Pick`/`Partial` ([07 §4](../modules/07-ts-advanced-types-and-decorators.md#4-utility-types-built-in-and-by-hand)).
- **`strictTemplates`**: Angular's strictest template type-checking mode; it turns on `strictContextGenerics`, among other flags ([07 §9](../modules/07-ts-advanced-types-and-decorators.md#9-typing-patterns-in-angular-code)).

## Module 08

- **critical rendering path**: the steps from HTML, CSS and scripts to the first pixels: DOM, CSSOM, render tree, layout, paint, composite ([08 §1](../modules/08-browser-rendering-dom-events.md#1-the-critical-rendering-path-from-bytes-to-pixels)).
- **render-blocking / parser-blocking**: a resource that delays the first paint (CSS by default), versus one that stops DOM construction (a classic synchronous script) ([08 §1](../modules/08-browser-rendering-dom-events.md#1-the-critical-rendering-path-from-bytes-to-pixels)).
- **preload scanner**: a secondary HTML parser that finds and fetches resources while the main parser is blocked ([08 §1](../modules/08-browser-rendering-dom-events.md#1-the-critical-rendering-path-from-bytes-to-pixels)).
- **render tree**: the visible DOM nodes with their computed styles; `display: none` nodes are left out ([08 §1](../modules/08-browser-rendering-dom-events.md#1-the-critical-rendering-path-from-bytes-to-pixels)).
- **forced synchronous layout**: a geometry read (`offsetHeight`, `getBoundingClientRect()`) after a style write, which makes the browser run layout immediately inside the current task ([08 §2](../modules/08-browser-rendering-dom-events.md#2-layout-paint-and-composite-what-each-change-costs)).
- **layout thrashing**: forced synchronous layouts repeated in a loop that interleaves reads and writes; fixed by batching reads before writes ([08 §2](../modules/08-browser-rendering-dom-events.md#2-layout-paint-and-composite-what-each-change-costs)).
- **compositor-only property**: `transform` or `opacity` on an element with its own layer, whose change skips layout and paint ([08 §2](../modules/08-browser-rendering-dom-events.md#2-layout-paint-and-composite-what-each-change-costs)).
- **DocumentFragment**: a parentless node container; appending it moves its children into the tree and leaves it empty ([08 §3](../modules/08-browser-rendering-dom-events.md#3-dom-apis-and-observers)).
- **MutationObserver**: an observer of DOM changes whose records are batched and delivered in a microtask after the synchronous code ([08 §3](../modules/08-browser-rendering-dom-events.md#3-dom-apis-and-observers)).
- **IntersectionObserver / ResizeObserver**: observers that report, asynchronously, a target's visibility within a root and an element's size, replacing scroll and resize polling ([08 §3](../modules/08-browser-rendering-dom-events.md#3-dom-apis-and-observers)).
- **capture / bubble phase**: the two directions of event propagation, down from the window to the target and back up ([08 §4](../modules/08-browser-rendering-dom-events.md#4-events-propagation-default-actions-passive-listeners-and-delegation)).
- **default action**: what the browser does after dispatch (follow a link, submit, scroll), cancelled by `preventDefault()` on a cancelable event ([08 §4](../modules/08-browser-rendering-dom-events.md#4-events-propagation-default-actions-passive-listeners-and-delegation)).
- **passive listener**: a listener that promises not to call `preventDefault()`, so scrolling need not wait for it ([08 §4](../modules/08-browser-rendering-dom-events.md#4-events-propagation-default-actions-passive-listeners-and-delegation)).
- **event delegation**: one listener on a container that handles events from its descendants by inspecting `event.target` ([08 §4](../modules/08-browser-rendering-dom-events.md#4-events-propagation-default-actions-passive-listeners-and-delegation)).
- **custom element**: a class registered with `customElements.define` for a hyphenated tag name; elements already in the page are upgraded ([08 §5](../modules/08-browser-rendering-dom-events.md#5-web-components-custom-elements-shadow-dom-and-templates)).
- **shadow root / light DOM**: the private subtree attached to an element, with its own style scope, versus the element's ordinary children ([08 §5](../modules/08-browser-rendering-dom-events.md#5-web-components-custom-elements-shadow-dom-and-templates)).
- **slot**: a placeholder in a shadow tree that displays light DOM children, by name or by default ([08 §5](../modules/08-browser-rendering-dom-events.md#5-web-components-custom-elements-shadow-dom-and-templates)).
- **retargeting / composed event**: a composed event crosses the shadow boundary and outside listeners see the host as its target ([08 §5](../modules/08-browser-rendering-dom-events.md#5-web-components-custom-elements-shadow-dom-and-templates)).
- **declarative shadow DOM**: a `<template shadowrootmode>` that the HTML parser turns into a shadow root, for server-rendered components ([08 §5](../modules/08-browser-rendering-dom-events.md#5-web-components-custom-elements-shadow-dom-and-templates)).
- **Core Web Vitals (LCP, INP, CLS)**: loading, responsiveness and visual stability metrics, each judged at the 75th percentile of real page loads ([08 §6](../modules/08-browser-rendering-dom-events.md#6-core-web-vitals-lcp-inp-and-cls)).
- **field data / lab data**: measurements from real users (CrUX, RUM) versus from one controlled load (Lighthouse, DevTools) ([08 §6](../modules/08-browser-rendering-dom-events.md#6-core-web-vitals-lcp-inp-and-cls)).
- **popstate**: the event fired when the active history entry changes by traversal or by fragment navigation (then followed by `hashchange`); `pushState` and `replaceState` do not fire it ([08 §7](../modules/08-browser-rendering-dom-events.md#7-history-api-versus-navigation-api)).
- **Navigation API**: the `navigation` object whose `navigate` event reports every navigation and lets a page intercept same-origin ones ([08 §7](../modules/08-browser-rendering-dom-events.md#7-history-api-versus-navigation-api)).
- **Baseline**: MDN's cross-browser label; *newly available* once the latest stable version of every core browser supports a feature, *widely available* about 2.5 years later ([08 Contents](../modules/08-browser-rendering-dom-events.md#contents)).
- **CSSOM**: the CSS Object Model, the parsed style rules the browser combines with the DOM to build the render tree ([08 §1](../modules/08-browser-rendering-dom-events.md#1-the-critical-rendering-path-from-bytes-to-pixels)).
- **critical CSS**: the CSS the first paint needs, kept small so the rest can load without blocking rendering ([08 §1](../modules/08-browser-rendering-dom-events.md#1-the-critical-rendering-path-from-bytes-to-pixels)).
- **compositor layer**: a part of the page painted separately so the compositor can move or fade it without layout or paint ([08 §2](../modules/08-browser-rendering-dom-events.md#2-layout-paint-and-composite-what-each-change-costs)).
- **session window (CLS)**: a run of layout shifts less than 1 s apart, at most 5 s long; CLS reports the largest window ([08 §6](../modules/08-browser-rendering-dom-events.md#6-core-web-vitals-lcp-inp-and-cls)).
- **input delay / processing duration / presentation delay**: the three phases of an interaction's latency that INP measures ([08 §6](../modules/08-browser-rendering-dom-events.md#6-core-web-vitals-lcp-inp-and-cls)).
- **`composedPath()`**: the event's propagation path as an array, starting at the real target; nodes inside closed shadow roots are left out ([08 §4](../modules/08-browser-rendering-dom-events.md#4-events-propagation-default-actions-passive-listeners-and-delegation)).
- **RUM (real user monitoring)**: collecting performance data from your own real users, for example with the `web-vitals` library ([08 §6](../modules/08-browser-rendering-dom-events.md#6-core-web-vitals-lcp-inp-and-cls)).

## Module 17

- **zone.js**: the library that patches the browser's async APIs so Angular learns *that* something may have changed; not used by zoneless apps ([17 §1](../modules/17-signals.md#1-why-signals-exist)).
- **dirty checking**: change detection by walking the component tree and comparing every template binding with its previous value ([17 §1](../modules/17-signals.md#1-why-signals-exist)).
- **OnPush**: a component setting under which Angular checks the component only when an input changes by reference, an event fires inside it, a signal it reads changes, or it is explicitly marked; the default since v22 ([17 §1](../modules/17-signals.md#1-why-signals-exist)).
- **zoneless**: an Angular app without zone.js, where signal notifications and template events schedule rendering; the default for new projects since v21 ([17 §1](../modules/17-signals.md#1-why-signals-exist)).
- **fine-grained reactivity**: refreshing only the views that read the changed value ([17 §1](../modules/17-signals.md#1-why-signals-exist)).
- **signal**: a getter function with a reactive node attached, which records who reads it and notifies them when its value changes ([17 §1](../modules/17-signals.md#1-why-signals-exist)).
- **reactive context**: code Angular runs while tracking dependencies (a `computed`, an `effect`, a template), where signal reads are recorded ([17 §1](../modules/17-signals.md#1-why-signals-exist)).
- **producer / consumer**: a node that is read (a signal, a computed) versus a node that reads (a computed, an effect, a template view) ([17 §1](../modules/17-signals.md#1-why-signals-exist), [§9](../modules/17-signals.md#9-under-the-hood-the-reactive-graph)).
- **writable signal**: a signal with `set`, `update` and `asReadonly`, whose writes notify only when the new value is not equal (`Object.is` by default) ([17 §2](../modules/17-signals.md#2-writable-signals)).
- **computed signal**: a read-only signal derived from others, lazy and memoized, with dependencies rebuilt on every run ([17 §3](../modules/17-signals.md#3-computed-signals)).
- **dynamic dependencies**: a computed or effect depends only on the signals its last run actually read ([17 §3](../modules/17-signals.md#3-computed-signals)).
- **equality cutoff**: a recomputation that yields an equal value keeps the old version, so nothing downstream recomputes ([17 §3](../modules/17-signals.md#3-computed-signals), [§9](../modules/17-signals.md#9-under-the-hood-the-reactive-graph)).
- **`untracked`**: runs a function without recording its signal reads as dependencies ([17 §3](../modules/17-signals.md#3-computed-signals)).
- **effect**: a live consumer that runs a side effect when the signals it read change, batched and scheduled, never synchronously on write ([17 §4](../modules/17-signals.md#4-effects)).
- **component effect / root effect**: an effect tied to a component's change detection, versus one created outside the component tree that runs before components are checked ([17 §4](../modules/17-signals.md#4-effects)).
- **batching**: several synchronous writes cause one effect run with the final values ([17 §4](../modules/17-signals.md#4-effects)).
- **`afterRenderEffect`**: an effect for DOM work after rendering, split into `earlyRead`, `write`, `mixedReadWrite` and `read` phases; browser only ([17 §4](../modules/17-signals.md#4-effects)).
- **layout thrashing**: forcing the browser to recalculate layout repeatedly by interleaving DOM reads and writes ([17 §4](../modules/17-signals.md#4-effects)).
- **`linkedSignal`**: writable derived state: a signal you can set that resets from its source whenever the source changes ([17 §5](../modules/17-signals.md#5-linkedsignal-writable-derived-state)).
- **resource**: a signal-shaped view of an async read, with `params`, a `loader`, and `value`, `status`, `error` and `isLoading` signals ([17 §6](../modules/17-signals.md#6-resources-async-data-as-signals)).
- **`ResourceStatus`**: `'idle' | 'loading' | 'reloading' | 'resolved' | 'error' | 'local'` ([17 §6](../modules/17-signals.md#6-resources-async-data-as-signals)).
- **`TransferState`**: the mechanism that serializes data fetched during server-side rendering into the page so the browser does not fetch it again ([17 §6](../modules/17-signals.md#6-resources-async-data-as-signals)).
- **signal input / model input**: a read-only `InputSignal` Angular writes from the parent's binding, versus a writable `ModelSignal` that also creates an `xChange` output for `[(x)]` ([17 §7](../modules/17-signals.md#7-signal-based-component-apis)).
- **input transform**: a function applied to a bound value before an input stores it, such as `booleanAttribute` or `numberAttribute` ([17 §7](../modules/17-signals.md#7-signal-based-component-apis)).
- **signal query**: `viewChild`, `viewChildren`, `contentChild` or `contentChildren`, which return signals that update as the view changes ([17 §7](../modules/17-signals.md#7-signal-based-component-apis)).
- **`toSignal` / `toObservable`**: subscribe to an Observable and expose its latest value as a signal, versus emit a signal's value (once per flush) as an Observable ([17 §8](../modules/17-signals.md#8-interop-with-rxjs)).
- **push-dirty, pull-value**: a write pushes only a dirty flag through the graph; values are recomputed when read, and only where a producer's version changed ([17 §9](../modules/17-signals.md#9-under-the-hood-the-reactive-graph)).
- **version / epoch**: a node's change counter, versus the global counter of writes used as a fast "nothing changed anywhere" check ([17 §9](../modules/17-signals.md#9-under-the-hood-the-reactive-graph)).
- **live consumer**: an effect or template view, which producers link to and notify; non-live computeds are not linked and validate by polling ([17 §9](../modules/17-signals.md#9-under-the-hood-the-reactive-graph)).
- **glitch**: a derived value computed from an inconsistent mix of new and old inputs; Angular's graph is glitch-free ([17 §9](../modules/17-signals.md#9-under-the-hood-the-reactive-graph)).

## Module 09

- **intermediary**: a proxy, cache or gateway between client and origin server; the method tells it what it may do with a message ([09 §1](../modules/09-web-networking-storage-security.md#1-http-semantics-methods-status-codes-and-headers)).
- **origin server**: the server that owns the requested resource, as opposed to a proxy or cache in front of it ([09 §1](../modules/09-web-networking-storage-security.md#1-http-semantics-methods-status-codes-and-headers)).
- **safe method**: an HTTP method whose semantics are essentially read-only (`GET`, `HEAD`, `OPTIONS`, `TRACE`) ([09 §1](../modules/09-web-networking-storage-security.md#1-http-semantics-methods-status-codes-and-headers)).
- **idempotent method**: a method whose intended effect repeated N times equals one request (`PUT`, `DELETE`, the safe methods) ([09 §1](../modules/09-web-networking-storage-security.md#1-http-semantics-methods-status-codes-and-headers)).
- **idempotency key**: a unique token a client sends with a `POST` so the server recognizes a repeat; an API convention, not defined by RFC 9110 ([09 §1](../modules/09-web-networking-storage-security.md#1-http-semantics-methods-status-codes-and-headers)).
- **response head**: the status line and headers of a response, which `fetch` resolves on before the body has arrived ([09 §2](../modules/09-web-networking-storage-security.md#2-fetch-xhr-and-the-request-lifecycle)).
- **one-shot stream**: a body stream that can be consumed only once; a second read throws ([09 §2](../modules/09-web-networking-storage-security.md#2-fetch-xhr-and-the-request-lifecycle)).
- **XHR (`XMLHttpRequest`)**: the older, event-based request object, which reports upload and download progress ([09 §2](../modules/09-web-networking-storage-security.md#2-fetch-xhr-and-the-request-lifecycle)).
- **`keepalive`**: a `fetch` option that lets a request outlive the page that started it, with the bodies of all in-flight `keepalive` requests together limited to 64 KiB ([09 §2](../modules/09-web-networking-storage-security.md#2-fetch-xhr-and-the-request-lifecycle)).
- **`duplex: 'half'`**: the `fetch` option required to send a stream as the request body ([09 §2](../modules/09-web-networking-storage-security.md#2-fetch-xhr-and-the-request-lifecycle)).
- **head-of-line (HOL) blocking**: one stalled item delaying everything queued behind it: requests on an HTTP/1.1 connection, or every stream on one TCP connection ([09 §3](../modules/09-web-networking-storage-security.md#3-http11-http2-and-http3)).
- **multiplexing / stream**: interleaving many independent request-response pairs (streams) on one connection ([09 §3](../modules/09-web-networking-storage-security.md#3-http11-http2-and-http3)).
- **QUIC**: the UDP-based transport under HTTP/3, with streams, loss recovery per stream and an integrated TLS 1.3 handshake ([09 §3](../modules/09-web-networking-storage-security.md#3-http11-http2-and-http3)).
- **ALPN**: Application-Layer Protocol Negotiation, the TLS extension in which client and server agree on `h2` or `h3` ([09 §3](../modules/09-web-networking-storage-security.md#3-http11-http2-and-http3)).
- **Server Push**: an HTTP/2 feature letting the server send resources the client has not requested; Chrome disabled it by default in 106 ([09 §3](../modules/09-web-networking-storage-security.md#3-http11-http2-and-http3)).
- **fresh / stale**: a stored response is fresh while its age is within its freshness lifetime, and stale after; a stale one must be revalidated or may be reused only where allowed ([09 §4](../modules/09-web-networking-storage-security.md#4-http-caching)).
- **validator**: a token naming the version of a stored response (`ETag`, `Last-Modified`) that a conditional request sends back to the origin ([09 §4](../modules/09-web-networking-storage-security.md#4-http-caching)).
- **`Last-Modified` / `If-Modified-Since`**: the date-based validator and the conditional request that sends it back; implicitly weak, so `ETag` is preferred ([09 §4](../modules/09-web-networking-storage-security.md#4-http-caching)).
- **`ETag`**: an opaque, quoted version tag for a representation, strong by default or weak with `W/` ([09 §4](../modules/09-web-networking-storage-security.md#4-http-caching)).
- **shared cache / CDN**: a cache that serves many users (a proxy or a content delivery network), unlike a browser's private cache ([09 §4](../modules/09-web-networking-storage-security.md#4-http-caching)).
- **origin**: the scheme, host and port of a URL; two URLs are same-origin only when all three match ([09 §5](../modules/09-web-networking-storage-security.md#5-the-same-origin-policy-and-cors)).
- **site**: the registrable domain (a public suffix plus one label); looser than an origin, and the unit cookies' `SameSite` uses ([09 §5](../modules/09-web-networking-storage-security.md#5-the-same-origin-policy-and-cors)).
- **preflight**: the `OPTIONS` request a browser sends before an unusual cross-origin request, asking whether the real one is allowed ([09 §5](../modules/09-web-networking-storage-security.md#5-the-same-origin-policy-and-cors)).
- **safelisted header**: a request header a script may set on a cross-origin request without forcing a preflight (`Accept`, `Accept-Language`, `Content-Language`, `Content-Type` with restricted values, single-range `Range`) ([09 §5](../modules/09-web-networking-storage-security.md#5-the-same-origin-policy-and-cors)).
- **credentialed request**: a cross-origin request sent with cookies or HTTP authentication (`credentials: 'include'`), for which the response needs an explicit origin and `Access-Control-Allow-Credentials: true` ([09 §5](../modules/09-web-networking-storage-security.md#5-the-same-origin-policy-and-cors)).
- **CORS**: Cross-Origin Resource Sharing, the response headers by which a server lets other origins' scripts read its responses ([09 §5](../modules/09-web-networking-storage-security.md#5-the-same-origin-policy-and-cors)).
- **host-only cookie**: a cookie set without `Domain`, returned only to the exact host that set it ([09 §6](../modules/09-web-networking-storage-security.md#6-cookies)).
- **third-party cookie**: a cookie belonging to a site other than the one in the address bar ([09 §6](../modules/09-web-networking-storage-security.md#6-cookies)).
- **CHIPS / `Partitioned`**: Cookies Having Independent Partitioned State, a cookie attribute giving one cookie jar per top-level site ([09 §6](../modules/09-web-networking-storage-security.md#6-cookies)).
- **CSRF**: cross-site request forgery, making a victim's browser send an authenticated request; `SameSite` is defense in depth, the SPA treatment is in 33 and 42 ([09 §6](../modules/09-web-networking-storage-security.md#6-cookies)).
- **Web Storage**: `localStorage` and `sessionStorage`, a small synchronous string key-value store per origin ([09 §7](../modules/09-web-networking-storage-security.md#7-browser-storage-what-each-is-safe-for)).
- **structured clone**: the browser's deep-copy algorithm for plain data (`Date`, `Map`, typed arrays), used by `structuredClone()` and IndexedDB; functions cannot be cloned ([09 §7](../modules/09-web-networking-storage-security.md#7-browser-storage-what-each-is-safe-for)).
- **quota**: the cap on the data an origin may store in IndexedDB, Cache Storage and similar; exceeding it throws `QuotaExceededError` ([09 §7](../modules/09-web-networking-storage-security.md#7-browser-storage-what-each-is-safe-for)).
- **CSP**: Content Security Policy, a response header (or restricted `<meta>`) that tells the browser which scripts, styles and connections the page may use ([09 §8](../modules/09-web-networking-storage-security.md#8-content-security-policy-and-trusted-types)).
- **nonce**: a random, per-response value placed in the CSP and on each trusted `<script>`; only scripts carrying it run ([09 §8](../modules/09-web-networking-storage-security.md#8-content-security-policy-and-trusted-types)).
- **sink**: a DOM API that turns a string into markup or code (`innerHTML`, `eval`, `script.src`) ([09 §8](../modules/09-web-networking-storage-security.md#8-content-security-policy-and-trusted-types)).
- **Trusted Types**: a browser feature that makes sinks accept only values produced by a developer-written policy, enforced with `require-trusted-types-for` ([09 §8](../modules/09-web-networking-storage-security.md#8-content-security-policy-and-trusted-types)).
- **violation report**: the report a browser sends (to `report-to`) when a CSP rule blocks, or in report-only mode would block, something ([09 §8](../modules/09-web-networking-storage-security.md#8-content-security-policy-and-trusted-types)).
- **XSS**: cross-site scripting, attacker-controlled text executing as script in your page; owner module 33 ([09 §8](../modules/09-web-networking-storage-security.md#8-content-security-policy-and-trusted-types)).
- **HPACK**: HTTP/2's stateful header (field) compression ([09 §3](../modules/09-web-networking-storage-security.md#3-http11-http2-and-http3)).
- **TLS**: Transport Layer Security, the encryption layer under HTTPS and under HTTP/2 and QUIC ([09 §3](../modules/09-web-networking-storage-security.md#3-http11-http2-and-http3)).
- **bfcache (back/forward cache)**: the browser's stored snapshot of a whole page, restored at once on Back or Forward; `unload` handlers and `no-store` can cost it ([09 §2](../modules/09-web-networking-storage-security.md#2-fetch-xhr-and-the-request-lifecycle)).
- **JSONP**: an endpoint that wraps data in a caller-named callback and is loaded as a `<script>`; a bypass route for host allowlists ([09 §8](../modules/09-web-networking-storage-security.md#8-content-security-policy-and-trusted-types)).
- **service worker**: a script that runs between page and network with its own lifecycle and no DOM access, able to answer requests from a cache ([09 §9](../modules/09-web-networking-storage-security.md#9-service-workers-and-the-pwa-manifest)).
- **service worker scope**: the URLs a worker controls, by default its script's directory ([09 §9](../modules/09-web-networking-storage-security.md#9-service-workers-and-the-pwa-manifest)).
- **precache**: storing resources in a cache during the worker's `install` event, before they are requested ([09 §9](../modules/09-web-networking-storage-security.md#9-service-workers-and-the-pwa-manifest)).
- **app shell**: the HTML, JavaScript and CSS that render an app's basic UI, usually precached ([09 §9](../modules/09-web-networking-storage-security.md#9-service-workers-and-the-pwa-manifest)).
- **web app manifest**: a JSON file (`name`, `icons`, `start_url`, `display`) that tells the browser how to install a site as an app ([09 §9](../modules/09-web-networking-storage-security.md#9-service-workers-and-the-pwa-manifest)).

## Module 10

- **box model**: the nested content, padding, border and margin rectangles every element generates; `box-sizing` picks which of them `width` measures ([10 §1](../modules/10-css-essentials.md#1-the-box-model-and-formatting-contexts)).
- **containing block**: the rectangle a box's percentage sizes and offsets resolve against, for ordinary boxes the content edge of the nearest block-container ancestor ([10 §1](../modules/10-css-essentials.md#1-the-box-model-and-formatting-contexts)).
- **formatting context**: a region of the page with one set of layout rules (block, inline, flex, grid) ([10 §1](../modules/10-css-essentials.md#1-the-box-model-and-formatting-contexts)).
- **BFC (block formatting context)**: the region where block boxes stack vertically and margins can collapse; floats, `flow-root`, `overflow` other than `visible` and others create a new one ([10 §1](../modules/10-css-essentials.md#1-the-box-model-and-formatting-contexts)).
- **replaced element**: an element whose content CSS does not render, such as an image ([10 §1](../modules/10-css-essentials.md#1-the-box-model-and-formatting-contexts)).
- **margin collapsing**: adjoining vertical margins of in-flow blocks in one BFC combine into one margin (largest positive plus most negative) ([10 §1](../modules/10-css-essentials.md#1-the-box-model-and-formatting-contexts)).
- **clearance**: space `clear` adds above a box's top margin to push it below a float; it inhibits margin collapsing ([10 §1](../modules/10-css-essentials.md#1-the-box-model-and-formatting-contexts)).
- **cascade**: the algorithm that picks one winning declaration per property per element, by origin and importance, context, inline style, layer, specificity, then order ([10 §2](../modules/10-css-essentials.md#2-the-cascade-origins-specificity-and-layers)).
- **declaration**: one `property: value` pair ([10 §2](../modules/10-css-essentials.md#2-the-cascade-origins-specificity-and-layers)).
- **origin**: where a style sheet comes from: user agent, user or author ([10 §2](../modules/10-css-essentials.md#2-the-cascade-origins-specificity-and-layers)).
- **cascade layer**: a named group of rules ordered within an origin by first declaration; unlayered rules beat layered ones for normal declarations ([10 §2](../modules/10-css-essentials.md#2-the-cascade-origins-specificity-and-layers)).
- **specificity**: the A-B-C weight (ids, classes/attributes/pseudo-classes, types/pseudo-elements) of a selector, compared column by column ([10 §2](../modules/10-css-essentials.md#2-the-cascade-origins-specificity-and-layers)).
- **pseudo-class / pseudo-element**: a selector for state not in the document tree (`:hover`) / for an element not directly in it (`::before`) ([10 §2](../modules/10-css-essentials.md#2-the-cascade-origins-specificity-and-layers)).
- **inheritance**: passing a property's computed value from parent to child for inherited properties such as `color` ([10 §2](../modules/10-css-essentials.md#2-the-cascade-origins-specificity-and-layers)).
- **computed value**: the specified value resolved (relative lengths made absolute), and the value transferred in inheritance ([10 §2](../modules/10-css-essentials.md#2-the-cascade-origins-specificity-and-layers)).
- **flex container / flex item**: an element with `display: flex` and its direct children, laid out along one axis ([10 §3](../modules/10-css-essentials.md#3-flexbox-grid-and-subgrid)).
- **main axis / cross axis**: the flex container's direction set by `flex-direction`, and the perpendicular one ([10 §3](../modules/10-css-essentials.md#3-flexbox-grid-and-subgrid)).
- **track**: a grid column or grid row ([10 §3](../modules/10-css-essentials.md#3-flexbox-grid-and-subgrid)).
- **`fr`**: the grid unit for a fraction of the leftover space ([10 §3](../modules/10-css-essentials.md#3-flexbox-grid-and-subgrid)).
- **implicit grid**: the extra tracks a grid creates when items are placed outside the explicit tracks ([10 §3](../modules/10-css-essentials.md#3-flexbox-grid-and-subgrid)).
- **subgrid**: a nested grid whose rows or columns use the parent grid's tracks (`grid-template-columns: subgrid`) ([10 §3](../modules/10-css-essentials.md#3-flexbox-grid-and-subgrid)).
- **stacking context**: a self-contained layer painted as one unit in its parent context; `z-index` only orders siblings inside the same context ([10 §4](../modules/10-css-essentials.md#4-positioning-stacking-contexts-and-z-index)).
- **top layer**: the browser-managed layer above everything else that holds fullscreen elements, modal `<dialog>`s and popovers ([10 §4](../modules/10-css-essentials.md#4-positioning-stacking-contexts-and-z-index)).
- **positioned element**: an element whose `position` is anything but `static` ([10 §4](../modules/10-css-essentials.md#4-positioning-stacking-contexts-and-z-index)).
- **viewport**: the visible area of the page in which it is laid out; `vw` is a percentage of its width ([10 §5](../modules/10-css-essentials.md#5-responsive-css-media-queries-container-queries-and-fluid-type)).
- **media query**: an `@media` condition on the viewport or a user preference (`width`, `hover`, `prefers-color-scheme`) ([10 §5](../modules/10-css-essentials.md#5-responsive-css-media-queries-container-queries-and-fluid-type)).
- **container query**: an `@container` condition on the size of the nearest ancestor with `container-type`, so a component responds to its own space ([10 §5](../modules/10-css-essentials.md#5-responsive-css-media-queries-container-queries-and-fluid-type)).
- **size containment**: a box's size is computed as if it had no content; `container-type: inline-size` applies it to the inline axis ([10 §5](../modules/10-css-essentials.md#5-responsive-css-media-queries-container-queries-and-fluid-type)).
- **fluid typography**: a font size that scales with the viewport between a minimum and a maximum, written with `clamp()` ([10 §5](../modules/10-css-essentials.md#5-responsive-css-media-queries-container-queries-and-fluid-type)).
- **logical property**: a property defined relative to the writing mode (`margin-inline`, `inline-size`) instead of a physical side ([10 §5](../modules/10-css-essentials.md#5-responsive-css-media-queries-container-queries-and-fluid-type)).
- **writing mode**: the direction in which lines of text flow (horizontal or vertical, left-to-right or right-to-left) ([10 §5](../modules/10-css-essentials.md#5-responsive-css-media-queries-container-queries-and-fluid-type)).
- **custom property**: a `--name` value declared on an element, inherited by descendants and read with `var()` ([10 §6](../modules/10-css-essentials.md#6-custom-properties-theming-and-color-scheme)).
- **guaranteed-invalid value**: the initial value of every custom property; using it in `var()` without a fallback invalidates the declaration ([10 §6](../modules/10-css-essentials.md#6-custom-properties-theming-and-color-scheme)).
- **computed-value time**: the step after the cascade where `var()` is substituted; a declaration that fails there is "invalid at computed-value time" and computes as `unset` ([10 §6](../modules/10-css-essentials.md#6-custom-properties-theming-and-color-scheme)).
- **registered property**: a custom property declared with `@property`, with a type, `inherits` and an initial value ([10 §6](../modules/10-css-essentials.md#6-custom-properties-theming-and-color-scheme)).
- **design token**: a named design decision (colour, spacing) stored once as a custom property ([10 §6](../modules/10-css-essentials.md#6-custom-properties-theming-and-color-scheme)).
- **`color-scheme`**: the property that declares which light or dark schemes an element supports and so changes browser-drawn UI ([10 §6](../modules/10-css-essentials.md#6-custom-properties-theming-and-color-scheme)).
- **preprocessor**: a tool such as Sass that compiles an extended stylesheet language into plain CSS at build time ([10 §7](../modules/10-css-essentials.md#7-native-nesting-versus-sass)).
- **compile time versus run time**: what a build tool computes once (Sass variables, loops, math) versus what the browser resolves while the page runs (`var()`, `@media`) ([10 §7](../modules/10-css-essentials.md#7-native-nesting-versus-sass)).
- **mixin**: a Sass block of declarations reused with `@include`, optionally taking arguments and a `@content` block ([10 §7](../modules/10-css-essentials.md#7-native-nesting-versus-sass)).
- **Sass module (`@use`)**: a stylesheet loaded with `@use` that exposes its mixins, functions and variables under a namespace ([10 §7](../modules/10-css-essentials.md#7-native-nesting-versus-sass)).
- **nesting selector (`&`)**: the selector that stands for the parent rule's selector in a nested rule, in native CSS and in Sass ([10 §7](../modules/10-css-essentials.md#7-native-nesting-versus-sass)).
- **BEM**: Block Element Modifier, a class naming convention such as `.card__title` ([10 §7](../modules/10-css-essentials.md#7-native-nesting-versus-sass)).
