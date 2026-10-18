import { Routes } from '@angular/router';
import { LAB_M33_EX2_WIDGET, LabM33Ex2Page } from './locked-page';
import { LabM33Ex2WidgetPolicy } from './widget-policy';

/**
 * Exercise 33.2: one page, three widgets, chosen by route-level providers. server/security/ex2-locked-page.mjs
 * sends each path with its policy: `start` (the legacy widget) and `a` (solution) allow only `angular`;
 * `b` (alternative) also allows the widget's own policy name.
 */
export const M33_EX2_ROUTES: Routes = [
  {
    path: 'start',
    component: LabM33Ex2Page,
    providers: [{ provide: LAB_M33_EX2_WIDGET, useValue: 'legacy' }],
  },
  {
    path: 'a',
    component: LabM33Ex2Page,
    providers: [{ provide: LAB_M33_EX2_WIDGET, useValue: 'bound' }],
  },
  {
    path: 'b',
    component: LabM33Ex2Page,
    providers: [{ provide: LAB_M33_EX2_WIDGET, useValue: 'policy' }, LabM33Ex2WidgetPolicy],
  },
];
