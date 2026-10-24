import { z } from 'zod';

/** The response contract of our example `GET /api/orders/{id}`: the JSON is the contract, this schema is its TypeScript side. */
export const OrderDto = z.object({
  id: z.string(),
  status: z.string(),
  quantity: z.number().int(),
  note: z.string().nullable(),
});

export type OrderDto = z.infer<typeof OrderDto>;

/** Checks a decoded body where it enters the app; throws a `ZodError` that names the path of each problem. */
export function parseOrder(json: unknown): OrderDto {
  return OrderDto.parse(json);
}

/** The fields a client may change in our example `PATCH /api/orders/{id}`. */
export type OrderPatch = Partial<Omit<OrderDto, 'id'>>;

/** Serializes only what the user touched: `JSON.stringify` drops `undefined` members and keeps an explicit `null`. */
export function toPatchBody(edits: OrderPatch): string {
  return JSON.stringify(edits);
}
