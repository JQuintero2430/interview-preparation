/**
 * Like `Partial<T>`, but recursive. Functions and `Date` are leaves (not made partial);
 * arrays keep their shape with each element made deeply partial.
 */
export type DeepPartial<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends Date
    ? T
    : T extends readonly unknown[]
      ? { [K in keyof T]: DeepPartial<T[K]> }
      : T extends object
        ? { [K in keyof T]?: DeepPartial<T[K]> }
        : T;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === Object.prototype;
}

function merge(base: unknown, patch: unknown): unknown {
  if (patch === undefined) return base;
  if (!isPlainObject(base) || !isPlainObject(patch)) return patch; // arrays, Dates, primitives: replaced wholesale
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(patch)) out[k] = merge(base[k], v);
  return out;
}

/** Apply a deep patch immutably. The overload is the public contract; the implementation is untyped on purpose. */
export function applyPatch<T extends object>(base: T, patch: DeepPartial<T>): T;
export function applyPatch(base: unknown, patch: unknown): unknown {
  return merge(base, patch);
}
