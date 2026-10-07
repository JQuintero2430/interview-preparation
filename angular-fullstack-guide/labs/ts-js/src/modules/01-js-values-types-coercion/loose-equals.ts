// labs/ts-js/src/modules/01-js-values-types-coercion/loose-equals.ts
// Exercise 01.2: the == algorithm (ECMA-262 IsLooselyEqual) written out by hand, without == or !=.
// Deliberately out of scope: the [[IsHTMLDDA]] legacy special case (document.all), which only
// exists in browsers.

/** A JavaScript primitive value. */
export type Primitive = string | number | bigint | boolean | symbol | null | undefined;

type SpecType = 'undefined' | 'null' | 'boolean' | 'number' | 'bigint' | 'string' | 'symbol' | 'object';

const CANNOT_CONVERT = 'Cannot convert object to primitive value';

// The spec's Type(x): unlike typeof, null is its own type and functions are objects.
function specType(value: unknown): SpecType {
  if (value === null) return 'null';
  const kind = typeof value;
  return kind === 'function' ? 'object' : kind;
}

function isObject(value: unknown): value is object {
  return specType(value) === 'object';
}

function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

// OrdinaryToPrimitive with hint "number": valueOf first, then toString.
function ordinaryToPrimitive(input: object): Primitive {
  for (const name of ['valueOf', 'toString'] as const) {
    const method: unknown = (input as Record<string, unknown>)[name];
    if (typeof method === 'function') {
      const result: unknown = method.call(input);
      if (!isObject(result)) return result as Primitive;
    }
  }
  throw new TypeError(CANNOT_CONVERT);
}

/**
 * ToPrimitive(input) with no hint, which is what == uses: Symbol.toPrimitive receives 'default',
 * otherwise valueOf is tried before toString.
 * @param input the object to convert
 * @returns the primitive the object converts to
 * @throws TypeError when Symbol.toPrimitive is not callable or no method yields a primitive
 */
export function toPrimitiveDefault(input: object): Primitive {
  const exotic: unknown = (input as Record<symbol, unknown>)[Symbol.toPrimitive];
  if (isNullish(exotic)) return ordinaryToPrimitive(input);
  if (typeof exotic !== 'function') throw new TypeError('Symbol.toPrimitive is not a function');
  const result: unknown = exotic.call(input, 'default');
  if (isObject(result)) throw new TypeError(CANNOT_CONVERT);
  return result as Primitive;
}

// StringToBigInt: BigInt(string) applies exactly this grammar and throws SyntaxError where the
// spec returns undefined.
function stringToBigInt(text: string): bigint | undefined {
  try {
    return BigInt(text);
  } catch {
    return undefined;
  }
}

function bigIntEqualsNumber(big: bigint, num: number): boolean {
  return Number.isInteger(num) && BigInt(num) === big;
}

// The coercion steps of IsLooselyEqual, seen from `a`'s side. Returns undefined when no step
// applies with `a` on the left; looseEquals then tries the mirrored pair.
function coerceFrom(a: unknown, b: unknown): boolean | undefined {
  const typeA = specType(a);
  const typeB = specType(b);
  if (typeA === 'number' && typeB === 'string') return a === Number(b);
  if (typeA === 'bigint' && typeB === 'string') return a === stringToBigInt(b as string);
  if (typeA === 'boolean') return looseEquals(Number(a), b);
  if (typeA === 'object' && ['string', 'number', 'bigint', 'symbol'].includes(typeB)) {
    return looseEquals(toPrimitiveDefault(a as object), b);
  }
  if (typeA === 'bigint' && typeB === 'number') return bigIntEqualsNumber(a as bigint, b as number);
  return undefined;
}

/**
 * Implements `x == y` (IsLooselyEqual) without using == or !=.
 * @param x left operand
 * @param y right operand
 * @returns the same boolean `x == y` produces
 * @throws TypeError exactly where `x == y` throws (an object that cannot become a primitive)
 */
export function looseEquals(x: unknown, y: unknown): boolean {
  if (specType(x) === specType(y)) return x === y;
  if (isNullish(x) || isNullish(y)) return isNullish(x) && isNullish(y);
  return coerceFrom(x, y) ?? coerceFrom(y, x) ?? false;
}
