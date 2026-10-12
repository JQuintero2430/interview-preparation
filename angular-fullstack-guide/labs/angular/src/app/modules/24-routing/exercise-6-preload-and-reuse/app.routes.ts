import { Routes } from '@angular/router';
import { LabM24DetailPage, LabM24HomePage, LabM24ListPage, LabM24ListState } from './list-page';

/** How often each lazy route's loader ran; the spec reads it to see what was preloaded. */
export interface LabM24LoaderCounts {
  reports: number;
  settings: number;
}

/** The app's routes: two lazy routes (only `reports` is flagged to preload), two keep-alive lists and one plain list. */
export function previewRoutes(counts: LabM24LoaderCounts): Routes {
  return [
    { path: '', component: LabM24HomePage },
    {
      path: 'reports',
      data: { preload: true },
      loadChildren: async () => {
        counts.reports++;
        return [{ path: '', component: LabM24HomePage }];
      },
    },
    {
      path: 'settings',
      loadChildren: async () => {
        counts.settings++;
        return [{ path: '', component: LabM24HomePage }];
      },
    },
    { path: 'list', data: { keepAlive: true }, providers: [LabM24ListState], component: LabM24ListPage },
    { path: 'archive', data: { keepAlive: true }, providers: [LabM24ListState], component: LabM24ListPage },
    { path: 'recent', providers: [LabM24ListState], component: LabM24ListPage },
    { path: 'detail/:id', component: LabM24DetailPage },
  ];
}
