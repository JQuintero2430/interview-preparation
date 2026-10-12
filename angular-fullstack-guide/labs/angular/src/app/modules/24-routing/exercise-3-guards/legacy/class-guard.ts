// LEGACY: a class guard, kept for Exercise 24.3. New code writes `requireLogin` as a function.
import { Injectable, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RedirectCommand,
  Router,
  RouterStateSnapshot,
  mapToCanActivate,
} from '@angular/router';
import { LabM24Session } from '../session';

/** Legacy: the class form of `requireLogin`. Replacement: the `requireLogin` function. */
@Injectable({ providedIn: 'root' })
export class LabM24LoginGuard implements CanActivate {
  private readonly session = inject(LabM24Session);
  private readonly router = inject(Router);

  canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): true | RedirectCommand {
    if (this.session.loggedIn()) {
      return true;
    }
    return new RedirectCommand(this.router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } }));
  }
}

/** Legacy: the class converted to a function by `mapToCanActivate` [Added in v16.0]. */
export const legacyLoginGuards = mapToCanActivate([LabM24LoginGuard]);
