# 28 — Rapid-fire question bank

> **How to use this module.** Read the bold question, say your answer out loud in one or two sentences, then open the answer. Every answer ends with a link to the section that explains it in depth: if you missed one, read that section, then retry the question two days later. Sections follow the module order (28.N drills module N); the **Mixed drill** at the end shuffles questions across modules so you cannot rely on the topic as a hint. Tags show the origin of the idea ([JS], [TS], [Browser], [React], [React DOM], [Library: x], [Framework: Next.js], [Framework: React Router], [Backend: Spring], [Tooling: x]).

**Prerequisites:** None (this is the self-check bank for modules [01](01-javascript.md) to [27](27-interview-execution.md)).

---

## 28.1 JavaScript for React and interviews

**Q1. What does `typeof null` return, and how do you test for an array?**
<details><summary>Answer</summary>

`'object'` (a historical bug), and `typeof []` is also `'object'`. Test with `=== null` and `Array.isArray`. [JS] · [01 §1.1](01-javascript.md#11-values-types-and-typeof-quirks)

</details>

**Q2. Why is `isNaN('abc')` true, and what should you use instead?**
<details><summary>Answer</summary>

The global `isNaN` coerces its argument to a number first, and `'abc'` becomes `NaN`. `NaN !== NaN` as well, so use `Number.isNaN`. [JS] · [01 §1.1](01-javascript.md#11-values-types-and-typeof-quirks)

</details>

**Q3. What do `[1] == 1` and `[1] == [1]` return?**
<details><summary>Answer</summary>

`true` and `false`. The first coerces the array to a primitive and then to a number. The second compares two different references. Use `===` on purpose. [JS] · [01 §1.2](01-javascript.md#12-coercion-and--vs-)

</details>

**Q4. What is the difference between `a || b` and `a ?? b`?**
<details><summary>Answer</summary>

`||` falls back on any falsy value (`0`, `''`, `false`), while `??` falls back only on `null` or `undefined`. `0 ?? 5` is `0`, `0 || 5` is `5`. [JS] · [01 §1.10](01-javascript.md#110-spread-rest-destructuring-optional-chaining-nullish-coalescing)

</details>

**Q5. What does this print: `for (var i = 0; i < 3; i++) setTimeout(() => console.log(i))`? And with `let`?**
<details><summary>Answer</summary>

`3 3 3` with `var` (one function-scoped binding, read after the loop ends) and `0 1 2` with `let` (a fresh binding per iteration). [JS] · [01 §1.3](01-javascript.md#13-scope-global-function-block)

</details>

**Q6. Calling `var f = function () {}` before its line: `ReferenceError` or `TypeError`?**
<details><summary>Answer</summary>

`TypeError`: `var f` is hoisted and initialized to `undefined`, so you are calling `undefined`. A `let`/`const` accessed early is a `ReferenceError` from the temporal dead zone. [JS] · [01 §1.4](01-javascript.md#14-hoisting-and-the-tdz)

</details>

**Q7. What is a closure, and how does it explain stale closures in React?**
<details><summary>Answer</summary>

A function plus the live variables it captured from its scope. Each React render creates new constants, so a callback created in render N only ever sees render N's values. [JS] · [01 §1.5](01-javascript.md#15-closures)

</details>

**Q8. Why does `onClick={this.handle}` lose `this`, and how do arrow functions differ?**
<details><summary>Answer</summary>

`this` is decided by how a function is called, and a detached method is called with no receiver. Arrow functions have no own `this`, `arguments` or `prototype` and cannot be used with `new`. [JS] · [01 §1.6](01-javascript.md#16-this-and-binding-callapplybind-arrow-functions)

</details>

**Q9. Is `const` immutable? Is `Object.freeze`?**
<details><summary>Answer</summary>

No to both in the deep sense. `const` stops rebinding only (`const a = []; a.push(1)` works), and `Object.freeze` is shallow. React still needs new references for changes. [JS] · [01 §1.9](01-javascript.md#19-immutability-and-structural-sharing)

</details>

**Q10. In what order do `console.log(1)`, `setTimeout(..., 0)`, `Promise.resolve().then(...)` and `console.log(4)` print?**
<details><summary>Answer</summary>

Sync first (`1`, `4`), then the microtask (the promise callback), then the macrotask (the timeout). Microtasks drain before the next macrotask and before rendering. [JS] · [01 §1.16](01-javascript.md#116-the-event-loop-call-stack-microtasks-vs-macrotasks-rendering-steps)

</details>

**Q11. Does `array.forEach(async (x) => { await work(x) })` wait for the work?**
<details><summary>Answer</summary>

No. `forEach` ignores the returned promises. Use `for...of` with `await`, or `await Promise.all(array.map(...))` for parallel work. [JS] · [01 §1.15](01-javascript.md#115-asyncawait-and-error-handling)

</details>

**Q12. Why does `try { return promise } catch {}` not catch the rejection?**
<details><summary>Answer</summary>

The function returns before the promise settles, so the `catch` has already been left. `return await promise` keeps the `try` active. [JS] · [01 §1.15](01-javascript.md#115-asyncawait-and-error-handling)

</details>

**Q13. Does `Promise.all` cancel the other promises when one rejects?**
<details><summary>Answer</summary>

No. It rejects fast with the first rejection, but the other operations keep running. Use `allSettled` when you need every outcome, and `AbortController` to actually cancel. [JS] · [01 §1.14](01-javascript.md#114-promises)

</details>

**Q14. What does `['1', '2', '3'].map(parseInt)` return?**
<details><summary>Answer</summary>

`[1, NaN, NaN]`. `map` passes the index as the second argument, which `parseInt` reads as the radix. [JS] · [01 §1.21](01-javascript.md#121-classic-trick-questions-and-output-prediction-puzzles)

</details>

**Q15. What does `[10, 9, 1].sort()` return, and why is it dangerous on React state?**
<details><summary>Answer</summary>

`[1, 10, 9]`: the default sort is lexicographic. It also mutates in place, so on state you must copy first or use `toSorted`. [JS] · [01 §1.11](01-javascript.md#111-array-and-object-methods)

</details>

**Q16. Debounce versus throttle?**
<details><summary>Answer</summary>

Debounce runs once after calls stop for N ms (search-as-you-type). Throttle runs at most once per N ms (scroll handlers). A debounced function created in a component body is recreated every render and never debounces. [JS] · [01 §1.18](01-javascript.md#118-debounce-and-throttle)

</details>

**Q17. `JSON.parse(JSON.stringify(x))` versus `structuredClone(x)` for a deep copy?**
<details><summary>Answer</summary>

JSON drops `undefined` and functions, turns `NaN` into `null`, and throws on cycles and `BigInt`. `structuredClone` handles cycles and more types but throws on functions and loses prototypes. [JS] · [01 §1.19](01-javascript.md#119-shallow-vs-deep-copy)

</details>

**Q18. Name three common sources of memory leaks in a front end.**
<details><summary>Answer</summary>

Event listeners that are never removed, timers/intervals that are never cleared, and closures that keep large objects alive. `WeakMap`/`WeakRef` help for caches keyed by objects. [JS] · [01 §1.20](01-javascript.md#120-memory-gc-leaks-from-closures-listeners-and-timers-weakmapweakref)

</details>

---

## 28.2 TypeScript

**Q1. Does `x as Foo` convert or check anything?**
<details><summary>Answer</summary>

No. It tells the compiler to trust you, and the types are erased at runtime. `as unknown as Foo` always compiles and is almost always a bug. [TS] · [02 §2.11](02-typescript.md#211-unknown-vs-any-vs-never-satisfies)

</details>

**Q2. What is the type of `e` in `catch (e)` under `strict`?**
<details><summary>Answer</summary>

`unknown`. Narrow with `instanceof Error` before reading `.message`. [TS] · [02 §2.6](02-typescript.md#26-narrowing-typeof-in-instanceof-type-predicates-assertion-functions)

</details>

**Q3. Why does `Object.keys(obj)` return `string[]` instead of `(keyof T)[]`?**
<details><summary>Answer</summary>

TypeScript is structural: a value may have more keys than its static type says. [TS] · [02 §2.4](02-typescript.md#24-structural-typing)

</details>

**Q4. When do excess property checks fire?**
<details><summary>Answer</summary>

Only on fresh object literals. Assign the literal to a variable first and the extra or misspelled property is accepted. [TS] · [02 §2.4](02-typescript.md#24-structural-typing)

</details>

**Q5. `unknown` versus `any`?**
<details><summary>Answer</summary>

`any` turns the checker off. `unknown` accepts any value but forces you to narrow before use, so it is the right type for untrusted input. [TS] · [02 §2.11](02-typescript.md#211-unknown-vs-any-vs-never-satisfies)

</details>

**Q6. How do you get a compile error when someone adds a new member to a union and forgets a `switch` case?**
<details><summary>Answer</summary>

Use a discriminated union and end the switch with `assertNever(x: never)`. The unhandled member is not assignable to `never`. [TS] · [02 §2.7](02-typescript.md#27-discriminated-unions-and-exhaustiveness-with-never)

</details>

**Q7. What does `satisfies` do that an annotation does not?**
<details><summary>Answer</summary>

It checks the value against a type without widening it, so you keep the precise inferred type (literal keys and values) while still catching mistakes. [TS] · [02 §2.11](02-typescript.md#211-unknown-vs-any-vs-never-satisfies)

</details>

**Q8. `interface` versus `type`: the practical differences?**
<details><summary>Answer</summary>

Interfaces can merge by declaration and extend; type aliases can name unions, tuples and mapped types. For object shapes either works, so pick one convention. [TS] · [02 §2.12](02-typescript.md#212-interface-vs-type)

</details>

**Q9. Why does a generic arrow function in a `.tsx` file need `<T,>`?**
<details><summary>Answer</summary>

Otherwise the parser reads `<T>` as a JSX element. `<T,>` or `<T extends unknown>` disambiguates. [TS] · [02 §2.8](02-typescript.md#28-generics-and-constraints)

</details>

**Q10. Is `Partial<T>` deep? Does `Omit<User, 'pasword'>` catch the typo?**
<details><summary>Answer</summary>

`Partial` is shallow. `Omit` does not check that the key exists, so the typo is silently accepted. [TS] · [02 §2.9](02-typescript.md#29-utility-types)

</details>

**Q11. Do TypeScript prop types validate data from the server at runtime?**
<details><summary>Answer</summary>

No, types are erased. Parse untrusted data (`unknown`) with a schema such as Zod, which also derives the static type. [TS] [Library: Zod] · [02 §2.16](02-typescript.md#216-runtime-validation-with-zod-vs-static-types)

</details>

**Q12. A Vitest run passes. Does that mean the types are correct?**
<details><summary>Answer</summary>

No. Vitest never type-checks; only `tsc` does, so run `tsc --noEmit` in CI. [Tooling: Vitest] · [02 §2.15](02-typescript.md#215-tsconfig-strictness-flags)

</details>

**Q13. What changed with TypeScript 7?**
<details><summary>Answer</summary>

7.0 is the Go-native port (about 10x faster), and the CLI binary is still `tsc`. 6.0 was the last JavaScript-based release. [TS] · [02 §2.17](02-typescript.md#217-typescript-67-the-native-compiler-and-what-changed)

</details>

---

## 28.3 Browser and web platform

**Q1. Does `fetch` reject on a 404 or 500?**
<details><summary>Answer</summary>

No. It rejects only on network failure, CORS violation or abort. Always check `res.ok`. [Browser] · [03 §3.6](03-browser-and-web-platform.md#36-fetch-requestresponse-streaming-bodies-abortcontroller)

</details>

**Q2. Why does calling `res.json()` after `res.text()` throw?**
<details><summary>Answer</summary>

A response body is single-use. Call `res.clone()` first if you need to read it twice. [Browser] · [03 §3.6](03-browser-and-web-platform.md#36-fetch-requestresponse-streaming-bodies-abortcontroller)

</details>

**Q3. Name the three phases of event propagation.**
<details><summary>Answer</summary>

Capture (window down to the target), target, then bubble (back up). Delegation uses bubbling to handle many children with one listener. [Browser] · [03 §3.2](03-browser-and-web-platform.md#32-events-capture--target--bubble-stoppropagation-preventdefault-delegation)

</details>

**Q4. Where does React 17+ attach its event listeners?**
<details><summary>Answer</summary>

At the root container, not on `document`. Native listeners below the root run before React's handlers, so a native `stopPropagation` can hide the event from React. [React DOM] · [03 §3.3](03-browser-and-web-platform.md#33-how-reacts-event-system-relates-to-native-events)

</details>

**Q5. Does `return false` in a React handler stop propagation or the default action?**
<details><summary>Answer</summary>

No. Call `e.preventDefault()` and `e.stopPropagation()` explicitly. [React DOM] · [03 §3.3](03-browser-and-web-platform.md#33-how-reacts-event-system-relates-to-native-events)

</details>

**Q6. Native `focus` does not bubble. Does React's `onFocus`?**
<details><summary>Answer</summary>

Yes, React's `onFocus`/`onBlur` bubble (they are backed by `focusin`/`focusout`). Natively you delegate with `focusin`/`focusout`. [React DOM] · [03 §3.2](03-browser-and-web-platform.md#32-events-capture--target--bubble-stoppropagation-preventdefault-delegation)

</details>

**Q7. Name the steps of the rendering pipeline, and what is layout thrashing?**
<details><summary>Answer</summary>

Parse, style, layout, paint, composite. Thrashing is interleaving layout reads (`offsetHeight`) with style writes, forcing a synchronous reflow each time. Batch reads before writes; animate `transform` and `opacity`. [Browser] · [03 §3.4](03-browser-and-web-platform.md#34-the-rendering-pipeline-parse--style--layout--paint--composite-reflow-and-layout-thrashing)

</details>

**Q8. `Cache-Control: no-cache` versus `no-store`?**
<details><summary>Answer</summary>

`no-cache` means store it but revalidate before reuse. `no-store` means do not store it at all. [Browser] · [03 §3.9](03-browser-and-web-platform.md#39-http-caching-cache-control-etag-validation-immutable-assets)

</details>

**Q9. Why should `index.html` be revalidated while `app.3f9a1c.js` can be cached for a year?**
<details><summary>Answer</summary>

The URL is the invalidation key. The hashed file's content never changes under that name, but `index.html` keeps its URL and must point at the new hashes. [Browser] · [03 §3.9](03-browser-and-web-platform.md#39-http-caching-cache-control-etag-validation-immutable-assets)

</details>

**Q10. Is CORS enforced by the server or the browser? Why does `curl` work when the browser fails?**
<details><summary>Answer</summary>

The browser enforces it, based on the server's response headers. `curl` has no same-origin policy, so it proves nothing about browser access. [Browser] · [03 §3.7](03-browser-and-web-platform.md#37-cors-from-the-browsers-side-simple-vs-preflighted-credentials)

</details>

**Q11. Which requests trigger a preflight?**
<details><summary>Answer</summary>

Non-simple ones: methods other than GET/HEAD/POST, custom headers such as `Authorization`, and `Content-Type: application/json`. A dev proxy hides this locally. [Browser] · [03 §3.7](03-browser-and-web-platform.md#37-cors-from-the-browsers-side-simple-vs-preflighted-credentials)

</details>

**Q12. Does an `HttpOnly` cookie protect you from XSS?**
<details><summary>Answer</summary>

Only from cookie theft. The injected script can still make authenticated requests from the victim's browser. [Browser] · [03 §3.8](03-browser-and-web-platform.md#38-web-security-xss-csrf-csp-clickjacking-samesite-trusted-types)

</details>

**Q13. What happens to `SameSite=None` without `Secure`?**
<details><summary>Answer</summary>

The browser drops the cookie. Cookies with no `SameSite` attribute are treated as `Lax` in Chrome/Edge, which silently breaks cross-site embeds. [Browser] · [03 §3.8](03-browser-and-web-platform.md#38-web-security-xss-csrf-csp-clickjacking-samesite-trusted-types)

</details>

**Q14. Which web storage would you use for a session, and what do `localStorage` values look like?**
<details><summary>Answer</summary>

Server-visible session state belongs in `HttpOnly; Secure; SameSite` cookies. `localStorage` stores strings only, is readable by any script on the origin, and can throw (quota, disabled storage). [Browser] · [03 §3.5](03-browser-and-web-platform.md#35-storage-cookies-localstorage-sessionstorage-indexeddb-cache-api)

</details>

**Q15. What is the danger of a service worker?**
<details><summary>Answer</summary>

It can keep serving a stale app until it is updated and old tabs close. Never long-cache `sw.js` and ship a kill switch. [Browser] · [03 §3.10](03-browser-and-web-platform.md#310-service-workers-and-pwa-basics)

</details>

---

## 28.4 HTML, CSS and accessibility

**Q1. What is wrong with `aria-hidden="true"` on a focusable element?**
<details><summary>Answer</summary>

It vanishes from the accessibility tree but Tab still reaches it, so a keyboard user focuses "nothing". Use `inert` or `hidden`. [Browser] · [04 §4.2](04-html-css-accessibility.md#42-accessibility-the-accessibility-tree-aria-rules-names-roles-states)

</details>

**Q2. Is `<div role="button" onClick>` a button?**
<details><summary>Answer</summary>

No: no focus, no Enter/Space handling, no `disabled` semantics unless you build them. Use `<button>`. [Browser] · [04 §4.1](04-html-css-accessibility.md#41-semantic-html-and-landmarks)

</details>

**Q3. Why is `placeholder` not a label?**
<details><summary>Answer</summary>

It disappears on input, has weak contrast and is not reliably announced as an accessible name. Use `<label>`. [Browser] · [04 §4.2](04-html-css-accessibility.md#42-accessibility-the-accessibility-tree-aria-rules-names-roles-states)

</details>

**Q4. Which `tabIndex` values should you use?**
<details><summary>Answer</summary>

Only `0` (in tab order) and `-1` (focusable by script). Positive values reorder the entire page. [Browser] · [04 §4.3](04-html-css-accessibility.md#43-focus-management-and-keyboard-navigation-roving-tabindex)

</details>

**Q5. What does `box-sizing: border-box` change?**
<details><summary>Answer</summary>

`width`/`height` include padding and border instead of only the content box, so a `width: 100%` element with padding does not overflow. [Browser] · [04 §4.4](04-html-css-accessibility.md#44-box-model-and-box-sizing)

</details>

**Q6. Why won't a flex item shrink below its content, and what is the fix?**
<details><summary>Answer</summary>

Items have `min-width: auto`. Add `min-width: 0` (or `minmax(0, 1fr)` in grid). [Browser] · [04 §4.6](04-html-css-accessibility.md#46-flexbox)

</details>

**Q7. Name a few things that create a stacking context, and why you care.**
<details><summary>Answer</summary>

`transform`, `filter`, `will-change`, `opacity` below 1, and positioned elements with `z-index`. A "harmless" animation class on a wrapper can bury a dropdown; a transformed ancestor also re-parents `position: fixed`. Portal the overlay out. [Browser] · [04 §4.8](04-html-css-accessibility.md#48-positioning-and-stacking-contexts)

</details>

**Q8. Why does `position: sticky` sometimes do nothing?**
<details><summary>Answer</summary>

An ancestor has `overflow: hidden`/`auto`, or the parent is not taller than the sticky element. [Browser] · [04 §4.8](04-html-css-accessibility.md#48-positioning-and-stacking-contexts)

</details>

**Q9. Why does Tailwind ignore `` `text-${color}-500` ``?**
<details><summary>Answer</summary>

The scanner reads source text, so dynamically built class names are never generated. Write complete class names. [Library: Tailwind] · [04 §4.11](04-html-css-accessibility.md#411-styling-in-react-inline-css-modules-tailwind-css-in-js-and-the-server-components-trade-off)

</details>

**Q10. Can a runtime CSS-in-JS library be used in a Server Component?**
<details><summary>Answer</summary>

Not directly: it needs `'use client'`. Prefer CSS Modules or Tailwind for server-rendered code. [React] · [04 §4.11](04-html-css-accessibility.md#411-styling-in-react-inline-css-modules-tailwind-css-in-js-and-the-server-components-trade-off)

</details>

**Q11. Headless (Radix) versus styled (MUI) component libraries?**
<details><summary>Answer</summary>

Headless libraries give behavior and accessibility with no look, so you style them; styled libraries ship a design system you customize. shadcn/ui copies headless-based components into your repo. [Library: Radix] · [04 §4.12](04-html-css-accessibility.md#412-component-libraries-mui-radix-shadcnui-headless-vs-styled)

</details>

---

## 28.5 Tooling and project setup

**Q1. What does `^0.2.3` match?**
<details><summary>Answer</summary>

`>=0.2.3 <0.3.0`. Below 1.0.0 the minor is the breaking digit, and `^0.0.3` is exactly `0.0.3`. [Tooling: npm] · [05 §5.2](05-tooling-and-setup.md#52-semver-and-ranges-peer-dependencies)

</details>

**Q2. `npm install` versus `npm ci` in CI?**
<details><summary>Answer</summary>

`npm ci` installs exactly the lockfile and fails on drift; `npm install` may rewrite the lockfile. Commit the lockfile. [Tooling: npm] · [05 §5.1](05-tooling-and-setup.md#51-npm-pnpm-yarn-lockfiles-and-why-to-commit-them)

</details>

**Q3. What causes "Invalid hook call" even when both copies are React 19.x?**
<details><summary>Answer</summary>

Two copies of React: identity matters, not version. Usual causes are `npm link` and a library that bundles React. Peer dependencies exist to prevent it. [React] · [05 §5.2](05-tooling-and-setup.md#52-semver-and-ranges-peer-dependencies)

</details>

**Q4. Does moving a package to `devDependencies` shrink the browser bundle?**
<details><summary>Answer</summary>

No. The bundler inlines whatever you import; the field only affects installs. [Tooling: bundlers] · [05 §5.3](05-tooling-and-setup.md#53-bundling-concepts-module-graph-tree-shaking-code-splitting-hmr)

</details>

**Q5. What does tree shaking need?**
<details><summary>Answer</summary>

Static ESM `import`/`export` plus honest `sideEffects` metadata. A barrel file with top-level side effects can defeat it. [Tooling: bundlers] · [05 §5.3](05-tooling-and-setup.md#53-bundling-concepts-module-graph-tree-shaking-code-splitting-hmr)

</details>

**Q6. Why is Vite's dev experience fast compared with a classic webpack setup?**
<details><summary>Answer</summary>

Vite serves source as native ES modules in dev and transforms per request instead of bundling everything first. Production still bundles. [Tooling: Vite] · [05 §5.4](05-tooling-and-setup.md#54-vite-vs-webpack)

</details>

**Q7. Does Babel/SWC/esbuild type-check?**
<details><summary>Answer</summary>

No. They erase types. A passing build is not type-correct, so run `tsc --noEmit` in CI. [Tooling: SWC/esbuild] · [05 §5.5](05-tooling-and-setup.md#55-transpilers-babel-swc-esbuild-what-jsx-transform-means)

</details>

**Q8. Is `import.meta.env.VITE_FLAG` falsy when set to `false`? Is `VITE_` secret?**
<details><summary>Answer</summary>

`"false"` is a non-empty string, so it is truthy; parse env values. `VITE_` variables are public and inlined at build time. [Tooling: Vite] · [05 §5.7](05-tooling-and-setup.md#57-environment-variables)

</details>

**Q9. What is the status of Create React App?**
<details><summary>Answer</summary>

Deprecated on 2025-02-14. It still installs and legacy codebases run on it; use a framework or Vite for new work. [Tooling: CRA] · [05 §5.8](05-tooling-and-setup.md#58-creating-a-project-in-2026)

</details>

**Q10. Should production source maps be public?**
<details><summary>Answer</summary>

By default they are. Use hidden source maps and upload them to the error tracker. [Tooling: bundlers] · [05 §5.10](05-tooling-and-setup.md#510-source-maps-and-debugging)

</details>

---

## 28.6 JSX and the rendering model

**Q1. What does `{count && <Badge />}` render when `count` is `0`?**
<details><summary>Answer</summary>

The number `0`. Use `count > 0 && ...` or a ternary. [React] · [06 §6.5](06-jsx-and-rendering-model.md#65-conditional-rendering)

</details>

**Q2. What does JSX compile to in React 17+?**
<details><summary>Answer</summary>

A call to `jsx(type, props, key)` imported from `react/jsx-runtime`, which returns an element object. React 19 requires the new transform; the old `React.createElement` transform is why old files imported `React`. [React] · [06 §6.2](06-jsx-and-rendering-model.md#62-what-jsx-compiles-to)

</details>

**Q3. Element, component, instance: what is each?**
<details><summary>Answer</summary>

An element is an immutable `{ type, props, key, ref }` description; a component is the function that returns elements; an instance is React's internal state for a mounted component. [React] · [06 §6.3](06-jsx-and-rendering-model.md#63-elements-vs-components-vs-instances)

</details>

**Q4. Why does `<myButton />` not render your component?**
<details><summary>Answer</summary>

Lowercase tags are DOM elements. Components must be capitalized. [React] · [06 §6.4](06-jsx-and-rendering-model.md#64-expressions-attributes-classname-style)

</details>

**Q5. What is wrong with `onClick={save()}`?**
<details><summary>Answer</summary>

It calls `save` during render and passes the return value as the handler. Write `onClick={save}` or `onClick={() => save(id)}`. [React] · [06 §6.4](06-jsx-and-rendering-model.md#64-expressions-attributes-classname-style)

</details>

**Q6. Does `style="color: red"` work in React?**
<details><summary>Answer</summary>

No, it throws. `style` takes an object (`{ color: 'red' }`), and numbers become `px` except for unitless properties. [React DOM] · [06 §6.4](06-jsx-and-rendering-model.md#64-expressions-attributes-classname-style)

</details>

**Q7. Does `key={index}` fix the missing-key warning?**
<details><summary>Answer</summary>

It silences it without fixing anything: rows are matched by position, the same as with no key. Use a stable id. Random keys are worse: they remount every row each render. [React] · [06 §6.6](06-jsx-and-rendering-model.md#66-lists-and-keys)

</details>

**Q8. Can you read `props.key`?**
<details><summary>Answer</summary>

No. `key` is not a readable prop; pass the id under another name. [React] · [06 §6.6](06-jsx-and-rendering-model.md#66-lists-and-keys)

</details>

**Q9. Why can a Fragment you write as `<>...</>` not take a `key`?**
<details><summary>Answer</summary>

The short syntax accepts no attributes. When mapping, write `<Fragment key={id}>`. [React] · [06 §6.7](06-jsx-and-rendering-model.md#67-fragments)

</details>

**Q10. What makes a component pure, and why does React care?**
<details><summary>Answer</summary>

Same props, state and context give the same output with no side effects during render. React may render more than once, in any order, and discard results (Strict Mode, concurrency). [React] · [06 §6.8](06-jsx-and-rendering-model.md#68-purity-and-idempotence)

</details>

**Q11. What triggers a render?**
<details><summary>Answer</summary>

The initial `root.render`, a state update (from a setter or reducer dispatch), a parent re-rendering, or a context value change. Props changing are a consequence of the parent rendering. [React] · [06 §6.9](06-jsx-and-rendering-model.md#69-what-triggers-a-render)

</details>

**Q12. Render phase versus commit phase: where do effects and DOM writes happen?**
<details><summary>Answer</summary>

Render computes the next tree and must be pure. The commit applies DOM changes, then layout effects, and passive effects run after paint. [React] · [06 §6.10](06-jsx-and-rendering-model.md#610-render-phase-vs-commit-phase)

</details>

**Q13. A component logs twice in dev. When is it Strict Mode and when is it a bug?**
<details><summary>Answer</summary>

Strict Mode double-invokes render (and remounts effects) in development only. "It renders twice in production" is never Strict Mode: look for a changing `key`, a remounting parent, or a component defined inside another component. [React] · [06 §6.11](06-jsx-and-rendering-model.md#611-strict-mode-double-invocation-and-why)

</details>

**Q14. What happened to `ReactDOM.render` in React 19?**
<details><summary>Answer</summary>

Removed, along with `hydrate` and `unmountComponentAtNode`. Use `createRoot` and `hydrateRoot` from `react-dom/client`. [React DOM] · [06 §6.12](06-jsx-and-rendering-model.md#612-createroot-hydrateroot-root-options)

</details>

---

## 28.7 Components, props and composition

**Q1. What happens to `defaultProps` on a function component in React 19?**
<details><summary>Answer</summary>

Ignored with JSX, silently. Use default parameters. Classes keep `defaultProps`. [React] · [07 §7.1](07-components-props-composition.md#71-function-components-and-props)

</details>

**Q2. Do `propTypes` still warn in React 19?**
<details><summary>Answer</summary>

No, they are silently ignored. Use TypeScript for props and a schema for external data. [React] · [07 §7.1](07-components-props-composition.md#71-function-components-and-props)

</details>

**Q3. What is `children`?**
<details><summary>Answer</summary>

An ordinary prop (typed `ReactNode`). When one hole is not enough, add named `ReactNode` slot props. [React] · [07 §7.2](07-components-props-composition.md#72-children-and-slot-props)

</details>

**Q4. Composition or inheritance, and why?**
<details><summary>Answer</summary>

Composition: props, children and slots. React has no case that needs component inheritance. [React] · [07 §7.3](07-components-props-composition.md#73-composition-vs-inheritance)

</details>

**Q5. Props versus state in one sentence each?**
<details><summary>Answer</summary>

Props are read-only inputs owned by the parent; state is memory owned by the component. Data flows down as props and changes flow up through callback props. [React] · [07 §7.4](07-components-props-composition.md#74-props-vs-state)

</details>

**Q6. Why are compound components usually built on context rather than `cloneElement`?**
<details><summary>Answer</summary>

`cloneElement` breaks as soon as a part is wrapped in another component. Context reaches any depth. [React] · [07 §7.6](07-components-props-composition.md#76-compound-components)

</details>

**Q7. Why do hooks mostly replace render props and HOCs?**
<details><summary>Answer</summary>

A custom hook shares stateful logic without extra wrapper components or naming collisions. A HOC applied inside render creates a new type every render and remounts the subtree. [React] · [07 §7.7](07-components-props-composition.md#77-render-props-and-hocs)

</details>

**Q8. When does a component API count as controlled?**
<details><summary>Answer</summary>

When the parent owns the value and passes `value` plus `onChange`. With `defaultValue` the component owns it. `value` without `onChange` freezes an input. [React] · [07 §7.8](07-components-props-composition.md#78-controlled-vs-uncontrolled-component-apis)

</details>

**Q9. Which wins in `<input {...rest} type="text">` versus `<input type="text" {...rest}>`?**
<details><summary>Answer</summary>

The later one. In the first the fixed `type="text"` wins; in the second `rest` can override it. JSX props compile to an object, and in an object literal a later property overwrites an earlier one ([MDN spread in object literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#overriding_properties)). [React] · [07 §7.9](07-components-props-composition.md#79-polymorphic-components-and-prop-spreading)

</details>

**Q10. `this.setState` versus a `useState` setter: merge or replace?**
<details><summary>Answer</summary>

Class `setState` merges; the hook setter replaces. `setUser({ name })` drops the other fields. [React] · [07 §7.10](07-components-props-composition.md#710-class-components)

</details>

---

## 28.8 State

**Q1. Why does `console.log(count)` right after `setCount(count + 1)` show the old value?**
<details><summary>Answer</summary>

Each render is a snapshot: `count` is a constant for that render. The setter schedules a new render. [React] · [08 §8.2](08-state.md#82-usestate-and-state-as-a-snapshot)

</details>

**Q2. Why do three `setCount(count + 1)` calls add one?**
<details><summary>Answer</summary>

All three read the same snapshot value. Use `setCount(c => c + 1)` three times to add three. [React] · [08 §8.4](08-state.md#84-functional-updates)

</details>

**Q3. `setCount(c => c + 1); setCount(count + 5)`: what is the result?**
<details><summary>Answer</summary>

`count + 5`. The later value update overrides the earlier updater. [React] · [08 §8.4](08-state.md#84-functional-updates)

</details>

**Q4. Is batching new in React 18?**
<details><summary>Answer</summary>

Automatic batching everywhere (timeouts, promises, native handlers) arrived in 18 with `createRoot`. An app still on `ReactDOM.render` behaves like 17. Handlers were already batched before. [React] · [08 §8.3](08-state.md#83-batching)

</details>

**Q5. Why does `arr.push(x); setArr(arr)` not re-render?**
<details><summary>Answer</summary>

Same reference, so React's `Object.is` check skips the update, and you mutated an earlier snapshot. Copy: `setArr([...arr, x])`. [React] · [08 §8.5](08-state.md#85-immutable-updates-of-nested-objects-and-arrays)

</details>

**Q6. `{ ...user }` then `copy.address.city = 'X'`: what happened?**
<details><summary>Answer</summary>

Spread is shallow, so you mutated the original's `address`. Copy each level you change. [JS] · [08 §8.5](08-state.md#85-immutable-updates-of-nested-objects-and-arrays)

</details>

**Q7. `useState(expensive())` versus `useState(expensive)`?**
<details><summary>Answer</summary>

The first runs `expensive` on every render (the result is ignored after the first). The second passes a lazy initializer that runs once. To store a function, use `useState(() => fn)`. [React] · [08 §8.6](08-state.md#86-lazy-initialization)

</details>

**Q8. Why is storing `filteredItems` in state a smell?**
<details><summary>Answer</summary>

Derived data stored next to its source drifts out of sync. Compute it during render (and memoize only if measured). [React] · [08 §8.7](08-state.md#87-derived-state-compute-do-not-store)

</details>

**Q9. How do you reset a component's state when a prop changes?**
<details><summary>Answer</summary>

Give it a `key` tied to the identity (e.g. the user id). A new key remounts it with fresh state. [React] · [08 §8.9](08-state.md#89-resetting-state-with-key)

</details>

**Q10. When do you pick `useReducer` over `useState`?**
<details><summary>Answer</summary>

When several fields change together, transitions follow rules, or you want a testable pure `(state, action)` function. Hoist the reducer outside the component. [React] · [08 §8.10](08-state.md#810-usereducer)

</details>

**Q11. Why does a `console.log` inside a state initializer or updater appear twice in dev?**
<details><summary>Answer</summary>

Strict Mode double-invokes initializers, updaters and reducers as a purity check, in development only. [React] · [08 §8.2](08-state.md#82-usestate-and-state-as-a-snapshot)

</details>

**Q12. Does `setCount(1, callback)` run the callback?**
<details><summary>Answer</summary>

No. Hook setters have no callback and React warns. Use the event handler or an effect. [React] · [08 §8.2](08-state.md#82-usestate-and-state-as-a-snapshot)

</details>

**Q13. Where should state live?**
<details><summary>Answer</summary>

As close as possible to where it is used (colocation); lift it to the nearest common parent only when siblings need it. [React] · [08 §8.8](08-state.md#88-colocation-and-lifting-state-up)

</details>

---

## 28.9 Effects

**Q1. What is an effect for?**
<details><summary>Answer</summary>

Synchronizing a component with something outside React (network, subscriptions, DOM APIs, timers) while it is on screen. If nothing external is involved, you probably do not need one. [React] · [09 §9.1](09-effects.md#91-effects-as-synchronization-with-external-systems)

</details>

**Q2. How does React decide whether to re-run an effect?**
<details><summary>Answer</summary>

It compares each dependency with `Object.is`. Object, array and function values created in render are new every time and re-run the effect. [React] · [09 §9.2](09-effects.md#92-dependencies-and-the-objectis-comparison)

</details>

**Q3. When does cleanup run?**
<details><summary>Answer</summary>

Before the next run of the effect (when dependencies change) and on unmount. Setup and cleanup are a symmetric pair. [React] · [09 §9.3](09-effects.md#93-cleanup-and-the-effect-lifecycle)

</details>

**Q4. In what order do child and parent effects run on mount and on unmount?**
<details><summary>Answer</summary>

Child setups run before parent setups, but on unmount the cleanups run parent-first. "Effects are always bottom-up" is only half true. [React] · [09 §9.3](09-effects.md#93-cleanup-and-the-effect-lifecycle)

</details>

**Q5. How do you prevent a race when fetching in an effect?**
<details><summary>Answer</summary>

Abort in the cleanup with `AbortController` (or ignore stale results with a flag). An aborted `fetch` rejects, so check `signal.aborted` before showing an error. Aborting does not undo work the server already did. [React] [Browser] · [09 §9.4](09-effects.md#94-race-conditions-and-abortcontroller)

</details>

**Q6. Why does `useEffect(() => { setInterval(() => setN(n + 1), 1000) }, [])` freeze?**
<details><summary>Answer</summary>

The callback closes over `n` from the first render, a stale closure. Use `setN(n => n + 1)`. An empty array is not an "only once" optimization when you read a value inside. [React] · [09 §9.5](09-effects.md#95-stale-closures-in-effects-and-intervals)

</details>

**Q7. Can you pass an `async` function to `useEffect`?**
<details><summary>Answer</summary>

Not directly: it returns a Promise, which is not a valid cleanup, and React logs a dev warning. Define an async function inside and call it. [React] · [09 §9.1](09-effects.md#91-effects-as-synchronization-with-external-systems)

</details>

**Q8. Name two things you should not do in an effect.**
<details><summary>Answer</summary>

Derive state from props/state (compute during render) and respond to a user event (do it in the handler). `setState` in an effect with no deps is an infinite loop. [React] · [09 §9.6](09-effects.md#96-you-might-not-need-an-effect)

</details>

**Q9. `useEffect` versus `useLayoutEffect`?**
<details><summary>Answer</summary>

`useLayoutEffect` runs after DOM mutation but before paint, so you can measure and adjust without a flicker. It blocks paint, so heavy work hurts INP. [React] · [09 §9.7](09-effects.md#97-uselayouteffect)

</details>

**Q10. What is `useInsertionEffect` for?**
<details><summary>Answer</summary>

Injecting `<style>` rules for CSS-in-JS libraries before layout is read. It is meant for library authors, not app code. [React] · [09 §9.8](09-effects.md#98-useinsertioneffect)

</details>

**Q11. What problem does `useEffectEvent` solve?**
<details><summary>Answer</summary>

It lets an effect read the latest props/state without making them dependencies (non-reactive logic). Do not put an Effect Event in a dependency array and do not call it from handlers. [React] · [09 §9.9](09-effects.md#99-useeffectevent)

</details>

**Q12. What does Strict Mode's extra mount/unmount/mount tell you?**
<details><summary>Answer</summary>

Whether your cleanup properly reverses your setup: React runs "one extra setup+cleanup cycle in development for every Effect", and "all of these checks are development-only" ([StrictMode](https://react.dev/reference/react/StrictMode)). [React] · [09 §9.10](09-effects.md#910-strict-mode-remounting-and-what-it-reveals)

</details>

**Q13. What does React 19.1+ warn about when an effect returns `null`?**
<details><summary>Answer</summary>

"You returned null. If your effect does not require clean up, return undefined." An effect must return `undefined` or a function. [React] · [09 §9.1](09-effects.md#91-effects-as-synchronization-with-external-systems)

</details>

---

## 28.10 Refs and the DOM

**Q1. `useRef` versus `useState`?**
<details><summary>Answer</summary>

A ref is a mutable `{ current }` box that React does not watch: writing it does not re-render. Never read or write it during render. [React] · [10 §10.1](10-refs-and-dom.md#101-useref-as-a-mutable-box-that-does-not-trigger-renders)

</details>

**Q2. What is `ref.current` during the first render?**
<details><summary>Answer</summary>

`null`. DOM refs are attached during the commit, so read them in effects or handlers. [React] · [10 §10.2](10-refs-and-dom.md#102-dom-refs-and-when-to-use-them)

</details>

**Q3. What is new about callback refs in React 19?**
<details><summary>Answer</summary>

They can return a cleanup function, which replaces the `null` call. React 18 ignores returned cleanups. [React] · [10 §10.3](10-refs-and-dom.md#103-callback-refs-and-ref-cleanup-functions)

</details>

**Q4. Why is `ref={(el) => (this.el = el)}` an error with @types/react 19?**
<details><summary>Answer</summary>

Implicit returns from ref callbacks are rejected because a returned value is now treated as a cleanup. Use a block body. [TS] · [10 §10.3](10-refs-and-dom.md#103-callback-refs-and-ref-cleanup-functions)

</details>

**Q5. Do you still need `forwardRef`?**
<details><summary>Answer</summary>

Not in React 19: `ref` is a regular prop for function components. `forwardRef` remains for React 18 and earlier. [React] · [10 §10.4](10-refs-and-dom.md#104-ref-as-a-prop-vs-forwardref)

</details>

**Q6. Why is `createRef()` wrong in a function component?**
<details><summary>Answer</summary>

It makes a new ref every render. Use `useRef`. [React] · [10 §10.1](10-refs-and-dom.md#101-useref-as-a-mutable-box-that-does-not-trigger-renders)

</details>

**Q7. What is `useImperativeHandle` for?**
<details><summary>Answer</summary>

Exposing a narrow imperative API (`focus()`, `reset()`) through a ref instead of the whole DOM node. Use it sparingly. [React] · [10 §10.5](10-refs-and-dom.md#105-useimperativehandle)

</details>

**Q8. Do events from a portaled modal bubble to the React parent?**
<details><summary>Answer</summary>

Yes. Events follow the React tree, not the DOM tree, so a parent's `onClick` can fire for a click in a portal. CSS inheritance follows the DOM, so styles can be lost. [React DOM] · [10 §10.6](10-refs-and-dom.md#106-portals)

</details>

**Q9. What breaks when a third-party library mutates DOM that React manages?**
<details><summary>Answer</summary>

React's bookkeeping gets out of sync: errors like "Failed to execute 'removeChild' on 'Node'". Give the library an empty container that React never renders into. [React] · [10 §10.7](10-refs-and-dom.md#107-integrating-non-react-libraries)

</details>

**Q10. How do you attach a ref to a Fragment?**
<details><summary>Answer</summary>

Use `<Fragment ref={...}>` (React 19.3). The short `<>...</>` syntax cannot take one. [React] · [10 §10.8](10-refs-and-dom.md#108-fragment-refs)

</details>

---

## 28.11 Context and prop drilling

**Q1. Is prop drilling always bad?**
<details><summary>Answer</summary>

No. A few levels of explicit props are clear and cheap. Reach for composition (children, slots) first, then context. [React] · [11 §11.1](11-context.md#111-prop-drilling-and-when-it-is-fine)

</details>

**Q2. How do you provide a context value in React 19 versus 18?**
<details><summary>Answer</summary>

19: `<Ctx value={...}>`. 18: `<Ctx.Provider value={...}>`. In 19 they are the same object. [React] · [11 §11.2](11-context.md#112-createcontext-context-value-vs-provider)

</details>

**Q3. When is a context's default value used?**
<details><summary>Answer</summary>

Only when there is no provider above. A provider with `value={undefined}` still provides `undefined`. [React] · [11 §11.2](11-context.md#112-createcontext-context-value-vs-provider)

</details>

**Q4. A `memo` component reads a context that changed. Does it re-render?**
<details><summary>Answer</summary>

Yes. `memo` does not block context updates. [React] · [11 §11.3](11-context.md#113-how-propagation-and-re-rendering-work)

</details>

**Q5. Why does `value={{ a, b }}` cause trouble?**
<details><summary>Answer</summary>

A new object on every provider render re-renders every consumer. Memoize it or keep it stable. [React] · [11 §11.4](11-context.md#114-stable-values)

</details>

**Q6. How do you limit context re-renders?**
<details><summary>Answer</summary>

Split contexts (state versus dispatch, or by update frequency) and keep values stable. Splitting by field does not create selectors: readers of a whole object still re-render. [React] · [11 §11.5](11-context.md#115-splitting-contexts)

</details>

**Q7. Why does `use(Ctx)` differ from `useContext(Ctx)`?**
<details><summary>Answer</summary>

`use` can be called conditionally and in loops (but not in `try`/`catch`), while `useContext` must be at the top level, so you can skip reading context in early returns ([use](https://react.dev/reference/react/use)). [React] · [11 §11.7](11-context.md#117-reading-context-with-use)

</details>

**Q8. When is context the wrong tool?**
<details><summary>Answer</summary>

For frequently changing state that many components read selectively. Context has no selectors; use a store (Zustand, Redux) or server-state cache. [React] · [11 §11.8](11-context.md#118-when-context-is-the-wrong-tool)

</details>

**Q9. Why might consumers read the default value even though a provider exists?**
<details><summary>Answer</summary>

Duplicate module copies: two copies of the file that calls `createContext` (or of React) are two different context objects. Common with `npm link`, monorepos and micro-frontends. [React] · [11 §11.2](11-context.md#112-createcontext-context-value-vs-provider)

</details>

---

## 28.12 Rules of hooks and custom hooks

**Q1. State the two rules of hooks.**
<details><summary>Answer</summary>

Call hooks only at the top level (not in conditions, loops or after an early return) and only from components or custom hooks. [React] · [12 §12.1](12-hooks-and-custom-hooks.md#121-the-rules-of-hooks)

</details>

**Q2. Why does call order matter?**
<details><summary>Answer</summary>

React stores hooks as a linked list on the fiber and matches them by position, not by name. [React] · [12 §12.2](12-hooks-and-custom-hooks.md#122-how-react-stores-hooks-so-call-order-matters)

</details>

**Q3. `cond ? useState(a) : useState(b)`: error or silent bug?**
<details><summary>Answer</summary>

Silent: the same count and type means the second branch gets the first branch's state. Only the lint rule catches it. [React] · [12 §12.2](12-hooks-and-custom-hooks.md#122-how-react-stores-hooks-so-call-order-matters)

</details>

**Q4. What does the React Compiler assume about your code?**
<details><summary>Answer</summary>

That you follow the Rules of React (purity, no mutation of props/state, hook rules). An `eslint-disable` for a hooks rule also makes the Compiler skip that component. [React] · [12 §12.3](12-hooks-and-custom-hooks.md#123-the-lint-rule-and-react-compiler-rules)

</details>

**Q5. What makes a good custom hook?**
<details><summary>Answer</summary>

It shares stateful logic, has one clear job, returns a stable and minimal API, and lets callers own configuration. Its name starts with `use`. [React] · [12 §12.4](12-hooks-and-custom-hooks.md#124-designing-custom-hooks)

</details>

**Q6. Why does `useDebounce(fn, 300)` break when `fn` is a function?**
<details><summary>Answer</summary>

Passing a function to `useState`/its setter treats it as a lazy initializer/updater. Wrap functions in an object. And an object literal argument restarts the effect every render. [React] · [12 §12.5](12-hooks-and-custom-hooks.md#125-usedebounce)

</details>

**Q7. Does the `storage` event fire in the tab that wrote the value?**
<details><summary>Answer</summary>

No, only in other tabs. `useLocalStorage` needs its own notification for same-tab sync, and must guard against `setItem` throwing. [Browser] · [12 §12.7](12-hooks-and-custom-hooks.md#127-uselocalstorage)

</details>

**Q8. What is `useId` for, and is it a list key?**
<details><summary>Answer</summary>

Stable ids for accessibility attributes (label/`aria-describedby`), consistent across server and client. It is not a key, and its format changed in 19.1 and 19.2, so do not hard-code it in CSS or snapshots. [React] · [12 §12.11](12-hooks-and-custom-hooks.md#1211-useid)

</details>

**Q9. What is `useSyncExternalStore` for, and what is a classic bug with it?**
<details><summary>Answer</summary>

Subscribing to external stores safely under concurrent rendering. If `getSnapshot` returns a new object each call it loops, and an inline `subscribe` resubscribes every render. [React] · [12 §12.12](12-hooks-and-custom-hooks.md#1212-usesyncexternalstore)

</details>

**Q10. Why is copying `result.current` from `renderHook` risky?**
<details><summary>Answer</summary>

`result.current` is a getter; a copy taken before `act`/`waitFor` is a stale snapshot. [Library: RTL] · [12 §12.13](12-hooks-and-custom-hooks.md#1213-testing-custom-hooks)

</details>

---

## 28.13 Reconciliation, virtual DOM and Fiber

**Q1. Is the virtual DOM faster than the real DOM?**
<details><summary>Answer</summary>

No. It is the price of declarative code, kept low by an O(n) heuristic. [React] · [13 §13.1](13-reconciliation-and-fiber.md#131-why-a-virtual-dom)

</details>

**Q2. What are React's two diffing heuristics?**
<details><summary>Answer</summary>

Different element types produce different trees (remount), and keys identify stable siblings across renders. [React] · [13 §13.2](13-reconciliation-and-fiber.md#132-diffing-heuristics-type-then-key)

</details>

**Q3. How is component identity defined?**
<details><summary>Answer</summary>

Position in the tree plus type plus key. Same identity keeps state; a change resets it. [React] · [13 §13.3](13-reconciliation-and-fiber.md#133-component-identity-and-state-preservation)

</details>

**Q4. Does conditionally wrapping a component in a `<div>` preserve its state?**
<details><summary>Answer</summary>

No. The tree shape changes, so everything inside remounts and loses state, focus and scroll. Toggle a class instead. [React] · [13 §13.3](13-reconciliation-and-fiber.md#133-component-identity-and-state-preservation)

</details>

**Q5. `{a && <X/>}{!a && <X/>}` versus `{a ? <X/> : <X/>}`?**
<details><summary>Answer</summary>

The first uses two slots, so state resets when `a` flips. The ternary uses one slot and preserves state. [React] · [13 §13.3](13-reconciliation-and-fiber.md#133-component-identity-and-state-preservation)

</details>

**Q6. Why does defining a component inside another component make an input lose focus on each keystroke?**
<details><summary>Answer</summary>

The inner function is a new type every parent render, so React unmounts and remounts it. Hoist it. HOCs and `styled()` called in render are the same bug. [React] · [13 §13.4](13-reconciliation-and-fiber.md#134-keys-revisited-and-nested-component-definitions)

</details>

**Q7. Moving a keyed component to a different parent: preserved or remounted?**
<details><summary>Answer</summary>

Remounted. Keys are scoped to siblings. [React] · [13 §13.4](13-reconciliation-and-fiber.md#134-keys-revisited-and-nested-component-definitions)

</details>

**Q8. What are Fiber's main ideas?**
<details><summary>Answer</summary>

Units of work that can be paused, a double-buffered current/work-in-progress tree, and lanes that prioritize updates. [React] · [13 §13.5](13-reconciliation-and-fiber.md#135-fiber-units-of-work-double-buffering-lanes-and-priorities)

</details>

**Q9. Does "concurrent" mean every render yields to the browser?**
<details><summary>Answer</summary>

No. Sync, input-continuous and default lanes render without yielding in 19.3; only transitions, retries, idle and offscreen work time-slice. [React] · [13 §13.5](13-reconciliation-and-fiber.md#135-fiber-units-of-work-double-buffering-lanes-and-priorities)

</details>

**Q10. Is `componentDidMount` the same as `useEffect(fn, [])`?**
<details><summary>Answer</summary>

No. The class method runs in the layout phase, before paint; the effect runs after paint and re-runs in Strict Mode dev. [React] · [13 §13.6](13-reconciliation-and-fiber.md#136-class-lifecycle-methods-and-their-hook-equivalents)

</details>

**Q11. `PureComponent` plus `items.push(x)`: what happens?**
<details><summary>Answer</summary>

Stale UI: the reference is unchanged, so the shallow compare says nothing changed. [React] · [13 §13.7](13-reconciliation-and-fiber.md#137-getderivedstatefromprops-shouldcomponentupdate-purecomponent)

</details>

**Q12. When does `getDerivedStateFromProps` run (since 16.4)?**
<details><summary>Answer</summary>

On every render, including renders caused by the component's own `setState`. Compare with a stored previous prop or you will clobber local updates. [React] · [13 §13.7](13-reconciliation-and-fiber.md#137-getderivedstatefromprops-shouldcomponentupdate-purecomponent)

</details>

**Q13. Name legacy APIs removed in React 19.**
<details><summary>Answer</summary>

`ReactDOM.render`/`hydrate`/`unmountComponentAtNode`, `findDOMNode`, string refs, legacy context, `defaultProps` on function components and `propTypes` checks. [React] · [13 §13.8](13-reconciliation-and-fiber.md#138-legacy-apis-removed-in-19)

</details>

---

## 28.14 Forms and Actions

**Q1. Controlled versus uncontrolled input: default choice?**
<details><summary>Answer</summary>

Default to uncontrolled for forms you submit as a whole (read `FormData`); control fields you must validate, mask or react to per keystroke. [React] · [14 §14.1](14-forms-and-actions.md#141-controlled-vs-uncontrolled-inputs)

</details>

**Q2. Where should validation live?**
<details><summary>Answer</summary>

Three layers: native constraints, a schema on the client, and always the server. Show errors on blur first, then on change while an error is visible. [React] · [14 §14.2](14-forms-and-actions.md#142-validation-strategies)

</details>

**Q3. Why does React Hook Form re-render less?**
<details><summary>Answer</summary>

It keeps inputs uncontrolled and subscribes to form state through a proxy, so only components that read a piece of state re-render. Prefer `useWatch` over `watch()`. [Library: RHF] · [14 §14.3](14-forms-and-actions.md#143-react-hook-form--zod)

</details>

**Q4. Fetched data arrives after `useForm({ defaultValues })`. What do you do?**
<details><summary>Answer</summary>

`defaultValues` are read once. Call `reset(data)` or use the `values` option. [Library: RHF] · [14 §14.3](14-forms-and-actions.md#143-react-hook-form--zod)

</details>

**Q5. Why does selecting the same file twice fire no second `change` event?**
<details><summary>Answer</summary>

The input value did not change. Clear `input.value` in between. Also revoke object URLs in cleanup. [Browser] · [14 §14.4](14-forms-and-actions.md#144-file-inputs-and-previews)

</details>

**Q6. Why is `onSubmit` with `preventDefault` incompatible with `<form action={fn}>`?**
<details><summary>Answer</summary>

React runs a function `action` only when the submit event was not already prevented. [React DOM] · [14 §14.6](14-forms-and-actions.md#146-actions-form-actionfn)

</details>

**Q7. Why is an input missing from the `FormData` in your Action?**
<details><summary>Answer</summary>

It has no `name` attribute. Controlled inputs need one too if an Action reads them. [Browser] · [14 §14.6](14-forms-and-actions.md#146-actions-form-actionfn)

</details>

**Q8. What does `useActionState` return, and what should a failing Action do?**
<details><summary>Answer</summary>

`[state, dispatchAction, isPending]`. Return expected errors as state; throwing cancels queued calls and goes to the error boundary. [React] · [14 §14.7](14-forms-and-actions.md#147-useactionstate)

</details>

**Q9. Why does `useFormStatus` always report `pending: false` in your form component?**
<details><summary>Answer</summary>

It reads the status of a parent `<form>`. Call it in a child component rendered inside the form. [React DOM] · [14 §14.8](14-forms-and-actions.md#148-useformstatus)

</details>

**Q10. What is `useOptimistic`, and where must you call its setter?**
<details><summary>Answer</summary>

It shows a temporary value while an Action is pending, then reverts to the real state. Call the setter inside an Action or transition, or the value only flashes. [React] · [14 §14.9](14-forms-and-actions.md#149-useoptimistic)

</details>

**Q11. `form.submit()` or `form.requestSubmit()` with Actions?**
<details><summary>Answer</summary>

`requestSubmit()`: `submit()` skips the submit event so React's action never runs. [Browser] · [14 §14.6](14-forms-and-actions.md#146-actions-form-actionfn)

</details>

**Q12. Why does a "Back" button inside a form submit it?**
<details><summary>Answer</summary>

A `<button>` defaults to `type="submit"`. Use `type="button"`. [Browser] · [14 §14.10](14-forms-and-actions.md#1410-multi-step-forms)

</details>

---

## 28.15 Performance

**Q1. "It re-rendered, so it is slow": true?**
<details><summary>Answer</summary>

No. A re-render is not a DOM update and is often cheap. Measure on a production build first. [React] · [15 §15.1](15-performance.md#151-measure-first-react-devtools-profiler-chrome-performance-panel-performance-tracks)

</details>

**Q2. Name the reasons a component re-renders.**
<details><summary>Answer</summary>

Its own state changes, its parent renders, or a context it reads changes. Props changing is just the parent rendering. [React] · [15 §15.2](15-performance.md#152-why-components-re-render)

</details>

**Q3. When does `React.memo` help, and when is it worse than nothing?**
<details><summary>Answer</summary>

It helps with expensive children and stable props. With an inline object/array/function prop, or JSX `children`, the comparison fails every time, so you pay for the compare plus the render. [React] · [15 §15.3](15-performance.md#153-reactmemo)

</details>

**Q4. Does a `memo` comparator return `true` or `false` to skip a render?**
<details><summary>Answer</summary>

`true` skips; `shouldComponentUpdate` returns `false` to skip. Inverting them in a class migration is a classic bug. [React] · [15 §15.3](15-performance.md#153-reactmemo)

</details>

**Q5. Does `useCallback` stop the function from being created?**
<details><summary>Answer</summary>

No, it only returns the cached one. It matters when the function is a `memo` child's prop or an effect/context dependency. [React] · [15 §15.4](15-performance.md#154-usememo-and-usecallback-and-when-they-waste-effort)

</details>

**Q6. Is `useMemo` a semantic guarantee?**
<details><summary>Answer</summary>

No. React may discard the cache, and Strict Mode calls the function twice in dev. Use it for performance only. [React] · [15 §15.4](15-performance.md#154-usememo-and-usecallback-and-when-they-waste-effort)

</details>

**Q7. What does the React Compiler change?**
<details><summary>Answer</summary>

It memoizes automatically at build time (1.0 stable since 2025-10-07; opt-in), so hand-written `memo`/`useMemo`/`useCallback` are mostly unnecessary. Keep existing ones or test before removing. [React] · [15 §15.5](15-performance.md#155-the-react-compiler-and-how-it-changes-the-advice)

</details>

**Q8. What is the cheapest fix for a slow re-render: memoize or restructure?**
<details><summary>Answer</summary>

Restructure first: move state down into the component that uses it, or lift content up as `children` so it does not re-render. [React] · [15 §15.6](15-performance.md#156-moving-state-down-and-lifting-content-up)

</details>

**Q9. Which problem does `lazy` inside a component body cause?**
<details><summary>Answer</summary>

A new component type on each render, which resets state. Declare it at module level. Also wrap lazy routes in an error boundary for failed chunks. [React] · [15 §15.7](15-performance.md#157-code-splitting-with-lazy-and-suspense)

</details>

**Q10. What does virtualization cost?**
<details><summary>Answer</summary>

Ctrl+F stops finding off-screen rows and assistive tech sees only the rendered window (set `aria-rowcount` etc.). jsdom cannot test it without stubs. [React] · [15 §15.8](15-performance.md#158-virtualization)

</details>

**Q11. Do transitions make work faster?**
<details><summary>Answer</summary>

No, they make it interruptible. Without `memo` on the deferred part you pay for two renders. [React] · [15 §15.9](15-performance.md#159-transitions-for-responsiveness)

</details>

**Q12. Should the LCP image use `loading="lazy"`?**
<details><summary>Answer</summary>

No. It delays the most important paint; load it eagerly with `fetchpriority="high"`. [Browser] · [15 §15.10](15-performance.md#1510-images-fonts-preloading)

</details>

**Q13. Which metric replaced FID, and when?**
<details><summary>Answer</summary>

INP (Interaction to Next Paint) replaced First Input Delay in March 2024 as a Core Web Vital. Measure at p75 from field data; `web-vitals` 5+ has no `onFID`. [Browser] · [15 §15.12](15-performance.md#1512-web-vitals-in-react)

</details>

---

## 28.16 Error handling

**Q1. What happens when a component throws during render?**
<details><summary>Answer</summary>

React retries the root once, then walks up to the nearest error boundary; with none, the whole tree unmounts to a blank page. [React] · [16 §16.1](16-error-handling.md#161-what-happens-when-a-render-throws)

</details>

**Q2. How many times does a throwing component render before the fallback?**
<details><summary>Answer</summary>

At least twice, because React retries once. Side effects in render run twice. [React] · [16 §16.1](16-error-handling.md#161-what-happens-when-a-render-throws)

</details>

**Q3. Which API makes a class an error boundary?**
<details><summary>Answer</summary>

`static getDerivedStateFromError` (pure, chooses the fallback) and `componentDidCatch` (logging). There is still no hook equivalent. [React] · [16 §16.2](16-error-handling.md#162-error-boundaries)

</details>

**Q4. Does `try { return <Child /> } catch {}` catch Child's errors?**
<details><summary>Answer</summary>

No. Creating an element does not render it; React renders `Child` later. [React] · [16 §16.2](16-error-handling.md#162-error-boundaries)

</details>

**Q5. What do boundaries not catch?**
<details><summary>Answer</summary>

Event handlers, async code (`setTimeout`, promises), server-side rendering errors and errors in the boundary itself. [React] · [16 §16.4](16-error-handling.md#164-what-boundaries-do-not-catch)

</details>

**Q6. How do you send an async or handler error to a boundary?**
<details><summary>Answer</summary>

With `react-error-boundary`'s `useErrorBoundary().showBoundary(error)`, or by setting state and throwing during render. [Library: react-error-boundary] · [16 §16.3](16-error-handling.md#163-react-error-boundary)

</details>

**Q7. Why does `resetKeys={[{ id }]}` reset constantly?**
<details><summary>Answer</summary>

The array holds a new object each render. Use primitives. [Library: react-error-boundary] · [16 §16.3](16-error-handling.md#163-react-error-boundary)

</details>

**Q8. What are `onCaughtError`, `onUncaughtError` and `onRecoverableError`?**
<details><summary>Answer</summary>

React 19 `createRoot`/`hydrateRoot` options for reporting errors caught by a boundary, not caught by any, and recovered from automatically (e.g. hydration). Overriding `onCaughtError` silences the default console report. [React DOM] · [16 §16.5](16-error-handling.md#165-react-19-root-options-oncaughterror-onuncaughterror-onrecoverableerror)

</details>

**Q9. React 19 versus 18: do caught errors still reach `window.onerror`?**
<details><summary>Answer</summary>

Not in 19. In 18 dev they did, so global reporters double-counted; dedupe logic written for 18 may be dead code. [React] · [16 §16.5](16-error-handling.md#165-react-19-root-options-oncaughterror-onuncaughterror-onrecoverableerror)

</details>

**Q10. Can you `throw 'oops'`, and what does that mean for fallbacks?**
<details><summary>Answer</summary>

Yes, any value can be thrown. Narrow with `instanceof Error`; `react-error-boundary` 6.1 types `error` as `unknown`. [JS] · [16 §16.2](16-error-handling.md#162-error-boundaries)

</details>

**Q11. Should a 404 be thrown to an error boundary?**
<details><summary>Answer</summary>

Usually no: expected errors replace a whole region. Model them as state or an explicit "not found" UI. [React] · [16 §16.8](16-error-handling.md#168-resilient-ui-states)

</details>

---

## 28.17 Data fetching

**Q1. Why can fetch-in-effect still be wrong after you add abort?**
<details><summary>Answer</summary>

It remains fetch-on-render: no cache, dedupe or revalidation, and it creates waterfalls. [React] · [17 §17.1](17-data-fetching.md#171-fetching-in-effects-and-its-pitfalls)

</details>

**Q2. How do you model loading/error/empty/success?**
<details><summary>Answer</summary>

As a discriminated union (`status`), not separate booleans, so impossible combinations cannot exist. [TS] · [17 §17.2](17-data-fetching.md#172-loadingerrorempty-states-as-a-union-type)

</details>

**Q3. Server state versus client state?**
<details><summary>Answer</summary>

Server state is remote data you do not own (cache it, revalidate it); client state is UI state you own. Use a query cache for the first. [React] · [17 §17.3](17-data-fetching.md#173-server-state-vs-client-state)

</details>

**Q4. What are `staleTime` and `gcTime` defaults in TanStack Query v5?**
<details><summary>Answer</summary>

`staleTime` 0 (data is stale immediately) and `gcTime` 5 minutes (counted from when the last observer unmounts). `gcTime` was `cacheTime` in v4. [Library: TanStack Query] · [17 §17.4](17-data-fetching.md#174-tanstack-query-query-keys-staletime-vs-gctime)

</details>

**Q5. What belongs in a query key?**
<details><summary>Answer</summary>

Every input of the query function. `queryKey: ['user']` with `fetchUser(id)` shows user 1's data for user 2. [Library: TanStack Query] · [17 §17.4](17-data-fetching.md#174-tanstack-query-query-keys-staletime-vs-gctime)

</details>

**Q6. Are `{ page, sort }` and `{ sort, page }` the same key? What about `['a','b']` and `['b','a']`?**
<details><summary>Answer</summary>

Object key order does not matter; array order does. [Library: TanStack Query] · [17 §17.4](17-data-fetching.md#174-tanstack-query-query-keys-staletime-vs-gctime)

</details>

**Q7. Why does a query with a non-2xx response show `status: 'success'`?**
<details><summary>Answer</summary>

`fetch` does not reject on 4xx/5xx, so the query function must throw on `!res.ok`. [Browser] · [17 §17.4](17-data-fetching.md#174-tanstack-query-query-keys-staletime-vs-gctime)

</details>

**Q8. `isPending` versus `isLoading` in v5?**
<details><summary>Answer</summary>

`isPending` means no data yet and stays true forever for a disabled query. `isLoading` is pending and fetching, the right flag for spinners on queries that can be disabled. [Library: TanStack Query] · [17 §17.4](17-data-fetching.md#174-tanstack-query-query-keys-staletime-vs-gctime)

</details>

**Q9. Why should you return the promise from `invalidateQueries` in `onSettled`?**
<details><summary>Answer</summary>

Braces without `return` settle the mutation before the refetch finishes, so the old list flashes back. [Library: TanStack Query] · [17 §17.5](17-data-fetching.md#175-invalidation-and-mutations)

</details>

**Q10. How do optimistic updates work in TanStack Query?**
<details><summary>Answer</summary>

Cancel queries, snapshot the cache, write the optimistic value, roll back on error, and invalidate on settle. [Library: TanStack Query] · [17 §17.6](17-data-fetching.md#176-optimistic-updates)

</details>

**Q11. What is the cost of infinite queries?**
<details><summary>Answer</summary>

When stale they refetch every loaded page sequentially. Use `maxPages` or a longer `staleTime`. [Library: TanStack Query] · [17 §17.7](17-data-fetching.md#177-pagination-and-infinite-queries)

</details>

**Q12. SWR versus TanStack Query in one line?**
<details><summary>Answer</summary>

SWR is smaller and simpler (stale-while-revalidate); TanStack Query has richer mutation, devtools and cache controls. [Library: SWR] · [17 §17.9](17-data-fetching.md#179-swr-comparison)

</details>

**Q13. Why does `use(fetch(url))` in a Client Component loop?**
<details><summary>Answer</summary>

A new promise is created each render, so it never settles from React's point of view ("suspended by an uncached promise"). Create it in a cache, a Server Component or state. [React] · [17 §17.10](17-data-fetching.md#1710-suspense-based-fetching-and-use)

</details>

**Q14. How do you test a component that suspends on `use(promise)` at first render?**
<details><summary>Answer</summary>

`await act(async () => render(<X />))`. Plain `render` uses a sync `act` and React 19 never retries. [Library: RTL] · [17 §17.10](17-data-fetching.md#1710-suspense-based-fetching-and-use)

</details>

**Q15. Why are two `useSuspenseQuery` calls in one component a waterfall?**
<details><summary>Answer</summary>

The first suspends before the second starts. Use `useSuspenseQueries`. [Library: TanStack Query] · [17 §17.10](17-data-fetching.md#1710-suspense-based-fetching-and-use)

</details>

**Q16. WebSocket or SSE for a live feed, and how does it meet the cache?**
<details><summary>Answer</summary>

SSE for one-way server push (simple; `EventSource` reconnects automatically, [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)); WebSocket for two-way. Push events into the query cache with `setQueryData` or invalidate ([QueryClient](https://tanstack.com/query/v5/docs/reference/QueryClient)). [Browser] · [17 §17.11](17-data-fetching.md#1711-real-time-websockets-and-sse-plus-cache-integration)

</details>

**Q17. Why do your error tests take 7 seconds to fail?**
<details><summary>Answer</summary>

Default retries with exponential backoff. Use `retry: false` in the test client and a fresh client per test. [Library: TanStack Query] · [17 §17.12](17-data-fetching.md#1712-request-deduplication-retries-cancellation)

</details>

---

## 28.18 State management landscape

**Q1. Name the kinds of state and where each belongs.**
<details><summary>Answer</summary>

Local (component), server (query cache), URL (router), form (form tool), global UI (store/context). Classify before choosing a tool. [React] · [18 §18.1](18-state-management.md#181-a-taxonomy-local-server-url-form-global-ui)

</details>

**Q2. Why isn't Context plus `useReducer` "free Redux"?**
<details><summary>Answer</summary>

No selectors: every consumer re-renders on any change. [React] · [18 §18.2](18-state-management.md#182-contexts-limits)

</details>

**Q3. Redux's three principles in your own words?**
<details><summary>Answer</summary>

One store, state changes only by dispatched actions, and reducers are pure functions. Legacy code adds hand-written action types and `connect`. [Library: Redux] · [18 §18.3](18-state-management.md#183-redux-core-ideas-and-legacy-redux)

</details>

**Q4. Why can Redux Toolkit "mutate" state in a reducer?**
<details><summary>Answer</summary>

Immer wraps it in a draft and produces an immutable result. Mutate or return, never both; assigning to the parameter does nothing. [Library: Redux Toolkit] · [18 §18.4](18-state-management.md#184-redux-toolkit-configurestore-slices-immer)

</details>

**Q5. What changed in RTK 2 for `extraReducers` and `middleware`?**
<details><summary>Answer</summary>

The object syntax was removed (use the builder callback), and `middleware` must be a callback: `(gdm) => gdm().concat(logger)`. [Library: Redux Toolkit] · [18 §18.4](18-state-management.md#184-redux-toolkit-configurestore-slices-immer)

</details>

**Q6. Why does `try { await dispatch(thunk()) } catch {}` never catch a failed request?**
<details><summary>Answer</summary>

`createAsyncThunk` promises resolve with a `rejected` action. Use `.unwrap()` or check `rejected.match`. [Library: Redux Toolkit] · [18 §18.5](18-state-management.md#185-thunks-and-createasyncthunk)

</details>

**Q7. A `useSelector` that returns `state.items.filter(...)`: what is wrong?**
<details><summary>Answer</summary>

A new array every call re-renders on every dispatch. Memoize with `createSelector`, use `shallowEqual`, or select primitives. Input selectors must not create new values. [Library: Redux] · [18 §18.6](18-state-management.md#186-selectors-and-memoization)

</details>

**Q8. How long does RTK Query keep unused data?**
<details><summary>Answer</summary>

60 seconds after the last subscriber unmounts (`keepUnusedDataFor`). [Library: RTK Query] · [18 §18.7](18-state-management.md#187-rtk-query)

</details>

**Q9. What happens in Zustand 5 with a selector that returns a new object?**
<details><summary>Answer</summary>

It loops forever ("Maximum update depth exceeded"); in v4 it just re-rendered. Use `useShallow` or select primitives. [Library: Zustand] · [18 §18.8](18-state-management.md#188-zustand)

</details>

**Q10. Does Zustand's `set` deep-merge?**
<details><summary>Answer</summary>

No, it merges shallowly: `set({ nested: { a: 1 } })` replaces `nested`. And the store is a module singleton, so reset it between tests and create one per request on the server. [Library: Zustand] · [18 §18.8](18-state-management.md#188-zustand)

</details>

**Q11. What is the Jotai mental model, and its classic mistake?**
<details><summary>Answer</summary>

State as small composable atoms. Creating an atom inside a component without `useMemo` makes a new atom every render. [Library: Jotai] · [18 §18.9](18-state-management.md#189-atoms-jotai)

</details>

**Q12. When would you reach for XState?**
<details><summary>Answer</summary>

For workflows with explicit states and transitions (wizards, payment flows) where impossible states must be unrepresentable. [Library: XState] · [18 §18.10](18-state-management.md#1810-xstate)

</details>

**Q13. Redux status checks: `connect` and `createStore`?**
<details><summary>Answer</summary>

Both still work but are `@deprecated` in types (`createStore` since Redux 4.2.0); use hooks and `configureStore`. Recoil is archived: do not start new code with it. [Library: Redux] · [18 §18.3](18-state-management.md#183-redux-core-ideas-and-legacy-redux)

</details>

**Q14. Which state should not go in a global store?**
<details><summary>Answer</summary>

URL-shaped state (filters, page): putting it in a store breaks deep links and the back button. [React] · [18 §18.11](18-state-management.md#1811-a-decision-framework)

</details>

---

## 28.19 Routing

**Q1. How does client-side routing work without a page reload?**
<details><summary>Answer</summary>

The History API (`pushState`/`popstate`) changes the URL, and the router renders the matching route. A deep link needs the server to fall back to `index.html`. [Browser] · [19 §19.1](19-routing.md#191-client-side-routing-and-the-history-api)

</details>

**Q2. What are React Router's three modes?**
<details><summary>Answer</summary>

Declarative (`<Routes>`), data (`createBrowserRouter` with loaders/actions) and framework (Vite plugin with SSR, typegen; what Remix became in v7). [Framework: React Router] · [19 §19.2](19-routing.md#192-react-router-8-framework-data-and-declarative-modes)

</details>

**Q3. What happened to `react-router-dom` in v8?**
<details><summary>Answer</summary>

Removed. Import from `react-router` and `react-router/dom` (for `RouterProvider`/`HydratedRouter`). In v7 it was a re-export. [Framework: React Router] · [19 §19.10](19-routing.md#1910-version-notes-v5--v6--v7--v8)

</details>

**Q4. What is `<Outlet>` for?**
<details><summary>Answer</summary>

It renders the matched child route inside a parent layout route. [Framework: React Router] · [19 §19.3](19-routing.md#193-nested-routes-layouts-outlet)

</details>

**Q5. What type are `useParams()` values?**
<details><summary>Answer</summary>

Strings or `undefined`, so `params.id === 5` is always false. Parse and validate. [Framework: React Router] · [19 §19.4](19-routing.md#194-params-and-search-params)

</details>

**Q6. Throw or return from a loader/action?**
<details><summary>Answer</summary>

Throw for "this page cannot render" (404/403); return `data(..., { status: 400 })` for "fix the form". [Framework: React Router] · [19 §19.5](19-routing.md#195-loaders-actions-usefetcher)

</details>

**Q7. Do parent loaders feed child loaders?**
<details><summary>Answer</summary>

No, they run in parallel; share data via middleware context. A search-param change reloads every loader unless `shouldRevalidate` says otherwise. [Framework: React Router] · [19 §19.5](19-routing.md#195-loaders-actions-usefetcher)

</details>

**Q8. What is `useFetcher` for?**
<details><summary>Answer</summary>

Calling loaders/actions without navigating (inline likes, background saves). In v7+ its generic is `typeof loader`, not the data type. [Framework: React Router] · [19 §19.5](19-routing.md#195-loaders-actions-usefetcher)

</details>

**Q9. Why is a component-level auth guard weaker than middleware?**
<details><summary>Answer</summary>

It runs after loaders, which have already fetched data for the guest. Guard in middleware or the loader, and always authorize on the server too. [Framework: React Router] · [19 §19.7](19-routing.md#197-protected-routes-and-auth-redirects)

</details>

**Q10. What is the open-redirect risk in `?redirectTo=`?**
<details><summary>Answer</summary>

An attacker links to your login with an external URL. Accept only paths starting with a single `/`. [Browser] · [19 §19.7](19-routing.md#197-protected-routes-and-auth-redirects)

</details>

**Q11. `<Navigate>` pushes or replaces by default in v6+?**
<details><summary>Answer</summary>

Pushes. Use `replace` in guards or Back traps the user. [Framework: React Router] · [19 §19.7](19-routing.md#197-protected-routes-and-auth-redirects)

</details>

**Q12. Which APIs disappeared in v7?**
<details><summary>Answer</summary>

`json()` and `defer()` (return raw objects/promises or `data()`). Also `formMethod` became upper-case. [Framework: React Router] · [19 §19.10](19-routing.md#1910-version-notes-v5--v6--v7--v8)

</details>

**Q13. React Router v5 idioms to recognize?**
<details><summary>Answer</summary>

`<Switch>`, `component=`/`render=`, `exact`, `<Redirect>`, `useHistory`. v6 replaced them with `<Routes>`, `element`, `<Navigate>`, `useNavigate`. [Framework: React Router] · [19 §19.10](19-routing.md#1910-version-notes-v5--v6--v7--v8)

</details>

---

## 28.20 Testing

**Q1. What is the testing trophy?**
<details><summary>Answer</summary>

Mostly integration tests that render components with real hooks, plus a few unit and E2E tests, over static analysis. Test behavior, not implementation. [Library: Testing Library] · [20 §20.1](20-testing.md#201-the-testing-trophy-and-what-to-test)

</details>

**Q2. Name a Vitest 5 behavior that differs from older versions.**
<details><summary>Answer</summary>

`vi.mock` inside `describe` throws; `clearMocks` is on by default; an unawaited `expect(promise).resolves` fails the test. [Tooling: Vitest] · [20 §20.2](20-testing.md#202-vitest-vs-jest)

</details>

**Q3. What is Testing Library's query priority?**
<details><summary>Answer</summary>

`getByRole` with a name first, then `getByLabelText`, text, and `data-testid` last. [Library: RTL] · [20 §20.3](20-testing.md#203-react-testing-library-and-query-priority)

</details>

**Q4. Does `getByRole('textbox', { name: 'Password' })` find a password input?**
<details><summary>Answer</summary>

No: `type="password"` has no ARIA role. Use `getByLabelText`. [Library: RTL] · [20 §20.3](20-testing.md#203-react-testing-library-and-query-priority)

</details>

**Q5. `getBy`, `queryBy`, `findBy`?**
<details><summary>Answer</summary>

`getBy` throws if absent, `queryBy` returns `null` for zero matches (throws on multiple), `findBy` waits asynchronously. [Library: RTL] · [20 §20.3](20-testing.md#203-react-testing-library-and-query-priority)

</details>

**Q6. `user-event` versus `fireEvent`?**
<details><summary>Answer</summary>

`user-event` simulates the real sequence of events (async since v14, call `setup()` first); `fireEvent` dispatches one event and can create states no user can (it ignores `maxLength`/`disabled`). [Library: user-event] · [20 §20.4](20-testing.md#204-user-event-vs-fireevent)

</details>

**Q7. What happens with `waitFor(() => cond)` where `cond` is a boolean?**
<details><summary>Answer</summary>

It resolves at once. Only a throw (an `expect`) makes it retry. Side effects inside `waitFor` repeat. [Library: RTL] · [20 §20.5](20-testing.md#205-async-utilities-and-act)

</details>

**Q8. Why do Vitest fake timers hang with user-event or `findBy`?**
<details><summary>Answer</summary>

Without the `jest` global, RTL never advances its `setTimeout(0)`. Use `shouldAdvanceTime: true` (which leaks real time and makes exact boundaries flaky). [Tooling: Vitest] · [20 §20.5](20-testing.md#205-async-utilities-and-act)

</details>

**Q9. What is MSW and what does it replace?**
<details><summary>Answer</summary>

A network-edge mock (`http`/`HttpResponse`) intercepting requests at the boundary, replacing hand-mocked `fetch`/axios. MSW 3's `delay()` respects fake timers. It cannot test CORS. [Library: MSW] · [20 §20.6](20-testing.md#206-msw-for-network-mocking)

</details>

**Q10. Why must you create one `QueryClient` per test?**
<details><summary>Answer</summary>

A shared client leaks cache between tests; also set `retry: false`. [Library: TanStack Query] · [20 §20.8](20-testing.md#208-testing-with-context-routers-and-query-clients)

</details>

**Q11. Why can't a `vi.mock` factory use ordinary top-level variables?**
<details><summary>Answer</summary>

`vi.mock` is hoisted above them. Use `vi.hoisted`. [Tooling: Vitest] · [20 §20.9](20-testing.md#209-module-mocking)

</details>

**Q12. When are snapshot tests a bad idea?**
<details><summary>Answer</summary>

Large, noisy snapshots that people update blindly. Prefer small inline snapshots or explicit assertions. [Library: Jest/Vitest] · [20 §20.10](20-testing.md#2010-snapshot-testing-trade-offs)

</details>

**Q13. Playwright versus Cypress, in one line?**
<details><summary>Answer</summary>

Both are real-browser E2E tools; use them for flows that need real layout, navigation and network, because jsdom has no layout. [Library: Playwright] · [20 §20.11](20-testing.md#2011-e2e-with-playwright-and-cypress)

</details>

**Q14. What can automated accessibility testing catch?**
<details><summary>Answer</summary>

Only a subset (missing names, contrast, invalid ARIA, via axe). It does not replace keyboard and screen-reader checks. [Library: axe] · [20 §20.12](20-testing.md#2012-accessibility-testing)

</details>

**Q15. Name two things not to test.**
<details><summary>Answer</summary>

Implementation details (internal state, hook calls) and third-party library behavior. [Library: RTL] · [20 §20.13](20-testing.md#2013-what-not-to-test)

</details>

---

## 28.21 Concurrent React, SSR and Server Components

**Q1. What does concurrent rendering give you?**
<details><summary>Answer</summary>

Non-urgent renders can be interrupted by urgent ones, keeping input responsive. It requires `createRoot` (React 18+); legacy `ReactDOM.render` roots run in React 17 mode ([React v18.0](https://react.dev/blog/2022/03/29/react-v18)). [React] · [21 §21.1](21-concurrent-ssr-server-components.md#211-concurrent-rendering-interruptible-rendering)

</details>

**Q2. After an `await` inside `startTransition(async () => ...)`, is a state update still a transition?**
<details><summary>Answer</summary>

No. The marker covers only the synchronous part, so wrap the update in another `startTransition`. [React] · [21 §21.2](21-concurrent-ssr-server-components.md#212-usetransition-and-starttransition)

</details>

**Q3. What did React 19 add to transitions?**
<details><summary>Answer</summary>

Async Actions: the function may be `async`, and `isPending` stays true until it settles. In 18 it had to be synchronous. [React] · [21 §21.2](21-concurrent-ssr-server-components.md#212-usetransition-and-starttransition)

</details>

**Q4. Should a controlled input's state update go in a transition?**
<details><summary>Answer</summary>

No: typing would lag. Keep `setQuery` urgent and put the expensive update in the transition. [React] · [21 §21.2](21-concurrent-ssr-server-components.md#212-usetransition-and-starttransition)

</details>

**Q5. Does a transition guarantee response order?**
<details><summary>Answer</summary>

No. Guard stale responses yourself (request id, `AbortController`, or `useActionState`, which queues in order). [React] · [21 §21.2](21-concurrent-ssr-server-components.md#212-usetransition-and-starttransition)

</details>

**Q6. `useDeferredValue` versus debounce?**
<details><summary>Answer</summary>

Deferred value is a lagging copy that renders once with the old value and again in the background; requests still fire per change. It saves nothing unless the consumer is `memo`ized. [React] · [21 §21.3](21-concurrent-ssr-server-components.md#213-usedeferredvalue)

</details>

**Q7. Does Suspense handle errors?**
<details><summary>Answer</summary>

No, only pending states. Put an error boundary outside it. [React] · [21 §21.4](21-concurrent-ssr-server-components.md#214-suspense-in-depth)

</details>

**Q8. Why does `typeof window !== 'undefined' ? A : B` in render cause a hydration error?**
<details><summary>Answer</summary>

Server and client render different markup. Branch with `useSyncExternalStore` or an effect. `suppressHydrationWarning` does not fix the DOM and applies one level deep. [React DOM] · [21 §21.5](21-concurrent-ssr-server-components.md#215-ssr-hydration-hydration-errors)

</details>

**Q9. Why can `<div>` inside `<p>` cause a hydration mismatch?**
<details><summary>Answer</summary>

The HTML parser repairs invalid nesting before React hydrates, so the DOM no longer matches. [Browser] · [21 §21.5](21-concurrent-ssr-server-components.md#215-ssr-hydration-hydration-errors)

</details>

**Q10. What does streaming SSR buy you?**
<details><summary>Answer</summary>

The shell is sent early and Suspense boundaries stream in later; selective hydration makes interacted-with parts interactive first. The status code cannot change after the shell is sent, and buffering proxies break it. [React DOM] · [21 §21.6](21-concurrent-ssr-server-components.md#216-streaming-ssr-and-selective-hydration)

</details>

**Q11. What is a Server Component?**
<details><summary>Answer</summary>

A component that renders only on the server (no state, effects or browser APIs), never ships its code to the client and can read data directly. It needs no directive. [React] · [21 §21.7](21-concurrent-ssr-server-components.md#217-server-components-the-mental-model-clientserver-boundary)

</details>

**Q12. Is `'use client'` "browser only"?**
<details><summary>Answer</summary>

No. Client Components are also server-rendered for the first HTML, so top-level `window` access still crashes SSR. It marks a boundary, so keep islands small. [React] · [21 §21.7](21-concurrent-ssr-server-components.md#217-server-components-the-mental-model-clientserver-boundary)

</details>

**Q13. Can a Client Component import a Server Component?**
<details><summary>Answer</summary>

No, but it can render one passed as `children` or a prop. Functions cannot cross from server to client props (except Server Functions). [React] · [21 §21.7](21-concurrent-ssr-server-components.md#217-server-components-the-mental-model-clientserver-boundary)

</details>

**Q14. What does `'use server'` mark?**
<details><summary>Answer</summary>

Callable Server Functions, not Server Components. They are public POST endpoints: validate input and authorize inside. A `'use server'` file may export only async functions. [React] · [21 §21.8](21-concurrent-ssr-server-components.md#218-use-client-and-use-server-server-functions-and-their-security)

</details>

**Q15. What does `<Activity>` do, and what does it not do?**
<details><summary>Answer</summary>

It hides a subtree while preserving state (React 19.2). It does not pause the DOM: videos keep playing. Effects that assumed "unmount on navigation" break when routes are hidden. [React] · [21 §21.9](21-concurrent-ssr-server-components.md#219-activity)

</details>

**Q16. What does `<ViewTransition>` need to animate?**
<details><summary>Answer</summary>

A Transition, Suspense or deferred update (stable in 19.3). It does not honor `prefers-reduced-motion` unless you disable it in CSS. [React] · [21 §21.10](21-concurrent-ssr-server-components.md#2110-viewtransition)

</details>

**Q17. How did Next.js caching change from 14 to 15 to 16?**
<details><summary>Answer</summary>

13/14 cached implicitly, 15 became uncached by default, and 16's Cache Components make caching opt-in with `'use cache'` (`cacheLife`, `cacheTag`). [Framework: Next.js] · [21 §21.12](21-concurrent-ssr-server-components.md#2112-nextjs-16-caching)

</details>

**Q18. `revalidateTag('x')` in Next 16?**
<details><summary>Answer</summary>

A TypeScript error: pass a profile (`revalidateTag('x', 'max')`). `updateTag` gives read-your-writes but works only inside Server Actions. [Framework: Next.js] · [21 §21.12](21-concurrent-ssr-server-components.md#2112-nextjs-16-caching)

</details>

**Q19. Is `proxy.ts` an authorization layer?**
<details><summary>Answer</summary>

No. Check access next to the data. It replaces `middleware.ts`, runs on Node, and a reverse proxy that buffers will turn a stream into one chunk. [Framework: Next.js] · [21 §21.13](21-concurrent-ssr-server-components.md#2113-route-handlers-and-proxyts)

</details>

**Q20. React Router framework mode versus Next.js App Router?**
<details><summary>Answer</summary>

Same goals (SSR, data loading) with different models: React Router uses loaders/actions as route modules; the App Router uses Server Components and Server Functions. [Framework: React Router] · [21 §21.14](21-concurrent-ssr-server-components.md#2114-react-router-framework-mode--remix-comparison)

</details>

---

## 28.22 Production project structure

**Q1. Layer-based or feature-based folders?**
<details><summary>Answer</summary>

Feature-based: code that changes together lives together. Enforce boundaries mechanically (lint rule or CI test), since TypeScript has no folder visibility. [React] · [22 §22.1](22-production-project-structure.md#221-layer-based-vs-feature-based-folders)

</details>

**Q2. What is the Feature-Sliced Design dependency rule?**
<details><summary>Answer</summary>

Layers import only downward (`app > pages > widgets > features > entities > shared`), with no sibling-slice imports. A `shared/` that imports from `features/` reverses it. [React] · [22 §22.2](22-production-project-structure.md#222-feature-sliced-design)

</details>

**Q3. Why isolate the API layer?**
<details><summary>Answer</summary>

One typed client centralizes base URL, auth, interceptors and `ProblemDetail` mapping, so components never call `fetch` directly. [React] · [22 §22.4](22-production-project-structure.md#224-the-api-layer)

</details>

**Q4. How do you do "one build, many environments" with Vite?**
<details><summary>Answer</summary>

`VITE_` values are build-time and public, so use a runtime `config.json` for per-environment values. Secrets never go in the bundle. [Tooling: Vite] · [22 §22.5](22-production-project-structure.md#225-environment-config)

</details>

**Q5. What belongs in a flag system's defaults?**
<details><summary>Answer</summary>

Safe defaults: a flag whose default is "on" turns a flag-service outage into a surprise release. Read flags in render rather than fetching in an effect. [React] · [22 §22.7](22-production-project-structure.md#227-feature-flags)

</details>

**Q6. Why do string-concatenated sentences break i18n?**
<details><summary>Answer</summary>

Word order and plural rules differ by language. Use whole messages with ICU-style plurals (`Intl.PluralRules` exposes the per-locale categories, [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules)), and `Intl` for numbers/dates. [Browser] · [22 §22.8](22-production-project-structure.md#228-i18n)

</details>

**Q7. Why does refreshing `/orders/7` 404 in production but not in dev?**
<details><summary>Answer</summary>

The dev server has an SPA fallback; production does not unless you add one. The fallback must still return a real 404 for missing `/assets/` files. [Browser] · [22 §22.12](22-production-project-structure.md#2212-deployment-targets-staticcdn-node-server-served-from-spring)

</details>

**Q8. Why copy only manifests before `npm ci` in a Dockerfile?**
<details><summary>Answer</summary>

So the install layer stays cached until dependencies change. Use a multi-stage build and ship only the static bundle behind nginx. [Tooling: Docker] · [22 §22.11](22-production-project-structure.md#2211-dockerized-front-end)

</details>

**Q9. What is the main risk of micro-frontends in React?**
<details><summary>Answer</summary>

Two copies of React ("Invalid hook call") and duplicated context. Share `react` and `react-dom` as singletons. [React] · [22 §22.13](22-production-project-structure.md#2213-micro-frontends)

</details>

---

## 28.23 Ecosystem libraries

**Q1. How do you evaluate a library?**
<details><summary>Answer</summary>

A fixed checklist (maintenance, React compatibility, types, SSR/RSC, size, accessibility, license, escape hatches, lock-in); stop on the first hard fail and hide it behind your own seam. [React] · [23 §23.1](23-ecosystem-libraries.md#231-how-to-evaluate-a-library)

</details>

**Q2. Why are download counts not a health signal?**
<details><summary>Answer</summary>

Legacy projects keep them high (Enzyme, `react-helmet`). Check last publish, peer ranges and issues. [Tooling: npm] · [23 §23.1](23-ecosystem-libraries.md#231-how-to-evaluate-a-library)

</details>

**Q3. Is `axios` deprecated?**
<details><summary>Answer</summary>

No. That rumor confuses it with the old `request` package. `fetch` is enough for many apps, but axios is a choice, not a mistake. [Library: axios] · [23 §23.3](23-ecosystem-libraries.md#233-deprecated-or-archived-libraries-you-will-meet-in-legacy-code)

</details>

**Q4. Why is shadcn/ui "not a package"?**
<details><summary>Answer</summary>

Components are copied into your repo, so you own the code and cannot `npm update` fixes. [Library: shadcn/ui] · [23 §23.2](23-ecosystem-libraries.md#232-curated-tables-data-state-forms-validation-styling-ui-kits-tables-charts-dates-animation-virtualization-testing-i18n-each-with-choose-when--avoid-when)

</details>

**Q5. Enzyme: status and replacement?**
<details><summary>Answer</summary>

Unmaintained (last release 2019-12-20, no official adapter for React 18/19). Migrate to React Testing Library. [Library: Enzyme] · [23 §23.3](23-ecosystem-libraries.md#233-deprecated-or-archived-libraries-you-will-meet-in-legacy-code)

</details>

**Q6. Why can Moment migrations hide bugs?**
<details><summary>Answer</summary>

Moment objects mutate (`add` changes the original), and month indexes are 0-based, unlike ISO strings. Replace with an immutable API and expect behavior changes. [JS] · [23 §23.3](23-ecosystem-libraries.md#233-deprecated-or-archived-libraries-you-will-meet-in-legacy-code)

</details>

**Q7. Does a peer range `>=18` prove a library works on React 19?**
<details><summary>Answer</summary>

No. It is open-ended; check the changelog. And a peer warning silenced with `--legacy-peer-deps` hides a real incompatibility. [Tooling: npm] · [23 §23.1](23-ecosystem-libraries.md#231-how-to-evaluate-a-library)

</details>

---

## 28.24 React with a Spring Boot backend

**Q1. Which layouts avoid CORS, and what do separate origins require?**
<details><summary>Answer</summary>

Same origin via a reverse proxy (or a BFF) avoids CORS. Separate origins need an exact-origin credentialed CORS config and `Expose-Headers` for anything JS reads. [Backend: Spring] · [24 §24.1](24-react-with-spring-boot.md#241-architecture-options)

</details>

**Q2. "It works in Postman." Does that prove CORS is fine?**
<details><summary>Answer</summary>

No: only browsers enforce CORS. [Browser] · [24 §24.2](24-react-with-spring-boot.md#242-cors-preflight-credentials-spring-corsconfigurationsource)

</details>

**Q3. Why is `credentials: 'include'` incompatible with `Access-Control-Allow-Origin: *`?**
<details><summary>Answer</summary>

The browser rejects the wildcard with credentials: use an exact origin. `allowedOriginPatterns("*")` with credentials is as bad as no CORS. [Backend: Spring] · [24 §24.2](24-react-with-spring-boot.md#242-cors-preflight-credentials-spring-corsconfigurationsource)

</details>

**Q4. Why does Spring Security reject the preflight?**
<details><summary>Answer</summary>

CORS was not wired into the filter chain (`http.cors(...)`), and the OPTIONS request carries no credentials. A `CorsConfigurationSource` bean is the form Security consumes. [Backend: Spring] · [24 §24.2](24-react-with-spring-boot.md#242-cors-preflight-credentials-spring-corsconfigurationsource)

</details>

**Q5. JWT in memory versus an `httpOnly` cookie?**
<details><summary>Answer</summary>

Memory tokens are invisible to XSS persistence but lost on reload; `localStorage` tokens survive reloads and every XSS. An `httpOnly` cookie cannot be read by JS but needs CSRF protection. [Backend: Spring] · [24 §24.3](24-react-with-spring-boot.md#243-auth-options-jwt-in-memory-vs-httponly-cookies)

</details>

**Q6. Why must refresh calls be single-flight?**
<details><summary>Answer</summary>

Parallel refreshes break rotating refresh tokens (the second use of an old token looks like theft). Also retry once and treat a second 401 as final. [Backend: Spring] · [24 §24.4](24-react-with-spring-boot.md#244-refresh-token-rotation)

</details>

**Q7. Why shouldn't you `csrf.disable()` to fix a 403 with cookie auth?**
<details><summary>Answer</summary>

It removes protection. Fix the SPA's token handling instead; Security 6's deferred/XOR tokens broke the old "copy the cookie to a header" recipe. [Backend: Spring] · [24 §24.5](24-react-with-spring-boot.md#245-csrf-with-cookie-auth)

</details>

**Q8. Why use OAuth2/OIDC with PKCE, and what does a BFF add?**
<details><summary>Answer</summary>

PKCE protects the authorization code for public clients. A BFF keeps tokens on the server and gives the browser only a session cookie. [Backend: Spring] · [24 §24.6](24-react-with-spring-boot.md#246-oauth2oidc-with-pkce-bff-pattern-spring-security-resource-server)

</details>

**Q9. What does an API client with interceptors centralize?**
<details><summary>Answer</summary>

Auth headers, 401 refresh, error mapping and `res.ok` checks (since `fetch` does not reject on 4xx/5xx). Retrying a 5xx `POST` can duplicate the action; a 401 retry cannot, and a streamed body cannot be replayed. [Browser] · [24 §24.7](24-react-with-spring-boot.md#247-an-api-client-with-interceptors)

</details>

**Q10. What is `ProblemDetail`, and what is the real contract?**
<details><summary>Answer</summary>

RFC 9457's `application/problem+json` (`type`, `title`, `status`, `detail`, `instance` plus extensions). The client has no `catch`, so the `type` URI is the contract; do not branch on `title`/`detail` text. [Backend: Spring] · [24 §24.8](24-react-with-spring-boot.md#248-problemdetail-error-mapping)

</details>

**Q11. In Spring 7, what about `ProblemDetail.type`?**
<details><summary>Answer</summary>

It may be absent. Treat a missing `type` as `about:blank` and do not mark it required in the schema. [Backend: Spring] · [24 §24.8](24-react-with-spring-boot.md#248-problemdetail-error-mapping)

</details>

**Q12. Why generate TypeScript types from OpenAPI?**
<details><summary>Answer</summary>

A single source of truth: contract drift becomes a compile error. Types are still erased, so validate at runtime where you do not trust the server. [TS] · [24 §24.9](24-react-with-spring-boot.md#249-openapi--typescript-generation)

</details>

**Q13. Spring pages are 0-based. What should the UI do?**
<details><summary>Answer</summary>

Convert once at the API boundary (UI says "Page 1"). [Backend: Spring] · [24 §24.10](24-react-with-spring-boot.md#2410-pagination-contracts)

</details>

**Q14. What goes wrong with S3 presigned uploads?**
<details><summary>Answer</summary>

Sending `Authorization` to S3 breaks the signature and leaks the token; a presigned PUT with a different `Content-Type` returns 403 `SignatureDoesNotMatch`. [Backend: Spring] · [24 §24.11](24-react-with-spring-boot.md#2411-file-uploads-with-s3-presigned-urls)

</details>

**Q15. Why can't `EventSource` use bearer tokens, and what about WebSocket CORS?**
<details><summary>Answer</summary>

`EventSource` cannot send `Authorization`: use cookies or a short-lived ticket. WebSockets have no CORS, so validate `Origin` on the server. [Backend: Spring] · [24 §24.12](24-react-with-spring-boot.md#2412-real-time-websocketstomp-sse)

</details>

**Q16. What does a Boot 3+ project use instead of `javax.validation`?**
<details><summary>Answer</summary>

`jakarta.validation` (Boot 3 / Framework 6 moved `javax.*` to `jakarta.*`). [Backend: Spring] · [24 §24.1](24-react-with-spring-boot.md#241-architecture-options)

</details>

**Q17. Why does a hard refresh on a deep link 404, and why cache `index.html` carefully?**
<details><summary>Answer</summary>

Without an SPA fallback the server has no file for the path. `index.html` cached for a year means nobody gets the new release. [Backend: Spring] · [24 §24.13](24-react-with-spring-boot.md#2413-deployment-options)

</details>

---

## 28.25 Front-end system design

**Q1. What is the answer framework?**
<details><summary>Answer</summary>

Ten steps in order: requirements, components, data model, API contract, state, performance, accessibility, i18n, security, observability, each tied to a stated requirement and a named trade-off. [React] · [25 §25.1](25-frontend-system-design.md#251-the-answer-framework)

</details>

**Q2. Design typeahead: three essentials?**
<details><summary>Answer</summary>

Debounce, abort, and tag each answer with its query (abort alone is not enough), plus the APG combobox (focus stays on the input, `aria-activedescendant`). [Browser] · [25 §25.2](25-frontend-system-design.md#252-autocompletetypeahead)

</details>

**Q3. Why does clicking an option fail when `onBlur` closes the list?**
<details><summary>Answer</summary>

The input blurs before `click` lands. Use `onMouseDown` with `preventDefault` on options. [React DOM] · [25 §25.2](25-frontend-system-design.md#252-autocompletetypeahead)

</details>

**Q4. Offset or cursor pagination for a live feed?**
<details><summary>Answer</summary>

Cursor on `(createdAt, id)`: offsets duplicate or skip rows as items are inserted. [Backend: Spring] · [25 §25.3](25-frontend-system-design.md#253-infinite-feed)

</details>

**Q5. What makes a virtualized data grid accessible?**
<details><summary>Answer</summary>

`aria-rowcount`, `aria-rowindex` and `aria-colcount`, because only the rendered window exists in the DOM. CSV export must escape cells starting with `=`, `+`, `-` or `@`. [Browser] · [25 §25.4](25-frontend-system-design.md#254-data-grid)

</details>

**Q6. How do you order chat messages and match optimistic ones with their echo?**
<details><summary>Answer</summary>

Order by a server `seq` (client clocks skew) and keep a `clientId` alongside the server id so the echo replaces the optimistic copy. [Browser] · [25 §25.5](25-frontend-system-design.md#255-real-time-chat)

</details>

**Q7. What must a carousel do to avoid WCAG failures and slow LCP?**
<details><summary>Answer</summary>

Let users pause autoplay, take hidden slides out of the tab order, and load the first image eagerly (not `loading="lazy"`). [Browser] · [25 §25.7](25-frontend-system-design.md#257-image-carousel)

</details>

**Q8. Is disabling "Submit" idempotency?**
<details><summary>Answer</summary>

No. Users can retry from another tab or after a timeout. Use an idempotency key with server dedup. Keep PII and card data out of the URL and web storage. [Backend: Spring] · [25 §25.8](25-frontend-system-design.md#258-multi-step-wizard)

</details>

**Q9. File uploader pitfalls?**
<details><summary>Answer</summary>

A late success can resurrect a canceled upload unless transitions are guarded, and progress events flood React: throttle updates and memoize rows. [Browser] · [25 §25.9](25-frontend-system-design.md#259-file-uploader)

</details>

**Q10. How do you announce notifications to screen readers?**
<details><summary>Answer</summary>

Render an empty `role="status"` live region first and change its text later; inserting it with its text is often not announced. [Browser] · [25 §25.10](25-frontend-system-design.md#2510-notifications-system)

</details>

**Q11. Collaborative editor: OT or CRDT, and the hidden cost?**
<details><summary>Answer</summary>

CRDTs merge without a central order, but they carry metadata for every edit, so document size grows with history. Yjs garbage-collects deleted content by default; set `doc.gc = false` to keep history and the document grows ([Y.Doc](https://docs.yjs.dev/api/y.doc)). Keep presence (cursors) in an ephemeral channel such as Yjs awareness, not the document ([awareness](https://docs.yjs.dev/api/about-awareness)). [Library: CRDT] · [25 §25.11](25-frontend-system-design.md#2511-collaborative-editor)

</details>

---

## 28.26 Machine-coding round

**Q1. How do you approach a 45-minute round?**
<details><summary>Answer</summary>

Clarify and write the scope down, get a skeleton on screen by minute ten, choose the smallest state, make the happy path work, then harden (edge cases, keyboard, a11y) and add a couple of tests. [React] · [26 §26.1](26-machine-coding.md#261-how-to-approach-a-45-minute-round)

</details>

**Q2. What is the most common state mistake in these rounds?**
<details><summary>Answer</summary>

Storing derived data (`visibleItems`, `winner`, `filteredRows`) next to its source. Compute it in render. [React] · [26 §26.2](26-machine-coding.md#262-todo-with-filters)

</details>

**Q3. Todo list: why not `key={index}`?**
<details><summary>Answer</summary>

Deleting the first item shifts checkbox state onto the next item. Use a stable id. [React] · [26 §26.2](26-machine-coding.md#262-todo-with-filters)

</details>

**Q4. Which APG patterns do tabs, accordion, modal and combobox follow, and what do interviewers check?**
<details><summary>Answer</summary>

WAI-ARIA Authoring Practices patterns: name the pattern and implement its keys (arrows for [tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/); Tab wrapping inside, Escape, and focus returned to the opener for the [modal dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)). Click-only widgets fail the round. [Browser] · [26 §26.5](26-machine-coding.md#265-tabs)

</details>

**Q5. How do you build a focus trap that really traps?**
<details><summary>Answer</summary>

Give the dialog `tabIndex={-1}` and focus it when no focusable element exists, wrap Tab/Shift+Tab at the ends, and restore focus to the opener on close. [Browser] · [26 §26.6](26-machine-coding.md#266-modal-with-focus-trap)

</details>

**Q6. Debounced search: how do you stop late responses overwriting newer ones?**
<details><summary>Answer</summary>

Abort in the effect cleanup, ignore results when `signal.aborted`, and key results by the query they answer. [React] · [26 §26.7](26-machine-coding.md#267-debounced-search)

</details>

**Q7. Why might infinite scroll stop loading?**
<details><summary>Answer</summary>

`IntersectionObserver` reports changes only; if new content is short and the sentinel stays visible, nothing fires. Re-observe after each page, and guard double triggers with a ref. [Browser] · [26 §26.9](26-machine-coding.md#269-infinite-scroll)

</details>

**Q8. HTML5 drag-and-drop: why does `drop` never fire?**
<details><summary>Answer</summary>

You did not call `preventDefault` in `dragover`. Also `dragenter`/`dragleave` flicker over child elements. [Browser] · [26 §26.14](26-machine-coding.md#2614-kanban-drag-and-drop)

</details>

**Q9. Countdown timer: count ticks or compute from the clock?**
<details><summary>Answer</summary>

Compute from `Date.now()`: intervals drift and are throttled in background tabs. [Browser] · [26 §26.13](26-machine-coding.md#2613-countdown-timer)

</details>

**Q10. Why does passing `cycle={{...}}` inline to a traffic-light component restart its timer?**
<details><summary>Answer</summary>

The literal is a new object each parent render, so an effect depending on it re-arms. Hoist or memoize it. [React] · [26 §26.18](26-machine-coding.md#2618-traffic-light)

</details>

**Q11. Fake timers with `userEvent` hang in this repo. What do you do?**
<details><summary>Answer</summary>

Use `fireEvent` with `act(() => { vi.advanceTimersByTime(ms); })`, or `shouldAdvanceTime: true`. [Tooling: Vitest] · [26 §26.13](26-machine-coding.md#2613-countdown-timer)

</details>

---

## 28.27 Interview execution

**Q1. What do you narrate while live-coding?**
<details><summary>Answer</summary>

Decisions, predictions and surprises, not keystrokes. State assumptions, announce silences, say the time twice, and when stuck name it, narrow it and ask a scoped question. [React] · [27 §27.1](27-interview-execution.md#271-talking-through-live-coding)

</details>

**Q2. Take-home: what is the most avoidable failure?**
<details><summary>Answer</summary>

A README without run instructions, or a project that fails on a clean clone. Polish the required flow rather than gold-plating, and give reasons for each library. [React] · [27 §27.2](27-interview-execution.md#272-take-home-expectations)

</details>

**Q3. How do you review code in an interview?**
<details><summary>Answer</summary>

Find correctness and risk first (races, error handling, accessibility), then style. Fix the top issues, list the rest, describe behavior not people, and do not rewrite the whole component. [React] · [27 §27.3](27-interview-execution.md#273-reviewing-code-in-an-interview)

</details>

**Q4. What is wrong with a STAR answer that has no Result?**
<details><summary>Answer</summary>

It leaves the note "unclear impact". Use "I" for your actions and "we" for team results, and never invent a metric. [React] · [27 §27.4](27-interview-execution.md#274-behavioral-questions-for-front-endfull-stack)

</details>

**Q5. How do you explain moving from backend to full-stack?**
<details><summary>Answer</summary>

Name strengths, gaps and evidence; do not over-apologize or over-claim. Do not say Angular and React are the same: the re-render model, one-way flow and absence of DI differ. [React] · [27 §27.5](27-interview-execution.md#275-explaining-the-backend--full-stack-transition)

</details>

**Q6. What do you say when asked "any questions for us?"**
<details><summary>Answer</summary>

Ask two or three that would change your decision. "No" is a missed signal, and salary questions go to the recruiter. [React] · [27 §27.6](27-interview-execution.md#276-questions-to-ask-the-interviewer)

</details>

**Q7. Is pasting AI output acceptable?**
<details><summary>Answer</summary>

Only if you can explain every line; read it and narrate what you check. [React] · [27 §27.1](27-interview-execution.md#271-talking-through-live-coding)

</details>

---

## Mixed drill

Twenty questions drawn across modules, shuffled. Say the answer first.

**D1. A parent re-renders and passes `children` to a `memo` child. Does `memo` help?**
<details><summary>Answer</summary>

No: `children` is a new element object each render, so the comparison fails every time. [React] · [15 §15.3](15-performance.md#153-reactmemo)

</details>

**D2. Is this React or the browser: `focusout` bubbling?**
<details><summary>Answer</summary>

Browser. React's `onBlur` bubbles because it is implemented on top of it, while native `blur` does not bubble. [Browser] · [03 §3.2](03-browser-and-web-platform.md#32-events-capture--target--bubble-stoppropagation-preventdefault-delegation)

</details>

**D3. What does `0 ?? 5` return, and what does `0 || 5` return?**
<details><summary>Answer</summary>

`0` and `5`. [JS] · [01 §1.10](01-javascript.md#110-spread-rest-destructuring-optional-chaining-nullish-coalescing)

</details>

**D4. Since which React version can `ref` be a normal prop on function components?**
<details><summary>Answer</summary>

19. Before that you needed `forwardRef`. [React] · [10 §10.4](10-refs-and-dom.md#104-ref-as-a-prop-vs-forwardref)

</details>

**D5. Which one is a trick: `getByRole('textbox', { name: /password/i })` for a password field?**
<details><summary>Answer</summary>

It finds nothing: `type="password"` has no ARIA role. Use `getByLabelText`. [Library: RTL] · [20 §20.3](20-testing.md#203-react-testing-library-and-query-priority)

</details>

**D6. A Server Component file has `'use server'` at the top. Is that right?**
<details><summary>Answer</summary>

No. Server Components need no directive; `'use server'` marks Server Functions (and such a file may export only async functions). [React] · [21 §21.8](21-concurrent-ssr-server-components.md#218-use-client-and-use-server-server-functions-and-their-security)

</details>

**D7. What is the output: `console.log(typeof NaN, NaN === NaN)`?**
<details><summary>Answer</summary>

`number false`. [JS] · [01 §1.1](01-javascript.md#11-values-types-and-typeof-quirks)

</details>

**D8. Why can't an Effect Event be a dependency?**
<details><summary>Answer</summary>

It changes identity every render by design, so it would re-run the effect each time; the linter flags it. [React] · [09 §9.9](09-effects.md#99-useeffectevent)

</details>

**D9. Your TanStack Query data never updates on refetch. You copied `data` into `useState`. Why?**
<details><summary>Answer</summary>

You made a second source of truth that stops following the query. Read from the query each render and derive. [Library: TanStack Query] · [17 §17.4](17-data-fetching.md#174-tanstack-query-query-keys-staletime-vs-gctime)

</details>

**D10. What is the first thing to check when a deep link works in dev but 404s in production?**
<details><summary>Answer</summary>

The SPA fallback on the production server (dev servers add one). Keep a real 404 for missing assets. [Browser] · [22 §22.12](22-production-project-structure.md#2212-deployment-targets-staticcdn-node-server-served-from-spring)

</details>

**D11. Which hook shows a value while a form Action is pending, then discards it?**
<details><summary>Answer</summary>

`useOptimistic`, with its setter called inside an Action or transition. [React] · [14 §14.9](14-forms-and-actions.md#149-useoptimistic)

</details>

**D12. `new Date('2024-01-05')` versus `new Date('2024-01-05T00:00')`: what differs?**
<details><summary>Answer</summary>

The date-only string is parsed as UTC; the other as local time. Formatted locally, the first can show the previous day in negative-offset zones. [JS] · [23 §23.3](23-ecosystem-libraries.md#233-deprecated-or-archived-libraries-you-will-meet-in-legacy-code)

</details>

**D13. A hook is called after an early `return`. What happens?**
<details><summary>Answer</summary>

It is a conditional hook: it works until the condition changes, then React throws a hook-count error (or silently swaps state if types and count match). [React] · [12 §12.1](12-hooks-and-custom-hooks.md#121-the-rules-of-hooks)

</details>

**D14. How should Spring's `ProblemDetail` appear to the client when `type` is missing?**
<details><summary>Answer</summary>

As `about:blank`: no semantics beyond the HTTP status. [Backend: Spring] · [24 §24.8](24-react-with-spring-boot.md#248-problemdetail-error-mapping)

</details>

**D15. Does `shouldComponentUpdate` returning `false` stop `this.props` from updating?**
<details><summary>Answer</summary>

No, `this.props` still updates, so handlers can read props the UI does not show. [React] · [13 §13.7](13-reconciliation-and-fiber.md#137-getderivedstatefromprops-shouldcomponentupdate-purecomponent)

</details>

**D16. `<form action={fn}>` and `useFormStatus` in the same component: what does `pending` show?**
<details><summary>Answer</summary>

Always `false`. Move the hook into a child of the form. [React DOM] · [14 §14.8](14-forms-and-actions.md#148-useformstatus)

</details>

**D17. Which one is worse for an LCP image: `loading="lazy"` or `fetchpriority="high"`?**
<details><summary>Answer</summary>

`loading="lazy"` delays the most important paint; `fetchpriority="high"` helps. [Browser] · [15 §15.10](15-performance.md#1510-images-fonts-preloading)

</details>

**D18. What does `react-router-dom` install in a v8 project?**
<details><summary>Answer</summary>

The last v7 re-export, which causes two router contexts when mixed with v8 `react-router`. Import from `react-router` and `react-router/dom`. [Framework: React Router] · [19 §19.10](19-routing.md#1910-version-notes-v5--v6--v7--v8)

</details>

**D19. An aborted `fetch` shows an error flash on every keystroke. Why?**
<details><summary>Answer</summary>

Aborting rejects the promise and hits your `.catch`. Check `signal.aborted` before setting error state. [Browser] · [09 §9.4](09-effects.md#94-race-conditions-and-abortcontroller)

</details>

**D20. What breaks when you build `text-${color}-500` in Tailwind?**
<details><summary>Answer</summary>

The class is never generated because the scanner reads source text. Use complete class names. [Library: Tailwind] · [04 §4.11](04-html-css-accessibility.md#411-styling-in-react-inline-css-modules-tailwind-css-in-js-and-the-server-components-trade-off)

</details>

---

**Next:** [29 — Glossary](29-glossary.md) · **Related:** [00 — Start here](README.md), [27 — Interview execution](27-interview-execution.md)
