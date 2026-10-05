# Verified Versions

**Verified as of: 2026-10-03.** Every module that makes a version-specific claim cites this table. If you read this much later, re-check the "latest" column before trusting a version note.

Sources: npm registry `dist-tags` (queried 2026-10-03) for version numbers; official blogs, changelogs and docs for features (linked per row).

## Core

| Package / tool | Latest stable | Notes that matter in interviews | Source |
|---|---|---|---|
| `react` / `react-dom` | **19.3.0** (2026-09-09) | 19.3 made `<ViewTransition>`, `addTransitionType`, Fragment refs and `react-dom`'s `browser()` stable, added Trusted Types support, and lets Server Components render `<Context>` from `'use client'` modules. 19.2 (2025-10-01) added `<Activity>` (`visible`/`hidden`), `useEffectEvent`, `cacheSignal` (RSC), Partial Pre-rendering APIs (`prerender`, `resume`…), Performance Tracks, and changed the `useId` prefix to `_r_`. 19.0 (2024-12) added Actions, `useActionState`, `useFormStatus`, `useOptimistic`, `use`, ref as a prop, `<Context>` as a provider, document metadata tags, and stylesheet/script hoisting. | [react.dev/blog](https://react.dev/blog), [19.3](https://react.dev/blog/2026/09/09/react-19-3), [19.2](https://react.dev/blog/2025/10/01/react-19-2) |
| React Compiler (`babel-plugin-react-compiler`) | **1.0.0** (stable since 2025-10-07) | Opt-in build plugin that memoizes automatically. Built into Next.js 16 (`reactCompiler: true`, off by default). Its lint rules ship in `eslint-plugin-react-hooks`. | [Compiler v1.0 post](https://react.dev/blog) |
| `eslint-plugin-react-hooks` | **7.1.1** | Flat config support added in 5.2.0 and made the default `recommended` preset in 6.1.0 (6.0.0 was published by mistake and deprecated); compiler-powered rules included; `recommended-legacy` covers old eslintrc. | react.dev 19.2 post |
| Create React App | 5.1.0 (deprecated) | Deprecated for new apps on **2025-02-14**. Use a framework, or Vite / Parcel / Rsbuild. Legacy codebases still run on it. | [Sunsetting CRA](https://react.dev/blog) |
| TypeScript | **7.0.2** (7.0 released 2026-07-08) | 7.0 is the Go-native port (about 10× faster). The CLI binary is still `tsc` (checked in the npm package's `bin`). 6.0 (2026-03-23) was the last JS-based release. **Not verified:** the exact list of defaults and options that 6.0/7.0 changed or removed. Module 02 must check the TS release notes before it makes those claims. | [TS blog](https://devblogs.microsoft.com/typescript/) |
| Node.js (local machine) | v25.1.0 installed | Vitest 5 declares `node ^22.12 \|\| ^24 \|\| >=26`, so **Node 25 is outside its range**. See "Open risks". | npm metadata |

## Build, lint, test

| Package | Latest stable | Notes | Source |
|---|---|---|---|
| `vite` | **8.3.2** | Node `^20.19 \|\| >=22.12`. | npm |
| `vitest` | **5.0.3** (5.0 on 2026-09-03); `V4` tag 4.1.11 | Peer `vite ^6.4 \|\| ^7 \|\| ^8`. **Not verified:** the v5 breaking-change list. Module 20 must read the v5 post first. | [vitest.dev/blog](https://vitest.dev/blog/) |
| `@testing-library/react` | **16.3.3** | | npm |
| `@testing-library/user-event` | **14.6.7** | | npm |
| `@testing-library/jest-dom` | **7.0.1** | Major bump from 6. Module 20 should verify the import path. | npm |
| `msw` | **3.0.2** (3.0 on 2026-09-28) | ESM-only, Node 22+, TS 5.9+; `worker.stop()` returns a Promise; GraphQL moved to `msw/graphql`; WebSocket event `connection` → `websocket:connection`. **Not verified:** whether the `http`/`HttpResponse` handler syntax is unchanged (it is expected to be). | [MSW releases](https://github.com/mswjs/msw/releases) |
| `eslint` | **10.12.0** (9.39.x maintenance) | Flat config only in v10. | npm |
| `prettier` | **3.9.9** | | npm |
| `@playwright/test` | **1.63.0** | | npm |
| `cypress` | **16.1.1** | | npm |
| `pnpm` | **12.8.1** | npm 11.6.2 installed locally. | npm |

## Routing, data, state, forms

| Package | Latest stable | Notes | Source |
|---|---|---|---|
| `react-router` | **8.4.0** (8.0 on 2026-06-17); v7 = 7.18.4, v6 = 6.30.6, v5 = 5.3.4 | v8: **`react-router-dom` removed** (use `react-router` and `react-router/dom`); React ≥ 19.2.7; Node ≥ 22.22; ESM-only; middleware always on; `future.v8_*` flags removed; still three modes (framework / data / declarative); RSC support unstable. | [changelog](https://reactrouter.com/changelog) |
| `@tanstack/react-router` | **1.170.41** | | npm |
| `@tanstack/react-query` | **5.104.1** (major 5) | `gcTime` (was `cacheTime` in v4), single object signature, `isPending`. | npm |
| `@tanstack/react-virtual` | **3.14.13** | | npm |
| `swr` | **2.5.1** | | npm |
| `@reduxjs/toolkit` | **2.13.0** | RTK 2 / Redux 5: the object syntax of `createSlice` `extraReducers` was removed (builder callback only). | npm |
| `react-redux` | **9.3.0** | | npm |
| `zustand` | **5.0.15** | | npm |
| `jotai` | **3.0.1** | Major 3 is new. Module 18 stays brief and must verify API changes. | npm |
| `xstate` | **5.33.2** | | npm |
| `react-hook-form` | **7.89.0** (v8 in beta) | | npm |
| `zod` | **4.6.5** | Zod 4 (the API differs from 3 in places). | npm |
| `react-error-boundary` | **6.1.6** | | npm |

## Frameworks and UI

| Package | Latest stable | Notes | Source |
|---|---|---|---|
| `next` | **16.3.8** (16.0 on 2025-10-21) | **Cache Components** (opt-in `cacheComponents: true`, `'use cache'`, `cacheLife`, `cacheTag`, `updateTag`, `refresh`, `revalidateTag(tag, profile)`). With it on, dynamic code runs at request time by default, so the old implicit caching is gone. `middleware.ts` → **`proxy.ts`** (Node runtime; middleware deprecated). Turbopack is the default bundler. Async `params` / `cookies()` / `headers()` are required. `next lint` removed. Node ≥ 20.9. React Compiler support is stable. | [Next 16](https://nextjs.org/blog/next-16), [blog](https://nextjs.org/blog) |
| `tailwindcss` | **4.3.3** (v3 LTS 3.4.19) | | npm |
| `@mui/material` | **9.4.0** (v7 = 7.3.11) | | npm |
| Spring Boot | **4.1.1** | Spring Framework 7 line. Local JDK 21, Maven 3.9.10. | GitHub releases |

## What `examples/web` actually runs (installed and verified 2026-10-03)

Node **24.21.0** (from `examples/.nvmrc`) · react/react-dom 19.3.0 · typescript **6.0.3 (pinned, see below)** · vite 8.3.2 · @vitejs/plugin-react 6.1.1 · vitest 5.0.3 · jsdom 30.1.1 · @testing-library/react 16.3.3 · @testing-library/dom 10.4.2 · @testing-library/user-event 14.6.7 · @testing-library/jest-dom 7.0.1 · msw 3.0.2 · eslint 10.12.0 · @eslint/js 10.0.1 · typescript-eslint 8.71.0 · eslint-plugin-react-hooks 7.1.1 · react-router 8.4.0 · @tanstack/react-query 5.104.1 · @tanstack/react-virtual 3.14.13 · @reduxjs/toolkit 2.13.0 · react-redux 9.3.0 · zustand 5.0.15 · react-hook-form 7.89.0 · @hookform/resolvers 5.9.1 · zod 4.6.5 · react-error-boundary 6.1.6. The exact tree is in `examples/web/package-lock.json`.

### Fallback pins (rule: if a new major breaks the toolchain or lacks ecosystem support, pin the previous major)
| Tool | Pinned | Instead of | Reason | Date |
|---|---|---|---|---|
| typescript | ~6.0.3 | 7.0.2 | `typescript-eslint` 8.71.0 declares peer `typescript >=4.8.4 <6.1.0`, so TS 7 has no lint support. Re-check when typescript-eslint widens its range. | 2026-10-03 |

Vitest 5, MSW 3, ESLint 10 and jest-dom 7 all installed, type-checked, linted and passed smoke tests, so none of them needed a fallback.

### API changes found while verifying
- **MSW 3:** `server.listen({ onUnhandledRequest })` was renamed to **`onUnhandledFrame`** (`'bypass' | 'warn' | 'error' |` callback). This was found by type-checking against `msw/lib/_chunks/shared-options.d.ts`. `http`, `HttpResponse` and `setupServer` from `msw/node` work unchanged (smoke test `examples/web/src/m00-smoke/msw.test.ts`).
- **jest-dom 7:** `import '@testing-library/jest-dom/vitest'` works, and so does the tsconfig `types` entry `@testing-library/jest-dom/vitest`.

## Open risks recorded during planning

1. ~~Node 25 vs Vitest 5 engines~~ Resolved: Node 24 LTS pinned through `examples/.nvmrc`.
2. TypeScript 6/7 changed defaults, Vitest 5 breaking changes, jest-dom 7 and Jotai 3 are **unverified in detail**. The module that covers each one must verify it before writing about it.
