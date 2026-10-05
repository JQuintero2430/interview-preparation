type Listener<A extends unknown[]> = (...args: A) => void;
interface Entry {
  listener: Listener<never[]>;
  once: boolean;
}

/**
 * A typed event emitter. `E` maps event name -> tuple of argument types:
 *   new EventEmitter<{ greet: [name: string]; done: [] }>()
 * `on` and `once` return an unsubscribe function (the shape React effects want).
 */
export class EventEmitter<E extends Record<string, unknown[]>> {
  #entries = new Map<keyof E, Entry[]>();

  on<K extends keyof E>(event: K, listener: Listener<E[K]>): () => void {
    return this.#add(event, listener, false);
  }

  once<K extends keyof E>(event: K, listener: Listener<E[K]>): () => void {
    return this.#add(event, listener, true);
  }

  off<K extends keyof E>(event: K, listener: Listener<E[K]>): void {
    const list = this.#entries.get(event);
    if (!list) return;
    const index = list.findIndex((e) => e.listener === (listener as unknown));
    if (index !== -1) list.splice(index, 1);
  }

  /** Returns true if at least one listener ran. */
  emit<K extends keyof E>(event: K, ...args: E[K]): boolean {
    const list = this.#entries.get(event);
    if (!list || list.length === 0) return false;
    for (const entry of [...list]) {
      // iterate a COPY: listeners may unsubscribe (or subscribe) while we emit
      if (entry.once) this.#remove(event, entry);
      (entry.listener as unknown as Listener<E[K]>)(...args);
    }
    return true;
  }

  listenerCount(event: keyof E): number {
    return this.#entries.get(event)?.length ?? 0;
  }

  #add<K extends keyof E>(event: K, listener: Listener<E[K]>, once: boolean): () => void {
    const entry: Entry = { listener: listener as unknown as Listener<never[]>, once };
    const list = this.#entries.get(event) ?? [];
    list.push(entry);
    this.#entries.set(event, list);
    return () => this.#remove(event, entry);
  }

  #remove(event: keyof E, entry: Entry): void {
    const list = this.#entries.get(event);
    if (!list) return;
    const index = list.indexOf(entry);
    if (index !== -1) list.splice(index, 1);
  }
}
