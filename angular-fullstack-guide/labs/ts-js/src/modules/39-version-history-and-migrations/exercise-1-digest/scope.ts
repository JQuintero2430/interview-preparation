// Exercise 39.1: the contract both digest loops share. The loops are our code modeled on AngularJS 1.8.3's
// `$digest` (read from angular.js, not run): one scope, no child scopes, no `lastDirtyWatch` shortcut, and
// a listener that throws is not caught (1.8.3 sends it to `$exceptionHandler`).

/** The loop limit, `var TTL = 10` in 1.8.3's `$RootScopeProvider`. */
export const TTL = 10;

export type Listener<T> = (value: T, previous: T) => void;

/** One watched value: `last` is `undefined` until the first check, then a one-item tuple. */
export interface Watcher<T> {
  readonly read: () => T;
  readonly listener: Listener<T>;
  last: readonly [T] | undefined;
}

export interface Scope<M extends object> {
  /** The model; write through it so a loop can see the change. */
  readonly model: M;
  /** Watches `model[key]`; returns the function that deregisters the watcher. */
  watch<K extends keyof M & string>(key: K, listener: Listener<M[K]>): () => void;
  /** Queues work that the next loop runs before it checks any watcher. */
  evalAsync(work: () => void): void;
  /** Runs `change`, then a digest; returns the number of loops the digest made. */
  apply(change: () => void): number;
  /** Loops until a full loop finds nothing changed; returns the number of loops made. */
  digest(): number;
}

/** Compares one watcher with its last value, calls its listener on a change, and says whether it did. */
export function check<T>(watcher: Watcher<T>): boolean {
  const value = watcher.read();
  const before = watcher.last;
  if (before !== undefined && before[0] === value) return false;
  watcher.last = [value];
  watcher.listener(value, before === undefined ? value : before[0]);
  return true;
}

/** Runs the queued work, including work queued while draining, as 1.8.3's loop does. */
export function drain(queue: (() => void)[]): void {
  for (let work = queue.shift(); work; work = queue.shift()) work();
}

export function infdig(): Error {
  return new Error(`${TTL} $digest() iterations reached. Aborting!`);
}
