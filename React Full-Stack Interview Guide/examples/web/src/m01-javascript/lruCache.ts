/**
 * LRU cache on top of Map, whose iteration order is INSERTION order:
 * the first key is the least recently used, the last is the most recent.
 * "Touching" a key = delete + set (moves it to the end). get/set are O(1).
 */
export class LRUCache<K, V> {
  readonly capacity: number;
  #map = new Map<K, V>();

  constructor(capacity: number) {
    if (!Number.isInteger(capacity) || capacity < 1) {
      throw new RangeError('capacity must be a positive integer');
    }
    this.capacity = capacity;
  }

  get size(): number {
    return this.#map.size;
  }

  get(key: K): V | undefined {
    if (!this.#map.has(key)) return undefined;
    const value = this.#map.get(key) as V;
    this.#map.delete(key);
    this.#map.set(key, value); // now the most recent
    return value;
  }

  set(key: K, value: V): this {
    if (this.#map.has(key)) {
      this.#map.delete(key);
    } else if (this.#map.size >= this.capacity) {
      const oldest = this.#map.keys().next();
      if (!oldest.done) this.#map.delete(oldest.value);
    }
    this.#map.set(key, value);
    return this;
  }

  /** Does NOT count as a use. */
  has(key: K): boolean {
    return this.#map.has(key);
  }

  delete(key: K): boolean {
    return this.#map.delete(key);
  }

  /** Keys from least to most recently used. */
  keys(): K[] {
    return [...this.#map.keys()];
  }
}
