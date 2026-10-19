// Our model of the AngularJS 1.8.3 digest loop (read from angular.js, not run against it): one scope,
// no child scopes, no $evalAsync queue and no lastDirtyWatch shortcut.

/** The loop limit, `var TTL = 10` in 1.8.3's `$RootScopeProvider`. */
export const TTL = 10;

const unset = Symbol('unset');

interface Watcher {
  readonly get: () => unknown;
  readonly listener: (value: unknown, previous: unknown) => void;
  last: unknown;
}

export class MiniScope {
  private readonly watchers: Watcher[] = [];

  watch(get: () => unknown, listener: (value: unknown, previous: unknown) => void): void {
    this.watchers.push({ get, listener, last: unset });
  }

  /** Runs `fn`, then a digest; returns the number of passes the digest made. */
  apply(fn: () => void): number {
    fn();
    return this.digest();
  }

  /** Loops until a full pass finds nothing changed; returns the number of passes made. */
  digest(): number {
    let ttl = TTL;
    let passes = 0;
    let dirty: boolean;
    do {
      dirty = false;
      passes++;
      for (const watcher of this.watchers) {
        const value = watcher.get();
        if (value !== watcher.last) {
          const previous = watcher.last === unset ? value : watcher.last;
          watcher.last = value;
          dirty = true;
          watcher.listener(value, previous);
        }
      }
      if (dirty && !(ttl--)) {
        throw new Error(`${TTL} $digest() iterations reached. Aborting!`);
      }
    } while (dirty);
    return passes;
  }
}
