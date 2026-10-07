// Exercise 07.2: parse an API order once, at the boundary, into branded IDs and money.
import { z } from 'zod';

export const OrderId = z.string().min(1).brand<'OrderId'>();
export const CustomerId = z.string().min(1).brand<'CustomerId'>();
export const Currency = z.enum(['EUR', 'USD', 'CLP']);
/** An amount in minor units (cents) with its currency. Parsing it is the only way to get the brand. */
export const Money = z.object({ amount: z.number().int(), currency: Currency }).brand<'Money'>();

export type OrderId = z.infer<typeof OrderId>;
export type CustomerId = z.infer<typeof CustomerId>;
export type Money = z.infer<typeof Money>;

// Unknown keys are stripped (the z.object default): the API may add fields, and nothing unchecked reaches the app.
const OrderLine = z
  .object({ sku: z.string().min(1), quantity: z.number().int().positive(), unitPrice: z.number().int(), currency: Currency })
  .transform(({ unitPrice, currency, ...line }) => ({ ...line, unitPrice: Money.parse({ amount: unitPrice, currency }) }));

/** An order as the API sends it; its output type has branded IDs and `Money` prices. */
export const Order = z.object({ id: OrderId, customerId: CustomerId, lines: z.array(OrderLine).min(1) });
export type Order = z.infer<typeof Order>;

/**
 * Adds two amounts of the same currency.
 * @param a An amount from a parsed order or a previous `addMoney`.
 * @param b Another amount in the same currency.
 * @returns The sum, branded again by parsing it.
 * @throws RangeError when the currencies differ.
 */
export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) throw new RangeError(`cannot add ${b.currency} to ${a.currency}`);
  return Money.parse({ amount: a.amount + b.amount, currency: a.currency });
}
