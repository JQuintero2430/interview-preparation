// Exercise 42.3: one login entry, our /login route, for the guard and the 401 interceptor alike. Guards are UX: the
// API still answers 401 or 403 for every request (module 33 section 10).
import { inject } from '@angular/core';
import { type CanActivateFn, type CanMatchFn, Router, type UrlTree } from '@angular/router';
import { safeReturnUrl } from '../concepts/auth.guard';
import { Session } from './session';

export const LOGIN_ROUTE = '/login';
const RETURN_URL = 'returnUrl';
const HOME = '/';

/**
 * The login entry, carrying where to go back to.
 * @param router - The application's router, which builds the tree.
 * @param returnUrl - The URL the visitor asked for, as the router serialized it.
 */
export function loginTree(router: Router, returnUrl: string): UrlTree {
  return router.createUrlTree([LOGIN_ROUTE], { queryParams: { [RETURN_URL]: returnUrl } });
}

/** A `canMatch` guard that waits for the session before the router matches the route. */
export const requireSession: CanMatchFn = async () => {
  const session = inject(Session);
  const router = inject(Router);
  // Read before the await: inject() and the current navigation belong to this synchronous call.
  const requested = router.currentNavigation()?.extractedUrl;
  await session.whenKnown();
  if (session.state().status === 'signed-in') return true;
  return loginTree(router, requested ? router.serializeUrl(requested) : HOME);
};

/** A `canActivate` guard for /login: a signed-in visitor goes on to the same-origin path of `returnUrl`, or home. */
export const leaveLoginWhenSignedIn: CanActivateFn = async (route) => {
  const session = inject(Session);
  const router = inject(Router);
  await session.whenKnown();
  if (session.state().status !== 'signed-in') return true;
  return router.parseUrl(safeReturnUrl(route.queryParamMap.get(RETURN_URL)));
};
