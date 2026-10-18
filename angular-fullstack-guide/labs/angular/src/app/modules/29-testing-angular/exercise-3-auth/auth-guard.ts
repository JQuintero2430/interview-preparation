import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthState } from './auth-state';

export const authGuard: CanActivateFn = (_route, state) =>
  inject(AuthState).token() !== null ||
  inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
