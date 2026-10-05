import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { loginUrl, type User } from './session';

/**
 * The component guard: the only option in declarative mode (and in v5/v6-era code).
 * It decides during render, so in a data router every loader of the route has ALREADY run
 * by the time it redirects. Exercise 1 compares it with the middleware guard.
 */
export function RequireAuth({ user, children }: { user: User | null; children: ReactNode }) {
  const location = useLocation();
  if (!user) return <Navigate to={loginUrl(location.pathname + location.search)} replace />;
  return children;
}
