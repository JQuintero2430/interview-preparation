import { Component, DOCUMENT, InjectionToken, Provider, inject } from '@angular/core';
import { Router, Routes } from '@angular/router';

/** Hands a URL to the old application (in production: a full page load). */
export interface LabM39LegacyNavigator {
  handOff(url: string): void;
}

export const LEGACY_NAVIGATOR = new InjectionToken<LabM39LegacyNavigator>('LEGACY_NAVIGATOR');

/** Rendered for every path the Angular app does not own yet. */
@Component({
  selector: 'lab-m39-legacy-handoff',
  template: `<p>Opening the previous version of this page…</p>`,
})
export class LabM39LegacyHandoff {
  constructor() {
    inject(LEGACY_NAVIGATOR).handOff(inject(Router).url);
  }
}

/** The routing half of a strangler fig: migrated paths in Angular, the rest handed off. */
export const labM39StranglerRoutes: Routes = [
  {
    path: 'orders',
    loadComponent: () =>
      import('../migrated/order-list-page').then((m) => m.LabM39OrderListPage),
  },
  {
    path: 'orders/:id',
    loadComponent: () =>
      import('../migrated/order-detail-page').then((m) => m.LabM39OrderDetailPage),
  },
  { path: '**', component: LabM39LegacyHandoff },
];

/** Production provider (not used by the tests): load the URL as a new document. */
export function provideLabM39BrowserNavigator(): Provider {
  return {
    provide: LEGACY_NAVIGATOR,
    useFactory: (): LabM39LegacyNavigator => {
      const location = inject(DOCUMENT).location;
      return { handOff: (url) => location.assign(url) };
    },
  };
}
