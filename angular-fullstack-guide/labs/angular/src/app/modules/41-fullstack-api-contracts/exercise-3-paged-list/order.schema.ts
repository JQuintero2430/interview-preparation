import { ContractError } from './list-source';

/** Our order row (ours): `placedAt` stays the ISO 8601 string Jackson 3 writes by default. */
export interface Order {
  readonly id: number;
  readonly status: string;
  readonly placedAt: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** A member of a JSON object, or `undefined` when the body is not an object. */
export function member(body: unknown, key: string): unknown {
  return isRecord(body) ? body[key] : undefined;
}

export function isOrder(value: unknown): value is Order {
  return (
    isRecord(value) &&
    typeof value['id'] === 'number' &&
    typeof value['status'] === 'string' &&
    typeof value['placedAt'] === 'string'
  );
}

/** Checks every item before any is shown; the first bad one throws with its JSON Pointer into the body. */
export function checkOrders(items: unknown, pointer: string): Order[] {
  if (!Array.isArray(items)) throw new ContractError(pointer);
  const bad = items.findIndex((item) => !isOrder(item));
  if (bad !== -1) throw new ContractError(`${pointer}/${bad}`);
  return items.filter(isOrder);
}
