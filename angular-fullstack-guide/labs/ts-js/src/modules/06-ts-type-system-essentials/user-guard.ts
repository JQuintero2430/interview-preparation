/** A postal address as the API sends it. */
export interface Address {
  street: string;
  city: string;
  zip: string;
}

/** A user as the API sends it. */
export interface User {
  id: number;
  name: string;
  email: string;
  address: Address;
  phone?: string;
}

type Check = (value: unknown) => boolean;

const isString = (value: unknown): value is string => typeof value === 'string';
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

// The rules are data: adding a field adds an entry, not a branch. They must list every field of the
// interfaces above, because the compiler cannot check that a predicate's test matches its claim.
const USER_RULES: Record<string, Check> = {
  id: Number.isInteger,
  name: isString,
  email: (value) => isString(value) && value.includes('@'),
  phone: (value) => value === undefined || isString(value),
};
const ADDRESS_RULES: Record<string, Check> = { street: isString, city: isString, zip: isString };

function firstFailingRule(record: Record<string, unknown>, rules: Record<string, Check>, prefix: string): string | undefined {
  const failing = Object.entries(rules).find(([field, check]) => !check(record[field]));
  return failing && prefix + failing[0];
}

/**
 * Finds the first field that does not match `User`.
 * @param value Untrusted data, for example a parsed response body.
 * @returns The path of the first bad field (`'address.zip'`), `'(root)'` when `value` is not an object, or `undefined` when it is a valid `User`.
 */
export function firstInvalidField(value: unknown): string | undefined {
  if (!isRecord(value)) return '(root)';
  const userField = firstFailingRule(value, USER_RULES, '');
  if (userField !== undefined) return userField;
  const address = value['address'];
  return isRecord(address) ? firstFailingRule(address, ADDRESS_RULES, 'address.') : 'address';
}

/**
 * Narrows untrusted data to `User`.
 * @param value Untrusted data.
 * @returns `true` when every field matches `User`.
 */
export function isUser(value: unknown): value is User {
  return firstInvalidField(value) === undefined;
}

/**
 * Narrows untrusted data to `User` for the rest of the caller's scope, or throws.
 * @param value Untrusted data.
 * @throws TypeError naming the first bad field, for example `invalid user: address.zip`.
 */
export function assertUser(value: unknown): asserts value is User {
  const field = firstInvalidField(value);
  if (field !== undefined) throw new TypeError(`invalid user: ${field}`);
}
