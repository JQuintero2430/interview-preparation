import { parsePointer } from '../concepts/json-pointer';

/** One entry of our problem's `errors` extension member: RFC 9457's example shape. */
export interface FieldError {
  pointer: string;
  detail: string;
}

/** What applying a problem's field errors produced: field paths in server order, unmatched details, the focus target. */
export interface ApplyResult {
  applied: string[];
  formLevel: string[];
  firstInvalid: string | null;
}

/** Our example model (ours): both variants build their form over it, in this field order. */
export interface Customer {
  email: string;
  address: { street: string; city: string };
  items: { sku: string; quantity: number }[];
}

/** The error key (reactive) or kind (Signal Forms) that marks an error as the server's. */
export const SERVER_ERROR = 'server';

/** Puts one error on the field the tokens name; returns false when the form has no such field. */
export type PlaceError = (tokens: readonly string[], detail: string) => boolean;

/** Leaf paths of a form value in key and index order, which is the form's field order. */
export function fieldOrder(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]: [string, unknown]) =>
    fieldOrder(child, prefix ? `${prefix}.${key}` : key),
  );
}

/** Places each error; the empty pointer (the whole document) and unmatched pointers become form-level errors. */
export function applyFieldErrors(errors: readonly FieldError[], order: readonly string[], place: PlaceError): ApplyResult {
  const applied: string[] = [];
  const formLevel: string[] = [];
  for (const { pointer, detail } of errors) {
    const tokens = parsePointer(pointer);
    if (tokens.length > 0 && place(tokens, detail)) applied.push(tokens.join('.'));
    else formLevel.push(detail);
  }
  return { applied, formLevel, firstInvalid: order.find((path) => applied.includes(path)) ?? null };
}
