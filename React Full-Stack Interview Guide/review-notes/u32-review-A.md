# U32 review A (modules 01-14, README)

## Claims
04-html-css-accessibility.md:113 | confirmed | ARIA 1.2 Rec June 2023; 1.3 is a Working Draft (4 Jun 2026) | https://www.w3.org/TR/wai-aria-1.3/
04-html-css-accessibility.md:159 | corrected | React 19 inert support confirmed; added that inert="" now means false in 19; React 18 types part dropped as moot | https://github.com/facebook/react/pull/24730
04-html-css-accessibility.md:163 | corrected | completed list: 9 new SC (added 2.4.12, 2.4.13, 3.2.6, 3.3.9); Rec 5 Oct 2023 | https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/
04-html-css-accessibility.md:220 | confirmed | :focus-visible Baseline March 2022 | https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible
04-html-css-accessibility.md:258 | confirmed | Preflight selectors and CssBaseline html+inherit | https://tailwindcss.com/docs/preflight ; https://mui.com/material-ui/react-css-baseline/
04-html-css-accessibility.md:263 | confirmed | dvh/svh/lvh Baseline Dec 2022, widely Jun 2025 | https://web-platform-dx.github.io/web-features-explorer/features/viewport-unit-variants/
04-html-css-accessibility.md:332 | confirmed | layers theme, base, components, utilities | https://tailwindcss.com/docs/preflight
04-html-css-accessibility.md:336 | confirmed | @scope Baseline newly available Mar 2026 | https://web-platform-dx.github.io/web-features-explorer/features/scope/
04-html-css-accessibility.md:384 | confirmed | flex gap Baseline Apr 2021, widely Oct 2023 | https://web-platform-dx.github.io/web-features-explorer/features/flexbox-gap/
04-html-css-accessibility.md:432 | confirmed | subgrid Sept 2023 | https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Subgrid
04-html-css-accessibility.md:499 | confirmed | container-type size/inline-size creates stacking context | https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Stacking_context
04-html-css-accessibility.md:553 | confirmed | range syntax Baseline Mar 2023 (recall said 2023) | https://web-platform-dx.github.io/web-features-explorer/features/media-query-range-syntax/
04-html-css-accessibility.md:554a | confirmed | size container queries Feb 2023 | https://web-platform-dx.github.io/web-features-explorer/features/container-queries/
04-html-css-accessibility.md:554b | confirmed | style queries newly available May 2026 (Firefox 151) | https://web-platform-dx.github.io/web-features-explorer/features/container-style-queries/
04-html-css-accessibility.md:610 | confirmed | @property Baseline July 2024 | https://web-platform-dx.github.io/web-features-explorer/features/registered-custom-properties/
04-html-css-accessibility.md:612 | confirmed | nesting Baseline Dec 2023, widely Jun 2026 | https://web-platform-dx.github.io/web-features-explorer/features/nesting/
04-html-css-accessibility.md:614 | confirmed | per-feature status from web-features (color-mix, oklch, light-dark, starting-style, text-wrap balance, aspect-ratio, popover, view-transitions) | https://web-platform-dx.github.io/web-features-explorer/
04-html-css-accessibility.md:694a | corrected | maintenance-mode source was mislinked (discussion 5657 is a 2026 thread); now links the 2025-03-17 "Thank you" update; RSC-setup claim confirmed by maintainer | https://opencollective.com/styled-components/updates/thank-you ; https://opencollective.com/styled-components/updates/a-whole-new-world
04-html-css-accessibility.md:694b | kept | Emotion maintenance status; points to releases page | https://github.com/emotion-js/emotion/releases
04-html-css-accessibility.md:696 | kept | Pigment opt-in in v6 added with source; current state of each zero-runtime lib kept Unverified | https://mui.com/material-ui/migration/upgrade-to-v6/
04-html-css-accessibility.md:752 | confirmed | shadcn CLI initializes Tailwind v4; Radix primitives | https://ui.shadcn.com/docs/tailwind-v4
04-html-css-accessibility.md:753 | confirmed | MUI v5 Emotion, v6 CSS vars/Pigment, v7 exports/removals | https://mui.com/material-ui/migration/upgrade-to-v7/
04-html-css-accessibility.md:754 | confirmed | Base UI from Radix/MUI/Floating UI teams, MUI org, 1.x | https://base-ui.com/react/overview/about
04-html-css-accessibility.md:1086 | kept | height-animation recipe; marker now names what to check | -
04-html-css-accessibility.md:1556 | confirmed | dvh Baseline Dec 2022 | https://web-platform-dx.github.io/web-features-explorer/features/viewport-unit-variants/
04-html-css-accessibility.md:1574,1579 | confirmed | table cells now cite the verified dates in 4.9/4.10 | (see above)
01-javascript.md:475 | confirmed | require(esm) unflagged 22.12/20.19, stable 25.4; no TLA | https://nodejs.org/api/modules.html#loading-ecmascript-modules-using-require
01-javascript.md:642 | confirmed | scheduler.yield Chrome 129+, Firefox 142+, no Safari | https://web-platform-dx.github.io/web-features-explorer/features/scheduler/
01-javascript.md:658 | confirmed | using: Chrome 134+, Firefox 141+, no Safari | https://web-platform-dx.github.io/web-features-explorer/features/explicit-resource-management/
01-javascript.md:735 | confirmed | structuredClone Node v17.0.0 | https://nodejs.org/api/globals.html
01-javascript.md:2036 | confirmed | V8 7.2 / Chrome 72 + spec change | https://v8.dev/blog/fast-async
01-javascript.md:2038 | corrected | "Node 12+ stable" -> unflagged 13.2/12.17, stable 15.3/14.17/12.22 | https://nodejs.org/api/esm.html
02-typescript.md:694 | confirmed | z.string().email() deprecated in Zod 4 (docs + @deprecated in 4.6.5 d.ts) | https://zod.dev/v4/changelog
02-typescript.md:707 | confirmed (part) / kept (part) | Zod implements Standard Schema (grep of zod 4.6.5; resolvers 5.9.1 has standard-schema resolver); which other libs accept it kept Unverified | https://standardschema.dev/
02-typescript.md:729+749 | confirmed | variance annotations in TS 4.7; Unverified note removed, table cell updated | https://devblogs.microsoft.com/typescript/announcing-typescript-4-7/
02-typescript.md:753 | kept | typescript-eslint TS7 blocker; added the issue to check | https://github.com/typescript-eslint/typescript-eslint/issues/12518
03-browser-and-web-platform.md:109 | corrected | (task 2) passive default: touch Chrome 56, but wheel was Chrome 73 | https://developer.chrome.com/blog/scrolling-intervention-2
03-browser-and-web-platform.md:111 | corrected->kept | (task 2) spec order confirmed (DOM dispatch); "Chrome 89" could not be confirmed, chromestatus says no active development -> now an Unverified marker | https://chromestatus.com/feature/5892189387227136 ; https://dom.spec.whatwg.org/#concept-event-dispatch
03-browser-and-web-platform.md:280 | confirmed | (task 2) 400-day cookie cap, Chrome 104 | https://developer.chrome.com/blog/cookie-max-age-expires
03-browser-and-web-platform.md:287 | confirmed | (task 2) Lax by default Chrome 80 | https://www.chromium.org/updates/same-site/
03-browser-and-web-platform.md:292 | confirmed | Safari 7-day cap on script-writable storage (2020 policy) | https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/
03-browser-and-web-platform.md:293 | confirmed | (task 2) third-party cookie status now from primary sources (April + October 2025 Privacy Sandbox posts, MDN) | https://privacysandbox.google.com/blog/update-on-plans-for-privacy-sandbox-technologies
03-browser-and-web-platform.md:295 | kept | narrowed to: Chrome versions that remove retired APIs | https://privacysandbox.google.com/overview/status
03-browser-and-web-platform.md:347 | corrected | (task 2) AbortSignal.timeout "widely available since 2022" -> Baseline Apr 2024; AbortSignal.any versions confirmed + Firefox/Safari added | https://web-platform-dx.github.io/web-features-explorer/features/abortsignal-any/
03-browser-and-web-platform.md:348 | kept | Node AbortSignal.timeout vs fake timers; Vitest docs silent | https://vitest.dev/config/faketimers
03-browser-and-web-platform.md:463 | confirmed | Trusted Types Chrome 83, Safari Sep 2025, Firefox Feb 2026, Baseline 2026-02-24 | https://web-platform-dx.github.io/web-features-explorer/features/trusted-types/
03-browser-and-web-platform.md:466 | confirmed | Lax+POST 2-minute temporary intervention | https://www.chromium.org/updates/same-site/
03-browser-and-web-platform.md:579 | kept | workbox-build basis confirmed; "default recommendation" not confirmable | https://vite-pwa-org.netlify.app/guide/
03-browser-and-web-platform.md:580 | confirmed | AppCache Chrome 85 / Oct 2021; Firefox 2019 Beta/Nightly | https://web.dev/articles/appcache-removal
03-browser-and-web-platform.md:622 | confirmed | (task 2) CLS session window 1 s / 5 s; 500 ms discrete input | https://web.dev/articles/cls
03-browser-and-web-platform.md:726 | corrected | scheduler.yield is not Chromium-only: Firefox 142+ too | https://web-platform-dx.github.io/web-features-explorer/features/scheduler/
03-browser-and-web-platform.md:1057 | confirmed | Q46 now points to sources in 3.5 | (as 293)
03-browser-and-web-platform.md:1500 | confirmed | (task 2) preflight caps Chromium 2h (v76+), Firefox 24h, default 5s | https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Access-Control-Max-Age
03-browser-and-web-platform.md:1510 | confirmed | AppCache versions | https://web.dev/articles/appcache-removal
03-browser-and-web-platform.md:1511 | confirmed | primary sources replace secondary | https://privacysandbox.google.com/blog/privacy-sandbox-next-steps
05-tooling-and-setup.md:56 | confirmed | Corepack reads packageManager; bundled Node 14.19 to <25 | https://github.com/nodejs/corepack
05-tooling-and-setup.md:125 | confirmed | autoInstallPeers true, strictPeerDependencies false | https://pnpm.io/settings/peer-dependencies
05-tooling-and-setup.md:200 | confirmed | one rule; presets recommended/vite/next | https://github.com/ArnaudBarre/eslint-plugin-react-refresh
05-tooling-and-setup.md:204 | confirmed | Vite 8 dev still native ESM; full bundle mode only explored | https://vite.dev/guide/why
05-tooling-and-setup.md:331 | confirmed | TS 6.0 does not default isolatedModules/erasableSyntaxOnly | https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/
05-tooling-and-setup.md:332 | confirmed | build.target 'baseline-widely-available' = chrome111/edge111/firefox114/safari16.4 | https://vite.dev/config/build-options
05-tooling-and-setup.md:337 | confirmed | Babel 7.9 / CRA 4 / TS 4.1; added 16.14 backport | https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html
05-tooling-and-setup.md:418-420 | corrected | flat config arrived in react-hooks 5.2.0 (not 5.0); 6.0.0 deprecated, 6.1.0 made flat default (note: VERSIONS.md "since v6" is loosely right) | https://github.com/facebook/react/blob/main/packages/eslint-plugin-react-hooks/CHANGELOG.md
05-tooling-and-setup.md:468 | confirmed | existing env vars beat .env files | https://vite.dev/guide/env-and-mode
05-tooling-and-setup.md:473 | confirmed | NEXT_PUBLIC_ inlined/frozen; runtime via server dynamic rendering | https://nextjs.org/docs/app/guides/environment-variables
05-tooling-and-setup.md:510 | confirmed | create-next-app flags; create-react-router | https://nextjs.org/docs/app/api-reference/cli/create-next-app
05-tooling-and-setup.md:563 | kept | Nx docs fetch timed out | -
05-tooling-and-setup.md:601 | confirmed | sourcemap default false; boolean|'inline'|'hidden' | https://vite.dev/config/build-options
05-tooling-and-setup.md:671 | confirmed | import/no-extraneous-dependencies | https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-extraneous-dependencies.md
05-tooling-and-setup.md:750 | confirmed | build.target docs don't use browserslist | https://vite.dev/config/build-options
05-tooling-and-setup.md:983 | kept | tsconfigPaths + references not documented | https://vite.dev/config/shared-options
05-tooling-and-setup.md:988 | confirmed | baseUrl deprecated 6.0, removed 7.0 | https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/
05-tooling-and-setup.md:1123 | kept | exact React 19 TypeError wording needs a run | -
05-tooling-and-setup.md:1252 | kept | npm ls --json node shape needs a run | -
06-jsx-and-rendering-model.md:318 | corrected | Babel 7.0.0-beta.31 (not "Babel 7"), TS 2.6.2, Flow 0.59, Prettier 1.9 | https://legacy.reactjs.org/blog/2017/11/28/react-v16.2.0-fragment-support.html
06-jsx-and-rendering-model.md:361 | kept | react-hooks/globals on the exact snippet needs an ESLint run | -
06-jsx-and-rendering-model.md:598 | confirmed | npx codemod@latest react/19/migration-recipe | https://react.dev/blog/2024/04/25/react-19-upgrade-guide
06-jsx-and-rendering-model.md:1155 | kept | cross-reference to the 6.8 note (still Unverified) | -
07-components-props-composition.md:242 | kept | Medium returned 403; only secondary sources quote the 2019 update note | -
08-state.md:515 | confirmed | @types/react 18 useReducer signature (failure on 19 types derived, not compiled) | https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react/v18/index.d.ts
10-refs-and-dom.md:58 | kept | react-hooks/refs vs lazy init needs an ESLint run | -
10-refs-and-dom.md:122 | confirmed | grep react-dom 19.3.0: setProp skips autoFocus; commitMount calls focus() | examples/web/node_modules/react-dom/cjs/react-dom-client.development.js
10-refs-and-dom.md:764 | confirmed (read from source, not run) | Activity -> Offscreen -> disappearLayoutEffects -> safelyDetachRef | examples/web/node_modules/react-dom/cjs/react-dom-client.development.js
11-context.md:141 | confirmed | react/19/remove-context-provider codemod exists | https://github.com/reactjs/react-codemod
11-context.md:258 | kept | Compiler memoizing inline context value needs playground/compiler run | -
11-context.md:384 | confirmed | 19.3 warning is about conditional use(promise) | https://github.com/facebook/react/pull/37104
11-context.md:433 | kept | serializability of context value from RSC: general rule linked, specific case untested | https://react.dev/reference/rsc/use-client
12-hooks-and-custom-hooks.md:164 | kept | needs an ESLint run | -
12-hooks-and-custom-hooks.md:405 | confirmed | MediaQueryList change event Baseline Sept 2020 (Safari 14) | https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList/change_event
12-hooks-and-custom-hooks.md:638 | confirmed | useOpaqueIdentifier experimental-only, renamed useId for 18 | https://github.com/reactwg/react-18/discussions/111
13-reconciliation-and-fiber.md:410 | confirmed (read from source) | prepareFreshStack when root or lanes differ | examples/web/node_modules/react-dom/cjs/react-dom-client.development.js
13-reconciliation-and-fiber.md:649 | confirmed | codemod CLI list from React 19 upgrade guide | https://react.dev/blog/2024/04/25/react-19-upgrade-guide
14-forms-and-actions.md:212 | kept | Formik re-render scope needs Profiler measurement; FastField docs don't state it | https://formik.org/docs/api/fastfield

## Floors (counted by grep)
All modules 01-14 meet the floors. Q / exercises / gotchas / mermaid:
01 40/10/26/1 · 02 36/5/23/1 · 03 46/4/22/3 · 04 35/5/22/3 · 05 35/4/22/2 · 06 40/4/19/2 · 07 34/4/16/2 · 08 34/5/18/3 · 09 33/5/16/3 · 10 36/5/18/2 · 11 36/5/17/2 · 12 36/7/17/2 · 13 34/4/18/4 · 14 35/6/20/3.
Modules 06-14 each have at least one "Predict the output" exercise (06 Ex4, 07 Ex4, 08 Ex4+5, 09 Ex5, 10 Ex5, 11 Ex4, 12 Ex7, 13 Ex1+4, 14 Ex5). 06-14 all reach 30+ questions.

## README
- All 33 distinct .md links (with anchors) resolve to existing files/headings (scripted check of GitHub-style anchors).
- Outline section numbers 1.x-14.x all exist as `## N.M` headings and titles match (aside-stripped).
- Study plans reference only existing modules/sections (26 has 18 exercises; 25 has worked designs).
- Fixed: 0.4 Origin tags lacked `[Protocol: …]`, `[System design]`, `[Interview]` from STYLE.md (prose only).

## Reported only (not edited)
- VERSIONS.md says react-hooks "flat config is the default recommended preset since v6"; CHANGELOG says 6.0.0 was an accidental, deprecated publish and 6.1.0 made the change; flat-config support first arrived in 5.2.0. (05 prose corrected; VERSIONS.md is outside my files.)
- No code block or test issues found in the passages read.
- 04:159 React 19 turns the old `inert=""` workaround OFF (empty string = false); worth a gotcha in 04/10 if not already there.
