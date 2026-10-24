// Section 7 model: guards as UX. Our model, not a library's code. A guard decides which screen the router shows;
// the API still answers 401 or 403 for every request (module 33 section 10).
import { type CanActivateFn, type CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { LabM42AuthSession } from './auth-session';

const HOME = '/';
const LOGIN_ROUTE = '/login';
const RETURN_URL_PARAM = 'returnUrl';
// Only the origin of this placeholder matters: a target that the URL parser moves to another origin is not ours.
const PLACEHOLDER_ORIGIN = 'https://lab.invalid';

/**
 * The path, query and fragment of `raw` when it stays on our origin; otherwise the home path.
 * @param raw - The untrusted `returnUrl` value, or null when the parameter is absent.
 */
export function safeReturnUrl(raw: string | null): string {
  if (raw === null) return HOME;
  try {
    const url = new URL(raw, PLACEHOLDER_ORIGIN);
    return url.origin === PLACEHOLDER_ORIGIN ? `${url.pathname}${url.search}${url.hash}` : HOME;
  } catch {
    return HOME;
  }
}

/** A `canMatch` guard: signed-out visitors go to our /login route, carrying the URL they asked for. */
export const requireSession: CanMatchFn = () => {
  const session = inject(LabM42AuthSession);
  const router = inject(Router);
  if (session.signedIn()) return true;
  const requested = router.currentNavigation()?.extractedUrl;
  const returnUrl = requested ? router.serializeUrl(requested) : HOME;
  return router.createUrlTree([LOGIN_ROUTE], { queryParams: { [RETURN_URL_PARAM]: returnUrl } });
};

/** A `canActivate` guard for the /login route: a signed-in visitor goes on to the safe version of `returnUrl`. */
export const skipLoginWhenSignedIn: CanActivateFn = (route) => {
  const session = inject(LabM42AuthSession);
  const router = inject(Router);
  return session.signedIn()
    ? router.parseUrl(safeReturnUrl(route.queryParamMap.get(RETURN_URL_PARAM)))
    : true;
};
