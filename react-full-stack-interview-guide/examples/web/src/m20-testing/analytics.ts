const COLLECTOR_URL = 'https://collector.example.test/events';

export type AnalyticsProps = Record<string, string>;

/**
 * Sends an analytics event, fire-and-forget. Unit tests replace this whole module with vi.mock,
 * because a real network call from a component test is slow, flaky and not what the test is about.
 * @param event - Event name, e.g. 'link_copied'.
 * @param props - Extra string properties.
 */
export function track(event: string, props: AnalyticsProps = {}): void {
  void fetch(COLLECTOR_URL, {
    method: 'POST',
    body: JSON.stringify({ event, props }),
    keepalive: true,
  });
}
