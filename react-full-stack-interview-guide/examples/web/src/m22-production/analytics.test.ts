import { createAnalytics, type Payload } from './analytics';

type Events = {
  page_view: { path: string };
  add_to_cart: { sku: string; qty: number };
};

function setup(consent = true, flushAt = 3) {
  const batches: Payload[][] = [];
  let allowed = consent;
  const analytics = createAnalytics<Events>({
    send: (b) => batches.push(b),
    hasConsent: () => allowed,
    flushAt,
    now: () => new Date('2026-01-15T10:00:00.000Z'),
  });
  return { analytics, batches, setConsent: (v: boolean) => (allowed = v) };
}

test('events queue until the batch size, then flush together', () => {
  const { analytics, batches } = setup();
  analytics.track('page_view', { path: '/' });
  analytics.track('page_view', { path: '/cart' });
  expect(batches).toEqual([]);
  analytics.track('add_to_cart', { sku: 'A1', qty: 2 });
  expect(batches).toHaveLength(1);
  expect(batches[0]?.map((e) => e.name)).toEqual(['page_view', 'page_view', 'add_to_cart']);
  expect(analytics.pending()).toBe(0);
});

test('without consent nothing is recorded; granting it later starts recording', () => {
  const { analytics, setConsent } = setup(false);
  analytics.track('page_view', { path: '/' });
  expect(analytics.pending()).toBe(0);
  setConsent(true);
  analytics.track('page_view', { path: '/' });
  expect(analytics.pending()).toBe(1);
});

test('flush sends what is pending and is a no-op when empty', () => {
  const { analytics, batches } = setup();
  analytics.flush();
  expect(batches).toEqual([]);
  analytics.track('page_view', { path: '/' });
  analytics.flush();
  expect(batches).toHaveLength(1);
  expect(batches[0]?.[0]).toEqual({ name: 'page_view', props: { path: '/' }, time: '2026-01-15T10:00:00.000Z' });
});

test('a throwing transport does not escape', () => {
  const analytics = createAnalytics<Events>({
    send: () => {
      throw new Error('blocked by an ad blocker');
    },
    hasConsent: () => true,
    flushAt: 1,
  });
  expect(() => analytics.track('page_view', { path: '/' })).not.toThrow();
});
