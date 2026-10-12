import { HttpContextToken, HttpEventType, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { HttpCache } from './http-cache';

/** How long a cached response may be served, in milliseconds. */
export const CACHE_TTL_MS = new HttpContextToken<number>(() => 60_000);

/** Set to `true` in a request's context to send it to the backend and keep its response out of the cache. */
export const NO_CACHE = new HttpContextToken<boolean>(() => false);

const WRITES: ReadonlySet<string> = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/** The collection a write changed: the URL itself for a POST, the URL without its last segment otherwise. */
function collectionPath(method: string, url: string): string {
  const path = url.split('?')[0];
  return method === 'POST' ? path : path.slice(0, path.lastIndexOf('/'));
}

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  const cache = inject(HttpCache);

  if (WRITES.has(req.method)) {
    return next(req).pipe(
      tap((event) => {
        if (event.type === HttpEventType.Response && event.ok) cache.invalidate(collectionPath(req.method, req.url));
      }),
    );
  }

  const cacheable = req.method === 'GET' && !req.headers.has('Authorization') && !req.context.get(NO_CACHE);
  if (!cacheable) return next(req);
  return cache.lookup(req.urlWithParams, () => next(req), req.context.get(CACHE_TTL_MS));
};
