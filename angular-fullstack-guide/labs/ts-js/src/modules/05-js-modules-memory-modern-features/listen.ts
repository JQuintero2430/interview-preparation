/** A listener registration that can be removed with `using` or `[Symbol.dispose]()`. */
export interface ListenerHandle extends Disposable {
  /** `true` while the handler is attached to its target. */
  readonly active: boolean;
}

/**
 * Adds `handler` to `target` and returns a handle that removes it.
 * The handler is removed when the handle is disposed or when `options.signal` aborts, whichever comes first.
 * @param target Any `EventTarget` (a DOM node, `window`, Node's `EventTarget`).
 * @param type The event type, such as `'resize'`.
 * @param handler The listener to add.
 * @param options Listener options; `signal` removes the listener when it aborts.
 * @returns A handle whose disposal is idempotent.
 */
export function listen(
  target: EventTarget,
  type: string,
  handler: EventListenerOrEventListenerObject,
  options: AddEventListenerOptions = {},
): ListenerHandle {
  // The signal is kept out of addEventListener so that both removal routes go through `remove`.
  const { signal, ...listenerOptions } = options;
  let active = false;

  const remove = (): void => {
    if (!active) return;
    active = false;
    target.removeEventListener(type, handler, listenerOptions);
    // A long-lived signal would otherwise keep this handle, and everything the handler captures, alive.
    signal?.removeEventListener('abort', remove);
  };

  if (!signal?.aborted) {
    target.addEventListener(type, handler, listenerOptions);
    active = true;
    signal?.addEventListener('abort', remove, { once: true });
  }

  return {
    get active() {
      return active;
    },
    [Symbol.dispose]: remove,
  };
}
