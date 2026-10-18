import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LAB_M33_EX4_API, LabM33Ex4MemoryAuth } from './auth-store';

/**
 * Exercise 33.4, solution: attaches the in-memory access token to the variant's own API, and to nothing else.
 * Refreshing on a 401 and queueing requests meanwhile are module 27's (§7).
 */
export const labM33Ex4BearerInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(LabM33Ex4MemoryAuth).accessToken();
  if (token === null || !req.url.startsWith(inject(LAB_M33_EX4_API))) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
