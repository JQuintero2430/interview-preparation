// labs/ts-js/src/modules/02-js-scope-closures-this/curry.ts
// Exercise 02.2: currying and partial application, both built on closures.

/** `(a, b, c) => R` becomes `(a) => (b) => (c) => R`. */
export type Curried<A extends readonly unknown[], R> = A extends readonly [infer First, ...infer Rest]
  ? (arg: First) => Curried<Rest, R>
  : R;

/**
 * Turns a function of N required parameters into a chain of N one-argument functions.
 * The arity is read from `fn.length`, so `fn` must not use default or rest parameters
 * (they are not counted by `length`).
 *
 * @param fn the function to curry; it is called once, when the last argument arrives
 * @returns the first function of the chain. Every intermediate function is reusable.
 */
export function curry<A extends [unknown, ...unknown[]], R>(fn: (...args: A) => R): Curried<A, R> {
  const arity = fn.length;

  // Each step closes over its own copy of the arguments so far. Copying (instead of pushing
  // into one shared array) is what lets a partially applied step be reused safely.
  const step = (received: unknown[]): unknown =>
    received.length >= arity ? fn(...(received as A)) : (arg: unknown) => step([...received, arg]);

  return step([]) as Curried<A, R>;
}

/**
 * Fixes the first arguments of `fn` now and takes the rest later.
 *
 * @param fn     the function to partially apply
 * @param preset the leading arguments to fix
 * @returns a function that takes the remaining arguments and calls `fn` with all of them
 */
export function partial<P extends unknown[], A extends unknown[], R>(
  fn: (...args: [...P, ...A]) => R,
  ...preset: P
): (...rest: A) => R {
  return (...rest) => fn(...preset, ...rest);
}
