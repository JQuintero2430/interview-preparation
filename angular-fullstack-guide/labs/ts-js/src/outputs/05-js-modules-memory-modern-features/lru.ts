/**
 * A cache that keeps at most `limit` entries and evicts the least recently used one.
 * A `Map` iterates in insertion order, so deleting and re-inserting a key marks it as the most recent.
 */
export class LruCache<K, V> {
  readonly #entries = new Map<K, V>();

  /** @param limit Maximum number of entries kept. */
  constructor(readonly limit: number) {}

  /** @returns The cached value, now marked as most recently used, or `undefined`. */
  get(key: K): V | undefined {
    if (!this.#entries.has(key)) return undefined;
    const value = this.#entries.get(key) as V;
    this.#entries.delete(key);
    this.#entries.set(key, value);
    return value;
  }

  /** Stores `value`, evicting the oldest entry when the cache is over its limit. */
  set(key: K, value: V): void {
    this.#entries.delete(key);
    this.#entries.set(key, value);
    if (this.#entries.size > this.limit) {
      // The first key in iteration order is the least recently used one.
      this.#entries.delete(this.#entries.keys().next().value as K);
    }
  }

  /** @returns The keys from least to most recently used. */
  keys(): K[] {
    return [...this.#entries.keys()];
  }
}
