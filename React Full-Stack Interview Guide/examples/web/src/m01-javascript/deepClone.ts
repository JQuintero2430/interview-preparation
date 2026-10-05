/**
 * Deep clone for the shapes interviewers ask about: primitives, plain objects
 * (prototype kept), arrays, Date, RegExp, Map, Set, and CYCLES (via a WeakMap
 * of already-cloned objects). Functions are returned by reference. Not handled
 * on purpose: class private fields (#x), getters/setters (the getter is
 * evaluated), Errors, typed arrays, DOM nodes. Use structuredClone for those
 * that it supports.
 */
export function deepClone<T>(value: T): T {
  return clone(value, new WeakMap<object, unknown>()) as T;
}

function clone(value: unknown, seen: WeakMap<object, unknown>): unknown {
  if (typeof value !== 'object' || value === null) return value; // primitives and functions

  if (seen.has(value)) return seen.get(value); // cycle or shared reference

  if (value instanceof Date) return new Date(value.getTime());
  if (value instanceof RegExp) return new RegExp(value.source, value.flags);

  if (value instanceof Map) {
    const out = new Map<unknown, unknown>();
    seen.set(value, out);
    value.forEach((v: unknown, k: unknown) => out.set(clone(k, seen), clone(v, seen)));
    return out;
  }

  if (value instanceof Set) {
    const out = new Set<unknown>();
    seen.set(value, out);
    value.forEach((v: unknown) => out.add(clone(v, seen)));
    return out;
  }

  if (Array.isArray(value)) {
    const out: unknown[] = [];
    seen.set(value, out); // register BEFORE recursing, or a cycle recurses forever
    out.length = value.length;
    value.forEach((v: unknown, i: number) => {
      out[i] = clone(v, seen);
    });
    return out;
  }

  const source = value as Record<PropertyKey, unknown>;
  const out = Object.create(Object.getPrototypeOf(value) as object | null) as Record<PropertyKey, unknown>;
  seen.set(value, out);
  for (const key of Reflect.ownKeys(source)) {
    if (Object.prototype.propertyIsEnumerable.call(source, key)) {
      out[key] = clone(source[key], seen);
    }
  }
  return out;
}
