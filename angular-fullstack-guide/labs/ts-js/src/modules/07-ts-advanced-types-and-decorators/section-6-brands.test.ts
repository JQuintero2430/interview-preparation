// Section 6 claims: branded types make same-shaped primitives incompatible at compile time and cost nothing at run time.
import { typecheck } from '../06-ts-type-system-essentials/typecheck';

const linesAndCodes = (code: string) => typecheck(code).map(({ line, code: diagnostic }) => `line ${line}: TS${diagnostic}`);

const BRANDS = `declare const brand: unique symbol;
type Brand<T, Name extends string> = T & { readonly [brand]: Name };
type UserId = Brand<string, 'UserId'>;
type OrderId = Brand<string, 'OrderId'>;
type Cents = Brand<number, 'Cents'>;
`;

// The run-time half: brands exist only in types, so the constructor is the one place that checks and asserts.
declare const brand: unique symbol;
type Cents = number & { readonly [brand]: 'Cents' };
const cents = (value: number): Cents => {
  if (!Number.isSafeInteger(value)) throw new RangeError(`not a whole number of cents: ${value}`);
  return value as Cents;
};
const addCents = (a: Cents, b: Cents): Cents => (a + b) as Cents;

describe('Module 07 · section 6', () => {
  it('Section 6: plain string aliases are interchangeable, so swapped IDs compile', () => {
    expect(
      linesAndCodes('type UserId = string;\ntype OrderId = string;\ndeclare function cancel(order: OrderId, user: UserId): void;\ndeclare const u: UserId;\ndeclare const o: OrderId;\ncancel(u, o);'),
    ).toEqual([]);
  });

  it('Section 6: brands reject swapped IDs and raw strings (TS2345), and a raw literal cannot be declared a UserId (TS2322)', () => {
    const CALLS = `${BRANDS}declare function cancel(order: OrderId, user: UserId): void;
declare const u: UserId;
declare const o: OrderId;
cancel(o, u);
cancel(u, o);
cancel('o-1', u);
export const id: UserId = 'u-1';`;
    expect(linesAndCodes(CALLS)).toEqual(['line 10: TS2345', 'line 11: TS2345', 'line 12: TS2322']);
  });

  it('Section 6: a branded value is still usable as its base type, and arithmetic on it gives a plain number (TS2322 as Cents)', () => {
    const MATH = `${BRANDS}declare const price: Cents;
declare const tax: number;
export const asNumber: number = price;
export const sum = price + tax;
export const total: Cents = price + tax;`;
    expect(linesAndCodes(MATH)).toEqual(['line 10: TS2322']);
  });

  it('Section 6: at run time a brand is the bare primitive; the constructor function is the check', () => {
    const total = addCents(cents(1999), cents(1));
    expect([total, typeof total, Object.keys(Object(total))]).toEqual([2000, 'number', []]);
    expect(() => cents(19.99)).toThrow(new RangeError('not a whole number of cents: 19.99'));
  });
});
