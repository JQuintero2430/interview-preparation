import { Routes } from '@angular/router';
import { LabM24Editor } from './editor';
import { confirmLeave, hasRole, requireLogin } from './guards';
import {
  LabM24GuardsAdmin,
  LabM24GuardsCheckout,
  LabM24GuardsHome,
  LabM24GuardsLogin,
  LabM24GuardsNotFound,
} from './pages';

/** The admin area's loader calls; the spec reads `calls` to see whether the chunk would download. */
export interface LabM24LoaderCounter {
  calls: number;
}

/** The app's routes; `counter.calls` counts how often the admin routes are loaded. */
export function guardedRoutes(counter: LabM24LoaderCounter): Routes {
  return [
    { path: '', component: LabM24GuardsHome },
    { path: 'login', component: LabM24GuardsLogin },
    { path: 'checkout', canActivate: [requireLogin], component: LabM24GuardsCheckout },
    { path: 'editor', canDeactivate: [confirmLeave], component: LabM24Editor },
    {
      path: 'admin',
      canMatch: [hasRole('admin')],
      loadChildren: async () => {
        counter.calls++;
        return [{ path: '', component: LabM24GuardsAdmin }];
      },
    },
    { path: '**', component: LabM24GuardsNotFound },
  ];
}
