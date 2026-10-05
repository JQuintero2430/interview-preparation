/**
 * Group items by a key function. `K` is inferred from what the callback returns, so
 * `groupBy(users, (u) => u.role)` is keyed by the literal union `'admin' | 'user'`, not by `string`.
 * The result is `Partial` because a group that has no members does not exist: `result.admin` may be undefined.
 */
export function groupBy<T, K extends PropertyKey>(
  items: readonly T[],
  key: (item: T, index: number) => K,
): Partial<Record<K, T[]>> {
  const groups = new Map<K, T[]>();
  items.forEach((item, index) => {
    const k = key(item, index);
    const bucket = groups.get(k);
    if (bucket) bucket.push(item);
    else groups.set(k, [item]);
  });
  // One cast at the boundary: Object.fromEntries can only promise `{ [k: string]: T[] }`.
  return Object.fromEntries(groups) as Partial<Record<K, T[]>>;
}
