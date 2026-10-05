import { createContext, redirect, type MiddlewareFunction } from 'react-router';

export type User = { name: string };

/** Stands in for a cookie session or a token store. One per test. */
export type Session = { user: User | null };

/** Typed router context: middleware writes the user once, every loader below reads it. */
export const userContext = createContext<User>();

const LOGIN_PATH = '/login';
const DEFAULT_AFTER_LOGIN = '/app';

/** `/login?redirectTo=<where the user was going>` */
export function loginUrl(returnTo: string): string {
  return `${LOGIN_PATH}?${new URLSearchParams({ redirectTo: returnTo })}`;
}

/**
 * Only same-origin paths are allowed after login. Without this check, `?redirectTo=https://evil.example`
 * (or `//evil.example`, which browsers treat as protocol-relative) is an open redirect.
 */
export function safeRedirect(target: FormDataEntryValue | string | null): string {
  if (typeof target !== 'string' || !target.startsWith('/') || target.startsWith('//')) {
    return DEFAULT_AFTER_LOGIN;
  }
  return target;
}

/**
 * Route middleware: runs before any loader of the route it is attached to (and of its children).
 * Throwing a redirect here means none of those loaders ever run.
 */
export function requireUser(session: Session): MiddlewareFunction {
  return ({ request, context }) => {
    if (!session.user) {
      const { pathname, search } = new URL(request.url);
      throw redirect(loginUrl(pathname + search));
    }
    context.set(userContext, session.user);
  };
}
