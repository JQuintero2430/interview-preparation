// labs/ts-js/src/modules/03-js-objects-prototypes-classes/observable.ts
// Exercise 03.2: a deep change-tracking Proxy, the core idea behind Proxy-based reactivity (Vue 3's reactive()).

/** Called after every effective write or delete, with a dotted path such as "user.address.city". */
export type ChangeListener = (path: string, value: unknown) => void;

interface Context {
  readonly onChange: ChangeListener;
  /** target object -> (path -> proxy), so repeated reads return the same proxy. */
  readonly proxies: WeakMap<object, Map<string, object>>;
  /** proxy -> target, so a proxy assigned into the state is stored as plain data. */
  readonly targets: WeakMap<object, object>;
}

/**
 * Returns a proxy over `target` that reports writes and deletes (including on nested objects
 * reached through it) to `onChange`. Writes of an identical value (`Object.is`) are not reported.
 * The original object is mutated; the proxy is a view over it, not a copy.
 */
export function observable<T extends object>(target: T, onChange: ChangeListener): T {
  const context: Context = { onChange, proxies: new WeakMap(), targets: new WeakMap() };
  return wrap(target, '', context);
}

function wrap<T extends object>(target: T, path: string, context: Context): T {
  const byPath = context.proxies.get(target) ?? new Map<string, object>();
  context.proxies.set(target, byPath);
  const cached = byPath.get(path);
  if (cached !== undefined) return cached as T;
  const proxy = new Proxy(target, createHandler(path, context)) as T;
  byPath.set(path, proxy);
  context.targets.set(proxy, target);
  return proxy;
}

function createHandler(path: string, context: Context): ProxyHandler<object> {
  return {
    get(target, key, receiver) {
      // The receiver makes getters run with `this` = proxy, so their inner reads are seen too.
      const value: unknown = Reflect.get(target, key, receiver);
      if (!isObject(value) || typeof key === 'symbol' || isInvariantLocked(target, key)) return value;
      return wrap(value, join(path, key), context);
    },
    set(target, key, value: unknown, receiver) {
      const next = isObject(value) ? (context.targets.get(value) ?? value) : value;
      const previous: unknown = Reflect.get(target, key, receiver);
      const ok = Reflect.set(target, key, next, receiver);
      if (ok && !Object.is(previous, next)) context.onChange(join(path, key), next);
      return ok;
    },
    deleteProperty(target, key) {
      const existed = Object.hasOwn(target, key);
      const ok = Reflect.deleteProperty(target, key);
      if (ok && existed) context.onChange(join(path, key), undefined);
      return ok;
    },
  };
}

function isObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null;
}

// Proxy invariant: for a non-writable, non-configurable data property, `get` must return the
// actual value. Returning a wrapper there would throw a TypeError (for example on frozen objects).
function isInvariantLocked(target: object, key: string): boolean {
  const descriptor = Object.getOwnPropertyDescriptor(target, key);
  return descriptor !== undefined && descriptor.configurable === false && descriptor.writable === false;
}

function join(path: string, key: PropertyKey): string {
  return path === '' ? String(key) : `${path}.${String(key)}`;
}
