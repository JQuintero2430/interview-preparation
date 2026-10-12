import { EnvironmentInjector, createEnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, Subject, config } from 'rxjs';
import { CartEvents } from './cart-events';
import { CartState } from './cart-state';
import { LegacyCartStore, LegacyCheckoutWidget, LegacyEventBus } from './legacy/event-bus';

/** The owner of the services: a feature injector, as a lazy route's providers would create. */
function setUp() {
  const injector = createEnvironmentInjector([CartEvents, CartState], TestBed.inject(EnvironmentInjector));
  return { injector, events: injector.get(CartEvents), state: injector.get(CartState) };
}

function record<T>(source: Observable<T>, log: string[], tag: string): void {
  source.subscribe({ next: (v) => log.push(`${tag} ${JSON.stringify(v)}`), complete: () => log.push(`${tag} complete`) });
}

const pen = { type: 'added', item: 'pen', price: 3 } as const;
const ink = { type: 'added', item: 'ink', price: 5 } as const;
const wrap = { type: 'added', item: 'wrap', price: 0 } as const;
const noPen = { type: 'removed', item: 'pen', price: 3 } as const;

describe('E22.2 Replace a public Subject event bus with a typed store', () => {
  afterEach(() => {
    vi.useRealTimers();
    config.onUnhandledError = null;
  });

  it("the legacy bus' four symptoms are reproduced: a late subscriber misses the last event, one consumer's complete() silences everyone, an outside next corrupts the state, an error in a subscriber is reported later and the others still run", () => {
    vi.useFakeTimers();
    const reported: string[] = [];
    config.onUnhandledError = (err: unknown) => reported.push((err as Error).message);
    const bus = TestBed.inject(LegacyEventBus);
    const log: string[] = [];

    bus.events.subscribe(() => {
      throw new Error('handler threw');
    });
    bus.events.subscribe((e) => log.push(`early ${e}`));
    bus.events.next('added pen');
    bus.events.subscribe((e) => log.push(`late ${e}`));
    expect(log).toEqual(['early added pen']);
    expect(reported).toEqual([]);
    vi.runAllTimers();
    expect(reported).toEqual(['handler threw']);

    bus.events.subscribe({ complete: () => log.push('early complete') });
    TestBed.inject(LegacyCheckoutWidget).finish();
    bus.events.next('added ink');
    expect(log).toEqual(['early added pen', 'early checkout', 'late checkout', 'early complete']);

    const store = TestBed.inject(LegacyCartStore);
    store.add('pen', 3);
    store.cart.next({ items: [], total: -100 });
    store.add('ink', 5);
    expect(store.cart.value).toEqual({ items: ['ink'], total: -95 });
  });

  it('the new services expose no next, error or complete to consumers', () => {
    const { events, state } = setUp();
    // @ts-expect-error events$ is an Observable: it has no next
    expect(() => events.events$.next(pen)).toThrow(TypeError);
    // @ts-expect-error state$ is an Observable: it has no next
    expect(state.state$.next).toBeUndefined();

    for (const stream of [events.events$, state.state$, state.recent$]) {
      expect(stream).not.toBeInstanceOf(Subject);
      expect(['next', 'error', 'complete'].filter((name) => name in stream)).toEqual([]);
    }
  });

  it('a late subscriber to state$ receives the current cart first', () => {
    const { events, state } = setUp();
    events.publish(pen);
    events.publish(ink);
    const log: string[] = [];

    record(state.state$, log, 'late');
    events.publish(noPen);

    expect(log).toEqual(['late {"items":["pen","ink"],"total":8}', 'late {"items":["ink"],"total":5}']);
    expect(state.snapshot()).toEqual({ items: ['ink'], total: 5 });
  });

  it('recent$ replays the last three events to a late subscriber and no more', () => {
    const { events, state } = setUp();
    [pen, ink, wrap, noPen].forEach((event) => events.publish(event));
    const items: string[] = [];

    state.recent$.subscribe((event) => items.push(`${event.type} ${event.item}`));

    expect(items).toEqual(['added ink', 'added wrap', 'removed pen']);
  });

  it('a selector on state$ does not re-emit when an update leaves the total unchanged', () => {
    const { events, state } = setUp();
    const totals: number[] = [];
    const carts: number[] = [];
    state.select((cart) => cart.total).subscribe((total) => totals.push(total));
    state.state$.subscribe((cart) => carts.push(cart.items.length));

    [pen, wrap, ink].forEach((event) => events.publish(event));

    expect(totals).toEqual([0, 3, 8]);
    expect(carts).toEqual([0, 1, 2, 3]);
  });

  it('destroying the owner completes the streams (late subscribers receive complete)', () => {
    const { injector, events, state } = setUp();
    [pen, ink].forEach((event) => events.publish(event));
    const log: string[] = [];
    record(state.state$, log, 'early');

    injector.destroy();
    record(state.state$, log, 'state$');
    record(state.recent$, log, 'recent$');
    record(events.events$, log, 'events$');

    expect(log).toEqual([
      'early {"items":["pen","ink"],"total":8}',
      'early complete',
      'state$ complete',
      'recent$ {"type":"added","item":"pen","price":3}',
      'recent$ {"type":"added","item":"ink","price":5}',
      'recent$ complete',
      'events$ complete',
    ]);
  });
});
