// Models how TypeScript resolves `compilerOptions.paths`: exact patterns first, then the
// wildcard pattern with the LONGEST matching prefix. Vite's resolve.tsconfigPaths (Vite 8) and
// vite-tsconfig-paths follow the same idea.

export type Paths = Record<string, string[]>;

/** Returns the candidate locations for `specifier`, in order, or null when no pattern matches. */
export function resolvePathMapping(specifier: string, paths: Paths): string[] | null {
  const exact = paths[specifier];
  if (exact && !specifier.includes('*')) return [...exact];

  let best: { prefix: string; suffix: string; targets: string[] } | null = null;
  for (const [pattern, targets] of Object.entries(paths)) {
    const stars = pattern.split('*').length - 1;
    if (stars > 1) throw new Error(`Pattern "${pattern}" can have at most one "*"`);
    if (stars === 0) continue;
    const [prefix = '', suffix = ''] = pattern.split('*');
    const fits =
      specifier.length >= prefix.length + suffix.length &&
      specifier.startsWith(prefix) &&
      specifier.endsWith(suffix);
    if (fits && (best === null || prefix.length > best.prefix.length)) best = { prefix, suffix, targets };
  }
  if (best === null) return null;
  const captured = specifier.slice(best.prefix.length, specifier.length - best.suffix.length);
  return best.targets.map((target) => target.replace('*', () => captured));
}
