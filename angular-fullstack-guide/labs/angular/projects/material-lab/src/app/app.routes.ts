import { MATERIAL_ANIMATIONS } from '@angular/material/core';
import { Routes } from '@angular/router';

// Module 36's routes (HOUSE-35). Append-only: each task adds its own lines under a comment naming it,
// with paths `m36/<slug>/…`.
export const M36_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./home/home').then((m) => m.LabMaterialHome) },
  // SEC-M36-01 (Material motion off: the page is not about motion)
  {
    path: 'm36/layers',
    providers: [{ provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } }],
    loadComponent: () => import('./m36/layers/layers').then((m) => m.LabM36Layers),
  },
  // SEC-M36-02 (the app page turns Material motion off; the motion page is about motion and sets no provider)
  {
    path: 'm36/material-app',
    providers: [{ provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } }],
    loadComponent: () => import('./m36/material-app/material-app').then((m) => m.LabM36MaterialApp),
  },
  {
    path: 'm36/material-app-motion',
    loadComponent: () => import('./m36/material-app-motion/material-app-motion').then((m) => m.LabM36MaterialAppMotion),
  },
  // SEC-M36-03 (Material motion off: the page is not about motion)
  {
    path: 'm36/theme',
    providers: [{ provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } }],
    loadComponent: () => import('./m36/theme/theme').then((m) => m.LabM36Theme),
  },
  // SEC-M36-04 (Material motion off: the page is not about motion)
  {
    path: 'm36/overrides',
    providers: [{ provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } }],
    loadComponent: () => import('./m36/overrides/overrides').then((m) => m.LabM36Overrides),
  },
  // SEC-M36-05 (Material motion off: the page is not about motion)
  {
    path: 'm36/overlay',
    providers: [{ provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } }],
    loadComponent: () => import('./m36/overlay/overlay').then((m) => m.LabM36Overlay),
  },
  // SEC-M36-06 (Material motion off: the page is not about motion)
  {
    path: 'm36/drag-drop',
    providers: [{ provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } }],
    loadComponent: () => import('./m36/drag-drop/drag-drop').then((m) => m.LabM36DragDrop),
  },
  // SEC-M36-08 (Material motion off: the page is not about motion)
  {
    path: 'm36/primitives',
    providers: [{ provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } }],
    loadComponent: () => import('./m36/primitives/primitives').then((m) => m.LabM36Primitives),
  },
  // SEC-M36-09 (Material motion off: the page is not about motion)
  {
    path: 'm36/a11y',
    providers: [{ provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } }],
    loadComponent: () => import('./m36/a11y/a11y').then((m) => m.LabM36A11y),
  },
  // SEC-M36-11 (Material motion off: the page is not about motion)
  {
    path: 'm36/aria',
    providers: [{ provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } }],
    loadComponent: () => import('./m36/aria/aria').then((m) => m.LabM36Aria),
  },
  // SEC-M36-13 (Material motion off: the page is not about motion)
  {
    path: 'm36/internals',
    providers: [{ provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } }],
    loadComponent: () => import('./m36/internals/internals').then((m) => m.LabM36Internals),
  },
  // EX-M36-01 (Material motion off: the page is not about motion)
  {
    path: 'm36/ex1/a',
    providers: [{ provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } }],
    loadComponent: () => import('./m36/exercise-1-theme/a/theme-a').then((m) => m.LabM36ThemeA),
  },
  {
    path: 'm36/ex1/b',
    providers: [{ provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } }],
    loadComponent: () => import('./m36/exercise-1-theme/b/theme-b').then((m) => m.LabM36ThemeB),
  },
  // EX-M36-02 (Material motion off: the page is not about motion)
  {
    path: 'm36/ex2/a',
    providers: [{ provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } }],
    loadComponent: () => import('./m36/exercise-2-select/a/select-a').then((m) => m.LabM36SelectA),
  },
  {
    path: 'm36/ex2/b',
    providers: [{ provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } }],
    loadComponent: () => import('./m36/exercise-2-select/b/select-b').then((m) => m.LabM36SelectB),
  },
  // EX-M36-03 (Material motion off: the page is not about motion)
  {
    path: 'm36/ex3/a',
    providers: [{ provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } }],
    loadComponent: () => import('./m36/exercise-3-kanban/a/board-a').then((m) => m.LabM36BoardA),
  },
  {
    path: 'm36/ex3/b',
    providers: [{ provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } }],
    loadComponent: () => import('./m36/exercise-3-kanban/b/board-b').then((m) => m.LabM36BoardB),
  },
  // QB-M36-02 (Material motion off: the pages are not about motion)
  {
    path: 'm36/outputs/q36-06',
    providers: [{ provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } }],
    loadComponent: () => import('./m36/outputs/q36-06').then((m) => m.LabM36Q06),
  },
  {
    path: 'm36/outputs/q36-10',
    providers: [{ provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } }],
    loadComponent: () => import('./m36/outputs/q36-10').then((m) => m.LabM36Q10),
  },
  // QB-M36-03 (Material motion off: the pages are not about motion)
  {
    path: 'm36/outputs/q36-12',
    providers: [{ provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } }],
    loadComponent: () => import('./m36/outputs/q36-12').then((m) => m.LabM36Q12),
  },
  {
    path: 'm36/outputs/q36-15',
    providers: [{ provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } }],
    loadComponent: () => import('./m36/outputs/q36-15').then((m) => m.LabM36Q15),
  },
];

export const routes = M36_ROUTES;
