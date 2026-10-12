// Exercise 16.6: a MODEL of the lookup behavior asserted by the Angular specs of module 16 sections 5 and 8, not
// Angular's injector and not read from its source. Not covered: the element/environment split, `host`, `multi`,
// decorators, `providedIn`, injection contexts, child destruction and the real error texts.

export class Token<T> {
  // Never assigned: it only ties the token to its value type.
  declare readonly valueType?: T;
  constructor(readonly description: string) {}
}

export interface GetOptions {
  readonly optional?: boolean;
  readonly self?: boolean;
  readonly skipSelf?: boolean;
}

export type Get = <T>(token: Token<T>, options?: GetOptions) => T | null;

export type Provider<T = unknown> =
  | { readonly token: Token<T>; readonly useValue: T }
  | { readonly token: Token<T>; readonly useFactory: (get: Get) => T }
  | { readonly token: Token<T>; readonly useClass: new (get: Get) => T }
  | { readonly token: Token<T>; readonly useExisting: Token<T> };

export interface Injector {
  get<T>(token: Token<T>): T;
  get<T>(token: Token<T>, options: GetOptions & { readonly optional: true }): T | null;
  get<T>(token: Token<T>, options: GetOptions): T;
  onDestroy(cleanup: () => void): () => void;
  destroy(): void;
  readonly destroyed: boolean;
}

export class NoProviderError extends Error {
  constructor(token: Token<unknown>) {
    super(`No provider found for ${token.description}`);
    this.name = 'NoProviderError';
  }
}

export class CircularDependencyError extends Error {
  constructor(path: readonly Token<unknown>[]) {
    super(
      `Circular dependency detected for ${path[0]?.description}. Path: ${path.map((t) => t.description).join(' -> ')}`,
    );
    this.name = 'CircularDependencyError';
  }
}

export class DestroyedInjectorError extends Error {
  constructor() {
    super('Injector has already been destroyed');
    this.name = 'DestroyedInjectorError';
  }
}

// The error root: nothing is provided here, so the walk ends with an error naming the token, or null if optional.
export const nullInjector: Pick<Injector, 'get'> = {
  get<T>(token: Token<T>, options?: GetOptions): T | null {
    if (options?.optional) return null;
    throw new NoProviderError(token);
  },
} as Pick<Injector, 'get'>;

export function createInjector(config: { parent?: Injector; providers: readonly Provider[] }): Injector {
  const parent = config.parent ?? nullInjector;
  const providers = new Map<Token<unknown>, Provider>();
  for (const provider of config.providers) providers.set(provider.token, provider);
  const cache = new Map<Token<unknown>, unknown>();
  const building: Token<unknown>[] = [];
  const cleanups = new Set<() => void>();
  let destroyed = false;

  // A provider's own dependencies are looked up from the injector that holds it, never from the asker.
  const ownGet: Get = (token, options) => (injector.get as Get)(token, options);

  const build = <T>(provider: Provider<T>): T => {
    if ('useValue' in provider) return provider.useValue;
    if ('useFactory' in provider) return provider.useFactory(ownGet);
    if ('useClass' in provider) return new provider.useClass(ownGet);
    return injector.get(provider.useExisting);
  };

  const resolve = <T>(token: Token<T>, provider: Provider<T>): T => {
    if (cache.has(token)) return cache.get(token) as T;
    if (building.includes(token))
      throw new CircularDependencyError([...building.slice(building.indexOf(token)), token]);
    building.push(token);
    try {
      const value = build(provider);
      cache.set(token, value);
      return value;
    } finally {
      building.pop();
    }
  };

  const injector: Injector = {
    get(token: Token<never>, options: GetOptions = {}): never | null {
      if (destroyed) throw new DestroyedInjectorError();
      const provider = options.skipSelf ? undefined : providers.get(token);
      if (provider) return resolve(token, provider as Provider<never>);
      if (options.self) {
        if (options.optional) return null;
        throw new NoProviderError(token);
      }
      return (parent.get as Get)(token, { optional: options.optional });
    },
    onDestroy(cleanup) {
      cleanups.add(cleanup);
      return () => cleanups.delete(cleanup);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      for (const cleanup of cleanups) cleanup();
      cleanups.clear();
      cache.clear();
    },
    get destroyed() {
      return destroyed;
    },
  } as Injector;
  return injector;
}
