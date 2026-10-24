// Section 7 model: one login redirect for any number of 401 answers. Our model, not a library's code.
import { type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { LAB_M42_EXPECT_401, LabM42AuthSession, isUnauthorized } from './auth-session';

/** A functional interceptor: the first unexpected 401 starts the login; every caller still gets its error. */
export const redirectOn401: HttpInterceptorFn = (req, next) => {
  const session = inject(LabM42AuthSession);
  return next(req).pipe(
    tap({
      error: (error: unknown) => {
        if (isUnauthorized(error) && !req.context.get(LAB_M42_EXPECT_401)) session.startLogin();
      },
    }),
  );
};
