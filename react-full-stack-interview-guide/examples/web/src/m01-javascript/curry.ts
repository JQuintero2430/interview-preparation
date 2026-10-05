/**
 * The type models the strict one-argument-at-a-time chain `f(1)(2)(3)`.
 * The RUNTIME is more permissive (f(1, 2)(3), f(1)(2, 3), f(1, 2, 3) all work);
 * typing that is a TypeScript exercise, see module 02.
 */
export type Curried<A extends unknown[], R> = A extends [infer H, ...infer T]
  ? (arg: H) => Curried<T, R>
  : R;

/** Curry by `fn.length`: collect arguments until there are enough, then call. */
export function curry<A extends unknown[], R>(fn: (...args: A) => R): Curried<A, R> {
  const arity = fn.length; // params before the first default/rest parameter

  const collect =
    (received: unknown[]) =>
    (...next: unknown[]): unknown => {
      const all = [...received, ...next]; // a NEW array each call: partials never mutate
      return all.length >= arity ? fn(...(all as A)) : collect(all);
    };

  return collect([]) as unknown as Curried<A, R>;
}
