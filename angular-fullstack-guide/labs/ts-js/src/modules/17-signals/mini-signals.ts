// labs/ts-js/src/modules/17-signals/mini-signals.ts
// A teaching implementation of the push-dirty / pull-version algorithm behind Angular signals.
// Simplification: every consumer is "live" (always subscribed). Angular only links live consumers
// (effects, templates), so unread computeds stay collectable; adding that means tracking liveness.

interface Producer {
  version: number;
  readonly consumers: Set<Consumer>;
  refresh(): void; // brings the value up to date (no-op for plain signals)
}

interface Consumer {
  readonly producers: Map<Producer, number>; // producer -> version seen at last run
  markDirty(): void;
}

let activeConsumer: Consumer | null = null;

function track(producer: Producer): void {
  if (activeConsumer === null) return;
  activeConsumer.producers.set(producer, producer.version);
  producer.consumers.add(activeConsumer);
}

function notify(producer: Producer): void {
  for (const consumer of [...producer.consumers]) consumer.markDirty();
}

/** Pull phase: has any producer really changed since this consumer last ran? */
function producersChanged(consumer: Consumer): boolean {
  for (const [producer, seen] of consumer.producers) {
    producer.refresh();
    if (producer.version !== seen) return true;
  }
  return false;
}

/** Runs fn while recording which producers it reads, replacing the old dependency set. */
function runTracked<T>(consumer: Consumer, fn: () => T): T {
  for (const producer of consumer.producers.keys()) producer.consumers.delete(consumer);
  consumer.producers.clear();
  const previous = activeConsumer;
  activeConsumer = consumer;
  try {
    return fn();
  } finally {
    activeConsumer = previous;
  }
}

export interface ReadonlySignal<T> {
  (): T;
}

export interface WritableSignal<T> extends ReadonlySignal<T> {
  set(value: T): void;
  update(fn: (value: T) => T): void;
}

export function signal<T>(initial: T, equal: (a: T, b: T) => boolean = Object.is): WritableSignal<T> {
  let value = initial;
  const node: Producer = { version: 0, consumers: new Set(), refresh: () => undefined };
  const read = (() => {
    track(node);
    return value;
  }) as WritableSignal<T>;
  read.set = (next) => {
    if (equal(value, next)) return;
    value = next;
    node.version++;
    notify(node); // push phase: only flags, no computation happens here
  };
  read.update = (fn) => read.set(fn(value));
  return read;
}

export function computed<T>(fn: () => T, equal: (a: T, b: T) => boolean = Object.is): ReadonlySignal<T> {
  let value: T;
  let hasValue = false;
  let dirty = true;
  const node: Producer & Consumer = {
    version: 0,
    consumers: new Set(),
    producers: new Map(),
    markDirty() {
      if (dirty) return;
      dirty = true;
      notify(node);
    },
    refresh() {
      if (!dirty) return;
      dirty = false;
      if (hasValue && !producersChanged(node)) return;
      const next = runTracked(node, fn);
      if (hasValue && equal(value, next)) return; // equality cutoff: version unchanged
      value = next;
      hasValue = true;
      node.version++;
    },
  };
  return () => {
    node.refresh();
    track(node);
    return value;
  };
}

export type Cleanup = () => void;

/** Effects are batched: any number of synchronous writes cause one run, in a microtask. */
export function effect(fn: (onCleanup: (cleanup: Cleanup) => void) => void): () => void {
  let scheduled = false;
  let disposed = false;
  let cleanup: Cleanup | undefined;
  const run = () => {
    scheduled = false;
    if (disposed || (node.producers.size > 0 && !producersChanged(node))) return;
    cleanup?.();
    cleanup = undefined;
    runTracked(node, () => fn((c) => (cleanup = c)));
  };
  const node: Consumer = {
    producers: new Map(),
    markDirty() {
      if (scheduled || disposed) return;
      scheduled = true;
      queueMicrotask(run);
    },
  };
  node.markDirty();
  return () => {
    disposed = true;
    cleanup?.();
    runTracked(node, () => undefined); // unlink from every producer
  };
}
