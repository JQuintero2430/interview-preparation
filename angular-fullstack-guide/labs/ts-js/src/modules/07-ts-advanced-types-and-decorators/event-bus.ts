// Exercise 07.1: a typed event bus. The event map is the only place that names events and their payloads.

/** The arguments `emit` takes after the event name: none for a `void` payload, otherwise exactly the payload. */
export type PayloadArgs<P> = [P] extends [void] ? [] : [payload: P];

/** A bus whose event names and payload types all come from `Events`. */
export interface EventBus<Events extends Record<string, unknown>> {
  /**
   * Registers a handler for one event.
   * @param type The event name, one of the keys of `Events`.
   * @param handler Called with that event's payload, after the handlers registered before it.
   * @returns A function that removes this registration.
   */
  on<K extends keyof Events>(type: K, handler: (payload: Events[K]) => void): () => void;
  /**
   * Calls every handler of one event, in registration order.
   * @param type The event name.
   * @param args The payload, omitted when the event's payload type is `void`.
   */
  emit<K extends keyof Events>(type: K, ...args: PayloadArgs<Events[K]>): void;
}

/**
 * Creates an empty bus.
 * @returns A bus typed by the event map passed as the type argument.
 */
export function createEventBus<Events extends Record<string, unknown>>(): EventBus<Events> {
  const handlers: { [K in keyof Events]?: ((payload: Events[K]) => void)[] } = {};
  return {
    on(type, handler) {
      (handlers[type] ??= []).push(handler);
      return () => {
        const list = handlers[type] ?? [];
        const index = list.indexOf(handler);
        if (index >= 0) list.splice(index, 1);
      };
    },
    emit<K extends keyof Events>(type: K, ...args: PayloadArgs<Events[K]>) {
      // The one cast: `args` is empty exactly when the payload type is `void`, so `undefined` is the payload then.
      const payload = args[0] as Events[K];
      // A copy, so a handler that unsubscribes during emit does not make the loop skip the next one.
      for (const handler of [...(handlers[type] ?? [])]) handler(payload);
    },
  };
}
