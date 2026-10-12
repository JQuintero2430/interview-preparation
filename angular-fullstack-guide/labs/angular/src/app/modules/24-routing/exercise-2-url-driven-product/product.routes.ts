import { provideRouter, withComponentInputBinding, type Routes } from '@angular/router';
import { LabM24ProductShell } from './product-shell';
import { LabM24ProductTab } from './product-tab';

export const PRODUCT_ROUTES: Routes = [
  {
    path: 'products/:id',
    component: LabM24ProductShell,
    children: [{ path: ':tab', component: LabM24ProductTab }],
  },
];

export const provideProductRouter = (routes: Routes = PRODUCT_ROUTES) =>
  provideRouter(routes, withComponentInputBinding());
