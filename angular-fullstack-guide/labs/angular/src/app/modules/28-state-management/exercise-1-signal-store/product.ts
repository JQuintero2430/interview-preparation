export interface Product {
  readonly id: number;
  readonly name: string;
}

export function isProduct(value: unknown): value is Product {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'number' &&
    'name' in value &&
    typeof value.name === 'string'
  );
}

/** The boundary guard for `parse`: a throw puts the resource in the error state. */
export function parseProducts(raw: unknown): Product[] {
  if (!Array.isArray(raw) || !raw.every(isProduct)) {
    throw new Error('Unexpected products response shape');
  }
  return raw;
}
