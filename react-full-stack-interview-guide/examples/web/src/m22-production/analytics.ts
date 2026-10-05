type Props = Record<string, string | number | boolean>;

export type Payload = { name: string; props: Props; time: string };

type AnalyticsOptions = {
  /** Sends a batch (`navigator.sendBeacon`, a vendor SDK...). */
  send: (batch: Payload[]) => void;
  /** Read at call time, so a consent change takes effect immediately. */
  hasConsent: () => boolean;
  flushAt?: number;
  now?: () => Date;
};

/**
 * Typed, consent-gated, batched event tracking. `M` maps each event name to its properties,
 * so `track('add_to_cart', { sku: 1 })` is a compile error.
 */
export function createAnalytics<M extends Record<string, Props>>({ send, hasConsent, flushAt = 5, now = () => new Date() }: AnalyticsOptions) {
  let queue: Payload[] = [];

  function flush() {
    if (queue.length === 0) return;
    const batch = queue;
    queue = [];
    try {
      send(batch);
    } catch {
      // Analytics must never break the page.
    }
  }

  function track<K extends keyof M & string>(name: K, props: M[K]) {
    if (!hasConsent()) return; // dropped, not queued: no consent means no record at all
    queue.push({ name, props, time: now().toISOString() });
    if (queue.length >= flushAt) flush();
  }

  return { track, flush, pending: () => queue.length };
}
