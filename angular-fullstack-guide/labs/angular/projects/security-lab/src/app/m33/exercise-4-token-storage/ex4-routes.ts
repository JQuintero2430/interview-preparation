import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { Routes } from '@angular/router';
import { LAB_M33_EX4_API, LabM33Ex4Auth, LabM33Ex4BffAuth, LabM33Ex4MemoryAuth } from './auth-store';
import { labM33Ex4BearerInterceptor } from './bearer-interceptor';
import { LabM33Ex4DataPage } from './data-page';

/**
 * Exercise 33.4: the same page over two session designs, chosen by route-level providers.
 * server/security/ex4-tokens-a.mjs (solution) and ex4-tokens-b.mjs (alternative) answer under `/api/m33/ex4/a/` and `/b/`.
 */
export const M33_EX4_ROUTES: Routes = [
  {
    path: 'a',
    component: LabM33Ex4DataPage,
    providers: [
      { provide: LAB_M33_EX4_API, useValue: '/api/m33/ex4/a/' },
      LabM33Ex4MemoryAuth,
      { provide: LabM33Ex4Auth, useExisting: LabM33Ex4MemoryAuth },
      // A route-level client, so only this route's requests pass through the interceptor.
      provideHttpClient(withInterceptors([labM33Ex4BearerInterceptor])),
    ],
  },
  {
    path: 'b',
    component: LabM33Ex4DataPage,
    providers: [
      { provide: LAB_M33_EX4_API, useValue: '/api/m33/ex4/b/' },
      { provide: LabM33Ex4Auth, useClass: LabM33Ex4BffAuth },
    ],
  },
];
