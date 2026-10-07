# Versions this guide is written against

**Snapshot date:** 2026-10-03. Versions come from `npm view <package> version`, run on that date. API statuses were checked against the Angular changelog, the angular.dev roadmap, and the compatibility page (see [SOURCES.md](SOURCES.md)).

Everything in the guide assumes the versions below unless a section says otherwise. If you read the guide later, check what changed after this date before you trust a status line.

## Core stack

| Package | Version | Notes |
|---|---|---|
| `@angular/core` and the framework packages | **22.2.1** | v22.0.0 shipped 2026-06-03. Active support until 2027-06, LTS until 2028-06. |
| `@angular/cli`, `@angular/build`, `@angular/ssr` | 22.2.1 | |
| `@angular/material`, `@angular/cdk` | 22.2.1 | |
| `typescript` | **6.0.x** (6.0.3) | Angular 22 requires `>=6.0 <6.1`. TypeScript **7.0.2** (the native Go port) is the npm `latest` tag, but Angular does **not** support it yet. The TypeScript module covers both. |
| `rxjs` | 7.8.2 | Angular's peer range is `^6.5.3 \|\| ^7.4.0`. The next major exists only as a `9.0.0-beta` on the `next` tag, so the guide teaches RxJS 7. |
| `zone.js` | 0.16.3 | Optional. New v22 projects do not install it. |
| `vitest` | 5.0.3 | The default runner in new CLI projects (`@angular/build:unit-test`, with `jsdom`). |
| Node.js (required by Angular 22) | `^22.22.3 \|\| ^24.15.0 \|\| ^26.0.0` | Odd-numbered Node releases are not supported. |
| ECMAScript | ES2026 (ECMA-262, 17th edition, approved 2026-06-30) | The JavaScript modules check which edition introduced each feature. |

## Ecosystem

| Package | Version | Package | Version |
|---|---|---|---|
| `@ngrx/store`, `@ngrx/signals`, `@ngrx/component-store` | 22.0.1 | `@ngxs/store` | 22.0.0 |
| `@tanstack/angular-query-experimental` | 5.104.1 (still published as *experimental*) | `@jsverse/transloco` | 8.4.0 |
| `@ngx-translate/core` | 18.0.0 | `zod` | 4.6.5 |
| `@playwright/test` | 1.63.0 | `cypress` | 16.1.1 |
| `jest` / `jest-preset-angular` | 30.5.2 / 17.0.1 | `karma` / `jasmine-core` | 6.4.4 / 7.0.2 |
| `@testing-library/angular` | 19.5.0 | `@analogjs/vitest-angular` | 2.8.0 |
| `@angular-eslint/eslint-plugin` | 22.5.0 | `storybook` | 10.6.1 |
| `nx` | 23.2.1 | `@angular-architects/native-federation` | 22.2.2 |
| `@module-federation/enhanced` | 2.9.2 | | |

## Backend (full-stack modules 41–44)

Java snippets are illustrative and **not compiled**, but they must be correct for these versions. Each module checks its snippets against the official reference docs (docs.spring.io) for these exact lines.

| Artifact | Version | How it was verified |
|---|---|---|
| Spring Boot | **4.1.1** (released 2026-08-20; 4.2 is at milestone 4.2.0-M2) | Maven Central `maven-metadata.xml`, latest GA |
| Spring Framework | 7.0.9 | `spring-framework.version` managed by `spring-boot-dependencies:4.1.1` |
| Spring Security | **7.1.1** | `spring-security.version` managed by `spring-boot-dependencies:4.1.1` |
| Jackson | 3.1.5 (Jackson 3, Maven group `tools.jackson`; a Jackson 2 BOM is also managed for compatibility) | `jackson-bom.version` (`tools.jackson:jackson-bom`) and `jackson-2-bom.version` in `spring-boot-dependencies:4.1.1` |
| Jakarta Validation / Hibernate Validator | 3.1.1 / 9.1.3.Final | managed by Boot 4.1.1 |
| springdoc-openapi (`springdoc-openapi-starter-webmvc-ui`) | 3.1.1 | Maven Central latest release |

## What a fresh `ng new` gives you (CLI 22.2.1, run 2026-10-03)

This was observed by actually generating a project, not read from documentation:

- Standalone components with no `standalone: true` flag (standalone has been the default since v19). Files are named `app.ts`, `app.html` and `app.css`, with no `.component` suffix.
- No `zone.js` dependency and no change-detection provider: the app is zoneless by default.
- No `changeDetection` property on the root component: since v22 that means OnPush.
- `app.config.ts` provides `provideBrowserGlobalErrorListeners()` and `provideRouter(routes)`.
- The builder is `@angular/build:application` (esbuild + Vite) and the test target is `@angular/build:unit-test` running Vitest with `jsdom`.
- `typescript ~6.0.2`. The tsconfig sets no `strict` flag, even with `ng new --strict`, because **TypeScript 6.0 enables `strict` by default**. Verified by running: `tsc` 6.0.3 on a config with no `strict` key still reports TS7006 (implicit `any`) and TS18048 (possibly `undefined`). The labs set `strict: true` explicitly anyway, for readers on TypeScript 5.x.
- No `strictTemplates` in `angularCompilerOptions`: it **defaults to `true`** in Angular 22 (doc comment on `strictTemplates` in `@angular/compiler-cli/.../public_options.d.ts`: "Defaults to `true`"). The generated tsconfig still has `experimentalDecorators: true`.
- `package.json` gets a `packageManager` field (`npm@11.19.0`, the npm bundled with Node 24.21.0).
- These observations come from `labs/angular`, generated 2026-10-03 with `npx @angular/cli@22.2.1 new labs --prefix lab --style css --routing --ssr=false --skip-git --ai-config none --test-runner vitest --strict` on Node 24.21.0.

## Status of the APIs interviewers ask about

| API / feature | Status in v22 | History |
|---|---|---|
| `signal`, `computed` | Stable | Developer preview in v16, stable in v17. |
| `effect`, `linkedSignal`, `resource`, `httpResource` | Stable | The roadmap lists all of them as production-ready. The Signals module checks the exact version each one graduated. |
| Signal Forms (`@angular/forms/signals`) | Stable / public API | Experimental in v21. In 22.0.0 the APIs "graduated to public API" with structural changes. |
| Zoneless change detection | Stable, and the **default** | Experimental in v18, developer preview in v20.0 (`provideZonelessChangeDetection`), stable in 20.2, default for new apps in v21. |
| Default change-detection strategy | **OnPush by default** | `ChangeDetectionStrategy.Eager` was added as an alias of `Default` in 21.2. Since 22.0 a component with no `changeDetection` is OnPush; use `Eager` to opt out. A migration adds `Eager` where needed. |
| `*ngIf`, `*ngFor`, `*ngSwitch` | Deprecated since v20 | Replaced by `@if`, `@for` and `@switch` (the built-in control flow is stable since v18). |
| `@angular/animations` | Deprecated since 20.2 | Replaced by native CSS plus `animate.enter` / `animate.leave`. v22 changed the leave-animation semantics. |
| Incremental hydration | Stable since v20 | |
| Event replay | Stable since v19 (`withEventReplay()`) | *(Unverified: whether new SSR projects enable it by default. To be checked against a generated SSR app in Module 32.)* |
| `HttpClient` transport | **Fetch is the default in v22** | `withFetch()` is deprecated (it can simply be removed). Use `provideHttpClient(withXhr())` to keep upload progress. `reportProgress` is deprecated in favor of `reportUploadProgress` and `reportDownloadProgress`. |
| `HttpClientModule` | Deprecated since v18 | Use `provideHttpClient()`. |
| Router `paramsInheritanceStrategy` | Defaults to `'always'` since v22 | It was `'emptyOnly'` before. |
| `provideRoutes()` | Removed in v22 | |
| `ComponentFactoryResolver` / `ComponentFactory` | Removed in v22 | Deprecated since v13. |
| HammerJS integration | Deprecated in v20, removed in v22 | |
| `@angular/platform-browser-dynamic` | Deprecated since v20 | |
| `afterRender` | Renamed to `afterEveryRender` in v20 | |
| `TestBed.get`, `InjectFlags` | Removed in v20 | |
| `ng-reflect-*` attributes | No longer emitted by default since v20 | |
| Webpack builders (`@angular-devkit/build-angular`, `@ngtools/webpack`) | Deprecated in CLI 22.0 | Use the `@angular/build` builders. |
| Vitest as the default runner | Default since v21 | Karma is still supported through the `unit-test` builder's `runner` option *(to confirm in the Testing module)*. The `refactor-jasmine-vitest` schematic is stable. |

## Version history matrix

The full AngularJS-to-v22 matrix lives in [Module 39](modules/39-version-history-and-migrations.md). This file only records what the guide is pinned to.
