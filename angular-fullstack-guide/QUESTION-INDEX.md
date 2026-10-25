# Question index

<!-- Generated file: do not edit. Source: the `### Q` headings of modules/*.md. Regenerate with `node labs/tools/question-index.mjs --write`. -->

**1220 questions in 47 modules.**

| Type | Questions |
|---|---|
| Output | 353 |
| Concept | 330 |
| Difference | 159 |
| Bug hunt | 158 |
| Design | 131 |
| Trade-off | 116 |

## Part A · JavaScript language core

### 01 · Values, types and coercion

| ID | Type | Question |
|---|---|---|
| [Q01.01](modules/01-js-values-types-coercion.md#q01-01) | Concept | What are the primitive types in JavaScript, and how do primitives differ from objects? |
| [Q01.02](modules/01-js-values-types-coercion.md#q01-02) | Output | What does `typeof` return for each of these? |
| [Q01.03](modules/01-js-values-types-coercion.md#q01-03) | Bug hunt | Two "harmless" lines from a code review. What goes wrong, and what would you write instead? |
| [Q01.04](modules/01-js-values-types-coercion.md#q01-04) | Output | What does this print? |
| [Q01.05](modules/01-js-values-types-coercion.md#q01-05) | Output | What does this print about `NaN`? |
| [Q01.06](modules/01-js-values-types-coercion.md#q01-06) | Output | Negative zero. What does this print? |
| [Q01.07](modules/01-js-values-types-coercion.md#q01-07) | Output | Safe integers and large IDs. What does this print? |
| [Q01.08](modules/01-js-values-types-coercion.md#q01-08) | Output | BigInt. What does each line print? (`attempt` prints the error name if the call throws.) |
| [Q01.09](modules/01-js-values-types-coercion.md#q01-09) | Design | How do you represent money in a JavaScript or TypeScript front end? |
| [Q01.10](modules/01-js-values-types-coercion.md#q01-10) | Output | Strings and Unicode. What does this print? |
| [Q01.11](modules/01-js-values-types-coercion.md#q01-11) | Bug hunt | This `reverse` passes the unit tests written with ASCII strings. What is wrong? |
| [Q01.12](modules/01-js-values-types-coercion.md#q01-12) | Design | A plugin must attach its own metadata to objects it does not own. String key, symbol, `Symbol.for`, `WeakMap` or a private field? |
| [Q01.13](modules/01-js-values-types-coercion.md#q01-13) | Output | `Symbol.toPrimitive` and hints. What does this print? |
| [Q01.14](modules/01-js-values-types-coercion.md#q01-14) | Trade-off | How do you check what a value is at run time: `typeof`, `instanceof`, `Array.isArray`, `Object.prototype.toString`, or a type guard? |
| [Q01.15](modules/01-js-values-types-coercion.md#q01-15) | Output | The binary `+` operator. What does this print? |
| [Q01.16](modules/01-js-values-types-coercion.md#q01-16) | Output | `ToNumber`, `Number()` and `parseInt`. What does this print? |
| [Q01.17](modules/01-js-values-types-coercion.md#q01-17) | Bug hunt | Three truthiness checks from a product page. Which ones are wrong? |
| [Q01.18](modules/01-js-values-types-coercion.md#q01-18) | Concept | Walk me through the `==` algorithm. |
| [Q01.19](modules/01-js-values-types-coercion.md#q01-19) | Output | Loose equality and comparison puzzles. What does this print? |
| [Q01.20](modules/01-js-values-types-coercion.md#q01-20) | Difference · Output | `===`, `Object.is` and SameValueZero in collections. What does this print? |
| [Q01.21](modules/01-js-values-types-coercion.md#q01-21) | Bug hunt | A settings loader uses `\|\|` and plain property chains. Find the bugs. |
| [Q01.22](modules/01-js-values-types-coercion.md#q01-22) | Difference · Output | `null` versus `undefined`: defaults, destructuring and JSON. What does this print? |

### 02 · Scope, closures and `this`

| ID | Type | Question |
|---|---|---|
| [Q02.01](modules/02-js-scope-closures-this.md#q02-01) | Difference | What is the difference between `var`, `let` and `const`? |
| [Q02.02](modules/02-js-scope-closures-this.md#q02-02) | Output | What does this print? |
| [Q02.03](modules/02-js-scope-closures-this.md#q02-03) | Output | What does this print? (the temporal dead zone) |
| [Q02.04](modules/02-js-scope-closures-this.md#q02-04) | Output | A function is declared inside a block. What does `typeof` say before and after the block, in strict and in sloppy code? |
| [Q02.05](modules/02-js-scope-closures-this.md#q02-05) | Concept | What is a closure, and how does the engine implement it? |
| [Q02.06](modules/02-js-scope-closures-this.md#q02-06) | Output | What does this print? (the classic loop) |
| [Q02.07](modules/02-js-scope-closures-this.md#q02-07) | Output | What does this print? (what a closure captures) |
| [Q02.08](modules/02-js-scope-closures-this.md#q02-08) | Bug hunt | Memory grows every time a user opens and closes this panel. Why? |
| [Q02.09](modules/02-js-scope-closures-this.md#q02-09) | Trade-off | Private state: closure (factory) or class with `#private` fields? |
| [Q02.10](modules/02-js-scope-closures-this.md#q02-10) | Concept | What are the rules that decide `this`, and in what order do they apply? |
| [Q02.11](modules/02-js-scope-closures-this.md#q02-11) | Output | What does this print? (detached methods) |
| [Q02.12](modules/02-js-scope-closures-this.md#q02-12) | Output | What does this print? (arrow functions and `this`) |
| [Q02.13](modules/02-js-scope-closures-this.md#q02-13) | Output | What does this print? (`bind`, `call` and `new` together) |
| [Q02.14](modules/02-js-scope-closures-this.md#q02-14) | Difference | What is the difference between `call`, `apply` and `bind`? |
| [Q02.15](modules/02-js-scope-closures-this.md#q02-15) | Bug hunt | This component throws on resize and keeps listening after it is destroyed. Find both bugs. |
| [Q02.16](modules/02-js-scope-closures-this.md#q02-16) | Output | Arrow class field versus prototype method. What does this print? |
| [Q02.17](modules/02-js-scope-closures-this.md#q02-17) | Difference · Output | What changes in strict mode? What does this print? |
| [Q02.18](modules/02-js-scope-closures-this.md#q02-18) | Difference | What is the difference between currying and partial application? |
| [Q02.19](modules/02-js-scope-closures-this.md#q02-19) | Difference | What is the difference between debounce and throttle, and when do you use each? |
| [Q02.20](modules/02-js-scope-closures-this.md#q02-20) | Design | Design a `once(fn)` helper for "initialize the SDK". What must it get right? |
| [Q02.21](modules/02-js-scope-closures-this.md#q02-21) | Concept | What is the global scope in a browser page, and why is a top-level `let` not a property of `window`? |

### 03 · Objects, prototypes and classes

| ID | Type | Question |
|---|---|---|
| [Q03.01](modules/03-js-objects-prototypes-classes.md#q03-01) | Output | What does this print? |
| [Q03.02](modules/03-js-objects-prototypes-classes.md#q03-02) | Difference · Output | How do `Object.freeze`, `seal`, `preventExtensions` and `const` differ? What does this print? |
| [Q03.03](modules/03-js-objects-prototypes-classes.md#q03-03) | Difference | What is the difference between `prototype`, `__proto__` and `Object.getPrototypeOf`? |
| [Q03.04](modules/03-js-objects-prototypes-classes.md#q03-04) | Output | What does this print? |
| [Q03.05](modules/03-js-objects-prototypes-classes.md#q03-05) | Bug hunt | Objects share defaults through a prototype. What is the bug, and how do you fix it? |
| [Q03.06](modules/03-js-objects-prototypes-classes.md#q03-06) | Output | What happens when you assign to a property that is read-only on the prototype? |
| [Q03.07](modules/03-js-objects-prototypes-classes.md#q03-07) | Bug hunt | A config loader merges user JSON into defaults with this helper. What is the vulnerability? |
| [Q03.07a](modules/03-js-objects-prototypes-classes.md#q03-07a) | Trade-off | A dictionary keyed by user input: plain object, `Object.create(null)` or `Map`? |
| [Q03.08](modules/03-js-objects-prototypes-classes.md#q03-08) | Concept | "Classes are just syntactic sugar over prototypes." Correct the statement. |
| [Q03.09](modules/03-js-objects-prototypes-classes.md#q03-09) | Output | Private fields meet brand checks, a Proxy and JSON. What does this print? |
| [Q03.10](modules/03-js-objects-prototypes-classes.md#q03-10) | Output | What does `super` refer to when a method is borrowed by another object? |
| [Q03.11](modules/03-js-objects-prototypes-classes.md#q03-11) | Trade-off | Inheritance, composition or mixins: how do you choose? |
| [Q03.12](modules/03-js-objects-prototypes-classes.md#q03-12) | Bug hunt · Output | A tracing proxy misses some reads. What does this print, and why? |
| [Q03.13](modules/03-js-objects-prototypes-classes.md#q03-13) | Output | Can a proxy lie about its target? What does this print? |
| [Q03.14](modules/03-js-objects-prototypes-classes.md#q03-14) | Design | How does Proxy-based reactivity (Vue 3) work, and how does it compare with Angular's signals? |
| [Q03.15](modules/03-js-objects-prototypes-classes.md#q03-15) | Difference · Output | Spread, JSON round-trip or `structuredClone`? What does this print? |
| [Q03.16](modules/03-js-objects-prototypes-classes.md#q03-16) | Output | What does `structuredClone` do with a class instance and with a function? |
| [Q03.17](modules/03-js-objects-prototypes-classes.md#q03-17) | Output | What do the change-by-copy array methods return? |
| [Q03.18](modules/03-js-objects-prototypes-classes.md#q03-18) | Trade-off | How would you enforce immutability of application state: TypeScript `readonly`, `Object.freeze`, or a library? |
| [Q03.19](modules/03-js-objects-prototypes-classes.md#q03-19) | Output | A generator receives values, is abandoned by a loop, and is closed with `return()`. What does this print? |
| [Q03.19a](modules/03-js-objects-prototypes-classes.md#q03-19a) | Design | How would you walk a nested menu tree lazily, and what does `yield*` do for you? |
| [Q03.20](modules/03-js-objects-prototypes-classes.md#q03-20) | Output | Iterators are one-shot and iterator helpers are lazy. What does this print? |

### 04 · The event loop and asynchronous JavaScript

| ID | Type | Question |
|---|---|---|
| [Q04.01](modules/04-js-async-event-loop.md#q04-01) | Concept | What is the event loop, and why does JavaScript need one? |
| [Q04.02](modules/04-js-async-event-loop.md#q04-02) | Difference | What is the difference between a task (macrotask) and a microtask? Name the APIs that queue each. |
| [Q04.03](modules/04-js-async-event-loop.md#q04-03) | Output | What does this print? |
| [Q04.04](modules/04-js-async-event-loop.md#q04-04) | Output | The classic: what does this print? |
| [Q04.05](modules/04-js-async-event-loop.md#q04-05) | Output | What does this print? |
| [Q04.06](modules/04-js-async-event-loop.md#q04-06) | Output | Two listeners each queue a microtask. What does this print, and would a real user click print the same? |
| [Q04.07](modules/04-js-async-event-loop.md#q04-07) | Concept | Where do `requestAnimationFrame` and `requestIdleCallback` run, and when should you use each? |
| [Q04.08](modules/04-js-async-event-loop.md#q04-08) | Difference · Output | In Node, inside a timer callback, what does this print? How does `process.nextTick` differ from `queueMicrotask`? |
| [Q04.09](modules/04-js-async-event-loop.md#q04-09) | Concept | What problems of callback-based APIs do promises solve? |
| [Q04.10](modules/04-js-async-event-loop.md#q04-10) | Output | What does this print? |
| [Q04.11](modules/04-js-async-event-loop.md#q04-11) | Output | What does this chain print? |
| [Q04.12](modules/04-js-async-event-loop.md#q04-12) | Output | Resolving with a promise: what does this print? |
| [Q04.13](modules/04-js-async-event-loop.md#q04-13) | Bug hunt | What is wrong with this function? |
| [Q04.14](modules/04-js-async-event-loop.md#q04-14) | Difference | Compare `Promise.all`, `allSettled`, `race` and `any`. Which would you use for a dashboard, a mirror selection and a timeout? |
| [Q04.15](modules/04-js-async-event-loop.md#q04-15) | Output | What does this print? |
| [Q04.16](modules/04-js-async-event-loop.md#q04-16) | Output | `race` versus `any`: what does this print? |
| [Q04.17](modules/04-js-async-event-loop.md#q04-17) | Concept | What are `Promise.withResolvers` and `Promise.try` for? |
| [Q04.18](modules/04-js-async-event-loop.md#q04-18) | Bug hunt · Output | Which function's `catch` runs? What does this print? |
| [Q04.19](modules/04-js-async-event-loop.md#q04-19) | Bug hunt · Output | What does this print, and what is wrong? |
| [Q04.20](modules/04-js-async-event-loop.md#q04-20) | Trade-off | Sequential awaits, `Promise.all`, or "start now, await later"? |
| [Q04.21](modules/04-js-async-event-loop.md#q04-21) | Concept | What is top-level `await`, where can you use it, and what does it cost? |
| [Q04.22](modules/04-js-async-event-loop.md#q04-22) | Output | What does this print? |
| [Q04.23](modules/04-js-async-event-loop.md#q04-23) | Difference | `for await` (or `Array.fromAsync`) over an array of promises versus `Promise.all`: what is the difference? |
| [Q04.24](modules/04-js-async-event-loop.md#q04-24) | Design | Promises cannot be cancelled. How do you design cancellable async APIs? |
| [Q04.25](modules/04-js-async-event-loop.md#q04-25) | Output | What does this print? |
| [Q04.26](modules/04-js-async-event-loop.md#q04-26) | Bug hunt | What is wrong with this timeout helper? |
| [Q04.27](modules/04-js-async-event-loop.md#q04-27) | Concept | What is an unhandled rejection, and how do browsers and Node react to it? |
| [Q04.28](modules/04-js-async-event-loop.md#q04-28) | Output · Concept | Can promise code starve the event loop? What does this print? |

### 05 · Modules, memory, errors and modern features

| ID | Type | Question |
|---|---|---|
| [Q05.01](modules/05-js-modules-memory-modern-features.md#q05-01) | Concept | What changes when a file becomes an ES module? |
| [Q05.02](modules/05-js-modules-memory-modern-features.md#q05-02) | Output | Three ways to export the same counter. What does `main.mjs` print? |
| [Q05.03](modules/05-js-modules-memory-modern-features.md#q05-03) | Output | What does `main.mjs` print? |
| [Q05.04](modules/05-js-modules-memory-modern-features.md#q05-04) | Bug hunt · Output | The app starts at `main.mjs` and crashes. What does it print, and how do you fix it? |
| [Q05.05](modules/05-js-modules-memory-modern-features.md#q05-05) | Difference | What is the difference between ES modules and CommonJS? |
| [Q05.06](modules/05-js-modules-memory-modern-features.md#q05-06) | Output | Interop in Node 24: what do `main.mjs` and `main.cjs` print? |
| [Q05.07](modules/05-js-modules-memory-modern-features.md#q05-07) | Concept | What does a bundler need in order to tree-shake, and why does CommonJS defeat it? |
| [Q05.08](modules/05-js-modules-memory-modern-features.md#q05-08) | Design | A reporting screen pulls in a 400 KB charting library. How would you load it only when needed? |
| [Q05.09](modules/05-js-modules-memory-modern-features.md#q05-09) | Concept | What problem do import maps solve, and where do they stop helping? |
| [Q05.10](modules/05-js-modules-memory-modern-features.md#q05-10) | Output | What does this module print in Node 24? |
| [Q05.11](modules/05-js-modules-memory-modern-features.md#q05-11) | Concept | How does a JavaScript engine decide what memory to free, and why is the collector "generational"? |
| [Q05.12](modules/05-js-modules-memory-modern-features.md#q05-12) | Bug hunt | Memory grows each time this dashboard widget is created and destroyed. Find the leaks. |
| [Q05.13](modules/05-js-modules-memory-modern-features.md#q05-13) | Difference | `Map` versus `WeakMap` (and `Set` versus `WeakSet`): what can the weak versions not do, and why? |
| [Q05.14](modules/05-js-modules-memory-modern-features.md#q05-14) | Output | Run with `node --expose-gc`. What does it print? |
| [Q05.15](modules/05-js-modules-memory-modern-features.md#q05-15) | Trade-off | You need a cache. Bounded `Map` (LRU), `WeakMap`, or `WeakRef` values: how do you choose? |
| [Q05.16](modules/05-js-modules-memory-modern-features.md#q05-16) | Concept | How do you write an `Error` subclass correctly, and what does `Error.isError` fix that `instanceof` cannot? |
| [Q05.17](modules/05-js-modules-memory-modern-features.md#q05-17) | Output | Cause chains and `AggregateError`: what does this print in Node 24? |
| [Q05.18](modules/05-js-modules-memory-modern-features.md#q05-18) | Design | Design the error-handling strategy for a front-end app. |
| [Q05.19](modules/05-js-modules-memory-modern-features.md#q05-19) | Output | `using`, `DisposableStack` and two disposers that throw: what does this print in Node 24? |
| [Q05.20](modules/05-js-modules-memory-modern-features.md#q05-20) | Trade-off | `try/finally` or `using` in a codebase today? |
| [Q05.21](modules/05-js-modules-memory-modern-features.md#q05-21) | Difference | "Stage 4", "in ES2026" and "I can use it": what is the difference, and how do you check each? |

## Part B · TypeScript

### 06 · TypeScript type system essentials

| ID | Type | Question |
|---|---|---|
| [Q06.01](modules/06-ts-type-system-essentials.md#q06-01) | Concept | What does TypeScript check, and what is left of your types at run time? |
| [Q06.02](modules/06-ts-type-system-essentials.md#q06-02) | Difference | `tsc` versus esbuild, Vitest or Node type stripping: what can a per-file transpiler not do? |
| [Q06.03](modules/06-ts-type-system-essentials.md#q06-03) | Concept | TypeScript 7 is the native compiler. What changes for a project, and why does Angular 22 stay on 6.0? |
| [Q06.04](modules/06-ts-type-system-essentials.md#q06-04) | Output | Excess property checks: which of these assignments compile? |
| [Q06.05](modules/06-ts-type-system-essentials.md#q06-05) | Concept | Structural versus nominal typing: when are two classes interchangeable, and how do `private` members change that? |
| [Q06.06](modules/06-ts-type-system-essentials.md#q06-06) | Difference | TypeScript `private` and `readonly` versus `#private` and `Object.freeze` |
| [Q06.07](modules/06-ts-type-system-essentials.md#q06-07) | Output | What is the type of `value` on lines 6 and 9, and of `pet` on lines 16 and 18? Which lines fail to compile? |
| [Q06.08](modules/06-ts-type-system-essentials.md#q06-08) | Bug hunt | A user-defined type guard that lies |
| [Q06.09](modules/06-ts-type-system-essentials.md#q06-09) | Difference | Type predicates versus assertion functions |
| [Q06.10](modules/06-ts-type-system-essentials.md#q06-10) | Concept | How does exhaustiveness checking with `never` work? |
| [Q06.11](modules/06-ts-type-system-essentials.md#q06-11) | Design | Model the states of a request (idle, loading, success, error) so impossible states cannot compile |
| [Q06.12](modules/06-ts-type-system-essentials.md#q06-12) | Output | Unions and intersections: which lines fail to compile? |
| [Q06.13](modules/06-ts-type-system-essentials.md#q06-13) | Difference | `any`, `unknown`, `never` and `void` |
| [Q06.14](modules/06-ts-type-system-essentials.md#q06-14) | Concept | `object`, `{}` and `Object`: which one do you use, and why do the other two surprise people? |
| [Q06.15](modules/06-ts-type-system-essentials.md#q06-15) | Trade-off | `enum`, literal union or `as const` object? |
| [Q06.16](modules/06-ts-type-system-essentials.md#q06-16) | Output | What JavaScript does `tsc` emit for these three enums, and what does a per-file transpiler emit? |
| [Q06.17](modules/06-ts-type-system-essentials.md#q06-17) | Difference | Type annotation, `satisfies` and `as`: what does each check? |
| [Q06.18](modules/06-ts-type-system-essentials.md#q06-18) | Bug hunt | A type assertion on API data hides a crash |
| [Q06.19](modules/06-ts-type-system-essentials.md#q06-19) | Concept | What does `strict` turn on, and which flags outside it are worth enabling? |
| [Q06.20](modules/06-ts-type-system-essentials.md#q06-20) | Design | Choose `module`, `moduleResolution`, `isolatedModules` and `verbatimModuleSyntax` for an Angular app and for a Node library |
| [Q06.21](modules/06-ts-type-system-essentials.md#q06-21) | Output | Under the lab's settings plus `exactOptionalPropertyTypes`, which lines fail? (The lab already enables `strict` and `noUncheckedIndexedAccess`.) |
| [Q06.22](modules/06-ts-type-system-essentials.md#q06-22) | Trade-off | Upgrading a codebase to TypeScript 6.0: what breaks, and in what order do you fix it? |
| [Q06.23](modules/06-ts-type-system-essentials.md#q06-23) | Concept | Where do types come from: `.d.ts`, `@types`, bundled types, and the 6.0 `types` default? |
| [Q06.24](modules/06-ts-type-system-essentials.md#q06-24) | Design | Type a global (`window.appConfig`) and add a method to a third-party interface without forking it |

### 07 · Advanced types, decorators and runtime safety

| ID | Type | Question |
|---|---|---|
| [Q07.01](modules/07-ts-advanced-types-and-decorators.md#q07-01) | Concept | What does a type parameter give you over `any` or `unknown`, and where does TypeScript infer it from? |
| [Q07.02](modules/07-ts-advanced-types-and-decorators.md#q07-02) | Output | `const` type parameters and `NoInfer`: what does each call infer, and which one fails? |
| [Q07.03](modules/07-ts-advanced-types-and-decorators.md#q07-03) | Output | What do these mapped and template literal types evaluate to? |
| [Q07.04](modules/07-ts-advanced-types-and-decorators.md#q07-04) | Concept | Deriving types from values: `typeof`, `keyof` and indexed access |
| [Q07.05](modules/07-ts-advanced-types-and-decorators.md#q07-05) | Concept | How do conditional types and `infer` work? |
| [Q07.06](modules/07-ts-advanced-types-and-decorators.md#q07-06) | Output | Distributive conditional types: what do these evaluate to? |
| [Q07.07](modules/07-ts-advanced-types-and-decorators.md#q07-07) | Bug hunt | A recursive `DeepReadonly` that makes methods uncallable |
| [Q07.08](modules/07-ts-advanced-types-and-decorators.md#q07-08) | Design | Implement `Partial`, `Pick`, `Omit`, `ReturnType` and `Awaited` by hand |
| [Q07.09](modules/07-ts-advanced-types-and-decorators.md#q07-09) | Difference | `Omit` versus `Exclude`, `Pick` versus `Extract`, and why `Omit` surprises on unions |
| [Q07.10](modules/07-ts-advanced-types-and-decorators.md#q07-10) | Concept | Covariance, contravariance and why methods stay bivariant |
| [Q07.11](modules/07-ts-advanced-types-and-decorators.md#q07-11) | Bug hunt | A handler typed with method syntax lets the wrong event through |
| [Q07.12](modules/07-ts-advanced-types-and-decorators.md#q07-12) | Design | Make `UserId`, `OrderId` and money amounts impossible to mix |
| [Q07.13](modules/07-ts-advanced-types-and-decorators.md#q07-13) | Difference | TC39 standard decorators versus `experimentalDecorators` |
| [Q07.14](modules/07-ts-advanced-types-and-decorators.md#q07-14) | Concept | What does the Angular compiler do with `@Component`, and does the decorator flavor matter? |
| [Q07.15](modules/07-ts-advanced-types-and-decorators.md#q07-15) | Output | In what order do these standard decorators and initializers run? |
| [Q07.16](modules/07-ts-advanced-types-and-decorators.md#q07-16) | Trade-off | Hand-written type guards or a schema library? |
| [Q07.17](modules/07-ts-advanced-types-and-decorators.md#q07-17) | Output | `parse`, `safeParse` and unknown keys: what does Zod return for each payload? |
| [Q07.18](modules/07-ts-advanced-types-and-decorators.md#q07-18) | Concept | How does `InjectionToken<T>` carry a type through DI? |
| [Q07.19](modules/07-ts-advanced-types-and-decorators.md#q07-19) | Difference | Typed forms: `value` versus `getRawValue()`, nullable versus `nonNullable` controls |
| [Q07.20](modules/07-ts-advanced-types-and-decorators.md#q07-20) | Design | Type a generic list component so the item type flows from input to output |

## Part C · Web platform and browser

### 08 · Browser rendering, the DOM and events

| ID | Type | Question |
|---|---|---|
| [Q08.01](modules/08-browser-rendering-dom-events.md#q08-01) | Concept | What happens between receiving the HTML and the first pixel, and what blocks it? |
| [Q08.02](modules/08-browser-rendering-dom-events.md#q08-02) | Difference | Classic, `defer`, `async` and `type="module"` scripts: when does each download and run? |
| [Q08.03](modules/08-browser-rendering-dom-events.md#q08-03) | Concept | Which changes trigger layout, which only paint, and which only composite? |
| [Q08.04](modules/08-browser-rendering-dom-events.md#q08-04) | Bug hunt | This loop makes expanding a long list stutter. Why, and how do you fix it? |
| [Q08.05](modules/08-browser-rendering-dom-events.md#q08-05) | Trade-off | `will-change` and `content-visibility`: when do they help, and what do they cost? |
| [Q08.06](modules/08-browser-rendering-dom-events.md#q08-06) | Output | `MutationObserver` batching: what does this log, and in what order? |
| [Q08.07](modules/08-browser-rendering-dom-events.md#q08-07) | Difference | `IntersectionObserver` and `ResizeObserver` versus scroll and resize listeners |
| [Q08.08](modules/08-browser-rendering-dom-events.md#q08-08) | Output | Capture, target and bubble: in what order do these listeners run? |
| [Q08.09](modules/08-browser-rendering-dom-events.md#q08-09) | Output | `stopPropagation`, `stopImmediatePropagation` and `preventDefault`: what runs and what is prevented? |
| [Q08.10](modules/08-browser-rendering-dom-events.md#q08-10) | Concept | What does a passive listener promise, and why are some listeners passive by default? |
| [Q08.11](modules/08-browser-rendering-dom-events.md#q08-11) | Design | A list shows 10,000 rows, each with an "Open" and a "Delete" button. How do you handle the clicks? |
| [Q08.12](modules/08-browser-rendering-dom-events.md#q08-12) | Output | Custom events and shadow roots: which listeners see the event, and what is `target`? |
| [Q08.13](modules/08-browser-rendering-dom-events.md#q08-13) | Concept | Walk through the custom element lifecycle. What is `observedAttributes` for? |
| [Q08.14](modules/08-browser-rendering-dom-events.md#q08-14) | Difference | Open versus closed shadow roots, slots, `:host` and `::part` |
| [Q08.15](modules/08-browser-rendering-dom-events.md#q08-15) | Concept | What problem does declarative shadow DOM solve? |
| [Q08.16](modules/08-browser-rendering-dom-events.md#q08-16) | Concept | LCP, INP and CLS: what does each measure, and what are the thresholds? |
| [Q08.17](modules/08-browser-rendering-dom-events.md#q08-17) | Difference | Field data versus lab data: why can Lighthouse pass while real users see a poor INP? |
| [Q08.18](modules/08-browser-rendering-dom-events.md#q08-18) | Difference | History API versus Navigation API |

### 09 · Networking, storage and browser security

| ID | Type | Question |
|---|---|---|
| [Q09.01](modules/09-web-networking-storage-security.md#q09-01) | Concept | Safe, idempotent and cacheable methods: what does each property let a client or proxy do? |
| [Q09.02](modules/09-web-networking-storage-security.md#q09-02) | Difference | `301`, `302`, `303`, `307` and `308`, and `401` versus `403`: what does each tell the client to do? |
| [Q09.03](modules/09-web-networking-storage-security.md#q09-03) | Output | `fetch` against a 404, a refused connection and a redirected `POST`: what resolves, what rejects, what is sent? |
| [Q09.04](modules/09-web-networking-storage-security.md#q09-04) | Difference | `fetch` versus `XMLHttpRequest`: errors, credentials, streams, progress and cancellation |
| [Q09.05](modules/09-web-networking-storage-security.md#q09-05) | Output | Reading a `Response` twice, `clone()` and `Headers`: what does this print? |
| [Q09.06](modules/09-web-networking-storage-security.md#q09-06) | Bug hunt | A `fetch` helper that "works": find the missing `ok` check, the double read and the leaked request |
| [Q09.07](modules/09-web-networking-storage-security.md#q09-07) | Difference | HTTP/1.1, HTTP/2 and HTTP/3: where does head-of-line blocking live in each? |
| [Q09.08](modules/09-web-networking-storage-security.md#q09-08) | Trade-off | One bundle or many small chunks under HTTP/2 and HTTP/3? |
| [Q09.09](modules/09-web-networking-storage-security.md#q09-09) | Difference | `no-cache`, `no-store`, `max-age=0` and `must-revalidate` |
| [Q09.10](modules/09-web-networking-storage-security.md#q09-10) | Output | A conditional `GET` with a matching `ETag`: what does the client receive? |
| [Q09.11](modules/09-web-networking-storage-security.md#q09-11) | Design | Choose caching headers for `index.html`, hashed bundles and a JSON API |
| [Q09.12](modules/09-web-networking-storage-security.md#q09-12) | Concept | What does the same-origin policy block, what does CORS relax, and who enforces it? |
| [Q09.13](modules/09-web-networking-storage-security.md#q09-13) | Difference | Simple versus preflighted requests: what triggers a preflight and what does the preflight check? |
| [Q09.14](modules/09-web-networking-storage-security.md#q09-14) | Bug hunt | The API answers 200 but the browser reports a CORS error: list the causes |
| [Q09.15](modules/09-web-networking-storage-security.md#q09-15) | Concept | What do `Secure`, `HttpOnly`, `SameSite`, `Domain`/`Path` and `__Host-` each protect against? |
| [Q09.16](modules/09-web-networking-storage-security.md#q09-16) | Output | Setting cookies from script and from the server in jsdom: what does `document.cookie` show? |
| [Q09.17](modules/09-web-networking-storage-security.md#q09-17) | Difference | Same-origin versus same-site, `Lax` versus `Strict` versus `None`, third-party cookies and CHIPS |
| [Q09.18](modules/09-web-networking-storage-security.md#q09-18) | Trade-off | `localStorage`, `sessionStorage`, IndexedDB, Cache Storage or a cookie: what is each safe for? |
| [Q09.19](modules/09-web-networking-storage-security.md#q09-19) | Concept | How do nonces, hashes and `strict-dynamic` make a CSP effective, and why do allowlists fail? |
| [Q09.20](modules/09-web-networking-storage-security.md#q09-20) | Concept | What do Trusted Types add to a CSP, and what do they not cover? |
| [Q09.21](modules/09-web-networking-storage-security.md#q09-21) | Concept | Walk through the service worker lifecycle: why does the old worker keep controlling the page? |
| [Q09.22](modules/09-web-networking-storage-security.md#q09-22) | Trade-off | Cache-first, network-first or stale-while-revalidate: which strategy for which resource? |

### 10 · CSS essentials

| ID | Type | Question |
|---|---|---|
| [Q10.01](modules/10-css-essentials.md#q10-01) | Concept | What does `box-sizing` change, and why does almost every reset set `border-box`? |
| [Q10.02](modules/10-css-essentials.md#q10-02) | Concept | When do vertical margins collapse, and what stops it? |
| [Q10.03](modules/10-css-essentials.md#q10-03) | Concept | How does the browser pick one winner among conflicting declarations? |
| [Q10.04](modules/10-css-essentials.md#q10-04) | Output | Which colour wins: an id, a class, a later type rule, an inline style and `!important`? |
| [Q10.05](modules/10-css-essentials.md#q10-05) | Difference · Output | `:is()`, `:where()`, `:not()` and `:has()`: how does each count towards specificity, and what does each match? |
| [Q10.06](modules/10-css-essentials.md#q10-06) | Design | Design a cascade-layer structure so third-party styles and overrides stay predictable |
| [Q10.07](modules/10-css-essentials.md#q10-07) | Difference | Flexbox or Grid: which for what, and how do they nest? |
| [Q10.08](modules/10-css-essentials.md#q10-08) | Bug hunt | A long word makes a flex child overflow its container instead of truncating: why, and what is the fix? |
| [Q10.09](modules/10-css-essentials.md#q10-09) | Trade-off | Cards whose buttons must align across a row: `subgrid`, fixed heights or measuring in JavaScript? |
| [Q10.10](modules/10-css-essentials.md#q10-10) | Concept | What creates a stacking context, and why does `z-index: 9999` sometimes do nothing? |
| [Q10.11](modules/10-css-essentials.md#q10-11) | Bug hunt | A dropdown hides behind its sibling although its `z-index` is huge: find the stacking context |
| [Q10.12](modules/10-css-essentials.md#q10-12) | Difference | Media queries versus container queries: what does each measure and what does `container-type` cost? |
| [Q10.13](modules/10-css-essentials.md#q10-13) | Output | `rem`, `em` and `%` on nested elements: what are the computed font sizes? |
| [Q10.14](modules/10-css-essentials.md#q10-14) | Trade-off | Fluid type with `clamp()` or stepped breakpoints? |
| [Q10.15](modules/10-css-essentials.md#q10-15) | Difference | Custom properties versus Sass variables |
| [Q10.16](modules/10-css-essentials.md#q10-16) | Output | A custom property redefined on a subtree: what does each element read? |
| [Q10.17](modules/10-css-essentials.md#q10-17) | Design | Light and dark theming: `color-scheme`, `light-dark()`, `prefers-color-scheme`, a user toggle and no flash |
| [Q10.18](modules/10-css-essentials.md#q10-18) | Trade-off | Native nesting or Sass in a new Angular project? |

### 11 · Accessibility

| ID | Type | Question |
|---|---|---|
| [Q11.01](modules/11-accessibility.md#q11-01) | Concept | Who is accessibility for, and what do WCAG's four principles and three levels mean? |
| [Q11.02](modules/11-accessibility.md#q11-02) | Difference | WCAG, EN 301 549 and the European Accessibility Act: which is a standard, which a law, which a test? |
| [Q11.03](modules/11-accessibility.md#q11-03) | Concept | What does a native `<button>` give you that a `div` needs ARIA, `tabindex` and key handlers to imitate? |
| [Q11.04](modules/11-accessibility.md#q11-04) | Concept | What are landmarks and heading levels for, and how does a screen reader user use them? |
| [Q11.05](modules/11-accessibility.md#q11-05) | Concept | What do ARIA roles, states and properties do, and what can ARIA never do? |
| [Q11.06](modules/11-accessibility.md#q11-06) | Difference | `aria-hidden`, `hidden`, `display: none`, `visibility: hidden` and `inert`: what does each remove? |
| [Q11.07](modules/11-accessibility.md#q11-07) | Bug hunt | A custom dropdown "uses ARIA" and still fails: review this snippet |
| [Q11.08](modules/11-accessibility.md#q11-08) | Output | Which elements are focusable, what is `tabIndex`, and where does focus end up? |
| [Q11.09](modules/11-accessibility.md#q11-09) | Concept | What decides tab order, and why is a positive `tabindex` a problem? |
| [Q11.10](modules/11-accessibility.md#q11-10) | Design | Build a keyboard-operable toolbar or tab list: roving tabindex or `aria-activedescendant`? |
| [Q11.11](modules/11-accessibility.md#q11-11) | Trade-off | Native `<dialog>`, a hand-rolled focus trap or the CDK's `CdkTrapFocus`? |
| [Q11.12](modules/11-accessibility.md#q11-12) | Concept | Why does a single-page app need focus management after a route change? |
| [Q11.13](modules/11-accessibility.md#q11-13) | Design | Design the focus and announcement strategy for navigation, a closing dialog, a deleted item and a live search |
| [Q11.14](modules/11-accessibility.md#q11-14) | Difference · Output | `polite`, `assertive`, `role="status"` and `role="alert"`: what does an announcer write, and why clear first? |
| [Q11.15](modules/11-accessibility.md#q11-15) | Concept · Output | How is an accessible name chosen: `aria-labelledby`, `aria-label`, a label, content or `title`? |
| [Q11.16](modules/11-accessibility.md#q11-16) | Bug hunt | A sign-up form with placeholder labels and red error text: what is wrong, and what is the fix? |
| [Q11.17](modules/11-accessibility.md#q11-17) | Design | Design accessible error messaging: inline messages, a summary, focus and announcements |
| [Q11.18](modules/11-accessibility.md#q11-18) | Concept | What does an automated scan like axe or Lighthouse prove, and what can it never find? |
| [Q11.19](modules/11-accessibility.md#q11-19) | Trade-off | Where should accessibility checks live: lint, component tests, end-to-end, manual passes? |

## Part D · Angular

### 12 · How Angular works: compiler, runtime, CLI and build

| ID | Type | Question |
|---|---|---|
| [Q12.01](modules/12-angular-how-it-works.md#q12-01) | Concept | What does Angular decide for you that a library leaves to you, and what does "batteries included" mean in practice? |
| [Q12.02](modules/12-angular-how-it-works.md#q12-02) | Trade-off | An opinionated, integrated framework or a set of chosen libraries: when does each win for a team? |
| [Q12.03](modules/12-angular-how-it-works.md#q12-03) | Concept | What is in `angular.json`: projects, targets, builders and configurations? |
| [Q12.04](modules/12-angular-how-it-works.md#q12-04) | Difference | An application project and a library project in one workspace: what differs? |
| [Q12.05](modules/12-angular-how-it-works.md#q12-05) | Concept | What is a schematic, and what does `ng update` run besides changing versions? |
| [Q12.06](modules/12-angular-how-it-works.md#q12-06) | Concept | What happens between `ng build` and the files in `dist/`? |
| [Q12.07](modules/12-angular-how-it-works.md#q12-07) | Concept | What does `ngDevMode` guard, and what is missing from a production build that a development build has? |
| [Q12.08](modules/12-angular-how-it-works.md#q12-08) | Design | Set up bundle budgets for a growing app: which types, which thresholds, and what happens when one is exceeded? |
| [Q12.09](modules/12-angular-how-it-works.md#q12-09) | Trade-off | Your project still uses the webpack `browser` builder: migrate now or later, and how? |
| [Q12.10](modules/12-angular-how-it-works.md#q12-10) | Difference | `fileReplacements`, `define` and runtime configuration: when is each value fixed? |
| [Q12.11](modules/12-angular-how-it-works.md#q12-11) | Bug hunt | Review this environment setup: an API key, a `define` used in component metadata, and one image for all stages |
| [Q12.12](modules/12-angular-how-it-works.md#q12-12) | Concept | What does hot module replacement replace in an Angular dev server, and when does it fall back to a full reload? |
| [Q12.13](modules/12-angular-how-it-works.md#q12-13) | Concept | What can Angular DevTools show you, and why does it not work on a production build? |
| [Q12.14](modules/12-angular-how-it-works.md#q12-14) | Concept | Walk through what `bootstrapApplication` does, step by step |
| [Q12.15](modules/12-angular-how-it-works.md#q12-15) | Output | In what order do these lines log: the bootstrap call, an app initializer and the root component? |
| [Q12.16](modules/12-angular-how-it-works.md#q12-16) | Difference | `bootstrapApplication` versus `createApplication`: when do you need an application without a root component? |
| [Q12.17](modules/12-angular-how-it-works.md#q12-17) | Difference | `APP_INITIALIZER` versus `provideAppInitializer` (and the environment and platform initializers) |
| [Q12.18](modules/12-angular-how-it-works.md#q12-18) | Bug hunt · Output | The app shows a blank page after a config server outage. What happened, and what does the bootstrap promise do? |
| [Q12.19](modules/12-angular-how-it-works.md#q12-19) | Difference | AOT versus JIT: what each does, and where JIT is still used in v22 |
| [Q12.20](modules/12-angular-how-it-works.md#q12-20) | Concept | What does `strictTemplates` check that basic type checking does not? |
| [Q12.21](modules/12-angular-how-it-works.md#q12-21) | Concept | What are extended diagnostics, and how do you make one fail the build? |
| [Q12.22](modules/12-angular-how-it-works.md#q12-22) | Trade-off | v22 turns `strictTemplates` on by default, and `ng update` turns it off for your old app. Leave it off or fix the errors? |
| [Q12.23](modules/12-angular-how-it-works.md#q12-23) | Concept | What does the compiler turn a template into? |
| [Q12.24](modules/12-angular-how-it-works.md#q12-24) | Output | What does the definition of this component report: selectors, inputs, `decls`, `vars`, `onPush`? |
| [Q12.25](modules/12-angular-how-it-works.md#q12-25) | Concept | What do the `ɵ` and `ɵɵ` prefixes mean, and why should application code read `reflectComponentType` instead of `ɵcmp`? |
| [Q12.26](modules/12-angular-how-it-works.md#q12-26) | Concept | What is Ivy's locality principle, and what did it make possible? |
| [Q12.27](modules/12-angular-how-it-works.md#q12-27) | Difference | Instruction-based rendering versus a virtual DOM: what does each do on an update? |
| [Q12.28](modules/12-angular-how-it-works.md#q12-28) | Concept | Why do libraries on npm ship `ɵɵngDeclareComponent`, and what does the linker do? |

### 13 · Components and templates: bindings, the host element and view encapsulation

| ID | Type | Question |
|---|---|---|
| [Q13.01](modules/13-components-and-templates.md#q13-01) | Concept | What is a component made of in v22, and which files does `ng generate component user-card` create? |
| [Q13.02](modules/13-components-and-templates.md#q13-02) | Difference | Element, attribute or class selector for a component: when does each fit? |
| [Q13.03](modules/13-components-and-templates.md#q13-03) | Bug hunt | A component with the selector `button[lab-primary]` never shows up in `<button lab-primary>` and the compiler is silent. Why, and how would you find out? |
| [Q13.04](modules/13-components-and-templates.md#q13-04) | Concept | What can a template expression contain, and why does `{{ count++ }}` not compile? |
| [Q13.05](modules/13-components-and-templates.md#q13-05) | Output | What does each interpolation render: `null`, `undefined`, `0`, `false`, an array, an object? |
| [Q13.06](modules/13-components-and-templates.md#q13-06) | Output | What does this template render? (`**`, `in`, `typeof`, `void`, a template literal) |
| [Q13.07](modules/13-components-and-templates.md#q13-07) | Output | Optional chaining on a nullish value in v22: what do these comparisons print? |
| [Q13.08](modules/13-components-and-templates.md#q13-08) | Concept | What do `?.`, `!` and `$any()` each do to the type checker and to the running code? |
| [Q13.09](modules/13-components-and-templates.md#q13-09) | Bug hunt | `{{ user!.name }}` still throws "Cannot read properties of null". What is wrong, and what do you write? |
| [Q13.10](modules/13-components-and-templates.md#q13-10) | Difference | `[title]`, `[attr.title]` and `title="{{ x }}"`: what does each set? |
| [Q13.11](modules/13-components-and-templates.md#q13-11) | Output | What ends up in the DOM when `[title]` and `[attr.title]` receive `undefined`, `null` and `''`? |
| [Q13.12](modules/13-components-and-templates.md#q13-12) | Concept | How do static `class`, `[class]` and `[class.x]` combine, and what are the style equivalents? |
| [Q13.13](modules/13-components-and-templates.md#q13-13) | Bug hunt · Output | A `[class]` object is mutated in place and the DOM does not change. What does it show after each step? |
| [Q13.14](modules/13-components-and-templates.md#q13-14) | Concept | How does event binding work: `$event`, key filters, global targets and `preventDefault`? |
| [Q13.15](modules/13-components-and-templates.md#q13-15) | Output | Which handlers run for Enter, Shift+Enter and the A key? |
| [Q13.16](modules/13-components-and-templates.md#q13-16) | Concept | What does `[(count)]` desugar to, and what must the child provide? |
| [Q13.17](modules/13-components-and-templates.md#q13-17) | Bug hunt | This two-way binding does not compile, or compiles and does nothing. Find the mistakes. |
| [Q13.18](modules/13-components-and-templates.md#q13-18) | Concept | What can a template reference variable refer to, and where is it visible? |
| [Q13.19](modules/13-components-and-templates.md#q13-19) | Difference | `@let`, a template reference variable and a `computed`: which for what? |
| [Q13.20](modules/13-components-and-templates.md#q13-20) | Bug hunt | Why does `{{ inner.value }}` outside an `@if` fail, and what other scope mistakes do `@let` and references invite? |
| [Q13.21](modules/13-components-and-templates.md#q13-21) | Difference | `host` metadata versus `@HostBinding` and `@HostListener`: what differs, and which do you write in v22? |
| [Q13.22](modules/13-components-and-templates.md#q13-22) | Output | The parent and the component's `host` bind the same attribute, class and style. What ends up on the element? |
| [Q13.23](modules/13-components-and-templates.md#q13-23) | Trade-off | A custom control: `role`, `tabindex` and key handlers on the host, or an attribute-selector component on a native `<button>`? |
| [Q13.24](modules/13-components-and-templates.md#q13-24) | Concept | Where can a component's styles come from, and where does each source end up in the page? |
| [Q13.25](modules/13-components-and-templates.md#q13-25) | Design | Design a themeable component: which custom properties are its public styling API, and what crosses the encapsulation boundary? |
| [Q13.26](modules/13-components-and-templates.md#q13-26) | Trade-off | Tailwind utilities in templates, component styles, or both? |
| [Q13.27](modules/13-components-and-templates.md#q13-27) | Concept | What do Emulated, ShadowDom and None encapsulation each do to the DOM and to the CSS? |
| [Q13.28](modules/13-components-and-templates.md#q13-28) | Output | One component uses `ViewEncapsulation.None`. Which `h2` elements are styled, and what happens when it is destroyed? |
| [Q13.29](modules/13-components-and-templates.md#q13-29) | Difference | `:host`, `:host-context()` and `::ng-deep`: what does the compiler turn each into, and which selectors silently match nothing? |
| [Q13.30](modules/13-components-and-templates.md#q13-30) | Difference | Emulated encapsulation versus real Shadow DOM: what changes for styles, events, slots, global CSS and tooling? |

### 14 · Directives and pipes: attribute and structural directives, host directives, pipes and the async pipe

| ID | Type | Question |
|---|---|---|
| [Q14.01](modules/14-directives-and-pipes.md#q14-01) | Concept | What is a directive, which kinds exist, and when do you write one instead of a binding or a component? |
| [Q14.02](modules/14-directives-and-pipes.md#q14-02) | Difference | `host` metadata, `ElementRef.nativeElement` and `Renderer2` in a directive: when does each fit, and why not touch the DOM directly? |
| [Q14.03](modules/14-directives-and-pipes.md#q14-03) | Output | What does `nativeElement` hold when the same directive sits on a `<div>`, an `<ng-template>` and an `<ng-container>`? |
| [Q14.04](modules/14-directives-and-pipes.md#q14-04) | Bug hunt · Output | A directive sets `el.style.color = 'red'` in its constructor, yet the text is blue. What does the DOM show at each step, and how do you fix it? |
| [Q14.05](modules/14-directives-and-pipes.md#q14-05) | Concept | What does `*` expand to, and how does the microsyntax `*dir="expr; let x = y; key: expr2"` map to inputs and variables? |
| [Q14.06](modules/14-directives-and-pipes.md#q14-06) | Design | Write a structural directive that renders its template only for an allowed role. What do `TemplateRef` and `ViewContainerRef` each do? |
| [Q14.07](modules/14-directives-and-pipes.md#q14-07) | Bug hunt | Two `*` directives on one element, a `let` variable typed `any`, a structural directive that silently does nothing: find the three problems. |
| [Q14.08](modules/14-directives-and-pipes.md#q14-08) | Concept | What do `ngTemplateContextGuard` and `ngTemplateGuard_x` change, and does the guard body ever run? |
| [Q14.09](modules/14-directives-and-pipes.md#q14-09) | Concept | What does `hostDirectives` do, what constraints apply, and how do you expose and alias inputs and outputs? |
| [Q14.10](modules/14-directives-and-pipes.md#q14-10) | Output | In what order do constructors, `ngOnInit` and host bindings run for a component and its host directive, and who wins a conflict? |
| [Q14.11](modules/14-directives-and-pipes.md#q14-11) | Trade-off | Host directives, inheritance or applying the directive in the template: which for a reusable behavior? |
| [Q14.12](modules/14-directives-and-pipes.md#q14-12) | Bug hunt | These host-directive declarations do not compile (`NG2017`, `NG2014`, `NG2019`, `NG8024`). Why? |
| [Q14.13](modules/14-directives-and-pipes.md#q14-13) | Trade-off | `NgClass` and `NgStyle` or `[class]` and `[style]` bindings in v22? |
| [Q14.14](modules/14-directives-and-pipes.md#q14-14) | Concept | How do `NgTemplateOutlet` and `NgComponentOutlet` render, and what do context, injector and inputs do? |
| [Q14.15](modules/14-directives-and-pipes.md#q14-15) | Output | A dashboard renders a widget with `ngComponentOutlet` and an inputs object. What does the widget show when a key disappears from the object? |
| [Q14.16](modules/14-directives-and-pipes.md#q14-16) | Concept | Why did built-in control flow replace `*ngIf`, `*ngFor` and `*ngSwitch`, and what do you do with a code base full of them? |
| [Q14.17](modules/14-directives-and-pipes.md#q14-17) | Concept | What is a pure pipe, how does it differ from an impure one, and how many instances does a pipe have? |
| [Q14.18](modules/14-directives-and-pipes.md#q14-18) | Output | How many times does `transform` (or the method, or the computed) run after an unrelated change, an in-place push and a replaced array? |
| [Q14.19](modules/14-directives-and-pipes.md#q14-19) | Design | Write a custom pipe that needs an injected dependency, and decide where its logic should live. |
| [Q14.20](modules/14-directives-and-pipes.md#q14-20) | Bug hunt · Output | An arrow function passed to a pure pipe reads a signal, and the result never updates. Why, and what does the DOM show? |
| [Q14.21](modules/14-directives-and-pipes.md#q14-21) | Concept | Which built-in pipes exist, which are impure, and where does the formatting data come from? |
| [Q14.22](modules/14-directives-and-pipes.md#q14-22) | Output | What do these `date`, `currency`, `number`, `percent`, `keyvalue` and `i18nPlural` expressions render? |
| [Q14.23](modules/14-directives-and-pipes.md#q14-23) | Bug hunt | A `de` locale crashes with `NG0701`, `en-GB` still prints US dates, and an invalid string throws. Why? |
| [Q14.24](modules/14-directives-and-pipes.md#q14-24) | Trade-off | Pipe, `computed` or method call in the template: which for formatting, filtering and derived state? |
| [Q14.25](modules/14-directives-and-pipes.md#q14-25) | Difference · Output | Does an impure pipe run on every key press anywhere, and how does it differ from a method call in an OnPush app? |
| [Q14.26](modules/14-directives-and-pipes.md#q14-26) | Concept | What does the `async` pipe do on first value, new value, new source, error and destroy? |
| [Q14.27](modules/14-directives-and-pipes.md#q14-27) | Output | Three async pipes over one cold source, then the source is swapped: how many subscriptions and unsubscriptions? |
| [Q14.28](modules/14-directives-and-pipes.md#q14-28) | Bug hunt | A signal passed to `async` fails, and a stream error leaves the view blank. What is wrong, and what changed in v20? |

### 15 · Standalone and NgModules: `imports`, providers without modules, lazy loading, legacy NgModules, interop and migration

| ID | Type | Question |
|---|---|---|
| [Q15.01](modules/15-standalone-and-ngmodules.md#q15-01) | Concept | What did an NgModule do, and which of those jobs moved where in a standalone app? |
| [Q15.02](modules/15-standalone-and-ngmodules.md#q15-02) | Bug hunt | A component declared in `FeatureModule` is "not a known element" in another module, and a second module declares it too. What is wrong? |
| [Q15.03](modules/15-standalone-and-ngmodules.md#q15-03) | Concept | What can a standalone component's `imports` list, and what does the compiler say about each wrong entry? |
| [Q15.04](modules/15-standalone-and-ngmodules.md#q15-04) | Difference · Output | `standalone: true`, the default and `standalone: false`: what changed in v19, and what does `isStandalone` report? |
| [Q15.05](modules/15-standalone-and-ngmodules.md#q15-05) | Bug hunt | Four decorator mistakes after the v19 default flip: which compile, and what does `ngc` report? |
| [Q15.06](modules/15-standalone-and-ngmodules.md#q15-06) | Difference | `bootstrapApplication` with an `ApplicationConfig` versus `bootstrapModule` with an `AppModule`: what moves where? |
| [Q15.07](modules/15-standalone-and-ngmodules.md#q15-07) | Concept | What does `importProvidersFrom` do, where is it allowed, and what does it run eagerly? |
| [Q15.08](modules/15-standalone-and-ngmodules.md#q15-08) | Output | When do a module's constructor and its service's constructor run under `importProvidersFrom`? |
| [Q15.09](modules/15-standalone-and-ngmodules.md#q15-09) | Difference | `RouterModule.forRoot` versus `provideRouter`, and `HttpClientModule` versus `provideHttpClient`: what is the same, and what changed? |
| [Q15.10](modules/15-standalone-and-ngmodules.md#q15-10) | Concept | How do you lazy load a feature without an NgModule, and what does a route with `providers` add? |
| [Q15.11](modules/15-standalone-and-ngmodules.md#q15-11) | Bug hunt | A lazy route points `loadComponent` at an NgModule and another points `loadChildren` at a component. What fails, and how do you read the errors? |
| [Q15.12](modules/15-standalone-and-ngmodules.md#q15-12) | Concept | What are `forRoot`, `forChild` and `ModuleWithProviders`, and why must `forRoot` be imported only once? |
| [Q15.13](modules/15-standalone-and-ngmodules.md#q15-13) | Output | A `SharedModule` with a provider is imported by two lazy modules, and by two modules into one injector: how many instances? |
| [Q15.14](modules/15-standalone-and-ngmodules.md#q15-14) | Bug hunt | Review this `SharedModule` and `CoreModule`: which parts are anti-patterns, and why? |
| [Q15.15](modules/15-standalone-and-ngmodules.md#q15-15) | Design | Retire a `CoreModule` and a `SharedModule`: where does each provider, component and re-export go in a standalone app? |
| [Q15.16](modules/15-standalone-and-ngmodules.md#q15-16) | Concept | A standalone component imports an NgModule-based library: what happens to the library's declarations and to its providers? |
| [Q15.17](modules/15-standalone-and-ngmodules.md#q15-17) | Output | Two instances of a standalone component import a module with a provider: which service instance does each get, and can the root inject it? |
| [Q15.18](modules/15-standalone-and-ngmodules.md#q15-18) | Concept | How does an NgModule-based app use a standalone component, directive or pipe? |
| [Q15.19](modules/15-standalone-and-ngmodules.md#q15-19) | Trade-off | A component library: ship NgModules, standalone pieces with `provide*` functions, or both? |
| [Q15.20](modules/15-standalone-and-ngmodules.md#q15-20) | Concept | What do the three passes of `ng generate @angular/core:standalone` do, and why in that order? |
| [Q15.21](modules/15-standalone-and-ngmodules.md#q15-21) | Bug hunt | After the migration the tests fail: a standalone class in `declarations` and a spec importing a deleted module. Why? |
| [Q15.22](modules/15-standalone-and-ngmodules.md#q15-22) | Trade-off | Migrate a large NgModule app in one go or folder by folder with `--path`, and how long do you stay hybrid? |
| [Q15.23](modules/15-standalone-and-ngmodules.md#q15-23) | Design | Finish what the schematic leaves: `RouterModule.forRoot`, lazy NgModules, `HttpClientModule` and `CommonModule`. |
| [Q15.24](modules/15-standalone-and-ngmodules.md#q15-24) | Concept | What does the compiler emit for an NgModule and for a component it declares, and why can a standalone component compile on its own? |
| [Q15.25](modules/15-standalone-and-ngmodules.md#q15-25) | Concept | How does the runtime give a standalone component the providers of the NgModules it imports? |

### 16 · Dependency injection: providers, `@Service`, injection context, the injector tree and lifetime

| ID | Type | Question |
|---|---|---|
| [Q16.01](modules/16-dependency-injection.md#q16-01) | Concept | What does dependency injection give you over `new`, and what does an injector actually do? |
| [Q16.02](modules/16-dependency-injection.md#q16-02) | Difference | Constructor injection or `inject()`: what is the same and what differs in v22? |
| [Q16.03](modules/16-dependency-injection.md#q16-03) | Trade-off | Hand-wired factories or a DI container: when does the container pay for itself? |
| [Q16.04](modules/16-dependency-injection.md#q16-04) | Concept | What are the four provider recipes, and what does each do to instance identity? |
| [Q16.05](modules/16-dependency-injection.md#q16-05) | Output | `useExisting` and `useClass` for the same target: how many instances, and which are the same? |
| [Q16.06](modules/16-dependency-injection.md#q16-06) | Bug hunt | Two providers for one token, and a multi provider mixed with a regular one: what happens? |
| [Q16.07](modules/16-dependency-injection.md#q16-07) | Concept | What do `providedIn: 'root'`, `'platform'` and the deprecated forms mean, and what is tree-shaking here? |
| [Q16.08](modules/16-dependency-injection.md#q16-08) | Concept | What is `@Service`, what does it forbid, and what does it compile to? |
| [Q16.09](modules/16-dependency-injection.md#q16-09) | Trade-off | `@Service` or `@Injectable({ providedIn: 'root' })` for new code, and what do you do with the old classes? |
| [Q16.10](modules/16-dependency-injection.md#q16-10) | Bug hunt | `NG0201: No provider found`: three causes and how to read the message. |
| [Q16.11](modules/16-dependency-injection.md#q16-11) | Concept | What is an injection context and where does one exist? |
| [Q16.12](modules/16-dependency-injection.md#q16-12) | Bug hunt | `inject()` works in a field and throws in `ngOnInit` and in a click handler. Why, and what are the fixes? |
| [Q16.13](modules/16-dependency-injection.md#q16-13) | Design | Write an `injectX()` helper that fails clearly outside an injection context, and run it with a captured injector. |
| [Q16.14](modules/16-dependency-injection.md#q16-14) | Concept | What does `injectAsync` do, and how often does it load and create promises? |
| [Q16.15](modules/16-dependency-injection.md#q16-15) | Concept | Describe the injector hierarchy and the resolution algorithm, from an element up to `NullInjector`. |
| [Q16.16](modules/16-dependency-injection.md#q16-16) | Output | Two sibling routes provide the same service, and one route is visited twice: what are the instance identities? |
| [Q16.17](modules/16-dependency-injection.md#q16-17) | Output | What do `optional`, `self`, `skipSelf` and `host` return at each level of this component tree? |
| [Q16.18](modules/16-dependency-injection.md#q16-18) | Bug hunt | A service provided in one lazy route cannot be injected elsewhere, and a root service cannot be read from the platform injector. Why? |
| [Q16.19](modules/16-dependency-injection.md#q16-19) | Difference | `providers` or `viewProviders`: who can see what? |
| [Q16.20](modules/16-dependency-injection.md#q16-20) | Output | A component with `providers` and `viewProviders` has a projected directive and a view directive: what does each inject? |
| [Q16.21](modules/16-dependency-injection.md#q16-21) | Design | Give every instance of a component its own state through DI, and say when to prefer a signal. |
| [Q16.22](modules/16-dependency-injection.md#q16-22) | Concept | How do `HostAttributeToken` and `HOST_TAG_NAME` read the host without touching the DOM? |
| [Q16.23](modules/16-dependency-injection.md#q16-23) | Concept | When do you need an `InjectionToken`, and what does a factory on it change? |
| [Q16.24](modules/16-dependency-injection.md#q16-24) | Concept | What does `multi: true` do, and where is it used in Angular? |
| [Q16.25](modules/16-dependency-injection.md#q16-25) | Difference | `provideEnvironmentInitializer`, `ENVIRONMENT_INITIALIZER` and `provideAppInitializer`: how do they differ? |
| [Q16.26](modules/16-dependency-injection.md#q16-26) | Bug hunt | `provideX()` placed in a component's `providers` fails with `NG0207`. Why, and what is `EnvironmentProviders`? |
| [Q16.27](modules/16-dependency-injection.md#q16-27) | Concept | What does `DestroyRef` do, and whose lifetime does it mean in a component, a directive and a root service? |
| [Q16.28](modules/16-dependency-injection.md#q16-28) | Output | An environment injector is destroyed: which `ngOnDestroy` calls run, in what order, and what does `get` do afterwards? |
| [Q16.29](modules/16-dependency-injection.md#q16-29) | Design | Create an environment injector at run time for a feature and tear it down; when is `Injector.create` enough? |
| [Q16.30](modules/16-dependency-injection.md#q16-30) | Concept | What does `forwardRef` solve, and what does the compiler say without it? |
| [Q16.31](modules/16-dependency-injection.md#q16-31) | Bug hunt | Two services inject each other and the app throws `NG0200`. How do you read the path and break the cycle? |
| [Q16.32](modules/16-dependency-injection.md#q16-32) | Design | Choose an implementation per environment with a token (a strategy), and justify the shape. |
| [Q16.33](modules/16-dependency-injection.md#q16-33) | Design | Design a `provideBilling(config)` function for a library, and what it should return. |
| [Q16.34](modules/16-dependency-injection.md#q16-34) | Output | In a test, module providers, `overrideProvider` and `overrideComponent` replace a service: which replacements take effect? |
| [Q16.35](modules/16-dependency-injection.md#q16-35) | Difference | Angular DI versus the Spring container: scopes, proxies, scanning and constructor injection. |
| [Q16.36](modules/16-dependency-injection.md#q16-36) | Concept | Map the DI error codes (`NG0200` to `NG0207`) to causes and fixes. |

### 17 · Signals

| ID | Type | Question |
|---|---|---|
| [Q17.01](modules/17-signals.md#q17-01) | Concept | What is a signal, and what problem does it solve in Angular? |
| [Q17.02](modules/17-signals.md#q17-02) | Difference · Output | In a zoneless app with OnPush components (the v22 default), what happens when a timer changes a plain class field versus a signal shown in the template? |
| [Q17.03](modules/17-signals.md#q17-03) | Concept | Early signals had a `mutate` method. Why was it removed, and what do you write instead? |
| [Q17.04](modules/17-signals.md#q17-04) | Output | What does this print? |
| [Q17.05](modules/17-signals.md#q17-05) | Design | How do you expose state from a service so that components can read it but not change it? |
| [Q17.06](modules/17-signals.md#q17-06) | Output | What does this print? |
| [Q17.07](modules/17-signals.md#q17-07) | Difference | What is the difference between a `computed` and a method called from the template? |
| [Q17.08](modules/17-signals.md#q17-08) | Bug hunt | What is wrong with this code? |
| [Q17.09](modules/17-signals.md#q17-09) | Output | What does this print, and how many times does the computation run? |
| [Q17.10](modules/17-signals.md#q17-10) | Output | With a custom equality function, what does this print? |
| [Q17.11](modules/17-signals.md#q17-11) | Output | What does this print? (dynamic dependencies and `untracked`) |
| [Q17.12](modules/17-signals.md#q17-12) | Concept | What is an `effect`, and what is it for? |
| [Q17.13](modules/17-signals.md#q17-13) | Output | What does the effect log? |
| [Q17.14](modules/17-signals.md#q17-14) | Difference | How do component effects and root effects differ in timing? What does this log? |
| [Q17.15](modules/17-signals.md#q17-15) | Bug hunt | A teammate wrote this to keep a filtered list in sync. What is wrong, and what would you write instead? |
| [Q17.16](modules/17-signals.md#q17-16) | Bug hunt | Why does this throw, and what are three ways to fix it? |
| [Q17.17](modules/17-signals.md#q17-17) | Output | What does this effect log? |
| [Q17.18](modules/17-signals.md#q17-18) | Output | What happens when an effect writes a signal it reads? |
| [Q17.19](modules/17-signals.md#q17-19) | Difference | What is the difference between `computed` and `linkedSignal`? |
| [Q17.20](modules/17-signals.md#q17-20) | Output | What does this print? |
| [Q17.21](modules/17-signals.md#q17-21) | Design | An edit form shows the selected customer. Users edit a draft, and selecting another customer must discard the draft. How do you model the draft? |
| [Q17.22](modules/17-signals.md#q17-22) | Concept | What is a `resource`, and what states can it be in? |
| [Q17.23](modules/17-signals.md#q17-23) | Output | What does this log? (resource, race and statuses) |
| [Q17.24](modules/17-signals.md#q17-24) | Output | A resource has `defaultValue: []`. What do these reads produce? |
| [Q17.25](modules/17-signals.md#q17-25) | Bug hunt | What is wrong with saving like this? |
| [Q17.26](modules/17-signals.md#q17-26) | Difference | What is the difference between `resource`, `rxResource` and `httpResource`? |
| [Q17.27](modules/17-signals.md#q17-27) | Concept | How do signal inputs work, and what do they give you over `@Input()`? |
| [Q17.28](modules/17-signals.md#q17-28) | Bug hunt | Why does this component fail to compile? |
| [Q17.29](modules/17-signals.md#q17-29) | Output | A child declares `value = model(0)` and the parent binds `[(value)]="count"` with `count = signal(5)`. What do these reads print? |
| [Q17.30](modules/17-signals.md#q17-30) | Difference | How does `output()` differ from `@Output() … = new EventEmitter()`? |
| [Q17.31](modules/17-signals.md#q17-31) | Concept | How do signal queries (`viewChild`, `contentChildren`…) change the way you access child elements? |
| [Q17.32](modules/17-signals.md#q17-32) | Bug hunt | The template shows strange text instead of the count. What is wrong? |
| [Q17.33](modules/17-signals.md#q17-33) | Concept | Explain the "push-dirty, pull-value" algorithm behind Angular signals. |
| [Q17.34](modules/17-signals.md#q17-34) | Output | What does this print? (the diamond) |
| [Q17.35](modules/17-signals.md#q17-35) | Output | Which effects run? (versions and the equality cutoff) |
| [Q17.36](modules/17-signals.md#q17-36) | Concept | Why don't computed signals leak memory even though nobody unsubscribes from them? |
| [Q17.37](modules/17-signals.md#q17-37) | Output | What does this print? (`toSignal` before the first value, and after an error) |
| [Q17.38](modules/17-signals.md#q17-38) | Concept | "Angular signals are the new JavaScript signals." Correct the statement. |
| [Q17.39](modules/17-signals.md#q17-39) | Design | A grid must choose its column count from its own rendered width, and update when its items change. Why `afterRenderEffect` with phases rather than `effect`? |
| [Q17.40](modules/17-signals.md#q17-40) | Trade-off | Your large codebase has dozens of `BehaviorSubject` services consumed with the `async` pipe. Should you migrate them to signals, and how? |

### 18 · Control flow and `@defer`: `@if`, `@for`, `@switch`, `@let`, deferrable views, triggers and migration

| ID | Type | Question |
|---|---|---|
| [Q18.01](modules/18-control-flow-and-defer.md#q18-01) | Concept | What are the built-in control flow blocks, and what do they change compared with `*ngIf`, `*ngFor` and `*ngSwitch`? |
| [Q18.02](modules/18-control-flow-and-defer.md#q18-02) | Output | Which of these `@if` conditions render: `[]`, `'0'`, `{}`, `0`, `''`, `NaN`? |
| [Q18.03](modules/18-control-flow-and-defer.md#q18-03) | Concept | What does `as` do on `@if`, why does `@if (user(); as u)` narrow when `@if (user()) { user().name }` does not, and where is `u` visible? |
| [Q18.04](modules/18-control-flow-and-defer.md#q18-04) | Concept | Why is `track` mandatory in `@for`, what may the expression use, and what can `@for` iterate? |
| [Q18.05](modules/18-control-flow-and-defer.md#q18-05) | Output | The list is replaced by new objects with the same ids: which DOM nodes survive under `track item`, `track item.id` and `track $index`? |
| [Q18.06](modules/18-control-flow-and-defer.md#q18-06) | Output | What do `$index`, `$count`, `$first`, `$last`, `$even`, `$odd` and `@empty` give, and what does a nested `@for` with aliases print? |
| [Q18.07](modules/18-control-flow-and-defer.md#q18-07) | Bug hunt | Review this `@for`: `track $index` on an editable list, an uninvoked track function and duplicate keys. What goes wrong? |
| [Q18.08](modules/18-control-flow-and-defer.md#q18-08) | Output | In a `@switch`, which case renders for `1`, `'1'` and an unmatched value, and does a case fall through? |
| [Q18.09](modules/18-control-flow-and-defer.md#q18-09) | Concept | How does `@default never` check exhaustiveness, and why does a signal in `@switch` break it? |
| [Q18.10](modules/18-control-flow-and-defer.md#q18-10) | Difference | What does a `@let` give inside `@if`, `@for` and `@defer`, compared with a template reference variable and a `computed`? |
| [Q18.11](modules/18-control-flow-and-defer.md#q18-11) | Concept | What are the states of a `@defer` block, what happens when the load fails, and what is `NG0750`? |
| [Q18.12](modules/18-control-flow-and-defer.md#q18-12) | Output | A `@defer` with `@loading (after 40ms; minimum 100ms)` and a 120 ms load: what does the user see over time, and what if the load takes 20 ms? |
| [Q18.13](modules/18-control-flow-and-defer.md#q18-13) | Difference | `idle`, `viewport`, `interaction`, `hover`, `immediate`, `timer` and `when`: what fires each, and what is the default? |
| [Q18.14](modules/18-control-flow-and-defer.md#q18-14) | Bug hunt | A `@defer (on viewport)` never loads, another has a two-element placeholder, another references a missing element. Which diagnostic does each give? |
| [Q18.15](modules/18-control-flow-and-defer.md#q18-15) | Difference | `prefetch on …` versus the main trigger: what does each change, and what does `NG8021` warn about? |
| [Q18.16](modules/18-control-flow-and-defer.md#q18-16) | Design | Choose triggers and prefetching for a chart, a modal and a below-the-fold comments section. |
| [Q18.17](modules/18-control-flow-and-defer.md#q18-17) | Concept | When is a `@defer` dependency deferrable, and how does the compiler turn it into a lazy chunk? |
| [Q18.18](modules/18-control-flow-and-defer.md#q18-18) | Bug hunt | `@defer` produced no lazy chunk: a `viewChild`, a use outside the block, an NgModule component and a barrel file. Which makes the dependency eager? |
| [Q18.19](modules/18-control-flow-and-defer.md#q18-19) | Concept | How do you test a component with `@defer`: `DeferBlockBehavior`, `getDeferBlocks` and `render`? |
| [Q18.20](modules/18-control-flow-and-defer.md#q18-20) | Concept | What does `@defer` do on the server, and what is `hydrate on`? |
| [Q18.21](modules/18-control-flow-and-defer.md#q18-21) | Concept | What does `ng generate @angular/core:control-flow` rewrite, what does it leave, and what changes in the TS file? |
| [Q18.22](modules/18-control-flow-and-defer.md#q18-22) | Difference · Output | An item's id changes in place: is the row kept under `*ngFor` with `trackBy` and under `@for` with `track item.id`? |
| [Q18.23](modules/18-control-flow-and-defer.md#q18-23) | Trade-off | Migrate a large app in one run or folder by folder with `--path`, and what do you review after each run? |
| [Q18.24](modules/18-control-flow-and-defer.md#q18-24) | Concept · Output | What do `@if` and `@else` compile to, and why does an alias change not recreate the branch? |
| [Q18.25](modules/18-control-flow-and-defer.md#q18-25) | Concept | How does `@for` decide which rows to keep, move, create or destroy? |
| [Q18.26](modules/18-control-flow-and-defer.md#q18-26) | Concept | How does a `@defer` block move between states, and how do `minimum` and `after` fit in? |

### 19 · Component communication and projection: inputs, outputs, `ng-content`, `ng-template`, queries and dynamic components

| ID | Type | Question |
|---|---|---|
| [Q19.01](modules/19-component-communication-and-projection.md#q19-01) | Concept | How does data flow between a parent and a child component, and who owns the state with `input()`, `output()` and `model()`? |
| [Q19.02](modules/19-component-communication-and-projection.md#q19-02) | Bug hunt | Review this parent template: a missing required input, a misspelled input and a wrongly typed binding. What does the compiler say about each? |
| [Q19.03](modules/19-component-communication-and-projection.md#q19-03) | Output | A child emits an output in its constructor and again in `ngOnInit`, and reads an input in both. Which emissions does the parent receive, and what does the child read? |
| [Q19.04](modules/19-component-communication-and-projection.md#q19-04) | Trade-off | `model()` or `input()` plus `output()`: who owns the state, and when does each win? |
| [Q19.05](modules/19-component-communication-and-projection.md#q19-05) | Bug hunt · Output | Two sibling components receive the same object and one mutates it. What does each show, and what are the fixes? |
| [Q19.06](modules/19-component-communication-and-projection.md#q19-06) | Trade-off | Two siblings must stay in sync: lift the state to the parent, share a service with signals, or use a `Subject` as an event bus? |
| [Q19.07](modules/19-component-communication-and-projection.md#q19-07) | Bug hunt | A shared service is listed in a component's `providers`, so the sibling never sees the change; elsewhere a child reaches its parent with `inject(Parent)`. What goes wrong, and when is each fine? |
| [Q19.08](modules/19-component-communication-and-projection.md#q19-08) | Concept | What does `ng-content` do, and how do `select`, the default slot and fallback content decide where nodes go? |
| [Q19.09](modules/19-component-communication-and-projection.md#q19-09) | Output | Which element lands in which slot when two slots share a `select`, a node is loose, `ngProjectAs` is used, nothing is projected and an `@if` is false? |
| [Q19.10](modules/19-component-communication-and-projection.md#q19-10) | Output | A projected component sits behind an `<ng-content>` that an `@if` hides. How many times is it constructed, and what does toggling do? |
| [Q19.11](modules/19-component-communication-and-projection.md#q19-11) | Bug hunt | An `@if` with two projectable elements lands in the wrong slot and `NG8011` warns. Why, and what are the three fixes? |
| [Q19.12](modules/19-component-communication-and-projection.md#q19-12) | Difference | Projected content versus content in the component's own template: who owns its injector, its change detection and its checks? |
| [Q19.13](modules/19-component-communication-and-projection.md#q19-13) | Design | Design a table component whose callers supply a cell template per column, with a typed row. |
| [Q19.14](modules/19-component-communication-and-projection.md#q19-14) | Output | A template is declared in the parent and rendered inside the table: which component's fields do its expressions read, and what does `context` add? |
| [Q19.15](modules/19-component-communication-and-projection.md#q19-15) | Output · Bug hunt | `<ng-content />` sits inside an `<ng-template>` that is rendered twice. Where does the projected content go? |
| [Q19.16](modules/19-component-communication-and-projection.md#q19-16) | Trade-off | `ng-content`, a template input or a component input: which API for a customizable part of a component? |
| [Q19.17](modules/19-component-communication-and-projection.md#q19-17) | Difference | View queries versus content queries: what does each see, and what stays out of reach? |
| [Q19.18](modules/19-component-communication-and-projection.md#q19-18) | Output | How many results do `contentChild`, `contentChildren` and `contentChildren` with `descendants: true` find? |
| [Q19.19](modules/19-component-communication-and-projection.md#q19-19) | Concept | What does the `read` option return from a query: `ElementRef`, `TemplateRef`, `ViewContainerRef` and `Injector`? |
| [Q19.20](modules/19-component-communication-and-projection.md#q19-20) | Bug hunt | Three query mistakes: reading in the constructor, `viewChild.required` behind an `@if`, and a query that finds nothing. What does each do? |
| [Q19.21](modules/19-component-communication-and-projection.md#q19-21) | Output | In which hook is each query result available: a signal query, `@ViewChild` with and without `static`, and `@ContentChild`? |
| [Q19.22](modules/19-component-communication-and-projection.md#q19-22) | Difference | `@Input` setters and `ngOnChanges` versus `input()`: what does a signal input keep, and what does it replace? |
| [Q19.23](modules/19-component-communication-and-projection.md#q19-23) | Concept | What do the input, output, queries and `signals` schematics change, which declarations do they skip, and what do `--insert-todos` and `--best-effort-mode` do? |
| [Q19.24](modules/19-component-communication-and-projection.md#q19-24) | Bug hunt | After the migration, which parts of the component are still decorator-based, why, and what do you do by hand? |
| [Q19.25](modules/19-component-communication-and-projection.md#q19-25) | Concept | How do you create a component at run time with `ViewContainerRef.createComponent`, `createComponent()` and `NgComponentOutlet`, and who destroys it? |
| [Q19.26](modules/19-component-communication-and-projection.md#q19-26) | Output | What do `inputBinding`, `outputBinding` and `twoWayBinding` do, and what does `setInput` do afterwards? |
| [Q19.27](modules/19-component-communication-and-projection.md#q19-27) | Design | Design a toast service: where do the components attach, how do they get inputs and content, and how are they cleaned up? |
| [Q19.28](modules/19-component-communication-and-projection.md#q19-28) | Concept · Output | What does the compiler store for inputs, outputs and content slots, and what does `reflectComponentType` report? |
| [Q19.29](modules/19-component-communication-and-projection.md#q19-29) | Concept | How does the runtime choose a projection slot and refresh a query, and why does a signal query never need `ngAfterViewInit`? |

### 20 · Lifecycle and render hooks: constructor, `ngOnInit`, the check hooks, `afterNextRender`, `DestroyRef` and `ExpressionChangedAfterItHasBeenCheckedError`

| ID | Type | Question |
|---|---|---|
| [Q20.01](modules/20-lifecycle-and-render-hooks.md#q20-01) | Concept | What are the lifecycle hooks of a component, and in what order do they run from construction to destruction? |
| [Q20.02](modules/20-lifecycle-and-render-hooks.md#q20-02) | Output | In what order do the constructors and hooks of a parent, a child, a component projected into the child and the child's view component run on the first render? |
| [Q20.03](modules/20-lifecycle-and-render-hooks.md#q20-03) | Difference | Constructor versus `ngOnInit`: what exists in each, and what belongs where? |
| [Q20.04](modules/20-lifecycle-and-render-hooks.md#q20-04) | Output | What does `ngOnChanges` report for a bound, a static-attribute and an unbound input, and what does a required input do when read in the constructor? |
| [Q20.05](modules/20-lifecycle-and-render-hooks.md#q20-05) | Bug hunt | Review this component: it reads an input in the constructor, calls `inject()` in `ngOnInit` and subscribes in `ngAfterViewInit` without cleanup. What breaks, and where does each belong? |
| [Q20.06](modules/20-lifecycle-and-render-hooks.md#q20-06) | Concept | Which lifecycle hooks still matter with signals, and what replaces the others? |
| [Q20.07](modules/20-lifecycle-and-render-hooks.md#q20-07) | Output | A signal input changes: in what order do `ngOnChanges`, `ngDoCheck`, an `effect` and the template update run? |
| [Q20.08](modules/20-lifecycle-and-render-hooks.md#q20-08) | Trade-off | `ngOnChanges`, `computed` or `linkedSignal`, or `effect` to react to an input change: which wins when? |
| [Q20.09](modules/20-lifecycle-and-render-hooks.md#q20-09) | Bug hunt | A child uses `ngDoCheck` to spot in-place edits of an object its parent mutates, and the text never updates. Why, and what are the fixes? |
| [Q20.10](modules/20-lifecycle-and-render-hooks.md#q20-10) | Concept | What do `afterNextRender` and `afterEveryRender` do, when do they run and where can you call them? |
| [Q20.11](modules/20-lifecycle-and-render-hooks.md#q20-11) | Output | Three components register phase callbacks and plain callbacks: in what order do they run, and what does each phase receive? |
| [Q20.12](modules/20-lifecycle-and-render-hooks.md#q20-12) | Bug hunt | Three render-hook mistakes: registering in `ngOnInit`, reading and writing in one callback, and writing state on every render. What does each cause? |
| [Q20.13](modules/20-lifecycle-and-render-hooks.md#q20-13) | Trade-off | Where should a third-party widget be created: the constructor, `ngOnInit`, `ngAfterViewInit` or `afterNextRender`? |
| [Q20.14](modules/20-lifecycle-and-render-hooks.md#q20-14) | Output | A component with `ngOnDestroy`, two `DestroyRef` callbacks, a `takeUntilDestroyed` subscription and an effect cleanup is removed by an `@if`: in what order does each run? |
| [Q20.15](modules/20-lifecycle-and-render-hooks.md#q20-15) | Concept | How does `takeUntilDestroyed` work, where can it be called, and what happens if the owner is already destroyed? |
| [Q20.16](modules/20-lifecycle-and-render-hooks.md#q20-16) | Bug hunt | Find the three leaks: a `setInterval`, a `subscribe` in `ngOnInit` and a `window` listener. How is each cleaned up? |
| [Q20.17](modules/20-lifecycle-and-render-hooks.md#q20-17) | Output | What happens when late async work registers a cleanup on a destroyed component, and how does `destroyed` help? |
| [Q20.18](modules/20-lifecycle-and-render-hooks.md#q20-18) | Design | Design a lifecycle-aware helper function (an element-size signal) instead of a base class with hooks. |
| [Q20.19](modules/20-lifecycle-and-render-hooks.md#q20-19) | Concept | What is `ExpressionChangedAfterItHasBeenCheckedError`, when does Angular throw it, and why only in development? |
| [Q20.20](modules/20-lifecycle-and-render-hooks.md#q20-20) | Output | A child writes to its parent in `ngOnInit`: a plain field of an `Eager` parent, the same field of a default-OnPush parent, and a signal. Which throw, and what does each show? |
| [Q20.21](modules/20-lifecycle-and-render-hooks.md#q20-21) | Trade-off | How do you fix `ExpressionChangedAfterItHasBeenCheckedError`: move the write, derive the value, write a signal, defer to a render hook or call `detectChanges`? |
| [Q20.22](modules/20-lifecycle-and-render-hooks.md#q20-22) | Concept | How does Angular store and run the hooks of a view, and why are the "after" hooks of a child run before its parent's? |
| [Q20.23](modules/20-lifecycle-and-render-hooks.md#q20-23) | Output | Only the parent's signal changes: which hooks of the parent, the child and the projected child run? |
| [Q20.24](modules/20-lifecycle-and-render-hooks.md#q20-24) | Concept | How does the render-hook queue run: why after every component, phase by phase, and why not on an idle tick or on the server? |
| [Q20.25](modules/20-lifecycle-and-render-hooks.md#q20-25) | Concept | What does Angular check after each tick in development, and how do the OnPush default and the removal of `checkNoChanges` change what you see? |

### 21 · Change detection: `OnPush`, zone.js, zoneless scheduling and `ChangeDetectorRef`

| ID | Type | Question |
|---|---|---|
| [Q21.01](modules/21-change-detection.md#q21-01) | Concept | What is change detection, what problem does it solve, and how do dirty checking and fine-grained reactivity answer it differently? |
| [Q21.02](modules/21-change-detection.md#q21-02) | Difference | How does Angular's change detection compare with a Hibernate flush, and where does the comparison break? |
| [Q21.03](modules/21-change-detection.md#q21-03) | Concept | What are `OnPush` and `Eager`, which one is the default in v22, and what changed for existing code? |
| [Q21.04](modules/21-change-detection.md#q21-04) | Concept | What marks an OnPush view dirty, and what does not? |
| [Q21.05](modules/21-change-detection.md#q21-05) | Output | A parent mutates an object in place and then passes a new one: which child templates re-run, and what does each show? |
| [Q21.06](modules/21-change-detection.md#q21-06) | Bug hunt | An OnPush component never updates: an observable subscription, a service mutating an object and a `@ViewChild` setting an input. What is wrong in each, and what is the fix? |
| [Q21.07](modules/21-change-detection.md#q21-07) | Trade-off | Keep OnPush everywhere, or opt a component into `Eager`: when does each win in v22? |
| [Q21.08](modules/21-change-detection.md#q21-08) | Concept | How does zone.js let Angular detect changes, and what do `NgZone`, `onMicrotaskEmpty` and `onStable` add? |
| [Q21.09](modules/21-change-detection.md#q21-09) | Output | In a zone-based app a timer writes a plain field of an `Eager` and of an OnPush component, once inside and once outside the zone: what renders? |
| [Q21.10](modules/21-change-detection.md#q21-10) | Bug hunt | A chart library and a WebSocket client make a zone-based page tick constantly while another widget never refreshes. What is going on, and how do you fix both? |
| [Q21.11](modules/21-change-detection.md#q21-11) | Trade-off | Event coalescing, `runOutsideAngular` or going zoneless: which cure for zone overhead wins when? |
| [Q21.12](modules/21-change-detection.md#q21-12) | Concept | Why was zone.js removed from the default in v21, and what still works if you keep it? |
| [Q21.13](modules/21-change-detection.md#q21-13) | Concept | How does Angular walk the view tree, and what makes one view refresh while its sibling is skipped? |
| [Q21.14](modules/21-change-detection.md#q21-14) | Output | A click inside an OnPush component: which templates re-run among the ancestors, an `Eager` sibling and an OnPush sibling? |
| [Q21.15](modules/21-change-detection.md#q21-15) | Output | A leaf signal changes, then the leaf calls `markForCheck`: which templates re-run each time? |
| [Q21.16](modules/21-change-detection.md#q21-16) | Concept | Who is checked together with whom: embedded views (`@if`, `@for`), projected content and an `Eager` descendant of an OnPush ancestor? |
| [Q21.17](modules/21-change-detection.md#q21-17) | Concept | What triggers change detection in a zoneless app, and what does not? |
| [Q21.18](modules/21-change-detection.md#q21-18) | Output | Three signal writes in one turn: how many renders run, and when does the DOM change? |
| [Q21.19](modules/21-change-detection.md#q21-19) | Concept | What is `PendingTasks`, how does it relate to stability, and when must you use it? |
| [Q21.20](modules/21-change-detection.md#q21-20) | Output | A pending task is open: what do `isStable`, `whenStable` and `PendingTasks.run` report? |
| [Q21.21](modules/21-change-detection.md#q21-21) | Output | What do `NgZone` and its observables do in a zoneless app? |
| [Q21.22](modules/21-change-detection.md#q21-22) | Design | Plan the migration of a zone-based application to zoneless, in order, with a check for each step. |
| [Q21.23](modules/21-change-detection.md#q21-23) | Bug hunt | After going zoneless a plain field set in a callback never renders, code waiting on `NgZone.onStable` never continues and an `ngDoCheck` diff never fires. Find the three causes. |
| [Q21.24](modules/21-change-detection.md#q21-24) | Difference | `markForCheck`, `detectChanges`, `detach` and `reattach`: what does each do, and what does each cost? |
| [Q21.25](modules/21-change-detection.md#q21-25) | Output | A detached component's signal changes, then `detectChanges` runs, then `reattach`: what shows after each step? |
| [Q21.26](modules/21-change-detection.md#q21-26) | Concept | Which view does an injected `ChangeDetectorRef` belong to in a component, a directive and an embedded view? |
| [Q21.27](modules/21-change-detection.md#q21-27) | Design | Design a component that freezes its view while it is off screen and refreshes on demand. |
| [Q21.28](modules/21-change-detection.md#q21-28) | Trade-off | To update an OnPush view from outside: a signal, `markForCheck` or `detectChanges`: which wins when? |
| [Q21.29](modules/21-change-detection.md#q21-29) | Concept | How do you find a change-detection bottleneck with the Angular DevTools profiler and the Chrome performance track? |
| [Q21.30](modules/21-change-detection.md#q21-30) | Output | What does `provideCheckNoChangesConfig({ exhaustive: true })` report for a plain-field write in an OnPush component, and what does `interval` add? |
| [Q21.31](modules/21-change-detection.md#q21-31) | Bug hunt | An app never becomes stable, so `whenStable` hangs and server rendering times out. How do you find the task that blocks it? |
| [Q21.32](modules/21-change-detection.md#q21-32) | Concept | What does `ApplicationRef.tick` do, from the dirty flags to the render hooks and the development check? |
| [Q21.33](modules/21-change-detection.md#q21-33) | Concept | How does the scheduler decide when to tick: notification sources, coalescing, `requestAnimationFrame` versus `setTimeout`? |
| [Q21.34](modules/21-change-detection.md#q21-34) | Concept | How does a signal read in a template refresh only that view, and what do `RefreshView` and `HasChildViewsToRefresh` do? |
| [Q21.35](modules/21-change-detection.md#q21-35) | Concept | How does `NgZone` know when the zone is stable, and how does that become a tick? |

### 22 · RxJS foundations: observables, subjects and operators

| ID | Type | Question |
|---|---|---|
| [Q22.01](modules/22-rxjs-foundations.md#q22-01) | Concept | What is an Observable, and how does it differ from a function, an iterator and a Promise? |
| [Q22.02](modules/22-rxjs-foundations.md#q22-02) | Output | A producer logs, emits and returns a teardown: what prints for two subscriptions, and what runs before `subscribe` returns? |
| [Q22.03](modules/22-rxjs-foundations.md#q22-03) | Output | A Promise and an Observable do the same work: in what order do the lines print? |
| [Q22.04](modules/22-rxjs-foundations.md#q22-04) | Difference | How does RxJS's `Observable` compare with the platform `Observable` proposal, and what ships in browsers today? |
| [Q22.05](modules/22-rxjs-foundations.md#q22-05) | Concept | What are `Observer`, `Subscriber`, `Subscription` and teardown, and what rules bind them? |
| [Q22.06](modules/22-rxjs-foundations.md#q22-06) | Output | A producer completes, then emits again, and is unsubscribed twice: what prints, and when does the teardown run? |
| [Q22.07](modules/22-rxjs-foundations.md#q22-07) | Bug hunt | A hand-written `Observable` leaks an interval and a listener after `unsubscribe`: find the three mistakes. |
| [Q22.08](modules/22-rxjs-foundations.md#q22-08) | Output | An error is thrown inside a `next` handler and another observable errors with no `error` handler: where do the errors go? |
| [Q22.09](modules/22-rxjs-foundations.md#q22-09) | Design | Write a minimal `Observable` class with `subscribe`, the notification contract and teardown. |
| [Q22.10](modules/22-rxjs-foundations.md#q22-10) | Concept | Cold or hot, unicast or multicast: how do you tell which an Observable is, and why does it matter? |
| [Q22.11](modules/22-rxjs-foundations.md#q22-11) | Output | `interval`, `fromEvent`, `from(promise)` and `defer`: how many producers run for two subscribers, and what does a late subscriber see? |
| [Q22.12](modules/22-rxjs-foundations.md#q22-12) | Output | `share()` over a producer: what do two subscribers receive, and what happens when both leave and one returns? |
| [Q22.13](modules/22-rxjs-foundations.md#q22-13) | Difference | `share()`, `connectable` and a `Subject`: three ways to multicast, and which deprecated `multicast` APIs they replace. |
| [Q22.14](modules/22-rxjs-foundations.md#q22-14) | Difference | How does RxJS compare with Project Reactor: cold by default, `Mono` and backpressure, and where does the analogy break? |
| [Q22.15](modules/22-rxjs-foundations.md#q22-15) | Concept | What is a `Subject`, and why is it both an Observable and an Observer? |
| [Q22.16](modules/22-rxjs-foundations.md#q22-16) | Output | What does a late subscriber receive from `Subject`, `BehaviorSubject`, `ReplaySubject(2)` and `AsyncSubject`, before and after complete? |
| [Q22.17](modules/22-rxjs-foundations.md#q22-17) | Output | Nested `next`, `next` after `complete` and after `unsubscribe()`: what does each do? |
| [Q22.18](modules/22-rxjs-foundations.md#q22-18) | Bug hunt | A store service exposes its `BehaviorSubject`: find the ways a consumer can break it. |
| [Q22.19](modules/22-rxjs-foundations.md#q22-19) | Trade-off | A `Subject`, `asObservable()`, a signal or an operator pipeline: when is a Subject a smell? |
| [Q22.20](modules/22-rxjs-foundations.md#q22-20) | Concept | What is a pipeable operator, what does `pipe` do, and which import forms are current in RxJS 7.8? |
| [Q22.21](modules/22-rxjs-foundations.md#q22-21) | Design | Write a `tapFirst` operator: what must it do with `error`, `complete` and teardown? |
| [Q22.22](modules/22-rxjs-foundations.md#q22-22) | Bug hunt | A custom operator keeps its source running after unsubscribe and shares a counter across subscribers: find both. |
| [Q22.23](modules/22-rxjs-foundations.md#q22-23) | Concept | How do you choose an operator by purpose: creation, transformation, filtering, utility, conditional or aggregation? |
| [Q22.24](modules/22-rxjs-foundations.md#q22-24) | Output | `scan` versus `reduce`: what does each emit with and without a seed, and on an empty source? |
| [Q22.25](modules/22-rxjs-foundations.md#q22-25) | Output | `first()`, `take(1)`, `last()` and `single()` on empty, one-value and many-value sources: which complete and which error? |
| [Q22.26](modules/22-rxjs-foundations.md#q22-26) | Output | `distinctUntilChanged` and `distinct` on numbers and on objects: what does each emit? |
| [Q22.27](modules/22-rxjs-foundations.md#q22-27) | Difference | `combineLatest`, `withLatestFrom`, `zip`, `forkJoin`, `merge`, `concat` and `race`: what does each emit, and when does it complete? |
| [Q22.28](modules/22-rxjs-foundations.md#q22-28) | Output | The same two sources through `combineLatest`, `withLatestFrom`, `zip`, `merge`, `concat` and `forkJoin`: what is emitted, and at which frame? |
| [Q22.29](modules/22-rxjs-foundations.md#q22-29) | Bug hunt | A `forkJoin` never emits and a `combineLatest` stays silent: find the cause of each and the fix. |
| [Q22.30](modules/22-rxjs-foundations.md#q22-30) | Difference | `debounceTime`, `throttleTime`, `auditTime` and `sampleTime`: what does each keep from a burst, and what happens to the pending value at `complete`? |
| [Q22.31](modules/22-rxjs-foundations.md#q22-31) | Output | One burst through the four timing operators: which values come out, at which frame, and what happens at `complete`? |
| [Q22.32](modules/22-rxjs-foundations.md#q22-32) | Trade-off | Autosave, scroll position, a double-click guard and a search box: which timing operator for each? |
| [Q22.33](modules/22-rxjs-foundations.md#q22-33) | Concept | What does `subscribe` do, step by step, and how does unsubscribing travel up an operator chain? |
| [Q22.34](modules/22-rxjs-foundations.md#q22-34) | Concept | How does a `Subject` deliver to its observers, and what state machine does `share` add on top? |

### 23 · RxJS in depth: flattening, errors, multicasting, schedulers, testing and signal interop

| ID | Type | Question |
|---|---|---|
| [Q23.01](modules/23-rxjs-in-depth.md#q23-01) | Concept | What is a higher-order Observable, and what does a flattening operator do with each inner subscription? |
| [Q23.02](modules/23-rxjs-in-depth.md#q23-02) | Output | One outer stream through `switchMap`, `mergeMap`, `concatMap` and `exhaustMap`: which inner values come out, at which frame, and when does each inner subscription end? |
| [Q23.03](modules/23-rxjs-in-depth.md#q23-03) | Difference | `switchMap`, `mergeMap`, `concatMap` and `exhaustMap`: what does each do with a new outer value while an inner Observable is still running? |
| [Q23.04](modules/23-rxjs-in-depth.md#q23-04) | Output | `switchMap` and `mergeMap` over a synchronous source with Promise inners: why does `switchMap` deliver only the last result? |
| [Q23.05](modules/23-rxjs-in-depth.md#q23-05) | Concept | How do `mergeMap`, `concatMap` and `switchMap` keep track of their inner subscriptions, and what does the concurrency limit change? |
| [Q23.06](modules/23-rxjs-in-depth.md#q23-06) | Bug hunt | A search shows stale results, a submit button posts twice and an autosave drops edits: find the wrong flattening operator in each. |
| [Q23.07](modules/23-rxjs-in-depth.md#q23-07) | Output | Two searches through `switchMap` over `HttpClient`: what happens to the first request, and what does `HttpTestingController` report? |
| [Q23.08](modules/23-rxjs-in-depth.md#q23-08) | Design | Design an upload queue that runs at most two uploads at a time and reports when all are done. |
| [Q23.09](modules/23-rxjs-in-depth.md#q23-09) | Concept | What do `expand`, `mergeScan` and `switchScan` add to the flattening operators, and when does recursion with `expand` fit? |
| [Q23.10](modules/23-rxjs-in-depth.md#q23-10) | Concept | Error versus complete: what does an error end in an operator chain, and why does one failed inner request stop the outer stream? |
| [Q23.11](modules/23-rxjs-in-depth.md#q23-11) | Output | `catchError` outside `switchMap` versus inside it: what does each pipeline emit after one inner request fails? |
| [Q23.12](modules/23-rxjs-in-depth.md#q23-12) | Output | Two `finalize` operators, a `complete` handler and a source teardown: in what order do they run on complete, on error and on unsubscribe? |
| [Q23.13](modules/23-rxjs-in-depth.md#q23-13) | Bug hunt | A long-lived stream ends in `catchError(() => EMPTY)`, another in `catchError((err, caught) => caught)`: what goes wrong with each? |
| [Q23.14](modules/23-rxjs-in-depth.md#q23-14) | Output | `retry(2)`, `retry({ count: 3, delay })` with exponential backoff, and `resetOnSuccess`: how many subscriptions run, and when does the error arrive? |
| [Q23.15](modules/23-rxjs-in-depth.md#q23-15) | Design | Design an HTTP retry policy: exponential backoff, only for retryable failures, and a cap on attempts. |
| [Q23.16](modules/23-rxjs-in-depth.md#q23-16) | Difference | `retry` versus `repeat`, and the deprecated `retryWhen` and `repeatWhen`: what triggers each resubscription, and what happens when a delay notifier completes? |
| [Q23.17](modules/23-rxjs-in-depth.md#q23-17) | Output | `shareReplay(1)` versus `shareReplay({ bufferSize: 1, refCount: true })` over an interval: what happens when the last subscriber leaves and a new one arrives? |
| [Q23.18](modules/23-rxjs-in-depth.md#q23-18) | Output | `shareReplay` over a source that completes and over one that errors: what does a late subscriber receive, and how many times does the source run? |
| [Q23.19](modules/23-rxjs-in-depth.md#q23-19) | Difference | `share` with a `ShareConfig`, `shareReplay` and `connect`: which reset rules differ, and how do you keep a cache warm for a grace period? |
| [Q23.20](modules/23-rxjs-in-depth.md#q23-20) | Trade-off | `takeUntilDestroyed`, the `async` pipe, `toSignal` or `take(1)`: which unsubscription strategy fits which stream? |
| [Q23.21](modules/23-rxjs-in-depth.md#q23-21) | Output | `takeUntil` before `switchMap` versus after it: what keeps running after the notifier fires? |
| [Q23.22](modules/23-rxjs-in-depth.md#q23-22) | Design | How do you prove a component leaves no live subscription behind, in a unit test and in a running app? |
| [Q23.23](modules/23-rxjs-in-depth.md#q23-23) | Trade-off | Signals or RxJS: what are the decision rules, and where do the conversions belong? |
| [Q23.24](modules/23-rxjs-in-depth.md#q23-24) | Output | `toSignal` with `requireSync` over a `BehaviorSubject` and over a `timer`, outside an injection context, and with `manualCleanup`: what does each do? |
| [Q23.25](modules/23-rxjs-in-depth.md#q23-25) | Output | A signal is set twice before `toObservable`'s effect runs: what does a subscriber receive, and when? |
| [Q23.26](modules/23-rxjs-in-depth.md#q23-26) | Output | `rxResource` when its params change mid-stream, when the stream errors and when it completes empty: what are `status`, `value` and `error`? |
| [Q23.27](modules/23-rxjs-in-depth.md#q23-27) | Output | Keystrokes, a repeated term and a failing search through a typeahead pipeline: what does it emit, and at which frame? |
| [Q23.28](modules/23-rxjs-in-depth.md#q23-28) | Trade-off | A typeahead as an RxJS pipeline or as signals with `rxResource`: which, and when does each win? |
| [Q23.29](modules/23-rxjs-in-depth.md#q23-29) | Design | Design polling that never overlaps requests, pauses while the page is hidden and stops when the component is destroyed. |
| [Q23.30](modules/23-rxjs-in-depth.md#q23-30) | Difference | Cache-then-network with `concat`, `merge` or `startWith`, and racing requests with `race` or `timeout({ first, with })`: what does each emit when the network beats the cache? |
| [Q23.31](modules/23-rxjs-in-depth.md#q23-31) | Concept | What is a scheduler, and what do `queueScheduler`, `asapScheduler`, `asyncScheduler` and `animationFrameScheduler` run on? |
| [Q23.32](modules/23-rxjs-in-depth.md#q23-32) | Output | Plain `of`, `queueScheduler`, `asapScheduler`, a promise, `asyncScheduler`, `setTimeout`, `observeOn` and `subscribeOn`: in what order do the lines print? |
| [Q23.33](modules/23-rxjs-in-depth.md#q23-33) | Difference | `observeOn` versus `subscribeOn`: what does each move onto the scheduler, and why is the scheduler argument of `of` and `from` deprecated? |
| [Q23.34](modules/23-rxjs-in-depth.md#q23-34) | Concept | How does `TestScheduler.run` put `debounceTime` and `delay` on virtual time, and what can it not virtualize? |
| [Q23.35](modules/23-rxjs-in-depth.md#q23-35) | Output | Hot and cold marbles, a sync group, time progression and subscription marbles: what does each assertion check, and at which frames? |
| [Q23.36](modules/23-rxjs-in-depth.md#q23-36) | Bug hunt | A marble test fails: a time progression is off by one, a Promise sits inside the pipeline and the test runs outside `run()`. Find each cause. |

### 24 · Routing: configuration, parameters, guards, lazy loading and the navigation lifecycle

| ID | Type | Question |
|---|---|---|
| [Q24.01](modules/24-routing.md#q24-01) | Concept | What does `provideRouter` register, and how does the router choose the route for a URL? |
| [Q24.02](modules/24-routing.md#q24-02) | Output | An empty-path redirect without `pathMatch: 'full'`, a wildcard and `/home/extra`: where does each navigation end? |
| [Q24.03](modules/24-routing.md#q24-03) | Difference | `pathMatch: 'prefix'` versus `'full'`, and a string `redirectTo` versus a redirect function: what does each match, and what can the function read? |
| [Q24.04](modules/24-routing.md#q24-04) | Bug hunt | A wildcard listed first, a parameter route before a static one and two redirects that point at each other: find the route-table bugs. |
| [Q24.05](modules/24-routing.md#q24-05) | Difference | Path, matrix and query parameters and the fragment: where does each live in the URL, and which route sees it? |
| [Q24.06](modules/24-routing.md#q24-06) | Output | `withComponentInputBinding` with one key in the path, the matrix, the query, static data and a resolver: which value does each input get, and what happens when the key disappears? |
| [Q24.07](modules/24-routing.md#q24-07) | Output | A child route under a parent with a component, with `paramsInheritanceStrategy` `'always'` (the v22 default) and `'emptyOnly'`: which params and data does the child see? |
| [Q24.08](modules/24-routing.md#q24-08) | Trade-off | `ActivatedRoute` observables, the snapshot or component input binding: which should a reused component read its parameters from? |
| [Q24.09](modules/24-routing.md#q24-09) | Concept | How do child routes and `<router-outlet>` build the view tree, and what is a componentless route for? |
| [Q24.10](modules/24-routing.md#q24-10) | Output | A named `popup` outlet: which URLs do opening it and closing it with `outlets: { popup: null }` produce? |
| [Q24.11](modules/24-routing.md#q24-11) | Design | Design a mail layout whose compose panel stays open while the primary outlet navigates. |
| [Q24.12](modules/24-routing.md#q24-12) | Output | A `loadChildren` route visited twice, and the same route behind a `canMatch` that says no: how often does the loader run, and which events fire? |
| [Q24.13](modules/24-routing.md#q24-13) | Output | A service listed in a route's `providers`: is it destroyed when the user leaves, with and without `withAutoCleanupInjectors`? |
| [Q24.14](modules/24-routing.md#q24-14) | Concept | What are the functional guards, what may they return, and which navigation step does each one control? |
| [Q24.15](modules/24-routing.md#q24-15) | Output | `canMatch` on two routes with the same path, `canActivate` on parent and child, `canActivateChild` and two resolvers: in what order do they run? |
| [Q24.16](modules/24-routing.md#q24-16) | Output | A guard returns `false`, a `UrlTree` or a `RedirectCommand`, or throws a `RedirectCommand`: what does `navigateByUrl` resolve to, and which events fire? |
| [Q24.17](modules/24-routing.md#q24-17) | Difference | `canMatch` versus `canActivate` and the deprecated `canLoad`: what does each prevent, and what does `currentSnapshot` give `canMatch` in v22? |
| [Q24.18](modules/24-routing.md#q24-18) | Output | Two guards in one `canActivate` array, a slow one that returns `false` and a fast one that redirects: which result wins, and why? |
| [Q24.19](modules/24-routing.md#q24-19) | Bug hunt | An admin area hides behind a role guard that reads `localStorage`, and the API trusts the guard: what is wrong? |
| [Q24.20](modules/24-routing.md#q24-20) | Design | Design an unsaved-changes guard for an edit form, covering in-app links, the back button and closing the tab. |
| [Q24.21](modules/24-routing.md#q24-21) | Output | Resolvers that return `EMPTY`, throw, emit `of(1, 2, 3)` or return a `RedirectCommand`: how does each navigation end? |
| [Q24.22](modules/24-routing.md#q24-22) | Concept | When do guards and resolvers run again: `runGuardsAndResolvers`, `onSameUrlNavigation` and a query-only change? |
| [Q24.23](modules/24-routing.md#q24-23) | Trade-off | A resolver, route `resources` with `nonBlocking`, or loading in the component: which, and what does the user see while data loads? |
| [Q24.24](modules/24-routing.md#q24-24) | Output | One successful navigation into a parent and a child route: which router events fire, and in what order? |
| [Q24.25](modules/24-routing.md#q24-25) | Output | Two navigations started back to back, and `currentNavigation()?.abort()`: what do the promises resolve to, and which cancellation codes appear? |
| [Q24.26](modules/24-routing.md#q24-26) | Concept | `currentNavigation`, `lastSuccessfulNavigation` and `Router.events`: what does each give, and how do you drive a global loading bar? |
| [Q24.27](modules/24-routing.md#q24-27) | Concept | How does the router's navigation pipeline cancel a superseded navigation, and where do redirects, guards and resolvers sit in it? |
| [Q24.28](modules/24-routing.md#q24-28) | Difference | `NoPreloading`, `PreloadAllModules` and a custom `PreloadingStrategy`: what loads, and when does preloading start? |
| [Q24.29](modules/24-routing.md#q24-29) | Output | `/c/1`, `/c/2`, `/x`, then `/c/1` again, with the default `RouteReuseStrategy` and with one that detaches: which component instances render? |
| [Q24.30](modules/24-routing.md#q24-30) | Trade-off | A custom `RouteReuseStrategy` that keeps a list page alive: when is it worth it, and what does it cost? |
| [Q24.31](modules/24-routing.md#q24-31) | Output | A static title, a title function, a parent and child title and a custom `TitleStrategy`: what is `document.title` after each navigation? |
| [Q24.32](modules/24-routing.md#q24-32) | Concept | What do `withInMemoryScrolling` and `withViewTransitions` do on each navigation, and what happens in a browser without the View Transitions API? |
| [Q24.33](modules/24-routing.md#q24-33) | Difference | `PathLocationStrategy` versus `HashLocationStrategy`: which URLs does each produce, and what must the server do for a deep link? |
| [Q24.34](modules/24-routing.md#q24-34) | Concept | What does the Router add on top of the History API, and what changes with `withExperimentalPlatformNavigation`? |

### 25 · Forms: reactive and template-driven

| ID | Type | Question |
|---|---|---|
| [Q25.01](modules/25-forms-reactive-and-template-driven.md#q25-01) | Concept | What are the two forms APIs, and what do the `FormControl`, the directive and the value accessor each do? |
| [Q25.02](modules/25-forms-reactive-and-template-driven.md#q25-02) | Trade-off | Template-driven or reactive forms, and where does Signal Forms fit: which do you choose for which form? |
| [Q25.03](modules/25-forms-reactive-and-template-driven.md#q25-03) | Difference | `setValue`, `patchValue` and `reset`: what does each require, and what happens to a missing or an extra key? |
| [Q25.04](modules/25-forms-reactive-and-template-driven.md#q25-04) | Output | A group with one disabled control, the same group fully disabled, and `reset()` on a nullable and a non-nullable control: what are `status`, `valid`, `invalid` and the values? |
| [Q25.05](modules/25-forms-reactive-and-template-driven.md#q25-05) | Bug hunt | Loading an API response with `setValue` throws on an extra key: what has already changed, and why is the group's `value` now wrong? |
| [Q25.06](modules/25-forms-reactive-and-template-driven.md#q25-06) | Concept | How do typed forms infer control types from `FormControl`, `FormGroup` and `FormBuilder`, and what does `NonNullableFormBuilder` change? |
| [Q25.07](modules/25-forms-reactive-and-template-driven.md#q25-07) | Difference | A `FormGroup` with optional keys or a `FormRecord`: which for a fixed and which for a dynamic set of keys, and what does the compiler reject in each? |
| [Q25.08](modules/25-forms-reactive-and-template-driven.md#q25-08) | Concept | What did the typed-forms migration leave behind (`UntypedFormGroup` and friends), and how do you remove it safely? |
| [Q25.09](modules/25-forms-reactive-and-template-driven.md#q25-09) | Output | An `NgForm` right after the first change detection, after one microtask and after `whenStable()`: what are its `controls` and `value`, and when does a component field reach the control? |
| [Q25.10](modules/25-forms-reactive-and-template-driven.md#q25-10) | Bug hunt | An address sub-component with `ngModel` inputs does not join the parent `NgForm`, and the console shows `NG01354`: why, and what are the fixes? |
| [Q25.11](modules/25-forms-reactive-and-template-driven.md#q25-11) | Concept | How does a template-driven form build its model: `NgForm`, `ngModel` with `name`, `ngModelGroup` and `ngModelOptions`? |
| [Q25.12](modules/25-forms-reactive-and-template-driven.md#q25-12) | Output | `required`, `requiredTrue`, `minLength`, `pattern` and `email` on `''`, `' '`, `0`, `false` and short values: which errors does each return? |
| [Q25.13](modules/25-forms-reactive-and-template-driven.md#q25-13) | Concept | How do you write a custom validator and a validator factory, and how are the errors of several validators combined? |
| [Q25.14](modules/25-forms-reactive-and-template-driven.md#q25-14) | Output | A password-confirmation validator on the group: where does the `mismatch` error live, and what do `hasError('mismatch')` and `hasError('mismatch', 'confirm')` return? |
| [Q25.15](modules/25-forms-reactive-and-template-driven.md#q25-15) | Bug hunt | A server "email taken" error set with `setErrors` disappears on the next keystroke, and `removeValidators(Validators.minLength(3))` removes nothing: find both bugs. |
| [Q25.16](modules/25-forms-reactive-and-template-driven.md#q25-16) | Output | `Validators.min(3)` on the string `'2'`, and a `min` attribute on a text and on a number input: which get a `min` error, and what did v22 really change? |
| [Q25.17](modules/25-forms-reactive-and-template-driven.md#q25-17) | Output | Three quick values through a username async validator behind `required`: how many calls, which are cancelled, and what is the status after each step? |
| [Q25.18](modules/25-forms-reactive-and-template-driven.md#q25-18) | Design | Design a "username taken" check that calls the server at most once per typing pause, never for invalid input, and never leaves the form stuck in `PENDING`. |
| [Q25.19](modules/25-forms-reactive-and-template-driven.md#q25-19) | Output | An async validator that emits and never completes, alone and next to a second async validator: what is the status after `setValue`? |
| [Q25.20](modules/25-forms-reactive-and-template-driven.md#q25-20) | Concept | What are the four statuses and the pristine, dirty, touched and untouched flags, and why can a control be neither valid nor invalid? |
| [Q25.21](modules/25-forms-reactive-and-template-driven.md#q25-21) | Output | A child control changes inside a group: in what order do the `events` and `valueChanges` subscribers run, and what does the child's subscriber see in `parent.value`? |
| [Q25.22](modules/25-forms-reactive-and-template-driven.md#q25-22) | Difference | `valueChanges` and `statusChanges` versus the unified `events` stream: what does `events` add, and what do `emitEvent: false` and `onlySelf` suppress? |
| [Q25.23](modules/25-forms-reactive-and-template-driven.md#q25-23) | Output | In a zoneless OnPush component, `setValue` from code, typing, and a `setValue` that flips the status: what do the input and `{{ c.value }}` show after each? |
| [Q25.24](modules/25-forms-reactive-and-template-driven.md#q25-24) | Trade-off | `updateOn: 'change'`, `'blur'` or `'submit'`: what does each cost the user, the validators and the server? |
| [Q25.25](modules/25-forms-reactive-and-template-driven.md#q25-25) | Design | Design error display for a sign-up form: when an error shows, where its message comes from, and how the control's state reaches the markup and focus. |
| [Q25.26](modules/25-forms-reactive-and-template-driven.md#q25-26) | Output | Submitting an invalid reactive form: does `ngSubmit` fire, which events does the group emit, and which classes does the `<form>` get? |
| [Q25.27](modules/25-forms-reactive-and-template-driven.md#q25-27) | Trade-off | Show errors when touched, when dirty or after submit: which policy for which field, and how do you implement it once for every field? |
| [Q25.28](modules/25-forms-reactive-and-template-driven.md#q25-28) | Concept | How do you build a form from a server-side configuration: `FormRecord` or `FormArray`, a field registry, and what must `@for` track? |
| [Q25.29](modules/25-forms-reactive-and-template-driven.md#q25-29) | Output | `push`, `insert`, `removeAt`, `push` with an array and `clear()` on a `FormArray`: what is the value after each, and how many `valueChanges` emissions does each cause? |
| [Q25.30](modules/25-forms-reactive-and-template-driven.md#q25-30) | Output | In a zoneless component, `FormArray.push` of a valid control and of an invalid one: how many rows render after each? |
| [Q25.31](modules/25-forms-reactive-and-template-driven.md#q25-31) | Concept | What is the `ControlValueAccessor` contract, and how does a component register as one with `NG_VALUE_ACCESSOR`, `multi` and `forwardRef`? |
| [Q25.32](modules/25-forms-reactive-and-template-driven.md#q25-32) | Output | A custom control attached to an enabled and to a disabled `FormControl`: in which order are its methods called, and what happens on a user change, `setValue` and `disable()`? |
| [Q25.33](modules/25-forms-reactive-and-template-driven.md#q25-33) | Bug hunt | A custom control throws `NG01203`, another throws `NG01200`, and a third never becomes `touched`: find the three bugs. |
| [Q25.34](modules/25-forms-reactive-and-template-driven.md#q25-34) | Design | Design a reusable quantity stepper that works with `formControlName` and `ngModel`, validates its own range, and supports `disable()`; when would Signal Forms' contract replace it? |

### 26 · Signal Forms

| ID | Type | Question |
|---|---|---|
| [Q26.01](modules/26-signal-forms.md#q26-01) | Concept | What problem does Signal Forms solve that the two older APIs do not, and what does "model-first" mean? |
| [Q26.02](modules/26-signal-forms.md#q26-02) | Difference | Where does the form's data live in Signal Forms, reactive forms and template-driven forms, and what is the source of truth in each? |
| [Q26.03](modules/26-signal-forms.md#q26-03) | Output | A write through a field, a `set` on the model and `f().value() === model()`: what do the model and the field read after each? |
| [Q26.04](modules/26-signal-forms.md#q26-04) | Concept | What is a field tree, what does calling a field return, and which signals does a `FieldState` expose? |
| [Q26.05](modules/26-signal-forms.md#q26-05) | Bug hunt | A profile form built from an `input()` does not compile, and one built from `signal(this.user())` never shows the next user: why, and what does `linkedSignal` fix? |
| [Q26.06](modules/26-signal-forms.md#q26-06) | Output | A `[formField]` text input with `required` and a number input with `min(18)`: which attributes appear, what do typing `42` and clearing the number write to the model, and which classes appear? |
| [Q26.07](modules/26-signal-forms.md#q26-07) | Concept | How does `[formField]` keep a native input and a field in sync in both directions, and why does a zoneless view repaint without `markForCheck`? |
| [Q26.08](modules/26-signal-forms.md#q26-08) | Difference | Status classes: why does a Signal Forms input get no `ng-invalid` class, and what does `NG_STATUS_CLASSES` restore? |
| [Q26.09](modules/26-signal-forms.md#q26-09) | Output | `required`, `min(18)`, `email` and `minLength(3, { message })` on an empty name, an age of 10 and a bad email: what do the fields' `errors()`, the root's `errors()`, `errorSummary()` and `valid()` return? |
| [Q26.10](modules/26-signal-forms.md#q26-10) | Concept | How do you write a custom rule with `validate`, what may it return, and how do `schema()` and `apply` make rules reusable? |
| [Q26.11](modules/26-signal-forms.md#q26-11) | Output | `min` on a `string` field in v22: what does the compiler report, and what did the v21 typings accept? |
| [Q26.12](modules/26-signal-forms.md#q26-12) | Trade-off | Rules in the schema, a Standard Schema validator with `validateStandardSchema`, or both: where should validation live? |
| [Q26.13](modules/26-signal-forms.md#q26-13) | Output | A password confirmation with `validate` on `confirm`, a `validateTree` that targets `pw`, and `applyWhen` for a company VAT number: which field holds each error, before and after the toggle? |
| [Q26.14](modules/26-signal-forms.md#q26-14) | Output | A required field that is disabled, one that is hidden and one that is readonly: what are their `errors()` and `valid()`, the root's `valid()`, and what changes when the condition turns false? |
| [Q26.15](modules/26-signal-forms.md#q26-15) | Difference | `disabled`, `hidden` and `readonly`: what does each do to validation, the parent's state, submission and the bound element? |
| [Q26.16](modules/26-signal-forms.md#q26-16) | Bug hunt | A field wrapped in `@if` still blocks the form, and a `disabled(p.x, () => …)` call is flagged as deprecated: find both bugs. |
| [Q26.17](modules/26-signal-forms.md#q26-17) | Output | A `validateAsync` username check: what are `pending()`, `valid()` and `invalid()` while it loads, how many loader calls run, and what are the errors after it resolves? |
| [Q26.18](modules/26-signal-forms.md#q26-18) | Concept | How does async validation work under the hood: one `resource` per field, skipped while sync rules fail, and replaced on every change? |
| [Q26.19](modules/26-signal-forms.md#q26-19) | Difference | The `debounce()` rule or the `debounce` option of `validateAsync`: what does each delay, and what does blur do to a pending value? |
| [Q26.20](modules/26-signal-forms.md#q26-20) | Design | Design a username-availability check with Signal Forms: one request per typing pause, none for invalid input, a visible pending state and a server failure path. |
| [Q26.21](modules/26-signal-forms.md#q26-21) | Output | Submitting an invalid form, then a valid one whose action returns a server error, then editing the field: what do `submit()`, `touched()`, `submitting()` and `errors()` give at each step? |
| [Q26.22](modules/26-signal-forms.md#q26-22) | Concept | What does `FormRoot` do on a `<form>`, and when do you call `submit()` yourself? |
| [Q26.23](modules/26-signal-forms.md#q26-23) | Trade-off | `ignoreValidators` set to `'pending'`, `'none'` or `'all'`: which for which form, and what can go wrong with the default? |
| [Q26.24](modules/26-signal-forms.md#q26-24) | Concept | What is the `FormValueControl` contract: which member is required, which inputs are bound for you, and how does the control report touched? |
| [Q26.25](modules/26-signal-forms.md#q26-25) | Output | A `ControlValueAccessor` component bound with `[formField]`: in what order are its methods called, and does a change from the component update the model and mark it dirty? |
| [Q26.26](modules/26-signal-forms.md#q26-26) | Bug hunt | A custom control declares both `value` and `checked`: what does the compiler report, and what is the fix? |
| [Q26.27](modules/26-signal-forms.md#q26-27) | Trade-off | Migrating a reactive-forms app: top-down with `compatForm`, bottom-up with `SignalFormControl`, or not at all: which, and when? |
| [Q26.28](modules/26-signal-forms.md#q26-28) | Concept | What changed between the v21 experimental API and v22, and which changes break code on upgrade? |

### 27 · HTTP client

| ID | Type | Question |
|---|---|---|
| [Q27.01](modules/27-http-client.md#q27-01) | Concept | What does `HttpClient` add on top of `fetch`, and what does it still leave to the browser? |
| [Q27.02](modules/27-http-client.md#q27-02) | Trade-off | `HttpClient`, plain `fetch` or a `resource` over `fetch` in an Angular app: which, and what do you give up with each? |
| [Q27.03](modules/27-http-client.md#q27-03) | Output | No provider, `provideHttpClient()`, `withXhr()`, `withFetch()` and `HttpClientModule`: which `HttpBackend` does each give? |
| [Q27.04](modules/27-http-client.md#q27-04) | Concept | What does `provideHttpClient` register, and why can a v22 app inject `HttpClient` without calling it? |
| [Q27.05](modules/27-http-client.md#q27-05) | Difference | The fetch backend versus the XHR backend: what changes for upload progress, timeouts and SSR, and what does `ng update` to v22 do to your `provideHttpClient` calls? |
| [Q27.06](modules/27-http-client.md#q27-06) | Output | A child injector with its own `provideHttpClient`, with and without `withRequestsMadeViaParent`: whose interceptors run, and which backend gets the request? |
| [Q27.07](modules/27-http-client.md#q27-07) | Output | `observe: 'response'`, `observe: 'events'` and `responseType: 'text'`: what does each subscriber receive? |
| [Q27.08](modules/27-http-client.md#q27-08) | Output | `HttpParams.set` without reassignment, `append`, and a params object with an array: which URL goes out? |
| [Q27.09](modules/27-http-client.md#q27-09) | Bug hunt | `get<User>()` delivers an object with no `name` and the template breaks later: why did the type not catch it, and where does the fix belong? |
| [Q27.10](modules/27-http-client.md#q27-10) | Concept | What is `HttpContext`, and why switch an interceptor off with a context token rather than a custom header? |
| [Q27.11](modules/27-http-client.md#q27-11) | Output | Two functional interceptors A and B, where A adds a header: in what order do the request and response logs print, and what does B see? |
| [Q27.12](modules/27-http-client.md#q27-12) | Concept | How does Angular build the interceptor chain from `withInterceptors`, what is `next`, and where does the built-in XSRF interceptor sit? |
| [Q27.13](modules/27-http-client.md#q27-13) | Difference | Functional interceptors versus class interceptors under `withInterceptorsFromDi`: registration, order, injection and migration. |
| [Q27.14](modules/27-http-client.md#q27-14) | Design | Order an interceptor stack for auth, a correlation ID, retry, error mapping and logging, and justify each position. |
| [Q27.15](modules/27-http-client.md#q27-15) | Output | A 404 with a JSON body, a network failure and invalid JSON on a 200: what are the `status`, `error` and `message` of each `HttpErrorResponse`? |
| [Q27.16](modules/27-http-client.md#q27-16) | Design | Design an error mapping layer that turns `HttpErrorResponse` into errors the UI can render. |
| [Q27.17](modules/27-http-client.md#q27-17) | Output | A retry interceptor with backoff and jitter: how many requests do a 503 GET, a 400 GET, a 503 POST and an opted-out GET make? |
| [Q27.18](modules/27-http-client.md#q27-18) | Trade-off | Retry in an interceptor or at the call site: which methods and statuses are safe to retry, and what do jitter and idempotency keys add? |
| [Q27.19](modules/27-http-client.md#q27-19) | Output | Unsubscribing from a request on the fetch backend, and a `timeout` that expires: what happens to the `AbortSignal`, and what error arrives? |
| [Q27.20](modules/27-http-client.md#q27-20) | Design | Design a GET cache interceptor: the key, a time to live, invalidation on writes, sharing an in-flight request, and what must never be cached. |
| [Q27.21](modules/27-http-client.md#q27-21) | Trade-off | A cache interceptor, `shareReplay` in a service, `httpResource`, the browser HTTP cache or the SSR transfer cache: which for which data? |
| [Q27.22](modules/27-http-client.md#q27-22) | Concept | How do you attach a bearer token with a functional interceptor, and why must it check the request URL first? |
| [Q27.23](modules/27-http-client.md#q27-23) | Output | Two requests fail with 401 at once behind a refresh interceptor: how many refresh calls run, and which token do the retries carry? |
| [Q27.24](modules/27-http-client.md#q27-24) | Bug hunt | A refresh interceptor loops when the refresh itself returns 401, and it fires one refresh per failed request: find both bugs. |
| [Q27.25](modules/27-http-client.md#q27-25) | Output | With an `XSRF-TOKEN` cookie set, which of seven requests carry `X-XSRF-TOKEN`, and with which value? |
| [Q27.26](modules/27-http-client.md#q27-26) | Concept | How does the cookie-to-header pattern stop CSRF, and which half must the server implement? |
| [Q27.27](modules/27-http-client.md#q27-27) | Bug hunt | The API moved to `api.example.com` and every POST now fails the server's CSRF check: why did Angular stop sending the header, and what are the fixes? |
| [Q27.28](modules/27-http-client.md#q27-28) | Output | `reportUploadProgress: true` on the default backend, and on a testing backend that emits an upload progress event: what does each subscriber receive? |
| [Q27.29](modules/27-http-client.md#q27-29) | Difference | `reportProgress` versus `reportUploadProgress` and `reportDownloadProgress`: what does each report, and which backend supports which? |
| [Q27.30](modules/27-http-client.md#q27-30) | Output | An `httpResource` whose URL goes from `undefined` to `/users/1` to `/users/2`, then gets a 404 and a `reload()`: which statuses, requests and cancellations appear? |
| [Q27.31](modules/27-http-client.md#q27-31) | Concept | What does `httpResource` add to `resource`: request objects, `parse`, `defaultValue`, `headers`, `statusCode` and `progress`? |
| [Q27.32](modules/27-http-client.md#q27-32) | Trade-off | `httpResource`, `HttpClient` or `rxResource` for a screen's data: which for reads, which for writes, and when does each win? |
| [Q27.33](modules/27-http-client.md#q27-33) | Bug hunt | One test lists `provideHttpClientTesting()` before `provideHttpClient(withInterceptors(...))`, another waits for a `timeout` to fire: why does each fail? |
| [Q27.34](modules/27-http-client.md#q27-34) | Concept | How does `HttpTestingController` work: what does `provideHttpClientTesting` replace, how do you answer requests, and what do `verify()` and `whenStable()` add? |

### 28 · State management

| ID | Type | Question |
|---|---|---|
| [Q28.01](modules/28-state-management.md#q28-01) | Concept | Server cache, UI, form, URL and session state: what is each, and where does each belong in an Angular app? |
| [Q28.02](modules/28-state-management.md#q28-02) | Bug hunt | A product list keeps its filters and page in a root service: why do reload, the back button and a shared link lose them, and where do they belong? |
| [Q28.03](modules/28-state-management.md#q28-03) | Difference | Server state versus client state: why does copying API responses into a store bring stale data and duplicated loading flags? |
| [Q28.04](modules/28-state-management.md#q28-04) | Design | Design a feature store as a service with signals: state shape, derived selectors, methods, async loading and errors. |
| [Q28.05](modules/28-state-management.md#q28-05) | Output | One state signal holds items, a filter and a loading flag: which computeds re-run when only the flag changes? |
| [Q28.06](modules/28-state-management.md#q28-06) | Bug hunt | Two `load()` calls on a signal store resolve out of order and the older response wins: find the bug and two fixes. |
| [Q28.07](modules/28-state-management.md#q28-07) | Output | A `BehaviorSubject` store with a `select` built from `map` and `distinctUntilChanged`: what does a subscriber receive after a flag change, an items change and an in-place push? |
| [Q28.08](modules/28-state-management.md#q28-08) | Concept | Action, reducer, store, selector and effect: how does one click travel through NgRx Store, and why must the reducer be pure? |
| [Q28.09](modules/28-state-management.md#q28-09) | Output | `createActionGroup` with source `Todos Page` and events `Add Todo` and `Clear All`: which creator names and type strings does it produce? |
| [Q28.10](modules/28-state-management.md#q28-10) | Concept | Which runtime checks does NgRx Store run in development, what does each catch, and why are they off in production? |
| [Q28.11](modules/28-state-management.md#q28-11) | Output | `createFeature` named `todos` with a reducer over `items` and `n`: which members does it return? |
| [Q28.12](modules/28-state-management.md#q28-12) | Output | A `createSelector` projector called with the same state, a new root with the same slice and a new slice with equal contents: how many times does it run? |
| [Q28.13](modules/28-state-management.md#q28-13) | Bug hunt | A selector with props and a selector factory called from a template method: why does each misbehave, and what replaces them? |
| [Q28.14](modules/28-state-management.md#q28-14) | Difference | `store.select`, `store.selectSignal` and `toSignal(store.select(...))`: what does each return, and which belongs in a component? |
| [Q28.15](modules/28-state-management.md#q28-15) | Concept | What is a functional effect, how is it registered with `provideEffects`, and what do `dispatch: false` and the effects error handler change? |
| [Q28.16](modules/28-state-management.md#q28-16) | Output | A non-dispatching effect throws on the second of three actions and has no `catchError`: which actions reach it, and what is logged? |
| [Q28.17](modules/28-state-management.md#q28-17) | Bug hunt | A loading effect with `catchError` outside `switchMap` handles the first failure and then ignores every later action: why does the error handler not save it? |
| [Q28.18](modules/28-state-management.md#q28-18) | Output | An entity adapter with a `sortComparer`: what are `ids` and `entities` after `addMany`, and does `updateOne` keep the untouched entity's reference? |
| [Q28.19](modules/28-state-management.md#q28-19) | Trade-off | Router Store or reading the router directly: when is the URL worth mirroring into the store? |
| [Q28.20](modules/28-state-management.md#q28-20) | Concept | What does Redux DevTools time travel need from your actions and state, and what do `maxAge` and `logOnly` change? |
| [Q28.21](modules/28-state-management.md#q28-21) | Difference | ComponentStore versus SignalStore: API shape, reactivity and status in NgRx 22, and when you still meet ComponentStore. |
| [Q28.22](modules/28-state-management.md#q28-22) | Output | Mutating state read from NgRx Store and from a SignalStore in development, and calling `patchState` from outside a store: which throw, and which fail to compile? |
| [Q28.23](modules/28-state-management.md#q28-23) | Design | Provide a SignalStore in root, on a route or on a component: what changes for sharing, lifetime and `withHooks`? |
| [Q28.24](modules/28-state-management.md#q28-24) | Output | An `rxMethod` called with a value, a signal and an Observable, and one created outside an injection context: what reaches the pipeline, and what is reported? |
| [Q28.25](modules/28-state-management.md#q28-25) | Output | `withEntities` after two adds and a toggle: what do `ids`, `entityMap` and `entities` hold, and why does `addEntity` with a literal `done: false` fail to compile? |
| [Q28.26](modules/28-state-management.md#q28-26) | Design | Write a reusable `withRequestStatus()` feature and use it in two stores: what does `signalStoreFeature` compose, and what does `type<>()` add? |
| [Q28.27](modules/28-state-management.md#q28-27) | Trade-off | The Events plugin or plain `withMethods`: when is an event-driven SignalStore worth its ceremony? |
| [Q28.28](modules/28-state-management.md#q28-28) | Design | Design an optimistic update with rollback: what do you keep, when do you roll back, and what happens when two edits overlap? |
| [Q28.29](modules/28-state-management.md#q28-29) | Concept | Why normalize a collection into ids and an entity map, and what does normalization cost? |
| [Q28.30](modules/28-state-management.md#q28-30) | Output | Undo and redo with past, present and future stacks: what do the stacks hold after edit, edit, undo, edit? |
| [Q28.31](modules/28-state-management.md#q28-31) | Difference | TanStack Query for Angular versus NgRx, NGXS and Elf: which solve the server cache, which hold client state, and what is each package's status? |
| [Q28.32](modules/28-state-management.md#q28-32) | Trade-off | When is a store library justified: team size, cross-cutting state, time travel, and server cache versus client state? |
| [Q28.33](modules/28-state-management.md#q28-33) | Concept | Under the hood of NgRx Store: how do `ActionsSubject`, the reducer manager and `State` turn a dispatch into a new state and a selector emission? |
| [Q28.34](modules/28-state-management.md#q28-34) | Output | `patchState` with an unchanged value and with an unknown key: which computeds re-run, and what is logged? |

### 29 · Testing Angular

| ID | Type | Question |
|---|---|---|
| [Q29.01](modules/29-testing-angular.md#q29-01) | Concept | Unit, integration, component and end-to-end tests in an Angular app: what does each one exercise, and which tool runs it? |
| [Q29.02](modules/29-testing-angular.md#q29-02) | Trade-off | The testing pyramid or the testing trophy: how should an Angular team split its tests, and what decides the split? |
| [Q29.03](modules/29-testing-angular.md#q29-03) | Concept | What does `ng test` do with `@angular/build:unit-test`: what does it compile, where do the tests run, and what is set up before your first line? |
| [Q29.04](modules/29-testing-angular.md#q29-04) | Difference | jsdom or Vitest browser mode: what does each give a component test, and what does each cost? |
| [Q29.05](modules/29-testing-angular.md#q29-05) | Output | An Angular spec calls `vi.mock('./api')`: what happens, and what should the test do instead? |
| [Q29.06](modules/29-testing-angular.md#q29-06) | Design | Migrate a Karma and Jasmine suite to Vitest: which builder change, which schematic, and what is left for you to fix by hand? |
| [Q29.07](modules/29-testing-angular.md#q29-07) | Trade-off | Vitest through the CLI, Jest through `jest-preset-angular`, or staying on Karma: which would you pick for a large existing suite? |
| [Q29.08](modules/29-testing-angular.md#q29-08) | Concept | What does `TestBed.configureTestingModule` build, what do `TestBed.inject` and `runInInjectionContext` give you, and what is reset between tests? |
| [Q29.09](modules/29-testing-angular.md#q29-09) | Output | A test calls `TestBed.inject` and then `configureTestingModule`: what is thrown, and why? |
| [Q29.10](modules/29-testing-angular.md#q29-10) | Difference | `TestBed.inject`, the legacy `inject([...], fn)` helper and `TestBed.runInInjectionContext`: when does each apply? |
| [Q29.11](modules/29-testing-angular.md#q29-11) | Output | A zoneless fixture: what does the DOM show right after `createComponent` and `setInput`, and after `await fixture.whenStable()`? |
| [Q29.12](modules/29-testing-angular.md#q29-12) | Difference | `fixture.detectChanges()`, `TestBed.tick()` and `await fixture.whenStable()` in a zoneless test: what does each run, and which should a test use? |
| [Q29.13](modules/29-testing-angular.md#q29-13) | Output | A test writes a plain field of an OnPush component, then a signal: what do `detectChanges`, `whenStable` and `markForCheck` show? |
| [Q29.14](modules/29-testing-angular.md#q29-14) | Bug hunt | A migrated suite calls `fixture.autoDetectChanges(false)` and now throws: why, and what replaces manual detection? |
| [Q29.15](modules/29-testing-angular.md#q29-15) | Concept | How do you set signal inputs and observe outputs in a component test: `setInput`, `bindings` or a host component? |
| [Q29.16](modules/29-testing-angular.md#q29-16) | Output | `triggerEventHandler('click')` versus a native `click()` on a button inside a clickable card: which handlers run? |
| [Q29.17](modules/29-testing-angular.md#q29-17) | Bug hunt | A spec queries `.btn-primary` and reads `componentInstance` state instead of the DOM: what breaks on the next refactor, and how do you test from the user's side? |
| [Q29.18](modules/29-testing-angular.md#q29-18) | Difference | Dummy, stub, spy, mock and fake: what is each, and which one does `vi.fn()` give you? |
| [Q29.19](modules/29-testing-angular.md#q29-19) | Output | A provider override with `{ load: vi.fn().mockResolvedValue([...]) }`: what does the component render, and what do `mock.calls` hold? |
| [Q29.20](modules/29-testing-angular.md#q29-20) | Trade-off | Over-mocking: when does a fake beat a `vi.fn` stub, and when should the test use the real dependency? |
| [Q29.21](modules/29-testing-angular.md#q29-21) | Concept | Testing a pure pipe and a service: when is `new` enough, and when do you need `TestBed`? |
| [Q29.22](modules/29-testing-angular.md#q29-22) | Output | `TestBed.createDirective` on an attribute directive: what happens without `tagName`, and what does the host render with one? |
| [Q29.23](modules/29-testing-angular.md#q29-23) | Output | A functional guard run through `TestBed.runInInjectionContext`: what does it return before and after the signal it reads flips? |
| [Q29.24](modules/29-testing-angular.md#q29-24) | Design | A lazy feature provides its own `HttpClient`: why does the root `HttpTestingController` see none of its requests, and how do you test it? |
| [Q29.25](modules/29-testing-angular.md#q29-25) | Design | Test a reactive form in a component: what do you drive, DOM events or the `FormControl`, and what do you assert? |
| [Q29.26](modules/29-testing-angular.md#q29-26) | Output | An effect and a `resource` in a test: what do they show after `set`, after `TestBed.tick()`, and after `await ApplicationRef.whenStable()`? |
| [Q29.27](modules/29-testing-angular.md#q29-27) | Trade-off | A component reads an NgRx store or a SignalStore: test it with `provideMockStore`, the real store, or a fake? |
| [Q29.28](modules/29-testing-angular.md#q29-28) | Output | `vi.useFakeTimers()` and a zoneless fixture: why does `await fixture.whenStable()` hang, and what makes it resolve? |
| [Q29.29](modules/29-testing-angular.md#q29-29) | Difference | Vitest fake timers versus `fakeAsync`, `tick` and `flush`: what does each fake, and why does `fakeAsync` need zone.js? |
| [Q29.30](modules/29-testing-angular.md#q29-30) | Output | `fakeAsync` and `waitForAsync` in a zoneless Vitest spec, and again with `zone.js` imported in the spec: what is thrown or rejected? |
| [Q29.31](modules/29-testing-angular.md#q29-31) | Bug hunt | A debounced-search test advances 300 ms but the results never render, and the next test in the file times out: find both bugs. |
| [Q29.32](modules/29-testing-angular.md#q29-32) | Concept | What is a component harness, and why does a harness-based test survive a template refactor that breaks a CSS-selector test? |
| [Q29.33](modules/29-testing-angular.md#q29-33) | Difference | CDK component harnesses versus Angular Testing Library: what does each query by, what does each hide, and can they be combined? |
| [Q29.34](modules/29-testing-angular.md#q29-34) | Concept | Under the hood: how does the unit-test builder initialize `TestBed` once and clean it per test, and how does a zoneless fixture know it is stable? |

### 30 · End-to-end tests and testing strategy

| ID | Type | Question |
|---|---|---|
| [Q30.01](modules/30-e2e-and-testing-strategy.md#q30-01) | Design | Pick the end-to-end tests for a shop's checkout: which journeys earn a browser test, and what stays in unit and component tests? |
| [Q30.02](modules/30-e2e-and-testing-strategy.md#q30-02) | Concept | `ng e2e` in an Angular 22 project: what does it run, why does a new project have no e2e target, and what happened to Protractor? |
| [Q30.03](modules/30-e2e-and-testing-strategy.md#q30-03) | Difference | Playwright versus Cypress: where does the test code run, how does each drive the browser, and what does that allow or forbid? |
| [Q30.04](modules/30-e2e-and-testing-strategy.md#q30-04) | Output | A button's label changes to "Saved" 500 ms after a click: does `await expect(button).toHaveText('Saved')` pass, and what does `await button.textContent()` return right after the click? |
| [Q30.05](modules/30-e2e-and-testing-strategy.md#q30-05) | Difference | Playwright's actionability checks and web-first assertions versus Cypress's retry-ability: what is retried, and what is not? |
| [Q30.06](modules/30-e2e-and-testing-strategy.md#q30-06) | Output | Two rows each have a "Delete" button: what does `page.getByRole('button', { name: 'Delete' }).click()` do, and how do you target one row? |
| [Q30.07](modules/30-e2e-and-testing-strategy.md#q30-07) | Concept | Which locator should an end-to-end test prefer (role, label, text, test id or CSS), and why does a role locator double as an accessibility check? |
| [Q30.08](modules/30-e2e-and-testing-strategy.md#q30-08) | Trade-off | Page objects or Playwright fixtures: how should a suite share page knowledge and setup? |
| [Q30.09](modules/30-e2e-and-testing-strategy.md#q30-09) | Output | Two `page.route` handlers match the same API URL: which one answers, and what changes when the later one calls `route.fallback()`? |
| [Q30.10](modules/30-e2e-and-testing-strategy.md#q30-10) | Trade-off | Mock the network, run a stub server, or use the real backend: what does each end-to-end setup prove, and where do contract tests take over? |
| [Q30.11](modules/30-e2e-and-testing-strategy.md#q30-11) | Design | Add visual regression tests to an Angular app without drowning in false failures: baselines, platforms, masking and thresholds. |
| [Q30.12](modules/30-e2e-and-testing-strategy.md#q30-12) | Difference | `toHaveScreenshot`, `toMatchAriaSnapshot` and an axe scan: which regression does each catch, and which does each miss? |
| [Q30.13](modules/30-e2e-and-testing-strategy.md#q30-13) | Bug hunt | A test passes alone and fails in the full suite one run in ten: find the three causes in this spec. |
| [Q30.14](modules/30-e2e-and-testing-strategy.md#q30-14) | Concept | How do you find the cause of a flaky end-to-end test: traces, `--repeat-each`, retries as detection, and quarantine? |
| [Q30.15](modules/30-e2e-and-testing-strategy.md#q30-15) | Output | With `retries: 1`, a test fails on its first attempt and passes on the retry: what status does the JSON report give it, and what exit code does the run return with and without `--fail-on-flaky-tests`? |
| [Q30.16](modules/30-e2e-and-testing-strategy.md#q30-16) | Design | Design the CI stage for 400 end-to-end tests that must finish in about ten minutes: workers, shards, retries, artifacts and test data. |
| [Q30.17](modules/30-e2e-and-testing-strategy.md#q30-17) | Trade-off | Retries in CI: safety net or hiding place? What retries policy would you set, and how do you keep flaky tests visible? |
| [Q30.18](modules/30-e2e-and-testing-strategy.md#q30-18) | Output | `--shard=2/3` over four test files without `fullyParallel` (one file with 3 tests, three with 1): which tests run in shard 2, and what changes with `fullyParallel`? |

### 31 · Performance

| ID | Type | Question |
|---|---|---|
| [Q31.01](modules/31-performance.md#q31-01) | Design | "The app feels slow": how do you find out where, before changing any code? |
| [Q31.02](modules/31-performance.md#q31-02) | Difference | Lighthouse, the Chrome Performance panel, the Angular DevTools profiler and field data: which question does each answer? |
| [Q31.03](modules/31-performance.md#q31-03) | Output | A heading paints, then a larger hero image, then the user clicks and a bigger block appears: which `largest-contentful-paint` entries does a buffered observer report? |
| [Q31.04](modules/31-performance.md#q31-04) | Output | A banner is inserted above the content after load, once without reserved space and once into a box of the same height: what `layout-shift` entries are reported? |
| [Q31.05](modules/31-performance.md#q31-05) | Design | Put performance into CI: Lighthouse assertions, bundle budgets and lab metrics in end-to-end tests. What does each catch, and what can none of them catch? |
| [Q31.06](modules/31-performance.md#q31-06) | Concept | Which runtime levers still matter in a v22 zoneless, OnPush-by-default app, and which classic advice no longer buys anything? |
| [Q31.07](modules/31-performance.md#q31-07) | Bug hunt | Typing in a dashboard's search box is slow: a template method filtering 5,000 rows, `track $index` on a sortable table and an `Eager` clock widget. Find the costs and the fixes. |
| [Q31.08](modules/31-performance.md#q31-08) | Trade-off | A store holds 10,000 entities and one changes every second: one list-wide selector or a `computed` per row? What does each recompute, and when does it matter? |
| [Q31.09](modules/31-performance.md#q31-09) | Output | 10,000 rows of 40 px in a 400 px `cdk-virtual-scroll-viewport`: how many rows are in the DOM at the top, and after scrolling to row 5,000? |
| [Q31.10](modules/31-performance.md#q31-10) | Trade-off | Virtual scrolling, pagination, infinite loading or `content-visibility: auto`: which for which long list? |
| [Q31.11](modules/31-performance.md#q31-11) | Bug hunt | A virtual-scrolled chat jumps and shows blank gaps: rows of varying height with a fixed `itemSize`, a row that keeps its own state, and a viewport with no height. Find each cause. |
| [Q31.12](modules/31-performance.md#q31-12) | Design | Plan what loads when for an app with a public landing page, a dashboard and an admin area: initial bundle, lazy routes, `@defer` and preloading. |
| [Q31.13](modules/31-performance.md#q31-13) | Difference | A lazy route, a `@defer` block and a dynamic `import()` in a service: what does each split out, and what starts each download? |
| [Q31.14](modules/31-performance.md#q31-14) | Concept | What does `ng build --stats-json` write, and how do you find out why a package ended up in the initial bundle? |
| [Q31.15](modules/31-performance.md#q31-15) | Output | Three unused exports through a barrel: a pure function, a function in a file with a top-level side effect and a class with a static block. Which survive in the production chunk? |
| [Q31.16](modules/31-performance.md#q31-16) | Difference | source-map-explorer versus the esbuild metafile: what does each attribute bytes to, and why can their numbers differ? |
| [Q31.17](modules/31-performance.md#q31-17) | Design | The `initial` budget fails in CI after a merge: walk through the investigation and the fix. |
| [Q31.18](modules/31-performance.md#q31-18) | Output | `NgOptimizedImage` with a custom loader, once with `priority` and once without: which `loading`, `fetchpriority`, `decoding` and `srcset` attributes render? |
| [Q31.19](modules/31-performance.md#q31-19) | Concept | `fill` mode, `sizes` and a responsive `srcset`: what does `NgOptimizedImage` generate, and what must the parent element provide? |
| [Q31.20](modules/31-performance.md#q31-20) | Bug hunt | Review these images: an LCP image without `priority`, an `ngSrc` without dimensions, a `placeholder` with no loader and a placeholder on a very large image. What does development mode report, and why does production stay silent? |
| [Q31.21](modules/31-performance.md#q31-21) | Design | Find a memory leak in an Angular route with Chrome DevTools: which snapshots, what to compare, what "Detached" means and how to read retainers. |
| [Q31.22](modules/31-performance.md#q31-22) | Output | A panel is opened and closed ten times: how many instances of its class survive a forced garbage collection, before and after the fix? |
| [Q31.23](modules/31-performance.md#q31-23) | Bug hunt | Leaks that unit tests miss: a root service that keeps component instances, an `effect` that adds a listener without cleanup, a component made with `createComponent` and never destroyed, and a chart instance never disposed. |
| [Q31.24](modules/31-performance.md#q31-24) | Concept | How does `ng generate web-worker` wire a worker, how does the build bundle it, and what can a worker not do? |
| [Q31.25](modules/31-performance.md#q31-25) | Trade-off | A long task blocks input: a Web Worker, splitting the work into tasks, `runOutsideAngular` or a better algorithm. Which cure when? |
| [Q31.26](modules/31-performance.md#q31-26) | Trade-off | CSR, SSR or SSG for a marketing page, a logged-in dashboard and a product catalog: what does each do to LCP and INP, and what does it cost? |
| [Q31.27](modules/31-performance.md#q31-27) | Concept | How does the CDK's fixed-size strategy decide which rows to render as you scroll, and why must `itemSize` be exact? |

### 32 · SSR, SSG and hydration

| ID | Type | Question |
|---|---|---|
| [Q32.01](modules/32-ssr-ssg-hydration.md#q32-01) | Concept | What do CSR, SSR, SSG and hybrid rendering mean in Angular, and what do search engines and link previews gain from server HTML? |
| [Q32.02](modules/32-ssr-ssg-hydration.md#q32-02) | Trade-off | When is server rendering not worth it: server cost, time to first byte, hydration work and browser-only code? |
| [Q32.03](modules/32-ssr-ssg-hydration.md#q32-03) | Output | A client that runs no JavaScript requests the same product page from a `Client` route and a `Server` route: which title, description meta tag and content does each HTML response contain? |
| [Q32.04](modules/32-ssr-ssg-hydration.md#q32-04) | Concept | What does `ng add @angular/ssr` change: which files, which `angular.json` options and which dependencies, and what does each file do? |
| [Q32.05](modules/32-ssr-ssg-hydration.md#q32-05) | Output | After `ng build` with `outputMode: 'server'`, which folders and prerendered `index.html` files are in `dist/`, and which file starts the server? |
| [Q32.06](modules/32-ssr-ssg-hydration.md#q32-06) | Difference | `RenderMode.Server`, `RenderMode.Client` and `RenderMode.Prerender`: when is the HTML produced, what does the response contain, and what can each page read? |
| [Q32.07](modules/32-ssr-ssg-hydration.md#q32-07) | Output | `getPrerenderParams` returns ids 1 and 2 on three routes whose fallbacks are `Server`, `Client` and `None`: what does a request for id 1 and for id 3 get on each? |
| [Q32.08](modules/32-ssr-ssg-hydration.md#q32-08) | Bug hunt | Review these server routes: a prerendered page that greets the user from a cookie, a `status` on a `Prerender` route, a `redirectTo` on a prerendered route expected to send 301, and a `getPrerenderParams` that returns numbers. |
| [Q32.09](modules/32-ssr-ssg-hydration.md#q32-09) | Design | Choose render modes, fallbacks and cache headers for a shop: home, 20,000 product pages, search, cart, account and admin. |
| [Q32.10](modules/32-ssr-ssg-hydration.md#q32-10) | Concept | What is hydration, and why does Angular reuse the server's DOM instead of rendering the page again? |
| [Q32.11](modules/32-ssr-ssg-hydration.md#q32-11) | Output | A script marks the server-rendered heading before the app boots: after hydration, is the marked node still in the page, with and without `ngSkipHydration`? |
| [Q32.12](modules/32-ssr-ssg-hydration.md#q32-12) | Bug hunt | Hydration mismatches: a component that appends nodes with `document.createElement`, a `<div>` inside a `<p>`, and an `@if` on `isPlatformBrowser` that renders different elements. Which error does each raise, and what is the fix? |
| [Q32.13](modules/32-ssr-ssg-hydration.md#q32-13) | Output | A user clicks "Add to cart" while the app's JavaScript is still loading: what does the counter show after hydration? |
| [Q32.14](modules/32-ssr-ssg-hydration.md#q32-14) | Concept | How does event replay work: the inline contract script, the `jsaction` attributes, the queue and the replay; and why is it on by default in v22? |
| [Q32.15](modules/32-ssr-ssg-hydration.md#q32-15) | Output | `@defer (on viewport)`, `@defer (hydrate on interaction)` and `@defer (hydrate never)` on a server-rendered page: what does the HTML contain, and which chunk loads when? |
| [Q32.16](modules/32-ssr-ssg-hydration.md#q32-16) | Concept | Nested `@defer` blocks with `hydrate` triggers: in which order do they hydrate, why is `@placeholder` still needed, and what happens on a later client-side navigation? |
| [Q32.17](modules/32-ssr-ssg-hydration.md#q32-17) | Design | Plan incremental hydration for a product page: header, image gallery, reviews, recommendations, a chat widget and the footer. |
| [Q32.18](modules/32-ssr-ssg-hydration.md#q32-18) | Bug hunt | A component reads `window.innerWidth` in its constructor, a service uses `localStorage`, and a directive calls `focus()` in `ngOnInit`: what happens on the server, and how do you fix each? |
| [Q32.19](modules/32-ssr-ssg-hydration.md#q32-19) | Trade-off | `isPlatformBrowser`, `afterNextRender` or a server-specific provider: which for which browser-only code? |
| [Q32.20](modules/32-ssr-ssg-hydration.md#q32-20) | Output | A not-found page sets `RESPONSE_INIT.status` to 404 and a page renders the `Accept-Language` header read from `REQUEST`: what does a server-rendered request return, and what does the prerendered page show? |
| [Q32.21](modules/32-ssr-ssg-hydration.md#q32-21) | Concept | What is the HTTP transfer cache: what does it store, which requests does it skip by default, and when does the browser stop reading it? |
| [Q32.22](modules/32-ssr-ssg-hydration.md#q32-22) | Output | A product list loads `/api/catalog` with `HttpClient`: how many browser requests reach `/api` on the first server-rendered load, after a client-side navigation away and back, and with `transferCache: false`? |
| [Q32.23](modules/32-ssr-ssg-hydration.md#q32-23) | Bug hunt | Transfer cache traps: a request with an `Authorization` header fetched twice, an API called through an internal host on the server, a GraphQL `POST` that is never cached, and a personalized response inside shared HTML. |
| [Q32.24](modules/32-ssr-ssg-hydration.md#q32-24) | Difference | `TransferState` with `makeStateKey`, `resource` with an `id` and the HTTP transfer cache: what does each carry to the browser, and when do you need each? |
| [Q32.25](modules/32-ssr-ssg-hydration.md#q32-25) | Design | Deploy an SSR app on a Node server behind a CDN, on an edge runtime or on static hosting: what do you configure (`allowedHosts`, `trustProxyHeaders`, cache headers), and which responses may a shared cache store? |
| [Q32.26](modules/32-ssr-ssg-hydration.md#q32-26) | Concept | Follow a request through `AngularNodeAppEngine`: host validation, route matching, the render mode, rendering, waiting for stability and the serialized page. |
| [Q32.27](modules/32-ssr-ssg-hydration.md#q32-27) | Concept | How does the client hydrate: reading the `ngh` annotations, claiming DOM nodes, the dehydrated block registry, and why a structure mismatch throws instead of being patched? |

### 33 · Security

| ID | Type | Question |
|---|---|---|
| [Q33.01](modules/33-security.md#q33-01) | Concept | What is the threat model of an Angular single-page app: what does an attacker control, what runs on the user's device, and which defenses live in the browser and which on the server? |
| [Q33.02](modules/33-security.md#q33-02) | Design | Threat-model a payments single-page app in an interview: list the assets, entry points and trust boundaries, and map each threat to a client or server control. |
| [Q33.03](modules/33-security.md#q33-03) | Concept | What are stored, reflected and DOM-based XSS, and which of them does Angular's template model stop by default? |
| [Q33.04](modules/33-security.md#q33-04) | Output | One payload, four sinks: interpolation, `[innerHTML]`, `[textContent]` and `nativeElement.innerHTML`. What ends up in the DOM, and does the payload's handler run? |
| [Q33.05](modules/33-security.md#q33-05) | Bug hunt | Template injection: a CMS template compiled at run time, user text concatenated into a template string, and a server that writes user input into `index.html` before Angular boots. What does each give an attacker? |
| [Q33.06](modules/33-security.md#q33-06) | Concept | What are Angular's security contexts, which bindings fall into each, and what happens to an untrusted value in each? |
| [Q33.07](modules/33-security.md#q33-07) | Output | What does Angular's sanitizer return for `<script>`, an `onerror` attribute, `style` and `id` attributes, `<svg>`, and the URLs `javascript:`, ` javascript:` with a leading space, and `data:text/html`? |
| [Q33.08](modules/33-security.md#q33-08) | Bug hunt | An iframe `[src]` binding that throws NG0904, an `[attr.sandbox]` binding that is rejected, and a `[style]` binding with `url(javascript:…)`: why does each happen, and what is the safe fix? |
| [Q33.09](modules/33-security.md#q33-09) | Concept | What do the five `bypassSecurityTrust*` methods return, and why is each a promise you make to Angular rather than a check Angular makes? |
| [Q33.10](modules/33-security.md#q33-10) | Output | A `SafeHtml` bound to `[href]`, a `SafeResourceUrl` bound to `[href]`, a `SafeUrl` bound to an iframe `[src]`, and `sanitize(SecurityContext.HTML, safeHtml)`: what does each do? |
| [Q33.11](modules/33-security.md#q33-11) | Bug hunt | A `safeHtml` pipe that trusts every input, an embed URL built by string concatenation, and a bypass three services away from the value's source: find the holes and fix them. |
| [Q33.12](modules/33-security.md#q33-12) | Design | Render user-generated rich text with formatting, links and video embeds: where do you sanitize, what do you allow, and where may a bypass appear? |
| [Q33.13](modules/33-security.md#q33-13) | Difference | `ngCspNonce` versus `CSP_NONCE`: where does each get the nonce, what does Angular put it on, and when must you use which? |
| [Q33.14](modules/33-security.md#q33-14) | Output | Under a nonce-based CSP, which of these run or apply: the app's bundles, component styles, an injected inline `<script>`, an injected `onerror` handler, and component styles when the page's nonce does not match the header? |
| [Q33.15](modules/33-security.md#q33-15) | Trade-off | Per-response nonces, `autoCsp` hashes, or no inline scripts at all: which CSP setup for a CDN-hosted SPA, a server-rendered app and an app behind a templating server? |
| [Q33.16](modules/33-security.md#q33-16) | Concept | Which Trusted Types policies does Angular create, and which policy names must the header allow when an app uses `bypassSecurityTrust*`, the JIT compiler or lazy-loaded routes? |
| [Q33.17](modules/33-security.md#q33-17) | Output | With `require-trusted-types-for 'script'; trusted-types angular`, which of these work: an `[innerHTML]` binding, a `bypassSecurityTrustHtml` value, `nativeElement.innerHTML = s`, and a lazy route? |
| [Q33.18](modules/33-security.md#q33-18) | Design | Roll out Trusted Types on an existing app with third-party widgets: report-only first, which violations to expect, and how to fix each. |
| [Q33.19](modules/33-security.md#q33-19) | Output | A server-rendered page interpolates a query parameter containing `</script><script>` and stores it in `TransferState`: what does the raw HTML response contain? |
| [Q33.20](modules/33-security.md#q33-20) | Concept | What is server-side request forgery, how can an Angular SSR server be turned into a proxy for it, and which defenses are Angular's and which belong to the network? |
| [Q33.21](modules/33-security.md#q33-21) | Trade-off | Memory, `localStorage`, `sessionStorage`, an `HttpOnly` cookie or a backend-for-frontend: where should a single-page app keep its access token? |
| [Q33.22](modules/33-security.md#q33-22) | Output | Script injected into the page tries to read a token from `localStorage`, from memory and from an `HttpOnly` cookie, then calls the API: what can it read, and what can it still do? |
| [Q33.23](modules/33-security.md#q33-23) | Bug hunt | A token in `localStorage` sent to every URL, a refresh token in `sessionStorage`, and a token passed in the URL query string: what leaks, to whom, and what is the fix? |
| [Q33.24](modules/33-security.md#q33-24) | Concept | When is a single-page app vulnerable to CSRF: cookies versus an `Authorization` header, `SameSite` defaults, and why `Lax` is not the whole answer? |
| [Q33.25](modules/33-security.md#q33-25) | Output | While the user is logged in, a page on another site auto-submits a form and calls `fetch` against your API: which cookies does Chromium send for `Lax`, `Strict`, `None` and no `SameSite`, and what tells the server the request is cross-site? |
| [Q33.26](modules/33-security.md#q33-26) | Output | A `canMatch` guard keeps a non-admin out of `/admin`: can that user still download the admin chunk and call the admin API, and what does the server answer? |
| [Q33.27](modules/33-security.md#q33-27) | Concept | How do lockfiles, `npm ci`, integrity hashes and `npm audit` protect a build, and what do they not protect against? |
| [Q33.28](modules/33-security.md#q33-28) | Design | Harden a front-end supply chain: install scripts, a release-age delay, provenance and signatures, Subresource Integrity for third-party scripts, and the update cadence. |
| [Q33.29](modules/33-security.md#q33-29) | Concept | How does a binding get sanitized end to end: the compiler's security schema, the `ɵɵsanitize*` instruction, the runtime sanitizer, the inert document and the mutation-XSS loop? |

### 34 · Internationalization

| ID | Type | Question |
|---|---|---|
| [Q34.01](modules/34-i18n.md#q34-01) | Concept | What are internationalization and localization, what does a locale identify, and what changes with it besides the language? |
| [Q34.02](modules/34-i18n.md#q34-02) | Output | `LOCALE_ID` with nothing configured, with `$localize.locale` set to `fr`, and with a provider for `de`: which value does each injector return, and what is `DEFAULT_CURRENCY_CODE` in the French app? |
| [Q34.03](modules/34-i18n.md#q34-03) | Concept | Which `Intl` constructors does the platform give you, which job does each do, and why do you always pass a time zone? |
| [Q34.04](modules/34-i18n.md#q34-04) | Output | `Intl.PluralRules` for English, French, Arabic and Russian on 0, 1, 2, 5, 11 and 1.5, plus English ordinals: which category does each return? |
| [Q34.05](modules/34-i18n.md#q34-05) | Bug hunt | A names list sorted with `sort()`, file names where `item10` comes before `item2`, and a Swedish list that puts `ä` next to `a`: what is wrong in each, and what is the fix? |
| [Q34.06](modules/34-i18n.md#q34-06) | Difference · Output | `formatDate` and `formatNumber` versus `Intl.DateTimeFormat` and `Intl.NumberFormat` for the same values in `en-US`, `fr` and `ar-EG`: what differs, character by character? |
| [Q34.07](modules/34-i18n.md#q34-07) | Concept | How does Angular find a locale's data, what does `registerLocaleData` do, and why are the `getLocale*` functions deprecated? |
| [Q34.08](modules/34-i18n.md#q34-08) | Trade-off | Angular's `date`, `number` and `currency` pipes, or your own pipes on `Intl`: which do you use in a new app? |
| [Q34.09](modules/34-i18n.md#q34-09) | Concept | What does the `i18n` attribute mark, what do meaning, description and `@@id` change, and how do you translate attributes and text in TypeScript code? |
| [Q34.10](modules/34-i18n.md#q34-10) | Output | What does a `$localize` call with metadata and a named placeholder return without translations, and which placeholder names does the compiler give an interpolation and a `<b>` inside an `i18n` element? |
| [Q34.11](modules/34-i18n.md#q34-11) | Bug hunt | A sentence split across three `i18n` elements, a message built by string concatenation in a component, an untranslated `title` attribute and two identical words with different meanings: what breaks in each language, and how do you fix it? |
| [Q34.12](modules/34-i18n.md#q34-12) | Concept | What are ICU `plural` and `select` expressions, how do `=0` and the plural categories differ, and when do you nest them? |
| [Q34.13](modules/34-i18n.md#q34-13) | Output | `{n, plural, one {…} other {…}}` in an `i18n` template, the `i18nPlural` pipe and `Intl.PluralRules`, all in English with `n = 1.5`: what does each produce? |
| [Q34.14](modules/34-i18n.md#q34-14) | Design | Design the message "Ana and 3 others liked your photo" so that it translates correctly into French and Arabic: the ICU structure, the placeholders and what the translator sees. |
| [Q34.15](modules/34-i18n.md#q34-15) | Concept | How does `ng extract-i18n` find messages, which formats can it write, and how is a message ID computed and when does it change? |
| [Q34.16](modules/34-i18n.md#q34-16) | Bug hunt | After a copy edit, French users see English text, two messages share one translation, and the build still passes: why, and which settings catch it? |
| [Q34.17](modules/34-i18n.md#q34-17) | Concept | What does a build with `localize` produce: folders, base `href`, `lang` and `dir`, locale data and `LOCALE_ID`, and why does `ng serve` show only one locale? |
| [Q34.18](modules/34-i18n.md#q34-18) | Output | The per-locale builds behind the lab server: what do `/` with `Accept-Language: fr`, `/fr/` and `/ar/` return, and which `lang`, `dir` and text does each page carry? |
| [Q34.19](modules/34-i18n.md#q34-19) | Trade-off | One build per locale, runtime `loadTranslations`, or a runtime library such as Transloco: which for a marketing site, an internal dashboard and a white-label product? |
| [Q34.20](modules/34-i18n.md#q34-20) | Output | Runtime translations loaded before bootstrap, loaded after the first render, and missing for one message: what does each page show, and what is logged? |
| [Q34.21](modules/34-i18n.md#q34-21) | Difference | Transloco versus ngx-translate in v22 apps: setup, loaders, lazy feature translations, signals and missing keys. |
| [Q34.22](modules/34-i18n.md#q34-22) | Design | A large app with lazy feature areas must switch language without a reload and download each area's translations only when it is opened: design it with a runtime library. |
| [Q34.23](modules/34-i18n.md#q34-23) | Bug hunt | A birthday shown one day early, a price stored as a float, a `currency` pipe that shows dollars to German users of a euro shop, and yen shown with two decimals: find the four bugs. |
| [Q34.24](modules/34-i18n.md#q34-24) | Output | In `dir="rtl"`, where do `margin-left`, `margin-inline-start` and `text-align: start` put a box and its text, and what does CDK `Directionality` report after `<html dir>` changes at run time? |
| [Q34.25](modules/34-i18n.md#q34-25) | Concept | How does an `i18n` attribute become translated DOM: what the compiler emits, what the build-time inliner replaces, and what the runtime does with ICU cases? |

### 35 · Animations

| ID | Type | Question |
|---|---|---|
| [Q35.01](modules/35-animations.md#q35-01) | Concept | When should a UI animate, what does each browser mechanism (transition, keyframe animation, Web Animations API) do, and what does Angular add on top? |
| [Q35.02](modules/35-animations.md#q35-02) | Output | A class change starts `transition: opacity 400ms, transform 400ms` and the class is removed halfway: which `Animation` objects exist, which transition events fire in which order, and what is the opacity afterwards? |
| [Q35.03](modules/35-animations.md#q35-03) | Difference | CSS transitions versus CSS keyframe animations: what triggers each, where the start state comes from, repetition, events, and when each fits. |
| [Q35.04](modules/35-animations.md#q35-04) | Bug hunt | A fade-in that appears instantly on insertion, a `display: none` toggle that never animates, and a component's `@keyframes` a global class cannot find: what is wrong in each? |
| [Q35.05](modules/35-animations.md#q35-05) | Concept | What does the Web Animations API add over CSS: `element.animate`, the `Animation` object and its `finished` promise, `getAnimations` and `commitStyles`? |
| [Q35.06](modules/35-animations.md#q35-06) | Output | `animate.enter="m35-pop"` on an `@if` element whose class runs a 400 ms fade and a 1500 ms slide: which classes and animations are on the element while each runs, and when are the classes removed? |
| [Q35.07](modules/35-animations.md#q35-07) | Concept | How do `animate.enter` and `animate.leave` work with CSS classes: where can you put them, which values do they take, and when is the element actually removed? |
| [Q35.08](modules/35-animations.md#q35-08) | Output | `animate.leave` with a class that animates nothing, with a transition, and with an infinite animation: when does each element leave the DOM? |
| [Q35.09](modules/35-animations.md#q35-09) | Concept | How does the function form `(animate.leave)` work, what is `animationComplete`, and what happens if you never call it? |
| [Q35.10](modules/35-animations.md#q35-10) | Output | An `@if` block is removed while it holds an element with `animate.leave` in the same template and a child component whose own template uses `animate.leave`: which leave animations run before removal in v22, and what did v21.1 do? |
| [Q35.11](modules/35-animations.md#q35-11) | Bug hunt | A leave callback that never calls `animationComplete`, a leave class whose transition never starts because nothing changes, and legacy `[@fade]` mixed with `animate.leave` in one component: what breaks? |
| [Q35.12](modules/35-animations.md#q35-12) | Design | Animate a notification list: entering items slide in, removed items collapse, reordered items glide, and an item re-added during its leave animation does not duplicate. |
| [Q35.13](modules/35-animations.md#q35-13) | Output | In a `@for` with `track item.id`, one item is moved, another removed and re-added before its leave animation ends: which rows run enter or leave animations, and how many elements carry the re-added item? |
| [Q35.14](modules/35-animations.md#q35-14) | Concept | What were triggers, states and transitions in `@angular/animations`, and how did `:enter`, `:leave`, `query`, `stagger` and `animateChild` work? |
| [Q35.15](modules/35-animations.md#q35-15) | Output | A legacy trigger with `open` and `closed` states and an `open <=> closed` transition under `provideNoopAnimations()`: which `(@t.start)` and `(@t.done)` callbacks fire on first render and on a toggle, with which `fromState` and `toState`? |
| [Q35.16](modules/35-animations.md#q35-16) | Difference | `provideAnimations`, `provideAnimationsAsync` and `provideNoopAnimations` (and their NgModule forms): what each loads and when, and why `animate.enter` needs none of them. |
| [Q35.17](modules/35-animations.md#q35-17) | Trade-off | Migrate a large app off `@angular/animations` now or wait until it is removed: what to migrate first, what has no direct replacement, and what you gain. |
| [Q35.18](modules/35-animations.md#q35-18) | Bug hunt | A migrated component keeps a `[@fade]` binding after the provider is removed, relies on `query(':leave', animateChild())` across child components, and disables motion with `animation: none`: what breaks after the migration? |
| [Q35.19](modules/35-animations.md#q35-19) | Concept | What does the browser do during a router view transition: the snapshots, the `::view-transition` pseudo-element tree, `view-transition-name`, and what `onViewTransitionCreated` can change? |
| [Q35.20](modules/35-animations.md#q35-20) | Output | A navigation with `withViewTransitions()` from a list to a detail page where the card and the detail header share one `view-transition-name`: which `::view-transition-*` animations run, and what runs when `onViewTransitionCreated` calls `skipTransition()`? |
| [Q35.21](modules/35-animations.md#q35-21) | Trade-off | Router view transitions, `animate.enter` and `animate.leave` on routed components, or a legacy route animation: which do you choose for page transitions? |
| [Q35.22](modules/35-animations.md#q35-22) | Bug hunt | A sidebar whose `animate.enter` class animates `width`, a 200-row list whose leave class animates `height`, and `will-change: transform` on every card: where does the cost come from, and what is the fix? |
| [Q35.23](modules/35-animations.md#q35-23) | Design | Respect `prefers-reduced-motion` across CSS animations, `animate.leave` removal, the callback form and router view transitions. |
| [Q35.24](modules/35-animations.md#q35-24) | Output | With `reducedMotion: 'reduce'`: what happens to a keyframe animation guarded by the media query, to an `animate.leave` element whose class has a reduced rule, and to a router view transition with no reduced-motion rule? |
| [Q35.25](modules/35-animations.md#q35-25) | Concept | How does Angular run `animate.leave` under the hood: the compiler instruction, the per-view animation map, the animation queue, longest-animation detection and the fallback timer? |

### 36 · Material and the CDK

| ID | Type | Question |
|---|---|---|
| [Q36.01](modules/36-material-and-cdk.md#q36-01) | Concept | What are Angular Material, the CDK and Angular Aria, and which layer do you reach for when? |
| [Q36.02](modules/36-material-and-cdk.md#q36-02) | Difference | What does Material add on top of the CDK: `MatDialog` over CDK `Dialog`, `mat-table` over `cdk-table`, and `MatStepper` over `CdkStepper`? |
| [Q36.03](modules/36-material-and-cdk.md#q36-03) | Output | A required `matInput` in a `mat-form-field` bound to a reactive control: which state classes, `aria-invalid` value and error text does the field show before any interaction, after blur while empty, and after typing? |
| [Q36.04](modules/36-material-and-cdk.md#q36-04) | Bug hunt | A theme that never turns dark, a token override in a component's styles that does not reach its dialog, and Material motion that still runs under reduced motion: what is wrong in each? |
| [Q36.05](modules/36-material-and-cdk.md#q36-05) | Concept | How does `mat.theme` turn a palette, a font and a density into CSS: what are the `--mat-sys-*` system variables, and how do light and dark mode work? |
| [Q36.06](modules/36-material-and-cdk.md#q36-06) | Output | With `color-scheme: light dark` on `html` and `mat.theme` with the azure palette: what does `--mat-sys-primary` resolve to under a light preference, a dark preference, and inside a subtree that sets `color-scheme: dark`? |
| [Q36.07](modules/36-material-and-cdk.md#q36-07) | Difference | `mat.theme-overrides`, a component's `*-overrides` mixin and a direct CSS rule on Material's internal classes: what each changes, where its scope ends, and which survives an upgrade. |
| [Q36.08](modules/36-material-and-cdk.md#q36-08) | Bug hunt | A brand color forced with `!important` on an internal Material class, an M2 prebuilt theme loaded beside `mat.theme`, and a custom card hard-coded to `#fff`: what breaks, and what is the fix? |
| [Q36.09](modules/36-material-and-cdk.md#q36-09) | Concept | What are portals and portal outlets (`ComponentPortal`, `TemplatePortal`, `DomPortal`, `CdkPortalOutlet`), and how do they relate to `ViewContainerRef.createComponent`? |
| [Q36.10](modules/36-material-and-cdk.md#q36-10) | Output | An overlay created with `createOverlayRef` and a flexible connected position strategy below a button near the bottom of the viewport: is its host a popover in the top layer, which position does it take, and what closes it? |
| [Q36.11](modules/36-material-and-cdk.md#q36-11) | Trade-off | The native `popover` attribute and `<dialog>`, a CDK overlay, or `MatMenu` and `MatDialog`: which do you choose for a dropdown, a modal and a tooltip? |
| [Q36.12](modules/36-material-and-cdk.md#q36-12) | Output | A `cdkDropList` of five items: after item 1 is dragged below item 3, what does `cdkDropListDropped` report, and what does the list render if the handler does not reorder the data? |
| [Q36.13](modules/36-material-and-cdk.md#q36-13) | Bug hunt | A list that snaps back after every drop, two lists that will not exchange items, and a board that only a mouse can rearrange: find the three causes. |
| [Q36.14](modules/36-material-and-cdk.md#q36-14) | Concept | How does `CdkTable` render rows from a `DataSource`: column and row definitions, `connect` and `disconnect`, `trackBy`, and what `MatTable`, `MatSort` and `MatPaginator` add? |
| [Q36.15](modules/36-material-and-cdk.md#q36-15) | Output | `BreakpointObserver.observe(Breakpoints.Handset)` in a 375 px and a 1280 px wide Chromium viewport, and under jsdom in `ng test`: what does `matches` report, and when does it emit again? |
| [Q36.16](modules/36-material-and-cdk.md#q36-16) | Difference | The CDK's `Clipboard.copy` versus `navigator.clipboard.writeText`: how each copies, what each needs, and what each tells you about success. |
| [Q36.17](modules/36-material-and-cdk.md#q36-17) | Concept | What do `FocusTrap` and `cdkTrapFocus` do, and how does `FocusMonitor` tell keyboard focus from mouse and programmatic focus? |
| [Q36.18](modules/36-material-and-cdk.md#q36-18) | Output | A `FocusKeyManager` over five items with `withWrap()`, `withTypeAhead()` and a skip predicate for the disabled third item: which item is active after ArrowDown three times, then End, then ArrowDown, then typing `c`? |
| [Q36.19](modules/36-material-and-cdk.md#q36-19) | Bug hunt | A `LiveAnnouncer` message that is never read, a `cdkTrapFocus` dialog whose focus still escapes, and a `FocusMonitor` subscription that keeps classes on a destroyed element: find the causes. |
| [Q36.20](modules/36-material-and-cdk.md#q36-20) | Design | Write a component harness for your own component: what it exposes, how `HarnessPredicate` filters it, and what it must hide from the test. |
| [Q36.21](modules/36-material-and-cdk.md#q36-21) | Output | Two Material buttons on a page: what do `getHarness`, `getHarnessOrNull`, `getAllHarnesses` and `getHarness(MatButtonHarness.with({ text }))` return, and what happens when nothing matches? |
| [Q36.22](modules/36-material-and-cdk.md#q36-22) | Concept | What is Angular Aria: which patterns it ships, how its directives are driven by signal inputs, and how it differs from the CDK's `cdk/listbox` and `cdk/menu`? |
| [Q36.23](modules/36-material-and-cdk.md#q36-23) | Output | An `ngListbox` with three `ngOption`s in `activedescendant` focus mode and `explicit` selection: after ArrowDown and Space, what are `aria-activedescendant`, each `aria-selected` and the bound `value`? |
| [Q36.24](modules/36-material-and-cdk.md#q36-24) | Trade-off | Build a design system on the CDK and Angular Aria, or wrap Material: what each costs, what you control, who owns accessibility, and how upgrades go. |
| [Q36.25](modules/36-material-and-cdk.md#q36-25) | Concept | Under the hood: how does a CDK overlay reach the top layer, route Escape and outside clicks to the topmost overlay, and reposition; and how does a `--mat-sys-*` value reach a component's computed color? |

### 37 · Elements, PWA, error handling and the ecosystem

| ID | Type | Question |
|---|---|---|
| [Q37.01](modules/37-elements-pwa-errors-ecosystem.md#q37-01) | Concept | What is Angular Elements, what does `createCustomElement` give you, and when is a custom element the right way to ship an Angular component? |
| [Q37.02](modules/37-elements-pwa-errors-ecosystem.md#q37-02) | Output | A `<m37-q02-rating>` element is created with the attribute `max-stars="5"`, then its `maxStars` property is set to `7`, then the attribute is changed to `"3"`: what value and type does the component's `maxStars` input hold after each step, with and without `numberAttribute`? |
| [Q37.03](modules/37-elements-pwa-errors-ecosystem.md#q37-03) | Output | The component has `ratingChanged = output<number>()` and emits `4`: what event name, `detail`, `bubbles` and `composed` does a listener on the element see, and does a listener on its parent `div` fire? |
| [Q37.04](modules/37-elements-pwa-errors-ecosystem.md#q37-04) | Bug hunt | An element defined with the component's own selector as its tag, a host page that appends the element's children after inserting it, and a React wrapper listening for `rating-changed`: what is wrong in each? |
| [Q37.05](modules/37-elements-pwa-errors-ecosystem.md#q37-05) | Difference | `CUSTOM_ELEMENTS_SCHEMA`, `NO_ERRORS_SCHEMA` and declaring a typed wrapper: what does each let the compiler accept, and what checking does each give up? |
| [Q37.06](modules/37-elements-pwa-errors-ecosystem.md#q37-06) | Output | An element is removed from the DOM and re-appended 5 ms later, then removed and left out for 20 ms: how many times do the component's constructor and `ngOnDestroy` run? |
| [Q37.07](modules/37-elements-pwa-errors-ecosystem.md#q37-07) | Trade-off | One Angular widget inside a server-rendered page: an Angular Elements bundle, a `createApplication` mounted on a `div`, or a framework-free web component; what does each cost in bundle, isolation and upgrades? |
| [Q37.08](modules/37-elements-pwa-errors-ecosystem.md#q37-08) | Concept | How does change detection reach an element's component when the host page sets a property, with zone.js and without it? |
| [Q37.09](modules/37-elements-pwa-errors-ecosystem.md#q37-09) | Concept | What does `@angular/service-worker` add on top of the browser's service worker, and what do `ngsw-config.json`, `ngsw.json` and `ngsw-worker.js` each do? |
| [Q37.10](modules/37-elements-pwa-errors-ecosystem.md#q37-10) | Difference | Asset groups versus data groups, `prefetch` versus `lazy`, and `performance` versus `freshness`: what is versioned with the app, and what is served when the network is down? |
| [Q37.11](modules/37-elements-pwa-errors-ecosystem.md#q37-11) | Output | With the lab's config, the user loads the app once, goes offline and reloads a deep link, the catalog list and the prices list, and an uncached endpoint: which load, which fail, and what does the page show for each? |
| [Q37.12](modules/37-elements-pwa-errors-ecosystem.md#q37-12) | Output | Tab A is open on v1; v2 is deployed; tab A calls `checkForUpdate()`, then tab B opens, then tab A reloads: which `versionUpdates` events does A see, with which `appData`, and which version does each tab show at each step? |
| [Q37.13](modules/37-elements-pwa-errors-ecosystem.md#q37-13) | Bug hunt | An update flow that calls `activateUpdate()` without reloading, a CDN that caches `ngsw.json` for a day, and an `interval(60_000)` started in the root component's constructor: what goes wrong in each? |
| [Q37.14](modules/37-elements-pwa-errors-ecosystem.md#q37-14) | Design | Design the update strategy for an internal support-agent app that stays open all day: when to check, how to prompt, when to force a reload, and what to do on an unrecoverable state. |
| [Q37.15](modules/37-elements-pwa-errors-ecosystem.md#q37-15) | Concept | How do push notifications work with `SwPush`: who subscribes, who sends, who shows the notification, and what happens on a click when no tab is open? |
| [Q37.16](modules/37-elements-pwa-errors-ecosystem.md#q37-16) | Concept | Which errors reach Angular's `ErrorHandler` by default, which need `provideBrowserGlobalErrorListeners()`, and which reach neither? |
| [Q37.17](modules/37-elements-pwa-errors-ecosystem.md#q37-17) | Output | With a recording `ErrorHandler` and global listeners on, a click handler throws, a `setTimeout` throws, a promise rejects unhandled and a template expression throws: which calls does the handler record, in what order, and what reaches the console? |
| [Q37.18](modules/37-elements-pwa-errors-ecosystem.md#q37-18) | Bug hunt | A custom `ErrorHandler` that injects `Router` and navigates to `/error` on every error, shows a toast for each `HttpErrorResponse`, and calls an HTTP endpoint that can itself fail: what is wrong? |
| [Q37.19](modules/37-elements-pwa-errors-ecosystem.md#q37-19) | Output | A `@boundary` with `@error (when isNetwork($error))` and a final `@error` wraps two children; the first throws a `TypeError` during change detection: what renders, what does `onViewError` receive, and what happens after `$reset` once the cause is fixed? |
| [Q37.20](modules/37-elements-pwa-errors-ecosystem.md#q37-20) | Difference | `@boundary` with `@error`, `@defer`'s `@error`, a `resource`'s `error()`, and `withNavigationErrorHandler`: what failure does each handle and where does it show? |
| [Q37.21](modules/37-elements-pwa-errors-ecosystem.md#q37-21) | Design | Design the error UX for an orders screen: validation, not found, conflict, server error, offline, and a broken widget; what the user sees for each and what is reported. |
| [Q37.22](modules/37-elements-pwa-errors-ecosystem.md#q37-22) | Design | Design error tracking for a production Angular app: what goes in a report, how you de-duplicate, sample and scrub, how stack traces stay readable, and where 44's pipeline takes over. |
| [Q37.23](modules/37-elements-pwa-errors-ecosystem.md#q37-23) | Trade-off | Material and the CDK, a third-party UI kit such as PrimeNG or ng-zorro-antd, or a headless kit such as spartan/ui: what decides it for a new product? |
| [Q37.24](modules/37-elements-pwa-errors-ecosystem.md#q37-24) | Concept | How do you evaluate an Angular library before adding it: which facts do you check, where do you read them, and what would make you say no? |
| [Q37.25](modules/37-elements-pwa-errors-ecosystem.md#q37-25) | Concept | Under the hood: how does `createCustomElement`'s strategy map the element's lifecycle to a `ComponentRef`, and how does the service worker's driver decide which version serves a tab? |

### 38 · Architecture and production structure

| ID | Type | Question |
|---|---|---|
| [Q38.01](modules/38-architecture-and-production-structure.md#q38-01) | Concept | What does architecture mean for an Angular front end, and which decisions does it fix: structure, dependency direction and the unit of deployment? |
| [Q38.02](modules/38-architecture-and-production-structure.md#q38-02) | Difference | Folders by type (`components/`, `services/`) versus folders by feature: what does each optimize for, and what does the Angular style guide recommend? |
| [Q38.03](modules/38-architecture-and-production-structure.md#q38-03) | Bug hunt | A `shared/` folder that imports from `features/orders`, a `core/` folder full of UI components, and a feature that reaches into another feature's internals: what goes wrong in each? |
| [Q38.04](modules/38-architecture-and-production-structure.md#q38-04) | Concept | What makes a component presentational, what makes it a container, and why does the split make the v22 OnPush default and testing simpler? |
| [Q38.05](modules/38-architecture-and-production-structure.md#q38-05) | Output | A presentational list receives a new array from its container, then the container mutates that array in place: what does the list render after each step under the v22 default? |
| [Q38.06](modules/38-architecture-and-production-structure.md#q38-06) | Trade-off | Split every screen into containers and presentational components, or split only where reuse appears: when is the split overhead? |
| [Q38.07](modules/38-architecture-and-production-structure.md#q38-07) | Design | Design a facade for an orders feature over a signal store and an HTTP data-access service: what does it expose, and what does it hide? |
| [Q38.08](modules/38-architecture-and-production-structure.md#q38-08) | Difference | Coming from the backend: a hexagonal (ports and adapters) or layered Spring service versus a front-end feature split into ui, feature, data-access and util: what maps, and where does the analogy break? |
| [Q38.09](modules/38-architecture-and-production-structure.md#q38-09) | Output | A container injects the facade, and the test replaces the data-access service with a fake through a provider override that fails the second call: which calls reach the fake, and what does the container render after each? |
| [Q38.10](modules/38-architecture-and-production-structure.md#q38-10) | Concept | What are library types (feature, ui, data-access, util) and scope tags, and which dependency rules follow from them? |
| [Q38.11](modules/38-architecture-and-production-structure.md#q38-11) | Bug hunt | A ui library injects `HttpClient`, a util library imports a component, and a data-access library imports a ui file through `../../`: which rules break, and what does each break cost? |
| [Q38.12](modules/38-architecture-and-production-structure.md#q38-12) | Concept | What does `ng generate library` create in v22, and what does ng-packagr do when you run `ng build` on the library? |
| [Q38.13](modules/38-architecture-and-production-structure.md#q38-13) | Output | After `ng build ui-lib`, what are the `name`, `module`, `typings`, `exports`, `sideEffects` and `dependencies` fields of `dist/ui-lib/package.json`, and which source fields are gone? |
| [Q38.14](modules/38-architecture-and-production-structure.md#q38-14) | Trade-off | Consume an in-repository library through its build output (a `paths` mapping to `dist`) or through its source files: what do you gain and lose with each? |
| [Q38.15](modules/38-architecture-and-production-structure.md#q38-15) | Concept | What is a library's public API surface, and which mechanisms enforce it: `public-api.ts`, the `exports` map, the bundled `.d.ts` and peer dependencies? |
| [Q38.16](modules/38-architecture-and-production-structure.md#q38-16) | Output | A component used inside `ui-lib` but not exported from `public-api.ts`, and a secondary entry point `ui-lib/testing`: which names appear in each bundled `.d.ts`, and which `exports` subpaths exist? |
| [Q38.17](modules/38-architecture-and-production-structure.md#q38-17) | Design | Evolve a shared library without breaking twelve consumer teams: semantic versions, deprecations, peer ranges, secondary entry points and a migration schematic. |
| [Q38.18](modules/38-architecture-and-production-structure.md#q38-18) | Concept | What is an Nx project graph, where are tags declared, and what does `@nx/enforce-module-boundaries` check besides tags? |
| [Q38.19](modules/38-architecture-and-production-structure.md#q38-19) | Bug hunt | A `depConstraints` list where `type:ui` may depend on `*`, a new project has no tags, and a ban is written with `onlyDependOnLibsWithTags: []`: which imports get through, and which are reported with which message? |
| [Q38.20](modules/38-architecture-and-production-structure.md#q38-20) | Concept | How do `nx affected` and the computation cache decide what to run: touched files, touched projects, dependents, task inputs and outputs? |
| [Q38.21](modules/38-architecture-and-production-structure.md#q38-21) | Trade-off | An Nx monorepo, an Angular CLI workspace with libraries, or several repositories with published packages: what decides it for a growing product? |
| [Q38.22](modules/38-architecture-and-production-structure.md#q38-22) | Difference | Module Federation versus Native Federation: build tool, how remotes load at run time, how dependencies are shared, and how each fits the v22 application builder. |
| [Q38.23](modules/38-architecture-and-production-structure.md#q38-23) | Trade-off | When are micro-frontends justified, what do they cost (versions, shared state, consistency, testing, operations), and what are the cheaper alternatives? |
| [Q38.24](modules/38-architecture-and-production-structure.md#q38-24) | Design | Set up linting and formatting for a team: the angular-eslint flat config, Prettier, import ordering and commit hooks; what runs in the editor, before a commit and in CI? |
| [Q38.25](modules/38-architecture-and-production-structure.md#q38-25) | Output | Prettier 3.9 with the `.prettierrc` that `ng new` writes formats a long template line with an `@if` block and four attributes: what does it print? |
| [Q38.26](modules/38-architecture-and-production-structure.md#q38-26) | Concept | What does Storybook give an Angular team (stories, args, isolated development, interaction and visual tests), and what does its Angular framework require in a v22 workspace? |
| [Q38.27](modules/38-architecture-and-production-structure.md#q38-27) | Design | Design the CI pipeline for a front end: lint, unit tests, build, end-to-end tests and deploy previews, with caching, affected runs and the budget gate; what fails the run at each stage? |
| [Q38.28](modules/38-architecture-and-production-structure.md#q38-28) | Design | Walk an interviewer through a production folder tree for an app with eight feature areas and three teams: what lives in each folder, and why? |
| [Q38.29](modules/38-architecture-and-production-structure.md#q38-29) | Concept | Under the hood: what does ng-packagr do between `ng-package.json` and a publishable folder, and how does Nx compute affected projects and a task hash? |

### 39 · Version history and migrations

| ID | Type | Question |
|---|---|---|
| [Q39.01](modules/39-version-history-and-migrations.md#q39-01) | Concept | What were scopes, watchers and the digest cycle in AngularJS, and how did two-way binding depend on them? |
| [Q39.02](modules/39-version-history-and-migrations.md#q39-02) | Bug hunt | An AngularJS controller sets the model in a `setTimeout`, a watcher keeps changing its own input, and a child scope binds `ng-model` to a primitive: what goes wrong in each? |
| [Q39.03](modules/39-version-history-and-migrations.md#q39-03) | Difference | AngularJS versus Angular: change detection, dependency injection, templates, modules, language and tooling. What changed, and why? |
| [Q39.04](modules/39-version-history-and-migrations.md#q39-04) | Concept | How does Angular version and support its releases: semantic versioning, a major every 12 months since v22, active and LTS windows, and the deprecation policy? |
| [Q39.05](modules/39-version-history-and-migrations.md#q39-05) | Difference | Stable, developer preview, experimental and deprecated: what does each status promise, and how should a production codebase treat each? |
| [Q39.06](modules/39-version-history-and-migrations.md#q39-06) | Concept | Walk through v2 to v8: why there was no Angular 3, and what v4, v5, v6, v7 and v8 changed that interviewers still ask about. |
| [Q39.07](modules/39-version-history-and-migrations.md#q39-07) | Concept | From View Engine to Ivy: what changed for applications in v9, for libraries in v12 and v13, and why did View Engine libraries stop working in v16? |
| [Q39.08](modules/39-version-history-and-migrations.md#q39-08) | Concept | v14 to v17: typed forms, `inject()`, standalone, directive composition, signals, built-in control flow, `@defer` and the application builder. Which version brought each, and in which status? |
| [Q39.09](modules/39-version-history-and-migrations.md#q39-09) | Difference | v18 to v22: what changed for new projects (zoneless, Vitest, OnPush, fetch) versus what `ng update` keeps for existing ones? |
| [Q39.10](modules/39-version-history-and-migrations.md#q39-10) | Bug hunt | Five claims from an interview: "Angular 3 rewrote the router", "signals replaced zone.js in v16", "standalone is mandatory since v17", "`*ngIf` was removed in v20" and "v22 components still default to `Default` change detection". Correct each with its version and status. |
| [Q39.11](modules/39-version-history-and-migrations.md#q39-11) | Trade-off | Update every major, every other major, or only when support ends: what does each cost, given the support windows and one-major-at-a-time updates? |
| [Q39.12](modules/39-version-history-and-migrations.md#q39-12) | Design | Plan the update of one application from v21 to v22: what you do before, during and after `ng update`, and what you check at each step. |
| [Q39.13](modules/39-version-history-and-migrations.md#q39-13) | Bug hunt | An update log: `ng update` refuses with "Updating multiple major versions … is not supported", `npm install` fails on a third-party peer range, and someone reran it with `--force`. What went wrong, and what is the fix? |
| [Q39.14](modules/39-version-history-and-migrations.md#q39-14) | Output | Updating `@angular/cli` from 21.2.x to 22.2.1: which of its migrations run without a prompt, which are offered, which are pre-selected, and in what order? |
| [Q39.15](modules/39-version-history-and-migrations.md#q39-15) | Design | Bring a v13 application to v22: the hop plan, the Node and TypeScript changes, libraries that block a hop, and where to stop and stabilize. |
| [Q39.16](modules/39-version-history-and-migrations.md#q39-16) | Trade-off | Update hop by hop in place, or generate a fresh v22 workspace and move the code across: when does each win? |
| [Q39.17](modules/39-version-history-and-migrations.md#q39-17) | Concept | How does ngUpgrade run AngularJS and Angular in one page: `UpgradeModule`, `downgradeComponent`, `downgradeInjectable`, `UpgradeComponent` and `downgradeModule`? |
| [Q39.18](modules/39-version-history-and-migrations.md#q39-18) | Trade-off | An AngularJS application in 2026: an ngUpgrade hybrid, a strangler fig by route, or a rewrite. Which, and when? |
| [Q39.19](modules/39-version-history-and-migrations.md#q39-19) | Design | Strangle an AngularJS application route by route: the routing split, the shared session, shared styles, and the exit criteria. |
| [Q39.20](modules/39-version-history-and-migrations.md#q39-20) | Design | Modernize a 300-component v15 NgModule application: in which order do you run standalone, control flow, `inject()`, signal inputs and queries, OnPush, zoneless, Vitest and the application builder, and why? |
| [Q39.21](modules/39-version-history-and-migrations.md#q39-21) | Bug hunt | A migration pull request ran six schematics in one commit, removed zone.js while code still waits on `NgZone.onStable`, and moved from Karma to Vitest together with the builder change. What goes wrong, and how do you split it? |
| [Q39.22](modules/39-version-history-and-migrations.md#q39-22) | Output | The v22 `change-detection-eager` and `strict-templates-default` migrations run on a v21 workspace: what changes in a component with no `changeDetection`, in one with `ChangeDetectionStrategy.Default`, and in `tsconfig.json`? |
| [Q39.23](modules/39-version-history-and-migrations.md#q39-23) | Output | The v22 `incremental-hydration` and `safe-optional-chaining` migrations run on a v21 application: what do `provideClientHydration()` and a template's `user?.name` become, and why? |
| [Q39.24](modules/39-version-history-and-migrations.md#q39-24) | Output | The Update Guide from v19.0 to v21.0 for a medium application: given five steps with `possibleIn`, `necessaryAsOf` and `level`, which land before, during and after the update? |
| [Q39.25](modules/39-version-history-and-migrations.md#q39-25) | Concept | Under the hood: how does `ng update` choose the packages that move together and the migrations that run, and why does an installed `@angular/core` carry only its own major's migrations? |

### 40 · Framework comparisons: Angular, React, Vue and others

| ID | Type | Question |
|---|---|---|
| [Q40.01](modules/40-framework-comparisons.md#q40-01) | Concept | Library, framework, progressive framework or compiler: where do React, Vue, Svelte, Solid and Angular stand, and what does each position decide for you? |
| [Q40.02](modules/40-framework-comparisons.md#q40-02) | Difference | Compiled templates versus JSX: what does Angular's or Vue's template compiler know that a JSX render function hides, and what does JSX give back? |
| [Q40.03](modules/40-framework-comparisons.md#q40-03) | Concept | What happens in React after `setState`: which components re-render, how does reconciliation keep or replace DOM, and where do `memo`, keys and the `Object.is` bailout come in? |
| [Q40.04](modules/40-framework-comparisons.md#q40-04) | Output | In our model of React's render rules, a parent's state changes: which component functions run for a plain child, a `memo` child with a primitive prop, a `memo` child with an inline object prop, and a context consumer under a `memo` parent? |
| [Q40.05](modules/40-framework-comparisons.md#q40-05) | Concept | What does the React Compiler do, what does it leave unchanged in React's model, and how does it compare with Angular's signals? |
| [Q40.06](modules/40-framework-comparisons.md#q40-06) | Difference | Angular signals, Vue refs, Solid signals and Svelte 5 runes: how do reading, writing, equality, deep reactivity and update granularity differ? |
| [Q40.07](modules/40-framework-comparisons.md#q40-07) | Bug hunt | Four porting habits: a destructured Vue `reactive` object, a Solid component that reads a signal into a constant, an Angular signal whose array is mutated in place, and a React state object mutated before `setState`. What breaks in each, and why? |
| [Q40.08](modules/40-framework-comparisons.md#q40-08) | Difference | Angular's injector tree, React context and Vue's `provide`/`inject`: what does each resolve, from where, and what happens when the provided value changes? |
| [Q40.09](modules/40-framework-comparisons.md#q40-09) | Difference | Routing, forms, data fetching, builds and tests in Angular, React and Vue: what ships first-party, who maintains the rest, and what does that change for upgrades? |
| [Q40.10](modules/40-framework-comparisons.md#q40-10) | Concept | How big is each ecosystem, and what do npm download counts measure and miss? |
| [Q40.11](modules/40-framework-comparisons.md#q40-11) | Difference | Vue 2 to 3, React classes to hooks, AngularJS to Angular: how did each project break or keep compatibility, and how does each version, deprecate and support its releases? |
| [Q40.12](modules/40-framework-comparisons.md#q40-12) | Trade-off | Angular, React or Vue for three projects: a long-lived enterprise back office built by several teams, a content-heavy marketing site, and a small product team that must hire fast. Which, and why? |
| [Q40.13](modules/40-framework-comparisons.md#q40-13) | Design | "Why Angular?": structure an answer for a team that already uses Angular and for one that is still choosing, with the evidence and the costs you would admit. |
| [Q40.14](modules/40-framework-comparisons.md#q40-14) | Trade-off | Rewrite an Angular application in another framework, or modernize it in place: when does a framework switch pay off? |
| [Q40.15](modules/40-framework-comparisons.md#q40-15) | Design | Keep a domain core portable across frameworks: what goes in the framework-free core, what goes in each adapter, and how do Angular signals and React's `useSyncExternalStore` consume it? |
| [Q40.16](modules/40-framework-comparisons.md#q40-16) | Concept | Under the hood: trace one state change through Angular, React, Vue and Solid. What is marked, what re-runs, what is compared, and when is the DOM written? |

## Part E · Full-stack integration with Spring Boot

### 41 · Full-stack API contracts: Angular and Spring Boot

| ID | Type | Question |
|---|---|---|
| [Q41.01](modules/41-fullstack-api-contracts.md#q41-01) | Concept | A cross-origin Angular app calls a Spring Boot API: what must the Spring side configure, and why must the preflight be answered before authentication? |
| [Q41.02](modules/41-fullstack-api-contracts.md#q41-02) | Trade-off | The dev-server proxy (`proxy.conf.json`) or CORS on the API: which for local development, which for production, and what does each hide? |
| [Q41.03](modules/41-fullstack-api-contracts.md#q41-03) | Bug hunt | Three CORS setups: origins `"*"` with credentials, a preflight that Spring Security answers 401, and a download whose `Content-Disposition` the client reads as `null`. What is wrong in each? |
| [Q41.04](modules/41-fullstack-api-contracts.md#q41-04) | Difference | An entity or a DTO on the wire: what leaks, what breaks when the schema changes, and how does a PATCH tell "leave unchanged" from "clear"? |
| [Q41.05](modules/41-fullstack-api-contracts.md#q41-05) | Concept | From a Spring controller to a TypeScript client: what does springdoc publish, and what does a generator emit from it? |
| [Q41.06](modules/41-fullstack-api-contracts.md#q41-06) | Difference | openapi-generator, orval and ng-openapi-gen: what each needs to run, what it emits for Angular, and how each treats `date-time`. |
| [Q41.07](modules/41-fullstack-api-contracts.md#q41-07) | Trade-off | A generated client, a hand-written client with runtime checks, or consumer-driven contract tests: how do you keep an Angular app and a Spring API in sync? |
| [Q41.08](modules/41-fullstack-api-contracts.md#q41-08) | Concept | Which contract changes can a deployed Angular client survive, and which break it? |
| [Q41.09](modules/41-fullstack-api-contracts.md#q41-09) | Difference | Versioning in the path, a header, a query parameter or the media type: how does Spring Framework 7 resolve each, and how do you retire an old version? |
| [Q41.10](modules/41-fullstack-api-contracts.md#q41-10) | Concept | What is a problem detail (RFC 9457), what does Spring's `ProblemDetail` render by default, and what must you add for validation errors? |
| [Q41.11](modules/41-fullstack-api-contracts.md#q41-11) | Output | On Angular's default fetch backend, a JSON request gets a 400 `application/problem+json`, a blob download gets the same, and a JSON request gets a 502 HTML page: what is `error` in each `HttpErrorResponse`? |
| [Q41.12](modules/41-fullstack-api-contracts.md#q41-12) | Design | Design the error contract an Angular app and a Spring API share: problem types, extension members, statuses, lost updates and retried writes. |
| [Q41.13](modules/41-fullstack-api-contracts.md#q41-13) | Difference | Offset or cursor (keyset) pagination: consistency under inserts, cost on deep pages, and what the Angular list needs from each. |
| [Q41.14](modules/41-fullstack-api-contracts.md#q41-14) | Bug hunt | A controller returns `Page<OrderDto>` and the Angular client reads `totalElements`, `pageable.pageNumber` and `sort`: what is fragile, and what do `PagedModel` and `VIA_DTO` change? |
| [Q41.15](modules/41-fullstack-api-contracts.md#q41-15) | Trade-off | Mirror the validation rules in Angular, derive them from the OpenAPI constraints, or validate only on the server: which rules belong where? |
| [Q41.16](modules/41-fullstack-api-contracts.md#q41-16) | Design | Route a 400 problem with an `errors` array to the right controls: JSON pointers, nested groups and arrays, unknown fields and focus, in reactive forms and Signal Forms. |
| [Q41.17](modules/41-fullstack-api-contracts.md#q41-17) | Difference | Downloading a file: a link the browser follows, a `Blob` through `HttpClient`, or a streamed response. What changes for memory, auth headers, progress and the file name? |
| [Q41.18](modules/41-fullstack-api-contracts.md#q41-18) | Design | Upload a 2 GB video from Angular to Spring Boot: multipart limits, chunked and resumable upload, progress, and retrying a failed chunk. |
| [Q41.19](modules/41-fullstack-api-contracts.md#q41-19) | Output | `JSON.parse` on a payload with an `Instant`, a `LocalDate`, a `Long` above 2^53 and a `BigDecimal` written as a number: what values does the Angular side get? |
| [Q41.20](modules/41-fullstack-api-contracts.md#q41-20) | Design | A money and time contract: decimal strings or minor units with a currency code, instants in UTC, dates without a zone, and the user's time zone. Which goes where? |
| [Q41.21](modules/41-fullstack-api-contracts.md#q41-21) | Concept | Under the hood: trace one invalid POST through Spring's CORS and security filters, the handler, `@Valid`, `ResponseEntityExceptionHandler` and Jackson, then back through Angular's fetch backend, the interceptors and the form. |

### 42 · Full-stack authentication: Angular and Spring Security

| ID | Type | Question |
|---|---|---|
| [Q42.01](modules/42-fullstack-authentication.md#q42-01) | Concept | Authentication versus authorization, and a session cookie versus a bearer token: what does the server keep, and what does each request carry? |
| [Q42.02](modules/42-fullstack-authentication.md#q42-02) | Trade-off | Server sessions or self-contained JWTs for an Angular app and a Spring API: revocation, scaling across instances, size, and what logout can do |
| [Q42.03](modules/42-fullstack-authentication.md#q42-03) | Bug hunt | "Stateless JWTs" in production: a 24-hour access token, a role change that takes a day to apply, a logout that only deletes the token in the browser, and a token the server decodes but never verifies. What is wrong in each? |
| [Q42.04](modules/42-fullstack-authentication.md#q42-04) | Concept | Walk through the Authorization Code flow with PKCE for a single-page app: who talks to whom, and what do `state`, `nonce`, `code_verifier` and `code_challenge` each protect? |
| [Q42.05](modules/42-fullstack-authentication.md#q42-05) | Output | PKCE with `S256` for the verifier from RFC 7636's example: what `code_challenge` is sent, and what does the token endpoint compare? |
| [Q42.06](modules/42-fullstack-authentication.md#q42-06) | Difference | OAuth 2.0 versus OpenID Connect: the access token, the ID token and the userinfo endpoint, and which one the API should accept |
| [Q42.07](modules/42-fullstack-authentication.md#q42-07) | Concept | Why is the implicit flow gone for single-page apps, and what replaced it? |
| [Q42.08](modules/42-fullstack-authentication.md#q42-08) | Trade-off | A browser-only OAuth client, a token-mediating backend or a backend-for-frontend: what can injected script steal in each, and what does each cost to run? |
| [Q42.09](modules/42-fullstack-authentication.md#q42-09) | Design | Build a backend-for-frontend for an Angular app with Spring: `oauth2Login`, the session cookie and its attributes, `TokenRelay` in Spring Cloud Gateway, and what the browser never sees |
| [Q42.10](modules/42-fullstack-authentication.md#q42-10) | Concept | Refresh token rotation and reuse detection: what does the authorization server keep, and what happens when a stolen refresh token is replayed? |
| [Q42.11](modules/42-fullstack-authentication.md#q42-11) | Difference | Silent renew in a hidden iframe versus refresh tokens: why did third-party cookie blocking move single-page apps to refresh tokens, and what does each need from the authorization server? |
| [Q42.12](modules/42-fullstack-authentication.md#q42-12) | Bug hunt | Two tabs refresh at once and one is logged out, a refresh token sits in `localStorage`, and a public client never receives a refresh token from Spring Authorization Server. What is going on in each? |
| [Q42.13](modules/42-fullstack-authentication.md#q42-13) | Concept | What does Spring Security's resource server check on a JWT by default, and how do the token's scopes become authorities? |
| [Q42.14](modules/42-fullstack-authentication.md#q42-14) | Output | Our verifier, configured like a Boot resource server with only `issuer-uri`, checks five tokens: a valid one, one expired 30 seconds ago, one for another audience, one with `alg: none`, and one signed by an unknown key. Which pass, and why? |
| [Q42.15](modules/42-fullstack-authentication.md#q42-15) | Design | Map roles from a custom claim to authorities and enforce them with `@PreAuthorize`, without trusting what the Angular client believes the role is |
| [Q42.16](modules/42-fullstack-authentication.md#q42-16) | Difference | Validating JWTs locally versus introspecting opaque tokens: latency, revocation, and what the resource server must be able to reach |
| [Q42.17](modules/42-fullstack-authentication.md#q42-17) | Concept | What does Spring Security 7's `csrf.spa()` configure, why does BREACH protection make a plain cookie value fail without it, and why must the client fetch a new token after login and logout? |
| [Q42.18](modules/42-fullstack-authentication.md#q42-18) | Bug hunt | After moving to a backend-for-frontend every POST gets 403 from Spring Security: the raw cookie value is sent, the token was read before login, and someone suggests `csrf.disable()` "because we use cookies now". Find each bug. |
| [Q42.19](modules/42-fullstack-authentication.md#q42-19) | Design | The Angular side of a BFF login: an auth state from `/api/me` at startup, a `canMatch` guard with a return URL, a 401 interceptor, and why none of it is security |
| [Q42.20](modules/42-fullstack-authentication.md#q42-20) | Difference | `angular-oauth2-oidc` versus `angular-auth-oidc-client` on Angular 22: setup, the default flow, storage, how the token is attached, and renewal |
| [Q42.21](modules/42-fullstack-authentication.md#q42-21) | Design | "Log out everywhere": local logout, RP-initiated logout, back-channel logout, token revocation, the other tabs and the other devices |
| [Q42.22](modules/42-fullstack-authentication.md#q42-22) | Design | Session timeout UX: an idle warning, server-side expiry, a request that fails with 401 in the middle of a form, and keeping the user's unsaved work |
| [Q42.23](modules/42-fullstack-authentication.md#q42-23) | Concept | Under the hood: trace one BFF login and the first API call through Spring Security's filters, the authorization server, Spring Cloud Gateway and the resource server |

### 43 · Full-stack real time: polling, Server-Sent Events and WebSockets with Angular and Spring

| ID | Type | Question |
|---|---|---|
| [Q43.01](modules/43-fullstack-realtime.md#q43-01) | Concept | Polling, long polling, Server-Sent Events and WebSockets: what does each keep open, who may send, and what does one message cost? |
| [Q43.02](modules/43-fullstack-realtime.md#q43-02) | Trade-off | A notification badge, a live dashboard, a chat and an alert for a user with no tab open: which transport for each, and when does plain polling still win? |
| [Q43.03](modules/43-fullstack-realtime.md#q43-03) | Bug hunt | Long polling in Spring MVC: a `DeferredResult` that nobody completes on timeout, a client that re-requests at once after every error, and a sixth tab that hangs. What goes wrong in each? |
| [Q43.04](modules/43-fullstack-realtime.md#q43-04) | Output | An event stream with a comment, two `id` lines, a bare `id`, a `retry` line and a block with no blank line after it: which events does `onmessage` receive, with which `data` and `lastEventId`? |
| [Q43.05](modules/43-fullstack-realtime.md#q43-05) | Concept | How does `EventSource` reconnect: the reconnection time, the `retry` field, the `Last-Event-ID` header, and which responses stop it for good? |
| [Q43.06](modules/43-fullstack-realtime.md#q43-06) | Difference | `SseEmitter` in Spring MVC versus `Flux<ServerSentEvent>` in WebFlux: threads, timeouts, completion, and noticing that the client has gone |
| [Q43.07](modules/43-fullstack-realtime.md#q43-07) | Bug hunt | An `SseEmitter` endpoint keeps every emitter in a list it never cleans, sends nothing for minutes behind a proxy, relies on a timeout nobody set, and sends events without ids. Find each problem. |
| [Q43.08](modules/43-fullstack-realtime.md#q43-08) | Design | Resume an SSE stream after a disconnect: event ids, a replay buffer on the server, reading `Last-Event-ID` in Spring, and what to do when the client is too far behind |
| [Q43.09](modules/43-fullstack-realtime.md#q43-09) | Trade-off | `EventSource`, `fetch` with a stream reader, or `HttpClient` with download progress, for an SSE endpoint that needs an `Authorization` header: which, and what do you give up with each? |
| [Q43.10](modules/43-fullstack-realtime.md#q43-10) | Design | Wrap a server-sent event stream in an Observable for Angular: teardown on unsubscribe, named events, a reconnect versus a fatal error, and rendering without zone.js |
| [Q43.11](modules/43-fullstack-realtime.md#q43-11) | Concept | Why STOMP over WebSocket: frames and destinations, `/app` versus `/topic` and `/queue`, and how Spring routes a `SEND` to an `@MessageMapping` method and a broker |
| [Q43.12](modules/43-fullstack-realtime.md#q43-12) | Output | STOMP heart-beats: the client sends `heart-beat:10000,10000`, and the server answers `heart-beat:0,0` in one run and `heart-beat:10000,10000` in another. How often does each side send and check in each run? |
| [Q43.13](modules/43-fullstack-realtime.md#q43-13) | Output | RxJS `webSocket` over a fake socket: two messages sent before the socket opens, then a clean close, then an unclean close under `retry(1)`. What does the socket receive, and what does the subscriber see? |
| [Q43.14](modules/43-fullstack-realtime.md#q43-14) | Difference | RxJS `webSocket` versus `@stomp/rx-stomp`: framing, reconnection, resubscription after a reconnect, heart-beats and messages sent while offline |
| [Q43.15](modules/43-fullstack-realtime.md#q43-15) | Concept | A browser cannot set headers on the WebSocket handshake: where can the credential go (a session cookie, a query parameter, the STOMP `CONNECT` frame), and what does each cost? |
| [Q43.16](modules/43-fullstack-realtime.md#q43-16) | Bug hunt | Spring Security on a STOMP endpoint: `CONNECT` fails with an invalid CSRF token although Angular sends `X-XSRF-TOKEN`, any client can `SEND` to `/topic/prices`, and a socket outlives its access token by hours. Find each cause. |
| [Q43.17](modules/43-fullstack-realtime.md#q43-17) | Design | From a socket to the screen in a zoneless app: one shared connection, `toSignal` or `rxResource` with `stream`, conflating bursts, and a connection-state signal |
| [Q43.18](modules/43-fullstack-realtime.md#q43-18) | Bug hunt | A live list: `shareReplay(1)` keeps the socket open after the last component leaves, two components open two connections, and a burst of 500 messages a second freezes the page. What is wrong in each? |
| [Q43.19](modules/43-fullstack-realtime.md#q43-19) | Trade-off | Scaling real time on Spring: sticky sessions, the simple broker, a STOMP broker relay to RabbitMQ, and user destinations across instances. What does each buy, and what breaks without it? |
| [Q43.20](modules/43-fullstack-realtime.md#q43-20) | Concept | Backpressure end to end: why the browser's `WebSocket` has none, Spring's send-time and buffer limits, `TERMINATE` versus `DROP`, and what the Angular client does under a burst |
| [Q43.21](modules/43-fullstack-realtime.md#q43-21) | Concept | Under the hood: trace one message from a browser's `SEND` frame through Spring's channels, the `@MessageMapping` method and the broker relay to a signal in another user's tab on another instance |

### 44 · Full-stack delivery and operations: Docker, Nginx, runtime configuration, observability and safe releases for Angular and Spring Boot

| ID | Type | Question |
|---|---|---|
| [Q44.01](modules/44-fullstack-delivery-and-operations.md#q44-01) | Concept | Direct calls, a same-origin reverse proxy, an API gateway and a backend-for-frontend: what does each put between Angular and Spring Boot, and what does each cost? |
| [Q44.02](modules/44-fullstack-delivery-and-operations.md#q44-02) | Trade-off | A public SPA with one API, a product with six services and a mobile app, and an OAuth app that must keep tokens out of the browser: direct calls, a gateway or a BFF? |
| [Q44.03](modules/44-fullstack-delivery-and-operations.md#q44-03) | Design | Write the Dockerfile for an Angular app served by Nginx: the stages, the layer order, what the final image contains and which user runs it |
| [Q44.04](modules/44-fullstack-delivery-and-operations.md#q44-04) | Bug hunt | A Dockerfile review: `COPY . .` before `npm ci`, no `.dockerignore`, `ng serve` as the command, and the API URL passed as a build argument. What does each cost? |
| [Q44.05](modules/44-fullstack-delivery-and-operations.md#q44-05) | Output | Our location model on the lab's Nginx config: which location answers `/orders/42`, a deleted `/main-OLDHASH1.js`, `/favicon.ico`, `/config.json` and `/index.html`, with which status and `Cache-Control`? |
| [Q44.06](modules/44-fullstack-delivery-and-operations.md#q44-06) | Bug hunt | An Nginx review: security headers missing on JavaScript files, `index.html` cached for a year, no CSP on error pages, and JavaScript sent uncompressed although `gzip on` is set. Find each cause. |
| [Q44.07](modules/44-fullstack-delivery-and-operations.md#q44-07) | Bug hunt | Behind the proxy: `/api/orders` reaches Spring Boot as `/orders`, redirects point at `http://`, WebSocket upgrades fail, and an SSE stream arrives in bursts and drops after a minute. What is wrong in each? |
| [Q44.08](modules/44-fullstack-delivery-and-operations.md#q44-08) | Concept | How do the client's scheme, host and address survive a reverse proxy into Spring Boot, and why may only a trusted proxy set those headers? |
| [Q44.09](modules/44-fullstack-delivery-and-operations.md#q44-09) | Design | One image for four environments: who writes `config.json`, when, how it is cached, what may go in it, and what the user sees when it is wrong |
| [Q44.10](modules/44-fullstack-delivery-and-operations.md#q44-10) | Output | Our model of the Nginx image's template step renders a template holding `${API_URL}`, `$uri`, `${UNSET}` and `${HOME}` under a variable filter: what does the output contain? |
| [Q44.11](modules/44-fullstack-delivery-and-operations.md#q44-11) | Concept | An SSR container receives SIGTERM: what happens with Node as PID 1, with a shell-form command and with `--init`, and in what order should the server stop? |
| [Q44.12](modules/44-fullstack-delivery-and-operations.md#q44-12) | Bug hunt | An SSR container review: `npm start` as the command, no SIGTERM handler, a liveness probe that renders the home page, and the server running as root. What breaks, and when? |
| [Q44.13](modules/44-fullstack-delivery-and-operations.md#q44-13) | Design | Design CI/CD for an Angular app and a Spring Boot API: stages per layer, building once and promoting by digest, the deployment order and previews |
| [Q44.14](modules/44-fullstack-delivery-and-operations.md#q44-14) | Trade-off | One repository or two for an Angular app and its Spring Boot API: builds, contract changes, ownership and release cadence |
| [Q44.15](modules/44-fullstack-delivery-and-operations.md#q44-15) | Concept | Versioning the contract across deploys: tabs still running the old bundle, expand and contract, a support window, and a contract check that fails the pull request |
| [Q44.16](modules/44-fullstack-delivery-and-operations.md#q44-16) | Concept | OpenFeature on the client: provider, client, evaluation context, the static-context paradigm, and what an evaluation returns when the provider fails |
| [Q44.17](modules/44-fullstack-delivery-and-operations.md#q44-17) | Trade-off | A risky checkout change: a feature flag, a canary release or blue-green? And what goes wrong when `index.html` and its chunks come from different versions? |
| [Q44.18](modules/44-fullstack-delivery-and-operations.md#q44-18) | Design | Real user monitoring and error tracking for an Angular app: what to send per page view and per error, when to send it, sampling, and matching a minified stack to its release |
| [Q44.19](modules/44-fullstack-delivery-and-operations.md#q44-19) | Difference | A correlation ID such as `X-Request-ID`, W3C Trace Context and a vendor's own header: what does each identify, and which does Spring Boot read by default? |
| [Q44.20](modules/44-fullstack-delivery-and-operations.md#q44-20) | Output | Our `traceparent` parser on five headers: a valid sampled one, an all-zero trace ID, uppercase hex, version `ff`, and a higher version with an extra field. Which are accepted, and with which flags? |
| [Q44.21](modules/44-fullstack-delivery-and-operations.md#q44-21) | Concept | Under the hood: trace one click from an Angular handler through `fetch` with `traceparent`, the CORS preflight, Nginx and Spring Boot's tracing to a log line, and back to the error report |

## Part F · System design

### 45 · Front-end system design method: requirements, architecture, state, APIs, performance, accessibility, failure modes and communicating trade-offs

| ID | Type | Question |
|---|---|---|
| [Q45.01](modules/45-frontend-system-design-method.md#q45-01) | Concept | What does a front-end system design interview evaluate, and how does it differ from a backend design round? |
| [Q45.02](modules/45-frontend-system-design-method.md#q45-02) | Difference | Front-end system design, a machine-coding round and a walkthrough of a system you built: what does each round test, and how do you prepare differently? |
| [Q45.03](modules/45-frontend-system-design-method.md#q45-03) | Design | A 45-minute slot: plan your time across the method's steps, the checkpoints where you ask where to go deeper, and what you cut when one step runs long |
| [Q45.04](modules/45-frontend-system-design-method.md#q45-04) | Concept | "It depends" is not an answer: what makes a trade-off statement complete, shown on one decision for a task board? |
| [Q45.05](modules/45-frontend-system-design-method.md#q45-05) | Bug hunt | A whiteboard review: one box per file, unlabeled arrows, no line between browser and server, and a database drawn inside the browser. What does each cost the answer? |
| [Q45.06](modules/45-frontend-system-design-method.md#q45-06) | Design | The first five minutes of "design a team task board": which clarifying questions, which functional and non-functional requirements, and which numbers do you write down? |
| [Q45.07](modules/45-frontend-system-design-method.md#q45-07) | Output | Our estimator on the board's first screen: payload, round trips and transfer time on the mobile and desktop profiles. What does it print? |
| [Q45.08](modules/45-frontend-system-design-method.md#q45-08) | Design | Draw the task board's component tree and client-side model: routes, containers, presentational components, lazy boundaries and the shape of the cards in memory |
| [Q45.09](modules/45-frontend-system-design-method.md#q45-09) | Output | Our state-placement function on six pieces of the board's state: the open card, the filters, the cards, a drag in progress, a draft comment and the theme. Where does each go? |
| [Q45.10](modules/45-frontend-system-design-method.md#q45-10) | Trade-off | The board's first screen: one request per resource, one aggregated screen endpoint, or a query language such as GraphQL? Round trips, caching, coupling and who owns the shape |
| [Q45.11](modules/45-frontend-system-design-method.md#q45-11) | Design | Design the task board's API: resources, the first-screen read, pagination, the move-card write, errors and live updates |
| [Q45.12](modules/45-frontend-system-design-method.md#q45-12) | Bug hunt | Performance and accessibility in a design answer: "lazy-load everything", "virtual-scroll the board", drag and drop as the only way to move a card, and a spinner for every request. What is wrong with each? |
| [Q45.13](modules/45-frontend-system-design-method.md#q45-13) | Concept | Every cache between the user and the database: what does each layer hold, who invalidates it, and how stale can it be? |
| [Q45.14](modules/45-frontend-system-design-method.md#q45-14) | Output | Our cache-layer model: a user edits a card title, reloads and sees the old title. Which layer answered each of five requests? |
| [Q45.15](modules/45-frontend-system-design-method.md#q45-15) | Design | Failure modes and observability as the last step: list what breaks per dependency, choose the degraded behavior, and name the signal that tells you it happened |
| [Q45.16](modules/45-frontend-system-design-method.md#q45-16) | Trade-off | Offline and write consistency per interaction for the task board: no offline, read-only offline or queued writes; optimistic, pessimistic or conditional writes |
| [Q45.17](modules/45-frontend-system-design-method.md#q45-17) | Concept | Under the hood: consistency across tabs and devices: read-your-writes, last-write-wins versus `If-Match` and 412, and what `BroadcastChannel` and a live stream each add |

### 46 · System design case studies: typeahead search, an infinite feed, a data grid, a form wizard, a live dashboard, notifications and a money transfer

| ID | Type | Question |
|---|---|---|
| [Q46.01](modules/46-system-design-case-studies.md#q46-01) | Concept | A case-study answer in this module: which parts every design carries, which part each of the seven cases stresses, and what the code kernel adds |
| [Q46.02](modules/46-system-design-case-studies.md#q46-02) | Design | Design product search with autocomplete end to end: when a request goes out, what the client caches, the search API and its ranking, the combobox, and what happens when search is slow or down |
| [Q46.03](modules/46-system-design-case-studies.md#q46-03) | Output | Our prefix cache on the typed sequence `a`, `an`, `ang`, `Ang `, `angu`, `an`: which entries send a request, and which are answered from the cache? |
| [Q46.04](modules/46-system-design-case-studies.md#q46-04) | Bug hunt | An autocomplete review: a request per keystroke from the first letter, a cache keyed by the raw input, a popup no screen reader hears about, and a 429 that empties the list |
| [Q46.05](modules/46-system-design-case-studies.md#q46-05) | Design | Design an infinite-scroll feed: the cursor API, merging pages, posts that arrive while you read, a bounded DOM, scroll restoration on Back, and the end of the feed |
| [Q46.06](modules/46-system-design-case-studies.md#q46-06) | Output | Our feed pager over three pages that overlap and two live arrivals: how many posts, in which order, and what does the new-posts pill say? |
| [Q46.07](modules/46-system-design-case-studies.md#q46-07) | Trade-off | New items in a feed: insert them live, hold them behind a "show N new" pill, or fetch only on request? Scroll stability, freshness, attention and announcements |
| [Q46.08](modules/46-system-design-case-studies.md#q46-08) | Bug hunt | Infinite scroll in production: the same post twice after a new one is published, a sentinel that loads pages in a loop, Back that returns to the top, and a footer nobody can reach |
| [Q46.09](modules/46-system-design-case-studies.md#q46-09) | Design | Design a grid over two million orders with server-side filtering, sorting and pagination: the query contract, the URL, request coordination, the column model, and the table or grid pattern |
| [Q46.10](modules/46-system-design-case-studies.md#q46-10) | Trade-off | An exact total, an estimated total or "more results": what does each cost the database and the user, and when does each fit a grid? |
| [Q46.11](modules/46-system-design-case-studies.md#q46-11) | Output | Our grid query: two URLs whose filters come in different orders, then a sort change on page three. Which cache keys, cursors and URLs result? |
| [Q46.12](modules/46-system-design-case-studies.md#q46-12) | Design | Design a multi-step claim wizard with draft saving: the step model, validation per step, conditional steps, where the draft lives, resuming on another device, and the final submit |
| [Q46.13](modules/46-system-design-case-studies.md#q46-13) | Output | Our wizard over answers that hide a step and a draft saved by an older schema: which steps are visible, where does the user land, and what does the migrated draft hold? |
| [Q46.14](modules/46-system-design-case-studies.md#q46-14) | Trade-off | A wizard draft in browser storage, on the server, or both: privacy, resuming on another device, conflicts between tabs and schema changes |
| [Q46.15](modules/46-system-design-case-studies.md#q46-15) | Bug hunt | A wizard review: the current step kept only in a component, Back that leaves the wizard, a save on every keystroke, and a hidden step's validation blocking submit |
| [Q46.16](modules/46-system-design-case-studies.md#q46-16) | Design | Design a real-time operations dashboard: thirty widgets, bursts of 2,000 events a second, the transport, where aggregation happens, the render cadence, staleness, and a screen left open for days |
| [Q46.17](modules/46-system-design-case-studies.md#q46-17) | Output | Our aggregator over one window of mixed events for a counter, a gauge and a latency widget, then a silent stream: what does each widget render, and when does each turn stale? |
| [Q46.18](modules/46-system-design-case-studies.md#q46-18) | Trade-off | Aggregate on the server, in a BFF or in the browser: bandwidth, device CPU, per-user views, and what a reconnect costs |
| [Q46.19](modules/46-system-design-case-studies.md#q46-19) | Design | Design a notifications center: delivery while a tab is open and when none is, the unread count, mark as read across tabs and devices, and ordering |
| [Q46.20](modules/46-system-design-case-studies.md#q46-20) | Output | Our unread counter with a duplicate delivery, a read receipt that arrives before its notification, and a second tab: what count does each tab show after each event? |
| [Q46.21](modules/46-system-design-case-studies.md#q46-21) | Difference | An editing indicator or a lock: heartbeats and a time-to-live versus exclusive access, and what each does when a laptop lid closes |
| [Q46.22](modules/46-system-design-case-studies.md#q46-22) | Design | Design a money transfer flow end to end: the steps, the idempotency key's life, the transfer's states, what the screen shows while pending, and the confirmation |
| [Q46.23](modules/46-system-design-case-studies.md#q46-23) | Concept | Under the hood: what the Idempotency-Key draft asks of client and server (a unique key; 400, 409 and 422; expiry), and why the key belongs to the intent, not the attempt |
| [Q46.24](modules/46-system-design-case-studies.md#q46-24) | Trade-off | Optimistic UI for money: what may appear before the server confirms, what never does, and how that fits "money actions are pessimistic" |
| [Q46.25](modules/46-system-design-case-studies.md#q46-25) | Bug hunt | A transfer review: a key generated per HTTP attempt, a retry that edits the amount, a timeout shown as "failed", a double click that sends two keys, and a balance changed before confirmation |
| [Q46.26](modules/46-system-design-case-studies.md#q46-26) | Output | Our transfer client when the first response is lost, the retry meets 409, and the next retry gets the stored result: which states and requests, in order? |

## Part G · Interview practice

### 47 · Behavioral interviews and interview craft: front-end stories, legacy without blame, live coding, take-homes and the questions you ask

| ID | Type | Question |
|---|---|---|
| [Q47.01](modules/47-behavioral-and-interview-craft.md#q47-01) | Concept | What does a behavioral round collect from a story, and why does a story that never states its result score as "unclear impact"? |
| [Q47.02](modules/47-behavioral-and-interview-craft.md#q47-02) | Design | Build a story bank for an Angular full-stack role: which six to eight stories, which prompts each one answers, and how each fits in two minutes |
| [Q47.03](modules/47-behavioral-and-interview-craft.md#q47-03) | Design | "Tell me about a performance improvement you made": a front-end story with the baseline, how it was measured, the bottleneck, the change and proof that it held |
| [Q47.04](modules/47-behavioral-and-interview-craft.md#q47-04) | Design | "Tell me about a production incident in the front end": a blank screen after a release, told from detection through mitigation, cause and prevention |
| [Q47.05](modules/47-behavioral-and-interview-craft.md#q47-05) | Design | "Tell me about a disagreement over front-end architecture": how you argued, when you stopped, how you committed, and what the outcome taught you |
| [Q47.06](modules/47-behavioral-and-interview-craft.md#q47-06) | Bug hunt | Four story drafts: "the app got three times faster", an incident with no abandoned hypothesis, a migration that "we" did, and a disagreement everyone agreed with. What does each cost, and what fixes it? |
| [Q47.07](modules/47-behavioral-and-interview-craft.md#q47-07) | Concept | Talking about a legacy Angular codebase without blame: what you describe, which words turn a story into an accusation, and how you say what you would do differently |
| [Q47.08](modules/47-behavioral-and-interview-craft.md#q47-08) | Trade-off | A migration story when you were part of the decision: an incremental migration or a rewrite, told when it went well and when it did not |
| [Q47.09](modules/47-behavioral-and-interview-craft.md#q47-09) | Output | Our legacy price-label function on five inputs: what does each call return, and which result do the characterization tests pin as a quirk instead of fixing it? |
| [Q47.10](modules/47-behavioral-and-interview-craft.md#q47-10) | Concept | The first five minutes of an Angular live-coding task: which clarifying questions, what you say about your plan, and the smallest version that works |
| [Q47.11](modules/47-behavioral-and-interview-craft.md#q47-11) | Bug hunt | A live-coding replay: ten silent minutes, an NgModule for a one-component task, a `subscribe` inside a `subscribe`, no empty or error state tried, and a guess instead of a docs lookup. What does each cost? |
| [Q47.12](modules/47-behavioral-and-interview-craft.md#q47-12) | Trade-off | A four-hour take-home for an Angular role: a store library, SSR and end-to-end tests, or a small tested core with a README? What reviewers can see, and what over-building costs |
| [Q47.13](modules/47-behavioral-and-interview-craft.md#q47-13) | Design | The take-home README and the review call: what the README says, and how you defend, change and extend the code live |
| [Q47.14](modules/47-behavioral-and-interview-craft.md#q47-14) | Design | Questions to ask about the front-end practice: the Angular version and update cadence, testing, the design system and accessibility, performance measurement, contracts and releases, and how to read each answer |
| [Q47.15](modules/47-behavioral-and-interview-craft.md#q47-15) | Concept | Under the hood: how an interviewer drills into one story (what you did, how you know, what it cost, what you would change), and how to keep every number defensible |
