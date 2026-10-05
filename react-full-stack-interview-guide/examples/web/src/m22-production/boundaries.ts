/**
 * An import-rule checker for a Feature-Sliced-Design-style layout (Exercise 1).
 * Paths are relative to `src/`, for example `features/cart/ui/CartButton.tsx`.
 */
export const LAYERS = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'] as const;
export type Layer = (typeof LAYERS)[number];

export type Edge = { from: string; to: string };
export type Rule = 'upward-layer' | 'cross-slice' | 'deep-import';
export type Violation = Edge & { rule: Rule; message: string };

export type ParsedModule = { layer: Layer; slice: string | null; rest: string };

/** `app` and `shared` have no slices; every other layer is `<layer>/<slice>/<rest>`. */
export function parseModule(path: string): ParsedModule | null {
  const [layerName, ...tail] = path.split('/');
  const layer = LAYERS.find((l) => l === layerName);
  if (!layer) return null;
  if (layer === 'app' || layer === 'shared') return { layer, slice: null, rest: tail.join('/') };
  const [slice, ...rest] = tail;
  if (!slice) return null;
  return { layer, slice, rest: rest.join('/') };
}

function isPublicApi(rest: string): boolean {
  return rest === '' || /^index(\.[tj]sx?)?$/.test(rest);
}

export function checkImports(edges: readonly Edge[]): Violation[] {
  const violations: Violation[] = [];
  for (const edge of edges) {
    const from = parseModule(edge.from);
    const to = parseModule(edge.to);
    if (!from || !to) continue; // a package or a path outside the layers: not our rule

    if (LAYERS.indexOf(to.layer) < LAYERS.indexOf(from.layer)) {
      violations.push({ ...edge, rule: 'upward-layer', message: `${from.layer} must not import from ${to.layer} (it is above)` });
      continue;
    }
    const sameSlice = from.layer === to.layer && from.slice === to.slice;
    if (from.layer === to.layer && !sameSlice) {
      violations.push({ ...edge, rule: 'cross-slice', message: `slices on the ${from.layer} layer must not import each other` });
      continue;
    }
    if (!sameSlice && to.slice !== null && !isPublicApi(to.rest)) {
      violations.push({ ...edge, rule: 'deep-import', message: `import ${to.layer}/${to.slice} through its index, not ${to.rest}` });
    }
  }
  return violations;
}

function normalize(parts: string[]): string {
  const out: string[] = [];
  for (const part of parts) {
    if (part === '' || part === '.') continue;
    if (part === '..') out.pop();
    else out.push(part);
  }
  return out.join('/');
}

/** Turns an import specifier into a path relative to `src/`; `null` for packages. */
export function resolveSpecifier(from: string, specifier: string): string | null {
  if (specifier.startsWith('@/')) return specifier.slice(2);
  if (specifier.startsWith('.')) return normalize([...from.split('/').slice(0, -1), ...specifier.split('/')]);
  return null;
}

const IMPORT_RE =
  /(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g;

/** Builds the edges of one file from its source text. Regex-based: see the trade-offs in 22.2. */
export function extractEdges(from: string, source: string): Edge[] {
  const edges: Edge[] = [];
  for (const match of source.matchAll(IMPORT_RE)) {
    const specifier = match[1] ?? match[2] ?? match[3];
    if (!specifier) continue;
    const to = resolveSpecifier(from, specifier);
    if (to !== null) edges.push({ from, to });
  }
  return edges;
}

/** Runs the whole check over `{ path: source }`. */
export function checkProject(files: Readonly<Record<string, string>>): Violation[] {
  return checkImports(Object.entries(files).flatMap(([path, source]) => extractEdges(path, source)));
}
