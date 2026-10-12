// Exercise 10.3: a model of custom property lookup (Custom Properties Level 1) and of a fluid `clamp()`, not a browser.
// Not modelled: values that mix text and `var()`, a cycle that contains a fallback, `@property`, units other than px and rem (16px root).

/** The custom properties one element declares; a value is a literal or a single `var(--name, fallback)` reference. */
export type Scope = Readonly<Record<string, string>>;

const REFERENCE = /^var\(\s*(--[\w-]+)\s*(?:,\s*(.+?))?\s*\)$/;

function resolveValue(value: string, scopes: readonly Scope[], seen: ReadonlySet<string>): string | undefined {
  const reference = REFERENCE.exec(value.trim());
  if (!reference) return value.trim();
  const [, name, fallback] = reference;
  return lookup(name!, scopes, seen) ?? (fallback === undefined ? undefined : resolveValue(fallback, scopes, seen));
}

/** Finds `name` in the nearest declaring scope and resolves its value from that scope outward (a cycle is `undefined`). */
function lookup(name: string, scopes: readonly Scope[], seen: ReadonlySet<string>): string | undefined {
  const at = scopes.findIndex((scope) => name in scope);
  if (at < 0) return undefined;
  const key = `${name}@${scopes.length - at}`;
  if (seen.has(key)) return undefined;
  return resolveValue(scopes[at]![name]!, scopes.slice(at), new Set(seen).add(key));
}

/**
 * The value `var(name, fallback)` computes to on an element. `scopes` runs from the element itself outward to the root;
 * `undefined` stands for the guaranteed-invalid value.
 */
export function resolveVar(name: string, scopes: readonly Scope[], fallback?: string): string | undefined {
  return lookup(name, scopes, new Set()) ?? (fallback === undefined ? undefined : resolveValue(fallback, scopes, new Set()));
}

export interface FluidScale {
  readonly minPx: number;
  readonly maxPx: number;
  readonly minViewportPx: number;
  readonly maxViewportPx: number;
}

const ROOT_PX = 16;
const round = (value: number): number => Number(value.toFixed(4));

/** `clamp(<min>rem, <intercept>rem + <slope>vw, <max>rem)`: `minPx` at `minViewportPx`, `maxPx` at `maxViewportPx`, linear between. */
export function fluidClamp({ minPx, maxPx, minViewportPx, maxViewportPx }: FluidScale): string {
  const slope = (maxPx - minPx) / (maxViewportPx - minViewportPx);
  const intercept = minPx - slope * minViewportPx;
  return `clamp(${round(minPx / ROOT_PX)}rem, ${round(intercept / ROOT_PX)}rem + ${round(slope * 100)}vw, ${round(maxPx / ROOT_PX)}rem)`;
}

const CLAMP = /^clamp\((-?[\d.]+)rem, (-?[\d.]+)rem \+ (-?[\d.]+)vw, (-?[\d.]+)rem\)$/;

/** The size in px that a string made by `fluidClamp` computes to at a viewport width. */
export function clampAt(css: string, viewportPx: number): number {
  const match = CLAMP.exec(css);
  if (!match) throw new SyntaxError(`Not a fluidClamp string: ${css}`);
  const [min, intercept, slope, max] = match.slice(1).map(Number) as [number, number, number, number];
  return Math.max(min * ROOT_PX, Math.min(intercept * ROOT_PX + (slope * viewportPx) / 100, max * ROOT_PX));
}
