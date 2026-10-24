// Section 7 model: cache layers asked nearest first. Our model, not a browser's or Angular's cache; the layer
// semantics are owned by 09 §4 (HTTP cache, shared cache), 09 §9 and 37 §5 (service worker), 27 §6 (request cache).
// The first layer holding a fresh-enough entry answers; a miss everywhere reaches the origin and fills the layers
// on the way back. Time is a number the caller passes.

export interface Entry {
  readonly value: string;
  readonly storedAt: number;
  readonly maxAgeMs: number;
}

export interface Layer {
  readonly name: string;
  readonly maxAgeMs: number;
  readonly entries: Map<string, Entry>;
}

export interface Lookup {
  /** The answering layer's name, or 'origin'. */
  readonly layer: string;
  readonly value: string;
  /** Layers consulted, nearest first. */
  readonly asked: readonly string[];
}

export function createLayer(name: string, maxAgeMs: number): Layer {
  return { name, maxAgeMs, entries: new Map() };
}

export function isFresh(entry: Entry, now: number): boolean {
  return now - entry.storedAt < entry.maxAgeMs;
}

function store(layer: Layer, key: string, value: string, now: number): void {
  layer.entries.set(key, { value, storedAt: now, maxAgeMs: layer.maxAgeMs });
}

export function lookup(layers: readonly Layer[], key: string, now: number, origin: (key: string) => string): Lookup {
  const asked: string[] = [];
  for (const [index, layer] of layers.entries()) {
    asked.push(layer.name);
    const entry = layer.entries.get(key);
    if (entry !== undefined && isFresh(entry, now)) {
      layers.slice(0, index).forEach((nearer) => store(nearer, key, entry.value, now));
      return { layer: layer.name, value: entry.value, asked };
    }
  }
  const value = origin(key);
  layers.forEach((layer) => store(layer, key, value, now));
  return { layer: 'origin', value, asked };
}

/** Removes the key from one named layer only; the layers behind it keep their entries. */
export function invalidate(layers: readonly Layer[], key: string, which: string): void {
  layers.find((layer) => layer.name === which)?.entries.delete(key);
}
