import 'zone.js';
import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  NgZone,
  provideZoneChangeDetection,
  Type,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NoisyTicker } from './legacy/noisy-ticker';
import { PriceFeed } from './price-feed';
import { PUBLISH_MS } from './quiet-ticker';
import { TickerHost } from './ticker-host';

// The test body runs outside the angular zone, so these waits are plain root-zone timers.
const settle = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// A zone-based mount: the component is made inside the angular zone and attached to the application.
async function mount<T>(type: Type<T>) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [provideZoneChangeDetection()] });
  const zone = TestBed.inject(NgZone);
  const app = TestBed.inject(ApplicationRef);
  const injector = TestBed.inject(EnvironmentInjector);
  const ref: ComponentRef<T> = zone.run(() => {
    const created = createComponent(type, { environmentInjector: injector });
    document.body.appendChild(created.location.nativeElement);
    app.attachView(created.hostView);
    return created;
  });
  await settle(5);
  return { ref, zone, feed: TestBed.inject(PriceFeed), element: ref.location.nativeElement as HTMLElement };
}

describe('E21.3 A quiet price feed in a zone-based app', () => {
  afterEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  it('a feed that emits inside the zone causes a render per emission', async () => {
    const noisy = await mount(NoisyTicker);
    await settle(150);
    const noisyRenders = noisy.ref.instance.renders;
    const emissions = noisy.feed.last;

    const quiet = await mount(TickerHost);
    await settle(150);
    const quietRenders = quiet.ref.instance.ticker().renders;

    expect(noisyRenders).toBeGreaterThan(quietRenders);
    expect(noisyRenders).toBeGreaterThanOrEqual(emissions);
  });

  it('the quiet ticker causes at most one render per publish interval', async () => {
    const started = performance.now();
    const { ref } = await mount(TickerHost);
    await settle(150);
    const publishes = Math.floor((performance.now() - started) / PUBLISH_MS);
    const renders = ref.instance.ticker().renders;
    expect(renders).toBeGreaterThan(1);
    expect(renders).toBeLessThanOrEqual(1 + publishes);
  });

  it('the shown value is always the latest emission', async () => {
    const { ref, zone, feed, element } = await mount(TickerHost);
    await settle(PUBLISH_MS * 2);
    feed.stop();
    await settle(PUBLISH_MS * 2);
    const before = ref.instance.ticker().renders;
    zone.runOutsideAngular(() => [1000, 1001, 1002].forEach((price) => feed.emit(price)));
    await settle(PUBLISH_MS * 3);
    expect(element.querySelector('.price')?.textContent).toBe('1002');
    expect(ref.instance.ticker().renders - before).toBe(1);
  });

  it('the selected output renders its consumer (re-entered zone)', async () => {
    const { ref, zone, feed, element } = await mount(TickerHost);
    await settle(PUBLISH_MS * 2);
    feed.stop();
    await settle(PUBLISH_MS * 2);
    const ticker = ref.instance.ticker();
    const chosen = () => element.querySelector('.chosen')?.textContent;

    zone.runOutsideAngular(() => ticker.selected.emit(-1));
    await settle(PUBLISH_MS);
    expect(ref.instance.chosen).toBe(-1);
    expect(chosen()).toBe('0');

    zone.runOutsideAngular(() => ticker.pick());
    await settle(PUBLISH_MS);
    expect(chosen()).toBe(String(ticker.price()));
    expect(ticker.price()).toBeGreaterThan(0);
  });

  it('destroying the component stops the feed subscription and the interval', async () => {
    const intervals = vi.spyOn(globalThis, 'setInterval');
    const clears = vi.spyOn(globalThis, 'clearInterval');
    const { ref, feed } = await mount(TickerHost);
    const call = intervals.mock.calls.findIndex(([, delay]) => delay === PUBLISH_MS);
    const id = intervals.mock.results[call].value;
    await settle(PUBLISH_MS * 2);
    expect(feed.subscribers).toBe(1);

    ref.destroy();
    const shown = ref.instance.ticker().price();
    expect(feed.subscribers).toBe(0);
    expect(feed.running).toBe(false);
    expect(clears).toHaveBeenCalledWith(id);

    feed.emit(5000);
    await settle(PUBLISH_MS * 2);
    expect(ref.instance.ticker().price()).toBe(shown);
  });
});
