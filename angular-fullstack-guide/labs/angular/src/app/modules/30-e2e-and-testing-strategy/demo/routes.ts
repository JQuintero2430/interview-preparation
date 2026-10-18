import { provideHttpClient } from '@angular/common/http';
import { Routes } from '@angular/router';
import { LabM30TodosApi } from './todos-api';
import { LabM30TodosPage } from './todos-page';

/** Route-level providers keep `app.config.ts` untouched. */
export const M30_ROUTES: Routes = [
  {
    path: '',
    providers: [provideHttpClient(), LabM30TodosApi],
    children: [{ path: 'todos', component: LabM30TodosPage }],
  },
];
