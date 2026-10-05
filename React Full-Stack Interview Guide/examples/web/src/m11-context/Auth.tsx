import { createContext, use, useCallback, useMemo, useState, type ReactNode } from 'react';

export type User = { name: string };

export type AuthContextValue = {
  user: User | null;
  login: (name: string) => void;
  logout: () => void;
};

// No meaningful default exists for "the signed-in session", so the default is null
// and the guarded hook below turns "forgot the provider" into a clear error.
const AuthContext = createContext<AuthContextValue | null>(null);
AuthContext.displayName = 'AuthContext'; // shown in React DevTools

/** Holds the session and shares it. The value object is memoized so it only changes when `user` does. */
export function AuthProvider({
  initialUser = null,
  children,
}: {
  initialUser?: User | null;
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const login = useCallback((name: string) => setUser({ name }), []);
  const logout = useCallback(() => setUser(null), []);
  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

  return <AuthContext value={value}>{children}</AuthContext>;
}

/** Guarded hook: fails fast, with the fix in the message, when no <AuthProvider> is above. */
export function useAuth(): AuthContextValue {
  const value = use(AuthContext);
  if (value === null) {
    throw new Error('useAuth must be used inside <AuthProvider>. Wrap your app (or this subtree) in it.');
  }
  return value;
}

export function AuthStatus() {
  const { user, login, logout } = useAuth();
  if (!user) {
    return (
      <button type="button" onClick={() => login('Ada')}>
        Sign in as Ada
      </button>
    );
  }
  return (
    <p>
      Signed in as {user.name}{' '}
      <button type="button" onClick={logout}>
        Sign out
      </button>
    </p>
  );
}

/** Renders `children` only for a signed-in user. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return user ? children : <p role="alert">Please sign in to see this page.</p>;
}
