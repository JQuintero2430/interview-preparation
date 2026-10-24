// Exercise 42.3: a 401 in the middle of a session sends the visitor to the login entry once, with the page they were on.
import { type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { LAB_M42_EXPECT_401, isUnauthorized } from '../concepts/auth-session';
import { loginTree } from './guard';
import { Session } from './session';

/** Every caller still gets its error; only the 401 that flips the session to signed out navigates. */
export const expireOn401: HttpInterceptorFn = (req, next) => {
  const session = inject(Session);
  const router = inject(Router);
  return next(req).pipe(
    tap({
      error: (error: unknown) => {
        if (!isUnauthorized(error) || req.context.get(LAB_M42_EXPECT_401)) return;
        if (session.expire()) void router.navigateByUrl(loginTree(router, router.url));
      },
    }),
  );
};
