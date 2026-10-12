import { inject } from '@angular/core';
import {
  CanActivateFn,
  CanDeactivateFn,
  CanMatchFn,
  RedirectCommand,
  Router,
} from '@angular/router';
import type { LabM24HasUnsavedChanges } from './editor';
import { LAB_M24_CONFIRM, LabM24Role, LabM24Session } from './session';

/** A `canMatch` factory: the route only matches for this role. */
export const hasRole =
  (role: LabM24Role): CanMatchFn =>
  () =>
    inject(LabM24Session).role() === role;

/** Alternative: one guard for every route, reading the role from `route.data`. */
export const hasRoleFromData: CanMatchFn = (route) =>
  inject(LabM24Session).role() === route.data?.['role'];

/** Sends a logged-out user to `/login`, remembering where they wanted to go. */
export const requireLogin: CanActivateFn = (_route, state) => {
  if (inject(LabM24Session).loggedIn()) {
    return true;
  }
  const login = inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  return new RedirectCommand(login);
};

/** Asks before leaving a component that reports unsaved changes. */
export const confirmLeave: CanDeactivateFn<LabM24HasUnsavedChanges> = (component) =>
  !component.dirty() || inject(LAB_M24_CONFIRM)('Discard unsaved changes?');
