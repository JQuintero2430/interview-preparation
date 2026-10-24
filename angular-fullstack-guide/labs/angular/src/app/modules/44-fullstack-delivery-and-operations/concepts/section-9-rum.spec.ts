// Section 9: our BeaconQueue with an injected BEACON, an injected random source and a stubbed `document.visibilityState`.
// jsdom has no network; nothing is sent anywhere.
import { DOCUMENT, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BEACON, BeaconQueue, RUM_CONFIG, RUM_RANDOM, type StampedEvent } from './beacon-queue';

const RUM_URL = '/rum';
const RELEASE = 'web-1.4.2';

function parseEvents(body: string): StampedEvent[] {
  const parsed: unknown = JSON.parse(body);
  if (!Array.isArray(parsed)) throw new Error('the beacon body is not an array');
  return parsed;
}

class FakeBeacon {
  readonly sent: { url: string; events: StampedEvent[] }[] = [];
  accept = true;

  readonly send = (url: string, body: string): boolean => {
    if (this.accept) this.sent.push({ url, events: parseEvents(body) });
    return this.accept;
  };
}

let visibility: DocumentVisibilityState = 'visible';

function hide(): void {
  visibility = 'hidden';
  document.dispatchEvent(new Event('visibilitychange'));
}

function setUp(beacon: FakeBeacon, draws: number[], sampleRate = 0.1): BeaconQueue {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      provideZonelessChangeDetection(),
      { provide: BEACON, useValue: beacon.send },
      { provide: RUM_CONFIG, useValue: { url: RUM_URL, release: RELEASE, sampleRate } },
      { provide: RUM_RANDOM, useValue: () => draws.shift() ?? 0 },
    ],
  });
  expect(TestBed.inject(DOCUMENT)).toBe(document);
  return TestBed.inject(BeaconQueue);
}

describe('Section 9: the beacon queue', () => {
  beforeEach(() => {
    visibility = 'visible';
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => visibility });
  });

  afterEach(() => {
    Reflect.deleteProperty(document, 'visibilityState');
  });

  it('Section 9: metrics are batched and sent in one beacon when the page becomes hidden', () => {
    const beacon = new FakeBeacon();
    const queue = setUp(beacon, [0.5, 0.01]);
    queue.track({ kind: 'metric', name: 'LCP', value: 1800 });
    queue.track({ kind: 'metric', name: 'INP', value: 120 });
    queue.track({ kind: 'metric', name: 'CLS', value: 0.02 });
    expect(beacon.sent).toHaveLength(0);

    hide();
    expect(beacon.sent).toHaveLength(1);
    expect(beacon.sent[0]?.url).toBe(RUM_URL);
    expect(beacon.sent[0]?.events.map((e) => e.name)).toEqual(['LCP', 'INP', 'CLS']);

    hide();
    expect(beacon.sent).toHaveLength(1);

    beacon.accept = false;
    queue.track({ kind: 'metric', name: 'TTFB', value: 90 });
    hide();
    expect(beacon.sent).toHaveLength(1);
    beacon.accept = true;
    hide();
    expect(beacon.sent[1]?.events.map((e) => e.name)).toEqual(['TTFB']);
  });

  it('Section 9: every event carries the route, the release and the page-view id', () => {
    const beacon = new FakeBeacon();
    const queue = setUp(beacon, [0.5, 0.01]);
    queue.setRoute('/cart');
    queue.track({ kind: 'metric', name: 'LCP', value: 1800 });
    queue.setRoute('/checkout');
    queue.track({ kind: 'error', name: 'TypeError', value: 'x is undefined' });
    queue.flush();

    const events = beacon.sent[0]?.events ?? [];
    expect(events.map((e) => e.route)).toEqual(['/cart', '/checkout']);
    expect(events.every((e) => e.release === RELEASE)).toBe(true);
    expect(events.every((e) => e.pageViewId === queue.pageViewId)).toBe(true);
    expect(queue.pageViewId).toMatch(/^pv-[0-9a-z]+$/);
  });

  it('Section 9: a page view outside the sample sends nothing and one inside it sends every event', () => {
    const outside = new FakeBeacon();
    const skipped = setUp(outside, [0.5, 0.9]);
    expect(skipped.sampled).toBe(false);
    skipped.track({ kind: 'metric', name: 'LCP', value: 1800 });
    skipped.track({ kind: 'error', name: 'TypeError', value: 'x' });
    hide();
    expect(outside.sent).toHaveLength(0);

    visibility = 'visible';
    const inside = new FakeBeacon();
    const kept = setUp(inside, [0.5, 0.05]);
    expect(kept.sampled).toBe(true);
    kept.track({ kind: 'metric', name: 'LCP', value: 1800 });
    kept.track({ kind: 'metric', name: 'INP', value: 120 });
    kept.track({ kind: 'error', name: 'TypeError', value: 'x' });
    hide();
    expect(inside.sent[0]?.events).toHaveLength(3);
  });

  it('Section 9: an error report carries the same release identifier as the metrics', () => {
    const beacon = new FakeBeacon();
    const queue = setUp(beacon, [0.5, 0.01]);
    queue.track({ kind: 'metric', name: 'INP', value: 120 });
    queue.track({ kind: 'error', name: 'TypeError', value: 'x is undefined' });
    queue.flush();

    const releases = new Map((beacon.sent[0]?.events ?? []).map((e) => [e.kind, e.release]));
    expect(releases.get('metric')).toBe(RELEASE);
    expect(releases.get('error')).toBe(RELEASE);
  });
});
