import { assertNever } from './assertNever';

export type Shape = { kind: 'circle'; radius: number } | { kind: 'rect'; width: number; height: number };

/** No `default` and no cast: the compiler proves the switch covers every Shape. */
export function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'rect':
      return shape.width * shape.height;
  }
}

/** The same switch with an explicit `never` check: adding a member makes THIS line fail, not a distant return. */
export function perimeter(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return 2 * Math.PI * shape.radius;
    case 'rect':
      return 2 * (shape.width + shape.height);
    default:
      return assertNever(shape);
  }
}

/** `typeof` narrowing on a primitive union. */
export function formatId(id: string | number): string {
  return typeof id === 'number' ? id.toString().padStart(6, '0') : id.trim();
}

/** `instanceof`, then the `in` operator, then a fallback: the standard way to read a caught `unknown`. */
export function describeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return String(error);
}

/** A user-defined type predicate: the `x is string` return type is a promise the compiler trusts. */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/** An assertion function: after it returns normally, `value` is narrowed for the rest of the scope. */
export function assertIsDefined<T>(value: T, message = 'Expected a value'): asserts value is NonNullable<T> {
  if (value === null || value === undefined) throw new Error(message);
}

/** Inferred type predicate (TS 5.5): no annotation needed, and `filter` narrows. */
export const keepPresent = <T>(items: readonly (T | null | undefined)[]): T[] =>
  items.filter((item) => item !== null && item !== undefined);
