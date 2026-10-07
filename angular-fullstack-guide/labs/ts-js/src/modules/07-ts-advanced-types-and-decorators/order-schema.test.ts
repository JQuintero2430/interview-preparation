import { z } from 'zod';
import { addMoney, Order } from './order-schema';
import { LAB_OPTIONS, typecheck } from '../06-ts-type-system-essentials/typecheck';

const CONSUMER = new URL('./virtual-consumer.ts', import.meta.url).pathname;
// skipLibCheck as in labs/ts-js/tsconfig.json: zod's .d.cts files name DOM types (`File`) that LAB_OPTIONS leaves out.
const OPTIONS = { ...LAB_OPTIONS, skipLibCheck: true };
/** Compiles `code` as a file next to `order-schema.ts`, so it imports the real solution and the installed zod. */
const consumerCodes = (code: string) =>
  typecheck('export {};', OPTIONS, { [CONSUMER]: `${code}\n` }).map(({ file, line, code: diagnostic }) =>
    file === CONSUMER ? `line ${line}: TS${diagnostic}` : `${file}: TS${diagnostic}`,
  );

const payload = () => ({
  id: 'o-1',
  customerId: 'c-9',
  lines: [
    { sku: 'book', quantity: 2, unitPrice: 1999, currency: 'EUR' },
    { sku: 'pen', quantity: 1, unitPrice: 250, currency: 'EUR' },
  ],
});

describe('E07.2 Order schema and addMoney', () => {
  it('a valid payload parses to branded values', () => {
    const order = Order.parse(payload());
    expect(order.lines[0]).toEqual({ sku: 'book', quantity: 2, unitPrice: { amount: 1999, currency: 'EUR' } });
    expect(
      consumerCodes(`import { Order, type CustomerId, type Money, type OrderId } from './order-schema';
declare const body: unknown;
const order = Order.parse(body);
export const id: OrderId = order.id;
export const customer: CustomerId = order.customerId;
export const price: Money | undefined = order.lines[0]?.unitPrice;`),
    ).toEqual([]);
  });

  it('an invalid payload gives a ZodError whose issues name the bad paths', () => {
    const bad = { ...payload(), id: '', lines: [{ ...payload().lines[0], unitPrice: 19.99 }] };
    const result = Order.safeParse(bad);
    expect(result.error).toBeInstanceOf(z.ZodError);
    expect(result.error?.issues.map(({ path }) => path)).toEqual([['id'], ['lines', 0, 'unitPrice']]);
  });

  it('unknown keys are stripped (or rejected: decide and justify)', () => {
    const order = Order.parse({ ...payload(), internalNote: 'x', lines: [{ ...payload().lines[0], discount: 0.5 }] });
    expect([Object.keys(order), Object.keys(order.lines[0] ?? {})]).toEqual([
      ['id', 'customerId', 'lines'],
      ['sku', 'quantity', 'unitPrice'],
    ]);
  });

  it('passing a CustomerId where an OrderId is expected is a compile error', () => {
    expect(
      consumerCodes(`import { Order, type OrderId } from './order-schema';
declare function cancel(id: OrderId): void;
const order = Order.parse({});
cancel(order.id);
cancel(order.customerId);
cancel('o-1');`),
    ).toEqual(['line 5: TS2345', 'line 6: TS2345']);
  });

  it('adding two currencies throws, and adding a raw number is a compile error', () => {
    const [book, pen] = Order.parse(payload()).lines.map((line) => line.unitPrice);
    const dollars = Order.parse({ ...payload(), lines: [{ ...payload().lines[0], currency: 'USD' }] }).lines[0]?.unitPrice;
    if (!book || !pen || !dollars) throw new Error('fixture lines missing');
    expect(addMoney(book, pen)).toEqual({ amount: 2249, currency: 'EUR' });
    expect(() => addMoney(book, dollars)).toThrow(new RangeError('cannot add USD to EUR'));
    expect(
      consumerCodes(`import { addMoney, type Money } from './order-schema';
declare const price: Money;
addMoney(price, 5);
addMoney(price, { amount: 5, currency: 'EUR' });
export const total: number = price.amount + 5;`),
    ).toEqual(['line 3: TS2345', 'line 4: TS2345']);
  });
});
