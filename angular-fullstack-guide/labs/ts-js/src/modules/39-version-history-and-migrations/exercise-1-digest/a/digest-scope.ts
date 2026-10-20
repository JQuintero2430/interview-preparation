// Variant a (our code modeled on AngularJS 1.8.3's $digest): every loop checks every watcher.
import { TTL, check, drain, infdig } from '../scope';
import type { Scope, Watcher } from '../scope';

export function createScope<M extends object>(model: M): Scope<M> {
  const checks: (() => boolean)[] = [];
  const asyncQueue: (() => void)[] = [];

  function digest(): number {
    let ttl = TTL;
    let passes = 0;
    let dirty: boolean;
    do {
      passes++;
      dirty = false;
      drain(asyncQueue);
      for (const run of [...checks]) {
        if (run()) dirty = true;
      }
      if ((dirty || asyncQueue.length > 0) && !(ttl--)) throw infdig();
    } while (dirty || asyncQueue.length > 0);
    return passes;
  }

  return {
    model,
    watch(key, listener) {
      const watcher: Watcher<(typeof model)[typeof key]> = { read: () => model[key], listener, last: undefined };
      const run = () => check(watcher);
      checks.push(run);
      return () => {
        const index = checks.indexOf(run);
        if (index >= 0) checks.splice(index, 1);
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
