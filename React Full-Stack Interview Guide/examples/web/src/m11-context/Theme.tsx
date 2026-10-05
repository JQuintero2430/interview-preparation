import { createContext, use, useCallback, useMemo, useState, type ReactNode } from 'react';

export type Theme = 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

// A theme has a sensible default, so components still render outside a provider.
// The cost: outside a provider, toggleTheme silently does nothing (compare Auth.tsx).
export const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: () => {
    // No provider above: nothing to toggle.
  },
});

/** Owns the theme state and shares it, plus a stable toggle, with every descendant. */
export function ThemeProvider({
  initialTheme = 'light',
  children,
}: {
  initialTheme?: Theme;
  children: ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const toggleTheme = useCallback(() => setTheme((t) => (t === 'light' ? 'dark' : 'light')), []);

  // Same object while `theme` is unchanged, so consumers skip work when the provider's parent re-renders.
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

/** Overrides the theme for one subtree; toggling inside it still flips the outer theme. */
export function ForceTheme({ theme, children }: { theme: Theme; children: ReactNode }) {
  const outer = use(ThemeContext);
  const value = useMemo(() => ({ ...outer, theme }), [outer, theme]);
  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme(): ThemeContextValue {
  return use(ThemeContext);
}

export function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button type="button" onClick={toggleTheme}>
      Switch to {theme === 'light' ? 'dark' : 'light'} theme
    </button>
  );
}

export function ThemedPanel({ title, children }: { title: string; children?: ReactNode }) {
  const { theme } = useTheme();
  return (
    <section aria-label={title} data-theme={theme} className={`panel panel-${theme}`}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

/** `use(Context)` may run after an early return or inside an `if`; `useContext` may not. */
export function Badge({ label, themed = true }: { label: string; themed?: boolean }) {
  if (!themed) return <span>{label}</span>;
  const { theme } = use(ThemeContext);
  return <span data-theme={theme}>{label}</span>;
}
