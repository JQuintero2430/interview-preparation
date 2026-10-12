// Exercise 14.5: a model of the behavior read in AsyncPipe 22.2.1 (@angular/common, fesm2022/_common_module-chunk.mjs,
// read 2026-10-08), not Angular's pipe. Not covered: ChangeDetectorRef, `untracked`, zones, the application ErrorHandler,
// the typings overloads, RxJS (the source is a structural type), and the pipe's own lifecycle hook.

export interface Subscription {
  unsubscribe(): void;
}

export interface Subscribable<T> {
  subscribe(observer: { next: (value: T) => void; error: (error: unknown) => void }): Subscription;
}

export interface AsyncPipeHost {
  markForCheck(): void;
  reportError(error: unknown): void;
}

export type AsyncSource<T> = Subscribable<T> | PromiseLike<T>;

export class InvalidPipeArgumentError extends Error {
  constructor(value: unknown) {
    super(`InvalidPipeArgument: '${String(value)}' for pipe 'AsyncPipe'`);
    this.name = 'InvalidPipeArgumentError';
  }
}

const isPromise = (value: unknown): value is PromiseLike<unknown> =>
  !!value && typeof (value as { then?: unknown }).then === 'function';
const isSubscribable = (value: unknown): value is Subscribable<unknown> =>
  !!value && typeof (value as { subscribe?: unknown }).subscribe === 'function';

export function createAsyncPipeModel<T>(host: AsyncPipeHost): {
  transform(source: AsyncSource<T> | null | undefined): T | null;
  destroy(): void;
} {
  let latest: T | null = null;
  let current: AsyncSource<T> | null = null;
  let subscription: Subscription | null = null;
  let notify = true;

  const dispose = (): void => {
    subscription?.unsubscribe();
    latest = null;
    subscription = null;
    current = null;
  };

  const subscribe = (source: AsyncSource<T>): void => {
    const onValue = (value: T): void => {
      if (source === current) {
        latest = value;
        if (notify) host.markForCheck();
      }
    };
    if (isPromise(source)) {
      let live = true;
      source.then(
        (value) => live && onValue(value),
        (error: unknown) => live && host.reportError(error),
      );
      current = source;
      subscription = { unsubscribe: () => void (live = false) };
    } else if (isSubscribable(source)) {
      current = source;
      subscription = source.subscribe({ next: onValue, error: (error) => host.reportError(error) });
    } else {
      throw new InvalidPipeArgumentError(source);
    }
  };

  const transform = (source: AsyncSource<T> | null | undefined): T | null => {
    if (!current) {
      if (source) {
        try {
          notify = false;
          subscribe(source);
        } finally {
          notify = true;
        }
      }
      return latest;
    }
    if (source !== current) {
      dispose();
      return transform(source);
    }
    return latest;
  };

  return {
    transform,
    destroy() {
      if (subscription) dispose();
    },
  };
}
