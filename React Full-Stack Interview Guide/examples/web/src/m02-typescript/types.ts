/** Branded (nominal-ish) types: structurally identical strings that the compiler keeps apart. */
export type Brand<T, Name extends string> = T & { readonly __brand: Name };
export type UserId = Brand<string, 'UserId'>;
export type OrderId = Brand<string, 'OrderId'>;
export const asUserId = (raw: string): UserId => raw as UserId;
export const asOrderId = (raw: string): OrderId => raw as OrderId;

/** Mapped type with key remapping (`as`) and a template-literal type: { name } -> { getName }. */
export type Getters<T> = { [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K] };

/** Conditional type with `infer`. */
export type ElementOf<T> = T extends readonly (infer U)[] ? U : never;

/** Template-literal helper for event-prop names: 'click' -> 'onClick'. */
export type HandlerName<Event extends string> = `on${Capitalize<Event>}`;

/** Strip `readonly` (the `-` modifier). */
export type Mutable<T> = { -readonly [K in keyof T]: T[K] };

/** Flatten an intersection into one readable object type. */
export type Prettify<T> = { [K in keyof T]: T[K] };

/** `K extends keyof T` ties the keys to the object: pick(user, 'nmae') is an error. */
export function pick<T extends object, K extends keyof T>(source: T, ...keys: K[]): Pick<T, K> {
  const out = {} as Pick<T, K>;
  for (const key of keys) out[key] = source[key];
  return out;
}

/** `const` type parameter (TS 5.0): infers the narrowest, readonly tuple without a caller-side `as const`. */
export function tuple<const T extends readonly unknown[]>(...items: T): T {
  return items;
}

/** `NoInfer` (TS 5.4): `fallback` may not widen what `T` is inferred as. */
export function firstOr<T>(items: readonly T[], fallback: NoInfer<T>): T {
  const [first] = items;
  return first === undefined ? fallback : first;
}

/** Variance annotations (TS 4.7): `out` = producer (covariant), `in` = consumer (contravariant). */
export interface Producer<out T> {
  get: () => T;
}
export interface Consumer<in T> {
  put: (value: T) => void;
}

export const routes = { home: '/', user: '/users/:id' } as const satisfies Record<string, `/${string}`>;
export type RouteName = keyof typeof routes;
