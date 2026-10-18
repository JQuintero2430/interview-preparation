import { ANIMATION_MODULE_TYPE, inject, type Type } from '@angular/core';
import { Routes } from '@angular/router';
import { SHORT_TIMEOUT_PROVIDERS } from './m35/callbacks/short-timeout';

// Module 35's routes (HOUSE-33). Append-only: each task adds its own lines under a comment naming it,
// with paths `m35/<slug>/…`.
export const M35_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./home/home').then((m) => m.LabMotionHome) },
  // SEC-M35-01
  {
    path: 'm35/mechanisms',
    loadComponent: () => import('./m35/mechanisms/mechanisms').then((m) => m.LabM35Mechanisms),
  },
  // SEC-M35-02
  {
    path: 'm35/transitions',
    loadComponent: () => import('./m35/transitions/transitions').then((m) => m.LabM35Transitions),
  },
  // SEC-M35-03
  {
    path: 'm35/keyframes',
    loadComponent: () => import('./m35/keyframes/keyframes').then((m) => m.LabM35Keyframes),
  },
  // SEC-M35-04
  {
    path: 'm35/waapi',
    loadComponent: () => import('./m35/waapi/waapi').then((m) => m.LabM35Waapi),
  },
  // SEC-M35-05
  {
    path: 'm35/enter-leave',
    loadComponent: () => import('./m35/enter-leave/enter-leave').then((m) => m.LabM35EnterLeave),
  },
  // SEC-M35-06
  {
    path: 'm35/callbacks',
    loadComponent: () => import('./m35/callbacks/callbacks').then((m) => m.LabM35Callbacks),
  },
  {
    path: 'm35/callbacks/short-timeout',
    providers: SHORT_TIMEOUT_PROVIDERS,
    loadComponent: () => import('./m35/callbacks/callbacks').then((m) => m.LabM35Callbacks),
  },
  // SEC-M35-07
  {
    path: 'm35/lists',
    loadComponent: () => import('./m35/lists/lists').then((m) => m.LabM35Lists),
  },
  // SEC-M35-08 (served by the legacy build only: its main.legacy.ts provides the animation engine)
  {
    path: 'm35/legacy',
    loadComponent: () => import('./m35/legacy/legacy').then((m) => m.LabM35Legacy),
  },
  // SEC-M35-09 (one URL, two panels: the legacy build, which provides an animation module type, gets the trigger version)
  {
    path: 'm35/migration',
    loadComponent: (): Promise<Type<unknown>> =>
      inject(ANIMATION_MODULE_TYPE, { optional: true })
        ? import('./m35/migration/legacy-panel').then((m) => m.LabM35MigrationLegacy)
        : import('./m35/migration/migration').then((m) => m.LabM35Migration),
  },
  // SEC-M35-10 (the filtered route loads the list page with data that makes the router hook skip the transition)
  {
    path: 'm35/vt/list',
    loadComponent: () => import('./m35/vt/list').then((m) => m.LabM35VtList),
  },
  {
    path: 'm35/vt/filtered',
    data: { skipViewTransition: true },
    loadComponent: () => import('./m35/vt/list').then((m) => m.LabM35VtList),
  },
  {
    path: 'm35/vt/item/:id',
    loadComponent: () => import('./m35/vt/item').then((m) => m.LabM35VtItem),
  },
  // SEC-M35-11
  {
    path: 'm35/motion',
    loadComponent: () => import('./m35/motion/motion').then((m) => m.LabM35Motion),
  },
  // SEC-M35-12
  {
    path: 'm35/internals',
    loadComponent: () => import('./m35/internals/internals').then((m) => m.LabM35Internals),
  },
  // QB-M35-01 (output pages: one route per Output question)
  {
    path: 'm35/outputs/q35-02',
    loadComponent: () => import('./m35/outputs/q35-02').then((m) => m.LabM35Q3502),
  },
  // QB-M35-02
  {
    path: 'm35/outputs/q35-06',
    loadComponent: () => import('./m35/outputs/q35-06').then((m) => m.LabM35Q3506),
  },
  {
    path: 'm35/outputs/q35-08',
    loadComponent: () => import('./m35/outputs/q35-08').then((m) => m.LabM35Q3508),
  },
  {
    path: 'm35/outputs/q35-10',
    loadComponent: () => import('./m35/outputs/q35-10').then((m) => m.LabM35Q3510),
  },
  // QB-M35-03
  {
    path: 'm35/outputs/q35-13',
    loadComponent: () => import('./m35/outputs/q35-13').then((m) => m.LabM35Q3513),
  },
  // QB-M35-04
  {
    path: 'm35/outputs/q35-20',
    loadComponent: () => import('./m35/outputs/q35-20').then((m) => m.LabM35Q3520),
  },
  {
    path: 'm35/outputs/q35-20/detail',
    loadComponent: () => import('./m35/outputs/q35-20').then((m) => m.LabM35Q3520Detail),
  },
  {
    path: 'm35/outputs/q35-20/skipped',
    data: { skipViewTransition: true },
    loadComponent: () => import('./m35/outputs/q35-20').then((m) => m.LabM35Q3520Detail),
  },
  // EX-M35-01
  {
    path: 'm35/ex1/a',
    loadComponent: () => import('./m35/exercise-1-toasts/a/toasts-a').then((m) => m.LabM35ToastsA),
  },
  {
    path: 'm35/ex1/b',
    loadComponent: () => import('./m35/exercise-1-toasts/b/toasts-b').then((m) => m.LabM35ToastsB),
  },
  // EX-M35-02
  {
    path: 'm35/ex2/a',
    loadComponent: () =>
      import('./m35/exercise-2-disclosure/a/disclosure-a').then((m) => m.LabM35DisclosureA),
  },
  {
    path: 'm35/ex2/b',
    loadComponent: () =>
      import('./m35/exercise-2-disclosure/b/disclosure-b').then((m) => m.LabM35DisclosureB),
  },
  // EX-M35-03 (before is served by the legacy build only: its main.legacy.ts provides the animation engine)
  {
    path: 'm35/ex3/before',
    loadComponent: () =>
      import('./m35/exercise-3-stagger/before/stagger-before').then((m) => m.LabM35StaggerBefore),
  },
  {
    path: 'm35/ex3/a',
    loadComponent: () =>
      import('./m35/exercise-3-stagger/a/stagger-a').then((m) => m.LabM35StaggerA),
  },
  {
    path: 'm35/ex3/b',
    loadComponent: () =>
      import('./m35/exercise-3-stagger/b/stagger-b').then((m) => m.LabM35StaggerB),
  },
  // EX-M35-04 (each variant: the list, the same list under /filtered with data that makes the router hook skip the
  // transition, and the shared detail page)
  ...(['a', 'b'] as const).flatMap((variant): Routes => {
    const base = `/m35/ex4/${variant}`;
    const list = (): Promise<Type<unknown>> =>
      variant === 'a'
        ? import('./m35/exercise-4-shared-element/a/products-a').then((m) => m.LabM35Ex4ProductsA)
        : import('./m35/exercise-4-shared-element/b/products-b').then((m) => m.LabM35Ex4ProductsB);
    return [
      { path: base.slice(1), loadComponent: list },
      {
        path: `${base.slice(1)}/filtered`,
        data: { skipViewTransition: true },
        loadComponent: list,
      },
      {
        path: `${base.slice(1)}/product/:id`,
        data: { base },
        loadComponent: () =>
          import('./m35/exercise-4-shared-element/detail').then((m) => m.LabM35Ex4Detail),
      },
    ];
  }),
];

export const routes = M35_ROUTES;
