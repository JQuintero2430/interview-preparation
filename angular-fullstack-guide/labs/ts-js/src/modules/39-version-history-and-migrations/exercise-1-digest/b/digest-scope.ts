// Variant b (our alternative): setters feed a dirty set, so a loop checks only watchers on changed keys.
import { TTL, check, drain, infdig } from '../scope';
import type { Scope, Watcher } from '../scope';

export function createScope<M extends object>(initial: M): Scope<M> {
  const checksByKey = new Map<string, (() => boolean)[]>();
  const changed = new Set<string>();
  const asyncQueue: (() => void)[] = [];
  const model = new Proxy(initial, {
    set(target, key, value) {
      if (typeof key === 'string') changed.add(key);
      return Reflect.set(target, key, value);
    },
  });

  function digest(): number {
    let ttl = TTL;
    let passes = 0;
    let dirty: boolean;
    do {
      passes++;
      dirty = false;
      drain(asyncQueue);
      const keys = [...changed];
      changed.clear();
      for (const key of keys) {
        for (const run of checksByKey.get(key) ?? []) {
          if (run()) dirty = true;
        }
      }
      if ((dirty || asyncQueue.length > 0) && !(ttl--)) throw infdig();
    } while (dirty || asyncQueue.length > 0);
    return passes;
  }

  return {
    model,
    watch(key, listener) {
      const watcher: Watcher<(typeof initial)[typeof key]> = { read: () => initial[key], listener, last: undefined };
      const run = () => check(watcher);
      checksByKey.set(key, [...(checksByKey.get(key) ?? []), run]);
      changed.add(key);
      return () => {
        checksByKey.set(key, (checksByKey.get(key) ?? []).filter((candidate) => candidate !== run));
      };
    },
    evalAsync: (work) => void asyncQueue.push(work),
    apply(change) {
      change();
      return digest();
    },
    digest,
  };
}
