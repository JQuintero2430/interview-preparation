// labs/ts-js/src/modules/03-js-objects-prototypes-classes/deep-freeze.ts
// Exercise 03.1: a deep, cycle-safe Object.freeze with a matching compile-time type.

/** Compile-time counterpart of `deepFreeze`: every property and array element becomes readonly. */
export type DeepReadonly<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

/**
 * Freezes `value` and every object or array reachable through its own data properties
 * (string and symbol keys). Returns the same reference, typed as deeply readonly.
 * Accessors are not invoked, functions are not frozen, and Map/Set contents stay mutable,
 * because freezing only locks properties, not internal slots.
 */
export function deepFreeze<T>(value: T): DeepReadonly<T> {
  freezeGraph(value, new WeakSet<object>());
  return value as DeepReadonly<T>;
}

function freezeGraph(value: unknown, seen: WeakSet<object>): void {
  // The seen-set, not Object.isFrozen, stops the walk: a frozen object can still hold unfrozen children.
  if (typeof value !== 'object' || value === null || seen.has(value)) return;
  seen.add(value);
  Object.freeze(value);
  for (const key of Reflect.ownKeys(value)) {
    freezeGraph(dataValueOf(value, key), seen);
  }
}

// Reading through the descriptor instead of value[key] avoids running getters, which may have side effects.
function dataValueOf(target: object, key: PropertyKey): unknown {
  const descriptor = Object.getOwnPropertyDescriptor(target, key);
  return descriptor !== undefined && 'value' in descriptor ? descriptor.value : undefined;
}
